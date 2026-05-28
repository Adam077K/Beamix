---
date: 2026-05-28
author: ceo (session ceo-3-1779270080)
purpose: Self-contained CTO+CEO dispatch brief for Wave 2 build
status: READY-TO-USE
target: paste into fresh CTO session for planning, then CEO dispatches workers
supersedes: docs/08-agents_work/2026-05-25-WAVE-1-DISPATCH-BRIEF.md (Wave 1, shipped)
---

# Wave 2 Dispatch Brief — CTO Planning Packet + CEO Direct Dispatch

> **Two-phase pattern (Wave 1 lesson):** CTO subagent cannot spawn workers (runtime guard blocks nested `Task`). Phase 1 — paste this brief into a fresh CTO session; CTO returns a per-worker dispatch packet. Phase 2 — CEO pastes each per-worker brief from the packet into a `Task` call and dispatches in parallel.

---

## Mission

Build Wave 2 of the **Beamix agency-pivot product**: turn the Wave 1 shell into a recurring revenue machine.

Wave 1 shipped the customer surface (free scan → discovery booking → 30-min text discovery agent → brand fingerprint → outcomes dashboard shell + approvals shell). Wave 2 makes it generate value over time:

1. The dashboard counter for approvals shows a real number (not 0)
2. Customers actually approve content via email-linked tokens
3. Every published action consumes a deliverable quota and gets blocked at tier ceiling
4. Customers get a real Sunday-evening weekly digest
5. Day-61 revenue is correctly booked (cron flips `booked_at`)
6. Founding-100 cohort progress is visible in the UI
7. Two new agents draft and propose work that fills the approval queue

Wave 2 ships to staging, gated by QA-Lead Full-tier review before any production cutover.

---

## Authoritative source documents (read FIRST, in this order, as ONE cached block)

| What | Where | Why |
|---|---|---|
| 15 locked product decisions + 5 CEO sub-decisions | `.claude/memory/DECISIONS.md` → 2026-05-23, 2026-05-24, 2026-05-27 entries | Strategic ground |
| Wave 1 closeout (what shipped + what we learned) | `docs/08-agents_work/sessions/2026-05-27-ceo-wave1-closeout.md` | Cumulative state |
| Wave 1 dispatch brief (the original) | `docs/08-agents_work/2026-05-25-WAVE-1-DISPATCH-BRIEF.md` | "Out of scope (push to Wave 2)" section is the spine of this brief |
| Wave 2 rescoped brief (prior CTO work) | `docs/product-rethink-2026-04-09/build-prep-2026-05-13/10-WAVE-2-BRIEF.md` | Deliverables tracking + tier gates + digest + held-revenue spec |
| Agent PRDs (Wave 2 new ones) | `docs/04-features/specs/agent-customer-success.md` (if exists) + `agent-approval-gate-writer.md` (if exists) | If missing → CPO authors first |
| Discovery + Brand-brief PRDs (Wave 1 context) | `docs/04-features/specs/agent-discovery.md` + `agent-brand-brief-manager.md` | Brand fingerprint integration |
| DB schema with 5 Wave 1 migrations applied | `docs/03-system-design/DATABASE_SCHEMA.md` | Tables to read/write |
| API contracts | `docs/03-system-design/API_CONTRACTS.md` | New endpoints for approval + signup |
| Engineering Principles (Wave 1 added #9-12) | `docs/ENGINEERING_PRINCIPLES.md` | NO agent names, audit_log on every publish, held-revenue accounting, refund_events append-only |
| Wave 1 R3 dispatch lessons | `~/.claude/projects/.../memory/feedback_worker_worktree_from_origin.md` + `feedback_cto_planning_only.md` + `feedback_worker_stall_atomic_commits.md` | Hard-won dispatch rules |
| QA tier floor (post-Wave 1) | `.claude/qa-tier-floor.yml` | Tier per file path; many new agency paths added in Wave 1 |

---

## Wave 1 state on entry (assume these are LIVE)

- All 5 Wave 1 DB migrations applied to staging Supabase (2026-05-28)
- Wave 1 code on `main` at commit `4d7a7e8` (or newer)
- Vercel env has: `NEXT_PUBLIC_CALCOM_DISCOVERY_LINK`, `CALCOM_WEBHOOK_SECRET`, `PADDLE_STARTER_MONTHLY/ANNUAL_PRICE_ID`, `PADDLE_GROWTH_MONTHLY/ANNUAL_PRICE_ID`, `PADDLE_SCALE_AGENCY_MONTHLY/ANNUAL_PRICE_ID`, `PADDLE_PROFESSIONAL_MONTHLY/ANNUAL_PRICE_ID`, `DISCOVERY_SESSION_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- Wave 1.5 domain-verification module at `apps/web/src/lib/auth/domain-verify.ts` waiting for signup-route caller

## Adam-blockers — verify status BEFORE spawning workers

| Blocker | Wave 2 task it blocks | How to verify |
|---|---|---|
| **AB-W2-1 Apply 5 Wave 1 migrations to PRODUCTION Supabase** | Any Wave 2 work that goes to production (most things) | Run STAGE-1 + STAGE-2 against prod project; verify with `SELECT tier FROM plans` returning 6 rows incl 3 new tiers |
| **AB-W2-2 ToS + Privacy Policy published** | Customer signup (real-money flow) — CBO Wave 1.5 marked this as Adam-blocker | `curl https://app.beamixai.com/terms` returns 200 + last-modified date |
| **AB-W2-3 Liability insurance procured** | Customer signup | Adam confirms Hibub/Phoenix policy active (see `docs/business/INSURANCE_PROCUREMENT_PLAN.md`) |
| **AB-W2-4 CPO writes 2 agent PRDs** | Group D (new agents) | `docs/04-features/specs/agent-customer-success.md` + `agent-approval-gate-writer.md` exist with full spec |
| **AB-W2-5 `APPROVAL_SIGNING_SECRET` env in Vercel** | Group C (approval queue real wiring) | `vercel env ls` shows it set (32-byte secret, prod + preview) |
| **AB-W2-6 `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` valid for cron** | Group A (digest cron) + Group B (booked_at cron) | Inngest dashboard shows the app connected; smoke-fire a test event |

**If any of AB-W2-1/2/3/4/5/6 are not done, STOP. Spawn only workers that don't depend on the missing piece. AB-W2-1 + AB-W2-4 + AB-W2-5 block the most ground.**

---

## Wave 2 scope — 6 groups

### Group A — Deliverables tracking + tier-gate middleware

**Worker:** `backend-engineer` (Full tier)

1. **`apps/web/src/lib/billing/deliverables.ts`** — `consumeDeliverable({customerId, kind, count})` reads the current row in `deliverables_per_customer_per_month` (or INSERT a fresh row at month start), checks against tier cap, increments; throws `OverTierCapError` with the relevant counter name + tier ceiling on breach.
2. **Tier-cap config** — `apps/web/src/lib/billing/tier-caps.ts` exporting a constant map `TIER_CAPS: Record<PlanTier, DeliverableCaps>`. Reference values come from `docs/product-rethink-2026-04-09/build-prep-2026-05-13/10-WAVE-2-BRIEF.md` (or default to Starter 50 schema/mo + 20 citations/mo + 10 content/mo; Growth 2×; Scale 5×; Professional unlimited).
3. **Monthly reset cron** — Inngest function `reset-deliverables-monthly` (cron: subscription anniversary day OR first of month for simplicity Wave 2). Inserts/updates `deliverables_per_customer_per_month` row for the new period.
4. **Middleware integration** — every agent execution path (Wave 1 + the new agents in Group D) calls `consumeDeliverable` before publishing; on `OverTierCapError` returns a customer-facing message: "Your Starter plan includes X this month. Upgrade to Growth for Y." (NO agent names per Principle #9).

### Group B — Held-revenue booked_at cron + booking automation

**Worker:** `backend-engineer` (Full tier; touches `apps/web/src/lib/paddle/**` which is Irreversible per qa-tier-floor.yml — actually treat as **Irreversible** for the booking logic specifically)

1. **Paddle webhook handler** — `apps/web/src/app/api/webhooks/paddle/route.ts` listens for `transaction.completed` + `subscription.activated` events; writes `revenue_events` row with `booked_at = NULL`, `received_at = now()`, `held_until = now() + interval '60 days'`. HMAC-verified per Paddle's spec.
2. **`apps/web/src/inngest/functions/revenue-booking-sweep.ts`** — Inngest cron runs daily at 02:00 UTC; walks `revenue_events WHERE booked_at IS NULL AND received_at < now() - interval '60 days'`; for each row, check no matching `refund_events` row (else skip); UPDATE `booked_at = now()`. Uses the scoped UPDATE policy from migration 04.
3. **Refund handler** — `apps/web/src/lib/refund/process-refund.ts` exports `processRefund({subscriptionId, reason})` — inserts `refund_events` row (RLS denies UPDATE/DELETE, append-only per Principle #12); cancels Paddle subscription via API; sends refund confirmation email via Resend.
4. **ARR/MRR helpers** — `apps/web/src/lib/billing/revenue-metrics.ts` queries `revenue_events WHERE booked_at IS NOT NULL` for dashboards.

### Group C — Approval queue real wiring + signup route

**Workers:** `backend-engineer` for API + `frontend-engineer` for UI (Full tier; signup-route + APPROVAL_SIGNING_SECRET handling is Full per qa-tier-floor.yml)

1. **Signup route** — `apps/web/src/app/api/auth/signup/route.ts` calls `verifyBusinessDomain` (from Wave 1.5), creates Supabase Auth user with email confirmation, creates `user_profiles` + initial `subscriptions` row (tier Starter, held_until + 60d), writes audit_log, fires Inngest `user.signed_up`.
2. **`/approvals` real data** — replace the Wave 1 stub. Server Component reads `approval_queue` rows for the authenticated user via Supabase RLS. Includes the `kind` + `evidence_url` + `expires_at` columns; agent identity NEVER leaked (outcome-shaped DTO).
3. **Approve/Reject actions** — Server Actions `approveApprovalItem(id)` and `rejectApprovalItem(id)`. Both verify customer owns the row, update `state`, fire Inngest event (`approval.approved` or `approval.rejected`) for downstream agents to publish or skip. Write audit_log.
4. **Email-linked 1-click approval** — `apps/web/src/app/approvals/quick/[token]/route.ts` accepts `signedToken` from approval-pending email, verifies HMAC against `APPROVAL_SIGNING_SECRET`, looks up approval_queue row, presents 1-click confirm UI, calls the same Server Action. Signed token expires per `approval_queue.expires_at` (default 7 days).
5. **Approval-pending email send trigger** — Inngest handler for `approval.created` event sends the approval-pending template (Wave 1 scaffold) with the signed token CTA URL filled in.

### Group D — 2 new customer-facing agents

**Worker:** `ai-engineer` (Irreversible tier — touches `lib/agents/**` which qa-tier-floor.yml flags as Irreversible for discovery + brand-brief-manager; treat all new agents the same)

**Prerequisite:** CPO PRDs must exist for both agents. If missing, CTO returns BLOCKED + asks CEO to spawn CPO worker first.

1. **Customer Success agent** at `apps/web/src/lib/agents/customer-success/`
   - Cron-triggered weekly (or on `approval.rejected` / `deliverables.over_cap` events)
   - Proactive nudges + check-ins via email (uses Resend `weekly-digest`-style template OR a new `success-nudge` template)
   - Reads `brand_fingerprints` for tone calibration
   - YMYL gate honored — defer to human-approval if YMYL detected
   - Cost alert >$0.50/customer/week
   - Sonnet 4.6 streaming via direct Anthropic SDK

2. **Approval-gate writer agent** at `apps/web/src/lib/agents/approval-gate-writer/`
   - Triggered by Inngest event `gated_publish.requested` (fired by Visibility tracker or Strategy agent when they detect an opportunity)
   - Drafts content/email/outreach + inserts `approval_queue` row with state='pending', `evidence` jsonb containing the drafted artifact + provenance
   - YMYL-aware: if YMYL detected, ALWAYS sets `kind='ymyl'` and fires audit_log security_violation event if downstream tries to publish without approval
   - Reads `brand_fingerprints.requires_human_approval` flag — if true OR YMYL OR customer is in first 50, MUST go to approval_queue (cannot auto-publish)
   - Sonnet 4.6

### Group E — Weekly digest cron

**Worker:** `backend-engineer` (Full tier)

1. **`apps/web/src/inngest/functions/weekly-digest-builder.ts`** — Inngest cron runs Sundays 16:00 customer's local timezone (read from `user_profiles.timezone`). For each customer:
   - Aggregate week's `approval_queue` pending items
   - Aggregate visibility-score deltas from `scans` over last 7 days
   - Aggregate "wins" — newly approved content, scan-result improvements
   - Insert `weekly_digests` row
   - Fire Inngest `digest.send_requested` event
2. **Digest send handler** — fires the approval-pending email pattern but using a new `weekly-digest.tsx` React Email template (NOT the Wave 1 welcome template). Template lists each pending approval with the signed-token CTA (reuses Group C's signing logic).
3. **Smoke test** — manual Inngest event dispatch endpoint (dev-only, `NODE_ENV !== 'production'` guard) to trigger a digest for a specific customer for QA.

### Group F — Founding-100 cohort UI + onboarding flow

**Workers:** `frontend-engineer` + `backend-engineer` (Full tier)

1. **Founding-100 status helper** — `apps/web/src/lib/billing/founding-100.ts` exports `getFoundingCohortStatus()` reading `founding_100_cohort` table + `subscriptions WHERE founding_100_cohort = true` count. Returns `{enrolledCount: N, capacity: 100, isCustomerFounding: bool}`.
2. **Dashboard counter panel** — new component on `/dashboard` showing "Customer #N of 100 Founding Members" with a progress bar. NO agent names. Reads `getFoundingCohortStatus()`.
3. **Founding-100 invitation logic** — at signup, if `enrolledCount < 100` AND no refund_events on this account, set `subscriptions.founding_100_cohort = true` and insert `founding_100_cohort` row. Triggered from Group C signup route.
4. **Onboarding flow** — `/onboarding/[step]` 3-step server-rendered wizard: (1) confirm business + verify (Wave 1.5 helper), (2) book Discovery call (Cal.com embed from Wave 1), (3) wait-for-Discovery placeholder + status. After Discovery emits brand_fingerprint, fire `discovery.completed` Inngest event which Wave 1 email handler already listens for.

---

## Out of scope for Wave 2 (push to Wave 3)

- Publishing integrations matrix (WordPress, GBP, SendGrid sub-account, GTM schema, Wix paste-ready) → Wave 3 per `11-WAVE-3-BRIEF.md`
- Voice for Discovery agent → MVP+90
- Strategy agent → Wave 3 (after Wave 2 ships customer #1)
- Publisher agent → Wave 3 (paired with publishing integrations)
- Customer #51+ multi-host Cal.com pool → MVP+30
- LinkedIn real verification → MVP+90 (Wave 1.5 ships the stub)

---

## Worker dispatch pattern (Wave 1 lessons applied)

Per `feedback_worker_worktree_from_origin.md` + `feedback_cto_planning_only.md`:

```bash
# Every worker, in EVERY brief, starts with:
MAIN_REPO=/Users/adamks/VibeCoding/Beamix
git -C "$MAIN_REPO" fetch origin main
git -C "$MAIN_REPO" worktree add -b feat/[slug] "$MAIN_REPO/.worktrees/[slug]" origin/main
cd "$MAIN_REPO/.worktrees/[slug]"

# Sanity check (first 3 tool calls):
test -f docs/08-agents_work/2026-05-28-WAVE-2-DISPATCH-BRIEF.md || { echo "STALE — STOP"; exit 1; }
test -d apps/web/src/lib || { echo "STALE — STOP"; exit 1; }
git rev-parse HEAD
```

**Failsafe — required in every worker brief:** "Commit what you have before running low on turn budget. PARTIAL-but-committed beats empty branch."

**Atomic commits per logical change.** Conventional commits (`feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`).

**maxTurns is now 50 for the 9 worker types** (per PR #92). Each worker should comfortably fit a focused feature in one shot. Continue to split into sub-workers if scope exceeds 5 deliverables.

---

## CTO planning packet — what to return to CEO

For each Group (A–F), produce a per-worker brief that CEO can paste into a `Task` call without modification. Format:

```yaml
worker_id: backend-engineer-w2-deliverables
subagent_type: backend-engineer
description: "Wave 2 Group A — deliverables tracking + tier-gate middleware"
worktree_slug: be-w2-deliverables
branch: feat/be-w2-deliverables
risk_tier: full | irreversible
prerequisites: [AB-W2-1, AB-W2-5, ...]
prompt: |
  ## Identity
  - /name backend-engineer-w2-deliverables
  - /color blue
  ## Worktree setup (from origin/main)
  ...
  ## Sanity check (first 3 tool calls)
  ...
  ## Mission
  ...
  ## Deliverables (atomic commits)
  1. ...
  2. ...
  ## Hard rules
  ...
  ## Return JSON
  ...
```

CTO does NOT spawn workers itself. CTO produces the packet and returns it to CEO. CEO does the `Task` dispatching from the parent session.

---

## Agent identity (per CLAUDE.md naming rules)

- CTO planning session: `/name cto-wave2` `/color blue`
- CEO dispatcher session: `/name ceo-wave2-dispatch` `/color gold` (or orange/teal/lime for parallel CEOs)
- Workers: `/name [role]-w2-[task-slug]`, color per role

---

## QA gate

Wave 2 ships at the **Full tier** (touches API + DB + auth + paying-customer surface).

- **Irreversible sub-tasks:** any change in `apps/web/src/lib/paddle/**` (Group B booking handler), `apps/web/src/lib/refund/**` (Group B refund handler), `apps/web/src/lib/agents/customer-success/**` and `apps/web/src/lib/agents/approval-gate-writer/**` (Group D), and `apps/web/src/lib/publishing/**` (if any glue ships in Wave 2). Multi-judge + Adam sign-off.

**CEO directly dispatches reviewers per branch** (QA-Lead can't nest Task either — Wave 1 lesson):

- Lite: code-reviewer
- Full: code-reviewer + security-engineer
- Irreversible: code-reviewer + security-engineer + adversary-engineer (Opus on adversary worth it; Wave 1 adv-ai caught 7 attack scenarios on ai-discovery that line-level review missed)

**No merge without CEO synthesis of reviewer verdicts + Adam sign-off on Irreversible.**

---

## Definition of Done — Wave 2

1. ✅ Tier-gate middleware blocks an over-tier-cap agent run with clear customer-facing error (no agent names)
2. ✅ Monthly reset cron fires on cohort anniversary; deliverables_per_customer_per_month row appears
3. ✅ Paddle webhook → revenue_events row written with booked_at=NULL and held_until=+60d
4. ✅ revenue-booking-sweep cron flips booked_at on day 61 for an un-refunded transaction
5. ✅ Refund handler inserts refund_events row + cancels Paddle subscription + sends email
6. ✅ Signup route creates user + subscription + audit_log + fires user.signed_up
7. ✅ /approvals page shows real pending items from approval_queue (no stub data)
8. ✅ Approve/Reject Server Actions update state + fire Inngest event
9. ✅ Email-linked 1-click approval flow works end-to-end with signed token
10. ✅ Customer Success agent fires weekly nudge + respects YMYL gate
11. ✅ Approval-gate writer agent inserts approval_queue row + sets ymyl flag when appropriate
12. ✅ Weekly digest cron runs Sunday 16:00 customer-local + assembles + sends
13. ✅ Founding-100 counter visible on /dashboard with real count
14. ✅ Onboarding 3-step wizard live + integrates Wave 1 verifyBusinessDomain
15. ✅ Every PR has QA-Lead PASS (CEO-synthesized) + Adam sign-off on Irreversible
16. ✅ Each worker writes session file at `docs/08-agents_work/sessions/2026-05-XX-[role]-w2-[task].md`
17. ✅ CTO writes Wave 2 closeout session file
18. ✅ CEO writes Wave 2 closeout + updates DECISIONS.md + MEMORY.md
19. ✅ E2E Playwright: signup → onboarding → discovery-booking → discovery-chat → approval-pending email → 1-click approve → digest scheduled
20. ✅ Staging deploy + smoke test green; production deploy after Adam sign-off

---

## Stop conditions (escalate to CEO / Adam, do not push through)

- Any DB migration that would drop a column with customer data without double Adam confirm
- Any change to `revenue_events` UPDATE policy beyond the day-60 sweep — escalates to "money flow" review
- Any customer-facing API response leaking agent names (Principle #9, hard rule)
- Any auto-publish path that bypasses `approval_queue` for non-listed/auto-approved kinds (`schema`, `gbp`, etc. — explicit auto list only; everything else MUST go through approval)
- Any cost-per-agent-run exceeding $1 (current estimates: Discovery $0.20–0.40, Customer Success $0.10–0.30, Approval-gate writer $0.05–0.20)
- 3-retry-exhausted blocked worker → CEO escalation per Wave 1 pattern

---

## Return contract (CTO planning packet → CEO)

CTO returns this YAML at the end of its planning session:

```yaml
status: COMPLETE | PARTIAL | BLOCKED
agent: cto-wave2
adam_blockers_status:
  AB-W2-1: green | red | unknown
  AB-W2-2: ...
  AB-W2-3: ...
  AB-W2-4: ...
  AB-W2-5: ...
  AB-W2-6: ...
worker_briefs:
  - {worker_id: ..., subagent_type: ..., prompt: |..., risk_tier: ..., prerequisites: [...]}
  - {worker_id: ..., ...}
parallel_dispatch_order:  # which workers CEO can spawn at the same time
  wave_a: [...]   # Group A + independent
  wave_b: [...]   # After A migrations land
prerequisite_dispatches:
  cpo_prd_workers: [...]  # if AB-W2-4 missing — CEO spawns these first
session_file: docs/08-agents_work/sessions/2026-05-28-cto-wave2-planning.md
recommended_total_workers: <number — Wave 1 was 6 in R1; aim 6-8 here with 50-turn budget>
estimated_cost_range_usd: "<low–high based on past worker cost-per-feature>"
notes_for_ceo: |
  Anything CEO should know before dispatching (e.g., cross-branch
  coordination at merge time, env vars CEO should pre-add to Vercel)
```

---

## After Wave 2 ships

Triggers Wave 3 dispatch (publishing integrations matrix per `11-WAVE-3-BRIEF.md`).

**Sequenced AFTER Wave 2 ships customer #1** per CTO decision A10 — publishing on customer's external systems requires approval_queue + held-revenue accounting + audit trail to be live first.

---

## Cost reality check (set expectations before dispatch)

Wave 1 cost ~1M tokens (~3× theoretical minimum) due to maxTurns:20 stalls + R1 stale-main waste. Wave 2 should be cleaner:

- maxTurns:50 is in effect (PR #92) — workers complete features in one shot more often
- Branch-from-origin pattern is documented + sanity-checked in every brief
- Commit-as-you-go failsafe is muscle memory now
- QA pattern (CEO directly dispatches Opus adversary on Irreversible) is proven

**Target:** Wave 2 ships in 8–12 worker invocations (6 main groups + 2-4 fix-dispatch micro-workers + ~6-10 QA reviewers). Budget ~500–700k tokens.

---

**Brief ends. CTO: paste this entire brief into a fresh session, read the source docs as ONE block, then produce the planning packet per the Return Contract above.**
