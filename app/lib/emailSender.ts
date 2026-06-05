/** Verified SMTP2GO sender (must match an allowed sender in SMTP2GO). */
export function getSmtpFromAddress(): string {
  return (
    process.env.SMTP_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    'noreply@floridasons.org'
  );
}

/** SMTP2GO `sender` field with display name (matches detachment portal). */
export function formatSmtpSender(from?: string): string {
  const email = (from || getSmtpFromAddress()).trim();
  if (email.includes('<') && email.includes('>')) return email;
  return `Florida SAL Reporting Portal <${email}>`;
}

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP2GO_API_KEY?.trim());
}
