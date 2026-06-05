import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/app/lib/adminAuth';
import { getSmtpFromAddress, isSmtpConfigured } from '@/app/lib/emailSender';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET — whether SMTP2GO is configured (no secrets returned). */
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    smtpConfigured: isSmtpConfigured(),
    smtpFrom: getSmtpFromAddress(),
    hint: isSmtpConfigured()
      ? 'SMTP2GO_API_KEY is set. Use POST /api/admin/test-email to send a test message.'
      : 'Add SMTP2GO_API_KEY and SMTP_FROM_EMAIL to the reporting Vercel project (same values as detachment portal).',
  });
}
