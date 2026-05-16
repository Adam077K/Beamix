# Day-1 Onboarding Flow — Post-Payment Dead-Dashboard Cure

Resolves **P0-5** in `../10-PRE-BUILD-AUDIT.md`. Ensures every new paid user lands on a dashboard that already has score, scan results, and 3 ranked suggestions — never an empty shell.

---

## Trigger surface

```
Free scan → /scan/[scanId]/result → Paddle checkout → Paddle webhook
                                                        ↓
                                                Day-1 chain (this doc)
                                                        ↓
                                                /onboarding/post-payment (UI)
                                                        ↓
                                                /home (with data pre-loaded)
```

The cycle starts on Paddle `subscription_created` webhook (or `transaction_completed` for first-payment).

**Paddle checkout passthrough (D1).** Paddle checkout is created with `customData: { supabase_user_id: '<auth.uid()>' }` (Paddle's passthrough field). The webhook handler reads `customData.supabase_user_id` as the authoritative `user_id` — it does NOT rely on `paddle_customer_id` lookup. This eliminates the user_id race when `paddle_customer_id` has not yet been stamped on `user_profiles`.

---

## Sequence

```
[1] Paddle webhook: subscription_created
    ├─ Validate signature (HMAC-SHA256 on raw body)
    ├─ Idempotency: INSERT INTO paddle_webhook_events(event_id) ON CONFLICT DO NOTHING.
    │    If insert returns no row → return 200 immediately, no side effects (replay).
    ├─ Read user_id from customData.supabase_user_id (passthrough — authoritative).
    │    Fallback: lookup by paddle_customer_id only if passthrough is missing
    │    (legacy/portal-initiated events).
    ├─ UPSERT subscriptions row (plan_tier from price_id mapping)
    ├─ Insert credit_pools row (allocation by tier: 25/90/250)
    ├─ Mark user_profiles.payment_completed_at = NOW()
    └─ Inngest send: 'day1.onboarding' {
         userId, businessId, scanId?,
         idempotency_key: subscription_id + first_billing_period_start
       }
       Inngest deduplicates by this key for 24h — replayed webhook never
       double-fires the Day-1 chain.

[2] Inngest fn: day1.onboarding
    │  (Steps run sequentially; each step idempotent.)
    │
    ├─ Step A: ensure_business
    │   • If user signed up from free scan: link free_scans.converted_user_id, copy
    │     business profile fields (name, industry, location, services, scanUrl).
    │   • Else: business already created during in-app signup; verify required fields.
    │   • If required fields missing: skip Day-1 chain, surface profile-completion prompt
    │     on /home and abort gracefully. (Edge case — most users come via free scan.)
    │
    ├─ Step B: run_query_mapper
    │   • Trigger agent job (1 run, deducted from pool).
    │   • Use scan data from linked free_scans row if available (saves a scan call).
    │   • Output → query_clusters table → tracked_queries table.
    │   • Concurrency key: businessId.
    │
    ├─ Step B.5: query_review_gate (board April-18)
    │   • UI surfaces the top-10 queries from Query Mapper output on
    │     /onboarding/post-payment. User reviews / edits / removes queries
    │     before the scan fires. ONE human checkpoint in the otherwise-automated chain.
    │   • Chain pauses here — Inngest `step.waitForEvent('day1.queries_confirmed', ...)`
    │     until the user clicks "Confirm queries" in the UI (POST /api/onboarding/confirm-queries).
    │   • Auto-confirm after 30 min idle (user closed the tab — chain continues with
    │     Query Mapper's top-10 unmodified).
    │   • State machine: day1_state = 'query_review' until confirmed.
    │   • On confirm: tracked_queries replaced with the user's final list.
    │
    ├─ Step C: run_first_paid_scan
    │   • Fire scan-manual Inngest job with tier-appropriate engine list
    │     (Discover 3 / Build 7 / Scale 9).
    │   • Reads tracked_queries from Step B (NOT free-scan defaults).
    │   • Wait for scan.completed event (max 120s; longer = warn user, see UI).
    │
    ├─ Step D: evaluate_rules
    │   • Call evaluateRules(scanId, businessId) — see 02-AUTOMATION-RULES.md.
    │   • Bulk-insert top-N suggestions.
    │
    ├─ Step E: auto_run_top_agents (board April-17 — dead-dashboard cure)
    │   • Suggestions priming (D4 — refresh-safe):
    │     – Highest-impact suggestion: `suggestions.visible_at = NOW()` (visible immediately).
    │     – Next 2 suggestions: `suggestions.visible_at = NOW() + interval '60 seconds'`.
    │     – Home page filters `WHERE visible_at <= NOW()` — no client-side timer.
    │     – Column `visible_at timestamptz NOT NULL DEFAULT now()` lives on `suggestions`.
    │   • **Auto-run 2–3 highest-impact agents** (board April-17 explicit requirement —
    │     "First 2-3 highest-impact agents auto-run (~30-60s each)"). Selection:
    │     – Read rules-engine output from Step D, sorted by impact + credit cost.
    │     – Skip page-locked agents (page_lock_held by Step B).
    │     – Skip agents requiring user input (e.g. Content Optimizer with no target URL).
    │     – Skip if user's credit_pool.available_runs < 6 (preserves runway).
    │     – Auto-run the top 2 free-tier agents (Schema Generator + FAQ Builder are
    │       safe defaults — daily-capped, $0). Plus the top 1 paid agent (typically
    │       Freshness Agent or Content Optimizer on the homepage).
    │     – Fire each as `agent.run.requested` Inngest event with `auto_triggered: true`
    │       payload flag. Concurrency key: businessId. Stagger 5s apart.
    │   • Outputs land in Inbox as drafts with a "Drafted for you" pill.
    │   • Result: user lands on /home with score + 3 suggestions + 2–3 drafted Inbox items.
    │   • Insert notification: type 'day1_ready', body
    │     "Your workspace is set up. 3 suggested actions are ready and 3 drafts are
    │      waiting in your Inbox."
    │
    └─ Step F: send_welcome_email
        • Resend template: welcome-onboarded
        • Variables: firstName, scoreSnapshot, topSuggestionTitle
        • Audit log entry: day1_completed_at on user_profiles.
```

---

## UI states on `/onboarding/post-payment`

This route polls until Day-1 chain reports completion (`user_profiles.day1_completed_at IS NOT NULL`). State machine drives the progress UI.

```
day1_state          UI rendering
─────────────────   ──────────────────────────────────────────────────────────
WAITING_WEBHOOK    "Confirming payment…" spinner (≤5s typical)
ENSURE_BUSINESS    "Setting up your workspace…" + progress bar 10%
QUERY_MAPPER       "Mapping how AI engines see {{businessName}}…" + 25%
SCAN_RUNNING       "Scanning {{engineCount}} engines for your queries…" + 50%
RULES              "Analyzing and prioritizing your next moves…" + 80%
COMPLETE           "All set. Taking you to your workspace." + 100% → redirect
ERROR              "We hit a snag — your data is safe. We'll finish in the background."
                   + "Continue to dashboard" button (skip wait, finish async)
```

- Polling interval: 2 seconds.
- Total expected time: 60–120 seconds (typical), max 180s before showing escape hatch.
- The route is built by **Wave 1 Frontend Worker 3** (paywall + post-payment owner).
- The polling endpoint is `GET /api/onboarding/day1-status` (Wave 1 Backend Worker 2).

---

## Operational safeguards

**Kill switch re-check (D8).** The agent pipeline runner re-reads `user_profiles.kill_switch_until` and `system_kill_switch` at the PLAN step and immediately before the DO step. If a kill-switch is engaged between cron dispatch and step execution, the pipeline aborts cleanly:
- Call `releaseCredits(jobId)` to restore the held credits.
- Insert a notification: "Run aborted — kill switch active".
- Mark `agent_jobs.status = 'cancelled'`.

This closes the race window where Inngest cron dispatches a job, the user toggles the kill switch a second later, and the queued run still executes (W9).

**Idempotent Inbox state transitions (D9).** `POST /api/inbox/[id]/approve` is idempotent: if `inbox_items.status` is already `approved`, return 200 with the existing archive item — do not create a duplicate row. `POST /api/inbox/[id]/reject` likewise: if already `rejected`, return 200 noop. Two-tab approvals from the same user never create duplicate `archive_items` rows.

The Inbox handler enforces this via:
1. Read `inbox_items.status` inside a transaction.
2. If terminal state (`approved` / `rejected`), short-circuit with the existing record.
3. Otherwise, transition state + create archive item + return 200.

---

## Failure modes & recovery

| Failure | Behavior |
|---------|----------|
| Query Mapper fails | Skip — Day-1 chain continues with free-scan default queries. Flag follow-up suggestion R12 (re-map queries). |
| First scan times out (>120s) | Allow user to enter `/home` with "Scan in progress" banner. Dashboard renders Day-1 empty state (`04-EMPTY-STATES.md` §Home Day-1) until scan completes. |
| Rules engine errors | Skip — surface a single fallback suggestion ("Add structured data to your homepage" — always-safe R02 default). Audit log captures the error for inspection. |
| Webhook delivery delayed (>30s) | UI shows "Confirming payment…" with reassurance copy: "This sometimes takes a moment — your payment is being verified." After 60s, show support link. |
| User refreshes during Day-1 | Resume from current state (steps are idempotent + use `day1_state` enum on user_profiles to track progress). |

---

## Database fields required

Two columns added to `user_profiles` for Day-1 tracking:

```sql
ALTER TABLE user_profiles
  ADD COLUMN day1_state text
    CHECK (day1_state IN
      ('waiting_webhook','ensure_business','query_mapper','scan_running','rules','complete','error'))
    DEFAULT 'waiting_webhook',
  ADD COLUMN day1_completed_at timestamptz;
```

Migration belongs in the Wave 0 rethink-schema file (`05-DB-MIGRATION-PLAN.md`).

---

## Existing-subscriber day-1 (for upgrades that change tier)

**D5 — Day-1 chain fires on FIRST PAID transaction regardless of prior preview state.** The trigger condition is `subscription_created` event where `user_profiles.day1_completed_at IS NULL`. Preview users who convert to Build/Scale DO get the full Day-1 chain. Existing PAID subscribers upgrading tier (e.g., Discover→Build) get only the credit_pools rebalance + notification — not a fresh Day-1 chain.

For existing paid subscribers upgrading (Discover → Build):
- Paddle `subscription_updated` webhook fires (Day-1 chain does NOT re-trigger).
- `credit_pools` allocation increases (90 instead of 25).
- `notifications` insert: "Welcome to Build — you now have 90 AI Runs/month + 7 engines".
- One-shot Inngest event: re-evaluate rules on the latest scan with the new tier filter, may unlock previously-tier-gated rules (e.g., R13 Engine Coverage Gap).

For preview-to-paid conversions (preview user pays for the first time):
- Treated as first paid transaction. Day-1 chain fires in full because `day1_completed_at IS NULL`.
- Business profile + linked free-scan data may already exist — Step A skips fields that are populated.

---

## Verification

Day-1 chain is exercised in Wave 2 Playwright E2E test `day1.spec.ts`:

1. Land on `/scan`, complete free scan with deterministic fixture URL → result page.
2. Click "Fix this now" → Paddle sandbox checkout (Build tier) → return to `/onboarding/post-payment`.
3. Assert: progress UI moves through all 5 states within 180s.
4. Assert: redirect to `/home`.
5. Assert: score chart shows latest scan, 3 suggestion cards visible, notification bell shows unread count = 1.
6. Assert: `credit_pools.available_runs = 90` (Build allocation) minus 1 (Query Mapper).
7. Assert: welcome email landed in test inbox (Resend dev mode).

Gate before launch: this E2E test passes on staging at least 3 consecutive runs.
