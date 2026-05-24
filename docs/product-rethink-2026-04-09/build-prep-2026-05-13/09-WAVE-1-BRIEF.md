# Wave 1 — Full Build (CEO Brief)

*Updated 2026-05-23 — agency pivot. The section "AGENCY PIVOT RESCOPE" below supersedes the tool-product content further down. The legacy content is retained for reference and pattern reuse (security checklists, QA gate format, craft reviewer charter), but every product-surface description in the legacy section must be re-read through the agency lens.*

**Paste this entire file into a fresh CEO session once Wave 0.5 has merged.**

---

## AGENCY PIVOT RESCOPE — 2026-05-23 (READ FIRST, OVERRIDES BELOW)

The 2026-05-23 agency pivot (`.claude/memory/DECISIONS.md` 2026-05-23 entry + `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md`) reshapes Wave 1. Below are the four scope changes; everything downstream that contradicts is superseded.

### W1.1 — Brand-fingerprint storage + agent discovery flow (NEW)

**Owner:** backend-engineer + ai-engineer (parallel)
**Risk tier:** Full (touches identity contract for every customer-facing agent)

- New table `brand_fingerprints` (see `docs/03-system-design/DATABASE_SCHEMA.md` agency-pivot delta).
- New onboarding step "Agent discovery call" — Inngest function `discovery-call-orchestrator` invokes the Discovery agent (CPO PRD: `docs/04-features/specs/agent-discovery.md` — referenced, not duplicated here) which conducts a 20-question structured interview (text, then voice if available), stores transcript + structured extraction in `brand_fingerprints`.
- Adam reviews every brand brief through customer #50 — UI gate: brand_fingerprint has `adam_reviewed_at` field, blocks downstream agents until populated.
- New API endpoints: `POST /api/discovery/book`, `POST /api/discovery/start`, `POST /api/discovery/submit`, `GET /api/brand/me`.

### W1.2 — Free-scan → discovery-booking funnel (REPLACES old import flow)

**Owner:** frontend-engineer + backend-engineer
**Risk tier:** Full (customer-facing funnel critical path)

**KILLED:** The old "free scan → onboarding `?scan_id=` import → dashboard with pre-loaded data" flow. Decision #6 + #7 — free scan is the funnel front door, NOT the first dashboard scan.

**SHIPS:**
- Free scan page unchanged in look, but the post-scan CTA changes from "Sign up to track this" to "Book your free 20-minute discovery call to see how we'd fix it."
- New page `/discovery/book` — Calendly-or-equivalent booking widget (Adam-led discovery for customer 1-50; agent-led from #51 on).
- Free-scan record retained as breadcrumb (lead context) but NOT imported as the first paid scan.
- Backend: `free_scans.discovery_booking_id` FK (nullable) linking lead to booked call.
- Email after free-scan completion: "Here's what we found. Book a 20-min call to see how we'd fix it" (Resend template `free_scan_discovery_invite`).

### W1.3 — Outcomes dashboard v1 (NO agent names, NO credit counters)

**Owner:** frontend-engineer
**Risk tier:** Full (customer surface + craft reviewer applies)

**KILLED:** "AI Runs" credit counter UI, agent execution chat UI on customer side, raw scan tooling. Per decision #7.

**SHIPS (v1 minimum):**
- AI visibility score per engine (top of dashboard, big number per engine — ChatGPT, Gemini, Perplexity, Claude, Grok depending on tier)
- Weekly wins panel ("This week we got you mentioned 4 more times in ChatGPT queries about X")
- Top winning queries table (which prompts trigger your brand mentions)
- Approval queue panel (shell only Wave 1; populated by Wave 2 + Wave 3 publish actions)
- Weekly digest archive panel (list of past digests; content populated by Wave 2)
- "How we got this" drill-down trail — every score change links to the underlying scan + the agent action that moved it (internal agent name hidden — customer sees outcome like "we updated your FAQ schema").

**No agent identity ever exposed in customer UI or API responses.** Internal `apps/web/src/lib/agents/` retains identities. Customer-facing DTOs return outcome shapes only.

### W1.4 — Approval-queue UI shell (NEW)

**Owner:** frontend-engineer
**Risk tier:** Full

- New table `approval_queue` (see DATABASE_SCHEMA delta)
- UI shell: list view, empty state, item-detail modal stub (full diff UI ships Wave 2)
- Backend stubs: `GET /api/approval/queue`, `POST /api/approval/:id/approve`, `POST /api/approval/:id/reject` (logic stubbed; real publish action wires Wave 3)
- Real items appear in queue once Wave 2 deliverables flow online

### W1.5 — Tier rename + Paddle reconfig (BLOCKING for any billing work)

**BLOCKER for Wave 1 backend work touching Paddle.** Per decision #9:

- `plan_tier` enum: `('discover','build','scale')` → `('starter','growth','scale','professional')`. See `05-DB-MIGRATION-PLAN.md` agency-pivot delta.
- Paddle products + price IDs: Adam reconfigures in Paddle dashboard for $499/$999/$1,499/$2,499. Old products archived. Wave 1 BE worker reads new price IDs from `06-ADAM-CHECKLIST.md` once Adam updates.
- Marketing site (Framer) pricing page: CMO owns; not blocking Wave 1 product code.

### Wave 1 worker dispatch (updated)

CEO spawns the following workers in parallel after Wave 0.5 + design-lead approval:

1. **`be-brand-discovery`** (backend-engineer) — `brand_fingerprints` table + discovery API endpoints + Inngest discovery-call-orchestrator
2. **`ai-discovery-agent`** (ai-engineer) — Discovery agent prompt + extraction logic (PRD: `docs/04-features/specs/agent-discovery.md`)
3. **`fe-discovery-funnel`** (frontend-engineer) — free-scan → /discovery/book flow + booking widget
4. **`fe-outcomes-dashboard`** (frontend-engineer) — outcomes-shaped dashboard v1 (craft reviewer required)
5. **`fe-approval-shell`** (frontend-engineer) — approval queue UI shell
6. **`be-tier-rename`** (backend-engineer) — `plan_tier` enum migration + Paddle price ID config wiring

Workers 1+2 are coupled (share `brand_fingerprints` shape) — CTO writes the JSON schema once before either spawns. Workers 3+4+5 are parallel. Worker 6 sequences AFTER Adam updates Paddle.

### Legacy Wave 1 sections to skip or re-interpret

Below this section, the legacy Wave 1 brief discusses tool-product features (credit pools, Inbox 3-pane review flow, agent execution chat UI, `/dashboard/agents` page, etc.). **These are killed or transformed:**

- `Inbox 3-pane review` → repurposed as the approval-queue review modal (same UX pattern, different domain semantics)
- `Suggestion runner + automation dispatcher` → REPURPOSED for internal use only — agents now run autonomously on Inngest schedules; the "suggestions" surface is internal/admin, not customer-facing
- `Agent chat UI` (`/dashboard/agents/[agent_id]`) → KILLED. Customers never see agents.
- `Credit hold/confirm/release` plumbing → KEPT internally for cost tracking, but credit_pools UI is killed. The deliverables_per_customer_per_month table (Wave 2) replaces credit_pools as the user-facing throttle.

The security checklist (10 items), QA gate verdict format, craft reviewer charter — ALL CARRY FORWARD unchanged. Re-read them through the agency lens.

---

## Mission *(legacy — agency-pivot section above supersedes scope; security + QA pattern still apply)*

The foundation is in place. Now build everything in parallel — 3 backend workers + 3 frontend workers + design-lead. Backend delivers real APIs against the shared types contract. Frontend builds against the same contract. No drift possible.

**Estimated turns (per worker):** 40–80. Wave 1 is the biggest wave.

---

## Required Reading

You (CEO) read all of these. Pass relevant ones to each worker.

1. All build-prep docs: `00-INDEX.md` through `06-ADAM-CHECKLIST.md`
2. `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md`
3. `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md`
4. `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md`
5. `docs/product-rethink-2026-04-09/12-AGENT-BUILD-SPEC.md`
6. `docs/product-rethink-2026-04-09/13-DESIGN-SYSTEM-SPEC.md`
7. `docs/product-rethink-2026-04-09/14-SCAN-UX-SPEC.md`

---

## Test paths (every worker)

- Unit / integration tests live at `apps/web/src/<owner-dir>/__tests__/` (vitest). Example: BE-1 rules → `apps/web/src/lib/suggestions/__tests__/`, fixtures in `apps/web/src/lib/suggestions/__fixtures__/`.
- E2E tests in Wave 2 live at `apps/web/tests/e2e/` (Playwright).
- Test fixtures: `__fixtures__/` adjacent to the file under test.

## QA gate output contract

QA Lead writes `docs/08-agents_work/qa-verdicts/<branch-name>.md` with frontmatter:
```yaml
---
verdict: PASS | BLOCK
risk_tier: trivial | lite | full
findings: []
craft_score: 1-5                  # 1=PostHog, 3=baseline-good-SaaS, 5=Linear/Stripe. REQUIRED on FE PRs; n/a on backend-only PRs.
craft_findings: []                # Explicit list. NEVER empty on a frontend PR. CEO challenges any empty list on FE PR.
customer_outcome_check: ""        # "does this PR move <metric>? — yes/no/n/a". One short sentence.
---
```
CEO does NOT merge until the verdict file exists with `verdict: PASS`. Same contract applies in Wave 0, Wave 0.5, Wave 1, Wave 2.

### Craft reviewer (P0-A) — Full-tier addition for frontend PRs

For every **frontend** PR in Wave 1 (FE-1, FE-2, FE-3) and any frontend-touching PR thereafter, QA Lead spawns a **5th Full-tier reviewer: `craft-reviewer` (Sonnet)** in addition to code-reviewer, qa-engineer, security-engineer, and adversary-engineer. Skip for backend-only PRs.

`craft-reviewer` charter (paste verbatim into the worker brief):

> Read the PR diff with one lens only: "Does this ship at Linear / Stripe / Mercury / Things3 quality, or does this ship at PostHog quality?" You are NOT reviewing for correctness — other reviewers do that. You are reviewing for: spacing rhythm, typography intentionality, hover/focus states, animation choreography, microcopy precision, empty-state quality, error-state quality, loading-state quality. You compare against the reference set: Linear (lists), Stripe (forms + payment), Mercury (dashboards), Things3 (empty states), Anthropic.com (typography). You BLOCK if any of:
> (a) Tailwind default tracking on text larger than 24px,
> (b) Shadcn default focus ring on any interactive element,
> (c) skeleton uses `animate-pulse` instead of shimmer,
> (d) any animation uses Framer Motion's default spring (no explicit `stiffness` / `damping`),
> (e) microcopy contains the bare string `"Loading..."` with no context,
> (f) empty state ships a placeholder SVG instead of the `04-EMPTY-STATES.md` illustration,
> (g) error toast uses Shadcn default styling without Beamix tokens,
> (h) hover state changes only opacity or color (no transform / no shadow),
> (i) padding drift from `apps/web/src/components/_patterns.md` reference,
> (j) any user-facing string contains "AI" disclosure language.

Output: writes `craft_score` (1-5) and `craft_findings: []` (explicit, never empty on a FE PR) into the verdict frontmatter, plus `customer_outcome_check` naming the metric this PR moves (or `n/a` only if the PR is purely scaffolding).

Empty `craft_findings` on a frontend PR is itself suspicious — CEO must challenge it and re-run the reviewer.

---

## Security requirements (every worker must implement)

Per board April-18, every Wave 1 worker brief includes the 10 mandated security items:

1. SSRF validator (URL inputs)
2. Prompt-injection sanitization (untrusted strings in system prompts)
3. Cloudflare Turnstile (free-scan unauthenticated surface)
4. Credit locking (TOCTOU-safe RPC)
5. Webhook signature verification (Paddle HMAC; Inngest signing key)
6. RLS smoke tests on every new user-data table
7. `npm audit` clean
8. `rehype-sanitize` on rendered Markdown (Inbox + Archive preview)
9. Rate limiting (per-user + per-IP)
10. Cost circuit breaker (hourly per-user spend cap; auto-engage kill switch on breach)

### Per-worker security ownership (audit refs B1–B5, E1–E8, M3 in parens)

#### Backend Worker 1 (BE-1) — automation + Inngest

- **SSRF on url-probe (B3, E7).** `inngest/functions/url-probe.ts` MUST call `validateExternalUrl(url)` from `@/lib/security/url-guard` BEFORE `fetch`. Redirect cap = 2, timeout 5s, body cap 1 MB. Re-validate after each redirect (defeats DNS rebinding).
- **Rate limiting (M2).** Wrap every BE-1 API handler in `@upstash/ratelimit`. Per-user: `/api/agents/run` 30/hr, `/api/suggestions/[id]/run` 30/hr, `/api/inbox/[itemId]/edit` 60/hr, `/api/inbox/[itemId]/approve` 60/hr. Per-IP cap 200/hr on all. 429 + `Retry-After` header on breach.
- **Inbox approve idempotency (D9).** `POST /api/inbox/[id]/approve` is idempotent: if `inbox_items.status` already `approved`, return 200 noop with existing `archive_items` row reference. No duplicate archive rows.
- **Kill-switch race fix (D8).** `inngest/functions/agent-pipeline.ts` re-checks `system_kill_switch` AND `user_profiles.kill_switch_until` at PLAN step AND immediately before DO step. Active switch → throw `KillSwitchEngagedError`, release credits, exit.
- **Page-lock release on every error path (M7).** Pipeline runner wraps body in try/finally; `finally` calls `unlockPage()` even on timeout / OOM / unhandled rejection. Vitest test simulates each failure path.
- **Retention sweep (F8).** Add `inngest/functions/retention-sweep.ts` (daily cron): `DELETE FROM page_locks WHERE created_at < now() - interval '2 hours'`; `DELETE FROM topic_ledger WHERE created_at < now() - interval '365 days'`.
- **GDPR account-purge (E5).** Add `inngest/functions/account-purge.ts` — fires on `account.purge.requested`, waits 30 days (Inngest `step.sleepUntil`), then cascade-deletes `inbox_items`, `archive_items`, `agent_jobs`, `scans`, `scan_engine_results`, `competitors`, `url_probes`, `subscriptions` for that user. Emits `account.purged` to `audit_log`.

#### Backend Worker 2 (BE-2) — scan + billing + Paddle

- **Paddle webhook hardening (B1, B2).** `apps/web/src/lib/billing/paddle-webhook.ts` and `apps/web/src/app/api/webhooks/paddle/route.ts`:
  - In route file: `export const runtime = 'nodejs'` (must NOT be edge).
  - Read raw body via `await req.text()` (or `req.arrayBuffer()`) BEFORE any JSON parse.
  - Verify HMAC-SHA256 against `PADDLE_NOTIFICATION_SECRET` using `crypto.timingSafeEqual` for constant-time compare.
  - Reject 401 if `Paddle-Signature` timestamp older than 5 minutes (replay window).
  - After signature OK + JSON parse: call `record_webhook_event(event_id, event_type, payload)` RPC. If returns NULL → short-circuit HTTP 200 (duplicate). Only proceed to side effects on fresh `event_id`.
- **`allocate_monthly_credits` idempotency (B1).** Use new signature `(p_user_id, p_plan_id, p_billing_period_start)`. Pass `billing_period_start` from Paddle subscription payload's `current_billing_period.starts_at`.
- **Paddle `customData.supabase_user_id` (D1).** `POST /api/billing/checkout` MUST attach `customData: { supabase_user_id }` so webhook resolves `user_id` deterministically without racing the `paddle_customer_id` write.
- **SSRF on `/api/scan/free` and `/api/scan/start` (B3).** Validate URL with `validateExternalUrl()` BEFORE enqueueing scan or any DB write. Reject 400 if invalid.
- **Cloudflare Turnstile (E8).** `/api/scan/free` verifies Turnstile token server-side against `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `TURNSTILE_SECRET_KEY` before enqueuing. Reject 401 on failure.
- **Free-scan cache key (M6).** Cache by `(url, query_hash)` — never by `url` alone — so cross-tenant queries cannot fingerprint another business.
- **Rate limiting (M2).** `/api/scan/free` 5/hr per IP; `/api/scan/start` 10/day per user; `/api/billing/checkout` 10/hr per user; `/api/billing/topup` 10/hr per user; `/api/webhooks/paddle` 1000/hr per IP. 429 + `Retry-After` on breach.
- **Service-role isolation (H4).** `paddle-webhook.ts` and any file importing the service-role Supabase client MUST begin with `import 'server-only';` as the first non-comment line.
- **GDPR endpoints (E5).** Implement:
  - `POST /api/account/delete` — sets `user_profiles.deleted_at = now()`, emits `account.purge.requested`, inserts notification, invalidates sessions.
  - `GET /api/account/export` — streams JSON dump of the user's `user_profiles`, `businesses`, `scans`, `scan_engine_results`, `query_positions`, `agent_jobs`, `inbox_items`, `archive_items`, `competitors`, `subscriptions`, `credit_transactions`. GDPR Article 20.
- **PII scrub on error paths.** Webhook errors logged to Sentry must NOT include the raw Paddle payload — log only `event_id` + `event_type` + error class name.

#### Backend Worker 3 (BE-3) — notifications + cost

- **Cost circuit breaker (D10, I2).** Add `inngest/functions/cost-watcher.ts` (hourly cron):
  - Compute per-user 24h spend from `llm_cost_events` GROUP BY user_id.
  - If any user > $20 in 24h → `user_profiles.kill_switch_until = now() + interval '24h'`, insert notification "Hourly spend cap hit — agents paused. Contact support.", Sentry P0 alert.
  - If global 24h spend > $200 → `system_kill_switch.paused_until = now() + interval '1h'`, Sentry P0 alert tagged `cost_circuit_breaker`.
  - Emits `kill_switch.engaged` Inngest event with reason payload.
- **Rate limiting (M2).** `/api/notifications/read` 60/min per user; `/api/credits/balance` 60/min per user; `/api/archive/[id]/publish` 30/hr per user.
- **PII denylist for cost events (E6, H7).** `llm_cost_events` row columns: `id, user_id, business_id, agent_type, stage, model, prompt_tokens, completion_tokens, cost_usd, created_at`. NO `prompt_text`, `completion_text`, `customInstructions`, or `targetContent` columns. If Wave 0 Worker 1's migration already defined this table, BE-3 only inserts — no column additions.
- **Budget thresholds.** `budget-watcher.ts` emits `budget.threshold_75` and `budget.threshold_100` Inngest events at `used_amount / base_allocation` crossings. Separate function from `cost-watcher.ts`.

#### Frontend Worker 1 (FE-1) — Home + Inbox

- **`rehype-sanitize` on Markdown (M3).** Every `react-markdown` instance MUST use `rehype-sanitize` with the default strict schema. No raw HTML, no `<script>`, no `<iframe>`, no `on*` handlers. Sanitize at render-time. Applies to Inbox preview, Home suggestion descriptions, daily-digest preview, and any future Markdown surface.
- **Polling discipline (D3).** All polls start at 10s and back off after 5 idle polls (10s → 20s → 40s; reset on any state change). `@tanstack/react-query` `refetchInterval` derived from a backoff-tracking state hook.

#### Frontend Worker 2 (FE-2) — Scan + Scans + Automation

- **Cloudflare Turnstile widget (E8).** `/scan` form embeds the Turnstile widget (site key `TURNSTILE_SITE_KEY` from `06-ADAM-CHECKLIST.md`). Token submitted with `POST /api/scan/free`. Block submit if token absent or expired.
- **Industry funnel gate (I1).** Industry select blocks `legal`, `medical`, `financial` (YMYL-excluded) at the form layer — show waitlist CTA from `04-EMPTY-STATES.md` instead of running the scan.

#### Frontend Worker 3 (FE-3) — Settings + Privacy + Competitors

- **Settings → Privacy panel (E4, E5).** Add a `Privacy` tab (8th tab) to Settings:
  - **Delete my account** button → confirmation modal "Type your email to confirm" → `POST /api/account/delete` → toast "Account scheduled for deletion. You can cancel within 30 days from your email."
  - **Export my data** button → `GET /api/account/export` → triggers JSON file download.
  - **EU AI Act Article 50 disclosure tooltip** next to the agent automation summary: "Beamix uses AI to generate content. You are responsible for disclosing AI-generated content where required by law (EU AI Act Article 50)." Tooltip always visible; modal version triggers on first Inbox approve in EU regions (geo-detected via Vercel `x-vercel-ip-country` header).
  - Writes `user_profiles.disclosure_acknowledged_at` on first dismissal (column added by Fix Agent 1 / Wave 0 Worker 1).
- **Competitor add server-side urlGuard (B3).** Add-competitor modal: client validates URL format; server (`POST /api/competitors`, owned by BE-2) calls `validateExternalUrl()` before insert. FE-3 surfaces 400 errors with "We can't track that URL — try a public competitor homepage."
- **Component injection only (C6).** `<NotificationBell />`, `<PreviewBanner />`, `<KillSwitchBanner />` injected via slot props in `apps/web/src/app/(protected)/layout.tsx`. No worker edits `dashboard-shell.tsx` directly.

### Cross-cutting (every worker)

- **Service-role keys + `server-only` (H4).** Any file importing `SUPABASE_SERVICE_ROLE_KEY` begins with `import 'server-only';`. ESLint `import/no-internal-modules` enforces it.
- **No PII in Sentry breadcrumbs (E6, H7).** Never include `customInstructions`, `targetContent`, `business.name`, or any email in error messages / extra context.
- **`rehype-sanitize` (M3) wherever Markdown renders** — applies to all 3 FE workers.
- **Rate-limit values above are normative.** FE workers surface 429s with a friendly toast and `Retry-After` countdown.

User-facing language policy (board April-18):
- Internal agent names (e.g., `freshness_agent`) NEVER appear in UI copy.
- Every UI surface uses `USER_FACING_AGENT_LABELS[agentType].actionLabel` from `@/lib/types/shared` (defined in Wave 0.5).
- "GEO" never appears in user-facing strings — use "AI Search Visibility".

---

## Design-Lead Prep (half-day deliverable, before frontend workers spawn) — P0-B UPGRADE

**This is no longer a 2-hour markdown pass.** Per board P0-B verdict, the design-lead is now responsible for the design substrate that 6 parallel FE workers will build against. Thin prep = divergent UIs = unrecoverable Wave 2 polish reconciliation. Adam personally approves before any FE worker spawns.

CEO spawns design-lead in worktree `.worktrees/design-prep` (no PR — write-only to `apps/web/src/components/_patterns.md` + asset drops in `apps/web/public/illustrations/`).

### Required reading (full April-25 vision pack — read in order)

1. `docs/08-agents_work/2026-04-25-BEAMIX-VISION.md` — north-star product feel
2. `docs/08-agents_work/2026-04-25-HOME-DESIGN-SPEC.md` (1,271 lines) — 3-act vertical structure, 17-event entrance choreography, Fraunces diagnosis line, tabular numerals, warm-canvas, LCH-dimmed sidebar
3. `docs/08-agents_work/2026-04-25-PER-PAGE-ANIMATION-STRATEGY.md` (488 lines) — Rauno frequency-aware Tier 1/2/3 motion budget per page
4. `docs/08-agents_work/2026-04-25-REFERENCES-MASTERLIST.md` (767 lines) — every per-component reference anchor
5. `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION.md` — design direction v1
6. `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION-v2.md` — hand-drawn aesthetic decisions (Rough.js / Excalifont where applicable); REPLACES the deferred Beamie character
7. `docs/product-rethink-2026-04-09/13-DESIGN-SYSTEM-SPEC.md` — current tokens (the thin doc — read AFTER the April-25 pack so April-25 frames it, not the other way around)
8. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/04-EMPTY-STATES.md` — empty-state content + copy

**Note on referenced filenames:** The board verdict references `DESIGN-DIRECTION-v1.md` / `v2.md` dated 2026-04-25 — on disk these are dated `2026-04-24` (`2026-04-24-DESIGN-DIRECTION.md` is v1; `2026-04-24-DESIGN-DIRECTION-v2.md` is v2). Use the April-24 files — they are the canonical DIRECTION docs.

### Half-day deliverables (extends `apps/web/src/components/_patterns.md`)

1. **Typography scale + line-height table** — exact px/rem + line-height + tracking for h1/h2/h3/h4/body-lg/body/caption/code. Per-page overrides (e.g., Home score is 96px InterDisplay 500 with -0.04em tracking). Locked across all 7 pages.
2. **Spring-preset → component map** — one row per component class: modal-enter, card-enter, badge-update, hover-lift, focus-ring-appear, page-transition, dropdown-open, drawer-slide, toast-enter, skeleton-shimmer, digit-roll, delta-pill, AnimatePresence exits. Bind each to one of the 4 named presets (snappy/standard/gentle/bouncy) OR to an explicit `useSpring` config. **No FE worker invents a spring.**
3. **Skeleton designs for 6 page types** — Home, Inbox, Scans, Automation, Archive, Competitors (+ Settings tab variant). Use shimmer (not pulse). Specify shimmer gradient direction + speed. One design per shape class (text-line, card, list-row, score-hero-loading, sparkline-loading).
4. **Hover / focus / active state library** — buttons, links, cards, list-rows, nav items, badges, icon buttons. Specify transition timing + visual diff. Focus rings 3:1 against adjacent colors. WCAG AAA target on body text.
5. **9 empty-state illustrations** — **Day-1 Home is #1 priority**: frame-by-frame storyboard (post-payment redirect → spinner-with-text → first draft appearing → populated state), with hold times, transitions, microcopy timing, and ambient motion. NOT a placeholder SVG. The remaining 8 (workspace, inbox, scans, automation, archive, competitors, celebration, failure, tier-locked) ship as finished line-art SVGs or referenced asset set (Glyph / Untitled UI / streamline-style) with line weights + motion treatment.
6. **Tier 1/2/3 animation budget per page** (per Rauno frequency-aware framework, from `PER-PAGE-ANIMATION-STRATEGY.md`):
   - `/scan` + `/onboarding` = **Tier 1** (skeleton-draw, hand-drawn URL frame, full entrance choreography — first-impression surfaces, customer rarely returns)
   - `/scans` + `/automation` + `/competitors` = **Tier 2** (signature animations on state changes; no repeat entrance)
   - `/home` + `/inbox` + `/archive` + `/settings` = **Tier 3** (daily pages — instant render after first session, light hover/focus only, no overshoot springs, no celebratory animations on routine actions)
7. **Per-FE-worker reference anchors** — design-lead pins 2-3 reference screenshots per page via Refero/Stitch MCP. See the "Vision References" subsections injected into each FE worker brief below — design-lead fills the anchor screenshots into `_patterns.md` so workers consume them at spawn.
8. **Craft-QA checklist** — ~20-item visual-craft checklist that the new `craft-reviewer` (P0-A) applies BEFORE the PASS verdict. Forces a human-review gate against the quality bar.

### G-design-lead-approval — Adam-review gate (NEW)

After the design-lead returns, **Adam personally reviews** the following BEFORE any of the 6 Wave 1 FE workers may spawn:

- The extended `apps/web/src/components/_patterns.md`
- The 9 empty-state illustration set (or finalized reference anchors per illustration)
- The spring-preset → component map
- The skeleton designs for all 6 page types
- The Day-1 home storyboard (frame-by-frame)
- The per-page Tier 1/2/3 animation budget table
- The Refero/Stitch reference screenshots pinned per page

**No FE worker may spawn until Adam writes "design-lead approved" in the wave thread.** This is the single highest-leverage gate insertion in the entire build plan. Without it, 6 FE workers ship divergent UIs that Wave 2 cannot reconcile.

If Adam blocks any deliverable, design-lead re-runs that deliverable only (not the whole prep). FE workers wait.

After Adam writes "design-lead approved", all 6 Wave 1 workers spawn in parallel.

---

## Backend Team (3 parallel workers)

### Backend Worker 1 — `backend-developer` (Sonnet)
**Worktree:** `.worktrees/be-automation`
**Branch:** `feat/be-automation`
**Owner of:** Inngest functions, rules engine, suggestion generator, day-1 trigger, kill switch, cross-agent coordination wiring, off-site verification loop

**Brief:**

> Read `02-AUTOMATION-RULES.md` (15 rules), `03-DAY-1-FLOW.md`, `12-AGENT-BUILD-SPEC.md`, `07-AGENT-ROSTER-V2.md` §Cross-Agent Coordination. Import every type from `@/lib/types/shared`.
>
> Deliverables:
> - **FIRST deliverable (unblocks BE-2):** `apps/web/src/inngest/client.ts` — Inngest client. IMPORTS event types from `@/lib/types/events` (Wave 0.5). Does NOT redefine event names or payloads. Commit this file in the first commit on the branch so BE-2 can rebase against it.
> - `apps/web/src/inngest/functions/automation-dispatcher.ts` — cron every 15 min, fans out to scheduled agents (concurrency key: businessId)
> - `apps/web/src/inngest/functions/agent-pipeline.ts` — wraps `runAgentPipeline()` from `@/lib/agents`. MUST export `concurrencyKey: businessId` AND `concurrencyLimit: 1 per businessId per agent_type`. Stagger fan-out with a 2s delay per dispatched step (T3 risk mitigation).
>   - **D7 — Credit hold TOCTOU.** Before holding credits, acquire a DB-side row lock via `SELECT ... FOR UPDATE` on `credit_pools` AND `daily_cap_usage` atomically (handled inside the `hold_credits` RPC per security agent H1). The API route `POST /api/agents/run` ALSO serializes at the application level — use Inngest `concurrencyKey: ${userId}:${agentType}` with `concurrencyLimit: 1` to prevent two parallel runs of the same agent for the same user (double-click / two-tab races). Coordinate with security-engineer (RPC FOR-UPDATE rewrite) and Fix Agent 3 (concurrency key conventions).
> - `apps/web/src/inngest/functions/scan-free.ts` — public free scan (3 engines, fast)
> - `apps/web/src/inngest/functions/scan-manual.ts` — authenticated scan (engine count per tier)
> - `apps/web/src/inngest/functions/day1-onboarding.ts` — 6-step chain from `03-DAY-1-FLOW.md`
> - `apps/web/src/inngest/functions/rules-evaluator.ts` — fires on `scan.completed`, calls `evaluateRules()`, inserts suggestions
> - `apps/web/src/inngest/functions/url-probe.ts` — fires +48h after archive item marked published; updates `url_probes`
> - **Hebrew agent prompt variants ship at launch (P0-E, 2026-05-16 — moved from Wave 2).** Each agent prompt ships in two language variants at launch: `<agent>/prompt.en.md` and `<agent>/prompt.he.md` (or equivalent `PROMPT_HE`, `PLAN_PROMPT_HE`, `RESEARCH_PROMPT_HE`, `DO_PROMPT_HE`, `QA_PROMPT_HE`, `SUMMARIZE_PROMPT_HE` exports alongside the existing English ones — DO NOT rename existing English exports). The Hebrew variant is selected when the business's `business.locale = 'he'` (set during onboarding from Hebrew website detection + Adam-approved). No mid-pipeline language switch — locale is bound at job-create time. Pipeline step files (`pipeline/steps/*.ts`) pick `*_EN` vs `*_HE` based on `business.locale`. Coordinate with Wave 2 Worker 1B (Hebrew QA review of agent outputs) for post-launch tuning.
> - `apps/web/src/lib/suggestions/rules.ts` — 15 rules from `02-AUTOMATION-RULES.md`, one per object in `RULES: AutomationRule[]`
> - `apps/web/src/lib/suggestions/evaluator.ts` — `evaluateRules(scanId, businessId)`
> - `apps/web/src/lib/suggestions/ranker.ts` — Haiku-based prioritization when >5 rules fire
> - `apps/web/src/lib/automation/kill-switch.ts` — global + per-agent pause utilities.
>   - **D8 — Kill switch race during cron dispatch.** The agent pipeline runner re-reads `user_profiles.kill_switch_until` AND `system_kill_switch` at the PLAN step and immediately before the DO step. If a kill switch is engaged between dispatch and step execution, abort cleanly: call `releaseCredits(jobId)`, insert notification "Run aborted — kill switch active", mark `agent_jobs.status = 'cancelled'`. Closes W9 race window.
> - API routes: `POST /api/agents/run`, `POST /api/agents/[jobId]/cancel`, `GET /api/agents/[type]` (agent config lookup), `GET /api/inbox`, `GET /api/inbox/[itemId]`, `POST /api/inbox/[itemId]/approve`, `POST /api/inbox/[itemId]/reject`, `POST /api/inbox/[itemId]/edit`, `GET /api/suggestions`, `POST /api/suggestions/[id]/dismiss`, `POST /api/suggestions/[id]/run`, `GET /api/automation/schedules`, `POST /api/automation/schedules`, `PATCH /api/automation/schedules/[id]`, `DELETE /api/automation/schedules/[id]`, `POST /api/automation/kill-switch`
> - Vitest suite covering: each of 15 rules (one test per rule, fixtures in `__fixtures__/`), kill-switch enforcement, day-1 chain step idempotency
>
> **Suggestions API behavior clarifications:**
> - **R2 — Dismissal during run.** `POST /api/suggestions/[id]/dismiss`: if `suggestions.status === 'running'`, this does NOT cancel the underlying agent run. It marks the suggestion as `dismissed`, but the agent run completes into Inbox as normal. The user can dismiss the Inbox draft separately if desired. Spec clarification: `'dismissed'` means "don't surface again on Home", NOT "cancel the run". To cancel a running job, use `POST /api/agents/[jobId]/cancel`.
> - **D9 — Idempotent Inbox transitions.** `POST /api/inbox/[id]/approve` is idempotent: if `inbox_items.status` is already `approved`, return 200 with the existing archive item — no duplicate row. `POST /api/inbox/[id]/reject` likewise. Two-tab approvals from the same user must never create duplicate `archive_items` rows. Enforce by reading `inbox_items.status` inside a transaction and short-circuiting on terminal states.
>
> Stay inside `src/inngest/`, `src/lib/suggestions/`, `src/lib/automation/`, and the API routes listed.
>
> Return structured JSON: branch, worktree, files_created, tests_passing, api_routes_implemented.

### Backend Worker 2 — `backend-developer` (Sonnet)
**Worktree:** `.worktrees/be-scan-billing`
**Branch:** `feat/be-scan-billing`
**Owner of:** scan pipeline, Paddle billing, feature gating, plan seed data, post-payment route

**Brief:**

> Read `07-AGENT-ROSTER-V2.md`, `06-PRICING-V2.md`, `14-SCAN-UX-SPEC.md`, `06-ADAM-CHECKLIST.md`. Import types from `@/lib/types/shared`.
>
> Deliverables:
> - `apps/web/src/lib/scan/runner.ts` — fires per-engine scan calls (LLM via OpenRouter), writes `scan_engine_results`, computes `query_positions`, extracts `brands_mentioned`
> - `apps/web/src/lib/scan/engines/` — per-engine adapters (ChatGPT, Gemini, Perplexity, Claude, AI Overviews, Grok, You.com — tier-gated availability)
> - `apps/web/src/lib/scan/query-mapper-integration.ts` — reads `tracked_queries`, falls back to template queries on first scan
> - `apps/web/src/lib/scan/scoring.ts` — overall_score algorithm (mention rate × position weight × engine weight)
> - `apps/web/src/lib/billing/paddle-webhook.ts` — handle `subscription_created`, `subscription_updated`, `subscription_cancelled`, `transaction_completed`. Allocate credits via `allocate_monthly_credits` RPC. Trigger Inngest `day1.onboarding` on `subscription_created`.
> - `apps/web/src/lib/billing/paddle-client.ts` — Paddle SDK wrapper for checkout + portal links
> - `apps/web/src/lib/feature-gate/index.ts` — `canAccess(userId, feature: FeatureKey): Promise<boolean>` — single source of tier checks
> - `apps/web/src/lib/feature-gate/features.ts` — `FEATURE_MAP: Record<PlanTier, Record<FeatureKey, boolean>>`
> - API routes: `POST /api/scan/start`, `POST /api/scan/free`, `GET /api/scan/[scanId]`, `GET /api/scan/free/[scanId]`, `GET /api/scans`, `GET /api/competitors`, `POST /api/competitors`, `DELETE /api/competitors/[id]`, `POST /api/billing/checkout`, `POST /api/billing/portal`, `POST /api/billing/topup`, `POST /api/webhooks/paddle`, `GET /api/plan/features`, `GET /api/onboarding/day1-status`
> - Paddle sandbox webhook tested end-to-end: subscription_created → credit_pools row created → notifications insert → day1.onboarding fired
> - 14-day money-back guarantee logic: refund handler in webhook (`paddle_subscription_refunded` / `transaction_refund_requested`) updates `subscriptions.status='cancelled'` and zeroes the credit pool.
> - **ADQ-5 — Credit-consumption refund cap (resolved 2026-05-14; clarified 2026-05-16 per board verdict P0-D).** Refund handler enforces a credit-consumption cap before approving the full refund. **User-initiated vs auto-initiated split (P0-D, 2026-05-16):** the 50% threshold counts only user-initiated runs. Auto-runs (Day-1 onboarding chain, scheduled weekly scans, scheduled freshness checks) are excluded so Beamix-initiated consumption cannot penalize the customer.
>   1. Schema requirement: extend `credit_transactions` with field `initiator` (enum `'user' | 'auto'`). If the column doesn't exist in the Wave 0 migration set, BE-2 adds it via a new migration; if it does, BE-2 ensures every insert site sets it correctly (user-triggered API routes → `'user'`; Inngest scheduler / Day-1 chain → `'auto'`). Coordinate with BE-1 + BE-3 to set `initiator` at all insert sites.
>   2. On refund request, compute `credits_for_cap = sum(amount WHERE initiator = 'user' AND status = 'consumed')` from `credit_transactions` for the current billing period. Compute `consumedPct = credits_for_cap / base_allocation` (NOT against total consumed, NOT against base+topup+rollover — only the plan's base allocation, and only user-initiated counts).
>   3. If `consumedPct <= 0.50` → full refund (call `paddle.refund(transactionId, { type: 'full' })`).
>   4. If `consumedPct > 0.50` → partial refund of 50% of the subscription price (call `paddle.refund(transactionId, { type: 'partial', amount: subscriptionPriceUsd * 0.50 })`). Top-up purchases ($19/10 runs) are non-refundable in this path — they reflect already-delivered runs.
>   5. Insert `audit_log` row: `{ event: 'refund_capped', consumed_pct, credits_for_cap, auto_runs_excluded, original_amount, refunded_amount, reason: 'adq5_50pct_cap' }`. Fire PostHog event `refund_requested` with `consumedPct` + `cap_applied: boolean` + `auto_runs_excluded`.
>   6. Refund-request preview surface (Settings → Billing → Request refund) MUST show: `Total runs used: X | Auto-runs (not counted): Y | Counted toward cap: X-Y` so the customer sees the split.
>   7. Email user via Resend template `refund_processed` with breakdown of which runs they kept value from AND the user/auto split. The 50% cap is also disclosed in `18-LEGAL-PUBLISHING-PLAN.md` refund clause and on the Paddle checkout T&Cs link — workers verify both surfaces match this rule.
> - Top-up ($19/10 runs): Paddle one-time purchase → `transaction_completed` → `topup_amount` column on credit_pools incremented. Top-ups are NON-refundable per ADQ-5 (always treated as fully consumed at time of purchase).
>
> Stay inside `src/lib/scan/`, `src/lib/billing/`, `src/lib/feature-gate/`, and the API routes listed.

### Backend Worker 3 — `backend-developer` (Sonnet)
**Worktree:** `.worktrees/be-notifications`
**Branch:** `feat/be-notifications`
**Owner of:** notifications, email (Resend), daily cap enforcement, archive publish, in-app notification center

**Brief:**

> Read `08-UX-ARCHITECTURE.md` §8 Notification System, `04-EMPTY-STATES.md` §Inbox failure card. Import types from `@/lib/types/shared`.
>
> Deliverables:
> - `apps/web/src/lib/notifications/insert.ts` — `insertNotification(userId, type, body, linkPath?)` — single entry point used everywhere
> - `apps/web/src/lib/notifications/email-sender.ts` — Resend wrapper sending from `notify@beamixai.com`
> - `apps/web/src/lib/notifications/templates/` — 6 templates: `welcome-onboarded`, `scan-complete`, `daily-digest`, `payment-failed`, `budget-75`, `budget-100`, `run-failed`
> - **Hebrew transactional email variants ship at launch (P0-E, 2026-05-16 — moved from Wave 2).** All transactional templates ship in EN + HE variants at launch: `welcome` (a.k.a. `welcome-onboarded`), `day_1_summary`, `weekly_digest` (a.k.a. `daily-digest`), `refund_processed`, `kill_switch_active`, `subscription_cancelled`, `payment_failed`. Each template file ships as `<name>.en.tsx` + `<name>.he.tsx` (or equivalent locale-keyed render branch). Locale resolved from `user_profiles.locale` at send time (fallback: `business.locale`; final fallback: `'en'`). RTL CSS direction handled per email-client compat: table-based layout (no flexbox in email), `dir="rtl"` attribute on the root `<table>` for HE renders, mirrored padding (`padding-right` ↔ `padding-left`) on container cells. Heebo web font with Arial fallback for HE renders. Test each HE template in Litmus or equivalent across Gmail / Outlook / Apple Mail before merge.
> - `apps/web/src/inngest/functions/daily-digest.ts` — cron 7am, aggregates per-user notifications, sends 1 email (max 1/day)
> - `apps/web/src/inngest/functions/budget-watcher.ts` — checks credit_pools each agent_jobs completion. If usage crosses 75% → email + notification. If 100% → pause schedules, email, notification.
> - `apps/web/src/lib/agents/credits/daily-cap.ts` is from Wave 0 — Backend Worker 3 wires it into the agent_pipeline middleware (read pre-run, increment post-DO step).
>   - **W10 — Timezone-aware daily-cap reset.** Daily caps reset at the user's local-time midnight when `user_profiles.timezone` is populated; otherwise UTC midnight. Default for new accounts: `Asia/Jerusalem` if the signup referrer is a `.il` host or the user chose Hebrew as the UI language; UTC otherwise. The worker stores a timezone-aware reset boundary on `daily_cap_usage` so a user's "today" doesn't reset at 02:00 IL just because the server clock is UTC.
> - **D10 — `apps/web/src/inngest/functions/cost-circuit-breaker.ts`** — hourly cron. Aggregates `llm_cost_events` for the last 24h grouped by `user_id`.
>   - If any user_id 24h total > **$20** → set `user_profiles.kill_switch_until = now() + interval '24h'` AND `insertNotification(userId, 'kill_switch_engaged', '...')` AND send Sentry P0 alert.
>   - If global 24h total > **$200** → set `system_kill_switch.engaged_at = now()` AND send Sentry P0 alert routed to Adam.
>   - Coordinate with security-engineer for `system_kill_switch` table (singleton, service-role-only) — see `05-DB-MIGRATION-PLAN.md` §E2.
> - API routes: `GET /api/notifications`, `POST /api/notifications/read`, `GET /api/credits/balance`, `POST /api/archive/[itemId]/publish`
> - On `POST /api/archive/[itemId]/publish`: mark `archive_items.published_at`, queue Inngest `url-probe` event (+48h)
> - Vitest suite: budget alert thresholds, daily cap reset at user-local midnight, cost-circuit-breaker per-user + global thresholds, email max-1-per-day enforcement
>
> Stay inside `src/lib/notifications/`, the listed Inngest functions, and the API routes listed.

---

## Frontend Team (3 parallel workers)

### Frontend Worker 1 — `frontend-developer` (Sonnet)
**Worktree:** `.worktrees/fe-home-inbox`
**Branch:** `feat/fe-home-inbox`
**Owner of:** Home page, Inbox page, in-app notification bell

**Brief:**

> Read `08-UX-ARCHITECTURE.md` §3 Home + §3 Inbox + §6 Central Content Hub, `13-DESIGN-SYSTEM-SPEC.md`, `04-EMPTY-STATES.md`, `apps/web/src/components/_patterns.md` (design-lead prep). Import all API schemas from `@/lib/types/api`.
>
> Home (`/home`):
> - `ScoreHero` component (animated counter, 8-week sparkline, delta pill)
> - **Guided Step-by-Step Path** (board April-18): top-3 suggestions render as **numbered sequential steps (1, 2, 3) with a horizontal progress bar above the steps**, NOT an unordered card grid. Each step is a `SuggestionStepCard` that shows: step number (large), action label (from `USER_FACING_AGENT_LABELS[agentType].actionLabel` — NOT the internal agent name), one-line outcome, impact pill, and a single primary CTA ("Start step 1 →"). After Step 1 completes, the bar advances and Step 2's CTA unlocks. Data from `GET /api/suggestions` (ranker output). Use `USER_FACING_AGENT_LABELS` everywhere — never display `agentDisplayName` or the `agent_type` enum string.
> - **Leading-Indicator Panel** (board April-17 — activation-vs-refund-window mitigation): a 4-stat strip below the score hero showing early signals that fire before scan-deltas can: "Content published this week" (from `archive_items` count where `published_at` in last 7 days), "Actions completed" (from `agent_jobs` count where `status='succeeded'` in last 7 days), "Citations detected" (from new `citation_signals` table — see `05-DB-MIGRATION-PLAN.md` Signals group), "Next scheduled run" (from `automation_schedules`). Bridges the gap between payment-day and first scan-delta (week 3–4), keeping the user activated through the 14-day refund window.
> - "Run all — N AI Runs" signature pill (per memory `project_quality_bar_billion_dollar.md` quality bar; user-facing copy uses "AI Runs" per Fix Agent 5 / I7, never "credits"). Pill copy: "Run all 3 steps".
> - Inbox preview (last 3 drafts)
> - Automation status strip (next scheduled run from `GET /api/automation/schedules`)
> - Discover-tier paywall blur — Step 1 visible, Steps 2 and 3 rendered behind frosted `<PaywallGate>` with "Upgrade to unlock the full guided path"
> - Day-1 empty state (from `04-EMPTY-STATES.md` §Home Day-1) — polls `GET /api/onboarding/day1-status`
>
> Inbox (`/inbox`):
> - 3-pane Superhuman layout (list · preview · evidence)
> - Filter rail: All / Draft / Awaiting Review / Approved / Archived / Failed
> - Markdown preview via `react-markdown`
> - Approve / Reject / Archive with auto-advance to next
> - Keyboard nav: J/K/A/R + ⌘K palette routes
> - Inline chat editor for Freshness Agent only — select text → floating capsule → POST `/api/inbox/[itemId]/edit` → diff with accept/reject (T4: cuttable; default to textarea-diff if shipping pressure)
> - Evidence panel: trigger source, target queries, citations, impact, YMYL badge
> - Inbox polling (`useInboxPolling()` at **10-second interval** as default, with exponential backoff after 5 idle polls: 10s → 20s → 40s; resets on any state change). Supabase Realtime as env-flag-opt-in, **flipped at 50 concurrent users** (not 100). Same backoff applies to notifications + credit-balance polls. (D3 saturation fix.)
> - Failure card variant from `04-EMPTY-STATES.md` §Inbox failure card
>
> Notification bell:
> - Implements as a standalone `<NotificationBell />` component at `apps/web/src/components/notification-bell.tsx`.
> - INJECTS into `DashboardShell` via the `notificationBell` slot prop set in `apps/web/src/app/(protected)/layout.tsx`. Does NOT edit `dashboard-shell.tsx` directly.
> - **P0-F:** Un-comment ONLY your assigned line in `apps/web/src/app/(protected)/layout.tsx` — Wave 0 W3 pre-stubbed all three slot imports as commented-out scaffolding. FE-1 un-comments the `NotificationBell` import line only. The `PreviewBanner` and `KillSwitchBanner` lines belong to FE-3. Do not edit other workers' lines — that's how we avoid merge conflicts on this file.
> - Reads `GET /api/notifications`
> - Unread count badge
> - Dropdown panel grouped "Today / Earlier"
> - Mark-read on click → POST `/api/notifications/read`
>
> **Vision References (P0-C — April-25 bridge):**
> - **Home (`/home`)** — Anchor: Linear list density + Anthropic.com typography hierarchy. Read `docs/08-agents_work/2026-04-25-HOME-DESIGN-SPEC.md` for the 3-act vertical structure (State / Detail / Context, 8 sections), the Fraunces diagnosis line, tabular numerals on every digit, the 17-event entrance choreography (1.85s, sessionStorage flag, reduced-motion fallback), the 4-LCH-point sidebar dimming, and the warm-canvas `#F5F3EE` background. ScoreHero is the centerpiece — Anthropic.com headline weight, Linear-grade numerical alignment, NOT a Shadcn-default card. Home is **Tier 3** motion per `2026-04-25-PER-PAGE-ANIMATION-STRATEGY.md` — light hover/focus only after first session; entrance choreography runs once-per-session.
> - **Inbox (`/inbox`)** — Anchors: Superhuman 3-pane triage + Linear list-row hover + Things3 empty state. **Tier 3** motion — instant render after first session, no entrance choreography on subsequent visits. The failure card variant from `04-EMPTY-STATES.md` uses the Things3 empty-state restraint, NOT a placeholder SVG.
> - **Notification bell** — Anchor: Linear's notification dropdown grouping ("Today / Earlier" sections, dot indicator, no-shadow flat menu). Tier 3.
>
> **GEO research stats surfacing (P0-C):** On Home suggestion cards (the numbered Guided Step cards) AND in the Inbox evidence panel, surface the GEO research statistics as impact pills on the relevant suggestion types. Use the exact figures: **76% freshness** (on Freshness Agent suggestions — pill copy: "76% of AI answers prefer fresh content"), **46.7% Reddit** (on off-site/community suggestions — pill: "46.7% of AI citations come from Reddit"), **16.3% Wikipedia** (on entity / Wikipedia suggestions — pill: "16.3% of AI citations come from Wikipedia"), **85% off-site** (on any off-site action suggestion — pill: "85% of GEO impact comes from off-site signals"). These statistics must appear on user-facing surface cards — do NOT hide them inside agent system prompts only. Source the pill data from `suggestions.impact_stat` field if BE-1 populates it; otherwise hardcode per agent_type at the component layer.
>
> **Hand-drawn aesthetic (P0-C):** Use the hand-drawn aesthetic decisions from `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION-v2.md` (Rough.js / Excalifont where the design-lead `_patterns.md` deliverable says to). This REPLACES the deferred Beamie character. Do NOT add character / mascot illustrations.

### Frontend Worker 2 — `frontend-developer` (Sonnet)
**Worktree:** `.worktrees/fe-scan-scans-automation`
**Branch:** `feat/fe-scan-scans-automation`
**Owner of:** Free scan UX (`/scan`), Scans page, Automation page

**Brief:**

> Read `14-SCAN-UX-SPEC.md` (the whole thing — this is the conversion funnel, every pixel matters), `08-UX-ARCHITECTURE.md` §3 Scans + Automation, `13-DESIGN-SYSTEM-SPEC.md`, `04-EMPTY-STATES.md`, `apps/web/src/components/_patterns.md`.
>
> `/scan` (public):
> - 4-state machine: form → scanning → revealing → revealed → email_gate
> - Pre-scan form with progressive reveal — INCLUDES a required `industry` select (Fix Agent 5 / I1). The select has a hardcoded exclusion list at `apps/web/src/lib/scan/excluded-industries.ts`: `legal`, `medical`, `financial`. When an excluded industry is chosen, render the form-level message "We're focused on services, e-commerce, and SaaS for MVP." inline, AND disable the submit button. If the user submits anyway (race / bypass attempt), the server route rejects with 422 and the client renders the **Excluded industry result page** from `04-EMPTY-STATES.md` §Excluded industry (Join waitlist CTA + no scan, no LLM call, no charge). Coordinate with BE-2 — `/api/scan/free` validates industry server-side too.
> - Dark scanning animation (60–90s); engine logos light up sequentially via polling
> - Wound-reveal result (score, 3 visible fixes, 8 blurred)
> - **Scan-saved-by-email fallback** (Fix Agent 5 / I5 — closes free-scan CAC leak): if the user provides their email in the soft email-gate (20s after reveal) but does NOT complete signup within 24h, an Inngest cron `scan-saved-reminder` fires once at the 24h mark with a Resend template `scan_saved_reminder`. Body: "Your Beamix scan result is saved — pick up where you left off." Link: `app.beamixai.com/scan/result/{scan_id}` (signed token, 30-day expiry) opens the wound-reveal directly. Coordinate with BE-3 (owns the Resend template + Inngest function) and BE-2 (owns `free_scans` table — adds `email_captured_at`, `signup_completed_at`, `reminder_sent_at` columns). One reminder only — no email pestering.
> - **Content Optimizer teaser** (board April-18, zero-cost): on the free-scan result page, render a "Preview what a fix looks like" card that shows the first 3 sentences of a homepage rewrite, with the remaining content blurred behind a paywall CTA. The 3-sentence excerpt is generated by a single Haiku call against the scanned homepage HTML during scan (cost ~$0.003, batched into the free-scan run — no extra LLM round-trip). This is the visual taste of the paid Content Optimizer agent. Card CTA: "See the full rewrite — Start Discover ($79)".
> - High-score celebration state (≥80) per `04-EMPTY-STATES.md` §Free-scan high-score
> - "Explore first" path → preview mode auto-account creation
>
> Scans (`/scans`):
> - Vertical timeline (date · score · delta pill)
> - Drill-down: per-engine cards, mention snippets, query coverage map
> - Re-scan button with rate-limit countdown
> - Score-drop empathy panel per `04-EMPTY-STATES.md` §Score dropped (directional language only — B5)
> - Diff view: this scan vs previous
>
> Automation (`/automation`):
> - Projection header: AI Runs used / cap bar (from `GET /api/credits/balance`; user-facing label is "AI Runs" not "credits" per Fix Agent 5 / I7. The API route name stays `/api/credits/balance` — internal model unchanged.)
> - Agent schedule cards (2-col grid)
> - Per-agent pause toggle, kill-switch toggle at top with confirmation modal
> - Tier-locked overlay for Discover per `04-EMPTY-STATES.md`
> - Soft page-cap warning when >5 schedules fire simultaneously
>
> **Vision References (P0-C — April-25 bridge):**
> - **`/scan` wound-reveal** — Anchor: **Stripe payment-reveal moment**. The 17-event entrance choreography from `docs/08-agents_work/2026-04-25-HOME-DESIGN-SPEC.md` is the template — adapt the same staged reveal pattern (score arc count-up via `@number-flow/react`, engine pills lighting up sequentially, 3 visible fixes entering with stagger, 8 blurred fixes settling in behind). Also read `docs/08-agents_work/2026-04-25-REFS-03-url-scan-onboarding.md` for the 10-frame REFS-03 narrative (hand-drawn URL frame, score arc count-up, 15-17s reveal). `/scan` + `/onboarding` are **Tier 1** motion per `2026-04-25-PER-PAGE-ANIMATION-STRATEGY.md` — skeleton-draw, hand-drawn URL frame, FULL entrance choreography (first-impression surface, customer rarely returns).
> - **`/scans` (history)** — Anchor: Linear past-issues list + Anthropic Console drill timeline. **Tier 2** — signature animations on score-delta changes; no repeat entrance. Score-drop empathy panel uses directional language only (B5).
> - **`/automation`** — Anchor: Linear cycles + Stripe Dashboard automation card grid. **Tier 2** — schedule cards animate when a run state changes; no entrance choreography on revisit.
>
> **GEO research stats surfacing (P0-C):** On the `/scan` wound-reveal result page, place **76% freshness** + **46.7% Reddit** + **16.3% Wikipedia** + **85% off-site** as impact pills next to the 3 visible fix cards (mapped to the fix's agent_type — Freshness Agent fix gets the 76% pill; Reddit/community fix gets the 46.7% pill; Wikipedia/entity fix gets the 16.3% pill; any off-site fix gets the 85% pill). These are the conversion crux — they prove the fix's data-backed weight in the AI-search landscape. Visible on the wound-reveal, NOT buried in agent prompts.
>
> **Hand-drawn aesthetic (P0-C):** The `/scan` pre-scan form's URL frame uses the hand-drawn Rough.js + Excalifont aesthetic decisions from `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION-v2.md` (per design-lead `_patterns.md` deliverable). This REPLACES the deferred Beamie character — do NOT add character / mascot illustrations.

### Frontend Worker 3 — `frontend-developer` (Sonnet)
**Worktree:** `.worktrees/fe-archive-comp-settings-paywall`
**Branch:** `feat/fe-archive-comp-settings-paywall`
**Owner of:** Archive, Competitors, Settings (7 tabs), preview mode + paywall, `/onboarding/post-payment` UI, top-up modal, kill-switch banner

**Brief:**

> Read `08-UX-ARCHITECTURE.md` §3 Archive + Competitors + Settings + §4 Free Scan flow steps 5–9, `13-DESIGN-SYSTEM-SPEC.md`, `04-EMPTY-STATES.md`, `03-DAY-1-FLOW.md` §UI states.
>
> Archive (`/archive`):
> - Approved items list
> - Self-reported publish status toggle → POST `/api/archive/[itemId]/publish`
> - Verification status chip (pending / verified / unverified)
> - Copy MD / HTML per item; Scale: CSV/JSON bulk export
>
> Competitors (`/competitors`):
> - Appearance rate table
> - "Queries where they win, you don't" section
> - Add-competitor modal (URL input + validation, POST `/api/competitors`)
> - 4-week mention trend per competitor
> - Movement alert banner (from R09 suggestion)
> - Tier locks per `08-UX-ARCHITECTURE.md`
>
> Settings (`/settings`) — 7 tabs:
> - Profile, Business, Billing, Preferences, Notifications, Integrations, Automation Defaults
> - Billing tab: Paddle portal link + invoice history + plan-comparison modal (upgrade flow for existing subscribers)
> - Integrations tab: GA4/GSC stubs ok
>
> Preview mode + Paywall:
> - `<PreviewBanner />` is a standalone component at `apps/web/src/components/preview-banner.tsx`; INJECTED into `DashboardShell` via the `previewBanner` slot prop in `apps/web/src/app/(protected)/layout.tsx`. Does NOT edit `dashboard-shell.tsx` directly. Copy: "Preview mode — upgrade to unlock agents"
> - `<PaywallGate>` component wraps any gated CTA
> - Paywall modal (880px) — all 3 tiers, Build highlighted. **Annual toggle defaults ON (saves 20%). Both monthly and annual ship day-1 per board April-17.** Toggle switches each tier card between monthly ($79/$189/$499) and annual ($63/$151/$399) price IDs from `06-ADAM-CHECKLIST.md`.
> - One free FAQ Builder run per preview account (result lands in Inbox, approve triggers paywall)
>
> **PDF Report Export** (board April-18): emailable one-page PDF containing visibility score, top-3 competitors, and action plan. Trigger surfaces: "Export PDF" CTA on free-scan result page AND Scans drilldown page. Implementation: server-side render via `@react-pdf/renderer` (chosen over Puppeteer for smaller cold-start + deterministic output — Adam confirms). Endpoint: `POST /api/reports/scan/[scanId]/pdf` → streams `application/pdf`. Template at `apps/web/src/lib/reports/scan-pdf.tsx`. "Send to my inbox" CTA invokes the same endpoint and attaches the PDF to a Resend send. Free-scan PDF requires email (soft gate); paid users get one-click download.
>
> `/onboarding/post-payment`:
> - Polls `GET /api/onboarding/day1-status` every **3 seconds** (D3 — lifted from 2s to reduce Supabase load).
> - Progress UI per `03-DAY-1-FLOW.md` §UI states
> - **7 states from the `Day1State` union** (Fix Agent 5 / I6 — aligns with `@/lib/types/shared`): `waiting_webhook` → `ensure_business` → `query_mapper` → `query_review` → `scan_running` → `rules` → `complete` → redirect to `/home`. (`query_review` was added by Fix Agent 1 for the Query Review Gate per board April-18; coordinate with that change. Do NOT ship 5-state UI — the type union is the source of truth.)
> - Escape hatch after **240 seconds** (not 180s — accommodates realistic 2–3 min Day-1 on Build/Scale per 04-EMPTY-STATES.md timing update).
>
> Top-up modal:
> - Triggered from Settings → Billing AND from Home credit-bar 100% state
> - $19 → 10 runs, Paddle one-time checkout
>
> Global kill-switch banner: standalone `<KillSwitchBanner />` component at `apps/web/src/components/kill-switch-banner.tsx`; INJECTED into `DashboardShell` via the `killSwitchBanner` slot prop in `apps/web/src/app/(protected)/layout.tsx`. Does NOT edit `dashboard-shell.tsx` directly.
>
> **P0-F — Layout slot un-comment discipline.** Wave 0 W3 pre-stubbed all three slot imports in `apps/web/src/app/(protected)/layout.tsx` as commented-out scaffolding. FE-3 un-comments ONLY the `PreviewBanner` line and the `KillSwitchBanner` line — and wires both into the `DashboardShell` slot props. The `NotificationBell` line belongs to FE-1. Do not edit other workers' lines — that's how we avoid merge conflicts on this file.
>
> **Vision References (P0-C — April-25 bridge):**
> - **`/archive`** — Anchor: Linear past-issues list. **Tier 3** motion budget per `docs/08-agents_work/2026-04-25-PER-PAGE-ANIMATION-STRATEGY.md` — instant render after first session, light hover/focus only, no overshoot springs on routine actions.
> - **`/competitors`** — Anchor: Linear list density + Anthropic Console drill table. **Tier 2** — signature animations on movement-alert banner appearance and on 4-week mention-trend updates; no entrance choreography on revisit.
> - **`/settings`** — Anchor: **Stripe Dashboard settings page** (low motion, intentional spacing, tab navigation with crisp focus rings, no overshoot). **Tier 3** daily-page motion budget — light hover/focus only, no celebratory animations on save.
> - **Paywall modal (880px)** — Anchor: Stripe pricing-table modal + Linear upgrade modal. Annual toggle animates with the `snappy` spring preset (per design-lead spring map). Tier-card hover-lift uses the `gentle` preset.
> - **`/onboarding/post-payment`** — Anchor: Stripe checkout-success staged reveal + Things3 empty-state restraint. **Tier 1** motion (first-impression surface, customer rarely sees twice) — full skeleton-draw choreography per `2026-04-25-PER-PAGE-ANIMATION-STRATEGY.md`. The 7-state Day-1 progress UI uses the design-lead `_patterns.md` skeleton designs and hand-drawn aesthetic.
>
> **GEO research stats surfacing (P0-C):** The Paywall modal tier-card body copy must surface the **85% off-site** stat ("85% of GEO impact comes from off-site signals — Build unlocks the Off-Site Reach Builder agent") as a tier-differentiator on Build and Scale cards. Do NOT hide GEO research stats only in agent prompts — they belong on conversion surfaces.
>
> **Hand-drawn aesthetic (P0-C):** The `/onboarding/post-payment` progress UI illustrations use the Rough.js + Excalifont hand-drawn aesthetic from `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION-v2.md` (per design-lead `_patterns.md` deliverable). This REPLACES the deferred Beamie character — do NOT add character / mascot illustrations.

---

## Merge Order

1. Backend Worker 2 (`feat/be-scan-billing`) — most-depended-upon (scan + billing + feature gate)
2. Backend Workers 1 and 3 — parallel
3. Frontend Workers 1, 2, 3 — parallel, in any order

Each PR: Full-tier QA. Adam reviews + merges.

If a backend worker's API contract diverges from `@/lib/types/api`, that's a BLOCK — frontend workers depend on it. CEO catches this in QA gate before merge.

---

## Success Criteria

- [ ] All 6 PRs merged, Full-tier QA passed each
- [ ] Free scan → result → signup → paywall → Paddle sandbox checkout → post-payment flow works end-to-end on staging
- [ ] At least 8 of 11 agents produce non-empty output on golden test cases (per `07-AGENT-ROSTER-V2.md` Pre-Launch Evaluation Criteria)
- [ ] Top-3 suggestions appear on Home after scan
- [ ] Approve flow: suggestion → run → Inbox draft → approve → archive
- [ ] Notification bell shows unread count, marks-read
- [ ] Daily cap enforcement blocks runs after cap hit
- [ ] $19 top-up purchase increases credit balance
- [ ] Upgrade flow (Discover → Build) works via Paddle portal
- [ ] No P0 Sentry errors in 1-hour staging soak

Write session file:
`docs/08-agents_work/sessions/<YYYY-MM-DD>-ceo-wave-1-full-build.md`

Signal Adam: "Wave 1 complete — ready for Wave 2."
