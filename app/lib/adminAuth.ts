import { NextRequest } from 'next/server';

/** Strip BOM / trim so env pastes and browser-saved passwords match reliably. */
function normalizeAdminSecret(value: string): string {
  return value.replace(/^\uFEFF/, '').trim();
}

export function verifyAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = normalizeAdminSecret(authHeader.substring(7));
  const adminPasswordRaw = process.env.ADMIN_PASSWORD;
  const adminPassword = adminPasswordRaw
    ? normalizeAdminSecret(adminPasswordRaw)
    : '';

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not configured or empty after trim');
    return false;
  }

  return token === adminPassword;
}
