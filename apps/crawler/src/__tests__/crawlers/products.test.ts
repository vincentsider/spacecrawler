import { productsCrawler } from '../../crawlers/products';
import { chromium } from 'playwright';
import * as supabase from '../../lib/supabase';
import { createMockBrowser, createMockPage } from '../utils/test-helpers';

jest.mock('playwright');
jest.mock('../../lib/supabase');

describe('ProductsCrawler', () => {
  let mockBrowser: ReturnType<typeof createMockBrowser>;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(() => {
    mockBrowser = createMockBrowser();
    mockPage = createMockPage();
    
    (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);
    mockBrowser.newPage.mockResolvedValue(mockPage);
    (supabase.insertProducts as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('run', () => {
    it('should crawl products from multiple sources', async () => {
      // Mock Product Hunt elements
      const mockPHElement = {
        $eval: jest.fn()
          .mockImplementation((selector, fn) => {
            // For text content selectors, the crawler uses el.textContent
            if (selector.includes('[data-test="product-name"]') || selector.includes('h3')) {
              const mockEl = { textContent: 'Voice Assistant Pro' };
              return Promise.resolve(fn(mockEl));
            }
            if (selector === '[data-test="product-maker"]') {
              const mockEl = { textContent: 'AI Corp' };
              return Promise.resolve(fn(mockEl));
            }
            if (selector === '[data-test="product-tagline"]') {
              const mockEl = { textContent: 'Professional voice assistant platform' };
              return Promise.resolve(fn(mockEl));
            }
            if (selector === 'a') {
              // The crawler calls fn with el, which calls el.getAttribute('href')
              const mockEl = {
                getAttribute: (attr: string) => attr === 'href' ? '/posts/voice-assistant-pro' : null
              };
              return Promise.resolve(fn(mockEl));
            }
            if (selector === 'img') {
              const mockEl = {
                getAttribute: (attr: string) => attr === 'src' ? 'https://ph.com/image.jpg' : null
              };
              return Promise.resolve(fn(mockEl));
            }
            return Promise.resolve('');
          }),
        getAttribute: jest.fn().mockResolvedValue('product-123'),
      };

      // Mock YC elements
      const mockYCElement = {
        $eval: jest.fn()
          .mockImplementation((selector, fn) => {
            if (selector.includes('.company-name') || selector === 'h3') {
              const mockEl = { textContent: 'VoiceFlow' };
              return Promise.resolve(fn(mockEl));
            }
            if (selector.includes('.company-description') || selector.includes('.tagline')) {
              const mockEl = { textContent: 'Build voice apps without code' };
              return Promise.resolve(fn(mockEl));
            }
            if (selector === 'a') {
              const mockEl = {
                getAttribute: (attr: string) => attr === 'href' ? 'https://voiceflow.com' : null
              };
              return Promise.resolve(fn(mockEl));
            }
            if (selector === 'img') {
              const mockEl = {
                getAttribute: (attr: string) => attr === 'src' ? 'https://yc.com/logo.png' : null
              };
              return Promise.resolve(fn(mockEl));
            }
            return Promise.resolve('');
          }),
        getAttribute: jest.fn().mockResolvedValue('company-456'),
      };

      // The crawler will create a new page for each source
      const mockPHPage = createMockPage();
      const mockYCPage = createMockPage();
      
      // Mock Product Hunt page
      mockPHPage.waitForSelector.mockImplementation((selector) => {
        if (selector === '[data-test="product-item"]') return Promise.resolve(undefined);
        return Promise.reject(new Error('Timeout'));
      });
      mockPHPage.$$.mockImplementation((selector) => {
        if (selector === '[data-test="product-item"]') return Promise.resolve([mockPHElement]);
        return Promise.resolve([]);
      });
      mockPHPage.close.mockResolvedValue(undefined);
      
      // Mock YC page  
      mockYCPage.waitForSelector.mockImplementation((selector) => {
        if (selector.includes('.company-card') || selector.includes('[data-company-id]')) return Promise.resolve(undefined);
        return Promise.reject(new Error('Timeout'));
      });
      mockYCPage.$$.mockImplementation((selector) => {
        if (selector.includes('.company-card') || selector.includes('[data-company-id]')) return Promise.resolve([mockYCElement]);
        return Promise.resolve([]);
      });
      mockYCPage.close.mockResolvedValue(undefined);
      
      // Return different pages for each call
      mockBrowser.newPage
        .mockResolvedValueOnce(mockPHPage)
        .mockResolvedValueOnce(mockYCPage);

      const products = await productsCrawler.run();

      expect(chromium.launch).toHaveBeenCalledWith({ headless: true });
      expect(products.length).toBeGreaterThan(0);
      expect(supabase.insertProducts).toHaveBeenCalledWith(expect.any(Array));

      // Verify product structure
      const phProduct = products.find(p => p.name === 'Voice Assistant Pro');
      expect(phProduct).toBeDefined();
      if (phProduct) {
        expect(phProduct).toMatchObject({
          name: 'Voice Assistant Pro',
          company: 'AI Corp',
          description: 'Professional voice assistant platform',
          category: 'Voice AI',
        });
      }
    });

    it('should handle products with minimal data', async () => {
      const mockElement = {
        $eval: jest.fn()
          .mockImplementation((selector, fn) => {
            if (selector.includes('[data-test="product-name"]') || selector.includes('h3')) {
              const mockEl = { textContent: 'Simple Product' };
              return Promise.resolve(fn(mockEl));
            }
            if (selector === 'a') {
              const mockEl = {
                getAttribute: (attr: string) => attr === 'href' ? '/posts/simple-product' : null
              };
              return Promise.resolve(fn(mockEl));
            }
            // Other fields should catch errors and return default values
            if (selector === '[data-test="product-maker"]') {
              return Promise.reject(new Error('No maker'));
            }
            if (selector === '[data-test="product-tagline"]') {
              const mockEl = { textContent: '' };
              return Promise.resolve(fn(mockEl));
            }
            if (selector === 'img') {
              return Promise.reject(new Error('No image'));
            }
            return Promise.resolve('');
          }),
        getAttribute: jest.fn().mockResolvedValue('product-simple'),
      };

      // Create two pages that both return the same minimal element
      const mockPage1 = createMockPage();
      const mockPage2 = createMockPage();
      
      mockPage1.waitForSelector.mockImplementation((selector) => {
        if (selector === '[data-test="product-item"]') return Promise.resolve(undefined);
        return Promise.reject(new Error('Timeout'));
      });
      mockPage1.$$.mockImplementation((selector) => {
        if (selector === '[data-test="product-item"]') return Promise.resolve([mockElement]);
        return Promise.resolve([]);
      });
      mockPage1.close.mockResolvedValue(undefined);
      
      mockPage2.waitForSelector.mockImplementation((selector) => {
        if (selector.includes('.company-card') || selector.includes('[data-company-id]')) return Promise.resolve(undefined);
        return Promise.reject(new Error('Timeout'));
      });
      mockPage2.$$.mockImplementation((selector) => {
        if (selector.includes('.company-card') || selector.includes('[data-company-id]')) return Promise.resolve([]);
        return Promise.resolve([]);
      });
      mockPage2.close.mockResolvedValue(undefined);
      
      mockBrowser.newPage
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      const products = await productsCrawler.run();

      expect(products.length).toBe(1);
      expect(products[0]).toMatchObject({
        name: 'Simple Product',
        company: 'Unknown',
        url: expect.stringContaining('producthunt.com'),
      });
    });

    it('should handle empty results', async () => {
      // Create two pages that both return empty results
      const mockEmptyPage1 = createMockPage();
      const mockEmptyPage2 = createMockPage();
      
      mockEmptyPage1.waitForSelector.mockResolvedValue(undefined);
      mockEmptyPage1.$$.mockResolvedValue([]);
      mockEmptyPage1.close.mockResolvedValue(undefined);
      
      mockEmptyPage2.waitForSelector.mockResolvedValue(undefined);
      mockEmptyPage2.$$.mockResolvedValue([]);
      mockEmptyPage2.close.mockResolvedValue(undefined);
      
      mockBrowser.newPage
        .mockResolvedValueOnce(mockEmptyPage1)
        .mockResolvedValueOnce(mockEmptyPage2);

      const products = await productsCrawler.run();

      expect(products).toEqual([]);
      expect(supabase.insertProducts).not.toHaveBeenCalled();
    });

    it('should handle page errors gracefully', async () => {
      // Mock both pages to fail
      const mockFailPage1 = createMockPage();
      const mockFailPage2 = createMockPage();
      
      mockFailPage1.waitForSelector.mockRejectedValue(new Error('Page load failed'));
      mockFailPage2.waitForSelector.mockRejectedValue(new Error('Page load failed'));
      
      mockBrowser.newPage
        .mockResolvedValueOnce(mockFailPage1)
        .mockResolvedValueOnce(mockFailPage2);

      const products = await productsCrawler.run();
      
      // The crawler should handle errors gracefully and return empty array
      expect(products).toEqual([]);
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });

  describe('validate', () => {
    it('should validate product data correctly', () => {
      const validProduct = {
        name: 'VoiceBot',
        company: 'AI Company',
        description: 'Voice AI platform',
        shortDescription: 'Build voice apps',
        url: 'https://voicebot.ai',
        category: 'Platform',
        sourceId: 'product-123',
        crawledAt: new Date(),
      };

      const result = productsCrawler.validate(validProduct);
      expect(result).toEqual(validProduct);
    });

    it('should throw on invalid product data', () => {
      const invalidProduct = {
        name: 'VoiceBot',
        // Missing required fields
      };

      expect(() => productsCrawler.validate(invalidProduct)).toThrow();
    });
  });
});