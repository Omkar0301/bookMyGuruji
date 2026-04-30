import React from 'react';
import { cn } from '../../utils/cn';

import { BookingStatus } from '../../types/enums';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusStyles: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'bg-amber-50 text-amber-600 border-amber-100',
  [BookingStatus.CONFIRMED]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  [BookingStatus.COMPLETED]: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  [BookingStatus.CANCELLED]: 'bg-rose-50 text-rose-600 border-rose-100',
  [BookingStatus.REJECTED]: 'bg-slate-100 text-slate-600 border-slate-200',
  [BookingStatus.ONGOING]: 'bg-blue-50 text-blue-600 border-blue-100',
  [BookingStatus.PAID]: 'bg-teal-50 text-teal-600 border-teal-100',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <span
      className={cn(
        'px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-300',
        statusStyles[status] || 'bg-slate-100 text-slate-600 border-slate-200',
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
