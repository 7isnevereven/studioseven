-- ==============================================================================
-- STUDIOSEVEN: News & Projects Database Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. NEWS TABLE
CREATE TABLE IF NOT EXISTS public.news (
  id TEXT PRIMARY KEY,
  headline TEXT NOT NULL,
  preview TEXT DEFAULT '',
  body TEXT NOT NULL,
  date TEXT NOT NULL,
  project_id TEXT,
  url TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  released_at TEXT,
  release_label TEXT,
  artist_id TEXT,
  cover_file TEXT,
  accent_color TEXT DEFAULT '#38bdf8',
  accent_soft TEXT DEFAULT '#0284c7',
  spotify_url TEXT,
  youtube_url TEXT,
  lead_track TEXT,
  tracks JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'project',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure description and showcase columns exist if table was already created
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS showcase_order INTEGER DEFAULT 999;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS showcase_label TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS scheduled_at TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS credits JSONB;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS scheduled_at TEXT;

-- 3. ARTISTS TABLE
CREATE TABLE IF NOT EXISTS public.artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  bio TEXT DEFAULT '',
  spotify_url TEXT,
  youtube_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure optional columns exist if artists table was already created
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS spotify_url TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- 4. ENABLE ROW LEVEL SECURITY (RLS) FOR BULLETPROOF SECURITY
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES: Public can ONLY read (SELECT)
DROP POLICY IF EXISTS "Allow public read on news" ON public.news;
CREATE POLICY "Allow public read on news" 
  ON public.news FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow public read on projects" ON public.projects;
CREATE POLICY "Allow public read on projects" 
  ON public.projects FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow public read on artists" ON public.artists;
CREATE POLICY "Allow public read on artists" 
  ON public.artists FOR SELECT 
  USING (true);

-- 6. POLICIES: Authenticated admin has FULL CRUD access (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Allow authenticated admin on news" ON public.news;
CREATE POLICY "Allow authenticated admin on news" 
  ON public.news FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated admin on projects" ON public.projects;
CREATE POLICY "Allow authenticated admin on projects" 
  ON public.projects FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated admin on artists" ON public.artists;
CREATE POLICY "Allow authenticated admin on artists" 
  ON public.artists FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);
