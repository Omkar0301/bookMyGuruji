import React, { useEffect, useState } from 'react';
import { usePriests } from '../../hooks/usePriests';
import { useBookings } from '../../hooks/useBookings';
import { IPriestProfile } from '../../types/priest';
import { BookingStatus } from '../../types/enums';
import {
  IndianRupee,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const PriestEarnings: React.FC = () => {
  const { getMyProfile } = usePriests();
  const { bookings: rawBookings, loading: bookingsLoading, fetchMyBookings } = useBookings();
  const [profile, setProfile] = useState<IPriestProfile | null>(null);

  const bookings = rawBookings as unknown as Array<{
    id: string;
    status: BookingStatus;
    pricing: { totalAmount: number };
    scheduledDate: string;
    ceremony: { name: string };
  }>;

  useEffect(() => {
    getMyProfile().then(setProfile);
    fetchMyBookings();
  }, []);

  const completedBookings = bookings.filter((b) => b.status === BookingStatus.COMPLETED);
  const totalRevenue = completedBookings.reduce((acc, curr) => acc + curr.pricing.totalAmount, 0);

  const stats = [
    {
      label: 'Total Earnings',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-600',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Pending Payout',
      value: `₹${profile?.pendingPayout?.toLocaleString() || '0'}`,
      icon: Wallet,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Completed Events',
      value: completedBookings.length.toString(),
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Earnings & Payouts</h1>
        <p className="text-slate-500">Track your revenue and manage your bank details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="card p-6 border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={cn('p-3 rounded-xl', stat.color)}>
                <stat.icon size={24} />
              </div>
              {stat.trend && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full',
                    stat.trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  )}
                >
                  {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-slate-500">{stat.label}</span>
              <h2 className="text-2xl font-bold text-slate-900">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
            <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
          </div>

          <div className="space-y-3">
            {bookingsLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>
                ))}
              </div>
            ) : completedBookings.length > 0 ? (
              completedBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="card p-4 border-slate-50 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{booking.ceremony.name}</h4>
                      <p className="text-xs text-slate-400">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600">
                      +₹{booking.pricing.totalAmount}
                    </span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Settled
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 italic">No completed bookings yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Payout Details</h2>
          <div className="card p-6 bg-indigo-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Wallet size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Primary Payout Method
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs opacity-60">Account Holder</p>
                <p className="font-bold tracking-wide uppercase">
                  {profile?.bankDetails?.accountHolder || 'Not Set'}
                </p>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-60">Bank Account</p>
                  <p className="font-mono tracking-widest">
                    {profile?.bankDetails?.accountNumber || '**** **** ****'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60">IFSC</p>
                  <p className="font-mono">{profile?.bankDetails?.ifscCode || '---'}</p>
                </div>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-xl"></div>
          </div>

          <button className="w-full btn-secondary py-3 text-sm font-bold">
            Update Payout Information
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriestEarnings;
