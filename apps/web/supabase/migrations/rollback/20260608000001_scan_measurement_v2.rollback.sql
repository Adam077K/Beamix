-- Rollback: 20260608000001_scan_measurement_v2.sql
-- Reverses Wave 3 scan measurement v2 migration in dependency-safe order.
-- DESTRUCTIVE: permanently drops factor_catalog, telemetry_events, business_contexts
--              and all data seeded into them. Run only after confirming the forward
--              migration has been applied and that no application code is actively
--              reading/writing these tables.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Drop new tables (CASCADE removes their indexes + policies automatically)
-- ─────────────────────────────────────────────────────────────────────────────

-- Explicit index drops before table drop — harmless if already dropped by CASCADE,
-- but makes the dependency order explicit and safe for partial-state rollbacks.
DROP INDEX IF EXISTS public.factor_catalog_active_tier_idx;
DROP INDEX IF EXISTS public.factor_catalog_is_active_idx;
DROP INDEX IF EXISTS public.telemetry_events_business_type_time_idx;
DROP INDEX IF EXISTS public.telemetry_events_event_type_idx;
DROP INDEX IF EXISTS public.telemetry_events_business_occurred_idx;
DROP INDEX IF EXISTS public.business_contexts_built_from_scan_id_idx;
DROP INDEX IF EXISTS public.business_contexts_expires_at_idx;

DROP TABLE IF EXISTS public.factor_catalog CASCADE;
DROP TABLE IF EXISTS public.telemetry_events CASCADE;
DROP TABLE IF EXISTS public.business_contexts CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Remove CHECK constraints and columns added to tracked_queries
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop the scoring-column immutability trigger + function before removing the
-- columns they reference (dependency-safe order).
DROP TRIGGER IF EXISTS trg_tracked_queries_scoring_immutable ON public.tracked_queries;
DROP FUNCTION IF EXISTS public.enforce_tracked_queries_scoring_immutable();

-- Drop the partial index for W5 scoring path before removing its indexed columns.
DROP INDEX IF EXISTS public.tracked_queries_active_nonbranded_idx;

ALTER TABLE public.tracked_queries
  DROP CONSTRAINT IF EXISTS tracked_queries_weight_check;

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
  DROP CONSTRAINT IF EXISTS scan_engine_results_shape_outcome_coupling_check;

ALTER TABLE public.scan_engine_results
  DROP CONSTRAINT IF EXISTS scan_engine_results_shape_outcome_check;

ALTER TABLE public.scan_engine_results
  DROP CONSTRAINT IF EXISTS scan_engine_results_shape_check;

ALTER TABLE public.scan_engine_results
  DROP COLUMN IF EXISTS shape_outcome;

ALTER TABLE public.scan_engine_results
  DROP COLUMN IF EXISTS shape;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Remove constraints and columns added to query_positions
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop the composite index before removing its columns.
DROP INDEX IF EXISTS public.query_positions_business_run_kind_idx;

ALTER TABLE public.query_positions
  DROP CONSTRAINT IF EXISTS query_positions_run_kind_check;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS run_kind;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS model_id;

ALTER TABLE public.query_positions
  DROP CONSTRAINT IF EXISTS query_positions_ci_bounds_check;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS ci_high;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS ci_low;

ALTER TABLE public.query_positions
  DROP CONSTRAINT IF EXISTS query_positions_sample_n_check;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS sample_n;

-- evidence_id teardown: constraint → index → column (dependency-safe order).
ALTER TABLE public.query_positions
  DROP CONSTRAINT IF EXISTS query_positions_evidence_id_unique;

DROP INDEX IF EXISTS public.query_positions_evidence_id_unique;

ALTER TABLE public.query_positions
  DROP COLUMN IF EXISTS evidence_id;
