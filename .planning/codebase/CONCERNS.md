# Codebase Concerns

**Analysis Date:** 2026-02-27

## Tech Debt

**Fire-and-Forget Webhook Calls:**
- Issue: Multiple API routes trigger n8n workflows without awaiting responses or implementing retry logic
- Files:
  - `src/app/api/agents/content-writer/route.ts` (line 65-78)
  - `src/app/api/agents/competitor-research/route.ts` (line 76-86)
  - `src/app/api/agents/query-researcher/route.ts` (line 73-84)
  - `src/app/api/onboarding/complete/route.ts` (line 46-58)
- Impact: Webhooks may fail silently. Failed n8n triggers result in incomplete workflows (analysis never runs, credits never deducted, user never sees results). No error tracking beyond console.log.
- Fix approach:
  1. Implement request/response logging to a `webhook_calls` table
  2. Add exponential backoff retry logic with max 3 attempts
  3. Create a background job monitor to detect failed webhooks after 5 minutes
  4. Alert to error tracking service (Sentry) on repeated failures

**Incomplete Stripe Integration:**
- Issue: Stripe webhook directory is empty (`src/app/api/stripe/`) - no webhook handler for payment events
- Files: `src/app/api/stripe/` (empty directory)
- Impact:
  - Stripe payment webhooks cannot be processed
  - Credit purchases won't be applied to user accounts
  - Subscription upgrades/downgrades won't update database
  - Refunds cannot be handled
- Fix approach:
  1. Create `src/app/api/stripe/webhooks/route.ts` with full webhook signature verification
  2. Handle events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
  3. Create transaction records in database
  4. Reconcile credits in response to webhook events

**Missing Environment Variable Validation:**
- Issue: Environment variables are accessed with `!` (non-null assertion) without validation at startup
- Files:
  - `src/lib/supabase/client.ts` (line 7-8)
  - `src/lib/supabase/server.ts` (line 8-9)
  - `src/app/api/agents/content-writer/route.ts` (line 57)
  - `src/app/api/agents/competitor-research/route.ts` (line 57)
  - `src/app/api/agents/query-researcher/route.ts` (line 60)
- Impact: App starts even if critical env vars are missing. Crashes occur at runtime when accessing undefined values.
- Fix approach:
  1. Create `src/lib/config/validate-env.ts` that runs at app startup
  2. Throw error during build/startup if any required var is missing
  3. Provide clear error messages listing which vars are missing

**Complex Component Files:**
- Issue: Several components exceed 400+ lines and mix business logic with UI rendering
- Files:
  - `src/components/landing/AnimatedDashboard.tsx` (777 lines) - Animation logic, data phases, gauge chart all in one file
  - `src/app/(auth)/signup/page.tsx` (485 lines) - Form handling, validation, API calls, layout all together
  - `src/app/(protected)/layout.tsx` (288 lines) - Navigation, auth state, conditional rendering mixed
  - `src/app/(protected)/dashboard/page.tsx` (219 lines) - Multiple metric cards, date range filters
- Impact: Hard to test, understand, and maintain. Changes to one concern break multiple features.
- Fix approach:
  1. Split AnimatedDashboard into: `GaugeChart`, `PhaseIndicator`, `DashboardAnimation` components
  2. Extract signup form logic into `useSignupForm` hook
  3. Split layout into `Sidebar`, `Navigation`, `NavLink` subcomponents
  4. Break dashboard into reusable metric card components

## Known Bugs

**Onboarding TODO Comment:**
- Issue: Commented-out n8n webhook trigger in onboarding flow
- Files: `src/app/(protected)/onboarding/page.tsx` (lines 71-75)
- Symptoms: Initial analysis workflow may not be triggered when user completes onboarding
- Trigger: Complete onboarding form, redirect to dashboard
- Workaround: Manually trigger workflow via n8n API or API route
- Fix: Uncomment and test the webhook trigger with valid URL

**Missing Query Ownership Verification in Some Routes:**
- Issue: Some API routes don't verify that the user owns the resource before returning data
- Files: `src/app/api/recommendations/route.ts` (properly filters by user_id)
- Impact: Low risk (RLS policies should catch this), but defense-in-depth best practice not followed everywhere
- Fix: Audit all GET endpoints to ensure `eq('user_id', user.id)` is always applied

**Potential Date Calculation Bug:**
- Issue: Monthly credit reset date calculation may be incorrect for months with different day counts
- Files: `src/app/api/credits/balance/route.ts` (line 43-44)
- Symptoms: Reset dates off by 1-2 days for months where last reset day > 28
- Trigger: Users in months with < 31 days (Feb, Apr, Jun, Sep, Nov)
- Workaround: None - credits reset on incorrect date
- Fix: Use date arithmetic library (date-fns) that handles month boundaries correctly

## Security Considerations

**Unauthenticated Webhook Endpoints:**
- Risk: n8n webhooks can be called by anyone with the URL. No secret key validation.
- Files: `src/app/api/agents/content-writer/route.ts` - calls n8n webhook URL without auth
- Current mitigation: n8n webhooks are hidden URLs (hard to guess), but discoverable in source code or network logs
- Recommendations:
  1. Store webhook URLs in Supabase secrets instead of env vars
  2. Add `Authorization: Bearer {SECRET}` header to webhook calls
  3. Implement n8n webhook signature verification if supported
  4. Rotate webhook URLs regularly

**Insufficient Input Validation on Onboarding:**
- Risk: Website URL and company name are user-supplied but may contain XSS or injection vectors
- Files: `src/app/(protected)/onboarding/page.tsx` (lines 56-58), `src/app/api/onboarding/complete/route.ts` (lines 28-31)
- Current mitigation: Basic `.trim()` on input, Supabase RLS should prevent data access
- Recommendations:
  1. Use Zod schema validation on API route
  2. Sanitize HTML in company_name if displayed in rich text contexts
  3. Validate website_url format (must be valid URL)

**No Rate Limiting on AI Agent Endpoints:**
- Risk: Users can spam agent endpoints to generate content indefinitely without hitting credit checks (credit check is soft, not transactional)
- Files: All agent routes (`src/app/api/agents/*/route.ts`)
- Current mitigation: Credit balance check exists, but no transaction lock prevents race conditions
- Recommendations:
  1. Implement optimistic locking on credits table: check balance, then atomically decrement
  2. Add IP-based rate limiting: 5 requests/min per user
  3. Use database trigger to reject credit deduction if balance insufficient

**Error Response Information Disclosure:**
- Risk: Error messages may expose internal database schema or n8n workflow details
- Files: `src/lib/api/responses.ts` (line 62) - exposes error.stack in development
- Current mitigation: Stack traces only shown in development mode
- Recommendations:
  1. Implement error ID tracking (generate UUID for each error)
  2. Return error ID to client, log full details server-side
  3. Users can contact support with error ID to reference issue

## Performance Bottlenecks

**Unoptimized Dashboard Data Query:**
- Problem: Dashboard overview query fetches all ranking data regardless of selected date range, then filters in application code
- Files: `src/app/api/dashboard/overview/route.ts` (line 88) - may fetch large result set
- Cause: Query doesn't apply date range filter at database level
- Improvement path:
  1. Apply `gte('created_at', dateFrom)` filter in Supabase query
  2. Add composite index on (user_id, created_at)
  3. Paginate results if dataset grows beyond 10k records

**No Caching on Frequently-Accessed Data:**
- Problem: Credits balance is refetched every 5 minutes even if unchanged
- Files: `src/lib/hooks/useDashboardData.ts` (line 47) - refetchInterval hardcoded to 5 minutes
- Cause: React Query configured to always refetch on interval, no stale-time optimization
- Improvement path:
  1. Set `staleTime: 2 * 60 * 1000` (2 minutes) on queries
  2. Use `gcTime` to keep data in cache for 30 minutes
  3. Implement background polling only when user has active agent execution

**Large Animated Component Rendering:**
- Problem: AnimatedDashboard component has continuous frame animations that may cause jank on lower-end devices
- Files: `src/components/landing/AnimatedDashboard.tsx` (lines 41-50, 68-72) - requestAnimationFrame loop updates state
- Cause: Using requestAnimationFrame in useEffect triggers full component re-render every frame
- Improvement path:
  1. Use CSS animations instead of JavaScript-based state updates for gauge needle
  2. Memoize animated components to prevent unnecessary renders
  3. Use `will-change: transform` CSS for better GPU acceleration

## Fragile Areas

**Authentication State Management:**
- Files:
  - `src/lib/supabase/middleware.ts` (critical for session refresh)
  - `src/middleware.ts` (routes authentication)
- Why fragile:
  - Middleware reads session in every request
  - If session refresh fails silently, user gets logged out without warning
  - Cookie-based session may have race conditions with concurrent requests
- Safe modification:
  1. Test all auth flows with multiple concurrent requests
  2. Add logging to middleware for session refresh failures
  3. Implement fallback redirect to login if session invalid

**Credit System (Transactional Integrity):**
- Files:
  - `src/lib/api/auth.ts` (checkCredits function)
  - `src/app/api/agents/*/route.ts` (credit checks before n8n triggers)
  - Database: `credits` table
- Why fragile:
  - Credit check is not atomic with deduction
  - Two concurrent requests can both pass credit check, then both deduct (overdraft)
  - No transaction log prevents audit trail
- Safe modification:
  1. Add database trigger that enforces `total_credits >= 0` constraint
  2. Create `credit_transactions` table for immutable audit trail
  3. Use Supabase RPC with transaction to atomically check and decrement
- Test coverage: No existing tests for concurrent credit scenarios

**Data Consistency Between Tables:**
- Files: Signup (`src/app/(auth)/signup/page.tsx`) creates records in both `auth_users` and `customers`
- Why fragile:
  - Two separate insert operations, not in a transaction
  - If second insert fails, user exists in auth but not in customers table
  - May cause queries expecting customers record to fail
- Safe modification:
  1. Create Supabase trigger on `auth.users` insert that automatically creates `customers` record
  2. Add NOT NULL constraint on foreign key references
  3. Test signup with network failures to verify recovery

## Scaling Limits

**Webhook Queue Not Implemented:**
- Current capacity:
  - Single HTTP call per agent request
  - No queue if n8n is down
- Limit: If n8n takes >30s to respond, API route timeouts on Vercel (30s limit)
- Scaling path:
  1. Implement message queue (Supabase pg_queue or Bull with Redis)
  2. Queue webhook calls, retry with exponential backoff
  3. Monitor queue depth, alert if > 1000 pending jobs

**Database Connection Pool:**
- Current capacity: Default Supabase connection limit
- Limit: Unknown - depends on Supabase plan tier
- Scaling path:
  1. Implement connection pooling at application level (PgBouncer or similar)
  2. Monitor connection count in Supabase metrics
  3. Upgrade plan tier if hitting limits

**N8N Execution Concurrency:**
- Current capacity: Depends on n8n plan (likely 5-10 concurrent executions)
- Limit: Spikes during peak hours may queue workflows for hours
- Scaling path:
  1. Monitor n8n execution queue depth
  2. Implement client-side queue with max 1 pending request per user
  3. Show user "queue position: 3" message if waiting

## Dependencies at Risk

**Supabase SDK Version (^2.91.1):**
- Risk: Major version updates may introduce breaking changes in auth/RLS behavior
- Impact: Auth failures, data access control issues
- Migration plan:
  1. Pin to minor version (2.91.x) until tested
  2. Set up automated testing for auth flows before upgrading
  3. Test RLS policies after each upgrade

**Framer Motion (^12.29.0):**
- Risk: Version updates may change animation timing or introduce performance regressions
- Impact: Landing page animations may break or perform poorly
- Migration plan:
  1. Keep current version, only update for critical bug fixes
  2. Test animations on low-end devices before upgrading

**Next.js 16 (new and not yet stable):**
- Risk: Edge cases and bugs still being discovered in new major version
- Impact: Framework bugs may cause production issues
- Migration plan:
  1. Monitor Next.js GitHub issues closely
  2. Pin to 16.1.4 (current stable patch)
  3. Plan Next.js 17 upgrade 6 months after release (Phase 3)

## Missing Critical Features

**No Error Recovery for Failed n8n Workflows:**
- Problem: If n8n workflow fails midway (e.g., API rate limit on OpenAI), user credits are already deducted but content never generated
- Blocks: User cannot retry, credits are lost
- Recommendation: Implement workflow state machine in database to track completion, refund credits on failure

**No Webhook Signature Verification:**
- Problem: Can't verify n8n callbacks actually came from n8n
- Blocks: Cannot trust webhook data integrity
- Recommendation: Ask n8n for shared secret, implement HMAC verification

**No Audit Logging:**
- Problem: Cannot track who performed what action when
- Blocks: Security incident investigation, compliance reporting
- Recommendation: Create `audit_logs` table, insert on every sensitive operation (credit deduction, content generation, user deletion)

**No Data Export Capability:**
- Problem: Users cannot export their rankings or content
- Blocks: GDPR data portability requirement
- Recommendation: Create `/api/export/` endpoint that generates CSV or JSON of user data

## Test Coverage Gaps

**API Authentication:**
- What's not tested: Whether unauthorized requests are properly rejected on all endpoints
- Files: All API routes in `src/app/api/`
- Risk: Endpoint may be accidentally exposed without auth check
- Priority: High

**Credit Deduction Transactions:**
- What's not tested: Concurrent requests, race conditions on credit balance
- Files: `src/lib/api/auth.ts` (checkCredits), agent routes
- Risk: User can generate unlimited content by spamming requests
- Priority: High

**Webhook Failure Scenarios:**
- What's not tested: What happens if n8n webhook is down, returns error, or times out
- Files: `src/app/api/agents/*/route.ts`, `src/app/api/onboarding/complete/route.ts`
- Risk: Silent failures lead to incomplete workflows, user sees no result
- Priority: High

**Supabase RLS Policies:**
- What's not tested: Users cannot access other users' data even with direct SQL
- Files: Database layer (not in this codebase)
- Risk: Data leak between users
- Priority: Critical

**Date Range Filtering:**
- What's not tested: Dashboard correctly filters data for 7d/30d/90d ranges
- Files: `src/app/(protected)/dashboard/page.tsx`, `src/app/api/dashboard/overview/route.ts`
- Risk: Shows data from wrong time period
- Priority: Medium

---

*Concerns audit: 2026-02-27*
