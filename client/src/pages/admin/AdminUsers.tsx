import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { User as IUser } from '../../features/auth/authSlice';
import { User, Search, UserX, UserCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

const AdminUsers: React.FC = () => {
  const { getUsers, activateUser, deactivateUser, loading } = useAdmin();
  const [users, setUsers] = useState<IUser[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    isActive: '',
  });

  useEffect(() => {
    void loadUsers();
  }, [params.page, params.role, params.isActive]);

  const loadUsers = async (): Promise<void> => {
    const result = await getUsers(params);
    setUsers(result.data);
    setTotal(result.total);
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    void loadUsers();
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean): Promise<void> => {
    const success = currentStatus ? await deactivateUser(id) : await activateUser(id);
    if (success) void loadUsers();
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage all registered users, priests, and administrators</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white rounded-xl shadow-sm border p-1 flex">
            {['', 'user', 'priest', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setParams({ ...params, role, page: 1 })}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold transition-all',
                  params.role === role
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                )}
              >
                {role === '' ? 'ALL' : role.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input-field pl-10"
              value={params.search}
              onChange={(e) => setParams({ ...params, search: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="input-field min-w-[150px]"
              value={params.isActive}
              onChange={(e) => setParams({ ...params, isActive: e.target.value, page: 1 })}
            >
              <option value="">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
            <button type="submit" className="btn-primary px-8">
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="card overflow-hidden border-none shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {user.name.first} {user.name.last}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-600'
                            : user.role === 'priest'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-blue-50 text-blue-600'
                        )}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            user.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                          )}
                        />
                        <span className="text-sm font-medium text-slate-600">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          user.isActive
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        )}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 italic">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > params.limit && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">
              Showing {(params.page - 1) * params.limit + 1} to{' '}
              {Math.min(params.page * params.limit, total)} of {total} users
            </p>
            <div className="flex gap-2">
              <button
                disabled={params.page === 1}
                onClick={() => setParams({ ...params, page: params.page - 1 })}
                className="px-4 py-2 text-xs font-bold bg-white border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={params.page * params.limit >= total}
                onClick={() => setParams({ ...params, page: params.page + 1 })}
                className="px-4 py-2 text-xs font-bold bg-white border rounded-lg disabled:opacity-50"
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

export default AdminUsers;
