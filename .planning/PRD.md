# Beamix PRD — Master Document

> Product Requirements Document for Beamix, the GEO Platform for SMBs.
> This is the master index. Each section has a dedicated document with full detail.

**Version:** 2.0 
**Date:** 2026-02-27
**Status:** Ready for Review

---

## Document Structure

| Document | Purpose | Location |
|----------|---------|----------|
| **Strategic Foundation** | Vision, customer, market, brand, differentiators | `.planning/STRATEGIC_FOUNDATION.md` |
| **Product Specification** | User journeys, features, pricing, IA, i18n | `.planning/PRODUCT_SPECIFICATION.md` |
| **Technical Architecture** | System design, DB schema, APIs, agents, security | `.planning/TECHNICAL_ARCHITECTURE.md` |

---

## Executive Summary

### What Is Beamix?

Beamix scans your business, shows you where you're invisible in AI search, then its agents do the work to fix it.

### The Problem

People no longer search only on Google. They ask ChatGPT, Gemini, Perplexity, and Claude for recommendations. When someone asks "best insurance company in Tel Aviv" — if you're not mentioned, you don't exist. SMB owners are losing leads and don't know why.

### The Solution

A three-phase experience:
1. **Hook (Free):** Instant scan showing where you rank (or don't) across 4 LLMs
2. **Solve (Paid):** AI agents analyze why and create the fixes — content, blogs, schema, review strategies, social plans
3. **Connect (Future):** Agents work directly in your platforms — auto-publish, auto-optimize

### The Differentiator

Every competitor builds dashboards. Beamix does the work.

| What competitors do | What Beamix does |
|---|---|
| "You rank #7 in ChatGPT" | "Here's the content that will fix that. Want us to write it?" |
| $250-500/month entry price | $49/month Starter tier |
| 30-day delay before insights | Value on day 1 with free scan |
| Built for agencies | Built for the business owner |

---

## Customer

**Primary:** Non-technical marketing managers and business owners at SMBs (2-500 employees) in Israel and globally.

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
| **Competitors tracked** | 0 | 3 | 5 | 10 |
| **Trial** | N/A | 14 days | 14 days | 14 days |

### AI Agents

| Agent | What it does | Cost |
|---|---|---|
| **Recommendations** | Analyzes why you rank where you do, prioritized action items | Free (system) |
| **Content Writer** | Writes GEO-optimized website pages | 1 agent use |
| **Blog Writer** | Creates blog posts targeting AI-discoverable topics | 1 agent use |
| **Review Analyzer** | Analyzes reviews, provides sentiment analysis + action plan | 1 agent use |
| **Schema Optimizer** | Generates JSON-LD structured data for your website | 1 agent use |
| **Social Strategy** | Creates social media content calendar + ready-to-post copy | 1 agent use |

### Key User Flows

1. **Free Scan:** Enter URL → see rankings across 4 LLMs → emotional hook → convert to paid
2. **Agent Execution:** See recommendation → click "Fix This" → agent generates solution → user approves → user publishes
3. **Progress Tracking:** Dashboard shows visibility score trending up over weeks → proves ROI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| UI | Tailwind CSS (logical properties for RTL), Shadcn UI |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI Orchestration | n8n Cloud (all LLM calls happen here) |
| Payments | Stripe (subscriptions + one-time add-ons) |
| LLM APIs | OpenAI (GPT-4o), Anthropic (Claude Sonnet), Perplexity (Sonar), Google (Gemini) |
| Deployment | Vercel + Supabase Cloud + n8n Cloud |
| i18n | next-intl (Hebrew RTL + English LTR) |

### Architecture Principles

1. **LLM calls ONLY in n8n** — never from API routes. Centralizes cost tracking and retry logic.
2. **Fire-and-forget agents** — API returns 202 immediately, frontend polls for completion.
3. **RLS is the security boundary** — even if API has bugs, data can't leak across users.
4. **Credits deducted AFTER success** — failed agents don't charge users.

---

## Brand

**Concept:** Beam of light — a ray of light lifting business rankings in AI search.

**Design:** Minimalist, warm, approachable. Illustrations not stock photos. Non-technical people should feel welcome.

**Languages:** Hebrew (RTL) + English (LTR) from day 1.

---

## Markets

**Primary:** Israel (Hebrew + English)
**Secondary:** Global English-speaking (US, UK, Australia)

---

## Development Constraints

- **Team:** Solo founder + AI-assisted development
- **Target:** 7-day sprint to paying product
- **Approach:** Build in priority order, ship iteratively

---

## Next Steps

1. Review this PRD — validate pricing, features, user journeys
2. Design system — establish visual language (Lyra)
3. 7-day sprint plan — day-by-day build schedule
4. Build

---

## Full Documentation

For complete details, see the individual documents:

- **Strategic Foundation:** Customer definition, competitive analysis, GEO ranking factors, revenue model → [STRATEGIC_FOUNDATION.md](STRATEGIC_FOUNDATION.md)
- **Product Specification:** Detailed user journeys, feature specs with acceptance criteria, subscription tiers, information architecture, i18n requirements → [PRODUCT_SPECIFICATION.md](PRODUCT_SPECIFICATION.md)
- **Technical Architecture:** System diagram, database schema (15 tables), API routes, AI agent workflows, LLM querying system, security model → [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
