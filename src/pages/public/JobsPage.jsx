import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, X, Briefcase, ChevronDown } from 'lucide-react';
import { jobsService } from '../../services/jobs.service';
import { useDebounce } from '../../hooks/useDebounce';
import { formatSalary, workModeLabel, employmentTypeLabel, experienceLevelLabel, timeAgo } from '../../utils/helpers';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { SkeletonCard } from '../../components/common/Skeleton';
import { WorkModeBadge, EmploymentTypeBadge } from '../../components/common/Badge';

const WORK_MODES = ['REMOTE', 'HYBRID', 'ON_SITE'];
const EMP_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];
const EXP_LEVELS = ['ENTRY', 'MID', 'SENIOR', 'EXECUTIVE'];
const DATE_POSTED = [{ value: '24h', label: 'Last 24 hours' }, { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' }];

function JobListCard({ job }) {
  return (
    <Link to={`/jobs/${job._id}`} className="card-hover p-5 flex gap-4 items-start">
      <Avatar src={job.company?.logo?.url} name={job.company?.name} size="lg" className="rounded-xl flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-900 hover:text-primary-600 transition-colors">{job.title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{job.company?.name} · {job.location}</p>
          </div>
          {job.salary && !job.salary.isHidden && (
            <span className="text-sm font-semibold text-primary-600 flex-shrink-0">{formatSalary(job.salary)}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <WorkModeBadge mode={job.workMode} />
          <EmploymentTypeBadge type={job.employmentType} />
          <span className="badge-gray">{experienceLevelLabel[job.experienceLevel]}</span>
        </div>
        <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-400">
          <span>{timeAgo(job.createdAt)}</span>
          {job.applicationCount > 0 && <span>{job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}</span>}
          {job.isSaved && <span className="text-primary-500 font-medium">Saved</span>}
        </div>
      </div>
    </Link>
  );
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 pb-4 mb-4">
      <button className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-slate-800" onClick={() => setOpen(!open)}>
        {title} <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  );
}

function CheckboxFilter({ options, value, onChange, getLabel, getValue }) {
  return (
    <div className="space-y-2">
      {options.map(opt => {
        const v = getValue ? getValue(opt) : opt;
        const checked = value.includes(v);
        return (
          <label key={v} className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={checked} onChange={() => onChange(checked ? value.filter(x => x !== v) : [...value, v])}
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-slate-600 group-hover:text-slate-900">{getLabel ? getLabel(opt) : opt}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filterOpen, setFilterOpen] = useState(false);

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [workModes, setWorkModes] = useState(searchParams.get('workMode') ? [searchParams.get('workMode')] : []);
  const [empTypes, setEmpTypes] = useState(searchParams.get('employmentType') ? [searchParams.get('employmentType')] : []);
  const [expLevels, setExpLevels] = useState([]);
  const [datePosted, setDatePosted] = useState('');
  const [page, setPage] = useState(1);

  const debouncedQ = useDebounce(q, 400);
  const debouncedLocation = useDebounce(location, 400);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (debouncedQ) params.q = debouncedQ;
      if (debouncedLocation) params.location = debouncedLocation;
      if (workModes.length === 1) params.workMode = workModes[0];
      if (empTypes.length === 1) params.employmentType = empTypes[0];
      if (expLevels.length === 1) params.experienceLevel = expLevels[0];
      if (datePosted) params.datePosted = datePosted;
      if (searchParams.get('category')) params.category = searchParams.get('category');

      const { data } = await jobsService.getAll(params);
      setJobs(data.data.jobs || []);
      setPagination(data.data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [debouncedQ, debouncedLocation, workModes, empTypes, expLevels, datePosted, page, searchParams]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { setPage(1); }, [debouncedQ, debouncedLocation, workModes, empTypes, expLevels, datePosted]);

  const clearFilters = () => {
    setWorkModes([]); setEmpTypes([]); setExpLevels([]); setDatePosted('');
  };

  const hasFilters = workModes.length || empTypes.length || expLevels.length || datePosted;

  return (
    <div className="page-container py-8">
      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all bg-white">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Job title, keyword..." className="flex-1 text-sm outline-none placeholder-slate-400" />
          {q && <button onClick={() => setQ('')}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>}
        </div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary-500 sm:w-56 bg-white">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location..." className="flex-1 text-sm outline-none placeholder-slate-400" />
        </div>
        <button onClick={() => setFilterOpen(!filterOpen)} className={`btn-outline flex items-center gap-2 sm:hidden ${hasFilters ? 'border-primary-300 text-primary-600' : ''}`}>
          <SlidersHorizontal className="w-4 h-4" /> Filters {hasFilters ? `(${Number(workModes.length) + Number(empTypes.length) + Number(expLevels.length) + (datePosted ? 1 : 0)})` : ''}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`w-60 flex-shrink-0 ${filterOpen ? 'block' : 'hidden'} sm:block`}>
          <div className="card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">Filters</h3>
              {hasFilters && <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline">Clear all</button>}
            </div>
            <FilterSection title="Work Mode">
              <CheckboxFilter options={WORK_MODES} value={workModes} onChange={setWorkModes} getLabel={v => workModeLabel[v]} />
            </FilterSection>
            <FilterSection title="Employment Type">
              <CheckboxFilter options={EMP_TYPES} value={empTypes} onChange={setEmpTypes} getLabel={v => employmentTypeLabel[v]} />
            </FilterSection>
            <FilterSection title="Experience Level">
              <CheckboxFilter options={EXP_LEVELS} value={expLevels} onChange={setExpLevels} getLabel={v => experienceLevelLabel[v]} />
            </FilterSection>
            <FilterSection title="Date Posted">
              <div className="space-y-2">
                {DATE_POSTED.map(d => (
                  <label key={d.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="datePosted" value={d.value} checked={datePosted === d.value} onChange={e => setDatePosted(e.target.value)}
                      className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" />
                    <span className="text-sm text-slate-600">{d.label}</span>
                  </label>
                ))}
                {datePosted && <button onClick={() => setDatePosted('')} className="text-xs text-primary-600 hover:underline">Clear</button>}
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Job List */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {loading ? 'Searching...' : `${pagination.total.toLocaleString()} job${pagination.total !== 1 ? 's' : ''} found`}
            </p>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="No jobs found"
              description="Try adjusting your search terms or filters to find more results."
              action={<button onClick={clearFilters} className="btn-primary">Clear filters</button>} />
          ) : (
            <div className="space-y-3">
              {jobs.map(job => <JobListCard key={job._id} job={job} />)}
            </div>
          )}
          <Pagination page={pagination.page} pages={pagination.pages} onPage={setPage} />
        </div>
      </div>
    </div>
  );
}
