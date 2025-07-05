-- Migration: 001_initial_schema
-- Description: Initial database schema for SpaceCrawler

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For GIN indexes

-- Create enum types
CREATE TYPE content_status AS ENUM ('pending', 'approved', 'rejected', 'published');
CREATE TYPE crawler_type AS ENUM ('jobs', 'events', 'products');
CREATE TYPE job_location_type AS ENUM ('remote', 'onsite', 'hybrid');

-- Crawler sources configuration table
CREATE TABLE crawler_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crawler_type crawler_type NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_crawled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table with full-text search
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES crawler_sources(id) ON DELETE SET NULL,
    external_id TEXT,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    location TEXT,
    location_type job_location_type,
    description TEXT,
    requirements TEXT,
    salary_range TEXT,
    application_url TEXT NOT NULL,
    publication_date DATE,
    crawled_at TIMESTAMPTZ DEFAULT NOW(),
    status content_status DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    published_at TIMESTAMPTZ,
    notes TEXT,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(company_name, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(requirements, '')), 'D')
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_job_source UNIQUE(source_id, external_id)
);

-- Events table with full-text search
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES crawler_sources(id) ON DELETE SET NULL,
    external_id TEXT,
    title TEXT NOT NULL,
    organizer TEXT,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    end_date DATE,
    end_time TIME,
    location TEXT,
    is_virtual BOOLEAN DEFAULT false,
    registration_url TEXT NOT NULL,
    image_url TEXT,
    price TEXT,
    tags TEXT[],
    crawled_at TIMESTAMPTZ DEFAULT NOW(),
    status content_status DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    published_at TIMESTAMPTZ,
    notes TEXT,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(organizer, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'D')
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_event_source UNIQUE(source_id, external_id),
    CONSTRAINT event_date_check CHECK (end_date IS NULL OR end_date >= event_date)
);

-- Products table with full-text search
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES crawler_sources(id) ON DELETE SET NULL,
    external_id TEXT,
    name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    website_url TEXT NOT NULL,
    short_description TEXT CHECK (char_length(short_description) <= 100),
    full_description TEXT,
    tagline TEXT,
    key_features TEXT[],
    use_cases TEXT[],
    pricing_model TEXT,
    demo_url TEXT,
    logo_url TEXT,
    screenshots TEXT[],
    crawled_at TIMESTAMPTZ DEFAULT NOW(),
    status content_status DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    published_at TIMESTAMPTZ,
    notes TEXT,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(company_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(short_description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(full_description, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(key_features, ' '), '')), 'D')
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_product_source UNIQUE(source_id, external_id)
);

-- Crawler runs tracking
CREATE TABLE crawler_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crawler_type crawler_type NOT NULL,
    source_id UUID REFERENCES crawler_sources(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    success BOOLEAN,
    items_found INTEGER DEFAULT 0,
    items_new INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    error_message TEXT,
    logs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin actions log
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type crawler_type NOT NULL,
    content_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'edit', 'publish', 'unpublish')),
    performed_by TEXT NOT NULL,
    changes JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
-- Status and date indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company ON jobs(company_name);
CREATE INDEX idx_jobs_published_at ON jobs(published_at) WHERE status = 'published';
CREATE INDEX idx_jobs_crawled_at ON jobs(crawled_at);
CREATE INDEX idx_jobs_publication_date ON jobs(publication_date);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_published_at ON events(published_at) WHERE status = 'published';
CREATE INDEX idx_events_crawled_at ON events(crawled_at);
CREATE INDEX idx_events_upcoming ON events(event_date) WHERE event_date >= CURRENT_DATE AND status = 'published';

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_company ON products(company_name);
CREATE INDEX idx_products_published_at ON products(published_at) WHERE status = 'published';
CREATE INDEX idx_products_crawled_at ON products(crawled_at);

-- Full-text search indexes
CREATE INDEX idx_jobs_search ON jobs USING GIN(search_vector);
CREATE INDEX idx_events_search ON events USING GIN(search_vector);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Array indexes for tags and features
CREATE INDEX idx_events_tags ON events USING GIN(tags);
CREATE INDEX idx_products_features ON products USING GIN(key_features);
CREATE INDEX idx_products_use_cases ON products USING GIN(use_cases);

-- Crawler tracking indexes
CREATE INDEX idx_crawler_runs_type ON crawler_runs(crawler_type);
CREATE INDEX idx_crawler_runs_source ON crawler_runs(source_id);
CREATE INDEX idx_crawler_runs_success ON crawler_runs(success);

-- Admin actions indexes
CREATE INDEX idx_admin_actions_content ON admin_actions(content_type, content_id);
CREATE INDEX idx_admin_actions_performed_by ON admin_actions(performed_by);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawler_sources_updated_at BEFORE UPDATE ON crawler_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update crawler source last_crawled_at
CREATE OR REPLACE FUNCTION update_source_last_crawled()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.success = true AND NEW.completed_at IS NOT NULL THEN
        UPDATE crawler_sources 
        SET last_crawled_at = NEW.completed_at 
        WHERE id = NEW.source_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_source_last_crawled_trigger
    AFTER UPDATE OF completed_at ON crawler_runs
    FOR EACH ROW 
    WHEN (NEW.success = true)
    EXECUTE FUNCTION update_source_last_crawled();

-- Row Level Security (RLS) policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawler_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawler_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published jobs" ON jobs
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view published events" ON events
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view published products" ON products
    FOR SELECT USING (status = 'published');

-- Admin full access (requires authenticated user with admin role)
CREATE POLICY "Admins have full access to jobs" ON jobs
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to events" ON events
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to products" ON products
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to crawler sources" ON crawler_sources
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view crawler runs" ON crawler_runs
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can insert crawler runs" ON crawler_runs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update crawler runs" ON crawler_runs
    FOR UPDATE USING (true);

CREATE POLICY "Admins have full access to admin actions" ON admin_actions
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert initial crawler sources
INSERT INTO crawler_sources (crawler_type, source_name, source_url) VALUES
-- Jobs sources
('jobs', 'LiveKit Careers', 'https://livekit.io/careers'),
('jobs', 'Speechmatics Careers', 'https://www.speechmatics.com/company/careers/roles'),
('jobs', 'Deepgram Careers', 'https://deepgram.com/careers#careers-job-listing-section'),
('jobs', 'LiveKit Ashby', 'https://jobs.ashbyhq.com/livekit'),
('jobs', 'Hume AI Greenhouse', 'https://job-boards.greenhouse.io/humeai'),
('jobs', 'Retell AI Careers', 'https://www.retellai.com/careers'),
('jobs', 'Speechmatics Greenhouse', 'https://job-boards.eu.greenhouse.io/speechmatics'),
('jobs', 'Vivoka Careers', 'https://vivoka.com/career/'),
('jobs', 'Pyannote LinkedIn', 'https://www.linkedin.com/company/pyannoteai/jobs/'),
('jobs', 'Rime Dover', 'https://app.dover.com/Rime/careers/b80f11b5-dc4c-4f69-a73d-1573437839b3'),
('jobs', 'Inworld AI Careers', 'https://inworld.ai/careers'),
-- Events sources
('events', 'Lu.ma Voice AI Events', 'https://lu.ma'),
-- Products sources  
('products', 'YCombinator Voice Companies', 'https://www.ycombinator.com/companies?query=voice'),
('products', 'TopAI Voice Tools', 'https://topai.tools/category/voice'),
('products', 'Product Hunt Voice', 'https://www.producthunt.com/search?q=voice');

-- Create views for easier querying
CREATE VIEW published_jobs AS
SELECT 
    j.*,
    cs.source_name,
    cs.source_url
FROM jobs j
LEFT JOIN crawler_sources cs ON j.source_id = cs.id
WHERE j.status = 'published';

CREATE VIEW published_events AS
SELECT 
    e.*,
    cs.source_name,
    cs.source_url
FROM events e
LEFT JOIN crawler_sources cs ON e.source_id = cs.id
WHERE e.status = 'published';

CREATE VIEW published_products AS
SELECT 
    p.*,
    cs.source_name,
    cs.source_url
FROM products p
LEFT JOIN crawler_sources cs ON p.source_id = cs.id
WHERE p.status = 'published';

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_content(
    search_query TEXT,
    content_type crawler_type DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    type crawler_type,
    title TEXT,
    company TEXT,
    description TEXT,
    url TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    WITH combined_results AS (
        -- Search jobs
        SELECT 
            j.id,
            'jobs'::crawler_type as type,
            j.title,
            j.company_name as company,
            j.description,
            j.application_url as url,
            ts_rank(j.search_vector, websearch_to_tsquery('english', search_query)) as rank
        FROM jobs j
        WHERE j.status = 'published' 
            AND j.search_vector @@ websearch_to_tsquery('english', search_query)
            AND (content_type IS NULL OR content_type = 'jobs')
        
        UNION ALL
        
        -- Search events
        SELECT 
            e.id,
            'events'::crawler_type as type,
            e.title,
            e.organizer as company,
            e.description,
            e.registration_url as url,
            ts_rank(e.search_vector, websearch_to_tsquery('english', search_query)) as rank
        FROM events e
        WHERE e.status = 'published'
            AND e.search_vector @@ websearch_to_tsquery('english', search_query)
            AND (content_type IS NULL OR content_type = 'events')
        
        UNION ALL
        
        -- Search products
        SELECT 
            p.id,
            'products'::crawler_type as type,
            p.name as title,
            p.company_name as company,
            p.short_description as description,
            p.website_url as url,
            ts_rank(p.search_vector, websearch_to_tsquery('english', search_query)) as rank
        FROM products p
        WHERE p.status = 'published'
            AND p.search_vector @@ websearch_to_tsquery('english', search_query)
            AND (content_type IS NULL OR content_type = 'products')
    )
    SELECT * FROM combined_results
    ORDER BY rank DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions for public access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON published_jobs, published_events, published_products TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_content TO anon, authenticated;