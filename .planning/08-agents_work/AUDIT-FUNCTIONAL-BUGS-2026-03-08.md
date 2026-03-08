# Functional Bugs Audit — 2026-03-08

---

## Flow A — Free Scan

### Status: PARTIALLY WORKING

The happy path (submit → redirect → poll → show results) is functionally wired. The scan runs synchronously in `/api/scan/start` and the results are already complete by the time the client arrives at `/scan/[scan_id]`. Polling via `/api/scan/[scan_id]/status` works. The results route `/api/scan/[scan_id]/results` works. The UI renders correctly.

**Bugs:**

- **[BUG-A1] `scan/start` ignores `expires_at` set to 7 days but product spec says 30 days.**
  `src/app/api/scan/start/route.ts:55` — `expires_at` is set to `now + 7 days`. The memory doc says "free scan result expiry: 30 days". This is a product mismatch but not a crash.

- **[BUG-A2] Scan runs synchronously in the API route — will time out in production.**
  `src/app/api/scan/start/route.ts:72-93` — `runMockScan` has a `3000–5000ms` artificial delay (`src/lib/scan/mock-engine.ts:188-189`). This is fine on localhost but Vercel's serverless function limit is 10 seconds on the hobby plan (25s on pro). When real LLM calls are wired in, this will reliably time out. The response is returned to the client only after the scan completes.

- **[BUG-A3] `ScanResultsClient` polls `/status` on an already-completed scan.**
  `src/components/scan/scan-results-client.tsx:781-789` — The polling interval is set on mount and checked against `status === 'loading' || status === 'processing'`. Since the scan is synchronous, the status endpoint will immediately return `completed` on the first poll, which triggers the results fetch. This works, but the interval is never cleared until the component re-renders with a non-polling status. The `status` variable used inside the `setInterval` closure is stale (always `'loading'`), so the interval will fire indefinitely even after the result arrives — it simply won't call `pollStatus` because the outer `if` check uses stale state. Minor resource leak in the browser, not a user-visible crash.

- **[BUG-A4] `ScanResultsClient` does not handle the case where `scanData.results` is null/malformed from the API.**
  `src/components/scan/scan-results-client.tsx:810` — `if (!scanData?.results) return null` silently renders nothing rather than showing an error state. If `results_data` is stored incorrectly in Supabase (e.g., partial write), the user sees a blank page.

---

## Flow B — Signup with scan_id

### Status: PARTIALLY WORKING — TWO BUGS

**Flow walkthrough:**
1. User comes from `/scan/[scan_id]` → clicks "Sign up free" → `/signup?scan_id=<id>` ✓
2. `SignupForm` reads `scan_id` from URL params and passes it to `emailRedirectTo` callback URL ✓
3. Supabase sends confirmation email → user clicks link → `/callback?code=...&scan_id=...` ✓
4. `callback/route.ts` exchanges code, checks `beamix-onboarding-complete` cookie, routes to `/onboarding?scan_id=...` ✓
5. `OnboardingFlow` reads `scan_id` from both `localStorage` (key: `beamix_last_scan_id`) and URL param ✓
6. On Step 3 submit → `POST /api/onboarding/complete` with `scan_id` ✓
7. Onboarding API links `free_scans.converted_user_id`, converts results, marks profile complete ✓
8. Redirect to `/dashboard` ✓

**Bugs:**

- **[BUG-B1] Trial duration mismatch: onboarding sets 14-day trial, product says 7 days.**
  `src/app/api/onboarding/complete/route.ts:141` — `const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)`. The product spec, MEMORY.md, and all email templates reference a **7-day** trial. This code sets a 14-day trial. The dashboard layout also checks `trial_ends_at` to compute `trialDaysLeft`, so users will see "14 days left" on first login.

- **[BUG-B2] `scan_id` from URL param is not reliably passed through for Google OAuth signup.**
  `src/app/(auth)/signup/signup-form.tsx:78-84` — For Google OAuth, the `redirectTo` correctly includes `?scan_id=...`. However, for email/password signup, the `emailRedirectTo` is set to `${window.location.origin}/callback${scanId ? \`?scan_id=${scanId}\` : ''}`. This means `scan_id` is appended as a query param on the callback URL. Supabase appends its own `code` param to this URL, creating `/callback?scan_id=...&code=...` — this works, both params are present. Not a bug.

  However: `OnboardingFlow` checks `localStorage.getItem('beamix_last_scan_id')` first before checking the URL param (`src/components/onboarding/onboarding-flow.tsx:100-103`). If the user had a previous scan in localStorage (e.g., from a different visit), that stale scan_id overwrites the correct one from the current signup URL. **This is a subtle data integrity bug**: the wrong free scan gets linked to the new user account.

- **[BUG-B3] `convertFreeScanResults` writes to `scans` with `avg_position` column that does not exist in the live DB schema.**
  `src/app/api/onboarding/complete/route.ts:241` — The insert into `scans` includes `avg_position: avgPosition`. Per the MEMORY.md DB corrections: "`scans` has NO `avg_position` column." This insert will fail silently (or throw). The function catches the error and logs it, so the user still reaches the dashboard — but their free scan data is never converted into a proper `scans` record. The scan history on the dashboard will be empty after onboarding.

---

## Flow C — Dashboard Overview

### Status: PARTIALLY WORKING — ONE HARD BUG

**Flow walkthrough:**
1. `DashboardLayout` fetches `user_profiles.onboarding_completed_at` — redirects to `/onboarding` if null ✓
2. `DashboardPage` fetches business, credits, scans, recommendations, agent_jobs in parallel ✓
3. `DashboardOverview` component renders with the fetched data ✓

**Bugs:**

- **[BUG-C1] New users have no `credit_pools` row — dashboard shows 0 credits with no explanation.**
  `src/app/(protected)/dashboard/page.tsx:29-33` — Queries `credit_pools` for `pool_type = 'agent'`. A brand-new user completing onboarding has no `credit_pools` row unless the `handle_new_user` DB trigger or `allocate_monthly_credits` RPC created one. If no row exists, `creditsResult.data` is `null`, and `totalCredits` and `monthlyCredits` both render as `0`. No error is shown. Trial users genuinely have 5 agent credits per the spec, but they will see "0 / 0 monthly" on the dashboard.

- **[BUG-C2] Dashboard trial start — no trigger fires to set `trial_started_at`.**
  Per the MEMORY.md spec, the trial clock should start on "first dashboard visit." The onboarding route sets `trial_started_at` at onboarding completion (`src/app/api/onboarding/complete/route.ts:148`), not on first dashboard visit. This is a spec deviation but not a code crash.

- **[BUG-C3] Engine Status card shows all 4 engines as "Active" regardless of actual scan data.**
  `src/components/dashboard/dashboard-overview.tsx:271-295` — The "Engine Status" section always renders 4 badges labeled "Active" when `hasData` is true. It does not read from any per-engine scan result data. This is hardcoded mock UI, not a crash but misleading data.

- **[BUG-C4] `DashboardOverview` receives `businessUrl` as a prop but never uses it.**
  `src/components/dashboard/dashboard-overview.tsx:58,92-103` — `businessUrl` is declared in the props interface and destructured at the component signature but never referenced in the JSX. Dead prop (minor).

---

## Flow D — Agent Execution

### Status: BROKEN — MULTIPLE BUGS

**Flow walkthrough:**
1. `AgentsView` renders 7 agent cards. User clicks "Launch Agent" → opens `AgentModal` ✓
2. Modal collects `topic, tone, targetLength, language, targetKeyword` — calls `AgentExecuteParams` ✓
3. `handleExecute` in `AgentsView` calls `agentTypeToSlug(selectedAgent.type)` and fetches `/api/agents/${slug}` ✓
4. **BUG HERE** — see BUG-D1 and BUG-D2 below

**Bugs:**

- **[BUG-D1] `AgentsView` calls the wrong agent API routes for `competitor_research` and `query_researcher`.**
  `src/components/dashboard/agents-view.tsx:37-94` — The AGENTS array defines `type: 'competitor_research'` and `type: 'query_researcher'`.
  `agentTypeToSlug('competitor_research')` looks up `config.dbType === 'competitor_research'` in `AGENT_CONFIG` (`src/lib/agents/config.ts:24-85`). But AGENT_CONFIG only defines `competitor_intelligence` (dbType) and `faq_agent` (dbType) — there is no `competitor_research` or `query_researcher` as a `dbType`. So `agentTypeToSlug` returns `undefined` for both, and the fallback `selectedAgent.type.replace(/_/g, '-')` is used:
  - `competitor_research` → calls `/api/agents/competitor-research` ✓ (route exists)
  - `query_researcher` → calls `/api/agents/query-researcher` ✓ (route exists)
  These routes call `executeAgent('competitor-research', request)` and `executeAgent('query-researcher', request)` respectively. But `executeAgent` looks up `AGENT_CONFIG['competitor-research']` and `AGENT_CONFIG['query-researcher']` — **neither exists in AGENT_CONFIG** (it has `'competitor-intelligence'` and no `'query-researcher'`). Both routes return `{ error: 'Unknown agent type', status: 404 }`.

  The `AgentsView` `handleExecute` does `if (res.ok)` then navigates — if not ok, it silently sets `isExecuting(false)` with no user error message. **User clicks "Generate", nothing happens.**

- **[BUG-D2] `AgentModal` sends `topic/tone/targetLength/language` but the agent execute API at `/api/agents/execute` expects `agentType/prompt/businessId`.**
  `src/components/dashboard/agents-view.tsx:119-138` calls `fetch(/api/agents/${slug}, { body: JSON.stringify(params) })` where params is `AgentExecuteParams` (`topic, tone, targetLength, language, targetKeyword`). The per-slug routes all delegate to `executeAgent(slug, request)` in `src/lib/agents/execute.ts`. `executeAgent` validates with `agentInputSchema` which expects `topic, tone, targetLength, language, targetKeyword` — this matches the modal output. **This sub-path actually works.**

  However, `src/app/api/agents/execute/route.ts` (the generic execute route) expects a completely different schema: `agentType/prompt/businessId`. This route is never called from `AgentsView` (which uses slug-specific routes), so the mismatch here is unused. The `execute/route.ts` is dead code for the current UI path.

- **[BUG-D3] `agent-chat-view.tsx` uses `data.credits_cost` but `executeAgent` returns `credits_cost`.**
  `src/components/dashboard/agent-chat-view.tsx:198` reads `data.credits_cost`. `src/lib/agents/execute.ts:214` returns `credits_cost: config.cost`. Field names match. ✓ Not a bug.

- **[BUG-D4] `agent-chat-view.tsx` has no `businessId` to send with the request — the request has no businessId but the server no longer requires it (uses primary business lookup).**
  `src/components/dashboard/agent-chat-view.tsx:172-181` — The fetch sends `{ topic, tone, targetLength, language }` with no `businessId`. `executeAgent` does not require `businessId` in the input schema — it looks up the primary business from the session. ✓ Not a bug for current code path.

- **[BUG-D5] After execution, `AgentsView.handleExecute` redirects to `/dashboard/agents/${selectedAgent.type}?execution=${data.execution_id}` but the API returns `execution_id` (snake_case) correctly.**
  `src/components/dashboard/agents-view.tsx:133` uses `data.execution_id`. `src/lib/agents/execute.ts:211` returns `execution_id`. Matches. ✓

- **[BUG-D6] `AgentChatPage` validates `agent_id` against `VALID_AGENTS` which uses DB underscore names, but the page URL uses DB names directly (not slugs).**
  `src/app/(protected)/dashboard/agents/[agent_id]/page.tsx:5-13` — `VALID_AGENTS` is `['content_writer', 'blog_writer', 'faq_agent', ...]`. `AgentsView` links to `/dashboard/agents/${agent.type}` where `agent.type` is also `content_writer` etc. The URL uses DB type names, and `AgentChatPage` validates against DB names — these match. ✓ Not a bug.

  But `AgentChatView` looks up `AGENT_META[agentType]` using the same underscore names. `AGENT_META` defines `competitor_research` and `query_researcher` (old names) but the `VALID_AGENTS` list in `AgentChatPage` validates against `competitor_intelligence` and `faq_agent`. So if a user navigates to `/dashboard/agents/competitor_intelligence` it passes the VALID_AGENTS check but `AGENT_META['competitor_intelligence']` is undefined → `if (!meta) return null` → **blank page with no error.**

- **[BUG-D7] `faq-agent` has no corresponding API route under `/api/agents/`.**
  `AGENT_CONFIG` defines slug `'faq-agent'` → API route would be `/api/agents/faq-agent`. No such route file exists. Calling the FAQ agent from the chat view fetches `/api/agents/faq-agent` → **404**.

- **[BUG-D8] `src/app/api/agents/executions/[id]/route.ts` has a bogus second Supabase query.**
  Line 49-53: queries `agent_jobs` with `.eq('agent_job_id', id)`. `agent_jobs` has no `agent_job_id` column — the column is `id`. This also selects columns `output_type`, `title`, `structured_data`, `summary`, `is_favorited` that do not exist in `agent_jobs` (confirmed via `database.types.ts` — the table only has `output_data` as a JSON blob). This query will error or return nothing every time. The `structuredOutput` in the API response is always null.

---

## Flow E — Settings Billing

### Status: BROKEN — HARDCODED DATA

- **[BUG-E1] Entire Billing tab is hardcoded mock data — not wired to any API.**
  `src/app/(protected)/dashboard/settings/page.tsx:305-451` — The `BillingTab` component has no `useEffect`, no `fetch`, no state from the DB. Plan name shows "Pro", price "$149", next billing "April 1, 2026", usage is hardcoded `18/25` and `8/15`, billing history shows two static entries (Feb/Mar 2026), and the payment method shows "Visa ending in 4242". The "Update Payment Method" and "Cancel Subscription" buttons have no `onClick` handlers — clicking them does nothing.

- **[BUG-E2] `BillingTab` "Change Plan" and "Cancel Subscription" buttons have no `onClick` — dead buttons.**
  `src/app/(protected)/dashboard/settings/page.tsx:440-443` — Both render as `<Button variant="outline">` with no handler. No Paddle portal link, no navigation.

---

## Missing API Routes

| Page/Component | Calls | Exists? |
|---|---|---|
| `AgentsView` via `agentTypeToSlug('competitor_research')` fallback | `POST /api/agents/competitor-research` | YES — but `executeAgent('competitor-research')` → 404 (not in AGENT_CONFIG) |
| `AgentChatView` for `faq_agent` type | `POST /api/agents/faq-agent` | NO — no route file |
| `AgentsView` via `agentTypeToSlug('query_researcher')` fallback | `POST /api/agents/query-researcher` | YES — but `executeAgent('query-researcher')` → 404 (not in AGENT_CONFIG) |
| `BillingTab` "Update Payment Method" | `POST /api/paddle/portal` | Route exists but button has no onClick |
| `DashboardOverview` "View all recommendations" | Links to `/dashboard/rankings` | Page exists ✓ |
| Settings page `Preferences` tab | `GET/PATCH /api/preferences` | EXISTS ✓ |
| Settings page `Business` tab | `GET/PUT /api/businesses/primary` | EXISTS ✓ |

---

## Component-Data Mismatches

### 1. `executions/[id]/route.ts` — queries nonexistent columns on `agent_jobs`
File: `src/app/api/agents/executions/[id]/route.ts:49-53`

The second query in this route selects `output_type, title, structured_data, summary, is_favorited` from `agent_jobs` using `.eq('agent_job_id', id)`. Issues:
- `agent_jobs` has no `agent_job_id` column (it's `id`)
- `agent_jobs` has none of those columns (`output_type`, `title`, `structured_data`, `summary`, `is_favorited`) — these likely came from a different planned table
- The `from('agent_jobs').eq('agent_job_id', id)` filter will match zero rows
- Result: `structuredOutput` is always null in the response

### 2. `DashboardOverview` — `recentAgents` expects `credits_cost: number` but DB allows null
File: `src/components/dashboard/dashboard-overview.tsx:83` — interface defines `credits_cost: number` (not nullable).
`src/app/(protected)/dashboard/page.tsx:49` — selects `credits_cost` from `agent_jobs`.
`database.types.ts:76` — `credits_cost: number` (not nullable in the Row type, has default). Actually safe. ✓

### 3. `AGENT_LABELS` in `DashboardOverview` uses stale agent type names
File: `src/components/dashboard/dashboard-overview.tsx:37-48` — defines labels for `competitor_research` and `query_researcher`, but the live DB enum has `competitor_intelligence` and `faq_agent`. Records stored in `agent_jobs` will use the correct DB enum values. The `AGENT_LABELS` map won't find a match and falls back to the raw enum string. Users see `competitor_intelligence` instead of "Competitor Research" in the Recent Activity card.

### 4. `content_items` insert in `execute.ts` uses `content` but DB type shows `content` is the primary column
File: `src/lib/agents/execute.ts:189-204` — inserts `content: agentOutput.content`. The DB `content_items` table has a `content` column (NOT `generated_content` which was the old name). ✓ Correct.

### 5. `BillingTab` "Top-Ups" buttons have no Paddle integration
File: `src/app/(protected)/dashboard/settings/page.tsx:383-389` — "Add 5 Uses" / "Add 15 Uses" buttons have no `onClick`. Paddle top-up flow is unimplemented.

---

## Inngest Wiring

**Inngest is not used in this codebase.**

- No `/src/inngest/` directory exists
- No `/src/app/api/inngest/route.ts` exists
- No `inngest` package usage found anywhere
- `package.json` does not include `inngest` as a dependency (confirmed indirectly by absence of any files)

All background job logic (cron jobs, email sends) uses direct Next.js API routes under `/src/app/api/cron/` secured by `CRON_SECRET`, and agent execution is fully synchronous within the API route handler. This is consistent with the "No n8n" decision in MEMORY.md. No wiring issues to report here.

---

## Missing Environment Variables

These `process.env` variables are used in code but have **no entry** in `.env.example`:

| Variable | Used In | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `src/app/sitemap.ts:4` | `.env.example` has `NEXT_PUBLIC_APP_URL` but not `NEXT_PUBLIC_SITE_URL`. The sitemap falls back to `'https://beamix.io'` hardcoded. Low risk but inconsistent. |
| `EMAIL_FROM_ADDRESS` | `src/lib/email/send.ts:5` | Falls back to `'Beamix <noreply@beamix.io>'`. Not in `.env.example`. |

All other env vars used in the codebase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PADDLE_API_KEY`, `PADDLE_ENVIRONMENT`, `PADDLE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_ENVIRONMENT`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`) are all present in `.env.example`.

---

## Summary of Critical Bugs (Fix Priority)

| ID | Severity | Description |
|---|---|---|
| BUG-D1 | CRITICAL | `competitor_research` and `query_researcher` agent buttons silently fail — wrong slug in AGENT_CONFIG |
| BUG-D7 | CRITICAL | `faq-agent` has no API route — calling it returns 404 |
| BUG-D6 | HIGH | Navigating to `/dashboard/agents/competitor_intelligence` renders a blank page |
| BUG-D8 | HIGH | `executions/[id]` route queries nonexistent columns, `structuredOutput` always null |
| BUG-B3 | HIGH | `convertFreeScanResults` tries to insert nonexistent `avg_position` column into `scans` table |
| BUG-B1 | HIGH | Trial duration set to 14 days in code, product spec says 7 days |
| BUG-E1 | MEDIUM | Settings Billing tab is entirely hardcoded — plan, usage, history, payment method all fake |
| BUG-C1 | MEDIUM | New users with no `credit_pools` row see 0 credits with no explanation |
| BUG-B2 | MEDIUM | Stale `beamix_last_scan_id` in localStorage can link the wrong free scan to a new user |
| BUG-C3 | LOW | Dashboard Engine Status always shows all 4 engines as "Active" regardless of scan data |
| BUG-A2 | LOW | Synchronous scan execution will time out when real LLM calls replace the mock |
