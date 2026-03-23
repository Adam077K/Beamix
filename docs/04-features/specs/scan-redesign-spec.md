# Scan Engine Redesign — PRD

**Version:** 1.0
**Date:** 2026-03-23
**Author:** Product Lead
**Status:** Ready for AI Engineer

---

## Problem

Beamix's scan engine measures the wrong thing. The current "brand query" — asking an AI engine to tell me about [BusinessName] — almost always returns a mention because the AI is being asked to recall a specific entity, not recommend one. This inflates visibility scores to the point where a business with genuinely poor GEO visibility gets a score that looks healthy. When that same business tries an agent recommendation and sees no real-world improvement, trust breaks.

The actual problem SMB owners have is: "When a potential customer asks ChatGPT for the best plumber in Tel Aviv, am I in the answer?" That is a discovery query — nobody says the business name. The scan needs to measure organic discoverability, not brand recall.

Additionally, when an API call fails, the scan silently returns mock data. The customer never knows their score is fabricated. If they pay for Pro and act on fake data, that is a support incident and a churn event.

**Who has this problem:** Every Beamix user on every tier. The free scan is the primary acquisition funnel — if the free scan gives an inflated score, the signup hook is weaker ("I'm already doing well"), and post-signup the data doesn't match what the agent recommendations fix.

**What they do today:** Business owners have no other way to check AI visibility, which is why they sign up. But if scores feel too high out of the box, the urgency to act is gone.

**Cost of not fixing:** Recommendations are downstream of scan data. Bad scan data produces irrelevant recommendations. Users run an agent, see no improvement on next scan, and cancel. The scan is the data foundation — everything built on top of it is only as good as what it measures.

---

## Solution

Redesign the scan engine's query strategy, scoring model, and result surface to measure organic discoverability rather than brand recall. Replace silent mock fallback with explicit error states. Give higher tiers proportionally deeper data. Connect scan signals directly to agent recommendations with a typed data contract.

---

## Success Metrics

- Free scan conversion rate to signup increases by 15% (baseline: establish pre-launch, measure 30 days post-launch of new scan)
- Agent-run-to-rescan improvement rate: 40%+ of users who run an agent and rescan within 7 days see a score delta of +5 or more
- Support tickets citing "score doesn't match reality" or "agent did nothing": fewer than 2% of active users per month
- Data integrity: 0% of scans delivered to the user are backed by mock/fallback data without an explicit "partial results" label

---

## Out of Scope

- Browser simulation for Copilot, AI Overviews, Meta AI — deferred to Phase 3 per existing decision
- Changing the scan wizard UI flow (email-first step-by-step, implemented in commit `92a5666`) — UI is not changing
- Changing the DB schema beyond adding new columns to `scan_engine_results` — migration spec is a separate engineering task
- Multi-language query sets beyond English and Hebrew — Phase 2
- Historical query performance analytics (query-level trend charts) — Phase 2

---

## 1. What Data We Actually Need to Measure

### The right framing

GEO visibility has three distinct measurements. The scan must capture all three separately:

**1. Organic discovery rate** — When someone asks a category/need query (no business name), does the business appear in the answer?

**2. Citation position** — When the business is mentioned, where in the ranked list does it appear? Position 1 is worth far more than position 5.

**3. Context quality** — When mentioned, what does the AI say? Is it confident and positive, or hedged and lukewarm? Does it cite a source URL that points to the business's own site?

**4. Competitive presence** — Which competitors appear in the same answer? How often do they appear when our target business does not?

### Per-engine, per-query data to collect

For every (engine, query) pair, the parser must extract:

| Signal | Type | Notes |
|--------|------|-------|
| `mentioned` | boolean | Was the target business name in the response? |
| `mention_type` | enum: `organic \| direct \| not_mentioned` | `organic` = appeared in a list/recommendation without being named in the prompt; `direct` = response was specifically about the business |
| `rank_position` | integer or null | Position in a numbered or implied list. null if not in list. |
| `sentiment_label` | enum: `positive \| neutral \| negative` | Tone of the description when mentioned |
| `sentiment_score` | 0-100 | Numeric from LLM classifier |
| `cited_urls` | string[] | Source URLs the AI cited alongside the mention |
| `owns_cited_url` | boolean | Does any cited URL belong to the business's domain? |
| `competitors_in_response` | string[] | Other business names mentioned in the same response |
| `response_excerpt` | string (max 400 chars) | The sentence(s) that mention the business (or a 1-sentence summary if not mentioned) |
| `query_type` | enum | Which query type generated this result (see Section 2) |

The current schema captures `engine, rank_position, is_mentioned, sentiment, business_id, scan_id`. The redesign adds: `mention_type`, `cited_urls`, `owns_cited_url`, `competitors_in_response`, `response_excerpt`, `query_type`.

---

## 2. Query Strategy

### Query Types — Four Categories (Not Three)

The current three types (category, brand, authority) include "brand" as a query type. Brand queries must be removed as a scored signal. They can optionally be run as a diagnostic-only background check (unscored, not shown to user as a visibility metric) to help the AI Readiness Auditor compare brand vs. organic gap — but they must never inflate the organic score.

**The four scored query types:**

**Type A — Category Discovery**
"What are the best [category plural] in [city/region]?"
Measures: Does the AI recommend the business when a user seeks options?
Examples:
- Plumber, Tel Aviv: "What are the best plumbers in Tel Aviv?"
- Accountant, NYC: "Which accounting firms do you recommend in New York City?"
- Yoga studio, London: "What are the top yoga studios in London?"

**Type B — Problem/Need Queries**
"I need help with [specific problem]. Who should I call in [city]?"
Measures: Does the AI surface the business for a pain-point search?
Examples:
- Plumber, Tel Aviv: "My pipe burst at 2am in Tel Aviv, who can help me fast?"
- Accountant, NYC: "I'm a freelancer in NYC looking for help with taxes. Any recommendations?"
- Yoga studio, London: "I want to start yoga for stress relief in London. Where should I go?"

**Type C — Comparison Queries**
"[Business category] vs [specific service variant] — which is better in [city]?"
Measures: Does the AI include the business when users are weighing options?
Examples:
- Plumber, Tel Aviv: "Emergency plumbers vs 24hr plumbing services Tel Aviv — what's the difference and who's good?"
- Yoga studio, London: "Hot yoga vs vinyasa studios in South London — recommendations?"

**Type D — Authority/Trust Queries**
"Who are the most trusted [category] in [city]? Which ones have the best reviews?"
Measures: Does the AI associate the business with credibility signals?
Examples:
- Accountant, NYC: "Who are the most reputable accountants in Manhattan for small businesses?"
- Yoga studio, London: "Best-reviewed yoga studios in London — who do people consistently recommend?"

### Query Volume by Tier

| Tier | Query types | Queries per scan | Total (queries x engines) |
|------|-------------|-----------------|--------------------------|
| Free scan | A only | 3 | 3 x 4 engines = 12 calls |
| Starter | A + B | 5 | 5 x 4 engines = 20 calls |
| Pro | A + B + C | 8 | 8 x 7 engines = 56 calls |
| Business | A + B + C + D | 12 | 12 x 10 engines = 120 calls |

Free scan uses 3 Type A queries (same category, slight phrasing variants) for breadth without cost explosion. Starter adds Type B. Pro adds Type C plus 3 more engines. Business adds Type D plus full engine coverage.

### Query Generation

Queries are generated dynamically at scan time from four inputs: `business_name`, `industry`, `location`, `language`. A prompt template library (one file per industry, keyed to `constants/industries.ts`) produces 2-4 variants per query type so the same business doesn't get identical prompts across scans (avoids caching artifacts in LLM responses).

Hebrew queries follow the same four-type structure but use Israeli-natural phrasing. The industry constants file must carry Hebrew query templates alongside English ones.

---

## 3. Scan Report — User-Facing

### The story we tell

The report must answer one question in the first 5 seconds: "Are you showing up where your customers are searching?" Everything else is supporting evidence.

### Report sections

**Section 1 — Visibility Score (headline)**
Single 0-100 number. Renamed from "visibility score" to "AI Discoverability Score" to match customer language ("Can AI find me?"). Score formula redesign in Section 5 below.

**Section 2 — Engine Breakdown**
One card per engine. Each card shows:
- Mentioned: yes/no (organic only — brand queries excluded from this metric)
- Position: "Ranked #2 of 5 businesses" or "Not listed"
- Sentiment: positive / neutral / negative chip
- Source citation: "AI cited your website" or "AI cited a third-party source" or "No citation"

This is the most scannable section — business owners compare engine performance at a glance.

**Section 3 — "Where You're Losing" (highest-value insight)**
Ranked list of 2-3 specific gaps. Each gap is a sentence:
- "ChatGPT listed 4 competitors but not you for emergency plumbing queries"
- "Perplexity mentioned you but ranked you #4 — behind [Competitor A] and [Competitor B]"
- "No engine cited your website as a source — AI is describing you from third-party data"

This section uses `competitors_in_response` and `owns_cited_url` from parsed results. It is the emotional hook. Free scan shows all of this (not gated).

**Section 4 — Competitor Presence**
"Who is beating you" table: competitor names, how many engines mentioned them, their implied share of voice. Free scan shows top 3 competitors. Starter+ shows full list.

**Section 5 — Quick Wins / Recommendations**
3 specific actions with effort/impact labels. Always visible on free scan. The recommendation IDs from this section must carry the scan signals that generated them (see Section 5 of this spec for the data contract).

**Section 6 — Score over Time (authenticated only)**
Trend sparkline. Not available on free scan. Shown for Starter+ after at least 2 scans.

### Data integrity: No silent mock fallback

If an engine API call fails:
- The engine card shows: "Engine unavailable — result not included in score"
- The overall score is computed from available engines only with a clear label: "Score based on 3 of 4 engines"
- The scan is NOT marked as failed — partial results are valid and displayed
- Inngest logs the failure; the cron retry picks up on next scheduled cycle

If ALL engines fail:
- Scan status = `failed`
- User sees: "Scan couldn't complete — we'll retry automatically" (for scheduled scans) or "Retry" button (for manual/free scans)
- No score is shown
- No mock data is written to results_data

---

## 4. Visibility Score Formula Redesign

The current formula (40% mention + 30% position + 30% sentiment) treats a brand-query mention equally to an organic discovery. The redesign weights organic discovery highest.

**New formula — weighted across (query_type, engine) pairs:**

```
Organic Discovery Rate (ODR) = % of Type A + B queries where business was mentioned
Citation Position Score (CPS) = mean(1 / rank_position) across mentions, 0 if not mentioned
Citation Quality Score (CQS) = % of mentions where owns_cited_url = true
Sentiment Score (SS) = mean(sentiment_score) across mentions, 50 if not mentioned

Visibility Score = (ODR × 0.45) + (CPS × 0.30) + (CQS × 0.15) + (SS × 0.10)
```

Each sub-score is normalized to 0-100 before weighting. The four components are surfaced individually in the Pro/Business report as "drill-down metrics" (not shown on free scan or Starter).

---

## 5. Scan-to-Recommendation Data Contract

Every recommendation generated post-scan must carry a typed `scan_signal` field that explains which scan finding triggered it. This is what makes recommendations specific rather than generic.

```typescript
interface ScanSignal {
  signal_type: 'not_mentioned' | 'low_position' | 'no_citation' | 'negative_sentiment' | 'competitor_gap';
  affected_engines: string[];       // e.g. ['chatgpt', 'perplexity']
  affected_query_types: string[];   // e.g. ['category_discovery', 'problem_need']
  competitor_names?: string[];      // If signal_type = 'competitor_gap'
  detail: string;                   // Human-readable: "Not mentioned in 3 of 4 engines for problem/need queries"
}
```

**Agent mapping from scan signals:**

| Signal | Primary agent | Secondary agent |
|--------|--------------|----------------|
| `not_mentioned` on Type A/B | A1 Content Writer (GEO page) | A2 Blog Writer |
| `no_citation` (owns_cited_url false) | A9 Citation Builder | A3 Schema Optimizer |
| `low_position` (rank 3+) | A5 FAQ Agent | A2 Blog Writer |
| `negative_sentiment` | A6 Review Analyzer | A1 Content Writer |
| `competitor_gap` (competitor appears, business doesn't) | A8 Competitor Intelligence | A14 Content Pattern Analyzer |

The A4 Recommendations agent reads this mapping and writes recommendation items where `suggested_agent` is populated with the agent ID. This replaces the current heuristic approach that generates generic recommendations regardless of actual scan findings.

---

## 6. Tier Differentiation Summary

| Capability | Free Scan | Starter | Pro | Business |
|------------|-----------|---------|-----|----------|
| Query types | A only | A + B | A + B + C | A + B + C + D |
| Queries per scan | 3 | 5 | 8 | 12 |
| Engines | 4 | 4 | 7 | 10 |
| Mention type (organic vs direct) | Shown | Shown | Shown | Shown |
| Competitor names in results | Top 3 | Top 3 | Top 5 | Top 10 |
| Citation quality (owns_cited_url) | Shown | Shown | Shown | Shown |
| ODR / CPS / CQS / SS drill-down | Hidden | Hidden | Shown | Shown |
| Historical trend chart | No | After 2 scans | After 2 scans | After 2 scans |
| Per-query breakdown table | No | No | Shown | Shown |

---

## User Stories

- As a business owner running a free scan, I want to see whether AI search engines mention my business when customers search for my services (without typing my name), so I understand whether I have a real visibility problem.
- As a Starter subscriber, I want to know exactly which queries I'm missing from and which competitors are winning those queries, so I can prioritize what to fix first.
- As a Pro subscriber running an agent and then re-scanning, I want to see a score change that reflects whether my content improvements actually improved my discoverability, so I can tell whether Beamix is worth keeping.
- As a Business subscriber, I want to see per-query-type breakdowns across all 10 engines, so I can report AI visibility performance to my marketing team each week.

---

## Acceptance Criteria

- [ ] Given a free scan is completed, when results are shown, then 0 results may be derived from mock/fallback data; any engine failure must show an explicit "engine unavailable" state on that engine's card
- [ ] Given a free scan completes with all engines available, when the overall score is computed, then the score must be derived only from Type A (category discovery) queries; brand query results must not contribute to the score
- [ ] Given a business that genuinely has no AI visibility (not mentioned in any engine across any query), when the scan completes, then the overall score must be 25 or below
- [ ] Given a paid scan is completed, when recommendations are generated, then every recommendation item must carry a populated `scan_signal.signal_type` field matching the actual finding that triggered it
- [ ] Given a Pro or Business tier scan, when the per-engine breakdown is shown, then each engine card must display `mention_type` (organic vs direct), `rank_position`, `owns_cited_url`, and `sentiment_label`
- [ ] Given an engine API call fails during a scan, when the scan completes, then the overall score label must read "Score based on N of M engines" where N reflects only responding engines
- [ ] Given a Pro scan with 8 queries across 7 engines, when the scan runs, then the `scan_engine_results` table must contain exactly 56 rows (8 queries × 7 engines) for that scan_id
- [ ] Given a business in any industry, when queries are generated, then no query may include the business name (brand queries are prohibited from scored query types)

---

## RICE Score

**Reach:** All Beamix users on every tier plus every free scan visitor. At launch, estimated 200 paying users + 1,000 free scans/month = ~1,200 affected/quarter.
**Impact:** 3 (massive) — the scan is the data foundation for recommendations, agent outputs, and dashboard trends. Wrong measurement breaks the entire value chain.
**Confidence:** 90% — the problems are engineering-audited and reproducible; the fix direction is clear.
**Effort:** 3 weeks (AI Engineer for query strategy + prompt templates + parser rewrite; backend for score formula + data contract; no UI changes beyond engine card state)

**RICE = (1,200 × 3 × 0.90) ÷ 3 = 1,080**

This is the highest-priority engineering task before any growth work. A bad scan engine makes every downstream feature less valuable.
