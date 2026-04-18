# Beamix — Product Specification

> **Last synced:** March 2026 — aligned with 03-system-design/

> Part of the PRD. Translates the Strategic Foundation into buildable requirements.
> **Repository:** https://github.com/Adam077K/Beamix

**Version:** 1.2
**Date:** 2026-02-27
**Last Updated:** 2026-03-06 — synced with System Design v2.1
**Author:**  (CPO Agent)
**Status:** Updated

> **Source of truth:** `docs/01-foundation/PRODUCT_SPECIFICATION.md`
> This document covers user journeys and high-level feature summary. For full page specs, data flows, and agent UX, defer to the system design.
>
> **Key numbers:** 23 pages, 90+ features across 10 modules, 11 AI agents, 10 AI scan engines (3 phases), 4 user journeys, 32 DB tables.
> **Trial:** 7 days starting on first dashboard visit (not signup). Capped at 5 agent credits.
> **Pricing tiers:** Discover ($79/mo) / Build ($189/mo) / Scale ($499/mo). No "Free" plan_tier in DB — free tier = null.

---

## Table of Contents

1. [User Journeys](#1-user-journeys)
2. [Feature Specification](#2-feature-specification)
3. [Subscription Tiers](#3-subscription-tiers)
4. [Information Architecture](#4-information-architecture)
5. [Internationalization Requirements](#5-internationalization-requirements)

---

## 1. User Journeys

### Journey A: First-Time Visitor -- Free Scan Conversion Funnel

**Persona:** Yael, marketing manager at a 30-person insurance company in Tel Aviv. Saw a LinkedIn post about "AI search visibility" and is curious.

**Goal:** Discover that her business is invisible in AI search. Convert to paid.

| Step | Screen | User Action | System Response | Emotional State |
|------|--------|-------------|-----------------|-----------------|
| A1 | Landing Page (`/`) | Arrives from ad/social/organic | Hero: "Find out if AI can see your business" with single URL input field | Curious |
| A2 | Landing Page | Types `www.yael-insurance.co.il` into URL field, clicks "Scan My Business" | Slide-down panel reveals 3 additional fields: Business Name, Industry (dropdown), Location (city/region) | Engaged |
| A3 | Landing Page | Fills: "Yael Insurance", "Insurance", "Tel Aviv" and clicks "Start Free Scan" | Redirect to `/scan/[scan_id]` -- animated progress screen showing each LLM being queried in real time (ChatGPT... checking, Gemini... checking, etc.) | Anticipation |
| A4 | Scan Results (`/scan/[scan_id]`) | Watches scan complete (30-60 seconds) | Results render: 4 LLM cards showing rank position (or "Not Found"), overall visibility score (0-100), top competitor comparison | Shock / Concern |
| A5 | Scan Results | Scrolls down to see details | Sees: "Your competitor [CompanyX] ranks #2 in ChatGPT for 'best insurance Tel Aviv'. You are not mentioned." Blurred section: "See what you can do about it" | Motivated |
| A6 | Scan Results | Clicks "Get Your Action Plan" (CTA below blurred section) | Modal: Email capture form. "Enter your email to save your scan and get a free action plan." | Willing to trade email |
| A7 | Email Capture | Enters email, clicks "Send My Plan" | Email sent with scan summary + 3 free recommendations. Redirect to `/signup?scan=[scan_id]` | Committed |
| A8 | Signup (`/signup`) | Pre-filled email. Adds password, confirms business details | Account created. Scan linked to account. Redirect to `/dashboard` with scan data already populated | Relief / Excitement |
| A9 | Dashboard (first visit) | Sees full scan results + trial banner | Dashboard shows: Visibility Score, per-LLM rankings, 5-8 recommendations with "Fix This" buttons. Trial counter: "7 days remaining" (trial clock starts on first dashboard visit, not signup) | Empowered |

**Conversion points measured:**
- Scan started (A3)
- Scan completed / viewed (A4)
- Email captured (A7)
- Account created (A8)
- First paid conversion (after trial)

**Key design principle:** Zero friction to scan. No account required until value is shown.

---

### Journey B: Paid User Daily Workflow

**Persona:** Avi, owner of a moving company. Subscribed to Build tier last week after his free scan showed he was invisible in 3 out of 4 LLMs.

**Goal:** Check progress, approve agent-generated content, improve rankings.

| Step | Screen | User Action | System Response | Emotional State |
|------|--------|-------------|-----------------|-----------------|
| B1 | Dashboard (`/dashboard`) | Opens Beamix from bookmark, Monday morning | Dashboard loads with updated data. Notification badge: "3 new recommendations" and "1 content piece ready for review" | Routine |
| B2 | Dashboard | Looks at Visibility Score card | Score: 34/100 (up from 28 last week). Green arrow with "+6". Per-LLM breakdown: ChatGPT #5 (was #7), Gemini: Not ranked, Perplexity #3, Claude #6 | Encouraged |
| B3 | Dashboard | Clicks on "Recommendations" tab or notification badge | Recommendation cards appear, sorted by impact (High/Medium/Low). Top card: "Write a blog post about 'tips for moving in Tel Aviv' -- ChatGPT users ask this 400x/month" | Focused |
| B4 | Recommendations (`/dashboard/recommendations`) | Clicks "Write This For Me" on top recommendation | Modal: Agent configuration. Pre-filled topic, suggested tone ("Professional, helpful"), word count slider (800-2000). Button: "Generate with Blog Writer Agent (1 agent use)" | In control |
| B5 | Agent Execution | Clicks "Generate" | Processing screen (30-90 seconds). Progress: "Researching topic... Outlining... Writing... Optimizing for AI discovery..." Status saved -- user can navigate away | Patient / Trusting |
| B6 | Content Review (`/dashboard/content`) | Navigates to Content tab, sees completed blog post | Full rendered preview with: title, meta description, body content, suggested schema markup, estimated impact badge. Buttons: "Edit", "Copy", "Download HTML", "Mark as Published" | Impressed |
| B7 | Content Review | Reads content, makes minor edit to intro paragraph | Inline editor opens. User types changes. Clicks "Save Changes" | Ownership |
| B8 | Content Review | Clicks "Copy" and pastes into WordPress | Content copied to clipboard with formatting preserved. Toast: "Copied! Mark as published once it is live so we can track its impact." | Productive |
| B9 | Content Review | Returns to Beamix, clicks "Mark as Published" | Content status changes to "Published". System begins tracking ranking impact for queries related to this content | Accomplished |

**Success signal:** User returns within 7 days and executes at least 1 agent action.

---

### Journey C: Returning User -- Seeing Results

**Persona:** Avi again, 6 weeks into his Build subscription.

**Goal:** See that his investment is working. Decide whether to continue or expand.

| Step | Screen | User Action | System Response | Emotional State |
|------|--------|-------------|-----------------|-----------------|
| C1 | Dashboard | Opens Beamix on a Thursday | Welcome back banner: "Your visibility improved 42% this month" | Validated |
| C2 | Dashboard | Clicks on Visibility Score trend chart | Line chart: Week 1: 28, Week 2: 34, Week 3: 41, Week 4: 48, Week 5: 55, Week 6: 58. Annotations on chart show when content was published | Proof |
| C3 | Rankings Detail (`/dashboard/rankings`) | Clicks "View All Rankings" | Table: Query | ChatGPT | Gemini | Perplexity | Claude | Trend. Rows show position numbers with color coding (green = top 3, yellow = 4-7, red = 8+ or not ranked) | Understanding |
| C4 | Rankings Detail | Clicks on a specific query row | Drill-down: Historical rank per LLM over time, which content pieces affected this query, competitor positions for same query | Deep insight |
| C5 | Dashboard | Notices "Usage: 50/90 AI Runs this month" in sidebar | Considers upgrading. Clicks "See Plans" | Contemplating |
| C6 | Pricing (`/pricing` or settings modal) | Views tier comparison | Current plan highlighted. Next tier shows: more AI Runs, more tracked queries, competitor tracking. "Upgrade" button. | Evaluating ROI |
| C7 | Settings | Clicks "Upgrade to Scale" | Paddle checkout (pre-filled with existing payment method). Confirms. Immediate access to new features | Committed |

**Retention signal:** User who sees ranking improvement in first 30 days has 3x higher retention.

---

## 2. Feature Specification

### 2.1 Free Scan (Top of Funnel)

**What it does:** Queries 4 major LLMs with industry-relevant prompts about the user's business, and visualizes where the business ranks (or does not appear) in AI-generated responses.

**User Story:** As a business owner who has heard about AI search, I want to see whether AI assistants recommend my business, so that I can understand if I have a visibility problem worth solving.

**Inputs:**

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| `website_url` | URL input | Yes | Valid URL format, must be reachable (HTTP 200) | `https://www.yael-insurance.co.il` |
| `business_name` | Text input | Yes | 2-100 characters | `Yael Insurance` |
| `industry` | Dropdown select | Yes | Pre-defined list of 25+ industries | `Insurance` |
| `location` | Text input with autocomplete | Yes | City/region string | `Tel Aviv` |

**Processing:**

1. System generates 5-8 industry-specific prompts. Examples for "Insurance" + "Tel Aviv":
   - "What are the best insurance companies in Tel Aviv?"
   - "Who do you recommend for home insurance in Tel Aviv?"
   - "Top rated insurance agents in Israel"
   - "Best [industry] near [location]" (generic template)
   - "Compare insurance companies in Tel Aviv"
2. Each prompt is sent to Phase 1 engines: ChatGPT (GPT-4o), Gemini (2.0 Flash), Perplexity (Sonar Pro), Claude (Sonnet 4.6). Phase 2 adds: Grok, DeepSeek, You.com. Phase 3 (deferred): Copilot, AI Overviews, Meta AI via browser simulation.
3. Responses are parsed for: business name mention (exact + fuzzy match), position in list (if list format), sentiment score 0-100 integer (NOT enum — 0=very negative, 50=neutral, 100=very positive), URL citation (yes/no)
4. Results are aggregated into a Visibility Score (0-100)

**Visibility Score Calculation:**
```
Per LLM score (0-25 per model):
  - Mentioned in response:        +10
  - In top 3 position:            +8  (or top 5: +5, or mentioned but not ranked: +2)
  - Positive sentiment:           +4  (neutral: +2, negative: +0)
  - URL cited:                    +3

Total Visibility Score = Sum of all 4 LLM scores (max 100)
```

**Output -- Scan Results Page (`/scan/[scan_id]`):**

| Section | Content | Visibility |
|---------|---------|------------|
| Visibility Score | Large circular gauge: 0-100 with color (red 0-30, yellow 31-60, green 61-100) | Free |
| Per-LLM Cards | 4 cards (ChatGPT, Gemini, Perplexity, Claude). Each shows: rank position or "Not Found", mention type (recommended/mentioned/absent), sentiment icon | Free |
| Top Competitor | "Your top competitor [name] ranks #[n] on [LLM]" -- one standout competitor callout | Free |
| Quick Wins | 2-3 specific recommendations, e.g. "Add FAQ section about [topic]" | Free |
| Full Action Plan | 5-8 detailed recommendations with agent execution buttons | Blurred / gated behind signup |
| Detailed Analysis | Per-query breakdown, exact prompts used, full response excerpts | Blurred / gated behind signup |

**Acceptance Criteria:**
- [ ] Scan completes in under 90 seconds for all 4 LLMs
- [ ] Results page renders correctly with 0 mentions (worst case) and 4/4 mentions (best case)
- [ ] Visibility Score matches calculation formula above
- [ ] Scan results are persisted and accessible via unique URL for 30 days (no account required)
- [ ] Scan can be linked to an account retroactively after signup
- [ ] No account or email required to initiate and view basic scan results
- [ ] Rate limited: max 3 scans per IP per 24 hours (prevent abuse)
- [ ] Works for both Hebrew and English business names and locations
- [ ] Mobile responsive -- scan can be completed on phone

---

### 2.2 Dashboard (Paid Core)

**What it does:** Central hub showing the user's AI visibility status, trends over time, and competitive positioning. Updated based on scan frequency of their plan tier.

**User Story:** As a paying Beamix user, I want to see at a glance how visible my business is across AI platforms and whether my efforts are working, so that I can make informed decisions about what to do next.

#### 2.2.1 Dashboard Overview (`/dashboard`)

**Layout:**

```
+----------------------------------------------------------+
| [Beamix Logo]  Dashboard | Recommendations | Content |   |
|                 Rankings  | Agents | Settings              |
+----------------------------------------------------------+
|                                                            |
|  +------------------+  +------------------+                |
|  | VISIBILITY SCORE |  | SCAN STATUS      |                |
|  |     58/100       |  | Last: 2 hrs ago  |                |
|  |   +6 this week   |  | Next: Tomorrow   |                |
|  +------------------+  +------------------+                |
|                                                            |
|  +------------------------------------------------+       |
|  | LLM RANKINGS OVERVIEW                          |       |
|  | ChatGPT: #5 (+2)  | Gemini: --  | Perplexity: |       |
|  | #3 (=)  | Claude: #6 (-1)                      |       |
|  +------------------------------------------------+       |
|                                                            |
|  +------------------------------------------------+       |
|  | VISIBILITY TREND (line chart, 30/60/90 days)   |       |
|  | [chart with annotations for published content] |       |
|  +------------------------------------------------+       |
|                                                            |
|  +------------------------------------------------+       |
|  | TOP RECOMMENDATIONS              [View All ->] |       |
|  | 1. Write blog about "moving tips" -- HIGH      |       |
|  | 2. Add schema markup to homepage -- HIGH        |       |
|  | 3. Optimize FAQ page -- MEDIUM                  |       |
|  +------------------------------------------------+       |
|                                                            |
|  +------------------+  +------------------+                |
|  | AGENT USAGE      |  | CONTENT STATUS   |                |
|  | 8/15 this month  |  | 3 published      |                |
|  | [Upgrade]        |  | 1 in review      |                |
|  +------------------+  +------------------+                |
+----------------------------------------------------------+
```

**Metrics displayed:**

| Metric | Source | Update Frequency |
|--------|--------|-----------------|
| Visibility Score (0-100) | Calculated from latest scan | Per scan cycle |
| Score change (delta) | Compared to previous scan | Per scan cycle |
| Per-LLM rank | Latest `ranking_results` per LLM per query (averaged) | Per scan cycle |
| Per-LLM rank change | Delta from previous scan | Per scan cycle |
| Visibility trend | Historical scores, 30/60/90 day view | Accumulated |
| Top 3 recommendations | From `recommendations` table, sorted by impact | After each analysis |
| Agent usage | Count of `agent_jobs` this billing period | Real-time |
| Content status | Count of items by status in `content_items` | Real-time |

**Acceptance Criteria:**
- [ ] Dashboard loads in under 2 seconds with cached data
- [ ] Visibility Score gauge is color-coded: red (0-30), yellow (31-60), green (61-100)
- [ ] Trend chart supports 30, 60, and 90 day toggles
- [ ] Trend chart shows annotation markers for dates when content was published
- [ ] "Last scanned" and "Next scan" timestamps shown
- [ ] Empty state for new users who just signed up (shows scan in progress or "First scan starting soon")
- [ ] Agent usage shows `used/limit` with progress bar
- [ ] All dashboard cards are clickable and navigate to their detail pages

#### 2.2.2 Rankings Detail (`/dashboard/rankings`)

**Layout:** Table with filtering and sorting.

**Columns:**

| Column | Description | Sortable |
|--------|-------------|----------|
| Query | The tracked search query text | Yes |
| ChatGPT | Rank position (1-10 or "--") | Yes |
| Gemini | Rank position | Yes |
| Perplexity | Rank position | Yes |
| Claude | Rank position | Yes |
| Avg Rank | Average across LLMs where ranked | Yes |
| Trend | Arrow icon (up/down/flat) + delta | Yes |
| Last Checked | Timestamp of most recent scan | Yes |

**Row interaction:** Click row to expand inline detail panel showing:
- Historical rank per LLM (sparkline chart)
- Which content pieces are associated with this query
- Competitor positions for the same query
- Exact prompts used and response excerpts (collapsible)

**Filters:**
- LLM filter: Show only specific LLM columns
- Status filter: "Ranked" / "Not Ranked" / "All"
- Trend filter: "Improving" / "Declining" / "Stable"
- Date range selector

**Acceptance Criteria:**
- [ ] Table supports sorting by any column
- [ ] Color coding: green (#1-3), yellow (#4-7), red (#8-10), gray ("--" not ranked)
- [ ] Row expansion shows historical data in sparkline format
- [ ] Filters are combinable (AND logic)
- [ ] "Add Query" button opens modal to add new tracked query (within plan limit)
- [ ] Query count shown: "12/25 queries tracked" with plan limit

#### 2.2.3 Competitive Comparison

**Location:** Tab within Rankings, or section on Dashboard.

**What it shows:**
- Side-by-side comparison: User's business vs up to 3 competitors
- Per-query: who ranks higher in each LLM
- Aggregate: overall visibility score comparison
- Insight cards: "CompetitorX outranks you on 6/10 queries because they have more FAQ content"

**Inputs:**
- User adds competitors by name or URL during onboarding or from Settings
- System automatically detects competitors from LLM responses (businesses ranked near user)

**Acceptance Criteria:**
- [ ] User can add up to 3 competitors (Discover) or 5 competitors (Build) or 10 (Scale)
- [ ] Auto-detected competitors shown as suggestions: "We noticed [X] ranks near you. Track them?"
- [ ] Comparison table shows user's rank vs each competitor per query per LLM
- [ ] Overall comparison card: "You outrank [Competitor] on 4/10 queries"

---

### 2.3 AI Agents Suite

**Shared behavior across all agents:**

- **Trigger:** User clicks agent action button from Recommendations, Dashboard, or Content page
- **Configuration:** Modal with pre-filled inputs (from recommendation context) + optional customization
- **Execution:** Async via server-side worker. Frontend shows progress indicator. User can navigate away.
- **Completion:** Result appears in Content tab with status "Ready for Review"
- **Usage tracking:** Each execution decrements `agent_uses_remaining` for the billing period
- **Error handling:** If agent fails, status set to "Failed" with retry button. No usage deducted for failures.

**Usage model (replaces credits):**

Each plan tier includes a set number of "agent uses" per month. One agent execution = one use, regardless of which agent. Simple, no confusion.

---

#### 2.3.1 Recommendations Agent

**Purpose:** Analyzes the user's current visibility data, identifies gaps, and generates a prioritized list of specific actions to improve AI search rankings.

**Trigger:** Runs automatically after each scan cycle (emitted by `scan/complete` Inngest event). User can also trigger manually ("Refresh Recommendations"). Does NOT consume a credit (0 credits — system agent).

**Inputs (automatic):**
- All `ranking_results` for user's tracked queries
- User's business profile (industry, location, website URL)
- Competitor data (if tracked)
- Previously completed recommendations (to avoid duplicates)
- Content already generated and published

**Outputs:**

Each recommendation is a structured object:

```typescript
interface Recommendation {
  id: string;
  title: string;                    // "Write a blog post about moving tips in Tel Aviv"
  description: string;              // 2-3 sentence explanation of why this matters
  impact: 'high' | 'medium' | 'low';
  category: 'content' | 'schema' | 'reviews' | 'social' | 'technical';
  target_queries: string[];         // Which tracked queries this would improve
  target_llms: string[];            // Which LLMs this is most relevant for
  suggested_agent: string;          // Which agent can execute this
  status: 'new' | 'in_progress' | 'completed' | 'dismissed';
  created_at: string;
  evidence: string;                 // "CompetitorX ranks #1 with a dedicated FAQ page about this topic"
}
```

**Recommendation card UI:**

```
+----------------------------------------------------------+
| [HIGH] Write a blog post about "moving tips in Tel Aviv" |
|                                                           |
| ChatGPT users ask about this 400x/month and you're not   |
| mentioned. Your competitor MoveStar ranks #1 with a       |
| dedicated article.                                        |
|                                                           |
| Targets: "moving company tel aviv", "moving tips"         |
| Best for: ChatGPT, Perplexity                             |
|                                                           |
| [Write This For Me]  [I'll Do It Myself]  [Dismiss]       |
+----------------------------------------------------------+
```

**User Interaction:**
- "Write This For Me" -- opens the appropriate agent (Blog Writer for blog content, Content Writer for website pages, Schema Optimizer for schema tasks)
- "I'll Do It Myself" -- marks as "in_progress", shows guidance text for manual execution
- "Dismiss" -- removes from active list, noted so future recommendations avoid duplicates

**Acceptance Criteria:**
- [ ] Generates 5-10 recommendations per scan cycle
- [ ] Each recommendation has a clear, specific action (not generic "improve your content")
- [ ] Recommendations sorted by impact score (high first)
- [ ] No duplicate recommendations for already-completed or dismissed items
- [ ] Category distribution: at least 2 different categories per batch
- [ ] "Write This For Me" pre-fills the appropriate agent's configuration modal
- [ ] Manual trigger ("Refresh Recommendations") respects rate limit (max 1 per 24 hours)
- [ ] Does not consume an agent use (runs as part of platform scanning)

---

#### 2.3.2 Content Writer Agent

**Purpose:** Generates GEO-optimized website content (landing pages, service pages, about pages) designed to increase AI search visibility.

**Inputs:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `page_type` | Select: "Landing Page" / "Service Page" / "About Page" / "FAQ Page" | Yes | From recommendation |
| `topic` | Text (pre-filled from recommendation) | Yes | From recommendation |
| `target_queries` | Multi-select from tracked queries | Yes | From recommendation |
| `tone` | Select: "Professional" / "Friendly" / "Authoritative" / "Conversational" | Yes | "Professional" |
| `word_count` | Slider: 500-3000 | Yes | 1200 |
| `include_faq` | Toggle | No | true |
| `include_schema` | Toggle | No | true |
| `language` | Select: "English" / "Hebrew" | Yes | Account default |
| `additional_instructions` | Textarea | No | Empty |

**Processing (server-side agent):**
1. Research phase: Query Perplexity for current information about the topic
2. Competitor analysis: Analyze top-ranked competitor content for the target queries
3. Outline generation: Create content structure optimized for LLM discovery
4. Content writing: Generate full content with GEO optimization (structured headers, FAQ section, citation-friendly facts, schema markup)
5. Quality check: Verify content is original, factually accurate, and optimized

**Output:**

```typescript
interface ContentOutput {
  title: string;
  meta_description: string;         // 150-160 chars, optimized
  content_html: string;             // Full HTML content
  content_markdown: string;         // Markdown version
  faq_section: { q: string; a: string }[];  // Structured FAQ
  schema_markup: string;            // JSON-LD schema
  target_queries: string[];
  word_count: number;
  estimated_impact: string;         // "Could improve ChatGPT ranking for 'moving company tel aviv' by 2-3 positions"
  seo_meta: {
    og_title: string;
    og_description: string;
  };
}
```

**User Interaction:**
1. Modal opens with pre-filled fields
2. User customizes (optional) and clicks "Generate"
3. Progress screen: 45-120 seconds
4. Result appears in Content tab as "Ready for Review"
5. User reviews in full preview mode
6. User can: Edit inline, Copy to clipboard, Download as HTML, Mark as Published

**Acceptance Criteria:**
- [ ] Generated content is 500-3000 words based on selection
- [ ] Content includes H1, H2, H3 hierarchy optimized for AI parsing
- [ ] FAQ section included when toggled (3-6 Q&A pairs)
- [ ] Schema markup is valid JSON-LD (validates against Google's Rich Results Test)
- [ ] Content is unique (not duplicated from existing user content or competitor sites)
- [ ] Output renders correctly in preview mode with proper formatting
- [ ] Hebrew content is grammatically correct and reads naturally (not machine-translated)
- [ ] Generation completes within 120 seconds
- [ ] Costs 1 agent use

---

#### 2.3.3 Blog Writer Agent

**Purpose:** Creates blog posts targeting AI-discoverable topics related to the user's industry. Blog content is a key GEO strategy because LLMs frequently cite blog articles as sources.

**Inputs:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `title_suggestion` | Text (pre-filled from recommendation) | Yes | From recommendation |
| `target_queries` | Multi-select from tracked queries | Yes | From recommendation |
| `blog_length` | Select: "Short (600-800)" / "Standard (1000-1500)" / "Long (1500-2500)" | Yes | "Standard" |
| `tone` | Select: "Educational" / "Opinion" / "How-To" / "Listicle" / "Case Study" | Yes | "Educational" |
| `include_statistics` | Toggle | No | true |
| `include_internal_links` | Toggle | No | true |
| `language` | Select: "English" / "Hebrew" | Yes | Account default |
| `additional_context` | Textarea | No | Empty |

**Processing (server-side agent):**
1. Topic research: Perplexity query for latest data, statistics, trends
2. Outline with hook: Create engaging structure with strong intro
3. Draft with citations: Write content with factual claims backed by sources
4. GEO optimization pass: Add FAQ, structured data hints, citation-friendly formatting
5. Title optimization: Generate 3 title options (user can pick)

**Output:**

```typescript
interface BlogOutput {
  title_options: string[];           // 3 title suggestions
  selected_title: string;
  meta_description: string;
  content_html: string;
  content_markdown: string;
  excerpt: string;                   // 2-3 sentence summary for social sharing
  estimated_read_time: string;       // "5 min read"
  sources_cited: { title: string; url: string }[];
  suggested_tags: string[];
  faq_section: { q: string; a: string }[];
  schema_markup: string;             // BlogPosting JSON-LD
}
```

**Acceptance Criteria:**
- [ ] 3 title options provided; user selects one (or edits)
- [ ] Content includes at least 2 cited statistics/sources when "include_statistics" is on
- [ ] Blog includes a clear introduction, body sections with subheadings, and conclusion
- [ ] FAQ section (2-4 Q&A pairs) appended at the end
- [ ] BlogPosting schema markup generated automatically
- [ ] Excerpt suitable for social media sharing (under 280 chars)
- [ ] Tags suggested from content topics (3-5 tags)
- [ ] Hebrew blog posts follow Hebrew blogging conventions (RTL, natural phrasing)
- [ ] Costs 1 agent use

---

#### 2.3.4 Review Analyzer Agent

**Purpose:** Analyzes the business's online reviews across platforms (Google, Facebook, Yelp, industry-specific sites), extracts themes, and provides actionable recommendations for improving review-based AI visibility.

**Why it matters:** LLMs heavily weigh review sentiment and volume when recommending businesses. A business with 50 positive reviews mentioning specific services will rank higher than one with 10 generic reviews.

**Inputs:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `business_name` | Text (pre-filled from profile) | Yes | Profile value |
| `platforms` | Multi-select: "Google Maps" / "Facebook" / "Yelp" / "TripAdvisor" / "Industry-specific" | Yes | ["Google Maps"] |
| `location` | Text (pre-filled) | Yes | Profile value |
| `focus_area` | Select: "Overall Sentiment" / "Service Quality" / "Competitor Comparison" / "Response Strategy" | Yes | "Overall Sentiment" |
| `language` | Select: "English" / "Hebrew" / "Both" | Yes | Account default |

**Processing (server-side agent):**
1. Review collection: Scrape/API-fetch recent reviews (last 6 months, up to 100)
2. Sentiment analysis: Classify each review as positive/neutral/negative
3. Theme extraction: Identify recurring topics (e.g., "customer service", "pricing", "speed")
4. Competitor review comparison: If competitors tracked, compare review themes
5. Action plan: Generate specific recommendations

**Output:**

```typescript
interface ReviewAnalysis {
  summary: {
    total_reviews_analyzed: number;
    avg_rating: number;              // e.g., 4.2
    sentiment_breakdown: {
      positive: number;              // percentage
      neutral: number;
      negative: number;
    };
  };
  themes: {
    theme: string;                   // "Customer Service"
    mention_count: number;
    avg_sentiment: number;                    // 0-100 integer (0=very negative, 50=neutral, 100=very positive)
    sample_quotes: string[];         // 2-3 representative quotes
  }[];
  competitor_comparison?: {
    competitor_name: string;
    their_avg_rating: number;
    their_strengths: string[];       // Themes where they score higher
    your_advantages: string[];       // Themes where you score higher
  }[];
  recommendations: {
    action: string;                  // "Ask satisfied customers to mention 'fast delivery' in reviews"
    impact: 'high' | 'medium' | 'low';
    rationale: string;
  }[];
  response_templates?: {             // Templates for responding to reviews
    review_type: 'positive' | 'negative';
    template: string;
  }[];
}
```

**Acceptance Criteria:**
- [ ] Analyzes minimum 20 reviews (or all available if fewer)
- [ ] Theme extraction identifies at least 3 distinct themes
- [ ] Recommendations are specific (not "get more reviews" but "ask customers who mentioned fast delivery to leave Google reviews")
- [ ] Competitor comparison available when competitors are tracked
- [ ] Response templates provided for both positive and negative reviews
- [ ] Hebrew reviews analyzed with Hebrew-language NLP
- [ ] Costs 1 agent use

---

#### 2.3.5 Schema Optimizer Agent

**Purpose:** Generates structured data (JSON-LD schema markup) for the user's website that helps LLMs better understand and recommend the business.

**Why it matters:** Structured data is the #1 ranking factor for GEO. LLMs parse schema markup to understand what a business does, where it operates, and what customers say about it.

**Inputs:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `website_url` | URL (pre-filled from profile) | Yes | Profile value |
| `page_url` | URL of specific page to optimize | Yes | Homepage |
| `schema_types` | Multi-select: "LocalBusiness" / "Organization" / "Product" / "Service" / "FAQ" / "Review" / "BreadcrumbList" | Yes | Auto-detected |
| `business_details` | Structured form: name, address, phone, hours, services | Yes | Pre-filled from profile |

**Processing (server-side agent):**
1. Page analysis: Fetch and parse the target page HTML
2. Existing schema detection: Identify any existing schema markup
3. Gap analysis: Determine which schema types are missing or incomplete
4. Schema generation: Create comprehensive JSON-LD markup
5. Validation: Test against Schema.org and Google's requirements

**Output:**

```typescript
interface SchemaOutput {
  existing_schema: {
    types_found: string[];
    issues: string[];                // "Organization schema missing 'telephone' field"
  };
  generated_schema: {
    type: string;                    // "LocalBusiness"
    json_ld: string;                 // Complete JSON-LD code block
    placement_instructions: string;  // "Add to <head> of your homepage"
  }[];
  implementation_guide: string;      // Step-by-step for non-technical users
  validation_results: {
    valid: boolean;
    warnings: string[];
  };
}
```

**Acceptance Criteria:**
- [ ] Generated JSON-LD validates against Schema.org specification
- [ ] Implementation guide written for non-technical users (step-by-step with screenshots references)
- [ ] Detects and reports existing schema issues
- [ ] Supports at minimum: LocalBusiness, Organization, FAQPage, Product, Service schemas
- [ ] Copy button copies JSON-LD code block to clipboard
- [ ] Includes HTML placement instructions (where in the page to paste)
- [ ] Costs 1 agent use

---

#### 2.3.6 Social Strategy Agent

**Purpose:** Generates a social media content strategy designed to increase the business's AI visibility. Social signals influence LLM recommendations through brand mention frequency and authority.

**Inputs:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `platforms` | Multi-select: "LinkedIn" / "Facebook" / "Instagram" / "Twitter/X" | Yes | Auto-suggested based on industry |
| `content_frequency` | Select: "3x/week" / "5x/week" / "Daily" | Yes | "3x/week" |
| `time_horizon` | Select: "2 weeks" / "1 month" / "3 months" | Yes | "1 month" |
| `brand_voice` | Select: "Professional" / "Casual" / "Expert" / "Friendly" | Yes | "Professional" |
| `target_queries` | Multi-select from tracked queries | Yes | Top 5 by impact |
| `language` | Select: "English" / "Hebrew" / "Both" | Yes | Account default |

**Processing (server-side agent):**
1. Industry trend analysis: What topics are trending in the user's industry on social
2. Content calendar creation: Map topics to dates with posting frequency
3. Post drafting: Write actual post copy for each calendar slot
4. Hashtag research: Identify relevant hashtags for discoverability
5. Cross-platform adaptation: Adjust tone and format per platform

**Output:**

```typescript
interface SocialStrategyOutput {
  strategy_summary: string;          // 3-4 paragraph overview
  content_calendar: {
    date: string;
    platform: string;
    post_type: 'text' | 'image_suggestion' | 'video_idea' | 'carousel_idea';
    topic: string;
    copy: string;                    // Ready-to-post text
    hashtags: string[];
    target_query_alignment: string;  // Which tracked query this supports
  }[];
  hashtag_strategy: {
    always_use: string[];            // Brand hashtags
    rotate: string[];                // Topic hashtags
    trending: string[];              // Time-sensitive hashtags
  };
  kpis: {
    metric: string;
    target: string;
    measurement: string;
  }[];
}
```

**Acceptance Criteria:**
- [ ] Content calendar covers the full selected time horizon
- [ ] Each post has complete, ready-to-copy text (not outlines)
- [ ] Posts are adapted per platform (LinkedIn is longer/professional, Instagram is visual-focused, etc.)
- [ ] Strategy explicitly ties social content back to tracked GEO queries
- [ ] Hebrew posts use natural Hebrew social media conventions
- [ ] At least 3 content types used across the calendar (not all text posts)
- [ ] Costs 1 agent use

---

> **Note:** Agents A7 (Social Strategy), A8 (Competitor Intelligence), A9 (Citation Builder), A10 (LLMS.txt Generator), A11 (AI Readiness Auditor), A12 (Ask Beamix) are also part of the Launch Critical set. Full specs in `docs/01-foundation/PRODUCT_SPECIFICATION.md` §5.
>
> **Growth Phase agents (A13-A16 — not at launch):**
> - **A13 Content Voice Trainer** — learns the business's writing style from existing website content. Uses Opus for high-quality voice extraction. (1 credit)
> - **A14 Content Pattern Analyzer** — analyzes what makes cited content succeed; crawls top-ranked content for the user's queries. (1 credit)
> - **A15 Content Refresh Agent** — audits published content for staleness; suggests and rewrites outdated sections. (1 credit)
> - **A16 Brand Narrative Analyst** — explains WHY AI says what it says about the business; identifies narrative gaps. Uses Opus for depth. (1 credit)

---

### 2.4 Settings & Account

#### 2.4.1 Business Profile (`/dashboard/settings/profile`)

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `business_name` | Text | Yes | Used across all agent outputs |
| `website_url` | URL | Yes | Primary URL for scanning |
| `industry` | Dropdown | Yes | From predefined industry list |
| `location` | Text + autocomplete | Yes | City/region for geo-targeted queries |
| `description` | Textarea (500 chars) | No | Brief business description for agent context |
| `services` | Tag input | No | List of services offered |
| `target_audience` | Text | No | "Families relocating to Tel Aviv" |
| `competitors` | List of name+URL pairs | No | Limited by plan tier |
| `logo` | Image upload | No | Used in reports |

**Acceptance Criteria:**
- [ ] All fields save on blur or explicit "Save" button
- [ ] Industry dropdown has 25+ options covering common SMB sectors
- [ ] Competitor list enforces plan tier limit (3/5/10)
- [ ] Changes to business profile trigger recommendation refresh within 24 hours

#### 2.4.2 Subscription Management (`/dashboard/settings/billing`)

**Displays:**
- Current plan name and price
- Billing cycle (monthly/annual) and next billing date
- Agent uses: `used / total` with progress bar
- Tracked queries: `used / total`
- Payment method (last 4 digits of card)
- Billing history (list of invoices, downloadable)

**Actions:**
- "Change Plan" -- opens plan comparison modal with upgrade/downgrade flow
- "Update Payment Method" -- redirects to Paddle Customer Portal
- "Cancel Subscription" -- cancellation flow with retention offer ("Switch to Discover instead?")
- "Download Invoice" -- per invoice row

**Acceptance Criteria:**
- [ ] Plan changes take effect immediately (prorated via Paddle)
- [ ] Downgrade warns user if they exceed new plan limits (e.g., "You have 20 queries but Discover allows 10")
- [ ] Cancel flow includes retention step before confirming
- [ ] Invoice download generates PDF via Paddle
- [ ] Agent usage resets on billing date (shown clearly)

#### 2.4.3 Language Preference (`/dashboard/settings/preferences`)

**Options:**
- Interface language: "English" / "Hebrew" (toggles entire UI direction and labels)
- Content generation language: "English" / "Hebrew" (default for agent outputs)
- These can differ (e.g., English UI but Hebrew content generation)

**Acceptance Criteria:**
- [ ] Language switch is instant (no page reload, uses React state + i18n)
- [ ] RTL layout applies correctly when Hebrew is selected
- [ ] All UI strings are translated (no untranslated strings in either language)
- [ ] Content generation language is independent of interface language
- [ ] Language preference persisted to user profile in database

#### 2.4.4 Integrations (`/dashboard/settings/integrations`)

7 integrations available (access varies by plan):

| Integration | Plan | Purpose |
|-------------|------|---------|
| WordPress | Build+ | Publish content directly from Content Library to WordPress |
| Google Analytics 4 | Build+ | Import traffic data for content performance attribution |
| Google Search Console | Build+ | Import organic rankings to correlate with AI visibility |
| Slack | Build+ | Alert notifications to Slack channel |
| Cloudflare | Scale | Analytics integration |
| Paddle | All paid | Billing portal access (auto-connected at signup) |
| API Keys | Scale | REST API access for custom integrations |

**OAuth flow:** WordPress, GA4, GSC, Slack use OAuth. Cloudflare uses API token. Credentials encrypted at rest (AES-256-GCM).

---

## 3. Subscription Tiers

### Design Principles (from Strategic Foundation)
1. Affordable for SMBs -- not $250+/month
2. Clear value progression between tiers
3. No confusing credit systems
4. Free scan hook with no payment required

### Tier Structure

| | Free Scan | Discover | Build | Scale |
|---|---|---|---|---|
| **Price** | $0 | $79/mo | $189/mo | $499/mo |
| **Annual price** | -- | $63/mo (billed $756/yr) | $151/mo (billed $1,812/yr) | $399/mo (billed $4,788/yr) |
| **Trial** | N/A | 7-day free trial | 7-day free trial | 7-day free trial |
| | | | | |
| **Scanning** | | | | |
| Free scan | 1 (no account) | Included | Included | Included |
| Tracked queries | 0 | 10 | 25 | 75 |
| LLMs scanned | 4 | 4 | 7 | 10 |
| Scan frequency | One-time | Weekly | Every 3 days | Daily |
| | | | | |
| **AI Agents** | | | | |
| AI Runs/month | 0 | 25 | 90 | 300 |
| Recommendations Agent | Preview (3 items) | Full access | Full access | Full access |
| Content Writer Agent | -- | Yes | Yes | Yes |
| Blog Writer Agent | -- | Yes | Yes | Yes |
| Review Analyzer Agent | -- | -- | Yes | Yes |
| Schema Optimizer Agent | -- | Yes | Yes | Yes |
| Social Strategy Agent | -- | -- | Yes | Yes |
| | | | | |
| **Competitive Intel** | | | | |
| Competitors tracked | 0 (1 shown in scan) | 3 | 5 | 10 |
| Competitor detail | Name only | Rankings comparison | Full analysis | Full analysis + alerts |
| | | | | |
| **Reporting** | | | | |
| Dashboard | -- | Basic | Full + trends | Full + export |
| Email reports | -- | -- | Weekly digest | Daily digest |
| Export (PDF/CSV) | -- | -- | -- | Yes |
| | | | | |
| **Support** | | | | |
| Support | -- | Email (48hr) | Priority email (24hr) | Priority + onboarding call |
| | | | | |
| **Languages** | | | | |
| Interface | English + Hebrew | English + Hebrew | English + Hebrew | English + Hebrew |
| Content generation | -- | English + Hebrew | English + Hebrew | English + Hebrew |

### Pricing Rationale

**Discover at $79/mo:** Priced for SMBs exploring GEO. Comparable to Mailchimp or Canva Pro -- tools SMBs already pay for. Provides enough value (10 queries, 25 AI Runs/month) for a micro-business to see results.

**Build at $189/mo:** The sweet spot for growing SMBs. 90 AI Runs means ~3-4 content pieces per month plus analysis. Unlocks Review Analyzer and Social Strategy -- the agents that differentiate Beamix from "just another content tool." Under the $200 budget threshold most SMB marketing managers can approve without executive sign-off.

**Scale at $499/mo:** For businesses serious about AI visibility. Daily scanning, 300 AI Runs, 75 queries, full export and reporting. Still far cheaper than enterprise competitors ($2K-5K). The 10-competitor tracking makes it valuable for competitive industries.

**Annual discount (20%):** Reduces churn, improves cash flow. Clearly shown as monthly equivalent price.

### AI Runs Add-On

For users who exhaust their monthly AI Runs:
- **25 additional AI Runs:** $15 (one-time purchase)
- **90 additional AI Runs:** $35 (one-time purchase)
- Available from the "Agent Usage" card on dashboard when usage exceeds 80%

---

## 4. Information Architecture

### 4.1 Complete Sitemap

```
/                                   # Marketing homepage + free scan input
/scan/[scan_id]                     # Scan results (public, shareable URL)
/pricing                            # Pricing page with tier comparison
/about                              # About Beamix
/blog                               # Marketing blog (SEO/GEO content)
/blog/[slug]                        # Individual blog post

/login                              # Login page
/signup                             # Signup page (can receive ?scan= param)
/reset-password                     # Password reset request
/reset-password/confirm             # Password reset confirmation

/dashboard                          # Main dashboard overview
/dashboard/rankings                 # Detailed rankings table
/dashboard/rankings/[query_id]      # Single query deep-dive
/dashboard/recommendations          # All recommendations list
/dashboard/content                  # All generated content list
/dashboard/content/[content_id]     # Single content item view/edit
/dashboard/agents                   # Agent hub (overview of all agents)
/dashboard/agents/content-writer    # Content Writer Agent launcher
/dashboard/agents/blog-writer       # Blog Writer Agent launcher
/dashboard/agents/review-analyzer   # Review Analyzer Agent launcher
/dashboard/agents/schema-optimizer  # Schema Optimizer Agent launcher
/dashboard/agents/social-strategy   # Social Strategy Agent launcher
/dashboard/competitors              # Competitor tracking & comparison
/dashboard/settings                 # Settings hub
/dashboard/settings/profile         # Business profile
/dashboard/settings/billing         # Subscription & billing
/dashboard/settings/preferences     # Language, notifications
/dashboard/settings/team            # Team members (future)

/api/auth/*                         # Auth endpoints
/api/scan/*                         # Free scan endpoints
/api/queries/*                      # Tracked query CRUD
/api/rankings/*                     # Rankings data
/api/recommendations/*              # Recommendations data
/api/agents/*                       # Agent execution endpoints
/api/content/*                      # Content CRUD
/api/billing/*                      # Paddle billing (status, portal, usage, invoices)
/api/billing/webhooks               # Paddle webhook endpoint (canonical path)
/api/webhooks/agents                # Agent completion webhooks
/api/cron/*                         # Scheduled job endpoints
```

### 4.2 Navigation Structure

**Top-level navigation (sidebar on desktop, bottom nav on mobile):**

```
[Beamix Logo]

Dashboard          /dashboard              (icon: LayoutDashboard)
Rankings           /dashboard/rankings     (icon: BarChart3)
Recommendations    /dashboard/recommendations (icon: Lightbulb) [badge: count]
Content            /dashboard/content      (icon: FileText) [badge: pending review count]
Agents             /dashboard/agents       (icon: Bot)
Competitors        /dashboard/competitors  (icon: Users)

--- separator ---

Settings           /dashboard/settings     (icon: Settings)

--- bottom of sidebar ---

[Plan: Pro]        /dashboard/settings/billing
[Agent uses: 8/15] (progress bar)
[User avatar + name]
```

**Mobile navigation (bottom bar, 5 items max):**

```
Dashboard | Rankings | Agents | Content | More (opens drawer with remaining items)
```

**Breadcrumbs:** Shown on all dashboard sub-pages.
- Dashboard > Rankings > "best insurance tel aviv"
- Dashboard > Content > "Blog: Moving Tips in Tel Aviv"
- Dashboard > Agents > Blog Writer

---

## 5. Internationalization Requirements

### 5.1 Day-1 Languages

| Language | Code | Direction | Primary Market |
|----------|------|-----------|---------------|
| English | `en` | LTR | Global |
| Hebrew | `he` | RTL | Israel |

### 5.2 What Needs Localization

**Full translation required (all UI strings):**

| Category | Count (est.) | Examples |
|----------|-------------|---------|
| Navigation labels | ~15 | "Dashboard", "Rankings", "Settings" |
| Button labels | ~40 | "Scan My Business", "Generate", "Save Changes", "Upgrade" |
| Form labels & placeholders | ~50 | "Business Name", "Enter your website URL" |
| Status messages | ~30 | "Scan in progress...", "Content ready for review", "Failed - try again" |
| Empty states | ~10 | "No recommendations yet. Your first scan is running." |
| Error messages | ~25 | "Invalid URL", "Please enter your business name" |
| Tooltips & help text | ~20 | "Visibility Score measures how often AI assistants mention your business" |
| Email templates | ~8 | Welcome email, scan results email, weekly digest |
| Marketing pages | ~5 pages | Landing page, pricing page, about page |
| Agent descriptions | ~6 | Description of each agent's purpose and capabilities |
| Plan names & descriptions | ~4 | "Discover", "Build", "Scale" tier descriptions |

**Estimated total translatable strings:** ~210

### 5.3 What Does NOT Need Localization

| Item | Reason |
|------|--------|
| Brand name "Beamix" | Universal |
| LLM names (ChatGPT, Gemini, etc.) | Proper nouns |
| Schema markup output | Technical, always English JSON-LD |
| API endpoints | Technical |
| Metric values (numbers, percentages) | Universal (with locale-aware formatting) |
| Industry list | Translated (appears in dropdown) |
| Plan tier names (Discover/Build/Scale) | Keep in English (internationally recognized) |

### 5.4 RTL Implementation Requirements

**Layout changes for Hebrew (RTL):**
- [ ] `dir="rtl"` on `<html>` element when Hebrew is selected
- [ ] Sidebar moves to right side of screen
- [ ] Text alignment flips (left-aligned becomes right-aligned)
- [ ] Icons that imply direction flip (arrows, chevrons, progress indicators)
- [ ] Charts and tables maintain LTR for numerical data but RTL for labels
- [ ] Form layouts flip (label position, input alignment)
- [ ] Navigation order does not flip (maintains top-to-bottom hierarchy)
- [ ] Tailwind CSS logical properties used throughout: `ms-` / `me-` instead of `ml-` / `mr-`, `ps-` / `pe-` instead of `pl-` / `pr-`

**Technical implementation:**
- i18n library: `next-intl` (supports Next.js App Router, RSC compatible)
- Translation files: `/messages/en.json`, `/messages/he.json`
- URL structure: No locale prefix (language stored in user preference, not URL)
- Fallback: English (if translation missing)
- Font: Must support both Latin and Hebrew characters (Inter supports Hebrew glyphs; verify or add Heebo as Hebrew fallback)

### 5.5 Content Generation Language

Agent-generated content respects the user's `content_language` preference:
- English content: Standard GEO-optimized English
- Hebrew content: Must be natural Hebrew, NOT translated-from-English. Agents instructed to write natively in Hebrew with Israeli market context.
- User can override per-generation (select language in agent modal)

### 5.6 Locale-Aware Formatting

| Data Type | English (en) | Hebrew (he) |
|-----------|-------------|-------------|
| Numbers | 1,234.56 | 1,234.56 |
| Currency | $79/mo | $79/mo (USD shown in both) |
| Dates | Feb 27, 2026 | 27 Feb 2026 (or Hebrew date format) |
| Percentages | 42% | 42% |

---

## Decisions Made

| Decision | Rationale | Status |
|----------|-----------|--------|
| AI Runs (not credits) as usage model | Strategic Foundation says "no confusing credit systems." Flat AI Runs are simpler to understand: "You get 90 runs/month." | Locked |
| 4 tiers: Free Scan + Discover ($79) + Build ($189) + Scale ($499) | Must be affordable for SMBs, clear progression. Discover entry is accessible to SMBs; Scale is under competitor enterprise tiers. | Locked |
| 11 agents (launch roster) | Platform ships with 11 launch agents. Content Writer and Blog Writer are separate because outputs differ (website pages vs blog posts). Ask Beamix is 0-credit, Build+. Recommendations is 0-credit, auto-runs post-scan. | Locked |
| Hebrew + English from day 1 | Strategic Foundation explicitly states this. Old PRD had "Hebrew in Phase 2" -- overridden. | Locked |
| Free scan requires no account | Strategic Foundation: "This is free for everyone. Top of funnel." Zero friction principle. | Locked |
| Scan results shareable via URL for 30 days | Enables word-of-mouth sharing: "Look at this, my competitor ranks #2 and I'm invisible" | Locked |
| next-intl for i18n | Best Next.js App Router support, RSC compatible, maintained actively | Locked |
| Logical Tailwind properties (ms/me/ps/pe) | Required for RTL support without duplicating styles | Locked |

## Open Questions

| Question | Owner | Deadline |
|----------|-------|----------|
| Exact industry list for dropdown (25+ options) -- needs validation with target market | Rex (research) | Before build |
| Free scan rate limit: 3 per IP per 24h -- is this too restrictive? Could hurt organic sharing. | Morgan + Atlas | Before build |
| Should annual plans show savings as dollar amount or percentage? | Nova (copy) | Before build |
| Do we need a "Freemium" tier between Free Scan and Discover? (e.g., free account with limited dashboard but no agents) | Morgan | Week 2 decision |
| Schema Optimizer: should it auto-detect existing schema or require user to paste current HTML? | Atlas | During build |
| Review Analyzer: which review scraping method is legal and reliable? API vs scraping implications. | Atlas + Guardian | Before build |
| Hebrew font: Is Inter sufficient or do we need Heebo/Rubik as fallback? | Lyra (design) | Before build |

---

**END OF PRODUCT SPECIFICATION**

**Next steps:**
1. Review with founder -- validate pricing, agent scope, and user journeys
2. Pass to Lyra for design system and wireframes
3. Pass to Atlas for technical architecture and build planning


---

## Pricing Impact Analysis

# Beamix — Pricing Impact Analysis

> **Author:** Axiom (CFO / Business Analyst)
> **Date:** 2026-03-08
> **Confidence:** High on cost data (sourced directly from Atlas engineering specs). Medium on revenue projections (estimated user distribution, not live subscriber data).
> **Status:** Decision-ready — for founder review

---

## Executive Summary

- **Current margins are healthy and will remain healthy after all recommended new features ship.** Total cost per business/month increases by only $6-9 (30-45%) for Build users and near-zero for Discover — well within acceptable gross margin ranges given current pricing.
- **The current pricing structure (Discover $79 / Build $189 / Scale $499) absorbs all new feature costs comfortably.** Build at $189 and Scale at $499 handle the full feature set; Discover at $79 is tight but defensible.
- **Pricing update (2026-04):** Tiers renamed and re-priced to Discover $79 / Build $189 / Scale $499 to better reflect value and positioning vs competitors.
- **Next action:** Monitor adoption and margin post-launch of new tier pricing. Browser Simulation and multi-region remain the dominant new costs to watch.

---

## Section 1: Feature Cost Impact Summary Table

All 11 features from Batches 1, 2, and 3. Costs sourced from Atlas engineering specs (2026-03-08).

| # | Feature | Marginal Cost / Business / Month | Zero-Cost / Algorithmic? | Tier Gate | Build Priority | Build? |
|---|---------|----------------------------------|--------------------------|-----------|----------------|--------|
| F1 | AI Crawler Feed | ~$0.02 (optional Haiku weekly summary) | Yes — core is zero; Haiku summary optional | Pro+ | Medium | Yes |
| F2 | Content Comparison Tool | ~$0 (diff is client-side; "Explain" button is on-demand only) | Yes — entirely algorithmic/UI | All paid | High | Yes |
| F3 | Topic/Query Clustering | ~$0.005/month (5 new queries × $0.001 Haiku classification) | No — Haiku per query insert | Pro+ | High | Yes |
| F4 | Conversation Explorer | ~$0.012-0.20 (4 sessions/month, Haiku or Perplexity) | No — LLM per session | Pro (LLM); Business (Live/Perplexity) | Medium | Yes |
| F5 | Auto-Suggest Competitors | ~$0 recurring (one-time $0.016 at signup) | No — Perplexity+Haiku at onboarding | All tiers (onboarding) | High | Yes |
| F6 | Browser Simulation (Copilot, AI Overviews, AI Mode) | ~$6.30/Pro user/month (Browserbase $6 + $0.30 Haiku parsing) | No — Browserbase infrastructure | Pro+ | High (Phase 3) | Yes |
| F7 | Web Mention Tracking | ~$0.03-0.25/month (Perplexity + Haiku; varies by tier cadence) | No — Perplexity per scan cycle | All paid (cadence varies) | High | Yes |
| F8 | Social Monitoring (YouTube/TikTok/Reddit) | Unpredictable; $50-200/month YouTube API at scale | No | N/A | N/A | **NO** |
| F9 | 30-Min Scan Refresh (Strategy D) | -$15.30/month vs. current (saves money via priority rotation) | No — Gemini Flash for priority cycles | Business only | High | Yes |
| F10 | Multi-Region / City-Level Scanning | ~$2.30/city/month per Pro user (mitigated cadence, 3 engines, 10 queries) | No — scan calls per city | Pro (5 cities), Business (unlimited/20) | Medium | Yes |
| F11 | Real Prompt Volume Data (GSC integration) | $0 for GSC primary path; $50-500/month if keyword API used | Yes — GSC is free user-connected | Pro+ (GSC); All tiers (internal panel) | Medium | Yes (GSC path only) |

**Key: Build all except F8. F11 should be scoped to the GSC integration path only — avoid the paid keyword API path.**

---

## Section 2: Total Cost Stack Analysis

### Baseline (Current, Pre-New Features)

| Metric | Value |
|--------|-------|
| LLM cost per business/month at 1K businesses | $15-25 (estimate) |
| Midpoint used for this analysis | $20/business/month |
| Source | Engineering baseline, Atlas spec |

### Incremental Cost by Tier After All Recommended Features

The incremental cost per user depends on which features each tier accesses. The table below shows the cumulative add on top of the $20/month baseline.

**Discover User ($79/mo)**

| Feature | Incremental Cost |
|---------|----------------|
| F2: Content Comparison | $0.00 |
| F5: Auto-Suggest Competitors (one-time at signup, amortized) | ~$0.00 recurring |
| F7: Web Mention Tracking (Discover cadence: 1 scan/month) | ~$0.03 |
| F11: Internal prompt volume panel | $0.00 |
| **Total new feature cost** | **~$0.03/month** |
| **New total cost per Discover user** | **~$20.03/month** |
| **Revenue: $79/month** | |
| **Gross margin** | **~75%** |

Discover is unaffected by new feature costs. At the new $79 price point, gross margin improves materially vs the prior $49 tier.

---

**Build User ($189/mo)**

| Feature | Incremental Cost |
|---------|----------------|
| F1: AI Crawler Feed (Haiku weekly summary) | ~$0.02 |
| F2: Content Comparison | $0.00 |
| F3: Topic/Query Clustering | ~$0.01 |
| F4: Conversation Explorer (LLM-generated, 4 sessions) | ~$0.05 |
| F5: Auto-Suggest Competitors | ~$0.00 recurring |
| F6: Browser Simulation (Browserbase + parsing) | ~$6.30 |
| F7: Web Mention Tracking (weekly, 2 query variants + sentiment) | ~$0.07 |
| F10: Multi-Region, 3 cities × $2.30 (assume avg 3 cities used) | ~$6.90 |
| F11: GSC integration | $0.00 |
| **Total new feature cost** | **~$13.35/month** |
| **New total cost per Build user** | **~$33.35/month** |
| **Revenue: $189/month** | |
| **Gross margin** | **~82%** |

Build margin stays strong at the $189 price point. The $6.30 Browser Simulation and $6.90 multi-region are the dominant new costs. Both are gated features that users must actively enable; actual average cost will be lower than the max-usage scenario above.

**Conservative Build estimate (not all Build users adopt F6+F10 at maximum):** Assume 40% adopt browser simulation and average 1.5 cities tracked: incremental cost ~$6.00/Build user/month, for a total cost of ~$26/month and margin of ~86%.

---

**Scale User ($499/mo)**

| Feature | Incremental Cost |
|---------|----------------|
| F1: AI Crawler Feed | ~$0.02 |
| F2: Content Comparison | $0.00 |
| F3: Topic/Query Clustering | ~$0.01 |
| F4: Conversation Explorer (Live/Perplexity, 4 sessions) | ~$0.30 |
| F5: Auto-Suggest Competitors | ~$0.00 |
| F6: Browser Simulation | ~$6.30 |
| F7: Web Mention Tracking (daily, 4 query variants, all mentions) | ~$0.25 |
| F9: 30-Min Refresh (Strategy D) | **-$15.30 SAVINGS** |
| F10: Multi-Region, 10 cities × $2.30 | ~$23.00 |
| F11: GSC integration | $0.00 |
| **Net new feature cost** | **~$14.58/month** |
| **Baseline scan cost pre-F9** | $229.50 (Scale 4h cadence) |
| **New scan cost post-F9** | $214.20 (F9 saves $15.30) |
| **Total cost adjustment** | +$14.58 features - $15.30 scan savings = **-$0.72 net** |
| **New total cost per Scale user** | **~$19.28 + $214.20 = ~$233/month** |
| **Revenue: $499/month** | |
| **Gross margin** | **~53%** |

**Important context on Scale-tier scan cost:** The $214/month scan cost per Scale user reflects the cost of daily scans across 7 engines for 75 tracked queries. At early scale (50 Scale users), this is the cost structure. As user count grows, economies of scale appear through query caching and prompt reuse — the Atlas spec estimates 40-60% cache hit rate at 1K businesses in the same industry, cutting scan costs nearly in half.

**At 50% cache hit rate on Scale scan costs:** $214 → ~$107/month. Total Scale cost drops to ~$126/month. Gross margin improves to ~75%.

---

### Gross Margin Summary Table

| Tier | Price | Current Cost | Current Margin | Post-Feature Cost | Post-Feature Margin |
|------|-------|-------------|----------------|-------------------|---------------------|
| Discover | $79 | ~$20 | ~75% | ~$20 | ~75% |
| Build | $189 | ~$20 | ~89% | ~$26-33 | ~82-86% |
| Scale | $499 | ~$229 | ~54% | ~$233 (pre-cache) / ~$126 (50% cache) | ~53% / ~75% |

**Takeaway:** Discover and Build sit well above the 70% gross margin SaaS benchmark at the new price points. Scale is helped both by the price increase to $499 and by scan caching at scale. The new features themselves do not materially worsen Scale margins.

---

## Section 3: Pricing Options Analysis

> **2026-04 update:** The pricing decision was made. Current canonical pricing is Discover $79 / Build $189 / Scale $499. The Options A-D below are preserved as historical decision record — the option effectively chosen was a repricing beyond any of these scenarios (closer to Option D with all tiers adjusted). Do not use the specific dollar values in Section 3 for forward-looking planning; use the canonical pricing above and the updated margin table in Section 2.

**Assumptions for revenue modeling (historical, Feb 2026):**
- Current user base (estimated): 200 Starter, 150 Pro, 50 Business = 400 total paying users
- These are estimates — confidence level: Low (no live subscriber data available)
- Annual vs monthly split: assume 30% annual, 70% monthly (industry average for early-stage SaaS)
- Blended price used: 70% × monthly + 30% × annual monthly-equivalent

**Current blended monthly revenue:**
- Starter: 200 × (0.70 × $49 + 0.30 × $39) = 200 × $45.80 = $9,160/month
- Pro: 150 × (0.70 × $149 + 0.30 × $119) = 150 × $140.00 = $21,000/month
- Business: 50 × (0.70 × $349 + 0.30 × $279) = 50 × $327.50 = $16,375/month
- **Total MRR: ~$46,535/month**

---

### Option A: Keep Current Pricing

**Analysis:** After all recommended features, Starter and Pro margins remain strong. Business margins are tight pre-cache but recover at scale.

| Metric | Value |
|--------|-------|
| MRR | $46,535 (no change) |
| Pro gross margin | 78-83% |
| Business gross margin | 33% (pre-cache) → 64% (at scale) |
| Churn risk | None from pricing |
| Conversion impact | None |

**Competitive positioning:**
- Starter $49 vs. SE Visible $50-299: competitive at entry
- Pro $149 vs. Peec AI $79-299: mid-range, justified by more engines + browser sim
- Business $349 vs. Profound $399: underpriced relative to feature set

**Verdict:** Acceptable. No immediate financial pressure to change pricing. Recommended if the priority is growth velocity (lower barrier to upgrade) over margin optimization.

**Risk:** Business tier margin at 33% is below the 70% SaaS benchmark until caching kicks in. Acceptable short-term if Business user count is low (as assumed), but should be monitored.

---

### Option B: $10-20 Price Bump Across All Tiers

**Scenario: +$10 on Starter, +$20 on Pro, +$20 on Business**

New prices: Starter $59, Pro $169, Business $369. Annual: ~$47, $135, $295.

| Tier | New Price | New MRR | Old MRR | MRR Increase |
|------|-----------|---------|---------|-------------|
| Starter | $59 | $11,060 | $9,160 | +$1,900 |
| Pro | $169 | $23,800 | $21,000 | +$2,800 |
| Business | $369 | $17,300 | $16,375 | +$925 |
| **Total** | | **$52,160** | **$46,535** | **+$5,625/month** |

**Annual revenue increase:** +$67,500/year (estimate)

**Competitive positioning:**
- Starter $59: still below the $50-299 SE Visible range; acceptable
- Pro $169: still below Profound ($399), above Peec AI entry ($79) — fine
- Business $369: matches Profound pricing — raises the question "why not just go to Profound?"

**Verdict:** The $10-20 bump is justifiable by feature additions but carries moderate churn risk for price-sensitive SMBs on Starter. The $20 bump on Business ($369 vs Profound $399) is the weakest argument — you are now in the same price bracket as a more established competitor. Better to stay below Profound (at $349) or clear it significantly (at $449). This "split the difference" option is the least strategically clean.

**Churn risk:** Medium on Starter (price-sensitive segment). Low on Pro (value clearly justifies). Low on Business if explained via new features.

---

### Option C: New "Growth" Tier Between Pro and Business

**Proposed:** Growth tier at $229/month (annual: $179/month), positioned between Pro and Business.

**What goes in Growth:**
- Everything in Pro
- Browser Simulation (F6) — the clearest Pro-to-Growth differentiator
- Multi-Region scanning (F10) — up to 3 cities
- Daily scanning (same as Pro)
- 30 agent uses/month (vs Pro 15, Business 50)
- 5 competitors tracked (same as Pro)
- 25 tracked queries (same as Pro)

**What stays Business-only:**
- 30-min refresh (F9)
- Unlimited cities (F10)
- 75 tracked queries
- 50 agent uses
- 10 competitors tracked
- Daily digest + full export

**Revenue impact (estimate — assumes 30% of Pro converts to Growth, 10% of Starter converts):**

| Tier | Users (est.) | MRR |
|------|-------------|-----|
| Starter | 200 → 180 (-10% converts up) | $8,244 |
| Pro | 150 → 125 (-30% converts up to Growth) | $17,500 |
| Growth (new) | 0 → 45 (20 from Pro + 20 from Starter converts + 5 net new) | $10,305 |
| Business | 50 → 50 (unchanged) | $16,375 |
| **Total** | | **$52,424** |

**MRR increase vs. current:** +$5,889/month = +$70,668/year (estimate)

**Cost of Growth tier user:** ~$26-33/month (same as Pro since features overlap heavily). Margin: ($229 - $30) / $229 = ~87%. Excellent.

**Verdict:** Structurally attractive because it captures users who want Browser Simulation but find $349 too steep. The $229 price creates a natural progression: $49 → $149 → $229 → $349. However, it adds sales complexity and makes the pricing page harder to read. Browser Simulation at $149 (Pro) is probably a better competitive move than creating a new tier for it — it makes Pro obviously superior to every competitor at the same price point.

**Recommendation:** Conditionally attractive. Build it only if conversion data after 3 months shows a large drop-off between Pro and Business. Do not add a tier preemptively.

---

### Option D: Raise Business to $449

**Analysis:** The Business tier after F9 + F10 + F6 ships is materially stronger than at launch:
- 30-minute refresh (no competitor at SMB pricing matches this)
- Unlimited cities (Peec AI's regional tracking is a premium feature)
- Browser simulation covering Copilot, AI Overviews, Google AI Mode (3 engines no competitor offers at sub-$400)
- 75 tracked queries (vs Profound's enterprise-only high query counts)

**Competitive landscape at $449:**
- Profound: $399/month (enterprise-focus, proprietary 130M conversation dataset)
- SE Visible: $299/month (top tier, fewer engines)
- Peec AI: $299/month (top tier)
- Beamix Business at $449: priced above all SMB-tier competitors but below enterprise ($2K-5K)

**Revenue impact (assuming 10% churn on existing Business users from $349 → $449):**

| Metric | Value |
|--------|-------|
| Business users before | 50 |
| Churn at 10% | -5 users |
| Remaining | 45 users |
| New MRR from Business | 45 × (0.70 × $449 + 0.30 × $359) = 45 × $422.50 = $19,013 |
| Old Business MRR | $16,375 |
| Net MRR change from Business tier | +$2,638/month |
| Net new annual revenue | +$31,656/year |

**Gross margin at $449:** ($449 - $233) / $449 = 48% pre-cache. At 50% cache hit rate: ($449 - $126) / $449 = 72% — crosses the 70% SaaS benchmark.

**When does this make sense?** Only after F6 + F9 + F10 are all shipped and live. Raising prices on a promise is churn bait. Raise prices when the product demonstrably delivers 30-min refresh + multi-region + browser-verified results. Users who see real daily value will not churn over a $100 increase.

**Verdict:** Recommended for Phase 3, contingent on F6 + F9 + F10 shipping. The feature set is defensible at $449. Do not raise before those features are live and tested.

---

### Options Comparison Summary

| Option | MRR Impact | Complexity | Margin Impact | Timing | Verdict |
|--------|-----------|-----------|---------------|--------|---------|
| A: Hold pricing | $0 | None | Stable | Now | Acceptable |
| B: +$10-20 all tiers | +$5,625/mo | Low | Minor improvement | Now | Weakest |
| C: New Growth tier | +$5,889/mo | High | Pro/Growth excellent | After F6 ships | Conditional |
| D: Business → $449 | +$2,638/mo net of churn | Low | Business approaches 70%+ | After F6+F9+F10 ship | **Recommended for Phase 3** |

---

## Section 4: Recommended Tier Structure

### Recommendation (superseded — see 2026-04 update above): canonical pricing is now Discover $79 / Build $189 / Scale $499.

The feature-to-tier allocation below maps to the new tier names (Starter → Discover, Pro → Build, Business → Scale). Dollar figures below reflect earlier pricing and should be read against the canonical table above.

**Discover ($79/mo | $63/mo annual) — "See where you stand"**
- All existing Starter features
- F2: Content Comparison Tool (all paid tiers — zero cost, high retention value)
- F5: Auto-Suggest Competitors (all tiers — onboarding improvement)
- F7: Web Mention Tracking — 1 scan/month, 1 query variant, no sentiment, no alerts
- F11: Internal prompt volume panel (all tiers, no GSC required)
- Rationale: These additions cost near-zero and improve Starter retention without cannibalizing Pro.

**Build ($189/mo | $151/mo annual) — "Monitor and fix"**
- All existing Pro features
- F1: AI Crawler Feed (Cloudflare integration, weekly Haiku summary)
- F2: Content Comparison Tool
- F3: Topic/Query Clustering (Haiku classification, UI grouping on rankings page)
- F4: Conversation Explorer (LLM-generated queries via Haiku, 4 sessions/month)
- F5: Auto-Suggest Competitors
- F6: Browser Simulation (Copilot, AI Overviews, Google AI Mode — 3 additional engines)
- F7: Web Mention Tracking — weekly, 2 query variants, sentiment, alerts on negative
- F10: Multi-Region Scanning — up to 5 cities, reduced cadence (every 3 days)
- F11: GSC integration for real prompt volume data
- Rationale: F6 is the clearest Pro differentiator — it unlocks 3 engines no competitor offers at this price. F10 at 5 cities adds genuine Israeli-market value without exploding cost.

**Scale ($499/mo | $399/mo annual)**
- All Pro features plus:
- F4: Conversation Explorer with Perplexity Live Exploration (real-time query discovery)
- F7: Web Mention Tracking — daily, 4 query variants, all alerts
- F9: 30-Minute Scan Refresh (Strategy D: priority query rotation, saves $15/month vs current)
- F10: Multi-Region Scanning — up to 20 cities, full cadence on first 3 cities
- Rationale: F9 is a pure Business exclusive — no SMB competitor offers 30-minute API-based refresh. F10 at 20 cities serves Israeli businesses competing across multiple markets. These features collectively make Business worth the $449 price when all three are live.

**No new tier recommended at this time.** Add a Growth tier ($229) only if conversion data after 6 months shows a persistent 20%+ drop-off between Pro trial and Business upgrade.

---

## Section 5: Price Increase Trigger Points

These are the specific conditions under which pricing should be revisited, defined in advance to avoid reactive decisions.

### Trigger 1: Cost Floor Breach (Operational — monitor monthly)
**Condition:** If LLM/infrastructure cost per Business user exceeds 50% of revenue ($175/month at $349 pricing, or $225/month at $449 pricing) for 2 consecutive months.
**Action:** Immediately evaluate either (a) accelerating scan caching (Strategy C from F9 spec) or (b) reducing Business scan cadence for users with zero engagement in prior 14 days.
**Do NOT:** Raise prices as the primary response to a cost spike. Fix the cost first.

### Trigger 2: Browser Simulation Ships (Feature milestone — Phase 3)
**Condition:** F6 (Browser Simulation) is live, tested, and delivering results for Copilot + AI Overviews.
**Action:** Raise Business from $349 to $449. This is the right moment because:
- The $100 increase is justified by 3 new engines no SMB competitor offers at this price
- Existing Business users have seen tangible value and are at lowest churn risk
- New users see the $449 price as "less than Profound" without knowing the old price
**Announcement framing:** "Beamix Business now covers 10 AI engines including Bing Copilot and Google AI Overviews. Pricing updated to $449/month."
**Grandfather existing Business users** at $349 for 90 days to reward loyalty.

### Trigger 3: 500 Paying Users (Scale milestone)
**Condition:** Total paying users reach 500.
**Action:** Re-run this full cost analysis with real data. At 500 users, the scan caching hit rate becomes meaningful (40-60% per Atlas estimates), materially improving Business-tier margins. This is the point at which Option C (Growth tier) should be seriously re-evaluated — at scale, a $229 tier may capture a distinct middle segment that is not well-served by the current $149/$349 gap.

### Trigger 4: NRR Falls Below 105% (Retention signal)
**Condition:** Net Revenue Retention drops below 105% for 2 consecutive months. This signals that churn is outpacing expansion revenue.
**Action:** Do NOT raise prices. Fix retention first. Investigate whether the cause is product (feature gaps), UX (users not activating key features), or market (wrong ICP).
**Pricing change is the wrong response to an NRR problem.** Address this with product and onboarding, not price.

### Trigger 5: Competitor Repricing (Market signal)
**Condition:** Profound drops below $349, or Peec AI raises above $199.
**Action:** Profound dropping below Beamix Business pricing would pressure conversion. Response: accelerate Pro feature differentiation (F6 in particular) to justify the gap. Peec AI raising prices signals market acceptance of higher pricing — monitor for 60 days, then evaluate Pro increase to $179.

---

## Appendix: Competitive Pricing Comparison

Data sourced from Rex competitive synthesis (March 2026). Treat as potentially stale — re-verify before major pricing decisions.

| Competitor | Entry Tier | Mid Tier | Top Tier | Notes |
|------------|-----------|---------|---------|-------|
| **Beamix (current)** | $49 | $149 | $349 | Israeli-first, dual-language |
| **Beamix (post-Phase 3)** | $49 | $149 | **$449** | Recommended |
| Profound | Enterprise only | ~$399 | Custom | 130M proprietary conversations |
| SE Visible | $50 | $149 | $299 | SEO-first framing |
| Peec AI | $79 | $149 | $299 | UI-focused, no agents |
| RankPrompt | $49 | $99 | $199 | Budget, browser-only (less reliable) |
| Otterly.ai | $49 | $99 | $199 | Basic monitoring, limited engines |
| Writesonic GEO | ~$99 | ~$199 | Custom | Bundled with content tools |
| Ahrefs (Brand Radar) | $328 | $449 | $1,499 | Web index + brand monitoring |
| Brand24 | $99 | $179 | $299 | Social/web mentions only |

**Beamix's price-to-engine-coverage ratio is the clearest competitive advantage:**
- At $149/Pro: 7 engines + browser sim (10 total) — no competitor offers this at this price
- At $349/Business: 30-min refresh — only RankPrompt is comparable (browser-only, less reliable)
- At $449/Business (post-Phase 3): Copilot + AI Overviews — no SMB competitor covers these engines

**The key positioning principle:** Beamix should never compete on price alone against Otterly and RankPrompt in the $49-199 range. Competing on engine coverage and agent execution is the right axis. The pricing table above shows Beamix is currently priced to win on value, not on cost.

---

*Document prepared by Axiom (CFO). For strategic decisions, route to Iris (CEO). For feature build decisions, route to Atlas (CTO) with reference to batch spec documents. Next review: when F6 (Browser Simulation) ships.*
