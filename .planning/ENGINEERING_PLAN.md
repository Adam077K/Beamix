# Beamix — Engineering Plan

> **The definitive technical blueprint for building Beamix.**
> Covers every system, feature, data flow, and architectural decision.
> No pricing, no timelines — pure engineering.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Phase 1 — Real Scan Engine](#2-phase-1--real-scan-engine)
3. [Phase 2 — Agent Execution System](#3-phase-2--agent-execution-system)
4. [Phase 3 — Dashboard & Data Layer](#4-phase-3--dashboard--data-layer)
5. [Phase 4 — Competitive Intelligence](#5-phase-4--competitive-intelligence)
6. [Phase 5 — Alert & Notification System](#6-phase-5--alert--notification-system)
7. [Phase 6 — Content Engine](#7-phase-6--content-engine)
8. [Phase 7 — Integration Ecosystem](#8-phase-7--integration-ecosystem)
9. [Phase 8 — AI Readiness Scoring](#9-phase-8--ai-readiness-scoring)
10. [Phase 9 — AI Crawler Detection](#10-phase-9--ai-crawler-detection)
11. [Phase 10 — Public API](#11-phase-10--public-api)
12. [Cross-Cutting Concerns](#12-cross-cutting-concerns)

---

## 1. System Overview

### 1.1 Architecture Diagram

```
                              ┌─────────────────────┐
                              │   Next.js 16 App     │
                              │   (Vercel Edge)      │
                              │                      │
                              │  ┌───────────────┐   │
                              │  │ App Router     │   │
                              │  │ (Pages + API)  │   │
                              │  └───────┬───────┘   │
                              └──────────┼───────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
            ┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
            │   Supabase    │   │   Inngest     │   │   LLM APIs    │
            │               │   │               │   │               │
            │ - PostgreSQL  │   │ - Scans       │   │ - OpenAI      │
            │ - Auth        │   │ - Agents      │   │ - Anthropic   │
            │ - RLS         │   │ - Crons       │   │ - Google AI   │
            │ - Realtime    │   │ - Alerts      │   │ - Perplexity  │
            │ - Storage     │   │ - Cleanup     │   │ - xAI (Grok)  │
            └───────────────┘   └───────────────┘   │ - DeepSeek    │
                                                    └───────────────┘
                    ┌────────────────────────────────────────┐
                    │           External Services            │
                    │                                        │
                    │  Paddle (Billing)  ·  Resend (Email)   │
                    │  Sentry (Errors)   ·  Vercel Analytics │
                    └────────────────────────────────────────┘
```

### 1.2 Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript strict | SSR + Client components |
| Styling | Tailwind CSS, Shadcn/UI | Design system |
| Database | Supabase (PostgreSQL 15+) | All persistent data |
| Auth | Supabase Auth | Session management, RLS identity |
| Background Jobs | Inngest | All long-running operations |
| Billing | Paddle | Subscriptions + one-time purchases |
| Email | Resend + React Email | Transactional + digest emails |
| AI Models | OpenAI, Anthropic, Google, Perplexity, xAI, DeepSeek | Scan engine + agent pipelines |
| Hosting | Vercel (Pro) | Edge deployment, serverless functions |
| Monitoring | Sentry + Vercel Analytics + Inngest Dashboard | Full stack observability |

### 1.3 Core Data Model

```
users (Supabase Auth)
  └── user_profiles (1:1)
  └── businesses (1:many)
        └── tracked_queries (1:many)
        └── competitors (1:many)
        └── scan_results (1:many)
        │     └── scan_engine_results (1:many)
        └── recommendations (1:many)
        └── agent_jobs (1:many)
        │     └── content_items (1:many)
        └── integrations (1:many)
  └── subscriptions (1:1)
  └── credit_pools (1:1)
        └── credit_transactions (1:many)
  └── notifications (1:many)
  └── notification_preferences (1:1)
  └── api_keys (1:many)

free_scans (no user FK — anonymous)
plans (reference table — public read)
blog_posts (CMS — public read)
```

### 1.4 Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Background jobs | Inngest (not Redis/BullMQ) | Serverless, step functions with retry, no infra to manage, observability dashboard free |
| Scan execution | Inngest background functions | Vercel 10-60s timeout too short for 30-60s scans |
| Agent execution | Inngest step functions | 2-5 min pipelines, per-step retry, concurrency control |
| Credit system | Hold → Confirm/Release pattern | Prevents double-spend during async execution |
| Data collection | API-first, browser simulation later | API is reliable + fast; Playwright deferred to engines without API |
| Response parsing | LLM-assisted (Haiku/Flash) | Business name matching is too nuanced for regex; $0.001/parse |
| Caching | React Query (client) → Next.js headers → Supabase indexes | 3-layer, no Redis until 10K+ users |
| Real-time | Polling (Phase 1) → SSE via Supabase Realtime (Phase 2) | Polling is simpler; SSE adds UX value later |
| Rate limiting | Supabase-based counter (no Redis) | Sufficient for <10K users; upgrade to Upstash later |

---

## 2. Phase 1 — Real Scan Engine

Replace the current mock PRNG scan engine with real LLM API calls.

### 2.1 Engine Adapter System

Each AI engine is an isolated adapter module in `src/lib/scan/engines/`.

```typescript
// src/lib/scan/engines/types.ts
type EngineId = 'chatgpt' | 'claude' | 'gemini' | 'perplexity' | 'grok' | 'copilot' | 'deepseek'

interface EngineAdapter {
  engine: EngineId
  method: 'api' | 'browser'
  query(prompt: string, options: QueryOptions): Promise<RawEngineResponse>
}

interface QueryOptions {
  businessName: string
  location?: string
  language: 'en' | 'he'
  timeout: number  // ms
}

interface RawEngineResponse {
  engine: EngineId
  rawText: string
  citations?: string[]
  tokensUsed?: number
  latencyMs: number
  timestamp: string
  error?: string
}
```

**Engine Access Matrix:**

| Engine | Method | API | Notes |
|--------|--------|-----|-------|
| ChatGPT | OpenAI API (gpt-4o) | Yes | Chat completions, parse for mentions |
| Claude | Anthropic API (claude-sonnet-4-5-20250929) | Yes | Messages API, structured output |
| Gemini | Google AI (gemini-2.0-flash) | Yes | Cheapest engine, use for bulk |
| Perplexity | Perplexity API (sonar-pro) | Yes | Returns citations natively |
| Grok | xAI API | Yes | Newer, less stable |
| Copilot | Browser sim (Playwright) | No | Deferred to Phase 2 |
| Google AI Overviews | Browser sim | No | Deferred to Phase 2 |
| DeepSeek | DeepSeek API | Yes | Cheapest, good for volume |

**Rate Limits (configurable per engine):**

```typescript
// src/lib/scan/engines/rate-limits.ts
interface RateLimitConfig {
  engine: EngineId
  maxRequestsPerMinute: number
  maxConcurrent: number
  cooldownOnErrorMs: number
  dailyBudgetUsd: number
}

const RATE_LIMITS: Record<EngineId, RateLimitConfig> = {
  chatgpt:    { engine: 'chatgpt',    maxRequestsPerMinute: 500,  maxConcurrent: 50,  cooldownOnErrorMs: 5000,  dailyBudgetUsd: 50 },
  claude:     { engine: 'claude',     maxRequestsPerMinute: 200,  maxConcurrent: 20,  cooldownOnErrorMs: 5000,  dailyBudgetUsd: 50 },
  gemini:     { engine: 'gemini',     maxRequestsPerMinute: 500,  maxConcurrent: 50,  cooldownOnErrorMs: 3000,  dailyBudgetUsd: 20 },
  perplexity: { engine: 'perplexity', maxRequestsPerMinute: 40,   maxConcurrent: 5,   cooldownOnErrorMs: 10000, dailyBudgetUsd: 30 },
  grok:       { engine: 'grok',       maxRequestsPerMinute: 50,   maxConcurrent: 10,  cooldownOnErrorMs: 5000,  dailyBudgetUsd: 20 },
  deepseek:   { engine: 'deepseek',   maxRequestsPerMinute: 50,   maxConcurrent: 10,  cooldownOnErrorMs: 5000,  dailyBudgetUsd: 10 },
}
```

### 2.2 Prompt Generation System

```typescript
// src/lib/scan/prompts.ts
interface PromptGenerator {
  generate(params: {
    businessName: string
    industry: string
    location: string
    services?: string[]
    competitors?: string[]
    language: 'en' | 'he'
  }): GeneratedPrompt[]
}

interface GeneratedPrompt {
  text: string
  category: 'recommendation' | 'comparison' | 'specific' | 'review' | 'authority'
  expectedMentionType: 'direct' | 'indirect' | 'comparison'
}
```

**Prompt Categories:**

| Category | Template | Example |
|----------|----------|---------|
| Direct Recommendation | "What is the best {service} in {location}?" | "What is the best insurance company in Tel Aviv?" |
| Comparison | "Compare the top {service} providers in {location}" | "Compare the top moving companies in Ramat Gan" |
| Specific Need | "I need {specific_service}. Who do you recommend in {location}?" | "I need a family lawyer. Who do you recommend in Haifa?" |
| Review-Based | "Which {service} in {location} has the best reviews?" | "Which dentist in Jerusalem has the best reviews?" |
| Authority | "Who is the leading {industry} expert in {location}?" | "Who is the leading cybersecurity expert in Israel?" |

**Prompt counts:**
- Free scan: 3 prompts (1 recommendation, 1 comparison, 1 specific)
- Scheduled scan: 5 prompts per tracked query (all categories)
- Manual scan: Same as scheduled

**Localization:**
- English: standard question phrasing
- Hebrew: colloquial Israeli patterns, location in local format (Tel Aviv-Yafo)

### 2.3 Response Parsing Pipeline

Every engine response is normalized through this pipeline:

```
RawEngineResponse
    → [1. Mention Detection]     is business name present? (fuzzy matching)
    → [2. Position Extraction]   ordinal rank (1st, 2nd, 3rd...)
    → [3. Sentiment Analysis]    positive / neutral / negative
    → [4. Citation Extraction]   URLs/sources cited
    → [5. Competitor Extraction] other businesses mentioned
    → [6. Context Window]        2-3 sentences around the mention
    → ParsedEngineResult
```

**Mention Detection** uses fuzzy matching:
1. Exact case-insensitive match
2. Domain URL match (extract domain from website_url)
3. Normalized match (strip Ltd/Inc/LLC, ignore punctuation)
4. Hebrew transliteration match (for IL businesses)

**Implementation:** LLM-assisted parsing via Claude Haiku (~$0.001/call):

```typescript
// src/lib/scan/parser.ts
interface ParsedEngineResult {
  engine: EngineId
  isMentioned: boolean
  mentionPosition: number | null
  sentiment: 'positive' | 'neutral' | 'negative' | null
  competitors: string[]
  mentionContext: string | null
  citations: string[]
}
```

### 2.4 Visibility Score Computation

```typescript
// src/lib/scan/scoring.ts
function computeVisibilityScore(engineResults: ParsedEngineResult[]): number {
  const engineCount = engineResults.length
  let totalScore = 0

  for (const result of engineResults) {
    let engineScore = 0

    if (result.isMentioned) {
      engineScore += 40  // Mention: 40 points

      // Position bonus: 1st=30, 2nd=25, 3rd=20, 4th=15, 5th=10, 6+=5
      const positionBonus = result.mentionPosition
        ? Math.max(5, 35 - (result.mentionPosition - 1) * 5)
        : 5
      engineScore += positionBonus

      // Sentiment bonus: positive=30, neutral=15, negative=0
      const sentimentBonus =
        result.sentiment === 'positive' ? 30 :
        result.sentiment === 'neutral' ? 15 : 0
      engineScore += sentimentBonus
    }
    // Max per engine: 40 + 30 + 30 = 100

    totalScore += engineScore
  }

  return Math.round(totalScore / engineCount)
}
```

### 2.5 Free Scan Flow

```
Browser                      API Route                    Inngest                    Supabase
  │                              │                            │                          │
  │── POST /api/scan/start ─────>│                            │                          │
  │                              │── Zod validate ────────────│                          │
  │                              │── Rate limit (3/IP/24hr) ──│                          │
  │                              │── Generate scan_id ────────│                          │
  │                              │────────────────────────────│───── INSERT free_scans ─>│
  │                              │── inngest.send() ─────────>│         (pending)        │
  │<── 202 { scan_id } ─────────│                            │                          │
  │                              │                            │                          │
  │                              │              ┌─────────────┘                          │
  │                              │              │ scan.free.run                          │
  │                              │              │                                        │
  │                              │              │ step 1: generate 3 prompts             │
  │                              │              │ step 2: query 4 engines (parallel)     │
  │                              │              │ step 3: parse responses (Haiku)        │
  │                              │              │ step 4: compute visibility score       │
  │                              │              │ step 5: compute AI readiness score     │
  │                              │              │ step 6: generate quick wins            │
  │                              │              │ step 7: generate leaderboard           │
  │                              │              │──────── UPDATE free_scans ────────────>│
  │                              │              │          (completed, results_data)     │
  │                              │                                                       │
  │── GET /api/scan/{id}/status >│                                                       │
  │<── { status: 'processing' } ─│                                                       │
  │  ... poll every 3s ...       │                                                       │
  │── GET /api/scan/{id}/status >│                                                       │
  │<── { status: 'completed' } ──│                                                       │
  │── GET /api/scan/{id}/results>│                                                       │
  │<── full results JSON ────────│                                                       │
```

**Rate Limiting (IP-based via Supabase):**

```typescript
async function checkFreeScanRateLimit(ip: string): Promise<boolean> {
  const { count } = await supabase
    .from('free_scans')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  return (count ?? 0) < 3
}
```

**Free Scan Results Shape:**

```typescript
interface FreeScanResults {
  visibility_score: number                 // 0-100
  engines: Array<{
    engine: EngineId
    isMentioned: boolean
    position: number | null
    sentiment: 'positive' | 'neutral' | 'negative' | null
    context: string | null
  }>
  top_competitor: string
  top_competitor_score: number
  quick_wins: Array<{ title: string; description: string; impact: 'high' | 'medium' | 'low' }>
  leaderboard: Array<{ name: string; score: number }>
  ai_readiness_score: number               // 0-100
  ai_readiness_breakdown: {
    contentQuality: CategoryScore
    technicalStructure: CategoryScore
    aiAccessibility: CategoryScore
    semanticAlignment: CategoryScore
    authoritySignals: CategoryScore
  }
}
```

### 2.6 Scheduled Scan Flow

```
Inngest Cron (daily 2AM UTC)
    │
    ▼
[1] Fetch all businesses with active subscriptions
    WHERE subscriptions.status IN ('active', 'trialing')
    AND businesses.next_scan_at <= NOW()
    │
    ▼
[2] For each business: inngest.send('scan.scheduled', { businessId, userId })
    │
    ▼
[3] scan.scheduled function:
    a. Fetch tracked_queries WHERE business_id = X AND is_active = true
    b. Determine engine list by plan tier (4 / 8 / 10+)
    c. Generate 5 prompts per tracked query
    d. Fan out: Promise.allSettled(engines.map(e => e.query(prompt)))
    e. Parse each response via Haiku
    f. Batch INSERT into scan_results + scan_engine_results
    g. Compare to previous scan
    h. If score changed > 20% OR new competitor: trigger alert
    i. Update businesses.last_scanned_at, compute next_scan_at
```

**Scan Frequency by Tier:**

| Tier | Frequency | Max Tracked Queries |
|------|-----------|---------------------|
| Starter | Weekly (every 7 days) | 10 |
| Pro | Every 3 days | 25 |
| Business | Daily | 75 |

### 2.7 Manual Scan Flow

Same as scheduled but user-triggered. Rate limits:

| Tier | Limit |
|------|-------|
| Starter | 1/week |
| Pro | 1/day |
| Business | 1/hour |

### 2.8 Inngest Function: scan.free.run

```typescript
// src/lib/inngest/functions/scan-free.ts
export const scanFreeRun = inngest.createFunction(
  {
    id: 'scan-free-run',
    concurrency: [{ scope: 'fn', limit: 50 }],
    retries: 1,
  },
  { event: 'scan/free.start' },
  async ({ event, step }) => {
    const { scanId, businessName, industry, location, websiteUrl, language } = event.data

    // Step 1: Generate prompts
    const prompts = await step.run('generate-prompts', async () => {
      return generatePrompts({ businessName, industry, location, language, count: 3 })
    })

    // Step 2: Query engines + crawl site (parallel)
    const [engineResponses, siteAnalysis] = await step.run('query-and-crawl', async () => {
      return Promise.all([
        queryEnginesParallel(FREE_ENGINES, prompts),
        crawlPage(websiteUrl),
      ])
    })

    // Step 3: Parse responses
    const parsedResults = await step.run('parse-responses', async () => {
      return parseAllResponses(engineResponses, businessName, websiteUrl)
    })

    // Step 4: Compute scores
    const results = await step.run('compute-scores', async () => {
      const visibilityScore = computeVisibilityScore(parsedResults)
      const readinessScore = computeAIReadinessScore(siteAnalysis)
      const quickWins = generateQuickWins(parsedResults, siteAnalysis)
      const leaderboard = extractLeaderboard(parsedResults)
      return { visibilityScore, readinessScore, quickWins, leaderboard, engines: parsedResults }
    })

    // Step 5: Store results
    await step.run('store-results', async () => {
      await supabaseAdmin.from('free_scans').update({
        status: 'completed',
        results_data: results,
        completed_at: new Date().toISOString(),
      }).eq('scan_id', scanId)
    })
  }
)
```

### 2.9 Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/scan/engines/types.ts` | Create | EngineAdapter interface, types |
| `src/lib/scan/engines/openai-adapter.ts` | Create | ChatGPT engine adapter |
| `src/lib/scan/engines/anthropic-adapter.ts` | Create | Claude engine adapter |
| `src/lib/scan/engines/google-adapter.ts` | Create | Gemini engine adapter |
| `src/lib/scan/engines/perplexity-adapter.ts` | Create | Perplexity engine adapter |
| `src/lib/scan/engines/rate-limits.ts` | Create | Rate limit configs |
| `src/lib/scan/engines/index.ts` | Create | Registry and factory |
| `src/lib/scan/prompts.ts` | Create | Prompt generation |
| `src/lib/scan/parser.ts` | Create | Response parsing (LLM-assisted) |
| `src/lib/scan/scoring.ts` | Create | Visibility score computation |
| `src/lib/scan/orchestrator.ts` | Create | Scan orchestration logic |
| `src/lib/inngest/client.ts` | Create | Inngest client init |
| `src/lib/inngest/functions/scan-free.ts` | Create | Free scan Inngest function |
| `src/lib/inngest/functions/scan-scheduled.ts` | Create | Scheduled scan Inngest function |
| `src/lib/inngest/functions/scan-manual.ts` | Create | Manual scan Inngest function |
| `src/app/api/inngest/route.ts` | Create | Inngest serve endpoint |
| `src/app/api/scan/start/route.ts` | Modify | Wire to Inngest instead of mock |
| `src/app/api/scan/[scanId]/status/route.ts` | Modify | Read from real free_scans |
| `src/app/api/scan/[scanId]/results/route.ts` | Modify | Read from real results_data |

---

## 3. Phase 2 — Agent Execution System

Replace mock agent outputs with real multi-LLM pipelines via Inngest.

### 3.1 Agent Architecture

All 12 agents run through a unified Inngest step function pipeline:

```
User triggers agent
    → Auth check
    → Credit HOLD (reserve 1 use)
    → Insert agent_jobs (status='pending')
    → Trigger Inngest: agent.execute
    → Return 202 { job_id }

Inngest: agent.execute
    → step 1: Assemble business context
    → step 2: Research phase (Perplexity sonar-pro)
    → step 3: Processing/Outline phase (Claude Sonnet)
    → step 4: Generation phase (Claude Sonnet)
    → step 5: Quality gate (GPT-4o, score >= 0.7)
        → PASS: Credit CONFIRM → Store output → Notify
        → FAIL: Retry once → still fail: Credit RELEASE → Mark failed
```

### 3.2 Credit Hold Pattern

```typescript
// 1. Place hold (marks credits as reserved)
await supabase.rpc('hold_credits', {
  p_user_id: userId,
  p_amount: 1,
  p_agent_job_id: executionId,
})

// 2. Run agent pipeline...

// 3a. SUCCESS: Confirm hold (converts to debit)
await supabase.rpc('confirm_credit_hold', { p_agent_job_id: executionId })

// 3b. FAILURE: Release hold (credits returned)
await supabase.rpc('release_credit_hold', { p_agent_job_id: executionId })
```

**Failure Scenarios:**

| Scenario | Action |
|----------|--------|
| LLM API timeout | Inngest retries step (1 retry). Still fails → release hold, mark failed |
| QA score < 0.6 | Retry write step with higher temp. Still low → release, mark "Low quality" |
| Supabase write error | Inngest retries. Hold remains until explicit release |
| User cancels mid-execution | DELETE /api/agents/executions/{id} → Inngest cancels → release hold |
| Insufficient credits | 402 immediately. No execution starts |

### 3.3 Cross-Agent Context Assembly

Every agent receives relevant business context. This is the "cross-agent intelligence" differentiator.

```typescript
// src/lib/agents/context.ts
async function assembleAgentContext(userId: string, businessId: string): Promise<AgentContext> {
  const [business, recentScans, recentContent, competitors, recommendations] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', businessId).single(),
    supabase.from('scan_results').select('*, scan_engine_results(*)').eq('business_id', businessId)
      .order('scanned_at', { ascending: false }).limit(3),
    supabase.from('content_items').select('title, content_format, agent_type, created_at')
      .eq('business_id', businessId).order('created_at', { ascending: false }).limit(10),
    supabase.from('competitors').select('name, domain').eq('business_id', businessId),
    supabase.from('recommendations').select('title, recommendation_type, status')
      .eq('business_id', businessId).neq('status', 'dismissed').limit(10),
  ])

  return { business, recentScans, recentContent, competitors, recommendations }
}
```

### 3.4 Agent Specifications (All 12)

#### A1: Content Writer Agent

**Purpose:** GEO-optimized website pages (landing, service, about, FAQ)

**Input:**
- Page type: Landing / Service / About / FAQ
- Topic (from recommendation or custom)
- Target queries (from tracked queries)
- Tone: Professional / Friendly / Authoritative / Conversational
- Word count: 500-3000 (default 1200)
- Include FAQ toggle (default on)
- Include schema toggle (default on)
- Language: EN / HE

**Pipeline:**

| Step | Model | Purpose | Temp | Tokens |
|------|-------|---------|------|--------|
| Research | Perplexity sonar-pro | Real-time web data, citations | 0.5 | 1,500 |
| Outline | Claude Sonnet | GEO-optimized content structure | 0.7 | 2,000 |
| Write | Claude Sonnet | Full content generation | 0.7 | 4,000 |
| QA | GPT-4o | Quality scoring, fact check | 0.3 | 1,000 |

**Output:** Title + meta description + HTML/Markdown body + FAQ section + JSON-LD schema + impact estimate

**Cross-Agent:** Receives from Recommendations (A5), Competitor Intel (A7). Feeds Content Library, Content Impact Tracking.

---

#### A2: Blog Writer Agent

**Purpose:** Long-form blog posts targeting AI-discoverable topics

**Input:**
- Title (from recommendation or custom)
- Target queries
- Length: Short (600-800) / Standard (1000-1500) / Long (1500-2500)
- Tone: Educational / Opinion / How-To / Listicle / Case Study
- Language: EN / HE

**Pipeline:**

| Step | Model | Purpose | Temp | Tokens |
|------|-------|---------|------|--------|
| Research | Perplexity sonar-pro | Latest data + trends on topic | 0.5 | 1,500 |
| Outline | Claude Sonnet | Structure + engaging hook | 0.7 | 2,000 |
| Write | Claude Sonnet | Full blog with citations | 0.7 | 4,000 |
| GEO Optimize | Claude Sonnet | Add FAQ, schema hints, citations | 0.5 | 2,000 |
| Title Options | GPT-4o | 3 title variants | 0.8 | 500 |

**Output:** 3 title options + meta description + full content + excerpt + read time + sources + tags + FAQ + BlogPosting schema

---

#### A3: Schema Optimizer Agent

**Purpose:** Generate JSON-LD structured data (the #1 GEO ranking factor)

**Pipeline:**

| Step | Model | Purpose | Temp | Tokens |
|------|-------|---------|------|--------|
| Page Fetch | cheerio | Fetch + parse target page HTML | — | — |
| Existing Schema Detection | parser | Identify current JSON-LD/microdata | — | — |
| Gap Analysis | Claude Haiku | Determine missing schema types | 0.3 | 1,500 |
| Generate | Claude Sonnet | Create JSON-LD markup | 0.3 | 3,000 |
| Validate | schema-validator | Test against Schema.org | — | — |

**Output:** Existing schema report + generated JSON-LD + implementation guide + validation results

---

#### A4: Recommendations Agent (System — 0 credits)

**Purpose:** Auto-generates prioritized action items after every scan

**Pipeline:** Claude Sonnet single-pass analysis of scan results + business context

**Output:** 5-8 prioritized recommendations ranked by impact/effort, each with: title, description, impact level, suggested agent, evidence

**Trigger:** Runs automatically after every scheduled/manual scan

**Cross-Agent:** Feeds into ALL other agents as topic/action suggestions

---

#### A5: FAQ Agent

**Purpose:** Create FAQ content matching how users query AI

**Pipeline:**

| Step | Model | Purpose | Temp | Tokens |
|------|-------|---------|------|--------|
| Extract | scan data | Identify top questions from responses | — | — |
| Generate | Claude Sonnet | Write conversational FAQ answers | 0.7 | 3,000 |

**Output:** 10-15 FAQ pairs in natural language + FAQPage schema markup

---

#### A6: Review Analyzer Agent

**Purpose:** Analyze reviews, extract sentiment, recommend response strategy

**Pipeline:**

| Step | Model | Purpose | Temp | Tokens |
|------|-------|---------|------|--------|
| Collect | Perplexity sonar-pro | Gather recent reviews (last 6 months) | 0.3 | 2,000 |
| Analyze | Claude Sonnet | Sentiment analysis, theme extraction | 0.5 | 3,000 |
| Recommend | Claude Sonnet | Response templates + improvement plan | 0.7 | 2,000 |

**Output:** Sentiment report + theme breakdown + response templates + improvement recommendations

---

#### A7: Social Strategy Agent

**Purpose:** Content calendar + ready-to-post social copy

**Pipeline:**

| Step | Model | Purpose | Temp | Tokens |
|------|-------|---------|------|--------|
| Research | Perplexity | Competitor social presence + trends | 0.5 | 1,500 |
| Strategy | Claude Sonnet | 30-day content calendar + post ideas | 0.7 | 4,000 |

**Output:** 30-day calendar + 12-15 post ideas with captions + hashtags + platform-specific formats

---

#### A8: Competitor Intelligence Agent

**Purpose:** Deep analysis of competitor's AI visibility strategy

**Pipeline:**

| Step | Model | Purpose | Temp | Tokens |
|------|-------|---------|------|--------|
| Multi-Scan | All engines | Scan LLMs for competitor mentions | — | — |
| Compare | Claude Sonnet | Competitor vs user positioning | 0.5 | 3,000 |
| Report | Claude Sonnet | Gap analysis + strategic recommendations | 0.7 | 4,000 |

**Output:** Competitive intelligence report with specific actionable insights, gap analysis, strategy recommendations

---

#### A9: Citation Builder Agent

**Purpose:** Identify high-authority sources AI cites, generate outreach templates

**Pipeline:**

| Step | Model | Purpose | Temp | Tokens |
|------|-------|---------|------|--------|
| Identify | scan data | Extract top-cited sources | — | — |
| Research | Perplexity | Find article authors + contacts | 0.3 | 2,000 |
| Template | Claude Sonnet | Generate personalized outreach emails | 0.7 | 3,000 |

**Output:** Citation targets list + personalized outreach email templates

---

#### A10: LLMS.txt Generator Agent

**Purpose:** Create/maintain llms.txt file for AI discoverability

**Pipeline:**

| Step | Model | Purpose | Temp | Tokens |
|------|-------|---------|------|--------|
| Crawl | cheerio | Website structure analysis | — | — |
| Generate | Claude Sonnet | Create structured llms.txt | 0.3 | 2,000 |

**Output:** Complete llms.txt file + deployment instructions

---

#### A11: AI Readiness Auditor Agent

**Purpose:** Comprehensive website audit with detailed AI readiness report

**Pipeline:**

| Step | Model | Purpose | Temp | Tokens |
|------|-------|---------|------|--------|
| Deep Crawl | cheerio | Up to 50 pages (BFS, depth 2) | — | — |
| Score | algorithm | 5 categories × multiple factors | — | — |
| Report | Claude Sonnet | Detailed improvement plan | 0.7 | 4,000 |

**Scoring Categories:**
- Content Quality (30%): clarity, structure, depth, FAQ presence
- Technical Structure (25%): schema, metadata, page speed, mobile
- Authority Signals (20%): backlinks, citations, expertise markers
- Semantic Alignment (15%): topic coverage, natural language, intent match
- AI Accessibility (10%): llms.txt, robots.txt, crawler-friendly architecture

**Output:** 0-100% score + per-category breakdown + prioritized improvement roadmap

---

#### A12: "Ask Beamix" Conversational Analyst

**Purpose:** Answer natural language questions about user's data

**Pipeline:** Claude Sonnet with full business context + scan history injected. Chat interface, SSE streaming.

**Output:** Natural language answers with data citations

**Credit cost:** 0 (included in Pro+ tier, no agent use deduction)

### 3.5 Inngest Function: agent.execute

```typescript
// src/lib/inngest/functions/agent-execute.ts
export const agentExecute = inngest.createFunction(
  {
    id: 'agent-execute',
    concurrency: [
      { scope: 'fn', key: 'event.data.userId', limit: 3 },  // max 3 concurrent per user
      { scope: 'fn', limit: 20 },                             // max 20 total
    ],
    retries: 1,
  },
  { event: 'agent/execute' },
  async ({ event, step }) => {
    const { executionId, agentType, userId, businessId, input } = event.data

    const context = await step.run('assemble-context', async () => {
      return assembleAgentContext(userId, businessId)
    })

    const research = await step.run('research', async () => {
      return AGENT_PIPELINES[agentType].research(input, context)
    })

    const outline = await step.run('outline', async () => {
      return AGENT_PIPELINES[agentType].outline(research, input, context)
    })

    const draft = await step.run('write', async () => {
      return AGENT_PIPELINES[agentType].write(outline, research, input, context)
    })

    const qa = await step.run('qa', async () => {
      return AGENT_PIPELINES[agentType].qa(draft, input)
    })

    await step.run('finalize', async () => {
      if (qa.score < 0.6) {
        await releaseCredits(userId, executionId)
        await updateAgentJob(executionId, 'failed', { error: 'Quality below threshold' })
        return
      }

      await confirmCredits(userId, executionId)
      await updateAgentJob(executionId, 'completed', { output: draft, qaScore: qa.score })
      if (AGENT_CONFIG[agentType].producesContent) {
        await insertContentItem(executionId, userId, businessId, draft)
      }
    })
  }
)
```

### 3.6 Agent Output Storage

| Agent produces content? | Storage |
|------------------------|---------|
| Yes (Content Writer, Blog Writer, FAQ, Social Strategy, Schema Optimizer, LLMS.txt, Citation Builder) | `content_items` table |
| No (Review Analyzer, Competitor Intel, AI Readiness Auditor, Recommendations) | `agent_jobs.output_data` (JSONB) |
| Chat (Ask Beamix) | Not stored — real-time SSE response only |

### 3.7 Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/agents/context.ts` | Create | Business context assembly |
| `src/lib/agents/pipelines/types.ts` | Create | Agent pipeline interfaces |
| `src/lib/agents/pipelines/content-writer.ts` | Create | Content Writer pipeline |
| `src/lib/agents/pipelines/blog-writer.ts` | Create | Blog Writer pipeline |
| `src/lib/agents/pipelines/schema-optimizer.ts` | Create | Schema Optimizer pipeline |
| `src/lib/agents/pipelines/recommendations.ts` | Create | Recommendations pipeline |
| `src/lib/agents/pipelines/faq.ts` | Create | FAQ Agent pipeline |
| `src/lib/agents/pipelines/review-analyzer.ts` | Create | Review Analyzer pipeline |
| `src/lib/agents/pipelines/social-strategy.ts` | Create | Social Strategy pipeline |
| `src/lib/agents/pipelines/competitor-intel.ts` | Create | Competitor Intel pipeline |
| `src/lib/agents/pipelines/citation-builder.ts` | Create | Citation Builder pipeline |
| `src/lib/agents/pipelines/llms-txt.ts` | Create | LLMS.txt Generator pipeline |
| `src/lib/agents/pipelines/ai-readiness.ts` | Create | AI Readiness Auditor pipeline |
| `src/lib/agents/pipelines/ask-beamix.ts` | Create | Ask Beamix chat pipeline |
| `src/lib/agents/credits.ts` | Create | Credit hold/confirm/release logic |
| `src/lib/inngest/functions/agent-execute.ts` | Create | Inngest agent execution function |
| `src/app/api/agents/[slug]/route.ts` | Modify | Wire to Inngest instead of mock |
| `src/app/api/agents/executions/[id]/route.ts` | Create | Execution status polling |

---

## 4. Phase 3 — Dashboard & Data Layer

Wire dashboard to real data from scan_results and agent_jobs.

### 4.1 Dashboard Widgets & Data Sources

| Widget | Query Source | Refresh Strategy | Interaction |
|--------|-------------|------------------|-------------|
| **Visibility Score Gauge** | Latest `scan_results.overall_score` | On scan complete | Click → Rankings |
| **Score Trend Chart** | `scan_results` grouped by day (Recharts) | On page load | Toggle: 7d / 30d / 90d, per-engine filter |
| **Per-Engine Grid** | `scan_engine_results` grouped by engine | On scan complete | Click engine → detail |
| **Top Recommendations** | `recommendations` (status=new, top 3) | On scan complete | Click → Run agent / Dismiss |
| **Recent Agent Activity** | `agent_jobs` (last 5) | Supabase Realtime | Click → View output |
| **Competitor Snapshot** | Latest competitor scan comparison | On scan complete | Click → Full comparison |
| **AI Readiness Score** | Latest crawl data | On scan/audit | Click → Breakdown |
| **Agent Usage Meter** | `credit_pools` (used_amount / base_allocation) | Real-time | Progress bar + upgrade CTA at limit |
| **Content Library Count** | `content_items` count | On agent complete | Click → Library |

### 4.2 Client-Side Caching (React Query)

```typescript
// Dashboard overview: stale 5 min
useQuery({
  queryKey: ['dashboard', 'overview', businessId],
  queryFn: () => fetch('/api/dashboard/overview').then(r => r.json()),
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
})

// Rankings: stale 10 min (changes on scan cycle only)
useQuery({
  queryKey: ['dashboard', 'rankings', businessId],
  queryFn: () => fetch('/api/dashboard/rankings').then(r => r.json()),
  staleTime: 10 * 60 * 1000,
})

// Agent execution: poll while running
useQuery({
  queryKey: ['agent', 'execution', executionId],
  queryFn: () => fetch(`/api/agents/executions/${executionId}`).then(r => r.json()),
  refetchInterval: isRunning ? 3000 : false,
})
```

### 4.3 Key SQL Patterns

**Score over time (trend chart):**
```sql
SELECT scanned_at::date as date, overall_score
FROM scan_results
WHERE business_id = $1
  AND scanned_at >= NOW() - $2::interval
ORDER BY scanned_at;
```

**Per-engine comparison over time:**
```sql
SELECT sr.scanned_at::date as date, ser.engine, ser.rank_position, ser.is_mentioned
FROM scan_results sr
JOIN scan_engine_results ser ON ser.scan_id = sr.id
WHERE sr.business_id = $1 AND sr.scanned_at >= NOW() - $2::interval
ORDER BY sr.scanned_at, ser.engine;
```

**Delta computation (current vs previous):**
```sql
WITH current_scan AS (
  SELECT overall_score FROM scan_results
  WHERE business_id = $1 ORDER BY scanned_at DESC LIMIT 1
),
previous_scan AS (
  SELECT overall_score FROM scan_results
  WHERE business_id = $1 ORDER BY scanned_at DESC LIMIT 1 OFFSET 1
)
SELECT
  c.overall_score as current, p.overall_score as previous,
  c.overall_score - p.overall_score as delta
FROM current_scan c, previous_scan p;
```


### 4.5 Key Views

| View | Description | Data |
|------|-------------|------|
| **Rankings** | Sortable table: query, position, engine, sentiment, change | scan_results + scan_engine_results |
| **Recommendations** | Kanban or list: New / In Progress / Completed / Dismissed | recommendations |
| **Content Library** | Grid with filters, favorites, export | content_items |
| **Agent Hub** | All 12 agents, status, last run, quick-launch | agent_jobs + agent config |
| **Competitors** | Side-by-side charts: brand vs competitors | competitor scan data |
| **AI Readiness** | 5-category breakdown with per-factor scores | site crawl + analysis |

---

## 5. Phase 4 — Competitive Intelligence

### 5.1 Competitor Tracking

| Feature | Description |
|---------|-------------|
| Add competitors by name or URL | Stored in `competitors` table |
| Auto-detected competitors | System identifies businesses mentioned near user in AI responses |
| Competitor scanning | Same queries scanned for competitors alongside user's business |
| Comparison table | Side-by-side: user vs competitor per query per engine |
| Gap analysis | Topics where competitors appear but user doesn't |
| Share of Voice | Pie chart: brand's share of AI mentions vs competitors |
| Anonymous monitoring | No notification to tracked brands |

**Tier Limits:**
- Starter: 3 competitors
- Pro: 5 competitors
- Business: 10 competitors

### 5.2 Competitor Data Flow

```
Scheduled Scan runs for user's business
    → Also queries same prompts for tracked competitors
    → Stores competitor results in scan_engine_results (with competitor's business_id)
    → Comparison computed on dashboard load
    → Gap analysis: WHERE competitor.is_mentioned = true AND user.is_mentioned = false
```

---

## 6. Phase 5 — Alert & Notification System

### 6.1 Alert Types

| Alert | Trigger | Severity | Channels |
|-------|---------|----------|----------|
| Visibility Drop | Score drops > 15% | High | Email + In-app |
| Visibility Improvement | Score improves > 15% | Medium | In-app |
| New Competitor Detected | New competitor in AI responses | Medium | In-app |
| Competitor Overtook You | Competitor surpasses user's rank | High | Email + In-app |
| Scan Complete | Scan finished | Low | In-app |
| Agent Complete | Agent execution done | Low | In-app |
| Sentiment Shift | Dominant sentiment changed | High | Email + In-app + Slack |
| Credit Low | Credits below 20% | Medium | Email |
| Trial Ending | 3 days before expiry | High | Email |

### 6.2 Alert Pipeline

```
Trigger Event (scan/agent/system)
    → Alert Rules Engine (evaluate all rules for user)
    → Check notification_preferences
    → Check deduplication (no duplicate in 24h)
    → Alert Router:
        → In-App: INSERT into notifications table
        → Email: Resend template
        → Slack: POST to webhook (if configured)
```

### 6.3 Alert Rules Engine

```typescript
interface AlertRule {
  type: AlertType
  evaluate(context: AlertContext): AlertDecision | null
}

interface AlertContext {
  currentScan: ScanResult
  previousScan: ScanResult | null
  business: Business
  userPreferences: NotificationPreferences
}

interface AlertDecision {
  type: AlertType
  severity: 'high' | 'medium' | 'low'
  title: string
  body: string
  channels: ('inapp' | 'email' | 'slack')[]
  actionUrl: string
  deduplicationKey: string
}
```

### 6.4 Notifications Table

```sql
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  severity    TEXT NOT NULL DEFAULT 'low',
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  action_url  TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

---

## 7. Phase 6 — Content Engine

### 7.1 Content Lifecycle

```
Agent generates content
    → Status: "Draft"
    → User reviews in Content Library
    → User edits inline (Markdown textarea)
    → User marks "Ready for Review" (optional)
    → User copies / downloads / publishes
    → Status: "Published"
    → Content Impact Tracking begins (correlate ranking changes)
```

### 7.2 Content Features

| Feature | Description |
|---------|-------------|
| **Content Preview** | Rendered preview: title, meta, body, FAQ, schema. Desktop/mobile toggle |
| **Inline Editor** | Markdown textarea for modifying content. Preserves formatting |
| **Copy/Download/Export** | Copy to clipboard, download as HTML/Markdown |
| **Status Tracking** | Draft → Ready for Review → Published → Archived |
| **Content Voice Training** | Learn business writing style from website + past edits (Phase 3+) |
| **Multiple Content Types** | Articles, comparisons, lists, case studies, FAQs, location pages |
| **Impact Tracking** | Track ranking changes for queries after content published |
| **WordPress Publish** | One-click publish to WordPress (Phase 3+) |

### 7.3 Content Library Query

```sql
SELECT ci.*, aj.agent_type, aj.status as job_status
FROM content_items ci
JOIN agent_jobs aj ON ci.agent_job_id = aj.id
WHERE ci.user_id = $userId
ORDER BY ci.created_at DESC
LIMIT $limit OFFSET $offset;
```

---

## 8. Phase 7 — Integration Ecosystem

### 8.1 Integration Architecture Pattern

Each integration follows:
1. OAuth2 flow (or API key)
2. Store encrypted credentials in `integrations` table
3. Integration-specific adapter class
4. Webhook receiver for real-time updates
5. Settings UI for connection management

### 8.2 Integrations Table

```sql
CREATE TABLE public.integrations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  provider     TEXT NOT NULL CHECK (provider IN ('wordpress', 'ga4', 'gsc', 'slack', 'cloudflare')),
  credentials  JSONB NOT NULL,        -- AES-256-CBC encrypted at app level
  config       JSONB DEFAULT '{}',    -- provider-specific config
  status       TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 8.3 WordPress Integration

**Method:** WordPress REST API + Application Passwords (Phase 1), custom plugin (Phase 2)

```
User clicks "Publish" on content item
    → POST /api/integrations/wordpress/publish
    → Decrypt WordPress credentials
    → POST /wp-json/wp/v2/posts { title, content, status: 'draft' }
    → Update content_items: published_url, published_at
    → User sees "Published as draft to WordPress"
```

### 8.4 GA4 Integration

**Purpose:** AI traffic attribution (AI visibility → traffic → conversions)

```typescript
const AI_REFERRAL_DOMAINS = [
  'chat.openai.com', 'chatgpt.com', 'perplexity.ai', 'gemini.google.com',
  'claude.ai', 'copilot.microsoft.com', 'grok.x.ai', 'meta.ai', 'deepseek.com',
]
```

**Flow:** OAuth2 → store refresh_token → daily Inngest cron fetches GA4 data → filter by AI referral domains → store in analytics_snapshots → dashboard shows "AI engines drove X visits"

### 8.5 Slack Integration

**Method:** Incoming Webhooks (Phase 1), full Slack app with OAuth (Phase 2)

User pastes webhook URL in Settings → alerts routed to Slack channel with formatted Block Kit messages.

### 8.6 Credential Encryption

```typescript
// AES-256-CBC for all stored integration credentials
const ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY  // 32 bytes hex
function encrypt(text: string): string { /* iv:ciphertext hex format */ }
function decrypt(text: string): string { /* reverse */ }
```

---

## 9. Phase 8 — AI Readiness Scoring

### 9.1 Scoring System

| Category | Weight | Factors |
|----------|--------|---------|
| Content Quality | 25% | Content depth (word count), FAQ presence, freshness, readability |
| Technical Structure | 25% | Schema markup, meta tags, heading hierarchy, page speed, sitemap |
| Authority Signals | 20% | Domain indicators, backlink signals, brand mentions |
| Semantic Alignment | 15% | Topic coverage vs tracked queries, conversational format |
| AI Accessibility | 15% | robots.txt allows AI bots, llms.txt present, JS rendering |

### 9.2 Website Crawl (cheerio — no Playwright)

```typescript
interface SiteAnalysis {
  url: string
  // Technical
  hasSchemaMarkup: boolean
  schemaTypes: string[]
  hasLlmsTxt: boolean
  robotsTxtBlocksAI: string[]
  pageSpeedMs: number
  hasSitemap: boolean
  // Content
  wordCount: number
  headingStructure: string[]
  hasFaqSection: boolean
  contentFreshness: Date | null
  readabilityScore: number
  // Meta
  hasMetaDescription: boolean
  hasOgTags: boolean
  title: string
  metaDescription: string
}
```

**Free scan:** Single page crawl (2-5s, runs parallel with engine queries)
**Paid (AI Readiness Auditor agent):** Up to 50 pages, BFS depth 2

### 9.3 Integration with Free Scan

AI Readiness Score is computed as part of the free scan pipeline, adding minimal latency since the crawl runs in parallel with engine queries. The score is shareable: "My business scores 34% on AI Readiness. Scan yours free at beamix.io" — viral loop.

---

## 10. Phase 9 — AI Crawler Detection

### 10.1 Known AI Bots

| Bot | User-Agent | Company |
|-----|-----------|---------|
| GPTBot | GPTBot | OpenAI |
| ChatGPT-User | ChatGPT-User | OpenAI |
| ClaudeBot | ClaudeBot | Anthropic |
| Google-Extended | Google-Extended | Google |
| PerplexityBot | PerplexityBot | Perplexity |
| Bytespider | Bytespider | ByteDance |
| Applebot-Extended | Applebot-Extended | Apple |
| cohere-ai | cohere-ai | Cohere |

### 10.2 Detection Approaches

**Phase 1: JavaScript Snippet**
User adds tracking snippet to their site. Catches JS-executing bots only (limited).

**Phase 2: Server Log Analysis**
User provides log access. Parse for AI bot User-Agent strings.

**Phase 3: Vercel/Cloudflare Integration**
Use analytics APIs to detect AI bot traffic natively.

### 10.3 Dashboard Widget: "AI Crawler Activity"

| Metric | Description |
|--------|-------------|
| Total AI Bot Visits (30d) | Sum of all AI bot page views |
| By Bot | Breakdown: GPTBot: 340, PerplexityBot: 120... |
| Top Crawled Pages | Which pages AI bots visit most |
| Crawl Trend | Line chart of daily AI bot visits |
| Pages NOT Crawled | Important pages AI bots never visit (gap) |
| robots.txt Status | Whether user blocks any AI bots |

---

## 11. Phase 10 — Public API

### 11.1 REST API (Business Tier Only)

```
Base URL: https://app.beamix.io/api/v1/
Auth: Bearer token (API key from Settings)

GET  /v1/scans                    — scan history
GET  /v1/scans/:id                — single scan + engine results
GET  /v1/rankings                 — current rankings
GET  /v1/rankings/:queryId        — query rankings over time
GET  /v1/visibility/score         — current visibility score
GET  /v1/visibility/history       — score time-series
GET  /v1/competitors              — tracked competitors
GET  /v1/content                  — content library items
POST /v1/agents/:type/execute     — trigger agent execution
GET  /v1/agents/executions/:id    — check execution status
```

### 11.2 API Key Management

```sql
CREATE TABLE public.api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash    TEXT NOT NULL,            -- SHA-256 hash
  key_prefix  TEXT NOT NULL,            -- First 8 chars (bmx_abc12345...)
  name        TEXT NOT NULL DEFAULT 'Default',
  scopes      TEXT[] DEFAULT '{read}',  -- 'read', 'write', 'execute'
  last_used_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Rate limit: 100 requests/min per API key.

---

## 12. Cross-Cutting Concerns

### 12.1 Inngest Functions Registry

| Function | Event | Concurrency | Timeout | Retries |
|----------|-------|-------------|---------|---------|
| scan.free.run | scan/free.start | 50 total | 120s | 1 |
| scan.scheduled.run | scan/scheduled.start | 20 total, 1/user | 300s | 1 |
| scan.manual.run | scan/manual.start | 10 total, 1/user | 300s | 1 |
| agent.execute | agent/execute | 20 total, 3/user | 600s | 1 |
| alert.evaluate | alert/evaluate | 50 total | 30s | 2 |
| cron.scheduled-scans | cron 0 2 * * * | 1 | 600s | 0 |
| cron.monthly-credits | cron 0 0 1 * * | 1 | 300s | 1 |
| cron.trial-nudges | cron 0 10 * * * | 1 | 120s | 1 |
| cron.weekly-digest | cron 0 8 * * 1 | 1 | 300s | 1 |
| cron.cleanup | cron 0 3 * * * | 1 | 120s | 0 |

### 12.2 Database Indexes

```sql
-- Scan performance
CREATE INDEX CONCURRENTLY idx_scan_results_biz_date
  ON scan_results(business_id, scanned_at DESC);
CREATE INDEX CONCURRENTLY idx_scan_engine_results_scan
  ON scan_engine_results(scan_id);
CREATE INDEX CONCURRENTLY idx_scan_engine_results_biz
  ON scan_engine_results(business_id, engine);

-- Agent performance
CREATE INDEX CONCURRENTLY idx_agent_jobs_user_created
  ON agent_jobs(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_content_items_user
  ON content_items(user_id, created_at DESC);

-- Alert performance
CREATE INDEX CONCURRENTLY idx_notifications_user_unread
  ON notifications(user_id) WHERE is_read = FALSE;

-- Integration lookups
CREATE INDEX CONCURRENTLY idx_integrations_user_provider
  ON integrations(user_id, provider);
```

### 12.3 RLS Policy Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| user_profiles | own | own | own | — |
| businesses | own | own | own | own |
| tracked_queries | own | own | own | own |
| scan_results | own | service | — | — |
| scan_engine_results | own (via join) | service | — | — |
| recommendations | own | service | own (status) | — |
| agent_jobs | own | service | service | — |
| content_items | own | service | own (title, is_favorited) | own |
| subscriptions | own | service | service | — |
| credit_pools | own | service | service | — |
| credit_transactions | own | service | — | — |
| competitors | own | own | own | own |
| plans | all | service | service | — |
| free_scans | — (no RLS, public) | — | — | — |
| notifications | own | service | own (is_read) | — |
| integrations | own | own | own | own |
| api_keys | own | own | — | own |
| blog_posts | all (published) | service | service | — |

### 12.4 Security Architecture

| Concern | Implementation |
|---------|---------------|
| RLS | Every table, no exceptions |
| Rate limiting | Supabase-based counter per tier (upgrade to Upstash at 10K+ users) |
| Credential encryption | AES-256-CBC for integration credentials |
| Service role | Only for scan/agent writes — client reads own data via RLS |
| GDPR | Data export endpoint, account deletion (CASCADE), 90d retention for free scans |
| Secrets | All API keys in Vercel env vars, never in code |
| API auth | API keys with SHA-256 hashing, scope-based permissions |

### 12.5 Data Retention

| Data | Retention | Reason |
|------|-----------|--------|
| free_scans | 14 days → delete | Temporary, unauthenticated |
| scan_results | 2 years | Trend data for charts |
| agent_jobs | 1 year → archive | User may reference old outputs |
| content_items | Indefinite | User's content library |
| credit_transactions | 2 years | Billing audit trail |
| notifications | 90 days | Short-lived UI data |
| rate_limit_log | 7 days | Enforcement only |

### 12.6 Scaling Strategy

| Phase | Users | Strategy |
|-------|-------|----------|
| Phase 1 | 0-1K | Single Supabase instance, Vercel Pro, Inngest free tier |
| Phase 2 | 1K-10K | Connection pooling (pgBouncer), Inngest Pro, response caching |
| Phase 3 | 10K+ | Read replicas, materialized views, partitioning on scan_results, dedicated compute |

### 12.7 Monitoring Stack

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Frontend: LCP, FID, CLS, route timing |
| Inngest Dashboard | Background jobs: success rate, duration, errors |
| Supabase Dashboard | Database: connections, query timing, storage |
| Sentry | Error tracking: unhandled exceptions, API errors |
| Custom metrics (Supabase) | Business KPIs: scans/day, agents/day, active users |

### 12.8 Health Check

```typescript
// /api/health
export async function GET() {
  const checks = await Promise.allSettled([
    supabase.from('plans').select('id').limit(1),
    fetch('https://api.inngest.com/health'),
  ])
  const allHealthy = checks.every(c => c.status === 'fulfilled')
  return NextResponse.json(
    { status: allHealthy ? 'healthy' : 'degraded', timestamp: new Date().toISOString() },
    { status: allHealthy ? 200 : 503 }
  )
}
```

### 12.9 Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Client | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Client | Supabase anon key (safe — RLS enforces) |
| SUPABASE_SERVICE_ROLE_KEY | Server | Admin Supabase access |
| OPENAI_API_KEY | Server | ChatGPT + GPT-4o |
| ANTHROPIC_API_KEY | Server | Claude API |
| GOOGLE_AI_API_KEY | Server | Gemini API |
| PERPLEXITY_API_KEY | Server | Perplexity API |
| XAI_API_KEY | Server | Grok API |
| DEEPSEEK_API_KEY | Server | DeepSeek API |
| PADDLE_API_KEY | Server | Paddle billing |
| PADDLE_WEBHOOK_SECRET | Server | Paddle webhook verification |
| RESEND_API_KEY | Server | Resend email |
| INNGEST_SIGNING_KEY | Server | Inngest function auth |
| INNGEST_EVENT_KEY | Server | Inngest event sending |
| CREDENTIALS_ENCRYPTION_KEY | Server | AES-256-CBC for integrations |
| SENTRY_DSN | Server | Error tracking |

---

> **This is the engineering blueprint. Every system, every data flow, every agent pipeline.**
> Build phases are ordered by dependency: Scan Engine → Agents → Dashboard → Intelligence → Alerts → Content → Integrations → Advanced.
> Each phase produces user-facing value independently.
