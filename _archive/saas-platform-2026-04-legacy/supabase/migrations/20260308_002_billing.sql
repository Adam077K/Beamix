-- ============================================================
-- Migration 002: Billing Tables
-- Tables: credit_pools, credit_transactions
-- RPCs: hold_credits, confirm_credits, release_credits, allocate_monthly_credits
-- ============================================================

-- ============================================================
-- credit_pools
-- ============================================================
CREATE TABLE IF NOT EXISTS public.credit_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_type text NOT NULL DEFAULT 'monthly' CHECK (pool_type IN ('monthly', 'topup', 'trial')),
  base_allocation integer NOT NULL DEFAULT 0,
  rollover_amount integer NOT NULL DEFAULT 0,
  topup_amount integer NOT NULL DEFAULT 0,
  used_amount integer NOT NULL DEFAULT 0,
  held_amount integer NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL DEFAULT NOW(),
  period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pool_type)
);

DO $$ BEGIN
  ALTER TABLE public.credit_pools ADD COLUMN IF NOT EXISTS held_amount integer DEFAULT 0;
  ALTER TABLE public.credit_pools ADD COLUMN IF NOT EXISTS period_start timestamptz DEFAULT NOW();
  ALTER TABLE public.credit_pools ADD COLUMN IF NOT EXISTS period_end timestamptz;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.credit_pools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credit pools" ON public.credit_pools;
CREATE POLICY "Users can view own credit pools" ON public.credit_pools
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages credit pools" ON public.credit_pools;
CREATE POLICY "Service role manages credit pools" ON public.credit_pools
  FOR ALL USING (true);

CREATE TRIGGER set_credit_pools_updated_at
  BEFORE UPDATE ON public.credit_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- credit_transactions (immutable audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id uuid NOT NULL REFERENCES public.credit_pools(id),
  pool_type text NOT NULL DEFAULT 'monthly',
  transaction_type text NOT NULL CHECK (transaction_type IN ('allocation', 'hold', 'confirm', 'release', 'topup', 'rollover', 'expire', 'system_grant')),
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  agent_job_id uuid,
  description text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS pool_id uuid;
  ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS pool_type text DEFAULT 'monthly';
  ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS balance_after integer DEFAULT 0;
  ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS agent_job_id uuid;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_credit_txn_user_date ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_txn_job ON public.credit_transactions(agent_job_id) WHERE agent_job_id IS NOT NULL;

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages transactions" ON public.credit_transactions;
CREATE POLICY "Service role manages transactions" ON public.credit_transactions
  FOR ALL USING (true);

-- ============================================================
-- RPC: hold_credits
-- Reserves credits for an in-progress agent job
-- ============================================================
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

  -- Lock and compute available credits across all pools
  SELECT id, base_allocation + rollover_amount + topup_amount - used_amount - held_amount AS available
  INTO v_pool
  FROM credit_pools
  WHERE user_id = p_user_id
  ORDER BY
    CASE pool_type WHEN 'monthly' THEN 1 WHEN 'trial' THEN 2 WHEN 'topup' THEN 3 END
  FOR UPDATE;

  -- Sum available across all pools
  SELECT COALESCE(SUM(base_allocation + rollover_amount + topup_amount - used_amount - held_amount), 0)
  INTO v_available
  FROM credit_pools
  WHERE user_id = p_user_id;

  IF v_available < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_credits');
  END IF;

  -- Deduct from first pool with availability (monthly first)
  FOR v_pool IN
    SELECT id, pool_type, base_allocation + rollover_amount + topup_amount - used_amount - held_amount AS available
    FROM credit_pools
    WHERE user_id = p_user_id AND (base_allocation + rollover_amount + topup_amount - used_amount - held_amount) > 0
    ORDER BY CASE pool_type WHEN 'monthly' THEN 1 WHEN 'trial' THEN 2 WHEN 'topup' THEN 3 END
    FOR UPDATE
  LOOP
    EXIT WHEN p_amount <= 0;

    DECLARE
      v_deduct integer := LEAST(p_amount, v_pool.available);
    BEGIN
      UPDATE credit_pools SET held_amount = held_amount + v_deduct WHERE id = v_pool.id;

      -- Compute balance after
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

-- ============================================================
-- RPC: confirm_credits
-- Moves held credits to consumed after successful agent completion
-- ============================================================
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

-- ============================================================
-- RPC: release_credits
-- Releases held credits back to available after failure/cancellation
-- ============================================================
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
-- RPC: allocate_monthly_credits
-- Called by monthly cron to allocate new monthly credits
-- ============================================================
CREATE OR REPLACE FUNCTION public.allocate_monthly_credits(
  p_user_id uuid,
  p_plan_id uuid
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

  -- Get plan details
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
    VALUES (p_user_id, 'monthly', v_plan.monthly_agent_uses, NOW(), (date_trunc('month', NOW()) + INTERVAL '1 month'))
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
        period_start = NOW(),
        period_end = date_trunc('month', NOW()) + INTERVAL '1 month'
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
