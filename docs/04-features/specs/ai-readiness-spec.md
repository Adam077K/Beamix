# AI Readiness Feature Spec

> **Author:** Atlas (CTO)
> **Date:** March 2026
> **Status:** Launch Critical
> **Source of truth:** `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2.16, `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §A11, `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.8

---

## 1. Feature Overview

AI Readiness is a scored website audit that tells a business owner how discoverable their site is to AI search engines — and exactly what to fix, in priority order.

It is distinct from the visibility scan (which measures whether AI engines currently mention the business) because it measures the structural and content properties of the business's website that determine whether AI engines *can* cite them. A business can have low visibility (not mentioned now) but high AI readiness (the site is technically well-optimized). A business can also have decent visibility but low readiness, meaning their position is fragile and will erode.

**The value proposition:** An ordered list of specific improvements with a "Fix with Agent" button on each one. The score becomes a living benchmark that improves as agents execute fixes.

**Priority classification:** Launch Critical. AI readiness scoring is in the product at launch. The gamified progress tracker (Moat Builder) is a Moat Builder phase feature — not required at launch.

---

## 2. The AI Readiness Page (`/dashboard/ai-readiness`)

### 2.1 URL and Access

- URL: `/dashboard/ai-readiness`
- Auth: Required. All authenticated users can access.
- Sidebar nav: "AI Readiness" with a gauge icon, positioned below "Competitors".

### 2.2 Empty State

Shown when no AI readiness audit has been run for the business.

| Field | Value |
|-------|-------|
| Icon | Checklist with checkmarks |
| Headline | "How AI-ready is your website?" |
| Description | "Run an AI readiness audit to get a detailed improvement roadmap." |
| CTA Button | "Run AI Audit" |
| CTA Action | Triggers A11 (AI Readiness Auditor agent) |

### 2.3 Loaded State — Page Layout

When results exist, the page renders in this order:

**1. Overall Score — Top of page**
- 0-100 gauge (same gauge component as dashboard overview)
- Color-coded: 0-39 red, 40-69 amber, 70-100 green
- Trend arrow if prior data exists (score delta vs last audit)
- Label: "AI Readiness Score" with last-audited timestamp below

**2. 5-Category Breakdown — Below the gauge**
- Five category cards in a 2+3 or 3+2 grid (responsive)
- Each card: category name, score (0-100), weight label, brief status line
- Category weights are fixed (see §3 for canonical weights)

**3. Per-Factor Detail — Expandable section per category**
- Each category card expands to show the individual factors it comprises
- Each factor: factor name, scored (pass/warn/fail or 0-100), specific issue found, specific fix
- Example: Category = Technical Structure, Factor = "Schema Markup", Score = 12/25, Issue = "No JSON-LD found on homepage", Fix = "Add Organization and LocalBusiness schema"

**4. Improvement Roadmap — Below categories**
- Ordered list of improvements sorted by impact/effort ratio
- Each item: title, category badge, impact label (High/Medium/Low), "Fix with Agent" button
- Completed improvements are checked and moved to a collapsed "Completed" section

**5. AI Crawler Activity — Below roadmap**
- Shows if Cloudflare integration is connected: which AI bots have crawled the site, frequency, which pages
- Without integration: "Connect Cloudflare to detect AI crawler activity" with link to Settings > Integrations

**6. robots.txt Status**
- Which AI bots are blocked by the business's robots.txt
- For each blocked bot: the relevant robots.txt directive, and whether blocking is intentional or accidental
- Fix guidance if accidental block detected

**7. Re-run Audit Button**
- "Re-run AI Audit" button — costs 1 credit
- Shows credit cost prominently
- Disabled if user has zero credits

---

## 3. The 5 Scoring Categories

These are the canonical scoring categories. Weights sum to 100%.

### Category 1: Content Quality — 30%

**What it measures:** Whether the business's website content is structured, deep, and formatted in a way that AI engines can extract and cite.

**Signals scored:**

| Factor | Description |
|--------|-------------|
| Content depth | Average word count per page vs. industry benchmark |
| FAQ presence | Are FAQ sections present, structured, and comprehensive? |
| Content freshness | Age of last content update; stale pages score lower |
| Readability | Sentence complexity, heading hierarchy, scannable formatting |
| GEO formatting | Conversational Q&A format, direct statements, entity clarity |

**What a low score means:** AI engines cannot extract clear, quotable answers from this site. Even if the business is found by AI engines, it will not be cited as a source because the content is too thin, too old, or too poorly formatted for AI extraction.

**Improvement actions generated:** "Add FAQ section to service pages", "Refresh content on [page] (last updated 18 months ago)", "Add 500+ words of substantive copy to [page]"

---

### Category 2: Technical Structure — 25%

**What it measures:** Whether the technical foundation of the site enables AI crawlers to understand, parse, and cite the business correctly.

**Signals scored:**

| Factor | Description |
|--------|-------------|
| Schema markup | JSON-LD present, correct types (Organization, LocalBusiness, FAQPage, etc.) |
| Meta tags | Title tags, meta descriptions — present and descriptive |
| Heading hierarchy | H1/H2/H3 structure is logical and present |
| Mobile responsiveness | Site renders correctly on mobile (proxy: viewport meta tag present) |
| Sitemap | XML sitemap present and linked in robots.txt |
| Page speed proxy | Image sizes, JavaScript blocking — cheerio-detectable signals |

**What a low score means:** AI crawlers have difficulty parsing the business's site structure. The site may not be correctly categorized by AI engines, leading to incorrect or absent citations. Structured data absence is particularly damaging — it is the single highest-impact technical GEO factor.

**Improvement actions generated:** "Add Organization JSON-LD schema to homepage", "Add LocalBusiness schema with NAP data", "Add meta description to [X] pages missing it"

---

### Category 3: Authority Signals — 20%

**What it measures:** Whether the site has signals that establish it as a trustworthy, authoritative source in its field — signals that AI engines weigh heavily when deciding what to cite.

**Signals scored:**

| Factor | Description |
|--------|-------------|
| Domain indicators | Domain age, TLD (.com/.co.il vs. less trusted TLDs) |
| Backlink proxies | Outbound links to credible sources (detectable via cheerio), press mentions visible on the site |
| Brand mentions | Business name appears in content consistently and is unambiguous |
| Expertise markers | Author bios, credentials, certifications, awards mentioned on site |
| NAP consistency | Name, Address, Phone consistent across all detected page instances |

**What a low score means:** AI engines cannot establish the business as an authoritative source. Even with good content, the business will lose citations to competitors that have stronger authority signals. AI citation heavily favors sources that appear credible and expert.

**Improvement actions generated:** "Add author bios with credentials to blog posts", "Add an 'Awards and Recognition' section", "Ensure NAP data matches across all contact pages"

---

### Category 4: Semantic Alignment — 15%

**What it measures:** Whether the site's content actually covers the topics and queries that the business's customers ask AI engines.

**Signals scored:**

| Factor | Description |
|--------|-------------|
| Topic coverage | Do the tracked queries the business cares about appear in page content? |
| Conversational format | Does content answer questions directly (not just describe services)? |
| Entity clarity | Is the business clearly described as a specific type of entity (plumber, insurance broker, etc.)? |
| Geographic signals | Is the business's service area clearly stated across pages? |

**What a low score means:** The business's website does not speak the language of AI queries. A plumber whose site says "We provide comprehensive residential plumbing solutions" scores lower than one whose site says "Emergency plumber in Tel Aviv — same day service." The first site does not match how people ask AI engines for help.

**Improvement actions generated:** "Rewrite homepage to directly answer 'best [service] in [location]'", "Add city/neighborhood mentions to service pages", "Create content targeting the query '[tracked query with no coverage]'"

---

### Category 5: AI Accessibility — 10%

**What it measures:** Whether the site is structurally accessible to AI web crawlers and has adopted AI-native technical standards.

**Signals scored:**

| Factor | Description |
|--------|-------------|
| robots.txt allows AI bots | GPTBot, ClaudeBot, Google-Extended are not blocked |
| llms.txt present | `/llms.txt` file exists and is accessible |
| JavaScript rendering | Is content accessible without JavaScript? (cheerio-detectable: critical content not inside script tags) |
| Clean URLs | URL structure is human-readable and descriptive |
| Pagination correctness | Paginated content has canonical or next/prev links |

**What a low score means:** AI crawlers may not be able to access or parse the site's content at all. A blocked GPTBot means ChatGPT cannot crawl the site regardless of content quality. Absence of llms.txt is a missed opportunity — it is the AI equivalent of a sitemap.

**Improvement actions generated:** "Unblock GPTBot in robots.txt (currently blocked)", "Create llms.txt file describing your business", "Move product content out of client-only JavaScript rendering"

---

## 4. AI Readiness Auditor Agent (A11)

**Agent type enum value:** `'ai_readiness'`
**Credit cost:** 1
**Concurrency:** 3 per user maximum, 20 system-wide (shared with other agents via Inngest)
**Timeout:** 120 seconds (cheerio crawl of 50 pages is the bottleneck)

### 4.1 When It Runs

- **Automatically:** During the New Business Onboarding workflow — fires immediately after `onboarding/complete` event, in parallel with A13 (Content Voice Trainer) and A14 (Content Pattern Analyzer)
- **Manually:** User clicks "Run AI Audit" or "Re-run AI Audit" on the AI Readiness page — costs 1 credit
- **Via "Fix with Agent" flow:** When a recommendation links to A11 specifically

System-initiated runs during onboarding are logged as `transaction_type = 'system_grant'` and do not deduct from the credit pool.

### 4.2 Pipeline: Stage 1 — Deep Crawl (cheerio, no LLM)

The crawler fetches the business's website and extracts structured data across up to 50 pages using a breadth-first search to depth 2.

**What the crawler extracts per page:**

| Data Point | How Extracted |
|------------|--------------|
| Page title | `<title>` tag |
| H1/H2/H3 headings | All heading tags, text content |
| Meta description | `<meta name="description">` |
| JSON-LD blocks | All `<script type="application/ld+json">` tags, parsed |
| Microdata | `itemtype` and `itemprop` attributes |
| Internal links | All `<a href>` pointing to same domain |
| External links | All `<a href>` pointing to external domains |
| Word count | Stripped visible text character count |
| FAQ patterns | `<details>`, `<summary>`, or Q/A heading patterns |
| Images | `alt` attribute presence, approximate file sizes from headers |
| Viewport meta | `<meta name="viewport">` presence |
| Robots meta | `<meta name="robots">` per-page override |
| Last-Modified header | HTTP response header |

**Crawler configuration:**
- Max pages: 50 (BFS, depth 2 from homepage)
- Timeout per page: 10 seconds
- Concurrent page fetches: 5
- Respects robots.txt: yes (fetches and parses before crawling)
- Checks for `robots.txt` at `/robots.txt`
- Checks for `llms.txt` at `/llms.txt`

**Output:** A structured site analysis dataset. One record per page crawled. This dataset feeds directly into Stage 2.

### 4.3 Pipeline: Stage 2 — Algorithmic Scoring (no LLM)

The scoring algorithm consumes the site analysis dataset and produces numeric scores for all 5 categories and all sub-factors. No LLM involved — this is deterministic rule-based computation.

**Scoring approach per category:**

**Content Quality (30 points max):**
```
word_count_score      = min(pages with >500 words / total_pages * 100, 100) * 0.30  (max 9 pts)
faq_score             = faq_pages_detected > 0 ? 100 : 0 * 0.25                    (max 7.5 pts)
freshness_score       = compute from Last-Modified or content date markers           (max 7.5 pts)
heading_structure     = h2_present_ratio * 100 * 0.15                               (max 4.5 pts)
readability_proxy     = avg_sentence_length < 25 words ? 100 : max(0, 150 - avg_len) * 0.10 (max 3 pts)

Content Quality Total = sum of above, normalized to 0-100, then * 0.30 for weighted contribution
```

**Technical Structure (25 points max):**
```
schema_score          = json_ld_types_found.length > 0 ? score by types present     (max 10 pts)
  - Organization or LocalBusiness present: +6 pts
  - FAQPage present: +2 pts
  - Any additional types (Article, BreadcrumbList, etc.): +1 pt each (max 2 pts)
meta_score            = pages_with_meta_desc / total_pages * 100 * 0.20             (max 5 pts)
heading_h1            = pages_with_h1 / total_pages * 100 * 0.15                   (max 3.75 pts)
mobile_score          = viewport_meta_present ? 100 : 0 * 0.10                     (max 2.5 pts)
sitemap_score         = sitemap_detected ? 100 : 0 * 0.05                          (max 1.25 pts)

Technical Structure Total = sum, normalized to 0-100, * 0.25
```

**Authority Signals (20 points max):**
- Scored on a set of binary/presence checks since these signals cannot be reliably measured from an HTML crawl alone
- Presence of author bios, credential mentions, award mentions, press sections: weighted checks
- NAP consistency across detected contact instances: string similarity check

**Semantic Alignment (15 points max):**
- Cross-reference tracked queries (from `tracked_queries` table for this business) against page content
- Coverage score: what % of tracked queries have matching content on at least one page

**AI Accessibility (10 points max):**
```
robots_score          = bots_allowed / total_ai_bots_checked * 100                 (max 4 pts)
  Checked bots: GPTBot, ClaudeBot, Google-Extended, PerplexityBot, anthropic-ai
llms_txt_score        = llms_txt_accessible ? 100 : 0 * 0.03                      (max 3 pts)
js_rendering_score    = critical_content_not_in_scripts ? 100 : 0 * 0.02          (max 2 pts)
clean_urls_score      = url_structure_readable_ratio * 100 * 0.01                  (max 1 pt)
```

**Final score computation:**
```
overall_score = (content_quality_raw * 0.30)
              + (technical_structure_raw * 0.25)
              + (authority_signals_raw * 0.20)
              + (semantic_alignment_raw * 0.15)
              + (ai_accessibility_raw * 0.10)
```

All component scores are normalized to 0-100 before weighting. The final `overall_score` is an integer 0-100.

### 4.4 Pipeline: Stage 3 — Report Generation (Claude Sonnet 4.6)

The LLM receives the scoring output from Stage 2 and generates a human-readable improvement roadmap.

**Model:** `claude-sonnet-4-6`
**Temperature:** 0.7
**Max tokens:** 4,000

**Prompt inputs:**
- Business name, industry, location (from `businesses` table)
- Per-category scores and per-factor scores from Stage 2
- Tracked queries for this business (from `tracked_queries`)
- Industry benchmarks (where available from aggregate data)
- Language preference (EN or HE)

**Prompt instruction:**
Transform the scoring data into an ordered list of specific, actionable improvements. Each improvement must:
1. Name the specific issue (not a generic category)
2. State the expected impact on the score
3. Identify the agent that can fix it (or confirm it is a manual fix)
4. Estimate implementation difficulty (Easy / Medium / Hard)

Sort improvements by: (impact * weight_of_category) / difficulty. High-impact, easy-to-implement fixes come first.

**Output structure (typed):**

```typescript
interface AIReadinessReport {
  overall_score: number                    // 0-100
  category_scores: {
    content_quality: number                // 0-100
    technical_structure: number            // 0-100
    authority_signals: number              // 0-100
    semantic_alignment: number             // 0-100
    ai_accessibility: number               // 0-100
  }
  factor_details: FactorDetail[]           // per-factor breakdown
  improvements: ImprovementItem[]          // ordered roadmap
  summary: string                          // 2-3 sentence narrative summary
  industry_comparison?: string             // vs benchmark if data available
}

interface FactorDetail {
  category: string
  factor_name: string
  score: number                            // 0-100
  issue: string | null                     // specific issue found, null if passing
  status: 'pass' | 'warn' | 'fail'
}

interface ImprovementItem {
  title: string                            // specific, actionable title
  category: string                         // which category this improves
  impact: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'hard'
  description: string                      // 1-2 sentences of detail
  fix_agent: string | null                 // agent_type value, null if manual fix
  score_impact_estimate: number           // estimated points added if fixed
  completed: boolean                       // default false; set true when verified
}
```

### 4.5 Output Storage

The AI Readiness Auditor output is stored in two places:

**1. `content_items` table:**
```sql
INSERT INTO content_items (
  user_id, business_id, agent_job_id,
  agent_type,          -- 'ai_readiness'
  content_type,        -- 'structured_report'
  content_format,      -- 'json_ld'  (structured JSON output)
  title,               -- 'AI Readiness Audit — [business_name] — [date]'
  content_body,        -- full JSON report as string
  status               -- 'approved' (auto-approved, no review needed)
)
```

**2. `ai_readiness_history` table:**
```sql
INSERT INTO ai_readiness_history (
  business_id,
  score,               -- overall_score integer
  score_breakdown,     -- jsonb: { content_quality, technical_structure, authority_signals, semantic_alignment, ai_accessibility }
  recorded_at          -- NOW()
)
ON CONFLICT (business_id, recorded_at::date)
DO UPDATE SET score = EXCLUDED.score, score_breakdown = EXCLUDED.score_breakdown
```

The `content_items` row stores the full report (improvement roadmap, factor details, narrative summary). The `ai_readiness_history` row stores only the scores for trend queries. The page fetches the latest `content_items` row for the full display and queries `ai_readiness_history` for the score trend chart.

---

## 5. AI Readiness Data Model

### 5.1 Primary Storage Tables

**`ai_readiness_history`** — score time series:

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| business_id | uuid | FK → businesses(id) ON DELETE CASCADE |
| score | integer | Overall score 0-100 |
| score_breakdown | jsonb | `{ content_quality, technical_structure, authority_signals, semantic_alignment, ai_accessibility }` — all integers 0-100 |
| recorded_at | timestamptz | Snapshot timestamp |

Unique constraint: `(business_id, recorded_at::date)` — one snapshot per business per day. On conflict, the newer run wins (DO UPDATE).

**`content_items`** for full report — query pattern:
```sql
SELECT content_body, created_at
FROM content_items
WHERE business_id = $business_id
  AND agent_type = 'ai_readiness'
  AND status = 'approved'
ORDER BY created_at DESC
LIMIT 1
```

### 5.2 How Historical Scores Are Tracked

Every time A11 runs (manually or via onboarding), a new row is inserted into `ai_readiness_history`. The score trend chart on the AI Readiness page queries:

```sql
SELECT score, score_breakdown, recorded_at
FROM ai_readiness_history
WHERE business_id = $business_id
ORDER BY recorded_at DESC
LIMIT 12  -- last 12 data points
```

This produces a time-series that shows score progression over time. The delta between the most recent and previous row drives the trend arrow shown on the overall score card.

### 5.3 How Improvement Progress Is Computed

The improvement roadmap is stored in `content_items.content_body` as a JSON string. The `completed` field on each `ImprovementItem` is the source of truth.

When an agent is triggered from the "Fix with Agent" button and completes successfully, the system marks the corresponding improvement as `completed: true` by updating the roadmap JSON in `content_items`.

Progress is displayed as: `X of Y improvements completed` with a progress bar. This is computed at read time by counting `completed: true` items in the roadmap JSON.

---

## 6. API Routes

### 6.1 GET /api/dashboard/ai-readiness

Returns the latest AI readiness data for the user's active business.

**Auth:** Required.
**Query params:** `business_id` (uuid, required)

**Response:**
```typescript
{
  data: {
    latest_report: AIReadinessReport | null    // null if no audit run yet
    score_history: Array<{
      score: number
      score_breakdown: Record<string, number>
      recorded_at: string
    }>
    last_audit_at: string | null
    is_running: boolean                        // true if A11 is currently executing
    job_id: string | null                      // current job ID if is_running
  }
}
```

**Implementation logic:**
1. Check `agent_jobs` for a running `ai_readiness` job for this business — set `is_running` accordingly
2. Fetch latest `content_items` row where `agent_type = 'ai_readiness'` — parse `content_body` as `AIReadinessReport`
3. Fetch last 12 rows from `ai_readiness_history` for score trend
4. If no report exists, return `{ latest_report: null, score_history: [] }`

### 6.2 POST /api/agents/ai_readiness/execute

Standard agent execute route. No special parameters — the agent assembles all inputs from the `businesses` record and `tracked_queries`.

**Input:**
```typescript
{
  business_id: string  // uuid
}
```

**Credit cost:** 1 (deducted via `hold_credits` RPC before Inngest event is sent)

**Response:** 202 with `{ data: { job_id } }`

### 6.3 First-Run Trigger Logic

The AI Readiness page checks `is_running` and `latest_report` on load:

```
if (latest_report === null && is_running === false):
  Show empty state with "Run AI Audit" CTA
  Clicking CTA calls POST /api/agents/ai_readiness/execute
  Redirect to /dashboard/ai-readiness?job_id=[job_id]
  Page polls GET /api/agents/executions/[job_id] every 3s
  On completion: refetch /api/dashboard/ai-readiness to show results

if (is_running === true):
  Show "Audit in progress" skeleton with the job_id progress stepper

if (latest_report !== null):
  Render full results page
```

---

## 7. Progress Tracking — Moat Builder Phase

The gamified "AI Readiness Progress Tracker" is a Moat Builder feature — not required at launch.

At launch, improvement tracking is simple: items in the roadmap can be manually marked complete, and the count of completed items shows progress.

**The Moat Builder phase adds:**

### 7.1 Milestone System

Milestones are pre-defined score thresholds and task completions:

| Milestone | Trigger | Label |
|-----------|---------|-------|
| First Audit | A11 runs for the first time | "Audit Complete" |
| Schema Added | Technical Structure score improves by 15+ pts | "Schema Implemented" |
| FAQ Optimized | Content Quality score improves by 10+ pts | "FAQ Optimized" |
| Score 50 | Overall score reaches 50 | "AI Visible" |
| Score 70 | Overall score reaches 70 | "AI Optimized" |
| Score 90 | Overall score reaches 90 | "AI Champion" |
| All Easy Fixes | All `difficulty: 'easy'` improvements completed | "Quick Wins Done" |

Milestone state is computed from `ai_readiness_history` data and the improvement roadmap. No separate milestones table at launch — computed at read time.

### 7.2 Celebration UX

When a milestone is crossed (detected by comparing last two score snapshots):
- Confetti animation fires on page load (Framer Motion)
- Milestone badge appears in a toast notification: "You reached 'AI Optimized' — your score is now 71/100"
- Milestone badge is permanently shown on the page in a "Achievements" section

### 7.3 Implementation Priority

Moat Builder phase. Do not implement at launch. The milestone computation and celebration UX require:
- A `milestones_achieved` column on `businesses` (jsonb array of achieved milestone keys)
- A comparison step in the AI Readiness page load that detects newly crossed thresholds
- Confetti and toast components

---

## 8. "Fix with Agent" Flow

Each improvement item in the roadmap has a `fix_agent` field identifying which agent can execute the fix.

**Agent mapping:**

| Improvement Category | Common Agent | Agent Type Enum |
|---------------------|-------------|----------------|
| Schema missing or incomplete | Schema Optimizer | `schema_optimizer` |
| llms.txt absent | LLMS.txt Generator | `llms_txt` |
| FAQ content thin | FAQ Agent | `faq_agent` |
| Content thin or stale | Content Writer | `content_writer` |
| Content outdated | Content Refresh Agent | `content_refresh` |
| No structured data | Schema Optimizer | `schema_optimizer` |
| robots.txt blocks AI bots | Manual fix — no agent | null |
| NAP inconsistency | Manual fix — no agent | null |

**"Fix with Agent" button behavior:**

1. User clicks "Fix with Agent" on an improvement item
2. Browser navigates to `/dashboard/agents/[agentType]`
3. The agent chat page is pre-loaded with context from the improvement item:
   - Topic pre-filled with the improvement title
   - Context injected: "This agent was triggered from an AI Readiness improvement: [improvement title]. The specific issue is: [issue description]."
4. User reviews the pre-filled context and clicks "Run Agent"
5. On agent completion: the AI Readiness page's improvement item is marked `completed: true`

**Marking complete:** The agent completion event triggers a backend step that:
1. Fetches the latest `content_items` row for `agent_type = 'ai_readiness'` for this business
2. Parses the JSON roadmap
3. Finds the improvement item matching the agent type and issue description
4. Sets `completed: true`
5. Re-saves the updated JSON to `content_items.content_body`

This is a best-effort match — if the exact item cannot be found (e.g., roadmap was regenerated since the fix was triggered), the match is skipped and the user must manually mark the item complete.

---

## 9. Implementation Checklist

- [ ] A11 agent Inngest function at `src/inngest/functions/agent-ai-readiness.ts`
- [ ] cheerio crawler utility at `src/lib/agents/crawlers/site-crawler.ts`
- [ ] Algorithmic scoring module at `src/lib/agents/scoring/ai-readiness-scorer.ts`
- [ ] Report generation prompt at `src/lib/agents/prompts/ai-readiness-report.ts`
- [ ] `GET /api/dashboard/ai-readiness` route
- [ ] AI Readiness page at `src/app/dashboard/ai-readiness/page.tsx`
- [ ] Score gauge component (reuse from dashboard overview)
- [ ] Category breakdown cards component
- [ ] Improvement roadmap list component with "Fix with Agent" buttons
- [ ] robots.txt status component
- [ ] Score trend chart (reuse from dashboard overview)
- [ ] `ai_readiness_history` table migration (if not already applied)

---

*Last updated: March 2026*
*Related specs: `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` §A11, `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.8 (`ai_readiness_history` table)*
