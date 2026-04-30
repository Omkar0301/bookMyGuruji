import React from 'react';
import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { CeremonyType } from '../../types/enums';
import { cn } from '../../utils/cn';

const PriestDashboard: React.FC = () => {
  const stats = [
    { label: "Today's Bookings", value: '2', icon: Clock, color: 'bg-blue-500' },
    { label: 'Pending Requests', value: '5', icon: Users, color: 'bg-amber-500' },
    { label: 'Total Earnings', value: '₹12,450', icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Monthly Target', value: '85%', icon: Calendar, color: 'bg-indigo-500' },
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
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                    <div>
                      <h4 className="font-bold">
                        {i === 1
                          ? CeremonyType.WEDDING
                          : i === 2
                            ? CeremonyType.PUJA
                            : CeremonyType.HAVAN}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Requested by Rahul Sharma • 2 days ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      Decline
                    </button>
                    <button className="px-4 py-2 text-sm font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-sm shadow-emerald-200 transition-all">
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="text-xl font-bold mb-6">Today's Schedule</h2>
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {[
                {
                  time: '09:00 AM',
                  event: CeremonyType.GRIHA_PRAVESH,
                  location: 'Sector 45, Gurgaon',
                },
                { time: '04:30 PM', event: CeremonyType.NAMKARAN, location: 'Janakpuri, Delhi' },
              ].map((item, i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-white border-4 border-indigo-600 rounded-full z-10"></div>
                  <span className="text-xs font-bold text-indigo-600">{item.time}</span>
                  <h4 className="font-bold text-slate-900">{item.event}</h4>
                  <p className="text-sm text-slate-500">{item.location}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PriestDashboard;
