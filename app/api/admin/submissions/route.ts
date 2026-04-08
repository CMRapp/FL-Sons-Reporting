import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdminAuth } from '@/app/lib/adminAuth';
import { getSubmissionTrackingStartResolved } from '@/app/lib/submissionTracking';
import { isValidReportUploadId, REPORT_ORDER } from '@/app/lib/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 2000;

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reportId = request.nextUrl.searchParams.get('reportId');
  const limitParam = request.nextUrl.searchParams.get('limit');
  if (reportId && !isValidReportUploadId(reportId)) {
    return NextResponse.json({ error: 'Invalid reportId' }, { status: 400 });
  }
  let limit = DEFAULT_LIMIT;
  if (limitParam) {
    const n = parseInt(limitParam, 10);
    if (!Number.isNaN(n) && n > 0) {
      limit = Math.min(n, MAX_LIMIT);
    }
  }

  try {
    const [submissions, tracking] = await Promise.all([
      prisma.reportSubmission.findMany({
        where: reportId
          ? { reportId }
          : { reportId: { in: [...REPORT_ORDER] } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      getSubmissionTrackingStartResolved(),
    ]);

    return NextResponse.json({
      submissions,
      trackingStartedAt: tracking.iso,
      trackingSource: tracking.source,
      trackingLockedByEnv: tracking.source === 'env',
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to load submissions' },
      { status: 500 }
    );
  }
}
