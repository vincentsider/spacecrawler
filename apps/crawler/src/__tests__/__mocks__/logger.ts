// Mock for winston logger
const logger: any = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  log: jest.fn(),
  child: jest.fn(() => logger),
};

export function createLogger(_component: string): any {
  return logger;
}

export function logCrawlerRun(_status: string, _data: any): void {
  // Mock implementation
}

export function logPerformance(_operation: string, _duration: number, _metadata?: any): void {
  // Mock implementation
}

export function sendNotification(_level: string, _message: string, _metadata?: any): void {
  // Mock implementation
}

export default logger;