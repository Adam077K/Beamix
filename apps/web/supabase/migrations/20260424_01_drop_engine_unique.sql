-- ============================================================
-- Migration: 20260424_01_drop_engine_unique.sql
-- Purpose: Drop scan_engine_results_unique constraint (UNIQUE on scan_id, engine).
--
-- Why: The constraint contradicts the table's own design. The table has
-- per-query columns (prompt_text, prompt_category, query_type, queries_checked)
-- that only make sense if multiple rows are allowed per (scan, engine) — one
-- row per (scan, engine, query). The UNIQUE (scan_id, engine) constraint
-- forced per-engine aggregation, breaking the seed and the Scan Drilldown
-- query-by-query table.
--
-- Applied to production via Supabase SQL Editor on 2026-04-24. This file
-- mirrors that change so a fresh DB rebuild does not reintroduce the bug.
--
-- Reversible: re-ADD the constraint with the same signature. Doing so will
-- break the seed and the per-query Scan Drilldown.
-- ============================================================

ALTER TABLE public.scan_engine_results
  DROP CONSTRAINT IF EXISTS scan_engine_results_unique;

-- ROLLBACK (for reference, do not run — will break the seed):
-- ALTER TABLE public.scan_engine_results
--   ADD CONSTRAINT scan_engine_results_unique UNIQUE (scan_id, engine);
