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
-- PURPOSE
-- -------
-- The smoke-tests.sql TEST 7 verifies the trigger definition (existence,
-- enabled state, tgtype bitmask). This file verifies the RUNTIME behavior:
--   TEST A — INSERT clamp: non-privileged role cannot pre-set scoring columns;
--            they are silently normalized to defaults (weight=1, intent_bucket=NULL,
--            is_branded=false) even when the caller supplies different values.
--   TEST B — UPDATE reject: non-privileged role attempting to change a scoring
--            column receives SQLSTATE '42501' (insufficient_privilege).
--   TEST C — Allowed edit: non-privileged role CAN still update non-scoring
--            columns (query_text); proves the trigger is column-scoped.
--
-- OPERATOR INSTRUCTIONS
-- ----------------------
-- Option A: Supabase branch (recommended)
--   1. supabase branches create immutability-test-<date>
--   2. Connect psql to that branch's DB.
--   3. Apply the forward migration:
--        \i apps/web/supabase/migrations/20260608000001_scan_measurement_v2.sql
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
-- Any RAISE EXCEPTION means a behavioral invariant was violated.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: minimal businesses row (FK parent for tracked_queries.business_id)
--
-- businesses NOT NULL columns (with no default): user_id, name, website_url
-- Fixed UUIDs keep the seed deterministic and easy to grep/clean.
-- ─────────────────────────────────────────────────────────────────────────────

-- A fixed UUID for the fake user (stands in for auth.users.id; no FK to auth
-- in the businesses table so this is safe on a shadow DB without real auth rows).
-- A fixed UUID for the businesses row itself.
DO $$
BEGIN
  INSERT INTO public.businesses (
    id,
    user_id,
    name,
    website_url,
    language,
    services
  ) VALUES (
    '00000000-0000-0000-0001-000000000001'::uuid,  -- business_id
    '00000000-0000-0000-0001-000000000002'::uuid,  -- fake user_id
    'Test Business (shadow DB seed)',
    'https://shadow-test.example.com',
    'en',
    '{}'
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Switch to the authenticated role to simulate a product-API user request.
-- PostgREST sets `SET LOCAL ROLE authenticated` for every authenticated request.
-- ─────────────────────────────────────────────────────────────────────────────

SET LOCAL ROLE authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST A: INSERT clamp
--
-- An authenticated owner INSERT supplying weight=99, intent_bucket='comparison',
-- is_branded=true must be silently normalized by the trigger to:
--   weight=1, intent_bucket=NULL, is_branded=false.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_id            uuid;
  v_weight        numeric;
  v_intent_bucket text;
  v_is_branded    boolean;
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
    99,              -- attacker tries to set weight to 99
    'comparison',    -- attacker tries to set intent_bucket
    true             -- attacker tries to set is_branded = true
  )
  RETURNING id INTO v_id;

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

  RAISE NOTICE 'IMMUTABILITY PASS — TEST A: INSERT scoring columns clamped to defaults (weight=1, intent_bucket=NULL, is_branded=false)';
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST B: UPDATE reject
--
-- An authenticated owner attempting UPDATE tracked_queries SET weight = 50
-- must receive SQLSTATE '42501' (insufficient_privilege).
-- The EXCEPTION handler catches 42501 → PASS; any other outcome → FAIL.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_raised boolean := false;
BEGIN
  BEGIN
    UPDATE public.tracked_queries
    SET    weight = 50
    WHERE  id = '00000000-0000-0000-0002-000000000001'::uuid;
    -- If we reach this line, no exception was raised — that is a failure.
    v_raised := false;
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- SQLSTATE '42501' maps to insufficient_privilege in PL/pgSQL EXCEPTION clauses.
      v_raised := true;
  END;

  IF NOT v_raised THEN
    RAISE EXCEPTION
      'IMMUTABILITY FAIL — TEST B: UPDATE weight=50 did not raise 42501 (insufficient_privilege); '
      'trigger may not be firing or role detection is broken';
  END IF;

  RAISE NOTICE 'IMMUTABILITY PASS — TEST B: UPDATE on weight correctly raised 42501 (insufficient_privilege)';
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
-- Restore the session role before rollback.
-- ─────────────────────────────────────────────────────────────────────────────

RESET ROLE;

-- Roll back everything — the DB is left in the same state it was in before this file ran.
ROLLBACK;

SELECT 'IMMUTABILITY TESTS COMPLETE — all 3 behavioral assertions passed (A: INSERT clamp, B: UPDATE reject 42501, C: allowed non-scoring edit)' AS result;
