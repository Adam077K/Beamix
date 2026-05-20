-- Migration: 20260520_05_scans.sql
-- Purpose: Scan tables — scans, scan_engine_results, query_clusters, tracked_queries, query_positions
-- Rollback: DROP TABLE query_positions, tracked_queries, query_clusters, scan_engine_results, scans CASCADE;

-- Scans (top-level scan run per business)
CREATE TABLE scans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  scan_type       text NOT NULL DEFAULT 'manual', -- 'free', 'manual', 'scheduled'
  status          text NOT NULL DEFAULT 'queued',  -- 'queued', 'running', 'completed', 'failed'
  started_at      timestamptz,
  completed_at    timestamptz,
  error_message   text,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX scans_business_id_idx ON scans (business_id);
CREATE INDEX scans_business_created_idx ON scans (business_id, created_at DESC);
CREATE INDEX scans_status_idx ON scans (status) WHERE status IN ('queued', 'running');

-- Scan engine results (one row per engine per scan)
CREATE TABLE scan_engine_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id         uuid NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  engine          text NOT NULL, -- 'chatgpt', 'gemini', 'perplexity', 'claude', 'grok', 'you_com', etc.
  rank_position   int,
  is_mentioned    boolean NOT NULL DEFAULT false,
  sentiment       text, -- 'positive', 'neutral', 'negative', 'not_mentioned'
  citations       text[] DEFAULT '{}',
  raw_response    text,
  query_used      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX scan_engine_results_scan_id_idx ON scan_engine_results (scan_id);
CREATE INDEX scan_engine_results_business_id_idx ON scan_engine_results (business_id);
CREATE INDEX scan_engine_results_engine_idx ON scan_engine_results (engine);

-- Query clusters (logical groupings of related queries)
CREATE TABLE query_clusters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  cluster_name    text NOT NULL,
  intent          text, -- 'informational', 'navigational', 'transactional', 'commercial'
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX query_clusters_business_id_idx ON query_clusters (business_id);

-- Tracked queries (specific queries being monitored per business)
CREATE TABLE tracked_queries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  cluster_id      uuid REFERENCES query_clusters(id) ON DELETE SET NULL,
  query_text      text NOT NULL,
  volume_estimate int,
  intent          text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tracked_queries_business_id_idx ON tracked_queries (business_id);
CREATE INDEX tracked_queries_cluster_id_idx ON tracked_queries (cluster_id);
CREATE INDEX tracked_queries_query_text_trgm_idx ON tracked_queries USING GIN (query_text gin_trgm_ops);

-- Query positions (historical position data per query per scan)
CREATE TABLE query_positions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id         uuid NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  query_id        uuid REFERENCES tracked_queries(id) ON DELETE SET NULL,
  query_text      text NOT NULL,
  engine          text NOT NULL,
  position        int,
  is_mentioned    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX query_positions_scan_id_idx ON query_positions (scan_id);
CREATE INDEX query_positions_business_id_idx ON query_positions (business_id);
CREATE INDEX query_positions_query_id_idx ON query_positions (query_id);
