'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, type Job, type Event, type Product } from '@/app/lib/supabase'

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Load published jobs
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(6)

        // Load published events
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(6)

        // Load published products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(6)

        setJobs(jobsData || [])
        setEvents(eventsData || [])
        setProducts(productsData || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: 'white',
      fontFamily: 'Inter, -apple-system, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 2rem'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '3rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🚀
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              VoiceAI Space
            </h1>
          </div>

          {/* Hero Content */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              The Voice AI Hub
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#94a3b8',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Discover cutting-edge voice AI jobs, events, and products shaping the future of human-machine interaction
            </p>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' }}>
                {jobs.length}+
              </div>
              <div style={{ color: '#94a3b8' }}>Voice AI Jobs</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#764ba2' }}>
                {events.length}+
              </div>
              <div style={{ color: '#94a3b8' }}>Upcoming Events</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f093fb' }}>
                {products.length}+
              </div>
              <div style={{ color: '#94a3b8' }}>AI Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem'
      }}>
        {/* Jobs Section */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem' 
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              Latest Voice AI Jobs
            </h2>
            <Link href="/jobs" style={{
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '1rem'
            }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <p style={{ color: '#94a3b8' }}>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{ color: '#94a3b8' }}>No jobs published yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1.75rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.25)'
                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    color: 'white'
                  }}>
                    {job.title}
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    color: '#94a3b8'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '1rem' }}>🏢</span> {job.company_name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '1rem' }}>📍</span> {job.location}
                    </span>
                  </div>
                  <p style={{
                    color: '#cbd5e1',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    lineHeight: '1.5'
                  }}>
                    {job.description?.substring(0, 150)}...
                  </p>
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Apply Now →
                  </a>
                  {/* Gradient overlay on hover */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.1) 50%, transparent 100%)',
                    transition: 'left 0.5s ease-in-out',
                    pointerEvents: 'none'
                  }} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Events Section */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem' 
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              Upcoming Events
            </h2>
            <Link href="/events" style={{
              color: '#764ba2',
              textDecoration: 'none',
              fontSize: '1rem'
            }}>
              View all →
            </Link>
          </div>

          {events.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{ color: '#94a3b8' }}>No events published yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1.75rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(118, 75, 162, 0.25)'
                    e.currentTarget.style.borderColor = 'rgba(118, 75, 162, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    color: 'white'
                  }}>
                    {event.title}
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    color: '#94a3b8'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '1rem' }}>📅</span> {new Date(event.event_date).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '1rem' }}>📍</span> {event.location}
                    </span>
                  </div>
                  <p style={{
                    color: '#cbd5e1',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    lineHeight: '1.5'
                  }}>
                    {event.description?.substring(0, 150)}...
                  </p>
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
                      borderRadius: '8px',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Register →
                  </a>
                  {/* Gradient overlay on hover */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(118, 75, 162, 0.1) 50%, transparent 100%)',
                    transition: 'left 0.5s ease-in-out',
                    pointerEvents: 'none'
                  }} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Products Section */}
        <section>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem' 
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              Featured Products
            </h2>
            <Link href="/products" style={{
              color: '#f093fb',
              textDecoration: 'none',
              fontSize: '1rem'
            }}>
              View all →
            </Link>
          </div>

          {products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{ color: '#94a3b8' }}>No products published yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1.75rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(240, 147, 251, 0.25)'
                    e.currentTarget.style.borderColor = 'rgba(240, 147, 251, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    color: 'white'
                  }}>
                    {product.name}
                  </h3>
                  <p style={{
                    color: '#a78bfa',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                  }}>
                    {product.tagline}
                  </p>
                  <p style={{
                    color: '#cbd5e1',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    lineHeight: '1.5'
                  }}>
                    {product.description?.substring(0, 150)}...
                  </p>
                  <a
                    href={product.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      borderRadius: '8px',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Learn More →
                  </a>
                  {/* Gradient overlay on hover */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(240, 147, 251, 0.1) 50%, transparent 100%)',
                    transition: 'left 0.5s ease-in-out',
                    pointerEvents: 'none'
                  }} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Newsletter Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)',
        padding: '4rem 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}>
            Stay Ahead in Voice AI
          </h2>
          <p style={{
            color: '#94a3b8',
            marginBottom: '2rem',
            fontSize: '1.125rem'
          }}>
            Get weekly updates on the latest jobs, events, and products in voice AI
          </p>
          <form style={{
            display: 'flex',
            gap: '0.5rem',
            maxWidth: '450px',
            margin: '0 auto'
          }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Subscribe
            </button>
          </form>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem',
            marginTop: '1rem'
          }}>
            Join 5,000+ voice AI professionals. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0a0a0a',
        padding: '3rem 2rem 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Footer Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem'
          }}>
            {/* Brand Column */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  🚀
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: 0
                }}>
                  VoiceAI Space
                </h3>
              </div>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                Your premier destination for voice AI opportunities. Connecting talent with innovation.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                Explore
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {['Jobs', 'Events', 'Products', 'Companies', 'Resources'].map((item) => (
                  <li key={item}>
                    <a
                      href={`/${item.toLowerCase()}`}
                      style={{
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#667eea' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8' }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                Resources
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {['Blog', 'Newsletter', 'API', 'Documentation', 'Support'].map((item) => (
                  <li key={item}>
                    <a
                      href={`/${item.toLowerCase()}`}
                      style={{
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#667eea' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8' }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                Connect
              </h4>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {[
                  { icon: '𝕏', href: 'https://twitter.com/voiceaispace' },
                  { icon: '💼', href: 'https://linkedin.com/company/voiceaispace' },
                  { icon: '📧', href: 'mailto:hello@voiceaispace.com' }
                ].map((social) => (
                  <a
                    key={social.icon}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem'
              }}>
                hello@voiceaispace.com
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <p style={{
              color: '#64748b',
              fontSize: '0.875rem',
              margin: 0
            }}>
              © 2025 VoiceAI Space. All rights reserved.
            </p>
            <div style={{
              display: 'flex',
              gap: '1.5rem'
            }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a
                  key={item}
                  href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                  style={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b' }}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}