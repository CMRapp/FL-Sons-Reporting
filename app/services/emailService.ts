interface EmailData {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  attachments?: {
    filename: string;
    content: ArrayBuffer;
    contentType: string;
  }[];
}

interface ConfirmationEmailData {
  userName: string;
  userEmail: string;
  reportName: string;
  fileName: string;
  submissionDateTime: string;
}

async function sendEmailToSMTP(data: {
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
}) {
  try {
    console.log('Preparing SMTP2GO email request:', {
      to: data.to,
      from: data.from,
      subject: data.subject,
      hasAttachments: !!data.attachments
    });

    if (!process.env.SMTP2GO_API_KEY) {
      throw new Error('SMTP2GO_API_KEY is not configured');
    }

    const formData = new FormData();
    formData.append('api_key', process.env.SMTP2GO_API_KEY);
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.SMTP2GO_API_KEY,
        to: [data.to],
        sender: data.from,
        subject: data.subject,
        text_body: data.text,
        html_body: data.html,
        attachments: data.attachments?.map(attachment => ({
          filename: attachment.filename,
          fileblob: attachment.content,
          mimetype: attachment.type
        }))
      }),
    });

    console.log('SMTP2GO response status:', response.status);
    const responseData = await response.json();
    console.log('SMTP2GO response:', responseData);

    if (!response.ok) {
      const errorMessage = responseData.message || 'Failed to send email';
      const errorDetails = responseData.details || responseData;
      console.error('SMTP2GO API error:', {
        status: response.status,
        message: errorMessage,
        details: errorDetails
      });
      throw new Error(`${errorMessage}: ${JSON.stringify(errorDetails)}`);
    }

    return responseData;
  } catch (error) {
    console.error('Error in sendEmailToSMTP:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

export async function sendEmail(data: EmailData) {
  try {
    if (!process.env.SMTP2GO_API_KEY) {
      throw new Error('SMTP2GO_API_KEY is not configured');
    }

    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SMTP2GO_API_KEY}`,
      },
      body: JSON.stringify({
        api_key: process.env.SMTP2GO_API_KEY,
        to: [data.to],
        sender: data.from,
        subject: data.subject,
        text_body: data.text,
        html_body: data.html,
        attachments: data.attachments?.map(attachment => ({
          filename: attachment.filename,
          fileblob: Buffer.from(attachment.content).toString('base64'),
          mimetype: attachment.contentType
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.data?.error || 'Failed to send email');
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

export async function sendConfirmationEmail(data: ConfirmationEmailData) {
  try {
    if (!process.env.SMTP2GO_API_KEY) {
      console.error('SMTP2GO API key not configured');
      return { success: false, details: 'Email service not configured properly' };
    }

    console.log('Preparing confirmation email for:', data.userEmail);

    const emailData = {
      to: data.userEmail, // Send confirmation to the user's email
      from: process.env.SMTP_FROM_EMAIL || 'noreply@floridasons.org',
      subject: `Confirmation: ${data.reportName} Report Submission`,
      text: `
Thank you for submitting your ${data.reportName} report.

Submission Details:
- Report: ${data.reportName}
- File: ${data.fileName}
- Submitted By: ${data.userName}
- Submission Time: ${data.submissionDateTime}

<i>Confirmation sent from The Detachment of Florida Reporting Portal</i>
      `,
      html: `
        <h2>Thank you for submitting your ${data.reportName} report.</h2>
        <h3>Submission Details:</h3>
        <ul>
          <li><strong>Report:</strong> ${data.reportName}</li>
          <li><strong>File:</strong> ${data.fileName}</li>
          <li><strong>Submitted By:</strong> ${data.userName}</li>
          <li><strong>Submission Time:</strong> ${data.submissionDateTime}</li>
        </ul>
        <p><i>Confirmation sent from The Detachment of Florida Reporting Portal</i></p>
      `
    };

    console.log('Sending confirmation email to:', data.userEmail);
    await sendEmailToSMTP(emailData);
    console.log('Confirmation email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { 
      success: false, 
      details: error instanceof Error ? error.message : 'Unknown error occurred while sending confirmation email'
    };
  }
} 