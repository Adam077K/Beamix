-- Migration: 20260520100015_cleanup_topic_ledger_idempotent.sql
-- Purpose: Fix cleanup_topic_ledger to be idempotent on retry/double-call.
--          topic_ledger_archive inherits UNIQUE (business_id, topic_key) via
--          LIKE topic_ledger INCLUDING ALL (migration 06). Without ON CONFLICT
--          a second call for the same rows causes a unique-violation.
-- Rollback: Re-run migration 12's cleanup_topic_ledger definition (no data loss — archive table is unchanged).

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
    ON CONFLICT (business_id, topic_key) DO NOTHING
    RETURNING id
  )
  SELECT COUNT(*)::int FROM inserted;
$$;

-- Re-issue permission grants (CREATE OR REPLACE can reset/retain grants — be safe)
REVOKE ALL ON FUNCTION public.cleanup_topic_ledger() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_topic_ledger() TO service_role;
