-- SpaceCrawler Database Schema
-- Database for managing voice AI jobs, events, and products

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

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES crawler_sources(id),
    external_id TEXT, -- ID from the source if available
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
    notes TEXT, -- Admin notes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, external_id)
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES crawler_sources(id),
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
    tags TEXT[], -- Array of tags
    crawled_at TIMESTAMPTZ DEFAULT NOW(),
    status content_status DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    published_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, external_id)
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES crawler_sources(id),
    external_id TEXT,
    name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    website_url TEXT NOT NULL,
    short_description TEXT, -- 10-word description
    full_description TEXT, -- AI-generated full description
    tagline TEXT,
    key_features TEXT[], -- Array of features
    use_cases TEXT[], -- Array of use cases
    pricing_model TEXT,
    demo_url TEXT,
    logo_url TEXT,
    screenshots TEXT[], -- Array of screenshot URLs
    crawled_at TIMESTAMPTZ DEFAULT NOW(),
    status content_status DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    published_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, external_id)
);

-- Crawler runs tracking
CREATE TABLE crawler_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crawler_type crawler_type NOT NULL,
    source_id UUID REFERENCES crawler_sources(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    success BOOLEAN,
    items_found INTEGER DEFAULT 0,
    items_new INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin actions log
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type crawler_type NOT NULL,
    content_id UUID NOT NULL, -- ID from jobs, events, or products table
    action TEXT NOT NULL, -- 'approve', 'reject', 'edit', 'publish'
    performed_by TEXT NOT NULL,
    changes JSONB, -- Store what was changed
    reason TEXT, -- Reason for rejection or notes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company ON jobs(company_name);
CREATE INDEX idx_jobs_published_at ON jobs(published_at) WHERE status = 'published';
CREATE INDEX idx_jobs_crawled_at ON jobs(crawled_at);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_published_at ON events(published_at) WHERE status = 'published';
CREATE INDEX idx_events_crawled_at ON events(crawled_at);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_company ON products(company_name);
CREATE INDEX idx_products_published_at ON products(published_at) WHERE status = 'published';
CREATE INDEX idx_products_crawled_at ON products(crawled_at);

CREATE INDEX idx_crawler_runs_type ON crawler_runs(crawler_type);
CREATE INDEX idx_crawler_runs_source ON crawler_runs(source_id);

-- Triggers for updated_at
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