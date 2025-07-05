'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mic, Menu, X, Search as SearchIcon, Sun, Moon, ChevronDown, TrendingUp, Briefcase, Calendar, Package, Sparkles, BookOpen, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/app/lib/utils'
import { Search } from './ui/search'
import { Button } from './ui/button'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import * as Switch from '@radix-ui/react-switch'

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Track scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check for dark mode preference
  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(darkMode)
  }, [])

  const megaMenuContent = {
    jobs: {
      featured: [
        { title: 'Senior Voice AI Engineer', company: 'OpenAI', type: 'Full-time', icon: Briefcase },
        { title: 'Product Manager - Voice', company: 'Google', type: 'Remote', icon: Briefcase },
      ],
      categories: ['Engineering', 'Product', 'Design', 'Sales', 'Marketing'],
      stats: { total: '500+', new: '50+ today' }
    },
    events: {
      featured: [
        { title: 'Voice AI Summit 2024', date: 'Jan 15-17', location: 'San Francisco', icon: Calendar },
        { title: 'Conversational AI Workshop', date: 'Jan 20', location: 'Online', icon: Calendar },
      ],
      categories: ['Conferences', 'Workshops', 'Webinars', 'Meetups'],
      stats: { upcoming: '150+', thisMonth: '25' }
    },
    products: {
      featured: [
        { title: 'VoiceFlow Pro', category: 'Design Tool', badge: 'New', icon: Package },
        { title: 'Whisper API', category: 'API', badge: 'Popular', icon: Package },
      ],
      categories: ['APIs', 'SDKs', 'Platforms', 'Tools', 'Libraries'],
      stats: { total: '300+', trending: '15' }
    }
  }

  return (
    <>
      <header className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'bg-background/95 backdrop-blur-lg shadow-sm' : 'bg-background/80 backdrop-blur-sm',
        'border-b border-border/50'
      )}>
        <nav className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
              <motion.div 
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg"
                whileHover={{ rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Mic className="h-5 w-5 text-white" />
              </motion.div>
              <span className="font-serif text-2xl font-bold">Voice AI Space</span>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu.Root className="hidden lg:block">
              <NavigationMenu.List className="flex items-center gap-2">
                {/* Jobs Menu */}
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger className={cn(
                    'flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/jobs') ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  )}>
                    Jobs <ChevronDown className="h-3 w-3" />
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute left-0 top-full mt-2 w-[600px]">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-card p-6 shadow-xl"
                    >
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h3 className="mb-4 flex items-center gap-2 font-semibold">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Featured Jobs
                          </h3>
                          <div className="space-y-3">
                            {megaMenuContent.jobs.featured.map((job, index) => (
                              <Link
                                key={index}
                                href="/jobs"
                                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                              >
                                <job.icon className="h-5 w-5 text-primary" />
                                <div>
                                  <div className="font-medium">{job.title}</div>
                                  <div className="text-sm text-muted-foreground">{job.company} • {job.type}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-4 font-semibold">Browse by Category</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {megaMenuContent.jobs.categories.map((category) => (
                              <Link
                                key={category}
                                href={`/jobs?category=${category.toLowerCase()}`}
                                className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                              >
                                {category}
                              </Link>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
                            <div>
                              <div className="text-2xl font-bold">{megaMenuContent.jobs.stats.total}</div>
                              <div className="text-xs text-muted-foreground">Active Jobs</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-primary">{megaMenuContent.jobs.stats.new}</div>
                              <div className="text-xs text-muted-foreground">New Today</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>

                {/* Events Menu */}
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger className={cn(
                    'flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/events') ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  )}>
                    Events <ChevronDown className="h-3 w-3" />
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute left-0 top-full mt-2 w-[600px]">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-card p-6 shadow-xl"
                    >
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h3 className="mb-4 flex items-center gap-2 font-semibold">
                            <Sparkles className="h-4 w-4 text-accent" />
                            Featured Events
                          </h3>
                          <div className="space-y-3">
                            {megaMenuContent.events.featured.map((event, index) => (
                              <Link
                                key={index}
                                href="/events"
                                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                              >
                                <event.icon className="h-5 w-5 text-accent" />
                                <div>
                                  <div className="font-medium">{event.title}</div>
                                  <div className="text-sm text-muted-foreground">{event.date} • {event.location}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-4 font-semibold">Event Types</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {megaMenuContent.events.categories.map((category) => (
                              <Link
                                key={category}
                                href={`/events?type=${category.toLowerCase()}`}
                                className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                              >
                                {category}
                              </Link>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
                            <div>
                              <div className="text-2xl font-bold">{megaMenuContent.events.stats.upcoming}</div>
                              <div className="text-xs text-muted-foreground">Upcoming</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-accent">{megaMenuContent.events.stats.thisMonth}</div>
                              <div className="text-xs text-muted-foreground">This Month</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>

                {/* Products Menu */}
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger className={cn(
                    'flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/products') ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  )}>
                    Products <ChevronDown className="h-3 w-3" />
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute left-0 top-full mt-2 w-[600px]">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-card p-6 shadow-xl"
                    >
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h3 className="mb-4 flex items-center gap-2 font-semibold">
                            <Package className="h-4 w-4 text-success" />
                            Featured Products
                          </h3>
                          <div className="space-y-3">
                            {megaMenuContent.products.featured.map((product, index) => (
                              <Link
                                key={index}
                                href="/products"
                                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                              >
                                <product.icon className="h-5 w-5 text-success" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{product.title}</span>
                                    {product.badge && (
                                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                        {product.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{product.category}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-4 font-semibold">Categories</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {megaMenuContent.products.categories.map((category) => (
                              <Link
                                key={category}
                                href={`/products?category=${category.toLowerCase()}`}
                                className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                              >
                                {category}
                              </Link>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
                            <div>
                              <div className="text-2xl font-bold">{megaMenuContent.products.stats.total}</div>
                              <div className="text-xs text-muted-foreground">Products</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-success">{megaMenuContent.products.stats.trending}</div>
                              <div className="text-xs text-muted-foreground">Trending</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>

                {/* Resources Link */}
                <NavigationMenu.Item>
                  <Link
                    href="/resources"
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      pathname === '/resources' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                  >
                    <BookOpen className="h-4 w-4" />
                    Resources
                  </Link>
                </NavigationMenu.Item>

                {/* Community Link */}
                <NavigationMenu.Item>
                  <Link
                    href="/community"
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      pathname === '/community' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Community
                  </Link>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            </NavigationMenu.Root>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="hidden lg:flex"
              >
                <SearchIcon className="h-4 w-4" />
              </Button>

              {/* Dark Mode Toggle */}
              <div className="hidden lg:flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch.Root
                  checked={isDark}
                  onCheckedChange={setIsDark}
                  className="relative h-6 w-11 rounded-full bg-muted transition-colors data-[state=checked]:bg-primary"
                >
                  <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-lg transition-transform duration-200 will-change-transform data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* CTA Button */}
              <Button variant="gradient" size="sm" className="hidden lg:flex">
                Post a Job
              </Button>

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden rounded-lg p-2 hover:bg-muted"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="hidden lg:block overflow-hidden"
              >
                <div className="py-4">
                  <Search variant="default" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background shadow-xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b px-4">
                <span className="font-semibold">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-2 hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4">
                {/* Mobile Search */}
                <div className="mb-6">
                  <Search variant="default" />
                </div>

                {/* Mobile Navigation Links */}
                <nav className="space-y-1">
                  <Link
                    href="/jobs"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                      pathname.startsWith('/jobs') ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-5 w-5" />
                    Jobs
                  </Link>
                  <Link
                    href="/events"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                      pathname.startsWith('/events') ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    Events
                  </Link>
                  <Link
                    href="/products"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                      pathname.startsWith('/products') ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="h-5 w-5" />
                    Products
                  </Link>
                  <Link
                    href="/resources"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                      pathname === '/resources' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BookOpen className="h-5 w-5" />
                    Resources
                  </Link>
                  <Link
                    href="/community"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                      pathname === '/community' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users className="h-5 w-5" />
                    Community
                  </Link>
                </nav>

                {/* Mobile CTA */}
                <div className="mt-6">
                  <Button variant="gradient" fullWidth>
                    Post a Job
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>
      </header>
    </>
  )
}