"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Stats {
  jobs: { pending: number; approved: number; rejected: number; total: number }
  events: { pending: number; approved: number; rejected: number; total: number }
  products: { pending: number; approved: number; rejected: number; total: number }
}

interface RecentItem {
  id: string
  title: string
  type: 'job' | 'event' | 'product'
  status: string
  created_at: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    jobs: { pending: 0, approved: 0, rejected: 0, total: 0 },
    events: { pending: 0, approved: 0, rejected: 0, total: 0 },
    products: { pending: 0, approved: 0, rejected: 0, total: 0 }
  })
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load jobs stats
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('status')
      
      const jobStats = {
        pending: jobsData?.filter(j => j.status === 'pending').length || 0,
        approved: jobsData?.filter(j => j.status === 'approved').length || 0,
        rejected: jobsData?.filter(j => j.status === 'rejected').length || 0,
        total: jobsData?.length || 0
      }

      // Load events stats
      const { data: eventsData } = await supabase
        .from('events')
        .select('status')
      
      const eventStats = {
        pending: eventsData?.filter(e => e.status === 'pending').length || 0,
        approved: eventsData?.filter(e => e.status === 'approved').length || 0,
        rejected: eventsData?.filter(e => e.status === 'rejected').length || 0,
        total: eventsData?.length || 0
      }

      // Load products stats
      const { data: productsData } = await supabase
        .from('products')
        .select('status')
      
      const productStats = {
        pending: productsData?.filter(p => p.status === 'pending').length || 0,
        approved: productsData?.filter(p => p.status === 'approved').length || 0,
        rejected: productsData?.filter(p => p.status === 'rejected').length || 0,
        total: productsData?.length || 0
      }

      setStats({
        jobs: jobStats,
        events: eventStats,
        products: productStats
      })

      // Load recent items
      const { data: recentJobs } = await supabase
        .from('jobs')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentEvents } = await supabase
        .from('events')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      const allRecent: RecentItem[] = [
        ...(recentJobs?.map(j => ({ ...j, type: 'job' as const })) || []),
        ...(recentEvents?.map(e => ({ ...e, type: 'event' as const })) || []),
        ...(recentProducts?.map(p => ({ ...p, title: p.name, type: 'product' as const })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)

      setRecentItems(allRecent)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, stats, color, onClick }: any) => (
    <div 
      onClick={onClick}
      style={{
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: `linear-gradient(135deg, ${color}40, ${color}20)`,
        borderRadius: '50%',
        transform: 'translate(30px, -30px)'
      }} />
      
      <h3 style={{ 
        fontSize: '1.25rem', 
        fontWeight: 'bold', 
        color: 'white',
        marginBottom: '1rem' 
      }}>
        {title}
      </h3>
      
      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        color,
        marginBottom: '1rem' 
      }}>
        {stats.total}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
        <div>
          <span style={{ color: '#94a3b8' }}>Pending: </span>
          <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{stats.pending}</span>
        </div>
        <div>
          <span style={{ color: '#94a3b8' }}>Approved: </span>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>{stats.approved}</span>
        </div>
        <div>
          <span style={{ color: '#94a3b8' }}>Rejected: </span>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{stats.rejected}</span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '0.5rem'
        }}>
          SpaceCrawler Dashboard
        </h1>
        <p style={{ color: '#94a3b8' }}>
          Manage your voice AI content pipeline
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatCard 
          title="Jobs" 
          stats={stats.jobs} 
          color="#667eea"
          onClick={() => router.push('/jobs')}
        />
        <StatCard 
          title="Events" 
          stats={stats.events} 
          color="#764ba2"
          onClick={() => router.push('/events')}
        />
        <StatCard 
          title="Products" 
          stats={stats.products} 
          color="#f093fb"
          onClick={() => router.push('/products')}
        />
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '1.5rem'
        }}>
          Recent Activity
        </h2>

        {recentItems.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
            No items yet. Run the crawlers to populate data.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => router.push(`/${item.type}s`)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: item.type === 'job' ? '#667eea' : item.type === 'event' ? '#764ba2' : '#f093fb',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {item.type.toUpperCase()}
                    </span>
                    <h3 style={{ color: 'white', fontSize: '1rem' }}>{item.title}</h3>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  background: item.status === 'pending' ? '#fbbf2420' : 
                             item.status === 'approved' ? '#10b98120' : '#ef444420',
                  color: item.status === 'pending' ? '#fbbf24' : 
                         item.status === 'approved' ? '#10b981' : '#ef4444',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: '2rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => router.push('/jobs')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Review Pending Jobs
        </button>
        <button
          onClick={() => router.push('/events')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Review Pending Events
        </button>
      </div>
    </div>
  )
}