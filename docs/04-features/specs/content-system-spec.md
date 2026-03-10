# Content System Feature Specification

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Ready for implementation
> **Priority:** Launch Critical (Content Library + Editor) / Growth Phase (A13, A14, A15, Performance Tracking)
> **Source documents:** `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md`, `_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md`, `_SYSTEM_DESIGN_PRODUCT_LAYER.md`

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Content Library Page](#2-content-library-page-dashboardcontent)
3. [Content Item Data Model](#3-content-item-data-model)
4. [Content Editor Page](#4-content-editor-page-dashboardcontentid)
5. [Content Lifecycle — Technical Flow](#5-content-lifecycle--technical-flow)
6. [Content Voice Training — A13 Integration](#6-content-voice-training--a13-integration)
7. [Content Pattern Analyzer — A14 Integration](#7-content-pattern-analyzer--a14-integration)
8. [Content Refresh Agent — A15 Integration](#8-content-refresh-agent--a15-integration)
9. [Content Performance Tracking](#9-content-performance-tracking)
10. [CMS Publishing Integration — WordPress](#10-cms-publishing-integration--wordpress)
11. [API Routes](#11-api-routes)
12. [Engineering Notes](#12-engineering-notes)

---

## 1. Feature Overview

### 1.1 The Content System as the Output Layer

Beamix's core value proposition is "Competitors show dashboards; Beamix does the work." The content system is where that work becomes tangible. Every AI agent that produces content — Content Writer (A1), Blog Writer (A2), FAQ Agent (A5), Social Strategy (A7), Schema Optimizer (A3), LLMS.txt Generator (A10), Citation Builder (A9) — writes its output into the content system. The content library is the proof that Beamix delivered.

Without the content system, agents produce outputs that disappear into a chat window. With it, every agent output is:
- Stored, versioned, and searchable
- Editable by the user in a Markdown editor
- Publishable directly to WordPress via integration
- Tracked for performance impact — "This blog post improved your ChatGPT position by 2 spots"

### 1.2 The Closed Loop

The content system closes the platform's core loop:

```
Scan (find problems)
  → Diagnose via Recommendations (A4)
  → Fix via Agents (A1, A2, A5, etc.)
  → Content enters Library as draft
  → User reviews in Editor
  → Publish to CMS
  → content/published event emitted
  → Content Lifecycle Workflow triggered
  → A15 runs 30 days later (refresh audit)
  → Scan results correlated with content (performance tracking)
  → Dashboard shows: "This content improved visibility by +18 points"
  → Repeat
```

This loop is what differentiates Beamix from monitoring-only GEO tools (Otterly, SE Visible) and from agents that create content once without measuring impact (most competitors).

### 1.3 The 12 Content Types

The `content_type` column on `content_items` uses an enum with 12 values. Each type serves a different GEO purpose:

| Content Type | DB Value | GEO Purpose |
|---|---|---|
| Article | `article` | General authority content, broad keyword coverage |
| Blog Post | `blog_post` | Long-form citation bait targeting specific AI queries |
| FAQ | `faq` | Directly mirrors conversational AI query patterns |
| Social Post | `social_post` | Amplification, linkable content for AI crawlers |
| Schema Markup | `schema_markup` | JSON-LD structured data (technical output, not prose) |
| LLMS.txt | `llms_txt` | AI-readable site description file |
| Outreach Template | `outreach_template` | Citation builder email templates |
| Comparison Article | `comparison` | Wins "X vs Y" and "best X" AI queries |
| Ranked List | `ranked_list` | Wins "top X" AI queries |
| Location Page | `location_page` | Wins "X in [city]" local AI queries |
| Case Study | `case_study` | Establishes authority and expertise |
| Product Deep-Dive | `product_deep_dive` | Wins product-specific AI queries |

**Why 12 types matter:** Each type requires a distinct LLM prompt structure and output format. A comparison article must be fair and balanced (AI engines penalize self-serving comparisons). A location page must include local schema and geographic references. A ranked list needs a transparent methodology section. Typed templates allow each agent to enforce structural requirements appropriate to the content's GEO purpose.

### 1.4 Why the Content Library Is the Tangible Proof

SMB owners do not trust invisible processes. When an agent runs and produces a 1,800-word blog post that they can read, edit, and publish, the value of Beamix becomes concrete. The content library is the primary retention mechanism: every time a user returns to review or publish content, they re-engage with the platform. Content performance tracking — showing visibility improvements correlated with published content — is the retention mechanism for power users.

---

## 2. Content Library Page (`/dashboard/content`)

### 2.1 What It Shows

The content library lists all content items generated by agents for the user's business. Items are displayed as cards in a grid or list view (user-togglable). Default sort: newest first.

**Card information displayed:**
- Title
- Content type tag (color-coded: article=blue, blog_post=green, faq=yellow, schema_markup=gray, etc.)
- Agent that created it (human-readable: "Content Writer", "Blog Writer", etc.)
- Created date
- Status badge: Draft / Ready for Review / Published / Archived
- Favorite star (toggleable)
- Word count
- If published: visibility impact delta ("+12 pts since published" — from `content_performance`)

### 2.2 Filter Options

All filters are combined with AND logic. Active filters are shown as removable chips above the list.

| Filter | Type | Options |
|---|---|---|
| Content type | Dropdown | All 12 types from enum |
| Agent | Dropdown | All 15 agent types (human-readable names) |
| Status | Multi-select | Draft, Ready for Review, Published, Archived |
| Date range | Date picker | Any range |
| Favorite | Toggle | Show only favorited items |

### 2.3 Search

Full-text search bar at the top of the content list. Searches `content_items.title` and a preview of `content_body`. Debounced 300ms. Clear button resets to full list.

### 2.4 Pagination and Sorting

- 20 items per page
- Page controls: Previous / page numbers / Next
- Total count displayed: "Showing 1-20 of 47 items"
- Sort options: Newest first (default), Oldest first, Last modified, Alphabetical by title

### 2.5 Bulk Actions

Checkbox on each card. "Select all on page" checkbox in header. When 1+ items are selected, a bulk action bar appears:

- **Delete selected** — confirmation modal required ("Delete X items? This cannot be undone.")
- **Archive selected** — moves all selected to `status = 'archived'`
- **Export selected** — downloads ZIP of Markdown files (Business tier only)

Selection count displayed in bar: "3 items selected."

### 2.6 Content Performance Surfacing

For published items, performance data from `content_performance` is displayed directly on the card and in an expanded view:

**Card-level:** Small impact badge — "+18 pts visibility" or "No change detected yet"

**Expanded/detail view:**
- Timeline: publication date marker overlaid on the business's visibility trend chart
- Per-engine impact: "ChatGPT: not mentioned → position 2. Perplexity: position 5 → position 2. Gemini: no change."
- Aggregate: "Visibility for target queries improved 23 points over 30 days"
- Disclaimer: "Visibility changes may reflect multiple factors. This correlation is directional, not causal."

**Aggregate stats at top of library:**
- "Your published content has improved visibility by +18 points across 7 queries" (computed from `content_performance` across all published items)

### 2.7 Editorial Review Queue

Items with `status = 'in_review'` appear highlighted at the top of the list in a "Ready for Review" section. Available actions:
- **Approve** — moves status to `approved`
- **Request Changes** — adds a comment, moves status back to `draft`
- **Reject** — moves to `archived`

MVP editorial queue is single-user (the account owner reviews their own agent-generated content). Multi-person editorial workflows are deferred to the agency tier. See Section 12.3.

### 2.8 Empty State

Shown when the user has no content items:

- Icon: Document with sparkle
- Headline: "Your AI-optimized content lives here"
- Description: "Content created by agents appears here. Edit, publish, or save for later."
- CTA: "Create First Content" → opens Content Writer agent (A1)

---

## 3. Content Item Data Model

### 3.1 `content_items` Table

The central table for the content system. All agent-generated content lands here.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| `user_id` | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Content owner |
| `business_id` | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Associated business |
| `agent_job_id` | uuid | FK → agent_jobs(id) | Which agent execution created this |
| `agent_type` | text | NOT NULL | Agent that generated this — denormalized for filtering (see §3.1.1) |
| `content_type` | text | NOT NULL, CHECK IN ('article', 'blog_post', 'faq', 'social_post', 'schema_markup', 'llms_txt', 'outreach_template', 'comparison', 'ranked_list', 'location_page', 'case_study', 'product_deep_dive') | Content template type |
| `title` | text | NOT NULL | Content title |
| `content_body` | text | NOT NULL | Full content in Markdown format |
| `meta_description` | text | | SEO meta description (150-160 chars target) |
| `content_format` | text | NOT NULL, DEFAULT 'markdown', CHECK IN ('markdown', 'html', 'json_ld', 'plain_text', 'structured_report') | Output format |
| `status` | text | NOT NULL, DEFAULT 'draft', CHECK IN ('draft', 'in_review', 'approved', 'published', 'archived') | Content lifecycle state |
| `language` | text | DEFAULT 'en' | Content language (en or he) |
| `word_count` | integer | | Computed from content_body at insert |
| `tags` | text[] | DEFAULT '{}' | User-assigned tags for organization |
| `published_url` | text | | External CMS URL after publish (WordPress post URL) |
| `published_at` | timestamptz | | When successfully published to CMS |
| `is_favorited` | boolean | DEFAULT false | User bookmarked this item |
| `voice_profile_id` | uuid | FK → content_voice_profiles(id) | Voice profile used during generation |
| `created_at` | timestamptz | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamptz | NOT NULL, DEFAULT NOW() | Auto-updated by trigger |

**Indexes:**
- `idx_content_items_user` on `(user_id, created_at DESC)` — content library listing
- `idx_content_items_biz_type` on `(business_id, content_type)` — filtered views
- `idx_content_items_status` on `(status)` WHERE `status = 'in_review'` — editorial review queue

**RLS:**
- Users can SELECT, UPDATE (title, status, content_body, is_favorited, tags), and DELETE their own content (`user_id = auth.uid()`)
- Only service role can INSERT — content is created by the Inngest agent pipeline, never directly by API route handlers

#### 3.1.1 Why `agent_type` and `content_type` Are Separate Columns

This is a frequently misunderstood design decision. They represent different dimensions:

- **`agent_type`**: which agent ran — `'blog_writer'`, `'content_writer'`, `'faq_agent'`, etc. This answers "who made it."
- **`content_type`**: what kind of content it is — `'blog_post'`, `'comparison'`, `'faq'`, etc. This answers "what is it."

The relationship is not 1:1. The Blog Writer agent (A2) always produces `content_type = 'blog_post'`. But the Content Writer (A1) can produce `content_type = 'article'`, `'comparison'`, `'location_page'`, `'case_study'`, or `'product_deep_dive'` — the user selects the content type at agent launch time. Both columns are needed for filtering: "show me all blog posts" (content_type filter) versus "show me everything the blog writer made" (agent_type filter) are different queries.

**`agent_type` valid values** (matches `agent_jobs.agent_type` CHECK constraint):
```
'content_writer', 'blog_writer', 'schema_optimizer', 'recommendations',
'faq_agent', 'review_analyzer', 'social_strategy', 'competitor_intelligence',
'citation_builder', 'llms_txt', 'ai_readiness', 'content_voice_trainer',
'content_pattern_analyzer', 'content_refresh', 'brand_narrative_analyst'
```

Note: `recommendations`, `ai_readiness`, `content_voice_trainer`, `content_pattern_analyzer`, and `brand_narrative_analyst` do not produce `content_items` rows — their outputs go to `recommendations`, `ai_readiness_history`, `content_voice_profiles`, and `brand_narratives` tables respectively.

### 3.2 Status State Machine

```
draft
  → in_review     (user moves content to review queue)
  → approved      (reviewer approves — ready to publish)
  → published     (successfully published to CMS)
  → archived      (user archived — soft delete)

draft → archived  (user discards draft)
published → archived  (user unpublishes/archives)
in_review → draft  (reviewer requests changes)
in_review → archived  (reviewer rejects)
```

Status transitions are enforced at the API layer (`PATCH /api/content/[id]`). The Zod schema for the PATCH request validates that only valid transitions are accepted.

### 3.3 `content_versions` Table

Immutable append-only version history. A new row is created every time `content_body` changes — either via user edit (PATCH /api/content/[id]) or when A15 (Content Refresh) proposes an updated version.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| `content_item_id` | uuid | NOT NULL, FK → content_items(id) ON DELETE CASCADE | Parent content item |
| `version_number` | integer | NOT NULL | Sequential version counter (1, 2, 3…) |
| `content_body` | text | NOT NULL | Full content at this version — not a diff, full snapshot |
| `edited_by` | text | NOT NULL, DEFAULT 'user', CHECK IN ('user', 'agent', 'system') | Who created this version |
| `change_summary` | text | | Human-readable summary of what changed |
| `created_at` | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_content_versions_item` on `(content_item_id, version_number DESC)`

**RLS:** Users can SELECT versions for their own content items. Service role inserts.

**Version creation logic (in PATCH /api/content/[id]):**
1. Before updating `content_items.content_body`, read the current `content_body`
2. Find the current max `version_number` for this item
3. INSERT a new `content_versions` row with the OLD content_body and version_number + 1
4. Then UPDATE `content_items.content_body` with the new content

This means version 1 is always the original agent output. Version 2 is the first user edit. The current `content_items.content_body` is always the latest version — no join required to display the current content.

**Version restore (via PATCH /api/content/[id]):**
- Request body includes `restore_version_number: integer`
- API reads `content_versions` for that version_number
- Creates a new version entry (with the restored content) — does NOT delete intermediate versions
- Updates `content_items.content_body` to the restored content

### 3.4 `content_performance` Table

Tracks how published content impacts AI visibility over time. One row per content item per scan, populated automatically after every scheduled scan by the scan pipeline.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| `content_item_id` | uuid | NOT NULL, FK → content_items(id) ON DELETE CASCADE | Published content being tracked |
| `business_id` | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Denormalized for query performance |
| `scan_id` | uuid | NOT NULL, FK → scans(id) ON DELETE CASCADE | The scan that generated this measurement |
| `measurement_date` | date | NOT NULL | Date of measurement |
| `visibility_score_before` | integer | | Business's overall visibility score at publication time (baseline snapshot) |
| `visibility_score_after` | integer | | Visibility score at measurement time (this scan) |
| `score_delta` | integer | | Computed: after - before |
| `mention_count_before` | integer | | Engine mentions at publication time |
| `mention_count_after` | integer | | Engine mentions at measurement time |
| `avg_position_before` | numeric(4,1) | | Average rank position at publication |
| `avg_position_after` | numeric(4,1) | | Average rank position at measurement |
| `engines_mentioning` | text[] | | Which engines now mention the business in relation to content topics |
| `created_at` | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_content_perf_item` on `(content_item_id, measurement_date DESC)` — performance timeline per content piece
- `idx_content_perf_biz` on `(business_id, measurement_date DESC)` — all performance data for a business
- UNIQUE on `(content_item_id, scan_id)` — one measurement per content per scan (prevents duplicates on scan retries)

**RLS:** Users can SELECT where `business_id` belongs to them. Service role inserts (populated by scan pipeline step `compute-content-performance`).

**Baseline capture:** When `POST /api/content/[id]/publish` succeeds, the API immediately snapshots the current scan metrics (overall_score, mention counts, avg_position from the most recent `scans` row) and stores them as the baseline `_before` values. All subsequent `content_performance` rows compare against this baseline.

### 3.5 `content_voice_profiles` Table

Stores trained voice profiles generated by A13 (Content Voice Trainer). One or more profiles per business. Content-generating agents inject the default profile into their system prompts.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| `business_id` | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business this voice belongs to |
| `user_id` | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| `name` | text | NOT NULL | Profile name (e.g., "Formal Blog Voice", "Casual Social Voice") |
| `voice_description` | text | NOT NULL | Opus-generated description: tone, sentence structure, vocabulary patterns, formality level |
| `training_sources` | jsonb | NOT NULL, DEFAULT '[]' | Array of `{type, url_or_id, excerpt_count}` — what was analyzed |
| `example_excerpts` | text[] | NOT NULL, DEFAULT '{}' | 5-10 representative text excerpts used as few-shot examples in agent prompts |
| `vocabulary_patterns` | jsonb | DEFAULT '{}' | Extracted patterns: preferred words, avoided words, sentence length distribution, paragraph structure |
| `is_default` | boolean | DEFAULT false | Default voice for this business (injected automatically into all content agents) |
| `created_at` | timestamptz | NOT NULL, DEFAULT NOW() | |
| `updated_at` | timestamptz | NOT NULL, DEFAULT NOW() | Auto-updated by trigger |

**Indexes:** `idx_voice_profiles_biz` on `(business_id)`

**RLS:** Full CRUD for own businesses (`business_id` must belong to `auth.uid()`).

---

## 4. Content Editor Page (`/dashboard/content/[id]`)

### 4.1 Layout

Two-pane layout on desktop:
- **Left pane:** Markdown textarea (editor)
- **Right pane:** Rendered preview

Single-column on mobile (toggle between editor and preview).

### 4.2 Markdown-Only Editor (v1)

The content editor uses a plain Markdown textarea — no rich text (WYSIWYG) editor. This is an intentional product decision. See Section 12.1 for the rationale.

The textarea supports:
- Syntax highlighting (lightweight, not a full IDE)
- Keyboard shortcuts: Cmd/Ctrl+B (bold), Cmd/Ctrl+I (italic)
- Auto-save on blur (debounced PATCH to `/api/content/[id]`)
- Line count display

The live preview panel renders the Markdown using the same renderer used in production content display, so the user sees exactly what the published content will look like.

### 4.3 Metadata Panel

A collapsible panel (sidebar or bottom drawer on mobile) shows:
- Title (editable inline)
- Meta description (editable, character count, 150-160 chars target)
- Content type (read-only — set at creation by agent)
- Agent that created it (read-only)
- Target queries (read-only — from agent input, shows which queries this content should improve)
- Language
- Word count (live, updates as user types)
- Tags (editable, free-form tags)

### 4.4 Version History Sidebar

A sidebar panel (collapsible) shows the full version history:
- List of versions: "Version 1 — Agent (March 1, 2026)", "Version 2 — You (March 3, 2026 at 14:22)"
- Click any version to preview its content in the preview pane (non-destructive — does not update the editor)
- "Restore this version" button on any historical version — triggers the restore flow (creates a new version entry, updates current content)

### 4.5 Voice Match Indicator

If the business has an active `content_voice_profiles` record with `is_default = true`, the editor shows a "Voice Match" indicator — a percentage showing how closely the current content matches the trained voice profile.

This is computed client-side on a debounced interval (every 5 seconds while typing) by sending the current content_body to `/api/content/[id]/voice-match` which runs a lightweight Haiku call comparing the content against the voice profile's `example_excerpts` and `voice_description`.

The indicator is informational only — it does not block saving or publishing.

### 4.6 Status Bar and Action Bar

**Status bar** (top of editor):
Shows current status as a pill badge: Draft / Ready for Review / Published / Archived. Clickable to change status (opens status transition picker).

**Action bar** (bottom of editor):
- **Save Draft** — PATCH /api/content/[id] with current content_body (also auto-saves on blur)
- **Mark Ready for Review** — PATCH status to `in_review`
- **Copy to Clipboard** — copies raw Markdown to clipboard
- **Download** — downloads as .md file (Markdown). HTML and PDF options on roadmap.
- **Publish to WordPress** — if WordPress integration is configured, opens publish modal (see §4.7)

### 4.7 Publish to WordPress Flow

1. User clicks "Publish to WordPress"
2. Modal opens:
   - Shows integration status: "Connected to [site URL]"
   - Option: "Publish as Draft" or "Publish as Live Post"
   - "Publish" confirm button
3. On confirm: `POST /api/content/[id]/publish` with `{ provider: 'wordpress', publish_as: 'draft' | 'publish' }`
4. API decrypts WordPress credentials from `integrations` table, calls WordPress REST API
5. On success:
   - `content_items.status` → `'published'`
   - `content_items.published_url` → WordPress post URL
   - `content_items.published_at` → NOW()
   - Baseline snapshot captured for `content_performance`
   - `content/published` Inngest event emitted
6. On failure: error message in modal ("WordPress authentication failed. Check your integration credentials in Settings.")

### 4.8 Performance Panel (Published Content Only)

For content with `status = 'published'`, an additional panel shows:
- Visibility impact chart: time series of the target queries' visibility scores, with a vertical marker at `published_at`
- Per-engine impact table: before/after positions for each engine
- Aggregate delta: "+23 points over 30 days"
- Last measured: timestamp of most recent `content_performance` row

Data from: `GET /api/content/[id]/performance`

### 4.9 Schema Preview

For content with `content_type = 'schema_markup'` or `content_format = 'json_ld'`, an additional panel renders the JSON-LD as a structured tree view (not raw JSON). This helps the user understand what the schema describes before copying it to their site.

---

## 5. Content Lifecycle — Technical Flow

The complete lifecycle from agent completion to published content and performance measurement:

### Step 1: Agent Completes

The `agent.execute` Inngest function's `finalize` step runs after the QA gate passes (score >= 0.70):
- `credit_transactions` INSERT with `transaction_type = 'confirm'`
- `agent_jobs` UPDATE: `status = 'completed'`, `completed_at = NOW()`
- `content_items` INSERT (service role):
  ```
  {
    user_id, business_id, agent_job_id,
    agent_type,        // from the job
    content_type,      // from agent input_data
    title,             // from agent output
    content_body,      // full Markdown from agent output
    meta_description,  // from agent output
    content_format,    // 'markdown' for prose agents, 'json_ld' for schema
    status: 'draft',
    language,          // from business or agent input
    word_count,        // computed
    voice_profile_id   // if a voice profile was used
  }
  ```
- `content_versions` INSERT: version 1 with `edited_by = 'agent'`

### Step 2: User Notification

After the `content_items` row is inserted:
- In-app notification: INSERT into `notifications` — "Your [Agent Name] has completed. [Content Title] is ready for review." with `action_url = /dashboard/content/[id]`
- Email notification: Resend template `agent-complete` sent if user has `email_enabled = true` in `notification_preferences`

### Step 3: User Reviews in Editor

User opens `/dashboard/content/[id]`. The content loads from `GET /api/content/[id]` which returns:
- The `content_items` row
- All `content_versions` rows for the version history sidebar
- Latest `content_performance` rows (empty at this point — not yet published)

User reads the content, optionally edits in the Markdown textarea. Every save:
- PATCH `/api/content/[id]` with updated `content_body`
- API reads current `content_body`, creates new `content_versions` row (version N), updates `content_items.content_body`

### Step 4: Status Progression

When the user is satisfied:
- Click "Mark Ready for Review" → PATCH status to `in_review`
- In MVP, the same user then reviews their own content queue and clicks "Approve" → PATCH status to `approved`
- Now the content is ready to publish

### Step 5: Publish to CMS

User clicks "Publish to WordPress" in the editor. See §4.7 for the full UI flow.

API route `POST /api/content/[id]/publish`:
1. Zod validates: `{ provider: 'wordpress', publish_as: 'draft' | 'publish' }`
2. Verify user owns this content item
3. Load `integrations` row for `(business_id, provider = 'wordpress')`
4. If no integration: return 400 `{ error: 'WordPress integration not configured' }`
5. Decrypt credentials from `integrations.credentials` using AES-256-GCM
6. Call WordPress REST API: `POST {site_url}/wp-json/wp/v2/posts` with title, content (rendered HTML from Markdown), status (draft/publish), meta_description
7. On WordPress API success (201):
   - UPDATE `content_items`: `status = 'published'`, `published_url = wp_post_url`, `published_at = NOW()`
   - Capture baseline: read most recent `scans` row for this business, store metrics in `content_performance` as the baseline `_before` values
   - Emit Inngest event: `content/published` with `{ contentId, businessId, agentType }`
   - Return 200 `{ data: { published_url } }`
8. On WordPress API failure: return 502 `{ error: 'WordPress publish failed', details: wp_error_message }`

### Step 6: Content Lifecycle Workflow Triggered

The `content/published` event triggers the Content Lifecycle Inngest workflow:

```
content/published received
  → Step 1: Schedule A15 (Content Refresh) for 30 days from now
             via inngest.send('agent/execute', { delay: '30d', agent_type: 'content_refresh', content_item_id })
  → Step 2: Mark the content item in scan pipeline for future correlation
             (scan pipeline step `compute-content-performance` checks for published content)
```

### Step 7: Performance Tracking Begins

After every subsequent scheduled scan completes, step 9 of `scan.scheduled.run` (`compute-content-performance`) runs:
1. Query all `content_items` for this business where `status = 'published'`
2. For each published item, compute the delta between `_before` baseline metrics and current scan metrics
3. INSERT `content_performance` row (UNIQUE constraint on `(content_item_id, scan_id)` prevents duplicates)

### Step 8: A15 Triggers at 30 Days

30 days after publication, the scheduled A15 event fires. The `agent.execute` function runs A15 with the content item as input. If the staleness audit produces a freshness score < 60, a revised content draft is created as a new `content_versions` row with `edited_by = 'agent'`. The user is notified to review the proposed update.

---

## 6. Content Voice Training — A13 Integration

**Priority:** Growth Phase (not Launch Critical)

### 6.1 Overview

A13 (Content Voice Trainer) learns the business's writing voice from their existing web content. Without voice training, all agent-generated content sounds like generic AI. With it, the Content Writer (A1), Blog Writer (A2), FAQ Agent (A5), and Social Strategy (A7) inject the voice profile into their generation prompts, producing content that matches the business's established tone and style.

This closes the gap against Goodie AI's "Author Stamp" feature — previously the only GEO platform offering voice-matched content generation.

### 6.2 When A13 Runs

A13 runs in two contexts:

**Automatic — during New Business Onboarding workflow:**
Triggered by the `onboarding/complete` Inngest event. Runs in parallel with A14 (Content Pattern Analyzer) and A11 (AI Readiness Auditor). These three agents run as `Promise.all()` in the workflow's parallel step, with A4 (Recommendations) running sequentially after all three complete.

This run is **system-initiated** — it bypasses the credit system entirely. Logged in `credit_transactions` as `transaction_type = 'system_grant'` with `amount = 0` for audit trail purposes. Does NOT decrement any credit pool.

**Manual — from Settings:**
Via `POST /api/settings/voice-profiles/train` with `{ website_url, page_urls: string[] }`. This is a standard credit-deducting agent execution (1 credit). The user can re-train their voice profile at any time or create multiple profiles (e.g., "Formal Blog Voice" vs "Casual Social Voice").

### 6.3 A13 LLM Pipeline

| Stage | Model | Input | Output |
|---|---|---|---|
| 1. Content Collection | cheerio (no LLM) | Business website URL, 3-5 selected pages | Clean text corpus: 3,000-15,000 words of the business's own writing |
| 2. Voice Profile Extraction | Claude Opus 4.6 | Text corpus | Structured voice profile across 8 dimensions |
| 3. Voice Verification | Claude Sonnet 4.6 | Voice profile | 150-word sample paragraph in the extracted voice |

**Why Opus for Stage 2:** Voice extraction requires detecting subtle stylistic patterns — the difference between "We believe in excellence" (corporate) and "We're obsessed with getting this right" (startup). This level of linguistic nuance benefits measurably from Opus-class reasoning. This is one of the few justified Opus use cases in the system. Sonnet is used everywhere else.

### 6.4 Voice Profile Dimensions

The Opus model extracts voice across 8 dimensions, stored as structured JSON in `content_voice_profiles.vocabulary_patterns`:

| # | Dimension | Range | Example |
|---|---|---|---|
| 1 | Formality level | 1-10 (1=casual slang, 10=academic formal) | 6/10 — professional but approachable |
| 2 | Sentence complexity | simple / compound / complex preference | Prefers short declarative sentences |
| 3 | Vocabulary sophistication | basic / intermediate / advanced | Intermediate — avoids jargon, uses precise language |
| 4 | Tone markers | warm / professional / authoritative / playful / urgent | Warm + authoritative |
| 5 | Rhetorical patterns | questions / calls-to-action / storytelling / data-driven | Heavy CTA usage, occasional questions |
| 6 | Industry jargon | heavy / moderate / minimal | Minimal — translates technical terms for laypeople |
| 7 | First-person style | we / I / company name / passive | "We" first-person plural |
| 8 | Cultural markers | Israeli informality / English formality / bilingual | English formality with occasional Israeli directness |

### 6.5 Minimum Content Threshold

| Corpus Size | Behavior |
|---|---|
| < 300 words extracted | Skip voice training. Set `voice_profile_status = 'insufficient_content'`. Notify user: "Not enough content to train voice profile — generate content first or add more pages." |
| 300-1,000 words | Basic profile only (dimensions 1-4). Confidence flagged as "low" in the profile record. |
| > 1,000 words | Full profile across all 8 dimensions. |

### 6.6 How Content Agents Use the Voice Profile

When A1, A2, A5, or A7 assemble business context (the first Inngest step in `agent.execute`), they check for a default voice profile:

```
SELECT * FROM content_voice_profiles
WHERE business_id = $1 AND is_default = true
LIMIT 1
```

If found, the `voice_description`, `example_excerpts`, and `vocabulary_patterns` are injected into the agent's system prompt in this format:

```
Write in a voice that matches the following profile:
- Tone: [voice_description summary]
- Formality: [formality_level]/10
- Style: [sentence complexity preference]

Here are examples of this business's actual writing:
[example_excerpts[0]]
[example_excerpts[1]]
[example_excerpts[2]]

Match this voice throughout the content you generate.
```

The `content_items` INSERT records which voice profile was used via `voice_profile_id` — this enables the progressive learning system to attribute quality feedback to the correct profile.

### 6.7 Progressive Voice Learning

User edits to agent-generated content are the highest-quality feedback signal available. The system captures and uses this feedback:

**Edit capture:** Every time a user modifies `content_body` via PATCH, the diff between old and new content is stored. Over time, this builds a corpus of "what the user changed" that reveals systematic preferences not captured in the original voice extraction.

**`cron.voice-refinement` (Weekly, Sunday 3AM UTC):**
1. `find-eligible-profiles` — query `content_voice_profiles` that have been used by 3+ content agents since last refinement
2. `collect-performance-data` — for each profile, gather content performance metrics (scan score changes post-publication)
3. `refine-voice` — run Claude Opus 4.6 with the existing voice profile + edit pattern data + performance feedback to produce an updated voice profile. Store as an updated row (updated_at timestamp tracks refinement history)
4. `notify-users` — send in-app notification: "Your voice profile has been refined based on your recent edits"

This creates a flywheel: more usage → better personalization → less editing → higher satisfaction → more usage.

---

## 7. Content Pattern Analyzer — A14 Integration

**Priority:** Growth Phase (not Launch Critical)

### 7.1 Overview

A14 (Content Pattern Analyzer) analyzes the structural and stylistic patterns of content that AI engines actually cite. Instead of generating content based on general best practices, it grounds pattern analysis in reality: the actual URLs that AI engines cite when discussing businesses in the user's industry.

This closes the gap identified against Spotlight's content pattern analysis feature.

### 7.2 When A14 Runs

Like A13, A14 runs automatically during the New Business Onboarding workflow (system-initiated, 0 credits, `transaction_type = 'system_grant'`). It can also be re-run manually (1 credit) from the Agent Hub.

A14 runs at the **industry level** — it analyzes citation patterns across all businesses in the user's industry, not just the user's own citations. This is more valuable than user-specific analysis early on, when a new user may have few citations.

### 7.3 A14 LLM Pipeline

| Stage | Model | Input | Output |
|---|---|---|---|
| 1. Citation Crawl | cheerio (no LLM) | Top 10 most-cited URLs in user's industry (from `citation_sources`) | Clean text + structural metadata: word count, heading structure, list usage, FAQ presence, schema types |
| 2. Pattern Extraction | Claude Sonnet 4.6 | Crawled content + metadata | Pattern report: common structures, word counts, heading patterns, FAQ format, schema usage |
| 3. Template Generation | Claude Sonnet 4.6 | Pattern report | 3-5 content templates for content-producing agents |

**Minimum data requirement:** Analysis requires at least 5 cited URLs. If fewer than 5 citations exist for the user's industry in `citation_sources`, A14 supplements with Perplexity research for top-ranking content in the industry.

### 7.4 What "Patterns" Means

Patterns are specific and actionable — not generic SEO advice:

- "Top-cited articles in dental industry average 1,400 words, use 5-7 H2 headings, include an FAQ with 6 questions answered in 80-120 words each, and cite 3+ external statistics."
- "Comparison content that gets cited uses first-person expert tone and explicitly states the comparison methodology."
- "Location pages that get cited always include a LocalBusiness JSON-LD block and a specific neighborhood reference."

These patterns translate into concrete content templates stored as output from A14.

### 7.5 How A14 Results Inform Content Generation

Pattern templates are stored in `agent_jobs.output_data` for the A14 job. The context assembler (first step of every `agent.execute`) includes A14's output when loading business context:

```
SELECT output_data FROM agent_jobs
WHERE business_id = $1 AND agent_type = 'content_pattern_analyzer'
AND status = 'completed'
ORDER BY completed_at DESC
LIMIT 1
```

If found, pattern templates are injected into A1 and A2 system prompts during the outline phase (Stage 2), instructing the model to structure the outline according to the proven pattern for the selected content type.

**Refresh cadence:** A14's outputs are re-run monthly via a scheduled Inngest job. Citation patterns shift as AI engines update their training data. The `cron.prompt-volume-aggregation` job (Sunday 3:30AM UTC) also checks if any A14 outputs are older than 30 days and triggers re-analysis for active businesses.

---

## 8. Content Refresh Agent — A15 Integration

**Priority:** Growth Phase (not Launch Critical)

### 8.1 Overview

A15 (Content Refresh Agent) transforms agents from one-shot content creators into continuous content maintainers. Published content becomes stale — statistics age, AI engine preferences shift, competitors create better content. A15 audits existing published content and produces updated versions.

This closes the gap against Profound Workflows' recurring content audit capability.

### 8.2 Trigger Mechanisms

A15 runs in two ways:

**Automated — `cron.content-refresh-check` (Daily 6AM UTC):**
1. `find-stale-content` — query `content_items` WHERE `updated_at < NOW() - INTERVAL '30 days'` AND `status = 'published'`. Group by business.
2. `evaluate-refresh-need` — for each stale item, check if related scan scores for the content's target queries have changed by > 10 points since the content was created
3. `trigger-refresh-agents` — for each item meeting the threshold, emit `agent/execute` event with `agent_type = 'content_refresh'` (respects credit availability — skips if insufficient credits, queues notification to user instead)

**Manual — from Content Library or Editor:**
User clicks "Check for Staleness" on a published content item. Standard credit-deducting execution (1 credit).

### 8.3 A15 LLM Pipeline

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|---|---|---|---|---|---|
| 1. Staleness Audit | Claude Haiku 4.5 | Compare published content against current scan data and industry trends. Flag: outdated stats, stale references, missed new competitors, changed market conditions | Staleness report: freshness score (0-100), specific issues, update urgency (high/medium/low) | 0.3 | 2,000 |
| 2. Research Update | Perplexity sonar-pro | For high-urgency items, gather latest data on the topic | Updated facts, new statistics, recent developments | 0.5 | 1,500 |
| 3. Content Revision | Claude Sonnet 4.6 | Generate updated version preserving voice and structure while incorporating new data | Revised content with tracked changes (diff against original) | 0.6 | 4,000 |

**Quality gates:**
- Only content with freshness score < 60 is flagged for update. Items scoring 60-100 are marked "fresh" and not revised.
- Revisions must preserve the original voice profile and structure — targeted updates only, not wholesale rewrites.
- User must approve updates before they replace the original (presented as a diff view in the content editor).

### 8.4 Output Format

A15 produces:
- Content freshness audit report (all published items scored)
- Flagged items with specific issues and update urgency
- Revised content drafts for high-urgency items (stored as new `content_versions` rows with `edited_by = 'agent'`)
- Diff view showing what changed and why (presented in the content editor's version history sidebar)

The user sees a notification: "A15 has proposed updates to [X] of your published content items. Review and approve changes." Deep link to the content library filtered to `in_review` items.

---

## 9. Content Performance Tracking

**Priority:** Growth Phase (not Launch Critical)

### 9.1 The Agent Impact Scorecard

The "Agent Impact Scorecard" is a core innovation in Beamix — per-content ROI proof at the individual piece level. No competitor attributes specific visibility changes to specific agent outputs with this granularity.

The value statement: "You published this blog post on March 1st. Over the following 30 days, your Perplexity ranking for 'best GEO platform for small businesses' went from absent to position 2. Your ChatGPT visibility for the same query improved from position 6 to position 3."

### 9.2 How Scan Results Are Correlated With Published Content

The correlation pipeline runs as step 9 (`compute-content-performance`) in `scan.scheduled.run`:

1. Query all `content_items` for the current business where `status = 'published'` and `published_at IS NOT NULL`
2. For each published item:
   - Load the baseline `_before` values stored at publish time (the `content_performance` row where `scan_id` is the scan that was current at publication)
   - Load the current scan's metrics: `overall_score`, mention counts, avg_position for the queries the content was targeting
   - Compute deltas: `score_delta = visibility_score_after - visibility_score_before`
3. INSERT `content_performance` row for this scan (UNIQUE constraint prevents double-inserts if scan is retried)

**Target query correlation:** Content performance is most meaningful when measured against the specific queries the content was created to target. The agent's `input_data` (from `agent_jobs`) includes the target queries the user specified. These are stored in `content_items` (via the agent pipeline) and used to filter `scan_engine_results` to only the relevant queries when computing the delta.

### 9.3 GA4 Integration Data Pull

**Priority:** Growth Phase

When a business has GA4 connected (`integrations` row with `provider = 'ga4'`), the content performance pipeline also pulls organic traffic data from `ga4_metrics`:

- Sessions from AI referral domains (chatgpt.com, perplexity.ai, claude.ai, etc.) attributable to the content's published URL
- Organic search sessions to the published URL

These are stored in `content_performance` alongside visibility metrics, enabling statements like: "This article received 340 sessions from Perplexity in 30 days."

### 9.4 Content Performance Widget in Dashboard

The Dashboard Overview (`/dashboard`) shows a "Content Performance Summary" widget:
- Published content count: "12 pieces published"
- Aggregate visibility impact: "+18 points visibility across 7 target queries"
- Best performer: "[Blog Post Title] — +32 points, mentioned in 4/4 engines"
- Link: "View all content performance" → `/dashboard/content` filtered to published items

Data from: `GET /api/analytics/content-performance?business_id=X`

---

## 10. CMS Publishing Integration — WordPress

### 10.1 How WordPress Integration Works

WordPress is the only CMS integration at launch. Additional CMS platforms (Webflow, Contentful) are intentionally deferred — low competitive pressure and enterprise-only usage.

**Authentication method:** WordPress Application Passwords (introduced in WP 5.6). The user provides:
- WordPress site URL (e.g., `https://mybusiness.com`)
- WordPress username
- WordPress Application Password (generated in WP Admin → Users → Application Passwords)

These credentials are stored in `integrations.credentials` as a JSONB blob, encrypted at the application layer using AES-256-GCM before storage. The encryption key is stored in environment variables, not in the database.

**Credential encryption/decryption flow:**
- On save (`POST /api/integrations/wordpress`): encrypt credentials before INSERT into `integrations`
- On publish (`POST /api/content/[id]/publish`): decrypt credentials in the API route, use for WordPress API call, discard plaintext credentials from memory after the call completes

### 10.2 What Happens When Publish Is Clicked

The full publish flow is specified in Section 5, Step 5. Summary of the WordPress API call:

```
POST {site_url}/wp-json/wp/v2/posts
Authorization: Basic base64({username}:{application_password})
Content-Type: application/json

{
  "title": content_items.title,
  "content": renderMarkdownToHTML(content_items.content_body),
  "status": "draft" | "publish",  // user's choice in the modal
  "excerpt": content_items.meta_description,
  "meta": {
    "_yoast_wpseo_metadesc": content_items.meta_description
  }
}
```

The response returns the WordPress post ID and URL (`link` field), which is stored in `content_items.published_url`.

### 10.3 Error Handling

| Error | Cause | User-Facing Message |
|---|---|---|
| 401 Unauthorized | Wrong username or application password | "WordPress authentication failed. Re-check your credentials in Settings → Integrations." |
| 403 Forbidden | User doesn't have `edit_posts` capability | "Your WordPress user doesn't have permission to create posts. Use an Administrator or Editor account." |
| 404 Not Found | Wrong site URL or WP REST API disabled | "Could not connect to WordPress. Verify your site URL and that the REST API is enabled." |
| 429 Too Many Requests | WordPress rate limiting | "WordPress is temporarily rate limiting requests. Please try again in a few minutes." |
| 408/504 Timeout | WordPress site is slow or down | "WordPress publish timed out. Your content is saved in Beamix — try publishing again shortly." |

### 10.4 Integration Status Display

The Settings → Integrations tab shows the WordPress integration card with:
- Status: Connected / Not Connected / Error
- Connected site URL
- "Test Connection" button — `POST /api/integrations/wordpress/test` — makes a lightweight WP API call (`GET /wp-json/wp/v2/users/me`) to verify credentials are still valid
- Last sync date

---

## 11. API Routes

All routes require authentication (Supabase session) unless noted. All inputs are Zod-validated. Error responses follow `{ error: string, code?: string }`. Success responses follow `{ data: T }`.

### 11.1 Content Routes — `/api/content/*`

**GET /api/content**

List content items with filters. Paginated.

```
Query params (Zod-validated):
  business_id: uuid (required)
  content_type?: one of 12 content_type enum values
  agent_type?: string
  status?: 'draft' | 'in_review' | 'approved' | 'published' | 'archived'
  is_favorited?: boolean
  page?: integer (default 1)
  per_page?: integer (default 20, max 100)
  sort?: 'newest' | 'oldest' | 'modified' | 'alphabetical' (default 'newest')
  search?: string (searches title)

Response: {
  data: {
    items: ContentItem[],
    total: number,
    page: number,
    per_page: number
  }
}
```

**GET /api/content/[id]**

Get a single content item with all version history.

```
Response: {
  data: {
    item: ContentItem,
    versions: ContentVersion[],
    performance: ContentPerformance[]  // if published
  }
}
```

**PATCH /api/content/[id]**

Update content. If `content_body` is included, creates a new version entry before updating.

```
Body (all optional):
  title?: string
  content_body?: string
  status?: 'draft' | 'in_review' | 'approved' | 'archived'  // valid transitions only
  tags?: string[]
  is_favorited?: boolean
  restore_version_number?: integer  // restore to a historical version

Constraints:
  - User must own this content item
  - Status transitions must follow the state machine (§3.2)
  - Cannot set status = 'published' directly — must use POST /publish

Response: { data: { item: ContentItem } }
Rate limit: 60 per minute per user
```

**POST /api/content/[id]/publish**

Publish to a CMS integration.

```
Body:
  provider: 'wordpress'
  publish_as: 'draft' | 'publish'

Behavior:
  - Verifies WordPress integration is configured for the business
  - Decrypts credentials, calls WordPress REST API
  - On success: updates content_items, captures baseline, emits content/published event
  - On failure: returns 502 with WordPress error details

Response: { data: { published_url: string } }
```

**GET /api/content/[id]/performance**

Get performance data for a published content item.

```
Query params:
  period?: '7d' | '30d' | '90d' (default '30d')

Response: {
  data: {
    baseline: { visibility_score_before, mention_count_before, avg_position_before },
    measurements: ContentPerformance[],  // one per scan since publication
    aggregate: {
      score_delta: number,
      best_engine: string,
      days_tracked: number
    }
  }
}
```

**DELETE /api/content/[id]**

Archive a content item (soft delete — moves status to 'archived').

```
Response: { data: { message: 'Content archived' } }
```

Note: Hard delete is not exposed via API. Data is retained for performance tracking history. Cleanup is handled by the `cron.cleanup` job for accounts that are fully deleted (cascades from `auth.users` DELETE).

### 11.2 Settings — Voice Profile Routes

**GET /api/settings/voice-profiles**

List voice profiles for the user's business.

```
Query: business_id: uuid
Response: { data: { profiles: ContentVoiceProfile[] } }
```

**POST /api/settings/voice-profiles**

Create a new voice profile by training on a URL.

```
Body: { business_id: uuid, name: string, page_urls: string[] }
Process: Validates page_urls (1-5 valid URLs). Creates agent_jobs row. Sends agent/execute event with agent_type = 'content_voice_trainer'. Returns job_id for polling.
Response: { data: { job_id: uuid } }
```

**PATCH /api/settings/voice-profiles/[id]**

Update profile metadata (name, is_default).

```
Body: { name?: string, is_default?: boolean }
Note: Setting is_default = true automatically sets all other profiles for this business to is_default = false.
```

**DELETE /api/settings/voice-profiles/[id]**

Delete a voice profile. Cannot delete if `is_default = true` and there is only one profile.

---

## 12. Engineering Notes

### 12.1 Why Markdown-Only for v1

The content editor uses a plain Markdown textarea — no rich text (WYSIWYG) editor. This decision was made for four reasons:

1. **Simplicity:** A WYSIWYG editor requires a heavy client-side library (Tiptap, Quill, ProseMirror). These add 200-400KB to the bundle, complex state management, and ongoing maintenance. A textarea is simple, fast, and reliable.

2. **Portability:** Markdown is a universal format. Content exported from Beamix can be pasted into any CMS, Notion, Google Docs, or code editor without format stripping. HTML export from WYSIWYG editors often produces messy, non-portable markup.

3. **WordPress compatibility:** When publishing to WordPress, Markdown is converted to clean HTML server-side. WYSIWYG editors produce inconsistent HTML that conflicts with WordPress themes and plugins.

4. **Extensibility:** Adding a WYSIWYG editor in v2 is a clear, bounded upgrade path. Going the other direction (removing a WYSIWYG editor) is a breaking change for users.

The decision will be revisited when: (a) agency tier launches and multi-person editing workflows are needed, or (b) user research shows >30% of users abandoning the editor due to Markdown friction.

### 12.2 Why Single-User Editorial Review in MVP

The `in_review` status in `content_items` was designed to support multi-person editorial workflows (writer → editor → publisher). However, the MVP implements single-user review only — the account owner reviews their own agent-generated content.

Multi-person editorial workflows require:
- User roles and permissions beyond the current single-user model
- Reviewer assignment logic
- Comment threads on content
- Notification routing per reviewer
- Team seats (billing implication)

These are agency-tier features. Building them before there is evidence of agency demand would add significant complexity for zero incremental v1 value. The `in_review` status field exists and is functional; the multi-person workflow is the deferred part.

### 12.3 Content Type List — All 12 Types with Descriptions

| Content Type | DB Value | Produced By | GEO Optimization Strategy |
|---|---|---|---|
| Article | `article` | A1 (Content Writer) | General authority building; broad keyword coverage; includes FAQ section |
| Blog Post | `blog_post` | A2 (Blog Writer) | Long-form citation bait; 1,000-2,500 words; targets specific AI queries; includes statistics |
| FAQ | `faq` | A5 (FAQ Agent) | Directly matches conversational AI query format; includes FAQPage JSON-LD schema |
| Social Post | `social_post` | A7 (Social Strategy) | 30-day calendar; amplification and linkability; secondary citation source |
| Schema Markup | `schema_markup` | A3 (Schema Optimizer) | JSON-LD structured data; highest-impact technical GEO factor; machine-readable |
| LLMS.txt | `llms_txt` | A10 (LLMS.txt Generator) | AI-readable site description file; enables AI crawlers to understand site structure |
| Outreach Template | `outreach_template` | A9 (Citation Builder) | Email templates to earn citations from AI-cited sources |
| Comparison Article | `comparison` | A1 (Content Writer) | Wins "X vs Y" queries; fair/balanced required; comparison schema |
| Ranked List | `ranked_list` | A1 (Content Writer) | Wins "top X" and "best X" queries; transparent methodology; positions user's business authentically |
| Location Page | `location_page` | A1 (Content Writer) | Wins "X in [city]" queries; LocalBusiness schema; local references |
| Case Study | `case_study` | A1 (Content Writer) | Establishes authority; problem/solution/result structure; specific metrics |
| Product Deep-Dive | `product_deep_dive` | A1 (Content Writer) | Wins product-specific queries; comprehensive feature analysis; Product schema |

### 12.4 `agent_type` vs `content_type` — Quick Reference

To avoid confusion during implementation:

- **`agent_type`** is set from `agent_jobs.agent_type` at content creation time. It answers "which agent produced this content?" Use for filtering "show me all content the blog writer created."

- **`content_type`** is set from the agent's `input_data.content_type` field (user selected it when configuring the agent). It answers "what kind of content is this?" Use for filtering "show me all comparison articles."

- Do not derive `content_type` from `agent_type` in code — the relationship is many-to-one for A1 (Content Writer), which can produce 7 different content types. Use explicit fields.

### 12.5 Content Performance Limitations

The `content_performance` correlation pipeline acknowledges a fundamental limitation: correlation is not causation. When visibility improves after content is published, multiple factors may be responsible:
- The published content was indexed and cited by AI engines
- A separate scan improvement unrelated to the content
- Competitor visibility changes affecting relative rankings
- AI engine model updates

The dashboard communicates this with a persistent disclaimer on all performance data: "Visibility changes may reflect multiple factors. This correlation is directional, not causal." The value is directional signal, not scientific attribution. This is what all competitors (Bear AI, Gauge, Goodie) also offer at their current state of the art.

### 12.6 Key File Paths (Current Codebase)

For reference — existing implementation locations before this spec is applied:

- `src/components/scan/scan-results-client.tsx` — existing results display (940 lines)
- `src/app/dashboard/content/` — content library page (Phase 5)
- `src/app/api/content/` — content API routes (Phase 5)
- `src/lib/types/database.types.ts` — Supabase-generated types (16 tables)
- `src/lib/types/index.ts` — app-level types including content-related types
- `src/constants/industries.ts` — 25 industry entries with prompts and competitors
