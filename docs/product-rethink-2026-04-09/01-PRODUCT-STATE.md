# Beamix Product State — Codebase Audit (2026-04-09)

Audited by 5 parallel Explore agents reading actual code, not existing documentation.
Commit: `48ff496` on branch `main`.

---

## 1. What Is Beamix

Beamix scans SMBs for AI search visibility — it queries ChatGPT, Gemini, Perplexity, and Claude to find out whether a business gets mentioned when users ask AI systems for recommendations. When the scan reveals gaps, Beamix runs AI agents that produce the content, schema markup, FAQ pages, and strategies needed to fix those gaps.

**Architecture split:**
- Marketing website: Framer (separate project, not in this repo)
- Product (dashboard/app): Next.js 16 on Vercel — this repo (`saas-platform/`)

---

## 2. Tech Stack

- Next.js 16, React 19, TypeScript (strict)
- Supabase (auth, DB, RLS)
- Paddle (billing — NOT Stripe)
- OpenRouter (unified LLM gateway — ChatGPT, Gemini, Perplexity, Claude, Haiku)
- Inngest (background jobs — scan processing)
- Resend (email — templates exist but sending is DISABLED)
- TanStack Query, Zustand, Recharts, Nivo, Framer Motion, next-intl (i18n)
- 6 Vercel cron jobs configured

---

## 3. Feature Inventory — What's REAL vs MOCK vs MISSING

### Auth & Onboarding — ALL REAL
- Login, signup, forgot/reset password (Supabase Auth)
- 4-step onboarding wizard (URL, name, industry, location)
- Free scan import on signup (detects `?scan_id=` param, links scan to user)
- 7-day trial starts on first dashboard visit
- Middleware protects /dashboard routes, redirects unauthed users

### Scan System — REAL (Production-Ready)
- Free scan: `/scan` wizard → real AI engine queries via OpenRouter → results page
- 3 engines queried in parallel (ChatGPT, Gemini, Perplexity), 1 query per engine
- Pipeline: research (Perplexity) → generate queries → query engines → analyze (Gemini Flash) → score
- Website scraper: fetches homepage for context (SSRF-protected)
- Scoring: 50% mention rate + 20% position + 15% sentiment + 15% content richness
- Manual scan for authenticated users via Inngest (async, returns 202)
- Paid tiers get more engines + more queries per engine
- Mock engine exists ONLY as fallback when no API keys configured
- Rate limiting: 5 free scans/hour per IP; plan-based limits for paid

### Dashboard — REAL
- Overview: KPI cards (score, mentions, rankings), trending charts, recent scans/agents
- Rankings view: per-engine results with animated performance bars
- Recommendations: AI-generated (Claude Haiku) from scan data, stored in DB
- Notifications: grouped by time, filterable, in-app only
- Command palette (Cmd+K)
- Sidebar (Linear/Notion style), user menu, breadcrumbs

### AI Agents — 7 BUILT, ALL REAL
All agents use Claude Sonnet via OpenRouter. Content agents get Perplexity pre-research.

| Agent | Type | Credit Cost | Plan Required |
|-------|------|-------------|---------------|
| Content Writer | Premium | 1 AI Run | Starter+ |
| Blog Writer | Premium | 1 AI Run | Starter+ |
| FAQ Agent | Unlimited | 0 (daily limit) | Free+ |
| Schema Optimizer | Unlimited | 0 (daily limit) | Free+ |
| Review Analyzer | Unlimited | 0 (daily limit) | Free+ |
| Social Strategy | Premium | 1 AI Run | Pro+ |
| Competitor Intelligence | Premium | 1 AI Run | Pro+ |

- Agent chat UI: full streaming interface, markdown rendering, quick prompts, credit tracking
- QA gate: Claude Haiku scores on 5 dimensions, warning-only (never blocks)
- Credit system: hold → execute → confirm/release via Supabase RPCs
- 10-step execution pipeline: auth → plan check → rate limit → validate → DB record → hold credits → run LLM → QA → save → confirm

### Content Library — REAL
- Table/grid view, filterable by type
- Content editor with save/publish, markdown-only
- Word count, quality score display
- Content versioning (table exists, partially wired to UI)

### Competitors — PARTIALLY REAL
- Add/delete competitors: REAL (Supabase CRUD)
- Visibility scores: MOCK (client-side random numbers)
- Competitor scanning: NOT BUILT (tables exist, no Inngest function)
- Share of voice: NOT BUILT

### Settings — MIXED
- Business profile tab: REAL (loads/saves from DB)
- Billing tab: MOCK (hardcoded data, not reading from Paddle/subscriptions)
- Preferences tab: REAL (language, notifications)
- Integrations tab: STUB ("Coming Soon")

### Billing — REAL
- Paddle checkout (SDK wired, creates transactions)
- Paddle webhooks (subscription.created/updated/cancelled handled)
- Subscription portal (Paddle customer portal link)
- Monthly credit allocation via Supabase RPCs

### Email — TEMPLATES ONLY, SENDING DISABLED
- 15 React Email templates defined
- Resend integration exists but NO emails actually send
- Trial nudge cron: email sending removed
- Weekly digest cron: returns empty

---

## 4. Database Schema (30+ Tables)

### Tables WITH UI/API wiring (actively used):
- `user_profiles`, `businesses`, `subscriptions`, `plans`
- `credit_pools`, `credit_transactions`
- `free_scans`, `scans`, `scan_engine_results`
- `content_items`, `content_versions`
- `agent_jobs`, `agent_job_steps`
- `competitors`, `recommendations`
- `notifications`, `notification_preferences`
- `blog_posts`

### Tables WITHOUT UI/API wiring (schema only, future vision):
- `agent_workflows`, `workflow_runs` — automated agent chains
- `content_voice_profiles` — brand voice training
- `content_performance` — before/after measurement
- `personas` — persona-based prompt modifiers
- `prompt_library`, `prompt_volumes` — query/prompt management
- `crawler_detections` — AI crawler tracking
- `brand_narratives` — brand perception analysis
- `competitor_scans`, `competitor_content_snapshots`, `competitor_share_of_voice`
- `citation_sources` — partially populated during scans, no dedicated UI
- `tracked_queries` — keyword tracking, no management UI
- `ga4_metrics`, `gsc_data` — analytics integrations (no OAuth flow)
- `api_keys` — developer access
- `integrations` — third-party connections
- `email_log` — backend only
- `ai_readiness_history` — readiness scores over time
- `alert_rules` — no evaluation logic

### Key RPCs:
- `hold_credits`, `confirm_credits`, `release_credits` — credit lifecycle
- `allocate_monthly_credits` — monthly allocation with 20% rollover
- `deduct_credits` — direct deduction
- `handle_new_user` — trigger on signup (creates profile + subscription + notification prefs)

---

## 5. Critical Issues (Blockers for Launch)

| Issue | Severity | Fix Time |
|-------|----------|----------|
| `20260318_reconciliation.sql` may not be applied in production — agents can't charge credits | P0 BLOCKER | 15 min SQL run |
| Zero emails send — 15 templates, Resend not wired to actually send | P0 | 1-2 days |
| Settings billing tab shows hardcoded data | P0 | 1 day |
| Competitor scores are random numbers | P1 | 2hrs (hide) or 3 days (build) |
| Scheduled scans don't run (cron configured, no Inngest function) | P1 | 1-2 days |
| AI Readiness POST returns "coming_soon" | P1 | 2-3 days |
| Visibility score formula breaks above 4 engines | P2 | 1 day |
| Hebrew RTL rendering not audited | P2 | 2 days |

---

## 6. What Works End-to-End (MVP)

This sequence works without touching anything:
1. User lands on `/scan`, enters URL + details
2. Real AI engines (ChatGPT, Gemini, Perplexity) run in parallel
3. Results page shows visibility score + per-engine breakdown
4. User signs up → onboarding → free scan imported to dashboard
5. Dashboard shows real scan data
6. User clicks an agent → chat interface → Claude Sonnet runs → output returned
7. Output saved to content library
8. Paddle checkout → subscription activates

The core scan-to-agent-to-content loop is functional.

---

## 7. Dependencies & Infrastructure

### Required Env Vars:
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Paddle: `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, 12 price IDs
- OpenRouter: `OPENROUTER_SCAN_KEY`, `OPENROUTER_AGENT_KEY` (or `OPENROUTER_API_KEY`)
- Resend: `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`
- App: `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`
- Feature flag: `USE_MOCK_SCAN=true` for dev

### Vercel Crons (6 configured):
1. Scheduled scans — 2 AM daily (NO Inngest function backing this)
2. Monthly credits — 1st of month
3. Trial nudges — 10 AM daily (email sending removed)
4. Weekly digest — Mondays 8 AM (email sending removed)
5. Cleanup — 4 AM daily
6. Content refresh check — 6 AM daily

### Key File Paths:
- `saas-platform/src/lib/scan/` — scan engine pipeline
- `saas-platform/src/lib/agents/` — agent execution system
- `saas-platform/src/lib/openrouter.ts` — LLM gateway
- `saas-platform/src/lib/paddle/` — billing integration
- `saas-platform/src/inngest/` — background job functions
- `saas-platform/src/app/(protected)/dashboard/` — dashboard pages
- `saas-platform/src/components/dashboard/` — dashboard UI components
- `saas-platform/supabase/migrations/` — DB schema
