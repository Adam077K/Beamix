# Product Requirements Document (PRD)
## AI Visibility Optimization Platform - MVP

**Document Version:** 2.0 (Final)
**Last Updated:** February 14, 2026
**Status:** Ready for Development
**Author:** Product Team
**Stakeholders:** Engineering, Product, Design, Business
**Development Timeline:** 2 Weeks (Sprint-based MVP)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Competitive Landscape & Market Opportunity](#competitive-landscape--market-opportunity)
3. [Problem Statement](#problem-statement)
4. [Goals & Non-Goals](#goals--non-goals)
5. [User Personas](#user-personas)
6. [Product Requirements (MVP)](#product-requirements-mvp)
7. [Technical Architecture (Detailed)](#technical-architecture-detailed)
8. [Agent System & Credit Economics](#agent-system--credit-economics)
9. [Development Timeline: 2-Week Sprint](#development-timeline-2-week-sprint)
10. [Success Metrics](#success-metrics)
11. [Open Questions](#open-questions)
12. [Appendix](#appendix)

---

## Executive Summary

### What We're Building

An **AI Visibility Optimization Platform** that helps SMBs improve their rankings in LLM search results (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) through:

1. **Real-time LLM Ranking Tracking** across 4-8 AI engines
2. **Actionable Recommendations** (prescriptive, not generic: "Write article about X")
3. **AI Agents** to execute recommendations (Content Writer, Competitor Research, Query Researcher)
4. **Credit-Based Usage Model** with transparent pricing based on actual API costs

**Primary Language:** English (Hebrew support in Phase 2)

### Why This Wins

**Competitors (Profound, Semrush) leave a massive gap:**

| Gap | Profound | Semrush | **Our Solution** |
|-----|----------|---------|------------------|
| **Pricing** | $99-5,000/month (gatekeeper model) | $99-549/month (bundled with SEO) | **$200-600/month (all LLMs, no SEO bundle)** |
| **Content Generation** | Beta (Profound Workflows) | None | **4 AI agents built-in** |
| **Actionable Recommendations** | Generic ("improve content on X") | None | **Prescriptive + one-click agent execution** |
| **UX Complexity** | "Overwhelming" (user feedback) | Requires SEO knowledge | **Simple dashboard, 3-5 core metrics** |
| **Time to Value** | Weeks to months | Moderate (SEO setup required) | **10 minutes to first analysis** |

**Market Position:** "The AI Visibility Platform for SMBs — Profound's power at 70% lower cost"

### Target Launch

**Week 1-2:** MVP development (aggressive 2-week sprint)
**Week 3:** Pilot testing with 3-5 SMBs
**Week 4:** Public launch (Tier 1 only)
**Month 2:** Tier 2 expansion + agent optimization

---

## Competitive Landscape & Market Opportunity

### Competitor Analysis Summary

**(Full analysis in separate document: [Competitive_Analysis_Profound_Semrush.md](./Competitive_Analysis_Profound_Semrush.md))**

#### Profound: Enterprise GEO Leader

**Strengths:**
- CDN-level Agent Analytics (Cloudflare/Vercel integration)
- 10+ LLM coverage (ChatGPT, Claude, Perplexity, Gemini, Grok, DeepSeek, Meta AI, Copilot, Google AI)
- 400M+ conversation database
- Profound Workflows (automation in beta)
- SOC 2 Type II, HIPAA compliant

**Weaknesses (Our Opportunities):**
- **Prohibitively expensive:** $99 (ChatGPT-only) → $399 (3 LLMs) → $2K-5K (full platform)
- **Gatekeeper pricing:** Locks Agent Analytics and full LLM coverage behind Enterprise
- **Complex UX:** "Data-heavy," "overwhelming" (user feedback)
- **Limited content generation:** Workflows in beta, not deeply integrated

**Technical Stack (Inferred):**
- Backend: Node.js/Python + LLM API orchestration
- Database: Snowflake/BigQuery (large-scale data warehouse)
- CDN Integration: Cloudflare Worker for Agent Analytics
- Real-time Processing: Event-driven architecture
- AI Layer: GPT-4/Claude for content generation

#### Semrush AI Visibility: SEO + AI Bundled

**Strengths:**
- 239M+ prompt database (largest U.S. coverage: 90M+)
- Unified SEO + AI visibility dashboard
- Topic-level analysis (groups similar prompts)
- AI Site Audit (technical SEO for AI accessibility)
- Established brand (10M+ users, Adobe acquisition)

**Weaknesses (Our Opportunities):**
- **No content generation:** Tracking-only
- **Limited LLM coverage:** Only 4 LLMs (ChatGPT, Gemini, Perplexity, Google AI)
- **Bundled with SEO:** Must pay for 55+ SEO tools ($199-549/month)
- **Generic recommendations:** "You rank poorly for X" (not actionable)

**Technical Stack (Inferred):**
- Backend: Python/Node.js + LLM API integration
- Database: PostgreSQL + Snowflake/BigQuery for analytics
- Daily Prompt Queries: API calls to ChatGPT, Gemini, Perplexity, Google AI
- Legacy Infrastructure: 15+ years of SEO platform development

### Market Opportunity: The SMB Gap

**Both competitors target enterprises/mid-market.** SMBs need:

1. **Affordable pricing:** $200-600/month (not $2K+)
2. **Actionable recommendations:** Not just "improve content on X" but "Write article about Y" + one-click generation
3. **Simple UX:** 3-5 core metrics, no SEO jargon
4. **Done-with-you model:** We generate content, not just track rankings
5. **Fast time-to-value:** See results in days, not months

**Addressable Market:** 50,000+ SMBs in target verticals (services, professional services, hospitality, finance, health/wellness) × $500/month average = **$25M+ annual opportunity**

---

## Problem Statement

### The Core Problem

When potential customers ask LLMs: "Who is the best [service] in [region]?" or "Which [business type] should I choose?", SMBs either:

1. **Don't appear at all** (invisibility problem)
2. **Rank in positions 4-5+** instead of 1-3 (low ranking problem)

**Impact:** Businesses lose high-intent leads to competitors who rank higher in LLM responses.

### Why Existing Solutions Don't Work for SMBs

**Profound:** $2,000-5,000/month (out of budget), complex UX, limited content generation
**Semrush:** $199-549/month (bundled with SEO tools SMBs don't need), no content generation
**Both:** Generic recommendations without execution, requires SEO expertise

**What's Missing:** An affordable, simple, agent-powered platform that not only tracks but **executes improvements**.

---

## Goals & Non-Goals

### Goals (MVP)

1. **Primary:** Provide SMBs with actionable recommendations they can execute in 1-click
2. **Visibility Transparency:** Show LLM rankings compared to competitors
3. **Agent-Powered Execution:** Enable users to generate content, research competitors, discover queries via AI agents
4. **Scalable Platform:** 50-70% automated (n8n workflows reduce manual work)
5. **Cost Efficiency:** Deliver Profound's value at 70% lower cost

### Non-Goals (Out of Scope for MVP)

1. **CDN-level Agent Analytics** (Profound's unique feature — requires enterprise partnerships, defer to Phase 2)
2. **10+ LLM coverage** (start with 4-6 LLMs in MVP, expand in Phase 2)
3. **Multi-language support** (English only in MVP, Hebrew in Phase 2)
4. **Review manipulation** (legal risk, defer to Phase 2 with compliant solutions)
5. **White-label/agency reseller** (direct-to-SMB only in MVP)
6. **Content placement/distribution** (we generate content, user publishes it)

---

## User Personas

### Primary Persona: SMB Owner/Marketing Manager

**Demographics:**
- Role: Business Owner, Marketing Manager, Operations Lead
- Company size: 5-50 employees, annual revenue: $500K-$5M
- Geographic focus: Global (English-speaking markets)
- Industries: Services (relocation, construction, home improvement), Professional Services (accounting, legal, consulting), Hospitality, Finance (insurance, mortgages), Health/Wellness

**Goals:**
- Increase visibility in LLM search to capture high-intent leads
- Compete with larger, better-funded competitors
- Understand what actions will improve rankings
- Track progress with clear metrics

**Pain Points:**
- Traditional Google SEO is saturated and expensive
- Losing customers to competitors ranking higher in ChatGPT/Claude
- Limited marketing budget ($2K-5K/month total)
- Doesn't understand GEO or have SEO expertise
- Needs proven results within 3-6 months

**Tech Savviness:** Medium (comfortable with SaaS dashboards like Google Analytics, Mailchimp)

**Decision Factors:**
- ROI: "Will this bring me real customers?"
- Proof: Case studies, visible ranking improvements
- Simplicity: No complex SEO implementation required
- Price: $200-800/month (within digital marketing budget)

---

## Product Requirements (MVP)

### P0 (Must-Have for 2-Week MVP)

#### 1. User Authentication & Onboarding (Week 1, Day 1-2)

**1.1 Sign-Up Flow**
- Form: Email, Password, Business Name, Website URL, Primary Location
- Supabase Auth for authentication
- Email verification required
- Redirect to dashboard after signup

**Acceptance Criteria:**
- User can sign up in <2 minutes
- Email verification sent automatically
- User stored in `users` table (Supabase), business data in `businesses` table

**Technical Notes:**
- Use Supabase Auth (managed service, no custom auth code)
- Store business metadata: `business_name`, `website`, `location`, `industry_vertical` (auto-detected or user-selected)

---

**1.2 Initial Analysis Trigger (Week 1, Day 2-3)**

**Requirement:** Upon signup, system automatically runs initial LLM ranking analysis

**Acceptance Criteria:**
- System generates 15-20 industry-relevant queries (based on business type + location)
- Queries 4 LLMs minimum: ChatGPT (gpt-4o), Claude (opus-4.5), Perplexity, Gemini
- Results displayed in dashboard within 5-10 minutes
- User sees "Analyzing your LLM visibility..." loading state

**Technical Notes:**
- **Trigger:** Supabase Database Trigger on `INSERT` to `businesses` table → calls backend endpoint → triggers n8n workflow: "Initial Analysis"
- **n8n Workflow:**
  1. Receive `business_id`, `industry`, `location`
  2. Call GPT-4 to generate 15-20 queries (prompt: "Generate 15 LLM search queries for a [industry] business in [location]")
  3. For each query, call 4 LLM APIs in parallel:
     - OpenAI ChatGPT API (gpt-4o model with search enabled)
     - Anthropic Claude API (claude-opus-4.5 model)
     - Perplexity API
     - Google Gemini API
  4. Parse each LLM response to extract:
     - Ranking position (1-10 or "Not Mentioned")
     - Is business mentioned? (boolean)
     - Is business cited with URL? (boolean)
  5. Store in `ranking_history` table
  6. Update dashboard status to "Analysis Complete"

**API Cost Estimate (Per Analysis):**
- 15-20 queries × 4 LLMs = 60-80 API calls
- Avg cost: $0.10-0.20 per query (GPT-4, Claude, Perplexity, Gemini)
- **Total per customer onboarding: $6-16**

---

#### 2. Dashboard & Visibility Tracking (Week 1, Day 3-5)

**2.1 Core Metrics Display**

**Requirement:** Dashboard shows 3-5 core metrics (simple UX, not overwhelming)

**Acceptance Criteria:**
- **LLM Ranking Position:** Average ranking (1-10) across all tracked queries, with trend indicator (↑↓→)
- **Mention Count:** Total times business appears in LLM responses (last 30 days)
- **Citation Count:** Total times business is cited with URL (last 30 days)
- **Competitor Comparison:** User's avg ranking vs. top 3 competitors (user-inputted)
- Filterable by: LLM (ChatGPT, Claude, Perplexity, Gemini), date range (7d, 30d, 90d), query category

**Technical Notes:**
- **Frontend:** Next.js 14 (App Router) + Shadcn UI components
- **State Management:** React Query for server state, Zustand for client state
- **Charts:** Recharts for trend graphs (simple line/bar charts)
- **Data Source:** Supabase `ranking_history` table, aggregated in real-time via SQL queries

**Database Schema (Simplified):**

```sql
-- ranking_history table
CREATE TABLE ranking_history (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  query_id UUID REFERENCES tracked_queries(id),
  llm_engine TEXT, -- 'chatgpt' | 'claude' | 'perplexity' | 'gemini'
  ranking_position INTEGER, -- 1-10 or NULL
  is_mentioned BOOLEAN,
  is_cited BOOLEAN,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Aggregation query for dashboard
SELECT
  llm_engine,
  AVG(ranking_position) as avg_ranking,
  COUNT(*) FILTER (WHERE is_mentioned = TRUE) as mention_count,
  COUNT(*) FILTER (WHERE is_cited = TRUE) as citation_count
FROM ranking_history
WHERE business_id = :business_id
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY llm_engine;
```

---

**2.2 Query Discovery & Tracking**

**Requirement:** System automatically identifies relevant queries + allows manual additions

**Acceptance Criteria:**
- System suggests 20-30 queries based on industry + location (auto-generated in initial analysis)
- User can add custom queries ("Track this query: [custom query]")
- Dashboard shows which queries are most commonly asked (volume estimate from Semrush-style topic analysis)

**Technical Notes:**
- Use Query Researcher Agent (see Section 3.3) to generate queries
- Store in `tracked_queries` table with fields: `query_text`, `source` ('auto-generated' | 'user-added'), `estimated_volume` (placeholder for future integration)

---

**2.3 Competitor Comparison**

**Requirement:** User inputs 3-5 competitors → dashboard shows side-by-side comparison

**Acceptance Criteria:**
- User can add competitor names + websites
- Dashboard displays: User's business vs. competitors (average ranking, mention count, citation count)
- Visual chart (bar graph) comparing position over time

**Technical Notes:**
- Store competitors in `competitors` table: `competitor_name`, `competitor_website`, `business_id`
- **n8n Workflow (Triggered on Competitor Add):**
  1. Run parallel LLM queries for competitor's business name
  2. Store in `ranking_history` with `business_id = competitor_id` (treat competitors as "businesses" in DB for consistency)
- **Frontend:** Bar chart showing user's avg ranking vs. each competitor

---

#### 3. AI Agent System (Week 2, Day 1-5)

**3.1 Content Writer Agent**

**Requirement:** User requests AI-generated blog post/FAQ/service page optimized for LLM visibility

**User Flow:**
1. User clicks "Generate Article" from recommendations (or manually inputs topic)
2. Modal opens: "What topic should we write about?" (pre-filled if from recommendation)
3. User clicks "Generate" → agent executes → article delivered in 2-5 minutes
4. User can download as Markdown or HTML

**Acceptance Criteria:**
- Generates 800-1,500 word article optimized for LLM citation:
  - Clear, direct answers to topic/query in first 100 words
  - Entity mentions (business name, location, services)
  - Structured with H2/H3 headings (schema-friendly)
  - Includes FAQ section (5-7 questions)
- Output format: Markdown or HTML
- Cost: **3 credits per article**

**Technical Implementation:**

**n8n Workflow: Content Writer Agent**

```yaml
Workflow: content_writer_agent
Trigger: Webhook (POST /agents/content-writer)
Steps:
  1. Receive input:
     - topic: "Best relocation services in Tel Aviv"
     - business_context: { name, location, services }

  2. Call GPT-4 API (gpt-4o model):
     Prompt Template:
       "You are a GEO content writer specializing in LLM-optimized articles.

        Write a 1,200-word article about: [topic]

        Business Context:
        - Business Name: [business_name]
        - Location: [location]
        - Services: [services]

        Requirements:
        - Answer the query directly in the first 100 words
        - Use H2/H3 headings with clear, keyword-rich titles
        - Include entity mentions: [business_name] at least 3 times
        - Add a FAQ section with 5-7 questions
        - Use active voice, simple language
        - No marketing fluff — factual, helpful content

        Output format: Markdown"

  3. Parse GPT-4 response (markdown content)

  4. Store in generated_content table:
     - business_id, agent_type: 'content_writer'
     - input_params: { topic, business_context }
     - output_content: [markdown]
     - credits_cost: 3
     - timestamp

  5. Deduct 3 credits from user_credits table

  6. Return content to frontend
```

**API Cost Calculation:**
- GPT-4o (1,200-word output + 300-word prompt): ~1,500 tokens input + 1,500 tokens output
- Cost: $0.015/1K input tokens + $0.060/1K output tokens = $0.0225 + $0.090 = **$0.11 per article**
- **Credit Economics:** 1 credit = $0.05 (internal cost) → 3 credits = $0.15 → **margin: $0.04 per article**

---

**3.2 Competitor Research Agent**

**Requirement:** Analyze competitor's LLM visibility + content strategy

**User Flow:**
1. User selects competitor from list (or adds new competitor)
2. Clicks "Analyze Competitor"
3. Agent executes → report delivered in 2-5 minutes

**Acceptance Criteria:**
- Report includes:
  - Competitor's avg LLM ranking across tracked queries
  - Top queries where competitor ranks higher than user
  - Content themes competitor uses (extracted from LLM responses)
  - Actionable insights: "Competitor ranks well for X because they mention Y"
- Output format: Markdown report
- Cost: **2 credits per analysis**

**Technical Implementation:**

**n8n Workflow: Competitor Research Agent**

```yaml
Workflow: competitor_research_agent
Trigger: Webhook (POST /agents/competitor-research)
Steps:
  1. Receive input:
     - competitor_id

  2. Fetch competitor data from ranking_history table:
     - Avg ranking across queries
     - Queries where competitor ranks #1-3

  3. (Optional) Web scraping:
     - Use Puppeteer/Playwright to scrape competitor's homepage + key pages
     - Extract H1/H2 headings, meta descriptions, content themes

  4. Call GPT-4 for analysis:
     Prompt Template:
       "Analyze this competitor's LLM visibility strategy:

        Competitor Name: [name]
        Average LLM Ranking: [avg_ranking]
        Top Queries: [list of queries where they rank #1-3]

        Content Themes (from their website):
        [scraped headings, key phrases]

        Provide a 500-word analysis:
        - Why do they rank well?
        - What content themes do they emphasize?
        - Actionable insights for improving my rankings"

  5. Store analysis in generated_content table

  6. Deduct 2 credits from user_credits

  7. Return report to frontend
```

**API Cost:**
- GPT-4o (500-word output + 400-word prompt): ~$0.08
- (Optional) Puppeteer scraping: ~$0.02 (serverless function cost)
- **Total: $0.10 per analysis** → 2 credits = $0.10 → **margin: $0**

---

**3.3 Query Researcher Agent**

**Requirement:** Discover what questions users ask LLMs about customer's industry

**User Flow:**
1. User clicks "Discover Queries" (or auto-runs during onboarding)
2. Inputs industry vertical (or auto-detected)
3. Agent executes → list of 30-50 queries delivered in 2-5 minutes

**Acceptance Criteria:**
- Generates 30-50 query variations for industry + location
- Tests subset (10-15 queries) against LLMs to validate relevance
- Ranks queries by: Estimated volume (topic-level), relevance to user's business
- Output: List of queries with recommendations ("High priority: Write content for these 5 queries")
- Cost: **1 credit per research session**

**Technical Implementation:**

**n8n Workflow: Query Researcher Agent**

```yaml
Workflow: query_researcher_agent
Trigger: Webhook (POST /agents/query-researcher)
Steps:
  1. Receive input:
     - industry_vertical: "relocation services"
     - location: "Tel Aviv"

  2. Call GPT-4 to generate 50 query variations:
     Prompt Template:
       "Generate 50 LLM search queries that users would ask about [industry] in [location].

        Examples:
        - Who is the best relocation company in Tel Aviv?
        - How much does relocation cost in Tel Aviv?
        - Which relocation service has the best reviews?

        Output: JSON array of queries"

  3. Parse GPT-4 response → 50 queries

  4. Test subset (10-15 queries) against ChatGPT API:
     - For each query, call ChatGPT → check if query returns meaningful results
     - Rank queries by relevance (simple heuristic: query returns >3 businesses)

  5. Store top 30 queries in tracked_queries table

  6. Return prioritized list to frontend:
     [
       { query: "Best relocation in Tel Aviv", priority: "High", estimated_volume: "Medium" },
       ...
     ]

  7. Deduct 1 credit from user_credits
```

**API Cost:**
- GPT-4o (50 queries generation): ~$0.03
- ChatGPT API (10-15 test queries): ~$0.05
- **Total: $0.08** → 1 credit = $0.05 → **Loss: -$0.03 per session** (acceptable for onboarding value)

---

**3.4 Review Analysis Agent (P1 - Nice-to-Have)**

**Deferred to Week 3** if time allows. Analyzes customer's existing reviews (Google Business Profile, Yelp) to identify themes, sentiment, and content opportunities.

**Cost:** 2 credits per analysis

---

#### 4. Recommendations Engine (Week 2, Day 4-5)

**4.1 Actionable Recommendations**

**Requirement:** Dashboard displays specific, prioritized actions user should take

**Acceptance Criteria:**
- Recommendations auto-generated based on analysis of:
  - Low-ranking queries ("You rank #8 for '[query]' → Suggestion: Write article about this topic")
  - Competitor content gaps ("Competitor ranks #1 for '[query]' but you don't appear → Suggestion: Create FAQ section")
  - Citation opportunities ("Your website is mentioned in LLM responses but not cited → Suggestion: Add schema markup")
- Each recommendation includes:
  - **Action:** "Write an article about [topic]"
  - **Impact:** High/Medium/Low (based on query volume estimate)
  - **Effort:** High/Medium/Low (estimated based on action type)
  - **One-click button:** "Generate Article" → launches Content Writer Agent pre-filled with topic
- Recommendations refreshed weekly (or after agent executions)

**Technical Implementation:**

**n8n Workflow: Recommendation Generator**

```yaml
Workflow: recommendation_generator
Trigger: Cron (weekly) OR manual refresh
Steps:
  1. Fetch ranking data for business:
     - Queries where ranking = 5-10 (low ranking)
     - Queries where business is not mentioned

  2. Fetch competitor data:
     - Queries where competitor ranks #1-3 but user doesn't appear

  3. Call GPT-4 for recommendation generation:
     Prompt Template:
       "Generate 5-10 actionable recommendations to improve LLM rankings:

        Current Situation:
        - Low-ranking queries: [list]
        - Competitor content gaps: [list]
        - Citation opportunities: [list]

        For each recommendation, provide:
        - Action (specific, e.g., 'Write article about X')
        - Impact (High/Medium/Low)
        - Effort (High/Medium/Low)
        - Reasoning (why this will help)

        Output: JSON array"

  4. Parse GPT-4 response

  5. Store in recommendations table:
     - business_id, recommendation_text, impact, effort, status: 'pending'

  6. Frontend displays recommendations with "Generate Article" button
```

**User Interaction:**
- User clicks "Generate Article" on recommendation
- Frontend calls `/agents/content-writer` with pre-filled topic
- Agent executes → user reviews output → user publishes to their website

---

#### 5. Credit System & Subscription (Week 2, Day 5)

**5.1 Credit Allocation**

**Requirement:** Each subscription tier includes monthly credit allotment

**Acceptance Criteria:**
- Credits reset on subscription renewal date
- Unused credits do NOT roll over (or optional: 20% rollover cap)
- User sees remaining credits in dashboard header
- Warning shown when credits < 20%

**Technical Notes:**
- `user_credits` table: `user_id`, `credits_remaining`, `credits_total`, `reset_date`
- Decrement credits on agent execution (atomic transaction)

---

**5.2 Agent Cost Differentiation**

**Credit Costs (Based on Actual API Costs):**

| Agent | Credits | Internal Cost | Reasoning |
|-------|---------|---------------|-----------|
| **Content Writer** | 3 | $0.11 (GPT-4o) | High value, 1,200-word output |
| **Competitor Research** | 2 | $0.10 (GPT-4o + scraping) | Moderate complexity |
| **Query Researcher** | 1 | $0.08 (GPT-4o + ChatGPT tests) | Lower complexity, one-time execution |
| **Review Analysis** | 2 | $0.09 (GPT-4o sentiment analysis) | Moderate complexity |

**Credit Economics:**
- 1 credit = **$0.05 internal cost** (covers API + infrastructure)
- Margin per credit: $0-0.02 (cost recovery, not profit center)
- **Rationale:** Credits ensure usage stays within budget; profit comes from subscription, not agents

**Validation:**
- Tier 1 ($300/month) → 30 credits → $1.50 internal cost → **95% margin on subscription**
- Tier 2 ($600/month) → 100 credits → $5 internal cost → **99% margin on subscription**

---

**5.3 Subscription Tiers**

**Tier 1 - Starter ($250-300/month):**
- 30 credits/month
- 4 LLMs: ChatGPT, Claude, Perplexity, Gemini
- Weekly dashboard updates
- Basic agents: Content Writer, Query Researcher
- Email support

**Tier 2 - Pro ($500-600/month):**
- 100 credits/month
- 6 LLMs: ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews, Grok (if API available)
- Daily dashboard updates
- All agents: Content Writer, Competitor Research, Query Researcher, Review Analysis
- Bi-weekly check-ins (email/call)
- Priority support

**No Enterprise Tier in MVP** (avoid gatekeeper pricing like Profound)

**Payment Integration:**
- Stripe for subscription management
- Sync tier data to Supabase `subscriptions` table: `user_id`, `tier`, `credits_total`, `billing_cycle_start`, `status`

---

### P1 (Nice-to-Have - Week 3+)

#### 6. Advanced Dashboard Features

**6.1 Historical Trend Graphs**
- Line graph of avg ranking position over last 30/90 days
- Filterable by query, LLM, competitor

**6.2 Export & Reporting**
- PDF: Professional report with branding, graphs, summary
- CSV: Raw data export

#### 7. Notification System

**7.1 Email Alerts**
- Email triggers: Major ranking improvement (+3 positions), major drop (-3 positions), low credits warning
- User can configure notification preferences

---

## Technical Architecture (Detailed)

### System Overview

**Frontend:**
- **Framework:** Next.js 14 (App Router) with React 18
- **Styling:** Tailwind CSS + Shadcn UI components
- **State Management:** React Query (server state) + Zustand (client state)
- **Charts:** Recharts for trend visualization
- **Deployment:** Vercel (auto-deploy on git push)

**Backend:**
- **API:** Next.js API Routes (serverless functions on Vercel)
- **Alternative:** Dedicated Node.js/Express server on Railway/Render (if complexity requires)
- **Purpose:** Trigger n8n workflows, validate credits, handle auth callbacks

**Database:**
- **Primary:** Supabase (managed PostgreSQL)
- **Features Used:** Row-Level Security (RLS), Database Triggers, Real-time subscriptions
- **Schema:** See detailed schema below

**Automation Layer:**
- **Tool:** n8n (self-hosted on Railway/Render OR n8n Cloud)
- **Workflows:** Initial Analysis, Content Writer Agent, Competitor Research, Query Researcher, Recommendation Generator, Scheduled Ranking Updates
- **Integration:** Webhooks from backend → n8n workflows → LLM APIs → store results in Supabase

**External APIs:**
- **OpenAI:** ChatGPT API (gpt-4o model with search enabled)
- **Anthropic:** Claude API (claude-opus-4.5 model)
- **Perplexity:** Perplexity API
- **Google:** Gemini API
- **(Optional)** Google AI Overviews API, Grok API (if available)

**Payments:**
- **Stripe:** Subscription management (tiers, billing, webhooks for subscription events)

**Hosting & Infrastructure:**
- **Frontend:** Vercel (Next.js)
- **n8n:** Railway/Render (Docker container, 1GB RAM minimum)
- **Database:** Supabase Cloud (Free tier → Pro tier as needed)
- **Monitoring:** Sentry (error tracking), Vercel Analytics (performance)

---

### Database Schema (Detailed)

**Core Tables:**

```sql
-- users (managed by Supabase Auth)
-- Supabase provides: id, email, created_at, updated_at

-- businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  website TEXT,
  location TEXT, -- "Tel Aviv, Israel"
  industry_vertical TEXT, -- "relocation_services"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- competitors
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  competitor_website TEXT,
  added_at TIMESTAMP DEFAULT NOW()
);

-- tracked_queries
CREATE TABLE tracked_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  source TEXT CHECK (source IN ('auto-generated', 'user-added')),
  estimated_volume TEXT, -- "High" | "Medium" | "Low" (placeholder)
  created_at TIMESTAMP DEFAULT NOW()
);

-- ranking_history
CREATE TABLE ranking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  query_id UUID REFERENCES tracked_queries(id),
  llm_engine TEXT CHECK (llm_engine IN ('chatgpt', 'claude', 'perplexity', 'gemini', 'google_ai_overviews', 'grok')),
  ranking_position INTEGER, -- 1-10 or NULL (not mentioned)
  is_mentioned BOOLEAN DEFAULT FALSE,
  is_cited BOOLEAN DEFAULT FALSE, -- cited with URL
  timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_ranking_history_business_time ON ranking_history(business_id, timestamp DESC);

-- recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  recommendation_text TEXT NOT NULL,
  impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
  effort TEXT CHECK (effort IN ('high', 'medium', 'low')),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'done', 'dismissed')) DEFAULT 'pending',
  agent_type TEXT, -- 'content_writer' | 'competitor_research' | NULL
  agent_input_params JSONB, -- Pre-fill agent input if user clicks "Execute"
  created_at TIMESTAMP DEFAULT NOW()
);

-- user_credits
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits_remaining INTEGER DEFAULT 0,
  credits_total INTEGER DEFAULT 0,
  reset_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- generated_content
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  agent_type TEXT CHECK (agent_type IN ('content_writer', 'competitor_research', 'query_researcher', 'review_analysis')),
  input_params JSONB, -- { topic: "Best relocation in Tel Aviv", business_context: {...} }
  output_content TEXT, -- Markdown or HTML
  credits_cost INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_generated_content_business ON generated_content(business_id, created_at DESC);

-- subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT CHECK (tier IN ('starter', 'pro', 'enterprise')),
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due')),
  credits_total INTEGER,
  billing_cycle_start TIMESTAMP,
  billing_cycle_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Row-Level Security (RLS) Policies:**

```sql
-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only access their own data
CREATE POLICY "Users can view own businesses" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Repeat for all tables...
```

---

### API Endpoints (Backend)

**Authentication:**
- Managed by Supabase Auth (no custom endpoints needed)

**Dashboard:**
- `GET /api/dashboard/overview`
  - Query parameters: `business_id`, `date_range` ('7d' | '30d' | '90d')
  - Returns: `{ avg_ranking, mention_count, citation_count, trend }`
  - Data source: Supabase `ranking_history` table (aggregated)

- `GET /api/dashboard/competitors`
  - Query parameters: `business_id`
  - Returns: Array of competitors with their avg rankings

- `GET /api/dashboard/recommendations`
  - Query parameters: `business_id`
  - Returns: Prioritized list of recommendations

**Agents:**
- `POST /api/agents/content-writer`
  - Body: `{ topic, business_id }`
  - Validates: User has >= 3 credits
  - Triggers: n8n workflow "Content Writer Agent"
  - Returns: `{ job_id }` → frontend polls for result OR uses webhook callback

- `POST /api/agents/competitor-research`
  - Body: `{ competitor_id, business_id }`
  - Validates: User has >= 2 credits
  - Triggers: n8n workflow "Competitor Research Agent"

- `POST /api/agents/query-researcher`
  - Body: `{ industry_vertical, location, business_id }`
  - Validates: User has >= 1 credit
  - Triggers: n8n workflow "Query Researcher Agent"

**Credits:**
- `GET /api/credits/balance`
  - Query parameters: `user_id`
  - Returns: `{ credits_remaining, credits_total, reset_date }`

**Subscription:**
- `GET /api/subscription/current`
  - Returns: User's current tier, billing info
- `POST /api/subscription/webhook` (Stripe webhook)
  - Handles: `customer.subscription.created`, `customer.subscription.updated`, `invoice.paid`
  - Updates: Supabase `subscriptions` table

---

### n8n Workflows (Detailed)

**Workflow 1: Initial Analysis**

```yaml
Name: initial_analysis_workflow
Trigger: Webhook (POST from backend after user signup)
Input: { business_id, business_name, industry, location, website }
Steps:
  1. [HTTP Request Node] Fetch business data from Supabase

  2. [OpenAI Node] Generate 15-20 queries:
     Model: gpt-4o
     Prompt: "Generate 15 LLM search queries for [industry] in [location]. Output: JSON array"
     Output: ["Who is the best relocation company in Tel Aviv?", ...]

  3. [Split Into Items Node] Split queries array into individual items

  4. For each query (loop):

     4a. [OpenAI ChatGPT Node]
         Model: gpt-4o (with search enabled)
         Prompt: [query]
         Parse response: Extract businesses mentioned (regex/GPT-4 parsing)
         Check if [business_name] appears → rank position (1-10 or NULL)

     4b. [Anthropic Claude Node]
         Model: claude-opus-4.5
         Prompt: [query]
         Parse response: Extract rank position

     4c. [Perplexity API Node]
         Prompt: [query]
         Parse response: Extract rank position

     4d. [Google Gemini Node]
         Model: gemini-pro
         Prompt: [query]
         Parse response: Extract rank position

  5. [Aggregate Node] Collect all ranking results

  6. [Supabase Insert Node] Insert into ranking_history table:
     - For each query + LLM combo, insert row

  7. [Webhook Response] Return success message to backend
```

**Workflow 2: Content Writer Agent**

*(Already detailed in Section 3.1)*

**Workflow 3: Competitor Research Agent**

*(Already detailed in Section 3.2)*

**Workflow 4: Query Researcher Agent**

*(Already detailed in Section 3.3)*

**Workflow 5: Scheduled Ranking Update**

```yaml
Name: scheduled_ranking_update
Trigger: Cron (daily 2am UTC for Pro users, weekly Sunday 2am for Starter users)
Steps:
  1. [Supabase Query Node] Fetch all active users + their tracked queries

  2. [Split Into Items] For each user:

     2a. For each tracked query:
         - Call ChatGPT, Claude, Perplexity, Gemini APIs
         - Parse ranking position

     2b. [Supabase Insert] Store new ranking_history records

     2c. [Compare to Previous] Calculate trend (improved/declined/stable)

     2d. [Conditional Node] If major change (+/-3 positions):
         → Trigger email notification workflow
```

**Workflow 6: Recommendation Generator**

*(Already detailed in Section 4.1)*

---

### Security & Compliance

**Authentication:**
- Supabase Auth with JWT tokens
- All API endpoints require valid JWT (except signup/login)

**Data Privacy:**
- No PII stored beyond email, business name, website
- GDPR-compliant data deletion on account cancellation (Supabase cascade delete)

**API Rate Limiting:**
- Backend: Limit agent executions per user per day (e.g., max 20 agent runs/day)
- Implement using Redis or Upstash (serverless Redis) for rate limit counters

**Row-Level Security (RLS):**
- Supabase RLS policies ensure users can only access their own data
- No backend authorization logic needed (Supabase handles it)

**Legal Considerations:**
- Terms of Service: "We do not guarantee rankings (LLM algorithms change)"
- No fake review generation or manipulation
- Content generated by AI is "as-is" and should be reviewed before publishing

---

## Agent System & Credit Economics

### Credit Cost Breakdown (Based on Actual API Costs - February 2026)

**API Pricing (Current as of Feb 2026):**

| Provider | Model | Input Tokens | Output Tokens |
|----------|-------|--------------|---------------|
| **OpenAI** | gpt-4o | $0.015 / 1K | $0.060 / 1K |
| **Anthropic** | claude-opus-4.5 | $0.015 / 1M | $0.075 / 1M |
| **Perplexity** | pplx-sonar-pro | $0.003 / 1K | $0.015 / 1K |
| **Google** | gemini-1.5-pro | $0.00125 / 1K | $0.00375 / 1K |

**Agent Cost Calculations:**

**Content Writer Agent (3 credits):**
- GPT-4o usage: 300 tokens input (prompt) + 1,500 tokens output (article)
- Cost: (0.3 × $0.015) + (1.5 × $0.060) = $0.0045 + $0.090 = **$0.0945**
- **Rounded: $0.10 per execution**
- 3 credits = $0.15 (if 1 credit = $0.05)
- **Margin: $0.05 per execution**

**Competitor Research Agent (2 credits):**
- GPT-4o usage: 400 tokens input + 600 tokens output
- Web scraping: $0.02 (Puppeteer serverless function)
- Cost: (0.4 × $0.015) + (0.6 × $0.060) + $0.02 = $0.006 + $0.036 + $0.02 = **$0.062**
- **Rounded: $0.06 per execution**
- 2 credits = $0.10
- **Margin: $0.04 per execution**

**Query Researcher Agent (1 credit):**
- GPT-4o usage (query generation): 200 tokens input + 300 tokens output = $0.021
- ChatGPT API (10 test queries): 10 × $0.01 = $0.10
- **Total: $0.12 per execution**
- 1 credit = $0.05
- **Loss: -$0.07 per execution** (acceptable for onboarding value — users only run this 1-2 times)

### Credit Allocation by Tier

**Tier 1 - Starter ($250-300/month):**
- 30 credits/month
- Internal cost: 30 × $0.05 = $1.50
- **Margin: 98.5%** ($300 revenue - $1.50 cost = $298.50 profit before infrastructure)

**Tier 2 - Pro ($500-600/month):**
- 100 credits/month
- Internal cost: 100 × $0.05 = $5.00
- **Margin: 99.2%** ($600 revenue - $5 cost = $595 profit before infrastructure)

**Infrastructure Costs (Monthly, Estimated):**
- Vercel: $20 (Pro plan for increased bandwidth)
- Supabase: $25 (Pro plan for higher storage)
- n8n: $50 (self-hosted on Railway, 2GB RAM)
- Stripe: 2.9% + $0.30 per transaction = ~$18 on $600 revenue
- **Total: ~$113/month fixed costs**

**Break-Even Analysis:**
- 1 Pro customer ($600/month) - $5 (credits) - $113 (infrastructure) = **$482 profit/month**
- 5 Starter customers (5 × $300 = $1,500) - (5 × $1.50 credits) - $113 = **$1,379.50 profit/month**

**Scalability:**
- Infrastructure costs are largely fixed (Vercel/Supabase/n8n can handle 50-100 customers without upgrades)
- Marginal cost per new customer: **$1.50-5/month (credits only)**
- **Target:** 20 customers by end of Week 4 → $6,000-12,000/month revenue → $5,000-10,000 profit/month

---

## Development Timeline: 2-Week Sprint

### Week 1: Core Infrastructure + Dashboard

**Day 1 (Monday):**
- Set up Supabase project (database, auth, RLS policies)
- Set up Next.js frontend repo + Vercel deployment
- Set up n8n instance (Railway/Render OR n8n Cloud trial)
- **Deliverable:** Empty Next.js app deployed, Supabase connected, n8n running

**Day 2 (Tuesday):**
- Implement authentication (Supabase Auth: signup, login, logout)
- Build onboarding form (business name, website, location)
- Create database schema (run migrations in Supabase)
- **Deliverable:** User can sign up, log in, submit business info

**Day 3 (Wednesday):**
- Build n8n workflow: "Initial Analysis" (generate queries → query LLMs → store results)
- Trigger workflow on user signup (Supabase DB trigger → webhook → n8n)
- **Deliverable:** User signs up → automatic LLM analysis runs (results stored in DB)

**Day 4 (Thursday):**
- Build dashboard UI (Shadcn components: cards, charts, tables)
- Display core metrics: LLM ranking, mention count, citation count
- Implement query list display + competitor input
- **Deliverable:** Dashboard shows initial analysis results

**Day 5 (Friday):**
- Add competitor comparison (user inputs competitors → backend queries LLMs for competitors → displays side-by-side chart)
- Implement date range filters (7d, 30d, 90d)
- Polish dashboard UX (loading states, error handling)
- **Deliverable:** Functional dashboard with all core metrics

---

### Week 2: AI Agents + Recommendations + Billing

**Day 1 (Monday):**
- Build n8n workflow: "Content Writer Agent" (GPT-4o integration)
- Build backend API endpoint: `POST /api/agents/content-writer`
- Credit validation logic (check user has >= 3 credits before executing)
- **Deliverable:** User can click "Generate Article" → agent executes → article returned

**Day 2 (Tuesday):**
- Build n8n workflow: "Competitor Research Agent"
- Build n8n workflow: "Query Researcher Agent"
- Build backend endpoints for both agents
- **Deliverable:** All 3 agents functional

**Day 3 (Wednesday):**
- Build Recommendations Engine (n8n workflow: analyze rankings → generate recommendations)
- Build recommendations display UI (prioritized list with "Execute" buttons)
- One-click agent execution from recommendations
- **Deliverable:** Dashboard shows actionable recommendations with one-click execution

**Day 4 (Thursday):**
- Implement credit system (user_credits table, deduction logic)
- Build credit balance display in dashboard header
- Implement Stripe integration (subscription creation, webhook handling)
- **Deliverable:** User can subscribe, credits are allocated, deducted on agent use

**Day 5 (Friday):**
- Build scheduled ranking update workflow (n8n cron job)
- End-to-end testing with 3-5 pilot users
- Fix critical bugs
- Polish UX (loading states, error messages, empty states)
- **Deliverable:** MVP ready for pilot launch

---

### Week 3: Pilot Testing + Iteration

**Day 1-3:**
- Onboard 3-5 pilot users (free or discounted)
- Monitor usage, collect feedback
- Fix bugs, optimize agent prompts

**Day 4-5:**
- Implement high-priority feedback (e.g., better recommendation wording, faster agent execution)
- Prepare for public launch (landing page, pricing page, help docs)

**Deliverable:** MVP ready for public launch

---

## Success Metrics

### Product-Market Fit (First 6 Months)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Paying Customers** | 20-50 | Stripe active subscriptions |
| **Customer Retention** | 75%+ | Month-over-month churn <25% |
| **Average Ranking Improvement** | 30%+ see 3+ position improvement in 90 days | `ranking_history` data analysis |
| **Revenue (MRR)** | $6,000-30,000 | Stripe MRR dashboard |
| **CAC** | <$500 | Marketing spend ÷ new customers |
| **LTV** | >$3,600 (12-month avg) | ASP × avg customer lifetime |
| **NPS** | >40 | Quarterly survey |

### Product Usage (Leading Indicators)

| Metric | Target | What It Tells Us |
|--------|--------|------------------|
| **Weekly Active Users** | 60%+ of paying customers | Engagement |
| **Agent Execution Rate** | 40%+ run >= 1 agent/month | Value extraction |
| **Recommendation Completion** | 20%+ mark "Done" | Actionability of recommendations |
| **Dashboard Views** | 8-12 views/user/month | Perceived value |
| **Avg Credits Used** | 50%+ of monthly credits | Users are getting value |

### Technical Performance

| Metric | Target | Monitoring |
|--------|--------|-----------|
| **API Uptime** | 99%+ | Vercel, Supabase status |
| **Dashboard Load Time** | <2s (p95) | Vercel Speed Insights |
| **Agent Execution Time** | <5 min | n8n workflow logs |
| **LLM API Error Rate** | <5% | Backend error logs |

---

## Open Questions

### Product

1. **Pricing Finalization:**
   - Tier 1: $250 or $300/month?
   - Tier 2: $500 or $600/month?
   - Decision: Week 2, Day 4 (before Stripe setup)

2. **Agent Prioritization:**
   - If only 2 agents in MVP, which 2? (Content Writer + Query Researcher OR Content Writer + Competitor Research?)
   - Decision: Week 1, Day 5

3. **Credit Rollover:**
   - Should unused credits roll over (max 20%)? Or expire?
   - Decision: Week 2, Day 4

### Technical

4. **Backend Architecture:**
   - Next.js API routes OR dedicated Node.js server?
   - Decision: Week 1, Day 1 (recommend: Start with Next.js API routes, migrate to dedicated server if complexity requires)

5. **n8n Hosting:**
   - Self-hosted (Railway/Render) OR n8n Cloud ($50/month)?
   - Decision: Week 1, Day 1 (recommend: Self-hosted for cost savings)

6. **LLM API Rate Limits:**
   - What if OpenAI/Anthropic rate-limit us during initial analysis (60-80 API calls)?
   - Mitigation: Implement exponential backoff retry logic
   - Decision: Week 1, Day 3

7. **Real-Time Updates:**
   - For Pro tier, is hourly batch updates sufficient or true real-time needed?
   - Decision: Week 2 (recommend: Hourly is sufficient for MVP)

### Design

8. **Dashboard Complexity:**
   - How much data to show on main dashboard? (Risk: Overwhelming users like Profound)
   - Decision: Week 1, Day 4 (recommend: 3-5 core metrics only, advanced metrics in separate tabs)

9. **Agent Output Format:**
   - Editable in-platform OR just downloadable (markdown/HTML)?
   - Decision: Week 2, Day 1 (recommend: Downloadable for MVP, editable in Phase 2)

### Legal

10. **Terms of Service:**
    - Disclaimers for LLM ranking variability?
    - Decision: Week 2, Day 5 (consult legal)

11. **Review Analysis Compliance:**
    - Legal risk of scraping Google reviews?
    - Decision: Defer Review Analysis to Phase 2, research compliance first

---

## Appendix

### Competitive Differentiation Matrix

| Feature | Profound | Semrush | **Our Platform** |
|---------|----------|---------|------------------|
| **Pricing (Entry)** | $99 (ChatGPT only) | $99 (4 LLMs) | **$250-300 (4 LLMs, all features)** |
| **Pricing (Full)** | $2K-5K | $199-549 (with SEO) | **$500-600 (AI-only)** |
| **LLM Coverage** | 10+ | 4 | **4-6 (expandable)** |
| **Content Generation** | Beta (Workflows) | None | **4 AI agents built-in** |
| **Recommendations** | Generic | None | **Prescriptive + one-click execution** |
| **UX** | Complex | Medium (SEO knowledge required) | **Simple (3-5 core metrics)** |
| **Time to Value** | Weeks | Moderate | **10 minutes** |
| **Unique Tech** | CDN Agent Analytics | 239M+ prompt database | **Agent-powered "done-with-you"** |

### Sample Queries by Vertical

**Relocation Services:**
- "Who is the best relocation company in [city]?"
- "How much does relocation cost in [region]?"
- "Which relocation service has the best reviews?"

**Construction:**
- "Top construction companies in [city]"
- "Which contractor should I hire for [project type]?"
- "Best-rated construction firms in [region]"

**Insurance:**
- "Which insurance broker is best for [insurance type] in [region]?"
- "How to choose a good insurance agent"
- "Top-rated insurance companies in [city]"

**Professional Services (Accounting):**
- "Best accountant for small businesses in [city]"
- "What to look for in a tax advisor"
- "Which accounting firm has the best reviews?"

### Tech Stack Summary

| Component | Tool | Rationale |
|-----------|------|-----------|
| **Frontend** | Next.js 14 (App Router) | React-based, SEO-friendly, Vercel deployment |
| **Backend** | Next.js API Routes (serverless) | Simple for MVP, scalable to dedicated API later |
| **Database** | Supabase (PostgreSQL) | Managed Postgres, built-in auth, RLS, real-time |
| **Auth** | Supabase Auth | Free, secure, JWT-based |
| **Automation** | n8n (self-hosted OR cloud) | Visual workflow builder, LLM integrations, cost-effective |
| **LLM APIs** | OpenAI (GPT-4o), Anthropic (Claude Opus 4.5), Perplexity, Gemini | Multi-engine coverage |
| **Payments** | Stripe | Industry standard, subscription management |
| **Hosting** | Vercel (frontend), Railway/Render (n8n) | Easy deployment, auto-scaling |
| **Monitoring** | Sentry (errors), Vercel Analytics | Catch bugs, optimize performance |

---

## References

**Competitive Research:**
- [Profound Review 2026](https://getmint.ai/resources/profound-review)
- [Profound Workflows: Automating Content Operations](https://www.tryprofound.com/blog/profound-workflows-public-beta)
- [Semrush One: AI Visibility Guide](https://almcorp.com/blog/semrush-one-ai-visibility-seo-guide/)
- [Semrush AI Visibility Data Sources](https://www.semrush.com/kb/1607-semrush-ai-visibility-data)
- [Best GEO Tools 2026](https://www.alexbirkett.com/generative-engine-optimization-software/)

**Market Data:**
- Gartner: 25% drop in search engine volume by 2026 due to AI chatbots
- Brands using GEO see 43% higher citation rates in AI responses

---

**Document End**

For questions or PRD updates, contact the Product Team.