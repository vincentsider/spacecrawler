// Test setup for crawler app
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';

// Mock winston logger to reduce noise in tests
jest.mock('../utils/logger', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    log: jest.fn(),
    child: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  };
  
  return {
    __esModule: true,
    default: mockLogger,
    createLogger: jest.fn(() => mockLogger),
    logCrawlerRun: jest.fn(),
    logPerformance: jest.fn(),
    sendNotification: jest.fn(),
  };
});

// Mock Playwright
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        goto: jest.fn(),
        close: jest.fn(),
        waitForSelector: jest.fn(),
        $$: jest.fn().mockResolvedValue([]),
        $eval: jest.fn(),
      }),
      close: jest.fn(),
    }),
  },
}));

// Mock node-fetch
jest.mock('node-fetch', () => jest.fn());

// Mock Supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: {}, error: null }),
  },
  insertJobs: jest.fn().mockResolvedValue(undefined),
  insertEvents: jest.fn().mockResolvedValue(undefined),
  insertProducts: jest.fn().mockResolvedValue(undefined),
}));

// Global test timeout
jest.setTimeout(10000);