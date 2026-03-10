# Beamix — Master Bug & Inconsistency Audit
**Date:** 2026-03-08
**Audited by:** Iris + Scout + Guardian (3-agent sweep)
**Scope:** `/saas-platform/src/` — all API routes, components, lib, middleware

---

## CRITICAL — Blocks correct functionality

### C1: Agent executions route queries non-existent columns
**File:** `src/app/api/agents/executions/[id]/route.ts:45`
**Problem:** Selects `content_type`, `generated_content`, `llm_optimization_score` from `content_items`. None of these column names exist in the DB schema. The DB has `agent_type` (not `content_type`) and `content` (not `generated_content`). `llm_optimization_score` does not exist at all.
**Result:** This query will return null or error for every execution fetch.
**Fix:** Change select string to use correct column names: `agent_type`, `content`, remove `llm_optimization_score`.

---

### C2: Wrong agent_type enum values used in UI components
**Files:**
- `src/components/dashboard/agents-view.tsx:79,87`
- `src/components/dashboard/agent-chat-view.tsx:96,108`
- `src/components/dashboard/dashboard-overview.tsx:44,45`
- `src/lib/agents/mock-outputs.ts:625,627,640,641`

**Problem:** These files use `'competitor_research'` and `'query_researcher'` as agent type values. The DB enum values are `'competitor_intelligence'` and `'faq_agent'`. Using wrong enum values means: agent jobs insert will fail with a DB constraint error, and UI lookups by agent type will always return undefined.
**Fix:** Replace everywhere:
- `'competitor_research'` → `'competitor_intelligence'`
- `'query_researcher'` → `'faq_agent'`

---

### C3: `deduct_credits` RPC called but spec requires hold/confirm/release pattern
**File:** `src/lib/agents/execute.ts:144` and `src/app/api/agents/execute/route.ts:114`
**Problem:** The implementation calls a `deduct_credits` RPC directly and immediately. The spec requires a hold/confirm/release pattern for idempotency (Inngest retries). The DB types confirm `hold_credits`, `confirm_credits`, and `release_credits` RPCs exist but are never used.
**Risk:** If agent execution fails mid-flight and Inngest retries, credits are double-deducted.
**Fix:** Replace `deduct_credits` call with: `hold_credits()` before agent runs → `confirm_credits()` on success → `release_credits()` on failure.

---

### C4: `plan_tier = 'free'` used as fallback — not a valid DB enum value
**Files:**
- `src/app/(protected)/dashboard/layout.tsx:50`
- `src/lib/agents/execute.ts:48`
- `src/lib/agents/config.ts:107` (PLAN_ORDER map)

**Problem:** All three fallback to `'free'` when no subscription exists. The DB `plan_tier` enum has `'starter' | 'pro' | 'business'` only — no `'free'`. Free users have `plan_id = NULL`, not `plan_tier = 'free'`. Comparing or storing `'free'` as a plan_tier will silently misbehave.
**Fix:** Represent free tier as `null`. Update `isPlanSufficient` to handle `null` as the lowest tier. Update all fallbacks from `?? 'free'` to `?? null`.

---

### C5: Paddle webhook uses US spelling `'canceled'` for status
**File:** `src/app/api/paddle/webhooks/route.ts:222–223`
**Problem:** Comment and likely the status value set uses `'canceled'` (US). The DB `subscription_status` enum requires UK spelling `'cancelled'`. If the update sets `status = 'canceled'`, it fails with a DB constraint error silently (or the webhook processes but sets wrong status).
**Fix:** Search the entire webhook handler for `'canceled'` and replace with `'cancelled'`.

---

## HIGH — Wrong behavior, will cause user-facing bugs

### H1: Entire agent system still runs mock outputs
**Files:**
- `src/lib/agents/execute.ts:165` — calls `generateMockOutput()`
- `src/app/api/agents/execute/route.ts:137` — calls `generateMockOutput()`
- `src/app/api/scan/start/route.ts:73` — calls `runMockScan()`

**Problem:** Every agent execution returns fake PRNG data. Every scan returns fake PRNG results. No real LLM calls anywhere.
**Impact:** The product cannot demonstrate real value.
**Fix:** Sprint 7 (Sage) must replace these with real LLM pipeline calls.

---

### H2: Scan runs synchronously in the API route handler (blocks response)
**File:** `src/app/api/scan/start/route.ts:70–90`
**Problem:** The route `await runMockScan()` inside the request handler before returning. Even mock scans take 3–10 seconds. This blocks the HTTP response, will timeout at Vercel's 10s limit for serverless functions, and gives no streaming progress to the UI.
**Fix:** Insert `free_scans` row → return `{ scan_id }` immediately → run scan in Inngest background job. The scan page polls `/api/scan/[scan_id]/status` for progress (already implemented).

---

### H3: Individual agent routes use wrong URL slugs in route paths vs DB types
**Files:**
- `src/app/api/agents/competitor-research/route.ts` — slug `'competitor-research'`
- `src/app/api/agents/query-researcher/route.ts` — slug `'query-researcher'`

**Problem:** `executeAgent('competitor-research', ...)` looks up `AGENT_CONFIG['competitor-research']`. Check the config — if these slugs don't match exactly, the lookup returns `undefined` and the route returns 404.
**Verify:** Cross-check every slug in `src/lib/agents/config.ts` against every route folder name in `src/app/api/agents/`.

---

### H4: `content_items` insert in execute.ts uses `content` but DB has both `content` and `content_body`
**File:** `src/lib/agents/execute.ts:193`
**Problem:** Inserts `content: agentOutput.content` but the DB schema shows both `content` (required) and `content_body` (nullable). The spec says `content_body` is the editable markdown body (set by content editor). The insert may be writing to the wrong column, meaning the content editor finds no editable body.
**Fix:** Insert both: `content: agentOutput.content, content_body: agentOutput.content` on initial creation.

---

### H5: Dashboard layout uses `plan_tier` column directly from `subscriptions`
**File:** `src/app/(protected)/dashboard/layout.tsx:50`
**Problem:** Queries `subscriptions.plan_tier` but the actual column on `subscriptions` is `plan_id` (foreign key to `plans`). The `plan_tier` is an enum on the `plans` table, not directly on `subscriptions`. This select will return `null` always.
**Fix:** Join `subscriptions` with `plans` to get the tier: `.select('status, trial_ends_at, plans(tier)')`.

---

### H6: Rate limit uses 1-hour window but spec requires 24-hour window
**File:** `src/app/api/scan/start/route.ts:27`
**Problem:** `oneHourAgo = Date.now() - 60 * 60 * 1000` limits to 3 per hour. The spec says 3 per 24 hours. Users can bypass by waiting 1 hour.
**Fix:** Change to `Date.now() - 24 * 60 * 60 * 1000`.

---

### H7: Free scan expiry set to 7 days but spec says 30 days
**File:** `src/app/api/scan/start/route.ts:54`
**Problem:** `expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)` — 7-day expiry. Spec says 30 days.
**Fix:** Change multiplier to `30 * 24 * 60 * 60 * 1000`.

---

## MEDIUM — Inconsistencies, tech debt, spec violations

### M1: Email components use `NEXT_PUBLIC_APP_URL` inconsistently
**Files:** 14 files in `src/components/email/` and `src/app/sitemap.ts`
**Problem:** Some use `NEXT_PUBLIC_APP_URL`, others use `NEXT_PUBLIC_SITE_URL`. Both are the same value conceptually. Email templates run server-side (Resend) and don't need `NEXT_PUBLIC_` prefix — a plain `APP_URL` env var is sufficient.
**Fix:** Standardize on one name. Recommended: `NEXT_PUBLIC_APP_URL` for client-side + `APP_URL` for server-side email templates.

---

### M2: `Paddle-Signature` header check uses lowercase `paddle-signature`
**File:** `src/app/api/paddle/webhooks/route.ts:35`
**Problem:** `request.headers.get('paddle-signature')` — Next.js lowercases all headers, so this is fine. However, confirm the Paddle SDK's `unmarshal()` also handles the lowercase form. Low risk but worth verifying against Paddle SDK docs.
**Status:** Likely OK, verify in testing.

---

### M3: `supabase.auth.getUser()` not called in `execute.ts` — uses `createClient()` correctly, but no null guard
**File:** `src/lib/agents/execute.ts:35–40`
**Problem:** Calls `supabase.auth.getUser()` (correct pattern), but the destructuring `{ data: { user } }` doesn't guard against a thrown error. If Supabase returns an auth error (network issue), this throws an unhandled exception.
**Fix:** Destructure `{ data: { user }, error: authError }` and return 401 if `authError`.

---

### M4: `agent-chat-view.tsx` references agent types by wrong keys
**File:** `src/components/dashboard/agent-chat-view.tsx:96,108`
**Problem:** Config map uses `'competitor_research'` and `'query_researcher'` as keys for UI labels/descriptions. When agent type from DB is `'competitor_intelligence'` or `'faq_agent'`, lookups will always miss.
**Fix:** Update keys to match DB enum values (see C2).

---

### M5: Weekly digest cron has N+1 query pattern (flagged with TODO)
**File:** `src/app/api/cron/weekly-digest/route.ts:49`
**Problem:** For each user, runs 4 sequential DB queries. At scale this will be very slow.
**Fix:** Batch queries or use a single join. Not urgent for launch but should be fixed before >100 active users.

---

### M6: `isPlanSufficient` includes `'free'` in PLAN_ORDER map
**File:** `src/lib/agents/config.ts:107`
**Problem:** `free: 0` in the order map perpetuates the invalid plan tier value throughout the system. Any code using this function with `'free'` works but produces wrong DB behavior (see C4).
**Fix:** Remove `'free'` from PLAN_ORDER. Handle `null` plan_tier as tier 0 explicitly.

---

### M7: Middleware onboarding check uses cookie that is never set
**File:** `src/middleware.ts:51`
**Problem:** Middleware checks for `beamix-onboarding-complete` cookie to decide whether to redirect to `/onboarding`. This cookie is supposed to be set by `/api/onboarding/complete` — but that route does not currently set this cookie. Until it does, every authenticated user without the cookie will be redirected to `/onboarding` on every `/dashboard` visit, even after completing onboarding.
**Fix:** Add `response.cookies.set('beamix-onboarding-complete', '1', ...)` in `/api/onboarding/complete/route.ts` on success.

---

### M8: `src/app/(auth)/reset-password/page.tsx` — verify exists
**Note:** A reset-password page may or may not exist. The callback route needs to redirect to it after password recovery exchange. Verify the file exists and is wired to the callback.

---

## LOW — Style, minor cleanup

### L1: `Math.random()` in mock-engine delay (non-deterministic)
**File:** `src/lib/scan/mock-engine.ts:188`
**Note:** The mock engine uses `Math.random()` for delay variation. Not a bug, but means scan timing is non-deterministic. Acceptable for mock; remove when real engine ships.

---

### L2: `.DS_Store` committed to git
**File:** `.DS_Store` in git status
**Fix:** Add `.DS_Store` to `.gitignore` and remove from tracking: `git rm --cached .DS_Store`.

---

## Mock Data Inventory (needs real implementation)

| File | What's mocked | Sprint to fix |
|------|--------------|--------------|
| `src/lib/scan/mock-engine.ts` | Entire scan engine (PRNG results) | Sprint 7 (Sage) |
| `src/lib/agents/mock-outputs.ts` | All 8+ agent outputs | Sprint 7 (Sage) |
| `src/lib/agents/execute.ts:165` | Agent execution (calls generateMockOutput) | Sprint 7 |
| `src/app/api/agents/execute/route.ts:137` | Same mock call in execute route | Sprint 7 |
| `src/app/api/scan/start/route.ts:73` | Scan start runs mock | Sprint 7 |

---

## Security Summary

| Check | Status |
|-------|--------|
| `getUser()` used (not `getSession()`) | ✅ Correct in all routes checked |
| Paddle webhook signature verified | ✅ Present |
| Zod validation on all POST routes | ✅ Present on checked routes |
| No secrets in `NEXT_PUBLIC_` vars | ✅ Only `APP_URL`, `PADDLE_ENVIRONMENT`, `PADDLE_CLIENT_TOKEN` exposed (all safe) |
| Rate limiting on free scan | ⚠️ Present but wrong window (1h not 24h) — see H6 |
| SQL injection via concatenation | ✅ None found — all queries use parameterized Supabase calls |
| `dangerouslySetInnerHTML` | Not found in non-landing components |

---

---

## Functional Flows Audit (Agent 3 — Flow Tracer)

### Flow A — Free Scan: PARTIALLY WORKING
- ✅ Happy path works end-to-end
- ⚠️ `expires_at` set to 7 days — spec says 30 days (see H7 above)
- ⚠️ Mock scan runs synchronously in route handler — will timeout when real LLM calls added (see H2 above)

---

### Flow B — Signup with scan_id Import: PARTIALLY WORKING

**B1: Trial duration is 14 days in code, spec says 7 days**
**File:** `src/app/api/onboarding/complete/route.ts`
**Problem:** `Date.now() + 14 * 24 * 60 * 60 * 1000` — sets 14-day trial. Spec is 7 days.
**Fix:** Change to `7 * 24 * 60 * 60 * 1000`.

**B2: `convertFreeScanResults` inserts `avg_position` column that doesn't exist**
**File:** `src/app/api/onboarding/complete/route.ts` — `convertFreeScanResults` function
**Problem:** Insert into `scans` includes `avg_position` column. Per MEMORY.md: `scans` has NO `avg_position` column. Insert silently fails → no scan history created after free scan import. User sees empty dashboard despite completing onboarding with scan data.
**Fix:** Remove `avg_position` from the insert. If an average is needed, compute it client-side from `scan_engine_results`.

---

### Flow C — Dashboard Overview: PARTIALLY WORKING

**C-F1: New users have no `credit_pools` row — dashboard shows "0 / 0"**
**File:** `src/app/(protected)/dashboard/page.tsx` and dashboard overview component
**Problem:** `credit_pools` row is created on trial start (`/api/dashboard/trial-start`), but if the API is never called or fails silently, new users see "0 / 0 credits" with no context. The trial-start API is called client-side on first dashboard visit — if this fails, credits are never initialized.
**Fix:** Create `credit_pools` row in the `handle_new_user` trigger (or in `/api/onboarding/complete`) so credits exist before the first dashboard visit.

**C-F2: Engine Status card shows all 4 engines as "Active" — hardcoded**
**File:** Dashboard overview component
**Problem:** Engine status cards are hardcoded as "Active" regardless of real scan data. Users on Starter (3 engines) will see all 4 engines shown as active.
**Fix:** Drive engine status from actual `scan_engine_results` data.

---

### Flow D — Agent Execution: BROKEN (4 bugs)

**D1: `competitor-research` and `query-researcher` routes always 404**
**Files:**
- `src/app/api/agents/competitor-research/route.ts` — calls `executeAgent('competitor-research', ...)`
- `src/app/api/agents/query-researcher/route.ts` — calls `executeAgent('query-researcher', ...)`
- `src/lib/agents/config.ts` — `AGENT_CONFIG` has no keys `'competitor-research'` or `'query-researcher'`
**Problem:** `executeAgent()` looks up the slug in `AGENT_CONFIG`. These slugs don't exist → returns 404. UI silently does nothing when user runs these agents.
**Fix:** Either add correct slugs to `AGENT_CONFIG`, or rename route folders to match existing config keys.

**D2: `faq-agent` route file is missing**
**Problem:** `AGENT_CONFIG` has a `'faq-agent'` entry. No corresponding route file at `src/app/api/agents/faq-agent/route.ts`.
**Fix:** Create `src/app/api/agents/faq-agent/route.ts` with the same pattern as other agent routes.

**D3: Agent chat page shows blank for `competitor_intelligence` type**
**File:** `src/components/dashboard/agent-chat-view.tsx`
**Problem:** `AGENT_META` map has no entry for `'competitor_intelligence'`. Navigating to `/dashboard/agents/competitor_intelligence` renders a blank/broken page.
**Fix:** Add `'competitor_intelligence'` (and all DB enum values) to `AGENT_META`.

**D4: Executions route selects non-existent columns on `agent_jobs`**
**File:** `src/app/api/agents/executions/[id]/route.ts`
**Problem:** Selects `output_type`, `title`, `structured_data` from `agent_jobs`. These columns don't exist. `structuredOutput` is always null. Combined with C1 above, the execution detail view always returns empty data.
**Fix:** Use correct column names from DB types: `output_data`, `agent_type`. Remove non-existent columns.

---

### Flow E — Settings Billing Tab: BROKEN (fully hardcoded)

**E1: Entire billing tab is static mock data**
**File:** `src/app/(protected)/dashboard/settings/page.tsx` — Billing tab
**Problem:**
- Plan name, price, usage percentages, billing history, and payment method are all hardcoded strings
- "Update Payment Method", "Change Plan", and "Cancel Subscription" buttons have no `onClick` handlers — they do nothing
- No calls to `/api/billing/status` or Paddle portal
**Fix:** Wire billing tab to `GET /api/billing/status` for real subscription data. Connect "Manage Billing" to `GET /api/billing/portal` for Paddle customer portal redirect.

---

### Missing API Routes

| UI calls | Route file exists? | Result |
|----------|-------------------|--------|
| `/api/agents/faq-agent` | ❌ Missing | 404 |
| `/api/agents/competitor-research` | ✅ Exists but slug not in AGENT_CONFIG | 404 |
| `/api/agents/query-researcher` | ✅ Exists but slug not in AGENT_CONFIG | 404 |
| `/api/billing/status` | ❓ Verify | Unknown |
| `/api/billing/portal` | ✅ Exists (`src/app/api/paddle/portal/route.ts`) | OK |
| `/api/dashboard/trial-start` | ❓ Verify | Unknown |

---

### Inngest Status: NOT WIRED
**Problem:** Inngest is installed as a dependency but not used anywhere in the codebase. No `src/inngest/` directory exists. No `src/app/api/inngest/route.ts` exists. All background jobs (scan engine, agent execution, cron jobs) run synchronously in API route handlers. This is the root cause of H2.

---

### Missing Environment Variables

| Env var | Used in | Declared? |
|---------|---------|-----------|
| `NEXT_PUBLIC_SITE_URL` | `src/app/sitemap.ts` | ❓ Check .env.example |
| `EMAIL_FROM_ADDRESS` | `src/lib/email/send.ts` | ❓ Check .env.example |
| `NEXT_PUBLIC_APP_URL` | 14 email components | ❓ Check .env.example |

---

## Fix Priority Order for Dev Team

**Batch 1 — Fix immediately (data corruption / 404s that block testing):**
1. C2 + D1 + D3 — Wrong agent_type enum values everywhere → rename to `competitor_intelligence`, `faq_agent`
2. D2 — Create missing `/api/agents/faq-agent/route.ts`
3. C1 + D4 — Fix executions route: remove non-existent columns (`generated_content`, `llm_optimization_score`, `output_type`, `title`, `structured_data`)
4. B2 — Remove `avg_position` from `scans` insert in `convertFreeScanResults`
5. C5 — Paddle webhook `'canceled'` → `'cancelled'`
6. M7 — Set `beamix-onboarding-complete` cookie in `/api/onboarding/complete` on success

**Batch 2 — Fix before any user testing:**
7. B1 — Trial duration 14 days → 7 days in `onboarding/complete`
8. H6 — Rate limit window 1h → 24h
9. H7 — Free scan expiry 7d → 30d
10. H5 — Dashboard layout: join `plans` table to get `plan_tier`
11. C4 + M6 — Remove `'free'` as plan_tier fallback; handle `null` as free tier
12. C-F1 — Create `credit_pools` row earlier (in trigger or onboarding complete)
13. E1 — Wire billing tab to real Paddle API (at minimum, remove fake onClick-less buttons)

**Batch 3 — Fix before launch (architecture):**
14. H2 + Inngest — Move scan and agent execution out of route handlers into Inngest background jobs
15. C3 — Switch from `deduct_credits` to hold/confirm/release pattern
16. H4 — `content_items` insert: set both `content` and `content_body`

**With Sprint 7 (Sage — real LLM integration):**
17. H1 — Replace all mock outputs with real LLM calls (scan engine + all 8 agent pipelines)

**Cleanup (any time):**
18. M1 — Standardize `APP_URL` / `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL`
19. M5 — Fix N+1 query in weekly digest cron
20. L2 — Remove `.DS_Store` from git tracking
