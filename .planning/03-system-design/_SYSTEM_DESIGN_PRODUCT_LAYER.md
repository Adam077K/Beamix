# Beamix -- Product Layer System Design

> **Author:** Morgan (CPO)
> **Date:** March 2026
> **Scope:** Everything the user sees and experiences. No code. No pricing. No timelines. Pure product architecture.
> **Sources:** Engineering Plan, CTO Gap Analysis, Competitive Features Blueprint (15 competitors), Product System Overview

---

## 1. Platform Overview

### What Beamix Is

Beamix is a Generative Engine Optimization (GEO) platform for SMBs. It scans businesses across AI search engines (ChatGPT, Gemini, Perplexity, Claude, and others), diagnoses why they rank or don't, and deploys AI agents to fix it. Competitors show dashboards. Beamix does the work.

### Who It Serves

**Primary user:** Israeli SMB owner or marketing lead (5-200 employees) who knows AI search matters but has no idea how to optimize for it. Secondary: global English-speaking SMBs in the same position. Future: agencies managing multiple SMB clients.

### Core Value Proposition as a System

The platform operates as a closed-loop optimization system:

```
Scan (find problems) --> Diagnose (prioritize what matters) --> Fix (agents do the work) --> Measure (track impact) --> Repeat
```

Every other GEO tool breaks this loop somewhere. Monitoring-only tools (Otterly, SE Visible, Peec) stop at "find problems." Dashboard-heavy tools (AthenaHQ, Gauge) stop at "prioritize." Only Profound and Bear AI attempt autonomous fixes, but at $200-400/month. Beamix completes the loop at $49-149/month.

### Seven Structural Advantages

1. **Hebrew/RTL first** -- Zero competitors serve Hebrew. Monopoly on Israeli market.
2. **Agent-first architecture** -- Only autonomous agents under $100/month in the market.
3. **SMB pricing** -- 2-10x cheaper than any content-generating competitor.
4. **Free scan viral hook** -- Instant visibility score creates word-of-mouth.
5. **Scan-to-fix pipeline** -- End-to-end: find problems, fix problems, track improvements.
6. **Interactive agent chat UX** -- Real-time streaming conversation, not batch/async.
7. **Cross-agent intelligence** -- Agents share context. Competitors are siloed.

---

## 2. Complete Page Map

### 2.1 Landing Page

**URL:** `/`
**Purpose:** Convert visitors into free scan users. Primary CTA: enter your business URL.

**What the user sees:**
- Navigation bar with logo, product links, login/signup, language toggle (HE/EN)
- Hero section with headline, subheadline, and free scan input field (URL + business name + industry)
- Trust bar: engine logos (ChatGPT, Gemini, Perplexity, Claude)
- "How It Works" section: 3 steps (Scan, Diagnose, Fix)
- Product preview: dashboard screenshot or interactive demo
- Agent showcase: what the AI agents actually do
- Testimonials/social proof
- Pricing preview (links to full pricing page)
- "Wake-up call" section: statistics about AI search replacing Google
- Final CTA: repeat free scan input
- Footer with legal links, company info, social

**User actions:** Enter business details for free scan, navigate to pricing, login/signup, switch language.

**Data in:** None (static + CMS-driven).
**Data out:** Form submission triggers scan start, redirects to `/scan/[scan_id]`.
**Connects to:** Free Scan page, Pricing, Auth pages, Blog, About.

---

### 2.2 Free Scan Page

**URL:** `/scan`
**Purpose:** Collect business details to initiate a free visibility scan.

**What the user sees:**
- Clean form: business URL, business name, industry dropdown, location, language
- "Scan My Business" CTA button
- Social proof: "12,000+ businesses scanned"
- Brief explanation of what the scan checks

**User actions:** Fill form, submit scan.
**Data in:** None.
**Data out:** POST `/api/scan/start` --> redirects to scan results page with `scan_id`.
**Connects to:** Scan Results page.

---

### 2.3 Scan Results (Public)

**URL:** `/scan/[scan_id]`
**Purpose:** Show free scan results. Convert to signup.

**What the user sees:**
- Loading state: animated progress showing engines being queried in real-time
- Results view (when complete):
  - **Visibility Score** -- 0-100 gauge, color-coded (red/yellow/green)
  - **Per-Engine Breakdown** -- 4 cards (ChatGPT, Gemini, Perplexity, Bing Copilot) showing mentioned/not mentioned, position, sentiment
  - **AI Readiness Score** -- 0-100% with 5-category breakdown (Content Quality, Technical Structure, Authority Signals, Semantic Alignment, AI Accessibility)
  - **Top Competitor** -- who AI recommends instead of you
  - **Leaderboard** -- your position among detected competitors
  - **Quick Wins** -- 3-5 actionable recommendations (blurred for free users past the first 2)
- Conversion CTAs:
  - "Get the full picture -- sign up free" (unlocks all recommendations)
  - "See how to fix this" (links to agent descriptions)
  - Share button: "My AI visibility score is 34/100. Check yours at beamix.io"

**User actions:** View results, share results URL, click signup CTA, start another scan.
**Data in:** GET `/api/scan/[scan_id]/results` (polls until complete).
**Data out:** Signup click carries `scan_id` as query param.
**Connects to:** Signup (with scan_id), Landing page (new scan).

---

### 2.4 Auth: Login

**URL:** `/login`
**Purpose:** Authenticate existing users.

**What the user sees:**
- Email + password form
- "Log in" button
- Magic link option
- "Forgot password?" link
- "Don't have an account? Sign up" link
- Social login options (Google)

**User actions:** Enter credentials, submit, request magic link, navigate to signup/forgot password.
**Data in:** None.
**Data out:** Supabase Auth session. Redirect to `/dashboard` (or `/onboarding` if not completed).
**Connects to:** Dashboard, Onboarding, Signup, Forgot Password.

---

### 2.5 Auth: Signup

**URL:** `/signup`
**Purpose:** Create new account. If `?scan_id=` present, link free scan to new user.

**What the user sees:**
- Email + password form (or Google OAuth)
- "Create account" button
- Terms/privacy checkboxes
- If arriving from scan: "Your scan results will be waiting in your dashboard"

**User actions:** Fill form, submit, accept terms.
**Data in:** Optional `scan_id` query param from free scan.
**Data out:** Supabase Auth user created. `handle_new_user` trigger creates user_profiles, subscriptions, notification_preferences. Redirect to Onboarding.
**Connects to:** Onboarding.

---

### 2.6 Auth: Forgot Password

**URL:** `/forgot-password`
**Purpose:** Password recovery flow.

**What the user sees:**
- Email input field
- "Send reset link" button
- Confirmation message after submission

**User actions:** Enter email, submit.
**Data in:** None.
**Data out:** Supabase password reset email sent.
**Connects to:** Login.

---

### 2.7 Onboarding (4 Steps)

**URL:** `/onboarding`
**Purpose:** Collect business information, set up the user's workspace, and import free scan if applicable.

**What the user sees:**
- Progress indicator: 3 dots (step 0 is hidden from count)
- Step 0 (if `scan_id` present): "We found your scan results!" -- auto-import confirmation
- Step 1: Business details -- name, website URL, industry (dropdown), location, description
- Step 2: Services -- multi-select or freeform tags for services offered
- Step 3: Competitors -- add 1-3 competitor names or URLs (optional, can skip)
- Step 4: Preferences -- language (HE/EN), notification preferences
- Animated transitions between steps

**User actions:** Fill each step, navigate back/forward, skip optional steps, complete onboarding.
**Data in:** If `scan_id` present, fetch free scan data to pre-populate business fields.
**Data out:** POST `/api/onboarding/complete` -- creates `businesses` record, links free scan data via UPSERT to `user_profiles`, starts 14-day trial clock on first dashboard visit.
**Connects to:** Dashboard.

---

### 2.8 Dashboard: Overview

**URL:** `/dashboard`
**Purpose:** Single-screen command center. Answer: "How visible am I in AI search, and what should I do about it?"

**What the user sees:**
- **Sidebar** (Linear/Notion style, persistent across all dashboard pages):
  - Logo
  - Navigation: Overview, Rankings, Recommendations, Content Library, Agent Hub, Competitors, AI Readiness, Settings
  - Quick actions: [Run Scan] [New Agent]
  - Agent usage meter: progress bar (e.g., "8/15 uses this month")
  - Notification bell with unread count
  - User avatar + dropdown (settings, billing, logout)

- **Main content area:**
  - **Visibility Score Card** -- large 0-100 gauge with trend arrow (+12 from last scan), color-coded
  - **Score Trend Chart** -- line chart (7d/30d/90d toggle), per-engine filter
  - **Per-Engine Grid** -- 4-10 cards (by tier) showing engine logo, score, mentioned/not, position, sentiment indicator
  - **Top 3 Recommendations** -- prioritized action items with "Run Agent" buttons
  - **Recent Agent Activity** -- last 5 agent runs with status, type, output preview
  - **Competitor Snapshot** -- mini comparison bar chart (your brand vs top 3 competitors)
  - **Content Performance Summary** -- published content count + visibility impact delta (NEW -- gap closure)
  - **Prompt Volume Trends** -- top 3 trending queries in your industry (NEW -- gap closure)

**User actions:** Click any widget to drill down, run a scan, trigger an agent from recommendations, toggle time ranges on trend chart, click notification bell.
**Data in:** `scan_results`, `scan_engine_results`, `recommendations`, `agent_jobs`, `competitors`, `content_items`, `credit_pools`.
**Data out:** Agent trigger events, scan trigger events.
**Connects to:** Rankings, Recommendations, Content Library, Agent Hub, Competitors, AI Readiness, Settings.

---

### 2.9 Dashboard: Rankings

**URL:** `/dashboard/rankings`
**Purpose:** Detailed query-by-query visibility breakdown.

**What the user sees:**
- **Rankings Table** -- sortable columns: Query, Overall Position, Per-Engine Positions (with engine logos), Sentiment (0-100 color bar), Change (delta arrow), Last Scanned
- **Filters:** Engine, sentiment range, position range, date range
- **Source Citations Panel** (NEW -- gap closure) -- expandable row shows exact URLs AI cites when discussing this query. Grouped by engine. Each URL is clickable.
- **Prompt-Level Insights** -- click any query row to expand: full AI response context, competitor mentions, citation sources, sentiment explanation
- **Brand Narrative Summary** (NEW -- gap closure) -- at the top: AI-generated summary of HOW AI describes your brand across all queries. "AI perceives you as [reliable/affordable/local expert] but rarely mentions your [unique value prop]."
- **Persona Filter** (NEW -- gap closure) -- dropdown to filter rankings by buyer persona (e.g., "Budget-conscious buyer," "Enterprise decision-maker"). Shows how different personas experience your brand in AI.

**User actions:** Sort table, filter, expand rows, click citation URLs, switch persona view, export CSV (Business tier).
**Data in:** `scan_results`, `scan_engine_results`, `tracked_queries`, citation data.
**Data out:** Export triggers.
**Connects to:** Agent Hub (from recommendation in expanded row), Content Library (content linked to specific queries).

---

### 2.10 Dashboard: Recommendations

**URL:** `/dashboard/recommendations`
**Purpose:** Prioritized action feed. "What should I fix next?"

**What the user sees:**
- **View toggle:** List view or Kanban (New / In Progress / Completed / Dismissed)
- Each recommendation card:
  - Title (e.g., "Add FAQ content for 'best plumber in Tel Aviv'")
  - Impact level: High / Medium / Low (color-coded)
  - Evidence: "You're not mentioned in ChatGPT or Gemini for this query"
  - Suggested agent: button to trigger relevant agent
  - Estimated effort: Quick Fix / Medium / Significant
  - Customer journey stage tag (NEW -- gap closure): Awareness / Consideration / Decision
- **Opportunity Pipeline** (NEW) -- visual funnel showing content gaps ranked by potential impact with effort estimates

**User actions:** Dismiss, mark in progress, trigger agent, change view, filter by impact/stage/status.
**Data in:** `recommendations` table (auto-populated after each scan).
**Data out:** Agent trigger events, status updates to recommendations.
**Connects to:** Agent Hub (trigger), Rankings (evidence links).

---

### 2.11 Dashboard: Content Library

**URL:** `/dashboard/content`
**Purpose:** All agent-generated content in one place. Browse, edit, publish, track performance.

**What the user sees:**
- **Content grid/list** with filters:
  - Filter by: agent type, content type, status (Draft / Ready for Review / Published / Archived), date range, favorite
  - Each card: title, agent that created it, date, status badge, favorite star, content type tag
- **Content type tags** (NEW -- gap closure): Article, Blog Post, Comparison Article, Ranked List, Location Page, Case Study, Product Deep-Dive, FAQ, Schema Markup, LLMS.txt, Social Calendar, Outreach Templates
- **Content Performance Tracking** (NEW -- gap closure):
  - For published items: shows visibility impact -- "After publishing, your ChatGPT position for 'best X in Y' went from not mentioned to position 2"
  - Timeline: publication date marker on the visibility trend chart
  - Aggregate stats: "Your published content has improved visibility by +18 points across 7 queries"
- **Editorial Queue** (NEW -- gap closure):
  - Items in "Ready for Review" status appear in a review queue
  - Review actions: Approve (move to Published), Request Changes (add comment, move back to Draft), Reject
  - Review history: who reviewed, when, notes

**User actions:** Filter, favorite, open content editor, change status, export/download, publish to WordPress, view performance metrics, review items in queue.
**Data in:** `content_items`, `agent_jobs`, scan correlation data.
**Data out:** Status updates, WordPress publish events, export downloads.
**Connects to:** Content Editor (click to edit), Agent Hub (regenerate), Rankings (performance correlation).

---

### 2.12 Dashboard: Content Editor

**URL:** `/dashboard/content/[content_id]` (or modal/drawer from Content Library)
**Purpose:** View and edit agent-generated content before publishing.

**What the user sees:**
- **Preview pane:** rendered content (title, meta description, body, FAQ, schema if applicable). Desktop/mobile toggle.
- **Editor pane:** Markdown textarea for modifying content. Preserves formatting. Syntax highlighting.
- **Metadata panel:** Title, meta description, content type, target queries, language
- **Schema preview:** if content includes JSON-LD, show rendered preview
- **Voice Match Indicator** (NEW -- gap closure): if Content Voice Training is active, shows how closely the content matches the business's trained voice (percentage match)
- **Action bar:** Save Draft, Mark Ready for Review, Copy to Clipboard, Download (HTML/Markdown/PDF), Publish to WordPress (if integrated)
- **Performance panel** (for published content): visibility impact chart

**User actions:** Edit content, toggle preview, save, change status, copy, download, publish.
**Data in:** `content_items` record.
**Data out:** Content updates, publish events.
**Connects to:** Content Library, WordPress (publish), Rankings (performance view).

---

### 2.13 Dashboard: Agent Hub

**URL:** `/dashboard/agents`
**Purpose:** Central agent management. See all agents, their status, and launch new runs.

**What the user sees:**
- **Agent grid** -- each agent is a card:
  - Icon + name
  - One-line description
  - Status: Available / Running / Last run date
  - Tier badge: which plan includes this agent
  - Lock icon for agents outside user's tier (with upgrade CTA)
  - "Run" button (or "Running..." with progress)
- **Agent categories:**
  - Content Creation: Content Writer, Blog Writer, FAQ Agent, Social Strategy
  - Technical: Schema Optimizer, LLMS.txt Generator, AI Readiness Auditor
  - Intelligence: Competitor Intelligence, Review Analyzer, Citation Builder, Recommendations (system)
  - Conversational: Ask Beamix
  - NEW agents (gap closure):
    - **Content Voice Trainer** -- trains on business's existing website content to match their writing style
    - **Content Pattern Analyzer** -- analyzes top-cited content in your niche, extracts winning patterns
    - **Content Refresh Agent** -- audits published content for staleness, suggests or auto-applies updates
- **Usage meter:** "8/15 agent uses this month" with bar + top-up CTA
- **Recurring Executions Panel** (NEW -- gap closure): shows scheduled/recurring agent runs (e.g., "Content Refresh runs monthly on your published articles")
- **Agent Workflow Builder** (NEW -- gap closure): visual chain builder connecting events to agent actions (e.g., "Visibility drop > 15% --> Auto-run Recommendations --> Draft Content Fix --> Queue for Review")

**User actions:** Launch agent, view past runs, set up recurring schedules, create workflows, upgrade tier for locked agents, buy top-ups.
**Data in:** Agent configuration, `agent_jobs`, `credit_pools`, workflow definitions.
**Data out:** Agent trigger events, workflow creation.
**Connects to:** Agent Chat (individual agent run), Content Library (outputs), Billing (top-ups/upgrades).

---

### 2.14 Dashboard: Agent Chat

**URL:** `/dashboard/agents/[agent_id]`
**Purpose:** Interactive, real-time agent execution with streaming output.

**What the user sees:**
- **Chat interface** (full page):
  - Agent avatar + name at top
  - Input form: depends on agent type (topic, tone, target queries, word count, etc.)
  - "Run Agent" button
  - Real-time streaming output as the agent works:
    - Phase indicators: "Researching...", "Outlining...", "Writing...", "Quality checking..."
    - Content appears incrementally (SSE streaming)
  - User can respond mid-stream: guide tone, add details, request changes
  - Final output rendered as formatted content with action buttons
- **Action bar on completion:**
  - Save to Content Library
  - Copy to Clipboard
  - Download
  - Publish to WordPress
  - Run Again (with modifications)
  - Rate output (thumbs up/down -- feeds quality improvement)

**User actions:** Configure input, run agent, interact during execution, save/copy/publish output.
**Data in:** Agent configuration, business context (auto-assembled), user input.
**Data out:** `agent_jobs` record, `content_items` if content-producing agent.
**Connects to:** Content Library, Content Editor, Agent Hub.

---

### 2.15 Dashboard: Competitive Intelligence

**URL:** `/dashboard/competitors`
**Purpose:** Understand competitive positioning in AI search.

**What the user sees:**
- **Competitor list** -- managed competitors with add/remove (up to 3/5/10 by tier)
- **Auto-detected competitors** -- system suggests competitors found in AI responses
- **Share of Voice chart** -- pie or bar: your brand vs competitors across all AI mentions
- **Comparison table** -- side-by-side: your brand vs each competitor, per query, per engine
- **Gap Analysis view** -- topics where competitors appear but you don't, ranked by opportunity size
- **Source-Level Citation Comparison** (NEW -- gap closure) -- which URLs are cited for competitors vs your brand. "ChatGPT cites competitor's blog post X. You have no equivalent content."
- **Content Pattern Insights** (NEW -- gap closure) -- what structural/tonal patterns make competitor content get cited. "Competitor content that gets cited averages 2,000 words, includes FAQ sections, and uses first-person expert tone."

**User actions:** Add/remove competitors, drill into per-query comparison, trigger Competitor Intelligence agent for deep analysis, create content to close a gap (triggers Content Writer with gap context).
**Data in:** `competitors`, `scan_engine_results` (competitor data), citation data.
**Data out:** Agent trigger events (Competitor Intel, Content Writer for gap closure).
**Connects to:** Agent Hub, Content Library, Rankings.

---

### 2.16 Dashboard: AI Readiness

**URL:** `/dashboard/ai-readiness`
**Purpose:** Website technical audit for AI discoverability.

**What the user sees:**
- **Overall AI Readiness Score** -- 0-100% gauge
- **5-Category Breakdown:**
  - Content Quality (30%): clarity, structure, depth, FAQ presence
  - Technical Structure (25%): schema markup, meta tags, heading hierarchy, mobile
  - Authority Signals (20%): backlinks, citations, expertise markers
  - Semantic Alignment (15%): topic coverage, conversational format
  - AI Accessibility (10%): llms.txt, robots.txt, crawler-friendly architecture
- **Per-factor detail:** each factor scored, with specific recommendation
- **AI Crawler Activity** (if detection active): which bots visit, which pages, crawl trends
- **robots.txt status:** which AI bots are blocked, with fix guidance
- **Improvement roadmap:** ordered list of fixes by impact

**User actions:** Run full audit (triggers AI Readiness Auditor agent), view factor details, trigger specific fix agents (Schema Optimizer, LLMS.txt Generator).
**Data in:** Site crawl data, AI crawler detection data, `scan_results`.
**Data out:** Agent trigger events.
**Connects to:** Agent Hub, Settings (crawler detection setup).

---

### 2.17 Dashboard: Settings (4 Tabs)

**URL:** `/dashboard/settings`

#### Tab 1: Business Profile
**What the user sees:** Editable form: business name, website URL, industry, location, services (tags), description, logo upload.
**User actions:** Edit and save business details.
**Data:** `businesses` table.

#### Tab 2: Billing
**What the user sees:** Current plan name and tier, billing cycle (monthly/annual), next payment date, payment method, invoice history, usage stats (agent uses, scans, content items), upgrade/downgrade buttons, cancel subscription option.
**User actions:** Change plan, update payment method, download invoices, cancel subscription.
**Data:** Paddle subscription data, `subscriptions`, `credit_pools`.

#### Tab 3: Preferences
**What the user sees:** Language toggle (HE/EN), notification preferences (email on/off for each alert type, Slack webhook URL), weekly digest toggle, theme preference (future), timezone.
**User actions:** Toggle preferences, save.
**Data:** `user_profiles`, `notification_preferences`.

#### Tab 4: Integrations
**What the user sees:** Integration cards -- WordPress, GA4, Google Search Console, Slack, Cloudflare, Looker Studio, Public API. Each shows: connected/disconnected status, connect button, configuration options.
**User actions:** Connect/disconnect integrations, configure settings, generate API keys (Business tier).
**Data:** `integrations`, `api_keys`.

**Connects to:** Billing (Paddle portal), all dashboard pages (settings affect display).

---

### 2.18 Pricing Page

**URL:** `/pricing`
**Purpose:** Display plans, drive upgrades and new signups.

**What the user sees:**
- Annual/Monthly toggle (20% annual discount)
- 3-tier cards: Starter ($49), Pro ($149), Business ($349)
- Feature comparison matrix: engines tracked, scan frequency, agent uses, competitors, content library size, integrations, support level
- Per-agent availability by tier
- FAQ section addressing common questions
- CTA buttons: "Start Free Trial" (if not logged in) or "Upgrade" (if logged in)

**User actions:** Toggle billing cycle, compare plans, click CTA to start trial or upgrade.
**Data in:** Plan configuration from `plans` table.
**Data out:** Paddle checkout session.
**Connects to:** Signup (new users), Settings Billing (existing users), Dashboard.

---

### 2.19 Blog

**URL:** `/blog` and `/blog/[slug]`
**Purpose:** SEO + thought leadership + education about GEO.

**What the user sees:**
- Blog index: grid of posts with cover image, title, category, date, read time
- Blog post: full article with table of contents, author info, related posts, CTA to free scan
- Categories: GEO, AI Search, Case Studies, Product Updates, Guides

**User actions:** Browse, read, share, click CTA to scan.
**Data in:** `blog_posts` table.
**Data out:** Free scan CTA clicks.
**Connects to:** Free Scan, Landing page.

---

### 2.20 About Page

**URL:** `/about`
**Purpose:** Company story, team, mission.

**What the user sees:** Company narrative, team section (if applicable), mission statement, press mentions.
**User actions:** Navigate to other pages.
**Connects to:** Landing, Blog, Pricing.

---

### 2.21 Terms of Service

**URL:** `/terms`
**Purpose:** Legal terms. Static page.

---

### 2.22 Privacy Policy

**URL:** `/privacy`
**Purpose:** Privacy policy. Static page. GDPR compliance information.

---

### 2.23 API Documentation (Future)

**URL:** `/docs/api`
**Purpose:** Public API reference for Business tier users.

**What the user sees:** REST API endpoint documentation, authentication guide, code examples, rate limits, response schemas.
**User actions:** Read docs, copy code examples, navigate to API key generation in settings.
**Connects to:** Settings (API key management).

---

## 3. Feature Inventory (Complete)

### 3.1 Scan Engine Module (12 features)

| # | Feature | What It Does | Where It Lives | Data Needed | Connections |
|---|---------|-------------|---------------|-------------|-------------|
| S1 | Free Scan | URL + name + industry + location --> 4 LLMs x 3 prompts --> visibility score, per-engine ranking, AI readiness score, competitor callout. Shareable URL 14 days. | `/scan`, `/scan/[scan_id]` | Business input, LLM responses | Signup (conversion), Onboarding (import) |
| S2 | AI Readiness Score | 0-100% scoring across 5 categories. Computed as part of free scan. Shareable card. | Free scan results, AI Readiness dashboard | Website crawl data (cheerio) | Free Scan, AI Readiness page |
| S3 | Multi-Engine Scanning | Query 4/8/10+ AI engines by tier. ChatGPT, Gemini, Perplexity, Copilot, Claude, AI Overviews, Grok, AI Mode, Meta AI, DeepSeek. | Background (Inngest), Results in Rankings | Engine API responses | Rankings, Overview |
| S4 | Scheduled Scans | Automated: weekly (Starter), every 3 days (Pro), daily (Business). Inngest cron. | Background | `businesses`, `tracked_queries`, `subscriptions` | Rankings, Alerts, Recommendations |
| S5 | Manual Scan Trigger | On-demand re-scan. Rate-limited per tier (1/week, 1/day, 1/hour). | Dashboard Overview (button) | Current scan data | Rankings |
| S6 | Prompt Auto-Generation | Auto-generate 3-8 industry/location-specific prompts per business. | Scan pipeline (internal) | Business profile, industry, location | Scan execution |
| S7 | Sentiment Scoring (0-100) | Numeric sentiment per engine per scan. Replaces enum with 0-100 scale for trend granularity. | Rankings table, Per-engine grid | LLM-parsed sentiment | Rankings, Trend charts, Alerts |
| S8 | Source-Level Citation Tracking | Show exact URLs AI cites when discussing the business. Per-engine, per-query. | Rankings (expandable row), dedicated Citations panel | Citation URLs extracted from LLM responses | Rankings, Competitive Intel, Content Strategy |
| S9 | Historical Trend Storage | All scan results stored for trend analysis. 30d/60d/90d/all-time views. | Trend Chart widget | `scan_results` time series | Overview, Rankings |
| S10 | Scan Result Comparison | Compare current vs previous scan with visual diff. Delta indicators per query. | Rankings, Overview (delta arrows) | Current + previous `scan_results` | Rankings |
| S11 | Prompt Volume Estimation (NEW) | Aggregate anonymized scan data across all Beamix users to estimate query volume per topic. Show "Trending queries in your industry." | Overview (trending widget), Rankings (volume column) | Cross-user aggregated scan data | Rankings, Recommendations, Content planning |
| S12 | Brand Narrative Analysis (NEW) | LLM analysis of HOW AI describes your brand across all queries. Extracts positioning, gaps, misperceptions. | Rankings (summary panel) | All raw LLM responses for business | Rankings, Recommendations, Competitive Intel |

---

### 3.2 Dashboard & Analytics Module (14 features)

| # | Feature | What It Does | Where It Lives | Data Needed | Connections |
|---|---------|-------------|---------------|-------------|-------------|
| D1 | Visibility Score Card | Central 0-100 gauge with trend arrow and delta. Color-coded red/yellow/green. | Overview | Latest `scan_results.overall_score` | Rankings (drill-down) |
| D2 | Per-Engine Breakdown | Grid/cards showing score per AI engine with logos. | Overview | `scan_engine_results` | Rankings (per-engine detail) |
| D3 | Rankings Table | Sortable table: query, position, engine, sentiment (0-100), change, last scanned. | Rankings page | `scan_results`, `scan_engine_results`, `tracked_queries` | Agent Hub, Content Library |
| D4 | Trend Chart | Line chart: visibility over time. Per-engine toggle. 7d/30d/90d. | Overview | `scan_results` time series | Rankings |
| D5 | Competitor Comparison | Side-by-side visibility: brand vs competitors. Bar chart + table. | Competitors page, Overview snapshot | Competitor scan data | Competitive Intel agent |
| D6 | Recommendations Feed | Prioritized action items: what to fix, in what order, with agent trigger buttons. | Recommendations page, Overview (top 3) | `recommendations` | Agent Hub |
| D7 | Content Library | All agent-generated content: browse, filter, export, favorite, edit. | Content Library page | `content_items`, `agent_jobs` | Content Editor, Agent Hub |
| D8 | Agent Hub | All agents with status, last run, quick-launch, usage meter. | Agent Hub page | Agent config, `agent_jobs`, `credit_pools` | Agent Chat, Content Library |
| D9 | Share of Voice | Pie/bar chart: brand vs competitors in AI mentions. | Competitors page | Competitor comparison data | Competitive Intel |
| D10 | Gap Analysis View | Topics where brand is missing vs competitors. Ranked by opportunity. | Competitors page, Recommendations | `scan_engine_results` comparison | Content Writer (trigger), Recommendations |
| D11 | AI Readiness Dashboard | 5-category breakdown with per-factor scores and improvement tips. | AI Readiness page | Site crawl data | AI Readiness Auditor agent |
| D12 | Activity Feed | Timeline of all scans, agent runs, score changes, alerts. | Overview (recent), dedicated feed | `agent_jobs`, `scan_results`, `notifications` | Agent Hub, Rankings |
| D13 | Content Performance Tracking (NEW) | Shows visibility impact of published content. "After publishing article X, position went from 0 to 2." Publication date markers on trend charts. | Content Library, Overview | `content_items` publication dates correlated with `scan_results` changes | Content Library, Rankings |
| D14 | Prompt Volume Trends (NEW) | Top trending queries in user's industry. Volume estimates from aggregated platform data. | Overview widget, Rankings (volume column) | Cross-user aggregated data | Recommendations, Content planning |

---

### 3.3 Agent System Module (15 agents)

#### Existing Agents (12)

| # | Agent | What It Does | Where It Lives | Data Needed | Connections |
|---|-------|-------------|---------------|-------------|-------------|
| A1 | Content Writer | Writes GEO-optimized website copy (landing, service, about pages). User selects page type, topic, tone, word count. | Agent Hub, Agent Chat | Business context, topic, tracked queries, recommendations | Content Library, WordPress (publish) |
| A2 | Blog Writer | Creates long-form blog posts targeting AI-discoverable topics. Multiple tones (educational, opinion, how-to, listicle, case study). | Agent Hub, Agent Chat | Business context, topic, keywords, audience | Content Library, WordPress |
| A3 | Schema Optimizer | Generates JSON-LD structured data by crawling target page, detecting existing schema, identifying gaps. | Agent Hub, Agent Chat | Website URL, business profile | Content Library (schema output), AI Readiness |
| A4 | Recommendations (System) | Auto-generates 5-8 prioritized action items after every scan. No credit cost. | Recommendations page (auto-populated) | Latest scan results, business profile, competitor data | All other agents (as context/trigger) |
| A5 | FAQ Agent | Creates 10-15 FAQ pairs from scan data + business context. Includes FAQPage schema. | Agent Hub, Agent Chat | Scan data (what users ask AI), business profile | Content Library |
| A6 | Review Analyzer | Analyzes reviews, extracts sentiment themes, generates response templates + improvement plan. | Agent Hub, Agent Chat | Business name, review platform data (via Perplexity research) | Recommendations |
| A7 | Social Strategy | Creates 30-day content calendar with 12-15 post ideas, captions, hashtags, platform-specific formats. | Agent Hub, Agent Chat | Business profile, industry trends | Content Library |
| A8 | Competitor Intelligence | Deep analysis of competitor's AI visibility strategy. Gap analysis, strategic recommendations. | Agent Hub, Agent Chat, Competitors page | Competitor names/URLs, tracked queries, multi-engine scan results | Competitors page, Recommendations |
| A9 | Citation Builder | Identifies high-authority sources AI cites, finds authors, generates personalized outreach templates. | Agent Hub, Agent Chat | Scan results (cited sources), business profile | Content Library (outreach templates) |
| A10 | LLMS.txt Generator | Creates/manages llms.txt file by crawling website structure. | Agent Hub, Agent Chat | Website URL, business profile | AI Readiness, Content Library |
| A11 | AI Readiness Auditor | Full website audit: deep crawl (up to 50 pages), 5-category scoring, detailed improvement roadmap. | Agent Hub, Agent Chat, AI Readiness page | Website URL | AI Readiness Dashboard |
| A12 | Ask Beamix (Conversational Analyst) | Chat-based Q&A about user's data. "Why did my visibility drop?" "What should I focus on?" SSE streaming. No credit cost. | Agent Hub (dedicated chat), accessible from any dashboard page | Full business context + scan history | All dashboard data |

#### New Agents (3 -- Closing Competitive Gaps)

| # | Agent | What It Does | Where It Lives | Data Needed | Connections |
|---|-------|-------------|---------------|-------------|-------------|
| A13 | Content Voice Trainer (NEW) | Analyzes business's existing website content + past edits to learn their writing voice. Produces a "voice profile" that all content agents use. Inspired by Goodie's Author Stamp. | Agent Hub, Settings (voice training section) | Website URL (crawl existing content), past content edits in Content Library | All content agents (A1, A2, A5, A7) use trained voice |
| A14 | Content Pattern Analyzer (NEW) | Analyzes top-cited content in user's niche. Extracts structural/tonal patterns that make content get cited by AI. Produces a "citation playbook." Inspired by Spotlight. | Agent Hub, Agent Chat | Scan results (cited URLs), Perplexity research on top content | Content Writer, Blog Writer (use patterns in generation) |
| A15 | Content Refresh Agent (NEW) | Audits existing published content for staleness. Identifies outdated facts, broken links, missing queries. Suggests updates or auto-generates refreshed versions. Can run on a schedule (monthly). Inspired by Profound Workflows. | Agent Hub, Content Library (refresh indicators) | `content_items` (published), latest scan results, current web data | Content Library, Content Editor |

---

### 3.4 Content Engine Module (10 features)

| # | Feature | What It Does | Where It Lives | Data Needed | Connections |
|---|---------|-------------|---------------|-------------|-------------|
| C1 | Content Preview | Rendered preview of agent output: title, meta, body, FAQ, schema. Desktop/mobile toggle. | Content Editor | `content_items` | Content Editor |
| C2 | Inline Editor | Markdown textarea for modifying content. Preserves formatting. | Content Editor | `content_items` | Content Library |
| C3 | Copy/Download/Export | Copy to clipboard, download as HTML/Markdown/PDF. | Content Editor, Content Library | `content_items` | Export system |
| C4 | Status Tracking | Draft --> Ready for Review --> Published --> Archived lifecycle. | Content Library, Content Editor | `content_items.status` | Editorial Queue |
| C5 | Content Voice Training (NEW) | Train on business's website content + past edits. All agents inherit the trained voice. | Settings/Agent Hub | Website crawl, edit history | All content agents |
| C6 | Typed Content Templates (NEW) | 6+ distinct template types: Comparison Article, Ranked List, Location Page, Case Study, Product Deep-Dive, FAQ Article. Each has specialized structure, prompts, and output format. | Agent Chat (type selector), Content Library (type filter) | Template definitions, business context | Content Writer, Blog Writer |
| C7 | Content Impact Tracking (NEW) | Correlates publication dates with scan result changes. Shows ROI per content piece. | Content Library (per-item metrics), Overview | `content_items.published_at`, `scan_results` | Rankings, Overview |
| C8 | WordPress Publish | One-click publish to WordPress (REST API + Application Passwords). Creates as draft in WP. | Content Editor action bar | WordPress credentials, content | Integrations (WordPress) |
| C9 | Editorial Queue (NEW) | Review workflow for agent outputs. Items in "Ready for Review" enter a queue. Approve/Request Changes/Reject actions. Review history. | Content Library (queue view) | `content_items.status`, review actions | Content Library |
| C10 | Content Pattern Library (NEW) | Stores citation-winning patterns extracted by Content Pattern Analyzer. Reusable across content generation. "In your niche, cited content averages 2,100 words with H2 every 300 words and includes statistical claims." | Agent Hub (Pattern Analyzer output), used internally by content agents | Pattern analysis results | Content Writer, Blog Writer |

---

### 3.5 Competitive Intelligence Module (6 features)

| # | Feature | What It Does | Where It Lives | Data Needed | Connections |
|---|---------|-------------|---------------|-------------|-------------|
| CI1 | Competitor Management | Add/remove competitors by name or URL. Auto-detect competitors from AI responses. Tier limits: 3/5/10. | Competitors page, Onboarding | `competitors` table | All competitive features |
| CI2 | Share of Voice | Pie/bar chart: brand's share of AI mentions vs competitors. Over time view. | Competitors page, Overview snapshot | Competitor scan comparison data | Rankings, Overview |
| CI3 | Gap Analysis | Topics where competitors appear but user doesn't. Ranked by opportunity size. | Competitors page | `scan_engine_results` cross-comparison | Recommendations, Content Writer |
| CI4 | Comparison Table | Side-by-side: user vs competitor per query per engine. Sortable. | Competitors page | Competitor + user scan data | Rankings |
| CI5 | Source-Level Citation Comparison (NEW) | Which URLs are cited for competitors vs your brand. Identifies content gaps at the URL level. | Competitors page (expandable) | Citation data from competitor scans | Content Writer (gap closure), Citation Builder |
| CI6 | Anonymous Monitoring | Competitors are tracked without any notification. | System-wide | Scan pipeline design | All competitive features |

---

### 3.6 Alert System Module (9 alert types)

| # | Alert | Trigger | Severity | Channels | Where Visible |
|---|-------|---------|----------|----------|--------------|
| N1 | Visibility Drop | Score drops >15% | High | Email + In-app | Notifications, Overview |
| N2 | Visibility Improvement | Score improves >15% | Medium | In-app | Notifications |
| N3 | New Competitor Detected | New competitor appears in AI responses | Medium | In-app | Notifications, Competitors |
| N4 | Competitor Overtook You | Competitor surpasses user's rank | High | Email + In-app | Notifications, Competitors |
| N5 | Scan Complete | Scheduled/manual scan finished | Low | In-app | Notifications |
| N6 | Agent Complete | Agent execution finished | Low | In-app | Notifications, Agent Hub |
| N7 | Sentiment Shift | Dominant sentiment changed for key query | High | Email + In-app + Slack | Notifications, Rankings |
| N8 | Credit Low | Agent uses below 20% remaining | Medium | Email | Notifications, Agent Hub |
| N9 | Trial Ending | 3 days before trial expiry | High | Email | Notifications |

**Alert delivery:** In-app notification bell (all tiers), email (configurable per alert type), Slack webhook (Pro+ if configured).
**Deduplication:** No duplicate alert of same type within 24 hours.

---

### 3.7 Integration Hub Module (7 integrations)

| # | Integration | What It Does | Tier | Data Flow |
|---|------------|-------------|------|-----------|
| I1 | WordPress | Publish content directly to WordPress as draft. REST API + Application Passwords. | Business | Content Editor --> WP REST API --> WP post (draft) |
| I2 | GA4 | AI traffic attribution. Identify visits from AI referral domains. Correlate visibility with traffic. | Pro+ | GA4 API --> daily fetch --> analytics_snapshots --> Attribution dashboard |
| I3 | Google Search Console | Keyword ranking data from traditional search. Correlate with AI visibility. Feed into prompt generation. | Pro+ | GSC API --> keyword data --> scan prompt improvement, dual-visibility view |
| I4 | Slack | Push alerts to Slack channel. Incoming webhook (Phase 1), full app (Phase 2). | Pro+ | Alert pipeline --> Slack webhook --> formatted Block Kit message |
| I5 | Cloudflare/Vercel | AI crawler detection. Which AI bots visit which pages. | Business | CDN analytics API --> crawler data --> AI Readiness dashboard |
| I6 | Looker Studio (NEW) | Export Beamix data to Google Looker Studio for custom reporting. | Business | Data connector --> Looker Studio community connector |
| I7 | Public API | REST API for custom integrations. 12 endpoints, scoped API keys, rate-limited. | Business | API key auth --> read/write/execute scopes --> JSON responses |

---

### 3.8 AI Readiness Module (6 features)

| # | Feature | What It Does | Where It Lives |
|---|---------|-------------|---------------|
| AR1 | AI Readiness Score (0-100%) | 5-category weighted score. Content Quality (30%), Technical Structure (25%), Authority Signals (20%), Semantic Alignment (15%), AI Accessibility (10%). | Free scan results, AI Readiness page |
| AR2 | Per-Factor Detail | Each factor within each category scored individually with specific fix guidance. | AI Readiness page |
| AR3 | AI Crawler Detection | Detect GPTBot, ClaudeBot, PerplexityBot, etc. visits. Show which pages they crawl. | AI Readiness page (if integration active) |
| AR4 | robots.txt Analysis | Check if AI bots are blocked. Specific guidance to unblock. | AI Readiness page, free scan |
| AR5 | Improvement Roadmap | Ordered list of fixes by impact. Each links to relevant agent. | AI Readiness page |
| AR6 | Shareable Score Card | Social-media-ready card: "My AI Readiness is 34%. Check yours free." | Free scan results |

---

### 3.9 Settings & Preferences Module (6 features)

| # | Feature | What It Does | Where It Lives |
|---|---------|-------------|---------------|
| U1 | Business Profile Management | Edit business name, URL, industry, location, services, description. | Settings > Business Profile |
| U2 | Billing Management | Paddle: upgrade, downgrade, cancel, invoices, usage stats. | Settings > Billing |
| U3 | Language Preference | Hebrew/English toggle. Affects all dashboard text. | Settings > Preferences |
| U4 | Notification Preferences | Configure alert channels per type. Thresholds for visibility alerts. | Settings > Preferences |
| U5 | Data Export | Download scan data, content, reports as CSV/PDF. | Settings (Business tier), Content Library |
| U6 | Account Deletion | GDPR-compliant account and data removal. | Settings > Account |

---

### 3.10 Billing & Subscription Module (5 features)

| # | Feature | What It Does | Where It Lives |
|---|---------|-------------|---------------|
| B1 | Plan Selection | Choose Starter/Pro/Business. Monthly or annual (20% discount). | Pricing page, Settings > Billing |
| B2 | Trial Management | 14-day free trial. Clock starts on first dashboard visit. Full Pro features during trial. | Onboarding, Settings > Billing |
| B3 | Agent Use Tracking | Track used/available agent uses. 20% rollover cap. Top-up purchases. | Agent Hub (meter), Overview (sidebar), Settings > Billing |
| B4 | Paddle Checkout | Subscription creation, plan changes, cancellation. Paddle overlay. | Pricing page, Settings > Billing |
| B5 | Webhook Processing | Handle Paddle events: subscription created/updated/cancelled, payment succeeded/failed. | Background (API route) |

---

## 4. User Journeys (End-to-End)

### Journey 1: First-Time Visitor --> Paying Customer

```
1. DISCOVER
   Visitor lands on beamix.io (from Google, referral, social, or shared scan link)
   --> Sees hero: "See how AI search talks about your business"
   --> Enters business URL, name, industry in hero input

2. FREE SCAN
   --> Redirected to /scan/[scan_id]
   --> Watches animated progress as 4 engines are queried (30-60 seconds)
   --> Results appear: Visibility Score 34/100 (red), AI Readiness 42%
   --> Sees: "ChatGPT doesn't mention you. Gemini ranks you #4. Perplexity cites your competitor."
   --> Quick Wins shown (2 visible, rest blurred)
   --> Emotional trigger: "I'm invisible in AI search"

3. SIGNUP
   --> Clicks "Get the full picture" CTA
   --> Arrives at /signup?scan_id=abc123
   --> Creates account (email+password or Google)
   --> scan_id stored for import

4. ONBOARDING (4 steps, ~90 seconds)
   --> Step 0: "We found your scan!" -- auto-imports free scan data
   --> Step 1: Business details pre-populated from scan
   --> Step 2: Add services (freeform tags)
   --> Step 3: Add 1-2 competitors (optional)
   --> Step 4: Language + notification preferences
   --> Trial clock starts

5. FIRST DASHBOARD VIEW
   --> Dashboard overview loads with real scan data
   --> Visibility Score prominent, all recommendations visible
   --> "Welcome" banner: "Your 14-day Pro trial is active. Run your first agent!"
   --> Top recommendation: "Add FAQ content for your top query" with [Run Agent] button

6. FIRST AGENT RUN
   --> Clicks [Run Agent] on FAQ recommendation
   --> Arrives at Agent Chat (/dashboard/agents/faq)
   --> Sees pre-filled topic from recommendation
   --> Clicks "Run Agent"
   --> Watches streaming output (30-60 seconds): researching, outlining, writing
   --> Reviews generated FAQ content
   --> Saves to Content Library

7. CONVERSION MOMENT (within 14 days)
   --> Trial nudge emails at day 3, 7, 10
   --> Agent uses running low (5/15 used)
   --> Visibility score improved after content published
   --> "Your trial ends in 3 days" alert
   --> Clicks upgrade --> Paddle checkout --> Paying customer
```

---

### Journey 2: Returning User --> Visibility Improvement Cycle

```
1. CHECK IN
   --> Logs into dashboard
   --> Sees Visibility Score: 52/100 (+8 from last week)
   --> Sees which engines improved (ChatGPT: mentioned now!)
   --> Sees Content Performance: "Your FAQ article improved position on 3 queries"

2. REVIEW RECOMMENDATIONS
   --> Clicks Recommendations
   --> Top item: "Write a comparison article: Your Brand vs Competitor X"
   --> Impact: High. Evidence: "Competitor X appears in 6/8 queries where you don't"
   --> Journey stage: Consideration

3. RUN AGENT
   --> Clicks [Run Agent] -- opens Content Writer
   --> Selects content type: "Comparison Article" (typed template)
   --> Agent streams output with comparison structure
   --> Reviews, makes minor edits in Content Editor
   --> Marks "Ready for Review"

4. REVIEW & PUBLISH
   --> Content appears in Editorial Queue
   --> Reviews final version
   --> Approves --> Status: Published
   --> Copies to clipboard, pastes into WordPress (or one-click publishes if integrated)

5. TRACK IMPACT
   --> Next scan cycle runs (3 days later for Pro)
   --> Content Performance widget: "Comparison article published 3 days ago. Monitoring impact..."
   --> After 2 scan cycles: "Position improved from 'not mentioned' to #3 on ChatGPT for 'X vs Y'"
   --> Content item now shows performance badge

6. ITERATE
   --> Recommendations updated based on new scan
   --> New opportunities surfaced from content pattern analysis
   --> Cycle repeats
```

---

### Journey 3: Power User --> Strategic Intelligence + Automation

```
1. COMPETITIVE ANALYSIS
   --> Opens Competitors page
   --> Reviews Share of Voice: brand at 24%, main competitor at 41%
   --> Drills into Gap Analysis: 12 topics where competitor appears but user doesn't
   --> Source-Level Citations: competitor's blog post on "best practices" is cited by 3 engines
   --> Content Pattern Insights: cited competitor content averages 2,200 words with FAQ sections

2. STRATEGIC AGENT WORKFLOW
   --> Opens Agent Hub
   --> Runs Content Pattern Analyzer on top 5 competitive gaps
   --> Gets citation playbook: "Structure, length, tone patterns that get cited"
   --> Runs Content Writer 3 times using playbook patterns + comparison template
   --> All 3 articles save to Content Library

3. CONTENT MANAGEMENT
   --> Opens Content Library
   --> Reviews all 3 drafts in Editorial Queue
   --> Edits tone on article 2
   --> Approves all 3 --> Published
   --> Sets up recurring agent: "Content Refresh Agent monthly on all published articles"

4. WORKFLOW AUTOMATION (NEW)
   --> Opens Agent Workflows
   --> Creates rule: "If visibility drops >15% on any tracked query -->
       Auto-run Recommendations --> Auto-draft Content Fix --> Queue for my Review"
   --> Creates rule: "Monthly: Run Content Refresh on all published content"

5. MONITOR & EXPORT
   --> Weekly digest email shows: visibility trend, content performance, competitor changes
   --> Opens Looker Studio with Beamix connector -- builds custom agency report
   --> Exports CSV of all scan data for client presentation
```

---

### Journey 4: Admin --> Settings + Billing + Integrations

```
1. BUSINESS PROFILE
   --> Settings > Business Profile
   --> Updates services after business expansion
   --> Adds new location
   --> System suggests new prompts based on updated profile

2. BILLING MANAGEMENT
   --> Settings > Billing
   --> Reviews usage: 12/15 agent uses consumed
   --> Sees top-up option: 5 uses for $15 (or upgrade to Business for more)
   --> Downloads last 3 invoices
   --> Switches from monthly to annual (20% savings)

3. INTEGRATIONS SETUP
   --> Settings > Integrations
   --> Connects WordPress: enters site URL + application password
   --> Tests connection: "Connected! You can now publish directly."
   --> Connects GA4: OAuth flow, selects property
   --> Connects Slack: pastes webhook URL, tests with sample alert
   --> Generates API key for custom dashboard (Business tier)

4. NOTIFICATION TUNING
   --> Settings > Preferences
   --> Disables email for "Scan Complete" (too frequent)
   --> Enables Slack for "Visibility Drop" and "Competitor Overtook"
   --> Sets visibility drop threshold to 10% (from default 15%)

5. API KEY MANAGEMENT
   --> Settings > Integrations > API
   --> Generates new key with "read" scope
   --> Copies key (shown once, stored as hash)
   --> Uses in custom internal dashboard
```

---

## 5. Agent System (Product Perspective)

### Agent Interaction Model

Every agent (except Ask Beamix and Recommendations) follows this UX pattern:

1. **User arrives at Agent Chat** (from Agent Hub, recommendation, or quick action)
2. **Input form appears** -- fields specific to agent type (topic, tone, URL, etc.). Pre-filled when triggered from a recommendation.
3. **User clicks "Run Agent"** -- 1 agent use deducted (hold pattern)
4. **Streaming execution** -- real-time phase indicators + incremental content display
5. **User can interact** -- guide, adjust, ask questions during execution
6. **Output presented** -- formatted result with action bar (Save, Copy, Download, Publish, Run Again)
7. **Output saved** -- to Content Library (content agents) or displayed as report (analysis agents)

### Agent Details

---

#### A1: Content Writer

**Purpose:** Generate GEO-optimized website pages that AI engines will cite.

**User sees when running:**
- Input form: page type (Landing/Service/About/FAQ), topic, target queries (suggested from tracked_queries), tone (Professional/Friendly/Authoritative/Conversational), word count (500-3000), content template type (NEW: generic article, comparison, location page, case study, ranked list, product deep-dive), language (EN/HE), include FAQ toggle, include schema toggle
- Streaming phases: "Researching current AI coverage..." --> "Building content structure..." --> "Writing content..." --> "Quality checking..."
- Final output: title + meta description + full body (Markdown) + FAQ section + JSON-LD schema + sources

**Input the user provides:** Topic, tone, template type, word count, target queries. Business context auto-injected.
**Output the user receives:** Complete content piece ready for publishing. Quality score badge.
**Where output lives:** Content Library. Accessible via Content Editor for modifications.
**Connections:** Uses voice profile from Content Voice Trainer (A13). Uses patterns from Content Pattern Analyzer (A14). Receives topic suggestions from Recommendations (A4). Feeds Content Library.

---

#### A2: Blog Writer

**Purpose:** Long-form blog posts targeting topics AI engines discuss.

**User sees when running:**
- Input form: title or topic, keywords, target audience, length (Short 600-800/Standard 1000-1500/Long 1500-2500), tone (Educational/Opinion/How-To/Listicle/Case Study), language
- Streaming phases: "Researching topic trends..." --> "Creating outline..." --> "Writing blog post..." --> "Optimizing for AI citation..." --> "Generating title options..."
- Final output: 3 title options + meta + excerpt + full content + FAQ + BlogPosting schema + read time + tags + sources

**Input:** Topic, keywords, audience, length, tone.
**Output:** Complete blog post with multiple title options.
**Where output lives:** Content Library.
**Connections:** Same as Content Writer -- inherits voice and patterns. Can be triggered from Blog page content gaps.

---

#### A3: Schema Optimizer

**Purpose:** Generate JSON-LD structured data for any page.

**User sees when running:**
- Input form: target page URL (auto-suggests from business website)
- Streaming phases: "Crawling page..." --> "Detecting existing schema..." --> "Analyzing gaps..." --> "Generating JSON-LD..."
- Final output: existing schema report + generated JSON-LD code blocks + implementation guide + validation results

**Input:** Website URL or specific page URL.
**Output:** JSON-LD markup ready to copy-paste into website. Gap report.
**Where output lives:** Content Library (schema category).
**Connections:** Feeds AI Readiness score. Triggered from AI Readiness recommendations.

---

#### A4: Recommendations (System Agent)

**Purpose:** Auto-generate prioritized action items after every scan.

**User sees:** Not directly invoked. Recommendations appear automatically on the Recommendations page and Overview widget after each scan completes.

**Input:** Auto -- latest scan results, business profile, competitor data, content history, previous recommendations.
**Output:** 5-8 prioritized items. Each has: title, description, impact level (High/Medium/Low), suggested agent, evidence from scan data, customer journey stage tag (NEW: Awareness/Consideration/Decision), estimated effort.
**Where output lives:** Recommendations page, Overview widget.
**Connections:** Triggers all other agents (via "Run Agent" button on each recommendation). Receives data from every scan.

---

#### A5: FAQ Agent

**Purpose:** Create FAQ content that matches how users query AI about your industry.

**User sees when running:**
- Input form: topic focus (optional -- defaults to top queries from scans), number of FAQs (5-15), language, include schema toggle
- Streaming phases: "Extracting top questions from AI responses..." --> "Generating conversational answers..."
- Final output: 10-15 FAQ pairs + FAQPage JSON-LD schema

**Input:** Topic focus, count preference.
**Output:** FAQ pairs in natural conversational language + schema markup.
**Where output lives:** Content Library.
**Connections:** Triggered from Recommendations. Data from scan responses (what questions AI answers about your industry).

---

#### A6: Review Analyzer

**Purpose:** Understand what customers say and how it affects AI perception.

**User sees when running:**
- Input form: business name (pre-filled), review platforms to check (Google Reviews, Yelp, etc.)
- Streaming phases: "Gathering recent reviews..." --> "Analyzing sentiment themes..." --> "Generating response strategy..."
- Final output: sentiment distribution chart, theme breakdown (what customers praise/complain about), response templates for common review types, improvement recommendations

**Input:** Business name, review platforms.
**Output:** Sentiment report + response templates + improvement plan.
**Where output lives:** Agent output (report view), not Content Library (non-content output).
**Connections:** Feeds into Recommendations (review-based improvements). Informs Content Writer context.

---

#### A7: Social Strategy

**Purpose:** Content calendar and ready-to-post social content.

**User sees when running:**
- Input form: platforms (Instagram, LinkedIn, Twitter/X, Facebook), focus topics, campaign goal, language
- Streaming phases: "Researching competitor social presence..." --> "Building content calendar..."
- Final output: 30-day content calendar + 12-15 post ideas with captions, hashtags, platform-specific formatting

**Input:** Platforms, focus topics, campaign goal.
**Output:** Content calendar + ready-to-post content.
**Where output lives:** Content Library (social category).
**Connections:** Uses business context + scan data for topic relevance.

---

#### A8: Competitor Intelligence

**Purpose:** Deep-dive competitive analysis for strategic decisions.

**User sees when running:**
- Input form: competitor names/URLs (pre-filled from tracked competitors), focus areas (all/content strategy/technical/citations)
- Streaming phases: "Scanning all AI engines for competitor mentions..." --> "Analyzing competitor positioning..." --> "Generating strategic report..."
- Final output: comprehensive report with competitor visibility scores, strategy analysis, gap matrix, specific actionable recommendations, source-level citation comparison

**Input:** Competitor selection, focus areas.
**Output:** Strategic intelligence report (5-10 pages equivalent).
**Where output lives:** Agent output (report view).
**Connections:** Feeds Competitors page data, Recommendations, Content strategy.

---

#### A9: Citation Builder

**Purpose:** Get your brand cited by sources AI already trusts.

**User sees when running:**
- Input form: focus topic or query (optional -- defaults to top gaps)
- Streaming phases: "Identifying top-cited sources in your niche..." --> "Researching author contacts..." --> "Generating outreach templates..."
- Final output: list of 10-15 citation targets (publication, article, author, contact info), personalized outreach email templates per target, priority ranking by citation influence

**Input:** Topic focus (optional).
**Output:** Citation target list + outreach templates.
**Where output lives:** Content Library (outreach category).
**Connections:** Uses citation data from scans. Feeds into PR/outreach workflow.

---

#### A10: LLMS.txt Generator

**Purpose:** Create the llms.txt file that tells AI engines about your business.

**User sees when running:**
- Input form: website URL (pre-filled), include/exclude sections
- Streaming phases: "Crawling website structure..." --> "Generating structured llms.txt..."
- Final output: complete llms.txt file + deployment instructions (where to place it, how to verify)

**Input:** Website URL.
**Output:** llms.txt file + deployment guide.
**Where output lives:** Content Library (technical category).
**Connections:** Feeds AI Readiness score. Triggered from AI Readiness recommendations.

---

#### A11: AI Readiness Auditor

**Purpose:** Comprehensive website audit for AI discoverability.

**User sees when running:**
- Input form: website URL, crawl depth (5/25/50 pages), focus areas
- Streaming phases: "Crawling website (page 1/25)..." --> "Analyzing content quality..." --> "Checking technical structure..." --> "Scoring AI readiness..." --> "Generating improvement plan..."
- Final output: 0-100% overall score + per-category scores + per-factor detail + prioritized improvement roadmap with specific fixes

**Input:** Website URL, crawl depth.
**Output:** AI Readiness report with scores and actionable roadmap.
**Where output lives:** Agent output (report view). Score displayed on AI Readiness dashboard.
**Connections:** Triggers Schema Optimizer, LLMS.txt Generator from specific recommendations.

---

#### A12: Ask Beamix (Conversational Analyst)

**Purpose:** Natural language Q&A about your dashboard data.

**User sees when running:**
- Persistent chat interface (not a one-shot run)
- User types questions: "Why did my visibility drop last week?", "Which competitor is growing fastest?", "What content should I write next?"
- SSE streaming responses with data citations
- Suggested follow-up questions

**Input:** Natural language questions.
**Output:** Natural language answers with specific data references.
**Where output lives:** Not stored -- real-time conversation only. (Future: save conversation threads.)
**Connections:** Reads all dashboard data: scan results, rankings, competitors, content, agent history.

---

#### A13: Content Voice Trainer (NEW)

**Purpose:** Learn the business's unique writing voice so all generated content sounds like them, not generic AI.

**User sees when running:**
- Input form: website URL (to crawl existing content), optional: paste 2-3 sample paragraphs, brand tone descriptors (formal/casual, technical/simple, etc.)
- Streaming phases: "Crawling your website content..." --> "Analyzing writing patterns..." --> "Building voice profile..."
- Final output: voice profile summary ("Your voice is: conversational, uses Hebrew slang, short sentences, first-person expert tone, frequent rhetorical questions"). Example paragraph in trained voice. Toggle to activate for all content agents.

**Input:** Website URL, optional samples and tone descriptors.
**Output:** Voice profile (stored and reusable).
**Where output lives:** Business settings (voice profile). Used by all content agents.
**Connections:** Content Writer, Blog Writer, FAQ Agent, Social Strategy all inherit trained voice. User can retrain anytime.

---

#### A14: Content Pattern Analyzer (NEW)

**Purpose:** Discover what makes top-cited content successful in your niche.

**User sees when running:**
- Input form: topic or query to analyze (defaults to top tracked queries), number of sources to analyze (5-20)
- Streaming phases: "Identifying top-cited sources for this topic..." --> "Analyzing content structure patterns..." --> "Extracting citation-winning characteristics..."
- Final output: citation playbook with: average word count of cited content, common structural patterns (H2 frequency, FAQ inclusion, list usage), tone patterns, content types that win, example excerpts, specific recommendations for user's content

**Input:** Topic/query, analysis depth.
**Output:** Citation playbook (reusable).
**Where output lives:** Agent output (report). Patterns stored for content agents to reference.
**Connections:** Content Writer and Blog Writer use extracted patterns. Feeds Recommendations.

---

#### A15: Content Refresh Agent (NEW)

**Purpose:** Keep published content current and competitive.

**User sees when running:**
- Input form: select content items to audit (or "all published"), focus check (factual accuracy, keyword freshness, competitor changes, structural optimization)
- Streaming phases: "Auditing published content..." --> "Checking for outdated information..." --> "Analyzing competitive changes..." --> "Generating refresh recommendations..."
- Final output: per-item audit report: what's outdated, what's missing, refreshed version (diff view), priority ranking
- **Recurring mode:** Can be scheduled monthly. Runs automatically, results appear in Content Library with "Refresh Suggested" badge.

**Input:** Content selection, focus areas. Or: scheduled (monthly/weekly).
**Output:** Refresh audit per content item + auto-generated updated versions.
**Where output lives:** Content Library (refresh suggestions appear inline on each item).
**Connections:** Uses latest scan data to detect changed competitive landscape. Feeds Editorial Queue.

---

### Agent Workflow System (NEW -- Closing Gap)

**Purpose:** Automate multi-agent chains triggered by events.

**What the user sees:**
- Visual workflow builder in Agent Hub
- Trigger types:
  - **Event triggers:** Visibility drop >X%, new competitor detected, sentiment shift, content published
  - **Schedule triggers:** Weekly, monthly, on specific date
  - **Manual triggers:** User clicks "Run Workflow"
- Action types:
  - Run any agent with pre-configured input
  - Queue output for review (Editorial Queue)
  - Auto-publish (if approved)
  - Send notification
  - Conditional branch (if score < X, run agent Y; else skip)

**Example workflows:**
1. "Visibility Drop Response": Visibility drops >15% --> Run Recommendations --> Auto-draft Content Writer (using top recommendation) --> Queue for Review --> Notify via Slack
2. "Monthly Content Refresh": Every 1st of month --> Run Content Refresh on all published items --> Flag items needing updates --> Notify via email
3. "New Competitor Auto-Analysis": New competitor detected in scan --> Run Competitor Intelligence --> Update gap analysis --> Generate 3 content recommendations

**Where it lives:** Agent Hub > Workflows tab.
**Data needed:** Scan events, agent outputs, workflow definitions.
**Connections:** All agents (as actions), Alert system (as triggers), Content Library (as output destination), Editorial Queue.

---

### Recurring Agent Execution (NEW -- Closing Gap)

**Purpose:** Schedule agents to run automatically on a cadence.

**What the user sees:**
- In Agent Hub, each agent has a "Schedule" option (Business tier)
- Options: Weekly, Bi-weekly, Monthly
- Configure: which content to audit, which topics to refresh, which competitors to analyze
- Dashboard shows: "3 recurring agents configured. Next runs: Content Refresh (March 8), Competitor Intel (March 15)"

**Where it lives:** Agent Hub, Settings.
**Connections:** All agents, Inngest (scheduling infrastructure), Content Library (outputs).

---

## Summary: Feature Count

| Module | Existing Features | New Features (Gap Closure) | Total |
|--------|------------------|-----------------------------|-------|
| Scan Engine | 10 | 2 (Prompt Volume, Brand Narrative) | 12 |
| Dashboard & Analytics | 12 | 2 (Content Performance, Prompt Trends) | 14 |
| Agent System | 12 agents | 3 agents (Voice, Patterns, Refresh) + Workflows + Recurring | 15 agents + 2 systems |
| Content Engine | 4 | 6 (Voice Training, Typed Templates, Impact Tracking, WordPress, Editorial Queue, Pattern Library) | 10 |
| Competitive Intelligence | 5 | 1 (Source-Level Citation Comparison) | 6 |
| Alert System | 9 | 0 | 9 |
| Integration Hub | 5 | 2 (Looker Studio, expanded GSC) | 7 |
| AI Readiness | 6 | 0 | 6 |
| Settings | 6 | 0 | 6 |
| Billing | 5 | 0 | 5 |
| **Total** | **74** | **16** | **90+ features, 15 agents** |

Every gap identified in the CTO's analysis is addressed above. The product layer now covers: Content Performance Tracking (C7), Content Voice Training (A13/C5), Typed Content Templates (C6), Agent Workflows, Recurring Agent Execution, Prompt Volume Data (S11/D14), Source-Level Citation Analytics (S8/CI5), Brand Narrative Analysis (S12), Persona-Based Tracking (D3 persona filter), Customer Journey Stage Mapping (Recommendations journey tags), Content Pattern Analysis (A14/C10), and Editorial Queue (C9).

---

> **This is the definitive product layer for Beamix.**
> Every page, every feature, every user journey, every agent. No code. No pricing. No timelines.
> All competitive gaps closed. Ready for engineering handoff.
