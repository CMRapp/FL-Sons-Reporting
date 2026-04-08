'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getServiceYear } from '@/app/utils/serviceYear';
import { REPORT_ORDER, REPORT_METADATA } from '@/app/lib/reports';

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      const data = (await res.json()) as { submissions: SubmissionRecord[] };
      setSubmissions(data.submissions ?? []);
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

  const submissionsByReport = useMemo(() => {
    const map: Record<string, SubmissionRecord[]> = {};
    for (const id of REPORT_ORDER) {
      map[id] = [];
    }
    for (const s of submissions) {
      if (!map[s.reportId]) map[s.reportId] = [];
      map[s.reportId].push(s);
    }
    return map;
  }, [submissions]);

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
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
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
              Submission history
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
              <div className="mb-6">
                <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (required for audit trail)
                </label>
                <input
                  id="adminName"
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              <div className="space-y-3">
                {Object.entries(config.reportEmails).map(([id, report]) => (
                  <div key={id} className="border border-gray-200 rounded-md p-3 md:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6 gap-y-3 items-start">
                      <div className="min-w-0 md:pr-2">
                        <h3 className="font-semibold text-gray-800 leading-tight">{report.reportName}</h3>
                        <p className="text-sm text-gray-600 mt-1">{report.fullName}</p>
                      </div>
                      <div className="min-w-0">
                        <label className="sr-only" htmlFor={`report-email-${id}`}>
                          Email addresses for {report.reportName}
                        </label>
                        <textarea
                          id={`report-email-${id}`}
                          value={report.email}
                          onChange={(e) => handleEmailChange(id, e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                          placeholder="one@example.com, two@example.com"
                          aria-label={`Email addresses for ${report.reportName}`}
                        />
                      </div>
                    </div>
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
                <h2 className="text-xl font-semibold text-gray-800">Submission history</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Logged when a report file is successfully emailed. Open each report type to see who
                  submitted and when.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchSubmissions()}
                disabled={submissionsLoading}
                className="bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
              >
                {submissionsLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {submissionsError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{submissionsError}</div>
            )}

            <div className="space-y-2">
              {REPORT_ORDER.map((rid) => {
                const meta = REPORT_METADATA[rid];
                const rows = submissionsByReport[rid] ?? [];
                return (
                  <details
                    key={rid}
                    className="border border-gray-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="cursor-pointer list-none flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium text-gray-900">
                      <span className="min-w-0">
                        <span className="text-blue-800">{meta.code}</span>
                        <span className="text-gray-500 font-normal text-sm ml-2">{meta.label}</span>
                      </span>
                      <span className="text-sm bg-white border border-gray-200 rounded-full px-3 py-0.5 text-gray-700">
                        {rows.length} submission{rows.length !== 1 ? 's' : ''}
                      </span>
                    </summary>
                    <div className="p-3 border-t border-gray-100 bg-white">
                      {rows.length === 0 ? (
                        <p className="text-sm text-gray-500 italic py-2 px-1">No submissions yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm text-left">
                            <thead>
                              <tr className="border-b border-gray-200 text-gray-600">
                                <th className="py-2 pr-4 font-medium whitespace-nowrap">Submitted</th>
                                <th className="py-2 pr-4 font-medium whitespace-nowrap">Name</th>
                                <th className="py-2 pr-4 font-medium whitespace-nowrap">Title</th>
                                <th className="py-2 pr-4 font-medium whitespace-nowrap">Email</th>
                                <th className="py-2 pr-4 font-medium whitespace-nowrap">Sq</th>
                                <th className="py-2 pr-4 font-medium whitespace-nowrap">Dist</th>
                                <th className="py-2 pr-4 font-medium whitespace-nowrap">File</th>
                                <th className="py-2 pr-4 font-medium whitespace-nowrap">Size</th>
                                <th className="py-2 font-medium whitespace-nowrap">IP</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row) => (
                                <tr key={row.id} className="border-b border-gray-100 align-top">
                                  <td className="py-2 pr-4 whitespace-nowrap text-gray-800">
                                    {new Date(row.createdAt).toLocaleString()}
                                  </td>
                                  <td className="py-2 pr-4 text-gray-800">{row.userName}</td>
                                  <td className="py-2 pr-4 text-gray-700">{row.userTitle}</td>
                                  <td className="py-2 pr-4 break-all text-gray-700">{row.userEmail}</td>
                                  <td className="py-2 pr-4 whitespace-nowrap">{row.squadronNumber}</td>
                                  <td className="py-2 pr-4 whitespace-nowrap">{row.districtNumber}</td>
                                  <td className="py-2 pr-4 font-mono text-xs break-all">{row.fileName}</td>
                                  <td className="py-2 pr-4 whitespace-nowrap">{formatBytes(row.fileSize)}</td>
                                  <td className="py-2 text-gray-500 font-mono text-xs whitespace-nowrap">
                                    {row.submitterIp ?? '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
