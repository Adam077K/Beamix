# Beamix — Strategic Foundation

> **Last synced:** March 2026 — aligned with 03-system-design/

> Strategic foundation for Beamix. For the complete system design (agents, DB, APIs, intelligence), see `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md`.
>
> **Repository:** https://github.com/Adam077K/Beamix
> **Last Updated:** 2026-03-06 — Aligned with System Design v2.1

---

## 1. What Is Beamix?

**One-liner:** Beamix scans your business, shows you where you're invisible in AI search, then its agents do the work to fix it.

**Category:** GEO (Generative Engine Optimization) Platform for SMBs

**Core differentiator:** Competitors show dashboards. Beamix does the work.

---

## 2. The Customer

**Primary persona:** Marketing manager or business owner at an SMB (5-200 employees)

**Key traits:**
- Non-technical — doesn't want to learn a tool, wants results
- Budget-conscious — can't afford $10K+/month on Google Ads or agencies
- Time-poor — wears multiple hats, needs things done for them
- Forward-thinking — understands AI search is the future, wants to be early

**Examples:**
- Marketing manager at a mid-size e-commerce company
- Owner of a small insurance services company
- Restaurant owner who knows people ask ChatGPT "best restaurants near me"
- Any SMB owner losing leads because they're invisible in AI search

**NOT our customer (initially):** Agencies, enterprises, SEO professionals, technical marketers

---

## 3. The Problem

People no longer search only on Google. They ask ChatGPT, Gemini, Perplexity, and Claude for recommendations. When someone asks "best insurance company in Tel Aviv" or "top e-commerce platforms for small business" — if you're not mentioned, you don't exist.

**Current pain:**
- Business owners don't know they're invisible in AI search
- Even if they know, they don't know how to fix it
- Existing tools track the problem but don't solve it
- Hiring an agency costs thousands per month
- Traditional SEO/ads are becoming less effective as AI search grows

---

## 4. The Product — Three-Phase Experience

**Platform scale:** 23 pages, 90+ features across 10 modules, 16 AI agents (A1-A16), 10 AI scan engines in 3 rollout phases.

**Seven Structural Advantages:**
1. **Hebrew/RTL first** — Zero competitors serve Hebrew. Monopoly on Israeli market.
2. **Agent-first architecture** — Most comprehensive interactive autonomous agent suite under $100/month.
3. **Closed-loop system** — Scan → fix → measure in one platform (competitors break this loop).
4. **Cross-model QA** — GPT-4o reviews Claude's output. No single-model blind spots.
5. **Inngest-native** — Background jobs with retry, concurrency, observability built-in.
6. **Event-driven workflows** — Automated multi-agent chains (visibility drop → auto-fix).
7. **Progressive voice learning** — Content improves with every user edit.

### Phase 1: HOOK — Free Scan (Day 1 value)
- User enters their website URL + business sector + location
- Beamix queries 4 AI engines (Phase 1: ChatGPT, Gemini, Perplexity, Claude) with relevant prompts
- Results: Visual dashboard showing where they rank (or don't) in each model
- Emotional impact: "I had no idea I was invisible. My competitor is ranked #2."
- **This is free for everyone.** This is the top of the funnel.

### Phase 2: SOLVE — AI Agents Do the Work (Paid)
- After seeing the problem, 16 AI agents analyze WHY and create fixes:
  - **Recommendations Agent (A4)** — auto-runs after every scan, prioritizes what to fix next (free)
  - **Content Writer Agent (A1)** — writes GEO-optimized website pages
  - **Blog Writer Agent (A2)** — creates long-form blog posts targeting AI-discoverable topics
  - **Review Analyzer Agent (A6)** — reputation analysis + response templates
  - **Schema Optimizer Agent (A3)** — generates JSON-LD structured data
  - **FAQ Agent (A5)** — FAQ content matching AI queries
  - **Social Strategy Agent (A7)** — 30-day social content calendar
  - **Competitor Intelligence Agent (A8)** — deep competitive analysis + action items
  - **Citation Builder Agent (A9)** — outreach templates for citation sources
  - **LLMS.txt Generator (A10)** — AI-readable site description file
  - **AI Readiness Auditor (A11)** — comprehensive website AI audit
  - **Ask Beamix (A12)** — conversational data analyst (streaming, Pro+)
  - **Content Voice Trainer (A13)** — learns business writing voice from website (Growth Phase)
  - **Content Pattern Analyzer (A14)** — what makes cited content succeed (Growth Phase)
  - **Content Refresh Agent (A15)** — audits + updates stale published content (Growth Phase)
  - **Brand Narrative Analyst (A16)** — WHY AI says what it says about your brand (Growth Phase)
- User receives recommendations and content → reviews → publishes (or auto-publishes via WordPress integration)
- Regular re-scanning via Inngest cron jobs shows improvement over time

### Phase 3: CONNECT — Full Autopilot (Future)
- User connects platforms: website CMS, social media, review sites, business tools
- Agents work directly inside those systems
- Auto-publish approved content, manage social presence, respond to reviews
- Full automation with human-in-the-loop approval where needed

---

## 5. Competitive Landscape

| Competitor | Price | Weakness for SMBs |
|-----------|-------|-------------------|
| Writesonic GEO | $249-499/mo | Too expensive, GEO is secondary, 30-day delay for insights, confusing credits |
| SEMrush AI | $99/mo + add-ons | Enterprise complexity, 2.1/5 Trustpilot, sampling-based data |
| Neil Patel | Free scan | Lead-gen tool, not a real platform, no depth |
| Goodie AI | Enterprise pricing | Built for agencies/QBRs, analytics-heavy, action-light |

**Universal competitor weakness:** They all TRACK but don't DO. Built for agencies, not business owners.

**Beamix advantage:**
1. Does the work, not just shows the data
2. Built for non-technical SMB owners
3. Affordable (not $250+/month)
4. Shows value on day 1 (free scan), not after 30 days
5. Warm, approachable brand — not intimidating tech dashboard

---

## 6. GEO Ranking Factors (What Actually Works)

Based on research, LLMs rank businesses based on:

1. **Structured data + schema markup** on the website
2. **Natural language FAQs** — conversational format
3. **Fresh, original content** — updated regularly (10-15% of page content)
4. **Brand mentions** across trusted external sources
5. **Authority signals** — proprietary data, unique expertise, citations
6. **Reviews volume and sentiment** — LLMs read review platforms
7. **Content structure** — headers, bullet points, clear organization
8. **Clean website architecture**
9. **Social media presence and engagement**
10. **Industry directories and listings**

Each of these maps to a specific agent capability in the product.

---

## 7. Brand Identity

**Name:** Beamix

**Concept:** A beam of light — a ray of light that lifts business rankings up in AI search

**Design direction:**
- Minimalist, warm, eye-catching
- NOT too technological — approachable for non-tech users
- Illustrations and drawings (not stock photos or complex UI)
- Light/bright color palette with warm accents
- Should feel: friendly, powerful, professional, simple
- Should NOT feel: intimidating, complex, corporate, cold

**Tone of voice:**
- Clear, simple language (no jargon)
- Encouraging and empowering
- "We do this for you" not "Here's your data, figure it out"

---

## 8. Markets

**Primary:** Israeli SMBs first (Hebrew + English) — home market, direct feedback, Hebrew-first = zero competitors.
**Secondary:** Global English-speaking SMBs (US, UK, Australia, etc.)

**Language support from day 1:** Hebrew (RTL) + English (LTR)

---

## 9. Development Constraints

- **Team:** Solo founder + AI-assisted development (Claude, etc.)
- **Stack:** Next.js 16, React 19, TypeScript strict, Supabase, Tailwind CSS, Paddle, Inngest, Resend
- **AI orchestration:** Direct LLM API integration. Background jobs via Inngest (NOT n8n). No workflow tools.
- **Deployment:** Vercel + Supabase Cloud
- **Billing:** Paddle only (Stripe removed)

---

## 10. Revenue Model

**Freemium + subscription:**
- Free: Initial scan + basic results (limited detail). No "free" tier in DB — free = null `plan_tier`.
- Paid: Full dashboard, AI agents, ongoing monitoring, content generation.
- Trial: 7 days starting on **first dashboard visit** (not signup), capped at 5 agent credits.

**Subscription tiers:**

| | Free Scan | Starter | Pro | Business |
|---|---|---|---|---|
| **Price** | $0 | $49/mo | $149/mo | $349/mo |
| **Tracked queries** | 0 | 10 | 25 | 75 |
| **Agent uses/month** | 0 | 5 | 15 | 50 |
| **Scan frequency** | One-time | Weekly | Every 3 days | Daily |
| **AI engines** | 4 (Phase 1) | 4 | 8 | 10 |
| **Competitors tracked** | 0 | 3 | 5 | 10 |

**Key pricing principles:**
- Must be affordable for SMBs (NOT $250+/month like competitors)
- Value must be obvious before payment is required (free scan → trial → paid)
- Credit system: hold on job start → confirm on success → release on failure. Rollover cap: 20% of monthly allocation.

---

## 11. Success Metrics

**Product-market fit signals:**
- Free scan completion rate > 60%
- Free → paid conversion rate > 5%
- User returns to dashboard within 7 days
- User approves and publishes agent-generated content
- Net Promoter Score > 40

**Business metrics:**
- MRR growth
- CAC < 3-month LTV
- Churn < 5% monthly

---

## 12. What We Are NOT Building

- An SEO tool (we are GEO-focused, not traditional SEO)
- A marketing agency replacement (we augment the owner, not replace marketers)
- An enterprise analytics platform (we serve SMBs)
- A generic AI content writer (everything we generate is GEO-optimized)
