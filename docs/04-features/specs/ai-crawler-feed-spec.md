# Beamix — AI Crawler Feed Technical Spec

> **2026-04 pricing update:** Canonical tier names/prices are now Discover $79 / Build $189 / Scale $499. Dollar figures referenced in this spec for cost analysis reflect the earlier $49/$149/$349 tier structure. Tier gating should be read as: Starter → Discover, Pro → Build, Business → Scale. Per-feature cost conclusions remain directionally valid.

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Ready for implementation
> **Audience:** Engineers building the AI Crawler Feed feature. You should be able to implement this end-to-end without reading any other document.
> **Source docs:** `04-features/new-features-batch-1-spec.md`, `PRICING-IMPACT-ANALYSIS.md §1`, `04-features/ai-readiness-spec.md`

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Scope and Boundaries](#2-scope-and-boundaries)
3. [User Flows](#3-user-flows)
4. [Data Model](#4-data-model)
5. [Bot Detection Constants](#5-bot-detection-constants)
6. [Inngest Background Job](#6-inngest-background-job)
7. [Cloudflare Analytics API Adapter](#7-cloudflare-analytics-api-adapter)
8. [Optional Haiku Summary Pipeline](#8-optional-haiku-summary-pipeline)
9. [API Routes](#9-api-routes)
10. [UI Components](#10-ui-components)
11. [Tier Gating](#11-tier-gating)
12. [Cost Impact](#12-cost-impact)
13. [Engineering Notes](#13-engineering-notes)

---

## 1. Feature Overview

**What it does:** The AI Crawler Feed shows which AI bots are crawling a user's website, which pages they access, and how often. For example: "GPTBot visited your site 14 times this week — it crawled your homepage and About page but has never visited your Services page." This is a high-signal diagnostic: if GPTBot has never crawled a page, that page cannot influence ChatGPT's knowledge of the business.

**Business value:**
- Fills a gap no basic GEO tool addresses. Competitors like Scrunch AI charge $500/month for CDN-level bot detection. Beamix offers this to Pro tier users at $149/month — a clear competitive advantage.
- Directly connects crawl gaps to visibility gaps. A business that sees "GPTBot never crawled your pricing page" has an immediate, actionable explanation for why ChatGPT doesn't mention their pricing.
- Drives integration adoption. The Cloudflare connection requirement creates a sticky integration that increases product lock-in and reduces churn.

**The core insight:** AI visibility depends not just on content quality, but on whether AI crawlers can physically access and index that content. Crawl data makes an invisible infrastructure signal visible and actionable.

**Why Cloudflare only for Phase 1:** Option C (JavaScript snippet) is technically invalid — AI crawlers are server-side bots that do not execute JavaScript. Option D (GA4) actively removes bot traffic rather than reporting it. Cloudflare API polling is the only approach that works reliably without user-installed server-side middleware.

---

## 2. Scope and Boundaries

### In Scope — Phase 1

| Capability | Notes |
|-----------|-------|
| Cloudflare Analytics GraphQL polling | Daily at 3am UTC via Inngest cron |
| 10 known AI bot user-agent patterns | See §5 for full list |
| Aggregated crawl feed (bot, page, count, date) | One row per (bot, page, day) |
| Dashboard widget: CrawlerFeedWidget | Table view, sortable, filterable |
| UncrawledPagesAlert | Callout for important pages with zero AI bot traffic |
| Filter by bot name and time range (7d / 30d / 90d) | |
| RTL support for Hebrew mode | All components |

### In Scope — Phase 2

| Capability | Notes |
|-----------|-------|
| Vercel log drain source | User configures Vercel to send logs to Beamix ingestion endpoint |
| Optional Haiku narrative summary | Triggered when >20 crawler events and last summary >7 days ago |
| Multi-source merging | Deduplicate events across Cloudflare + Vercel |

### Deferred

| Capability | Reason |
|-----------|--------|
| JavaScript tracking snippet | Technically invalid: AI crawlers don't execute JS |
| GA4 bot event detection | GA4 removes bot traffic — does not report it |
| Real-time streaming feed | Cloudflare API returns aggregated data, not real-time streams |
| Sitemap integration for uncrawled page detection | Requires sitemap parsing infra not yet built |

### Out of Scope

- This feature does not block or allow AI bots. It is observation only.
- This feature does not infer crawl intent or predict future crawl behavior.
- This feature does not detect human visitors. Only AI bot traffic.

---

## 3. User Flows

### 3.1 First-Time Setup (Cloudflare Integration)

```
1. User visits /dashboard (Pro or Business tier)
2. Dashboard displays CrawlerFeedWidget in empty state: "Connect Cloudflare to see AI bot activity"
3. User clicks "Connect Cloudflare" CTA
4. User is directed to /dashboard/settings → Integrations tab → Cloudflare section
5. User enters their Cloudflare Zone ID and API Token
6. Beamix stores integration record (provider='cloudflare', status='active', config={zone_id, api_token})
7. Inngest event triggers: integration.cloudflare.connected
8. Immediately runs a 30-day backfill job (one-time) to populate historical data
9. User returns to dashboard — crawler feed now shows last 30 days of data
```

### 3.2 Ongoing Daily Sync

```
1. cron.crawler-feed-sync fires at 3am UTC daily
2. Job finds all businesses with active Cloudflare integration
3. For each business: polls Cloudflare Analytics GraphQL API for yesterday's bot traffic
4. Filters user-agents against known AI bot constants
5. Aggregates by (bot_name, page_path): computes crawl_count for the day
6. Upserts into ai_crawler_events (increments crawl_count on conflict)
7. (Phase 2): If >20 events and last Haiku summary >7 days ago: triggers summary generation
8. Crawl feed widget refreshes on next dashboard visit (React Query refetch)
```

### 3.3 Viewing the Crawler Feed

```
1. User visits /dashboard (or AI Readiness page)
2. CrawlerFeedWidget loads via GET /api/analytics/crawler-feed?business_id=...&days=30
3. Widget renders: table of bot activity (bot icon, page path, crawl count, last seen date)
4. User filters by bot: dropdown filters table to single bot (e.g., "GPTBot only")
5. User filters by time range: 7d / 30d / 90d segmented control
6. UncrawledPagesAlert appears below table if important pages have zero crawl events
7. User clicks a page path row: expands row to show per-bot breakdown for that page
```

### 3.4 Error Path — No Cloudflare Integration

```
1. User is on Pro/Business tier but has not connected Cloudflare
2. CrawlerFeedWidget renders in "integration required" empty state
3. Shows explanation: "AI crawler detection requires Cloudflare. Without it, we cannot detect bot activity."
4. Shows CTA: "Connect Cloudflare" → links to settings integrations tab
5. No API call is made to the crawler-feed endpoint if no integration exists
```

---

## 4. Data Model

### 4.1 `ai_crawler_events`

New table. One row per (business, bot, page_path, day). Aggregated daily — not per-request log entries.

```sql
CREATE TABLE ai_crawler_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_name      text        NOT NULL,
  user_agent    text        NOT NULL,
  page_path     text        NOT NULL,
  crawl_count   integer     NOT NULL DEFAULT 1,
  source        text        NOT NULL CHECK (source IN ('cloudflare', 'vercel')),
  window_start  date        NOT NULL,
  window_end    date        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT NOW(),

  UNIQUE (business_id, bot_name, page_path, window_start)
);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business whose site was crawled |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Row owner for RLS |
| bot_name | text | NOT NULL | Human-readable bot name: 'GPTBot', 'ClaudeBot', 'Google-Extended', etc. |
| user_agent | text | NOT NULL | Raw user-agent string from Cloudflare logs |
| page_path | text | NOT NULL | URL path crawled — e.g., '/services', '/about' — stripped of query string |
| crawl_count | integer | NOT NULL DEFAULT 1 | Number of requests aggregated into this window row |
| source | text | NOT NULL | CHECK IN ('cloudflare', 'vercel') |
| window_start | date | NOT NULL | Start of the aggregation window (daily = same as window_end) |
| window_end | date | NOT NULL | End of the aggregation window |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Row insertion timestamp |

**Indexes:**

```sql
-- Primary query: all events for a business sorted by recency
CREATE INDEX idx_crawler_events_biz_date
  ON ai_crawler_events (business_id, window_start DESC);

-- Bot-specific queries: "show me all GPTBot activity"
CREATE INDEX idx_crawler_events_bot
  ON ai_crawler_events (business_id, bot_name, window_start DESC);

-- Unique constraint doubles as index for upsert conflict target
-- UNIQUE (business_id, bot_name, page_path, window_start)
```

**RLS Policies:**

```sql
ALTER TABLE ai_crawler_events ENABLE ROW LEVEL SECURITY;

-- Users can only read their own business's events
CREATE POLICY "Users read own crawler events"
  ON ai_crawler_events FOR SELECT
  USING (user_id = auth.uid());

-- Service role inserts only (Inngest job)
-- No INSERT policy for authenticated role — all writes go through service role
```

### 4.2 No changes to `integrations` table

The `integrations` table already supports Cloudflare via `provider = 'cloudflare'` and `config jsonb` storing `{ zone_id, api_token }`. No schema changes needed.

---

## 5. Bot Detection Constants

New file: `src/constants/ai-bots.ts`

This file is the single source of truth for all AI bot detection. It must be updated as new AI products release their crawlers. Schedule a quarterly engineering review.

```typescript
export interface AiBot {
  name: string;           // Display name in UI
  userAgentPattern: RegExp; // Used to match raw user-agent strings from logs
  engine: string;         // Associated AI engine name
  crawlPurpose: string;   // Why this bot crawls (for UI tooltip)
}

export const AI_BOTS: AiBot[] = [
  {
    name: 'GPTBot',
    userAgentPattern: /GPTBot/i,
    engine: 'ChatGPT / OpenAI',
    crawlPurpose: 'Web crawling for OpenAI training and retrieval',
  },
  {
    name: 'ClaudeBot',
    userAgentPattern: /ClaudeBot/i,
    engine: 'Claude / Anthropic',
    crawlPurpose: 'Web crawling for Anthropic training and retrieval',
  },
  {
    name: 'Google-Extended',
    userAgentPattern: /Google-Extended/i,
    engine: 'Gemini / Google AI',
    crawlPurpose: 'Crawling for Gemini and Google AI products',
  },
  {
    name: 'PerplexityBot',
    userAgentPattern: /PerplexityBot/i,
    engine: 'Perplexity',
    crawlPurpose: 'Crawling for Perplexity search index',
  },
  {
    name: 'Bytespider',
    userAgentPattern: /Bytespider/i,
    engine: 'ByteDance / TikTok AI',
    crawlPurpose: 'Crawling for ByteDance AI training data',
  },
  {
    name: 'CCBot',
    userAgentPattern: /CCBot/i,
    engine: 'Common Crawl',
    crawlPurpose: 'Training data crawl used by many AI models',
  },
  {
    name: 'YouBot',
    userAgentPattern: /YouBot/i,
    engine: 'You.com',
    crawlPurpose: 'Crawling for You.com AI search index',
  },
  {
    name: 'Meta-ExternalAgent',
    userAgentPattern: /Meta-ExternalAgent/i,
    engine: 'Meta AI',
    crawlPurpose: 'Crawling for Meta AI products',
  },
  {
    name: 'Cohere-AI',
    userAgentPattern: /cohere-ai/i,
    engine: 'Cohere',
    crawlPurpose: 'Crawling for Cohere AI retrieval',
  },
  {
    name: 'iAskSpider',
    userAgentPattern: /iAskSpider/i,
    engine: 'iAsk.ai',
    crawlPurpose: 'Crawling for iAsk AI search',
  },
];

// Helper: match a raw user-agent string to a known AI bot
export function matchAiBot(userAgent: string): AiBot | null {
  return AI_BOTS.find((bot) => bot.userAgentPattern.test(userAgent)) ?? null;
}
```

---

## 6. Inngest Background Job

### 6.1 `cron.crawler-feed-sync`

**Trigger:** Daily cron — `"0 3 * * *"` (3am UTC)

**Concurrency:** Max 10 concurrent business syncs. Cloudflare API allows 1,200 GraphQL requests per 5 minutes per zone — no rate limit risk at current scale.

**Error handling:** Each business syncs in isolation. One business failure does not abort others. Failed businesses are logged with `step.sendEvent('crawler-feed.sync-failed', { business_id, error })` for monitoring.

**Steps:**

```
Step 1 — find-active-integrations
  Query: SELECT i.id, i.business_id, i.config, b.user_id
    FROM integrations i
    JOIN businesses b ON b.id = i.business_id
    WHERE i.provider = 'cloudflare'
      AND i.status = 'active'
  Returns: array of { integrationId, businessId, userId, config: { zone_id, api_token } }

Step 2 — fan-out-per-business
  For each integration from Step 1:
    Send Inngest event: crawler-feed/business.sync
    Payload: { integrationId, businessId, userId, zoneId, apiToken }
  This creates one child job per business, running in parallel.

[Child job: crawler-feed/business.sync]

Step 3 — poll-cloudflare-graphql
  Call Cloudflare Analytics GraphQL API:
    Endpoint: https://api.cloudflare.com/client/v4/graphql
    Query: httpRequestsAdaptiveGroups for yesterday's date range
    Fields: clientRequestPath, userAgent, SUM(visits)
    Filter: date = yesterday, zoneTag = config.zone_id
    Auth: Authorization: Bearer config.api_token

Step 4 — filter-ai-bots
  For each row in Step 3 response:
    Call matchAiBot(row.userAgent) from src/constants/ai-bots.ts
    If match found: keep row with { botName: match.name, rawUserAgent: row.userAgent }
    If no match: discard row

Step 5 — aggregate-by-page
  Group filtered rows by (botName, clientRequestPath)
  Compute: crawlCount = SUM(visits) for each group
  Strip query strings from page paths: new URL('https://x.com' + path).pathname

Step 6 — upsert-events
  For each aggregated row:
    UPSERT INTO ai_crawler_events:
      ON CONFLICT (business_id, bot_name, page_path, window_start)
      DO UPDATE SET crawl_count = crawl_count + EXCLUDED.crawl_count
    Values: businessId, userId, botName, rawUserAgent, pagePath, crawlCount,
            source='cloudflare', windowStart=yesterday, windowEnd=yesterday

Step 7 — check-summary-eligibility (Phase 2 only)
  Count recent events: SELECT count(*) FROM ai_crawler_events
    WHERE business_id = :businessId AND window_start >= NOW() - INTERVAL '30 days'
  If count >= 20:
    Check last notification for this business with type='crawler_summary'
    If no notification in last 7 days: trigger haiku-summary job
```

### 6.2 `crawler-feed/backfill` (one-time, on integration connect)

Triggered by `integration.cloudflare.connected` event. Same steps as the daily sync but with a 30-day date range instead of yesterday only. Runs once when a user first connects Cloudflare.

---

## 7. Cloudflare Analytics API Adapter

Encapsulate all Cloudflare API interaction in a single adapter module at `src/lib/integrations/cloudflare-analytics.ts`. This isolates the external API surface and makes it easy to swap or update when Cloudflare changes their GraphQL schema.

**GraphQL query template:**

```graphql
query CrawlerFeed($zoneTag: String!, $dateStart: Date!, $dateEnd: Date!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(
        filter: { date_geq: $dateStart, date_leq: $dateEnd }
        limit: 10000
        orderBy: [count_DESC]
      ) {
        dimensions {
          clientRequestPath
          userAgent
        }
        sum {
          visits
        }
      }
    }
  }
}
```

**Adapter function signature:**

```typescript
interface CloudflareRequestRow {
  clientRequestPath: string;
  userAgent: string;
  visits: number;
}

async function fetchBotTrafficFromCloudflare(
  zoneId: string,
  apiToken: string,
  dateStart: string,   // YYYY-MM-DD
  dateEnd: string,     // YYYY-MM-DD
): Promise<CloudflareRequestRow[]>
```

Throws `CloudflareAdapterError` with `{ code, message }` on API failure. The Inngest step wraps this in try/catch and logs the error without aborting the entire batch.

---

## 8. Optional Haiku Summary Pipeline

Gated condition: `crawl_event_count >= 20` AND `last_summary_notification_at < NOW() - INTERVAL '7 days'`

**Haiku prompt:**

```
System: You are an AI visibility analyst for a local business platform.

User: A business has the following AI crawler activity over the past 30 days:
{JSON summary of top 10 bot/page combinations with crawl counts}

In 2-3 sentences, explain:
1. Which AI engines are actively indexing this site
2. Which important page(s) are being missed by AI crawlers
3. One specific action the business owner can take to improve crawler coverage

Keep the language simple and direct. No technical jargon. Speak as if advising the business owner directly.
```

Output is stored as a notification row: `type = 'crawler_summary'`, `body = haiku_output`, `business_id = businessId`.

Cost: ~$0.002 per summary call. At 1,000 businesses: $2/month. Negligible.

---

## 9. API Routes

### `GET /api/analytics/crawler-feed`

**Auth:** Required (Supabase session). User must own the requested business.

**Query params (Zod schema):**

```typescript
const CrawlerFeedQuerySchema = z.object({
  business_id: z.string().uuid(),
  days:        z.enum(['7', '30', '90']).default('30'),
  bot:         z.string().optional(),   // filter to specific bot_name
});
```

**Logic:**
1. Verify `auth.uid()` owns `business_id` (JOIN businesses WHERE user_id = auth.uid())
2. Verify business is on Pro or Business tier (JOIN subscriptions WHERE plan_tier IN ('pro', 'business'))
3. If not Pro+: return 403 with `{ error: 'upgrade_required', tier: 'pro' }`
4. Check for active Cloudflare integration. If none: return 200 with `{ data: [], integrationRequired: true }`
5. Query `ai_crawler_events` with date filter and optional bot filter
6. Group by `page_path`: aggregate total `crawl_count`, list distinct bots that visited

**Response shape:**

```typescript
{
  data: {
    events: Array<{
      pagePath: string;
      totalCrawlCount: number;
      bots: Array<{
        botName: string;
        crawlCount: number;
        lastSeen: string;        // ISO date string
        engine: string;          // from AI_BOTS constant
      }>;
      lastCrawledAt: string;     // most recent window_start across all bots
    }>;
    summary: {
      totalBotsDetected: number;
      mostActiveBot: string | null;
      mostCrawledPage: string | null;
      uncrawledImportantPages: string[];  // pages with zero crawl events (requires sitemap — deferred)
    };
    integrationRequired: boolean;
    cachedAt: string;            // window_start of most recent event
  }
}
```

**Error responses:**
- `400` — invalid query params (Zod failure)
- `401` — not authenticated
- `403` — business not owned by user, or tier check failed
- `500` — database error

---

## 10. UI Components

All components live under `src/components/analytics/crawler/`.

### `CrawlerFeedWidget`

**Props:**
```typescript
interface CrawlerFeedWidgetProps {
  businessId: string;
}
```

**Behavior:**
- Fetches data from `GET /api/analytics/crawler-feed` via React Query
- Shows loading skeleton while fetching (3 rows)
- If `integrationRequired: true`: renders `CrawlerIntegrationCTA`
- Renders `CrawlerFeedTable` and `UncrawledPagesAlert`
- Filter controls: `BotFilterDropdown` (All / individual bots), `TimeRangeSegment` (7d / 30d / 90d)
- RTL: entire widget container uses `dir="auto"` — column order mirrors in RTL mode

### `CrawlerFeedTable`

**Props:**
```typescript
interface CrawlerFeedTableProps {
  events: CrawlerEvent[];
  isLoading: boolean;
}
```

**Columns:** Page Path | Bots | Total Crawls | Last Crawled

- Each row is expandable: shows per-bot breakdown below the page path
- `CrawlerBotBadge` rendered for each bot in the "Bots" column
- Sortable by: Total Crawls (desc default), Last Crawled, Page Path
- RTL: column order reverses. Sort indicators (chevrons) mirror position.

### `CrawlerBotBadge`

**Props:**
```typescript
interface CrawlerBotBadgeProps {
  botName: string;
  lastSeen: string;    // ISO date
  variant: 'active' | 'stale' | 'never';
}
```

- `active` (seen in last 7 days): green badge with bot icon
- `stale` (seen 8-30 days ago): amber badge
- `never` (not in dataset): not rendered — omitted from list
- Shows bot name + engine association in tooltip
- RTL: badge layout (icon + text) mirrors in RTL mode

### `UncrawledPagesAlert`

**Props:**
```typescript
interface UncrawledPagesAlertProps {
  pages: string[];   // page paths with zero crawl events
}
```

- Renders only if `pages.length > 0`
- Amber callout card: "These pages have never been crawled by an AI bot"
- Lists up to 5 pages with path + "View in AI Readiness" link
- "+" overflow indicator for 6+ pages

### `CrawlerIntegrationCTA`

Shown in the empty state when no Cloudflare integration exists.

**Props:** `{ tier: 'pro' | 'business' }`

- Explains what the feature does in plain language
- Shows a "Connect Cloudflare" button → `/dashboard/settings?tab=integrations`
- If user is on Starter: shows upgrade prompt instead

---

## 11. Tier Gating

| Capability | Starter | Pro | Business |
|-----------|---------|-----|----------|
| AI Crawler Feed widget | No | Yes | Yes |
| Bot detection (all 10 bots) | No | Yes | Yes |
| Time range: 7d / 30d | No | Yes | Yes |
| Time range: 90d | No | No | Yes |
| Haiku weekly summary (Phase 2) | No | Yes | Yes |
| Vercel log drain source (Phase 2) | No | Yes | Yes |
| Uncrawled pages alert | No | Yes | Yes |

**Gate implementation:**
- API route returns `403 { error: 'upgrade_required', tier: 'pro' }` for Starter users
- Dashboard widget checks tier from the user's subscription context; renders `UpgradeGate` wrapper for Starter users
- UpgradeGate shows blurred preview of widget + upgrade CTA

---

## 12. Cost Impact

Source: `PRICING-IMPACT-ANALYSIS.md §1`

| Metric | Value |
|--------|-------|
| Marginal cost per business per month (core feature) | ~$0 |
| Optional Haiku weekly summary (Phase 2) | ~$0.02/month |
| Infrastructure cost (Cloudflare API polling) | $0 — within free API tier |
| Tier gate | Pro and Business |
| Build priority | Medium |
| Build verdict from Axiom analysis | Build — high wow factor, low cost |

**Cost narrative:** The core AI Crawler Feed is zero-cost — it reads from Cloudflare's API, which is free within normal usage limits, and all aggregation runs in Inngest with no LLM calls. The optional Haiku narrative summary (Phase 2, 1 call per business per week) adds approximately $0.02/business/month — negligible at any scale. At 1,000 Pro businesses with summaries enabled: $20/month total. This feature is the best cost/value ratio in the Batch 1 feature set.

---

## 13. Engineering Notes

**Build effort:** 3-4 weeks total.

| Week | Work |
|------|------|
| 1 | `ai_crawler_events` table + migration, Cloudflare Analytics adapter (`src/lib/integrations/cloudflare-analytics.ts`), `src/constants/ai-bots.ts` |
| 2 | Inngest job skeleton: `cron.crawler-feed-sync` — fan-out, Cloudflare polling, bot filtering, aggregation |
| 3 | Upsert logic, API route (`GET /api/analytics/crawler-feed`), `CrawlerFeedWidget` + `CrawlerFeedTable` |
| 4 | `UncrawledPagesAlert`, `CrawlerBotBadge`, RTL testing, tier gating, empty states |
| Phase 2 | Haiku summary pipeline, Vercel log drain endpoint, multi-source merging |

**Build order dependency:** None within this feature. Independent of F2, F3, F4. Can be built in parallel with other Batch 1 features after the database migration is applied.

**Risks:**

| Risk | Mitigation |
|------|-----------|
| Cloudflare GraphQL schema changes without notice | Wrap all API calls in typed adapter with integration test. Schema version-pin where supported. |
| Users without Cloudflare have zero data | Empty state clearly explains the requirement. CTA to connect Cloudflare. Do not show widget as broken — show it as requiring setup. |
| Bot user-agent strings change or new bots emerge | `ai-bots.ts` is a plain constant file. A PR can add a new bot pattern in 5 minutes with no schema changes. Quarterly review cadence. |
| Cloudflare aggregates at 1-minute resolution | Acceptable for daily aggregation. We are not building per-request precision — daily crawl counts are sufficient for the use case. |
| Low Cloudflare adoption among SMBs | Feature value is still high for the subset of Pro users on Cloudflare. Vercel log drain (Phase 2) expands reach. Track integration adoption metric after launch. |

**Dependencies:**
- `integrations` table with `provider = 'cloudflare'` (already exists)
- Inngest (already configured)
- Supabase service role client (already configured for Inngest jobs)
- No new npm packages required

**Migration file:** `supabase/migrations/YYYYMMDDHHMMSS_ai_crawler_events.sql`

Apply via Supabase SQL Editor before deploying the Inngest job. The Inngest job will fail silently if the table does not exist.
