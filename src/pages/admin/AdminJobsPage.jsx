import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/jobs.service';
import { formatDate, jobStatusClass } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const statuses = ['DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'EXPIRED'];

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getJobs({ page, limit: 20, search: search || undefined, status: status || undefined });
      setJobs(data.data.jobs || []);
      setPagination(data.data.pagination || { pages: 1, total: 0 });
    } catch { toast.error('Could not load jobs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [page, search, status]);

  const updateJob = async (job, changes) => {
    setSavingId(job._id);
    try {
      await adminService.updateJob(job._id, { status: job.status, isFeatured: job.isFeatured, ...changes });
      setJobs(current => current.map(item => item._id === job._id ? { ...item, ...changes } : item));
      toast.success('Job updated');
    } catch { toast.error('Could not update job'); }
    finally { setSavingId(null); }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        <p className="mt-0.5 text-sm text-slate-500">{pagination.total.toLocaleString()} job listings</p>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input className="input flex-1" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search job titles" />
        <select className="input sm:w-44" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {statuses.map(item => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}
        </select>
      </div>
      {loading ? <LoadingSpinner center size="lg" /> : jobs.length === 0 ? (
        <EmptyState title="No jobs found" description="Try changing the title or status filter." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr><th className="px-4 py-3">Job</th><th className="px-4 py-3">Employer</th><th className="px-4 py-3">Posted</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Feature</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map(job => (
                <tr key={job._id}>
                  <td className="px-4 py-3"><p className="font-medium text-slate-900">{job.title}</p><p className="text-xs text-slate-500">{job.company?.name || job.location}</p></td>
                  <td className="px-4 py-3 text-slate-600">{job.employer?.fullName || 'Unknown'}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(job.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select aria-label={`Status for ${job.title}`} className="input min-w-36 py-1.5 text-xs" value={job.status} disabled={savingId === job._id} onChange={event => updateJob(job, { status: event.target.value })}>
                      {statuses.map(item => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}
                    </select>
                    <span className={`badge mt-1 ${jobStatusClass[job.status] || 'badge-gray'}`}>{job.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" title={job.isFeatured ? 'Remove featured status' : 'Feature job'} aria-label={job.isFeatured ? 'Remove featured status' : 'Feature job'} disabled={savingId === job._id} onClick={() => updateJob(job, { isFeatured: !job.isFeatured })} className={`rounded p-2 disabled:opacity-50 ${job.isFeatured ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}>
                      <Star className="h-4 w-4" fill={job.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pages={pagination.pages} onPage={setPage} />
    </div>
  );
}