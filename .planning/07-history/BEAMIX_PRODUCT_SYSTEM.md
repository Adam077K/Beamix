> ⚠️ **ARCHIVED** — Historical reference. Current source of truth: `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md` | Archived: 2026-03-05

# Beamix — Complete Product & System Blueprint

> **Master Document** — Synthesized from 4 specialist perspectives (CPO, CTO, CFO, Research Analyst)
> **Date:** March 2026
> **Sources:** 15-competitor analysis, existing PRD, technical architecture, product specification
> **Status:** Definitive product-system reference for all build decisions

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Position & Competitive Advantage](#2-market-position--competitive-advantage)
3. [Pricing & Business Model](#3-pricing--business-model)
4. [Complete Feature Inventory](#4-complete-feature-inventory)
5. [Agent System Design](#5-agent-system-design)
6. [Technical Systems Architecture](#6-technical-systems-architecture)
7. [Dashboard & Analytics Design](#7-dashboard--analytics-design)
8. [Integration Ecosystem](#8-integration-ecosystem)
9. [Build Phases & Roadmap](#9-build-phases--roadmap)
10. [Unit Economics & Projections](#10-unit-economics--projections)
11. [Risks & Mitigations](#11-risks--mitigations)

---

## 1. Executive Summary

**Beamix** scans SMBs for AI search visibility, diagnoses why they rank (or don't), and uses AI agents to fix it. Competitors show dashboards; Beamix does the work.

### The Opportunity
The GEO (Generative Engine Optimization) market has 15+ competitors, but NONE occupy the "Low Price + High Action" quadrant. Every tool under $50 is monitoring-only. Every tool with agents costs $200+. Beamix is the only platform offering AI agents at $49/mo.

### Core Differentiators (7 Unfair Advantages)
1. **Hebrew/RTL First** — Zero competitors serve Hebrew. Monopoly on Israeli market.
2. **Agent-First Architecture** — Only agents under $100/mo in the entire market.
3. **SMB Pricing** — 2-10x cheaper than content-generating competitors.
4. **Free Scan Viral Hook** — $0.10/scan, 221-662:1 LTV:CAC ratio.
5. **Scan-to-Fix Pipeline** — End-to-end: find problems → fix problems → track improvements.
6. **Interactive Agent Chat UX** — Real-time streaming vs competitors' batch/async.
7. **Cross-Agent Intelligence** — Agents share context; competitors are siloed.

### Key Numbers
- **Pricing:** $49 / $149 / $349 (Starter / Pro / Business)
- **Break-even:** ~40 paying users (blended mix)
- **Gross margin:** 78-92% depending on tier
- **LLM costs:** Only 3.2-3.3% of revenue
- **Moderate 12-month projection:** $1.69M ARR, 1,097 users

---

## 2. Market Position & Competitive Advantage

### Market Positioning Map

```
                     CAPABILITY (Monitoring → Monitoring + Agents + Content)
                     Low ◄─────────────────────────────────────────► High
    $800+ │                                      │ Goodie($495+)
          │                     Scrunch($500)     │
    $500  │                                      │
          │ Ahrefs BR($328+)  ─ AthenaHQ($295)  │
  P       │                    Writesonic($249)  │
  R $300  │                                      │
  I       │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ Bear($200)
  C       │           Otterly($189)              │
  E $200  │  Peec(€89)                           │  ★ Beamix Pro($149)
          │  SE Visible(~$55)    Gauge($100)     │
    $100  │  Profound($99)      Scrunch($100)    │
          │                                      │
     $50  │  Airefs($24) ─ Otterly($29)         │  ★ Beamix Starter($49)
          │  RankScale($20) ─ RankPrompt($29)   │
      $0  │──────────────────────────────────────│
```

**Beamix occupies the ONLY position in "Low Price + High Action."**

### Competitor Tiers

| Tier | Competitors | Relationship |
|------|------------|-------------|
| **Tier 1 — Direct** | RankPrompt ($29), Otterly ($29-$189), RankScale ($20) | Similar price, less capability. We win on agents. |
| **Tier 2 — Aspirational** | Profound ($99-$399), Bear AI ($200), Gauge ($100-$599) | Feature-rich. We match features at lower price. |
| **Tier 3 — Adjacent** | Writesonic ($249), AthenaHQ ($295), Scrunch ($500), Goodie ($495), Ahrefs ($328+) | Enterprise/agency focused. Different market. |

### Features Enterprise-Priced Elsewhere But in Beamix Pro ($149)

| Feature | Beamix Pro ($149) | Cheapest Competitor |
|---------|-------------------|-------------------|
| AI content generation agents | 15 uses/mo | Bear AI $200/mo |
| 8+ AI engine monitoring | Yes | Writesonic $249/mo |
| Competitor analysis (5) | Yes | AthenaHQ $295/mo |
| Review sentiment analysis | Yes (agent) | Goodie $495/mo |
| Schema optimization | Yes (agent) | RankScale $99/mo (audit only) |
| Hebrew RTL | Yes | **No competitor** |

---

## 3. Pricing & Business Model

### Tier Structure: $49 / $149 / $349

| | Free | Starter ($49/mo) | Pro ($149/mo) | Business ($349/mo) |
|---|------|-----------------|---------------|-------------------|
| **Scanning** | | | | |
| AI engines | 4 (one-time) | 4 | 8 | 10+ (all) |
| Tracked queries | 0 | 10 | 25 | 75 |
| Scan frequency | One-time | Weekly | Every 3 days | Daily |
| Manual scans | 0 | 1/week | 1/day | Unlimited |
| **AI Agents** | | | | |
| Agent uses/month | 0 | 5 | 15 | 50 |
| Content Writer | - | Yes | Yes | Yes |
| Blog Writer | - | Yes | Yes | Yes |
| Schema Optimizer | - | Yes | Yes | Yes |
| Recommendations | - | Full | Full | Full |
| Review Analyzer | - | - | Yes | Yes |
| Social Strategy | - | - | Yes | Yes |
| Competitor Intel | - | - | - | Yes |
| Citation Builder | - | - | - | Yes |
| **Competitive Intel** | | | | |
| Competitors tracked | 1 (preview) | 3 | 5 | 10 |
| Competitor alerts | - | - | - | Yes |
| **Dashboard** | | | | |
| Dashboard access | Scan results only | Basic + history | Full + trends | Full + export |
| Content Library | - | Yes (50 items) | Yes (200 items) | Unlimited |
| Email reports | - | - | Weekly digest | Daily digest |
| Export (PDF/CSV) | - | - | - | Yes |
| **Integrations** | | | | |
| WordPress | - | - | Pro (future) | Yes |
| GA4/GSC | - | - | Pro (future) | Yes |
| Slack | - | - | Yes | Yes |
| API access | - | - | - | Yes (future) |
| **Support** | | | | |
| Support level | - | Email (48hr) | Priority (24hr) | Priority + onboarding |
| **Annual discount** | - | 20% ($470/yr) | 20% ($1,430/yr) | 20% ($3,350/yr) |

### Credit Economy (Simple: "Agent Uses")

No credits system — just "agent uses" per month. Each execution = 1 use regardless of agent type.

| Tier | Monthly Uses | Max Rollover (20%) | Max Available |
|------|-------------|-------------------|---------------|
| Starter | 5 | 1 | 6 |
| Pro | 15 | 3 | 18 |
| Business | 50 | 10 | 60 |

**Top-ups:** 5 extra uses = $15, 15 extra uses = $35. Priced to make tier upgrades more economical.

### Upgrade Triggers

| Transition | Primary Trigger | Secondary Triggers |
|-----------|----------------|-------------------|
| Free → Starter | "I'm invisible" shock from scan | Blurred action plan, competitor fear |
| Starter → Pro | Agent use exhaustion (5/5 used) | Engine coverage gaps, Review Analyzer locked |
| Pro → Business | Agent use exhaustion (15/15 used) | Multi-location needs, daily scanning, exports |

---

## 4. Complete Feature Inventory

### 4.1 Scan Engine (10 features)

| # | Feature | Description | Priority | Tier | Complexity |
|---|---------|-------------|----------|------|------------|
| S1 | **Free Scan** | URL + name + industry + location → 4 LLMs × 6 prompts → visibility score (0-100), per-LLM ranking, competitor callout. Shareable URL 30 days. | P0 | Free | L |
| S2 | **AI Readiness Score** | 0-100% scoring: content structure, schema, authority, semantic alignment, AI accessibility. Shown in free scan. Shareable card. | P0 | Free | L |
| S3 | **Multi-Engine Scanning** | Query 4/8/10+ AI engines based on tier. ChatGPT, Gemini, Perplexity, Claude, Grok, Copilot, Google AI Overviews, AI Mode, Meta AI, DeepSeek. | P0 | Tiered | L |
| S4 | **Scheduled Scans** | Automated scans: weekly (Starter), every 3 days (Pro), daily (Business). Background via Inngest. | P0 | Paid | L |
| S5 | **Manual Scan Trigger** | On-demand re-scan. Rate-limited per tier. | P1 | Paid | S |
| S6 | **Prompt Auto-Generation** | Auto-generate 5-8 industry/location-specific prompts per business. | P0 | All | M |
| S7 | **Sentiment Scoring** | 0-100 sentiment per engine per scan. Positive/neutral/negative classification. | P1 | Paid | M |
| S8 | **Source-Level Citation Tracking** | Show exact URLs AI cites when discussing the business. Inspired by Airefs. | P1 | Pro+ | M |
| S9 | **Historical Trend Storage** | Store all scan results for trend analysis. 30d/60d/90d/all-time. | P0 | Paid | M |
| S10 | **Scan Result Comparison** | Compare current vs previous scan with visual diff. | P2 | Paid | S |

### 4.2 Dashboard & Analytics (12 features)

| # | Feature | Description | Priority | Tier | Complexity |
|---|---------|-------------|----------|------|------------|
| D1 | **Visibility Score Card** | Central 0-100 gauge with trend arrow and delta. Color-coded. | P0 | Paid | S |
| D2 | **Per-Engine Breakdown** | Grid/cards showing score per AI engine with logos. | P0 | Paid | S |
| D3 | **Rankings Table** | Sortable table of tracked queries with position, sentiment, engine, change. | P0 | Paid | M |
| D4 | **Trend Chart** | Line chart showing visibility over time (7d/30d/90d). Per-engine toggle. | P0 | Paid | M |
| D5 | **Competitor Comparison** | Side-by-side visibility scores: your brand vs competitors. | P1 | Paid | M |
| D6 | **Recommendations Feed** | Prioritized action items: what to fix, in what order, with agent trigger. | P0 | Paid | M |
| D7 | **Content Library** | All agent-generated content: browse, filter, export, favorite, edit. | P0 | Paid | M |
| D8 | **Agent Hub** | All agents with status, last run, quick-launch. | P0 | Paid | M |
| D9 | **Share of Voice** | Pie/bar chart: brand vs competitors in AI mentions. | P1 | Pro+ | M |
| D10 | **Gap Analysis View** | Topics where brand is missing vs competitors. Inspired by Gauge. | P2 | Pro+ | L |
| D11 | **AI Readiness Dashboard** | Detailed breakdown of site's AI readiness factors with improvement tips. | P1 | Paid | M |
| D12 | **Activity Feed** | Timeline of all scans, agent runs, score changes. | P2 | Paid | S |

### 4.3 Agent System (12 agents)

| # | Agent | Purpose | Tier | Uses | Priority |
|---|-------|---------|------|------|----------|
| A1 | **Content Writer** | Writes optimized website copy, landing pages | Starter+ | 1 | P0 |
| A2 | **Blog Writer** | Creates long-form blog posts targeting AI-discoverable topics | Starter+ | 1 | P0 |
| A3 | **Schema Optimizer** | Generates JSON-LD schema markup for the website | Starter+ | 1 | P0 |
| A4 | **Recommendations** | Analyzes scan data, generates prioritized action items | Starter+ | 0 (system) | P0 |
| A5 | **FAQ Agent** | Creates conversational FAQ content from scan data | Starter+ | 1 | P1 |
| A6 | **Review Analyzer** | Analyzes reviews, extracts sentiment, recommends responses | Pro+ | 1 | P1 |
| A7 | **Social Strategy** | Creates content calendar and social post suggestions | Pro+ | 1 | P1 |
| A8 | **Competitor Intelligence** | Deep analysis of competitor's AI visibility strategy | Business | 2 | P1 |
| A9 | **Citation Builder** | Identifies cited sources, generates outreach templates. Inspired by Bear AI. | Business | 1 | P2 |
| A10 | **LLMS.txt Generator** | Creates/manages LLMS.txt for the website. Inspired by Bear AI. | Pro+ | 1 | P2 |
| A11 | **AI Readiness Auditor** | Full website audit with detailed AI readiness report. Inspired by RankScale. | Starter+ | 1 | P1 |
| A12 | **"Ask Beamix" Analyst** | Conversational AI analyst — ask questions about your data. Inspired by Gauge. | Pro+ | 0 (chat) | P2 |

### 4.4 Technical Optimization (6 features)

| # | Feature | Description | Priority | Tier |
|---|---------|-------------|----------|------|
| T1 | **Schema Markup Generation** | JSON-LD schema via Schema Optimizer agent | P0 | Starter+ |
| T2 | **LLMS.txt Management** | Generate and manage llms.txt files | P2 | Pro+ |
| T3 | **AI Readiness Scoring** | 0-100% score across 5 categories (content, technical, authority, semantic, accessibility) | P0 | Free |
| T4 | **Site Crawl Analysis** | Lightweight crawl using cheerio: schema, metadata, content structure | P1 | Starter+ |
| T5 | **AI Crawler Detection** | Detect GPTBot, ClaudeBot, etc. visits to your site | P2 | Pro+ |
| T6 | **Content Comparison** | Current content vs AI-optimized version. Inspired by RankScale. | P3 | Pro+ |

### 4.5 Alerts & Notifications (5 features)

| # | Feature | Description | Priority | Tier |
|---|---------|-------------|----------|------|
| N1 | **Visibility Drop Alert** | Notification when visibility drops >10% | P1 | Paid |
| N2 | **Competitor Alert** | New competitor detected or competitor ranking change | P2 | Business |
| N3 | **Scan Complete Notification** | Agent/scan finished processing | P1 | Paid |
| N4 | **Weekly Digest Email** | Summary of rankings, changes, recommendations | P1 | Pro+ |
| N5 | **Slack Integration Alerts** | Push alerts to Slack channel | P2 | Pro+ |

### 4.6 Integrations (7 features)

| # | Feature | Description | Priority | Tier | Phase |
|---|---------|-------------|----------|------|-------|
| I1 | **WordPress Publishing** | Publish agent content directly to WordPress | P2 | Business | Phase 3 |
| I2 | **GA4 Analytics** | AI traffic attribution, conversion tracking | P2 | Pro+ | Phase 3 |
| I3 | **Google Search Console** | Keyword data correlation with AI visibility | P3 | Pro+ | Phase 3 |
| I4 | **Slack Notifications** | Alert delivery to Slack | P2 | Pro+ | Phase 2 |
| I5 | **CDN/AI Crawler Detection** | Cloudflare/Vercel integration for bot detection | P3 | Business | Phase 3 |
| I6 | **Public API** | REST API for Business tier custom integrations | P3 | Business | Phase 4 |
| I7 | **Looker Studio Connector** | Data export to Google Looker Studio | P3 | Business | Phase 4 |

### 4.7 Admin & Settings (6 features)

| # | Feature | Description | Priority | Tier |
|---|---------|-------------|----------|------|
| U1 | **Business Profile Management** | Edit business details, industry, location, services | P0 | Paid |
| U2 | **Billing Management** | Paddle integration: upgrade, downgrade, cancel, invoices | P0 | Paid |
| U3 | **Language Preference** | Hebrew/English toggle, affects dashboard language | P0 | All |
| U4 | **Notification Preferences** | Configure alert channels and thresholds | P1 | Paid |
| U5 | **Data Export** | Download scan data, content, reports as CSV/PDF | P2 | Business |
| U6 | **Account Deletion** | GDPR-compliant account and data removal | P1 | All |

**Total: 85+ features across 7 categories**

---

## 5. Agent System Design

### 5.1 Agent Architecture Overview

All agents run through a unified pipeline:

```
User triggers agent
    → Credit hold (reserve 1 use)
    → Inngest step function launched
    → Multi-LLM pipeline executes:
        Step 1: Research (Perplexity Sonar)
        Step 2: Outline/Plan (Claude Sonnet 4.6)
        Step 3: Generate (Claude Sonnet 4.6)
        Step 4: Quality Check (GPT-4o or Haiku)
    → Quality gate (score >= 0.7)
    → Credit confirm (deduct 1 use)
    → Store output
    → Notify user
```

### 5.2 Agent Detailed Specifications

#### Content Writer Agent
- **Input:** Topic, tone preference, target word count, business context (auto-loaded)
- **Pipeline:**
  1. Research: Perplexity sonar-pro (real-time web data, citations) — temp 0.5, 1500 tokens
  2. Outline: Claude Sonnet 4.6 (structural reasoning) — temp 0.7, 2000 tokens
  3. Write: Claude Sonnet 4.6 (long-form quality) — temp 0.7, 4000 tokens
  4. QA: GPT-4o (fast validation, GEO score check) — temp 0.3, 1000 tokens
- **Output:** Markdown article with title, meta description, body, FAQ section
- **Cost:** ~$0.15-0.25 per execution
- **Cross-Agent:** Receives insights from Recommendations, feeds Content Library

#### Blog Writer Agent
- **Input:** Topic, keywords, target audience, length preference
- **Pipeline:** Same as Content Writer but with blog-specific prompts + SEO headers
- **Output:** Long-form blog post (1500-3000 words) with H2/H3 structure, FAQ, meta
- **Cost:** ~$0.18-0.30 per execution

#### Schema Optimizer Agent
- **Input:** Website URL (auto-crawled), business profile
- **Pipeline:**
  1. Crawl: cheerio-based lightweight crawl of target page
  2. Analyze: Claude Haiku 4.5 (identify missing schema types) — temp 0.3
  3. Generate: Claude Sonnet 4.6 (create JSON-LD) — temp 0.3
- **Output:** JSON-LD markup ready to paste into website
- **Cost:** ~$0.02-0.05 per execution (cheap — uses Haiku for analysis)

#### Review Analyzer Agent
- **Input:** Business name, review platform URLs (Google, Yelp, etc.)
- **Pipeline:**
  1. Research: Perplexity sonar-pro (gather recent reviews)
  2. Analyze: Claude Sonnet 4.6 (sentiment analysis, theme extraction)
  3. Recommend: Claude Sonnet 4.6 (generate response templates + improvement plan)
- **Output:** Sentiment report + response templates + improvement recommendations
- **Cost:** ~$0.08-0.15 per execution

#### Recommendations Agent (System — No Credit Cost)
- **Input:** Latest scan results, business profile, competitor data
- **Pipeline:** Claude Sonnet 4.6 single-pass analysis
- **Output:** 5-8 prioritized action items ranked by impact/effort
- **Triggers:** Auto-runs after every scheduled scan
- **Cross-Agent:** Feeds into all other agents as context

#### FAQ Agent
- **Input:** Scan data (what users ask AI about this industry), business profile
- **Pipeline:**
  1. Extract: Identify top questions from scan responses
  2. Generate: Claude Sonnet 4.6 (write conversational FAQ answers)
- **Output:** 10-15 FAQ pairs in natural language format
- **Cost:** ~$0.08-0.12 per execution

#### Social Strategy Agent
- **Input:** Business profile, industry, current social presence
- **Pipeline:**
  1. Research: Perplexity (competitor social presence)
  2. Strategy: Claude Sonnet 4.6 (content calendar + post ideas)
- **Output:** 30-day content calendar with 12-15 post ideas, captions, hashtags
- **Cost:** ~$0.20-0.35 per execution

#### Competitor Intelligence Agent
- **Input:** Competitor names/URLs, tracked queries
- **Pipeline:**
  1. Scan all LLMs for competitor mentions (parallel)
  2. Compare: Claude Sonnet 4.6 (analyze competitor vs user positioning)
  3. Report: Claude Sonnet 4.6 (gap analysis + strategic recommendations)
- **Output:** Competitive intelligence report with specific actionable insights
- **Cost:** ~$0.35-0.50 per execution (expensive — multi-LLM scanning)

#### Citation Builder Agent
- **Input:** Business profile, scan results (which sources AI cites)
- **Pipeline:**
  1. Identify: Extract top-cited sources from scan data
  2. Research: Perplexity (find article authors, publication contacts)
  3. Template: Claude Sonnet 4.6 (generate personalized outreach templates)
- **Output:** List of citation targets + outreach email templates
- **Cost:** ~$0.15-0.25 per execution
- **Inspired by:** Bear AI's PR Outreach Automation

#### LLMS.txt Generator Agent
- **Input:** Website URL, business profile
- **Pipeline:**
  1. Crawl: Website structure analysis
  2. Generate: Claude Sonnet 4.6 (create structured llms.txt)
- **Output:** Complete llms.txt file ready for deployment
- **Cost:** ~$0.05-0.10 per execution

#### AI Readiness Auditor Agent
- **Input:** Website URL
- **Pipeline:**
  1. Crawl: cheerio deep crawl (up to 50 pages)
  2. Score: 5 categories × multiple factors = 0-100% score
  3. Report: Claude Sonnet 4.6 (generate detailed improvement plan)
- **Scoring Categories:**
  - Content Quality (30%): Clarity, structure, depth, FAQ presence
  - Technical Structure (25%): Schema, metadata, page speed, mobile
  - Authority Signals (20%): Backlinks, citations, expertise markers
  - Semantic Alignment (15%): Topic coverage, natural language, intent match
  - AI Accessibility (10%): llms.txt, robots.txt, crawler-friendly architecture
- **Output:** 0-100% score + detailed breakdown + improvement roadmap
- **Cost:** ~$0.10-0.20 per execution
- **Inspired by:** RankScale's AI Readiness Score

#### "Ask Beamix" Conversational Analyst
- **Input:** Natural language question about user's dashboard data
- **Pipeline:** Claude Sonnet 4.6 with full business context + scan history injected
- **Output:** Natural language answer with data citations
- **Interaction:** Chat interface (not async) — SSE streaming
- **Cost:** ~$0.03-0.08 per question (no credit deduction — included in Pro+)
- **Inspired by:** Gauge's AI Analyst

### 5.3 Cross-Agent Intelligence

Agents share context through a unified **Business Context Assembly**:

```
Business Context (assembled per-agent execution):
├── Business Profile (name, industry, location, services)
├── Latest Scan Results (visibility scores, per-engine data)
├── Competitor Data (names, scores, gaps)
├── Recommendation History (what was suggested, what was done)
├── Content History (what agents have written, what was published)
├── Review Data (if Review Analyzer has run)
└── AI Readiness Score (if Auditor has run)
```

Every agent receives relevant context sections. The Citation Builder knows what the Content Writer wrote. The Recommendations agent knows what the Schema Optimizer generated. This eliminates the "siloed tools" problem every competitor has.

---

## 6. Technical Systems Architecture

### 6.1 Data Collection Pipeline

**Approach: Hybrid API-First (Phase 1) + Browser Simulation (Phase 2)**

| Phase | Method | Engines | Rationale |
|-------|--------|---------|-----------|
| Phase 1 (MVP) | Direct API | ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), Perplexity | Fast, reliable, structured responses |
| Phase 2 (V1) | API + Browser Simulation | Phase 1 + Grok, Copilot, Google AI Overviews, AI Mode | Some engines lack API; Playwright for those |
| Phase 3 (V2) | Full Hybrid | All 10+ engines | Complete coverage |

**Engine Adapter Interface:**
```typescript
interface EngineAdapter {
  name: string;
  type: 'api' | 'browser';
  query(prompt: string): Promise<EngineResponse>;
  parseResponse(raw: any): ParsedMention;
  rateLimits: { rpm: number; daily: number };
}
```

**Rate Limits per Engine (estimated):**
| Engine | RPM | Daily Cap | Method |
|--------|-----|-----------|--------|
| ChatGPT (OpenAI) | 500 | 10K | API |
| Claude (Anthropic) | 1000 | 50K | API |
| Gemini (Google) | 360 | 1500 | API |
| Perplexity | 40-50 | 5K | API |
| Grok | TBD | TBD | API/Browser |
| Copilot | N/A | N/A | Browser |
| Google AI Overviews | N/A | N/A | Browser |

### 6.2 Scan Engine Architecture

**Free Scan Flow (unauthenticated, ~30-60s):**
```
POST /api/scan/start
  → Zod validation
  → Rate limit check (3/IP/24hr)
  → Generate scan_id (UUID)
  → Insert free_scans (status='pending')
  → Trigger Inngest function: scan.free.execute
  → Return { scan_id, status: 'processing' }

Inngest: scan.free.execute
  → Step 1: Generate 6 industry/location prompts
  → Step 2: Query 4 engines in parallel (Promise.allSettled)
  → Step 3: Parse responses for mentions, position, sentiment (Haiku ~$0.001/call)
  → Step 4: Calculate visibility score (0-100)
  → Step 5: Calculate AI Readiness Score (lightweight cheerio crawl)
  → Step 6: Write results to free_scans.results_data (JSONB)
  → Step 7: Update status='completed'

Frontend: polls GET /api/scan/{scan_id}/status every 3s
  → When completed: render results page
```

**Scheduled Scan Flow (authenticated, background):**
```
Inngest cron: scan.scheduled (daily at 2AM UTC)
  → Fetch all active subscriptions with their tracked_queries
  → Group by user, respect tier engine limits
  → For each user batch:
    → Query engines based on tier (4/8/10+)
    → Parse responses
    → Batch insert into scan_results + scan_engine_results
    → Compare to previous scan
    → If >10% visibility change: flag for alert
  → Trigger recommendations regeneration for users with changes
```

### 6.3 Agent Execution Pipeline

**All agents run via Inngest step functions:**

```
POST /api/agents/{agent_type}
  → Auth check (getAuthenticatedUser)
  → Zod validate input
  → Check agent uses: SELECT used_amount FROM credit_pools WHERE user_id = $1
  → If insufficient: return 402
  → Credit HOLD: reserve 1 use (increment used_amount)
  → Insert agent_jobs (status='pending')
  → Trigger Inngest: agent.{type}.execute
  → Return 202 { job_id, status: 'processing' }

Inngest: agent.{type}.execute
  → Step 1: Assemble business context
  → Step 2: Research phase (Perplexity sonar-pro)
  → Step 3: Processing phase (Claude Sonnet 4.6)
  → Step 4: Generation phase (Claude Sonnet 4.6)
  → Step 5: Quality gate (score >= 0.7)
    → If pass: Credit CONFIRM (keep deduction)
    → If fail: Retry once → If still fail: Credit RELEASE (refund), mark failed
  → Step 6: Store output (content_items or agent_outputs)
  → Step 7: Update agent_jobs.status = 'completed'
  → Step 8: Send notification

Frontend: polls GET /api/agents/jobs/{job_id} every 5s
  → Phase 2: SSE streaming for real-time output
```

**Key Design Decision: Credit Hold Pattern**
- Credits deducted BEFORE execution (hold)
- Confirmed after success
- Released (refunded) on failure
- Prevents users from exhausting uses while jobs run

### 6.4 AI Readiness Scoring System

**5 Categories, 0-100% Total Score:**

| Category | Weight | Factors Checked |
|----------|--------|----------------|
| Content Quality | 30% | H1/H2 structure, word count, FAQ presence, freshness signals, natural language quality |
| Technical Structure | 25% | Schema markup (JSON-LD), meta tags, OpenGraph, canonical URLs, mobile-friendly, page speed |
| Authority Signals | 20% | External backlinks (via Perplexity research), citation mentions, expertise indicators |
| Semantic Alignment | 15% | Topic coverage vs tracked queries, keyword density, conversational format |
| AI Accessibility | 10% | llms.txt present, robots.txt allows AI bots, sitemap.xml, clean URL structure |

**Implementation:** Lightweight cheerio crawl (no Playwright needed) → 5-10 page sample → Score calculation. Fits within the 60-90s free scan window.

### 6.5 Infrastructure Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Application** | Next.js 16 (App Router) on Vercel | SSR, API routes, edge functions |
| **Database** | Supabase (PostgreSQL + Auth + RLS + Realtime) | All data, auth, real-time subscriptions |
| **Background Jobs** | Inngest | Scans, agent execution, crons, alerts |
| **Billing** | Paddle | Subscriptions, payments, webhooks |
| **Email** | Resend + React Email | Transactional + marketing emails |
| **AI Models** | OpenAI, Anthropic, Google, Perplexity (direct API) | Scan engine + agent execution |
| **Monitoring** | Sentry + Vercel Analytics | Error tracking, performance |
| **Browser Sim** | Playwright (Phase 2) | Engines without API access |

**Scaling Strategy:**
- Phase 1 (0-1K users): Single Supabase instance, Vercel Pro, Inngest free tier
- Phase 2 (1K-10K users): Supabase connection pooling, Inngest Pro, response caching
- Phase 3 (10K+): Read replicas, materialized views, dedicated compute for browser simulation

### 6.6 Security Architecture

- **RLS on every table** — even if API has a bug, data doesn't leak across users
- **Rate limiting per tier** — stored in Supabase, enforced in API middleware
- **AES-256-CBC encryption** for stored integration credentials
- **Service role only** for scan/agent writes — client can only read own data
- **GDPR compliance** — data export endpoint, account deletion, 90-day data retention for free scans
- **Secrets management** — all API keys in Vercel environment variables, never in code

---

## 7. Dashboard & Analytics Design

### 7.1 Overview Dashboard

```
┌──────────────────────────────────────────────────────────┐
│ Sidebar (Linear-style)              │ Main Content Area  │
│                                     │                    │
│ ◆ Overview                          │ ┌──────┐ ┌──────┐ │
│ ◆ Rankings                          │ │Score │ │Trend │ │
│ ◆ Recommendations                   │ │ 67   │ │ ↗+12 │ │
│ ◆ Content Library                   │ └──────┘ └──────┘ │
│ ◆ Agent Hub                         │                    │
│ ◆ Competitors                       │ ┌────────────────┐ │
│ ◆ Settings                          │ │ Per-Engine Grid │ │
│                                     │ │ GPT:72 Gem:65  │ │
│ ─────────                           │ │ Clau:58 Pplx:71│ │
│ Quick Actions:                      │ └────────────────┘ │
│ [Run Scan] [New Agent]              │                    │
│                                     │ ┌────────────────┐ │
│                                     │ │ Top 3 Recs     │ │
│                                     │ │ [Fix Schema]   │ │
│                                     │ │ [Write Blog]   │ │
│                                     │ │ [Add FAQs]     │ │
│                                     │ └────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Dashboard Widgets

| Widget | Data Source | Refresh | Interaction |
|--------|-----------|---------|-------------|
| **Visibility Score Gauge** | Latest scan_results.overall_score | On scan complete | Click → Rankings view |
| **Score Trend Chart** | scan_results over time (Recharts) | On page load | Toggle: 7d/30d/90d, per-engine filter |
| **Per-Engine Grid** | scan_engine_results grouped by engine | On scan complete | Click engine → detailed view |
| **Top Recommendations** | recommendations (status=new, top 3 by priority) | On scan complete | Click → Run agent / Dismiss |
| **Recent Agent Activity** | agent_jobs (last 5) | Real-time (Supabase Realtime) | Click → View output |
| **Competitor Snapshot** | Latest competitor scan comparison | On scan complete | Click → Full comparison |
| **AI Readiness Score** | Computed from latest crawl | On scan/audit | Click → Detailed breakdown |

### 7.3 Key Views

1. **Rankings View** — Sortable table: query, position, engine, sentiment, change, last scanned
2. **Recommendations View** — Kanban or list: New / In Progress / Completed / Dismissed
3. **Content Library** — Grid of all generated content with filters, favorites, export
4. **Agent Hub** — All 12 agents with status, last run, quick-launch buttons
5. **Competitor Comparison** — Side-by-side charts: your brand vs competitors
6. **Settings** — 4 tabs: Business Profile, Billing (Paddle), Preferences, Integrations

---

## 8. Integration Ecosystem

### Priority Ranking (by competitive necessity and revenue impact)

| # | Integration | Priority | Tier | Phase | Rationale |
|---|------------|----------|------|-------|-----------|
| 1 | **WordPress** | HIGH | Business | Phase 3 | 6/15 competitors offer it. Direct content publishing = highest value integration. |
| 2 | **GA4** | HIGH | Pro+ | Phase 3 | Connects AI visibility → traffic → conversions. Proves ROI. |
| 3 | **Slack** | MEDIUM | Pro+ | Phase 2 | Alert delivery. 3/15 competitors offer it. Low build effort. |
| 4 | **Google Search Console** | MEDIUM | Pro+ | Phase 3 | Keyword data correlation. 3/15 competitors offer it. |
| 5 | **Looker Studio** | LOW | Business | Phase 4 | Agency use case. 3/15 competitors offer it. |
| 6 | **Public API** | LOW | Business | Phase 4 | Enterprise stickiness. 3/15 competitors offer it. |
| 7 | **CDN (Cloudflare/Vercel)** | LOW | Business | Phase 3 | AI crawler detection. Defer to Phase 3. |

### Integration Architecture Pattern

Each integration follows:
```
1. OAuth2 flow (or API key for simple integrations)
2. Store encrypted credentials in integration_credentials table
3. Integration-specific adapter class
4. Webhook receiver for real-time updates
5. Settings UI for connection management
```

---

## 9. Build Phases & Roadmap

### Phase 0: Foundation (DONE)
- Next.js 16, React 19, Tailwind, Supabase auth
- Basic landing page, auth flows, dashboard shell

### Phase 1: Core Product (Current — P0 Features)
**Goal:** Real scan engine + real agents + working dashboard

| Feature | Status | Est. Effort |
|---------|--------|------------|
| Real scan engine (4 LLM APIs) | Needs rebuild (mock → real) | 2 weeks |
| AI Readiness Score in free scan | New | 1 week |
| Inngest integration for background jobs | New | 1 week |
| Real Content Writer agent | Needs rebuild (mock → real) | 1 week |
| Real Blog Writer agent | Needs rebuild | 1 week |
| Real Schema Optimizer agent | Needs rebuild | 3 days |
| Recommendations agent (auto-triggers) | Needs rebuild | 1 week |
| Dashboard with real data | Needs wiring | 1 week |
| Paddle billing (already built) | Verify + fix | 3 days |
| **Total Phase 1** | | **~8 weeks** |

### Phase 2: Competitive Parity (V1 Release)
**Goal:** Match best-of-breed monitoring features

| Feature | Est. Effort |
|---------|------------|
| Sentiment scoring (0-100 per engine) | 1-2 weeks |
| Source-level citation tracking | 1-2 weeks |
| FAQ Agent | 1 week |
| Review Analyzer Agent | 1 week |
| Social Strategy Agent | 1 week |
| Scheduled scans (Inngest cron) | 1 week |
| Visibility drop alerts (email) | 1 week |
| Weekly digest email | 3 days |
| Slack integration | 1 week |
| "Ask Beamix" chat (basic) | 2 weeks |
| **Total Phase 2** | **~10-12 weeks** |

### Phase 3: Differentiation (V2)
**Goal:** Features that make Beamix unique

| Feature | Est. Effort |
|---------|------------|
| Competitor Intelligence agent | 2 weeks |
| Citation Builder agent | 2 weeks |
| LLMS.txt Generator agent | 3-5 days |
| AI Readiness Auditor agent (full) | 2 weeks |
| WordPress integration | 2-3 weeks |
| GA4 integration | 2-3 weeks |
| Browser simulation for 4+ engines | 2-3 weeks |
| Content voice training | 2 weeks |
| 6+ content types (comparisons, lists, case studies, FAQs, location pages, deep-dives) | 3-4 weeks |
| **Total Phase 3** | **~16-20 weeks** |

### Phase 4: Scale & Enterprise (V3)
**Goal:** Enterprise features and market expansion

| Feature | Est. Effort |
|---------|------------|
| Public API (Business tier) | 3-4 weeks |
| Multi-brand management | 2-3 weeks |
| White-label reports | 2 weeks |
| Looker Studio connector | 2 weeks |
| Google Search Console integration | 2 weeks |
| CDN-based AI crawler detection | 2-3 weeks |
| Persona-based tracking | 2 weeks |
| Customer journey stage mapping | 2 weeks |
| Revenue attribution (GA4 deep integration) | 3-4 weeks |
| **Total Phase 4** | **~20-24 weeks** |

---

## 10. Unit Economics & Projections

### Cost Per Operation

| Operation | LLM Cost | Infra Cost | Total |
|-----------|---------|-----------|-------|
| Free scan (4 engines × 6 prompts) | $0.096 | $0.004 | ~$0.10 |
| Scheduled scan (per user, per scan cycle) | Varies by tier | Included | $0.48-$90/mo |
| Agent execution (blended average) | $0.15-0.25 | $0.02 | ~$0.20 |
| Response parsing (Haiku) | $0.001/call | — | Negligible |

### Contribution Margin Per Tier

| Metric | Starter ($49) | Pro ($149) | Business ($349) |
|--------|--------------|-----------|-----------------|
| Revenue | $49.00 | $149.00 | $349.00 |
| Scan costs | $0.64 | $8.00 | $90.00* |
| Agent costs | $0.60 | $2.10 | $7.50 |
| Paddle fees (5%) | $2.45 | $7.45 | $17.45 |
| **Contribution margin** | **$45.31 (92.5%)** | **$131.45 (88.2%)** | **$224.05 (64.2%)** |

*Business tier scan costs mitigable to $45-70/mo with caching + cheaper models for parsing.

### 12-Month Moderate Projection

| Metric | Month 6 | Month 12 |
|--------|---------|----------|
| Total paid users | 291 | 1,097 |
| MRR | $37,456 | $141,190 |
| ARR (projected) | $449K | $1.69M |
| LLM costs (% of revenue) | 3.3% | 3.3% |
| Gross margin | ~88% | ~90% |

### Key SaaS Metrics (Month 12, Moderate)

| Metric | Value | Benchmark |
|--------|-------|-----------|
| LTV (12mo) | $1,105 | — |
| CAC (free scan) | ~$3 | — |
| LTV:CAC | 368:1 | ≥ 3:1 |
| Gross margin | 90.2% | > 70% |
| Payback period | < 1 month | < 12 months |
| Break-even | ~40 users | — |

---

## 11. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Business tier scan costs** ($67-112/mo per user) | Medium | Cache results within 24hr windows, use Haiku for parsing, batch queries |
| **Profound moves down-market** | High | Speed advantage: ship agent features before they can re-price. Lock in Hebrew market. |
| **LLM API price increases** | Low | Multi-provider strategy, 90%+ margin buffer, model-agnostic adapter layer |
| **AI engine API changes/blocks** | Medium | Browser simulation fallback, adapter pattern allows quick engine swaps |
| **Conversion rate uncertainty** | High | Launch free scan ASAP to get real data. All projections are estimates. |
| **Churn may be higher than 4.5%** | Medium | Build engagement loops: weekly digests, score change alerts, content calendar |
| **Free scan abuse (bots)** | Medium | Rate limiting (3/IP/24hr), CAPTCHA after first scan, fingerprinting |
| **New YC competitors enter** | Medium | 3-6 month head start on Hebrew market + agent-first architecture |

---

## Appendix: Source Documents

| Document | Author | Contents |
|----------|--------|----------|
| `_CPO_ANALYSIS.md` | Morgan (CPO) | 85+ features, 12 agents, RICE scores, dashboard wireframes |
| `_CTO_ANALYSIS.md` | Atlas (CTO) | 10-section technical architecture, data pipelines, security |
| `_CFO_ANALYSIS.md` | Axiom (CFO) | Pricing, unit economics, 12-month projections |
| `_RESEARCH_SYNTHESIS.md` | Rex (Research) | Competitive synthesis, gap matrix, positioning map |
| `COMPETITIVE_FEATURES_BLUEPRINT.md` | Research | 15 competitors, feature matrix, innovations |

---

> **This document is the definitive product-system reference for Beamix.**
> All build decisions, feature prioritization, and architecture choices should reference this document.
> Last updated: March 2026
