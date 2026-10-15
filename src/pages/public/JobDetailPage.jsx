import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Users, DollarSign, Calendar, Bookmark, BookmarkCheck, Share2, Flag, CheckCircle, Building2, ExternalLink, ChevronLeft } from 'lucide-react';
import { jobsService, applicationsService } from '../../services/jobs.service';
import { useAuth } from '../../hooks/useAuth';
import { formatSalary, formatDate, timeAgo, workModeLabel, employmentTypeLabel, experienceLevelLabel } from '../../utils/helpers';
import { WorkModeBadge, EmploymentTypeBadge, ExperienceBadge } from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, isSeeker, user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    jobsService.getOne(id)
      .then(({ data }) => {
        setJob(data.data.job);
        setIsSaved(data.data.job.isSaved);
        setHasApplied(data.data.job.hasApplied);
      })
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setSaving(true);
    try {
      const { data } = await jobsService.save(id);
      setIsSaved(data.data.isSaved);
      toast.success(data.data.isSaved ? 'Job saved!' : 'Job removed from saved');
    } catch { toast.error('Failed to save job'); }
    finally { setSaving(false); }
  };

  const handleApply = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isSeeker) { toast.error('Only job seekers can apply'); return; }
    setApplying(true);
    try {
      await applicationsService.apply ? null : null;
      await jobsService.apply(id, { coverLetter });
      setHasApplied(true);
      setApplyModal(false);
      toast.success('Application submitted successfully!');
      setJob(prev => ({ ...prev, applicationCount: (prev.applicationCount || 0) + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally { setApplying(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><LoadingSpinner size="lg" center text="Loading job..." /></div>;
  if (!job) return null;

  const isDeadlinePassed = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);

  return (
    <div className="page-container py-8">
      <Link to="/jobs" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors w-fit">
        <ChevronLeft className="w-4 h-4" /> Back to jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Job Header Card */}
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-5">
              <Avatar src={job.company?.logo?.url} name={job.company?.name} size="2xl" className="rounded-2xl flex-shrink-0" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{job.title}</h1>
                <Link to={`/companies/${job.company?._id}`} className="text-primary-600 hover:underline font-medium">
                  {job.company?.name}
                </Link>
                <div className="flex flex-wrap gap-2 mt-3">
                  <WorkModeBadge mode={job.workMode} />
                  <EmploymentTypeBadge type={job.employmentType} />
                  <ExperienceBadge level={job.experienceLevel} />
                  {job.isFeatured && <span className="badge-yellow">⭐ Featured</span>}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600 mb-5">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{job.location}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />Posted {timeAgo(job.createdAt)}</div>
              {job.salary && !job.salary.isHidden && <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400" />{formatSalary(job.salary)}</div>}
              {job.openings && <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" />{job.openings} opening{job.openings !== 1 ? 's' : ''}</div>}
              {job.applicationDeadline && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />Deadline: {formatDate(job.applicationDeadline)}</div>}
              {job.applicationCount >= 0 && <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" />{job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}</div>}
            </div>

            <div className="flex gap-3">
              {hasApplied ? (
                <button disabled className="btn-primary flex-1 sm:flex-none opacity-70 cursor-not-allowed gap-2">
                  <CheckCircle className="w-4 h-4" /> Applied
                </button>
              ) : isDeadlinePassed ? (
                <button disabled className="btn-primary flex-1 sm:flex-none opacity-50 cursor-not-allowed">Deadline Passed</button>
              ) : (
                <button onClick={() => isAuthenticated ? setApplyModal(true) : navigate('/login')} className="btn-primary btn-lg flex-1 sm:flex-none">
                  Apply Now
                </button>
              )}
              <button onClick={handleSave} disabled={saving} className={`btn-outline gap-2 ${isSaved ? 'border-primary-300 text-primary-600 bg-primary-50' : ''}`}>
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="btn-outline gap-2">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Description</h2>
            <div className="prose prose-sm text-slate-600 max-w-none whitespace-pre-line leading-relaxed">{job.description}</div>
          </div>

          {job.responsibilities?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Requirements</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.skills?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => <span key={skill} className="badge-blue">{skill}</span>)}
              </div>
            </div>
          )}

          {job.benefits?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Benefits</h2>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {job.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{b}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Company Card */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4" /> About the Company</h3>
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={job.company?.logo?.url} name={job.company?.name} size="lg" className="rounded-xl" />
              <div>
                <Link to={`/companies/${job.company?._id}`} className="font-semibold text-slate-900 hover:text-primary-600">{job.company?.name}</Link>
                {job.company?.industry && <p className="text-xs text-slate-500">{job.company.industry}</p>}
              </div>
            </div>
            {job.company?.description && <p className="text-sm text-slate-500 line-clamp-3 mb-3">{job.company.description}</p>}
            <div className="space-y-1.5 text-xs text-slate-500">
              {job.company?.size && <div><span className="font-medium">Size:</span> {job.company.size} employees</div>}
              {job.company?.headquarters && <div><span className="font-medium">HQ:</span> {job.company.headquarters}</div>}
              {job.company?.website && (
                <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                  <ExternalLink className="w-3 h-3" /> Visit website
                </a>
              )}
            </div>
          </div>

          {/* Job Overview */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Job Overview</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Work Mode', value: workModeLabel[job.workMode] },
                { label: 'Job Type', value: employmentTypeLabel[job.employmentType] },
                { label: 'Experience', value: experienceLevelLabel[job.experienceLevel] },
                { label: 'Category', value: job.categoryName },
                { label: 'Openings', value: job.openings },
                { label: 'Posted', value: formatDate(job.createdAt) },
                { label: 'Deadline', value: job.applicationDeadline ? formatDate(job.applicationDeadline) : 'No deadline' },
              ].filter(i => i.value).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {!hasApplied && !isDeadlinePassed && (
            <button onClick={() => isAuthenticated ? setApplyModal(true) : navigate('/login')} className="btn-primary w-full btn-lg">
              Apply for this Job
            </button>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={applyModal} onClose={() => setApplyModal(false)} title={`Apply — ${job.title}`} size="md">
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-xl border border-primary-200 text-sm text-primary-800">
            <p className="font-medium mb-1">Applying to {job.company?.name}</p>
            <p className="text-primary-600 text-xs">Your profile CV will be attached automatically. Add a cover letter to stand out.</p>
          </div>
          <div>
            <label className="label">Cover Letter <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea rows={6} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you're the perfect fit for this role..."
              className="input resize-none" maxLength={3000} />
            <div className="text-right text-xs text-slate-400 mt-1">{coverLetter.length}/3000</div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setApplyModal(false)} className="btn-outline">Cancel</button>
            <button onClick={handleApply} disabled={applying} className="btn-primary">
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
