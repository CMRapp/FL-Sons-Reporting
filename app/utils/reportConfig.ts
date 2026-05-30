import prisma from '@/app/lib/prisma';
import { REPORT_METADATA, REPORT_ORDER, type ReportUploadId } from '@/app/lib/reports';
import { emailsFromRecipientField } from '@/app/utils/emailList';
import reportEmailsFile from '@/app/config/reportEmails.json';

function recipientsFromRaw(raw: string): string[] | null {
  const list = emailsFromRecipientField(raw);
  return list.length > 0 ? list : null;
}

function envRecipients(reportId: string): string[] | null {
  const envEmail = process.env[`EMAIL_${reportId}`];
  if (!envEmail) return null;
  return recipientsFromRaw(envEmail);
}

function bundledRecipients(reportId: string): string[] | null {
  const entry = reportEmailsFile.reportEmails[reportId as ReportUploadId];
  if (!entry?.email?.trim()) return null;
  return recipientsFromRaw(entry.email);
}

/**
 * Recipient list for a report type.
 * Order: admin database → EMAIL_* env vars → bundled reportEmails.json defaults.
 * Env/json apply when the database row is missing, empty, or does not parse to valid addresses.
 */
export async function getReportRecipients(reportId: string): Promise<string[] | null> {
  let dbRaw: string | null = null;

  try {
    const reportConfig = await prisma.reportEmail.findUnique({
      where: { reportId },
    });

    if (reportConfig?.email?.trim()) {
      dbRaw = reportConfig.email;
      const list = recipientsFromRaw(dbRaw);
      if (list) return list;
      console.warn(
        `Report ${reportId}: database recipient text did not parse; trying env/bundled fallback`
      );
    }
  } catch (error) {
    console.error('Error reading report recipients from database:', error);
  }

  const fromEnv = envRecipients(reportId);
  if (fromEnv) {
    if (dbRaw) {
      console.warn(`Report ${reportId}: using EMAIL_${reportId} env fallback`);
    }
    return fromEnv;
  }

  const fromFile = bundledRecipients(reportId);
  if (fromFile) {
    console.warn(`Report ${reportId}: using bundled reportEmails.json fallback`);
    return fromFile;
  }

  if (dbRaw) {
    console.error(
      `Report ${reportId}: database has recipient text but no valid addresses were parsed:`,
      dbRaw
    );
  }

  return null;
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
