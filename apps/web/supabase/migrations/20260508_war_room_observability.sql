-- ============================================================
-- Migration: 20260508_war_room_observability.sql
-- Purpose:   War-room observability layer — audit_log,
--            audit_log_daily, claude_progress tables.
--
-- Applies after: 20260422_01_drop_engine_check.sql
-- WS4 deliverable (sub-phase 4F).
--
-- Specification: ORCHESTRATION.md §2G + errata 1 (status enum),
--                ORCHESTRATION.md §2E (claude_progress schema).
--
-- R8 revisions applied (2026-05-08):
--   - IF NOT EXISTS on all CREATE TABLE / CREATE INDEX (idempotent)
--   - CREATE OR REPLACE for functions
--   - DROP POLICY IF EXISTS before CREATE POLICY
--   - telegram_send_failed added to status CHECK (Q1 LOCKED)
--   - parent_audit_log_id FK: ON DELETE SET NULL (Q2 LOCKED)
--   - row_kind discriminator + partial UNIQUE on nonce (Q3 LOCKED)
--   - audit_log_aggregate_for_date() RPC added
--   - CHECK (runtime_s >= 0) on audit_log
--   - failures integer NOT NULL DEFAULT 0 on audit_log_daily
--   - idx_audit_log_agent_ts index added
--   - event_kind text column added to audit_log
--   - COMMENT ON POLICY for RLS bypass documentation
--
-- IMPORTANT: LANGUAGE sql throughout. No plpgsql DECLARE vars
-- inside $$. Supabase SQL Editor splits on semicolons inside $$;
-- local DECLARE vars become table lookups and raise 42P01.
-- Pure DDL is safe.
--
-- IDEMPOTENCY: Safe to re-apply on any environment. All CREATE
-- statements use IF NOT EXISTS; policies use DROP IF EXISTS first.
-- ============================================================


-- ============================================================
-- 1. audit_log
-- Every agent action from every Routine fire through completion.
-- Three parties write to this table (bridge, agent, Inngest watcher)
-- so no single point of erasure per WS2 R3.6.
--
-- RLS: deny-all. Service role bypasses for agent writes.
-- /war-room page reads via server-side route (session.user.email).
--
-- row_kind discriminator (Q3 LOCKED):
--   'routine_dispatch' — a real Routine fire with a nonce for replay prevention
--   'internal_event'   — fan-in complete, synth fired, auto-unblock cascade, etc.
--   Partial UNIQUE index enforces nonce uniqueness only for dispatch rows.
--   Internal rows omit nonce (or carry NULL) without violating the index.
--
-- CHECK enforces: dispatch rows MUST carry a nonce.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_audit_log_id uuid        REFERENCES public.audit_log (id) ON DELETE SET NULL,
  ts                  timestamptz NOT NULL DEFAULT now(),
  spec                jsonb       NOT NULL,
  agent               text        NOT NULL,
  -- R8: telegram_send_failed added (Q1 LOCKED)
  status              text        NOT NULL CHECK (status IN (
    'fired',
    'accepted',
    'complete',
    'blocked',
    'timeout',
    'over_budget',
    'anomaly',
    'rule_violation',
    'anthropic_error',
    'linear_api_error',
    'mem0_error',
    'rate_limited',
    'lock_lost',
    'webhook_storm',
    'telegram_send_failed'
  )),
  outcome             text,
  cost_usd            numeric(8,4),
  -- R12: runtime must not be negative
  runtime_s           integer     CHECK (runtime_s >= 0),
  session_file        text,
  linear_ticket       text,
  fan_in_key          uuid,
  -- R8 / Q3: nonce without column-level UNIQUE — partial index handles dispatch dedup
  nonce               uuid,
  -- R8 / Q3: row_kind discriminator — 'routine_dispatch' or 'internal_event'
  row_kind            text        NOT NULL DEFAULT 'routine_dispatch'
                                  CHECK (row_kind IN ('routine_dispatch', 'internal_event')),
  -- R11: event_kind labels internal-event rows for exact fan-in completion detection
  -- Values: 'synth_dispatched', 'synth_complete', 'fan_in_complete', 'auto_unblock_fired',
  --         'auto_unblock_max_attempts' (cascade depth guard)
  event_kind          text,
  -- R8 / Q3: dispatch rows MUST have a nonce (replay-prevention contract)
  CONSTRAINT audit_log_dispatch_nonce_required
    CHECK (row_kind = 'internal_event' OR nonce IS NOT NULL)
);

-- Partial UNIQUE index: nonce uniqueness enforced only for dispatch rows (Q3 LOCKED).
-- Internal-event rows are exempt — they carry no security nonce.
CREATE UNIQUE INDEX IF NOT EXISTS audit_log_nonce_dispatch_unique
  ON public.audit_log (nonce)
  WHERE row_kind = 'routine_dispatch';

-- Indexes for /war-room page query patterns and trace-view tree.
CREATE INDEX IF NOT EXISTS idx_audit_log_linear_ticket  ON public.audit_log (linear_ticket);
CREATE INDEX IF NOT EXISTS idx_audit_log_fan_in_key     ON public.audit_log (fan_in_key);
CREATE INDEX IF NOT EXISTS idx_audit_log_ts             ON public.audit_log (ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_parent         ON public.audit_log (parent_audit_log_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_status_ts      ON public.audit_log (status, ts DESC);
-- R8 / R12: per-agent historical query index
CREATE INDEX IF NOT EXISTS idx_audit_log_agent_ts       ON public.audit_log (agent, ts DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Deny-all policy. Service role bypasses RLS for agent writes.
-- Adam reads via authenticated server-side route that validates
-- session.user.email matches the hard-coded admin email.
DROP POLICY IF EXISTS "audit_log_deny_all" ON public.audit_log;
CREATE POLICY "audit_log_deny_all"
  ON public.audit_log
  USING (false);

COMMENT ON POLICY "audit_log_deny_all" ON public.audit_log
  IS 'Service role bypasses RLS; use createServiceRoleClient (not createServiceClient).';


-- ============================================================
-- 2. audit_log_daily
-- 1-year cold archive. Rolled up nightly by Inngest
-- audit-log-rollup function. One row per (date, agent).
-- R8: failures integer NOT NULL DEFAULT 0
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_log_daily (
  date           date          NOT NULL,
  agent          text          NOT NULL,
  fires          integer       NOT NULL,
  total_cost_usd numeric(10,4),
  -- R8: NOT NULL DEFAULT 0 (was nullable — silent failure masked missing writes)
  failures       integer       NOT NULL DEFAULT 0,
  PRIMARY KEY (date, agent)
);

ALTER TABLE public.audit_log_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_daily_deny_all" ON public.audit_log_daily;
CREATE POLICY "audit_log_daily_deny_all"
  ON public.audit_log_daily
  USING (false);

COMMENT ON POLICY "audit_log_daily_deny_all" ON public.audit_log_daily
  IS 'Service role bypasses RLS; use createServiceRoleClient (not createServiceClient).';


-- ============================================================
-- 3. claude_progress
-- Live step-by-step progress from running Routines.
-- 90-day retention — nightly Inngest job deletes older rows.
-- Used by /war-room page via Supabase Realtime subscription.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.claude_progress (
  id            bigserial   PRIMARY KEY,
  ts            timestamptz NOT NULL DEFAULT now(),
  routine       text        NOT NULL,
  session_id    text,
  step          text        NOT NULL,
  status        text        NOT NULL CHECK (status IN (
    'running',
    'done',
    'error',
    'killed'
  )),
  note          text,
  cost_usd      numeric(8,4),
  linear_ticket text
);

CREATE INDEX IF NOT EXISTS idx_claude_progress_routine_ts ON public.claude_progress (routine, ts DESC);
CREATE INDEX IF NOT EXISTS idx_claude_progress_session    ON public.claude_progress (session_id);

ALTER TABLE public.claude_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "claude_progress_deny_all" ON public.claude_progress;
CREATE POLICY "claude_progress_deny_all"
  ON public.claude_progress
  USING (false);

COMMENT ON POLICY "claude_progress_deny_all" ON public.claude_progress
  IS 'Service role bypasses RLS; use createServiceRoleClient (not createServiceClient).';


-- ============================================================
-- 4. audit_log_aggregate_for_date(p_date date) — server-side RPC
--
-- R8: replaces the inline fallback in audit-log-rollup.ts.
-- Same aggregation logic, but runs server-side for better performance
-- (avoids fetching all rows over the wire just to group them in JS).
--
-- Returns a set of rows: (date, agent, fires, total_cost_usd, failures)
-- Caller: audit-log-rollup.ts step 'aggregate-yesterday'.
--
-- LANGUAGE sql — no plpgsql DECLARE vars (Supabase SQL Editor bug).
-- ============================================================

CREATE OR REPLACE FUNCTION public.audit_log_aggregate_for_date(p_date date)
RETURNS TABLE (
  date           date,
  agent          text,
  fires          integer,
  total_cost_usd numeric(10,4),
  failures       integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p_date                                    AS date,
    al.agent                                  AS agent,
    COUNT(*)::integer                         AS fires,
    COALESCE(SUM(al.cost_usd), 0)::numeric(10,4) AS total_cost_usd,
    COUNT(*) FILTER (WHERE al.status IN (
      'blocked', 'timeout', 'over_budget', 'anomaly',
      'rule_violation', 'anthropic_error', 'linear_api_error',
      'mem0_error', 'telegram_send_failed'
    ))::integer AS failures
  FROM public.audit_log al
  WHERE al.ts >= p_date::timestamptz
    AND al.ts  < (p_date + INTERVAL '1 day')::timestamptz
  GROUP BY al.agent
$$;
