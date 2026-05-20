-- Migration: 20260520_09_signals.sql
-- Purpose: Signal tables — notifications, url_probes, competitors, competitor_results, citation_signals
-- Rollback: DROP TABLE citation_signals, competitor_results, competitors, url_probes, notifications CASCADE;

-- Notifications (user-facing alerts)
CREATE TABLE notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id     uuid REFERENCES businesses(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  title           text NOT NULL,
  body            text,
  metadata        jsonb,
  is_read         boolean NOT NULL DEFAULT false,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_id_idx ON notifications (user_id);
CREATE INDEX notifications_user_unread_idx ON notifications (user_id, is_read) WHERE NOT is_read;
CREATE INDEX notifications_created_at_idx ON notifications (created_at DESC);

-- URL probes (H8: cross-tenant lockdown)
-- PK = (business_id, url, queued_at) per spec
-- business_id FK prevents cross-tenant access; RLS scoped by business_id
CREATE TABLE url_probes (
  business_id   uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  url           text NOT NULL,
  queued_at     timestamptz NOT NULL DEFAULT now(),
  status        text NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  result        jsonb,
  completed_at  timestamptz,
  error_message text,
  PRIMARY KEY (business_id, url, queued_at)
);

CREATE INDEX url_probes_business_id_idx ON url_probes (business_id);
CREATE INDEX url_probes_status_idx ON url_probes (status) WHERE status IN ('pending', 'running');

-- Competitors (business's tracked competitors)
CREATE TABLE competitors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name            text NOT NULL,
  website_url     text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, website_url)
);

CREATE INDEX competitors_business_id_idx ON competitors (business_id);

-- Competitor results (scan results per competitor)
CREATE TABLE competitor_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  competitor_id   uuid NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  scan_id         uuid REFERENCES scans(id) ON DELETE SET NULL,
  engine          text NOT NULL,
  is_mentioned    boolean NOT NULL DEFAULT false,
  rank_position   int,
  sentiment       text,
  citations       text[] DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX competitor_results_business_id_idx ON competitor_results (business_id);
CREATE INDEX competitor_results_competitor_id_idx ON competitor_results (competitor_id);
CREATE INDEX competitor_results_scan_id_idx ON competitor_results (scan_id);

-- Citation signals (Home Leading-Indicator Panel — board April-17)
-- Feeds the Home page with AI citation data per engine per query
CREATE TABLE citation_signals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  engine          text NOT NULL,
  query_text      text NOT NULL,
  cited_url       text NOT NULL,
  detected_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX citation_signals_business_id_idx ON citation_signals (business_id);
CREATE INDEX citation_signals_business_detected_idx ON citation_signals (business_id, detected_at DESC);
CREATE INDEX citation_signals_engine_idx ON citation_signals (engine);
