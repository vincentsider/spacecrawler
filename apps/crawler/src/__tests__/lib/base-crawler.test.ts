import { BaseCrawler } from '../../lib/base-crawler';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { createMockBrowser, createMockPage, createMockFetchResponse } from '../utils/test-helpers';
import { createMockCrawlerSource, createMockJob } from '../utils/factories';
import { Job, JobSchema } from '../../types';

// Mock implementations
jest.mock('playwright');
jest.mock('node-fetch');

// Test implementation of BaseCrawler
class TestCrawler extends BaseCrawler<Job> {
  name = 'Test Crawler';
  
  validate(data: unknown): Job {
    return JobSchema.parse(data);
  }
  
  async run(): Promise<Job[]> {
    return [createMockJob()];
  }
}

describe('BaseCrawler', () => {
  let crawler: TestCrawler;
  let mockBrowser: ReturnType<typeof createMockBrowser>;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(() => {
    crawler = new TestCrawler();
    mockBrowser = createMockBrowser();
    mockPage = createMockPage();
    
    (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);
    mockBrowser.newPage.mockResolvedValue(mockPage);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchStatic', () => {
    it('should fetch and parse HTML content', async () => {
      const html = '<html><body><h1>Test</h1></body></html>';
      const mockResponse = createMockFetchResponse(html);
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as any);

      const $ = await crawler['fetchStatic']('https://example.com');
      
      expect(fetch).toHaveBeenCalledWith('https://example.com');
      expect($('h1').text()).toBe('Test');
    });

    it('should handle fetch errors', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

      await expect(crawler['fetchStatic']('https://example.com')).rejects.toThrow('Network error');
    });
  });

  describe('fetchDynamic', () => {
    it('should launch browser and navigate to page', async () => {
      const page = await crawler['fetchDynamic']('https://example.com');
      
      expect(chromium.launch).toHaveBeenCalledWith({ headless: true });
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', { waitUntil: 'networkidle' });
      expect(page).toBe(mockPage);
    });

    it('should reuse existing browser instance', async () => {
      await crawler['fetchDynamic']('https://example.com');
      await crawler['fetchDynamic']('https://example2.com');
      
      expect(chromium.launch).toHaveBeenCalledTimes(1);
      expect(mockBrowser.newPage).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup', () => {
    it('should close browser if open', async () => {
      await crawler['fetchDynamic']('https://example.com');
      await crawler['cleanup']();
      
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle cleanup when no browser is open', async () => {
      await expect(crawler['cleanup']()).resolves.not.toThrow();
    });
  });

  describe('crawlMultipleSources', () => {
    it('should crawl multiple sources in parallel', async () => {
      const sources = [
        createMockCrawlerSource({ id: 'source1' }),
        createMockCrawlerSource({ id: 'source2' }),
        createMockCrawlerSource({ id: 'source3' }),
      ];
      
      const extractor = jest.fn().mockImplementation((source) => 
        Promise.resolve([createMockJob({ sourceId: source.id })])
      );

      const results = await crawler['crawlMultipleSources'](sources, extractor);
      
      expect(extractor).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
      expect(results[0].sourceId).toBe('source1');
      expect(results[1].sourceId).toBe('source2');
      expect(results[2].sourceId).toBe('source3');
    });

    it('should respect concurrency limit', async () => {
      const sources = Array.from({ length: 10 }, (_, i) => 
        createMockCrawlerSource({ id: `source${i}` })
      );
      
      let concurrentCalls = 0;
      let maxConcurrent = 0;
      
      const extractor = jest.fn().mockImplementation(async () => {
        concurrentCalls++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCalls);
        await new Promise(resolve => setTimeout(resolve, 50));
        concurrentCalls--;
        return [createMockJob()];
      });

      await crawler['crawlMultipleSources'](sources, extractor);
      
      expect(maxConcurrent).toBeLessThanOrEqual(3); // Default limit is 3
    });

    it('should handle extractor errors gracefully', async () => {
      const sources = [
        createMockCrawlerSource({ id: 'source1' }),
        createMockCrawlerSource({ id: 'source2' }),
      ];
      
      const extractor = jest.fn()
        .mockResolvedValueOnce([createMockJob()])
        .mockRejectedValueOnce(new Error('Extraction failed'));

      await expect(crawler['crawlMultipleSources'](sources, extractor)).rejects.toThrow('Extraction failed');
    });
  });

  describe('generateSourceId', () => {
    it('should generate consistent source IDs', () => {
      const id1 = crawler['generateSourceId']('source1', 'item1');
      const id2 = crawler['generateSourceId']('source1', 'item1');
      const id3 = crawler['generateSourceId']('source2', 'item1');
      
      expect(id1).toBe('source1-item1');
      expect(id1).toBe(id2);
      expect(id3).toBe('source2-item1');
    });
  });

  describe('delay', () => {
    it('should delay execution for specified milliseconds', async () => {
      const start = Date.now();
      await crawler['delay'](100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some margin
      expect(end - start).toBeLessThan(150);
    });
  });
});