\set ON_ERROR_STOP on
-- tracked-queries-scoring-immutability-20260608.sql
-- Behavioral tests for enforce_tracked_queries_scoring_immutable() trigger.
--
-- !! WARNING — SHADOW DATABASE ONLY !!
-- !! WARNING — SHADOW DATABASE ONLY !!
-- !! WARNING — SHADOW DATABASE ONLY !!
--
-- NEVER run this against the linked/production database.
-- NEVER run this against the linked/production database.
-- NEVER run this against the linked/production database.
--
-- This file exercises live trigger behavior by seeding rows and asserting
-- outcomes. All changes are rolled back at the end — the DB is left clean.
-- Running this against production would still be destructive for the duration
-- of the transaction and risks triggering RLS/FK errors on real data.
--
-- FAIL-FAST: \set ON_ERROR_STOP on (line 1) causes psql to abort on any
-- RAISE EXCEPTION, so the final summary SELECT only prints on genuine success.
--
-- PURPOSE
-- -------
-- The smoke-tests.sql TEST 7 verifies the trigger definition (existence,
-- enabled state, tgtype bitmask). This file verifies the RUNTIME behavior:
--   TEST A — INSERT clamp: non-privileged role cannot pre-set scoring columns;
--            they are silently normalized to defaults (weight=1, intent_bucket=NULL,
--            is_branded=false) even when the caller supplies different values.
--   TEST B — UPDATE reject (3 sub-cases: weight, intent_bucket, is_branded):
--            non-privileged role attempting to change any scoring column receives
--            SQLSTATE '42501' (insufficient_privilege) AND the message contains the
--            trigger's stable phrase 'scoring columns' — distinguishing trigger
--            rejection from an RLS denial (which also uses 42501 but has a different
--            message). SQLSTATE is also explicitly asserted to be '42501'.
--            Each column tested independently.
--   TEST C — Allowed edit: non-privileged role CAN still update non-scoring
--            columns (query_text); proves the trigger is column-scoped.
--   TEST D-1 — service_role bypass: SET LOCAL ROLE service_role then UPDATE
--            weight=50 and assert it SUCCEEDS — this is the real production
--            write path (Inngest / probe jobs use the service-role key).
--   TEST D-2 — owner (postgres) bypass: RESET ROLE then UPDATE weight=51 and
--            assert it SUCCEEDS — proves the migration-owner bypass works too.
--
-- OPERATOR INSTRUCTIONS
-- ----------------------
-- Option A: Supabase branch (recommended)
--   1. supabase branches create immutability-test-<date>
--   2. Connect psql to that branch's DB.
--   3. Apply the forward migration:
--        \i apps/web/supabase/migrations/20260608000002_scan_measurement_v2.sql
--   4. Run this file:
--        \i apps/web/supabase/tests/tracked-queries-scoring-immutability-20260608.sql
--   5. supabase branches delete immutability-test-<date>
--
-- Option B: Local throwaway Postgres (e.g. Docker)
--   1. Spin up a fresh Postgres container with the full schema applied.
--   2. Run this file via psql \i.
--   3. Tear down the container when done.
--
-- All tests emit NOTICE lines starting with "IMMUTABILITY PASS".
-- Any RAISE EXCEPTION means a behavioral invariant was violated (and with
-- ON_ERROR_STOP on, psql exits non-zero immediately).

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: auth.users row for owner U + businesses row owned by U
--
-- Fixed owner UUID U = '00000000-0000-0000-0001-000000000002'.
-- auth.users has only one NOT NULL column without a default: id.
-- (is_sso_user and is_anonymous both default to false.)
-- All seeding runs as the table/migration owner BEFORE switching role.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Seed auth.users so auth.uid() can resolve to U under the authenticated role.
  -- Only id is required; all other columns are nullable or have defaults.
  INSERT INTO auth.users (id)
  VALUES ('00000000-0000-0000-0001-000000000002'::uuid)
  ON CONFLICT (id) DO NOTHING;

  -- Seed businesses with user_id = U so the RLS owner-write policy passes.
  INSERT INTO public.businesses (
    id,
    user_id,
    name,
    website_url,
    language,
    services
  ) VALUES (
    '00000000-0000-0000-0001-000000000001'::uuid,
    '00000000-0000-0000-0001-000000000002'::uuid,
    'Test Business (shadow DB seed)',
    'https://shadow-test.example.com',
    'en',
    '{}'
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Activate the authenticated role and set request.jwt.claims so auth.uid()
-- resolves to owner U ('00000000-0000-0000-0001-000000000002').
--
-- PostgREST sets SET LOCAL ROLE authenticated and populates request.jwt.claims
-- for every authenticated API request. The auth.uid() function reads the 'sub'
-- claim from that config key. set_config(..., true) makes it transaction-local.
-- ─────────────────────────────────────────────────────────────────────────────

SET LOCAL ROLE authenticated;

SELECT set_config(
  'request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0001-000000000002')::text,
  true  -- transaction-local: reset on ROLLBACK / end of transaction
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST A: INSERT clamp
--
-- An authenticated owner INSERT supplying weight=99, intent_bucket='comparison',
-- is_branded=true must be silently normalized by the trigger to:
--   weight=1, intent_bucket=NULL, is_branded=false.
--
-- After the INSERT we also assert exactly 1 row exists with the test UUID so
-- that TEST B/C cannot silently pass on a missing row.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_id            uuid;
  v_weight        numeric;
  v_intent_bucket text;
  v_is_branded    boolean;
  v_row_count     int;
BEGIN
  -- Insert with attacker-supplied scoring values.
  INSERT INTO public.tracked_queries (
    id,
    business_id,
    query_text,
    weight,
    intent_bucket,
    is_branded
  ) VALUES (
    '00000000-0000-0000-0002-000000000001'::uuid,
    '00000000-0000-0000-0001-000000000001'::uuid,
    'best accounting software',
    99,           -- attacker tries to set weight to 99
    'comparison', -- attacker tries to set intent_bucket
    true          -- attacker tries to set is_branded = true
  )
  RETURNING id INTO v_id;

  -- Assert exactly 1 row was created (closes the "UPDATE matched 0 rows → false pass" hole).
  SELECT COUNT(*) INTO v_row_count
  FROM   public.tracked_queries
  WHERE  id = v_id;

  IF v_row_count <> 1 THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST A pre-check: expected 1 row after INSERT, got %', v_row_count;
  END IF;

  -- Read back the persisted values (within same transaction, same role).
  SELECT weight, intent_bucket, is_branded
  INTO   v_weight, v_intent_bucket, v_is_branded
  FROM   public.tracked_queries
  WHERE  id = v_id;

  -- Assert the trigger clamped all three columns to their safe defaults.
  IF v_weight <> 1 THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST A: weight not clamped; expected 1, got %', v_weight;
  END IF;

  IF v_intent_bucket IS NOT NULL THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST A: intent_bucket not clamped to NULL; got %', v_intent_bucket;
  END IF;

  IF v_is_branded <> false THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST A: is_branded not clamped to false; got %', v_is_branded;
  END IF;

  RAISE NOTICE 'IMMUTABILITY PASS — TEST A: INSERT scoring columns clamped to defaults (weight=1, intent_bucket=NULL, is_branded=false), row count 1 confirmed';
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST B: UPDATE reject — 3 sub-cases: weight, intent_bucket, is_branded
--
-- Each sub-case wraps the UPDATE in a BEGIN/EXCEPTION block.
-- PASS condition: SQLSTATE = '42501' (insufficient_privilege) AND the
--   exception message contains the trigger's stable phrase 'scoring columns'.
--   SQLSTATE is explicitly asserted (not just caught by condition name) to give
--   a precise failure message if the code changes. The message check discriminates
--   trigger rejection from an RLS denial: both use 42501 but only the trigger
--   sets the 'scoring columns' phrase.
-- FAIL conditions:
--   - No exception raised (trigger not firing or role detection broken).
--   - 42501 raised but SQLSTATE assertion fails (defensive: should be tautological).
--   - 42501 raised but message does NOT contain 'scoring columns' (RLS denial,
--     not trigger — indicates auth.uid() is still NULL or RLS is blocking first).
--   - Any other exception code.
-- ─────────────────────────────────────────────────────────────────────────────

-- TEST B-1: UPDATE weight
DO $$
DECLARE
  v_triggered  boolean := false;
  v_sqlerrcode text;
  v_message    text;
BEGIN
  BEGIN
    UPDATE public.tracked_queries
    SET    weight = 50
    WHERE  id = '00000000-0000-0000-0002-000000000001'::uuid;
    -- No exception → FAIL.
    v_triggered := false;
  EXCEPTION
    WHEN insufficient_privilege THEN
      GET STACKED DIAGNOSTICS
        v_sqlerrcode = RETURNED_SQLSTATE,
        v_message    = MESSAGE_TEXT;
      -- Assert SQLSTATE is exactly '42501'.
      IF v_sqlerrcode <> '42501' THEN
        RAISE EXCEPTION
          'IMMUTABILITY FAIL — TEST B-1: expected SQLSTATE 42501, got %', v_sqlerrcode;
      END IF;
      -- Confirm this came from the trigger, not RLS.
      IF v_message NOT LIKE '%scoring columns%' THEN
        RAISE EXCEPTION
          'IMMUTABILITY FAIL — TEST B-1: got 42501 but message does NOT contain ''scoring columns'' '
          '(this is likely an RLS denial, not the trigger — auth.uid() may be NULL). Message: [%]',
          v_message;
      END IF;
      v_triggered := true;
  END;

  IF NOT v_triggered THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST B-1: UPDATE weight=50 did not raise 42501; '
      'trigger may not be firing or role detection is broken';
  END IF;

  RAISE NOTICE 'IMMUTABILITY PASS — TEST B-1: UPDATE weight=50 raised SQLSTATE=42501 with trigger phrase';
END;
$$;

-- TEST B-2: UPDATE intent_bucket
DO $$
DECLARE
  v_triggered  boolean := false;
  v_sqlerrcode text;
  v_message    text;
BEGIN
  BEGIN
    UPDATE public.tracked_queries
    SET    intent_bucket = 'comparison'
    WHERE  id = '00000000-0000-0000-0002-000000000001'::uuid;
    v_triggered := false;
  EXCEPTION
    WHEN insufficient_privilege THEN
      GET STACKED DIAGNOSTICS
        v_sqlerrcode = RETURNED_SQLSTATE,
        v_message    = MESSAGE_TEXT;
      IF v_sqlerrcode <> '42501' THEN
        RAISE EXCEPTION
          'IMMUTABILITY FAIL — TEST B-2: expected SQLSTATE 42501, got %', v_sqlerrcode;
      END IF;
      IF v_message NOT LIKE '%scoring columns%' THEN
        RAISE EXCEPTION
          'IMMUTABILITY FAIL — TEST B-2: got 42501 but message does NOT contain ''scoring columns'' '
          '(likely RLS, not trigger). Message: [%]',
          v_message;
      END IF;
      v_triggered := true;
  END;

  IF NOT v_triggered THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST B-2: UPDATE intent_bucket=''comparison'' did not raise 42501';
  END IF;

  RAISE NOTICE 'IMMUTABILITY PASS — TEST B-2: UPDATE intent_bucket raised SQLSTATE=42501 with trigger phrase';
END;
$$;

-- TEST B-3: UPDATE is_branded
DO $$
DECLARE
  v_triggered  boolean := false;
  v_sqlerrcode text;
  v_message    text;
BEGIN
  BEGIN
    UPDATE public.tracked_queries
    SET    is_branded = true
    WHERE  id = '00000000-0000-0000-0002-000000000001'::uuid;
    v_triggered := false;
  EXCEPTION
    WHEN insufficient_privilege THEN
      GET STACKED DIAGNOSTICS
        v_sqlerrcode = RETURNED_SQLSTATE,
        v_message    = MESSAGE_TEXT;
      IF v_sqlerrcode <> '42501' THEN
        RAISE EXCEPTION
          'IMMUTABILITY FAIL — TEST B-3: expected SQLSTATE 42501, got %', v_sqlerrcode;
      END IF;
      IF v_message NOT LIKE '%scoring columns%' THEN
        RAISE EXCEPTION
          'IMMUTABILITY FAIL — TEST B-3: got 42501 but message does NOT contain ''scoring columns'' '
          '(likely RLS, not trigger). Message: [%]',
          v_message;
      END IF;
      v_triggered := true;
  END;

  IF NOT v_triggered THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST B-3: UPDATE is_branded=true did not raise 42501';
  END IF;

  RAISE NOTICE 'IMMUTABILITY PASS — TEST B-3: UPDATE is_branded raised SQLSTATE=42501 with trigger phrase';
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST C: Allowed edit
--
-- An authenticated owner CAN still UPDATE non-scoring columns (query_text).
-- This proves the trigger is column-scoped, not a blanket row lock.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_query_text text;
BEGIN
  UPDATE public.tracked_queries
  SET    query_text = 'edited query text'
  WHERE  id = '00000000-0000-0000-0002-000000000001'::uuid;

  SELECT query_text INTO v_query_text
  FROM   public.tracked_queries
  WHERE  id = '00000000-0000-0000-0002-000000000001'::uuid;

  IF v_query_text <> 'edited query text' THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST C: UPDATE query_text did not persist; got [%]', v_query_text;
  END IF;

  RAISE NOTICE 'IMMUTABILITY PASS — TEST C: UPDATE on non-scoring column (query_text) succeeded as expected';
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Restore session role to the DB owner before the privileged bypass tests.
-- ─────────────────────────────────────────────────────────────────────────────

RESET ROLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST D-1: service_role bypass (real production write path)
--
-- Inngest, probe jobs, and scoring pipelines use the Supabase service-role key.
-- PostgREST sets the Postgres role to service_role for those requests.
-- The trigger allowlist includes 'service_role' — UPDATE weight=50 must SUCCEED.
--
-- The SET ROLE, UPDATE, read-back, and assertion all run inside the SAME block
-- so there is no ambiguity about which role is active when the UPDATE executes.
-- The single EXCEPTION handler catches BOTH a denied SET ROLE (permissions gap)
-- AND a denied UPDATE (trigger allowlist regression — the real regression test).
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_weight numeric;
BEGIN
  SET LOCAL ROLE service_role;
  UPDATE public.tracked_queries
  SET    weight = 50
  WHERE  id = '00000000-0000-0000-0002-000000000001'::uuid;
  SELECT weight INTO v_weight
  FROM   public.tracked_queries
  WHERE  id = '00000000-0000-0000-0002-000000000001'::uuid;
  IF v_weight <> 50 THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST D-1: service_role UPDATE weight=50 did not persist; got %', v_weight;
  END IF;
  RAISE NOTICE 'IMMUTABILITY PASS — TEST D-1: service_role UPDATE weight=50 succeeded (production bypass confirmed)';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST D-1: acting as service_role was DENIED '
      '(SET ROLE not granted to runner, OR the trigger allowlist no longer includes service_role — a real regression). '
      'GRANT service_role TO <runner_user> if this is a permissions issue, else fix the trigger allowlist.';
END;
$$;

RESET ROLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST D-2: owner (postgres) bypass
--
-- The migration owner (postgres) is also in the trigger allowlist. This path
-- covers direct DB access during deployments and migration runs.
-- ─────────────────────────────────────────────────────────────────────────────

RESET ROLE;

DO $$
DECLARE
  v_weight numeric;
BEGIN
  UPDATE public.tracked_queries
  SET    weight = 51
  WHERE  id = '00000000-0000-0000-0002-000000000001'::uuid;

  SELECT weight INTO v_weight
  FROM   public.tracked_queries
  WHERE  id = '00000000-0000-0000-0002-000000000001'::uuid;

  IF v_weight <> 51 THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST D-2: postgres (owner) UPDATE weight=51 did not persist; got %', v_weight;
  END IF;

  RAISE NOTICE 'IMMUTABILITY PASS — TEST D-2: postgres (owner) UPDATE weight=51 succeeded (owner bypass confirmed)';
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Roll back everything — the DB is left in the same state it was before this
-- file ran. Seed data (auth.users, businesses, tracked_queries rows) is gone.
-- ─────────────────────────────────────────────────────────────────────────────

ROLLBACK;

SELECT 'IMMUTABILITY TESTS COMPLETE — all 7 behavioral assertions passed (A: INSERT clamp, B-1/B-2/B-3: UPDATE reject SQLSTATE=42501+phrase, C: allowed non-scoring edit, D-1: service_role bypass, D-2: owner bypass)' AS result;
