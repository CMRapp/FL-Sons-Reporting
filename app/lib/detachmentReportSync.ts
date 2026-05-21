import type {
  report_status_report_type,
  squadron_reports_report_type,
} from '@/generated/detachment-client';
import { getDetachmentPrisma, isDetachmentLookupConfigured } from '@/app/lib/detachmentPrisma';
import type { ReportUploadId } from '@/app/lib/reports';
import { getCurrentReportYear } from '@/app/utils/serviceYear';

/** Maps reporting portal upload id → detachment admin reporting enum. */
export const UPLOAD_ID_TO_DETACHMENT_REPORT_TYPE: Partial<
  Record<ReportUploadId, report_status_report_type>
> = {
  '1': 'national_csr',
  '2': 'detachment_csr',
  '3': 'var',
  '4': 'vavy',
  '5': 'americanism',
  '6': 'children_youth',
  '7': 'sir',
  // '8' SDR — not tracked on detachment /dashboard/admin/reporting
};

export type DetachmentReportSyncPayload = {
  reportUploadId: ReportUploadId;
  reportCode: string;
  reportLabel: string;
  sqNumber: number;
  submitterName: string;
  submitterEmail: string;
  submitterTitle: string;
  districtNumber: string;
  fileName: string;
};

export type DetachmentReportSyncResult =
  | { synced: true; reportType: report_status_report_type; reportYear: number }
  | { synced: false; reason: 'not_configured' | 'unmapped_type' | 'no_user' | 'error'; detail?: string };

async function resolveReportingUserId(): Promise<number | null> {
  const prisma = getDetachmentPrisma();
  if (!prisma) return null;

  const fromEnv = process.env.DETACHMENT_REPORTING_USER_ID?.trim();
  if (fromEnv) {
    const id = parseInt(fromEnv, 10);
    if (Number.isFinite(id) && id > 0) return id;
  }

  const email =
    process.env.DETACHMENT_REPORTING_USER_EMAIL?.trim() || 'reports@floridasons.org';

  try {
    const byEmail = await prisma.users.findUnique({
      where: { user_email: email },
      select: { user_id: true },
    });
    if (byEmail) return byEmail.user_id;

    const admin = await prisma.users.findFirst({
      where: { is_admin: true },
      select: { user_id: true },
      orderBy: { user_id: 'asc' },
    });
    return admin?.user_id ?? null;
  } catch (error) {
    console.error('Failed to resolve detachment reporting user id:', error);
    return null;
  }
}

/**
 * Mark squadron report complete on detachment portal (report_status + squadron_reports),
 * same outcome as admin reporting dashboard "Complete" / portal Save & Complete.
 */
export async function syncDetachmentReportSubmission(
  payload: DetachmentReportSyncPayload
): Promise<DetachmentReportSyncResult> {
  if (!isDetachmentLookupConfigured()) {
    return { synced: false, reason: 'not_configured' };
  }

  const reportType = UPLOAD_ID_TO_DETACHMENT_REPORT_TYPE[payload.reportUploadId];
  if (!reportType) {
    return { synced: false, reason: 'unmapped_type' };
  }

  const prisma = getDetachmentPrisma();
  if (!prisma) {
    return { synced: false, reason: 'not_configured' };
  }

  const userId = await resolveReportingUserId();
  if (!userId) {
    return {
      synced: false,
      reason: 'no_user',
      detail: 'Set DETACHMENT_REPORTING_USER_ID or DETACHMENT_REPORTING_USER_EMAIL',
    };
  }

  const reportYear = getCurrentReportYear();
  const now = new Date();
  const reportData = {
    source: 'fl_sal_reporting_portal',
    submittedAt: now.toISOString(),
    submitterName: payload.submitterName,
    submitterEmail: payload.submitterEmail,
    submitterTitle: payload.submitterTitle,
    districtNumber: payload.districtNumber,
    fileName: payload.fileName,
    reportPortalId: payload.reportUploadId,
    reportCode: payload.reportCode,
    reportLabel: payload.reportLabel,
  };

  const squadronReportType = reportType as squadron_reports_report_type;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.report_status.upsert({
        where: {
          sq_number_report_type_report_year: {
            sq_number: payload.sqNumber,
            report_type: reportType,
            report_year: reportYear,
          },
        },
        create: {
          sq_number: payload.sqNumber,
          report_type: reportType,
          report_year: reportYear,
          is_complete: true,
          last_updated_by: userId,
          last_updated_at: now,
        },
        update: {
          is_complete: true,
          last_updated_by: userId,
          last_updated_at: now,
        },
      });

      await tx.squadron_reports.upsert({
        where: {
          sq_number_report_type_report_year: {
            sq_number: payload.sqNumber,
            report_type: squadronReportType,
            report_year: reportYear,
          },
        },
        create: {
          sq_number: payload.sqNumber,
          report_type: squadronReportType,
          report_year: reportYear,
          report_data: reportData,
          created_by: userId,
          updated_by: userId,
          is_current_year: true,
        },
        update: {
          report_data: reportData,
          updated_by: userId,
          updated_at: now,
        },
      });
    });

    return { synced: true, reportType, reportYear };
  } catch (error) {
    console.error('Detachment report status sync failed:', error);
    return {
      synced: false,
      reason: 'error',
      detail: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
