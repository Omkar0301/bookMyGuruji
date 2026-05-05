import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { IPriestProfile } from '../../types/priest';
import { Check, X, FileText, User } from 'lucide-react';

const AdminVerifications: React.FC = () => {
  const { getVerifications, approveVerification, rejectVerification, loading } = useAdmin();
  const [verifications, setVerifications] = useState<IPriestProfile[]>([]);
  const [selectedPriest, setSelectedPriest] = useState<IPriestProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    void loadVerifications();
  }, []);

  const loadVerifications = async (): Promise<void> => {
    const data = await getVerifications();
    setVerifications(data);
  };

  const handleApprove = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to approve this priest?')) {
      const success = await approveVerification(id);
      if (success) void loadVerifications();
    }
  };

  const handleReject = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (selectedPriest) {
      const success = await rejectVerification(selectedPriest.id, rejectReason);
      if (success) {
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedPriest(null);
        void loadVerifications();
      }
    }
  };

  if (loading && verifications.length === 0) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Priest Verifications</h1>
          <p className="text-slate-500">Review and approve priest registration requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {verifications.length > 0 ? (
          verifications.map((priest) => (
            <div key={priest.id} className="card p-6 flex flex-col lg:flex-row gap-6">
              <div className="flex items-center gap-4 lg:w-1/4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {priest.user.avatar ? (
                    <img
                      src={priest.user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-slate-300" size={32} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {priest.user.name.first} {priest.user.name.last}
                  </h3>
                  <p className="text-xs text-slate-500">{priest.user.email}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Experience
                  </p>
                  <p className="text-sm font-medium">{priest.experienceYears} Years</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Languages
                  </p>
                  <p className="text-sm font-medium">{priest.languages.join(', ')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Certificates
                  </p>
                  <div className="flex gap-2 mt-1">
                    {priest.certificates.map((cert, idx: number) => (
                      <a
                        key={idx}
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        title={cert.name}
                      >
                        <FileText size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:w-1/4 justify-end">
                <button
                  onClick={() => {
                    setSelectedPriest(priest);
                    setShowRejectModal(true);
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={() => handleApprove(priest.id)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Check size={18} /> Approve
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <User className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No pending verifications found</p>
          </div>
        )}
      </div>

      {showRejectModal && selectedPriest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-2 text-rose-600">Reject Application</h3>
            <p className="text-slate-500 text-sm mb-6">
              Provide a reason for rejecting the application from{' '}
              <b>{selectedPriest.user.name.first}</b>.
            </p>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="label">Rejection Reason</label>
                <textarea
                  className="input-field min-h-[120px]"
                  placeholder="e.g. Certificates are not clear or missing mandatory details..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  minLength={10}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerifications;
