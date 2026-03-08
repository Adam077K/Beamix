# Beamix PRD — Master Document

> **Last synced:** March 2026 — aligned with 03-system-design/

> Product Requirements Document for Beamix, the GEO Platform for SMBs.
> This is the master index. Each section has a dedicated document with full detail.
>
> **Repository:** https://github.com/Adam077K/Beamix

**Version:** 3.1
**Date:** 2026-03-06
**Status:** Updated — Aligned with System Design v2.1 (March 4, 2026)

> **IMPORTANT:** The authoritative system design lives at `.planning/03-system-design/`. This PRD is the executive summary. For full technical/product detail, always defer to the system design documents.

---

## Document Structure

| Document | Purpose | Location |
|----------|---------|----------|
| **Strategic Foundation** | Vision, customer, market, brand, differentiators | `.planning/01-foundation/STRATEGIC_FOUNDATION.md` |
| **Product Specification** | User journeys, features, pricing, IA, i18n | `.planning/01-foundation/PRODUCT_SPECIFICATION.md` |
| **System Design (Master)** | Complete technical and product architecture (v2.1) | `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md` |
| **Architecture Layer** | Database (32 tables), APIs, Inngest jobs, security | `.planning/03-system-design/_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` |
| **Product Layer** | 23 pages, 90+ features, user journeys, 16 agents UX | `.planning/03-system-design/_SYSTEM_DESIGN_PRODUCT_LAYER.md` |
| **Intelligence Layer** | 16 agent pipelines, scan engine, LLM costs | `.planning/03-system-design/_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` |
| **Validation** | Gap closure, competitive parity, priority classification | `.planning/03-system-design/_SYSTEM_DESIGN_VALIDATION.md` |
| **Feature Specs (12 specs)** | Detailed engineering specs for all features (launch + Phase 2 & 3) | `.planning/04-features/` |
| **Pricing Impact Analysis** | Cost analysis for 11 new features + pricing recommendations | `.planning/08-agents_work/PRICING-IMPACT-ANALYSIS.md` |

---

## Executive Summary

### What Is Beamix?

Beamix scans your business, shows you where you're invisible in AI search, then its agents do the work to fix it.

### The Problem

People no longer search only on Google. They ask ChatGPT, Gemini, Perplexity, and Claude for recommendations. When someone asks "best insurance company in Tel Aviv" — if you're not mentioned, you don't exist. SMB owners are losing leads and don't know why.

### The Solution

A closed-loop system:
1. **Scan:** Query up to 10 AI engines with industry-relevant prompts
2. **Diagnose:** AI recommends what to fix and why
3. **Fix:** 16 AI agents create content, schema, citations, strategies
4. **Measure:** Track improvement across engines over time
5. **Repeat**

### The Differentiator

Every competitor builds dashboards. Beamix does the work.

| What competitors do | What Beamix does |
|---|---|
| "You rank #7 in ChatGPT" | "Here's the content that will fix that. Want us to write it?" |
| $200-500/month entry price | $49/month Starter tier |
| 30-day delay before insights | Value on day 1 with free scan |
| Built for agencies | Built for the business owner |
| 1 LLM model for content + QA | Cross-model QA (GPT-4o reviews Claude output) |

---

## Customer

**Primary:** Non-technical marketing managers and business owners at SMBs (5-200 employees) in Israel and globally.

**Key traits:** Time-poor, budget-conscious, forward-thinking about AI, wants results not dashboards.

---

## Product Overview

### Subscription Tiers

| | Free Scan | Starter | Pro | Business |
|---|---|---|---|---|
| **Price** | $0 | $49/mo | $149/mo | $349/mo |
| **Tracked queries** | 0 | 10 | 25 | 75 |
| **Agent uses/month** | 0 | 5 | 15 | 50 |
| **Scan frequency** | One-time | Weekly | Every 3 days | Daily |
| **AI engines** | 4 (Phase 1) | 4 | 7 | 10 |
| **Competitors tracked** | 0 | 3 | 5 | 10 |
| **Trial** | N/A | 7 days | 7 days | 7 days |

> Trial duration is 7 days, starting from first dashboard visit (not signup).
> plan_tier values in DB: `'starter' | 'pro' | 'business'` — no 'free' tier value (free tier = null).

### AI Engines (Phased Rollout)

| Phase | Engines | Access Method |
|-------|---------|---------------|
| Phase 1 — Launch | ChatGPT, Gemini, Perplexity, Claude | API |
| Phase 2 — Growth | + Grok, DeepSeek, You.com | API |
| Phase 3 — Deferred | + Copilot, AI Overviews, Meta AI | Browser simulation |

### AI Agents (16 Total — A1 through A16)

| # | Agent | Purpose | Credits |
|---|-------|---------|---------|
| A1 | Content Writer | GEO-optimized website pages | 1 |
| A2 | Blog Writer | Long-form blog posts for citation | 1 |
| A3 | Schema Optimizer | JSON-LD structured data | 1 |
| A4 | Recommendations | Prioritized action items (auto after scan) | 0 (system) |
| A5 | FAQ Agent | FAQ content matching AI queries | 1 |
| A6 | Review Analyzer | Reputation analysis + response templates | 1 |
| A7 | Social Strategy | 30-day social content calendar | 1 |
| A8 | Competitor Intelligence | Deep competitive analysis + action items | 1 |
| A9 | Citation Builder | Outreach templates for citation sources | 1 |
| A10 | LLMS.txt Generator | AI-readable site description file | 1 |
| A11 | AI Readiness Auditor | Comprehensive website AI audit | 1 |
| A12 | Ask Beamix | Conversational data analyst (streaming) | 0 (Pro+) |
| A13 | Content Voice Trainer | Learn business's writing voice | 1 |
| A14 | Content Pattern Analyzer | What makes cited content succeed | 1 |
| A15 | Content Refresh Agent | Audit + update stale content | 1 |
| A16 | Brand Narrative Analyst | WHY AI says what it says | 1 |

### Key User Flows

1. **Free Scan:** Enter URL → scan across AI engines → see visibility score → emotional hook → convert to paid
2. **Agent Execution:** See recommendation → click "Fix This" → agent runs multi-stage LLM pipeline → user reviews → publish
3. **Progress Tracking:** Dashboard shows visibility score trending up over time → proves ROI

---

## Platform Pages (23 Pages)

Landing, Free Scan, Scan Results, Login, Signup, Forgot Password, Onboarding, Dashboard Overview, Rankings, Recommendations, Content Library, Content Editor, Agent Hub, Agent Chat, Competitive Intelligence, AI Readiness, Settings, Pricing, Blog, About, Terms, Privacy, API Docs.

> Full page specs: `.planning/03-system-design/_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript strict |
| UI | Tailwind CSS, Shadcn/UI |
| Database | Supabase (PostgreSQL + Auth + RLS) — 32 tables |
| Background Jobs | Inngest (14 functions — scans, agents, crons, workflows) |
| Payments | Paddle (subscriptions + webhooks) — NOT Stripe |
| Email | Resend + React Email |
| LLM APIs | OpenAI (GPT-4o), Anthropic (Haiku 4.5, Sonnet 4.6, Opus 4.6), Perplexity (Sonar Pro), Google (Gemini 2.0 Flash), xAI (Grok), DeepSeek |
| Deployment | Vercel + Supabase Cloud |
| i18n | Hebrew RTL + English LTR |

### Architecture Principles

1. **Inngest for all background work** — scans, agents, crons, workflows run in Inngest functions. Never in API route handlers.
2. **Event-driven** — API emits Inngest event and returns 202. Frontend subscribes via Supabase Realtime for live updates.
3. **RLS is the security boundary** — even if API has bugs, data can't leak across users.
4. **Credits: hold → confirm → release** — hold on job start, confirm on success, release on failure. Users never charged for failed agents.
5. **Cross-model QA** — GPT-4o reviews Claude output. Never same-model QA.
6. **No n8n** — direct LLM API integration only. Inngest for orchestration.

---

## Brand

**Concept:** Beam of light — a ray of light lifting business rankings in AI search.

**Design:** Warm, energetic, rounded. Reference: usebear.ai (light mode, rounded cards, serif+sans). Beamix adds warmth and energy. NOT cold/minimal.

**Languages:** Hebrew (RTL) + English (LTR) from day 1.

---

## Markets

**Primary:** Israel (Hebrew + English)
**Secondary:** Global English-speaking (US, UK, Australia)

---

## Priority Classification

| Tier | Count | Key Items |
|------|-------|-----------|
| Launch Critical | 18 | Scan engine (4 engines), 12 agents (A1-A12), credit system, dashboard, Paddle, auth |
| Growth Phase | 15 | A13-A16, workflow chains, GA4, GSC, Slack, competitive intelligence dashboard |
| Moat Builders | 20 | Persona tracking, browser simulation, public REST API, Hebrew prompt library |
| Intentionally Skipped | 14 | White-label, Looker Studio, CDN optimization, Shopify, multi-workspace |

> Full classification with reasoning: `.planning/03-system-design/_SYSTEM_DESIGN_VALIDATION.md` §5

---

## Full Documentation

For complete details, see the system design documents:

- **System Design Master:** Overview, agents, architecture summary → `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md`
- **Product Layer:** 23 pages, user journeys, feature specs → `.planning/03-system-design/_SYSTEM_DESIGN_PRODUCT_LAYER.md`
- **Architecture Layer:** 32 DB tables, all APIs, 14 Inngest jobs → `.planning/03-system-design/_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md`
- **Intelligence Layer:** 16 agent pipelines, LLM selection, costs → `.planning/03-system-design/_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md`
- **Validation:** Gap closure, competitive parity → `.planning/03-system-design/_SYSTEM_DESIGN_VALIDATION.md`
