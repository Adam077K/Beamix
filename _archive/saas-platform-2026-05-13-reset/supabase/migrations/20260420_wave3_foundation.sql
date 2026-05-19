-- ============================================================
-- Migration: 20260420_wave3_foundation.sql
-- Purpose:   Wave 3 foundation — create the 3 tables still
--            missing from public schema as of 2026-04-20.
--
-- Applies after: 20260419_01_rebuild_wave2_rpcs.sql
-- Date: 2026-04-20 (revised)
--
-- Schema-drift audit summary (discovered via MCP on 2026-04-20):
--
--   Tables ALREADY in DB — NOT created by this migration:
--     • suggestions         — exists with richer schema
--       (title, description, impact text, estimated_runs,
--        trigger_rule, evidence jsonb, target_query_ids[],
--        scan_id, user_id). Frontend uses actual columns.
--     • competitors         — exists with richer schema
--       (website_url, source, is_active, first_seen_score,
--        latest_score, domain).
--     • automation_configs  — the canonical schedules table
--       already in DB. Supersedes the "automation_schedules"
--       name used in prior planning docs. Has the features
--       W0 planned (is_active, next_run_at, paused_at,
--       max_runs_per_month, runs_this_month, config jsonb).
--
--   Tables created HERE:
--     1. automation_settings  — Global kill switch + credit cap per user
--     2. content_versions     — Workspace edit history per content_item
--     3. citation_sources     — Citation source aggregates (Scans drilldown)
--
-- IMPORTANT: LANGUAGE sql throughout. No plpgsql DECLARE vars
-- inside $$. Supabase SQL Editor splits on semicolons inside $$;
-- local DECLARE vars become table lookups and raise 42P01.
-- Pure DDL is safe.
-- ============================================================


-- ============================================================
-- 1. automation_settings
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
-- 2. content_versions
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
-- 3. citation_sources
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
