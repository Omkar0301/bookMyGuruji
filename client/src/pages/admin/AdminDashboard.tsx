import { BookingStatus } from '../../types/enums';

const AdminDashboard: React.FC = () => {
  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Revenue', value: '₹4,52,000' },
          { label: 'Active Priests', value: '124' },
          { label: 'Total Users', value: '1,850' },
          { label: 'Pending Verifications', value: '12' },
        ].map((stat) => (
          <div key={stat.label} className="card p-6 bg-slate-900 text-white border-none">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {stat.label}
            </p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="card p-6">
          <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
              >
                <span className="text-sm font-medium">#BK-10{i}</span>
                <span className="text-sm text-slate-500">₹5,100</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                  {BookingStatus.PAID}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-bold mb-4">Top Performing Priests</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold">Panditji Name {i}</h4>
                  <p className="text-[10px] text-slate-500">4.9 rating • 12 bookings this week</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
