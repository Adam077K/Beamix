-- Migration 11: RPCs (LANGUAGE sql + CTEs only; no plpgsql DECLARE)
-- Rollback: DROP FUNCTION for each function listed below

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. record_webhook_event
--    Idempotent insert of Paddle webhook events. Returns the event_id row id.
--    paddle_webhook_events PK is event_id (text), so ON CONFLICT returns nothing;
--    we return NULL on conflict (idempotent = already recorded = no-op is correct).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_webhook_event(
  p_event_id   text,
  p_event_type text,
  p_payload    jsonb
) RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO paddle_webhook_events (event_id, event_type, payload)
  VALUES (p_event_id, p_event_type, p_payload)
  ON CONFLICT (event_id) DO NOTHING
  RETURNING event_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. allocate_monthly_credits
--    Idempotent: inserts a credit_pool row for (user_id, plan_id, billing_period_start).
--    Returns the pool id (existing or newly created).
--    Unique constraint on credit_pools: (user_id, plan_id, billing_period_start)
--    plans.monthly_credits is the allocation column.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.allocate_monthly_credits(
  p_user_id              uuid,
  p_plan_id              uuid,
  p_billing_period_start timestamptz
) RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH plan AS (
    SELECT monthly_credits
    FROM   plans
    WHERE  id = p_plan_id
  ),
  inserted AS (
    INSERT INTO credit_pools (user_id, plan_id, billing_period_start, base_allocation)
    SELECT p_user_id, p_plan_id, p_billing_period_start, plan.monthly_credits
    FROM   plan
    ON CONFLICT (user_id, plan_id, billing_period_start) DO NOTHING
    RETURNING id
  )
  SELECT id FROM inserted
  UNION ALL
  SELECT id FROM credit_pools
  WHERE  user_id              = p_user_id
    AND  plan_id              = p_plan_id
    AND  billing_period_start = p_billing_period_start
  LIMIT 1;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. hold_credits
--    Checks available balance in credit_pools, then marks a credit_hold.
--    credit_holds schema (from 04_credits.sql):
--      job_id uuid PK, user_id, amount, agent_type, held_at, expires_at,
--      confirmed boolean DEFAULT false, released boolean DEFAULT false
--    Returns jsonb: { "held": bool, "reason": text }
--    NOTE: credit_holds has no pool_id — hold is linked to user via user_id only.
--    NOTE: daily_cap_usage unique key is (user_id, agent_type, usage_date);
--          agent_type is required to log correctly. p_agent_type passed in.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.hold_credits(
  p_user_id    uuid,
  p_amount     int,
  p_job_id     uuid,
  p_agent_type agent_type
) RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH pool AS (
    -- Lock the pool row to prevent TOCTOU races
    SELECT id,
           (base_allocation + rollover_amount + topup_amount - used_amount) AS available
    FROM   credit_pools
    WHERE  user_id = p_user_id
      AND  billing_period_start <= now()
      AND  (billing_period_start + interval '1 month') > now()
    ORDER  BY billing_period_start DESC
    LIMIT  1
    FOR UPDATE
  ),
  do_hold AS (
    INSERT INTO credit_holds (job_id, user_id, amount, agent_type)
    SELECT p_job_id, p_user_id, p_amount, p_agent_type
    FROM   pool
    WHERE  pool.available >= p_amount
      AND  NOT EXISTS (
        SELECT 1 FROM credit_holds WHERE job_id = p_job_id
      )
    RETURNING job_id
  ),
  bump_pool AS (
    UPDATE credit_pools
    SET    used_amount = used_amount + p_amount,
           updated_at  = now()
    WHERE  id IN (SELECT id FROM pool)
      AND  EXISTS (SELECT 1 FROM do_hold)
    RETURNING id
  ),
  bump_cap AS (
    INSERT INTO daily_cap_usage (user_id, agent_type, usage_date, used_today)
    SELECT p_user_id, p_agent_type, CURRENT_DATE, p_amount
    WHERE  EXISTS (SELECT 1 FROM do_hold)
    ON CONFLICT (user_id, agent_type, usage_date)
    DO UPDATE SET used_today  = daily_cap_usage.used_today + p_amount,
                  updated_at  = now()
    RETURNING user_id
  )
  SELECT
    CASE
      WHEN EXISTS (SELECT 1 FROM do_hold)
        THEN jsonb_build_object('held', true,  'reason', 'ok')
      WHEN NOT EXISTS (SELECT 1 FROM pool)
        THEN jsonb_build_object('held', false, 'reason', 'no_active_pool')
      ELSE
        jsonb_build_object('held', false, 'reason', 'insufficient_credits')
    END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. confirm_credits
--    Sets confirmed = true on the hold for this job_id.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.confirm_credits(
  p_job_id uuid
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE credit_holds
  SET    confirmed = true
  WHERE  job_id   = p_job_id
    AND  confirmed = false
    AND  released  = false;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. release_credits
--    Sets released = true and reverses the pool deduction.
--    Uses a CTE to identify the hold then update the pool in one statement.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.release_credits(
  p_job_id uuid
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH released AS (
    UPDATE credit_holds
    SET    released = true
    WHERE  job_id   = p_job_id
      AND  confirmed = false
      AND  released  = false
    RETURNING user_id, amount
  )
  UPDATE credit_pools
  SET    used_amount = GREATEST(0, used_amount - released.amount),
         updated_at  = now()
  FROM   released
  WHERE  credit_pools.user_id = released.user_id
    AND  billing_period_start <= now()
    AND  (billing_period_start + interval '1 month') > now();
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. cleanup_page_locks
--    Replaces the void version from migration 06 (which incorrectly used locked_at).
--    Deletes stale page_locks older than 2 hours using the actual created_at column.
--    Returns deleted count.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_page_locks()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH deleted AS (
    DELETE FROM page_locks
    WHERE created_at < now() - interval '2 hours'
    RETURNING id
  )
  SELECT COUNT(*)::int FROM deleted;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. cleanup_topic_ledger
--    Archives topic_ledger rows older than 365 days to topic_ledger_archive.
--    Returns the number of rows moved.
--    topic_ledger_archive created with LIKE topic_ledger INCLUDING ALL (migration 06).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_topic_ledger()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH archived AS (
    DELETE FROM topic_ledger
    WHERE registered_at < now() - interval '365 days'
    RETURNING *
  ),
  inserted AS (
    INSERT INTO topic_ledger_archive
    SELECT * FROM archived
    RETURNING id
  )
  SELECT COUNT(*)::int FROM inserted;
$$;

-- Grant execute to service_role only (RPCs are called server-side)
GRANT EXECUTE ON FUNCTION public.record_webhook_event(text, text, jsonb)                        TO service_role;
GRANT EXECUTE ON FUNCTION public.allocate_monthly_credits(uuid, uuid, timestamptz)              TO service_role;
GRANT EXECUTE ON FUNCTION public.hold_credits(uuid, int, uuid, agent_type)                     TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_credits(uuid)                                          TO service_role;
GRANT EXECUTE ON FUNCTION public.release_credits(uuid)                                          TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_page_locks()                                           TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_topic_ledger()                                         TO service_role;
