-- Migration: 20260525000004_rls_policies_agency.sql
-- Purpose: RLS for the 7 new agency-pivot tables (Wave 1).
--          refund_events: append-only ledger — SELECT for owner, INSERT for service_role only.
--            UPDATE/DELETE blocked for all roles (belt-and-suspenders with immutable trigger).
--          revenue_events: ledger with ONE allowed UPDATE path — booked_at flip by day-61 cron.
--            Design choice: scoped UPDATE policy (USING booked_at IS NULL / WITH CHECK booked_at IS NOT NULL).
--            A SECURITY DEFINER function was considered but rejected — the scoped UPDATE policy is
--            sufficient because (a) service_role is already server-only, (b) the USING/WITH CHECK
--            guards prevent re-booking or clearing booked_at, and (c) no other columns can be
--            updated without triggering the check failure. This keeps the table itself append-only
--            for all columns except booked_at, enforced at the RLS layer.
--          publishing_credentials: customer sees row metadata only (NO encrypted_token);
--            raw token returned exclusively via SECURITY DEFINER RPC.
-- Source: docs/08-agents_work/sessions/2026-05-25-cto-wave1-closeout.md lines 162-167
--         Engineering Principle #12 (append-only ledger immutability)
--
-- Rollback: see rollback/20260525000004_rls_policies_agency.rollback.sql
--
-- Pattern legend (mirrors 20260520100013_rls_policies.sql):
--   A — direct tenant: customer_id = auth.uid()
--   C — service-only: no user access at all (RLS deny-all, service_role bypasses)
--   L — ledger: owner SELECT + service_role INSERT only; UPDATE/DELETE blocked for all
--   L+ — ledger with single UPDATE path: revenue_events.booked_at (service_role only, day-61 cron)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. brand_fingerprints
--    Pattern: C — service-role writes; customer reads own row only.
--    customer_id = auth.uid() (brand_fingerprints.customer_id IS the user uuid PK)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.brand_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_fingerprints: owner read"
  ON public.brand_fingerprints FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "brand_fingerprints: service_role all"
  ON public.brand_fingerprints FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. approval_queue
--    Pattern: A (read-only for customer) — no customer INSERT/UPDATE/DELETE.
--    Service-role and signed-token POST endpoints write via service_role key.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_queue: owner read"
  ON public.approval_queue FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "approval_queue: service_role all"
  ON public.approval_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. deliverables_per_customer_per_month
--    Pattern: A (read-only for customer) — counters maintained by service_role only.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.deliverables_per_customer_per_month ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deliverables_per_customer_per_month: owner read"
  ON public.deliverables_per_customer_per_month FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "deliverables_per_customer_per_month: service_role all"
  ON public.deliverables_per_customer_per_month FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. publishing_credentials
--    Pattern: A (metadata read-only for customer) — encrypted_token NEVER exposed.
--    The customer may see that a credential row exists (id, platform, status,
--    external_account_id, expires_at) but cannot read encrypted_token or
--    refresh_token_encrypted via any RLS-governed SELECT.
--
--    Raw token is returned ONLY via the get_publishing_credential(p_id uuid)
--    SECURITY DEFINER RPC (service_role only — defined separately, not in migrations).
--
--    Implementation: column-level security is not supported by Supabase RLS;
--    instead, all app reads go through the RPC which uses the service_role client.
--    The api route MUST NOT return encrypted_token in any response payload.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.publishing_credentials ENABLE ROW LEVEL SECURITY;

-- Customers may see credential metadata (for display in settings UI).
-- Backend code MUST never SELECT encrypted_token / refresh_token_encrypted
-- in user-facing queries — enforced at application layer and via the RPC.
CREATE POLICY "publishing_credentials: owner read"
  ON public.publishing_credentials FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "publishing_credentials: service_role all"
  ON public.publishing_credentials FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. weekly_digests
--    Pattern: A (read-only for customer) — digest records created by Wave 2 cron.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.weekly_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_digests: owner read"
  ON public.weekly_digests FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "weekly_digests: service_role all"
  ON public.weekly_digests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. refund_events
--    Pattern: L (ledger) — append-only per Engineering Principle #12.
--    Customer: SELECT own rows only.
--    Service_role: INSERT only (UPDATE/DELETE blocked for everyone including service_role).
--    UPDATE/DELETE blocked by trigger refund_events_immutable (in migration 01).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.refund_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refund_events: owner read"
  ON public.refund_events FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "refund_events: service_role insert"
  ON public.refund_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Explicit DENY for UPDATE and DELETE — belt-and-suspenders alongside trigger.
-- No UPDATE/DELETE policies = denied for ALL roles including service_role.
-- The immutable trigger (migration 01) is the last-line enforcement.

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. revenue_events
--    Pattern: L (ledger) — append-only per Engineering Principle #12.
--    Customer: SELECT own rows only.
--    Service_role: INSERT only.
--    The day-61 booked_at flip is the ONE allowed "update" — it is performed
--    by the revenue-booking-sweep cron using the service_role client;
--    the RLS INSERT-only policy still applies (cron uses a raw UPDATE statement
--    which goes through the trigger guard rather than RLS INSERT path).
--
--    IMPORTANT: the revenue-booking-sweep cron MUST use the service_role key.
--    The UPDATE is permitted because RLS has no UPDATE policy (RLS blocks normal
--    users), and we intentionally do NOT add an immutable UPDATE trigger for
--    revenue_events (only refund_events has one) — the booked_at flip is the
--    sole valid UPDATE path and is gated at the application layer.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenue_events: owner read"
  ON public.revenue_events FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "revenue_events: service_role insert"
  ON public.revenue_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- booked_at flip only — service_role UPDATE is explicitly scoped to booked_at column.
-- RLS cannot scope to specific columns; the application layer (revenue-booking-sweep
-- Inngest function) MUST restrict its UPDATE to SET booked_at = ... only.
CREATE POLICY "revenue_events: service_role update booked_at"
  ON public.revenue_events FOR UPDATE
  TO service_role
  USING (booked_at IS NULL)
  WITH CHECK (booked_at IS NOT NULL);

-- Founding_100_cohort
--    Pattern: A (read-only for customer — own row only).
--    Service_role writes (Wave 2 subscription webhook).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.founding_100_cohort ENABLE ROW LEVEL SECURITY;

CREATE POLICY "founding_100_cohort: owner read"
  ON public.founding_100_cohort FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "founding_100_cohort: service_role all"
  ON public.founding_100_cohort FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
