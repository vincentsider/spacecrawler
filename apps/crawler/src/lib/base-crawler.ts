import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import { Crawler, CrawlerSource } from '../types';

export abstract class BaseCrawler<T> implements Crawler<T> {
  abstract name: string;
  protected browser: Browser | null = null;
  protected limit = pLimit(3); // Limit concurrent requests

  abstract validate(data: unknown): T;
  abstract run(): Promise<T[]>;

  protected async fetchStatic(url: string): Promise<cheerio.CheerioAPI> {
    const response = await fetch(url);
    const html = await response.text();
    return cheerio.load(html);
  }

  protected async fetchDynamic(url: string): Promise<Page> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    const page = await this.browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    return page;
  }

  protected async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  protected async crawlMultipleSources(
    sources: CrawlerSource[],
    extractor: (source: CrawlerSource) => Promise<T[]>
  ): Promise<T[]> {
    const results = await Promise.all(
      sources.map((source) =>
        this.limit(() => extractor(source))
      )
    );
    
    return results.flat();
  }

  protected generateSourceId(source: string, id: string): string {
    return `${source}-${id}`;
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}