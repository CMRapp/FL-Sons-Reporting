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
 * Deduplicate case-insensitively; returns stable comma-separated string for storage.
 */
export function normalizeEmailListString(raw: string): string {
  const parts = parseEmailList(raw);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of parts) {
    const key = e.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out.join(', ');
}
