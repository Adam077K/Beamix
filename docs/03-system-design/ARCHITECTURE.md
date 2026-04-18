# Beamix System Design — Master Document

> **Version:** 2.2
> **Date:** March 8, 2026
> **Authors:** Morgan (CPO), Atlas (CTO), Sage (AI Engineer), Rex (Research Analyst)
> **Replaces:** `ENGINEERING_PLAN.md` (v1.0)
> **Status:** 4/7 MISSING gaps closed, 3/7 intentionally deferred with reasoning. 7/7 PARTIAL gaps upgraded.

---

## How to Read This Document

This system design is organized into four layers, each in its own detailed document. This master document provides the executive overview, cross-layer connections, and serves as the single entry point.

| Layer | Document | Author | Scope |
|-------|----------|--------|-------|
| **Product** | `_SYSTEM_DESIGN_PRODUCT_LAYER.md` | Morgan (CPO) | Every page, feature, user journey, agent UX |
| **Architecture** | `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` | Atlas (CTO) | Database (32 tables), APIs, data flow, security, infrastructure |
| **Intelligence** | `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` | Sage (AI Engineer) | LLM pipelines, 11 agents, scan engine, data intelligence |
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
2. **Agent-first architecture** — Most comprehensive interactive autonomous agent suite with streaming chat UX under $100/month. (Note: RankPrompt offers content generation + WP publishing at $29/month, but without interactive streaming agent chat or multi-agent workflows.)
3. **Closed-loop system** — Scan → fix → measure in one platform (competitors break this loop).
4. **Cross-model QA** — GPT-4o reviews Claude's output. No single-model blind spots.
5. **Inngest-native** — Background jobs with retry, concurrency, observability built-in.
6. **Event-driven workflows** — Automated multi-agent chains (visibility drop → auto-fix).
7. **Progressive voice learning** — Content improves with every user edit.
8. **Browser simulation for non-API engines** — Bing Copilot, Google AI Overviews, and Google AI Mode scanned via headless browser. Only SMB GEO platform with this capability. Pro/Business only.

---

## 2. Platform at a Glance

### 2.1 Page Map (23 Pages + Phase 2 & 3)

| Page | URL | Purpose |
|------|-----|---------|
| Landing | `/` | Conversion page: hero, social proof, features, pricing, CTA |
| Free Scan | `/scan` | Anonymous 60-second AI visibility scan |
| Scan Results | `/scan/[scan_id]` | Public shareable results with signup CTA |
| Login | `/login` | Supabase Auth login |
| Signup | `/signup` | Registration with optional `?scan_id=` import |
| Forgot Password | `/forgot-password` | Password reset flow |
| Onboarding | `/onboarding` | 4-step setup: business → queries → competitors → ready |
| Dashboard Overview | `/dashboard` | Visibility score gauge, trend chart, recommendations, activity feed |
| Rankings | `/dashboard/rankings` | Per-query, per-engine visibility table with filters |
| Recommendations | `/dashboard/recommendations` | AI-generated action items with "Fix with Agent" buttons |
| Content Library | `/dashboard/content` | All generated content, filterable, with performance tracking |
| Content Editor | `/dashboard/content/[id]` | Markdown editor with preview, version history, publish-to-CMS |
| Agent Hub | `/dashboard/agents` | All 11 agents, run history, workflow setup |
| Agent Chat | `/dashboard/agents/[agent_id]` | Agent execution UI with real-time step progress |
| Competitive Intelligence | `/dashboard/competitors` | Share of voice, gap analysis, competitor profiles |
| AI Readiness | `/dashboard/ai-readiness` | Website audit score with improvement roadmap |
| Settings | `/dashboard/settings` | Business profile, billing, preferences, integrations (4 tabs) |
| Pricing | `/pricing` | Plan comparison with feature matrix and FAQ |
| Blog | `/blog` | SEO content marketing |
| About | `/about` | Company story |
| Terms | `/terms` | Terms of service |
| Privacy | `/privacy` | Privacy policy |
| API Docs | `/docs/api` | REST API documentation (Scale tier) |
| **AI Crawler Feed** *(Phase 2)* | `/dashboard/crawler-feed` | AI bot crawl tracking — which bots visit which pages (Pro+) |
| **Conversation Explorer** *(Phase 2)* | `/dashboard/explore` | Browse what your industry niche asks across AI engines (Pro+) |

> Full page specifications (layout, components, data flows, connections) → `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2

### 2.2 Feature Count Summary

| Module | Phase 1 | Phase 2 & 3 | Total | Key Capabilities |
|--------|---------|-------------|-------|-----------------|
| Scan Engine | 12 | +3 | 15 | 10 AI engines + browser sim, 30-min refresh (Business), city-level scanning |
| Dashboard & Analytics | 14 | +3 | 17 | Visibility gauge, trends, rankings, query clustering, region filter, prompt volume |
| Agent System | 11 agents | +0 | 11 agents | Content, schema, FAQ, citations, voice training, patterns, refresh, narrative |
| Content Engine | 10 | +1 | 11 | Library, editor, versioning, comparison tool, voice profiles, CMS publish |
| Competitive Intelligence | 6 | +2 | 8 | Share of voice, gap analysis, auto-suggest competitors, competitor monitoring |
| Web Presence | 0 | +2 | 2 | AI crawler feed, web mention tracking |
| Alert System | 9 alert types | +0 | 9 | Visibility, sentiment, competitor, credit, content, mention alerts |
| Integration Hub | 7 | +1 | 8 | WordPress, GA4, GSC (prompt volume), Slack, Cloudflare, Paddle, API keys |
| AI Readiness | 6 | +0 | 6 | Website audit, 5-category scoring, improvement roadmap, web mentions tab |
| Settings | 6 | +1 | 7 | Business profile, billing portal, preferences, language, integrations, regions |
| Billing | 5 | +0 | 5 | Paddle checkout, subscription management, credit system, usage tracking |
| **Total** | **91+** | **+13** | **103+** | |

> Full feature inventory with descriptions → `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §3

### 2.3 Phase 2 & 3 Roadmap (March 2026)

| Feature | Tier | Priority | Status |
|---------|------|----------|--------|
| F9: 30-Min Scan Refresh (engine rotation) | Business | High | Spec complete |
| F2: Content Comparison Tool | All paid | High | Spec complete |
| F5: Auto-Suggest Competitors | All tiers | High | Spec complete |
| F7: Web Mention Tracking | All paid | High | Spec complete |
| F1: AI Crawler Feed | Pro+ | Medium | Spec complete |
| F3: Topic/Query Clustering | Pro+ | Medium | Spec complete |
| F6: Browser Simulation (Copilot, AI Overviews, AI Mode) | Pro+ | High (Phase 3) | Spec complete |
| F4: Conversation Explorer | Pro+ | Medium (Phase 3) | Spec complete |
| F10: City-Level Scanning | All tiers | Medium | Spec complete |
| F11: Prompt Volume Data (GSC) | Pro+ | Medium | Spec complete |
| F8: Social Monitoring | — | **REJECTED** | Out of scope |

> Pricing locked April 2026: Discover $79 / Build $189 / Scale $499. Current pricing absorbs all new feature costs. → `docs/08-agents_work/AUDITS/PRICING-IMPACT-ANALYSIS.md`

---

## 3. Agent System (16 Agents)

The agent system is Beamix's core differentiator. Each agent is a multi-stage LLM pipeline.

| # | Agent | Purpose | LLM Pipeline | Credits |
|---|-------|---------|-------------|---------|
| A1 | Content Writer | GEO-optimized website pages | Perplexity → Sonnet → Sonnet → GPT-4o QA | 1 |
| A2 | Blog Writer | Long-form blog posts for citation | Perplexity → Sonnet → Sonnet → Sonnet → GPT-4o (titles) → GPT-4o QA | 1 |
| A3 | Schema Optimizer | JSON-LD structured data | cheerio → Haiku → Sonnet → validator | 1 |
| A4 | Recommendations | Prioritized action items (auto after scan) | Sonnet (single-pass analysis) | 0 (system) |
| A5 | FAQ Agent | FAQ content matching AI queries | Haiku → Sonnet → Haiku (schema) | 1 |
| A6 | Review Analyzer | Reputation analysis + response templates | Perplexity → Sonnet → Sonnet | 1 |
| A7 | Social Strategy | 30-day social content calendar | Perplexity → Sonnet → GPT-4o QA | 1 |
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
| New Business Onboarding | Onboarding complete | A13 + A14 + A11 (parallel) → A4 → Notify |
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
| `/api/dashboard/*` | 6 | Required | Overview, rankings, trends, competitors, recommendations, ai-readiness |
| `/api/settings/*` | 9 | Required | Business profile, preferences, notifications, billing, integrations, language, export, account, password |
| `/api/billing/*` | 5 | Required | Status, portal link, Paddle webhooks, usage, invoices |
| `/api/integrations/*` | 6 | Required | CRUD for WordPress, GA4, GSC, Slack, Cloudflare, test-connection |
| `/api/alerts/*` | 5 | Required | Alert rules CRUD, notification list, mark read, preferences, bulk actions |
| `/api/competitors/*` | 3 | Required | CRUD, comparison data |
| `/api/workflows/*` | 4 | Required | CRUD, trigger, run history |
| `/api/analytics/*` | 4 | Required | Prompt volumes, citation sources, brand narrative, content performance |
| `/api/v1/*` | 9 | API key | Public REST API (Scale tier) |
| `/api/onboarding/*` | 1 | Required | Complete onboarding |
| `/api/inngest` | 1 | Inngest key | Inngest serve endpoint |

> Full route specs with validation, rate limits, response shapes → `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §3

### 4.4 Background Jobs (14 Inngest Functions)

| Function | Trigger | Duration | Concurrency |
|----------|---------|----------|-------------|
| `scan.free` | Event | 30-60s | 25 system |
| `scan.scheduled` | Cron (every 1h) | 60-120s | 50 system |
| `scan.manual` | Event | 60-120s | 10 system |
| `agent.execute` | Event | 60-300s | 3 per user, 20 system |
| `workflow.execute`| Event | 5-30min | 5 total, 1 per user |
| `alert.evaluate` | Event (post-scan) | 5-10s | 50 system |
| `cron.scheduled-scans` | Every 1 hour | 1-5min | 1 |
| `cron.monthly-credits` | 1st of month | 30s | 1 |
| `cron.trial-nudges` | Daily 10am | 30s | 1 |
| `cron.weekly-digest` | Monday 8AM UTC | 2min | 1 |
| `cron.prompt-volume-agg` | Weekly Sunday 3:30am UTC | 5-15min | 1 |
| `cron.cleanup` | Daily 4am | 1-5min | 1 |
| `cron.content-refresh-check` | Daily 6AM UTC | 5-20min | 1 |
| `cron.voice-refinement` | Weekly Sunday 3AM UTC | 5-10min | 1 |

> Full function specs with retry, steps, event flows → `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §4

### 4.5 Inngest Event Registry

Canonical event names used across the system. All events use `/` separators.

| Event Name | Emitted By | Consumed By | Payload |
|------------|-----------|-------------|---------|
| `scan/free.start` | `/api/scan/start` | `scan.free` | `{ scanId, businessUrl, language, ip }` |
| `scan/manual.start` | `/api/scan/start` (authenticated) | `scan.manual` | `{ scanId, businessId, userId }` |
| `scan/complete` | `scan.free`, `scan.manual`, `scan.scheduled` | `alert.evaluate`, workflows | `{ scanId, businessId, userId, scores }` |
| `agent/execute.start` | `/api/agents/execute` | `agent.execute` | `{ jobId, agentType, businessId, userId, params }` |
| `agent/execute.complete` | `agent.execute` | workflows, `alert.evaluate` | `{ jobId, agentType, businessId, contentId }` |
| `workflow/trigger` | `alert.evaluate`, manual | `workflow.execute` | `{ workflowId, triggerId, businessId }` |
| `onboarding/complete` | `/api/onboarding/complete` | workflows (New Business Onboarding) | `{ userId, businessId }` |
| `content/published` | `/api/content/publish` | workflows (Content Lifecycle) | `{ contentId, businessId, agentType }` |
| `billing/subscription.changed` | `/api/billing/webhooks` | `cron.monthly-credits` (immediate allocation) | `{ userId, planId, status }` |
| `alert/rule.triggered` | `alert.evaluate` | notification delivery | `{ alertRuleId, businessId, channel, payload }` |

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

### 5.4 Cost Estimates (at 1K businesses) — CORRECTED

**Note:** Previous estimates underestimated costs 2-5x due to two errors: (1) parsing pipeline uses 5 Haiku calls per response, not 1, and (2) scan cost was labeled "/week" but compared against "/month" budget. Corrected below.

| Category | Monthly Cost |
|----------|-------------|
| Scan operations (corrected: 5x parse cost) | $8,000-14,000 |
| Agent executions (corrected: A8 3-6x multiplier) | $2,000-5,000 |
| Voice training | $60-100 |
| Content refresh | $400-800 |
| Chat (Ask Beamix) | $200-500 |
| **Total LLM cost** | **$15,000-25,000/month** |

> **Pricing implication:** At $15K-25K/month LLM cost for 1K businesses, Beamix must achieve $15-25 ARPU minimum across paid tiers to maintain healthy margins. Free tier scans are loss leaders budgeted at <5% of total LLM spend. These estimates are speculative at pre-launch volume and should be re-validated at 100, 500, and 1K paying customers. See Intelligence Layer §8 for mitigation strategies (caching, Perplexity scaling, model substitution).

> Full cost model → `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §8

> Full intelligence specs → `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md`

---

## 6. Competitive Gap Closure Status

Every gap from the CTO Gap Analysis (`_GAP_ANALYSIS_CTO.md`) is now addressed:

### Previously MISSING (7 items) — 4 Closed, 3 Intentionally Deferred

| Gap | Solution | Status | Layer |
|-----|----------|--------|-------|
| Prompt Volume Data / Trending Topics | `prompt_library` + `prompt_volumes` tables + weekly aggregation cron + dashboard widget | CLOSED | Architecture + Intelligence |
| Content Pattern Analysis | Agent A14 (Content Pattern Analyzer) with cheerio crawl + Sonnet analysis | CLOSED | Intelligence |
| Persona-Based Tracking | `personas` table + prompt modifiers. Data model CLOSED. Scan pipeline does not query or use personas at launch. | Data Model CLOSED — Pipeline Integration DEFERRED (Phase 4) | Architecture + Product |
| Customer Journey Stage Mapping | Haiku classification of queries into awareness/consideration/decision. Data model and classification logic fully designed in Intelligence Layer. Pipeline integration deferred to Phase 4. No `journey_stage` column on `scan_results` at launch. | SPEC ONLY — Phase 4 Implementation | Intelligence |
| White-Label / Agency Mode | Intentional skip — enterprise scope, premature for MVP. Requires multi-tenant architecture not justified at current scale. | DEFERRED | — |
| Looker Studio Connector | Intentional skip — agency-specific feature. REST API (Scale tier) covers data export needs. Revisit when agency tier launches. | DEFERRED | — |
| CDN-Level Site Optimization (AXP) | Intentional skip — Scrunch-only feature, very high implementation effort, low competitive pressure. Revisit as Moat Builder. | DEFERRED | — |

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
| Self-Review Queue (MVP) | `in_review` status in content lifecycle. MVP: single user review/approve. Multi-person editorial deferred to agency tier. | Product + Architecture |
| Content Performance Tracking | Publication → visibility correlation pipeline | Architecture + Intelligence |
| Prompt Auto-Suggestion | LLM-powered prompt recommendations from website analysis | Intelligence |

> Full gap closure validation with criteria → `_SYSTEM_DESIGN_VALIDATION.md` §1

---

## 7. Priority Classification

From Rex's validation analysis:

### Launch Critical (18 items)
- Scan engine with 3 free-tier engines (ChatGPT, Gemini, Perplexity) — Claude is Pro-tier only
- Response parsing with 0-100 sentiment
- Visibility scoring algorithm
- Free scan flow (viral acquisition)
- Dashboard overview with gauge, trends, rankings
- 12 original agents (A1-A12)
- Credit system (hold/confirm/release)
- Onboarding 4-step flow
- Content library with editor
- WordPress integration (Build tier)
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
- Multi-person editorial review workflows
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

Rex identified 8 features uniquely combined in Beamix — 5 genuinely novel, 3 with significantly deeper implementation than competitors:

1. **"Fix It" Button** — One-click agent execution from any gap/recommendation in the dashboard. *Market-leading:* Gauge's AI Analyst and AthenaHQ's Action Center have partial equivalents, but none integrate the trigger directly into every dashboard insight view with pre-loaded agent context.
2. **Agent Impact Scorecard** — Per-content ROI proof: "This article improved your ChatGPT visibility by 2 positions." *Market-leading:* Bear AI and Gauge track content performance generally, but Beamix attributes specific visibility changes to specific agent outputs at the per-content-piece level.
3. **Hebrew Prompt Library** — Zero competition in Hebrew AI search optimization. First-mover monopoly. *Genuinely unique.*
4. **Competitor Weakness Alerts** — Notify when a competitor's visibility drops, creating an overtake opportunity. *Genuinely unique.*
5. **AI Readiness Progress Tracker** — Gamified score improvement with milestones and celebration UX. *Genuinely unique.*
6. **Cross-Agent Memory** — Agents remember previous outputs and user edits across executions. *Genuinely unique.*
7. **"What Changed" Weekly Diff** — Automated weekly report: what changed in AI's perception of your business. *Most comprehensive:* Otterly and SE Visible have weekly reports with historical data, but Beamix provides per-query, per-engine diffs with competitor context and content attribution at granularity no competitor matches.
8. **Agent Suggestion Engine** — Dashboard recommends which agent to run next based on scan data + business state. *Genuinely unique.*

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
| `_SYSTEM_DESIGN_PRODUCT_LAYER.md` | ~75KB | 23 pages, 90+ features, 4 user journeys, 11 agents (UX) |
| `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` | ~100KB | 32 tables, all APIs, 14 Inngest jobs, security, caching |
| `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` | ~80KB | 16 agent pipelines, scan engine, data intelligence, costs |
| `_SYSTEM_DESIGN_VALIDATION.md` | ~55KB | 21 gap closures, 49 feature parity checks, 8 innovations |
| `_GAP_ANALYSIS_CTO.md` | ~20KB | Original gap analysis (reference — now superseded) |
| `ENGINEERING_PLAN.md` | ~60KB | Previous plan (reference — now superseded by this design) |

---

> **This system design represents the complete technical and product specification for Beamix.** It closes every competitive gap identified against 15 competitors, specifies 32 database tables with full schemas, defines 16 AI agents with complete LLM pipelines, maps 23 pages with data flows, and provides clear priority classification for build order. No code. No pricing. No timelines. Pure system design from first principles.


---

## Codebase Architecture

# Architecture

> **Last synced:** March 2026 — aligned with 03-system-design/

**Source of truth:** `docs/03-system-design/ARCHITECTURE.md`

## Pattern Overview

**Overall:** Layered N-tier architecture with clear separation between presentation, API, background jobs, and data layers, built on Next.js 16 with Inngest handling all async agent execution, scans, and cron jobs.

**Key Characteristics:**
- Server-client component split with Next.js 16 App Router for modern React patterns
- API layer built on Next.js route handlers with middleware-style error handling
- **Inngest-native async execution** — API routes emit events and return 202; Inngest handles all agent/scan/cron work with retry, concurrency control, and observability
- Real-time updates via Supabase Realtime (WebSocket) — frontend subscribes, not polling
- State management split: React Query for server state, Zustand for client UI state
- Database-enforced security through Supabase Row-Level Security (RLS) on all 32 tables

## Layers

**Presentation Layer (Frontend):**
- Purpose: Server and client components rendering UI, form handling, real-time data fetching
- Location: `src/app/` (page routes, layouts), `src/components/` (UI components)
- Contains: Next.js pages, React components with hooks, Shadcn UI components, animations (Framer Motion)
- Depends on: React Query (data), Zustand (UI state), Supabase client (auth), custom hooks
- Used by: Browser clients accessing `/` and authenticated routes

**API Layer (Route Handlers):**
- Purpose: Authentication enforcement, input validation, business logic, database operations, Inngest event emission
- Location: `src/app/api/` organized by domain (~70+ routes across 14 route groups)
- Contains: Next.js POST/GET/PUT/DELETE handlers with error wrapping, Supabase queries, Zod validation
- Depends on: `lib/api/auth.ts` (user verification), `lib/api/errors.ts` (error types), `lib/api/responses.ts` (response formatting), `lib/supabase/server.ts` (server client)
- Used by: Frontend via fetch calls, external systems via webhooks
- **Critical rule:** API routes NEVER call LLM APIs directly. All agent/scan work emits Inngest events and returns 202.

**State Management Layer:**
- **React Query:** Server state (queries, rankings, content, credits) — cached and synchronized via `src/lib/react-query/`
- **Zustand:** Client UI state (sidebar, modals, loading states) — managed in `src/lib/zustand/stores/ui-store.ts`

**Data Access Layer:**
- Purpose: Provide authenticated clients (browser, API routes) to Supabase
- Location: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server), `src/lib/supabase/middleware.ts` (auth middleware)
- Contains: Supabase client initialization with cookie-based session management
- Depends on: Supabase SDK, Next.js cookies API
- Used by: API routes, React components, hooks

**Inngest Background Layer:**
- Purpose: All async work — scans, agent execution, crons, multi-agent workflow chains
- Location: `src/inngest/` — Inngest function definitions. Served at `/api/inngest`
- Contains: 14 Inngest functions (see table below)
- Depends on: LLM APIs (OpenAI, Anthropic, Perplexity, Gemini, xAI, DeepSeek), Supabase (persist results)
- Pattern: API route emits Inngest event -> returns 202 -> Inngest executes function with retry/concurrency -> writes result to DB -> Supabase Realtime notifies frontend
- Service role key: Only used here and in webhook handlers (never in API routes or client)

**Authentication Layer:**
- Purpose: User session verification, credit balance checks
- Location: `src/lib/api/auth.ts` (middleware), `src/lib/supabase/middleware.ts` (session refresh)
- Contains: `getAuthenticatedUser()` function throwing `UnauthorizedError` if no session
- Depends on: Supabase Auth, Next.js cookies
- Used by: All API routes that require auth

## Database (32 Tables)

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

## Background Jobs (14 Inngest Functions)

| Function | Trigger | Duration | Concurrency |
|----------|---------|----------|-------------|
| `scan.free` | Event | 30-60s | 25 system |
| `scan.scheduled` | Cron (every 1h) | 60-120s | 50 system |
| `scan.manual` | Event | 60-120s | 10 system |
| `agent.execute` | Event | 60-300s | 3 per user, 20 system |
| `workflow.execute` | Event | 5-30min | 5 total, 1 per user |
| `alert.evaluate` | Event (post-scan) | 5-10s | 50 system |
| `cron.scheduled-scans` | Every 1 hour | 1-5min | 1 |
| `cron.monthly-credits` | 1st of month | 30s | 1 |
| `cron.trial-nudges` | Daily 10am | 30s | 1 |
| `cron.weekly-digest` | Monday 8AM UTC | 2min | 1 |
| `cron.prompt-volume-agg` | Weekly Sunday 3:30am UTC | 5-15min | 1 |
| `cron.cleanup` | Daily 4am | 1-5min | 1 |
| `cron.content-refresh-check` | Daily 6AM UTC | 5-20min | 1 |
| `cron.voice-refinement` | Weekly Sunday 3AM UTC | 5-10min | 1 |

## Inngest Event Registry

| Event Name | Emitted By | Consumed By | Payload |
|------------|-----------|-------------|---------|
| `scan/free.start` | `/api/scan/start` | `scan.free` | `{ scanId, businessUrl, language, ip }` |
| `scan/manual.start` | `/api/scan/start` (authenticated) | `scan.manual` | `{ scanId, businessId, userId }` |
| `scan/complete` | `scan.free`, `scan.manual`, `scan.scheduled` | `alert.evaluate`, workflows | `{ scanId, businessId, userId, scores }` |
| `agent/execute.start` | `/api/agents/[agentType]/execute` | `agent.execute` | `{ jobId, agentType, businessId, userId, params }` |
| `agent/execute.complete` | `agent.execute` | workflows, `alert.evaluate` | `{ jobId, agentType, businessId, contentId }` |
| `workflow/trigger` | `alert.evaluate`, manual | `workflow.execute` | `{ workflowId, triggerId, businessId }` |
| `onboarding/complete` | `/api/onboarding/complete` | workflows (New Business Onboarding) | `{ userId, businessId }` |
| `content/published` | `/api/content/publish` | workflows (Content Lifecycle) | `{ contentId, businessId, agentType }` |
| `billing/subscription.changed` | `/api/billing/webhooks` | `cron.monthly-credits` (immediate allocation) | `{ userId, planId, status }` |
| `alert/rule.triggered` | `alert.evaluate` | notification delivery | `{ alertRuleId, businessId, channel, payload }` |

## API Routes (~70+ across 14 route groups)

| Route Group | Routes | Auth | Purpose |
|-------------|--------|------|---------|
| `/api/scan/*` | 5 | Mixed | Free scan, manual scan, status, results, history |
| `/api/agents/*` | 5 | Required | Execute, status, cancel, history, chat |
| `/api/content/*` | 6 | Required | CRUD, publish to CMS, performance data |
| `/api/dashboard/*` | 6 | Required | Overview, rankings, trends, competitors, recommendations, ai-readiness |
| `/api/settings/*` | 9 | Required | Business profile, preferences, notifications, billing, integrations, language, export, account, password |
| `/api/billing/*` | 5 | Required | Status, portal link, Paddle webhooks, usage, invoices |
| `/api/integrations/*` | 6 | Required | CRUD for WordPress, GA4, GSC, Slack, Cloudflare, test-connection |
| `/api/alerts/*` | 5 | Required | Alert rules CRUD, notification list, mark read, preferences, bulk actions |
| `/api/competitors/*` | 3 | Required | CRUD, comparison data |
| `/api/workflows/*` | 4 | Required | CRUD, trigger, run history |
| `/api/analytics/*` | 4 | Required | Prompt volumes, citation sources, brand narrative, content performance |
| `/api/v1/*` | 9 | API key | Public REST API (Scale tier) |
| `/api/onboarding/*` | 1 | Required | Complete onboarding |
| `/api/inngest` | 1 | Inngest key | Inngest serve endpoint |

## Data Flows

**Agent Execution (Inngest-native):**

1. User clicks "Fix This" on a recommendation or runs an agent from the hub
2. Submit -> `POST /api/agents/[agentType]/execute` (dynamic segment, e.g. `/api/agents/content_writer/execute`)
3. API route:
   - Calls `getAuthenticatedUser()` — throws 401 if not logged in
   - Validates input with Zod
   - Holds credit via `credit_pools` update (hold/confirm/release pattern)
   - Inserts record in `agent_jobs` table with status='pending'
   - Emits `agent/execute.start` Inngest event
   - Returns `{ jobId, status: 'processing' }` immediately (202 Accepted)
4. Inngest picks up `agent.execute` function, runs multi-stage LLM pipeline with retry/concurrency
5. On completion: writes output to `content_items` + `agent_job_steps`, confirms credit, emits `agent/execute.complete`
6. Frontend polls `GET /api/agents/[jobId]/status` every 3 seconds while status is 'pending' or 'running'
7. On failure: releases held credit (user never charged for failed executions)

**Full Scan Cycle:**

1. Trigger (free scan / manual / scheduled cron)
2. Prompt generation per industry + tracked queries
3. Engine queries (4-10 AI engines depending on tier)
4. Response parsing (6-stage pipeline: mention detection -> position extraction -> sentiment scoring -> citation extraction -> competitor extraction -> context window)
5. Scoring and storage to `scan_engine_results` + `citation_sources`
6. Alert evaluation (`alert.evaluate` Inngest function)
7. Dashboard update via Supabase Realtime

**Content Publish:**

Agent output -> user review/edit -> CMS publish (WordPress REST API for Build tier) -> performance baseline -> tracking via `content_performance` table

**Alert Cycle:**

Data change -> rule evaluation -> deduplication (cooldown) -> channel routing (email/in-app/Slack) -> delivery

**Workflow Chain:**

Trigger event -> evaluate conditions -> queue agents -> execute in sequence -> report

## Key Abstractions

**Error Handling Abstraction:**
- Purpose: Standardized error responses with HTTP status codes and error codes
- Examples: `UnauthorizedError`, `BadRequestError`, `InsufficientCreditsError` in `src/lib/api/errors.ts`
- Pattern: Custom error classes extending `APIError` with preset status codes. All routes wrapped with `withErrorHandler()` which catches errors and formats responses.

**Response Formatting Abstraction:**
- Purpose: Consistent API response envelope
- Examples: `successResponse(data, meta)`, `errorResponse(error, statusCode)` in `src/lib/api/responses.ts`
- Pattern: All successful responses return `{ success: true, data, meta: { timestamp } }`, errors return `{ success: false, error: { message, code } }`

**Hooks Abstraction:**
- Purpose: Encapsulate data fetching logic with React Query + authentication
- Examples: `useQueries()`, `useDashboardData()`, `useCredits()` in `src/lib/hooks/`
- Pattern: Each hook uses React Query's `useQuery()` and `useMutation()`, returns `{ data, isLoading, error, mutations }`

**Supabase Client Abstraction:**
- Purpose: Provide different client instances for different contexts
- Examples: `createClient()` from `src/lib/supabase/client.ts` (browser), `createClient()` from `src/lib/supabase/server.ts` (API routes)
- Pattern: Browser client handles cookie-based auth, server client uses same but with explicit cookie management

## Security Architecture

| Concern | Approach |
|---------|----------|
| Authentication | Supabase Auth (email + magic link) |
| Authorization | RLS on every table (32 tables, all documented) |
| API Key Management | SHA-256 hashed, scoped (read/write/execute), rate limited |
| Credential Encryption | AES-256-GCM at application layer for integration credentials |
| Rate Limiting | Per route, per user, per tier, per IP |
| Input Validation | Zod on every API endpoint |
| GDPR | Data export, deletion cascades, anonymized prompt volumes |

## Cross-Cutting Concerns

**Logging:** `console.error()` and `console.log()` statements in API routes. No structured logging library. Logs appear in Vercel function logs.

**Validation:**
- Frontend: React Hook Form with Zod (via `resolvers: zodResolver()`)
- API: Zod schema validation on every route handler
- Supabase: Database constraints (NOT NULL, CHECK clauses, foreign keys)

**Authentication:**
- Frontend: Supabase session via JWT in cookies (automatic with `@supabase/ssr`)
- API: Session verification in `getAuthenticatedUser()` using `supabase.auth.getUser()`
- Database: RLS policies enforce user_id matching

**Data Encryption:**
- Passwords encrypted by Supabase Auth
- Integration credentials encrypted with AES-256-GCM at application layer
- API keys hashed with SHA-256
- LLM API keys stored in environment variables
- Database connections over TLS to Supabase cloud

**Rate Limiting:**
- Per route, per user, per tier, per IP (via middleware)
- Paddle handles payment rate limiting
- LLM provider rate limits managed via Inngest concurrency controls

---

*Architecture analysis: 2026-02-27 | Updated: March 2026 — synced with System Design v2.1*


---

## Technical Architecture Snapshot

> ⚠️ **ARCHIVED** — Historical reference. Current source of truth: `docs/03-system-design/ARCHITECTURE.md` | Archived: 2026-03-05

# Beamix — Technical Architecture

> ~~Complete technical specification~~ — This is now superseded. See `docs/03-system-design/`.
>
> **Repository:** https://github.com/Adam077K/Beamix

---

## 1. System Architecture Overview

### High-Level Architecture

```
                            +------------------+
                            |     BROWSER      |
                            |   (SMB Owner)    |
                            +--------+---------+
                                     |
                                     | HTTPS
                                     v
                   +-----------------+------------------+
                   |          VERCEL EDGE NETWORK        |
                   |  (CDN, Static Assets, Edge Config)  |
                   +-----------------+------------------+
                                     |
                                     v
+--------------------------------------------------------------------+
|                    NEXT.JS APPLICATION (Vercel)                     |
|                                                                    |
|  +-------------------+  +-------------------+  +-----------------+ |
|  | Server Components |  | Client Components |  | API Route       | |
|  | (SSR, RSC)        |  | (Hydrated)        |  | Handlers        | |
|  | - Dashboard pages |  | - Modals, Forms   |  | - /api/scan     | |
|  | - Settings pages  |  | - Charts (Recharts)|  | - /api/agents   | |
|  | - Marketing pages |  | - Real-time polls |  | - /api/webhooks | |
|  +-------------------+  +-------------------+  +-----------------+ |
+------+------------------+------------------+-----------+-----------+
       |                  |                  |           |
       v                  v                  v           v
+------------+   +-----------+  +----------+
| SUPABASE   |   | PADDLE    |  | LLM APIs |
| - PostgreSQL|   | - Billing |  | - OpenAI |
| - Auth     |   | - Subs    |  | - Claude |
| - RLS      |   | - Credits |  | - Pplx   |
| - Realtime |   |           |  | - Gemini |
| - Storage  |   |           |  |          |
+------------+   +-----------+  +----------+
```

### Component Responsibilities

| Component | Responsibility | Communication |
|-----------|---------------|---------------|
| **Next.js Frontend** | UI rendering, form handling, real-time polling | HTTPS to API routes |
| **Next.js API Routes** | Auth enforcement, input validation, orchestration, LLM calls | Supabase SDK, direct LLM API calls |
| **Supabase** | Data persistence, auth, RLS, real-time subscriptions | PostgreSQL wire protocol |

| **Paddle** | Subscription billing, payment processing | Webhooks to API routes |
| **LLM APIs** | Query ranking checks, content generation | Called from Next.js API routes |

### Key Design Decisions

1. **LLM calls happen in API routes** -- direct calls to LLM APIs from server-side code. This keeps all logic in the codebase with centralized cost tracking, retry logic, and rate limiting.
2. **Fire-and-forget pattern** for agent execution -- API returns 202 Accepted immediately, frontend polls `agent_executions` table for status.
3. **RLS is the security boundary** -- even if an API route has a bug, Supabase RLS prevents data leakage across users.
4. **Credits are deducted AFTER success** -- if an agent fails, the user is not charged.

---

### Data Flow: Free Scan (Unauthenticated)

```
1. User visits /scan (marketing page)
2. Enters: website URL, business name, sector, location
3. Frontend: POST /api/scan/start
4. API Route:
   a. Rate-limit check (IP-based, max 3 scans/day per IP)
   b. Validate input with Zod
   c. Generate scan_token (UUID)
   d. Insert row into free_scans table (status='pending')
   e. Trigger async scan worker (background task)
   f. Return { scan_token, status: 'processing' }
5. Scan Worker (async, ~60-90s):
   a. Query 4 LLMs with 3 auto-generated prompts for sector+location
   b. Parse each response for brand mention, position, sentiment
   c. Write results to free_scan_results table
   d. Update free_scans.status = 'completed'
6. Frontend polls GET /api/scan/{scan_token}/status every 3s
7. When completed: redirect to /scan/{scan_token}/results
8. Results page renders: visibility score, per-LLM breakdown, CTA to sign up
```

### Data Flow: Agent Execution (Authenticated)

```
1. User on dashboard clicks "Generate Content" on a recommendation
2. Modal opens, user fills: topic, tone, word count
3. Frontend: POST /api/agents/content-writer
4. API Route:
   a. getAuthenticatedUser() -- 401 if no session
   b. Validate input with Zod schema
   c. Check credits: SELECT total_credits FROM credits WHERE user_id = $1
   d. If insufficient: return 402 with credits_required and credits_available
   e. Insert into agent_executions (status='pending', input_data=payload)
   f. Start async agent worker with { execution_id, user_id, ...payload }
   g. Return 202 { execution_id, status: 'processing' }
5. Frontend starts polling GET /api/agents/executions/{execution_id} every 5s
6. Agent Worker (async, 2-5 min):
   a. Research phase (Perplexity sonar-pro)
   b. Outline phase (Claude claude-sonnet-4-5-20250929)
   c. Write phase (Claude claude-sonnet-4-5-20250929)
   d. Quality check (GPT-4o)
   e. If quality_score >= 0.7:
      - RPC call: deduct_credits(user_id, 3, 'content_generation', execution_id)
      - Insert into content_generations table
      - Update agent_executions.status = 'completed'
   f. If quality_score < 0.7: retry once, then fail gracefully
7. Frontend detects status='completed', fetches full result, displays in modal
```

### Data Flow: Dashboard Update (Scheduled)

```
2. Fetch all active tracked_queries grouped by user
3. For each user batch (max 50 queries):
   a. Query 4 LLMs per query (parallel via Promise.all)
   b. Parse responses for mention, position, sentiment, competitors
   c. Batch insert into scan_results table
   d. Compare to previous day's results
   e. If significant change detected: flag for notification
4. After all users processed:
   a. Trigger recommendation regeneration for users with changes
5. Users see updated data next time they visit dashboard
   (React Query staleTime ensures fresh fetch)
```

---

## 2. Database Schema

### Schema Design Principles

- All tables use UUID primary keys (`gen_random_uuid()`)
- All tables include `created_at` (auto) and `updated_at` (trigger-maintained)
- JSONB for flexible/evolving structures (agent inputs/outputs, LLM metadata)
- Composite indexes on common query patterns
- RLS enabled on every table, no exceptions

### Entity Relationship Diagram

```
auth.users (Supabase managed)
    |
    +-- users (1:1, profile)
    |     |
    |     +-- businesses (1:many, user can track multiple brands)
    |     |     |
    |     |     +-- tracked_queries (1:many)
    |     |     |     |
    |     |     |     +-- scan_results (1:many, per-query snapshots)
    |     |     |     |     |
    |     |     |     |     +-- scan_result_details (1:many, per-LLM breakdown)
    |     |     |     |
    |     |     |     +-- recommendations (1:many)
    |     |     |
    |     |     +-- competitors (1:many)
    |     |
    |     +-- subscriptions (1:1 active)
    |     +-- credits (1:1 balance)
    |     +-- credit_transactions (1:many audit log)
    |     +-- agent_executions (1:many)
    |     |     |
    |     |     +-- content_generations (1:1 per content agent)
    |     |     +-- agent_outputs (1:many, generic output store)
    |     |
    |     +-- notification_preferences (1:1)
    |
    +-- free_scans (standalone, no auth required)
```

### Table Definitions

#### 2.1 `users`

```sql
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  language    TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'he')),
  timezone    TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### 2.2 `businesses`

A user can manage multiple brands/businesses. This separates identity from business context and enables future multi-brand support.

```sql
CREATE TABLE public.businesses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  website_url     TEXT,
  industry        TEXT,
  location        TEXT,
  description     TEXT,
  services        JSONB DEFAULT '[]'::jsonb,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE UNIQUE INDEX idx_businesses_primary ON businesses(user_id) WHERE is_primary = TRUE;
```

#### 2.3 `tracked_queries`

```sql
CREATE TABLE public.tracked_queries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  query_text      TEXT NOT NULL,
  query_category  TEXT,
  target_url      TEXT,
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_scanned_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tracked_queries_user_id ON tracked_queries(user_id);
CREATE INDEX idx_tracked_queries_business_id ON tracked_queries(business_id);
CREATE INDEX idx_tracked_queries_active ON tracked_queries(is_active) WHERE is_active = TRUE;
```

#### 2.4 `scan_results`

Parent record for a point-in-time check of a query across all LLMs.

```sql
CREATE TABLE public.scan_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id        UUID NOT NULL REFERENCES tracked_queries(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  scan_type       TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (scan_type IN ('initial', 'scheduled', 'manual', 'free')),
  overall_score   NUMERIC(4,2),
  mention_count   INTEGER NOT NULL DEFAULT 0,
  avg_position    NUMERIC(4,2),
  scanned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scan_results_query_id ON scan_results(query_id);
CREATE INDEX idx_scan_results_user_id ON scan_results(user_id);
CREATE INDEX idx_scan_results_scanned_at ON scan_results(scanned_at DESC);
CREATE INDEX idx_scan_results_composite ON scan_results(query_id, scanned_at DESC);
```

#### 2.5 `scan_result_details`

Per-LLM breakdown for each scan.

```sql
CREATE TYPE llm_provider AS ENUM (
  'chatgpt', 'claude', 'perplexity', 'gemini', 'google_ai_overviews'
);

CREATE TYPE mention_sentiment AS ENUM ('positive', 'neutral', 'negative');

CREATE TABLE public.scan_result_details (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_result_id      UUID NOT NULL REFERENCES scan_results(id) ON DELETE CASCADE,
  llm_provider        llm_provider NOT NULL,
  is_mentioned        BOOLEAN NOT NULL DEFAULT FALSE,
  mention_position    INTEGER,
  mention_context     TEXT,
  sentiment           mention_sentiment,
  competitors_mentioned JSONB DEFAULT '[]'::jsonb,
  full_response_hash  TEXT,
  response_summary    TEXT,
  raw_prompt_used     TEXT,
  token_usage         JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scan_details_scan_id ON scan_result_details(scan_result_id);
CREATE INDEX idx_scan_details_provider ON scan_result_details(llm_provider);
CREATE INDEX idx_scan_details_composite ON scan_result_details(scan_result_id, llm_provider);
```

#### 2.6 `recommendations`

```sql
CREATE TABLE public.recommendations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  query_id            UUID REFERENCES tracked_queries(id) ON DELETE SET NULL,
  recommendation_type TEXT NOT NULL
    CHECK (recommendation_type IN (
      'content_gap', 'schema_markup', 'faq_addition',
      'competitor_insight', 'review_improvement', 'social_strategy',
      'technical_optimization', 'keyword_optimization'
    )),
  priority            TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  action_items        JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_impact     TEXT CHECK (expected_impact IN ('high', 'medium', 'low')),
  supporting_data     JSONB DEFAULT '{}'::jsonb,
  agent_type          TEXT,
  credits_cost        INTEGER,
  status              TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_progress', 'completed', 'dismissed')),
  dismissed_at        TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_business_id ON recommendations(business_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
```

#### 2.7 `agent_executions`

```sql
CREATE TABLE public.agent_executions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id         UUID REFERENCES businesses(id) ON DELETE SET NULL,
  agent_type          TEXT NOT NULL
    CHECK (agent_type IN (
      'content_writer', 'blog_writer', 'review_analyzer',
      'schema_optimizer', 'recommendations', 'social_strategy',
      'competitor_research', 'query_researcher', 'initial_analysis',
      'free_scan'
    )),
  status              TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_data          JSONB NOT NULL,
  output_data         JSONB,
  error_message       TEXT,
  credits_charged     INTEGER DEFAULT 0,
  total_cost_usd      NUMERIC(8,4),
  llm_calls           JSONB DEFAULT '[]'::jsonb,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  execution_duration_ms INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_executions_user_id ON agent_executions(user_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_type ON agent_executions(agent_type);
CREATE INDEX idx_agent_executions_created ON agent_executions(created_at DESC);
```

#### 2.8 `content_generations`

```sql
CREATE TABLE public.content_generations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id        UUID NOT NULL REFERENCES agent_executions(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id         UUID REFERENCES businesses(id) ON DELETE SET NULL,
  content_type        TEXT NOT NULL
    CHECK (content_type IN (
      'blog_post', 'article', 'faq', 'product_description',
      'landing_page', 'schema_markup', 'social_post', 'review_response'
    )),
  title               TEXT,
  generated_content   TEXT NOT NULL,
  content_format      TEXT NOT NULL DEFAULT 'markdown'
    CHECK (content_format IN ('markdown', 'html', 'json', 'json-ld')),
  word_count          INTEGER,
  quality_score       NUMERIC(3,2),
  llm_optimization_score INTEGER,
  is_favorited        BOOLEAN NOT NULL DEFAULT FALSE,
  user_rating         INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback       TEXT,
  metadata            JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_gen_user_id ON content_generations(user_id);
CREATE INDEX idx_content_gen_execution ON content_generations(execution_id);
CREATE INDEX idx_content_gen_type ON content_generations(content_type);
CREATE INDEX idx_content_gen_favorited ON content_generations(is_favorited) WHERE is_favorited = TRUE;
```

#### 2.9 `agent_outputs`

Generic output store for non-content agent results.

```sql
CREATE TABLE public.agent_outputs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id        UUID NOT NULL REFERENCES agent_executions(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  output_type         TEXT NOT NULL
    CHECK (output_type IN (
      'competitor_report', 'query_suggestions', 'review_analysis',
      'social_strategy', 'schema_recommendations'
    )),
  title               TEXT,
  structured_data     JSONB NOT NULL,
  summary             TEXT,
  is_favorited        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_outputs_user_id ON agent_outputs(user_id);
CREATE INDEX idx_agent_outputs_execution ON agent_outputs(execution_id);
CREATE INDEX idx_agent_outputs_type ON agent_outputs(output_type);
```

#### 2.10 `subscriptions`

```sql
CREATE TABLE public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paddle_customer_id      TEXT UNIQUE,
  paddle_subscription_id  TEXT UNIQUE,
  plan_tier               TEXT NOT NULL
    CHECK (plan_tier IN ('free', 'starter', 'pro', 'enterprise')),
  status                  TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  trial_end               TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle_customer ON subscriptions(paddle_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### 2.11 `plans`

```sql
CREATE TABLE public.plans (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  monthly_credits     INTEGER NOT NULL,
  max_queries         INTEGER NOT NULL,
  max_businesses      INTEGER NOT NULL DEFAULT 1,
  max_competitors     INTEGER NOT NULL DEFAULT 0,
  llm_providers       JSONB NOT NULL,
  features            JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_monthly_usd   NUMERIC(8,2),
  price_annual_usd    NUMERIC(8,2),
  paddle_price_monthly TEXT,
  paddle_price_annual  TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO plans VALUES
('free', 'Free', 0, 0, 1, 0, '["chatgpt","claude","perplexity","gemini"]', '["free_scan"]', 0, NULL, NULL, NULL, TRUE, NOW()),
('starter', 'Starter', 100, 10, 1, 3, '["chatgpt","claude","perplexity","gemini"]', '["content_writer","query_researcher","recommendations"]', 49, 470, NULL, NULL, TRUE, NOW()),
('pro', 'Professional', 500, 25, 3, 10, '["chatgpt","claude","perplexity","gemini","google_ai_overviews"]', '["all_agents","competitor_tracking","priority_support"]', 199, 1910, NULL, NULL, TRUE, NOW()),
('enterprise', 'Enterprise', 2000, -1, -1, -1, '["chatgpt","claude","perplexity","gemini","google_ai_overviews"]', '["all_agents","api_access","white_label","dedicated_support"]', 799, 7670, NULL, NULL, TRUE, NOW());
```

#### 2.12 `credits` and `credit_transactions`

```sql
CREATE TABLE public.credits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_credits       INTEGER NOT NULL DEFAULT 0 CHECK (total_credits >= 0),
  monthly_allocation  INTEGER NOT NULL DEFAULT 0,
  rollover_credits    INTEGER NOT NULL DEFAULT 0,
  bonus_credits       INTEGER NOT NULL DEFAULT 0,
  last_reset_date     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.credit_transactions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type        TEXT NOT NULL
    CHECK (transaction_type IN ('debit', 'credit', 'monthly_allocation', 'bonus', 'rollover', 'refund')),
  amount                  INTEGER NOT NULL,
  balance_after           INTEGER NOT NULL,
  related_entity_type     TEXT,
  related_entity_id       UUID,
  description             TEXT,
  metadata                JSONB DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_tx_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_tx_created ON credit_transactions(created_at DESC);
```

#### 2.13 `competitors`

```sql
CREATE TABLE public.competitors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  domain              TEXT,
  description         TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 2.14 `free_scans`

```sql
CREATE TABLE public.free_scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_token      TEXT UNIQUE NOT NULL,
  website_url     TEXT NOT NULL,
  business_name   TEXT NOT NULL,
  sector          TEXT NOT NULL,
  location        TEXT NOT NULL,
  ip_address      INET,
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  overall_score   NUMERIC(4,2),
  results_data    JSONB,
  converted_user_id UUID REFERENCES users(id),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '14 days',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_free_scans_token ON free_scans(scan_token);
CREATE INDEX idx_free_scans_ip ON free_scans(ip_address);
```

### Database Functions

**`deduct_credits`** -- Safely deducts credits with row locking and transaction logging:

```sql
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID, p_amount INTEGER, p_entity_type TEXT,
  p_entity_id UUID, p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_balance INTEGER; v_new INTEGER;
BEGIN
  SELECT total_credits INTO v_balance FROM credits WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_amount THEN RETURN FALSE; END IF;
  v_new := v_balance - p_amount;
  UPDATE credits SET total_credits = v_new, updated_at = NOW() WHERE user_id = p_user_id;
  INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_after, related_entity_type, related_entity_id, description)
  VALUES (p_user_id, 'debit', -p_amount, v_new, p_entity_type, p_entity_id, p_description);
  RETURN TRUE;
END; $$;
```

**`allocate_monthly_credits`** -- Monthly reset with 20% rollover (capped at 50% of allocation):

```sql
CREATE OR REPLACE FUNCTION allocate_monthly_credits(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_tier TEXT; v_alloc INTEGER; v_current INTEGER; v_rollover INTEGER; v_new INTEGER;
BEGIN
  SELECT plan_tier INTO v_tier FROM subscriptions WHERE user_id = p_user_id AND status IN ('active','trialing');
  IF v_tier IS NULL THEN RETURN; END IF;
  SELECT monthly_credits INTO v_alloc FROM plans WHERE id = v_tier;
  SELECT total_credits INTO v_current FROM credits WHERE user_id = p_user_id FOR UPDATE;
  v_rollover := LEAST(FLOOR(v_current * 0.2), FLOOR(v_alloc * 0.5));
  v_new := v_alloc + v_rollover;
  UPDATE credits SET total_credits = v_new, monthly_allocation = v_alloc, rollover_credits = v_rollover, last_reset_date = NOW(), updated_at = NOW() WHERE user_id = p_user_id;
  INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_after, description) VALUES (p_user_id, 'monthly_allocation', v_new, v_new, FORMAT('Monthly: %s + rollover: %s', v_alloc, v_rollover));
END; $$;
```

**`handle_new_user`** -- Trigger on auth.users insert:

```sql
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name) VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.credits (user_id) VALUES (NEW.id);
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### RLS Policy Strategy

| Table | Model | SELECT | INSERT | UPDATE | DELETE |
|-------|-------|--------|--------|--------|--------|
| `users` | User-Owned | own | own | own | -- |
| `businesses` | User-Owned | own | own | own | own |
| `tracked_queries` | User-Owned | own | own | own | own |
| `scan_results` | Service-Write | own | service | -- | -- |
| `scan_result_details` | Service-Write | via join | service | -- | -- |
| `recommendations` | Mixed | own | service | own (status only) | -- |
| `agent_executions` | Service-Write | own | service | service | -- |
| `content_generations` | Mixed | own | service | own (rating/fav) | own |
| `agent_outputs` | Mixed | own | service | own (fav) | own |
| `subscriptions` | Service-Write | own | service | service | -- |
| `credits` | Service-Write | own | service | service | -- |
| `credit_transactions` | Service-Write | own | service | -- | -- |
| `competitors` | User-Owned | own | own | own | own |
| `plans` | Public-Read | all | service | service | -- |
| `free_scans` | No RLS | -- | -- | -- | -- |

"own" = `auth.uid() = user_id`, "service" = service role only, "all" = `TRUE`

---

## 3. AI Agent Architecture

### Agent Overview

| Agent | Credits | LLMs Used | Avg Time | Output |
|-------|---------|-----------|----------|--------|
| Content Writer | 3 | Perplexity + Claude Sonnet + GPT-4o | 2-5 min | Markdown article |
| Blog Writer | 3 | Perplexity + Claude Sonnet + GPT-4o | 3-6 min | Long-form blog post |
| Review Analyzer | 2 | Perplexity + Claude Sonnet | 1-2 min | Analysis report (JSONB) |
| Schema Optimizer | 2 | Perplexity + Claude Sonnet | 1-2 min | JSON-LD markup |
| Recommendations | 0 (system) | Claude Sonnet | 1-3 min | Recommendation records |
| Social Strategy | 2 | Perplexity + Claude Sonnet | 2-3 min | Content calendar (JSONB) |
| Competitor Research | 5 | All 4 LLMs + Claude Sonnet | 3-5 min | Intelligence report |
| Query Researcher | 2 | Perplexity + GPT-4o | 1-2 min | Suggested queries list |

### Content Writer Agent -- Detailed Pipeline

| Step | LLM | Model | Why | Temp | Max Tokens |
|------|-----|-------|-----|------|------------|
| 1. Research | Perplexity | sonar-pro | Real-time web data + citations | 0.5 | 1500 |
| 2. Outline | Claude | claude-sonnet-4-5-20250929 | Strong structural reasoning | 0.7 | 2000 |
| 3. Write | Claude | claude-sonnet-4-5-20250929 | Best long-form quality per dollar | 0.7 | 4000 |
| 4. QA | OpenAI | gpt-4o | Fast cheap validation | 0.3 | 1000 |


---

## System Design Validation

# System Design Validation — Completeness Checklist

> **Author:** Rex (Research Analyst)
> **Date:** March 4, 2026
> **Purpose:** Ensure the rewritten system design closes every gap identified in `_GAP_ANALYSIS_CTO.md` and achieves competitive parity where needed
> **Sources:** `_GAP_ANALYSIS_CTO.md`, `COMPETITIVE_FEATURES_BLUEPRINT.md`, `_RESEARCH_SYNTHESIS.md`, `ENGINEERING_PLAN.md`, `BEAMIX_PRODUCT_SYSTEM.md`
> **Method:** Every item sourced to specific competitor evidence. No assumptions presented as facts.

---

## 1. Gap Closure Checklist

Every PARTIAL or MISSING item from the CTO gap analysis. The new system design must address each one.

### 1.1 PARTIAL Items (7 total)

---

#### GAP-P1: Multi-Engine Monitoring (10+ engines)

- **CTO Status:** PARTIAL
- **What was missing:** Only 7 engines in Phase 1. Browser simulation deferred with no concrete spec. Missing: Meta AI, AI Overviews (browser-only), Copilot, Mistral, Amazon Rufus.
- **What the new system design MUST include:**
  - Concrete engine adapter roadmap: Phase 1 (4 API engines), Phase 2 (8 engines with browser sim spec), Phase 3 (10+ all engines)
  - Playwright infrastructure specification (headless browser pool, anti-bot strategy, proxy rotation)
  - Per-engine adapter spec for browser-only engines (Copilot, AI Overviews, AI Mode)
- **Owning layer:** Architecture
- **Validation criteria:** The system design contains a named engine adapter for each of the 10+ engines listed in BEAMIX_PRODUCT_SYSTEM.md (ChatGPT, Gemini, Perplexity, Claude, Grok, Copilot, Google AI Overviews, AI Mode, Meta AI, DeepSeek), with method (API/browser) and phase assignment for each.

---

#### GAP-P2: Source-Level Citation Tracking

- **CTO Status:** PARTIAL
- **What was missing:** Citations extracted in parsing but no dedicated source-level UI component. No URL-level attribution dashboard.
- **What the new system design MUST include:**
  - Data model: `citation_sources` table or JSONB structure storing exact URLs, domains, and page titles AI cites
  - API endpoint: `GET /api/citations?business_id=X` returning source-level citation data
  - Dashboard component spec: citation sources view (inspired by Airefs)
- **Owning layer:** Architecture (data model + API), Product (dashboard component)
- **Validation criteria:** A dedicated citation tracking data structure exists, an API endpoint serves it, and a dashboard view displays "these specific URLs were cited instead of you."
- **Competitor reference:** Airefs (source-level URLs at $24/mo), Profound, Writesonic, RankPrompt

---

#### GAP-P3: Sentiment Scoring (0-100 scale)

- **CTO Status:** PARTIAL
- **What was missing:** Captured as enum ('positive'/'neutral'/'negative'), not as 0-100 numeric scale.
- **What the new system design MUST include:**
  - Parser output type change: `sentiment_score: number` (0-100) alongside `sentiment_label: 'positive' | 'neutral' | 'negative'`
  - Scoring methodology: LLM-based analysis using keywords (e.g., "reliable", "leading" = high; "problematic", "avoid" = low)
  - Dashboard display: per-engine sentiment score with trend over time
- **Owning layer:** Intelligence (scoring logic), Architecture (data model)
- **Validation criteria:** Scan results contain a numeric 0-100 sentiment score per engine per prompt. Dashboard shows sentiment trends.
- **Competitor reference:** Peec (0-100 scale), SE Visible, Goodie, AthenaHQ, Writesonic, Scrunch, Spotlight (7/15 competitors)

---

#### GAP-P4: Revenue Attribution (beyond referral detection)

- **CTO Status:** PARTIAL
- **What was missing:** GA4 integration covers referral domain detection only. No conversion/revenue tracking pipeline. No e-commerce integration.
- **What the new system design MUST include:**
  - GA4 deep integration: referral domain detection + event tracking (conversions, goals)
  - Attribution pipeline: AI visibility change --> traffic change --> conversion change correlation
  - Dashboard: "AI Impact" widget showing traffic and conversion trends from AI sources
  - Note: Revenue attribution (actual dollar values) deferred to Phase 4 with Shopify/e-commerce. Phase 2-3 focuses on traffic + conversion correlation.
- **Owning layer:** Architecture (GA4 integration), Product (attribution dashboard)
- **Validation criteria:** GA4 integration spec includes conversion/goal tracking, not just referral identification. Dashboard shows correlation between visibility changes and traffic/conversion changes.
- **Competitor reference:** AthenaHQ (Shopify + GA4 --> revenue), Goodie (AI sessions --> conversions --> revenue), Bear AI

---

#### GAP-P5: Content Type Variety

- **CTO Status:** PARTIAL
- **What was missing:** Agent output is generic "content" -- no typed templates. RankPrompt ships 6 distinct content types.
- **What the new system design MUST include:**
  - Content type template system with at least 6 types: (1) Comparison articles, (2) Ranked lists, (3) Location pages, (4) Case studies, (5) Product deep-dives, (6) FAQ pages
  - Each type has a distinct prompt template, output structure, and optimization strategy
  - Content type selection in agent launch UI
  - `content_type` field in content_items table
- **Owning layer:** Intelligence (prompt templates), Product (UI for type selection)
- **Validation criteria:** Agent system supports >= 6 named content types with distinct templates. Content library can filter by type.
- **Competitor reference:** RankPrompt (6 types at $29/mo), Writesonic (blogs, ads, social, landing pages)

---

#### GAP-P6: Multi-Language/Multi-Region

- **CTO Status:** PARTIAL
- **What was missing:** EN/HE prompt support exists, but no multi-region scanning concept (different geolocations), no per-country visibility breakdown.
- **What the new system design MUST include:**
  - Phase 1: Dual-language prompts (EN/HE) -- already designed
  - Phase 2: Multi-city scanning for Israel (Tel Aviv, Haifa, Jerusalem, Be'er Sheva) using location-aware prompts
  - Phase 3: Geographic proxy infrastructure for international scanning (VPN/proxy-based geolocation)
  - Data model: `scan_region` field in scan_results
- **Owning layer:** Architecture (proxy infrastructure), Intelligence (location-aware prompts)
- **Validation criteria:** System design includes a regional scanning concept with at least multi-city support for Israel in Phase 2 and international proxy scanning in Phase 3.
- **Competitor reference:** Goodie (multi-country), Peec (115+ languages, regional tracking), Profound (10 countries), RankPrompt (multi-region in all plans)

---

#### GAP-P7: GA4/GSC Integration Completeness

- **CTO Status:** PARTIAL
- **What was missing:** GA4 is designed. GSC is listed in schema but has ZERO implementation specification.
- **What the new system design MUST include:**
  - GSC integration spec: OAuth flow, data pull (keyword rankings, CTR, indexed pages, crawl data)
  - Data correlation: traditional search keywords --> AI prompt suggestions ("you rank #3 for 'best lawyer Tel Aviv' in Google -- track this as an AI prompt")
  - Phase assignment: GSC as Phase 3 (after GA4)
- **Owning layer:** Architecture (OAuth + data pipeline)
- **Validation criteria:** GSC integration has a concrete specification (not just a schema column), including OAuth flow and data mapping.
- **Competitor reference:** AthenaHQ, Gauge, Goodie (3/15 competitors offer GSC)

---

### 1.2 MISSING Items (7 total)

---

#### GAP-M1: Proprietary Prompt Volume Data / Trending Topics

- **CTO Status:** MISSING -- "the single largest data gap"
- **What was missing:** Zero concept of prompt volume estimation, trending topics, or conversation volume data.
- **What the new system design MUST include:**
  - **Aggregate data pipeline:** Anonymize and aggregate scan data across all Beamix users to build relative prompt volume estimates
  - **Trending topics detection:** Identify prompts with rising mention frequency across the platform
  - **Dashboard component:** "Trending in your industry" widget showing estimated prompt importance
  - **Privacy design:** All aggregation is anonymous -- no cross-user data leakage, no PII
  - **Scale threshold:** Feature becomes useful at ~500+ businesses scanning regularly. Until then, show curated industry prompt lists.
  - **Data model:** `prompt_analytics` table or materialized view aggregating prompt frequency across scans
- **Owning layer:** Intelligence (aggregation logic), Architecture (pipeline + data model), Product (dashboard widget)
- **Validation criteria:** System design includes a prompt volume estimation pipeline spec, privacy safeguards, and a dashboard display component.
- **Competitor reference:** Profound (130M real conversations -- unreachable for Beamix), Writesonic (120M), Ahrefs (190M prompts), Gauge (keyword-to-prompt mapping), Spotlight
- **Realistic note:** Beamix cannot match Profound's 130M conversation panel. The design should specify an honest "estimated relative volume" approach, not claim parity with proprietary datasets.

---

#### GAP-M2: Content Pattern Analysis Engine

- **CTO Status:** MISSING
- **What was missing:** No analysis of what structural/tonal patterns make top-cited content successful. Agents generate content based on research but do not learn from citation-winning patterns.
- **What the new system design MUST include:**
  - Analysis step in content agent pipeline: "Before generating, analyze top 5 cited pages for this topic"
  - Pattern extraction: structure (H2/H3 depth), length, tone, format, FAQ presence, citation density
  - Pattern application: feed extracted patterns into content generation prompts
  - Storage: `content_patterns` cache (per industry/topic, refreshed monthly)
- **Owning layer:** Intelligence
- **Validation criteria:** Content agent pipeline includes a pre-generation analysis step that examines top-cited content and extracts structural patterns. These patterns are injected into the generation prompt.
- **Competitor reference:** Spotlight (content pattern analysis is their key differentiator)

---

#### GAP-M3: Persona-Based Visibility Views

- **CTO Status:** MISSING
- **What was missing:** No persona concept in data model or dashboard. Different buyer personas see different AI responses.
- **What the new system design MUST include:**
  - This feature is correctly deferred to Phase 4 (enterprise). The system design should acknowledge it as a future capability and include the data model extensibility note (persona_id FK on tracked_queries).
  - NOT required for launch or growth phase.
- **Owning layer:** Product (future)
- **Validation criteria:** System design acknowledges persona tracking as a Phase 4 item and notes the extensibility approach (persona as a query dimension).
- **Competitor reference:** Scrunch (only 1/15 competitors has this)

---

#### GAP-M4: Customer Journey Stage Mapping

- **CTO Status:** MISSING
- **What was missing:** No funnel stage concept (awareness --> consideration --> decision).
- **What the new system design MUST include:**
  - Like GAP-M3, correctly deferred to Phase 4. System design should note it as future capability.
  - Lightweight implementation note: map prompts to journey stages via LLM classification (informational = awareness, comparative = consideration, transactional = decision).
- **Owning layer:** Intelligence (future)
- **Validation criteria:** System design acknowledges journey stage mapping as a future capability with a brief implementation approach.
- **Competitor reference:** Spotlight (only 1/15 competitors has this)

---

#### GAP-M5: Brand Narrative Analysis

- **CTO Status:** MISSING
- **What was missing:** No concept of analyzing WHY AI says what it says about a brand. Only tracks WHAT (mentions, position).
- **What the new system design MUST include:**
  - Phase 3 feature: add an LLM analysis step post-scan that summarizes the "brand narrative" -- what themes AI associates with this brand, what positioning AI assigns
  - Output: "AI perceives your brand as [X] because [Y]. Your competitors are positioned as [Z]."
  - Dashboard: "Brand Narrative" card showing AI perception summary
- **Owning layer:** Intelligence (LLM analysis), Product (dashboard component)
- **Validation criteria:** System design includes a brand narrative analysis concept, even if deferred to Phase 3.
- **Competitor reference:** AthenaHQ ACE (brand narrative analysis), Spotlight (brand reputation scoring) -- only 2/15 competitors

---

#### GAP-M6: Looker Studio Connector

- **CTO Status:** MISSING
- **What was missing:** Zero mention in original engineering plan. 3 competitors offer it.
- **What the new system design MUST include:**
  - Acknowledged in Phase 4 roadmap as an agency/enterprise feature
  - Implementation note: Looker Studio Community Connector using Google Apps Script pulling from Beamix Public API
  - Dependencies: requires Public API (Phase 4) to be built first
- **Owning layer:** Architecture (Phase 4)
- **Validation criteria:** Looker Studio connector appears in the Phase 4 roadmap with a brief implementation approach.
- **Competitor reference:** Otterly, SE Visible, Peec (3/15 competitors)

---

#### GAP-M7: White-Label Agency Mode

- **CTO Status:** MISSING
- **What was missing:** No multi-workspace concept, no custom branding on reports, no agency management.
- **What the new system design MUST include:**
  - Phase 4 feature: multi-workspace data model (workspaces table, workspace_members, workspace_businesses)
  - White-label reports: PDF export with custom branding (logo, colors, contact info)
  - Not required for launch. Correctly deferred.
- **Owning layer:** Product (Phase 4), Architecture (data model extensibility)
- **Validation criteria:** System design includes multi-workspace/agency as a Phase 4 item with data model notes.
- **Competitor reference:** Otterly (workspaces + white-label), RankPrompt (white-label reports)

---

### 1.3 Additional MISSING Items from Master Feature Matrix

These were identified in the CTO gap analysis master matrix but not in the top-7 MISSING list.

---

#### GAP-M8: AI Site Optimization (AXP-like)

- **CTO Status:** MISSING
- **What was missing:** No concept of generating an AI-optimized version of a site.
- **Required:** Deferred correctly. Phase 4+ or skip entirely. Only Scrunch (1/15) has this.
- **Owning layer:** Architecture (future)
- **Validation criteria:** Acknowledged as future/skip with reasoning. Not required for any phase before Phase 4.

---

#### GAP-M9: E-Commerce / Shopify Integration

- **CTO Status:** MISSING
- **What was missing:** No product-level AI visibility tracking. No Shopify integration.
- **Required:** Phase 4 or skip. AthenaHQ is the only competitor with Shopify. Beamix targets service SMBs, not e-commerce.
- **Owning layer:** Architecture (future)
- **Validation criteria:** Acknowledged as Phase 4 with note that target persona is service SMBs.

---

#### GAP-M10: Multi-Surface Monitoring (YouTube/TikTok/Reddit)

- **CTO Status:** MISSING
- **What was missing:** Only Ahrefs has this. Orthogonal to core GEO value proposition.
- **Required:** Skip. Only 1/15 competitors. Outside core value prop.
- **Validation criteria:** Explicitly listed as "Skip" with reasoning.

---

#### GAP-M11: Agent Workflows / Event-Triggered Chains

- **CTO Status:** Identified in Section 3 (Agent Architecture Gaps)
- **What was missing:** All agents are individually triggered. No concept of automated multi-agent workflows (e.g., visibility drop --> audit --> draft --> review --> publish).
- **What the new system design MUST include:**
  - Event-driven workflow system using Inngest event chains (infrastructure already exists)
  - At least 3 built-in workflow templates: (1) Visibility drop --> auto-audit, (2) New scan --> recommendations --> agent suggestion, (3) Content published --> track impact --> re-scan
  - Custom workflow builder: Phase 3
- **Owning layer:** Architecture (Inngest event chains), Product (workflow UI)
- **Validation criteria:** System design specifies at least 2-3 event-triggered automation workflows using Inngest. Not all agents manual.
- **Competitor reference:** Profound Workflows (trigger-based automation chains)

---

#### GAP-M12: Recurring Agent Execution / Content Refresh

- **CTO Status:** Identified in Section 3 (Agent Architecture Gaps)
- **What was missing:** All agents are one-shot. No concept of "re-run this agent monthly on all published content."
- **What the new system design MUST include:**
  - Recurring agent execution concept: schedule agent re-runs on published content
  - Content freshness scoring: flag stale content for re-optimization
  - Implementation: Inngest cron-triggered agent runs with content library as input
- **Owning layer:** Intelligence (freshness scoring), Architecture (cron scheduling)
- **Validation criteria:** System design includes a recurring agent execution concept with scheduling.
- **Competitor reference:** Profound (scheduled monthly/weekly content audits), Goodie (content refresh)

---

#### GAP-M13: Content Performance Tracking

- **CTO Status:** MISSING from dashboard
- **What was missing:** No dashboard showing how generated content impacts visibility over time.
- **What the new system design MUST include:**
  - Content impact correlation: link `content_items.published_at` to `scan_results` changes after publication
  - Dashboard widget: "Content Impact" showing visibility delta after each content publication
  - Closes the loop: scan --> agent creates content --> content published --> visibility changes tracked
- **Owning layer:** Product (dashboard widget), Architecture (correlation query)
- **Validation criteria:** A content performance tracking concept exists that correlates content publication dates with subsequent visibility changes.
- **Competitor reference:** Bear AI, Gauge, Goodie, Spotlight (4/15 competitors)

---

#### GAP-M14: Content Voice Training

- **CTO Status:** Listed as PARTIAL (one-liner in Phase 6, no specification)
- **What was missing:** Zero pipeline specification, no data collection strategy, no training approach.
- **What the new system design MUST include:**
  - Voice sample collection: user pastes 2-3 existing website pages or blog posts during onboarding or settings
  - Voice extraction: LLM analyzes samples for tone, vocabulary, sentence structure, formality level
  - Voice profile storage: `brand_voice_profiles` table with extracted characteristics
  - Injection: voice profile injected into all content agent system prompts
  - Phase assignment: Phase 3 (not MVP)
- **Owning layer:** Intelligence (voice extraction + injection), Product (voice sample UI)
- **Validation criteria:** Content voice training has a concrete pipeline: sample collection --> extraction --> storage --> injection. Not just a one-liner.
- **Competitor reference:** Goodie AI "Author Stamp" (trains voice into content output)

---

## 2. Competitive Feature Parity Matrix

Every feature from the competitive blueprint, assessed for Beamix inclusion.

### MONITORING

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| Brand Mention Tracking | 15/15 | Yes -- P0 | Table stakes. Already built. |
| Daily Auto Monitoring | 13/15 | Yes -- P0 | Table stakes. Inngest cron already designed. |
| Multi-Engine (4+ engines) | 15/15 | Yes -- P0 | 4 at launch, 8+ by Phase 2, 10+ Phase 3. |
| Prompt Volume Data | 5/15 (Profound, Writesonic, Ahrefs, Gauge, Spotlight) | Yes -- Phase 3 | Cannot match proprietary datasets, but aggregate estimation is competitively necessary for query prioritization. |
| Prompt Auto-Suggestions | 3/15 (Peec, SE Visible, Gauge) | Yes -- Growth Phase | Nice-to-have, not launch-blocking. Auto-suggest based on industry + website content. |
| Near Real-Time Monitoring | 1/15 (RankPrompt: 15-30 min) | No -- Skip | Resource-intensive. Daily/3-day scans sufficient for SMBs. Not worth the infrastructure cost. |

### ANALYSIS

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| Sentiment Analysis (0-100) | 7/15 | Yes -- P1 | Nearly half of competitors have this. Finer granularity drives urgency and trend analysis. Low effort change. |
| Citation/Source Tracking | 11/15 | Yes -- P1 | Widely available. Data already captured; needs dedicated UI. |
| Source-Level URLs | 2/15 (Airefs, RankPrompt) | Yes -- P2 | Highly actionable: "this exact article is cited instead of you." Differentiating at SMB price. |
| Share of Voice | 14/15 | Yes -- P0 | Table stakes. Already designed in Phase 4. |
| Competitor Benchmarking | 15/15 | Yes -- P0 | Table stakes. Already designed. |
| Regional/Multi-Language | 5/15 (Profound, Goodie, Peec, Airefs, RankPrompt) | Yes -- Phase 2 | Essential for Hebrew-first positioning and Israeli multi-city tracking. |
| Brand Narrative Analysis | 2/15 (AthenaHQ ACE, Spotlight) | Yes -- Phase 3 | Differentiating intelligence. Adds "why" to "what." Only 2 competitors, both expensive. |
| Persona-Based Tracking | 1/15 (Scrunch) | No -- Phase 4 | Only one competitor. Data Model CLOSED — Pipeline Integration DEFERRED. `personas` table exists. Scan pipeline does not query or use personas at launch. Full integration is Phase 4. |
| Customer Journey Stages | 1/15 (Spotlight) | No -- Phase 4 | Only one competitor. SPEC ONLY — Phase 4 Implementation. Data model and classification logic fully designed in Intelligence Layer. Pipeline integration deferred to Phase 4. No `journey_stage` column on `scan_results` at launch. |

### CONTENT & AGENTS

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| Content Generation | 7/15 (Profound, Gauge, Writesonic, Bear, Goodie, Spotlight, RankPrompt) | Yes -- P0 | Core differentiator. Already built. |
| AI Agents (Autonomous) | 3/15 (Profound, Bear, Gauge) | Yes -- P0 | Beamix's #1 competitive advantage. Most comprehensive interactive autonomous agent suite with streaming chat UX under $100/month. (Note: Verify RankPrompt current pricing — as of research date they offered content generation + WP publishing at $29/month. Beamix differentiator is interactive streaming agent chat + multi-agent workflows, not just content generation.) |
| CMS Auto-Publish (WordPress) | 6/15 | Yes -- Build tier (Phase 2) | High impact. Eliminates copy-paste friction. 40%+ of websites are WordPress. Gated to Build tier (not Scale). |
| PR/Outreach Automation | 1/15 (Bear AI) | Yes -- Phase 3 | High SMB value (can't afford PR agencies). Citation Builder agent already designed. |
| Content Type Variety (6+) | 2/15 (RankPrompt: 6 types, Writesonic: blogs/ads/social/landing) | Yes -- Phase 3 | RankPrompt offers this at $29. Must match at $79. |
| Content Voice Training | 1/15 (Goodie: Author Stamp) | Yes -- Phase 3 | Prevents generic-sounding output. High perceived value. |
| Content Pattern Analysis | 1/15 (Spotlight) | Yes -- Phase 3 | Improves agent output quality. Competitive intelligence applied to content structure. |
| Schema Recommendations | 2/15 (Goodie, RankPrompt) | Yes -- P0 | Already built (Schema Optimizer agent). |
| LLMS.txt Support | 1/15 (Bear AI) | Yes -- P1 | Already designed. Low effort, high perceived value. |
| Agent Workflows | 1/15 (Profound) | Yes -- Phase 3 | Event-triggered chains are a natural extension of Inngest architecture. |
| Recurring Agent Execution | 2/15 (Profound, Goodie) | Yes -- Phase 3 | Content freshness matters. Scheduled re-optimization. |
| Editorial Queue / Review | 1/15 (Profound) | MVP: Self-Review Queue | MVP: single-user approve/reject via `in_review` status. Multi-person editorial deferred to agency tier (Phase 4). |

### TECHNICAL

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| AI Crawler Detection | 3/15 (Writesonic, Scrunch, AthenaHQ) | Yes -- Phase 3 | Already designed in Phase 9. Good "wow factor" dashboard feature. |
| AI Site Optimization (AXP) | 1/15 (Scrunch) | No -- Skip | Only one competitor. Extremely complex CDN-level infrastructure. Not SMB-relevant. |
| Website AI Readiness Audit | 4/15 (RankScale, Otterly, Scrunch, RankPrompt) | Yes -- P0 | Perfect for free scan. Already designed. |
| Content Comparison (orig vs optimized) | 1/15 (RankScale) | No -- Future | Nice-to-have. Not competitively necessary. |

### ATTRIBUTION

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| Revenue Attribution | 3/15 (AthenaHQ, Goodie, Bear) | Phase 3 (traffic correlation) / Phase 4 (revenue) | SMBs need to see ROI. Start with traffic correlation (GA4), add revenue in Phase 4. |
| E-Commerce Integration | 3/15 (AthenaHQ, Writesonic, Goodie) | No -- Phase 4 | Target is service SMBs, not e-commerce. Defer. |
| AI Traffic Identification | 4/15 (AthenaHQ, Writesonic, Bear, Scrunch) | Yes -- Phase 3 | Part of AI Crawler Detection. Shows AI bot visits. |

### INTEGRATIONS

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| WordPress | 6/15 | Yes -- Build tier (Phase 2) | Most important CMS integration. High demand. Moved from Scale to Build tier — 6 competitors offer it at lower tiers. |
| GA4 | 6/15 | Yes -- Phase 2 | Proves ROI. Widely expected. |
| GSC | 3/15 (AthenaHQ, Gauge, Goodie) | Yes -- Phase 3 | Enriches data. Keyword-to-prompt correlation. |
| Slack | 3/15 (Profound, AthenaHQ, Gauge) | Yes -- Phase 2 | Low effort. Pro+ feature. |
| Shopify | 1/15 (AthenaHQ) | No -- Phase 4 | Only one competitor. Niche. |
| Looker Studio | 3/15 (Otterly, SE Visible, Peec) | No -- Phase 4 | Agency feature. Not core SMB. |
| API Access | 3/15 (Profound, Peec, Airefs) | Yes -- Phase 4 | Scale tier. Already designed in Phase 10. |
| Contentful/Sanity | 1/15 (Profound) | No -- Skip | Enterprise headless CMS. Not our market. |
| Webflow | 1/15 (AthenaHQ) | No -- Skip | Low demand. Only one competitor. |
| CDN (Cloudflare/Vercel) | 3/15 | Yes -- Phase 3 | For crawler detection. Already designed in Phase 9. |

### REPORTING

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| White-Label Reports | 2/15 (Otterly, RankPrompt) | No -- Phase 4 | Agency feature. Not MVP. |
| Multi-Workspace/Agency | 3/15 (Profound, Otterly, RankPrompt) | No -- Phase 4 | Requires data model changes. Defer to enterprise. |
| YouTube/TikTok/Reddit Tracking | 2/15 (Ahrefs, Airefs-Reddit only) | No -- Skip | Outside core GEO. Ahrefs has infrastructure Beamix cannot match. |
| Free Scan/Trial | 3/15 (Otterly trial, Airefs trial, RankPrompt credits) | Yes -- P0 | Beamix's instant free scan is the strongest version in the market. Already built. |
| PDF/CSV Export | 5/15 | Yes -- Phase 2 | Scale tier. Standard expectation. |

---

## 3. Missing Connections

Cross-cutting concerns and data flows that require coordination between agents writing independently.

### 3.1 Data Flows That Cross Layers

| Flow | From | To | Risk If Missed |
|------|------|----|---------------|
| **Scan results --> Recommendations --> Agent triggers** | Architecture (scan pipeline) | Intelligence (recommendation logic) --> Product (agent launch UI) | Without this end-to-end flow, scan results are dead data. The "scan-to-fix pipeline" breaks. |
| **Content publication --> Visibility tracking --> Content performance** | Product (content library publish action) | Architecture (correlate content_items.published_at with subsequent scan_results) --> Product (content impact widget) | Without this, users cannot see ROI of agent-generated content. #1 cause of churn: "I paid for content but don't know if it helped." |
| **Agent output --> Content library --> WordPress publish** | Intelligence (agent generates content) | Product (content library stores it) --> Architecture (WordPress API integration pushes it) | If content lives only in agent chat output, the library is empty. If library doesn't connect to WordPress, manual copy-paste remains. |
| **GA4 traffic data --> Attribution dashboard --> Upgrade triggers** | Architecture (GA4 OAuth + data pull) | Product (attribution widget) --> Product (upgrade prompt when ROI proven) | GA4 data without an attribution display is wasted integration effort. |
| **Prompt volume aggregation --> Trending topics --> Prompt auto-suggestions** | Intelligence (aggregate pipeline) | Product (trending widget) --> Product (onboarding prompt suggestions) | These three features are interconnected. Prompt suggestions should factor in volume data when available. |
| **Voice training samples --> Voice profile --> Content agent prompts** | Product (settings UI for voice samples) | Intelligence (voice extraction) --> Intelligence (all content agent system prompts) | If voice profile is not injected into EVERY content agent, some agents produce brand-voiced content and others produce generic content. Inconsistency. |
| **Competitor scan data --> Share of Voice --> Gap Analysis --> Agent recommendations** | Architecture (competitor monitoring) | Product (SoV chart) --> Product (gap analysis view) --> Intelligence (recommendations agent) | Competitor data must flow through all three display layers AND into the recommendations engine. |

### 3.2 Features Requiring Cross-Layer Coordination

| Feature | Product Layer | Architecture Layer | Intelligence Layer | Coordination Note |
|---------|-------------|-------------------|-------------------|-------------------|
| **Content Performance Tracking** | Dashboard widget showing impact | Correlation query joining content_items + scan_results by date | None | Product needs to specify the time window for correlation (e.g., "compare visibility 7 days before and after publication"). Architecture needs the query. |
| **Agent Workflows** | Workflow templates UI, workflow builder (Phase 3) | Inngest event chain definitions, workflow state machine | Workflow triggers based on intelligence signals (visibility drop threshold) | The trigger conditions are intelligence decisions. The execution pipeline is architecture. The display is product. All three must align on the event schema. |
| **Prompt Volume Estimation** | "Trending" widget, prompt suggestion enhancement | Aggregation pipeline, privacy-safe materialized views | Statistical estimation methodology | Intelligence defines the estimation algorithm. Architecture builds the pipeline. Product displays it. The privacy model (no cross-user leakage) must be agreed. |
| **Brand Narrative Analysis** | "Brand Narrative" dashboard card | LLM call within scan pipeline (additional post-processing step) | Prompt engineering for narrative extraction | This is an additional LLM call per scan. Architecture owns the cost impact calculation. Intelligence owns the prompt. Product owns the display. |
| **Multi-Region Scanning** | Region selector in scan setup, per-region dashboard filter | Proxy infrastructure, scan_region field in data model | Location-aware prompt generation | Prompts change per region ("best lawyer Tel Aviv" vs "best lawyer Haifa"). Intelligence must generate region-specific prompts. Architecture must route scans through region-appropriate infrastructure. |

### 3.3 Edge Cases in User Journeys

| Journey | Edge Case | Which Layers Must Handle It |
|---------|-----------|---------------------------|
| **Free scan --> signup --> onboarding** | User scans, sees results, signs up 3 days later. Scan results must still be linkable to their new account. | Architecture (free_scans.scan_id must remain valid for 30 days), Product (onboarding must detect scan_id param and skip re-scan) |
| **Agent generates content --> user edits --> republishes** | User modifies agent output in content library editor. Voice training must NOT overwrite user edits on re-generation. | Product (editor must save user version separately), Intelligence (re-generation should offer "update" not "replace") |
| **Visibility drops --> automated workflow triggers --> user is on free tier** | Workflow triggers agent, but free tier has no AI Runs. System must not burn credits the user doesn't have. | Architecture (workflow pre-checks credit balance before triggering), Product (notify user: "visibility dropped, upgrade to auto-fix") |
| **Competitor is also a Beamix user** | User A tracks User B as competitor. User B tracks User A. Neither should see each other's dashboard data. | Architecture (RLS ensures competitor tracking reads only public scan data, never dashboard data) |
| **Content published to WordPress fails** | WordPress credentials expired or site is down. Content must not be marked as "published" if the push failed. | Architecture (WordPress adapter returns success/failure), Product (content status remains "Draft" on failure with retry option) |
| **Multiple agents running simultaneously** | User launches Blog Writer while Content Writer is still running. Credit holds must not double-charge. | Architecture (credit hold is per-job, not per-user-session. Each job independently holds/confirms/releases.) |

### 3.4 Integration Points Between Modules

| Module A | Module B | Integration Point | Risk |
|----------|----------|-------------------|------|
| Scan Engine | Agent System | Scan results as agent context | Agents must always receive the LATEST scan data, not stale cached data. |
| Agent System | Content Library | Agent output storage | Content must be stored in content_items immediately on agent completion, not only when user "saves." |
| Content Library | WordPress Integration | Content push | Content format (Markdown) must be compatible with WordPress block editor. Test with real WordPress instances. |
| Alert System | Agent Workflows | Visibility alerts triggering workflows | Alert deduplication must prevent workflow spam (don't trigger 5 workflows for 5 alert notifications about the same event). |
| Billing (Paddle) | Agent System | Credit enforcement | Paddle webhook delays can cause billing state desync. Use local credit tracking, not Paddle API for real-time credit checks. |
| GA4 Integration | Dashboard | Traffic attribution display | GA4 data has 24-48hr latency. Dashboard must show "data as of [date]" not imply real-time. |

---

## 4. Innovation Opportunities

8 features uniquely combined in Beamix — 5 genuinely novel, 3 with the most comprehensive implementation in the market. Ranked by feasibility and SMB value.

### Innovation 1: "Fix It" Button — One-Click Agent Trigger from Any Gap

**What it is:** Every dashboard view where a problem is identified (gap analysis, low sentiment, missing citation, competitor outranking) has a contextual "Fix It" button that launches the appropriate agent with pre-loaded context.

**Partial competitor equivalents:** Gauge's AI Analyst executes strategy from insights. AthenaHQ's Action Center drafts optimizations. However, neither integrates the trigger directly into every dashboard insight view with pre-loaded agent context — Beamix's implementation is the most comprehensive.

**Why Beamix can build it:** Agent system + dashboard are built by the same team in the same codebase. Cross-agent context sharing is already designed. Technical cost: routing logic to map gap type --> agent type.

**SMB value:** HIGH. Non-technical users see a problem and click one button to fix it. Eliminates "I see the problem, now what?" paralysis.

**Effort:** LOW. UI routing + context pre-loading. No new backend needed.

---

### Innovation 2: Agent Impact Scorecard — Prove ROI Per Agent Execution

**What it is:** After each agent creates content and it's published, Beamix tracks the visibility change and shows: "This blog post improved your ChatGPT visibility by +12 points."

**Partial competitor equivalents:** Bear AI tracks blog agent output performance. Gauge tracks content performance generally. However, neither attributes specific visibility changes to specific agent outputs at the per-content-piece level — Beamix provides the most granular attribution.

**Why Beamix can build it:** scan_results + content_items + timestamp correlation. Data already exists; needs a correlation query and display.

**SMB value:** VERY HIGH. Answers "was this $79/mo worth it?" with concrete data.

**Effort:** MEDIUM. Requires correlation logic accounting for confounding variables (other factors that changed visibility).

---

### Innovation 3: Hebrew Prompt Library — Industry-Specific AI Prompt Templates in Hebrew

**What it is:** Pre-built Hebrew prompt templates for Israeli industries (lawyers, restaurants, insurance, real estate, medical clinics, accountants). "מה הביטוח הכי טוב בתל אביב?" not just English translations.

**Why no competitor has it:** Zero competitors serve Hebrew. All prompt suggestions are English-only.

**Why Beamix can build it:** Hebrew-first positioning. Cultural knowledge of Israeli business landscape. Can be curated manually for launch (50-100 prompts across 10 industries), then expanded via AI.

**SMB value:** VERY HIGH for Israeli market. Removes the biggest friction: "what prompts should I track?"

**Effort:** LOW. Curated content, not engineering. Store in `prompt_templates` table.

---

### Innovation 4: Competitor Weakness Alerts — "Your Competitor Just Lost Visibility"

**What it is:** When a tracked competitor's AI visibility drops, Beamix alerts the user with a specific recommendation: "Your competitor dropped from #2 to #5 in ChatGPT for 'best insurance Tel Aviv.' This is your window. Run [Agent] to create content for this gap."

**Why no competitor has it:** Competitors track competitor visibility but don't alert on competitor DROPS as opportunities. All alerts are about YOUR changes, not theirs.

**Why Beamix can build it:** Already tracking competitor scan data. Already have alert system. Add a "competitor drop" alert type.

**SMB value:** HIGH. Turns competitor monitoring from passive to actionable.

**Effort:** LOW. New alert rule in existing alert engine.

---

### Innovation 5: AI Readiness Progress Tracker — Gamified Improvement Score

**What it is:** Track AI Readiness Score (0-100%) over time with a progress bar and achievement milestones. "You improved from 34% to 67% this month. Next milestone: 75% (add FAQ schema)."

**Why no competitor has it:** RankScale has the readiness score but no progress tracking or gamification. Score is a snapshot, not a journey.

**Why Beamix can build it:** AI Readiness Auditor already designed. Store historical scores. Add milestone definitions.

**SMB value:** HIGH. Gamification drives engagement. "Level up" psychology keeps users active.

**Effort:** LOW. Historical score storage + milestone definitions + progress bar UI.

---

### Innovation 6: Cross-Agent Memory — Agents That Remember Previous Conversations

**What it is:** When a user launches the Blog Writer for the second time, the agent remembers what it wrote before: "Last time I wrote about topic X. Want me to cover a related topic, or update the previous article?"

**Why no competitor has it:** All competitor agents treat each execution as independent. No session memory across runs.

**Why Beamix can build it:** Content library already stores all agent outputs. Inject previous outputs into agent context window. Cross-agent context sharing is already designed.

**SMB value:** HIGH. Prevents duplicate content. Creates a coherent content strategy over time.

**Effort:** MEDIUM. Context window management (previous outputs can be large -- need summarization).

---

### Innovation 7: "What Changed" Weekly Diff Report

**What it is:** Weekly email/dashboard showing a precise diff: "This week: +3 new mentions in ChatGPT, -1 mention in Perplexity. Competitor X gained 2 new citations from [URL]. Your blog post from Tuesday was cited for the first time by Gemini."

**Partial competitor equivalents:** Otterly generates reports with historical data. SE Visible has historical trend analysis. However, neither provides per-query, per-engine diffs with competitor context and content attribution at the granularity Beamix offers.

**Why Beamix can build it:** All data exists in scan_results, content_items, competitor tracking. Diff computation is a query.

**SMB value:** HIGH. SMBs don't log in daily. A precise weekly diff keeps them engaged and informed without dashboard fatigue.

**Effort:** MEDIUM. Diff computation + email template.

---

### Innovation 8: Agent Suggestion Engine — "You Should Run This Agent"

**What it is:** Based on scan results, proactively suggest which agent the user should run next. "Your FAQ content is weak (cited 0 times). Run the FAQ Agent to create optimized FAQ content. Estimated impact: +8 visibility points."

**Why no competitor has it:** Recommendations agents suggest actions, but don't estimate impact or connect directly to agent launches with pre-filled context.

**Why Beamix can build it:** Recommendations agent already generates prioritized actions. Add impact estimation based on historical data (users who ran FAQ agent after similar gaps saw X% improvement).

**SMB value:** VERY HIGH. Answers "which agent should I use?" -- the #1 question new users have.

**Effort:** MEDIUM. Impact estimation requires sufficient historical data. Start with heuristic estimates, improve with real data.

---

## 5. Priority Classification

Every feature and system component classified.

### LAUNCH CRITICAL (Day-1 Requirements)

Must ship for the product to be viable at all. Without these, there is no product.

| Feature | Justification |
|---------|---------------|
| **Real Scan Engine (4 API engines)** | Currently mock. Nothing works without real scans. |
| **Real Agent Execution (Content Writer, Blog Writer, Schema Optimizer, Recommendations)** | Core differentiator. Currently mock. |
| **Dashboard with Real Data** | Currently wired to mock. Must display real scan results. |
| **Visibility Score (0-100)** | Central metric. Every competitor has it. |
| **Per-Engine Breakdown** | 15/15 competitors show this. Table stakes. |
| **Competitor Comparison** | 15/15 competitors have it. Essential context. |
| **Share of Voice** | 14/15 competitors. Table stakes. |
| **Time Trend Charts (7d/30d/90d)** | 15/15 competitors. Table stakes. |
| **Free Scan with AI Readiness Score** | Primary acquisition channel. Already designed. Must work with real data. |
| **Scheduled Scans (daily/3-day/weekly by tier)** | 13/15 competitors have daily auto-monitoring. Manual-only is not competitive. |
| **Recommendations Feed** | Bridges monitoring and action. Without it, dashboard is passive. |
| **Content Library** | Stores all agent outputs. Without it, content is lost after generation. |
| **Agent Hub** | Central agent management. Core UX for agent-first product. |
| **Paddle Billing (working)** | Already built. Must be verified and wired to real subscription data. |
| **LLMS.txt Generator Agent** | Low effort, high perceived value. Only Bear AI has it. |
| **Prompt Auto-Suggestions** | Reduces onboarding friction. 3/15 competitors. Critical for non-technical SMBs. |
| **Inngest Background Jobs** | Scans and agents cannot run synchronously. Already designed. |
| **RLS Security** | Non-negotiable. Already designed. |

### GROWTH PHASE (Within 3 Months of Launch)

Needed for retention, competitive parity, and preventing early churn.

| Feature | Justification |
|---------|---------------|
| **Sentiment Scoring (0-100)** | 7/15 competitors. Low effort to add. Drives urgency. |
| **Source-Level Citation Tracking** | Highly actionable. Transforms "invisible" into "this URL beats you." |
| **FAQ Agent** | Low-effort agent addition. Completes basic agent set. |
| **Review Analyzer Agent** | Build tier unlock. Differentiation at SMB price. |
| **Social Strategy Agent** | Build tier unlock. Content calendar is high perceived value. |
| **WordPress Integration (Build tier)** | 6/15 competitors. Eliminates copy-paste friction. Moved from Scale to Build tier. |
| **GA4 Integration** | 6/15 competitors. Proves ROI. Reduces churn. |
| **Slack Integration** | 3/15 competitors. Low effort. |
| **"Ask Beamix" Chat** | Reuses existing chat infrastructure. Gauge's differentiator brought to SMB price. |
| **Visibility Drop Alerts (email)** | 13/15 competitors have alerts. Retention mechanism. |
| **Weekly Digest Email** | Keeps non-daily-login users engaged. |
| **Content Performance Tracking** | Proves agent ROI. "This blog post improved your visibility by +12." |
| **PDF/CSV Export** | Scale tier. Standard expectation. |
| **Gap Analysis Dashboard** | Shows WHERE brand is missing. Connects to agent triggers. |
| **"Fix It" Buttons (Innovation 1)** | One-click agent launch from any gap. Low effort, high impact UX. |

### MOAT BUILDERS (3-6 Months Post-Launch)

Features that create competitive defensibility and lock-in.

| Feature | Justification |
|---------|---------------|
| **Content Voice Training** | Prevents generic output. Lock-in: voice profile is effort to recreate elsewhere. |
| **6+ Content Types** | Matches RankPrompt at $29. Comparison articles, location pages, case studies. |
| **Content Pattern Analysis** | Improves agent quality. Spotlight's unique feature at SMB price. |
| **Agent Workflows (event-triggered)** | "Visibility drop --> auto-fix." Reduces manual work. Profound's feature at SMB price. |
| **Recurring Agent Execution** | Content freshness. Scheduled re-optimization. |
| **Brand Narrative Analysis** | "Why AI says what it says." Only AthenaHQ and Spotlight have this. |
| **Browser Simulation (Phase 2 engines)** | Grok, Copilot, AI Overviews, AI Mode. Expands to 8+ engines. |
| **Competitor Intelligence Agent** | Scale tier. Deep competitive analysis. |
| **Citation Builder Agent** | Bear AI's PR outreach concept at SMB price. |
| **AI Readiness Auditor (full)** | Deep site audit. Extends free scan value. |
| **Multi-City Hebrew Scanning** | Tel Aviv, Haifa, Jerusalem, Be'er Sheva. Hebrew market moat. |
| **Google Search Console Integration** | Keyword data feeds AI prompt optimization. |
| **Prompt Volume Estimation** | Aggregate data from Beamix users. Gets better with scale. |
| **Hebrew Prompt Library (Innovation 3)** | Curated industry prompts. Zero competition. |
| **Competitor Weakness Alerts (Innovation 4)** | Actionable competitor intelligence. Unique. |
| **Cross-Agent Memory (Innovation 6)** | Agents remember previous work. Compounding value. |
| **Agent Impact Scorecard (Innovation 2)** | Per-content ROI proof. Differentiating. |
| **"What Changed" Weekly Diff (Innovation 7)** | Granular weekly report. Better than competitor digests. |
| **CDN AI Crawler Detection** | Phase 9. Writesonic/Scrunch feature. Dashboard wow-factor. |
| **Revenue Attribution (traffic correlation)** | GA4-based traffic-to-conversion correlation. |

### SKIP (Intentionally Not Building)

Features competitors have that Beamix should NOT build. Each with reasoning.

| Feature | Competitor(s) | Why Skip |
|---------|---------------|----------|
| **Near Real-Time Monitoring (15-30 min)** | RankPrompt | Resource-intensive. Daily scans are sufficient for SMBs. The cost of scanning every 15 minutes does not justify the marginal value. Even Peec and Otterly do daily, not real-time. |
| **AI Site Optimization (AXP)** | Scrunch | CDN-level middleware is extremely complex. Only 1/15 competitors has it. Enterprise-only feature. Would require CDN partnerships Beamix cannot negotiate as a solo founder. |
| **E-Commerce / Shopify (MVP)** | AthenaHQ, Writesonic, Goodie | Target persona is service SMBs (lawyers, restaurants, insurance), not e-commerce. Shopify integration is 3-4 weeks of effort for a niche use case. Revisit only if customer demand materializes. |
| **Multi-Surface Tracking (YouTube/TikTok/Reddit)** | Ahrefs | Requires massive data infrastructure Beamix cannot build. Ahrefs has 190M prompt dataset. Outside core GEO value proposition. |
| **Contentful/Sanity/Gamma Integration** | Profound | Enterprise headless CMS. Not SMB-relevant. Zero demand signal from target market. |
| **Webflow Integration** | AthenaHQ | Only 1/15 competitors. Small percentage of SMB market uses Webflow. |
| **Looker Studio Connector (MVP)** | Otterly, SE Visible, Peec | Agency feature. Core SMBs don't know what Looker Studio is. Build only when/if agency tier is prioritized (Phase 4). |
| **White-Label Reports (MVP)** | Otterly, RankPrompt | Agency feature. Not relevant for single-business SMB users. Phase 4 at earliest. |
| **Multi-Workspace/Agency (MVP)** | Profound, Otterly, RankPrompt | Requires data model changes. Not needed for core SMB persona. Phase 4. |
| **Editorial Queue / Multi-User Review** | Profound | Single-user SMBs don't need editorial workflows. This solves an enterprise team problem Beamix users don't have. |
| **Persona-Based Tracking (MVP)** | Scrunch | Only 1/15 competitors. Data model CLOSED; pipeline integration DEFERRED to Phase 4. Adds complexity SMBs won't use. |
| **Customer Journey Stage Mapping (MVP)** | Spotlight | Only 1/15 competitors. SPEC ONLY — Phase 4 implementation. Classification logic designed in Intelligence Layer but no pipeline integration or DB column at launch. |
| **Content Comparison Tool** | RankScale | "Current vs optimized" side-by-side. Interesting but low priority. Agents already produce optimized content -- showing the diff adds little value when the agent does the work. |
| **SOC 2 Compliance** | Airefs, Profound | Enterprise requirement. Not needed for SMB product. Build when enterprise customers demand it. |

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **PARTIAL gaps to close** | 7 |
| **MISSING gaps to close** | 14 (7 original + 7 additional from matrix) |
| **Launch Critical features** | 18 |
| **Growth Phase features** | 15 |
| **Moat Builder features** | 20 |
| **Intentionally Skipped** | 14 |
| **Innovation Opportunities** | 8 |
| **Cross-layer data flows** | 7 |
| **Cross-layer coordination points** | 5 |
| **Edge cases documented** | 6 |
| **Module integration points** | 6 |

### Competitive Context Notes

**Otterly Bulk Query Tracking:** Otterly supports bulk query import (50+ queries at once). Beamix data model supports this — no hard limit on `tracked_queries` table. UX for bulk add/import (CSV upload, paste-multiple) is a Growth Phase feature, not launch-blocking.

**Data Freshness Warning:** Competitive research conducted February-March 2026. Features and pricing of competitors change rapidly. Validate against current competitor websites before using for positioning claims. Re-verify all competitor feature claims if more than 60 days have elapsed since March 1-4, 2026.

### Completeness Verdict

The new system design closes the addressable competitive gaps (4/7 MISSING closed, 3/7 intentionally deferred, 7/7 PARTIAL upgraded) IF:

1. **Every PARTIAL item** has a concrete specification (not a one-liner deferral)
2. **Every MISSING item marked "Required"** has at least a data model note, phase assignment, and implementation approach
3. **Cross-layer data flows** (Section 3.1) are explicitly documented with owning teams
4. **The content pipeline is end-to-end:** scan --> recommendation --> agent --> content library --> WordPress publish --> visibility tracking --> impact display
5. **Skip decisions are explicit and reasoned** -- no silent omissions

The three agents (Morgan/Product, Atlas/Architecture, Sage/Intelligence) should each verify against this document that their layer covers every item assigned to them.

---

> **This document is the definitive validation checklist for the Beamix system design rewrite.**
> **Every competitive claim is sourced to specific competitors.**
> **Use this to verify completeness of all three system design layers.**
> **Author: Rex (Research Analyst) | March 2026**

---

## March 2026 Competitive Gap Closure (Feature Sprint)

> **Date:** March 8, 2026. 11 competitor features analyzed; 10 approved to build; 1 rejected. Full specs in `docs/04-features/specs/new-features-batch-[1-3]-spec.md`.

### Gap Closure Status by Competitor

| Competitor Feature | Source Competitor(s) | Beamix Feature | Status | Tier |
|-------------------|---------------------|----------------|--------|------|
| AI bot crawl tracking | Scrunch AI | F1: AI Crawler Feed | Spec complete — Phase 2 | Pro+ |
| Content diff view | RankScale | F2: Content Comparison Tool | Spec complete — Phase 2 | All paid |
| Query topic clustering | SE Visible | F3: Topic/Query Clustering | Spec complete — Phase 2 | Pro+ |
| Conversation/query explorer | Profound | F4: Conversation Explorer | Spec complete — Phase 3 (Moat Builder) | Pro+ |
| Competitor auto-suggest | Peec AI, SE Visible | F5: Auto-Suggest Competitors | Spec complete — Phase 2 | All tiers |
| Browser simulation (no-API engines) | Peec AI, RankPrompt | F6: Browser Simulation | Spec complete — Phase 3 (Moat Builder) | Pro+ |
| Unlinked/web brand mention tracking | Ahrefs Brand Radar | F7: Web Mention Tracking | Spec complete — Phase 2 | All paid |
| Social monitoring (YouTube/TikTok/Reddit) | Ahrefs Brand Radar | F8: Social Monitoring | **REJECTED** — out of scope | N/A |
| 15-30 min scan refresh | RankPrompt (15 min) | F9: 30-Min Scan Refresh | Spec complete — High Priority | Business |
| City/region-level scanning | Peec AI | F10: City-Level Scanning | Spec complete — Phase 2 | Discover/Build/Scale |
| Real prompt volume data | Profound, Ahrefs | F11: Prompt Volume (GSC) | Spec complete — Phase 2 (GSC path only) | Pro+ |

### Deferred Gaps (Previously Noted) — Status Update

| Gap | Previous Status | March 2026 Status |
|-----|----------------|-------------------|
| Multi-region scanning | Intentionally deferred | **Now addressed by F10 spec** |
| Browser simulation for Copilot/AI Overviews | Not in original scope | **Now addressed by F6 spec** |
| Prompt volume data | Noted as "weak proxy" | **Addressed by F11 GSC integration** |

### Pricing Validation (March 2026)

- Current pricing reviewed against new feature cost stack — see `docs/08-agents_work/AUDITS/PRICING-IMPACT-ANALYSIS.md`
- **Verdict:** Current tiers (Discover $79, Build $189, Scale $499) absorb all new feature costs
- **Pricing locked April 2026** at Discover/Build/Scale; prior evaluation of a Scale increase to $449 is superseded.
- Discover/Build margins remain healthy post all 10 features

### Remaining Intentional Gaps (Unchanged)

These gaps remain deferred by design — not addressed in this sprint:

| Gap | Reason for Deferral |
|-----|---------------------|
| Social media monitoring | Out of scope for GEO platform; Ahrefs owns this |
| Google Looker Studio integration | Low priority; GSC direct integration covers the core need |
| Enterprise multi-seat / agency portal | Phase 4+ — SMB focus maintained through Phase 3 |
| Custom LLM fine-tuning per business | Cost prohibitive at SMB scale; not on roadmap |
