# Beamix — Dashboard & Analytics Technical Spec

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Audience:** Engineers building the dashboard and analytics features. You should be able to implement every page, widget, and data flow described here without reading any other document.
> **Source of truth:** `03-system-design/_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md`, `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md`, `_SYSTEM_DESIGN_PRODUCT_LAYER.md`, `04-features/dashboard-spec.md`

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Page Architecture and Route Map](#2-page-architecture-and-route-map)
3. [Dashboard Overview — `/dashboard`](#3-dashboard-overview--dashboard)
4. [Rankings Page — `/dashboard/rankings`](#4-rankings-page--dashboardrankings)
5. [Recommendations System](#5-recommendations-system)
6. [Prompt Volume Analytics](#6-prompt-volume-analytics)
7. [Citation Analytics](#7-citation-analytics)
8. [Content Performance Widget](#8-content-performance-widget)
9. [Brand Narrative Analytics](#9-brand-narrative-analytics)
10. [Real-time Updates](#10-real-time-updates)
11. [Data Flow — Scan to Dashboard](#11-data-flow--scan-to-dashboard)
12. [API Routes](#12-api-routes)
13. [Caching Strategy](#13-caching-strategy)
14. [Engineering Notes](#14-engineering-notes)

---

## 1. Feature Overview

The dashboard is where the product lives after the free scan conversion. The scan page creates the emotional hook; the dashboard creates the habit. Every design and engineering decision must serve one goal: the user should feel like they have a competitive advantage that is growing.

**What the dashboard provides:**
- A live view of where the business stands in AI search (rank position, visibility score, per-engine breakdown)
- Week-over-week progress tracking so users can see their work is paying off
- An action queue that tells them exactly what to do next, in priority order
- Access to all 16 AI agents that do the optimization work for them
- Analytics on citations, prompt volumes, content ROI, and brand narrative

**Who uses it:**
The primary user is an Israeli SMB owner or marketing lead who checks the dashboard 2-3 times per week. They are not data analysts. They want a clear answer to "am I getting better?" and a clear next action. The dashboard must surface both without requiring them to dig.

**Business value:**
Dashboard engagement is the primary retention lever. Users who check the dashboard more than once per week have significantly higher 30-day retention than those who do not. The goal is to make the dashboard so compelling that it becomes a weekly ritual — like checking revenue or email.

---

## 2. Page Architecture and Route Map

### 2.1 Route Structure

All dashboard routes live under `(dashboard)` route group:

```
/dashboard                          ← Overview
/dashboard/rankings                 ← Per-query × per-engine drill-down
/dashboard/recommendations          ← Full recommendations list
/dashboard/agents                   ← Agent launcher hub
/dashboard/agents/[jobId]           ← Single agent execution / chat UI
/dashboard/content                  ← Content library
/dashboard/content/[id]             ← Single content item editor
/dashboard/competitors              ← Competitive intelligence (NEW)
/dashboard/ai-readiness             ← AI readiness score + roadmap (NEW)
/dashboard/settings                 ← Business, billing, preferences, integrations
/dashboard/settings/business
/dashboard/settings/billing
/dashboard/settings/preferences
/dashboard/settings/integrations
```

### 2.2 Layout Architecture

The dashboard layout is a Server Component (`src/app/(dashboard)/layout.tsx`) that:
1. Authenticates the user via Supabase server client
2. Redirects to `/login` if no session
3. Loads the user's primary business and subscription data (SSR — no client waterfall)
4. Renders the sidebar and main content slot
5. Subscribes the client to Supabase Realtime channels via a layout-level Client Component

**Sidebar** (desktop, fixed) contains:
- Beamix logo
- Navigation items with active highlight
- Agent usage bar: `Credits: 8/15 [████████░░░░░░░]` — real-time via Supabase Realtime
- Plan badge: clickable → `/dashboard/settings/billing`
- User avatar + name

**Mobile:** Sidebar collapses. Bottom navigation bar shows 5 items: Dashboard, Rankings, Agents, Content, ··· (Settings).

### 2.3 Rendering Strategy per Page

| Page | Strategy | Rationale |
|------|----------|-----------|
| `/dashboard` (overview) | SSR + React Query hydration | Initial paint must be fast (first impression on login) |
| `/dashboard/rankings` | SSR for table structure, client-side filters | Filter interactions need to be instant |
| `/dashboard/recommendations` | SSR | Read-heavy, no real-time updates needed |
| `/dashboard/agents` | SSR | Static agent list, credit usage via Realtime |
| `/dashboard/content` | SSR + pagination | Content library can be large |
| `/dashboard/content/[id]` | SSR | Needs full content body on first load |
| `/dashboard/competitors` | SSR + React Query | Competitive data changes with scans |
| `/dashboard/ai-readiness` | SSR | Score data is scan-driven, not real-time |

### 2.4 Data Fetching Pattern

Server Components fetch initial data directly via the Supabase server client. This data is passed as props to Client Components which hydrate React Query with it. Subsequent updates (polling, Realtime) go through React Query.

```typescript
// Server Component pattern
async function DashboardPage({ searchParams }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const business = await getActiveBusiness(supabase, user.id);
  const overviewData = await getDashboardOverview(supabase, business.id);

  return (
    <DashboardClient
      initialData={overviewData}
      business={business}
    />
  );
}

// Client Component hydrates React Query with server-fetched data
function DashboardClient({ initialData, business }) {
  const { data } = useQuery({
    queryKey: ['dashboard', 'overview', business.id],
    queryFn: () => fetchDashboardOverview(business.id),
    initialData,
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
  // ...
}
```

---

## 3. Dashboard Overview — `/dashboard`

The overview is the home base. It must answer three questions at a glance: Where do I stand? Am I improving? What should I do next?

### 3.1 Layout — Desktop

```
┌────────────────────────────────────────────────────────────────┐
│  Good morning, [Name].  Last scanned: 2 hours ago              │
├───────────────────────────┬────────────────────────────────────┤
│  ZONE 1 — HERO            │  ZONE 2 — LEADERBOARD              │
│  Rank + Visibility Score  │  Competitive context               │
├───────────────────────────┴────────────────────────────────────┤
│  ZONE 3 — ACTION QUEUE                                         │
│  Top 3 recommendations with "Fix with Agent" CTAs              │
├──────────────────────────────┬─────────────────────────────────┤
│  ZONE 4 — RECENT ACTIVITY    │  ZONE 5 — ENGINE STATUS         │
│  Last 3 agent outputs        │  Per-engine rank snapshot       │
└──────────────────────────────┴─────────────────────────────────┘
```

### 3.2 Zone 1 — Hero Metric

**Purpose:** Make the user feel the impact of their ranking in 2 seconds.

**Primary display:** The rank position is the star — displayed at enormous size (96px bold white). Everything else is secondary.

```
Your AI Search Rank

         #4
  ─────────────────────
  across AI search
  Insurance · Tel Aviv

  ▲ +2 positions since last week

  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  Visibility Score    47 / 100
  [████████░░░░░░░░░░]
```

**Data source:**
- Rank position: Computed from `scans.overall_score` vs `competitor_scans` for the same business/industry/location combination. Not stored as a column — computed at query time from the latest scan.
- Delta indicator: Compare current `scans.overall_score` with the most recent previous scan.
- Visibility score: `scans.overall_score` from the latest completed scan.

**Color coding for rank number:**
| Rank | Color |
|------|-------|
| #1-3 | Bright green |
| #4-7 | Amber |
| #8-15 | Red-orange |
| Not ranked | Red |

**Movement indicator logic:**
- Compute `currentRank - previousRank`. Negative = improved (show green ▲). Positive = declined (show red ▼). Zero = flat (show gray —).
- Show `+N positions` or `-N positions` since last scan. If no previous scan: show nothing.
- When fewer than 3 scans exist: do not show trend.

**Fetch pattern:**
- SSR: Load latest 2 scans from `scans` table for the business. Compute rank and delta server-side.
- React Query: `staleTime: 5 * 60 * 1000`. `refetchOnWindowFocus: true`.
- Realtime: Supabase channel subscription on `scans` table for this business triggers React Query `invalidateQueries(['dashboard'])`.

### 3.3 Zone 2 — Competitive Leaderboard

**Purpose:** Put the user in competitive context. The emotional driver is seeing yourself in a ranked list and feeling the gap to #1.

```
AI Search Leaderboard
Insurance · Tel Aviv

#1  Harel Insurance       89  ●●●●●●●●●○
#2  Phoenix Group         74  ●●●●●●●○○○
#3  Migdal Insurance      61  ●●●●●●○○○○
#4  ► Your Business ◄     47  ●●●●●○○○○○  ← highlighted row, glow border
#5  AIG Israel            39  ●●●●○○○○○○

        [View Full Rankings →]
```

**Data source:**
- User's business: latest `scans.overall_score`
- Competitors: `competitor_scans` table joined with `competitors` for the same scan cycle. Display most recent scan per competitor.
- Maximum 5 entries shown. Full list lives on `/dashboard/rankings`.

**Visual treatment:**
- User's row: cyan/primary border glow. Persistent. Never muted.
- Competitor rows: dark muted cards. Slightly lower opacity than user row.
- Dots indicator: 10 dots, filled proportionally to score (score/10 = dots filled).

**Click interaction:**
- Clicking a competitor row expands an inline detail panel (not a full page navigation):
  - Per-engine scores for the competitor
  - Which queries they rank for that the user does not
  - "Add to tracked competitors" button

**First scan state:** While the first scan is still processing, show a loading skeleton with the message "Scanning competitive landscape...".

### 3.4 Zone 3 — Action Queue

**Purpose:** Make the next step obvious. This is the pull mechanism that brings users back.

Show exactly 3 recommendation cards. Each card:

```
[HIGH IMPACT]

You're missing a FAQ page

Gemini ranks businesses with structured FAQ content 2x higher
for your query "best insurance company Tel Aviv". Your top
competitor has one. You don't.

Affects: ChatGPT, Gemini  ·  1 agent use

[Generate with FAQ Agent →]    [I'll do it myself]
```

**Card anatomy:**
- `impact` badge: HIGH (red-orange), MEDIUM (amber), LOW (muted)
- Title: specific action, never generic
- Body: 2-3 sentences: what's missing, why it matters, which competitor has it
- Affected engines: from `recommendations.evidence` data
- Credit cost: from agent registry (1 credit for most agents, 2 for A8 Competitor Intelligence)
- Primary CTA: "Generate with [AgentName] →" — opens agent launch modal pre-filled with recommendation context
- Secondary CTA: "I'll do it myself" — sets `recommendations.status = 'in_progress'`

**Ordering:** Sort by `impact` (high first), then by number of affected tracked queries.

**Data source:** `recommendations` table WHERE `business_id = ? AND status IN ('new', 'in_progress')` ORDER BY `impact = 'high' DESC, created_at DESC` LIMIT 3.

**Link below cards:** "[View all N recommendations →]" — routes to `/dashboard/recommendations`.

**Empty state:** "You're all caught up. We'll generate new recommendations after your next scan."

### 3.5 Zone 4 — Recent Activity

**Purpose:** Show the user a portfolio of what's been done. Builds a sense of progress.

Show last 3 items from `agent_jobs` + `content_items` combined, ordered by `created_at DESC`.

Each row:
```
Blog post: "5 Moving Tips for Tel Aviv Families"
Draft · Generated 2 days ago · Blog Writer Agent
[Review & Publish →]
```

**Status badges (pill-shaped):**
| Status | Color | Meaning |
|--------|-------|---------|
| `draft` | Gray | Agent ran, content not yet reviewed |
| `in_review` | Amber | Pending Review — waiting for user action |
| `published` | Green | User marked as live |
| `failed` | Red | Agent execution failed, retry available |

**Data source:**
- Agent jobs: `agent_jobs` WHERE `user_id = ? AND business_id = ? AND status IN ('completed', 'failed')` ORDER BY `completed_at DESC` LIMIT 3
- For completed content-producing agents: join `content_items` to get title and status

**Realtime:** Subscribe to `agent_jobs` for this user. When a job status changes to 'completed' or 'failed', React Query invalidates `['dashboard', 'activity']`.

**Empty state:** "No content generated yet. [Launch your first agent →]"

### 3.6 Zone 5 — Engine Status

**Purpose:** At-a-glance visibility across each AI engine. Creates urgency when engines show "Not Found".

```
ChatGPT       #3   ●●●●●●●●○○
Gemini        —    ○○○○○○○○○○  ← Not Found (dimmed row)
Perplexity    #2   ●●●●●●●●●○
Claude        #6   ●●●●○○○○○○

[See all engines →]

Next scan: in 4h 22m   [Scan Now →]
```

**Data source:** `scan_engine_results` for the latest scan for this business. Aggregate per-engine: if multiple prompts exist for the same engine, take the best rank_position (minimum) and average sentiment_score.

**Dots indicator:** 10 dots, `Math.round(perEngineScore / 10)` dots filled. `perEngineScore` is the per-engine score (0-100) from the scoring algorithm.

**"Not Found" treatment:** Engine row is dimmed, rank shows "—". Creates urgency without being alarming.

**"Scan Now" button:** Calls POST `/api/scan/manual`. Shows rate-limit context below: "1 manual scan remaining this week" or "Rate limit resets in 3d 12h".

**Next scan countdown:** Compute from `businesses.next_scan_at`. Update every minute on client.

### 3.7 First-Time State (New User, Scan Running)

When a user arrives from onboarding and their first scan is still processing:

- Zone 1: Spinner with AI engine logos appearing sequentially, "Scanning your business... Usually takes 60-90 seconds"
- Zone 2: Loading skeleton with "Scanning competitive landscape..."
- Zone 3: Educational content about what Beamix is doing ("We're looking for your mention rate across AI engines, where competitors outrank you, which content gaps are costing you leads")
- Zone 4: "No agent activity yet. Your first recommendations will appear here after the scan completes."
- Zone 5: "Engine breakdown will appear after your first scan."

**Auto-refresh on scan completion:** Supabase Realtime subscription on `scans` table for this business. When status changes to 'completed', React Query `invalidateQueries({ queryKey: ['dashboard'] })` triggers full data refresh. Show a banner: "Your scan is ready! Here's your AI visibility report." with a brief celebration animation.

### 3.8 Returning User Progress Celebrations

These appear as toast notifications, not persistent banners:

- First time ranked on any engine: "You're now visible on ChatGPT for the first time!"
- Score improvement: Count-up animation on rank number
- Competitor overtaken: "You just passed [Competitor Name]. You're now #N."

**Implementation:** On React Query data refresh after scan completion, compare new data against previous cache state. Trigger toast notifications based on deltas.

---

## 4. Rankings Page — `/dashboard/rankings`

**Route:** `/dashboard/rankings`
**Purpose:** Full drill-down on rankings data. Per-query × per-engine visibility matrix.

### 4.1 Page Layout

```
Rankings                                   [+ Add Query]
10/25 queries tracked · Last updated 2 hours ago

Filters: [All Engines ▼]  [All Status ▼]  [This Month ▼]

┌──────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│  Query           │ ChatGPT  │ Gemini   │Perplexity│  Claude  │  Trend   │
├──────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│  best insurance  │   #3 ▲   │   —  ▼   │   #2 =   │   #5 ▲   │  ████▲  │
│  Tel Aviv        │          │          │          │          │          │
├──────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│  insurance for   │   #7 ▼   │   #4 ▲   │   —  =   │   #8 ▼   │  ██▼    │
│  small business  │          │          │          │          │          │
└──────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### 4.2 Data Model for Rankings Table

Each row is one `tracked_query`. Each cell is the aggregate of `scan_engine_results` for that query on that engine across the most recent scan.

**Cell data computation:**
```typescript
// For a given tracked query + engine combination
function computeRankingCell(
  queryText: string,
  engine: string,
  latestScan: Scan,
  previousScan: Scan | null
): RankingCell {
  const results = latestScan.engineResults.filter(
    r => r.prompt_text_normalized === normalize(queryText) && r.engine === engine
  );

  if (results.length === 0) return { rank: null, delta: null, sentiment: null };

  // Use best (lowest) rank_position across all prompts for this query+engine
  const bestRank = Math.min(...results.filter(r => r.rank_position !== null).map(r => r.rank_position));
  const avgSentiment = average(results.map(r => r.sentiment_score));

  // Delta vs previous scan
  const previousResults = previousScan?.engineResults.filter(
    r => r.prompt_text_normalized === normalize(queryText) && r.engine === engine
  ) ?? [];
  const previousBestRank = previousResults.length > 0
    ? Math.min(...previousResults.filter(r => r.rank_position !== null).map(r => r.rank_position))
    : null;

  const delta = previousBestRank !== null && bestRank !== null
    ? previousBestRank - bestRank  // Positive = improved (moved up)
    : null;

  return { rank: bestRank ?? null, delta, sentiment: avgSentiment };
}
```

**Cell color coding:**
| Rank | Color |
|------|-------|
| #1-3 | Green |
| #4-7 | Amber |
| #8+ | Red-orange |
| — (not found) | Gray/muted |

**Delta arrow:**
- `▲` green if rank improved (lower number)
- `▼` red if rank declined (higher number)
- `=` gray if flat
- No arrow if no previous scan data

### 4.3 Filters

**Engine filter:** Multi-select. Options = engines available for user's tier. Filters which engine columns are visible.

**Status filter:** ALL | Ranked | Not Found. "Ranked" = any engine has `rank_position IS NOT NULL`. "Not Found" = all engines have `rank_position IS NULL`.

**Date range filter:** This Week | This Month | Last 3 Months | Custom range. Changes which scan data is used for comparison.

All filters are client-side only (no API call on filter change). Data is pre-fetched for the current time window; filter changes update the view without a new fetch.

### 4.4 Row Expansion

Clicking any row expands an inline detail section:

```
▼ best insurance company Tel Aviv

   Rank history (sparkline chart, 8 data points)
   ChatGPT:    ──3──4──5──3──3──2──3──3
   Gemini:     ──7──6──—──—──—──—──—──—

   Associated content:
   • "Insurance FAQ Tel Aviv" (published) → affected ChatGPT

   Competitor positions for this query:
   #1 Harel Insurance  #2 Phoenix Group  #3 You  #4 Migdal

   Mention context (from last scan):
   "...Beamix Insurance is frequently cited as one of the top providers
   in the Tel Aviv market, particularly noted for its..."

   [Run AI Agent for this query →]
```

**Data source for sparkline:**
```sql
SELECT scanned_at, MIN(rank_position) as best_rank
FROM scan_engine_results ser
JOIN scans s ON s.id = ser.scan_id
WHERE ser.business_id = $business_id
  AND ser.prompt_text ILIKE $query_text
  AND ser.engine = $engine
  AND s.scanned_at > NOW() - INTERVAL '8 weeks'
GROUP BY s.scanned_at, ser.engine
ORDER BY s.scanned_at ASC
LIMIT 8
```

**Citation analytics in row expansion:** Show which URLs are cited instead of the user's business for this query + engine. Source: `citation_sources` WHERE `business_id = ? AND is_own_domain = false` filtered by associated scan data.

### 4.5 Add Query Modal

Triggered by the "+ Add Query" button. Shows current usage: "X of Y queries used".

```
Add Tracked Query

Query text:   [best insurance for families in Tel Aviv    ]
Priority:     [High ▼]
Category:     [recommendation ▼]

This will use 1 of your 25 available query slots.

[Cancel]    [Add Query]
```

Validation: Check that `tracked_queries` count for this business < plan limit. Return 422 with "Query limit reached. Upgrade to Pro for 25 queries." if exceeded.

---

## 5. Recommendations System

Recommendations are generated automatically after every scan by the A4 agent (0 credits) and surface in three places: the dashboard action queue (top 3), the full recommendations page (`/dashboard/recommendations`), and inside agent launch modals (pre-filling context).

### 5.1 Data Model

```typescript
// recommendations table (read from Section 2.5 of Architecture Layer)
interface Recommendation {
  id: string;                     // uuid
  business_id: string;
  user_id: string;
  scan_id: string;                // Which scan generated this
  title: string;                  // "Add a FAQ page"
  description: string;            // Detailed explanation with evidence
  recommendation_type: 'content' | 'technical' | 'outreach' | 'optimization';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  suggested_agent: string | null; // agent_type value — e.g., 'faq_agent', 'schema_optimizer'
  status: 'new' | 'in_progress' | 'completed' | 'dismissed';
  evidence: string;               // Supporting data: "You ranked #7 on Gemini for 'best X' but your competitor at #1 has a FAQ page."
  created_at: string;
}
```

### 5.2 Generation Trigger

A4 runs automatically after every completed scan via the Inngest `generate-recommendations` step (step 11 in `scan.scheduled.run`, step 11 in `scan.manual.run`). It receives:

```typescript
{
  latestScan: Scan,             // Current scan results
  previousScan: Scan | null,    // For trend comparison
  businessProfile: Business,
  competitors: Competitor[],
  existingRecs: Recommendation[], // To avoid duplicates
  completedAgentJobs: AgentJob[], // To avoid re-suggesting done work
}
```

A4 uses Claude Sonnet 4.6 in a single pass (not multi-step). It produces 5-8 recommendations, each conforming to the schema above. Deduplication check: if a new recommendation's title has similarity > 0.8 against an existing active recommendation, skip it.

Zero credit cost — A4 is a system function, not a user-triggered agent. Logged as `transaction_type: 'system_grant'` in `credit_transactions`.

### 5.3 Dashboard Action Queue (Top 3)

The `/dashboard` page shows the top 3 active recommendations. Sort order:
1. `impact = 'high'` first
2. Within same impact level: sort by number of tracked queries affected (parsed from `evidence`)
3. Tie-break: `created_at DESC`

Each card includes a "Fix with Agent" primary CTA that opens the agent launch modal with the recommendation's `suggested_agent` pre-selected and the `description` + `evidence` pre-filled as context.

"I'll do it myself" sets `status = 'in_progress'` via PATCH `/api/recommendations/[id]`.

### 5.4 Full Recommendations Page (`/dashboard/recommendations`)

Shows all active recommendations with filters:
- Filter by: All | Content | Technical | Outreach | Optimization
- Filter by impact: All | High | Medium | Low
- Filter by status: Active (new + in_progress) | Completed | Dismissed

Each card shows the full recommendation including evidence, affected engines, effort rating, and both CTAs.

**Dismissal:** PATCH recommendation status to 'dismissed'. Dismissed recommendations never return (they are excluded from all future deduplication checks in A4).

### 5.5 "Fix with Agent" Flow

When a user clicks "Generate with [AgentName] →":

1. Open the agent launch modal
2. Pre-fill:
   - Agent type: `recommendation.suggested_agent`
   - Topic/context: `recommendation.title` + `recommendation.description`
   - Target queries: extract from `recommendation.evidence` (queries mentioned in evidence)
3. User can modify inputs before launching
4. On "Generate →": POST `/api/agents/[agentType]/execute`
5. Set `recommendations.status = 'in_progress'`

When the agent job completes successfully: Set `recommendations.status = 'completed'`.

---

## 6. Prompt Volume Analytics

This feature surfaces trending queries and "what are customers searching for in AI" insights inside the dashboard. It is powered by two tables: `prompt_library` and `prompt_volumes`.

### 6.1 Data Model

**`prompt_library`** — Curated prompt templates per industry with estimated volume data.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| prompt_text | text | The prompt template |
| industry | text | Industry key |
| category | text | CHECK IN ('recommendation', 'comparison', 'specific', 'review', 'authority') |
| language | text | 'en' or 'he' |
| location_template | boolean | Whether prompt contains {location} placeholder |
| estimated_volume | integer | Estimated monthly conversation volume (aggregated from scans) |
| trending_direction | text | CHECK IN ('rising', 'stable', 'declining') |
| sample_size | integer | Number of scans contributing to volume estimate |
| last_volume_update | timestamptz | Last recalculation |

**`prompt_volumes`** — Weekly time-series for volume tracking.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| prompt_library_id | uuid | FK → prompt_library |
| measurement_period | date | Week start date (Monday) |
| scan_count | integer | Scans using this prompt this period |
| mention_rate | numeric(5,4) | % of scans where businesses were mentioned |
| avg_position | numeric(4,1) | Average rank position |
| competitor_density | numeric(5,4) | Avg competitors mentioned per response |
| engine_coverage | jsonb | Per-engine mention rates `{ chatgpt: 0.72, gemini: 0.58, ... }` |

### 6.2 Weekly Aggregation Cron

**Function:** `cron.prompt-volume-aggregation`
**Schedule:** `30 3 * * 0` (Sunday 3:30AM UTC)
**Concurrency:** 1 singleton

**Steps:**
1. `collect-week-data` — Query all `scan_engine_results` from the past 7 days. Group by `prompt_library_id`.
2. `compute-metrics` — For each prompt: count scans, compute mention rate (`COUNT(is_mentioned=true) / COUNT(*)`), average position, competitor density.
3. `upsert-prompt-library` — UPDATE `prompt_library.estimated_volume` = new count. Compute `trending_direction`: compare current `scan_count` to the average of the previous 3 weeks' `prompt_volumes.scan_count`. Rising if current > 1.2x average. Declining if current < 0.8x average. Stable otherwise.
4. `insert-prompt-volumes` — INSERT INTO prompt_volumes (one row per prompt per week). UNIQUE constraint on `(prompt_library_id, measurement_period)` — use UPSERT.

No individual user data is exposed in `prompt_volumes` — only aggregate statistics. All authenticated users can SELECT from both tables.

### 6.3 Dashboard Surface: "Trending Topics" Widget

The dashboard overview can surface a "Trending Topics" widget (appears when a user has been active for 30+ days and has at least 10 tracked queries):

```
Trending in [Industry]

↑ Rising  "best [service] with [feature] in [location]"
          Volume: 2,400 est. / month · Your rank: #7

↑ Rising  "compare [service] providers [location]"
          Volume: 1,800 est. / month · You: Not found

→ Stable  "affordable [service] for families [location]"
          Volume: 1,200 est. / month · Your rank: #3
```

**Data source:** `prompt_library` WHERE `industry = business.industry AND trending_direction = 'rising'` joined against `scan_engine_results` for the user's latest scan to show their current position for each trending prompt.

**API endpoint:** `GET /api/analytics/prompt-trends?industry=[industry]&language=[en|he]`

---

## 7. Citation Analytics

Citation analytics show which external sources AI engines cite when discussing the business's industry. This is the "why AI says what it says about your competitors" intelligence feature.

### 7.1 Data Source

`citation_sources` table — one row per cited URL per business, maintained via upsert in the scan pipeline after each scheduled/manual scan.

Key columns: `source_url`, `source_domain`, `source_title`, `mention_count`, `engines` (text[]), `sentiment_avg`, `is_own_domain`, `first_seen_at`, `last_seen_at`.

### 7.2 Where Citations Surface

**In Rankings Page row expansion:** When a user expands a tracked query row, the bottom section shows:
```
Sources AI cites for this query (not your domain):
• techradar.com — 8 mentions across ChatGPT, Gemini
• ynetnews.co.il — 6 mentions across Perplexity, Claude
• haaretz.co.il — 4 mentions across Gemini
[Get cited here → Citation Builder Agent →]
```

**In `/dashboard/rankings` Citation Tab (future):** A separate tab showing the full citation sources table, sortable by mention count, filterable by engine and time period.

**In Agent A9 (Citation Builder):** The agent reads from `citation_sources` to identify high-frequency external sources that cite competitors but not the user, then generates outreach templates.

### 7.3 Citation Analytics API

**GET /api/dashboard/citations**

Query params:
```typescript
{
  business_id: string;
  period?: '7d' | '30d' | '90d';  // default '30d'
  engine?: string;                  // filter by engine
}
```

Response:
```typescript
{
  data: {
    own_domain_citations: number;        // How often user's own domain is cited
    third_party_citations: number;       // Citations of other sources
    top_cited_sources: Array<{
      source_url: string;
      source_domain: string;
      source_title: string | null;
      mention_count: number;
      engines: string[];
      sentiment_avg: number;
      is_own_domain: boolean;
      trend: 'rising' | 'stable' | 'declining';  // computed from first_seen_at vs last_seen_at
    }>;
    engine_breakdown: Record<string, number>;  // per-engine citation count
  }
}
```

**Caching:** `staleTime: 10 * 60 * 1000` (10 minutes). Server cache: `s-maxage=600`.

---

## 8. Content Performance Widget

The content performance widget closes the "content ROI" loop: "I published this article — did it actually improve my AI visibility?"

### 8.1 Data Model

**`content_performance`** table — one row per published content item per scan.

| Column | Type | Purpose |
|--------|------|---------|
| content_item_id | uuid | FK → content_items |
| business_id | uuid | Denormalized |
| scan_id | uuid | The scan that measured this |
| measurement_date | date | Date of measurement |
| visibility_score_before | integer | Score at publication time |
| visibility_score_after | integer | Score at measurement time |
| score_delta | integer | after - before |
| mention_count_before | integer | Engine mentions at publication |
| mention_count_after | integer | Engine mentions at measurement |
| avg_position_before | numeric(4,1) | Average rank at publication |
| avg_position_after | numeric(4,1) | Average rank at measurement |
| engines_mentioning | text[] | Engines citing the business for topics related to this content |

### 8.2 Pipeline: How Performance is Measured

After each scheduled scan, step 9 (`compute-content-performance`) runs:

```typescript
async function computeContentPerformance(
  businessId: string,
  currentScan: Scan,
  supabase: SupabaseClient
): Promise<void> {
  // Find all published content items for this business
  const publishedContent = await supabase
    .from('content_items')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'published')
    .not('published_at', 'is', null);

  for (const contentItem of publishedContent) {
    // Find the scan closest to the publication date (baseline)
    const baselineScan = await getNearestScanToDate(businessId, contentItem.published_at);
    if (!baselineScan) continue;

    // Compute metrics
    const scoreDelta = currentScan.overall_score - baselineScan.overall_score;

    await supabase.from('content_performance').upsert({
      content_item_id: contentItem.id,
      business_id: businessId,
      scan_id: currentScan.id,
      measurement_date: new Date().toISOString().split('T')[0],
      visibility_score_before: baselineScan.overall_score,
      visibility_score_after: currentScan.overall_score,
      score_delta: scoreDelta,
      // ... other metrics
    }, {
      onConflict: 'content_item_id,scan_id',
    });
  }
}
```

### 8.3 Dashboard Surface: "Agent Impact Scorecard"

In the content library (`/dashboard/content`), each published content item shows a performance badge:

```
"Insurance FAQ Tel Aviv"
Published · Feb 23, 2026

[ChatGPT +2 positions]  [Gemini first appeared]  [Perplexity +1 position]

Overall impact: +8 visibility score since publication
```

This is the "Agent Impact Scorecard" concept — translating abstract score changes into concrete, engine-specific improvements the user can point to.

**Display logic:**
- Show badge only for content with `content_performance` rows where `measurement_date > published_at`
- Minimum 1 scan after publication required to show data
- Show "Measuring impact..." for content published less than 1 scan cycle ago

### 8.4 Content Performance API

**GET /api/analytics/content-performance**

Query params: `business_id`, `content_item_id?` (for single item), `period?`

Response:
```typescript
{
  data: {
    items: Array<{
      content_item_id: string;
      title: string;
      published_at: string;
      latest_measurement: {
        score_delta: number;
        avg_position_delta: number;     // avg_position_before - avg_position_after (positive = improved)
        engines_improved: string[];
        measurement_date: string;
      };
      history: Array<{
        measurement_date: string;
        score_delta: number;
      }>;
    }>;
  }
}
```

---

## 9. Brand Narrative Analytics

Brand narrative analytics answers a fundamentally different question than visibility: not "are AI engines mentioning you?" but "WHAT story are AI engines telling about you, and why?"

### 9.1 What It Is

After each scheduled scan, the scan pipeline's step 8 (`analyze-narrative`) sends all `mention_context` excerpts from `scan_engine_results` to Claude Sonnet. The model identifies recurring themes in how AI engines frame the business, what narrative they have constructed, and what sources likely drive that narrative.

The output is stored in `brand_narratives` — one row per scan per business.

### 9.2 Data Model

**`brand_narratives`** table:

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| business_id | uuid | FK → businesses(id) |
| scan_id | uuid | FK → scans(id) |
| narrative_summary | text | LLM-generated: "AI positions your brand as X because Y" |
| key_themes | jsonb | `Array<{ theme: string, frequency: number, sentiment: number, engines: string[] }>` |
| brand_positioning | text | How AI positions the brand relative to competitors |
| misperceptions | jsonb | `Array<{ claim: string, correction: string, severity: 'high' | 'medium' | 'low' }>` |
| narrative_score | integer | 0-100 brand narrative health score |
| compared_to_previous | jsonb | Delta vs previous narrative analysis |
| created_at | timestamptz | |

### 9.3 Generation Pipeline (in Scan Step 8)

```typescript
// Collect all mention contexts from current scan
const mentionContexts = scan_engine_results
  .filter(r => r.is_mentioned && r.mention_context)
  .map(r => ({
    engine: r.engine,
    context: r.mention_context,
    sentiment: r.sentiment_score,
  }));

// Retrieve previous narrative for comparison
const previousNarrative = await getPreviousNarrative(businessId);

// Send to Claude Sonnet for narrative analysis
const narrativeAnalysis = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  system: NARRATIVE_ANALYSIS_SYSTEM_PROMPT,
  messages: [{
    role: 'user',
    content: buildNarrativePrompt(businessProfile, mentionContexts, previousNarrative),
  }],
  max_tokens: 3000,
});

// Parse and store
await supabase.from('brand_narratives').insert({
  business_id: businessId,
  scan_id: scan.id,
  narrative_summary: parseNarrativeSummary(narrativeAnalysis),
  key_themes: parseKeyThemes(narrativeAnalysis),
  brand_positioning: parseBrandPositioning(narrativeAnalysis),
  misperceptions: parseMisperceptions(narrativeAnalysis),
  narrative_score: computeNarrativeScore(narrativeAnalysis),
  compared_to_previous: computeNarrativeDelta(narrativeAnalysis, previousNarrative),
});
```

**Model note:** A16 (Brand Narrative Analyst agent, Business tier) uses Claude Opus for deeper narrative analysis. The passive narrative generation in step 8 uses Sonnet (cheaper, runs on every scan). Opus is reserved for when the user explicitly runs A16.

### 9.4 Dashboard Surface

Brand narrative surfaces in `/dashboard` overview for Business-tier users and in the full brand narrative view accessible from the dashboard.

**Overview widget (Business tier only):**
```
AI Brand Narrative
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"AI engines position your brand as a reliable, mid-market option
in the Tel Aviv insurance space. The dominant narrative is
reliability and local expertise."

Key themes: reliability (positive, all engines), local expertise
(positive, ChatGPT/Gemini), pricing transparency (mixed, Claude only)

⚠ Misperception detected: ChatGPT believes your services are
  "primarily for large businesses" — your website doesn't clearly
  communicate SMB coverage.

[Full Narrative Analysis →]
```

**GET /api/analytics/brand-narrative**

Query params: `business_id`, `scan_id?` (latest if not specified)

Response:
```typescript
{
  data: {
    narrative: BrandNarrative;
    scan_date: string;
    has_previous: boolean;
    narrative_score_delta: number | null;  // vs previous
  }
}
```

**Caching:** `staleTime: 10 * 60 * 1000`. Server cache: `s-maxage=600`.

---

## 10. Real-time Updates

The dashboard uses Supabase Realtime to push changes from the server to the client without polling. Three distinct subscription patterns are used.

### 10.1 Scan Completion Subscription

**Channel:** `public:scans:business_id=eq.[businessId]`
**Tables:** `scans`
**Events:** `UPDATE` (when status changes from 'processing' to 'completed' or 'failed')

```typescript
// In the dashboard layout Client Component
useEffect(() => {
  const channel = supabase
    .channel(`scans-${businessId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'scans',
      filter: `business_id=eq.${businessId}`,
    }, (payload) => {
      if (payload.new.status === 'completed') {
        // Invalidate all dashboard data
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        // Show celebration banner
        showToast({ title: 'Scan complete!', description: 'Your dashboard has been updated.' });
      }
      if (payload.new.status === 'failed') {
        showToast({ title: 'Scan failed', description: 'We encountered an issue. Will retry at next scheduled time.', variant: 'error' });
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [businessId, queryClient, supabase]);
```

### 10.2 Agent Job Completion Subscription

**Channel:** `public:agent_jobs:user_id=eq.[userId]`
**Tables:** `agent_jobs`
**Events:** `UPDATE` (when status changes to 'completed' or 'failed')

When an agent job completes:
1. Invalidate content library queries: `queryClient.invalidateQueries({ queryKey: ['content'] })`
2. Invalidate dashboard activity zone: `queryClient.invalidateQueries({ queryKey: ['dashboard', 'activity'] })`
3. Show toast notification: "Blog Writer is done. [Review →]" — the Review link deep-links into `/dashboard/content/[id]`

### 10.3 Credit Usage Subscription

**Channel:** `public:credit_pools:user_id=eq.[userId]`
**Tables:** `credit_pools`
**Events:** `UPDATE`

When a credit pool updates (after agent execution):
1. Update the sidebar credit usage bar immediately: `[Credits: 9/15]`
2. No page-level invalidation needed — only the sidebar widget updates

### 10.4 Notification Subscription

**Channel:** `public:notifications:user_id=eq.[userId]`
**Tables:** `notifications`
**Events:** `INSERT`

When a new notification arrives:
1. Show in-app notification bell badge (increment unread count)
2. If severity = 'high': show toast notification immediately

### 10.5 Subscription Cleanup

All Realtime subscriptions are registered in the dashboard layout component and cleaned up on unmount. The layout is always mounted when the user is in the dashboard — no need to re-register subscriptions per page.

Use a single `useEffect` in the layout Client Component that registers all four subscriptions and returns a cleanup function that removes all channels.

---

## 11. Data Flow — Scan to Dashboard

This section describes the complete data path from a scan triggering to the user seeing updated dashboard data.

### 11.1 Complete Flow Diagram

```
User triggers manual scan (or cron fires)
         │
         ▼
POST /api/scan/manual
  → Inserts scans row (status: 'pending')
  → Sends Inngest event scan/manual.start
  → Returns 202 { scan_id }
         │
         ▼
Inngest scan.manual.run (14 steps, ~60-300s)
  Step 1: fetch-context
  Step 2: generate-prompts
  Step 3: query-engines (4 or 7 engines, parallel)
  Step 4: parse-responses (6 stages per response)
  Step 5: compute-scores
  Step 6: store-results
    → UPDATE scans SET status='completed', overall_score=47
    → INSERT scan_engine_results (one row per engine per prompt)
  Step 7: upsert-citations
    → UPSERT citation_sources
  Step 8: analyze-narrative
    → INSERT brand_narratives
  Step 9: compute-content-performance
    → UPSERT content_performance
  Step 10: compare-previous
  Step 11: generate-recommendations
    → INSERT recommendations
  Step 12: evaluate-alerts
    → Sends alert/evaluate event → Creates notifications
  Step 13: evaluate-workflows
    → May send workflow/execute events
  Step 14: update-schedule
    → UPDATE businesses.last_scanned_at, next_scan_at
         │
         ▼
Supabase Realtime fires on scans UPDATE
         │
         ▼
Dashboard Client Component receives Realtime event
  → queryClient.invalidateQueries({ queryKey: ['dashboard'] })
         │
         ▼
React Query refetches all stale dashboard queries
  → GET /api/dashboard/overview
  → All 5 dashboard zones re-render with new data
```

### 11.2 Cache Warming

On scan completion (step 6 final action), the scan pipeline issues a server-side fetch to `/api/dashboard/overview?business_id=[id]` to warm the CDN/server cache immediately. This means when the user navigates to the dashboard after receiving the "scan complete" notification, the first request always hits warm cache.

---

## 12. API Routes

All routes at `src/app/api/`. Universal patterns: Zod validation, 401 if no session, `{ data: T }` success shape, `{ error: string }` error shape.

### GET /api/dashboard/overview

**Auth:** Required.

**Query params:** `business_id: uuid`

**Response shape:**
```typescript
{
  data: {
    latest_scan: {
      id: string;
      status: string;
      overall_score: number;
      scanned_at: string;
      completed_at: string;
    } | null;
    score_delta: number | null;      // vs previous scan
    rank_position: number | null;
    rank_delta: number | null;
    per_engine_breakdown: Array<{
      engine: string;
      rank_position: number | null;
      sentiment_score: number | null;
      is_mentioned: boolean;
      per_engine_score: number;      // 0-100
    }>;
    leaderboard: Array<{
      name: string;
      score: number;
      rank: number;
      is_self: boolean;
    }>;
    top_recommendations: Recommendation[];  // top 3
    recent_activity: Array<{
      job_id: string;
      agent_type: string;
      status: string;
      content_title: string | null;
      completed_at: string;
    }>;
    credit_usage: {
      used: number;
      total: number;
      pool_type: string;
    };
    next_scan_at: string | null;
  }
}
```

**Cache:** `s-maxage=300, stale-while-revalidate=600` (5-minute server cache).

**Implementation note:** This endpoint runs 5 parallel Supabase queries:
1. Latest 2 scans for the business (with engine results)
2. Credit pools for the user
3. Top 3 active recommendations
4. Last 5 agent jobs
5. Competitors with their latest scan scores

### GET /api/dashboard/rankings

**Auth:** Required.

**Query params:**
```typescript
{
  business_id: string;
  engine?: string;         // Filter by engine
  status?: 'ranked' | 'not_found';
  period?: '7d' | '30d' | '90d';  // default '30d'
  page?: number;
  per_page?: number;       // default 25, max 75
}
```

**Response:**
```typescript
{
  data: {
    queries: Array<{
      tracked_query_id: string;
      query_text: string;
      category: string;
      engine_results: Record<string, {  // engine name → cell data
        rank_position: number | null;
        delta: number | null;
        sentiment_score: number | null;
      }>;
      trend_sparkline: Array<{ date: string; score: number }>;  // 8 points
    }>;
    total: number;
    engines: string[];  // Available engines for this scan
  }
}
```

**Cache:** `s-maxage=600` (10-minute server cache, since rankings change only on scan completion).

### GET /api/dashboard/trends

**Auth:** Required.

**Query params:** `business_id`, `period?: '7d' | '30d' | '90d' | '1y'`

**Response:**
```typescript
{
  data: {
    trend_data: Array<{
      date: string;          // ISO date
      overall_score: number;
      scan_id: string;
    }>;
    score_change: number;    // Current vs period start
    direction: 'up' | 'down' | 'flat';
  }
}
```

**Query:**
```sql
SELECT scanned_at::date as date, overall_score, id as scan_id
FROM scans
WHERE business_id = $business_id
  AND status = 'completed'
  AND scanned_at > NOW() - INTERVAL $period
ORDER BY scanned_at ASC;
```

### GET /api/dashboard/recommendations

**Auth:** Required.

**Query params:** `business_id`, `status?`, `type?`, `impact?`, `page`, `per_page`

**Response:** Paginated recommendations list.

### PATCH /api/recommendations/[id]

**Auth:** Required.

**Request body:**
```typescript
const UpdateRecSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'dismissed']),
});
```

**Validation:** User must own the recommendation's business. Invalid transitions (e.g., 'completed' → 'new') are rejected with 422.

### GET /api/dashboard/competitors

**Auth:** Required.

**Query params:** `business_id`, `period?`

**Response:**
```typescript
{
  data: {
    competitors: Array<{
      competitor_id: string;
      name: string;
      domain: string | null;
      current_score: number | null;
      score_delta: number | null;
      per_engine_scores: Record<string, number | null>;
      share_of_voice_pct: number | null;  // from competitor_share_of_voice
    }>;
    my_score: number;
    my_rank: number;
  }
}
```

### GET /api/dashboard/ai-readiness

**Auth:** Required.

**Query params:** `business_id`

**Response:**
```typescript
{
  data: {
    current_score: number;  // 0-100
    score_breakdown: {
      content_quality: number;       // 30% weight
      technical_structure: number;   // 25% weight
      authority_signals: number;     // 20% weight
      semantic_alignment: number;    // 15% weight
      ai_accessibility: number;      // 10% weight
    };
    trend: Array<{
      recorded_at: string;
      score: number;
    }>;                    // from ai_readiness_history
    improvement_roadmap: Array<{
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      category: string;
    }>;
  }
}
```

---

## 13. Caching Strategy

Three-layer cache: Browser (React Query) → Vercel Edge (Next.js Cache / CDN) → Supabase (PostgreSQL + indexes). No Redis until 10K+ users.

### 13.1 Client-Side Cache (React Query)

| Query | staleTime | refetchOnWindowFocus | Polling |
|-------|-----------|---------------------|---------|
| Dashboard overview | 5 min | Yes | No |
| Rankings table | 10 min | Yes | No |
| Content library | 5 min | Yes | No |
| Agent execution status | 0 (always fresh) | Yes | 3s while running |
| Scan status (free scan) | 0 | Yes | 3s while processing |
| Prompt volumes | 30 min | No | No |
| Citation sources | 10 min | Yes | No |
| Brand narrative | 10 min | Yes | No |
| User profile/settings | 60 min | Yes | No |
| Plans (reference data) | 24 hours | No | No |
| Competitors | 5 min | Yes | No |
| AI readiness | 30 min | No | No |

**Cache invalidation triggers:**
- Scan completes → invalidate `['dashboard']` (all dashboard queries)
- Agent job completes → invalidate `['content']`, `['dashboard', 'activity']`
- Credit pool updates → invalidate `['billing', 'credits']` (sidebar widget only)
- User edits content → invalidate `['content', contentId]`
- Recommendation status changes → invalidate `['recommendations']`, `['dashboard', 'actions']`

All invalidation is triggered by Supabase Realtime subscription events (see Section 10).

### 13.2 Server-Side Cache (Next.js / Vercel)

| Route | Cache-Control | Duration | Revalidation Trigger |
|-------|--------------|----------|---------------------|
| `/api/dashboard/overview` | `s-maxage=300, stale-while-revalidate=600` | 5 min | Tag-based on scan completion |
| `/api/dashboard/rankings` | `s-maxage=600` | 10 min | Tag-based on scan completion |
| `/api/dashboard/trends` | `s-maxage=300` | 5 min | On scan completion |
| `/api/dashboard/competitors` | `s-maxage=600` | 10 min | On scan completion |
| `/api/analytics/prompt-volumes` | `s-maxage=3600` | 1 hour | Weekly cron updates only |
| `/api/analytics/brand-narrative` | `s-maxage=600` | 10 min | On scan completion |
| `/api/analytics/content-performance` | `s-maxage=600` | 10 min | On scan completion |

**Cache warming on scan completion:** In scan pipeline step 6 (final action), issue a server-side `fetch()` to `/api/dashboard/overview?business_id=[id]` to warm the CDN cache immediately before the user's Realtime event triggers their client to refetch.

### 13.3 Database-Level Optimization

The following indexes are critical for dashboard query performance (all defined in the schema, listed here for emphasis):

- `idx_scans_biz_date on (business_id, scanned_at DESC)` — the single most queried index, used by every dashboard query
- `idx_engine_results_biz_date on (business_id, created_at DESC)` — rankings table and per-engine breakdown
- `idx_engine_results_biz_engine on (business_id, engine)` — per-engine trend queries
- `idx_recs_biz_status on (business_id, status)` WHERE `status IN ('new', 'in_progress')` — action queue
- `idx_content_items_user on (user_id, created_at DESC)` — content library
- `idx_agent_jobs_user_created on (user_id, created_at DESC)` — recent activity zone
- `idx_citation_sources_biz on (business_id, mention_count DESC)` — citation analytics

**Materialized views (Phase 3, 10K+ users):**
- `mv_business_visibility_trends` — pre-computed daily score aggregation
- `mv_competitor_share_of_voice` — pre-computed share-of-voice percentages
- `mv_prompt_volume_summary` — pre-computed prompt volume rankings by industry

Do not add materialized views prematurely — they add write overhead and cache invalidation complexity. Implement only when query latency exceeds 500ms on the most-queried dashboard routes.

---

## 14. Engineering Notes

### SSR vs CSR Decisions

**Always SSR:**
- The initial dashboard overview (Zone 1, Zone 2, Zone 3) — first paint must be fast, no loading skeleton on every visit
- The rankings table structure and first page of data
- The recommendations list
- The content library first page

**Always CSR (Client Components):**
- Scan status polling (3s interval while scan is running)
- Agent execution status polling (3s interval while running)
- Supabase Realtime subscriptions (WebSocket, cannot run on server)
- The sidebar credit usage bar (updates after every agent execution)
- Filter interactions (engine filter, date range — instant response required)
- Row expansion in rankings table (interactive accordion)
- Toast notifications (triggered by Realtime events)

**Hybrid (SSR initial + CSR updates):**
- Dashboard zones 1-5: SSR loads initial data, React Query handles subsequent updates
- Content library: SSR loads first page, client handles pagination and filtering

### Skeleton Loading States

Every dashboard zone must have a skeleton loading state — never show blank white space.

| Zone | Skeleton Treatment |
|------|-------------------|
| Zone 1 (Hero) | Large gray rectangle for rank number, progress bar placeholder |
| Zone 2 (Leaderboard) | 5 skeleton rows with shimmer animation |
| Zone 3 (Action Queue) | 3 skeleton cards with title and body placeholders |
| Zone 4 (Activity) | 3 skeleton rows |
| Zone 5 (Engine Status) | 4 skeleton rows with dot indicators |
| Rankings table | Table with skeleton cells, filters disabled |
| Content library | Grid of skeleton cards |

Use a standard `<Skeleton>` component (Shadcn/UI skeleton) with `animate-pulse`. Do not use custom skeleton implementations — maintain visual consistency.

### Empty State Design

Every zone must have an intentional empty state — never blank.

| Zone/Page | Empty State Copy | CTA |
|-----------|-----------------|-----|
| Hero — no scan yet | "Your scan is running. Results in ~60 seconds." | — |
| Hero — scan failed | "Scan encountered an issue." | "Retry →" |
| Leaderboard — no competitors | "We're identifying competitors in your category..." | — |
| Action Queue — no recs | "You're all caught up. We'll generate new recommendations after your next scan." | — |
| Recent Activity — no agents | "No content generated yet." | "Launch your first agent →" |
| Engine Status — no scan | "Engine breakdown will appear after your first scan." | — |
| Rankings — no queries | "No tracked queries yet." | "Add Query →" |
| Content library — empty | "No content generated yet. AI agents will create content here." | "Explore Agents →" |
| Recommendations — empty | "No active recommendations. All caught up!" | — |

### Plan Limit States

| Situation | UI Treatment |
|-----------|-------------|
| Queries at plan limit | "Add Query" button shows: "25/25 queries used · [Upgrade to add more]" |
| Agent uses at 0 | Agent cards grayed, "Top up" banner at top of Agents page |
| Agent uses at 80% | Subtle warning bar: "3 uses remaining this month" |
| Competitor limit reached | Add competitor button disabled with tooltip: "Upgrade to Pro for up to 5 competitors" |
| Feature locked by plan | Card/button has lock icon overlay. Clicking opens upgrade modal. |

### The `business_id` Pattern

Every dashboard API route requires a `business_id` query parameter. This enables multi-business support (Business tier). The UI defaults to the user's primary business (`businesses.is_primary = true`). A business switcher in the sidebar header (visible for Business tier users with multiple businesses) changes the active `business_id` throughout all dashboard views. Store the active `business_id` in React context (not URL) to avoid page reloads on business switch.

### Rank Position is Computed, Not Stored

The `#4 across AI search` rank position displayed in Zone 1 is NOT a stored column. It is computed at query time by ranking the user's `overall_score` against competitor scores from the same scan cycle. This means:
- It updates whenever new competitor data comes in, even without a new user scan
- It is consistent with the leaderboard display (same ranking logic)
- Do not add an `avg_position` column to `scans` — it is stored in `scan_engine_results.rank_position` (per-engine per-prompt) and the aggregate rank is computed on read

### Vercel Function Timeout Considerations

Dashboard API routes that run complex queries (overview endpoint with 5 parallel Supabase queries) may approach the 10-second Vercel function timeout at scale. Mitigation strategies:
- All Supabase queries use covering indexes — avoid full table scans
- Use `Promise.all` for parallel Supabase queries in the overview endpoint
- Server-side cache (`s-maxage=300`) means expensive queries run at most once per 5 minutes per business, not on every request
- If overview endpoint exceeds 5 seconds consistently: split into 2 endpoints (hero metrics + activity) and fetch in parallel on client

### Content Library Content Type Filtering

The content library uses `content_items.agent_type` (the agent that created it) for filtering, not `content_items.content_type`. This is because users think in terms of "what the agent did" (Blog Writer, FAQ Agent, Schema Agent) not the abstract content type. The filter labels are:

| Filter label | `agent_type` values matched |
|-------------|---------------------------|
| Blog Posts | `blog_writer` |
| Web Pages | `content_writer` |
| FAQ | `faq_agent` |
| Schema | `schema_optimizer` |
| Social | `social_strategy` |
| All | all values |

### Weekly Digest and Trial Nudge Crons

Two cron jobs affect dashboard-adjacent features:

**`cron.weekly-digest`** (Monday 8AM UTC): Compiles a weekly summary for each subscribed user. Fetches score changes, agent activity, and top recommendations from the past 7 days. Sends via Resend using the `weekly-digest` email template. This is email-only — no in-app equivalent.

**`cron.trial-nudges`** (daily 10AM UTC): Finds users where `trial_ends_at` is 3 days away and no nudge email has been sent. The `notifications` table records the nudge so it is sent only once. These users also see an in-app banner in the dashboard: "Your 7-day trial ends in 3 days. [Upgrade Now →]".
