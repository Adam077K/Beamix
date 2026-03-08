# Competitive Intelligence Feature Specification

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Ready for implementation
> **Priority:** Growth Phase (Competitive Intelligence Dashboard) / Launch Critical (competitor data collection via scan pipeline Stage 5)
> **Source documents:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md`, `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md`, `_SYSTEM_DESIGN_PRODUCT_LAYER.md`

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Competitive Intelligence Page](#2-competitive-intelligence-page-dashboardcompetitors)
3. [Competitor Data Model](#3-competitor-data-model)
4. [How Competitor Tracking Works — Technical Flow](#4-how-competitor-tracking-works--technical-flow)
5. [Competitor Intelligence Agent — A8](#5-competitor-intelligence-agent--a8)
6. [Alert Integration](#6-alert-integration)
7. [Share of Voice Calculation](#7-share-of-voice-calculation)
8. [API Routes](#8-api-routes)
9. [Engineering Notes](#9-engineering-notes)

---

## 1. Feature Overview

### 1.1 What the Competitive Intelligence System Does

The Competitive Intelligence system tracks how competitor businesses appear across AI engines relative to the user's business. It answers the question: "Who is winning in AI search, and why?"

The system has two layers:

**Passive tracking (Launch Critical — embedded in scan pipeline):**
Every scan already extracts competitor mentions from AI engine responses as part of Stage 5 of the parsing pipeline. This happens automatically on every scheduled and manual scan without user action. The data is stored in `competitor_scans` and aggregated into `competitor_share_of_voice`. Competitor tracking is always on — it's a natural byproduct of parsing AI responses.

**Active analysis (Growth Phase — the intelligence layer):**
The Competitive Intelligence dashboard (`/dashboard/competitors`) surfaces this data as visualizations, gap analysis, and source-level comparisons. Agent A8 (Competitor Intelligence) performs deep, on-demand analysis that goes beyond mention counting to explain why competitors rank and what to do about it.

### 1.2 Why This Matters — The Core Value Propositions

**Share of voice vs. absolute score:** A business's visibility score in isolation is meaningless without competitive context. A score of 65/100 is excellent if competitors average 40, and alarming if competitors average 80. Share of voice — what percentage of AI mentions go to each business vs. competitors — is the metric that drives action.

**Competitor Weakness Alert:** When a competitor's visibility drops, that creates an overtake opportunity. Beamix detects these drops and alerts the user: "Competitor X dropped 12 points on Perplexity this week. You are 8 points behind them — now is the time to close the gap." This is a "Competitor Weakness Alert" and is one of 8 genuinely novel Beamix innovations identified in competitive research. No competitor currently offers this.

**Anonymous tracking:** Competitors never know they are being tracked. Beamix queries AI engines with the competitor's name in the same prompts it uses for the user's business, and parses the results. No outreach, no web scraping of competitor sites, no contact. The tracking is entirely based on how AI engines respond to queries.

### 1.3 Classification by Priority

| Component | Priority | Reason |
|---|---|---|
| Stage 5 competitor extraction in scan pipeline | Launch Critical | Required for basic scan completeness; zero incremental cost |
| `competitors` + `competitor_scans` tables | Launch Critical | Required to store extracted data |
| Tier limits on tracked competitors (3/5/10) | Launch Critical | Required for plan differentiation |
| Auto-detection of new competitors from scan | Launch Critical | Happens in scan pipeline, no separate feature needed |
| Competitive Intelligence dashboard (`/dashboard/competitors`) | Growth Phase | Requires sufficient scan history to be meaningful |
| Share of voice chart + comparison table | Growth Phase | Visualization layer on top of existing data |
| Gap analysis view | Growth Phase | Requires aggregation queries across scan history |
| Source-level citation comparison | Growth Phase | Requires `citation_sources` data to be populated |
| A8 (Competitor Intelligence Agent) | Growth Phase | Expensive per-run; value increases with scan history |
| Competitor Weakness Alerts | Moat Builder | Complex alert logic; listed in priority classification |

---

## 2. Competitive Intelligence Page (`/dashboard/competitors`)

### 2.1 Page Purpose

The Competitive Intelligence page is the command center for understanding competitive positioning in AI search. It shows who is winning, where, and by how much — with direct pathways to close identified gaps.

**URL:** `/dashboard/competitors`

### 2.2 Competitor List and Management

At the top of the page: the user's tracked competitors.

- List view: competitor name, domain, date added, visibility score (most recent scan), trending direction arrow (up/down/stable), source (manual / auto-detected)
- **Add competitor** button: opens modal to enter competitor name or URL. Normalizes the URL to extract domain. Validates against tier limit (Starter: 3, Pro: 5, Business: 10). POST `/api/competitors`
- **Remove competitor** button (per row): DELETE `/api/competitors/[id]`
- **Auto-detected competitors** section: competitors found in AI responses that are not yet tracked. Each shows: name, number of times detected, which engines mentioned them. User can click "Track" to add to tracked list (subject to tier limit).

### 2.3 Share of Voice Chart

A stacked bar chart or pie chart showing the percentage of AI engine mentions captured by the user's business vs each tracked competitor over the most recent 7-day period.

**Data source:** `competitor_share_of_voice` table. The weekly cron computes these percentages.

**Chart data shape:**
```
{
  period: "2026-W10",
  entities: [
    { name: "Beamix (You)", voice_share_pct: 34.5, mention_count: 47 },
    { name: "Competitor A", voice_share_pct: 28.2, mention_count: 38 },
    { name: "Competitor B", voice_share_pct: 22.1, mention_count: 30 },
    { name: "Others", voice_share_pct: 15.2, mention_count: 21 }
  ]
}
```

**Time range toggle:** 7d / 30d / 90d. Selecting 30d or 90d aggregates multiple `competitor_share_of_voice` rows.

**Interaction:** Clicking a competitor entity in the chart scrolls to that competitor's detail card below.

### 2.4 Competitor Profile Cards

One card per tracked competitor, below the share of voice chart.

**Each card displays:**
- Competitor name and domain
- Overall AI visibility score (computed same way as user's score, but using `competitor_scans` data instead of `scan_engine_results`)
- Trending direction: score delta vs previous scan (+12 / -8 / stable)
- Top AI queries where this competitor appears (ranked by frequency)
- Which engines mention them most (bar chart: ChatGPT / Gemini / Perplexity / etc.)
- Citation sources: "Most cited by: techcrunch.com, g2.com, yelp.com"
- "Analyze" button: triggers A8 (Competitor Intelligence Agent) for deep analysis of this specific competitor

### 2.5 Gap Analysis View

A ranked table of queries where competitors appear but the user's business does not.

**Columns:**
- Query text
- Competitor(s) that appear
- Engine(s) where gap exists
- Competitor's position in that engine
- Opportunity score (computed: how many engines show this gap × competitor's average sentiment × estimated query volume)
- "Fix This Gap" button — pre-fills Content Writer (A1) with the query as the target topic and the relevant content type (comparison/article/FAQ) based on the query type

**Sort:** Default by Opportunity Score descending (highest-value gaps first).

**Filter:** By engine, by competitor, by content type suggestion.

### 2.6 Comparison Table

Side-by-side comparison: user's business vs each tracked competitor, per query, per engine.

**Rows:** All tracked queries + queries where competitors are detected but user is not (shown with "Gap" indicator)
**Columns:** User, Competitor A, Competitor B, …

**Cell values:**
- Position number (e.g., "2") with colored background (green = top 3, yellow = 4-6, gray = 7+)
- "Not mentioned" in red
- Sentiment indicator: small colored dot (red/yellow/green based on 0-100 scale)

**Filtering:** Engine dropdown (show comparison for a specific AI engine), date picker (compare for a specific scan date).

### 2.7 Source-Level Citation Comparison

**Priority:** Growth Phase

For each competitor, a collapsible section shows which URLs AI engines cite when recommending that competitor, compared to what they cite for the user's business.

**Example output:**
```
ChatGPT cites for Competitor A:         ChatGPT cites for You:
  techcrunch.com/competitor-review       yelp.com/your-business
  g2.com/competitors/competitor-a        (no tech press coverage)
  competitor.com/case-studies            your-website.com/about
```

**Value:** This reveals why competitors rank better. If ChatGPT cites TechCrunch articles for the competitor but only Yelp reviews for the user, the action is clear: pursue tech press coverage (trigger A9 Citation Builder for those sources).

**CTA:** "Create content to target these citations" — opens Content Writer with citation source context injected.

### 2.8 Content Pattern Insights

**Priority:** Growth Phase

A section showing structural patterns in competitor content that AI engines cite, compared to the user's content.

**Example insights:**
- "Competitor A content that gets cited averages 2,000 words. Your content averages 800 words."
- "Competitor B always includes an FAQ section with 6+ questions. 3 of your 12 published articles have FAQ sections."
- "All 5 cited competitor pages include LocalBusiness JSON-LD schema. None of your location pages do."

**Data source:** A14 (Content Pattern Analyzer) output, enriched with competitor-specific citation data from `citation_sources`.

**CTA:** "Fix pattern gaps" — links to relevant agents (A1 for content length/structure, A3 for schema, A5 for FAQ content).

### 2.9 Empty State

Shown when the user has no tracked competitors:

- Icon: Binoculars / spy glass
- Headline: "Know what your competitors are doing"
- Description: "Add competitors to track how they rank across AI engines compared to you."
- CTA: "Add Competitor" → opens competitor add modal

---

## 3. Competitor Data Model

### 3.1 `competitors` Table

Businesses tracked as competitors by the user. Each row represents one competitor tracked against one user business.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| `business_id` | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | The user's business this competitor is tracked against |
| `user_id` | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner (denormalized for RLS policy) |
| `name` | text | NOT NULL | Competitor business name (as it appears in AI responses) |
| `domain` | text | | Competitor website domain (e.g., `competitor.com`) |
| `source` | text | DEFAULT 'manual', CHECK IN ('manual', 'auto_detected') | How competitor was added |
| `is_active` | boolean | DEFAULT true | Whether actively tracked |
| `created_at` | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_competitors_biz` on `(business_id)` WHERE `is_active = true`

**RLS:** Users can SELECT, INSERT, UPDATE, DELETE for their own businesses (`user_id = auth.uid()`).

**Tier limits (enforced at API layer, not DB layer):**
- Starter: 3 active competitors max
- Pro: 5 active competitors max
- Business: 10 active competitors max

When a user tries to add a competitor beyond their tier limit, the API returns 402 with `{ error: 'Competitor limit reached for your plan', limit: 3, upgrade_url: '/pricing' }`.

**Name normalization:** Competitor names are stored as the user entered them or as auto-detected from AI responses. Before inserting, the system normalizes: trim whitespace, normalize Unicode, strip common suffixes ("Ltd", "LLC", "Inc", "Corp") for deduplication. The normalized form is used for matching; the display name is preserved.

### 3.2 `competitor_scans` Table

Per-scan results for each tracked competitor. One row per competitor per engine per scan. This is the atomic data underlying all competitive analysis.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| `scan_id` | uuid | NOT NULL, FK → scans(id) ON DELETE CASCADE | Parent scan |
| `competitor_id` | uuid | NOT NULL, FK → competitors(id) ON DELETE CASCADE | Which competitor |
| `business_id` | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Denormalized for query performance |
| `engine` | text | NOT NULL | Engine identifier (chatgpt, gemini, perplexity, claude, grok, deepseek, youcom) |
| `is_mentioned` | boolean | NOT NULL, DEFAULT false | Was the competitor mentioned in this engine's response? |
| `rank_position` | integer | | Competitor's position in the response (1-based, NULL if not mentioned) |
| `sentiment_score` | integer | CHECK (0-100) | Sentiment toward the competitor in this response (0=negative, 100=positive) |
| `mention_context` | text | | 2-3 sentence excerpt surrounding the competitor mention |
| `created_at` | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_comp_scans_scan` on `(scan_id)` — all competitor results for one scan (used in scan pipeline)
- `idx_comp_scans_competitor` on `(competitor_id, created_at DESC)` — competitor visibility trend over time
- UNIQUE on `(competitor_id, scan_id)` — one result per competitor per scan (prevents duplicate inserts on retry)

**RLS:** Users can SELECT where `business_id` belongs to them (`business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())`). Only service role can INSERT (populated by scan pipeline).

**Important design note:** `competitor_scans` has one row per competitor per scan, not per competitor per engine per scan per query. This is an aggregate per scan — the competitor's overall mention state across all queries for that scan is stored here. The raw per-query, per-engine competitor data lives in `scan_engine_results.competitors_mentioned` (a text array). Stage 5 of the parsing pipeline aggregates from there into `competitor_scans`.

### 3.3 `competitor_share_of_voice` Table

Weekly aggregated share-of-voice data. Computed by `cron.weekly-digest` (Monday 8AM UTC). One row per business per competitor per week.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| `business_id` | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business being analyzed |
| `competitor_id` | uuid | FK → competitors(id) ON DELETE CASCADE | Competitor being measured. NULL = the user's own business (self-share) |
| `week_start` | date | NOT NULL | Start of the measurement week (Monday) |
| `voice_share_pct` | numeric(5,2) | NOT NULL | Percentage of total mentions captured (0.00-100.00) |
| `mention_count` | integer | NOT NULL, DEFAULT 0 | Total mentions for this entity during the week |
| `created_at` | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_sov_biz_week` on `(business_id, week_start DESC)` — weekly share-of-voice trend queries
- UNIQUE on `(business_id, competitor_id, week_start)` — one measurement per entity per week (safe to re-run weekly cron with upsert)

**RLS:** Users can SELECT where `business_id` belongs to them. Service role inserts (computed by weekly cron).

**Self-share row:** The user's own business is stored in this table with `competitor_id = NULL`. This means when querying share-of-voice for a business, a NULL `competitor_id` row represents the user's own share. This allows a single query to return all entities in the share-of-voice breakdown without a UNION.

### 3.4 How `scan_engine_results` Feeds Competitor Data

The connection between raw scan data and competitor tracking runs through `scan_engine_results.competitors_mentioned`:

```
scan_engine_results.competitors_mentioned: text[]
  -- Array of competitor names found in this AI engine's response to this prompt
  -- e.g., ['Competitor A', 'Competitor B', 'Acme Corp']
  -- Populated by Stage 5 of the parsing pipeline (Haiku)
```

Stage 5 produces this data. The scan pipeline's `store-results` step then:
1. Reads all `scan_engine_results` rows for the completed scan
2. For each competitor name found in `competitors_mentioned`:
   - Check if a `competitors` row exists for this `business_id` with this name (fuzzy match — see §4.2)
   - If yes: update the existing `competitor_scans` row for this scan
   - If no: auto-add to `competitors` with `source = 'auto_detected'` (subject to tier limit — if limit reached, flag for user notification instead of inserting)
3. Aggregate per-engine mention data into `competitor_scans` rows

---

## 4. How Competitor Tracking Works — Technical Flow

### 4.1 Step-by-Step: Every Scan

Every scheduled scan (`scan.scheduled.run`) and manual scan (`scan.manual.run`) executes the same competitor extraction pipeline:

**Step 1: Engine queries (Step 3 of scan pipeline)**

The scan queries AI engines with the tracked prompts. AI engine responses include natural-language recommendations that mention other businesses by name.

**Step 2: Stage 5 of response parsing pipeline — Competitor Extraction**

For each AI engine response, Stage 5 runs a Haiku LLM call with this instruction structure:

```
Given this AI engine response about [industry] businesses in [location],
list every business name mentioned other than [user_business_name].

For each business found, identify:
1. Its position in the response (if in a list) or approximate order (if prose)
2. The sentiment toward it in this response (0-100 numeric scale)
3. Whether it is currently tracked as a competitor: [list of tracked competitor names]

Return as JSON array: [{ name, position, sentiment, isTracked }]
```

The Haiku model returns a structured list of all businesses mentioned. This is the most context-sensitive stage of parsing — it requires understanding natural language ("along with Competitor A and B, you might also consider...") to extract implicit rankings.

**Step 3: Normalize and match competitor names**

The extracted names are matched against the `competitors` table using fuzzy matching:
- Exact case-insensitive match (primary)
- Domain match (if `competitors.domain` is set and the AI response mentioned the domain)
- Normalized match: strip common suffixes ("Ltd", "LLC", "Inc", "Corp", "&"), normalize Unicode, compare
- Levenshtein distance < 2 for names under 15 characters (catches typos like "Google" vs "Gogle")

If a match is found: linked to the existing `competitors.id`.
If no match: this is a new competitor detected by AI.

**Step 4: Auto-add new competitors**

For each unmatched competitor name:
1. Check current active competitor count for this business: `SELECT COUNT(*) FROM competitors WHERE business_id = $1 AND is_active = true`
2. If count < tier_limit: INSERT new `competitors` row with `source = 'auto_detected'`, `is_active = true`
3. If count >= tier_limit: INSERT `competitors` row with `is_active = false` (stored but not tracked). Queue an in-app notification: "Beamix detected a new competitor: [Name]. Add it to your tracked list." (user must manually activate and remove another to stay within tier limit)

**Step 5: Upsert `competitor_scans` rows**

For each active tracked competitor, aggregate the per-query, per-engine data from `scan_engine_results.competitors_mentioned` into a single `competitor_scans` row for this scan:

```
INSERT INTO competitor_scans (
  scan_id, competitor_id, business_id, engine,
  is_mentioned,     -- true if competitor appeared in ANY query for this engine
  rank_position,    -- best (lowest) position across all queries
  sentiment_score,  -- average sentiment across all queries where mentioned
  mention_context   -- best excerpt (from the highest-sentiment mention)
)
ON CONFLICT (competitor_id, scan_id) DO UPDATE ...
```

**Step 6: Compute share of voice (weekly cron)**

The `competitor_share_of_voice` table is NOT updated per scan — it's computed weekly by `cron.weekly-digest`:

1. Aggregate all `scan_engine_results` and `competitor_scans` from the past 7 days for this business
2. Count total mentions per entity: user's business (from `scan_engine_results.is_mentioned`) + each competitor (from `competitor_scans.is_mentioned`)
3. Compute share: `entity_mentions / total_mentions * 100`
4. UPSERT into `competitor_share_of_voice` with `week_start = current Monday`

### 4.2 Fuzzy Name Matching Implementation Notes

Competitor name matching is the most fragile part of this pipeline. Business names appear in many forms in AI responses:

| AI Response Form | Business Name | Strategy |
|---|---|---|
| "Beamix" | "Beamix" | Exact match |
| "beamix.io" | "Beamix" | Domain match |
| "Beamix Ltd." | "Beamix" | Strip suffix + exact |
| "BeMix" | "Beamix" | Levenshtein distance = 2 |
| "Beamix (the GEO platform)" | "Beamix" | Contained in parenthetical |
| "beamix" | "Beamix" | Case-insensitive exact |

The matching runs at Stage 5 parsing time (Haiku). The Haiku prompt includes the list of known tracked competitors and their domains, instructing the model to flag matches even in alternate forms.

False positive risk: "Microsoft" and "Microsofft" (typo in AI response) would match. This is acceptable — it is better to over-match and have the user optionally remove a false match than to under-match and miss a genuine competitor mention.

False negative risk: A competitor operating under a trade name different from their registered name may not match. Mitigation: allow users to add alias names for competitors (future enhancement — not v1).

### 4.3 Privacy: No Cross-User Data Leakage

Competitor data is strictly isolated per user. The RLS policy on `competitor_scans` reads:

```sql
CREATE POLICY "competitor_scans_select" ON competitor_scans
FOR SELECT USING (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
);
```

This means User A can never see User B's competitor scan data, even if they track the same competitors. Two different users tracking "Competitor A" each have their own `competitors` rows, their own `competitor_scans` rows, and their own share-of-voice data. There is no shared competitor pool.

The only aggregated, shared data is in `prompt_library` and `prompt_volumes` — prompt volume estimates that are anonymized and cross-user by design (explicit, documented behavior). Competitor visibility data is never aggregated across users.

---

## 5. Competitor Intelligence Agent — A8

**Priority:** Growth Phase (not Launch Critical, but data collection is Launch Critical — see §1.3)

### 5.1 What A8 Does

A8 (Competitor Intelligence Agent) performs deep competitive analysis beyond what the passive scan pipeline captures. While the passive pipeline counts mentions and computes share of voice, A8:

- Actively scans AI engines with competitor names across all tracked prompts
- Computes a structured comparison matrix (where competitor outperforms user, by how much, on which engines)
- Identifies citation sources competitor content earns that user content does not
- Analyzes structural and tonal patterns in competitor content that gets cited
- Generates a strategic action plan: specific, executable recommendations with "Run Agent" links

A8 is triggered in two ways:
1. **Manual:** User clicks "Analyze" on a competitor card in the dashboard
2. **Automated:** The Competitor Alert Response workflow triggers A8 when a competitor overtakes the user on a tracked query

### 5.2 Cost Profile — Critical Engineering Consideration

A8 is the most expensive agent per execution in the entire system. Engineers and product must understand this:

**Cost calculation (Pro tier, 3 competitors, 25 tracked queries, 8 engines):**
```
Engine calls: 3 competitors × 25 queries × 8 engines = 600 engine calls
Engine call cost: ~$0.80 (ChatGPT/Gemini/Perplexity mix at average ~$0.0013/call)
Parsing (5 Haiku stages × 600 responses): 3,000 Haiku calls at ~$0.001 each = $3.00
Comparative analysis (2× Sonnet): ~$0.50
Total per A8 run: $3.00-6.00
```

This is 10-20x the cost of a typical content agent run ($0.15-0.40). Implications:
- A8 should NOT be on a daily cron schedule
- The automated Competitor Alert Response workflow should trigger A8 selectively (only when a significant overtake event occurs, not on small fluctuations)
- Perplexity rate limit allocation: A8 claims 40% of total Perplexity RPM budget (16 of 40 RPM). A single A8 run with 75 Perplexity calls takes ~5 minutes of dedicated bandwidth.
- **A8 runs are queued.** If queue depth > 5, user sees "Expected wait: ~X min" computed from `current_queue_depth × average_execution_time_per_run`.
- **Competitor research caching:** Results are cached 24 hours per competitor domain. If the same competitor was analyzed within 24h (by any user in the same industry — same competitor domain), the cached research is reused. The comparative analysis and strategy generation are still personalized per user.

### 5.3 A8 LLM Pipeline

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|---|---|---|---|---|---|
| 1. Multi-Engine Scan | All active engines (fan-out) | Query the same tracked prompts with competitor names to gather their visibility data | Raw competitor scan results across all engines + prompts | — | — |
| 2. Comparative Analysis | Claude Sonnet 4.6 | Deep comparison: where competitor outperforms user, why AI prefers them, structural/content advantages | Structured comparison matrix: per-engine, per-query visibility; citation sources competitor earns; content formats they use | 0.5 | 3,000 |
| 3. Strategic Report | Claude Sonnet 4.6 | Generate actionable intelligence: gaps to close, strategies to steal, unique angles to exploit | Intelligence report with prioritized action items, each linked to a specific agent that can execute the fix | 0.7 | 4,000 |

**Fallback model for Stage 1 (Perplexity rate limit hit):** Fall back to DeepSeek for the research stage using the same research prompt. DeepSeek provides adequate research quality for competitor analysis at lower cost, though without Perplexity's real-time web grounding.

**Quality Gates:**
- Comparison must cover all tracked queries and all active engines (no partial results delivered as complete)
- Each action item must be specific and executable: not "improve content" but "create a comparison article covering X vs Y targeting the query 'best X in location'" with a direct "Run Agent" link pre-filled with that context
- A minimum of 3 substantive data points per competitor are required before analysis proceeds

### 5.4 A8 Output Format

A8 produces a structured report stored in `agent_jobs.output_data`:

```typescript
interface A8Output {
  competitorProfiles: Array<{
    competitorId: string;
    name: string;
    overallVisibilityScore: number;
    topQueries: Array<{ query: string; position: number; engine: string }>;
    citedSources: Array<{ url: string; domain: string; frequency: number }>;
    contentStrategy: string;  // LLM-generated description
  }>;
  comparisonMatrix: Array<{
    query: string;
    userPosition: number | null;
    competitorPositions: Record<string, number | null>;  // competitorId → position
    gapEngines: string[];  // engines where competitor appears but user does not
  }>;
  gapAnalysis: Array<{
    query: string;
    competitor: string;
    engines: string[];
    opportunityScore: number;
    suggestedAction: {
      description: string;
      agentType: string;
      prefilledParams: Record<string, unknown>;
    };
  }>;
  strategicReport: string;  // Full narrative report in Markdown
  actionItems: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    agentType: string;
    agentParams: Record<string, unknown>;
  }>;
}
```

This output is stored in `agent_jobs.output_data`. Since A8 is a non-content agent (it produces a report, not a publishable content piece), it does NOT create a `content_items` row. The report is displayed directly in the Agent Chat UI.

### 5.5 How A8 Results Feed Into Other Tables

After A8 completes, the `agent.execute` finalization step performs:

1. **Update `competitor_scans`:** The multi-engine scan data from Stage 1 is significantly richer than what the passive scan pipeline captures (A8 uses ALL tracked prompts vs. the passive pipeline's sampled prompts). These results are stored in `competitor_scans`, potentially updating rows from the most recent scan.

2. **Insert `recommendations`:** Each action item from A8's strategic report is inserted into `recommendations` with `suggested_agent` set to the relevant agent type. This surfaces A8's insights in the Recommendations dashboard (`/dashboard/recommendations`) with "Run Agent" buttons.

3. **Update `competitors`:** If A8 discovered any competitor domains during research (from citation sources), update `competitors.domain` if it was previously null.

---

## 6. Alert Integration

### 6.1 Competitor Alert Types

The `alert_rules` table supports two competitor-related alert types:

| `alert_type` | `threshold` shape | Default | Description |
|---|---|---|---|
| `competitor_overtake` | `{ points_ahead: integer }` | `{ points_ahead: 5 }` | Alert when a competitor's visibility score exceeds the user's by this many points |
| `new_competitor` | `{}` | (no threshold needed) | Alert when a new competitor is auto-detected from AI scan responses |

Both alert types fire through the standard `alert.evaluate` Inngest function, triggered by the `scan/complete` event after every scan.

### 6.2 Competitor Overtake Alert Evaluation

In the `evaluate-rules` step of `alert.evaluate`:

For each alert_rule with `alert_type = 'competitor_overtake'`:
1. Load current scan's overall visibility score for the user's business
2. Load current scan's competitor visibility scores (from `competitor_scans` joined through the scan)
3. For each tracked competitor: check if `competitor_score - user_score >= threshold.points_ahead`
4. Deduplication: check `alert_rules.last_triggered_at` — if triggered within `cooldown_hours` (default 24h), skip
5. If triggered and NOT deduplicated:
   - UPDATE `alert_rules.last_triggered_at = NOW()`
   - INSERT `notifications` row
   - If `channels` includes 'email': send via Resend
   - If `channels` includes 'slack': POST to webhook URL
   - Emit `workflow/trigger` event if "Competitor Alert Response" workflow is active (see §6.3)

### 6.3 Competitor Alert Response Workflow Chain

**Priority:** Growth Phase (workflow chains are Growth Phase)

When a competitor overtakes the user, the Competitor Alert Response workflow automatically responds:

```
Trigger: alert/rule.triggered where alert_type = 'competitor_overtake'
  → Step 1: A8 (Competitor Intelligence) runs focused analysis on the overtaking competitor
            Input: { competitor_id, focus_on_overtake: true, triggering_query: query }
  → Step 2: A4 (Recommendations) generates competitive response recommendations
            (uses A8 output as additional context)
  → Step 3: Notification to user:
            "Competitor X overtook you for 'best Y in Z'. We analyzed the gap.
            Here are 3 things you can do now. [View Analysis]"
```

This workflow is defined in `agent_workflows` with `trigger_type = 'competitor_overtake'`. It is one of the 4 pre-built workflow templates available in the Agent Hub.

**Cost gate:** Before triggering A8 in this workflow, the system checks credit availability. If the user has < 1 credit remaining, the workflow skips the A8 step and sends the notification with a recommendation to run A8 manually when credits are available.

### 6.4 Alert Rule Configuration UI

In the Alert Rules settings (accessible from the sidebar notification bell → "Manage Alert Rules"):

**Competitor alert configuration:**
- Alert type: "Competitor Overtake" (select from dropdown)
- Threshold: "Alert me when a competitor is [N] or more points ahead of me" — number input, default 5
- Competitors to monitor: "All tracked competitors" or "Select specific competitors" (multi-select from tracked list)
- Channels: In-app (always enabled) / Email / Slack
- Cooldown: "Don't alert me more than once every [24h / 12h / 7d]"

**New competitor alert configuration:**
- Alert type: "New Competitor Detected"
- No threshold — fires whenever a previously-untracked competitor is auto-detected
- Channels: same as above

---

## 7. Share of Voice Calculation

### 7.1 Technical Definition of Share of Voice in GEO Context

In traditional marketing, share of voice measures advertising spend as a percentage of total category spend. In GEO context, Beamix defines share of voice as:

> **The percentage of AI engine responses (across all queries and engines) that mention a given business, out of all responses that mention any entity in the business's competitive set.**

This is a mention-rate-based metric, not a monetary metric. It measures attention capture in AI-generated answers.

### 7.2 Computation

**Input data (per week):**
- All `scan_engine_results` rows for this business from the past 7 days
- All `competitor_scans` rows for this business from the past 7 days

**Computation:**

```
For each entity E (user's business + each tracked competitor):
  E.mention_count = COUNT of responses where E was mentioned
    For user's business: COUNT(scan_engine_results where is_mentioned = true)
    For competitors: COUNT(competitor_scans where is_mentioned = true)

total_mentions = SUM(E.mention_count) for all E

E.voice_share_pct = (E.mention_count / total_mentions) * 100
```

**Important note on what counts as a "response":**
A single tracked query sent to a single engine produces one response. With 25 tracked queries × 8 engines = 200 responses per scan. A weekly scan cadence produces ~200 data points per week (more for Business tier which scans more frequently).

**Edge cases:**
- If `total_mentions = 0` (no entity mentioned in any response): all entities get `voice_share_pct = 0`. This is theoretically possible for a very new business in an uncrowded market — extremely rare in practice.
- If the user has no tracked competitors: the share-of-voice chart shows only the user's business, which by definition has 100% share. This is displayed with a note: "Add competitors to see comparative share of voice."

### 7.3 Time-Series Tracking

Weekly `competitor_share_of_voice` rows build a time series. The chart on the Competitive Intelligence page renders this time series for the selected period (7d, 30d, 90d).

**Trend computation:**
- Stable: `|current_week_pct - previous_week_pct| < 2`
- Rising: `current_week_pct - previous_week_pct >= 2`
- Declining: `previous_week_pct - current_week_pct >= 2`

The trend direction is stored in `competitor_share_of_voice` as a computed field, or computed at query time — either approach is acceptable. Computing at query time avoids stale trend labels if the cron is re-run with different data.

### 7.4 Data Freshness

Competitor data is updated on every scheduled scan (passive extraction via Stage 5) and on every A8 run (active deep analysis). Share-of-voice percentages are recomputed weekly by `cron.weekly-digest`.

**Freshness indicator in UI:** The Competitive Intelligence page shows "Last updated: [date of most recent `competitor_scans` row]" to set user expectations about data recency. If no scan has run in > 7 days, show a warning: "Your competitor data may be stale. Run a scan to update." with a "Scan Now" button.

---

## 8. API Routes

All routes require authentication (Supabase session). All inputs are Zod-validated. Auth check: verify the `business_id` in the request belongs to `auth.uid()` before any data access.

### 8.1 Competitor Routes — `/api/competitors/*`

**GET /api/competitors**

List all tracked competitors for a business with their latest visibility data.

```
Query params (Zod-validated):
  business_id: uuid (required)
  include_inactive?: boolean (default false)

Process:
  1. Verify business belongs to authenticated user
  2. SELECT * FROM competitors WHERE business_id = $1 AND is_active = true
  3. For each competitor, join latest competitor_scans data (most recent scan)
  4. Join latest competitor_share_of_voice for current week
  5. Return enriched list

Response: {
  data: {
    competitors: Array<{
      id: uuid,
      name: string,
      domain: string | null,
      source: 'manual' | 'auto_detected',
      latestVisibilityScore: number | null,
      trendDirection: 'rising' | 'stable' | 'declining',
      voiceSharePct: number | null,
      topEngines: string[],
      createdAt: string
    }>,
    tierLimit: number,
    activeCount: number
  }
}
```

**POST /api/competitors**

Manually add a tracked competitor.

```
Body (Zod-validated):
  business_id: uuid
  name: string (min 1 char, max 100 chars)
  domain?: string (valid URL or domain, optional)

Process:
  1. Verify business belongs to authenticated user
  2. Check active competitor count: SELECT COUNT(*) FROM competitors WHERE business_id = $1 AND is_active = true
  3. Check tier limit from subscriptions → plans.max_competitors
  4. If at limit: return 402 { error: 'Competitor limit reached', limit: N, upgrade_url: '/pricing' }
  5. Normalize name (trim, strip common suffixes for dedup check)
  6. Check for duplicate: SELECT id FROM competitors WHERE business_id = $1 AND LOWER(name) = LOWER($2)
  7. If duplicate: return 409 { error: 'This competitor is already tracked' }
  8. INSERT competitors row with source = 'manual'
  9. Return created competitor

Response: { data: { competitor: Competitor } }
```

**PATCH /api/competitors/[id]**

Update a competitor (name, domain, active status).

```
Body (all optional):
  name?: string
  domain?: string
  is_active?: boolean  // can deactivate to free up a slot without deleting

Process:
  1. Verify competitor belongs to authenticated user (via competitors.user_id = auth.uid())
  2. UPDATE competitors row
  3. Return updated competitor

Response: { data: { competitor: Competitor } }
```

**DELETE /api/competitors/[id]**

Remove a tracked competitor. Hard delete (cascades to competitor_scans and competitor_share_of_voice).

```
Process:
  1. Verify competitor belongs to authenticated user
  2. DELETE FROM competitors WHERE id = $1
  3. Cascade automatically deletes competitor_scans and competitor_share_of_voice rows
  4. Return 200 { data: { message: 'Competitor removed' } }
```

**GET /api/competitors/comparison**

Get share-of-voice comparison data and gap analysis for the business.

```
Query params:
  business_id: uuid (required)
  period?: '7d' | '30d' | '90d' (default '30d')
  engine?: string  // filter to a specific engine

Process:
  1. Load competitor_share_of_voice rows for the period (multiple weeks aggregated for 30d/90d)
  2. Load per-query comparison data from scan_engine_results + competitor_scans
  3. Compute gap analysis: queries where competitors appear and user does not
  4. Load citation source comparison from citation_sources

Response: {
  data: {
    shareOfVoice: {
      period: string,
      entities: Array<{ name: string, voiceSharePct: number, mentionCount: number, isUser: boolean }>
    },
    comparisonMatrix: Array<{
      query: string,
      userPosition: number | null,
      userSentiment: number | null,
      competitors: Array<{ id: uuid, name: string, position: number | null, sentiment: number | null }>
    }>,
    gapAnalysis: Array<{
      query: string,
      competitorName: string,
      engines: string[],
      opportunityScore: number,
      suggestedContentType: string
    }>,
    citationComparison: Array<{
      competitorName: string,
      topCitedSources: Array<{ url: string, domain: string, frequency: number }>,
      userCitedSources: Array<{ url: string, domain: string, frequency: number }>
    }>
  }
}

Rate limit: 20 requests per minute per user (this is a heavy aggregation query)
Caching: 5-minute cache on the server. Cache key: business_id + period + engine. Cache-Control: s-maxage=300
```

### 8.2 Dashboard Route for Competitor Data

**GET /api/dashboard/competitors**

Lightweight competitor summary for the Dashboard Overview widget (Competitor Snapshot).

```
Query params:
  business_id: uuid

Response: {
  data: {
    userScore: number,
    competitors: Array<{
      name: string,
      score: number,
      delta: number  // compared to user's score
    }>,
    lastUpdated: string
  }
}

This is a lighter query than /api/competitors/comparison — just the data needed for the dashboard widget.
```

---

## 9. Engineering Notes

### 9.1 Why Competitor Tracking Is Anonymous

Competitor tracking in Beamix is entirely passive and anonymous:

- We query AI engines with competitor names in natural-language prompts ("Compare the best GEO platforms for small businesses" — if Competitor A is mentioned, we record that)
- We do not scrape competitor websites
- We do not contact competitors
- We do not access competitors' dashboards or analytics
- Competitors have no way to know they are being tracked — from their perspective, they are simply receiving AI engine queries (like any other user)

This is the same mechanism news monitoring services use for brand mentions. There is no ethical or legal concern; we are observing what a public AI engine says in response to public queries.

### 9.2 Growth Phase vs Launch Critical — Why the Split

The split between Launch Critical (scan pipeline) and Growth Phase (dashboard) is deliberate:

**Launch Critical — why:**
Stage 5 of the parsing pipeline (competitor extraction) runs on every scan regardless. Not implementing it would mean discarding data that is naturally produced by the parsing process. The `competitors` and `competitor_scans` tables must exist at launch to store this data. The cost of passive tracking is effectively zero — it happens as part of the scan pipeline that runs regardless.

**Growth Phase — why:**
The Competitive Intelligence dashboard is only meaningful when:
1. The user has tracked multiple competitors
2. Several scans have run (to build time-series data)
3. Share-of-voice percentages have been computed (requires the weekly cron to have run)

At launch, users will have 0-1 scans completed. Delivering an empty or misleading competitive dashboard would erode trust. The dashboard launches when there is real data to display (typically after the first monthly billing cycle when enough scan history exists).

**Practical consequence for engineers:** The `competitors`, `competitor_scans`, and `competitor_share_of_voice` tables must be created and populated at launch. The dashboard page and A8 agent are built in the Growth Phase sprint.

### 9.3 Preventing Cross-User Competitor Data Leakage

The RLS policies are the primary defense. Engineers must verify:

1. **`competitors` table RLS:** `user_id = auth.uid()` — users can only see their own tracked competitors
2. **`competitor_scans` table RLS:** `business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())` — users can only see scan data for their own businesses
3. **`competitor_share_of_voice` table RLS:** same as competitor_scans

The service role used in Inngest functions bypasses RLS — engineers must manually verify that Inngest functions never return data scoped to the wrong business. Every Inngest step that writes to these tables must include explicit `business_id` filters in the INSERT/UPDATE statements.

**No shared competitor pool:** There is intentionally no shared competitor data model. If User A and User B both track "Competitor X", they each have independent rows in every table. A scan run for User A never modifies User B's data. This is a conscious design choice — sharing competitor data across users would require complex anonymization and permission logic that isn't justified at current scale.

### 9.4 Competitor Tracking Tier Limits — Enforcement

Tier limits (Starter: 3, Pro: 5, Business: 10) are enforced at the API layer, not at the database layer. The `competitors` table has no hard constraint on the number of rows per business — enforcement happens in `POST /api/competitors`:

```typescript
const activeCount = await supabase
  .from('competitors')
  .select('id', { count: 'exact', head: true })
  .eq('business_id', businessId)
  .eq('is_active', true)

const limit = plan.max_competitors  // from plans table
if (activeCount >= limit) {
  return Response.json(
    { error: 'Competitor limit reached for your plan', limit, upgrade_url: '/pricing' },
    { status: 402 }
  )
}
```

For auto-detected competitors (via scan pipeline, which uses service role): insert with `is_active = false` if at limit. The user is notified and can choose which existing competitor to deactivate to make room.

**Why not DB constraint:** A DB-level CHECK constraint cannot easily access the subscription tier dynamically. API-layer enforcement is more flexible and allows the limit to be changed per plan without a migration.

### 9.5 A8 Queue Management Implementation

When A8 is triggered, the system estimates wait time before confirming the run:

```typescript
// In POST /api/agents/competitor_intelligence/execute
const pendingA8Jobs = await supabase
  .from('agent_jobs')
  .select('id', { count: 'exact', head: true })
  .eq('agent_type', 'competitor_intelligence')
  .in('status', ['pending', 'running'])

const queueDepth = pendingA8Jobs.count ?? 0
const avgExecutionMinutes = 8  // ~5min Perplexity + 3min Sonnet analysis

if (queueDepth > 5) {
  const estimatedWaitMinutes = queueDepth * avgExecutionMinutes
  // Return 202 with wait estimate rather than immediately starting
  return Response.json({
    data: {
      job_id: newJobId,
      status: 'queued',
      estimated_wait_minutes: estimatedWaitMinutes,
      message: `Agent queued. Estimated start time: ~${estimatedWaitMinutes} minutes`
    }
  }, { status: 202 })
}
```

Inngest concurrency controls (`concurrency: 20 total, 5 per user` on `agent.execute`) handle the actual queue mechanics. This estimate is displayed to the user in the Agent Hub UI.

### 9.6 Data Freshness at Different User Scales

The accuracy and usefulness of competitive intelligence data varies with usage volume:

| User State | Data Available | Dashboard Usefulness |
|---|---|---|
| < 1 scan completed | No competitor_scans rows | Low — empty states shown |
| 1-3 scans completed | Basic mention data, no trend | Medium — current positions visible |
| 4+ scans (>1 month) | Trend data, share-of-voice history | High — trend arrows, SOV chart meaningful |
| A8 run completed | Deep analysis, citation comparison | High — full feature unlocked |

The frontend should adapt to data availability:
- Show empty states with clear CTAs when data is insufficient
- Show "Trend data available after [date]" (computed from current date + scan frequency) when trending isn't yet calculable
- Show "Run A8 for deep analysis" consistently on competitor cards even before there's enough history for the full dashboard

### 9.7 Key Tables Summary for Competitive Intelligence

| Table | Purpose | Updated By | RLS |
|---|---|---|---|
| `competitors` | Master list of tracked competitors | API (manual add) + scan pipeline (auto-detect) | Own CRUD |
| `competitor_scans` | Per-scan visibility data for each competitor | Scan pipeline (service role) | Own read |
| `competitor_share_of_voice` | Weekly aggregated SOV percentages | `cron.weekly-digest` | Own read |
| `scan_engine_results.competitors_mentioned` | Raw competitor names from AI responses | Scan pipeline Stage 5 | Own read (via join) |
| `alert_rules` (competitor_overtake) | User-configured competitor alerts | API (user configures) | Own CRUD |
| `agent_jobs` (competitor_intelligence) | A8 execution records | API + Inngest | Own read |
