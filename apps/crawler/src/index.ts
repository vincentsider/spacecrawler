import * as dotenv from 'dotenv';
import { jobsCrawler } from './crawlers/jobs';
import { eventsCrawler } from './crawlers/events';
import { productsCrawler } from './crawlers/products';
import { crawlerScheduler } from './lib/crawler-scheduler';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

async function main() {
  logger.info('SpaceCrawler Service Starting...', {
    mode: process.env.NODE_ENV,
    command: process.argv[2],
  });

  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'schedule':
        // Start the scheduler service
        logger.info('Starting crawler scheduler service...');
        crawlerScheduler.start();
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
          logger.info('Received SIGINT, shutting down gracefully...');
          crawlerScheduler.stop();
          process.exit(0);
        });
        
        process.on('SIGTERM', () => {
          logger.info('Received SIGTERM, shutting down gracefully...');
          crawlerScheduler.stop();
          process.exit(0);
        });
        
        // Keep the process running
        logger.info('Scheduler service is running. Press Ctrl+C to stop.');
        
        // Prevent the process from exiting
        setInterval(() => {}, 1000 * 60 * 60); // Keep alive check every hour
        break;
        
      case 'jobs':
        logger.info('Running jobs crawler manually...');
        await jobsCrawler.run();
        break;
        
      case 'events':
        logger.info('Running events crawler manually...');
        await eventsCrawler.run();
        break;
        
      case 'products':
        logger.info('Running products crawler manually...');
        await productsCrawler.run();
        break;
        
      case 'all':
        logger.info('Running all crawlers manually...');
        await Promise.all([
          jobsCrawler.run(),
          eventsCrawler.run(),
          productsCrawler.run()
        ]);
        break;
        
      case 'status':
        // Get scheduler status
        const status = crawlerScheduler.getStatus();
        console.log('Scheduler Status:', JSON.stringify(status, null, 2));
        break;
        
      case 'run':
        // Run a specific crawler through the scheduler
        const crawlerType = args[0];
        if (!crawlerType || !['jobs', 'events', 'products'].includes(crawlerType)) {
          logger.error('Please specify crawler type: jobs, events, or products');
          process.exit(1);
        }
        await crawlerScheduler.runCrawlerManually(crawlerType);
        break;
        
      default:
        console.log(`
SpaceCrawler Service

Usage:
  npm run start schedule    - Start the scheduler service (production)
  npm run dev schedule      - Start the scheduler service (development)
  npm run start jobs        - Run jobs crawler manually
  npm run start events      - Run events crawler manually
  npm run start products    - Run products crawler manually
  npm run start all         - Run all crawlers manually
  npm run start status      - Get scheduler status
  npm run start run <type>  - Run a specific crawler through the scheduler

Environment Variables:
  NODE_ENV                  - Set to 'production' for production mode
  CRAWLER_SCHEDULE_OVERRIDE - Set to 'true' in dev to run crawlers every 5 minutes
  LOG_LEVEL                 - Set logging level (error, warn, info, debug)
        `);
        process.exit(1);
    }
  } catch (error) {
    logger.error('Crawler error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main };