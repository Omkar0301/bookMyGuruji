import React from 'react';

const UserDashboard: React.FC = () => {
  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="card p-6">
            <h2 className="text-xl font-bold mb-4">Upcoming Bookings</h2>
            <div className="text-center py-10 text-slate-400">No upcoming bookings</div>
          </section>
        </div>
        <div className="space-y-6">
          <section className="card p-6 bg-indigo-600 text-white border-none">
            <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
            <p className="text-indigo-100 mb-4 text-sm">
              Find and book a priest for your next ceremony.
            </p>
            <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl">
              Book Now
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
