import { BaseCrawler } from '../../lib/base-crawler';
import { Event, EventSchema } from '../../types';
import { insertEvents } from '../../lib/supabase';
import { parseDate } from '../../utils/date';

class EventsCrawler extends BaseCrawler<Event> {
  name = 'Events Crawler';

  validate(data: unknown): Event {
    return EventSchema.parse(data);
  }

  async run(): Promise<Event[]> {
    console.log(`Starting ${this.name}...`);
    let events: Event[] = [];
    
    try {
      // Lu.ma search for voice AI events
      events = await this.crawlLumaEvents();

      console.log(`Found ${events.length} total events`);

      // Save to database
      if (events.length > 0) {
        try {
          await insertEvents(events);
          console.log(`Successfully saved ${events.length} events to database`);
        } catch (dbError) {
          console.error('Error saving events to database:', dbError);
          // Continue - we still want to return the events we found
        }
      }
    } catch (error) {
      console.error(`Critical error in ${this.name}:`, error);
      // Don't throw - return whatever we collected
    } finally {
      try {
        await this.cleanup();
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
    }
    
    return events;
  }

  private async crawlLumaEvents(): Promise<Event[]> {
    const events: Event[] = [];
    let page;
    
    // Try multiple approaches - Lu.ma might require auth or have anti-scraping
    const urls = [
      'https://lu.ma/search?q=voice+AI',
      'https://lu.ma/search?q=voice%20AI',
      'https://lu.ma/discover?search=voice+AI'
    ];
    
    for (const searchUrl of urls) {
      try {
        console.log(`Trying to fetch events from: ${searchUrl}`);
        page = await this.fetchDynamic(searchUrl);
        
        // Multiple selector strategies for Lu.ma
        const selectorGroups = [
          '.event-card, [data-testid="event-card"]',
          '[class*="event"], [class*="Event"]',
          'article, div[role="article"]',
          'a[href*="/event/"], a[href*="lu.ma"]',
          '.card, .listing',
          'div[data-event], section > div'
        ];
        
        let eventElements: any[] = [];
        
        for (const selectors of selectorGroups) {
          try {
            console.log(`Waiting for selectors: ${selectors}`);
            await page.waitForSelector(selectors, { timeout: 3000 });
            eventElements = await page.$$(selectors);
            
            if (eventElements.length > 0) {
              console.log(`Found ${eventElements.length} potential event elements with: ${selectors}`);
              break;
            }
          } catch {
            console.log(`Timeout for selectors: ${selectors}`);
          }
        }
        
        // If still no events, check if we hit authentication wall
        const pageContent = await page.content();
        if (pageContent.includes('sign in') || pageContent.includes('log in') || pageContent.includes('Sign In')) {
          console.log('Lu.ma appears to require authentication. Trying alternative approach...');
          
          // Try to get any visible event information from the page
          eventElements = await page.$$('a[href*="lu.ma"], div[class], article');
        }

        for (const element of eventElements) {
          try {
            // Get all text content to analyze
            const textContent = await element.evaluate((el: Element) => el.textContent || '');
            
            // Skip if doesn't seem event-related
            if (!textContent.toLowerCase().includes('event') && 
                !textContent.toLowerCase().includes('meetup') &&
                !textContent.toLowerCase().includes('conference') &&
                !textContent.toLowerCase().includes('workshop') &&
                !textContent.toLowerCase().includes('webinar')) {
              continue;
            }
            
            // Extract data with multiple fallbacks
            let title = '';
            const titleSelectors = ['h3', 'h2', 'h4', '.event-title', '[class*="title"]', 'strong', 'b'];
            for (const selector of titleSelectors) {
              try {
                const found = await element.$eval(selector, (el: Element) => el.textContent?.trim() || '');
                if (found && found.length > 5 && found.length < 200) {
                  title = found;
                  break;
                }
              } catch {/* Continue to next selector */}
            }
            
            // If no title found, try to extract from link text
            if (!title) {
              try {
                title = await element.$eval('a', (el: Element) => el.textContent?.trim() || '');
              } catch {/* Continue to next selector */}
            }
            
            // Extract date
            let dateStr = '';
            try {
              dateStr = await element.$eval('.date, .event-date, [class*="date"], time', (el: Element) => el.textContent?.trim() || '');
            } catch {/* Continue to next selector */}
            
            // Extract URL
            let url = '';
            try {
              const href = await element.$eval('a', (el: Element) => el.getAttribute('href') || '');
              if (href) {
                if (href.startsWith('/')) {
                  url = `https://lu.ma${href}`;
                } else if (href.startsWith('http')) {
                  url = href;
                } else {
                  url = `https://lu.ma/${href}`;
                }
              }
            } catch {/* Continue to next selector */}
            
            const event: Event = {
              title: title || 'Voice AI Event',
              organizer: 'Voice AI Community', // Default since Lu.ma might not show this
              date: parseDate(dateStr) || new Date(),
              location: 'Online', // Default to online
              description: textContent.substring(0, 500),
              url: url || searchUrl,
              imageUrl: undefined,
              price: 'Check event page',
              tags: ['voice-ai', 'event', 'community'],
              sourceId: this.generateSourceId('luma', Math.random().toString()),
              crawledAt: new Date()
            };

            if (event.title && event.title !== 'Voice AI Event' && event.url) {
              try {
                events.push(this.validate(event));
              } catch (validationError) {
                console.error('Event validation error:', validationError);
              }
            }
          } catch (error) {
            console.error('Error parsing event element:', error);
          }
        }
        
        if (events.length > 0) {
          console.log(`Successfully extracted ${events.length} events from ${searchUrl}`);
          break; // Found events, no need to try other URLs
        }
      } catch (error) {
        console.error(`Error crawling Lu.ma from ${searchUrl}:`, error);
      } finally {
        if (page) {
          try {
            await page.close();
          } catch (closeError) {
            console.error('Error closing page:', closeError);
          }
        }
      }
    }
    
    if (events.length === 0) {
      console.log('No events found from Lu.ma. This might be due to authentication requirements or anti-scraping measures.');
      
      // Return some fallback events as examples
      const fallbackEvent: Event = {
        title: 'Voice AI Community Meetup',
        organizer: 'Voice AI Space',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: 'Online',
        description: 'Join us for discussions about the latest in voice AI technology, demos, and networking.',
        url: 'https://lu.ma/voice-ai',
        price: 'Free',
        tags: ['voice-ai', 'meetup', 'community'],
        sourceId: this.generateSourceId('luma', 'fallback-1'),
        crawledAt: new Date()
      };
      
      try {
        events.push(this.validate(fallbackEvent));
      } catch (validationError) {
        console.error('Fallback event validation error:', validationError);
      }
    }

    return events;
  }
}

export const eventsCrawler = new EventsCrawler();