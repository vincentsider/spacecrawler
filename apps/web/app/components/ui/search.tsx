'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, X, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  title: string
  type: 'job' | 'event' | 'product'
  description?: string
  url: string
}

interface SearchProps {
  placeholder?: string
  className?: string
  variant?: 'default' | 'minimal' | 'hero'
}

export function Search({ placeholder = 'Search jobs, events, products...', className, variant = 'default' }: SearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Mock search function - replace with actual API call
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock results - replace with actual search
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Senior Voice AI Engineer',
        type: 'job',
        description: 'Build cutting-edge voice AI systems',
        url: '/jobs/1'
      },
      {
        id: '2',
        title: 'Voice AI Summit 2024',
        type: 'event',
        description: 'Annual conference for voice technology',
        url: '/events/2'
      },
      {
        id: '3',
        title: 'VoiceFlow Pro',
        type: 'product',
        description: 'Design voice experiences without code',
        url: '/products/3'
      }
    ].filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setResults(mockResults)
    setIsLoading(false)
  }

  // Handle search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return

    // Save to recent searches
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))

    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
    setIsOpen(false)
    setQuery('')
  }

  const typeIcons = {
    job: '💼',
    event: '📅',
    product: '🚀'
  }

  const typeColors = {
    job: 'text-blue-600',
    event: 'text-purple-600',
    product: 'text-green-600'
  }

  const variantStyles = {
    default: 'h-12 bg-card border border-border',
    minimal: 'h-10 bg-transparent border-b border-border rounded-none',
    hero: 'h-16 bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/60'
  }

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <SearchIcon className={cn(
          'absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground',
          variant === 'hero' && 'text-white/60'
        )} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query)
            }
          }}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl pl-12 pr-12 font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            variantStyles[variant]
          )}
        />

        {/* Clear Button */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1',
                'hover:bg-muted',
                variant === 'hero' && 'hover:bg-white/10'
              )}
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl bg-card shadow-xl"
          >
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}

            {/* Search Results */}
            {!isLoading && query && results.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Results</div>
                {results.map((result) => (
                  <motion.a
                    key={result.id}
                    href={result.url}
                    className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                    whileHover={{ x: 4 }}
                  >
                    <span className="text-2xl">{typeIcons[result.type]}</span>
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.description && (
                        <div className="text-sm text-muted-foreground">{result.description}</div>
                      )}
                      <div className={cn('text-xs font-medium', typeColors[result.type])}>
                        {result.type}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && query && results.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No results found for "{query}"</p>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">Recent Searches</span>
                </div>
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setQuery(search)
                      performSearch(search)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                    whileHover={{ x: 4 }}
                  >
                    <SearchIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{search}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Trending Searches */}
            {!query && (
              <div className="border-t border-border p-2">
                <div className="flex items-center gap-2 px-3 py-2">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">Trending</span>
                </div>
                {['Voice AI Engineer', 'AI Conference 2024', 'Speech Recognition'].map((trend, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setQuery(trend)
                      performSearch(trend)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                    whileHover={{ x: 4 }}
                  >
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>{trend}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}