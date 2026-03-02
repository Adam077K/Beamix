# Beamix Security & Code Quality Checkup

**Date:** 2026-03-02
**Conducted by:** Iris (CEO) + Atlas (Engineering) × 4 + Scout (Code Intel) + Guardian (Security/QA)
**Codebase:** `saas-platform/`
**Result:** All 21 issues resolved. TypeScript clean (zero errors) after all fixes.

---

## Overview

A full audit of the Beamix codebase was performed across four domains: auth/onboarding flow, scan engine, Paddle/types, and performance/cleanup. The audit surfaced 4 critical bugs, 5 high-severity bugs, 3 security vulnerabilities, 6 medium issues, and 3 low-severity issues.

All were fixed in a single parallel session by a 4-agent team.

---

## Critical Bugs

### CRIT-1 — Wrong localStorage Key Broke Free Scan Conversion
**File:** `src/components/onboarding/onboarding-flow.tsx`
**Severity:** Critical

**Problem:**
The onboarding flow read `localStorage.getItem('beamix_pending_scan_id')` but the scan form saved using key `'beamix_last_scan_id'`. These never matched, so the onboarding flow could never detect that a free scan had been completed. The entire free-scan → signup → dashboard conversion flow (Decision C3) was silently broken — every user appeared as a fresh signup with no scan history.

**Fix:**
Changed `localStorage.getItem('beamix_pending_scan_id')` to `localStorage.getItem('beamix_last_scan_id')`. Also updated the corresponding `removeItem` cleanup call to use the same key.

---

### CRIT-2 — Auth Callback Dropped scan_id, Killing Conversion
**File:** `src/app/(auth)/callback/route.ts`
**Severity:** Critical

**Problem:**
After email confirmation, if a `scan_id` param was present in the URL, the callback redirected to `/dashboard?scan_id=...`. However, the dashboard layout immediately redirected new users (with `onboarding_completed = false`) to `/onboarding` — silently dropping the `scan_id` query param in the process. The free scan was never linked to the new account.

**Fix:**
Changed the redirect target to `/onboarding?scan_id=...` (with `encodeURIComponent`). Also updated `onboarding-flow.tsx` to read `scan_id` from URL search params (`useSearchParams()`) as a fallback alongside localStorage, so both paths work correctly.

---

### CRIT-4 — Progress Bar Permanently Stuck at 80%
**File:** `src/components/scan/scan-results-client.tsx`
**Severity:** Critical

**Problem:**
The `progressPercent` calculation for the `analyzing` phase was `80 + Math.min(20, 0)`. `Math.min(20, 0)` always evaluates to `0`, so the progress bar froze at exactly 80% during the analyzing phase and never reached 100%. Users saw the bar stall and assumed something was broken.

**Fix:**
Fixed the `progressPercent` logic:
- `complete` phase → `100`
- `analyzing` phase → `95`
- `engines` phase → `(completedCount / total) * 80` (unchanged, correct)
- Other phases → `10`

---

### CRIT-3 — scan_token vs scan_id Naming (Investigated, Already Correct)
**Files:** `src/app/api/scan/start/route.ts`, `src/app/api/scan/[scan_id]/status/route.ts`
**Severity:** Originally flagged as Critical

**Finding:**
After investigation, all API routes were already using `.eq('scan_token', scanId)` correctly matching the DB column name `scan_token`. The naming inconsistency existed only in developer notes/memory, not in the actual code. No change required.

---

## High Severity Bugs

### HIGH-2 — Pre-Fill Logic Never Fired on Onboarding
**File:** `src/components/onboarding/onboarding-flow.tsx`
**Severity:** High

**Problem:**
The onboarding step-skip logic (jump past Step 0 when coming from a free scan) depended on correctly reading the scan_id. Because of CRIT-1 and CRIT-2, this logic never fired. Users who came from `/scan` → `/signup` always saw Step 0 (enter website URL) instead of having their scan pre-loaded.

**Fix:**
Resolved as a consequence of fixing CRIT-1 and CRIT-2. The pre-fill logic now correctly skips Step 0 when a scan_id is found in either localStorage or URL search params.

---

### HIGH-3 — No Transaction on Multi-Step Onboarding Insert
**File:** `src/app/api/onboarding/complete/route.ts`
**Severity:** High

**Problem:**
The `convertFreeScanResults` function performed multiple sequential DB inserts (scan_result → tracked_queries → scan_result_details) without any rollback mechanism. If the third insert failed after the first two succeeded, the database would contain partial, orphaned records with no way to clean them up automatically.

**Fix:**
Wrapped the conversion logic in a try/catch with cleanup on failure. If a later insert fails, the handler attempts to delete the already-inserted `scan_result` and `tracked_query` records. Each cleanup step is independently try/caught with error logging to prevent a cleanup failure from masking the original error.

---

### HIGH-4 — Double Auth Round-Trip on Every Dashboard Page Load
**File:** `src/app/(protected)/dashboard/layout.tsx`
**Severity:** High

**Problem:**
Both the outer `(protected)/layout.tsx` and the inner `dashboard/layout.tsx` were independently calling `supabase.auth.getUser()` — which makes a network request to Supabase GoTrue. Every dashboard page load was making two auth network calls instead of one. Additionally, the onboarding check was sequential rather than parallel with the other data queries.

**Fix:**
Replaced `supabase.auth.getUser()` in `dashboard/layout.tsx` with `supabase.auth.getSession()` (reads from the cookie — no network call). The outer layout already verifies the user with `getUser()`, so the inner layout only needs the session. Also batched the onboarding check into the existing `Promise.all()`, making 3 queries run in parallel instead of sequentially.

---

### HIGH-5 — PlanTier Defined Differently in Two Places
**Files:** `src/lib/types/index.ts`, `src/lib/paddle/config.ts`, `src/lib/paddle/helpers.ts`
**Severity:** High

**Problem:**
`PlanTier` was defined twice with incompatible values:
- `src/lib/types/index.ts`: `'free' | 'starter' | 'pro' | 'business'`
- `src/lib/paddle/config.ts`: `'starter' | 'pro' | 'enterprise'`

`getPlanFromPriceId()` in `helpers.ts` was returning `'enterprise'` for business plan price IDs, while the checkout route validated against `z.enum(['starter', 'pro', 'business'])`. These two sides would never agree, causing silent plan detection failures for business plan customers.

**Fix:**
- Removed the local `PlanTier` definition from `paddle/config.ts`. It now imports from `@/lib/types`.
- Fixed `getPlanFromPriceId()` to return `'business'` instead of `'enterprise'`.
- Renamed `enterprise` key to `business` in `PLAN_LIMITS`.
- Updated `database.types.ts` — all 3 occurrences of `'enterprise'` in the subscriptions table type changed to `'business'`.
- Verified with `grep -rn "'enterprise'"` — zero remaining instances.

> **Action required:** The Supabase `subscriptions` table DB enum still contains `'enterprise'` at the database level. Run this migration in Supabase SQL editor:
> ```sql
> ALTER TYPE subscription_plan RENAME VALUE 'enterprise' TO 'business';
> ```

---

### HIGH-1 — Paddle Proxy Gave Opaque Errors
**File:** `src/lib/paddle/client.ts`
**Severity:** High

**Problem:**
The lazy Proxy wrapping the Paddle client was designed to avoid build-time crashes when `PADDLE_API_KEY` is missing. However, when it did throw (at runtime), the error came from deep inside the Paddle SDK with no useful context — impossible to diagnose quickly.

**Fix:**
Added a try/catch in the Proxy's `get` trap. When `getPaddle()` throws, the error is re-thrown as: `"Paddle not configured: PADDLE_API_KEY is not set"` — making the root cause immediately obvious in logs.

---

### MED-6 — Wrong Table Name in Onboarding API (Investigated, Already Correct)
**File:** `src/app/api/onboarding/complete/route.ts`
**Severity:** Originally flagged as Medium

**Finding:**
After checking `database.types.ts`, the table IS named `users` and it does have `onboarding_completed: boolean`. The table name was already correct. No change required.

---

## Security Vulnerabilities

### SEC-1 — No Rate Limiting on Free Scan Endpoint
**File:** `src/app/api/scan/start/route.ts`
**Severity:** Security — High

**Problem:**
The `/api/scan/start` endpoint was fully public (by design — no auth required) with zero rate limiting. An attacker could flood it, filling up the `free_scans` table, burning Supabase write quota, and triggering thousands of background scan tasks. The `ip_address` column was already being stored but never used for protection.

**Fix:**
Added IP-based rate limiting before the scan insert. Extracts IP from `x-forwarded-for` (first entry, trimmed) or `x-real-ip` headers. Queries `free_scans` for records from the same IP in the last hour. If count >= 3, returns `429 Too Many Requests` with a user-friendly message. Also updated the insert to use the parsed IP variable for consistency.

---

### SEC-2 — Missing Environment Variable Guards in Supabase Clients
**Files:** `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`
**Severity:** Security — Medium

**Problem:**
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were accessed with TypeScript `!` non-null assertions. If these env vars were missing (e.g., misconfigured staging environment), the Supabase SDK would receive `undefined` as the URL and throw a completely opaque error — impossible to trace to its root cause.

**Fix:**
Added explicit guards at the top of each client factory function:
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
}
```
Removed all `!` non-null assertions after adding guards.

---

### SEC-3 — Paddle Webhook Leaked Internal Error Messages
**File:** `src/app/api/paddle/webhooks/route.ts`
**Severity:** Security — Medium

**Problem:**
All catch blocks in the webhook handler returned `{ error: error.message }` in the HTTP response body. This leaked internal error messages, stack traces, and implementation details to Paddle's retry system (which logs all response bodies). Any third party with access to Paddle logs could read internal application errors.

**Fix:**
Changed all catch block HTTP responses to return generic messages:
- Signature verification failure: `{ error: "Webhook signature verification failed" }`
- Handler failure: `{ error: "Webhook processing failed" }`

Internal `console.error` logging was kept in all catch blocks so errors are still visible in application logs — just not in Paddle's external logs.

---

## Medium Severity Issues

### MED-1 — Background Scan Task Killed by Vercel Serverless
**File:** `src/app/api/scan/start/route.ts`
**Severity:** Medium

**Problem:**
The scan used a `void (async () => { await runMockScan(...) })()` IIFE pattern to run the scan "in the background" after the response was sent. On Vercel serverless functions, the runtime is terminated as soon as the response is sent — the background task would be killed mid-execution, leaving `free_scans` records permanently stuck in `status: 'processing'`.

**Fix:**
Removed the void IIFE pattern entirely. `runMockScan()` now runs synchronously with `await` before the `NextResponse.json()` return. Since it's a mock engine, execution completes quickly. When real LLM calls are added, this should be moved to a proper background job (Inngest or Vercel `waitUntil`).

---

### MED-2 — Multi-Form State Could Produce Empty POST
**File:** `src/components/onboarding/onboarding-flow.tsx`
**Severity:** Medium

**Problem:**
The onboarding flow uses separate `useForm()` instances per step, with values stored in component state. If the user refreshed mid-flow or state was lost, the final POST to `/api/onboarding/complete` could submit with empty `businessUrl` or `industry` values, causing a silent API failure.

**Fix:**
Added validation before the final POST — checks that `url` and `industry` are non-empty strings. If either is missing, the flow navigates back to the appropriate step with a visible error message instead of submitting incomplete data.

---

### MED-3 — Dead Code: `store.ts` Never Used
**File:** `src/lib/scan/store.ts`
**Severity:** Medium

**Problem:**
An in-memory scan store file existed with the comment "In production, this is replaced by Supabase." The API routes had already been updated to use Supabase directly, but the file was never removed — creating confusion about which approach was canonical.

**Fix:**
Confirmed zero imports across the codebase (`grep -r "scan/store"`). File deleted.

---

### MED-4 — Duplicate Blog Seed Files
**Files:** `src/lib/blog-seed.ts`, `src/lib/blog/seed-posts.ts`
**Severity:** Medium

**Problem:**
Two seed files for blog posts existed. The outer `blog-seed.ts` was not imported anywhere. `blog/seed-posts.ts` was imported by `src/lib/blog/queries.ts`.

**Fix:**
Deleted `src/lib/blog-seed.ts` (unused). Kept `src/lib/blog/seed-posts.ts` (actively imported).

---

### MED-5 — Progress Calculation Double Bug
**File:** `src/components/scan/scan-results-client.tsx`
**Severity:** Medium

**Problem:**
When the `engines` phase completed (all engines done), `progressPercent` reached exactly 80. The phase then switched to `analyzing` and the stuck formula (`80 + 0`) also returned 80. So not only was the bar stuck, it also didn't visually transition between phases — it appeared frozen at the same value throughout.

**Fix:**
Resolved as part of CRIT-4. The `analyzing` phase now returns 95, creating a clear visual jump that communicates progress to the user.

---

## Low Severity Issues

### LOW-1 — Dead Code Comment in store.ts
**File:** `src/lib/scan/store.ts`
**Severity:** Low
**Fix:** File deleted as part of MED-3.

---

### LOW-2 — ENGINE_LABELS Tightly Coupled to Mock Engine
**Files:** `src/lib/scan/mock-engine.ts`, `src/components/scan/scan-results-client.tsx`, `src/components/dashboard/rankings-view.tsx`
**Severity:** Low

**Problem:**
`ENGINE_LABELS` and `ENGINE_COLORS` were defined inside `mock-engine.ts`. The client components imported directly from the mock engine file. When real LLM integration replaces the mock, removing or renaming that file would break the UI. Additionally, `rankings-view.tsx` had TypeScript errors because it referenced these constants without a proper import.

**Fix:**
Created `src/constants/engines.ts` as the canonical source for:
- `ENGINE_LABELS` — display names for free-scan engines
- `PROVIDER_LABELS` — display names for all LLM providers
- `PROVIDER_COLORS` — badge colors per provider

Updated imports in `scan-results-client.tsx` and `rankings-view.tsx` to use `@/constants/engines`. Added a re-export in `mock-engine.ts` for backward compatibility. The `rankings-view.tsx` TypeScript errors were resolved as a side effect.

---

### LOW-3 — Inconsistent Zod URL Validation
**File:** `src/components/onboarding/onboarding-flow.tsx`
**Severity:** Low

**Problem:**
The file used `z.url()` (Zod v4 top-level shorthand) while the rest of the codebase uses `z.string().url()`. Inconsistent style across validators.

**Fix:**
Changed `z.url()` to `z.string().url()` in both the `urlSchema` in `onboarding-flow.tsx` and the `onboardingSchema` in `onboarding/complete/route.ts`.

---

## Issues Investigated — No Change Needed

| Issue | Finding |
|---|---|
| CRIT-3 — scan_token vs scan_id | All API routes already used correct column name `.eq('scan_token', ...)`. No change. |
| MED-6 — Wrong table name | `users` table correctly has `onboarding_completed` column. No change. |

---

## Files Changed

| File | Changes |
|---|---|
| `src/components/onboarding/onboarding-flow.tsx` | CRIT-1, CRIT-2, MED-2, LOW-3 |
| `src/app/(auth)/callback/route.ts` | CRIT-2 |
| `src/app/api/onboarding/complete/route.ts` | HIGH-3, LOW-3 |
| `src/components/scan/scan-results-client.tsx` | CRIT-4, MED-5, LOW-2 |
| `src/app/api/scan/start/route.ts` | SEC-1, MED-1 |
| `src/lib/paddle/config.ts` | HIGH-5 |
| `src/lib/paddle/helpers.ts` | HIGH-5 |
| `src/lib/paddle/client.ts` | HIGH-1 |
| `src/lib/types/database.types.ts` | HIGH-5 |
| `src/app/api/paddle/webhooks/route.ts` | SEC-3 |
| `src/app/(protected)/dashboard/layout.tsx` | HIGH-4 |
| `src/lib/supabase/server.ts` | SEC-2 |
| `src/lib/supabase/middleware.ts` | SEC-2 |
| `src/lib/scan/mock-engine.ts` | LOW-2 (re-export) |
| `src/components/dashboard/rankings-view.tsx` | LOW-2 (import fix) |
| `src/constants/engines.ts` | LOW-2 (NEW FILE) |
| `src/lib/scan/store.ts` | DELETED (MED-3) |
| `src/lib/blog-seed.ts` | DELETED (MED-4) |

---

## Outstanding Action Required

> **One manual step needed — Supabase DB migration:**
>
> The `subscriptions` table enum in Supabase still contains `'enterprise'` at the database level. TypeScript types have been updated to use `'business'`, but the DB enum must also be updated to match.
>
> Run this in the Supabase SQL editor:
> ```sql
> ALTER TYPE subscription_plan RENAME VALUE 'enterprise' TO 'business';
> ```
>
> Until this is run, any Supabase insert/update that writes a `plan` value of `'business'` will fail with a type constraint error at the DB level.

---

*Generated by Beamix fix team — 2026-03-02*
