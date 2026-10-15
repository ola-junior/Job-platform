import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Eye, TrendingUp, Plus, Clock } from 'lucide-react';
import { jobsService, applicationsService } from '../../services/jobs.service';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/helpers';
import { JobStatusBadge, ApplicationStatusBadge } from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsService.getMyJobs({ limit: 5 }).then(({ data }) => {
      setJobs(data.data.jobs || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const publishedJobs = jobs.filter(j => j.status === 'PUBLISHED');
  const totalApplicants = jobs.reduce((s, j) => s + (j.applicationCount || 0), 0);
  const totalViews = jobs.reduce((s, j) => s + (j.viewCount || 0), 0);

  const stats = [
    { label: 'Active Jobs', value: publishedJobs.length, icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Total Applicants', value: totalApplicants, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Jobs', value: jobs.length, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  if (loading) return <LoadingSpinner center size="lg" text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employer Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {user?.fullName?.split(' ')[0]}</p>
        </div>
        <Link to="/employer/jobs/create" className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Post a Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-900">Your Job Listings</h2>
          <Link to="/employer/jobs" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm mb-4">You haven't posted any jobs yet.</p>
            <Link to="/employer/jobs/create" className="btn-primary">Post Your First Job</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <Link to={`/employer/jobs/${job._id}`} className="font-medium text-slate-900 hover:text-primary-600 text-sm">{job.title}</Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(job.createdAt)}</span>
                    <span>{job.applicationCount || 0} applicants</span>
                    <span>{job.viewCount || 0} views</span>
                  </div>
                </div>
                <JobStatusBadge status={job.status} />
                <Link to={`/employer/jobs/${job._id}/applicants`} className="btn-secondary btn-sm hidden sm:flex">
                  View Applicants
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
