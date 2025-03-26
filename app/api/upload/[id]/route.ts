import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
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
  context: { params: { id: string } }
) {
  try {
    // Validate report ID
    if (!VALID_REPORT_IDS.includes(context.params.id)) {
      console.error('Invalid report ID:', context.params.id);
      return NextResponse.json(
        { message: 'Invalid report ID' },
        { status: 400 }
      );
    }

    console.log('Processing upload request:', {
      reportId: context.params.id,
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

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension || '')) {
      console.error('Invalid file extension:', fileExtension);
      return NextResponse.json(
        { message: 'Invalid file extension' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_FILE_SIZE) {
      console.error('File size exceeds limit:', buffer.length);
      return NextResponse.json(
        { message: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Create a unique filename with sanitization
    const timestamp = new Date().getTime();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedFileName}`;
    
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'uploads');
    try {
      await access(uploadDir);
    } catch {
      await mkdir(uploadDir, { recursive: true });
      console.log('Created uploads directory:', uploadDir);
    }

    // Save the file
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    console.log('File saved successfully:', {
      fileName,
      filePath,
      size: buffer.length,
    });

    // Get and sanitize form data
    const userName = (formData.get('userName') as string)?.replace(/[<>]/g, '');
    const userEmail = (formData.get('userEmail') as string)?.toLowerCase().trim();
    const userTitle = (formData.get('userTitle') as string)?.replace(/[<>]/g, '');
    const squadronNumber = (formData.get('squadronNumber') as string)?.replace(/[^0-9]/g, '');
    const districtNumber = (formData.get('districtNumber') as string)?.replace(/[^0-9]/g, '');

    // Validate required fields
    if (!userName || !userEmail || !userTitle || !squadronNumber || !districtNumber) {
      console.error('Missing required form data');
      return NextResponse.json(
        { message: 'Missing required form data' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.error('Invalid email format:', userEmail);
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate squadron number format
    if (!/^\d+$/.test(squadronNumber)) {
      console.error('Invalid squadron number format:', squadronNumber);
      return NextResponse.json(
        { message: 'Invalid squadron number format' },
        { status: 400 }
      );
    }

    // Get report name based on ID
    const reportName = context.params.id === '1' ? 'National Consolidated Squadron Report (NCSR)' :
                      context.params.id === '2' ? 'Detachment Consolidated Squadron Report (DCSR)' :
                      context.params.id === '3' ? 'Veterans Affairs & Rehabilitation (VA&R)' :
                      context.params.id === '4' ? 'VAVS Volunteer of the Year' :
                      context.params.id === '5' ? 'Americanism' :
                      context.params.id === '6' ? 'Children & Youth (C&Y)' :
                      context.params.id === '7' ? 'Squadron Information Report (SIR)' :
                      context.params.id === '8' ? 'Annual Squadron Data Report (SDR)' :
                      context.params.id === '9' ? 'Squadron Officer Change (SOC)' :
                      'District Officers Report (DOR)';

    // Send email notification
    console.log('Sending email notification for:', {
      reportName,
      userName,
      userEmail,
    });

    const emailResult = await sendEmail({
      userName,
      userEmail,
      userTitle,
      squadronNumber,
      districtNumber,
      reportName,
      fileName,
      reportId: context.params.id,
    });

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult);
      // Continue with the response even if email fails
    } else {
      console.log('Email sent successfully:', emailResult.details);
    }

    // Send confirmation email to user
    const submissionDateTime = new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    await sendConfirmationEmail({
      userName,
      userEmail,
      reportName,
      fileName: file.name,
      submissionDateTime
    });

    return NextResponse.json(
      { 
        message: 'File uploaded successfully',
        emailStatus: emailResult.success ? 'sent' : 'failed',
        emailDetails: emailResult.details,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing upload:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      reportId: context.params.id,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { 
        message: 'Error uploading file',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 