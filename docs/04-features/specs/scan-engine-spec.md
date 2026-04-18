# Beamix — Scan Engine Technical Spec

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Audience:** Engineers building the scan engine. You should be able to implement this feature end-to-end without reading any other document.
> **Source of truth:** `docs/03-system-design/ARCHITECTURE.md`, `docs/04-features/specs/scan-page.md`

---

## Scan Wizard (Implemented — 2026-03-19)

Email-first step-by-step scan flow. Implemented in commit `92a5666`.

The wizard guides anonymous users through:
1. Enter email address
2. Enter business name / website
3. Select scan engines (or use defaults)
4. View results

This replaced the single-form scan approach. The wizard improves conversion by reducing upfront friction.
**Implementation:** `saas-platform/src/app/scan/` — scan page + wizard step components

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Scope and Boundaries](#2-scope-and-boundaries)
3. [User Flows](#3-user-flows)
4. [Data Model](#4-data-model)
5. [Free Scan to Import Flow (C3)](#5-free-scan-to-import-flow-c3)
6. [Scan Engine Architecture](#6-scan-engine-architecture)
7. [Prompt Generation System](#7-prompt-generation-system)
8. [Response Parsing Pipeline — 6 Stages](#8-response-parsing-pipeline--6-stages)
9. [Visibility Scoring Algorithm](#9-visibility-scoring-algorithm)
10. [Inngest Background Jobs](#10-inngest-background-jobs)
11. [API Routes](#11-api-routes)
12. [Rate Limits and Plan Tiers](#12-rate-limits-and-plan-tiers)
13. [Scan Result Page](#13-scan-result-page)
14. [Error Handling](#14-error-handling)
15. [Engineering Notes](#15-engineering-notes)

---

## 1. Feature Overview

The scan engine is the foundation of Beamix. Every other feature — the dashboard, recommendations, agent system, analytics — depends on reliable scan data. Without the scan engine, there is no product.

**What it does:** The scan engine queries multiple AI search engines (ChatGPT, Gemini, Perplexity, Claude, and others by tier) with real natural-language prompts about a business. It then parses each response through a 6-stage pipeline to extract: was the business mentioned, at what position, with what sentiment, which sources were cited, which competitors appeared, and what context surrounded the mention. From these parsed results, it computes a 0-100 visibility score and stores everything in a normalized relational schema.

**Business value:**
- The free scan (anonymous, no login) is the primary user acquisition funnel. A business owner enters their URL, gets a visibility score in under 60 seconds, and sees exactly where they stand versus competitors across AI engines. This creates the emotional hook that drives signups.
- For paying users, recurring scheduled scans (daily or more frequently, by tier) provide week-over-week trend data that makes the dashboard valuable over time.
- Every recommendation, every agent suggestion, and every content ROI calculation downstream depends on accurate scan data.

**The core insight:** AI search engines are trained on web content and return different businesses for the same queries based on how well those businesses are represented online. The scan engine makes that invisible signal visible and measurable.

---

## 2. Scope and Boundaries

### In Scope — Phase 1 (Launch)

- Anonymous free scan: 4 engines (ChatGPT, Gemini, Perplexity, Claude), 3 prompts per scan
- Manual authenticated scan: same 4 engines, 5 prompts per tracked query
- Scheduled scan: same 4 engines, 5 prompts per tracked query, runs on cron per tier
- All 6 stages of the response parsing pipeline
- Visibility score computation (0-100)
- AI readiness score (0-100, quick assessment from website crawl)
- Free scan result page at `/scan/[scan_id]` — public, shareable, 30-day expiry
- Free scan to dashboard import on signup (C3 flow)
- IP-based rate limiting for free scans (3 per IP per 24 hours)

### In Scope — Phase 2 (Growth)

- Build tier: +3 engines (Grok, DeepSeek, You.com) = 7 engines total
- Extended prompt volume per scan

### Explicitly Deferred — Phase 3

- **Bing Copilot:** No public API. Requires Playwright browser simulation. Infrastructure not yet built. Do not reference as a current capability.
- **Google AI Overviews:** No API. Browser simulation required.
- **Meta AI:** No public API.

### What the Scan Engine Does NOT Do

- The scan engine does not generate content. That is the agent system.
- The scan engine does not send emails or notifications directly. It fires Inngest events; downstream functions handle notifications.
- The scan engine does not store raw LLM responses (only the hash for deduplication). Raw responses are parsed and discarded.
- The scan engine does not run inside API route handlers. All scan work happens in Inngest step functions. The API route only validates input, inserts a pending row, and sends the Inngest event.

---

## 3. User Flows

### 3.1 Free Scan Flow (Anonymous)

This is the viral acquisition funnel. No login required.

```
1. User visits /scan or submits form on landing page
2. User enters: business name, website URL, industry, optional location, language (en/he)
3. Client POSTs to /api/scan/start
4. API validates input (Zod), checks IP rate limit against free_scans table
5. API generates nanoid for scan_id, inserts free_scans row (status: 'pending')
6. API sends Inngest event scan/free.start with { scan_id, business_name, website_url, industry, location, language }
7. API returns 202: { data: { scan_id } }
8. Client redirects to /scan/[scan_id]
9. Client polls GET /api/scan/[scan_id]/status every 3 seconds
10. While polling: UI shows animated engine-checking screen (fake-sequential animation, real parallel processing)
11. Inngest scan.free.run function completes (30-60 seconds typically)
12. Inngest updates free_scans row: status='completed', results_data={...}
13. Next poll returns status='completed'
14. Client fetches GET /api/scan/[scan_id]/results
15. Client renders full results page with animation sequence
16. Page shows: score, leaderboard, per-engine breakdown, top competitor, 3 quick wins, blurred CTA
17. Conversion CTA passes ?scan_id=[scan_id] to signup URL
```

**Error path:** If scan fails, Inngest updates status='failed'. Status endpoint returns 'failed'. Client shows retry button. No charge to platform budget.

**Expiry:** `free_scans` rows without `converted_user_id` are deleted by `cron.cleanup` after 14 days. The public `/scan/[scan_id]` page shows an "expired" state after 30 days (soft expiry via `created_at` check; the row may still exist for analytics).

### 3.2 Manual Scan Flow (Authenticated)

For paying users who want an on-demand scan outside the scheduled cadence.

```
1. User clicks "Scan Now" button in dashboard (Engine Status zone or Rankings page)
2. Client POSTs to /api/scan/manual with { business_id }
3. API validates auth, verifies user owns business
4. API checks rate limit for user's tier (Discover: 1/week, Build: 1/day, Scale: 1/hour)
5. If rate limit exceeded: return 429 with Retry-After header showing next available time
6. API creates scans row (status: 'pending', scan_type: 'manual')
7. API sends Inngest event scan/manual.start
8. API returns 202: { data: { scan_id } }
9. Dashboard subscribes to Supabase Realtime on the scans table for this business
10. Inngest scan.manual.run function completes (60-300 seconds for full scan)
11. Realtime subscription fires when scans row updates to status='completed'
12. Dashboard invalidates all React Query cache entries with key ['dashboard']
13. Dashboard re-fetches data; scan results are now reflected
```

### 3.3 Scheduled Scan Flow (Cron)

Automated scanning that runs per-tier cadence without user action.

```
1. cron.scheduled-scans fires every hour at :00
2. Function queries: SELECT id FROM businesses WHERE next_scan_at <= NOW() AND EXISTS (active subscription)
3. For each due business: sends Inngest event scan/scheduled.start
4. Each scan.scheduled.run executes independently
5. On completion: updates businesses.last_scanned_at and computes next_scan_at based on plan tier
6. Alert evaluation fires, workflow triggers evaluated, recommendations generated
7. User sees updated dashboard on next visit or via Realtime if dashboard is open
```

**Cadence by tier:**
- Free: No scheduled scans
- Discover: Monthly (scan_frequency_days = 30)
- Build: Daily (scan_frequency_days = 1)
- Scale: Every 4 hours (scan_frequency_days = 0.17, effectively 6/day)

---

## 4. Data Model

All tables live in the `public` schema in Supabase PostgreSQL. Every table has RLS enabled unless explicitly noted. Service role key (used only in Inngest functions) bypasses RLS.

### 4.1 `free_scans`

Anonymous one-time scans. No user FK. RLS disabled — accessed by unguessable nanoid.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, gen_random_uuid() | Internal primary key |
| scan_id | text | UNIQUE NOT NULL | Public URL identifier (nanoid, e.g. `sc_4xkP9mN2`) |
| business_name | text | NOT NULL | Business name entered by user |
| website_url | text | NOT NULL | URL entered |
| industry | text | NOT NULL | Industry key — maps to `constants/industries.ts` |
| location | text | | Optional — city or region |
| language | text | DEFAULT 'en' | Scan language: 'en' or 'he' |
| status | text | NOT NULL DEFAULT 'pending' | CHECK IN ('pending', 'processing', 'completed', 'failed') |
| results_data | jsonb | | Full scan results blob (see ScanResultsData type below) |
| ip_address | text | | For rate limiting |
| converted_user_id | uuid | FK → auth.users(id) | Set when user signs up and imports this scan |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | |
| completed_at | timestamptz | | When scan finished |

**Indexes:**
- UNIQUE on `scan_id`
- `idx_free_scans_ip_date` on `(ip_address, created_at)` — rate limit check
- `idx_free_scans_status` on `(status)` WHERE `status = 'pending'`
- `idx_free_scans_cleanup` on `(created_at)` WHERE `converted_user_id IS NULL`

**Why no RLS:** The scan_id is a nanoid (unguessable). Rate limiting is IP-based in the API layer. This table needs to be writable by Inngest (service role) and readable by anonymous requests (scan status polling).

**results_data JSONB shape:**

```typescript
interface ScanResultsData {
  overall_score: number;                    // 0-100
  rank_position: number | null;             // null = not found in any engine
  projected_rank: number;                   // Estimated rank after optimization (v1: heuristic)
  total_businesses_in_category: number;     // For "X out of Y" framing
  competitors: Array<{
    name: string;
    score: number;
    rank: number;
  }>;
  top_competitor: {
    name: string;
    score: number;
    rank: number;
  };
  per_engine_results: Array<{
    engine: string;                         // 'chatgpt' | 'gemini' | 'perplexity' | 'claude'
    rank: number | null;
    sentiment_score: number;                // 0-100 integer
    sentiment_label: 'positive' | 'neutral' | 'negative'; // derived: 0-33=negative, 34-66=neutral, 67-100=positive
    mentioned: boolean;
  }>;
  ai_readiness_score: number;              // 0-100 from website crawl
  quick_wins: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;                                       // Exactly 3 for free scan
  full_recommendations_count: number;       // Gated count shown in CTA
}
```

### 4.2 `scans`

Authenticated scans for paying users. One row per scan cycle per business.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL FK → businesses(id) CASCADE | Scanned business |
| user_id | uuid | NOT NULL FK → auth.users(id) CASCADE | Scan owner |
| scan_type | text | NOT NULL | CHECK IN ('scheduled', 'manual', 'import') |
| status | text | NOT NULL DEFAULT 'pending' | CHECK IN ('pending', 'processing', 'completed', 'failed') |
| overall_score | integer | CHECK (0-100) | Composite visibility score |
| engines_queried | text[] | | Which engines were queried |
| prompts_used | integer | | Total prompts sent |
| results_summary | jsonb | | Aggregated quick results (quick wins, top competitor) |
| error_message | text | | If status = 'failed' |
| scanned_at | timestamptz | NOT NULL DEFAULT NOW() | Scan initiation timestamp |
| completed_at | timestamptz | | Scan completion timestamp |

**Indexes:**
- `idx_scans_biz_date` on `(business_id, scanned_at DESC)` — most queried index: dashboard trend chart, historical comparisons
- `idx_scans_user_date` on `(user_id, scanned_at DESC)` — user scan history
- `idx_scans_status` on `(status)` WHERE `status IN ('pending', 'processing')` — active scan lookups

**RLS:**
- SELECT: `user_id = auth.uid()`
- INSERT/UPDATE: service role only (Inngest functions)

**Note:** `scans` does NOT have an `avg_position` column. Per-engine positions live in `scan_engine_results`. The aggregate visibility score is in `overall_score`.

### 4.3 `scan_engine_results`

Per-engine, per-prompt results. Normalized rows — one row per engine per prompt per scan. This is the raw data that feeds all analytics.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, gen_random_uuid() | Primary key |
| scan_id | uuid | NOT NULL FK → scans(id) CASCADE | Parent scan |
| business_id | uuid | NOT NULL FK → businesses(id) CASCADE | Denormalized for query performance |
| engine | text | NOT NULL | 'chatgpt', 'gemini', 'perplexity', 'claude', 'grok', 'deepseek', 'you_com' |
| prompt_text | text | NOT NULL | The exact prompt sent |
| prompt_category | text | | CHECK IN ('recommendation', 'comparison', 'specific', 'review', 'authority') |
| is_mentioned | boolean | NOT NULL DEFAULT false | Whether business appeared in response |
| rank_position | integer | CHECK (>= 1) | Ordinal position in response (1=first mention), NULL if not mentioned |
| sentiment_score | integer | CHECK (0-100) | 0=strongly negative, 50=neutral, 100=strongly positive. Integer, NOT enum. |
| mention_context | text | | 2-3 sentences surrounding the mention (Stage 6 output) |
| competitors_mentioned | text[] | DEFAULT '{}' | Other business names found in response |
| citations | jsonb | DEFAULT '[]' | Array of `{ url: string, title: string, domain: string }` |
| prompt_library_id | uuid | FK → prompt_library(id) | Links result to prompt template for volume aggregation |
| raw_response_hash | text | | SHA-256 of raw response (deduplication/change detection) |
| tokens_used | integer | | LLM tokens consumed |
| latency_ms | integer | | Engine response time in ms |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | |

**Indexes:**
- `idx_engine_results_scan` on `(scan_id)` — join from scans to results
- `idx_engine_results_biz_engine` on `(business_id, engine)` — per-engine trend queries
- `idx_engine_results_biz_date` on `(business_id, created_at DESC)` — time-series queries

**RLS:**
- SELECT: via join — `business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())`
- INSERT: service role only

**Critical design decision — sentiment_score as integer (0-100), NOT enum:**
Competitors (Peec, SE Visible, Goodie) use a numeric scale. An integer enables trend analysis ("sentiment declined from 72 to 58 over 30 days"), threshold alerting ("alert when sentiment drops below 40"), and finer competitive benchmarking. The Haiku parser outputs a number; storing it as-is preserves full information instead of bucketing it.

### 4.4 `citation_sources`

Aggregated citation URL tracking. One row per source URL per business, updated (not inserted) on each scan. Enables the Citation Analytics dashboard feature.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL FK → businesses(id) CASCADE | Business being cited about |
| source_url | text | NOT NULL | The cited URL |
| source_domain | text | NOT NULL | Extracted domain |
| source_title | text | | Page title if available |
| first_seen_at | timestamptz | NOT NULL DEFAULT NOW() | When this source first appeared |
| last_seen_at | timestamptz | NOT NULL DEFAULT NOW() | Most recent appearance |
| mention_count | integer | NOT NULL DEFAULT 1 | Times cited across all scans |
| engines | text[] | NOT NULL | Which engines cite this source |
| sentiment_avg | integer | | Average sentiment when this source is cited |
| is_own_domain | boolean | NOT NULL DEFAULT false | Whether the URL belongs to the business |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | |

**Indexes:**
- `idx_citation_sources_biz` on `(business_id, mention_count DESC)` — top cited sources
- `idx_citation_sources_domain` on `(business_id, source_domain)` — domain grouping
- UNIQUE on `(business_id, source_url)` — upsert key

**Upsert pattern (post-scan pipeline):** For each URL in `scan_engine_results.citations` across all results for a scan:
```sql
INSERT INTO citation_sources (business_id, source_url, source_domain, engines, ...)
VALUES (...)
ON CONFLICT (business_id, source_url)
DO UPDATE SET
  last_seen_at = NOW(),
  mention_count = citation_sources.mention_count + 1,
  engines = array_distinct(citation_sources.engines || EXCLUDED.engines),
  sentiment_avg = (citation_sources.sentiment_avg + EXCLUDED.sentiment_avg) / 2;
```

### 4.5 Supporting Tables Referenced by Scan Engine

**`prompt_library`** — Curated prompts per industry, with estimated volume data. The scan engine reads from this table to select prompts and writes back (via `aggregate-prompt-data` step) to update usage statistics.

Key columns: `id`, `prompt_text`, `industry`, `category`, `language`, `estimated_volume`, `trending_direction`.

**`tracked_queries`** — Per-business queries to monitor. The scheduled scan engine reads these to know what to scan. Tier limits: Discover 10, Build 25, Scale 75.

Key columns: `id`, `business_id`, `user_id`, `query_text`, `category`, `is_active`.

---

## 5. Free Scan to Import Flow (C3)

**Decision code C3** — This is the conversion handoff between the free scan funnel and the authenticated dashboard. It is one of the most important flows in the product.

### The Concept

The free scan IS the first dashboard scan. When a user signs up, we do not discard their free scan data and run a new scan. Instead, we import the free scan into the authenticated scan schema and link it to their new account. From the user's perspective: they did the scan, they saw the results, they signed up, and the dashboard already has their data.

### Implementation

**Step 1: Capture the scan_id at CTA**

The conversion CTA button on `/scan/[scan_id]` links to:
```
/signup?scan_id=[scan_id]
```
This `scan_id` must survive through the entire signup flow. Store it in a query parameter throughout auth redirects, or persist in `localStorage` before the OAuth redirect and restore after callback.

**Step 2: Onboarding detects the scan_id parameter**

The onboarding flow checks for `?scan_id=` in the URL or `localStorage`. If present, it uses the free scan data to pre-populate the business profile form (business name, website, industry, location). The user can review and edit before completing.

**Step 3: Onboarding completion API converts the scan**

`POST /api/onboarding/complete` with body:
```typescript
{
  business_name: string;
  website_url: string;
  industry: string;
  location?: string;
  services?: string[];
  scan_id?: string;  // The free scan's scan_id — triggers import
}
```

When `scan_id` is present, the handler performs:

```typescript
// 1. Look up the free scan
const freeScan = await supabase
  .from('free_scans')
  .select('*')
  .eq('scan_id', scan_id)
  .eq('status', 'completed')
  .single();

// 2. Create businesses record from onboarding form data
const { data: business } = await supabase
  .from('businesses')
  .insert({ user_id, name, website_url, industry, location, ... })
  .select()
  .single();

// 3. Create scans row (type: 'import')
const { data: scan } = await supabase
  .from('scans')
  .insert({
    business_id: business.id,
    user_id,
    scan_type: 'import',
    status: 'completed',
    overall_score: freeScan.results_data.overall_score,
    engines_queried: freeScan.results_data.per_engine_results.map(r => r.engine),
    prompts_used: 3,  // Free scan uses 3 prompts
    results_summary: freeScan.results_data,
    scanned_at: freeScan.created_at,
    completed_at: freeScan.completed_at,
  })
  .select()
  .single();

// 4. Create scan_engine_results rows from per_engine_results in results_data
// One row per engine per prompt (reconstructed from JSONB)
for (const engineResult of freeScan.results_data.per_engine_results) {
  await supabase.from('scan_engine_results').insert({
    scan_id: scan.id,
    business_id: business.id,
    engine: engineResult.engine,
    prompt_text: '(imported from free scan)',
    is_mentioned: engineResult.mentioned,
    rank_position: engineResult.rank,
    sentiment_score: engineResult.sentiment_score,
  });
}

// 5. Link the free scan to the user
await supabase
  .from('free_scans')
  .update({ converted_user_id: user_id })
  .eq('scan_id', scan_id);

// 6. Update businesses.last_scanned_at
await supabase
  .from('businesses')
  .update({ last_scanned_at: freeScan.completed_at })
  .eq('id', business.id);
```

**Step 4: Redirect to dashboard**

After onboarding completes: `redirect('/dashboard')`. The dashboard has scan data on first load. No waiting for a new scan.

### What happens to the free_scans row

The `converted_user_id` FK is set. The row is preserved indefinitely (cleanup cron only deletes rows WHERE `converted_user_id IS NULL`). The public `/scan/[scan_id]` page continues to work — sharing the free scan URL still shows the original results.

### Edge cases

| Case | Handling |
|------|----------|
| User signs up without a scan_id | Onboarding proceeds normally. After completion, trigger a first scan via `scan/scheduled.start` event. Dashboard shows "Your first scan is running" state. |
| scan_id belongs to a different IP | Allowed — users often share the results page and then sign up on a different device. No IP check at import time. |
| scan_id already has a converted_user_id | Possible if user completed signup twice. Skip import silently. The previous conversion already created the businesses record. |
| Free scan status is not 'completed' | Skip import. Trigger a fresh scan instead. |

---

## 6. Scan Engine Architecture

### 6.1 Engine Adapter Pattern

Each AI engine is implemented as an isolated adapter module at `src/lib/scan/engines/[engine-name].ts`. All adapters implement the same interface:

```typescript
interface EngineAdapter {
  name: string;
  query(prompt: string, options: EngineQueryOptions): Promise<EngineRawResponse>;
  timeout: number;  // ms
  dailyBudgetUsd: number;
}

interface EngineQueryOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

interface EngineRawResponse {
  text: string;            // Raw response text
  citations?: Citation[];  // Natively extracted citations (Perplexity, You.com)
  tokensUsed?: number;
  latencyMs: number;
}
```

This adapter pattern means adding a new engine in Phase 2 requires: (1) creating a new adapter file, (2) adding the engine to the tier configuration, and (3) registering it in the engine registry. No changes to the parsing pipeline or scoring algorithm.

### 6.2 Engine Registry by Tier

```typescript
const ENGINE_REGISTRY = {
  phase1: ['chatgpt', 'gemini', 'perplexity', 'claude'],    // All tiers (free, starter, pro, business)
  phase2: ['grok', 'deepseek', 'you_com'],                  // Pro and Business tiers only
  phase3: ['copilot', 'ai_overviews', 'meta_ai'],           // DEFERRED — browser simulation
} as const;

function getEnginesForTier(tier: 'free' | 'starter' | 'pro' | 'business'): string[] {
  switch (tier) {
    case 'free':
    case 'starter':
      return ENGINE_REGISTRY.phase1;  // 4 engines
    case 'pro':
      return [...ENGINE_REGISTRY.phase1, ...ENGINE_REGISTRY.phase2];  // 7 engines
    case 'business':
      return [...ENGINE_REGISTRY.phase1, ...ENGINE_REGISTRY.phase2];  // 7 engines (Phase 3 not yet built)
  }
}
```

### 6.3 Per-Engine Implementation Notes

**ChatGPT (OpenAI API)**
- Model: `gpt-4o`
- API: OpenAI Chat Completions
- Response format: Flowing prose, hedged language ("One option you might consider..."), mentions woven into sentences
- Parsing challenge: Fuzzy mention detection required — business name may appear in possessive form, partial form, or abbreviated. Haiku handles ambiguous cases.
- Rate limit: 500 RPM (Tier 2). Adequate.
- Occasional safety-filtered responses for medical/legal businesses → retry with rephrased prompt.

**Gemini (Google AI API)**
- Model: `gemini-2.0-flash`
- API: Google Generative AI
- Response format: Markdown-heavy (bold, bullets, numbered lists) — position extraction is easier than prose engines
- Parsing challenge: Disclaimers and caveats bury actual mentions. Hebrew responses are weaker in quality.
- Rate limit: 500 RPM — highest throughput, cheapest engine. Used preferentially for high-volume scheduled scans.

**Perplexity (Perplexity API)**
- Model: `sonar-pro`
- API: Perplexity (OpenAI-compatible endpoint)
- Response format: Prose with inline numbered citations `[1][2]`. Citations map to URLs in response metadata.
- Parsing challenge: Citation numbers must be mapped to the URL array in response metadata. Perplexity sometimes cites aggregators.
- Rate limit: 40 RPM — the most constrained engine. Concurrency cap: 5 parallel requests.
- Unique value: Only engine returning structured citations natively. These feed directly into `citation_sources`.
- Response time: 3-8 seconds (real-time web search).

**Claude (Anthropic API)**
- Model: `claude-sonnet-4-6`
- API: Anthropic Messages API with structured output mode
- Response format: Thoughtful prose, balanced assessments with explicit pros/cons. More verbose than other engines.
- Parsing challenge: Claude sometimes declines to rank ("I can't recommend a specific provider without more context") — classify as "not mentioned, inconclusive" not "not mentioned, absent".
- Rate limit: 200 RPM. Adequate.

**Grok (xAI API)** — Phase 2, Pro+ only
- Casual, opinionated tone. Easier mention detection but volatile sentiment.
- Rate limit: 50 RPM. Medium reliability — API has occasional availability gaps. Budget allocation lower.
- Response time: 2-10 seconds, high variance.

**DeepSeek (DeepSeek API)** — Phase 2, Pro+ only
- Technical, structured responses. Known gaps for non-English markets.
- Hebrew results significantly weaker than English. Israeli businesses may not appear at all.
- Rate limit: 50 RPM. Occasional multi-hour outages. Used as supplementary engine.
- Note: DeepSeek pricing is subject to change. Verify at deepseek.com before launch.

**You.com (You.com API)** — Phase 2, Pro+ only
- Aggregation-focused responses with web citations. Similar to Perplexity in citation behavior.
- Rate limit: Stable API, competitive pricing.

### 6.4 Parallel Execution with Failure Isolation

All engine queries within a scan run in parallel using `Promise.allSettled`. This is critical: one engine timing out does not block the entire scan.

```typescript
// Inside scan Inngest function — query-engines step
const enginePromises = engines.map(engineName =>
  queryEngineWithTimeout(engineName, prompts, timeout)
    .then(results => ({ engine: engineName, status: 'fulfilled', results }))
    .catch(error => ({ engine: engineName, status: 'rejected', error: error.message }))
);

const engineResults = await Promise.allSettled(enginePromises);

// Partial results are valid — process whatever completed
const successfulResults = engineResults
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value);
```

Timeout handling per engine:
- ChatGPT: 15s timeout
- Gemini: 10s timeout
- Perplexity: 20s timeout (longer due to real-time web search)
- Claude: 15s timeout
- Grok: 20s timeout (high variance)
- DeepSeek: 15s timeout

If an engine times out or returns an error, it is recorded as `is_mentioned: false` with a null `rank_position` and a note in `error_message`. The visibility score is computed only from engines that returned results.

### 6.5 Rate Limiting Per Engine

Each engine adapter maintains its own rate limiter using Upstash Redis (`@upstash/ratelimit`). Rate limits are enforced before each outbound API call:

- Perplexity: Sliding window, 40 requests per 60 seconds. On `429`, retry with exponential backoff (1s, 2s, 4s). After 3 retries, mark engine as failed for this scan step.
- All other engines: Similar pattern with their respective limits.

Budget circuit breaker: Each engine adapter tracks daily USD spend via a counter in Upstash. When daily spend reaches `dailyBudgetUsd`, the adapter returns a "budget exceeded" error and the engine is skipped for the rest of the day. Alert is fired to the ops team.

---

## 7. Prompt Generation System

Scan quality depends entirely on prompt quality. The prompt generator runs as the first step in every scan Inngest function.

### 7.1 Prompt Categories

| Category | Intent | Template Pattern (EN) | Template Pattern (HE) |
|----------|--------|----------------------|----------------------|
| `recommendation` | Is the business recommended for its core offering? | "What is the best {service} in {location}?" | "?מהו ה{service} הטוב ביותר ב{location}" |
| `comparison` | How does it compare to competitors? | "Compare the top {service} providers in {location}" | "השווה בין ספקי ה{service} המובילים ב{location}" |
| `specific` | Direct brand query | "What do you know about {businessName} in {location}?" | "?מה אתה יודע על {businessName} ב{location}" |
| `review` | What do people say about it? | "What are reviews of {businessName}?" | "?מה הביקורות על {businessName}" |
| `authority` | Is it an authority in the field? | "Who are the leading {industry} experts in {location}?" | "?מי המומחים המובילים בתחום ה{industry} ב{location}" |

### 7.2 Prompt Count by Scan Context

| Context | Prompts per Scan | Categories Used |
|---------|-----------------|----------------|
| Free scan | 3 total | 1 recommendation, 1 specific, 1 comparison |
| Scheduled scan (per tracked query) | 5 per query | All 5 categories |
| Manual scan | 5 per tracked query | All 5 categories |

For a Discover user with 10 tracked queries on a manual scan: 10 queries × 5 prompts = 50 prompts sent across 4 engines = 200 engine API calls per scan.

### 7.3 Prompt Generation Logic

```typescript
interface PromptGeneratorInput {
  businessName: string;
  websiteUrl: string;
  industry: string;  // Key from constants/industries.ts
  location?: string;
  language: 'en' | 'he';
  trackedQueries?: TrackedQuery[];  // null for free scan
  scanContext: 'free' | 'scheduled' | 'manual';
}

function generatePrompts(input: PromptGeneratorInput): GeneratedPrompt[] {
  // For free scan: generate 3 prompts from industry templates
  // For authenticated scans: generate 5 prompts per tracked query
  // Apply language: Hebrew prompts use colloquial Israeli phrasing, not literary Hebrew
  // Template filling: {businessName}, {service}, {industry}, {location} are filled
  // Sanitize: strip injection patterns before filling templates
}
```

**Language handling:** Hebrew and English are first-class. Hebrew prompts use colloquial Israeli phrasing — not direct translation. Location names use local Israeli format (e.g., "תל אביב-יפו", not "Tel Aviv-Jaffa"). For businesses with Hebrew names, a `src/constants/transliteration.ts` mapping ensures consistent Romanization in English-language prompts (e.g., "בימיקס" → "Beamix"). Inconsistent transliteration causes false "not mentioned" results.

### 7.4 Prompt Library Integration

Every generated prompt is matched against `prompt_library` rows by text similarity (or exact match for templated prompts). When a match is found, `scan_engine_results.prompt_library_id` is set. This enables the weekly volume aggregation cron to update usage statistics without text matching.

For free scan prompts that do not match existing library entries, new entries are created in `prompt_library` with initial `estimated_volume = 1`.

---

## 8. Response Parsing Pipeline — 6 Stages

Raw AI engine responses are unstructured natural language. The parsing pipeline transforms each response into a typed, storable data structure. Each stage runs as a separate Haiku call (except Stage 6, which is algorithmic).

All 6 stages run for every engine response. For a free scan: 4 engines × 3 prompts = 12 responses × 5 Haiku stages = 60 Haiku calls. Stage 6 is algorithmic (no LLM cost).

```
RawEngineResponse
    │
    ▼
Stage 1: Mention Detection     → isMentioned: boolean, mentionSpans: Span[]
    │
    ▼
Stage 2: Position Extraction   → rankPosition: number | null
    │
    ▼
Stage 3: Sentiment Scoring     → sentimentScore: number (0-100)
    │
    ▼
Stage 4: Citation Extraction   → citations: Citation[]
    │
    ▼
Stage 5: Competitor Extraction → competitors: CompetitorMention[]
    │
    ▼
Stage 6: Context Extraction    → mentionContext: string (algorithmic, no LLM)
    │
    ▼
ParsedEngineResult (typed, storable)
```

### Stage 1: Mention Detection

**Purpose:** Determine whether the business appears in the AI response.

**Method:** Four matching strategies applied in sequence. The first successful match short-circuits:
1. Exact case-insensitive match against `business_name`
2. Domain URL match — extract domain from `website_url`, check if it appears in response text
3. Normalized match — strip legal suffixes (Ltd, Inc, LLC, בע"מ), strip punctuation, compare
4. Hebrew transliteration match — for Israeli businesses with Hebrew names, check both the Hebrew name and the Romanized transliteration

For ambiguous cases (partial match, e.g., "Cohen" could match "Cohen Dental" or be coincidental), fall through to Haiku classification:

```
Haiku prompt:
"Does the following AI response mention the business '{businessName}'
(website: {websiteUrl})? A mention means the response is referring to this
specific business, not just a similar name or coincidence.
Response: {rawResponseText}
Answer JSON: { mentioned: boolean, confidence: 'high' | 'medium' | 'low', reasoning: string }"
```

**Output:** `{ isMentioned: boolean, mentionSpans: Array<{ start: number, end: number }> }`

**Failure handling:** If Haiku returns malformed JSON or times out, default to `isMentioned: false` with a log entry. Do not fail the entire scan for a single parsing error.

### Stage 2: Position Extraction

**Purpose:** When the business is mentioned, determine its ordinal rank within the response.

**Method:**
- For list-style responses (numbered or bulleted): parse the list item number containing the business mention. `rank_position = list_item_number`.
- For prose responses: Haiku maps linguistic signals to position ranges:
  - "top recommendation", "best option", "highly recommended" → position 1
  - "also excellent", "strong choice", "well-regarded" → position 2-3
  - "one option to consider", "worth considering" → position 4-6
  - "another option", "also available" → position 7+
  - Not mentioned → null

```
Haiku prompt:
"In the following AI response about {industry} in {location},
the business '{businessName}' is mentioned. Based on the context,
what position does it hold? (1=first/top recommendation, higher=lower position)
Response: {rawResponseText}
Answer JSON: { position: number | null, confidence: 'high' | 'medium' | 'low' }"
```

**Output:** `{ rankPosition: number | null }`

### Stage 3: Sentiment Scoring

**Purpose:** Score the sentiment of how the business is described on a continuous 0-100 scale.

**Model:** Claude Haiku 4.5

**Scale definition:**
| Range | Label | Linguistic signals |
|-------|-------|-------------------|
| 0-20 | Strongly negative | "avoid", "poor reviews", "multiple complaints", "unreliable" |
| 21-40 | Mildly negative | "some concerns", "mixed reviews", "could improve" |
| 41-60 | Neutral | factual description without opinion, "is an option", "exists" |
| 61-80 | Positive | "well-regarded", "recommended", "good reputation", "trusted" |
| 81-100 | Strongly positive | "industry leader", "top-rated", "best in class", "highly praised" |

The Haiku prompt includes 5 calibration examples (one per range) to ensure consistent scoring across responses.

```
Haiku prompt:
"Score the sentiment expressed toward '{businessName}' in this AI response on a scale of 0-100.
Use these calibration examples: [5 examples with scores]
If the business is not mentioned, return 0.
Response: {rawResponseText}
Answer JSON: { score: number, key_phrases: string[] }"
```

**Output:** `{ sentimentScore: number }` — integer 0-100

**Critical note:** This is NOT an enum. The integer is stored directly in `scan_engine_results.sentiment_score`. The UI derives a label from the score at display time: 0-33=negative, 34-66=neutral, 67-100=positive.

### Stage 4: Citation Extraction

**Purpose:** Extract URLs that the AI engine references as sources.

**Method:**
- For Perplexity and You.com: citations are available in the API response metadata directly. Map inline citation markers `[1][2]` to the URL array in the API response. No LLM needed.
- For all other engines: Haiku identifies any URLs or source references mentioned in the response text.

```
Haiku prompt (non-citation engines):
"Extract all URLs, website names, or source references from this AI response.
For each, provide: the URL or domain, the page title if mentioned, and its position
(which paragraph/sentence number).
Response: {rawResponseText}
Answer JSON: { citations: Array<{ url: string, domain: string, title: string | null, position: number }> }"
```

**Output:** `{ citations: Array<{ url: string, domain: string, title: string | null }> }`

These are stored in `scan_engine_results.citations` as JSONB and later aggregated into `citation_sources` via upsert.

### Stage 5: Competitor Extraction

**Purpose:** Identify other businesses mentioned in the same response — the competitive intelligence signal.

```
Haiku prompt:
"In the following AI response about {industry} in {location},
list every business name mentioned (other than '{businessName}').
For each business found, provide its name, estimated position (1=mentioned first),
and sentiment score (0-100).
Response: {rawResponseText}
Answer JSON: { competitors: Array<{ name: string, position: number, sentiment: number }> }"
```

Post-processing: Cross-reference the extracted names against `competitors` table for this business. Flag any names not already tracked as `isTracked: false` — these become suggestions for the user to add to their competitor list.

**Output:** `{ competitors: Array<{ name: string, position: number, sentiment: number, isTracked: boolean }> }`

These names are stored in `scan_engine_results.competitors_mentioned` as a text array.

### Stage 6: Context Window Extraction

**Purpose:** Extract 2-3 sentences surrounding the business mention for display in the dashboard (Rankings page row expansion) and citation analytics.

**Method:** Algorithmic — no LLM call, no cost.

```typescript
function extractMentionContext(
  responseText: string,
  mentionSpans: Array<{ start: number, end: number }>,
  targetLength: number = 400  // chars
): string {
  if (mentionSpans.length === 0) {
    // Not mentioned — extract most relevant passage about industry/topic
    // Use first 400 chars of the response as fallback context
    return responseText.slice(0, targetLength);
  }

  const firstSpan = mentionSpans[0];
  // Expand outward from mention to find sentence boundaries
  const contextStart = findSentenceStart(responseText, firstSpan.start - 100);
  const contextEnd = findSentenceEnd(responseText, firstSpan.end + 100);
  const context = responseText.slice(contextStart, contextEnd);

  return context.length > 500 ? context.slice(0, 497) + '...' : context;
}
```

**Output:** `{ mentionContext: string }` — 200-500 characters stored in `scan_engine_results.mention_context`

---

## 9. Visibility Scoring Algorithm

### 9.1 Per-Engine Per-Prompt Score (0-100)

For each engine response to each prompt, a score is computed from three components:

| Component | Weight | Range | Logic |
|-----------|--------|-------|-------|
| Mention presence | 40 pts | 0 or 40 | Binary: mentioned (40) or not (0) |
| Position bonus | 30 pts | 5–30 | 1st=30, 2nd=25, 3rd=20, 4th=15, 5th=10, 6+=5, null=0 |
| Sentiment bonus | 30 pts | 0–30 | Linear: `Math.round((sentimentScore / 100) * 30)` |

Maximum possible: 100 (mentioned + first position + perfect sentiment).
Minimum if mentioned: 40 (mentioned + 6th+ position + 0 sentiment).
If not mentioned: 0 (all components zero).

### 9.2 Aggregate Visibility Score (0-100)

The user-facing score is a weighted average across all engines and all prompts, with recency weighting applied:

```typescript
function computeAggregateScore(scanHistory: ScanWithResults[]): number {
  // scanHistory is ordered by date DESC
  const weights = [1.0, 0.8, 0.6];  // most recent, previous, two scans ago

  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < Math.min(scanHistory.length, 3); i++) {
    const scan = scanHistory[i];
    const scanScore = computeSingleScanScore(scan.engineResults);
    weightedSum += scanScore * weights[i];
    totalWeight += weights[i];
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

function computeSingleScanScore(engineResults: ScanEngineResult[]): number {
  // Group by tracked query
  const byQuery = groupBy(engineResults, r => r.prompt_text);
  const queryScores: number[] = [];

  for (const [query, results] of Object.entries(byQuery)) {
    // Average across engines for this query
    const engineScores = results.map(r => computePerEngineScore(r));
    queryScores.push(average(engineScores));
  }

  // Average across all queries
  return Math.round(average(queryScores));
}

function computePerEngineScore(result: ScanEngineResult): number {
  if (!result.is_mentioned) return 0;
  const mentionScore = 40;
  const positionScore = result.rank_position ? Math.max(5, 30 - ((result.rank_position - 1) * 5)) : 0;
  const sentimentScore = Math.round((result.sentiment_score / 100) * 30);
  return mentionScore + positionScore + sentimentScore;
}
```

### 9.3 Historical Trend Calculation

Trends power the dashboard's delta indicators (▲ +2 positions, ▲ +8 score).

```typescript
function computeScoreDelta(
  currentScore: number,
  previousScore: number | null
): { delta: number, direction: 'up' | 'down' | 'flat' } {
  if (previousScore === null) return { delta: 0, direction: 'flat' };
  const delta = currentScore - previousScore;
  return {
    delta: Math.abs(delta),
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
  };
}
```

When fewer than 3 data points exist, display "Collecting data" instead of trend arrows. Do not compute misleading deltas from insufficient data.

### 9.4 Rank Position Computation

The rank position (the "#4 across AI search" hero metric) is computed separately from the visibility score:

```typescript
function computeRankPosition(
  businessScore: number,
  competitorScores: Array<{ name: string, score: number }>
): number {
  const allScores = [businessScore, ...competitorScores.map(c => c.score)];
  const sorted = [...allScores].sort((a, b) => b - a);
  return sorted.indexOf(businessScore) + 1;  // 1-based rank
}
```

Competitor scores are derived from `competitor_scans` — the scan engine queries the same prompts for competitor names and computes their scores using the same algorithm.

---

## 10. Inngest Background Jobs

The Inngest serve endpoint is at `/api/inngest`. All scan functions are registered in `src/inngest/functions/`.

### 10.1 `scan.free.run`

**Trigger:** Event `scan/free.start`
**Event payload:** `{ scan_id: string, business_name: string, website_url: string, industry: string, location?: string, language: 'en' | 'he' }`
**Concurrency:** 25 total (system-wide, no per-user limit for anonymous scans)
**Timeout:** 120 seconds
**Retries:** 1

**Steps:**

| Step | Name | What it does |
|------|------|-------------|
| 1 | `update-status` | UPDATE free_scans SET status='processing' WHERE scan_id=... |
| 2 | `generate-prompts` | Generate 3 prompts (recommendation, comparison, specific) using business data and industry templates |
| 3 | `query-and-crawl` | `Promise.allSettled` fan-out: query 4 engines (ChatGPT, Gemini, Perplexity, Claude) in parallel + crawl website with cheerio for AI readiness assessment. Engines use phase1 adapter set. |
| 4 | `parse-responses` | For each raw engine response: run all 6 parsing stages (5 Haiku calls + 1 algorithmic). Total: 12 responses × 5 Haiku stages = 60 Haiku calls. |
| 5 | `compute-scores` | Compute overall_score (weighted avg across engines), AI readiness score (5 categories from crawl), quick wins (Sonnet generation, 3 recommendations), leaderboard from competitor extraction |
| 6 | `store-results` | UPDATE free_scans SET results_data=..., status='completed', completed_at=NOW() |
| 7 | `aggregate-prompt-data` | Upsert prompt usage stats into `prompt_library` rows for volume estimation |

**On failure:** UPDATE free_scans SET status='failed', completed_at=NOW(). No retry on the entire function — individual steps may retry via Inngest step retry (1 retry per step by default).

**Free scan engines note:** Free scan uses 3 engines, not 4. Per the current spec: ChatGPT, Gemini, Perplexity. Claude is phase1 but reserved for Discover+ paid tiers. (Verify this against the final pricing decision before implementation — `scan-page.md` says free uses 4 engines including Claude.)

### 10.2 `scan.scheduled.run`

**Trigger:** Event `scan/scheduled.start`
**Event payload:** `{ business_id: string, user_id: string, scan_id: string }`
**Concurrency:** 50 total, 1 per user (`concurrencyKey: event.data.user_id`)
**Timeout:** 300 seconds
**Retries:** 1

**Steps:**

| Step | Name | What it does |
|------|------|-------------|
| 1 | `fetch-context` | Load business profile, tracked queries (active only), competitors, subscription tier, voice profile if available |
| 2 | `generate-prompts` | 5 prompts per tracked query (all 5 categories) |
| 3 | `query-engines` | Fan out to tier-appropriate engines (4 or 7). `Promise.allSettled`. Per-engine rate limiting. |
| 4 | `parse-responses` | All 6 stages for each response. Claude Haiku for stages 1-5. |
| 5 | `compute-scores` | Per-engine, per-query, aggregate scores. Rank position computation. |
| 6 | `store-results` | Batch INSERT into `scans` + `scan_engine_results`. |
| 7 | `upsert-citations` | Aggregate citations from results into `citation_sources` via upsert pattern. |
| 8 | `analyze-narrative` | Send mention contexts to Claude Sonnet for brand narrative analysis. INSERT into `brand_narratives`. |
| 9 | `compute-content-performance` | For each published `content_items`, compute score delta vs. publication baseline. INSERT `content_performance` rows. |
| 10 | `compare-previous` | Load previous scan. Compute all deltas (score, rank position, per-engine). |
| 11 | `generate-recommendations` | Run A4 Recommendations Agent (0 credits) against scan results. INSERT into `recommendations`. |
| 12 | `evaluate-alerts` | Send event `alert/evaluate` with scan deltas for alert rule checking. |
| 13 | `evaluate-workflows` | Check active `agent_workflows` for trigger conditions matching current scan results. Send `workflow/execute` events as needed. |
| 14 | `update-schedule` | UPDATE businesses SET last_scanned_at=NOW(), next_scan_at=computeNextScan(tier). |

### 10.3 `scan.manual.run`

**Trigger:** Event `scan/manual.start`
**Event payload:** Same as scheduled scan
**Concurrency:** 10 total, 1 per user
**Timeout:** 300 seconds
**Retries:** 1
**Steps:** Identical to `scan.scheduled.run` — same 14 steps.

### 10.4 `cron.scheduled-scans`

**Schedule:** `0 * * * *` (every hour on the hour)
**Concurrency:** 1 (singleton)
**Timeout:** 600 seconds

**Steps:**
1. `find-due-businesses` — Query: `SELECT b.id, b.user_id FROM businesses b JOIN subscriptions s ON s.user_id = b.user_id WHERE b.next_scan_at <= NOW() AND s.status IN ('active', 'trialing')`
2. `dispatch-scans` — For each due business: CREATE scans row (status: 'pending'). Send `scan/scheduled.start` event.
3. `log-dispatch` — Record dispatch count for observability.

This function dispatches events; it does not run scans directly. Each scan runs independently via its own Inngest function invocation.

---

## 11. API Routes

All routes at `src/app/api/scan/`. Universal patterns: Zod validation on all inputs, 401 if session missing on authenticated routes, `{ data: T }` shape for success, `{ error: string }` shape for errors.

### POST /api/scan/start

**Auth:** None (anonymous). IP rate limited.

**Request body:**
```typescript
const StartScanSchema = z.object({
  business_name: z.string().min(1).max(200),
  website_url: z.string().url(),
  industry: z.string().min(1),
  location: z.string().optional(),
  language: z.enum(['en', 'he']).default('en'),
});
```

**Rate limit:** 3 per IP per 24 hours. Checked against `free_scans` table:
```sql
SELECT COUNT(*) FROM free_scans
WHERE ip_address = $ip AND created_at > NOW() - INTERVAL '24 hours'
```
Return 429 if count >= 3.

**Process:**
1. Validate input (Zod)
2. Check IP rate limit
3. Generate `scan_id` using nanoid (e.g., `nanoid(12)` → `sc_4xkP9mN2vR3`)
4. INSERT into `free_scans` (status: 'pending')
5. Send Inngest event `scan/free.start`
6. Return 202

**Response:** `{ data: { scan_id: string } }`

### GET /api/scan/[scan_id]/status

**Auth:** None.

**Process:** SELECT from `free_scans` WHERE `scan_id = ?`. Return status field.

**Response:**
```typescript
{
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress_pct?: number;     // 0-100 estimate, optional
    engines_completed?: number; // How many engines finished, for loading UI
  }
}
```

**Errors:** 404 if scan not found.

### GET /api/scan/[scan_id]/results

**Auth:** None.

**Process:** SELECT from `free_scans` WHERE `scan_id = ?` AND `status = 'completed'`.

**Response:** `{ data: { scan: FreeScan, results: ScanResultsData } }`

**Errors:**
- 404 if scan not found
- 202 if still processing (with `{ data: { status: 'processing' } }`)
- 410 if expired (created_at > 30 days ago — soft expiry)

### POST /api/scan/manual

**Auth:** Required.

**Request body:**
```typescript
const ManualScanSchema = z.object({
  business_id: z.string().uuid(),
});
```

**Process:**
1. Validate auth. Verify `businesses.user_id = auth.uid()`.
2. Check tier rate limit (Discover 1/week, Build 1/day, Scale 1/hour) against `scans` table.
3. INSERT into `scans` (status: 'pending', scan_type: 'manual').
4. Send event `scan/manual.start` with `{ business_id, user_id, scan_id: scan.id }`.
5. Return 202.

**Errors:**
- 401 if not authenticated
- 403 if user does not own business
- 429 if rate limit exceeded (include `retry_after: ISO8601 datetime` in response body)
- 402 if user has no active subscription

**Response:** `{ data: { scan_id: string } }`

### GET /api/scan/history

**Auth:** Required.

**Query params:**
```typescript
const HistoryQuerySchema = z.object({
  business_id: z.string().uuid(),
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(50).default(20),
});
```

**Process:** SELECT from `scans` WHERE `business_id = ? AND user_id = auth.uid()` ORDER BY `scanned_at DESC` with pagination.

**Response:** `{ data: { scans: Scan[], total: number, page: number, per_page: number } }`

---

## 12. Rate Limits and Plan Tiers

### Free Tier (no subscription)
- Anonymous scans: 3 per IP per 24 hours
- No recurring scans (scheduled scans require active subscription)
- Scan results accessible for 30 days
- Engines: ChatGPT, Gemini, Perplexity (3 engines)

### Discover ($79/mo)
- Manual rescan: 1 per week
- Scheduled scans: Monthly (every 30 days)
- Tracked queries: 10
- Competitors tracked: 3
- Engines: ChatGPT, Gemini, Perplexity, Claude (4 Phase 1 engines)

### Build ($189/mo)
- Manual rescan: 1 per day
- Scheduled scans: Daily
- Tracked queries: 25
- Competitors tracked: 5
- Engines: 7 (Phase 1 × 4 + Phase 2 × 3: adds Grok, DeepSeek, You.com)

### Scale ($499/mo)
- Manual rescan: 1 per hour
- Scheduled scans: Every 4 hours (6/day)
- Tracked queries: 75
- Competitors tracked: 10
- Engines: 7 (same as Build — Phase 3 not yet built)

### Rate limit enforcement

Rate limits for authenticated manual scans are enforced at the API layer by checking the `scans` table:

```typescript
function checkManualScanRateLimit(userId: string, businessId: string, tier: string): Promise<boolean> {
  const windowMap = { starter: '7 days', pro: '1 day', business: '1 hour' };
  const window = windowMap[tier];
  const count = await supabase
    .from('scans')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('scan_type', 'manual')
    .gte('scanned_at', `NOW() - INTERVAL '${window}'`);
  return (count.count ?? 0) === 0;  // true = allowed
}
```

---

## 13. Scan Result Page

**Route:** `/scan/[scan_id]` — public, no auth required, shareable.

### Page States

| State | What to Render |
|-------|---------------|
| `status = 'pending' or 'processing'` | Animated loading screen (engine-checking UI) |
| `status = 'completed'` | Full results with animation sequence |
| `status = 'failed'` | Error state with retry button |
| `created_at > 30 days ago` | Expired state — prompt new scan |
| `scan_id` not found | 404 |

### Loading State

While scan is processing, show the animated engine-checking screen. Poll `/api/scan/[scan_id]/status` every 3 seconds. Show fake-sequential engine animations (real processing is parallel on server, but users need something to watch):

- Each engine row shows: `[Engine Logo] ●●● Checking...` → `[Engine Logo] ●●● Analyzing...` → green checkmark
- Show: `Scanning [Business Name]... | Results in about 60 seconds`
- Background: dark, atmospheric

### Results Animation Sequence

Full animation spec in `04-features/scan-page.md`. Key phases:
- Phase A (0-2s): Charge-up — business block shakes, light beams converge
- Phase B (2-4.5s): Ascent — block rises through competitor leaderboard
- Phase C (4.5-6s): Landing — spring bounce, score counts up from 0
- Phase D (6-7.5s): Full page reveals below animation

For `prefers-reduced-motion`: skip animation, show final state with fade.

### Data Requirements

The page renders from `free_scans.results_data` JSONB. The full type definition is in Section 4.1 (`ScanResultsData` interface). All fields must be present before the page can render results.

### Sections

1. **Header** — Business name, URL, industry, location, scan timestamp, engine count
2. **Animation** — Ranking reveal (see `scan-page.md` for full spec)
3. **Score Breakdown** — Score on gradient bar, legend, top competitor gap
4. **Per-Engine Breakdown** — Collapsible. One row per engine: rank position, filled-dot indicator, sentiment label
5. **Top Competitor Callout** — Amber card with competitor name, score, gap
6. **Quick Wins** — 3 free recommendation cards (impact-labeled). Blurred teaser of additional recs.
7. **Conversion CTA** — Button links to `/signup?scan_id=[scan_id]`. Trust signals below.
8. **Share** — Copy link, LinkedIn pre-filled copy, X pre-filled copy

### Score Labels

| Range | Label | Color |
|-------|-------|-------|
| 0-30 | Critical — You're nearly invisible | Red |
| 31-60 | Fair — You have room to grow | Amber |
| 61-80 | Good — You're being seen | Green |
| 81-100 | Excellent — You're highly visible | Bright green |

### Methodology Disclosure

Below the per-engine breakdown (collapsed by default):

> Results are based on API queries to each AI engine and may differ from what a user sees in the consumer chat interface. API responses may not reflect personalization, location-based filtering, or UI-level formatting. Beamix measures an "AI visibility signal" — a reliable indicator that correlates with consumer-facing visibility, but not an exact ranking guarantee.

This disclosure is required. Keep it collapsed by default. Use "AI visibility signal" — not "AI ranking" — in all marketing copy.

---

## 14. Error Handling

### Engine Timeout

When an engine times out (beyond its configured timeout):
- Log the timeout with engine name, timeout value, and latency
- Record the result as `is_mentioned: false`, `rank_position: null`, `sentiment_score: null`
- Continue processing with remaining engines
- If 3+ engines timeout in a single scan, flag the scan with a warning in `results_summary`

### Partial Results

`Promise.allSettled` ensures partial results are always returned. A scan with 2 out of 4 engines completing is better than no result at all. Minimum threshold: if fewer than 2 engines return results, mark scan as 'failed' with `error_message: 'insufficient_engine_responses'`.

### All Engines Fail

If `Promise.allSettled` returns all rejected: UPDATE scan to status='failed'. For free scans: no retry (user sees error state with "Try again" button). For scheduled scans: the Inngest function retry (1 attempt) handles this. If still failing after retry, mark failed and skip to the next scheduled run.

### Rate Limit Exceeded (Outbound)

When hitting an engine's rate limit (429 response):
- Exponential backoff: 1s, 2s, 4s, 8s
- After 3 retries: skip this engine for this scan, continue with others
- Log the rate limit hit for monitoring

### Parsing Failure

If a Haiku parsing call returns malformed JSON or unexpected output:
- Log the failure with full context (engine, prompt, raw response, Haiku output)
- Default values: `is_mentioned: false`, `rank_position: null`, `sentiment_score: 50` (neutral)
- Do not fail the entire scan for a single parsing stage failure
- Continue to next stage with defaults

### Supabase Write Error

If INSERT/UPDATE fails during `store-results` step:
- Inngest retries the step automatically (1 retry with backoff)
- If still failing: mark scan as 'failed'. Credit holds (for manual scans) are released by the `cron.cleanup` function within 2 hours.

---

## 15. Engineering Notes

### Why PRNG Mock Engine First

The current codebase (`src/lib/scan/mock-engine.ts`) uses a seeded PRNG to generate deterministic fake scan results. This was the correct first-pass approach: it allowed the entire scan flow, results page, dashboard, and conversion funnel to be built and tested without incurring LLM API costs during development. The mock is seeded from the business URL, so the same URL always produces the same score — important for demos and testing.

When replacing the mock with real engines, maintain this interface contract: `runMockScan(input) → ScanResultsData`. The real engine implementation should return the same shape.

### Why `scan_id` Not `scan_token`

The external identifier used in URLs is `scan_id`. This is the locked naming convention (decision C3). Any code or database column using `scan_token` is legacy and should be migrated.

### Why Sentiment is 0-100 Integer, Not Enum

Competitors originally used enum sentiment ('positive', 'neutral', 'negative'). The gap analysis showed that numeric sentiment enables trend analysis and threshold alerting that enum cannot support. A business can track "sentiment trending from 72 to 58 over 90 days" — meaningful information that disappears in an enum. The Haiku model outputs a number naturally; forcing it to choose from three buckets loses information.

### Why Two Separate Tables (free_scans vs scans)

Free scans are anonymous, short-lived JSONB blobs with no user FK. Authenticated scans are normalized rows with full relational structure. Combining them would require nullable user FKs, nullable engine results, and complex RLS policies. The separation keeps the schema clean and the anonymous scan table simple (no RLS needed).

### Inngest Step Idempotency

Every Inngest step that writes to Supabase must be idempotent. The `scan_id` (for free scans) and `scan.id` UUID (for authenticated scans) serve as idempotency keys. Use UPSERT patterns on all writes, not INSERT-only. This prevents duplicate data from Inngest step retries.

### LLM Model Selection for Parsing

All 5 parsing stages (Stages 1-5) use **Claude Haiku 4.5** — the fastest and cheapest Anthropic model. Parsing a 500-word AI response for business mentions is a pattern-matching task, not a reasoning task. Haiku handles it in under 1 second at ~$0.001 per call. Using Sonnet for parsing would increase per-scan cost by ~10x with negligible quality improvement for this task.

### Hebrew Transliteration Dependency

Israeli businesses with Hebrew names require consistent Romanization in English-language prompts. "בימיקס" must consistently become "Beamix" — not "Bimix" or "Baymix". Implement a transliteration mapping in `src/constants/transliteration.ts` using the `hebrew-transliteration` npm package or a custom mapping table. Inconsistent transliteration causes false "not mentioned" results when the AI engine uses a different Romanization than the parser expects.

### Cost at Scale

| Scan Type | Engine Calls | Haiku Calls | Estimated Cost |
|-----------|-------------|-------------|----------------|
| Free scan (3 engines, 3 prompts) | 9 | ~45 | ~$0.10-0.15 |
| Discover scheduled (4 engines, 10 queries × 5 prompts) | 200 | ~1,000 | ~$1.50-2.00/month |
| Build scheduled daily (7 engines, 25 queries × 5 prompts) | 875/day | ~4,375/day | ~$3.00-4.00/day |
| Scale scheduled 6x/day (7 engines, 75 queries × 5 prompts) | 2,625 × 6/day | ~13,125 × 6/day | ~$8-12/day |

Re-validate these estimates at 100, 500, and 1K paying customer milestones.
