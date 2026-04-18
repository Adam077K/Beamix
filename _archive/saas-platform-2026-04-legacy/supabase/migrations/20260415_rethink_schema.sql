-- ============================================================
-- Migration: 20260415_rethink_schema.sql
-- Purpose: Complete DB schema for the 2026-04-15 product rethink.
--          New tables, ALTER existing tables, new indexes, RLS, RPCs.
-- Board decisions: docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md
-- Rollback: see bottom of file for DROP statements.
-- ALL operations are additive (ADD COLUMN, CREATE TABLE). No drops.
-- ============================================================


-- ============================================================
-- PART A: New enum values for the rethink agent roster
-- ALTER TYPE ... ADD VALUE cannot run inside transactions.
-- ============================================================
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'query_mapper';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'content_optimizer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'freshness_agent';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'faq_builder';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'schema_generator';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'offsite_presence_builder';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'review_presence_planner';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'entity_builder';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'authority_blog_strategist';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'performance_tracker';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'reddit_presence_planner';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'video_seo_agent';


-- ============================================================
-- PART B: New tables
-- ============================================================


-- B1: suggestions
-- Scan-triggered action proposals shown on Home page suggestions queue.
-- Created by rules engine after each scan. User accepts/dismisses.
-- Row growth: ~10-20 per scan per business, pruned after 14 days.
CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id uuid REFERENCES public.scans(id) ON DELETE SET NULL,
  agent_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  impact text NOT NULL DEFAULT 'medium' CHECK (impact IN ('high', 'medium', 'low')),
  estimated_runs integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'expired', 'running', 'completed')),
  trigger_rule text,
  evidence jsonb DEFAULT '{}',
  target_query_ids uuid[] DEFAULT '{}',
  target_url text,
  accepted_at timestamptz,
  expires_at timestamptz DEFAULT (NOW() + INTERVAL '14 days'),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suggestions_user_status ON public.suggestions(user_id, status, created_at DESC)
  WHERE status IN ('pending', 'accepted', 'running');
CREATE INDEX idx_suggestions_biz_created ON public.suggestions(business_id, created_at DESC);
CREATE INDEX idx_suggestions_scan ON public.suggestions(scan_id) WHERE scan_id IS NOT NULL;

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions" ON public.suggestions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own suggestions" ON public.suggestions
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Service role manages suggestions" ON public.suggestions
  FOR ALL USING (true);


-- B2: query_runs
-- Per-refresh output from Query Mapper agent. Stores the full query set
-- generated for a business on a given run. Linked to agent_job.
-- Row growth: 1 per Query Mapper run per business.
CREATE TABLE IF NOT EXISTS public.query_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_job_id uuid REFERENCES public.agent_jobs(id) ON DELETE SET NULL,
  query_count integer NOT NULL DEFAULT 0,
  run_metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_query_runs_biz ON public.query_runs(business_id, created_at DESC);

ALTER TABLE public.query_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own query runs" ON public.query_runs
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role manages query runs" ON public.query_runs
  FOR ALL USING (true);


-- B3: query_clusters
-- Groupings of queries by topic/intent. FAQ Builder and Blog Strategist
-- consume these clusters to produce targeted content.
-- Row growth: ~5-15 clusters per query run.
CREATE TABLE IF NOT EXISTS public.query_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  query_run_id uuid NOT NULL REFERENCES public.query_runs(id) ON DELETE CASCADE,
  cluster_name text NOT NULL,
  cluster_intent text CHECK (cluster_intent IN ('informational', 'comparison', 'recommendation', 'review', 'navigational')),
  query_ids uuid[] NOT NULL DEFAULT '{}',
  priority_score integer DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  ymyl_flag boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_query_clusters_biz ON public.query_clusters(business_id, priority_score DESC);
CREATE INDEX idx_query_clusters_run ON public.query_clusters(query_run_id);

ALTER TABLE public.query_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own query clusters" ON public.query_clusters
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
CREATE POLICY "Service role manages query clusters" ON public.query_clusters
  FOR ALL USING (true);


-- B4: query_positions
-- Per-engine, per-query, per-scan rank tracking. The core trend data
-- for the Scans page timeline and Performance Tracker diffs.
-- Row growth: HIGH. ~(queries x engines x scans). Retention policy needed.
CREATE TABLE IF NOT EXISTS public.query_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  tracked_query_id uuid NOT NULL REFERENCES public.tracked_queries(id) ON DELETE CASCADE,
  engine text NOT NULL,
  is_mentioned boolean NOT NULL DEFAULT false,
  rank_position integer,
  snippet text,
  brands_mentioned jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qpos_biz_query_engine ON public.query_positions(business_id, tracked_query_id, engine, created_at DESC);
CREATE INDEX idx_qpos_scan ON public.query_positions(scan_id);
CREATE INDEX idx_qpos_query_date ON public.query_positions(tracked_query_id, created_at DESC);

ALTER TABLE public.query_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own query positions" ON public.query_positions
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
CREATE POLICY "Service role manages query positions" ON public.query_positions
  FOR ALL USING (true);


-- B5: submission_packages
-- Off-site agent outputs: directories to submit to, review templates,
-- entity checklists. User marks each item done; next scan verifies.
-- Used by: Off-Site Presence Builder, Review Presence Planner, Entity Builder.
CREATE TABLE IF NOT EXISTS public.submission_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_item_id uuid REFERENCES public.content_items(id) ON DELETE SET NULL,
  agent_job_id uuid REFERENCES public.agent_jobs(id) ON DELETE SET NULL,
  agent_type text NOT NULL,
  platform_name text NOT NULL,
  platform_url text,
  submission_type text NOT NULL CHECK (submission_type IN ('directory', 'review_platform', 'knowledge_graph', 'community')),
  instructions text NOT NULL,
  template_content text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'failed', 'skipped')),
  submitted_at timestamptz,
  verified_at timestamptz,
  verification_scan_id uuid REFERENCES public.scans(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subpkg_user_status ON public.submission_packages(user_id, status)
  WHERE status IN ('pending', 'submitted');
CREATE INDEX idx_subpkg_biz ON public.submission_packages(business_id);

ALTER TABLE public.submission_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own submission packages" ON public.submission_packages
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Service role manages submission packages" ON public.submission_packages
  FOR ALL USING (true);


-- B6: automation_configs
-- Per-user, per-agent schedule settings. Drives the Automation page.
-- Inngest cron dispatcher reads these to enqueue jobs.
CREATE TABLE IF NOT EXISTS public.automation_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  agent_type text NOT NULL,
  cadence text NOT NULL DEFAULT 'weekly' CHECK (cadence IN ('daily', 'weekly', 'monthly', 'off')),
  is_active boolean NOT NULL DEFAULT true,
  next_run_at timestamptz,
  last_run_at timestamptz,
  paused_at timestamptz,
  max_runs_per_month integer DEFAULT 10,
  runs_this_month integer NOT NULL DEFAULT 0,
  config jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, business_id, agent_type)
);

CREATE INDEX idx_auto_cfg_due ON public.automation_configs(next_run_at)
  WHERE is_active = true AND paused_at IS NULL AND next_run_at IS NOT NULL;
CREATE INDEX idx_auto_cfg_user ON public.automation_configs(user_id, business_id);

ALTER TABLE public.automation_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own automation configs" ON public.automation_configs
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Service role manages automation configs" ON public.automation_configs
  FOR ALL USING (true);

CREATE TRIGGER set_automation_configs_updated_at
  BEFORE UPDATE ON public.automation_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- B7: page_locks
-- Prevents two agents from editing the same URL simultaneously.
-- Used by: Content Optimizer, Freshness Agent, Blog Strategist.
-- Short-lived rows; auto-expire after 30 minutes.
CREATE TABLE IF NOT EXISTS public.page_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  page_url text NOT NULL,
  agent_job_id uuid NOT NULL REFERENCES public.agent_jobs(id) ON DELETE CASCADE,
  agent_type text NOT NULL,
  locked_at timestamptz NOT NULL DEFAULT NOW(),
  expires_at timestamptz NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  UNIQUE(business_id, page_url)
);

CREATE INDEX idx_page_locks_expires ON public.page_locks(expires_at);

ALTER TABLE public.page_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own page locks" ON public.page_locks
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
CREATE POLICY "Service role manages page locks" ON public.page_locks
  FOR ALL USING (true);


-- B8: topic_ledger
-- Prevents duplicate blog/FAQ topics within 90 days.
-- Used by: Authority Blog Strategist, FAQ Builder.
CREATE TABLE IF NOT EXISTS public.topic_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  topic_hash text NOT NULL,
  topic_title text NOT NULL,
  agent_type text NOT NULL,
  content_item_id uuid REFERENCES public.content_items(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  expires_at timestamptz NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  UNIQUE(business_id, topic_hash)
);

CREATE INDEX idx_topic_ledger_biz ON public.topic_ledger(business_id, expires_at DESC);

ALTER TABLE public.topic_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own topic ledger" ON public.topic_ledger
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
CREATE POLICY "Service role manages topic ledger" ON public.topic_ledger
  FOR ALL USING (true);


-- B9: performance_reports
-- Weekly Performance Tracker agent outputs. Aggregated scan comparison.
-- Row growth: ~1 per week per business.
CREATE TABLE IF NOT EXISTS public.performance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_job_id uuid REFERENCES public.agent_jobs(id) ON DELETE SET NULL,
  scan_before_id uuid REFERENCES public.scans(id) ON DELETE SET NULL,
  scan_after_id uuid REFERENCES public.scans(id) ON DELETE SET NULL,
  score_before integer,
  score_after integer,
  score_delta integer,
  engine_deltas jsonb DEFAULT '{}',
  query_deltas jsonb DEFAULT '[]',
  actions_measured jsonb DEFAULT '[]',
  summary_text text,
  report_period_start date NOT NULL,
  report_period_end date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_perf_reports_biz ON public.performance_reports(business_id, created_at DESC);

ALTER TABLE public.performance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance reports" ON public.performance_reports
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role manages performance reports" ON public.performance_reports
  FOR ALL USING (true);


-- B10: inbox_item_edits
-- Inline chat edits on Inbox items (Freshness Agent cursor-style editor).
-- Stores each edit round: user prompt + Haiku rewrite.
CREATE TABLE IF NOT EXISTS public.inbox_item_edits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edit_type text NOT NULL DEFAULT 'inline_chat' CHECK (edit_type IN ('inline_chat', 'full_rewrite', 'manual')),
  selected_text text,
  user_prompt text,
  ai_response text,
  accepted boolean,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inbox_edits_item ON public.inbox_item_edits(content_item_id, created_at DESC);

ALTER TABLE public.inbox_item_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own inbox edits" ON public.inbox_item_edits
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Service role manages inbox edits" ON public.inbox_item_edits
  FOR ALL USING (true);


-- ============================================================
-- PART C: ALTER existing tables
-- All changes are additive (ADD COLUMN with defaults or nullable).
-- ============================================================


-- C1: content_items — Inbox state machine + rethink fields
DO $$ BEGIN
  -- State for Inbox flow: draft -> review -> approved -> rejected -> published -> archived
  -- Existing 'status' column already has draft/in_review/approved/published/archived.
  -- Add 'rejected' to the CHECK if it uses enum; otherwise handled by existing CHECK.
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS reviewed_by uuid;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS user_edited_content text;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS workflow_run_id uuid;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS suggestion_id uuid;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS evidence jsonb DEFAULT '{}';
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS trigger_reason text;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS target_queries uuid[] DEFAULT '{}';
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS estimated_impact text DEFAULT 'medium';
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS archived_at timestamptz;
  ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS published_verified_at timestamptz;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add 'rejected' to content_item_status enum if it exists
ALTER TYPE content_item_status ADD VALUE IF NOT EXISTS 'rejected';

-- Index for Inbox list query (most frequent page)
CREATE INDEX IF NOT EXISTS idx_content_items_inbox
  ON public.content_items(user_id, status, created_at DESC)
  WHERE status IN ('draft', 'in_review');


-- C2: agent_jobs — trigger source and suggestion link
DO $$ BEGIN
  ALTER TABLE public.agent_jobs ADD COLUMN IF NOT EXISTS trigger_source text DEFAULT 'manual'
    CHECK (trigger_source IN ('manual', 'suggestion', 'automation', 'scan'));
  ALTER TABLE public.agent_jobs ADD COLUMN IF NOT EXISTS suggestion_id uuid;
  ALTER TABLE public.agent_jobs ADD COLUMN IF NOT EXISTS target_query_ids uuid[] DEFAULT '{}';
  ALTER TABLE public.agent_jobs ADD COLUMN IF NOT EXISTS credits_cost integer DEFAULT 1;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Update agent_type CHECK if it exists as inline CHECK (not enum)
-- The reconciliation migration already added enum values; we added more in PART A.


-- C3: scan_engine_results — brands_mentioned for share-of-voice
DO $$ BEGIN
  ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS brands_mentioned jsonb DEFAULT '[]';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- C4: user_profiles — global automation kill switch
DO $$ BEGIN
  ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS automation_paused_at timestamptz;
  ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_preview boolean NOT NULL DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- C5: subscriptions — autonomous credit cap percentage
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS autonomous_cap_pct integer NOT NULL DEFAULT 80
    CHECK (autonomous_cap_pct >= 0 AND autonomous_cap_pct <= 100);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- C6: tracked_queries — link to query_run, opportunity score
DO $$ BEGIN
  ALTER TABLE public.tracked_queries ADD COLUMN IF NOT EXISTS query_run_id uuid;
  ALTER TABLE public.tracked_queries ADD COLUMN IF NOT EXISTS opportunity_score integer DEFAULT 50;
  ALTER TABLE public.tracked_queries ADD COLUMN IF NOT EXISTS competitor_presence jsonb DEFAULT '{}';
  ALTER TABLE public.tracked_queries ADD COLUMN IF NOT EXISTS engines_visible text[] DEFAULT '{}';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- C7: agent_workflows — add cadence scheduling fields
DO $$ BEGIN
  ALTER TABLE public.agent_workflows ADD COLUMN IF NOT EXISTS cadence text DEFAULT 'weekly';
  ALTER TABLE public.agent_workflows ADD COLUMN IF NOT EXISTS next_run_at timestamptz;
  ALTER TABLE public.agent_workflows ADD COLUMN IF NOT EXISTS paused_at timestamptz;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- C8: plans — update for new tier names and credit allocations
-- We INSERT new plan rows; old ones remain for historical subscriptions.
INSERT INTO public.plans (id, name, tier, monthly_agent_uses, max_tracked_queries, max_competitors, max_businesses, scan_frequency_days, engines, features, is_active)
VALUES
  ('discover', 'Discover', 'starter', 25, 25, 3, 1, 7,
   ARRAY['chatgpt', 'gemini', 'perplexity'],
   '{"blog_strategist": false, "automation": false, "bulk_approve": false, "competitors_page": false, "max_schedules": 0}'::jsonb,
   true),
  ('build', 'Build', 'pro', 90, 50, 5, 3, 1,
   ARRAY['chatgpt', 'gemini', 'perplexity', 'claude', 'google_ai_overviews', 'grok', 'you_com'],
   '{"blog_strategist": true, "automation": true, "bulk_approve": false, "competitors_page": true, "max_schedules": 3}'::jsonb,
   true),
  ('scale', 'Scale', 'business', 250, 100, 10, 10, 1,
   ARRAY['chatgpt', 'gemini', 'perplexity', 'claude', 'google_ai_overviews', 'grok', 'you_com'],
   '{"blog_strategist": true, "automation": true, "bulk_approve": true, "competitors_page": true, "max_schedules": -1, "blog_cap": 40}'::jsonb,
   true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_agent_uses = EXCLUDED.monthly_agent_uses,
  max_tracked_queries = EXCLUDED.max_tracked_queries,
  max_competitors = EXCLUDED.max_competitors,
  max_businesses = EXCLUDED.max_businesses,
  scan_frequency_days = EXCLUDED.scan_frequency_days,
  engines = EXCLUDED.engines,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

-- Deactivate old plan rows (keep for historical FK references)
UPDATE public.plans SET is_active = false WHERE id IN ('starter', 'pro', 'business');


-- C9: free_scans — competitor URLs from pre-scan form
DO $$ BEGIN
  ALTER TABLE public.free_scans ADD COLUMN IF NOT EXISTS competitor_urls text[] DEFAULT '{}';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- C10: businesses — YMYL flag from onboarding
DO $$ BEGIN
  ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS ymyl_category boolean NOT NULL DEFAULT false;
  ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS competitors_auto_detected text[] DEFAULT '{}';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ============================================================
-- PART D: RPCs (performance-critical queries)
-- ============================================================


-- D1: get_inbox_items — Inbox page primary query
CREATE OR REPLACE FUNCTION public.get_inbox_items(
  p_user_id uuid,
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
) RETURNS TABLE(
  id uuid,
  title text,
  agent_type text,
  status text,
  trigger_reason text,
  target_queries uuid[],
  estimated_impact text,
  evidence jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ci.id, ci.title, ci.agent_type, ci.status,
         ci.trigger_reason, ci.target_queries, ci.estimated_impact,
         ci.evidence, ci.created_at, ci.updated_at
  FROM content_items ci
  WHERE ci.user_id = p_user_id
    AND (p_status IS NULL OR ci.status = p_status)
    AND ci.status IN ('draft', 'in_review', 'approved', 'rejected')
  ORDER BY ci.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;


-- D2: get_due_automations — Inngest dispatcher reads this every 15 min
CREATE OR REPLACE FUNCTION public.get_due_automations(
  p_limit integer DEFAULT 100
) RETURNS TABLE(
  id uuid,
  user_id uuid,
  business_id uuid,
  agent_type text,
  cadence text,
  config jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ac.id, ac.user_id, ac.business_id, ac.agent_type, ac.cadence, ac.config
  FROM automation_configs ac
  JOIN user_profiles up ON up.user_id = ac.user_id
  WHERE ac.is_active = true
    AND ac.paused_at IS NULL
    AND ac.next_run_at <= NOW()
    AND up.automation_paused_at IS NULL
  ORDER BY ac.next_run_at ASC
  LIMIT p_limit;
$$;


-- D3: get_query_trend — Scans page per-query position over time
CREATE OR REPLACE FUNCTION public.get_query_trend(
  p_business_id uuid,
  p_tracked_query_id uuid,
  p_engine text DEFAULT NULL,
  p_days integer DEFAULT 56
) RETURNS TABLE(
  scan_id uuid,
  engine text,
  is_mentioned boolean,
  rank_position integer,
  brands_mentioned jsonb,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT qp.scan_id, qp.engine, qp.is_mentioned, qp.rank_position,
         qp.brands_mentioned, qp.created_at
  FROM query_positions qp
  WHERE qp.business_id = p_business_id
    AND qp.tracked_query_id = p_tracked_query_id
    AND (p_engine IS NULL OR qp.engine = p_engine)
    AND qp.created_at >= NOW() - (p_days || ' days')::interval
  ORDER BY qp.created_at ASC;
$$;


-- D4: get_home_summary — Home page data in one call
CREATE OR REPLACE FUNCTION public.get_home_summary(
  p_user_id uuid,
  p_business_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_latest_scan RECORD;
  v_prev_scan RECORD;
  v_suggestions jsonb;
  v_inbox_preview jsonb;
  v_score integer;
  v_prev_score integer;
BEGIN
  -- Latest scan score
  SELECT id, overall_score, scanned_at INTO v_latest_scan
  FROM scans
  WHERE business_id = p_business_id AND status = 'completed'
  ORDER BY scanned_at DESC LIMIT 1;

  v_score := COALESCE(v_latest_scan.overall_score, 0);

  -- Previous scan for delta
  SELECT overall_score INTO v_prev_score
  FROM scans
  WHERE business_id = p_business_id AND status = 'completed'
    AND id != v_latest_scan.id
  ORDER BY scanned_at DESC LIMIT 1;

  -- Top 3 pending suggestions
  SELECT COALESCE(jsonb_agg(row_to_json(s)::jsonb), '[]'::jsonb)
  INTO v_suggestions
  FROM (
    SELECT id, title, description, agent_type, impact, estimated_runs
    FROM suggestions
    WHERE user_id = p_user_id AND business_id = p_business_id
      AND status = 'pending'
    ORDER BY
      CASE impact WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
      created_at DESC
    LIMIT 3
  ) s;

  -- Last 3 inbox items
  SELECT COALESCE(jsonb_agg(row_to_json(i)::jsonb), '[]'::jsonb)
  INTO v_inbox_preview
  FROM (
    SELECT id, title, agent_type, status, created_at
    FROM content_items
    WHERE user_id = p_user_id AND business_id = p_business_id
      AND status IN ('draft', 'in_review')
    ORDER BY created_at DESC
    LIMIT 3
  ) i;

  RETURN jsonb_build_object(
    'score', v_score,
    'score_delta', v_score - COALESCE(v_prev_score, v_score),
    'latest_scan_at', v_latest_scan.scanned_at,
    'suggestions', v_suggestions,
    'inbox_preview', v_inbox_preview
  );
END;
$$;


-- D5: acquire_page_lock — atomic lock acquisition for agents
CREATE OR REPLACE FUNCTION public.acquire_page_lock(
  p_business_id uuid,
  p_page_url text,
  p_agent_job_id uuid,
  p_agent_type text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clean expired locks first
  DELETE FROM page_locks WHERE expires_at < NOW();

  -- Try to insert lock
  INSERT INTO page_locks (business_id, page_url, agent_job_id, agent_type)
  VALUES (p_business_id, p_page_url, p_agent_job_id, p_agent_type);

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'page_locked',
      'locked_by', (SELECT agent_type FROM page_locks WHERE business_id = p_business_id AND page_url = p_page_url)
    );
END;
$$;


-- D6: release_page_lock
CREATE OR REPLACE FUNCTION public.release_page_lock(
  p_agent_job_id uuid
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM page_locks WHERE agent_job_id = p_agent_job_id;
$$;


-- D7: check_topic_duplicate — topic ledger check for Blog/FAQ agents
CREATE OR REPLACE FUNCTION public.check_topic_duplicate(
  p_business_id uuid,
  p_topic_hash text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM topic_ledger
    WHERE business_id = p_business_id
      AND topic_hash = p_topic_hash
      AND expires_at > NOW()
  );
$$;


-- ============================================================
-- PART E: Cleanup helpers (retention)
-- ============================================================


-- E1: Expire old suggestions (run daily via Inngest cron)
CREATE OR REPLACE FUNCTION public.expire_old_suggestions()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH expired AS (
    UPDATE suggestions
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at < NOW()
    RETURNING id
  )
  SELECT count(*)::integer FROM expired;
$$;


-- E2: Clean expired page locks (called by acquire_page_lock too)
CREATE OR REPLACE FUNCTION public.clean_expired_locks()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cleaned AS (
    DELETE FROM page_locks WHERE expires_at < NOW()
    RETURNING id
  )
  SELECT count(*)::integer FROM cleaned;
$$;


-- E3: Clean expired topic ledger entries
CREATE OR REPLACE FUNCTION public.clean_expired_topics()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cleaned AS (
    DELETE FROM topic_ledger WHERE expires_at < NOW()
    RETURNING id
  )
  SELECT count(*)::integer FROM cleaned;
$$;


-- ============================================================
-- ROLLBACK COMMANDS (for reference, do NOT run automatically)
-- ============================================================
-- DROP TABLE IF EXISTS public.inbox_item_edits;
-- DROP TABLE IF EXISTS public.performance_reports;
-- DROP TABLE IF EXISTS public.topic_ledger;
-- DROP TABLE IF EXISTS public.page_locks;
-- DROP TABLE IF EXISTS public.automation_configs;
-- DROP TABLE IF EXISTS public.submission_packages;
-- DROP TABLE IF EXISTS public.query_positions;
-- DROP TABLE IF EXISTS public.query_clusters;
-- DROP TABLE IF EXISTS public.query_runs;
-- DROP TABLE IF EXISTS public.suggestions;
-- DROP FUNCTION IF EXISTS public.get_inbox_items;
-- DROP FUNCTION IF EXISTS public.get_due_automations;
-- DROP FUNCTION IF EXISTS public.get_query_trend;
-- DROP FUNCTION IF EXISTS public.get_home_summary;
-- DROP FUNCTION IF EXISTS public.acquire_page_lock;
-- DROP FUNCTION IF EXISTS public.release_page_lock;
-- DROP FUNCTION IF EXISTS public.check_topic_duplicate;
-- DROP FUNCTION IF EXISTS public.expire_old_suggestions;
-- DROP FUNCTION IF EXISTS public.clean_expired_locks;
-- DROP FUNCTION IF EXISTS public.clean_expired_topics;
-- ALTER TABLE content_items DROP COLUMN IF EXISTS reviewed_at, DROP COLUMN IF EXISTS reviewed_by, ...;
-- (enum values cannot be removed in PostgreSQL without recreating the type)
