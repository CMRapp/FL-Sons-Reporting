import nodemailer from 'nodemailer';

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
  fileBuffer: Buffer;
  fileType: string;
}

interface ConfirmationEmailData {
  userName: string;
  userEmail: string;
  reportName: string;
  fileName: string;
  submissionDateTime: string;
}

export const sendEmail = async (data: EmailData): Promise<{ success: boolean; details?: string }> => {
  try {
    console.log('Preparing email:', {
      to: process.env.EMAIL_TO,
      userName: data.userName,
      userEmail: data.userEmail,
      reportName: data.reportName,
      fileName: data.fileName,
      timestamp: new Date().toISOString()
    });

    // Check if SMTP configuration is complete
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Incomplete SMTP configuration:', {
        host: process.env.SMTP_HOST ? 'configured' : 'missing',
        port: process.env.SMTP_PORT ? 'configured' : 'missing',
        user: process.env.SMTP_USER ? 'configured' : 'missing',
        pass: process.env.SMTP_PASS ? 'configured' : 'missing'
      });
      return { success: false, details: 'Incomplete SMTP configuration' };
    }

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (error) {
      console.error('SMTP connection verification failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return { success: false, details: 'Failed to connect to SMTP server' };
    }

    const subject = `New ${data.reportName} Submission from ${data.userName}`;
    const text = `A new ${data.reportName} has been submitted by ${data.userName} (${data.userTitle}) from Squadron ${data.squadronNumber}, District ${data.districtNumber}.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New ${data.reportName} Submission</h2>
        <p><strong>Submitted by:</strong> ${data.userName} (${data.userTitle})</p>
        <p><strong>Squadron:</strong> ${data.squadronNumber}</p>
        <p><strong>District:</strong> ${data.districtNumber}</p>
        <p><strong>File:</strong> ${data.fileName}</p>
        <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.EMAIL_TO,
      subject,
      text,
      html,
      attachments: [
        {
          filename: data.fileName,
          content: data.fileBuffer,
          contentType: data.fileType
        }
      ]
    };

    console.log('Sending email with options:', {
      ...mailOptions,
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      data: {
        ...data,
        fileBuffer: 'Buffer present',
        timestamp: new Date().toISOString()
      }
    });
    return { 
      success: false, 
      details: error instanceof Error ? error.message : 'Unknown error occurred while sending email'
    };
  }
};

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
      console.error('Incomplete SMTP configuration:', {
        host: process.env.SMTP_HOST ? 'configured' : 'missing',
        port: process.env.SMTP_PORT ? 'configured' : 'missing',
        user: process.env.SMTP_USER ? 'configured' : 'missing',
        pass: process.env.SMTP_PASS ? 'configured' : 'missing'
      });
      throw new Error('Incomplete SMTP configuration');
    }

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (error) {
      console.error('SMTP connection verification failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error('Failed to connect to SMTP server');
    }

    const subject = `Confirmation: ${data.reportName} Submission`;
    const text = `Hello, ${data.userName}!\n\nYour ${data.reportName} (${data.fileName}) has been successfully submitted on ${data.submissionDateTime}.\n\n*Confirmation sent from The Detachment of Florida Reporting Portal*\n\nThank you!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Submission Confirmation</h2>
        <p>Hello, ${data.userName}!</p>
        <p>Your ${data.reportName} (${data.fileName}) has been successfully submitted on ${data.submissionDateTime}.</p>
        <p style="font-style: italic;">Confirmation sent from The Detachment of Florida Reporting Portal</p>
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