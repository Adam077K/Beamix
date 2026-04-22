-- ============================================================
-- Migration: 20260422_01_drop_engine_check.sql
-- Purpose: Drop scan_engine_results_engine_check.
--
-- Why: The constraint whitelists engines the app does NOT use
-- ('llama', 'copilot', 'mistral') while rejecting engines the app
-- actually ships ('aio' = Google AI Overviews, 'youcom' = You.com).
-- Product docs (BRAND_GUIDELINES.md, engines.ts) define 7 engines:
-- chatgpt, gemini, perplexity, claude, grok, aio, youcom.
--
-- Engine names are already validated application-side via the Engine
-- enum in apps/web/src/components/competitors/types.ts and the
-- ENGINE key set in ScansClient.tsx. A DB-level whitelist that
-- contradicts the app is worse than no constraint.
--
-- Reversible: re-ADD the constraint with the same signature.
-- ============================================================

ALTER TABLE public.scan_engine_results
  DROP CONSTRAINT IF EXISTS scan_engine_results_engine_check;

-- ROLLBACK (for reference, do not run):
-- ALTER TABLE public.scan_engine_results
--   ADD CONSTRAINT scan_engine_results_engine_check
--   CHECK (engine = ANY (ARRAY['chatgpt','gemini','perplexity','claude','grok','llama','copilot','mistral']));
