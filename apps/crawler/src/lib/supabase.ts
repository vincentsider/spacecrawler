import { createClient } from '@supabase/supabase-js';
import { Job, Event, Product } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export async function insertJobs(jobs: Job[]) {
  // Transform Job type to match database schema
  const dbJobs = jobs.map(job => ({
    external_id: job.sourceId,
    title: job.title,
    company_name: job.company, // Changed from 'company' to 'company_name'
    location: job.location,
    location_type: job.remote ? 'remote' : 'onsite',
    description: job.description,
    salary_range: job.salary,
    application_url: job.url,
    publication_date: job.postedDate,
    crawled_at: job.crawledAt,
    status: 'pending'
  }));

  const { data, error } = await supabase
    .from('jobs')
    .insert(dbJobs)
    .select();

  if (error) {
    console.error('Error inserting jobs:', error);
    throw error;
  }

  return data;
}

export async function insertEvents(events: Event[]) {
  // Transform Event type to match database schema
  const dbEvents = events.map(event => ({
    external_id: event.sourceId,
    title: event.title,
    organizer: event.organizer,
    description: event.description,
    event_date: event.date,
    end_date: event.endDate,
    location: event.location,
    is_virtual: event.location.toLowerCase().includes('online'),
    registration_url: event.url,
    image_url: event.imageUrl,
    price: event.price,
    tags: event.tags,
    crawled_at: event.crawledAt, // This will be handled by the database trigger
    status: 'pending'
  }));

  const { data, error } = await supabase
    .from('events')
    .insert(dbEvents)
    .select();

  if (error) {
    console.error('Error inserting events:', error);
    throw error;
  }

  return data;
}

export async function insertProducts(products: Product[]) {
  // Transform Product type to match database schema
  const dbProducts = products.map(product => ({
    external_id: product.sourceId,
    name: product.name,
    company_name: product.company, // Changed from 'company' to 'company_name'
    website_url: product.url,
    short_description: product.shortDescription?.substring(0, 100), // Enforce 100 char limit
    full_description: product.description,
    tagline: product.shortDescription,
    key_features: product.features,
    use_cases: product.useCases,
    pricing_model: product.pricing,
    demo_url: product.url, // Using main URL as demo URL for now
    logo_url: product.imageUrl,
    screenshots: product.imageUrl ? [product.imageUrl] : null,
    crawled_at: product.crawledAt,
    status: 'pending'
    // Note: 'category' field removed as it doesn't exist in the database schema
  }));

  const { data, error } = await supabase
    .from('products')
    .insert(dbProducts)
    .select();

  if (error) {
    console.error('Error inserting products:', error);
    throw error;
  }

  return data;
}