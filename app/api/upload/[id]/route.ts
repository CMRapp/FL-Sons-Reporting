import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendConfirmationEmail } from '@/app/services/emailService';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];

// Valid report IDs
const VALID_REPORT_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const runtime = 'edge';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Received upload request for report ID:', params.id);
    
    const data = await request.json();
    console.log('Received data:', {
      reportName: data.reportName,
      fileName: data.fileName,
      userEmail: data.userEmail,
      hasFileBuffer: !!data.fileBuffer,
      fileType: data.fileType
    });

    // Validate required fields
    if (!data.userName || !data.userEmail || !data.userTitle || 
        !data.squadronNumber || !data.districtNumber || !data.fileBuffer) {
      console.error('Missing required fields:', {
        userName: !!data.userName,
        userEmail: !!data.userEmail,
        userTitle: !!data.userTitle,
        squadronNumber: !!data.squadronNumber,
        districtNumber: !!data.districtNumber,
        fileBuffer: !!data.fileBuffer
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['.xlsx', '.xls', '.docx', '.doc', '.pdf'];
    const fileExtension = data.fileName.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(`.${fileExtension}`)) {
      console.error('Invalid file type:', fileExtension);
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: .xlsx, .xls, .docx, .doc, .pdf' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const fileSize = (data.fileBuffer.length * 3) / 4; // Approximate size in bytes
    if (fileSize > 10 * 1024 * 1024) {
      console.error('File too large:', fileSize);
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    console.log('Sending email...');
    const emailResult = await sendEmail({
      userName: data.userName,
      userEmail: data.userEmail,
      userTitle: data.userTitle,
      squadronNumber: data.squadronNumber,
      districtNumber: data.districtNumber,
      reportName: data.reportName,
      fileName: data.fileName,
      reportId: params.id,
      fileBuffer: data.fileBuffer,
      fileType: data.fileType
    });

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.details);
      return NextResponse.json(
        { error: emailResult.details || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('Sending confirmation email...');
    const confirmationResult = await sendConfirmationEmail({
      userName: data.userName,
      userEmail: data.userEmail,
      reportName: data.reportName,
      fileName: data.fileName,
      submissionDateTime: new Date().toLocaleString()
    });

    if (!confirmationResult.success) {
      console.error('Failed to send confirmation email:', confirmationResult.details);
      // Don't fail the whole request if confirmation email fails
      console.log('Continuing despite confirmation email failure');
    }

    console.log('Upload and email process completed successfully');
    return NextResponse.json({ message: 'File uploaded and email sent successfully' });
  } catch (error) {
    console.error('Error in upload handler:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 