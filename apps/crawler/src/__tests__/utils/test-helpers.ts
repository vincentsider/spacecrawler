import { Browser, Page } from 'playwright';

// Mock Playwright page
export function createMockPage(): jest.Mocked<Page> {
  return {
    goto: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    waitForSelector: jest.fn().mockResolvedValue(undefined),
    $$: jest.fn().mockResolvedValue([]),
    $eval: jest.fn(),
    evaluate: jest.fn(),
    content: jest.fn().mockResolvedValue(''),
    url: jest.fn().mockReturnValue('https://example.com'),
  } as any;
}

// Mock Playwright browser
export function createMockBrowser(): jest.Mocked<Browser> {
  const mockPage = createMockPage();
  return {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(undefined),
    contexts: jest.fn().mockReturnValue([]),
    isConnected: jest.fn().mockReturnValue(true),
  } as any;
}

// Mock Cheerio element
export function createMockCheerioElement(props: {
  text?: string;
  attr?: Record<string, string>;
  find?: Record<string, { text: () => string }>;
}) {
  return {
    text: jest.fn().mockReturnValue(props.text || ''),
    attr: jest.fn((key: string) => props.attr?.[key]),
    find: jest.fn((selector: string) => ({
      text: jest.fn().mockReturnValue(props.find?.[selector]?.text() || ''),
    })),
  };
}

// Mock fetch response
export function createMockFetchResponse(html: string, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(html),
    json: jest.fn().mockResolvedValue({}),
  };
}

// Mock Supabase response
export function createMockSupabaseResponse<T>(data: T | null, error: any = null) {
  return { data, error };
}

// Wait helper for async operations
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock console methods for cleaner test output
export function mockConsole() {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
  };

  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
  });

  return {
    log: console.log as jest.Mock,
    error: console.error as jest.Mock,
    warn: console.warn as jest.Mock,
  };
}