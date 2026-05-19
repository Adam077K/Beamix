-- cleanup/0001-drop-competitor-intelligence-legacy.sql
-- Author: supabase-cleaner agent, reviewed by Adam on 2026-04-19
-- Context: The Competitor Intelligence agent (old chat-based version) was retired
--          in the 2026-04-15 rethink. The three tables below stored competitor
--          content snapshots, scan records, and share-of-voice calculations for
--          that retired agent. No successor agent inherits this data — the new
--          Reddit Presence Planner and Offsite Presence Builder do not use it.
--          The competitor_intelligence agent_type enum value is retired; only
--          new GEO-specialized agents ship in MVP-1.
-- Risk: VERY LOW — all 3 tables are empty (0 rows). Archive is a no-op safety step.
-- Rollback: Archive tables in _archive schema retained for 90 days.
--           Can be recreated from _archive via CREATE TABLE ... AS SELECT.

-- ============================================================
-- STEP 1 — PRE-FLIGHT (run first, inspect the counts, confirm intent)
-- ============================================================
SELECT
  (SELECT COUNT(*) FROM public.competitor_content_snapshots) AS competitor_content_snapshots_rows,
  (SELECT COUNT(*) FROM public.competitor_scans)             AS competitor_scans_rows,
  (SELECT COUNT(*) FROM public.competitor_share_of_voice)    AS competitor_share_of_voice_rows;
-- Expected: 0 / 0 / 0 (verified 2026-04-19)

-- ============================================================
-- STEP 2 — ARCHIVE (safe, additive)
-- Run after STEP 1 confirms counts are as expected.
-- ============================================================

-- Create _archive schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS _archive;

CREATE TABLE IF NOT EXISTS _archive.competitor_content_snapshots_2026_04_19
  AS SELECT * FROM public.competitor_content_snapshots;

CREATE TABLE IF NOT EXISTS _archive.competitor_scans_2026_04_19
  AS SELECT * FROM public.competitor_scans;

CREATE TABLE IF NOT EXISTS _archive.competitor_share_of_voice_2026_04_19
  AS SELECT * FROM public.competitor_share_of_voice;

-- ============================================================
-- STEP 3 — DROP (destructive, run only after STEP 1 confirmed + STEP 2 applied)
-- ============================================================
DROP TABLE IF EXISTS public.competitor_share_of_voice;
DROP TABLE IF EXISTS public.competitor_content_snapshots;
DROP TABLE IF EXISTS public.competitor_scans;

-- ============================================================
-- ROLLBACK NOTE
-- ============================================================
-- All 3 tables were empty at drop time (verified 2026-04-19).
-- To restore structure (no data to recover):
--   CREATE TABLE public.competitor_content_snapshots AS SELECT * FROM _archive.competitor_content_snapshots_2026_04_19;
--   CREATE TABLE public.competitor_scans            AS SELECT * FROM _archive.competitor_scans_2026_04_19;
--   CREATE TABLE public.competitor_share_of_voice   AS SELECT * FROM _archive.competitor_share_of_voice_2026_04_19;
-- Then re-apply column types, constraints, and RLS policies from:
--   apps/web/supabase/migrations/20260308_005_intelligence.sql
