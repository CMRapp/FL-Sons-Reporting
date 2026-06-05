import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/app/lib/adminAuth';
import { sendEmail } from '@/app/services/emailService';
import { getReportRecipients } from '@/app/utils/reportConfig';
import { REPORT_ORDER, REPORT_METADATA } from '@/app/lib/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST — send a test email (admin auth).
 * Body: { to?: string, reportId?: string } — reportId sends to that report's DB recipients.
 */
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    to?: string;
    reportId?: string;
  };

  let to: string[] = [];
  if (body.reportId && REPORT_ORDER.includes(body.reportId as (typeof REPORT_ORDER)[number])) {
    const recipients = await getReportRecipients(body.reportId);
    if (!recipients?.length) {
      return NextResponse.json(
        {
          error: `No recipients configured for report ${body.reportId} (${REPORT_METADATA[body.reportId as keyof typeof REPORT_METADATA].code})`,
        },
        { status: 400 }
      );
    }
    to = recipients;
  } else if (body.to?.trim()) {
    to = [body.to.trim()];
  } else {
    const fallback = process.env.ADMIN_EMAIL?.trim();
    if (!fallback) {
      return NextResponse.json(
        { error: 'Provide { to } or { reportId }, or set ADMIN_EMAIL' },
        { status: 400 }
      );
    }
    to = [fallback];
  }

  const result = await sendEmail({
    to,
    subject: 'Test — Florida SAL Reporting Portal',
    text: 'This is a test email from the reporting portal admin panel. If you received this, SMTP2GO is working.',
    html: '<p>This is a <strong>test email</strong> from the reporting portal admin panel.</p><p>If you received this, SMTP2GO is working.</p>',
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error, to },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    to,
    messageId: result.messageId,
  });
}
