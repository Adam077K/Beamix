# Codebase Concerns

> **Last synced:** March 2026 — aligned with 03-system-design/
> **Note:** System Design v2.1 (March 2026) addresses many concerns below. Items marked RESOLVED were closed in that release. See `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md`.

## Tech Debt

**~~Fire-and-Forget Agent Calls~~ — RESOLVED by Inngest:**
- **Resolution:** All async agent/scan work now runs in Inngest functions with built-in retry, concurrency control, and step-level observability. API routes emit events and return 202.
- Remaining risk: Verify that NO agent logic remains in Next.js API route handlers — all agent execution must be in `src/inngest/` functions.

**~~Incomplete Paddle Integration~~ — RESOLVED:**
- Paddle webhooks implemented at `src/app/api/billing/webhooks/route.ts`
- Paddle is the only payment provider (no Stripe)

**LLM Cost at Scale (from System Design v2.1 section 5.4):**
- Risk: At 1,000 paying businesses, LLM costs estimated at **$15,000-$25,000/month**
- Breakdown: Scan operations $8K-14K/mo (5 Haiku parse calls per response), agent executions $2K-5K/mo, chat $200-500/mo
- Minimum ARPU needed: $15-25 across paid tiers to maintain healthy margins
- Free tier scans are loss leaders — budget must stay <5% of total LLM spend
- Mitigations: prompt caching, Perplexity query scaling, model right-sizing (Gemini Flash for bulk, Haiku for parsing), budget gates per user/tier
- Action: Re-validate cost estimates at 100, 500, and 1,000 paying customers

**Browser Simulation Deferred (Phase 3):**
- Copilot, AI Overviews, Meta AI require browser simulation — reliability is low
- Deferred to Phase 3 (after launch). Phase 1 covers ChatGPT/Gemini/Perplexity/Claude via API
- Risk: Competitors may close the gap in browser-accessible engines before Phase 3 ships

**Paddle Webhook Idempotency:**
- Risk: Paddle may retry webhook delivery, causing duplicate subscription updates or credit allocations
- Mitigation needed: Store processed webhook event IDs and skip duplicates
- Inngest handles retries for background work, but webhook handler itself must be idempotent

**Missing Environment Variable Validation:**
- Issue: Environment variables accessed with `!` (non-null assertion) without validation at startup
- Impact: App starts even if critical env vars are missing. Crashes at runtime.
- Fix: Create `src/lib/config/validate-env.ts` with Zod validation, run at app startup

**Complex Component Files:**
- Several components exceed 400+ lines mixing business logic with UI
- Files: `AnimatedDashboard.tsx` (777 lines), `scan-results-client.tsx` (940 lines), `signup-form.tsx` (485 lines)
- Fix: Extract into smaller components and custom hooks

## Known Bugs

**Onboarding Workflow Trigger:**
- The `onboarding/complete` API route must emit the `onboarding/complete` Inngest event
- This triggers the "New Business Onboarding" workflow: A13 + A14 + A11 (parallel) -> A4 -> notify
- Verify this event is correctly emitted and the workflow is registered in Inngest

**Missing Query Ownership Verification in Some Routes:**
- Some API routes don't verify user owns the resource before returning data
- Low risk (RLS policies catch this), but defense-in-depth best practice not followed everywhere
- Audit all GET endpoints to ensure `eq('user_id', user.id)` is always applied

**Potential Date Calculation Bug:**
- Monthly credit reset date calculation may be incorrect for months with different day counts
- Fix: Use date arithmetic library (date-fns) that handles month boundaries correctly

## Security Considerations

**Rate Limiting (Not Yet Implemented):**
- System design specifies per route, per user, per tier, per IP rate limiting
- Currently relies on Vercel's built-in protections and Inngest concurrency limits
- Must implement before launch — especially on `/api/scan/start` and `/api/agents/[agentType]/execute`

**Credit System Race Conditions:**
- Credit balance check is soft, not transactional
- Must implement optimistic locking on credits table: check + atomically decrement
- Inngest concurrency limits (3 per user) provide partial mitigation

**Insufficient Input Validation on Onboarding:**
- Website URL and company name are user-supplied but may contain XSS or injection vectors
- Fix: Use Zod schema validation on API route, sanitize HTML in company_name

**Error Response Information Disclosure:**
- Error messages may expose internal database schema in development mode
- Fix: Implement error ID tracking, return ID to client, log full details server-side

## Performance Bottlenecks

**Dashboard Data Query:**
- Dashboard overview query may fetch all data regardless of selected date range, filtering in application code
- Fix: Apply date range filter at database level + composite index on (user_id, created_at)

**React Query Polling:**
- Credits balance refetched every 5 minutes even if unchanged
- Fix: Use Supabase Realtime subscriptions instead of polling for live data

**Large Animated Component Rendering:**
- AnimatedDashboard uses requestAnimationFrame with state updates — causes full re-render per frame
- Fix: CSS animations or memoized sub-components with `will-change: transform`

## Fragile Areas

**Authentication State Management:**
- Files: `src/lib/supabase/middleware.ts`, `src/middleware.ts`
- Middleware reads session on every request. Silent refresh failure logs user out.
- Cookie-based session may have race conditions with concurrent requests.

**Credit System (Transactional Integrity):**
- Pattern: hold/confirm/release
- Users NEVER charged for failed agent executions
- Inngest step retries must NOT re-hold credits — credit hold must be idempotent
- No existing tests for concurrent credit scenarios — HIGH PRIORITY

**Data Consistency at Signup:**
- `handle_new_user` DB trigger must exist in migrations — creates `user_profiles`, `subscriptions`, `notification_preferences` rows atomically
- Migration: `supabase/migrations/20260302_signup_trigger.sql`
- Risk: If trigger missing, onboarding infinite loop occurs

## Scaling Limits

**Inngest Concurrency:**
- agent.execute: max 3 per user, 20 system-wide
- workflow.execute: max 5 total, 1 per user
- scan.free: 25 system-wide
- scan.scheduled: 50 system-wide (hourly cron batches)
- Monitor Inngest dashboard for queue depth and step failures

**Database Connection Pool:**
- Depends on Supabase plan tier
- Monitor connection count; upgrade plan or add PgBouncer if hitting limits

**LLM API Concurrency:**
- Rate limits per provider during peak hours
- Inngest concurrency controls provide queue management
- Show user queue position if waiting

## Dependencies at Risk

**Supabase SDK (^2.91.1):**
- Major version updates may break auth/RLS behavior
- Pin to minor version until tested

**Next.js 16:**
- New major version, edge cases still being discovered
- Pin to 16.1.4 (current stable patch)

**Framer Motion (^12.29.0):**
- Version updates may change animation timing
- Keep current version, only update for critical fixes

## Test Coverage Gaps

**HIGH PRIORITY (must test before launch):**
- API authentication — unauthorized requests properly rejected on all endpoints
- Credit deduction transactions — concurrent requests, race conditions
- Paddle webhook handling — signature verification, idempotency, subscription state transitions
- Supabase RLS policies — users cannot access other users' data

**MEDIUM PRIORITY:**
- Date range filtering on dashboard
- Inngest function retry behavior (credit hold idempotency)
- Content publish flow (agent output -> review -> CMS)

---

*Concerns audit: 2026-02-27 | Updated: March 2026 — synced with System Design v2.1*
