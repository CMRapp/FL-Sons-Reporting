import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailData {
  userName: string;
  userEmail: string;
  userTitle: string;
  squadronNumber: string;
  districtNumber: string;
  reportName: string;
  fileName: string;
  reportId: string;
  fileBuffer: string;
  fileType: string;
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
    console.log('Sending email via API:', {
      to: data.to,
      from: data.from,
      subject: data.subject,
      hasAttachments: !!data.attachments
    });

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Email API response status:', response.status);
    const responseData = await response.json();
    console.log('Email API response:', responseData);

    if (!response.ok) {
      const errorMessage = responseData.error || 'Failed to send email';
      const errorDetails = responseData.details || responseData;
      console.error('Email API error:', errorMessage, errorDetails);
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
      console.error('SMTP2GO API key not configured');
      return { success: false, details: 'Email service not configured properly' };
    }

    // Get the appropriate recipient email based on report type
    let recipientEmail = process.env.EMAIL_1; // Default to NCSR
    if (data.reportId === '2') {
      recipientEmail = process.env.EMAIL_2; // DCSR
    } else if (data.reportId === '3') {
      recipientEmail = process.env.EMAIL_3; // VA&R
    } else if (data.reportId === '4') {
      recipientEmail = process.env.EMAIL_4; // VAVS-VOY
    } else if (data.reportId === '5') {
      recipientEmail = process.env.EMAIL_5; // AMERICANISM
    } else if (data.reportId === '6') {
      recipientEmail = process.env.EMAIL_6; // C&Y
    } else if (data.reportId === '7') {
      recipientEmail = process.env.EMAIL_7; // SIR
    } else if (data.reportId === '8') {
      recipientEmail = process.env.EMAIL_8; // SDR
    } else if (data.reportId === '9') {
      recipientEmail = process.env.EMAIL_9; // SOC
    } else if (data.reportId === '10') {
      recipientEmail = process.env.EMAIL_10; // DOR
    }

    if (!recipientEmail) {
      console.error('No recipient email address configured for report type:', data.reportId);
      return { success: false, details: 'No recipient email address configured for this report type' };
    }

    console.log('Preparing email with data:', {
      to: recipientEmail,
      reportName: data.reportName,
      fileName: data.fileName,
      fileSize: data.fileBuffer.length
    });

    const emailData = {
      to: recipientEmail,
      from: process.env.SMTP_FROM_EMAIL || 'noreply@floridasons.org',
      subject: `New ${data.reportName} Report Submission`,
      text: `
New Report Submission

Report Type: ${data.reportName}
Submitted By: ${data.userName} (${data.userTitle})
Squadron: ${data.squadronNumber}
District: ${data.districtNumber}
Email: ${data.userEmail}

File: ${data.fileName}
      `,
      html: `
        <h2>New Report Submission</h2>
        <p><strong>Report Type:</strong> ${data.reportName}</p>
        <p><strong>Submitted By:</strong> ${data.userName} (${data.userTitle})</p>
        <p><strong>Squadron:</strong> ${data.squadronNumber}</p>
        <p><strong>District:</strong> ${data.districtNumber}</p>
        <p><strong>Email:</strong> ${data.userEmail}</p>
        <p><strong>File:</strong> ${data.fileName}</p>
      `,
      attachments: [{
        content: data.fileBuffer,
        filename: data.fileName,
        type: data.fileType
      }]
    };

    console.log('Sending email to:', recipientEmail);
    await sendEmailToSMTP(emailData);
    console.log('Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      details: error instanceof Error ? error.message : 'Unknown error occurred while sending email'
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