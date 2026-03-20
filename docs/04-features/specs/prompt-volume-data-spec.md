# Beamix — Real Prompt Volume Data Technical Spec (F11)

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Decision-ready — GSC path only (Keyword Planner + third-party APIs deferred)
> **Audience:** Engineers building the GSC integration and prompt volume pipeline. You should be able to implement this feature end-to-end without reading any other document.
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

The scan engine knows which AI engines mention a business. But it does not know which queries matter most in terms of real user demand. A business could rank poorly on "best dentist near me" (searched 10,000x/month) and perfectly on "cosmetic dental implant specialist Jerusalem" (searched 40x/month). Without volume data, the platform cannot distinguish signal from noise.

**Strategy:** Use Google Search Console (GSC) as the primary data source. GSC is free, requires only OAuth consent from the user, and provides real search query data tied to the user's own domain. Queries with high traditional-search impressions are strong proxies for queries that are also asked of AI search engines — the semantic intent is the same, only the interface differs.

For users who cannot or will not connect GSC (Starter tier, or Pro/Business users who decline), Beamix provides an internal panel view: anonymized, aggregated volume bands ("High / Medium / Low") derived from cross-user data within the same industry. This gives all users some signal, while the GSC integration delivers real numbers for Pro and Business users.

**Business value:**
- Without volume data, all queries look equally important. With it, users know to prioritize content work on high-volume queries first.
- For the agent system: recommendations generated after a scan can be ranked by expected impact × query volume, making them materially more actionable.
- GSC integration creates a sticky integration — connected users are much harder to churn because disconnecting means losing their historical volume data.

---

## 2. Scope and Boundaries

### In Scope — Phase 1 (Launch)

| Item | Notes |
|------|-------|
| GSC OAuth 2.0 flow | Scopes: `webmasters.readonly` |
| Token storage in `integrations` table | `provider = 'google_search_console'` |
| Weekly GSC data pull via Inngest | `cron.gsc-sync` every Sunday 02:00 UTC |
| `prompt_volumes` table | Stores per-query weekly data |
| Internal panel (all tiers) | Volume band (High/Medium/Low), estimated from industry peers |
| Volume indicator column on Rankings page | Bar chart icon with tooltip |
| Sort by volume on Rankings (Pro+) | Ascending and descending |
| GSC property URL display in Settings > Integrations | With last sync timestamp |
| Disconnect GSC button | Clears token from `integrations` |

### In Scope — Phase 2 (Growth)

| Item | Notes |
|------|-------|
| Volume trend chart per query | Show weekly impressions over time |
| Query match suggestions | "This tracked query is similar to [GSC query] with 2,400 impressions/week" |
| Alert: high-volume query you don't track | Notify when GSC shows a query with >1000 impressions not in tracked_queries |

### Explicitly Deferred

| Item | Reason |
|------|--------|
| Google Keyword Planner API | Requires Google Ads account. Adds billing complexity. Not worth it when GSC is free. |
| Ahrefs / Semrush API | $50-500/month platform cost. Destroys margins. Ruled out by PRICING-IMPACT-ANALYSIS. |
| Bing Webmaster Tools | Phase 3 research only. API access unclear. |
| Semrush keyword data | Out of scope by Axiom recommendation — GSC covers the use case at zero cost. |

### Out of Scope

- Crawling search engines for volume data (no scraping)
- Purchasing keyword volume data from any third-party paid API
- Traditional SEO keyword research features (this is a GEO product, not an SEO product)
- AI volume prediction models (too speculative, low confidence)

---

## 3. User Flows

### 3.1 Connecting GSC (Pro/Business User)

```
1. User navigates to Settings > Integrations
2. "Google Search Console" card shown with status "Not connected"
3. User clicks "Connect GSC"
4. GET /api/integrations/gsc/connect → generates OAuth URL → redirect to Google
5. Google OAuth consent screen: user grants webmasters.readonly permission
6. Google redirects to /api/integrations/gsc/callback?code=[code]&state=[state]
7. Callback: exchanges code for access_token + refresh_token
8. Callback: prompts user to select GSC property (if multiple properties found)
9. User selects property (e.g., "https://mybusiness.co.il/")
10. Callback: stores tokens + property_url in integrations table
11. Callback: fires one-time GSC sync (immediate, not waiting for weekly cron)
12. Redirect to Settings > Integrations with success toast
13. GSC card now shows: connected property URL, "Last synced: just now", Disconnect button
```

### 3.2 Property Selection (If Multiple GSC Properties)

```
1. After OAuth exchange, API calls GSC API to list all verified properties
2. If only 1 property: auto-select it, skip selection step
3. If multiple: redirect to /settings/integrations/gsc/select-property
4. Page shows radio list of property URLs: sc-domain:example.com, https://example.com/, etc.
5. User selects primary property
6. POST /api/integrations/gsc/select-property: saves property_url to integrations row
7. Triggers immediate sync for selected property
8. Redirect back to Settings > Integrations
```

### 3.3 Weekly Sync (Automated)

```
1. cron.gsc-sync fires Sunday 02:00 UTC
2. Queries integrations table: all active GSC integrations
3. For each: refreshes access_token if expired (using refresh_token)
4. Calls GSC Search Analytics API for last 7 days of query data
5. Upserts data into prompt_volumes table
6. Logs sync timestamp: updates integrations.last_synced_at
7. Fires gsc/sync.completed event (for alerting pipeline in Phase 2)
```

### 3.4 Viewing Volume Data on Rankings

```
1. User visits /dashboard/rankings
2. Rankings table shows new "Volume" column
3. For GSC-connected Pro/Business user:
   - Real impression count per week (e.g., "2,400/wk")
   - Confidence pill: green "GSC Data"
   - "Sort by Volume" button appears in column header
4. For Starter or non-connected Pro user:
   - Volume band shown (High / Medium / Low) from internal panel
   - Confidence pill: gray "Estimated"
   - Sort by volume: disabled (Pro+ only, requires real data)
5. Clicking volume cell: tooltip with source + last updated date
```

### 3.5 Disconnecting GSC

```
1. User clicks "Disconnect" in Settings > Integrations > GSC card
2. Confirmation modal: "Disconnect Google Search Console? Your historical volume data will be kept but won't update."
3. User confirms: PATCH /api/integrations/gsc/disconnect
4. Sets integrations row: status = 'inactive', access_token = null, refresh_token = null (tokens cleared)
5. prompt_volumes rows are retained (historical data preserved)
6. prompt_volumes.source = 'gsc' rows remain but no new data added
7. Rankings page falls back to internal panel (estimated bands)
```

---

## 4. Data Model

### 4.1 New Table: `prompt_volumes`

```sql
CREATE TABLE prompt_volumes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  query_text            TEXT NOT NULL,
  source                TEXT NOT NULL CHECK (source IN ('gsc', 'internal_panel', 'estimated')),
  weekly_impressions    INTEGER,                      -- null if source='estimated' or 'internal_panel'
  weekly_clicks         INTEGER,                      -- null if source='estimated' or 'internal_panel'
  estimated_volume_band TEXT CHECK (
                          estimated_volume_band IN ('high', 'medium', 'low', 'unknown')
                        ),
  confidence_score      NUMERIC(3,2) NOT NULL DEFAULT 0.0,   -- 0.0 = pure estimate, 1.0 = real GSC data
  week_start            DATE NOT NULL,               -- Monday of the week this data covers
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, query_text, source, week_start)
);

-- Fast lookup: latest volume data per query for a business
CREATE INDEX idx_prompt_volumes_biz_query
  ON prompt_volumes (business_id, query_text, week_start DESC);

-- GSC-source rows only (for sync status checks)
CREATE INDEX idx_prompt_volumes_gsc
  ON prompt_volumes (business_id, week_start DESC)
  WHERE source = 'gsc';

-- Internal panel queries: all businesses in same industry for aggregation
CREATE INDEX idx_prompt_volumes_industry_query
  ON prompt_volumes (query_text, week_start DESC)
  WHERE source = 'internal_panel';
```

**`confidence_score` values:**
- `1.0` — Real GSC data for this specific business
- `0.5` — Industry panel aggregate (minimum cohort of 10 businesses in same industry)
- `0.1` — Estimated (derived from `prompt_library.estimated_volume` only, no panel data)
- `0.0` — Unknown (query not in any volume dataset)

**`week_start` convention:** Always Monday of the ISO week. Compute via:
```typescript
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);  // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}
```

### 4.2 Changes to `integrations` (Existing Table)

The `integrations` table already exists. GSC uses `provider = 'google_search_console'`. The `config` JSONB column stores all GSC-specific data.

**Required `config` shape for GSC:**
```typescript
interface GSCIntegrationConfig {
  access_token: string;          // Current OAuth access token (short-lived, ~1h)
  refresh_token: string;         // Long-lived token for refreshing
  token_expiry: string;          // ISO timestamp when access_token expires
  property_url: string;          // e.g., 'https://mybusiness.co.il/'
  verified_properties: string[]; // All properties returned by GSC at connect time
}
```

**Migration note:** No schema change to `integrations` table required. Verify `config` column is `JSONB` and `provider` is `TEXT`. If not present, this migration must be confirmed before implementing.

**RLS:** `integrations` rows are owned by `user_id`. Existing RLS policy: `user_id = auth.uid()`. No change needed. Inngest reads via service role.

### 4.3 No Changes to `tracked_queries`

Volume data links to tracked queries by `query_text` match (fuzzy, see §5.2). No FK column added to `tracked_queries` in Phase 1. This avoids a rigid join constraint that would require exact text matching — GSC returns queries as typed by users, which may differ slightly from internal tracked query text.

---

## 5. Business Logic

### 5.1 GSC Data Pull

The GSC Search Analytics API endpoint:
```
POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query
```

**Request body used in Beamix:**
```typescript
const gscRequest = {
  startDate: weekStartDate,          // Monday, 7 days ago
  endDate: weekEndDate,              // Sunday, yesterday
  dimensions: ['query'],             // Group by query string
  rowLimit: 1000,                    // Max rows per request (pagination if needed)
  dataState: 'final',                // Use 'final' — 'all' includes estimated data
};
```

**Response shape:**
```typescript
interface GSCSearchAnalyticsResponse {
  rows: Array<{
    keys: [string];     // [queryText]
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  responseAggregationType: string;
}
```

**Pagination:** GSC returns up to 1000 rows per request. If `rows.length === 1000`, fetch next page with `startRow` offset. Continue until `rows.length < 1000`.

### 5.2 Query Text Matching (GSC → tracked_queries)

GSC returns exact query strings typed by users. `tracked_queries.query_text` contains internally defined queries. These do not always match exactly. The matching logic:

```typescript
function normalizeQueryText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')   // strip punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function isQueryMatch(gscQuery: string, trackedQuery: string): boolean {
  const gscNorm = normalizeQueryText(gscQuery);
  const trackedNorm = normalizeQueryText(trackedQuery);

  // Exact match after normalization
  if (gscNorm === trackedNorm) return true;

  // Tracked query is a subset of GSC query (or vice versa)
  // e.g., tracked: "best dentist" matches GSC: "best dentist tel aviv"
  if (gscNorm.includes(trackedNorm) || trackedNorm.includes(gscNorm)) return true;

  return false;
}
```

**Phase 1 limitation:** No fuzzy (Levenshtein) matching in Phase 1. The subset match handles the common case (location modifiers, extra words). Fuzzy matching is Phase 2 if users report gaps.

**Matching is used for display only.** `prompt_volumes` stores `query_text` from GSC as-is. The Rankings page loads volume data by calling `getVolumeForQuery(trackedQuery.query_text)` which runs the matching logic against stored `prompt_volumes.query_text` values. No FK join.

### 5.3 Volume Band Classification (Internal Panel)

For users without GSC, or for Starter users, volume bands are derived from the internal panel: aggregated, anonymized `prompt_volumes` data from other businesses in the same industry.

```typescript
async function getInternalPanelBand(
  queryText: string,
  industry: string,
  weekStart: string
): Promise<{ band: 'high' | 'medium' | 'low' | 'unknown'; confidence: number }> {
  // Aggregate impressions for this query across businesses in same industry
  // Minimum cohort: 10 businesses (privacy floor)
  const { data } = await supabase.rpc('get_industry_query_volume_band', {
    p_query_text: normalizeQueryText(queryText),
    p_industry: industry,
    p_week_start: weekStart,
    p_min_cohort: 10,
  });

  if (!data || data.business_count < 10) {
    return { band: 'unknown', confidence: 0.0 };
  }

  // Band thresholds (impressions/week, across panel):
  // High: median >= 500
  // Medium: median >= 100
  // Low: below 100
  const median = data.median_impressions;
  const band = median >= 500 ? 'high' : median >= 100 ? 'medium' : 'low';
  return { band, confidence: 0.5 };
}
```

**SQL function `get_industry_query_volume_band`:**
```sql
CREATE OR REPLACE FUNCTION get_industry_query_volume_band(
  p_query_text TEXT,
  p_industry TEXT,
  p_week_start DATE,
  p_min_cohort INTEGER DEFAULT 10
)
RETURNS TABLE (
  median_impressions NUMERIC,
  business_count INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pv.weekly_impressions) AS median_impressions,
    COUNT(DISTINCT pv.business_id)::INTEGER AS business_count
  FROM prompt_volumes pv
  JOIN businesses b ON b.id = pv.business_id
  WHERE
    pv.source = 'gsc'
    AND pv.week_start = p_week_start
    AND b.industry = p_industry
    AND LOWER(REGEXP_REPLACE(pv.query_text, '[^\w\s]', '', 'g')) LIKE '%' || LOWER(p_query_text) || '%'
  HAVING COUNT(DISTINCT pv.business_id) >= p_min_cohort;
$$;
```

**Privacy note:** The function returns only aggregated values (median, count). Individual business impressions are never exposed. The `p_min_cohort = 10` floor ensures no single business's data is identifiable.

### 5.4 Token Refresh

GSC access tokens expire in ~1 hour. Before each API call, check expiry and refresh if needed.

```typescript
async function getValidAccessToken(integrationId: string): Promise<string> {
  const { data: integration } = await supabase
    .from('integrations')
    .select('config')
    .eq('id', integrationId)
    .single();

  const config = integration.config as GSCIntegrationConfig;
  const isExpired = new Date(config.token_expiry) <= new Date(Date.now() + 60_000);  // 1min buffer

  if (!isExpired) return config.access_token;

  // Refresh
  const refreshed = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: config.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const tokens = await refreshed.json();

  await supabase
    .from('integrations')
    .update({
      config: {
        ...config,
        access_token: tokens.access_token,
        token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      },
    })
    .eq('id', integrationId);

  return tokens.access_token;
}
```

---

## 6. Inngest Jobs

### 6.1 New: `cron.gsc-sync`

**Trigger:** `{ cron: "0 2 * * 0" }` — 02:00 UTC every Sunday

**Steps:**

```typescript
// Step 1: Fetch all active GSC integrations
const gscIntegrations = await step.run('fetch-gsc-integrations', async () => {
  const { data } = await supabase
    .from('integrations')
    .select('id, business_id, config, user_id')
    .eq('provider', 'google_search_console')
    .eq('status', 'active');
  return data ?? [];
});

// Step 2: For each integration, sync last 7 days
for (const integration of gscIntegrations) {
  await step.run(`sync-gsc-${integration.id}`, async () => {
    try {
      const accessToken = await getValidAccessToken(integration.id);

      const weekStart = getWeekStart(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      const weekEnd = getWeekStart(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000));

      const config = integration.config as GSCIntegrationConfig;
      const rows = await fetchGSCData(accessToken, config.property_url, weekStart, weekEnd);

      // Upsert into prompt_volumes
      const volumeRows = rows.map((row) => ({
        business_id: integration.business_id,
        query_text: row.keys[0],
        source: 'gsc' as const,
        weekly_impressions: row.impressions,
        weekly_clicks: row.clicks,
        estimated_volume_band: impressionsToBand(row.impressions),
        confidence_score: 1.0,
        week_start: weekStart,
      }));

      await supabase
        .from('prompt_volumes')
        .upsert(volumeRows, {
          onConflict: 'business_id,query_text,source,week_start',
          ignoreDuplicates: false,
        });

      // Update last_synced_at
      await supabase
        .from('integrations')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', integration.id);

    } catch (error) {
      // Log error but continue to next integration — don't fail the whole job
      console.error(`GSC sync failed for integration ${integration.id}:`, error);

      await supabase
        .from('integrations')
        .update({
          status: 'error',
          last_error: (error as Error).message,
        })
        .eq('id', integration.id);
    }
  });
}

// Step 3: Also populate internal_panel rows (cross-business, industry-aggregated)
// This step is best-effort: if it fails, panel data falls back to prior week
await step.run('update-internal-panel', async () => {
  // This is a pure SQL operation — no API calls needed
  // The SQL function aggregates existing 'gsc' rows into 'internal_panel' rows
  await supabase.rpc('rebuild_internal_panel_volumes');
});
```

**`rebuild_internal_panel_volumes` SQL function:**
```sql
CREATE OR REPLACE FUNCTION rebuild_internal_panel_volumes()
RETURNS void
LANGUAGE sql
AS $$
  -- Delete last week's internal_panel rows (rebuild fresh)
  DELETE FROM prompt_volumes
  WHERE source = 'internal_panel'
    AND week_start = DATE_TRUNC('week', NOW() - INTERVAL '7 days')::DATE;

  -- Insert new internal_panel rows from aggregated GSC data
  -- Only include queries where cohort >= 10 businesses in same industry
  INSERT INTO prompt_volumes (
    business_id, query_text, source, weekly_impressions,
    estimated_volume_band, confidence_score, week_start
  )
  SELECT
    b.id AS business_id,
    pv.query_text,
    'internal_panel' AS source,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pv.weekly_impressions)::INTEGER AS weekly_impressions,
    CASE
      WHEN PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pv.weekly_impressions) >= 500 THEN 'high'
      WHEN PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pv.weekly_impressions) >= 100 THEN 'medium'
      ELSE 'low'
    END AS estimated_volume_band,
    0.5 AS confidence_score,
    pv.week_start
  FROM prompt_volumes pv
  JOIN businesses b ON b.industry = (
    SELECT industry FROM businesses WHERE id = pv.business_id
  )
  WHERE
    pv.source = 'gsc'
    AND pv.week_start = DATE_TRUNC('week', NOW() - INTERVAL '7 days')::DATE
  GROUP BY b.id, pv.query_text, pv.week_start
  HAVING COUNT(DISTINCT pv.business_id) >= 10
  ON CONFLICT (business_id, query_text, source, week_start) DO UPDATE
    SET weekly_impressions = EXCLUDED.weekly_impressions,
        estimated_volume_band = EXCLUDED.estimated_volume_band,
        confidence_score = EXCLUDED.confidence_score;
$$;
```

### 6.2 New: One-Time Immediate Sync on Connect

When a user connects GSC, fire an immediate sync instead of waiting for Sunday cron.

**Event:** `gsc/connected` fires from the `/api/integrations/gsc/callback` route.

```typescript
// In Inngest function gsc.immediate-sync, triggered by gsc/connected event:
inngest.createFunction(
  { id: 'gsc-immediate-sync' },
  { event: 'gsc/connected' },
  async ({ event, step }) => {
    const { integration_id } = event.data;

    await step.run('sync-on-connect', async () => {
      // Same logic as cron.gsc-sync for a single integration
      // Runs immediately after connection to populate volume data
    });
  }
);
```

---

## 7. API Routes

### `GET /api/integrations/gsc/connect`

Initiates the OAuth 2.0 flow.

**Auth:** Required

**Logic:**
1. Generate `state` param: `nanoid()` stored in `session` or as signed JWT
2. Build Google OAuth URL with scopes `https://www.googleapis.com/auth/webmasters.readonly`
3. Redirect to Google OAuth URL

**Required env vars:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` — must be set to `/api/integrations/gsc/callback` (absolute URL)

### `GET /api/integrations/gsc/callback`

OAuth callback handler.

**Query params:** `code`, `state`, `error` (if OAuth denied)

**Logic:**
1. Validate `state` matches session (CSRF protection)
2. If `error` present: redirect to Settings > Integrations with error message
3. Exchange `code` for tokens via POST to `https://oauth2.googleapis.com/token`
4. Call GSC Site List API to get verified properties
5. If 1 property: insert `integrations` row, fire `gsc/connected` event, redirect to Settings
6. If multiple properties: store tokens temporarily (encrypted cookie or short-lived DB row), redirect to `/settings/integrations/gsc/select-property`

### `POST /api/integrations/gsc/select-property`

Finalizes property selection after OAuth.

**Auth:** Required

**Body (Zod):**
```typescript
const SelectPropertySchema = z.object({
  property_url: z.string().url(),
});
```

**Logic:**
1. Reads tokens from temp storage (cookie or pending row)
2. Inserts final `integrations` row with `config = { access_token, refresh_token, token_expiry, property_url, verified_properties }`
3. Fires `gsc/connected` event
4. Returns 201, client redirects to Settings

### `PATCH /api/integrations/gsc/disconnect`

**Auth:** Required

**Logic:**
1. Find integration row by `user_id` and `provider = 'google_search_console'`
2. Update: `status = 'inactive'`, clear `config.access_token`, clear `config.refresh_token` (revoke token at Google too, best-effort)
3. Historical `prompt_volumes` rows remain (not deleted)
4. Return 200

### `GET /api/analytics/prompt-volume`

Returns volume data for one or more queries.

**Auth:** Required

**Query params:**
- `business_id` (required)
- `query_id` (optional — if omitted, returns all tracked queries)
- `weeks` (optional, default 4 — how many weeks of history)

**Response:**
```typescript
{
  data: Array<{
    query_text: string;
    tracked_query_id: string | null;     // matched tracked_queries.id, null if no match
    source: 'gsc' | 'internal_panel' | 'estimated';
    confidence_score: number;
    latest: {
      week_start: string;
      weekly_impressions: number | null;
      weekly_clicks: number | null;
      estimated_volume_band: 'high' | 'medium' | 'low' | 'unknown';
    };
    history: Array<{                      // last N weeks, ordered by week_start DESC
      week_start: string;
      weekly_impressions: number | null;
      estimated_volume_band: string;
    }>;
  }>
}
```

**Implementation:** Reads `prompt_volumes` for the business. For each tracked query, runs `isQueryMatch()` against stored prompt_volume rows and returns the best match. If no match found and source = 'gsc', returns an `estimated` row derived from `prompt_library.estimated_volume`.

---

## 8. UI Components

### 8.1 `VolumeIndicator`

**Location:** `src/components/dashboard/volume-indicator.tsx`

**Props:**
```typescript
interface VolumeIndicatorProps {
  band: 'high' | 'medium' | 'low' | 'unknown';
  weeklyImpressions: number | null;    // null if non-GSC source
  source: 'gsc' | 'internal_panel' | 'estimated';
  confidenceScore: number;
}
```

**Behavior:**
- GSC source: shows actual number "2.4K/wk" in blue. Confidence chip: green "GSC" badge.
- Internal panel: shows band label ("High", "Medium", "Low") with bar icon (3 bars = high, 2 = medium, 1 = low). Confidence chip: gray "Estimated" badge.
- Unknown: shows "—" dash. Tooltip: "No volume data available."
- Tooltip (hover): shows full source description. For GSC: "From your Google Search Console: 2,400 impressions/week." For panel: "Estimated from X businesses in your industry. Actual volume may vary."

**RTL:** Numbers use `dir="ltr"` to prevent digit reversal. Band labels ("גבוה" / "בינוני" / "נמוך" in Hebrew) are passed as localized props, not hardcoded.

### 8.2 `GSCConnectionCard`

**Location:** `src/components/settings/gsc-connection-card.tsx`

**Props:**
```typescript
interface GSCConnectionCardProps {
  integration: {
    status: 'active' | 'inactive' | 'error';
    property_url: string | null;
    last_synced_at: string | null;
    last_error: string | null;
  } | null;  // null = never connected
  planTier: 'starter' | 'pro' | 'business';
}
```

**States:**
1. **Never connected (`integration = null`):** Button "Connect Google Search Console" + description explaining what it does. For Starter: button disabled with upgrade tooltip.
2. **Active:** Property URL shown. "Last synced: 3 days ago." Disconnect button.
3. **Error:** Red banner with last_error message. "Reconnect" button (re-initiates OAuth).
4. **Inactive (disconnected):** "Connect Google Search Console" button (fresh connect).

### 8.3 `VolumeSortControl`

**Location:** `src/components/dashboard/volume-sort-control.tsx`

**Props:**
```typescript
interface VolumeSortControlProps {
  enabled: boolean;            // false for Starter or non-GSC Pro
  currentSort: 'asc' | 'desc' | null;
  onSortChange: (sort: 'asc' | 'desc' | null) => void;
}
```

**Behavior:** Small sort button in the "Volume" column header. Click cycles: null → desc → asc → null. When `enabled = false`: grayed out, click shows tooltip "Connect GSC to sort by real search volume."

### 8.4 `PropertySelectorPage`

**Location:** `src/app/(dashboard)/settings/integrations/gsc/select-property/page.tsx`

**Props (via URL):** Properties list from cookie / server-side session.

**Behavior:** Radio list of verified GSC property URLs. Submit button calls `POST /api/integrations/gsc/select-property`. If only 1 property exists, this page auto-submits on mount (no user action needed).

---

## 9. Tier Gating

| Feature | Starter | Pro | Business |
|---------|---------|-----|---------|
| Internal panel (estimated volume bands) | Yes | Yes | Yes |
| GSC OAuth integration | No (locked, upgrade CTA) | Yes | Yes |
| Real impression counts from GSC | No | Yes | Yes |
| Sort by volume on Rankings | No | Yes (GSC required) | Yes (GSC required) |
| Volume history (Phase 2) | No | Yes | Yes |
| Alert: untracked high-volume query (Phase 2) | No | No | Yes |

**Gate implementation:**
- `GET /api/integrations/gsc/connect` — returns 403 for Starter users with body `{ error: 'PLAN_UPGRADE_REQUIRED', required_tier: 'pro' }`
- Settings GSC card: rendered for all tiers but button disabled + tooltip for Starter
- `GET /api/analytics/prompt-volume` — returns data for all tiers; `source` field in response indicates GSC vs estimated. No 403. The gating is on whether GSC integration exists, not on the API itself.
- Sort by volume: client-side control disabled for Starter and non-GSC Pro. API accepts sort param for all tiers but returns empty sort for non-GSC users (no real impressions to sort by).

---

## 10. Cost Impact

From `PRICING-IMPACT-ANALYSIS.md §1 (F11)`:

| Source | Cost Per Business/Month | Notes |
|--------|------------------------|-------|
| GSC integration (primary path) | $0.00 | Google Search Analytics API is free for connected users |
| Internal panel data | $0.00 | Pure SQL aggregation, no LLM or external API |
| `rebuild_internal_panel_volumes` SQL function | ~$0.00 | Runs weekly, pure PostgreSQL, no external calls |
| Keyword Planner / Semrush API (rejected path) | $50-500+/month platform-wide | Out of scope — not built |

**Total F11 cost: $0.00/business/month** (GSC path only, as specified).

**Infrastructure considerations:**
- GSC API rate limit: 200 requests/day per OAuth client. At 1,000 connected businesses, 1,000 API calls per sync. Well within limit.
- `prompt_volumes` table size: 1,000 rows/business/week (1 row per query per week). At 1K businesses, 50 queries each, 52 weeks: ~2.6M rows/year. Indexed by `business_id, week_start DESC` — queries remain fast. No partitioning needed until 10M+ rows.
- `rebuild_internal_panel_volumes` SQL function: full table scan on `prompt_volumes` filtered to last week's GSC rows. At 2.6M rows, this runs in <5 seconds with the existing index. Monitor query time as table grows.

---

## 11. Engineering Notes

**GSC data lag.** Google Search Console data is typically 2-3 days behind. The weekly sync pulls data for the week ending last Sunday, not the current week. This is expected and should be noted in the UI: "Data updated weekly. Last update reflects queries from [date range]."

**`webmasters.readonly` scope only.** The GSC OAuth only requests read access. We never write to or modify users' GSC data. Emphasize this in the connection dialog ("We only read your search query data. We never modify your Search Console settings."). This reduces OAuth friction.

**Token storage security.** `access_token` and `refresh_token` are stored in the `integrations.config` JSONB column. This column should NOT be exposed to the client. The `GET /api/analytics/prompt-volume` route must never return the config object. Always select specific fields; never `select('*')` on integrations.

**Refresh token rotation.** Google may rotate refresh tokens. When a token refresh returns a new `refresh_token`, update both tokens in `integrations.config`. If a refresh fails with `invalid_grant`, set `integrations.status = 'error'` and surface a reconnect prompt to the user.

**Internal panel privacy floor.** The `p_min_cohort = 10` parameter in `get_industry_query_volume_band` is a hard floor. Never lower this value. If a query has fewer than 10 contributing businesses in an industry, return `band = 'unknown'` rather than potentially exposing a single business's data through a small cohort. This is both a privacy requirement and a data quality requirement (small cohorts produce unreliable medians).

**Query text normalization consistency.** The normalization function used in `isQueryMatch` (JS) must produce the same output as the SQL normalization in `rebuild_internal_panel_volumes` (`LOWER(REGEXP_REPLACE(...))`). Test these against each other with a shared test fixture. A mismatch causes volume data to not surface on the Rankings page even when it exists in `prompt_volumes`.

**Env vars required (new):**
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://[your-domain]/api/integrations/gsc/callback
```

Add to `src/env.ts` (or wherever env validation lives) as `z.string()` required fields.

**Migration checklist:**
1. Create `prompt_volumes` table + indexes
2. Create `get_industry_query_volume_band` SQL function
3. Create `rebuild_internal_panel_volumes` SQL function
4. Verify `integrations` table has `status`, `last_synced_at`, `last_error` columns — add via migration if missing
5. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` to env (Vercel + local `.env.local`)
6. Deploy Inngest `cron.gsc-sync` and `gsc.immediate-sync` functions
7. Deploy API routes (`/api/integrations/gsc/*`, `/api/analytics/prompt-volume`)
8. Deploy UI components
9. Verify OAuth redirect URI is registered in Google Cloud Console for both production and preview URLs
