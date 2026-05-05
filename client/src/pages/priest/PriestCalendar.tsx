import React, { useEffect, useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { BookingStatus } from '../../types/enums';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import StatusBadge from '../../components/shared/StatusBadge';

const PriestCalendar: React.FC = () => {
  const { bookings: rawBookings, fetchMyBookings } = useBookings();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const bookings = rawBookings as unknown as Array<{
    id: string;
    status: BookingStatus;
    scheduledDate: string;
    scheduledTime: string;
    ceremony: { name: string };
    venue: { city: string };
  }>;

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const getDaysInMonth = (year: number, month: number): number =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number): number =>
    new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth());
  const firstDay = getFirstDayOfMonth(selectedDate.getFullYear(), selectedDate.getMonth());

  const prevMonth = (): void =>
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const nextMonth = (): void =>
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));

  const bookingsOnDate = (day: number): typeof bookings => {
    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toDateString();
    return bookings.filter((b) => new Date(b.scheduledDate).toDateString() === d);
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Calendar</h1>
          <p className="text-slate-500">Visualise your schedule and upcoming ceremonies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {selectedDate.toLocaleString('default', { month: 'long' })}{' '}
                {selectedDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div
                  key={d}
                  className="bg-slate-50 p-3 text-center text-xs font-bold text-slate-500 uppercase"
                >
                  {d}
                </div>
              ))}

              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white p-4 h-24 md:h-32"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dailyBookings = bookingsOnDate(day);
                const isToday =
                  new Date().toDateString() ===
                  new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toDateString();

                return (
                  <div
                    key={day}
                    className={cn(
                      'bg-white p-2 h-24 md:h-32 border-t border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer',
                      isToday && 'bg-indigo-50/30'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1',
                        isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                      )}
                    >
                      {day}
                    </span>
                    <div className="space-y-1">
                      {dailyBookings.map((b) => (
                        <div
                          key={b.id}
                          className="text-[10px] p-1 rounded bg-indigo-100 text-indigo-700 font-bold truncate"
                        >
                          {b.ceremony.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Agenda</h2>
          <div className="space-y-4">
            {bookings
              .filter((b) => new Date(b.scheduledDate) >= new Date())
              .sort(
                (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
              )
              .slice(0, 5)
              .map((booking) => (
                <div key={booking.id} className="card p-4 border-l-4 border-l-indigo-600">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900">{booking.ceremony.name}</h4>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <CalendarIcon size={12} />
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {booking.scheduledTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      {booking.venue.city}
                    </div>
                  </div>
                </div>
              ))}
            {bookings.length === 0 && (
              <p className="text-slate-400 italic text-center py-10">No upcoming events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriestCalendar;
