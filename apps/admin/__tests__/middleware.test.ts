import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createMiddlewareClient: jest.fn(),
}))

// Mock NextResponse redirect
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url) => ({ url, redirected: true })),
    next: jest.fn(() => ({ next: true })),
  },
  NextRequest: jest.fn(),
}))

describe('Middleware', () => {
  let mockSupabase: any
  let mockRequest: NextRequest

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
      },
    }
    
    ;(createMiddlewareClient as jest.Mock).mockReturnValue(mockSupabase)
    
    mockRequest = {
      nextUrl: {
        pathname: '/',
        clone: jest.fn(() => ({
          pathname: '/login',
          toString: jest.fn(() => 'http://localhost:3000/login'),
        })),
      },
      cookies: {},
    } as any
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to login if no session on protected route', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    mockRequest.nextUrl.pathname = '/jobs'

    const response = await middleware(mockRequest)

    expect(response).toEqual({ 
      url: 'http://localhost:3000/login', 
      redirected: true 
    })
  })

  it('should allow access to protected routes with valid session', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { 
        session: { 
          user: { id: 'user-123' },
          access_token: 'token',
        } 
      } 
    })
    mockRequest.nextUrl.pathname = '/jobs'

    const response = await middleware(mockRequest)

    expect(response).toEqual({ next: true })
  })

  it('should allow access to login page without session', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    mockRequest.nextUrl.pathname = '/login'

    const response = await middleware(mockRequest)

    expect(response).toEqual({ next: true })
  })

  it('should redirect to dashboard if accessing login with session', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { 
        session: { 
          user: { id: 'user-123' },
          access_token: 'token',
        } 
      } 
    })
    mockRequest.nextUrl.pathname = '/login'
    mockRequest.nextUrl.clone = jest.fn(() => ({
      pathname: '/',
      toString: jest.fn(() => 'http://localhost:3000/'),
    }))

    const response = await middleware(mockRequest)

    expect(response).toEqual({ 
      url: 'http://localhost:3000/', 
      redirected: true 
    })
  })

  it('should handle session check errors gracefully', async () => {
    mockSupabase.auth.getSession.mockRejectedValue(new Error('Auth error'))
    mockRequest.nextUrl.pathname = '/jobs'

    const response = await middleware(mockRequest)

    // Should redirect to login on error
    expect(response).toEqual({ 
      url: 'http://localhost:3000/login', 
      redirected: true 
    })
  })

  it('should protect all dashboard routes', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    
    const protectedRoutes = ['/jobs', '/events', '/products', '/']
    
    for (const route of protectedRoutes) {
      mockRequest.nextUrl.pathname = route
      
      const response = await middleware(mockRequest)
      
      expect(response).toEqual({ 
        url: 'http://localhost:3000/login', 
        redirected: true 
      })
    }
  })

  it('should handle API routes correctly', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    mockRequest.nextUrl.pathname = '/api/health'

    const response = await middleware(mockRequest)

    // API routes should not redirect
    expect(response).toEqual({ next: true })
  })

  it('should handle static assets correctly', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    
    const staticPaths = ['/_next/static/test.js', '/favicon.ico', '/images/logo.png']
    
    for (const path of staticPaths) {
      mockRequest.nextUrl.pathname = path
      
      const response = await middleware(mockRequest)
      
      expect(response).toEqual({ next: true })
    }
  })
})

describe('Middleware Config', () => {
  it('should have correct matcher configuration', async () => {
    // Import the actual middleware file to check config
    const middlewareModule = await import('@/middleware')
    
    expect(middlewareModule.config).toEqual({
      matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
    })
  })
})