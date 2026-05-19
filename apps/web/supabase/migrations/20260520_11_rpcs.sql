-- Migration 11: RPCs (LANGUAGE sql + CTEs only; no plpgsql DECLARE)
-- Rollback: DROP FUNCTION for each function listed below

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. record_webhook_event
--    Idempotent insert of Paddle webhook events. Returns the row id.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_webhook_event(
  p_event_id   text,
  p_event_type text,
  p_payload    jsonb
) RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO paddle_webhook_events (event_id, event_type, payload)
  VALUES (p_event_id, p_event_type, p_payload)
  ON CONFLICT (event_id) DO NOTHING
  RETURNING id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. allocate_monthly_credits
--    Idempotent: inserts a credit_pool row for (user_id, plan_id, billing_period_start).
--    Returns the pool id (existing or newly created).
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
    SELECT monthly_agent_credits
    FROM   plans
    WHERE  id = p_plan_id
  ),
  inserted AS (
    INSERT INTO credit_pools (user_id, plan_id, billing_period_start, base_allocation)
    SELECT p_user_id, p_plan_id, p_billing_period_start, plan.monthly_agent_credits
    FROM   plan
    ON CONFLICT (user_id, billing_period_start) DO NOTHING
    RETURNING id
  )
  SELECT id FROM inserted
  UNION ALL
  SELECT id FROM credit_pools
  WHERE  user_id = p_user_id
    AND  billing_period_start = p_billing_period_start
  LIMIT 1;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. hold_credits
--    Atomically checks available balance + daily cap, then inserts a hold.
--    Uses SELECT … FOR UPDATE to prevent TOCTOU races.
--    Returns jsonb: { "held": bool, "reason": text }
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.hold_credits(
  p_user_id uuid,
  p_amount  int,
  p_job_id  uuid
) RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH pool AS (
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
  cap AS (
    SELECT COALESCE(SUM(credits_used), 0) AS used_today
    FROM   daily_cap_usage
    WHERE  user_id = p_user_id
      AND  usage_date = CURRENT_DATE
    FOR UPDATE
  ),
  plan_cap AS (
    SELECT p.daily_agent_cap
    FROM   plans p
    JOIN   credit_pools cp ON cp.plan_id = p.id
    JOIN   pool ON pool.id = cp.id
    LIMIT  1
  ),
  check_result AS (
    SELECT
      pool.id                       AS pool_id,
      pool.available                AS available,
      cap.used_today                AS used_today,
      plan_cap.daily_agent_cap      AS daily_cap,
      (pool.available >= p_amount
        AND (plan_cap.daily_agent_cap IS NULL
             OR cap.used_today + p_amount <= plan_cap.daily_agent_cap))
                                    AS can_hold
    FROM pool, cap, plan_cap
  ),
  do_hold AS (
    INSERT INTO credit_holds (pool_id, job_id, amount, status)
    SELECT pool_id, p_job_id, p_amount, 'held'
    FROM   check_result
    WHERE  can_hold = true
    ON CONFLICT (job_id) DO NOTHING
    RETURNING pool_id
  ),
  bump_pool AS (
    UPDATE credit_pools
    SET    used_amount = used_amount + p_amount
    WHERE  id IN (SELECT pool_id FROM do_hold)
    RETURNING id
  ),
  bump_cap AS (
    INSERT INTO daily_cap_usage (user_id, usage_date, credits_used)
    SELECT p_user_id, CURRENT_DATE, p_amount
    WHERE  EXISTS (SELECT 1 FROM do_hold)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET credits_used = daily_cap_usage.credits_used + p_amount
    RETURNING user_id
  )
  SELECT
    CASE
      WHEN EXISTS (SELECT 1 FROM do_hold)
        THEN jsonb_build_object('held', true,  'reason', 'ok')
      WHEN NOT EXISTS (SELECT 1 FROM pool)
        THEN jsonb_build_object('held', false, 'reason', 'no_active_pool')
      WHEN (SELECT available FROM check_result) < p_amount
        THEN jsonb_build_object('held', false, 'reason', 'insufficient_credits')
      ELSE
        jsonb_build_object('held', false, 'reason', 'daily_cap_exceeded')
    END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. confirm_credits
--    Transitions a credit hold from 'held' → 'consumed'.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.confirm_credits(
  p_job_id uuid
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE credit_holds
  SET    status       = 'consumed',
         confirmed_at = now()
  WHERE  job_id = p_job_id
    AND  status  = 'held';
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. release_credits
--    Transitions a credit hold from 'held' → 'released', and reverses the
--    pool deduction so credits are returned to the user's balance.
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
    SET    status      = 'released',
           released_at = now()
    WHERE  job_id = p_job_id
      AND  status  = 'held'
    RETURNING pool_id, amount
  )
  UPDATE credit_pools
  SET    used_amount = used_amount - released.amount
  FROM   released
  WHERE  credit_pools.id = released.pool_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. cleanup_page_locks
--    Deletes stale page_locks older than 2 hours. Returns deleted count.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_page_locks()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH deleted AS (
    DELETE FROM page_locks
    WHERE acquired_at < now() - interval '2 hours'
    RETURNING id
  )
  SELECT COUNT(*)::int FROM deleted;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. cleanup_topic_ledger
--    Archives topic_ledger rows older than 365 days to topic_ledger_archive.
--    Returns the number of rows moved.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_topic_ledger()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH archived AS (
    DELETE FROM topic_ledger
    WHERE created_at < now() - interval '365 days'
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
GRANT EXECUTE ON FUNCTION public.hold_credits(uuid, int, uuid)                                  TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_credits(uuid)                                          TO service_role;
GRANT EXECUTE ON FUNCTION public.release_credits(uuid)                                          TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_page_locks()                                           TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_topic_ledger()                                         TO service_role;
