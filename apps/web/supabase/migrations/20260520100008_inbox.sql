-- Migration: 20260520_07_inbox.sql
-- Purpose: Content lifecycle tables — inbox_items, archive_items, content_items
-- Rollback: DROP TABLE content_items, archive_items, inbox_items CASCADE;

-- Content items (canonical body store — shared by inbox and archive)
CREATE TABLE content_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  job_id          uuid REFERENCES agent_jobs(id) ON DELETE SET NULL,
  agent_type      agent_type,
  primary_content text NOT NULL,
  content_format  text NOT NULL DEFAULT 'markdown',
  summary_text    text,
  target_queries  text[] DEFAULT '{}',
  geo_signals     jsonb,
  ymyl_flagged    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX content_items_user_id_idx ON content_items (user_id);
CREATE INDEX content_items_business_id_idx ON content_items (business_id);
CREATE INDEX content_items_job_id_idx ON content_items (job_id);
CREATE INDEX content_items_created_at_idx ON content_items (created_at DESC);

-- Inbox items (items awaiting review/approval)
CREATE TABLE inbox_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  content_item_id uuid REFERENCES content_items(id) ON DELETE SET NULL,
  job_id          uuid REFERENCES agent_jobs(id) ON DELETE SET NULL,
  agent_type      agent_type,
  status          inbox_status NOT NULL DEFAULT 'draft',
  title           text NOT NULL,
  preview_text    text,
  reviewed_at     timestamptz,
  approved_at     timestamptz,
  rejected_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX inbox_items_user_id_idx ON inbox_items (user_id);
CREATE INDEX inbox_items_business_id_idx ON inbox_items (business_id);
CREATE INDEX inbox_items_status_idx ON inbox_items (status);
CREATE INDEX inbox_items_created_at_idx ON inbox_items (created_at DESC);

-- Archive items (approved and archived content)
CREATE TABLE archive_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  content_item_id uuid REFERENCES content_items(id) ON DELETE SET NULL,
  inbox_item_id   uuid REFERENCES inbox_items(id) ON DELETE SET NULL,
  job_id          uuid REFERENCES agent_jobs(id) ON DELETE SET NULL,
  agent_type      agent_type,
  title           text NOT NULL,
  archived_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX archive_items_user_id_idx ON archive_items (user_id);
CREATE INDEX archive_items_business_id_idx ON archive_items (business_id);
CREATE INDEX archive_items_archived_at_idx ON archive_items (archived_at DESC);
