import React, { useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { useBookings } from '../../hooks/useBookings';
import { cn } from '../../utils/cn';

const PriestDashboard: React.FC = () => {
  const { bookings: rawBookings, loading, fetchMyBookings, updateBookingStatus } = useBookings();
  const bookings = rawBookings as unknown as Array<{
    id: string;
    status: string;
    user: {
      name: { first: string; last: string };
      email: string;
    };
    ceremony: { name: string };
    createdAt: string;
    scheduledDate: string;
    scheduledTime: string;
    venue: { city: string; state: string };
    pricing: { totalAmount: number };
  }>;

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');

  const stats = [
    {
      label: "Today's Bookings",
      value: confirmedBookings.length.toString(),
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Requests',
      value: pendingRequests.length.toString(),
      icon: Users,
      color: 'bg-amber-500',
    },
    {
      label: 'Total Earnings',
      value: `₹${bookings.reduce((acc, b) => acc + (b.status === 'completed' ? (b.pricing as { totalAmount: number }).totalAmount : 0), 0)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    { label: 'Success Rate', value: '100%', icon: Calendar, color: 'bg-indigo-500' },
  ];

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Priest Dashboard</h1>
          <p className="text-slate-500">Welcome back, Panditji. Here's your schedule for today.</p>
        </div>
        <button className="btn-primary">Update Availability</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6 flex items-center gap-4">
            <div className={cn('p-3 rounded-xl text-white', stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <section className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Upcoming Requests</h2>
              <button className="text-sm text-indigo-600 font-semibold hover:underline">
                View All
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="p-6 animate-pulse space-y-3">
                  <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {booking.user.name.first[0]}
                      </div>
                      <div>
                        <h4 className="font-bold">{booking.ceremony.name}</h4>
                        <p className="text-xs text-slate-500">
                          Requested by {booking.user.name.first} {booking.user.name.last} •{' '}
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-indigo-600 font-semibold mt-1">
                          {new Date(booking.scheduledDate).toLocaleDateString()} at{' '}
                          {booking.scheduledTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateBookingStatus(booking.id, 'decline', 'Busy on this day')
                        }
                        className="px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'confirm')}
                        className="px-4 py-2 text-sm font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-sm shadow-emerald-200 transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-400 italic">No pending requests</div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="text-xl font-bold mb-6">Today's Schedule</h2>
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {confirmedBookings.length > 0 ? (
                confirmedBookings.slice(0, 5).map((booking, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 bg-white border-4 border-indigo-600 rounded-full z-10"></div>
                    <span className="text-xs font-bold text-indigo-600">
                      {booking.scheduledTime}
                    </span>
                    <h4 className="font-bold text-slate-900">{booking.ceremony.name}</h4>
                    <p className="text-sm text-slate-500">
                      {booking.venue.city}, {booking.venue.state}
                    </p>
                  </div>
                ))
              ) : (
                <div className="pl-8 text-sm text-slate-400 italic">
                  No confirmed bookings today
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PriestDashboard;
