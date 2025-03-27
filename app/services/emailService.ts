import nodemailer from 'nodemailer';
import { readFile, unlink, mkdir, access } from 'fs/promises';
import { join } from 'path';

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface EmailData {
  userName: string;
  userEmail: string;
  userTitle: string;
  squadronNumber: string;
  districtNumber: string;
  reportName: string;
  fileName: string;
  reportId: string;
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
    console.log('Preparing email with data:', {
      ...data,
      timestamp: new Date().toISOString(),
    });

    // Get the appropriate recipient email based on report ID
    const recipientEmail = process.env[`EMAIL_${data.reportId}`] || process.env.ADMIN_EMAIL;
    
    if (!recipientEmail) {
      throw new Error('No recipient email configured');
    }

    // Check if SMTP configuration is complete
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Incomplete SMTP configuration');
    }

    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, data.fileName);

    // Read the file from uploads directory
    const fileContent = await readFile(filePath);

    // Check file size
    if (fileContent.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    console.log('File read successfully:', {
      fileName: data.fileName,
      filePath,
      size: fileContent.length,
    });

    // Construct email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: `New ${data.reportName} Upload`,
      html: `
        <h2>New Report Upload</h2>
        <p><strong>Report:</strong> ${data.reportName}</p>
        <p><strong>Submitted By:</strong> ${data.userName}</p>
        <p><strong>Title:</strong> ${data.userTitle}</p>
        <p><strong>Squadron Number:</strong> ${data.squadronNumber}</p>
        <p><strong>District Number:</strong> ${data.districtNumber}</p>
        <p><strong>Email:</strong> ${data.userEmail}</p>
        <p><strong>File:</strong> ${data.fileName}</p>
      `,
      attachments: [
        {
          filename: data.fileName,
          path: filePath,
        },
      ],
    };

    console.log('Sending email to:', recipientEmail);

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString(),
    });

    // Delete the file after successful email sending
    await unlink(filePath);
    console.log('File deleted successfully:', {
      fileName: data.fileName,
      filePath,
    });

    return {
      success: true,
      details: {
        messageId: info.messageId,
        response: info.response,
      },
    };
  } catch (error) {
    console.error('Error sending email:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const sendConfirmationEmail = async (data: ConfirmationEmailData): Promise<void> => {
  try {
    console.log('Preparing confirmation email:', {
      to: data.userEmail,
      userName: data.userName,
      reportName: data.reportName,
      fileName: data.fileName,
      submissionDateTime: data.submissionDateTime,
      timestamp: new Date().toISOString()
    });

    // Check if SMTP configuration is complete
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Incomplete SMTP configuration');
    }

    const subject = `Confirmation: ${data.reportName} Submission`;
    const text = `Hello, ${data.userName}!\n\nYour ${data.reportName} (${data.fileName}) has been successfully submitted on ${data.submissionDateTime}.\n\nThank you!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Submission Confirmation</h2>
        <p>Hello, ${data.userName}!</p>
        <p>Your ${data.reportName} (${data.fileName}) has been successfully submitted on ${data.submissionDateTime}.</p>
        <p>Thank you!</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: data.userEmail,
      subject,
      text,
      html,
    };

    console.log('Sending confirmation email with options:', {
      ...mailOptions,
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Confirmation email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending confirmation email:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      data: {
        ...data,
        timestamp: new Date().toISOString()
      }
    });
    throw error;
  }
}; 