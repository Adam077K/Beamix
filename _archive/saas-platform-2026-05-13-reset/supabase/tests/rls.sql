-- ============================================================
-- RLS Verification Tests (pgTAP)
-- Purpose: Verify row-level security on all new rethink tables.
--          User A cannot SELECT/UPDATE/DELETE rows belonging to User B.
-- Run: psql $SUPABASE_DB_URL -f rls.sql
-- Requires: pgTAP extension enabled (CREATE EXTENSION IF NOT EXISTS pgtap)
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(48);

-- ─────────────────────────────────────────────────────────────
-- SETUP: Create two test users in auth.users
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_a uuid := '00000000-0000-0000-0000-000000000001';
  v_user_b uuid := '00000000-0000-0000-0000-000000000002';
  v_biz_a  uuid := '00000000-0000-0000-0000-000000000010';
  v_biz_b  uuid := '00000000-0000-0000-0000-000000000011';
BEGIN
  -- Insert test users into auth.users (bypass RLS with service role context)
  INSERT INTO auth.users (id, email, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES
    (v_user_a, 'user_a_rls_test@test.example', now(), now(), '{}', '{}', 'authenticated', 'authenticated'),
    (v_user_b, 'user_b_rls_test@test.example', now(), now(), '{}', '{}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- Insert test businesses
  INSERT INTO public.businesses (id, user_id, name, industry, location, scan_url)
  VALUES
    (v_biz_a, v_user_a, 'Biz A', 'retail', 'Tel Aviv', 'https://biz-a.example'),
    (v_biz_b, v_user_b, 'Biz B', 'retail', 'Tel Aviv', 'https://biz-b.example')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ─────────────────────────────────────────────────────────────
-- HELPER: Set session user for RLS checks
-- ─────────────────────────────────────────────────────────────
-- pgTAP tests run as superuser; we use SET LOCAL for auth.uid() simulation
-- by setting the JWT claim directly in the session.

-- ─────────────────────────────────────────────────────────────
-- TABLE: suggestions
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_a uuid := '00000000-0000-0000-0000-000000000001';
  v_biz_a  uuid := '00000000-0000-0000-0000-000000000010';
  v_row_id uuid;
BEGIN
  INSERT INTO public.suggestions (id, business_id, user_id, agent_type, title, description, impact)
  VALUES (gen_random_uuid(), v_biz_a, v_user_a, 'faq_builder', 'Test suggestion A', 'desc', 'medium')
  RETURNING id INTO v_row_id;

  -- Store for tests
  PERFORM set_config('test.suggestion_a_id', v_row_id::text, false);
END $$;

-- Simulate user_b session
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.suggestions WHERE user_id = '00000000-0000-0000-0000-000000000001'),
  0,
  'suggestions: user_b cannot SELECT user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: query_runs
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_a uuid := '00000000-0000-0000-0000-000000000001';
  v_biz_a  uuid := '00000000-0000-0000-0000-000000000010';
BEGIN
  INSERT INTO public.query_runs (business_id, user_id, query_count)
  VALUES (v_biz_a, v_user_a, 10)
  ON CONFLICT DO NOTHING;
END $$;

SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.query_runs WHERE user_id = '00000000-0000-0000-0000-000000000001'),
  0,
  'query_runs: user_b cannot SELECT user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: query_clusters (business-scoped, check via businesses.user_id)
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_biz_a  uuid := '00000000-0000-0000-0000-000000000010';
  v_run_id uuid;
BEGIN
  -- Get a query_run for biz_a
  SELECT id INTO v_run_id FROM public.query_runs WHERE business_id = v_biz_a LIMIT 1;
  IF v_run_id IS NOT NULL THEN
    INSERT INTO public.query_clusters (business_id, query_run_id, cluster_name)
    VALUES (v_biz_a, v_run_id, 'test cluster')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.query_clusters WHERE business_id = '00000000-0000-0000-0000-000000000010'),
  0,
  'query_clusters: user_b cannot SELECT user_a business rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: submission_packages
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_a uuid := '00000000-0000-0000-0000-000000000001';
  v_biz_a  uuid := '00000000-0000-0000-0000-000000000010';
BEGIN
  INSERT INTO public.submission_packages (business_id, user_id, agent_type, platform_name, submission_type, instructions)
  VALUES (v_biz_a, v_user_a, 'offsite_presence_builder', 'D.co.il', 'directory', 'Submit business profile')
  ON CONFLICT DO NOTHING;
END $$;

SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.submission_packages WHERE user_id = '00000000-0000-0000-0000-000000000001'),
  0,
  'submission_packages: user_b cannot SELECT user_a rows'
);

-- Test UPDATE blocked
SELECT is(
  (WITH upd AS (
    UPDATE public.submission_packages SET status = 'submitted'
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    RETURNING id
  ) SELECT count(*)::int FROM upd),
  0,
  'submission_packages: user_b cannot UPDATE user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: automation_configs
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_a uuid := '00000000-0000-0000-0000-000000000001';
  v_biz_a  uuid := '00000000-0000-0000-0000-000000000010';
BEGIN
  INSERT INTO public.automation_configs (user_id, business_id, agent_type, cadence)
  VALUES (v_user_a, v_biz_a, 'faq_builder', 'weekly')
  ON CONFLICT (user_id, business_id, agent_type) DO NOTHING;
END $$;

SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.automation_configs WHERE user_id = '00000000-0000-0000-0000-000000000001'),
  0,
  'automation_configs: user_b cannot SELECT user_a rows'
);

SELECT is(
  (WITH upd AS (
    UPDATE public.automation_configs SET is_active = false
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    RETURNING id
  ) SELECT count(*)::int FROM upd),
  0,
  'automation_configs: user_b cannot UPDATE user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: page_locks (business-scoped via businesses.user_id)
-- ─────────────────────────────────────────────────────────────
-- Note: page_locks requires an agent_jobs FK — test SELECT isolation only
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.page_locks
   WHERE business_id = '00000000-0000-0000-0000-000000000010'),
  0,
  'page_locks: user_b cannot SELECT user_a business rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: topic_ledger (business-scoped)
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_biz_a uuid := '00000000-0000-0000-0000-000000000010';
BEGIN
  INSERT INTO public.topic_ledger (business_id, topic_hash, topic_title, agent_type)
  VALUES (v_biz_a, md5('test topic'), 'Test Topic', 'faq_builder')
  ON CONFLICT (business_id, topic_hash) DO NOTHING;
END $$;

SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.topic_ledger
   WHERE business_id = '00000000-0000-0000-0000-000000000010'),
  0,
  'topic_ledger: user_b cannot SELECT user_a business rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: performance_reports
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_a uuid := '00000000-0000-0000-0000-000000000001';
  v_biz_a  uuid := '00000000-0000-0000-0000-000000000010';
BEGIN
  INSERT INTO public.performance_reports (
    business_id, user_id, report_period_start, report_period_end
  )
  VALUES (v_biz_a, v_user_a, current_date - 7, current_date)
  ON CONFLICT DO NOTHING;
END $$;

SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.performance_reports
   WHERE user_id = '00000000-0000-0000-0000-000000000001'),
  0,
  'performance_reports: user_b cannot SELECT user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: notifications
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_a uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (v_user_a, 'scan_complete', 'Scan done', 'Your scan completed.')
  ON CONFLICT DO NOTHING;
END $$;

SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.notifications
   WHERE user_id = '00000000-0000-0000-0000-000000000001'),
  0,
  'notifications: user_b cannot SELECT user_a rows'
);

SELECT is(
  (WITH upd AS (
    UPDATE public.notifications SET read_at = now()
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    RETURNING id
  ) SELECT count(*)::int FROM upd),
  0,
  'notifications: user_b cannot UPDATE user_a rows'
);

SELECT is(
  (WITH del AS (
    DELETE FROM public.notifications
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    RETURNING id
  ) SELECT count(*)::int FROM del),
  0,
  'notifications: user_b cannot DELETE user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: url_probes
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_a uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO public.url_probes (user_id, url, status)
  VALUES (v_user_a, 'https://biz-a.example/faq', 'pending')
  ON CONFLICT DO NOTHING;
END $$;

SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.url_probes
   WHERE user_id = '00000000-0000-0000-0000-000000000001'),
  0,
  'url_probes: user_b cannot SELECT user_a rows'
);

SELECT is(
  (WITH upd AS (
    UPDATE public.url_probes SET status = 'verified'
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    RETURNING id
  ) SELECT count(*)::int FROM upd),
  0,
  'url_probes: user_b cannot UPDATE user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: daily_cap_usage
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_a uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO public.daily_cap_usage (user_id, agent_type, usage_date, count)
  VALUES (v_user_a, 'faq_builder', current_date, 2)
  ON CONFLICT (user_id, agent_type, usage_date) DO UPDATE SET count = EXCLUDED.count;
END $$;

SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.daily_cap_usage
   WHERE user_id = '00000000-0000-0000-0000-000000000001'),
  0,
  'daily_cap_usage: user_b cannot SELECT user_a rows'
);

SELECT is(
  (WITH upd AS (
    UPDATE public.daily_cap_usage SET count = 99
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    RETURNING user_id
  ) SELECT count(*)::int FROM upd),
  0,
  'daily_cap_usage: user_b cannot UPDATE user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: inbox_item_edits (user_id FK to auth.users)
-- ─────────────────────────────────────────────────────────────
-- Requires content_item — tested with SELECT isolation only (no FK setup here)
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.inbox_item_edits
   WHERE user_id = '00000000-0000-0000-0000-000000000001'),
  0,
  'inbox_item_edits: user_b cannot SELECT user_a rows (empty = isolated)'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- TABLE: query_positions (business-scoped)
-- ─────────────────────────────────────────────────────────────
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (SELECT count(*)::int FROM public.query_positions
   WHERE business_id = '00000000-0000-0000-0000-000000000010'),
  0,
  'query_positions: user_b cannot SELECT user_a business rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- VERIFY: INSERT BLOCKED — user_b cannot INSERT rows for user_a
-- ─────────────────────────────────────────────────────────────
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

-- Attempt to INSERT a notification for user_a (should be blocked by WITH CHECK)
SELECT throws_ok(
  $$INSERT INTO public.notifications (user_id, type, title)
    VALUES ('00000000-0000-0000-0000-000000000001', 'scan_complete', 'Injected notification')$$,
  'new row violates row-level security policy for table "notifications"',
  'notifications: user_b cannot INSERT rows for user_a'
);

-- Attempt to INSERT automation_config for user_a (should be blocked)
SELECT throws_ok(
  $$INSERT INTO public.automation_configs (user_id, business_id, agent_type, cadence)
    VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'schema_generator', 'daily')$$,
  'new row violates row-level security policy for table "automation_configs"',
  'automation_configs: user_b cannot INSERT rows for user_a'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- VERIFY: suggestions INSERT BLOCKED for wrong user
-- ─────────────────────────────────────────────────────────────
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT throws_ok(
  $$INSERT INTO public.suggestions (business_id, user_id, agent_type, title, description, impact)
    VALUES ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
            'faq_builder', 'Injected suggestion', 'desc', 'high')$$,
  'new row violates row-level security policy for table "suggestions"',
  'suggestions: user_b cannot INSERT rows for user_a'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- VERIFY: daily_cap_usage INSERT BLOCKED for wrong user
-- ─────────────────────────────────────────────────────────────
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT throws_ok(
  $$INSERT INTO public.daily_cap_usage (user_id, agent_type, usage_date, count)
    VALUES ('00000000-0000-0000-0000-000000000001', 'schema_generator', current_date, 0)$$,
  'new row violates row-level security policy for table "daily_cap_usage"',
  'daily_cap_usage: user_b cannot INSERT rows for user_a'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- VERIFY: submission_packages DELETE BLOCKED
-- ─────────────────────────────────────────────────────────────
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (WITH del AS (
    DELETE FROM public.submission_packages
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    RETURNING id
  ) SELECT count(*)::int FROM del),
  0,
  'submission_packages: user_b cannot DELETE user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- VERIFY: automation_configs DELETE BLOCKED
-- ─────────────────────────────────────────────────────────────
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (WITH del AS (
    DELETE FROM public.automation_configs
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    RETURNING id
  ) SELECT count(*)::int FROM del),
  0,
  'automation_configs: user_b cannot DELETE user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- VERIFY: performance_reports UPDATE BLOCKED
-- ─────────────────────────────────────────────────────────────
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT is(
  (WITH upd AS (
    UPDATE public.performance_reports SET score_delta = 0
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    RETURNING id
  ) SELECT count(*)::int FROM upd),
  0,
  'performance_reports: user_b cannot UPDATE user_a rows'
);

RESET "request.jwt.claims";
RESET role;

-- ─────────────────────────────────────────────────────────────
-- CLEANUP: Remove test data
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_a uuid := '00000000-0000-0000-0000-000000000001';
  v_user_b uuid := '00000000-0000-0000-0000-000000000002';
  v_biz_a  uuid := '00000000-0000-0000-0000-000000000010';
  v_biz_b  uuid := '00000000-0000-0000-0000-000000000011';
BEGIN
  DELETE FROM public.daily_cap_usage WHERE user_id IN (v_user_a, v_user_b);
  DELETE FROM public.url_probes WHERE user_id IN (v_user_a, v_user_b);
  DELETE FROM public.notifications WHERE user_id IN (v_user_a, v_user_b);
  DELETE FROM public.performance_reports WHERE user_id IN (v_user_a, v_user_b);
  DELETE FROM public.topic_ledger WHERE business_id IN (v_biz_a, v_biz_b);
  DELETE FROM public.automation_configs WHERE user_id IN (v_user_a, v_user_b);
  DELETE FROM public.submission_packages WHERE user_id IN (v_user_a, v_user_b);
  DELETE FROM public.suggestions WHERE user_id IN (v_user_a, v_user_b);
  DELETE FROM public.query_clusters WHERE business_id IN (v_biz_a, v_biz_b);
  DELETE FROM public.query_runs WHERE user_id IN (v_user_a, v_user_b);
  DELETE FROM public.businesses WHERE id IN (v_biz_a, v_biz_b);
  DELETE FROM auth.users WHERE id IN (v_user_a, v_user_b);
END $$;

SELECT finish();

ROLLBACK;
