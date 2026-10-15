import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <KeyRound className="w-7 h-7 text-primary-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">Set new password</h1>
      <p className="text-slate-500 text-sm mb-6 text-center">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="label">New Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="input pr-10"
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Confirm Password</label>
          <input
            type={showPw ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            placeholder="Repeat your password"
            className="input"
          />
        </div>

        {password && (
          <div className="space-y-1">
            {[
              { ok: password.length >= 8, label: 'At least 8 characters' },
              { ok: /[A-Z]/.test(password), label: 'One uppercase letter' },
              { ok: /[0-9]/.test(password), label: 'One number' },
            ].map(({ ok, label }) => (
              <p key={label} className={`text-xs flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-slate-400'}`}>
                <span>{ok ? '✅' : '○'}</span> {label}
              </p>
            ))}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="text-primary-600 hover:underline">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}
