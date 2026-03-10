# Agent System Feature Specification

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Engineering Reference — Implementation Ready
> **Sources:** `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md`, `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md`, `_SYSTEM_DESIGN_PRODUCT_LAYER.md`, `BEAMIX_SYSTEM_DESIGN.md`
> **Audience:** Engineers building the agent system. This document is self-contained — no need to read system design docs to build from this spec.

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Agent Hub Page](#2-agent-hub-page)
3. [Agent Chat Page](#3-agent-chat-page)
4. [Credit System](#4-credit-system)
5. [All 16 Agents — Complete Pipeline Specs](#5-all-16-agents)
6. [Agent Execution Flow](#6-agent-execution-flow)
7. [Agent Workflow Chains](#7-agent-workflow-chains)
8. [API Routes](#8-api-routes)
9. [Data Model](#9-data-model)
10. [Cross-Agent Memory](#10-cross-agent-memory)
11. [Enum Values and Constants](#11-enum-values-and-constants)
12. [Engineering Notes](#12-engineering-notes)

---

## 1. Feature Overview

### What the Agent System Is

The agent system is a collection of 16 multi-stage LLM pipelines that autonomously fix AI search visibility problems for SMBs. Each agent takes business context as input, runs a sequence of LLM calls across multiple models, applies cross-model quality assurance, and produces a concrete output — a piece of content, a structured data file, a strategic report, or a real-time analysis.

**Competitors show dashboards. Beamix does the work.**

The core loop is:

```
Scan (find problems) → Diagnose (A4 Recommendations) → Fix (agent executes) → Measure (content performance tracking) → Repeat
```

Every agent in the system connects to at least one other. Agent outputs feed into subsequent agents. Recommendations from A4 pre-populate other agents. Voice profiles from A13 improve content from A1 and A2. Pattern data from A14 shapes structure in A1 and A2. The system compounds in value over time.

### Why It Is the Core Differentiator

The "Fix It" button concept is the product's moat. On any dashboard page where the system identifies a gap — a query where the business is not mentioned, a competitor that is outranking them, a technical audit finding — a button launches the relevant agent with that gap pre-loaded as context. The agent runs autonomously, produces a concrete output, and stores it in the content library. The user approves and publishes. No other GEO tool under $200/month does this end-to-end.

### The "Fix It" Button

The "Fix It" / "Run Agent" button appears in three locations:

1. **Recommendations page** — each recommendation card has a "Run Agent" button that opens the relevant agent pre-loaded with the recommendation's topic, evidence, and context.
2. **Dashboard overview** — the top 3 recommendations widget includes "Run Agent" buttons.
3. **Rankings page** — each row's expanded detail view has a "Fix with Agent" button that opens the relevant agent pre-populated with the query.

When the user clicks any of these, the browser navigates to `/dashboard/agents/[agentType]` with a `?recommendationId=` or `?query=` parameter. The agent chat page reads this parameter and pre-fills the input form.

### Interactive Streaming Chat UX

Agent executions are not batch-async jobs with a "done" notification. They are interactive streaming experiences. The user watches each pipeline step execute in real-time, sees partial output as it is generated, and can inject guidance mid-execution (change tone, narrow scope, add context). This is implemented via Server-Sent Events (SSE) from `/api/agents/[jobId]/stream`.

---

## 2. Agent Hub Page

**URL:** `/dashboard/agents`

### What the Hub Shows

The hub is the central management view for all 16 agents. It has four sections:

**1. Agent Grid**

16 agent cards arranged in a responsive grid. Each card displays:
- Icon and agent name
- One-line description of what the agent does
- Status badge: Available / Running / Last run: [relative time]
- Tier badge: which plan tier includes this agent (Starter / Pro / Business)
- Lock overlay + upgrade CTA for agents outside the user's tier
- Credit cost badge (e.g., "1 credit")
- "Run" button (primary) or "Running..." (disabled, spinner) if currently executing

**Agent card states:**

| State | Visual | Copy on button |
|-------|--------|---------------|
| Available | Full card, Run button enabled | "Run" |
| Running | Spinner icon, step name updates in real-time | "Running..." (disabled) |
| Completed | Green check, "Last run: X ago" | "Run Again" |
| Error | Red warning icon, 1-line error | "Retry" |
| Unavailable | Gray overlay, clock icon | "Temporarily unavailable" |
| Locked (wrong tier) | Lock overlay, dimmed description | "Available on Pro — Upgrade" |

**2. Agent Categories**

Cards are grouped by category:

| Category | Agents |
|----------|--------|
| Content Creation | Content Writer (A1), Blog Writer (A2), FAQ Agent (A5), Social Strategy (A7) |
| Technical | Schema Optimizer (A3), LLMS.txt Generator (A10), AI Readiness Auditor (A11) |
| Intelligence | Competitor Intelligence (A8), Review Analyzer (A6), Citation Builder (A9), Brand Narrative Analyst (A16), Recommendations (A4, system) |
| Conversational | Ask Beamix (A12) |
| Voice and Patterns (Growth Phase) | Content Voice Trainer (A13), Content Pattern Analyzer (A14), Content Refresh Agent (A15) |

**3. Usage Meter**

Persistent meter: "8/15 agent uses this month" as a progress bar. Below the bar: "Resets on [date]" and a "Buy top-ups" link.

**4. Workflow Automation Toggles**

Four pre-built automation cards, each with an ON/OFF toggle:

1. **Visibility Drop Response** — dropdown to set threshold (10% / 15% / 20%)
2. **New Content Lifecycle** — auto-audit published content after 30 days
3. **Competitor Alert Response** — auto-analyze when a competitor overtakes
4. **Onboarding Sequence** — runs automatically on first signup (always ON, non-toggleable)

**Agent Suggestion Engine (Moat Builder — not launch critical)**

The dashboard recommends which agent to run next based on scan data and business state. If the most recent scan shows low citation data, the system surfaces A9 (Citation Builder). If voice training has not run, it surfaces A13. This logic lives in the recommendations surface, not as a separate hub feature, at launch.

**Recurring Executions Panel (Growth Phase)**

Shows scheduled/recurring agent runs. Example: "Content Refresh runs monthly on your 4 published articles." This panel is hidden when no recurring executions are configured.

---

## 3. Agent Chat Page

**URL:** `/dashboard/agents/[agentType]`

The `agentType` URL segment is a kebab-case slug matching the agent's URL identifier. It is NOT a database UUID.

**Slug to DB `agent_type` mapping:**

| URL Slug | DB `agent_type` |
|----------|----------------|
| `content-writer` | `content_writer` |
| `blog-writer` | `blog_writer` |
| `schema-optimizer` | `schema_optimizer` |
| `recommendations` | `recommendations` |
| `faq` | `faq_agent` |
| `review-analyzer` | `review_analyzer` |
| `social-strategy` | `social_strategy` |
| `competitor-intelligence` | `competitor_intelligence` |
| `citation-builder` | `citation_builder` |
| `llms-txt` | `llms_txt` |
| `ai-readiness` | `ai_readiness` |
| `ask-beamix` | *(no DB record — direct SSE stream, not Inngest)* |
| `voice-trainer` | `content_voice_trainer` |
| `pattern-analyzer` | `content_pattern_analyzer` |
| `content-refresh` | `content_refresh` |
| `brand-narrative` | `brand_narrative_analyst` |

To view a specific past run: `/dashboard/agents/[agentType]/run/[job_id]`

### Chat UI Layout

The agent chat page is a full-page layout. It contains:

**Header:**
- Agent avatar (icon + gradient background)
- Agent name and one-line description
- Back arrow to `/dashboard/agents`
- Credit cost badge

**Input Form (top of chat, before first run):**
- Agent-specific input fields (varies by agent — see each agent's spec for input params)
- "Run Agent" button (primary)
- Pre-population if `?recommendationId=` or `?query=` param present

**Chat Thread (after first run begins):**
The chat thread renders the execution as a sequence of messages:

```
[System] Agent started: Content Writer
[Step 1 — Research]  Searching current facts... ████████░░ (streaming)
[Step 2 — Outline]   Creating content structure... (pending)
[Step 3 — Write]     (pending)
[Step 4 — QA Gate]   (pending)
```

Each step transitions through states: pending → running (with real-time streaming text) → completed (with output summary) → failed (with error message and retry option).

**Step Progress Indicators:**
Each pipeline step renders as a chat bubble from "Agent":
- Step name (e.g., "Researching...")
- Model used (e.g., "Perplexity Sonar Pro")
- Streaming partial output while running
- Completed output summary when done
- Duration in milliseconds after completion

**User Input During Execution:**
A text input field is available at the bottom of the chat thread at all times while an agent is running. The user can send a message to guide the agent. This message is injected into the next step's prompt as a user instruction. Example: "Focus on Tel Aviv specifically, not all of Israel."

**Final Output:**
When all steps complete and QA passes, the final output renders as a formatted content block in the chat. Below it:

**Action Bar on Completion:**
- Save to Content Library
- Copy to Clipboard
- Download (Markdown or structured format)
- Publish to WordPress (if integration connected)
- Run Again (with modifications)
- Rate output: thumbs up / thumbs down (feeds quality improvement)

### SSE Streaming Architecture

Ask Beamix (A12) uses SSE for conversational streaming. Agent execution progress also uses SSE for step-level real-time updates.

**How SSE works for agent progress:**

1. Client calls `GET /api/agents/[jobId]/stream` immediately after the agent job is created.
2. Server opens an SSE connection and begins polling `agent_job_steps` every 500ms, pushing updates when step status changes.
3. Each SSE event carries a JSON payload:

```typescript
type AgentStreamEvent =
  | { type: 'step_started'; step: string; model: string; step_order: number }
  | { type: 'step_output'; step: string; partial_text: string }
  | { type: 'step_completed'; step: string; output_summary: string; duration_ms: number }
  | { type: 'step_failed'; step: string; error: string }
  | { type: 'job_completed'; content_id?: string; qa_score: number }
  | { type: 'job_failed'; error: string; credits_released: boolean }
```

4. On `job_completed`, client closes the SSE connection and renders the final output.
5. On `job_failed`, client closes SSE, releases the UI, and shows the error with retry option.

**Ask Beamix SSE:**

Ask Beamix does not go through Inngest. It is a direct API route at `POST /api/agents/chat` that streams Claude Sonnet 4.6 output via SSE using the `ReadableStream` pattern in Next.js Route Handlers. The Vercel function timeout must be extended: `export const maxDuration = 60` in the route file.

---

## 4. Credit System

### Overview

Credits are the unit of agent execution. Each agent costs 1 credit by default. Credits reset monthly. Unused credits roll over up to 20% of the monthly base allocation.

### `credit_pools` Table

One row per user per pool type. Pool types: `'monthly'`, `'topup'`, `'trial'`.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to auth.users |
| `pool_type` | text | `'monthly'` \| `'topup'` \| `'trial'` |
| `base_allocation` | integer | Monthly plan allocation (from plans.monthly_agent_uses) |
| `rollover_amount` | integer | Credits rolled from previous month (capped at 20% of base) |
| `topup_amount` | integer | One-time purchased credits |
| `used_amount` | integer | Credits consumed this period |
| `held_amount` | integer | Credits reserved for in-progress agents |
| `period_start` | timestamptz | Current billing period start |
| `period_end` | timestamptz | Current billing period end |

**Available credits formula:**
```
base_allocation + rollover_amount + topup_amount - used_amount - held_amount
```

This is computed inline — there is no materialized `available` column. The `hold_credits` RPC computes this atomically under a `SERIALIZABLE` transaction to prevent race conditions.

**UNIQUE constraint:** `(user_id, pool_type)` — exactly one pool of each type per user.

### `credit_transactions` Table

Immutable audit trail. Every credit operation writes a row here.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to auth.users |
| `pool_id` | uuid | FK to credit_pools(id) — required |
| `pool_type` | text | Pool type at time of transaction — required |
| `transaction_type` | text | See valid values below |
| `amount` | integer | Positive = addition, negative = deduction |
| `balance_after` | integer | Running balance after this transaction |
| `agent_job_id` | uuid | FK to agent_jobs(id) — for hold/confirm/release |
| `description` | text | Human-readable description |

**Valid `transaction_type` values:**
```
'allocation'   — monthly credit reset
'hold'         — credits reserved for in-progress agent
'confirm'      — held credits consumed after agent success
'release'      — held credits returned after agent failure or cancellation
'topup'        — one-time credit purchase (NOT 'bonus')
'rollover'     — credits carried forward from previous month
'expire'       — credits expired
'system_grant' — zero-cost system-initiated agent (onboarding workflow, 0 credits)
```

**Critical:** There is no `'bonus'` transaction type. Use `'topup'` for all purchased credit additions.

### Hold / Confirm / Release Pattern

This pattern prevents race conditions when multiple agent executions run concurrently. All three operations are implemented as PostgreSQL RPC functions using `SELECT ... FOR UPDATE` row-level locking.

**Step 1 — Hold (before agent starts):**
- API calls `supabase.rpc('hold_credits', { p_user_id, p_amount, p_job_id })`
- RPC checks available credits atomically
- If sufficient: increments `held_amount`, inserts `transaction_type = 'hold'` row, returns `{ success: true, pool_id }`
- If insufficient: returns `{ success: false, error: 'insufficient_credits' }`
- Idempotency guard: if a `'hold'` transaction already exists for this `agent_job_id`, returns success without creating duplicate (Inngest retry safety)

**Step 2 — Confirm (after agent completes successfully):**
- Inngest function calls `supabase.rpc('confirm_credits', { p_job_id })`
- RPC decrements `held_amount`, increments `used_amount`
- Inserts `transaction_type = 'confirm'` row
- Idempotency guard: if `'confirm'` row already exists for this job, returns success without double-confirming

**Step 3 — Release (after agent fails or is cancelled):**
- Inngest function calls `supabase.rpc('release_credits', { p_job_id })`
- RPC decrements `held_amount` (credits return to available)
- Inserts `transaction_type = 'release'` row
- Idempotency guard: same pattern

**Stuck hold cleanup:** `cron.cleanup` runs daily at 4AM UTC. It releases any `'hold'` transactions with no corresponding `'confirm'` or `'release'` that are older than 2 hours. This catches agent functions that timed out or crashed.

### Monthly Allocation Reset

`cron.monthly-credits` runs on the 1st of every month at midnight UTC.

The `allocate_monthly_credits(p_user_id uuid, p_plan_id uuid)` RPC:
1. Idempotency guard: checks for existing `'allocation'` transaction in current calendar month
2. Looks up `plans.monthly_agent_uses` for the plan
3. Computes rollover: `MIN(base_allocation - used_amount, FLOOR(base_allocation * 0.20))` — clamped to 0 minimum
4. Sets `rollover_amount` to computed rollover, resets `base_allocation`, `used_amount`, `held_amount`
5. If user had a `'trial'` pool: deletes it (trial replaced by full monthly allocation on first payment)
6. Inserts `'allocation'` transaction, and `'rollover'` transaction if rollover > 0

### Rollover Cap

20% of the monthly base allocation. Example: Starter plan with 30 credits/month has a maximum rollover of 6 credits. Unused credits beyond 6 expire.

### Trial Cap

7-day trial includes exactly 5 agent credits total. These are stored in a `pool_type = 'trial'` credit pool with `base_allocation = 5`. The trial pool is deleted when the user upgrades to a paid plan and `allocate_monthly_credits` runs.

### Credit Cost Per Agent

| Agent | Cost | Notes |
|-------|------|-------|
| A1 Content Writer | 1 | |
| A2 Blog Writer | 1 | |
| A3 Schema Optimizer | 1 | |
| A4 Recommendations | 0 | System agent, never charges credits |
| A5 FAQ Agent | 1 | |
| A6 Review Analyzer | 1 | |
| A7 Social Strategy | 1 | |
| A8 Competitor Intelligence | 1 | But 3-6x higher LLM cost due to multi-engine scan — see §12 |
| A9 Citation Builder | 1 | |
| A10 LLMS.txt Generator | 1 | |
| A11 AI Readiness Auditor | 1 | |
| A12 Ask Beamix | 0 | Included in Pro+ tier |
| A13 Content Voice Trainer | 1 | |
| A14 Content Pattern Analyzer | 1 | |
| A15 Content Refresh Agent | 1 | |
| A16 Brand Narrative Analyst | 1 | |

### Plan Allocations

| Plan | Monthly Credits | Rollover Cap |
|------|----------------|-------------|
| Free (trial) | 5 total (trial pool) | None |
| Starter | 30/month | 6 |
| Pro | 50/month | 10 |
| Business | 100/month | 20 |

---

## 5. All 16 Agents

All agents share a unified execution framework. The differences are: input parameters, which LLM models run at each stage, what the output format is, and which other agents consume their output.

### A1: Content Writer

**Purpose:** Generate GEO-optimized website pages (landing, service, about, FAQ) that maximize the probability of being cited by AI engines.

**Plan tier:** Starter+
**Credit cost:** 1
**DB `agent_type`:** `content_writer`
**Content type:** `article` or `location_page` or `comparison` (depends on page type selected)
**Content format:** `markdown`

**Input Parameters:**
```typescript
{
  page_type: 'landing' | 'service' | 'about' | 'faq' | 'location' | 'comparison'
  topic: string                    // from recommendation or user-specified
  target_queries: string[]         // from tracked queries list
  tone: 'professional' | 'friendly' | 'authoritative' | 'conversational'
  word_count_target: number        // 500-3000, default 1200
  language: 'en' | 'he'
}
```

**Context assembled automatically:**
- Business profile (name, industry, location, services, description, website_url)
- Recent scan results (last 3 scans, per-engine breakdowns, mention contexts, citations)
- Content voice profile if trained (from A13)
- Content patterns data if available (from A14)
- Competitor intelligence data if available (from A8)

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Research | Perplexity Sonar Pro | Current facts, competitor content, industry trends for topic | Research brief: 5-10 key facts, competitor approaches, statistics, cited sources | 0.5 | 1,500 |
| 2. Outline | Claude Sonnet 4.6 | GEO-optimized content structure | Section-by-section outline: H2/H3 hierarchy, key points, FAQ questions, schema types | 0.7 | 2,000 |
| 3. Write | Claude Sonnet 4.6 | Full content following outline, incorporating research | Complete page in markdown: title, meta description, body sections, inline statistics, FAQ, natural keyword integration | 0.7 | 4,000 |
| 4. QA Gate | GPT-4o | Score quality across 5 dimensions | Scorecard: factual accuracy, GEO optimization, readability, relevance, voice adherence. Composite 0-100. Pass: 70. | 0.3 | 1,000 |

**Quality Gates:**
- Post-Stage 1: Minimum 3 substantive data points returned. If Perplexity returns thin results, retry with broadened query.
- Post-Stage 3: Structural validation — verify output contains title, meta description, body, FAQ. Word count must be within 80-120% of target.
- Post-Stage 4: QA score >= 70 passes. Score 60-69: retry Stage 3 at same temperature (0.7) with QA feedback injected as correction instructions (do NOT increase temperature on retry — it reduces coherence). Score < 60 on retry: fail execution, release credits.

**Output Format:**
```
- title (string)
- meta_description (string, 150-160 chars)
- content_body (markdown)
- faq_section (array of {question, answer} pairs)
- json_ld_schema (string, embedded JSON-LD)
- impact_estimate (string)
```

**Stored in:** `content_items` with `content_type` matching page type.

**Cross-Agent Connections:**
- Receives topic from A4 (Recommendations)
- Receives competitive gaps from A8 (Competitor Intelligence)
- Receives voice profile from A13 (Content Voice Trainer)
- Receives structural patterns from A14 (Content Pattern Analyzer)

---

### A2: Blog Writer

**Purpose:** Create long-form blog posts targeting queries where AI engines do not currently cite the business. Uses structures proven to maximize citation probability.

**Plan tier:** Starter+
**Credit cost:** 1
**DB `agent_type`:** `blog_writer`
**Content type:** `blog_post`
**Content format:** `markdown`

**Input Parameters:**
```typescript
{
  title_hint?: string              // from recommendation, trending topic, or user
  target_queries: string[]         // queries the blog should help rank for
  length: 'short' | 'standard' | 'long'  // 600-800 / 1000-1500 / 1500-2500 words
  tone: 'educational' | 'opinion' | 'how-to' | 'listicle' | 'case_study'
  language: 'en' | 'he'
}
```

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Research | Perplexity Sonar Pro | Latest data, trends, competing articles | Research brief: stats, trends, competitor article structures, coverage gaps | 0.5 | 1,500 |
| 2. Outline | Claude Sonnet 4.6 | Blog structure: hook, section flow, key arguments | Detailed outline: hook, thesis, sections with bullet points, conclusion, CTA | 0.7 | 2,000 |
| 3. Write | Claude Sonnet 4.6 | Full blog following outline, weaving in research | Complete blog in markdown with inline citations, statistics, examples | 0.7 | 4,000 |
| 4. GEO Optimize | Claude Sonnet 4.6 | Add FAQ section, schema hints, internal linking suggestions, citation anchors | Augmented content with FAQ, schema, link suggestions, optimized headers | 0.5 | 2,000 |
| 5. Title Generation | GPT-4o | Generate 3 title variants optimized for AI discoverability | 3 titles ranked by GEO-optimization score with rationale | 0.8 | 500 |
| 6. Content QA | GPT-4o | Cross-model quality gate | QA score (0-100) + specific feedback per dimension. Score < 80: one Sonnet revision loop → GPT-4o re-check → publish regardless of second score. | 0.5 | 1,500 |

**Quality Gates:**
- Post-research: Minimum 3 unique data points.
- Post-write: Word count within target range, all outline sections addressed.
- Structural validation: H2/H3 hierarchy present, FAQ contains 3+ Q&A pairs, at least 2 internal statistics cited.
- Post-QA: Score < 80 triggers one Sonnet revision with QA feedback, then GPT-4o re-check. Content publishes after at most one revision loop regardless of second score.

**Output Format:**
```
- title_options (array of 3 strings, with selection rationale)
- meta_description (string)
- content_body (markdown, full blog)
- excerpt (first 2-3 sentences)
- estimated_read_time (string)
- source_urls (array of strings from research phase)
- suggested_tags (string[])
- faq_section (array of {question, answer})
- json_ld_schema (BlogPosting JSON-LD)
```

---

### A3: Schema Optimizer

**Purpose:** Generate JSON-LD structured data that helps AI engines understand and cite the business. Schema markup is the single highest-impact technical GEO factor.

**Plan tier:** Starter+
**Credit cost:** 1
**DB `agent_type`:** `schema_optimizer`
**Content type:** `schema_markup`
**Content format:** `json_ld`

**Input Parameters:**
```typescript
{
  target_url: string               // Page URL to optimize
  additional_urls?: string[]       // Other pages to include
}
```

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Page Fetch | cheerio (no LLM) | Fetch and parse target page HTML | Raw HTML, extracted text, existing JSON-LD/microdata | — | — |
| 2. Existing Schema Detection | Parser (no LLM) | Identify current structured data | List of existing schema types, completeness assessment | — | — |
| 3. Gap Analysis | Claude Haiku 4.5 | Determine missing or incomplete schema types | Prioritized list of missing schemas with impact rating | 0.3 | 1,500 |
| 4. Generate | Claude Sonnet 4.6 | Create complete, valid JSON-LD for all gaps | JSON-LD blocks per schema type, populated with real business data | 0.3 | 3,000 |
| 5. Validate | schema-validator lib (no LLM) | Test JSON-LD against Schema.org specs | Validation results: errors, warnings, info | — | — |

**Quality Gates:**
- Post-generation: Every JSON-LD block must pass schema-validator without errors.
- Business data accuracy: Generated schema must use actual business data from the `businesses` table — never placeholder text.

**Output Format:**
```
- existing_schema_audit (what the page already has, completeness rating)
- generated_json_ld (ready-to-paste JSON-LD blocks)
- implementation_guide (where to place each block, priority order)
- validation_results (any warnings)
- schema_types_covered (Organization, LocalBusiness, FAQPage, BreadcrumbList, Article, Product, Service, HowTo)
```

---

### A4: Recommendations (System Agent)

**Purpose:** Auto-generate prioritized, actionable recommendations after every scan. The intelligence engine that connects scan data to agent actions.

**Plan tier:** All (system-triggered, not user-triggered)
**Credit cost:** 0 (system agent — never charges user credits)
**DB `agent_type`:** `recommendations`
**Trigger:** Automatically after every scheduled and manual scan via Inngest event chain.

**Input Data Assembled Automatically:**
- Latest scan results (all engines, all queries)
- Previous scan results (for trend comparison)
- Business profile and industry context
- Existing recommendations (to avoid duplicates — title similarity > 0.8 = skip)
- Previously executed agent jobs (to avoid re-suggesting completed actions)
- Competitor comparison data

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Analysis | Claude Sonnet 4.6 | Single-pass holistic analysis of scan results | Structured output: top gaps, declining engines, competitor advantages, content opportunities. 5-8 prioritized recommendations. | 0.5 | 3,000 |

This is a single-pass analysis, not a multi-stage pipeline. Sonnet receives full business context and scan comparison, produces 5-8 prioritized recommendations.

**Quality Gates:**
- Each recommendation must include: title, description, impact level (high/medium/low), suggested agent type, and evidence from scan data.
- Maximum 8 recommendations per scan.
- De-duplication against existing active recommendations (title similarity > 0.8 = skip).

**Output stored in:** `recommendations` table (not `content_items`). The `suggested_agent` column holds the `agent_type` value of the agent that can execute the fix.

---

### A5: FAQ Agent

**Purpose:** Generate FAQ content that directly mirrors the questions users ask AI engines, maximizing the chance of being cited in AI-generated answers.

**Plan tier:** Starter+
**Credit cost:** 1
**DB `agent_type`:** `faq_agent`
**Content type:** `faq`
**Content format:** `markdown`

**Input Parameters:**
```typescript
{
  target_queries?: string[]        // Defaults to tracked queries where business is absent
  include_schema: boolean          // Whether to generate FAQPage JSON-LD
  language: 'en' | 'he'
}
```

**Context assembled automatically:**
- Tracked queries and questions they represent
- Scan results showing which questions the business is not mentioned for
- Existing FAQ content from the business's website (if crawled)
- Industry-specific common questions

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Question Discovery | Scan data + Claude Haiku 4.5 | Identify top questions from AI responses where business is absent or weakly positioned | 15-20 candidate questions ranked by visibility gap | 0.3 | 1,000 |
| 2. Answer Generation | Claude Sonnet 4.6 | Write authoritative, conversational answers that AI engines would want to cite | 10-15 FAQ pairs with natural language answers, factual claims, business positioning | 0.7 | 3,000 |
| 3. Schema Generation | Claude Haiku 4.5 | Generate FAQPage JSON-LD schema | Valid FAQPage JSON-LD | 0.3 | 1,000 |

**Quality Gates:**
- Each answer must be 50-200 words (too short = unhelpful for AI citation; too long = loses focus).
- No factual claims that cannot be attributed to the business's own data or research.
- FAQPage schema must validate against Schema.org.

**Output Format:**
```
- faq_pairs (array of {question: string, answer: string})
- json_ld_schema (FAQPage JSON-LD)
- implementation_guide (add to existing page vs. create dedicated FAQ page)
- priority_ranking (questions by estimated AI visibility impact)
```

---

### A6: Review Analyzer

**Purpose:** Analyze online reviews and reputation signals to understand how AI engines perceive the business, and generate response templates and improvement strategies.

**Plan tier:** Starter+
**Credit cost:** 1
**DB `agent_type`:** `review_analyzer`
**Content type:** `structured_report` (stored in `agent_jobs.output_data`, not `content_items`)
**Content format:** `structured_report`

**Input Parameters:**
```typescript
{
  focus_platforms?: string[]       // Defaults to all major platforms for the industry
  time_range_months?: number       // Default 6
}
```

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Review Collection | Perplexity Sonar Pro | Gather recent reviews from last 6 months across major platforms | Structured review summary: platform, rating, key quotes, themes | 0.3 | 2,000 |
| 2. Sentiment Analysis | Claude Sonnet 4.6 | Deep sentiment analysis: theme extraction, trend identification, competitor comparison | Sentiment report with themes (service quality, pricing, communication, etc.) each scored 0-100 | 0.5 | 3,000 |
| 3. Strategy Recommendation | Claude Sonnet 4.6 | Response templates and improvement plan based on review themes | Response templates for common review scenarios + improvement roadmap | 0.7 | 2,000 |

**Quality Gates:**
- Review data must cover at least 2 platforms or 10 reviews.
- Sentiment themes must be grounded in actual review quotes, not fabricated.

**Output Format:**
```
- sentiment_overview (aggregate score, trend)
- theme_breakdown (3-7 themes, each with score, sample quotes, trend)
- response_templates (3-5 templates for common review scenarios)
- improvement_recommendations (prioritized by impact on AI perception)
```

**Cross-Agent Connections:** Sentiment themes feed into A16 (Brand Narrative Analyst) and can be used by A1 (Content Writer) to address reputation concerns in published content.

---

### A7: Social Strategy

**Purpose:** Create a 30-day social media content strategy that amplifies AI visibility by generating shareable, linkable content that AI engines can discover and cite.

**Plan tier:** Starter+
**Credit cost:** 1
**DB `agent_type`:** `social_strategy`
**Content type:** `social_post` (calendar stored in `agent_jobs.output_data`)
**Content format:** `structured_report`

**Input Parameters:**
```typescript
{
  platforms: ('linkedin' | 'instagram' | 'x' | 'facebook')[]
  posting_frequency: 'low' | 'medium' | 'high'  // 3/5/7 posts per week
  content_focus: string                           // GEO topics to emphasize
  language: 'en' | 'he'
}
```

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Research | Perplexity Sonar Pro | Competitor social presence, trending topics, platform-specific trends | Research brief: competitor posting frequency, successful content formats, trending hashtags, platform recommendations | 0.5 | 1,500 |
| 2. Strategy + Calendar | Claude Sonnet 4.6 | 30-day content calendar with post ideas, optimal posting times, platform strategy | 30-day calendar + 12-15 detailed post ideas with captions, hashtags, platform-specific formats | 0.7 | 4,000 |
| 3. QA Gate | GPT-4o | Score strategy quality: relevance, platform appropriateness, GEO alignment, brand voice | Quality scorecard (0-100). Pass: 70. Below 60: retry Stage 2 with QA feedback. | 0.3 | 1,000 |

**Quality Gates:**
- Calendar must span exactly 30 days with at least 3 posts per week.
- Each post idea must include: platform, caption, hashtags, visual direction, and GEO-relevant topic connection.
- Post-QA: 70+ passes; 60-69 retry with feedback; <60 fails.

**Output Format:**
```
- platform_strategy (which platforms, why, posting frequency)
- calendar_30d (date, platform, content_type, topic for each day)
- ready_to_post_captions (12-15 captions with hashtags)
- visual_direction_notes (per post)
- geo_connection (how each post contributes to AI visibility)
```

---

### A8: Competitor Intelligence

**Purpose:** Deep analysis of competitors' AI visibility strategies — what they do, where they appear, why AI engines prefer them, and how to overtake them.

**Plan tier:** Pro+
**Credit cost:** 1 (but 3-6x higher LLM cost per execution — see §12)
**DB `agent_type`:** `competitor_intelligence`
**Content type:** `structured_report`
**Content format:** `structured_report`

**Input Parameters:**
```typescript
{
  competitor_ids?: string[]        // Defaults to all tracked competitors
  focus_queries?: string[]         // Subset of tracked queries to analyze
}
```

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Multi-Engine Scan | All active engines | Query same tracked prompts with competitor names | Raw competitor scan results across all engines | — | — |
| 2. Comparative Analysis | Claude Sonnet 4.6 | Deep comparison: where competitors outperform, why AI prefers them | Structured comparison matrix: per-engine, per-query visibility, citation sources competitors earn, content formats | 0.5 | 3,000 |
| 3. Strategic Report | Claude Sonnet 4.6 | Actionable intelligence: gaps to close, strategies to steal, unique angles to exploit | Intelligence report with prioritized action items, each linked to a specific agent that can execute the fix | 0.7 | 4,000 |

**Cost Note:** A8 is the most expensive agent per execution. For a Pro-tier user with 3 tracked competitors: 3 competitors × 25 queries × 8 engines = 600 engine calls. Estimated LLM cost: $3-6 per run. See §12 for full explanation.

**Rate Limiting for A8:**
- Perplexity rate limit budget: A8 claims 40% of total Perplexity RPM budget (16 of 40 RPM).
- A8 runs are queued. If queue depth > 5, user sees "Expected wait: ~X min".
- Competitor research results are cached 24 hours per competitor domain. If a competitor was analyzed within 24h, cached result is used.
- Fallback: If Perplexity rate limit is hit, fall back to DeepSeek for the research stage.

**Quality Gates:**
- Comparison must cover all tracked queries and all active engines.
- Each action item must be specific and executable (not "improve content" but "create a comparison article covering X vs Y targeting query 'best X in location'").

**Output Format:**
```
- competitive_landscape_overview (visual-ready data for share-of-voice charts)
- per_competitor_profiles (visibility score, top queries, cited sources, content strategy)
- gap_analysis (queries where competitor ranks and user does not)
- strategic_action_items (prioritized, linked to agents)
- intelligence_report_narrative (summary)
```

---

### A9: Citation Builder

**Purpose:** Identify the specific sources that AI engines cite when discussing the business's industry, then generate personalized outreach to earn citations from those sources.

**Plan tier:** Pro+
**Credit cost:** 1
**DB `agent_type`:** `citation_builder`
**Content type:** `outreach_template`
**Content format:** `plain_text`

**Input Parameters:**
```typescript
{
  focus_domain?: string            // Target a specific domain/publication
  max_templates?: number           // Default 10
}
```

**Context assembled automatically:**
- Citation data from scan results (`citation_sources` table)
- Industry context
- Existing citations (to avoid outreach to sources that already cite the business)

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Citation Analysis | Scan data + Claude Haiku 4.5 | Extract and rank top-cited sources by citation frequency and authority | Ranked list: URL, domain, citation count, authority estimate | 0.3 | 1,000 |
| 2. Source Research | Perplexity Sonar Pro | Find article authors, publication contacts, content focus | Contact profiles: author name, email/social, publication, article topics, relevance | 0.3 | 2,000 |
| 3. Outreach Templates | Claude Sonnet 4.6 | Generate personalized outreach emails for each high-priority source | 5-10 personalized email templates: subject line, body, value proposition, specific article reference | 0.7 | 3,000 |

**Quality Gates:**
- Templates must be genuinely personalized (reference specific articles, not generic pitches).
- No spam-like language. Each email must provide clear value to recipient.
- Contact information is presented as "research leads" — user verifies before sending.

**Output Format:**
```
- citation_source_ranking (domain, frequency, authority, relevance)
- contact_research (author, platform, content focus per source)
- outreach_templates (5-10 personalized email templates)
- outreach_priority (start with highest-frequency, highest-authority sources)
```

---

### A10: LLMS.txt Generator

**Purpose:** Create and maintain the llms.txt file that helps AI crawlers understand the business's website structure, key offerings, and authoritative content.

**Plan tier:** Starter+
**Credit cost:** 1
**DB `agent_type`:** `llms_txt`
**Content type:** `llms_txt`
**Content format:** `plain_text`

**Input Parameters:**
```typescript
{
  website_url: string              // Defaults to businesses.website_url
}
```

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Website Crawl | cheerio (no LLM) | Analyze site structure: pages, hierarchy, content categories | Site map with page types, hierarchy levels, content summaries | — | — |
| 2. Generate llms.txt | Claude Sonnet 4.6 | Create structured llms.txt following the emerging specification | Complete llms.txt file with business description, key pages, content categories, contact info | 0.3 | 2,000 |

**Quality Gates:**
- Output must conform to the llms.txt specification format.
- All URLs referenced must be real pages found during the crawl.
- Business information must match the `businesses` table data.

**Output Format:**
```
- llms_txt_content (complete file content, ready to deploy at site root)
- deployment_instructions (where to place, how to verify)
- recommended_update_frequency
```

---

### A11: AI Readiness Auditor

**Purpose:** Comprehensive website audit assessing how well the site is optimized for AI engine consumption, producing a detailed improvement roadmap across 5 scoring categories.

**Plan tier:** Starter+
**Credit cost:** 1
**DB `agent_type`:** `ai_readiness`
**Content type:** `structured_report`
**Content format:** `structured_report`

**Input Parameters:**
```typescript
{
  website_url: string              // Defaults to businesses.website_url
  include_competitor_benchmark?: boolean
}
```

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Deep Crawl | cheerio (no LLM) | Crawl up to 50 pages (BFS, depth 2). Extract HTML structure, schema, meta tags, content, links, performance signals | Site analysis dataset: per-page metrics across 25+ factors | — | — |
| 2. Algorithmic Scoring | Scoring algorithm (no LLM) | Compute scores across 5 categories using weighted factors | Numeric scores per category and per factor | — | — |
| 3. Report Generation | Claude Sonnet 4.6 | Transform scores into actionable improvement plan | Detailed report: per-category analysis, specific improvements, difficulty, expected impact | 0.7 | 4,000 |

**Scoring Categories (canonical weights):**

| Category | Weight | What It Measures |
|----------|--------|-----------------|
| Content Quality | 30% | Content depth, FAQ presence, freshness, readability |
| Technical Structure | 25% | Schema markup, meta tags, heading hierarchy, page speed, sitemap |
| Authority Signals | 20% | Domain indicators, backlink signals, brand mentions |
| Semantic Alignment | 15% | Topic coverage vs. tracked queries, conversational format |
| AI Accessibility | 10% | robots.txt allows AI bots, llms.txt present, JS rendering friendliness |

**Output Format:**
```
- overall_readiness_score (0-100%)
- category_breakdown (per-category score + per-factor scores)
- improvement_roadmap (ordered by impact / effort)
- industry_benchmark_comparison (when sufficient data exists)
- technical_fixes (with implementation instructions)
```

**Auto-triggered:** A11 is one of the three agents that run automatically during the New Business Onboarding workflow. These system-initiated runs use `transaction_type = 'system_grant'` and do not deduct user credits.

---

### A12: Ask Beamix (Conversational Analyst)

**Purpose:** Natural language interface for users to ask questions about their own data, receiving data-grounded, contextual answers in conversational format.

**Plan tier:** Pro+ (free for these users, 0 credits)
**Credit cost:** 0
**DB `agent_type`:** N/A — not an Inngest function. Direct API route.
**Implementation:** `POST /api/agents/chat` with SSE streaming. NOT stored in `agent_jobs`.

**NOT an Inngest function.** Ask Beamix requires SSE streaming which is incompatible with Inngest background functions. It is a direct API route handler.

**Vercel timeout:** Must set `export const maxDuration = 60` in the route file. Default 10s timeout is insufficient.

**Context assembled per turn:**
- Full business context (profile, industry, location, services)
- Latest 3 scan results with per-engine breakdowns
- Recent agent job history (last 10)
- Active recommendations
- Competitor comparison data
- Conversation history (current session only)

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Context + Query | Claude Sonnet 4.6 (SSE streaming) | Answer user question grounded in their business data | Streamed natural language response with data citations | 0.7 | 2,000 |

**Quality Gates:**
- System prompt explicitly prohibits fabricating data. If data doesn't exist: "I don't have data on that yet. Run a scan to generate this data."
- Responses streamed via SSE for real-time UX.
- Conversation is not stored permanently — exists only for the active session.

**Input:**
```typescript
{
  message: string
  business_id: string
  conversation_history?: Array<{role: 'user' | 'assistant', content: string}>
}
```

**Response:** SSE stream of text chunks. No `agent_jobs` row. No `content_items` row.

---

### A13: Content Voice Trainer

**Purpose:** Learn the business's unique writing voice from their existing web content, creating a reusable voice profile that all content-producing agents inject into their generation prompts.

**Priority: Growth Phase** — not launch critical. Close the gap against Goodie AI's "Author Stamp" feature.

**Plan tier:** Pro+
**Credit cost:** 1
**DB `agent_type`:** `content_voice_trainer`
**Stores output in:** `content_voice_profiles` table (not `content_items`)

**Input Parameters:**
```typescript
{
  website_url: string              // Defaults to businesses.website_url
  selected_pages?: string[]        // 3-5 pages to analyze. Auto-selected if not provided.
}
```

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Content Collection | cheerio (no LLM) | Crawl and extract clean text from 3-5 selected pages | Clean text corpus: 3,000-15,000 words of business's own writing | — | — |
| 2. Voice Profile Extraction | **Claude Opus 4.6** | Deep analysis of writing patterns across 8 dimensions | Structured voice profile document describing writing style | 0.5 | 3,000 |
| 3. Voice Verification | Claude Sonnet 4.6 | Generate a short sample paragraph in the extracted voice | 150-word sample paragraph for user approval | 0.7 | 500 |

**Why Opus for Stage 2:** Voice extraction requires detecting subtle stylistic patterns — the difference between "We believe in excellence" (corporate) and "We're obsessed with getting this right" (startup). This level of linguistic nuance benefits measurably from Opus-class reasoning. Voice profile quality is critical because the profile affects all subsequent content output across every content-generating agent. See §12.

**Voice Profile Dimensions:**
1. Formality level (1-10 scale)
2. Sentence complexity (simple/compound/complex preference)
3. Vocabulary sophistication (basic/intermediate/advanced)
4. Tone markers (warm/professional/authoritative/playful/urgent)
5. Rhetorical patterns (questions, calls-to-action, storytelling, data-driven)
6. Industry jargon usage (heavy/moderate/minimal)
7. First-person style (we/I/company name/passive)
8. Cultural markers (Israeli informality, English formality, bilingual patterns)

**Minimum Content Threshold:**
- < 300 words extracted: Skip voice training. Set profile status to `insufficient_content`. Show user message: "Not enough content to train voice profile — generate content first or add more pages."
- 300-1,000 words: Basic profile only (dimensions 1-4). Confidence flagged as "low."
- > 1,000 words: Full profile across all 8 dimensions.

**Quality Gates:**
- User must approve the verification sample (Stage 3) before the profile is activated.
- Profile auto-updates when user edits agent content (edit deltas analyzed monthly by `cron.voice-refinement`).

**Output Format (stored in `content_voice_profiles`):**
```typescript
{
  voice_description: string                    // LLM-generated description of the voice
  training_sources: Array<{type, url, excerpt_count}>
  example_excerpts: string[]                   // 5-10 representative text excerpts
  vocabulary_patterns: {
    preferred_words: string[],
    avoided_words: string[],
    sentence_length_distribution: object,
    paragraph_structure: string
  }
  is_default: boolean
}
```

**Auto-triggered:** A13 is one of the three agents that run automatically during the New Business Onboarding workflow. This system-initiated run uses `transaction_type = 'system_grant'`.

---

### A14: Content Pattern Analyzer

**Purpose:** Analyze structural and stylistic patterns of content that AI engines actually cite in the business's industry, then feed those patterns into content-producing agents to increase citation probability.

**Priority: Growth Phase** — not launch critical.

**Plan tier:** Pro+
**Credit cost:** 1
**DB `agent_type`:** `content_pattern_analyzer`
**Stores output in:** `agent_jobs.output_data` (patterns injected into A1/A2 system prompts)

**Input Parameters:**
```typescript
{
  industry_focus?: string          // Defaults to business's industry
  min_citation_count?: number      // Minimum citation frequency to include (default 3)
}
```

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Citation Crawl | cheerio (no LLM) | Fetch and extract content from top 10 most-cited URLs in business's industry | Clean text + structural metadata: word count, heading structure, list usage, FAQ presence, schema types | — | — |
| 2. Pattern Extraction | Claude Sonnet 4.6 | Analyze structural and stylistic patterns across cited content | Pattern report: common structures, typical word counts, heading patterns, FAQ formats, schema usage, citation density | 0.5 | 3,000 |
| 3. Template Generation | Claude Sonnet 4.6 | Translate patterns into actionable content templates for agents | 3-5 content templates: one per common content type, each specifying structure, length, sections, style notes | 0.5 | 2,000 |

**Quality Gates:**
- Analysis must cover at least 5 cited pages. If fewer than 5 citations exist, supplement with Perplexity research for top-ranking content in the industry.
- Patterns must be specific and actionable (e.g., "include FAQ with 5-7 questions, each 80-120 words") — not generic.

**Output Format:**
```
- pattern_analysis_report (what makes cited content successful)
- common_structural_patterns (heading hierarchy, section order, content blocks)
- length_and_format_benchmarks (word counts, list vs prose ratio, media usage)
- content_templates (3-5 templates, one per content type)
- gap_analysis (how business's current content compares to citation-winning patterns)
```

**Pattern refresh:** Templates are re-analyzed monthly via Inngest cron. Citation patterns shift as AI engines update training data.

**Auto-triggered:** A14 is one of the three agents that run automatically during the New Business Onboarding workflow. This system-initiated run uses `transaction_type = 'system_grant'`.

---

### A15: Content Refresh Agent

**Purpose:** Audit existing published content for staleness, outdated facts, and optimization opportunities, then produce updated versions. Transforms agents from one-shot creators into continuous content maintainers.

**Priority: Growth Phase** — not launch critical.

**Plan tier:** Pro+
**Credit cost:** 1
**DB `agent_type`:** `content_refresh`
**Content type:** `article` or `blog_post` (updated version of existing content)
**Content format:** `markdown`

**Input Parameters:**
```typescript
{
  content_item_ids?: string[]      // Specific items to refresh. Defaults to all published items older than 30 days.
}
```

**Trigger:** Also auto-triggered by `cron.content-refresh-check` (daily 6AM UTC) and the Content Lifecycle workflow chain (30 days after publication).

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Staleness Audit | Claude Haiku 4.5 | Compare each published item against current scan data and industry trends | Staleness report: freshness score (0-100), specific issues, update urgency (high/medium/low) | 0.3 | 2,000 |
| 2. Research Update | Perplexity Sonar Pro | For high-urgency items, gather latest data on topic | Updated facts, new statistics, recent developments | 0.5 | 1,500 |
| 3. Content Revision | Claude Sonnet 4.6 | Generate updated version preserving voice and structure, incorporating new data | Revised content with tracked changes (diff against original) | 0.6 | 4,000 |

**Quality Gates:**
- Only content with freshness score below 60 is flagged for update.
- Revisions must preserve original voice profile and structure — targeted updates only, not wholesale rewrites.
- User approves updates before they replace the original (presented as diff view in content library).

**Output Format:**
```
- content_freshness_audit (all published items scored)
- flagged_items (specific issues, update urgency)
- revised_content_drafts (for high-urgency items)
- diff_view (what changed and why)
```

---

### A16: Brand Narrative Analyst

**Purpose:** Understand WHY AI engines say what they say about a business — not just whether it is mentioned, but what narrative AI has constructed and what sources drive that narrative.

**Priority: Growth Phase** — not launch critical.

**Plan tier:** Pro+
**Credit cost:** 1
**DB `agent_type`:** `brand_narrative_analyst`
**Stores output in:** `brand_narratives` table AND `agent_jobs.output_data`

**Input Parameters:**
```typescript
{
  scan_history_days?: number       // How many days of scan history to analyze (default 90)
  include_competitor_comparison?: boolean
}
```

**LLM Pipeline:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Narrative Extraction | **Claude Opus 4.6** | Across all AI engine responses, identify recurring themes, framings, positioning | Narrative map: 3-5 core narratives AI tells about the brand, with supporting quotes, sentiment, cross-engine consistency | 0.5 | 4,000 |
| 2. Source Attribution | Claude Sonnet 4.6 | Identify which web sources likely drive each narrative element | Source-narrative linkage: which articles/pages cause AI to say specific things | 0.5 | 2,000 |
| 3. Narrative Strategy | Claude Sonnet 4.6 | Recommend how to reinforce positive narratives and counter negative ones | Action plan: content to create, sources to target, messaging to emphasize, narratives to counter | 0.7 | 3,000 |

**Why Opus for Stage 1:** Narrative extraction requires synthesizing across dozens of AI responses from different engines, identifying consistent themes versus outlier framings, and understanding the difference between what AI says explicitly versus what it implies. This is a high-reasoning task where Opus delivers measurably better outputs than Sonnet. See §12.

**Context Overflow Handling (when combined scan data exceeds 100K characters):**
1. Chunk input into 10K-character segments grouped by engine.
2. Summarize each chunk with Haiku (extract key narratives, themes, sentiment per chunk).
3. Synthesize all chunk summaries with Opus in Stage 1.
4. If content exceeds 200K characters after chunking: warn user that analysis is based on representative sample (most recent 3 scans per engine).

**Quality Gates:**
- Each narrative must be supported by at least 3 engine responses (not a one-off from a single engine).
- Source attribution must be grounded in actual citation data, not speculated.

**Output Format:**
```
- brand_narrative_map (3-5 core narratives with evidence and supporting quotes)
- narrative_sentiment_analysis (positive/negative/neutral per narrative)
- source_attribution (which web content drives each narrative)
- cross_engine_consistency (do all engines tell the same story?)
- strategic_action_plan (how to shift narrative through content and citations)
```

---

## 6. Agent Execution Flow

### How Execution Starts

1. **User triggers:** Clicks "Run Agent" on the hub or "Fix It" from a recommendation or ranking row.
2. **Browser navigates** to `/dashboard/agents/[agentType]` with optional `?recommendationId=` or `?query=` params.
3. **User fills input form** (pre-populated if query params present).
4. **User clicks "Run Agent"** button.
5. **Client sends** `POST /api/agents/[agentType]/execute` with the input form data.
6. **API route:**
   a. Authenticates user (Supabase session cookie)
   b. Validates agent type is available for user's tier (403 if not)
   c. Calls `hold_credits` RPC (402 if insufficient)
   d. Inserts `agent_jobs` row with `status = 'pending'`
   e. Emits Inngest event `agent/execute.start` with `{ jobId, agentType, businessId, userId, params }`
   f. Returns `202 Accepted` with `{ data: { job_id } }`
7. **Client opens SSE connection** to `GET /api/agents/[jobId]/stream` to receive real-time step updates.

### The `agent.execute` Inngest Function

**Trigger:** Event `agent/execute.start`
**Concurrency:** 20 system-wide, 5 per user (key: `event.data.userId`)
**Timeout:** 600s
**Retries:** 1

**Steps:**

**Step 1: `assemble-context`**
- Runs 5-8 parallel Supabase queries:
  1. Business profile (name, industry, location, services, website_url, description, language)
  2. Recent scan results (last 3 scans with per-engine breakdowns, scores, mention contexts, citations)
  3. Recent content (last 10 content items — title, type, agent_type, created_at, status — prevents duplicate generation)
  4. Tracked competitors (names and domains)
  5. Active recommendations (non-dismissed, with title, type, status)
  6. Voice profile (if A13 has run for this business)
  7. Content patterns (if A14 has run for this business)
  8. Pending agent jobs (any currently running agents, to prevent conflicting parallel execution)
- Updates `agent_jobs.status = 'running'`
- Inserts `agent_job_steps` row for this step with `status = 'running'`

**Step 2: `research`** (agent-specific)
- Perplexity Sonar Pro for most content agents (A1, A2, A6, A7, A8, A9, A15)
- Scan data extraction for A5 (FAQ), A3 (Schema), A10 (LLMS.txt), A11 (AI Readiness)
- Inserts `agent_job_steps` row: `{ step_name: 'research', model_used: 'perplexity-sonar-pro', ... }`

**Step 3: `outline`** (Claude Sonnet 4.6)
- Generates content structure based on research output and business context
- Inserts `agent_job_steps` row

**Step 4: `write`** (Claude Sonnet 4.6)
- Full content generation following outline
- If voice profile available: injects profile into system prompt as style guide
- If content patterns available: injects structural templates
- Inserts `agent_job_steps` row

**Step 5: `qa`** (GPT-4o)
- Scores output on 5 dimensions (factual accuracy, GEO optimization, readability, relevance, voice adherence)
- Composite score 0.00-1.00 stored in `agent_jobs.qa_score`
- If score < 0.7 on first attempt: retries write step with QA feedback
- If score < 0.7 on retry: calls `release_credits`, marks job `failed`, notifies user
- Inserts `agent_job_steps` row

**Step 6: `finalize`**
- Calls `confirm_credits` RPC (moves hold → used)
- For content-producing agents: inserts `content_items` row
- For A4, A8, A16: stores output in `agent_jobs.output_data`
- Updates `agent_jobs.status = 'completed'`, sets `completed_at`
- Emits `agent/execute.complete` event: `{ jobId, agentType, businessId, contentId? }`
- Creates `notifications` row: in-app notification of completion
- Sends Resend email via `agent-complete` template

### `agent_job_steps` Tracking

Every pipeline step writes a row to `agent_job_steps`. This is what the SSE stream reads to push real-time updates.

```sql
INSERT INTO agent_job_steps (
  agent_job_id,    -- FK to agent_jobs
  step_name,       -- 'research' | 'outline' | 'write' | 'qa' | 'finalize'
  step_order,      -- 1, 2, 3, 4, 5
  status,          -- 'running' → 'completed' | 'failed'
  input_summary,   -- Brief description of what went in
  output_summary,  -- Brief description of what came out (for chat display)
  model_used,      -- 'perplexity-sonar-pro' | 'claude-sonnet-4-6' | 'gpt-4o' | etc.
  tokens_used,     -- Token count for this step
  duration_ms,     -- Step execution time
  started_at,
  completed_at
)
```

### Credit Confirm on Success / Release on Failure

The credit RPC functions are idempotent. Inngest retries are safe because each RPC checks for an existing transaction before acting.

**On success:**
```typescript
await supabase.rpc('confirm_credits', { p_job_id: jobId })
// Decrements held_amount, increments used_amount
// Inserts transaction_type = 'confirm'
```

**On failure or cancellation:**
```typescript
await supabase.rpc('release_credits', { p_job_id: jobId })
// Decrements held_amount (credits return to available)
// Inserts transaction_type = 'release'
```

### Content Output Storage

For content-producing agents, the final output is stored in `content_items`:

```typescript
await supabase.from('content_items').insert({
  user_id,
  business_id,
  agent_job_id,          // FK back to the job
  agent_type,            // denormalized for filtering
  content_type,          // one of the 12 content types
  title,
  content_body,          // full markdown
  meta_description,
  content_format,        // 'markdown' | 'json_ld' | 'plain_text' | 'structured_report'
  status: 'draft',       // always starts as draft
  language,
  word_count,
  voice_profile_id,      // FK to content_voice_profiles if voice was used
})
```

### User Notification on Completion

When an agent job completes (success or failure):

1. **In-app notification:** Insert row into `notifications` table:
   ```typescript
   {
     user_id,
     type: 'agent_complete',
     severity: 'low',
     title: `${agentName} completed`,
     body: '...',
     action_url: `/dashboard/content/${contentId}` // if content produced
   }
   ```

2. **Email:** Send via Resend using the `agent-complete` template if user has `email_enabled = true`.

### SSE Stream for Real-Time Step Progress

**Route:** `GET /api/agents/[jobId]/stream`
**Auth:** Required. User must own the job.

The route opens an SSE connection and polls `agent_job_steps` every 500ms. When step status changes, it pushes an event:

```typescript
// SSE event format
data: {"type":"step_started","step":"research","model":"perplexity-sonar-pro","step_order":1}\n\n
data: {"type":"step_completed","step":"research","output_summary":"Found 8 relevant sources...","duration_ms":3240}\n\n
data: {"type":"step_started","step":"outline","model":"claude-sonnet-4-6","step_order":2}\n\n
// ...
data: {"type":"job_completed","content_id":"abc123","qa_score":0.84}\n\n
```

The SSE connection closes on `job_completed` or `job_failed`.

**Alternative:** Use Supabase Realtime subscriptions on `agent_job_steps` instead of polling. Either works. SSE polling is simpler to implement and avoids WebSocket complexity for this use case.

---

## 7. Agent Workflow Chains

Workflows are event-triggered multi-agent automation sequences. At launch, four pre-built workflows are available as simple ON/OFF toggles on the Agent Hub page. A custom workflow builder is deferred to Phase 3.

### Workflow 1: Visibility Drop Response

**Trigger:** `scan/complete` event where `scores.visibility_drop_pct > threshold` (user-configurable: 10%/15%/20%)

**Chain:**
```
1. A4 (Recommendations) — auto-runs with "urgent" flag, analyzes which queries dropped
2. A8 (Competitor Intelligence) — focused analysis on queries where visibility dropped
3. A1 (Content Writer) — auto-drafts content for the top gap identified by A4 and A8
4. Notification: "Visibility dropped 18%. We've drafted a recovery plan."
```

**Agent 3 (A1) runs only if** A8 identifies a clear content gap with sufficient context to produce a useful draft.

### Workflow 2: New Business Onboarding

**Trigger:** `onboarding/complete` event (emitted by `POST /api/onboarding/complete`)

**Chain:**
```
PARALLEL (Promise.all in Inngest step function):
  - A13 (Content Voice Trainer) — runs on user's website
  - A14 (Content Pattern Analyzer) — runs for user's industry
  - A11 (AI Readiness Auditor) — runs full audit

SEQUENTIAL (after all parallel agents complete):
  - A4 (Recommendations) — generates initial action items using outputs from A13, A14, A11

Notification: "Your AI profile is ready. Here are your top 3 priorities."
```

**Critical:** A13, A14, and A11 run in parallel via `Promise.all()`. A4 depends on their outputs and runs only after all three complete. All four use `transaction_type = 'system_grant'` — zero credits charged.

**Idempotency guard:** A13, A14, A11 system runs fire only when `user_profiles.onboarding_completed_at IS NULL` at the time of the event. Once set, this timestamp is permanent — no replay is possible.

### Workflow 3: Content Lifecycle

**Trigger:** `content/published` event (emitted when user publishes content from the content library)

**Chain:**
```
1. Snapshot current scan metrics for target queries (publication baseline)
2. Schedule: 30 days later, A15 (Content Refresh) audits the item
   - If freshness score < 60: auto-draft refresh, notify user
3. After each subsequent scan: correlate scan results for target queries with published content
4. After 7, 14, and 30 days: compute visibility delta
   - If visibility improved: notify "This content improved your ChatGPT ranking by 2 positions"
```

### Workflow 4: Competitor Alert Response

**Trigger:** `alert/rule.triggered` event where `alert_type = 'competitor_overtake'`

**Chain:**
```
1. A8 (Competitor Intelligence) — focused analysis on the overtaking competitor
2. A4 (Recommendations) — generates competitive response recommendations
3. Notification: "Competitor X overtook you for 'best Y in Z'. Here's our recommended response."
```

### Workflow Data Model

**`agent_workflows` table** stores user-enabled workflow configurations.

Key columns:
- `trigger_type`: `'visibility_drop' | 'scan_complete' | 'competitor_overtake' | 'schedule' | 'manual' | 'content_published' | 'sentiment_shift'`
- `trigger_config`: JSONB with threshold values, schedule cron, etc.
- `steps`: JSONB array of `WorkflowStep` objects (Zod-validated on write)
- `is_active`: boolean
- `max_runs_per_month`: integer safety limit (default 10)
- `runs_this_month`: counter, reset by `cron.monthly-credits`

**`workflow_runs` table** stores execution history for each workflow instance.

Key columns:
- `workflow_id`: FK to agent_workflows
- `trigger_event`: JSONB — the event that triggered this run
- `status`: `'running' | 'completed' | 'failed' | 'cancelled'`
- `steps_completed`: integer progress counter
- `agent_job_ids`: uuid[] — all agent_job IDs created during this run
- `credits_used`: integer total

**`workflow.execute` Inngest Function:**

**Trigger:** Event `workflow/trigger`
**Concurrency:** 5 total, 1 per user
**Timeout:** 1800s (30 minutes — workflows chain multiple agents)
**Retries:** 0 (individual agent steps have their own retries)

**Steps:**
1. `validate-workflow` — check workflow is active, user has credits, monthly run limit not exceeded
2. `create-run` — insert `workflow_runs` row
3. For each step in workflow.steps (sequential):
   a. `evaluate-condition` — check step condition against previous step outputs
   b. `execute-agent` — place credit hold, insert agent_job, send `agent/execute.start` event, wait for completion via Inngest `waitForEvent`
   c. `record-step` — update `workflow_runs.steps_completed`
4. `finalize-run` — update workflow_runs status, compute total credits used, notify user

**Credit handling in workflows:** Workflow steps that would exceed remaining credits are skipped with a notification rather than failing the entire workflow.

---

## 8. API Routes

All agent API routes require authentication. Auth is established via Supabase session cookie. All request bodies are Zod-validated before any business logic runs.

**Universal response shapes:**
- Success: `{ data: T }`
- Error: `{ error: string, code?: string }`

**Universal rate limiting:** Upstash Redis (`@upstash/ratelimit`) per user per route. Returns 429 with `Retry-After` header when exceeded.

### POST /api/agents/[agentType]/execute

**Purpose:** Trigger an agent execution.

**Auth:** Required. Must have active subscription (`status IN ('active', 'trialing')`).

**Path params:** `agentType` — kebab-case slug (e.g., `content-writer`)

**Request body:** Agent-specific Zod schema (varies by agent type — topic, tone, word count, target queries, etc.)

**Process:**
1. Resolve agentType slug to DB `agent_type` value (404 if unknown slug)
2. Verify agent is available for user's subscription tier (403 if not)
3. Check credit availability via `credit_pools` (available credits >= cost)
4. Call `hold_credits` RPC (402 if insufficient)
5. Insert `agent_jobs` row with `status = 'pending'`, `input_data = validatedBody`
6. Emit Inngest event: `agent/execute.start` with `{ jobId, agentType, businessId, userId, params }`
7. Return 202

**Response 202:**
```json
{ "data": { "job_id": "uuid" } }
```

**Errors:**
- 400: Validation failed, business not found
- 401: Not authenticated
- 402: Insufficient credits
- 403: Agent not available for tier, subscription not active
- 404: Unknown agent type

### GET /api/agents/[jobId]/status

**Purpose:** Poll for job status and step progress.

**Auth:** Required. User must own the job.

**Process:** Lookup `agent_jobs` by ID with joined `agent_job_steps` (ordered by `step_order`). Return current state.

**Response 200:**
```json
{
  "data": {
    "job_id": "uuid",
    "status": "running",
    "agent_type": "content_writer",
    "steps": [
      {
        "step_name": "research",
        "step_order": 1,
        "status": "completed",
        "output_summary": "Found 8 relevant sources...",
        "model_used": "perplexity-sonar-pro",
        "duration_ms": 3240
      },
      {
        "step_name": "outline",
        "step_order": 2,
        "status": "running",
        "started_at": "2026-03-08T10:00:00Z"
      }
    ],
    "qa_score": null,
    "content_id": null
  }
}
```

**Polling:** Client polls every 3 seconds while status is `'pending'` or `'running'`.

### GET /api/agents/[jobId]/stream

**Purpose:** SSE stream of real-time step events.

**Auth:** Required. User must own the job.

**Response:** `Content-Type: text/event-stream`

Each event is a JSON payload on the `data:` field:
```
data: {"type":"step_started","step":"research","model":"perplexity-sonar-pro","step_order":1}

data: {"type":"step_completed","step":"research","output_summary":"Found 8 sources","duration_ms":3240}

data: {"type":"job_completed","content_id":"abc123","qa_score":0.84}
```

Connection closes on `job_completed` or `job_failed`.

**Errors:** 401 if not authenticated. 403 if job doesn't belong to user. 404 if job not found. 409 if job already completed (return final status instead of stream).

### POST /api/agents/[jobId]/cancel

**Purpose:** Cancel a running agent.

**Auth:** Required. User must own the job.

**Process:**
1. Verify job is in `'pending'` or `'running'` status (409 if already completed/failed)
2. Update `agent_jobs.status = 'cancelled'`
3. Call Inngest cancellation API to stop the function run
4. Call `release_credits` RPC
5. Return 200

**Response 200:**
```json
{ "data": { "job_id": "uuid", "credits_released": true } }
```

### GET /api/agents/history

**Purpose:** List past agent runs for the authenticated user.

**Auth:** Required.

**Query params:**
- `business_id` (required)
- `agent_type?` — filter by specific agent
- `status?` — filter by status
- `page` (default 1)
- `per_page` (default 20)

**Response 200:**
```json
{
  "data": {
    "jobs": [...],
    "total": 47,
    "page": 1,
    "per_page": 20
  }
}
```

### POST /api/agents/chat (Ask Beamix — A12)

**Purpose:** Ask Beamix conversational streaming.

**Auth:** Required. Pro+ tier only (403 if Starter).

**Request body:**
```json
{
  "message": "Why did my ChatGPT visibility drop last week?",
  "business_id": "uuid",
  "conversation_history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

**Process:**
1. Verify Pro+ tier
2. Assemble business context (5 parallel queries)
3. Stream Claude Sonnet 4.6 response via SSE
4. No credit charge, no `agent_jobs` row, no `content_items` row

**Response:** `Content-Type: text/event-stream`. Each event is a text chunk.

**Vercel config required in this route file:**
```typescript
export const maxDuration = 60
```

---

## 9. Data Model

### `agent_jobs`

Tracks every agent execution — pending, running, completed, failed.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | FK auth.users |
| `business_id` | uuid | FK businesses |
| `agent_type` | text | Enum — see §11 for valid values |
| `status` | text | `'pending' \| 'running' \| 'completed' \| 'failed' \| 'cancelled'` |
| `input_data` | jsonb | User-provided parameters |
| `output_data` | jsonb | For non-content agents: full output. For content agents: summary only (content goes to content_items). |
| `qa_score` | numeric(3,2) | Quality gate score (0.00-1.00) |
| `error_message` | text | Error details if failed |
| `inngest_run_id` | text | Inngest function run ID for correlation |
| `created_at` | timestamptz | |
| `completed_at` | timestamptz | |

**Columns that do NOT exist on this table (from old schema):**
- ~~`title`~~ — title is on `content_items`
- ~~`summary`~~ — use `output_data`
- ~~`is_favorited`~~ — is_favorited is on `content_items`
- ~~`output_type`~~ — use `agent_type` to derive

### `agent_job_steps`

Individual steps within an agent execution. Provides granular progress tracking for the chat UI.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `agent_job_id` | uuid | FK agent_jobs |
| `step_name` | text | `'research' \| 'outline' \| 'write' \| 'qa' \| 'finalize'` |
| `step_order` | integer | Execution sequence (1-based) |
| `status` | text | `'pending' \| 'running' \| 'completed' \| 'failed' \| 'skipped'` |
| `input_summary` | text | What went into this step (for display) |
| `output_summary` | text | What came out (for display in chat) |
| `model_used` | text | Which LLM model ran this step |
| `tokens_used` | integer | Token consumption |
| `duration_ms` | integer | Step execution time |
| `started_at` | timestamptz | |
| `completed_at` | timestamptz | |

**Index:** `(agent_job_id, step_order)` — ordered steps for a job.
**RLS:** Users can SELECT steps where the parent `agent_job_id` belongs to them (join through agent_jobs). Service role writes.

### `content_items`

The user's content library. Every piece of content generated by agents.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | FK auth.users |
| `business_id` | uuid | FK businesses |
| `agent_job_id` | uuid | FK agent_jobs — which agent created this |
| `agent_type` | text | Denormalized for filtering |
| `content_type` | text | One of 12 types — see §11 |
| `title` | text | Content title |
| `content_body` | text | Full content (Markdown) |
| `meta_description` | text | SEO meta description |
| `content_format` | text | `'markdown' \| 'html' \| 'json_ld' \| 'plain_text' \| 'structured_report'` |
| `status` | text | `'draft' \| 'in_review' \| 'approved' \| 'published' \| 'archived'` |
| `language` | text | `'en' \| 'he'` |
| `word_count` | integer | |
| `tags` | text[] | User-assigned tags |
| `published_url` | text | External URL after CMS publish |
| `published_at` | timestamptz | |
| `is_favorited` | boolean | User bookmarked |
| `voice_profile_id` | uuid | FK content_voice_profiles — voice profile used for generation |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**RLS:** Users can SELECT, UPDATE (title, status, content_body, is_favorited, tags), DELETE own content. Only service role can INSERT (agent pipeline creates content).

### `content_voice_profiles`

Trained voice profiles created by A13.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `business_id` | uuid | FK businesses |
| `user_id` | uuid | FK auth.users |
| `name` | text | Profile name |
| `voice_description` | text | LLM-generated description of the voice (8 dimensions) |
| `training_sources` | jsonb | Array of `{type, url_or_id, excerpt_count}` |
| `example_excerpts` | text[] | 5-10 representative text excerpts (used as few-shot examples) |
| `vocabulary_patterns` | jsonb | Preferred words, avoided words, sentence length, paragraph structure |
| `is_default` | boolean | Default voice for this business |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**How voice profiles are injected into agents:** All content-producing agents (A1, A2, A5, A7) include the voice profile in their system prompts via a structured injection:

```
Write in a tone that is:
- Formality: [7/10] — professional but not stiff
- Sentence style: [compound sentences preferred]
- Vocabulary: [moderate industry jargon]
- Person: [first-person plural 'we']
- Feel: [warm but authoritative]

Style examples from this business:
[example_excerpts injected as few-shot examples]
```

### Connection: `agent_jobs` → `content_items`

```
agent_jobs.id ←→ content_items.agent_job_id (FK)
```

A content-producing agent run creates exactly one `agent_jobs` row and zero or one `content_items` rows. An `agent_jobs` row with `status = 'failed'` has no associated `content_items` row.

For non-content agents (A4, A6, A7, A8, A16), the output lives in `agent_jobs.output_data`. There is no `content_items` row.

---

## 10. Cross-Agent Memory

**Priority: Moat Builder** — not launch critical.

### The Concept

Agents remember previous outputs and user edits across executions. This creates a flywheel: more usage → better personalization → less editing → higher satisfaction → more usage.

### How User Edits Feed Back as Voice Training Signals

When users edit agent-generated content before publishing, those edits are the highest-quality feedback signal available:

1. When a user modifies a `content_items` row, the system stores the diff (original vs. edited version).
2. Monthly Inngest cron (`cron.voice-refinement`) runs at Sunday 3AM UTC.
3. For each business with 3+ content edits since last refinement:
   - Analyze the pattern of edits using Haiku.
   - Extract common edit patterns (e.g., "user always removes the introductory paragraph," "user consistently shortens sentences").
   - Append extracted patterns to the voice profile.
4. Refined voice profiles produce progressively more personalized content.

**`cron.voice-refinement` function:**
- Trigger: `0 3 * * 0` (weekly, Sunday 3:00AM UTC)
- Step 1: Find voice profiles used by ≥3 content agents since last refinement.
- Step 2: Collect content performance metrics for each profile.
- Step 3: Run Claude Opus (`claude-opus-4-6`) with existing voice profile + performance feedback to produce updated profile. Store as new version (keep previous for rollback).
- Step 4: Send in-app notification that voice profile was refined.

### The `content_voice_profiles` Table Role

The `content_voice_profiles` table is the persistent store for learned brand voice. It is the cross-agent memory for content style. When A1, A2, A5, or A7 runs, it queries this table to inject the business's voice into its generation prompt.

### Status

Cross-Agent Memory is a Moat Builder feature. At launch, voice profiles are trained once (by A13 during onboarding or on-demand) and used by content agents. The progressive refinement loop (edit capture → monthly analysis → profile update) is the Growth Phase / Moat Builder component.

---

## 11. Enum Values and Constants

### `agent_jobs.agent_type` Valid Values

These are the exact CHECK constraint values in the database:

```sql
CHECK IN (
  'content_writer',
  'blog_writer',
  'schema_optimizer',
  'recommendations',
  'faq_agent',              -- NOT 'query_researcher'
  'review_analyzer',
  'social_strategy',
  'competitor_intelligence', -- NOT 'competitor_research'
  'citation_builder',
  'llms_txt',
  'ai_readiness',
  'content_voice_trainer',
  'content_pattern_analyzer',
  'content_refresh',
  'brand_narrative_analyst'
)
```

**Commonly confused values:**
- `'faq_agent'` — NOT `'faq'` or `'query_researcher'`
- `'competitor_intelligence'` — NOT `'competitor_research'`
- `'content_voice_trainer'` — NOT `'voice_trainer'`
- `'brand_narrative_analyst'` — NOT `'brand_narrative'`

### `content_items.content_type` Valid Values (12 Types)

```sql
CHECK IN (
  'article',
  'blog_post',
  'faq',
  'social_post',
  'schema_markup',
  'llms_txt',
  'outreach_template',
  'comparison',
  'ranked_list',
  'location_page',
  'case_study',
  'product_deep_dive'
)
```

### `content_items.content_format` Valid Values

```sql
CHECK IN (
  'markdown',
  'html',
  'json_ld',        -- NOT 'json-ld' and NOT raw 'json'
  'plain_text',
  'structured_report'
)
```

### Agent to Content Type Mapping

| Agent | `content_type` | `content_format` |
|-------|---------------|-----------------|
| A1 Content Writer | `article` / `location_page` / `comparison` | `markdown` |
| A2 Blog Writer | `blog_post` | `markdown` |
| A3 Schema Optimizer | `schema_markup` | `json_ld` |
| A5 FAQ Agent | `faq` | `markdown` |
| A6 Review Analyzer | — (output_data only) | `structured_report` |
| A7 Social Strategy | — (output_data only) | `structured_report` |
| A8 Competitor Intelligence | — (output_data only) | `structured_report` |
| A9 Citation Builder | `outreach_template` | `plain_text` |
| A10 LLMS.txt Generator | `llms_txt` | `plain_text` |
| A11 AI Readiness Auditor | — (output_data only) | `structured_report` |
| A13 Content Voice Trainer | — (voice_profiles table) | — |
| A14 Content Pattern Analyzer | — (output_data only) | `structured_report` |
| A15 Content Refresh Agent | `article` / `blog_post` | `markdown` |
| A16 Brand Narrative Analyst | — (brand_narratives table + output_data) | `structured_report` |

### `credit_transactions.transaction_type` Valid Values

```sql
CHECK IN (
  'allocation',
  'hold',
  'confirm',
  'release',
  'topup',        -- NOT 'bonus'
  'rollover',
  'expire',
  'system_grant'  -- zero-cost system-initiated agent runs
)
```

### `agent_jobs.status` Valid Values

```sql
CHECK IN ('pending', 'running', 'completed', 'failed', 'cancelled')
```

### `subscriptions.status` Valid Values

```sql
CHECK IN ('trialing', 'active', 'past_due', 'cancelled', 'paused')
-- UK spelling: 'cancelled' NOT 'canceled'
```

### `plan_tier` Enum

```sql
CHECK IN ('starter', 'pro', 'business')
-- NO 'free' value. Free tier = null plan_id on subscriptions table.
```

### URL Slug Constants (for routing)

```typescript
// src/lib/agents/config.ts — extend AGENT_CONFIG with all 16 agents
const AGENT_SLUGS = [
  'content-writer',
  'blog-writer',
  'schema-optimizer',
  'recommendations',
  'faq',
  'review-analyzer',
  'social-strategy',
  'competitor-intelligence',
  'citation-builder',
  'llms-txt',
  'ai-readiness',
  'ask-beamix',
  'voice-trainer',
  'pattern-analyzer',
  'content-refresh',
  'brand-narrative',
] as const
```

### Inngest Event Names

All events use `/` separators (not `.`):

```
agent/execute.start     — trigger an agent job
agent/execute.complete  — agent job finished
workflow/trigger        — trigger a workflow
onboarding/complete     — user completed onboarding
content/published       — user published a content item
```

---

## 12. Engineering Notes

### Why Opus for A13 and A16

Both agents require frontier-level reasoning quality that measurably impacts product value:

**A13 (Content Voice Trainer):** Voice profile extraction requires detecting subtle stylistic patterns across 8 dimensions — the difference between "We believe in excellence" (corporate) and "We're obsessed with getting this right" (startup). More importantly, the voice profile affects ALL subsequent content output from A1, A2, A5, and A7. A low-quality voice profile degrades every piece of content generated after training. The one-time Opus cost is justified by the compounding quality impact on all downstream content.

**A16 (Brand Narrative Analyst):** Narrative extraction requires synthesizing across dozens of AI responses from different engines, identifying consistent themes versus outlier framings, and understanding implied vs. explicit messaging. This is a high-reasoning task where Opus delivers measurably better output than Sonnet. The narrative report directly drives the user's content strategy for fixing AI perception.

Both agents have context overflow handling: if input exceeds 100K characters, Haiku summarizes chunks first, then Opus synthesizes the summaries. This keeps the Opus call count bounded.

### Why GPT-4o for QA Gates

The core rule: **the model that generates content never grades its own work.**

If Claude Sonnet writes the content and Claude Sonnet evaluates it, both models share the same training data, the same biases, and the same systematic blind spots. GPT-4o as the QA gate is from a different vendor with different training. This cross-model review catches:
- Hallucinations that Sonnet would accept as plausible
- Tonal issues that Sonnet is blind to in its own output
- GEO optimization gaps that Sonnet optimized for without realizing the pattern is common

**QA Fallback Chain** (when GPT-4o is unavailable):
1. Primary: GPT-4o
2. Fallback: Gemini 1.5 Pro (different vendor — maintains cross-vendor principle)
3. Last resort: Deliver output with "unreviewed" flag in content library. **Never use Sonnet to QA Sonnet-generated content.**

### Why Perplexity for Research Stages

Perplexity Sonar Pro returns grounded, cited answers from live web data. Every content agent begins with a Perplexity research step to ensure outputs contain current facts, not training-data fossils. This is critical because:
- AI engines favor content with recent, accurate statistics
- Business environments change (new competitors, pricing shifts, regulation)
- Generic SEO best practices from 2023 do not apply to GEO optimization in 2026

Perplexity natively returns source URLs alongside its answers, which the research step extracts and stores for citation tracking.

**Rate limiting note:** Perplexity Sonar Pro is rate-limited to 40 RPM. A8 (Competitor Intelligence) claims 40% of this budget (16 RPM) when running. Engineer the adapter with exponential backoff and a DeepSeek fallback.

### Why cheerio for Content Scraping

cheerio fetches and parses HTML server-side without a headless browser. It is used by A3 (Schema Optimizer), A10 (LLMS.txt Generator), A11 (AI Readiness Auditor), A13 (Content Voice Trainer), and A14 (Content Pattern Analyzer).

Benefits over Playwright/Puppeteer:
- No headless browser overhead (dramatically lower memory and execution time)
- No anti-bot detection risk
- Sub-second page fetches vs. 5-15 seconds for browser rendering
- Works in Vercel serverless without special configuration

Limitation: Pages that require JavaScript to render content (SPAs without SSR) will not return full content via cheerio. For these pages, A11 notes the limitation in its audit output but does not fall back to browser simulation at launch.

### A8 Cost Multiplier

A8 is the most expensive agent to run in terms of LLM cost, even though it costs the user only 1 credit.

**Why:** A8 executes a full scan for each tracked competitor across all active engines:
- 3 tracked competitors × 25 tracked queries × 8 engines = 600 engine calls
- Parsing: 600 responses × 5 Haiku stages = 3,000 Haiku calls (~$3.00)
- Engine calls: ~600 × $0.004 average = ~$2.40
- Comparative analysis: Sonnet × 2 = ~$0.50
- **Total per A8 run: $3-6 LLM cost**

Compare to a typical content agent run:
- Research (Perplexity): ~$0.03
- Outline (Sonnet): ~$0.03
- Write (Sonnet): ~$0.08
- QA (GPT-4o): ~$0.03
- **Total per typical run: ~$0.15-0.40**

A8 is 3-6x more expensive per execution than any other agent. Mitigation strategies:
1. Competitor research results cached 24 hours per competitor domain
2. A8 runs are queued with a max queue depth of 5 concurrent runs
3. Perplexity fallback to DeepSeek when rate-limited (lower cost)
4. A8 is limited to Pro+ tier users (not Starter)

### The "Ask Beamix is Not Inngest" Rule

A12 (Ask Beamix) must NOT be implemented as an Inngest function. Inngest is designed for background job execution where the caller does not wait for the response. SSE streaming requires an open HTTP connection for the duration of the response — incompatible with Inngest's event-driven model.

A12 is implemented as a direct Next.js Route Handler at `/api/agents/chat` using the `ReadableStream` pattern. The route must set `export const maxDuration = 60` to extend the Vercel timeout from the default 10 seconds.

### Existing Codebase State

The current codebase at `/saas-platform/src/lib/agents/config.ts` defines `AGENT_CONFIG` with only 7 agents and uses credit costs that differ from the system design (e.g., Content Writer = 3 credits, Blog Writer = 5 credits, Schema = 2 credits). The system design spec is authoritative: all agents cost 1 credit each.

The `execute.ts` file also references a `deduct_credits` RPC that does not exist in the DB spec. The correct RPC names are `hold_credits`, `confirm_credits`, and `release_credits` (the hold/confirm/release pattern, not a direct deduct).

When rebuilding the agent execution layer:
1. Extend `AGENT_CONFIG` to cover all 16 agents
2. Correct credit costs to 1 per agent (except A4 = 0 and A12 = 0)
3. Replace the direct `deduct_credits` call with the hold/confirm/release pattern
4. Wire the Inngest event emission (`agent/execute.start`) instead of running the mock synchronously
5. The `agent_jobs` table insert in `execute.ts` uses columns that do not exist on the live table (`input_params`, `credits_cost`, `llm_calls_count`, `runtime_ms`). The correct column name is `input_data`, and the other columns do not exist. Use the schema defined in §9 of this document.

### Build Order

**Launch Critical (build first):**
- A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11, A12
- Credit hold/confirm/release pattern
- Agent hub page with 12 agents
- Agent chat page with SSE streaming
- Workflow 2 (New Business Onboarding) — runs on signup

**Growth Phase (build after launch):**
- A13, A14, A15, A16
- Workflow 1 (Visibility Drop Response)
- Workflow 3 (Content Lifecycle)
- Workflow 4 (Competitor Alert Response)
- `cron.voice-refinement`
- `cron.content-refresh-check`

**Moat Builder (build at 3-6 months):**
- Agent Suggestion Engine (dashboard recommends which agent to run next)
- Cross-Agent Memory progressive refinement loop
- Custom workflow builder (visual chain builder)
