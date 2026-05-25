# Beamix — Strategic Foundation *(Updated 2026-05-23 — agency pivot)*

> **Last synced:** 2026-05-23 — agency pivot. Source of truth: `.claude/memory/DECISIONS.md` 2026-05-23 entry.

> Strategic foundation for Beamix. For the agency-pivot decision matrix, see `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md`.
>
> **Repository:** https://github.com/Adam077K/Beamix
> **Last Updated:** 2026-05-23 — Agency Pivot

---

## 1. What Is Beamix? *(Updated 2026-05-23 — agency pivot)*

**One-liner:** Beamix is a done-for-you GEO agency, delivered as software. We get your business cited by ChatGPT, Gemini, Perplexity and Claude — you approve content in one click and watch the score move.

**Category:** Done-for-you GEO agency for SMBs (not a tool, not a dashboard).

**Core differentiator:** Competitors show dashboards. Agencies charge $2K–$8K/mo. Beamix does the work at SaaS price points ($499–$2,499/mo), with traceability, with a 60-day no-questions money-back.

---

## 2. The Customer *(Updated 2026-05-23 — agency pivot, 3 launch ICPs)*

**Launch ICPs (3 verticals):**
1. **B2B SaaS founder / VP marketing** at companies < $5M ARR
2. **Solo / small-firm lawyer** ($1K–$3K/mo legal-marketing budget; highest digital CPL of any industry)
3. **Owner-dentist at single-location dental practice** (established $800–$1,500/mo local-SEO spend)

Full persona detail: [PERSONAS.md](./PERSONAS.md).

**Common traits across all 3 ICPs:**
- Will pay $499–$2,499/mo for outcomes; will NOT learn a tool
- Approves work in one click via weekly digest; doesn't operate dashboards
- Wants traceability ("show me what you did") and one-click cancel as trust signals
- Forward-thinking about AI search but doesn't have time to figure it out themselves

**Deferred to MVP+90:** HVAC / plumbing, real estate, DTC e-commerce, healthcare-non-dental.

**NOT our customer:** Agencies (we replace them), enterprises (priced too low), DIY SEO professionals (we're not a tool).

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

## 10. Revenue Model *(Updated 2026-05-23 — agency pivot)*

**Done-for-you subscription, 4 tiers, no free tier beyond the scan:**

- **Free scan + discovery booking** — Sees the visibility gap. No paid product gating. Goal: book the discovery call.
- **Paid subscription** — Done-for-you GEO delivery + outcomes dashboard + approval queue + weekly digest. Month-to-month.
- **60-day no-questions money-back guarantee** — replaces the old 14-day money-back trial. Held-revenue accounting through day 60.

**Subscription tiers (RETIRED Discover/Build/Scale; current 4 tiers):**

| | **Starter** | **Growth** | **Scale** | **Professional** |
|---|---|---|---|---|
| **Price** | $499/mo | $999/mo | $1,499/mo | $2,499/mo |
| **Locations** | 1 | 3 | Unlimited | Unlimited |
| **AI engines tracked** | 3 | 5 | 7 | 7 + custom |
| **Prompts/engine** | 25 | 75 | 200 | 500 |
| **Schema/mo** | 4 | 12 | 24 | Unlimited |
| **FAQs/mo** | 2 | 6 | 10 | 16 |
| **Citations/mo** | 5 | 15 | 30 | Unlimited |
| **Outreach emails/mo** | — | — | 10 | 30 |
| **SLA** | 48h | 24h | 12h | 4h + Slack |
| **Money-back** | 60-day | 60-day | 60-day | 60-day |

Full tier matrix and deliverable details: [docs/product-rethink-2026-04-09/06-PRICING-V2.md](../product-rethink-2026-04-09/06-PRICING-V2.md).

**Key pricing principles:**
- Customer pays for outcomes, not tools. No credit counters. No "AI Runs" UI.
- Anchored against $2K–$8K/mo agencies — Beamix sits 50–80% below market.
- Money-back is the trust mechanic. One-click cancel. Held-revenue through day 60.
- Adam reviews every brand fingerprint through customer #50; then handoff to Brand-brief manager agent.

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
