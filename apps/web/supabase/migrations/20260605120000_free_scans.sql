-- Migration: 20260605120000_free_scans.sql
-- Purpose: free_scans table — stores anonymous free-scan requests initiated via /api/scan/free.
--          Results are stored as JSONB. Converted scans link to auth.users via converted_user_id.
-- Rollback: see rollback/20260605120000_free_scans.rollback.sql
--           (DROP TABLE IF EXISTS public.free_scans;)
-- Pattern C: service-role only (deny-by-default). No user-facing RLS policies.
--   Rationale: free scans are anonymous — no auth.uid() to match against. The route
--   uses the Supabase service-role key for all reads/writes. The result page is a
--   server component that also uses the service-role key. If a converted_user_id is
--   set, the authenticated /dashboard route reads the scan via a separate join on
--   the scans table (not here). This matches the paddle_webhook_events / page_locks
--   service-only pattern in migration 20260520100013_rls_policies.sql.

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.free_scans (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name     text        NOT NULL,
  website_url       text        NOT NULL,
  email             text        NOT NULL,
  domain            text        NOT NULL,
  ip                text        NOT NULL,
  status            text        NOT NULL DEFAULT 'queued'
                                CHECK (status IN ('queued', 'running', 'complete', 'failed')),
  results           jsonb,
  error_message     text,
  started_at        timestamptz,
  completed_at      timestamptz,
  converted_user_id uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

-- Email lookups (rate limiting per-email + result lookup by email)
CREATE INDEX free_scans_email_lower_idx   ON public.free_scans (lower(email));

-- Domain lookups (rate limiting per-domain)
CREATE INDEX free_scans_domain_idx        ON public.free_scans (domain);

-- IP lookups (rate limiting per-IP)
CREATE INDEX free_scans_ip_idx            ON public.free_scans (ip);

-- Active scan queue — only rows still in-flight; keeps partial index small
CREATE INDEX free_scans_status_active_idx ON public.free_scans (status)
  WHERE status IN ('queued', 'running');

-- Chronological access (ops dashboards, expiry sweeps)
CREATE INDEX free_scans_created_at_idx    ON public.free_scans (created_at DESC);

-- FK index — converted_user_id (PostgreSQL does not auto-index FK columns)
CREATE INDEX free_scans_converted_user_id_idx ON public.free_scans (converted_user_id)
  WHERE converted_user_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (Pattern C — service-only, deny-by-default)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.free_scans ENABLE ROW LEVEL SECURITY;

-- No anon or authenticated policies — deny-all by default.
-- Service role bypasses RLS automatically.
-- Mirrors: paddle_webhook_events, page_locks, topic_ledger_archive, system_kill_switch.

CREATE POLICY "free_scans: service_role all"
  ON public.free_scans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
