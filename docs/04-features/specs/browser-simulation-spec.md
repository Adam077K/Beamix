# Beamix — Browser Simulation Technical Spec

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Phase 3 — Moat Builder. Do not build until Phase 2 (Growth) is stable.
> **Audience:** Engineers adding browser-based AI engine coverage to the scan pipeline. You should be able to implement this feature end-to-end without reading any other document.
> **Source docs:** `docs/04-features/specs/scan-engine-spec.md`, `docs/01-foundation/PRODUCT_SPECIFICATION.md`, `docs/03-system-design/ARCHITECTURE.md`

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

Browser simulation is the access method for AI search engines that have no public API. It is not a validation layer for API-accessible engines — it is the only possible access method for three engines that account for a significant share of real-world AI search traffic.

**The three engines covered:**
- **Bing Copilot** — No public API. Microsoft has not announced one. Browser session required.
- **Google AI Overviews** — No API. Requires authenticated Google search session with the AI Overview feature enabled.
- **Google AI Mode** — Google's dedicated AI search tab. No API. Requires browser session.

**What this means for the product:** Pro and Business users currently get AI visibility scores based on ChatGPT, Gemini, Perplexity, Claude, Grok, and You.com. These are all API-accessible. But Bing Copilot alone represents roughly 10-15% of AI search traffic (as of early 2026). Google AI Overviews appears on ~30% of Google searches. A visibility score that omits these engines is incomplete. Browser simulation closes that gap.

**Infrastructure choice — Browserbase:** Managed Playwright hosting. Browserbase runs browser sessions on their infrastructure, handling anti-bot detection, residential proxy rotation, session isolation, and session cleanup. Beamix's scan jobs call the Browserbase API to create sessions and run Playwright scripts remotely. This is not self-hosted Playwright on Vercel — Vercel's 10-second function timeout makes it impossible to run browser sessions reliably. Browserbase sessions run async, up to 15 minutes, and are billed per session.

> **Cost note:** Browser simulation adds ~$6/user/month in infrastructure costs (Browserbase). At the Pro tier price of $149/month, this is 4.2% of revenue per Pro user — within acceptable margin. Business tier ($349/month) is even more favorable. This cost is not incurred for Starter users (tier-gated).

---

## 2. Scope and Boundaries

### In Scope — Phase 3 (Moat Builder)

| Item | Notes |
|------|-------|
| Bing Copilot browser scraper | `src/lib/scan/engines/copilot-browser.ts` |
| Google AI Overviews browser scraper | `src/lib/scan/engines/ai-overviews-browser.ts` |
| Google AI Mode browser scraper | `src/lib/scan/engines/ai-mode-browser.ts` |
| Browserbase session management client | `src/lib/scan/browserbase-client.ts` |
| `collection_method` column on `scan_engine_results` | 'api' or 'browser' |
| `verified_browser` column on `scan_engine_results` | boolean |
| Routing browser engines through existing Inngest scan functions | No new Inngest functions |
| "Browser-verified" badge in scan results UI | Visual indicator only |
| Graceful degradation when Browserbase is unavailable | Scan runs API-only; no error surfaced to user |
| Weekly canary alerts for DOM change detection | Simple Inngest cron job |
| Concurrency cap: 5 simultaneous Browserbase sessions | Enforced in `browserbase-client.ts` |

### In Scope — Phase 4

| Item | Notes |
|------|-------|
| Meta AI browser scraper | Meta AI has no API; browser simulation is the only path |
| Perplexity Pages browser scraper | Web-only Perplexity surface distinct from the API |
| Session warm-up pool | Pre-created Browserbase sessions for lower latency |

### Explicitly Deferred

| Item | Reason |
|------|--------|
| Self-hosted Playwright | Infrastructure cost and maintenance burden; Browserbase is the right abstraction |
| Vercel-hosted browser sessions | 10s timeout makes this architecturally impossible |
| Free scan coverage for browser engines | Cost: $0.10/session × 3 engines × free scan volume is not sustainable |

### Out of Scope

- API engines (ChatGPT, Gemini, Perplexity, Claude, Grok, You.com) — these use existing API-based scrapers, period. Browser simulation does not "verify" or "re-run" API engine results.
- Full Playwright testing framework (this is not E2E test infrastructure — it is a production data collection pipeline)
- Screenshot capture (not needed; we only need text from AI responses)

---

## 3. User Flows

### 3.1 Pro/Business User — Manual Scan (Includes Browser Engines)

```
1. Pro user clicks "Scan Now" on dashboard
2. Client POSTs to /api/scan/manual with { business_id }
3. API creates scans row (status: 'pending')
4. API sends Inngest event scan/manual.start
5. scan.manual.run Inngest function begins
6. Function builds engine list from user's tier (Pro: 7 API engines + 3 browser engines = 10 total)
7. API engines run in parallel immediately (existing behavior)
8. Browser engines are dispatched to Browserbase in parallel with API engines
9. Browser sessions execute: navigate to engine, type query, wait for AI response, extract text
10. Haiku parses extracted text → structured scan_engine_results row
11. All engine results (API + browser) written to scan_engine_results
12. Scan completes; browser results have collection_method='browser', verified_browser=true
13. Dashboard shows full results with "Browser-verified" badge on Bing Copilot, AI Overviews, AI Mode results
```

**Timing:** Browser sessions typically take 15-45 seconds per engine. They run in parallel with API engines. The scan function waits for all engines (API + browser) before marking the scan complete. Browser engines add ~30-45s to total scan time for Pro users. This is expected and acceptable — the value of the data justifies the wait.

### 3.2 Browserbase Unavailable (Graceful Degradation)

```
1. scan.manual.run begins
2. Browserbase session creation fails (API error, quota exceeded, outage)
3. Browser engine results are skipped (no scan_engine_results rows written for those engines)
4. API engines complete normally
5. Scan marks status='completed' (not 'failed')
6. Dashboard shows results for API engines only
7. Browser-gated engine slots show: "Temporarily unavailable" label (not an error state)
8. No user-facing error. No Sentry alert unless Browserbase has been down for >15 minutes.
```

### 3.3 Scheduled Scan — Browser Engines Included

Browser engines run on the same cadence as API engines within `scan.scheduled`. Pro users get daily scans that include all 10 engines. Business users get 6 scans/day, but browser engines run only 2×/day to control cost (see §9 for tier details).

### 3.4 DOM Change Detection (Weekly Canary)

```
1. Inngest cron.canary-browser fires every Monday at 06:00 UTC
2. Creates one test session per browser engine using a known reference business ("Starbucks" globally)
3. Verifies that expected DOM selectors are still present on each engine
4. If a selector is missing: fires alert to Slack (#browser-canary channel) with engine name + missing selector
5. On-call engineer updates the selector in the relevant engine scraper file
```

---

## 4. Data Model

### 4.1 Schema Additions to `scan_engine_results`

Two new columns added via migration. No new tables.

```sql
-- Migration: add browser simulation columns to scan_engine_results
ALTER TABLE scan_engine_results
  ADD COLUMN IF NOT EXISTS collection_method TEXT
    NOT NULL DEFAULT 'api'
    CHECK (collection_method IN ('api', 'browser'));

ALTER TABLE scan_engine_results
  ADD COLUMN IF NOT EXISTS verified_browser BOOLEAN
    NOT NULL DEFAULT FALSE;

-- Index for querying browser-collected results (analytics, cost auditing)
CREATE INDEX IF NOT EXISTS idx_ser_collection_method
  ON scan_engine_results(collection_method, created_at DESC);

COMMENT ON COLUMN scan_engine_results.collection_method IS
  'How this result was collected: api = direct LLM API, browser = Browserbase Playwright session';

COMMENT ON COLUMN scan_engine_results.verified_browser IS
  'True when result came from a real browser session rendering the engine''s UI';
```

**Why `verified_browser` as a separate column from `collection_method = ''browser''`:** They currently move together, but they are conceptually different. `collection_method` is about how data was gathered. `verified_browser` is about whether we consider the result confirmed by a real browser render. In Phase 4, when we add screenshot comparison, `verified_browser` could be false for browser-collected results that failed visual confirmation. Keeping them separate preserves that flexibility.

### 4.2 Engine Registry Update

The existing engine registry (wherever it lives — likely `src/constants/engines.ts` or `src/lib/scan/engine-registry.ts`) needs a `collectionMethod` field per engine.

```typescript
// src/lib/scan/engine-registry.ts

export interface EngineDefinition {
  key: string;                            // e.g. 'bing_copilot'
  displayName: string;                    // e.g. 'Bing Copilot'
  collectionMethod: 'api' | 'browser';    // NEW
  browserScraperPath?: string;            // NEW — module path for browser engines
  minTier: 'starter' | 'pro' | 'business' | null; // null = all tiers
}

export const ENGINE_REGISTRY: EngineDefinition[] = [
  // ... existing API engines ...
  {
    key: 'bing_copilot',
    displayName: 'Bing Copilot',
    collectionMethod: 'browser',
    browserScraperPath: 'src/lib/scan/engines/copilot-browser',
    minTier: 'pro',
  },
  {
    key: 'google_ai_overviews',
    displayName: 'Google AI Overviews',
    collectionMethod: 'browser',
    browserScraperPath: 'src/lib/scan/engines/ai-overviews-browser',
    minTier: 'pro',
  },
  {
    key: 'google_ai_mode',
    displayName: 'Google AI Mode',
    collectionMethod: 'browser',
    browserScraperPath: 'src/lib/scan/engines/ai-mode-browser',
    minTier: 'pro',
  },
];
```

### 4.3 New Environment Variables

```bash
# .env.local additions
BROWSERBASE_API_KEY=bb_key_...
BROWSERBASE_PROJECT_ID=prj_...
```

Both must be validated in `src/lib/env.ts` using Zod. Presence of these variables enables the browser engine path. Absence disables it gracefully (browser engines are skipped as if Browserbase were unavailable).

```typescript
// src/lib/env.ts — additions to existing Zod schema
browserbaseApiKey:    z.string().optional(),
browserbaseProjectId: z.string().optional(),

// Derived helper
export function browserbaseEnabled(): boolean {
  return !!(env.browserbaseApiKey && env.browserbaseProjectId);
}
```

### 4.4 TypeScript Types for Browser Scrapers

```typescript
// src/lib/scan/browserbase-client.ts

export interface BrowserbaseSession {
  sessionId: string;
  sessionUrl: string;   // WebSocket URL for Playwright to connect to
  createdAt: Date;
}

export interface BrowserScrapeResult {
  engine: string;
  rawText: string;       // Extracted AI response text
  screenshotUrl?: string; // Phase 4 only
  scrapedAt: Date;
  durationMs: number;
}

// src/lib/scan/engines/browser-engine-interface.ts

export interface BrowserEngineInterface {
  scrape(session: BrowserbaseSession, query: string): Promise<BrowserScrapeResult>;
}
```

---

## 5. Business Logic

### 5.1 Browserbase Client

**File:** `src/lib/scan/browserbase-client.ts`

Responsibilities:
1. Create sessions via Browserbase REST API
2. Manage the concurrency cap (5 simultaneous sessions max)
3. Auto-close sessions after scrape completes or on error
4. Track session cost for internal cost auditing

```typescript
// Concurrency management using a semaphore pattern
const MAX_CONCURRENT_SESSIONS = 5;
let activeSessions = 0;
const sessionQueue: Array<() => void> = [];

export async function withBrowserbaseSession<T>(
  fn: (session: BrowserbaseSession) => Promise<T>
): Promise<T> {
  // Wait if at capacity
  if (activeSessions >= MAX_CONCURRENT_SESSIONS) {
    await new Promise<void>((resolve) => sessionQueue.push(resolve));
  }

  activeSessions++;
  const session = await createSession();

  try {
    return await fn(session);
  } finally {
    await closeSession(session.sessionId);
    activeSessions--;
    // Release next waiter
    const next = sessionQueue.shift();
    if (next) next();
  }
}
```

**Session creation:**
```typescript
async function createSession(): Promise<BrowserbaseSession> {
  const response = await fetch('https://api.browserbase.com/v1/sessions', {
    method: 'POST',
    headers: {
      'X-BB-API-Key': env.browserbaseApiKey!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId: env.browserbaseProjectId,
      browserSettings: {
        stealth: true,              // Anti-bot detection avoidance
        viewport: { width: 1280, height: 800 },
      },
    }),
  });

  if (!response.ok) {
    throw new BrowserbaseError(`Session creation failed: ${response.status}`);
  }

  const data = await response.json();
  return { sessionId: data.id, sessionUrl: data.connectUrl, createdAt: new Date() };
}
```

### 5.2 Engine Scrapers

Each browser engine has its own scraper file. All three follow the same interface.

**Bing Copilot — `src/lib/scan/engines/copilot-browser.ts`:**

```typescript
import { chromium } from 'playwright';
import type { BrowserbaseSession, BrowserScrapeResult } from '../browserbase-client';

export async function scrapeBingCopilot(
  session: BrowserbaseSession,
  query: string
): Promise<BrowserScrapeResult> {
  const start = Date.now();
  const browser = await chromium.connectOverCDP(session.sessionUrl);
  const page = await browser.newPage();

  await page.goto('https://www.bing.com/chat', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });
  await page.fill('[data-testid="chat-input"]', query);
  await page.keyboard.press('Enter');

  // Wait for Copilot to finish generating (streaming indicator disappears)
  await page.waitForSelector('[data-testid="ai-response"]', { timeout: 30000 });
  await page.waitForFunction(() => {
    const indicator = document.querySelector('[data-testid="streaming-indicator"]');
    return !indicator || indicator.getAttribute('aria-busy') === 'false';
  }, { timeout: 30000 });

  const rawText = await page.textContent('[data-testid="ai-response"]') ?? '';

  await browser.close();

  return { engine: 'bing_copilot', rawText, scrapedAt: new Date(), durationMs: Date.now() - start };
}
```

**Google AI Overviews — `src/lib/scan/engines/ai-overviews-browser.ts`:**

AI Overviews requires a real Google search. The scraper performs a standard Google search and extracts the AI Overview box if present.

```typescript
export async function scrapeGoogleAIOverviews(
  session: BrowserbaseSession,
  query: string
): Promise<BrowserScrapeResult> {
  const start = Date.now();
  const browser = await chromium.connectOverCDP(session.sessionUrl);
  const page = await browser.newPage();

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`;
  await page.goto(searchUrl, { waitUntil: 'networkidle' });

  // AI Overviews box — selector based on Google's current DOM as of March 2026
  // FRAGILE: this selector changes. Weekly canary job monitors for breakage.
  const aiOverviewSelector = '[data-attrid="wa:/description"] .aiob-card';
  const aiOverviewExists = await page.$(aiOverviewSelector) !== null;

  let rawText = '';
  if (aiOverviewExists) {
    // Expand "Show more" if present
    const expandButton = await page.$('[data-ved][aria-expanded="false"]');
    if (expandButton) await expandButton.click();
    await page.waitForTimeout(500);
    rawText = await page.textContent(aiOverviewSelector) ?? '';
  }
  // If no AI Overview present, rawText remains '' — parsed as is_mentioned=false

  await browser.close();

  return { engine: 'google_ai_overviews', rawText, scrapedAt: new Date(), durationMs: Date.now() - start };
}
```

**Google AI Mode — `src/lib/scan/engines/ai-mode-browser.ts`:**

Google AI Mode is the dedicated AI search tab at `https://www.google.com/search?udm=50`.

```typescript
export async function scrapeGoogleAIMode(
  session: BrowserbaseSession,
  query: string
): Promise<BrowserScrapeResult> {
  const start = Date.now();
  const browser = await chromium.connectOverCDP(session.sessionUrl);
  const page = await browser.newPage();

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&udm=50&hl=en`;
  await page.goto(searchUrl, { waitUntil: 'networkidle' });

  // Wait for AI response to render
  await page.waitForSelector('[data-async-type="ai_answer"]', { timeout: 20000 });
  const rawText = await page.textContent('[data-async-type="ai_answer"]') ?? '';

  await browser.close();

  return { engine: 'google_ai_mode', rawText, scrapedAt: new Date(), durationMs: Date.now() - start };
}
```

**Selector fragility note:** All three scrapers reference DOM selectors that Google and Microsoft can change at any time. The weekly canary job (§5.5) is the safety net. When a selector breaks, the on-call engineer updates the constant in the scraper file and the canary passes on next run.

### 5.3 Haiku Parsing of Browser-Scraped Text

Raw text from browser scrapers feeds through the same Haiku parsing step used for API engine responses. No new parsing logic. The existing `parseEngineResponse` function in `src/lib/scan/response-parser.ts` already operates on raw text strings. Browser-scraped text is passed in identically.

The only difference: the resulting `scan_engine_results` row has `collection_method = 'browser'` and `verified_browser = true`.

### 5.4 Integration Into Existing Inngest Scan Functions

Browser engines do not get new Inngest functions. They are additional steps within the existing `scan.manual.run` and `scan.scheduled.run` functions.

**Modification to scan execution logic:**

```typescript
// Inside scan.manual.run and scan.scheduled.run — engine dispatch section

const engineList = getEnginesForTier(subscription.plan_tier);

const apiEngines = engineList.filter(e => e.collectionMethod === 'api');
const browserEngines = engineList.filter(e => e.collectionMethod === 'browser');

// API engines run as before
const apiResults = await Promise.allSettled(
  apiEngines.map(engine => runApiEngine(engine, queries))
);

// Browser engines — only if Browserbase is enabled and there are browser engines for this tier
const browserResults: PromiseSettledResult<BrowserScrapeResult>[] = [];
if (browserbaseEnabled() && browserEngines.length > 0) {
  browserResults.push(...await Promise.allSettled(
    browserEngines.map(engine =>
      withBrowserbaseSession(session =>
        runBrowserEngine(engine, session, queries)
      )
    )
  ));
}

// Write all results (both API and browser) to scan_engine_results
await writeEngineResults([...apiResults, ...browserResults], scanId, businessId);
```

**Step.run wrapping:** Each browser engine dispatch is wrapped in `step.run()` within Inngest for retries and observability:

```typescript
const copilotResult = await step.run('browser-engine-bing-copilot', async () => {
  return withBrowserbaseSession(session => scrapeBingCopilot(session, query));
});
```

### 5.5 Weekly Canary Job

A lightweight validation run every Monday morning to detect DOM changes before they silently corrupt production scan data.

```typescript
// src/inngest/functions/cron-canary-browser.ts

export const cronCanaryBrowser = inngest.createFunction(
  { id: 'cron.canary-browser', name: 'Weekly Browser Engine Canary' },
  { cron: '0 6 * * 1' },  // Monday 06:00 UTC
  async ({ step, logger }) => {
    const REFERENCE_QUERY = 'best coffee shop near me';

    const results = await step.run('run-canary-sessions', async () => {
      return Promise.allSettled([
        withBrowserbaseSession(s => scrapeBingCopilot(s, REFERENCE_QUERY)),
        withBrowserbaseSession(s => scrapeGoogleAIOverviews(s, REFERENCE_QUERY)),
        withBrowserbaseSession(s => scrapeGoogleAIMode(s, REFERENCE_QUERY)),
      ]);
    });

    const failures = results
      .map((r, i) => ({ engine: ['bing_copilot', 'google_ai_overviews', 'google_ai_mode'][i], result: r }))
      .filter(({ result }) => result.status === 'rejected' || result.value.rawText === '');

    if (failures.length > 0) {
      logger.error('Browser canary failures detected', { failures });
      // Fire Slack alert (implementation uses existing notification pattern)
      await notifySlack({
        channel: '#browser-canary',
        message: `Browser engine canary failures: ${failures.map(f => f.engine).join(', ')}. DOM selectors may need updating.`,
      });
    }
  }
);
```

---

## 6. Inngest Jobs

### Existing Functions Modified

| Function | Change |
|----------|--------|
| `scan.manual.run` | Add browser engine dispatch block (see §5.4) |
| `scan.scheduled.run` | Add browser engine dispatch block (same pattern) |

### New Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `cron.canary-browser` | Monday 06:00 UTC | Detect broken DOM selectors before production impact |

### No New Scan Functions

Browser engines share the same scan lifecycle as API engines. Same Inngest function, same retry policy, same status tracking. The only difference is the implementation of the engine step (Browserbase instead of fetch call).

---

## 7. API Routes

**No new API routes.** Browser engines are dispatched and managed entirely within Inngest step functions. The existing scan API routes (`POST /api/scan/manual`, `GET /api/scan/[scan_id]/status`, `GET /api/scan/[scan_id]/results`) are unchanged from the perspective of the client.

The only observable difference to the client: results now include `scan_engine_results` rows for `bing_copilot`, `google_ai_overviews`, and `google_ai_mode` with `collection_method = 'browser'`. The existing results API returns these rows identically to API engine results — the client does not need to know how the data was collected (except to show the "Browser-verified" badge, which keys on `collection_method`).

---

## 8. UI Components

### 8.1 "Browser-Verified" Badge

**File:** `src/components/scan/browser-verified-badge.tsx`

A small badge rendered on scan result cards for browser-collected engines.

**Props:**
```typescript
interface BrowserVerifiedBadgeProps {
  collectionMethod: 'api' | 'browser';
}
```

**Rendering:** Only renders when `collectionMethod === 'browser'`. Shows a small browser icon + "Browser-verified" text. Tooltip on hover: "This result was verified by simulating a real browser session."

**Placement:** Next to the engine name in the per-engine result card in `ScanResultsClient`.

### 8.2 "Temporarily Unavailable" Engine Slot

When Browserbase is down and a browser engine is skipped, the scan result page should not show a blank or missing slot — it should show a graceful fallback card.

**Behavior:** If a browser engine has no `scan_engine_results` row for a given scan, the results client renders a placeholder card: engine name + "Temporarily unavailable. Browser-based collection is offline." No error styling — this is presented as a routine maintenance state.

### 8.3 Engine Coverage Indicator (Dashboard)

On the `/dashboard/rankings` page, a small indicator shows how many engines are currently active. When browser engines are operational: "Tracking 10 engines." When Browserbase is down: "Tracking 7 engines · 3 browser engines temporarily offline."

This is a read-only display. No action available to the user.

**RTL:** All badge and indicator components use `dir` on their container divs. Hebrew text labels ("מאומת בדפדפן") maintained as i18n strings, not hardcoded.

---

## 9. Tier Gating

| Tier | Browser Engines | Bing Copilot | Google AI Overviews | Google AI Mode | Browser Sessions/Month |
|------|----------------|--------------|--------------------|-----------------|-----------------------|
| Free | No | No | No | No | 0 |
| Starter | No | No | No | No | 0 |
| Pro | Yes | Yes | Yes | Yes | ~60 (2 scans/day × 3 engines × 10 days active) |
| Business | Yes | Yes | Yes | Yes | ~180 (6 scans/day × 3 engines, browser cap: 2×/day) |

**Business tier browser cap:** Business users get API engine scans 6×/day but browser engine scans are capped at 2×/day. This is a cost control measure. The `scan.scheduled.run` function checks: if `scan_type === 'scheduled'` and `subscription.plan_tier === 'business'` and `browser_scans_today >= 2`, skip browser engines for this scan.

**Why Pro gets full browser coverage at 2×/day:** Pro is daily scans = 1 scan/day × 3 engines = 3 browser sessions/day. Straightforward.

---

## 10. Cost Impact

### Per-Session Cost

| Provider | Cost per Session | Notes |
|---------|-----------------|-------|
| Browserbase | $0.10/session | Standard tier pricing (March 2026) |
| Haiku parsing of scraped text | ~$0.001/engine | Same as API engine parsing |

### Monthly Cost Per User Tier

**Pro ($149/month):**
- 1 scan/day × 3 browser engines × 30 days = 90 sessions
- 90 sessions × $0.10 = $9.00 Browserbase
- 90 Haiku parses × $0.001 = $0.09
- **Total browser simulation cost: ~$9.10/month**
- As % of Pro revenue: 9.10 / 149 = **6.1%**

**Business ($349/month):**
- 2 browser scans/day × 3 engines × 30 days = 180 sessions
- 180 × $0.10 = $18.00 Browserbase
- 180 × $0.001 = $0.18
- **Total browser simulation cost: ~$18.20/month**
- As % of Business revenue: 18.20 / 349 = **5.2%**

> **Cost note:** Browser simulation adds ~$9-18/user/month in infrastructure costs (Browserbase). For Pro users at $149/month this is 6.1% of revenue — within acceptable margin. For Business users at $349/month this is 5.2%. These costs are not incurred for Free or Starter users.

### Break-Even Analysis

The 6.1% infrastructure cost on Pro is acceptable as long as browser engine coverage meaningfully increases retention and upgrade rates. The hypothesis is that covering Bing Copilot + Google AI surfaces reduces churn for users who care about Google SEO. If browser engine data does not correlate with retention improvement after Phase 3, revisit the cost model.

---

## 11. Engineering Notes

### Build Order

1. Add `BROWSERBASE_API_KEY` + `BROWSERBASE_PROJECT_ID` to env validation in `src/lib/env.ts`
2. Create `src/lib/scan/browserbase-client.ts` (session management, concurrency semaphore, auto-close)
3. Create `src/lib/scan/engines/copilot-browser.ts`
4. Create `src/lib/scan/engines/ai-overviews-browser.ts`
5. Create `src/lib/scan/engines/ai-mode-browser.ts`
6. Run migration: add `collection_method` + `verified_browser` columns to `scan_engine_results`
7. Update engine registry to add three browser engine definitions
8. Modify `scan.manual.run` and `scan.scheduled.run` to dispatch browser engines
9. Create `cron.canary-browser` Inngest function
10. Build `BrowserVerifiedBadge` component + integrate into scan results UI
11. Manual QA: run a real Pro scan end-to-end against all three browser engines
12. Deploy to staging; monitor Browserbase dashboard for session lifecycle

### Estimated Effort

**3-4 weeks** for one engineer.
- Week 1: Browserbase client + all three scraper files (the core)
- Week 2: Inngest integration + DB migration + engine registry update
- Week 3: UI components + graceful degradation paths
- Week 4: QA, selector validation, canary job, production deploy

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| DOM selectors break on Google/Bing update | High | Data gap (not data corruption) | Weekly canary alerts; fix is a 1-line selector update |
| Browserbase outage | Medium | Browser engines skip silently | Graceful degradation already designed in |
| CAPTCHA detection | Low | Session fails, retried by Inngest | Browserbase stealth mode + residential proxies reduce probability to near-zero |
| Google rate-limiting our browser sessions | Medium | Some sessions return empty | Residential proxy rotation in Browserbase mitigates; monitor in canary |
| Playwright version mismatch with Browserbase | Low | Session connection failure | Pin Playwright version; test in CI before deploy |

### Key Files to Create or Modify

```
CREATE src/lib/scan/browserbase-client.ts
CREATE src/lib/scan/engines/copilot-browser.ts
CREATE src/lib/scan/engines/ai-overviews-browser.ts
CREATE src/lib/scan/engines/ai-mode-browser.ts
MODIFY src/lib/scan/engine-registry.ts         (add browser engine definitions)
MODIFY src/lib/env.ts                           (add Browserbase env vars)
MODIFY src/inngest/functions/scan-manual.ts     (add browser engine dispatch)
MODIFY src/inngest/functions/scan-scheduled.ts  (add browser engine dispatch + business cap)
CREATE src/inngest/functions/cron-canary-browser.ts
CREATE src/components/scan/browser-verified-badge.tsx
MODIFY src/components/scan/scan-results-client.tsx  (add badge, unavailable state)
MODIFY src/components/dashboard/rankings-page.tsx   (engine coverage indicator)
CREATE supabase/migrations/[timestamp]_browser_simulation_columns.sql
```

### Testing Checklist

- [ ] `withBrowserbaseSession` respects 5-session concurrency limit
- [ ] Session is always closed in `finally` block even if scraper throws
- [ ] `browserbaseEnabled()` returns false when env vars are absent; scan runs API-only
- [ ] `scan.manual.run` completes successfully when Browserbase returns an error (degradation)
- [ ] `collection_method = 'browser'` is set correctly on browser engine rows
- [ ] `collection_method = 'api'` is unchanged on API engine rows
- [ ] "Browser-verified" badge renders only for browser engine result cards
- [ ] "Temporarily unavailable" renders when a browser engine row is absent
- [ ] Canary job fires Slack alert when a scraper returns empty string
- [ ] Business tier capped at 2 browser scans/day (API scans continue at 6/day)
