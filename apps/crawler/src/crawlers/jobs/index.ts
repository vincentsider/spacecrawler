import { BaseCrawler } from '../../lib/base-crawler';
import { Job, JobSchema, CrawlerSource } from '../../types';
import { insertJobs } from '../../lib/supabase';

// Define job sources
const JOB_SOURCES: CrawlerSource[] = [
  {
    id: 'livekit',
    name: 'LiveKit',
    url: 'https://livekit.io/careers',
    type: 'static'
  },
  {
    id: 'speechmatics',
    name: 'Speechmatics',
    url: 'https://www.speechmatics.com/careers',
    type: 'static'
  },
  {
    id: 'deepgram',
    name: 'Deepgram',
    url: 'https://deepgram.com/careers',
    type: 'dynamic'
  },
  {
    id: 'assemblyai',
    name: 'AssemblyAI',
    url: 'https://www.assemblyai.com/careers',
    type: 'static'
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    url: 'https://elevenlabs.io/careers',
    type: 'static'
  }
];

class JobsCrawler extends BaseCrawler<Job> {
  name = 'Jobs Crawler';

  validate(data: unknown): Job {
    return JobSchema.parse(data);
  }

  async run(): Promise<Job[]> {
    console.log(`Starting ${this.name}...`);
    let jobs: Job[] = [];
    
    try {
      jobs = await this.crawlMultipleSources(
        JOB_SOURCES,
        (source) => this.extractJobsFromSource(source)
      );

      console.log(`Found ${jobs.length} total jobs`);

      // Save to database
      if (jobs.length > 0) {
        try {
          await insertJobs(jobs);
          console.log(`Successfully saved ${jobs.length} jobs to database`);
        } catch (dbError) {
          console.error('Error saving jobs to database:', dbError);
          // Continue - we still want to return the jobs we found
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
    
    return jobs;
  }

  private async extractJobsFromSource(source: CrawlerSource): Promise<Job[]> {
    console.log(`Crawling ${source.name} jobs...`);
    
    try {
      if (source.type === 'static') {
        return await this.extractStaticJobs(source);
      } else {
        return await this.extractDynamicJobs(source);
      }
    } catch (error) {
      console.error(`Error crawling ${source.name}:`, error);
      return [];
    }
  }

  private async extractStaticJobs(source: CrawlerSource): Promise<Job[]> {
    const jobs: Job[] = [];
    
    try {
      const $ = await this.fetchStatic(source.url);
      console.log(`Successfully fetched static page for ${source.name}`);
      
      // Try multiple selector combinations
      const selectors = [
        '.job-listing',
        '.career-item',
        '.position',
        '[class*="job"]',
        '[class*="career"]',
        '[class*="opening"]',
        '[data-job]',
        'article',
        '.vacancy',
        '.opportunity'
      ];
      
      let foundElements = false;
      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements using selector: ${selector}`);
          foundElements = true;
          
          elements.each((_, element) => {
            try {
              const $el = $(element);
              
              // Try multiple title selectors
              let title = '';
              const titleSelectors = ['.job-title', '.position-title', 'h3', 'h2', 'h4', '[class*="title"]', 'a'];
              for (const titleSel of titleSelectors) {
                const found = $el.find(titleSel).first().text().trim();
                if (found) {
                  title = found;
                  break;
                }
              }
              
              // Try multiple location selectors
              let location = 'Remote';
              const locationSelectors = ['.location', '.job-location', '[class*="location"]', '[class*="place"]'];
              for (const locSel of locationSelectors) {
                const found = $el.find(locSel).first().text().trim();
                if (found) {
                  location = found;
                  break;
                }
              }
              
              // Try to find a URL
              let url = '';
              const link = $el.find('a').first();
              if (link.length > 0) {
                const href = link.attr('href');
                if (href) {
                  try {
                    url = new URL(href, source.url).href;
                  } catch {
                    url = source.url; // Fallback to source URL
                  }
                }
              }
              
              // Build the job object
              const job: Job = {
                title: title || 'Voice AI Position',
                company: source.name,
                location: location,
                description: $el.text().trim().substring(0, 500), // Use full text as description
                url: url || source.url,
                type: 'full-time',
                remote: location.toLowerCase().includes('remote') || true,
                tags: ['voice-ai', source.name.toLowerCase()],
                sourceId: this.generateSourceId(source.id, $el.attr('id') || Math.random().toString()),
                crawledAt: new Date()
              };

              if (job.title && job.title !== 'Voice AI Position') {
                jobs.push(this.validate(job));
              }
            } catch (error) {
              console.error(`Error parsing job element for ${source.name}:`, error);
            }
          });
          
          if (jobs.length > 0) break; // If we found jobs, stop trying other selectors
        }
      }
      
      if (!foundElements) {
        console.log(`No job elements found for ${source.name}, returning empty array`);
      } else {
        console.log(`Extracted ${jobs.length} jobs from ${source.name}`);
      }
    } catch (error) {
      console.error(`Error fetching static page for ${source.name}:`, error);
    }

    return jobs;
  }

  private async extractDynamicJobs(source: CrawlerSource): Promise<Job[]> {
    const jobs: Job[] = [];
    let page;
    
    try {
      page = await this.fetchDynamic(source.url);
      console.log(`Successfully loaded dynamic page for ${source.name}`);
      
      // Try multiple selector strategies with timeout handling
      const selectorGroups = [
        '.job-listing, .career-item, .position',
        '[class*="job"], [class*="career"], [class*="opening"]',
        'article, .vacancy, .opportunity',
        'div[data-job], div[data-career], [role="listitem"]'
      ];
      
      let jobElements: any[] = [];
      
      for (const selectors of selectorGroups) {
        try {
          console.log(`Trying selectors: ${selectors}`);
          await page.waitForSelector(selectors, { timeout: 5000 });
          jobElements = await page.$$(selectors);
          
          if (jobElements.length > 0) {
            console.log(`Found ${jobElements.length} job elements with selectors: ${selectors}`);
            break;
          }
        } catch {
          console.log(`Timeout waiting for selectors: ${selectors}, trying next...`);
        }
      }
      
      // If no elements found with specific selectors, try a more generic approach
      if (jobElements.length === 0) {
        console.log('No specific job elements found, trying generic approach...');
        jobElements = await page.$$('article, section > div, main div[class]');
        console.log(`Found ${jobElements.length} generic elements to check`);
      }

      for (const element of jobElements) {
        try {
          // Extract text content to check if it's job-related
          const textContent = await element.evaluate((el: Element) => el.textContent || '');
          const lowerText = textContent.toLowerCase();
          
          // Skip if doesn't seem job-related
          if (!lowerText.includes('engineer') && !lowerText.includes('developer') && 
              !lowerText.includes('position') && !lowerText.includes('role') &&
              !lowerText.includes('job') && !lowerText.includes('career')) {
            continue;
          }
          
          // Try to extract title with multiple strategies
          let title = '';
          const titleSelectors = ['.job-title', '.position-title', 'h3', 'h2', 'h4', '[class*="title"]', 'a', 'strong'];
          for (const selector of titleSelectors) {
            try {
              const found = await element.$eval(selector, (el: Element) => el.textContent?.trim() || '');
              if (found && found.length > 5 && found.length < 200) {
                title = found;
                break;
              }
            } catch {/* Continue to next selector */}
          }
          
          // Try to extract location
          let location = 'Remote';
          try {
            location = await element.$eval('.location, .job-location, [class*="location"]', (el: Element) => el.textContent?.trim() || 'Remote');
          } catch {/* Continue to next selector */}
          
          // Try to extract URL
          let url = source.url;
          try {
            const href = await element.$eval('a', (el: Element) => el.getAttribute('href') || '');
            if (href) {
              url = new URL(href, source.url).href;
            }
          } catch {/* Continue to next selector */}
          
          // Use the element's text as description
          const description = textContent.substring(0, 500);
          
          const job: Job = {
            title: title || 'Voice AI Position',
            company: source.name,
            location: location,
            description: description,
            url: url,
            type: 'full-time',
            remote: location.toLowerCase().includes('remote') || true,
            tags: ['voice-ai', source.name.toLowerCase()],
            sourceId: this.generateSourceId(source.id, Math.random().toString()),
            crawledAt: new Date()
          };

          if (job.title && job.title !== 'Voice AI Position') {
            try {
              jobs.push(this.validate(job));
            } catch (validationError) {
              console.error(`Validation error for job from ${source.name}:`, validationError);
            }
          }
        } catch (error) {
          console.error(`Error parsing job element for ${source.name}:`, error);
        }
      }
      
      console.log(`Extracted ${jobs.length} jobs from ${source.name}`);
    } catch (error) {
      console.error(`Error in dynamic job extraction for ${source.name}:`, error);
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.error('Error closing page:', closeError);
        }
      }
    }

    return jobs;
  }
}

export const jobsCrawler = new JobsCrawler();