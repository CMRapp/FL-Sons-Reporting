import fs from 'fs/promises';
import path from 'path';

interface ReportEmail {
  reportName: string;
  fullName: string;
  email: string;
}

interface ReportConfig {
  reportEmails: { [key: string]: ReportEmail };
  lastUpdated: string;
  updatedBy: string;
}

const CONFIG_PATH = path.join(process.cwd(), 'app', 'config', 'reportEmails.json');

/**
 * Get the email address for a specific report type
 * Falls back to environment variable if config file is not available or email is not set
 * 
 * @param reportId - The report ID (1-10)
 * @returns The email address for the report, or null if not found
 */
export async function getReportEmail(reportId: string): Promise<string | null> {
  try {
    // Try to read from config file
    const configData = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config: ReportConfig = JSON.parse(configData);
    
    const reportConfig = config.reportEmails[reportId];
    if (reportConfig && reportConfig.email) {
      return reportConfig.email;
    }
    
    // Fallback to environment variable
    const envEmail = process.env[`EMAIL_${reportId}`];
    if (envEmail) {
      return envEmail;
    }
    
    return null;
  } catch (error) {
    console.error('Error reading report email config:', error);
    
    // Fallback to environment variable on error
    const envEmail = process.env[`EMAIL_${reportId}`];
    return envEmail || null;
  }
}

/**
 * Get all report email configurations
 * 
 * @returns The complete configuration object
 */
export async function getReportConfig(): Promise<ReportConfig | null> {
  try {
    const configData = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading report config:', error);
    return null;
  }
}
