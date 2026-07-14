-- Sarath Search Engine Database Schema

-- 1. Users Table (for authentication and settings)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Domains Table (track websites being crawled)
CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    domain_url TEXT UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'crawling', 'completed', 'failed'
    last_crawled_at TIMESTAMP WITH TIME ZONE,
    robots_txt_content TEXT,
    crawl_delay INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Pages Table (individual indexed pages)
CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    content TEXT,
    html_content TEXT,
    canonical_url TEXT,
    last_indexed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'indexed', -- 'indexed', 'error'
    page_hash TEXT, -- for duplicate detection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Keywords Table (unique keywords extracted from pages)
CREATE TABLE keywords (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) UNIQUE NOT NULL,
    frequency INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. IndexTerms Table (The Inverted Index: maps terms to pages)
-- This is the heart of the search engine
CREATE TABLE index_terms (
    term_id INTEGER REFERENCES keywords(id) ON DELETE CASCADE,
    page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
    position INTEGER[], -- Positions of the term in the content for phrase search
    tf_idf DOUBLE PRECISION, -- Term Frequency-Inverse Document Frequency
    bm25_score DOUBLE PRECISION,
    PRIMARY KEY (term_id, page_id)
);

-- 6. CrawlQueue Table (Redis is primary, but DB provides persistence/recovery)
CREATE TABLE crawl_queue (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    retry_count INTEGER DEFAULT 0,
    next_crawl_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SearchHistory Table (Track user searches)
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. SearchAnalytics Table (Deep analytics)
CREATE TABLE search_analytics (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    clicked_page_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
    position_clicked INTEGER,
    search_time_ms INTEGER,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. CrawlerLogs Table
CREATE TABLE crawler_logs (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER REFERENCES domains(id) ON DELETE SET NULL,
    log_level VARCHAR(10) DEFAULT 'INFO',
    message TEXT,
    error_stack TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. SystemLogs Table
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    component VARCHAR(50),
    log_level VARCHAR(10) DEFAULT 'INFO',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_pages_url ON pages(url);
CREATE INDEX idx_index_terms_tf_idf ON index_terms(tf_idf DESC);
CREATE INDEX idx_index_terms_bm25 ON index_terms(bm25_score DESC);
CREATE INDEX idx_crawl_queue_status ON crawl_queue(status);
CREATE INDEX idx_search_history_query ON search_history(query);
