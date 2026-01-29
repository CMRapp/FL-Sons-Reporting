import { NextResponse } from 'next/server';
import { sendEmail } from '@/app/services/emailService';

export const runtime = 'edge';

export async function POST() {
  try {
    const testData = {
      to: process.env.ADMIN_EMAIL || 'test@example.com',
      from: process.env.SMTP_FROM_EMAIL || 'noreply@floridasons.org',
      subject: 'Test Email from Florida Sons Reporting Portal',
      text: `
This is a test email from the Florida Sons Reporting Portal.

Test Details:
- User: Test User
- Email: test@example.com
- Title: Test Title
- Squadron: 123
- District: 1st District
- Report Type: Test Report
- File: test-file.pdf

This email confirms that the email service is working correctly.
      `,
      html: `
        <h2>Test Email from Florida Sons Reporting Portal</h2>
        <p>This is a test email from the Florida Sons Reporting Portal.</p>
        <p><strong>Test Details:</strong></p>
        <ul>
          <li><strong>User:</strong> Test User</li>
          <li><strong>Email:</strong> test@example.com</li>
          <li><strong>Title:</strong> Test Title</li>
          <li><strong>Squadron:</strong> 123</li>
          <li><strong>District:</strong> 1st District</li>
          <li><strong>Report Type:</strong> Test Report</li>
          <li><strong>File:</strong> test-file.pdf</li>
        </ul>
        <p>This email confirms that the email service is working correctly.</p>
      `
    };

    const result = await sendEmail(testData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send test email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 