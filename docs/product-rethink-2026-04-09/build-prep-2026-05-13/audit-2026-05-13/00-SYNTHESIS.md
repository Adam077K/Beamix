# Audit Synthesis — 2026-05-13

Six-lens audit of the build-prep folder. Findings deduplicated, prioritized, and assigned to a fix swarm.

**Raw counts:** Contradictions 9P0 / 15P1 / 8P2 · Executability 10P0 / 14P1 / 11P2 · Security 5C / 8H / 8M / 6L · Adversarial ~80 (categorized by Day-1/Week-1/Month-1) · Product+UX+Business ~45 · Missing-Perspectives 5C / 8I / 6D.
**After dedup:** **24 P0** · **42 P1** · **31 P2** · **5 Adam-decision items**.

**Verdict:** Build-prep is internally clean on pricing, agent count, and worktree discipline — but has **three structural problem clusters** that block Wave 0 spawn:

1. **April-17/18 board minutes never propagated.** Multiple locked decisions were added to `05-BOARD-DECISIONS-2026-04-15.md` after the original write but build-prep didn't read the updates. LLM routing inverted, annual pricing flipped, 10 security items dropped, 6 product features missing.
2. **Security plane is fragmentary.** SSRF, prompt injection, webhook idempotency, RLS coverage, GDPR deletion — all underspecified. Easy to fix at spec stage; expensive to retrofit.
3. **Build executability has 10+ unresolvable handoffs.** Worker scope collisions on shared files, missing API implementers, Inngest event-registry chicken-and-egg, type drift between DB and TS.

**Verdict: Not ready to spawn Wave 0.** Estimated fix scope: 5 parallel fix agents, ~0.5–1 day of agent work. Then re-verify and spawn Wave 0.

---

## Top 10 Headline Findings (for Adam)

1. **April-17/18 board decisions silently dropped.** 12+ decisions added after April 15 board never made it into build-prep. Including: Anthropic-direct LLM routing (not OpenRouter), annual pricing day-1 (not deferred), 10 mandated security items, guided numbered steps on Home, "agent names internal only", Query Review Gate, 2–3 highest-impact agents auto-run on Day-1, Inngest Pro from launch, PDF Report Export, Content Optimizer teaser, leading-indicator panel, /api/health env validation.

2. **Activation happens AFTER the refund window closes.** First citation appears week 3–4. 14-day money-back window closes day 14. The refund decision is made BEFORE any activation evidence exists. Structural churn risk; the board April-17 decision named a "leading indicator panel" as the mitigation, but build-prep didn't carry it forward.

3. **Excluded-vertical funnel leak.** YMYL-excluded verticals (legal/medical/financial) have no industry gate at funnel level. A Tel Aviv lawyer can scan, pay $189 for Build, then hit YMYL hard-refuses on every content agent → guaranteed refund. The persona we use in product discussions is literally a refund event.

4. **Paddle webhook → user_id race + no idempotency.** No `passthrough` user_id in checkout, no idempotency key on `day1.onboarding`. Day-1 likely fails for ~5–10% of paying customers on Day 1; replays double-credit + double-fire.

5. **Inngest free tier breaks at customer #11.** Board explicitly mandated Pro from launch ($75/mo). `06-ADAM-CHECKLIST.md` still says start free. Direct contradiction. Day-1 chains stall when step quota exhausts.

6. **5 Critical security gaps unowned.** Webhook idempotency, Paddle signature verification underspecified, SSRF on free-scan/url-probe, prompt injection through `business.name`/`scanUrl`/`customInstructions`, RLS coverage non-prescriptive. All would be exploited within days of launch.

7. **10+ wave-brief executability bugs.** `daily-cap.ts` claimed by two workers across waves. `DashboardShell` claimed by three. Inbox/Competitors/agents-by-type API routes have schemas in Wave 0.5 but no Wave 1 implementer. Inngest event registry chicken-and-egg between BE-1 and BE-2. Wave 2 frontend-developer is asked to edit agent prompt files (wrong domain).

8. **Refund-bomb on 14-day money-back.** Build user can burn 90 runs in 13 days and refund. Annual plans amplify 10×. No run-aware refund logic, no top-up refund policy, no signup-abuse detection.

9. **Critical operational substrate absent.** No analytics tool/schema (defeats board B4 "instrument limit-hit events from day 1"). No T&Cs / Privacy Policy / Cookie consent (GDPR violation on day 1 for EU traffic). No customer-support routing (refund disputes → chargebacks → kills Paddle merchant standing). No admin dashboard. No GDPR deletion path.

10. **Type drift between DB enums and TS unions.** `notification_type` enum has `day1_ready` + `run_failed` not in TS union. `inbox_status` has `failed` not in TS. `suggestion_status` has `converted` not in TS. Day-1 + failure-card code won't typecheck against `@/lib/types/shared`.

---

## P0 — Must fix before Wave 0 spawns

### Cluster A — April-17/18 Board Decisions Reconciliation (12 items)

- **A1. LLM routing inverted.** Board mandated Anthropic-direct primary (~80% of calls) + OpenRouter for Gemini/GPT/Perplexity only. Build-prep treats Anthropic-direct as fallback. Touches: `12-AGENT-BUILD-SPEC.md` model router, `01-P0-RESOLUTIONS.md` T1, `06-ADAM-CHECKLIST.md`, `07-WAVE-0-BRIEF.md` Worker 2.
- **A2. Annual pricing — ship or defer?** Board April-17 said day-1. Build-prep `09-WAVE-1-BRIEF.md` FE-3 says "monthly-only (annual deferred per B2)". `06-ADAM-CHECKLIST.md` lists 7 Paddle products incl. annual. Internally inconsistent. **Default to: ship annual day-1 (board wins).** Touches: `09-WAVE-1-BRIEF.md`, `10-WAVE-2-BRIEF.md`, `11-START-HERE.md`, `00-INDEX.md`.
- **A3. Annual price math.** Build annual = $151 (table) vs $159 (April-17 minute). Adam must reconcile. **Default: $151 (table is more recent + 06-PRICING-V2.md authoritative).**
- **A4. 10 mandated security items.** Board April-18: SSRF validator, prompt-injection sanitization, Cloudflare Turnstile, credit locking, webhook verification, RLS tests, npm audit, rehype-sanitize, rate limiting, cost circuit breaker. Zero appear in worker briefs. Touches: `07-WAVE-0-BRIEF.md`, `09-WAVE-1-BRIEF.md`, `10-WAVE-2-BRIEF.md` (all four wave briefs need a "Security Requirements (all workers)" section).
- **A5. Guided numbered Home steps.** Board April-18: "Home suggestions as numbered sequential steps with progress bar. Not unordered suggestion cards." Wave 1 FE-1 still ships unordered cards. Touches: `09-WAVE-1-BRIEF.md` FE-1.
- **A6. Agent names internal only / "GEO" never shown.** Board: users see action labels, not agent names. Build-prep ships agent names in Inbox card titles, suggestion descriptions, Home copy. Touches: `08-WAVE-0.5-BRIEF.md` (add `USER_FACING_AGENT_LABELS` map), `09-WAVE-1-BRIEF.md` (replace agentDisplayName usage), `04-EMPTY-STATES.md`.
- **A7. Query Review Gate.** Board April-18: user reviews top-10 Query Mapper output before downstream agents fire. `03-DAY-1-FLOW.md` has zero user interaction between Query Mapper and scan. Touches: `03-DAY-1-FLOW.md` Steps B→C (add B.5 Query Review state).
- **A8. 2–3 highest-impact agents auto-run on Day-1.** Board: payment → 2–3 agents auto-run. Build-prep Step E only primes suggestions visually. Touches: `03-DAY-1-FLOW.md` Step E.
- **A9. Inngest Pro from launch.** Board: free tier breaks at 10–15 users. Build-prep checklist says start free. Touches: `06-ADAM-CHECKLIST.md`.
- **A10. PDF Report Export.** Board: emailable one-page PDF. Not in any wave brief. Touches: `09-WAVE-1-BRIEF.md` FE-3 (assign).
- **A11. Content Optimizer teaser.** Board: free preview shows first 3 sentences of homepage rewrite, rest blurred (zero cost). Not in Wave 1. Touches: `09-WAVE-1-BRIEF.md` FE-2 (scan UX).
- **A12. Leading-indicator panel.** Board April-17: Home shows "content published, actions completed, citations detected" early signals to bridge the activation gap. Build-prep doesn't carry this forward. THIS is the activation-vs-refund-window mitigation. Touches: `09-WAVE-1-BRIEF.md` FE-1 Home spec.

### Cluster B — Critical Security (5 items)

- **B1. Webhook idempotency contract.** `paddle_webhook_events` table exists in migration plan but isn't wired into the handler. `allocate_monthly_credits` not idempotent. Replayed webhook → double credit + double Day-1. Touches: `03-DAY-1-FLOW.md`, `05-DB-MIGRATION-PLAN.md` (RPC signature), `09-WAVE-1-BRIEF.md` BE-2.
- **B2. Paddle signature verification.** `PADDLE_WEBHOOK_SECRET` flagged "optional". Paddle Billing v2 mandates HMAC-SHA256 on raw body. Touches: `06-ADAM-CHECKLIST.md`, `09-WAVE-1-BRIEF.md` BE-2.
- **B3. SSRF on free-scan + url-probe + competitor-add.** All three accept user URLs. No allowlist, no private-IP block, no redirect cap. AWS metadata exposure on unauthenticated public endpoint. Touches: new file `apps/web/src/lib/security/url-guard.ts` (specced in `07-WAVE-0-BRIEF.md`), `09-WAVE-1-BRIEF.md` BE-1 (url-probe), BE-2 (scan), FE-3 (competitor add).
- **B4. Prompt injection through `business.name`, `scanUrl`, `customInstructions`.** Untrusted strings concatenated into system prompts. Day-1 + free-scan unauthenticated. Touches: `07-WAVE-0-BRIEF.md` Worker 2 (input-guard layer), `08-WAVE-0.5-BRIEF.md` (Zod max + regex on inputs), `12-AGENT-BUILD-SPEC.md` §System Prompt Rules.
- **B5. RLS coverage non-prescriptive.** Plan shows 1 example policy and says "every user-data table gets one." Easy to miss `paddle_webhook_events`, `audit_log`, `url_probes`, `automation_kill_switch`, `topic_ledger`, etc. Touches: `05-DB-MIGRATION-PLAN.md` (enumerate every table + RLS pattern + smoke test that asserts `rowsecurity = true` on all).

### Cluster C — Build Executability (7 items)

- **C1. Wave 0 Worker 2 spawn order ambiguous.** Worker 2 "blocked by Worker 1" but merge-order section doesn't say whether Worker 2 spawns in parallel and pauses, or spawns only after Worker 1 merges. Touches: `07-WAVE-0-BRIEF.md` (state: Worker 2 spawns after Worker 1's `database.types.ts` is committed on `feat/db-foundation`; bases its worktree off that branch).
- **C2. Wave 0 Worker 2 must define 19 cross-layer interfaces.** Brief says "implement types from `12-AGENT-BUILD-SPEC.md`" without enumerating. Several interfaces re-exported by Wave 0.5 are domain-wide (`InboxItem`, `Suggestion`, `NotificationItem`) not agent-system-internal. Touches: `07-WAVE-0-BRIEF.md` Worker 2 (enumerate 19 interfaces).
- **C3. `daily-cap.ts` dual ownership.** Wave 0 Worker 2 owns it, told "do NOT touch frontend or DB." Wave 1 BE-3 told to "wire it into agent_pipeline middleware." Merge collision guaranteed. **Fix: Wave 0 Worker 2 ships the daily-cap hook + middleware integration; Wave 1 BE-3 only triggers it from API routes.** Touches: `07-WAVE-0-BRIEF.md` Worker 2, `09-WAVE-1-BRIEF.md` BE-3.
- **C4. Missing API implementers.** Wave 0.5 declares schemas for `/api/inbox/*` (5 routes), `/api/competitors/*` (3 routes), `/api/agents/[type]` — no Wave 1 backend worker is assigned. Frontend hits 404. Touches: `09-WAVE-1-BRIEF.md` (assign Inbox to BE-1, Competitors to BE-2, agents/[type] to BE-1).
- **C5. Inngest event registry chicken-and-egg.** BE-2 fires `day1.onboarding` event whose type lives in `inngest/client.ts` (BE-1). Merge order says BE-2 first. Touches: `09-WAVE-1-BRIEF.md` (BE-1 first deliverable is event registry; OR move event types to Wave 0.5 shared types).
- **C6. `DashboardShell` triple-owned.** Wave 0 Worker 3 builds it; Wave 1 FE-1 adds notification bell; Wave 1 FE-3 adds preview banner + kill-switch banner. Triple merge conflict. Touches: `07-WAVE-0-BRIEF.md` Worker 3 (build with empty slots), `09-WAVE-1-BRIEF.md` (FE-1/FE-3 inject child components into slot props).
- **C7. Wave 2 Worker 1 (frontend-dev) editing agent prompts.** Per AGENTS.md, prompts are ai-engineer domain. Brief asks frontend to rename `PLAN_PROMPT` → `PROMPT_EN`/`PROMPT_HE` which breaks every pipeline caller. Touches: `10-WAVE-2-BRIEF.md` Worker 1 (reassign Hebrew prompt work to ai-engineer; frontend keeps `next-intl` string extraction only).

---

## P1 — Must fix before Wave 1 spawns

### Cluster D — Day-1 Flow & Operational Bugs (10 items)

- **D1. Paddle `passthrough` user_id.** Checkout creates Paddle customer before webhook stamps `paddle_customer_id` on `user_profiles`. Touches: `03-DAY-1-FLOW.md` Step 1, `09-WAVE-1-BRIEF.md` BE-2 (BillingClient creates checkout with `customData: { supabase_user_id }`).
- **D2. 90s Day-1 promise is a lie on Build/Scale.** P50 will be 2–3 min on 7 engines. Empty-state copy hardcodes "about 90 seconds". Touches: `04-EMPTY-STATES.md` §Home Day-1 (remove timing number, show progress percentage only).
- **D3. Polling saturates Supabase.** Inbox + Day-1 + credits + notifications polling at 2–5s. Saturates pool at ~100 users. Touches: `01-P0-RESOLUTIONS.md` T2 + `09-WAVE-1-BRIEF.md` FE-1 (lift polling interval to 10s + add server-side debounce + plan Realtime flip after 50 concurrent users, not 100).
- **D4. Step E `ready_to_run`/`delayed_60s` semantics.** Client-side timer breaks on refresh. Need `suggestions.visible_at` column. Touches: `03-DAY-1-FLOW.md` Step E, `05-DB-MIGRATION-PLAN.md` (add column).
- **D5. Day-1 chain bypassed by preview→paid path.** Day-1 fires only on first Paddle payment. A preview user who upgrades from the dashboard misses the entire cure. Touches: `03-DAY-1-FLOW.md` §Existing-subscriber day-1 (add: preview→paid IS first-payment, fire chain).
- **D6. Credit hold TTL.** Hold→pipeline-crash leaves stuck hold forever. Touches: `12-AGENT-BUILD-SPEC.md` §Credit System (add TTL via cron sweep at N=30 min).
- **D7. Credit hold TOCTOU.** Double-click or two tabs both pass `checkDailyCap`, both hold. Touches: `05-DB-MIGRATION-PLAN.md` (RPC: `hold_credits` does `SELECT ... FOR UPDATE` on `credit_pools` AND `daily_cap_usage` atomically), `12-AGENT-BUILD-SPEC.md`.
- **D8. Kill switch race during cron dispatch.** Inngest cron fires; user toggles kill switch 1s later; agents still run. Touches: `09-WAVE-1-BRIEF.md` BE-1 (pipeline runner re-checks kill-switch at PLAN step + before DO step).
- **D9. Inbox approve idempotency.** Two-tab approval creates duplicate archive rows. Touches: `09-WAVE-1-BRIEF.md` BE-1 (POST `/api/inbox/[id]/approve` is idempotent: if already approved, return 200 noop).
- **D10. Cost circuit breaker.** Board listed it. Nowhere in build-prep. Touches: `09-WAVE-1-BRIEF.md` BE-3 (Inngest hourly cron computes per-user 24h spend; if any user > $20 OR global > $200, auto-engage kill switch + Sentry P0 alert), `12-AGENT-BUILD-SPEC.md` §Cost.

### Cluster E — High Security (8 items)

- **E1. customInstructions length/content bounds.** Add `z.string().max(2000)` to Zod schema; `business.name` `.max(500).regex(/^[\p{L}\p{N}\s,.\-&'"()]+$/u)`. Touches: `08-WAVE-0.5-BRIEF.md` api.ts.
- **E2. `automation_kill_switch` design.** Currently "singleton or per-user" — unresolved. **Fix: per-user-per-tenant on `user_profiles.kill_switch_until timestamptz`; global pause on separate `system_kill_switch` service-role-only table.** Touches: `05-DB-MIGRATION-PLAN.md`.
- **E3. Service-role key import boundary.** `SUPABASE_SERVICE_ROLE_KEY` must only be imported in server-only files. Touches: `07-WAVE-0-BRIEF.md` Worker 3 (add ESLint rule + `import 'server-only'` requirement on `apps/web/src/lib/db/admin.ts`).
- **E4. EU AI Act Article 50 disclosure UI.** Board lists Settings tooltip — not in Wave 1 FE-3 brief. Touches: `09-WAVE-1-BRIEF.md` FE-3 Settings, `05-DB-MIGRATION-PLAN.md` (add `disclosure_acknowledged_at` to user_profiles).
- **E5. GDPR delete + export.** Touches: `09-WAVE-1-BRIEF.md` BE-2 (`POST /api/account/delete` + Inngest `account-purge`), FE-3 (Settings → Privacy panel).
- **E6. PII risk in Sentry / cost logs.** Sentry captures request bodies by default. `customInstructions` + `targetContent` contain user data. Touches: `10-WAVE-2-BRIEF.md` devops-lead (Sentry `beforeSend` scrub + `sendDefaultPii: false` + denylist).
- **E7. `url_probes` cross-tenant leakage.** PK must be `(business_id, url, queued_at)` with RLS by `business_id`. Touches: `05-DB-MIGRATION-PLAN.md`.
- **E8. Cloudflare Turnstile on /scan.** Free scan is unauthenticated + triggers paid LLM calls. Touches: `09-WAVE-1-BRIEF.md` FE-2 (Turnstile widget) + BE-2 (server-side verify).

### Cluster F — Type / Schema Drift (8 items)

- **F1. Add `failed` to `InboxItem.status` TS union.** Touches: `12-AGENT-BUILD-SPEC.md`.
- **F2. Add `converted` to `Suggestion.status` TS union.** Touches: `12-AGENT-BUILD-SPEC.md`.
- **F3. Add `day1_ready` + `run_failed` to `NotificationItem.type` TS union.** Touches: `12-AGENT-BUILD-SPEC.md`.
- **F4. Define `QueryIntelligenceData` interface.** Referenced in `AgentPipelineContext` but never defined. Touches: `12-AGENT-BUILD-SPEC.md`.
- **F5. `CompetitorData` defined twice.** Wave 0.5 wins (newest, fullest shape). Touches: `02-AUTOMATION-RULES.md` (cross-ref), `12-AGENT-BUILD-SPEC.md` (cross-ref).
- **F6. `ArchiveItem.verificationStatus` narrowing inconsistency.** 3 values vs InboxItem's 4. Align to 4. Touches: `08-WAVE-0.5-BRIEF.md`.
- **F7. Spec `agent_jobs` DB column shape.** Currently undefined. Touches: `12-AGENT-BUILD-SPEC.md` (add §Database Mapping).
- **F8. `topic_ledger`+`page_locks` cleanup.** Tables grow forever. Touches: `05-DB-MIGRATION-PLAN.md` (add retention rules: page_locks auto-expire 2h; topic_ledger retention 365 days).

### Cluster G — Wave Brief Executability P1 (10 items)

- **G1. Wave 0 Worker 3 placeholder pages must not import `@/lib/types/*`.** Touches: `07-WAVE-0-BRIEF.md` Worker 3.
- **G2. Wave 0 Worker 3 package.json missing data-fetching lib.** Add `@tanstack/react-query`. Touches: `07-WAVE-0-BRIEF.md` Worker 3.
- **G3. Test directory paths not specified.** Workers will guess. Touches: all four wave briefs (`apps/web/src/__tests__/`, `apps/web/tests/e2e/`).
- **G4. Inngest event names not centralized.** Touches: `08-WAVE-0.5-BRIEF.md` (add `EventName` union to shared types).
- **G5. QA verdict format unspecified.** Touches: all four wave briefs (add: QA Lead returns `{verdict: 'PASS'|'BLOCK', findings: []}` to `docs/08-agents_work/qa-verdicts/<branch>.md`).
- **G6. `useInboxPolling()` file path unspecified.** Touches: `09-WAVE-1-BRIEF.md` FE-1 (`apps/web/src/hooks/use-inbox-polling.ts`).
- **G7. `<PaywallGate>` prop contract.** Used by FE-1, owned by FE-3. Touches: `08-WAVE-0.5-BRIEF.md` (add `PaywallGateProps` to shared types).
- **G8. `_patterns.md` Wave 0 vs Wave 1 prep collision.** Touches: `09-WAVE-1-BRIEF.md` design-lead prep (clarify: extend the Wave 0 file, don't rewrite).
- **G9. Inngest concurrency keys mentioned but not enforced.** Touches: `09-WAVE-1-BRIEF.md` BE-1 (every agent function exports `concurrencyKey: businessId`).
- **G10. `llm_cost_events` migration ownership conflict.** Wave 0 Worker 1 owns all migrations; Wave 2 devops adds another. Touches: `05-DB-MIGRATION-PLAN.md` (add `llm_cost_events` to Wave 0's migration set; Wave 2 stops adding migrations).

### Cluster H — Missing Operational Substrate (6 items)

- **H1. `17-ANALYTICS-SPEC.md` — PostHog + 16 events + 2 funnels.** Board B4 mandates instrument-from-day-1. New file.
- **H2. `18-LEGAL-PUBLISHING-PLAN.md` — T&Cs / Privacy / Cookie / DPA.** GDPR violation without these. New file.
- **H3. `19-SUPPORT-CHANNEL-SPEC.md` — Plain or Crisp + support@beamixai.com + error-CTA routing.** Refund disputes → chargebacks → kills Paddle merchant standing. New file.
- **H4. `20-ADMIN-DASHBOARD-SPEC.md` — Adam-only `/admin` route with 5 read-only sections.** New file.
- **H5. `21-DATA-GOVERNANCE.md` — GDPR deletion, retention windows, Supabase Pro upgrade, backup/PITR.** Required for EU. New file.
- **H6. Amend `06-ADAM-CHECKLIST.md`.** Add: Supabase Pro upgrade ($25/mo), Postmaster Tools registration, Paddle dunning config check, PostHog project setup, support@beamixai.com alias, Anthropic API key as primary (not fallback), `PADDLE_NOTIFICATION_SECRET` (mandatory not optional).

### Cluster I — Product/UX Refinements (8 items)

- **I1. Excluded-vertical funnel gate.** Industry select on `/scan` form blocks legal/medical/financial pre-paywall. Touches: `09-WAVE-1-BRIEF.md` FE-2, `04-EMPTY-STATES.md` (excluded-industry result page + waitlist signup).
- **I2. Suggestions don't belong in Inbox.** Inbox is for content drafts (post-run). Suggestions are pre-run. Touches: `02-AUTOMATION-RULES.md` (ranker: top 3 on Home, remainder on Home in "More" tray; do NOT mix into Inbox).
- **I3. Failure card copy.** "Refunded" implies money moved. Use "Run didn't complete. You weren't charged." Touches: `04-EMPTY-STATES.md` §Inbox failure card.
- **I4. High-score celebration shouldn't lead to paywall.** Score ≥80 → "Set up weekly tracking" requires paid plan. Touches: `04-EMPTY-STATES.md` §Free-scan high-score (offer free FAQ Builder + Schema Generator instead).
- **I5. Scan-saved-by-email fallback.** User closes tab during email gate → marketing CAC lost. Touches: `09-WAVE-1-BRIEF.md` FE-2 + BE-3 (auto-send "your scan result" email if user provided email but didn't complete signup).
- **I6. Day-1 state list `5` vs `7`.** FE-3 brief says 5 states, shared.ts has 7. Touches: `09-WAVE-1-BRIEF.md` FE-3.
- **I7. "AI Runs" vs "Actions" vs "Credits" naming.** Pick one. **Default: "AI Runs" (board canonical).** Touches: `04-EMPTY-STATES.md`, `09-WAVE-1-BRIEF.md` (replace any "credits" UI copy with "AI Runs").
- **I8. Suggestion freshness boost re-prioritization.** Current ranker surfaces never-fired rules first → user sees "yet another new thing" instead of "the competitor fix from last week". Touches: `02-AUTOMATION-RULES.md` §Ranking algorithm (freshnessBoost applies only when no high-impact recurring rule exists).

---

## P2 — Defer until post-Wave 1

(31 items — listed in source audit files. Highlights:)

- Email deliverability hardening (Resend bounce/complaint webhooks, warmup)
- LLM cost anomaly detection (hourly, per-user cap)
- Agent quality regression continuous eval
- Refund fraud pattern detector
- Backup/PITR drill
- Status page (Instatus or BetterUptime)
- Local SEO / scan localization (templates per language/city)
- Content Security Policy header
- `git-secrets` pre-commit hook
- Inngest signing key validation explicit
- CORS opt-out for `/api/webhooks/*` and `/api/inngest`
- SRI on Paddle.js
- Audit log tamper-evidence (hash chain)
- Page-lock release on every error path
- Markdown rehype-sanitize (P1 if Wave 1 ships markdown rendering — moved to P1 in Cluster E)
- Schema gen abuse pattern telemetry
- OpenRouter cache hit-rate alert threshold
- Multi-region Supabase
- Vercel function timeout limits per route
- Hebrew prompt evals (5/agent not 1/agent)
- A/B testing framework
- Non-EN/non-HE locale fallback
- Brand voice document beyond `_patterns.md`
- Dunning sequence (Paddle defaults are sane)
- Internal team comms (N/A for one-person team)

---

## Adam-decision items (no auto-fix — surface for human)

These require Adam's product/business judgment, not a spec patch:

- **ADQ-1. Activation cliff vs refund window.** Current gap: activation at week 3–4, refund window closes day 14. The leading-indicator panel (A12) helps but doesn't close the gap. Options: (a) extend refund window to 30 days; (b) add Day-3 founder-touch ritual (manual WhatsApp from Adam); (c) accept structural churn risk. **Recommend (a) + leading-indicator panel.**
- **ADQ-2. Vercel-cold vs Notion-warm visual direction.** Wave 0 brief points to Vercel's design-md as visual baseline; project memory says "billion-dollar feel" + Notion warmth. Both can't be true. **Recommend: lock decision in Wave 0 design-lead prep — pick one stance.**
- **ADQ-3. Discover-tier value step.** Discover at $79 gives ~4 actionable items/month; Build at $189 gives ~90. 22× activity gap for 2.4× price. Either Discover is sandbagged (looks-like-trap) or Build over-delivers. **Recommend: keep current; monitor Discover→Build conversion at month 2; if Discover churn >50% at month 2, bump Discover to 2 suggestions visible.**
- **ADQ-4. Hebrew payment rail.** Paddle = cards only, no Hora'at Keva / Bit / PayBox. Israeli SMB B2B convention is direct-debit. **Recommend: launch with cards; add Israeli rail as month-2 priority if conversion ceiling becomes evident.**
- **ADQ-5. Refund-bomb mitigation.** Build user runs 90 agents in 13 days → refund → Beamix net loss ~$30–50 + Paddle fees. Options: (a) deduct used-run value from refund; (b) cap refund to 50% if >50% credits consumed; (c) accept as a marketing cost (5% of revenue). **Recommend: (b) — in Paddle config + clear policy on Settings → Billing.**

---

## Fix Swarm Assignment (5 parallel agents)

Each agent gets a scoped slice of the P0/P1 fix list. All work in this same worktree (or spawn worktrees from main repo per CLAUDE.md). Each edits build-prep markdown files only (no code yet). All return structured JSON with file list + before/after summary.

### Fix Agent 1 — `fix-board-reconciliation` (general-purpose)
**Owner of:** Cluster A (12 items)
**Touches:** `00-INDEX.md`, `01-P0-RESOLUTIONS.md`, `03-DAY-1-FLOW.md`, `04-EMPTY-STATES.md`, `05-DB-MIGRATION-PLAN.md`, `06-ADAM-CHECKLIST.md`, `07-WAVE-0-BRIEF.md`, `08-WAVE-0.5-BRIEF.md`, `09-WAVE-1-BRIEF.md`, `10-WAVE-2-BRIEF.md`, `11-START-HERE.md`, `../12-AGENT-BUILD-SPEC.md`
**Hardest call:** ADQ defaults — annual day-1 ships, Anthropic-direct primary, $151 build annual. Document explicitly in patch notes.

### Fix Agent 2 — `fix-security-hardening` (security-engineer)
**Owner of:** Cluster B (5 Critical) + Cluster E (8 High) + Cluster I.M3 (markdown sanitize)
**Touches:** `03-DAY-1-FLOW.md`, `05-DB-MIGRATION-PLAN.md`, `06-ADAM-CHECKLIST.md`, `07-WAVE-0-BRIEF.md`, `08-WAVE-0.5-BRIEF.md`, `09-WAVE-1-BRIEF.md`, `10-WAVE-2-BRIEF.md`, `../12-AGENT-BUILD-SPEC.md`

### Fix Agent 3 — `fix-executability` (general-purpose)
**Owner of:** Cluster C (7 P0) + Cluster G (10 P1)
**Touches:** `07-WAVE-0-BRIEF.md`, `08-WAVE-0.5-BRIEF.md`, `09-WAVE-1-BRIEF.md`, `10-WAVE-2-BRIEF.md`

### Fix Agent 4 — `fix-day1-operational-types` (general-purpose)
**Owner of:** Cluster D (10 P1) + Cluster F (8 P1)
**Touches:** `03-DAY-1-FLOW.md`, `04-EMPTY-STATES.md`, `05-DB-MIGRATION-PLAN.md`, `09-WAVE-1-BRIEF.md`, `../12-AGENT-BUILD-SPEC.md`

### Fix Agent 5 — `fix-new-substrate-and-ux` (general-purpose)
**Owner of:** Cluster H (6 new files + checklist) + Cluster I (UX refinements)
**Creates:** `../17-ANALYTICS-SPEC.md`, `../18-LEGAL-PUBLISHING-PLAN.md`, `../19-SUPPORT-CHANNEL-SPEC.md`, `../20-ADMIN-DASHBOARD-SPEC.md`, `../21-DATA-GOVERNANCE.md` (all under `docs/product-rethink-2026-04-09/` not the build-prep subfolder — they're new top-level specs)
**Touches:** `06-ADAM-CHECKLIST.md`, `02-AUTOMATION-RULES.md`, `04-EMPTY-STATES.md`, `09-WAVE-1-BRIEF.md`, `00-INDEX.md`, `11-START-HERE.md`

---

## After fix swarm

1. **Verify** — read every patched file once to confirm fixes landed.
2. **Write** `12-AUDIT-FIX-REPORT.md` in build-prep folder — show before/after for each P0/P1 fix.
3. **Update** `MEMORY.md` index with audit completion entry.
4. **Surface ADQ-1..5 to Adam.**
5. Mark Wave 0 ready to spawn — pending Adam's ADQ decisions + Cluster H Adam manual setup items (PostHog signup, support email, etc.).

Estimated total scope post-audit: ~0.5–1 day of parallel agent work. Then Wave 0 spawn unblocks.
