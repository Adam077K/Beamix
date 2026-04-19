# Beamix PRD — Master Document

> **Version:** 4.0
> **Date:** 2026-04-15
> **Status:** April 2026 Product Rethink — supersedes v3.1 (March 2026)
> **Authoritative source:** `docs/product-rethink-2026-04-09/` (9 files)

> Product Requirements Document for Beamix, the GEO Platform for SMBs.
> This is the master index. Each section has a dedicated document with full detail.
>
> **Repository:** https://github.com/Adam077K/Beamix

---

## Document Structure

| Document | Purpose | Location |
|----------|---------|----------|
| **Board Decisions (April 2026)** | All approved decisions: pricing, agents, UX, interaction model | `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md` |
| **Pricing v2** | Tier breakdown, credit model, COGS, margin scenarios | `docs/product-rethink-2026-04-09/06-PRICING-V2.md` |
| **Agent Roster v2** | 11 agent specs, model routing, GEO lever coverage | `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md` |
| **UX Architecture** | Dashboard pages, flows, interaction models, technical foundation | `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md` |
| **Strategic Foundation** | Vision, customer, market, brand, differentiators | `docs/01-foundation/VISION.md` |
| **Engineering Principles** | Code conventions, tech stack decisions, git workflow | `docs/ENGINEERING_PRINCIPLES.md` |
| **Backlog** | Current blockers, Wave 2 queue, Wave 3 growth items | `docs/BACKLOG.md` |

---

## Executive Summary

### What Is Beamix?

Beamix scans your business, shows you where you're invisible in AI search, then its agents do the work to fix it.

### The Problem

People no longer search only on Google. They ask ChatGPT, Gemini, Perplexity, and Claude for recommendations. When someone asks "best insurance company in Tel Aviv" — if you're not mentioned, you don't exist. SMB owners are losing leads and don't know why.

### The Solution

A closed-loop proactive system:
1. **Scan:** Query AI engines with targeted prompts across the business's query landscape
2. **Suggest:** Rules engine evaluates scan findings and populates a suggestions queue
3. **Approve:** User reviews and approves suggested actions
4. **Run:** Agents execute in background — content, schema, off-site presence, strategy
5. **Review:** Output lands in Inbox — user reviews, edits, approves, then publishes
6. **Measure:** Performance Tracker compares before/after on each action

### The Differentiator

Every competitor builds dashboards. Beamix does the work.

| What competitors do | What Beamix does |
|---|---|
| "You rank #7 in ChatGPT" | "Here's the content that will fix that — approve it to go." |
| $200–500/month entry price | $79/month Discover tier |
| 30-day delay before insights | Value on day 1 with free scan |
| Built for agencies | Built for the business owner |
| 1 LLM model for content + QA | Cross-model QA pipeline (Haiku checks Sonnet/Opus output) |

---

## Customer

**Primary:** Non-technical marketing managers and business owners at SMBs (5–200 employees) in Israel and globally.

**Key traits:** Time-poor, budget-conscious, forward-thinking about AI, wants results not dashboards.

**Primary market:** Israel (Hebrew + English)
**Secondary:** Global English-speaking (US expansion by month 2 post-launch)

---

## Product Overview

### Subscription Tiers

| | Free Scan | Discover | Build | Scale |
|---|---|---|---|---|
| **Price** | $0 | $79/mo | $189/mo | $499/mo |
| **Annual** | N/A | $63/mo | $151/mo | $399/mo |
| **Tracked queries** | 0 | 15 | 50 | 200 |
| **AI Runs/month** | 0 | 25 | 90 | 250 |
| **Scan frequency** | One-time | Weekly | Daily | Daily (priority) |
| **AI engines** | 4 (Phase 1) | 3 | 7 | 9+ |
| **Competitors tracked** | 0 | 3 | 5 | 20 |
| **Trial** | N/A | 14-day money-back | 14-day money-back | 14-day money-back |

**Notes:**
- `plan_tier` DB values: `'discover' | 'build' | 'scale'` — no `'free'` tier value (free tier = null)
- Annual toggle defaults ON on the pricing page. Build is the highlighted/recommended tier.
- Previous tiers (Starter/Pro/Business at $49/$149/$349) are retired.
- 7-day trial is retired. Replaced by 14-day money-back guarantee (no credit cap, plain refund).
- Top-up pack: $19 one-time for 10 extra AI Runs (Paddle one-time product, not a subscription).

### AI Runs (Credit Model)

1 AI Run = 1 agent execution. No variable pricing within a tier.

| Cost | Agents |
|------|--------|
| **Free (unlimited, daily-capped)** | Schema Generator, FAQ Builder, Off-Site Presence Builder, Performance Tracker |
| **1 Run** | Query Mapper, Freshness Agent, Reddit Presence Planner |
| **2 Runs** | Content Optimizer, Review Presence Planner, Entity Builder |
| **3 Runs** | Authority Blog Strategist (Build and Scale only) |

Daily caps (Discover / Build / Scale): Schema 20/20/20 · FAQ 3/5/10 · Off-Site 3/5/10 · Performance Tracker: unlimited.

Rollover: 20% of unused runs carry to next month (5 max on Discover, 18 max on Build, 50 max on Scale).

### AI Engines (by Tier)

| Tier | Engines | Frequency |
|------|---------|-----------|
| Discover | 3 (ChatGPT, Gemini, Perplexity) | Weekly |
| Build | 7 (+ Claude, AI Overviews, Grok, You.com) | Daily |
| Scale | 9+ (all engines) | Daily + priority refresh |

### AI Agents — 11 MVP-1 Agents

Old 7-agent roster is retired. New roster is research-backed and GEO-specialized.

| # | Agent | Purpose | Credits | Tier |
|---|-------|---------|---------|------|
| A1 | **Query Mapper** | Maps 50 queries where business should appear | 0 (system) | All |
| A2 | **Content Optimizer** | Rewrites existing pages with stats, citations, expert quotes | 1 | All |
| A3 | **Freshness Agent** | Updates stale content with fresh data | 1 | All |
| A4 | **FAQ Builder** | Creates FAQ pages per query cluster with JSON-LD schema | 1 | All |
| A5 | **Schema Generator** | Generates LocalBusiness, Product, FAQ, Article JSON-LD | 1 | All |
| A6 | **Off-Site Presence Builder** | Maps missing directories, guides submissions | 1 | All |
| A7 | **Review Presence Planner** | Builds review acquisition strategy | 1 | All |
| A8 | **Entity Builder** | Guides Wikidata, GBP, knowledge graph signals | 1 | All |
| A9 | **Authority Blog Strategist** | Long-form content targeting specific queries | 3 | Build+ only |
| A10 | **Performance Tracker** | Weekly before/after comparison | 0 (auto) | All |
| A11 | **Reddit Presence Planner** | Identifies subreddits for audience queries | 1 | All |

> **Credit cost notes:** FAQ Builder, Schema Generator, Off-Site Presence Builder, and Performance Tracker are free/unlimited with daily caps. Query Mapper costs 1 Run. Content Optimizer costs 2 Runs. Review Presence Planner and Entity Builder cost 2 Runs each. Authority Blog Strategist costs 3 Runs. Full detail in `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md`.

MVP-2 (month 2): **Video SEO Agent** — YouTube optimization for Google AI Overview citations (Scale tier only, 2 Runs).

**Killed agents (retired):** Social Strategy, old Competitor Intelligence (chat-based), old Content Writer, old Review Analyzer, llms.txt Generator.

### Agent Pipeline Model

Every credit-gated agent runs 5 LLM stages:
```
PLAN → RESEARCH → DO → QA → SUMMARIZE
```
Free agents (Schema, FAQ, Off-Site, Performance Tracker) run 3 stages: PLAN → DO → QA.

Agent output is **never published automatically**. All output lands in the user's Inbox for review, edit, and approval.

---

## Product Philosophy

- **Assisted, not autopilot.** Users approve everything before it publishes.
- **Proactive loop.** The system drives: scan → suggest → approve → run → review → approve → post.
- **Agents are invisible infrastructure.** No "Agent Hub" page. Agents surface through Inbox items and Automation schedules.
- **GEO improvement is continuous.** Agents run on schedule, triggered by scan findings.
- **Kill switch is sacred.** User can pause all automation instantly from any screen.

---

## Platform Pages

**Dashboard (7 pages):**

| Page | Purpose |
|------|---------|
| **Home** | Score hero + suggestions queue + Inbox preview + automation status + Signals feed |
| **Inbox** | 3-pane Superhuman layout — item list / content preview / evidence panel |
| **Scans** | Timeline + engine drilldown + diff view (before/after comparison) |
| **Automation** | Schedule cards + credit budget + kill switch |
| **Archive** | Approved/posted content history + self-reported publish status + URL verification |
| **Competitors** | Competitor list + movement alerts |
| **Settings** | 7 tabs: Profile, Business, Billing, Preferences, Notifications, Integrations, Automation Defaults |

**Public pages:** Landing, Free Scan, Scan Results, Login, Signup, Forgot Password, Onboarding, Pricing, Blog, About, Terms, Privacy.

**Removed from nav:** Agent Hub, Agent Chat, Content Library (standalone), Recommendations (standalone page), Rankings (merged into Scans). There is no `/dashboard/agents` route in the approved navigation.

---

## Key User Flows

### 1. Free Scan → Preview → Paywall
```
Enter URL + industry + location (+ optional 3 competitors)
→ 60–90s dark animation (engines light up live as results arrive)
→ Wound-reveal result: giant score + top-3 competitors + 3 visible fixes + 8 blurred
→ "Fix this now →" (primary CTA) or "Explore the product first" (text link)
→ Preview mode: auto-create account, scan data pre-loaded, feature-gated paywall
→ One free FAQ Builder run per preview account (~$0.04 cost, creates aha moment)
→ "Run Agent" triggers 880px paywall modal (Build highlighted, all 3 tiers shown)
→ Paddle checkout → Post-payment onboarding (2 steps: verify profile + optional GA4/GSC)
```

### 2. Proactive Automation
```
Scan runs → 15-rule engine evaluates findings → suggestions queue populated
→ User accepts suggestion → agent runs in background (Inngest)
→ Output lands in Inbox → user reviews / edits / approves
→ Approved content moves to Archive → user copies to their site manually
→ User marks published → system probes URL after 48h → confirms at next scan cycle
```

### 3. Day-1 Auto-Trigger Pipeline (post-payment)
```
Paddle payment confirmed → Inngest event chain:
  1. Query Mapper runs (~30s) — generates 50 targeted queries
  2. Full paid scan starts (~60–90s) — uses Query Mapper queries + all tier engines
  3. Rules engine evaluates scan → populates suggestions (~5s)
  4. First 2–3 highest-impact agents auto-run (~30–60s each)
→ Home shows "Setting up your workspace..." during this
→ User sees populated dashboard within 5–10 minutes of payment
```

### 4. Progress Tracking
GEO score trends up over time. 8-week sparkline on Home page. Performance Tracker uses directional language only ("trend observed") — causal attribution to specific agent runs is not claimed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript strict |
| UI | Tailwind CSS, Shadcn/UI |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Background Jobs | Inngest (7 registered functions — scans, agents, crons, rules engine) |
| Payments | Paddle (subscriptions + webhooks, HMAC verified) — NOT Stripe |
| Email | Resend + React Email (domain: notify.beamix.tech) |
| LLM — Claude | Direct Anthropic SDK (80% of calls — cheaper + resilient) |
| LLM — Others | OpenRouter for Gemini, GPT, Perplexity (scan engines + fallback) |
| Deployment | Vercel + Supabase Cloud |
| Monorepo | Turborepo + pnpm workspaces (`apps/web/` is the product app) |
| i18n | Hebrew RTL (Heebo font) + English LTR (Inter) |

### Approved LLM Models Only

| Provider | Models |
|----------|--------|
| Anthropic | Claude Sonnet 4.6, Haiku 4.5, Opus 4.6 |
| Google | Gemini 2.0 Flash, Gemini 2.5 Pro |
| OpenAI | GPT-4o, GPT-4o-mini, GPT-5-mini |
| Perplexity | Sonar, Sonar Pro, Sonar Online |

**Banned:** DeepSeek, Qwen, and any providers not listed above.

### Architecture Principles

1. **Inngest for all background work** — scans, agents, crons, and the automation dispatcher run in Inngest functions. Never in API route handlers.
2. **Event-driven** — API routes emit Inngest events and return 202. Frontend subscribes via Supabase Realtime for live updates.
3. **RLS is the security boundary** — even if API routes have bugs, data cannot leak across users.
4. **Credits: hold → confirm → release** — hold on job start, confirm on success, release on failure. Users are never charged for failed agent runs.
5. **Cross-model QA** — Haiku checks Sonnet/Opus output. Never same-model self-QA.
6. **Direct Anthropic + OpenRouter** — Direct SDK for Claude (cost savings + resilience). OpenRouter for multi-provider scan engines.

---

## Brand

**Concept:** Beam of light lifting business rankings in AI search.

**Design:** Modern, clean, professional. Blue `#3370FF` accent, rounded cards, Inter + InterDisplay type system. Spacious and readable — minimal but not cold.

**Primary accent:** `#3370FF` (blue) — CTAs, links, logo mark, charts, active states.

**Typography:** Inter 400 (body) · InterDisplay-Medium / Inter 500 (headings) · Fraunces 300–400 (serif accent, dark sections only) · Geist Mono (code) · Heebo (Hebrew text)

**Languages:** Hebrew (RTL) + English (LTR)

---

## Safety & Content Policy

- **YMYL hard-refuse:** Medical diagnosis, legal advice, investment/crypto advice. Agent returns structured refuse — no content generated.
- **YMYL soft-gate:** General health/finance education → forced human review + mandatory disclaimer appended.
- **MVP vertical exclusions:** Medical diagnostic, law-advisory, financial advisory, regulated Israeli professions.
- **No AI labels in content output:** Agent-generated content contains no AI disclosure markers. Disclosure obligation falls on the publisher (user), not Beamix.
- **Content rate limits (soft warning):** Discover 4 pages/mo, Build 10, Scale 20. User can override with confirmation.

---

## Positioning & Copy

**Hero line:** "Your business, cited by ChatGPT. Not by luck. Not by waiting. Beamix does the work — you stay in control."

**Agency anchor:** "A GEO agency charges $1,500–$5,000/month. Beamix does the same work for $189."

**Human-in-loop as feature:** "Like an agency team — they draft, you approve, you publish. Except this agency costs $189/mo instead of $3,000."

**User-facing language:** Never say "GEO" — say "AI Search Visibility." Agent names are internal only; users see action labels.

---

## Markets

**Primary:** Israel (Hebrew + English)
**Secondary:** Global English-speaking (US expansion possible and may be needed for break-even — 190–226 paying users needed at $35K/mo burn)

---

## Full Documentation

For complete detail, read the authoritative source documents:

- **All board decisions:** `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md`
- **Pricing detail + COGS:** `docs/product-rethink-2026-04-09/06-PRICING-V2.md`
- **Agent specs + model routing:** `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md`
- **Dashboard UX + page specs:** `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md`
- **Wave 0/1 build summary:** `docs/08-agents_work/sessions/2026-04-19-ceo-wave0-wave1-complete.md`
