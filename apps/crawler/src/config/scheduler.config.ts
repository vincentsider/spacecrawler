export interface SchedulerConfig {
  runMode: 'development' | 'production';
  timezone: string;
  defaultRetryAttempts: number;
  defaultRetryDelay: number; // in milliseconds
  concurrencyLimit: number;
  crawlers: CrawlerSchedule[];
}

export interface CrawlerSchedule {
  type: 'jobs' | 'events' | 'products';
  enabled: boolean;
  schedule: string; // cron expression
  sources?: string[]; // specific sources to crawl, empty means all
  retryAttempts?: number;
  retryDelay?: number;
}

// Default configuration
export const defaultSchedulerConfig: SchedulerConfig = {
  runMode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  timezone: 'UTC',
  defaultRetryAttempts: 3,
  defaultRetryDelay: 5000, // 5 seconds
  concurrencyLimit: 3, // max concurrent crawlers
  crawlers: [
    {
      type: 'jobs',
      enabled: true,
      // Every day at 2 AM UTC
      schedule: '0 2 * * *',
      retryAttempts: 3,
    },
    {
      type: 'events',
      enabled: true,
      // Every day at 3 AM UTC
      schedule: '0 3 * * *',
      retryAttempts: 3,
    },
    {
      type: 'products',
      enabled: true,
      // Every day at 4 AM UTC
      schedule: '0 4 * * *',
      retryAttempts: 2,
    },
  ],
};

// Production overrides
export const productionSchedulerConfig: Partial<SchedulerConfig> = {
  concurrencyLimit: 5,
  crawlers: [
    {
      type: 'jobs',
      enabled: true,
      // Every 6 hours
      schedule: '0 */6 * * *',
      retryAttempts: 5,
      retryDelay: 10000, // 10 seconds
    },
    {
      type: 'events',
      enabled: true,
      // Every 12 hours
      schedule: '0 */12 * * *',
      retryAttempts: 5,
      retryDelay: 10000,
    },
    {
      type: 'products',
      enabled: true,
      // Once a day at 5 AM UTC
      schedule: '0 5 * * *',
      retryAttempts: 3,
      retryDelay: 15000, // 15 seconds
    },
  ],
};

// Get active configuration based on environment
export function getSchedulerConfig(): SchedulerConfig {
  const baseConfig = { ...defaultSchedulerConfig };
  
  if (process.env.NODE_ENV === 'production') {
    // Merge production overrides
    return {
      ...baseConfig,
      ...productionSchedulerConfig,
      crawlers: productionSchedulerConfig.crawlers || baseConfig.crawlers,
    };
  }
  
  // Development mode - check for manual schedule override
  if (process.env.CRAWLER_SCHEDULE_OVERRIDE === 'true') {
    // In development, we can override to run more frequently for testing
    baseConfig.crawlers = baseConfig.crawlers.map(crawler => ({
      ...crawler,
      // Run every 5 minutes for testing
      schedule: '*/5 * * * *',
    }));
  }
  
  return baseConfig;
}

// Validate cron expression
export function isValidCronExpression(expression: string): boolean {
  // Basic validation - a proper implementation would use a cron parser
  const parts = expression.split(' ');
  return parts.length === 5 || parts.length === 6;
}