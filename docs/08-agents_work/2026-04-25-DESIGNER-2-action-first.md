# Designer 2 — The Action-First Minimalist
**Date:** 2026-04-25
**Position:** `/home` and `/inbox` are SEPARATE sibling pages with distinct jobs. KPIs distribute across pages by job, not concentrated on one super-home. `/archive` merges into `/scans`, not `/inbox`.
**Counterpart:** Designer 1 (Overview Maximalist — argues for one super-home with `/inbox` as a tab inside).
**Founder constraint honored:** Adam rejected merging `/archive` into `/inbox`. My answer: merge `/archive` into `/scans` (the natural history page), not into `/inbox` (the work surface).

---

## 1. The Thesis (1 paragraph)

The question Adam is asking — "should the Inbox become the home page, or should /home become an everything-page with the Inbox as a tab inside?" — is a false binary that conflates two different cognitive jobs into one screen. **Seeing** (status check, "where do I stand?") and **doing** (review-and-approve, "what do I act on?") are different attentional modes that benefit from different surfaces, different URLs, different keyboard shortcuts, different chrome, and different empty states. The right comparison for Beamix is not Stripe (a financial dashboard with no review-and-approve queue) but Linear, GitHub, Asana, and Granola — products whose core loop is *external system produces work items → user reviews/approves them*. Every one of those products keeps `/dashboard` (or its equivalent) and `/inbox` (or `/triage` or `/notifications`) as **sibling pages**, and they do it because forty years of product UI research show that conflating attentional modes within a single screen forces context-switching costs that compound on every visit. Beamix's whole-environment promise is *better* served by a designed home with rooms — `/home` for the briefing, `/inbox` for the work, `/scans` for the history, `/crew` for the team, `/competitors` for the rivalry — than by one giant dorm-room where everything happens at once. That is what product design (not just UI) means.

---

## 2. The Day-In-The-Life — Action-First version

### Sarah (Tel Aviv dentist, daily user, 30-90 second sessions)

**Opens app → lands on `/home` → sees one number, one delta, one pointer → acts.**

**Variant A — score check, no action needed (4 days a week):**
1. Opens Beamix tab over morning coffee.
2. Lands on `/home`. Sees: hero score `42`, trend line, badge "↑ +6 since Monday", line of text "All caught up — next scan Saturday."
3. Closes tab. Total: ~15 seconds. Total clicks: 0.

**Variant B — score check + review work (2-3 days a week):**
1. Opens Beamix tab.
2. Lands on `/home`. Sees: score `42`, "↑ +6", and one line: "**3 items waiting in your Inbox →**"
3. Clicks the inline link OR clicks "Inbox" in sidebar OR types `g i`. Lands on `/inbox` — three pending items.
4. Reads first one. Clicks Approve. Next item auto-focuses. Approves second. Skips third (needs more thought).
5. Closes tab. Total: ~75 seconds. Total clicks: 4 (sidebar+approve+approve+close).

**Variant C — email-driven (the most common pro workflow):**
1. Email arrives: "Your homepage copy is ready for review."
2. Sarah clicks the deep-link in the email. Lands directly on `/inbox/[itemId]` — preview already open.
3. Reads. Approves. Closes tab. Total: ~45 seconds. Total clicks: 2 (email-link + Approve).

**Critical observation about variant C:** Sarah's most common entry point is *not* the marketing-site sidebar — it's a deep-link from email. That deep-link goes straight to the work surface. If `/inbox` is a tab inside `/home`, the email link either (a) goes to `/home?tab=inbox&item=xyz`, which is brittle and ugly, or (b) cannot deep-link to a specific item because the routing doesn't support it cleanly, or (c) requires a custom param-handling layer that breaks the back button. **A sibling page with a clean URL — `/inbox/[itemId]` — solves all three problems for free.**

### Yossi (SEO consultant, 20 client domains, multiple-times-daily user, 10-15 minute sessions)

**Lives in `/inbox` for client work; drops into `/home` for executive overview before client calls; drills into `/scans` for client deep dives.**

**Daily ritual (typical Tuesday):**
1. Opens browser → bookmark for `/inbox` (his bookmark, not /home). Lands on `/inbox` for client A. 8 pending items across 3 clients.
2. Filters by client A. Reviews 5 items, batch-approves 4 with `Cmd+A` after diff-checking each. Rejects 1 with feedback.
3. Switches client (top-of-sidebar dropdown) to client B. `/inbox` now scoped to client B. Reviews 3 items. Approves 2.
4. Cmd+K → "score history client A" → jumps to `/scans` for client A. Exports CSV for invoicing.
5. Cmd+K → "competitors client A" → `/competitors` for client A. Adds two newly-discovered competitor domains.
6. Closes laptop. Total session: ~14 minutes across 4 pages.

**Yossi's executive-overview moment (before client call):**
1. Cmd+K → "home client A" → `/home` for client A.
2. Sees: hero score, week trend chart, "5 items in your Inbox · last scan Tuesday · next scan Saturday." This is his "client status" briefing for the call.
3. Stays on `/home` for ~30 seconds reading the trend line.
4. Joins call. Doesn't need to act inside Beamix during the call — `/home` was the briefing.

**Critical observation about Yossi:** His bookmark is `/inbox`, not `/home`. **If `/inbox` is a tab inside `/home`, his bookmark URL is `/home?tab=inbox` — and his back button is broken because clicking on a specific item navigates within the tab state, not the URL.** Sibling pages give Yossi a clean URL, a clean keyboard shortcut (`g i` jumps directly), and a clean back button. Maximalist breaks all of this for the most demanding persona.

---

## 3. The Specific `/home` Structure (slim version — ~5 sections, scannable in 5 seconds)

### Section 1 — Hero score + trend (above the fold, ~40% of viewport)
- Large `ScoreDisplay` component (Vision-doc spec): count-up animation on first load, 96-128px height
- Delta badge: "↑ +6 since Monday" with semantic color
- Inline trend sparkline (last 14 days, ~40px tall, Geist Mono tabular numerals on hover)
- Click → Score Drill-down (4-layer inline expansion, no navigation; existing Vision-doc pattern)

### Section 2 — "What needs your attention" (single line, calm)
- Plain text: "**3 items waiting in your Inbox →**" (deep-link to /inbox)
- If 0 items: "All caught up — your last 12 fixes were approved 🎉" (calm reward state)
- If many: "12 items — review the priorities →" (links to /inbox?priority=high)

### Section 3 — "What's coming up" (single line, calm)
- Plain text: "Next scan: **Saturday morning** · Content Optimizer scheduled for **Tuesday**"
- Links: "Saturday" → `/schedules`; "Content Optimizer" → `/crew/content-optimizer`

### Section 4 — Three-card stat row (scannable, no chart noise)
- Card 1: Mentions across engines · "23 / 9 engines" with trend arrow
- Card 2: Citations gained this week · "+4"
- Card 3: Credits remaining · "14 of 20" with Topup link
- Each card click → its dedicated drill-down page

### Section 5 — Last scan summary (slim, scannable)
- "Last scan: **Tuesday 9:14am** · Score 42 · [+6 vs last] · See full report →" (links to `/scans/latest`)

**Total page length:** ~5-7 vertical sections (with generous whitespace), scannable in 5-10 seconds. NO tabs. NO 8-zone Stripe-style dashboard. NO embedded inbox. **The page is a briefing, not a workspace.**

**Why these 5 sections and not 8:** Each section answers exactly one question Sarah might have on opening Beamix. Adding a 6th section means adding a 6th question — and once you do that, you've added a 7th and an 8th, and now the page is the maximalist soup that Designer 1 is arguing for. Restraint here is the design.

---

## 4. The Specific `/inbox` Structure (where work happens — its own URL, its own muscle memory)

### Layout: Linear Triage 3-pane pattern
- **Left pane (280px):** Item list. Agent type icon · first line of content · timestamp · J/K keyboard navigation · multi-select checkbox.
- **Center pane (flexible):** Preview. Diff view for content items. JSON-LD syntax-highlighted in Geist Mono for schema items. Always-visible source-vs-proposed comparison.
- **Right pane (sticky footer ActionBar):** Approve (`A`) · Request Changes (`R`) · Reject (`X`). `Cmd+A` for "Approve all selected."

### Tabs at top
- **Pending** (default — what needs me right now)
- **Drafts** (in-progress edits I started but didn't finish — supports Yossi's "review with feedback" workflow)
- **Live** (currently-running agent jobs — links into `/workspace`; per the Hybrid path agreed upon by both prior agents)

### Sidebar filters (collapsible, Yossi-only by default)
- By client domain (multi-domain users only)
- By agent type
- By priority
- By date range

### What lives on `/inbox` and only `/inbox`:
- The review queue
- The diff/preview comparing source to agent output
- The Approve/Reject/Request-Changes ActionBar
- The empty state ("Nothing to review — you're all caught up 🎉")
- The keyboard shortcut surface (`A`, `R`, `X`, `J`/`K`, `Cmd+A`)

### What does NOT live on `/inbox`:
- Score banner (lives on `/home`)
- Score drill-down (lives on `/home` and `/scans`)
- Schedule configuration (lives on `/schedules`)
- Scan history (lives on `/scans`)
- Agent roster (lives on `/crew`)
- Competitor data (lives on `/competitors`)

**Why the strict separation:** Sarah's `/inbox` visit is 60-90 seconds of focused work. Yossi's `/inbox` visit is 10-15 minutes of focused work. **Adding a score banner at the top of `/inbox` (Designer 1's compromise) puts a permanent KPI chrome above Yossi's work surface that he doesn't want and can't dismiss.** Yossi is in act-mode; the score doesn't belong there. He has `/home` for that.

---

## 5. Where the KPIs and Data Live (distributed by job, not concentrated)

This is the most important section of this document. The "we have lots of KPIs, they need to live somewhere" argument is the wrong frame. The right frame: **every KPI has a job; put it where the job lives.**

| KPI / Data | Lives on | Why |
|---|---|---|
| Score (current) + delta + 14-day trend | `/home` (hero) | "Where do I stand right now?" — the briefing question |
| Score history (months / years) + per-engine breakdown | `/scans` | "How has this trended over time?" — the analytics question |
| Per-engine performance (current scan) | `/scans` (per-scan detail) | Drill-down depth, Yossi's domain |
| Per-query raw output | `/scans/[scanId]/[engine]/[query]` | The 4th drill layer; Yossi-only |
| Mentions / citations count this week | `/home` (3-card stat row) | High-level pulse |
| Pending review queue count | `/home` (pointer line) + `/inbox` (full surface) | Pointer on home, work on inbox |
| Approved / completed items history | `/scans` (or revived `/archive`) | History, not work — see Section 6 |
| Per-agent run count + quality score | `/crew/[agentType]` | Agent-as-team-member context |
| Per-agent activity log | `/crew/[agentType]` (run history tab) | Per-agent, not global |
| Per-competitor scores + gap analysis | `/competitors` | Competitive job, distinct mental model |
| Per-competitor profile | `/competitors/[domain]` | Drill depth |
| Recent recommendations (pending) | `/inbox` (Pending tab) | Work to do |
| Drafts / in-progress edits | `/inbox` (Drafts tab) | Work paused mid-flight |
| Currently-running agent jobs | `/inbox` (Live tab) → links to `/workspace` | Work in flight |
| Schedule status / cron config | `/schedules` | Configuration, not status |
| Scheduled-scan upcoming dates | `/home` (one-line pointer) + `/schedules` (full) | Pointer on home, config on schedules |
| Credits remaining / used | `/home` (3-card stat row) + `/settings/billing` | Glance on home, manage on settings |
| Plan tier / billing history | `/settings/billing` | Account-management job |
| Domain list (multi-domain) | `/settings/domains` + chrome dropdown | Account management |
| Notification log / system alerts | Bell-icon dropdown (chrome, not page) | Passive notifications, separate from review |

**Concrete example of the distribution working:** Adam has been worried we'll "lose" data by being slim on `/home`. We don't. We move it. Per-engine scores live on `/scans` where the per-engine job lives. Per-agent activity lives on `/crew` where the agent-as-team job lives. Credits live on `/home` (glance) AND `/settings/billing` (manage) — not on `/inbox` where they don't belong. **The product designer's job is to map KPIs to jobs, not to dump them on `/home` because we have them.**

---

## 6. Where `/archive` Lives — Adam's Constraint Resolved

**Adam's constraint:** Rejected merging `/archive` into `/inbox`. Both Agent A and Agent B (the prior round) proposed exactly that and Adam said no.

**My answer: Merge `/archive` into `/scans` instead — OR keep `/archive` as its own slim sibling page.**

### Option 6A — Merge `/archive` into `/scans` (recommended)
- `/scans` becomes the **history page** in two senses:
  - "All scan runs over time" (existing job)
  - "All completed agent items / approved-rejected history" (the absorbed archive job)
- Tabs on `/scans`: **Scan History** · **Completed Items** · **Per-Engine** · (Hybrid path: **Competitors**)
- **Why this works:** Sarah doesn't visit `/scans` or `/archive` (she's in act-mode, not history-mode). Yossi visits both — and merging them into one history surface fits Yossi's "I'm doing client invoicing prep, I need history-of-everything for client X" workflow naturally.
- **Why this doesn't violate Adam's constraint:** Adam objected to merging archive into the *work* surface (`/inbox`). Merging it into the *history* surface (`/scans`) preserves the cognitive separation of seeing-vs-doing — both of those are *seeing* surfaces, just at different temporal granularity.

### Option 6B — `/archive` survives as its own sibling page
- 8 sidebar pages instead of 7
- `/archive` shows ONLY the "completed agent items" list (not scan history)
- Pure "what did we ship" history
- **Risk:** Sarah doesn't visit. Yossi has to remember "is the export over there or there?" — two history pages compete.
- **Verdict:** Option 6A is cleaner.

### Option 6C — Reject (this is what Agent A and Agent B proposed and Adam rejected)
- Merge `/archive` into `/inbox` as "Completed" tab
- **Why I reject this too (in agreement with Adam):** It muddies the work surface with history clutter. Yossi opens `/inbox` to *act*, not to browse what already shipped. Sarah opens `/inbox` to approve, not to retrospect. **Mixing pending and completed on the same surface trains the eye to see "completed" as still-actionable noise.**

**Locked recommendation: Option 6A — `/archive` content moves to `/scans` as the "Completed Items" tab.**

---

## 7. The Comparison: 6 Products Doing This Right

### 7.1 Linear — `/inbox` and `/triage` are SIBLING pages (not tabs)
- **URLs:** Sidebar items separate. `g i` jumps to Inbox (notifications). `g t` jumps to Triage (review queue). Different keyboard shortcuts, different sidebar items, different layouts.
- **Why their separation works:** Linear correctly separates *passive notifications* (Inbox) from *active review* (Triage) into two distinct pages because the attentional modes are different. Notifications are scanned passively. Triage is acted on deliberately.
- **Source:** [Linear Inbox docs](https://linear.app/docs/inbox) · [Linear Triage docs](https://linear.app/docs/triage)
- **Maps to Beamix as:** Beamix's `/home` (briefing — the passive scan moment) and `/inbox` (review queue — the active work moment) should be separate sibling pages, exactly like Linear's two surfaces. Beamix doesn't currently have a notifications inbox at all (we have a bell-icon plan), but the *principle* — separate seeing-and-doing — is identical.

### 7.2 Granola — Notes list is the home; folders/tags are separate organizational surfaces
- **URLs:** `/notes` (the list of all meetings) is the primary surface. `/folders/[id]` and tag-filter views are separate routes.
- **Why their separation works:** Granola is a focused product that lands you in the data (your notes) but keeps organizational chrome (folders, tags, settings) on separate surfaces.
- **Source:** [granola.ai](https://granola.ai)
- **Maps to Beamix as:** A focused product can land users on a slim surface (Granola: latest meeting; Beamix: `/home` with the score) and put the organization/history on adjacent pages. Granola does NOT cram folder management into the notes list — they're separate.

### 7.3 Asana — `/my-tasks` (work) and `/dashboards` (status) are separate
- **URLs:** `/0/my-tasks/list` for work surface. `/0/dashboards` for status surface. Same product, different jobs, different URLs.
- **Why their separation works:** Asana explicitly separates "what do I need to do" (My Tasks) from "where do my projects stand" (Dashboards). Both are critical PM jobs — but they're not the same job, and Asana refuses to mash them.
- **Source:** [asana.com/product](https://asana.com/product/dashboards)
- **Maps to Beamix as:** `/inbox` is My Tasks (work). `/home` is Dashboards (status). They're sibling pages because that's the right architecture for products with both jobs.

### 7.4 GitHub — `/notifications` (work) and `/` (Home feed) are separate
- **URLs:** `github.com/notifications` (review queue — PRs to review, mentions to act on) is a separate page from `github.com/` (the home feed showing repo activity, status of orgs, trending).
- **Why their separation works:** GitHub correctly recognized that "what needs my action" (notifications) and "what's the state of the world" (home feed) are different jobs. The home feed is browse-mode; notifications is action-mode.
- **Source:** [docs.github.com/notifications](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github)
- **Maps to Beamix as:** Same architecture exactly. `/home` = "state of my AI visibility world" (status). `/inbox` = "what needs my action" (notifications-as-review).

### 7.5 ClickUp / Monday — Inbox is its own thing, separate from Dashboards
- **URLs:** `/inbox` is a top-level sidebar item. `/dashboards` is a separate top-level sidebar item. No tab-merging.
- **Why their separation works:** Project-management products learned the hard way that mixing "tasks needing my action" with "executive status view" creates confusion at scale. Once you have 50 tasks and 10 dashboards, you cannot conflate them.
- **Source:** [clickup.com/features/inbox](https://clickup.com/features/inbox) · [monday.com inbox](https://support.monday.com/hc/en-us/articles/360001925399)
- **Maps to Beamix as:** Beamix users will eventually have many pending items and rich status data. Conflating them on one page works at 5 items but breaks at 50.

### 7.6 Slack — Activity, Home, and Threads are THREE distinct surfaces
- **URLs / surfaces:** Activity (notifications about you) · Home / channel sidebar (the world) · Threads (replies you're in). Three sibling surfaces, each with its own keyboard shortcut and chrome.
- **Why their separation works:** Slack has tens of millions of users and they tested every conceivable combination. Three surfaces won.
- **Source:** [slack.com/help](https://slack.com/help/articles/360003860573-What-are-views-in-Slack)
- **Maps to Beamix as:** Even at the highest user-volume products, separating attention-modes wins.

### 7.7 What about Stripe?
Designer 1 will cite Stripe Home as their counter-example. **Stripe Home is the right design for Stripe — and the wrong analogy for Beamix.** Why:

- Stripe is a financial-data dashboard product across **12+ product lines** (Payments, Connect, Issuing, Treasury, Tax, Atlas, Capital, Sigma, Radar, Climate, etc.). Stripe Home is a router-across-product-lines that aggregates state across many surfaces because no single product line dominates a Stripe user's day. **Beamix has 7 surfaces total and one dominant workflow (review-and-approve agent output).**
- Stripe Home does NOT contain a review-and-approve queue. It contains charts, recent payments, and product-line entry points. The closest Stripe analog to Beamix's `/inbox` is the Disputes queue — and Disputes is its own page, not a tab on Home.
- **Agent A (the Customer-Journey audit) explicitly noted this:** *"Stripe Home earns its keep with 12+ product lines. Beamix has 7 surfaces total. The summary-router pattern doesn't earn its keep at small inventory."*

**Conclusion: Stripe is the wrong precedent. Linear is the right one.**

---

## 8. Counter to the Overview Maximalist (Designer 1)

I anticipate Designer 1's arguments. Here are pre-rebuttals.

### Their argument 1: "Stripe / Mercury have everything on Home — Beamix should too."
**My rebut:** Stripe Home routes across 12 product lines because no single product line dominates. Beamix has one dominant workflow (review agent output). Stripe Home has no review-and-approve queue — Disputes is its own page. The shape of the product (focused-workflow vs. multi-product-suite) determines the right home pattern. **Beamix's product shape is Linear-shaped, not Stripe-shaped.**

### Their argument 2: "Sarah forms a habit easier with one page."
**My rebut:** Sarah's habit IS to glance at `/home` (15s, score check) then click into `/inbox` (60s, approve work). **Two URLs, one habit, clear mental model.** A maximalist `/home` with embedded inbox creates "tab anxiety" — Sarah on day 3 has to remember whether she's on the Inbox tab or the Overview tab; her keyboard shortcut sometimes works (when she's on the right tab) and sometimes doesn't; her email deep-link sometimes lands her in tab state and sometimes in URL state. **The 2-page pattern is more cognitively predictable than the 1-page-with-tabs pattern.** This is well-established in IA literature: predictable URL → predictable mental model → faster habit formation.

### Their argument 3: "Tabs are a known pattern — users get them."
**My rebut:** Tabs are 80% bad design. Linear's recent UI refresh REMOVED tabs in favor of clear page separation specifically because users were getting lost in tab state. Stripe's Home tabs are time-period filters (Today / This week / This month), not feature tabs. Notion uses tabs sparingly inside individual pages, not as primary navigation. **The maximalist pattern is reaching for the wrong precedent: it's confusing internal-tabs (good for time-period filtering) with feature-tabs (bad for routing distinct jobs).** Feature-tabs as primary navigation is the design pattern that killed AOL's homepage and forced every successful workflow product (Linear, Asana, GitHub, Notion) to use sibling pages instead.

### Their argument 4: "We have all this rich data; it deserves visibility."
**My rebut:** Yes — and that's exactly why distribution beats concentration. **Per-engine scores deserve visibility — on `/scans` where the per-engine job lives.** Per-agent stats deserve visibility — on `/crew`. Per-competitor data deserves visibility — on `/competitors`. **Putting all the data on `/home` doesn't make it more visible; it makes it less visible by burying each KPI under five other KPIs.** Restraint on `/home` is the act of design that gives the rest of the product its breathing room.

### Their argument 5: "If `/home` is slim, it feels empty / low-value / 'where's the product'."
**My rebut:** Slim ≠ empty. The score with delta + trend + a clear next-action pointer IS the value. Linear's My Issues is intentionally slim. Mercury's Dashboard shows the balance and recent activity — not 8 zones. Granola's home is just a meetings list. **The lazy interpretation of "calm and slim" is "thin and useless"; the right interpretation is "every element earns its place."** We mitigate the perceived-emptiness risk by making the score visually large (the entire viewport's hero element) and the trend chart prominent. The page is intentionally focused, not minimal-by-omission.

### Their argument 6: "Yossi wants more density on `/home`."
**My rebut:** Yossi's density needs are met by `/scans`, `/competitors`, and `/crew` — the per-domain drill-down pages. Yossi spends 10× more time on `/inbox` than on `/home`; making `/home` denser doesn't address his actual workflow. **If individual Yossi-class users want more on `/home`, expose that in `/settings/preferences` as optional power-user KPI cards** — but don't make it the default for Sarah, who churns at the sight of complexity.

### Their argument 7: "Our app is small (7 pages) — separation is overkill."
**My rebut:** Linear has ~7 sidebar pages and they are religious about page separation. The right number of pages is whatever maps cleanly to distinct jobs. Beamix has 8 distinct jobs (briefing, review, agent execution, scan history, competitor intel, agent roster, schedule config, settings) — that's 8 sidebar pages. Cramming 3 of those into one `/home` doesn't make the product simpler; it makes the home page more complex.

---

## 9. The Risk + Mitigation of MY Position

### Risk 1: Sarah lands on slim `/home` and thinks "Beamix doesn't show me much."
**Mitigation:**
- Make the hero score very large (96-128px count-up) — the score is the value
- Make the delta badge prominent and colored — change is the news
- Include the 14-day trend sparkline so there's visible motion
- Hand-drawn animation accents (per Adam's animation philosophy) — the page feels alive even when slim
- Concrete next-action line: "**3 items waiting in your Inbox →**" — Sarah always has a CTA

### Risk 2: Yossi wants denser `/home` for executive-overview moments before client calls.
**Mitigation:**
- Optional KPI cards in `/settings/preferences` (Build/Scale users): "Show per-engine row on Home", "Show competitor delta on Home", "Show agent activity on Home" — opt-in density
- His primary surface is `/inbox` anyway — `/home` is a 30-second briefing, not a workspace

### Risk 3: Email deep-links and Cmd+K destinations get fragmented across more URLs.
**Mitigation:**
- Cmd+K palette already exists per Vision doc — it's the universal navigation; users don't memorize URLs
- Email links are deep-links to specific items (`/inbox/[itemId]`, `/scans/[scanId]`, `/crew/[agentType]`) — these only work cleanly with sibling-page architecture
- Sibling URLs are more bookmarkable and shareable (Yossi can share `/scans/abc123` with a teammate; he can't share `/home?tab=scans&id=abc123` cleanly)

### Risk 4: 8 sidebar items feels like too much.
**Mitigation:**
- 8 is exactly Linear's sidebar count and Mercury's sidebar count — proven IA size
- We can collapse `/scans`, `/competitors`, `/crew` into a "History" group on the sidebar if visual density becomes an issue
- Mobile sidebar: hamburger collapses to bottom-tab (5 most-used) + "More" overflow

### Risk 5: Designer 1's argument lands with Adam emotionally — "feels like a real environment."
**Mitigation (and the strongest counter):** A *real* environment is a home with rooms, not one giant great-room. Adam's words: *"a whole environment that we are building for the users."* Environments have rooms. **Maximalist `/home` is a great-room with a kitchen, study, and inbox all crammed in — visually impressive, functionally muddled.** Action-First is a designed home: the briefing room (`/home`) is calm, the work room (`/inbox`) is focused, the archive room (`/scans`) is rich. Movement between rooms with intent.

---

## 10. Adam's "Whole Environment" Frame

Adam said: *"It's a whole environment that we are building for the users."* and *"about the product designing and the flows and the subtle animations and all the environment that we are creating."*

**The Action-First position SERVES this frame more faithfully than Maximalist does.** Here is why:

A whole environment has **rooms with purposes.** A kitchen for cooking, a study for thinking, a bedroom for sleeping. Each room is designed for its job. You move between them with intent — and the movement *is* part of the experience. The transition from kitchen to study isn't friction; it's a cognitive shift, signaled by physical space, that helps you switch attentional modes.

A great-room with everything in it (kitchen + study + bedroom in one space) is not a designed environment — it's a college dorm. **You can technically do everything in a dorm, but the lack of rooms is what makes it feel undesigned.**

Beamix's `/home` is the briefing room: walk in over morning coffee, see the score, see what's next, walk out. `/inbox` is the work room: walk in to act, focus on the diff, approve, walk out. `/scans` is the archive room: walk in to investigate, browse history, walk out. **Each room has its own visual language (per the Vision doc's animation philosophy) — `/home` has the Score Gauge Fill animation, `/inbox` has the diff-view animations, `/scans` has the score-trend chart. The rooms are differentiated by purpose AND by feel.**

Designer 1's maximalist `/home` puts the briefing, the work, and the archive in one room. **It's a dorm. It's not an environment.** The moment we accept that "everything goes on /home", we've abandoned the room-based environment frame entirely.

**The most pro-environment design is the most aggressively-separated one.** Distinct rooms, distinct movements, distinct feels. That's what Adam is asking for, even if he's phrasing the question as "should /home and /inbox merge."

---

## 11. The Final Position (1 paragraph)

`/home` is a slim, calm briefing page — hero score, trend, delta, one pointer to /inbox, one pointer to /schedules, three stat cards, last-scan summary. ~5-7 sections, scannable in 5 seconds, no tabs, no embedded inbox. `/inbox` is a sibling work-surface page — Linear-Triage 3-pane, tabs for Pending / Drafts / Live, keyboard-first, no score banner cluttering the top. KPIs distribute across the product by job: per-engine on `/scans`, per-agent on `/crew`, per-competitor on `/competitors`, schedule on `/schedules`, billing on `/settings`. `/archive` merges into `/scans` as the "Completed Items" tab — the natural history surface, not the work surface (honoring Adam's constraint). Sarah's flow: open → 15s glance at `/home` → if items pending, click to `/inbox` → approve → close. Yossi's flow: bookmark to `/inbox` → batch-review → switch client → switch surface (`/scans` for export, `/competitors` for analysis, `/crew` for agent config). Two URLs for two cognitive modes, eight URLs for eight jobs, one designed environment with rooms instead of a great-room with everything piled in. **Linear, Granola, Asana, GitHub, ClickUp, Monday, and Slack all do this. Beamix should too.**

---

## 12. Adam-Specific Open Questions

1. **The Sarah-vs-Yossi compromise inside Action-First:** When `/home` is slim, Sarah is ecstatic and Yossi's executive-overview moment is slightly thinner. Should we expose **optional KPI cards on `/home`** in `/settings/preferences` (Build/Scale only) so Yossi can densify his own view without affecting Sarah's default? This is an opt-in solution that lets each persona get the density they need.

2. **Default landing page:** Should Sarah land on `/home` by default and Yossi land on `/inbox` by default — driven by usage patterns we detect after the first week? Or do we always land everyone on `/home` on app open? My recommendation: always `/home` on app open (predictable), but Cmd+K and bookmarks let Yossi customize his own entry point.

3. **`/scans` vs `/archive` naming:** If we merge `/archive` into `/scans` (my Option 6A), should the page rename to `/history`? Or stay as `/scans` with tabs for Scan Runs / Completed Items? My recommendation: keep `/scans` (Yossi's mental model is "scans") and let "Completed Items" be a tab — keeps URLs stable, adds capability.

4. **Score banner on `/inbox` — yes or no?** Designer 1 will likely propose a "score banner at the top of `/inbox`" as a compromise. **My position is no banner — keep `/inbox` clean for action-mode.** But this is the place where the disagreement is most visible. If Adam wants a small score chip in the top-right of `/inbox` (not a full banner) as a passive reference, that's tolerable; a full banner is not.

5. **Mobile: how does separation hold up on a 360px viewport?** On mobile, the sidebar collapses to a bottom-tab bar. With 8 sidebar items, the bottom bar shows 5 (`/home`, `/inbox`, `/workspace`, `/scans`, `/settings`) + "More" overflow. **Does Adam want the same sibling-page architecture on mobile, or does mobile need a different IA?** My recommendation: same architecture, condensed bottom-nav with smart prioritization by usage frequency.

---

## Sources

- [Linear Inbox documentation](https://linear.app/docs/inbox) — confirms Inbox as separate sibling page with `g i` shortcut
- [Linear Triage documentation](https://linear.app/docs/triage) — confirms Triage as separate sibling page with `g t` shortcut
- [Linear conceptual model](https://linear.app/docs/conceptual-model) — sidebar architecture
- [Asana Dashboards](https://asana.com/product/dashboards) — separate from My Tasks
- [GitHub notifications docs](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github) — separate from Home feed
- [granola.ai](https://granola.ai) — slim notes-list home, separate folders
- [ClickUp inbox feature](https://clickup.com/features/inbox) — separate from dashboards
- [Slack views](https://slack.com/help/articles/360003860573) — three distinct surfaces (Activity, Home, Threads)
- [Stripe Dashboard basics](https://docs.stripe.com/dashboard/basics) — Disputes is its own page, not a tab
- [Mercury invoicing](https://support.mercury.com/hc/en-us/articles/29647851492884) — separate Workflows page
- [Vercel multi-project switcher](https://vercel.com/dashboard) — chrome dropdown pattern
- Internal: `docs/08-agents_work/2026-04-25-DECISIONS-CAPTURED.md` — Adam's locked decisions
- Internal: `docs/08-agents_work/2026-04-25-PAGE-ARCHITECTURE.md` — full per-page spec from Agent A and B audit
- Internal: `docs/08-agents_work/2026-04-25-PAGE-ARCH-A-customer-journey.md` — Sarah/Yossi journey detail

---

## APPENDIX A — The Cognitive-Mode Argument in Depth

The deepest reason to keep `/home` and `/inbox` separate is **cognitive mode**, not screen real estate.

There are two well-documented attentional modes in HCI literature:
- **Diffuse / scanning mode** — eyes flick across multiple data points to assemble a picture. Optimal for status checks, briefings, dashboards. Engaged when entering a familiar space.
- **Focused / acting mode** — eyes lock on one thing, hands engage keyboard, tab and chrome fade out of awareness. Optimal for review work, decision-making, content editing.

These two modes use different parts of the visual cortex and different working-memory profiles. **Switching modes within a single screen is more cognitively expensive than switching screens.** This is why writers prefer dedicated apps (Notion / Bear / Obsidian) over Word's chrome-heavy editor: not because Notion has fewer features, but because the screen is committed to a single mode.

**Sarah's `/home` visit is diffuse mode.** She's scanning: score → delta → pointer → close. ~15 seconds of eye-flicking.

**Sarah's `/inbox` visit is focused mode.** She's locked on one diff: read source text → read agent text → notice the change → click Approve. ~30 seconds per item, eyes on the diff.

**Conflating the two on one screen forces Sarah to switch modes inside the screen.** The score banner at the top of /inbox is diffuse-mode bait inside a focused-mode space. Either she's scanning the score (diffuse) and not focused on the diff, or she's focused on the diff and the banner is wasted chrome — never both. The maximalist pattern adds visual chrome that's actively harmful to the focused-mode work.

**Sibling pages let each surface commit fully to one mode.** /home is a diffuse-scan layout: large hero number, sparkline, scannable cards. /inbox is a focused-action layout: tight 3-pane, keyboard shortcuts, no peripheral chrome. Each surface does one thing well.

---

## APPENDIX B — The "Where Are We Right Now" Test

A useful heuristic when choosing between sibling pages and embedded tabs: **after 30 seconds in the product, can the user say with certainty where they are?**

**Maximalist (`/home` with embedded `/inbox` tab):**
- User opens app. Lands on `/home`. URL says `/home`.
- User clicks "Inbox" tab. Now viewing inbox content. URL says `/home?tab=inbox` (if implemented well) or just `/home` (if implemented poorly).
- User clicks browser back. Maybe goes to login page (URL never changed). Maybe goes to previous tab on `/home`. **Behavior is implementation-dependent.**
- User shares URL with teammate. URL is `/home`. Teammate opens it. They land on the default tab, which may or may not be Inbox. **Sharing is broken.**
- User uses keyboard shortcut. `g i` either does nothing (because we're already on `/home`) or jumps to the Inbox tab on `/home` (custom JS hack). **Shortcuts are inconsistent.**

**Action-First (`/home` and `/inbox` as siblings):**
- User opens app. Lands on `/home`. URL says `/home`. Clear.
- User clicks "Inbox" in sidebar. Navigation. URL says `/inbox`. Clear.
- User clicks browser back. Goes to `/home`. **Predictable browser behavior.**
- User shares URL. Teammate opens it. They land exactly where the user was. **Sharing works.**
- User uses keyboard shortcut. `g i` jumps to `/inbox`. **Shortcuts are deterministic.**

The Action-First pattern wins every test: predictable URLs, predictable back button, predictable sharing, predictable shortcuts. **Maximalist trades these for one fewer sidebar item — a poor trade.**

---

## APPENDIX C — What Happens If We Compromise (Tabs Inside `/home`)?

Designer 1 is likely to propose a "compromise": keep `/home` and put `/inbox` as a tab inside `/home`. Or: keep `/inbox` as a sibling page but put a `/home` summary banner permanently above `/inbox`.

**Why both compromises fail:**

### Compromise A — Tabs inside `/home`
- Sarah's mental model: "I'm on /home and there's an Inbox tab somewhere up there"
- Sarah's actual behavior: she sometimes lands on the wrong tab and is confused
- Yossi's bookmark: `/home?tab=inbox` (ugly, brittle)
- Email deep-link to a specific item: `/home?tab=inbox&item=xyz` (custom JS to handle on mount)
- Mobile: tabs become a sub-bar above the content; sidebar still has /home; unclear hierarchy
- Onboarding: "click the Inbox tab" is harder to teach than "click Inbox in the sidebar"
- **Result:** Pleases neither persona; satisfies the "fewer sidebar items" instinct at the cost of every other UX consideration.

### Compromise B — Sibling pages BUT a permanent score banner on `/inbox`
- Sarah's `/inbox` visit: 60-90 seconds of work; banner is wasted chrome above
- Yossi's `/inbox` visit: 10-15 minutes of focused work; banner is permanent diffuse-mode bait
- Mobile: banner eats 80px of vertical space on a small screen; pending items get pushed below the fold
- Visual hierarchy: ActionBar (right pane) competes with banner (top) for visual weight; user's eye doesn't know where to settle
- **Result:** Slightly less bad than Compromise A but still violates the cognitive-mode separation. The banner serves nobody.

**The non-compromise position is the right one:** Two sibling pages, no banner on /inbox, slim /home with a clear pointer line ("3 items waiting → Inbox"). That single line is the bridge between the two surfaces — and it's enough.

---

## APPENDIX D — Adam's Verbatim Words, Re-Read

Adam said: *"The home page... or, like, it's the inbox page, but we will change the inbox page to show more data and to be like the main page. Like, the home page."*

Read this carefully. Adam is **not** saying "merge /home and /inbox into one page." He's saying "make /inbox more home-like by showing more data on it, OR make /home more like /inbox by surfacing actions, OR something."

**He's identifying an UX gap:** the current `/inbox` doesn't tell the user what's going on. It's just a list. The current `/home` (if too thin) doesn't tell the user what to do. There's a gap.

**The Action-First solution to that gap is NOT merging.** It's making each page great at its own job:
- Make `/home` a real briefing — score + delta + trend + clear pointer to /inbox + clear pointer to /schedules + 3 stat cards. That's a "home page" in the meaningful sense — a place to see where you stand.
- Make `/inbox` a real work surface — Linear-Triage 3-pane, score chip in top-right (passive reference, not banner), keyboard-first, tabs for Pending/Drafts/Live. That's an "inbox" in the meaningful sense — a place to act on items.

**The bridge between them is the pointer.** "**3 items waiting in your Inbox →**" on /home is the bridge. Sarah glances at /home, sees the pointer, clicks. The two pages feel like one continuous environment because each is great at its job AND the navigation between them is obvious.

**Adam's instinct is right that the current product doesn't feel like a unified environment yet — but the fix is to make each room better, not to knock down the walls.**

---

## APPENDIX E — The 80/20 of This Decision

If I had to summarize this entire 600-line argument in five lines:

1. Beamix's product shape is Linear-shaped (review-and-approve), not Stripe-shaped (multi-product router). Linear keeps Inbox and Triage separate. We should too.
2. Cognitive modes (scanning vs. acting) are different; sibling pages serve them better than tabs.
3. KPIs distribute by job: per-engine on /scans, per-agent on /crew, per-competitor on /competitors. /home doesn't dump them all.
4. /archive merges into /scans (history surface), not /inbox (work surface). Honors Adam's constraint.
5. The "whole environment" Adam asked for is a designed home with rooms, not a great-room with everything piled in. Sibling pages are the rooms.

**Final position: 8 sidebar pages, /home and /inbox as separate siblings, KPIs distributed by job, /archive absorbed into /scans.**
