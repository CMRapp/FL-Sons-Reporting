/** Upload API uses numeric ids 1–8 (see /api/upload/[id]). */
export const REPORT_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

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
};

/** Suffix for DOM ids: `report-${slug}` (JumpBar, upload sections). */
export const REPORT_DOM_SLUG: Record<ReportUploadId, string> = {
  '1': 'ncsr',
  '2': 'dcsr',
  '3': 'var',
  '4': 'vavs-voy',
  '5': 'americanism',
  '6': 'cy',
  '7': 'sir',
  '8': 'sdr',
};

export type ReportSectionUi = {
  summary: string;
  dueNote: string;
  uploadAriaName: string;
};

export const REPORT_SECTION_UI: Record<ReportUploadId, ReportSectionUi> = {
  '1': {
    summary: 'Submit a COPY of your NATIONAL CSR.',
    dueNote:
      'Use the myLegion.org portal to submit your NATIONAL CSR or mail a copy to National Headquarters.',
    uploadAriaName: 'National Consolidated Squadron Report',
  },
  '2': {
    summary:
      "Annual DETACHMENT report highlighting your squadron's activities and achievements.",
    dueNote: 'Due by May 15th of every year',
    uploadAriaName: 'Detachment Consolidated Squadron Report',
  },
  '3': {
    summary: "Annual report on your squadron's VA&R activities.",
    dueNote: 'Due by May 15th of every year',
    uploadAriaName: 'Veterans Affairs & Rehabilitation',
  },
  '4': {
    summary: 'Nomination form for VAVS Volunteer of the Year award',
    dueNote: 'Due by May 15th of every year',
    uploadAriaName: 'VAVS Volunteer of the Year',
  },
  '5': {
    summary: "Annual Report on your squadron's Americanism programs and activities",
    dueNote: 'Due by May 15th of every year',
    uploadAriaName: 'Americanism',
  },
  '6': {
    summary: "Annual Report on your squadron's C&Y programs and activities",
    dueNote: 'Due by May 15th of every year',
    uploadAriaName: 'Children & Youth',
  },
  '7': {
    summary: 'Squadron Officer Information Report',
    dueNote: 'Must be submitted immediately following squadron elections',
    uploadAriaName: 'Squadron Information Report',
  },
  '8': {
    summary: 'Indicates the amount of dues money to collect by National',
    dueNote:
      'Only submit if there has been a change in your dues or squadron information. Submit by April 9th of every year',
    uploadAriaName: 'Annual Squadron Data Report',
  },
};

export function isValidReportUploadId(id: string): id is ReportUploadId {
  return (REPORT_ORDER as readonly string[]).includes(id);
}

export function getReportCodeByUploadId(id: string): string {
  const meta = REPORT_METADATA[id as ReportUploadId];
  return meta?.code ?? 'Unknown';
}

export function getReportLabelByUploadId(id: string): string {
  const meta = REPORT_METADATA[id as ReportUploadId];
  return meta?.label ?? 'Unknown Report';
}
