import { Job, Event, Product, CrawlerSource } from '../../types';

// Job Factory
export function createMockJob(overrides?: Partial<Job>): Job {
  return {
    title: 'Senior Voice AI Engineer',
    company: 'TestCorp',
    location: 'San Francisco, CA',
    description: 'We are looking for a talented Voice AI Engineer...',
    url: 'https://example.com/jobs/123',
    postedDate: new Date('2024-01-15'),
    salary: '$150,000 - $200,000',
    type: 'full-time',
    remote: true,
    tags: ['voice-ai', 'machine-learning'],
    sourceId: 'test-123',
    crawledAt: new Date(),
    ...overrides,
  };
}

// Event Factory
export function createMockEvent(overrides?: Partial<Event>): Event {
  return {
    title: 'Voice AI Summit 2024',
    organizer: 'AI Events Inc',
    date: new Date('2024-06-15T09:00:00'),
    endDate: new Date('2024-06-15T17:00:00'),
    location: 'San Francisco Convention Center',
    description: 'Join us for the premier voice AI conference...',
    url: 'https://example.com/events/voice-ai-summit',
    imageUrl: 'https://example.com/images/event.jpg',
    price: '$299',
    tags: ['conference', 'voice-ai', 'networking'],
    sourceId: 'event-456',
    crawledAt: new Date(),
    ...overrides,
  };
}

// Product Factory
export function createMockProduct(overrides?: Partial<Product>): Product {
  return {
    name: 'VoiceBot Pro',
    company: 'AI Solutions Ltd',
    description: 'Advanced voice AI platform for building conversational interfaces...',
    shortDescription: 'Build voice apps with ease',
    url: 'https://example.com/products/voicebot-pro',
    imageUrl: 'https://example.com/images/product.png',
    features: ['Natural Language Processing', 'Multi-language Support', 'Real-time Analytics'],
    useCases: ['Customer Service', 'Voice Assistants', 'IVR Systems'],
    pricing: 'Starting at $99/month',
    tags: ['voice-ai', 'platform', 'saas'],
    sourceId: 'product-789',
    crawledAt: new Date(),
    ...overrides,
  };
}

// Crawler Source Factory
export function createMockCrawlerSource(overrides?: Partial<CrawlerSource>): CrawlerSource {
  return {
    id: 'test-source',
    name: 'Test Source',
    url: 'https://example.com',
    type: 'static',
    selector: '.job-listing',
    ...overrides,
  };
}

// Batch creation helpers
export function createMockJobs(count: number, overrides?: Partial<Job>): Job[] {
  return Array.from({ length: count }, (_, i) => 
    createMockJob({
      ...overrides,
      title: `${overrides?.title || 'Voice AI Engineer'} ${i + 1}`,
      sourceId: `test-job-${i + 1}`,
    })
  );
}

export function createMockEvents(count: number, overrides?: Partial<Event>): Event[] {
  return Array.from({ length: count }, (_, i) => 
    createMockEvent({
      ...overrides,
      title: `${overrides?.title || 'Voice AI Event'} ${i + 1}`,
      sourceId: `test-event-${i + 1}`,
    })
  );
}

export function createMockProducts(count: number, overrides?: Partial<Product>): Product[] {
  return Array.from({ length: count }, (_, i) => 
    createMockProduct({
      ...overrides,
      name: `${overrides?.name || 'Voice Product'} ${i + 1}`,
      sourceId: `test-product-${i + 1}`,
    })
  );
}

// Crawler run factory
export function createMockCrawlerRun(overrides?: any) {
  return {
    id: 'run-123',
    crawler_type: 'jobs',
    started_at: new Date().toISOString(),
    completed_at: null,
    success: null,
    items_found: 0,
    items_new: 0,
    items_updated: 0,
    error_message: null,
    logs: [],
    ...overrides,
  };
}

// HTML response mocks
export function createMockJobsHTML(): string {
  return `
    <html>
      <body>
        <div class="job-listing" id="job-1">
          <h3 class="job-title">Senior Voice AI Engineer</h3>
          <div class="company">VoiceTech Inc</div>
          <div class="location">Remote</div>
          <div class="description">Join our team building cutting-edge voice AI solutions...</div>
          <a href="/jobs/senior-voice-ai-engineer">Apply Now</a>
        </div>
        <div class="job-listing" id="job-2">
          <h3 class="job-title">Voice ML Researcher</h3>
          <div class="company">AI Labs</div>
          <div class="location">San Francisco, CA</div>
          <div class="description">Research and develop next-generation voice models...</div>
          <a href="/jobs/voice-ml-researcher">Apply Now</a>
        </div>
      </body>
    </html>
  `;
}

export function createMockEventsHTML(): string {
  return `
    <html>
      <body>
        <div class="event-card" id="event-1">
          <h3 class="event-title">Voice AI Conference 2024</h3>
          <div class="organizer">Tech Events Co</div>
          <div class="date">June 15, 2024</div>
          <div class="location">San Francisco, CA</div>
          <div class="description">Annual conference on voice AI innovations...</div>
          <a href="/events/voice-ai-conference-2024">Register</a>
        </div>
      </body>
    </html>
  `;
}

export function createMockProductsHTML(): string {
  return `
    <html>
      <body>
        <div class="product-item" id="product-1">
          <h3 class="product-name">VoiceBot Platform</h3>
          <div class="company">AI Solutions</div>
          <div class="category">Platform</div>
          <div class="description">Complete platform for building voice applications...</div>
          <a href="/products/voicebot-platform">Learn More</a>
        </div>
      </body>
    </html>
  `;
}