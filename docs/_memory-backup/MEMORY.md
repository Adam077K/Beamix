# Beamix — Agent Memory

## Feedback
- [Board meeting style](feedback_board_meeting_style.md) — Multi-agent critical brainstorming, validate costs against real API pricing
- [No AI labels on content](feedback_no_ai_labels.md) — Agent output reads human-written. No AI disclosure in content. User handles disclosure.
- [Supabase SQL Editor plpgsql bug](feedback_supabase_plpgsql.md) — SQL Editor splits on semicolons inside $$; local plpgsql DECLARE vars become table lookups → 42P01. Always use LANGUAGE sql + CTEs.
- [No timelines in planning](feedback_no_timeline_planning.md) — Adam ships with agent army; don't include weeks/sprints/days in plans. Plan by scope + deps + quality bar.

## Reference
- [Domain config](project_domain.md) — beamix.tech domain, notify.beamix.tech for transactional email
- [Pricing v2 (locked)](project_pricing_v2.md) — Discover $79 / Build **$189** / Scale $499. Build is NOT $199 (NIS ceiling)

## Vision (2026-04-25)
- [Vision: company, not tool](project_vision_company_not_tool.md) — Beamix is category-leading company. Past-MVP framing.
- [Beamie deferred](project_beamie_deferred.md) — Persistent character NOT in MVP. Animations YES; companion NO until base done.
- [Framer marketing deferred](project_framer_marketing_after_product.md) — Marketing site work happens AFTER product is right.
- [Quality bar — billion-dollar feel](project_quality_bar_billion_dollar.md) — Stripe/Linear/Apple/Anthropic-grade craft. NOT "good", category-defining. Every space, button, letter intentional.

## Project
GEO Platform for SMBs. Scans AI search visibility, diagnoses ranking gaps, uses agents to fix it.
Repo: https://github.com/Adam077K/Beamix
**Architecture split (2026-03-17):**
- **Marketing website:** Framer (homepage, pricing, features, about, blog) — NOT in this repo
- **Product (dashboard/app):** Next.js 16 on Vercel — this repo (`saas-platform/`)
- Landing components in `src/components/landing/` are DEPRECATED — do not update
Stack: Next.js 16, React 19, TypeScript, Supabase, Paddle (billing), Resend
NO n8n — direct LLM integration only. NO Stripe — Paddle is the only payment provider.

## Key Files
- `.planning/PRD.md` — master index
- `.planning/STRATEGIC_FOUNDATION.md` — vision, customer, market
- `.planning/PRODUCT_SPECIFICATION.md` — user journeys, features, pricing
- `.planning/TECHNICAL_ARCHITECTURE.md` — system design, DB, APIs
- `.planning/GAP-REVIEW.md` — pre-dev gap analysis (all CRITICAL items now RESOLVED)
- `saas-platform/` — Next.js app (main codebase)

## LOCKED DECISIONS (2026-02-28, updated 2026-03-06)

### Pricing (FINAL — 2026-03-06)
- **Starter:** $49/mo (annual: $39/mo)
- **Pro:** $149/mo (annual: $119/mo)
- **Business:** $349/mo (annual: $279/mo)

### AI Engines by Tier (updated 2026-03-06 — Copilot removed, no public API)
- **Free / Starter (3):** ChatGPT, Gemini, Perplexity
- **Pro (7):** Free 3 + Claude, Google AI Overviews, Grok (X), You.com
- **Business (9+):** Pro 7 + TBD
- Bing Copilot: Phase 3 deferred (browser simulation only, no API)

### Naming: scan_id (not scan_token)
Use `scan_id` everywhere in URLs, DB columns, API params.

### Free Scan Import Flow (C3)
Free scan IS the first dashboard scan. Onboarding detects `?scan_id=` param → skips POST /api/scan/start → links `free_scans.converted_user_id = user_id` → creates `businesses` record from scan data → redirects to `/dashboard` with data pre-loaded.

### Trial Start (C4)
7-day trial clock starts on **first dashboard visit** (not signup, not scan completion).

### DB Schema (C5)
Two separate tables:
- `free_scans` — anonymous one-time scans (JSONB blob for results)
- `scans` + `scan_engine_results` — authenticated recurring scans (normalized rows)
Import flow converts free_scans → scans on signup. NOTE: correct table names are `scans` (NOT `scan_results`) and `scan_engine_results` (NOT `scan_result_details`).

### No n8n (C6)
Direct LLM API integration. No n8n orchestration. Build scan engine in Next.js API routes.

### Other Decisions
- Onboarding dots: always show 3 dots (hide Step 0 from count even if shown)
- Onboarding design: 4-step full product flow (per _SYSTEM_DESIGN_PRODUCT_LAYER.md §2.7) — NOT a 3-step MVP
- Trial model: 7 days with 5 agent credits cap
- Trial includes 1 manual re-scan (to close the value loop: run agent → verify improvement)
- Manual scan rate limits: Starter 1/week, Pro 1/day, Business unlimited
- Rollover cap: 20% of monthly agent uses (confirmed from landing FAQ)
- Free scan result expiry: 30 days (user can log in and view results for 30 days)
- Content inline editor: Markdown-only textarea for v1
- Industry constants file: `src/constants/industries.ts`
- Full product build — not MVP framing. Use "Phase 1 launch" for roadmap stages.

## Current Build State (2026-03-02) — AUDITED BY SCOUT
### ALL 12 PHASES COMPLETE (verified via full code audit, not just file existence)
- Phase 0 Bootstrap: Next.js 16, React 19, Tailwind, Supabase config
- Phase 1 Auth: login, signup, forgot-password, callback, middleware (real Supabase auth)
- Phase 2 Scan Engine: /scan page, /api/scan/start, scan-results-client (940 lines, mock PRNG engine)
- Phase 3 Landing: 9 components wired into homepage
- Phase 4 Onboarding: 4-step animated flow (464 lines), /api/onboarding/complete (238 lines, converts free_scans)
- Phase 5 Dashboard: overview, rankings, agents hub, credits pages + server data fetching
- Phase 6 Agent System: 7 agents configured, 10-step execution pipeline, chat UI (453 lines)
- Phase 7 Settings: 4-tab page (business, billing, preferences, integrations) — 744 lines
- Phase 8 Pricing: full pricing page (672 lines) with toggle, feature matrix, FAQ
- Phase 9 Email: 15 Resend templates + 2 cron jobs (trial-nudges, weekly-digest)
- Phase 10 Billing: Paddle only (checkout + webhooks + portal) — Stripe removed 2026-03-02
- Phase 11 Blog: list page, [slug] page, 4 seed posts, markdown rendering

### Real LLM Wiring Complete (2026-03-08)
- `src/lib/agents/llm-runner.ts` — NEW: real Claude Sonnet agent execution, system prompts per agent type
- `src/lib/agents/execute.ts` — hold/confirm/release credit pattern (removed deduct_credits RPC usage)
- `src/lib/agents/credit-guard.ts` — FIXED: holdCredits(userId, agentType, jobId), correct p_job_id RPC params
- `src/lib/agents/qa-gate.ts` — real Claude Haiku QA evaluation (was random mock)
- `src/inngest/functions/scan-free.ts` — real engine-adapter calls, each engine a separate Inngest step
- `src/inngest/functions/scan-manual.ts` — real engine-adapter calls, plan-based engine selection (Pro gets Claude)
- `src/inngest/functions/agent-execute.ts` — fixed RPC param: p_job_id (was wrong p_hold_id)
- `src/app/api/scan/start/route.ts` — fires Inngest event instead of sync mock, returns 202
- `src/app/api/recommendations/route.ts` — POST generates A4 recommendations via Claude Haiku

### Credit RPC Pattern (aligned with actual DB functions)
hold_credits(p_user_id, p_amount, p_job_id) → confirm_credits(p_job_id) → release_credits(p_job_id)
The jobId IS the hold reference — no separate holdId needed.

### Known Issues (updated 2026-03-02 post-TypeScript fix):
1. Settings billing tab uses hardcoded data (not wired to Paddle)
2. Settings integrations tab = "Coming Soon" (intentional)
3. ~~Settings BusinessProfileTab doesn't load current values from DB~~ — FIXED
4. Mock data: scan engine (PRNG), agent outputs, settings billing display
5. ~~DB still has stripe_* columns~~ — FIXED: migration in supabase/migrations/
6. ~~Middleware deleted~~ — FIXED: src/middleware.ts restored
7. ~~INFINITE ONBOARDING LOOP~~ — FIXED (see below)
8. ~~108 TypeScript schema drift errors~~ — FIXED (2026-03-02)

## DB SCHEMA CORRECTIONS (discovered during TypeScript fix, 2026-03-02)
Key schema facts from live DB vs planned schema:

### Tables/columns
- `scan_engine_results` (NOT `scan_engine_responses`) — columns: `engine, rank_position, is_mentioned, sentiment, business_id, scan_id`
- `scans` has NO `avg_position` column
- `credit_pools` columns: `base_allocation, rollover_amount, topup_amount, used_amount` (NOT `total_credits`, `monthly_allocation`, `bonus_credits`)
- `content_items` has `agent_type` (NOT `content_type`)
- `agent_jobs` columns: `id, agent_type, status, created_at, completed_at` — NO `title, summary, is_favorited, output_type`
- `recommendations` has `suggested_agent` (NOT `agent_type`)
- `blog_posts` has `cover_image_url` (NOT `cover_image`); `category` is nullable
- `businesses.services` is `string[]` (NOT Json)

### Enum values
- `subscription_status`: UK spelling `'cancelled'` (NOT `'canceled'`)
- `plan_tier`: `'starter' | 'pro' | 'business'` — NO `'free'`; free tier = `null`
- `agent_type`: `'competitor_intelligence'` (NOT `'competitor_research'`), `'faq_agent'` (NOT `'query_researcher'`)
- `credit_transactions.transaction_type`: NO `'bonus'`; use `'topup'`
- `content_output_format`: includes `'json_ld'`, `'plain_text'`, `'structured_report'` (NOT `'json-ld'` or raw `'json'`)

### RPCs / functions
- `allocate_monthly_credits` requires `p_plan_id` param (in addition to `p_user_id`)
- `credit_transactions` insert requires `pool_id` and `pool_type` fields

### Types not in database.types.ts
- `LlmProvider` — define locally or in `constants/engines.ts`
- `MentionSentiment` — define locally where needed

### ONBOARDING BUG — ROOT CAUSE + FIX (2026-03-02)
Root cause: `handle_new_user` DB trigger was never created in a migration. No `user_profiles` row exists at signup. Onboarding route ran `UPDATE user_profiles` → 0 rows matched silently → returned success → dashboard layout saw null `onboarding_completed_at` → redirected to onboarding → infinite loop.

**Fixes:**
- `supabase/migrations/20260302_signup_trigger.sql` — creates handle_new_user trigger (user_profiles + subscriptions + notification_preferences rows at signup)
- `src/app/api/onboarding/complete/route.ts` — UPDATE→UPSERT on user_profiles, proper 500 on failure, trial dates set on subscriptions
- ⚠️ Migration must be applied in Supabase SQL Editor + backfill query for existing users

See `.planning/FIXES-2026-03-02.md` for full fix log + backfill SQL.

## BRAND BRIEF (updated 2026-03-17)

### Architecture
Marketing site: Framer (source of truth for marketing visuals, live at average-product-525803.framer.app)
Product dashboard: Next.js (follows shared brand, own design system)
Shared: colors, fonts, voice, logo. Separate: layout, components, animations.

### Personality
"The smart partner who does the work for you."
Three words: Authoritative. Direct. Warm. Tone: חד לעניין (direct, no fluff).
Target: Israeli businesses (primary) + global. Dual language: HE + EN.

### Color Palette (UPDATED 2026-03-30)
- Background: #FFFFFF / #F7F7F7
- Primary text: #0A0A0A
- **Primary accent (blue): #3370FF** — CTAs, links, logo mark, charts, active states
- Secondary CTA (black): #0A0A0A — secondary buttons, borders
- Muted text: #6B7280
- Card surface: #FFFFFF, border: #E5E7EB
- Dark mode primary: #5A8FFF
- Score data: Excellent #06B6D4, Good #10B981, Fair #F59E0B, Critical #EF4444
- RETIRED: Navy #023C65, Cyan #06B6D4 as accent, Yale Blue, Blue Slate, #F97316, #FF3C00 (old orange), #6366F1 (old indigo)

### Typography (UPDATED 2026-03-17)
- Body: Inter 400
- Headings: InterDisplay-Medium / Inter 500
- Serif accent: Fraunces 300-400 (dark testimonial sections only)
- Code: Geist Mono
- RETIRED: Montserrat, Outfit, Source_Serif_4, DM_Serif_Display, PT_Sans, Plus_Jakarta_Sans, Figtree

### Buttons
- Marketing: pill-shaped (border-radius 999px), primary #3370FF, secondary #0A0A0A
- Product utility: rounded-lg (8px)

### Logo
Blue star/cross mark + black "Beamix" wordmark.
File: `saas-platform/public/logo/beamix_logo_blue_Primary.png` (PNG with mark + wordmark)

### Brand Guidelines Documents
- `docs/BRAND_GUIDELINES.md` (v4.0, ~230 lines) — shared identity
- `docs/PRODUCT_DESIGN_SYSTEM.md` (~250 lines) — product dashboard design system
- Old docs archived to `docs/_archive/`
ALL designer agents must read BRAND_GUIDELINES.md before any design work.

### Agent Chat UX
- Interactive: real-time streaming, user can respond and guide the agent
- Location: full page at /dashboard/agent/[id]
- Output: shown in chat AND saved to content library in dashboard

### App Structure
- Dashboard: Sidebar (Linear/Notion style) + main content
- Language: dual (HE + EN), user selects in settings
- Marketing website: Framer (separate from this codebase)

## Email System
Resend + React Email. 15 templates defined in `.planning/email-system-spec.md`.
Trial duration: 7 days. Trial credit cap: 5 agent credits. On upgrade: trial pool deleted, full monthly allocation takes over.

## SCAN SYSTEM STATE (2026-03-24) — REDESIGNED + PRODUCTION

### Scan Architecture (completely rebuilt 2026-03-24)
- Perplexity deep research (website scrape + sector hint + URL)
- Perplexity generates 3 natural scan queries (not templates)
- ChatGPT/Gemini get 2 random queries, Perplexity gets all 3
- Gemini Flash analyzes responses (4000 char truncation, industry-filtered competitors)
- Scoring: 50% mention + 20% position + 15% sentiment + 15% content richness
- Runs synchronously in scan/start route (Vercel kills async work)
- Cost: ~$0.13/scan (7 engine calls + 1 research + 1 analysis)
- Model IDs: gpt-4o-mini:online, gemini-2.0-flash-001:online, sonar-pro, claude-haiku-4.5

### Key scan files
- `src/lib/scan/query-templates.ts` — research + query generation
- `src/lib/scan/scan-core.ts` — pipeline orchestration
- `src/lib/scan/engine-adapter.ts` — OpenRouter calls
- `src/lib/scan/analyzer.ts` — Gemini Flash extraction
- `src/lib/scan/build-results.ts` — scoring + results
- `src/lib/scan/prompts/` — new prompting architecture (8 files, not yet wired in)
- `src/app/api/scan/start/route.ts` — entry point

### Session log
- `docs/08-agents_work/sessions/2026-03-24-ceo-scan-redesign.md` — full session documentation

## SESSION STATE (2026-03-02) — FULL AUDIT COMPLETE

### All Phases Built
All 12 build phases (0-11) are COMPLETE as of 2026-03-02.

### Remaining Work
- Wire settings billing tab to real Paddle subscription data
- Wire new prompts/scoring module into main pipeline
- Multi-run query sampling for Pro/Business tiers
- User-defined custom queries for paid tiers

## War Room System
- [War Room](project_war_room.md) — multi-CEO parallel agent system: beamix CLI, tmux scripts, web dashboard with 2D animated office canvas
- [Paste collapse not configurable](project_paste_collapse.md) — `[Pasted text #N +X lines]` is hardcoded Claude Code UI, not a war-room bug

## See Also
- `DECISIONS.md` — detailed architecture decisions
- `CODEBASE-MAP.md` — key files and patterns
- `memory/feedback_scan_architecture.md` — scan lessons learned
- [Blue-only palette for marketing](feedback_blue_only_palette.md) — all marketing visuals use blue shades only, no multi-color
