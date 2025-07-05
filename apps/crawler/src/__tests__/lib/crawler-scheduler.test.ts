// Mock modules before imports to ensure mocks are in place
jest.mock('node-cron');
jest.mock('../../lib/supabase');
jest.mock('../../utils/logger');
jest.mock('../../crawlers/jobs');
jest.mock('../../crawlers/events');
jest.mock('../../crawlers/products');

// Import after mocks are set up
import { CrawlerScheduler } from '../../lib/crawler-scheduler';
import * as cron from 'node-cron';
import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { jobsCrawler } from '../../crawlers/jobs';
import { eventsCrawler } from '../../crawlers/events';
import { productsCrawler } from '../../crawlers/products';
import { createMockCrawlerRun, createMockJobs } from '../utils/factories';

describe('CrawlerScheduler', () => {
  let scheduler: CrawlerScheduler;
  let mockScheduledTask: jest.Mocked<cron.ScheduledTask>;

  beforeEach(() => {
    scheduler = new CrawlerScheduler();
    
    mockScheduledTask = {
      start: jest.fn(),
      stop: jest.fn(),
      destroy: jest.fn(),
      getStatus: jest.fn().mockReturnValue('scheduled'),
    } as any;

    (cron.validate as jest.Mock).mockReturnValue(true);
    (cron.schedule as jest.Mock).mockReturnValue(mockScheduledTask);
    
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: createMockCrawlerRun(), 
        error: null 
      }),
    });

    // Mock crawler runs
    (jobsCrawler.run as jest.Mock).mockResolvedValue(createMockJobs(5));
    (eventsCrawler.run as jest.Mock).mockResolvedValue([]);
    (productsCrawler.run as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('should schedule all enabled crawlers', () => {
      scheduler.start();

      expect(cron.schedule).toHaveBeenCalledTimes(3); // jobs, events, products
      expect(cron.schedule).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        expect.objectContaining({ timezone: expect.any(String) })
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Crawler scheduler started successfully',
        expect.any(Object)
      );
    });

    it('should not schedule disabled crawlers', () => {
      // Mock config to disable a crawler
      const config = scheduler['config'];
      config.crawlers[0].enabled = false;

      scheduler.start();

      expect(cron.schedule).toHaveBeenCalledTimes(2); // Only 2 enabled
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('is disabled'),
        expect.any(Object)
      );
    });

    it('should not start if already running', () => {
      scheduler.start();
      scheduler.start();

      expect(logger.warn).toHaveBeenCalledWith('Scheduler is already running');
      expect(cron.schedule).toHaveBeenCalledTimes(3); // Not called again
    });

    it('should handle invalid cron expressions', () => {
      (cron.validate as jest.Mock).mockReturnValue(false);

      scheduler.start();

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid cron expression'),
        expect.any(String)
      );
    });
  });

  describe('stop', () => {
    it('should stop all scheduled tasks', () => {
      scheduler.start();
      scheduler.stop();

      expect(mockScheduledTask.stop).toHaveBeenCalledTimes(3);
      expect(logger.info).toHaveBeenCalledWith('Crawler scheduler stopped');
    });

    it('should clear all tasks', () => {
      scheduler.start();
      const taskCount = scheduler['tasks'].size;
      expect(taskCount).toBe(3);

      scheduler.stop();
      expect(scheduler['tasks'].size).toBe(0);
    });
  });

  describe('runCrawler', () => {
    it('should run crawler and update database', async () => {
      const config = { 
        type: 'jobs', 
        schedule: '0 * * * *',
        enabled: true,
        retryAttempts: 3,
        retryDelay: 1000
      };

      await scheduler['runCrawler'](config);

      expect(jobsCrawler.run).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('crawler_runs');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Running jobs crawler'),
        expect.any(Object)
      );
    });

    it('should handle crawler failures with retry', async () => {
      const config = { 
        type: 'jobs', 
        schedule: '0 * * * *',
        enabled: true,
        retryAttempts: 3,
        retryDelay: 100
      };

      (jobsCrawler.run as jest.Mock)
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce(createMockJobs(3));

      await scheduler['runCrawler'](config);

      expect(jobsCrawler.run).toHaveBeenCalledTimes(3);
      expect(logger.error).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Retrying jobs crawler'),
        expect.any(Object)
      );
    });

    it('should respect concurrency limit', async () => {
      // Set multiple crawlers as running
      scheduler['runningCrawlers'].add('events');
      scheduler['runningCrawlers'].add('products');
      scheduler['runningCrawlers'].add('other');

      const config = { 
        type: 'jobs', 
        schedule: '0 * * * *',
        enabled: true
      };

      const runPromise = scheduler['runCrawler'](config);
      
      // Should be delayed due to concurrency limit
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Concurrency limit reached'),
        expect.any(String)
      );

      // Clean up
      scheduler['runningCrawlers'].clear();
      await runPromise;
    });

    it('should skip if crawler is already running', async () => {
      scheduler['runningCrawlers'].add('jobs');

      const config = { 
        type: 'jobs', 
        schedule: '0 * * * *',
        enabled: true
      };

      await scheduler['runCrawler'](config);

      expect(logger.warn).toHaveBeenCalledWith(
        'Crawler jobs is already running, skipping...'
      );
      expect(jobsCrawler.run).not.toHaveBeenCalled();
    });

    it('should update source last_crawled_at on success', async () => {
      const mockJobs = createMockJobs(3, { source_id: 'test-source' });
      (jobsCrawler.run as jest.Mock).mockResolvedValue(mockJobs);

      const config = { 
        type: 'jobs', 
        schedule: '0 * * * *',
        enabled: true
      };

      await scheduler['runCrawler'](config);

      expect(supabase.from).toHaveBeenCalledWith('crawler_sources');
      expect(supabase.from('crawler_sources').update).toHaveBeenCalledWith({
        last_crawled_at: expect.any(String)
      });
    });

    it('should send notification on failure', async () => {
      const config = { 
        type: 'jobs', 
        schedule: '0 * * * *',
        enabled: true,
        retryAttempts: 1
      };

      (jobsCrawler.run as jest.Mock).mockRejectedValue(new Error('Fatal error'));

      await scheduler['runCrawler'](config);

      expect(logger.sendNotification).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('jobs crawler failed'),
        expect.any(Object)
      );
    });
  });

  describe('runCrawlerManually', () => {
    it('should trigger crawler manually', async () => {
      await scheduler.runCrawlerManually('jobs');

      expect(logger.info).toHaveBeenCalledWith(
        'Manually triggering jobs crawler',
        expect.any(Object)
      );
      expect(jobsCrawler.run).toHaveBeenCalled();
    });

    it('should throw error for unknown crawler', async () => {
      await expect(scheduler.runCrawlerManually('unknown'))
        .rejects.toThrow('Crawler unknown not found in configuration');
    });

    it('should allow disabled crawlers in development', async () => {
      scheduler['config'].runMode = 'development';
      scheduler['config'].crawlers[0].enabled = false;

      await scheduler.runCrawlerManually('jobs');

      expect(jobsCrawler.run).toHaveBeenCalled();
    });

    it('should prevent disabled crawlers in production', async () => {
      scheduler['config'].runMode = 'production';
      scheduler['config'].crawlers[0].enabled = false;

      await expect(scheduler.runCrawlerManually('jobs'))
        .rejects.toThrow('Crawler jobs is disabled in production');
    });
  });

  describe('getStatus', () => {
    it('should return complete scheduler status', () => {
      scheduler.start();
      scheduler['runningCrawlers'].add('jobs');

      const status = scheduler.getStatus();

      expect(status).toEqual({
        isRunning: true,
        mode: expect.any(String),
        activeTasks: ['jobs', 'events', 'products'],
        runningCrawlers: ['jobs'],
        nextRuns: expect.any(Object),
      });
    });
  });

  describe('updateConfig', () => {
    it('should enable a disabled crawler', () => {
      scheduler.start();
      const task = scheduler['tasks'].get('jobs');
      if (task) {
        task.task.stop();
        scheduler['tasks'].delete('jobs');
      }

      scheduler.updateConfig('jobs', true);

      expect(cron.schedule).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should disable an enabled crawler', () => {
      scheduler.start();
      
      scheduler.updateConfig('jobs', false);

      expect(mockScheduledTask.stop).toHaveBeenCalled();
      expect(scheduler['tasks'].has('jobs')).toBe(false);
    });

    it('should handle non-existent tasks', () => {
      scheduler.updateConfig('unknown', true);

      expect(logger.warn).toHaveBeenCalledWith(
        'Cannot update config for unknown - task not found'
      );
    });
  });
});