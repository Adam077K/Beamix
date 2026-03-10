# Beamix — New Features Batch 2 Engineering Spec

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Ready for decision — includes build/no-build recommendations per feature
> **Scope:** Features 5-8: Auto-Suggest Competitors, Browser Simulation Validation, Unlinked Citation Tracking, Social Platform Monitoring

---

## Summary Table

| Feature | Tier | Monthly Cost Impact (per 1K users) | Build Effort | Recommendation |
|---------|------|-----------------------------------|-------------|----------------|
| F5: Auto-Suggest Competitors from Industry DB | Starter+ (all tiers) | +$200–$400 | 4–6 days | **BUILD — Phase 2 (Growth)** |
| F6: Browser Simulation Validation | Pro/Business only | +$400–$1,200 | 3–4 weeks + infra | **BUILD — Phase 3 (Moat Builder), scoped strictly** |
| F7: Unlinked Citation / Web Mention Tracking | Starter+ | +$800–$2,000 | 1–2 weeks | **BUILD — Phase 2 (Growth), via Perplexity leverage** |
| F8: Social Platform Monitoring (YouTube/TikTok/Reddit) | Do not build | Unpredictable | 4–6 weeks | **DO NOT BUILD — out of scope for GEO positioning** |

Cost impact estimates are additive to the baseline $15,000–$25,000/month at 1K businesses. All estimates are pre-launch projections and should be re-validated at 100 and 500 paying customers.

---

## Feature 5: Auto-Suggest Competitors from Industry Database

### A. Research & Feasibility Analysis

**What it does for the user:**

During onboarding Step 3 ("Add Competitors"), instead of a blank input field, the user sees a pre-populated list of 4–6 suggested competitors relevant to their industry and location. For a dental clinic in Tel Aviv, Beamix shows "Dr. Cohen Dental, Smile Tel Aviv, HaDentist…" The user one-clicks to add them, or types their own. Reduces a high-friction onboarding step from 2–3 minutes to 10 seconds.

Peec AI has this feature. SE Visible labels it "in development for 2026." No other competitor in the SMB tier offers it.

**Minimum viable version:**
LLM generates 5–8 competitor suggestions from business type + city. Single Haiku call at onboarding step 3. Output is a JSON array of business names with optional URLs. User can add, remove, or ignore.

**Full version:**
Combines LLM suggestion with a web search to validate that suggested competitors have a real web presence. Runs a Perplexity Sonar query for "[business type] [city]" and parses the top 5 organic results as competitor candidates, then uses Haiku to rank and de-duplicate. Costs ~2x more but significantly improves result accuracy.

**How competitors implement it:**
- Peec AI: stated as "suggested competitors based on category" in marketing. Implementation likely uses a database of known businesses by industry or a crawled business directory.
- SE Visible: listed as a 2026 roadmap item, not live.
- No competitor at SMB price has published technical details. LLM-based generation is the most plausible approach.

**Options evaluated:**

| Option | Quality | Cost/Call | Build Effort | Verdict |
|--------|---------|-----------|-------------|---------|
| Haiku generates from business type + location | Moderate — hallucinates sometimes | ~$0.001 | 1–2 days | MVP acceptable |
| Perplexity Sonar search + Haiku ranking | High — real businesses from web | ~$0.015 | 3–4 days | Preferred approach |
| Google Places API discovery | Highest — real data | ~$0.017/call | 1–2 weeks + Places API setup | Overkill for v1 |
| Manual curated lists per industry | Low maintenance quality | $0 | Weeks of curation | Not scalable |

**Recommendation:** Ship the Perplexity + Haiku approach. Adds ~$0.015 per onboarding session. At 1K signups/month, that is $15/month in costs — negligible. Google Places API adds complexity and billing setup for marginal quality gain. Manual lists do not scale past 25 industries.

---

### B. Cost Impact Analysis

**LLM calls per user:**
- 1 Perplexity Sonar call at onboarding (business discovery search): ~$0.015
- 1 Haiku call to parse, rank, and de-duplicate results: ~$0.001
- Total: ~$0.016 per user at signup, one-time

**Monthly cost at 1K active businesses:** $0 ongoing (one-time at signup). At 1K new signups/month: ~$16/month. Effectively free.

**Cost gate:** No per-tier cost difference. This runs once per business at onboarding. The cost is absorbed in the free tier as acquisition spend.

**Pricing justification:** Does not require a tier gate. It is an acquisition and onboarding improvement that reduces friction for all plans. The cost ($0.016/signup) is far below the CAC of acquiring the user.

---

### C. Engineering Spec

**Feature scope:**

Onboarding Step 3 receives the business URL, business type, and city/country from previous steps. On rendering Step 3, an API call fires immediately to `/api/onboarding/suggest-competitors`. The route runs the Perplexity + Haiku pipeline and returns up to 8 competitor suggestions. UI shows loading skeleton (1–2 second wait), then renders suggestion chips. User checks boxes or types custom entries.

**Data model changes:**

No new tables. Suggestions are ephemeral — they are not persisted. The user's confirmed competitor selections write to the existing `competitors` table via the existing onboarding complete flow.

```
competitors (existing table)
- No changes needed
- Suggestion-to-selection is a UI flow only
```

**API route:**

```
POST /api/onboarding/suggest-competitors
Auth: Required (onboarding session)
Body: { businessType: string, city: string, country: string, websiteUrl: string }
Response: { suggestions: Array<{ name: string, websiteUrl: string | null, confidence: number }> }
Rate limit: 3 calls per user per day (prevent abuse during onboarding re-runs)
```

**Pipeline (Inngest NOT needed — fast enough for synchronous response):**

1. Build Perplexity search query: `"top [businessType] competitors in [city] [country] site:none"` with localization for Hebrew if `country === 'IL'`
2. Parse Perplexity response with Haiku: extract business names, attempt URL extraction, filter out the user's own business by URL/name similarity
3. Return ranked list by confidence (URL found = higher confidence, name only = lower)
4. Cache result in Redis/Supabase edge cache for 24h keyed on `(businessType, city)` — repeated queries for same industry+city reuse cached results

**Hebrew/RTL handling:**
Query must be submitted in both Hebrew and English for Israeli businesses. Perplexity handles bilingual queries well. Return business names in the script they appear online.

**Integration dependencies:**
- Perplexity Sonar API (already integrated in agent pipeline)
- Haiku via Anthropic API (already integrated)
- No new external services

**Inngest jobs:** None. Runs synchronously in API route handler. Total latency target: under 2 seconds.

**Plan tier:** All tiers including Free (runs at onboarding, before subscription).

**Build effort:** 4–6 days
- Day 1–2: API route + Perplexity + Haiku pipeline
- Day 3: Caching layer
- Day 4: Onboarding UI changes (suggestion chips, loading state)
- Day 5–6: Hebrew query handling, edge cases, testing

**Risk factors:**
- Perplexity may return low-quality results for niche industries or small cities. Mitigation: if Perplexity returns fewer than 3 results with confidence > 0.5, fall back to Haiku-generated suggestions from training data (accepts hallucination risk for low-coverage markets).
- User's own business may appear in competitor list. Mitigation: filter by URL domain match and name similarity (fuzzy match with Haiku).

---

## Feature 6: Browser Simulation Validation (Pro Tier)

### A. Research & Feasibility Analysis

**What it does for the user:**

For Pro and Business tier users, scan results are validated against what a real user would see in the browser — not just what the API returns. When a discrepancy is detected (API says "not mentioned," browser says "mentioned at position 2"), the browser result takes precedence and the user sees an accuracy indicator: "Verified with real browser session."

This primarily matters for AI engines where the API response and the consumer UI response structurally differ:

| Engine | API Available | API ≈ Browser? | Browser Sim Needed? |
|--------|--------------|---------------|---------------------|
| ChatGPT (GPT-4o) | Yes | Largely yes | No — API sufficient |
| Gemini | Yes (Google AI API) | Largely yes | No |
| Perplexity | Yes | Largely yes | No |
| Claude | Yes | Largely yes | No |
| Grok | Yes (xAI API) | Moderate | Marginal benefit |
| DeepSeek | Yes | Largely yes | No |
| Bing Copilot | No public API | N/A — API doesn't exist | YES — only option |
| Google AI Overviews | No public API | N/A — API doesn't exist | YES — only option |
| Google AI Mode | No public API | N/A | YES |
| Meta AI | No public API | N/A | YES |

**Key insight:** Browser simulation is not a validation layer for engines that have APIs — it is the only access method for engines that have no API. The framing should be: "Browser simulation unlocks Copilot, AI Overviews, and Google AI Mode." Not: "Browser simulation gives more accurate API results."

**Minimum viable version:**
Run Playwright browser sessions only for the 3 no-API engines (Copilot, AI Overviews, AI Mode). Treat API-accessible engines as fully accurate (they are, for 90%+ of use cases). Gate this to Pro/Business.

**Full version:**
Add validation runs for API engines after every scheduled scan cycle for Pro users. Compare API results vs browser results. Surface discrepancy alerts. This adds 2-3x cost for Pro scans without proportionally improving accuracy for SMBs.

**Decision: Build the minimum viable version.** The full validation layer (API engine verification) is overkill for SMBs and triples scan costs. The correct framing is: browser simulation = more engines, not more accuracy.

**Competitor implementations:**
- Peec AI and RankPrompt list browser-based capture as their primary methodology (Playwright/Puppeteer). This suggests they run all monitoring via browser, not APIs.
- RankPrompt explicitly states "browser-based front-end capture" — which also means they cannot use system prompts or control the query format precisely.
- Beamix's API-first approach is actually more reliable and cheaper for the engines that have APIs. The competitive phrasing should be "API-first for speed and control, browser simulation for coverage."

**Infrastructure options:**

| Option | Cost | Latency | Scale | Reliability | Verdict |
|--------|------|---------|-------|-------------|---------|
| Vercel Serverless | $0 extra | 10s timeout (fatal) | Poor | Low | Not viable — Vercel's 10s limit kills browser sessions |
| Browserbase (managed) | ~$0.10–0.30/session | 5–15s | Good | High | Preferred for v1 |
| Playwright Cloud / BrowserStack | ~$0.15–0.25/session | 5–20s | Good | High | Alternative |
| Self-managed EC2 Playwright fleet | $200–800/month baseline | 5–20s | Full control | Engineering burden | Consider at 500+ Pro users |

**Browserbase pricing:** $0.10/session for the base plan. A Pro user running weekly scans across 3 no-API engines with 5 prompts each = 15 sessions/week = 60 sessions/month = $6/user/month in infrastructure costs alone. At 200 Pro users: $1,200/month in Browserbase costs.

---

### B. Cost Impact Analysis

**Scenario: Pro tier user, weekly scans, 3 browser-only engines (Copilot, AI Overviews, AI Mode), 5 prompts each**

- 3 engines × 5 prompts = 15 browser sessions per scan cycle
- Weekly cadence = 60 sessions/month per Pro user
- Browserbase cost: 60 × $0.10 = $6.00/user/month

**At 100 Pro users:** $600/month incremental infrastructure cost
**At 200 Pro users:** $1,200/month
**At 500 Pro users:** $3,000/month

**Plus parsing costs:** Each browser session response requires the same 5-stage Haiku parsing pipeline as API responses. 60 sessions × 5 Haiku calls = 300 Haiku calls/month per Pro user = ~$0.30/user/month. Marginal.

**Total incremental cost per Pro user (browser-only engines):** ~$6.30/month

**Revenue coverage:** Pro tier is $149/month. $6.30/month = 4.2% of revenue on browser simulation. Acceptable margin impact at Pro pricing.

**Should this feature justify a pricing increase?** No. $149/month already prices in the additional 3 engines. Browser simulation is a capability that enables Pro engine coverage; it is not a separate product.

**Starter tier:** Browser simulation is too costly to offer at $49/month (13% of revenue). Starter users get API-only engines (ChatGPT, Gemini, Perplexity, Claude). This is a legitimate Pro tier differentiator.

**LLM cost comparison — is the accuracy improvement worth it for API engines?**
Not at SMB scale. API vs browser response parity for ChatGPT, Gemini, and Perplexity is 90%+ for informational queries about local businesses. The 10% divergence cases are edge cases. The validation infrastructure cost ($6/user/month) spent on engines that already have APIs produces marginal accuracy improvement. Invest that budget in more scan prompts instead.

---

### C. Engineering Spec

**Feature scope:**

Browser simulation is scoped to Phase 3 (Moat Builder). At Phase 2 (Growth), Grok, DeepSeek, and You.com are added via API (already planned in scan-engine-spec). Phase 3 adds Copilot, AI Overviews, and AI Mode via Playwright + Browserbase. This is consistent with the scan-engine-spec Phase 3 deferral.

**Architecture decision:**
Browser sessions run in Inngest step functions via Browserbase's hosted Playwright endpoint. Vercel serverless functions cannot run Playwright (10-second timeout, no Chrome binary). Inngest functions can run up to 5 minutes — sufficient for browser sessions.

**Data model changes:**

```sql
-- New column on scan_engine_results (existing table)
ALTER TABLE scan_engine_results ADD COLUMN collection_method TEXT
  CHECK (collection_method IN ('api', 'browser')) DEFAULT 'api';

-- New column for confidence indication
ALTER TABLE scan_engine_results ADD COLUMN verified_browser BOOLEAN DEFAULT FALSE;
```

No new tables needed. Engine adapter type is stored per result row.

**New engine adapters (each is a TypeScript module):**

```
src/lib/scan/engines/
  copilot-browser.ts       -- Browserbase Playwright session, Bing Copilot flow
  ai-overviews-browser.ts  -- Google Search, AI Overviews extraction
  ai-mode-browser.ts       -- Google AI Mode flow
```

Each adapter:
1. Opens Browserbase session
2. Navigates to the engine URL
3. Submits the prompt via DOM interaction
4. Waits for AI response (with 30s timeout)
5. Extracts raw response text from DOM
6. Returns response string to the parsing pipeline
7. Closes session (Browserbase handles cleanup)

**Browserbase integration:**

```
src/lib/scan/browserbase-client.ts
  - createSession(options): BrowserbaseSession
  - runWithSession(fn): T  // auto-close wrapper
  - Cost tracking per session (log to audit table)
```

Environment variables:
```
BROWSERBASE_API_KEY=...
BROWSERBASE_PROJECT_ID=...
```

**Inngest job changes:**

The `scan.manual` and `scan.scheduled` Inngest functions already fan out engine calls in parallel steps. Adding browser engines requires:
1. Detecting which engines require browser simulation based on the engine registry
2. Routing those engine calls to the Browserbase path instead of the HTTP API path
3. Increased concurrency limits for the Inngest function (browser sessions are slower than API calls)

**Rate limiting consideration:**
Browser sessions take 10–30 seconds each. Running 15 sessions (3 engines × 5 prompts) in parallel would require 15 concurrent Browserbase connections. Browserbase free/starter plans limit concurrency. Set `concurrency: 5` on browser engine steps and serialize within each engine (5 prompts sequentially per engine = 3 parallel engine groups × 5 sequential prompts = 15–45 second total browser scan time).

**API routes:** No new routes. The existing scan routes handle engine selection transparently.

**Plan tier gating:**

```typescript
// In engine selection logic:
const apiEngines = ['chatgpt', 'gemini', 'perplexity', 'claude']; // All tiers
const phase2ApiEngines = ['grok', 'deepseek', 'youcom']; // Pro+
const browserEngines = ['copilot', 'ai-overviews', 'ai-mode']; // Pro+ Phase 3

function getEnginesForPlan(plan: 'starter' | 'pro' | 'business'): string[] {
  if (plan === 'starter') return apiEngines;
  if (plan === 'pro') return [...apiEngines, ...phase2ApiEngines, ...browserEngines];
  return [...apiEngines, ...phase2ApiEngines, ...browserEngines]; // Business same as Pro for engines
}
```

**Build effort:** 3–4 weeks

- Week 1: Browserbase integration, session management, cost tracking
- Week 2: Copilot and AI Overviews browser adapters (DOM selectors, response extraction)
- Week 3: AI Mode adapter, parallel execution in Inngest, concurrency tuning
- Week 4: Testing, fallback handling, Pro-tier gating, UI labels ("Browser-verified")

**Risk factors:**

1. **DOM changes break scrapers.** Copilot and Google update their UIs frequently. The DOM selectors for response extraction can break overnight. Mitigation: weekly automated canary runs that alert when a browser adapter returns 0 results for a known-good prompt. Mean time to detection: <1 week. Mean time to fix: 1–2 hours.

2. **Browserbase outages.** If Browserbase is down, Pro users lose 3 engines temporarily. Mitigation: graceful degradation — scan runs with API-only engines, browser engine results show "temporarily unavailable" in the dashboard.

3. **CAPTCHA and bot detection.** Google AI Overviews actively detects non-browser agents. Browserbase provides residential proxy rotation and human-like interaction simulation, but detection risk is non-zero. Mitigation: use Browserbase's stealth mode; rate-limit browser sessions to match realistic user behavior.

4. **Session cost drift.** If users run more manual scans than expected, Browserbase costs can spike. Mitigation: manual scan rate limits (already enforced: Starter 1/week, Pro 1/day, Business unlimited) are the primary cost gate. Browser sessions inherit the same rate limit as the scan they belong to.

---

## Feature 7: Unlinked Citation / Web Mention Tracking

### A. Research & Feasibility Analysis

**What it does for the user:**

In addition to tracking whether the user's business is mentioned by AI engines (primary product), Beamix tracks whether the business is mentioned anywhere on the web — news articles, industry blogs, local directories, review sites — even when there is no link back to the business website. An unlinked mention on a local news site ("Dr. Cohen's dental clinic was awarded Best Dentist in Tel Aviv") is valuable for AI citation sourcing even if the article never linked to the clinic's website.

The dashboard shows: "Your business was mentioned on these web sources this month" with links to the pages. Users can see which mentions already feed AI engines and which ones might, creating actionable outreach opportunities.

Ahrefs Brand Radar tracks this in their premium tier ($328+/month). No competitor at SMB pricing offers this.

**How competitors do it:**
- **Ahrefs Brand Radar:** Uses their 390B-page web index to find brand mentions. Massive proprietary infrastructure. Not replicable without years of web crawling at scale.
- **Brand24/Mention.com:** Third-party mention tracking APIs. $50–200/month per business. Non-viable at SMB scale (would eat entire margin).
- **Google Alerts API:** Free but severely limited. Delayed, incomplete coverage, no programmatic API access (Google deprecated the official API; only RSS feeds exist). Not suitable for a product feature.

**The Perplexity leverage approach:**

Beamix already integrates Perplexity Sonar Pro for agent research. Perplexity indexes the web in near-real-time and returns cited sources. A web mention check is structurally identical to a Perplexity search: query `"[business name] [city]"` and collect the URLs Perplexity cites as sources.

This is not comprehensive brand monitoring — Perplexity does not crawl all web pages. But it surfaces the same sources that AI engines are already using, which is precisely what matters for GEO. If Perplexity cites a news article that mentions the business, that article is influencing AI engine responses. Tracking it is directly actionable.

**Minimum viable version:**
- Run 1 Perplexity Sonar search per monthly scan cycle with query: `"[business name]" "[city]" OR "[business URL domain]"`
- Collect all cited URLs from Perplexity's response and sources block
- Classify each URL: already-tracked citation source vs. new web mention
- Store new web mentions in `citation_sources` table with `mention_type = 'web_unlinked'`
- Display in dashboard: "New web mentions this month" section

**Full version:**
- Multiple Perplexity queries using business name variants, owner name, product names
- Sentiment analysis on each mention
- Alert when negative mentions are detected
- Integration with Citation Builder Agent (A9) to generate outreach to positive mention sources

---

### B. Cost Impact Analysis

**LLM calls per user per month:**
- 1 Perplexity Sonar Pro call per monthly web mention scan: ~$0.015
- 3 Haiku calls to classify and extract URLs from Perplexity's sources: ~$0.003
- Optional sentiment classification per new mention (Haiku): ~$0.001 × avg 10 new mentions = $0.01
- **Total: ~$0.028/user/month for MVP**

**Monthly cost at 1K users:** $28/month — effectively free at the overall cost baseline of $15,000–$25,000/month.

**If we add weekly web mention scans (more valuable):**
- 4 Perplexity calls/month + 12 Haiku calls = ~$0.07/user/month
- Monthly cost at 1K users: $70/month — still negligible

**If we run full version (multiple query variants, sentiment on all mentions):**
- 6–8 Perplexity calls + 30 Haiku calls + sentiment per mention
- ~$0.15–0.25/user/month
- Monthly at 1K users: $150–$250/month — acceptable

**Tier gating decision:**
- **Starter:** 1 web mention scan per month (monthly cadence, MVP query)
- **Pro:** Weekly web mention scans, sentiment analysis on new mentions
- **Business:** Daily scans, all query variants, alert integration

This is a legitimate Pro/Business differentiator. Starter users get basic awareness; Pro users get actionable monitoring.

**Does adding this feature justify a pricing increase?** No — at $28/month incremental cost for 1K users, this is a value-add that strengthens the existing tiers rather than requiring a price change.

---

### C. Engineering Spec

**Feature scope:**

Web mention tracking is a scheduled scan enhancement. It runs alongside (not instead of) the AI engine scan. Results feed into the existing `citation_sources` table with a new mention type.

**Data model changes:**

```sql
-- Extend existing citation_sources table
-- Add mention_type if not already present (verify against live schema)
ALTER TABLE citation_sources ADD COLUMN IF NOT EXISTS mention_type TEXT
  CHECK (mention_type IN ('ai_citation', 'web_mention', 'directory', 'review_site'))
  DEFAULT 'ai_citation';

ALTER TABLE citation_sources ADD COLUMN IF NOT EXISTS first_detected_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE citation_sources ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE citation_sources ADD COLUMN IF NOT EXISTS mention_sentiment INTEGER; -- 0-100

-- Index for dashboard queries
CREATE INDEX idx_citation_sources_business_type
  ON citation_sources(business_id, mention_type, first_detected_at DESC);
```

No new tables needed. The `citation_sources` table already exists per the architecture layer schema.

**New Inngest job step:**

The `scan.scheduled` function gains a new step: `step.run('web-mention-scan', ...)` that runs after the AI engine scan completes. This step:

1. Builds query variants from business profile: `["[name]", "[name] [city]", "[name] reviews", "site:[domain]"]`
2. Selects query variants by plan tier (Starter: 1, Pro: 2, Business: 4)
3. Calls Perplexity Sonar Pro with each query variant
4. Parses Perplexity source blocks to extract cited URLs
5. Deduplicates against existing `citation_sources` rows (by URL)
6. Runs Haiku sentiment classification on new mentions only
7. Upserts new mentions into `citation_sources` with `mention_type = 'web_mention'`
8. Emits `alert/new-web-mentions` Inngest event if any new negative sentiment mentions found

**API routes:**

```
GET /api/dashboard/web-mentions
Auth: Required
Query: { businessId, since, limit }
Response: { mentions: CitationSource[], total: number, newThisMonth: number }
```

**Dashboard UI changes:**

`/dashboard/competitors` page or a new section on `/dashboard` overview:

```
"Web Mentions This Month" widget
├── Count badge: "14 web mentions found"
├── Breakdown: News (4), Directories (6), Blogs (3), Reviews (1)
├── Recent mentions list: [source URL, excerpt, date, sentiment badge]
└── CTA: "Use Citation Builder to reach these sources"
```

**Integration with Citation Builder Agent (A9):**
When the user clicks "Use Citation Builder," it pre-populates A9 with the list of new web mention sources as outreach targets — sources that already mention the business positively are ideal outreach candidates to request a backlink.

**Hebrew/RTL:**
Query must include Hebrew business name variant where `user_profiles.preferred_language = 'he'`. Perplexity handles Hebrew search queries. Returned URL excerpts in Hebrew display correctly in RTL context.

**Inngest jobs:** No new Inngest function. New step within existing `scan.scheduled` and `scan.manual` functions.

**Plan tier gating:**

| Tier | Query Variants | Cadence | Sentiment | Alerts |
|------|---------------|---------|-----------|--------|
| Starter | 1 (name + city) | Monthly | No | No |
| Pro | 2 variants | Weekly | Yes | Yes (negative only) |
| Business | 4 variants | Daily | Yes | Yes (all) |

**Build effort:** 1–2 weeks

- Day 1–2: Extend `citation_sources` schema, Perplexity web mention pipeline
- Day 3–4: Deduplication logic, sentiment classification, Inngest step integration
- Day 5–6: Dashboard UI widget
- Day 7–8: Alert integration, tier gating, Hebrew query handling, testing

**Risk factors:**

1. **Perplexity coverage gaps.** Perplexity does not index the entire web. Small local businesses may have web mentions on pages Perplexity never indexed (local newspaper archives, Hebrew-only sites). Mitigation: label results "Web mentions found by AI-indexed sources" — sets accurate expectations.

2. **False positives.** A business named "Apple" will surface Apple Inc. mentions. Mitigation: post-filter Perplexity results with Haiku: "Does this source specifically mention this business located in [city] that provides [services]?" Filter out pages where confidence score < 0.7.

3. **Rate limiting on Perplexity.** At 1K users running daily web mention scans on Business tier, that is 1K Perplexity calls/day minimum for this feature alone, plus agent research calls. Mitigation: stagger cron execution across the day (already done for scheduled scans); Business tier users are a small fraction of total users.

---

## Feature 8: Social Platform Monitoring (YouTube, TikTok, Reddit)

### A. Research & Feasibility Analysis

**What it does (hypothetically):**

Tracks when a brand is mentioned in YouTube video titles/descriptions, TikTok captions, or Reddit threads. Shows "You were mentioned in 3 Reddit threads and 1 YouTube video this month." Ahrefs Brand Radar includes this across their 6 monitoring indexes.

**Does this fit Beamix's GEO positioning?**

No. This is the key analytical question and the answer is clearly no.

Beamix's core value proposition is: "AI engines mention your competitors instead of you — Beamix finds out why and fixes it." The entire platform is built around the closed loop: AI visibility scan → diagnosis → agent fixes content → re-scan shows improvement.

Social platform monitoring is a different value proposition entirely: "Track where your brand is discussed across social media." This is brand monitoring, not GEO. The users who care about Reddit threads and TikTok mentions are PR and social media teams, not the SMB owner trying to appear in ChatGPT results.

**API availability:**

| Platform | API | Free Tier | Quality |
|----------|-----|-----------|---------|
| YouTube Data API v3 | Yes | 10,000 units/day (very limited) | Good for search, no transcript access |
| Reddit API (PRAW) | Yes | Free, rate-limited at 100 req/min | Good for search |
| TikTok API | Research API only, approved accounts | Extremely limited, brand monitoring not available | Poor |

**Technical feasibility:**
Reddit is straightforward. YouTube is moderate effort. TikTok is practically inaccessible for brand monitoring without the Research API (requires approval, academic/research use only). TikTok's consumer-facing content monitoring is not available programmatically.

**Why the system design doc lists this as "Intentionally Skipped":**

The master system design (`BEAMIX_SYSTEM_DESIGN.md` §7) explicitly lists "YouTube/TikTok/Reddit monitoring" as intentionally skipped with the rationale: "orthogonal to GEO positioning." This spec concurs and reinforces that decision.

---

### B. Cost Impact Analysis

**API costs:**

- YouTube: Free within quota. Quota exhaustion costs $0.10 per 1,000 additional units. At monitoring scale, $50–200/month.
- Reddit: Free for rate-limited access. No cost barrier.
- TikTok: Research API approval required. Realistically unavailable for commercial brand monitoring.

**Engineering cost:**
4–6 weeks to build a functional social monitoring system. That is 4–6 weeks not spent on features that directly improve GEO outcomes (more AI engines, better citation tracking, agent improvements).

**Opportunity cost:**
Every week spent on social monitoring is a week not spent on:
- Adding Copilot and AI Overviews via browser simulation (direct GEO value)
- Improving the Perplexity web mention system (Feature 7)
- Building the Hebrew prompt library (monopoly opportunity)
- Improving scan engine accuracy

**Does this justify a pricing increase?** Social monitoring might allow Beamix to charge a higher "business intelligence" tier, but it would dilute the product's focus and compete against dedicated tools (Brand24, Mention.com, Sprout Social) that do social monitoring as their core competency — with far more data.

---

### C. Engineering Spec

**Recommendation: Do Not Build**

This feature is out of scope for Beamix Phase 1, 2, and 3. The reasoning:

1. **Wrong value proposition.** Social mentions on Reddit do not correlate reliably with AI engine visibility. The GEO problem (why ChatGPT does not mention your business) is not solved by knowing you were mentioned in a Reddit thread.

2. **Competing against specialists.** Brand24, Mention.com, and Talkwalker have been building social monitoring for years with multi-billion-dollar web indexes. Beamix cannot match their coverage as a side feature.

3. **TikTok is inaccessible.** The TikTok Research API is not available for commercial brand monitoring. "Social monitoring" without TikTok in 2026 is an incomplete product promise.

4. **Engineering cost does not justify GEO value.** 4–6 weeks of build time produces a feature that does not help the user appear in ChatGPT results. The Beamix brief is "AI search visibility." Social monitoring is adjacent but not core.

5. **The one legitimate signal — Reddit — is covered more cheaply via Perplexity.** Perplexity frequently cites Reddit threads in its search results. Feature 7 (Web Mention Tracking via Perplexity) already captures Reddit citations that are influencing AI engines. That is the part of Reddit that matters for GEO.

**If the owner believes social monitoring belongs in the product long-term:**

This should be scoped as a Business-tier "Brand Intelligence" add-on at Phase 4 or later, positioned separately from the core GEO product. It should not share roadmap priority with Phase 2 or Phase 3 GEO features. If it is ever built, scope it to Reddit only (API available, most relevant to AI citations) and YouTube (API available). TikTok should be explicitly excluded until the Research API becomes commercially accessible.

**Suggested alternative use of the roadmap slot:** Use the 4–6 weeks that would have gone to social monitoring on Feature 6 (Browser Simulation — Copilot + AI Overviews) instead. That investment directly unlocks 2–3 more scan engines for Pro users and closes a genuine gap against Profound, Peec, and RankPrompt.

---

## Cross-Feature Notes

### Sequencing Recommendation

| Phase | Feature | Rationale |
|-------|---------|-----------|
| Phase 2 (Growth) | F5: Auto-Suggest Competitors | Low cost, high onboarding impact, ships in 1 week |
| Phase 2 (Growth) | F7: Web Mention Tracking | Low cost, direct GEO value, reuses Perplexity integration |
| Phase 3 (Moat Builder) | F6: Browser Simulation | Infrastructure investment unlocks 3 more engines for Pro |
| Deferred / Never | F8: Social Monitoring | Out of scope for GEO positioning |

### Shared Infrastructure

F5 and F7 both use Perplexity Sonar Pro, which is already integrated for agent research. Both features can reuse the same Perplexity client, rate-limit tracking, and cost logging infrastructure. No new external service contracts required.

F6 (Browser Simulation) requires Browserbase — the only new external service dependency across these four features. Evaluate Browserbase pricing and availability before committing to Phase 3.

### Cost Summary (at 1K users, monthly)

| Feature | Incremental Monthly Cost |
|---------|------------------------|
| F5: Auto-Suggest Competitors | ~$16 (one-time per signup, not recurring) |
| F7: Web Mention Tracking (Starter cadence) | ~$28–70 |
| F7: Web Mention Tracking (Pro/Business full version) | ~$150–250 |
| F6: Browser Simulation (200 Pro users) | ~$1,260 |
| F8: Social Monitoring | — (not building) |
| **Total F5+F7 addition** | **~$180–320/month** |
| **Total with F6** | **~$1,440–1,580/month** |

These additions represent a 0.7%–6.3% increase over the $15,000–$25,000/month baseline — all within acceptable margin range given the Pro tier pricing.
