import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/services/emailService';

// Helper function to get report name from ID
function getReportName(id: string): string {
  const reportNames: { [key: string]: string } = {
    '1': 'NCSR',
    '2': 'DCSR',
    '3': 'VA&R',
    '4': 'VAVS-VOY',
    '5': 'AMERICANISM',
    '6': 'C&Y',
    '7': 'SIR',
    '8': 'SDR',
    '9': 'SOC',
    '10': 'DOR'
  };
  return reportNames[id] || 'Unknown Report';
}

// Helper function to format date as MMDDYYYY
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}${day}${year}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const userName = formData.get('userName') as string;
    const userEmail = formData.get('userEmail') as string;
    const userTitle = formData.get('userTitle') as string;
    const squadronNumber = formData.get('squadronNumber') as string;
    const districtNumber = formData.get('districtNumber') as string;
    const file = formData.get('file') as File;

    if (!userName || !userEmail || !userTitle || !squadronNumber || !districtNumber || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['.xlsx', '.xls', '.docx', '.doc', '.pdf'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(`.${fileExtension}`)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: .xlsx, .xls, .docx, .doc, .pdf' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Create new filename
    const reportName = getReportName(params.id);
    const currentDate = formatDate(new Date());
    const newFileName = `SQ${squadronNumber}-${reportName}-Report-${currentDate}.${fileExtension}`;
    const fileBuffer = await file.arrayBuffer();

    // Prepare email data
    const recipientEmail = process.env[`EMAIL_${params.id}`];
    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'No recipient email configured for this report type' },
        { status: 500 }
      );
    }

    const emailData = {
      to: recipientEmail,
      from: process.env.SMTP_FROM_EMAIL || 'noreply@floridasons.org',
      subject: `New ${reportName} Report Submission`,
      text: `
New Report Submission

Report Type: ${reportName}
Submitted By: ${userName} (${userTitle})
Squadron: ${squadronNumber}
District: ${districtNumber}
Email: ${userEmail}

File: ${newFileName}
      `,
      html: `
        <h2>New Report Submission</h2>
        <p><strong>Report Type:</strong> ${reportName}</p>
        <p><strong>Submitted By:</strong> ${userName} (${userTitle})</p>
        <p><strong>Squadron:</strong> ${squadronNumber}</p>
        <p><strong>District:</strong> ${districtNumber}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>File:</strong> ${newFileName}</p>
      `,
      attachments: [{
        filename: newFileName,
        content: fileBuffer,
        contentType: file.type
      }]
    };

    const emailResult = await sendEmail(emailData);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    const confirmationEmailData = {
      to: userEmail,
      from: process.env.SMTP_FROM_EMAIL || 'noreply@floridasons.org',
      subject: `Confirmation: ${reportName} Report Submitted`,
      text: `
Thank you for submitting your ${reportName} report.

Report Details:
Report Type: ${reportName}
Submitted By: ${userName} (${userTitle})
Squadron: ${squadronNumber}
District: ${districtNumber}
File: ${newFileName}

Your report has been successfully submitted and will be processed.
      `,
      html: `
        <h2>Thank you for submitting your ${reportName} report.</h2>
        <p><strong>Report Details:</strong></p>
        <p><strong>Report Type:</strong> ${reportName}</p>
        <p><strong>Submitted By:</strong> ${userName} (${userTitle})</p>
        <p><strong>Squadron:</strong> ${squadronNumber}</p>
        <p><strong>District:</strong> ${districtNumber}</p>
        <p><strong>File:</strong> ${newFileName}</p>
        <p>Your report has been successfully submitted and will be processed.</p>
      `
    };

    await sendEmail(confirmationEmailData);

    return NextResponse.json({ success: true, fileName: newFileName });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 