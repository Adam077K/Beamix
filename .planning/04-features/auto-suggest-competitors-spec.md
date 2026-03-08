# Beamix — Auto-Suggest Competitors Technical Spec

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Ready for implementation
> **Audience:** Engineers building the onboarding competitor suggestion flow. You should be able to implement this feature end-to-end without reading any other document.
> **Source docs:** `.planning/04-features/onboarding-spec.md`, `.planning/PRODUCT_SPECIFICATION.md`, `.planning/04-features/scan-engine-spec.md`

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

Auto-suggest competitors is a single synchronous API call that fires during Onboarding Step 3 ("Add Competitors"). When the user reaches that step, Beamix automatically suggests 5-8 competitors based on their business type, city, and country — before the user has to type anything.

**What it does:** Calls Perplexity Sonar to discover businesses competing in the same local market, then pipes those results through Claude Haiku to rank, deduplicate, and normalize the list. The suggestions are presented as chips the user can tap to select. Selected competitors are written to the existing `competitors` table. Suggestions that are not selected are discarded — they are never persisted.

**Why this matters:** The onboarding step "Add Competitors" historically has the highest drop-off in SaaS onboarding flows that require user-supplied data. If you make the user research their own competitors, many won't bother. Pre-populating intelligent suggestions reduces friction from "I have to think about this" to "yes, that one, and that one." This directly improves onboarding completion rate, which improves trial-to-paid conversion.

**Scope of this feature:** Suggestion-generation only. Competitor persistence (writing to `competitors` table) is handled by the existing onboarding flow. This spec covers the suggestion API, the caching layer, the fallback behavior, and the UI panel.

---

## 2. Scope and Boundaries

### In Scope — Phase 1 (Launch)

| Item | Notes |
|------|-------|
| `POST /api/onboarding/suggest-competitors` endpoint | Synchronous, returns in <2s |
| Perplexity Sonar search call | Primary suggestion source |
| Claude Haiku ranking and deduplication pass | Secondary normalization step |
| 24-hour result cache per `(businessType, city)` key | Supabase-based, not Redis |
| Rate limit: 3 calls/user/day | Prevents abuse during session replays |
| Hebrew + English query variants for Israeli businesses | Bilingual market coverage |
| Fallback to Haiku-only suggestions if Perplexity returns <3 results | Ensures step always has content |
| `SuggestionsPanel` UI component with loading skeleton + chip selection | See §8 |
| "Add Custom Competitor" inline field | Always visible alongside suggestions |

### In Scope — Phase 2 (Growth)

| Item | Notes |
|------|-------|
| Confidence score display on each chip | Show 0.7+ as "Strong match", lower as "Possible" |
| Competitor logo fetch (Clearbit or favicon) | Visual richness |
| Suggestion quality feedback ("Was this helpful?") | Training signal for prompt refinement |

### Explicitly Deferred

| Item | Reason |
|------|--------|
| Persistent suggestion history | Ephemeral by design — suggestions are not business data |
| Competitor auto-enrichment (revenue, size, reviews) | Phase 3 enrichment pipeline |
| Suggestion re-trigger from dashboard | Out of onboarding scope; dashboard has its own competitor management |

### Out of Scope

- Writing competitors to DB (existing onboarding completion handler owns this)
- Validating that suggested competitor URLs actually exist (URL availability check is a separate concern)
- Re-using suggestions across different users with the same business type (cache is per `(businessType, city)` key, not per user; this IS shared — see §5.3)

---

## 3. User Flows

### 3.1 Primary Flow — Suggestions Load on Step Entry

```
1. User completes Onboarding Step 2 (Business Profile: name, industry, city, country, URL)
2. User advances to Step 3 ("Add Competitors")
3. OnboardingStep3 mounts → fires POST /api/onboarding/suggest-competitors immediately
4. While awaiting response: SuggestionsPanel renders loading skeleton (5 placeholder chips, pulsing)
5. API validates auth, checks rate limit, checks cache
6. Cache hit (within 24h for same businessType+city): return cached suggestions immediately (~50ms)
7. Cache miss: call Perplexity Sonar → call Haiku → write cache → return suggestions (~1500ms)
8. SuggestionsPanel animates chips in (staggered 80ms per chip)
9. User taps chips to select/deselect (visual toggle state, no API call per selection)
10. User optionally types into "Add Custom" field; custom entry becomes a chip
11. User clicks "Continue" → OnboardingStep3 fires existing competitor-write logic with selected names + URLs
12. Suggestions object is discarded from component state; never written to DB
```

**Timing contract:** The API must return within 2000ms for p95 requests. The loading skeleton is shown for the full duration. If the API exceeds 2500ms, the client shows an error state with a "Try again" button and a manual entry field.

### 3.2 Error Flow — API Fails

```
1. API returns 500 or network error
2. SuggestionsPanel unmounts loading skeleton
3. Shows: "Couldn't load suggestions automatically. Enter competitors manually below."
4. "Add Custom" field is prominent; user can still complete the step
5. Step 3 is not blocked by suggestion failure — user can always skip
```

### 3.3 Cache Hit Flow

```
1. Second user in Tel Aviv who is a "restaurant" industry type reaches Step 3
2. API receives POST with { businessType: "restaurant", city: "Tel Aviv", country: "IL", ... }
3. Cache lookup: hits existing row from earlier request
4. Returns cached suggestions in <100ms — no LLM call made
5. User sees suggestions appear nearly instantly
```

### 3.4 Rate Limit Flow

```
1. User has refreshed onboarding or replayed the step 3 times today
2. API checks rate limit: user_id has 3+ calls today → return 429
3. Client on 429: skips skeleton, shows manual entry only (no error message shown — seamless fallback)
4. User can still complete step manually
```

---

## 4. Data Model

No new tables. Auto-suggest competitors uses two existing mechanisms: the `competitors` table (owned by the onboarding completion handler) and a new cache table for suggestion results.

### 4.1 New Table: `competitor_suggestion_cache`

Stores the results of Perplexity+Haiku suggestion calls keyed by market segment. Shared across users — a cache, not user data.

```sql
CREATE TABLE competitor_suggestion_cache (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key    text        NOT NULL UNIQUE,       -- '{businessType}:{city}:{country}:{language}'
  suggestions  jsonb       NOT NULL,              -- Array<SuggestionResult>
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  expires_at   timestamptz NOT NULL               -- created_at + INTERVAL '24 hours'
);

-- Expire stale cache entries (queried with WHERE expires_at > NOW())
CREATE INDEX idx_suggestion_cache_key_expiry
  ON competitor_suggestion_cache(cache_key, expires_at);

-- Cleanup job deletes rows WHERE expires_at < NOW()
CREATE INDEX idx_suggestion_cache_expiry
  ON competitor_suggestion_cache(expires_at);
```

**RLS:** Disabled. This table contains no user data. It is read/written only by service role (API route uses service client). The cache key contains no PII.

**Why not Redis:** Beamix does not have Redis in the stack. Supabase PostgreSQL with a simple index on `(cache_key, expires_at)` is sufficient for this access pattern. Cache reads are one indexed lookup; writes happen at most once per 24 hours per market segment.

### 4.2 Rate Limit Tracking

Rate limits are tracked via the existing `api_rate_limits` pattern. If that table does not exist, use the following:

```sql
-- Check if table already exists before creating
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    text        NOT NULL,               -- 'suggest-competitors'
  call_count  integer     NOT NULL DEFAULT 1,
  window_date date        NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, endpoint, window_date)
);

CREATE INDEX idx_rate_limits_user_endpoint_date
  ON api_rate_limits(user_id, endpoint, window_date);
```

**Rate limit logic:** `INSERT INTO api_rate_limits ... ON CONFLICT DO UPDATE SET call_count = call_count + 1 RETURNING call_count`. If returned `call_count > 3`, reject the request before making any LLM call.

### 4.3 `competitors` Table (Existing — Reference Only)

The existing `competitors` table is where confirmed competitor selections are written by the onboarding completion handler. This spec does not modify that table.

```
competitors
  id            uuid PK
  business_id   uuid FK → businesses(id)
  name          text NOT NULL
  website_url   text
  created_at    timestamptz
```

Auto-suggest writes nothing to `competitors`. It only returns suggestions. The onboarding flow's existing `POST /api/onboarding/complete` (or its competitor sub-step) writes to `competitors` with whatever names+URLs the user confirmed.

### 4.4 TypeScript Types

```typescript
// src/lib/types/suggestions.ts

export interface SuggestionResult {
  name: string;
  websiteUrl: string | null;
  confidence: number; // 0.0 – 1.0, Haiku-assigned
  source: 'perplexity' | 'haiku_fallback';
}

export interface SuggestCompetitorsRequest {
  businessType: string;   // maps to industry key from constants/industries.ts
  city: string;
  country: string;        // ISO 3166-1 alpha-2, e.g. 'IL', 'US'
  websiteUrl: string;     // excluded from suggestions (don't suggest user's own business)
}

export interface SuggestCompetitorsResponse {
  suggestions: SuggestionResult[];
  cached: boolean;        // was this result served from cache?
  cacheAge?: number;      // seconds since cached, if cached
}
```

---

## 5. Business Logic

### 5.1 Pipeline Overview

The suggestion pipeline runs synchronously inside the API route handler. No background job. Total budget: 2000ms.

```
[Request arrives]
    ↓
[Auth check + rate limit check]            ~10ms
    ↓
[Cache lookup by (businessType, city, country, language)]  ~20ms
    ↓ (miss)
[Build Perplexity query]                   ~1ms
    ↓
[Perplexity Sonar search]                  ~800ms
    ↓
[Haiku ranking + dedup pass]               ~400ms
    ↓
[Write cache]                              ~20ms
    ↓
[Return response]
```

On cache hit, the pipeline short-circuits after the cache lookup and returns immediately.

### 5.2 Perplexity Query Construction

For a restaurant in Tel Aviv, Israel:

```
English query:
"List the top 8-10 well-known restaurants in Tel Aviv, Israel that are direct competitors.
Return only business names and their websites. Format: JSON array with fields: name, website.
Exclude: [user's business name]. Focus on businesses of similar size and price point."

Hebrew query (when country === 'IL' or language === 'he'):
"תרשום 8-10 מסעדות מוכרות בתל אביב שהן מתחרות ישירות. החזר שמות עסקים ואתרים.
פורמט: מערך JSON עם שדות: name, website. לא לכלול: [שם העסק של המשתמש]."
```

**Query parameters to Perplexity Sonar:**
```typescript
{
  model: 'sonar',           // not sonar-pro — cost control
  messages: [{ role: 'user', content: query }],
  max_tokens: 500,
  temperature: 0.2,         // low temp for consistent structured output
  return_citations: false,  // we don't need source URLs here
}
```

**For Israeli businesses (`country === 'IL'`):** Send both EN and HE queries in parallel using `Promise.all`. Merge results before the Haiku pass. This surfaces businesses that are prominent in Hebrew-language web content but not indexed well in English.

### 5.3 Haiku Ranking and Deduplication Pass

Raw Perplexity output is not reliable enough to serve directly. It may return duplicates (same business, different name variants), the user's own business, or irrelevant results. Haiku normalizes this in a single fast call.

**Haiku prompt:**
```
You are a competitor data cleaner. Given this raw list of business suggestions, do the following:
1. Remove the business with website "{websiteUrl}" (this is the user's own business)
2. Remove duplicates (same business, different name spellings)
3. Remove results that are clearly not in the correct city or industry
4. Score each remaining result 0.0-1.0 for how likely it is a direct local competitor
5. Sort by score descending
6. Return max 8 results

Input list:
{rawResults}

Return a JSON array only. No explanation. Schema: [{ name, websiteUrl, confidence }]
```

**Haiku call parameters:**
```typescript
{
  model: 'claude-haiku-4-5',
  max_tokens: 600,
  temperature: 0,           // deterministic output
}
```

### 5.4 Fallback: Perplexity Returns <3 Results

If Perplexity returns fewer than 3 usable results after dedup, fall back to a Haiku-only generation pass:

```
Haiku prompt (fallback):
"Generate 6 plausible competitor business names for a {businessType} business in {city}, {country}.
These should be realistic local competitors. Return JSON array: [{ name, websiteUrl: null, confidence }]
Set confidence to 0.5 for all (these are generated, not verified).
Do not invent URLs — set websiteUrl to null."
```

Fallback results have `source: 'haiku_fallback'` and `confidence: 0.5` max. The UI does not distinguish fallback from primary results to the user — the chip appearance is identical.

### 5.5 Cache Key Construction

```typescript
function buildCacheKey(req: SuggestCompetitorsRequest, language: string): string {
  const normalized = {
    businessType: req.businessType.toLowerCase().trim(),
    city: req.city.toLowerCase().trim(),
    country: req.country.toUpperCase(),
    language,
  };
  return `${normalized.businessType}:${normalized.city}:${normalized.country}:${normalized.language}`;
}
```

Cache is **shared across users.** A dentist in Haifa who gets suggestions will contribute the cache entry that the next dentist in Haifa benefits from. This is intentional: the suggestions are market-level data, not user-specific data.

### 5.6 Error Handling

| Error Condition | Behavior |
|----------------|----------|
| Perplexity API timeout (>1500ms) | Proceed directly to Haiku fallback |
| Perplexity returns malformed JSON | Proceed directly to Haiku fallback |
| Haiku call fails | Return empty suggestions array `[]` with HTTP 200 (client shows manual entry) |
| Both LLM calls fail | Return `{ suggestions: [], cached: false }` with HTTP 200, log to Sentry |
| Rate limit exceeded | Return HTTP 429 |
| Auth missing | Return HTTP 401 |

Do not return HTTP 500 to the client for LLM failures. The suggestion step is enhancement, not a blocker. The user can always enter competitors manually.

---

## 6. Inngest Jobs

**Not applicable for this feature.**

Auto-suggest competitors is a synchronous API call with a <2s budget. It does not require background processing, retries, or scheduled execution. The pipeline runs entirely within the API route handler using `Promise.all` for parallel LLM calls where applicable.

If the 2s budget ever proves too tight in production (e.g., Perplexity p95 latency increases), the correct fix is to pre-warm the suggestion cache in an Inngest job triggered on Onboarding Step 2 completion — not to move the API route to background processing. That optimization is deferred to Phase 2.

---

## 7. API Routes

### `POST /api/onboarding/suggest-competitors`

**Auth:** Required. Must be in active onboarding session (user exists in `auth.users`, may or may not have a `businesses` row yet).

**Rate limit:** 3 calls per user per calendar day (UTC).

**Request Zod schema:**

```typescript
// src/lib/schemas/suggest-competitors.ts
import { z } from 'zod/v4';

export const SuggestCompetitorsSchema = z.object({
  businessType: z.string().min(2).max(100),
  city:         z.string().min(1).max(100),
  country:      z.string().length(2),           // ISO 3166-1 alpha-2
  websiteUrl:   z.string().url(),               // used to exclude user's own business
});

export type SuggestCompetitorsInput = z.infer<typeof SuggestCompetitorsSchema>;
```

**Handler flow:**

```typescript
// src/app/api/onboarding/suggest-competitors/route.ts

export async function POST(request: Request): Promise<Response> {
  // 1. Auth
  const { user } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Parse + validate body
  const body = await request.json();
  const parsed = SuggestCompetitorsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // 3. Rate limit
  const callCount = await incrementAndCheckRateLimit(user.id, 'suggest-competitors');
  if (callCount > 3) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // 4. Determine language preference
  const language = await getUserLanguage(user.id); // 'en' | 'he', defaults to 'en'

  // 5. Cache lookup
  const cacheKey = buildCacheKey(parsed.data, language);
  const cached = await lookupSuggestionCache(cacheKey);
  if (cached) {
    return NextResponse.json({
      suggestions: cached.suggestions,
      cached: true,
      cacheAge: Math.floor((Date.now() - cached.createdAt.getTime()) / 1000),
    });
  }

  // 6. Run suggestion pipeline
  const suggestions = await runSuggestionPipeline(parsed.data, language);

  // 7. Write cache
  await writeSuggestionCache(cacheKey, suggestions);

  // 8. Return
  return NextResponse.json({ suggestions, cached: false });
}
```

**Success response (200):**
```json
{
  "suggestions": [
    { "name": "Café Noir", "websiteUrl": "https://cafenoir.co.il", "confidence": 0.92, "source": "perplexity" },
    { "name": "The Norman", "websiteUrl": "https://thenorman.com", "confidence": 0.87, "source": "perplexity" },
    { "name": "Manta Ray", "websiteUrl": null, "confidence": 0.75, "source": "perplexity" }
  ],
  "cached": false
}
```

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ error: { fieldErrors: {...} } }` | Zod validation failure |
| 401 | `{ error: "Unauthorized" }` | No session |
| 429 | `{ error: "Rate limit exceeded" }` | >3 calls today |
| 200 | `{ suggestions: [], cached: false }` | LLM pipeline failed (graceful degradation) |

---

## 8. UI Components

### 8.1 `SuggestionsPanel`

**File:** `src/components/onboarding/suggestions-panel.tsx`

**Purpose:** Renders the suggestions loading state, chip selection UI, and custom entry field within Onboarding Step 3.

**Props:**
```typescript
interface SuggestionsPanelProps {
  businessType: string;
  city: string;
  country: string;
  websiteUrl: string;
  onSelectionChange: (selected: Array<{ name: string; websiteUrl: string | null }>) => void;
}
```

**States:**
1. **Loading** — 5 skeleton chips pulsing. Fired on mount. `useEffect` calls API immediately.
2. **Loaded** — Animated chips appear (staggered 80ms delay per chip using `framer-motion`).
3. **Error** — Simple text: "Couldn't load suggestions. Enter competitors manually below." Manual field is prominent.
4. **Empty** — `suggestions.length === 0` after API responds. Same as error state.

**Interaction:**
- Chip tap: toggles `isSelected` local state (no API call)
- Selected chip: filled background (primary color), checkmark icon left of name
- Deselected chip: outline style
- Max 8 suggestions rendered; extras truncated silently

**RTL support:** When `dir="rtl"` (Hebrew language), chip layout reverses. Use `dir` attribute on the container div, not individual chips. Tailwind RTL variants (`rtl:flex-row-reverse`) handle icon positioning.

### 8.2 `CompetitorChip`

**File:** `src/components/onboarding/competitor-chip.tsx`

**Purpose:** Individual selectable chip representing one suggested competitor.

**Props:**
```typescript
interface CompetitorChipProps {
  name: string;
  websiteUrl: string | null;
  confidence: number;
  isSelected: boolean;
  onToggle: () => void;
}
```

**Rendering:** Name as primary text. If `websiteUrl` is not null, show domain as secondary text (stripped of `https://` and `www.`). Confidence is not shown in Phase 1.

### 8.3 `CustomCompetitorInput`

**File:** `src/components/onboarding/custom-competitor-input.tsx`

**Purpose:** Inline field to add a competitor not in the suggestions.

**Behavior:**
- Text input for name + optional URL input (two fields)
- "Add" button: validates that `name` is not empty, appends to local selection list as a new chip, clears inputs
- Custom entries appear in a separate row below suggestions with a "Custom" label
- Custom entries are visually selected by default (since the user just added them intentionally)

**Props:**
```typescript
interface CustomCompetitorInputProps {
  onAdd: (competitor: { name: string; websiteUrl: string | null }) => void;
}
```

### 8.4 Integration Into Onboarding Step 3

The existing `OnboardingStep3` component (if it exists) should import `SuggestionsPanel` and pass `onSelectionChange` to accumulate the final competitor list that gets submitted when the user clicks "Continue."

If Step 3 does not yet exist as a discrete component, create it at `src/components/onboarding/step-3-competitors.tsx`. It composes `SuggestionsPanel` + `CustomCompetitorInput` + a "Continue" button.

---

## 9. Tier Gating

| Tier | Can Use Auto-Suggest | Notes |
|------|---------------------|-------|
| Free (pre-signup) | Yes | Feature fires during onboarding, before subscription exists |
| Trial | Yes | Onboarding runs during trial period |
| Starter | Yes (if re-onboarding) | Not relevant post-onboarding; competitor management is manual |
| Pro | Yes (if re-onboarding) | Same as Starter |
| Business | Yes (if re-onboarding) | Same as Starter |

**Key point:** This feature runs at onboarding, before any subscription tier is assigned. All users who are completing onboarding get access. There is no tier-based gating for this feature.

Rate limiting (3 calls/user/day) applies uniformly across all tiers.

---

## 10. Cost Impact

All costs below are per-user, one-time at onboarding. The pipeline does not repeat after onboarding unless a user explicitly re-triggers competitor suggestions.

### Per-User Cost (Cache Miss)

| Call | Model | Tokens In | Tokens Out | Cost |
|------|-------|-----------|-----------|------|
| Perplexity Sonar (EN query) | sonar | ~150 | ~300 | ~$0.007 |
| Perplexity Sonar (HE query, IL only) | sonar | ~150 | ~300 | ~$0.007 |
| Haiku ranking + dedup | claude-haiku-4-5 | ~600 | ~400 | ~$0.002 |
| **Total (global user)** | | | | **~$0.009** |
| **Total (Israeli user, bilingual)** | | | | **~$0.016** |

### Per-User Cost (Cache Hit)

$0.00 — no LLM calls made.

### Monthly Cost Estimate

Assuming 500 new users/month onboarding, 60% cache hit rate after warm-up:
- 200 cache misses × $0.016 average = **$3.20/month**

This is rounding error relative to infrastructure cost. No cost gates or warnings required.

### Cache Efficiency

Cache efficiency improves as more users onboard from the same markets. By month 3, expect 80%+ cache hit rates for top-10 cities per country. The cache TTL (24h) is intentionally short to keep suggestions fresh as new businesses open and close.

---

## 11. Engineering Notes

### Build Order

1. Create `competitor_suggestion_cache` table + `api_rate_limits` table (migration)
2. Add `PERPLEXITY_API_KEY` to env vars; validate in `src/lib/env.ts`
3. Build `src/lib/suggestions/perplexity-client.ts` — thin wrapper around Perplexity Sonar API
4. Build `src/lib/suggestions/haiku-ranker.ts` — Haiku normalization pass
5. Build `src/lib/suggestions/pipeline.ts` — orchestrates the two steps, handles fallback
6. Build `src/lib/suggestions/cache.ts` — cache read/write using service client
7. Build `POST /api/onboarding/suggest-competitors/route.ts`
8. Build `SuggestionsPanel`, `CompetitorChip`, `CustomCompetitorInput` components
9. Wire into Onboarding Step 3
10. Write integration test against mock Perplexity + Haiku responses

### Estimated Effort

**4-6 days** for one engineer.
- Day 1-2: API route + pipeline (Perplexity + Haiku + cache + rate limit)
- Day 3-4: UI components (SuggestionsPanel + chips + custom input)
- Day 5: Integration into onboarding flow + RTL testing
- Day 6: Edge case handling (timeouts, fallback, empty results) + integration test

### Risks

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Perplexity returns poor results for niche industries | Medium | Haiku fallback always available |
| Perplexity API key management | Low | Add to existing env var validation in `src/lib/env.ts` |
| Cache poisoning (bad suggestions cached for 24h) | Low | 24h TTL is short; monitor suggestion quality in early rollout |
| Onboarding Step 3 not yet built as discrete component | Medium | Build it as part of this feature; spec defines the interface |

### Key Files to Create or Modify

```
CREATE src/lib/suggestions/perplexity-client.ts
CREATE src/lib/suggestions/haiku-ranker.ts
CREATE src/lib/suggestions/pipeline.ts
CREATE src/lib/suggestions/cache.ts
CREATE src/lib/schemas/suggest-competitors.ts
CREATE src/lib/types/suggestions.ts
CREATE src/app/api/onboarding/suggest-competitors/route.ts
CREATE src/components/onboarding/suggestions-panel.tsx
CREATE src/components/onboarding/competitor-chip.tsx
CREATE src/components/onboarding/custom-competitor-input.tsx
MODIFY src/components/onboarding/step-3-competitors.tsx  (or create if doesn't exist)
CREATE supabase/migrations/[timestamp]_competitor_suggestion_cache.sql
```

### Testing Checklist

- [ ] Cache hit returns in <100ms
- [ ] Cache miss returns in <2000ms (p95)
- [ ] Rate limit blocks 4th call on same user+day
- [ ] Perplexity timeout falls back to Haiku gracefully
- [ ] Israeli user gets bilingual query (HE+EN)
- [ ] User's own website is excluded from suggestions
- [ ] RTL layout renders correctly in Hebrew mode
- [ ] `onSelectionChange` fires with correct payload when chips toggled
- [ ] Custom competitor appears in selection list after adding
- [ ] API returns HTTP 200 (not 500) on LLM failure
