-- Migration 12: RLS Policies + audit_log immutability triggers
-- Covers all tables defined in migrations 03-09.
-- Rollback: DROP POLICY ... ON ...; ALTER TABLE ... DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- PATTERNS:
--   A — tenant via user_id = auth.uid()
--   B — tenant via business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
--   C — service-only (no user access)
--   P — public read (pricing, feature flags)
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 03 TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- TABLE: plans  (Pattern P — public read, service_role write)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans: public read"
  ON public.plans FOR SELECT
  USING (true);

CREATE POLICY "plans: service_role write"
  ON public.plans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: user_profiles  (Pattern A — user_id = auth.uid())
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

-- TABLE: businesses  (Pattern A — user_id = auth.uid())
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

-- TABLE: subscriptions  (Pattern A — user_id = auth.uid())
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions: owner read"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "subscriptions: service_role all"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: paddle_webhook_events  (Pattern C — service-only)
ALTER TABLE public.paddle_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paddle_webhook_events: service_role all"
  ON public.paddle_webhook_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 04 TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- TABLE: credit_pools  (Pattern A — user_id = auth.uid())
ALTER TABLE public.credit_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_pools: owner read"
  ON public.credit_pools FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "credit_pools: service_role all"
  ON public.credit_pools FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: credit_transactions  (Pattern A — user_id = auth.uid())
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_transactions: owner read"
  ON public.credit_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "credit_transactions: service_role all"
  ON public.credit_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: credit_holds  (Pattern A — user_id = auth.uid())
ALTER TABLE public.credit_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_holds: owner read"
  ON public.credit_holds FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "credit_holds: service_role all"
  ON public.credit_holds FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: daily_cap_usage  (Pattern A — user_id = auth.uid())
ALTER TABLE public.daily_cap_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_cap_usage: owner read"
  ON public.daily_cap_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "daily_cap_usage: service_role all"
  ON public.daily_cap_usage FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 05 TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- TABLE: scans  (Pattern B — via businesses.user_id)
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

-- TABLE: scan_engine_results  (Pattern B — via businesses.user_id)
ALTER TABLE public.scan_engine_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scan_engine_results: owner read"
  ON public.scan_engine_results FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "scan_engine_results: service_role all"
  ON public.scan_engine_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: query_clusters  (Pattern B — via businesses.user_id)
ALTER TABLE public.query_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "query_clusters: owner read"
  ON public.query_clusters FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "query_clusters: owner write"
  ON public.query_clusters FOR ALL
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

CREATE POLICY "query_clusters: service_role all"
  ON public.query_clusters FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: tracked_queries  (Pattern B — via businesses.user_id)
ALTER TABLE public.tracked_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracked_queries: owner read"
  ON public.tracked_queries FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tracked_queries: owner write"
  ON public.tracked_queries FOR ALL
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

CREATE POLICY "tracked_queries: service_role all"
  ON public.tracked_queries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: query_positions  (Pattern B — via businesses.user_id)
ALTER TABLE public.query_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "query_positions: owner read"
  ON public.query_positions FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "query_positions: service_role all"
  ON public.query_positions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 06 TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- TABLE: agent_jobs  (Pattern A — user_id = auth.uid())
ALTER TABLE public.agent_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_jobs: owner read"
  ON public.agent_jobs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "agent_jobs: service_role all"
  ON public.agent_jobs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: agent_job_outputs  (Pattern A via agent_jobs.user_id)
ALTER TABLE public.agent_job_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_job_outputs: owner read"
  ON public.agent_job_outputs FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM agent_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "agent_job_outputs: service_role all"
  ON public.agent_job_outputs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: agent_costs  (Pattern A — user_id = auth.uid())
ALTER TABLE public.agent_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_costs: owner read"
  ON public.agent_costs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "agent_costs: service_role all"
  ON public.agent_costs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: page_locks  (Pattern C — service-only; internal coordination table)
ALTER TABLE public.page_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_locks: service_role all"
  ON public.page_locks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: topic_ledger  (Pattern B — via businesses.user_id)
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

-- TABLE: topic_ledger_archive  (Pattern C — service-only; archive table)
ALTER TABLE public.topic_ledger_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "topic_ledger_archive: service_role all"
  ON public.topic_ledger_archive FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 07 TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- TABLE: content_items  (Pattern A — user_id = auth.uid())
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_items: owner read"
  ON public.content_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "content_items: owner write"
  ON public.content_items FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "content_items: service_role all"
  ON public.content_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: inbox_items  (Pattern A — user_id = auth.uid())
ALTER TABLE public.inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inbox_items: owner read"
  ON public.inbox_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "inbox_items: owner write"
  ON public.inbox_items FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "inbox_items: service_role all"
  ON public.inbox_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: archive_items  (Pattern A — user_id = auth.uid())
ALTER TABLE public.archive_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archive_items: owner read"
  ON public.archive_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "archive_items: service_role all"
  ON public.archive_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 08 TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- TABLE: automation_schedules  (Pattern A — user_id = auth.uid())
ALTER TABLE public.automation_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automation_schedules: owner read"
  ON public.automation_schedules FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "automation_schedules: owner write"
  ON public.automation_schedules FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "automation_schedules: service_role all"
  ON public.automation_schedules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: suggestions  (Pattern A — user_id = auth.uid())
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suggestions: owner read"
  ON public.suggestions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "suggestions: service_role all"
  ON public.suggestions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: system_kill_switch  (Pattern C — service-only singleton)
ALTER TABLE public.system_kill_switch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_kill_switch: service_role all"
  ON public.system_kill_switch FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 09 TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- TABLE: notifications  (Pattern A — user_id = auth.uid())
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications: owner read"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications: owner write"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications: service_role all"
  ON public.notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: url_probes  (Pattern B — via businesses.user_id)
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

-- TABLE: competitors  (Pattern B — via businesses.user_id)
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitors: owner read"
  ON public.competitors FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "competitors: owner write"
  ON public.competitors FOR ALL
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

CREATE POLICY "competitors: service_role all"
  ON public.competitors FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: competitor_results  (Pattern B — via businesses.user_id)
ALTER TABLE public.competitor_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitor_results: owner read"
  ON public.competitor_results FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "competitor_results: service_role all"
  ON public.competitor_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: citation_signals  (Pattern B — via businesses.user_id)
ALTER TABLE public.citation_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "citation_signals: owner read"
  ON public.citation_signals FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "citation_signals: service_role all"
  ON public.citation_signals FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- audit_log IMMUTABILITY TRIGGERS
-- Only plpgsql allowed here (spec exception for trigger functions)
-- ═══════════════════════════════════════════════════════════════════════════════

-- TABLE: audit_log — defined elsewhere; RLS + immutability added here.
-- If audit_log does not exist yet, this migration will error intentionally
-- (it must be created by whichever migration owns audit_log DDL).
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log: service_role all"
  ON public.audit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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

-- ═══════════════════════════════════════════════════════════════════════════════
-- feature_flags  (Pattern P — public read, service_role write)
-- ═══════════════════════════════════════════════════════════════════════════════
-- NOTE: feature_flags table must exist before this runs.
-- If not yet defined, this will error intentionally.
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags: public read"
  ON public.feature_flags FOR SELECT
  USING (true);

CREATE POLICY "feature_flags: service_role write"
  ON public.feature_flags FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
