import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { Check, X } from 'lucide-react';

interface PriestVerification {
  id: string;
  user: {
    name: { first: string; last: string };
    email: string;
  };
  specialisations: string[];
  experience: number;
}

const AdminVerifications: React.FC = () => {
  const { getVerifications, approvePriest, rejectPriest, loading } = useAdmin();
  const [verifications, setVerifications] = useState<PriestVerification[]>([]);

  const loadData = async (): Promise<void> => {
    const data = await getVerifications();
    setVerifications(data as unknown as PriestVerification[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to approve this priest?')) {
      const success = await approvePriest(id);
      if (success) loadData();
    }
  };

  const handleReject = async (id: string): Promise<void> => {
    const reason = window.prompt('Please enter the reason for rejection (min 10 chars):');
    if (reason) {
      const success = await rejectPriest(id, reason);
      if (success) loadData();
    }
  };

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Priest Verifications</h1>
          <p className="text-slate-500 mt-1">Review and approve priest applications</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse h-24"></div>
          ))}
        </div>
      ) : verifications.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Priest
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Specialisations
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Experience
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {verifications.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {p.user.name.first[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {p.user.name.first} {p.user.name.last}
                        </div>
                        <div className="text-xs text-slate-400">{p.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {p.specialisations.slice(0, 2).map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.experience} Years</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleReject(p.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400">No pending verifications at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default AdminVerifications;
