import React from 'react';

type Status = 'Not Started' | 'In Progress' | 'Complete' | 'Coming Soon';

interface StatusBadgeProps {
  status: Status;
  label: string;
}

const statusStyles: { [key in Status]: string } = {
  'Not Started': 'bg-gray-700 text-gray-300',
  'In Progress': 'bg-yellow-600 text-white',
  'Complete': 'bg-green-600 text-white',
  'Coming Soon': 'bg-blue-600 text-white',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[status]}`}>
        {status}
      </span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
};

export default StatusBadge;
