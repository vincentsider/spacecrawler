import { MapPin, Building2, Calendar, ExternalLink } from 'lucide-react'
import { Job } from '@/app/lib/supabase'
import { cn, formatDate } from '@/app/lib/utils'

interface JobCardProps {
  job: Job
  variant?: 'default' | 'compact'
}

export function JobCard({ job, variant = 'default' }: JobCardProps) {
  const locationTypeColors = {
    remote: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    onsite: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    hybrid: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  }

  if (variant === 'compact') {
    return (
      <div className="group relative rounded-lg border bg-white p-4 transition-all hover:shadow-md dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {job.title}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {job.company_name}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              )}
            </div>
          </div>
          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-lg dark:bg-gray-900">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {job.title}
            </h3>
            <p className="mt-1 text-lg text-gray-700 dark:text-gray-300">
              {job.company_name}
            </p>
          </div>
          {job.location_type && (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                locationTypeColors[job.location_type]
              )}
            >
              {job.location_type === 'remote' ? 'Remote' : 
               job.location_type === 'onsite' ? 'On-site' : 
               job.location_type === 'hybrid' ? 'Hybrid' : job.location_type}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
          )}
          {job.publication_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(job.publication_date)}
            </span>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <p className="mt-4 line-clamp-3 text-gray-600 dark:text-gray-400">
            {job.description}
          </p>
        )}

        {/* Salary */}
        {job.salary_range && (
          <p className="mt-3 font-medium text-gray-900 dark:text-white">
            {job.salary_range}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Apply Now
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}