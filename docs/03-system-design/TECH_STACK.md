# Technology Stack

> **Last synced:** March 2026 — aligned with 03-system-design/

**Source of truth:** `docs/03-system-design/ARCHITECTURE.md` section 4.1

## Languages

**Primary:**
- TypeScript 5.x — Entire codebase with strict mode enabled
- JavaScript (JSX/TSX) — React components, server components

**Secondary:**
- SQL — Database schema and migrations in `supabase/migrations/`

## Runtime

**Environment:**
- Node.js 20.x LTS (specified in package.json as compatible)

**Package Manager:**
- npm
- Lockfile: npm-lock.json

## Frameworks

**Core:**
- Next.js 16.1.4 — App Router (not Pages Router), React 19 SSR, API routes
- React 19.2.3 — UI library with strict TypeScript support
- React DOM 19.2.3 — DOM rendering

**Authentication:**
- Supabase Auth (built-in to Supabase) — Managed authentication service
- @supabase/ssr 0.8.0 — Server-side rendering auth helper
- Custom middleware in `src/lib/supabase/middleware.ts` for session updates

**State Management:**
- React Query (@tanstack/react-query) 5.90.21 — Server state (rankings, queries, credits)
- Zustand 5.0.11 — Client state (UI: sidebar, modals, loading states)
- React Hook Form 7.71.1 — Form state management with validation

**UI & Styling:**
- Tailwind CSS 4.x — Utility-first CSS framework (CSS-based config via `@tailwindcss/postcss`, no tailwind.config.ts)
- Shadcn/ui components — Headless UI built on Radix UI
- Lucide React 0.563.0 — Icon library
- Framer Motion 12.29.0 — Animation library
- Recharts 3.7.0 — Charting library for rankings/analytics

**Forms & Validation:**
- Zod 4.3.6 — Runtime schema validation (import from `zod/v4`)
- @hookform/resolvers 5.2.2 — Bridge between React Hook Form and Zod
- Class Variance Authority 0.7.1 — CSS class composition

**Background Jobs:**
- Inngest — Event-driven background job orchestration for scans, agents, crons, workflows
  - SDK: `inngest` (server-side)
  - Serve endpoint: `/api/inngest`
  - Implemented functions: scan-free (event: scan/free.started), scan-manual (event: scan/manual.started)
  - Planned (not yet built): scan-scheduled (automated recurring scans for paid users)
  - NOT n8n — Inngest is the only background job system

**Billing:**
- Paddle — Subscriptions, webhooks, billing portal (NOT Stripe — Stripe was fully removed 2026-03-02)
  - SDK: Paddle Node SDK
  - Client token: `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
  - Server: `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`

**Email:**
- Resend — Transactional + marketing email delivery
  - SDK: `resend` (server-side)
  - Auth: `RESEND_API_KEY`
- React Email — Email template components (15 templates)

**LLM Gateway: OpenRouter**
- All LLM calls route through OpenRouter (`src/lib/openrouter.ts`) — no direct provider SDK imports
- Two API keys for spend tracking:
  - `OPENROUTER_SCAN_KEY` — scan engine queries (frequent, lower cost)
  - `OPENROUTER_AGENT_KEY` — agent execution, QA gates, recommendations
  - Fallback: `OPENROUTER_API_KEY` (shared key if per-purpose key not set)
- Models routed via OpenRouter:
  - `openai/gpt-4o` — ChatGPT scan engine
  - `google/gemini-2.0-flash-001` — Gemini scan engine
  - `perplexity/sonar-pro` — Perplexity scan engine
  - `anthropic/claude-sonnet-4` — Claude scan engine + agent execution
  - `anthropic/claude-haiku-4` — QA gate + recommendation generation

**Testing:**
- Not yet configured (Phase 2 — see TESTING.md for planned setup)

**Build/Dev:**
- ESLint 9.x — Linting with Next.js config
- eslint-config-next 16.1.4 — Next.js ESLint rules
- TypeScript — Strict type checking

**HTTP Client:**
- Axios 1.13.2 — For HTTP requests (alternative to fetch)

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.91.1 — Database, auth, and real-time queries
- @tanstack/react-query 5.90.21 — Server state caching, fetching, synchronization
- next 16.1.4 — Framework (App Router, SSR, API routes, deployment)
- react 19.2.3 — UI rendering

**Infrastructure:**
- @tanstack/react-query-devtools 5.91.3 — Development debugging for React Query
- Radix UI components (@radix-ui/*) — Accessible component primitives
- zod 4.3.6 — Type-safe validation

**Utilities:**
- clsx 2.1.1 — Conditional class names
- tailwind-merge 3.4.0 — Smart class merging for Tailwind

## Configuration

**Environment:**
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service role key: `SUPABASE_SERVICE_ROLE_KEY` (server-side only, Inngest + webhooks only)
- Database connection: `DATABASE_URL` for migrations
- Paddle: `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRICE_*`
- LLM APIs: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `GOOGLE_AI_API_KEY`, `XAI_API_KEY`, `DEEPSEEK_API_KEY`
- Email: `RESEND_API_KEY`
- Background jobs: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- App: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`

**Build:**
- `next.config.ts` — Remote image patterns (unsplash.com)
- Tailwind v4 — CSS-based config via `@tailwindcss/postcss` (no tailwind.config.ts)
- `eslint.config.mjs` — ESLint config with Next.js rules
- `postcss.config.mjs` — Tailwind CSS PostCSS plugin
- `tsconfig.json` — Strict mode, path aliases `@/*` -> `./src/*`

## Platform Requirements

**Development:**
- Node.js 20.x
- npm
- Supabase CLI (for local database)
- TypeScript knowledge (strict mode)

**Production:**
- Vercel (for Next.js frontend + API routes)
- Supabase Cloud (PostgreSQL + Auth + Realtime + Storage)
- Paddle (payment processing)
- Inngest Cloud (background job execution)
- Resend (email delivery)

---

*Stack analysis: 2026-02-27 | Updated: March 2026 — synced with System Design v2.1*


---

## Product Layer Design

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
- Trust bar: engine logos (ChatGPT, Gemini, Perplexity, Claude, Grok, and more) — do NOT include Bing Copilot (no public API, deferred to Phase 3)
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
  - **Per-Engine Breakdown** -- 3 cards (ChatGPT, Gemini, Perplexity) showing mentioned/not mentioned, position, sentiment — free tier uses 3 engines (Copilot removed, no public API)
  - **AI Readiness Score** -- 0-100% with 5-category breakdown (Content Quality, Technical Structure, Authority Signals, Semantic Alignment, AI Accessibility)
  - **Top Competitor** -- who AI recommends instead of you
  - **Leaderboard** -- your position among detected competitors
  - **Quick Wins** -- 3-5 actionable recommendations (blurred for free users past the first 2)
- Conversion CTAs:
  - "Get the full picture -- sign up free" (unlocks all recommendations)
  - "See how to fix this" (links to agent descriptions)
  - Share button: "My AI visibility score is 34/100. Check yours at beamix.io"

**Scan states and failure handling:**

| State | Condition | What the user sees |
|-------|-----------|-------------------|
| **Loading** | Scan in progress, engines responding | Animated progress: "Scanning X of 4 AI engines..." with per-engine status indicators (spinning/done/failed). Poll interval: 3 seconds. |
| **Partial results** | Some engines complete, others still running | Completed engines show results immediately. Pending engines show skeleton cards with spinner. User can read completed results while waiting. |
| **Timeout** | >90 seconds elapsed, some engines haven't responded | Show completed results. Failed engines show: "This engine timed out — results unavailable for this scan." Overall score calculated from available engines with note: "Score based on X of 4 engines." |
| **Full error** | All engines failed or API error | Error illustration + "We couldn't complete your scan right now. This is usually temporary." + "Try Again" primary CTA button + "Contact support" secondary link. |
| **Expired scan_id** | Scan older than 30 days or invalid ID | "This scan has expired. Free scan results are available for 30 days." + "Run a New Free Scan" CTA linking to `/scan`. |
| **Rate limited** | Same IP/fingerprint submitted too many scans | "You've reached the free scan limit. Create an account for unlimited scans and full AI visibility insights." + "Sign Up Free" CTA. |
| **Page refresh** | User refreshes during scan | Polling resumes from current state. Already-completed engine results display immediately. No data loss. |

**User actions:** View results, share results URL, click signup CTA, start another scan.
**Data in:** GET `/api/scan/[scan_id]/results` (polls every 3 seconds until complete or timeout).
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

### 2.7 Onboarding (3 Steps + Welcome Screen)

**URL:** `/onboarding`
**Purpose:** Collect business information, set up the user's workspace, and import free scan if applicable.

**Step structure and progress indicator:**

| Screen | Content | Counted in dots? |
|--------|---------|-----------------|
| **Step 0 — Welcome** | Welcome screen. If `scan_id` present: "We found your scan results!" with auto-import confirmation. If no `scan_id`: brief intro to what Beamix does and what the onboarding will set up. Always shown. | No — not counted |
| **Step 1 — Business** | Business details: name, website URL, industry (dropdown), location, description. Pre-populated from scan data if available. | Yes — dot 1 |
| **Step 2 — Queries** | Services (multi-select or freeform tags) + add 1-3 competitor names or URLs (optional, can skip). | Yes — dot 2 |
| **Step 3 — Competitors** | Competitor names or URLs (optional, can skip). Language (HE/EN) and notification preferences. | Yes — dot 3 |
| **Ready Screen** | Completion confirmation: "Your workspace is ready!" with summary of what was set up and a "Go to Dashboard" CTA. Not counted as a step — this is a transition screen. | No — not counted |

**Progress indicator:** 3 dots, always visible from Step 1 onward. Step 0 (Welcome) and the Ready screen have no dots. Active dot is filled, upcoming dots are outlined, completed dots are checked.

**What the user sees:**
- Animated transitions between steps
- Back button available on Steps 1-3 (not on Step 0 or Ready)
- Skip button on Step 3 (competitors are optional)

**User actions:** Fill each step, navigate back/forward, skip optional steps, complete onboarding.
**Data in:** If `scan_id` present, fetch free scan data to pre-populate business fields.
**Data out:** POST `/api/onboarding/complete` -- creates `businesses` record, links free scan data via UPSERT to `user_profiles`, starts 7-day trial clock on first dashboard visit.
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
  - Notification bell with unread count badge — click navigates to `/dashboard/notifications`
  - Ask Beamix floating chat bubble (persistent, bottom-right corner — see A12 spec)
  - User avatar + dropdown (settings, billing, logout)

- **Main content area:**
  - **Visibility Score Card** -- large 0-100 gauge with trend arrow (+12 from last scan), color-coded
  - **Score Trend Chart** -- line chart (7d/30d/90d toggle), per-engine filter
  - **Per-Engine Grid** -- 4-10 cards (by tier) showing engine logo, score, mentioned/not, position, sentiment indicator
  - **Top 3 Recommendations** -- prioritized action items with "Run Agent" buttons
  - **Recent Agent Activity** -- last 5 agent runs with status, type, output preview
  - **Competitor Snapshot** -- mini comparison bar chart (your brand vs top 3 competitors)
  - **Content Performance Summary** -- published content count + visibility impact delta (NEW -- gap closure)
  - **Trending Search Queries** (NEW -- gap closure) -- top 5 AI search queries in your category this week. Source: `prompt_library` table (aggregated weekly by cron). Each query shows: query text, volume trend arrow (up/down/stable vs last week), your current mention rate for that query (e.g., "Mentioned in 2/4 engines"). CTA per query: "Target this query" links to Content Writer agent pre-filled with the query as topic.

**User actions:** Click any widget to drill down, run a scan, trigger an agent from recommendations, toggle time ranges on trend chart, click notification bell, click "Target this query" on trending queries.
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

**Pagination, search, and bulk actions:**
- **Pagination:** 20 items per page. Page controls at bottom: Previous / page numbers / Next. Total item count displayed (e.g., "Showing 1-20 of 47 items").
- **Search:** Full-text search bar at top of content list. Searches title and content body preview. Instant filtering as user types (debounced 300ms). Clear button to reset search.
- **Filter bar:** Agent type dropdown, status multi-select (Draft / Ready for Review / Published / Archived), date range picker, content type dropdown. Filters combine with AND logic. Active filters shown as removable chips.
- **Sort:** Default newest first. Options: newest, oldest, last modified, alphabetical (title).
- **Bulk actions:** Checkbox on each content card. "Select all on page" checkbox in header. When 1+ items selected, bulk action bar appears above the list:
  - "Delete selected" (confirmation modal: "Delete X items? This cannot be undone.")
  - "Archive selected" (moves to Archived status)
  - "Export selected" (downloads as ZIP of Markdown files, Business tier only)
  - Selection count displayed: "3 items selected"

**User actions:** Filter, search, paginate, select items, perform bulk actions, favorite, open content editor, change status, export/download, publish to WordPress, view performance metrics, review items in queue.
**Data in:** `content_items`, `agent_jobs`, scan correlation data.
**Data out:** Status updates, WordPress publish events, export downloads, bulk delete/archive operations.
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
  - Intelligence: Competitor Intelligence, Review Analyzer, Citation Builder, Brand Narrative Analyst, Recommendations (system)
  - Conversational: Ask Beamix
  - NEW agents (gap closure):
    - **Content Voice Trainer** -- trains on business's existing website content to match their writing style
    - **Content Pattern Analyzer** -- analyzes top-cited content in your niche, extracts winning patterns
    - **Content Refresh Agent** -- audits published content for staleness, suggests or auto-applies updates
- **Usage meter:** "8/15 agent uses this month" with bar + top-up CTA
- **Recurring Executions Panel** (NEW -- gap closure): shows scheduled/recurring agent runs (e.g., "Content Refresh runs monthly on your published articles")
- **Automation Toggles (MVP):** 4 pre-built workflow cards, each with ON/OFF toggle and simple config:
    1. "Visibility Drop Response" — trigger threshold: 10%/15%/20% dropdown
    2. "New Content Lifecycle" — auto-audit published content after 30 days
    3. "Competitor Alert Response" — auto-analyze when a competitor overtakes you
    4. "Onboarding Sequence" — runs automatically on signup (always on)
- **Agent Workflow Builder (Phase 3 — deferred):** Visual chain builder connecting events to agent actions. Deferred to post-launch; MVP uses pre-built toggles above. Will be built only if user demand validates the need for custom workflows.

**Agent card states:**

| State | Visual | Copy |
|-------|--------|------|
| **Loading** | Skeleton card: gray placeholder for icon, name, description, and button. Subtle shimmer animation. | — |
| **Available** | Full card with agent info, tier badge, "Run" button (primary style). | "Run" button label |
| **Running** | Card shows progress indicator (spinning icon) + current step name. "Run" button replaced with "Running..." (disabled, secondary style). | Step name updates: "Researching competitors...", "Generating content...", "Quality checking..." |
| **Completed** | Card shows green check + "Last run: 2 hours ago." "Run" button returns to available state. | "Run Again" button label |
| **Error** | Card shows red warning icon + error message (1 line). Retry button appears. | "Something went wrong. [Retry]" |
| **Unavailable** | Card shows gray overlay + clock icon. | "Agent temporarily unavailable. Usually back within a few minutes." |
| **Locked (wrong tier)** | Card shows lock icon overlay. Description visible but dimmed. | "Available on Pro plan. [Upgrade]" |

**User actions:** Launch agent, view past runs, set up recurring schedules, toggle automations, upgrade tier for locked agents, buy top-ups.
**Data in:** Agent configuration, `agent_jobs`, `credit_pools`, automation settings.
**Data out:** Agent trigger events, automation toggle updates.
**Connects to:** Agent Chat (individual agent run), Content Library (outputs), Billing (top-ups/upgrades).

---

### 2.14 Dashboard: Agent Chat

**URL:** `/dashboard/agents/[agentType]` (slug, e.g., `content-writer`, `faq`, `competitor-intelligence`)
**Purpose:** Interactive, real-time agent execution with streaming output.

> **URL parameter:** `agentType` is a string slug matching the agent's machine name (e.g., `content-writer`, `blog-writer`, `schema-optimizer`, `faq`, `review-analyzer`, `social-strategy`, `competitor-intelligence`, `citation-builder`, `llms-txt`, `ai-readiness`, `ask-beamix`, `voice-trainer`, `pattern-analyzer`, `content-refresh`, `brand-narrative`). This is NOT a database UUID. To view a specific past run, use `/dashboard/agents/[agentType]/run/[job_id]`.

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

### 2.17 Dashboard: Empty States (MAJ-9)

Every dashboard page has an empty state shown when the user has no data for that section. Pattern: centered illustration/icon + headline + description (1 sentence) + primary CTA button.

| Page | Icon/Illustration | Headline | Description | CTA Button | CTA Action |
|------|-------------------|----------|-------------|------------|------------|
| **Overview** | Bar chart with magnifying glass | "See how AI engines see your business" | "Run your first scan to get your visibility score and AI readiness report." | "Run First Scan" | Navigate to `/scan` or trigger manual scan |
| **Rankings** | Podium / ranking list | "Track your AI search rankings" | "After your first scan, you'll see how you rank across every AI engine." | "Run First Scan" | Navigate to `/scan` |
| **Agents Hub** | Robot with wrench | "AI agents that do the work for you" | "Run an agent to generate content, optimize your site, or analyze competitors." | "Explore Agents" | Scroll to agent cards or open first recommended agent |
| **Content Library** | Document with sparkle | "Your AI-optimized content lives here" | "Content created by agents appears here. Edit, publish, or save for later." | "Create First Content" | Open Content Writer agent (A1) |
| **Competitive Intelligence** | Binoculars / spy glass | "Know what your competitors are doing" | "Add competitors to track how they rank across AI engines compared to you." | "Add Competitor" | Open competitor add modal |
| **Analytics** | Line chart trending up | "Track your visibility over time" | "After 2+ scans, you'll see trends, improvements, and alerts here." | "View Scan Schedule" | Navigate to settings or scan page |
| **AI Readiness** | Checklist with checkmarks | "How AI-ready is your website?" | "Run an AI readiness audit to get a detailed improvement roadmap." | "Run AI Audit" | Trigger A11 (AI Readiness Auditor) |
| **Alerts** | Bell with plus | "Never miss a visibility change" | "Set up alerts for ranking drops, competitor moves, or scan completions." | "Create First Alert" | Open alert creation form |
| **Credits** | Coin stack | "Your agent credits" | "Credits are used when agents run. Your monthly allocation refreshes on your billing date." | "View Plans" | Navigate to `/pricing` (if no plan) or show allocation (if has plan) |

**Design Rules:**
- Illustration: Simple line art or icon, monochrome with brand accent color. Max 120x120px.
- Headline: Bold, 20-24px, max 8 words.
- Description: Regular weight, 14-16px, max 20 words. No jargon.
- CTA: Primary button style (brand color). Single CTA per empty state.
- Layout: Vertically centered in the content area. No sidebar changes.
- Transition: Empty state disappears permanently once the page has data. No animation — just replaced by real content on next load.

---

### 2.18 Dashboard: Settings (4 Tabs)

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
**What the user sees:** Integration cards -- WordPress (Pro+), GA4 (Pro+), Google Search Console (Pro+), Slack (Pro+), Cloudflare (Business), Public API (Business). Each shows: connected/disconnected status, connect button, configuration options. Looker Studio card shows "Coming Soon — Growth Phase" with description: "Connect via REST API in the meantime."

**Integration readiness triggers:**

| Integration | Shows as "Connected" when | Shows as "Not Connected" when | Shows as "Coming Soon" when |
|-------------|--------------------------|-------------------------------|----------------------------|
| GA4 | `integrations` row exists with `type = 'ga4'` and valid `ga4_credentials` for this business | Row missing or credentials expired/revoked | Never — always available for Pro+ |
| Google Search Console | `integrations` row exists with `type = 'gsc'` and valid `gsc_credentials` for this business | Row missing or credentials expired | Never — always available for Pro+ |
| WordPress | `integrations` row exists with `type = 'wordpress'` and valid `wordpress_credentials` for this business | Row missing or credentials invalid | Never — always available for Pro+ |
| Slack | `integrations` row exists with `type = 'slack'` and valid `webhook_url` for this business | Row missing or webhook invalid | Never — always available for Pro+ |
| Cloudflare | `integrations` row exists with `type = 'cloudflare'` and valid API token | Row missing or token invalid | Never — always available for Business |
| Public API | At least one `api_keys` row exists for this user | No API keys generated | Never — always available for Business |
| Looker Studio | — | — | Always "Coming Soon" until native connector is built and deployed in Growth Phase |

**User actions:** Connect/disconnect integrations, configure settings, generate API keys (Business tier).
**Data:** `integrations`, `api_keys`.

**Connects to:** Billing (Paddle portal), all dashboard pages (settings affect display).

---

### 2.19 Dashboard: Notifications

**URL:** `/dashboard/notifications`
**Purpose:** View and manage all alert notifications. Accessible via the notification bell icon in the sidebar.

**What the user sees:**
- **Notification list** (newest first): each notification displays:
  - Type icon (color-coded by severity): visibility drop (red down-arrow), improvement (green up-arrow), competitor (blue binoculars), sentiment (purple chart), scan/agent complete (blue check), credit warning (yellow coin), trial (red clock)
  - Title (e.g., "Visibility dropped 18% on ChatGPT")
  - Description (1-2 sentences of context, e.g., "Your visibility score for 'best plumber in Tel Aviv' dropped from 72 to 54 after last scan.")
  - Timestamp (relative: "2 hours ago", "Yesterday", "March 3")
  - "View details" link — navigates to the relevant dashboard page (Rankings for visibility alerts, Competitors for competitor alerts, Agent Hub for agent alerts, Settings > Billing for trial/credit alerts)
  - Unread indicator (blue dot, left side)
- **Filter bar:** All | Unread | By type dropdown (Visibility Change, Sentiment Shift, Competitor Alert, Scan Complete, Agent Complete, Credit Warning, Trial)
- **Mark all as read** button (top right, enabled when unread notifications exist)
- **Notification preferences** link at bottom: "Manage notification settings" links to Settings > Preferences tab

**Empty state:** Bell icon + "No notifications yet" + "Notifications appear when your visibility changes, agents complete, or competitors make moves." + "Set Up Alerts" CTA linking to Settings > Preferences.

**User actions:** Read notifications, filter by type/status, mark all as read, click through to relevant pages, navigate to notification preferences.
**Data in:** `notifications` table, filtered by `user_id`, ordered by `created_at DESC`.
**Data out:** Mark-as-read updates (`notifications.read_at`).
**Connects to:** All dashboard pages (via "View details" links), Settings > Preferences (notification config).

---

### 2.20 Post-Trial Experience (CRIT-7)

**What happens when the 7-day trial expires without payment:**

| Phase | Duration | Access Level | UI State |
|-------|----------|-------------|----------|
| **Active Trial** | Days 1-14 | Full access | Normal dashboard with trial countdown banner |
| **Grace Period** | Days 15-44 (30 days) | Read-only dashboard | Yellow banner: "Your trial has ended. Subscribe to continue using Beamix." All action buttons disabled (scans, agents, content creation). Data visible but not actionable. |
| **Lockout** | Days 45-134 (90 days) | Login only, no dashboard | Red banner: "Your account is locked. Subscribe to restore access." Data retained but hidden. |
| **Data Deletion** | Day 135+ | N/A | Account and all data permanently deleted per GDPR. |

**Re-activation:** User can subscribe at ANY point during grace/lockout to instantly restore full access with all data intact.

**Email triggers:**
- 3 days before trial ends: "Your trial ends in 3 days" (N9 alert)
- Day trial expires: "Your trial has ended — here's what you'll lose"
- 14 days after expiry: "Your data is still here — reactivate now"
- 25 days after expiry: "Final warning — account lockout in 5 days"

**Auth middleware behavior:** Check `subscriptions.status` and `trial_ends_at`. If expired and no active plan: allow dashboard routes but inject `readOnly: true` into page props. Block all POST/PATCH/DELETE API routes except billing endpoints.

#### Trial Expired State — Per-Page Behavior

**Global elements (all dashboard pages during grace period):**
- Persistent yellow banner at top of every page: "Your trial has ended — upgrade to keep access." [Upgrade Now] button in banner.
- All data remains visible (read-only) for the 30-day grace period.
- Sidebar navigation works normally — user can browse all pages.

| Page | What remains visible | What is disabled | Disabled element behavior |
|------|---------------------|-----------------|--------------------------|
| **Overview** | All widgets, scores, charts, trend data (last snapshot) | "Run Scan" button, "Run Agent" buttons on recommendations, quick actions in sidebar | Disabled buttons show tooltip: "Upgrade to run scans and agents" |
| **Rankings** | Full rankings table, filters, expandable rows, citations, persona filter | CSV export button | Tooltip: "Upgrade to export data" |
| **Recommendations** | All recommendation cards visible with impact levels and evidence | "Run Agent" buttons on each card, status change actions (dismiss, mark in progress) | Agent buttons show tooltip: "Upgrade to run agents." Cards are read-only. |
| **Content Library** | All content items visible, filterable, searchable | "Create" button, status change actions, publish button, delete, editorial queue actions | Tooltip: "Upgrade to manage content" |
| **Agent Hub** | All agent cards visible with descriptions and last run info | All "Run" buttons, automation toggles, schedule configuration, top-up CTA | Run buttons show tooltip: "Upgrade to run agents." Usage meter shows "Trial ended." |
| **Agent Chat** | Previous conversation history visible (read-only scroll) | Input form, "Run Agent" button, all action bar buttons | Message at top of chat: "Your trial has ended. Upgrade to run agents and create new content." |
| **Competitors** | Competitor list, share of voice, comparison table, gap analysis | "Add Competitor" button, "Run Analysis" buttons | Tooltip: "Upgrade to manage competitors" |
| **AI Readiness** | Last audit scores and breakdown visible | "Run Full Audit" button, "Fix" buttons on recommendations | Tooltip: "Upgrade to run audits" |
| **Settings — Billing** | **Fully functional** — this is the upgrade path | Nothing disabled | Paddle checkout, plan selection, payment method update all work normally |
| **Settings — Business** | Current values visible | All edit fields and save button | Fields are grayed out. Note: "Upgrade to update your business profile." |
| **Settings — Preferences** | Current preferences visible | All toggles and save button | Grayed out with same upgrade note |
| **Settings — Integrations** | Connection status visible | Connect/disconnect buttons, configuration | Tooltip: "Upgrade to manage integrations" |

### 2.21 Account Deletion Flow (MAJ-7 — GDPR)

**Trigger:** Settings > Account > "Delete My Account" button (red, bottom of page).

**Flow:**

| Step | What Happens | UI |
|------|--------------|----|
| 1. Click "Delete Account" | Confirmation modal appears | Modal: "This will permanently delete your account and all data after 30 days. This cannot be undone." |
| 2. Type "DELETE" to confirm | User types the word DELETE in an input field | Input field + disabled "Confirm Deletion" button (enabled when text matches) |
| 3. Submit | API call `POST /api/settings/delete-account` | Loading spinner, then redirect to `/goodbye` |
| 4. Immediate effects | Account deactivated: can't log in, all sessions invalidated, Paddle subscription cancelled | Email: "Your account has been scheduled for deletion" |
| 5. 30-day grace period | Data retained but inaccessible. User can email support to cancel deletion. | Support email link in confirmation email |
| 6. Day 31: Purge | Background job permanently deletes all user data | Final email: "Your data has been permanently deleted" |

**What Gets Deleted (Day 31):**
- `user_profiles`, `businesses`, `scans`, `scan_results`, `scan_engine_results`
- `content_items`, `agent_jobs`, `recommendations`, `alert_rules`
- `credit_pools`, `credit_transactions`, `notification_preferences`
- Voice profiles, tracked queries, competitor data

**What Gets Retained (legal):**
- `subscriptions` and `invoices` records — retained 7 years for tax/legal compliance (anonymized: user_id replaced with hash, name/email removed)
- Aggregate analytics (non-PII): total scans run, agents used — for internal metrics only

**Cancel Deletion:** User emails support within 30 days → admin endpoint `POST /api/admin/cancel-deletion` reactivates account.

**Auth Middleware:** Check `user_profiles.deleted_at`. If not null → reject all routes, return 403 with "Account scheduled for deletion" message.

---

### 2.22 Pricing Page

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

### 2.23 Blog

**URL:** `/blog` and `/blog/[slug]`
**Purpose:** SEO + thought leadership + education about GEO.

**What the user sees:**
- Blog index: grid of posts with cover image, title, category, date, read time, author name
- Blog post: full article with table of contents, author info, related posts, CTA to free scan
- Categories: GEO, AI Search, Case Studies, Product Updates, Guides

**Author spec:** Blog posts are authored by the Beamix team (human-written). The Blog Writer agent (A2) generates content for the *user's own website*, not the Beamix public blog.
- `author_name` (string): Display name of the author (e.g., "Adam K.")
- `author_role` (string): Role or title (e.g., "Founder, Beamix" or "GEO Research Lead")
- Author info displayed below the post title: avatar placeholder + name + role
- No AI-generated blog posts in the public blog — all content is human-written and editorially reviewed

**User actions:** Browse, read, share, click CTA to scan.
**Data in:** `blog_posts` table (includes `author_name`, `author_role` columns).
**Data out:** Free scan CTA clicks.
**Connects to:** Free Scan, Landing page.

---

### 2.24 About Page

**URL:** `/about`
**Purpose:** Company story, team, mission.

**What the user sees:** Company narrative, team section (if applicable), mission statement, press mentions.
**User actions:** Navigate to other pages.
**Connects to:** Landing, Blog, Pricing.

---

### 2.25 Terms of Service

**URL:** `/terms`
**Purpose:** Legal terms. Static page.

---

### 2.26 Privacy Policy

**URL:** `/privacy`
**Purpose:** Privacy policy. Static page. GDPR compliance information.

---

### 2.27 API Documentation (Future)

**URL:** `/docs/api`
**Purpose:** Public API reference for Business tier users.

**Page structure:**
1. **Overview** — What the Beamix API provides, who it's for (Business tier), base URL (`https://api.beamix.io/v1`), versioning policy.
2. **Authentication** — API key in `Authorization: Bearer <api_key>` header. Key generation in Settings > Integrations. Scopes: `read` (GET endpoints), `write` (POST/PATCH), `execute` (agent triggers). Keys are shown once on creation and stored as hashed values.
3. **Endpoints by category:**
   - **Scan** — `GET /v1/scans`, `GET /v1/scans/:id`, `POST /v1/scans` (trigger manual scan)
   - **Agents** — `GET /v1/agents`, `POST /v1/agents/:type/run`, `GET /v1/agents/jobs/:id`
   - **Business** — `GET /v1/business`, `PATCH /v1/business`, `GET /v1/business/competitors`
   - **Reports** — `GET /v1/reports/visibility`, `GET /v1/reports/rankings`, `GET /v1/reports/content`
4. **Rate limits** — 100 requests/minute per API key. 429 response with `Retry-After` header. Rate limit headers on every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
5. **SDK / Example code** — cURL examples for every endpoint. JavaScript/TypeScript SDK snippet (future). Response format: JSON with consistent error schema (`{ error: { code, message, details } }`).

**Content generation:** Auto-generated from OpenAPI spec file. Rendered with a static docs framework (e.g., Mintlify or custom Next.js page).

**What the user sees:** Interactive endpoint explorer with request/response examples, copy-to-clipboard code blocks, try-it-out sandbox (future).
**User actions:** Read docs, copy code examples, navigate to API key generation in settings.
**Connects to:** Settings (API key management).

---

## 3. Feature Inventory (Complete)

### 3.1 Scan Engine Module (12 features)

| # | Feature | What It Does | Where It Lives | Data Needed | Connections |
|---|---------|-------------|---------------|-------------|-------------|
| S1 | Free Scan | URL + name + industry + location --> 3 engines (ChatGPT, Gemini, Perplexity) x 3 prompts --> visibility score, per-engine ranking, AI readiness score, competitor callout. Shareable URL 30 days. | `/scan`, `/scan/[scan_id]` | Business input, LLM responses | Signup (conversion), Onboarding (import) |
| S2 | AI Readiness Score | 0-100% scoring across 5 categories. Computed as part of free scan. Shareable card. | Free scan results, AI Readiness dashboard | Website crawl data (cheerio) | Free Scan, AI Readiness page |
| S3 | Multi-Engine Scanning | Query 4/8/10+ AI engines by tier. Free: ChatGPT, Gemini, Perplexity, Bing Copilot. Pro adds: Claude, Grok, You.com, Google AI Overviews (**Phase 3 — no stable API available at launch; will be added when browser simulation layer is built**). Business: all Pro engines + future engines. | Background (Inngest), Results in Rankings | Engine API responses | Rankings, Overview |
| S4 | Scheduled Scans | Automated: weekly (Starter), every 3 days (Pro), daily (Business). Inngest cron. | Background | `businesses`, `tracked_queries`, `subscriptions` | Rankings, Alerts, Recommendations |
| S5 | Manual Scan Trigger | On-demand re-scan. Rate-limited per tier (1/week, 1/day, 1/hour). | Dashboard Overview (button) | Current scan data | Rankings |
| S6 | Prompt Auto-Generation | Auto-generate 3-8 industry/location-specific prompts per business. **Auto-suggestions (suggesting prompts based on platform trends) is a Growth Phase feature** — requires ~500+ scans in a category before volume data is meaningful. Launch version uses rule-based generation from industry + location + services. | Scan pipeline (internal) | Business profile, industry, location | Scan execution |
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

### 3.3 Agent System Module (16 agents)

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

#### New Agents (4 -- Closing Competitive Gaps)

| # | Agent | What It Does | Where It Lives | Data Needed | Connections |
|---|-------|-------------|---------------|-------------|-------------|
| A13 | Content Voice Trainer (NEW) | Analyzes business's existing website content + past edits to learn their writing voice. Produces a "voice profile" that all content agents use. Inspired by Goodie's Author Stamp. | Agent Hub, Settings (voice training section) | Website URL (crawl existing content), past content edits in Content Library | All content agents (A1, A2, A5, A7) use trained voice |
| A14 | Content Pattern Analyzer (NEW) | Analyzes top-cited content in user's niche. Extracts structural/tonal patterns that make content get cited by AI. Produces a "citation playbook." Inspired by Spotlight. | Agent Hub, Agent Chat | Scan results (cited URLs), Perplexity research on top content | Content Writer, Blog Writer (use patterns in generation) |
| A15 | Content Refresh Agent (NEW) | Audits existing published content for staleness. Identifies outdated facts, broken links, missing queries. Suggests updates or auto-generates refreshed versions. Can run on a schedule (monthly). Inspired by Profound Workflows. | Agent Hub, Content Library (refresh indicators) | `content_items` (published), latest scan results, current web data | Content Library, Content Editor |
| A16 | Brand Narrative Analyst (NEW) | Analyzes WHY AI says what it says about the business. Deep narrative extraction across all engine responses: positioning themes, factual gaps, misperceptions, competitor framing. Produces a "Brand Narrative Report" with actionable reframing strategies. Pro+ tier. | Agent Hub (Intelligence category), Agent Chat, Rankings (narrative panel) | All raw LLM responses for business across scans, competitor scan data, business profile | Recommendations, Content Writer (narrative-aligned content), Competitive Intel |

#### A16: Brand Narrative Analyst (NEW) — Full Spec

**Purpose:** Understand the narrative AI engines have built about your business — and how to change it.

**Input Form:**
- Business (auto-selected, or dropdown if multiple)
- Focus area (optional): "pricing perception," "expertise reputation," "comparison framing"
- Competitor to compare (optional): select from tracked competitors

**Streaming Phases:**
1. "Collecting AI responses..." — Gathers all recent scan data for the business
2. "Analyzing narrative patterns..." — Opus identifies recurring themes, positioning, factual claims
3. "Comparing competitor framing..." — How AI positions you vs competitors
4. "Generating reframing strategy..." — Sonnet produces actionable recommendations
5. "Quality review..." — GPT-4o cross-model QA

**Output Format:**
- **Narrative Summary** — 2-3 paragraph overview of how AI perceives the business
- **Theme Analysis** — Table of recurring themes (positive, neutral, negative) with frequency
- **Factual Accuracy** — List of claims AI makes, flagged as accurate/inaccurate/outdated
- **Competitor Framing** — How AI positions you relative to competitors (side-by-side)
- **Reframing Strategy** — 5-8 specific content/messaging changes to shift the narrative
- **Priority Actions** — Top 3 actions with "Fix with Agent" buttons (A1, A2, A5)

**Agent Hub Card:**
- Icon: magnifying glass + speech bubble
- Tagline: "Understand why AI says what it says about you"
- Category: Intelligence
- Credit cost: 1

**Connections:** Feeds into Recommendations (narrative-based priorities), Content Writer (narrative-aligned topics), Competitive Intelligence (narrative gap analysis).

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
| I1 | WordPress | Publish content directly to WordPress as draft. REST API + Application Passwords. | Pro+ | Content Editor --> WP REST API --> WP post (draft) |
| I2 | GA4 | AI traffic attribution. Identify visits from AI referral domains. Correlate visibility with traffic. | Pro+ | GA4 API --> daily fetch --> analytics_snapshots --> Attribution dashboard |
| I3 | Google Search Console | Keyword ranking data from traditional search. Correlate with AI visibility. Feed into prompt generation. | Pro+ | GSC API --> keyword data --> scan prompt improvement, dual-visibility view |
| I4 | Slack | Push alerts to Slack channel. Incoming webhook (Phase 1), full app (Phase 2). | Pro+ | Alert pipeline --> Slack webhook --> formatted Block Kit message |
| I5 | Cloudflare/Vercel | AI crawler detection. Which AI bots visit which pages. | Business | CDN analytics API --> crawler data --> AI Readiness dashboard |
| I6 | Looker Studio | **Intentionally deferred.** Native Looker Studio connector is a post-launch Growth Phase feature. Business tier users can connect via the Public REST API (I7) for custom reporting in the meantime. Deferred because: building a community connector requires maintaining a separate GCP project and data schema mapping that is not justified before validating Business tier demand. | Business (deferred) | — |
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
| B2 | Trial Management | 7-day free trial with 5 agent credits. Clock starts on first dashboard visit. Full Pro features during trial. | Onboarding, Settings > Billing |
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
   --> "Welcome" banner: "Your 7-day trial (5 agent credits) is active. Run your first agent!"
   --> Top recommendation: "Add FAQ content for your top query" with [Run Agent] button

6. FIRST AGENT RUN
   --> Clicks [Run Agent] on FAQ recommendation
   --> Arrives at Agent Chat (/dashboard/agents/faq)
   --> Sees pre-filled topic from recommendation
   --> Clicks "Run Agent"
   --> Watches streaming output (30-60 seconds): researching, outlining, writing
   --> Reviews generated FAQ content
   --> Saves to Content Library

7. CONVERSION MOMENT (within 7 days)
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
   --> Connects custom dashboard via REST API (Looker Studio native connector deferred to Growth Phase)
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

**UI Element: Floating Chat Bubble**

Ask Beamix is accessible from every dashboard page via a persistent floating chat bubble in the bottom-right corner.

| State | Behavior |
|-------|----------|
| **Collapsed (default)** | Circular button (48x48px) in bottom-right corner, 24px from edges. Beamix logo or chat icon. Subtle pulse animation on first visit to draw attention. Badge shows unread suggested questions count. |
| **Expanded** | Click bubble → chat panel slides up (400px wide × 520px tall). Panel overlays dashboard content, does not push/resize it. Semi-transparent backdrop on mobile. |
| **Active conversation** | Chat messages with SSE streaming. User input at bottom. "Suggested questions" chips above input based on current page context. Typing indicator while AI responds. |
| **Minimized** | Click X or click outside → panel collapses back to bubble. Conversation preserved — reopening shows full history. |
| **Page-aware context** | Bubble knows which dashboard page the user is on. On Rankings page: suggests "Why did my visibility drop?" On Agents page: suggests "Which agent should I run next?" |

**Panel Layout (top to bottom):**
1. Header: "Ask Beamix" + minimize button (X)
2. Chat messages area (scrollable): AI messages with data citations (clickable links to dashboard sections), user messages right-aligned
3. Suggested question chips (2-3, contextual to current page)
4. Input field: placeholder "Ask about your data..." + send button

**Responsive behavior:**
- Desktop (>1024px): 400×520px panel, bottom-right overlay
- Tablet (768-1024px): 360×480px panel, same position
- Mobile (<768px): Full-screen takeover with back button to return to dashboard

**User sees when chatting:**
- User types questions: "Why did my visibility drop last week?", "Which competitor is growing fastest?", "What content should I write next?"
- SSE streaming responses with data citations
- Suggested follow-up questions after each response

**Input:** Natural language questions.
**Output:** Natural language answers with specific data references.
**Where output lives:** Not stored — real-time conversation only. (Future: save conversation threads.)
**Connections:** Reads all dashboard data: scan results, rankings, competitors, content, agent history.
**Cost:** No credits consumed. Included in all paid tiers. Rate limited to 30 turns/hour.

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

> **Phase: Post-Launch (Growth Phase).** MVP ships with the 4 pre-built automation toggles defined in §2.13 only. The visual workflow builder described below is the long-term vision and will ship in Growth Phase after validating core agent usage patterns. Do not build the visual builder for launch.

**Purpose:** Automate multi-agent chains triggered by events.

**What the user sees (Growth Phase):**
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
| Agent System | 12 agents | 4 agents (Voice, Patterns, Refresh, Narrative) + Workflows + Recurring | 16 agents + 2 systems |
| Content Engine | 4 | 6 (Voice Training, Typed Templates, Impact Tracking, WordPress, Editorial Queue, Pattern Library) | 10 |
| Competitive Intelligence | 5 | 1 (Source-Level Citation Comparison) | 6 |
| Alert System | 9 | 0 | 9 |
| Integration Hub | 5 | 2 (Looker Studio [deferred], expanded GSC) | 7 (6 at launch) |
| AI Readiness | 6 | 0 | 6 |
| Settings | 6 | 0 | 6 |
| Billing | 5 | 0 | 5 |
| **Total** | **74** | **17** | **91+ features, 16 agents** |

Every gap identified in the CTO's analysis is addressed above. The product layer now covers: Content Performance Tracking (C7), Content Voice Training (A13/C5), Typed Content Templates (C6), Agent Workflows, Recurring Agent Execution, Prompt Volume Data (S11/D14), Source-Level Citation Analytics (S8/CI5), Brand Narrative Analysis (S12), Persona-Based Tracking (D3 persona filter), Customer Journey Stage Mapping (Recommendations journey tags), Content Pattern Analysis (A14/C10), and Editorial Queue (C9).

---

> **This is the definitive product layer for Beamix.**
> Every page, every feature, every user journey, every agent. No code. No pricing. No timelines.
> All competitive gaps closed. Ready for engineering handoff.

---

## Phase 2 & 3 Product Expansions (March 2026)

> **Source:** Feature planning sprint March 8, 2026. Full engineering specs in `docs/04-features/specs/new-features-batch-[1-3]-spec.md`. 10 of 11 features approved to build.

### Updated Feature Count (Post March 2026)

| Module | Phase 1 Total | Phase 2 & 3 New | Grand Total |
|--------|--------------|-----------------|-------------|
| Scan Engine | 12 | +3 (F9 refresh, F10 regions, F11 GSC) | 15 |
| Dashboard & Analytics | 14 | +3 (F3 clustering, F4 explorer, F10 region filter) | 17 |
| Agent System | 16 agents + 2 systems | +0 agents (existing handle new tasks) | 16 agents |
| Content Engine | 10 | +1 (F2 comparison tool) | 11 |
| Competitive Intelligence | 6 | +2 (F5 auto-suggest, F7 mentions) | 8 |
| Web Presence | 0 | +2 (F1 crawler feed, F7 mention tracking) | 2 |
| Browser Simulation | 0 | +1 (F6 — 3 new engines) | 3 engines |
| **Total** | **91+ features** | **+12 new features** | **103+ features, 16 agents** |

---

### F1: AI Crawler Feed (Pro+)

**New page:** `/dashboard/crawler-feed`

**What users see:**
- Timeline of AI bot crawl activity: which bots visited, which pages, how recently
- Bot cards: GPTBot, ClaudeBot, PerplexityBot, GoogleBot-Extended, Anthropic Bot
- "Pages not crawled" warning list — key pages the business owner should prioritize for AI discoverability
- Weekly summary card: Haiku-generated plain-English summary of crawl trends
- Alert when key pages have had 0 AI bot crawls in 14+ days

**Setup flow:**
- First visit → setup modal: choose connection method (Cloudflare OAuth / Vercel OAuth / Script snippet)
- Script snippet: copy-paste `<script>` tag into site `<head>`
- Cloudflare/Vercel: OAuth flow → read-only log access granted

**Empty state:** "Connect your website to see which AI bots are discovering your content — and which pages they're missing."

**Connections:** Alerts system, Settings → Integrations (shows connection status)
**Tier gate:** Pro and Business. Starter sees a "Pro feature" lock with upgrade CTA.

---

### F2: Content Comparison Tool (All paid tiers)

**Added to:** Content Editor (`/dashboard/content/[id]`)

**What users see:**
- New "Compare Versions" button in the content editor toolbar
- Side-by-side diff view: original content (left) vs. current AI-optimized version (right)
- Highlighted diffs: additions in green, removals in red, unchanged in gray
- "What changed?" summary: character count, word count delta, key phrase additions
- Optional "Explain this change" button: on-demand Haiku call that explains the reasoning behind each major change in plain language (~$0.002/click)

**Implementation:** Client-side diff rendering using a Markdown diff library (no LLM calls for the base diff view). The "Explain" button is the only LLM touchpoint.

**Connections:** `content_versions` table (already exists), Content Library, Content Editor.
**Tier:** All paid tiers. Free scan users cannot access content editor.

---

### F3: Topic/Query Clustering (Pro+)

**Added to:** Rankings page (`/dashboard/rankings`)

**What users see:**
- Queries grouped into labeled clusters in the sidebar or as collapsible groups in the table
- Cluster labels auto-generated: "Pricing Queries," "Location Queries," "Review Queries," "Service Discovery Queries"
- Click cluster → filter table to show only those queries
- Cluster count badge: "7 queries" next to each cluster label
- "Unclustered" catch-all group for newly added queries awaiting classification

**Auto-clustering flow:**
- New query added → classified into cluster within seconds (Inngest async)
- Monthly re-cluster: clusters reorganize as query set grows — user sees "Your query clusters were updated" notification

**Empty state (< 5 queries tracked):** Clustering UI hidden; shown only when 5+ queries tracked.

**Connections:** `tracked_queries` table, `query_clusters` table (new), Rankings filter system.
**Tier:** Pro and Business. Starter sees standard list view (no clustering).

---

### F4: Conversation Explorer (Pro+)

**New page:** `/dashboard/explore`

**What users see:**
- Industry query landscape: "What are people asking AI about [your industry] in [your city]?"
- Grid of query cards with estimated relative volume (Low / Medium / High)
- "+ Track This Query" button on each card → adds to `tracked_queries`
- Pro tier: LLM-generated landscape, refreshed weekly
- Business tier: Live exploration mode — enter any topic → real-time Perplexity results

**Pro tier UI:**
- Pre-loaded landscape of 20-30 queries based on business type + location
- "Refresh landscape" button (limited: 4/month)
- Last updated timestamp

**Business tier UI:**
- Live search bar: "What do people ask about ___?"
- Real-time streaming results as Perplexity searches
- Recent explorations history (last 10 sessions)

**Privacy note (shown in UI):** "This view shows industry-wide patterns, not data from other Beamix users."

**Empty state:** "Discover what potential customers are asking AI about your industry — and start tracking the queries that matter."

**Connections:** `tracked_queries`, Rankings page (queries flow directly in), Recommendations page (new query discovery → new recommendations).
**Tier:** Pro (LLM-generated), Business (live Perplexity mode)

---

### F5: Auto-Suggest Competitors (All tiers — onboarding enhancement)

**Added to:** Onboarding Step 3 (Competitors step) + Settings → Competitive Intelligence

**What users see in onboarding:**
- After entering business type and location, onboarding pre-populates a list of 5-10 suggested competitors
- Each suggestion shows: business name, city, inferred category
- User checks/unchecks competitors to add to tracking
- "Add more" text input still available for manual additions

**What users see in settings:**
- Settings → Competitive Intelligence tab: "Suggest more competitors" button
- Triggers same pipeline as onboarding, re-runs with updated business profile data

**Implementation:** One Haiku call at onboarding step 3 load (not on button click) — preemptively generated to feel instant. Perplexity used for Israeli businesses (better local business awareness). Cached for 30 days per `(business_type, city)` pair.

**Connections:** `competitors` table, Onboarding flow (Step 3), Settings tabs.
**Tier:** All tiers (it's an onboarding feature). Starter, Pro, Business all benefit.

---

### F6: Browser Simulation Engines (Pro+)

**Not a new UI page** — extends existing scan infrastructure. Results appear in existing Rankings and Recommendations pages.

**What users see:**
- Rankings page: 3 new engine columns: "Bing Copilot," "Google AI Overviews," "Google AI Mode"
- These columns only visible to Pro/Business users
- Starter users see these columns locked with "Pro feature" badge

**How results appear:**
- Same format as API-based engines: visibility score, rank position, mention status, sentiment
- "Browser simulation" badge on these 3 columns (tooltip: "This result is captured via browser simulation — may vary from real user experience")

**Alert integration:** Visibility drop in Copilot/AI Overviews triggers same alert types as other engines.

**Connections:** `scan_engine_results` (3 new engine rows), Rankings page, Recommendations (new action items based on these engines), Alert system.
**Tier:** Pro and Business. Engines not available at Starter.

---

### F7: Web Mention Tracking (All paid tiers)

**Added to:** AI Readiness page (`/dashboard/ai-readiness`) as a new "Web Mentions" tab

**What users see:**
- Feed of web mentions: news articles, blog posts, forum discussions where brand is mentioned
- Each mention card: source name, URL, date, linked vs. unlinked badge, sentiment indicator
- Metrics strip: total mentions this month, linked %, sentiment breakdown
- "Claim unlinked mention" quick action: opens agent to draft outreach email requesting a link
- Filter by: source type (news / blog / forum), date range, sentiment, linked status

**Cadence display:** Shows when next mention scan runs ("Next scan in 2 hours" for Pro; "Updated daily" for Starter)

**Alert integration:** New negative mention → "New Brand Mention" alert in notification bell with severity based on source authority.

**Connections:** `web_mentions` table (new), `alerts` table, AI Readiness page, Alert system, Agent Hub (outreach email agent).
**Tier:** All paid tiers. Cadence: Starter weekly, Pro daily, Business daily + on-demand.

---

### F9: 30-Minute Scan Refresh (Business Tier — scan cadence UI)

**Not a new page** — affects existing scan status displays across the dashboard.

**What Business users see:**
- Dashboard overview: "Last updated: 12 minutes ago" (vs. Starter/Pro: "Last updated: 45 minutes ago")
- Rankings page: freshness badge shows "30-min refresh" for Business tier
- Settings → Billing: scan frequency listed as "Every 30 minutes" under Business plan features
- Pricing page: "30-min scan refresh" listed as a Business-only feature

**Connections:** Scan engine cron (backend), Dashboard overview "last updated" timestamp, Rankings freshness badge, Pricing page feature matrix.
**Tier:** Business only.

---

### F10: City-Level Scanning (Starter: 1, Pro: 5, Business: unlimited)

**Added to:** Rankings page, Settings → Business Profile

**Rankings page — what users see:**
- New "Region" dropdown filter (appears when user has 2+ regions configured)
- Default: shows primary region (business city)
- Switching region: table refreshes to show that city's scan results
- Multi-region comparison view: side-by-side columns (Pro/Business)

**Settings → Business Profile — what users see:**
- New "Scanning Regions" section: list of configured cities
- "Add region" button (within tier limit)
- Each region: label, location modifier, primary toggle, delete button
- Starter: 1 region (shown as "Your primary city — upgrade to Pro to track more cities")

**Empty state for non-primary regions:** "Start tracking [Tel Aviv] — add it to your regions to see how AI engines rank you there."

**Hebrew/RTL note:** City names and location modifiers shown in the UI language (Hebrew or English based on user preference). Location modifiers sent to AI engines in the query language.

**Connections:** `scan_regions` table (new), `scan_engine_results.region_id` (new column), Rankings page, Settings.
**Tier:** Starter 1 region, Pro 5 regions, Business unlimited (soft cap 20).

---

### F11: Prompt Volume Data (Pro+)

**Added to:** Rankings page as a new column

**What users see:**
- "Prompt Volume" column in the Rankings table: shows estimated monthly query volume
- Pro/Business (GSC connected): shows exact GSC search volume for matching queries
- Pro/Business (no GSC): shows internal panel category — Low / Medium / High / Very High
- All tiers: internal panel category visible (as a broad signal)

**GSC connection prompt:**
- Rankings page: banner "Connect Google Search Console to see real query volume data" → links to Settings → Integrations
- Settings → Integrations: Google Search Console OAuth flow (already has an Integrations tab; GSC is a new integration card)

**Connections:** `tracked_queries.prompt_volume_estimate` (new column), Rankings page, Settings → Integrations.
**Tier:** Exact GSC volume: Pro+. Panel categories: all tiers.

---

### F8: Social Platform Monitoring — Rejected (March 2026)

Social monitoring (YouTube/TikTok/Reddit) was evaluated in March 2026 and rejected as out of scope. Social mentions are a different product category from AI search visibility. Do not add social platform pages or UI to Beamix. See Intelligence Layer Phase 2 section for full reasoning.
