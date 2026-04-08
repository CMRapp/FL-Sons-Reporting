import { REPORT_ORDER, REPORT_METADATA, REPORT_DOM_SLUG } from '@/app/lib/reports';

interface JumpBarProps {
  onSelect: (reportId: string) => void;
}

const reports = REPORT_ORDER.map((id) => ({
  id: `report-${REPORT_DOM_SLUG[id]}`,
  name: REPORT_METADATA[id].label,
}));

const JumpBar = ({ onSelect }: JumpBarProps) => {
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
