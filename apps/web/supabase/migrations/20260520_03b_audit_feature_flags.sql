-- Migration 03b: audit_log + feature_flags table definitions
-- Sorts between 03_core_tables and 04_credits.
-- These tables are referenced in migration 12 (RLS + triggers) — must exist first.
-- Rollback: DROP TABLE feature_flags; DROP TABLE audit_log;

-- ─────────────────────────────────────────────────────────────────────────────
-- audit_log
-- Append-only event store for all platform actions.
-- Immutability enforced via triggers in migration 12.
-- prev_hash enables tamper-evidence chaining (M8 requirement).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  text        NOT NULL,
  actor_type  text        NOT NULL CHECK (actor_type IN ('user', 'agent', 'system', 'admin')),
  actor_id    uuid,
  target_table text,
  target_id   text,
  payload     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  prev_hash   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index: time-range queries are the primary access pattern
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log (created_at);

-- Index: filter by actor (user activity lookups)
CREATE INDEX IF NOT EXISTS audit_log_actor_idx ON public.audit_log (actor_type, actor_id);

-- Index: filter by event type (security/audit dashboards)
CREATE INDEX IF NOT EXISTS audit_log_event_type_idx ON public.audit_log (event_type);

COMMENT ON TABLE public.audit_log IS
  'Append-only event store. Rows are immutable after insert (enforced by triggers in migration 12). prev_hash chains entries for tamper-evidence.';

-- ─────────────────────────────────────────────────────────────────────────────
-- feature_flags
-- Simple key/value store for runtime configuration switches.
-- Public read (pricing callouts, feature gates on the client).
-- Service_role write only — flags are set server-side or via Supabase dashboard.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key         text        PRIMARY KEY,
  value       jsonb       NOT NULL DEFAULT 'true'::jsonb,
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.feature_flags IS
  'Runtime feature flag store. Public read via RLS (pattern P). Writes restricted to service_role.';

-- Seed with known flags (idempotent)
INSERT INTO public.feature_flags (key, value, description)
VALUES
  ('geo_scan_enabled',         'true'::jsonb,  'Enable GEO scan pipeline'),
  ('agent_hub_enabled',        'true'::jsonb,  'Enable agent job execution'),
  ('inbox_proactive_enabled',  'true'::jsonb,  'Enable proactive automation suggestions'),
  ('workflow_builder_enabled', 'false'::jsonb, 'Workflow builder — MVP-1.5, disabled at launch')
ON CONFLICT (key) DO NOTHING;
