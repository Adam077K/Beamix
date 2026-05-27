-- Rollback: 20260525000004_rls_policies_agency.sql
-- Reverses all RLS policies for the 7 agency-pivot tables.
-- Safe to run: disabling RLS is non-destructive to data.
-- After rollback, tables will deny all access (RLS disabled = open to all roles).
-- Re-run the forward migration to restore policies.

-- 1. brand_fingerprints
DROP POLICY IF EXISTS "brand_fingerprints: owner read" ON public.brand_fingerprints;
DROP POLICY IF EXISTS "brand_fingerprints: service_role all" ON public.brand_fingerprints;
ALTER TABLE public.brand_fingerprints DISABLE ROW LEVEL SECURITY;

-- 2. approval_queue
DROP POLICY IF EXISTS "approval_queue: owner read" ON public.approval_queue;
DROP POLICY IF EXISTS "approval_queue: service_role all" ON public.approval_queue;
ALTER TABLE public.approval_queue DISABLE ROW LEVEL SECURITY;

-- 3. deliverables_per_customer_per_month
DROP POLICY IF EXISTS "deliverables_per_customer_per_month: owner read" ON public.deliverables_per_customer_per_month;
DROP POLICY IF EXISTS "deliverables_per_customer_per_month: service_role all" ON public.deliverables_per_customer_per_month;
ALTER TABLE public.deliverables_per_customer_per_month DISABLE ROW LEVEL SECURITY;

-- 4. publishing_credentials
DROP POLICY IF EXISTS "publishing_credentials: owner read" ON public.publishing_credentials;
DROP POLICY IF EXISTS "publishing_credentials: service_role all" ON public.publishing_credentials;
ALTER TABLE public.publishing_credentials DISABLE ROW LEVEL SECURITY;

-- 5. weekly_digests
DROP POLICY IF EXISTS "weekly_digests: owner read" ON public.weekly_digests;
DROP POLICY IF EXISTS "weekly_digests: service_role all" ON public.weekly_digests;
ALTER TABLE public.weekly_digests DISABLE ROW LEVEL SECURITY;

-- 6. refund_events
DROP POLICY IF EXISTS "refund_events: owner read" ON public.refund_events;
DROP POLICY IF EXISTS "refund_events: service_role insert" ON public.refund_events;
ALTER TABLE public.refund_events DISABLE ROW LEVEL SECURITY;

-- 7. revenue_events
DROP POLICY IF EXISTS "revenue_events: owner read" ON public.revenue_events;
DROP POLICY IF EXISTS "revenue_events: service_role insert" ON public.revenue_events;
DROP POLICY IF EXISTS "revenue_events: service_role update booked_at" ON public.revenue_events;
ALTER TABLE public.revenue_events DISABLE ROW LEVEL SECURITY;

-- 8. founding_100_cohort
DROP POLICY IF EXISTS "founding_100_cohort: owner read" ON public.founding_100_cohort;
DROP POLICY IF EXISTS "founding_100_cohort: service_role all" ON public.founding_100_cohort;
ALTER TABLE public.founding_100_cohort DISABLE ROW LEVEL SECURITY;
