import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/services/emailService';
import { getReportRecipients } from '@/app/utils/reportConfig';
import { shouldBccArchiveCopy } from '@/app/utils/emailList';
import prisma from '@/app/lib/prisma';
import {
  getReportCodeByUploadId,
  getReportLabelByUploadId,
  isValidReportUploadId,
} from '@/app/lib/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    if (!isValidReportUploadId(params.id)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 404 });
    }

    const formData = await request.formData();
    const userName = formData.get('userName') as string;
    const userEmail = formData.get('userEmail') as string;
    const userTitle = formData.get('userTitle') as string;
    const squadronNumber = formData.get('squadronNumber') as string;
    const districtNumber = formData.get('districtNumber') as string;
    const file = formData.get('file') as File;

    if (!userName || !userEmail || !userTitle || !squadronNumber || !districtNumber || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type - Only PDF and image formats allowed for security
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(`.${fileExtension}`)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and image files are allowed for security purposes.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Create new filename - Format: SQ[squadron]-[reportName]
    const reportName = getReportCodeByUploadId(params.id);
    const reportFullName = getReportLabelByUploadId(params.id);
    const newFileName = `SQ${squadronNumber}-${reportName}.${fileExtension}`;
    const fileBuffer = await file.arrayBuffer();

    const recipients = await getReportRecipients(params.id);
    if (!recipients?.length) {
      return NextResponse.json(
        { error: 'No recipient email configured for this report type' },
        { status: 500 }
      );
    }

    const archiveRaw = (process.env.REPORTS_ARCHIVE_EMAIL || 'reports@floridasons.org').trim();
    const bccArchive =
      archiveRaw && shouldBccArchiveCopy(recipients, archiveRaw) ? [archiveRaw] : [];

    const emailData = {
      to: recipients,
      ...(bccArchive.length ? { bcc: bccArchive } : {}),
      from: process.env.SMTP_FROM_EMAIL || 'noreply@floridasons.org',
      subject: `New ${reportName} Report Submission`,
      text: `
New Report Submission

Report Type: ${reportName}
Submitted By: ${userName} (${userTitle})
Squadron: ${squadronNumber}
District: ${districtNumber}
Email: ${userEmail}

File: ${newFileName}
      `,
      html: `
        <h2>New Report Submission</h2>
        <p><strong>Report Type:</strong> ${reportName}</p>
        <p><strong>Submitted By:</strong> ${userName} (${userTitle})</p>
        <p><strong>Squadron:</strong> ${squadronNumber}</p>
        <p><strong>District:</strong> ${districtNumber}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>File:</strong> ${newFileName}</p>
      `,
      attachments: [{
        filename: newFileName,
        content: fileBuffer,
        contentType: file.type
      }]
    };

    const emailResult = await sendEmail(emailData);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    const submitterIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;

    try {
      await prisma.reportSubmission.create({
        data: {
          reportId: params.id,
          reportName,
          fullName: reportFullName,
          userName,
          userEmail,
          userTitle,
          squadronNumber,
          districtNumber,
          fileName: newFileName,
          fileSize: file.size,
          submitterIp,
        },
      });
    } catch (logErr) {
      console.error('Failed to log report submission:', logErr);
    }

    // Send confirmation email to user
    const confirmationEmailData = {
      to: userEmail,
      from: process.env.SMTP_FROM_EMAIL || 'noreply@floridasons.org',
      subject: `Confirmation: ${reportName} Report Submitted`,
      text: `
Thank you for submitting your ${reportName} report.

Report Details:
Report Type: ${reportName}
Submitted By: ${userName} (${userTitle})
Squadron: ${squadronNumber}
District: ${districtNumber}
File: ${newFileName}

Your report has been successfully submitted and will be processed.
      `,
      html: `
        <h2>Thank you for submitting your ${reportName} report.</h2>
        <p><strong>Report Details:</strong></p>
        <p><strong>Report Type:</strong> ${reportName}</p>
        <p><strong>Submitted By:</strong> ${userName} (${userTitle})</p>
        <p><strong>Squadron:</strong> ${squadronNumber}</p>
        <p><strong>District:</strong> ${districtNumber}</p>
        <p><strong>File:</strong> ${newFileName}</p>
        <p>Your report has been successfully submitted and will be processed.</p>
      `
    };

    await sendEmail(confirmationEmailData);

    return NextResponse.json({ success: true, fileName: newFileName });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 