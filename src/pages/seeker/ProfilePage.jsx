import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Upload, Download, MapPin, Globe, Linkedin, Github, CheckCircle, AlertCircle } from 'lucide-react';
import { profileService } from '../../services/jobs.service';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../features/auth/authSlice';
import { formatDate } from '../../utils/helpers';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const EMP_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];

function SectionHeader({ title, onAdd }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {onAdd && (
        <button onClick={onAdd} className="btn-secondary btn-sm gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const avatarRef = useRef();
  const cvRef = useRef();

  useEffect(() => {
    profileService.get().then(({ data }) => {
      setProfile(data.data.profile);
      setEditData({
        headline: data.data.profile.headline || '',
        about: data.data.profile.about || '',
        location: data.data.profile.location || '',
        website: data.data.profile.website || '',
        linkedin: data.data.profile.linkedin || '',
        github: data.data.profile.github || '',
        isOpenToWork: data.data.profile.isOpenToWork,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const refreshProfile = () => profileService.get().then(({ data }) => setProfile(data.data.profile));

  const handleSaveBasic = async () => {
    setSaving(true);
    try {
      const { data } = await profileService.update(editData);
      setProfile(data.data.profile);
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await profileService.uploadAvatar(fd);
      dispatch(updateUser({ avatar: data.data.avatar }));
      toast.success('Photo updated!');
    } catch { toast.error('Upload failed'); }
    finally { setUploadingAvatar(false); }
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCV(true);
    const fd = new FormData();
    fd.append('cv', file);
    try {
      await profileService.uploadCV(fd);
      await refreshProfile();
      toast.success('CV uploaded!');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploadingCV(false); }
  };

  const openModal = (type, item = {}) => { setActiveModal(type); setFormData(item); };
  const closeModal = () => { setActiveModal(null); setFormData({}); };

  const handleAddItem = async (service, successMsg) => {
    setSaving(true);
    try {
      await service(formData);
      await refreshProfile();
      closeModal();
      toast.success(successMsg);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleRemoveItem = async (service, successMsg) => {
    try {
      await service;
      await refreshProfile();
      toast.success(successMsg);
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return <LoadingSpinner center size="lg" text="Loading profile..." />;

  const completeness = (() => {
    if (!profile) return 0;
    const checks = [
      !!user?.avatar,
      !!profile.headline,
      !!profile.about,
      !!profile.location,
      profile.skills?.length > 0,
      profile.education?.length > 0,
      profile.experience?.length > 0,
      !!profile.cv?.url,
      !!user?.phone,
      !!(profile.linkedin || profile.github),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  })();

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Profile completeness */}
      {completeness < 80 && (
        <div className="card p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Profile {completeness}% complete</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-1.5 mb-2">
            <div className="bg-yellow-500 h-1.5 rounded-full transition-all" style={{ width: `${completeness}%` }} />
          </div>
          <p className="text-xs text-yellow-700">Complete your profile to increase visibility to employers.</p>
        </div>
      )}

      {/* Header Card */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar src={user?.avatar} name={user?.fullName} size="2xl" />
            <button onClick={() => avatarRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors">
              {uploadingAvatar ? <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input value={editData.headline} onChange={e => setEditData(p => ({ ...p, headline: e.target.value }))} placeholder="Professional headline" className="input text-sm" maxLength={220} />
                <textarea value={editData.about} onChange={e => setEditData(p => ({ ...p, about: e.target.value }))} placeholder="About you..." rows={3} className="input resize-none text-sm" maxLength={2000} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={editData.location} onChange={e => setEditData(p => ({ ...p, location: e.target.value }))} placeholder="Location" className="input text-sm" />
                  <input value={editData.website} onChange={e => setEditData(p => ({ ...p, website: e.target.value }))} placeholder="Website URL" className="input text-sm" />
                  <input value={editData.linkedin} onChange={e => setEditData(p => ({ ...p, linkedin: e.target.value }))} placeholder="LinkedIn URL" className="input text-sm" />
                  <input value={editData.github} onChange={e => setEditData(p => ({ ...p, github: e.target.value }))} placeholder="GitHub URL" className="input text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editData.isOpenToWork} onChange={e => setEditData(p => ({ ...p, isOpenToWork: e.target.checked }))} className="w-4 h-4 text-primary-600 rounded" />
                  <label className="text-sm text-slate-700">Open to work</label>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveBasic} disabled={saving} className="btn-primary btn-sm">{saving ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => setEditing(false)} className="btn-outline btn-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{user?.fullName}</h1>
                    {profile?.headline && <p className="text-slate-600 mt-0.5">{profile.headline}</p>}
                    {profile?.isOpenToWork && <span className="badge-green mt-1 inline-flex"><CheckCircle className="w-3 h-3" /> Open to work</span>}
                  </div>
                  <button onClick={() => setEditing(true)} className="btn-ghost btn-sm gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                {profile?.about && <p className="text-sm text-slate-600 mt-3 leading-relaxed">{profile.about}</p>}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                  {profile?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                  {profile?.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline"><Globe className="w-3 h-3" />Website</a>}
                  {profile?.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline"><Linkedin className="w-3 h-3" />LinkedIn</a>}
                  {profile?.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline"><Github className="w-3 h-3" />GitHub</a>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CV Section */}
        <div className="mt-5 pt-5 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Resume / CV</span>
            <div className="flex gap-2">
              {profile?.cv?.url && (
                <a href={profile.cv.url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              )}
              <button onClick={() => cvRef.current?.click()} disabled={uploadingCV} className="btn-outline btn-sm gap-1.5">
                {uploadingCV ? <div className="w-3.5 h-3.5 border border-primary-600 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {profile?.cv?.url ? 'Replace CV' : 'Upload CV'}
              </button>
              <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCVUpload} />
            </div>
          </div>
          {profile?.cv?.fileName && (
            <p className="text-xs text-slate-500 mt-1">Current: {profile.cv.fileName} · Uploaded {formatDate(profile.cv.uploadedAt)}</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="card p-5">
        <SectionHeader title="Skills" onAdd={() => openModal('skill')} />
        {profile?.skills?.length === 0 ? (
          <p className="text-sm text-slate-400">Add your skills to help employers find you.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.skills?.map(skill => (
              <div key={skill._id} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-lg">
                <span className="text-sm font-medium text-primary-700">{skill.name}</span>
                <span className="text-xs text-primary-500">{skill.level.toLowerCase()}</span>
                <button onClick={() => handleRemoveItem(profileService.removeSkill(skill._id), 'Skill removed')} className="text-primary-400 hover:text-red-500 ml-1 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="card p-5">
        <SectionHeader title="Work Experience" onAdd={() => openModal('experience')} />
        {profile?.experience?.length === 0 ? (
          <p className="text-sm text-slate-400">Add your work experience to showcase your background.</p>
        ) : (
          <div className="space-y-4">
            {profile?.experience?.map(exp => (
              <div key={exp._id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-base">💼</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{exp.title}</p>
                      <p className="text-xs text-slate-500">{exp.company} · {exp.employmentType?.replace('_', ' ').toLowerCase()}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(exp.startDate, 'MMM yyyy')} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate, 'MMM yyyy')}
                        {exp.location && ` · ${exp.location}`}
                      </p>
                    </div>
                    <button onClick={() => handleRemoveItem(profileService.removeExperience(exp._id), 'Experience removed')} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {exp.description && <p className="text-xs text-slate-600 mt-2 leading-relaxed">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education */}
      <div className="card p-5">
        <SectionHeader title="Education" onAdd={() => openModal('education')} />
        {profile?.education?.length === 0 ? (
          <p className="text-sm text-slate-400">Add your educational background.</p>
        ) : (
          <div className="space-y-4">
            {profile?.education?.map(edu => (
              <div key={edu._id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-base">🎓</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{edu.institution}</p>
                      <p className="text-xs text-slate-500">{[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ')}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(edu.startDate, 'yyyy')} — {edu.isCurrent ? 'Present' : formatDate(edu.endDate, 'yyyy')}
                      </p>
                    </div>
                    <button onClick={() => handleRemoveItem(profileService.removeEducation(edu._id), 'Education removed')} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'skill'} onClose={closeModal} title="Add Skill" size="sm">
        <div className="space-y-4">
          <div className="form-group"><label className="label">Skill name</label>
            <input value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. React.js" className="input" /></div>
          <div className="form-group"><label className="label">Proficiency</label>
            <select value={formData.level || 'INTERMEDIATE'} onChange={e => setFormData(p => ({ ...p, level: e.target.value }))} className="input">
              {SKILL_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={closeModal} className="btn-outline">Cancel</button>
            <button onClick={() => handleAddItem(profileService.addSkill, 'Skill added!')} disabled={saving || !formData.name} className="btn-primary">{saving ? 'Adding...' : 'Add Skill'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'experience'} onClose={closeModal} title="Add Experience" size="md">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group col-span-2"><label className="label">Job Title</label>
              <input value={formData.title || ''} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Senior Developer" className="input" /></div>
            <div className="form-group"><label className="label">Company</label>
              <input value={formData.company || ''} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="Acme Inc." className="input" /></div>
            <div className="form-group"><label className="label">Location</label>
              <input value={formData.location || ''} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="New York, NY" className="input" /></div>
            <div className="form-group"><label className="label">Employment Type</label>
              <select value={formData.employmentType || 'FULL_TIME'} onChange={e => setFormData(p => ({ ...p, employmentType: e.target.value }))} className="input">
                {EMP_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select></div>
            <div className="form-group"><label className="label">Start Date</label>
              <input type="month" value={formData.startDate || ''} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} className="input" /></div>
            <div className="form-group">
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">End Date</label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={formData.isCurrent || false} onChange={e => setFormData(p => ({ ...p, isCurrent: e.target.checked }))} className="w-3.5 h-3.5" /> Current
                </label>
              </div>
              <input type="month" value={formData.endDate || ''} disabled={formData.isCurrent} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} className="input disabled:opacity-50" />
            </div>
          </div>
          <div className="form-group"><label className="label">Description</label>
            <textarea value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe your responsibilities..." className="input resize-none" /></div>
          <div className="flex gap-2 justify-end">
            <button onClick={closeModal} className="btn-outline">Cancel</button>
            <button onClick={() => handleAddItem(profileService.addExperience, 'Experience added!')} disabled={saving || !formData.title || !formData.company} className="btn-primary">{saving ? 'Adding...' : 'Add'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'education'} onClose={closeModal} title="Add Education" size="md">
        <div className="space-y-3">
          <div className="form-group"><label className="label">Institution</label>
            <input value={formData.institution || ''} onChange={e => setFormData(p => ({ ...p, institution: e.target.value }))} placeholder="University of Lagos" className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label className="label">Degree</label>
              <input value={formData.degree || ''} onChange={e => setFormData(p => ({ ...p, degree: e.target.value }))} placeholder="Bachelor's" className="input" /></div>
            <div className="form-group"><label className="label">Field of Study</label>
              <input value={formData.fieldOfStudy || ''} onChange={e => setFormData(p => ({ ...p, fieldOfStudy: e.target.value }))} placeholder="Computer Science" className="input" /></div>
            <div className="form-group"><label className="label">Start Year</label>
              <input type="month" value={formData.startDate || ''} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} className="input" /></div>
            <div className="form-group"><label className="label">End Year</label>
              <input type="month" value={formData.endDate || ''} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} className="input" /></div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={closeModal} className="btn-outline">Cancel</button>
            <button onClick={() => handleAddItem(profileService.addEducation, 'Education added!')} disabled={saving || !formData.institution} className="btn-primary">{saving ? 'Adding...' : 'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
