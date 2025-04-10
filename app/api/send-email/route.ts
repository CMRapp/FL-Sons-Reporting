import { NextResponse } from 'next/server';

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
    // Check if SMTP2GO API key is configured
    if (!process.env.SMTP2GO_API_KEY) {
      console.error('SMTP2GO_API_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'Email service not configured properly' },
        { status: 500 }
      );
    }

    const data = await request.json() as EmailData;
    
    console.log('Preparing SMTP2GO email request:', {
      to: data.to,
      from: data.from,
      subject: data.subject,
      hasAttachments: !!data.attachments
    });

    // Validate required fields
    if (!data.to || !data.from || !data.subject || !data.text || !data.html) {
      console.error('Missing required email fields');
      return NextResponse.json(
        { success: false, error: 'Missing required email fields' },
        { status: 400 }
      );
    }

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

    console.log('Sending request to SMTP2GO...');
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
      console.error('SMTP2GO API error:', responseData);
      return NextResponse.json(
        { 
          success: false, 
          error: responseData.message || 'Failed to send email',
          details: responseData
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-email route:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 