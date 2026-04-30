import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, LogOut, Menu, Calendar } from 'lucide-react';
import NotificationBell from '../shared/NotificationBell';

import { UserRole } from '../../types/enums';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const dashboardLink =
    user?.role === UserRole.ADMIN
      ? '/admin'
      : user?.role === UserRole.PRIEST
        ? '/priest/dashboard'
        : '/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass bg-white/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black tracking-tighter text-indigo-600">
            GURUJI
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link to="/search" className="hover:text-indigo-600 transition-colors">
              Find Priest
            </Link>
            <Link to="/ceremonies" className="hover:text-indigo-600 transition-colors">
              Ceremonies
            </Link>
            {!user && (
              <Link to="/become-a-priest" className="hover:text-indigo-600 transition-colors">
                Become a Priest
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
              <div className="group relative">
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-all">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                    {user?.name.first[0]}
                    {user?.name.last[0]}
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 glass rounded-2xl overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <p className="font-bold text-sm text-slate-900">
                      {user?.name.first} {user?.name.last}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      {user?.role}
                    </p>
                  </div>
                  <div className="p-2 bg-white">
                    <Link
                      to={dashboardLink}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                    >
                      <Calendar size={16} /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                    >
                      <User size={16} /> My Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-all mt-1"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-secondary py-2 px-4 text-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-sm shadow-none">
                Get Started
              </Link>
            </div>
          )}
          <button className="md:hidden p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
