import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (date) => {
  if (!date) return '';
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return ''; }
};

export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '';
  try { return format(new Date(date), fmt); }
  catch { return ''; }
};

export const formatSalary = (salary) => {
  if (!salary) return 'Not disclosed';
  const { min, max, currency = 'USD', period = 'YEARLY', isHidden } = salary;
  if (isHidden) return 'Competitive';
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  const periodMap = { HOURLY: '/hr', DAILY: '/day', WEEKLY: '/wk', MONTHLY: '/mo', YEARLY: '/yr' };
  if (min && max) return `${fmt(min)} – ${fmt(max)}${periodMap[period] || ''}`;
  if (min) return `From ${fmt(min)}${periodMap[period] || ''}`;
  if (max) return `Up to ${fmt(max)}${periodMap[period] || ''}`;
  return 'Not disclosed';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const workModeLabel = { REMOTE: 'Remote', HYBRID: 'Hybrid', ON_SITE: 'On-site' };
export const employmentTypeLabel = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time',
  CONTRACT: 'Contract', INTERNSHIP: 'Internship', FREELANCE: 'Freelance',
};
export const experienceLevelLabel = { ENTRY: 'Entry Level', MID: 'Mid Level', SENIOR: 'Senior', EXECUTIVE: 'Executive' };

export const workModeBadgeClass = {
  REMOTE: 'badge-green', HYBRID: 'badge-blue', ON_SITE: 'badge-gray',
};

export const applicationStatusLabel = {
  APPLIED: 'Applied', REVIEWING: 'Under Review', SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview', OFFER: 'Offer', REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn', HIRED: 'Hired',
};

export const applicationStatusClass = {
  APPLIED: 'badge-blue', REVIEWING: 'badge-yellow', SHORTLISTED: 'badge-purple',
  INTERVIEW: 'badge-blue', OFFER: 'badge-green', REJECTED: 'badge-red',
  WITHDRAWN: 'badge-gray', HIRED: 'badge-green',
};

export const jobStatusClass = {
  DRAFT: 'badge-gray', PUBLISHED: 'badge-green', PAUSED: 'badge-yellow',
  CLOSED: 'badge-red', EXPIRED: 'badge-red',
};

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};

export const truncate = (str, n = 100) => str?.length > n ? str.slice(0, n) + '...' : str;
