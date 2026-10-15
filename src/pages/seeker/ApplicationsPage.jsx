import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronDown, RotateCcw } from 'lucide-react';
import { applicationsService } from '../../services/jobs.service';
import { timeAgo, formatDate, applicationStatusLabel } from '../../utils/helpers';
import { ApplicationStatusBadge, WorkModeBadge } from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [withdrawId, setWithdrawId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const { data } = await applicationsService.getMine(params);
      setApplications(data.data.applications || []);
      setPagination(data.data.pagination || { pages: 1 });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, [statusFilter, page]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await applicationsService.withdraw(withdrawId, { reason: 'Changed my mind' });
      toast.success('Application withdrawn');
      setWithdrawId(null);
      fetchApps();
    } catch { toast.error('Failed to withdraw'); }
    finally { setWithdrawing(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
        <p className="text-slate-500 text-sm mt-0.5">Track and manage all your job applications</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${statusFilter === s ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {s === 'ALL' ? 'All' : applicationStatusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner center size="lg" />
      ) : applications.length === 0 ? (
        <EmptyState icon={FileText} title="No applications"
          description={statusFilter === 'ALL' ? "You haven't applied to any jobs yet." : `No applications with status "${applicationStatusLabel[statusFilter]}".`}
          action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>} />
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app._id} className="card p-5">
              <div className="flex items-start gap-4">
                <Avatar src={app.job?.company?.logo?.url} name={app.job?.company?.name} size="lg" className="rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <Link to={`/jobs/${app.job?._id}`} className="font-semibold text-slate-900 hover:text-primary-600 transition-colors">
                        {app.job?.title}
                      </Link>
                      <p className="text-sm text-slate-500 mt-0.5">{app.job?.company?.name}</p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                    <span>Applied {timeAgo(app.createdAt)}</span>
                    {app.job?.location && <span>📍 {app.job.location}</span>}
                    {app.job?.workMode && <WorkModeBadge mode={app.job.workMode} />}
                  </div>
                  {app.statusHistory?.length > 1 && (
                    <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                      {app.statusHistory.slice(-3).map((h, i) => (
                        <div key={i} className="flex items-center gap-1">
                          {i > 0 && <div className="w-4 h-px bg-slate-200 flex-shrink-0" />}
                          <span className="text-xs text-slate-400 whitespace-nowrap">{applicationStatusLabel[h.status]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {app.employerNote && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                      <span className="font-medium">Note from employer:</span> {app.employerNote}
                    </div>
                  )}
                  {!['REJECTED', 'HIRED', 'WITHDRAWN'].includes(app.status) && (
                    <div className="mt-3">
                      <button onClick={() => setWithdrawId(app._id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
                        <RotateCcw className="w-3 h-3" /> Withdraw application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Pagination page={page} pages={pagination.pages} onPage={setPage} />
        </div>
      )}

      <ConfirmDialog isOpen={!!withdrawId} onClose={() => setWithdrawId(null)} onConfirm={handleWithdraw}
        title="Withdraw Application" message="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmText="Withdraw" danger loading={withdrawing} />
    </div>
  );
}
