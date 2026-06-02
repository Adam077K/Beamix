-- Rollback: 20260602000001_approval_queue_agent_job_id.sql
-- Reverses the agent_job_id column addition, FK constraint, and partial UNIQUE index.
-- DESTRUCTIVE: drops the column (and any data stored in it).
-- Run only after confirming the forward migration has been applied and that
-- no application code is actively reading/writing agent_job_id.
--
-- Execution order: reverse of creation (index → constraint → column).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Drop the partial UNIQUE index
-- ─────────────────────────────────────────────────────────────────────────────

DROP INDEX IF EXISTS public.uq_approval_queue_agent_job_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Drop the FK constraint
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.approval_queue
  DROP CONSTRAINT IF EXISTS fk_approval_queue_agent_job;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Drop the column
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.approval_queue
  DROP COLUMN IF EXISTS agent_job_id;
