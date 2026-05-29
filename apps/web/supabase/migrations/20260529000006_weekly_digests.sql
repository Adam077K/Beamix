-- Migration: 20260529000006_weekly_digests.sql
-- Purpose: Rebuild weekly_digests table with agency-pivot schema.
--          The Wave 1 table (20260525000001) used week_start/week_end/body_html/body_text
--          and referenced user_profiles(id). Wave 2 uses week_of/payload_json/rendered_html/status
--          and references businesses(id) — digest is per-business, not per-user.
--
-- Rollback: see rollback/20260529000006_weekly_digests.rollback.sql
--
-- Notes:
--   - Plain SQL only — no plpgsql DECLARE blocks (memory feedback_supabase_plpgsql)
--   - DROP TABLE is safe: table was created in Wave 1 migration but never populated (no data loss)
--   - approval_queue.fk_approval_queue_digest is dropped and re-added to new table

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Drop existing FK from approval_queue.digest_id → old weekly_digests.id
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE approval_queue DROP CONSTRAINT IF EXISTS fk_approval_queue_digest;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Drop old weekly_digests (index + table)
-- ─────────────────────────────────────────────────────────────────────────────
DROP INDEX IF EXISTS idx_weekly_digests_customer_week;
DROP TABLE IF EXISTS weekly_digests;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Create weekly_digests with the new agency-pivot schema
--    customer_id → businesses(id): digest is per-business (not per-user)
--    week_of: ISO date of the Sunday that opens the digest week
--    payload_json: full DigestPayload from the digest-writer agent (JSONB)
--    rendered_html: optional pre-rendered HTML (set after email render)
--    status: draft → sent (or failed)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE weekly_digests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  week_of       DATE        NOT NULL,
  payload_json  JSONB       NOT NULL,
  rendered_html TEXT        NULL,
  status        TEXT        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'sent', 'failed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at       TIMESTAMPTZ NULL,
  UNIQUE (customer_id, week_of)
);

CREATE INDEX ON weekly_digests (customer_id, week_of DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Re-add FK from approval_queue.digest_id to the new table
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE approval_queue
  ADD CONSTRAINT fk_approval_queue_digest
  FOREIGN KEY (digest_id) REFERENCES weekly_digests(id)
  ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Row-Level Security
--    service_role bypasses RLS by default (Supabase default).
--    Authenticated users may SELECT digests for businesses they own.
--    No customer INSERT/UPDATE/DELETE — cron (service_role) is the sole writer.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE weekly_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_digests_read_own"
  ON weekly_digests
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE weekly_digests IS
  'Weekly digest record per business. One row per business per week. '
  'Populated by the digest-builder Inngest cron (Sunday 16:00 UTC). '
  'payload_json = full DigestPayload from digest-writer agent. '
  'rendered_html = optional pre-rendered HTML set before Resend send (Wave 2+). '
  'status: draft (default) → sent (after Resend) | failed (if send errors). '
  'Service-role is sole writer; authenticated users read their own business rows.';

COMMENT ON COLUMN weekly_digests.week_of IS
  'The Monday that opens the digest week (ISO week start, YYYY-MM-DD). '
  'UNIQUE with customer_id — guarantees idempotency: duplicate cron runs are ignored.';

COMMENT ON COLUMN weekly_digests.payload_json IS
  'Full DigestPayload JSON from the digest-writer agent. '
  'Schema: { subject, headlineHtml, bodyHtml, plainText, ctaSections[], generatedAt }. '
  'Defined in apps/web/src/lib/agents/digest-writer/index.ts (DigestPayload interface).';
