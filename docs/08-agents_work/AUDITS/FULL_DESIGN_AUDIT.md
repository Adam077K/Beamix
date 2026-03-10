# Beamix System Design — Full Audit Report

> **Date:** March 5, 2026
> **Team:** Atlas (CTO), Morgan (CPO), Sage (AI Engineer), Rex (Research Analyst), Guardian (QA/Security)
> **Method:** 5-agent parallel audit of all system design documents vs competitive features blueprint
> **Scope:** `.planning/03-system-design/` (5 documents) + `.planning/02-competitive/COMPETITIVE_FEATURES_BLUEPRINT.md`
> **Total issues found: 120**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Blockers — Fix Before Writing Any Code](#2-blockers--fix-before-writing-any-code)
3. [Architecture Layer Audit — Atlas](#3-architecture-layer-audit--atlas)
4. [Product Layer Audit — Morgan](#4-product-layer-audit--morgan)
5. [Intelligence Layer Audit — Sage](#5-intelligence-layer-audit--sage)
6. [Validation Layer Audit — Rex](#6-validation-layer-audit--rex)
7. [Cross-Document Consistency Audit — Guardian](#7-cross-document-consistency-audit--guardian)
8. [Confirmed Accurate Claims](#8-confirmed-accurate-claims)
9. [Competitive Gaps Summary](#9-competitive-gaps-summary)
10. [Master Fix Priority List](#10-master-fix-priority-list)

---

## 1. Executive Summary

| Layer | Auditor | Critical | High | Medium | Low | Total |
|-------|---------|----------|------|--------|-----|-------|
| Architecture | Atlas | 4 | 8 | 9 | 6 | 33 (+ 6 competitive gaps) |
| Product | Morgan | 5 | 7 | 7 | 5 | 24 |
| Intelligence | Sage | 5 | 5 | 6 | 4 | 20 |
| Validation | Rex | 4 | 3 | 5 | 3 | 15 |
| Consistency | Guardian | 2 BLOCKs | 12 WARNs | 14 NOTEs | — | 28 |
| **Total** | | **~20** | **~35** | **~36** | **~18** | **~120** |

**The system design is architecturally sound at its core.** The 32-table schema, 16-agent concept, and platform architecture are solid. The problems are specification gaps, internal contradictions, and 5 false "CLOSED" gap claims. None require rethinking the product — all are fixable in the documents before engineering starts.

**4 issues are BLOCKERs** that will produce a broken system regardless of code quality. These must be resolved first.

---

## 2. Blockers — Fix Before Writing Any Code

### [BLOCK-1] Onboarding Workflow Fires Before Credits Are Allocated
**Source:** Guardian W3 | Atlas A1/A2

The "New Business Onboarding" workflow chain triggers A13 + A14 + A11 in parallel immediately after `onboarding.complete`. These 3 agents each cost 1 credit (3 total). Credits are allocated by `cron.monthly-credits` which runs on the 1st of the month — NOT on signup. A user who signs up on March 15 has zero credits. The credit hold will fail, and all three onboarding agents will silently error out.

**Impact:** Every single new user's post-onboarding agents fail. The dashboard loads with no AI Readiness score, no voice profile, no content patterns. The product's first impression is broken.

**Fix options:**
1. Allocate credits immediately on subscription creation (trigger on `subscriptions` insert), not on month-start cron.
2. Mark onboarding workflow agents as system-initiated (like A4 Recommendations) — bypass credit system entirely. This is the cleanest option.
3. Add a `trigger_monthly_credits` step inside the onboarding Inngest function before queuing agents.

---

### [BLOCK-2] Rate Limiting Is Non-Functional on Vercel Serverless
**Source:** Guardian T2 | Atlas A3

The architecture layer specifies "in-memory rate limit counters" for 5+ routes. The architecture layer's own body text acknowledges this: "in-memory counters do NOT work on Vercel serverless — each function invocation gets a fresh memory space, so counters reset on every request." Despite acknowledging this, the doc says it is "Sufficient for <10K users." That is incorrect — this is a correctness failure, not a performance concern. Every request sees a fresh counter of 0. Rate limiting does not exist.

**Affected routes with zero protection:** `/api/agents/chat` (30/hr), `GET /api/dashboard/*` (60/min), `POST /api/billing/webhooks` (100/min), all general routes (30/min).

**Fix:** Replace all in-memory references with Supabase-based rate limiting (the spec already describes a `rate_limit_counters` table — apply it consistently to ALL rate-limited routes, not just scans). Alternatively, use Vercel KV or Upstash Redis with sliding window.

---

### [BLOCK-3] Credit System RPCs Are Undefined — Financial Core Has No Spec
**Source:** Atlas A1 + A2

Three critical RPC functions (`hold_credits`, `confirm_credit_hold`, `release_credit_hold`) are referenced in 8+ places across the architecture and intelligence layers as the core billing mechanism. None of them are ever defined: no function signature, no locking strategy, no error handling, no idempotency rules, no timeout handling. Additionally, `allocate_monthly_credits(p_user_id, p_plan_id)` is called in 3 places but never defined.

The available credits formula (`base_allocation + rollover_amount + topup_amount - used_amount - held_amount`) spans multiple rows (monthly pool + topup pool). Without a defined RPC with `SELECT ... FOR UPDATE` locking, concurrent agent executions can double-spend credits.

**Impact:** Engineers will make incompatible assumptions about the financial core. Double-billing, under-billing, or permanently stuck "held" credits are likely outcomes.

**Fix:** Add a formal section to the architecture layer defining all 4 RPCs with: function signature, pool deduction order (monthly first, then topup), row-level locking, error codes, and idempotency for Inngest retries.

---

### [BLOCK-4] 3 of 10 Alert Types Have No Evaluation Logic
**Source:** Atlas A4

The `alert_rules.alert_type` DB enum allows 10 values. The `alert.evaluate` Inngest function only defines evaluation logic for 7 of them. Missing: `scan_complete`, `agent_complete`, `trial_ending`. Users can create alert rules for these three types, save them successfully, and receive zero notifications — forever, silently.

**Fix:** Either add evaluation logic for all missing types (scan_complete fires after every scan completion for that business; agent_complete fires after every agent job; trial_ending fires when `trial_ends_at` is within the configured threshold), OR remove these three from the enum if they're handled through other mechanisms (crons, event notifications).

---

## 3. Architecture Layer Audit — Atlas

> **Scope:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md`
> **Reference:** `COMPETITIVE_FEATURES_BLUEPRINT.md`, `BEAMIX_SYSTEM_DESIGN.md`

### Critical Issues

#### [ISSUE-A1] credit_pools UNIQUE Constraint Contradicts Multi-Pool Design
- **File:** Architecture Layer §2.2 (credit_pools)
- **Problem:** The doc states `UNIQUE on (user_id, pool_type)` and explains users need separate monthly and topup pools. The available credits formula treats all amounts as if on a single row: `base_allocation + rollover_amount + topup_amount - used_amount - held_amount`. With two pools per user, this formula must span both rows — but there is no RPC to enforce this atomically. When a credit hold runs, which pool does it deduct from first?
- **Impact:** Credit hold/confirm/release will be inconsistently implemented. Race conditions between concurrent agents could double-spend credits.
- **Fix:** Define `hold_credits`, `confirm_credit_hold`, and `release_credit_hold` as explicit PostgreSQL RPCs with `SELECT ... FOR UPDATE` row-level locking and a defined deduction order (monthly first, then topup). Alternatively, simplify to a single pool per user with separate columns.

#### [ISSUE-A2] Missing RPC Function Definitions (hold/confirm/release)
- **File:** Architecture Layer §2.2, §8.2
- **Problem:** Three critical RPCs are referenced throughout but never defined anywhere: `hold_credits`, `confirm_credit_hold`, `release_credit_hold`. Without atomic RPC definitions, the credit system has no concurrency guarantees.
- **Impact:** Concurrent agent executions can overdraw credits. This is the financial core.
- **Fix:** Add a subsection under §2 defining all three RPCs with: function signature, locking strategy, pool deduction order, error handling (insufficient credits), and transaction isolation level.

#### [ISSUE-A3] In-Memory Rate Limiting Is Impossible on Vercel Serverless
- **File:** Architecture Layer §7.5
- **Problem:** Document acknowledges the issue then says "Sufficient for <10K users" — this is wrong. In-memory rate limiting on serverless means NO rate limiting, not degraded rate limiting. Every request sees a counter of 0 regardless of user count.
- **Impact:** Zero rate protection on `/api/agents/chat`, all dashboard routes, billing webhooks, and general routes.
- **Fix:** Use Supabase-based counters for ALL rate limits. The doc already proposes a `rate_limit_counters` table — apply it consistently, not selectively.

#### [ISSUE-A4] 3 of 10 Alert Types Have No Evaluation Logic
- **File:** Architecture Layer §2.9 vs §8.4
- **Problem:** `alert_type` enum has 10 values. Alert Cycle data flow (§8.4) only defines evaluation logic for 7. Missing: `scan_complete`, `agent_complete`, `trial_ending`.
- **Impact:** Users configure rules that silently never fire.
- **Fix:** Add evaluation logic for all 10 types in §8.4, or remove the 3 types and handle them via existing mechanisms.

---

### High Issues

#### [ISSUE-A5] No `rate_limit_counters` Table in Schema
- **File:** Architecture Layer §7.5
- **Problem:** Section 7.5 proposes a `rate_limit_counters` table but it is not defined in Section 2. Not in the 32-table summary. No columns, indexes, RLS, or cleanup strategy specified.
- **Fix:** Add as table #33 with column definitions, a cleanup cron entry, and a note about no RLS (service-level access only).

#### [ISSUE-A6] scan.free Concurrency Swapped: 50 in Architecture, 20 in Master Doc
- **File:** Architecture Layer §4.2 vs Master Doc §4.4
- **Problem:** Architecture says `scan.free.run` concurrency = 50. Master doc says 20. These describe the same function.
- **Fix:** Align on 20 for Phase 1 (Perplexity's 40 RPM limit and Supabase connection pool make 50 risky).

#### [ISSUE-A7] GDPR Export References Non-Existent Inngest Function
- **File:** Architecture Layer §3.5
- **Problem:** The export endpoint says "Large exports generated async via Inngest." No such Inngest function exists in the 14-function registry.
- **Fix:** Add `data.export` Inngest function: query all user data → serialize to JSON → upload to Supabase Storage → send download link via Resend.

#### [ISSUE-A8] Voice Profile Pipeline: Sonnet in Architecture, Opus in Intelligence Layer
- **File:** Architecture Layer §2.4 vs Master Doc §3 (A13)
- **Problem:** Architecture layer says "sends to Claude Sonnet for voice analysis." Master doc says A13 uses "Opus → Sonnet verify." These describe the same step.
- **Fix:** Align to Opus (quality-critical, justified). Update architecture layer to match intelligence layer.

#### [ISSUE-A9] Users Can Delete `content_items` But Not `agent_jobs`
- **File:** Architecture Layer §7.2 (RLS matrix)
- **Problem:** `content_items` allows user DELETE but `agent_jobs` has no user DELETE policy. Orphaned `agent_jobs` rows grow unbounded per user. No selective cleanup path exists for agent history short of GDPR erasure.
- **Fix:** Add DELETE policy to `agent_jobs` (own rows), or add a retention cron and document the 90-day retention policy.

#### [ISSUE-A10] Workflow Concurrency Conflict Between Docs
- **File:** Architecture Layer §4.2 vs Master Doc §4.4
- **Problem:** Architecture says workflow concurrency is "5 total, 1 per user." Master doc says "2 per user." Mismatched.
- **Fix:** Align to architecture values: 5 total, 1 per user.

#### [ISSUE-A11] Missing `allocate_monthly_credits` RPC Definition
- **File:** Architecture Layer §4.2
- **Problem:** `cron.monthly-credits` calls `allocate_monthly_credits(p_user_id, p_plan_id)`. This RPC is never defined in the architecture layer.
- **Fix:** Document the RPC with parameters and rollover logic (20% cap of base_allocation).

#### [ISSUE-A12] `updated_at` Trigger List Has Wrong Tables
- **File:** Architecture Layer §2.12
- **Problem:** `content_versions` is in the trigger list but has no `updated_at` column (it is append-only). `notification_preferences` and `integrations` have `updated_at` but are missing from the trigger list.
- **Fix:** Remove `content_versions`. Add `notification_preferences` and `integrations`.

---

### Medium Issues

#### [ISSUE-A13] `scan_engine_results` Missing `prompt_library_id` FK
Prompt volume aggregation correlates results back to library entries. Without a FK, it must do text matching — fragile and slow at scale. **Fix:** Add nullable `prompt_library_id uuid FK -> prompt_library(id)` column.

#### [ISSUE-A14] No Index on `notifications.created_at` for Cleanup Cron
The 90-day cleanup does a full table scan. **Fix:** Add `idx_notifications_created` on `(created_at)`.

#### [ISSUE-A15] Public API v1 Has 9 Routes, Master Doc Claims 12
**Fix:** Either reduce to 9 or add the missing 3 (likely: recommendations, citations, alerts).

#### [ISSUE-A16] `free_scans.language` Has No CHECK Constraint
Other tables have `CHECK IN ('en', 'he')`. Free scans don't. **Fix:** Add `CHECK IN ('en', 'he')`.

#### [ISSUE-A17] Dashboard Routes Missing Recommendations Endpoint
The `/dashboard/recommendations` page has no dedicated API route. **Fix:** Add `GET /api/dashboard/recommendations`.

#### [ISSUE-A18] `content_voice_profiles` RLS Description Ambiguous
Policy says "own businesses" but uses both `user_id` and `business_id`. **Fix:** Clarify that RLS uses `user_id = auth.uid()` directly.

#### [ISSUE-A19] `agent_workflows.steps` JSONB Has No Validation
Malformed workflow definitions only fail at runtime, wasting credits. **Fix:** Add Zod schema for the steps array in the API route spec.

#### [ISSUE-A20] Three Cron Jobs Collide on Sunday at 3AM UTC
`cron.cleanup`, `cron.voice-refinement`, and `cron.prompt-volume-aggregation` all run within the same hour on Sundays. **Fix:** Stagger: cleanup at 2AM, voice-refinement at 3AM, prompt-volume at 5AM.

#### [ISSUE-A21] Credit Hold Atomicity Not Guaranteed
Concurrent agents reading `held_amount` before either writes can both succeed even with only enough credits for one. Tied to ISSUE-A2 (undefined RPC). **Fix:** Same as A2.

---

### Low Issues

#### [ISSUE-A22] `blog_posts.view_count` Has No Increment Mechanism
The column exists but no route or cron increments it. **Fix:** Add a server-side increment route or remove the column.

#### [ISSUE-A23] `competitor_scans` Missing Unique Constraint
No constraint prevents duplicate entries for the same (scan_id, competitor_id, engine). **Fix:** Add `UNIQUE (scan_id, competitor_id, engine)`.

#### [ISSUE-A24] `scan_complete` and `agent_complete` Alert Events Not Defined
These alert types need triggering events in the Inngest event schema. **Fix:** Add events or extend `alert/evaluate` payload with a `trigger_source` field.

#### [ISSUE-A25] `businesses.is_primary` Has No Uniqueness Enforcement
Nothing prevents multiple `is_primary = true` per user. **Fix:** Add partial unique index: `UNIQUE (user_id) WHERE is_primary = true`.

#### [ISSUE-A26] API Key `scopes` CHECK Constraint Syntax Won't Compile
`CHECK array elements IN (...)` is not valid PostgreSQL syntax. **Fix:** `CHECK (scopes <@ ARRAY['read', 'write', 'execute']::text[])`.

#### [ISSUE-A27] Notification Cleanup Deletes Unread Alerts
90-day cleanup runs regardless of read status — unread critical alerts can be silently deleted. **Fix:** Only delete read notifications by age, or document the hard 90-day limit.

---

### Competitive Gaps Found by Atlas

| Blueprint Feature | Architecture Status | Severity |
|---|---|---|
| AI Crawler Detection (Cloudflare) | Integration exists, no data model or API | High |
| AI Readiness historical trends | No structured storage — only current score in JSONB blob | Medium |
| GA4 data persistence table | Integration OAuth defined, no table to store fetched data | Medium |
| GSC data persistence table | Same as GA4 — integration without persistence layer | Medium |
| Share of Voice computation | Must be computed on-the-fly — no stored metric or materialized view | Low |
| Anonymous competitor monitoring | `competitor_scans` piggybacks user scans; no independent competitor scan | Low |

---

## 4. Product Layer Audit — Morgan

> **Scope:** `_SYSTEM_DESIGN_PRODUCT_LAYER.md`
> **Reference:** `COMPETITIVE_FEATURES_BLUEPRINT.md`, `BEAMIX_SYSTEM_DESIGN.md`

### Critical Issues

#### [ISSUE-P1] Onboarding Step Count Mismatch — 4 Steps Shown, 3 Dots
- **File:** Product Layer §2.7
- **Problem:** Onboarding has Steps 0-4 (5 total). The spec says "hide Step 0, show 3 dots." This means dots represent Steps 1-3, but Step 4 (Preferences) also exists. Users navigate through 4 visible steps with only 3 progress dots.
- **Impact:** Progress indicator lies. Users don't know they have one more step after dot 3.
- **Fix:** Show 4 dots (Steps 1-4) or merge Steps 3 + 4 into one step. The MEMORY.md note about "3 dots, hide Step 0" needs reconciling with the actual step count.

#### [ISSUE-P2] Agent Chat URL Parameter Inconsistency
- **File:** Product Layer §2.13 vs §2.14 vs master doc page map
- **Problem:** Agent Hub §2.13 links to `/dashboard/agents/[agent_id]`. Page map says `/dashboard/agents/[agentType]`. Journey §4 references `/dashboard/agents/faq`. Three different values for the same URL parameter.
- **Impact:** If built with `agent_id` (DB UUID), Agent Hub cards can't link to Agent Chat without pre-creating a job record. This breaks the "click agent → run it" flow.
- **Fix:** Standardize on `/dashboard/agents/[agentType]` (slug, e.g., `content-writer`). `agent_id` should only appear in the URL for viewing a specific past run.

#### [ISSUE-P3] Free Scan Results Page: Zero Failure State Specification
- **File:** Product Layer §2.3
- **Problem:** No spec for: polling interval, timeout behavior, scan failure state, partial results (some engines done), page refresh resilience, or invalid/expired `scan_id` state. This is the first page every prospect sees.
- **Impact:** A failed or timed-out scan leaves the user on a perpetual loading screen. The funnel is broken.
- **Fix:** Add explicit states: polling (2-3s interval), timeout (90s → failure message), partial results (show completed engines), error state ("couldn't complete — try again"), expired ID ("run a new free scan").

#### [ISSUE-P4] Post-Trial Read-Only State Not Designed on Any Dashboard Page
- **File:** Product Layer §2.15
- **Problem:** Spec mentions "all action buttons disabled" during grace period, but none of the 6 dashboard page specs (§2.8-2.16) describe which elements are disabled vs. visible when `readOnly = true`. Engineers will either miss disabling some buttons or over-disable everything.
- **Impact:** Expired trial users may trigger agents (costing money) or be unable to see data (killing conversion).
- **Fix:** Add a "Trial Expired State" subsection to each dashboard page spec, or create a global "Trial Expired Behavior Matrix" mapping every CTA to its disabled state.

#### [ISSUE-P5] Agent A16 (Brand Narrative Analyst) Missing from Agent Hub
- **File:** Product Layer §2.13
- **Problem:** Agent Hub lists agent categories: Content Creation, Technical, Intelligence, Conversational, NEW agents. The NEW section lists A13, A14, A15. A16 (Brand Narrative Analyst) is fully specified in §5 but does not appear in any Agent Hub category.
- **Impact:** Users cannot discover or run A16 — a key competitive gap closure against AthenaHQ/Spotlight.
- **Fix:** Add A16 to the Intelligence category: "Competitor Intelligence, Review Analyzer, Citation Builder, Brand Narrative Analyst, Recommendations (system)."

---

### High Issues

#### [ISSUE-P6] Notifications/Alerts Page Has No Spec or URL
- **File:** Product Layer §2, §3.6
- **Problem:** Spec defines 9 alert types with in-app delivery via "notification bell," but there is no page spec for `/dashboard/notifications` or `/dashboard/alerts`. Where do users manage alert rules? Where is notification history?
- **Fix:** Add `/dashboard/alerts` page spec with: notification history, alert rule CRUD, per-type channel config, mark-all-read. Add to sidebar nav in §2.8.

#### [ISSUE-P7] Content Library: Pagination, Search, and Bulk Actions Not Specified
- **File:** Product Layer §2.11
- **Problem:** Library lists filters but specifies nothing about pagination (20/page? infinite scroll?), search (by title/content?), sort order, or bulk actions (select multiple → delete/export).
- **Fix:** Add: default sort (newest first), pagination (20/page, load more), search bar (full-text on title), bulk actions (export/delete/change status).

#### [ISSUE-P8] Account Deletion Redirects to `/goodbye` — Not in Page Map
- **File:** Product Layer §2.16
- **Problem:** After deletion, user redirected to `/goodbye`. This route is not in the 23-page map.
- **Fix:** Add `/goodbye` spec (thank you, support link, start fresh CTA) or redirect to landing page with a toast.

#### [ISSUE-P9] Sidebar Navigation Inconsistent with Page Map
- **File:** Product Layer §2.8
- **Problem:** Empty states table references an "Analytics" page and a "Credits" page not in the sidebar. The bell icon has no destination page in the navigation spec.
- **Fix:** Create a definitive sidebar nav spec that exactly matches the page map.

#### [ISSUE-P10] Looker Studio Contradiction: Included in Product Layer, Explicitly Skipped in Master Doc
- **File:** Product Layer §3.7 vs Master Doc §6
- **Problem:** Product Layer lists Looker Studio as integration I6 with Business tier. Master doc marks it "Intentional skip."
- **Fix:** Resolve: if skipped, remove from §3.7. If included, update master doc gap closure table.

#### [ISSUE-P11] Agent Workflow Builder Full Spec Not Marked Post-Launch
- **File:** Product Layer §5 (Agent Workflow System)
- **Problem:** §2.13 correctly defines MVP as 4 toggle-based workflows. §5 describes a full visual builder with conditional branches. §5 has no "Phase 3" marker. Engineers will build the full builder for launch.
- **Fix:** Add "Phase: Post-Launch (Phase 3)" label to §5. Keep it as vision doc only.

#### [ISSUE-P12] Ask Beamix (A12) Floating Bubble Not in Dashboard Layout Spec
- **File:** Product Layer §5 (A12 spec), §2.8
- **Problem:** A12 is "accessible from every dashboard page via a persistent floating chat bubble" but no dashboard page spec mentions the bubble. It needs to be in the layout wrapper, not individual page specs.
- **Fix:** Add "Ask Beamix floating chat bubble (see A12 spec)" to the dashboard layout section in §2.8.

---

### Medium Issues

#### [ISSUE-P13] Free Scan Shows "AI Readiness Score" But A11 Full Audit Can't Run in 30-60s
The free scan spec shows a "5-category AI readiness breakdown." A11 requires a 50-page crawl. **Fix:** Clarify free scan uses a lightweight readiness check (robots.txt, schema presence, meta tags) — NOT the full A11 audit.

#### [ISSUE-P14] Content Editor Has No Version History UX
The architecture has `content_versions` but the editor spec has no UI for viewing/diffing/restoring versions. **Fix:** Add version history panel spec: list of saved versions → click to diff → restore button.

#### [ISSUE-P15] Competitor Limits Per Tier Not Mapped
§2.15 says "3/5/10 by tier" but doesn't specify which tier gets which limit. No upgrade CTA spec when limit is hit. **Fix:** Map explicitly (Starter: 3, Pro: 5, Business: 10). Add upgrade CTA at limit.

#### [ISSUE-P16] Data Export Feature Has No UI Spec
Feature U5 lists CSV/PDF export for Business tier but no export UI exists in Settings or Content Library. **Fix:** Add an Export section to Settings with date range, format options, and tier gate.

#### [ISSUE-P17] Agent Credit Hold/Release Not Visible in Agent Chat UX
The hold/confirm/release pattern is invisible to users. Failed agents may appear to have consumed credits. **Fix:** Add notifications: "Agent didn't complete — no credit was used" and "1 credit used. X/Y remaining."

#### [ISSUE-P18] Persona Filter on Rankings Page Has No Creation Flow
Rankings page has a persona filter dropdown but personas can't be created anywhere in the product. **Fix:** Add persona creation to Onboarding or Settings, or auto-generate defaults from industry, or defer the filter.

#### [ISSUE-P19] WordPress Integration Gated to Business ($349) — 6 Competitors Offer It at Lowest Tier
This is a core scan-to-fix feature. Gating it to the most expensive tier removes a key competitive advantage for Starter/Pro users. **Fix:** Move WordPress to Pro tier at minimum.

---

### Low Issues

#### [ISSUE-P20] Blog Post: No Share Button Spec (platform + OG meta)
#### [ISSUE-P21] Free Scan Shareable Link Expiry (14 days) Not Shown to User
#### [ISSUE-P22] About Page Is a Single Sentence — No Structure
#### [ISSUE-P23] "Agent uses" vs "credits" vs "agent credits" — Inconsistent Terminology
#### [ISSUE-P24] PDF Download in Content Editor Is Non-Trivial (mark as Phase 2 or remove)

---

### Competitive Product Gaps Found by Morgan

| Feature | Competitors | Severity | Notes |
|---------|------------|----------|-------|
| Content Comparison (current vs AI-optimized) | RankScale | Medium | Strong "before/after" UX Beamix doesn't offer |
| Semantic Text Insertions | Goodie AI | Medium | Modifies existing content vs generating new — A15 partially covers |
| Near Real-Time Monitoring (15-30 min) | Rank Prompt | Medium | Current tier-based freq is acceptable for SMBs |
| Auto-Publish via Workflow | Profound | Medium | Beamix publishes as draft; Profound auto-publishes |
| Conversation Explorer (130M+ real AI conversations) | Profound | High (data moat) | Cannot replicate without data panel. Differentiate on execution instead. |
| AI-Generated Images in Content | Rank Prompt | Low | Future enhancement |
| SOC 2/HIPAA | Profound, Ahrefs | Low | Enterprise only, not MVP needed |
| Multi-Surface Monitoring (YouTube, TikTok, Reddit) | Ahrefs Brand Radar | Low | Correctly skipped |

---

## 5. Intelligence Layer Audit — Sage

> **Scope:** `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md`
> **Reference:** `COMPETITIVE_FEATURES_BLUEPRINT.md`, `BEAMIX_SYSTEM_DESIGN.md`

### Critical Issues

#### [ISSUE-I1] Parsing Pipeline Stage Count vs Cost Math Are Contradictory
- **File:** Intelligence Layer §2.3
- **Problem:** The parsing pipeline defines 6 stages. Stage 6 (Context Window Extraction) has no model specified — potentially algorithmic. Cost tables use "5 Haiku calls per response" which is internally inconsistent with a 6-stage pipeline.
- **Impact:** The §2.3 Parsing Cost at Scale table is built on an ambiguous number. If Stage 6 requires Haiku, every cost estimate in the document is ~20% too low.
- **Fix:** Explicitly state whether Stage 6 is LLM-assisted or algorithmic. If algorithmic (substring extraction around mention spans), document the logic. If Haiku, update all cost calculations.

#### [ISSUE-I2] Free Scan Parse Call Count: 12 Claimed, Actual Is 60
- **File:** Intelligence Layer §2.3 (Parsing Cost at Scale table)
- **Problem:** The table states a free scan (4 engines × 3 prompts) requires "12 Haiku calls." But the pipeline applies 5 stages per response: 12 responses × 5 stages = **60 Haiku calls**. The table is 5× too low for parsing specifically.
- **Impact:** At 3,000 free scans/month, parsing cost is $180 (60 calls × $0.001 × 3,000), not the ~$36 the table implies.
- **Fix:** Correct the table: free scan = 60 Haiku calls (~$0.060). Scheduled scan (8 engines × 25 queries) = 200 responses × 5 stages = **1,000 Haiku calls** (~$1.00), not "200 calls (~$0.20)".

#### [ISSUE-I3] Scheduled Scan Per-Response vs Per-Stage Confusion Creates False Confidence
- **File:** Intelligence Layer §1.3 vs §2.3
- **Problem:** §1.3 per-operation estimates happen to be approximately correct (estimated independently). §2.3 parsing table uses per-response counts instead of per-stage counts. Both numbers appear in the document with no reconciliation. The implementation team will look at §2.3 for budget details and build projections on wrong numbers.
- **Fix:** Reconcile §2.3 with §1.3. Make §2.3 explicitly show: [responses] × [stages per response] = [total Haiku calls].

#### [ISSUE-I4] A2 Blog Writer Has No Cross-Model QA Gate
- **File:** Intelligence Layer §3 (A2 pipeline)
- **Problem:** A2's pipeline: Perplexity → Sonnet → Sonnet → Sonnet → GPT-4o. The GPT-4o call at Stage 5 generates title variants — it is NOT a QA gate. The intelligence layer's stated philosophy (§1.4): "cross-model QA is mandatory" and "the model that generates content never grades its own work." Stage 4 (GEO Optimize) is Sonnet reviewing Sonnet's Stage 3 output — exactly the pattern the doc says to avoid. A2 is the longest content output in the system (2,500 words).
- **Impact:** Blog posts ship without cross-model quality review. Violates the system's own QA mandate.
- **Fix:** Add a GPT-4o content QA stage to A2 after Stage 4, identical to A1's QA gate. Or merge: GPT-4o does both QA scoring and title generation in one call.

#### [ISSUE-I5] A7 Social Strategy QA Gate Scores Strategy, Not Individual Posts
- **File:** Intelligence Layer §3 (A7 pipeline)
- **Problem:** A7's GPT-4o QA gate (Stage 3) scores "social strategy quality" and if score < 60, retries Stage 2 which regenerates the entire 30-day content calendar (12-15 post captions, ~3,000-4,000 tokens). A low score on "platform appropriateness" regenerates all 15 posts when only the platform distribution needed adjustment.
- **Impact:** Expensive, wasteful retries. Strategy QA thresholds (designed for content quality) are applied to a categorically different task.
- **Fix:** Either separate strategy evaluation from content evaluation with different thresholds, or have the QA gate return per-post scores so only failing posts regenerate.

---

### High Issues

#### [ISSUE-I6] A8 Competitor Intelligence Will Exhaust Perplexity Rate Limits at Scale
- **File:** Intelligence Layer §3 (A8), §8.4
- **Problem:** A8 scans 3 competitors × 25 queries × 8 engines = 600 engine calls per run, including ~75 Perplexity calls. At 500 A8 runs/month across 1K businesses, that's 37,500 Perplexity calls — all unique competitor sets, so caching provides near-zero benefit. At Perplexity's 40 RPM limit, A8 alone requires 15.6 hours of dedicated Perplexity bandwidth per month.
- **Impact:** A8 queues for hours at any meaningful scale. Users will think it's broken.
- **Fix:** Remove Perplexity from A8's competitor scanning. A8 already has Perplexity data from the user's own scan results — use existing data rather than re-scanning through Perplexity. Or, run competitor scans only through non-rate-limited engines (ChatGPT, Gemini, Claude).

#### [ISSUE-I7] No Fallback for Opus in A13 Voice Training and A16 Brand Narrative
- **File:** Intelligence Layer §8.3 (Fallback Chains)
- **Problem:** Fallback chain covers Sonnet, GPT-4o, Perplexity, Haiku, and engine queries — but NOT Opus. A13 and A16 both require Opus and have zero fallback if Opus is unavailable.
- **Fix:** Define Opus fallback: (1) retry with increased timeout, (2) fall back to Sonnet with enhanced prompt (longer chain-of-thought), (3) queue for 30-minute retry with user notification. Never silently fail — always release credits on unrecoverable failure.

#### [ISSUE-I8] Context Window Overflow in A12 Ask Beamix
- **File:** Intelligence Layer §3 (A12)
- **Problem:** A12 injects full business context per turn: business profile + latest 3 scan results (all queries × all engines) + 10 agent jobs + recommendations + competitor data + conversation history. For a Pro user at turn 10+, total input can reach 30,000-50,000 tokens. Cost per turn escalates from the estimated $0.02-0.05 to $0.10-0.15 after turn 5-6.
- **Impact:** $200-500/month estimate for 10K turns is accurate only for early turns. Actual blended cost is $400-1,000. Quality also degrades with long contexts.
- **Fix:** (1) Context windowing: only last 5 turns in history. (2) Compress context: pre-summarize scan results into a 2,000-token digest. (3) On-demand retrieval: fetch specific engine/query data only when user asks about it.

#### [ISSUE-I9] A13 Voice Training Fails on Thin Websites
- **File:** Intelligence Layer §3 (A13)
- **Problem:** A13 Stage 1 crawls 3-5 pages for "3,000-15,000 words." Many Israeli SMB websites have <800 words total. No minimum content threshold is defined. Opus will analyze a tiny, unrepresentative sample and produce a low-confidence voice profile that may make generated content worse.
- **Fix:** Define a minimum threshold: <1,500 words → skip, show "Not enough content to train voice profile — generate content first." 1,500-3,000 words → use Sonnet. 3,000+ words → Opus as designed. Include confidence scoring in voice profile output.

#### [ISSUE-I10] API-Based Scanning Produces Data That Diverges from Consumer Experience
- **File:** Intelligence Layer §2.1, §1.5
- **Problem:** The scan methodology (Section 1.5) documents this limitation well, but the entire cost model, scoring algorithm, and competitive positioning is built on API scan data that systematically diverges from what users actually see in consumer ChatGPT/Gemini. Peec AI's competitive advantage is exactly this — browser simulation for authentic data.
- **Fix:** Not a design change (browser sim is correctly deferred), but: (1) add per-engine confidence scores based on known API/consumer divergence magnitude, (2) prioritize Phase 3 browser simulation for the highest-divergence engines, (3) ensure the limitations section is prominent in product messaging, not buried in the intelligence layer.

---

### Medium Issues

#### [ISSUE-I11] GPT-4o QA Gate Has No Calibration Mechanism
Known GPT-4o tendency to be permissive on factual claims means the 70/100 QA threshold may drift over time. **Fix:** Monthly QA calibration: re-run 20 previously scored outputs through the pipeline, compare scores. Track QA pass rates per agent type — sudden spikes signal model drift.

#### [ISSUE-I12] Customer Journey Classification Has No Training Set
Haiku classifies queries into awareness/consideration/decision with only 2 examples per stage. Without robust few-shot examples, Haiku defaults to surface keyword matching. **Fix:** Create a 30-example training set with edge cases as few-shot examples. Add confidence scoring — only surface journey insights when average confidence > 0.7.

#### [ISSUE-I13] Prompt Auto-Suggestion Uses Haiku for a Creative Task
Generating diverse natural-language questions from website content requires reasoning (Sonnet-class), not extraction (Haiku-class). **Fix:** Use Sonnet for Step 3. Cost increase: ~$0.02 per business at onboarding — negligible, major quality improvement.

#### [ISSUE-I14] Content Refresh Agent (A15) Staleness Audit Uses Haiku for Multi-Factor Assessment
Comparing content against current scan data + market trends is a multi-source judgment task. Haiku will miss semantic staleness (outdated claims, new competitors). **Fix:** Split into (1) Haiku for structural staleness (dates, broken links, format), (2) Sonnet for semantic staleness (outdated claims, changed market conditions). Cost increase: ~$0.01-0.02 per audit.

#### [ISSUE-I15] Recommendation Deduplication by Title Similarity Is Fragile
"Improve FAQ content for dental services" and "Add FAQ section targeting dental queries" have low string similarity but are the same recommendation. **Fix:** Use embedding-based similarity (text-embedding-3-small) on full description text, cosine threshold > 0.85. Or use Haiku for dedup check.

#### [ISSUE-I16] Edit Capture Pipeline References `content_edits` Column That Doesn't Exist
Intelligence Layer §4.4 stores edit diffs in a `content_edits` column on `content_items`. Architecture layer's `content_items` schema has no such column. Edit history is in the `content_versions` table. **Fix:** Update intelligence layer to use `content_versions` table.

---

### Low Issues

#### [ISSUE-I17] Hebrew Transliteration Dependency Not Verified
The `hebrew-transliteration` npm package is referenced but not verified to exist with the required standard. **Fix:** Verify the package and specify the transliteration standard (ISO 259 recommended).

#### [ISSUE-I18] Gemini 2.0 Flash Described as Both Scan Engine and Parsing Fallback
Two different roles require two different prompt templates. The dual role should be explicitly documented. **Fix:** Clarify in §1.2 that Flash needs separate system prompts for each role.

#### [ISSUE-I19] No Prompt Template Versioning Specification
With 50+ LLM call types, prompt regressions are undetectable without version tracking. **Fix:** Add a prompt registry spec: each prompt has a version number, active version is config-driven, previous versions retained for rollback.

#### [ISSUE-I20] Workflow Credit Check Is Post-Start, Not Pre-Validation
Partial workflow execution (A4 runs free, A8 uses last credit, A1 queues) creates a confusing UX. **Fix:** Pre-validate total credit cost for the entire workflow chain before starting. If insufficient, notify user and ask whether to proceed with partial execution.

---

### Cost Model Verification

| Operation | Doc Estimate | Sage Verification | Verdict |
|-----------|-------------|-------------------|---------|
| Free scan (4 engines, 3 prompts) | $0.06-0.12 | Engine queries $0.036 + parsing $0.060 + scoring $0.03 = **$0.126** | Low-end ($0.06) is unreachable. $0.10-0.15 is realistic. |
| Scheduled scan (8 engines, 25 queries) | $1.50-3.00 | $0.80 + $1.00 + $0.05 + $0.15 = **$2.00** | Within range. Estimate is reasonable. |
| A1 Content Writer | $0.15-0.40 | Perplexity $0.02 + Sonnet ×2 $0.11 + GPT-4o $0.03 = **$0.16** | Low end accurate. High end accounts for retries. |
| A8 Competitor Intelligence | $3.00-6.00 | Engine calls $2.40 + parsing $3.00 + Sonnet $0.16 = **$5.56** | High end accurate. Parsing was underestimated in doc ($0.60 stated, actual $3.00). |
| Voice training (A13) | $0.30-0.50 | Opus input $0.04-0.08 + output $0.075 + Sonnet verify $0.02 = **$0.14-0.18** | Doc 2× overestimates. Good for budget conservatism. |
| **Monthly total at 1K businesses** | **$20K-40K** | $15K-25K | Doc high end ($40K) is pessimistic. More realistic range: **$15K-25K**. Required ARPU for LLM break-even: $15-25, not $40-80 as stated in §8.1. |

---

## 6. Validation Layer Audit — Rex

> **Scope:** `_SYSTEM_DESIGN_VALIDATION.md`
> **Reference:** `COMPETITIVE_FEATURES_BLUEPRINT.md`, `BEAMIX_SYSTEM_DESIGN.md`, `_RESEARCH_SYNTHESIS.md`
> **Method:** Every finding sourced to specific documents and sections.

### False Closure Claims

#### [ISSUE-V1] Customer Journey Stage Mapping — Falsely Marked CLOSED
- **Gap:** GAP-M4. Master doc claims "CLOSED (spec)" — Haiku classification into awareness/consideration/decision.
- **Problem:** Validation doc itself says this is "correctly deferred to Phase 4" and "NOT required for launch or growth phase." The master doc simultaneously marks it CLOSED AND places it in Growth Phase. Architecture layer has no `journey_stage` column on `tracked_queries` or `scan_engine_results` — it only appears on `personas` table. Product layer shows journey stage tags in recommendations and rankings filters, but these UI elements have no backend column to query.
- **Evidence:** Validation doc GAP-M4 "NOT required" vs Master doc line 291 "CLOSED (spec)" vs Master doc line 361 in Growth Phase list. No `journey_stage` column on query tables.
- **Fix:** Downgrade to "DEFERRED (Phase 4)." Remove from Growth Phase list. The intelligence layer spec is valid as a future note but not a closed gap.

#### [ISSUE-V2] Persona-Based Tracking — Falsely Marked CLOSED
- **Gap:** GAP-M3. Master doc claims "CLOSED" — `personas` table + prompt modifiers + persona-segmented scanning.
- **Problem:** The validation doc itself says "correctly deferred to Phase 4, NOT required for launch or growth phase." `personas` table exists and persona filter UI exists in the product layer. However, the scan pipeline in the architecture layer (the function steps: generate-prompts → fan-out-engines → parse-responses) has NO step that queries the `personas` table or modifies prompts based on persona. Data model = present. Pipeline integration = absent.
- **Evidence:** Validation GAP-M3 "NOT required" vs Master doc "CLOSED." Architecture scan pipeline has no persona-selection step.
- **Fix:** Change to "CLOSED (data model only) — pipeline integration DEFERRED." Or add the missing pipeline integration step to the scan engine spec.

#### [ISSUE-V3] Prompt Volume Data — Missing Dashboard Widget Despite "CLOSED" Claim
- **Gap:** GAP-M1. Master doc: "CLOSED" — tables + cron + dashboard widget.
- **Problem:** The data model IS complete. The aggregation cron IS specified. But the "dashboard widget" part is not designed. The product layer feature count mentions "Prompt Trends" but the dashboard overview page spec has no trending/volume widget. The rankings page has no volume display.
- **Evidence:** Architecture tables and cron fully specified. Product layer overview page spec: no trending widget. Validation doc line 130 describes it but product layer doesn't implement it.
- **Fix:** Change to "CLOSED (backend)." Add the missing "Trending in your industry" widget spec to the dashboard overview or rankings page in the product layer.

#### [ISSUE-V4] "Fix It" Button — Concept Present, Cross-Dashboard Implementation Missing
- **Gap:** Validation Innovation 1. Listed as Growth Phase.
- **Problem:** The product layer has "Fix with Agent" buttons on the top-3 overview widget only. The recommendations page has no "Fix It" buttons on individual cards. The rankings page has no "Fix It" next to low-visibility queries. The competitor page has no "Fix It" for gaps. The concept exists in one place, not across the dashboard as implied.
- **Fix:** Either design "Fix It" placement across all relevant dashboard views, or note that current design covers only the top-3 overview widget.

#### [ISSUE-V5] Agent Impact Scorecard — Aspiration, Not Design
- **Gap:** Validation Innovation 2.
- **Problem:** `content_performance` table tracks per-content-item visibility deltas. But per-agent attribution (which agent caused which change) requires isolating a single item's impact when multiple items are published simultaneously — the methodology for handling confounding variables is not specified. The validation doc acknowledges this ("requires correlation logic") but still lists it as a completed innovation.
- **Fix:** Either design the attribution methodology in the Intelligence + Product layers, or downgrade from "unique innovation" to "future enhancement building on content performance tracking."

---

### Priority Classification Errors

#### [ISSUE-V6] Share of Voice: Launch Critical vs. Competitive Intelligence (Growth Phase) Contradiction
- **Item:** Share of Voice
- **Current:** Launch Critical (validation line 589, master doc line 333)
- **Should be:** Growth Phase
- **Reason:** Master doc lists "Competitive intelligence dashboard" under Growth Phase (line 362). Share of Voice is a component OF the competitive intelligence dashboard. Both must share the same phase. Current classification contradicts itself.

#### [ISSUE-V7] Prompt Auto-Suggestions: Launch Critical vs. Own Parity Matrix Saying Growth Phase
- **Item:** Prompt Auto-Suggestions
- **Current:** Launch Critical (validation line 598)
- **Should be:** Growth Phase
- **Reason:** Validation doc's own parity matrix (line 329) classifies it as "Growth Phase." Research Synthesis rates it "Should-Have." Only 3/15 competitors have it. A feature 80% of competitors don't have is not launch critical.

#### [ISSUE-V8] LLMS.txt Generator: Launch Critical vs. 1/15 Competitors Have It
- **Item:** LLMS.txt Generator Agent (A10)
- **Current:** Launch Critical
- **Should be:** Growth Phase
- **Reason:** Only Bear AI (1/15) offers LLMS.txt support. "Launch Critical" should be reserved for table stakes features. A10 is a good differentiator with low effort — correct for early Growth Phase.

#### [ISSUE-V9] Content Voice Training (A13): Moat Builder vs. Should Be Growth Phase
- **Item:** Content Voice Training
- **Current:** Moat Builder, 3-6 months
- **Should be:** Growth Phase (within 3 months)
- **Reason:** Research Synthesis rates it "Should-Have" with 2-3 weeks build effort. Goodie AI's Author Stamp is a key differentiator preventing generic-sounding output — a direct churn risk. If agents produce generic content for 3-6 months before voice training ships, users will churn. Voice training should ship before or with content performance tracking, not after.

---

### Competitive Parity Misrepresentations

#### [ISSUE-V10] WordPress CMS Risk Not Acknowledged
At launch, Beamix agents generate content requiring manual copy-paste to publish. Every content competitor with WordPress integration (Profound, Bear AI, Writesonic, Ahrefs, Spotlight, RankPrompt) offers friction-free publishing. This gap is classified correctly as Growth but the churn/conversion risk is not acknowledged anywhere.

#### [ISSUE-V11] "8 Unique Innovations" — 3 of 8 Have Partial Competitor Equivalents
- **"Fix It" Button:** Gauge's AI Analyst executes strategy. AthenaHQ's Action Center drafts optimizations. The INTEGRATED concept exists elsewhere.
- **Agent Impact Scorecard:** Bear AI tracks blog agent output performance. Gauge tracks content performance. The GRANULARITY claim may be correct but the category is not unique.
- **"What Changed" Weekly Diff:** Otterly generates reports with historical data. SE Visible has historical trend analysis. The DIFF format may be more granular but weekly change reporting is not unprecedented.
- **Fix:** Reframe from "8 features NO competitor has" to "8 features uniquely combined in Beamix — 5 genuinely novel, 3 with significantly deeper implementation than competitors."

#### [ISSUE-V12] "Only Agents Under $100/Month" Ignores RankPrompt at $29
RankPrompt at $29 generates 6 content types with WordPress one-click publishing. The unqualified "only under $100" claim is refutable. **Fix:** Qualify: "Only interactive autonomous agents with streaming chat UX under $100/month." The distinction is real — Beamix's agent chat is genuinely different from batch generation — but the claim needs the qualifier.

---

### Missing Coverage

#### [ISSUE-V13] Competitor Count Inconsistency: 15 Profiled, 3 More in Synthesis
Blueprint profiles 15 competitors. Research Synthesis adds Geoptie ($49), Promptmonitor ($29), Semrush AI ($239) without full feature profiles. Gap analysis based only on the 15 may miss features from these 3. **Fix:** Note in validation doc that gap analysis covers 15/18 known competitors and the remaining 3 have been spot-checked only.

#### [ISSUE-V14] Data Freshness Warning Not Operationalized in Validation Doc
Blueprint has a 60-day freshness notice. Validation doc sources from blueprint but has no equivalent freshness policy. **Fix:** Add freshness notice to validation doc header: "Re-verify all competitor feature claims if more than 60 days have elapsed since March 1-4, 2026."

#### [ISSUE-V15] Research Synthesis Priority Rankings Not Mapped to System Design Priorities
The synthesis §7 ranks 20 must-have features by build phase. The validation priority classification was written independently, creating discrepancies (e.g., synthesis V1 rank 8 "Sentiment Scoring" is validation Growth Phase, not Launch Critical). **Fix:** Add a mapping table showing how each synthesis priority maps to system design priority, with notes on changes.

---

### Confirmed Accurate Claims (Spot Check by Rex)

1. Citation tracking — CLOSED: `citation_sources` table fully specified across all three layers.
2. Sentiment 0-100 integer — CLOSED: consistent across all documents.
3. 12 content types — CLOSED: `content_items.content_type` CHECK constraint confirmed.
4. Content voice training — CLOSED: end-to-end design across all 4 layers.
5. Content pattern analysis — CLOSED: A14 fully specified.
6. Brand narrative analysis — CLOSED: table + cron + A16 pipeline all present.
7. Agent workflow chains — CLOSED: tables + templates + Inngest execution all specified.
8. Content refresh agent — CLOSED: A15 pipeline + cron specified.
9. Multi-engine 10+ roadmap — CLOSED: 10 engines with phased rollout specified.
10. All 14 intentionally-skipped items — Well-reasoned with competitive evidence.

---

## 7. Cross-Document Consistency Audit — Guardian

> **Scope:** All 5 system design documents
> **Reference:** `COMPETITIVE_FEATURES_BLUEPRINT.md`

### Count/Number Mismatches

#### [ISSUE-C1] Table Count: 32 — VERIFIED CORRECT
Architecture layer §2.13 lists exactly 32 tables. No issue.

#### [ISSUE-C2] Agent Count: 16 Agents but Only 15 in `agent_jobs` DB Enum
Master doc says 16 agents. Architecture `agent_jobs.agent_type` CHECK lists only 15 — `ask_beamix` is missing (by design, A12 uses direct SSE). The master doc counts A12 as one of 16 without noting this distinction. **Fix:** Update master doc: "16 agents, 15 of which use the agent_jobs pipeline." Add a note that A12 uses direct SSE, not Inngest.

#### [ISSUE-C3] Inngest Functions: 14 Claimed, Table Shows 15 Rows (1 Strikethrough)
The `agent.ask-beamix` entry has an explicit strikethrough (REMOVED). Excluding it gives 14 active functions. The count is technically correct but the table layout is confusing. **Fix:** Remove the strikethrough row entirely from the master doc table.

#### [ISSUE-C4] API Route Counts Wrong for 6 of 14 Route Groups
Master doc route count claims vs. actual routes in architecture layer:

| Route Group | Claimed | Actual |
|-------------|---------|--------|
| `/api/dashboard/*` | 5 | 6 |
| `/api/settings/*` | 4 | 9 |
| `/api/billing/*` | 3 | 5 |
| `/api/integrations/*` | 4 | 6 |
| `/api/alerts/*` | 3 | 5 |
| `/api/analytics/*` | 3 | 4 |
| `/api/v1/*` | 12 | 9 |

**Fix:** Recount routes from the architecture layer and update master doc §4.3.

#### [ISSUE-C5] Alert Types: 9 in Product Layer, 10 in Architecture DB Enum
Architecture `alert_rules.alert_type` has 10 values. Product Layer §3.6 lists 9 (N1-N9). The missing 10th is `content_performance_change`. **Fix:** Add N10 to the product layer alert list, or remove it from the DB enum if not user-facing.

#### [ISSUE-C6] Page Count: 23 — Verified Correct, But Section Numbering Has Collisions
23 unique URLs confirmed. However, §2.15 is used twice (Competitive Intelligence AND Post-Trial Experience), §2.16 used three times. **Fix:** Re-number; Post-Trial → §2.24, Account Deletion → §2.25.

#### [ISSUE-C7] Feature Count: "90+" — Verified as ~91-92 (minor)
Count is technically correct as a floor. Not an issue.

---

### Cross-Layer Reference Errors

#### [ISSUE-X1] Intelligence Layer References `content_edits` Column That Doesn't Exist
Intelligence Layer §4.4 stores edit diffs in `content_items.content_edits`. Architecture layer `content_items` has no such column. Edit history lives in `content_versions` table. **Fix:** Update intelligence layer to use `content_versions`.

#### [ISSUE-X2] Product Layer Lists Looker Studio Integration, Validation Layer Explicitly Skips It
Product Layer §3.7 lists "I6: Looker Studio" as a Business tier integration. Validation §5 explicitly defers it to Phase 4. **Fix:** Remove from product layer, or mark as "Phase 4 / Deferred."

#### [ISSUE-X3] Product Layer Lists AI Overviews as Pro-Tier Engine — Intelligence Layer Says Phase 3 Only
Product Layer §3.1 lists AI Overviews under Pro-tier additional engines. Intelligence Layer correctly marks AI Overviews as "Phase 3 (deferred)" requiring browser simulation — it has no API. **Fix:** Remove AI Overviews from Pro tier in product layer. Pro tier additional engines = Grok, DeepSeek, You.com (3, not 4).

#### [ISSUE-X4] MEMORY.md Lists "Bing Copilot" as Free-Tier Engine
MEMORY.md LOCKED DECISIONS section says Free/Starter includes "ChatGPT, Gemini, Perplexity, Bing Copilot." All system design documents consistently list "ChatGPT, Gemini, Perplexity, Claude" for free tier. Bing Copilot requires browser simulation and is Phase 3. **Fix:** Update MEMORY.md LOCKED DECISIONS: replace "Bing Copilot" with "Claude."

#### [ISSUE-X5] Voice Profile Storage Contradicts Itself in Intelligence Layer
Intelligence Layer §3 (A13) says voice profile stored "in the `businesses` table (or a dedicated `voice_profiles` table)." Architecture layer defines `content_voice_profiles` as the dedicated table — `businesses` has no voice columns. **Fix:** Remove the `businesses` option from intelligence layer. The architecture has decided: `content_voice_profiles` table.

---

### Contradictory Specifications

#### [ISSUE-S1] A2 Blog Writer Pipeline: Master Doc vs Intelligence Layer Disagree on GPT-4o Role
Master doc agent table shows A2 pipeline ending with GPT-4o, implying QA. Intelligence layer reveals GPT-4o only generates title variants. A2 has no actual QA gate. **Fix:** Either add a QA stage to A2 or document explicitly that A2 is exempt from cross-model QA and why.

#### [ISSUE-S2] A7 Social Strategy: Master Doc Shows 2-Stage Pipeline, Intelligence Layer Shows 3
Master doc: "Perplexity → Sonnet." Intelligence layer: Stage 1 Perplexity + Stage 2 Sonnet + Stage 3 GPT-4o QA. **Fix:** Update master doc to show 3 stages: "Perplexity → Sonnet → GPT-4o QA."

#### [ISSUE-S3] scan.free Concurrency: 20 in Master Doc, 50 in Architecture Layer
**Fix:** Master doc has the values SWAPPED (see S4). Reconcile to: free=50 (higher, for anonymous burst), scheduled=20 (controlled, for paid users).

#### [ISSUE-S4] scan.scheduled Concurrency: 50 in Master Doc, 20 in Architecture Layer
**Fix:** Architecture layer values make more sense. Free scans = 50 concurrent (simpler, burst-able). Scheduled = 20 concurrent (complex, resource-controlled). Update master doc.

#### [ISSUE-S5] workflow.execute Concurrency: 2 Per User in Master Doc, 1 Per User in Architecture
**Fix:** Update master doc to 5 total, 1 per user.

#### [ISSUE-S6] cron.scheduled-scans Frequency: "Every 1h" in Master Doc, "daily 2AM UTC" in Architecture
This is a 24× cost difference. **Fix:** Update master doc to "daily 2AM UTC."

#### [ISSUE-S7] cron.prompt-volume-agg Schedule: "Sunday 3am" in Master Doc, "Sunday 4AM" in Architecture
Minor 1-hour discrepancy. **Fix:** Align both documents.

#### [ISSUE-S8] Parsing Pipeline Stage Count vs Haiku Call Count Ambiguous
Master doc says 6 stages + 5 Haiku calls. Stage 6 model is unspecified. **Fix:** Specify whether Stage 6 uses Haiku or is algorithmic (see ISSUE-I1).

---

### Undefined References / Broken Links

#### [ISSUE-U1] Product Layer Section Numbering Duplicates Block Cross-References
§2.15 used twice, §2.16 used three times. Any external reference to these sections is ambiguous. **Fix:** Re-number to eliminate duplicates.

#### [ISSUE-U2] Master Doc References `_GAP_ANALYSIS_CTO.md` at Wrong Path
File moved to `.planning/08-agents_work/`. Master doc document index still points to old location. **Fix:** Update reference path.

#### [ISSUE-U3] Validation Layer Sources List "BEAMIX_PRODUCT_SYSTEM.md" — File Doesn't Exist
No file by this name in `.planning/`. **Fix:** Remove from sources list or update to correct filename.

---

### Stack Compatibility Issues

#### [ISSUE-T1] Vercel Timeout vs Inngest — PASS
All long-running ops correctly moved to Inngest. No issue.

#### [ISSUE-T2] In-Memory Rate Limiting on Vercel Serverless — BLOCK
(See BLOCK-2 above.)

#### [ISSUE-T3] RLS Subquery Performance on `scan_engine_results`
Policy uses `business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())`. At scale with many businesses and scan results per user, this subquery runs on every SELECT. **Fix (future, not launch-blocking):** Add a denormalized `user_id` column to `scan_engine_results` for simpler direct RLS.

---

### Security Logic Errors

#### [ISSUE-SEC1] AES-256-GCM Key Management Is Underspecified
Architecture Layer §7.4 says key is in `CREDENTIALS_ENCRYPTION_KEY` env var. No spec for: key rotation (all existing encrypted values become unreadable on key change), key backup (if accidentally deleted, all integration credentials lost), or key derivation standard. **Fix:** Add key rotation procedure: store key version with each encrypted value, support re-encryption during rotation, document backup procedure.

#### [ISSUE-SEC2] SHA-256 API Key Lookup — CORRECTLY DESIGNED (Pass)
Plaintext shown once at creation, only hash stored. Lookup works: hash(input) = stored hash. This is the standard pattern (GitHub, Stripe). No issue.

#### [ISSUE-SEC3] Free Scans Rate Limiting Uses Supabase Table Check — CORRECTLY DESIGNED
Architecture §line 980 describes checking the `free_scans` table for IP rate limits, not in-memory. This correctly avoids the serverless statelessness problem. Confirm the free scan rate limit uses this path.

#### [ISSUE-SEC4] Prompt Injection Defense Is Underspecified
Intelligence Layer §1.6 mentions defense at a high level. No specific sanitization library or regex set. No adversarial testing methodology. User inputs to agents (topic, tone) flow into LLM prompts; Zod validates types but not injection content. **Fix:** Add specific sanitization library reference. Add adversarial testing to QA phase. (WARN, not BLOCK — structural XML tag separation provides reasonable defense.)

---

### Workflow Logic Errors

#### [ISSUE-W1] Visibility Drop Threshold Calculation Method Not Specified
"Score drops >15%" — but is this 15 percentage points absolute, or 15% relative? `(previous - current) / previous * 100 > threshold` vs `previous - current > threshold`. These produce very different alert frequencies. **Fix:** Document the calculation method explicitly. Recommend: percentage-based with threshold stored as `{drop_percent: 15}`.

#### [ISSUE-W2] Credit Hold "1-Hour Release" vs Daily Cleanup Cron — 24× Mismatch
Architecture §4.4: "Credit holds released by a daily cleanup cron that finds holds older than 1 hour." `cron.cleanup` runs daily at 3AM. A stuck hold at 3:01 AM won't be released for 24 hours, not 1 hour. **Fix:** Either add a `cron.credit-cleanup` that runs hourly, or change the description to "holds older than 24 hours."

#### [ISSUE-W3] Onboarding Workflow Credits Gap — BLOCK
(See BLOCK-1 above.)

#### [ISSUE-W4] Inngest Event Names: No Canonical Registry
Events use `/` separators (`scan/free.start`) but no single canonical event registry exists with names, schemas, producers, and consumers. **Fix:** Add a canonical event registry table to the architecture layer preventing typos and ensuring type safety.

---

## 8. Confirmed Accurate Claims

The following were verified correct across all documents:

| Claim | Verified By |
|-------|------------|
| 32 database tables — exact count | Guardian C1 |
| Sentiment scoring 0-100 integer — consistent across all layers | Rex |
| 12 content types in `content_items.content_type` CHECK constraint | Rex |
| Paddle-only billing (no Stripe) — consistent | All |
| 14-day trial — consistent across all layers | All |
| Citation tracking: `citation_sources` table + pipeline + dashboard | Rex |
| Voice training A13: end-to-end design across all 4 layers | Rex |
| Content pattern analysis A14: fully specified | Rex |
| Brand narrative A16: table + cron + pipeline all present | Rex |
| Agent workflow chains: tables + templates + Inngest execution | Rex |
| Content refresh A15: pipeline + cron specified | Rex |
| 10-engine multi-engine roadmap with phased rollout | Rex |
| Skip decisions (white-label, Looker Studio, CDN, YouTube/Reddit) — all well-reasoned | Rex |
| Hebrew/RTL priority — correctly addressed in product layer | Morgan |
| 23 unique page URLs — correct count | Guardian C6 |
| SHA-256 API key hashing — correctly designed | Guardian SEC2 |
| Free scan rate limiting via Supabase table (not in-memory) | Guardian SEC3 |
| Inngest + Vercel architecture — correctly designed for long-running ops | Guardian T1 |

---

## 9. Competitive Gaps Summary

| Feature | Competitor(s) | Classification | Recommendation |
|---------|--------------|----------------|----------------|
| Auto-competitor suggestion from scan data | SE Visible, Gauge | Easy win — add | A8 extracts competitor names from scan results; just add a suggestion flow to the competitor tracking UI |
| "What changed this week" visual diff | AthenaHQ, BrandRank.ai | Moat Builder (correct) | Confirm this classification is intentional, not forgotten |
| Bulk query tracking (50+ queries, import) | Otterly | Medium gap | Architecture supports it; UX for bulk add/import is missing |
| Content comparison (current vs. AI-optimized) | RankScale | Medium gap | Strong differentiation opportunity not currently designed |
| Semantic text insertions into existing content | Goodie AI | Medium gap | A15 partially covers staleness; doesn't cover semantic enhancement |
| AI-generated images in content | RankPrompt | Low gap | Future enhancement for A1/A2 |
| Real AI conversation search/indexing | Profound | Correctly skipped | Data moat requiring 130M+ conversations. Focus on execution instead. |
| Looker Studio connector | Gauge | Correctly skipped | REST API (Business tier) covers data export needs |
| White-label agency mode | Multiple | Correctly skipped | Enterprise scope, premature |
| CDN-level optimization | Scrunch | Correctly skipped | Very high effort, low competitive pressure |

---

## 10. Master Fix Priority List

### Before Any Engineering Work Starts

| # | Issue | Layer | Fix |
|---|-------|-------|-----|
| 1 | **BLOCK-1** Onboarding workflow fires 3 agents before credits exist | Intelligence + Architecture | Make onboarding agents system-initiated (0 credits) OR allocate trial credits on signup |
| 2 | **BLOCK-2** In-memory rate limiting = zero protection on Vercel | Architecture | Replace with Supabase table or Upstash Redis on ALL rate-limited routes |
| 3 | **BLOCK-3** Credit RPCs (hold/confirm/release) never defined | Architecture | Define all 4 RPCs with signatures, locking, idempotency, timeout handling |
| 4 | **BLOCK-4** 3 of 10 alert types have no evaluation logic | Architecture | Add evaluation logic or remove from enum |
| 5 | **CRIT** A2 Blog Writer has no QA gate (violates stated mandate) | Intelligence + Guardian | Add GPT-4o content QA stage to A2 |
| 6 | **CRIT** scan.free/scan.scheduled concurrency values are SWAPPED | Master + Architecture | Correct to free=50, scheduled=20 |
| 7 | **CRIT** cron.scheduled-scans: "every 1h" vs "daily 2AM" — 24× difference | Master + Architecture | Decide and align both documents |
| 8 | **CRIT** Parsing cost math 5× too low in §2.3 (tables use per-response, not per-stage counts) | Intelligence | Recalculate. Correct monthly range: $15K-25K, not $20K-40K |
| 9 | **CRIT** Journey Stage Mapping falsely marked CLOSED — no pipeline integration | Validation | Downgrade to DEFERRED (Phase 4) |
| 10 | **CRIT** Persona-Based Tracking falsely marked CLOSED — data model only, no pipeline | Validation | Change to CLOSED (data model) + pipeline DEFERRED |
| 11 | **CRIT** Prompt Volume data has no dashboard widget despite "CLOSED" claim | Validation + Product | Add Trending Prompts widget to dashboard overview spec |
| 12 | **CRIT** Agent Chat URL param: `agent_id` vs `agentType` — 3 different values in 3 docs | Product + Architecture | Standardize on `agentType` slug everywhere |
| 13 | **CRIT** Free scan results page: zero failure/timeout/polling state spec | Product | Add explicit states: polling, timeout, partial, error, expired |
| 14 | **CRIT** Post-trial read-only state not designed on any dashboard page | Product | Add Trial Expired Behavior Matrix per page |
| 15 | **CRIT** A16 not in Agent Hub categories — users can't discover it | Product | Add to Intelligence category in §2.13 |
| 16 | **CRIT** Onboarding: 4 visible steps but 3 dots | Product | Reconcile: show 4 dots or merge steps 3+4 |
| 17 | **CRIT** AI Overviews in Pro tier but requires Phase 3 browser simulation | Product + Intelligence | Remove from Pro tier; Pro = Grok + DeepSeek + You.com only |
| 18 | **CRIT** `content_edits` column referenced in intelligence layer doesn't exist | Intelligence | Update to use `content_versions` table |
| 19 | **CRIT** MEMORY.md LOCKED DECISIONS: "Bing Copilot" should be "Claude" for Free tier | Memory | Update MEMORY.md |
| 20 | **CRIT** Voice profile: Sonnet in architecture layer, Opus in master doc | Architecture + Master | Align to Opus (quality justified) |

### Before Sprint 1 Planning

| # | Issue | Fix |
|---|-------|-----|
| 21 | A8 Competitor Intelligence will exhaust Perplexity rate limits at scale | Remove Perplexity from A8 competitor scanning; use existing scan data |
| 22 | No Opus fallback chain for A13/A16 | Define fallback: retry → Sonnet enhanced → queue with notification |
| 23 | `rate_limit_counters` table not in schema | Add as table #33 with full spec |
| 24 | GDPR export references non-existent Inngest function | Add `data.export` Inngest function |
| 25 | Notifications/Alerts page has no spec or URL | Add `/dashboard/alerts` page spec + sidebar nav entry |
| 26 | Content Library: no pagination, search, or bulk actions spec | Add to §2.11 |
| 27 | Looker Studio: present in product layer, explicitly skipped in master | Remove from product layer (or vice versa) |
| 28 | Agent Workflow Builder §5 not marked as post-launch | Add "Phase 3" marker |
| 29 | WordPress integration gated to Business — 6 competitors offer it at lower tier | Consider moving to Pro tier |
| 30 | API route counts wrong in master doc §4.3 for 6 groups | Recount from architecture layer |
| 31 | GA4 and GSC integrations have no persistence tables | Add tables or specify JSONB storage strategy |
| 32 | Alert types: 10 in DB enum, 9 in product layer | Reconcile |
| 33 | Validation "8 unique innovations" overstated — 3 have partial competitor equivalents | Reframe as "5 genuinely novel + 3 with deeper implementation" |
| 34 | "Only agents under $100" claim ignores RankPrompt at $29 | Qualify: "only interactive streaming agent chat under $100" |
| 35 | Credit hold cleanup: "1 hour" claim vs daily cron (24× mismatch) | Add hourly credit-cleanup cron or fix description |
| 36 | Prompt Auto-Suggestions priority: Launch Critical in one place, Growth Phase in another | Correct to Growth Phase |
| 37 | Content Voice Training (A13): Moat Builder → should be Growth Phase | Move earlier — churn risk if delayed 3-6 months |
| 38 | Share of Voice: Launch Critical vs. Competitive Intelligence Growth Phase — contradiction | Align both to Growth Phase |
| 39 | `businesses.is_primary` has no uniqueness enforcement | Add partial unique index |
| 40 | A7 pipeline: master doc shows 2 stages, intelligence shows 3 | Update master doc |

### During Sprint 1 (Medium + Low)

Items M-1 through M-20 and L-1 through L-9 from individual audits — see Sections 3-7 above for full detail.

---

> **This document is the authoritative pre-build audit for the Beamix system design.**
> **All 5 individual audit reports have been merged into this single source of truth.**
> **Individual report files in this folder remain available for full section-referenced detail.**
> **Produced by: Atlas, Morgan, Sage, Rex, Guardian — March 5, 2026**
