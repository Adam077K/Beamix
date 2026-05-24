# Wave 2 — Polish & Launch (CEO Brief)

*Updated 2026-05-23 — agency pivot. Wave 2 scope expanded with deliverables tracking, tier gates, weekly digest, held-revenue accounting, domain + business verification, and founding-100 cohort tracking. Hebrew/RTL and E2E QA carry forward but are now lower priority than the agency-pivot scope below.*

**Paste this entire file into a fresh CEO session once Wave 1 has merged.**

---

## AGENCY PIVOT RESCOPE — 2026-05-23 (READ FIRST, OVERRIDES BELOW)

Decisions #2, #6, #8, #9, #11, #14 from the 2026-05-23 grill session translate into 6 new Wave 2 deliverables. CPO + ai-engineer + frontend-engineer + backend-engineer all touch Wave 2; tier gates and held-revenue are critical-path.

### W2.1 — Deliverables tracking + tier gates (NEW, replaces credit_pools UI surface)

**Owner:** backend-engineer + frontend-engineer (parallel)
**Risk tier:** Full (touches every customer agent run)

- New table `deliverables_per_customer_per_month` (see DATABASE_SCHEMA delta): columns `customer_id, month_anchor, schema_pushed_count, faq_published_count, citation_submitted_count, content_published_count, outreach_email_count, locations_count, engines_tracked_count`.
- Tier-gate middleware reads from this table before any agent run. Limits per tier (from decision #11):

| Tier | Locations | Engines | Prompts | Schema/mo | FAQs/mo | Citations/mo | Outreach/mo |
|---|---|---|---|---|---|---|---|
| Starter $499 | 1 | 3 | 25 | 4 | 2 | 5 | 0 |
| Growth $999 | 3 | 5 | 75 | 12 | 6 | 15 | 0 |
| Scale $1,499 | unlimited | 7 | 200 | 24 | 10 | 30 | 10 |
| Professional $2,499 | unlimited | 7+custom | 500 | unlimited | 16 | unlimited | 30 |

- Limit-exceeded behavior: agent run rejected with `LimitExceededError`, queued for next month-anchor reset. Customer-success agent notifies customer.
- Counter increments on `BasePublisher.publish()` success (or successful gated approval → published).
- Outcomes dashboard reads counters for the "deliverables used this month" panel.

### W2.2 — Weekly digest generator (NEW)

**Owner:** backend-engineer + ai-engineer
**Risk tier:** Full (customer-facing email + content)

- New table `weekly_digests` (DATABASE_SCHEMA delta): one row per customer per week with rendered HTML + signed approval URLs + visibility deltas + win highlights.
- New Inngest cron `digest-builder` (`apps/web/src/inngest/functions/digest-builder.ts`) runs Sundays 16:00 customer-local time, assembles digest from `approval_queue` + `scan_engine_results` + `publishing_actions` of the past 7 days.
- Digest writer agent (CPO PRD: `docs/04-features/specs/agent-digest-writer.md`) composes the narrative.
- Sent via Resend; new template `weekly_digest.tsx`.
- Customer 1-clicks "approve all" or per-item from the digest. Signed URLs land on `/approval/:id` with email-token auth.

### W2.3 — Held-revenue accounting (NEW, money flow — IRREVERSIBLE)

**Owner:** backend-engineer + security-engineer review
**Risk tier:** Irreversible — Adam sign-off required

- New columns on `subscriptions`: `held_until TIMESTAMPTZ` (set to subscription_created_at + 60 days), `held_revenue_amount NUMERIC` (cumulative held for the customer).
- New table `revenue_events`: `customer_id, paddle_event_id, type ('charge'|'refund'|'release'), amount, received_at, booked_at (NULL until day 61)`.
- New table `refund_events`: append-only ledger of every refund triggered (date, amount, paddle_event_id, customer_id, reason, founding_100_cohort BOOLEAN).
- Paddle webhook `transaction.completed` writes `revenue_events` with `received_at=now()`, `booked_at=NULL`.
- Nightly cron `revenue-booking-sweep` (`apps/web/src/inngest/functions/revenue-booking-sweep.ts`) flips `booked_at=now()` on any event where `received_at + 60 days < now()` AND no matching refund row exists.
- ARR/MRR dashboards (admin only) read from `booked_at IS NOT NULL`. Cash-received vs booked-revenue split visible to Adam.
- Refund webhook → `refund_events` row + `subscriptions.held_until = now()` (immediate cancel) + Paddle issues refund.

### W2.4 — Domain + business verification at signup (NEW)

**Owner:** backend-engineer
**Risk tier:** Full (anti-fraud gate per decision #8 guardrail 2)

- Add to onboarding flow: customer provides business website domain, Beamix runs verification:
  - DNS check (domain resolves, not parked, not on Spamhaus DBL)
  - WHOIS check (domain registered > 6 months OR has matching business name)
  - Optional: GBP lookup, BBB lookup, LinkedIn company lookup (per-vertical)
- Verification status stored in `business_verifications` table: `customer_id, domain, status ('verified'|'pending'|'failed'), checks JSONB, verified_at`.
- Failed verification blocks subscription activation (Paddle checkout proceeds, refund triggered if checks fail post-payment).
- Hard ban on re-signup: refunded customer + domain pair stored in `refund_ban_list`; new signup with same domain rejected.

### W2.5 — Founding-100 cohort tracking + refund-rate audit_log (NEW)

**Owner:** backend-engineer
**Risk tier:** Lite (audit/analytics only, no customer surface)

- New column `subscriptions.founding_100_cohort BOOLEAN` (true for first 100 paying customers).
- Daily cron `founding-100-metrics` writes audit_log row: `event_kind='founding_100_metrics'`, `spec.cohort_size`, `spec.refund_rate_to_date`, `spec.refund_count`, `spec.churn_count`, `spec.month_anchor`.
- If `refund_rate >= 0.25` → audit_log row `event_kind='founding_100_cohort_tighten_trigger'` + Telegram P0 to Adam (per guardrail 4).
- Trigger response: next cohort cuts money-back window from 60 to 30 days (config flag, not code change).

### W2.6 — Customer-success agent (NEW)

**Owner:** ai-engineer
**Risk tier:** Full (customer-facing communication)

- Customer-success agent (CPO PRD: `docs/04-features/specs/agent-customer-success.md`) monitors customer health signals:
  - Failed publishes → DM customer with context + 1-click reconnect
  - Approval queue items aging > 5 days → digest reminder
  - DNS verification stuck > 24h → hands-on email
  - Visibility score regressing 2 weeks in a row → escalate to Adam during founding-100
- Sends through customer's SendGrid sub-account (so emails look from Beamix, not from a no-reply alias).

### Wave 2 worker dispatch (updated)

CEO spawns the following workers in parallel after Wave 1 ships:

1. **`be-deliverables-gates`** (backend-engineer) — table + middleware + tier-gate enforcement
2. **`ai-digest-writer`** + **`be-digest-cron`** (ai-engineer + backend-engineer) — digest agent + Inngest cron
3. **`be-held-revenue`** (backend-engineer, Irreversible — Adam reviews) — held-revenue tables + booking cron + refund webhook wiring
4. **`be-domain-verification`** (backend-engineer) — verification pipeline + ban list
5. **`be-founding-100-tracking`** (backend-engineer) — cohort flag + metrics cron + escalation trigger
6. **`ai-customer-success`** (ai-engineer) — Customer-success agent prompt + Inngest watcher functions
7. **`fe-outcomes-dashboard-v2`** (frontend-engineer) — outcomes dashboard reads from deliverables + revenue + digest tables (craft reviewer required)

Workers 1+2+3+5 are parallel after Wave 1 merge. Workers 4+6+7 follow once tables exist. Held-revenue (worker 3) is the longest QA review — security-engineer + Adam sign-off required.

### Legacy Wave 2 sections — still apply

Hebrew/RTL pass (worker 1 of legacy section), E2E Playwright tests (worker 2), devops launch setup (worker 3), empty-state + mobile polish (worker 4) — **all still apply.** They just sequence after the agency-pivot Wave 2 work above. Legacy worker count expands from 4 to 11.

---

## Mission *(legacy — agency-pivot section above supersedes scope; QA pattern + craft reviewer carry forward)*

All features are built. Wave 2 makes everything launch-ready: Hebrew/RTL, full QA pass with E2E tests, devops launch setup, empty-state + mobile polish. Deploy 4 parallel workers + qa-lead. After Wave 2 ships, Beamix is live.

**Estimated turns (per worker):** 25–50.

---

## Required Reading

You (CEO) read all of these. Pass relevant ones to each worker.

1. All Wave 0/0.5/1 PRs (read commit history for context)
2. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/05-DB-MIGRATION-PLAN.md` §Cutover (devops-lead)
3. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/04-EMPTY-STATES.md` (Worker 4)
4. `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md` §Pre-Launch Evaluation Criteria (Worker 2)
5. `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md` §11 Technical Foundation (Worker 1 for RTL approach)

---

## QA gate output contract (carried forward from Wave 1)

Same verdict-frontmatter schema as Wave 1, including the **craft** fields:
```yaml
---
verdict: PASS | BLOCK
risk_tier: trivial | lite | full
findings: []
craft_score: 1-5                  # REQUIRED on FE PRs; n/a on backend-only PRs.
craft_findings: []                # NEVER empty on a frontend PR.
customer_outcome_check: ""        # "does this PR move <metric>? — yes/no/n/a"
---
```

### Craft reviewer (P0-A) — Full-tier addition for frontend PRs in Wave 2

Worker 4 (design-polish, empty-state audit, mobile QA, animation spring tuning, error boundaries + skeletons) is **in scope** for `craft-reviewer`. Workers 1 (Hebrew/RTL strings — frontend touching) and 1B (Hebrew prompts — backend) and Worker 3 (devops) are NOT in scope (1B + 3 are not frontend; Worker 1 is string extraction only — CEO judges per-PR whether craft applies). For any PR that ships visible UI, QA Lead spawns the 5th Full-tier reviewer: `craft-reviewer` (Sonnet) using the charter defined in `09-WAVE-1-BRIEF.md` §Craft reviewer. BLOCK criteria (a–j) are identical. Output: writes `craft_score`, `craft_findings: []`, and `customer_outcome_check` into the verdict frontmatter. Empty `craft_findings` on a frontend PR is suspicious — CEO challenges it and re-runs.

---

## Worker 1 — `frontend-developer` (Sonnet)
**Worktree:** `.worktrees/w2-hebrew-rtl`
**Branch:** `feat/w2-hebrew-rtl`
**Owner of:** Hebrew strings + RTL layout

**Brief:**

> 5 core screens fully Hebrew-translated AND RTL-tested: Home, Scans, Inbox, paywall modal, scan-result page. RTL pass on ALL 7 pages using Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`) — replace any direction-specific overrides.
>
> Install `next-intl`. Extract every UI string to `apps/web/src/locales/en/<page>.json` and `apps/web/src/locales/he/<page>.json`. Hebrew translations: Adam reviews.
>
> Heebo font for Hebrew text — load via `next/font/google`.
>
> Worker 1 owns `next-intl` string extraction + 5 core screens RTL pass. **Hebrew agent prompt variants are NOT in Worker 1's scope.** Re-assign: CEO spawns a separate `ai-engineer` worker (call it **Worker 1B**, Sonnet, `.worktrees/w2-hebrew-qa-polish`, branch `feat/w2-hebrew-qa-polish`) for Hebrew QA and polish.
>
> **Worker 1B scope changed 2026-05-16 (P0-E):** Hebrew prompt authoring moved to Wave 1 BE-1 (ships at launch alongside English). Worker 1B's new scope is **Hebrew post-launch QA + polish**, not prompt creation:
> 1. **Hebrew QA review of agent outputs.** Run 1 golden test case per agent in Hebrew mode (per `07-AGENT-ROSTER-V2.md` Pre-Launch Evaluation Criteria) against the HE prompts BE-1 shipped. Capture each output, rate publish-readiness, and patch any prompt that fails (commit patches back to `apps/web/src/lib/agents/config/prompts/<agent>.ts`). Coordinate with Wave 2 Worker 2 (eval harness) to fold these into the broader 55-case evaluation report.
> 2. **RTL layout polish on Hebrew screens.** Worker 1 ships the baseline RTL pass on 5 core screens with logical properties. Worker 1B does a polish pass: catches any RTL bug Worker 1 missed (icon mirroring, scroll directions, chart axes, animation directions, focus-ring asymmetry). Bug log with screenshots; fixes committed.
> 3. **Hebrew copy review of UI strings shipped in Wave 1.** Read every `apps/web/src/locales/he/<page>.json` produced by Worker 1, and every Hebrew string baked into Wave 1 FE components. Flag tone-off, machine-translation-feel, or grammatically awkward strings; commit fixes. Adam validates final pass.
> 4. **Hebrew Resend template polish.** BE-3 ships HE email templates at Wave 1 launch (P0-E). Worker 1B reviews actual rendered output (Litmus screenshots) and patches any visual or copy issues.
>
> Worker 1B does NOT author new prompt files (Wave 1 BE-1 owns that). Do NOT rename existing exports. Document everything in PR.
>
> Add `lang` and `dir` attributes to `<html>` based on user locale. Test that RTL Inbox 3-pane mirrors correctly (list on right, evidence on left in RTL).

---

## Worker 2 — `qa-lead` orchestrator + `test-engineer` (Sonnet)
**Worktree:** `.worktrees/w2-qa`
**Branch:** `feat/w2-qa`
**Owner of:** E2E tests + agent golden-case evals + error boundaries

**Brief (qa-lead delegates to test-engineer):**

> Three deliverable streams:
>
> **Stream A — Playwright E2E (test-engineer):**
> Use `mcp__playwright__*` MCPs (project rule). 5 golden flows:
> 1. `free-scan-flow.spec.ts` — scan URL → result page → "explore first" → preview dashboard
> 2. `paywall-conversion.spec.ts` — preview user → run agent → paywall → Paddle sandbox checkout → `/onboarding/post-payment` → `/home`
> 3. `day1-onboarding.spec.ts` — Paddle webhook → day1 chain → 3 suggestions on Home (covers `03-DAY-1-FLOW.md` §Verification)
> 4. `agent-approval-loop.spec.ts` — Home suggestion → run → Inbox draft → approve → archive → mark published → URL probe queued
> 5. `tier-gating.spec.ts` — Discover sees 1 suggestion (rest blurred), Authority Blog Strategist blocked, upgrade to Build unlocks
>
> Tests run against staging Supabase + Paddle sandbox. Each flow passes 3 consecutive runs to be considered stable.
>
> **Stream B — Agent golden-case evals (test-engineer):**
> Per `07-AGENT-ROSTER-V2.md` Pre-Launch Evaluation Criteria: 5 golden test cases per agent (distinct business profiles). 4/5 outputs must be rated publish-ready by Adam (human review). Captured as fixtures in `apps/web/src/lib/agents/__evals__/`. QA harness in `apps/web/scripts/run-agent-evals.ts` — runs all 55 cases, dumps results to a markdown report.
>
> Eval criteria per output:
> - GEO signals present (stats / citations / quotes per `12-AGENT-BUILD-SPEC.md` §System Prompt Rules)
> - No AI disclosure language
> - YMYL flags appropriately raised
> - Hebrew output coherent (if business.language === 'he')
>
> **Stream C — Unit + integration tests (test-engineer):**
> - Credit system unit tests: hold/confirm/release cycle, failure paths, race conditions
> - Daily cap enforcement tests: increment, reset, cap-reached behavior
> - (NOTE: error boundaries are NOT test-engineer scope — Layer Contract forbids leads/test-engineers from authoring React component wrappers. Error boundary React components + loading skeletons are reassigned to **Worker 4 (frontend-developer)** — see Worker 4 brief below.)
>
> Return: report of pass/fail per agent + per E2E flow. Stream A must be 5/5 passing before merge.

---

## Worker 3 — `devops-lead` (Sonnet)
**Worktree:** `.worktrees/w2-launch`
**Branch:** `feat/w2-launch`
**Owner of:** production migration + env audit + Sentry + observability + rollback plan

**Brief:**

> Read `05-DB-MIGRATION-PLAN.md` §Cutover for production migration process.
>
> Deliverables:
>
> 1. **Production Supabase migration:** apply all Wave 0 migration files to `beamix-v2-prod` via `mcp__supabase__apply_migration`. Run `mcp__supabase__get_advisors`. Resolve every finding. Verify RLS denies cross-user access (smoke test pack from Wave 0).
>
> 2. **Environment variable audit:** every variable from `06-ADAM-CHECKLIST.md` set in Vercel production env. Document in `apps/web/.env.example` (no secrets — placeholders only). Distinct from staging — production uses prod Paddle + prod Supabase + dedicated OpenRouter key.
>
> 3. **Sentry:** wire client + server SDK. Source maps uploaded on build. Alert rules:
>    - P0: any unhandled error in `(protected)/*` routes
>    - P1: agent pipeline failure rate > 10% in 1h
>    - P2: scan duration > 120s p95
>    - Notification channel: Adam's email + slack-webhook (if configured)
>
>    **PII scrub config (E6, H7) — MANDATORY.** Initialize both client and server SDKs with:
>    ```typescript
>    Sentry.init({
>      dsn: process.env.SENTRY_DSN,
>      sendDefaultPii: false,
>      beforeSend(event) {
>        return scrubAgentBodies(event); // denylist below
>      },
>      beforeBreadcrumb(b) { return scrubBreadcrumb(b); },
>    });
>    ```
>    `scrubAgentBodies` denylist (recursive key match, case-insensitive): `customInstructions`, `targetContent`, `business.name`, any key ending in `.email`, `prompt`, `completion`, `paddle.payload`, `webhook.body`, `passwordHash`, `service_role_key`. Replace matched values with `"[REDACTED]"`. Tests in `apps/web/src/lib/observability/__tests__/scrub.test.ts` assert every denylisted key is stripped.
>
> 4. **LLM cost logging:** wire OpenRouter usage events to the `llm_cost_events` table — the table was added to Wave 0's migration set (Fix Agent 2 already moved it there; confirmed in `05-DB-MIGRATION-PLAN.md`). Wave 2 devops does NOT add migrations — it only wires the Inngest event handler that writes to the table. One row per LLM call. **PII denylist (E6, H7):** the insert payload includes only `user_id, business_id, agent_type, stage, model, prompt_tokens, completion_tokens, cost_usd, created_at`. Inserting `prompt_text`, `completion_text`, `customInstructions`, or `targetContent` is forbidden — the table schema does not define these columns; any attempt is a code-review BLOCK. Daily aggregation job → emails Adam a cost summary (totals + per-user top 10, no raw text).
>
> 5. **Credit reconciliation cron:** daily Inngest job that recomputes `credit_pools.used_amount` from `credit_transactions` and flags any drift.
>
> 6. **Vercel deployment verified:** `app.beamixai.com` DNS → Vercel production. Preview branches auto-deploy. Build cache configured.
>
> 7. **Rollback plan documented:** `docs/RUNBOOKS/production-rollback.md` — steps to revert env vars back to legacy project if v2 has critical issues post-cutover. Per `05-DB-MIGRATION-PLAN.md` §Rollback plan. **Append a JWT rotation runbook (M4):** how to rotate `SUPABASE_JWT_SECRET` (Supabase dashboard → Settings → API → JWT Settings → Roll), expected fallout (all sessions invalidated → users must re-login), Vercel env update + redeploy, document chosen access-token lifetime (Supabase default 1h) + refresh-token lifetime (1 week). Same runbook covers `PADDLE_NOTIFICATION_SECRET` rotation and `OPENROUTER_API_KEY` rotation.
>
> 7b. **Supply-chain audit CI step (M5).** Add a required GitHub Actions step in `.github/workflows/ci.yml` on every PR:
> ```yaml
> - name: pnpm audit
>   run: pnpm audit --prod --audit-level=high
> ```
> A high or critical advisory fails the PR. Document quarterly cadence to also run `pnpm audit --audit-level=moderate` and triage. No `.audit-suppressions` file without an entry in `docs/07-history/DECISIONS.md`.
>
> 8. **Status / monitoring page:** simple `/status` route in `apps/web` showing: API health, Supabase connection, Inngest health, OpenRouter ping. Used by Adam during cutover.
>
> Do NOT touch app code beyond Sentry wiring + `/status` route + the migration files. This is a deploy + observability worker.

---

## Worker 4 — `frontend-developer` (Sonnet)
**Worktree:** `.worktrees/w2-polish`
**Branch:** `feat/w2-polish`
**Owner of:** empty-state audit + mobile QA + animation polish + keyboard audit

**Brief:**

> Read `04-EMPTY-STATES.md`, `13-DESIGN-SYSTEM-SPEC.md`, `08-UX-ARCHITECTURE.md` §11.
>
> Deliverables:
>
> 1. **Empty-state audit:** every page renders the empty state defined in `04-EMPTY-STATES.md`. Playwright screenshot test captures one image per state (50+ images) — checked into the repo as the canonical visual reference. Catch any state Wave 1 missed.
>
> 2. **Mobile QA pass:** all 7 pages tested at 375px / 414px / 768px breakpoints. Bug log with screenshots. Fix every issue.
>
> 3. **Animation spring tuning:** Framer Motion `useSpring` configs reviewed across the codebase. Pass through and tune any spring that feels off (too bouncy / too damped). Document the canonical preset library in `apps/web/src/lib/motion.ts` if Wave 1 didn't.
>
> 4. **Keyboard shortcut audit:**
>    - ⌘K command palette works on all routes
>    - J/K nav works in Inbox
>    - A / R / E shortcuts work in Inbox
>    - Focus management on modals (paywall, add competitor, top-up) traps focus correctly
>    - Esc closes modals
>
> 5. **Pipeline progress indicator (T5):** `<PipelineProgress stages={5} current={stage}>` rendered on Inbox card while job in flight. Stages: PLAN / RESEARCH / DO / QA / SUMMARIZE.
>
> 6. **Error boundaries + loading skeletons (reassigned from Worker 2 Stream C — P1-13):**
>    - Wrap every `(protected)/` page in a React error boundary component (`apps/web/src/components/error-boundary.tsx`) that renders a graceful fallback per `04-EMPTY-STATES.md` patterns.
>    - Audit: every async surface has a skeleton variant per `13-DESIGN-SYSTEM-SPEC.md`. Add any missing skeletons.
>
> Stay UI-only. No backend or schema changes.

---

## Merge Order

1. Worker 3 (devops) merges FIRST — production env ready
2. Workers 1, 2, 4 merge in parallel after that
3. After all merged: QA Lead runs a final 1-hour soak test on production. If clean → cutover.

---

## Go / No-Go Criteria (CEO + Adam verify)

Ship when ALL are true:

- [ ] Free scan → result → signup → dashboard works end-to-end on **production**
- [ ] 9 of 11 agents pass golden-case eval (4/5 outputs publish-ready)
- [ ] Paddle production checkout → webhook → credits → agent run → Inbox item works
- [ ] Kill switch stops all schedules within 15 minutes
- [ ] Resend production delivers welcome + scan-complete + budget-75% emails
- [ ] Daily cap enforcement blocks runs after cap hit
- [ ] Off-site verification loop queues and resolves on production
- [ ] Cross-agent page_locks prevent concurrent edits
- [ ] In-app notification bell shows unread count and clears on read
- [ ] Upgrade flow Discover → Build works
- [ ] Production migration applied without data loss
- [ ] No P0 Sentry errors in 1-hour production soak test
- [ ] Hebrew RTL passes visual review on 5 core screens
- [ ] Mobile QA passes on all 7 pages at 3 breakpoints
- [ ] All 5 Playwright golden flows pass 3 consecutive runs

Write session file:
`docs/08-agents_work/sessions/<YYYY-MM-DD>-ceo-wave-2-launch.md`

Signal Adam: "Wave 2 complete — Beamix is ready to launch. Recommended next step: cutover at [time]."

---

## Post-Launch (Out of Wave 2 Scope)

Tracked but NOT in Wave 2:
- 7-day post-launch: monitor refund rate (board decision — tighten policy only if >5%)
- Month 2: MVP-2 Video SEO Agent
- **Month 2: Israeli payment rails (ADQ-4 resolved 2026-05-14).** Add Hora'at Keva (direct debit), Bit, PayBox to the Paddle integration so Israeli SMBs aren't forced to pay by card. Launch with cards only; add Israeli rails as a fast-follow after the first ~5 paying IL customers. Trigger to prioritize: PostHog cohort "IL signups: `paywall_viewed` → `checkout_completed`" conversion ratio drops below 30%, OR Adam receives 3+ explicit "I can't use a credit card for this" support tickets. Implementation lives in a future Wave 3 brief; Backend Worker 2 (`paddle-client.ts` + webhook handler) extends with rail-specific flows.
- Month 3+: WordPress integration (Build tier), GA4 + GSC integrations, Slack alerts

Note: **annual pricing ships day-1** per board April-17 (not deferred). Was previously listed here as "Month 2: introduce annual pricing (B2)" — that item is removed; pre-build audit B2 is superseded by the April-17 board minute.
