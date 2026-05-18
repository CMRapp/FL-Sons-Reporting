const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * One segment after comma/semicolon split: strip # comments, mailto:, and
 * RFC-style `Name <address>` so validation matches how people paste addresses.
 */
function normalizeEmailSegment(segment: string): string {
  let s = segment.split('#')[0];
  if (!s) return '';
  s = s.trim().replace(/^mailto:/i, '').trim();
  const open = s.lastIndexOf('<');
  const close = s.lastIndexOf('>');
  if (open !== -1 && close > open && s.slice(open + 1, close).includes('@')) {
    s = s.slice(open + 1, close).trim();
  }
  return s.trim();
}

/**
 * Split a string into individual addresses (comma, semicolon, or newline).
 */
export function parseEmailList(raw: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;\n]+/)
    .map((chunk) => normalizeEmailSegment(chunk))
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
