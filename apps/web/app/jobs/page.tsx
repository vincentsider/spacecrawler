'use client'

import { useState, useEffect } from 'react'
import { Building2, Filter, MapPin, Clock, DollarSign, Sparkles, TrendingUp, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, type Job } from '@/app/lib/supabase'
import { FeatureCard } from '@/app/components/ui/feature-card'
import { Search } from '@/app/components/ui/search'
import { Button } from '@/app/components/ui/button'
import { ScrollAnimation } from '@/app/components/ui/scroll-animation'
import { cn } from '@/app/lib/utils'

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    location_type: 'all',
    company: 'all',
    type: 'all',
    salary_range: 'all',
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [jobs, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchJobs() {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (data) {
      setJobs(data as Job[])
    }
    setLoading(false)
  }

  function applyFilters() {
    let filtered = [...jobs]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower) ||
          job.location?.toLowerCase().includes(searchLower)
      )
    }

    // Location type filter
    if (filters.location_type !== 'all') {
      filtered = filtered.filter((job) => job.location_type === filters.location_type)
    }

    // Company filter
    if (filters.company !== 'all') {
      filtered = filtered.filter((job) => job.company === filters.company)
    }

    // Job type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter((job) => job.type === filters.type)
    }

    setFilteredJobs(filtered)
  }

  const companies = Array.from(new Set(jobs.map((job) => job.company))).sort()

  // Featured companies (mock data - replace with actual featured logic)
  const featuredCompanies = [
    { name: 'OpenAI', logo: '🤖', jobCount: 12 },
    { name: 'Google', logo: '🔍', jobCount: 8 },
    { name: 'Amazon', logo: '📦', jobCount: 15 },
    { name: 'Microsoft', logo: '💻', jobCount: 10 },
  ]

  const jobCategories = [
    { name: 'Engineering', icon: '⚡', count: 45 },
    { name: 'Product', icon: '🚀', count: 23 },
    { name: 'Design', icon: '🎨', count: 12 },
    { name: 'Sales', icon: '💰', count: 18 },
    { name: 'Marketing', icon: '📈', count: 15 },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative mx-auto px-4">
          <ScrollAnimation>
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">500+ Voice AI Opportunities</span>
              </motion.div>
              <h1 className="mb-6">Find Your Dream Voice AI Job</h1>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                Connect with leading companies building the future of conversational AI and voice technology
              </p>
            </div>
          </ScrollAnimation>

          {/* Search Bar */}
          <ScrollAnimation delay={0.2}>
            <div className="mx-auto mt-12 max-w-3xl">
              <Search
                placeholder="Search by title, company, or location..."
                className="shadow-xl"
              />
            </div>
          </ScrollAnimation>

          {/* Quick Stats */}
          <ScrollAnimation delay={0.3}>
            <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { label: 'Active Jobs', value: jobs.length, icon: Building2, color: 'text-primary' },
                { label: 'Companies Hiring', value: companies.length, icon: TrendingUp, color: 'text-accent' },
                { label: 'Remote Positions', value: jobs.filter(j => j.location_type === 'remote').length, icon: MapPin, color: 'text-success' },
                { label: 'New Today', value: '24', icon: Sparkles, color: 'text-warning' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className={cn('mx-auto mb-2 h-8 w-8', stat.color)} />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="border-b border-border/50 py-12">
        <div className="container mx-auto px-4">
          <ScrollAnimation>
            <h2 className="mb-8 text-center text-2xl font-bold">Hiring at Top Companies</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {featuredCompanies.map((company, index) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group cursor-pointer rounded-xl bg-card p-6 text-center shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="mb-3 text-4xl">{company.logo}</div>
                  <h3 className="font-semibold">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">{company.jobCount} open roles</p>
                </motion.div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden lg:block lg:w-80">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24 rounded-2xl bg-card p-6 shadow-lg"
              >
                <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                  <Filter className="h-5 w-5" />
                  Filter Jobs
                </h2>

                {/* Job Categories */}
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold">Categories</h3>
                  <div className="space-y-2">
                    {jobCategories.map((category) => (
                      <button
                        key={category.name}
                        className="flex w-full items-center justify-between rounded-lg p-3 text-sm transition-colors hover:bg-muted"
                      >
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Type */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold">
                    Location Type
                  </label>
                  <select
                    value={filters.location_type}
                    onChange={(e) =>
                      setFilters({ ...filters, location_type: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Locations</option>
                    <option value="remote">🌍 Remote Only</option>
                    <option value="onsite">🏢 On-site Only</option>
                    <option value="hybrid">🔄 Hybrid</option>
                  </select>
                </div>

                {/* Job Type */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold">
                    Job Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                {/* Company Filter */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold">
                    Company
                  </label>
                  <select
                    value={filters.company}
                    onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Companies</option>
                    {companies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() =>
                    setFilters({
                      search: '',
                      location_type: 'all',
                      company: 'all',
                      type: 'all',
                      salary_range: 'all',
                    })
                  }
                >
                  Clear All Filters
                </Button>
              </motion.div>
            </aside>

            {/* Mobile Filters Button */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                icon={Filter}
                fullWidth
                onClick={() => setShowFilters(true)}
              >
                Filters ({Object.values(filters).filter(v => v !== 'all' && v !== '').length})
              </Button>
            </div>

            {/* Job Listings */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {loading ? 'Loading...' : `${filteredJobs.length} Jobs Found`}
                  </h2>
                  <p className="text-muted-foreground">
                    {filters.search && `Results for "${filters.search}"`}
                  </p>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <select className="rounded-lg border border-border bg-background px-3 py-1 text-sm">
                    <option>Most Recent</option>
                    <option>Most Relevant</option>
                    <option>Salary (High to Low)</option>
                  </select>
                </div>
              </div>

              {/* Job Cards */}
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl bg-card p-6 shadow-sm">
                      <div className="loading-shimmer h-6 w-3/4 rounded-lg mb-4" />
                      <div className="loading-shimmer h-4 w-1/2 rounded-lg mb-4" />
                      <div className="loading-shimmer h-4 w-full rounded-lg mb-2" />
                      <div className="loading-shimmer h-4 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <motion.div className="space-y-6">
                  {filteredJobs.map((job, index) => (
                    <ScrollAnimation key={job.id} delay={index * 0.05}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group relative overflow-hidden rounded-xl bg-card p-6 shadow-sm transition-all hover:shadow-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                {job.title}
                              </h3>
                              {job.location_type === 'remote' && (
                                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                                  Remote
                                </span>
                              )}
                            </div>
                            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {job.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location || 'Remote'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.type}
                              </span>
                              {job.salary_min && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="mb-4 line-clamp-2 text-muted-foreground">
                              {job.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {['React', 'Voice AI', 'Python', 'AWS'].map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-lg bg-muted px-3 py-1 text-xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="ml-6 flex flex-col items-end gap-3">
                            <span className="text-sm text-muted-foreground">
                              {new Date(job.published_at).toLocaleDateString()}
                            </span>
                            <Button variant="primary" size="sm">
                              Apply Now
                            </Button>
                          </div>
                        </div>
                        
                        {/* Hover gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </motion.div>
                    </ScrollAnimation>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl bg-card p-12 text-center shadow-sm"
                >
                  <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold">No jobs found</h3>
                  <p className="mb-6 text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters({
                        search: '',
                        location_type: 'all',
                        company: 'all',
                        type: 'all',
                        salary_range: 'all',
                      })
                    }
                  >
                    Clear all filters
                  </Button>
                </motion.div>
              )}

              {/* Load More */}
              {filteredJobs.length > 0 && (
                <div className="mt-12 text-center">
                  <Button variant="outline" size="lg">
                    Load More Jobs
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-sm bg-background shadow-xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="rounded-lg p-2 hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Mobile filter content - same as desktop */}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}