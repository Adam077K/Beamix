# Beamix — Conversation Explorer Technical Spec

> **2026-04 pricing update:** Canonical tier names/prices are now Discover $79 / Build $189 / Scale $499. Dollar figures referenced in this spec for cost analysis reflect the earlier $49/$149/$349 tier structure. Tier gating should be read as: Starter → Discover, Pro → Build, Business → Scale. Per-feature cost conclusions remain directionally valid.

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Ready for implementation (build after F3 — Topic/Query Clustering)
> **Audience:** Engineers building the Conversation Explorer feature. You should be able to implement this end-to-end without reading any other document.
> **Source docs:** `04-features/new-features-batch-1-spec.md`, `PRICING-IMPACT-ANALYSIS.md §1`, `04-features/topic-query-clustering-spec.md`

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Scope and Boundaries](#2-scope-and-boundaries)
3. [User Flows](#3-user-flows)
4. [Data Model](#4-data-model)
5. [LLM Generation Pipeline (Phase 1 — Haiku)](#5-llm-generation-pipeline-phase-1--haiku)
6. [Perplexity Live Pipeline (Phase 2 — Business tier)](#6-perplexity-live-pipeline-phase-2--business-tier)
7. [Caching Strategy](#7-caching-strategy)
8. [Inngest Background Jobs](#8-inngest-background-jobs)
9. [API Routes](#9-api-routes)
10. [UI Components](#10-ui-components)
11. [Tier Gating](#11-tier-gating)
12. [Cost Impact](#12-cost-impact)
13. [Engineering Notes](#13-engineering-notes)

---

## 1. Feature Overview

**What it does:** The Conversation Explorer lets Pro and Business users browse what people in their industry are actually asking AI assistants right now. A dentist in Tel Aviv can ask: "What are people asking about dentists in Tel Aviv?" and receive 20-30 real or inferred queries grouped by topic cluster. Each query shows estimated relevance and a one-click "Add to Tracking" button. This helps users discover high-value queries they are not yet monitoring.

**Business value:**
- Closes the "what should I track?" gap. New users often don't know which queries to add to their rankings tracker. The explorer provides immediate, industry-specific suggestions without any manual research.
- Creates a research tool no SMB competitor offers at $149/month. Profound's equivalent is powered by 130M proprietary conversations and costs enterprise pricing. Beamix's LLM-generated version approximates this for SMBs at negligible cost.
- Drives tracked query growth. More tracked queries → more scan data → more agent recommendations → higher engagement and retention.
- Business-tier differentiation: Live Exploration (Perplexity) returns real-time query data that is demonstrably more accurate than LLM-generated synthetic queries — a meaningful upgrade incentive.

**The core insight:** Most SMB owners have never thought about which questions AI assistants answer about their business. The Conversation Explorer makes this immediately concrete and actionable.

**Why LLM-generated (not aggregate user data) for Phase 1:**
Option A (aggregating Beamix user data) requires 500+ users to produce meaningful insights and raises privacy concerns requiring legal review. LLM-generated queries (Option C) are immediately available, cost ~$0.003 per session, and produce good enough results for the SMB use case. Perplexity (Option B) adds real-time accuracy for Business tier users.

**Prerequisite:** This feature must be built after F3 (Topic/Query Clustering) is complete. It reuses the `ClusterGroup` component and the cluster taxonomy constants from F3.

---

## 2. Scope and Boundaries

### In Scope — Phase 1

| Capability | Notes |
|-----------|-------|
| LLM-generated query exploration via Haiku | Pro and Business tier |
| `exploration_cache` table | 24h TTL, shared across users, SHA-256 cache key |
| `POST /api/analytics/explore` route | Auth required, Pro+ check, cache-first logic |
| New page: `/dashboard/explore` | Full page, not a modal |
| `ExploreForm` component | Industry, location, optional seed topic inputs |
| `ExploreResultsGrid` component | Query cards grouped by ClusterGroup |
| `RelevanceBadge` component | High/Medium/Low color-coded |
| "Add to Tracking" button per query | Calls POST /api/queries with query pre-filled |
| 10 requests/hour rate limit per user | Prevent abuse |
| RTL support for all components | Hebrew queries render RTL, English LTR within same grid |
| Location string normalization | Hebrew/English city names map to same cache key |
| Cache cleanup in cron.cleanup job | Delete rows where expires_at < NOW() |

### In Scope — Phase 2

| Capability | Notes |
|-----------|-------|
| Perplexity Live Exploration | Business tier only, or 0.5 agent credits per session |
| Source toggle in ExploreForm | "AI-Generated" vs "Live Exploration (Perplexity)" |
| Perplexity Sonar Pro pipeline | 3 seed queries in parallel, deduplicated, Haiku for cluster+relevance |
| Credit deduction for Perplexity sessions | 0.5 credits via existing credit system |

### Deferred

| Capability | Reason |
|-----------|--------|
| Aggregate Beamix user data ("trending in your industry") | Requires 500+ users, privacy/legal review, anonymization infrastructure |
| DataForSEO / keyword API integration | Adds vendor dependency, SEO framing rather than GEO framing |
| Real-time streaming results | Haiku is fast enough (<2s) that streaming is not needed |
| Saved explorations | Phase 2 feature — explore first, persist later |

### Out of Scope

- The explorer does not make any claims about actual search volume. UI copy must make clear these are "suggested" or "AI-generated" queries, not real volume data.
- The explorer does not add queries to tracking automatically. Users choose which queries to add via the "Add to Tracking" button.
- Cache entries are never user-specific. They are shared industry-level data. No personal business data is cached.

---

## 3. User Flows

### 3.1 First Exploration (Cache Miss)

```
1. User navigates to /dashboard/explore
2. ExploreForm is pre-filled with business profile data (industry, location)
3. Optional: user enters a seed topic (e.g., "emergency", "pricing", "pediatric")
4. User clicks "Explore"
5. Client POSTs to /api/analytics/explore with { industry, location, seedTopic, source: 'llm_generated' }
6. API computes cache_key = SHA-256(industry + '|' + location + '|' + seedTopic + '|' + source)
7. API checks exploration_cache: no valid row found (cache miss)
8. API calls Haiku with the generation prompt
9. Haiku returns 25 queries as structured JSON (cluster, relevance, language)
10. API inserts into exploration_cache (expires_at = now + 24h)
11. API returns { queries: [...], source: 'llm_generated', cached: false }
12. ExploreResultsGrid renders: queries grouped by ClusterGroup, each card shows query + RelevanceBadge
13. Loading state shown while waiting: skeleton cards (~1-2 seconds)
```

### 3.2 Second Exploration (Cache Hit)

```
1. Another user (or same user) submits identical industry + location + seedTopic
2. API computes same cache_key
3. API finds valid exploration_cache row (expires_at > NOW())
4. Returns cached results immediately — no Haiku call
5. Response includes { cached: true, cachedAt: '2026-03-08T03:14:00Z' }
6. UI shows: small note "Results generated 2 hours ago"
```

### 3.3 Adding a Query to Tracking

```
1. User sees a query in ExploreResultsGrid: "Best dentist for children in Tel Aviv"
2. User clicks "Add to Tracking" button on that card
3. Client POSTs to /api/queries with { businessId, queryText: 'Best dentist for children in Tel Aviv' }
4. Query is inserted + classified (F3 pipeline runs inline)
5. Card shows "Added!" confirmation inline — button becomes a checkmark
6. Query appears in /dashboard/rankings under the appropriate ClusterGroup
7. If user tries to add the same query twice: second click shows "Already tracking"
```

### 3.4 Live Exploration — Perplexity (Phase 2, Business tier)

```
1. User on Business tier visits /dashboard/explore
2. Source toggle visible: "AI-Generated | Live Exploration"
3. User selects "Live Exploration"
4. Warning shown: "Live Exploration uses 0.5 agent credits per session. You have X credits remaining."
5. User confirms and clicks "Explore"
6. Client POSTs with { source: 'perplexity' }
7. API checks Business tier; deducts 0.5 credits from credit pool
8. API runs Perplexity pipeline: 3 seed queries → parse → deduplicate → Haiku cluster+relevance
9. Results cached with source='perplexity', expires_at = now + 24h
10. UI shows: "Live data from Perplexity — reflects real queries from the past 7 days"
```

---

## 4. Data Model

### 4.1 `exploration_cache`

New table. Shared across all users — no `user_id` or `business_id` column. Cache entries represent industry-level data, not business-specific data.

```sql
CREATE TABLE exploration_cache (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key     text        UNIQUE NOT NULL,
  industry      text        NOT NULL,
  location      text        NOT NULL,
  seed_topic    text        NOT NULL DEFAULT '',
  source        text        NOT NULL CHECK (source IN ('llm_generated', 'perplexity')),
  results       jsonb       NOT NULL,
  generated_at  timestamptz NOT NULL DEFAULT NOW(),
  expires_at    timestamptz NOT NULL
);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| cache_key | text | UNIQUE NOT NULL | SHA-256 of `industry + '|' + location + '|' + seedTopic + '|' + source` |
| industry | text | NOT NULL | Industry key matching `src/constants/industries.ts` |
| location | text | NOT NULL | Normalized location string (see §7 normalization) |
| seed_topic | text | NOT NULL DEFAULT '' | Optional seed topic. Empty string = no seed topic (not NULL — avoids null-in-hash issues) |
| source | text | NOT NULL | CHECK IN ('llm_generated', 'perplexity') |
| results | jsonb | NOT NULL | Array of ExplorationQuery objects (see shape below) |
| generated_at | timestamptz | NOT NULL DEFAULT NOW() | When this result was generated |
| expires_at | timestamptz | NOT NULL | `generated_at + INTERVAL '24 hours'` — set at insert time |

**No RLS needed** — no user or business data in this table. The Supabase anon key cannot read this table (only service role and authenticated backend). Access is only through the authenticated API route.

**results JSONB shape:**

```typescript
interface ExplorationQuery {
  queryText: string;
  cluster:   'Pricing' | 'Location' | 'Reviews' | 'Comparison' | 'Informational' | 'Brand' | 'Other';
  relevance: 'high' | 'medium' | 'low';
  language:  'en' | 'he';
}

// results column stores: ExplorationQuery[]
```

**Index:**

```sql
-- Primary cache lookup by hash key
-- The UNIQUE constraint on cache_key creates this index automatically.
-- Explicit index for expires_at cleanup:
CREATE INDEX idx_exploration_cache_expires
  ON exploration_cache (expires_at);
```

### 4.2 Cleanup Integration

Add to `cron.cleanup` (existing Inngest job):

```sql
-- Delete expired exploration cache rows
DELETE FROM exploration_cache
WHERE expires_at < NOW();
```

No new Inngest job needed for cleanup. This is a one-line addition to the existing cleanup step.

---

## 5. LLM Generation Pipeline (Phase 1 — Haiku)

### Haiku Prompt

```typescript
const EXPLORER_SYSTEM_PROMPT = `
You are a search query research assistant specializing in AI search behavior for local businesses.
Your output is always a valid JSON array. No explanation, no markdown, only JSON.
`;

function buildExplorerPrompt(
  industry: string,
  location: string,
  seedTopic: string | undefined,
): string {
  const seedLine = seedTopic
    ? `Focus especially on queries related to: ${seedTopic}.`
    : '';

  return `
Generate 25 natural language questions that a potential customer might ask an AI assistant
(like ChatGPT or Perplexity) when looking for a ${industry} business in ${location}.

${seedLine}

Include questions in both Hebrew and English.
For Israeli locations, aim for approximately 50% Hebrew and 50% English.
For non-Israeli locations, use 90% English and 10% Hebrew as appropriate.

Return a JSON array with exactly this shape:
[
  {
    "queryText": string,
    "cluster": "Pricing" | "Location" | "Reviews" | "Comparison" | "Informational" | "Brand" | "Other",
    "relevance": "high" | "medium" | "low",
    "language": "en" | "he"
  }
]

Relevance guide:
- "high": query has strong commercial intent and high search frequency in this industry
- "medium": query is relevant but less frequently asked
- "low": query is niche or less likely to appear in AI conversations
  `.trim();
}
```

### Pipeline Logic

```typescript
async function generateExplorationQueriesWithHaiku(
  industry: string,
  location: string,
  seedTopic?: string,
): Promise<ExplorationQuery[]> {
  // 1. Call Haiku with system + user prompt
  // 2. Parse response as JSON array
  // 3. Validate each item: queryText non-empty, cluster in CLUSTER_LABELS, relevance in ['high','medium','low']
  // 4. Filter out malformed items
  // 5. Return validated array (typically 23-25 items after filtering)
  // 6. On JSON parse error: return empty array (API route returns 500)
}
```

**Expected output:** 25 queries, structured JSON, response time ~1-2 seconds at Haiku speed, cost ~$0.003 per call.

---

## 6. Perplexity Live Pipeline (Phase 2 — Business tier)

### Pipeline Steps

```
Step 1 — build-seed-prompts
  From industry + location + seedTopic, build 3 Perplexity seed queries:
  1. "What should I look for in a {industry} in {location}?"
  2. "Best {industry} in {location} recommendations"
  3. "Compare {industry} services in {location}" + (seedTopic ? " related to {seedTopic}" : "")

Step 2 — parallel-perplexity-calls
  Send all 3 seed prompts to Perplexity Sonar Pro simultaneously (Promise.all)
  Each call uses Perplexity chat completions API
  Cost: 3 calls × $0.01-0.03 = $0.03-0.09

Step 3 — extract-and-deduplicate
  From each response:
    - Extract the main answer text
    - Extract any "Related Questions" or "People Also Ask" sections
    - Parse suggested follow-up questions (Perplexity often includes these in the response)
  Deduplicate across all 3 responses (case-insensitive, trim whitespace)
  Result: typically 15-25 unique queries from real Perplexity suggestions

Step 4 — haiku-enrichment
  Send the deduplicated queries to Haiku:
    "Classify and score the following queries for a {industry} business in {location}.
     Also generate 10 additional related queries to fill topic gaps.
     Return the full set as a JSON array with cluster, relevance, and language fields."
  Combine Perplexity queries + 10 Haiku-generated additions = 25-35 total
  Cost: ~$0.001

Step 5 — return-and-cache
  Store with source = 'perplexity' in exploration_cache
  Return results to API route
```

**Total cost for Perplexity pipeline:** ~$0.03-0.09 per session (Perplexity calls) + $0.001 (Haiku enrichment) = $0.031-0.091 per session.

---

## 7. Caching Strategy

### Cache Key Generation

```typescript
import { createHash } from 'crypto';

function buildCacheKey(
  industry: string,
  location: string,
  seedTopic: string,
  source: 'llm_generated' | 'perplexity',
): string {
  const normalized = normalizeLocation(location);
  const input = `${industry.toLowerCase()}|${normalized}|${seedTopic.toLowerCase().trim()}|${source}`;
  return createHash('sha256').update(input).digest('hex');
}
```

### Location Normalization

Hebrew and English names for the same city must resolve to the same cache key. Without normalization, "Tel Aviv" and "תל אביב" would produce different keys and duplicate LLM calls.

```typescript
// src/constants/locations.ts
const LOCATION_ALIASES: Record<string, string> = {
  'תל אביב': 'tel-aviv',
  'tel aviv': 'tel-aviv',
  'tel-aviv': 'tel-aviv',
  'ירושלים': 'jerusalem',
  'jerusalem': 'jerusalem',
  'חיפה': 'haifa',
  'haifa': 'haifa',
  'באר שבע': 'beer-sheva',
  'beer sheva': 'beer-sheva',
  'beer-sheva': 'beer-sheva',
  'רמת גן': 'ramat-gan',
  'ramat gan': 'ramat-gan',
  // ... extend as needed
};

function normalizeLocation(location: string): string {
  const lower = location.toLowerCase().trim();
  return LOCATION_ALIASES[lower] ?? lower.replace(/\s+/g, '-');
}
```

### Cache Lookup Logic

```typescript
// In API route handler:
const cacheKey = buildCacheKey(industry, location, seedTopic ?? '', source);

const cached = await supabase
  .from('exploration_cache')
  .select('*')
  .eq('cache_key', cacheKey)
  .gt('expires_at', new Date().toISOString())
  .single();

if (cached.data) {
  return { queries: cached.data.results, source, cached: true, cachedAt: cached.data.generated_at };
}

// Cache miss: run LLM pipeline
const queries = await generateExploration(industry, location, seedTopic, source);

await supabase.from('exploration_cache').insert({
  cache_key: cacheKey,
  industry,
  location: normalizeLocation(location),
  seed_topic: seedTopic ?? '',
  source,
  results: queries,
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

return { queries, source, cached: false };
```

---

## 8. Inngest Background Jobs

**No new Inngest jobs required for Phase 1.** The `POST /api/analytics/explore` route is a synchronous API call. Haiku responds in ~1-2 seconds — fast enough for a standard HTTP request.

**One cleanup addition** to the existing `cron.cleanup` Inngest job (see §4.2).

**Phase 2 consideration:** If Perplexity pipeline duration exceeds 10 seconds (3 parallel calls + Haiku enrichment), move the pipeline to an Inngest job with polling. Return a 202 from the API route with a job ID, and have the client poll for results. At current Perplexity response times (~2-4 seconds per call), this is not needed.

---

## 9. API Routes

### `POST /api/analytics/explore`

**Auth:** Required (Supabase session)

**Request body (Zod schema):**

```typescript
const ExploreSchema = z.object({
  industry:  z.string().min(1).max(100),
  location:  z.string().min(1).max(100),
  seedTopic: z.string().max(100).optional().default(''),
  source:    z.enum(['llm_generated', 'perplexity']).default('llm_generated'),
});
```

**Authorization logic:**
1. Verify auth session
2. Fetch user's subscription: `plan_tier`
3. If `plan_tier` is null (free/trial) or `'starter'`: return 403 `{ error: 'upgrade_required', tier: 'pro' }`
4. If `source === 'perplexity'` and `plan_tier !== 'business'`:
   - Check agent credits: if `used_amount + 0.5 <= base_allocation + rollover_amount + topup_amount`
   - If insufficient credits: return 403 `{ error: 'insufficient_credits', creditsRequired: 0.5 }`
   - If sufficient credits: deduct 0.5 credits (INSERT credit_transactions), then proceed
5. Check rate limit: 10 requests per hour per user (in-memory counter, Phase 1)
6. If rate limit exceeded: return 429 `{ error: 'rate_limit', retryAfter: number }`

**Cache lookup → pipeline logic:** See §7.

**Response shape:**

```typescript
{
  data: {
    queries: Array<{
      queryText: string;
      cluster: ClusterLabel;
      relevance: 'high' | 'medium' | 'low';
      language: 'en' | 'he';
    }>;
    source: 'llm_generated' | 'perplexity';
    cached: boolean;
    cachedAt: string | null;   // ISO timestamp if cached, null if freshly generated
    totalCount: number;
  }
}
```

**Error responses:**
- `400` — invalid request body (Zod failure, e.g., empty industry)
- `401` — not authenticated
- `403` — Starter tier, or insufficient credits for Perplexity
- `429` — rate limit exceeded
- `500` — LLM pipeline failed (Haiku or Perplexity error)

**Timeout:** Set a 15-second timeout on the full pipeline. If Haiku or Perplexity does not respond within 15 seconds, return 504 with `{ error: 'generation_timeout' }`. The client should show a retry button.

---

## 10. UI Components

All components live under `src/components/explore/`.

### `ExplorerPage`

Page component at `/dashboard/explore`.

**Behavior:**
- Server component wrapper that loads: business profile (industry, location), subscription tier, credit balance
- Passes data to `ExploreForm` as props (pre-fills industry/location from business profile)
- Renders `ExploreResultsGrid` with results (initially null — user must submit form)

### `ExploreForm`

**Props:**
```typescript
interface ExploreFormProps {
  defaultIndustry: string;
  defaultLocation: string;
  tier: 'pro' | 'business';
  creditsRemaining: number;
  onResults: (result: ExploreResult) => void;
}
```

**Fields:**
- Industry: text input, pre-filled, editable (e.g., "Dentist", "Plumber", "Accountant")
- Location: text input, pre-filled from business profile (e.g., "Tel Aviv", "תל אביב")
- Seed topic: optional text input with placeholder: "e.g., emergency, pediatric, pricing"
- Source toggle (Business tier only): "AI-Generated | Live Exploration"
  - Live Exploration option: amber badge showing credit cost "0.5 credits"
- Submit button: "Explore" with loading state spinner

**Validation:**
- Industry: required, minimum 1 character
- Location: required, minimum 2 characters
- Seed topic: optional, max 100 characters
- Client-side Zod validation before POST

**RTL:** Form labels are right-aligned in Hebrew mode. Input text direction is `dir="auto"` (adapts to content language). Submit button position mirrors.

### `ExploreResultsGrid`

**Props:**
```typescript
interface ExploreResultsGridProps {
  queries: ExplorationQuery[] | null;
  isLoading: boolean;
  source: 'llm_generated' | 'perplexity' | null;
  cached: boolean;
  cachedAt: string | null;
  businessId: string;
  onQueryAdded: (queryText: string) => void;
}
```

**Behavior:**
- `isLoading: true`: shows skeleton grid (6 skeleton cards in 2 rows)
- `queries: null` (initial state): shows empty state "Enter your industry and location above to discover what people ask about businesses like yours"
- `queries` populated: groups queries by cluster using the `ClusterGroup` component from F3
- Clusters are ordered by relevance: clusters with more 'high' relevance queries appear first
- Source indicator below grid: "AI-Generated results" or "Live data from Perplexity"
- If `cached: true`: shows "Results from [relative time ago] · [Refresh link]"
- Refresh link sets seedTopic to a random variation to bypass the cache (append a unique modifier)

**RTL:** Grid layout flows from right to left in Hebrew mode. Query text within each card respects `dir="auto"`.

### `ExploreResultsCard`

**Props:**
```typescript
interface ExploreResultsCardProps {
  query: ExplorationQuery;
  businessId: string;
  onAdded: () => void;
}
```

**Layout:**
- Query text (primary, `text-sm font-medium`)
- `RelevanceBadge` (top right corner of card)
- Cluster badge (small, uses `ClusterScoreBadge` color system but without a score — just cluster name)
- "Add to Tracking" button (bottom of card)
  - Default state: "Add to Tracking" with a `+` icon
  - Loading state: spinner
  - Success state: "Added" with a checkmark, button disabled
  - Already-tracking state: "Already tracking" (checked against user's existing tracked_queries)

### `RelevanceBadge`

**Props:**
```typescript
interface RelevanceBadgeProps {
  relevance: 'high' | 'medium' | 'low';
}
```

| Value | Color | Label |
|-------|-------|-------|
| high | `bg-green-100 text-green-700` | High |
| medium | `bg-amber-100 text-amber-700` | Medium |
| low | `bg-gray-100 text-gray-600` | Low |

---

## 11. Tier Gating

| Capability | Starter | Pro | Business |
|-----------|---------|-----|----------|
| /dashboard/explore page | No | Yes | Yes |
| LLM-generated exploration (Haiku) | No | Yes | Yes |
| Sessions per month (soft limit) | — | 4 (rate-limited to 10/hr) | Unlimited |
| Live Exploration (Perplexity) | No | No | Yes (0.5 credits/session) |
| Source toggle in ExploreForm | No | No | Yes |
| "Add to Tracking" button | No | Yes | Yes |
| Cache hit benefit (no LLM cost) | — | Yes | Yes |

**Gate implementation:**
- `/dashboard/explore` page: server component checks tier before rendering. Starter users see an UpgradeGate: blurred preview of the form + "This feature is available on Pro and Business plans"
- API route: returns 403 for Starter (see §9 logic)
- `source = 'perplexity'`: API returns 403 for Pro users (even if they somehow bypass the UI toggle)

**Navigation:** Add `/dashboard/explore` to the dashboard sidebar navigation under "Analytics" section, visible for Pro and Business users only. Show a grayed-out "Explore" link for Starter users with an upgrade badge.

---

## 12. Cost Impact

Source: `PRICING-IMPACT-ANALYSIS.md §1`

| Metric | Value |
|--------|-------|
| Marginal cost per user per month (LLM-generated, 4 sessions) | ~$0.012–$0.20 |
| Marginal cost per user per month (Perplexity Live, 4 sessions) | ~$0.12–$0.80 (Business tier) |
| Haiku cost per session | ~$0.003 |
| Perplexity cost per session | ~$0.03-0.09 |
| Cache hit rate (same industry/location explored by multiple users) | Reduces per-user cost proportionally |
| Tier gate | Pro (LLM); Business (Perplexity/Live) |
| Build priority | Medium |
| Build verdict from Axiom analysis | Build (LLM-generated variant) — Perplexity variant is premium only |

**Cost narrative:** A Pro user doing 4 exploration sessions per month incurs $0.012 in LLM costs (4 × $0.003 Haiku). At 1,000 Pro users: $12/month system-wide. Caching further reduces this — when two users in the same industry and location explore with the same parameters, the second user serves from cache with zero LLM cost. The Perplexity path adds $0.03-0.09 per session, fully offset by the 0.5 credit deduction (credits are limited, so Business users are naturally rate-limited by their credit budget). At the PRICING-IMPACT-ANALYSIS.md §1 estimate of 4 sessions/month, total Business-tier cost for Conversation Explorer is ~$0.30/user/month — well within the Business-tier margin.

---

## 13. Engineering Notes

**Build effort:** 2-3 weeks total.

| Week | Work |
|------|------|
| 1 | `exploration_cache` table + migration, location normalization constants (`src/constants/locations.ts`), `POST /api/analytics/explore` route (Haiku pipeline only, cache logic), Haiku prompt testing with 20 industry/location combinations |
| 2 | `/dashboard/explore` page, `ExploreForm`, `ExploreResultsGrid`, `ExploreResultsCard`, `RelevanceBadge`, "Add to Tracking" integration with `POST /api/queries`, RTL testing |
| 3 | Perplexity pipeline (Phase 2): seed query builder, parallel Perplexity calls, deduplication, Haiku enrichment, credit deduction logic, source toggle in UI, tier gating for Perplexity |

**Build order dependency:** Build F3 (Topic/Query Clustering) before this feature. F4 imports:
- `ClusterGroup` component from `src/components/rankings/clusters/ClusterGroup`
- `ClusterScoreBadge` from `src/components/rankings/clusters/ClusterScoreBadge`
- `CLUSTER_LABELS`, `getClusterLabel` from `src/constants/query-clusters.ts`

Do not duplicate these — import from F3.

**Haiku prompt testing protocol:**
Before deploying, test the generation prompt with at least 20 combinations:
- 5 industries: dentist, plumber, accountant, restaurant, gym
- 2 locations: Tel Aviv (Israeli), London (non-Israeli)
- 2 seed topics: "" (empty), "pricing"
- Validate: returned JSON is parseable, all items have valid cluster/relevance/language values, mix of Hebrew/English matches location type, no duplicate queries within a result set

**Risks:**

| Risk | Mitigation |
|------|-----------|
| LLM-generated queries are synthetic and may not reflect real search behavior | Clear UI copy: "These are suggested queries based on your industry. They are AI-generated estimates, not real search volume data." Never claim real volume. |
| Users re-click Explore expecting different results (same params → cached) | Explain caching in UI: "These results are from [time] ago. Change your seed topic for fresh results." Refresh link auto-modifies seed topic to bypass cache. |
| Hebrew city names and English city names produce different cache keys | Location normalization function in `src/constants/locations.ts` maps common aliases. Seed with 20+ city names at launch. Extend over time via PR. |
| Perplexity rate limits (40 RPM) | At 3 calls per session, a single session = 3 RPM. At 10 concurrent Business users exploring = 30 RPM. Fine at current scale. Add request queuing if needed at 100+ concurrent. |
| Exploration generates irrelevant queries for niche industries | Include industry as explicit context in the prompt. If industry is unusual, Haiku defaults to general SMB patterns — acceptable. |
| "Add to Tracking" button does not check if query already exists | Before calling POST /api/queries, check the tracked_queries list (loaded from React Query cache) for the exact query text. Show "Already tracking" immediately if found, without an API call. |

**Migration file:** `supabase/migrations/YYYYMMDDHHMMSS_exploration_cache.sql`

Apply before deploying the API route. The table has no RLS (no user/business data) — only backend service role access via the API route.

**Sidebar navigation update:**
In `src/components/dashboard/sidebar.tsx` (or equivalent), add the "Explore" nav item:
- Label: "Explore" (en) / "גלה" (he)
- Icon: `Telescope` or `Search` from lucide-react
- Href: `/dashboard/explore`
- Visible: Pro and Business tier only (conditionally rendered based on subscription context)
- Starter users: shown with gray color + `Lock` icon + tooltip "Upgrade to Pro to access"
