# Audit Lens — Missing Perspectives

**Auditor scope:** Identify scope, capability, and discipline gaps that NO existing planning artifact addresses. Not contradictions, not bugs — **absences**.
**Source files scanned:** 15 source-of-truth files in `docs/product-rethink-2026-04-09/` + 11 build-prep files (`00-INDEX.md` through `11-START-HERE.md`) + `CLAUDE.md` + project memory.
**Date:** 2026-05-13.

The plan is strong on product, agent, schema, UX, and wave execution. It is thin-to-silent on the operational, legal, observability, and customer-loop layers that a real launch requires. The absences below are the ones a real founding team would be embarrassed to discover on Day 2.

---

## Critical absences (must add before launch)

### C1. Product analytics — tool, schema, identity model
**Status:** Board decision **B4** (`10-PRE-BUILD-AUDIT.md` line 98) mandates "instrument limit-hit events from day 1" and the same file mentions "instrument all top-up purchases from day 1." That is the only analytics-related instruction in the whole plan. There is **no spec** for:
- Which tool (PostHog? Segment? Supabase events table? Mixpanel?)
- Event taxonomy (names, properties, when they fire)
- User identity model (anon → identified linkage across `free_scans.fingerprint` → `user_profiles.id`)
- Funnel definitions (scan → signup → paywall → checkout → first-agent-run → first-published)
- Cohort / retention reporting surface (where does Adam look at "Week-1 retention by tier"?)

Wave 1/2 briefs do not mention an analytics worker. The result is a launch where Adam cannot answer "which step do users drop off at?" or "how many limit-hits triggered upgrade?" — defeating the entire purpose of B4.

**Recommendation:** Add a build-prep doc `17-ANALYTICS-SPEC.md` defining: PostHog (cheap, EU-region compliant, generous free tier, owns identity stitching). Lock event names: `scan_started`, `scan_completed`, `scan_revealed`, `signup_completed`, `paywall_viewed`, `checkout_started`, `checkout_completed`, `agent_run_started`, `agent_run_completed`, `agent_run_failed`, `inbox_item_approved`, `inbox_item_published`, `limit_hit` (with `limit_type` property), `topup_purchased`, `kill_switch_engaged`, `refund_requested`. Owner: Wave 1 Backend Worker 3 (already owns notifications — natural fit). Identify on Supabase auth events.

**Ship without it?** No. Adam will be blind to conversion and retention on Day 1.

---

### C2. Legal — Terms of Service, Privacy Policy, Cookie Policy, DPA
**Status:** Zero planning artifact addresses publishing T&Cs, Privacy Policy, or Cookie Policy. The only "legal" mentions are about YMYL content classification (medical/financial agent guardrails) and EU AI Act Article 50 (`10-PRE-BUILD-AUDIT.md` line 145) — which correctly notes the disclosure obligation falls on the user, not Beamix.

Missing:
- Who writes T&Cs (Adam? Legal-advisor agent? Termly / iubenda template?)
- Privacy Policy (GDPR-grade; EU-resident users will hit Beamix from day 1 — Israel is not GDPR but the EU market expansion is in B3)
- Cookie consent banner — Beamix serves EU traffic, mandatory
- Data Processing Addendum for B2B Build/Scale customers
- Where they live — Framer site footer? Product `/legal/*` routes? Both?

Paddle's merchant-of-record model helps with tax compliance but does NOT cover Beamix's own T&Cs or privacy obligations.

**Recommendation:** Wave 2 adds Worker 5 (or stretch goal for `technical-writer`): T&Cs + Privacy + Cookie Policy drafted via the `legal-advisor` skill, reviewed by Adam, published to `/legal/terms`, `/legal/privacy`, `/legal/cookies` in the Next.js app AND linked from Framer site footer. Add cookie consent banner (use a vetted library like `react-cookie-consent` or Vanilla Cookie Consent). Plan-prep checklist item: "Get an actual lawyer to review T&Cs before invoicing customer #1."

**Ship without it?** No. EU traffic without a cookie banner is a GDPR violation on day 1. T&Cs without a refund clause invites disputes.

---

### C3. Customer support path — failure routing
**Status:** `06-PRICING-V2.md` line 34 lists support SLAs by tier (Email 48h / Priority 24h / Dedicated + onboarding call) but there is **no spec** for:
- Support email address (`support@beamixai.com`? `adam@`?)
- Where bugs/agent failures route (in-app feedback widget mentioned in `15-EXPERT-AUDIT.md:112` and `09-HANDOFF-PROMPT.md:84` but never re-specced)
- Hebrew-language inbound triage
- Inbox failure card from `04-EMPTY-STATES.md` mentions a retry button — but does NOT route to a human when retry fails
- `03-DAY-1-FLOW.md` mentions "show support link" after 60s webhook delay — but the link target is undefined

**Recommendation:** Decide tool now — recommend Plain (cheap, Linear-grade UX, native Slack thread per ticket) or Crisp (free tier, in-app widget, multi-language). Email alias `support@beamixai.com` with auto-acknowledge. Every error boundary, every Inbox failure card, every onboarding-stuck state surfaces a single "Contact support" CTA that opens the widget or copies the email. Wave 2 Worker 4 owns wiring this into existing surfaces.

**Ship without it?** No. Refund disputes + Hebrew bug reports + payment failures need a channel on Day 1. Without one, refunds go to chargebacks (which kill Paddle merchant standing).

---

### C4. Admin / internal dashboard
**Status:** **Completely absent.** Zero mentions of an admin surface in any of the 26 planning files. Adam needs to see (from the dashboards Stripe/Linear founders maintain):
- Daily MRR / churn / refund count
- Top 20 users by spend / agent runs / errors
- Agent failure rate by agent type (which agent is rotting?)
- Inngest job queue depth
- LLM cost burn-rate vs. revenue
- Recent signups + their tier
- Suspicious refund patterns (same email, multiple refunds)
- Manual override: force-pause a user, force-credit a user, force-refund

`10-WAVE-2-BRIEF.md` Worker 3 adds `/status` health route but that's infrastructure-facing, not business-facing.

**Recommendation:** Build-prep doc `13-ADMIN-DASHBOARD-SPEC.md`. MVP-scope: a single `/admin` route protected by hardcoded allowlist of Adam's email, served via Server Components reading Supabase directly (no API surface). Sections: Revenue (sums from Paddle webhooks), Users (latest 50 + spend), Agent health (success/failure rate from `agent_jobs` last 7d), Cost (sum from `llm_cost_events` Worker 3 wave 2 adds), Refunds. No CRUD — read-only for MVP. Owner: Wave 2 stretch worker (or punt to Week-1 post-launch IF Adam confirms he'll use Supabase Studio + a few saved SQL queries for the first 14 days).

**Ship without it?** **Marginally yes if** Adam commits to using Supabase Studio + Paddle dashboard manually for 14 days. After that, ad-hoc SQL becomes a liability. Strong recommendation: ship a 50-line server-rendered `/admin` page in Wave 2.

---

### C5. GDPR data deletion & account closure
**Status:** Absent. No spec for:
- User-initiated account deletion (settings → delete account)
- Right-to-be-forgotten request workflow
- Soft-delete vs. hard-delete policy
- Audit trail of deletion requests
- Data retention windows (how long after cancellation do we keep `agent_jobs`? `scans`? `archive_items`?)
- Export-my-data endpoint (GDPR Article 20)

DB-migration plan doesn't mention `deleted_at` columns or cascade rules. RLS pattern doesn't address "this user requested deletion; show nothing."

**Recommendation:** Add `delete_account` RPC + a Settings → Privacy panel with "Delete my account" button. Soft-delete users (set `deleted_at`), retain billing records 7 years (tax law), hard-delete agent outputs/scans after 90 days, log every deletion in `data_deletion_log` table. Email confirmation flow (24h grace period to undo). Owner: Wave 2 backend stretch — or Week-2 post-launch if no EU paid signups exist yet (acceptable trade-off).

**Ship without it?** Marginal — required if EU customers sign up. Israeli-only audience can defer 30 days. EU expansion (B3) means this MUST exist before paid expansion marketing begins.

---

## Important absences (should add during Wave 2)

### I1. Email deliverability hardening
**Status:** `06-ADAM-CHECKLIST.md` lists SPF/DKIM/DMARC setup. Missing:
- Warmup period for `notify.beamixai.com` (cold domains get junked — Resend recommends 2-week ramp)
- Bounce/complaint webhook handling (Resend supports it but no Wave 1 spec)
- Suppression list management (auto-add hard bounces; respect unsubscribes per CAN-SPAM)
- Postmaster monitoring (Google Postmaster Tools, Microsoft SNDS) — Adam should register `beamixai.com`
- DMARC reporting inbox (`rua` is set to Adam's Gmail — fine, but no monitoring cadence)

**Recommendation:** Add to Wave 2 Worker 3 (devops-lead) brief: wire Resend `email.bounced` and `email.complained` webhooks to mark `user_profiles.email_status = 'bounced'|'complained'`, skip future sends. Warmup plan: start with daily-digest only; add transactional emails after 7 days of clean delivery.

### I2. LLM cost anomaly detection / per-user cost cap
**Status:** Wave 2 Worker 3 adds `llm_cost_events` table + daily aggregation email. Missing:
- Hourly anomaly detection (single user burns $50 in 1h → alarm)
- Per-user hard cap (Discover user theoretically capped by `daily_cap` but a bug or jailbreak could chain runs; runaway costs are the #1 SaaS-on-LLM failure mode)
- Global daily kill-switch trigger (if total LLM spend > $X in 24h, auto-engage kill switch)

**Recommendation:** Wave 2 Worker 3 stretch: Inngest cron every hour computes per-user 24h spend from `llm_cost_events`; if any user > $20 OR global > $200 in 24h, insert a P0 Sentry alert AND auto-pause that user's schedules. One-line policy in `12-AGENT-BUILD-SPEC.md` would close this.

### I3. Agent quality regression / continuous eval
**Status:** Wave 2 Worker 2 ships 55 golden test cases as launch gate. Missing: **what runs them after launch.** Once an LLM provider silently swaps the model behind a name, prompts rot, or new training data shifts behavior, the only signal is customer complaints.

**Recommendation:** Wave 2 stretch — `apps/web/scripts/run-agent-evals.ts` (already specced) wired to a weekly Inngest cron. Diff results vs. baseline. Email Adam any regressions. Cost: 55 runs × ~$0.05 = ~$3/week. Cheap insurance.

### I4. Refund fraud / dispute pattern detector
**Status:** `06-PRICING-V2.md` line 189 says "Monitor: if refund rate exceeds 3%/mo, trigger exit survey." Board decision says 5% threshold for tightening policy. There is no mechanism that **detects** the rate or surfaces individual abuse patterns.

Missing:
- Per-card / per-IP / per-email refund rate (one card refunding 3× = abuse)
- Same-fingerprint signups on already-refunded emails (free-scan + signup + refund + repeat)
- Paddle dispute webhook handling (`high_risk_transaction_*` events)
- Refund-rate dashboard

**Recommendation:** Wave 2 stretch in admin dashboard (C4): refund table with email/card-hash/fingerprint dedup. Paddle's `transaction.payment_failed` and `subscription_refunded` webhooks already trigger via Wave 1 Backend Worker 2 — extend payload capture with the buyer fingerprint.

### I5. Funnel analytics — onboarding drop-off
**Status:** Connected to C1, but distinct concern. Even if PostHog is wired, no spec defines the **funnel steps** Adam looks at. Standard SaaS launch question — "after 100 signups, where do users drop?" — is unanswerable from the existing artifacts.

**Recommendation:** PostHog funnel definition (5 steps): scan submitted → result revealed → signup completed → paywall viewed → checkout completed. Second funnel: checkout completed → first agent approved → first item published. Define in `17-ANALYTICS-SPEC.md`.

### I6. Backup / disaster recovery
**Status:** Wave 2 Worker 3 documents a `production-rollback.md` runbook for app rollback. **Supabase backup posture is unspecced.** Supabase Pro tier ships daily PITR up to 7 days; Free tier does NOT. The `06-ADAM-CHECKLIST.md` does not specify which plan to use for `beamix-v2-prod`.

Missing:
- RTO/RPO targets ("we can lose 24h of data, restore in 4h" — or stricter)
- Backup test cadence (have we ever restored from a backup?)
- Supabase Pro purchase decision (≈$25/mo for daily backups + PITR — non-negotiable IMO)

**Recommendation:** Add to `06-ADAM-CHECKLIST.md` as [BLOCKING for Wave 2]: upgrade `beamix-v2-prod` to Supabase Pro plan, document RPO=24h / RTO=4h, run a restore drill once before launch. Cost: $25/mo. Below the noise floor for a paid product.

### I7. Local SEO / scan localization (Hebrew queries for IL businesses)
**Status:** `05-BOARD-DECISIONS-2026-04-15.md` line 293 promises a 50-query × 4-engine Hebrew benchmark study runs in parallel with the build sprint. That covers research — but not the **product mechanism**:
- Does `scans.query_set` adapt to `business.country/language`?
- Are template queries localized (e.g., "best wedding photographer Tel Aviv" vs. "best wedding photographer NYC")?
- Does Query Mapper consider geography in clustering?

`14-SCAN-UX-SPEC.md` is silent on location-aware scanning.

**Recommendation:** Wave 1 Backend Worker 2 brief should explicitly include: "Template queries are localized — pick from `apps/web/src/lib/scan/templates/{en,he}/<industry>.ts` based on `business.language`. Include city name from `business.city` when present." One-line addition closes the gap.

### I8. Incident response & status page
**Status:** Wave 2 adds an internal `/status` route (health check) and a brief mention of "Status page or update channel for cutover communication (can be email-only — keep simple)" in `06-ADAM-CHECKLIST.md` line 104. No external status page is specced.

**Recommendation:** Use a free Instatus / BetterUptime / Statuspage account on a subdomain (`status.beamixai.com`). Mirror Supabase + OpenRouter + Vercel + Inngest status. Sentry P0 → manual update by Adam to status page. Day-1 simple version: a static Markdown page at `app.beamixai.com/status-public` showing the last 7 days of incidents (none initially) + dependency status. Wave 2 Worker 3 stretch.

---

## Defer-acceptable absences (note but post-MVP)

### D1. A/B testing / experimentation framework
**Status:** Absent. Acceptable — with <100 users, statistical power for A/B tests is near zero. Manual ship-and-watch is correct for MVP.
**Reconsider:** When DAU > 200 or paying customers > 50. PostHog (if adopted per C1) ships experiments out of the box.

### D2. Non-EN/non-HE locale fallback
**Status:** `next-intl` planned, locale flag in `business.language`. No spec for an Arabic / French / German user. The Framer marketing site is presumably EN — they'll land in EN unless they explicitly pick HE.
**Acceptable:** Beamix's market is IL + EN-speaking world. Fallback to EN for everything that isn't HE. Document explicitly in `17-ANALYTICS-SPEC.md` or a brief addendum. Add `lang="en"` fallback in `<html>`.
**Reconsider:** When a German user actually signs up and complains.

### D3. Brand voice document beyond `_patterns.md`
**Status:** Project memory mentions "Voice canon Model B" and references in `08-UX-ARCHITECTURE.md`, but there's no single brand voice + copy guidelines doc product workers can consult.
**Acceptable for MVP:** Memory entry + scattered references are enough. Wave 2 Worker 1 (Hebrew translation) effectively creates one as a byproduct.
**Reconsider:** When marketing scales and external writers / agents contribute copy.

### D4. Account-tier upgrade reminders / dunning
**Status:** Wave 1 Backend Worker 3 ships budget-75% and budget-100% alerts. Paddle handles `transaction.payment_failed` via Wave 1 Worker 2 webhook. But there's no spec for **dunning sequence** — when a card fails, what's the retry cadence + grace period + downgrade rule?

Paddle handles retries automatically (3 attempts over 7 days by default), but the in-app messaging is unspecced. Card-failed customer sees what? When does their access actually downgrade?

**Acceptable for MVP:** Paddle's defaults are sane. Add a one-line note in `06-ADAM-CHECKLIST.md`: "Confirm Paddle dunning retry config; default 3 retries over 7d is fine for MVP."
**Reconsider:** First time a paying customer with a failed card calls/emails confused about access.

### D5. Hebrew customer interview script
**Status:** P0-7 is "zero customer validation" — deferred per `01-P0-RESOLUTIONS.md`. Adam-checklist asks for "5 problem interviews — 3 Israeli SMB / 2 English-speaking" but no script is provided.
**Acceptable:** Adam knows the product. He can write the script himself, or use the `customer-support` / `research-engineer` skills.
**Reconsider:** If interviews don't happen, retroactively important.

### D6. Internal team comms channel
**Status:** Beamix is a one-human + agent-army team. Slack/Discord is moot.
**Acceptable:** Nothing to spec.

---

## What's covered well (sanity check)

The plan does NOT miss these — calling them out so the audit doesn't accidentally re-flag them:

- **Pricing math** — `06-PRICING-V2.md` is locked, refund policy explicit (14-day money-back), Paddle setup checklisted.
- **YMYL / content quality safety** — refuse-with-reason for clinical/legal/investment, QA stage with Sonar citation verification, no AI-disclosure language policy.
- **Credit system + daily caps** — `12-AGENT-BUILD-SPEC.md` + Worker 2 wave 0 cover hold/confirm/release + per-day cap enforcement.
- **Kill switch** — Global + per-agent pauses, banner UI, Wave 1 Backend Worker 1 owns.
- **DB migration discipline** — Staging gate, advisor resolution, RLS pattern, fresh schema strategy all locked.
- **Wave-level QA gating** — Full-tier QA on every wave; Adam reviews + merges; CEO can't override.
- **Worktree hygiene** — Documented in `11-START-HERE.md` and `CLAUDE.md`.
- **EU AI Act Article 50** — Correctly identified, correctly delegated to publisher (user, not Beamix).
- **Hebrew + RTL** — Wave 2 Worker 1 owns; Heebo font; `next-intl`; agent prompts have HE variants.
- **Inngest concurrency keys** — `concurrencyKey: businessId` per agent pipeline; T3 mitigation explicit.

These are correctly specced. Don't re-open them.

---

## Suggested follow-up artifacts (in priority order)

1. `17-ANALYTICS-SPEC.md` — PostHog tool choice + 16 events + 2 funnels + identity model. **Pre-Wave-1.**
2. `18-LEGAL-PUBLISHING-PLAN.md` — T&Cs, Privacy, Cookie, where they live, who drafts. **Pre-Wave-2.**
3. `19-SUPPORT-CHANNEL-SPEC.md` — Plain (or Crisp) integration, support email, error-state CTAs. **Wave 2.**
4. `20-ADMIN-DASHBOARD-SPEC.md` — `/admin` route, allowlist, 5 sections. **Wave 2 stretch.**
5. `21-DATA-GOVERNANCE.md` — GDPR deletion flow, retention windows, export endpoint, backup/RTO/RPO. **Wave 2 stretch + Adam Supabase Pro upgrade.**
6. Amend `06-ADAM-CHECKLIST.md` — add Supabase Pro upgrade, Postmaster Tools registration, Paddle dunning config check.
7. Amend Wave 1 Backend Worker 2 brief — add localized query templates per `business.language` + `business.city`.

---

**Auditor note:** These absences are systemic — they reflect the bias of a fast-moving product team toward "build the feature" over "build the operational substrate." Beamix is well-specced on agent product mechanics and unusually thin on the boring-but-load-bearing scaffolding (legal, support, analytics, admin, deletion, backup). The plan can technically reach a "users can pay and use it" state without any of the Critical absences resolved — but the moment one paying EU user, one refund dispute, one bug report, or one weird LLM cost spike happens, Adam has no instrumentation to respond. Fix C1–C5 before launch; the rest can be wave 2 stretch or week-1 post-launch.
