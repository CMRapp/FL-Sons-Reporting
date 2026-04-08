import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdminAuth } from '@/app/lib/adminAuth';
import {
  getSubmissionTrackingStartResolved,
  SUBMISSION_TRACKING_META_KEY,
  utcTodayIsoDate,
} from '@/app/lib/submissionTracking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Permanently deletes all submission log rows and sets the stored tracking-start date to today (UTC).
 * Effective displayed date still follows SUBMISSION_TRACKING_START env when set.
 */
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { performedBy?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* optional body */
  }
  const performedBy = (body.performedBy ?? 'Admin').trim() || 'Admin';
  const today = utcTodayIsoDate();
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const del = await tx.reportSubmission.deleteMany({});
      await tx.configMetadata.upsert({
        where: { key: SUBMISSION_TRACKING_META_KEY },
        create: {
          key: SUBMISSION_TRACKING_META_KEY,
          value: today,
          updatedBy: performedBy,
        },
        update: {
          value: today,
          updatedBy: performedBy,
        },
      });
      await tx.auditLog.create({
        data: {
          action: 'delete',
          entity: 'report_submissions',
          changes: JSON.stringify({
            deletedCount: del.count,
            submission_tracking_start_set_to: today,
          }),
          performedBy,
          ipAddress: ip,
        },
      });
      return del.count;
    });

    const resolved = await getSubmissionTrackingStartResolved();

    return NextResponse.json({
      success: true,
      deletedCount: deleted,
      trackingStartedAt: resolved.iso,
      trackingSource: resolved.source,
      dbTrackingStartSetTo: today,
    });
  } catch (error) {
    console.error('Clear submissions error:', error);
    return NextResponse.json({ error: 'Failed to clear submissions' }, { status: 500 });
  }
}
