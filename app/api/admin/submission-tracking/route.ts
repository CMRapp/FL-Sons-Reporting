import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdminAuth } from '@/app/lib/adminAuth';
import {
  getSubmissionTrackingStartResolved,
  isTrackingStartLockedByEnv,
  normalizeTrackingDateInput,
  SUBMISSION_TRACKING_META_KEY,
} from '@/app/lib/submissionTracking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Update the stored tracking-start date (does not delete submissions).
 * Blocked when SUBMISSION_TRACKING_START is set — env wins until removed.
 */
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isTrackingStartLockedByEnv()) {
    return NextResponse.json(
      {
        error:
          'Tracking date is controlled by SUBMISSION_TRACKING_START in the environment. Remove or clear that variable to use the admin setting.',
      },
      { status: 409 }
    );
  }

  let body: { date?: string; performedBy?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = normalizeTrackingDateInput(body.date ?? '');
  if (!parsed) {
    return NextResponse.json(
      { error: 'Invalid date. Use YYYY-MM-DD.' },
      { status: 400 }
    );
  }

  const performedBy = (body.performedBy ?? 'Admin').trim() || 'Admin';
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;

  try {
    const prev = await prisma.configMetadata.findUnique({
      where: { key: SUBMISSION_TRACKING_META_KEY },
    });

    await prisma.configMetadata.upsert({
      where: { key: SUBMISSION_TRACKING_META_KEY },
      create: {
        key: SUBMISSION_TRACKING_META_KEY,
        value: parsed,
        updatedBy: performedBy,
      },
      update: {
        value: parsed,
        updatedBy: performedBy,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'update',
        entity: 'submission_tracking_start',
        changes: JSON.stringify({
          from: prev?.value ?? '(none)',
          to: parsed,
        }),
        performedBy,
        ipAddress: ip,
      },
    });

    const resolved = await getSubmissionTrackingStartResolved();

    return NextResponse.json({
      success: true,
      trackingStartedAt: resolved.iso,
      trackingSource: resolved.source,
    });
  } catch (error) {
    console.error('Update submission tracking error:', error);
    return NextResponse.json({ error: 'Failed to update tracking date' }, { status: 500 });
  }
}
