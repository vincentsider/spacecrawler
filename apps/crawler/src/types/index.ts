import { z } from 'zod';

// Job schema
export const JobSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  description: z.string(),
  url: z.string().url(),
  postedDate: z.date().optional(),
  salary: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  remote: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sourceId: z.string(),
  crawledAt: z.date()
});

export type Job = z.infer<typeof JobSchema>;

// Event schema
export const EventSchema = z.object({
  title: z.string(),
  organizer: z.string(),
  date: z.date(),
  endDate: z.date().optional(),
  location: z.string(),
  description: z.string(),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  price: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sourceId: z.string(),
  crawledAt: z.date()
});

export type Event = z.infer<typeof EventSchema>;

// Product schema
export const ProductSchema = z.object({
  name: z.string(),
  company: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  features: z.array(z.string()).optional(),
  useCases: z.array(z.string()).optional(),
  pricing: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sourceId: z.string(),
  crawledAt: z.date()
});

export type Product = z.infer<typeof ProductSchema>;

// Crawler interface
export interface Crawler<T> {
  name: string;
  run(): Promise<T[]>;
  validate(data: unknown): T;
}

// Source configuration
export interface CrawlerSource {
  id: string;
  name: string;
  url: string;
  type: 'static' | 'dynamic';
  selector?: string;
}