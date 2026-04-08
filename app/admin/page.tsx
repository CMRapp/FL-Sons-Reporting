'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getServiceYear } from '@/app/utils/serviceYear';
import { REPORT_ORDER, REPORT_METADATA, type ReportUploadId } from '@/app/lib/reports';

interface ReportEmail {
  reportName: string;
  fullName: string;
  email: string;
}

interface ReportConfig {
  reportEmails: { [key: string]: ReportEmail };
  lastUpdated: string;
  updatedBy: string;
}

interface SubmissionRecord {
  id: string;
  reportId: string;
  reportName: string;
  fullName: string;
  userName: string;
  userEmail: string;
  userTitle: string;
  squadronNumber: string;
  districtNumber: string;
  fileName: string;
  fileSize: number;
  submitterIp: string | null;
  createdAt: string;
}

type AdminSection = 'emails' | 'history';

function squadronSortKey(squadronNumber: string): number {
  const n = parseInt(String(squadronNumber).replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function formatSubmittedMMDDYY(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function formatSquadronColumn(squadronNumber: string): string {
  const n = squadronNumber.trim();
  return n ? `SQ ${n}` : 'SQ —';
}

/** Preview-only: six squadrons (out of order) to verify sorting; duplicated per report tab. */
function buildSampleSubmissions(): SubmissionRecord[] {
  const bases: Pick<SubmissionRecord, 'squadronNumber' | 'userName' | 'createdAt'>[] = [
    { squadronNumber: '305', userName: 'Alex Morgan', createdAt: '2026-04-07T14:30:00.000Z' },
    { squadronNumber: '102', userName: 'Jordan Lee', createdAt: '2026-04-06T09:15:00.000Z' },
    { squadronNumber: '88', userName: 'Sam Rivera', createdAt: '2026-04-08T11:00:00.000Z' },
    { squadronNumber: '441', userName: 'Taylor Chen', createdAt: '2026-04-05T16:45:00.000Z' },
    { squadronNumber: '15', userName: 'Riley Brooks', createdAt: '2026-04-08T08:20:00.000Z' },
    { squadronNumber: '220', userName: 'Casey Nguyen', createdAt: '2026-04-07T10:05:00.000Z' },
  ];
  const out: SubmissionRecord[] = [];
  for (const rid of REPORT_ORDER) {
    const meta = REPORT_METADATA[rid];
    bases.forEach((b, i) => {
      out.push({
        id: `__sample__${rid}_${i}`,
        reportId: rid,
        reportName: meta.code,
        fullName: meta.label,
        userName: b.userName,
        userEmail: 'sample@preview.local',
        userTitle: 'Sample',
        squadronNumber: b.squadronNumber,
        districtNumber: '—',
        fileName: 'sample-preview.pdf',
        fileSize: 0,
        submitterIp: null,
        createdAt: b.createdAt,
      });
    });
  }
  return out;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [adminName, setAdminName] = useState('');
  const [adminSection, setAdminSection] = useState<AdminSection>('emails');
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState('');
  const [historyTabId, setHistoryTabId] = useState<ReportUploadId>('1');
  const [trackingStartedAt, setTrackingStartedAt] = useState<string | null>(null);
  const [includeHistorySampleData, setIncludeHistorySampleData] = useState(false);
  const serviceYear = getServiceYear();

  const fetchSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    setSubmissionsError('');
    try {
      const res = await fetch('/api/admin/submissions?limit=2000', {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Failed to load submissions');
      }
      const data = (await res.json()) as {
        submissions: SubmissionRecord[];
        trackingStartedAt?: string;
      };
      setSubmissions(data.submissions ?? []);
      setTrackingStartedAt(data.trackingStartedAt ?? null);
    } catch (e) {
      setSubmissionsError(e instanceof Error ? e.message : 'Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (!isAuthenticated || adminSection !== 'history' || !password) return;
    fetchSubmissions();
  }, [isAuthenticated, adminSection, password, fetchSubmissions]);

  const submissionsWithPreviewSamples = useMemo(() => {
    if (!includeHistorySampleData) return submissions;
    return [...submissions, ...buildSampleSubmissions()];
  }, [submissions, includeHistorySampleData]);

  const submissionsByReport = useMemo(() => {
    const map: Record<string, SubmissionRecord[]> = {};
    for (const id of REPORT_ORDER) {
      map[id] = [];
    }
    for (const s of submissionsWithPreviewSamples) {
      if (!map[s.reportId]) map[s.reportId] = [];
      map[s.reportId].push(s);
    }
    return map;
  }, [submissionsWithPreviewSamples]);

  const activeHistoryMeta = REPORT_METADATA[historyTabId];
  const activeHistoryRows = useMemo(() => {
    const rows = submissionsByReport[historyTabId] ?? [];
    return [...rows].sort(
      (a, b) => squadronSortKey(a.squadronNumber) - squadronSortKey(b.squadronNumber)
    );
  }, [submissionsByReport, historyTabId]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setIsAuthenticated(true);
      } else {
        setMessage('Invalid password');
        setMessageType('error');
        setIsAuthenticated(false);
      }
    } catch (error) {
      setMessage('Failed to fetch configuration');
      setMessageType('error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    await fetchConfig();
    setLoading(false);
  };

  const handleEmailChange = (reportId: string, email: string) => {
    if (config) {
      setConfig({
        ...config,
        reportEmails: {
          ...config.reportEmails,
          [reportId]: {
            ...config.reportEmails[reportId],
            email
          }
        }
      });
    }
  };

  const handleSave = async () => {
    if (!config || !adminName.trim()) {
      setMessage('Please enter your name before saving');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({
          reportEmails: config.reportEmails,
          updatedBy: adminName
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        setMessage('Configuration saved successfully!');
        setMessageType('success');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to save configuration');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to save configuration');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setConfig(null);
    setAdminName('');
    setMessage('');
    setAdminSection('emails');
    setSubmissions([]);
    setSubmissionsError('');
    setHistoryTabId('1');
    setTrackingStartedAt(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="w-[85vw] max-w-full flex justify-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
            Admin Panel Login
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Service Year: {serviceYear}
          </p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {message && messageType === 'error' && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-[85vw] max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-800">Admin Panel</h1>
              <p className="text-gray-600 mt-2">Service Year: {serviceYear}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors self-start"
            >
              Logout
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-4" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={adminSection === 'emails'}
              onClick={() => setAdminSection('emails')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                adminSection === 'emails'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Email settings
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={adminSection === 'history'}
              onClick={() => setAdminSection('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                adminSection === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Submission History
            </button>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-md text-sm ${
                messageType === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          {adminSection === 'emails' && (
            <>
              {config?.lastUpdated && (
                <div className="text-sm text-gray-500 mb-4">
                  Last updated: {new Date(config.lastUpdated).toLocaleString()} by {config.updatedBy}
                </div>
              )}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <label
                  htmlFor="adminName"
                  className="text-sm font-medium text-gray-700 shrink-0"
                >
                  Your Name (required for audit trail)
                </label>
                <input
                  id="adminName"
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="flex-1 min-w-[12rem] max-w-xl px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                />
              </div>
            </>
          )}
        </div>

        {adminSection === 'emails' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Email Addresses</h2>
            <p className="text-sm text-gray-600 mb-2">
              Enter one or more addresses per report, separated by commas, semicolons, or new lines.
            </p>
            <p className="text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-md p-3 mb-6">
              Every submission is also BCC&apos;d to{' '}
              <strong>reports@floridasons.org</strong> (or{' '}
              <code className="text-xs bg-white px-1 rounded">REPORTS_ARCHIVE_EMAIL</code> when set),
              unless that address is already one of the recipients above — then no extra BCC is sent.
            </p>

            {config && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Object.entries(config.reportEmails)]
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([id, report]) => (
                    <div
                      key={id}
                      className="min-w-0 flex flex-col rounded-lg border border-gray-200/90 bg-gradient-to-b from-gray-50 to-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-gray-900/[0.04] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
                    >
                      <div className="text-sm text-gray-800 mb-1 min-w-0 leading-snug">
                        <span className="font-semibold">{report.reportName}</span>
                        <span className="text-gray-600"> {report.fullName}</span>
                      </div>
                      <label className="sr-only" htmlFor={`report-email-${id}`}>
                        Email addresses for {report.reportName}
                      </label>
                      <textarea
                        id={`report-email-${id}`}
                        value={report.email}
                        onChange={(e) => handleEmailChange(id, e.target.value)}
                        rows={1}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm leading-tight resize-y min-h-[2rem]"
                        placeholder="one@example.com, two@example.com"
                        aria-label={`Email addresses for ${report.reportName}`}
                      />
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || !adminName.trim()}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        )}

        {adminSection === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h2 className="text-xl font-semibold text-gray-800">Submission History</h2>
                  {trackingStartedAt && (
                    <span className="text-sm font-normal text-gray-600">
                      · Tracking since{' '}
                      {new Date(
                        trackingStartedAt.length === 10
                          ? `${trackingStartedAt}T12:00:00`
                          : trackingStartedAt
                      ).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Logged when a report file is successfully emailed. Submissions received before
                  tracking began are not listed here. Choose a report type below to see who
                  submitted and when.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end shrink-0">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-800 select-none order-2 sm:order-1">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    checked={includeHistorySampleData}
                    onChange={(e) => setIncludeHistorySampleData(e.target.checked)}
                    aria-describedby="history-sample-data-hint"
                  />
                  <span className="font-medium">Include sample data</span>
                </label>
                <button
                  type="button"
                  onClick={() => fetchSubmissions()}
                  disabled={submissionsLoading}
                  className="bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 disabled:opacity-50 text-sm font-medium order-1 sm:order-2"
                >
                  {submissionsLoading ? 'Loading…' : 'Refresh'}
                </button>
              </div>
            </div>
            <p id="history-sample-data-hint" className="sr-only">
              When enabled, adds six placeholder squadrons on every report tab for layout preview. Tab counts include these rows.
            </p>

            {submissionsError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{submissionsError}</div>
            )}

            <div
              className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-4 overflow-x-auto"
              role="tablist"
              aria-label="Report types"
            >
              {REPORT_ORDER.map((rid) => {
                const meta = REPORT_METADATA[rid];
                const count = (submissionsByReport[rid] ?? []).length;
                const active = historyTabId === rid;
                return (
                  <button
                    key={rid}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    id={`history-tab-${rid}`}
                    aria-controls={`history-panel-${rid}`}
                    onClick={() => setHistoryTabId(rid)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <span>{meta.code}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                        active ? 'bg-blue-500/90 text-white' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`history-panel-${historyTabId}`}
              aria-labelledby={`history-tab-${historyTabId}`}
              className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
            >
              <p className="text-sm text-gray-700 mb-3">
                <span className="font-semibold text-blue-900">{activeHistoryMeta.code}</span>
                <span className="text-gray-600"> — {activeHistoryMeta.label}</span>
              </p>
              {includeHistorySampleData && (
                <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
                  Sample data is on: six placeholder squadrons appear on every report tab, and tab counts include them.
                  Uncheck <span className="font-medium">Include sample data</span> above to show only real submissions.
                </p>
              )}
              {activeHistoryRows.length === 0 ? (
                <p className="text-sm text-gray-500 italic py-2">No submissions yet.</p>
              ) : (
                <div className="rounded-md border border-gray-200 bg-white p-4">
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 list-none m-0 p-0">
                    {activeHistoryRows.map((row) => (
                      <li
                        key={row.id}
                        className="rounded-md border border-gray-100 bg-gray-50/90 px-3 py-3 text-sm text-gray-900"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                          <span className="font-semibold tabular-nums whitespace-nowrap shrink-0">
                            {formatSquadronColumn(row.squadronNumber)}
                          </span>
                          <span className="tabular-nums whitespace-nowrap shrink-0 text-gray-800">
                            {formatSubmittedMMDDYY(row.createdAt)}
                          </span>
                          <span className="text-gray-900 min-w-0">{row.userName}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
