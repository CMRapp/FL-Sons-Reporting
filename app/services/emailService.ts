import { formatSmtpSender, getSmtpFromAddress, isSmtpConfigured } from '@/app/lib/emailSender';

function asEmailArray(value: string | string[]): string[] {
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((e) => e.trim()).filter(Boolean);
}

interface EmailData {
  to: string | string[];
  bcc?: string | string[];
  from?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: ArrayBuffer;
    contentType: string;
  }>;
}

interface ConfirmationEmailData {
  userName: string;
  userEmail: string;
  reportName: string;
  fileName: string;
  submissionDateTime: string;
}

interface EmailResponse {
  success: boolean;
  error?: string;
  messageId?: string;
}

type Smtp2GoResponse = {
  data?: {
    succeeded?: number;
    failed?: number;
    failures?: Array<{ address?: string; error?: string }>;
    error?: string;
    error_code?: string;
    email_id?: string;
  };
  error?: string;
};

function attachmentMimeType(filename: string, contentType: string): string {
  const ct = contentType?.trim();
  if (ct) return ct;
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
  };
  return (ext && map[ext]) || 'application/octet-stream';
}

function parseSmtp2GoResponse(raw: string): Smtp2GoResponse | null {
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw) as Smtp2GoResponse;
  } catch {
    return null;
  }
}

function smtp2GoFailureMessage(parsed: Smtp2GoResponse): string | null {
  const d = parsed.data;
  const topError = parsed.error || d?.error;
  if (topError) return String(topError);
  if (d?.error_code) return String(d.error_code);
  if (d && typeof d.succeeded === 'number' && d.succeeded === 0) {
    return 'SMTP2GO reported no successful deliveries for this message.';
  }
  if (d && typeof d.failed === 'number' && d.failed > 0) {
    if (Array.isArray(d.failures) && d.failures.length > 0) {
      return d.failures
        .map((f) => `${f.address ?? '?'}: ${f.error ?? 'rejected'}`)
        .join('; ');
    }
    return `${d.failed} recipient(s) failed`;
  }
  return null;
}

export async function sendEmail(data: EmailData): Promise<EmailResponse> {
  try {
    if (!isSmtpConfigured()) {
      console.error('SMTP2GO_API_KEY is not configured');
      return { success: false, error: 'Email service not configured (SMTP2GO_API_KEY missing)' };
    }

    const toList = asEmailArray(data.to);
    if (toList.length === 0) {
      return { success: false, error: 'No recipient addresses provided' };
    }

    let bccList = data.bcc ? asEmailArray(data.bcc) : [];
    const toSet = new Set(toList.map((t) => t.trim().toLowerCase()).filter(Boolean));
    bccList = bccList.filter((b) => !toSet.has(b.trim().toLowerCase()));
    const bccSeen = new Set<string>();
    bccList = bccList.filter((b) => {
      const k = b.trim().toLowerCase();
      if (!k || bccSeen.has(k)) return false;
      bccSeen.add(k);
      return true;
    });

    const sender = formatSmtpSender(data.from);
    const requestData = {
      api_key: process.env.SMTP2GO_API_KEY,
      sender,
      to: toList,
      ...(bccList.length ? { bcc: bccList } : {}),
      subject: data.subject,
      text_body: data.text,
      html_body: data.html,
      attachments: data.attachments?.map((attachment) => ({
        filename: attachment.filename,
        fileblob: Buffer.from(attachment.content).toString('base64'),
        mimetype: attachmentMimeType(attachment.filename, attachment.contentType),
      })),
    };

    console.log('Sending email via SMTP2GO:', {
      toCount: toList.length,
      to: toList,
      sender,
      subject: data.subject,
      hasAttachments: Boolean(requestData.attachments?.length),
    });

    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const raw = await response.text();
    const parsed = parseSmtp2GoResponse(raw);

    if (!response.ok) {
      const err =
        parsed?.data?.error ||
        parsed?.error ||
        raw.trim().slice(0, 200) ||
        'Failed to send email';
      console.error('SMTP2GO HTTP error:', response.status, err, raw.slice(0, 500));
      return { success: false, error: String(err) };
    }

    if (parsed) {
      const failure = smtp2GoFailureMessage(parsed);
      if (failure) {
        console.error('SMTP2GO delivery failure:', failure, parsed);
        return { success: false, error: `Email not accepted for all recipients: ${failure}` };
      }
      console.log('Email accepted by SMTP2GO:', {
        emailId: parsed.data?.email_id,
        succeeded: parsed.data?.succeeded,
      });
      return { success: true, messageId: parsed.data?.email_id };
    }

    console.log('Email sent (empty or non-JSON SMTP2GO body)');
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendConfirmationEmail(data: ConfirmationEmailData) {
  const emailData = {
    to: data.userEmail,
    subject: `Confirmation: ${data.reportName} Report Submitted`,
    text: `
Thank you for submitting your ${data.reportName} report.

Submission Details:
- Report: ${data.reportName}
- File: ${data.fileName}
- Submitted By: ${data.userName}
- Submission Time: ${data.submissionDateTime}

Confirmation sent from The Detachment of Florida Reporting Portal
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
      <p><em>Confirmation sent from The Detachment of Florida Reporting Portal</em></p>
    `,
  };

  return sendEmail(emailData);
}

export { getSmtpFromAddress, isSmtpConfigured };
