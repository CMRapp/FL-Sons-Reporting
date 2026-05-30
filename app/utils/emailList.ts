const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strip BOM, zero-width chars, and non-breaking spaces from pasted/DB recipient fields. */
function sanitizeRecipientRaw(raw: string): string {
  return raw
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ');
}

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
 * Split a string into individual addresses (comma, semicolon, newline, tab, CR, pipe).
 */
export function parseEmailList(raw: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;\n\r\t|]+/)
    .map((chunk) => normalizeEmailSegment(chunk))
    .filter(Boolean);
}

/**
 * Recipients for uploads and admin storage: parse with common separators first; if the
 * field clearly contains @ but structured parse yields nothing (unusual separators,
 * copy/paste glitches), extract likely addresses and validate.
 */
export function emailsFromRecipientField(raw: string): string[] {
  const trimmed = sanitizeRecipientRaw(raw?.trim() ?? '');
  if (!trimmed) return [];

  const structured = dedupeEmailList(parseEmailList(trimmed));
  if (structured.length > 0) return structured;
  if (!trimmed.includes('@')) return [];

  const candidates = trimmed.match(/[^\s,<>"']+@[^\s,<>"']+/g) ?? [];
  const valid: string[] = [];
  for (const c of candidates) {
    const n = normalizeEmailSegment(c);
    if (n && isValidEmail(n)) valid.push(n);
  }
  return dedupeEmailList(valid);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate every address in a list; returns error message or null.
 */
export function validateEmailList(raw: string): string | null {
  const parts = emailsFromRecipientField(raw);
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
  return emailsFromRecipientField(raw).join(', ');
}
