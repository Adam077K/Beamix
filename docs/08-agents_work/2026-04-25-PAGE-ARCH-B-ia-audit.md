# Page Architecture Audit B — Information Architecture Critic
Date: 2026-04-25
Author: researcher-page-arch-B (IA Critic)
Sister doc: PAGE-ARCH-A (user-flow audit, separate agent)
Status: SAVAGE PRESSURE TEST. Adam asked for it.

## TL;DR for Adam

You have not redesigned the IA. You have **renamed the Shadcn scaffold and called it a vision**. Every one of the 10 pages already exists at `apps/web/src/app/(protected)/[name]/`. The Vision doc describes what each page *should feel like* but does not justify why it should *exist as a page* versus a tab, filter, drawer, or modal. That is the gap.

This audit treats every page as a **defendant**. The defendant must prove it earns a top-level slot in the sidebar. If a page can be a tab inside another page without losing user value, it should be. If a page is a filter inside a list, it should be. If a page exists only because the Shadcn template had it, it dies.

**Final recommendation:** **7 pages, not 10.** Kill `/home` (replace with `/inbox`-as-default). Kill `/archive` (collapse into `/inbox` filter). Merge `/competitors` as a pinned tab inside `/scans`. Add a hidden surface: `/notifications` (settings, not the review queue). The page Beamix should copy most directly is **Mercury**, not Linear — because Mercury is a *single-domain product for non-technical owners*, which is exactly Sarah.

---

## PART 1 — IA AUDIT OF EACH CURRENT PAGE

### 1. `/scan` (public) — **STANDS**

- **Claims to do:** Domain typed → 15-17s First Scan Reveal → score + top fixes → CTA to sign up. The acquisition wedge.
- **Jobs supported:** First-time visitor "what is Beamix" → "what's my score" → "should I pay." That's it. Single funnel.
- **Overlap:** None. Public route, no auth. The score result it produces is consumed by `/onboarding` (via `?scan_id`) and disappears.
- **IA Verdict:** **STANDS.** This is the only page that has a clear, non-overlapping job and a non-overlapping audience (anonymous visitors). The animation differentiation is real. Otterly, Profound, Peec.ai *all* require signup before a result ([Otterly review](https://www.tryanalyze.ai/blog/otterly-ai-review)). Beamix's wedge.
- **One nit:** Document where the "Email me a copy" path lives. If you email a result link, that link page (`/scan/[scanId]`) is implicitly an 11th page. Either acknowledge it or kill the email-copy feature.

### 2. `/onboarding` — **DEMOTE TO FLOW (not a page)**

- **Claims to do:** 4-step setup wired to Paddle checkout, links public scan via `?scan_id`.
- **Jobs supported:** First-run setup. Used exactly once per account, lifetime.
- **Overlap:** None — but the bar for "deserves a top-level page" is not "no overlap." It's "earns a destination."
- **IA Verdict:** **DEMOTE.** Onboarding is not a destination — it is a *wizard* layered over the route the user *would have arrived at*. Linear, Notion, Mercury all treat onboarding as a route-level *redirect* until it is complete, not a peer page in the sidebar ([Notion onboarding playbook](https://venue.cloud/news/insights/from-signup-to-sticky-slack-notion-canva-s-plg-onboarding-playbook)). It should never appear in the sidebar. It is a checkpoint at `/onboarding` that resolves to `/home` (or `/inbox`) on completion. Architecturally a Next.js route is fine; the *IA point* is that it does not count toward "page count" or sidebar slots.
- **Action:** Treat `/onboarding` as a pre-flight gate on the protected layout. Not a peer in the IA. Sidebar slot count: 0.

### 3. `/home` — **KILL — MERGE WITH `/inbox`**

- **Claims to do:** Morning briefing. Score with delta. Top 3 fixes. Agent queue status. "Quick-launch CTA for Sarah."
- **Jobs supported:** Sarah-arrives-Tuesday-morning lands here, gets briefed, clicks one thing, leaves.
- **Overlap with `/inbox`:** **MASSIVE.** Both are "the place you land when you open Beamix." Both surface "what needs your attention." Both have a primary action ("Run top fixes" on `/home` vs. "Approve" on `/inbox`). Both are aimed at Sarah's first 90 seconds.
- **Overlap with `/scans`:** The score on `/home` is just the latest row of `/scans`. The "delta from last scan" is `/scans` data.
- **IA Verdict:** **KILL `/home`.** It is the Shadcn-template "Dashboard" page wearing a different hat. It claims to be a "morning briefing" but it is a *summary view of three other pages crammed onto one screen* — score from `/scans`, fixes from `/inbox`, agent status from `/workspace`. That's not a page; that's a widget collage.
- **Reference:** Linear has **no home page** ([Linear conceptual model](https://linear.app/docs/conceptual-model)). The default landing is the user's last view, the workspace's chosen view, or Inbox. Mercury's "Dashboard" is the account balance — not a separate briefing. Granola lands on the most recent meeting note, not a "home." Superhuman lands directly in the inbox.
- **Replacement:** The morning briefing is a *banner* at the top of `/inbox` showing "Your score: 42 ↑+6 since Monday — Run top fixes →." That collapses three Shadcn ideas (KPI card, action card, inbox preview) into the surface they belong on.
- **Counter-argument (steelman):** Stripe Dashboard has a Home page that summarizes today's revenue and disputes ([Stripe docs](https://docs.stripe.com/dashboard/basics)). Counter: Stripe has *thousands of transactions per day* across customers, products, payments, payouts, balances, refunds, disputes, plus 12 product lines. Stripe Home is a router across 12 surfaces; Beamix has 7 surfaces total. The summary-router pattern doesn't earn its keep when the inventory is small.

### 4. `/inbox` — **STANDS, but takes on `/home`'s role and `/archive`'s filter**

- **Claims to do:** 3-pane review queue (Linear Triage). Approve/Reject/Request changes on agent output.
- **Jobs supported:** Sarah's primary job — "tell me what needs my approval and let me approve it fast."
- **Overlap with `/home`:** Yes (see above) — and the resolution is to absorb `/home`'s briefing banner.
- **Overlap with `/archive`:** Yes — `/archive` is just `/inbox` with `status = approved`. That's a filter, not a page.
- **IA Verdict:** **STANDS** as the core surface, **expanded** to host the score banner and a "Done" filter for approved/published items.
- **Reference:** Linear's Inbox is the canonical example ([Linear triage](https://linear.app/docs/triage)). It has tabs for "Inbox / Subscribed / Archived" — not separate pages. Superhuman's inbox is the entire app.
- **Sub-architecture:**
  - Tab 1: **Pending** (default — items needing approval)
  - Tab 2: **Live** (items currently being worked by agents — absorbs `/workspace` watchers)
  - Tab 3: **Done** (approved/published — absorbs `/archive`)
  - Banner: Score + top recommendations (absorbs `/home`)

### 5. `/workspace` — **MERGE INTO `/inbox` AS THE "LIVE" TAB OR DEMOTE TO `/inbox/[itemId]/live`**

- **Claims to do:** Watch agents work in real time. 360px right-panel step list. Narrative agent execution.
- **Jobs supported:** "Show me the agent thinking." Voyeuristic, occasionally diagnostic.
- **Overlap with `/inbox`:** **MASSIVE.** "Watch the agent work" → "Review what the agent did" is the *same job at two timestamps.* The user is looking at the same agent run, just earlier in its lifecycle.
- **IA Verdict:** **MERGE.** A workspace is not a separate page — it is a **state** of an inbox item. `/workspace/[jobId]` should redirect to `/inbox/[itemId]` where the item shows its current state: `running` (live step list visible) → `awaiting_review` (preview + Approve) → `approved` (read-only, in Done tab).
- **Reference:** Linear does not have a separate "watch the issue being worked on" page. Granola does not have a "watch the AI summarize" page distinct from the meeting note. The closest thing is Perplexity Pro Search ([Perplexity narrative scan transparency](https://www.perplexity.ai/)) — but Perplexity puts the live step list **inside the same view as the result.** Same page, different states.
- **Counter-argument (steelman):** Manus and a few agentic-AI products do separate live views from review views. Counter: the Vision doc itself calls Manus's always-on side panel "the mistake" (PART 1, anti-pattern list). If you're rejecting Manus's mistake, don't make it.
- **The real thing `/workspace` could become:** A **multiplexer view** — "Show me everything currently running across all agents." That's a real distinct job: agency-mode oversight. But that view is `/inbox?filter=running` — still not a separate page.

### 6. `/scans` — **STANDS, absorbs `/competitors`**

- **Claims to do:** Scan history list + per-scan detail view (score delta, per-engine, query-level drill-down).
- **Jobs supported:** Yossi exporting audit logs. Sarah occasionally checking "is the score going up." The historical/analytic surface.
- **Overlap with `/home`:** The score on `/home` is a one-row preview of the score on `/scans`. Killing `/home` removes this.
- **Overlap with `/competitors`:** Competitor analysis is **generated from scans.** A competitor scan is a scan. The data lives in the same engine pipeline. The only reason to separate is mental-model — "competitors" as a noun feels different from "scans" as a verb. But the data architecture says they're the same thing.
- **IA Verdict:** **STANDS,** but `/competitors` collapses into a tab here.
- **Sub-architecture:**
  - Tab 1: **My site** (default — your own scan history)
  - Tab 2: **Competitors** (gap data, head-to-head)
  - Tab 3: **Per-engine** (filter)
  - Tab 4: **Per-query** (filter)
- **Reference:** Peec.ai's main dashboard *combines* your score, your industry ranking against competitors, and source breakdown — all on one screen, with filters not pages ([Peec sidebar nav](https://docs.peec.ai/sidebar-navigation)). Profound has separate "Visibility" and "Citations" dashboards but they share a per-topic and per-platform filter set ([Profound dashboard](https://www.tryprofound.com/blog/how-to-track-your-visibility-in-ai-search)). The pattern: **one analytical surface with filters, not multiple analytical pages.** Peec.ai's IA is closer to Beamix's audience than Profound's.

### 7. `/automation` — **STANDS (rename to `/schedules`)**

- **Claims to do:** Recurring scan schedules + auto-run agent configs. Name TBD.
- **Jobs supported:** "Set it once and forget it." Yossi configures cadence; Sarah barely visits.
- **Overlap:** Low. There is no other page where you set "run this agent every Monday."
- **IA Verdict:** **STANDS,** but the name "Automation" overpromises. **Rename to `/schedules`** — concrete, literal, what the page actually does.
- **Reference:** Mercury's "Auto-transfer rules" lives under settings/banking workflows, not as a top-level page ([Mercury sidebar](https://support.mercury.com/hc/en-us/articles/29647851492884-Navigating-your-Mercury-Invoicing-dashboard)). For Beamix, schedules are central enough to merit a page (cadence is the entire "Beamix does the work for you" promise). But "Automation" as a noun is a marketing word — it works on the landing page, not in the sidebar. Sidebar labels are nouns of utility, not categories of feeling. "Schedules" describes the page; "Automation" describes the philosophy.
- **Counter-argument (steelman):** "Crew" frames the agents as a team, which Adam wants. Counter: a "Crew" page would be where you *meet* the agents (i.e., a roster/agent-detail page), not where you schedule them. Crew is a different page if you want it (see Part 2 Alternative 3).

### 8. `/competitors` — **DEMOTE TO TAB INSIDE `/scans`**

- **Claims to do:** Competitor intelligence dashboard. Side-by-side scores. Per-engine breakdown for competitors.
- **Jobs supported:** "Who's beating me." High-frequency for Yossi, low-frequency for Sarah.
- **Overlap with `/scans`:** **TOTAL.** A competitor visibility dashboard is a *scan* with the comparator switched. The architecture is the same data pipeline + a different filter.
- **IA Verdict:** **DEMOTE TO TAB.** `/scans` → "Competitors" tab. Direct deep links via `/scans/competitors/[domain]` still work for Yossi.
- **Reference:** Peec.ai puts competitors on the *main dashboard* alongside your score, not as a separate page ([Peec.ai review](https://www.marketermilk.com/blog/peec-ai-review)). Otterly's "Brands" is a config screen for *which competitors to track*, not a separate analytical destination ([Otterly features](https://otterly.ai/features)). Profound has competitor data inside the Visibility dashboard, not separately. The pattern in your category: **competitors live inside the visibility surface.**
- **Counter-argument (steelman):** Peec.ai has a separate "Brands" item in the sidebar ([Peec sidebar](https://docs.peec.ai/sidebar-navigation)). Counter: Peec's "Brands" is *configuration* (manage tracked competitors), not analysis. If Beamix has a "manage competitor list" config, that lives in `/settings → Tracked Competitors`, not a top-level page.

### 9. `/archive` — **KILL — DEMOTE TO `/inbox` FILTER**

- **Claims to do:** Past agent output and content items. Approved copy, published schema, historical recommendations.
- **Jobs supported:** Yossi exporting audit trails. Sarah ~never visits.
- **Overlap with `/inbox`:** **TOTAL.** `/archive` is `/inbox` with `status IN ('approved', 'published', 'discarded')`. That's a tab, not a page.
- **Overlap with `/scans`:** Some — historical recommendations show up in scan detail views.
- **IA Verdict:** **KILL.** Add "Done" tab inside `/inbox` (or "Archived" in line with Linear's convention). Search/filter inside that tab gets Yossi to old items.
- **Reference:** Linear has Inbox tabs: Inbox / Subscribed / **Archived** ([Linear changelog](https://linear.app/changelog)). Gmail has Archive as a *folder filter* on the same inbox surface. Notion has no "archive" page — archived pages live under "..." menu, not a peer page. Mercury's "Closed accounts" is a filter, not a page. **Pattern across mature products: archive is a state, not a place.**
- **Counter-argument (steelman):** "But Yossi needs to export it." Counter: export is an action, not a page. Add an "Export →" button in the Done tab. Same data, no extra surface.

### 10. `/settings` — **STANDS — but split into 4-5 sub-routes**

- **Claims to do:** Account, billing, language, notifications, business profile. 4 tabs.
- **Jobs supported:** Configuration. Visited rarely. Critical when needed.
- **Overlap:** None.
- **IA Verdict:** **STANDS.** But the Vision doc describes 4 tabs while the real IA needs more. Sub-routes, not tabs:
  - `/settings/profile` (business profile)
  - `/settings/billing` (Paddle portal handoff)
  - `/settings/language` (EN/HE — surfaced because it's the moment of delight for Israeli users)
  - `/settings/notifications` (digest cadence, alerts)
  - `/settings/team` (DEFERRED — for Yossi's agency mode, see Part 2)
  - `/settings/competitors` (manage tracked competitor list — moved here from `/competitors`)
  - `/settings/integrations` ("Coming soon" stub or kill until shipped — known issue from MEMORY.md)
- **Reference:** Notion's settings is a *drawer with 8+ sections* ([Notion sidebar guide](https://www.notion.com/help/navigate-with-the-sidebar)). Stripe Dashboard splits Settings into Account / Team / Developers / Tax / etc. — each as a sub-route, navigable independently ([Stripe docs](https://docs.stripe.com/dashboard/basics)). Mercury splits Settings into ~12 sub-pages.
- **Architectural pattern:** Settings is *one sidebar slot* but has its own internal IA. Use sub-routes (not tabs) so deep links work, browser back/forward feels right, and Cmd+K can navigate to specific sections.

### Summary table — IA verdicts

| # | Page | Verdict | Ends up as |
|---|------|---------|------------|
| 1 | `/scan` (public) | STANDS | Top-level public route |
| 2 | `/onboarding` | DEMOTE | Pre-flight gate, not in sidebar |
| 3 | `/home` | **KILL** | Merged into `/inbox` (banner) |
| 4 | `/inbox` | STANDS+ | Default landing, hosts banner + tabs |
| 5 | `/workspace` | **MERGE** | "Live" tab inside `/inbox` |
| 6 | `/scans` | STANDS | Hosts competitors as tab |
| 7 | `/automation` | RENAME | `/schedules` |
| 8 | `/competitors` | **DEMOTE** | Tab inside `/scans` |
| 9 | `/archive` | **KILL** | "Done" tab inside `/inbox` |
| 10 | `/settings` | STANDS | Sub-routed |

**Result: 10 → 5 sidebar slots** (Inbox, Scans, Schedules, Settings, plus the public `/scan`).

That feels too radical. Part 2 walks through three alternatives with real tradeoffs.

---

## PART 2 — THREE ALTERNATIVE PAGE STRUCTURES

### Alternative 1 — Minimalist (5 pages)

The aggressive consolidation. **The "Linear" answer.**

```
Sidebar:
  / (default → /inbox if onboarded, /scan if not)
  /inbox       ← absorbs /home banner, /workspace live, /archive done
  /scans       ← absorbs /competitors as tab
  /schedules   ← renamed from /automation
  /settings    ← sub-routed (profile, billing, language, notifications, integrations)

Public + flow routes (not sidebar):
  /scan              (public)
  /onboarding        (pre-flight gate)
  /scan/[scanId]     (public scan result link, emailed)
```

**The rule that justifies the structure:** A page exists if and only if it represents a distinct *job* with a distinct *primary action*. Inbox = "review and act." Scans = "analyze." Schedules = "configure cadence." Settings = "configure account." Four jobs, four pages. Public scan is the funnel.

**Pros:**
- Cognitive load: a Sarah scanning the sidebar sees 4 things, picks one, never wonders what `/home` vs `/inbox` means.
- Sub-pages and tabs absorb power-user depth without polluting top-level IA.
- Matches Linear's restraint pattern ([Linear UI refresh](https://linear.app/changelog/2026-03-12-ui-refresh)) — fewer top-level destinations, more density inside.
- Cmd+K works harder (and earns the design budget the Vision doc spent on it).
- Mobile-friendly: 4 sidebar slots map cleanly to a bottom-tab bar on mobile.

**Cons:**
- "Beamix does the work for you" promise is harder to *visualize* without a `/home` morning-briefing surface. The score-banner on `/inbox` is functionally equivalent but less marketing-photogenic.
- Yossi managing 20 client domains has no top-level surface for "switch context" — that lives in a workspace switcher inside the sidebar header (tenant pattern from [Auth0 multi-org](https://auth0.com/docs/get-started/architecture-scenarios/multiple-organization-architecture)).
- Risk: investors / new users open the app and think "is this it? where is everything?" — too minimal can feel under-built.
- Migration cost: existing routes at `/home`, `/workspace`, `/competitors`, `/archive` all need redirects. Not a tech blocker, but signals "we changed our minds."

**Best for:** A late-stage company optimizing for retention and depth (Linear after Y3). Not first-launch.

### Alternative 2 — Lean (7 pages) — **RECOMMENDED**

Mid-ground. Slight consolidation from 10. The "Mercury" answer.

```
Sidebar (in order):
  /inbox       ← default landing post-onboarding. Tabs: Pending / Live / Done. Score banner top.
  /scans       ← tabs: My site / Competitors / Per-engine. Detail at /scans/[id].
  /schedules   ← renamed from /automation
  /crew        ← NEW — meet the agents, see their stats, customize agent prompts (for Yossi)
  /reports     ← NEW — exports, audit trails, client-shareable PDFs (Yossi's killer surface)
  /settings    ← sub-routed
  
  Hidden but reachable:
  /scan          (public funnel)
  /onboarding    (pre-flight gate)
  /workspace/[jobId] → 301 redirect to /inbox/[itemId]
  /home          → 301 redirect to /inbox
  /archive       → 301 redirect to /inbox?tab=done
  /competitors   → 301 redirect to /scans?tab=competitors
  /notifications (settings panel for system notifications, NOT review queue)
```

**The rule that justifies the structure:** A page exists if it represents a distinct *job* AND has a primary action that doesn't fit cleanly inside another page's mental model. Inbox = review. Scans = analyze. Schedules = configure cadence. Crew = meet/customize agents. Reports = export/share. Settings = account config.

Crew and Reports replace the dead `/home` and `/archive`. They are *new* surfaces that the original 10 didn't have but Yossi badly needs.

**Pros:**
- Adds the two most-requested features the original 10 don't include: a Reports/exports surface (Yossi sharing with clients) and a Crew/agent-roster surface (where the 11-agent team becomes a *thing*, not just a dropdown).
- Keeps the killing of `/home`, `/workspace`, `/archive`, `/competitors` clean — they are *redirected*, not retained.
- "Crew" satisfies Adam's "team of agents" framing without overpromising the word "Automation."
- "Reports" is the highest-leverage missing feature for Yossi — it's the artifact he hands to clients, and competitors charge a tier for it ([Profound features](https://www.tryprofound.com/blog/best-ai-visibility-tools-for-marketing-agencies)).
- Mobile-friendly with bottom-tab bar (5 visible + overflow): Inbox / Scans / Schedules / More.

**Cons:**
- "Crew" risks feeling like a cute name that costs a sidebar slot for low-frequency use.
- "Reports" might be premature for first launch (Sarah doesn't export). Could ship hidden-only at first, exposed at MVP-2.
- Still 7 sidebar items — at the edge of the "calm sidebar" rule (Linear holds at 4-6 visible).

**Mitigation:** Show Crew + Reports only when user is on Build or Scale plan. Discover plan sees 5 sidebar items.

**Best for:** Beamix at launch. Matches Mercury's pattern (~6-8 sidebar items, plan-tier-gated visibility) and Stripe's pattern (top-level utility pages + sub-routed Settings).

### Alternative 3 — Expanded (12-14 pages)

The maximalist. The "Stripe Dashboard" answer.

```
Sidebar:
  /inbox
  /scans
    /scans/[id]            (sub-route)
    /scans/competitors     (separate route, not tab)
    /scans/per-engine      (separate route)
  /schedules
  /crew
    /crew/[agentType]      (per-agent detail)
  /reports
    /reports/exports
    /reports/audit-log
  /team                    (NEW — multi-domain switcher for agencies)
  /notifications           (NEW — system notification feed, separate from review inbox)
  /help                    (NEW — docs, tutorials, support)
  /settings
    /settings/profile
    /settings/billing
    /settings/language
    /settings/notifications
    /settings/integrations
    /settings/api-keys     (NEW — Yossi's API access, Build/Scale only)
```

**The rule that justifies the structure:** Every distinct data shape gets its own URL. Deep linkability is the IA contract. Stripe's pattern.

**Pros:**
- Every URL is bookmarkable, shareable, and analyzable.
- Yossi (agency) gets `/team` as the multi-domain switcher — solves a problem the original 10 don't address at all.
- `/help` is a missing surface in the original 10. Sarah will need it. Linear, Notion, Mercury, Stripe all have one ([Stripe basics](https://docs.stripe.com/dashboard/basics)).
- `/notifications` separates "your account had a webhook fire" from "the agent has output for your review." These are *different inboxes*.
- API keys, audit log, exports each have a destination — investor-friendly, "this looks like a serious product."

**Cons:**
- Sidebar bloat — 8-9 visible items violates Linear's restraint principle.
- Sarah doesn't need most of these. Premature surface area.
- Mobile becomes a hamburger menu nightmare.
- Risk: looks like every other SaaS dashboard. Loses the "calm Beamix" feel.

**Best for:** Year 2-3 Beamix. Or if Adam decides to position as enterprise/agency-first from launch.

### Tradeoff matrix

| Alt | Sidebar items | Sarah's load | Yossi's depth | Investor demo | Mobile fit | Migration cost |
|-----|---------------|--------------|---------------|---------------|------------|----------------|
| 1 — Minimalist (5) | 4 visible | Trivial | Tabs hide depth | Looks too thin | Excellent | High (4 redirects) |
| 2 — Lean (7) — **REC** | 5-6 visible | Easy | Crew + Reports surface depth | Strong | Good | Medium (4 redirects + 2 new) |
| 3 — Expanded (12-14) | 8-9 visible | Heavy | Everything has a URL | Enterprise-y | Poor | Low (additive) |

---

## PART 3 — COMPARABLE PRODUCTS IA ANALYSIS

How do real products structure their IA? Twelve products, organized by their lessons for Beamix.

### 1. Linear — `linear.app`

- **Top-level sidebar:** Inbox, My Issues, Active Cycle, Projects (per team), Views (custom), Documents
- **Hidden/secondary:** Triage (per team), Archive (per team), Roadmaps, Initiatives
- **Last redesign:** [March 2026 UI refresh](https://linear.app/changelog/2026-03-12-ui-refresh) — "consistent headers, navigation, and view controls across projects, issues, reviews, and documents." Reduced visual noise, dimmed sidebar, increased main content prominence.
- **IA depth:** 2-level (workspace → team → views/projects/issues). Settings is sub-routed.
- **Mobile vs desktop:** Mobile heavily customizable ([Customize navigation](https://linear.app/changelog/2026-01-22-customize-your-navigation-in-linear-mobile)). Bottom tabs configurable per user.
- **Most-visited page:** Inbox (per Linear's docs, this is the "default landing for triage and notifications" — [Linear triage](https://linear.app/docs/triage)).
- **Core surface (per company):** Inbox + Active Cycle. Everything else is build-up to those two.

**Lesson for Beamix:** Inbox is the default landing. Settings is sub-routed. Sidebar is "calm" — main content dominates. **Direct port: Inbox-as-default.**

### 2. Notion — `notion.so`

- **Top-level sidebar:** Search, Home, Inbox, AI Chat, Settings, Templates. Then: Favorites, Teamspaces, Shared, Private — each containing user-created pages.
- **Hidden/secondary:** Trash, Settings sub-pages, Calendar (separate app)
- **Last redesign:** Sidebar reorganization into Teamspaces + Private + Shared sections ([Notion sidebar guide](https://www.notion.com/help/navigate-with-the-sidebar)).
- **IA depth:** Infinite (pages can nest forever). User-defined IA inside the app's IA.
- **Mobile vs desktop:** Sidebar collapses to drawer; same structure.
- **Most-visited page:** "Home" (recently added as a top-level — was previously dispersed) + recent pages list.
- **Core surface:** The block primitive, which makes every page the core.

**Lesson for Beamix:** Notion has Home AND Inbox. But Notion's content is *user-generated* (pages, databases, wikis); it has no system-generated "review queue" the way agentic products do. Beamix's content is system-generated (agent output). Inbox is the natural primary. **Don't copy Notion's Home.**

### 3. Granola — `granola.ai`

- **Top-level sidebar:** Search, Notes, People, Companies, Folders (user-created), [Workspace name]
- **Hidden/secondary:** Settings (gear icon), AI insights (per folder)
- **Last redesign:** Added People + Companies as auto-aggregated views ([Granola docs](https://docs.granola.ai/help-center/getting-started/granola-101)).
- **IA depth:** 1-level. Notes are flat with folder organization.
- **Mobile vs desktop:** Mobile is just notes list; mac app has full sidebar.
- **Most-visited page:** Most recent meeting note (lands here on app open).
- **Core surface (per company):** "The Notes view" — a single living document during the meeting.

**Lesson for Beamix:** Granola has **no Home page**. Lands on the most recent thing the user did. People and Companies are auto-aggregated *views* from notes, not separate data. **Direct port: auto-aggregated competitor view from scan data.**

### 4. Stripe Dashboard — `dashboard.stripe.com`

- **Top-level sidebar:** Home, Payments, Customers, Products, Reports, Connect, Tax, Settings (the "Shortcuts" section pins recent + favorites)
- **Hidden/secondary:** Sigma, Atlas, Climate, Issuing, Treasury, Capital, Radar, Invoicing — all gated by product enablement
- **Last redesign:** May 2024 — "Shortcuts" section, simplified left nav ([Stripe support](https://support.stripe.com/questions/dashboard-update-may-2024)).
- **IA depth:** 3-level (sidebar → main page → sub-routes within page). Every entity has its own URL.
- **Mobile vs desktop:** Mobile has bottom tabs (Home, Payments, Balances, Activity, More). Different IA.
- **Most-visited page:** Payments (per Stripe blog — the "highest-frequency transactional surface").
- **Core surface:** Payments. Home is a router *to* Payments.

**Lesson for Beamix:** Stripe has Home but it's a *router across 12 product lines*. Beamix has 1 product line. **Don't copy Home; it doesn't earn its keep at small inventory.**

### 5. Mercury — `mercury.com`

- **Top-level sidebar:** Dashboard (= account balance + recent transactions), Accounts (sub-list), Send Money, Receive, Cards, Workflows (Invoicing, Bill Pay), Insights, Treasury
- **Hidden/secondary:** Settings (per-account), Team, API
- **Last redesign:** Insights page added 2024 ([Insights overview](https://support.mercury.com/hc/en-us/articles/44277089544084-Insights-page-overview)).
- **IA depth:** 2-level. Dashboard is single-page. Accounts/Workflows expand.
- **Mobile vs desktop:** Mobile collapses to bottom-tabs (Home, Send, Cards, More).
- **Most-visited page:** Dashboard (=account balance + recent activity). Single primary surface.
- **Core surface (per Mercury blog):** Dashboard. The promise is "see your balance in 2 seconds."

**Lesson for Beamix:** **This is the closest analog.** Single-domain product, non-technical primary user, dashboard is a *summary* but not a router (it shows the actual data, not links to other pages). Beamix's Inbox should be Mercury's Dashboard — the primary surface is the data, not a routing menu.

### 6. Superhuman — `superhuman.com`

- **Top-level sidebar:** Inbox (with splits: VIP, News, Travel, etc.), Drafts, Sent, Snoozed, Archive, Spam, Trash
- **Hidden/secondary:** Search, Settings (Cmd+,), Read Later
- **Last redesign:** Mobile gets new left sidebar with "Ask AI" ([Mobile nav](https://help.superhuman.com/hc/en-us/articles/38458290528531-Mobile-Navigation)).
- **IA depth:** 1-level. Everything is the inbox with filters.
- **Mobile vs desktop:** Desktop hides sidebar by default; mobile has it. Sidebar is *not pinnable* on desktop.
- **Most-visited page:** Inbox. There is no "home" — there is no "dashboard." The inbox is the entire app.
- **Core surface:** Inbox.

**Lesson for Beamix:** **Hardest port.** Superhuman has zero "home" or "summary" page. Email is the inbox. Beamix's review queue is the inbox. **The single-page mental model.** Adam's "morning briefing" instinct is right; the *implementation* should be a banner on the Inbox, not a separate Home page.

### 7. PostHog — `posthog.com`

- **Top-level sidebar:** Project Home, Dashboards, Web Analytics, Insights, Replays, Surveys, Experiments, Feature Flags, Notebooks, Data Pipeline, Activity, Apps
- **Hidden/secondary:** Settings, Pinned Shortcuts
- **Last redesign:** [Nav redesign 2026](https://posthog.com/blog/redesigned-nav-menu) — "Products menu" searchable for the 14+ products, customizable Shortcuts pin, folders for organization.
- **IA depth:** 2-3 levels.
- **Mobile vs desktop:** Mobile sub-menu issues acknowledged ([GitHub issue](https://github.com/PostHog/posthog/issues/1349)).
- **Most-visited page:** Project Home (= recent activity + saved insights).
- **Core surface:** Insights + Dashboards.

**Lesson for Beamix:** PostHog has **14+ products** crammed into one app — that's why nav is hard. Beamix has 1 product. Don't copy the IA of a multi-product platform.

### 8. Otterly.ai — `otterly.ai` (direct competitor)

- **Top-level structure (per [Otterly features](https://otterly.ai/features) + reviews):** Workspaces, Search Prompts, Brand Reports, AI Keyword Research, GEO Audits, Citations
- **IA pattern:** Workspaces as a parent container; each workspace has its own prompt list, reports, audits.
- **IA depth:** 2-level (workspace → reports per workspace).
- **Most-visited page:** Search Prompts (the data entry surface — daily-tracked prompts).
- **Core surface (per reviews):** Search Prompts — "the heart of the platform."

**Lesson for Beamix:** Otterly's **workspace** primitive is what Yossi needs but Beamix's Vision doc doesn't mention. **Action: add `/team` (or workspaces switcher) for agency users in Build/Scale plan.**

### 9. Profound — `tryprofound.com` (direct competitor)

- **Top-level structure (per [Profound blog](https://www.tryprofound.com/blog/how-to-track-your-visibility-in-ai-search)):** Visibility Dashboard, Visibility Rankings By Topic, Citations Dashboard, Topics, Platforms, Profound Index
- **IA depth:** 1-level dashboards with topic+platform dropdowns at top of every page.
- **Most-visited page:** Visibility Dashboard.
- **Core surface:** Visibility Dashboard.

**Lesson for Beamix:** Profound has *separate dashboards* for visibility, citations, rankings — but they share the topic+platform filter UI. This is the mistake Beamix shouldn't repeat: same data, three URLs. Use **one analytical surface with filters** (= Beamix's `/scans` with tabs).

### 10. Peec.ai — `peec.ai` (direct competitor)

- **Top-level sidebar:** Dashboard, Prompts, Sources, Competitors, Owned (On-page), Brands (config), Tags, Settings, Projects ([Peec sidebar nav](https://docs.peec.ai/sidebar-navigation)).
- **IA depth:** 1-level (flat sidebar).
- **Most-visited page:** Dashboard (single view shows visibility, competitors, sources, recent mentions — all in one screen).
- **Core surface:** Dashboard (the "everything in one screen" pattern).

**Lesson for Beamix:** Peec.ai has 8-9 sidebar items but the *Dashboard does everything* — competitors, sources, prompts all visible on one screen. The other sidebar items are deep-dive surfaces. **This is closer to Mercury's pattern than Profound's.** Beamix's `/inbox` (with score banner + tabs) maps to Peec's Dashboard.

### 11. Ahrefs Site Audit — `ahrefs.com/site-audit`

- **Top-level structure (per [Ahrefs academy](https://ahrefs.com/academy/how-to-use-ahrefs/site-audit/overview)):** Overview, Top Issues, Issues, Indexability, Performance, Page Explorer, Link Explorer, Crawl Log, Settings
- **IA depth:** 2-level (project → reports). Sub-tools have their own deep IA.
- **Most-visited page:** Overview (Health Score + Top Issues).
- **Core surface:** Overview.

**Lesson for Beamix:** Ahrefs Site Audit's Overview = Beamix's Inbox-with-score-banner. **Port directly.** The score is the hook; the issue list is the action queue.

### 12. Semrush AI Toolkit — `semrush.com/semrush-ai-toolkit`

- **Top-level structure (per [Semrush KB](https://www.semrush.com/kb/1493-ai-toolkit)):** Visibility Overview, Brand Performance, Competitor Research, Pages & Categories
- **IA depth:** 2-level.
- **Most-visited page:** Visibility Overview (per onboarding guide — first stop after setup).
- **Core surface:** Visibility Overview.

**Lesson for Beamix:** Same as Semrush — overview-first. But Semrush has *4 distinct dashboards* for different analytical jobs. Beamix can collapse all four into `/scans` with tabs because the data shape is the same.

### Summary table — what to copy

| Product | Closest analog | What to port |
|---------|---------------|--------------|
| Mercury | **Closest overall fit** | Single-page primary surface. Sidebar 5-7 items, plan-gated. Settings sub-routed. |
| Linear | Inbox + Cmd+K | Inbox-as-default landing. Triage tabs. UI restraint. |
| Granola | Auto-aggregated views | People/Companies pattern → Beamix Competitors auto-aggregated from scans. |
| Peec.ai | Direct-competitor IA | Single dashboard does everything; deep-dive surfaces only when needed. |
| Otterly | Workspaces primitive | Multi-domain switcher for Yossi's agency mode (Build/Scale plan). |
| Stripe | Sub-routed Settings | Settings is one slot but has its own IA. |
| Superhuman | Single-page mental model | The inbox IS the app. No separate Home. |
| Ahrefs SA | Score-banner pattern | Overview = score + top issues + action queue. |

---

## PART 4 — RECOMMENDED IA

After audit + alternatives + competitor research, the recommendation is **Alternative 2 — Lean (7 pages) — but with phased rollout.**

### Final IA

```
PUBLIC ROUTES
  /scan                   ← funnel page (the wedge)
  /scan/[scanId]          ← shareable scan result page (emailed copy lives here)

PRE-FLIGHT (not in sidebar)
  /onboarding             ← gate; redirects to /inbox on completion

PROTECTED — SIDEBAR (in order, top to bottom)
  1. Inbox                /inbox
       Tabs: Pending (default) / Live / Done
       Top banner: ScoreDisplay with delta + "Run top fixes →" CTA
       Sub-route: /inbox/[itemId] (single-item review = previous /workspace/[jobId])
       
  2. Scans                /scans
       Tabs: My Site (default) / Competitors / Per-Engine
       Sub-route: /scans/[scanId] (per-scan detail)
       
  3. Schedules            /schedules    (renamed from /automation)
       List + new-schedule drawer
       
  4. Crew                 /crew         (NEW — agent roster, customization)
       List of 11 agents with stats; click → agent detail page
       Sub-route: /crew/[agentType]
       (Hidden in MVP-1 if scope-cut. Show in MVP-2 with agent customization.)
       
  5. Reports              /reports      (NEW — Yossi's killer surface)
       Exports, audit log, shareable PDFs
       (Show only on Build/Scale plan; hidden on Discover.)
       
  6. Settings             /settings     (sub-routed)
       /settings/profile
       /settings/billing
       /settings/language
       /settings/notifications
       /settings/competitors  (manage tracked list)
       /settings/team        (Build/Scale only — workspace + members)
       /settings/integrations (stub or kill until shipped)

LEGACY REDIRECTS (preserve old links)
  /home                   → 301 → /inbox
  /workspace              → 301 → /inbox?tab=live
  /workspace/[jobId]      → 301 → /inbox/[jobId]
  /archive                → 301 → /inbox?tab=done
  /competitors            → 301 → /scans?tab=competitors
```

### Total page count

- **5 sidebar slots visible** to Discover plan users (Inbox, Scans, Schedules, Settings + the public `/scan` for marketing reuse).
- **6 sidebar slots** visible to Build users (+ Reports).
- **7 sidebar slots** visible to Scale users (+ Crew, if Crew is a Scale feature).
- **2 public routes** (`/scan`, `/scan/[scanId]`).
- **1 pre-flight gate** (`/onboarding`).
- **9 sub-routes** (item detail, scan detail, agent detail, settings sub-pages).

### Top-level navigation order (sidebar top to bottom)

1. **Inbox** — the daily destination. Default landing post-onboarding.
2. **Scans** — the analytical destination. High-frequency for Yossi, weekly for Sarah.
3. **Schedules** — the configuration destination. Set once, forget.
4. **Crew** *(plan-gated)* — the agent customization destination.
5. **Reports** *(plan-gated)* — the export/share destination.
6. **Settings** — at the bottom, the standard convention.

The sidebar follows **frequency descending**: Inbox first because it's where Sarah lives. Schedules and Settings at the bottom because they're set-and-forget.

### IA depth per page

| Page | Depth | Notes |
|------|-------|-------|
| `/inbox` | 2 (tabs + item detail) | Tabs at top; item detail at `/inbox/[itemId]` |
| `/scans` | 3 (tabs + scan detail + per-engine drill) | Tabs at top; `/scans/[id]` deep dives |
| `/schedules` | 1 (list + new-schedule drawer) | Drawer is modal, not sub-route |
| `/crew` | 2 (list + agent detail) | `/crew/[agentType]` |
| `/reports` | 2 (list + report detail) | |
| `/settings` | 2 (sub-routes) | Each sub-page has its own URL |

### Hidden surfaces (reachable but not in sidebar)

- `/scan` (public) — promoted from marketing only, not in sidebar after auth
- `/scan/[scanId]` — emailed result links
- `/onboarding` — pre-flight gate
- All redirect routes (above)
- `/help` — **MISSING.** Recommendation: add as a hidden footer link to docs site (no in-app help page in MVP-1).

### Mobile vs desktop adaptations

**Desktop:** Sidebar pinned left, 5-7 items visible, `Cmd+K` always-on, `?` cheatsheet always-on.

**Mobile (< 768px):**
- Bottom-tab bar (max 5 visible): **Inbox / Scans / Schedules / More**
- "More" expands to Crew, Reports, Settings.
- Workspace step list (right panel) becomes bottom drawer with peek state.
- 3-pane Inbox collapses to single-column with swipe-stack pattern (Superhuman mobile model — [Mobile nav](https://help.superhuman.com/hc/en-us/articles/38458290528531-Mobile-Navigation)).
- RTL: bottom tabs reverse order; Inbox is right-most.

### The rule — what makes a page a page?

A surface earns top-level page status if and only if **all four conditions** are met:

1. **Distinct primary action** — there is one verb the user does here that isn't done anywhere else. (Inbox = approve. Scans = analyze. Schedules = configure cadence. Crew = customize agents. Reports = export. Settings = configure account.)
2. **Distinct mental model** — the user thinks "I'm going to [verb]" and the page name confirms it. Users don't navigate to "/home" — they navigate to a verb.
3. **Distinct frequency or audience** — the page is visited at a different cadence than other pages, OR by a different user segment. (Schedules is rare. Settings is rare. Inbox is daily.)
4. **Has a sub-IA** — the page has at least 2 things inside it (tabs, sub-routes, detail views). If it has only one view, it's probably a tab somewhere else.

A surface that fails any of these becomes:
- **Tab inside another page** if it shares the data shape and primary action of that page (e.g., Competitors → Scans).
- **Filter inside a list** if it's a state of items already shown (e.g., Archive → Done filter).
- **Drawer/modal** if it's a transient action (e.g., New Schedule, Run Agent).
- **Sub-route** if it's contextual to a parent page (e.g., scan detail under `/scans/[id]`).
- **Pre-flight gate** if it runs once per session (e.g., Onboarding).
- **Settings sub-page** if it's configuration (e.g., Notifications preferences, Tracked Competitors list).

This rule kills `/home` (no distinct verb), `/workspace` (same verb as Inbox at different state), `/archive` (filter on Inbox), and `/competitors` (tab on Scans). It preserves `/inbox`, `/scans`, `/schedules`, `/settings`. It earns the addition of `/crew` and `/reports` (each has a distinct verb — customize, export — and a distinct audience).

---

## PART 5 — OPEN QUESTIONS FOR ADAM

1. **Does Sarah ever export?** Reports is the highest-leverage missing surface for Yossi but irrelevant to Sarah. If 80%+ of the customer base is Sarah-shaped (Discover plan), Reports might be a Build/Scale-only surface and hidden in MVP-1. **Decision:** ship Reports in MVP-1 or defer to MVP-2?

2. **Does the agency multi-domain workspace switcher ship at launch?** Yossi-with-20-domains is the highest-LTV customer but lowest count. Workspace switcher = Otterly's primitive ([Otterly features](https://otterly.ai/features)). It belongs in Settings → Team OR as a sidebar header dropdown. **Decision:** is "team / agency mode" in MVP-1 or MVP-2?

3. **Should `/home` exist at all, or do we kill it?** Recommendation is to kill, but the Vision doc spent significant words designing it. If you want to keep it, the cleanest version is: `/home` = `/inbox` + score banner = literally the same page rendered at root. Pick one: redirect `/home` to `/inbox` (recommended) OR redirect `/inbox` to `/home` (cosmetic only — kept for marketing photos). **Decision:** which name wins?

4. **Crew or Schedules — which holds the 11 agents conceptually?** Adam's "Crew" framing puts the agents' identity on `/crew`. But Schedules is also where you *use* the crew. Two reasonable IAs: (a) Crew = roster page, Schedules = configure when crew runs (split). (b) Schedules absorbs Crew (single page where you see who runs and when). Split has more room for the "11 named agents" personality the Vision doc wants. **Decision:** split or merge?

5. **Should the `/scan/[scanId]` public-result page be a real page?** The Vision doc says emailed scan results expire in 30 days. That implies a public link the user revisits. That link page is silently the **11th page** and it has its own UX (no signup, score visible, "Save these →" CTA). It deserves explicit treatment. **Decision:** acknowledge `/scan/[scanId]` as a 2nd public route in the IA, or kill the email-copy feature?

---

## File path

Absolute path: `/Users/adamks/VibeCoding/Beamix/.worktrees/ceo-1-1777040289/docs/08-agents_work/2026-04-25-PAGE-ARCH-B-ia-audit.md`

## Sources cited

- [Linear changelog 2026-03-12 UI refresh](https://linear.app/changelog/2026-03-12-ui-refresh)
- [Linear conceptual model](https://linear.app/docs/conceptual-model)
- [Linear triage docs](https://linear.app/docs/triage)
- [Linear customize navigation mobile](https://linear.app/changelog/2026-01-22-customize-your-navigation-in-linear-mobile)
- [Notion sidebar navigation](https://www.notion.com/help/navigate-with-the-sidebar)
- [Notion Slack Canva PLG onboarding playbook](https://venue.cloud/news/insights/from-signup-to-sticky-slack-notion-canva-s-plg-onboarding-playbook)
- [Stripe Dashboard basics](https://docs.stripe.com/dashboard/basics)
- [Stripe Dashboard May 2024 update](https://support.stripe.com/questions/dashboard-update-may-2024)
- [Mercury Insights](https://support.mercury.com/hc/en-us/articles/44277089544084-Insights-page-overview)
- [Mercury Invoicing dashboard](https://support.mercury.com/hc/en-us/articles/29647851492884-Navigating-your-Mercury-Invoicing-dashboard)
- [Superhuman mobile navigation](https://help.superhuman.com/hc/en-us/articles/38458290528531-Mobile-Navigation)
- [Granola docs](https://docs.granola.ai/help-center/getting-started/granola-101)
- [PostHog redesigned nav menu](https://posthog.com/blog/redesigned-nav-menu)
- [Otterly features](https://otterly.ai/features)
- [Otterly review](https://www.tryanalyze.ai/blog/otterly-ai-review)
- [Profound visibility dashboard](https://www.tryprofound.com/blog/how-to-track-your-visibility-in-ai-search)
- [Peec.ai sidebar navigation docs](https://docs.peec.ai/sidebar-navigation)
- [Peec.ai review (Marketer Milk)](https://www.marketermilk.com/blog/peec-ai-review)
- [Ahrefs Site Audit overview](https://ahrefs.com/academy/how-to-use-ahrefs/site-audit/overview)
- [Semrush AI Visibility Toolkit guide](https://www.semrush.com/kb/1496-getting-started-with-ai-visibility-toolkit)
- [Auth0 multi-org architecture](https://auth0.com/docs/get-started/architecture-scenarios/multiple-organization-architecture)

## Confidence

**HIGH** for the IA audit verdicts on existing pages — every challenged page has a comparable product showing the consolidation pattern works.

**MEDIUM** for the proposed `/crew` and `/reports` additions — these are derived from category gaps, not from observed Beamix user behavior. Validate with 5 Sarah + 5 Yossi interviews before locking.

**HIGH** for the rule "what makes a page a page" — synthesized from 12 mature products, all consistent.

