import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://slctfnnnkxtmjoieqprk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsY3Rmbm5ua3h0bWpvaWVxcHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MDc0NTEsImV4cCI6MjA2NzI4MzQ1MX0.rbAv3eRpLNHrgFkEHU1FtB2Hu-CSGS69fm3CHB5iWT8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions based on the database schema
export interface Job {
  id: string
  source_id?: string
  external_id?: string
  title: string
  company_name: string
  location?: string
  location_type?: 'remote' | 'onsite' | 'hybrid'
  description?: string
  requirements?: string
  salary_range?: string
  application_url: string
  publication_date?: string
  status?: 'pending' | 'approved' | 'rejected' | 'published'
  published_at?: string
  created_at?: string
  updated_at?: string
}

export interface Event {
  id: string
  source_id?: string
  external_id?: string
  title: string
  organizer?: string
  description?: string
  event_date: string
  event_time?: string
  end_date?: string
  end_time?: string
  location?: string
  is_virtual?: boolean
  registration_url: string
  image_url?: string
  price?: string
  tags?: string[]
  status?: 'pending' | 'approved' | 'rejected' | 'published'
  published_at?: string
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: string
  source_id?: string
  external_id?: string
  name: string
  company_name: string
  website_url: string
  short_description?: string
  full_description?: string
  tagline?: string
  key_features?: string[]
  use_cases?: string[]
  pricing_model?: string
  demo_url?: string
  logo_url?: string
  screenshots?: string[]
  status?: 'pending' | 'approved' | 'rejected' | 'published'
  published_at?: string
  created_at?: string
  updated_at?: string
}