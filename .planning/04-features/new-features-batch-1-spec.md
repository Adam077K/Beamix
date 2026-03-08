# Beamix — New Features Batch 1 Engineering Spec

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Ready for review
> **Priority classification:** All four features are Growth Phase or Moat Builder — none are Launch Critical.
> **Source documents:** `03-system-design/BEAMIX_SYSTEM_DESIGN.md`, `03-system-design/_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md`, `03-system-design/_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md`, `02-competitive/COMPETITIVE_RESEARCH_DEEP.md`, `02-competitive/_RESEARCH_SYNTHESIS.md`

---

## Summary Table

| Feature | Plan Tier | LLM Cost Impact | Marginal Cost / User / Month | Priority Phase | Build Effort | Verdict |
|---------|-----------|----------------|------------------------------|----------------|--------------|---------|
| F1: AI Crawler Feed | Pro+ | Near-zero (algorithmic) | ~$0 if Cloudflare/Vercel only; ~$0.10 LLM summary if enabled | Growth Phase | 3-4 weeks | Build — high wow factor, low cost |
| F2: Content Comparison Tool | All paid tiers | Zero | $0 | Growth Phase | 1 week | Build — pure UI, near-zero effort |
| F3: Topic/Query Clustering | Pro+ | Low (one-time embeddings batch) | ~$0.02-0.08/month | Growth Phase | 2 weeks | Build — high value above 30 queries |
| F4: Conversation Explorer | Pro+ | Low-moderate (LLM-generated) | ~$0.05-0.20/exploration session | Moat Builder | 2-3 weeks | Build (LLM-generated variant) — Perplexity variant is premium only |

**Cost discipline note:** At the current baseline of $15-25/business/month in LLM spend, any feature adding more than $1/user/month must be gated to a tier where it can be recovered from plan revenue. Features adding <$0.10/user/month can be offered more broadly without meaningful margin impact.

---

## Feature 1: AI Crawler Feed

### A. Research and Feasibility Analysis

**What it does (user perspective):**
The AI Crawler Feed shows which AI bots are crawling the user's website, which pages they access, and how often. For example: "GPTBot visited 3 pages this week — it crawled your homepage and your About page, but not your Services page." This is a high-signal diagnostic: if GPTBot is not crawling a page, that page cannot influence ChatGPT's knowledge of the business.

**Competitor reference:**
Scrunch AI has the most complete implementation — a real-time feed at the CDN level (Akamai/Cloudflare), showing per-bot access patterns and mapping them to site audit findings ("GPTBot avoids pages with `X-Robots-Tag: noai`"). Writesonic offers Cloudflare-based bot detection. AthenaHQ references GA4 bot event detection. The Research Synthesis rates this feature a composite 17/30 — useful, not critical.

**Known AI bot user-agent strings (as of March 2026):**

| Bot | User-Agent String | Associated Engine |
|-----|------------------|------------------|
| GPTBot | `GPTBot/1.0` | ChatGPT / OpenAI |
| ClaudeBot | `ClaudeBot/1.0` | Claude / Anthropic |
| Google-Extended | `Google-Extended` | Gemini / Google AI |
| PerplexityBot | `PerplexityBot/1.0` | Perplexity |
| Bytespider | `Bytespider` | ByteDance (TikTok AI) |
| CCBot | `CCBot/2.0` | Common Crawl (training data) |
| YouBot | `YouBot` | You.com |
| Meta-ExternalAgent | `Meta-ExternalAgent` | Meta AI |
| Cohere-AI | `cohere-ai` | Cohere |
| iAsk-bot | `iAskSpider` | iAsk.ai |

**Implementation options analysis:**

| Option | How it works | User friction | Data quality | Build effort | Cost |
|--------|-------------|---------------|-------------|--------------|------|
| (A) Cloudflare analytics API | User connects Cloudflare integration (already in integrations table) → Beamix polls Cloudflare Analytics API for bot traffic data | Medium: user must use Cloudflare AND connect it | High: CDN-level, catches every request | 2-3 weeks | Near-zero (API calls only) |
| (B) Vercel log drain | Beamix provides a Vercel Log Drain endpoint; user configures their Vercel project to send logs to Beamix → Beamix parses user-agent from access logs | Medium: user must be on Vercel AND configure log drain | High: same quality as Cloudflare | 3-4 weeks | Near-zero + infra for log ingestion endpoint |
| (C) JavaScript tracking snippet | Beamix provides a `<script>` tag user installs on their site. Client-side JS detects bot user-agents via `navigator.userAgent` and sends to Beamix analytics endpoint | Low-medium: paste a script tag, but requires CMS access | Low: JavaScript does not fire for true crawlers — bots do not execute JS. This option does not work for the stated purpose. | 1 week | Near-zero |
| (D) GA4 bot detection events | GA4 has bot filtering — but it REMOVES bot traffic, it does not report which bots visited. GA4 is not the right tool for this. | N/A | Does not work | N/A | N/A |

**Decision: Option A (Cloudflare) as primary, Option B (Vercel) as secondary.**

Option C is technically invalid — AI crawlers are server-side bots that do not execute JavaScript, so a client-side script cannot detect them. Option D is a misconception in the original brief. The correct approaches are both server-side: Cloudflare and Vercel log analysis.

**Minimum viable version:**
Cloudflare integration only. User connects Cloudflare (integration already specced in `integrations` table with `provider = 'cloudflare'`). Beamix polls the Cloudflare Analytics API daily, filters for known AI bot user-agents, aggregates by bot name and URL path, and displays a dashboard feed. No LLM required.

**Full version:**
Cloudflare + Vercel sources. Optional LLM summary ("GPTBot is actively crawling your site but skipping your Services page — this may explain why ChatGPT doesn't mention your services. We recommend adding your services to your homepage."). LLM summary = 1 Haiku call per business per week.

**LLM cost analysis:**
Without summary: zero. With optional Haiku summary (1 call/business/week): ~$0.004/business/week = ~$0.016/month. At 1K businesses: $16/month incremental. Entirely negligible.

### B. Cost Impact Analysis

- **Does it add LLM API calls?** No, unless the optional narrative summary is enabled.
- **Marginal cost per user per month:** ~$0 (zero without summaries; ~$0.02 with weekly Haiku summaries).
- **Infrastructure cost:** Cloudflare API polling is free within rate limits. Log drain endpoint (Option B) requires a small ingestion server or edge function — trivially cheap on Vercel.
- **Pricing gate recommendation:** Gate behind Pro tier. Reason: (1) Feature requires Cloudflare or Vercel integration, which sophisticated Pro users are more likely to have. (2) It provides a clear upgrade incentive for Starter users curious about AI bot activity. (3) Competitors like Scrunch charge $500/month for this capability — offering it at Pro ($149/month) is a meaningful advantage.
- **Does it justify a pricing increase?** No. Cost is near-zero. It is a value-add that strengthens Pro tier retention.

### C. Engineering Spec

**Feature scope:**
- Dashboard widget on `/dashboard/ai-readiness` or as a standalone section in `/dashboard` overview
- Feed shows: bot name, pages crawled, crawl count, last seen timestamp
- Filter by bot, time range (7d / 30d / 90d)
- Highlight "uncrawled important pages" (pages that receive no AI bot traffic but appear in the sitemap)
- Optional: weekly Haiku narrative summary

**Data model changes:**

New table: `ai_crawler_events`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business whose site was crawled |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| bot_name | text | NOT NULL | Human-readable bot name (e.g., 'GPTBot', 'ClaudeBot') |
| user_agent | text | NOT NULL | Raw user-agent string from logs |
| page_path | text | NOT NULL | URL path crawled (e.g., '/services', '/about') |
| crawl_count | integer | NOT NULL, DEFAULT 1 | Number of requests in the aggregation window |
| source | text | NOT NULL, CHECK IN ('cloudflare', 'vercel') | Data source |
| window_start | date | NOT NULL | Start of the aggregation window (daily) |
| window_end | date | NOT NULL | End of the aggregation window (daily) |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_crawler_events_biz_date` on `(business_id, window_start DESC)`
- `idx_crawler_events_bot` on `(business_id, bot_name, window_start DESC)`
- UNIQUE on `(business_id, bot_name, page_path, window_start)` — prevents duplicate aggregation rows

**RLS:** Users can SELECT their own business's events. Service role inserts (populated by Inngest job).

New column on `integrations`: none needed. Cloudflare integration already exists with `provider = 'cloudflare'`. Config jsonb stores `{ zone_id, api_token }`.

**API routes:**
- `GET /api/analytics/crawler-feed` — returns crawler events for the user's primary business. Query params: `business_id`, `days` (7/30/90), `bot` (optional filter). Auth required. Zod-validated.
- No write routes — data is populated exclusively by the Inngest job.

**Inngest job: `cron.crawler-feed-sync`**
- **Trigger:** Daily at 3am UTC (after cleanup job, before morning digest)
- **Step 1:** Find all businesses with an active Cloudflare integration (`integrations` table WHERE `provider = 'cloudflare'` AND `status = 'active'`)
- **Step 2:** For each business, call Cloudflare Analytics API (GraphQL endpoint) to retrieve `clientRequestHTTPHost` + `clientRequestPath` + `userAgent` for yesterday's date range
- **Step 3:** Filter rows where `userAgent` matches any known AI bot user-agent string (maintained as a constant in `src/constants/ai-bots.ts`)
- **Step 4:** Aggregate by `(bot_name, page_path)`, compute `crawl_count`
- **Step 5:** Upsert into `ai_crawler_events` (ON CONFLICT on unique key: increment `crawl_count`)
- **Step 6 (optional, Pro+ only):** If business has >20 crawler events and last summary was >7 days ago, run 1 Haiku call to generate a narrative ("What should the user know about their crawler activity?"), store as a notification
- **Duration:** 30-90s per business. Run in parallel batches of 10.
- **Concurrency:** 10 system (Cloudflare rate limit is 1,200 requests/5 minutes per zone — no risk of hitting limits at current scale)

**UI components:**
- `CrawlerFeedWidget` — table view with bot icon, page path, crawl count, last seen. Sortable.
- `CrawlerBotBadge` — colored badge per bot (green = crawled, red = not seen in 30d)
- `UncrawledPagesAlert` — callout listing important pages not crawled by any AI bot in 30d. Links to AI Readiness audit.
- Both components must support RTL layout for Hebrew mode.

**Integration dependencies:**
- Cloudflare Analytics GraphQL API — no additional cost beyond existing integration
- `src/constants/ai-bots.ts` — new constants file listing user-agent patterns per bot. Must be maintained as new AI engines release bots.

**Plan tier:** Pro and Business only.

**Build effort:** 3-4 weeks.
- Week 1: Cloudflare API adapter + `ai_crawler_events` table + Inngest job skeleton
- Week 2: Aggregation logic + upsert + bot matching constants
- Week 3: API route + UI widget
- Week 4: Optional Haiku summary + uncrawled pages detection + RTL testing

**Risk factors:**
- Cloudflare API schema changes without notice (mitigate: abstract behind adapter with integration test)
- Users without Cloudflare or Vercel have zero data (mitigate: empty state explains requirement, offers "Connect Cloudflare" CTA)
- Bot user-agent strings change over time (mitigate: `ai-bots.ts` is a simple constant file that can be updated in a PR without schema changes)
- Low data quality risk: Cloudflare aggregates logs at 1-minute resolution, not per-request detail (acceptable for daily aggregation)

---

## Feature 2: Content Comparison Tool

### A. Research and Feasibility Analysis

**What it does (user perspective):**
When a user edits agent-generated content in the content editor, they can toggle a split-screen view showing the original agent output on the left and the current (edited) version on the right. Changes are highlighted with diff colors (additions in green, deletions in red). This gives the user a clear "before vs after" view and helps them understand exactly what they changed.

**Competitor reference:**
RankScale's Content Comparison tool shows "original vs AI-optimized" content side by side. This is their implementation of the same concept. Beamix already has a `content_versions` table that stores every version with `edited_by`, `change_summary`, and the full `content_body`. The data model is already complete. This is purely a UI feature.

**Implementation options:**

| Option | How it works | UX quality | Cost |
|--------|-------------|------------|------|
| (A) diff npm package + inline rendering | Use the `diff` npm package (zero dependencies, 2KB) to compute a line-level or character-level Myers diff between two versions. Render additions/deletions with Tailwind highlight classes in a side-by-side Markdown preview. | High — standard, expected behavior | Zero LLM cost |
| (B) LLM-generated change explanation | Send both versions to Haiku and ask it to explain in plain language what changed and why the changes improve AI optimization. | Supplementary — adds explanation but not the visual diff | ~$0.001/comparison |

**Decision: Option A (diff library) as the foundation. Option B as an optional "Explain Changes" button below the diff view.**

The visual diff is the core feature. The LLM explanation is a nice-to-have that can be triggered on demand, not rendered automatically, so cost only accrues when the user clicks "Explain."

**Minimum viable version:**
Split-screen diff view using the `diff` npm package. No LLM calls. Available whenever at least two versions exist for a content item.

**Full version:**
Split-screen diff + optional "Explain Changes" button that triggers a Haiku call to summarize what changed and why those changes improve GEO.

### B. Cost Impact Analysis

- **Does it add LLM API calls?** Only on explicit user click ("Explain Changes"). Otherwise zero.
- **Marginal cost per user per month:** ~$0. Even if every Pro user clicks "Explain Changes" 10 times/month, cost is $0.01/user/month. At 1K businesses: $10/month total incremental LLM cost.
- **Pricing gate recommendation:** Include in all paid tiers (Starter, Pro, Business). Content editing is a core workflow. Locking diff view to Pro would be arbitrary and would reduce Starter retention.
- **Does it justify a pricing increase?** No. Near-zero cost, high perceived value, no pricing implication.

### C. Engineering Spec

**Feature scope:**
- Add a "Compare Versions" view to the content editor at `/dashboard/content/[id]`
- Available when the content item has 2+ versions in `content_versions`
- Version selector dropdown: user picks "Original" vs "Current" or any two historical versions
- Split-pane layout: left = older version (Markdown rendered), right = newer version (Markdown rendered), with diff highlights overlaid
- Character-level diff for prose content. Line-level diff as an option.
- Optional "Explain Changes" button: triggers a Haiku call, shows explanation in a collapsible panel below the diff

**Data model changes:**
None. The `content_versions` table already stores what is needed:
- `version_number` — used to sequence versions
- `content_body` — the full content at each version
- `edited_by` — distinguishes agent-generated from user-edited versions
- `change_summary` — LLM-generated summary already captured by the agent pipeline on version creation (can be surfaced in the UI without any additional LLM calls)

**New npm package:**
`diff` (npm) — MIT license, 5KB minified, no transitive dependencies. Provides `diffChars`, `diffWords`, `diffLines`. Use `diffWords` as default for prose; `diffLines` for structured content like schemas.

No new API routes are needed for the diff itself — it is computed client-side from two version bodies already loaded. The "Explain Changes" button uses a new lightweight API route:

`POST /api/content/[id]/explain-diff`
- Auth required
- Body: `{ versionFrom: number, versionTo: number }` (Zod-validated)
- Fetches both version bodies from Supabase (RLS enforced — only own content)
- Calls Haiku: "This is the original version of AI-optimized content for a business: [version A]. This is the edited version: [version B]. In 2-3 sentences, explain what the user changed and how those changes affect the content's likelihood of being cited by AI search engines."
- Returns: `{ explanation: string }`
- Rate limit: 20 requests/hour per user (prevents abuse)

**UI components:**
- `ContentDiffView` — new client component. Props: `versionA: ContentVersion, versionB: ContentVersion`. Renders side-by-side split pane.
- `DiffHighlighter` — renders a version body with diff highlight spans. Addition = `bg-green-50 text-green-800`. Deletion = `bg-red-50 line-through text-red-500`. Both styles must have sufficient contrast in Hebrew RTL mode.
- `VersionSelector` — dropdown that loads version list from existing `GET /api/content/[id]/versions` route (already specced).
- `ExplainChangesPanel` — collapsible, triggered by button click. Shows Haiku explanation. Shows loading state during fetch.

**Wiring to existing content editor:**
The existing `ContentEditor` component at `/dashboard/content/[id]` needs a new "Compare" tab alongside the existing "Edit" and "Preview" tabs. No changes to the edit or preview modes.

**Integration dependencies:**
- `diff` npm package (new)
- Existing `content_versions` table (no changes)
- Existing `GET /api/content/[id]/versions` route (must confirm this exists or add it)

**Plan tier:** All paid tiers (Starter, Pro, Business).

**Build effort:** 1 week.
- Day 1-2: Install `diff` package, build `DiffHighlighter` component, wire `ContentDiffView`
- Day 3: `VersionSelector` dropdown, integrate into content editor tab UI
- Day 4: `POST /api/content/[id]/explain-diff` route + `ExplainChangesPanel`
- Day 5: RTL testing, edge cases (single version — disable Compare tab; no changes — show "No changes between these versions")

**Risk factors:**
- Very large content bodies (10,000+ words) may produce slow diff computation client-side. Mitigate: use `diffWords` (not `diffChars`) for large bodies. If word count > 5,000 words, show a "Diff is large — this may take a moment" notice and compute asynchronously.
- Hebrew text: `diffWords` splits on whitespace which works correctly for Hebrew. No special handling needed.
- The "Explain Changes" button reveals content to the LLM API (Anthropic). Users should be informed this data is sent externally. Add a subtle disclaimer ("Powered by Claude AI — your content is sent to Anthropic's API") below the Explain Changes panel.

---

## Feature 3: Topic/Query Clustering

### A. Research and Feasibility Analysis

**What it does (user perspective):**
As a user tracks more queries, the `/dashboard/rankings` page becomes a long flat list that is hard to scan. Topic clustering groups related queries into named clusters: "Pricing Questions" (best price for X, how much does X cost, X pricing comparison), "Location Queries" (X near me, X in Tel Aviv, X in Haifa), "Review Queries" (best reviewed X, X customer reviews, top rated X). The user sees their visibility score per cluster, not just per individual query. They can expand a cluster to see individual queries.

**Competitor reference:**
SE Visible's "Topic Grouping" feature does exactly this. SE Visible filters prompts by engine, topic, competitor, and sentiment. Peec AI groups prompts by auto-categorized topics. The Research Synthesis does not list this in the Top 20 innovations, which is an indicator that it is a quality-of-life feature rather than a competitive differentiator — but it becomes critical UX once a user has >30 tracked queries.

**When does this matter?**
- <15 queries: flat list is fine, clustering adds no value
- 15-30 queries: grouping starts helping
- 30-75 queries: clustering is important for navigation
- 75+ queries (Pro/Business users): essential

The typical Starter user tracks 15-25 queries (plan limit). The typical Pro user tracks up to 75. Clustering delivers the most value for Pro and Business tier users, which aligns with gating it there.

**Clustering implementation options:**

| Option | Mechanism | Cost | Accuracy | When clusters update |
|--------|-----------|------|----------|----------------------|
| (A) Rule-based keyword matching | Pattern library: queries containing "near me / in [city]" → "Local", queries with "price / cost / pricing / cheap" → "Pricing", queries with "review / rated / best" → "Review", etc. | Zero | Medium — misses semantic groupings, good enough for common patterns | Real-time (computed on insert) |
| (B) LLM classification (Haiku) | Send each query to Haiku: "Classify this query into one of: Pricing, Location, Review, Comparison, Informational, Other. Query: [text]" | ~$0.001/query | High | On query insert + nightly re-cluster |
| (C) Embedding + k-means clustering | Generate embeddings for all queries (OpenAI text-embedding-3-small at $0.00002/query), run k-means to find natural clusters, then use Haiku to name each cluster | ~$0.00002/query embedding + ~$0.005/cluster naming | Highest — discovers novel clusters, not preset categories | Weekly batch |

**Decision: Option B (Haiku classification) for Phase 1. Option C (embeddings + k-means) for Phase 2.**

Option A's rule-based approach misses too many real-world patterns. For example, "What is Beamix's monthly fee?" contains "fee" not "price", so it would be missed. Haiku classification is nearly as fast, more accurate, and costs $0.001 per query — at 75 queries/Pro user, this is $0.075 one-time per user (only incurred when the user adds a query). That is negligible.

Option C with k-means would discover clusters like "Implementation Questions" or "Comparison with Competitor X" that a preset taxonomy cannot. However, k-means requires enough data points to form meaningful clusters — 15 queries produce noisy clusters. Phase 2 can introduce embeddings when Pro users regularly track 50+ queries.

**Cluster taxonomy (Phase 1 — Haiku classification):**

| Cluster | Example queries |
|---------|----------------|
| Pricing | "best price X", "how much does X cost", "X pricing 2025", "cheapest X" |
| Location | "X near me", "X in Tel Aviv", "best X in [city]", "local X" |
| Reviews | "top rated X", "X reviews", "best reviewed X", "highly rated X" |
| Comparison | "X vs Y", "compare X providers", "X alternatives", "X competitor" |
| Informational | "how does X work", "what is X", "X explained", "X guide" |
| Brand | "X company", direct brand name queries, "what is [business name]" |
| Other | Queries that do not fit above categories |

Hebrew queries use the same taxonomy. The Haiku prompt includes examples in both languages.

**Cost analysis at 1K businesses:**
- Avg 30 queries per business = 30,000 queries total
- At $0.001/query (Haiku classification): $30 one-time cost to cluster existing queries
- New query additions: ~5/month per business = 5,000 new classifications/month = $5/month
- Re-clustering (optional, for changed queries): negligible
- **Total marginal cost at 1K businesses: $5/month** — entirely negligible.

### B. Cost Impact Analysis

- **Does it add LLM API calls?** Yes — 1 Haiku call per query, on insert only (not on every scan)
- **Marginal cost per user per month:** ~$0.005 (5 new queries/month × $0.001/query)
- **One-time backfill cost per user:** ~$0.03 (30 existing queries × $0.001)
- **Pricing gate recommendation:** Pro and Business only. Starter users track fewer queries (15-25) where the flat list is manageable. Clustering as a Pro-tier quality-of-life feature adds perceived value to the upgrade without meaningful cost.
- **Does it justify a pricing increase?** No.

### C. Engineering Spec

**Feature scope:**
- Add `cluster` column to `tracked_queries` table
- On query insert: classify and store cluster name via Haiku (synchronous, fast)
- `/dashboard/rankings` page: group query rows by cluster, show cluster-level visibility score (average), allow expand/collapse
- Cluster-level score = average visibility score across all queries in that cluster for the latest scan
- Filter panel: add "All clusters" / cluster-specific filter
- Settings: user can rename clusters or move a query to a different cluster (manual override)

**Data model changes:**

New column on existing `tracked_queries` table:

```sql
ALTER TABLE tracked_queries
  ADD COLUMN cluster text DEFAULT 'Other',
  ADD COLUMN cluster_confidence numeric(3,2) DEFAULT 0.0,
  ADD COLUMN cluster_overridden boolean DEFAULT false;
```

- `cluster` — the cluster name ('Pricing', 'Location', 'Reviews', 'Comparison', 'Informational', 'Brand', 'Other')
- `cluster_confidence` — Haiku's confidence score (0.0-1.0), returned as part of the classification response. Low-confidence queries can be surfaced for manual review.
- `cluster_overridden` — when true, the user has manually set the cluster. The nightly re-cluster job skips overridden queries.

New index: `idx_tracked_queries_cluster` on `(business_id, cluster)` — cluster-grouped rankings queries.

No new tables needed.

**Classification pipeline:**

When a tracked query is inserted (via `POST /api/queries` or onboarding flow):
1. After database insert, trigger classification inline (synchronous, <500ms)
2. Haiku prompt: classify the query into the taxonomy. Return JSON: `{ cluster: string, confidence: number }`.
3. Update the row with `cluster` and `cluster_confidence`.
4. If Haiku call fails (timeout, rate limit), set `cluster = 'Other'` — do not block the insert.

**Nightly re-cluster job (Inngest cron):**

New function: `cron.query-recluster`
- **Trigger:** Weekly Sunday at 4am UTC (low-traffic time, after prompt-volume-agg)
- **Purpose:** Re-classify queries where `cluster_confidence < 0.7` AND `cluster_overridden = false`. Handles queries that were classified with low confidence (rare edge cases).
- **Batch size:** 100 queries per Inngest step to stay within Anthropic rate limits
- **Cost:** Negligible (only low-confidence queries are re-processed)

**API routes:**
- `GET /api/dashboard/rankings` — existing route. Add optional `cluster` filter param. Response adds `clusterSummaries` array: `[{ cluster: string, queryCount: number, avgVisibilityScore: number }]`
- `PATCH /api/queries/[id]/cluster` — user manually overrides a cluster. Body: `{ cluster: string }`. Sets `cluster_overridden = true`.

**UI components:**
- `ClusterGroup` — expandable section header. Shows cluster name, query count, average score badge, expand/collapse chevron.
- `ClusterScoreBadge` — color-coded (red <40, amber 40-70, green 70+) average visibility score for the cluster.
- `ClusterFilterTabs` — horizontal scroll tabs above the rankings table for "All / Pricing / Location / Reviews / Comparison / Informational / Brand / Other". Active tab is highlighted.
- All components must work in RTL Hebrew mode. Cluster names must be translatable — add cluster name translations to the i18n constants file.

**Integration dependencies:**
- None beyond existing Haiku API integration

**Plan tier:** Pro and Business.

**Build effort:** 2 weeks.
- Week 1: Schema migration + Haiku classification pipeline + recluster cron job + API route update
- Week 2: UI components + cluster filter tabs + manual override flow + RTL testing

**Risk factors:**
- Haiku misclassifies niche or non-English queries (mitigate: include Hebrew examples in the classification prompt; low-confidence queries fall back to "Other" which is always available)
- Users with mixed Hebrew/English queries: the classification prompt must handle bilingual query text correctly — test with 20 mixed examples before launch
- Cluster counts are unbalanced: many "Location" queries, few "Review" queries. The UI must handle clusters with 1-2 queries gracefully (show them, do not hide single-query clusters)
- Plan change: if a Pro user downgrades to Starter, their cluster data is preserved but the clustering UI is hidden (data is not deleted)

---

## Feature 4: Conversation Explorer

### A. Research and Feasibility Analysis

**What it does (user perspective):**
Rather than only showing what AI engines say about the user's own business, the Conversation Explorer lets users browse what people in their industry are actually asking AI assistants right now. A dentist in Tel Aviv can see: "What are people asking about dentists in Tel Aviv on ChatGPT and Perplexity this week?" The output is a list of real or inferred queries happening in the user's niche, ranked by estimated frequency or relevance. This helps users discover queries they are not yet tracking that could be valuable to capture.

**Competitor reference:**
Profound's "Conversation Explorer" is the market reference. It is powered by their 130M-conversation proprietary dataset — real user conversations with LLMs, double-opt-in GDPR compliant. This dataset took years and significant funding to build ($58.5M raised). Writesonic has 120M conversations. Ahrefs has 190M+ prompts. None of these are replicable at Beamix's current stage.

This is the most architecturally complex of the four features because the right data source for it does not yet exist within Beamix.

**Data source options:**

| Option | Mechanism | Privacy | Cost | Data Quality | Feasibility |
|--------|-----------|---------|------|--------------|-------------|
| (A) Aggregate own scan data | Pool all tracked queries across all Beamix users, grouped by industry. Show "30 Beamix users in dentistry track these queries" as a proxy for conversation volume. | Risk: must be fully anonymized — no user or business identifiers. Only industry + query text. | Near-zero (SQL aggregation, no LLM) | Medium: data is only what users chose to track, not organic conversations. Will skew toward "what SEOs think people ask" rather than "what people actually ask." | Feasible after 500+ users. Useless before. |
| (B) Perplexity "Related Questions" via API | Submit a seed query ("dentist Tel Aviv") to Perplexity Sonar. Extract related questions from the response sidebar + suggested follow-ups. Aggregate multiple seed queries to build a topic graph. | No cross-user privacy concern | ~$0.01-0.03 per seed query exploration | High: Perplexity returns questions that real users ask. These are genuinely useful. | Feasible now. Moderate cost. |
| (C) LLM-generated synthetic queries | Send business profile (industry, location, services) to Haiku or Sonnet with prompt: "Generate 25 questions that potential customers for this type of business commonly ask AI assistants." | No cross-user privacy concern | ~$0.02-0.05 per exploration session | Medium: LLM generates plausible queries but they reflect training data patterns, not real-time search behavior. Accurate enough for SMBs. | Feasible now. Low cost. |
| (D) Third-party keyword research API (e.g., DataForSEO, SE Ranking API) | Pull AI search intent data from an external keyword intelligence provider | No privacy concern | $0.01-0.05 per lookup depending on provider | High: real search volume data, but focuses on traditional search, not AI-specific conversations | Feasible but adds vendor dependency and SEO framing, not GEO framing |

**Recommended implementation: Option C (LLM-generated) as Phase 1, with Option B (Perplexity) available as a premium "Live Exploration" for Pro/Business users.**

Option A requires hundreds of users and raises privacy concerns that need legal review before launch. Start with LLM-generated (Option C) because it is immediately available, cheap, and produces good enough results for the SMB use case. Add Option B as a "Live Exploration" toggle for Pro+ users because Perplexity returns real-time data that is demonstrably more accurate.

**Option C cost analysis:**
- 1 Haiku call per exploration session (30 queries generated): ~$0.003
- 1 Sonnet call per exploration session for better quality: ~$0.02-0.05
- Use Haiku for initial exploration; user can trigger "Refresh with deeper analysis" (Sonnet) as a one-off

**Option B (Perplexity) cost analysis:**
- 3-5 seed queries per exploration = 3-5 Perplexity Sonar calls at $0.01-0.03 each = $0.03-0.15 per exploration
- Rate limit: Perplexity Sonar is 40 RPM. At 1K businesses doing 1 exploration/week = 1,000/7 days / 24 hours / 60 mins ≈ 0.1 RPM. No rate limit concern.
- Option B adds ~$0.03-0.15 per exploration. If users explore 4x/month: $0.12-0.60/user/month.

**Privacy safeguard for Option A (future):**
If Option A is built, the following are non-negotiable:
- Aggregate only industry + query text. Strip all user_id, business_id, business_name.
- Minimum cohort size: never show aggregated data for a cohort of <10 users (to prevent re-identification from unique industries).
- Display "trending in your industry" framing, never expose who tracks what.
- Legal review required before enabling cross-user data features.

### B. Cost Impact Analysis

- **Does it add LLM API calls?** Yes — 1 Haiku call (or Perplexity call for Pro) per exploration session.
- **Marginal cost per user per month (Option C — LLM-generated):** ~$0.012-0.20/month (assuming 4 exploration sessions/month at $0.003-0.05 per session depending on model used)
- **Marginal cost per user per month (Option B — Perplexity, Pro only):** ~$0.12-0.60/month additional for users who use Live Exploration
- **Pricing gate recommendation:**
  - LLM-generated exploration (Option C): Pro and Business only. At $0.012/user/month, cost is negligible, but the feature belongs in Pro because it is a research/discovery feature, not a basic monitoring feature.
  - Perplexity Live Exploration (Option B): Business only, or as an on-demand "exploration credit" that costs 0.5 agent credits per session. This positions it as a premium research capability and allows cost recovery through the credit system.
- **Does it justify a pricing increase?** No — the cost at current scale is too small.

### C. Engineering Spec

**Feature scope:**
- New page at `/dashboard/explore` (or section within `/dashboard/rankings`)
- Input: user's business industry + location + optionally a seed topic/keyword (e.g., "emergency" for a plumber to explore "emergency plumber" adjacent queries)
- Output: 20-30 queries grouped by topic cluster (same taxonomy as Feature 3), ranked by estimated relevance
- Each query in the output shows: query text, estimated relevance (High/Medium/Low), quick "Add to Tracked Queries" button
- Phase 1: LLM-generated queries (Haiku, all Pro+)
- Phase 2: "Live Exploration" toggle (Perplexity Sonar, Business or credit-gated)
- Result caching: cache results for 24 hours per (industry, location, seed_topic) combination to avoid regenerating identical outputs

**Data model changes:**

New table: `exploration_cache`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| cache_key | text | UNIQUE NOT NULL | SHA-256 hash of (industry, location, seed_topic, source) |
| industry | text | NOT NULL | Industry key |
| location | text | NOT NULL | Location string |
| seed_topic | text | DEFAULT '' | Optional seed topic/keyword |
| source | text | NOT NULL, CHECK IN ('llm_generated', 'perplexity') | Which method generated this |
| results | jsonb | NOT NULL | Array of { query_text, cluster, relevance, language } |
| generated_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| expires_at | timestamptz | NOT NULL | generated_at + 24 hours |

**No user_id or business_id in this table.** Cache is shared across all users with the same industry/location/topic combination. This is safe because the content is generic (industry-level queries, not business-specific data).

**Index:** `idx_exploration_cache_key` on `(cache_key)` — primary cache lookup. Unique constraint serves as index.

**Cleanup:** The existing `cron.cleanup` job should include a step to delete rows where `expires_at < NOW()`.

**API routes:**

`POST /api/analytics/explore`
- Auth required, Pro+ plan check
- Body (Zod): `{ industry: string, location: string, seedTopic?: string, source?: 'llm_generated' | 'perplexity' }`
- `source = 'perplexity'` is only permitted for Business tier or if user has sufficient agent credits (0.5 credit deduction)
- **Cache lookup:** Compute `cache_key = sha256(industry + '|' + location + '|' + seedTopic + '|' + source)`. Check `exploration_cache` for a non-expired row. If found, return cached results immediately (no LLM call).
- **Cache miss:** Run the appropriate pipeline (LLM-generated or Perplexity). Store result in `exploration_cache`. Return results.
- Response: `{ queries: Array<{ queryText: string, cluster: string, relevance: 'high'|'medium'|'low', language: 'en'|'he' }>, source: string, cached: boolean, cachedAt?: string }`
- Rate limit: 10 requests/hour per user

**LLM pipeline (Option C — Haiku):**

Haiku prompt structure:
```
System: You are a search query research assistant specializing in AI search behavior for local businesses.

User: Generate 25 natural language questions that a potential customer might ask an AI assistant (like ChatGPT or Perplexity) when looking for a {industry} business in {location}.
{if seedTopic}: Focus especially on queries related to: {seedTopic}
Include questions in both Hebrew and English (mix approximately 50/50 for Israeli locations).
Format your response as a JSON array: [{ "query": string, "cluster": "Pricing|Location|Reviews|Comparison|Informational|Brand|Other", "relevance": "high|medium|low", "language": "en|he" }]
```

Expected output: 25 queries, structured JSON, <1 second at Haiku speed, ~$0.003 per call.

**Perplexity pipeline (Option B — Pro/Business):**

1. Build 3 seed prompts from the user's industry/location/seedTopic: "What should I look for in a {industry} in {location}?", "Best {industry} in {location} recommendations", "Compare {industry} services in {location}"
2. Send all 3 in parallel to Perplexity Sonar Pro
3. Parse each response: extract the main answer + any "Related Questions" / "People Also Ask" sections (Perplexity often includes these)
4. Deduplicate across the 3 responses
5. Run one Haiku call to: classify clusters, assign relevance scores, and add 10 synthetic follow-up queries to fill gaps
6. Store combined result in `exploration_cache` with `source = 'perplexity'`

Total cost for Option B: 3 × $0.01-0.03 (Perplexity) + 1 × $0.001 (Haiku clustering) = $0.03-0.09 per exploration.

**"Add to Tracked Queries" button:**
Each query in the results has an "Add" button. Clicking it calls `POST /api/queries` with the query text pre-filled. The query is classified via the Feature 3 pipeline on insert. The user sees a "Added!" confirmation inline — no page reload.

**UI components:**
- `ExplorerPage` — new page at `/dashboard/explore`
- `ExploreForm` — inputs: industry (auto-filled from business profile, editable), location (auto-filled, editable), seed topic (optional free text). Source toggle (LLM / Live — gated by tier). Submit button.
- `ExploreResultsGrid` — card grid or table of generated queries. Grouped by cluster (same `ClusterGroup` component from Feature 3). Each card: query text, cluster badge, relevance badge (High/Medium/Low), "Add to Tracking" button.
- `RelevanceBadge` — color-coded: green (High), amber (Medium), gray (Low)
- Empty state: "Your industry has no exploration results yet" (should not happen — LLM always generates something)
- Loading state: skeleton cards while Haiku generates queries (~1 second)
- Full RTL support required — Hebrew queries must render right-to-left, English queries left-to-right within the same grid

**Integration dependencies:**
- Haiku API (existing)
- Perplexity Sonar Pro API (existing — already used in agent pipeline)
- Feature 3's cluster taxonomy (reuse constants and `ClusterGroup` component)

**Plan tier:**
- LLM-generated exploration: Pro and Business
- Perplexity Live Exploration: Business only (or credit-gated: 0.5 credits per live session)

**Build effort:** 2-3 weeks.
- Week 1: `exploration_cache` table + `POST /api/analytics/explore` route + Haiku pipeline + cache logic
- Week 2: UI components (`ExploreForm`, `ExploreResultsGrid`, `ExploreResultsCard`, `RelevanceBadge`) + "Add to Tracked Queries" integration
- Week 3: Perplexity pipeline (Option B) + tier gating + credit deduction logic + RTL testing

**Risk factors:**
- LLM-generated queries are synthetic: they may not reflect actual search behavior. Mitigate with clear UI copy: "These are suggested queries based on your industry and location. They are AI-generated estimates, not real search volume data." Do not claim these are "what people are actually asking" without the Perplexity source.
- Cache key collisions: SHA-256 has effectively zero collision probability. Safe.
- Perplexity rate limits (40 RPM): at 3 calls per exploration, a single exploration uses 3 RPM. At 10 concurrent users exploring simultaneously, this uses 30 RPM. Fine at current scale. Monitor and add request queuing if needed.
- Users repeatedly clicking "Explore" to generate different results (cache defeats this by design — same parameters return cached results for 24h). If users want variety, they change the seed topic — which creates a different cache key.
- Hebrew location names: "תל אביב" and "Tel Aviv" must resolve to the same location for cache key purposes. Normalize location strings before hashing (lowercase, strip diacritics, standardize common city names). Add a normalization constant in `src/constants/locations.ts`.

---

## Cross-Feature Notes

### Shared Infrastructure

Features 3 and 4 both use the same cluster taxonomy. Define cluster names as constants in `src/constants/query-clusters.ts` and import from both features. The Haiku prompts in both features reference the same taxonomy — keep the prompt text synchronized.

Feature 1's `ai-bots.ts` constants should be reviewed and updated on a quarterly cadence as new AI products release their crawlers. Schedule this as a recurring engineering maintenance task.

### RTL Testing

All four features require Hebrew/RTL testing. Key scenarios to test before each feature ships:
- Split pane layout (Feature 2): both panes must flip in RTL
- Cluster group headers (Feature 3): expand/collapse chevron moves to left side in RTL
- Explorer form and results grid (Feature 4): form labels and result cards must render correctly in RTL
- Crawler feed table (Feature 1): column order and sort indicators must be mirrored in RTL

### Dependency on Feature 3 from Feature 4

Feature 4 (Conversation Explorer) uses the same cluster taxonomy and the `ClusterGroup` UI component introduced in Feature 3. Build Feature 3 first, then Feature 4. The recommended build order is: F2 → F3 → F4 → F1 (F2 is the simplest and provides immediate user value; F1 depends on integration adoption which takes time).

### Recommended Build Order

| Order | Feature | Why |
|-------|---------|-----|
| 1 | F2: Content Comparison | Fastest build (1 week), zero cost, benefits all paid users immediately |
| 2 | F3: Topic/Query Clustering | Highest long-term UX value for Pro users, establishes cluster infrastructure used by F4 |
| 3 | F4: Conversation Explorer | Depends on F3 cluster components; higher complexity |
| 4 | F1: AI Crawler Feed | Depends on Cloudflare integration adoption; value increases as more users connect Cloudflare |
