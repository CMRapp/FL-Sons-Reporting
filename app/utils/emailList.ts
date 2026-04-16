const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Split a string into individual addresses (comma, semicolon, or newline).
 */
export function parseEmailList(raw: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.split('#')[0].trim())
    .filter(Boolean);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate every address in a list; returns error message or null.
 */
export function validateEmailList(raw: string): string | null {
  const parts = parseEmailList(raw);
  if (parts.length === 0) return 'At least one email address is required';
  for (const e of parts) {
    if (!isValidEmail(e)) return `Invalid email: ${e}`;
  }
  return null;
}

/**
 * Deduplicate addresses case-insensitively (first occurrence wins).
 */
export function dedupeEmailList(emails: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of emails) {
    const key = e.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(e.trim());
  }
  return out;
}

/**
 * Deduplicate case-insensitively; returns stable comma-separated string for storage.
 */
export function normalizeEmailListString(raw: string): string {
  const parts = parseEmailList(raw);
  return dedupeEmailList(parts).join(', ');
}

/**
 * Build BCC list for archive copies: parse `REPORTS_ARCHIVE_EMAIL` (comma/semicolon/newline),
 * drop any address already in `to` (case-insensitive), dedupe.
 * Prevents duplicate delivery when the archive env is a list that repeats a primary recipient
 * (e.g. `reports@floridasons.org, backup@…` while `reports@` is already in To).
 */
export function buildArchiveBccList(
  recipients: string[],
  archiveEnv: string | undefined,
  defaultArchive = 'reports@floridasons.org'
): string[] {
  const raw = (archiveEnv ?? '').trim() || defaultArchive;
  let candidates = dedupeEmailList(parseEmailList(raw));
  if (candidates.length === 0) {
    candidates = [defaultArchive];
  }
  const recipientSet = new Set(
    recipients.map((e) => e.trim().toLowerCase()).filter(Boolean)
  );
  return dedupeEmailList(
    candidates.filter((e) => !recipientSet.has(e.trim().toLowerCase()))
  );
}
