import prisma from '@/app/lib/prisma';

/**
 * Get the email address for a specific report type from database
 * Falls back to environment variable if database is not available or email is not set
 * 
 * @param reportId - The report ID (1-10)
 * @returns The email address for the report, or null if not found
 */
export async function getReportEmail(reportId: string): Promise<string | null> {
  try {
    // Try to read from database
    const reportConfig = await prisma.reportEmail.findUnique({
      where: { reportId },
    });
    
    if (reportConfig && reportConfig.email) {
      return reportConfig.email;
    }
    
    // Fallback to environment variable
    const envEmail = process.env[`EMAIL_${reportId}`];
    if (envEmail) {
      // Clean email (remove comments)
      return envEmail.split('#')[0].trim();
    }
    
    return null;
  } catch (error) {
    console.error('Error reading report email from database:', error);
    
    // Fallback to environment variable on error
    const envEmail = process.env[`EMAIL_${reportId}`];
    if (envEmail) {
      return envEmail.split('#')[0].trim();
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
      orderBy: { reportId: 'asc' },
    });
    return reports;
  } catch (error) {
    console.error('Error reading report emails from database:', error);
    return [];
  }
}
