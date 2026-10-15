import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, MessageSquare, ChevronDown, User } from 'lucide-react';
import { applicationsService, jobsService } from '../../services/jobs.service';
import { timeAgo } from '../../utils/helpers';
import { ApplicationStatusBadge } from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED', 'HIRED'];
const NEXT_STATUSES = { APPLIED: ['REVIEWING', 'REJECTED'], REVIEWING: ['SHORTLISTED', 'REJECTED'], SHORTLISTED: ['INTERVIEW', 'REJECTED'], INTERVIEW: ['OFFER', 'REJECTED'], OFFER: ['HIRED', 'REJECTED'], };

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    Promise.all([
      applicationsService.getJobApplicants(jobId),
      jobsService.getMyJobs(),
    ]).then(([appsRes, jobsRes]) => {
      setApplications(appsRes.data.data.applications || []);
      const found = jobsRes.data.data.jobs?.find(j => j._id === jobId);
      setJob(found);
    }).catch(console.error).finally(() => setLoading(false));
  }, [jobId]);

  const refreshApps = async () => {
    const { data } = await applicationsService.getJobApplicants(jobId, statusFilter !== 'ALL' ? { status: statusFilter } : {});
    setApplications(data.data.applications || []);
  };

  const handleStatusChange = async (appId, status, note = '') => {
    setUpdatingId(appId);
    try {
      await applicationsService.updateStatus(appId, { status, note });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status, employerNote: note || a.employerNote } : a));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); }
  };

  const filtered = statusFilter === 'ALL' ? applications : applications.filter(a => a.status === statusFilter);

  if (loading) return <LoadingSpinner center size="lg" text="Loading applicants..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
        <p className="text-slate-500 text-sm mt-0.5">{job?.title} · {applications.length} total applicant{applications.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-200">
        {STATUSES.map(s => {
          const count = s === 'ALL' ? applications.length : applications.filter(a => a.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1 ${statusFilter === s ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              {count > 0 && <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${statusFilter === s ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={User} title="No applicants" description={`No applicants with status "${statusFilter}".`} />
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app._id} className="card p-5">
              <div className="flex items-start gap-4">
                <Avatar src={app.applicant?.avatar} name={app.applicant?.fullName} size="lg" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <button onClick={() => setSelectedApp(app)} className="font-semibold text-slate-900 hover:text-primary-600 text-left">
                        {app.applicant?.fullName}
                      </button>
                      <p className="text-xs text-slate-500">{app.applicant?.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Applied {timeAgo(app.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <ApplicationStatusBadge status={app.status} />
                      {app.cv?.url && (
                        <a href={app.cv.url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm gap-1.5">
                          <Download className="w-3.5 h-3.5" /> CV
                        </a>
                      )}
                      {/* Status dropdown */}
                      {NEXT_STATUSES[app.status] && (
                        <div className="relative group">
                          <button className="btn-primary btn-sm gap-1" disabled={updatingId === app._id}>
                            {updatingId === app._id ? 'Updating...' : 'Move to'} <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-dropdown z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                            {NEXT_STATUSES[app.status].map(s => (
                              <button key={s} onClick={() => handleStatusChange(app._id, s)}
                                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg">
                                → {s.charAt(0) + s.slice(1).toLowerCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {app.coverLetter && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-700 mb-1">Cover Letter</p>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{app.coverLetter}</p>
                      <button onClick={() => setSelectedApp(app)} className="text-xs text-primary-600 hover:underline mt-1">Read more</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applicant Detail Modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Applicant Details" size="lg">
        {selectedApp && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar src={selectedApp.applicant?.avatar} name={selectedApp.applicant?.fullName} size="xl" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedApp.applicant?.fullName}</h3>
                <p className="text-sm text-slate-500">{selectedApp.applicant?.email}</p>
                <ApplicationStatusBadge status={selectedApp.status} />
              </div>
            </div>
            {selectedApp.coverLetter && (
              <div>
                <h4 className="font-semibold text-slate-800 text-sm mb-2">Cover Letter</h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedApp.coverLetter}
                </div>
              </div>
            )}
            {selectedApp.cv?.url && (
              <div>
                <h4 className="font-semibold text-slate-800 text-sm mb-2">Resume / CV</h4>
                <a href={selectedApp.cv.url} target="_blank" rel="noopener noreferrer" className="btn-secondary gap-2 w-full justify-center">
                  <Download className="w-4 h-4" /> Download CV — {selectedApp.cv.fileName}
                </a>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Add Note</h4>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} placeholder="Internal notes about this candidate..." className="input resize-none text-sm" />
            </div>
            {NEXT_STATUSES[selectedApp.status] && (
              <div className="flex gap-2 flex-wrap">
                {NEXT_STATUSES[selectedApp.status].map(s => (
                  <button key={s} onClick={async () => {
                    await handleStatusChange(selectedApp._id, s, noteText);
                    setSelectedApp(prev => ({ ...prev, status: s }));
                  }} className={s === 'REJECTED' ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}>
                    Move to {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
