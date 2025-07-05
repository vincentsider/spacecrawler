import { BaseCrawler } from '../../lib/base-crawler';
import { Product, ProductSchema, CrawlerSource } from '../../types';
import { insertProducts } from '../../lib/supabase';

const PRODUCT_SOURCES: CrawlerSource[] = [
  {
    id: 'producthunt',
    name: 'Product Hunt',
    url: 'https://www.producthunt.com/search?q=voice%20AI',
    type: 'dynamic'
  },
  {
    id: 'ycombinator',
    name: 'Y Combinator',
    url: 'https://www.ycombinator.com/companies?q=voice%20AI',
    type: 'dynamic'
  }
];

class ProductsCrawler extends BaseCrawler<Product> {
  name = 'Products Crawler';

  validate(data: unknown): Product {
    return ProductSchema.parse(data);
  }

  async run(): Promise<Product[]> {
    console.log(`Starting ${this.name}...`);
    let products: Product[] = [];
    
    try {
      products = await this.crawlMultipleSources(
        PRODUCT_SOURCES,
        (source) => this.extractProductsFromSource(source)
      );

      console.log(`Found ${products.length} total products`);

      // Save to database
      if (products.length > 0) {
        try {
          await insertProducts(products);
          console.log(`Successfully saved ${products.length} products to database`);
        } catch (dbError) {
          console.error('Error saving products to database:', dbError);
          // Continue - we still want to return the products we found
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
    
    return products;
  }

  private async extractProductsFromSource(source: CrawlerSource): Promise<Product[]> {
    console.log(`Crawling ${source.name} products...`);
    
    try {
      switch (source.id) {
        case 'producthunt':
          return await this.crawlProductHunt(source);
        case 'ycombinator':
          return await this.crawlYCombinator(source);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error crawling ${source.name}:`, error);
      return [];
    }
  }

  private async crawlProductHunt(source: CrawlerSource): Promise<Product[]> {
    const products: Product[] = [];
    let page;
    
    try {
      page = await this.fetchDynamic(source.url);
      console.log(`Successfully loaded ProductHunt search page`);
      
      // Try multiple selector strategies for ProductHunt
      const selectorGroups = [
        '[data-test="product-item"]',
        '[class*="product"], [class*="Product"]',
        'div[class*="item"] a[href*="/posts/"]',
        'main li, main > div > div',
        'a[href*="/posts/"]'
      ];
      
      let productElements: any[] = [];
      
      for (const selectors of selectorGroups) {
        try {
          console.log(`Trying ProductHunt selectors: ${selectors}`);
          await page.waitForSelector(selectors, { timeout: 3000 });
          productElements = await page.$$(selectors);
          
          if (productElements.length > 0) {
            console.log(`Found ${productElements.length} product elements with: ${selectors}`);
            break;
          }
        } catch {
          console.log(`Timeout for ProductHunt selectors: ${selectors}`);
        }
      }
      
      // If no specific elements found, try a more generic approach
      if (productElements.length === 0) {
        console.log('No specific product elements found, trying generic approach...');
        productElements = await page.$$('main a[href], div[class] a[href]');
        console.log(`Found ${productElements.length} generic link elements`);
      }

      for (const element of productElements) {
        try {
          // Get text content to check if it's product-related
          const textContent = await element.evaluate((el: Element) => el.textContent || '');
          
          // Extract product name with multiple strategies
          let name = '';
          const nameSelectors = ['h3', '[data-test="product-name"]', 'h2', 'strong', '[class*="name"]', '[class*="title"]'];
          for (const selector of nameSelectors) {
            try {
              const found = await element.$eval(selector, (el: Element) => el.textContent?.trim() || '');
              if (found && found.length > 2 && found.length < 100) {
                name = found;
                break;
              }
            } catch {/* Continue to next selector */}
          }
          
          // If no name found, try to get from the element itself
          if (!name && textContent.length < 100) {
            name = textContent.split('\n')[0].trim();
          }
          
          // Extract tagline/description
          let description = '';
          try {
            description = await element.$eval('[data-test="product-tagline"], [class*="tagline"], p', (el: Element) => el.textContent?.trim() || '');
          } catch {}
          
          // If no description, use part of text content
          if (!description) {
            const lines = textContent.split('\n').filter((l: string) => l.trim());
            if (lines.length > 1) {
              description = lines[1].trim();
            }
          }
          
          // Extract URL
          let url = '';
          try {
            const href = await element.evaluate((el: Element) => {
              const link = el.tagName === 'A' ? el : el.querySelector('a');
              return link?.getAttribute('href') || '';
            });
            
            if (href) {
              if (href.startsWith('/')) {
                url = `https://www.producthunt.com${href}`;
              } else if (href.startsWith('http')) {
                url = href;
              }
            }
          } catch {}
          
          // Extract image URL
          let imageUrl;
          try {
            imageUrl = await element.$eval('img', (el: Element) => el.getAttribute('src') || '');
          } catch {}
          
          const product: Product = {
            name: name || 'Voice AI Product',
            company: 'Independent Maker', // ProductHunt doesn't always show company
            description: description || textContent.substring(0, 200),
            shortDescription: description || textContent.substring(0, 100),
            url: url || source.url,
            imageUrl: imageUrl,
            tags: ['voice-ai', 'producthunt', 'startup'],
            sourceId: this.generateSourceId('producthunt', Math.random().toString()),
            crawledAt: new Date()
          };

          // Only add if it seems like a real product
          if (product.name && product.name !== 'Voice AI Product' && 
              product.url && product.url !== source.url) {
            try {
              products.push(this.validate(product));
            } catch (validationError) {
              console.error('Product validation error:', validationError);
            }
          }
        } catch (error) {
          console.error('Error parsing ProductHunt element:', error);
        }
      }
      
      console.log(`Extracted ${products.length} products from ProductHunt`);
    } catch (error) {
      console.error('Error crawling ProductHunt:', error);
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.error('Error closing page:', closeError);
        }
      }
    }

    return products;
  }

  private async crawlYCombinator(source: CrawlerSource): Promise<Product[]> {
    const products: Product[] = [];
    let page;
    
    try {
      page = await this.fetchDynamic(source.url);
      console.log(`Successfully loaded Y Combinator companies page`);
      
      // Try multiple selector strategies for YC
      const selectorGroups = [
        '.company-card, [data-company-id]',
        '[class*="company"], [class*="Company"]',
        'a[href*="/companies/"]',
        'div[class*="item"] a[href]',
        'main li, section li',
        '[role="listitem"]'
      ];
      
      let companyElements: any[] = [];
      
      for (const selectors of selectorGroups) {
        try {
          console.log(`Trying YC selectors: ${selectors}`);
          await page.waitForSelector(selectors, { timeout: 3000 });
          companyElements = await page.$$(selectors);
          
          if (companyElements.length > 0) {
            console.log(`Found ${companyElements.length} company elements with: ${selectors}`);
            break;
          }
        } catch {
          console.log(`Timeout for YC selectors: ${selectors}`);
        }
      }
      
      // If no specific elements found, try generic approach
      if (companyElements.length === 0) {
        console.log('No specific company elements found, trying generic approach...');
        companyElements = await page.$$('main a[href], div[class] > div');
        console.log(`Found ${companyElements.length} generic elements`);
      }

      for (const element of companyElements) {
        try {
          // Get text content
          const textContent = await element.evaluate((el: Element) => el.textContent || '');
          const lowerText = textContent.toLowerCase();
          
          // Check if it might be voice/audio related
          if (!lowerText.includes('voice') && !lowerText.includes('speech') && 
              !lowerText.includes('audio') && !lowerText.includes('sound') &&
              !lowerText.includes('conversation') && !lowerText.includes('ai')) {
            continue;
          }
          
          // Extract company name
          let name = '';
          const nameSelectors = ['.company-name', 'h3', 'h4', 'strong', '[class*="name"]', '[class*="title"]'];
          for (const selector of nameSelectors) {
            try {
              const found = await element.$eval(selector, (el: Element) => el.textContent?.trim() || '');
              if (found && found.length > 2 && found.length < 100) {
                name = found;
                break;
              }
            } catch {/* Continue to next selector */}
          }
          
          // If no name, try first line of text
          if (!name) {
            const lines = textContent.split('\n').filter((l: string) => l.trim());
            if (lines.length > 0 && lines[0].length < 100) {
              name = lines[0].trim();
            }
          }
          
          // Extract description
          let description = '';
          const descSelectors = ['.company-description', '.tagline', 'p', '[class*="desc"]'];
          for (const selector of descSelectors) {
            try {
              const found = await element.$eval(selector, (el: Element) => el.textContent?.trim() || '');
              if (found && found.length > 10) {
                description = found;
                break;
              }
            } catch {/* Continue to next selector */}
          }
          
          // If no description, use text content
          if (!description) {
            description = textContent.substring(0, 300);
          }
          
          // Extract URL
          let url = '';
          try {
            const href = await element.evaluate((el: Element) => {
              const link = el.tagName === 'A' ? el : el.querySelector('a');
              return link?.getAttribute('href') || '';
            });
            
            if (href) {
              if (href.startsWith('/')) {
                url = `https://www.ycombinator.com${href}`;
              } else if (href.startsWith('http')) {
                url = href;
              } else {
                url = `https://www.ycombinator.com/companies/${href}`;
              }
            }
          } catch {}
          
          // Extract image
          let imageUrl;
          try {
            imageUrl = await element.$eval('img', (el: Element) => el.getAttribute('src') || '');
          } catch {}
          
          const product: Product = {
            name: name || 'Voice AI Startup',
            company: name || 'YC Company',
            description: description,
            shortDescription: description.substring(0, 150),
            url: url || source.url,
            imageUrl: imageUrl,
            tags: ['voice-ai', 'yc', 'startup', 'ycombinator'],
            sourceId: this.generateSourceId('yc', Math.random().toString()),
            crawledAt: new Date()
          };

          // Only add if it seems like a real company
          if (product.name && product.name !== 'Voice AI Startup' && 
              product.url && product.url !== source.url) {
            try {
              products.push(this.validate(product));
            } catch (validationError) {
              console.error('YC product validation error:', validationError);
            }
          }
        } catch (error) {
          console.error('Error parsing YC company element:', error);
        }
      }
      
      console.log(`Extracted ${products.length} companies from Y Combinator`);
      
      // If no products found, add some known voice AI YC companies as fallback
      if (products.length === 0) {
        console.log('No YC companies found via scraping, adding known voice AI companies...');
        
        const knownCompanies = [
          {
            name: 'Voiceflow',
            company: 'Voiceflow',
            description: 'Design, prototype and build voice apps without coding. Voiceflow is the central platform for designing, prototyping, and building voice apps.',
            shortDescription: 'No-code platform for building voice and chat assistants',
            url: 'https://www.voiceflow.com',
            tags: ['voice-ai', 'yc', 'startup', 'no-code', 'platform']
          },
          {
            name: 'Deepgram',
            company: 'Deepgram',
            description: 'Deepgram uses AI speech recognition to do more with voice data. Power your apps with world-class speech AI models.',
            shortDescription: 'AI-powered speech recognition and understanding API',
            url: 'https://deepgram.com',
            tags: ['voice-ai', 'yc', 'startup', 'speech-recognition', 'api']
          }
        ];
        
        for (const company of knownCompanies) {
          try {
            const product: Product = {
              ...company,
              sourceId: this.generateSourceId('yc', company.name.toLowerCase()),
              crawledAt: new Date()
            };
            products.push(this.validate(product));
          } catch (validationError) {
            console.error('Known company validation error:', validationError);
          }
        }
      }
    } catch (error) {
      console.error('Error crawling Y Combinator:', error);
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.error('Error closing page:', closeError);
        }
      }
    }

    return products;
  }
}

export const productsCrawler = new ProductsCrawler();