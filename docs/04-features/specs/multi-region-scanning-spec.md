# Beamix — Multi-Region / City-Level Scanning Technical Spec (F10)

> **2026-04 pricing update:** Canonical tier names/prices are now Discover $79 / Build $189 / Scale $499. Dollar figures referenced in this spec for cost analysis reflect the earlier $49/$149/$349 tier structure. Tier gating should be read as: Starter → Discover, Pro → Build, Business → Scale. Per-feature cost conclusions remain directionally valid.

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Decision-ready — approved for Phase 2 build
> **Audience:** Engineers building city-level scan coverage. You should be able to implement this feature end-to-end without reading any other document.
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

AI search results are not location-agnostic. "Best dentist" produces different answers in Tel Aviv versus Haifa. A business that ranks well nationally may be invisible in a specific city where it operates. And for Israeli businesses serving multiple cities, the gap between city-level visibility and national visibility is the key strategic question.

**What this feature does:** Extends the scan engine to append a city modifier to each tracked query and run it independently per configured region. A business with 3 configured regions runs 3 variants of "best dentist": "best dentist in Tel Aviv", "best dentist in Haifa", "best dentist in Jerusalem". Results are stored with a `region` tag, displayed in a region selector on the Rankings page, and exposed via a new CRUD API for region management.

**Business value:**
- Israeli SMBs with multi-city operations can see exactly where they are visible and where they are not — the primary use case for upgrading from Starter to Pro.
- The home region (derived from business location) is always scanned. Additional cities unlock based on tier.
- City-level data makes agent recommendations more precise: "Your visibility in Haifa is 23% lower than Tel Aviv — here are 3 content changes that address this."
- Competitive differentiation: no GEO platform competitor at SMB pricing offers city-level scanning in the Israeli market.

---

## 2. Scope and Boundaries

### In Scope — Phase 1 (Launch)

| Item | Notes |
|------|-------|
| `scan_regions` table | CRUD per business |
| `region` column on `scan_engine_results` | Nullable — null = home region |
| `region` column on `tracked_queries` | For query-level region assignment |
| Location modifier injection in prompt generation | Appends "in [city]" to query text |
| Cadence multiplier per non-home region | Non-home regions scan every 3 days (Pro), every 3 days for all but first 3 (Business) |
| Region selector on Rankings page | Dropdown or pill tabs |
| Region management in Settings > Business Profile | Add/remove cities |
| `GET/POST/DELETE /api/scan/regions` | CRUD for scan_regions |
| Home region auto-detection from `businesses.location` | Set at onboarding, editable |

### In Scope — Phase 2 (Growth)

| Item | Notes |
|------|-------|
| Per-region trend charts | Show visibility per city over time |
| City comparison view | Side-by-side ranking in two cities |
| Alert: visibility gap > 20% between home and a non-home region | Requires alert system |

### Explicitly Deferred

| Item | Reason |
|------|--------|
| Country-level regions (e.g., Israel vs US) | Different use case — global expansion is Phase 3 |
| Real AI geo-targeting (sending region headers to AI engines) | Most engines don't accept headers; query text modifier is the reliable path |
| Region-specific tracked queries (queries only in one city) | Adds significant schema complexity; not requested |

### Out of Scope

- Changing the core scan engine beyond query text modification
- Free scan regional support (free scan is always non-regional)
- Reverse geocoding from IP for region detection
- Maps or geographic visualizations

---

## 3. User Flows

### 3.1 Adding a Scan Region (Pro/Business User)

```
1. User navigates to Settings > Business Profile
2. "Scan Regions" section shows current regions (home always shown, grayed out and undeletable)
3. User clicks "Add City"
4. Modal opens: text input with autocomplete (static city list from constants)
5. User selects or types a city: "Haifa"
6. Client POSTs to /api/scan/regions with { business_id, region_name, region_code }
7. API validates: tier limit check (Pro: max 5, Business: max 20)
8. API inserts scan_regions row: scan_cadence_multiplier = 0.33 (every 3 days)
9. API returns 201 with new region row
10. Settings page shows "Haifa" in regions list with "Will scan every 3 days" label
11. Next scheduled scan for this business includes Haifa variant
```

### 3.2 Viewing Rankings by Region

```
1. User navigates to /dashboard/rankings
2. Region selector shown at top of page (pills: "All" + one pill per configured region)
3. Default: "All" shows aggregate across regions
4. User clicks "Haifa"
5. Rankings table filters to show only scan_engine_results with region = 'Haifa'
   (or region IS NULL for home region if home region = Haifa)
6. Score shown is region-specific: "Visibility in Haifa: 34%"
7. Each query row shows region-scoped rank and is_mentioned for the selected region
8. "All" aggregation: mean visibility across all regions, showing best and worst city per query
```

### 3.3 Deleting a Region

```
1. User navigates to Settings > Business Profile > Scan Regions
2. User clicks trash icon next to "Haifa"
3. Confirmation modal: "Stop scanning in Haifa? Historical data will be kept."
4. User confirms: DELETE /api/scan/regions/[region_id]
5. scan_regions row soft-deleted (set deleted_at, not hard-deleted — historical data preserved)
6. Future scans no longer dispatch Haifa variant
7. Rankings page: "Haifa" pill removed from selector
8. Historical Haifa scan_engine_results remain queryable (not deleted)
```

### 3.4 Scan Engine Regional Dispatch

```
1. cron.scheduled-scans fires
2. For each business: reads scan_regions (active, not deleted)
3. For each region (including home): determines if scan is due based on cadence_multiplier
4. Home region: always runs on normal cadence
5. Non-home regions: runs only if (now - last_scan_for_this_region) >= (base_cadence × 1/multiplier)
   - Pro non-home, multiplier = 0.33: scans every 3 days (vs daily home region)
   - Business first 3: multiplier = 1.0 (full cadence)
   - Business rest: multiplier = 0.33 (every 3 days)
6. Sends scan/regional.start event with { business_id, region_name, region_code } for each due region
7. Each region is a separate scan — separate scans row, separate scan_engine_results rows
```

---

## 4. Data Model

### 4.1 New Table: `scan_regions`

```sql
CREATE TABLE scan_regions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id            UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  region_name            TEXT NOT NULL,                          -- e.g., 'Tel Aviv', 'Haifa'
  region_code            TEXT,                                   -- e.g., 'IL-TA', 'IL-HF'
  is_home_region         BOOLEAN NOT NULL DEFAULT FALSE,
  scan_cadence_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,    -- 1.0 = same as home, 0.33 = every 3 days
  deleted_at             TIMESTAMPTZ,                            -- soft delete — preserves history
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, region_name)
);

-- Fast lookup: active regions for a business
CREATE INDEX idx_scan_regions_business_active
  ON scan_regions (business_id)
  WHERE deleted_at IS NULL;

-- Home region lookup
CREATE INDEX idx_scan_regions_home
  ON scan_regions (business_id)
  WHERE is_home_region = TRUE AND deleted_at IS NULL;
```

**RLS:**
```sql
-- Users can see and manage their own business regions
ALTER TABLE scan_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own scan regions"
  ON scan_regions
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );
```

**Home region creation:** When a business is created (via `POST /api/onboarding/complete`), insert a `scan_regions` row with `is_home_region = TRUE` and `region_name = businesses.location` (if location is set). If no location, home region name is NULL and no modifier is appended to queries. This is the non-regional default — identical to pre-F10 behavior.

### 4.2 Migration: `scan_engine_results`

```sql
ALTER TABLE scan_engine_results
  ADD COLUMN region TEXT DEFAULT NULL;

-- Index for region-filtered dashboard queries
CREATE INDEX idx_engine_results_region
  ON scan_engine_results (business_id, region, created_at DESC)
  WHERE region IS NOT NULL;
```

**Why nullable:** Historical scan results before this feature shipped have `region = NULL`. The Rankings page interprets `NULL` as "home region / no regional modifier applied". This is correct — legacy rows belong to the home region conceptually.

### 4.3 Migration: `tracked_queries`

```sql
ALTER TABLE tracked_queries
  ADD COLUMN region TEXT DEFAULT NULL;
```

This column is informational at Phase 1 — it stores the region name if the query was generated specifically for a region. In Phase 1, all tracked queries are global; the region modifier is appended at scan time, not stored per-query. Phase 2 may introduce region-specific queries.

### 4.4 `scans` — No Schema Change

Each regional scan creates a new `scans` row. The existing schema is sufficient — `results_summary` jsonb stores `{ region: 'Haifa' }` to identify regional scans. The `scan_type = 'scheduled'` remains correct.

---

## 5. Business Logic

### 5.1 Query Text Modification

The only change to each query when scanning a region: append "in [region_name]" to the query text. This is done in the Inngest function at call time — the `tracked_queries.query_text` value is not modified in the DB.

```typescript
function applyRegionModifier(queryText: string, regionName: string | null): string {
  if (!regionName) return queryText;
  // Avoid double-appending if user already included a city in their query
  const alreadyHasLocation = /\bin\s+\w/i.test(queryText);
  if (alreadyHasLocation) return queryText;
  return `${queryText} in ${regionName}`;
}

// Example:
applyRegionModifier('best dentist', 'Tel Aviv')       // → 'best dentist in Tel Aviv'
applyRegionModifier('dentist in Jerusalem', 'Haifa')  // → 'dentist in Jerusalem' (no double-append)
applyRegionModifier('best dentist', null)              // → 'best dentist' (home region, no modifier)
```

### 5.2 Regional Cadence Check

For each region, the scheduler checks whether a scan is due before dispatching.

```typescript
interface ScanRegionWithLastScan extends ScanRegion {
  last_scanned_at: string | null;
}

async function isRegionDueForScan(
  region: ScanRegionWithLastScan,
  baseIntervalHours: number
): Promise<boolean> {
  if (!region.last_scanned_at) return true;  // never scanned — always due

  const effectiveIntervalHours = baseIntervalHours / region.scan_cadence_multiplier;
  const hoursSinceLastScan =
    (Date.now() - new Date(region.last_scanned_at).getTime()) / 3_600_000;

  return hoursSinceLastScan >= effectiveIntervalHours;
}

// Usage:
// Pro user (baseInterval = 24h), non-home region (multiplier = 0.33):
// effectiveInterval = 24 / 0.33 = ~72.7 hours = ~3 days
// Business first 3 regions (multiplier = 1.0):
// effectiveInterval = 4 / 1.0 = 4 hours (full cadence)
```

**`last_scanned_at` source:** Query `scans` table for the most recent completed scan where `results_summary->>'region' = region_name`. This join happens in the scheduler step before fan-out.

### 5.3 Tier Region Limits Enforcement

```typescript
async function validateRegionLimit(businessId: string, planTier: string): Promise<void> {
  const REGION_LIMITS: Record<string, number> = {
    starter: 1,
    pro: 5,
    business: 20,
  };

  const limit = REGION_LIMITS[planTier] ?? 1;

  const { count } = await supabase
    .from('scan_regions')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .is('deleted_at', null);

  if ((count ?? 0) >= limit) {
    throw new TierLimitError(`Region limit reached for ${planTier} tier (max ${limit})`);
  }
}
```

### 5.4 Business-Tier Full-Cadence Regions

Business tier gets full scan cadence on the first 3 configured regions. Regions beyond 3 get reduced cadence (every 3 days).

```typescript
async function getCadenceMultiplierForRegion(
  businessId: string,
  regionId: string,
  planTier: string
): Promise<number> {
  if (planTier !== 'business') return 0.33;  // Pro: always reduced for non-home

  // Business: check if this region is among the first 3 (by created_at)
  const { data: regions } = await supabase
    .from('scan_regions')
    .select('id')
    .eq('business_id', businessId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(3);

  const topThreeIds = regions?.map((r) => r.id) ?? [];
  return topThreeIds.includes(regionId) ? 1.0 : 0.33;
}
```

**Note:** Cadence multiplier is computed at scan dispatch time, not stored permanently on the `scan_regions.scan_cadence_multiplier` column. The column exists for future use (manual overrides) but Phase 1 derives it from tier + region position. Set it on insert: `1.0` for home and first-3-Business regions, `0.33` for all others.

---

## 6. Inngest Jobs

### 6.1 Modified: `cron.scheduled-scans` (Regional Dispatch)

**Added step: regional fan-out**

```typescript
// After existing business fetch step:

// Step N: For each Business/Pro business, fan out regional scans
await step.run('dispatch-regional-scans', async () => {
  const businessesWithRegions = await supabase
    .from('businesses')
    .select(`
      id,
      subscriptions!inner(plan_tier),
      scan_regions!inner(id, region_name, region_code, is_home_region, scan_cadence_multiplier, deleted_at)
    `)
    .is('scan_regions.deleted_at', null)
    .in('subscriptions.plan_tier', ['pro', 'business'])
    .eq('subscriptions.status', 'active');

  for (const business of businessesWithRegions) {
    const planTier = business.subscriptions[0].plan_tier;
    const baseIntervalHours = planTier === 'business' ? 4 : 24;

    for (const region of business.scan_regions) {
      const lastScan = await getLastRegionalScan(business.id, region.region_name);
      const isDue = await isRegionDueForScan({ ...region, last_scanned_at: lastScan }, baseIntervalHours);

      if (!isDue) continue;

      await inngest.send({
        name: 'scan/regional.start',
        data: {
          business_id: business.id,
          region_name: region.is_home_region ? null : region.region_name,
          region_code: region.region_code,
          plan_tier: planTier,
        },
      });
    }
  }
});
```

### 6.2 New: `scan/regional.start` → `scan.regional.run`

**Event:** `scan/regional.start` with data:
```typescript
{
  business_id: string;
  region_name: string | null;  // null = home region, no modifier
  region_code: string | null;
  plan_tier: 'pro' | 'business';
}
```

**Steps:**

```typescript
// Step 1: Load tracked queries + apply region modifier
const queries = await step.run('load-and-modify-queries', async () => {
  const { data } = await supabase
    .from('tracked_queries')
    .select('id, query_text')
    .eq('business_id', data.business_id)
    .eq('is_active', true);

  return (data ?? []).map((q) => ({
    ...q,
    effective_query: applyRegionModifier(q.query_text, data.region_name),
  }));
});

// Step 2: Determine engine set (by tier)
const engines = await step.run('get-engines', () => getEnginesForTier(data.plan_tier));

// Step 3: Create scans row
const scan = await step.run('create-scan-row', async () => {
  const { data: scan } = await supabase
    .from('scans')
    .insert({
      business_id: data.business_id,
      scan_type: 'scheduled',
      status: 'processing',
      engines_queried: engines,
      prompts_used: queries.length,
      results_summary: { region: data.region_name ?? 'home' },
    })
    .select()
    .single();
  return scan;
});

// Step 4: Execute engine calls with modified query text
const engineResults = await step.run('execute-engine-calls', async () => {
  const calls = queries.flatMap((query) =>
    engines.map((engine) =>
      executeEngineCall(engine, query.effective_query, data.business_id)
    )
  );
  return Promise.allSettled(calls);
});

// Step 5: Parse results (Haiku for full scans)
const parsed = await step.run('parse-results', async () =>
  parseResultsWithHaiku(engineResults, data.business_id, scan.id)
);

// Step 6: Write scan_engine_results — include region column
await step.run('write-engine-results', async () => {
  const rows = parsed.rows.map((row) => ({
    ...row,
    region: data.region_name ?? null,  // null = home region
  }));
  await supabase.from('scan_engine_results').insert(rows);
});

// Step 7: Complete scan
await step.run('complete-scan', async () => {
  await supabase
    .from('scans')
    .update({
      status: 'completed',
      overall_score: parsed.overallScore,
      completed_at: new Date().toISOString(),
    })
    .eq('id', scan.id);
});
```

---

## 7. API Routes

### `GET /api/scan/regions`

Returns all active scan regions for the authenticated business.

**Auth:** Required

**Query params:** `business_id` (required)

**Response:**
```typescript
{
  data: Array<{
    id: string;
    region_name: string;
    region_code: string | null;
    is_home_region: boolean;
    scan_cadence_multiplier: number;
    last_scanned_at: string | null;  // from latest scans row for this region
    created_at: string;
  }>
}
```

### `POST /api/scan/regions`

Add a new scan region.

**Auth:** Required

**Body (Zod schema):**
```typescript
const AddRegionSchema = z.object({
  business_id: z.string().uuid(),
  region_name: z.string().min(2).max(100),
  region_code: z.string().max(10).optional(),
});
```

**Logic:**
1. Verify user owns `business_id`
2. Fetch plan tier from `subscriptions`
3. Call `validateRegionLimit(business_id, planTier)` — throws 429 if limit exceeded
4. Compute `scan_cadence_multiplier` based on tier + region count
5. Insert `scan_regions` row
6. Return 201 with created row

**Error responses:**
- `400` — invalid input (Zod failure)
- `403` — user does not own business
- `409` — region already exists (`UNIQUE(business_id, region_name)` violation)
- `422` — tier limit reached (`{ error: 'REGION_LIMIT_REACHED', limit: 5, current: 5 }`)

### `DELETE /api/scan/regions/[region_id]`

Soft-delete a region. Home regions cannot be deleted.

**Auth:** Required

**Logic:**
1. Verify user owns the region (via business_id join)
2. Verify `is_home_region = FALSE` — return 400 if home
3. Set `deleted_at = NOW()` (soft delete)
4. Return 200

**Response:**
```typescript
{ data: { deleted: true, region_id: string } }
```

---

## 8. UI Components

### 8.1 `RegionSelector`

**Location:** `src/components/dashboard/region-selector.tsx`

**Props:**
```typescript
interface RegionSelectorProps {
  regions: Array<{ id: string; region_name: string; is_home_region: boolean }>;
  selectedRegion: string | null;  // null = "All"
  onRegionChange: (regionName: string | null) => void;
}
```

**Behavior:** Pill-style tabs. "All" is always first and always shown. Each configured region is a pill. Selected pill has solid fill; unselected is outlined. On mobile (< 640px) renders as a native `<select>` dropdown for space efficiency.

**RTL:** Use `flex-wrap` container with `gap-2`. No directional positioning. Pill text is locale-agnostic (city names). On RTL: pills flow right to left naturally via `flex-wrap` with `dir="rtl"`.

### 8.2 `RegionSettingsPanel`

**Location:** `src/components/settings/region-settings-panel.tsx`

**Props:**
```typescript
interface RegionSettingsPanelProps {
  businessId: string;
  regions: ScanRegion[];
  planTier: 'starter' | 'pro' | 'business';
  maxRegions: number;  // derived from tier: 1/5/20
}
```

**Behavior:**
- Lists all configured regions. Home region row has a "Home" badge and no delete button.
- "Add City" button opens `AddRegionModal`. Disabled + tooltip if limit reached.
- Each non-home row: region name, cadence label ("Every 3 days"), delete button.
- Starter users see the panel in read-only mode with an upgrade CTA: "Upgrade to Pro to track up to 5 cities."

### 8.3 `AddRegionModal`

**Location:** `src/components/settings/add-region-modal.tsx`

**Props:**
```typescript
interface AddRegionModalProps {
  businessId: string;
  onSuccess: (region: ScanRegion) => void;
  onClose: () => void;
}
```

**Behavior:** Combobox input with static city list (`src/constants/cities.ts` — Israeli cities + major international cities). User can type to filter. On submit: `POST /api/scan/regions`. Shows error inline if region already exists (409) or limit reached (422).

**City constants file:** `src/constants/cities.ts` — export an array of `{ name: string; code: string; country: string }`. Phase 1: Israeli cities (30 entries). Phase 2: European cities. These are static constants, not fetched from DB.

### 8.4 `RegionBadge`

**Location:** `src/components/dashboard/region-badge.tsx`

**Props:**
```typescript
interface RegionBadgeProps {
  regionName: string;
  variant: 'home' | 'remote';
}
```

**Behavior:** Small colored chip shown on scan result rows when viewing "All" to identify which region each result row belongs to. `home` = gray; `remote` = blue. Truncates to 12 characters with tooltip for full name.

---

## 9. Tier Gating

| Feature | Starter | Pro | Business |
|---------|---------|-----|---------|
| Home region (auto, no config) | Yes | Yes | Yes |
| Additional scan regions | No (0 extra) | Up to 4 extra (5 total) | Up to 19 extra (20 total) |
| Non-home region cadence | — | Every 3 days | Full cadence (first 3), every 3 days (rest) |
| Region selector on Rankings | No (hidden, upgrade nudge) | Yes | Yes |
| Region Settings Panel | Read-only + CTA | Full CRUD | Full CRUD |
| `POST /api/scan/regions` | 422 (tier limit = 1) | Up to 5 | Up to 20 |
| Per-region trend charts (Phase 2) | No | Yes | Yes |

**Starter region logic:** Starter users have `max_regions = 1` (home only). The API enforces this. The Settings panel renders in a locked state for Starter users with an upgrade CTA. The Rankings page does not show a region selector for Starter (no extra regions to select).

---

## 10. Cost Impact

Cost sourced from `PRICING-IMPACT-ANALYSIS.md §1 (F10)`.

**Per-city cost model (Pro, non-home region):**
- Reduced cadence: every 3 days (not daily) = ~10 scans/month per non-home region
- 3 engines (reduced from 7 to control cost — engines rotate on priority basis)
- 10 queries per scan (average tracked query count for Pro users)
- Engine cost: 10 queries × 3 engines = 30 calls × $0.002 = $0.06/scan
- Parsing (Haiku): 30 calls × $0.002 = $0.06/scan
- Total per scan: $0.12/scan
- Per month (10 scans): $1.20/city/month

**At average 3 non-home cities (Pro user with all 5 slots partially used):**
- Home region: daily (included in existing scan cost)
- 3 non-home cities: 3 × $2.30 = $6.90/month

**Note on $2.30 vs $1.20:** The $2.30/city figure used in `PRICING-IMPACT-ANALYSIS.md` uses a slightly higher query count estimate (12 queries). Both figures fall in the same range. Use $2.30 as the planning estimate (conservative).

**Business tier (first 3 regions at full cadence):**
- Full cadence = 6 scans/day × 30 = ~180 scans/month per region
- At 7 engines × 10 queries = 70 calls × $0.002 = $0.14/scan
- Per month: 180 × $0.14 = $25.20/region
- First 3 regions: 3 × $25.20 = $75.60/month additional
- Regions 4-20 at reduced cadence: $2.30 × 17 = $39.10/month

**Total Business multi-region cost: ~$114.70/month** (worst case, all 20 regions used)
**Average Business multi-region cost: ~$23.00/month** (typical 10-city usage from PRICING-IMPACT-ANALYSIS)

This is the figure used in the Business-tier cost model. At $349/month revenue and the total cost structure in the pricing analysis, Business-tier margins remain positive even at maximum region usage.

---

## 11. Engineering Notes

**Null region = home region.** The `region` column on `scan_engine_results` is `NULL` for home region scans — both legacy rows and new scans where `region_name` is null. The dashboard query for "All" regions runs without a region filter. The query for a specific region filters `WHERE region = 'Haifa'`. The query for "home region only" filters `WHERE region IS NULL`. Document this clearly in any query that touches `scan_engine_results`.

**Do not modify `tracked_queries.query_text` in the DB.** The region modifier is appended in memory at scan dispatch time (Inngest step) and used only for the engine API call. The stored query text stays unmodified. This keeps the data model clean and makes it trivial to add/remove regions without backfilling queries.

**Home region auto-creation.** When `POST /api/onboarding/complete` runs, it should insert one `scan_regions` row with `is_home_region = TRUE`, `region_name = businesses.location` (if provided), `scan_cadence_multiplier = 1.0`. If `businesses.location` is null, insert the row with `region_name = 'Home'` and `is_home_region = TRUE` — this acts as the "no region modifier" sentinel. The scan engine checks `is_home_region` to determine whether to apply a modifier.

**Soft delete is required.** Hard-deleting a `scan_regions` row would break historical `scan_engine_results` row semantics — those rows reference a region name as a string, not a foreign key, so historical data is unaffected. The soft delete (`deleted_at`) is enforced to prevent accidental data confusion. When querying active regions, always filter `WHERE deleted_at IS NULL`.

**Region name is the join key.** `scan_engine_results.region` stores the region name as text (not a UUID FK to `scan_regions`). This is intentional: it makes historical queries independent of whether the region row still exists. It means city names must be consistent. Use the constant from `src/constants/cities.ts` as the canonical region name on both insert and query.

**First-run: existing businesses.** Existing businesses at the time of migration have no `scan_regions` rows. The home region row must be backfilled. Migration SQL:

```sql
INSERT INTO scan_regions (business_id, region_name, is_home_region, scan_cadence_multiplier)
SELECT
  id,
  COALESCE(location, 'Home') AS region_name,
  TRUE AS is_home_region,
  1.0 AS scan_cadence_multiplier
FROM businesses
WHERE id NOT IN (SELECT DISTINCT business_id FROM scan_regions)
ON CONFLICT (business_id, region_name) DO NOTHING;
```

**Migration checklist:**
1. Run `CREATE TABLE scan_regions` migration
2. Run `ALTER TABLE scan_engine_results ADD COLUMN region` migration
3. Run `ALTER TABLE tracked_queries ADD COLUMN region` migration
4. Run backfill SQL for existing businesses (home region rows)
5. Create `src/constants/cities.ts` with Israeli cities list
6. Deploy Inngest changes (new `scan/regional.start` event handler)
7. Update `cron.scheduled-scans` to dispatch regional events
8. Update `POST /api/onboarding/complete` to create home region row
