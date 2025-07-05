import { eventsCrawler } from '../../crawlers/events';
import { chromium } from 'playwright';
import * as supabase from '../../lib/supabase';
import { createMockBrowser, createMockPage } from '../utils/test-helpers';

jest.mock('playwright');
jest.mock('../../lib/supabase');

describe('EventsCrawler', () => {
  let mockBrowser: ReturnType<typeof createMockBrowser>;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(() => {
    mockBrowser = createMockBrowser();
    mockPage = createMockPage();
    
    (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);
    mockBrowser.newPage.mockResolvedValue(mockPage);
    (supabase.insertEvents as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('run', () => {
    it('should crawl events from Lu.ma and save to database', async () => {
      // Mock event elements on the page
      const mockEventElement1 = {
        $eval: jest.fn()
          .mockImplementation((selector, fn) => {
            const mockContent: { [key: string]: string } = {
              'h3, .event-title': 'Voice AI Conference 2024',
              '.organizer, .host-name': 'AI Events Inc',
              '.date, .event-date': '2024-06-15',
              '.location, .event-location': 'San Francisco Convention Center',
              '.description, .event-description': 'Premier voice AI conference',
              'a': 'https://lu.ma/voice-ai-conf',
              'img': 'https://lu.ma/images/event.jpg',
              '.price, .ticket-price': '$299 - $599',
            };
            
            if (selector === 'a') {
              return Promise.resolve('/voice-ai-conf');
            }
            if (selector === 'img') {
              return Promise.resolve('https://lu.ma/images/event.jpg');
            }
            
            return Promise.resolve(mockContent[selector] || '');
          }),
        getAttribute: jest.fn().mockResolvedValue('event-123'),
      };
      
      const mockEventElement2 = {
        $eval: jest.fn()
          .mockImplementation((selector, fn) => {
            const mockContent: { [key: string]: string } = {
              'h3, .event-title': 'Voice Tech Meetup',
              '.organizer, .host-name': 'Voice Tech Community',
              '.date, .event-date': '2024-05-20',
              '.location, .event-location': 'Online',
              '.description, .event-description': 'Monthly voice tech community meetup',
              'a': '/voice-tech-meetup',
              '.price, .ticket-price': 'Free',
            };
            
            if (selector === 'a') {
              return Promise.resolve('/voice-tech-meetup');
            }
            if (selector === 'img') {
              return Promise.reject(new Error('No image'));
            }
            if (selector === '.organizer, .host-name') {
              return Promise.resolve('Voice Tech Community');
            }
            
            return Promise.resolve(mockContent[selector] || '');
          }),
        getAttribute: jest.fn().mockResolvedValue('event-456'),
      };

      mockPage.waitForSelector.mockResolvedValue(undefined);
      mockPage.$$.mockResolvedValue([mockEventElement1, mockEventElement2]);
      mockPage.close.mockResolvedValue(undefined);

      const events = await eventsCrawler.run();

      expect(chromium.launch).toHaveBeenCalledWith({ headless: true });
      expect(mockPage.goto).toHaveBeenCalledWith('https://lu.ma/search?q=voice+AI', { waitUntil: 'networkidle' });
      expect(events).toHaveLength(2);
      expect(supabase.insertEvents).toHaveBeenCalledWith(expect.any(Array));

      // Verify event structure
      const firstEvent = events[0];
      expect(firstEvent).toMatchObject({
        title: 'Voice AI Conference 2024',
        organizer: 'AI Events Inc',
        location: 'San Francisco Convention Center',
        description: 'Premier voice AI conference',
        url: 'https://lu.ma/voice-ai-conf',
        imageUrl: 'https://lu.ma/images/event.jpg',
        price: '$299 - $599',
      });
    });

    it('should handle empty results', async () => {
      mockPage.waitForSelector.mockResolvedValue(undefined);
      mockPage.$$.mockResolvedValue([]);
      mockPage.close.mockResolvedValue(undefined);

      const events = await eventsCrawler.run();

      expect(events).toEqual([]);
      expect(supabase.insertEvents).not.toHaveBeenCalled();
    });

    it('should handle page errors gracefully', async () => {
      mockPage.waitForSelector.mockRejectedValue(new Error('Page load failed'));

      await expect(eventsCrawler.run()).rejects.toThrow('Page load failed');
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });

  describe('validate', () => {
    it('should validate event data correctly', () => {
      const validEvent = {
        title: 'Voice AI Conference',
        organizer: 'AI Events',
        date: new Date('2024-06-15'),
        location: 'San Francisco',
        description: 'Great conference',
        url: 'https://lu.ma/event',
        sourceId: 'event-123',
        crawledAt: new Date(),
      };

      const result = eventsCrawler.validate(validEvent);
      expect(result).toEqual(validEvent);
    });

    it('should throw on invalid event data', () => {
      const invalidEvent = {
        title: 'Voice AI Conference',
        // Missing required fields
      };

      expect(() => eventsCrawler.validate(invalidEvent)).toThrow();
    });
  });

});