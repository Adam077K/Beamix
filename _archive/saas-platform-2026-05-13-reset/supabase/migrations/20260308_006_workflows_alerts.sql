-- ============================================================
-- Migration 006: Workflow & Alert Tables
-- Tables: agent_workflows, workflow_runs, alert_rules, notifications,
--         notification_preferences
-- ============================================================

-- ============================================================
-- agent_workflows (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN (
    'visibility_drop', 'scan_complete', 'competitor_overtake',
    'schedule', 'manual', 'content_published', 'sentiment_shift'
  )),
  trigger_config jsonb NOT NULL DEFAULT '{}',
  steps jsonb NOT NULL,
  is_active boolean DEFAULT true,
  max_runs_per_month integer DEFAULT 10,
  runs_this_month integer DEFAULT 0,
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_biz ON public.agent_workflows(business_id) WHERE is_active = true;

ALTER TABLE public.agent_workflows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own workflows" ON public.agent_workflows;
CREATE POLICY "Users can manage own workflows" ON public.agent_workflows
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER set_workflows_updated_at
  BEFORE UPDATE ON public.agent_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- workflow_runs (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.agent_workflows(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_event jsonb NOT NULL,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  steps_completed integer DEFAULT 0,
  steps_total integer NOT NULL,
  agent_job_ids uuid[] DEFAULT '{}',
  results_summary jsonb,
  credits_used integer DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT NOW(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON public.workflow_runs(workflow_id, started_at DESC);

ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own workflow runs" ON public.workflow_runs;
CREATE POLICY "Users can view own workflow runs" ON public.workflow_runs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages workflow runs" ON public.workflow_runs;
CREATE POLICY "Service role manages workflow runs" ON public.workflow_runs
  FOR ALL USING (true);

-- ============================================================
-- alert_rules (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN (
    'visibility_drop', 'visibility_improvement', 'new_competitor',
    'competitor_overtake', 'sentiment_shift', 'credit_low',
    'content_performance', 'scan_complete', 'agent_complete', 'trial_ending'
  )),
  threshold jsonb NOT NULL,
  channels text[] NOT NULL DEFAULT '{inapp}',
  is_active boolean DEFAULT true,
  cooldown_hours integer DEFAULT 24,
  last_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_biz ON public.alert_rules(business_id) WHERE is_active = true;

ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own alert rules" ON public.alert_rules;
CREATE POLICY "Users can manage own alert rules" ON public.alert_rules
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- notifications (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('high', 'medium', 'low')),
  title text NOT NULL,
  body text NOT NULL,
  action_url text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages notifications" ON public.notifications;
CREATE POLICY "Service role manages notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- notification_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  email_digest text DEFAULT 'daily' CHECK (email_digest IN ('realtime', 'daily', 'weekly', 'off')),
  inapp_enabled boolean DEFAULT true,
  slack_webhook_url text,
  slack_enabled boolean DEFAULT false,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS email_digest text DEFAULT 'daily';
  ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS inapp_enabled boolean DEFAULT true;
  ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS slack_webhook_url text;
  ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS slack_enabled boolean DEFAULT false;
  ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS quiet_hours_start time;
  ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS quiet_hours_end time;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification prefs" ON public.notification_preferences;
CREATE POLICY "Users can view own notification prefs" ON public.notification_preferences
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notification prefs" ON public.notification_preferences;
CREATE POLICY "Users can update own notification prefs" ON public.notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages notification prefs" ON public.notification_preferences;
CREATE POLICY "Service role manages notification prefs" ON public.notification_preferences
  FOR ALL USING (true);

CREATE TRIGGER set_notification_prefs_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
