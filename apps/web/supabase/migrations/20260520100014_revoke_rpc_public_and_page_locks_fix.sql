-- Migration 14: REVOKE SECURITY DEFINER RPCs from PUBLIC; fix cleanup_page_locks to use expires_at
-- Rollback: GRANT EXECUTE ON FUNCTION <fn_sig> TO PUBLIC; (and revert cleanup_page_locks body)
--
-- Part 1 (P1 — security): PostgreSQL grants EXECUTE to PUBLIC by default on CREATE FUNCTION.
--   anon/authenticated inherit PUBLIC, and PostgREST exposes /rest/v1/rpc/<fn>.
--   Revoke PUBLIC access from all 7 SECURITY DEFINER RPCs. service_role grants from migration 12 remain.
--
-- Part 2 (P2): Replace cleanup_page_locks body to use expires_at instead of created_at + 2h interval.
--   page_locks.expires_at is the canonical expiry signal — using it is correct and simpler.
--   Return type (int) and all other attributes preserved; CREATE OR REPLACE is safe here.
-- ─────────────────────────────────────────────────────────────────────────────

-- Part 2: Replace cleanup_page_locks body — use expires_at for correct expiry logic.
-- Signature and return type (int) are identical to migration 12; CREATE OR REPLACE is safe.
CREATE OR REPLACE FUNCTION public.cleanup_page_locks()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH deleted AS (
    DELETE FROM page_locks
    WHERE expires_at < now()
    RETURNING id
  )
  SELECT COUNT(*)::int FROM deleted;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Part 1: REVOKE all 7 SECURITY DEFINER RPCs from PUBLIC.
-- Placed after CREATE OR REPLACE to cover the newly replaced function as well.
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION public.record_webhook_event(text, text, jsonb)               FROM PUBLIC;
REVOKE ALL ON FUNCTION public.allocate_monthly_credits(uuid, uuid, timestamptz)     FROM PUBLIC;
REVOKE ALL ON FUNCTION public.hold_credits(uuid, int, uuid, agent_type)             FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_credits(uuid)                                 FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_credits(uuid)                                 FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_page_locks()                                  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_topic_ledger()                                FROM PUBLIC;
