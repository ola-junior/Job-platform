import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/jobs.service';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.getAuditLogs({ page, limit: 50 })
      .then(({ data }) => {
        if (!active) return;
        setLogs(data.data.logs || []);
        setPagination(data.data.pagination || { pages: 1, total: 0 });
      })
      .catch(() => { if (active) toast.error('Could not load audit logs'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Audit logs</h1>
        <p className="mt-0.5 text-sm text-slate-500">{pagination.total.toLocaleString()} recorded admin actions</p>
      </header>
      {loading ? <LoadingSpinner center size="lg" /> : logs.length === 0 ? (
        <EmptyState title="No audit activity yet" description="Admin changes will be recorded here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Admin</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Resource</th><th className="px-4 py-3">Details</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map(log => (
                <tr key={log._id}>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(log.createdAt, 'MMM d, yyyy h:mm a')}</td>
                  <td className="px-4 py-3"><p className="font-medium text-slate-800">{log.actor?.fullName || 'System'}</p><p className="text-xs text-slate-500">{log.actorRole || ''}</p></td>
                  <td className="px-4 py-3"><span className={`badge ${log.success ? 'badge-green' : 'badge-red'}`}>{log.action}</span></td>
                  <td className="px-4 py-3 text-slate-600">{log.resource || '—'}</td>
                  <td className="max-w-sm px-4 py-3 text-xs text-slate-500"><details><summary className="cursor-pointer">View</summary><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words">{JSON.stringify(log.details, null, 2)}</pre><p className="mt-1">IP: {log.ip || 'Unavailable'}</p></details></td>
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