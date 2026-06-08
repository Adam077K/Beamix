-- rollback-symmetry-20260608.sql
-- Post-rollback residue check for migration 20260608000001_scan_measurement_v2.sql
--
-- PURPOSE
-- -------
-- After you apply the rollback on a shadow/throwaway database, run this file.
-- It asserts that NONE of the objects introduced by the forward migration remain.
-- A RAISE EXCEPTION on any assertion means the rollback is incomplete.
--
-- OPERATOR INSTRUCTIONS
-- ---------------------
-- 1. Apply the forward migration to a fresh shadow branch:
--      supabase db reset --linked   (or psql \i migration file)
-- 2. Apply the rollback:
--      \i apps/web/supabase/migrations/rollback/20260608000001_scan_measurement_v2.rollback.sql
-- 3. Run this file:
--      supabase db query --linked --file apps/web/supabase/tests/rollback-symmetry-20260608.sql
-- 4. All DO blocks must emit NOTICE lines starting with "ROLLBACK-SYM PASS".
--    Any RAISE EXCEPTION means the rollback left residue.
--
-- SCOPE
-- -----
-- Checks the 6 tables affected by the migration:
--   New tables that must be GONE:  factor_catalog, telemetry_events, business_contexts
--   Altered tables, new columns must be GONE:
--     query_positions:    evidence_id, sample_n, ci_low, ci_high, model_id, run_kind
--     scan_engine_results: shape, shape_outcome
--     tracked_queries:    weight, intent_bucket, is_branded
--   New indexes must be GONE (by name).
--   New CHECK constraints must be GONE (by name).

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 1: New tables must not exist
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_rec    record;
  v_failed text := '';
BEGIN
  FOR v_rec IN
    SELECT * FROM (VALUES
      ('factor_catalog'),
      ('telemetry_events'),
      ('business_contexts')
    ) AS t(tablename)
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public' AND tablename = v_rec.tablename
    ) THEN
      v_failed := v_failed || v_rec.tablename || ', ';
    END IF;
  END LOOP;

  IF v_failed <> '' THEN
    RAISE EXCEPTION 'ROLLBACK-SYM FAIL — new tables still exist after rollback: %', rtrim(v_failed, ', ');
  ELSE
    RAISE NOTICE 'ROLLBACK-SYM PASS (check 1) — new tables are gone';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 2: New columns must not exist on altered tables
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_rec    record;
  v_failed text := '';
BEGIN
  FOR v_rec IN
    SELECT * FROM (VALUES
      ('query_positions',      'evidence_id'),
      ('query_positions',      'sample_n'),
      ('query_positions',      'ci_low'),
      ('query_positions',      'ci_high'),
      ('query_positions',      'model_id'),
      ('query_positions',      'run_kind'),
      ('scan_engine_results',  'shape'),
      ('scan_engine_results',  'shape_outcome'),
      ('tracked_queries',      'weight'),
      ('tracked_queries',      'intent_bucket'),
      ('tracked_queries',      'is_branded')
    ) AS t(tablename, columnname)
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = v_rec.tablename
        AND column_name  = v_rec.columnname
    ) THEN
      v_failed := v_failed || v_rec.tablename || '.' || v_rec.columnname || ', ';
    END IF;
  END LOOP;

  IF v_failed <> '' THEN
    RAISE EXCEPTION 'ROLLBACK-SYM FAIL — columns still exist after rollback: %', rtrim(v_failed, ', ');
  ELSE
    RAISE NOTICE 'ROLLBACK-SYM PASS (check 2) — all new columns are gone';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 3: New CHECK constraints must not exist on altered tables
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_rec    record;
  v_failed text := '';
BEGIN
  FOR v_rec IN
    SELECT * FROM (VALUES
      ('query_positions',      'query_positions_ci_bounds_check'),
      ('query_positions',      'query_positions_sample_n_check'),
      ('query_positions',      'query_positions_run_kind_check'),
      ('query_positions',      'query_positions_evidence_id_unique'),
      ('scan_engine_results',  'scan_engine_results_shape_check'),
      ('scan_engine_results',  'scan_engine_results_shape_outcome_check'),
      ('scan_engine_results',  'scan_engine_results_shape_outcome_coupling_check'),
      ('tracked_queries',      'tracked_queries_weight_check'),
      ('tracked_queries',      'tracked_queries_intent_bucket_check')
    ) AS t(tablename, constraintname)
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN   pg_class cl ON cl.oid = c.conrelid
      JOIN   pg_namespace n ON n.oid = cl.relnamespace
      WHERE  n.nspname  = 'public'
        AND  cl.relname = v_rec.tablename
        AND  c.conname  = v_rec.constraintname
    ) THEN
      v_failed := v_failed || v_rec.constraintname || ', ';
    END IF;
  END LOOP;

  IF v_failed <> '' THEN
    RAISE EXCEPTION 'ROLLBACK-SYM FAIL — constraints still exist after rollback: %', rtrim(v_failed, ', ');
  ELSE
    RAISE NOTICE 'ROLLBACK-SYM PASS (check 3) — all new constraints are gone';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK 4: New indexes must not exist
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_rec    record;
  v_failed text := '';
BEGIN
  FOR v_rec IN
    SELECT * FROM (VALUES
      ('tracked_queries_active_nonbranded_idx'),
      ('query_positions_business_run_kind_idx'),
      ('query_positions_evidence_id_unique'),
      ('telemetry_events_business_type_time_idx'),
      ('factor_catalog_active_tier_idx'),
      ('factor_catalog_is_active_idx'),
      ('telemetry_events_business_occurred_idx'),
      ('telemetry_events_event_type_idx'),
      ('business_contexts_expires_at_idx')
    ) AS t(indexname)
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public' AND indexname = v_rec.indexname
    ) THEN
      v_failed := v_failed || v_rec.indexname || ', ';
    END IF;
  END LOOP;

  IF v_failed <> '' THEN
    RAISE EXCEPTION 'ROLLBACK-SYM FAIL — indexes still exist after rollback: %', rtrim(v_failed, ', ');
  ELSE
    RAISE NOTICE 'ROLLBACK-SYM PASS (check 4) — all new indexes are gone';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Summary
-- ─────────────────────────────────────────────────────────────────────────────
SELECT 'ROLLBACK-SYMMETRY CHECKS COMPLETE — all 4 checks passed' AS result;
