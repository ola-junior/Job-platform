import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { updateUser } from '../features/auth/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [tab, setTab] = useState('account');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/profile', { fullName: form.fullName });
      dispatch(updateUser({ fullName: form.fullName }));
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Password change failed'); }
    finally { setChangingPw(false); }
  };

  const tabs = [{ id: 'account', label: 'Account' }, { id: 'password', label: 'Password' }, { id: 'notifications', label: 'Notifications' }];

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account preferences</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'account' && (
        <form onSubmit={handleProfileSave} className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Account Information</h2>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed. Contact support if needed.</p>
          </div>
          <div className="form-group">
            <label className="label">Phone Number</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" className="input" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordChange} className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Change Password</h2>
          <div className="form-group">
            <label className="label">Current Password</label>
            <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} className="input" required />
          </div>
          <div className="form-group">
            <label className="label">New Password</label>
            <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} className="input" required minLength={8} />
          </div>
          <div className="form-group">
            <label className="label">Confirm New Password</label>
            <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} className="input" required />
          </div>
          <button type="submit" disabled={changingPw} className="btn-primary">{changingPw ? 'Changing...' : 'Change Password'}</button>
        </form>
      )}

      {tab === 'notifications' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Notification Preferences</h2>
          {[
            { label: 'New application received', desc: 'When someone applies to your job posting' },
            { label: 'Application status updates', desc: 'When your application status changes' },
            { label: 'New messages', desc: 'When you receive a new message' },
            { label: 'Job recommendations', desc: 'Jobs that match your profile' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>
          ))}
          <button className="btn-primary btn-sm">Save Preferences</button>
        </div>
      )}
    </div>
  );
}
