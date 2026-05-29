-- Rollback: 20260529000006_weekly_digests.rollback.sql
-- Purpose: Restore weekly_digests to its pre-20260529000006 state
--          (schema as created by 20260525000001_agency_tables.sql)
--
-- WARNING: This rollback is only safe when weekly_digests has no rows.
--          If digests have been sent, DO NOT rollback — audit and patch forward instead.

-- 1. Drop FK from approval_queue referencing the new table
ALTER TABLE approval_queue DROP CONSTRAINT IF EXISTS fk_approval_queue_digest;

-- 2. Drop new weekly_digests (index + table)
DROP INDEX IF EXISTS "weekly_digests_customer_id_week_of_idx";
DROP TABLE IF EXISTS weekly_digests;

-- 3. Restore original Wave 1 schema
CREATE TABLE weekly_digests (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    uuid        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  week_start     date        NOT NULL,
  week_end       date        NOT NULL,
  body_html      text        NOT NULL,
  body_text      text        NOT NULL,
  approval_token text        NOT NULL UNIQUE,
  sent_at        timestamptz,
  opened_at      timestamptz,
  metrics        jsonb       NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, week_start)
);

CREATE INDEX idx_weekly_digests_customer_week
  ON weekly_digests (customer_id, week_start DESC);

ALTER TABLE weekly_digests ENABLE ROW LEVEL SECURITY;

-- 4. Re-add FK from approval_queue.digest_id to restored table
ALTER TABLE approval_queue
  ADD CONSTRAINT fk_approval_queue_digest
  FOREIGN KEY (digest_id) REFERENCES weekly_digests(id)
  ON DELETE SET NULL;
