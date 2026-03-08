# Beamix — Topic/Query Clustering Technical Spec

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Ready for implementation
> **Audience:** Engineers building the Topic/Query Clustering feature. You should be able to implement this end-to-end without reading any other document.
> **Source docs:** `04-features/new-features-batch-1-spec.md`, `PRICING-IMPACT-ANALYSIS.md §1`, `04-features/dashboard-analytics-spec.md`

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Scope and Boundaries](#2-scope-and-boundaries)
3. [User Flows](#3-user-flows)
4. [Data Model](#4-data-model)
5. [Cluster Taxonomy](#5-cluster-taxonomy)
6. [Classification Pipeline](#6-classification-pipeline)
7. [Inngest Background Jobs](#7-inngest-background-jobs)
8. [API Routes](#8-api-routes)
9. [UI Components](#9-ui-components)
10. [Tier Gating](#10-tier-gating)
11. [Cost Impact](#11-cost-impact)
12. [Engineering Notes](#12-engineering-notes)

---

## 1. Feature Overview

**What it does:** As a user tracks more queries, the `/dashboard/rankings` page becomes a long flat list that is hard to navigate. Topic clustering automatically groups related queries into named semantic categories: "Pricing" (queries about cost, fees, pricing), "Location" (near me, in [city] queries), "Reviews" (top rated, best reviewed queries), and more. The user sees their average visibility score per cluster at a glance, can expand any cluster to see individual queries, and can filter the entire rankings view by cluster.

**Business value:**
- Solves a real UX problem that emerges as Pro users track more queries. A flat list of 50-75 queries is unusable without grouping.
- Surfaces insight that a flat list cannot: "Your Pricing cluster average is 28 — significantly lower than your Location cluster at 67. Consider focusing agent work on price-related content."
- Establishes cluster infrastructure (`ClusterGroup` component, cluster taxonomy constants) that Feature 4 (Conversation Explorer) depends on. Building F3 first is required.
- Pro and Business tier exclusive — adds clear upgrade value for Starter users who hit the query limit and want better analytics on their larger query sets.

**The core insight:** Tracking 75 queries without organization is like a spreadsheet without filters. Clusters transform a monitoring tool into a strategic diagnostic: users understand not just individual query performance but which topic areas are systematically strong or weak.

---

## 2. Scope and Boundaries

### In Scope — Phase 1

| Capability | Notes |
|-----------|-------|
| Haiku classification on query insert | Synchronous, <500ms, 7-label taxonomy |
| `cluster`, `cluster_confidence`, `cluster_overridden` columns on `tracked_queries` | ALTER TABLE migration |
| Backfill cron for existing queries | Weekly Sunday at 4am UTC, re-classifies low-confidence |
| `ClusterGroup` component on rankings page | Expandable sections, cluster-level score |
| `ClusterFilterTabs` component | Filter rankings by cluster |
| `ClusterScoreBadge` component | Color-coded avg visibility score per cluster |
| Manual override: user can reassign a query to a different cluster | PATCH /api/queries/[id]/cluster |
| i18n cluster names (Hebrew + English) | Constants file with translations |
| RTL support in all cluster components | |
| `clusterSummaries` in GET /api/dashboard/rankings response | Cluster-level aggregates |

### In Scope — Phase 2

| Capability | Notes |
|-----------|-------|
| Embedding + k-means clustering | Requires 50+ queries per user to be meaningful. OpenAI text-embedding-3-small. Weekly batch. |
| Cluster rename by user | Free-text rename stored in a separate user_cluster_labels table |
| Cross-cluster recommendation insight | "Your weakest cluster is Pricing — 3 agents are available to help" |

### Deferred

| Capability | Reason |
|-----------|--------|
| Rule-based keyword matching | Replaced by Haiku classification (more accurate, negligible cost difference) |
| Real-time cluster visualization (sunburst chart) | Complexity not justified for Phase 1 |
| Cluster-level alert triggers | Requires alert system integration. Future feature. |

### Out of Scope

- Clustering does not affect which queries are tracked or how scans run. It is purely a metadata layer on top of existing tracked queries.
- Clustering does not merge or deduplicate queries. A query in "Location" and a query in "Pricing" remain two separate tracked queries.
- Plan downgrade: if a Pro user downgrades to Starter, cluster data is preserved in the database but the clustering UI is hidden. Data is never deleted on downgrade.

---

## 3. User Flows

### 3.1 Cluster Classification on Query Add

```
1. User adds a new tracked query via /dashboard/rankings "Add Query" button
2. Client POSTs to /api/queries with { businessId, queryText, language }
3. API validates input, inserts row into tracked_queries (cluster = 'Other', cluster_confidence = 0.0)
4. API calls Haiku classification inline (synchronous, awaited before response)
5. Haiku returns { cluster: 'Pricing', confidence: 0.92 }
6. API updates the tracked_queries row: cluster = 'Pricing', cluster_confidence = 0.92
7. API returns 201 with the full query object including cluster field
8. Client adds the new query to the appropriate ClusterGroup in the rankings view
9. If Haiku call fails: query is created with cluster = 'Other', cluster_confidence = 0.0 (no error returned to user)
```

### 3.2 Viewing Clustered Rankings

```
1. User visits /dashboard/rankings (Pro or Business tier)
2. GET /api/dashboard/rankings returns query rows with cluster field + clusterSummaries array
3. Rankings page groups query rows by cluster using ClusterGroup components
4. Each ClusterGroup shows: cluster name (translated), query count, ClusterScoreBadge (avg score)
5. All ClusterGroups start expanded by default (first visit)
6. User collapses a cluster: only the summary row is shown (local state, not persisted)
7. ClusterFilterTabs appears above the groups: "All | Pricing | Location | Reviews | Comparison | Informational | Brand | Other"
8. User clicks "Pricing" tab: only Pricing cluster group is shown, others are hidden
9. User clicks "All": all groups are shown again
```

### 3.3 Manual Cluster Override

```
1. User sees a query classified as "Other" that belongs in "Pricing"
2. User clicks the three-dot menu on the query row → "Change cluster"
3. Dropdown appears with all 7 cluster options
4. User selects "Pricing"
5. Client PATCHes /api/queries/[id]/cluster with { cluster: 'Pricing' }
6. API updates: cluster = 'Pricing', cluster_overridden = true
7. Query moves to Pricing ClusterGroup in the UI immediately (optimistic update)
8. cluster_overridden = true means the nightly recluster job will skip this query permanently
```

### 3.4 Backfill on First Pro Upgrade

```
1. User upgrades from Starter to Pro
2. Inngest event subscription.upgraded fires
3. If business has tracked_queries where cluster = 'Other' AND cluster_confidence = 0.0:
   cron.query-recluster is triggered immediately (one-time, not waiting for Sunday)
4. All existing queries are classified via Haiku
5. User visits /dashboard/rankings — sees clustered view for the first time
```

---

## 4. Data Model

### 4.1 Schema Migration — `tracked_queries`

**No new table.** Three new columns on the existing `tracked_queries` table.

```sql
ALTER TABLE tracked_queries
  ADD COLUMN cluster              text           NOT NULL DEFAULT 'Other',
  ADD COLUMN cluster_confidence   numeric(3,2)   NOT NULL DEFAULT 0.0,
  ADD COLUMN cluster_overridden   boolean        NOT NULL DEFAULT false;

-- Add check constraint for valid cluster values
ALTER TABLE tracked_queries
  ADD CONSTRAINT tracked_queries_cluster_valid
  CHECK (cluster IN ('Pricing', 'Location', 'Reviews', 'Comparison', 'Informational', 'Brand', 'Other'));

-- Add check constraint for confidence range
ALTER TABLE tracked_queries
  ADD CONSTRAINT tracked_queries_cluster_confidence_valid
  CHECK (cluster_confidence >= 0.0 AND cluster_confidence <= 1.0);
```

**New columns:**

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| cluster | text | 'Other' | The assigned cluster label. Always one of the 7 defined values. |
| cluster_confidence | numeric(3,2) | 0.0 | Haiku's confidence score. Values: 0.00–1.00. Used to identify low-confidence rows for re-classification. |
| cluster_overridden | boolean | false | When true, the user manually set this cluster. Recluster job skips overridden rows. |

**New index:**

```sql
-- Used by GET /api/dashboard/rankings cluster grouping and filter queries
CREATE INDEX idx_tracked_queries_cluster
  ON tracked_queries (business_id, cluster);
```

### 4.2 Cluster Summary Query

The `clusterSummaries` array in the rankings API response is computed via SQL aggregation — no application-layer grouping needed:

```sql
SELECT
  tq.cluster,
  COUNT(*)                                          AS query_count,
  AVG(ser.rank_position)::numeric(5,2)             AS avg_rank,
  -- Visibility score from latest scan per query (simplified for spec clarity)
  AVG(CASE WHEN ser.is_mentioned THEN 70 ELSE 20 END)::integer AS avg_visibility_score
FROM tracked_queries tq
LEFT JOIN scan_engine_results ser
  ON ser.business_id = tq.business_id
  AND ser.created_at >= NOW() - INTERVAL '7 days'
WHERE tq.business_id = :business_id
GROUP BY tq.cluster
ORDER BY query_count DESC;
```

The actual visibility score calculation matches the scan engine's scoring algorithm. This SQL is the simplified version for spec illustration — the implementation should reuse the scoring logic from the scan engine's `computeVisibilityScore` function.

---

## 5. Cluster Taxonomy

### Taxonomy Definition

7 fixed labels for Phase 1. Defined as constants in `src/constants/query-clusters.ts`.

| Cluster | English examples | Hebrew examples | Classification signals |
|---------|----------------|----------------|----------------------|
| Pricing | "best price X", "how much does X cost", "X pricing 2025", "cheapest X", "X fees" | "כמה עולה X", "מחיר X", "X הכי זול" | price, cost, fee, cheap, expensive, מחיר, עלות |
| Location | "X near me", "X in Tel Aviv", "best X in [city]", "local X" | "X ליד ביתי", "X בתל אביב", "X ליד" | near me, in [city], local, nearby, ליד, ב[עיר] |
| Reviews | "top rated X", "X reviews", "best reviewed X", "highly rated X" | "X המומלצים ביותר", "ביקורות X" | reviews, rated, recommended, top, ביקורות, מומלץ |
| Comparison | "X vs Y", "compare X providers", "X alternatives", "X vs competitor" | "השוואה בין X ל-Y", "חלופות ל-X" | vs, compare, alternatives, versus, השוואה, לעומת |
| Informational | "how does X work", "what is X", "X explained", "X guide" | "מה זה X", "איך X עובד", "מדריך X" | what is, how, guide, explained, מה זה, איך, מדריך |
| Brand | Direct business name queries, "X company", "contact X" | "[שם עסק]", "פרטי קשר X" | exact business name, company, brand, about us |
| Other | Queries that do not fit the above 6 categories | | Fallback — always available |

### i18n Constants

```typescript
// src/constants/query-clusters.ts

export const CLUSTER_LABELS = [
  'Pricing',
  'Location',
  'Reviews',
  'Comparison',
  'Informational',
  'Brand',
  'Other',
] as const;

export type ClusterLabel = typeof CLUSTER_LABELS[number];

export const CLUSTER_TRANSLATIONS: Record<ClusterLabel, { en: string; he: string }> = {
  Pricing:       { en: 'Pricing',       he: 'מחירים' },
  Location:      { en: 'Location',      he: 'מיקום' },
  Reviews:       { en: 'Reviews',       he: 'ביקורות' },
  Comparison:    { en: 'Comparison',    he: 'השוואה' },
  Informational: { en: 'Informational', he: 'מידע כללי' },
  Brand:         { en: 'Brand',         he: 'מותג' },
  Other:         { en: 'Other',         he: 'אחר' },
};

// Used in UI to display localized cluster names based on user's language setting
export function getClusterLabel(cluster: ClusterLabel, language: 'en' | 'he'): string {
  return CLUSTER_TRANSLATIONS[cluster][language];
}
```

---

## 6. Classification Pipeline

### Haiku Prompt

```typescript
const CLASSIFICATION_SYSTEM_PROMPT = `
You are a query classification assistant for a GEO (Generative Engine Optimization) platform.
Classify search queries into exactly one of these categories:
- Pricing: queries about cost, price, fees, or value
- Location: queries with geographic intent (near me, in [city], local)
- Reviews: queries seeking reviews, ratings, or recommendations
- Comparison: queries comparing options, alternatives, or competitors
- Informational: queries seeking general knowledge or how-to information
- Brand: queries about a specific business name or contact details
- Other: queries that do not fit the above categories

You MUST respond with valid JSON only. No explanation.
Response format: {"cluster": "<label>", "confidence": <0.0-1.0>}
`;

function buildClassificationPrompt(queryText: string): string {
  return `Classify this query: "${queryText}"`;
}
```

### Classification Function

`src/lib/classification/classify-query.ts`

```typescript
interface ClassificationResult {
  cluster: ClusterLabel;
  confidence: number;
}

async function classifyQuery(queryText: string): Promise<ClassificationResult> {
  // 1. Call Haiku with system prompt + user message
  // 2. Parse JSON response: { cluster, confidence }
  // 3. Validate cluster is one of the 7 valid labels
  // 4. If parse fails or cluster is invalid: return { cluster: 'Other', confidence: 0.0 }
  // 5. Return result
}
```

**Timeout:** Set a 3-second timeout on the Haiku call. If it times out, return `{ cluster: 'Other', confidence: 0.0 }` — do not block the query insert.

**Failure mode:** Classification failure is silent from the user's perspective. The query is created successfully with `cluster = 'Other'`. The recluster cron job will re-classify it next Sunday.

---

## 7. Inngest Background Jobs

### 7.1 `cron.query-recluster`

**Purpose:** Weekly re-classification of low-confidence queries. Handles queries that were classified with low confidence or fell back to 'Other' due to Haiku timeout.

**Trigger:** `"0 4 * * 0"` (Sunday at 4am UTC — low traffic, after cleanup job)

**Concurrency:** Max 5 concurrent Inngest steps to stay within Anthropic rate limits (Haiku: 60 RPM for batched calls)

**Steps:**

```
Step 1 — find-low-confidence-queries
  Query:
    SELECT id, query_text, business_id
    FROM tracked_queries
    WHERE cluster_confidence < 0.7
      AND cluster_overridden = false
    ORDER BY created_at DESC
    LIMIT 500  -- process at most 500 per run to bound duration
  Returns: array of { id, queryText, businessId }

Step 2 — classify-in-batches
  Split results into batches of 20
  For each batch (in parallel, max 5 concurrent):
    For each query in batch:
      Call classifyQuery(query.queryText)
      Returns: { cluster, confidence }
  Collect results: Array<{ id, cluster, confidence }>

Step 3 — update-classifications
  For each result where confidence >= 0.7 (improved):
    UPDATE tracked_queries
    SET cluster = :cluster, cluster_confidence = :confidence
    WHERE id = :id AND cluster_overridden = false
  Log: { reclassifiedCount, skippedCount }
```

**Duration estimate:** 500 queries ÷ 60 RPM Haiku = ~8 minutes max. Acceptable for a weekly cron.

### 7.2 One-Time Backfill (on Pro upgrade or first feature enable)

Not a cron — triggered by `subscription.upgraded` event.

```
Step 1: Find all tracked_queries for the business where cluster = 'Other' AND cluster_confidence = 0.0
Step 2: Run Haiku classification for each
Step 3: Update rows with classification results
```

This backfill runs only once when the feature first activates for a business.

---

## 8. API Routes

### `GET /api/dashboard/rankings`

**Existing route. Add to response:**

**New query param (Zod extension):**

```typescript
// Add to existing RankingsQuerySchema:
cluster: z.enum(['Pricing', 'Location', 'Reviews', 'Comparison', 'Informational', 'Brand', 'Other']).optional(),
```

**Behavior change:**
- If `cluster` param provided: filter `tracked_queries WHERE cluster = :cluster`
- Always include `clusterSummaries` in response (computed via aggregation SQL from §4.2)
- `clusterSummaries` is included for Pro/Business tier only. Omit for Starter users.

**Response additions:**

```typescript
{
  data: {
    // ... existing fields ...
    clusterSummaries: Array<{
      cluster: ClusterLabel;
      queryCount: number;
      avgVisibilityScore: number;   // 0-100 integer
      trending: 'up' | 'down' | 'stable';  // vs previous 7-day period
    }> | null;  // null for Starter tier
  }
}
```

---

### `PATCH /api/queries/[id]/cluster`

**Auth:** Required. User must own the query via `tracked_queries → businesses → user_id`.

**Path param:** `id` — `tracked_queries.id` (uuid)

**Request body (Zod schema):**

```typescript
const UpdateClusterSchema = z.object({
  cluster: z.enum(['Pricing', 'Location', 'Reviews', 'Comparison', 'Informational', 'Brand', 'Other']),
});
```

**Logic:**
1. Validate auth and query ownership
2. Verify user is on Pro or Business tier
3. Update `tracked_queries`: set `cluster = :cluster`, `cluster_overridden = true`
4. Return updated query object

**Response shape:**

```typescript
{
  data: {
    id: string;
    queryText: string;
    cluster: ClusterLabel;
    clusterOverridden: true;
    clusterConfidence: number;
  }
}
```

**Error responses:**
- `400` — invalid cluster value
- `401` — not authenticated
- `403` — query not owned by user, or Starter tier
- `404` — query not found
- `500` — database error

---

## 9. UI Components

All cluster components live under `src/components/rankings/clusters/`.

### `ClusterGroup`

**This component is shared with Feature 4 (Conversation Explorer). Define it here; import it there.**

**Props:**
```typescript
interface ClusterGroupProps {
  cluster: ClusterLabel;
  queryCount: number;
  avgVisibilityScore: number;
  children: React.ReactNode;  // individual query rows
  defaultExpanded?: boolean;  // default true
  language: 'en' | 'he';
}
```

**Behavior:**
- Section header: cluster icon + translated cluster name + `ClusterScoreBadge` + query count chip + expand/collapse chevron
- RTL: in `dir="rtl"`, chevron moves to the left side of the header. Cluster name and badge remain correctly positioned.
- Default expanded on first render. Collapse state is local (not persisted).
- Header click toggles expansion.
- When collapsed: only the summary header row is visible.

### `ClusterScoreBadge`

**Props:**
```typescript
interface ClusterScoreBadgeProps {
  score: number;   // 0-100
  size?: 'sm' | 'md';
}
```

**Color rules:**
- 0-39: red (`bg-red-100 text-red-700`)
- 40-69: amber (`bg-amber-100 text-amber-700`)
- 70-100: green (`bg-green-100 text-green-700`)

### `ClusterFilterTabs`

**Props:**
```typescript
interface ClusterFilterTabsProps {
  clusters: ClusterLabel[];       // only clusters with at least 1 query
  activeCluster: ClusterLabel | 'all';
  onChange: (cluster: ClusterLabel | 'all') => void;
  language: 'en' | 'he';
}
```

**Behavior:**
- Horizontal scrollable tab strip above the ClusterGroup list
- First tab is always "All" (no filter)
- Remaining tabs are clusters that have at least 1 query (omit empty clusters)
- Active tab: underline indicator + bold label
- RTL: tabs render right-to-left in Hebrew mode. Scroll direction mirrors.
- Translated cluster names via `getClusterLabel(cluster, language)`

### Query row cluster override UX

On each query row in the rankings table, the cluster badge is tappable. Clicking it opens a `<DropdownMenu>` (Shadcn UI) with the 7 cluster options. Selecting one calls `PATCH /api/queries/[id]/cluster` and performs an optimistic update on the query's cluster value.

The manual override is indicated by a small "override" icon (pencil or tag) next to the cluster badge, with tooltip: "Cluster manually set by you. Auto-classification is disabled for this query."

---

## 10. Tier Gating

| Capability | Starter | Pro | Business |
|-----------|---------|-----|----------|
| Cluster columns stored (invisible) | Yes — data exists | Yes | Yes |
| ClusterGroup grouped rankings view | No | Yes | Yes |
| ClusterFilterTabs | No | Yes | Yes |
| ClusterScoreBadge per group | No | Yes | Yes |
| Manual cluster override | No | Yes | Yes |
| clusterSummaries in API response | No | Yes | Yes |
| Weekly recluster cron | No | Yes | Yes |

**Gate implementation:**
- Rankings page server component checks tier before fetching clusterSummaries
- Starter users see the flat uncluttered query list (same as current experience — no regression)
- UpgradeGate wrapper shown at the top of rankings for Starter users with 20+ queries: "Organize your queries into topic clusters — upgrade to Pro"

---

## 11. Cost Impact

Source: `PRICING-IMPACT-ANALYSIS.md §1`

| Metric | Value |
|--------|-------|
| Marginal cost per business per month (ongoing) | ~$0.005 |
| One-time backfill cost per user (30 existing queries × $0.001) | ~$0.03 |
| Calculation | 5 new queries/month × $0.001 Haiku classification each |
| At 1,000 Pro businesses: monthly total | ~$5/month |
| Tier gate | Pro and Business |
| Build priority | High |
| Build verdict from Axiom analysis | Build — high long-term UX value, cost negligible |

**Cost narrative:** Each Haiku classification costs approximately $0.001 (input + output tokens for a short classification prompt). A Pro user adding 5 new tracked queries per month incurs $0.005 in LLM costs. At 1,000 Pro businesses: $5/month system-wide. The weekly recluster job processes only low-confidence rows and is bounded to 500 queries per run — negligible cost. The one-time backfill at Pro upgrade is ~$0.03 per user (30 existing queries × $0.001) — also negligible. This feature costs less than a cent per user per month.

---

## 12. Engineering Notes

**Build effort:** 2 weeks total.

| Week | Work |
|------|------|
| 1 | Schema migration (ALTER TABLE), `classifyQuery` function, Haiku prompt refinement with Hebrew examples, integration into `POST /api/queries` (inline classification), `PATCH /api/queries/[id]/cluster` route, `cron.query-recluster` Inngest job, backfill trigger on upgrade |
| 2 | `ClusterGroup`, `ClusterScoreBadge`, `ClusterFilterTabs` components, rankings page integration (group query rows by cluster), `clusterSummaries` in GET /api/dashboard/rankings response, manual override UX, RTL testing |

**Build order:** Build before F4 (Conversation Explorer). F4 imports and reuses `ClusterGroup` and the taxonomy constants. If F3 is not complete, F4 cannot be built.

**Testing the Haiku prompt:**
Before finalizing the Haiku prompt, run it against at least 20 test queries spanning all 7 categories in both Hebrew and English. Target accuracy: >85% on the standard 7-category taxonomy. Include mixed-language queries (Hebrew query about a Tel Aviv business, English query with Hebrew business name). Document test results in `src/lib/classification/__tests__/classify-query.test.ts`.

**Risks:**

| Risk | Mitigation |
|------|-----------|
| Haiku misclassifies niche or non-English queries | Include Hebrew examples in prompt. Low-confidence queries fall back to 'Other' and are re-tried weekly. |
| Clusters are heavily unbalanced (e.g., 90% Location queries) | The UI must render single-query clusters gracefully. `ClusterGroup` should not collapse single-query groups by default. |
| Classification blocks the query INSERT response time | 3-second timeout on Haiku call. On timeout: insert succeeds with cluster='Other'. User never sees a slow response. |
| User upgrades to Pro with 75 existing queries | Backfill job handles this. 75 queries × $0.001 = $0.075 one-time cost. Acceptable. |
| Hebrew location names in query text | The Haiku prompt includes Hebrew location examples. Test with "X בתל אביב" and "X ביפו" patterns. |

**Migration file:** `supabase/migrations/YYYYMMDDHHMMSS_tracked_queries_cluster.sql`

Apply before deploying the classification pipeline. Existing rows will have `cluster = 'Other'` and `cluster_confidence = 0.0` — the backfill cron will classify them on the next Sunday run (or immediately on Pro upgrade trigger).
