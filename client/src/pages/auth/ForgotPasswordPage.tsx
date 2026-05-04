import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { Mail } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email) return;

    const result = await forgotPassword(email);
    if (result.success) {
      setIsSubmitted(true);
      toast.success('Reset link sent to your email');
    } else {
      toast.error(result.message || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 text-center">
        {!isSubmitted ? (
          <>
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
            <p className="text-slate-500 mb-8">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn-primary w-full mt-4" disabled={isLoading}>
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
            <p className="text-slate-500 mb-8">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox
              and spam folder.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Didn't receive it? Try again
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link to="/login" className="text-slate-500 hover:text-slate-900 transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
