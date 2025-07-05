'use client'

import { useState, useEffect } from 'react'
import { Calendar, Filter } from 'lucide-react'
import { supabase, type Event } from '@/app/lib/supabase'
import { EventCard } from '@/app/components/event-card'
import { SearchBar } from '@/app/components/search-bar'
import { isUpcoming } from '@/app/lib/utils'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    type: 'all', // all, upcoming, past
    format: 'all', // all, virtual, in-person
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [events, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchEvents() {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true })

    if (data) {
      setEvents(data as Event[])
    }
    setLoading(false)
  }

  function applyFilters() {
    let filtered = [...events]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.organizer?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower)
      )
    }

    // Type filter (upcoming/past)
    if (filters.type === 'upcoming') {
      filtered = filtered.filter((event) => isUpcoming(event.event_date))
    } else if (filters.type === 'past') {
      filtered = filtered.filter((event) => !isUpcoming(event.event_date))
    }

    // Format filter (virtual/in-person)
    if (filters.format === 'virtual') {
      filtered = filtered.filter((event) => event.is_virtual)
    } else if (filters.format === 'in-person') {
      filtered = filtered.filter((event) => !event.is_virtual)
    }

    setFilteredEvents(filtered)
  }

  const upcomingCount = events.filter((e) => isUpcoming(e.event_date)).length
  const pastCount = events.filter((e) => !isUpcoming(e.event_date)).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Voice AI Events
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connect with the voice AI community at conferences, meetups, and workshops
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Filter className="h-5 w-5" />
                Filters
              </h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <SearchBar
                  placeholder="Search events..."
                  onSearch={(query) => setFilters({ ...filters, search: query })}
                />
              </div>

              {/* Event Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming ({upcomingCount})</option>
                  <option value="past">Past ({pastCount})</option>
                </select>
              </div>

              {/* Event Format */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Format
                </label>
                <select
                  value={filters.format}
                  onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="all">All Formats</option>
                  <option value="virtual">Virtual</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() =>
                  setFilters({
                    search: '',
                    type: 'all',
                    format: 'all',
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Clear Filters
              </button>
            </div>

            {/* Calendar View Toggle (placeholder) */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <Calendar className="h-4 w-4" />
                View Options
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Calendar view coming soon!
              </p>
            </div>
          </aside>

          {/* Event Listings */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? (
                  'Loading...'
                ) : (
                  <>
                    Showing {filteredEvents.length} of {events.length} events
                  </>
                )}
              </p>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="animate-pulse">
                      <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="p-6">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No events found matching your criteria.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      search: '',
                      type: 'all',
                      format: 'all',
                    })
                  }
                  className="mt-4 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}