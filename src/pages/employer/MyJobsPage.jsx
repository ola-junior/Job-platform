import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Users, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { jobsService } from '../../services/jobs.service';
import { timeAgo, formatDate } from '../../utils/helpers';
import { JobStatusBadge } from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['ALL', 'PUBLISHED', 'DRAFT', 'PAUSED', 'CLOSED'];

export default function MyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const { data } = await jobsService.getMyJobs(params);
      setJobs(data.data.jobs || []);
      setPagination(data.data.pagination || { pages: 1, total: 0 });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [statusFilter, page]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED';
    try {
      await jobsService.update(job._id, { status: newStatus });
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
      toast.success(`Job ${newStatus === 'PUBLISHED' ? 'published' : 'paused'}`);
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await jobsService.delete(deleteId);
      setJobs(prev => prev.filter(j => j._id !== deleteId));
      toast.success('Job deleted');
      setDeleteId(null);
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Jobs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total} job{pagination.total !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/employer/jobs/create" className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Post Job
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            {s === 'ALL' ? 'All Jobs' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner center size="lg" /> : jobs.length === 0 ? (
        <EmptyState icon={Plus} title="No jobs found"
          description="Post your first job to start attracting candidates."
          action={<Link to="/employer/jobs/create" className="btn-primary">Post a Job</Link>} />
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job._id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <Link to={`/jobs/${job._id}`} className="font-semibold text-slate-900 hover:text-primary-600 transition-colors">
                          {job.title}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Posted {timeAgo(job.createdAt)}
                          {job.applicationDeadline && ` · Deadline ${formatDate(job.applicationDeadline)}`}
                        </p>
                      </div>
                      <JobStatusBadge status={job.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{job.viewCount || 0} views</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicationCount || 0} applicants</span>
                      <span>{job.location}</span>
                      <span>{job.workMode?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/employer/jobs/${job._id}/applicants`} className="btn-secondary btn-sm gap-1.5 hidden sm:flex">
                      <Users className="w-3.5 h-3.5" /> Applicants
                    </Link>
                    <button onClick={() => handleToggleStatus(job)}
                      title={job.status === 'PUBLISHED' ? 'Pause job' : 'Publish job'}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                      {job.status === 'PUBLISHED'
                        ? <ToggleRight className="w-5 h-5 text-green-500" />
                        : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                    </button>
                    <button onClick={() => setDeleteId(job._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} pages={pagination.pages} onPage={setPage} />
        </>
      )}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Job" message="Are you sure you want to delete this job? All applications will also be removed. This cannot be undone."
        confirmText="Delete Job" danger loading={deleting} />
    </div>
  );
}
