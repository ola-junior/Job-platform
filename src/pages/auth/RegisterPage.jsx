import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Briefcase, Building2, Check } from 'lucide-react';
import { registerThunk } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const schema = yup.object({
  fullName: yup.string().min(2, 'At least 2 characters').required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().optional(),
  password: yup.string().min(8, 'Minimum 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase, and number').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
  companyName: yup.string().when('role', { is: 'EMPLOYER', then: (s) => s.required('Company name is required') }),
});

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') === 'employer' ? 'EMPLOYER' : 'JOB_SEEKER');
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    context: { role },
  });

  const password = watch('password', '');
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  const onSubmit = async (data) => {
    const result = await dispatch(registerThunk({ ...data, role }));
    if (registerThunk.fulfilled.match(result)) {
      toast.success('Account created! Welcome to JobPlatform 🎉');
      navigate(role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  const inputClass = (err) => `input ${err ? 'border-red-400 focus:ring-red-400' : ''}`;

  return (
    <div className="card p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-slate-500 text-sm mt-1">Join thousands of professionals today</p>
      </div>

      {/* Role Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1 mb-6">
        {[
          { value: 'JOB_SEEKER', label: 'Job Seeker', icon: Briefcase },
          { value: 'EMPLOYER', label: 'Employer', icon: Building2 },
        ].map(({ value, label, icon: Icon }) => (
          <button key={value} type="button" onClick={() => setRole(value)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === value ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group col-span-2">
            <label className="label">Full name</label>
            <input {...register('fullName')} type="text" placeholder="Jane Smith" className={inputClass(errors.fullName)} />
            {errors.fullName && <p className="error-text">{errors.fullName.message}</p>}
          </div>
        </div>
        <div className="form-group">
          <label className="label">Email address</label>
          <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass(errors.email)} />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>
        <div className="form-group">
          <label className="label">Phone number <span className="text-slate-400 font-normal">(optional)</span></label>
          <input {...register('phone')} type="tel" placeholder="+1 234 567 8900" className="input" />
        </div>
        {role === 'EMPLOYER' && (
          <div className="form-group">
            <label className="label">Company name</label>
            <input {...register('companyName')} type="text" placeholder="Acme Inc." className={inputClass(errors.companyName)} />
            {errors.companyName && <p className="error-text">{errors.companyName.message}</p>}
          </div>
        )}
        <div className="form-group">
          <label className="label">Password</label>
          <div className="relative">
            <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Create a strong password" className={`${inputClass(errors.password)} pr-10`} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {[['length', '8+ characters'], ['upper', 'Uppercase letter'], ['lower', 'Lowercase letter'], ['number', 'Number']].map(([k, label]) => (
                <div key={k} className={`flex items-center gap-1.5 text-xs ${passwordChecks[k] ? 'text-green-600' : 'text-slate-400'}`}>
                  <Check className={`w-3 h-3 ${passwordChecks[k] ? 'opacity-100' : 'opacity-30'}`} /> {label}
                </div>
              ))}
            </div>
          )}
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>
        <div className="form-group">
          <label className="label">Confirm password</label>
          <input {...register('confirmPassword')} type={showPass ? 'text' : 'password'} placeholder="Repeat your password" className={inputClass(errors.confirmPassword)} />
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm font-semibold mt-2">
          {isSubmitting ? 'Creating account...' : `Create ${role === 'EMPLOYER' ? 'Employer' : ''} Account`}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
