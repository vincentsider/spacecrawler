'use client'

import { useState, useEffect } from 'react'
import { Package, Filter, Tag } from 'lucide-react'
import { supabase, type Product } from '@/app/lib/supabase'
import { ProductCard } from '@/app/components/product-card'
import { SearchBar } from '@/app/components/search-bar'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    pricing: 'all',
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (data) {
      setProducts(data as Product[])
    }
    setLoading(false)
  }

  function applyFilters() {
    let filtered = [...products]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.company_name.toLowerCase().includes(searchLower) ||
          product.short_description?.toLowerCase().includes(searchLower) ||
          product.full_description?.toLowerCase().includes(searchLower) ||
          product.tagline?.toLowerCase().includes(searchLower)
      )
    }

    // Pricing filter
    if (filters.pricing !== 'all') {
      filtered = filtered.filter((product) => {
        const pricing = product.pricing_model?.toLowerCase() || ''
        if (filters.pricing === 'free') {
          return pricing.includes('free')
        } else if (filters.pricing === 'paid') {
          return !pricing.includes('free')
        }
        return true
      })
    }

    setFilteredProducts(filtered)
  }

  // Extract categories from use cases and features
  const getCategories = () => {
    const categories = new Set<string>()
    products.forEach((product) => {
      // Add some predefined categories based on common voice AI use cases
      if (product.use_cases) {
        product.use_cases.forEach((useCase) => {
          const lower = useCase.toLowerCase()
          if (lower.includes('transcription') || lower.includes('speech-to-text')) {
            categories.add('Transcription')
          }
          if (lower.includes('synthesis') || lower.includes('text-to-speech')) {
            categories.add('Voice Synthesis')
          }
          if (lower.includes('assistant') || lower.includes('chatbot')) {
            categories.add('Voice Assistants')
          }
          if (lower.includes('analytics') || lower.includes('analysis')) {
            categories.add('Voice Analytics')
          }
          if (lower.includes('api') || lower.includes('platform')) {
            categories.add('Developer Tools')
          }
        })
      }
    })
    return Array.from(categories).sort()
  }

  const categories = getCategories()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Voice AI Products
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Explore cutting-edge voice AI tools and platforms
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
                  placeholder="Search products..."
                  onSearch={(query) => setFilters({ ...filters, search: query })}
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pricing
                </label>
                <select
                  value={filters.pricing}
                  onChange={(e) => setFilters({ ...filters, pricing: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="all">All Pricing</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() =>
                  setFilters({
                    search: '',
                    category: 'all',
                    pricing: 'all',
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Clear Filters
              </button>
            </div>

            {/* Categories Overview */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <Tag className="h-4 w-4" />
                Popular Categories
              </h3>
              <div className="space-y-2">
                {categories.slice(0, 5).map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilters({ ...filters, category })}
                    className="block w-full text-left text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Listings */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? (
                  'Loading...'
                ) : (
                  <>
                    Showing {filteredProducts.length} of {products.length} products
                  </>
                )}
              </p>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                  >
                    <div className="animate-pulse">
                      <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No products found matching your criteria.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      search: '',
                      category: 'all',
                      pricing: 'all',
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