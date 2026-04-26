# /home Overview Structure — Decision Document
Date: 2026-04-25
Status: PROPOSAL — Adam picks 1 of 3 paths

---

## EXECUTIVE READ

The two designers fought to a productive draw on exactly the question worth fighting about. Designer 1 (Maximalist) argues that Beamix is a dashboard product shaped like Stripe or Mercury — one rich surface that holds the picture and the queue together. Designer 2 (Minimalist) argues that Beamix is a workflow product shaped like Linear or Asana — distinct rooms for seeing and doing, connected by a clean pointer. Both positions are defensible, and both designers cite real precedents. The choice depends on Adam's read of two things: (1) where Sarah's emotional center of gravity lives — overview-as-place (the entire product fits on one surface) vs. work-as-place (the product guides her from briefing into action step by step) — and (2) whether Beamix's page inventory is closer to Stripe (12 product lines, summary-router home is necessary) or Linear (one dominant workflow, work-centric home wins). My recommendation: **Path C — Hybrid** — keeps /home and /inbox as sibling pages with distinct URLs and distinct cognitive jobs, but enriches /home toward Maximalist density so the "picture" is fully visible without burying the queue. KPIs that belong on the status surface live on /home. KPIs that belong on domain-specific surfaces distribute to /scans, /crew, and /competitors. /archive merges into /scans as the "Completed Items" tab, honoring Adam's explicit constraint. The product has distinct rooms AND each room is fully designed — not a dorm, not a corridor.

---

## WHERE BOTH DESIGNERS AGREE — LOCK THESE

These decisions are not in dispute. Lock them before any implementation begins.

- `/workspace` is a separate page — full-screen immersive agent execution narrative; the Vision doc's 360px step panel and streaming content require real estate a tab cannot provide
- `/competitors` is a separate page — gated to Build/Scale; competitor intelligence is a first-class job with its own sub-IA (`/competitors/[domain]`)
- `/crew` is a separate page — the 11-agent roster is brand-critical; "your AI team" requires a visible surface
- `/schedules` is a separate page — renamed from /automation; "Schedules" describes the page, "Automation" describes a philosophy
- `/reports` is a separate page — Scale-tier only; the client-deliverable artifact that justifies $499/month
- `/settings` contains: Profile tab, Billing tab, Language tab, Notifications tab, Competitors management tab, Team tab (Build/Scale)
- `/archive` does NOT merge into `/inbox` — this is Adam's stated constraint; all three paths honor it
- Multi-domain switcher is chrome — top of sidebar header, scopes every page below it to the active domain; invisible dropdown until user has 2+ domains
- Notification bell is chrome — top-right; bell-icon dropdown for system alerts (billing warnings, score drops, agent failures); never the review queue
- Cmd+K palette and `?` cheatsheet are chrome — available from everywhere
- `/scan` and `/onboarding` are NOT sidebar pages — acquisition and pre-flight surfaces, not product destinations

---

## THE THREE PATHS

### Path A: Maximalist (Designer 1)

The thesis: `/home` is the entire environment. One URL. Everything important lives there as tabs or persistent sections. `/inbox` is not a sibling — it is a tab. `/archive` is not a sibling — it is a History tab.

**Structure:**
- `/home` contains 5 tabs: Inbox / Activity / Insights / History / Schedule
- `/inbox` does NOT exist as a separate URL — review items are in the Inbox tab
- `/archive` does NOT exist as a separate URL — completed items live in the History tab
- Hero score block + Top 3 fixes are always-visible above the tab row
- Sarah-mode default: Inbox tab open; Yossi-mode default: Insights tab open
- Mode is set at onboarding ("Are you running this for your own business, or for clients?")

**Sidebar (7 items):**
`/home` → `/workspace` → `/scans` → `/competitors` → `/crew` → `/schedules` → `/reports` (gated) → `/settings`

**Reference products:** Stripe Dashboard, Mercury, Notion workspace home, PostHog, Vercel, GitHub (tabs-as-modes-not-nav pattern)

**Strongest argument:** Sarah never has to decide "where do I look?" — the morning briefing, the queue, the KPIs, and the history all appear at one URL. Yossi's per-client loop is `/home` + domain switch, repeated 20 times — no URL-to-URL navigation within a single client session.

**Weakest argument:** `/home?tab=inbox` is not a clean URL. Email deep-links to specific items require parameter handling that breaks the back button. Yossi's bookmark is ugly. Tab-state is implementation-dependent; two users sharing a URL land on different tabs.

---

### Path B: Minimalist (Designer 2)

The thesis: Seeing and doing are different attentional modes. They deserve different surfaces, different URLs, different keyboard shortcuts, different chrome. `/home` is a briefing. `/inbox` is a workroom. Neither contains the other.

**Structure:**
- `/home` is slim — hero score + delta + trend + one pointer line to /inbox + one pointer line to /schedules + 3 stat cards + last-scan summary
- `/inbox` is its own sibling page — Linear Triage 3-pane, full work surface, keyboard-first
- `/archive` merges into `/scans` as "Completed Items" tab (Option 6A from Designer 2)
- No tabs on /home — single scrollable page, ~5 sections, scannable in 5 seconds

**Sidebar (8 items):**
`/home` → `/inbox` → `/workspace` → `/scans` → `/competitors` → `/crew` → `/schedules` → `/reports` (gated) → `/settings`

**Reference products:** Linear (Inbox + Triage as siblings), Asana (My Tasks + Dashboards as siblings), GitHub (notifications page separate from home feed), Granola (focused product, slim home), ClickUp/Monday, Slack (three distinct surfaces)

**Strongest argument:** Clean URLs, predictable back button, deep-linkable items (`/inbox/[itemId]` in email), Yossi's bookmark works, `g i` shortcut is deterministic. Cognitive mode separation is HCI-validated: diffuse scanning (home) and focused action (inbox) use different attentional modes; mixing them on one screen adds switching cost.

**Weakest argument:** A slim `/home` that shows 4 data points risks feeling thin for users paying $79-499/month. "All caught up" empty state with no KPIs could read as "Beamix has nothing to show me today" — a perceived-value problem. Yossi's executive-overview moment before a client call is thinner with only 3 stat cards.

---

### Path C: Hybrid (Recommended)

The thesis: The separation argument is correct (sibling pages, clean URLs, distinct attentional modes). The density argument is also correct (/home must earn its place by showing the full picture, not just one number). Path C resolves both by making /home rich without embedding the inbox inside it.

**Structure:**
- `/home` is **rich but not tabbed** — 8 vertical sections, no tabs, single scrollable page
- `/inbox` is its own sibling page with its own URL, its own keyboard surface, its own layout
- The bridge between them is an inline pointer on /home: "3 items waiting in your Inbox →"
- `/archive` merges into `/scans` as "Completed Items" tab (Designer 2's call — honors Adam's constraint)
- KPIs distribute: score, delta, trend, stat cards, engine strip, and recent activity live on /home; per-engine deep-dive lives on /scans; per-agent stats live on /crew; per-competitor data lives on /competitors

**Sidebar (8 items):**
`/home` → `/inbox` → `/workspace` → `/scans` → `/competitors` → `/crew` → `/schedules` → `/reports` (gated) → `/settings`

**Why this is the right call:**
1. Honors URL integrity — `/home` and `/inbox` have distinct, bookmarkable, deep-linkable URLs
2. Honors the density argument — /home is not a slim score badge; it has KPIs, trend, engine strip, activity feed
3. Honors Adam's constraint — /archive is in /scans, not /inbox
4. Mobile-friendly — 8 scrollable sections collapse cleanly; 5 tabs cramp on a 375px screen
5. Resolves the Stripe-vs-Linear false dichotomy — /home looks Stripe-like (rich picture), /inbox works Linear-like (focused action)

---

## THE TRADEOFF MATRIX

| Concern | Path A (Maximalist) | Path B (Minimalist) | Path C (Hybrid — Rec) |
|---|---|---|---|
| Sarah's daily glance experience | Excellent — everything at one URL | Adequate — slim /home, click to /inbox | Excellent — rich /home shows full picture |
| Yossi's work-focus quality | Compromised — tab chrome above work | Excellent — /inbox is fully committed surface | Excellent — /inbox is its own page |
| URL cleanliness | Compromised — `/home?tab=inbox` | Clean — `/inbox`, `/inbox/[itemId]` | Clean — `/home`, `/inbox`, `/inbox/[itemId]` |
| Email deep-links | Brittle — parameter handling required | Clean — `/inbox/[itemId]` from email | Clean — `/inbox/[itemId]` from email |
| Browser back button | Implementation-dependent | Predictable | Predictable |
| URL sharing between users | Broken — landing tab depends on user prefs | Works | Works |
| Keyboard shortcuts (`g i`) | Non-deterministic within tab system | Deterministic | Deterministic |
| Bookmarkable Yossi entry point | Ugly (`/home?tab=inbox`) | Clean (`/inbox`) | Clean (`/inbox`) |
| KPI density on home | Maximum | Minimal | Rich |
| Perceived product value on /home | High | Risk of feeling thin | High |
| Cognitive mode separation | Mixed — seeing and doing in same surface | Sharp | Sharp |
| /archive resolution | History tab on /home | Completed Items tab on /scans | Completed Items tab on /scans |
| Honors Adam's archive constraint | No — /archive moves to /home History tab | Yes | Yes |
| Mobile adaptation | Hard — 5 tabs cramp on 375px | Easy | Easy |
| Stripe-product-shape alignment | Aligned | Misaligned | Partially aligned |
| Linear-workflow-shape alignment | Misaligned | Aligned | Mostly aligned |
| Sidebar item count | 7 | 8 | 8 |
| Empty state clarity on /home | Good — tabs show empty states per type | Risk — slim page looks emptier | Good — sections show empty states per section |
| Onboarding teaching moment | Harder — "click the Inbox tab" | Easier — "click Inbox in sidebar" | Easier — "click Inbox in sidebar" |

---

## MY RECOMMENDATION: PATH C (HYBRID)

Here is why the hybrid wins the argument, not just splits the difference.

**The URL problem is disqualifying for Path A.** Yossi's most important entry point — "I need to review 8 items for client A" — requires a bookmark. His bookmark in Path A is `/home?tab=inbox`. That URL is not guaranteed to persist across sessions (tab state can reset to default), breaks sharing with teammates, and produces a back-button behavior that depends entirely on implementation. These are not minor UX friction points — they are bugs in the fundamental navigation contract. Linear's Inbox and GitHub's Notifications page are sibling pages precisely because their designers understood this. Path A trades clean URL architecture for one fewer sidebar item. That is a bad trade.

**The density problem is solvable without tabs.** Path B's legitimate weakness is perceived thinness on /home. "All caught up — next scan Saturday" is not $79-499/month of value on screen. But the solution is not tabs — it is sections. Path C's /home has 8 vertical sections covering: current score, top 3 fixes, inbox pointer, 4 KPI cards, score trend chart, per-engine performance strip, recent activity feed, and a what's-coming-up footer. That is the picture Sarah paid for. It is fully visible. It does not require clicking a tab. It scrolls naturally.

**The attentional mode argument holds for /inbox.** Designer 2 is correct that Yossi's 10-15 minute focused work sessions on the review queue are harmed by permanent score chrome above the diff view. Sarah's 60-90 second approval sessions benefit from an uncluttered surface that doesn't ask her to look at anything except the item she's reviewing. Keeping /inbox as a dedicated work surface — no score banner, no embedded KPI cards, no "overview" widget at the top — is the right call. The pointer on /home ("3 items waiting →") is the only bridge needed.

**The Stripe-vs-Linear dichotomy is false.** Beamix is not purely Stripe-shaped (it lacks Stripe's 12 product lines that justify a summary-router home) and not purely Linear-shaped (it has too much visibility data to land users in a review queue and call it done). Path C correctly borrows the rich-home pattern from Stripe/Mercury (show the full picture on /home) while borrowing the focused-work pattern from Linear/Asana (/inbox is its own disciplined surface). This is not fence-sitting — it is the honest product shape of Beamix: a visibility platform with an execution loop. The visibility lives on /home. The execution loop lives on /inbox and /workspace.

**Adam's "whole environment" frame is served by rooms, not a great-room.** Adam's exact words: "a whole environment that we are building for the users." Designer 2 is right that a designed environment has rooms. Path C delivers: the briefing room (/home — rich, calm, full picture), the work room (/inbox — focused, keyboard-first, no distractions), the archive room (/scans — scan history + completed items), the team room (/crew — the 11 agents visible and named), the competition room (/competitors), the planning room (/schedules). Movement between rooms is intentional and legible. The sidebar is the hallway.

---

## PATH C — DETAILED /home SPEC

Single scrollable page, no tabs, 8 sections from top to bottom.

---

### Section 1 — Hero Score Block

**Purpose:** Answer "where do I stand right now?" in 5 seconds.

**Contains:**
- Large score number (96px, InterDisplay Medium) with count-up animation on first load
- Delta badge inline: "↑ +6 since Monday" with semantic color (green / amber / red by delta direction)
- Semantic color band for the number itself: red (0-34) / amber (35-59) / green (60-79) / cyan (80+)
- 12-week sparkline running under the number (40px tall, Rough.js style, Geist Mono tabular numerals on hover)
- One-line plain-language diagnosis: "You're mentioned in 3 of 9 AI engines — adding FAQ schema could add +5"
- "Last scan: Tuesday 9:14am · Scan now →" link bottom-right (small, muted text)

**Sarah relevance:** This is her reason to open the app. The number is the emotional anchor.
**Yossi relevance:** Per-client landing point after domain switch. 8-second scan of score + delta before he decides whether to drill.
**Hebrew/RTL:** Score number is universal. Delta badge: "↑ +6 מאז יום שני". Diagnosis in Hebrew if locale is HE. RTL layout mirrors the section.
**Connections:** Click score → Score Drill-down inline (4 layers, no navigation per Vision doc spec). "Scan now →" → triggers scan → toast on completion.

**Empty state (no scan yet):** Hand-drawn URL bar illustration (Rough.js) + Excalifont "Run your first scan →" CTA.
**Loading state:** Rough.js outline arc for the score number; "Loading your score..." in Excalifont.

---

### Section 2 — Top 3 Fixes Ready

**Purpose:** Answer "what should I do right now?" — the primary action surface on /home.

**Contains:**
- 3 RecommendationCards horizontally on desktop, stacked on mobile
- Each card: agent type icon (hand-drawn, Rough.js), headline ("FAQ schema missing"), estimated-impact pill ("+4 score"), credits cost, "Run →" CTA
- Single primary button at right: "Run all top fixes — 14 credits"
- "Show details" disclosure per card for Yossi who wants justification before running

**Sarah relevance:** Her main action. "Run all" is the one click she needs most mornings.
**Yossi relevance:** Reads the details; may selectively run some fixes for a client, not all. The per-card detail disclosure serves him.
**Hebrew/RTL:** CTA: "הפעל תיקונים — 14 קרדיטים". Individual card labels in Hebrew if locale is HE.
**Connections:** "Run →" or "Run all →" → /workspace with agent pre-loaded.

**Empty state (no recommendations):** "Nothing urgent today — your score is healthy" with a soft Rough.js check mark. No fake urgency.

---

### Section 3 — Inbox Pointer Line

**Purpose:** The bridge between the briefing surface and the work surface. One line, no chrome.

**Contains:**
- Single line: "**3 items waiting in your Inbox →**" (deep-link to /inbox)
- If 0 items: "All caught up — nothing to review right now" (no link needed, no CTA)
- If many items: "12 items — review the high-priority ones →" (links to /inbox?priority=high)

**Sarah relevance:** Her decision point. If she sees 0, she closes the tab. If she sees 3, she clicks.
**Yossi relevance:** He bookmarks /inbox directly. This line is his quick-sanity check when he lands on /home after a domain switch.
**Hebrew/RTL:** "3 פריטים ממתינים לביקורת שלך ←" (arrow reverses for RTL).
**Connections:** Click → /inbox.

---

### Section 4 — KPI Cards Row

**Purpose:** Answer "how am I performing this week?" at a glance — the 4 most renewal-critical numbers.

**Contains:**
- 4 cards in a horizontal row (desktop), 2×2 grid (tablet), stacked (mobile):
  - **Mentions this week:** "23 / 9 engines" with trend arrow vs. last week
  - **Citations gained this week:** "+4" with trend arrow
  - **Credits remaining:** "14 of 20" with "Top up →" link if low
  - **Top competitor delta:** "Competitor A is +8 ahead of you" with link to /competitors
- Each card is click-through to the relevant deep-dive page

**Sarah relevance:** "Mentions" and "Citations" are her renewal metrics — she wants these going up.
**Yossi relevance:** Uses "Top competitor delta" most; drills into /competitors from here for client prep.
**Hebrew/RTL:** All numbers are universal. Card labels in Hebrew if locale is HE.
**Connections:** Mentions card → /scans; Citations card → /scans; Credits card → /settings/billing; Competitor delta card → /competitors.

---

### Section 5 — Score Trend Chart

**Purpose:** Answer "is it working?" — the 12-week arc that justifies continued subscription.

**Contains:**
- Line chart: AI Visibility Score over the last 12 weeks (or 12 months if available)
- Hover tooltip: score on that week + what event triggered the change (scan, agent run, approval)
- Event markers on the line: small dots for "scan completed", "agent run approved"
- "Zoom to: 4w / 12w / 6m / all" toggle (Geist Mono tabular numerals, no decorative chrome)

**Sarah relevance:** Renewal-critical. She looks at this before cancelling or upgrading.
**Yossi relevance:** Client-prep data. "Here's the trend over 3 months" for client calls.
**Hebrew/RTL:** Chart reverses X-axis for RTL (most recent on left for HE readers). Labels in Hebrew.
**Connections:** Click any event marker → /scans/[scanId] for that specific scan's detail.

---

### Section 6 — Per-Engine Performance Strip

**Purpose:** Answer "where am I visible?" — the 9 engine scores as a scannable row.

**Contains:**
- 9 EnginePill components in a horizontal row (scrollable on mobile)
- Each pill: engine logo (small), engine name, current score (tabular numeral), color indicator by score range
- Sorted by score descending (your best engine first — positive reinforcement)
- Click any pill → /scans with that engine's drill-down pre-selected

**Sarah relevance:** She knows ChatGPT and Gemini. Seeing "ChatGPT: 61" is meaningful to her.
**Yossi relevance:** He tracks per-engine deltas across clients. This is his "where did we improve" row.
**Hebrew/RTL:** Engine names stay in EN (brand names). Scores are universal. Layout mirrors.
**Connections:** Click any engine pill → /scans filtered to that engine's per-scan history.

---

### Section 7 — Recent Activity Feed

**Purpose:** Answer "what just happened?" — the last 5-10 events in the product.

**Contains:**
- Chronological feed of last 5-10 events (expandable to 20):
  - "Content Optimizer ran · FAQ schema published · Tuesday 9:14am"
  - "Scan completed · Score 47 ↑ +6 · Tuesday 9:14am"
  - "Homepage copy approved · ready to publish · Monday 4:22pm"
  - "Competitor Intelligence ran · 2 new gaps found · Friday 2:01pm"
- Each event is click-through to the relevant surface (scan → /scans/[id], agent run → /workspace/[jobId] or /inbox/[itemId], approval → /inbox Done tab)
- Relative timestamps (Geist Mono): "2 days ago", "Tuesday"

**Sarah relevance:** "Did the work I approved actually do anything?" — this feed confirms it.
**Yossi relevance:** Cross-client awareness — he switches domains but this feed shows recent activity for the active domain.
**Hebrew/RTL:** Timestamps in Hebrew format. Action text in Hebrew if locale is HE.
**Connections:** Click any event → relevant page.

---

### Section 8 — What's Coming Up Footer

**Purpose:** Answer "what does Beamix have planned?" — passive awareness of upcoming automated activity.

**Contains:**
- "Next scheduled scan: **Saturday morning**" (links to /schedules)
- "Next agent run: **Content Optimizer · Tuesday**" (links to /schedules)
- "Next billing date: **May 1**" (links to /settings/billing)
- Visually quiet — small text, muted color, no emphasis icons

**Sarah relevance:** Peace of mind. "The product is running in the background — I don't need to do anything."
**Yossi relevance:** Cross-client schedule awareness. "Is client A scheduled for a scan this week?"
**Hebrew/RTL:** "סריקה מתוכננת: **יום שבת בבוקר**". Links remain functional.
**Connections:** "Saturday morning" → /schedules. "Content Optimizer" → /schedules.

---

**Total /home:** 8 sections, vertical scroll, NO tabs, NO embedded inbox. First paint (Sections 1-3) contains everything Sarah needs on a typical morning. Sections 4-8 scroll in for users who want more depth. Mobile: Sections 1-3 above the fold; 4-8 scroll.

---

## PATH C — DETAILED /inbox SPEC

URL: `/inbox` — its own page, its own layout, its own muscle memory.

**Layout: Linear Triage 3-pane**
- **Left pane (280px):** Item list. Agent type icon · first line of content · timestamp · J/K keyboard navigation · multi-select checkbox.
- **Center pane (flexible):** Preview and diff view. Content items show source text vs. agent output in a clear before/after comparison. Schema items (JSON-LD) shown syntax-highlighted in Geist Mono. Always-visible comparison — no "click to expand."
- **Right side / sticky footer (ActionBar):** Approve (`A`) · Reject (`X`) · Request Changes (`R`). `Cmd+A` for "Approve all selected."

**Tabs at top of /inbox (3 tabs only):**
- **Pending** (default) — items awaiting review right now
- **Drafts** — items the user started editing but didn't finish approving
- **Live** — currently-running agent jobs; links out to /workspace for full-screen view (Hybrid path: Live tab shows a compact status list, not the full streaming workspace)

**Sidebar filters (collapsible — Yossi-facing, hidden by default for Sarah):**
- By client domain (Build/Scale: multi-domain users)
- By agent type
- By priority (auto-set by impact score from /home Section 2)
- By date range

**What lives on /inbox ONLY:**
- The review queue and diff view
- The Approve / Reject / Request Changes action surface
- The empty state ("Nothing to review — you're all caught up" with Rough.js agent illustration)
- Keyboard shortcuts `A`, `R`, `X`, `J`/`K`, `Cmd+A`
- Multi-select bulk actions (Yossi: "Approve all 4 for client A")

**What does NOT live on /inbox:**
- Score banner or score chip at the top — /home is the briefing; /inbox is the work
- KPI cards, trend charts, or activity feed
- Schedule configuration, scan history, competitor data
- Any persistent chrome that competes with the diff view for eye attention

**Key UX decision: no score chip on /inbox.** Designer 1 proposed a compromise: a small score chip in the top-right corner as a "passive reference." Path C rejects this. The chip, however small, is diffuse-mode bait inside a focused-mode surface. Yossi spends 10-15 minutes focused on diffs; a number in the corner will either pull his eye away from the work (bad) or be systematically ignored (wastes space). The pointer on /home is enough. When he needs the score, he has /home.

**Connections:**
- IN: "3 items waiting in your Inbox →" pointer on /home; sidebar nav; email deep-link `/inbox/[itemId]`; `G then I` shortcut; toast notification from completed agent run
- OUT: Approve → item fades to Done state, next item auto-focuses; "Request Changes" → item returns to agent queue; "Run an agent →" (empty state CTA) → Cmd+K or /crew; Live tab "View in workspace →" → /workspace/[jobId]

**States:**
- Loading: SkeletonBlock cascade (Rough.js outlines snap in, content stagger-fades per emilkowal pattern)
- Empty (Pending tab): Rough.js agent illustration + Excalifont "All caught up — nothing to review right now" + "Run an agent →" CTA
- Error: "Couldn't load your inbox —" with retry; per-item error: "This output failed QA — re-run →"

---

## PATH C — DETAILED /scans SPEC (absorbing /archive)

URL: `/scans` — history surface for both scans and completed agent items.

**Top-level structure:**
- Scan history list — DataList with date, score, delta-from-previous, trigger type (manual / scheduled / agent-triggered)
- J/K navigation for Yossi

**Tabs on /scans (3 tabs):**
- **All Scans** (default) — full history list; click any row → /scans/[id] per-scan detail
- **Completed Items** — the absorbed /archive content: approved, rejected, and published agent output items; filterable by agent type, domain, date range; "Export CSV" CTA for Yossi's client invoicing
- **Per-Engine** — score for each engine over time; 9 engine sparklines on one surface; Yossi's analytics deep-dive

**Per-scan detail view** (on row click, inline expand OR sub-route /scans/[id]):
- ScoreDisplay (historical, no count-up animation)
- Per-engine breakdown via EnginePill components
- Recommendations that scan generated
- Delta view: what improved vs. regressed since the previous scan

**"Completed Items" tab — the absorbed /archive:**
- Items that have been Approved, Rejected, or Published, organized chronologically
- Filters: agent type / outcome (Approved / Rejected) / domain / date range
- "Export CSV →" button (Build/Scale only) — the Yossi invoicing artifact
- Click any item → view the original diff and the outcome (read-only, not re-actionable)
- Search within completed items by agent name or keyword

**Why this works for Adam's constraint:**
Merging /archive into /scans (not /inbox) preserves the cognitive boundary Adam identified: /inbox is the work surface, /scans is the history surface. Both archive content (what did we do) and scan history (what did the scans find) are retrospective — they belong on the same page. This is also the architecture that makes Yossi's Friday invoicing ritual one-stop: open /scans, click "Completed Items" tab, filter by client domain + current month, export CSV.

---

## KPI DISTRIBUTION MAP (Path C)

Where every KPI lives. Each KPI appears in exactly one primary location and at most one secondary location.

| KPI | Primary Location | Secondary Location | Reasoning |
|---|---|---|---|
| Score (current) | /home Section 1 (hero) | — | The product's headline number |
| Score delta | /home Section 1 (inline badge) | — | Context for the number |
| Score 12-week sparkline | /home Section 1 (under hero) | — | Story arc — "is it working?" |
| Score 12-week trend chart | /home Section 5 | — | Full chart, not sparkline |
| Score 1-year trend | /home Section 5 (zoomed) | /scans All Scans tab | Long memory |
| Score per historical scan | /scans All Scans list | — | Drill depth for Yossi |
| Top 3 fixes ready | /home Section 2 | — | Action attached to picture |
| Pending review count | /home Section 3 (pointer line) | /inbox tab badge | Bridge, then destination |
| Mentions this week | /home Section 4 (KPI card) | /scans Per-Engine tab | Glance on home, depth on scans |
| Citations this week | /home Section 4 (KPI card) | /scans Per-Engine tab | Same pattern |
| Credits remaining | /home Section 4 (KPI card) | /settings/billing | Glance vs. manage |
| Top competitor delta | /home Section 4 (KPI card) | /competitors (full) | Glance vs. full analysis |
| Per-engine performance (current) | /home Section 6 (strip) | — | Scannable row on home |
| Per-engine performance (over time) | /scans Per-Engine tab | — | Trend depth stays on /scans |
| Per-engine raw query output | /scans/[id] per-engine drill | — | 4th-layer depth, Yossi-only |
| Recent activity (last 5-10 events) | /home Section 7 | — | "What just happened?" |
| Full activity history | /scans Completed Items tab | — | Full log |
| Per-agent stats (runs, quality score) | /crew per-agent cards | /home Section 7 (event mentions it) | Agent-job context lives on /crew |
| Per-agent run history | /crew/[agentType] detail | — | Deep per-agent, Yossi-weekly |
| Competitor rankings (current) | /competitors (Build/Scale) | /home Section 4 (delta card) | Full surface gated |
| Competitor profile detail | /competitors/[domain] | — | Drill depth |
| Completed / approved items | /scans Completed Items tab | — | Not on /inbox (Adam's constraint) |
| Upcoming scan schedule | /home Section 8 (footer) | /schedules | Pointer vs. config |
| Upcoming agent schedule | /home Section 8 (footer) | /schedules | Pointer vs. config |
| Credits burn rate | /settings/billing | — | Management context, not glance |
| Plan tier | /settings/billing | — | Rarely checked |
| Team members (Build/Scale) | /settings/team | — | Admin context |
| Domain list | Chrome dropdown | /settings/domains | Always accessible |
| System notifications | Chrome bell dropdown | — | Not a page, not on /inbox |
| Billing next date | /home Section 8 (footer pointer) | /settings/billing | Awareness vs. action |

**The distribution principle:** Every KPI appears where the job it serves lives. Glanceable status lives on /home. Drill-depth lives on the domain page (/scans for scan history, /crew for agent history, /competitors for competitive analysis). Configuration lives on /settings or /schedules. Nothing is duplicated without purpose.

---

## SARAH'S DAY (PATH C)

**07:42 — Coffee, iPad, Beamix**
1. Opens app. Lands on /home (her bookmark, or default landing). Sees score 47 ↑ +6. Sparkline shows upward curve. One diagnosis line: "Adding FAQ schema could add +5."
2. Sees "3 items waiting in your Inbox →" pointer under the Top 3 Fixes section. She's already motivated — the score is up, the work is visible.
3. Clicks "Run all top fixes — 14 credits." Navigates to /workspace. Watches agent run for 30 seconds, trusts it, opens another browser tab.
4. Toast notification: "Content Optimizer ready for review." She clicks. Lands on /inbox/[itemId] — the item is pre-focused. Reads the diff. Approves. Clicks next item. Approves. Third item: "Request Changes" with a note.
5. Back to /home with browser back. Sees the activity feed has updated: "Content Optimizer approved, 2 items published." Closes the tab. Total: ~3 minutes. Pages visited: /home, /workspace, /inbox.

---

## YOSSI'S DAY (PATH C)

**08:55 — Client work begins**
1. Opens browser. Bookmark: /inbox for client-1-tel-aviv-medical-group.co.il (domain switcher auto-set from yesterday's session). 8 pending items across 3 clients.
2. Filters by client. Reviews 5 items using J/K navigation. Batch-approves 4 with Cmd+A after diff-checking each. Rejects 1 with feedback typed in the Request Changes field.
3. Domain switcher → client 2. /inbox rescoped. Reviews 3 items. Approves 2.
4. Before a 10am client call: Cmd+K → "home client-1" → /home for client 1. Sees score 62 ↑ +3, top competitor is 8 points ahead. KPI cards show mentions up this week. 30-second brief.
5. /competitors (sidebar or Cmd+K) → pulls competitor delta detail for client call. Notes 2 new gaps. Starts /workspace for Competitor Intelligence agent. Leaves to join call.
~14-minute session, 4 pages, all URL-clean and keyboard-navigable.

---

## OPEN QUESTIONS FOR ADAM

**1. Path A, B, or C — pick one.**
The recommendation is Path C (Hybrid). Adam needs to explicitly confirm. If there is a strong instinct that Sarah should never navigate between /home and /inbox — that one URL is her entire morning — Path A is the correct override. If there is a strong instinct that /home should be as light as possible and Sarah should land directly in her work, Path B is correct. Path C is the synthesis that tries to serve both the picture and the work without compromising either.

**2. Path C: confirm /scans absorbs /archive (Option 6A) or keep /archive as its own page?**
Path C recommends /archive merges into /scans as the "Completed Items" tab. This honors Adam's constraint (no merge into /inbox) while eliminating a sidebar page that both designers agree is a non-destination. However, if Adam wants /archive as its own sidebar page — a dedicated "what Beamix shipped for me" portfolio surface — that is a valid choice. The tradeoff: one more sidebar item, but /archive becomes a first-class surface Sarah might actually visit to feel the cumulative value of the product (a retention benefit).

**3. Sarah's default landing page: /home or /inbox?**
Path C recommends /home as the default landing on every app open. This gives Sarah the full briefing before she enters the work. But if data after launch shows Sarah is skipping /home and going straight to /inbox via the pointer link every morning, we should change the default landing to /inbox for Sarah-shaped users. For now: /home is the default for all users. Cmd+K and sidebar shortcuts let Yossi customize his entry point. After 30 days of usage data, revisit.

**4. Mobile bottom nav — which 4 items?**
Path C has 8 sidebar pages. On mobile, a bottom tab bar can show max 4-5 items + "More" overflow. Proposed order: `/home` → `/inbox` → `/scans` → `/crew` → `More` (overflow: /workspace, /competitors, /schedules, /reports, /settings). Alternative: drop /crew from the bottom nav and promote /workspace (the most visually dramatic experience) to slot 3. Adam's call: which 4 pages should be in the bottom tab bar?

**5. KPI density on /home (Path C): ship all 8 sections at launch, or ship Sections 1-4 first and expand later?**
Path C specifies 8 sections on /home. Shipping all 8 at launch gives Sarah and Yossi the full picture from day one. But sections 5-8 (trend chart, engine strip, activity feed, footer) require more implementation work and more data to be meaningful. A phased approach: launch with Sections 1-4 (score + fixes + inbox pointer + KPI cards), add Sections 5-8 in the first fast-follow sprint. This keeps the launch path clean without compromising the /home concept. Recommendation: ship all 8. The trend chart and activity feed are the sections that demonstrate Beamix is working over time — hiding them at launch undermines the retention narrative. But Adam decides.

---

## SUMMARY

Three paths were laid out. The recommendation is Path C (Hybrid). It keeps /home and /inbox as sibling pages with clean URLs, distinct attentional modes, and predictable navigation — while enriching /home with the full picture (score, fixes, KPIs, trend, engine strip, activity, schedule) so it earns its place as Sarah's daily anchor. /archive merges into /scans as the "Completed Items" tab, honoring Adam's constraint and serving Yossi's invoicing workflow. The sidebar has 8 items, all with distinct jobs, none redundant.

The document above contains:
- 3 paths with full tradeoff comparison
- Recommendation for Path C with reasoning
- Detailed /home spec (8 sections, no tabs)
- Detailed /inbox spec (3-pane, 3 tabs, no score chrome)
- Detailed /scans spec (absorbing /archive as Completed Items tab)
- Full KPI distribution map (where every data point lives)
- Sarah's full day on Path C (5 steps, 3 pages, 3 minutes)
- Yossi's full day on Path C (5 steps, 4 pages, 14 minutes)
- 5 open questions for Adam to answer before implementation begins
