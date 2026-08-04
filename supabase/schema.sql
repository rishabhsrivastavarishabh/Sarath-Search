-- Sarath Search Engine v3.0 Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  role_name TEXT NOT NULL DEFAULT 'user', -- 'admin' | 'user'
  permissions JSONB DEFAULT '[]'::jsonb,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  domain TEXT,
  category TEXT DEFAULT 'web',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SAVED_RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.saved_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  snippet TEXT,
  favicon_url TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SEARCH_HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  category TEXT DEFAULT 'all',
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SEARCH_ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  country TEXT DEFAULT 'US',
  device TEXT DEFAULT 'desktop',
  browser TEXT DEFAULT 'chrome',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info' | 'alert' | 'success'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. INDEXED_PAGES TABLE
CREATE TABLE IF NOT EXISTS public.indexed_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  status TEXT DEFAULT 'indexed', -- 'indexed' | 'pending' | 'failed'
  http_code INT DEFAULT 200,
  reading_time_min INT DEFAULT 2,
  last_crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CRAWLER_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.crawler_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT NOT NULL, -- 'SUCCESS' | 'BLOCKED_ROBOTS' | 'ERROR'
  latency_ms INT DEFAULT 0,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ROBOTS_CACHE TABLE
CREATE TABLE IF NOT EXISTS public.robots_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain TEXT UNIQUE NOT NULL,
  robots_txt_content TEXT,
  crawl_delay INT DEFAULT 0,
  is_allowed BOOLEAN DEFAULT TRUE,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. SITEMAPS TABLE
CREATE TABLE IF NOT EXISTS public.sitemaps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL,
  discovered_urls_count INT DEFAULT 0,
  status TEXT DEFAULT 'parsed',
  last_parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. USER_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'dark', -- 'dark' | 'light' | 'system'
  safe_search BOOLEAN DEFAULT TRUE,
  results_per_page INT DEFAULT 10,
  enable_history BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public read access to indexed pages & analytics
ALTER TABLE public.indexed_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public indexed_pages read" ON public.indexed_pages FOR SELECT USING (true);
CREATE POLICY "Public search_analytics insert" ON public.search_analytics FOR INSERT WITH CHECK (true);

-- User-specific policies
CREATE POLICY "Users can manage own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved_results" ON public.saved_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own search_history" ON public.search_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- TRIGGER FOR AUTOMATIC PROFILE CREATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
