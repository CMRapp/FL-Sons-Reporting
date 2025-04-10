import { NextResponse } from 'next/server';
import { sendEmail } from '@/app/services/emailService';

export async function POST() {
  try {
    const testData = {
      userName: 'Test User',
      userEmail: 'test@example.com',
      userTitle: 'Test Title',
      squadronNumber: '123',
      districtNumber: '4',
      reportName: 'Test Report',
      fileName: 'test.txt',
      reportId: '1',
      fileBuffer: 'SGVsbG8gV29ybGQ=', // Base64 encoded "Hello World"
      fileType: 'text/plain'
    };

    const result = await sendEmail(testData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.details || 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error in test email endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 