import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/jobs.service';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const statuses = ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'];

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [notes, setNotes] = useState({});
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getReports({ page, limit: 20, status: status || undefined });
      setReports(data.data.reports || []);
      setPagination(data.data.pagination || { pages: 1, total: 0 });
    } catch { toast.error('Could not load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [page, status]);

  const updateReport = async (report, nextStatus) => {
    setSavingId(report._id);
    try {
      await adminService.resolveReport(report._id, { status: nextStatus, adminNote: notes[report._id] || '' });
      setReports(current => current.map(item => item._id === report._id ? { ...item, status: nextStatus, adminNote: notes[report._id] || '' } : item));
      toast.success(`Report ${nextStatus.toLowerCase()}`);
    } catch { toast.error('Could not update report'); }
    finally { setSavingId(null); }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-0.5 text-sm text-slate-500">{pagination.total.toLocaleString()} reports</p>
      </header>
      <select className="input w-full sm:w-48" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
        <option value="">All statuses</option>
        {statuses.map(item => <option key={item} value={item}>{item}</option>)}
      </select>
      {loading ? <LoadingSpinner center size="lg" /> : reports.length === 0 ? (
        <EmptyState title="No reports found" description="There are no reports in this status." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {reports.map(report => {
            const target = report.targetJob?.title || report.targetUser?.fullName || 'Unavailable target';
            return (
              <article key={report._id} className="border-b border-slate-200 p-4 last:border-b-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="badge badge-red">{report.reason}</span><span className="text-xs text-slate-500">{report.type} · {formatDate(report.createdAt)}</span></div>
                    <h2 className="mt-2 font-semibold text-slate-900">{target}</h2>
                    <p className="text-sm text-slate-600">{report.description || 'No additional description.'}</p>
                    <p className="mt-1 text-xs text-slate-500">Reported by {report.reporter?.fullName || 'Unknown'} ({report.reporter?.email || 'no email'})</p>
                  </div>
                  <span className={`badge ${report.status === 'PENDING' ? 'badge-yellow' : report.status === 'RESOLVED' ? 'badge-green' : 'badge-gray'}`}>{report.status}</span>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input className="input flex-1" value={notes[report._id] ?? report.adminNote ?? ''} onChange={event => setNotes(current => ({ ...current, [report._id]: event.target.value }))} placeholder="Admin note (optional)" />
                  <button type="button" className="btn-primary btn-sm" disabled={savingId === report._id || report.status === 'RESOLVED'} onClick={() => updateReport(report, 'RESOLVED')}><Check className="h-4 w-4" /> Resolve</button>
                  <button type="button" className="btn-outline btn-sm" disabled={savingId === report._id || report.status === 'DISMISSED'} onClick={() => updateReport(report, 'DISMISSED')}><X className="h-4 w-4" /> Dismiss</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Pagination page={page} pages={pagination.pages} onPage={setPage} />
    </div>
  );
}