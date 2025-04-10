import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendConfirmationEmail } from '@/app/services/emailService';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Processing background email job:', {
      reportName: data.reportName,
      fileName: data.fileName,
      userEmail: data.userEmail
    });

    // Send main email
    const emailResult = await sendEmail({
      userName: data.userName,
      userEmail: data.userEmail,
      userTitle: data.userTitle,
      squadronNumber: data.squadronNumber,
      districtNumber: data.districtNumber,
      reportName: data.reportName,
      fileName: data.fileName,
      reportId: data.reportId,
      fileBuffer: Buffer.from(data.fileBuffer),
      fileType: data.fileType
    });

    if (!emailResult.success) {
      console.error('Failed to send email in background job:', emailResult.details);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Send confirmation email
    await sendConfirmationEmail({
      userName: data.userName,
      userEmail: data.userEmail,
      reportName: data.reportName,
      fileName: data.fileName,
      submissionDateTime: new Date().toLocaleString()
    });

    return NextResponse.json(
      { success: true, message: 'Emails sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in background email job:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { success: false, error: 'An error occurred while sending emails' },
      { status: 500 }
    );
  }
} 