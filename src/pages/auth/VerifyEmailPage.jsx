import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    api.get(`/auth/verify/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  const handleResend = async () => {
    if (!email) return toast.error('Please enter your email address');
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') return (
    <div className="card p-10 text-center">
      <Loader className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
      <p className="text-slate-600 font-medium">Verifying your email...</p>
    </div>
  );

  if (status === 'success') return (
    <div className="card p-10 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
      <p className="text-slate-500 text-sm mb-6">Your email has been verified successfully. You can now log in.</p>
      <Link to="/login" className="btn-primary w-full justify-center py-3">Continue to Login</Link>
    </div>
  );

  return (
    <div className="card p-10">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Link Expired</h2>
        <p className="text-slate-500 text-sm">This verification link has expired or already been used. Enter your email to get a new one.</p>
      </div>

      <div className="space-y-3">
        <div className="form-group">
          <label className="label">Your email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
        </div>
        <button
          onClick={handleResend}
          disabled={resending || !email}
          className="btn-primary w-full py-3 gap-2 justify-center disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Sending...' : 'Resend Verification Email'}
        </button>
        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="text-primary-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
