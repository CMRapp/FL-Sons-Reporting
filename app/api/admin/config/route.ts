import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdminAuth } from '@/app/lib/adminAuth';
import { normalizeEmailListString, validateEmailList } from '@/app/utils/emailList';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Retrieve current configuration from database
export async function GET(request: NextRequest) {
  try {
    // Check if admin is authenticated
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reportEmails = await prisma.reportEmail.findMany({
      orderBy: { reportId: 'asc' },
    });

    const metadata = await prisma.configMetadata.findUnique({
      where: { key: 'last_updated' },
    });

    // Transform to match expected format
    const config = {
      reportEmails: reportEmails.reduce((acc, report) => {
        acc[report.reportId] = {
          reportName: report.reportName,
          fullName: report.fullName,
          email: report.email,
        };
        return acc;
      }, {} as Record<string, { reportName: string; fullName: string; email: string }>),
      lastUpdated: metadata?.value || '',
      updatedBy: metadata?.updatedBy || '',
    };
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading config from database:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}

// POST - Update configuration in database
export async function POST(request: NextRequest) {
  try {
    // Check if admin is authenticated
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportEmails, updatedBy } = body;

    if (!reportEmails) {
      return NextResponse.json(
        { error: 'Missing reportEmails in request body' },
        { status: 400 }
      );
    }

    for (const [, report] of Object.entries(reportEmails)) {
      const data = report as { email: string; reportName?: string };
      const err = validateEmailList(data.email || '');
      if (err) {
        return NextResponse.json(
          { error: `${data.reportName || 'Report'}: ${err}` },
          { status: 400 }
        );
      }
    }

    const timestamp = new Date().toISOString();
    const changes: string[] = [];

    // Update all report emails in database
    for (const [reportId, reportData] of Object.entries(reportEmails)) {
      const data = reportData as { reportName: string; fullName: string; email: string };
      
      const oldReport = await prisma.reportEmail.findUnique({
        where: { reportId },
      });

      const normalizedEmail = normalizeEmailListString(data.email || '');

      await prisma.reportEmail.upsert({
        where: { reportId },
        update: {
          email: normalizedEmail,
        },
        create: {
          reportId,
          reportName: data.reportName,
          fullName: data.fullName,
          email: normalizedEmail,
        },
      });

      if (oldReport && oldReport.email !== normalizedEmail) {
        changes.push(`${data.reportName}: ${oldReport.email || '(empty)'} → ${normalizedEmail || '(empty)'}`);
      }
    }

    // Update metadata
    await prisma.configMetadata.upsert({
      where: { key: 'last_updated' },
      update: {
        value: timestamp,
        updatedBy: updatedBy || 'Admin',
      },
      create: {
        key: 'last_updated',
        value: timestamp,
        updatedBy: updatedBy || 'Admin',
      },
    });

    // Create audit log
    if (changes.length > 0) {
      await prisma.auditLog.create({
        data: {
          action: 'update',
          entity: 'report_email',
          changes: JSON.stringify(changes),
          performedBy: updatedBy || 'Admin',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        },
      });
    }

    const updatedConfig = {
      reportEmails,
      lastUpdated: timestamp,
      updatedBy: updatedBy || 'Admin',
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Configuration updated successfully',
      config: updatedConfig,
      changes: changes.length,
    });
  } catch (error) {
    console.error('Error updating config in database:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
