-- cleanup/0003-drop-misc-legacy.sql
-- Author: supabase-cleaner agent, reviewed by Adam on 2026-04-19
-- Context: Seven miscellaneous legacy tables from the pre-rethink product.
--          NOTE: agent_workflows is EXCLUDED from this file — it was verified
--          to have cadence/next_run_at/paused_at columns added by migration
--          20260418_02_rethink_schema, making it a live rethink table.
--          workflow_runs IS included — it is the execution log for the old
--          pre-rethink workflow runner (agent_workflows in its legacy form),
--          and has 0 rows.
--
--   alert_rules       — Alerting system retired in rethink (Inbox model replaces)
--   ga4_metrics       — GA4 integration was never shipped; no code references
--   gsc_data          — Google Search Console integration deferred to post-MVP
--   personas          — Customer persona builder retired; Entity Builder replaces
--   prompt_library    — Internal prompt store from pre-rethink agent architecture
--   prompt_volumes    — Search volume data store for retired prompt research agent
--   crawler_detections — Bot/crawler detection log from pre-rethink scan engine
--   workflow_runs     — Execution log for pre-rethink workflow runner (0 rows)
--
-- Risk: VERY LOW — all 8 tables are empty (0 rows).
-- Rollback: Archive tables in _archive schema retained for 90 days.

-- ============================================================
-- STEP 1 — PRE-FLIGHT (run first, inspect the counts, confirm intent)
-- ============================================================
SELECT
  (SELECT COUNT(*) FROM public.alert_rules)         AS alert_rules_rows,
  (SELECT COUNT(*) FROM public.ga4_metrics)         AS ga4_metrics_rows,
  (SELECT COUNT(*) FROM public.gsc_data)            AS gsc_data_rows,
  (SELECT COUNT(*) FROM public.personas)            AS personas_rows,
  (SELECT COUNT(*) FROM public.prompt_library)      AS prompt_library_rows,
  (SELECT COUNT(*) FROM public.prompt_volumes)      AS prompt_volumes_rows,
  (SELECT COUNT(*) FROM public.crawler_detections)  AS crawler_detections_rows,
  (SELECT COUNT(*) FROM public.workflow_runs)       AS workflow_runs_rows;
-- Expected: 0 / 0 / 0 / 0 / 0 / 0 / 0 / 0 (verified 2026-04-19)

-- ============================================================
-- STEP 2 — ARCHIVE (safe, additive)
-- Run after STEP 1 confirms counts are as expected.
-- ============================================================

-- Create _archive schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS _archive;

CREATE TABLE IF NOT EXISTS _archive.alert_rules_2026_04_19
  AS SELECT * FROM public.alert_rules;

CREATE TABLE IF NOT EXISTS _archive.ga4_metrics_2026_04_19
  AS SELECT * FROM public.ga4_metrics;

CREATE TABLE IF NOT EXISTS _archive.gsc_data_2026_04_19
  AS SELECT * FROM public.gsc_data;

CREATE TABLE IF NOT EXISTS _archive.personas_2026_04_19
  AS SELECT * FROM public.personas;

CREATE TABLE IF NOT EXISTS _archive.prompt_library_2026_04_19
  AS SELECT * FROM public.prompt_library;

CREATE TABLE IF NOT EXISTS _archive.prompt_volumes_2026_04_19
  AS SELECT * FROM public.prompt_volumes;

CREATE TABLE IF NOT EXISTS _archive.crawler_detections_2026_04_19
  AS SELECT * FROM public.crawler_detections;

CREATE TABLE IF NOT EXISTS _archive.workflow_runs_2026_04_19
  AS SELECT * FROM public.workflow_runs;

-- ============================================================
-- STEP 3 — DROP (destructive, run only after STEP 1 confirmed + STEP 2 applied)
-- ============================================================
-- Drop workflow_runs before alert_rules (no FK dependency, but drop order is
-- explicit for safety — workflow_runs may FK to agent_workflows).
DROP TABLE IF EXISTS public.workflow_runs;
DROP TABLE IF EXISTS public.crawler_detections;
DROP TABLE IF EXISTS public.prompt_volumes;
DROP TABLE IF EXISTS public.prompt_library;
DROP TABLE IF EXISTS public.personas;
DROP TABLE IF EXISTS public.gsc_data;
DROP TABLE IF EXISTS public.ga4_metrics;
DROP TABLE IF EXISTS public.alert_rules;

-- ============================================================
-- ROLLBACK NOTE
-- ============================================================
-- All 8 tables were empty at drop time (verified 2026-04-19).
-- To restore structure:
--   CREATE TABLE public.<table_name> AS SELECT * FROM _archive.<table_name>_2026_04_19;
-- Then re-apply column types, constraints, and RLS policies from:
--   apps/web/supabase/migrations/20260308_006_workflows_alerts.sql  (alert_rules, workflow_runs)
--   apps/web/supabase/migrations/20260308_007_platform.sql          (ga4_metrics, gsc_data, personas, prompt_library, prompt_volumes, crawler_detections)
