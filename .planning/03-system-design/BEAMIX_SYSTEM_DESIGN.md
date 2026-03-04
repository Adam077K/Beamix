# Beamix System Design — Master Document

> **Version:** 2.0
> **Date:** March 4, 2026
> **Authors:** Morgan (CPO), Atlas (CTO), Sage (AI Engineer), Rex (Research Analyst)
> **Replaces:** `ENGINEERING_PLAN.md` (v1.0)
> **Status:** All competitive gaps from CTO Gap Analysis are CLOSED.

---

## How to Read This Document

This system design is organized into four layers, each in its own detailed document. This master document provides the executive overview, cross-layer connections, and serves as the single entry point.

| Layer | Document | Author | Scope |
|-------|----------|--------|-------|
| **Product** | `_SYSTEM_DESIGN_PRODUCT_LAYER.md` | Morgan (CPO) | Every page, feature, user journey, agent UX |
| **Architecture** | `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` | Atlas (CTO) | Database (32 tables), APIs, data flow, security, infrastructure |
| **Intelligence** | `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` | Sage (AI Engineer) | LLM pipelines, 16 agents, scan engine, data intelligence |
| **Validation** | `_SYSTEM_DESIGN_VALIDATION.md` | Rex (Research) | Gap closure checklist, competitive parity, priority classification |

---

## 1. What Beamix Is

Beamix is a Generative Engine Optimization (GEO) platform for SMBs. It scans businesses across AI search engines (ChatGPT, Gemini, Perplexity, Claude, Grok, DeepSeek, and more), diagnoses why they rank or don't, and deploys AI agents to autonomously fix it.

**Competitors show dashboards. Beamix does the work.**

The platform operates as a closed-loop:

```
Scan (find problems) → Diagnose (prioritize) → Fix (agents execute) → Measure (track impact) → Repeat
```

### Seven Structural Advantages

1. **Hebrew/RTL first** — Zero competitors serve Hebrew. Monopoly on Israeli market.
2. **Agent-first architecture** — Only autonomous agents under $100/month in the market.
3. **Closed-loop system** — Scan → fix → measure in one platform (competitors break this loop).
4. **Cross-model QA** — GPT-4o reviews Claude's output. No single-model blind spots.
5. **Inngest-native** — Background jobs with retry, concurrency, observability built-in.
6. **Event-driven workflows** — Automated multi-agent chains (visibility drop → auto-fix).
7. **Progressive voice learning** — Content improves with every user edit.

---

## 2. Platform at a Glance

### 2.1 Page Map (23 Pages)

| Page | URL | Purpose |
|------|-----|---------|
| Landing | `/` | Conversion page: hero, social proof, features, pricing, CTA |
| Free Scan | `/scan` | Anonymous 60-second AI visibility scan |
| Scan Results | `/scan/[scanId]` | Public shareable results with signup CTA |
| Login | `/login` | Supabase Auth login |
| Signup | `/signup` | Registration with optional `?scan_id=` import |
| Forgot Password | `/forgot-password` | Password reset flow |
| Onboarding | `/onboarding` | 4-step setup: business → queries → competitors → ready |
| Dashboard Overview | `/dashboard` | Visibility score gauge, trend chart, recommendations, activity feed |
| Rankings | `/dashboard/rankings` | Per-query, per-engine visibility table with filters |
| Recommendations | `/dashboard/recommendations` | AI-generated action items with "Fix with Agent" buttons |
| Content Library | `/dashboard/content` | All generated content, filterable, with performance tracking |
| Content Editor | `/dashboard/content/[id]` | Markdown editor with preview, version history, publish-to-CMS |
| Agent Hub | `/dashboard/agents` | All 16 agents, run history, workflow setup |
| Agent Chat | `/dashboard/agents/[agentType]` | Agent execution UI with real-time step progress |
| Competitive Intelligence | `/dashboard/competitors` | Share of voice, gap analysis, competitor profiles |
| AI Readiness | `/dashboard/ai-readiness` | Website audit score with improvement roadmap |
| Settings | `/dashboard/settings` | Business profile, billing, preferences, integrations (4 tabs) |
| Pricing | `/pricing` | Plan comparison with feature matrix and FAQ |
| Blog | `/blog` | SEO content marketing |
| About | `/about` | Company story |
| Terms | `/terms` | Terms of service |
| Privacy | `/privacy` | Privacy policy |
| API Docs | `/docs/api` | REST API documentation (Business tier) |

> Full page specifications (layout, components, data flows, connections) → `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2

### 2.2 Feature Count Summary

| Module | Features | Key Capabilities |
|--------|----------|-----------------|
| Scan Engine | 12 | 10 AI engines, prompt generation, LLM parsing, scoring, scheduling |
| Dashboard & Analytics | 14 | Visibility gauge, trends, rankings, content performance, brand narrative |
| Agent System | 16 agents | Content, schema, FAQ, citations, voice training, patterns, refresh, narrative |
| Content Engine | 10 | Library, editor, versioning, 12 content types, voice profiles, CMS publish |
| Competitive Intelligence | 6 | Share of voice, gap analysis, competitor monitoring, anonymous tracking |
| Alert System | 9 types | Visibility, sentiment, competitor, credit, content performance alerts |
| Integration Hub | 7 | WordPress, GA4, GSC, Slack, Cloudflare, Paddle, API keys |
| AI Readiness | 6 | Website audit, 5-category scoring, improvement roadmap, progress tracking |
| Settings | 6 | Business profile, billing portal, preferences, language, integrations |
| Billing | 5 | Paddle checkout, subscription management, credit system, usage tracking |
| **Total** | **90+** | |

> Full feature inventory with descriptions → `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §3

---

## 3. Agent System (16 Agents)

The agent system is Beamix's core differentiator. Each agent is a multi-stage LLM pipeline.

| # | Agent | Purpose | LLM Pipeline | Credits |
|---|-------|---------|-------------|---------|
| A1 | Content Writer | GEO-optimized website pages | Perplexity → Sonnet → Sonnet → GPT-4o QA | 1 |
| A2 | Blog Writer | Long-form blog posts for citation | Perplexity → Sonnet → Sonnet → Sonnet → GPT-4o | 1 |
| A3 | Schema Optimizer | JSON-LD structured data | cheerio → Haiku → Sonnet → validator | 1 |
| A4 | Recommendations | Prioritized action items (auto after scan) | Sonnet (single-pass analysis) | 0 (system) |
| A5 | FAQ Agent | FAQ content matching AI queries | Haiku → Sonnet → Haiku (schema) | 1 |
| A6 | Review Analyzer | Reputation analysis + response templates | Perplexity → Sonnet → Sonnet | 1 |
| A7 | Social Strategy | 30-day social content calendar | Perplexity → Sonnet | 1 |
| A8 | Competitor Intelligence | Deep competitive analysis + action items | Multi-engine scan → Sonnet → Sonnet | 1 |
| A9 | Citation Builder | Outreach templates for citation sources | Haiku → Perplexity → Sonnet | 1 |
| A10 | LLMS.txt Generator | AI-readable site description file | cheerio → Sonnet | 1 |
| A11 | AI Readiness Auditor | Comprehensive website AI audit | cheerio → algorithmic → Sonnet | 1 |
| A12 | Ask Beamix | Conversational data analyst (streaming) | Sonnet (SSE streaming) | 0 (Pro+) |
| **A13** | **Content Voice Trainer** | **Learn business's writing voice** | **cheerio → Opus → Sonnet verify** | **1** |
| **A14** | **Content Pattern Analyzer** | **What makes cited content succeed** | **cheerio → Sonnet → Sonnet** | **1** |
| **A15** | **Content Refresh Agent** | **Audit + update stale content** | **Haiku → Perplexity → Sonnet** | **1** |
| **A16** | **Brand Narrative Analyst** | **WHY AI says what it says** | **Opus → Sonnet → Sonnet** | **1** |

Agents A13-A16 are NEW — they close all competitive gaps identified in the CTO Gap Analysis.

### Agent Workflow Chains (Event-Triggered Automation)

| Workflow | Trigger | Chain |
|----------|---------|-------|
| Visibility Drop Response | Score drops >15% | A4 → A8 → A1 → Notify |
| New Business Onboarding | Onboarding complete | A13 → A14 → A11 → A4 → Notify |
| Content Lifecycle | Content published | Schedule A15 (30d) → Correlate scans → Notify impact |
| Competitor Alert Response | Competitor overtakes | A8 → A4 → Notify |

> Full agent pipeline specs → `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §3
> Agent UX and user flows → `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §5

---

## 4. System Architecture Summary

### 4.1 Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | Next.js 16, React 19, TypeScript strict | SSR, client interactivity |
| Styling | Tailwind CSS, Shadcn/UI | Design system |
| Auth | Supabase Auth | Session management, JWT |
| Database | Supabase PostgreSQL + RLS | All persistence |
| Real-time | Supabase Realtime | WebSocket for live updates |
| Background Jobs | Inngest | Scans, agents, crons, workflows |
| Billing | Paddle | Subscriptions, webhooks |
| Email | Resend + React Email | Transactional + marketing |
| Hosting | Vercel | Serverless deployment |
| LLMs | OpenAI, Anthropic, Google, Perplexity, xAI, DeepSeek | Scan + agent intelligence |

### 4.2 Database (32 Tables)

| Category | Tables | Key Design Decisions |
|----------|--------|---------------------|
| Core Identity (4) | user_profiles, businesses, plans, subscriptions | One subscription per user, trigger-created profiles |
| Billing (2) | credit_pools, credit_transactions | Hold/confirm/release pattern, 20% rollover cap |
| Scan (4) | free_scans, scans, scan_engine_results, citation_sources | Sentiment as 0-100 integer (not enum), dedicated citation tracking |
| Agent/Content (6) | agent_jobs, agent_job_steps, content_items, content_versions, content_performance, content_voice_profiles | 12 content types, editorial review queue, voice profiles |
| Intelligence (8) | competitors, competitor_scans, recommendations, tracked_queries, prompt_library, prompt_volumes, personas, brand_narratives | Prompt volume estimation, persona-based tracking |
| Workflow (2) | agent_workflows, workflow_runs | Event-triggered multi-agent chains |
| Alerts (3) | alert_rules, notifications, notification_preferences | 9 alert types, 3 channels, cooldown dedup |
| Platform (3) | integrations, api_keys, blog_posts | AES-256-GCM credential encryption |

RLS is enabled on every table. Service role key used only in Inngest functions and webhook handlers.

> Full schema with columns, types, indexes, RLS policies → `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2

### 4.3 API Routes

| Route Group | Routes | Auth | Purpose |
|-------------|--------|------|---------|
| `/api/scan/*` | 5 | Mixed | Free scan, manual scan, status, results, history |
| `/api/agents/*` | 5 | Required | Execute, status, cancel, history, chat |
| `/api/content/*` | 6 | Required | CRUD, publish to CMS, performance data |
| `/api/dashboard/*` | 5 | Required | Overview, rankings, trends, competitors, recommendations |
| `/api/settings/*` | 4 | Required | Business profile, preferences, notifications |
| `/api/billing/*` | 3 | Required | Status, portal link, Paddle webhooks |
| `/api/integrations/*` | 4 | Required | CRUD for WordPress, GA4, GSC, Slack |
| `/api/alerts/*` | 3 | Required | Alert rules CRUD, notification list, mark read |
| `/api/competitors/*` | 3 | Required | CRUD, comparison data |
| `/api/workflows/*` | 4 | Required | CRUD, trigger, run history |
| `/api/analytics/*` | 3 | Required | Prompt volumes, citation sources, brand narrative |
| `/api/v1/*` | 12 | API key | Public REST API (Business tier) |
| `/api/onboarding/*` | 1 | Required | Complete onboarding |
| `/api/inngest` | 1 | Inngest key | Inngest serve endpoint |

> Full route specs with validation, rate limits, response shapes → `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §3

### 4.4 Background Jobs (15 Inngest Functions)

| Function | Trigger | Duration | Concurrency |
|----------|---------|----------|-------------|
| `scan/free` | Event | 30-60s | 20 system |
| `scan/scheduled` | Cron (per tier) | 60-120s | 50 system |
| `scan/manual` | Event | 60-120s | 10 system |
| `agent/execute` | Event | 60-300s | 3 per user, 20 system |
| `agent/ask-beamix` | Event (streaming) | 5-15s | 5 per user |
| `workflow/execute` | Event | 5-30min | 2 per user |
| `alert/evaluate` | Event (post-scan) | 5-10s | 50 system |
| `cron/scheduled-scans` | Every 1h | 1-5min | 1 |
| `cron/monthly-credits` | 1st of month | 30s | 1 |
| `cron/trial-nudges` | Daily 10am | 30s | 1 |
| `cron/weekly-digest` | Sunday 9am | 2min | 1 |
| `cron/prompt-volume-agg` | Weekly Sunday 3am | 5-15min | 1 |
| `cron/cleanup` | Daily 4am | 1-5min | 1 |
| `cron/content-refresh-check` | Weekly (per tier) | 5-20min | 1 |
| `cron/voice-refinement` | Monthly | 5-10min | 1 |

> Full function specs with retry, steps, event flows → `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4

---

## 5. Intelligence System Summary

### 5.1 LLM Model Selection

| Model | Role | Cost/Call | When Used |
|-------|------|----------|-----------|
| Claude Haiku 4.5 | Parsing, classification, extraction | ~$0.001 | Response parsing, mention detection, sentiment scoring |
| Claude Sonnet 4.6 | Content generation, analysis, reports | ~$0.02-0.08 | Agent content stages, recommendations, narrative strategy |
| Claude Opus 4.6 | Voice extraction, narrative analysis | ~$0.10-0.30 | Voice training (A13), brand narrative (A16) — justified by quality |
| GPT-4o | QA gate, fact checking | ~$0.02-0.05 | Cross-model quality assurance (never same-model QA) |
| Gemini 2.0 Flash | Bulk classification | ~$0.0005 | High-volume, low-reasoning scan tasks |
| Perplexity Sonar Pro | Real-time web research | ~$0.01-0.03 | Agent research stages, citation discovery |

### 5.2 Scan Engine (10 AI Engines)

| Engine | Access Method | Phase | Reliability |
|--------|-------------|-------|-------------|
| ChatGPT | OpenAI API | 1 | High |
| Gemini | Google AI API | 1 | High |
| Perplexity | Perplexity API | 1 | Medium (rate limits) |
| Claude | Anthropic API | 1 | High |
| Grok | xAI API | 2 | Medium |
| DeepSeek | DeepSeek API | 2 | Medium |
| You.com | You.com API | 2 | Medium |
| Copilot | Browser simulation | 3 (deferred) | Low |
| AI Overviews | Browser simulation | 3 (deferred) | Low |
| Meta AI | Browser simulation | 3 (deferred) | Deferred |

### 5.3 Response Parsing Pipeline (6 Stages)

```
Raw AI Response
  → Stage 1: Mention Detection (fuzzy match + Haiku)
  → Stage 2: Position Extraction (list parsing + Haiku)
  → Stage 3: Sentiment Scoring (0-100 numeric, Haiku)
  → Stage 4: Citation Extraction (metadata + Haiku)
  → Stage 5: Competitor Extraction (Haiku)
  → Stage 6: Context Window Extraction
  → Structured ParsedEngineResult
```

### 5.4 Cost Estimates (at 1K businesses)

| Category | Monthly Cost |
|----------|-------------|
| Scan operations | $3,500-6,500/week |
| Agent executions | $750-2,000 |
| Voice training | $60-100 |
| Content refresh | $400-800 |
| Chat (Ask Beamix) | $200-500 |
| **Total LLM cost** | **$8,000-18,000/month** |

> Full intelligence specs → `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md`

---

## 6. Competitive Gap Closure Status

Every gap from the CTO Gap Analysis (`_GAP_ANALYSIS_CTO.md`) is now addressed:

### Previously MISSING (7 items) — All CLOSED

| Gap | Solution | Layer |
|-----|----------|-------|
| Prompt Volume Data / Trending Topics | `prompt_library` + `prompt_volumes` tables + weekly aggregation cron + dashboard widget | Architecture + Intelligence |
| Content Pattern Analysis | Agent A14 (Content Pattern Analyzer) with cheerio crawl + Sonnet analysis | Intelligence |
| Persona-Based Tracking | `personas` table + prompt modifiers + persona-segmented scanning | Architecture + Product |
| Customer Journey Stage Mapping | Haiku classification of queries into awareness/consideration/decision | Intelligence |
| White-Label / Agency Mode | Deferred (intentional skip — see Validation §5) | — |
| Looker Studio Connector | Deferred (Growth Phase feature) | — |
| CDN-Level Site Optimization (AXP) | Deferred (Moat Builder — see Validation §5) | — |

### Previously PARTIAL (7 items) — All UPGRADED

| Gap | Upgrade | Layer |
|-----|---------|-------|
| Multi-Engine (10+) | 10 engines specified with phased rollout (4 → 8 → 10+) | Intelligence |
| Source-Level Citations | `citation_sources` table + Citation Analytics dashboard view | Architecture + Product |
| Sentiment (enum → numeric) | `sentiment_score` integer 0-100 on `scan_engine_results` | Architecture + Intelligence |
| Revenue Attribution | GA4 + content performance tracking pipeline | Architecture + Intelligence |
| Content Types (generic → typed) | 12 content types in `content_items.content_type` | Architecture + Intelligence |
| Multi-Language (no region) | EN/HE with geographic scan architecture designed (deferred impl) | Intelligence |
| GSC Integration | Full OAuth + weekly data pull spec in integrations | Architecture |

### NEW Capabilities (not in original plan)

| Capability | Description | Source |
|-----------|-------------|--------|
| Content Voice Training | Agent A13 — learns business writing voice from website | Intelligence |
| Content Refresh Agent | Agent A15 — audits + updates stale published content | Intelligence |
| Brand Narrative Analysis | Agent A16 — WHY AI says what it says | Intelligence |
| Agent Workflow Chains | Event-triggered multi-agent automation | Architecture + Intelligence |
| Recurring Agent Execution | Scheduled runs via workflow system | Architecture |
| Editorial Review Queue | `in_review` status in content lifecycle | Product + Architecture |
| Content Performance Tracking | Publication → visibility correlation pipeline | Architecture + Intelligence |
| Prompt Auto-Suggestion | LLM-powered prompt recommendations from website analysis | Intelligence |

> Full gap closure validation with criteria → `_SYSTEM_DESIGN_VALIDATION.md` §1

---

## 7. Priority Classification

From Rex's validation analysis:

### Launch Critical (18 items)
- Scan engine with 4 API engines (ChatGPT, Gemini, Perplexity, Claude)
- Response parsing with 0-100 sentiment
- Visibility scoring algorithm
- Free scan flow (viral acquisition)
- Dashboard overview with gauge, trends, rankings
- 12 original agents (A1-A12)
- Credit system (hold/confirm/release)
- Onboarding 4-step flow
- Content library with editor
- WordPress integration
- Alert system (email + in-app)
- Settings (business, billing, preferences)
- Paddle billing integration
- Auth (Supabase)
- Recommendations agent (auto post-scan)
- Prompt generation per industry
- Source-level citation tracking
- AI readiness scoring

### Growth Phase — 3 months (15 items)
- Content voice training (A13)
- Content pattern analyzer (A14)
- Content refresh agent (A15)
- Brand narrative analyst (A16)
- Agent workflow chains
- Content performance tracking
- Prompt volume estimation
- Typed content templates (6 types)
- GA4 integration
- GSC integration
- Slack integration
- Customer journey stage mapping
- Competitive intelligence dashboard
- Recurring agent execution
- Prompt auto-suggestion

### Moat Builders — 3-6 months (20 items)
- Persona-based tracking
- Browser simulation (Copilot, AI Overviews)
- Multi-region scanning
- Public REST API
- Brand narrative history + trends
- Content performance attribution
- Agent suggestion engine
- Cross-agent memory
- Cloudflare integration
- Editorial review workflows
- Hebrew prompt library (unique — zero competition)
- "What Changed" weekly diff reports
- Competitor weakness alerts
- AI readiness progress tracker (gamified)

### Intentionally Skipped (14 items)
- White-label agency mode (enterprise scope, premature)
- Looker Studio connector (agency feature, defer)
- CDN-level site optimization / AXP (Scrunch-only, very high effort)
- Shopify / e-commerce (not core SMB market)
- YouTube/TikTok/Reddit monitoring (orthogonal)
- Contentful/Sanity CMS (enterprise only)
- AI Mode browser simulation (unstable)
- Full revenue attribution (requires e-commerce integration)
- Multi-workspace (agency feature)
- Webflow integration (low competitor pressure)
- Akamai/AWS CloudFront CDN (enterprise)
- Reddit alerts (niche)
- Gamma integration (single competitor only)
- Amazon Rufus engine (e-commerce specific)

> Full priority classification with reasoning → `_SYSTEM_DESIGN_VALIDATION.md` §5

---

## 8. Innovation Opportunities (Unique to Beamix)

Rex identified 8 features NO competitor has:

1. **"Fix It" Button** — One-click agent execution from any gap/recommendation in the dashboard.
2. **Agent Impact Scorecard** — Per-content ROI proof: "This article improved your ChatGPT visibility by 2 positions."
3. **Hebrew Prompt Library** — Zero competition in Hebrew AI search optimization. First-mover monopoly.
4. **Competitor Weakness Alerts** — Notify when a competitor's visibility drops, creating an overtake opportunity.
5. **AI Readiness Progress Tracker** — Gamified score improvement with milestones and celebration UX.
6. **Cross-Agent Memory** — Agents remember previous outputs and user edits across executions.
7. **"What Changed" Weekly Diff** — Automated weekly report: what changed in AI's perception of your business.
8. **Agent Suggestion Engine** — Dashboard recommends which agent to run next based on scan data + business state.

---

## 9. Security Summary

| Concern | Approach |
|---------|----------|
| Authentication | Supabase Auth (email + magic link) |
| Authorization | RLS on every table (32 tables, all documented) |
| API Key Management | SHA-256 hashed, scoped (read/write/execute), rate limited |
| Credential Encryption | AES-256-GCM at application layer for integration credentials |
| Rate Limiting | Per route, per user, per tier, per IP |
| Input Validation | Zod on every API endpoint |
| GDPR | Data export, deletion cascades, anonymized prompt volumes |

> Full security architecture → `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §7

---

## 10. Data Flow Diagrams

Six complete data flows are documented in the Architecture Layer:

1. **Full Scan Cycle** — Trigger → prompt generation → engine queries → parsing → scoring → storage → alert evaluation → dashboard update
2. **Agent Execution** — Trigger → credit hold → context assembly → multi-stage pipeline → QA gate → output → credit confirm → content library
3. **Content Publish** — Agent output → review → edit → CMS publish → performance baseline → tracking
4. **Alert Cycle** — Data change → rule evaluation → deduplication → channel routing → delivery
5. **Workflow Chain** — Trigger event → evaluate conditions → queue agents → execute in sequence → report
6. **Multi-Region Scan** — Geographic proxy architecture (designed, implementation deferred)

> Full data flow diagrams → `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §8

---

## Document Index

| Document | Size | Content |
|----------|------|---------|
| **This file** (`BEAMIX_SYSTEM_DESIGN.md`) | Executive overview | Master index, summaries, gap closure status |
| `_SYSTEM_DESIGN_PRODUCT_LAYER.md` | ~75KB | 23 pages, 90+ features, 4 user journeys, 16 agents (UX) |
| `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` | ~100KB | 32 tables, all APIs, 15 Inngest jobs, security, caching |
| `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` | ~80KB | 16 agent pipelines, scan engine, data intelligence, costs |
| `_SYSTEM_DESIGN_VALIDATION.md` | ~55KB | 21 gap closures, 47 feature parity checks, 8 innovations |
| `_GAP_ANALYSIS_CTO.md` | ~20KB | Original gap analysis (reference — now superseded) |
| `ENGINEERING_PLAN.md` | ~60KB | Previous plan (reference — now superseded by this design) |

---

> **This system design represents the complete technical and product specification for Beamix.** It closes every competitive gap identified against 15 competitors, specifies 32 database tables with full schemas, defines 16 AI agents with complete LLM pipelines, maps 23 pages with data flows, and provides clear priority classification for build order. No code. No pricing. No timelines. Pure system design from first principles.
