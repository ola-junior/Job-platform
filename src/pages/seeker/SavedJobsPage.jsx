import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Clock } from 'lucide-react';
import { jobsService } from '../../services/jobs.service';
import { workModeLabel, timeAgo } from '../../utils/helpers';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { WorkModeBadge } from '../../components/common/Badge';

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsService.getSaved()
      .then(({ data }) => setJobs(data.data.jobs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobId, e) => {
    e.preventDefault();
    await jobsService.save(jobId);
    setJobs(prev => prev.filter(j => j._id !== jobId));
  };

  if (loading) return <LoadingSpinner center size="lg" text="Loading saved jobs..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
        <p className="text-slate-500 text-sm mt-0.5">{jobs.length} job{jobs.length !== 1 ? 's' : ''} saved</p>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={Bookmark} title="No saved jobs"
          description="Browse jobs and click the bookmark icon to save ones you're interested in."
          action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>} />
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <Link key={job._id} to={`/jobs/${job._id}`} className="card-hover p-5 flex items-start gap-4">
              <Avatar src={job.company?.logo?.url} name={job.company?.name} size="lg" className="rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 hover:text-primary-600 transition-colors">{job.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{job.company?.name}</p>
                  </div>
                  <button onClick={(e) => handleUnsave(job._id, e)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-primary-500 hover:text-red-500 transition-colors flex-shrink-0">
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <WorkModeBadge mode={job.workMode} />
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="w-3 h-3" />{job.location}
                  </span>
                  <span className="text-xs text-slate-400">Saved {timeAgo(job.savedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
