import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { Lock } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const result = await resetPassword(token, formData.password);
    if (result.success) {
      toast.success('Password reset successfully!');
      navigate('/login');
    } else {
      toast.error(result.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
        <p className="text-slate-500 mb-8">
          Enter your new password below to reset your account access.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-left text-sm font-medium text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-left text-sm font-medium text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button className="btn-primary w-full mt-4" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link to="/login" className="text-slate-500 hover:text-slate-900 transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
