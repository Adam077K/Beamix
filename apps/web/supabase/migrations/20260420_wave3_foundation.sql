-- ============================================================
-- Migration: 20260420_wave3_foundation.sql
-- Purpose:   Wave 3 foundation — 6 new tables required by
--            Batch 2-5 workers (Home DB wiring, Scans drilldown,
--            Inbox/Workspace, Competitors, Automation, Archive).
-- Applies after: 20260419_01_rebuild_wave2_rpcs.sql
-- Date: 2026-04-20
--
-- Tables created:
--   1. suggestions          — Home page proactive suggestions queue
--   2. automation_schedules — Per-user scheduled agent runs
--   3. competitors          — Tracked competitors per business
--   4. automation_settings  — Global kill switch + credit cap per user
--   5. content_versions     — Workspace edit history per content_item
--   6. citation_sources     — Citation source aggregates for Scan drilldown
--
-- IMPORTANT: LANGUAGE sql throughout. No plpgsql DECLARE vars inside $$.
-- Supabase SQL Editor splits on semicolons inside $$; local DECLARE vars
-- become table lookups and raise 42P01. Pure DDL is safe.
-- ============================================================


-- ============================================================
-- 1. suggestions
-- Home page proactive suggestions queue. Each row is a rule-
-- triggered suggestion for a business awaiting user action.
-- ============================================================

CREATE TABLE public.suggestions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  rule_id      text        NOT NULL,
  impact_score integer     CHECK (impact_score BETWEEN 0 AND 100),
  agent_type   text        NOT NULL,
  status       text        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'dismissed', 'accepted')),
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own suggestions" ON public.suggestions FOR ALL
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- Partial index: most queries filter on pending status
CREATE INDEX suggestions_business_status_idx
  ON public.suggestions (business_id, status)
  WHERE status = 'pending';


-- ============================================================
-- 2. automation_schedules
-- Per-user scheduled agent runs. Inngest cron reads
-- next_run_at WHERE is_paused = false to queue jobs.
-- ============================================================

CREATE TABLE public.automation_schedules (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id  uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  agent_type   text        NOT NULL,
  cadence      text        NOT NULL CHECK (cadence IN ('daily', 'weekly', 'monthly')),
  next_run_at  timestamptz,
  last_run_at  timestamptz,
  is_paused    boolean     DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.automation_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own schedules" ON public.automation_schedules FOR ALL
  USING (user_id = auth.uid());

-- Partial index: Inngest cron scans for upcoming non-paused runs
CREATE INDEX automation_schedules_next_run_idx
  ON public.automation_schedules (next_run_at)
  WHERE is_paused = false;


-- ============================================================
-- 3. competitors
-- Tracked competitors per business. user_id included so the
-- get_competitors_summary RPC (already live from Wave 2) can
-- filter on c.user_id = p_user_id without a join.
-- ============================================================

CREATE TABLE public.competitors (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text        NOT NULL,
  domain       text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own competitors" ON public.competitors FOR ALL
  USING (user_id = auth.uid());

-- Standard lookup index for RPC joins on business_id
CREATE INDEX competitors_business_idx
  ON public.competitors (business_id);


-- ============================================================
-- 4. automation_settings
-- Global kill switch and credit cap per user. One row per user
-- (enforced by UNIQUE constraint on user_id).
-- ============================================================

CREATE TABLE public.automation_settings (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  automation_paused  boolean     DEFAULT false,
  credit_cap         integer,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own automation settings" ON public.automation_settings FOR ALL
  USING (user_id = auth.uid());

-- No extra index needed: all access is via user_id UNIQUE lookup.


-- ============================================================
-- 5. content_versions
-- Workspace edit history. Each edit appends a new version row.
-- version_number is monotonically increasing per content_item.
-- UNIQUE (content_item_id, version_number) prevents duplicates.
-- ============================================================

CREATE TABLE public.content_versions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id  uuid        NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  version_number   integer     NOT NULL,
  content_body     text        NOT NULL,
  edited_by        uuid        REFERENCES auth.users(id),
  change_summary   text,
  created_at       timestamptz DEFAULT now(),
  UNIQUE (content_item_id, version_number)
);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own content versions" ON public.content_versions FOR ALL
  USING (
    content_item_id IN (SELECT id FROM public.content_items WHERE user_id = auth.uid())
  );

-- DESC on version_number so "latest version" queries skip a sort
CREATE INDEX content_versions_item_version_idx
  ON public.content_versions (content_item_id, version_number DESC);


-- ============================================================
-- 6. citation_sources
-- Aggregated citation source tracking per business.
-- Populated/updated by the scan pipeline; used by Scans drilldown.
-- UNIQUE (business_id, source_domain) enables upsert-on-conflict.
-- ============================================================

CREATE TABLE public.citation_sources (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  source_domain  text        NOT NULL,
  mention_count  integer     DEFAULT 0,
  engines        text[]      DEFAULT '{}',
  updated_at     timestamptz DEFAULT now(),
  UNIQUE (business_id, source_domain)
);

ALTER TABLE public.citation_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own citation sources" ON public.citation_sources FOR ALL
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- Descending mention_count so top-sources queries avoid full sort
CREATE INDEX citation_sources_business_idx
  ON public.citation_sources (business_id, mention_count DESC);
