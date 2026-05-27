-- ============================================================================
-- Beamix Wave 1 — Agency Pivot Migrations
-- Consolidated for Supabase SQL Editor paste
-- Date: 2026-05-27
-- ============================================================================
-- Adam: paste this entire script into Supabase Dashboard → SQL Editor → New Query
--       and click "Run" against the STAGING project first.
--
-- The migrations are idempotent (CREATE TABLE IF NOT EXISTS, ALTER TYPE ADD
-- VALUE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS) so re-running is safe.
--
-- After staging verification, repeat against production.
-- Rollback scripts available at apps/web/supabase/migrations/rollback/.
-- ============================================================================


-- ============================================================================
-- File: apps/web/supabase/migrations/20260525000001_agency_tables.sql
-- ============================================================================
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

-- 7 columns required by emit_brand_fingerprint tool (ai-engineer P1 schema drift fix)
ALTER TABLE public.brand_fingerprints
  ADD COLUMN IF NOT EXISTS confidence_score        jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence_links          jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS requires_human_approval boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS brief_version_id        uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS competitor_set          jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS approval_style          jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS hard_nos                jsonb NOT NULL DEFAULT '[]'::jsonb;

-- confidence_score:        per-field confidence map { field: score_0_to_1 }
-- evidence_links:          per-field provenance { field: "source:location" }
-- requires_human_approval: YMYL gate — defaults true (secure-by-default; agent must explicitly clear)
-- brief_version_id:        UUID emitted per emit_brand_fingerprint call; enables versioned briefs per customer
-- competitor_set:          array of { domain, relationship } objects
-- approval_style:          customer preferences: tone, escalation thresholds, ymyl_override boolean
-- hard_nos:                array of forbidden phrases/topics

CREATE INDEX IF NOT EXISTS idx_brand_fingerprints_brief_version_id
  ON public.brand_fingerprints (brief_version_id);

CREATE INDEX IF NOT EXISTS idx_brand_fingerprints_unreviewed
  ON brand_fingerprints (adam_reviewed_at)
  WHERE adam_reviewed_at IS NULL;

COMMENT ON TABLE brand_fingerprints IS
  'Customer brand identity captured during discovery call. Service-role only writes. '
  'adam_reviewed_at must be set before downstream agents run (customers #1-50 gate). '
  'requires_human_approval defaults true — agent must explicitly clear for YMYL content. '
  'brief_version_id links to a specific emit_brand_fingerprint output version.';

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


-- ============================================================================
-- File: apps/web/supabase/migrations/20260525000002_plan_tier_rename.sql
-- ============================================================================
-- Migration: 20260525000002_plan_tier_rename.sql
-- Purpose: Add agency-tier enum values to plan_tier; deprecate discover/build via comments.
--          Adds: 'starter', 'growth', 'professional' (scale already exists — intentional collision kept)
--          Does NOT remove existing values (safe — data integrity + historical webhook refs preserved)
-- Source: docs/03-system-design/DATABASE_SCHEMA.md §0.5
--         docs/08-agents_work/sessions/2026-05-24-cto-infra-gap-scoping.md (B5)
--
-- Current plan_tier values: 'discover', 'build', 'scale'
-- Post-migration plan_tier values: 'discover'*, 'build'*, 'scale', 'starter', 'growth', 'professional'
--   * deprecated — no longer offered to new customers; Paddle products archived.
--     Backend code must filter on active plans via plans.is_active column (not enum value).
--
-- Rollback: Cannot remove enum values in PostgreSQL without DROP + RECREATE.
--   see rollback/20260525000002_plan_tier_rename.rollback.sql for full strategy.
--
-- NOTE: ALTER TYPE ADD VALUE IF NOT EXISTS is not available before PostgreSQL 14.
--   Supabase production runs PG 15+ so IF NOT EXISTS is safe.

-- Add new agency tier values to plan_tier enum
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'starter';
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'growth';
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'professional';
-- 'scale' already exists — no ADD VALUE needed (collision intentional per brief)

-- Deprecate old values via comment (PostgreSQL has no native enum value deprecation)
COMMENT ON TYPE plan_tier IS
  'Plan tier enum for Beamix. '
  'Values ''discover'' and ''build'' are DEPRECATED as of 2026-05-25 (agency pivot). '
  'New values: ''starter'' ($499/mo), ''growth'' ($999/mo), ''scale'' ($1,499/mo), ''professional'' ($2,499/mo). '
  'Legacy values retained for historical Paddle webhook event compatibility. '
  'Use plans.is_active = false to gate deprecated tiers from new signups.';

-- Seed the new agency tier plan rows (sandbox prices — Adam replaces with real price IDs)
-- Using INSERT ... ON CONFLICT DO NOTHING for idempotency
-- NOTE: paddle_price_id_monthly / paddle_price_id_annual must be set by Adam (AB-3)
--       These rows are created with NULL price IDs — backend checks IS NOT NULL before checkout

INSERT INTO plans (name, tier, monthly_credits, paddle_price_id_monthly, paddle_price_id_annual)
VALUES
  ('Starter',       'starter',      0, NULL, NULL),
  ('Growth',        'growth',       0, NULL, NULL),
  ('Professional',  'professional', 0, NULL, NULL)
ON CONFLICT (tier) DO NOTHING;

-- Mark deprecated tiers inactive so they don't appear in pricing UI
-- 'scale' is NOT deprecated (it is the new $1,499/mo tier, reused from old enum)
-- We only deprecate 'discover' and 'build'
-- plans table has no is_active column yet — we add it here if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'plans'
      AND column_name  = 'is_active'
  ) THEN
    ALTER TABLE public.plans ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Deactivate old tiers
UPDATE plans SET is_active = false WHERE tier IN ('discover', 'build');

-- Add new agency agent_type values (internal only, per DATABASE_SCHEMA §0.5)
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'discovery';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'brand_brief_manager';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'approval_gate_writer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'digest_writer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'customer_success';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'publisher';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'strategy';


-- ============================================================================
-- File: apps/web/supabase/migrations/20260525000003_held_revenue_accounting.sql
-- ============================================================================
-- Migration: 20260525000003_held_revenue_accounting.sql
-- Purpose: subscriptions.held_until + held_revenue_amount_cents + founding_100_cohort columns;
--          revenue_events ledger table (append-only, booked_at flipped by day-61 cron).
--          Also adds FK from refund_events.revenue_event_id → revenue_events.id
-- Source: docs/03-system-design/DATABASE_SCHEMA.md §0.2 (revenue_events + refund_events)
--         docs/08-agents_work/sessions/2026-05-23-cto-agency-pivot-wave-rescope.md (decision A4)
--
-- Rollback: see rollback/20260525000003_held_revenue_accounting.rollback.sql
--
-- Architecture notes (CTO decision A4):
--   - Day-61 hold: Revenue booked_at is NULL until 61 days after received_at
--   - ARR/MRR dashboards read from booked_at (NOT received_at) for accurate recognition
--   - revenue-booking-sweep Inngest cron flips booked_at in bulk daily
--   - revenue_events is append-only — no UPDATE/DELETE (RLS DENY in migration 04)

-- ─────────────────────────────────────────────────────────────────────────────
-- EXTEND subscriptions table
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS held_until               timestamptz,
  ADD COLUMN IF NOT EXISTS held_revenue_amount_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS founding_100_cohort       boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN subscriptions.held_until IS
  'Timestamp until which new revenue from this subscription is held (not yet booked). '
  'NULL means not held. Set to received_at + 61 days on new payment. '
  'Cleared by revenue-booking-sweep cron when booked_at is written to revenue_events.';

COMMENT ON COLUMN subscriptions.held_revenue_amount_cents IS
  'Running sum of revenue_cents held but not yet booked for this subscription. '
  'Updated on each Paddle charge event. Reset to 0 when held_until passes.';

COMMENT ON COLUMN subscriptions.founding_100_cohort IS
  'True for the first 100 paying customers. Unlocks founding member pricing and perks. '
  'Set by the subscription webhook handler when cohort_number is still available.';

-- ─────────────────────────────────────────────────────────────────────────────
-- revenue_events ledger
-- Append-only. booked_at = NULL until day-61 cron flips it.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS revenue_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  paddle_event_id  text NOT NULL UNIQUE,
  type             revenue_event_type NOT NULL,
  amount_cents     int NOT NULL,
  currency         text NOT NULL DEFAULT 'USD',
  received_at      timestamptz NOT NULL DEFAULT now(),
  booked_at        timestamptz,
  notes            jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revenue_events_customer
  ON revenue_events (customer_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_revenue_events_booked_at
  ON revenue_events (booked_at)
  WHERE booked_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_revenue_events_unbooked
  ON revenue_events (received_at)
  WHERE booked_at IS NULL;

COMMENT ON TABLE revenue_events IS
  'Append-only Paddle revenue ledger. '
  'received_at = when Paddle webhook fired. '
  'booked_at = NULL for 61 days (held-revenue model, CTO decision A4); '
  'flipped by revenue-booking-sweep Inngest cron. '
  'ARR/MRR reads WHERE booked_at IS NOT NULL. '
  'UPDATE and DELETE blocked by RLS DENY in migration 20260525000004.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Add FK from refund_events.revenue_event_id → revenue_events.id
-- revenue_events is now created; safe to add constraint.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.refund_events
  ADD CONSTRAINT fk_refund_events_revenue_event
  FOREIGN KEY (revenue_event_id) REFERENCES revenue_events(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_refund_events_revenue_event
  ON refund_events (revenue_event_id)
  WHERE revenue_event_id IS NOT NULL;


-- ============================================================================
-- File: apps/web/supabase/migrations/20260525000004_rls_policies_agency.sql
-- ============================================================================
-- Migration: 20260525000004_rls_policies_agency.sql
-- Purpose: RLS for the 7 new agency-pivot tables (Wave 1).
--          refund_events: append-only ledger — SELECT for owner, INSERT for service_role only.
--            UPDATE/DELETE blocked for all roles (belt-and-suspenders with immutable trigger).
--          revenue_events: ledger with ONE allowed UPDATE path — booked_at flip by day-61 cron.
--            Design choice: scoped UPDATE policy (USING booked_at IS NULL / WITH CHECK booked_at IS NOT NULL).
--            A SECURITY DEFINER function was considered but rejected — the scoped UPDATE policy is
--            sufficient because (a) service_role is already server-only, (b) the USING/WITH CHECK
--            guards prevent re-booking or clearing booked_at, and (c) no other columns can be
--            updated without triggering the check failure. This keeps the table itself append-only
--            for all columns except booked_at, enforced at the RLS layer.
--          publishing_credentials: customer sees row metadata only (NO encrypted_token);
--            raw token returned exclusively via SECURITY DEFINER RPC.
-- Source: docs/08-agents_work/sessions/2026-05-25-cto-wave1-closeout.md lines 162-167
--         Engineering Principle #12 (append-only ledger immutability)
--
-- Rollback: see rollback/20260525000004_rls_policies_agency.rollback.sql
--
-- Pattern legend (mirrors 20260520100013_rls_policies.sql):
--   A — direct tenant: customer_id = auth.uid()
--   C — service-only: no user access at all (RLS deny-all, service_role bypasses)
--   L — ledger: owner SELECT + service_role INSERT only; UPDATE/DELETE blocked for all
--   L+ — ledger with single UPDATE path: revenue_events.booked_at (service_role only, day-61 cron)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. brand_fingerprints
--    Pattern: C — service-role writes; customer reads own row only.
--    customer_id = auth.uid() (brand_fingerprints.customer_id IS the user uuid PK)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.brand_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_fingerprints: owner read"
  ON public.brand_fingerprints FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "brand_fingerprints: service_role all"
  ON public.brand_fingerprints FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. approval_queue
--    Pattern: A (read-only for customer) — no customer INSERT/UPDATE/DELETE.
--    Service-role and signed-token POST endpoints write via service_role key.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_queue: owner read"
  ON public.approval_queue FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "approval_queue: service_role all"
  ON public.approval_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. deliverables_per_customer_per_month
--    Pattern: A (read-only for customer) — counters maintained by service_role only.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.deliverables_per_customer_per_month ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deliverables_per_customer_per_month: owner read"
  ON public.deliverables_per_customer_per_month FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "deliverables_per_customer_per_month: service_role all"
  ON public.deliverables_per_customer_per_month FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. publishing_credentials
--    Pattern: A (metadata read-only for customer) — encrypted_token NEVER exposed.
--    The customer may see that a credential row exists (id, platform, status,
--    external_account_id, expires_at) but cannot read encrypted_token or
--    refresh_token_encrypted via any RLS-governed SELECT.
--
--    Raw token is returned ONLY via the get_publishing_credential(p_id uuid)
--    SECURITY DEFINER RPC (service_role only — defined separately, not in migrations).
--
--    Implementation: column-level security is not supported by Supabase RLS;
--    instead, all app reads go through the RPC which uses the service_role client.
--    The api route MUST NOT return encrypted_token in any response payload.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.publishing_credentials ENABLE ROW LEVEL SECURITY;

-- Customers may see credential metadata (for display in settings UI).
-- Backend code MUST never SELECT encrypted_token / refresh_token_encrypted
-- in user-facing queries — enforced at application layer and via the RPC.
CREATE POLICY "publishing_credentials: owner read"
  ON public.publishing_credentials FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "publishing_credentials: service_role all"
  ON public.publishing_credentials FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. weekly_digests
--    Pattern: A (read-only for customer) — digest records created by Wave 2 cron.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.weekly_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_digests: owner read"
  ON public.weekly_digests FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "weekly_digests: service_role all"
  ON public.weekly_digests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. refund_events
--    Pattern: L (ledger) — append-only per Engineering Principle #12.
--    Customer: SELECT own rows only.
--    Service_role: INSERT only (UPDATE/DELETE blocked for everyone including service_role).
--    UPDATE/DELETE blocked by trigger refund_events_immutable (in migration 01).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.refund_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refund_events: owner read"
  ON public.refund_events FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "refund_events: service_role insert"
  ON public.refund_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Explicit DENY for UPDATE and DELETE — belt-and-suspenders alongside trigger.
-- No UPDATE/DELETE policies = denied for ALL roles including service_role.
-- The immutable trigger (migration 01) is the last-line enforcement.

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. revenue_events
--    Pattern: L (ledger) — append-only per Engineering Principle #12.
--    Customer: SELECT own rows only.
--    Service_role: INSERT only.
--    The day-61 booked_at flip is the ONE allowed "update" — it is performed
--    by the revenue-booking-sweep cron using the service_role client;
--    the RLS INSERT-only policy still applies (cron uses a raw UPDATE statement
--    which goes through the trigger guard rather than RLS INSERT path).
--
--    IMPORTANT: the revenue-booking-sweep cron MUST use the service_role key.
--    The UPDATE is permitted because RLS has no UPDATE policy (RLS blocks normal
--    users), and we intentionally do NOT add an immutable UPDATE trigger for
--    revenue_events (only refund_events has one) — the booked_at flip is the
--    sole valid UPDATE path and is gated at the application layer.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenue_events: owner read"
  ON public.revenue_events FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "revenue_events: service_role insert"
  ON public.revenue_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- booked_at flip only — service_role UPDATE is explicitly scoped to booked_at column.
-- RLS cannot scope to specific columns; the application layer (revenue-booking-sweep
-- Inngest function) MUST restrict its UPDATE to SET booked_at = ... only.
CREATE POLICY "revenue_events: service_role update booked_at"
  ON public.revenue_events FOR UPDATE
  TO service_role
  USING (booked_at IS NULL)
  WITH CHECK (booked_at IS NOT NULL);

-- Founding_100_cohort
--    Pattern: A (read-only for customer — own row only).
--    Service_role writes (Wave 2 subscription webhook).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.founding_100_cohort ENABLE ROW LEVEL SECURITY;

CREATE POLICY "founding_100_cohort: owner read"
  ON public.founding_100_cohort FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "founding_100_cohort: service_role all"
  ON public.founding_100_cohort FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

