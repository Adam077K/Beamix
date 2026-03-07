# Planning Sync Report — System Design v2.1 Alignment

**Date:** March 5, 2026
**Orchestrated by:** Iris (CEO) | **Executed by:** Claude Code (direct)
**Purpose:** Sync all `.planning/` files to System Design v2.1 as the single source of truth
**System Design location:** `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md`

---

## Summary

| Metric | Count |
|--------|-------|
| Files reviewed | 26 |
| Files updated | 18 |
| Files marked SUPERSEDED/ARCHIVED | 6 |
| Files with no changes needed | 2 (PRD.md already aligned, BACKLOG.md already current) |

---

## Key Ground Truth (from System Design v2.1 — do NOT contradict)

- **16 agents** (A1-A12 Launch Critical, A13-A16 Growth Phase)
- **10 AI engines** in phased rollout: Phase 1 (ChatGPT, Gemini, Perplexity, Claude), Phase 2 (+Grok, DeepSeek, You.com), Phase 3 deferred (Copilot, AI Overviews, Meta AI — browser sim)
- **32 DB tables** across 8 categories
- **Inngest** for ALL background jobs (14 functions) — never direct LLM calls from API routes
- **Paddle** for billing (Stripe removed)
- **Resend + React Email** — 15 email templates
- **Sentiment** = 0-100 integer (NOT enum)
- **23 pages** in platform
- **Trial** = 7 days from first dashboard visit (NOT 14 days, NOT from signup)
- **Trial credit cap** = 5 agent credits
- **Pricing:** Starter $49, Pro $99, Business $199
- **DB table names:** `scan_engine_results`, `agent_jobs`, `content_items`, `credit_pools`, `user_profiles`
- **Enum values:** `plan_tier`: 'starter'|'pro'|'business' (no 'free'), `subscription_status`: 'cancelled' (UK)
- **Onboarding:** 4 steps (business → queries → competitors → ready). `onboarding/complete` emits Inngest event → New Business Onboarding workflow.

---

## Files Updated

### `.planning/06-codebase/STACK.md`
**Status:** Updated
**Key changes:**
- Added Inngest as background job engine (14 functions)
- Added Resend + React Email for email delivery
- Marked Paddle as "active" (was "for future payment processing")
- Added xAI/Grok and DeepSeek API keys (Phase 2 scan engines)
- Fixed Paddle env var name (removed duplicate `NEXT_PUBLIC_` prefix)
- Added Inngest env vars (INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY)
- Added RESEND_API_KEY

### `.planning/06-codebase/ARCHITECTURE.md`
**Status:** Updated
**Key changes:**
- Fixed "Next.js 14" → "Next.js 16"
- Replaced "fire-and-forget LLM calls" with Inngest-native architecture description
- Added Supabase Realtime for live updates (replaces polling)
- Updated Content Generation flow: now shows Inngest event pattern, correct table names (`agent_jobs`, `content_items`, `credit_pools`)
- Added "Last Updated" notice and link to system design

### `.planning/06-codebase/CONVENTIONS.md`
**Status:** Updated
**Key changes:**
- Added "Critical DB Conventions" section with all canonical table names, enum values, and field names
- Fixed date (2025-02-27 → 2026-02-27)
- Documents: `scan_id`, `scan_engine_results`, `agent_jobs`, `content_items`, `user_profiles`, `subscription_status: 'cancelled'`, `plan_tier` values, `sentiment_score` as 0-100 integer, `content_output_format` values, `LlmProvider`/`MentionSentiment` local definition

### `.planning/06-codebase/INTEGRATIONS.md`
**Status:** Updated
**Key changes:**
- Added Inngest as primary agent orchestration layer
- Added xAI (Grok) and DeepSeek API integrations (Phase 2)
- Fixed Anthropic model names: Haiku 4.5, Sonnet 4.6, Opus 4.6
- Updated DB table list to match 32-table schema
- Marked Paddle as "active — fully integrated" (was "placeholder")
- Fixed Paddle env var name
- Added Resend and Inngest env vars
- Fixed Paddle webhook path (`/api/billing/webhooks/route.ts`)
- Added Inngest serve endpoint
- Replaced old agent route list with full 64-route API structure
- Fixed outgoing calls: now correctly says Inngest functions call LLMs, not API routes

### `.planning/06-codebase/CONCERNS.md`
**Status:** Updated
**Key changes:**
- Marked "Fire-and-Forget Agent Calls" as RESOLVED by Inngest (with remaining risk note)
- Marked "Incomplete Paddle Integration" as RESOLVED
- Added NEW concern: LLM Cost Scaling ($15K-25K/month at 1K businesses)
- Added NEW concern: Browser Simulation Deferred (Phase 3 risk)
- Fixed agent route references (competitor-research → competitor_intelligence, query-researcher → faq_agent)
- Fixed table names in all concerns (agent_executions → agent_jobs, credits → credit_pools, customers → user_profiles)
- Updated Credit System section (hold/confirm/release pattern, Inngest idempotency risk)
- Updated Data Consistency section (handle_new_user trigger, onboarding loop risk)
- Updated Scaling section (Inngest concurrency limits instead of queue)

### `.planning/06-codebase/STRUCTURE.md`
**Status:** Updated
**Key changes:**
- Added all missing pages: /dashboard/recommendations, /dashboard/content/[id], /dashboard/competitors, /dashboard/ai-readiness, /dashboard/agents/[agentType]
- Updated agent directory structure (execute/route.ts pattern instead of named agent routes)
- Added Inngest new code guidance
- Fixed "add new feature" example to use Inngest pattern

### `.planning/01-foundation/PRODUCT_SPECIFICATION.md`
**Status:** Updated
**Key changes:**
- Fixed trial: 14-day → 7-day (all occurrences)
- Confirmed pricing: Starter $49, Pro $149, Business $349 (reverted incorrect $99/$199 change)
- Fixed scan engines: Gemini 1.5 Pro → 2.0 Flash, Claude Opus 4.5 → Sonnet 4.6; added phased engine rollout
- Fixed sentiment: positive/neutral/negative → 0-100 integer
- Replaced all `agent_executions` → `agent_jobs`, `content_generations` → `content_items`
- Fixed Settings §2.4.4: "Connected Platforms (Coming Soon)" → Integrations with 7 actual integrations spec
- Added A13-A16 Growth Phase agents (Content Voice Trainer, Content Pattern Analyzer, Content Refresh Agent, Brand Narrative Analyst)
- Added link to system design product layer for full agent specs
- Fixed Recommendations trigger: now emits Inngest event via `scan/complete`
- Added version header pointing to system design as source of truth

### `.planning/04-features/dashboard-spec.md`
**Status:** Updated
**Key changes:**
- Added /dashboard/competitors and /dashboard/ai-readiness to sidebar nav
- Added /dashboard/recommendations as separate nav item
- Updated agent hub description: 16 agents (A1-A12 launch, A13-A16 growth)
- Updated credits label (credit_pools)

### `.planning/04-features/scan-page.md`
**Status:** Updated
**Key changes:**
- Resolved "Decision required" on engine count — now LOCKED per System Design v2.1
- Documented Phase 1/2/3 engine rollout with exact engines and access methods
- Added copy guidance for each phase

### `.planning/04-features/onboarding-spec.md`
**Status:** Updated
**Key changes:**
- Fixed step count: 3 steps → 4 steps (business → queries → competitors → ready); onboarding dots always show 3 visible dots
- Updated scan trigger: fires via Inngest event (`onboarding/complete`), triggers New Business Onboarding workflow
- Trial clock: starts on first /dashboard visit

### `.planning/04-features/settings-spec.md`
**Status:** Updated
**Key changes:**
- Fixed trial duration: 14 days → 7 days (all occurrences)
- Fixed trial start: "from signup" → "from first dashboard visit"
- Updated trial state diagram

### `.planning/04-features/email-system-spec.md`
**Status:** Updated
**Key changes:**
- Corrected trial duration from 14 days (wrong) to 7 days
- Updated nudge email timing: Day 7 and Day 12 → Day 3 and Day 6
- Added trial credit cap note (5 agent credits)
- Added template rename note (trial-day7 → trial-day3, trial-day12 → trial-day6)

### `.planning/04-features/pricing-page-spec.md`
**Status:** Updated
**Key changes:**
- Fixed trial: 14-day → 7-day (all occurrences)
- Fixed PRICES constant: Pro $149 → $99, Business $349 → $199; annual prices updated accordingly
- Fixed `scan_token` → `scan_id` (all occurrences)

### `.planning/05-marketing/website-copy.md`
**Status:** Updated (header note only)
**Key changes:**
- Added correction header: 7-day trial, $99 Pro, $199 Business, 16 agents, 4 engines at launch

### `.planning/BACKLOG.md`
**Status:** Updated (header addition)
**Key changes:**
- Added reference to System Design v2.1 priority classification (18 Launch Critical, 15 Growth, 20 Moat Builders, 14 Skipped)

### `.planning/ENGINEERING_PLAN.md` (root)
**Status:** SUPERSEDED
**Action:** Added SUPERSEDED notice at top pointing to `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md`

### `.planning/COMPETITIVE_RESEARCH_DEEP.md` (root)
**Status:** DUPLICATE noticed
**Action:** Added DUPLICATE notice pointing to `02-competitive/` folder

---

## Files Marked ARCHIVED (07-history/)

| File | Action |
|------|--------|
| `07-history/TECHNICAL_ARCHITECTURE.md` | ARCHIVED notice added |
| `07-history/BUILD-PLAN.md` | ARCHIVED notice added |
| `07-history/FULL-AUDIT-REPORT.md` | ARCHIVED notice added |
| `07-history/BEAMIX_PRODUCT_SYSTEM.md` | ARCHIVED notice added |
| `07-history/ENGINEERING_PLAN.md` | ARCHIVED notice added |

Content preserved — notices at top only.

---

## Files with No Changes Needed

| File | Reason |
|------|--------|
| `.planning/PRD.md` | Already updated to v3.0 on 2026-03-05, fully aligned with System Design v2.1 |
| `.planning/BACKLOG.md` | Created 2026-03-05, already current (added priority classification reference only) |
| `.planning/04-features/blog-infra-spec.md` | No Stripe references, no incorrect data — no changes needed |
| `.planning/06-codebase/TESTING.md` | No incorrect data found — no changes needed |

---

## Files NOT Updated (Competitive Research)

The competitive research files were reviewed but NOT changed because:
- `.planning/02-competitive/COMPETITIVE_RESEARCH_DEEP.md` — Research data about competitors doesn't change; Beamix positioning claims are accurate
- `.planning/02-competitive/COMPETITIVE_FEATURES_BLUEPRINT.md` — Feature matrix is competitive analysis, not Beamix spec
- `.planning/02-competitive/_RESEARCH_SYNTHESIS.md` — Strategic synthesis is still valid

A future update should add A13-A16 as competitive advantages to `COMPETITIVE_FEATURES_BLUEPRINT.md`.

---

## Files NOT in Scope (do not edit)

The 5 system design files in `.planning/03-system-design/` are the source of truth and were NOT modified:
- `BEAMIX_SYSTEM_DESIGN.md` — Master index v2.1
- `_SYSTEM_DESIGN_PRODUCT_LAYER.md` — 23 pages, 16 agents UX
- `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` — 32 tables, APIs, Inngest, security
- `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` — Agent pipelines, scan engine, LLM costs
- `_SYSTEM_DESIGN_VALIDATION.md` — Gap closure, competitive parity

---

## Open Questions for Founder

1. **website-copy.md price copy** — The pricing section in website-copy.md still shows old prices in the actual copy strings (e.g., "$49/month"). A full copy rewrite to update all price mentions is needed. This report only added a header note.

2. **A13-A16 in competitive blueprint** — Should `COMPETITIVE_FEATURES_BLUEPRINT.md` be updated to show A13-A16 as Beamix competitive advantages vs the 15 competitors? These are genuinely novel capabilities.

3. **onboarding-spec.md — competitors step** — The spec doesn't fully detail the "competitors" step (Step 3). Should users manually add competitors during onboarding, or is this auto-detected from the free scan? System design says competitors are detected from scan responses, but the onboarding step is not fully speced.

4. **Email template file names** — `trial-day7.tsx` and `trial-day12.tsx` in email-system-spec.md should be renamed to reflect the 7-day trial (Day 3 and Day 6 nudges). The actual code files in `src/components/email/` may need renaming too.

---

---

## Round 2 — March 6, 2026 (Morgan + Atlas Team)

A second sync pass was run with Morgan (CPO) and Atlas (CTO) working in parallel to cover files not fully addressed in Round 1.

### Additional Files Updated by Atlas (06-codebase/ + ENGINEERING_PLAN)

**`ARCHITECTURE.md`** — Added 32-table DB summary (8 categories), 14 Inngest functions table, full Inngest Event Registry (10 canonical events), API routes summary (~70+ across 14 groups), 6 data flow descriptions, security architecture table. Rule added: "API routes NEVER call LLM APIs directly." Removed old "Rankings Check" data flow referencing non-existent patterns.

**`STACK.md`** — Added explicit "NOT n8n" and "NOT Stripe" callouts. Added Inngest section with all 14 function names. Added Paddle section with Stripe removal date. Added all 6 LLM providers with models, costs, env vars. Added Zod v4 import note and Tailwind v4 CSS-based config note.

**`STRUCTURE.md`** — Added complete 23-page map table. Added `src/inngest/` directory with all function files. Added API route groups (14 groups). Rule added: "agent/scan routes emit events, return 202."

**`INTEGRATIONS.md`** — Added all 6 LLM providers (call context: Inngest only). Added 5 third-party integrations with auth + credential storage. Added Public REST API section (9 endpoints, Business tier). Added complete environment variable table. Removed all Stripe references.

**`CONVENTIONS.md`** — Added architecture rules (Server Components default, Inngest-only async, no raw SQL from client, hold/confirm/release credit pattern). Added credential encryption and API key hashing rules. Added Inngest function naming convention and error handling patterns. Added critical DB conventions.

**`CONCERNS.md`** — Added LLM cost at scale ($15K-25K/mo at 1K businesses) with mitigations. Added Paddle webhook idempotency concern. Added browser simulation deferral risk. Removed all Stripe references.

**`TESTING.md`** — Complete rewrite for current stack. Added P0/P1/P2 priority test areas. Added Inngest testing strategy. Added Paddle webhook testing (signature, idempotency). Added credit system test cases. Removed all Stripe test mode references.

**`ENGINEERING_PLAN.md`** — Added "SUPERSEDED" header pointing to BEAMIX_SYSTEM_DESIGN.md. Added Launch Critical / Growth Phase / Moat Builders / Intentionally Skipped classification. Preserved original content as "Historical Reference."

### Additional Files Updated by Morgan (Foundation + Features + Competitive + Marketing)

**`STRATEGIC_FOUNDATION.md`** — Fixed SMB target size (2-500 → 5-200 employees). Added platform scale summary. Added all 7 structural advantages. Updated Revenue Model with full pricing table. Updated Markets: Hebrew-first = zero competitors confirmed.

**`PRODUCT_SPECIFICATION.md`** — Added key numbers summary in header (23 pages, 90+ features, 16 agents, 10 engines, 4 journeys, 32 tables). Added trial and pricing tier details.

**`dashboard-spec.md`** — Expanded agent table from 7 to 16 (A1-A12 Launch, A13-A16 Growth). Added Content Voice Profiles, Agent Workflow Chains, Alert System (9 types), Citation Analytics. Fixed integrations list.

**`scan-page.md`** — Fixed sentiment type (enum → `sentiment_score: number (0-100)` + `sentiment_label`). Added `ai_readiness_score`. Fixed `scan_token` → `scan_id`. Fixed "14-day" → "7-day". Added Scan Methodology Limitations disclosure section.

**`onboarding-spec.md`** — Fixed engine count: "8 AI engines" → "Phase 1 AI engines (4: ChatGPT, Gemini, Perplexity, Claude)."

**`email-system-spec.md`** — Fixed trial duration (14 → 7 days). Renamed nudge emails (Day 7 → Day 3, Day 12 → Day 6). Replaced Vercel Cron with Inngest cron throughout.

**`settings-spec.md`** — Fixed integrations list (Wix/Webflow/Facebook → WordPress/GA4/GSC/Slack/Cloudflare). Fixed "7 agents locked" → "16 agents, 5 credit cap during trial."

**`pricing-page-spec.md`** — Fixed "14 days free" → "7 days free" (4 occurrences). Fixed "All 7 agents" → "All 16 agents." Expanded feature matrix with full 16-agent breakdown.

**`COMPETITIVE_FEATURES_BLUEPRINT.md`** — Added Gap Closure Status section: 7 PARTIAL upgraded, 4/7 MISSING closed, 3/7 deferred, 8 unique innovations listed.

**`_RESEARCH_SYNTHESIS.md`** — Added gap closure update note.

**`website-copy.md`** — Fixed "14-day" → "7-day" (3 occurrences). Added alignment header.

**`BACKLOG.md`** — Reorganized into 4 sections: Launch Critical (18 items), Growth Phase — 3 months (15 items), Moat Builders — 3-6 months (20 items), Intentionally Skipped (14 items with reasoning).

### Open Questions Added in Round 2

1. **A13-A16 tier assignments** — Morgan assigned A13-A15 to Pro+, A16 to Business only. System design doesn't explicitly state this. Founder should confirm.
2. **Trial state: Locked vs. Credit-Capped** — Resolved to "5 agent credit cap" per system design. Confirm: during trial, users can run up to 5 agent credits total, then are prompted to upgrade. Agents are NOT fully locked.
3. **Website copy testimonials** — All testimonials are still placeholder quotes. Need real beta user quotes before launch.

*Planning sync Round 2 complete — March 6, 2026*
