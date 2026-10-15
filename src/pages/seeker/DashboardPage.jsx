import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Bookmark, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { applicationsService, jobsService } from '../../services/jobs.service';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo, applicationStatusLabel, applicationStatusClass } from '../../utils/helpers';
import { ApplicationStatusBadge } from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function SeekerDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationsService.getMine({ limit: 5 }),
      jobsService.getSaved(),
    ]).then(([appsRes, savedRes]) => {
      setApplications(appsRes.data.data.applications || []);
      setSavedJobs(savedRes.data.data.jobs || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: FileText, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Under Review', value: (statusCounts['REVIEWING'] || 0) + (statusCounts['SHORTLISTED'] || 0), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Interviews', value: statusCounts['INTERVIEW'] || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Saved Jobs', value: savedJobs.length, icon: Bookmark, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (loading) return <LoadingSpinner center size="lg" text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's your job search overview</p>
        </div>
        <Link to="/jobs" className="btn-primary hidden sm:flex">Browse Jobs</Link>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Recent Applications</h2>
            <Link to="/applications" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {applications.length === 0 ? (
            <EmptyState icon={FileText} title="No applications yet"
              description="Start applying to jobs that match your skills."
              action={<Link to="/jobs" className="btn-primary btn-sm">Find Jobs</Link>} />
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <Avatar src={app.job?.company?.logo?.url} name={app.job?.company?.name} size="md" className="rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{app.job?.title}</p>
                    <p className="text-xs text-slate-500">{app.job?.company?.name} · {timeAgo(app.createdAt)}</p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Jobs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Saved Jobs</h2>
            <Link to="/saved-jobs" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {savedJobs.length === 0 ? (
            <EmptyState icon={Bookmark} title="No saved jobs" description="Bookmark jobs you're interested in." />
          ) : (
            <div className="space-y-3">
              {savedJobs.slice(0, 4).map(job => (
                <Link key={job._id} to={`/jobs/${job._id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <Avatar src={job.company?.logo?.url} name={job.company?.name} size="sm" className="rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-xs truncate">{job.title}</p>
                    <p className="text-xs text-slate-400">{job.company?.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Tip */}
      {applications.length === 0 && (
        <div className="card p-5 border-primary-200 bg-primary-50">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-primary-900 text-sm">Complete your profile to get more views</p>
              <p className="text-primary-700 text-xs mt-0.5">Profiles with a CV and photo get 3x more responses from employers.</p>
              <Link to="/profile" className="btn-primary btn-sm mt-3 inline-flex">Update Profile</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
