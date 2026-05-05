import React, { useEffect, useState } from 'react';
import { useAdmin, IDispute } from '../../hooks/useAdmin';
import { AlertTriangle, CheckCircle, Info, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';

const AdminDisputes: React.FC = () => {
  const { getDisputes, resolveDispute, loading } = useAdmin();
  const [disputes, setDisputes] = useState<IDispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<IDispute | null>(null);
  const [resolutionData, setResolutionData] = useState({
    resolution: 'FAVOUR_USER',
    note: '',
    refundPercent: 100,
  });

  useEffect(() => {
    void loadDisputes();
  }, []);

  const loadDisputes = async (): Promise<void> => {
    const data = await getDisputes();
    setDisputes(data);
  };

  const handleResolve = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!selectedDispute) return;

    const success = await resolveDispute(
      selectedDispute.id,
      resolutionData.resolution,
      resolutionData.note,
      resolutionData.resolution === 'SPLIT' ? resolutionData.refundPercent : undefined
    );

    if (success) {
      setSelectedDispute(null);
      void loadDisputes();
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dispute Resolution</h1>
        <p className="text-slate-500">Review and resolve disputes between users and priests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {loading && disputes.length === 0 ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : disputes.length > 0 ? (
            disputes.map((dispute) => (
              <div
                key={dispute.id}
                onClick={() => setSelectedDispute(dispute)}
                className={cn(
                  'w-full text-left p-4 rounded-2xl border transition-all mb-3',
                  selectedDispute?.id === dispute.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-100 hover:border-indigo-200'
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      #{dispute.bookingNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{dispute.ceremony.name}</h3>
                  </div>
                  <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertTriangle size={14} /> DISPUTED
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      User
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {dispute.user.name.first} {dispute.user.name.last}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Priest
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {dispute.priest.user.name.first} {dispute.priest.user.name.last}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MessageSquare size={14} />
                  <span>Dispute opened on {new Date(dispute.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4 opacity-20" />
              <p className="text-slate-400 italic">No active disputes to resolve. Great job!</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedDispute ? (
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Resolve Dispute</h2>

              <div className="mb-6 p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Booking Info
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Paid:</span>
                    <span className="font-bold text-slate-900">
                      ₹{selectedDispute.pricing.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Platform Fee:</span>
                    <span className="font-bold text-slate-900 text-indigo-600">
                      ₹{selectedDispute.pricing.commission}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleResolve} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Resolution Path
                  </label>
                  <select
                    className="input-field"
                    value={resolutionData.resolution}
                    onChange={(e) =>
                      setResolutionData({ ...resolutionData, resolution: e.target.value })
                    }
                  >
                    <option value="FAVOUR_USER">Favour User (Full Refund)</option>
                    <option value="FAVOUR_PRIEST">Favour Priest (Full Payout)</option>
                    <option value="SPLIT">Split Refund/Payout</option>
                  </select>
                </div>

                {resolutionData.resolution === 'SPLIT' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      User Refund Percentage ({resolutionData.refundPercent}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      value={resolutionData.refundPercent}
                      onChange={(e) =>
                        setResolutionData({
                          ...resolutionData,
                          refundPercent: parseInt(e.target.value),
                        })
                      }
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase">
                      <span>Priest Favoured</span>
                      <span>User Favoured</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Resolution Note (Internal)
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Provide justification for this resolution..."
                    value={resolutionData.note}
                    onChange={(e) => setResolutionData({ ...resolutionData, note: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 shadow-lg shadow-indigo-200"
                >
                  {loading ? 'Processing...' : 'Finalize Resolution'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card p-10 text-center bg-slate-50/50 border-dashed border-2">
              <Info size={32} className="text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-400">
                Select a dispute from the list to view details and resolve it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDisputes;
