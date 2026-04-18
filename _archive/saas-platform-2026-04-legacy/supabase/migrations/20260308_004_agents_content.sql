-- ============================================================
-- Migration 004: Agent & Content Tables
-- Tables: agent_jobs, agent_job_steps, content_items, content_versions,
--         content_performance, content_voice_profiles
-- ============================================================

-- ============================================================
-- agent_jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  agent_type text NOT NULL CHECK (agent_type IN (
    'content_writer', 'blog_writer', 'schema_optimizer', 'recommendations',
    'faq_agent', 'review_analyzer', 'social_strategy', 'competitor_intelligence',
    'citation_builder', 'llms_txt', 'ai_readiness', 'content_voice_trainer',
    'content_pattern_analyzer', 'content_refresh', 'brand_narrative_analyst'
  )),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_data jsonb NOT NULL DEFAULT '{}',
  output_data jsonb,
  qa_score numeric(3,2),
  error_message text,
  inngest_run_id text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  completed_at timestamptz
);

-- Add new columns, handle existing table gracefully
DO $$ BEGIN
  ALTER TABLE public.agent_jobs ADD COLUMN IF NOT EXISTS input_data jsonb DEFAULT '{}';
  ALTER TABLE public.agent_jobs ADD COLUMN IF NOT EXISTS output_data jsonb;
  ALTER TABLE public.agent_jobs ADD COLUMN IF NOT EXISTS qa_score numeric(3,2);
  ALTER TABLE public.agent_jobs ADD COLUMN IF NOT EXISTS inngest_run_id text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Remove columns that shouldn't exist
DO $$ BEGIN
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS title;
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS summary;
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS is_favorited;
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS output_type;
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS credits_cost;
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS llm_calls_count;
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS llm_cost_usd;
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS runtime_ms;
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS scan_id;
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS started_at;
  ALTER TABLE public.agent_jobs DROP COLUMN IF EXISTS input_params;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_agent_jobs_user_created ON public.agent_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_biz_type ON public.agent_jobs(business_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status ON public.agent_jobs(status) WHERE status IN ('pending', 'running');

ALTER TABLE public.agent_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own agent jobs" ON public.agent_jobs;
CREATE POLICY "Users can view own agent jobs" ON public.agent_jobs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages agent jobs" ON public.agent_jobs;
CREATE POLICY "Service role manages agent jobs" ON public.agent_jobs
  FOR ALL USING (true);

-- ============================================================
-- agent_job_steps (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_job_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_job_id uuid NOT NULL REFERENCES public.agent_jobs(id) ON DELETE CASCADE,
  step_name text NOT NULL,
  step_order integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  input_summary text,
  output_summary text,
  model_used text,
  tokens_used integer,
  duration_ms integer,
  started_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_job_steps_job ON public.agent_job_steps(agent_job_id, step_order);

ALTER TABLE public.agent_job_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own job steps" ON public.agent_job_steps;
CREATE POLICY "Users can view own job steps" ON public.agent_job_steps
  FOR SELECT USING (agent_job_id IN (SELECT id FROM agent_jobs WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages job steps" ON public.agent_job_steps;
CREATE POLICY "Service role manages job steps" ON public.agent_job_steps
  FOR ALL USING (true);

-- ============================================================
-- content_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  agent_job_id uuid REFERENCES public.agent_jobs(id),
  agent_type text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN (
    'article', 'blog_post', 'faq', 'social_post', 'schema_markup',
    'llms_txt', 'outreach_template', 'comparison', 'ranked_list',
    'location_page', 'case_study', 'product_deep_dive'
  )),
  title text NOT NULL,
  content_body text NOT NULL,
  meta_description text,
  content_format text NOT NULL DEFAULT 'markdown' CHECK (content_format IN ('markdown', 'html', 'json_ld', 'plain_text', 'structured_report')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
  language text DEFAULT 'en',
  word_count integer,
  tags text[] DEFAULT '{}',
  published_url text,
  published_at timestamptz,
  is_favorited boolean DEFAULT false,
  voice_profile_id uuid,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'article';
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS content_body text DEFAULT '';
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS meta_description text;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'markdown';
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS word_count integer;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS published_url text;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS published_at timestamptz;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS is_favorited boolean DEFAULT false;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS voice_profile_id uuid;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_content_items_user ON public.content_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_biz_type ON public.content_items(business_id, content_type);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON public.content_items(status) WHERE status = 'in_review';

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own content" ON public.content_items;
CREATE POLICY "Users can view own content" ON public.content_items
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own content" ON public.content_items;
CREATE POLICY "Users can update own content" ON public.content_items
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own content" ON public.content_items;
CREATE POLICY "Users can delete own content" ON public.content_items
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages content" ON public.content_items;
CREATE POLICY "Service role manages content" ON public.content_items
  FOR INSERT WITH CHECK (true);

CREATE TRIGGER set_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- content_versions (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content_body text NOT NULL,
  edited_by text NOT NULL DEFAULT 'user' CHECK (edited_by IN ('user', 'agent', 'system')),
  change_summary text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_versions_item ON public.content_versions(content_item_id, version_number DESC);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own content versions" ON public.content_versions;
CREATE POLICY "Users can view own content versions" ON public.content_versions
  FOR SELECT USING (content_item_id IN (SELECT id FROM content_items WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages content versions" ON public.content_versions;
CREATE POLICY "Service role manages content versions" ON public.content_versions
  FOR ALL USING (true);

-- ============================================================
-- content_performance (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  measurement_date date NOT NULL,
  visibility_score_before integer,
  visibility_score_after integer,
  score_delta integer,
  mention_count_before integer,
  mention_count_after integer,
  avg_position_before numeric(4,1),
  avg_position_after numeric(4,1),
  engines_mentioning text[],
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(content_item_id, scan_id)
);

CREATE INDEX IF NOT EXISTS idx_content_perf_item ON public.content_performance(content_item_id, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_content_perf_biz ON public.content_performance(business_id, measurement_date DESC);

ALTER TABLE public.content_performance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own content performance" ON public.content_performance;
CREATE POLICY "Users can view own content performance" ON public.content_performance
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages content performance" ON public.content_performance;
CREATE POLICY "Service role manages content performance" ON public.content_performance
  FOR ALL USING (true);

-- ============================================================
-- content_voice_profiles (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_voice_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  voice_description text NOT NULL,
  training_sources jsonb NOT NULL DEFAULT '[]',
  example_excerpts text[] NOT NULL DEFAULT '{}',
  vocabulary_patterns jsonb DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_profiles_biz ON public.content_voice_profiles(business_id);

ALTER TABLE public.content_voice_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own voice profiles" ON public.content_voice_profiles;
CREATE POLICY "Users can manage own voice profiles" ON public.content_voice_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER set_voice_profiles_updated_at
  BEFORE UPDATE ON public.content_voice_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
