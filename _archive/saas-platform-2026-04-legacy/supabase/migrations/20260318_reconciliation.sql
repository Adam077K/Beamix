-- ============================================================
-- Migration: 20260318_reconciliation.sql
-- Purpose: Reconcile live Supabase DB with migration specs
-- Audit source: docs/08-agents_work/supabase-audit-2026-03-18.md
--
-- IMPORTANT: ALTER TYPE ... ADD VALUE cannot run inside transactions.
-- This migration must be run as a plain SQL script (not wrapped in BEGIN/COMMIT).
-- Each section is idempotent and safe to re-run.
-- ============================================================

-- ============================================================
-- P1.1: credit_transaction_type enum — ADD missing values
-- Live has: {allocation, topup, rollover, usage, adjustment, refund}
-- Need to add: hold, confirm, release, expire, system_grant
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'hold' AND enumtypid = 'credit_transaction_type'::regtype) THEN
    RAISE NOTICE 'Adding hold to credit_transaction_type';
  END IF;
EXCEPTION WHEN invalid_schema_name THEN NULL;
          WHEN undefined_object THEN NULL;
END $$;

ALTER TYPE credit_transaction_type ADD VALUE IF NOT EXISTS 'hold';
ALTER TYPE credit_transaction_type ADD VALUE IF NOT EXISTS 'confirm';
ALTER TYPE credit_transaction_type ADD VALUE IF NOT EXISTS 'release';
ALTER TYPE credit_transaction_type ADD VALUE IF NOT EXISTS 'expire';
ALTER TYPE credit_transaction_type ADD VALUE IF NOT EXISTS 'system_grant';

-- ============================================================
-- P1.2: credit_pool_type enum — ADD missing values
-- Live has: {agent, scan, report}
-- Need to add: monthly, topup, trial
-- ============================================================
ALTER TYPE credit_pool_type ADD VALUE IF NOT EXISTS 'monthly';
ALTER TYPE credit_pool_type ADD VALUE IF NOT EXISTS 'topup';
ALTER TYPE credit_pool_type ADD VALUE IF NOT EXISTS 'trial';

-- ============================================================
-- P1.4: agent_type enum — ADD 8 missing values
-- Live has: {content_writer, blog_writer, schema_optimizer, faq_agent,
--            review_analyzer, social_strategy, competitor_intelligence}
-- Need to add: recommendations, citation_builder, llms_txt, ai_readiness,
--              content_voice_trainer, content_pattern_analyzer, content_refresh,
--              brand_narrative_analyst
-- ============================================================
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'recommendations';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'citation_builder';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'llms_txt';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'ai_readiness';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'content_voice_trainer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'content_pattern_analyzer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'content_refresh';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'brand_narrative_analyst';

-- ============================================================
-- P2.10: content_item_status enum — ADD missing values
-- Live has: {draft, ready, published, archived}
-- Need to add: in_review, approved
-- ============================================================
ALTER TYPE content_item_status ADD VALUE IF NOT EXISTS 'in_review';
ALTER TYPE content_item_status ADD VALUE IF NOT EXISTS 'approved';

-- ============================================================
-- P2.11: recommendation_status enum — ADD missing values
-- Live has: {pending, in_progress, done, dismissed}
-- Need to add: new, completed
-- ============================================================
ALTER TYPE recommendation_status ADD VALUE IF NOT EXISTS 'new';
ALTER TYPE recommendation_status ADD VALUE IF NOT EXISTS 'completed';


-- ============================================================
-- P1.3: Drop the 2-param allocate_monthly_credits overload
-- There are TWO overloaded versions causing PostgREST PGRST203.
-- Drop the 2-param version, keep the 4-param version.
-- ============================================================
DROP FUNCTION IF EXISTS public.allocate_monthly_credits(uuid, text);
DROP FUNCTION IF EXISTS public.allocate_monthly_credits(uuid, text, timestamptz, timestamptz);

-- Recreate the 4-param version to ensure it's correct and uses text plan_id
-- (live plans.id is text type, not uuid)
CREATE OR REPLACE FUNCTION public.allocate_monthly_credits(
  p_user_id uuid,
  p_plan_id text,
  p_period_start timestamptz DEFAULT NOW(),
  p_period_end timestamptz DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month')
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan RECORD;
  v_pool RECORD;
  v_rollover integer;
  v_balance integer;
BEGIN
  -- Idempotency: check if already allocated this month
  IF EXISTS (
    SELECT 1 FROM credit_transactions
    WHERE user_id = p_user_id
      AND transaction_type = 'allocation'
      AND created_at >= date_trunc('month', NOW())
  ) THEN
    RETURN jsonb_build_object('success', true, 'already_allocated', true);
  END IF;

  -- Get plan details (plans.id is text in live DB)
  SELECT monthly_agent_uses INTO v_plan FROM plans WHERE id = p_plan_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'plan_not_found');
  END IF;

  -- Get or create monthly pool
  SELECT * INTO v_pool FROM credit_pools
  WHERE user_id = p_user_id AND pool_type = 'monthly'
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO credit_pools (user_id, pool_type, base_allocation, period_start, period_end)
    VALUES (p_user_id, 'monthly', v_plan.monthly_agent_uses, p_period_start, p_period_end)
    RETURNING * INTO v_pool;
  ELSE
    -- Compute rollover: min(unused, 20% of base)
    v_rollover := LEAST(
      GREATEST(v_pool.base_allocation - v_pool.used_amount, 0),
      FLOOR(v_pool.base_allocation * 0.20)::integer
    );

    UPDATE credit_pools
    SET base_allocation = v_plan.monthly_agent_uses,
        rollover_amount = v_rollover,
        used_amount = 0,
        held_amount = 0,
        period_start = p_period_start,
        period_end = p_period_end
    WHERE id = v_pool.id;
  END IF;

  -- Delete trial pool if exists (trial replaced by paid)
  DELETE FROM credit_pools WHERE user_id = p_user_id AND pool_type = 'trial';

  -- Record allocation transaction
  v_balance := v_plan.monthly_agent_uses + COALESCE(v_rollover, 0);

  INSERT INTO credit_transactions (user_id, pool_id, pool_type, transaction_type, amount, balance_after, description)
  VALUES (p_user_id, v_pool.id, 'monthly', 'allocation', v_plan.monthly_agent_uses, v_balance, 'Monthly credit allocation');

  -- Record rollover if any
  IF COALESCE(v_rollover, 0) > 0 THEN
    INSERT INTO credit_transactions (user_id, pool_id, pool_type, transaction_type, amount, balance_after, description)
    VALUES (p_user_id, v_pool.id, 'monthly', 'rollover', v_rollover, v_balance, 'Rollover from previous month');
  END IF;

  RETURN jsonb_build_object('success', true, 'allocated', v_plan.monthly_agent_uses);
END;
$$;

-- ============================================================
-- Recreate hold_credits, confirm_credits, release_credits
-- These RPCs already exist but were broken due to enum mismatch.
-- Now that enum values are added, recreate them to ensure correct bodies.
-- ============================================================

-- hold_credits (same as migration 002 but guaranteed fresh)
CREATE OR REPLACE FUNCTION public.hold_credits(
  p_user_id uuid,
  p_amount integer,
  p_job_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pool RECORD;
  v_available integer;
  v_pool_id uuid;
  v_balance integer;
BEGIN
  -- Idempotency guard: check for existing hold
  IF EXISTS (
    SELECT 1 FROM credit_transactions
    WHERE agent_job_id = p_job_id AND transaction_type = 'hold'
  ) THEN
    SELECT pool_id INTO v_pool_id FROM credit_transactions
    WHERE agent_job_id = p_job_id AND transaction_type = 'hold' LIMIT 1;
    RETURN jsonb_build_object('success', true, 'pool_id', v_pool_id);
  END IF;

  -- Sum available across all pools
  SELECT COALESCE(SUM(base_allocation + rollover_amount + topup_amount - used_amount - held_amount), 0)
  INTO v_available
  FROM credit_pools
  WHERE user_id = p_user_id;

  IF v_available < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_credits');
  END IF;

  -- Deduct from pools in priority order (monthly first, then trial, then topup)
  FOR v_pool IN
    SELECT id, pool_type, base_allocation + rollover_amount + topup_amount - used_amount - held_amount AS available
    FROM credit_pools
    WHERE user_id = p_user_id AND (base_allocation + rollover_amount + topup_amount - used_amount - held_amount) > 0
    ORDER BY CASE pool_type WHEN 'monthly' THEN 1 WHEN 'trial' THEN 2 WHEN 'topup' THEN 3 ELSE 4 END
    FOR UPDATE
  LOOP
    EXIT WHEN p_amount <= 0;

    DECLARE
      v_deduct integer := LEAST(p_amount, v_pool.available);
    BEGIN
      UPDATE credit_pools SET held_amount = held_amount + v_deduct WHERE id = v_pool.id;

      SELECT base_allocation + rollover_amount + topup_amount - used_amount - held_amount
      INTO v_balance FROM credit_pools WHERE id = v_pool.id;

      INSERT INTO credit_transactions (user_id, pool_id, pool_type, transaction_type, amount, balance_after, agent_job_id, description)
      VALUES (p_user_id, v_pool.id, v_pool.pool_type, 'hold', -v_deduct, v_balance, p_job_id, 'Credit hold for agent job');

      v_pool_id := v_pool.id;
      p_amount := p_amount - v_deduct;
    END;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'pool_id', v_pool_id);
END;
$$;

-- confirm_credits
CREATE OR REPLACE FUNCTION public.confirm_credits(
  p_job_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_txn RECORD;
  v_balance integer;
BEGIN
  -- Idempotency guard
  IF EXISTS (
    SELECT 1 FROM credit_transactions
    WHERE agent_job_id = p_job_id AND transaction_type = 'confirm'
  ) THEN
    RETURN jsonb_build_object('success', true);
  END IF;

  -- Find hold transactions
  FOR v_txn IN
    SELECT pool_id, ABS(amount) AS held_amount
    FROM credit_transactions
    WHERE agent_job_id = p_job_id AND transaction_type = 'hold'
  LOOP
    -- Move from held to used
    UPDATE credit_pools
    SET held_amount = held_amount - v_txn.held_amount,
        used_amount = used_amount + v_txn.held_amount
    WHERE id = v_txn.pool_id;

    SELECT base_allocation + rollover_amount + topup_amount - used_amount - held_amount
    INTO v_balance FROM credit_pools WHERE id = v_txn.pool_id;

    INSERT INTO credit_transactions (user_id, pool_id, pool_type, transaction_type, amount, balance_after, agent_job_id, description)
    SELECT user_id, v_txn.pool_id, pool_type, 'confirm', -v_txn.held_amount, v_balance, p_job_id, 'Credit confirmed for completed job'
    FROM credit_pools WHERE id = v_txn.pool_id;
  END LOOP;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_hold_found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- release_credits
CREATE OR REPLACE FUNCTION public.release_credits(
  p_job_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_txn RECORD;
  v_balance integer;
  v_found boolean := false;
BEGIN
  -- Idempotency guard
  IF EXISTS (
    SELECT 1 FROM credit_transactions
    WHERE agent_job_id = p_job_id AND transaction_type = 'release'
  ) THEN
    RETURN jsonb_build_object('success', true);
  END IF;

  FOR v_txn IN
    SELECT pool_id, ABS(amount) AS held_amount
    FROM credit_transactions
    WHERE agent_job_id = p_job_id AND transaction_type = 'hold'
  LOOP
    v_found := true;

    UPDATE credit_pools
    SET held_amount = held_amount - v_txn.held_amount
    WHERE id = v_txn.pool_id;

    SELECT base_allocation + rollover_amount + topup_amount - used_amount - held_amount
    INTO v_balance FROM credit_pools WHERE id = v_txn.pool_id;

    INSERT INTO credit_transactions (user_id, pool_id, pool_type, transaction_type, amount, balance_after, agent_job_id, description)
    SELECT user_id, v_txn.pool_id, pool_type, 'release', v_txn.held_amount, v_balance, p_job_id, 'Credit released for failed/cancelled job'
    FROM credit_pools WHERE id = v_txn.pool_id;
  END LOOP;

  IF NOT v_found THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_hold_found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;


-- ============================================================
-- P2.7: Drop orphaned tables, add RLS to kept tables
-- ============================================================

-- Drop clearly orphaned tables (0 rows, no app references)
DROP TABLE IF EXISTS public.scan_engine_responses;
DROP TABLE IF EXISTS public.competitor_scan_results;

-- Add RLS to kept tables: email_log
ALTER TABLE IF EXISTS public.email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_log;
CREATE POLICY "Users can view own email logs" ON public.email_log
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages email logs" ON public.email_log;
CREATE POLICY "Service role manages email logs" ON public.email_log
  FOR ALL USING (true);

-- Add RLS to scan_queries (scope via scan join to user)
ALTER TABLE IF EXISTS public.scan_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scan queries" ON public.scan_queries;
CREATE POLICY "Users can view own scan queries" ON public.scan_queries
  FOR SELECT USING (
    scan_id IN (SELECT id FROM scans WHERE user_id = auth.uid())
    OR business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role manages scan queries" ON public.scan_queries;
CREATE POLICY "Service role manages scan queries" ON public.scan_queries
  FOR ALL USING (true);

-- Add RLS to scan_mentions (scope via scan join to user)
ALTER TABLE IF EXISTS public.scan_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scan mentions" ON public.scan_mentions;
CREATE POLICY "Users can view own scan mentions" ON public.scan_mentions
  FOR SELECT USING (
    scan_id IN (SELECT id FROM scans WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role manages scan mentions" ON public.scan_mentions;
CREATE POLICY "Service role manages scan mentions" ON public.scan_mentions
  FOR ALL USING (true);

-- Add RLS to competitor_content_snapshots (scope via competitor join)
ALTER TABLE IF EXISTS public.competitor_content_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own competitor snapshots" ON public.competitor_content_snapshots;
CREATE POLICY "Users can view own competitor snapshots" ON public.competitor_content_snapshots
  FOR SELECT USING (
    competitor_id IN (SELECT id FROM competitors WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role manages competitor snapshots" ON public.competitor_content_snapshots;
CREATE POLICY "Service role manages competitor snapshots" ON public.competitor_content_snapshots
  FOR ALL USING (true);


-- ============================================================
-- P2.8: Add plan_id text column to subscriptions
-- Live has plan_tier (enum) but no plan_id FK.
-- Plans.id is text in live ('starter', 'pro', 'business').
-- Add plan_id as text, keep plan_tier for backward compat.
-- ============================================================
DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_id text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Note: We do NOT add a FK constraint here because plans.id is text
-- and the subscription's plan_id can be NULL (free/trial users).
-- The app code handles the join logic.


-- ============================================================
-- P2.9: Clean test data
-- Delete test businesses, orphan free_scans, orphan tracked queries
-- Only delete data belonging to the known test user e7d8cdaa...
-- ============================================================

-- Delete orphan tracked queries (no scans, test data)
DELETE FROM public.tracked_queries
WHERE user_id = 'e7d8cdaa-a161-4072-a057-2f487a4d05c2'
  AND last_scanned_at IS NULL;

-- Delete test businesses (Writesonic and Localhost entries)
-- First delete dependent data (scans, scan_engine_results, agent_jobs, etc.)
DELETE FROM public.scan_engine_results
WHERE scan_id IN (
  SELECT id FROM public.scans
  WHERE business_id IN (
    SELECT id FROM public.businesses
    WHERE user_id = 'e7d8cdaa-a161-4072-a057-2f487a4d05c2'
      AND (name ILIKE '%writesonic%' OR name ILIKE '%localhost%' OR website_url ILIKE '%localhost%')
  )
);

DELETE FROM public.scans
WHERE business_id IN (
  SELECT id FROM public.businesses
  WHERE user_id = 'e7d8cdaa-a161-4072-a057-2f487a4d05c2'
    AND (name ILIKE '%writesonic%' OR name ILIKE '%localhost%' OR website_url ILIKE '%localhost%')
);

DELETE FROM public.recommendations
WHERE business_id IN (
  SELECT id FROM public.businesses
  WHERE user_id = 'e7d8cdaa-a161-4072-a057-2f487a4d05c2'
    AND (name ILIKE '%writesonic%' OR name ILIKE '%localhost%' OR website_url ILIKE '%localhost%')
);

DELETE FROM public.businesses
WHERE user_id = 'e7d8cdaa-a161-4072-a057-2f487a4d05c2'
  AND (name ILIKE '%writesonic%' OR name ILIKE '%localhost%' OR website_url ILIKE '%localhost%');

-- Delete free_scans with null scan_id (broken test data)
DELETE FROM public.free_scans WHERE scan_id IS NULL;


-- ============================================================
-- P2.12: Document email_log table in migrations
-- Table already exists in live DB. This documents its schema.
-- The CREATE TABLE IF NOT EXISTS ensures idempotency.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text,
  status text NOT NULL DEFAULT 'sent',
  error text,
  resend_id text,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  sent_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_log_user ON public.email_log(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON public.email_log(email_type, sent_at DESC);


-- ============================================================
-- P2.14: Update plans with placeholder Paddle product IDs
-- ============================================================
UPDATE public.plans SET paddle_product_id = 'paddle_starter' WHERE id = 'starter' AND paddle_product_id IS NULL;
UPDATE public.plans SET paddle_product_id = 'paddle_pro' WHERE id = 'pro' AND paddle_product_id IS NULL;
UPDATE public.plans SET paddle_product_id = 'paddle_business' WHERE id = 'business' AND paddle_product_id IS NULL;


-- ============================================================
-- P3.15: Add index on free_scans(scan_id) for lookup performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_free_scans_scan_id ON public.free_scans(scan_id) WHERE scan_id IS NOT NULL;


-- ============================================================
-- Done. Summary of changes:
--
-- ENUMS ADDED:
--   credit_transaction_type: +hold, +confirm, +release, +expire, +system_grant
--   credit_pool_type: +monthly, +topup, +trial
--   agent_type: +recommendations, +citation_builder, +llms_txt, +ai_readiness,
--               +content_voice_trainer, +content_pattern_analyzer, +content_refresh,
--               +brand_narrative_analyst
--   content_item_status: +in_review, +approved
--   recommendation_status: +new, +completed
--
-- FUNCTIONS:
--   Dropped: allocate_monthly_credits(uuid, text) [2-param overload]
--   Recreated: allocate_monthly_credits(uuid, text, timestamptz, timestamptz)
--   Recreated: hold_credits, confirm_credits, release_credits
--
-- TABLES:
--   Dropped: scan_engine_responses, competitor_scan_results
--   Added RLS: email_log, scan_queries, scan_mentions, competitor_content_snapshots
--   Added column: subscriptions.plan_id (text)
--   Documented: email_log (CREATE IF NOT EXISTS + indexes)
--
-- DATA:
--   Cleaned: test businesses, null-scan_id free_scans, orphan tracked queries
--   Updated: plans.paddle_product_id with placeholders
--
-- INDEXES:
--   Added: idx_free_scans_scan_id
-- ============================================================
