> ⚠️ **ARCHIVED** — Historical reference. Current source of truth: `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md` | Archived: 2026-03-05

# Beamix Full Audit Report
Date: 2026-03-02

## Summary
- Total issues found: 42
- Critical: 8 | High: 12 | Medium: 14 | Low: 8

> **Note:** The 5 audit agents (API Routes, Auth & Security, Components, UX Flow, Build & Types) were all terminated mid-execution before producing final reports. This report was compiled by manually auditing the entire codebase, using the agent task prompts as the audit scope guide.

---

## Critical Issues (fix immediately)

| # | File | Line | Issue | Source |
|---|------|------|-------|--------|
| C1 | `src/app/api/dashboard/overview/route.ts` | 55 | **Table `agent_executions` does not exist in DB** -- code queries `.from('agent_executions')` but database types define `agent_jobs`. Every query to this table will fail silently (empty results) or throw a Postgres error. | API |
| C2 | `src/app/api/agents/execute/route.ts` | 89 | **Table `agent_executions` does not exist in DB** -- same issue as C1. Agent execution creation, status updates, and credit deduction all write to a non-existent table. The entire agent system is broken. | API |
| C3 | `src/app/api/agents/execute/route.ts` | 144 | **Table `content_generations` does not exist in DB** -- code inserts into `.from('content_generations')` but database types define `content_items`. All agent-generated content will fail to persist. | API |
| C4 | `src/app/api/agents/execute/route.ts` | 177 | **Table `agent_outputs` does not exist in DB** -- code inserts into `.from('agent_outputs')` but this table is not defined anywhere in the database types. Structured agent output (competitor research, query suggestions, etc.) cannot be stored. | API |
| C5 | `src/app/api/dashboard/overview/route.ts` | 42 | **Table `scan_results` does not exist in DB** -- code queries `.from('scan_results')` but database types define `scans` and `scan_engine_results`. Dashboard will show empty scan history. | API |
| C6 | `src/app/api/dashboard/overview/route.ts` | 37 | **Table `credits` does not exist in DB** -- code queries `.from('credits')` but database types define `credit_pools`. Dashboard credit display and all credit checks will fail. | API |
| C7 | `src/app/api/paddle/webhooks/route.ts` | 152 | **Column name mismatch: `trial_end` vs `trial_ends_at`** -- webhook handler writes `trial_end` but the `subscriptions` table column is `trial_ends_at`. Trial period data from Paddle will silently fail to update. | API |
| C8 | `src/lib/agents/execute.ts` | 116, 151, 175 | **Shared agent execution handler also uses non-existent tables** -- `agent_executions`, `content_generations`, `agent_outputs` all referenced. The entire 10-step agent pipeline (used by all 7 individual agent routes) is broken end-to-end. | API |

## High Priority Issues

| # | File | Line | Issue | Source |
|---|------|------|-------|--------|
| H1 | `src/app/api/onboarding/complete/route.ts` | 233 | **Free scan conversion writes to `scan_results`** -- the onboarding conversion flow that imports free scan data into authenticated tables uses `scan_results` and `scan_result_details`, neither of which exists in the DB types. New users coming from free scans will have no scan data in their dashboard. | API/UX |
| H2 | `src/app/api/cron/trial-nudges/route.ts` | 94 | **Cron job queries `scan_results`** -- trial nudge emails that include the user's current score query the non-existent `scan_results` table. Emails will either fail or show score of 0. | API |
| H3 | `src/app/api/cron/weekly-digest/route.ts` | 62, 76 | **Weekly digest queries `scan_results` and `content_generations`** -- two non-existent tables. Weekly digest emails will contain empty/zero data. | API |
| H4 | `src/lib/paddle/helpers.ts` | 120 | **`addTopupCredits` queries `credits` table** -- credit top-up purchases via Paddle webhook will fail because the `credits` table doesn't exist (should be `credit_pools`). Users who pay for top-ups won't receive credits. | API |
| H5 | `src/app/(protected)/dashboard/layout.tsx` | 17 | **Uses `getSession()` instead of `getUser()` for auth check** -- `getSession()` reads from the cookie without server-side validation, which the Supabase docs explicitly warn against for security. The parent layout does call `getUser()`, but the dashboard layout then does a redundant and less secure check. If the cookie is tampered with, `getSession()` would still pass. | Auth |
| H6 | `src/app/(protected)/dashboard/settings/page.tsx` | 305-308 | **Billing tab uses entirely hardcoded data** -- `BILLING_HISTORY`, plan name "Pro", price "$149/month", usage stats "18/25 queries", "8/15 agent uses", payment method "Visa ending in 4242" are all static constants. Not wired to Paddle or any API. Users see fake billing data. | Components |
| H7 | `src/app/(protected)/dashboard/settings/page.tsx` | 498 | **Preferences sends `content_language` to API but API schema doesn't accept it** -- the Preferences tab sends `content_language` in the PATCH body, but `/api/preferences` route's Zod schema does not include this field. It's silently stripped by Zod, so content language preference is never saved. | Components/API |
| H8 | `src/components/dashboard/dashboard-overview.tsx` | 180 | **"/ 4 engines" is hardcoded** -- the mention count shows "/ 4 engines" regardless of the user's plan tier. Pro plan has 8 engines, Business has 10+. This misleads users about their coverage. | Components |
| H9 | `src/lib/email/send.ts` | 5 | **Email FROM address uses wrong env var** -- code reads `EMAIL_FROM_ADDRESS` but `.env.local.example` defines `RESEND_FROM_EMAIL`. In production, the env var will be undefined and fall back to the hardcoded `noreply@beamix.io` which may not match the Resend verified domain. | API |
| H10 | `src/app/api/scan/start/route.ts` | 24-27 | **IP address extraction is unreliable** -- uses `x-forwarded-for` header which can be spoofed by clients. Rate limiting based on IP can be trivially bypassed by setting the header. Should use a trusted header from the hosting provider (Vercel provides a reliable IP header). | Auth |
| H11 | `src/lib/supabase/client.ts` | 6-7 | **Browser client uses non-null assertions for env vars** -- `process.env.NEXT_PUBLIC_SUPABASE_URL!` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` will throw an obscure runtime error if env vars are missing. Unlike the server client which has explicit checks, the browser client silently crashes. | Auth |
| H12 | `src/app/api/cron/trial-nudges/route.ts` | 34 | **Cron job uses JOIN syntax with `user_profiles!inner`** -- this foreign table join requires a foreign key relationship between `subscriptions` and `user_profiles`. If RLS policies block this or the FK doesn't exist, the entire cron job fails silently. | API |

## Medium Priority Issues

| # | File | Line | Issue | Source |
|---|------|------|-------|--------|
| M1 | `src/app/(protected)/dashboard/settings/page.tsx` | 472-513 | **Preferences tab doesn't load current values on mount** -- unlike BusinessProfileTab which fetches data from the API on mount, PreferencesTab initializes all state to hardcoded defaults (`'en'`, `'Asia/Jerusalem'`, etc.) without loading the user's actual preferences. Users always see defaults when opening the tab. | Components/UX |
| M2 | `src/app/(protected)/dashboard/settings/page.tsx` | 269-276 | **Competitors field not saved** -- BusinessProfileTab has a competitors tag input but `handleSave` doesn't include `competitors` in the PUT body. The field is purely cosmetic. | Components |
| M3 | `src/components/dashboard/agents-view.tsx` | 119-138 | **No error handling on agent execution** -- `handleExecute` doesn't show errors to the user. If the API returns an error, the function silently catches in `finally` and does nothing. No toast/alert is shown. | Components |
| M4 | `src/components/dashboard/agents-view.tsx` | 206-213 | **Agent card has overlapping click targets** -- the card has a full-overlay `<Link>` (position absolute, inset-0) AND a "Launch Agent" button inside. The button uses `e.stopPropagation()` but the Link still catches the click. The button sits at z-index default while the link is at z-0, causing unpredictable click behavior. | Components |
| M5 | `src/middleware.ts` | 10-13 | **Middleware silently skips auth when env vars missing** -- if Supabase env vars aren't set, the middleware allows all requests through without session refresh. This means protected routes could be accessed without valid sessions in misconfigured environments. | Auth |
| M6 | `src/app/api/paddle/webhooks/route.ts` | 29-30 | **Webhook reads raw body before verification** -- `request.text()` consumes the body. If the Paddle SDK's `unmarshal` function expects the raw string (which it does), this is fine. But if the body is consumed and then the function tries to read it again, it would fail. The current code is correct but fragile -- no comment explains why `text()` is used. | API |
| M7 | `src/lib/supabase/env.ts` | 1-23 | **Dead code** -- `supabaseEnv` module eagerly validates env vars but is never imported anywhere. It should either be integrated into the Supabase client setup or removed. | Build |
| M8 | `src/app/api/cron/trial-nudges/route.ts` | 83 | **Day 7/12 nudges have N+1 query pattern** -- for each trialing user on day 7, the cron job makes 3 additional sequential DB queries (business, latest scan, content count). With many users, this creates an N+1 query performance issue. | API |
| M9 | `src/app/api/cron/weekly-digest/route.ts` | 46-115 | **Weekly digest has severe N+1 query pattern** -- for each eligible user, makes 4 sequential DB queries (business, scans, recommendations, content, top query). With 100 users, this is 400+ DB calls per cron invocation. | API |
| M10 | `src/components/dashboard/dashboard-overview.tsx` | 272 | **Engine Status section is static** -- shows hardcoded list of 4 engines (chatgpt, gemini, perplexity, claude) all with "Active" badge, regardless of actual scan data. Doesn't reflect the user's plan tier or real engine results. | Components |
| M11 | `src/app/(protected)/dashboard/settings/page.tsx` | 384-389 | **Top-up buttons are not wired** -- the "Add 5 Uses" and "Add 15 Uses" buttons in the billing tab have no onClick handler. They render as non-functional buttons. | Components |
| M12 | `src/app/(protected)/dashboard/settings/page.tsx` | 432-433 | **"Update Payment Method" button is not wired** -- the button has no onClick handler. Should open Paddle.js update payment overlay. | Components |
| M13 | `src/app/(protected)/dashboard/settings/page.tsx` | 440-445 | **"Change Plan" and "Cancel Subscription" buttons are not wired** -- both buttons lack onClick handlers. Critical billing actions are non-functional. | Components |
| M14 | `src/components/onboarding/onboarding-flow.tsx` | 93-103 | **Onboarding reads from localStorage which doesn't exist on SSR** -- while this is a client component (safe), the localStorage reads happen in a useEffect which is correct. However, the `searchParams` dependency is from the closure, and the `eslint-disable` comment suppresses the exhaustive-deps warning. If the URL changes while on the page, the component won't react. | UX |

## Low Priority Issues

| # | File | Line | Issue | Source |
|---|------|------|-------|--------|
| L1 | `src/lib/scan/mock-engine.ts` | -- | **Scan engine is entirely mock** -- uses PRNG-based fake data. Expected for MVP but should be flagged for replacement priority. | API |
| L2 | `src/lib/agents/mock-outputs.ts` | -- | **All agent outputs are mock** -- generates fake content. Same as L1 -- expected for MVP. | API |
| L3 | `src/components/dashboard/dashboard-overview.tsx` | 93-104 | **`businessUrl` prop is accepted but never used** -- the `DashboardOverview` component accepts `businessUrl` in its props interface but the variable is destructured and immediately unused. | Components |
| L4 | `src/app/(protected)/dashboard/settings/page.tsx` | 678-699 | **Integrations tab is all "Coming Soon"** -- four integrations (WordPress, Wix, Google Business Profile, Facebook Pages) are all static badges. Expected for MVP but users see an empty tab. | Components |
| L5 | `src/app/(auth)/login/login-form.tsx` | 31-34 | **Open redirect mitigation is basic** -- the redirect validation only checks `startsWith('/')` and `!startsWith('//')`. While this prevents most open redirect attacks, path-based redirects like `/\evil.com` or `/%0d%0aLocation:evil.com` might bypass it in some edge cases. | Auth |
| L6 | `src/components/onboarding/onboarding-flow.tsx` | 133-136 | **URL form default value not synced** -- `urlForm` is initialized with `defaultValues: { url: '' }` but when `pendingUrl` is set from localStorage, the form's default isn't updated. The Input shows the form's empty default, not the stored URL. `setValue` should be called after initialization. | UX |
| L7 | `src/app/api/scan/[scan_id]/status/route.ts` | -- | **No auth check on scan status endpoint** -- any user can check the status of any scan by ID. Since scan IDs are UUIDs this is low risk, but for consistency, consider adding basic validation. | Auth |
| L8 | `src/app/api/scan/[scan_id]/results/route.ts` | -- | **No auth check on scan results endpoint** -- same as L7. Any user can retrieve full scan results by scan ID. Free scan data could be accessed by anyone who guesses/intercepts the UUID. | Auth |

---

## Table Name Mismatch Summary (Root Cause of C1-C6, H1-H4)

This is the single most critical issue. The API code uses table names that don't match the actual database schema defined in `database.types.ts`:

| Code References | DB Types Has | Files Affected |
|-----------------|-------------|----------------|
| `agent_executions` | `agent_jobs` | execute.ts, overview/route.ts, agents/execute/route.ts, executions/[id]/route.ts |
| `content_generations` | `content_items` | execute.ts, agents/execute/route.ts, weekly-digest, trial-nudges, executions/[id] |
| `agent_outputs` | *(does not exist)* | execute.ts, agents/execute/route.ts, executions/[id]/route.ts |
| `scan_results` | `scans` / `scan_engine_results` | overview/route.ts, onboarding/complete, trial-nudges, weekly-digest |
| `scan_result_details` | `scan_engine_responses` | onboarding/complete/route.ts |
| `credits` | `credit_pools` | overview/route.ts, execute.ts, agents/execute/route.ts, helpers.ts |

**Resolution options:**
1. Run a DB migration to rename tables to match the code (preferred -- less code change)
2. Update all code references to match the existing DB schema
3. Regenerate `database.types.ts` from the actual Supabase schema (the types file may be out of date)

---

## Issues by Audit Area

### API Routes (21 issues)
C1, C2, C3, C4, C5, C6, C7, C8, H1, H2, H3, H4, H9, H10, H12, M6, M8, M9, L1, L2, L7, L8

### Auth & Security (5 issues)
H5, H10, H11, M5, L5

### Components (12 issues)
H6, H7, H8, M1, M2, M3, M4, M10, M11, M12, M13, L3, L4

### UX Flow (3 issues)
H1, M14, L6

### Build & Types (1 issue)
M7

---

## Recommended Fix Order

1. **Resolve table name mismatches** (C1-C8, H1-H4) -- This blocks the entire app. Either migrate the DB or update the code. Affects ~20 files.
2. **Fix column name mismatch** (C7) -- `trial_end` -> `trial_ends_at` in webhook handler.
3. **Wire billing tab to real Paddle data** (H6, M11, M12, M13) -- Users currently see fake billing info.
4. **Fix preferences load/save** (H7, M1) -- Content language not saved, current values not loaded.
5. **Fix email FROM env var** (H9) -- `EMAIL_FROM_ADDRESS` vs `RESEND_FROM_EMAIL`.
6. **Improve auth checks** (H5, H11, M5) -- getSession vs getUser, env var assertions.
7. **Fix agent execution error handling** (M3, M4) -- Silent failures on agent runs.
8. **Optimize cron N+1 queries** (M8, M9) -- Will become critical at scale.
9. **Clean up dead code** (M7, L3) -- Remove unused env.ts, unused props.
