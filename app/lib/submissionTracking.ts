/**
 * First date portal submission logging was active (ISO YYYY-MM-DD).
 * Set SUBMISSION_TRACKING_START in the environment to match your production deploy.
 */
export function getSubmissionTrackingStartIso(): string {
  const fromEnv = process.env.SUBMISSION_TRACKING_START?.trim();
  if (fromEnv) return fromEnv;
  return '2026-02-02';
}
