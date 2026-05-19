-- Migration 12: RLS Policies + audit_log immutability triggers
-- Rollback: DROP POLICY ... ON ...; ALTER TABLE ... DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: auth.uid() is available in Supabase (from GoTrue JWT claims)
-- Pattern A — tenant tables: user owns via user_id column
-- Pattern B — tenant tables: user owns via business_id → businesses.user_id
-- Pattern C — service-only tables: only service_role may read/write
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: user_profiles  (Pattern A — user_id = auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles: owner read"
  ON public.user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_profiles: owner write"
  ON public.user_profiles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles: service_role all"
  ON public.user_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: plans  (public read — pricing is not secret)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans: public read"
  ON public.plans FOR SELECT
  USING (true);

CREATE POLICY "plans: service_role write"
  ON public.plans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: subscriptions  (Pattern A — user_id = auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions: owner read"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "subscriptions: service_role all"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: businesses  (Pattern A — user_id = auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "businesses: owner read"
  ON public.businesses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "businesses: owner write"
  ON public.businesses FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "businesses: service_role all"
  ON public.businesses FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: credit_pools  (Pattern A — user_id = auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.credit_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_pools: owner read"
  ON public.credit_pools FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "credit_pools: service_role all"
  ON public.credit_pools FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: credit_holds  (Pattern A via pool → user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.credit_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_holds: owner read"
  ON public.credit_holds FOR SELECT
  USING (
    pool_id IN (
      SELECT id FROM credit_pools WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "credit_holds: service_role all"
  ON public.credit_holds FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: daily_cap_usage  (Pattern A — user_id = auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.daily_cap_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_cap_usage: owner read"
  ON public.daily_cap_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "daily_cap_usage: service_role all"
  ON public.daily_cap_usage FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: scans  (Pattern B — via businesses.user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scans: owner read"
  ON public.scans FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "scans: service_role all"
  ON public.scans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: scan_engine_results  (Pattern B — via scans → businesses.user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.scan_engine_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scan_engine_results: owner read"
  ON public.scan_engine_results FOR SELECT
  USING (
    scan_id IN (
      SELECT s.id FROM scans s
      JOIN businesses b ON b.id = s.business_id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "scan_engine_results: service_role all"
  ON public.scan_engine_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: free_scans  (Pattern C — service-only; anonymous rows, no user link)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.free_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "free_scans: service_role all"
  ON public.free_scans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: agent_jobs  (Pattern B — via businesses.user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.agent_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_jobs: owner read"
  ON public.agent_jobs FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "agent_jobs: service_role all"
  ON public.agent_jobs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: content_items  (Pattern B — via businesses.user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_items: owner read"
  ON public.content_items FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "content_items: owner write"
  ON public.content_items FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "content_items: service_role all"
  ON public.content_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: inbox_items  (Pattern B — via businesses.user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inbox_items: owner read"
  ON public.inbox_items FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "inbox_items: owner write"
  ON public.inbox_items FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "inbox_items: service_role all"
  ON public.inbox_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: workflows  (Pattern B — via businesses.user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflows: owner read"
  ON public.workflows FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "workflows: owner write"
  ON public.workflows FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "workflows: service_role all"
  ON public.workflows FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: workflow_runs  (Pattern B — via workflows → businesses.user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflow_runs: owner read"
  ON public.workflow_runs FOR SELECT
  USING (
    workflow_id IN (
      SELECT w.id FROM workflows w
      JOIN businesses b ON b.id = w.business_id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "workflow_runs: service_role all"
  ON public.workflow_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: automation_suggestions  (Pattern B — via businesses.user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.automation_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automation_suggestions: owner read"
  ON public.automation_suggestions FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "automation_suggestions: service_role all"
  ON public.automation_suggestions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: url_probes  (Pattern B — via businesses.user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.url_probes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "url_probes: owner read"
  ON public.url_probes FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "url_probes: service_role all"
  ON public.url_probes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: page_locks  (Pattern C — service-only; internal coordination table)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.page_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_locks: service_role all"
  ON public.page_locks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: topic_ledger  (Pattern B — via businesses.user_id)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.topic_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "topic_ledger: owner read"
  ON public.topic_ledger FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "topic_ledger: service_role all"
  ON public.topic_ledger FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: topic_ledger_archive  (Pattern C — service-only; archive table)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.topic_ledger_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "topic_ledger_archive: service_role all"
  ON public.topic_ledger_archive FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: paddle_webhook_events  (Pattern C — service-only)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.paddle_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paddle_webhook_events: service_role all"
  ON public.paddle_webhook_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: audit_log  (Pattern C — service-only; append-only)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log: service_role all"
  ON public.audit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: feature_flags  (public read; service_role write)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags: public read"
  ON public.feature_flags FOR SELECT
  USING (true);

CREATE POLICY "feature_flags: service_role write"
  ON public.feature_flags FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: system_kill_switch  (Pattern C — service-only)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.system_kill_switch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_kill_switch: service_role all"
  ON public.system_kill_switch FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- audit_log IMMUTABILITY TRIGGERS
-- Only plpgsql allowed here (as per spec exception for trigger functions)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.audit_log_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$;

CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_immutable();

CREATE TRIGGER audit_log_no_delete
  BEFORE DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_immutable();
