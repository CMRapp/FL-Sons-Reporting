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
    const reportId = params.id;
    console.log('Received upload request for report:', reportId);

    // Validate report ID
    if (!reportId || !VALID_REPORT_IDS.includes(reportId)) {
      console.error('Invalid report ID:', reportId);
      return NextResponse.json(
        { success: false, error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userName = formData.get('userName') as string;
    const userEmail = formData.get('userEmail') as string;
    const userTitle = formData.get('userTitle') as string;
    const squadronNumber = formData.get('squadronNumber') as string;
    const districtNumber = formData.get('districtNumber') as string;

    console.log('Processing upload with data:', {
      reportId,
      fileName: file?.name,
      userName,
      userEmail,
      userTitle,
      squadronNumber,
      districtNumber
    });

    // Validate required fields
    if (!file || !userName || !userEmail || !userTitle || !squadronNumber || !districtNumber) {
      console.error('Missing required fields:', {
        file: !!file,
        userName: !!userName,
        userEmail: !!userEmail,
        userTitle: !!userTitle,
        squadronNumber: !!squadronNumber,
        districtNumber: !!districtNumber
      });
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a PDF, JPEG, or PNG file.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > MAX_FILE_SIZE) {
      console.error('File too large:', file.size);
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      console.error('Invalid file extension:', fileExtension);
      return NextResponse.json(
        { success: false, message: 'Invalid file extension' },
        { status: 400 }
      );
    }

    // Get report name based on ID
    const reportName = reportId === '1' ? 'NCSR' :
                      reportId === '2' ? 'DCSR' :
                      reportId === '3' ? 'VA&R' :
                      reportId === '4' ? 'VAVS-VOY' :
                      reportId === '5' ? 'AMERICANISM' :
                      reportId === '6' ? 'C&Y' :
                      reportId === '7' ? 'SIR' :
                      reportId === '8' ? 'SDR' :
                      reportId === '9' ? 'SOC' :
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

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File converted to buffer, size:', buffer.length);

    // Prepare email data
    const emailData = {
      userName,
      userEmail,
      userTitle,
      squadronNumber,
      districtNumber,
      reportName,
      fileName,
      reportId,
      fileBuffer: buffer,
      fileType: file.type
    };

    console.log('Sending email with data:', {
      ...emailData,
      fileBuffer: 'Buffer present'
    });

    // Send email
    const emailResult = await sendEmail(emailData);
    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.details);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Send confirmation email
    const confirmationData = {
      userName,
      userEmail,
      reportName,
      fileName,
      submissionDateTime: new Date().toLocaleString()
    };

    console.log('Sending confirmation email with data:', confirmationData);
    await sendConfirmationEmail(confirmationData);

    return NextResponse.json(
      { success: true, message: 'File uploaded and emails sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing upload:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { success: false, error: 'An error occurred while processing the upload' },
      { status: 500 }
    );
  }
} 