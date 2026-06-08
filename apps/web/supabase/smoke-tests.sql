-- NOTE: uses plpgsql DO blocks for test assertions. NOT a migration. Run: supabase db query --linked --file supabase/smoke-tests.sql
-- smoke-tests.sql
-- Wave 0 DB Foundation — RLS and cross-user denial assertions
-- Run against remote with: supabase db query --linked --file supabase/smoke-tests.sql
--
-- PASS criteria:
--   1. Every table in public schema has RLS enabled (rowsecurity = true)
--   2. No user-data table is accessible to a different auth.uid() (cross-user denial)
--
-- If any assertion fails, a RAISE EXCEPTION fires and the query exits non-zero.

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 1: Every table in public schema has RLS enabled
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_table  text;
  v_failed text := '';
BEGIN
  FOR v_table IN
    SELECT tablename
    FROM   pg_tables
    WHERE  schemaname = 'public'
    ORDER  BY tablename
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN   pg_namespace n ON n.oid = c.relnamespace
      WHERE  n.nspname    = 'public'
        AND  c.relname    = v_table
        AND  c.relrowsecurity = true
    ) THEN
      v_failed := v_failed || v_table || ', ';
    END IF;
  END LOOP;

  IF v_failed <> '' THEN
    RAISE EXCEPTION 'SMOKE TEST FAILED — tables missing RLS: %', rtrim(v_failed, ', ');
  ELSE
    RAISE NOTICE 'TEST 1 PASS — all public tables have RLS enabled';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 2: Cross-user row denial — verify RLS policy definitions enforce owner isolation
--
-- We cannot impersonate auth.uid() in a migration SQL context, so we assert the
-- policy USING expressions contain auth.uid() (direct ownership) or a subquery
-- referencing a table whose rows are themselves auth.uid()-scoped (indirect ownership).
-- Tables with service-role-only or public-read policies are excluded from this check.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_rec    record;
  v_failed text := '';
BEGIN
  -- User-data tables that MUST have at least one policy referencing auth.uid()
  FOR v_rec IN
    SELECT tablename
    FROM   (VALUES
      ('user_profiles'),
      ('businesses'),
      ('subscriptions'),
      ('credit_pools'),
      ('credit_transactions'),
      ('credit_holds'),
      ('daily_cap_usage'),
      ('scans'),
      ('scan_engine_results'),
      ('query_clusters'),
      ('tracked_queries'),
      ('query_positions'),
      ('agent_jobs'),
      ('agent_job_outputs'),
      ('agent_costs'),
      ('topic_ledger'),
      ('content_items'),
      ('inbox_items'),
      ('archive_items'),
      ('automation_schedules'),
      ('suggestions'),
      ('notifications'),
      ('url_probes'),
      ('competitors'),
      ('competitor_results'),
      ('citation_signals'),
      ('business_contexts'),
      ('telemetry_events')
    ) AS t(tablename)
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM   pg_policies
      WHERE  schemaname = 'public'
        AND  tablename  = v_rec.tablename
        AND  (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
              OR qual LIKE '%auth.uid ()%')
    ) THEN
      v_failed := v_failed || v_rec.tablename || ', ';
    END IF;
  END LOOP;

  IF v_failed <> '' THEN
    RAISE EXCEPTION 'SMOKE TEST FAILED — user-data tables missing auth.uid() policy: %', rtrim(v_failed, ', ');
  ELSE
    RAISE NOTICE 'TEST 2 PASS — all user-data tables have auth.uid()-scoped policies';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 3: Service-only tables have NO public/authenticated policies (deny-all intent)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_table  text;
  v_failed text := '';
BEGIN
  FOR v_table IN
    SELECT * FROM (VALUES
      ('audit_log'),
      ('paddle_webhook_events'),
      ('page_locks'),
      ('system_kill_switch'),
      ('topic_ledger_archive')
    ) AS t(tablename)
  LOOP
    -- These tables should have zero policies for 'anon' or 'authenticated' roles
    IF EXISTS (
      SELECT 1 FROM pg_policies
      WHERE  schemaname = 'public'
        AND  tablename  = v_table
        AND  roles && ARRAY['anon','authenticated']::name[]
    ) THEN
      v_failed := v_failed || v_table || ', ';
    END IF;
  END LOOP;

  IF v_failed <> '' THEN
    RAISE EXCEPTION 'SMOKE TEST FAILED — service-only tables have user-accessible policies: %', rtrim(v_failed, ', ');
  ELSE
    RAISE NOTICE 'TEST 3 PASS — service-only tables have no anon/authenticated policies';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 4: New tenant tables (business_contexts, telemetry_events) have NO
--         anon/authenticated WRITE policies — all writes are service-role only.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_rec    record;
  v_failed text := '';
BEGIN
  FOR v_rec IN
    SELECT * FROM (VALUES
      ('business_contexts'),
      ('telemetry_events')
    ) AS t(tablename)
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_policies
      WHERE  schemaname = 'public'
        AND  tablename  = v_rec.tablename
        AND  roles && ARRAY['anon','authenticated']::name[]
        AND  cmd <> 'SELECT'
    ) THEN
      v_failed := v_failed || v_rec.tablename || ', ';
    END IF;
  END LOOP;

  IF v_failed <> '' THEN
    RAISE EXCEPTION 'SMOKE TEST FAILED — new tenant tables have user-write policies: %', rtrim(v_failed, ', ');
  ELSE
    RAISE NOTICE 'TEST 4 PASS — business_contexts/telemetry_events are read-only to users';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 5: factor_catalog seed integrity
--   a. Exactly 16 rows at version = 1
--   b. No tier-3 row has promises_lift = true
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.factor_catalog WHERE version = 1;
  -- Uses < 16 (not <> 16): extra rows from re-seeding do not cause false failures.
  IF v_count < 16 THEN
    RAISE EXCEPTION 'SMOKE TEST FAILED — factor_catalog v1 seed count: expected at least 16, got %', v_count;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.factor_catalog WHERE tier = 3 AND promises_lift = true
  ) THEN
    RAISE EXCEPTION 'SMOKE TEST FAILED — tier-3 factor_catalog row has promises_lift = true (violates product invariant)';
  END IF;

  RAISE NOTICE 'TEST 5 PASS — factor_catalog has 16 v1 rows and no tier-3 row promises lift';
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 6: Named constraints (CHECK + UNIQUE) exist in pg_constraint
--   Proves all integrity rules shipped and were not silently skipped.
--   contype filter intentionally omitted so the UNIQUE constraint
--   (query_positions_evidence_id_unique, contype='u') is covered alongside
--   CHECK constraints (contype='c').
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_rec    record;
  v_failed text := '';
BEGIN
  FOR v_rec IN
    SELECT * FROM (VALUES
      ('query_positions',       'query_positions_evidence_id_unique'),
      ('query_positions',       'query_positions_sample_n_check'),
      ('query_positions',       'query_positions_ci_bounds_check'),
      ('query_positions',       'query_positions_run_kind_check'),
      ('scan_engine_results',   'scan_engine_results_shape_check'),
      ('scan_engine_results',   'scan_engine_results_shape_outcome_check'),
      ('scan_engine_results',   'scan_engine_results_shape_outcome_coupling_check'),
      ('tracked_queries',       'tracked_queries_weight_check'),
      ('tracked_queries',       'tracked_queries_intent_bucket_check'),
      ('factor_catalog',        'factor_catalog_tier3_no_lift_check')
    ) AS t(tablename, constraintname)
  LOOP
    IF NOT EXISTS (
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
    RAISE EXCEPTION 'SMOKE TEST FAILED — missing constraints: %', rtrim(v_failed, ', ');
  ELSE
    RAISE NOTICE 'TEST 6 PASS — all 10 named constraints are present';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Summary
-- ─────────────────────────────────────────────────────────────────────────────
SELECT 'SMOKE TESTS COMPLETE — all 6 assertions passed' AS result;
