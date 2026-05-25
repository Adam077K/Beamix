-- Migration: 20260525000001_agency_tables.sql
-- Purpose: 7 new agency-pivot tables for Wave 1 (brand_fingerprints, approval_queue,
--          deliverables_per_customer_per_month, publishing_credentials, weekly_digests,
--          refund_events, founding_100_cohort)
-- Source: docs/03-system-design/DATABASE_SCHEMA.md §0 (agency pivot delta, 2026-05-23)
--         docs/08-agents_work/sessions/2026-05-23-cto-agency-pivot-wave-rescope.md (A1–A10)
--
-- Rollback: see rollback/20260525000001_agency_tables.rollback.sql
--
-- Notes:
--   - Plain SQL only — no plpgsql DECLARE blocks (memory feedback_supabase_plpgsql)
--   - pgcrypto already enabled in 20260520100001_extensions.sql (used by publishing_credentials)
--   - refund_events append-only enforcement in 20260525000004_rls_policies_agency.sql
--   - All customer_id columns reference user_profiles(id) which is an auth.users(id) PK

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS (new for agency pivot)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE approval_state AS ENUM (
  'pending',
  'approved',
  'rejected',
  'expired',
  'published'
);

CREATE TYPE approval_kind AS ENUM (
  'content_publish',
  'email_as_them',
  'outreach',
  'schema_push',
  'listing_update',
  'citation_submit'
);

CREATE TYPE revenue_event_type AS ENUM (
  'charge',
  'refund',
  'release',
  'adjustment'
);

CREATE TYPE publishing_platform AS ENUM (
  'wordpress',
  'shopify',
  'webflow',
  'ghost',
  'gbp',
  'yelp',
  'apple',
  'sendgrid',
  'gtm',
  'brightlocal'
);

CREATE TYPE publishing_credential_status AS ENUM (
  'active',
  'expired',
  'revoked',
  'health_check_failed'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. brand_fingerprints
--    Wave 1. One row per customer. Service-role writes; customer reads own row only.
--    adam_reviewed_at blocks downstream agents until set for customers #1-50.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brand_fingerprints (
  customer_id                uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  voice                      jsonb NOT NULL,
  icp                        jsonb NOT NULL,
  offerings                  jsonb NOT NULL,
  authoritative_citations    text[],
  do_list                    text[],
  dont_list                  text[],
  owner_identity             jsonb NOT NULL,
  discovery_transcript_url   text,
  adam_reviewed_at           timestamptz,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_fingerprints_unreviewed
  ON brand_fingerprints (adam_reviewed_at)
  WHERE adam_reviewed_at IS NULL;

COMMENT ON TABLE brand_fingerprints IS
  'Customer brand identity captured during discovery call. Service-role only writes. '
  'adam_reviewed_at must be set before downstream agents run (customers #1-50 gate).';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. approval_queue
--    Wave 1 shell (Wave 2 + 3 populate with real items).
--    Customer reads own pending/approved items. Service-role + signed tokens write.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS approval_queue (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  kind             approval_kind NOT NULL,
  state            approval_state NOT NULL DEFAULT 'pending',
  resource         jsonb NOT NULL,
  evidence         jsonb,
  approval_token   text NOT NULL UNIQUE,
  digest_id        uuid,
  expires_at       timestamptz NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  acted_at         timestamptz,
  published_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_queue_customer_state
  ON approval_queue (customer_id, state)
  WHERE state IN ('pending', 'approved');

CREATE INDEX IF NOT EXISTS idx_approval_queue_expires
  ON approval_queue (expires_at)
  WHERE state = 'pending';

CREATE INDEX IF NOT EXISTS idx_approval_queue_customer_created
  ON approval_queue (customer_id, created_at DESC);

COMMENT ON TABLE approval_queue IS
  'Human approval gate for all agency-initiated actions. '
  'approval_token is a signed 1-click URL token mailed in the weekly digest. '
  'No customer INSERT/UPDATE/DELETE — only service-role and signed-token POST endpoints.';

COMMENT ON COLUMN approval_queue.digest_id IS
  'FK to weekly_digests where this item was surfaced. '
  'Not a foreign key constraint yet (weekly_digests created in same migration; '
  'digest rows are optional — items may appear in queue before a digest is sent).';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. deliverables_per_customer_per_month
--    Wave 2 usage — table created in Wave 1 per brief (item 1).
--    Tracks tier-gated deliverable counts per billing month.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS deliverables_per_customer_per_month (
  customer_id                uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  month_anchor               date NOT NULL,
  schema_pushed_count        int NOT NULL DEFAULT 0,
  faq_published_count        int NOT NULL DEFAULT 0,
  citation_submitted_count   int NOT NULL DEFAULT 0,
  content_published_count    int NOT NULL DEFAULT 0,
  outreach_email_count       int NOT NULL DEFAULT 0,
  locations_active_count     int NOT NULL DEFAULT 1,
  engines_tracked_count      int NOT NULL DEFAULT 3,
  prompts_tracked_count      int NOT NULL DEFAULT 25,
  PRIMARY KEY (customer_id, month_anchor)
);

COMMENT ON TABLE deliverables_per_customer_per_month IS
  'Tier-gated deliverable counters per customer per billing month. '
  'month_anchor = first of month aligned to subscription anniversary. '
  'Populated in Wave 2; table created in Wave 1 for schema completeness.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. publishing_credentials
--    Wave 3 table, created now per brief.
--    encrypted_token uses pgcrypto.sym_encrypt (key: PUBLISHING_TOKEN_KEY env var).
--    Never returned in API responses (engineering principle #9).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS publishing_credentials (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id              uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform                 publishing_platform NOT NULL,
  encrypted_token          text NOT NULL,
  refresh_token_encrypted  text,
  scopes                   text[] NOT NULL,
  external_account_id      text,
  external_account_meta    jsonb,
  expires_at               timestamptz,
  last_refreshed_at        timestamptz,
  last_health_check_at     timestamptz,
  status                   publishing_credential_status NOT NULL DEFAULT 'active',
  created_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, platform, external_account_id)
);

CREATE INDEX IF NOT EXISTS idx_publishing_credentials_customer
  ON publishing_credentials (customer_id, platform);

CREATE INDEX IF NOT EXISTS idx_publishing_credentials_status
  ON publishing_credentials (status)
  WHERE status IN ('active', 'health_check_failed');

COMMENT ON TABLE publishing_credentials IS
  'Encrypted OAuth tokens for customer CMS/platform integrations. '
  'encrypted_token = pgcrypto.sym_encrypt(raw_token, PUBLISHING_TOKEN_KEY). '
  'Raw token NEVER returned in API responses. Service-role only writes.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. weekly_digests
--    Wave 2 cron populates; Wave 1 creates table for schema completeness.
--    approval_token is the "review queue" link token for the week.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weekly_digests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  week_start       date NOT NULL,
  week_end         date NOT NULL,
  body_html        text NOT NULL,
  body_text        text NOT NULL,
  approval_token   text NOT NULL UNIQUE,
  sent_at          timestamptz,
  opened_at        timestamptz,
  metrics          jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_digests_customer_week
  ON weekly_digests (customer_id, week_start DESC);

COMMENT ON TABLE weekly_digests IS
  'Weekly digest email record per customer. '
  'approval_token is the master link to the week''s approval queue. '
  'opened_at populated via Resend webhook. Wave 2 cron populates.';

-- Now add the FK from approval_queue.digest_id to weekly_digests.id
-- This is safe because both tables are created in this migration.
ALTER TABLE approval_queue
  ADD CONSTRAINT fk_approval_queue_digest
  FOREIGN KEY (digest_id) REFERENCES weekly_digests(id)
  ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. refund_events
--    Append-only ledger. UPDATE and DELETE blocked via trigger (see migration 04).
--    revenue_event_id FK is nullable (refund may not always trace to exact charge row).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS refund_events (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id          uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  paddle_event_id      text NOT NULL UNIQUE,
  revenue_event_id     uuid,
  amount_cents         int NOT NULL,
  reason               text NOT NULL,
  founding_100_cohort  boolean NOT NULL DEFAULT false,
  refunded_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refund_events_customer
  ON refund_events (customer_id, refunded_at DESC);

COMMENT ON TABLE refund_events IS
  'Append-only Paddle refund ledger. '
  'UPDATE and DELETE are blocked by trigger (refund_events_immutable) — '
  'this is Engineering Principle #12. '
  'revenue_event_id FK added after revenue_events table is created.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. founding_100_cohort
--    Tracks the first 100 paying customers and their founding status.
--    Wave 2 populates; Wave 1 creates table.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS founding_100_cohort (
  customer_id          uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE RESTRICT,
  cohort_number        int NOT NULL UNIQUE CHECK (cohort_number BETWEEN 1 AND 100),
  joined_at            timestamptz NOT NULL DEFAULT now(),
  first_payment_at     timestamptz,
  refund_risk_flagged  boolean NOT NULL DEFAULT false,
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE founding_100_cohort IS
  'First 100 paying customers — founding cohort tracking. '
  'ON DELETE RESTRICT: founding members cannot be deleted from user_profiles '
  'without explicit cohort row removal first (data integrity guard). '
  'cohort_number is globally unique (1–100).';

-- ─────────────────────────────────────────────────────────────────────────────
-- IMMUTABILITY TRIGGER for refund_events
-- Uses plpgsql — spec exception for trigger functions only
-- (plpgsql is prohibited in migration body SQL per memory feedback_supabase_plpgsql;
--  trigger functions are the one allowed exception per existing pattern in migration 13)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.refund_events_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'refund_events is append-only — UPDATE and DELETE are blocked';
END;
$$;

CREATE TRIGGER refund_events_no_update
  BEFORE UPDATE ON public.refund_events
  FOR EACH ROW EXECUTE FUNCTION public.refund_events_immutable();

CREATE TRIGGER refund_events_no_delete
  BEFORE DELETE ON public.refund_events
  FOR EACH ROW EXECUTE FUNCTION public.refund_events_immutable();
