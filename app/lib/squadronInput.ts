/** Max digits for squadron number entry (leading zeros allowed, e.g. 0042). */
export const MAX_SQUADRON_DIGITS = 4;

/** Strip non-digits and cap length; preserves leading zeros. */
export function normalizeSquadronDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, MAX_SQUADRON_DIGITS);
}

/** Numeric key for detachment DB lookup (sq_number is stored as integer). */
export function squadronLookupNumber(digits: string): number {
  return parseInt(digits, 10);
}

export function isValidSquadronDigits(digits: string): boolean {
  if (!/^\d{1,4}$/.test(digits)) return false;
  const n = squadronLookupNumber(digits);
  return Number.isFinite(n) && n > 0;
}
