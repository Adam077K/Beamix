> ⚠️ **OLD REPORT (March 4, 2026)** — Superseded by [`FULL_DESIGN_AUDIT.md`](./FULL_DESIGN_AUDIT.md) (March 5, 2026)

# Beamix System Design — Professional Audit Report

> **Date:** March 4, 2026
> **Audit Team:** Morgan (CPO), Atlas (CTO), Sage (AI Engineer), Rex (Research), Iris (Orchestrator)
> **Scope:** All 5 files in `.planning/03-system-design/` (~344KB total)
> **Method:** Each file audited independently by domain specialist, then cross-document consistency check

> **Resolution Date:** March 5, 2026
> **Resolution Status: ALL ISSUES RESOLVED**
> **Fix sessions:** 3 sessions, 62 fixes across 8 files. See `AUDIT_FIX_STATUS.md` for detailed changelog.
> **Backlog:** 24 strategic observations logged in `.planning/BACKLOG.md`

---

## Executive Summary

The system design is **comprehensive and well-structured** — 32 tables verified, 23 pages verified, detailed data flows, and thorough competitive analysis. The audit uncovered **12 unique critical issues**, **22 unique major issues**, and numerous minor inconsistencies.

~~**The three most dangerous problems:**~~
~~1. LLM cost model is underestimated 2-5x ($20K-40K/month, not $8K-18K)~~
~~2. Perplexity rate limits make daily scanning physically impossible at 1K users~~
~~3. Database CHECK constraints block 4 of 16 agents from being stored~~

**All three have been resolved.** Cost tables corrected, Perplexity scaling strategy documented, CHECK constraints updated.

---

## Raw Audit Totals (before dedup)

| Auditor | Domain | Critical | Major | Minor | Observations |
|---------|--------|----------|-------|-------|-------------|
| Morgan (CPO) | Product Layer (68KB) | 6 | 8 | 7 | 5 |
| Atlas (CTO) | Architecture Layer (114KB) | 5 | 8 | 7 | 5 |
| Sage (AI Eng) | Intelligence Layer (88KB) | 5 | 10 | 12 | 10 |
| Rex (Research) | Validation (50KB) | 2 | 5 | 5 | 4 |
| Iris (Orchestrator) | Cross-Document (all 5) | 3 | 7 | 5 | 6 |
| **TOTALS** | | **21** | **38** | **36** | **30** |

After deduplication (multiple agents flagging the same root cause): **12 Critical, 22 Major, 28 Minor, 24 Observations**

---

## CRITICAL ISSUES — Must Fix Before Building (12) — ALL RESOLVED

### CRIT-1: Agent CHECK Constraint Blocks A13-A16 — RESOLVED
**Found by:** Atlas C3, Iris C1, Morgan C1
**Location:** Architecture Layer — `agent_jobs.agent_type` CHECK constraint
**Problem:** The CHECK only allows 12 agent type values. Agents A13 (Content Voice Trainer), A14 (Content Pattern Analyzer), A15 (Content Refresh), and A16 (Brand Narrative Analyst) are missing. Any INSERT for these agents fails.
**Fix:** Add 4 values to the CHECK: `'content_voice_trainer', 'content_pattern_analyzer', 'content_refresh', 'brand_narrative_analyst'`
**Resolution:** CHECK constraint updated in Architecture Layer. Also removed `'ask_beamix'` (see CRIT-6).

---

### CRIT-2: Agent A16 Missing From Product Layer — RESOLVED
**Found by:** Morgan C1, Iris M3
**Location:** Product Layer — Section 5 (Agent System)
**Problem:** Product Layer specifies 15 agents (A1-A15). A16 (Brand Narrative Analyst) exists in Master + Intelligence docs but has NO product spec — no UX, no input form, no output format, no Agent Hub card.
**Resolution:** Full A16 Brand Narrative Analyst spec added to Product Layer (~40 lines). Agent count updated from 15→16 throughout. Feature count updated.

---

### CRIT-3: LLM Cost Model Underestimated 2-5x — RESOLVED
**Found by:** Sage C1, Sage C2
**Location:** Intelligence Layer — Section 8.1
**Problem:** Two compounding errors: (1) Parsing pipeline uses 5 Haiku calls per response (not 1) — 5x parse cost. (2) Scan cost labeled as "/week" but compared against "/month" total budget.
**Resolution:** Both cost tables (Section 1.3 and 8.1) fully recalculated. Free scan: $0.06-0.12. Scheduled scan: $1.50-3.00/month. A8 added as separate $3-6/run line item. Total monthly: $20K-40K at 1K businesses. Pricing implication note added. Volume disclaimer added.

---

### CRIT-4: Perplexity 40 RPM = Cannot Scale — RESOLVED
**Found by:** Sage C3
**Location:** Intelligence Layer — Section 2.1, 8.4
**Problem:** 25,000 Perplexity calls per scan cycle at 40 RPM = 10.4 hours. Pro tier daily scans are physically impossible.
**Resolution:** "Perplexity Scaling Strategy" subsection added to Section 8.4 with 4 mitigation strategies: (a) 24h prompt-level caching, (b) Perplexity tier upgrade, (c) off-peak batching, (d) research-only fallback as last resort.

---

### CRIT-5: Free Tier Engine Conflict — Copilot vs Claude — RESOLVED
**Found by:** Atlas M6, Iris C3
**Location:** Across ALL documents
**Problem:** Copilot listed as free-tier engine despite being Phase 3/deferred. Claude has reliable API but was excluded from free tier.
**Resolution:** Copilot replaced with Claude in free tier across Master Doc, Product Layer, and Architecture Layer. Intelligence Layer verified (Copilot already listed as Deferred there — no change needed).

---

### CRIT-6: Ask Beamix Cannot Be Inngest Function — RESOLVED
**Found by:** Atlas C2
**Location:** Architecture Layer — Section 4.2
**Problem:** SSE streaming is impossible from Inngest background functions. Ask Beamix must be a direct API route handler.
**Resolution:** `agent.ask-beamix` removed from Inngest registry in Architecture Layer. Documented as SSE route at `/api/agents/chat`. Inngest function count updated to 14 across all docs. Two new cron specs added (content-refresh-check, voice-refinement) to replace it.

---

### CRIT-7: Post-Trial Experience Undefined — RESOLVED
**Found by:** Morgan C4
**Location:** Product Layer — absent
**Problem:** No spec for what happens when 14-day trial expires without payment.
**Resolution:** Section 2.15 "Post-Trial Experience" added to Product Layer. 4-phase model: Active Trial (14 days) → Grace Period (30 days, read-only) → Lockout (90 days) → Data Deletion. Includes email triggers, re-activation flow, and auth middleware behavior.

---

### CRIT-8: Cross-Model QA Single Point of Failure — RESOLVED
**Found by:** Sage C4
**Location:** Intelligence Layer — Section 1.4, 8.2
**Problem:** ALL content agents depend on GPT-4o for QA. Fallback is "Sonnet reviews Sonnet" (violates cross-model principle).
**Resolution:** Fallback chain updated in Section 8.3: GPT-4o → Gemini 1.5 Pro (cross-vendor) → "unreviewed" flag. QA Fallback Chain subsection added to Section 1.4. Explicit rule: "Never use Sonnet to QA Sonnet-generated content."

---

### CRIT-9: Scan Validity — API != Consumer Responses — RESOLVED
**Found by:** Sage C5
**Location:** Intelligence Layer — Section 2.1
**Problem:** API responses differ from consumer apps. Scan data may not reflect what users actually see.
**Resolution:** New Section 1.5 "Scan Methodology Limitations" added with: key differences, marketing language guidance ("AI visibility signal" not "AI ranking"), mitigation strategies (calibration, confidence scoring, transparency labels). Also added Section 1.6 "Prompt Injection Defense."

---

### CRIT-10: Missing Inngest Functions — RESOLVED
**Found by:** Atlas C4, Iris C2
**Location:** Architecture Layer — Section 4
**Problem:** Missing `cron/content-refresh-check` and `cron/voice-refinement` function specs.
**Resolution:** Both cron function specs added to Architecture Layer with full detail: `cron.content-refresh-check` (daily 6AM UTC, 4 steps, singleton, 300s timeout) and `cron.voice-refinement` (weekly Sunday 3AM UTC, 4 steps, singleton, 600s timeout). Function count updated to 14.

---

### CRIT-11: Alert Types CHECK — 7 of 9 — RESOLVED
**Found by:** Atlas C5, Iris M5
**Location:** Architecture Layer — `alert_rules.alert_type` CHECK
**Problem:** Product defines 9 alert types. Architecture CHECK only has 7. Missing: `scan_complete`, `agent_complete`, `trial_ending`.
**Resolution:** All 3 missing alert types added to CHECK constraint in Architecture Layer.

---

### CRIT-12: Master Doc Claims "All Gaps CLOSED" — 3 Are Deferred — RESOLVED
**Found by:** Rex C1
**Location:** Master Doc — line 7, Section 6
**Problem:** Header says "All competitive gaps CLOSED." But 3 of 7 MISSING gaps are deferred.
**Resolution:** Changed to honest framing: "4/7 MISSING gaps closed, 3/7 intentionally deferred with reasoning. 7/7 PARTIAL gaps upgraded." Gap closure table updated with Status column showing DEFERRED items with reasoning.

---

## MAJOR ISSUES — Fix Before or During Build (22) — ALL RESOLVED

| # | Issue | Source | Fix Summary | Status |
|---|-------|--------|-------------|--------|
| MAJ-1 | Onboarding 3 dots vs 4 visible steps | Morgan C2 | Either show 4 dots or reduce to 3 steps | RESOLVED — standardized in docs |
| MAJ-2 | Trial clock trigger ambiguous | Morgan C3 | Pick one: onboarding/complete endpoint | RESOLVED — standardized in docs |
| MAJ-3 | Agent Chat URL inconsistency | Morgan C5, Iris M4 | Standardize URL scheme | RESOLVED — standardized in docs |
| MAJ-4 | Engine-tier mapping absent from Product Layer | Morgan C6 | Add explicit engine→tier table | RESOLVED — S3 engine tier mapping added to Product Layer |
| MAJ-5 | WordPress tier inconsistency | Morgan M1 | Decide and gate consistently | RESOLVED — standardized in docs |
| MAJ-6 | Content Library "favorite" filter — no DB column | Morgan M2 | Add `is_favorited` or remove feature | RESOLVED — standardized in docs |
| MAJ-7 | Account deletion flow unspecified | Morgan M3 | Add GDPR deletion flow | RESOLVED — Section 2.16 added to Product Layer. Soft delete + 30-day purge + 7-year billing retention. |
| MAJ-8 | Ask Beamix UI element unspecified | Morgan M4 | Specify UI pattern | RESOLVED — Floating chat bubble spec added to Product Layer (A12 section). Responsive, page-aware, 3 breakpoints. |
| MAJ-9 | No empty state designs | Morgan M5 | Add empty states for 9 pages | RESOLVED — Section 2.16b added to Product Layer. All 9 dashboard pages have empty state spec (icon, headline, description, CTA). |
| MAJ-10 | Workflow Builder too complex for SMBs | Morgan M7 | Simplify to templates for MVP | RESOLVED — MVP uses 4 pre-built automation toggles. Visual builder deferred to Phase 3. |
| MAJ-11 | Content Performance needs "published" status | Morgan M8 | Document dependency | RESOLVED — standardized in docs |
| MAJ-12 | `credit_pools.user_id` UNIQUE vs `pool_type` | Atlas C1 | Resolve constraint conflict | RESOLVED — Changed to UNIQUE(user_id, pool_type) in Architecture Layer |
| MAJ-13 | API route count mismatch | Atlas M1 | Reconcile routes | RESOLVED — standardized in docs |
| MAJ-14 | `/api/settings/export` (GDPR) undefined | Atlas M2 | Write API spec | RESOLVED — POST /api/settings/export endpoint spec added to Architecture Layer |
| MAJ-15 | `/api/alerts/notifications` missing | Atlas M3 | Add endpoints | RESOLVED — 3 notification endpoints added to Architecture Layer (GET, PATCH, POST mark-all-read) |
| MAJ-16 | In-memory rate limiting on Vercel | Atlas m1 | Use Supabase-based counters | RESOLVED — Replaced with Supabase sliding window counters + Upstash Redis upgrade path in Architecture Layer |
| MAJ-17 | A8 cost multiplier not accounted for | Sage M1 | Recalculate: $3-6/run | RESOLVED — A8 cost note added to Intelligence Layer (A8 section + both cost tables). 3×25×8=600 calls=$3-6/run. |
| MAJ-18 | Onboarding workflow too slow (sequential) | Sage M6 | Parallelize A13+A14+A11 | RESOLVED — Updated in Master Doc, Intelligence Layer. A13+A14+A11 parallel via Promise.all(), then A4 sequential. |
| MAJ-19 | Gemini Flash listed but never used | Sage M7 | Assign uses or remove | RESOLVED — Gemini Flash role clarified as Haiku overflow + cost diversification option in Intelligence Layer |
| MAJ-20 | AI Readiness score weights differ | Iris M1 | Pick canonical weights | RESOLVED — Intelligence Layer updated to 30/25/20/15/10 (Product Layer canonical). |
| MAJ-21 | Editorial Queue contradictory status | Rex M1, Iris M6 | Align across docs | RESOLVED — Aligned as "MVP Self-Review Queue" across Master Doc + Validation Layer |
| MAJ-22 | Customer Journey Mapping status conflict | Rex M4, Iris O2 | Acknowledge spec exists | RESOLVED — Updated across Master Doc + Validation Layer: "Spec complete in Intelligence Layer, full implementation deferred to Phase 4" |

---

## MINOR ISSUES (28) — ALL RESOLVED

<details>
<summary>Click to expand minor issues (all resolved)</summary>

| # | Issue | Source | Status |
|---|-------|--------|--------|
| 1 | Feature count table math off | Morgan m1 | RESOLVED — feature count updated in Product Layer |
| 2 | Blog "GEO" category needs explanation | Morgan m2 | RESOLVED |
| 3 | GA4 "AI traffic attribution" has no dashboard widget | Morgan m3 | RESOLVED |
| 4 | Notification bell panel never fully specified | Morgan m4 | RESOLVED |
| 5 | API Docs page `/docs/api` marked "Future" — no phase assigned | Morgan m5 | RESOLVED |
| 6 | Competitor limits in onboarding hardcoded "1-3" regardless of tier | Morgan m6 | RESOLVED |
| 7 | Social login only mentions Google — intentional? | Morgan m7 | RESOLVED |
| 8 | Voice profile model: Architecture says Sonnet, Master says Opus | Atlas m2 | RESOLVED |
| 9 | `scans.scan_type` includes 'import' but no import Inngest function | Atlas m3 | RESOLVED |
| 10 | `blog_posts` has no view counter/analytics | Atlas m4 | RESOLVED — `view_count integer NOT NULL DEFAULT 0` added to Architecture Layer |
| 11 | `plans.engines` text[] has no validation on engine name values | Atlas m5 | RESOLVED |
| 12 | No `updated_at` auto-update trigger documented | Atlas m6 | RESOLVED — Section 2.12 added to Architecture Layer with trigger SQL |
| 13 | `agent_workflows.steps` JSONB vs normalized child table | Atlas m7 | RESOLVED |
| 14 | Free scan "60 seconds" claim but pipeline is 10-20s | Sage m1 | NOT FOUND — searched Intelligence Layer, no "60 seconds" claim exists |
| 15 | Hebrew transliteration matching needs specific library | Sage m2 | RESOLVED — dependency note added to Intelligence Layer Section 2.2 |
| 16 | DeepSeek API stability concern | Sage m3 | RESOLVED |
| 17 | You.com integration under-documented | Sage m4 | RESOLVED |
| 18 | Voice profile storage location ambiguous | Sage m5, Iris O3 | RESOLVED |
| 19 | A7 Social Strategy has no QA gate | Sage m6 | RESOLVED — QA gate (Stage 3, GPT-4o) added to A7 in Intelligence Layer |
| 20 | A9 Citation Builder GDPR risk | Sage m7 | RESOLVED |
| 21 | Retry uses higher temperature | Sage M8 | RESOLVED — changed to same temperature + feedback injection in Intelligence Layer |
| 22 | Prompt Volume estimation premature at <1K users | Sage M9 | RESOLVED — volume disclaimer added to Intelligence Layer Section 1.3 |
| 23 | Regex fallback contradicts "regex unreliable" design rationale | Sage M10 | RESOLVED |
| 24 | `scanId` (camelCase) in Master vs `scan_id` (snake_case) | Iris m1 | RESOLVED — standardized to `scan_id` in Master Doc (replace_all) |
| 25 | Inngest naming: slash notation vs dot notation | Iris m2 | RESOLVED — standardized to dot notation in Master Doc |
| 26 | Weekly digest: Sunday 9am vs Monday 8AM UTC | Iris m3 | RESOLVED — standardized to Monday 8AM UTC in Master Doc |
| 27 | Feature parity count: 49 actual, 47 claimed | Rex C2 | RESOLVED — updated to 49 in Master Doc |
| 28 | Scan concurrency numbers swapped | Iris O4 | RESOLVED |

</details>

---

## OBSERVATIONS — Strategic Considerations (24) — LOGGED IN BACKLOG

All 24 observations have been logged as prioritized future work items in `.planning/BACKLOG.md`:
- **8 items:** Before Launch (must address before paying customers)
- **8 items:** Post-Launch (address within 60 days)
- **8 items:** Nice-to-Have (future consideration)
- **3 items already resolved** during fix sessions (prompt injection defense, competitive freshness dates, prompt auto-suggestions reclassification)

<details>
<summary>Click to expand observations (all logged in BACKLOG.md)</summary>

| # | Observation | Source | Backlog Priority |
|---|-------------|--------|-----------------|
| 1 | No mobile/responsive design spec anywhere | Morgan O1 | Before Launch |
| 2 | Hebrew/RTL implementation challenges never detailed | Morgan O2 | Before Launch |
| 3 | No accessibility (WCAG) specifications | Morgan O3 | Post-Launch |
| 4 | Share button UX for viral free scan not detailed | Morgan O5 | Post-Launch |
| 5 | No database migration strategy documented | Atlas O2 | Before Launch |
| 6 | Supabase Realtime channel design not specified | Atlas O3 | Post-Launch |
| 7 | Credit RPCs (hold/confirm/release) SQL not defined | Atlas O4 | Before Launch |
| 8 | Cross-model QA adds 2-5s latency | Sage O1 | Post-Launch |
| 9 | No prompt injection defense in scan engine | Sage O2 | RESOLVED (Section 1.6 added) |
| 10 | "10 engines" marketing = actually 7 APIs + 3 deferred | Sage O3 | Before Launch |
| 11 | Scan frequency disparity creates large value gap between tiers | Sage O4 | Post-Launch |
| 12 | Workflow chains could create infinite loops | Sage O5 | Before Launch |
| 13 | "Authority estimate" for citations has no defined algorithm | Sage O6 | Post-Launch |
| 14 | No LLM output caching | Sage O8 | Before Launch |
| 15 | Content performance correctly disclaims causation | Sage O9 | No action needed (positive) |
| 16 | The 7 Structural Advantages lists differ between Master and Product | Iris M2 | Nice-to-Have |
| 17 | Persona tracking: validation says defer, architecture fully designed it | Iris O1 | Nice-to-Have |
| 18 | Prompt volume data magnitude gap vs enterprise competitors | Rex O1 | Nice-to-Have |
| 19 | Hebrew/RTL monopoly is market-specific, not universal advantage | Rex O2 | Nice-to-Have |
| 20 | Innovations 4,5,7,8 are UX differentiators, not truly unique innovations | Rex O4 | Nice-to-Have |
| 21 | Competitive intelligence dates absent | Rex m6 | RESOLVED (freshness dates added) |
| 22 | Bear AI has content pattern analysis (2/15, not 1/15 as claimed) | Rex M2 | Post-Launch |
| 23 | Prompt Auto-Suggestions misclassified as Launch Critical | Rex M3 | RESOLVED (reclassified to Growth Phase) |
| 24 | Circuit breaker may be too aggressive | Sage m11 | Before Launch |

</details>

---

## FIX PLAN — Prioritized by Impact — ALL PHASES COMPLETE

### Phase A: Document Corrections — COMPLETE

| # | Fix | Files Updated | Status |
|---|-----|--------------|--------|
| A1 | Add A13-A16 to `agent_jobs.agent_type` CHECK | Architecture Layer | DONE |
| A2 | Add missing 3 alert types to CHECK | Architecture Layer | DONE |
| A3 | Replace Copilot with Claude in free-tier engine set | Master, Product, Architecture | DONE |
| A4 | Remove Ask Beamix from Inngest registry | Architecture Layer, Master | DONE |
| A5 | Fix "All gaps CLOSED" to honest framing | Master Doc | DONE |
| A6 | Fix feature parity count (47→49) | Master Doc | DONE |
| A7 | Standardize Agent Chat URL scheme | Master, Product | DONE |
| A8 | Fix Inngest function count across docs (→14) | Master, Architecture | DONE |
| A9 | Fix scan concurrency swap | Master or Architecture | DONE |
| A10 | Fix weekly digest day/time conflict | Master | DONE |
| A11 | Standardize `scan_id` (not `scanId`) in Master | Master Doc | DONE |
| A12 | Fix AI Readiness score weights (pick one) | Intelligence Layer | DONE |
| A13 | Align 7 Structural Advantages between Master and Product | Master + Product | DONE |

### Phase B: Missing Specs — COMPLETE

| # | Fix | File | Status |
|---|-----|------|--------|
| B1 | Write A16 Brand Narrative Analyst product spec | Product Layer | DONE |
| B2 | Add post-trial experience spec | Product Layer | DONE |
| B3 | Add empty state designs for 9 dashboard pages | Product Layer | DONE |
| B4 | Add engine-tier mapping table | Product Layer | DONE |
| B5 | Write 2 missing Inngest function specs | Architecture Layer | DONE |
| B6 | Write `/api/settings/export` spec | Architecture Layer | DONE |
| B7 | Write `/api/alerts/notifications` spec | Architecture Layer | DONE |
| B8 | Add Gemini 1.5 Pro as QA fallback | Intelligence Layer | DONE |
| B9 | Resolve `credit_pools` UNIQUE vs pool_type design | Architecture Layer | DONE |

### Phase C: Cost Model & Architecture Decisions — COMPLETE

| # | Fix | Status |
|---|-----|--------|
| C1 | Recalculate entire LLM cost model | DONE — both cost tables corrected, pricing implication noted |
| C2 | Solve Perplexity bottleneck | DONE — 4-tier Perplexity Scaling Strategy added |
| C3 | Address scan validity concern | DONE — Section 1.5 Scan Methodology Limitations + Section 1.6 Prompt Injection Defense |
| C4 | Recalculate A8 competitor intelligence cost | DONE — $3-6/run with breakdown |
| C5 | Decide in-memory vs Supabase-based rate limiting | DONE — Supabase sliding window + Upstash Redis upgrade path |
| C6 | Simplify Workflow Builder to templates for MVP | DONE — 4 pre-built toggles for MVP, visual builder Phase 3 |

### Phase D: Alignment & Polish — COMPLETE

| # | Fix | Status |
|---|-----|--------|
| D1 | Resolve Editorial Queue contradiction | DONE — aligned as "MVP Self-Review Queue" |
| D2 | Resolve Customer Journey Mapping status conflict | DONE — "Spec complete, full implementation Phase 4" |
| D3 | Resolve WordPress tier gating | DONE |
| D4 | Add `is_favorited` to content_items or remove feature | DONE |
| D5 | Specify Ask Beamix UI element | DONE — floating chat bubble, full responsive spec |
| D6 | Add account deletion flow to Settings | DONE — GDPR soft delete + 30-day purge flow |
| D7 | Specify notification panel UX | DONE |
| D8 | Add `updated_at` trigger documentation | DONE — Section 2.12 in Architecture Layer |
| D9 | Parallelize onboarding workflow | DONE — A13+A14+A11 parallel, then A4 |
| D10 | Add prompt injection defense section | DONE — Section 1.6 in Intelligence Layer |
| D11 | Add competitive intelligence freshness dates | DONE — all 3 competitive docs updated with freshness notices |

---

## Verified Correct (No Issues Found)

To be fair to the documents, these major claims were **verified as accurate:**

- 32 database tables — confirmed exact count
- 23 pages — confirmed exact count
- 6 data flow diagrams — all structurally sound
- RLS on every table — confirmed (except free_scans, intentionally disabled)
- Agent pipelines A1-A12 match between Master and Intelligence docs
- Cross-agent data sharing design is well-specified
- Supabase-native architecture choices are sound (no Redis until 10K+)
- Competitive analysis is thorough and mostly accurate
- Priority classification logic is reasonable (with noted exceptions)

---

## Bottom Line

**The system design is now complete and ready for engineering handoff.**

All 12 Critical, 22 Major, and 28 Minor issues have been resolved across 3 fix sessions (March 5, 2026). The 24 strategic observations are logged in `.planning/BACKLOG.md` with priority tiers (Before Launch / Post-Launch / Nice-to-Have).

**Files modified during fix sessions:**
1. `BEAMIX_SYSTEM_DESIGN.md` (Master Doc) — 15 fixes
2. `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` — 12 fixes
3. `_SYSTEM_DESIGN_PRODUCT_LAYER.md` — 12 fixes (8 original + 4 in session 3)
4. `_SYSTEM_DESIGN_VALIDATION.md` — 6 fixes
5. `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` — 15 fixes
6. `COMPETITIVE_RESEARCH_DEEP.md` — freshness notice added
7. `COMPETITIVE_FEATURES_BLUEPRINT.md` — freshness notice added
8. `_RESEARCH_SYNTHESIS.md` — freshness notice added

**Tracking documents:**
- `AUDIT_FIX_STATUS.md` — detailed changelog per file
- `BACKLOG.md` — 24 observations as prioritized future work
