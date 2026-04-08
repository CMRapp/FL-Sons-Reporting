import prisma from '@/app/lib/prisma';

/**
 * Stored in `config_metadata` when not overridden by env.
 * Value: ISO date `YYYY-MM-DD`.
 */
export const SUBMISSION_TRACKING_META_KEY = 'submission_tracking_start';

/** Fallback when neither env nor database has a value. */
const CODE_DEFAULT = '2026-04-08';

/** Today in UTC as YYYY-MM-DD (consistent on serverless). */
export function utcTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeTrackingDateInput(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (trimmed.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  return null;
}

export type TrackingResolvedSource = 'env' | 'database' | 'default';

export function resolveSubmissionTrackingStart(
  dbValue: string | null | undefined
): { iso: string; source: TrackingResolvedSource } {
  const envRaw = process.env.SUBMISSION_TRACKING_START?.trim();
  if (envRaw) {
    const iso = normalizeTrackingDateInput(envRaw) ?? envRaw.slice(0, 10);
    return { iso, source: 'env' };
  }
  const dbParsed = normalizeTrackingDateInput(dbValue ?? '');
  if (dbParsed) return { iso: dbParsed, source: 'database' };
  return { iso: CODE_DEFAULT, source: 'default' };
}

export async function getSubmissionTrackingStartResolved(): Promise<{
  iso: string;
  source: TrackingResolvedSource;
}> {
  const meta = await prisma.configMetadata.findUnique({
    where: { key: SUBMISSION_TRACKING_META_KEY },
  });
  return resolveSubmissionTrackingStart(meta?.value);
}

export function isTrackingStartLockedByEnv(): boolean {
  return Boolean(process.env.SUBMISSION_TRACKING_START?.trim());
}
