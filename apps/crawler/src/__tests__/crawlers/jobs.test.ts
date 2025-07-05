import { jobsCrawler } from '../../crawlers/jobs';
import { chromium } from 'playwright';
import fetch from 'node-fetch';
import * as supabase from '../../lib/supabase';
import { createMockBrowser, createMockPage, createMockFetchResponse, createMockCheerioElement } from '../utils/test-helpers';
import { createMockJobsHTML } from '../utils/factories';

jest.mock('playwright');
jest.mock('node-fetch');
jest.mock('../../lib/supabase');

describe('JobsCrawler', () => {
  let mockBrowser: ReturnType<typeof createMockBrowser>;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(() => {
    mockBrowser = createMockBrowser();
    mockPage = createMockPage();
    
    (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);
    mockBrowser.newPage.mockResolvedValue(mockPage);
    (supabase.insertJobs as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('run', () => {
    it('should crawl all job sources and save to database', async () => {
      // Mock static site responses
      const mockHTML = createMockJobsHTML();
      const mockResponse = createMockFetchResponse(mockHTML);
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      // Mock dynamic site elements
      const mockElements = [
        {
          $eval: jest.fn()
            .mockImplementation((selector, fn, ...args) => {
              if (selector.includes('title')) return Promise.resolve('Voice AI Engineer');
              if (selector.includes('location')) return Promise.resolve('Remote');
              if (selector.includes('description')) return Promise.resolve('Build amazing voice AI products');
              if (selector === 'a') {
                // If there are additional args, it's the URL construction case
                if (args.length > 0) {
                  return Promise.resolve('https://deepgram.com/jobs/voice-ai-engineer');
                }
                return Promise.resolve('/jobs/voice-ai-engineer');
              }
              return Promise.resolve('');
            }),
          getAttribute: jest.fn().mockResolvedValue('job-1'),
        },
        {
          $eval: jest.fn()
            .mockImplementation((selector, fn, ...args) => {
              if (selector.includes('title')) return Promise.resolve('ML Engineer - Voice');
              if (selector.includes('location')) return Promise.resolve('San Francisco');
              if (selector.includes('description')) return Promise.resolve('Work on cutting-edge voice models');
              if (selector === 'a') {
                // If there are additional args, it's the URL construction case
                if (args.length > 0) {
                  return Promise.resolve('https://deepgram.com/jobs/ml-engineer');
                }
                return Promise.resolve('/jobs/ml-engineer');
              }
              return Promise.resolve('');
            }),
          getAttribute: jest.fn().mockResolvedValue('job-2'),
        },
      ];

      mockPage.$$.mockResolvedValue(mockElements as any);

      const jobs = await jobsCrawler.run();

      expect(jobs.length).toBeGreaterThan(0);
      expect(supabase.insertJobs).toHaveBeenCalledWith(expect.any(Array));
      
      // Verify job structure
      const firstJob = jobs[0];
      expect(firstJob).toHaveProperty('title');
      expect(firstJob).toHaveProperty('company');
      expect(firstJob).toHaveProperty('location');
      expect(firstJob).toHaveProperty('url');
      expect(firstJob).toHaveProperty('sourceId');
      expect(firstJob).toHaveProperty('crawledAt');
    });

    it('should handle empty results gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        createMockFetchResponse('<html><body></body></html>') as any
      );
      mockPage.$$.mockResolvedValue([]);

      const jobs = await jobsCrawler.run();

      expect(jobs).toEqual([]);
      expect(supabase.insertJobs).not.toHaveBeenCalled();
    });

    it('should handle crawler errors and cleanup', async () => {
      // Mock fetch to fail for all static sources
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));
      // Mock page to fail for dynamic sources
      mockPage.waitForSelector.mockRejectedValue(new Error('Page error'));

      const jobs = await jobsCrawler.run();
      
      // The crawler should handle errors gracefully and return empty array
      expect(jobs).toEqual([]);
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });

  describe('validate', () => {
    it('should validate job data correctly', () => {
      const validJob = {
        title: 'Voice AI Engineer',
        company: 'TestCorp',
        location: 'Remote',
        description: 'Great job',
        url: 'https://example.com/job',
        sourceId: 'test-123',
        crawledAt: new Date(),
      };

      const result = jobsCrawler.validate(validJob);
      expect(result).toEqual(validJob);
    });

    it('should throw on invalid job data', () => {
      const invalidJob = {
        title: 'Voice AI Engineer',
        // Missing required fields
      };

      expect(() => jobsCrawler.validate(invalidJob)).toThrow();
    });
  });

  describe('extractJobsFromSource', () => {
    it('should extract jobs from static HTML', async () => {
      const mockHTML = createMockJobsHTML();
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        createMockFetchResponse(mockHTML) as any
      );

      const source = { 
        id: 'test', 
        name: 'Test Company', 
        url: 'https://example.com/careers',
        type: 'static' as const
      };

      // Access private method through prototype
      const jobs = await (jobsCrawler as any).extractJobsFromSource(source);

      expect(jobs.length).toBe(2);
      expect(jobs[0]).toMatchObject({
        title: 'Senior Voice AI Engineer',
        company: 'Test Company',
        location: 'Remote',
        description: expect.stringContaining('voice AI solutions'),
      });
    });

    it('should extract jobs from dynamic pages', async () => {
      const source = { 
        id: 'deepgram', 
        name: 'Deepgram', 
        url: 'https://deepgram.com/careers',
        type: 'dynamic' as const
      };

      const mockElement = {
        $eval: jest.fn()
          .mockImplementation((selector, fn, ...args) => {
            if (selector.includes('title')) return Promise.resolve('Voice AI Engineer');
            if (selector.includes('location')) return Promise.resolve('San Francisco');
            if (selector.includes('description')) return Promise.resolve('Amazing job opportunity');
            if (selector === 'a') {
              // The crawler passes the base URL as the third argument
              if (args.length > 0) {
                return Promise.resolve('https://deepgram.com/jobs/123');
              }
              return Promise.resolve('/jobs/123');
            }
            return Promise.resolve('');
          }),
        getAttribute: jest.fn().mockResolvedValue('job-123'),
      };

      mockPage.waitForSelector.mockResolvedValue(undefined);
      mockPage.$$.mockResolvedValue([mockElement] as any);

      const jobs = await (jobsCrawler as any).extractJobsFromSource(source);

      expect(mockPage.waitForSelector).toHaveBeenCalled();
      expect(jobs.length).toBe(1);
      expect(jobs[0].title).toBe('Voice AI Engineer');
    });

    it('should handle extraction errors gracefully', async () => {
      const source = { 
        id: 'error-source', 
        name: 'Error Company', 
        url: 'https://error.com',
        type: 'static' as const
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Failed to fetch'));

      const jobs = await (jobsCrawler as any).extractJobsFromSource(source);

      expect(jobs).toEqual([]);
    });
  });
});