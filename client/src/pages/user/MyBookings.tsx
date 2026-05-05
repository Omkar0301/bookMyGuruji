import React, { useEffect } from 'react';
import { useBookings } from '../../hooks/useBookings';
import BookingCard from '../../components/shared/BookingCard';
import { IBooking } from '../../types/booking';

const MyBookings: React.FC = () => {
  const { bookings, loading, fetchMyBookings } = useBookings();

  useEffect(() => {
    void fetchMyBookings();
  }, []);

  const typedBookings = bookings as IBooking[];

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-1">Manage your ceremony schedules and status</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-slate-100 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : typedBookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {typedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              id={booking.id}
              bookingNumber={booking.bookingNumber || 'N/A'}
              ceremony={booking.ceremony.name}
              priestName={`${booking.priest.user.name.first} ${booking.priest.user.name.last}`}
              date={new Date(booking.scheduledDate).toLocaleDateString()}
              time={booking.scheduledTime}
              status={booking.status}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400">You haven't made any bookings yet.</p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
