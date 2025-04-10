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
      throw new Error(responseData.error || 'Failed to send email');
    }

    return responseData;
  } catch (error) {
    console.error('Error in sendEmailToSMTP:', error);
    throw error;
  }
}

export async function sendEmail(data: EmailData) {
  try {
    if (!process.env.SMTP2GO_API_KEY) {
      console.error('SMTP2GO API key not configured');
      return { success: false, details: 'Email service not configured properly' };
    }

    // Get the appropriate email address based on report type
    let toEmail = process.env.EMAIL_TO;
    if (data.reportId === '1') {
      toEmail = process.env.EMAIL_1 || toEmail;
    } else if (data.reportId === '2') {
      toEmail = process.env.EMAIL_2 || toEmail;
    } else if (data.reportId === '3') {
      toEmail = process.env.EMAIL_3 || toEmail;
    } else if (data.reportId === '4') {
      toEmail = process.env.EMAIL_4 || toEmail;
    } else if (data.reportId === '5') {
      toEmail = process.env.EMAIL_5 || toEmail;
    } else if (data.reportId === '6') {
      toEmail = process.env.EMAIL_6 || toEmail;
    } else if (data.reportId === '7') {
      toEmail = process.env.EMAIL_7 || toEmail;
    } else if (data.reportId === '8') {
      toEmail = process.env.EMAIL_8 || toEmail;
    } else if (data.reportId === '9') {
      toEmail = process.env.EMAIL_9 || toEmail;
    } else if (data.reportId === '10') {
      toEmail = process.env.EMAIL_10 || toEmail;
    }

    if (!toEmail) {
      console.error('No recipient email address configured');
      return { success: false, details: 'No recipient email address configured' };
    }

    console.log('Preparing email with data:', {
      to: toEmail,
      reportName: data.reportName,
      fileName: data.fileName,
      fileSize: data.fileBuffer.length
    });

    const emailData = {
      to: toEmail,
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

    console.log('Sending email to:', toEmail);
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
      to: data.userEmail,
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