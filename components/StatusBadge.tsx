import React from 'react';

type Status = 'Not Started' | 'In Progress' | 'Complete' | 'Coming Soon';

interface StatusBadgeProps {
  status: Status;
  label: string;
}

const statusConfig: { [key in Status]: { styles: string; icon: string } } = {
  'Not Started': { styles: 'border-gray-600 bg-gray-800 text-gray-400', icon: '–' },
  'In Progress': { styles: 'border-yellow-500 bg-yellow-900 text-yellow-300', icon: '⏳' },
  'Complete': { styles: 'border-green-500 bg-green-900 text-green-300', icon: '✓' },
  'Coming Soon': { styles: 'border-blue-500 bg-blue-900 text-blue-300', icon: '✨' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const { styles, icon } = statusConfig[status];
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className={`mr-2.5 flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold border ${styles}`}>
          {icon}
        </span>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles}`}>
        {status}
      </span>
    </div>
  );
};

export default StatusBadge;

