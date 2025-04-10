import nodemailer from 'nodemailer';

// SMTP configuration
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create SMTP transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Verify SMTP connection
transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP connection verified');
  }
});

interface EmailData {
  userName: string;
  userEmail: string;
  userTitle: string;
  squadronNumber: string;
  districtNumber: string;
  reportName: string;
  fileName: string;
  reportId: string;
  fileBuffer: string; // Base64 string instead of Buffer
  fileType: string;
}

interface ConfirmationEmailData {
  userName: string;
  userEmail: string;
  reportName: string;
  fileName: string;
  submissionDateTime: string;
}

export async function sendEmail(data: EmailData) {
  try {
    // Validate SMTP configuration
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      console.error('SMTP configuration is incomplete');
      return { success: false, details: 'Email service not configured properly' };
    }

    // Get the appropriate email address based on report type
    let toEmail = process.env.EMAIL_TO;
    if (data.reportId === '1') {
      toEmail = process.env.EMAIL_TO_NCSR || toEmail;
    } else if (data.reportId === '2') {
      toEmail = process.env.EMAIL_TO_DCSR || toEmail;
    } else if (data.reportId === '3') {
      toEmail = process.env.EMAIL_TO_VAR || toEmail;
    } else if (data.reportId === '4') {
      toEmail = process.env.EMAIL_TO_VAVS || toEmail;
    } else if (data.reportId === '5') {
      toEmail = process.env.EMAIL_TO_AMERICANISM || toEmail;
    } else if (data.reportId === '6') {
      toEmail = process.env.EMAIL_TO_CY || toEmail;
    } else if (data.reportId === '7') {
      toEmail = process.env.EMAIL_TO_SIR || toEmail;
    } else if (data.reportId === '8') {
      toEmail = process.env.EMAIL_TO_SDR || toEmail;
    } else if (data.reportId === '9') {
      toEmail = process.env.EMAIL_TO_SOC || toEmail;
    } else if (data.reportId === '10') {
      toEmail = process.env.EMAIL_TO_DOR || toEmail;
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

    // Create email content
    const mailOptions = {
      from: `"Florida Sons Reporting Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
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
        filename: data.fileName,
        content: data.fileBuffer,
        encoding: 'base64'
      }]
    };

    console.log('Sending email to:', toEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
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
    // Validate SMTP configuration
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      console.error('SMTP configuration is incomplete');
      return { success: false, details: 'Email service not configured properly' };
    }

    console.log('Preparing confirmation email for:', data.userEmail);

    // Create email content
    const mailOptions = {
      from: `"Florida Sons Reporting Portal" <${process.env.SMTP_USER}>`,
      to: data.userEmail,
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
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { 
      success: false, 
      details: error instanceof Error ? error.message : 'Unknown error occurred while sending confirmation email'
    };
  }
} 