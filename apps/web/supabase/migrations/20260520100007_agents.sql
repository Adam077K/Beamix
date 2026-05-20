-- Migration: 20260520_06_agents.sql
-- Purpose: Agent tables — agent_jobs, agent_job_outputs, agent_costs, page_locks, topic_ledger,
--          topic_ledger_archive, daily_cap_usage (already in 04_credits)
-- Rollback: DROP TABLE topic_ledger_archive, topic_ledger, page_locks, agent_costs,
--           agent_job_outputs, agent_jobs CASCADE;

-- Agent jobs (one per agent run)
CREATE TABLE agent_jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  agent_type      agent_type NOT NULL,
  status          agent_job_status NOT NULL DEFAULT 'queued',
  stage           pipeline_stage,
  plan_tier       plan_tier NOT NULL,
  target_url      text,
  target_content  text,
  scan_id         uuid REFERENCES scans(id) ON DELETE SET NULL,
  custom_instructions text,
  credit_cost     int NOT NULL DEFAULT 0,
  started_at      timestamptz,
  completed_at    timestamptz,
  error_message   text,
  inngest_run_id  text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX agent_jobs_user_id_idx ON agent_jobs (user_id);
CREATE INDEX agent_jobs_business_id_idx ON agent_jobs (business_id);
CREATE INDEX agent_jobs_status_idx ON agent_jobs (status) WHERE status IN ('queued', 'running');
CREATE INDEX agent_jobs_agent_type_idx ON agent_jobs (agent_type);
CREATE INDEX agent_jobs_created_at_idx ON agent_jobs (created_at DESC);

-- Agent job outputs (the deliverable content from each agent run)
CREATE TABLE agent_job_outputs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           uuid NOT NULL REFERENCES agent_jobs(id) ON DELETE CASCADE,
  primary_content  text NOT NULL,
  content_format   text NOT NULL DEFAULT 'markdown', -- 'markdown', 'html', 'json_ld', 'structured_report', 'plain_text'
  summary_text     text,
  target_queries   text[] DEFAULT '{}',
  geo_signals      jsonb,
  ymyl_flagged     boolean NOT NULL DEFAULT false,
  estimated_impact text, -- 'low', 'medium', 'high'
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX agent_job_outputs_job_id_idx ON agent_job_outputs (job_id);

-- Agent costs (one row per LLM call within a job)
CREATE TABLE agent_costs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            uuid NOT NULL REFERENCES agent_jobs(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage             pipeline_stage NOT NULL,
  model             text NOT NULL,
  provider          text NOT NULL, -- 'openrouter', 'perplexity', 'anthropic'
  prompt_tokens     int NOT NULL DEFAULT 0,
  completion_tokens int NOT NULL DEFAULT 0,
  cost_usd          numeric(10,6) NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX agent_costs_job_id_idx ON agent_costs (job_id);
CREATE INDEX agent_costs_user_id_idx ON agent_costs (user_id);
CREATE INDEX agent_costs_created_at_idx ON agent_costs (created_at DESC);

-- Page locks (prevents concurrent agents from targeting same page)
-- created_at enables 2h TTL cleanup (retention trigger F8)
-- Wave 1 BE-1 adds Inngest sweep deleting rows older than 2h
CREATE TABLE page_locks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  url          text NOT NULL,
  locked_by    uuid NOT NULL REFERENCES agent_jobs(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '2 hours'),
  UNIQUE (business_id, url)
);

CREATE INDEX page_locks_business_id_idx ON page_locks (business_id);
CREATE INDEX page_locks_business_created_at_idx ON page_locks (business_id, created_at);
CREATE INDEX page_locks_expires_at_idx ON page_locks (expires_at);

-- Topic ledger (deduplication — prevents the same topic being covered twice)
-- registered_at enables 365-day retention (retention trigger F8)
CREATE TABLE topic_ledger (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  topic_key       text NOT NULL,  -- normalized topic identifier
  agent_type      agent_type NOT NULL,
  job_id          uuid REFERENCES agent_jobs(id) ON DELETE SET NULL,
  registered_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, topic_key)
);

CREATE INDEX topic_ledger_business_id_idx ON topic_ledger (business_id);
CREATE INDEX topic_ledger_business_created_at_idx ON topic_ledger (business_id, registered_at);

-- Topic ledger archive (365-day retention archive — monthly Inngest cron archive-old-topics)
-- RLS identical to topic_ledger (owner read on business_id, service-role full)
-- Note: LIKE ... INCLUDING ALL copies indexes from topic_ledger with auto-generated names.
-- No explicit index creation needed — they are already included.
CREATE TABLE topic_ledger_archive (LIKE topic_ledger INCLUDING ALL);

-- Cleanup function for page_locks (2h TTL)
-- Wave 0 choice: LANGUAGE sql function (no pg_cron dependency); Inngest cron cleanup-page-locks
-- calls this via RPC every 15 min. pg_cron avoided to reduce extension dependencies.
CREATE OR REPLACE FUNCTION cleanup_page_locks() RETURNS void
LANGUAGE sql AS $$
  DELETE FROM page_locks WHERE created_at < now() - interval '2 hours';
$$;
