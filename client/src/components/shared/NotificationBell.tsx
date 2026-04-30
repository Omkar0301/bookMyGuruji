import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Booking Confirmed',
      message: 'Your wedding booking is confirmed.',
      time: '2h ago',
      isRead: false,
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Advance payment of ₹2100 received.',
      time: '5h ago',
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <Bell size={22} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] text-white items-center justify-center font-bold">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 glass rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            <button className="text-xs text-indigo-600 font-semibold hover:underline">
              Mark all as read
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto bg-white/50">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer',
                    !n.isRead && 'bg-indigo-50/30'
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                No new notifications
              </div>
            )}
          </div>

          <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
            <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
