import { useState, useEffect, useRef } from 'react';
import { Upload, Globe, Linkedin, Twitter, Building2 } from 'lucide-react';
import { companyService } from '../../services/jobs.service';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Design', 'Legal', 'Engineering', 'Retail', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function CompanyProfilePage() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [form, setForm] = useState({});
  const logoRef = useRef();

  useEffect(() => {
    companyService.getMine()
      .then(({ data }) => {
        setCompany(data.data.company);
        const c = data.data.company;
        setForm({
          name: c.name || '', email: c.email || '', phone: c.phone || '',
          website: c.website || '', linkedin: c.linkedin || '', twitter: c.twitter || '',
          description: c.description || '', industry: c.industry || '',
          size: c.size || '', founded: c.founded || '', headquarters: c.headquarters || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await companyService.update(company._id, form);
      setCompany(data.data.company);
      toast.success('Company profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append('logo', file);
    try {
      const { data } = await companyService.uploadLogo(fd);
      setCompany(prev => ({ ...prev, logo: data.data.logo }));
      toast.success('Logo updated!');
    } catch { toast.error('Upload failed'); }
    finally { setUploadingLogo(false); }
  };

  if (loading) return <LoadingSpinner center size="lg" text="Loading company profile..." />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Update your company information visible to job seekers</p>
      </div>

      {/* Logo */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Company Logo</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar src={company?.logo?.url} name={company?.name} size="2xl" className="rounded-2xl" />
            <button onClick={() => logoRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow hover:bg-primary-700 transition-colors">
              {uploadingLogo ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
            </button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{company?.name}</p>
            <p className="text-sm text-slate-500 mt-0.5">JPG, PNG or WebP · Max 5MB</p>
            <button onClick={() => logoRef.current?.click()} className="btn-secondary btn-sm mt-2 gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload Logo
            </button>
          </div>
        </div>
      </div>

      {/* Details Form */}
      <form onSubmit={handleSave} className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 border-b border-slate-200 pb-3">Company Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group col-span-2">
            <label className="label">Company Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="input" />
          </div>
          <div className="form-group">
            <label className="label">Work Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Industry</label>
            <select value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} className="input">
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Company Size</label>
            <select value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} className="input">
              <option value="">Select size</option>
              {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Founded Year</label>
            <input type="number" value={form.founded} onChange={e => setForm(p => ({ ...p, founded: e.target.value }))} placeholder="2010" min="1800" max={new Date().getFullYear()} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Headquarters</label>
            <input value={form.headquarters} onChange={e => setForm(p => ({ ...p, headquarters: e.target.value }))} placeholder="Lagos, Nigeria" className="input" />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Company Description</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={5} placeholder="Tell job seekers about your company, culture, and mission..." className="input resize-none" maxLength={3000} />
          <p className="text-right text-xs text-slate-400 mt-1">{(form.description || '').length}/3000</p>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-slate-700">Social Links</h3>
          <div className="form-group">
            <label className="label flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Website</label>
            <input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://yourcompany.com" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</label>
              <input value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/company/..." className="input" />
            </div>
            <div className="form-group">
              <label className="label flex items-center gap-1.5"><Twitter className="w-3.5 h-3.5" /> Twitter</label>
              <input value={form.twitter} onChange={e => setForm(p => ({ ...p, twitter: e.target.value }))} placeholder="https://twitter.com/..." className="input" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="btn-primary gap-2">
            {saving ? 'Saving...' : 'Save Company Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
