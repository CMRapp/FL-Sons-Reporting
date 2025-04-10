import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendConfirmationEmail } from '@/app/services/emailService';

export const runtime = 'edge';

interface EmailData {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as EmailData;
    
    console.log('Preparing SMTP2GO email request:', {
      to: data.to,
      from: data.from,
      subject: data.subject,
      hasAttachments: !!data.attachments
    });

    const formData = new FormData();
    formData.append('to', data.to);
    formData.append('from', data.from);
    formData.append('subject', data.subject);
    formData.append('text', data.text);
    formData.append('html', data.html);
    
    if (data.attachments) {
      data.attachments.forEach((attachment, index) => {
        formData.append(`attachment${index}`, attachment.content);
        formData.append(`attachment${index}_filename`, attachment.filename);
        formData.append(`attachment${index}_type`, attachment.type);
      });
    }

    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SMTP2GO_API_KEY}`,
      },
      body: formData,
    });

    console.log('SMTP2GO response status:', response.status);
    const responseData = await response.json();
    console.log('SMTP2GO response:', responseData);

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to send email');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 