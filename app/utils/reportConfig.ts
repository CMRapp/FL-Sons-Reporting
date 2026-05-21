import prisma from '@/app/lib/prisma';
import { REPORT_METADATA, REPORT_ORDER } from '@/app/lib/reports';
import { emailsFromRecipientField } from '@/app/utils/emailList';

function recipientsFromRaw(raw: string): string[] | null {
  const list = emailsFromRecipientField(raw);
  return list.length > 0 ? list : null;
}

function envRecipients(reportId: string): string[] | null {
  const envEmail = process.env[`EMAIL_${reportId}`];
  if (!envEmail) return null;
  return recipientsFromRaw(envEmail);
}

/**
 * Recipient list for a report type.
 * Uses admin database settings; environment variables (EMAIL_1–EMAIL_8) apply only
 * when the database has no address for that report or the database is unavailable.
 */
export async function getReportRecipients(reportId: string): Promise<string[] | null> {
  try {
    const reportConfig = await prisma.reportEmail.findUnique({
      where: { reportId },
    });

    if (reportConfig?.email?.trim()) {
      const list = recipientsFromRaw(reportConfig.email);
      if (list) return list;
      console.error(
        `Report ${reportId}: database has recipient text but no valid addresses were parsed`
      );
      return null;
    }

    return envRecipients(reportId);
  } catch (error) {
    console.error('Error reading report recipients from database:', error);
    return envRecipients(reportId);
  }
}

/**
 * All eight report types for the admin panel (database values only).
 * Missing rows show empty email fields so admins can fill them in.
 */
export async function getFullReportEmailConfig(): Promise<
  Record<string, { reportName: string; fullName: string; email: string }>
> {
  let dbRows: Awaited<ReturnType<typeof prisma.reportEmail.findMany>> = [];
  try {
    dbRows = await prisma.reportEmail.findMany({
      where: { reportId: { in: [...REPORT_ORDER] } },
      orderBy: { reportId: 'asc' },
    });
  } catch (error) {
    console.error('Error reading report emails from database:', error);
  }

  const byId = new Map(dbRows.map((r) => [r.reportId, r]));
  const out: Record<string, { reportName: string; fullName: string; email: string }> = {};

  for (const reportId of REPORT_ORDER) {
    const meta = REPORT_METADATA[reportId];
    const row = byId.get(reportId);
    out[reportId] = {
      reportName: row?.reportName ?? meta.code,
      fullName: row?.fullName ?? meta.label,
      email: row?.email ?? '',
    };
  }

  return out;
}

/**
 * Get all report email configurations from database
 *
 * @returns Array of report configurations
 */
export async function getAllReportEmails() {
  try {
    const reports = await prisma.reportEmail.findMany({
      where: { reportId: { in: [...REPORT_ORDER] } },
      orderBy: { reportId: 'asc' },
    });
    return reports;
  } catch (error) {
    console.error('Error reading report emails from database:', error);
    return [];
  }
}
