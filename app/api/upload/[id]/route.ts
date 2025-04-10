import { NextResponse } from 'next/server';
import { sendEmail, sendConfirmationEmail } from '@/app/services/emailService';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = ['.xlsx', '.xls', '.docx', '.doc', '.pdf'];

export const runtime = 'edge';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Received upload request for report ID:', params.id);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userName = formData.get('userName') as string;
    const userEmail = formData.get('userEmail') as string;
    const userTitle = formData.get('userTitle') as string;
    const squadronNumber = formData.get('squadronNumber') as string;
    const districtNumber = formData.get('districtNumber') as string;

    console.log('Received data:', {
      reportId: params.id,
      fileName: file?.name,
      userEmail,
      hasFile: !!file,
      fileType: file?.type
    });

    // Validate required fields
    if (!userName || !userEmail || !userTitle || !squadronNumber || !districtNumber || !file) {
      console.error('Missing required fields:', {
        userName: !!userName,
        userEmail: !!userEmail,
        userTitle: !!userTitle,
        squadronNumber: !!squadronNumber,
        districtNumber: !!districtNumber,
        file: !!file
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_TYPES.includes(`.${fileExtension}`)) {
      console.error('Invalid file type:', fileExtension);
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed types: .xlsx, .xls, .docx, .doc, .pdf' },
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

    // Get the report name based on the ID
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

    // Read the file as base64
    const arrayBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(arrayBuffer).toString('base64');

    // Prepare email data
    const emailData = {
      userName,
      userEmail,
      userTitle,
      squadronNumber,
      districtNumber,
      reportName,
      fileName: file.name,
      reportId: params.id,
      fileBuffer: base64File,
      fileType: file.type
    };

    console.log('Sending email...');
    const emailResult = await sendEmail(emailData);
    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.details);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Send confirmation email
    console.log('Sending confirmation email...');
    const confirmationResult = await sendConfirmationEmail({
      userName,
      userEmail,
      reportName,
      fileName: file.name,
      submissionDateTime: new Date().toLocaleString()
    });

    if (!confirmationResult.success) {
      console.error('Failed to send confirmation email:', confirmationResult.details);
      // Don't fail the request if confirmation email fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 