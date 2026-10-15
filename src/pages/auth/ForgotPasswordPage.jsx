import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div className="card p-8 text-center">
      <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Mail className="w-7 h-7 text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
      <p className="text-slate-500 text-sm mb-6">If an account exists for <strong>{email}</strong>, we've sent a password reset link.</p>
      <Link to="/login" className="btn-primary w-full justify-center">Back to Login</Link>
    </div>
  );

  return (
    <div className="card p-8">
      <Link to="/login" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Reset your password</h1>
      <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="label">Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}
