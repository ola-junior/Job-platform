import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, FileText, TrendingUp, Flag, BarChart3, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/jobs.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then(({ data }) => {
      setStats(data.data.stats);
      const growth = data.data.userGrowth?.map(g => ({
        month: `${g._id.year}-${String(g._id.month).padStart(2, '0')}`,
        users: g.count,
      })) || [];
      setUserGrowth(growth);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner center size="lg" text="Loading admin dashboard..." />;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers?.toLocaleString(), icon: Users, color: 'text-primary-600', bg: 'bg-primary-50', to: '/admin/users' },
    { label: 'Job Seekers', value: stats?.totalSeekers?.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', to: '/admin/users?role=JOB_SEEKER' },
    { label: 'Employers', value: stats?.totalEmployers?.toLocaleString(), icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', to: '/admin/users?role=EMPLOYER' },
    { label: 'Active Jobs', value: stats?.activeJobs?.toLocaleString(), icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50', to: '/admin/jobs?status=PUBLISHED' },
    { label: 'Total Applications', value: stats?.totalApplications?.toLocaleString(), icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', to: '/admin/applications' },
    { label: 'Jobs This Month', value: stats?.jobsThisMonth?.toLocaleString(), icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Apps This Month', value: stats?.appsThisMonth?.toLocaleString(), icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Reports', value: stats?.pendingReports?.toLocaleString(), icon: Flag, color: 'text-red-600', bg: 'bg-red-50', to: '/admin/reports', alert: stats?.pendingReports > 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform statistics and management</p>
      </div>

      {stats?.pendingReports > 0 && (
        <div className="card p-4 border-red-200 bg-red-50 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">{stats.pendingReports} pending report{stats.pendingReports !== 1 ? 's' : ''} require attention</p>
          </div>
          <Link to="/admin/reports" className="btn-danger btn-sm">Review Reports</Link>
        </div>
      )}

      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, to, alert }) => (
          <div key={label} className={`stat-card ${alert ? 'border-red-200' : ''} ${to ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''}`}
            onClick={() => to && window.location.assign(to)}>
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`text-2xl font-bold ${alert ? 'text-red-700' : 'text-slate-900'}`}>{value || 0}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* User Growth Chart */}
      {userGrowth.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-5">User Growth (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userGrowth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px' }} />
              <Bar dataKey="users" fill="#2563EB" radius={[4, 4, 0, 0]} name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Manage Users', desc: 'View, activate, or suspend accounts', to: '/admin/users', icon: Users },
          { label: 'Review Jobs', desc: 'Moderate job postings', to: '/admin/jobs', icon: Briefcase },
          { label: 'Resolve Reports', desc: 'Handle user and job reports', to: '/admin/reports', icon: Flag },
          { label: 'Categories', desc: 'Manage job categories', to: '/admin/categories', icon: BarChart3 },
        ].map(({ label, desc, to, icon: Icon }) => (
          <Link key={label} to={to} className="card-hover p-4">
            <Icon className="w-5 h-5 text-primary-600 mb-2" />
            <p className="font-semibold text-slate-900 text-sm">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
