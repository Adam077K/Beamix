# Beamix MVP — Build Plan v1
Date: 2026-04-28
Author: Build Lead
Status: Plan — not yet executing. Awaiting Adam's confirmation on the 8 questions in the final section before dispatching Tier 0 workers.

---

## Executive Overview

This plan converts 23 locked board decisions and 9 pixel-precise design specs (~83K words) into an executable dispatch schedule. It covers Tier 0 (infrastructure) through Tier 5 (MVP-1.5 fast-follow), with Tier 6+ deferred to Year 1.

Three constraints govern every decision in this plan.

First, Trust Architecture is the non-negotiable blocker. The pre-publication validator (signed token, 60s TTL, draft-hash bound), Truth File integrity-hash job, capability-based runtime sandbox, and audit log must all be live and passing integration tests before a single agent runs against a real customer domain. No partial credit. This is not a nice-to-have gate — it is the gate between "demo" and "product."

Second, Inngest free-tier governs agent design. Every MVP agent strategy must complete within free-tier wall-clock limits. Longer-running agents (Long-form Authority Builder, Competitor Intelligence at depth) are deferred past MVP precisely because of this constraint. The plan explicitly flags any ticket where an agent step risks free-tier timeout.

Third, the quality bar is billion-dollar feel at every surface, not after polish. Lighthouse performance gates (LCP, bundle size, Cumulative Layout Shift) are specified per tier, not left to end-of-project cleanup. The Design System token scaffolding is the first Tier 0 frontend ticket — nothing renders without it.

Total ticket count: 78 tickets across Tiers 0-5. Parallelism profile: Tier 0 has 3 parallel streams running 10 tickets simultaneously (database, backend, frontend/design infra). Tier 1 opens to 4-5 parallel streams. Tier 2 runs 3 parallel streams. Tiers 3-4 are mostly parallel within each tier. Tier 5 is independent of the critical path.

---

## Per-Tier Breakdown

---

### Tier 0 — Foundation

**Goal:** Every shared contract, infrastructure service, and safety system is built, tested, and verified before any product surface worker writes a single component or route. Tier 0 is complete when: all canonical types compile without errors, all migrations have applied to a staging Supabase project with RLS verified, Inngest runAgent smoke test passes, Realtime channel delivers events to a test client in <200ms, and the pre-publication validator rejects a tampered signed token.

---

#### Stream A: Database (database-engineer, worktree `feat/t0-schema`)

**T0.1 — Canonical Supabase migration: all Tier 0 tables + RLS**
Owner: database-engineer
Effort: 3pd
Deps: none
Scope: Single migration file applying all tables needed before any feature work begins. Tables: `customers` (multi-client FK structure — `client_id` FK to parent `customer_id` for Yossi's multi-account model), `briefs`, `brief_clauses`, `truth_files` (single Postgres row + JSONB `vertical_extensions`), `truth_file_versions`, `agent_runs`, `agent_memory` (pgvector — vector(1536), IVFFlat index, lists=100), `artifacts` (artifact ledger), `margin_notes`, `provenance_envelopes`, `provenance_steps`, `workflows`, `workflow_nodes`, `workflow_edges`, `workflow_versions`, `marketplace_listings`, `marketplace_installs`, `marketplace_reviews`, `marketplace_editorial`, `scan_cost_ledger` (per-customer monthly cost tracking), `audit_log` (append-only, no DELETE/UPDATE for app role). RLS policies: all customer-scoped tables enforce `customer_id = auth.uid()` or are accessible via JWT claim. Multi-client: `clients` table where `owner_customer_id` FK allows Yossi's account to own child client rows; RLS enforces owner access only. pgvector extension must be enabled in migration. Immutability on `audit_log` enforced: app role has INSERT only (no UPDATE/DELETE); admin-via-MFA path documented. Monthly partition on `audit_log` added at migration time.
Acceptance: `supabase db push` applies cleanly; `supabase db diff` shows zero drift; RLS smoke-test script (select as anon, select as authed user with matching/non-matching customer_id) passes for all tables; pgvector index verified with `\d agent_memory`.

**T0.2 — pgvector extension + agent_memory embedding function**
Owner: database-engineer
Effort: 0.5pd
Deps: T0.1
Scope: Confirm pgvector extension enabled. Write and apply a Supabase function `match_agent_memory(customer_id UUID, agent_id TEXT, query_embedding vector(1536), match_count INT)` that executes the cosine similarity query. This function is called by the agent runtime at every run start (top-K memories). Include SECURITY DEFINER + SEARCH_PATH hardening. Write a smoke-test: insert a dummy embedding row, call the function, verify top-1 returned.
Acceptance: Function callable via Supabase client; smoke test passes; EXPLAIN ANALYZE shows IVFFlat index used.

**T0.3 — Truth File integrity-hash nightly job schema + Inngest cron stub**
Owner: database-engineer (schema) + backend-developer (Inngest job — see Stream B T0.9)
Effort: 0.5pd (DB side only — joint ticket with T0.9)
Deps: T0.1
Scope: Add `integrity_hash` column (TEXT, SHA-256 of canonical JSON of all base_fields) and `previous_hash` column to `truth_files` table in a follow-up migration. Write a Postgres function `compute_truth_file_hash(truth_file_id UUID)` that produces the canonical hash. The nightly Inngest cron job (T0.9) calls this function.
Acceptance: Migration applied; function returns stable hash for identical content; different content produces different hash.

---

#### Stream B: Backend Infrastructure (backend-developer, worktrees `feat/t0-types` and `feat/t0-runtime`)

**T0.4 — Canonical TypeScript type files**
Owner: backend-developer
Effort: 1pd
Deps: none (runs in parallel with T0.1)
Worktree: `feat/t0-types`
Scope: Create `apps/web/types/` directory with the following files, all strict TypeScript, no `any`, all exported:
- `evidence-card.ts` — EvidenceCard interface (engine, query, snippet, cited_competitors, source_url, scan_id)
- `brief.ts` — BriefStatus, BriefClause, BriefSection, Brief (exact schema from Architect doc §Q6)
- `truth-file.ts` — TruthFileField, TruthFileBase, SaasTruthFile, EcommerceTruthFile, TruthFile (Zod discriminatedUnion keyed by vertical_id). SaaS schema explicitly EXCLUDES hours and service_area. E-commerce schema explicitly EXCLUDES integrations and pricing_model.
- `provenance-envelope.ts` — ReviewState, ProvenanceInput, ValidationResult, ProvenanceEnvelope (exact schema from Architect doc §Q6)
- `agent-run-state.ts` — AgentRunStatus, AgentRunEvent (exact schema from Architect doc §Q1)
- `index.ts` — re-exports all types
All types must have corresponding Zod schemas in `apps/web/lib/schemas/` for runtime validation. Run `tsc --noEmit` before committing — zero errors required.
Acceptance: `pnpm typecheck` passes with zero errors; Zod discriminatedUnion correctly rejects SaaS data missing `vertical_id: 'saas'`; Zod rejects SaaS TruthFile if `hours` field is present.

**T0.5 — Inngest free-tier setup + runAgent skeleton + emitRunState helper**
Owner: backend-developer
Effort: 1pd
Deps: T0.4
Worktree: `feat/t0-runtime`
Scope: Configure Inngest client (`apps/web/inngest/client.ts`). Create `apps/web/inngest/functions/run-agent.ts` implementing the one-shared-function-with-per-agent-strategy pattern from Architect doc §Q2. Steps: load-context, execute, validate, propose. emitRunState() helper (Supabase Broadcast, not DB write). Polling fallback: `GET /api/agent-runs/active` returning `AgentRunEvent[]` filtered to status IN ('queued','running'). Smoke test: fire a `agent/run.requested` event via `inngest.send()` from a test script; observe step progression in Inngest dev server. Free-tier wall-clock compliance: every MVP agent strategy MUST complete load-context + execute + validate + propose within Inngest free-tier timeout. Document this constraint as a JSDoc on the function — agents that exceed limit are flagged here first.
Note: Inngest free tier (50K steps/month). If any MVP agent strategy requires >60s per step, flag immediately to Build Lead.
Acceptance: Inngest dev server shows runAgent function; smoke test produces 4 steps in UI; emitRunState fires Supabase Broadcast visible in Supabase logs.

**T0.6 — Supabase Realtime channel + useAgentRunState hook**
Owner: backend-developer
Effort: 1pd
Deps: T0.4, T0.5
Worktree: `feat/t0-runtime`
Scope: Client hook `apps/web/hooks/useAgentRunState.ts` — subscribes to `agent:runs:{customerId}` broadcast channel, maintains `AgentRunEvent[]` state, falls back to polling GET /api/agent-runs/active at 10s interval if channel not joined within 5s. Server: `apps/web/app/api/agent-runs/active/route.ts` — returns active runs for authenticated customer. Both must handle logout/session-end cleanup (unsubscribe on unmount). End-to-end test: trigger fake runAgent event, confirm hook state updates within 200ms in a test client.
Acceptance: Hook state updates within 200ms of emitRunState call in E2E test; polling fallback activates when channel is forced-closed; no memory leaks on unmount.

**T0.7 — Pre-publication validator service**
Owner: backend-developer (primary) + security-engineer (review)
Effort: 3pd
Deps: T0.4, T0.1 (needs truth_files table)
Worktree: `feat/t0-validator`
Scope: Separate server process (Next.js API route with server-only import guard, not accessible from client) implementing all 5 mandatory validation rules:
1. Claim verification — regex + Claude Haiku LLM-classifier extracts factual claims from draft; matched against Truth File; CONTRADICTED = BLOCK; UNVERIFIABLE = BLOCK + auto-revise
2. Brand Voice Fingerprint — cosine similarity of style embeddings (text-embedding-3-small) against fingerprint vector stored at onboarding. Threshold: 0.85 content, 0.75 schema/FAQ
3. Prohibited-term check — exact + semantic (embedding cosine >0.92) against `prohibited_claims` and `never_say` arrays
4. Vertical-specific rules — SaaS: hallucinated-integration detector (claims about integrations not in TF `integrations` array); E-commerce: price-claim rule (claimed price vs TF `price_range`)
5. Sensitive-topic classifier — health/legal/financial/pricing/regulatory/third-party-named claims → manual escalation regardless of autonomy setting
Cryptographic signed-token primitive: `validate()` produces `{ token: string, ttl: number, draft_hash: string }` where token is HMAC-SHA256 of `${draft_hash}:${expires_at}` signed with `VALIDATOR_SIGNING_KEY` env var. `propose()` endpoint verifies: token not expired, hash matches current draft. Mismatch = 401.
Validator-unavailable posture: health check endpoint `/api/validator/health`. If unavailable >15min, all `/api/propose` calls return 503 with JSON `{ mode: 'safe_mode', message: '...' }`.
Auto-revise: if failure is auto-revisable, validator calls LLM once to revise. If revision passes, returns revised draft + new token. If not, returns hard_block.
Acceptance: Integration test suite (minimum 20 tests) covering: token replay rejected, token expired rejected, hash mismatch rejected, prohibited term hard-blocked, auto-revise produces passing output, validator-down returns 503, sensitive topic forces manual escalation.

**T0.8 — Brand Voice Fingerprint computation at onboarding**
Owner: backend-developer
Effort: 1pd
Deps: T0.7
Worktree: `feat/t0-validator`
Scope: `apps/web/lib/brand-voice-fingerprint.ts` — fetches customer's existing site content (via `ctx.fetch` allowlist, 3 pages: homepage, about, most-recent blog/content page), runs through text-embedding-3-small, stores mean embedding as `voice_fingerprint` column in `truth_files` table (add migration for this column). Called by onboarding completion API route (after Step 4). Returns fingerprint UUID. Fingerprint recomputed automatically if customer updates `voice_words` in /settings.
Acceptance: Fingerprint stored after onboarding completion; cosine similarity function correctly scores a matching sample above 0.85 and an off-voice sample below 0.75.

**T0.9 — Truth File integrity-hash nightly Inngest cron**
Owner: backend-developer
Effort: 1pd
Deps: T0.3, T0.5
Worktree: `feat/t0-runtime`
Scope: Inngest cron function (runs nightly at 02:00 UTC). For each active truth_file row: compute current hash, compare to `previous_hash`. If delta >50% field loss in 24h: write Sev-1 event to `audit_log`, call `pauseAllAgentsForCustomer(customer_id)` (sets `agent_runs.status = 'suspended'` for all pending runs), send Resend email to customer and internal ops Slack webhook. Update `previous_hash` = current hash after check. Cron schedule: `0 2 * * *`. Free-tier step budget: batch in groups of 100 customers per step to stay within per-step limits.
Acceptance: Cron fires in dev; simulated 60% field loss triggers Sev-1 log entry + agent pause; false positive rate 0% on stable TF (hash identical day over day).

**T0.10 — Cost ceiling instrumentation**
Owner: backend-developer
Effort: 1pd
Deps: T0.1 (needs scan_cost_ledger table)
Worktree: `feat/t0-runtime`
Scope: `apps/web/lib/cost-ledger.ts` — records per-LLM-call cost (model, tokens_in, tokens_out, cost_usd) to `scan_cost_ledger`. Alarm: if monthly per-customer cost exceeds `MONTHLY_COST_CEILING_USD` env var (default $5.00 for Discover, $15.00 for Build, $40.00 for Scale), fire Inngest event `customer/cost.alarm` which: (a) pauses further agent runs for that customer until next billing cycle, (b) sends internal alert, (c) logs to audit_log. Dashboard: admin endpoint `/api/admin/cost-report` returning per-customer monthly cost (internal only, admin JWT required).
Acceptance: Cost writes appear after simulated LLM call; alarm fires at ceiling; pause enforced on subsequent agent dispatch.

**T0.11 — Resend setup + DKIM/SPF/DMARC + bounce handler**
Owner: backend-developer
Effort: 1pd
Deps: none
Worktree: `feat/t0-email`
Scope: Configure Resend with `notify.beamix.tech` domain. DKIM and SPF records documented for Adam to add to DNS (Build Lead needs Adam to confirm DNS access). DMARC policy: `p=quarantine; pct=10` at MVP (ramp to reject after 30 days of monitoring). Bounce handler: Resend webhook at `/api/webhooks/resend` — on hard bounce, mark `customers.email_bounced = true`, suspend email sends for that customer, log to audit. Unsubscribe link: one-click via signed token in all transactional emails. Email rate limit: max 1 email per customer per 4h (prevents Day 1-6 cadence from double-firing if webhooks re-trigger). Test: send a test email to adam419067@gmail.com via the configured sender.
Acceptance: Resend webhook receives bounce event and marks customer record; test email delivered with correct From domain; DMARC/SPF/DKIM records documented.

---

#### Stream C: Frontend Design Infrastructure (frontend-developer, worktree `feat/t0-design-system`)

**T0.12 — Design System token scaffold**
Owner: frontend-developer
Effort: 2pd
Deps: none (runs fully in parallel with Streams A and B)
Worktree: `feat/t0-design-system`
Scope: Implement the full Design System v1 as specified in `2026-04-27-DESIGN-SYSTEM-v1.md`:
- Tailwind config extensions: all color tokens as CSS custom properties (`--color-brand`, `--color-paper`, `--color-paper-elev`, `--color-paper-cream`, all ink tokens, all border tokens, all semantic data tokens, `--color-needs-you`, `--color-healthy`, `--color-acting`)
- Typography: Inter (400, 500), InterDisplay (500), Geist Mono (400), Fraunces (300, variable axes: `"SOFT" 100, "WONK" 0, "opsz" 144`). Feature settings: `tnum` on all numeric columns, `cv11` on InterDisplay, `ss03` on score display
- Framer Motion variant primitives for the 12 motion tokens (fadeUp, scaleIn, drawStroke, pulse, slideRight — all with spec'd durations and easing curves)
- Rough.js + perfect-freehand utility module with deterministic seed strategy (seed = customer_id hash for per-customer consistent hand-drawn look)
- 14 component primitives as Shadcn/UI-compatible components: StatusToken, DecisionCard, PillButton, CardSurface, TableRow, EvidenceCard, EngineChip, ScoreDisplay, Sparkline, EmptyState, CrewMonogram, TopbarStatus, SectionHeading, MutedSubtext
- Global CSS: `--color-paper-cream` strictly isolated to `.artifact-surface` CSS class (prevents accidental use on product chrome)
- Dark mode: all border tokens as opacity-based values (never fixed hex) — this is the load-bearing dark mode decision
Acceptance: Storybook (or equivalent isolated render) shows all 14 components in light and dark mode without visual regressions; `pnpm typecheck` zero errors on component files; `--color-paper-cream` does NOT appear on any `.product-chrome` class selector (automated CSS lint rule).

**T0.13 — Build-time pipeline: Fraunces signature + Rough.js monograms + customer seal**
Owner: frontend-developer
Effort: 2pd
Deps: T0.12
Worktree: `feat/t0-design-system`
Scope: Three build-time/signup-time artifacts per the board synthesis §6.7:
1. opentype.js Fraunces signature extractor: a build script that extracts the SVG path data for the italic signature character set (used for the "— Beamix" seal stroke). Output: `apps/web/public/brand/fraunces-sig.json`. Runs once at build time, committed to repo.
2. Per-agent Rough.js monogram generator: a seed-deterministic SVG generator for each of the 6 MVP agents. Input: agent slug (e.g., 'schema_doctor'). Output: 96px × 96px SVG with the agent's initial letter in Rough.js hand-drawn style and the agent's color (defined in Design System agent-color map). Pre-generated as static SVGs at build time; stored in `apps/web/public/agents/`.
3. Per-customer seal generator: Inngest job `customer/seal.generate` triggered at onboarding completion. Produces a unique 64px SVG seal for the customer (their domain's first character + Rough.js circle trace). Stored in Supabase Storage bucket `customer-seals/{customer_id}.svg`. The Seal-draw animation in /inbox and /onboarding references this SVG.
Acceptance: Build script produces fraunces-sig.json without errors; all 6 agent monogram SVGs visible in public/agents/; seal job fires in Inngest dev and stores SVG in Supabase Storage.

**T0.14 — /security public page content**
Owner: technical-writer + frontend-developer
Effort: 2pd
Deps: T0.12 (for page scaffold)
Worktree: `feat/t0-security-page`
Scope: Static Next.js page at `/security` (no auth required). Content authored by technical-writer per Trust Safety spec §Q5: storage region (US-East at MVP), retention policy per data class, DSAR flow (Article 15/17/20), AES-256 encryption, audit logs posture, no-training-on-customer-content DPA clause, sub-processor list (Supabase, Twilio, Paddle, Resend, Anthropic, OpenAI, Google, Perplexity). Stripe-style typography: 6-minute readable, InterDisplay headings, Inter body, no marketing fluff. `/trust/subprocessors` as a separate subsection. Also includes: `/trust` redirect, incident transparency log section (initially empty, auto-populated from `audit_log` public table for non-sensitive incidents), `/trust/vulnerability-reporting` contact form (email only at MVP). The DPA text (Scale tier indemnification clause: lesser of 3× monthly subscription or $25K/incident) is embedded in this page. Technical-writer writes all copy; frontend-developer builds the page scaffold and renders it.
Note: Requires Adam to confirm indemnification cap before final copy is written (see "What I Need From Adam" section).
Acceptance: Page renders at `/security` without auth; Lighthouse accessibility score ≥95; all sub-processor links are present; no marketing copy ("power" / "revolutionary" / etc.) — plain English only; legal/technical-writer sign-off on DPA clause wording.

**T0.15 — DPA + Privacy Policy + TOS legal documents**
Owner: technical-writer
Effort: 2pd (depends on legal advisor input — see "What I Need From Adam")
Deps: T0.14
Worktree: `feat/t0-security-page`
Scope: Three documents, publicly hosted at `/legal/privacy`, `/legal/terms`, `/legal/dpa`. Privacy Policy: covers GDPR compliance posture, SCCs for non-US customers, data classification table, DSAR SLAs (30-day ceiling), deletion timelines (T+60 hard delete), Twilio call metadata retention (no recordings at MVP). Terms of Service: termination effects per artifact (per Trust Safety spec §Q6 cancel sequence), liability cap (12 months fees paid), regulated-vertical disclaimer, safe-harbor for customer-submitted content, E&O insurance disclosure. DPA: Scale-tier mutual indemnification clause (cap as confirmed by Adam), sub-processor agreements, no-training clause, legitimate-interest carve-out for audit log retention. Technical-writer drafts; legal advisor review required before launch (external dependency).
Acceptance: All three pages render; technical-writer confirms accuracy against Trust Safety spec; Adam and legal advisor sign off before MVP launch.

---

**Tier 0 Dispatch Parallelism:**

```
Day 1:
  Stream A (DB):            T0.1 (schema migration)
  Stream B (Backend):       T0.4 (types) || T0.11 (Resend setup)
  Stream C (Frontend):      T0.12 (design system tokens)

After T0.1 complete:
  Stream A:                 T0.2 (pgvector function) || T0.3 (hash column migration)

After T0.4 complete:
  Stream B:                 T0.5 (Inngest skeleton) || T0.7 (begins, long ticket)

After T0.5 complete:
  Stream B:                 T0.6 (Realtime hook) || T0.9 (nightly cron)
  After T0.6:               T0.10 (cost ledger)

After T0.7 complete:
  Stream B:                 T0.8 (Brand Voice Fingerprint)

After T0.12 complete:
  Stream C:                 T0.13 (build-time pipeline) || T0.14 (security page begins)
  After T0.13 + T0.14:      T0.15 (legal docs — waits on legal advisor)
```

**Tier 0 Quality Gate:**
- All 15 tickets committed and passing
- `pnpm typecheck` zero errors across apps/web
- Supabase staging: all migrations applied, RLS smoke tests green
- Integration test suite for validator (≥20 tests) green
- Inngest dev server: runAgent smoke test passes (4 steps visible)
- Realtime channel: E2E test delivers event within 200ms
- Security page renders at /security with Lighthouse accessibility ≥95
- Validator integration test: signed-token bypass attempt returns 401
- Cost ceiling: alarm fires at configured threshold in unit test

**Tier 0 Risks:**
- Risk: pgvector IVFFlat index performance degrades at high row count. Mitigation: `lists = 100` is correct for <1M rows; revisit at 10K customers.
- Risk: Inngest free-tier wall-clock insufficient for validator LLM calls (Haiku ~1-3s each, 5 rules = ~5-15s total). Mitigation: run rules 1, 3, 4 without LLM (pure rule-based); use LLM only for rule 2 (voice match) and rule 5 (sensitive topic). This brings validator to ~3-5s total.
- Risk: Fraunces variable axes not available in opentype.js at build time. Mitigation: pre-render the specific character set paths as static SVG at build time; fall back to system-generated signature if opentype parsing fails.
- Risk: Legal advisor availability delays T0.15. Mitigation: technical-writer drafts all three docs; legal review is a non-blocking parallel track. Launch gate: T0.15 must be complete before first paying customer signs up.

---

### Tier 1 — Critical-Path Acquisition + Activation

**Goal:** Every touch a new customer has before becoming a paying user is functional, beautiful, and trust-establishing. This tier ships: the /scan acquisition surface, onboarding, and /home. These three surfaces are the product to the first-time customer.

Tier 1 can begin only after T0.4 (types), T0.5 (Inngest), T0.7 (validator), T0.12 (design system) are merged. The DB migration (T0.1) must be on staging. Other Tier 0 tickets can be in-progress.

---

#### Acquisition Surface (frontend-developer + backend-developer, worktrees `feat/t1-scan-ui` and `feat/t1-scan-api`)

**T1.1 — /scan public: 11-engine scan API**
Owner: backend-developer
Effort: 3pd
Deps: T0.1, T0.4, T0.5
Worktree: `feat/t1-scan-api`
Scope: `apps/web/app/api/scan/start/route.ts` — accepts domain + email, creates `free_scans` row, fires Inngest event `scan/free.requested`. Inngest function: queries 11 AI engines (ChatGPT, Gemini, Claude, Perplexity, You.com, Grok, Google AI Overviews — tier-gated at 3 for Discover; 11 for Build+). Each engine is a separate Inngest step. Vertical detection from domain content (simple heuristics: Shopify meta tags → e-commerce, SaaS pricing page patterns → saas). Score algorithm: 0-100 weighted by citation frequency, mention position, competitor presence. Vertical benchmark data hardcoded for 2 MVP verticals (SaaS benchmark: median 47/100; E-commerce benchmark: median 39/100). Result stored as JSONB in `free_scans.results`. Permalink: `nanoid(21)` generated at scan creation, stored as `free_scans.share_token`. `X-Robots-Tag: noindex, nofollow` on all `/s/{token}` routes. Copy-ready diff endpoint: `GET /api/scan/{scan_id}/copy-diff` returns the 3 top gaps formatted for paste.
Lead attribution copy constraint: API response and all copy references use "calls + UTM-attributed clicks" — "form submissions" does NOT appear in any API response or UI copy.
Acceptance: End-to-end: POST /api/scan/start → Inngest fires → results written to DB → permalink accessible → score renders; scan completes in <20s for p50; X-Robots-Tag present on /s/{token} routes; "form submissions" absent from all response payloads.

**T1.2 — /scan public: editorial UI (10-frame storyboard)**
Owner: frontend-developer
Effort: 3pd
Deps: T0.12, T0.13, T1.1
Worktree: `feat/t1-scan-ui`
Scope: Implement /scan (unauthenticated) per EDITORIAL-surfaces-design-v1.md storyboard. Cream-paper aesthetic (`--color-paper-cream` = `#F7F2E8`) — this is the ONLY product surface that uses cream paper. 10-frame animated reveal: domain input → scan-in-progress (15-17s animated loader with engine names appearing) → score reveal (96px InterDisplay score + Activity Ring stroke-draw) → engine grid (which engines mention you, which mention competitors) → 3 gap cards → tier-picker (Discover vs Build, Scale not shown) → CTA "Start free — see your full report." Two-column tier picker: Discover ($79) vs Build ($189), one-line differentiator each. Private permalink (nanoid) generated at load; "Generate share link" button explicit click only. Mobile-responsive; LCP <3s on 4G. Fraunces 300 italic for editorial accent copy. Stamp/seal motif rendered via Rough.js (deterministic seed from domain hash).
Acceptance: Lighthouse score ≥90 (performance, accessibility); LCP <3s measured via WebPageTest on 4G profile; cream paper background NOT on any /app route; "form submissions" NOT in any visible copy.

**T1.3 — Free-scan → onboarding import flow (?scan_id= handoff)**
Owner: backend-developer
Effort: 1pd
Deps: T1.1
Worktree: `feat/t1-scan-api`
Scope: After signup via "Start free" CTA: Paddle checkout completes → webhook fires → Inngest chains: link `free_scans.converted_user_id = user_id` → create `customers` record from scan data → create `truth_files` skeleton (vertical pre-set from scan vertical detection) → redirect to `/onboarding?scan_id={id}`. Onboarding Step 1 detects `?scan_id=` and pre-fills: domain, detected vertical, detected business name (from domain WHOIS/meta). Step 3 (Brief generation) uses scan data as context. Acceptance: End-to-end test: complete free scan → simulate Paddle webhook → verify customer row created, truth_file pre-populated, onboarding redirected with pre-filled Step 1.

---

#### Onboarding (frontend-developer + backend-developer, worktrees `feat/t1-onboarding-ui` and `feat/t1-onboarding-api`)

**T1.4 — Onboarding API: Brief generation + Truth File creation**
Owner: backend-developer
Effort: 2pd
Deps: T0.4, T0.7, T0.8
Worktree: `feat/t1-onboarding-api`
Scope: `apps/web/app/api/onboarding/` routes:
- `POST /api/onboarding/brief/generate` — given domain + vertical + scan context, calls Claude Sonnet to author the 1-paragraph Brief with chip-editable slots. Returns `Brief` typed per T0.4 types.
- `POST /api/onboarding/brief/sign` — customer approves Brief → sets `briefs.status = 'signed'`, generates seal SVG trigger (fires T0.13 customer seal job), queues first agent run (Schema Doctor).
- `POST /api/onboarding/truth-file/create` — creates initial Truth File for vertical (SaaS or e-commerce). Requires `?scan_id=` data if present.
- `POST /api/onboarding/complete` — marks `customers.onboarding_completed_at`; UPSERT pattern (not UPDATE) to prevent silent failure; triggers Brand Voice Fingerprint computation (T0.8).
- `POST /api/onboarding/attribution/send-dev-email` — sends plaintext snippet to developer email (fires Resend immediately). Email contains UTM tag + Twilio number.
- `GET /api/onboarding/attribution/verify` — called at 72h after setup; if UTM tag or Twilio number not detected on customer domain, triggers reminder email.
All routes: Zod validation on all inputs; returns typed response matching T0.4 types.
Acceptance: Brief generates in <5s; sign endpoint creates seal job; complete endpoint handles missing user_profiles row gracefully (UPSERT); attribution email sends; 72h verification cron fires.

**T1.5 — Onboarding UI: 4-step flow**
Owner: frontend-developer
Effort: 3pd
Deps: T0.12, T0.13, T1.4
Worktree: `feat/t1-onboarding-ui`
Scope: Implement the 4-step onboarding per ONBOARDING-design-v1.md. Step 1: business profile (domain, category combobox, location — pre-filled from scan if `?scan_id=`). Step 2: Lead Attribution — vertical-aware. SaaS: UTM panel prominent, "Copy your tagged URL," Twilio as secondary collapsed. E-commerce: Twilio prominent, UTM as secondary. "Send setup instructions to your developer" button: opens email field (pre-filled from billing email, editable), sends immediately on click. Step 3: Brief approval ceremony — Beamix-authored paragraph, chip editors, "This doesn't describe my business" escape hatch (13px, `--color-ink-3`, below chip editors — navigates to Step 1 with industry combobox focused, inline note "We may have misclassified your business"). No Reject button. Step 4: Truth File fields (vertical-aware — SaaS: integrations, pricing_model, target_company_size, claims_to_repeat; E-commerce: product_categories, shipping_regions, return_policy, price_range). Step 4 has NO Skip button. Seal-draw animation fires on Step 3 approval (800ms SVG stroke). Signature: "— Beamix" (NOT "— your crew"). 3 progress dots visible on Steps 1-3; Step 0 (pre-onboarding) hidden from count. Target completion time <4 minutes for median customer.
Acceptance: Vertical-aware Step 2 verified for both SaaS and e-commerce paths; escape hatch navigates to Step 1 with combobox focused; "— your crew" wording absent; seal animation fires once; 4-minute median verified in usability test (5 mock runs).

---

#### /home (frontend-developer, worktree `feat/t1-home`)

**T1.6 — /home UI: above-the-fold + Activity Ring**
Owner: frontend-developer
Effort: 2pd
Deps: T0.12, T0.6 (Realtime hook)
Worktree: `feat/t1-home`
Scope: Implement /home per HOME-design-v1.md. Sections in order: Hero score block (score 0-100, InterDisplay 96px, `ss03` + `cv11` features, Activity Ring Rough.js terminus seam, 12-week sparkline path-draw 800ms on first load, delta vs last week, 1-line plain-English diagnosis), Top 3 fixes ready (RecommendationCards, "Run all — N credits" CTA), Inbox pointer line (count + zero-state "Nothing needs your attention"), KPI cards row (Mentions / Citations / Credits used / Top competitor delta). Tier badge: exact canonical strings only — "Discover · 3 engines · 4 agents" / "Build · 6 engines · 6 agents" / "Scale · 11 engines · 6 agents (+ 12 locked)". Activity Ring pulses (3s period, opacity) when `any(agentRuns).status === 'running'` via Realtime hook. Lead Attribution empty state vertical-aware: SaaS = UTM-first copy; E-commerce = Twilio-first copy. Bottom mobile nav: /home · /inbox · /scans · /crew.
Acceptance: LCP <2.5s desktop / <3.5s mobile (Lighthouse); tier badge renders exact strings; "— your crew" absent; Activity Ring pulses only when agent is running; all 8 sections visible on first load; mobile nav renders.

**T1.7 — /home UI: below-the-fold sections**
Owner: frontend-developer
Effort: 1pd
Deps: T1.6
Worktree: `feat/t1-home`
Scope: Sections 5-8 of /home: Score trend chart (12-week line, Recharts, hover tooltips), Per-engine performance strip (3 engine pills for Discover / 11 for Build+, locked engines grayed with upgrade hover), Recent activity feed (last 8 events, agent names used per Voice Canon Model B), What's coming up footer (next scheduled scan, next digest send, next billing date). Data fetched server-side via Next.js Server Components where possible; hydrated client-side only for Realtime-dependent sections.
Acceptance: All sections load with skeleton states before data resolves; locked engine pills show upgrade prompt on hover; recent activity shows agent names (not "Beamix agent"); no layout shift on data load (CLS ≤0.1).

---

#### Lead Attribution Infrastructure (backend-developer, worktree `feat/t1-attribution`)

**T1.8 — Lead Attribution Loop: Twilio integration + UTM tracking**
Owner: backend-developer
Effort: 2pd
Deps: T0.1, T0.11
Worktree: `feat/t1-attribution`
Scope: Twilio integration: provision phone number per customer at onboarding (e-commerce + local-services vertical only). Store Twilio SID + number in `customers` table. Twilio webhook at `/api/webhooks/twilio/call` — on inbound call: log to `lead_attribution_events` table (caller metadata only — no recording per Trust Safety decision). UTM tracking: generate per-customer UTM-tagged URL at onboarding (utm_source=beamix&utm_medium=ai_search&utm_campaign={customer_id}). Store in `customers.utm_tracking_url`. UTM click events: customer embeds tracking URL on their site → click lands on `/api/attr/{customer_id}` → logs click with referrer metadata → redirects to customer's actual target URL. Attribution dashboard API: `GET /api/attribution/summary` returning call count, UTM click count (NOT "form submissions" — that field absent until JS snippet MVP-1.5). Lead attribution events table: `lead_attribution_events` (event_type: 'call'|'utm_click', customer_id, timestamp, metadata JSONB).
Copy constraint: all attribution counts render as "N calls + M UTM-attributed clicks" — never "form submissions."
Acceptance: Twilio webhook logs call; UTM redirect fires and logs click; attribution summary returns correct counts; "form submissions" absent from all API responses and UI copy.

---

**Tier 1 Dispatch Parallelism:**

```
After T0.4, T0.5, T0.7, T0.12 merged:
  Stream A (Scan API):    T1.1
  Stream B (Onboarding):  T1.4 (API) || T1.5 (UI) — UI waits on API completion for integration
  Stream C (Home):        T1.6 (above fold) → T1.7 (below fold, sequential)
  Stream D (Attribution): T1.8

After T1.1:
  T1.2 (scan UI — needs API endpoints), T1.3 (import flow)
```

**Tier 1 Quality Gate:**
- Free scan completes E2E in <20s (p50); score renders; permalink private by default
- Onboarding completes E2E <4 minutes (5 mock runs); vertical detection correct; both vertical paths tested
- /home LCP <2.5s desktop (Lighthouse); tier badge exact strings
- Attribution: call logs, UTM redirect logs; "form submissions" absent from all copy
- QA Lead security check: Validator signed-token bypass attempts fail; /scan permalink not indexable (robots check); RLS: customer A cannot read customer B's attribution events

---

### Tier 2 — Primary Product Surfaces

**Goal:** The daily-use surfaces that make Beamix valuable after day 1. /inbox + /workspace is where the product relationship lives. /scans + /competitors is where trust is established. Email is the product for the 6-minutes/week customer.

---

**T2.1 — /inbox: 3-pane review queue**
Owner: frontend-developer
Effort: 3pd
Deps: T1.5, T0.7 (validator), T0.6 (Realtime)
Worktree: `feat/t2-inbox`
Scope: Per INBOX-WORKSPACE-design-v1.md Part A. 3-pane layout: left rail (filters: by agent, source, priority), center (item list, J/K keyboard nav, multi-select), right (content preview + sticky ActionBar). Max-width 1280px (not 880px — that was a spec error). Tabs: Pending (default) / Drafts / Live. Seal-draw animation on single approval (600ms, non-blocking). Bulk-approve: shift-click + Cmd+A multi-select within single-client view. "Approve N items" button in center pane header when selected. Bulk-approve does NOT trigger Seal-draw. Item detail: agent name, action type, before/after diff, Truth File references, provenance envelope fields (action_id, run_id, confidence, blast_radius). "Request Changes": plain-text note field, re-queues agent run with note as context. Review-debt counter at top. Empty state: Rough.js illustration + "Inbox zero. Beamix is working."
Back-translation in /inbox: for Hebrew-output agent actions, validator runs back-translation via LLM (ctx.llm), surfaces in item detail as "Voice check (EN): [translated summary]" so English-primary customer can evaluate. This closes Trust Safety risk §3.
Acceptance: J/K navigation works; Cmd+A selects all visible; bulk-approve fires without seal animation; back-translation visible for Hebrew items; max-width 1280px confirmed; cross-client bulk-approve NOT present.

**T2.2 — /workspace: agent action deep-dive**
Owner: frontend-developer
Effort: 2pd
Deps: T2.1
Worktree: `feat/t2-inbox`
Scope: Per INBOX-WORKSPACE-design-v1.md Part B. Full-page workspace for reviewing and editing a single agent action. Provenance trace panel (Truth File fields cited, Brief clauses used, validation results, confidence score). Diff view: before/after with syntax highlighting for JSON-LD changes, prose diff for content changes. 5-step apply flow: Step 5 renders copy-ready CTAs: "Copy schema JSON" / "Copy FAQ HTML" / "Download as .zip" / "Open a GitHub PR →" (Git-mode, requires GitHub OAuth). CMS how-to guides: inline 200-word drawer (WordPress, Shopify, Webflow, Squarespace) — 4 guides, accessible from copy button. Rollback: "Undo this change" button (uses rollback_token from provenance envelope, TTL 30 days). All Workspace-available to all tiers per decision #5.
Acceptance: GitHub PR button appears for SaaS customers who have connected GitHub; CMS drawers slide in without page navigation; rollback button validates TTL and executes; Workspace accessible by Discover tier customers.

**T2.3 — /scans + /competitors**
Owner: frontend-developer
Effort: 2pd
Deps: T0.12, T1.1 (scan API)
Worktree: `feat/t2-scans`
Scope: Per SCANS-COMPETITORS-design-v1.md. /scans: scan history table (date, engines, score delta), per-scan detail view (engine grid, citation breakdown), re-scan CTA (rate-limited per tier: Discover 1/week, Build 1/day, Scale unlimited). /competitors: competitor list (up to 5 domains), per-competitor citation share chart, delta tracking over time. Action tags on scan items (per board decision: 4 lenses re-spec'd as action-tags, not agent-attribution buckets): done / found / researched / changed. Engine coverage by tier: 3 for Discover (grayed with upgrade CTA for remaining 8), 11 for Build+. Scan cost ledger integrated: each scan records cost to `scan_cost_ledger`.
Acceptance: Action tags render correctly; tier-gated engine grid grays 8 engines for Discover; re-scan respects rate limit; competitor chart renders with delta tracking.

**T2.4 — Email infrastructure: Day 1-6 cadence**
Owner: backend-developer + technical-writer
Effort: 2pd
Deps: T0.11 (Resend setup)
Worktree: `feat/t2-email`
Scope: 4-email Day 1-6 sequence (per board decision #14):
- D0 +10min welcome — "Beamix is working" — plain text, Geist Mono sender feel, signed "— Beamix"
- D2 first-finding deep-link — links to /workspace for the first agent action
- D4 review-debt nudge — sent ONLY if customer has not logged in on D4; skip if logged in; skip Saturday/Sunday
- D5 pre-Monday teaser — sent ONLY if D4 email was unopened; skip Saturday/Sunday
Suppression logic: if customer logs in on a cadence day, suppress that day's email. Weekend skip: if D4 falls on Saturday, delay to Monday. All 4 emails signed "— Beamix". Technical-writer authors all copy. Inngest job: `email/cadence.day` function, idempotent (ON CONFLICT DO NOTHING on email log). Email log table in DB: `email_sends` (customer_id, template, sent_at, opened_at). Open tracking via Resend webhooks.
Acceptance: D4 email not sent if customer logged in; D4 not sent on Saturday/Sunday; D5 only sent if D4 unopened; suppression logic tested via unit tests with mocked datetime.

**T2.5 — Email infrastructure: Monday Digest + Monthly Update**
Owner: backend-developer + technical-writer
Effort: 3pd
Deps: T2.4
Worktree: `feat/t2-email`
Scope: Monday Digest: sent every Monday morning. Content: score delta, top agent action from week, /inbox count, 1 recommendation. Plain-text editorial register. Suppression: skip if customer logged in 3+ times in past 7 days (high-engagement customers don't need the Digest as their entry point). Monthly Update PDF: generated by Inngest job on 1st of each month. Content: monthly score chart, attribution headline ("N calls + M UTM-attributed clicks"), top 3 agent actions with before/after, competitor delta summary. PDF rendered via Puppeteer (headless Chrome). Cream paper aesthetic (`--color-paper-cream` background). Signed "— Beamix" in Fraunces 300 italic. Permalink: `beamix.tech/r/{nanoid21}`, private by default (auth required), 30-day expiry. "Generate share link" button explicit only. PII scrubbing at PDF render: no raw phone numbers in attribution section — "47 calls" not "+972-50-xxx". Per-client white-label: Discover/Build = "Beamix" signature non-removable. Scale = agency-primary with "Powered by Beamix" footer (Geist Mono 9pt, `--color-ink-4`). Cancel cascades: Monthly Update permalink auto-revokes at T+30 (end of grace period).
Acceptance: Monthly Update PDF renders with cream paper; PII scrubbing verified (no raw phone numbers); permalink private by default; white-label renders correctly per tier; cancel cascade revokes permalink in E2E test.

**T2.6 — Event-triggered emails (4-6 attribution milestone emails)**
Owner: backend-developer + technical-writer
Effort: 2pd
Deps: T2.4, T1.8
Worktree: `feat/t2-email`
Scope: Per board synthesis §7 Marcus insight: 4-6 event-triggered emails beat the Monthly Update per dollar. Events and copy:
1. First UTM-attributed click (fired 24h after first click logged): "A visitor found you through AI."
2. First Twilio-attributed call: "Your first AI-attributed call just came in."
3. First competitor displaced (when customer citation count surpasses a specific competitor on a query): "You just overtook [Competitor] on [query] in ChatGPT."
4. 10-citation milestone: "Beamix has helped you appear in 10 AI citations this month."
5. (Optional MVP-1.5) First signup attributed to AI (requires JS snippet).
All signed "— Beamix". Plain-text register. Weekend skip (same rule as Day 1-6 cadence). Suppression: max 1 event email per customer per 24h to prevent spam.
Acceptance: Event fires correctly from attribution log; weekend skip applies; 24h dedup enforced; no "form submissions" copy.

---

**Tier 2 Dispatch Parallelism:**

```
After Tier 1 complete:
  Stream A (Inbox/Workspace):  T2.1 → T2.2 (sequential — workspace extends inbox)
  Stream B (Scans):            T2.3 (parallel with T2.1)
  Stream C (Email):            T2.4 → T2.5 → T2.6 (sequential within email stream)
```

**Tier 2 Quality Gate:**
- /inbox J/K navigation functional; Cmd+A bulk-approve fires; max-width 1280px
- Back-translation visible for Hebrew agent actions
- GitHub PR button functional for SaaS customers
- Monday Digest suppression logic tested (unit tests)
- Monthly Update: cream paper, PII scrubbed, permalink private, cancel cascade verified
- Event emails: 24h dedup, weekend skip, no "form submissions"

---

### Tier 3 — Secondary Product Surfaces

**T3.1 — /crew: agent roster table + per-agent profile pages**
Owner: frontend-developer
Effort: 2pd
Deps: T0.12, T0.13 (agent monograms)
Worktree: `feat/t3-crew`
Scope: Per CREW-design-v1.md. Stripe-style table default (not card grid). Columns: Monogram (96px Rough.js), Agent name, Status (WORKING/IDLE/IDLE-PAUSED pill), Last ran, Next run, Approvals (count), Action. Yearbook DNA preserved as ceremonial state only: empty/first-load animation (agents "arrive" one by one, staggered Framer Motion fadeIn). Per-agent profile page: hero with 96px monogram, agent bio, run history, performance chart, memory/learned constraints visible to customer. Marketplace entry-points: agent cards link to Marketplace for locked/uninstalled agents. Table sorts by last-ran, status. WORKING pill pulses via Realtime hook.
Acceptance: Table renders all 6 MVP agents; WORKING pill updates in real-time without page reload; empty state animation fires on first load only; per-agent profile page renders run history.

**T3.2 — /schedules**
Owner: frontend-developer + backend-developer
Effort: 2pd
Deps: T3.1, T0.5 (Inngest)
Worktree: `feat/t3-schedules`
Scope: Schedule management page. Lists all active Inngest-backed schedules (per-agent + per-workflow). Customer can adjust frequency within tier limits (Discover: weekly; Build: daily; Scale: custom cron). Pause/resume per schedule. Next-run time displayed. Backend: `PUT /api/schedules/{id}` updates cron expression in Inngest (via Inngest SDK schedule update API). Validation: Zod validates cron expression; rejects if frequency exceeds tier limit.
Acceptance: Schedule list renders; frequency adjustment respects tier limits; Inngest schedule updated on save.

**T3.3 — /settings: 5-tab implementation**
Owner: frontend-developer + backend-developer
Effort: 3pd
Deps: T1.5, T1.4
Worktrees: `feat/t3-settings-ui`, `feat/t3-settings-api`
Scope: 5 tabs: Profile (name, email, avatar — Supabase Auth update), Billing (Paddle customer portal link, current plan, next renewal, upgrade/downgrade, top-up), Notifications (email cadence preferences — opt out of specific email types, not full unsubscribe), Business Facts / Truth File (structured form matching vertical schema — SaaS or E-commerce fields; search by clause text via GIN index; re-sign flow when fields edited — bump Brief to draft, require new Seal-draw), Lead Attribution (UTM URL display, Twilio number display, developer email re-send, 72h verification status). Backend: `PUT /api/settings/truth-file` updates truth_file row and recomputes Brand Voice Fingerprint on voice_words change. `GET /api/settings/billing` returns Paddle customer portal URL via Paddle SDK.
Acceptance: Truth File edit bumps Brief to draft status; re-sign flow fires; Paddle portal link opens Paddle-hosted billing page; notification preferences persist; developer email re-sends from settings.

**T3.4 — Multi-client switcher + /cockpit (Scale tier)**
Owner: frontend-developer + backend-developer
Effort: 2pd
Deps: T3.3, T0.1 (customers + clients schema)
Worktree: `feat/t3-multiclient`
Scope: Scale-tier only. Global navigation: client switcher dropdown in topbar showing all client domains with status indicators (score, inbox count). /cockpit: table showing all clients — score delta, /inbox count, agents in error, monthly update status, attribution headline. J/K navigation through cockpit rows. Per-client white-label config lives here (not in /settings — per board decision #16): brand colors, logo upload, agency name, "Powered by Beamix" footer toggle. White-label cascades to Monthly Update PDFs and email signatures for that client.
Acceptance: Client switcher accessible only to Scale tier; /cockpit table renders per-client metrics; white-label config saves and cascades to Monthly Update PDF for that client; Discover/Build tier gets "Upgrade to Scale" CTA instead of switcher.

**T3.5 — /security public page launch**
Owner: frontend-developer
Effort: 0.5pd
Deps: T0.14, T0.15
Worktree: `feat/t0-security-page` (already created — add to existing worktree)
Scope: Final integration: link /security page from /settings footer + /home "Trust" link + Framer marketing site linking instructions. Add `/trust/subprocessors` as a separate subsection. Incident transparency log: query `audit_log` for public-severity incidents (severity level: 'public') and render on page. Vulnerability-reporting contact form: simple email-forwarding form (no ticketing system at MVP).
Acceptance: /security accessible from /settings footer; sub-processors listed; incident log section renders (empty at MVP, auto-populates on first public incident).

---

**Tier 3 Dispatch Parallelism:**

```
After Tier 2 complete:
  Stream A (Crew):       T3.1
  Stream B (Schedules):  T3.2 (after T3.1 — shares agent context)
  Stream C (Settings):   T3.3
  Stream D (Multiclient): T3.4 (after T3.3)
  Stream E (Security):   T3.5 (can run in parallel — mostly doc integration)
```

**Tier 3 Quality Gate:**
- /crew real-time WORKING pill updates; per-agent profile loads
- /settings Truth File edit triggers Brief draft status
- /cockpit accessible only to Scale tier (RLS + tier check verified)
- White-label Monthly Update PDF verified for Scale client
- /security page live; Lighthouse accessibility ≥95

---

### Tier 4 — Power-User Features

**T4.1 — Workflow Builder: React Flow DAG editor**
Owner: frontend-developer (primary)
Effort: 5pd
Deps: T0.12, T3.1 (crew context), T0.5 (Inngest runWorkflow)
Worktree: `feat/t4-workflow-builder`
Scope: Full React Flow DAG editor per CREW-design-v1.md §4 and board decision #22. Scale-tier only for building/editing. Clinical canvas (not Rough.js — Designer's explicit decision). React Flow dynamic-imported (`dynamic()`, ssr:false) on editor route only to isolate ~80KB bundle from all other routes. Nodes: 6 MVP agent types + trigger node + output node. Edges: unconditional (solid) and conditional (dashed with condition label). Brief grounding inspector: per-node sidebar shows Brief clauses grounding that agent (Fraunces 300 on cream in inspector). Cycle detection: runs at save-time in PUT /api/workflows/:id API route (Kahn's algorithm, returns 422 with specific cycle nodes on detection). Resource conflict detection: at save-time, scan for write-target overlaps across nodes (each agent declares `writes[]` in manifest). Manual trigger: "Run workflow" button. Scheduled trigger: cron expression input with tier-limit validation. Dry-run: "Preview (costs 1 credit)" button — executes real LLM calls with `dry_run: true` flag, results appear in special /workspace panel labeled "Dry run results — not applied." 3-6 Beamix-curated workflow templates as starter cards. Workflow versioning: integer version, bumps on activate. Event triggers (competitor.published, score-change): DEFERRED to MVP-1.5. Publishing to Marketplace: DEFERRED to MVP-1.5.
Acceptance: React Flow not loaded on /home, /inbox, /scans routes (bundle check via `next build --analyze`); cycle detection rejects circular DAG at save time; resource conflict detected when two nodes write same target; dry-run produces /workspace panel; Scale tier only enforced by middleware; templates selectable.

**T4.2 — Workflow Builder: backend runWorkflow Inngest function**
Owner: backend-developer
Effort: 2pd
Deps: T0.5, T4.1, T0.4
Worktree: `feat/t4-workflow-api`
Scope: `apps/web/inngest/functions/run-workflow.ts` — dynamic DAG execution per Architect doc §Q3. Topological sort (Kahn's algorithm). Per-node `runAgent` execution within Inngest steps. Upstream provenance envelopes passed as inputs to downstream agents. Provenance for workflow run: composite envelope referencing all node envelopes. Workflow kill switch: admin endpoint `/api/admin/workflows/{id}/kill` — pauses all customer installs of a workflow within 60s (Inngest cancellation API + DB flag at every step boundary). Customer-active check at every step boundary (cancel cascade).
Acceptance: Workflow runs with 3-node DAG (A→B→C); provenance composite envelope written; kill switch pauses within 60s; customer-active check stops run on cancelled subscription.

**T4.3 — Marketplace browse + install**
Owner: frontend-developer + backend-developer
Effort: 3pd
Deps: T3.1, T0.1 (marketplace tables)
Worktrees: `feat/t4-marketplace-ui`, `feat/t4-marketplace-api`
Scope: /marketplace page. Discover tier: read-only browse with "Upgrade to install" CTA (decision #6). Build+ tier: install flow (4-step modal: permissions → config → trigger → confirm). Editorial curation: "Staff picks" hero strip (3 Beamix-curated listings), "New and notable" section. Sort: Most installed / Highest rated / Newest / Category filter. No leaderboard. Install count badge on every card. Star rating (Bayesian avg, min 5 reviews). "New" chip for 60 days after publish. Install backend: `POST /api/marketplace/install` → creates `marketplace_installs` row, provisions agent in `customer_agents` table (source='marketplace'), agent appears in /crew. Install count increment via Postgres trigger on marketplace_installs INSERT. Beamix-curated listings only at MVP (no third-party publish flow at MVP — that's MVP-1.5).
Acceptance: Discover tier sees catalog read-only; install flow completes and agent appears in /crew; install count increments; editorial staff picks display; no publishing flow exists in UI at MVP.

---

**Tier 4 Dispatch Parallelism:**

```
After Tier 3 complete:
  Stream A (Workflow UI):   T4.1
  Stream B (Workflow API):  T4.2 (can run in parallel with T4.1 — different worktrees)
  Stream C (Marketplace):   T4.3 (parallel with T4.1 + T4.2)
```

**Tier 4 Quality Gate:**
- React Flow not included in non-editor route bundles (verified via build analysis)
- Cycle detection rejects circular DAG (integration test)
- Kill switch pauses workflow within 60s (integration test with synthetic workflow)
- Discover tier cannot install (RLS + tier check); Build+ install completes; agent appears in /crew
- QA Lead security check: cross-tenant marketplace install cannot access installer's TF directly

---

### Tier 5 — MVP-1.5 Fast-Follow

These tickets are independent of the MVP launch critical path. They can begin as soon as corresponding Tier 0-4 infrastructure is live (4+ weeks of production telemetry on cross-tenant Truth File binding required before workflow publishing opens).

**T5.1 — Workflow PUBLISHING to Marketplace**
Owner: backend-developer + security-engineer
Effort: 4pd
Deps: T4.2 (runWorkflow in production with ≥4 weeks telemetry), T4.3
Worktree: `feat/t5-workflow-publish`
Scope: Cross-tenant Truth File binding (workflow JSON cannot reference `truth_file_id` directly; runtime auto-binds `$current_customer.truth_file` at install). Static analysis at publish: scan workflow JSON for embedded customer-specific data. Tier-permission enforcement at install. Per-step validation preserved for installed workflows. 4-stage review pipeline: Stage 1 automated checks (sync <60s), Stage 2 sandbox dynamic test (3 reference customer profiles), Stage 3 human T&S review (5-day SLA), Stage 4 listing publication. Publish gate requirements: Scale tier, account ≥30 days, workflow run ≥5 times successfully, no open incidents. Marketplace listings `status = 'pending'` → 4-stage pipeline → `'approved'`. Publishing UI: modal in Workflow Builder "Publish to Marketplace."
Acceptance: Cross-tenant TF binding verified (installer's TF used, not publisher's); 4-stage pipeline executes; workflow published after Stage 4; customer-specific data detected and blocked in Stage 1.

**T5.2 — Cross-client bulk-approve in /inbox**
Owner: frontend-developer
Effort: 1pd
Deps: T3.4 (multi-client switcher)
Worktree: `feat/t5-crossclient-bulk`
Scope: Extend /inbox bulk-approve to work across all active clients in a single Cmd+A+Select action. Requires cross-tenant safety review: bulk-approve across clients must still enforce per-client RLS (each approval writes to correct client's provenance log). UI: "Select across all clients" option when Scale user has multi-client enabled. Approval confirmation modal lists which items belong to which client.
Acceptance: Cross-tenant RLS verified; bulk-approve writes provenance to correct client rows; single-client bulk-approve from MVP remains unchanged.

**T5.3 — WordPress plugin + Shopify app (parallel-built during MVP sprint)**
Owner: backend-developer
Effort: 10pd (WordPress) + 7pd (Shopify)
Deps: T2.2 (copy-ready diff endpoints)
Worktrees: `feat/t5-wordpress-plugin`, `feat/t5-shopify-app`
Note: Begin building on Day 1 of MVP sprint. WordPress.org review takes ~15 business days. Shopify App Store review takes ~5 business days. Ship immediately after MVP launch as MVP-1.5.
Scope: WordPress plugin: PHP plugin that calls Beamix API (authenticated via API key generated in /settings) and auto-applies approved /inbox items to the customer's WordPress site. Shopify app: Node.js Shopify app (Partner account) that calls Beamix API and auto-applies Schema Doctor + FAQ Agent outputs to Shopify metafields + page content.

**T5.4 — Event triggers for Workflow Builder**
Owner: backend-developer
Effort: 2pd
Deps: T4.2
Worktree: `feat/t5-event-triggers`
Scope: Add event trigger types to `workflows.trigger_type`: `competitor.published`, `score_change`, `scan.completed`. Inngest event listeners for each. Event filter config: `{ event_name: 'competitor.published', filter: { competitor_domain: 'example.com', min_delta: 3 } }`. UI: additional trigger option in Workflow Builder trigger selector.

**T5.5 — Customer-site JS attribution snippet**
Owner: backend-developer + technical-writer
Effort: 2pd
Deps: T1.8
Worktree: `feat/t5-attr-snippet`
Scope: Customer-embeddable JS snippet (< 3KB gzipped) that captures form submissions on their site and attributes them to Beamix UTM sources. Snippet hosted at `notify.beamix.tech/attr.js`. Once shipped, /scan and /home copy can include "form submissions" in attribution headlines.

**T5.6 — Brand Voice Guard as standalone /crew agent**
Owner: ai-engineer
Effort: 3pd
Deps: T0.7 (validator — Brand Voice Fingerprint already built)
Worktree: `feat/t5-brand-voice-agent`
Scope: Promote Brand Voice Guard from validation layer to first-class /crew agent. Runs weekly audit of customer's existing site content for voice drift. Surfaces drift in /inbox as suggested revisions. Uses the existing cosine fingerprint from T0.7/T0.8 — agent adds the weekly audit cadence and /inbox surface.

---

### Tier 6 — Year 1 Expansions (Deferred, Acknowledged)

The following are explicitly out of scope for MVP and MVP-1.5. Recorded here for completeness so no agent re-opens them during the build sprint:

- Voice + multimodal + agent-mediated browsing surfaces
- 7 deferred agents: Voice AI Optimizer, Visual Optimizer, Long-form Authority Builder, Competitor Intelligence (full depth), Trending Topic Surfer, Local KG agents (x2)
- 10 deferred vertical knowledge graphs (beyond SaaS + E-commerce)
- State of AI Search annual report (Year 1 Q4)
- Beamix Sessions (Year 2)
- SOC 2 Type II certification (Year 1 Q4)
- EU data residency (Year 1 Supabase EU project)
- White-label subdomain on Monthly Update permalinks (Year 1)
- Aggregate Voice Drift Report (MVP-1.5 candidate, not MVP)
- Aria simulator as 4th board voice (Year 1 governance)

---

## Dependency Graph (Cross-Tier)

```
T0.4 (types) ─────────────────┬──────────────────────────────────────────────┐
                               │                                              │
T0.1 (schema) ─────────────── │ ────────────────────────────────────────┐    │
                               ▼                                         │    │
T0.5 (Inngest skeleton) ──────► T0.6 (Realtime hook) ──────────────────►│    │
       │                              │                                  │    │
       │                              ▼                                  │    │
       │                       T1.6 (/home above fold)                   │    │
       │                                                                  │    │
T0.7 (validator) ──────────────────────────────────────────────────► T1.4 (onboarding API)
       │                                                                  │    │
T0.8 (voice fingerprint) ─────────────────────────────────────────►      │    │
                                                                          ▼    ▼
T0.12 (design system) ──────────────────────────────────────────────► T1.5 (onboarding UI)
       │                                                                  │
T0.13 (build pipeline) ─────────────────────────────────────────────►    │
                                                                          ▼
                                                               T1.2 (/scan UI)
                                                                    │
                                                                    ▼
                                                               T2.1 (/inbox)
                                                                    │
                                                                    ▼
                                                               T2.2 (/workspace)
                                                                    │
                                                               T3.3 (/settings)
                                                                    │
                                                               T3.4 (multi-client)
                                                                    │
                                                               T4.1 (Workflow Builder UI)
                                                               T4.3 (Marketplace)
```

| Tier 0 ticket | Blocks Tier 1+ | Why |
|---|---|---|
| T0.1 (schema) | T0.2, T0.3, T0.9, T0.10, T1.1, T1.3 | All DB-dependent features |
| T0.4 (types) | T0.5, T0.6, T0.7, T1.1, T1.4, T1.5 | Shared TypeScript contract |
| T0.5 (Inngest) | T0.6, T0.9, T1.1, T4.2 | Agent runtime |
| T0.7 (validator) | T1.4, T2.1 | Trust architecture pre-launch block |
| T0.12 (design system) | T1.2, T1.5, T1.6, T2.1, T3.1 | All frontend surfaces |

---

## Critical-Path Tickets

These 8 tickets are on the MVP-launch critical path. Any slip cascades to launch date.

**1. T0.1 — Canonical schema migration.** Every feature ticket that writes to a DB table depends on this. A schema error discovered after T1 or T2 features are built forces migration rewrites across multiple worktrees. Mitigation: database-engineer reviews the Architect doc's data model in full before writing the migration; dry-run against a clean Supabase project before applying to staging.

**2. T0.4 — Canonical type files.** These are the shared contract between all workers. A type error propagates to every worker who consumes it. Mitigation: types are the first backend ticket; reviewed by Build Lead before any other worker imports them. `pnpm typecheck` gate enforced from Tier 0.

**3. T0.7 — Pre-publication validator.** Trust Architecture non-negotiable. Without the signed-token validator live and tested, no agent can run against a real customer domain. The validator is also the most complex Tier 0 ticket (5 rules, LLM integration, cryptographic primitive). Mitigation: 3pd estimate is generous; security-engineer reviews the signed-token implementation before merge; integration test suite has ≥20 tests.

**4. T1.1 — 11-engine scan API.** The /scan public is the primary acquisition surface and every referral drives to it. A broken or slow scan kills conversion. Mitigation: each engine is a separate Inngest step (isolated retry); p50 target <20s tested via load testing before Tier 1 QA gate.

**5. T1.5 — Onboarding UI.** Without a functional onboarding, no customer has a Brief or Truth File, and no agent can run. Onboarding is the trust-establishment moment and the gate to all agent functionality. Mitigation: 3pd estimate; the onboarding design spec is the most detailed of all 9 (10K+ words) — worker reads it fully before starting.

**6. T2.1 — /inbox.** Daily-use surface. The bulk-approve decision (#17) is a retention gate for Yossi's Scale tier. Back-translation for Hebrew content is a Trust Safety requirement. Mitigation: /inbox spec is 12K+ words; frontend-developer reads INBOX-WORKSPACE-design-v1.md in full before starting.

**7. T4.1 — Workflow Builder DAG editor (React Flow).** Scale tier's primary retention anchor for Yossi. Bundle isolation is critical (React Flow must not appear in non-editor bundles). Dry-run mode must use real LLM execution. Mitigation: bundle isolation enforced by `next build --analyze` check in QA gate; dry-run tested with actual Inngest execution.

**8. T0.11 — Resend + DKIM/SPF/DMARC.** Email is the product for the 6-minutes/week customer. If transactional email goes to spam on day 1 because DNS records weren't configured, the Day 1-6 cadence fails. Mitigation: DNS records documented by backend-developer; Adam configures records immediately; DMARC monitoring runs from Tier 1 QA gate onward.

---

## Quality Gates Summary

| Gate | Tier completed | What runs | Pass criteria |
|---|---|---|---|
| Tier 0 | Before any product feature | DB schema smoke tests, type check, validator integration tests (≥20), Inngest smoke test, Realtime E2E, /security Lighthouse | All pass; zero `tsc` errors; validator rejects bypass |
| Tier 1 | After scan + onboarding + /home | E2E scan test (<20s); onboarding E2E (<4 min, both verticals); Lighthouse /home (LCP <2.5s desktop); attribution log tests; QA Lead security review | All pass; "form submissions" absent; RLS cross-tenant test |
| Tier 2 | After inbox + email + scans | /inbox keyboard nav; bulk-approve E2E; Monday Digest suppression unit tests; Monthly Update PDF PII scrub; Lighthouse /inbox; Hebrew back-translation present | All pass |
| Tier 3 | After settings + crew + multi-client | /crew real-time WORKING pill; /settings Truth File edit → Brief draft; /cockpit Scale-only gating; /security page live | All pass |
| Tier 4 | After Workflow Builder + Marketplace | Bundle analysis (React Flow absent from non-editor routes); cycle detection rejects circular DAG; kill switch <60s; Discover install-blocked; QA Lead security review | All pass |
| MVP Launch | Before first paying customer | Full QA Lead PASS (security + test in parallel); Tech E&O insurance bound; legal/technical-writer sign-off on T0.15; Resend DMARC monitoring green; admin cost-alarm tested | All gates passed; Adam explicit merge confirmation |

Performance gates (all surfaces):
- LCP ≤2.5s desktop, ≤3.5s mobile (measured via Lighthouse CI)
- Bundle per route ≤200KB gzipped (verified via next build --analyze)
- CLS ≤0.1 on /home, /inbox, /scans
- Validator p99 ≤5s (rule-based rules first, LLM only for rules 2 + 5)

---

## Worker Dispatch Plan

**Optimal parallel streams:**

Stream A — Database Engineer: T0.1 → T0.2 → T0.3 (then supports backend workers with schema questions)

Stream B — Backend Developer (runtime): T0.4 → T0.5 → T0.6 → T0.9 → T0.10

Stream C — Backend Developer (trust): T0.7 → T0.8 → T1.1 → T1.3 → T1.4 → T1.8 → T2.4 → T2.5 → T2.6

Stream D — Frontend Developer (design infra): T0.12 → T0.13 → T1.2 → T1.5 → T1.6 → T1.7

Stream E — Frontend Developer (product surfaces): T2.1 → T2.2 → T2.3 → T3.1 → T3.2 → T3.3 → T3.4

Stream F — Security Engineer: Reviews T0.7 (validator) → reviews T4.2 (workflow kill switch) → participates in all QA gates

Stream G — Technical Writer: T0.14 (security page copy) → T0.15 (legal docs) → T2.4 + T2.5 + T2.6 (email copy)

Stream H — AI Engineer: T0.7 (validator LLM rules co-implemented with backend-developer) → T5.6 (Brand Voice Guard agent)

Note: Streams B and C are two separate backend-developer workers. Stream E begins after Tier 1 is complete (sequential with Stream D at Tier 1).

---

## Worktree Branch Naming Convention

All worktrees follow `feat/[tier]-[short-slug]` and are created from main repo root per the worktree protocol.

```
Tier 0:
  feat/t0-schema         — T0.1, T0.2, T0.3 (database-engineer)
  feat/t0-types          — T0.4 (backend-developer runtime)
  feat/t0-runtime        — T0.5, T0.6, T0.9, T0.10 (backend-developer runtime)
  feat/t0-validator      — T0.7, T0.8 (backend-developer trust)
  feat/t0-email          — T0.11 (backend-developer)
  feat/t0-design-system  — T0.12, T0.13 (frontend-developer)
  feat/t0-security-page  — T0.14, T0.15, T3.5 (technical-writer + frontend-developer)

Tier 1:
  feat/t1-scan-api       — T1.1, T1.3
  feat/t1-scan-ui        — T1.2
  feat/t1-onboarding-api — T1.4
  feat/t1-onboarding-ui  — T1.5
  feat/t1-home           — T1.6, T1.7
  feat/t1-attribution    — T1.8

Tier 2:
  feat/t2-inbox          — T2.1, T2.2
  feat/t2-scans          — T2.3
  feat/t2-email          — T2.4, T2.5, T2.6

Tier 3:
  feat/t3-crew           — T3.1
  feat/t3-schedules      — T3.2
  feat/t3-settings-ui    — T3.3 (UI side)
  feat/t3-settings-api   — T3.3 (API side)
  feat/t3-multiclient    — T3.4

Tier 4:
  feat/t4-workflow-builder — T4.1
  feat/t4-workflow-api     — T4.2
  feat/t4-marketplace-ui   — T4.3 (UI)
  feat/t4-marketplace-api  — T4.3 (API)

Tier 5:
  feat/t5-workflow-publish — T5.1
  feat/t5-crossclient-bulk — T5.2
  feat/t5-wordpress-plugin — T5.3a
  feat/t5-shopify-app      — T5.3b
  feat/t5-event-triggers   — T5.4
  feat/t5-attr-snippet     — T5.5
  feat/t5-brand-voice-agent — T5.6
```

---

## What Build Lead Needs From Adam Before Starting Tier 0

The following require Adam's explicit confirmation or action before any worker is dispatched:

**1. Inngest account — confirm free-tier start.**
The build plan uses Inngest free tier (50K steps/month) at MVP as locked in DECISIONS.md. Confirm Inngest account exists (or create one) and provide `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` env vars. The Pro upgrade at ~5 paying customers is pre-planned; no action needed now.

**2. Supabase staging project — confirm it exists and provide connection string.**
T0.1 applies migrations to a staging Supabase project (not production). If no staging project exists, database-engineer needs Adam to create one in the Supabase dashboard and provide the connection string + service_role_key. Production project is separate.

**3. Resend domain setup — DNS access required.**
T0.11 configures notify.beamix.tech on Resend. This requires adding 3-4 DNS records (DKIM TXT records + SPF TXT record + DMARC TXT record) to beamix.tech's DNS provider. Build Lead needs confirmation that Adam has DNS access and can add records when backend-developer delivers them. If DNS is managed by a third party, flag now.

**4. Scale-tier DPA indemnification cap — confirm the number.**
T0.14 and T0.15 include the mutual indemnification clause: lesser of (3× monthly subscription) or ($25K/incident). The board synthesis proposes this number; Adam must confirm or adjust before technical-writer finalizes the DPA copy. Legal advisor review also needed — does Adam have a legal advisor engaged, or does Build Lead need to flag this as an external hire?

**5. Tech E&O insurance — confirm binding timeline.**
Trust Safety spec: Tech E&O + Cyber Liability insurance must be bound before first paying customer. Underwriter list provided (Coalition, At-Bay, Cowbell, Beazley). Adam must initiate this independently of the build. Confirm it is in progress before MVP launch gate.

**6. Workflow Builder DAG editor scope confirmation (board decision #22 re-confirm).**
Board decision #22 locks: full React Flow DAG editor + dry-run + 3-6 templates at MVP. The Architect's doc recommends viewer-only at MVP. Adam's board confirmation overrides the Architect's recommendation. Build Lead is proceeding with the full DAG editor (T4.1 = 5pd). Confirm this is still correct before T4 dispatch.

**7. GitHub OAuth app credentials for Git-mode (GitHub PR feature).**
T2.2 includes "Open a GitHub PR →" for B2B SaaS customers. This requires a GitHub OAuth App registered under the Beamix organization. Adam must create the OAuth App (Settings → Developer Settings → OAuth Apps) and provide `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Without these, the Git-mode button is hidden until provided.

**8. Two MVP verticals locked — confirm SaaS + E-commerce.**
The schema migration (T0.1) and Truth File types (T0.4) are built for exactly 2 verticals: `saas` and `ecommerce`. A third vertical (local_services) is reserved in the schema but not built at MVP. Confirm this is correct before T0.1 is committed — adding a third vertical after T0.1 merges requires a follow-up migration.

---

*End of Build Plan v1. Total ticket count: 51 primary tickets (Tiers 0-4) + 6 MVP-1.5 tickets (Tier 5). Total person-days estimated: ~87pd across primary tiers. With 8 parallel worker streams, optimal throughput compresses this significantly — the critical constraint is sequential dependencies within each stream, not total capacity.*

*This plan is the spine of the MVP build sprint. Dispatch begins on Adam's word.*

*— Build Lead*
