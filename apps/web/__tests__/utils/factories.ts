import { Tables } from '@/lib/supabase/types'

// Type aliases
type Job = Tables<'jobs'>
type Event = Tables<'events'>
type Product = Tables<'products'>

// Job Factory
export function createMockJob(overrides?: Partial<Job>): Job {
  return {
    id: 'job-123',
    title: 'Senior Voice AI Engineer',
    company_name: 'VoiceTech Inc',
    location: 'San Francisco, CA',
    location_type: 'remote',
    description: 'Join our team building cutting-edge voice AI solutions...',
    application_url: 'https://example.com/jobs/123',
    salary_range: '$150,000 - $200,000',
    publication_date: '2024-01-15T00:00:00Z',
    crawled_at: '2024-01-16T10:00:00Z',
    published_at: null,
    status: 'pending',
    source_id: 'source-123',
    crawler_type: 'jobs',
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
    ...overrides,
  }
}

// Event Factory
export function createMockEvent(overrides?: Partial<Event>): Event {
  return {
    id: 'event-456',
    title: 'Voice AI Summit 2024',
    organizer: 'AI Events Inc',
    start_date: '2024-06-15T09:00:00Z',
    end_date: '2024-06-15T17:00:00Z',
    location: 'San Francisco Convention Center',
    location_type: 'in-person',
    description: 'Join us for the premier voice AI conference...',
    event_url: 'https://example.com/events/voice-ai-summit',
    image_url: 'https://example.com/images/event.jpg',
    price: '$299',
    crawled_at: '2024-01-16T10:00:00Z',
    published_at: null,
    status: 'pending',
    source_id: 'source-456',
    crawler_type: 'events',
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
    ...overrides,
  }
}

// Product Factory
export function createMockProduct(overrides?: Partial<Product>): Product {
  return {
    id: 'product-789',
    name: 'VoiceBot Pro',
    company_name: 'AI Solutions Ltd',
    description: 'Advanced voice AI platform for building conversational interfaces...',
    short_description: 'Build voice apps with ease',
    product_url: 'https://example.com/products/voicebot-pro',
    image_url: 'https://example.com/images/product.png',
    category: 'Voice AI Platform',
    features: ['Natural Language Processing', 'Multi-language Support', 'Real-time Analytics'],
    use_cases: ['Customer Service', 'Voice Assistants', 'IVR Systems'],
    pricing_info: 'Starting at $99/month',
    crawled_at: '2024-01-16T10:00:00Z',
    published_at: null,
    status: 'pending',
    source_id: 'source-789',
    crawler_type: 'products',
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
    ...overrides,
  }
}

// Mock Supabase Auth User
export function createMockUser(overrides?: any) {
  return {
    id: 'user-123',
    email: 'admin@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

// Mock Session
export function createMockSession(overrides?: any) {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: createMockUser(),
    ...overrides,
  }
}

// Batch creation helpers
export function createMockJobs(count: number, overrides?: Partial<Job>): Job[] {
  return Array.from({ length: count }, (_, i) => 
    createMockJob({
      ...overrides,
      id: `job-${i + 1}`,
      title: `${overrides?.title || 'Voice AI Engineer'} ${i + 1}`,
    })
  )
}

export function createMockEvents(count: number, overrides?: Partial<Event>): Event[] {
  return Array.from({ length: count }, (_, i) => 
    createMockEvent({
      ...overrides,
      id: `event-${i + 1}`,
      title: `${overrides?.title || 'Voice AI Event'} ${i + 1}`,
    })
  )
}

export function createMockProducts(count: number, overrides?: Partial<Product>): Product[] {
  return Array.from({ length: count }, (_, i) => 
    createMockProduct({
      ...overrides,
      id: `product-${i + 1}`,
      name: `${overrides?.name || 'Voice Product'} ${i + 1}`,
    })
  )
}