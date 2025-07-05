"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  company_name: string
  tagline: string
  description: string
  website_url: string
  pricing_info: string | null
  launch_date: string | null
  status: string
  crawled_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProducts()
  }, [filter])

  const loadProducts = async () => {
    setLoading(true)
    try {
      let query = supabase.from('products').select('*').order('crawled_at', { ascending: false })
      
      if (filter !== 'all') {
        // Map 'approved' filter to include both 'approved' and 'published'
        if (filter === 'approved') {
          query = query.in('status', ['approved', 'published'])
        } else {
          query = query.eq('status', filter)
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading products:', error)
      } else {
        setProducts(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProductStatus = async (productId: string, newStatus: 'approved' | 'rejected' | 'published') => {
    try {
      const updateData: any = { 
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      }
      
      // If publishing, also set published_at
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)

      if (!error) {
        setProducts(products.map(product => 
          product.id === productId ? { ...product, status: newStatus } : product
        ))
      }
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const publishProduct = async (product: Product) => {
    await updateProductStatus(product.id, 'published')
    alert('Product published to Voice AI Space!')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            color: '#a78bfa',
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '1rem',
            padding: 0
          }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '0.5rem'
        }}>
          Product Reviews
        </h1>
        <p style={{ color: '#94a3b8' }}>
          Review and approve voice AI products
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        paddingBottom: '1rem'
      }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              background: filter === status ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'none',
              border: 'none',
              color: filter === status ? 'white' : '#94a3b8',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: filter === status ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>
                ({products.filter(p => p.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Products List */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'white', padding: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: '#94a3b8',
          padding: '4rem',
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
          No {filter !== 'all' ? filter : ''} products found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                padding: '2rem',
                transition: 'all 0.2s'
              }}
            >
              {/* Product Header */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '0.25rem'
                    }}>
                      {product.name}
                    </h2>
                    <p style={{ color: '#a78bfa', fontSize: '1rem' }}>{product.tagline}</p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: product.status === 'pending' ? '#fbbf2420' : 
                               product.status === 'approved' ? '#10b98120' : '#ef444420',
                    color: product.status === 'pending' ? '#fbbf24' : 
                           product.status === 'approved' ? '#10b981' : '#ef4444',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    {product.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                  <span>🏢 {product.company_name}</span>
                  {product.pricing_info && <span>💰 {product.pricing_info}</span>}
                  {product.launch_date && <span>🚀 {new Date(product.launch_date).toLocaleDateString()}</span>}
                </div>
              </div>

              {/* Product Description */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>Description</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6' }}>
                  {product.description?.substring(0, 300)}...
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <a
                  href={product.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#a78bfa',
                    fontSize: '0.875rem',
                    textDecoration: 'none'
                  }}
                >
                  Visit Website →
                </a>
                
                {product.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateProductStatus(product.id, 'rejected')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => publishProduct(product)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                    >
                      Send to Space ✨
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}