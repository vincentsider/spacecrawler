import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, ExternalLink, Sparkles, CheckCircle, Play } from 'lucide-react'
import { supabase, type Product } from '@/app/lib/supabase'

async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  return data as Product
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Product Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                {product.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.logo_url}
                    alt={product.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h1>
                <p className="mt-2 text-xl text-gray-700 dark:text-gray-300">
                  {product.company_name}
                </p>
                {product.tagline && (
                  <p className="mt-3 text-lg font-medium text-indigo-600 dark:text-indigo-400">
                    {product.tagline}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-4">
                  <a
                    href={product.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
                  >
                    <Globe className="h-5 w-5" />
                    Visit Website
                  </a>
                  {product.demo_url && (
                    <a
                      href={product.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Play className="h-5 w-5" />
                      Try Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              About {product.name}
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400">
                {product.full_description || product.short_description}
              </p>
            </div>
          </div>

          {/* Key Features */}
          {product.key_features && product.key_features.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Key Features
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {product.key_features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Use Cases */}
          {product.use_cases && product.use_cases.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Use Cases
              </h2>
              <div className="space-y-4">
                {product.use_cases.map((useCase, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg bg-gray-50 dark:bg-gray-900 p-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      {index + 1}
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">{useCase}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          {product.pricing_model && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Pricing
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {product.pricing_model}
              </p>
            </div>
          )}

          {/* Screenshots */}
          {product.screenshots && product.screenshots.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Screenshots
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {product.screenshots.map((screenshot, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={index}
                    src={screenshot}
                    alt={`${product.name} screenshot ${index + 1}`}
                    className="rounded-lg border dark:border-gray-700"
                  />
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Ready to get started with {product.name}?
            </h3>
            <p className="text-indigo-100 mb-6">
              Visit their website to learn more and sign up.
            </p>
            <a
              href={product.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-lg font-medium text-indigo-600 hover:bg-gray-100"
            >
              Get Started
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}