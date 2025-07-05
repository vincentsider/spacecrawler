# SpaceCrawler Database Documentation

## Overview
SpaceCrawler uses Supabase (PostgreSQL) as its database. The schema is designed to support crawling, reviewing, and publishing voice AI-related content.

## Database Connection
- **Project ID**: slctfnnnkxtmjoieqprk
- **URL**: https://slctfnnnkxtmjoieqprk.supabase.co
- **Region**: eu-west-2

## Schema Structure

### Tables

#### 1. `crawler_sources`
Stores configuration for all crawler sources.
- `id` (UUID): Primary key
- `crawler_type` (ENUM): 'jobs', 'events', or 'products'
- `source_name` (TEXT): Human-readable name
- `source_url` (TEXT): URL to crawl
- `is_active` (BOOLEAN): Whether the source is active
- `last_crawled_at` (TIMESTAMPTZ): Last successful crawl time

#### 2. `jobs`
Stores job listings from various sources.
- `id` (UUID): Primary key
- `source_id` (UUID): Reference to crawler_sources
- `external_id` (TEXT): ID from the source
- `title`, `company_name`, `location`, `description`, etc.
- `status` (ENUM): 'pending', 'approved', 'rejected', 'published'
- Includes full-text search capabilities

#### 3. `events`
Stores voice AI-related events.
- `id` (UUID): Primary key
- `source_id` (UUID): Reference to crawler_sources
- `title`, `organizer`, `event_date`, `location`, etc.
- `tags` (TEXT[]): Array of event tags
- `is_virtual` (BOOLEAN): Virtual event flag

#### 4. `products`
Stores voice AI products and tools.
- `id` (UUID): Primary key
- `name`, `company_name`, `website_url`
- `short_description` (TEXT): 10-word description
- `full_description` (TEXT): AI-generated full description
- `key_features` (TEXT[]): Array of features
- `use_cases` (TEXT[]): Array of use cases

#### 5. `crawler_runs`
Tracks crawler execution history.
- Logs success/failure, items found/new/updated
- Stores error messages and execution logs

#### 6. `admin_actions`
Audit log for admin actions on content.
- Tracks approve/reject/edit/publish actions
- Stores who performed the action and when

### Views
- `published_jobs`: Jobs with status='published'
- `published_events`: Events with status='published'  
- `published_products`: Products with status='published'

### Row Level Security (RLS)
- Public users can only view published content
- Admin users have full access to all tables
- System can insert/update crawler runs

### Initial Data
The database is pre-populated with crawler sources:
- 11 job sources (LiveKit, Speechmatics, Deepgram, etc.)
- 1 event source (Lu.ma)
- 3 product sources (YCombinator, TopAI, Product Hunt)

## TypeScript Types
Generated types are available in `/packages/database/types.ts`

## Migrations
All database migrations are stored in `/database/migrations/`

## Environment Variables
Required environment variables (in `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://slctfnnnkxtmjoieqprk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_PROJECT_ID=slctfnnnkxtmjoieqprk
```