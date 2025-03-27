import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendConfirmationEmail } from '@/app/services/emailService';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];

// Valid report IDs
const VALID_REPORT_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate report ID
    if (!VALID_REPORT_IDS.includes(params.id)) {
      console.error('Invalid report ID:', params.id);
      return NextResponse.json(
        { message: 'Invalid report ID' },
        { status: 400 }
      );
    }

    console.log('Processing upload request:', {
      reportId: params.id,
      timestamp: new Date().toISOString(),
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type and size
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { message: 'Invalid file type' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      console.error('File too large:', file.size);
      return NextResponse.json(
        { message: 'File too large' },
        { status: 400 }
      );
    }

    // Get form data
    const userName = formData.get('userName') as string;
    const userEmail = formData.get('userEmail') as string;
    const userTitle = formData.get('userTitle') as string;
    const squadronNumber = formData.get('squadronNumber') as string;
    const districtNumber = formData.get('districtNumber') as string;

    // Validate required fields
    if (!userName || !userEmail || !userTitle || !squadronNumber || !districtNumber) {
      console.error('Missing required fields:', { userName, userEmail, userTitle, squadronNumber, districtNumber });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      console.error('Invalid file extension:', fileExtension);
      return NextResponse.json(
        { message: 'Invalid file extension' },
        { status: 400 }
      );
    }

    // Get report name based on ID
    const reportName = params.id === '1' ? 'NCSR' :
                      params.id === '2' ? 'DCSR' :
                      params.id === '3' ? 'VA&R' :
                      params.id === '4' ? 'VAVS-VOY' :
                      params.id === '5' ? 'AMERICANISM' :
                      params.id === '6' ? 'C&Y' :
                      params.id === '7' ? 'SIR' :
                      params.id === '8' ? 'SDR' :
                      params.id === '9' ? 'SOC' :
                      'DOR';

    // Create filename with MMDDYYYY format
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '');

    const fileName = `FLSQ-${squadronNumber}-${reportName}-${dateStr}.${fileExtension}`;

    console.log('Processing file:', {
      fileName,
      fileSize: file.size,
      fileType: file.type
    });

    // Convert file to buffer for email attachment
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Send confirmation emails
    const emailResult = await sendEmail({
      userName,
      userEmail,
      userTitle,
      squadronNumber,
      districtNumber,
      reportName,
      fileName,
      reportId: params.id,
      fileBuffer: buffer,
      fileType: file.type
    });

    if (!emailResult.success) {
      throw new Error(typeof emailResult.details === 'string' ? emailResult.details : 'Failed to send email');
    }

    await sendConfirmationEmail({
      userName,
      userEmail,
      reportName,
      fileName,
      submissionDateTime: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: fileName,
    });

  } catch (error) {
    console.error('Error processing upload:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        message: 'Error processing upload',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 