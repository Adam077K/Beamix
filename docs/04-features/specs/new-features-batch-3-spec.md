# Beamix — Features Batch 3 Engineering Spec

> **2026-04 pricing update:** Canonical tier names/prices are now Discover $79 / Build $189 / Scale $499. Dollar figures referenced in this spec for cost analysis reflect the earlier $49/$149/$349 tier structure. Tier gating should be read as: Starter → Discover, Pro → Build, Business → Scale. Per-feature cost conclusions remain directionally valid.

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Audience:** Engineers and product stakeholders. Each feature is independently implementable from this document.
> **Features covered:** Feature 9 (30-Minute Scan Refresh + Cost Optimization), Feature 10 (Multi-Region / City-Level Scanning), Feature 11 (Real Prompt Volume Data)

---

## Summary Table

| Feature | Description | Monthly Cost Impact (per 1K businesses) | Tier Recommendation | Priority |
|---------|-------------|----------------------------------------|--------------------|-|
| **F9: 30-Min Scan Refresh** | Reduce scheduled scan cadence from 1-hour to 30-minute cycles for Business tier, using engine rotation + Haiku parsing to hold cost flat | +$0 (flat) if rotation strategy adopted; +~$8,500 if naive doubling | Business tier only at launch | High — competitive (RankPrompt has 15-min refresh) |
| **F10: City-Level Scanning** | Append location modifiers to tracked queries; scan per-city; store results with location tag | +$2.50-5/business/month per additional city (linear) | Starter: 1 region, Pro: 5 regions, Business: unlimited | Medium — strong for Israeli market |
| **F11: Real Prompt Volume Data** | GSC integration (free, user-connects) as primary source; internal panel aggregation as secondary; Keyword Planner proxy as tertiary | $0 (GSC/internal); ~$50-500/month if keyword API used | GSC integration: Pro+; Internal panel: all tiers | Medium — big differentiation if done right, costly if done wrong |

---

## Feature 9: Reduce Scan Refresh to 30 Minutes + Cost Optimization

### A. Research and Feasibility Analysis

**What this does for the user:**

Business tier users currently get scans every 4 hours (6 scans/day, based on `scan_frequency_days = 0.17`). The owner wants to reduce the top-tier cadence to every 30 minutes (48 scans/day), a 8x increase in scan frequency. For SMBs competing aggressively on AI search, a 30-minute signal latency means seeing a competitor overtake them within the same business day — and triggering an automated agent response before the day ends.

For context: RankPrompt (the closest budget competitor) advertises 15-30 minute monitoring. Being at 30 minutes would give Beamix parity with the most aggressive refresh rate in the SMB segment.

**Current state in the codebase:**

The `cron.scheduled-scans` Inngest function fires every 1 hour. The `scan.scheduled` Inngest function executes each due business scan. `businesses.next_scan_at` is computed from `scan_frequency_days` per tier. To go to 30-minute cycles, the cron must fire every 30 minutes AND `scan_frequency_days` for Business must be set to `0.021` (30 minutes = 0.0208 days).

**Competitor implementations:**

- RankPrompt: 15-30 min, browser-based front-end capture (less reliable but faster)
- Otterly: Daily
- Peec AI: Near-daily
- SE Visible: Daily
- Profound: No stated cadence (enterprise SLAs vary)

No competitor at SMB pricing does true 30-minute API-based scanning across 7 engines.

**Minimum viable version:**

30-minute cron firing for Business tier only, using engine rotation strategy (Strategy A below) to hold cost flat.

**Full version:**

30-minute cron + engine rotation + response caching (Strategy C) + Haiku-only parsing for rotation cycles (Strategy B). All three strategies combined.

---

### B. Cost Impact Analysis — Feature 9

This is the critical section. All math is explicit.

#### Baseline Assumptions

| Variable | Value | Source |
|----------|-------|--------|
| Engines per Business tier scan | 7 | System design §5.2 (Pro: 7 engines) |
| Tracked queries per business | 25 | `tracked_queries` Starter: 10, Pro: 25, Business: 75. Using 25 as a conservative Business baseline for this calc. |
| Haiku parsing stages per response | 5 | Intelligence Layer §1.3: mention detection, position extraction, sentiment, citation extraction, competitor extraction |
| Haiku input tokens per call | ~600 tokens avg | AI response (~400 tokens) + system prompt (~200 tokens) |
| Haiku output tokens per call | ~100 tokens avg | Structured extraction output |
| Haiku input cost | $1.00 / 1M tokens | Claude Haiku 4.5 pricing |
| Haiku output cost | $5.00 / 1M tokens | Claude Haiku 4.5 pricing |
| Gemini Flash input cost | $0.075 / 1M tokens | Gemini 2.0 Flash pricing |
| Gemini Flash output cost | $0.30 / 1M tokens | Gemini 2.0 Flash pricing |
| Engine query cost avg | ~$0.002 / query | ChatGPT gpt-4o ~$0.003, Gemini Flash ~$0.001, Perplexity sonar-pro ~$0.005, Claude Haiku ~$0.001, Grok/DeepSeek/You.com ~$0.001-0.003 |

#### Cost per Haiku Parsing Call

```
Input:  600 tokens × ($1.00 / 1,000,000) = $0.0006
Output: 100 tokens × ($5.00 / 1,000,000) = $0.0005
Total per call:                             $0.00055 ≈ $0.001
```

(Rounding to $0.001/call matches the Intelligence Layer's ~$0.001/call estimate.)

#### Cost per Single Business Scan (current config, any tier)

```
Engine queries:
  7 engines × 25 queries = 175 engine calls
  175 calls × $0.002/call = $0.35

Parsing pipeline:
  175 responses × 5 Haiku stages = 875 Haiku calls
  875 × $0.001/call = $0.875

Scoring + recommendations (Sonnet, one-time post-scan):
  ~$0.05

Total cost per scan:
  $0.35 + $0.875 + $0.05 = $1.275 per scan
```

#### Current Cost at 4-Hour Cadence (Business Tier)

```
Scans per day:   24h / 4h = 6 scans/day
Daily cost:      6 × $1.275 = $7.65/day
Monthly cost:    $7.65 × 30 = $229.50/business/month
```

At 1,000 businesses on Business tier (optimistic scale), this is $229,500/month for scan costs alone. At realistic early scale (50 Business-tier users), it's ~$11,500/month for Business-tier scans.

**The Business-tier scan cost is already the highest-cost item in the system. Doubling scan frequency without optimization would be financially unsustainable.**

#### Naive 30-Minute Doubling (No Optimization)

```
Scans per day:   24h / 0.5h = 48 scans/day
Daily cost:      48 × $1.275 = $61.20/day
Monthly cost:    $61.20 × 30 = $1,836/business/month
```

**This is approximately 8x the current Business-tier cost and untenable.** At $349/month Business plan, LLM costs per user would exceed revenue by 5x.

---

#### Strategy Comparison

##### Strategy A: Engine Rotation (Recommended as Primary)

**Concept:** Instead of querying all 7 engines every 30 minutes, rotate through 3-4 engines per cycle. Each engine gets a full scan every 90-105 minutes (equivalent to current 4-hour per-engine update rate), but the dashboard reflects "something new" every 30 minutes.

**Rotation schedule (7 engines over 3 cycles × 30 min = 90 min full sweep):**

```
Cycle 1 (00:00): ChatGPT (3 engines), Gemini, Perplexity
Cycle 2 (00:30): Claude, Grok, DeepSeek
Cycle 3 (01:00): You.com + repeat highest-priority engine (e.g., ChatGPT)

Full sweep completes every 90 minutes.
```

A simpler approach: 3 engines per cycle, rotate deterministically. Each engine scanned every 70 minutes on average.

**Cost per rotation cycle (3 engines, 25 queries):**

```
Engine queries:  3 × 25 = 75 calls × $0.002 = $0.15
Parsing:         75 × 5 = 375 Haiku calls × $0.001 = $0.375
Scoring:         $0.02 (partial score update — incremental, no Sonnet recs)
Per-cycle total: $0.545
```

**Cost per day (48 cycles × 3 engines):**

```
48 cycles × $0.545 = $26.16/day
Monthly: $26.16 × 30 = $784.80/business/month
```

**Still too expensive at scale. We need to combine with Strategy B.**

---

##### Strategy B: Gemini Flash for Rotation Parsing

**Concept:** Use Gemini 2.0 Flash instead of Haiku for the 5-stage parsing pipeline in rotation cycles. Flash is ~15x cheaper per token than Haiku.

**Cost per Gemini Flash parsing call:**

```
Input:  600 tokens × ($0.075 / 1,000,000) = $0.000045
Output: 100 tokens × ($0.30  / 1,000,000) = $0.000030
Total per Flash call: $0.000075 ≈ $0.0001 (vs $0.001 for Haiku)
```

**Cost per rotation cycle with Flash parsing (3 engines, 25 queries):**

```
Engine queries:  75 calls × $0.002 = $0.150
Parsing (Flash): 75 × 5 = 375 Flash calls × $0.0001 = $0.0375
Scoring:         $0.02
Per-cycle total: $0.207
```

**Cost per day (48 rotation cycles, Flash parsing):**

```
48 × $0.207 = $9.94/day
Monthly: $9.94 × 30 = $298.20/business/month
```

**Tradeoff:** Flash is cheaper but potentially lower quality for nuanced mention detection and sentiment scoring compared to Haiku. Mitigation: use Flash for rotation cycles and retain Haiku for the full-sweep cycle (once every 90 minutes). This gives high-quality baseline data every 90 minutes with cheaper intermediate updates.

**Hybrid cost (90-minute full Haiku sweep + 2 intermediate Flash rotation cycles):**

```
Full sweep (every 90 min = 16 times/day):
  16 × $1.275 (full 7 engines, Haiku) = $20.40/day

Intermediate Flash cycles (2 per 90-min window × 16 windows = 32 cycles/day):
  32 × $0.207 = $6.62/day

Daily total: $20.40 + $6.62 = $27.02/day
Monthly:     $27.02 × 30 = $810.60/business/month
```

**Still 3.5x the current 4-hour cost. We need caching.**

---

##### Strategy C: Response Caching (24-Hour Query Cache)

**Concept:** Before sending a query to an AI engine, check if the same prompt was sent to the same engine within the last 24 hours by ANY Beamix user scanning a similar industry/region. Cache the raw response hash and parsed result. On a cache hit, skip the engine call and re-use the parsed result.

**Implementation:**
- Cache key: `sha256(engine + prompt_text + language + location_modifier)`
- Cache store: Supabase table `scan_response_cache` with `cached_at` timestamp and `result_data` JSONB
- TTL: 24 hours (configurable per engine — Perplexity may need shorter TTL given real-time web search)
- Cache hit rate at 1K businesses in same industry: estimated 40-60% for generic industry prompts

**Cost reduction from caching:**

At 50% cache hit rate:
- Engine calls reduced by 50%
- Parsing calls reduced by 50% (no re-parsing on cache hit — stored result used directly)

**Combined Strategy A + B + C cost:**

```
Without cache (Strategy A + B hybrid): $810.60/business/month
With 50% cache hit rate:
  Engine call cost halved: ~$160 → ~$80
  Parsing cost halved similarly

Net monthly (rough estimate): ~$400-500/business/month
```

**Still above acceptable level at scale. We need to reconsider the target.**

---

##### Strategy D: Priority Query Rotation (Recommended Final Strategy)

**Concept:** At 30-minute frequency, do NOT scan all 25 queries every cycle. Instead:
- Identify the top 5 "priority queries" per business (highest traffic, most volatile historically, or user-flagged)
- Every 30 minutes: scan priority queries only, 3 engines (rotated)
- Every 6 hours: full scan of all 25 queries across 7 engines (same as current 4-hour cycle, with slight stretch)

Priority query selection is algorithmic — no LLM needed. Queries with the highest `prompt_volumes.estimated_volume` or with >5% visibility change in last 7 days are promoted to priority status.

**Cost per 30-minute priority-only cycle (5 queries, 3 engines):**

```
Engine queries:  5 queries × 3 engines = 15 calls × $0.002 = $0.030
Parsing (Flash): 15 × 5 = 75 Flash calls × $0.0001 = $0.0075
Scoring (skip full Sonnet rec, only score update): $0.005
Per-cycle total: $0.0425
```

**Cost per day (48 priority cycles + 4 full scans):**

```
Priority cycles: 48 × $0.0425 = $2.04
Full scans:      4 × $1.275 = $5.10
Daily total:     $2.04 + $5.10 = $7.14/day
Monthly:         $7.14 × 30 = $214.20/business/month
```

**Compared to current 4-hour cost of $229.50/month: Strategy D is $15/month CHEAPER while providing 8x more frequent signals on the most important queries.** This is the recommended approach.

---

#### Final Cost Comparison Table

| Strategy | Monthly Cost/Business | vs. Current 4h | Scan Frequency | Quality |
|----------|----------------------|----------------|----------------|---------|
| Current (4h, all engines, Haiku) | $229.50 | baseline | Every 4 hours | High |
| Naive 30-min (all engines, Haiku) | $1,836 | +700% | Every 30 min | High |
| A only (rotation, Haiku) | $785 | +242% | 30 min (3 engines) | High |
| A+B (rotation + Flash parsing) | $811 | +253% | 30 min (3 engines) | Medium |
| A+B+C (rotation + Flash + 50% cache) | ~$450 | +96% | 30 min (3 engines) | Medium |
| **D (priority rotation + full sweep 6h) — RECOMMENDED** | **$214** | **-7%** | **30 min for top 5 queries** | **High** |

**Recommendation: Strategy D.** It delivers on the "30-minute refresh" promise, costs less than the current setup, preserves full-quality Haiku parsing for full sweeps, and is architecturally clean (priority queries are already a natural concept for SMBs to understand).

---

### C. Engineering Spec — Feature 9

#### Scope

- New `priority_queries` flag or computed score on `tracked_queries` table
- Modify `cron.scheduled-scans` to fire every 30 minutes (Inngest cron: `"*/30 * * * *"`)
- New `scan_mode` parameter on the scan engine: `'priority'` vs `'full'`
- `scan_frequency_days` for Business tier updated to trigger full scans every 6 hours: `0.25`
- Priority query selection logic (algorithmic, no LLM)
- Flash vs Haiku model selection based on `scan_mode`
- `scan_response_cache` table for optional caching (implement in Phase 2 if needed)

#### Data Model Changes

New column on `tracked_queries`:

```sql
ALTER TABLE tracked_queries
  ADD COLUMN priority_score integer NOT NULL DEFAULT 0,
  ADD COLUMN is_priority boolean GENERATED ALWAYS AS (priority_score >= 70) STORED;

CREATE INDEX idx_tracked_queries_priority
  ON tracked_queries (business_id, is_priority)
  WHERE is_active = true;
```

`priority_score` is computed post-scan and stored. It is not user-facing in v1 (auto-managed by system). Score inputs:
- `prompt_volumes.estimated_volume` → 0-40 points (normalized to max volume in same industry)
- Recent visibility change (7-day delta) → 0-30 points (larger change = higher priority)
- User-flagged (`is_starred`) → 30 points flat

New column on `scans`:

```sql
ALTER TABLE scans ADD COLUMN scan_mode text NOT NULL DEFAULT 'full'
  CHECK (scan_mode IN ('full', 'priority'));
```

Optional `scan_response_cache` table (Phase 2):

```sql
CREATE TABLE scan_response_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,  -- sha256(engine + prompt_text + language + location)
  engine text NOT NULL,
  prompt_text text NOT NULL,
  parsed_result jsonb NOT NULL,    -- ParsedEngineResult shape
  created_at timestamptz NOT NULL DEFAULT NOW(),
  expires_at timestamptz NOT NULL  -- created_at + interval based on engine
);
CREATE INDEX idx_scan_cache_key ON scan_response_cache (cache_key, expires_at);
```

#### Inngest Changes

`cron.scheduled-scans` — update cron schedule from `"0 * * * *"` to `"*/30 * * * *"`.

Updated business selection query in the cron:

```sql
SELECT
  b.id,
  s.plan_tier,
  CASE
    WHEN s.plan_tier = 'business' AND (b.last_priority_scan_at IS NULL OR b.last_priority_scan_at <= NOW() - INTERVAL '30 minutes')
      THEN 'priority'
    WHEN b.next_scan_at <= NOW()
      THEN 'full'
    ELSE NULL
  END AS scan_mode
FROM businesses b
JOIN subscriptions s ON s.user_id = b.user_id
WHERE s.status = 'active'
  AND (
    (s.plan_tier = 'business' AND (b.last_priority_scan_at IS NULL OR b.last_priority_scan_at <= NOW() - INTERVAL '30 minutes'))
    OR b.next_scan_at <= NOW()
  )
```

Add `last_priority_scan_at timestamptz` column to `businesses` table.

The `scan.scheduled` Inngest function receives `scan_mode` in its payload and branches:
- `'priority'`: load only `is_priority = true` queries (up to 5), query 3 rotated engines using Gemini Flash for parsing, skip Sonnet recommendations, update `last_priority_scan_at`
- `'full'`: current behavior unchanged (all queries, all tier-appropriate engines, Haiku parsing, Sonnet recommendations)

#### Engine Rotation for Priority Scans

Priority cycles rotate through 7 engines in groups of 3. Rotation is deterministic based on `floor(unix_timestamp / 1800) % 3` (changes every 30 minutes):

```typescript
const ENGINE_ROTATION_GROUPS: string[][] = [
  ['chatgpt', 'gemini', 'perplexity'],   // Rotation 0 — highest trust engines
  ['claude', 'grok', 'deepseek'],         // Rotation 1
  ['you_com', 'chatgpt', 'perplexity'],  // Rotation 2 — repeat top 2 for freshness
];

function getCurrentRotationGroup(): string[] {
  const rotationIndex = Math.floor(Date.now() / 1000 / 1800) % ENGINE_ROTATION_GROUPS.length;
  return ENGINE_ROTATION_GROUPS[rotationIndex];
}
```

ChatGPT and Perplexity appear in 2 of 3 rotations because they have the highest SMB relevance.

#### Model Selection in Parsing Pipeline

```typescript
const parsingModel = scanMode === 'priority' ? 'gemini-2.0-flash' : 'claude-haiku-4-5';
```

The 5-stage parsing pipeline uses the same prompt templates; only the model changes. Gemini Flash is accessed via Google Generative AI API (already in the stack for scan queries).

#### Dashboard Impact

Priority scan results appear in the dashboard via existing Supabase Realtime subscription. The dashboard shows a small "Last updated: 28 min ago" indicator per engine rather than a single last-scan timestamp. No new UI components required — only a `last_updated_at` field added to `scan_engine_results` display logic.

#### API Routes

No new routes. The existing `/api/scan/manual` route needs a `scan_mode` parameter (optional, defaults to `'full'`).

#### Plan Tier Gating

| Tier | Scheduled Scan Cadence | Priority Scans |
|------|----------------------|----------------|
| Starter | Monthly full scan | No |
| Pro | Daily full scan | No |
| Business | Full scan every 6h + priority scan every 30 min | Yes |

#### Build Effort

| Task | Effort |
|------|--------|
| Add `priority_score` / `is_priority` to `tracked_queries` + migration | 0.5 day |
| Priority score computation logic (post-scan step) | 1 day |
| Update `cron.scheduled-scans` cron + query | 0.5 day |
| `scan_mode` branching in `scan.scheduled` Inngest function | 1.5 days |
| Engine rotation logic | 0.5 day |
| Flash model integration in parsing pipeline | 0.5 day |
| `last_priority_scan_at` column + `scan_mode` on `scans` | 0.5 day |
| Dashboard "last updated per engine" UI | 1 day |
| Testing + cost monitoring integration | 1 day |
| **Total** | **~7 days** |

#### Risk Factors

- **Flash quality gap:** Gemini Flash may produce lower-quality mention detection than Haiku for niche Hebrew business names. Mitigation: A/B test Flash vs Haiku on 100 historical responses before shipping. Fallback: keep Haiku for all parsing if quality delta is >5%.
- **Cron doubling:** 30-minute cron + 1-hour cron must not overlap for the same business. The `last_priority_scan_at` check prevents double-scanning but requires correct transaction isolation.
- **Inngest concurrency:** Increasing from 6 to 48 scan triggers per day per Business user increases Inngest invocation count significantly. Verify Inngest plan allows the volume. Current concurrency cap: 50 system-level for `scan.scheduled`.

---

## Feature 10: Multi-Region / City-Level Scanning

### A. Research and Feasibility Analysis

**What this does for the user:**

A Tel Aviv-based plumber tracked by Beamix wants to know: does ChatGPT recommend me when someone in Tel Aviv asks "best plumber near me"? That question is different from "best plumber in Israel" — and the AI engine's answer differs depending on which city context is embedded in the query.

City-level scanning appends a location modifier to each tracked query before sending it to the AI engine:

```
Base query:     "best plumber"
Tel Aviv scan:  "best plumber in Tel Aviv"
Haifa scan:     "best plumber in Haifa"
Hebrew variant: "שרברב מומלץ בתל אביב"
```

Results are stored with a `location` tag so the dashboard can show per-city visibility separately from the national/unmodified score.

**Do AI engines actually respond differently per city?**

Based on competitor documentation (Peec AI's regional tracking feature) and the nature of these engines:

| Engine | City-Level Differentiation | Confidence |
|--------|---------------------------|------------|
| Perplexity | High — real-time web search returns geo-relevant results | High |
| ChatGPT | Medium — trained on geographic data, responds to location context | Medium |
| Claude | Low-Medium — sometimes ignores city specificity for generic SMBs | Medium |
| Gemini | Medium — Google-trained, better local data than Claude | Medium |
| Grok | Low — less local business data in training | Low |
| DeepSeek | Very Low — minimal Israeli local data | Very Low |

For Israeli businesses, the signal is strongest on Perplexity and ChatGPT. This matches Beamix's Phase 1 engine set.

**Competitor implementation (Peec AI):**

Peec AI's "Regional Tracking" feature tracks separate queries per market. From their product ("25 prompts × 3 models × 30 days = 2,250 AI answers per region"). The implementation is straightforward: duplicate tracked queries with a location modifier; treat each location-query pair as an independent query. No additional architecture required beyond location tagging.

**Israeli context:**

This is especially valuable for the primary market. Business categories with strong city-level differentiation:
- Legal services: "עורך דין תל אביב" vs "עורך דין חיפה"
- Medical/dental: city-specific search intent is very strong
- Real estate: inherently local
- Restaurants, contractors, financial advisors: all heavily location-dependent

The Hebrew prompt library (a unique Beamix advantage) makes this feature more powerful than any competitor's implementation — Beamix can track city-specific Hebrew queries that zero competitors cover.

**Minimum viable version:**

Single additional region per business (e.g., "primary city" field in business profile). Append city to each tracked query. Store results with location tag. Display as a separate row or toggle in Rankings page.

**Full version:**

Multi-city (Starter: 1, Pro: 5, Business: unlimited), per-city visibility score, city comparison view in dashboard, automated alert when city ranking changes.

---

### B. Cost Impact Analysis — Feature 10

Multi-region scanning is a pure linear cost multiplier. Each additional city doubles (or N-tuples) the scan call volume.

**Cost per additional city (full scan, 7 engines, 25 queries):**

This is identical to one full scan (Feature 9 baseline): **$1.275 per scan cycle per city.**

**Monthly cost per additional city (current 4-hour cadence for Business):**

```
6 scans/day × $1.275 = $7.65/day × 30 = $229.50/month per city
```

This is the same as adding an entire second business scan. For Pro tier (daily scan):

```
1 scan/day × $1.275 = $1.275/day × 30 = $38.25/month per additional city
```

**Plan tier cost impact:**

| Tier | Scan Cadence | Cost per Additional Region/Month |
|------|-------------|----------------------------------|
| Starter | Monthly | $1.275 |
| Pro | Daily | $38.25 |
| Business | 4-hourly | $229.50 |

At Pro tier, allowing 5 additional regions (5 cities beyond national) would add 5 × $38.25 = **$191.25/month** in LLM costs to the Pro plan's scan bill. The Pro plan is $149/month. This means multi-region scanning at full cadence for Pro would cost more than the plan revenue on scan costs alone — before any margin.

**Cost mitigation for multi-region:**

1. **Regional scans at reduced cadence:** Region scans run at 1/3 the tier cadence. Pro gets daily national scan + every-3-days regional scan. This reduces regional cost by 67%.
2. **Priority engines only:** Regional scans use only 3 engines (ChatGPT, Gemini, Perplexity — the engines with highest geographic differentiation). Skip Claude, Grok, DeepSeek, You.com for regional scans.
3. **Fewer queries:** Regional scans run 10 queries per city (the top-10 by `prompt_volumes.estimated_volume`), not all 25.

**Mitigated regional scan cost per city (3 engines, 10 queries, Pro cadence every 3 days):**

```
Engine queries:  3 × 10 = 30 calls × $0.002 = $0.060
Parsing (Haiku): 30 × 5 = 150 calls × $0.001 = $0.150
Scoring:         $0.02
Per-scan:        $0.230
Monthly (10 scans/month, every 3 days): 10 × $0.230 = $2.30/city/month
```

At $2.30/city/month for Pro users with up to 5 additional cities: max regional cost = $11.50/month added to Pro tier. **This is commercially viable at $149/month Pro pricing.**

For Business tier with unlimited cities: Cap at 20 cities maximum with full cadence only for the first 3 cities; reduced cadence for additional cities. Business-tier regional cost stays bounded at ~$70-80/month for 20 cities.

**Tier recommendation:** Regional scanning should be a gated feature with hard limits enforced via `subscription_limits` check in the scan pipeline. The feature justifies Pro/Business positioning — it is a clear upsell from Starter.

---

### C. Engineering Spec — Feature 10

#### Scope

- `locations` field on `businesses` table (array of city strings, max length gated by tier)
- `location` field on `tracked_queries` for city-modified queries (or generated at scan time from base query + city)
- `location` field on `scan_engine_results` for per-city result tagging
- New scan type variant: `'regional'` scan mode in `scan.scheduled`
- Rankings page filter: location dropdown
- Business settings: add/remove cities
- Tier enforcement: location count limits

#### Data Model Changes

```sql
-- Add location array to businesses (cities the business operates in or wants to track)
ALTER TABLE businesses
  ADD COLUMN tracked_locations text[] NOT NULL DEFAULT '{}';

-- Add location tag to scan_engine_results
ALTER TABLE scan_engine_results
  ADD COLUMN location text;  -- NULL = national/unmodified query; 'tel_aviv', 'haifa', etc.

CREATE INDEX idx_engine_results_location
  ON scan_engine_results (business_id, location, engine, created_at DESC);

-- Add regional scan cadence tracking
ALTER TABLE businesses
  ADD COLUMN last_regional_scan_at timestamptz;
```

No changes needed to `tracked_queries`. The location modifier is applied at scan-time by the scan engine, not stored on the query row. This keeps the `tracked_queries` table lean and avoids multiplicative rows per city per query.

The scan engine generates location-modified prompt text dynamically:

```typescript
function buildLocationQuery(baseQuery: string, location: string, language: 'en' | 'he'): string {
  if (!location) return baseQuery;
  const locationNames: Record<string, { en: string; he: string }> = {
    tel_aviv: { en: 'Tel Aviv', he: 'תל אביב' },
    haifa:    { en: 'Haifa',    he: 'חיפה' },
    jerusalem:{ en: 'Jerusalem',he: 'ירושלים' },
    // ... extend as needed
  };
  const locationLabel = locationNames[location]?.[language] ?? location;
  return language === 'he'
    ? `${baseQuery} ב${locationLabel}`
    : `${baseQuery} in ${locationLabel}`;
}
```

#### Inngest Job Changes

`cron.scheduled-scans` extended to include regional scan evaluation:

```sql
-- Added to the cron query:
SELECT b.id, 'regional' AS scan_mode, b.tracked_locations
FROM businesses b
JOIN subscriptions s ON s.user_id = b.user_id
WHERE s.status = 'active'
  AND s.plan_tier IN ('pro', 'business')
  AND array_length(b.tracked_locations, 1) > 0
  AND (b.last_regional_scan_at IS NULL
    OR b.last_regional_scan_at <= NOW() - INTERVAL '3 days')  -- Pro: 3-day regional cadence
```

The `scan.scheduled` Inngest function in `'regional'` mode:
1. Load `tracked_locations` for the business
2. For each location (respecting tier limit: Pro max 5, Business max 20):
   - Select top-10 queries by priority score
   - Build location-modified prompt text for each
   - Query 3 geographic-sensitive engines only: ChatGPT, Gemini, Perplexity
   - Run full 5-stage Haiku parsing pipeline
   - Store `scan_engine_results` with `location = 'tel_aviv'` etc.
3. Update `last_regional_scan_at`

#### API Routes

New route: `PUT /api/settings/business/locations`

```typescript
// Request body (Zod schema):
const UpdateLocationsSchema = z.object({
  locations: z.array(z.string().min(1).max(50)).max(
    // max enforced by tier
  ),
});
```

The route reads the user's plan tier, enforces max locations (Starter: 0, Pro: 5, Business: unlimited/capped at 20), and updates `businesses.tracked_locations`.

Extended: `GET /api/dashboard/rankings` receives optional `?location=tel_aviv` filter, forwarded to DB query as `WHERE location = $1` on the `scan_engine_results` join.

#### UI Changes

**Business Settings tab:** "Service Areas" or "Tracked Locations" section below business profile. Shows city chips with remove button. "Add City" button opens a select with predefined Israeli cities + custom input. Locked for Starter with upgrade CTA.

**Rankings page:** Location filter dropdown: "All Locations | National | Tel Aviv | Haifa | ..." Selecting a city filters the rankings table to show results for that city's scans.

**Dashboard overview:** Visibility score widget shows national score prominently. Below, a secondary row: "Tel Aviv: 67 | Haifa: 54 | Jerusalem: 71" — only visible if locations are configured.

**Hebrew/RTL:** All city names have Hebrew translations. `dir="rtl"` on city chips in HE mode. The location modifier generation (above) handles Hebrew grammar correctly (`ב` prefix vs `in` suffix).

#### Tier Enforcement

| Tier | Max Tracked Locations | Regional Scan Cadence | Engines for Regional Scans |
|------|--------------------|----------------------|---------------------------|
| Starter | 0 (feature locked) | N/A | N/A |
| Pro | 5 | Every 3 days | 3 (ChatGPT, Gemini, Perplexity) |
| Business | 20 | Every 24 hours | 3 (ChatGPT, Gemini, Perplexity) |

Regional scans are always 3-engine even for Business (geographic signal is weak on Claude/Grok/DeepSeek for Israeli local queries).

#### Build Effort

| Task | Effort |
|------|--------|
| DB migrations (tracked_locations, scan_engine_results.location, last_regional_scan_at) | 0.5 day |
| Location modifier generation + Hebrew support | 0.5 day |
| Regional scan mode in `scan.scheduled` Inngest function | 2 days |
| Cron query update for regional trigger | 0.5 day |
| PUT /api/settings/business/locations route | 0.5 day |
| Rankings page location filter | 1 day |
| Dashboard overview per-city score row | 0.5 day |
| Business settings "Tracked Locations" UI | 1 day |
| Tier enforcement + tests | 1 day |
| **Total** | **~7.5 days** |

#### Risk Factors

- **Hebrew grammar:** "best plumber ב-Tel Aviv" vs "שרברב מומלץ בתל אביב" requires careful language detection and grammar rules. "ב" prefix joins to the city name without a space for one-syllable city names in Hebrew, with slight variance for multi-syllable names. Needs a lookup table, not a string concat.
- **Low signal on some engines:** If Claude and DeepSeek return identical results for city-modified vs. unmodified queries, users will question the value of the feature. Communicate that regional tracking is most accurate for Perplexity and ChatGPT. Consider showing an "accuracy confidence" indicator per engine in the regional view.
- **Linear cost scaling:** Pro users who add 5 cities add ~$11.50/month in LLM costs. At the Pro price point ($149/month), this is acceptable at current scale. Monitor closely at >500 Pro users.

---

## Feature 11: Real Prompt Volume Data

### A. Research and Feasibility Analysis

**What this does for the user:**

The dashboard currently shows which prompts the user is tracked on, but not which of those prompts are actually asked frequently by real people. Knowing that "best plumber in Tel Aviv" is searched 50,000 times per month while "most reliable plumber near me" is searched only 200 times changes which query the business should prioritize optimizing for.

This is the difference between Beamix's internal estimate ("3,240 Beamix users asked this prompt" — weak proxy) and what Profound built their business on (130M real conversations). The gap is significant.

**The core problem:**

There is no direct API for "how many times did a real person type this query into ChatGPT." No AI company exposes this data. Profound ($96M raised) built a proprietary opt-in user panel. Writesonic has 120M chatbot conversations from their own product. Ahrefs has 239M prompts from an undisclosed source.

For Beamix (solo founder, pre-revenue), building a proprietary panel is not feasible. The question is: what affordable proxies get us close enough to be useful?

**Option Analysis:**

**Option A: Google Search Console (GSC) Integration — Recommended Primary**

GSC shows traditional search query data: what people type into Google, click-through rate, impressions. This is NOT AI search data. However:
- AI query patterns are directionally correlated with Google search patterns. If "best plumber Tel Aviv" has 50K monthly Google impressions, the same query likely has meaningful ChatGPT/Perplexity volume.
- The correlation is stronger for navigational and informational queries than for transactional queries.
- GSC data is free once the user connects their property.
- The UI story is honest: "Search volume is based on Google Search Console data. AI engine query volume correlates directionally with traditional search but may differ. Use this as a relative priority signal, not an exact count."

**Implementation:** User connects GSC via OAuth (already planned as an integration). Beamix calls the GSC API weekly to fetch impression data for queries matching the user's tracked prompts. Map GSC query → `prompt_library` entry by fuzzy string match. Update `prompt_volumes.estimated_volume` with GSC impression count.

**Cost:** $0 (GSC API is free with user authorization). The only cost is the developer time to build the integration and the OAuth flow.

**Option B: Google Keyword Planner API**

Google Keyword Planner returns monthly search volume ranges for keywords. The data is the same underlying source as GSC but without the user-specific click data. It requires a Google Ads account (free to create, no spend required).

- Cost: $0 per query for basic volume ranges
- Limitation: Returns bucketed ranges (1K-10K, 10K-100K) not exact counts
- API access: Available via Google Ads API (`KeywordPlanService`)
- Rate limits: 15,000 requests per day per developer token (generous)
- Quality: Good directional signal. Same caveat as GSC regarding AI vs. Google correlation.

The Keyword Planner API is useful as a fallback for businesses that have not connected GSC, or to supplement GSC data with broader industry-level volume estimates.

**Cost at scale:** $0 API cost + ~2 weeks engineering to build the Google Ads API integration. Requires a Google Ads developer token (free, requires application approval — typically 1-3 days).

**Option C: Semrush/Ahrefs Keyword API**

Both offer keyword volume APIs:
- Semrush: $0.10 per keyword via their API (Semrush API units)
- Ahrefs: ~$0.005-0.10 per keyword depending on API plan

**Cost at scale:**

If Beamix tracks 25 queries per Pro/Business user and has 1,000 users:
```
25 queries × 1,000 users = 25,000 keyword lookups
At $0.05/keyword (midpoint): $1,250 per refresh cycle
Weekly refresh: $1,250 × 4 = $5,000/month
```

At $5,000/month for a feature that improves data quality but is not core to the product, this is not commercially viable at pre-scale. **Skip for now.**

**Option D: Perplexity "how often is X asked" heuristic**

Use Perplexity Sonar to ask "How commonly do people ask about [topic] when searching for [industry]?" The response is qualitative, not quantitative. Perplexity can surface proxy signals (e.g., Reddit thread volumes, forum activity) but cannot produce accurate numeric estimates.

**Cost:** ~$0.02/query. For 25 queries per user per week: $0.50/user/week = $2/user/month. At 1,000 users: $2,000/month for imprecise data.

**Not recommended.** The quality does not justify the cost compared to Option A (GSC) which is free and more accurate.

**Option E: Internal Beamix Scan Panel (Aggregate over time)**

Every time a Beamix user's scan sends a prompt to an AI engine, that prompt is a data point. Aggregate anonymously across users in the same industry:

```
prompt: "best plumber in Tel Aviv"
beamix_scan_count: 847 (across all users who tracked this prompt)
```

This is already partially designed in the `prompt_library` + `prompt_volumes` tables. The `cron.prompt-volume-agg` job runs weekly to aggregate.

At launch with few users, this is a weak signal. At 1,000 users with 25 tracked queries each, it becomes 25,000 data points per week — meaningful for relative ranking within an industry (which prompts are tracked most often = likely most important).

**Cost:** $0 (already built in existing cron). This is the current system's approach.

**Recommended Architecture: Three-Tier Data Stack**

| Tier | Source | Data Quality | Coverage | Cost | Cadence |
|------|--------|-------------|---------|------|---------|
| **Tier 1 (best)** | GSC (user-connected) | High — actual Google search impressions | Only for businesses with Google Search Console | Free | Weekly pull |
| **Tier 2 (fallback)** | Google Keyword Planner | Medium — bucketed ranges, all queries | All tracked queries | Free | Weekly pull |
| **Tier 3 (baseline)** | Internal Beamix panel | Low (at launch), grows over time | All users, all industries | Free | Weekly aggregation (existing cron) |

The UI shows whichever tier is available per query, with a confidence indicator:
- GSC connected: "High confidence — based on your actual Google Search data"
- No GSC: "Estimated — based on industry benchmarks and relative scan frequency"

---

### B. Cost Impact Analysis — Feature 11

**Tier 1 (GSC):** $0 API cost. Engineering cost to build GSC OAuth + weekly data pull. This reuses the GSC integration already planned in the system design (§5 Integration Hub).

**Tier 2 (Keyword Planner):** $0 API cost. Engineering cost to build Google Ads API integration (~1.5 weeks). Requires Google Ads developer token application.

**Tier 3 (Internal panel):** Already exists in `cron.prompt-volume-agg`. Cost: $0 incremental.

**Total incremental LLM cost for Feature 11: $0.** All three tiers are non-LLM data sources. The only processing cost is the fuzzy matching between GSC query strings and `prompt_library` entries — this can be done algorithmically (Levenshtein distance, normalized) without an LLM.

**Should this be gated?**

GSC integration (Tier 1) is already planned as a Pro+ feature in the integration hub. The volume data derived from GSC should follow the same gating: Pro+ sees GSC-sourced volume data; Starter sees internal panel estimates only.

The Keyword Planner fallback enriches data for all users (including Starter) since the cost is $0. There is no business reason to gate a free data source.

**Pricing implication:** Feature 11 adds zero marginal cost and significantly improves the perceived value of the Pro tier (users see real search volume, not just internal estimates). This is a strong retention feature for Pro users — they feel like they have "insider data" about which queries matter.

---

### C. Engineering Spec — Feature 11

#### Scope

- GSC OAuth integration: already planned, now prioritized for prompt volume data
- GSC weekly data pull: new Inngest step or separate cron job
- `prompt_volumes` table: add `gsc_volume`, `kp_volume`, `volume_source` columns
- Google Keyword Planner API integration (optional Phase 2)
- Dashboard: "Volume" column on Rankings page with confidence indicator
- Fuzzy matching: GSC queries → `prompt_library` entries

#### Data Model Changes

```sql
ALTER TABLE prompt_volumes
  ADD COLUMN gsc_impressions integer,          -- Null if GSC not connected
  ADD COLUMN gsc_clicks integer,               -- GSC click data (more precise than impressions)
  ADD COLUMN kp_volume_low integer,            -- Keyword Planner lower bound
  ADD COLUMN kp_volume_high integer,           -- Keyword Planner upper bound
  ADD COLUMN volume_source text NOT NULL DEFAULT 'internal'
    CHECK (volume_source IN ('gsc', 'keyword_planner', 'internal')),
  ADD COLUMN last_enriched_at timestamptz;     -- When volume data was last updated from external source
```

The existing `estimated_volume` column is retained and populated from whichever source is available (Tier 1 → Tier 2 → Tier 3 priority).

#### New Inngest Job: `cron.gsc-volume-sync`

```
Trigger:   Weekly Sunday 4AM UTC (after prompt-volume-agg at 3:30AM)
Duration:  5-15 min depending on user count
Concurrency: 1 system

Steps:
1. Query users with active GSC integration:
   SELECT user_id, integration_config FROM integrations
   WHERE type = 'gsc' AND status = 'active'

2. For each user:
   a. Refresh OAuth token if expiring
   b. Fetch GSC Search Analytics data for last 28 days
      - Dimensions: query, date
      - Filter: none (all queries)
      - Rows: max 25,000
   c. Fuzzy-match each GSC query to entries in prompt_library
      for this user's industry + tracked_queries
   d. For matched entries: UPDATE prompt_volumes
      SET gsc_impressions = ..., gsc_clicks = ..., volume_source = 'gsc',
          estimated_volume = GREATEST(gsc_impressions, estimated_volume),
          last_enriched_at = NOW()

3. Update users without GSC with Keyword Planner data (Phase 2)

4. Emit internal/analytics event for monitoring
```

**GSC API Call Details:**

The GSC Search Analytics API (`searchanalytics.query`) returns impression and click data per query string. Rate limit: 25,000 queries per day per property (generous). A single API call with `rowLimit: 25000` returns up to 25,000 rows, covering all significant queries.

```typescript
// GSC API request shape
const gscRequest = {
  startDate: format(subDays(new Date(), 28), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd'),
  dimensions: ['query'],
  rowLimit: 25000,
  dataState: 'final',  // exclude partial data
};
```

#### Fuzzy Matching Logic (No LLM)

GSC query strings rarely match `prompt_library` entries exactly. "best plumber in tel aviv" (lowercase, no punctuation) vs "Best Plumber in Tel Aviv?" (title case). Match using:

1. Normalize both strings: lowercase, strip punctuation, collapse whitespace
2. Exact match after normalization → high confidence
3. If no exact match: Levenshtein distance ≤ 2 → medium confidence
4. If no match within distance 2: check if all words of the `prompt_library` entry appear in the GSC query (subset match) → low confidence

Only high-confidence matches update `volume_source = 'gsc'`. Medium/low confidence matches update but keep `volume_source = 'estimated'` with the GSC data stored in `gsc_impressions` for transparency.

#### Google Keyword Planner Integration (Phase 2)

For businesses without GSC, use Google Ads `KeywordPlanService`:

```typescript
// Google Ads API — KeywordPlanService.GenerateKeywordIdeas
const request = {
  customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
  keywordSeed: {
    keywords: trackedQueries.map(q => q.query_text).slice(0, 20), // max 20 seed keywords
  },
  language: language === 'he' ? 'he' : 'en',
  geoTargetConstants: countryGeoTargets, // Israel + user's locations
  keywordPlanNetwork: 'GOOGLE_SEARCH',
};
```

Returns monthly search volume ranges. Store in `kp_volume_low` / `kp_volume_high`. Display as range: "10K-100K/month."

Phase 2 because it requires:
- Google Ads developer token (application + approval, 1-3 days)
- A Google Ads account linked to the Beamix developer console
- Engineering for the Google Ads API client (different from GSC API)

Timeline: After GSC integration ships and proves adoption.

#### Dashboard UI Changes

**Rankings page — `Volume` column:**

Add a `Volume` column to the tracked queries table:

```
| Query                      | ChatGPT | Gemini | Perplexity | ... | Volume    | Source |
|----------------------------|---------|--------|------------|-----|-----------|--------|
| best plumber tel aviv       |  #2    |   #4  |     #1     | ... | 12,400/mo | GSC    |
| plumber near me             |  #5    |   --  |     #3     | ... | ~50K/mo   | KP     |
| reliable plumber israel     |  #1    |   #2  |     #2     | ... | 480/mo    | Est.   |
```

Volume column styling:
- GSC source: solid number, green confidence dot
- Keyword Planner source: range ("~50K/mo"), yellow dot
- Internal estimate: italic ("Est."), grey dot

Tooltip on confidence dot explains the data source.

**Prompt Volume Analytics page:**

Already planned in the dashboard analytics spec (`/api/analytics/prompt-volumes`). Extend to show:
- Top 10 prompts by volume (with source indicator)
- Volume trend over time (only for GSC-connected users — GSC history goes back 16 months)
- "Connect GSC for accurate volume data" CTA for users without GSC (Pro+ only)

**Settings → Integrations tab:**

GSC already has an integration card. Add a copy line: "Connecting Google Search Console unlocks accurate search volume data for your tracked queries."

#### Tier Gating

| Feature | Starter | Pro | Business |
|---------|---------|-----|---------|
| Internal panel volume estimates | Yes | Yes | Yes |
| Google Keyword Planner ranges | Yes (Phase 2) | Yes (Phase 2) | Yes (Phase 2) |
| GSC integration + volume sync | No | Yes | Yes |
| Volume trend history (16 months) | No | Yes | Yes |

#### Build Effort

| Task | Effort |
|------|--------|
| `prompt_volumes` schema migration (new columns) | 0.5 day |
| GSC OAuth integration (if not already shipped) | 2 days |
| GSC Search Analytics API client | 1 day |
| `cron.gsc-volume-sync` Inngest job | 1.5 days |
| Fuzzy matching algorithm | 1 day |
| Rankings page Volume column + source indicator | 1 day |
| Prompt volume analytics page extension | 1 day |
| Settings/integrations GSC copy update | 0.5 day |
| Google Keyword Planner integration (Phase 2) | 3 days |
| **Phase 1 total** | **~8.5 days** |
| **Phase 1 + Phase 2 total** | **~11.5 days** |

#### Risk Factors

- **GSC adoption rate:** If <30% of Pro users connect GSC, the feature has limited impact. Mitigation: Surface a persistent "Connect GSC for 10x better volume data" banner in the dashboard for Pro users who have not connected. Make the value proposition very clear during onboarding (Step 3: Integrations).
- **GSC scope:** GSC only shows queries where the user's site already appeared in Google results. If the business has never appeared for "best plumber in Tel Aviv," GSC has no data for that query. The Keyword Planner fallback covers this gap.
- **Fuzzy matching quality:** Israeli businesses may track queries in Hebrew with different transliteration variants. Normalize Hebrew text by removing niqqud (diacritics) and standardizing common spelling variants before matching. Hebrew fuzzy matching requires Hebrew-aware normalization — do not apply Latin-alphabet Levenshtein to Hebrew text without normalization.
- **OAuth token refresh:** GSC tokens expire. The `cron.gsc-volume-sync` job must refresh tokens using the stored `refresh_token` before making API calls. Token rotation is already handled in the integrations adapter pattern — reuse it.

---

## Cross-Feature Dependencies and Sequencing

### Implementation Order

| Phase | Feature | Prerequisite | Output |
|-------|---------|-------------|--------|
| P1 | F9 (Priority rotation scan) | None — standalone Inngest change | Business-tier competitive feature |
| P2 | F11 Phase 1 (GSC volume sync) | GSC integration must be shipped | Accurate volume data for Pro+ |
| P3 | F10 (City-level scanning) | F9 scan mode branching | Regional scan capability |
| P4 | F11 Phase 2 (Keyword Planner) | Google Ads developer token approved | Universal volume data fallback |

F9 should ship first because it is a pure backend change with no external dependencies and delivers the highest competitive value (30-minute refresh is a concrete marketing differentiator). F11 Phase 1 ships second because it depends on GSC integration (which may already be in progress) and adds zero marginal cost. F10 ships third because it introduces the most schema changes and requires careful testing of Hebrew grammar rules.

### Shared Infrastructure

All three features share:
- The `scan.scheduled` Inngest function (extended with `scan_mode` branching for F9 and F10)
- The Haiku/Flash parsing pipeline (model selection parameter added for F9)
- The `prompt_volumes` table (extended for F11)
- The Supabase Realtime subscription in the dashboard (no changes needed — scans post to existing channels)

---

## Known Issues and Tech Debt Created

| Issue | Feature | Action |
|-------|---------|--------|
| Gemini Flash quality vs Haiku for Hebrew mention detection is unvalidated | F9 | A/B test before shipping Flash for priority cycles |
| `scan_response_cache` table designed but not implemented | F9 | Implement in Phase 2 if Priority Rotation + Flash is not sufficient to hold cost flat |
| GSC query → prompt_library fuzzy matching coverage rate is unknown until production | F11 | Log match rate per weekly sync job; target >70% coverage |
| Hebrew grammatical rules for city prefix ("ב") are language-specific and need native speaker validation | F10 | Code review of `buildLocationQuery` by a native Hebrew speaker before shipping |

These items should be logged in `.claude/memory/DECISIONS.md` for the next session.
