-- Migration: 20260520_08_automation.sql
-- Purpose: Automation tables — automation_schedules, suggestions, system_kill_switch
-- Rollback: DROP TABLE system_kill_switch, suggestions, automation_schedules CASCADE;

-- Automation schedules (recurring agent runs configured by user)
CREATE TABLE automation_schedules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  agent_type      agent_type NOT NULL,
  cron_expression text,
  is_active       boolean NOT NULL DEFAULT true,
  last_run_at     timestamptz,
  next_run_at     timestamptz,
  run_count       int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX automation_schedules_user_id_idx ON automation_schedules (user_id);
CREATE INDEX automation_schedules_business_id_idx ON automation_schedules (business_id);
CREATE INDEX automation_schedules_next_run_idx ON automation_schedules (next_run_at) WHERE is_active;

-- Suggestions (proactive agent suggestions — Day-1 staggered visibility)
-- visible_at: Day-1 staggered display. Top suggestion visible immediately;
--             next 2 at NOW() + 60s per 03-DAY-1-FLOW.md Step E.
--             Home page filters WHERE visible_at <= NOW(). Refresh-safe.
CREATE TABLE suggestions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  agent_type      agent_type NOT NULL,
  status          suggestion_status NOT NULL DEFAULT 'pending',
  title           text NOT NULL,
  description     text,
  rationale       text,
  estimated_impact text, -- 'low', 'medium', 'high'
  visible_at      timestamptz NOT NULL DEFAULT now(),
  dismissed_at    timestamptz,
  converted_at    timestamptz,
  converted_job_id uuid REFERENCES agent_jobs(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX suggestions_user_id_idx ON suggestions (user_id);
CREATE INDEX suggestions_business_id_idx ON suggestions (business_id);
CREATE INDEX suggestions_status_idx ON suggestions (status);
-- Composite index for home page query: WHERE business_id = ? AND visible_at <= NOW()
CREATE INDEX suggestions_business_visible_idx ON suggestions (business_id, visible_at);

-- Global kill switch (H3)
-- id int PRIMARY KEY DEFAULT 1 enforces singleton row pattern
-- service_role-only — no anon/user access
-- paused_until: NULL means not paused
CREATE TABLE system_kill_switch (
  id          int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  paused_until timestamptz,
  paused_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason      text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Insert default row (singleton — no global pause on init)
INSERT INTO system_kill_switch (id, paused_until, reason)
VALUES (1, NULL, 'initial state')
ON CONFLICT (id) DO NOTHING;
