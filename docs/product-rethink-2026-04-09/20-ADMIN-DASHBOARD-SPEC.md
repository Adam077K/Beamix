# Admin Dashboard Spec — Internal Operator View

**Status:** Authoritative. Wave 2 stretch (or new Worker 5).
**Owner:** Wave 2 Worker 4 stretch (devops-lead) OR new Worker 5.
**Resolves:** Missing-perspectives audit C4 + I4 (refund-fraud surfacing).
**Date:** 2026-05-13.

Adam needs a single screen for daily ops: revenue today, signups today, agent failures, LLM burn, refund patterns. MVP-scope: **read-only**, allowlist-gated, server-rendered. No CRUD — Adam uses Supabase Studio + Paddle dashboard for force-pause / force-credit / force-refund operations.

---

## Route + access gate

- **Route:** `apps/web/src/app/(internal)/admin/page.tsx`
- **Layout:** `apps/web/src/app/(internal)/layout.tsx` — server component with a hardcoded allowlist gate:
  ```ts
  const ADMIN_EMAILS = ['adam419067@gmail.com'] as const;
  // later: read from env var ADMIN_EMAIL_ALLOWLIST
  ```
  Redirect to `/home` if the authenticated user's email is not on the list. RLS does NOT protect this — the server-component check is the gate.
- **Why hardcoded for MVP:** allowlist is a single Adam email. Env var migration happens when a second admin joins.
- **Auth posture:** uses standard Supabase auth + middleware-derived session. Cookies-only; no separate admin token.

---

## 6 sections (all read-only)

Server component fetches via `createServerComponentClient` with `service_role` key (server-only file with `import 'server-only'` per security spec). Each section runs one query, renders as a card.

### 1. Revenue
- **Sources:** `paddle_webhook_events` aggregations + `subscriptions` table.
- **Cards:**
  - Today MRR: sum of active subscriptions × monthly equivalent (annual divided by 12).
  - Last 7 days new MRR: sum of `subscription_created` events in last 7d × tier monthly equivalent.
  - Last 30 days new MRR: same, 30d window.
  - Refunds last 30 days: count + total $ refunded.

### 2. Users (latest 50)
- **Source:** `user_profiles` + `subscriptions` + aggregated `agent_jobs` per user.
- **Columns:**
  - Email
  - Tier
  - Signup date
  - Lifetime spend ($)
  - Agent run count (total + last 7d)
  - Last seen (max `agent_run_completed` event from PostHog or DB)
- Sortable by signup date desc default. Top 50 only.

### 3. Agent health
- **Source:** `agent_jobs` last 7 days.
- **Per `agent_type`:**
  - Total runs
  - Success rate %
  - Failure rate %
  - Most common failure stage (from `agent_jobs.failure_stage`)
  - p50 + p95 duration (ms)
- Highlights any agent with <80% success rate in red.

### 4. Cost
- **Source:** `llm_cost_events` table (Wave 0 Worker 1 ships per `05-DB-MIGRATION-PLAN.md` per Fix Agent 3 G10 amendment).
- **Cards:**
  - Total LLM spend last 24h
  - Total LLM spend last 7d (line chart, one point per day)
  - Total LLM spend last 30d
  - Top 10 users by 7d cost
  - Cost per active paying user (rough gross margin check)
- **Alert highlight:** if any user is >$20 in 24h OR global >$200 in 24h, surface the cost circuit breaker auto-trip warning in amber. (Cost circuit breaker itself lives in the Inngest cron from D10 — admin just visualizes.)

### 5. Refunds + disputes (refund-fraud surfacing — addresses I4)
- **Source:** `paddle_webhook_events` filtered to `subscription_refunded` + `transaction_chargeback` + manual entries from Adam.
- **Table:**
  - Refund date
  - User email
  - Card fingerprint hash (last-4 of card OR Paddle fingerprint)
  - Browser fingerprint (PostHog `distinct_id` if linked)
  - Subscription value
  - Runs consumed before refund
  - Days from checkout to refund
  - Days since last refund (for the same card / fingerprint / email)
- **Dedupe alert:** highlight rows where same card / fingerprint / email appears 2+ times — refund-fraud pattern.
- **Aggregate:** refund rate this month (count refunds ÷ count new subscriptions) — flag amber at 3%, red at 5% (per `06-PRICING-V2.md` thresholds).

### 6. Inngest queue
- **Source:** Inngest API (read-only, via API token in env var).
- **Cards:**
  - Open jobs count, grouped by event type
  - Oldest pending job (with timestamp + event name) — flags backlog
  - Functions in error state (count)
  - 24h success/failure rate
- Linked deep-link to Inngest dashboard for any anomaly.

---

## What's NOT in the admin dashboard (deliberately deferred)

- **CRUD operations.** Adam uses Supabase Studio for any DB edit (force-credit, force-pause, manual refund credit). Paddle dashboard for invoice issuance, manual refund, chargeback handling. No "force-action" buttons in the admin UI — too easy to misclick at 1am.
- **User detail page.** Per-user drilldown deferred. Top-50 table + Supabase Studio is enough for first 100 users.
- **Email blast / broadcast.** Deferred. Resend dashboard handles transactional; manual email blast via Adam's Gmail / personal sending list for now.
- **Feature flags / kill switches by tier.** Deferred. Global + per-user kill switch exists in product; per-feature toggle deferred.
- **Audit log viewer.** `audit_log` table exists for compliance but the viewer is post-MVP.
- **Mobile responsive.** Admin is desktop-only. Adam looks at it from his laptop.

---

## Manual operations Adam runs (Wave 1 / Wave 2)

For the first 90 days, Adam handles these manually outside the admin dashboard:

1. **Force-pause a user** → Supabase Studio: `UPDATE user_profiles SET kill_switch_until = NOW() + INTERVAL '7 days' WHERE id = '...';`
2. **Force-credit a user** (e.g., comp for a bug) → Supabase Studio: `UPDATE credit_pools SET topup_amount = topup_amount + N WHERE user_id = '...';`
3. **Force-refund a user** → Paddle dashboard → Transaction → Refund. Webhook fires → DB updates.
4. **Investigate a Sentry P0** → Sentry dashboard. Most P0s self-resolve via Inngest retry; some need manual user notification.
5. **Onboarding call for a Scale customer** → manual Calendly invite from `welcome-onboarded` email reply.
6. **Hebrew support ticket** → Plain inbox → Adam responds personally.

A runbook lives at `docs/RUNBOOKS/admin-manual-ops.md` (Wave 2 devops-lead writes during runbook pass).

---

## Implementation owner — Wave 2 Worker 4 stretch (or Worker 5)

If Worker 4 (devops-lead) has bandwidth after wiring Sentry alerts + `/status` route, they pick up admin. Otherwise spawn Worker 5 dedicated.

**Brief (paste-ready):**

> Read `20-ADMIN-DASHBOARD-SPEC.md`. Deliverables:
> 1. `apps/web/src/app/(internal)/layout.tsx` — allowlist gate on `adam419067@gmail.com`.
> 2. `apps/web/src/app/(internal)/admin/page.tsx` — server component rendering 6 sections.
> 3. One server-only query helper per section in `apps/web/src/lib/admin/queries.ts`. Use `service_role` client via `import 'server-only'` boundary.
> 4. Inngest API client wrapper at `apps/web/src/lib/admin/inngest-api.ts`. Read-only.
> 5. Refund fraud dedupe SQL: window function across `paddle_webhook_events` + `user_profiles` matching by card-fingerprint, browser-fingerprint, and email. Document the dedupe logic in code comments.
> 6. NO mutations. NO API routes. NO client components except a single chart wrapper for the 7d cost line chart.
>
> Stay strictly inside `apps/web/src/app/(internal)/` + `apps/web/src/lib/admin/`. Do NOT add admin links to the main `DashboardShell` — Adam bookmarks `/admin` directly.
>
> Return JSON: branch, worktree, files_created, sections_rendered.

---

## Future iterations (post-MVP)

- Drilldown per-user view (history, jobs, billing timeline).
- Real-time charts via Supabase Realtime channel on `paddle_webhook_events`.
- Cohort retention chart sourced from PostHog API.
- Slack alert hooks: post to a `#beamix-ops` channel when refund rate flips amber/red, when LLM cost circuit breaker trips, when Inngest queue backlog >100.

---

## Status

- [x] Route + access gate locked
- [x] 6 sections specced
- [x] Read-only posture locked (no CRUD in MVP)
- [x] Manual-ops runbook outlined (devops-lead writes in Wave 2)
- [x] Refund-fraud dedupe scoped (addresses missing-perspectives I4)
- [x] Wave 2 brief ready
- [ ] Wave 2: Worker 4 or 5 picks up
