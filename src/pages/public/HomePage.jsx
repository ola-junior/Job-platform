import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Users, Building2, TrendingUp, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { jobsService } from '../../services/jobs.service';
import { useDebounce } from '../../hooks/useDebounce';
import { formatSalary, workModeLabel, employmentTypeLabel, timeAgo } from '../../utils/helpers';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SkeletonCard } from '../../components/common/Skeleton';
import api from '../../services/api';

const CATEGORIES = [
  { name: 'Technology', icon: '💻', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Design', icon: '🎨', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Marketing', icon: '📢', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Finance', icon: '💰', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Healthcare', icon: '🏥', color: 'bg-red-50 text-red-700 border-red-200' },
  { name: 'Education', icon: '📚', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { name: 'Sales', icon: '🤝', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { name: 'Engineering', icon: '🔧', color: 'bg-slate-50 text-slate-700 border-slate-200' },
];

const STATS = [
  { value: '10,000+', label: 'Active Jobs', icon: Briefcase },
  { value: '5,000+', label: 'Companies', icon: Building2 },
  { value: '50,000+', label: 'Job Seekers', icon: Users },
  { value: '15,000+', label: 'Hires Made', icon: TrendingUp },
];

const HOW_IT_WORKS_SEEKER = [
  { step: '01', title: 'Create Your Profile', desc: 'Build a professional profile with your experience, skills, and upload your CV.' },
  { step: '02', title: 'Search & Discover', desc: 'Search thousands of jobs with powerful filters — remote, salary, experience level.' },
  { step: '03', title: 'Apply with Ease', desc: 'Apply in seconds with your saved profile and track every application in real-time.' },
];

function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job._id}`} className="card-hover p-5 block">
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={job.company?.logo?.url} name={job.company?.name} size="md" className="rounded-lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 hover:text-primary-600 transition-colors">{job.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{job.company?.name}</p>
        </div>
        {job.isFeatured && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="badge-blue">{workModeLabel[job.workMode]}</span>
        <span className="badge-gray">{employmentTypeLabel[job.employmentType]}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
        <span>{timeAgo(job.createdAt)}</span>
      </div>
      {job.salary && !job.salary.isHidden && (
        <p className="text-sm font-semibold text-primary-600 mt-2">{formatSalary(job.salary)}</p>
      )}
    </Link>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      jobsService.getFeatured(),
      jobsService.getAll({ limit: 6, sort: '-createdAt' }),
      api.get('/categories'),
    ]).then(([feat, latest, cats]) => {
      setFeaturedJobs(feat.data.data.jobs || []);
      setLatestJobs(latest.data.data.jobs || []);
      setCategories(cats.data.data.categories?.slice(0, 8) || CATEGORIES);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="page-container py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-primary-100 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {loading ? '...' : `${latestJobs.length > 0 ? '10,000+' : 'Thousands of'} jobs available now`}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Find Your Next<br />
              <span className="text-primary-200">Dream Opportunity</span>
            </h1>
            <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Connect with top companies hiring now. Search thousands of jobs and apply with confidence.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input type="text" placeholder="Job title, keyword, company..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent" />
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 border-l border-slate-200 flex-1">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input type="text" placeholder="Location (city, remote...)"
                  value={location} onChange={e => setLocation(e.target.value)}
                  className="flex-1 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent" />
              </div>
              <button type="submit" className="btn-primary rounded-xl sm:w-auto w-full py-3 font-semibold text-sm">
                Search Jobs
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-sm text-primary-200">
              <span>Popular:</span>
              {['React Developer', 'Product Manager', 'UI Designer', 'Data Analyst'].map(term => (
                <button key={term} onClick={() => navigate(`/jobs?q=${term}`)}
                  className="hover:text-white hover:underline transition-colors">
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-primary-800/60 border-t border-primary-700/50">
          <div className="page-container py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary-200" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-base">{value}</div>
                    <div className="text-primary-300 text-xs">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Browse by Category</h2>
              <p className="text-slate-500 text-sm mt-1">Find jobs in your area of expertise</p>
            </div>
            <Link to="/jobs" className="text-sm text-primary-600 hover:underline flex items-center gap-1 font-medium">
              All jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/jobs?category=${cat.name}`}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${cat.color}`}>
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-semibold leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ── */}
      <section className="py-16 bg-background">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Jobs</h2>
              <p className="text-slate-500 text-sm mt-1">Handpicked opportunities from top employers</p>
            </div>
            <Link to="/jobs" className="text-sm text-primary-600 hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.map(job => <JobCard key={job._id} job={job} />)}
              {featuredJobs.length === 0 && (
                <div className="col-span-3 text-center py-12 text-slate-500 text-sm">
                  No featured jobs at the moment. <Link to="/jobs" className="text-primary-600 hover:underline">Browse all jobs</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Latest Jobs ── */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Latest Opportunities</h2>
              <p className="text-slate-500 text-sm mt-1">Fresh jobs posted in the last 24 hours</p>
            </div>
            <Link to="/jobs?sort=-createdAt" className="text-sm text-primary-600 hover:underline flex items-center gap-1 font-medium">
              See more <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestJobs.map(job => <JobCard key={job._id} job={job} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-20 bg-primary-50">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="section-title">How It Works for Job Seekers</h2>
            <p className="text-slate-500 mt-2">Get hired in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS_SEEKER.map((item, i) => (
              <div key={item.step} className="text-center relative">
                {i < 2 && <div className="hidden md:block absolute top-8 left-3/4 w-1/2 h-px bg-primary-200 border-t-2 border-dashed border-primary-300" />}
                <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/register" className="btn-primary btn-lg">Create Free Account</Link>
          </div>
        </div>
      </section>

      {/* ── Employer CTA ── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Hiring? Find Top Talent Fast</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">Post your jobs and reach thousands of qualified candidates. Our smart matching helps you find the right fit.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register?role=employer" className="btn-primary btn-lg">Post a Job Free</Link>
              <Link to="/companies" className="btn-outline btn-lg border-slate-600 text-slate-200 hover:bg-slate-800">Learn More</Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
              {['No credit card required', 'First 3 posts free', 'Cancel anytime'].map(text => (
                <div key={text} className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-400" />{text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
