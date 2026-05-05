import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { IBooking } from '../../types/booking';
import StatusBadge from '../../components/shared/StatusBadge';
import { Search, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const AdminBookings: React.FC = () => {
  const { getBookings, loading } = useAdmin();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    status: '',
    search: '',
  });

  useEffect(() => {
    void loadBookings();
  }, [params.page, params.status]);

  const loadBookings = async (): Promise<void> => {
    const result = await getBookings(params);
    setBookings(result.data);
    setTotal(result.total);
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    void loadBookings();
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Bookings</h1>
          <p className="text-slate-500">
            Monitor and manage all ceremony bookings across the platform
          </p>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border p-1 overflow-x-auto max-w-full">
          {['', 'pending', 'confirmed', 'completed', 'cancelled', 'disputed'].map((status) => (
            <button
              key={status}
              onClick={() => setParams({ ...params, status, page: 1 })}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                params.status === status
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              {status === '' ? 'ALL' : status.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by booking # or customer name..."
              className="input-field pl-10"
              value={params.search}
              onChange={(e) => setParams({ ...params, search: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary px-8">
            Search Bookings
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {loading && bookings.length === 0 ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="card p-0 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="lg:w-24 shrink-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    #{booking.bookingNumber}
                  </span>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{booking.ceremony.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Calendar size={12} />
                      {new Date(booking.scheduledDate).toLocaleDateString()} at{' '}
                      {booking.scheduledTime}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {booking.user.name.first[0]}
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {booking.user.name.first} {booking.user.name.last}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin size={12} />
                      {booking.venue.city}, {booking.venue.state}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-600">
                        P
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {booking.priest?.user?.name?.first} {booking.priest?.user?.name?.last}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-emerald-600 mt-1">
                      ₹{booking.pricing.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="lg:w-32 flex justify-end">
                  <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:gap-3 transition-all group-hover:text-indigo-700">
                    Details <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 italic">No bookings found matching your criteria.</p>
          </div>
        )}

        {total > params.limit && (
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-slate-500">
              Showing {(params.page - 1) * params.limit + 1} to{' '}
              {Math.min(params.page * params.limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                disabled={params.page === 1}
                onClick={() => setParams({ ...params, page: params.page - 1 })}
                className="px-4 py-2 bg-white border rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={params.page * params.limit >= total}
                onClick={() => setParams({ ...params, page: params.page + 1 })}
                className="px-4 py-2 bg-white border rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
