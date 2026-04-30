import React, { useState } from 'react';
import Calendar from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface AvailabilityCalendarProps {
  onDateSelect: (date: Date) => void;
  blockedDates?: Date[];
  availableDates?: Date[];
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  onDateSelect,
  blockedDates = [],
  availableDates = [],
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleDateChange = (date: Date | null): void => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  return (
    <div className="availability-calendar-wrapper">
      <style>{`
        .react-datepicker {
          border: none;
          font-family: inherit;
          width: 100%;
          display: block;
        }
        .react-datepicker__month-container {
          width: 100%;
        }
        .react-datepicker__header {
          background: transparent;
          border: none;
        }
        .react-datepicker__day--selected {
          @apply !bg-indigo-600 !rounded-lg;
        }
        .react-datepicker__day:hover {
          @apply !bg-indigo-50 !text-indigo-600 !rounded-lg;
        }
        .react-datepicker__day-name {
          @apply text-slate-400 font-bold uppercase text-[10px];
        }
      `}</style>
      <div className="card p-4 overflow-hidden">
        <Calendar
          selected={selectedDate}
          onChange={handleDateChange}
          inline
          minDate={new Date()}
          highlightDates={[{ 'available-dates': availableDates }]}
          excludeDates={blockedDates}
        />

        <div className="mt-4 flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t pt-4 border-slate-50">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
            Selected
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-indigo-100 rounded-full"></div>
            Available
          </div>
          <div className="flex items-center gap-1 opacity-50">
            <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
            Blocked
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
