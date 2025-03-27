'use client';

import { useRef } from 'react';

interface JumpBarProps {
  onSelect: (reportId: string) => void;
}

const JumpBar = ({ onSelect }: JumpBarProps) => {
  const reports = [
    { id: 'report-ncsr', name: 'National Consolidated Squadron Report (NCSR)' },
    { id: 'report-dcsr', name: 'Detachment Consolidated Squadron Report (DCSR)' },
    { id: 'report-var', name: 'Veterans Affairs & Rehabilitation (VA&R)' },
    { id: 'report-vavs-voy', name: 'VAVS Volunteer of the Year' },
    { id: 'report-americanism', name: 'Americanism' },
    { id: 'report-cy', name: 'Children & Youth (C&Y)' },
    { id: 'report-sir', name: 'Squadron Information Report (SIR)' },
    { id: 'report-sdr', name: 'Annual Squadron Data Report (SDR)' },
    { id: 'report-soc', name: 'Squadron Officer Change (SOC)' },
    { id: 'report-dor', name: 'District Officers Report (DOR)' }
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <label htmlFor="report-select" className="text-sm font-medium text-black uppercase whitespace-nowrap">
          Jump to Report:
        </label>
        <select
          id="report-select"
          onChange={(e) => onSelect(e.target.value)}
          className="w-full sm:flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm sm:text-base"
        >
          <option value="">Select a report...</option>
          {reports.map((report) => (
            <option key={report.id} value={report.id}>
              {report.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default JumpBar; 