# AI Visibility Optimization Platform
## Master Product Requirements Document

**Version:** 2.0
**Last Updated:** February 14, 2026
**Status:** Ready for Development
**Development Timeline:** 2 Weeks (Sprint-based MVP)
**Primary Language:** English (Hebrew support in Phase 2)

---

## Document Structure

This PRD is organized as follows:

**THIS DOCUMENT (MASTER_PRD.md):** High-level vision, product strategy, competitive positioning, and overall architecture

**DETAILED COMPONENT SPECIFICATIONS:**
- `01_FRONTEND_Specifications.md` - UI, components, user flows, state management
- `02_SUPABASE_Specifications.md` - Database schema, authentication, Row-Level Security
- `03_n8n_WORKFLOWS.md` - All automation workflows and integrations
- `04_STRIPE_Integration.md` - Payment flows, subscription management, webhooks
- `05_DEPLOYMENT.md` - Vercel deployment, environment setup, monitoring

**AI AGENT SPECIFICATIONS:**
- `AGENT_01_ContentWriter.md` - Detailed specs for Content Writer Agent
- `AGENT_02_CompetitorResearch.md` - Detailed specs for Competitor Research Agent
- `AGENT_03_QueryResearcher.md` - Detailed specs for Query Researcher Agent
- `AGENT_04_ReviewAnalysis.md` - (Optional/Phase 2) Review Analysis Agent

**DEVELOPMENT GUIDE:**
- `TASKS_Week1.md` - Day-by-day tasks for Week 1 (Infrastructure + Dashboard)
- `TASKS_Week2.md` - Day-by-day tasks for Week 2 (Agents + Billing)

---

## Executive Summary

### What We're Building

A **B2B SaaS platform** that helps SMBs (small-medium businesses) improve their visibility in LLM search results (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) through:

1. **Real-Time LLM Ranking Tracking** across 4-8 AI engines
2. **Actionable Recommendations** (prescriptive, not generic)
3. **AI-Powered Agents** to execute recommendations automatically
4. **Credit-Based Usage Model** with transparent API-cost-based pricing

### The Market Opportunity

**The Problem:**
- When customers ask LLMs "Who is the best [service] in [region]?", SMBs either don't appear or rank positions 4-10 (losing high-intent leads)
- Current GEO (Generative Engine Optimization) tools are prohibitively expensive ($2K-5K/month) and enterprise-focused
- No affordable solution for SMBs with $200-800/month marketing budgets

**The Gap:**

| Competitor | Price | Content Generation | Actionable Recs | Target |
|------------|-------|-------------------|-----------------|--------|
| **Profound** | $2K-5K/mo | Beta (limited) | Generic | Enterprise |
| **Semrush** | $99-549/mo | None | None | Mid-market (SEO bundled) |
| **Our Platform** | **$200-600/mo** | **4 AI Agents built-in** | **Prescriptive + one-click** | **SMBs** |

**Our Positioning:**
- "Get Profound's power at 70% lower cost"
- "The only GEO platform that generates content for you"
- "AI visibility for businesses that can't afford $2,000/month"

### Success Metrics (First 6 Months)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Paying Customers** | 20-50 | Stripe subscriptions |
| **Retention Rate** | 75%+ | Monthly churn <25% |
| **Avg Ranking Improvement** | 30%+ improve 3+ positions in 90 days | Database analytics |
| **MRR** | $6K-30K | Stripe dashboard |
| **CAC** | <$500 | Marketing spend ÷ customers |
| **LTV** | >$3,600 (12-month avg) | ASP × avg lifetime |
| **NPS** | >40 | Quarterly survey |

---

## Product Vision & Strategy

### Vision Statement

**"Make AI visibility accessible and actionable for every small business."**

In 2026, LLM search is replacing traditional Google search for high-intent queries. Businesses that don't optimize for ChatGPT, Claude, and Perplexity will lose customers to competitors who rank in the top 3 results. Our platform democratizes GEO technology—making enterprise-grade AI visibility tools affordable, simple, and executable for SMBs.

### Strategic Pillars

**1. Affordability**
- Price: $200-600/month (vs. competitors' $2K-5K)
- No gatekeeper pricing (all LLMs available from entry tier)
- Credit-based usage model (transparent, based on actual API costs)

**2. Actionability**
- Not just tracking → **Recommendations + Execution**
- Prescriptive guidance: "Write an article about X" (not "improve content on X")
- One-click agent execution: User clicks "Generate Article" → AI writes it

**3. Simplicity**
- 3-5 core metrics (not 20+ overwhelming data points like Profound)
- No SEO jargon or prerequisite knowledge
- 10-minute time-to-value (see initial LLM rankings immediately)

**4. Agent-Powered Automation**
- 4 AI agents: Content Writer, Competitor Research, Query Researcher, Review Analysis
- 50-70% automated platform (n8n workflows reduce manual work)
- Done-with-you model: We generate content, user reviews and publishes

### Target Customer

**Primary Persona: SMB Owner/Marketing Manager**

- **Company Size:** 5-50 employees, $500K-$5M revenue
- **Industries:** Services (relocation, construction), Professional Services (accounting, legal), Hospitality, Finance (insurance), Health/Wellness
- **Pain Points:**
  - Losing customers to competitors ranking higher in ChatGPT/Claude
  - Limited marketing budget ($2K-5K/month total)
  - No SEO/GEO expertise
  - Needs proven results within 3-6 months
- **Decision Factors:**
  - ROI: "Will this bring real customers?"
  - Proof: Case studies, visible ranking improvements
  - Simplicity: No complex implementation
  - Price: $200-800/month (within budget)

**Tech Savviness:** Medium (comfortable with SaaS dashboards like Google Analytics, Mailchimp)

---

## Product Architecture (High-Level)

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
│                  (SMB Owner/Manager)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  - Dashboard (rankings, metrics, competitor comparison)     │
│  - Agent Execution UI (one-click content generation)        │
│  - Recommendations Display (actionable tasks)               │
│  - Credit Balance & Subscription Management                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Next.js API Routes)               │
│  - Authentication (Supabase Auth)                           │
│  - API Endpoints (dashboard data, agent triggers)           │
│  - Credit Validation & Deduction                            │
│  - Webhook Handling (Stripe subscription events)            │
└──────┬─────────────┬─────────────┬─────────────┬────────────┘
       │             │             │             │
       ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Supabase │  │   n8n    │  │  Stripe  │  │ LLM APIs │
│ (Database)│  │ (Workflows)│  │(Payments)│  │(OpenAI, │
│ + Auth   │  │ + Agents │  │          │  │Anthropic)│
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Tech Stack

| Component | Technology | Purpose |
|-----------|----------|---------|
| **Frontend** | Next.js 14 (App Router) | React-based web app, Vercel deployment |
| **UI Library** | Shadcn UI + Tailwind CSS | Pre-built components, consistent design |
| **State Management** | React Query + Zustand | Server state + client state |
| **Database** | Supabase (PostgreSQL) | User data, rankings, history, credits |
| **Authentication** | Supabase Auth | JWT-based auth, email verification |
| **Automation** | n8n Cloud | Workflows for agents, LLM queries, scheduled jobs |
| **Payments** | Stripe | Subscription management, billing, webhooks |
| **LLM APIs** | OpenAI (GPT-4o), Anthropic (Claude Opus 4.5), Perplexity, Gemini | Multi-engine LLM ranking tracking + content generation |
| **Hosting** | Vercel | Frontend deployment, auto-scaling, CDN |
| **Monitoring** | Sentry + Vercel Analytics | Error tracking, performance monitoring |

**Design Decisions:**
- **Backend:** Claude Code will decide between Next.js API Routes (simpler for MVP) or dedicated Node.js server (better scalability)
- **State Management:** Claude Code will decide if React Query + Zustand is best, or if a different approach (Redux Toolkit, Jotai) is better for this use case

---

## Core Features (MVP)

### 1. LLM Ranking Dashboard

**What It Does:**
Shows user's business ranking across ChatGPT, Claude, Perplexity, Gemini for relevant industry queries

**Key Metrics:**
- **Average LLM Ranking** (1-10 scale, across all tracked queries)
- **Mention Count** (times business appears in LLM responses, last 30 days)
- **Citation Count** (times business is cited with URL, last 30 days)
- **Competitor Comparison** (user vs. top 3 competitors)
- **Trend Indicators** (↑ improved, ↓ declined, → no change)

**User Value:**
- Transparency: "Where do I stand right now?"
- Proof of progress: "Am I improving over time?"

**Implementation Priority:** P0 (Must-Have for MVP)

---

### 2. Actionable Recommendations Engine

**What It Does:**
Analyzes ranking data + competitor data → generates specific, prioritized recommendations with one-click execution

**Recommendation Types:**
- **Content Gaps:** "You rank #8 for '[query]' → Write an article about [topic]" → Button: "Generate Article"
- **Competitor Insights:** "Competitor X ranks #1 because they mention Y → Add FAQ section about Y" → Button: "Research Competitor"
- **Citation Opportunities:** "Your site is mentioned but not cited → Add schema markup to [page]"

**Recommendation Format:**
```
┌─────────────────────────────────────────────────┐
│ Action: Write article about "Best relocation   │
│         services in Tel Aviv"                   │
│                                                 │
│ Impact: HIGH (query volume: ~500/month)        │
│ Effort: MEDIUM (Content Writer Agent: 3 credits)│
│                                                 │
│ Why: You rank #6 for this query. Competitor    │
│      ranks #1 with detailed article.           │
│                                                 │
│ [Generate Article] [Dismiss] [Mark Done]       │
└─────────────────────────────────────────────────┘
```

**User Value:**
- No guessing: "Tell me exactly what to do next"
- Immediate execution: "Do it for me in 1-click"

**Implementation Priority:** P0 (Must-Have for MVP)

---

### 3. AI Agent System

**What It Does:**
4 AI agents that execute recommendations automatically (user pays with credits)

**Agents:**

| Agent | Purpose | Cost | Output |
|-------|---------|------|--------|
| **Content Writer** | Generates 800-1,500 word LLM-optimized articles | 3 credits | Markdown/HTML article |
| **Competitor Research** | Analyzes competitor's LLM strategy + content gaps | 2 credits | Analysis report (Markdown) |
| **Query Researcher** | Discovers 30-50 relevant queries for user's industry | 1 credit | Prioritized query list |
| **Review Analysis** | (Phase 2) Analyzes existing reviews for themes/sentiment | 2 credits | Insights report |

**User Value:**
- Time savings: "Don't make me write content myself"
- Expertise: "I don't know how to optimize for LLMs, the AI does"

**Implementation Priority:** P0 for first 3 agents (Review Analysis is P1/Phase 2)

**Detailed Specs:** See `AGENT_01_ContentWriter.md`, `AGENT_02_CompetitorResearch.md`, `AGENT_03_QueryResearcher.md`

---

### 4. Credit System & Subscription Tiers

**How It Works:**
- User subscribes to a tier → receives monthly credits
- Each agent execution costs credits
- Credits reset monthly (no rollover)

**Pricing Tiers:**

**Tier 1 - Starter ($250-300/month):**
- 30 credits/month
- 4 LLMs tracked: ChatGPT, Claude, Perplexity, Gemini
- Weekly dashboard updates
- Access to: Content Writer, Query Researcher agents
- Email support

**Tier 2 - Pro ($500-600/month):**
- 100 credits/month
- 6 LLMs tracked: ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews, Grok
- Daily dashboard updates
- Access to: All agents (Content Writer, Competitor Research, Query Researcher, Review Analysis)
- Bi-weekly check-ins (email/call)
- Priority support

**Credit Economics:**
- 1 credit = $0.05 internal cost (covers LLM API calls + infrastructure)
- Agents priced based on actual API costs:
  - Content Writer (3 credits) = $0.10 actual cost → $0.05 margin
  - Competitor Research (2 credits) = $0.06 actual cost → $0.04 margin
  - Query Researcher (1 credit) = $0.12 actual cost → -$0.07 loss (acceptable for onboarding value)

**User Value:**
- Transparent pricing: "I know exactly what I'm paying for"
- No overages: "My credits run out, I upgrade or wait for next month"

**Implementation Priority:** P0 (Must-Have for MVP)

---

## Development Timeline: 2-Week Sprint

**Week 1: Core Infrastructure + Dashboard**
- Days 1-2: Supabase setup, Next.js setup, authentication
- Days 3-4: Initial LLM analysis workflow (n8n), dashboard UI
- Day 5: Competitor comparison, query tracking, UI polish

**Week 2: AI Agents + Recommendations + Billing**
- Days 1-2: Content Writer Agent, Competitor Research Agent, Query Researcher Agent
- Days 3-4: Recommendations Engine, one-click agent execution
- Day 5: Credit system, Stripe integration, end-to-end testing

**Week 3: Pilot Testing + Public Launch**
- Days 1-3: Pilot testing with 3-5 SMBs, bug fixes
- Days 4-5: Public launch prep (landing page, docs, pricing page)

**Detailed Breakdown:** See `TASKS_Week1.md` and `TASKS_Week2.md`

---

## Success Criteria

### Launch Readiness (End of Week 2)

**Must-Have:**
- ✅ User can sign up, verify email, log in
- ✅ User sees initial LLM ranking analysis within 10 minutes of signup
- ✅ Dashboard displays: avg ranking, mention count, citation count, competitor comparison
- ✅ User can add competitors, custom queries
- ✅ User sees 5-10 actionable recommendations
- ✅ User can execute Content Writer Agent (generates article, deducts credits)
- ✅ User can execute Competitor Research Agent
- ✅ User can execute Query Researcher Agent
- ✅ User can subscribe via Stripe, credits are allocated
- ✅ Credits are deducted correctly on agent execution
- ✅ Dashboard is mobile-responsive
- ✅ No critical bugs (authentication works, agents don't fail >5% of time)

**Nice-to-Have (Week 3+):**
- ⭕ Historical trend graphs (ranking over time)
- ⭕ Export dashboard as PDF/CSV
- ⭕ Email notifications for ranking changes
- ⭕ Review Analysis Agent

### Product-Market Fit (Month 2-6)

**Key Indicators:**
- **Retention:** 75%+ of customers renew after Month 1
- **Usage:** 50%+ of customers execute at least 1 agent per month
- **Results:** 30%+ of customers see 3+ position improvement within 90 days
- **Revenue:** $6K-30K MRR by Month 6
- **NPS:** >40 (customers would recommend to others)

---

## Non-Goals (Out of Scope for MVP)

**What We're NOT Building (Yet):**

1. **CDN-Level Agent Analytics** (Profound's unique feature - requires enterprise CDN partnerships, defer to Phase 2)
2. **10+ LLM Coverage** (start with 4-6 LLMs, expand later)
3. **Multi-Language Support** (English only in MVP, Hebrew in Phase 2)
4. **Review Manipulation** (legal risk - only legitimate review collection in Phase 2)
5. **White-Label/Agency Reseller** (direct-to-SMB only in MVP)
6. **Content Placement Services** (we generate content, user publishes it)
7. **Guaranteed Ranking Improvements** (LLM algorithms change - we provide tools, not guarantees)
8. **Mobile Apps** (iOS/Android - defer to Phase 3+)

---

## Risks & Mitigation

**Top Risks:**

1. **LLM Algorithm Changes**
   - Risk: ChatGPT/Claude change ranking factors → our strategies become ineffective
   - Mitigation: Diversify across 4-6 LLMs, focus on stable fundamentals (authority, citations, content quality), communicate to users that rankings aren't guaranteed

2. **Customer Acquisition Cost**
   - Risk: CAC > $500 makes unit economics unsustainable
   - Mitigation: Focus on 1-2 verticals first (relocation, construction), build case studies, use content-driven inbound leads

3. **Agent Quality**
   - Risk: Generated content is low-quality → users don't see value
   - Mitigation: High-quality GPT-4o prompts, test with 3-5 pilot users before public launch, iterate based on feedback

4. **API Rate Limits**
   - Risk: OpenAI/Anthropic rate-limit us during onboarding (60-80 API calls)
   - Mitigation: Exponential backoff retry logic, split queries across time

---

## Design System Basics (Medium Detail)

**Color Palette:**
- **Primary:** Blue-based (trust, professionalism) - Claude Code will decide exact hex codes
- **Success:** Green (ranking improvements)
- **Warning:** Orange (low credits, ranking declines)
- **Error:** Red (API failures, validation errors)
- **Neutral:** Gray scale (text, backgrounds)

**Typography:**
- **Headings:** Sans-serif font (e.g., Inter, Geist) - Claude Code will decide specific font
- **Body:** Same sans-serif for consistency
- **Code/Data:** Monospace font (e.g., JetBrains Mono) for API responses, generated content

**Spacing System:**
- Use Tailwind's default spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Consistent padding/margin across components
- Claude Code will apply these consistently

**Component Guidelines:**
- **Buttons:** Primary (solid background), Secondary (outline), Tertiary (text-only)
- **Cards:** White background, subtle shadow, rounded corners
- **Charts:** Use Recharts library (simple line/bar charts)
- **Forms:** Clear labels, validation states (error/success), autofocus on first field

**Reference:** Claude Code should use Shadcn UI components (pre-built, Tailwind-based) for consistency

---

## Next Steps

**For Claude Code:**

1. **Start with `01_FRONTEND_Specifications.md`:**
   - Read detailed UI specs
   - Build Next.js app structure
   - Implement dashboard UI

2. **Then `02_SUPABASE_Specifications.md`:**
   - Create database schema
   - Set up RLS policies
   - Configure authentication

3. **Then `03_n8n_WORKFLOWS.md`:**
   - Set up n8n Cloud account
   - Build workflows for Initial Analysis, Agents, Scheduled Updates

4. **Then `AGENT_01_ContentWriter.md`, `AGENT_02_CompetitorResearch.md`, `AGENT_03_QueryResearcher.md`:**
   - Implement each agent with detailed specs

5. **Then `04_STRIPE_Integration.md`:**
   - Set up Stripe subscriptions
   - Implement webhooks
   - Handle credit allocation

6. **Finally `05_DEPLOYMENT.md`:**
   - Deploy to Vercel
   - Configure environment variables
   - Set up monitoring

**For Product Team:**
- Finalize pricing (Tier 1: $250 or $300? Tier 2: $500 or $600?)
- Recruit 3-5 pilot users for Week 3 testing
- Prepare launch materials (landing page copy, case study templates)

---

## Document Updates

**Version History:**
- v2.0 (Feb 14, 2026): Restructured for Claude Code development, added agent specs, competitive analysis
- v1.0 (Feb 13, 2026): Initial PRD draft

**Contributors:**
- Product Team
- Competitive Research Team

**Approval Status:**
- ✅ Product: Approved
- ✅ Engineering: Ready for development
- ⏳ Design: Pending final color palette approval
- ⏳ Business: Pending final pricing approval

---

**END OF MASTER PRD**

**Next Document:** Read `01_FRONTEND_Specifications.md` for detailed UI implementation specs.