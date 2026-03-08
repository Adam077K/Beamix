-- ============================================================
-- Migration 005: Intelligence Tables
-- Tables: competitors, competitor_scans, recommendations, tracked_queries,
--         prompt_library, prompt_volumes, personas, brand_narratives,
--         competitor_share_of_voice, crawler_detections, ai_readiness_history
-- ============================================================

-- ============================================================
-- competitors
-- ============================================================
CREATE TABLE IF NOT EXISTS public.competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain text,
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'auto_detected')),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.competitors ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
  ALTER TABLE public.competitors ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_competitors_biz ON public.competitors(business_id) WHERE is_active = true;

ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own competitors" ON public.competitors;
CREATE POLICY "Users can manage own competitors" ON public.competitors
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- competitor_scans (replaces competitor_scan_results if it exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.competitor_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  competitor_id uuid NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  engine text NOT NULL,
  is_mentioned boolean NOT NULL DEFAULT false,
  rank_position integer,
  sentiment_score integer CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
  mention_context text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(competitor_id, scan_id)
);

CREATE INDEX IF NOT EXISTS idx_comp_scans_scan ON public.competitor_scans(scan_id);
CREATE INDEX IF NOT EXISTS idx_comp_scans_competitor ON public.competitor_scans(competitor_id, created_at DESC);

ALTER TABLE public.competitor_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own competitor scans" ON public.competitor_scans;
CREATE POLICY "Users can view own competitor scans" ON public.competitor_scans
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages competitor scans" ON public.competitor_scans;
CREATE POLICY "Service role manages competitor scans" ON public.competitor_scans
  FOR ALL USING (true);

-- ============================================================
-- recommendations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id uuid REFERENCES public.scans(id),
  title text NOT NULL,
  description text NOT NULL,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('content', 'technical', 'outreach', 'optimization')),
  impact text NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
  effort text NOT NULL CHECK (effort IN ('high', 'medium', 'low')),
  suggested_agent text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'dismissed')),
  evidence text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.recommendations ADD COLUMN IF NOT EXISTS recommendation_type text DEFAULT 'content';
  ALTER TABLE public.recommendations ADD COLUMN IF NOT EXISTS impact text DEFAULT 'medium';
  ALTER TABLE public.recommendations ADD COLUMN IF NOT EXISTS effort text DEFAULT 'medium';
  ALTER TABLE public.recommendations ADD COLUMN IF NOT EXISTS evidence text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_recs_biz_status ON public.recommendations(business_id, status) WHERE status IN ('new', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_recs_biz_created ON public.recommendations(business_id, created_at DESC);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recommendations" ON public.recommendations;
CREATE POLICY "Users can view own recommendations" ON public.recommendations
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update recommendation status" ON public.recommendations;
CREATE POLICY "Users can update recommendation status" ON public.recommendations
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages recommendations" ON public.recommendations;
CREATE POLICY "Service role manages recommendations" ON public.recommendations
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- tracked_queries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tracked_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  category text CHECK (category IN ('recommendation', 'comparison', 'specific', 'review', 'authority')),
  is_active boolean DEFAULT true,
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'auto_suggested', 'imported')),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.tracked_queries ADD COLUMN IF NOT EXISTS category text;
  ALTER TABLE public.tracked_queries ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
  ALTER TABLE public.tracked_queries ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_tracked_queries_biz ON public.tracked_queries(business_id) WHERE is_active = true;

ALTER TABLE public.tracked_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own queries" ON public.tracked_queries;
CREATE POLICY "Users can manage own queries" ON public.tracked_queries
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- prompt_library (NEW — shared, read-only for users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prompt_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text NOT NULL,
  industry text NOT NULL,
  category text NOT NULL CHECK (category IN ('recommendation', 'comparison', 'specific', 'review', 'authority')),
  language text NOT NULL DEFAULT 'en',
  location_template boolean DEFAULT false,
  estimated_volume integer DEFAULT 0,
  trending_direction text DEFAULT 'stable' CHECK (trending_direction IN ('rising', 'stable', 'declining')),
  sample_size integer DEFAULT 0,
  last_volume_update timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_lib_industry ON public.prompt_library(industry, category);
CREATE INDEX IF NOT EXISTS idx_prompt_lib_volume ON public.prompt_library(industry, estimated_volume DESC);

ALTER TABLE public.prompt_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read prompts" ON public.prompt_library;
CREATE POLICY "Authenticated users can read prompts" ON public.prompt_library
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role manages prompts" ON public.prompt_library;
CREATE POLICY "Service role manages prompts" ON public.prompt_library
  FOR ALL USING (true);

-- ============================================================
-- prompt_volumes (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prompt_volumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_library_id uuid NOT NULL REFERENCES public.prompt_library(id) ON DELETE CASCADE,
  measurement_period date NOT NULL,
  scan_count integer NOT NULL DEFAULT 0,
  mention_rate numeric(5,4),
  avg_position numeric(4,1),
  competitor_density numeric(5,4),
  engine_coverage jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(prompt_library_id, measurement_period)
);

CREATE INDEX IF NOT EXISTS idx_prompt_vol_prompt_date ON public.prompt_volumes(prompt_library_id, measurement_period DESC);

ALTER TABLE public.prompt_volumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read volumes" ON public.prompt_volumes;
CREATE POLICY "Authenticated users can read volumes" ON public.prompt_volumes
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role manages volumes" ON public.prompt_volumes;
CREATE POLICY "Service role manages volumes" ON public.prompt_volumes
  FOR ALL USING (true);

-- ============================================================
-- personas (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  prompt_modifiers text[] DEFAULT '{}',
  journey_stage text CHECK (journey_stage IN ('awareness', 'consideration', 'decision')),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personas_biz ON public.personas(business_id);

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own personas" ON public.personas;
CREATE POLICY "Users can manage own personas" ON public.personas
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- brand_narratives (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brand_narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  narrative_summary text NOT NULL,
  key_themes jsonb NOT NULL,
  brand_positioning text,
  misperceptions jsonb DEFAULT '[]',
  narrative_score integer CHECK (narrative_score >= 0 AND narrative_score <= 100),
  compared_to_previous jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_narratives_biz ON public.brand_narratives(business_id, created_at DESC);

ALTER TABLE public.brand_narratives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own narratives" ON public.brand_narratives;
CREATE POLICY "Users can view own narratives" ON public.brand_narratives
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages narratives" ON public.brand_narratives;
CREATE POLICY "Service role manages narratives" ON public.brand_narratives
  FOR ALL USING (true);

-- ============================================================
-- competitor_share_of_voice (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.competitor_share_of_voice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  competitor_id uuid REFERENCES public.competitors(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  voice_share_pct numeric(5,2) NOT NULL,
  mention_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, competitor_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_sov_biz_week ON public.competitor_share_of_voice(business_id, week_start DESC);

ALTER TABLE public.competitor_share_of_voice ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own SoV" ON public.competitor_share_of_voice;
CREATE POLICY "Users can view own SoV" ON public.competitor_share_of_voice
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages SoV" ON public.competitor_share_of_voice;
CREATE POLICY "Service role manages SoV" ON public.competitor_share_of_voice
  FOR ALL USING (true);

-- ============================================================
-- crawler_detections (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crawler_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  crawler_name text NOT NULL,
  detected_at timestamptz NOT NULL,
  page_url text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crawler_biz_date ON public.crawler_detections(business_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawler_biz_name ON public.crawler_detections(business_id, crawler_name);

ALTER TABLE public.crawler_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own crawlers" ON public.crawler_detections;
CREATE POLICY "Users can view own crawlers" ON public.crawler_detections
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages crawlers" ON public.crawler_detections;
CREATE POLICY "Service role manages crawlers" ON public.crawler_detections
  FOR ALL USING (true);

-- ============================================================
-- ai_readiness_history (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_readiness_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  score_breakdown jsonb NOT NULL DEFAULT '{}',
  recorded_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, (recorded_at::date))
);

CREATE INDEX IF NOT EXISTS idx_readiness_biz_date ON public.ai_readiness_history(business_id, recorded_at DESC);

ALTER TABLE public.ai_readiness_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own readiness" ON public.ai_readiness_history;
CREATE POLICY "Users can view own readiness" ON public.ai_readiness_history
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages readiness" ON public.ai_readiness_history;
CREATE POLICY "Service role manages readiness" ON public.ai_readiness_history
  FOR ALL USING (true);
