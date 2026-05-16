# Analytics Spec — Product Event Instrumentation

**Status:** Authoritative. Pre-Wave-1 blocker.
**Owner:** Wave 1 Backend Worker 3 (notifications adjacency — natural fit).
**Resolves:** Board decision **B4** ("instrument limit-hit events from day 1") + missing-perspectives audit C1 + I5.
**Date:** 2026-05-13.

Without this spec, Beamix launches blind to conversion and retention. With it, Adam can answer "which funnel step do users drop at?" and "how many limit-hits triggered upgrade?" from Day 1.

---

## Tool decision — PostHog (EU region)

- **Why PostHog:** generous free tier (1M events/mo), EU-region hosting (Frankfurt) covers GDPR-residency concerns for EU traffic, owns identity stitching natively (anon → identified linkage works out of the box), funnels + cohorts + retention reports built in, OSS option available later if pricing balloons.
- **Project:** create `beamix-prod` in PostHog EU.
- **Env vars:**
  ```
  NEXT_PUBLIC_POSTHOG_KEY=phc_...
  NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
  ```
- **SDK:** `posthog-js` (browser) + `posthog-node` (server, for webhook + Inngest events).
- **Cookie consent gating:** PostHog autocapture + analytics cookies blocked until the cookie banner records consent for the `analytics` category. See `18-LEGAL-PUBLISHING-PLAN.md`.

---

## Identity model

PostHog supports anonymous → identified linkage via `identify` + `alias`.

### Anonymous phase (pre-signup)
- Visitor hits `/scan` from the Framer site → PostHog auto-assigns `distinct_id = <uuid>` stored in cookie.
- All free-scan events fire under that anon `distinct_id`.
- The free-scan record persists `fingerprint = posthog.get_distinct_id()` on the `free_scans` row at `scan_started`.

### Identified phase (post-signup)
- On successful Supabase signup, fire on the client:
  ```ts
  posthog.identify(user.id, { email: user.email, tier: 'discover' | null });
  ```
- For the funnel-stitching case (anon free-scanner who later signs up):
  ```ts
  // Look up the free-scan fingerprint at signup time and alias it.
  posthog.alias(freeScan.fingerprint, user.id);
  ```
  This stitches the anon journey to the identified user retroactively.

### Server-side identify
The Paddle webhook fires `checkout_completed` from server context (no browser). Use `posthog-node` + the same `user.id` so client/server events share `distinct_id`.

---

## Event taxonomy (16 events)

Every event has a stable name, a "when fires" trigger, and a property bag. Property names are snake_case. Names match across client + server.

| # | Event | When fires | Properties |
|---|-------|------------|------------|
| 1 | `scan_started` | User submits `/scan` form on Framer/product | `industry`, `location`, `fingerprint` |
| 2 | `scan_completed` | Free-scan Inngest function writes results to DB | `scan_id`, `score`, `engine_count`, `duration_ms` |
| 3 | `scan_revealed` | User reaches the wound-reveal state on `/scan` (animation finishes) | `scan_id`, `score`, `seconds_to_reveal` |
| 4 | `signup_completed` | Supabase `auth.signUp` returns success | `tier`, `source: 'free_scan' \| 'pricing_page' \| 'direct'` |
| 5 | `paywall_viewed` | `<PaywallGate>` modal renders | `trigger: 'agent_run' \| 'competitors' \| 'automation' \| 'inbox'`, `tier` |
| 6 | `checkout_started` | User clicks "Subscribe" → Paddle checkout opens | `price_id`, `tier`, `billing: 'monthly' \| 'annual'` |
| 7 | `checkout_completed` | Paddle webhook `transaction_completed` (server-side via `posthog-node`) | `price_id`, `tier`, `mrr_usd` |
| 8 | `agent_run_started` | `POST /api/agents/run` accepted, Inngest event fired | `agent_type`, `suggestion_id?` |
| 9 | `agent_run_completed` | Pipeline completes successfully | `agent_type`, `duration_ms`, `cost_usd` |
| 10 | `agent_run_failed` | Pipeline halts with error | `agent_type`, `stage`, `error` (sanitized — no PII) |
| 11 | `inbox_item_approved` | User clicks Approve on a draft | `agent_type`, `item_id` |
| 12 | `inbox_item_published` | Archive `published_at` set (user marks self-published) | `item_id`, `external_url` |
| 13 | `limit_hit` | Daily cap / monthly cap / tier-feature gate hit (mandated by board B4) | `limit_type: 'daily_cap' \| 'monthly_runs' \| 'tier_feature'`, `agent_type?`, `tier` |
| 14 | `topup_purchased` | Paddle webhook for top-up product confirms | `price_usd` |
| 15 | `kill_switch_engaged` | Manual toggle OR cost circuit breaker auto-trip | `scope: 'user' \| 'global'`, `source: 'manual' \| 'cost_circuit_breaker'` |
| 16 | `refund_requested` | Paddle webhook `subscription_refunded` OR user-initiated refund link | `days_since_checkout`, `runs_consumed` |

**PII rule:** never log `customInstructions`, `targetContent`, raw scan URLs, business names, or content drafts. `error` strings in event 10 must be Sentry-style sanitized.

---

## Funnel definitions

PostHog "Funnels" tab. Two saved funnels.

### Funnel 1 — Conversion (anon → paying)
Steps in order, 7 days window:
1. `scan_started`
2. `scan_completed`
3. `scan_revealed`
4. `signup_completed`
5. `paywall_viewed`
6. `checkout_started`
7. `checkout_completed`

Adam's North Star drop-off views:
- step 3 → 4 (reveal → signup) — conversion of value-evident scan to lead
- step 5 → 6 → 7 (paywall → checkout → completed) — credit-card abandonment

### Funnel 2 — Activation (paid → activated)
Steps in order, 14 days window:
1. `checkout_completed`
2. `agent_run_started` (first)
3. `inbox_item_approved` (first)
4. `inbox_item_published` (first)

Adam's North Star: % of paying users who reach step 4 within 14 days. This is the activation rate. Compare against refund-window (14d) to surface the activation-vs-refund-window gap (ADQ-1 in audit synthesis).

---

## Cohort + retention definitions

### Cohorts (PostHog cohorts panel)
- **Activated users:** completed step 4 of Funnel 2.
- **At-risk users:** `checkout_completed` >= 7 days ago AND no `agent_run_started` yet.
- **Heavy Build users:** `agent_run_started` count >= 60 in last 30 days (refund-bomb risk per ADQ-5).
- **Discover-tier never-activated:** `tier = 'discover'` AND `agent_run_started` count = 0 after 14 days.

### Retention reports
- **Week-1 retention:** % of users who return ≥1 time in days 1–7 after `checkout_completed`. Target: ≥60%.
- **Day-7 churn:** % of users with `subscription_cancelled` event in days 0–7 after checkout.
- **Day-14 refund-window churn:** % with `refund_requested` in days 0–14 after checkout. Target: ≤5% per `06-PRICING-V2.md` line 189 monitoring threshold.

---

## Implementation notes — Wave 1 Backend Worker 3

The notifications worker already touches every notification + Resend send path. Same worker owns analytics — naturally aligned.

**Files to add:**
- `apps/web/src/lib/analytics/client.ts` — PostHog browser client init + `track(name, props)` helper.
- `apps/web/src/lib/analytics/server.ts` — `posthog-node` instance for webhooks + Inngest functions.
- `apps/web/src/lib/analytics/events.ts` — typed event names + property interfaces (a Zod schema per event so call sites can't drift).

**Server-side event call sites:**
- Paddle webhook handler → `checkout_completed`, `refund_requested`, `topup_purchased`
- Inngest agent pipeline → `agent_run_started`, `agent_run_completed`, `agent_run_failed`
- Inngest scan functions → `scan_started`, `scan_completed`
- Daily cap middleware → `limit_hit`
- Kill switch toggle endpoint → `kill_switch_engaged`

**Client-side event call sites:**
- `/scan` 4-state machine → `scan_revealed`
- Signup callback page → `signup_completed`, fire `alias` if `?scan_id` param present
- `<PaywallGate>` → `paywall_viewed`
- Paddle checkout opener → `checkout_started`
- Inbox approve handler → `inbox_item_approved`
- Archive publish toggle → `inbox_item_published`

**Tests:** Vitest unit test per event verifying property shape matches Zod schema. No live PostHog calls in tests.

---

## Deferred (P2)

- A/B testing framework (PostHog Experiments) — wait until DAU > 200.
- Session recording — too noisy with <100 users + cookie-consent complexity.
- Reverse-ETL to Supabase (sync PostHog cohorts back for in-app behavior) — Month-3 review.

---

## Status

- [x] Tool chosen: PostHog EU
- [x] 16 events specced with names + when-fires + properties
- [x] 2 funnels defined
- [x] Cohort + retention defs locked
- [x] Owner assigned: Wave 1 Backend Worker 3
- [ ] Adam: create PostHog EU project + capture keys (in `06-ADAM-CHECKLIST.md`)
- [ ] Adam: review the 16-event list — flag any omissions before Wave 1 spawns
