import prisma from '@/app/lib/prisma';
import { REPORT_ORDER } from '@/app/lib/reports';
import { parseEmailList } from '@/app/utils/emailList';

/**
 * Recipient list for a report type (comma/semicolon/newline in DB or env).
 * Falls back to environment variable if database is empty or unavailable.
 */
export async function getReportRecipients(reportId: string): Promise<string[] | null> {
  try {
    const reportConfig = await prisma.reportEmail.findUnique({
      where: { reportId },
    });

    if (reportConfig?.email?.trim()) {
      const list = parseEmailList(reportConfig.email);
      if (list.length > 0) return list;
    }

    const envEmail = process.env[`EMAIL_${reportId}`];
    if (envEmail) {
      const list = parseEmailList(envEmail);
      if (list.length > 0) return list;
    }

    return null;
  } catch (error) {
    console.error('Error reading report recipients from database:', error);

    const envEmail = process.env[`EMAIL_${reportId}`];
    if (envEmail) {
      const list = parseEmailList(envEmail);
      if (list.length > 0) return list;
    }
    return null;
  }
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
