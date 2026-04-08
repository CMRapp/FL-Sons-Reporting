/**
 * First date portal submission logging was active (ISO YYYY-MM-DD).
 * Prefer SUBMISSION_TRACKING_START in env (e.g. Vercel) so it matches your real go-live day.
 */
export function getSubmissionTrackingStartIso(): string {
  const fromEnv = process.env.SUBMISSION_TRACKING_START?.trim();
  if (fromEnv) return fromEnv;
  // Default: submission logging shipped to production (adjust if you fork or redeploy later)
  return '2026-04-08';
}
