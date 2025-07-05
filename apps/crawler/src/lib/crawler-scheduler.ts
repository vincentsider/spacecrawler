import * as cron from 'node-cron';
import { getSchedulerConfig, CrawlerSchedule } from '../config/scheduler.config';
import { jobsCrawler } from '../crawlers/jobs';
import { eventsCrawler } from '../crawlers/events';
import { productsCrawler } from '../crawlers/products';
import { supabase } from './supabase';
import logger, { logCrawlerRun, sendNotification } from '../utils/logger';
import { Crawler } from '../types';

interface ScheduledTask {
  task: cron.ScheduledTask;
  config: CrawlerSchedule;
}

export class CrawlerScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private isRunning: boolean = false;
  private runningCrawlers: Set<string> = new Set();
  private config = getSchedulerConfig();
  private crawlers: Map<string, Crawler<any>> = new Map([
    ['jobs', jobsCrawler as Crawler<any>],
    ['events', eventsCrawler as Crawler<any>],
    ['products', productsCrawler as Crawler<any>],
  ]);

  constructor() {
    // Only log in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      logger.info('CrawlerScheduler initialized', {
        mode: this.config.runMode,
        timezone: this.config.timezone,
      });
    }
  }

  /**
   * Start the scheduler and all enabled crawlers
   */
  public start(): void {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    logger.info('Starting crawler scheduler...');
    
    // Schedule each enabled crawler
    this.config.crawlers.forEach(crawlerConfig => {
      if (crawlerConfig.enabled) {
        this.scheduleCrawler(crawlerConfig);
      } else {
        logger.info(`Crawler ${crawlerConfig.type} is disabled`);
      }
    });

    this.isRunning = true;
    logger.info('Crawler scheduler started successfully', {
      activeTasks: this.tasks.size,
    });
  }

  /**
   * Stop all scheduled tasks
   */
  public stop(): void {
    logger.info('Stopping crawler scheduler...');
    
    this.tasks.forEach((scheduledTask, type) => {
      scheduledTask.task.stop();
      logger.info(`Stopped scheduled task for ${type}`);
    });
    
    this.tasks.clear();
    this.isRunning = false;
    
    logger.info('Crawler scheduler stopped');
  }

  /**
   * Schedule a single crawler
   */
  private scheduleCrawler(config: CrawlerSchedule): void {
    const { type, schedule } = config;
    
    if (!cron.validate(schedule)) {
      logger.error(`Invalid cron expression for ${type}: ${schedule}`);
      return;
    }

    const task = cron.schedule(schedule, async () => {
      await this.runCrawler(config);
    }, {
      timezone: this.config.timezone,
    });

    this.tasks.set(type, { task, config });
    
    logger.info(`Scheduled ${type} crawler`, {
      schedule,
      timezone: this.config.timezone,
    });
  }

  /**
   * Run a single crawler with retry logic
   */
  private async runCrawler(config: CrawlerSchedule): Promise<void> {
    const { type, retryAttempts = this.config.defaultRetryAttempts, retryDelay = this.config.defaultRetryDelay } = config;
    
    // Check if crawler is already running
    if (this.runningCrawlers.has(type)) {
      logger.warn(`Crawler ${type} is already running, skipping...`);
      return;
    }

    // Check concurrency limit
    if (this.runningCrawlers.size >= this.config.concurrencyLimit) {
      logger.warn(`Concurrency limit reached (${this.config.concurrencyLimit}), delaying ${type} crawler`);
      // Retry after a delay
      setTimeout(() => this.runCrawler(config), 60000); // 1 minute
      return;
    }

    this.runningCrawlers.add(type);
    const crawler = this.crawlers.get(type);
    
    if (!crawler) {
      logger.error(`Crawler ${type} not found`);
      this.runningCrawlers.delete(type);
      return;
    }

    const startTime = Date.now();
    let attempt = 0;
    let success = false;
    let lastError: Error | null = null;
    let results: any[] = [];

    // Create crawler run record
    const { data: runData, error: runError } = await supabase
      .from('crawler_runs')
      .insert({
        crawler_type: type,
        started_at: new Date().toISOString(),
        items_found: 0,
        items_new: 0,
        items_updated: 0,
        logs: [],
      })
      .select()
      .single();

    if (runError) {
      logger.error(`Failed to create crawler run record: ${runError.message}`);
      this.runningCrawlers.delete(type);
      return;
    }

    const runId = runData.id;
    logCrawlerRun('started', { crawlerType: type });

    // Retry loop
    while (attempt < retryAttempts && !success) {
      attempt++;
      
      try {
        logger.info(`Running ${type} crawler (attempt ${attempt}/${retryAttempts})`);
        results = await crawler.run();
        success = true;
      } catch (error) {
        lastError = error as Error;
        logger.error(`Crawler ${type} failed (attempt ${attempt}/${retryAttempts})`, {
          error: lastError.message,
          stack: lastError.stack,
        });
        
        if (attempt < retryAttempts) {
          logger.info(`Retrying ${type} crawler in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    const duration = Date.now() - startTime;
    
    // Update crawler run record
    const updateData = {
      completed_at: new Date().toISOString(),
      success,
      items_found: results.length,
      error_message: success ? null : lastError?.message,
      logs: [{
        timestamp: new Date().toISOString(),
        level: success ? 'info' : 'error',
        message: success ? `Crawler completed successfully` : `Crawler failed after ${attempt} attempts`,
        metadata: {
          duration,
          attempts: attempt,
          itemsFound: results.length,
        },
      }],
    };

    await supabase
      .from('crawler_runs')
      .update(updateData)
      .eq('id', runId);

    // Update source last_crawled_at if successful
    if (success && results.length > 0) {
      // Get unique source IDs from results
      const sourceIds = [...new Set(results.map(item => item.source_id).filter(Boolean))];
      
      if (sourceIds.length > 0) {
        await supabase
          .from('crawler_sources')
          .update({ last_crawled_at: new Date().toISOString() })
          .in('id', sourceIds);
      }
    }

    // Log and notify
    if (success) {
      logCrawlerRun('completed', {
        crawlerType: type,
        itemsFound: results.length,
        duration,
      });
      
      if (results.length === 0) {
        sendNotification('warning', `${type} crawler completed but found no items`);
      }
    } else {
      logCrawlerRun('failed', {
        crawlerType: type,
        error: lastError?.message || 'Unknown error',
        duration,
      });
      
      sendNotification('error', `${type} crawler failed after ${attempt} attempts`, {
        error: lastError?.message,
      });
    }

    this.runningCrawlers.delete(type);
  }

  /**
   * Manually trigger a crawler run
   */
  public async runCrawlerManually(type: string, sources?: string[]): Promise<void> {
    const config = this.config.crawlers.find(c => c.type === type);
    
    if (!config) {
      throw new Error(`Crawler ${type} not found in configuration`);
    }

    if (!config.enabled && this.config.runMode === 'production') {
      throw new Error(`Crawler ${type} is disabled in production`);
    }

    logger.info(`Manually triggering ${type} crawler`, { sources });
    
    await this.runCrawler({
      ...config,
      sources,
    });
  }

  /**
   * Get scheduler status
   */
  public getStatus(): {
    isRunning: boolean;
    mode: string;
    activeTasks: string[];
    runningCrawlers: string[];
    nextRuns: Record<string, Date | null>;
  } {
    const nextRuns: Record<string, Date | null> = {};
    
    this.tasks.forEach((_, type) => {
      // node-cron doesn't provide next run time, so we calculate it
      // This is a simplified version - a full implementation would parse the cron expression
      nextRuns[type] = null; // TODO: Implement cron expression parsing for next run time
    });

    return {
      isRunning: this.isRunning,
      mode: this.config.runMode,
      activeTasks: Array.from(this.tasks.keys()),
      runningCrawlers: Array.from(this.runningCrawlers),
      nextRuns,
    };
  }

  /**
   * Update crawler configuration
   */
  public updateConfig(type: string, enabled: boolean): void {
    const task = this.tasks.get(type);
    
    if (!task) {
      logger.warn(`Cannot update config for ${type} - task not found`);
      return;
    }

    if (enabled && !task.task) {
      // Re-enable the task
      this.scheduleCrawler(task.config);
    } else if (!enabled && task.task) {
      // Disable the task
      task.task.stop();
      this.tasks.delete(type);
    }

    logger.info(`Updated ${type} crawler configuration`, { enabled });
  }
}

// Export singleton instance
export const crawlerScheduler = new CrawlerScheduler();