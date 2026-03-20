# Beamix — Web Mention Tracking Technical Spec

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Ready for implementation
> **Audience:** Engineers adding web mention tracking to the scan pipeline and dashboard. You should be able to implement this feature end-to-end without reading any other document.
> **Source docs:** `docs/04-features/specs/scan-engine-spec.md`, `docs/01-foundation/PRODUCT_SPECIFICATION.md`, `docs/04-features/specs/alert-workflow-spec.md`

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

Web mention tracking answers a question that business owners care about deeply: "Who is talking about my business online, and what are they saying?" Specifically in the context of AI search — when Perplexity, ChatGPT, or Gemini cites sources for their answers, those cited pages are the real-world content that shapes AI visibility. Tracking those citations, and tracking new web mentions before they surface in AI results, gives Beamix users early-warning intelligence.

**What it does:** After every AI engine scan completes, a new pipeline step queries Perplexity Sonar to discover web pages that mention the business by name. Newly discovered mentions are saved to the existing `citation_sources` table. For Pro and Business users, a Haiku sentiment pass rates each new mention (0-100). Negative-sentiment mentions trigger alert events that flow into the existing alert workflow.

**Why this matters:** Citation Builder is one of Beamix's core agents — it creates content to get the business cited in more places. But without knowing where the business is currently mentioned (or not mentioned), the agent has no baseline to work from. Web mention tracking provides that baseline and tracks improvement over time. It also closes a retention loop: users see new mentions appear on their dashboard, which proves Beamix is actively monitoring their online presence.

**This is not a separate Inngest function.** Web mention tracking is a step added to the existing `scan.scheduled` and `scan.manual` Inngest functions. It runs after AI engine scan steps complete. It shares the same scan lifecycle, retry policy, and observability.

---

## 2. Scope and Boundaries

### In Scope — Phase 1 (Launch)

| Item | Notes |
|------|-------|
| New step in `scan.scheduled` and `scan.manual` Inngest functions | After AI engines complete |
| Perplexity Sonar citation search per scan | Number of query variants by tier |
| Haiku sentiment scoring for new mentions | Pro and Business only |
| Upsert to `citation_sources` table with new columns | No new table |
| `alert/new-web-mentions` Inngest event on negative sentiment | Pro+: negative only, Business: all |
| `GET /api/dashboard/web-mentions` API route | With businessId, since, limit params |
| "Web Mentions This Month" dashboard widget | Overview page, below the fold |
| Hebrew business name support for Israeli users | Submits HE name variant when `preferred_language = 'he'` |

### In Scope — Phase 2 (Growth)

| Item | Notes |
|------|-------|
| Competitor mention tracking | Compare competitor citation counts vs own |
| Source authority scoring | Domain authority estimation for cited sources |
| Mention trend chart (30/60/90 day) | Sparkline in dashboard widget |
| Email digest: weekly mention summary | New mentions in the weekly digest email |

### Explicitly Deferred

| Item | Reason |
|------|--------|
| Bing News / Google News monitoring | Different data source; Phase 3 |
| Social media mention tracking | Requires separate social API integrations |
| Review site monitoring (Google Business, Yelp) | Requires review-site-specific APIs; Phase 3 |
| Real-time mention alerts (push notifications) | Phase 2 — alert email is sufficient for Phase 1 |

### Out of Scope

- Re-scraping the content of the cited page (we store the URL and domain, not the full article text)
- Changing how the AI engine scan itself works (this feature adds a step after the scan, not during it)
- The Citation Builder agent (A9) — that agent uses this data as input but is a separate system

---

## 3. User Flows

### 3.1 Mention Discovered During Scheduled Scan

```
1. scan.scheduled.run completes the AI engine scan steps
2. New step: web.mentions.collect begins
3. Pipeline builds query variants from business profile (name, city, industry)
4. Queries sent to Perplexity Sonar (1, 2, or 4 variants based on tier)
5. Perplexity returns response with cited source URLs in source blocks
6. Pipeline parses cited URLs from Perplexity source data
7. Deduplication check: compare against existing citation_sources rows for this business
8. For each new mention:
   a. If Pro or Business: Haiku sentiment pass (returns 0-100 score)
   b. Upsert to citation_sources (mention_type='web_mention', first_detected_at=NOW())
9. For existing mentions: update last_seen_at only
10. If negative sentiment detected (score < 35) AND user tier >= Pro:
    Fire Inngest event alert/new-web-mentions with { business_id, mentions: [...negative ones] }
11. For Business tier: fire alert event for ALL new mentions (positive and negative)
12. scan.scheduled.run marks scan completed
```

### 3.2 User Views Dashboard — Sees New Mention

```
1. User visits /dashboard (overview page)
2. WebMentionsWidget loads via GET /api/dashboard/web-mentions?businessId=...&since=30d&limit=10
3. Widget shows: count of mentions this month, breakdown by type, 3 most recent mentions
4. User sees a new mention they hadn't seen before
5. Clicks mention: opens the source URL in a new tab (no in-app detail page in Phase 1)
6. Widget includes CTA: "Boost your citations with Citation Builder →" links to agent A9
```

### 3.3 Negative Mention Alert Flow

```
1. Haiku scores a new mention at 22/100 (negative)
2. Web mention tracking step fires: inngest.send('alert/new-web-mentions', { businessId, mentions })
3. Existing alert workflow processes the event (see alert-workflow-spec.md for downstream handling)
4. User receives notification per their notification preferences
5. Dashboard alert badge increments
```

### 3.4 Starter User — Limited Coverage

```
1. Starter user's monthly scan runs (scan.scheduled cadence: monthly)
2. Web mention step runs with 1 Perplexity query variant
3. Results saved to citation_sources without sentiment scoring
4. No alert events fired
5. Dashboard widget shows count only, no sentiment data, no alerts
6. CTA in widget: "Upgrade to Pro for sentiment analysis and instant alerts →"
```

---

## 4. Data Model

### 4.1 Additions to `citation_sources` (Existing Table)

No new table. Four new columns added to the existing `citation_sources` table.

```sql
-- Migration: extend citation_sources for web mention tracking
ALTER TABLE citation_sources
  ADD COLUMN IF NOT EXISTS mention_type TEXT
    NOT NULL DEFAULT 'ai_citation'
    CHECK (mention_type IN ('ai_citation', 'web_mention', 'directory', 'review_site'));

ALTER TABLE citation_sources
  ADD COLUMN IF NOT EXISTS first_detected_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW();

ALTER TABLE citation_sources
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW();

ALTER TABLE citation_sources
  ADD COLUMN IF NOT EXISTS mention_sentiment INTEGER
    CHECK (mention_sentiment BETWEEN 0 AND 100);  -- NULL for Starter; 0-100 for Pro+

-- Index for the primary dashboard query: all web mentions for a business, recent first
CREATE INDEX IF NOT EXISTS idx_citation_sources_business_type
  ON citation_sources(business_id, mention_type, first_detected_at DESC);

-- Index for alert evaluation: recent negative mentions
CREATE INDEX IF NOT EXISTS idx_citation_sources_sentiment
  ON citation_sources(business_id, mention_sentiment, last_seen_at DESC)
  WHERE mention_sentiment IS NOT NULL;

-- Comment each column for schema clarity
COMMENT ON COLUMN citation_sources.mention_type IS
  'How this citation was sourced: ai_citation = appeared in AI response, web_mention = found via Perplexity web search';

COMMENT ON COLUMN citation_sources.first_detected_at IS
  'When Beamix first discovered this mention';

COMMENT ON COLUMN citation_sources.last_seen_at IS
  'Last time a scan confirmed this mention still exists';

COMMENT ON COLUMN citation_sources.mention_sentiment IS
  'Haiku-scored sentiment 0-100 (0=very negative, 100=very positive). NULL if tier does not include sentiment.';
```

**Why no new table:** `citation_sources` already exists to track where a business is cited in AI responses. Web mentions are the same concept at a different layer — they are web pages that mention the business, which later get picked up by AI engines and become citations. Reusing the table with a `mention_type` column avoids a join and keeps the data model coherent.

**Backfill:** Existing `citation_sources` rows have `mention_type = 'ai_citation'` (the DEFAULT). No backfill query needed — the DEFAULT handles it.

### 4.2 Existing `citation_sources` Table Structure (Reference)

```
citation_sources
  id              uuid PK
  business_id     uuid FK → businesses(id)
  url             text NOT NULL
  domain          text NOT NULL           -- extracted from URL
  anchor_text     text                    -- text that linked to the business
  engine          text                    -- which AI engine cited this
  scan_id         uuid FK → scans(id)
  created_at      timestamptz

  -- NEW columns:
  mention_type    text    DEFAULT 'ai_citation'
  first_detected_at timestamptz DEFAULT NOW()
  last_seen_at    timestamptz DEFAULT NOW()
  mention_sentiment integer (nullable)
```

**Unique constraint:** Add a unique constraint on `(business_id, url)` if one does not exist. The upsert logic depends on this.

```sql
ALTER TABLE citation_sources
  ADD CONSTRAINT uq_citation_sources_business_url
  UNIQUE (business_id, url);
```

### 4.3 TypeScript Types

```typescript
// src/lib/types/web-mentions.ts

export interface WebMention {
  id: string;
  businessId: string;
  url: string;
  domain: string;
  mentionType: 'ai_citation' | 'web_mention' | 'directory' | 'review_site';
  mentionSentiment: number | null;  // 0-100, null for Starter
  firstDetectedAt: Date;
  lastSeenAt: Date;
}

export interface WebMentionSummary {
  totalThisMonth: number;
  newThisMonth: number;             // first_detected_at within last 30 days
  negativeCount: number;            // sentiment < 35, null counted as 0
  recentMentions: WebMention[];     // top 10 by first_detected_at DESC
}
```

---

## 5. Business Logic

### 5.1 Pipeline Overview

The web mention step runs after all AI engine steps complete within the scan function. It is synchronous within the Inngest step chain — the scan does not complete until mention tracking finishes.

```
[AI engine steps complete]
    ↓
[Build query variants by tier]             ~1ms
    ↓
[Perplexity Sonar calls (parallel)]        ~600ms per call
    ↓
[Parse cited URLs from Perplexity response]  ~5ms
    ↓
[Deduplication check vs existing rows]     ~20ms (1 DB query)
    ↓
[Haiku sentiment on new mentions (Pro+)]   ~300ms per batch
    ↓
[Upsert to citation_sources]               ~30ms
    ↓
[Fire alert events if negative/all (tier)] ~10ms (Inngest send)
    ↓
[Scan marked completed]
```

### 5.2 Query Variant Construction

Query variants are constructed from the business profile. More variants = broader web coverage.

**Base query template:**
```
"[business name] [city]"
"[business name] review"
"[business name] [industry] [city]"
"best [industry] in [city] [business name]"  -- checks if mentioned in "best of" content
```

**Variant count by tier:**
- Starter: 1 variant (base: `"[business name] [city]"`)
- Pro: 2 variants (base + review)
- Business: 4 variants (all four)

**Hebrew support:** When `user_profile.preferred_language = 'he'` (or `business.country = 'IL'`), submit the Hebrew business name in addition to English. If `businesses.name` is in Hebrew script, use it directly. If it is transliterated Latin, also construct a Hebrew-script version using the business name from the profile.

Example for an Israeli restaurant named "מסעדת יוסי":
- EN query: `"מסעדת יוסי תל אביב"` (the name is already Hebrew)
- No separate HE query needed — Perplexity handles Hebrew-script names correctly

For a business with an English name operating in Israel:
- EN query: `"Gordon Beach Cafe Tel Aviv"`
- HE query: `"גורדון ביץ' קפה תל אביב"` — construct via transliteration logic or skip if not available

### 5.3 Perplexity Sonar Request

```typescript
const response = await perplexity.chat.completions.create({
  model: 'sonar',
  messages: [
    {
      role: 'user',
      content: `Find web pages that mention "${query}".
List any pages, articles, reviews, or directories that mention this business.
Be thorough. Include review sites, local directories, news articles, and blog posts.`,
    }
  ],
  max_tokens: 400,
  temperature: 0.1,
  // Perplexity-specific: enable source citations
  // Source URLs come back in the response's citations array
});
```

**Parsing cited URLs:** Perplexity returns cited sources in `response.citations` (array of URLs). Parse these directly — do not parse the response text for URLs. The citations array is the structured output.

```typescript
function parseMentionsFromPerplexity(response: PerplexityResponse): string[] {
  // citations is an array of URL strings in the Perplexity API response
  return (response.citations ?? [])
    .filter(url => isValidUrl(url))
    .map(url => normalizeUrl(url));  // strip utm params, trailing slashes
}
```

### 5.4 Deduplication Logic

```typescript
async function deduplicateMentions(
  businessId: string,
  candidateUrls: string[]
): Promise<{ newUrls: string[]; existingUrls: string[] }> {
  const { data: existing } = await supabaseService
    .from('citation_sources')
    .select('url')
    .eq('business_id', businessId)
    .in('url', candidateUrls);

  const existingSet = new Set(existing?.map(r => r.url) ?? []);

  return {
    newUrls: candidateUrls.filter(url => !existingSet.has(url)),
    existingUrls: candidateUrls.filter(url => existingSet.has(url)),
  };
}
```

For existing mentions, update `last_seen_at` in bulk:
```sql
UPDATE citation_sources
SET last_seen_at = NOW()
WHERE business_id = $1 AND url = ANY($2::text[])
```

### 5.5 Haiku Sentiment Pass

Runs on new mentions only (not existing). Batches all new URLs into a single Haiku call.

```typescript
const SENTIMENT_PROMPT = `
You are a sentiment analyzer for business mentions.
Given these URLs and their associated text context, rate each mention's sentiment 0-100.
0 = extremely negative (scandal, fraud, serious complaints)
50 = neutral (directory listing, factual mention)
100 = extremely positive (glowing review, award mention)

For each URL, you only have the URL and domain — infer from context what you can.
Return JSON array: [{ url, sentiment }]

URLs to analyze:
{urls}
`;

async function scoreMentionSentiments(
  urls: string[]
): Promise<Map<string, number>> {
  if (urls.length === 0) return new Map();

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: SENTIMENT_PROMPT.replace('{urls}', urls.join('\n')),
    }],
  });

  const parsed = JSON.parse(extractJsonFromHaikuResponse(response)) as Array<{url: string; sentiment: number}>;
  return new Map(parsed.map(r => [r.url, r.sentiment]));
}
```

**Batch limit:** Process up to 20 new mentions per sentiment call. If more than 20 new mentions are discovered in a single scan (unusual), split into batches of 20.

**Error handling:** If Haiku sentiment call fails, write the mention with `mention_sentiment = NULL`. Do not block the scan. Log the failure for monitoring.

### 5.6 Upsert to `citation_sources`

```typescript
async function upsertMentions(
  businessId: string,
  scanId: string,
  newUrls: string[],
  sentimentMap: Map<string, number>
): Promise<void> {
  if (newUrls.length === 0) return;

  const rows = newUrls.map(url => ({
    business_id: businessId,
    scan_id: scanId,
    url,
    domain: extractDomain(url),
    mention_type: 'web_mention' as const,
    mention_sentiment: sentimentMap.get(url) ?? null,
    first_detected_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
  }));

  const { error } = await supabaseService
    .from('citation_sources')
    .upsert(rows, {
      onConflict: 'business_id,url',
      ignoreDuplicates: false,  // update last_seen_at on conflict
    });

  if (error) {
    throw new Error(`Failed to upsert web mentions: ${error.message}`);
  }
}
```

### 5.7 Alert Event Emission

```typescript
async function emitMentionAlerts(
  planTier: PlanTier,
  businessId: string,
  newMentions: Array<{ url: string; sentiment: number | null }>
): Promise<void> {
  if (planTier === null || planTier === 'starter') return; // no alerts for free/starter

  const mentionsToAlert = planTier === 'business'
    ? newMentions                                              // all new mentions
    : newMentions.filter(m => m.sentiment !== null && m.sentiment < 35); // negative only

  if (mentionsToAlert.length === 0) return;

  await inngest.send({
    name: 'alert/new-web-mentions',
    data: {
      businessId,
      mentions: mentionsToAlert,
      triggeredAt: new Date().toISOString(),
    },
  });
}
```

---

## 6. Inngest Jobs

### Existing Functions Modified

| Function | Change |
|----------|--------|
| `scan.manual.run` | Add web mention tracking step after AI engine steps |
| `scan.scheduled.run` | Add web mention tracking step after AI engine steps |

### Step Addition Pattern

```typescript
// Inside scan.manual.run and scan.scheduled.run — after all engine steps

const mentionResult = await step.run('web-mentions-collect', async () => {
  return collectWebMentions({
    businessId: event.data.businessId,
    scanId: scanId,
    planTier: subscription.plan_tier,
    businessName: business.name,
    city: business.city,
    country: business.country,
    industry: business.industry,
    preferredLanguage: userProfile.preferred_language,
  });
});

// Alert emission (separate step for observability and retry isolation)
if (mentionResult.newMentionsWithAlerts.length > 0) {
  await step.run('web-mentions-alerts', async () => {
    await emitMentionAlerts(subscription.plan_tier, event.data.businessId, mentionResult.newMentionsWithAlerts);
  });
}
```

**Why a separate step for alerts:** Separating the data collection step from the alert step means that if the alert emission fails, Inngest retries only the alert step — not the entire mention collection pipeline. This avoids re-running Perplexity calls on a retry.

### No New Inngest Functions

Web mention tracking does not have its own Inngest function, trigger, or cron. It runs as part of the existing scan lifecycle. The rationale: mentions are discovered in the context of a scan, they are timestamped to that scan, and they share the scan's retry policy. Creating a separate function would decouple the mention collection from the scan in a way that creates ordering issues (mentions could be collected before the scan's AI engine results are written, or scans could complete without mention tracking).

---

## 7. API Routes

### `GET /api/dashboard/web-mentions`

Returns the mention summary and recent mention list for a business. Used by the dashboard widget.

**Auth:** Required. User must own the business.

**Query parameters:**
```
businessId  string  required  UUID of the business
since       string  optional  '7d' | '30d' | '90d' — default '30d'
limit       number  optional  max 50, default 10
```

**Zod schema:**
```typescript
// src/lib/schemas/web-mentions.ts
import { z } from 'zod/v4';

export const WebMentionsQuerySchema = z.object({
  businessId: z.string().uuid(),
  since:      z.enum(['7d', '30d', '90d']).optional().default('30d'),
  limit:      z.coerce.number().min(1).max(50).optional().default(10),
});
```

**Handler:**
```typescript
// src/app/api/dashboard/web-mentions/route.ts

export async function GET(request: Request): Promise<Response> {
  const { user } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parsed = WebMentionsQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { businessId, since, limit } = parsed.data;

  // Verify ownership
  const owned = await verifyBusinessOwnership(user.id, businessId);
  if (!owned) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const sinceDate = getSinceDate(since); // converts '30d' to Date object

  // Single query: counts + recent mentions
  const { data: mentions, error } = await supabase
    .from('citation_sources')
    .select('id, url, domain, mention_type, mention_sentiment, first_detected_at, last_seen_at')
    .eq('business_id', businessId)
    .eq('mention_type', 'web_mention')
    .gte('first_detected_at', sinceDate.toISOString())
    .order('first_detected_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch mentions' }, { status: 500 });
  }

  // Counts from a separate aggregate query
  const { data: countData } = await supabase
    .rpc('get_web_mention_summary', { p_business_id: businessId, p_since: sinceDate.toISOString() });

  return NextResponse.json({
    mentions: mentions ?? [],
    summary: countData ?? { totalThisMonth: 0, newThisMonth: 0, negativeCount: 0 },
  });
}
```

**Create the RPC:**
```sql
CREATE OR REPLACE FUNCTION get_web_mention_summary(
  p_business_id UUID,
  p_since TIMESTAMPTZ
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalThisMonth',  COUNT(*),
    'newThisMonth',    COUNT(*) FILTER (WHERE first_detected_at >= p_since),
    'negativeCount',   COUNT(*) FILTER (WHERE mention_sentiment < 35 AND mention_sentiment IS NOT NULL)
  ) INTO result
  FROM citation_sources
  WHERE business_id = p_business_id
    AND mention_type = 'web_mention'
    AND first_detected_at >= p_since;

  RETURN result;
END;
$$;
```

**Success response (200):**
```json
{
  "mentions": [
    {
      "id": "uuid",
      "url": "https://reshet13.co.il/article/best-restaurants-tlv",
      "domain": "reshet13.co.il",
      "mentionType": "web_mention",
      "mentionSentiment": 82,
      "firstDetectedAt": "2026-03-05T14:22:00Z",
      "lastSeenAt": "2026-03-08T09:15:00Z"
    }
  ],
  "summary": {
    "totalThisMonth": 14,
    "newThisMonth": 3,
    "negativeCount": 1
  }
}
```

**Error responses:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid query parameters |
| 401 | Not authenticated |
| 403 | User does not own this business |
| 500 | DB query failed |

---

## 8. UI Components

### 8.1 `WebMentionsWidget`

**File:** `src/components/dashboard/web-mentions-widget.tsx`

**Purpose:** Summary widget on the `/dashboard` overview page showing mention counts, sentiment breakdown, and recent mentions.

**Props:**
```typescript
interface WebMentionsWidgetProps {
  businessId: string;
  planTier: PlanTier;
}
```

**Data fetching:** Uses `useSWR` or React Query to call `GET /api/dashboard/web-mentions`. Auto-refreshes every 5 minutes (mentions are not real-time — they update on scan completion, not more frequently).

**Layout:**
```
┌──────────────────────────────────────────────┐
│ Web Mentions This Month              [14 ↑3] │
│                                              │
│ New this month: 3  |  Negative: 1           │
│                                              │
│ • reshet13.co.il — positive · 3 days ago    │
│ • timeout.co.il — neutral · 5 days ago      │
│ • yelp.com — negative · 6 days ago          │
│                                              │
│ [Boost your citations with Citation Builder]│
└──────────────────────────────────────────────┘
```

**Tier-aware rendering:**
- If `planTier === null || planTier === 'starter'`: hide sentiment badges. Show count only. Show upgrade CTA.
- If `planTier === 'pro' || planTier === 'business'`: show sentiment badges + negative count.

**Sentiment badge colors:**
- Score 70-100: green "Positive"
- Score 35-69: gray "Neutral"
- Score 0-34: red "Negative"
- Score null (Starter): no badge

**Empty state:** "No web mentions found yet. Mentions appear after your next scheduled scan." If the user is on a monthly cadence (Starter), note when the next scan is.

**RTL:** Container uses `dir` attribute from language context. Mention list items use `flex-row-reverse` in RTL mode. "3 days ago" becomes "לפני 3 ימים" via i18n. The full widget layout adapts naturally with RTL CSS.

### 8.2 `MentionRow`

**File:** `src/components/dashboard/mention-row.tsx`

**Purpose:** Single row in the WebMentionsWidget mention list.

**Props:**
```typescript
interface MentionRowProps {
  mention: WebMention;
  showSentiment: boolean;   // false for Starter
}
```

**Rendering:** Domain name as primary text (not full URL — too long). Sentiment badge if `showSentiment`. "X days ago" as secondary text. Entire row is a link that opens `mention.url` in a new tab.

### 8.3 Upgrade CTA Within Widget

For Starter users, the widget includes an inline upgrade prompt below the mention count: "Get sentiment analysis and instant alerts on Pro." Links to `/pricing`. This is not a modal — it is a one-line text link within the widget card. Low friction, not intrusive.

---

## 9. Tier Gating

| Tier | Query Variants | Scan Cadence | Sentiment Scoring | Alerts | Notes |
|------|---------------|-------------|-------------------|--------|-------|
| Free (no subscription) | 0 | None | No | No | No scheduled scans; no mention tracking |
| Starter | 1 | Monthly | No | No | Count only; no sentiment data |
| Pro | 2 | Weekly | Yes | Negative only (score < 35) | Core value proposition |
| Business | 4 | Daily | Yes | All new mentions | Maximum coverage |

**Gate enforcement location:** Inside the `collectWebMentions` function in the scan pipeline, gated by `subscription.plan_tier`. This is not enforced at the API layer — the dashboard API route returns whatever data exists in the DB, and the UI renders tier-appropriately based on the `planTier` prop.

**Upgrade nudge triggers:**
- Starter user sees widget: "Upgrade to Pro for sentiment analysis and instant negative mention alerts"
- Shown inline in the widget, not as a banner or modal

---

## 10. Cost Impact

All costs below are per-user per month, assuming the scan cadences by tier.

### Starter ($49/month)

- 1 scan/month × 1 Perplexity query = 1 Perplexity Sonar call/month
- No Haiku (no sentiment)
- Perplexity Sonar: ~$0.015/call × 1 = **$0.015/month**
- Total web mention cost per Starter user: **~$0.02/month**

### Pro ($149/month)

- ~4 scans/month (weekly cadence) × 2 query variants = 8 Perplexity calls
- Haiku sentiment on new mentions (~5 new/scan average = 20 new mentions/month)
- Perplexity: $0.015 × 8 = $0.12
- Haiku: 20 mentions × $0.001 = $0.02
- **Total per Pro user: ~$0.14/month**

### Business ($349/month)

- ~30 scans/month (daily cadence) × 4 query variants = 120 Perplexity calls
- Haiku sentiment on new mentions (~3 new/scan average = 90 new mentions/month)
- Perplexity: $0.015 × 120 = $1.80
- Haiku: 90 × $0.001 = $0.09
- **Total per Business user: ~$1.89/month**
- As % of Business revenue: 1.89 / 349 = **0.54%** — negligible

### Monthly Platform Estimate (500 users total)

Assuming 60% Starter, 30% Pro, 10% Business:
- 300 Starter × $0.02 = $6
- 150 Pro × $0.14 = $21
- 50 Business × $1.89 = $95
- **Total: ~$122/month** for web mention tracking infrastructure

This is well within budget with no cost gates required.

---

## 11. Engineering Notes

### Build Order

1. Run migration: add new columns to `citation_sources` + `uq_citation_sources_business_url` constraint
2. Create `get_web_mention_summary` SQL function in Supabase
3. Build `src/lib/web-mentions/perplexity-searcher.ts` — query construction + Perplexity call + URL parsing
4. Build `src/lib/web-mentions/deduplicator.ts` — dedup logic + `last_seen_at` update
5. Build `src/lib/web-mentions/haiku-sentiment.ts` — batch sentiment scoring
6. Build `src/lib/web-mentions/upsert-mentions.ts` — upsert to `citation_sources`
7. Build `src/lib/web-mentions/collect-web-mentions.ts` — orchestrates the pipeline
8. Add web mention step to `scan.manual.run` and `scan.scheduled.run` Inngest functions
9. Build `GET /api/dashboard/web-mentions` API route
10. Build `WebMentionsWidget`, `MentionRow` components
11. Wire widget into `/dashboard` overview page
12. Integration test: run a manual scan end-to-end and verify mentions appear in widget

### Estimated Effort

**1-2 weeks** for one engineer.
- Day 1-2: Pipeline (Perplexity + dedup + Haiku + upsert) and Inngest integration
- Day 3: API route
- Day 4-5: UI components + dashboard integration
- Day 6: RTL testing, edge cases (0 results, Perplexity timeout), integration test

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Perplexity citations array is empty for some queries | Medium | No new mentions discovered | Log; this is expected behavior, not an error |
| Haiku misclassifies neutral mentions as negative | Low | False alert to user | Threshold set conservatively at <35 (not <50) |
| Large number of new mentions for a well-known business | Low | Haiku batch cost spike | Cap at 20 per batch; process in batches if more |
| `citation_sources` unique constraint missing | Medium | Upsert creates duplicates | Add constraint in migration; check before writing code |
| Adding mention steps increases scan duration noticeably | Medium | User experience | Perplexity calls are ~600ms each; 4 variants in parallel = ~700ms total. Acceptable. |

### Key Files to Create or Modify

```
CREATE src/lib/web-mentions/perplexity-searcher.ts
CREATE src/lib/web-mentions/deduplicator.ts
CREATE src/lib/web-mentions/haiku-sentiment.ts
CREATE src/lib/web-mentions/upsert-mentions.ts
CREATE src/lib/web-mentions/collect-web-mentions.ts
CREATE src/lib/schemas/web-mentions.ts
CREATE src/lib/types/web-mentions.ts
CREATE src/app/api/dashboard/web-mentions/route.ts
CREATE src/components/dashboard/web-mentions-widget.tsx
CREATE src/components/dashboard/mention-row.tsx
MODIFY src/inngest/functions/scan-manual.ts       (add web mention step)
MODIFY src/inngest/functions/scan-scheduled.ts    (add web mention step)
CREATE supabase/migrations/[timestamp]_web_mention_columns.sql
```

### Testing Checklist

- [ ] New columns exist in `citation_sources` with correct CHECK constraints
- [ ] `uq_citation_sources_business_url` unique constraint exists
- [ ] Deduplication: second scan does not create duplicate rows for same URL
- [ ] `last_seen_at` updates on existing mentions (not `first_detected_at`)
- [ ] Starter scan: no sentiment scoring, no alert events fired
- [ ] Pro scan: sentiment scored, negative mentions (<35) trigger alert event
- [ ] Business scan: ALL new mentions trigger alert event
- [ ] `alert/new-web-mentions` Inngest event emitted with correct payload shape
- [ ] `GET /api/dashboard/web-mentions` returns 403 for business not owned by user
- [ ] API returns correct `summary.negativeCount` for a business with mixed mentions
- [ ] WebMentionsWidget renders empty state when `mentions.length === 0`
- [ ] Sentiment badges absent for Starter tier; present for Pro+
- [ ] Widget RTL layout correct in Hebrew mode
- [ ] Perplexity timeout (<600ms budget exceeded) does not fail the scan — step continues
