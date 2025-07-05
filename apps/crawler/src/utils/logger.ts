import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'gray',
};

winston.addColors(colors);

// Create format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  })
);

// Create format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), 'logs');
  
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
    }),
  ],
});

// Create a child logger for specific components
export function createLogger(component: string) {
  return logger.child({ component });
}

// Structured logging helpers
export interface CrawlerRunLog {
  crawlerType: string;
  source?: string;
  itemsFound?: number;
  itemsNew?: number;
  itemsUpdated?: number;
  duration?: number;
  error?: string;
}

export function logCrawlerRun(status: 'started' | 'completed' | 'failed', data: CrawlerRunLog) {
  const level = status === 'failed' ? 'error' : 'info';
  const message = `Crawler ${status}: ${data.crawlerType}`;
  
  logger.log(level, message, {
    status,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

// Performance logging
export function logPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
  logger.info(`Performance: ${operation}`, {
    operation,
    duration,
    ...metadata,
  });
}

// Notification helper (for future integration with notification services)
export function sendNotification(level: 'info' | 'warning' | 'error', message: string, metadata?: Record<string, any>) {
  logger.log(level === 'warning' ? 'warn' : level, `Notification: ${message}`, {
    notification: true,
    ...metadata,
  });
  
  // In production, this could send to Slack, email, etc.
  if (process.env.NODE_ENV === 'production' && level === 'error') {
    // TODO: Implement notification service integration
    // For now, just log it prominently
    console.error(`🚨 CRITICAL ERROR: ${message}`);
  }
}

export default logger;