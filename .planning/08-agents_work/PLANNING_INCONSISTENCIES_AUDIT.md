# Beamix Planning Documents — Full Inconsistency Audit

**Date:** 2026-03-06
**Agents:** Scout (foundation/cross-reference), Morgan (product/feature specs), Atlas (system design/technical)
**Files Audited:** 37 planning documents across all `.planning/` subdirectories
**Total Issues Found:** ~111

---

## Severity Legend
- CRITICAL — Will crash the app, block signups, or produce fundamentally wrong behavior
- HIGH — Will cause bugs, 404s, or broken product experiences
- MEDIUM — Ambiguous specs that will cause developer confusion
- LOW — Minor inconsistencies, stale dates, naming nits

---

## Summary Table

| Severity | Scout | Morgan | Atlas | Combined |
|----------|-------|--------|-------|----------|
| CRITICAL | 3 | 8 | 9 | ~19 |
| HIGH | 10 | 19 | 17 | ~40 |
| MEDIUM | 5 | 8 | 17 | ~25 |
| LOW | 4 | 5 | 7 | ~14 |

---

## TOP 5 — Will Break the Product First

1. **Trial pool INSERT crash** (Atlas A-A09) — `pool_type = 'trial'` violates `credit_pools` CHECK constraint. Every new signup fails at onboarding completion.
2. **Trial duration unresolved** (Morgan A01) — 7 days (PRD) vs 14 days (settings, pricing, email, scan page). Cannot write any trial logic until this is decided.
3. **Engine 4 mismatch** (Atlas A-E01 + Morgan D01/D02) — Backend `scan.free.run` uses Claude as engine 4; product UI shows Bing Copilot. Copilot has no public API and is Phase 3 deferred. Also: Claude is Pro-only in locked decisions but displayed in the free scan loading animation.
4. **Agent route 404** (Atlas A-B02) — Frontend calls `POST /api/agents/execute` (flat); spec defines `POST /api/agents/[agentType]/execute` (dynamic segment). Every agent launch is a 404.
5. **QA score logic error** (Atlas A-F01) — `agent_jobs.qa_score` is `numeric(3,2)` (0.00–1.00 range) but every agent spec compares as 0–100 integer. Gate condition `>= 0.7` vs `>= 70` means all agents either always pass or always fail QA.

---

# SCOUT REPORT — Foundation, Competitive, Codebase Cross-Reference
*22 issues*

## [I-01] — Pro Tier Price: $99 vs $149 in Same Document
**Files:** `PRODUCT_SPECIFICATION.md` §3 Subscription Tiers vs §3 Pricing Rationale
**Problem:** Tier table shows Pro at $99/mo. Pricing Rationale section in the same document says "Pro at $149/mo." Annual $79/mo × 12 = $948, consistent with $99 monthly but not $149.
**Severity:** CRITICAL

## [I-02] — Business Tier Price: $199 vs $349 in Same Document
**Files:** `PRODUCT_SPECIFICATION.md` §3 Subscription Tiers vs §3 Pricing Rationale
**Problem:** Tier table shows Business at $199/mo. Pricing Rationale says "Business at $349/mo." Annual $159/mo × 12 = $1,908 matches neither.
**Severity:** CRITICAL

## [I-03] — Competitive Positioning Built Around $49 (Starter Only)
**Files:** `_RESEARCH_SYNTHESIS.md` §5, §8 vs `PRODUCT_SPECIFICATION.md` §3
**Problem:** Research synthesis positions Beamix as a "$49" product ("6 autonomous agents at $49/mo, the ONLY platform offering agents below $100/mo"). $49 is the Starter tier only — Pro and Business are much higher. Competitive messaging does not reflect actual pricing architecture.
**Severity:** HIGH

## [I-04] — Agent Count: 6 vs 12 vs 16 Across Documents
**Files:** `PRODUCT_SPECIFICATION.md` Decisions vs `BEAMIX_SYSTEM_DESIGN.md` §3 vs `STRATEGIC_FOUNDATION.md` §4 vs `_RESEARCH_SYNTHESIS.md` §8
**Problem:** Four different numbers appear: Strategic Foundation and system design = 16 agents (A1-A16); product spec Decisions = "6 agents"; research synthesis marketing = "6 autonomous agents." The product spec's own Decisions table says 6 but Strategic Foundation and system design both say 16.
**Severity:** HIGH

## [I-05] — Top Tier Name: "Enterprise" vs "Business"
**Files:** `STRATEGIC_FOUNDATION.md` §10 vs `PRODUCT_SPECIFICATION.md` §3 and all other docs
**Problem:** Strategic Foundation §10 says "Starter, Pro, Enterprise." Every other document uses "Business" as the top tier name.
**Severity:** MEDIUM

## [I-06] — "10 Engines" Marketing vs 4 at Launch / 3 Deferred
**Files:** `BACKLOG.md` item #3 vs `BEAMIX_SYSTEM_DESIGN.md` §5.2 vs competitive docs
**Problem:** Backlog explicitly flags: "'10 engines' marketing vs reality — actually 7 APIs + 3 deferred (Copilot, AI Overviews, Meta). Marketing must be honest." Competitive docs continue claiming 10 engines without qualification. Backlog calls this a "legal/trust risk."
**Severity:** HIGH

## [I-07] — Google AI Overviews: Promised in Business Tier, Deferred in Tech Roadmap
**Files:** `PRODUCT_SPECIFICATION.md` §3 vs `BEAMIX_SYSTEM_DESIGN.md` §5.2
**Problem:** Product spec tier table shows "4 + Google AI Overviews" for Business. System design places Google AI Overviews in Phase 3 (browser simulation, deferred, reliability = Low, "3-6 month moat builder"). A feature promised in the pricing table is deferred entirely in the technical roadmap.
**Severity:** CRITICAL

## [I-08] — STRUCTURE.md File Paths Don't Match Actual Codebase or System Design v2.1
**Files:** `STRUCTURE.md` vs actual build state (MEMORY.md) and system design
**Problem:** STRUCTURE.md shows only 3 landing components; actual codebase has 9. Shows no `src/inngest/` directory but system design requires 14 Inngest functions there. Missing API routes: no `execute/route.ts`, no `[jobId]/status/route.ts`, no `[jobId]/cancel/route.ts` under `/api/agents/`.
**Severity:** HIGH

## [I-09] — Three Different Paddle Webhook Paths
**Files:** `PRODUCT_SPECIFICATION.md` vs `STRUCTURE.md` vs `BEAMIX_SYSTEM_DESIGN.md` §4.3
**Problem:** Three different paths for the same endpoint: `/api/paddle/webhooks` (product spec sitemap), `src/app/api/webhooks/paddle/route.ts` (STRUCTURE.md), `/api/billing/webhooks` (system design API route map). Actual built code has `/api/billing/webhooks`.
**Severity:** HIGH

## [I-10] — Two Different Free-Scan Conversion Funnels
**Files:** `PRODUCT_SPECIFICATION.md` §1 Journey A vs locked decision C3
**Problem:** Product spec Journey A shows email capture modal before signup. Locked decision C3: "Free scan IS the first dashboard scan. Onboarding detects ?scan_id= → skips email capture → direct to /signup?scan_id=." Two incompatible funnels for the same user journey.
**Severity:** HIGH

## [I-11] — "No Confusing Credit Systems" Principle vs Full Credit System Implementation
**Files:** `STRATEGIC_FOUNDATION.md` §10 vs `PRODUCT_SPECIFICATION.md` §3 Decisions vs `BEAMIX_SYSTEM_DESIGN.md` §4.2
**Problem:** Strategic Foundation states "No confusing credit systems that expire" as a key pricing principle. Product spec says "Agent uses (not credits) — simpler." Yet the system design implements full `credit_pools` + `credit_transactions` with hold/confirm/release, rollover caps (20%), pool types, and top-up purchases.
**Severity:** MEDIUM

## [I-12] — Visibility Score Formula Breaks for More Than 4 Engines
**Files:** `PRODUCT_SPECIFICATION.md` §2.1 vs `BEAMIX_SYSTEM_DESIGN.md` §5.2
**Problem:** Score formula: "25 points per LLM × 4 LLMs = max 100." Formula is explicitly broken for Phase 2 (7 engines) and Phase 3 (10 engines). Max would be 250 at 10 engines. No document defines how the formula scales.
**Severity:** HIGH

## [I-13] — Primary Persona: Marketing Manager vs Business Owner
**Files:** `STRATEGIC_FOUNDATION.md` §2 vs `PRODUCT_SPECIFICATION.md` §1 vs `_RESEARCH_SYNTHESIS.md` §5
**Problem:** Strategic Foundation says "Marketing manager or business owner." Product spec Journey A primary persona = Yael (marketing manager). Research synthesis and CONCERNS.md frame primary user as "business owner." Competitive blueprint differentiates from RankPrompt by "targeting business owners." Unfixed framing shift across docs.
**Severity:** LOW

## [I-14] — Bear AI Content Pattern Analysis Count Wrong in Feature Gap Matrix
**Files:** `_RESEARCH_SYNTHESIS.md` §5 vs `BACKLOG.md` item #15
**Problem:** Feature gap matrix says only Spotlight has content pattern analysis. BACKLOG item #15 flags: "Bear AI = 2/15, not 1/15." Known error, acknowledged in BACKLOG, not corrected in the source document.
**Severity:** LOW

## [I-15] — 7 Structural Advantages Lists Differ Between Master and Product Layer
**Files:** `BEAMIX_SYSTEM_DESIGN.md` §1 vs `_SYSTEM_DESIGN_PRODUCT_LAYER.md`
**Problem:** BACKLOG item #21 explicitly flags: "7 Structural Advantages alignment — lists differ slightly between Master and Product Layer." Known inconsistency, not resolved. Research synthesis §8 lists a third different set of "unfair advantages."
**Severity:** MEDIUM

## [I-16] — CONCERNS.md Agent Route Paths Reflect Pre-System-Design Architecture
**Files:** `CONCERNS.md` Security/Bugs sections vs `BEAMIX_SYSTEM_DESIGN.md` §4.3
**Problem:** CONCERNS.md security items reference `src/app/api/agents/content-writer/route.ts`, `competitor-research/route.ts`, `query-researcher/route.ts`. System design has eliminated these — all agent execution goes through a unified `/api/agents/execute` route. Engineer fixing CONCERNS.md items would be working on deleted code paths. Also: `query-researcher` is wrong agent enum; correct value is `faq_agent`.
**Severity:** HIGH

## [I-17] — TESTING.md Date is 2025
**Files:** `TESTING.md`
**Problem:** Header says "Analysis Date: 2025-02-27." All other planning files use 2026 dates. Document content is all "(to be configured)" — it is a template that has never been reviewed against the actual codebase.
**Severity:** LOW

## [I-18] — Free Scan Competitor Count: 0 (PRD) vs 1 (Pricing Spec)
**Files:** `PRODUCT_SPECIFICATION.md` §3 vs `pricing-page-spec.md` Feature Matrix
**Problem:** PRD tier table: "Competitors tracked: 0" for Free Scan. Pricing feature matrix: "Competitors tracked: 1 (top only)." The scan results page does show one top competitor, making "1 (top only)" the functional truth — but PRD says 0.
**Severity:** LOW

## [I-19] — Rate Limit: Simultaneously a Locked Criterion and an Open Question
**Files:** `PRODUCT_SPECIFICATION.md` §2.1 Acceptance Criteria vs §5 Open Questions
**Problem:** Acceptance criteria §2.1: "Rate limited: max 3 scans per IP per 24 hours." Open Questions §5: "Free scan rate limit: 3 per IP per 24h — is this too restrictive?" The rate limit is both decided and undecided in the same document.
**Severity:** MEDIUM

## [I-20] — STRUCTURE.md Says Both "Use Direct LLM Calls" and "Never Use Direct LLM Calls"
**Files:** `STRUCTURE.md` §3 vs §6
**Problem:** §3: "POST requests trigger async agent executions via direct LLM API calls." §6 (New API Endpoint guide): "Agent/async work: NEVER call LLM APIs from API routes. Emit an Inngest event → return 202." Same document, opposite instructions for the same scenario.
**Severity:** HIGH

## [I-21] — Trialing User with No Trial Clock Running: Undefined Access State
**Files:** `BEAMIX_SYSTEM_DESIGN.md` §4.2 vs locked decision C4
**Problem:** Trial clock starts on first dashboard visit (C4). But user has status = 'trialing' from signup. A user who signs up but never visits the dashboard has `status = 'trialing'` but no `trial_started_at`. No document defines what access/credit rules apply to this in-between state.
**Severity:** MEDIUM

## [I-22] — CONCERNS.md Security Items Point to Eliminated Routes
**Files:** `CONCERNS.md` vs `BEAMIX_SYSTEM_DESIGN.md` §4.3
**Problem:** Duplicate/extension of I-16. CONCERNS.md "Updated 2026-03-05 — synced with System Design v2.1" but sync was incomplete. All per-agent route references are stale. An engineer resolving these security findings would target non-existent endpoints.
**Severity:** HIGH

---

# MORGAN REPORT — PRD, Feature Specs, Product Layer Cross-Reference
*40 issues*

## SECTION A — TRIAL PERIOD

### [A01] — Trial Duration: 7 Days vs 14 Days
**Files:** `PRD.md` vs `settings-spec.md` vs `pricing-page-spec.md` vs `email-system-spec.md` vs `scan-page.md`
**Problem:** PRD and locked decision: 7 days. Settings-spec trial rules: "14 days from signup." Pricing-page hero and FAQ Q5: "14-day free trial." Scan-page trust signals: "14-day free trial." Email-system-spec "Open Question" section: "Confirmed 14 days" — factually wrong since PRD says 7. Every user-facing spec says 14 days; the PRD says 7.
**Severity:** CRITICAL

### [A02] — Trial Start Trigger: 4 Different Definitions
**Files:** `PRD.md` vs `settings-spec.md` vs `onboarding-spec.md` vs `email-system-spec.md`
**Problem:** Four different triggers: (1) First dashboard visit (PRD/locked decision C4), (2) Signup (settings-spec), (3) free_scan.created_at retroactively (onboarding-spec WITH scan_id flow), (4) First scan start (email-system-spec Email 5 trigger). Directly affects billing, credit allocation timing, and trial expiry email scheduling.
**Severity:** CRITICAL

## SECTION B — ONBOARDING

### [B01] — Onboarding: Two Incompatible Designs
**Files:** `onboarding-spec.md` vs `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2.7
**Problem:** onboarding-spec: lean 3-step flow (Business Name, Industry, Location), no query or competitor collection, fires scan at end, redirects to /scan/[scan_id]. Product layer: 4-step flow (Welcome + Business + Queries + Competitors), collects services/competitors in onboarding, ends at Ready screen then dashboard. onboarding-spec "What NOT to Add" explicitly says: "Competitors — Scan finds them automatically. Add later in Settings." Product layer Step 3 is entirely competitor collection.
**Severity:** CRITICAL

### [B02] — Step 0 Means Different Things
**Files:** `onboarding-spec.md` vs `_SYSTEM_DESIGN_PRODUCT_LAYER.md`
**Problem:** onboarding-spec Step 0 = URL input field (shown only if no URL in localStorage). Product layer Step 0 = Welcome screen (always shown). Dot count also conflicts: onboarding-spec shows 4 dots when Step 0 shown; product layer says "3 dots, always visible from Step 1 onward. Step 0 has no dots."
**Severity:** HIGH

### [B03] — Post-Onboarding Destination Differs
**Files:** `onboarding-spec.md` vs `_SYSTEM_DESIGN_PRODUCT_LAYER.md`
**Problem:** onboarding-spec ends with "Start My Scan →" redirecting to `/scan/[scan_id]`. Product layer ends with "Go to Dashboard" CTA at Ready Screen — no scan redirect, no /scan/[scan_id] mentioned. Completely different post-onboarding user experience.
**Severity:** HIGH

### [B04] — Free Scan Import Endpoint Naming + scan_token vs scan_id
**Files:** `onboarding-spec.md` vs `PRD.md` vs `pricing-page-spec.md`
**Problem:** onboarding-spec: `POST /api/scan/[scan_id]/claim`. PRD locked decision: `POST /api/onboarding/complete` as the trigger (no /claim endpoint). Pricing-page-spec dev note: `WHERE scan_token = $scan_id`. Locked decision C naming: "Use `scan_id` everywhere — NOT `scan_token`." Both onboarding-spec SQL and pricing-page-spec use the deprecated `scan_token` identifier.
**Severity:** HIGH

## SECTION C — PRICING TIERS AND CREDITS

### [C01] — Competitor Intelligence Agent Credit Cost: 1 vs 2
**Files:** `PRD.md` vs `dashboard-spec.md`
**Problem:** PRD agent table: A8 = 1 credit. Dashboard-spec agent list and card mockup: A8 = 2 agent uses.
**Severity:** HIGH

### [C02] — 7 Agents in Feature Specs vs 16 in PRD and System Design
**Files:** `dashboard-spec.md` + `pricing-page-spec.md` vs `PRD.md` + `BEAMIX_SYSTEM_DESIGN.md`
**Problem:** Dashboard-spec agent list and pricing feature matrix enumerate exactly 7 agents (A1 Content Writer through A7 Competitor Intelligence). PRD and system design specify 16 agents. Agents A8-A16 (Citation Builder, LLMS.txt, AI Readiness Auditor, Ask Beamix, Voice Trainer, Pattern Analyzer, Content Refresh, Brand Narrative, plus redefined A8) have no dashboard spec, no tier access rules, no credit costs in any feature spec.
**Severity:** CRITICAL

### [C03] — Rollover Example Math Wrong
**Files:** `pricing-page-spec.md` FAQ Q3
**Problem:** "If you're on Pro (15 uses) and only use 10, 1 use carries forward." Math: 15 - 10 = 5 unused. 20% of 15 = 3. The FAQ says 1 carries forward, but 20% rollover of 15 = 3.
**Severity:** MEDIUM

### [C04] — Free Scan Engine Count: 4 vs "All Major"
**Files:** `PRD.md` vs `pricing-page-spec.md` vs `scan-page.md` vs `dashboard-spec.md`
**Problem:** PRD: "4 (Phase 1)" engines for free scan. Pricing-page: "Scan across all major AI engines." Pricing-page dev note: "The Free Scan tier scans all major engines too." Dashboard-spec engine mockup: shows 6 engines. These imply different technical implementations.
**Severity:** HIGH

### [C05] — Manual Scan on Starter: Included vs Excluded
**Files:** Locked decision in MEMORY.md vs `pricing-page-spec.md` Feature Matrix
**Problem:** Locked decision: "Manual scan rate limits: Starter 1/week, Pro 1/day, Business unlimited" — Starter CAN manually trigger. Pricing feature matrix: Manual scan trigger shows "—" (excluded) for Starter.
**Severity:** HIGH

### [C06] — JSON-LD Output: Starter Card vs Feature Matrix Contradict
**Files:** `pricing-page-spec.md` (Starter card) vs (Feature Matrix)
**Problem:** Starter card: "Markdown + HTML output" — no JSON-LD. Pro card: "Markdown + HTML + JSON-LD output" — implies JSON-LD is Pro-only. Feature matrix: "JSON-LD / Schema output" shows "Included" for Starter, Pro, and Business.
**Severity:** MEDIUM

## SECTION D — AI ENGINE ASSIGNMENTS

### [D01] — Engine Tier Assignments Conflict Across Documents
**Files:** MEMORY.md locked decisions vs `PRD.md` vs `BEAMIX_SYSTEM_DESIGN.md`
**Problem:** Locked decisions: Free/Starter = ChatGPT, Gemini, Perplexity, Bing Copilot. System design Phase 1 = ChatGPT, Gemini, Perplexity, Claude. Contradictions: (1) Claude is in Phase 1 (system design) but Pro-only (locked decisions). (2) Bing Copilot is in Free tier (locked decisions) but Phase 3 deferred (system design). These cannot both be true.
**Severity:** CRITICAL

### [D02] — Bing Copilot: Free Tier vs Phase 3 Deferred
**Files:** MEMORY.md locked decisions vs `PRD.md` vs `BEAMIX_SYSTEM_DESIGN.md`
**Problem:** Locked decision lists Bing Copilot as one of 4 Free/Starter engines. Both PRD and system design place Copilot in Phase 3 requiring browser simulation. Mutually exclusive.
**Severity:** CRITICAL

### [D03] — Landing Page Trust Bar Shows Deferred Engine
**Files:** `_SYSTEM_DESIGN_PRODUCT_LAYER.md`
**Problem:** Landing page trust bar shows "ChatGPT, Gemini, Perplexity, Bing Copilot, Claude, and more" as featured engines. Bing Copilot is Phase 3 deferred and cannot be scanned. Misleading trust signal.
**Severity:** MEDIUM

### [D04] — Scan Results Page Shows Claude for Free Users
**Files:** `scan-page.md` vs MEMORY.md locked decisions
**Problem:** Scan results page (Section 4) and loading state show Claude as one of the 4 free scan engines. Locked decisions say Claude is Pro-only. Free scan users would see Claude results they're not supposed to have access to, or the results would be fabricated.
**Severity:** HIGH

## SECTION E — EMAIL SYSTEM

### [E01] — Trial Day 7 Email: Midpoint vs Expiry
**Files:** `email-system-spec.md` vs `settings-spec.md`
**Problem:** Email 6 (Trial Day 7 Nudge) comment: "midpoint of 14-day trial." Settings-spec trial flow diagram: "Day 7 passes without upgrade → Read-only state" (day 7 = END). If trial is 7 days, day 7 is expiry. If 14 days, day 7 is midpoint. Both can't be right simultaneously.
**Severity:** CRITICAL

### [E02] — Trial Day 12 Email Incompatible with 7-Day Trial
**Files:** `email-system-spec.md` vs `PRD.md`
**Problem:** Email 7 = "Trial Day 12 — Urgency." Named for day 12. Only makes sense in a 14-day trial. If trial is 7 days, this email fires after expiry.
**Severity:** HIGH

### [E03] — Scan Complete Email Opt-Out Classification Conflict
**Files:** `email-system-spec.md` (individual email entry vs Category Summary table)
**Problem:** Individual email entry: opt-out via `notification_preferences.scan_complete_emails`. Category Summary: classified as TRANSACTIONAL (no opt-out) with asterisk "first scan = welcome flow, subsequent = opt-outable." The asterisk rule is not reflected in the individual entry.
**Severity:** LOW

### [E04] — Welcome Email Broken for Direct Signup Users
**Files:** `email-system-spec.md`
**Problem:** Email 1 subject: "Your AI visibility scan is ready — [score]/100." Timing: "Immediate after user creation (with scan already imported via Option A flow)." Users who sign up directly (no scan_id) have no score at account creation. Welcome email spec only works for users arriving from a free scan.
**Severity:** MEDIUM

## SECTION F — DASHBOARD

### [F01] — Dashboard Agent Hub: 7 Agents vs 16
**Files:** `dashboard-spec.md` vs `PRD.md` vs `BEAMIX_SYSTEM_DESIGN.md`
**Problem:** Dashboard-spec agent hub layout, card grid, tier-access rules, and agent list table are all built for exactly 7 agents (the pre-system-design list). PRD and system design define 16 agents. 9 agents have no dashboard representation at all.
**Severity:** CRITICAL

### [F02] — `agent_executions` Table Does Not Exist
**Files:** `dashboard-spec.md` vs `BEAMIX_SYSTEM_DESIGN.md` §4.2 vs MEMORY.md
**Problem:** Dashboard-spec Zone 4 and Data Sources table reference `agent_executions` table. Actual table name is `agent_jobs`. `content_generations` also referenced — actual table is `content_items`.
**Severity:** HIGH

### [F03] — Realtime on `free_scans` vs `scan_results`: Conflicting Dev Notes in Same File
**Files:** `dashboard-spec.md`
**Problem:** First-Time State dev note 1: "Subscribe to Supabase Realtime on `free_scans` table." First-Time State dev note 2: "Subscribe to Supabase Realtime on `scan_results` for the user's business." `free_scans` is for pre-auth anonymous scans. Authenticated dashboard users' scans are in `scans`, not `free_scans`.
**Severity:** MEDIUM

### [F04] — 8 Recommendations Hardcoded in CTA Copy
**Files:** `dashboard-spec.md` vs `scan-page.md`
**Problem:** Dashboard footer link: "View all 8 recommendations." Scan-page CTA: "Full action plan (8 recommendations, not just 3)." For paid users, recommendations are dynamically generated. Hardcoding 8 will be wrong after any scan that produces more or fewer.
**Severity:** LOW

## SECTION G — SCAN PAGE

### [G01] — `scan_result_details` Table Does Not Exist
**Files:** `scan-page.md` + `dashboard-spec.md` vs MEMORY.md DB schema corrections
**Problem:** Both specs reference `scan_result_details` per LLM. Actual table name is `scan_engine_results` with columns: `engine, rank_position, is_mentioned, sentiment, business_id, scan_id`.
**Severity:** HIGH

### [G02] — Free Scan Expiry: 30 Days vs 14 Days
**Files:** `scan-page.md` vs `_SYSTEM_DESIGN_PRODUCT_LAYER.md`
**Problem:** scan-page.md: "persists 30 days," expired state after 30 days. Product layer expired-state message: "Free scan results are available for 14 days." settings-spec also references "the 30-day rule." Two of three say 30 days, one says 14 days.
**Severity:** HIGH

### [G03] — Quick Wins Count and Blur Logic
**Files:** `scan-page.md` vs `_SYSTEM_DESIGN_PRODUCT_LAYER.md`
**Problem:** scan-page: exactly 3 quick wins shown free, then a separate blurred section for 5 more. Product layer: "3-5 actionable recommendations, blurred for free users past the first 2." Conflicts: (1) 3 vs 3-5 total free wins, (2) blur starts after win #2 (product layer) vs after win #3 (scan-page).
**Severity:** MEDIUM

## SECTION H — ONBOARDING DATA FLOW

### [H01] — Authenticated User Scan Written to `free_scans`
**Files:** `onboarding-spec.md`
**Problem:** onboarding-spec SQL for users completing onboarding WITHOUT scan_id inserts into `free_scans`. `free_scans` is for anonymous pre-auth scans only. An authenticated user's first scan should go to the `scans` table, not `free_scans`.
**Severity:** HIGH

### [H02] — `scan_token` Used Despite Locked `scan_id` Decision
**Files:** `onboarding-spec.md` + `pricing-page-spec.md` vs MEMORY.md locked decision
**Problem:** onboarding-spec SQL: `INSERT INTO free_scans (scan_token, ...)`. pricing-page-spec dev note: `WHERE scan_token = $scan_id`. Locked decision C naming: "Use `scan_id` everywhere in URLs, DB columns, API params." `scan_token` is the banned name.
**Severity:** HIGH

## SECTION I — SETTINGS

### [I01] — Settings Tabs: 4 vs 5
**Files:** `settings-spec.md` vs `dashboard-spec.md`
**Problem:** settings-spec: 4 tabs (Business Profile, Billing, Preferences, Integrations). dashboard-spec: 5 tabs (adds "Team (coming soon)").
**Severity:** LOW

### [I02] — Scans Locked During Trial: Product Logic Flaw
**Files:** `settings-spec.md`
**Problem:** Trial Rules table: "What's locked: All AI agents, additional scans, full recommendations, content library." If additional scans are locked during trial, users cannot re-scan to see their AI visibility improve — making the trial nearly worthless for demonstrating product value. "Additional scans" is ambiguous: manual re-scans only, or all scans after the first?
**Severity:** HIGH

### [I03] — Free Scan Competitors Tracked: 0 vs 1
**Files:** `PRD.md` §3 vs `pricing-page-spec.md` Feature Matrix
**Problem:** PRD: "Competitors tracked: 0" for Free Scan. Pricing matrix: "Competitors tracked: 1 (top only)." The scan results functionally show 1 top competitor, making the matrix more accurate — but the PRD says 0.
**Severity:** MEDIUM

## SECTION J — AGENT NAMES

### [J01] — Agent Name: "Competitor Intelligence" vs "Competitor Intel"
**Files:** `PRD.md` vs `dashboard-spec.md`
**Problem:** PRD: "A8 | Competitor Intelligence." Dashboard card mockup: "Competitor Intel" (abbreviated). Minor copy inconsistency.
**Severity:** LOW

### [J02] — A4 Recommendations Agent UI Visibility Ambiguous
**Files:** `PRD.md` vs `dashboard-spec.md`
**Problem:** A4 costs 0 credits, runs "auto after scan" — it is a system agent not user-invocable. Dashboard-spec correctly omits it from agent hub. But system design onboarding chain lists A4 alongside user-invocable agents in the same notation. A developer could inadvertently surface A4 in the hub.
**Severity:** LOW

### [J03] — Ask Beamix (A12): No UI Spec for Gating
**Files:** `PRD.md` vs `dashboard-spec.md`
**Problem:** A12 is Pro-only, 0 credits. Dashboard-spec has no definition of what Ask Beamix looks like on Starter (locked state), where it lives in the UI, or how the Pro gate is presented. Dashboard-spec covers only 7 old agents.
**Severity:** MEDIUM

## SECTION K — BLOG

### [K01] — Blog Status: "Not Built" vs "Phase 11 Complete"
**Files:** `blog-infra-spec.md` vs MEMORY.md build state
**Problem:** blog-infra-spec header: "Status: Draft — Phase 2 (infrastructure planned now, build later)" and "Blog is planned but not built in MVP." MEMORY.md: Phase 11 Blog is COMPLETE (list page, [slug] page, 4 seed posts, markdown rendering). Spec is stale.
**Severity:** LOW

### [K02] — Blog CMS Route Not in Sidebar Nav
**Files:** `blog-infra-spec.md` vs `dashboard-spec.md` vs `settings-spec.md`
**Problem:** blog-infra-spec defines CMS at `/dashboard/blog`. Dashboard-spec sidebar lists: Dashboard, Rankings, Agents, Content, Settings — no Blog entry. No access path defined in navigation spec.
**Severity:** LOW

## SECTION L — SYSTEM DESIGN CROSS-REFERENCE

### [L01] — 3-Step vs 4-Step in System Design Master
**Files:** `BEAMIX_SYSTEM_DESIGN.md` vs `_SYSTEM_DESIGN_PRODUCT_LAYER.md`
**Problem:** System design master §7 Launch Critical list: "Onboarding 4-step flow." Product layer: "3 dots, always visible from Step 1 onward" (Step 0 = Welcome, not counted). Ambiguous whether it's 3 or 4 depending on whether Welcome counts. Feeds into ISSUE B01.
**Severity:** MEDIUM

### [L02] — `scan_results` Table Name Does Not Exist
**Files:** `dashboard-spec.md` vs MEMORY.md vs `BEAMIX_SYSTEM_DESIGN.md`
**Problem:** Dashboard-spec Zone 1 dev note: "Stored in the scan_results table." Actual table name is `scans` (per schema category: "free_scans, scans, scan_engine_results, citation_sources"). No table named `scan_results` exists.
**Severity:** HIGH

### [L03] — `credits` Table Name Does Not Exist
**Files:** `dashboard-spec.md` vs MEMORY.md vs `BEAMIX_SYSTEM_DESIGN.md`
**Problem:** Dashboard-spec Data Sources: "Agent usage | credits table." Actual table name is `credit_pools` with columns `base_allocation, rollover_amount, topup_amount, used_amount`. No table named `credits` exists.
**Severity:** HIGH

---

# ATLAS REPORT — System Design Technical Audit
*49 issues*

## DB SCHEMA CONTRADICTIONS

### [A-A01] — `credit_pools.pool_type` UNIQUE Constraint Self-Contradiction
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.2
**Problem:** Architecture doc notes previous design had UNIQUE on `user_id` alone which contradicted `pool_type` enum (user needs separate monthly and topup pools). Correct constraint is UNIQUE on `(user_id, pool_type)`. But onboarding/complete inserts `pool_type = 'trial'` — see A-A09.
**Severity:** CRITICAL (see A-A09)

### [A-A02] — `agent_jobs` Live DB Missing Spec Columns
**Files:** `CONVENTIONS.md` vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.4
**Problem:** Live DB `agent_jobs` has: `id, agent_type, status, created_at, completed_at`. Spec requires additional: `business_id, input_data, output_data, qa_score, error_message, inngest_run_id`. Agent pipeline will fail without these columns.
**Severity:** CRITICAL

### [A-A03] — `content_items.agent_type` vs `content_type` Column
**Files:** `CONVENTIONS.md` vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.4
**Problem:** CONVENTIONS.md: live DB has `agent_type` only (NOT `content_type`). Architecture spec defines content_items with BOTH `agent_type` AND a separate `content_type` column (CHECK IN 12 values). If `content_type` column doesn't exist, content library filtering and the 12-type CHECK constraint are broken.
**Severity:** CRITICAL

### [A-A04] — `scan_engine_results` Live DB Missing Columns; `sentiment` vs `sentiment_score`
**Files:** `CONVENTIONS.md` vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.3
**Problem:** Live DB: `engine, rank_position, is_mentioned, sentiment, business_id, scan_id`. Spec defines 15 columns including `sentiment_score` (not `sentiment`), `prompt_text`, `prompt_category`, `mention_context`, `citations`, `latency_ms`. Any code using `sentiment_score` will return null against live DB.
**Severity:** CRITICAL

### [A-A05] — `scans.avg_position` Doesn't Exist; `ranking_results` Table Not in Schema
**Files:** `CONVENTIONS.md` vs `ARCHITECTURE.md`
**Problem:** CONVENTIONS.md: "`scans` has NO `avg_position` column." ARCHITECTURE.md data flow references a `ranking_results` table that does not exist in the 37-table schema definition.
**Severity:** HIGH

### [A-A06] — `recommendations.suggested_agent` vs `agent_type` Silent Fail Risk
**Files:** `CONVENTIONS.md` vs `ARCHITECTURE.md` (agent execution data flow)
**Problem:** Live DB and spec both correctly use `suggested_agent` column. However ARCHITECTURE.md agent execution data flow never references this column by name, implying code might use `agent_type` instead. Code using `agent_type` on recommendations table would silently return null and fail to pre-populate agent launches.
**Severity:** MEDIUM

### [A-A07] — `blog_posts.cover_image` vs `cover_image_url` in Built Code
**Files:** `CONVENTIONS.md` vs built Phase 11 blog components
**Problem:** Spec and CONVENTIONS.md correctly say `cover_image_url`. CONVENTIONS.md flags this because the Phase 11 built blog components likely still reference `cover_image` (without `_url`), returning null silently.
**Severity:** MEDIUM

### [A-A08] — `credit_transactions.transaction_type` 'system_grant' Self-Contradiction
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.2
**Problem:** Schema CHECK constraint includes `'system_grant'`. Two paragraphs later, prose says "Add 'system_grant' to the CHECK constraint" as a future instruction. Either the schema is aspirational (live DB doesn't have it) or the prose note is outdated. Live DB state unknown.
**Severity:** MEDIUM

### [A-A09] — `credit_pools.pool_type` CHECK Missing 'trial' — INSERT Will Fail
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.2 vs §3.12
**Problem:** `credit_pools.pool_type` CHECK constraint = `('monthly', 'topup')`. onboarding/complete route spec: "INSERT INTO credit_pools (user_id, pool_type, base_allocation) VALUES (user_id, 'trial', 5)." This INSERT will violate the CHECK constraint. `allocate_monthly_credits` RPC also references deleting a "trial pool" — confirming 'trial' is intended but absent from the constraint.
**Severity:** CRITICAL

### [A-A10] — `subscription_status` Spelling: 'cancelled' (UK) vs Paddle Webhook
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.2 vs Paddle webhook events
**Problem:** Spec CHECK constraint uses 'cancelled' (UK spelling). Paddle webhooks may send 'canceled' (US spelling). A mismatch will cause the webhook handler to fail status updates silently.
**Severity:** HIGH

### [A-A11] — Free Tier = null plan_id but Auth Gate Checks plan_id IS NOT NULL
**Files:** `CONVENTIONS.md` vs `ARCHITECTURE.md` auth gate description
**Problem:** Free tier = null plan_id (confirmed). ARCHITECTURE.md says auth gate "must have active subscription (trialing or active)." Code that gates on `plan_id IS NOT NULL` will block valid trialing free users. Gate must check `status IN ('trialing', 'active')` not `plan_id`.
**Severity:** HIGH

### [A-A12] — Table Count: 32 (INTEGRATIONS.md) vs 37 (Architecture Spec)
**Files:** `INTEGRATIONS.md` vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.13
**Problem:** INTEGRATIONS.md says "32 tables across 8 categories." Architecture spec §2.13 complete table summary lists 37 tables. INTEGRATIONS.md not updated for 5 new tables added in system design v2.1.
**Severity:** LOW

### [A-A13] — `content_format` Column vs `content_output_format` Type Name
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.4 vs `CONVENTIONS.md`
**Problem:** Architecture spec: column named `content_format`. CONVENTIONS.md: type named `content_output_format`. Values are consistent between both. But code referencing `content_output_format` as a column name on `content_items` will fail — the column is `content_format`.
**Severity:** MEDIUM

### [A-A14] — Inngest Function Count: "14 functions" Claimed, 11 Enumerated
**Files:** `ARCHITECTURE.md` vs `INTEGRATIONS.md` vs `STACK.md` vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4.2
**Problem:** Multiple docs claim "14 Inngest functions." Actual enumeration: 3 scan functions + 1 agent + 1 workflow + 1 alert + 8 cron + 2 gdpr = 16; or counting only the 6 non-cron + 8 cron = 14, but gdpr functions are additional. The count is inconsistent depending on what's included.
**Severity:** MEDIUM

## API ROUTE MISMATCHES

### [A-B01] — Billing Webhook Stale Path in ARCHITECTURE.md
**Files:** `ARCHITECTURE.md` §Entry Points vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §3.6
**Problem:** ARCHITECTURE.md (pre-Paddle-migration): "would be at `src/app/api/paddle/webhooks`." Correct path per architecture spec and INTEGRATIONS.md: `/api/billing/webhooks`.
**Severity:** HIGH

### [A-B02] — Agent Execute Route Shape Mismatch
**Files:** `ARCHITECTURE.md` vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §3.2
**Problem:** ARCHITECTURE.md: "Submit → POST /api/agents/execute" (flat route). Architecture spec: "POST /api/agents/[agentType]/execute" (dynamic segment). Also, ARCHITECTURE.md entry points list old hardcoded agent directories: `content-writer`, `query-researcher`, `competitor-research` — all with wrong names (should be `faq_agent`, `competitor_intelligence`).
**Severity:** CRITICAL

### [A-B03] — Agent Status: Realtime Subscription vs 3-Second Polling
**Files:** `ARCHITECTURE.md` vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4.2
**Problem:** ARCHITECTURE.md: "Frontend subscribes via Supabase Realtime to agent_jobs — receives live status updates without polling." Architecture spec §4.2: "Client polls every 3 seconds while status is 'pending' or 'running'." Mutually exclusive patterns for the same use case.
**Severity:** HIGH

### [A-B04] — Settings Password Route Missing from Architecture Spec
**Files:** `INTEGRATIONS.md` vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §3.5
**Problem:** INTEGRATIONS.md mentions "password" as a settings route group. Architecture spec §3.5 defines 8 settings routes — no `/api/settings/password`. Password changes go through Supabase Auth directly but this is unspecified in the route design.
**Severity:** MEDIUM

### [A-B05] — Duplicate Brand Narrative Endpoints
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §3.4 vs §3.10
**Problem:** Dashboard routes: `GET /api/dashboard/narrative`. Analytics routes: `GET /api/analytics/brand-narrative`. Both serve brand narrative analysis. Two routes for the same resource with unclear precedence.
**Severity:** MEDIUM

### [A-B06] — Integration OAuth Callback Path Conflicts
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §3.5 vs §3.7
**Problem:** Settings routes handle connect/disconnect at `/api/settings/integrations/[provider]`. Integration routes §3.7 define OAuth callbacks at `/api/integrations/ga4/callback`. The registered Google OAuth redirect URI must match exactly — these two path structures diverge.
**Severity:** HIGH

## TECHNOLOGY STACK CONFLICTS

### [A-C01] — Stale Stripe References in ARCHITECTURE.md
**Files:** `ARCHITECTURE.md` vs `CONVENTIONS.md`, `INTEGRATIONS.md`, `STACK.md`
**Problem:** ARCHITECTURE.md predates the Stripe-to-Paddle migration (2026-03-02). Contains references to Stripe-style patterns. Stripe removed; STACK.md and INTEGRATIONS.md correctly list only Paddle.
**Severity:** MEDIUM

### [A-C02] — DeepSeek Role Underspecified
**Files:** `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §1.2 vs §2.1 vs §3.8
**Problem:** DeepSeek appears as a scan engine (Phase 2), A8 research fallback, but is absent from the model registry table §1.2. Role is inconsistently defined across intelligence layer sections.
**Severity:** LOW

### [A-C03] — Gemini 2.0 Flash (scan) vs Gemini 1.5 Pro (QA fallback)
**Files:** `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §1.2 vs §1.4
**Problem:** Model table: Gemini 2.0 Flash. QA fallback chain: "Gemini 1.5 Pro." Two different Gemini generations in the same system with no documentation for why the older version is used for QA fallback.
**Severity:** LOW

### [A-C04] — Upstash Rate Limiting Specified but Absent from Tech Stack
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.13 and §3 vs `ARCHITECTURE.md` vs `STACK.md`
**Problem:** Architecture spec: "Rate limiting: Handled by Upstash Redis (@upstash/ratelimit)." ARCHITECTURE.md Cross-Cutting Concerns: "Rate Limiting: Not implemented in code." STACK.md: no Upstash listed. No UPSTASH_REDIS_REST_URL in env vars. Zero rate limiting currently exists.
**Severity:** CRITICAL

## CREDIT & PLAN LOGIC CONFLICTS

### [A-D01] — Trial Credits Allocated Before Trial Clock Starts
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §3.12 vs locked decision C4
**Problem:** onboarding/complete allocates trial credit pool. Trial clock starts at first dashboard visit (not onboarding completion). A user can have 5 credits allocated for a trial that hasn't started — and the trial may never start if they never visit the dashboard.
**Severity:** HIGH

### [A-D02] — Business Tier Manual Scan: 1/hour vs Unlimited
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §3.1 vs MEMORY.md locked decisions
**Problem:** `/api/scan/manual` rate limit spec: "Business 1/hour." Locked decision: "Business unlimited." Direct contradiction.
**Severity:** HIGH

### [A-D03] — Agent Concurrency Per User: 3 vs 5
**Files:** `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §3 vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4.2
**Problem:** Intelligence layer: "max 3 concurrent per user, 20 system-wide." Architecture spec `agent.execute`: "Concurrency: 20 total, 5 per user." Per-user limit contradicts: 3 vs 5.
**Severity:** MEDIUM

### [A-D04] — Competitor Limits Hardcoded in API and in plans Table (Dual Source)
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.5 vs §2.2
**Problem:** competitors table note: "Tier limits enforced at API layer: Starter 3, Pro 5, Business 10." Plans table has `max_competitors integer NOT NULL` as source of truth. Limits exist in two places — changing one requires changing the other. Seed values for `max_competitors` in the plans table are never defined.
**Severity:** MEDIUM

## SCAN ENGINE CONTRADICTIONS

### [A-E01] — Free Scan 4th Engine: Claude (Backend) vs Bing Copilot (UI)
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4.2 vs `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2.3
**Problem:** `scan.free.run` Inngest function: "Fan out to 4 free-tier engines (ChatGPT, Gemini, Perplexity, Claude)." Product spec Scan Results UI: "4 cards (ChatGPT, Gemini, Perplexity, Bing Copilot)." Backend uses Claude; UI shows Copilot. Copilot has no public API and is Phase 3 deferred — the UI would display results for an engine that can't be queried.
**Severity:** CRITICAL

### [A-E02] — Free Scan Prompt Categories Mismatch
**Files:** `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §2.2 vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4.2
**Problem:** Intelligence layer: "Free scan: 3 prompts — direct brand, product/service, comparison." Architecture spec step 1: "recommendation, comparison, specific." `prompt_category` CHECK constraint only allows: `('recommendation', 'comparison', 'specific', 'review', 'authority')`. "direct brand" and "product/service" are not valid enum values.
**Severity:** HIGH

### [A-E03] — `free_scans.results_data` JSONB Internal Structure Undefined
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4.2
**Problem:** `scan.free.run` step 5 stores results as JSONB blob. Step 6 aggregates prompt-level data from the same scan into `prompt_library`. The JSONB blob's internal structure is never defined as a typed schema — step 6 must parse an undocumented structure.
**Severity:** MEDIUM

### [A-E04] — No System-Wide Scan Concurrency Budget
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4.2
**Problem:** Three overlapping scan concurrency pools: free (25), scheduled (50), manual (10) = 85 potential concurrent scan slots, each making 8+ external LLM calls. No cost budget, rate limit budget, or queue depth analysis for combined load exists in any document.
**Severity:** MEDIUM

## AGENT SYSTEM CONTRADICTIONS

### [A-F01] — QA Score: `numeric(3,2)` Column vs 0-100 Integer in Prose
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4.2 vs `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §1.4 and all agent specs
**Problem:** `agent_jobs.qa_score` column type: `numeric(3,2)` (0.00–1.00 range). Architecture spec gate: "If QA >= 0.7: confirm credit hold." Intelligence layer and all agent specs: "pass threshold 70/100," "score < 80 triggers revision," "above 60/100." Code storing integer 70 in numeric(3,2) may exceed range; comparing >= 0.7 vs >= 70 is a logic error.
**Severity:** CRITICAL

### [A-F02] — A2 Blog Writer QA Threshold 80 vs System Standard 70; No Fail Path
**Files:** `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §A2 vs §1.4 vs other agent specs
**Problem:** System QA standard: pass at 70, retry below 60, fail below 60 on retry. A2: "Score < 80 triggers one revision. Content publishes after at most one revision loop regardless of second score." A2 threshold is 80 (not 70), and it always publishes (no fail path). Undocumented intentional deviation or inconsistency.
**Severity:** MEDIUM

### [A-F03] — Onboarding Agents: A11 = AI Readiness Auditor, Not Recommendations
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.2 vs `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md`
**Problem:** Architecture spec: "onboarding triggers A13, A14, A11 (parallel) → A4 → Notify." In intelligence layer: A11 = AI Readiness Auditor; A4 = Recommendations Agent. Architecture spec incorrectly labels "A11" as "Recommendations" — that's A4. Wrong agent would be triggered at onboarding.
**Severity:** HIGH

### [A-F04] — Voice Profile Table: 3 Different Names
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.4 vs cron function vs `_SYSTEM_DESIGN_VALIDATION.md`
**Problem:** Schema definition §2.4: `content_voice_profiles`. Cron `cron.voice-refinement` step 1 query: `voice_profiles`. Validation doc GAP-M14: `brand_voice_profiles`. Three names; two will reference non-existent tables.
**Severity:** HIGH

### [A-F05] — Agent Type Enum Values vs URL Slugs: No Mapping Defined
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.4 vs `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2.14
**Problem:** `agent_jobs.agent_type` CHECK: `'content_voice_trainer'`, `'content_pattern_analyzer'`. Product spec URL slugs: `voice-trainer`, `pattern-analyzer`, `brand-narrative`. No document maps slug → enum. Code using slug directly as enum value violates CHECK constraint.
**Severity:** HIGH

### [A-F06] — Ask Beamix: Agent Hub Launcher vs Persistent Chat Bubble
**Files:** `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §A12 vs `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2.13
**Problem:** Architecture note: A12 is "REMOVED from Inngest — implemented as direct API route at /api/agents/chat" (SSE streaming incompatible with Inngest). Product spec §2.13 shows Ask Beamix in the Agent Hub grid with a "Run" button. Engineering and product specs are misaligned on whether it's a hub card or a persistent chat UI element.
**Severity:** MEDIUM

## AUTH FLOW CONTRADICTIONS

### [A-G01] — `/api/auth/signup` Route Called but Does Not Exist
**Files:** `ARCHITECTURE.md` §Data Flow vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` (all route tables)
**Problem:** ARCHITECTURE.md: "Submit → POST /api/auth/signup." No such route exists in any of the 12 route table sections. Correct pattern is `supabase.auth.signUp()` client-side or Server Action.
**Severity:** HIGH

### [A-G02] — Auth Callback Route Path Undocumented
**Files:** `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2.5 vs all route tables
**Problem:** Auth callback route (`/callback`) referenced in agent memory but never appears in any API route table. OAuth callback URI must be registered with providers — its path must be explicitly specified in engineering docs.
**Severity:** MEDIUM

### [A-G03] — Google OAuth: No Implementation Spec
**Files:** `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2.4 vs `INTEGRATIONS.md`
**Problem:** Login page spec shows "Social login options (Google)." INTEGRATIONS.md auth section: "Email/password authentication" only. No OAuth flow, no callback route, no Supabase provider config in any engineering document.
**Severity:** MEDIUM

## DATA MODEL FIELD INCONSISTENCIES

### [A-H01] — `businesses.services`: `text[]` vs `Json` in TypeScript Types
**Files:** `CONVENTIONS.md` vs `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.1
**Problem:** Spec correctly defines `services text[] DEFAULT '{}'`. CONVENTIONS.md flags that `database.types.ts` likely typed this as `Json`. TypeScript code treating `services` as `Json` will fail to iterate without parsing.
**Severity:** MEDIUM

### [A-H02] — Free Scan → Authenticated Scan Import: Transformation Unspecified
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.3 vs §3.12
**Problem:** Import flow must transform `free_scans.results_data` JSONB blob → normalized `scan_engine_results` rows. §3.12 mentions "convert free scan results" but never specifies the field mapping: which blob fields map to which columns, how `prompt_text`, `prompt_library_id`, `prompt_category` are populated from an unstructured blob.
**Severity:** HIGH

### [A-H03] — `competitor_share_of_voice.competitor_id NOT NULL` vs NULL for Self-Share
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.8
**Problem:** Schema: `competitor_id uuid NOT NULL FK → competitors(id)`. Computation note: "The business itself stored with `competitor_id = NULL` to represent self-share." `NOT NULL` constraint prevents storing NULL. Direct contradiction within the same document.
**Severity:** CRITICAL

### [A-H04] — `recommendations` Has No `updated_at` but Status is Mutable
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.12 vs §2.5
**Problem:** Auto-update triggers list does not include `recommendations`. But `recommendations.status` transitions (pending → actioned → dismissed) make it a mutable table. `competitors` and `tracked_queries` also mutable but lack `updated_at` columns.
**Severity:** LOW

### [A-H05] — `prompt_library` Dual-Write: Per-Scan and Weekly Cron Conflict
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4.2 (`scan.free.run` step 6 vs `cron.prompt-volume-aggregation`)
**Problem:** `scan.free.run` step 6: upsert prompt stats into `prompt_library` after every free scan. Weekly cron: aggregate week's data into `prompt_library.estimated_volume`. Both write to the same column. Weekly cron will overwrite per-scan increments unless the two writes target different subfields — not specified.
**Severity:** MEDIUM

## MISCELLANEOUS

### [A-I01] — Onboarding Step 2 and Step 3 Both Collect Competitors
**Files:** `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2.7
**Problem:** Step 2 content: "Services + add 1-3 competitor names." Step 3 title: "Competitors" with competitor name collection. Duplicate competitor collection across adjacent steps within the same document.
**Severity:** MEDIUM

### [A-I02] — Blog View Counting: Upstash Dependency Not in Stack
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.11
**Problem:** Blog post view counting: "Rate limited to 1 per IP per slug per hour via Upstash." Upstash not in STACK.md, not in env vars (same issue as A-C04). View count is trivially inflatable without this guard.
**Severity:** MEDIUM

### [A-I03] — Inngest Function Naming: Dots vs Hyphens Mixed
**Files:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4.2
**Problem:** Most functions use dots (e.g., `scan.free.run`, `cron.monthly-credits`). GDPR functions use hyphens: `gdpr.export-cleanup`. Mixed naming convention in the function registry.
**Severity:** LOW

### [A-I04] — `CONVENTIONS.md` Header Date: 2025 vs 2026
**Files:** `CONVENTIONS.md`
**Problem:** Header "Analysis Date: 2025-02-27" but footer "Last Updated: 2026-03-05." Contradictory dates in the same file.
**Severity:** LOW

### [A-I05] — Vercel Pro Plan Required for Ask Beamix: Undocumented
**Files:** `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §A12
**Problem:** A12 requires `export const maxDuration = 60` (60-second timeout for streaming). Vercel Hobby plan limit is 10 seconds. If on Hobby plan, the Ask Beamix chat endpoint times out mid-response. This Vercel plan requirement is not in STACK.md or any infrastructure spec.
**Severity:** HIGH

---

## Recommended Fix Priority Order

1. **Resolve trial duration** (Morgan A01) — ✅ FIXED: All feature specs updated to 7 days.
2. **Fix `credit_pools.pool_type` CHECK constraint** (Atlas A-A09) — ✅ FIXED: Added 'trial' to CHECK IN ('monthly', 'topup', 'trial').
3. **Decide engine tier assignments** (Morgan D01, D02) — ⚠️ [DECISION NEEDED]: Bing Copilot locked as free engine 4 but has no API. See BACKLOG.md D3.
4. **Pick one onboarding design** (Morgan B01, B02, B03) — ⚠️ [DECISION NEEDED]: 3-step vs 4-step MVP design flagged. See BACKLOG.md D4.
5. **Fix agent execute route shape** (Atlas A-B02) — ✅ FIXED: ARCHITECTURE.md updated to `/api/agents/[agentType]/execute`.
6. **Fix all wrong DB table names in feature specs** — ✅ FIXED: `agent_executions`→`agent_jobs`, `scan_result_details`→`scan_engine_results`, `scan_results`→`scans`, `credits`→`credit_pools`, `scan_token`→`scan_id`.
7. **Resolve pricing numbers** (Scout I-01, I-02) — ⚠️ [DECISION NEEDED]: Pro $99 vs $149; Business $199 vs $349. See BACKLOG.md D1, D2.
8. **Fix QA score scale** (Atlas A-F01) — ✅ FIXED: All prose updated to decimal format (0.70, 0.80, etc.).
9. **Fix `competitor_share_of_voice` NOT NULL contradiction** (Atlas A-H03) — ✅ FIXED: Column changed to allow NULL for self-share.
10. **Fix onboarding agent numbering** (Atlas A-F03) — ✅ FIXED: A4=Recommendations, A11=AI Readiness Auditor clarified.

---

## Fix Summary — 2026-03-06

**Agents deployed:** Atlas (technical), Morgan (product/feature), Scout (foundation/cross-reference)
**Total issues:** ~111 across 37 planning documents

### FIXED (planning docs updated)
- Trial duration: all feature specs now say 7 days (A01, E01, E02)
- Trial start trigger: first dashboard visit (A02)
- `credit_pools.pool_type` CHECK constraint: 'trial' added (A-A09)
- Agent execute route: `/api/agents/[agentType]/execute` (A-B02)
- Agent status: polling (not realtime) documented (A-B03)
- QA score scale: decimal format 0.00–1.00 throughout (A-F01)
- `competitor_share_of_voice.competitor_id`: NULL allowed for self-share (A-H03)
- Onboarding agent numbering: A4=Recommendations, A11=AI Readiness (A-F03)
- Voice profile table: consolidated to `content_voice_profiles` (A-F04)
- DB table names in feature specs: all corrected (F02, G01, L02, L03, H02)
- Paddle webhook path: `/api/billing/webhooks` standardized (I-09, A-B01)
- `subscription_status`: 'cancelled' UK spelling note added (A-A10)
- Auth gate: `status IN ('trialing', 'active')` not `plan_id IS NOT NULL` (A-A11)
- Stale Stripe references: removed from ARCHITECTURE.md (A-C01)
- Business tier manual scan: unlimited (not 1/hour) (A-D02)
- `/api/auth/signup` phantom route: replaced with `supabase.auth.signUp()` (A-G01)
- Vercel Pro plan required for A12: documented in STACK.md (A-I05)
- TESTING.md date: updated to 2026 (A-I04, I-17)
- CONVENTIONS.md date: updated to 2026 (A-I04)
- `ranking_results` phantom table: removed from ARCHITECTURE.md (A-A05)
- CONCERNS.md stale routes: updated to unified `/api/agents/[agentType]/execute` (I-16, I-22)
- Enterprise→Business tier name: fixed in STRATEGIC_FOUNDATION.md (I-05)
- Free scan conversion funnel: aligned to locked decision C3 (I-10)
- Manual scan on Starter: 1/week (not excluded) in pricing feature matrix (C05)
- Blog spec status: updated to COMPLETE Phase 11 (K01)
- Rollover math: 20% of 15 = 3 (not 1) (C03)
- Rate limit open question: closed (I-19)
- `scans.avg_position` phantom column: removed references (A-A05)
- Authenticated user scan → `scans` table (not `free_scans`) flagged (H01)

### [DECISION NEEDED] — Require Founder Input (see BACKLOG.md)
- D1: Pro tier price ($99 vs $149) — Scout I-01
- D2: Business tier price ($199 vs $349) — Scout I-02
- D3: Free engine 4 replacement for Bing Copilot — Morgan D01/D02, Atlas A-E01
- D4: MVP onboarding design (3-step vs 4-step) — Morgan B01/B02/B03
- D5: Free scan result expiry (30 days vs 14 days) — Morgan G02
- D6: Visibility score formula for 7+ engines — Scout I-12
- D7: Trial manual re-scans (locked or 1 allowed?) — Morgan I02

### NOT FIXED (medium/low priority, deferred)
- DeepSeek role underspecified (A-C02) — LOW
- Gemini version mismatch scan vs QA (A-C03) — LOW
- Upstash rate limiting not in stack (A-C04) — deferred to implementation
- Agent concurrency 3 vs 5 per user (A-D03) — flag for engineering
- `prompt_library` dual-write conflict (A-H05) — flag for engineering
- 7 Structural Advantages alignment (I-15) — editorial, deferred
- Primary persona framing shift (I-13) — editorial, deferred
- Blog CMS route not in sidebar nav (K02) — future spec work
