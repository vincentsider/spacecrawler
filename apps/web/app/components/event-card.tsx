import { Calendar, Clock, MapPin, Users, Tag, ExternalLink } from 'lucide-react'
import { Event } from '@/app/lib/supabase'
import { cn, formatEventDate, isUpcoming } from '@/app/lib/utils'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'compact'
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const upcoming = isUpcoming(event.event_date)

  if (variant === 'compact') {
    return (
      <div className="group relative rounded-lg border bg-white p-4 transition-all hover:shadow-md dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {event.title}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatEventDate(event.event_date, event.event_time)}
              </span>
              {event.is_virtual ? (
                <span className="text-indigo-600 dark:text-indigo-400">Virtual</span>
              ) : (
                event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                )
              )}
            </div>
          </div>
          <a
            href={event.registration_url}
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
      {/* Image */}
      {event.image_url && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {event.title}
            </h3>
            {event.organizer && (
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                {event.organizer}
              </p>
            )}
          </div>
          {upcoming && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Upcoming
            </span>
          )}
        </div>

        {/* Date & Location */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatEventDate(event.event_date)}
          </span>
          {event.event_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {event.event_time}
            </span>
          )}
          {event.is_virtual ? (
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              Virtual Event
            </span>
          ) : (
            event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            )
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="mt-4 line-clamp-3 text-gray-600 dark:text-gray-400">
            {event.description}
          </p>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {event.price && (
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {event.price}
              </p>
            )}
          </div>
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium',
              upcoming
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            {upcoming ? 'Register' : 'View Event'}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}