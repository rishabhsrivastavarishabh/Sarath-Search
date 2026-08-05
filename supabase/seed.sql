-- ==================================================
-- SARATH SEARCH ENGINE v7.2 - MASSIVE INDEX & FULL-TEXT SCHEMAS
-- ==================================================

-- 1. Websites Table (Webmaster Domain Ownership)
CREATE TABLE IF NOT EXISTS public.websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  canonical_domain VARCHAR(255),
  verification_method VARCHAR(50) DEFAULT 'meta_tag',
  verification_token VARCHAR(255) DEFAULT gen_random_uuid()::text,
  verification_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ
);

-- 2. Submitted URLs Table
CREATE TABLE IF NOT EXISTS public.submitted_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
  url TEXT NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  last_crawled TIMESTAMPTZ,
  crawl_priority INT DEFAULT 5
);

-- 3. Indexed Pages Table (Scale Ready for Millions/Billions of Pages)
CREATE TABLE IF NOT EXISTS public.indexed_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
  url TEXT NOT NULL UNIQUE,
  canonical_url TEXT,
  domain VARCHAR(255),
  title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  favicon_url TEXT,
  language VARCHAR(10) DEFAULT 'en',
  country VARCHAR(10) DEFAULT 'US',
  status_code INT DEFAULT 200,
  content_hash VARCHAR(64),
  indexed_time TIMESTAMPTZ DEFAULT NOW(),
  last_crawl TIMESTAMPTZ DEFAULT NOW(),
  search_score FLOAT DEFAULT 0.85,
  bm25_score FLOAT DEFAULT 0.0,
  internal_links JSONB DEFAULT '[]'::jsonb,
  external_links JSONB DEFAULT '[]'::jsonb,
  search_rank INT DEFAULT 1,
  is_indexed BOOLEAN DEFAULT true,
  fts TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(meta_description, '') || ' ' || coalesce(meta_keywords, ''))
  ) STORED
);

-- GIN Index for Massive Full-Text Web Search Scale
CREATE INDEX IF NOT EXISTS idx_indexed_pages_fts ON public.indexed_pages USING gin(fts);
CREATE INDEX IF NOT EXISTS idx_indexed_pages_domain ON public.indexed_pages(domain);
CREATE INDEX IF NOT EXISTS idx_indexed_pages_score ON public.indexed_pages(search_score DESC);

-- 4. Search History Table
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  country VARCHAR(10) DEFAULT 'US',
  search_type VARCHAR(50) DEFAULT 'all',
  clicked_url TEXT,
  clicked_domain VARCHAR(255),
  ai_mode BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Search Analytics Table
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results_count INT DEFAULT 0,
  latency_ms INT DEFAULT 100,
  country VARCHAR(10) DEFAULT 'US',
  device VARCHAR(20) DEFAULT 'desktop',
  browser VARCHAR(20) DEFAULT 'chrome',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Security Policies
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submitted_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indexed_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own websites" ON public.websites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage submitted URLs for own websites" ON public.submitted_urls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.websites 
      WHERE websites.id = submitted_urls.website_id AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Public read indexed pages" ON public.indexed_pages
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own search history" ON public.search_history
  FOR ALL USING (auth.uid() = user_id);
