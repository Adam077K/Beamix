-- cleanup/0002-drop-retired-agent-tables.sql
-- Author: supabase-cleaner agent, reviewed by Adam on 2026-04-19
-- Context: Nine tables that served retired pre-rethink agents or were never
--          adopted by the post-rethink product surface. Breakdown:
--
--   brand_narratives       — Brand Narrative agent (retired in rethink; Entity Builder replaces)
--   citation_sources       — Citation tracking agent (retired; no GEO successor)
--   content_voice_profiles — Content Voice / Blog Writer agent (retired)
--   ai_readiness_history   — AI Readiness Score agent (retired; Performance Tracker replaces)
--   content_performance    — Content Refresher agent legacy table (Freshness Agent uses content_items)
--   content_versions       — Content diff storage for retired Content Refresher
--   scan_mentions          — Deprecated scan sub-result table (scan_engine_results is canonical)
--   scan_queries           — Deprecated scan sub-result table (query_runs is canonical after rethink)
--   agent_job_steps        — Step-level agent execution log for retired multi-step agent runner
--
-- Risk: LOW — 8 of 9 tables are empty. ai_readiness_history has 1 dev-era row.
-- Rollback: Archive tables in _archive schema retained for 90 days.

-- ============================================================
-- STEP 1 — PRE-FLIGHT (run first, inspect the counts, confirm intent)
-- ============================================================
SELECT
  (SELECT COUNT(*) FROM public.brand_narratives)       AS brand_narratives_rows,
  (SELECT COUNT(*) FROM public.citation_sources)       AS citation_sources_rows,
  (SELECT COUNT(*) FROM public.content_voice_profiles) AS content_voice_profiles_rows,
  (SELECT COUNT(*) FROM public.ai_readiness_history)   AS ai_readiness_history_rows,
  (SELECT COUNT(*) FROM public.content_performance)    AS content_performance_rows,
  (SELECT COUNT(*) FROM public.content_versions)       AS content_versions_rows,
  (SELECT COUNT(*) FROM public.scan_mentions)          AS scan_mentions_rows,
  (SELECT COUNT(*) FROM public.scan_queries)           AS scan_queries_rows,
  (SELECT COUNT(*) FROM public.agent_job_steps)        AS agent_job_steps_rows;
-- Expected: 0 / 0 / 0 / 1 / 0 / 0 / 0 / 0 / 0 (verified 2026-04-19)
-- The 1 row in ai_readiness_history is a dev-era test record — no real user data.

-- ============================================================
-- STEP 2 — ARCHIVE (safe, additive)
-- Run after STEP 1 confirms counts are as expected.
-- ============================================================

-- Create _archive schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS _archive;

CREATE TABLE IF NOT EXISTS _archive.brand_narratives_2026_04_19
  AS SELECT * FROM public.brand_narratives;

CREATE TABLE IF NOT EXISTS _archive.citation_sources_2026_04_19
  AS SELECT * FROM public.citation_sources;

CREATE TABLE IF NOT EXISTS _archive.content_voice_profiles_2026_04_19
  AS SELECT * FROM public.content_voice_profiles;

CREATE TABLE IF NOT EXISTS _archive.ai_readiness_history_2026_04_19
  AS SELECT * FROM public.ai_readiness_history;
-- NOTE: ai_readiness_history had 1 row at archive time (dev-era record, 2026-04-19).

CREATE TABLE IF NOT EXISTS _archive.content_performance_2026_04_19
  AS SELECT * FROM public.content_performance;

CREATE TABLE IF NOT EXISTS _archive.content_versions_2026_04_19
  AS SELECT * FROM public.content_versions;

CREATE TABLE IF NOT EXISTS _archive.scan_mentions_2026_04_19
  AS SELECT * FROM public.scan_mentions;

CREATE TABLE IF NOT EXISTS _archive.scan_queries_2026_04_19
  AS SELECT * FROM public.scan_queries;

CREATE TABLE IF NOT EXISTS _archive.agent_job_steps_2026_04_19
  AS SELECT * FROM public.agent_job_steps;

-- ============================================================
-- STEP 3 — DROP (destructive, run only after STEP 1 confirmed + STEP 2 applied)
-- ============================================================
DROP TABLE IF EXISTS public.agent_job_steps;
DROP TABLE IF EXISTS public.scan_queries;
DROP TABLE IF EXISTS public.scan_mentions;
DROP TABLE IF EXISTS public.content_versions;
DROP TABLE IF EXISTS public.content_performance;
DROP TABLE IF EXISTS public.ai_readiness_history;
DROP TABLE IF EXISTS public.content_voice_profiles;
DROP TABLE IF EXISTS public.citation_sources;
DROP TABLE IF EXISTS public.brand_narratives;

-- ============================================================
-- ROLLBACK NOTE
-- ============================================================
-- 8 tables were empty at drop time. ai_readiness_history had 1 dev-era row
-- (archived in _archive.ai_readiness_history_2026_04_19).
-- To restore:
--   CREATE TABLE public.<table_name> AS SELECT * FROM _archive.<table_name>_2026_04_19;
-- Then re-apply column types, constraints, and RLS policies from:
--   apps/web/supabase/migrations/20260308_004_agents_content.sql
--   apps/web/supabase/migrations/20260308_003_scan.sql
