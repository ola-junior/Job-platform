import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/jobs.service';
import { applicationStatusClass, applicationStatusLabel, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const statuses = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN', 'HIRED'];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.getApplications({ page, limit: 20, search: search || undefined, status: status || undefined })
      .then(({ data }) => {
        if (!active) return;
        setApplications(data.data.applications || []);
        setPagination(data.data.pagination || { pages: 1, total: 0 });
      })
      .catch(() => { if (active) toast.error('Could not load applications'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, search, status]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <p className="mt-0.5 text-sm text-slate-500">{pagination.total.toLocaleString()} submitted applications</p>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input className="input flex-1" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search applicant or job" />
        <select className="input sm:w-48" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {statuses.map(item => <option key={item} value={item}>{applicationStatusLabel[item]}</option>)}
        </select>
      </div>
      {loading ? <LoadingSpinner center size="lg" /> : applications.length === 0 ? (
        <EmptyState title="No applications found" description="Applications matching these filters will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Position</th><th className="px-4 py-3">Employer</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map(application => (
                <tr key={application._id}>
                  <td className="px-4 py-3"><p className="font-medium text-slate-900">{application.applicant?.fullName || 'Unknown applicant'}</p><p className="text-xs text-slate-500">{application.applicant?.email}</p></td>
                  <td className="px-4 py-3"><p className="font-medium text-slate-800">{application.job?.title || 'Job removed'}</p><p className="text-xs text-slate-500">{application.job?.location}</p></td>
                  <td className="px-4 py-3 text-slate-600">{application.company?.name || 'Unknown company'}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(application.createdAt)}</td>
                  <td className="px-4 py-3"><span className={`badge ${applicationStatusClass[application.status] || 'badge-gray'}`}>{applicationStatusLabel[application.status] || application.status}</span></td>
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