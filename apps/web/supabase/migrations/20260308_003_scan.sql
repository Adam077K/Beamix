-- ============================================================
-- Migration 003: Scan Tables
-- Tables: free_scans, scans, scan_engine_results, citation_sources
-- ============================================================

-- ============================================================
-- free_scans (no RLS — accessed by nanoid scan_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.free_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id text UNIQUE NOT NULL,
  business_name text NOT NULL,
  website_url text NOT NULL,
  industry text NOT NULL,
  location text,
  language text DEFAULT 'en',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  results_data jsonb,
  ip_address text,
  converted_user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  completed_at timestamptz
);

DO $$ BEGIN
  ALTER TABLE public.free_scans ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
  ALTER TABLE public.free_scans ADD COLUMN IF NOT EXISTS ip_address text;
  ALTER TABLE public.free_scans ADD COLUMN IF NOT EXISTS converted_user_id uuid;
  ALTER TABLE public.free_scans ADD COLUMN IF NOT EXISTS completed_at timestamptz;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_free_scans_ip_date ON public.free_scans(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_free_scans_status ON public.free_scans(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_free_scans_cleanup ON public.free_scans(created_at) WHERE converted_user_id IS NULL;

-- No RLS on free_scans — public access by scan_id

-- ============================================================
-- scans (authenticated scans)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_type text NOT NULL CHECK (scan_type IN ('scheduled', 'manual', 'import')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  engines_queried text[],
  prompts_used integer,
  results_summary jsonb,
  error_message text,
  scanned_at timestamptz NOT NULL DEFAULT NOW(),
  completed_at timestamptz
);

DO $$ BEGIN
  ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS scan_type text DEFAULT 'manual';
  ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS overall_score integer;
  ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS engines_queried text[];
  ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS prompts_used integer;
  ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS results_summary jsonb;
  ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS error_message text;
  ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS scanned_at timestamptz DEFAULT NOW();
  ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS completed_at timestamptz;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_scans_biz_date ON public.scans(business_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_user_date ON public.scans(user_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_status ON public.scans(status) WHERE status IN ('pending', 'processing');

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scans" ON public.scans;
CREATE POLICY "Users can view own scans" ON public.scans
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages scans" ON public.scans;
CREATE POLICY "Service role manages scans" ON public.scans
  FOR ALL USING (true);

-- ============================================================
-- scan_engine_results
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scan_engine_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  engine text NOT NULL,
  prompt_text text NOT NULL,
  prompt_category text CHECK (prompt_category IN ('recommendation', 'comparison', 'specific', 'review', 'authority')),
  is_mentioned boolean NOT NULL DEFAULT false,
  rank_position integer CHECK (rank_position >= 1),
  sentiment_score integer CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
  mention_context text,
  competitors_mentioned text[] DEFAULT '{}',
  citations jsonb DEFAULT '[]',
  prompt_library_id uuid,
  raw_response_hash text,
  tokens_used integer,
  latency_ms integer,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS prompt_text text DEFAULT '';
  ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS prompt_category text;
  ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS mention_context text;
  ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS competitors_mentioned text[] DEFAULT '{}';
  ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS citations jsonb DEFAULT '[]';
  ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS prompt_library_id uuid;
  ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS raw_response_hash text;
  ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS tokens_used integer;
  ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS latency_ms integer;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_engine_results_scan ON public.scan_engine_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_engine_results_biz_engine ON public.scan_engine_results(business_id, engine);
CREATE INDEX IF NOT EXISTS idx_engine_results_biz_date ON public.scan_engine_results(business_id, created_at DESC);

ALTER TABLE public.scan_engine_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scan results" ON public.scan_engine_results;
CREATE POLICY "Users can view own scan results" ON public.scan_engine_results
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages scan results" ON public.scan_engine_results;
CREATE POLICY "Service role manages scan results" ON public.scan_engine_results
  FOR ALL USING (true);

-- ============================================================
-- citation_sources
-- ============================================================
CREATE TABLE IF NOT EXISTS public.citation_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  source_domain text NOT NULL,
  source_title text,
  first_seen_at timestamptz NOT NULL DEFAULT NOW(),
  last_seen_at timestamptz NOT NULL DEFAULT NOW(),
  mention_count integer NOT NULL DEFAULT 1,
  engines text[] NOT NULL,
  sentiment_avg integer,
  is_own_domain boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, source_url)
);

CREATE INDEX IF NOT EXISTS idx_citation_sources_biz ON public.citation_sources(business_id, mention_count DESC);
CREATE INDEX IF NOT EXISTS idx_citation_sources_domain ON public.citation_sources(business_id, source_domain);

ALTER TABLE public.citation_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own citations" ON public.citation_sources;
CREATE POLICY "Users can view own citations" ON public.citation_sources
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages citations" ON public.citation_sources;
CREATE POLICY "Service role manages citations" ON public.citation_sources
  FOR ALL USING (true);
