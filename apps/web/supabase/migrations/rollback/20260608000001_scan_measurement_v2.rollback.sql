-- Rollback: 20260608000001_scan_measurement_v2.sql
-- Reverses Wave 3 scan measurement v2 migration in dependency-safe order.
-- DESTRUCTIVE: permanently drops factor_catalog, telemetry_events, business_contexts
--              and all data seeded into them. Run only after confirming the forward
--              migration has been applied and that no application code is actively
--              reading/writing these tables.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Drop new tables (CASCADE removes their indexes + policies automatically)
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS public.factor_catalog CASCADE;
DROP TABLE IF EXISTS public.telemetry_events CASCADE;
DROP TABLE IF EXISTS public.business_contexts CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Remove CHECK constraints and columns added to tracked_queries
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.tracked_queries
  DROP CONSTRAINT IF EXISTS tracked_queries_intent_bucket_check;

ALTER TABLE public.tracked_queries
  DROP COLUMN IF EXISTS is_branded;

ALTER TABLE public.tracked_queries
  DROP COLUMN IF EXISTS intent_bucket;

ALTER TABLE public.tracked_queries
  DROP COLUMN IF EXISTS weight;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Remove CHECK constraints and columns added to scan_engine_results
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.scan_engine_results
  DROP CONSTRAINT IF EXISTS scan_engine_results_shape_outcome_check;

ALTER TABLE public.scan_engine_results
  DROP CONSTRAINT IF EXISTS scan_engine_results_shape_check;

ALTER TABLE public.scan_engine_results
  DROP COLUMN IF EXISTS shape_outcome;

ALTER TABLE public.scan_engine_results
  DROP COLUMN IF EXISTS shape;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Remove UNIQUE constraint and columns added to query_positions
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.query_positions
  DROP CONSTRAINT IF EXISTS query_positions_run_kind_check;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS run_kind;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS model_id;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS ci_high;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS ci_low;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS sample_n;

-- Drop the UNIQUE constraint (and its backing index) last, after other deps removed.
ALTER TABLE public.query_positions
  DROP CONSTRAINT IF EXISTS query_positions_evidence_id_unique;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS evidence_id;
