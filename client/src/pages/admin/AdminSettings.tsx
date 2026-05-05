import React from 'react';
import { Settings, Shield, Bell, CreditCard, Database, Globe } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const sections = [
    {
      title: 'Platform Configuration',
      icon: Settings,
      description: 'Main platform settings, maintenance mode, and SEO defaults.',
    },
    {
      title: 'Security & Access',
      icon: Shield,
      description: 'Admin role permissions, IP whitelisting, and audit logs.',
    },
    {
      title: 'Notification Templates',
      icon: Bell,
      description: 'Edit email and in-app notification templates for all workflows.',
    },
    {
      title: 'Payment Gateway',
      icon: CreditCard,
      description: 'Configure Razorpay keys, platform fees, and refund policies.',
    },
    {
      title: 'System Health',
      icon: Database,
      description: 'Database status, storage usage, and cache management.',
    },
    {
      title: 'Regional Settings',
      icon: Globe,
      description: 'Manage supported cities, states, and ceremony categories.',
    },
  ];

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500">Fine-tune platform behavior and manage core infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="card p-6 cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mb-4">
              <section.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{section.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{section.description}</p>
            <div className="mt-6 flex items-center text-xs font-bold text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Configure Now →
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-indigo-600 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-200">
        <div>
          <h2 className="text-2xl font-bold mb-2">Platform Maintenance</h2>
          <p className="text-indigo-100 text-sm max-w-md">
            Enable maintenance mode to prevent new bookings during system upgrades. All active
            sessions will remain unaffected.
          </p>
        </div>
        <button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shrink-0">
          Enable Maintenance Mode
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
