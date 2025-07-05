import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Product } from '@/app/lib/supabase'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact'
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/products/${product.id}`}
        className="group relative block rounded-lg border bg-white p-4 transition-all hover:shadow-md dark:bg-gray-900"
      >
        <div className="flex items-start gap-4">
          {product.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.logo_url}
              alt={product.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {product.company_name}
            </p>
            {product.short_description && (
              <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {product.short_description}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative block overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-lg dark:bg-gray-900"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          {product.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.logo_url}
              alt={product.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {product.name}
            </h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300">
              {product.company_name}
            </p>
          </div>
        </div>

        {/* Tagline */}
        {product.tagline && (
          <p className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {product.tagline}
          </p>
        )}

        {/* Description */}
        {product.short_description && (
          <p className="mt-3 line-clamp-3 text-gray-600 dark:text-gray-400">
            {product.short_description}
          </p>
        )}

        {/* Features */}
        {product.key_features && product.key_features.length > 0 && (
          <ul className="mt-4 space-y-1">
            {product.key_features.slice(0, 3).map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                <span className="line-clamp-1">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          {product.pricing_model && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {product.pricing_model}
            </span>
          )}
          <div className="flex items-center gap-2 text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300">
            <span className="text-sm font-medium">Learn more</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}