import React, { useEffect, useState } from 'react';
import { useAdmin, IAdminAnalytics } from '../../hooks/useAdmin';
import { IPriestProfile } from '../../types/priest';
import { IBooking } from '../../types/booking';
import StatusBadge from '../../components/shared/StatusBadge';
import { Users, UserCheck, IndianRupee, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/cn';

const AdminDashboard: React.FC = () => {
  const { getAnalyticsOverview, getTopPriests, getBookings, loading } = useAdmin();
  const [stats, setStats] = useState<IAdminAnalytics | null>(null);
  const [topPriests, setTopPriests] = useState<IPriestProfile[]>([]);
  const [recentBookings, setRecentBookings] = useState<IBooking[]>([]);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      const [analyticsData, priestsData, bookingsData] = await Promise.all([
        getAnalyticsOverview(),
        getTopPriests(5),
        getBookings({ limit: 5 }),
      ]);

      setStats(analyticsData);
      setTopPriests(priestsData);
      setRecentBookings(bookingsData.data);
    };

    void loadData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: 'Total Revenue',
            value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
            icon: IndianRupee,
            color: 'bg-emerald-500',
          },
          {
            label: 'Active Priests',
            value: stats?.totalPriests || 0,
            icon: UserCheck,
            color: 'bg-blue-500',
          },
          {
            label: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'bg-indigo-500',
          },
          {
            label: 'New This Month',
            value: stats?.newUsersThisMonth || 0,
            icon: TrendingUp,
            color: 'bg-amber-500',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card p-6 border-none bg-white shadow-sm flex items-center gap-4"
          >
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Bookings</h2>
            <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 uppercase">
                      {booking.bookingNumber}
                    </span>
                    <span className="text-xs text-slate-500">{booking.ceremony.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ₹{booking.pricing.totalAmount}
                    </p>
                    <StatusBadge status={booking.status} className="mt-1" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-slate-400 italic">No recent bookings</p>
            )}
          </div>
        </section>

        <section className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Top Performing Priests</h2>
            <TrendingUp size={20} className="text-indigo-600" />
          </div>
          <div className="space-y-6">
            {topPriests.length > 0 ? (
              topPriests.map((priest) => (
                <div key={priest.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                    {priest.user?.avatar ? (
                      <img
                        src={priest.user.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 bg-slate-50">
                        {priest.user?.name?.first?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      {priest.user?.name?.first} {priest.user?.name?.last}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {priest.experienceYears} Years Exp • {priest.rating?.average || 0} rating
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">
                      ₹{priest.totalEarnings?.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Earnings</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-slate-400 italic">No priest data available</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
