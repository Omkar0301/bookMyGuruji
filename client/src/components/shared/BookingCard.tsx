import React from 'react';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BookingStatus, CeremonyType } from '../../types/enums';
import StatusBadge from './StatusBadge';

interface BookingCardProps {
  id: string;
  bookingNumber: string;
  ceremony: CeremonyType | string;
  date: string;
  time: string;
  status: BookingStatus;
  priestName: string;
}

const BookingCard: React.FC<BookingCardProps> = ({
  id,
  bookingNumber,
  ceremony,
  date,
  time,
  status,
  priestName,
}) => {
  return (
    <div className="card p-5 group hover:border-indigo-200 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            #{bookingNumber}
          </span>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {ceremony}
          </h3>
          <p className="text-sm text-slate-500">with {priestName}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar size={16} className="text-indigo-500" />
          {date}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock size={16} className="text-indigo-500" />
          {time}
        </div>
      </div>

      <Link
        to={`/bookings/${id}`}
        className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-all"
      >
        View Details
        <ChevronRight size={14} />
      </Link>
    </div>
  );
};

export default BookingCard;
