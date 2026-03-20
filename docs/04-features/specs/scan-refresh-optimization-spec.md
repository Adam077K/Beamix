# Beamix — Scan Refresh Optimization Technical Spec (F9)

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Decision-ready — Strategy D approved
> **Audience:** Engineers building the scheduled scan system. You should be able to implement this feature end-to-end without reading any other document.
> **Source docs:** `PRICING-IMPACT-ANALYSIS.md §1`, `04-features/scan-engine-spec.md`, `docs/PRD.md`

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Scope and Boundaries](#2-scope-and-boundaries)
3. [User Flows](#3-user-flows)
4. [Data Model](#4-data-model)
5. [Business Logic](#5-business-logic)
6. [Inngest Jobs](#6-inngest-jobs)
7. [API Routes](#7-api-routes)
8. [UI Components](#8-ui-components)
9. [Tier Gating](#9-tier-gating)
10. [Cost Impact](#10-cost-impact)
11. [Engineering Notes](#11-engineering-notes)

---

## 1. Feature Overview

Business-tier users currently get a full scan every 4 hours (6x/day). The request is to move to 30-minute refresh intervals. Running all engines on all queries every 30 minutes would cost $1,836/business/month — an 8x cost increase that destroys margins.

**Strategy D (Priority Query Rotation)** solves this without that cost. Instead of scanning everything every 30 minutes, the system runs a targeted priority cycle every 30 minutes on the top 5 high-signal queries across 3 rotating engines, while continuing the existing full scan every 6 hours. The result: a 30-minute "pulse" for the queries that matter most, full coverage maintained on schedule, and a net cost reduction of $15.30/business/month versus the current 4-hour cadence.

This is not a compromise. Priority queries are algorithmically selected — no LLM involved — based on search volume and recent visibility volatility. A business that drops 10% on their top query gets a signal in 30 minutes, not 4 hours.

**Business value:**
- Business-tier users see visibility changes within 30 minutes instead of up to 4 hours. This makes the dashboard genuinely real-time for what matters.
- The priority score system surfaces which queries are moving, creating a distinct analytics surface ("Query Pulse") that competitors don't offer.
- Cost decreases by $15.30/business/month versus baseline — Strategy D saves money while delivering a better product.

---

## 2. Scope and Boundaries

### In Scope — Phase 1 (Launch)

| Item | Notes |
|------|-------|
| Priority query selection algorithm (no LLM) | Score = volume × 0.6 + volatility × 0.4 |
| 30-minute Inngest cron for Business-tier businesses | `*/30 * * * *` |
| Priority cycle: top 5 queries × 3 rotating engines | Gemini Flash for parsing |
| Nightly priority score recalculation | Inngest step, sequential |
| Full scan cadence maintained at 6 hours (Business) | Unchanged from current Haiku-parsed logic |
| `scan_mode` parameter on Inngest events | `'priority'` or `'full'` |
| New columns on `tracked_queries` | `is_priority`, `priority_score`, `priority_updated_at` |
| Dashboard "Query Pulse" indicator | Shows last priority scan timestamp |

### In Scope — Phase 2 (Growth)

| Item | Notes |
|------|-------|
| Priority score weighting tuning | Adjust weights based on real data |
| Alert: notify when a priority query changes >10% in one cycle | Requires alert system (F alert-workflow) |
| Priority cycle history view | Chart showing priority query score over time |

### Explicitly Deferred

| Item | Reason |
|------|--------|
| Strategy C (response caching) | Architectural change — separate cache layer required. High-value but not this spec. |
| Sub-30-minute intervals | No use case identified. Real-time WebSocket approach would be needed. |
| Per-engine priority cycling (some engines only) | Not enough differentiation vs Strategy D to justify complexity |

### Out of Scope

- Changing Pro or Starter scan cadences (this feature is Business-only)
- Modifying the full scan pipeline logic
- Changing how `scan_engine_results` rows are written
- Free scan performance (separate code path)

---

## 3. User Flows

### 3.1 Priority Scan Cycle (Automated, Business Tier)

No user action required. This runs in the background every 30 minutes.

```
1. cron.scheduled-scans fires at :00 and :30 of every hour
2. Function queries all Business-tier businesses due for a priority cycle
3. For each business: reads top 5 tracked_queries by priority_score DESC
4. Rotates engine selection: cycle_number % 3 determines engine set
   - Set 0: ChatGPT, Gemini, Claude
   - Set 1: Gemini, Perplexity, Grok
   - Set 2: ChatGPT, Perplexity, You.com
5. Sends scan/priority.start event for each business
6. scan.priority.run function executes: 5 queries × 3 engines = 15 calls
7. Parsing: Gemini Flash (cost: $0.0001/call vs Haiku $0.002)
8. Scoring: updates scan_engine_results + recomputes overall_score delta
9. Writes scan row with scan_type='priority'
10. Fires scan/priority.completed event
11. Dashboard Realtime subscription receives update if user is active
```

### 3.2 Full Scan Cycle (Unchanged, Every 6 Hours)

The existing full scan logic runs every 6 hours for Business tier — same as the current 4-hour cadence but extended to 6 hours (4/day → 4/day, offset by priority cycle coverage). The only change is the cron expression on `cron.scheduled-scans` now handles both modes.

```
1. cron.scheduled-scans fires every 30 minutes
2. Function checks: time_since_last_full_scan >= 6 hours?
3. If yes: sends scan/full.start event (same as current scan pipeline)
4. If no: sends scan/priority.start event (new priority cycle)
5. Full scan runs all tracked queries (up to 75) × all enabled engines
6. Parsing: Haiku (cost: $0.002/call — acceptable for full scan)
```

### 3.3 Priority Score Recalculation (Nightly)

Runs once per night. No user interaction.

```
1. cron.priority-score-update fires at 02:00 UTC daily
2. For each business: reads all active tracked_queries
3. For each query: computes new priority_score (see §5.1)
4. Bulk updates tracked_queries.priority_score + priority_updated_at
5. Sets is_priority = TRUE for top 5 queries per business
6. Sets is_priority = FALSE for all others
```

### 3.4 Dashboard "Query Pulse" View (User-Facing)

```
1. User visits /dashboard/rankings
2. Rankings page shows priority badge on top 5 queries (is_priority = TRUE)
3. "Last checked: 8 minutes ago" timestamp from most recent priority scan
4. Expanding a priority query row shows recent 30-min delta: +2% or -3%
5. Non-priority queries show last full scan timestamp instead
```

---

## 4. Data Model

### 4.1 Changes to `tracked_queries`

```sql
ALTER TABLE tracked_queries
  ADD COLUMN is_priority BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN priority_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  ADD COLUMN priority_updated_at TIMESTAMPTZ;

-- Index: business fast lookup of top priority queries
CREATE INDEX idx_tracked_queries_priority
  ON tracked_queries (business_id, priority_score DESC)
  WHERE is_active = TRUE AND is_priority = TRUE;

-- Index: nightly recalc — find stale scores
CREATE INDEX idx_tracked_queries_priority_stale
  ON tracked_queries (priority_updated_at ASC NULLS FIRST)
  WHERE is_active = TRUE;
```

**Why these columns on `tracked_queries` and not a separate table:** Priority is a property of a query, not a separate entity. A join table would add complexity with no gain. The `is_priority` boolean makes it trivially fast to fetch the top 5 without a subquery.

### 4.2 Changes to `scans`

```sql
-- Add scan_mode to distinguish priority cycles from full scans
-- scan_type already has 'scheduled' — we use scan_mode as the sub-type
ALTER TABLE scans
  ADD COLUMN scan_mode TEXT CHECK (scan_mode IN ('priority', 'full')) DEFAULT 'full';

CREATE INDEX idx_scans_mode ON scans (business_id, scan_mode, scanned_at DESC);
```

**Note:** `scan_type = 'scheduled'` remains unchanged. `scan_mode = 'priority'` marks priority cycles. Full cron scans have `scan_mode = 'full'`. Manual and import scans have `scan_mode = NULL` (default). Do not change `scan_type` semantics.

### 4.3 No Changes to `scan_engine_results`

Priority cycle results write to `scan_engine_results` with the same schema as full scans. The `scan_id` foreign key links back to the `scans` row which carries `scan_mode = 'priority'`. No additional columns needed.

### 4.4 RLS

No RLS changes. Priority cycle scans write via service role (Inngest). Users read their own `scans` rows via existing `user_id = auth.uid()` policy. `tracked_queries` RLS is unchanged: `user_id = auth.uid()` for SELECT/UPDATE, service role for INSERT from Inngest.

---

## 5. Business Logic

### 5.1 Priority Score Algorithm

The priority score is computed nightly per query. It uses two signals: estimated search volume and recent visibility volatility. No LLM is called — both signals are derived from existing data.

```
priority_score = (normalized_volume_rank × 0.6) + (volatility_score × 0.4)
```

**Step 1: Normalized Volume Rank**

```typescript
// Fetch all active tracked_queries for the business, joined with prompt_library
// Sort by prompt_library.estimated_volume DESC
// Assign rank 1 to highest volume query
// normalized_volume_rank = (total_queries - rank + 1) / total_queries
// Result: top query = 1.0, bottom query approaches 0

const queries = await supabase
  .from('tracked_queries')
  .select('id, prompt_library_id, prompt_library(estimated_volume)')
  .eq('business_id', businessId)
  .eq('is_active', true);

const sorted = queries.sort((a, b) =>
  (b.prompt_library?.estimated_volume ?? 0) - (a.prompt_library?.estimated_volume ?? 0)
);

const n = sorted.length;
sorted.forEach((q, index) => {
  q.normalized_volume_rank = (n - index) / n;
});
```

**Step 2: Volatility Score**

```typescript
// For each query: fetch scan_engine_results for last 7 days
// Compute is_mentioned rate per day
// visibility_today = count(is_mentioned=true) / count(all) for today
// avg_7d_visibility = mean of daily is_mentioned rates over last 7 days
// volatility_score = abs(visibility_today - avg_7d_visibility) / 100

const recentResults = await supabase
  .from('scan_engine_results')
  .select('is_mentioned, created_at')
  .eq('business_id', businessId)
  .eq('prompt_text', query.query_text)  // match by text since tracked_queries links to prompt_library
  .gte('created_at', sevenDaysAgo)
  .order('created_at', { ascending: false });

const byDay = groupByDay(recentResults);
const dailyRates = Object.values(byDay).map(
  (day) => day.filter((r) => r.is_mentioned).length / day.length
);

const avg7d = dailyRates.reduce((sum, r) => sum + r, 0) / dailyRates.length;
const today = dailyRates[0] ?? 0;
const volatilityScore = Math.abs(today - avg7d);  // already 0-1 range, no /100 needed
```

**Step 3: Combine and Write**

```typescript
const priorityScore = (normalizedVolumeRank * 0.6) + (volatilityScore * 0.4);

await supabase
  .from('tracked_queries')
  .update({
    priority_score: Math.round(priorityScore * 100) / 100,
    priority_updated_at: new Date().toISOString(),
  })
  .eq('id', query.id);
```

**Step 4: Set `is_priority` Flag**

After updating all scores for a business, select the top 5 and mark them. Reset all others.

```sql
-- Reset all
UPDATE tracked_queries SET is_priority = FALSE
WHERE business_id = $1 AND is_active = TRUE;

-- Set top 5
UPDATE tracked_queries SET is_priority = TRUE
WHERE id IN (
  SELECT id FROM tracked_queries
  WHERE business_id = $1 AND is_active = TRUE
  ORDER BY priority_score DESC
  LIMIT 5
);
```

### 5.2 Engine Rotation

The 3 engines used in each priority cycle rotate to ensure all 7 enabled engines get coverage over time. The rotation is deterministic: based on the count of priority scans completed for the business.

```typescript
const ENGINE_SETS: Record<number, string[]> = {
  0: ['chatgpt', 'gemini', 'claude'],
  1: ['gemini', 'perplexity', 'grok'],
  2: ['chatgpt', 'perplexity', 'you_com'],
};

// cycleNumber = count of priority scans for this business (mod 3)
const cycleCount = await supabase
  .from('scans')
  .select('id', { count: 'exact', head: true })
  .eq('business_id', businessId)
  .eq('scan_mode', 'priority');

const engineSet = ENGINE_SETS[cycleCount % 3];
```

### 5.3 Determining Scan Mode at Runtime

The `cron.scheduled-scans` job fires every 30 minutes. It must decide, per business, whether to run a priority cycle or a full scan.

```typescript
async function determineScanMode(businessId: string): Promise<'priority' | 'full' | 'skip'> {
  const lastFullScan = await supabase
    .from('scans')
    .select('scanned_at')
    .eq('business_id', businessId)
    .eq('scan_mode', 'full')
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single();

  const hoursSinceFullScan = lastFullScan
    ? (Date.now() - new Date(lastFullScan.scanned_at).getTime()) / 3_600_000
    : Infinity;

  if (hoursSinceFullScan >= 6) return 'full';

  const lastPriorityScan = await supabase
    .from('scans')
    .select('scanned_at')
    .eq('business_id', businessId)
    .eq('scan_mode', 'priority')
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single();

  const minutesSinceLastPriority = lastPriorityScan
    ? (Date.now() - new Date(lastPriorityScan.scanned_at).getTime()) / 60_000
    : Infinity;

  if (minutesSinceLastPriority >= 28) return 'priority';  // 28min window for 30min target

  return 'skip';
}
```

---

## 6. Inngest Jobs

### 6.1 Modified: `cron.scheduled-scans`

**Trigger:** `{ cron: "*/30 * * * *" }` (was every 60 minutes)

**Steps:**

```typescript
// Step 1: Fetch all Business-tier businesses with active subscriptions
const businesses = await step.run('fetch-business-tier-businesses', async () => {
  return supabase
    .from('businesses')
    .select('id, user_id')
    .in('id',
      supabase
        .from('subscriptions')
        .select('business_id')
        .eq('plan_tier', 'business')
        .eq('status', 'active')
    );
});

// Step 2: Fan out — determine mode per business and send event
await step.run('dispatch-scan-events', async () => {
  for (const business of businesses) {
    const mode = await determineScanMode(business.id);
    if (mode === 'skip') continue;

    await inngest.send({
      name: mode === 'full' ? 'scan/full.start' : 'scan/priority.start',
      data: { business_id: business.id, scan_mode: mode },
    });
  }
});
```

**Notes:**
- Pro and Starter businesses also checked by this cron but use their existing 1/day and 1/month logic via `scan/full.start` only (no priority cycles).
- The cron expression change from `0 * * * *` to `*/30 * * * *` is the only change to the trigger. All Pro/Starter logic is gated inside the function by checking `plan_tier`.

### 6.2 New: `scan/priority.start` → `scan.priority.run`

**Event:** `scan/priority.start` with data `{ business_id: string, scan_mode: 'priority' }`

**Steps:**

```typescript
// Step 1: Select top 5 priority queries
const priorityQueries = await step.run('select-priority-queries', async () => {
  const { data } = await supabase
    .from('tracked_queries')
    .select('id, query_text')
    .eq('business_id', data.business_id)
    .eq('is_active', true)
    .eq('is_priority', true)
    .order('priority_score', { ascending: false })
    .limit(5);
  return data ?? [];
});

if (priorityQueries.length === 0) {
  // No priority queries set yet — fall through to full scan or skip
  return { skipped: true, reason: 'no_priority_queries' };
}

// Step 2: Determine engine set for this cycle
const engineSet = await step.run('get-engine-set', () => getEngineSetForBusiness(data.business_id));

// Step 3: Create scans row (type: 'scheduled', mode: 'priority')
const scan = await step.run('create-scan-row', async () => {
  const { data: scan } = await supabase
    .from('scans')
    .insert({
      business_id: data.business_id,
      scan_type: 'scheduled',
      scan_mode: 'priority',
      status: 'processing',
      engines_queried: engineSet,
      prompts_used: priorityQueries.length,
    })
    .select()
    .single();
  return scan;
});

// Step 4: Fan out engine calls (15 total: 5 queries × 3 engines)
const engineResults = await step.run('execute-priority-engine-calls', async () => {
  const calls = priorityQueries.flatMap((query) =>
    engineSet.map((engine) => executeEngineCall(engine, query.query_text, data.business_id))
  );
  return Promise.allSettled(calls);
});

// Step 5: Parse with Gemini Flash (not Haiku — lower cost, adequate quality for priority checks)
const parsed = await step.run('parse-with-gemini-flash', async () => {
  return parseResultsWithGeminiFlash(engineResults, data.business_id, scan.id);
});

// Step 6: Write scan_engine_results rows
await step.run('write-engine-results', async () => {
  await supabase.from('scan_engine_results').insert(parsed.rows);
});

// Step 7: Update scan row to completed + compute delta
await step.run('complete-scan', async () => {
  const delta = computeScoreDelta(parsed.rows);
  await supabase
    .from('scans')
    .update({
      status: 'completed',
      overall_score: parsed.overallScore,
      completed_at: new Date().toISOString(),
      results_summary: { delta, scan_mode: 'priority', queries_checked: priorityQueries.length },
    })
    .eq('id', scan.id);
});

// Step 8: Fire completion event (for alerts downstream)
await step.sendEvent('scan-priority-completed', {
  name: 'scan/priority.completed',
  data: { business_id: data.business_id, scan_id: scan.id, delta: parsed.delta },
});
```

### 6.3 New: `cron.priority-score-update`

**Trigger:** `{ cron: "0 2 * * *" }` — 02:00 UTC daily

**Steps:**

```typescript
// Step 1: Fetch all businesses with active tracked queries
const businesses = await step.run('fetch-businesses', async () => {
  return supabase
    .from('businesses')
    .select('id')
    .in('id',
      supabase
        .from('tracked_queries')
        .select('business_id')
        .eq('is_active', true)
    );
});

// Step 2: For each business, recalculate priority scores
// Uses Inngest step.run with a batch approach — not a fan-out to avoid overwhelming DB
for (const batch of chunk(businesses, 50)) {
  await step.run(`recalculate-priority-scores-batch`, async () => {
    for (const business of batch) {
      await recalculatePriorityScores(business.id);  // see §5.1
    }
  });
}
```

**Why not fan out per business:** Priority score recalculation is a read-heavy SQL operation. 50 concurrent Inngest functions reading 7 days of `scan_engine_results` at once would saturate Supabase connection pool. Sequential batches of 50 businesses are safer.

---

## 7. API Routes

### `GET /api/scan/priority-status`

Returns the current priority scan status for the authenticated user's business. Used by the dashboard to show "Last checked X minutes ago" per query.

**Auth:** Required (Supabase Auth session)

**Query params:**
- `business_id` (required)

**Response:**
```typescript
{
  data: {
    last_priority_scan_at: string | null;       // ISO timestamp
    last_full_scan_at: string | null;           // ISO timestamp
    next_priority_scan_at: string | null;       // estimated, computed from last + 30min
    priority_queries: Array<{
      id: string;
      query_text: string;
      priority_score: number;
      latest_delta: number | null;              // visibility change since prior priority cycle
    }>;
  }
}
```

**Implementation:** Reads `tracked_queries` where `is_priority = TRUE` and joins with most recent `scan_engine_results` to compute delta. No LLM call.

---

## 8. UI Components

### 8.1 `PriorityQueryBadge`

**Location:** `src/components/dashboard/priority-query-badge.tsx`

**Props:**
```typescript
interface PriorityQueryBadgeProps {
  isPriority: boolean;
  lastCheckedAt: string | null;  // ISO timestamp
  delta: number | null;          // +3.5 or -2.1 (percentage points)
}
```

**Behavior:** Shows a pulsing orange dot on priority queries. Tooltip: "Checked every 30 min. Last: 8 min ago." Delta shown as colored chip: green for positive, red for negative, gray for zero.

**RTL:** The pulsing dot uses `absolute` positioning with `start-0` (not `left-0`) to respect RTL layout direction. The tooltip renders on the inline-end side.

### 8.2 `ScanModeIndicator`

**Location:** `src/components/dashboard/scan-mode-indicator.tsx`

**Props:**
```typescript
interface ScanModeIndicatorProps {
  lastPriorityScanAt: string | null;
  lastFullScanAt: string | null;
  planTier: 'starter' | 'pro' | 'business';
}
```

**Behavior:** Shown at top of Rankings page. For Business users: "Priority pulse: 8 min ago — Full scan: 3 hr ago." For Pro/Starter: shows only the full scan timestamp. For non-Business: shows upgrade nudge if user has seen the feature label.

**RTL:** Uses `flex-row-reverse` under `[dir=rtl]` selector. Timestamps use `dir="ltr"` to prevent numeric reversal.

---

## 9. Tier Gating

| Feature | Starter | Pro | Business |
|---------|---------|-----|---------|
| 30-minute priority cycles | No | No | Yes |
| Priority query badges on Rankings | No | No | Yes |
| Nightly priority score recalculation | No | No | Yes |
| `GET /api/scan/priority-status` | 403 | 403 | Yes |
| Scan mode = 'priority' events dispatched | No | No | Yes |
| Full scans (scheduled) | Monthly | Daily | Every 6h |

**Gate implementation:** `cron.scheduled-scans` checks `plan_tier = 'business'` before dispatching `scan/priority.start`. The API route also checks tier and returns 403 with `{ error: 'PLAN_UPGRADE_REQUIRED', required_tier: 'business' }` for non-Business users.

---

## 10. Cost Impact

Full Strategy D cost math (sourced from `PRICING-IMPACT-ANALYSIS.md §1`):

| Strategy | Scan Frequency | Engines Per Cycle | Parser | Cost/Business/Month | vs Baseline |
|----------|---------------|-------------------|--------|---------------------|-------------|
| Baseline (current) | Full scan every 4h | 7 (Business) | Haiku | $229.50 | — |
| Naive 30-min (all engines) | Full scan every 30min | 7 | Haiku | $1,836.00 | +700% |
| **Strategy D (recommended)** | Priority 30min + Full 6h | 3 rotating / 7 | Flash / Haiku | **$214.20** | **-$15.30** |

**Strategy D breakdown:**

Priority cycle costs (per cycle):
- Engine calls: 5 queries × 3 engines = 15 calls × $0.002 = $0.030
- Parsing (Gemini Flash): 15 responses × 5 sentences avg = 75 tokens × $0.0001 = $0.0075
- Score update (write + delta compute): $0.005
- **Per priority cycle: $0.0425**

Full scan costs (per cycle, unchanged from current):
- Engine calls: 75 queries × 7 engines = 525 calls × $0.002 = $1.05
- Parsing (Haiku): 525 responses × $0.002 = included above (same Haiku call for parse)
- Score update: $0.225
- **Per full cycle: $1.275**

Daily total:
- Priority cycles: 48 cycles/day × $0.0425 = $2.04/day
- Full scans: 4 scans/day × $1.275 = $5.10/day
- **Total: $7.14/day = $214.20/month**

Versus baseline (full scan every 4h = 6 full scans/day):
- Baseline: 6 × $1.275 = $7.65/day = $229.50/month
- **Strategy D: $214.20/month (saves $15.30/month per Business user)**

**At 50 Business users:** Total monthly scan cost = 50 × $214.20 = $10,710 (vs $11,475 with old 4h cadence). Savings: $765/month.

**Parser cost justification:** Gemini Flash at $0.0001/call is 20× cheaper than Haiku at $0.002/call. For priority cycles (detection only — "was the business mentioned?"), Flash quality is sufficient. Full scans continue to use Haiku for detailed sentiment + context extraction where quality matters.

---

## 11. Engineering Notes

**Do not change Pro/Starter cadence.** The cron runs every 30 minutes for all tiers. Pro and Starter businesses dispatch `scan/full.start` at their existing intervals (daily, monthly). The only new code path is `scan/priority.start` dispatched only for Business-tier businesses.

**Priority queries with no data yet.** On first deployment, `priority_score = 0.0` for all queries (the default). The nightly `cron.priority-score-update` will populate scores after the first run. Until then, `is_priority` is false for all queries and priority cycles return `{ skipped: true, reason: 'no_priority_queries' }`. The first full scan after deployment will unblock the nightly job.

**Volatility score edge case.** If a business was onboarded within 7 days, there may be fewer than 7 days of `scan_engine_results` rows. Use `NULLIF(count, 0)` and default `volatility_score = 0.0` when insufficient data. This results in a pure volume-based priority score for new businesses — acceptable behavior.

**Gemini Flash API.** Use the `gemini-flash` model ID for priority cycle parsing. The parse prompt is simpler than the Haiku parse prompt: it only needs `{ is_mentioned: boolean, rank_position: number | null }`. It does NOT need sentiment, citations, or mention context. Those are full scan outputs only.

**Cycle count for engine rotation.** The `SELECT COUNT(*)` query to determine `cycleCount` runs before every priority scan. At high Business user counts this adds latency. Cache the count in `businesses.priority_cycle_count` (integer, incremented each priority scan) to avoid the aggregation query. Add this column if the per-business query latency exceeds 100ms in production.

**Migration checklist:**
1. Run `ALTER TABLE tracked_queries ADD COLUMN ...` migration in Supabase
2. Run `ALTER TABLE scans ADD COLUMN scan_mode ...` migration
3. Deploy Inngest function changes before enabling new cron expression
4. Update cron expression to `*/30 * * * *` only after function is deployed
5. Verify `cron.priority-score-update` fires and populates scores before relying on priority cycles in production
