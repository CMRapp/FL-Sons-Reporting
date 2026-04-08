/** Upload API uses numeric ids 1–10 (see /api/upload/[id]). */
export const REPORT_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;

export type ReportUploadId = (typeof REPORT_ORDER)[number];

export const REPORT_METADATA: Record<
  ReportUploadId,
  { code: string; label: string }
> = {
  '1': { code: 'NCSR', label: 'National Consolidated Squadron Report (NCSR)' },
  '2': { code: 'DCSR', label: 'Detachment Consolidated Squadron Report (DCSR)' },
  '3': { code: 'VAR', label: 'Veterans Affairs & Rehabilitation (VA&R)' },
  '4': { code: 'VAVS-Vol-Yr', label: 'VAVS Volunteer of the Year' },
  '5': { code: 'AMERICANISM', label: 'Americanism' },
  '6': { code: 'CY', label: 'Children & Youth (C&Y)' },
  '7': { code: 'SIR', label: 'Squadron Information Report (SIR)' },
  '8': { code: 'SDR', label: 'Annual Squadron Data Report (SDR)' },
  '9': { code: 'SOC', label: 'Squadron Officer Change (SOC)' },
  '10': { code: 'DOR', label: 'District Officers Report (DOR)' },
};

export function getReportCodeByUploadId(id: string): string {
  const meta = REPORT_METADATA[id as ReportUploadId];
  return meta?.code ?? 'Unknown';
}

export function getReportLabelByUploadId(id: string): string {
  const meta = REPORT_METADATA[id as ReportUploadId];
  return meta?.label ?? 'Unknown Report';
}
