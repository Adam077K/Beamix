# Research Synthesis — Wave 3 Visual Direction
*Researcher. 2026-04-20. Deepening three underdocumented areas from Wave 2 references.*

Cross-ref: `02-VISUAL-DIRECTION.md` page names (Home, Scans list, Scan detail, Competitors, Inbox, Workspace, Automation, Settings, Agent detail).

---

## Section 1 — Notion Page Density (the "Workspace" Archetype)

### 1.1 Page Grid and Content Width

Notion's default (non-full-width) page uses a centered content column of approximately 720px within the viewport, with generous horizontal margins that collapse as the window narrows. Toggling "Full width" in the page menu (`•••` → Full width) expands the content area to fill the viewport minus the sidebar (~240px collapsed, ~260px expanded) and a small inset margin of roughly 48–64px per side. The page header (title + icon + cover) spans the full content column width. Inline databases, when embedded, stretch to 100% of the content column. These widths are not published by Notion; they are derived from multiple community measurement sources and CSS inspection guides. (Sources: [Notion Help — Style & customize](https://www.notion.com/help/customize-and-style-your-content), [Landmark Labs — page width tutorial](https://www.landmarklabs.co/notion-tutorials/notion-page-width-default), [Potion — content width guide](https://beta.potion.so/guides/custom-styles/content-width-and-responsive-layouts))

### 1.2 Block Types and Density

Notion's block architecture creates vertical density through variety rather than compression. A typical documentation or workspace page interleaves these block types, each occupying roughly one "line height" (28–32px) of vertical space:

| Block type | Height (approx) | Use in Notion |
|------------|-----------------|---------------|
| Paragraph | 28px per line + 4px block gap | Default body text |
| Heading 1 / 2 / 3 | 40px / 32px / 28px + 8px top margin | Section headers |
| Toggle list | 28px collapsed, expands in-place | Collapsible detail |
| Callout | 48–64px (icon + text + padding) | Highlighted notices |
| Inline database | Variable, min ~200px | Tables, kanban, gallery embedded in-page |
| AI block | ~40px placeholder when empty | AI-generated content zone |
| To-do checkbox | 28px per item | Task tracking |
| Code block | Variable, monospace, ~14px font | Snippets |
| Quote | 28px + left border accent | Pull quotes |

Block gap between siblings is approximately 4px. Between a heading and its first child block, Notion inserts ~8px. Adjacent list items of the same type use tighter 2px gaps (Notion's "adjacency rules" reduce padding when neighbors share type). (Source: [Notion blog — Updating the design of Notion pages](https://www.notion.com/blog/updating-the-design-of-notion-pages))

### 1.3 Microcopy Examples (Actual Strings)

Extracted from Notion's help center and interface documentation:

| UI Surface | Microcopy |
|------------|-----------|
| Page menu button | `•••` (three-dot icon) |
| Font style options | `Default`, `Serif`, `Mono` |
| Callout default color | `Default` (renders white block with light gray outline) |
| Icon action labels | `Add icon`, `Remove` |
| Cover action labels | `Change cover`, `Upload`, `Link` |
| Emoji input hint | Type `:` followed by the name of the emoji |
| AI block placeholder | `Ask AI to write...` (paraphrased from product; exact string varies by workspace) |
| Empty page state | `Press Enter to continue with an empty page, or pick a template` |
| Toggle empty state | Content area blank, click to expand/collapse |
| Bold shortcut hint | `cmd/ctrl + B` |
| Inline code hint | `cmd/ctrl + E` |

(Source: [Notion Help — Style & customize](https://www.notion.com/help/customize-and-style-your-content))

### 1.4 Five Patterns Beamix Workspace MUST Steal

**P1. Block-based content editing with type switching.** Notion's slash-command menu lets users convert any block to another type in-place. For Beamix Workspace (`content_items`), agent-generated output should be rendered as blocks (paragraph, heading, callout, code) that users can reorder and retype. This maps directly to editing agent content output after generation.

**P2. Toggle blocks for evidence/citation collapse.** Notion's toggle list hides detail behind a single-line summary. Beamix Workspace should wrap citation sources and evidence previews in toggles: the summary line shows "3 sources cited" and expanding reveals the URLs, snippets, and relevance scores. This prevents evidence from overwhelming the content body.

**P3. Callout blocks for agent status annotations.** Notion's callout block (icon + colored background + text) is the right pattern for agent-generated warnings, recommendations, and status messages inside Workspace content. Map to: "This section was last updated by Content Writer agent on Apr 18" or "Low confidence — only 1 source found."

**P4. Inline database for structured data within content.** When an agent produces a comparison table (e.g., competitor feature matrix), Beamix should embed it as an inline table block within the Workspace page, not as a separate page. Notion's inline databases sit flush with the content column at 100% width.

**P5. Side-by-side panel (details panel / aside).** Notion Layouts introduced a collapsible "Details panel" on the right side of pages, showing metadata properties while the main area holds content. Beamix Workspace (per `02-VISUAL-DIRECTION.md`: `grid-cols-[1fr_280px]`, 280px aside) should mirror this: main content left, metadata/status/agent-info aside right. (Source: [Notion Help — Layouts](https://www.notion.com/help/layouts))

### 1.5 Anti-Patterns (What Notion Does That Beamix Should NOT Copy)

**A1. Unlimited nesting depth.** Notion allows infinite sub-page and toggle nesting. Beamix content_items are flat by design (agent output → single page). Do not introduce sub-pages or deep nesting — it creates navigation confusion for SMB users.

**A2. Default narrow width.** Notion's ~720px default content width is designed for long-form reading. Beamix Workspace needs the full 1100px container (per `02-VISUAL-DIRECTION.md`) to show content + 280px aside. Do not default to a narrow centered column.

**A3. Font style switching.** Notion offers Default/Serif/Mono per page. Beamix should enforce a single typography stack (Inter + Geist Mono for code only). Style switching creates brand inconsistency.

**A4. Heavy emoji culture.** Notion's icon/emoji system dominates page headers. Beamix should use functional icons (agent type icon, status dot) not decorative emoji.

---

## Section 2 — Vercel Dashboard Composition

### 2.1 Sidebar and Container Structure

Vercel's February 2026 dashboard redesign moved from horizontal tabs to a resizable left sidebar. The sidebar collapses to show only icons (~56px) and expands to show labels (~240px). Navigation items are organized by workflow frequency: Projects, Deployments, Domains, Storage, then settings categories below. The sidebar is consistent across team-level and project-level views — switching between scopes does not change the nav structure, only the content. (Sources: [Vercel changelog — dashboard redesign rollout](https://vercel.com/changelog/dashboard-navigation-redesign-rollout), [Vercel blog — dashboard redesign](https://vercel.com/blog/dashboard-redesign))

The main content area fills the remaining viewport width. At 1440px viewport with expanded sidebar, the content area is approximately 1200px. There is no fixed max-width container on project pages — content stretches to fill available space with consistent internal padding. Mobile view replaces the sidebar with a floating bottom bar. (Source: [Vercel — The New Side of Vercel](https://vercel.com/try/new-dashboard))

### 2.2 KPI Strip and Project Overview Composition

The project overview page leads with the production deployment card: a large card showing the deployment URL, associated Git commit hash, branch name, and a live screenshot thumbnail of the deployed site. Below this hero card, the page shows:

1. **Production deployment status** — status badge (Ready / Building / Error / Queued), timestamp, commit message
2. **Preview deployments** — filtered by team member, each showing branch name, status badge, and timestamp
3. **Domains section** — list of connected domains with verification status
4. **Framework detection** — detected framework badge (Next.js, Remix, etc.)

Vercel does not use a traditional "KPI strip" with numeric metrics on the project overview. Instead, it uses status-oriented cards. The Analytics tab (separate from overview) shows Web Analytics metrics: page views, visitors, top pages, and Speed Insights with Core Web Vitals (LCP, CLS, FID/INP). These are displayed as large number cards with sparkline trend lines beneath. (Sources: [Vercel docs — Projects overview](https://vercel.com/docs/projects), [Vercel blog — dashboard redesign](https://vercel.com/blog/dashboard-redesign))

Browser tabs show deployment status via favicon: queued (gray), building (yellow), error (red), ready (green). This micro-detail reduces need to keep the tab visible. (Source: [Vercel blog — dashboard redesign](https://vercel.com/blog/dashboard-redesign))

### 2.3 Deployment List / Activity Feed Pattern

The deployments list is the densest view in Vercel's dashboard. Each deployment row contains:

| Element | Position | Details |
|---------|----------|---------|
| Status indicator | Left | Colored dot: green (Ready), yellow (Building), red (Error), gray (Queued/Cancelled) |
| Commit message | Center-left | Truncated to single line, monospace hash prefix |
| Branch name | Center | Badge-style, `font-mono text-xs` |
| Author avatar | Center-right | 24px circle |
| Timestamp | Right | Relative time ("2m ago", "1h ago") |

Row height is compact — approximately 48–52px. Rows use `divide-y` separators, not individual card borders. The list is sorted reverse-chronological with no date group headers (unlike Linear's grouped approach). Clicking a row opens the deployment detail with build logs.

Build logs within the deployment inspector can be filtered by serverless function or build output and copied to clipboard in one click. Log lines use monospace font at approximately 13px with line numbers. (Source: [Vercel blog — dashboard redesign](https://vercel.com/blog/dashboard-redesign))

### 2.4 Performance

The redesign decreased time to First Meaningful Paint by over 1.2 seconds through preconnection, memoization, and batched state updates. This is relevant for Beamix: dense data dashboards must prioritize render performance. (Source: [Vercel blog — dashboard redesign](https://vercel.com/blog/dashboard-redesign))

### 2.5 Five Patterns Beamix Dashboards MUST Steal

**P1. Collapsible sidebar with consistent nav across scopes.** Vercel's sidebar stays identical whether viewing team-level or project-level pages — only content changes. Beamix should keep sidebar items fixed across Home, Scans, Competitors, Inbox, Workspace, Automation, Settings. The active page highlight changes, not the nav tree.

**P2. Status-in-favicon.** Vercel reflects deployment status in the browser tab icon. Beamix should reflect scan status (Running / Complete / Failed) in the favicon during active scans. Cheap to implement, high perceived polish.

**P3. Deployment row density as model for Scans list.** Vercel's ~48px deployment rows with status dot + commit + branch + avatar + timestamp map directly to Beamix Scans list rows: status dot + score badge + delta + engine pips + date. The `02-VISUAL-DIRECTION.md` spec calls for 52px rows — consistent with Vercel's pattern.

**P4. Log/trace filtering with one-click copy.** Vercel's log inspector lets users filter by function and copy output. Beamix Agent detail page should let users filter agent execution logs by step and copy output. The aside panel (280px per spec) can hold the filter controls.

**P5. Relative timestamps throughout.** Vercel uses "2m ago" instead of "April 20, 2026 14:32." Beamix should use relative time for Scans list, Inbox items, and Automation last-run columns (switching to absolute date on hover tooltip).

### 2.6 Anti-Patterns

**A1. No numeric KPI strip on overview.** Vercel leads with a deployment screenshot card, not metrics. Beamix's Home page needs the numeric KPI strip (score, citations, coverage, rank) because AI visibility is metric-driven, not deployment-driven. Do not copy Vercel's screenshot-first approach.

**A2. Flat deployment list without date grouping.** Vercel's deployment list has no date grouping headers. Beamix Scans list (per spec) groups by TODAY / YESTERDAY / LAST WEEK — this is correct for less-frequent events (scans run weekly, not every git push). Keep the grouping.

**A3. No sparklines in list rows.** Vercel reserves sparklines for the Analytics tab only. Beamix should consider inline sparklines in the Home KPI cards (per spec: `sparkline 160px` in ScoreHero) but not in table rows — keep rows clean.

---

## Section 3 — Ahrefs Brand Radar + Profound (Beamix's Actual Category)

### 3.1 Ahrefs Brand Radar — Dashboard Composition

Brand Radar is structured as five report modules accessed via navigation tabs: **AI Visibility**, **Search Demand**, **Web Visibility**, **Video Visibility**, and **SERP Visibility**. The Overview report serves as the default landing page, displaying a comparative dashboard across all modules. (Source: [Ahrefs Help — About Brand Radar](https://help.ahrefs.com/en/articles/11064852-about-brand-radar))

**KPI Strip.** The Brand Radar landing page leads with large aggregate numbers displayed as hero metrics:
- `365M+` total monthly prompts indexed
- `263M+` AI Overviews mentions
- `46M+` AI Mode results
- `14M+` each for ChatGPT, Copilot, Gemini, Perplexity
- `46%` AI Share of Voice (with "#1 among competitors" label)
- `893K` total searches last month
- `1.8M` web mentions

These are displayed as large-font metric cards with platform logos below each number. (Source: [Ahrefs Brand Radar landing page](https://ahrefs.com/brand-radar))

**Filter bar.** A top-positioned filter bar supports stacked filters: platform/channel, geographic targeting, and temporal selection with a date picker. Users can sort AI visibility results by "Relevance" or "Search Volume." (Source: [Ahrefs Help — About Brand Radar](https://help.ahrefs.com/en/articles/11064852-about-brand-radar))

**Tables.** AI Visibility tables show per-prompt results with columns for: prompt text, platform, mention status, cited domains, and cited pages. Topic clustering groups related prompts by user intent (product comparisons, how-to queries, brand reviews). (Source: [Analyze AI — Brand Radar review](https://www.tryanalyze.ai/blog/ahrefs-brand-radar-review))

**Charts.** Line charts show "how multiple brands perform over time for a single metric." Benchmarking charts enable multi-brand competitive comparison. (Source: [Ahrefs Help — About Brand Radar](https://help.ahrefs.com/en/articles/11064852-about-brand-radar))

**Export.** Saved reports can be created via "Save report" button in sidebar. API access button enables data extraction. Report Builder supports custom widget composition. (Source: [Ahrefs Help — About Brand Radar](https://help.ahrefs.com/en/articles/11064852-about-brand-radar))

### 3.2 Ahrefs Brand Radar — Engine Breakdown and Query Drilldown

The AI Visibility module breaks down mentions by platform. Each platform (ChatGPT, Perplexity, Google AI Overviews, Google AI Mode, Gemini, Microsoft Copilot) gets its own index. Users can view which specific prompts triggered brand mentions on each platform. The drilldown shows: prompt text, whether the brand was mentioned, whether it was cited (linked), and which competitor brands appeared in the same response. YouTube and Reddit mention tracking were added as correlated surfaces. (Source: [Ahrefs Brand Radar landing page](https://ahrefs.com/brand-radar), [Stormy AI — tracking AI SoV guide](https://stormy.ai/blog/tracking-ai-share-of-voice-2026-guide-semrush-ahrefs))

**Pricing context.** AI Indexes cost $199/month per platform or $699/month for all 6 bundled. Total minimum: $828/month ($129 base Ahrefs + $699 bundle). This positions Brand Radar as a premium add-on, not a standalone product. (Source: [EWR Digital — Brand Radar pricing](https://www.ewrdigital.com/blog/ahrefs-brand-radar-review-alternatives-pricing-comparison/))

**Known UI limitations.** Multiple reviews note the interface is "functional" but rough. Ahrefs leadership acknowledged it "still needs some work" with planned improvements including topical prompt grouping and enhanced accessibility. ChatGPT and Perplexity modules underreport mentions. Claude and Grok are not tracked. (Sources: [Rankability — Brand Radar review](https://www.rankability.com/blog/ahrefs-brand-radar-review/), [Ekamoira — Brand Radar review](https://www.ekamoira.com/blog/ahrefs-for-ai-visibility-brand-radar-review-what-it-still-can-t-track-2026))

### 3.3 Profound — Dashboard Composition

Profound positions itself as an enterprise GEO platform ("marketing to Superintelligence"). It secured $35M Series B from Sequoia Capital and processes 5M+ citations daily, 4M+ crawler visits, and 1M+ prompts. (Source: [SE Ranking — best AI visibility tools](https://visible.seranking.com/blog/best-ai-visibility-tools/))

**Core dashboard surfaces:**

| Surface | Function |
|---------|----------|
| AI Visibility Dashboard | Brand appearance frequency across AI platforms, citation patterns, sentiment analysis |
| Conversation Explorer | Real-time AI search volume data — how often industry topics are discussed across AI platforms |
| Citation Source List | Which third-party websites influence AI engine answers about your category |
| Share of Voice | Competitive positioning metric across tracked platforms |
| Trend Analysis | Brand understanding evolution over time |
| Content Gap Detection | Where competitors appear and you don't |

(Sources: [Rankability — Profound review](https://www.rankability.com/blog/profound-ai-review/), [Sight AI — visibility software reviews](https://www.trysight.ai/blog/ai-visibility-software-reviews))

**Prompt-level analysis.** Profound's differentiator is its query drilldown: it reveals exactly which questions and contexts trigger brand mentions, including sentiment (positive / negative / neutral) and citation authority (which third-party sites influenced the AI's answer). (Source: [SMA Marketing — AI visibility tools](https://www.smamarketing.net/blog/ai-search-visibility-tools))

**Enterprise positioning.** SOC 2 Type II compliance, 12+ months of historical data retention, AWS/Cloudflare integrations. Covers 5+ AI platforms including Copilot and Claude (which Ahrefs lacks). (Source: [Stackmatix — AI search tools comparison](https://www.stackmatix.com/blog/ai-search-tools-software-comparison))

### 3.4 Microcopy on Status/Result Labels (Category Standard)

Extracted from Brand Radar and Profound marketing materials and review screenshots:

| Label context | Microcopy examples |
|---------------|-------------------|
| Mention status | `Mentioned` / `Not mentioned` (binary per engine) |
| Citation status | `Cited` (linked) / `Mentioned` (unlinked) / `Not found` |
| Sentiment | `Positive` / `Neutral` / `Negative` |
| Share of Voice | Percentage with competitor rank: `46% (#1)` |
| Trend direction | `↑ +12%` / `↓ -5%` / `→ Stable` |
| Platform labels | `ChatGPT` / `Perplexity` / `Google AI Overviews` / `AI Mode` / `Gemini` / `Copilot` |
| Filter labels | `Relevance` / `Search Volume` (sort options) |
| Report actions | `Save report` / `Create report` / `API access` |
| Prompt category | `Product comparisons` / `How-to queries` / `Brand reviews` (topic clusters) |
| Date filter | Specific date picker with historical range |
| Confidence/quality | Not standard in either tool — gap Beamix can fill |

(Sources: [Ahrefs Help — About Brand Radar](https://help.ahrefs.com/en/articles/11064852-about-brand-radar), [Ahrefs Brand Radar landing page](https://ahrefs.com/brand-radar))

### 3.5 Five Patterns Beamix Scans + Competitors Pages MUST Steal

**P1. Per-engine breakdown as first-class view.** Both Brand Radar and Profound break visibility data by AI platform. Beamix Scan detail (per `02-VISUAL-DIRECTION.md`: 5 engine cards in 2+3 grid) already plans this. Ensure each engine card shows: mention status (binary badge), rank position, citation status (cited vs. mentioned vs. not found), and sentiment dot. This matches the category standard.

**P2. Share of Voice as primary competitive metric.** Brand Radar leads the Competitors view with SoV percentage and competitor rank. Beamix Competitors page (per spec: SoV ring in aside + competitor table with engine heatmap cells) should lead with SoV% in the sticky KPI strip: `[Your SoV: 34%] [Leader: CompetitorA 41%] [Gap: -7pp]`. This is exactly what the spec proposes — it matches category convention.

**P3. Prompt/query-level drilldown table.** Both tools offer per-query analysis. Beamix's QueryByQueryTable (per spec: 5 visible rows at 44px each showing query | result | rank | sentiment) maps directly. Add a "cited domains" expandable row or toggle to show which sources the AI engine referenced — this is a Profound differentiator that Beamix should adopt.

**P4. Stacked filter bar with temporal selection.** Brand Radar's top-positioned filter bar with stacked filters (platform + date range + sort order) should be adopted for Beamix Scans list and Scan detail. Place above the content area, below the sticky KPI strip. Compact: single row, pill-style filter chips.

**P5. Multi-brand trend line chart.** Brand Radar's line charts comparing multiple brands over time for a single metric (SoV, mentions, citations) should map to Beamix Competitors' SovTrendChart (per spec: 12-week line, 160px tall). Show the user's brand as the primary line (thicker, `#3370FF`), competitors as thinner gray lines with hover labels.

### 3.6 Where Beamix MUST Diverge

**D1. Beamix does the work — they only report.** Brand Radar and Profound are monitoring dashboards. They show what's wrong but offer no fix. Beamix's Automation page and agent system (11 GEO agents) are the differentiator. Every Scan detail and Competitors page should include a CTA that connects diagnosis to action: "Fix this with [Agent Name]" button adjacent to low-scoring query rows. Neither competitor has this.

**D2. Beamix shows agent output as content, not just metrics.** Brand Radar has no content workspace. Profound has no editing surface. Beamix's Workspace page (Notion-like editor for agent output) is a category-unique surface. The agent produces content; the user reviews and edits it; the scan later verifies improvement. This feedback loop does not exist in any competitor.

**D3. Beamix serves SMBs at $79–$499/month; competitors serve enterprise at $828+/month.** The UI must be simpler, not denser, than Brand Radar. Beamix should show 5 engines max (not 6+ indexes), a single SoV number (not per-platform SoV breakdowns requiring separate purchases), and recommendations in plain language, not SEO jargon. The spec's 52px scan rows and 44px query rows are correct — do not try to match enterprise data density.

**D4. Proactive automation model vs. manual report-building.** Brand Radar requires users to create reports and configure saved views. Beamix's model (per product rethink) is proactive: agents suggest actions → user approves → agent runs → results appear in Inbox. The Automation page should show agent schedules and status, not report templates. Do not copy Brand Radar's "Report Builder" pattern.

**D5. Integrated Inbox replaces email alerts.** Profound and Brand Radar send email notifications or require users to check dashboards. Beamix's Inbox (per spec: `grid-cols-[260px_1fr_300px]` with evidence aside) is a dedicated surface for reviewing agent outputs and scan results. This is a UX advantage — do not reduce it to a notification center.

---

## Source Index

| # | Source | URL | Date | Used in |
|---|--------|-----|------|---------|
| 1 | Notion Help — Layouts | https://www.notion.com/help/layouts | 2025 | S1 |
| 2 | Notion blog — Updating page design | https://www.notion.com/blog/updating-the-design-of-notion-pages | 2025 | S1 |
| 3 | Notion Help — Style & customize | https://www.notion.com/help/customize-and-style-your-content | 2025 | S1 |
| 4 | Landmark Labs — Page width tutorial | https://www.landmarklabs.co/notion-tutorials/notion-page-width-default | 2025 | S1 |
| 5 | Potion — Content width guide | https://beta.potion.so/guides/custom-styles/content-width-and-responsive-layouts | 2025 | S1 |
| 6 | Vercel changelog — Dashboard redesign rollout | https://vercel.com/changelog/dashboard-navigation-redesign-rollout | Feb 2026 | S2 |
| 7 | Vercel blog — Dashboard redesign | https://vercel.com/blog/dashboard-redesign | 2025 | S2 |
| 8 | Vercel — The New Side of Vercel | https://vercel.com/try/new-dashboard | 2026 | S2 |
| 9 | Vercel docs — Projects overview | https://vercel.com/docs/projects | 2026 | S2 |
| 10 | Ahrefs — Brand Radar landing page | https://ahrefs.com/brand-radar | 2026 | S3 |
| 11 | Ahrefs Help — About Brand Radar | https://help.ahrefs.com/en/articles/11064852-about-brand-radar | 2025 | S3 |
| 12 | Analyze AI — Brand Radar review | https://www.tryanalyze.ai/blog/ahrefs-brand-radar-review | 2026 | S3 |
| 13 | Rankability — Brand Radar review | https://www.rankability.com/blog/ahrefs-brand-radar-review/ | 2026 | S3 |
| 14 | Ekamoira — Brand Radar review | https://www.ekamoira.com/blog/ahrefs-for-ai-visibility-brand-radar-review-what-it-still-can-t-track-2026 | 2026 | S3 |
| 15 | EWR Digital — Brand Radar pricing | https://www.ewrdigital.com/blog/ahrefs-brand-radar-review-alternatives-pricing-comparison/ | 2026 | S3 |
| 16 | Stormy AI — Tracking AI SoV guide | https://stormy.ai/blog/tracking-ai-share-of-voice-2026-guide-semrush-ahrefs | 2026 | S3 |
| 17 | Rankability — Profound review | https://www.rankability.com/blog/profound-ai-review/ | 2026 | S3 |
| 18 | SE Ranking — Best AI visibility tools | https://visible.seranking.com/blog/best-ai-visibility-tools/ | 2026 | S3 |
| 19 | Sight AI — Visibility software reviews | https://www.trysight.ai/blog/ai-visibility-software-reviews | 2026 | S3 |
| 20 | SMA Marketing — AI visibility tools | https://www.smamarketing.net/blog/ai-search-visibility-tools | 2026 | S3 |
| 21 | Stackmatix — AI search tools comparison | https://www.stackmatix.com/blog/ai-search-tools-software-comparison | 2026 | S3 |
