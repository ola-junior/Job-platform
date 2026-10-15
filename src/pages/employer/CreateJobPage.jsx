import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Save, Eye } from 'lucide-react';
import { jobsService } from '../../services/jobs.service';
import toast from 'react-hot-toast';

const WORK_MODES = ['REMOTE', 'HYBRID', 'ON_SITE'];
const EMP_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];
const EXP_LEVELS = ['ENTRY', 'MID', 'SENIOR', 'EXECUTIVE'];
const EDUCATION_LEVELS = ['ANY', 'HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD'];
const SALARY_PERIODS = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [responsibilities, setResponsibilities] = useState(['']);
  const [requirements, setRequirements] = useState(['']);
  const [benefits, setBenefits] = useState(['']);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { workMode: 'ON_SITE', employmentType: 'FULL_TIME', experienceLevel: 'MID', status: 'DRAFT', salary: { currency: 'USD', period: 'YEARLY', isHidden: false }, openings: 1 },
  });

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const updateListItem = (setter, index, value) => setter(prev => { const n = [...prev]; n[index] = value; return n; });
  const addListItem = (setter) => setter(prev => [...prev, '']);
  const removeListItem = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));

  const onSubmit = async (data, isDraft = false) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        skills,
        responsibilities: responsibilities.filter(Boolean),
        requirements: requirements.filter(Boolean),
        benefits: benefits.filter(Boolean),
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
        salary: { ...data.salary, min: Number(data.salary?.min), max: Number(data.salary?.max) },
      };
      await jobsService.create(payload);
      toast.success(isDraft ? 'Job saved as draft' : 'Job published successfully!');
      navigate('/employer/jobs');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create job'); }
    finally { setSaving(false); }
  };

  const inputClass = (err) => `input ${err ? 'border-red-400 focus:ring-red-400' : ''}`;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Post a New Job</h1>
        <p className="text-slate-500 text-sm mt-0.5">Fill in the details to attract the right candidates</p>
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
        {/* Basic Info */}
        <div className="card p-6 space-y-4 mb-4">
          <h2 className="font-semibold text-slate-900 border-b border-slate-200 pb-3">Job Details</h2>
          <div className="form-group">
            <label className="label">Job Title *</label>
            <input {...register('title', { required: 'Job title is required' })} placeholder="e.g. Senior React Developer" className={inputClass(errors.title)} />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Work Mode *</label>
              <select {...register('workMode')} className="input">
                {WORK_MODES.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Employment Type *</label>
              <select {...register('employmentType')} className="input">
                {EMP_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Experience Level *</label>
              <select {...register('experienceLevel')} className="input">
                {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Education Level</label>
              <select {...register('educationLevel')} className="input">
                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Location *</label>
            <input {...register('location', { required: 'Location is required' })} placeholder="New York, NY or Remote" className={inputClass(errors.location)} />
            {errors.location && <p className="error-text">{errors.location.message}</p>}
          </div>
          <div className="form-group">
            <label className="label">Job Category</label>
            <input {...register('categoryName')} placeholder="e.g. Technology, Design, Marketing" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Number of Openings</label>
              <input {...register('openings', { min: 1, valueAsNumber: true })} type="number" min="1" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Application Deadline</label>
              <input {...register('applicationDeadline')} type="date" className="input" />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="card p-6 space-y-4 mb-4">
          <h2 className="font-semibold text-slate-900 border-b border-slate-200 pb-3">Compensation</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label">Min Salary</label>
              <input {...register('salary.min', { valueAsNumber: true })} type="number" placeholder="50000" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Max Salary</label>
              <input {...register('salary.max', { valueAsNumber: true })} type="number" placeholder="80000" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Currency</label>
              <select {...register('salary.currency')} className="input">
                {['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Pay Period</label>
              <select {...register('salary.period')} className="input">
                {SALARY_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input {...register('salary.isHidden')} type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
              <label className="text-sm text-slate-700">Hide salary from listing</label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card p-6 space-y-4 mb-4">
          <h2 className="font-semibold text-slate-900 border-b border-slate-200 pb-3">Job Description</h2>
          <div className="form-group">
            <label className="label">Full Description *</label>
            <textarea {...register('description', { required: 'Description is required', minLength: { value: 100, message: 'At least 100 characters required' } })}
              rows={8} placeholder="Provide a detailed job description..." className={`input resize-none ${errors.description ? 'border-red-400' : ''}`} />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          {/* Responsibilities */}
          <div>
            <label className="label">Responsibilities</label>
            <div className="space-y-2">
              {responsibilities.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input value={r} onChange={e => updateListItem(setResponsibilities, i, e.target.value)} placeholder={`Responsibility ${i + 1}`} className="input flex-1 text-sm" />
                  {responsibilities.length > 1 && <button type="button" onClick={() => removeListItem(setResponsibilities, i)} className="text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
              <button type="button" onClick={() => addListItem(setResponsibilities)} className="btn-ghost btn-sm gap-1 text-primary-600"><Plus className="w-3.5 h-3.5" /> Add responsibility</button>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="label">Requirements</label>
            <div className="space-y-2">
              {requirements.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input value={r} onChange={e => updateListItem(setRequirements, i, e.target.value)} placeholder={`Requirement ${i + 1}`} className="input flex-1 text-sm" />
                  {requirements.length > 1 && <button type="button" onClick={() => removeListItem(setRequirements, i)} className="text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
              <button type="button" onClick={() => addListItem(setRequirements)} className="btn-ghost btn-sm gap-1 text-primary-600"><Plus className="w-3.5 h-3.5" /> Add requirement</button>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="label">Required Skills (press Enter to add)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map(s => (
                <span key={s} className="badge-blue gap-1">
                  {s} <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="opacity-60 hover:opacity-100">×</button>
                </span>
              ))}
            </div>
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="Type a skill and press Enter..." className="input" />
          </div>

          {/* Benefits */}
          <div>
            <label className="label">Benefits</label>
            <div className="space-y-2">
              {benefits.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input value={b} onChange={e => updateListItem(setBenefits, i, e.target.value)} placeholder={`e.g. Health insurance, Remote work`} className="input flex-1 text-sm" />
                  {benefits.length > 1 && <button type="button" onClick={() => removeListItem(setBenefits, i)} className="text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
              <button type="button" onClick={() => addListItem(setBenefits)} className="btn-ghost btn-sm gap-1 text-primary-600"><Plus className="w-3.5 h-3.5" /> Add benefit</button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={handleSubmit(data => onSubmit(data, true))} disabled={saving} className="btn-outline gap-2">
            <Save className="w-4 h-4" /> Save as Draft
          </button>
          <button type="submit" disabled={saving} className="btn-primary gap-2">
            <Eye className="w-4 h-4" /> {saving ? 'Publishing...' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
