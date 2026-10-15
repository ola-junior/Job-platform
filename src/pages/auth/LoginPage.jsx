import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, MailWarning } from 'lucide-react';
import { loginThunk, logout } from '../../features/auth/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { isAllowedAdminEmail } from '../../utils/adminAccess';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function LoginPage({ adminOnly = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPass, setShowPass] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const from = adminOnly ? '/admin' : location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setUnverifiedEmail(null);
    if (adminOnly && !isAllowedAdminEmail(data.email)) {
      toast.error('This email is not authorized for admin access.');
      return;
    }
    const result = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(result)) {
      if (adminOnly && (result.payload.user?.role !== 'ADMIN' || !isAllowedAdminEmail(result.payload.user?.email))) {
        dispatch(logout());
        toast.error('This account is not authorized for admin access.');
        return;
      }
      toast.success('Welcome back!');
      const role = result.payload.user?.role;
      const redirect = role === 'ADMIN' ? '/admin' : role === 'EMPLOYER' ? '/employer/dashboard' : from;
      navigate(redirect, { replace: true });
    } else {
      const errData = result.payload;
      if (errData?.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(data.email);
      } else {
        toast.error(errData?.message || 'Login failed');
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: unverifiedEmail });
      toast.success('Verification email sent! Check your inbox.');
    } catch { toast.error('Failed to resend. Try again.'); }
    finally { setResending(false); }
  };

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{adminOnly ? 'Admin sign in' : 'Welcome back'}</h1>
        <p className="text-slate-500 text-sm mt-1">{adminOnly ? 'Authorized administrators only' : 'Sign in to your account'}</p>
      </div>

      {unverifiedEmail && (
        <div className="mb-5 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
          <MailWarning className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Email not verified</p>
            <p className="text-xs text-yellow-700 mt-0.5 mb-2">Please verify your email address before logging in. Check your inbox or resend the link.</p>
            <button onClick={handleResend} disabled={resending}
              className="text-xs font-semibold text-yellow-800 underline hover:text-yellow-900 disabled:opacity-50">
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-group">
          <label className="label">Email address</label>
          <input {...register('email')} type="email" placeholder="you@example.com" className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>
        <div className="form-group">
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm font-semibold">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {adminOnly ? (
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to standard sign in</Link>
        </p>
      ) : (
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">Create account</Link>
          <span className="mx-2">·</span>
          <Link to="/admin/login" className="text-primary-600 font-medium hover:underline">Admin sign in</Link>
        </p>
      )}
    </div>
  );
}
