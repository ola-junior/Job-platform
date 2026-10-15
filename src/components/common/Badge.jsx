import { workModeLabel, employmentTypeLabel, experienceLevelLabel, applicationStatusLabel, applicationStatusClass, jobStatusClass } from '../../utils/helpers';

export function WorkModeBadge({ mode }) {
  const colors = { REMOTE: 'badge-green', HYBRID: 'badge-blue', ON_SITE: 'badge-gray' };
  return <span className={colors[mode] || 'badge-gray'}>{workModeLabel[mode] || mode}</span>;
}

export function EmploymentTypeBadge({ type }) {
  return <span className="badge-blue">{employmentTypeLabel[type] || type}</span>;
}

export function ExperienceBadge({ level }) {
  return <span className="badge-purple">{experienceLevelLabel[level] || level}</span>;
}

export function ApplicationStatusBadge({ status }) {
  return <span className={applicationStatusClass[status] || 'badge-gray'}>{applicationStatusLabel[status] || status}</span>;
}

export function JobStatusBadge({ status }) {
  return <span className={jobStatusClass[status] || 'badge-gray'}>{status}</span>;
}
