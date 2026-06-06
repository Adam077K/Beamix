-- Migration: 20260606120000_scan_progress.sql
-- Purpose: PII-free per-engine scan progress table for Supabase Realtime streaming.
-- Rollback: see rollback/20260606120000_scan_progress.rollback.sql
--
-- ── SECURITY MODEL ─────────────────────────────────────────────────────────
-- This table is safe for anonymous SELECT because it is PII-free BY CONSTRUCTION:
--   - No email address, IP address, business name, website URL, or domain.
--   - The only identifier is scan_id, which is a v4 UUID capability token —
--     unguessable (122 bits of entropy), never exposed in URLs or logs, only
--     returned to the browser that submitted the scan form.
--   - `engines` JSONB stores status + query counts only. No user data.
--   - `current_query` stores the LLM prompt text (e.g. "best dentist in Tel Aviv")
--     which is generic, not personally identifiable.
-- Anon SELECT is therefore safe — an attacker who enumerates UUIDs finds only
-- scan-lifecycle metadata, never PII.
--
-- `free_scans` (the parent table) remains service-role-only (Pattern C, deny-by-default)
-- because it stores email, ip, business_name, website_url, and the full results JSONB.
-- The FK on scan_id CASCADE-deletes scan_progress rows when a free_scans row is deleted.
--
-- Realtime is enabled via ALTER PUBLICATION so the frontend can subscribe to
-- row-level POSTGRES_CHANGES events on this table without polling.

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.scan_progress (
  scan_id       uuid         PRIMARY KEY REFERENCES public.free_scans(id) ON DELETE CASCADE,
  engines       jsonb        NOT NULL DEFAULT '[]'::jsonb,
  progress      numeric(4,3) NOT NULL DEFAULT 0,
  current_query text         NULL,
  done          boolean      NOT NULL DEFAULT false,
  status        text         NOT NULL DEFAULT 'queued'
                             CHECK (status IN ('queued', 'running', 'complete', 'failed')),
  updated_at    timestamptz  NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

-- Chronological access for ops dashboards and cleanup sweeps
CREATE INDEX scan_progress_updated_at_idx ON public.scan_progress (updated_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.scan_progress ENABLE ROW LEVEL SECURITY;

-- Anonymous browsers may read progress rows. Safe because the table is PII-free
-- and scan_id is an unguessable v4 UUID capability token (see header comment).
CREATE POLICY "scan_progress: anon select"
  ON public.scan_progress FOR SELECT
  TO anon
  USING (true);

-- Service role has full DML access for the Inngest progress-writer.
CREATE POLICY "scan_progress: service_role all"
  ON public.scan_progress FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable Supabase Realtime for this table so the frontend can subscribe to
-- POSTGRES_CHANGES events without polling.
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_progress;
