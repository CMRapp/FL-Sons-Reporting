'use client';

import { useState } from 'react';
import { getServiceYear } from '@/app/utils/serviceYear';

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

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [adminName, setAdminName] = useState('');
  const serviceYear = getServiceYear();

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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin password"
                required
              />
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-800">
                Report Email Configuration
              </h1>
              <p className="text-gray-600 mt-2">Service Year: {serviceYear}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {config?.lastUpdated && (
            <div className="text-sm text-gray-500 mb-4">
              Last updated: {new Date(config.lastUpdated).toLocaleString()} by {config.updatedBy}
            </div>
          )}

          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Report Email Addresses
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Configure the email addresses where each report type should be sent.
          </p>

          {config && (
            <div className="space-y-4">
              {Object.entries(config.reportEmails).map(([id, report]) => (
                <div key={id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {report.reportName}
                      </h3>
                      <p className="text-sm text-gray-600">{report.fullName}</p>
                    </div>
                  </div>
                  <input
                    type="email"
                    value={report.email}
                    onChange={(e) => handleEmailChange(id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading || !adminName.trim()}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
