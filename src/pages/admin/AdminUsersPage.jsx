import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ShieldOff, ShieldCheck, User } from 'lucide-react';
import { adminService } from '../../services/jobs.service';
import { formatDate, timeAgo } from '../../utils/helpers';
import Avatar from '../../components/common/Avatar';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [toggleUserId, setToggleUserId] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, search: search || undefined, role: role || undefined, status: status || undefined };
      const { data } = await adminService.getUsers(params);
      setUsers(data.data.users || []);
      setPagination(data.data.pagination || { pages: 1, total: 0 });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search, role, status]);
  useEffect(() => { setPage(1); }, [search, role, status]);

  const handleToggle = async () => {
    const user = users.find(u => u._id === toggleUserId);
    setToggling(true);
    try {
      await adminService.toggleUser(toggleUserId);
      setUsers(prev => prev.map(u => u._id === toggleUserId ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${user?.isActive ? 'suspended' : 'activated'}`);
      setToggleUserId(null);
    } catch { toast.error('Action failed'); }
    finally { setToggling(false); }
  };

  const selectedUser = users.find(u => u._id === toggleUserId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 text-sm mt-0.5">{pagination.total?.toLocaleString()} registered users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input pl-9" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)} className="input sm:w-40">
          <option value="">All Roles</option>
          <option value="JOB_SEEKER">Job Seekers</option>
          <option value="EMPLOYER">Employers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input sm:w-36">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? <LoadingSpinner center size="lg" /> : users.length === 0 ? (
        <EmptyState icon={User} title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} name={user.fullName} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900">{user.fullName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${user.role === 'ADMIN' ? 'badge-red' : user.role === 'EMPLOYER' ? 'badge-purple' : 'badge-blue'}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      {user.role !== 'ADMIN' && (
                        <button onClick={() => setToggleUserId(user._id)}
                          className={`btn-sm gap-1.5 ${user.isActive ? 'btn-danger' : 'btn-primary'}`}>
                          {user.isActive ? <><ShieldOff className="w-3.5 h-3.5" /> Suspend</> : <><ShieldCheck className="w-3.5 h-3.5" /> Activate</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pagination.pages} onPage={setPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!toggleUserId}
        onClose={() => setToggleUserId(null)}
        onConfirm={handleToggle}
        title={selectedUser?.isActive ? 'Suspend User' : 'Activate User'}
        message={selectedUser?.isActive
          ? `Are you sure you want to suspend ${selectedUser?.fullName}? They will not be able to log in.`
          : `Are you sure you want to activate ${selectedUser?.fullName}?`}
        confirmText={selectedUser?.isActive ? 'Suspend' : 'Activate'}
        danger={selectedUser?.isActive}
        loading={toggling}
      />
    </div>
  );
}
