# Designer 1 — The Overview Maximalist
**Position:** `/home` is the central daily landing surface. Inbox + KPIs + graphs + activity + history all live INSIDE `/home` as tabs and sections. `/inbox` is NOT a sibling page — it is a tab. `/archive` is NOT a sibling page — it is a tab. The home page is the whole environment in one room, not a corridor that leads to rooms.

Author: Designer 1 (Overview Maximalist)
Date: 2026-04-25
Counter-position: Designer 2 (Action-First Minimalist) — they argue `/home` should die or shrink. I argue the opposite.

---

## 1. The Thesis

A dashboard product is not a tool. A tool lands you in the work (Linear lands in Inbox, Superhuman lands in mail). A **dashboard product** lands you in the *picture* — the picture of your business, your money, your growth, your visibility. Beamix is a dashboard product. The customer pays $79–$499/month to *see what is happening to their AI visibility* AND to act on it. Hiding the picture behind a sidebar click ("oh, the score lives at /scans, the trend lives at /scans/history, the activity lives at /workspace, the inbox lives at /inbox") is bad value-delivery design. It fragments the environment into rooms when the customer paid for one floor.

The Overview Maximalist position: Beamix's `/home` is **the page**. It contains the score with trend, the top 3 fixes ready to run, the Inbox tab (what's pending), the Activity tab (what just happened), the Insights tab (the data they paid for), the History tab (the past — absorbing what would have been `/archive`), and the Schedule strip (what's coming up). One URL. One mental model. One environment. Sarah opens Beamix in the morning, sees `/home`, and her entire mental state is reset by what she sees. Yossi opens `/home` for a client and the picture for that client appears whole. Sibling pages exist (`/workspace`, `/scans`, `/competitors`, `/crew`, `/schedules`, `/settings`, `/reports`) — but they are **drill targets**, not parallel daily destinations. The morning is `/home`. Everything else is depth.

This is the Stripe / Mercury / Notion / Vercel pattern, not the Linear pattern. The Vision doc and the Customer Journey audit both already concede that Sarah's highest-frequency page is `/home` (daily, 30s) and that her "morning briefing pattern earns its keep" — they just under-build it. I'm arguing we **maximize** it instead of arguing whether it survives.

---

## 2. Day-In-The-Life — Maximalist Version

### Sarah's morning (Tel Aviv dentist, 2-chair practice)

**07:42** — She opens Beamix on her iPad over coffee. The URL she lands on is `app.beamix.tech/home`. She sees, in order from top to bottom:

1. **Hero score block** — large `47` with `↑ +6 since Monday`, a 12-week sparkline running underneath, semantic color (amber: "Fair"), a one-line plain-Hebrew diagnosis: "אתה מוזכר ב-3 מתוך 9 מנועי AI. תיקון אחד יקפיץ אותך."
2. **Action zone — "Top 3 fixes ready to run"** — three RecommendationCards, each with estimated-impact pill ("+4 score") and a "Run →" CTA. A single primary button: "Run all top fixes — 14 credits."
3. **The TabBar** — `Inbox (2) · Activity · Insights · History · Schedule`. The Inbox tab is bold by default for Sarah (she gets routed to the action). Yossi's tab default is Insights (more on that below).
4. **Tab content** — for Sarah, the Inbox tab is open: 2 items pending review. She sees "Homepage copy ready to review" and "FAQ schema ready to publish."
5. **What's coming up** strip at the bottom — "Next scheduled scan: Tuesday 9am · Next agent run: Wednesday."

**07:43** — She clicks "Homepage copy ready to review." A modal slides up (or a side drawer, depending on mobile vs desktop) showing the diff. She approves. The card vanishes; the tab badge ticks down to (1).

**07:44** — She clicks the second item, approves. The Inbox tab is empty. The tab caption changes to "Nothing to review — all caught up." She glances back at the score block. She closes the tab.

**Total session: ~120 seconds. Pages visited: ONE. URL: `/home`.** She did not navigate. She did not choose where to look. The environment showed her everything she needed to know in one frame.

### Sarah's evening glance (Day 4)

**21:18** — On her phone, half-watching TV. Opens the app. Lands on `/home`. The score is still 47 but the sparkline shows a tiny upward kink ("the work is starting to show"). She doesn't have anything in Inbox tonight. She glances at the History tab idly: "This week: 4 fixes approved, 3 published, score +6." She closes the tab. **30 seconds. Felt: rewarding.**

### Yossi's morning (SEO consultant, 20 client domains)

**08:55** — Opens Beamix. The top-of-sidebar Domain Switcher is set to `client-12-saturn-bakery.co.il` from yesterday. He clicks it, drops to `client-1-tel-aviv-medical-group.co.il`. Page reloads — `/home` for that client.

He sees:
1. Hero score block for that client — `62 ↑ +3 since Friday`.
2. Top 3 fixes ready — but Yossi's `/home` defaults to the **Insights tab**, not Inbox. (Sarah-mode default vs Yossi-mode default — see §3.)
3. TabBar: `Insights · Inbox (4) · Activity · History · Schedule`.
4. Insights tab content: per-engine score grid (ChatGPT 71 / Gemini 45 / Perplexity 60 / Claude 55 / Grok 52 / You.com 48 / AI Overviews 49), 12-week mention-count chart, citation count chart, top 3 competitors with deltas. **This is the picture.** He scans it in 8 seconds.
5. He hits `J` to switch to Inbox tab. Reviews 4 items in 90 seconds, batch-approves with `Cmd+Shift+A`.
6. Switches Domain Switcher to client 2. New `/home`. Same flow. ~60 seconds per client.

**He did NOT need to navigate to /scans, /workspace, /inbox as separate pages.** He drills into `/scans` only when something looks weird on the per-engine grid. He drills into `/workspace` only when an agent is mid-execution and he wants the full-screen run view. He drills into `/competitors` only when he's writing a client deliverable. **His morning loop is `/home → switch domain → /home → switch domain`, twenty times.** That's not 20 pages. That's one page, scoped 20 ways.

When he wants raw model output for a query, he drills: `/home → click EnginePill → /scans/[scanId]/engines/gemini → click query row → raw output`. The drill is allowed; the home is the lobby; the lobby has every signal.

### What this means

The same surface serves two extremes:
- Sarah uses `/home` as *the entire product* — she rarely leaves it. She's 90% home + 10% modal interactions launched from home.
- Yossi uses `/home` as *the cockpit per client* — he comes back to it every domain switch. He spends 70% of time on home, 30% drilling into siblings.

**This is exactly Stripe's pattern.** Stripe's small-business owner lives on Home. Stripe's growth-team analyst lives on Reports. They share the same Home as the lobby.

---

## 3. The Specific `/home` Structure (Page Spec)

### Vertical structure (top to bottom)

**Block 0 — Domain Switcher chrome** (top-of-sidebar, not part of `/home` itself, but the page is scoped to the active domain). For Sarah, locked to her one domain. For Yossi, dropdown.

**Block 1 — HERO SCORE** (full width, ~280px tall on desktop)
- Big number (96px), weight medium
- Delta badge inline: `↑ +6 since Monday`
- 12-week sparkline running underneath the number, hand-drawn Rough.js style (tying to brand)
- Semantic color band: red (0–34) / amber (35–59) / green (60–79) / cyan (80+)
- One-line plain-language diagnosis
- A subtle "Last scan: Tuesday 9:14am · Scan now →" link bottom-right

**Block 2 — TOP 3 FIXES READY** (full width, ~220px tall)
- Three RecommendationCards horizontally on desktop, stacked on mobile
- Each card: agent type icon, headline ("FAQ schema missing"), estimated-impact pill ("+4 score"), credits cost, "Run →" CTA
- A single primary button at the right: "Run all 3 — 14 credits"
- This is the **action zone** — the one place Sarah actually clicks each morning
- Empty state: "Nothing urgent today — score is healthy" with a soft hand-drawn check mark

**Block 3 — TABBAR** (sticky-able as user scrolls past blocks 1 + 2)
- Tabs: `Inbox · Activity · Insights · History · Schedule`
- Sarah-mode default: `Inbox` (action-first within home)
- Yossi-mode default: `Insights` (data-first within home)
- Default determined by user preference set at onboarding ("Are you running this for your own business, or for clients?") + adjustable in /settings

**Block 4 — TAB CONTENT** (variable height, scrolls)
- See §4 for what each tab contains

**Block 5 — WHAT'S COMING UP STRIP** (footer, persistent)
- "Next scheduled scan: Tuesday 9am"
- "Next agent run: Wednesday — Content Optimizer for /pricing"
- Cmd+. shortcut to skip / advance / configure

### Sarah-mode vs Yossi-mode default

The same page, two opening states:
- **Sarah-mode (default for solo SMB owners):** Inbox tab open, Insights tab collapsed by default. Score block is hero.
- **Yossi-mode (default for agency users / Scale tier):** Insights tab open, Inbox tab badge visible. Score block is hero.

Switchable via a small "View as: Owner / Operator" toggle in the page header. Persisted per-account.

This is **the same pattern as Linear's "Active / Backlog" view memory or Notion's per-page view defaults** — the page accommodates two mental models without forking into two pages.

---

## 4. Where Every KPI Lives

The full KPI inventory and their home on `/home`:

| KPI | Where on /home | Why |
|---|---|---|
| **AI Visibility Score (current)** | Block 1 (hero) | The headline number — never hidden |
| **Score delta vs last scan** | Block 1 inline badge | Context for the number |
| **Score trend (12 weeks)** | Block 1 sparkline | Story arc — "is it working?" |
| **Score trend (1 year)** | Insights tab — primary chart | Long memory for renewal decisions |
| **Top 3 fixes ready** | Block 2 (action zone) | Action attached to picture |
| **Pending review count** | TabBar Inbox badge `(2)` | At-a-glance state |
| **Mentions per engine (current)** | Insights tab — grid of EnginePills | The "where am I visible" map |
| **Mentions per engine (over time)** | Insights tab — small multiples chart | "Which engine is improving?" |
| **Citation count (current)** | Insights tab — KPI card | Distinct from mentions; a quality proxy |
| **Citation count (over time)** | Insights tab — line chart | Slow-moving but renewal-relevant |
| **Top competitor positions** | Insights tab — competitor mini-table (top 3) | Competitive context inline; full surface at /competitors |
| **Agent activity feed** | Activity tab | "What just happened?" |
| **Recent scans (last 5)** | History tab | "Past scans without leaving home" |
| **Completed reviews (last 30)** | History tab | Absorbs /archive entirely |
| **Approved content output (last 30)** | History tab | The portfolio of work done |
| **Credits balance** | Top-right header chip + Insights tab card | Always visible chip; full breakdown in tab |
| **Credits burn rate (this month)** | Insights tab — small chart | "Am I going to run out?" |
| **Schedule status** | Block 5 (footer strip) | "What's next" — always visible |

**This is 17 KPIs surfaced on one page. None are buried. None require navigation.**

The Action-First Minimalist position pushes most of these to subpages and leaves only the score and the inbox on `/home`. That makes the customer pay $499/month and then *not see* most of what they're paying for unless they navigate. That is bad value-delivery design.

The Maximalist response: progressive disclosure via tabs. The same 17 KPIs that feel "overstuffed" if dumped into one screen feel "appropriately rich" when organized into 5 tabs. Tabs are a *progressive disclosure* mechanism, not a *navigation* mechanism — the user stays on /home; they reveal sections they want.

---

## 5. Where `/archive` Lives

**`/archive` does NOT exist as a sibling page.** It is the **History tab on `/home`.**

The History tab contains:
- **Past scans** — DataList of the last 50 scans, scrollable, clickable to drill into `/scans/[scanId]` for the full per-scan view
- **Completed reviews** — what used to live in `/archive`: the Inbox items that have been approved/rejected/published, last 90 days
- **Approved content output** — the artifacts produced by agents (homepage copy, FAQ schema, blog draft) — accessible without leaving home
- **Score history rows** — every recorded score change with timestamp and trigger

Why this is the right call:
1. **The Customer Journey audit** already established `/archive` as a non-page. Both auditing agents agreed: archive is a state, not a place. The Maximalist position simply locates that state correctly — on `/home` in History.
2. **Sarah at month 6** wants to see "did the work pay off?" That's a History question and it's renewal-critical. Forcing her to navigate to a separate `/archive` to answer it is hostile. On the History tab of `/home`, it's one click from the score she just looked at.
3. **Yossi at week 4** is preparing client deliverables. He wants to filter "everything we did for client X in the last 30 days." That's History tab + Domain Switcher scope = one filter, no navigation.
4. **The Stripe pattern** does this exactly: Stripe Home shows recent payments AND recent payouts AND recent disputes — historical events, on home, in panels. Stripe doesn't have `/archive`.

---

## 6. The Comparison — 7 Products Doing Overview-Maximalist Right

### 1. Stripe Dashboard ([docs.stripe.com/dashboard/basics](https://docs.stripe.com/dashboard/basics))

**What's on /home:** Today's revenue, charges, payouts, disputes (4 KPI cards with trend indicators and sparklines). Recent payments list. Recent customer activity. Balance summary. Alerts.

**Why it works:** Stripe has 12+ product lines and they STILL put a single Home page that surfaces today's picture. The 4 KPI cards are the daily reset for any business owner. Recent payments are the heartbeat. The user does not need to click "Revenue" or "Customers" or "Payouts" to see today — Home shows it. **Stripe's "Reports" is a *separate, deeper* page; but the daily picture lives on Home.** Beamix should follow this exactly.

**Direct mapping to Beamix:**
- Stripe's "Today's revenue" → Beamix's "AI Visibility Score (today)"
- Stripe's revenue sparkline → Beamix's score sparkline
- Stripe's recent payments list → Beamix's recent activity feed (Activity tab)
- Stripe's balance summary → Beamix's credits balance
- Stripe's alerts → Beamix's "Top 3 fixes ready to run"

**Source:** [Dashboard home page charts for business insights — Stripe support](https://support.stripe.com/questions/dashboard-home-page-charts-for-business-insights). The 2026 design pattern analysis confirmed: "the strongest dashboard pattern combines sidebar navigation, a card-based metric strip (4-6 KPIs), and a flexible content grid" ([Dashboard Design Patterns 2026](https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/)).

### 2. Mercury Dashboard ([mercury.com](https://mercury.com/))

**What's on /home:** Real-time balances across accounts, burn rate, runway calculation, recent transactions cashflow chart, cards summary, send-money quick action.

**Why it works:** Mercury's Home is the founder's morning. Balance + burn + recent moves + the action ("send money") all in one frame. Founders don't navigate Mercury — they live on Home and drill out only when reconciling specifics. The cashflow graph defaults to the current month and is right there ([Mercury blog — updated transactions page](https://mercury.com/blog/updated-transactions-page)).

**Direct mapping to Beamix:**
- Mercury's balance → Beamix's score
- Mercury's burn rate → Beamix's mentions trend
- Mercury's runway → Beamix's "score projection if you run top fixes" (a Build/Scale-tier prediction)
- Mercury's recent transactions → Beamix's Activity tab
- Mercury's "Send money" CTA → Beamix's "Run top fixes" CTA

**Source:** [Mercury Banking for Startups](https://mercury.com/) and [Mercury Bank 2026 design — Siiimple](https://siiimple.com/mercury-bank/).

### 3. Notion Workspace Home ([notion.so](https://notion.so))

**What's on /home:** Recently visited pages, your work-in-progress, comments waiting for you, calendar sync, AI suggestions. Tabs across the top let you switch view (Recent / Favorites / All).

**Why it works:** Notion's home is "your workspace, scoped." It's not a router — it's a personalized lobby. The tabs at the top are not navigation, they're filters on the same surface. Notion proved that **tabs-inside-home** is the dominant pattern for personal-knowledge dashboards.

**Direct mapping to Beamix:**
- Notion's recently visited → Beamix's History tab
- Notion's tabs (Recent / Favorites / All) → Beamix's tabs (Inbox / Activity / Insights / History / Schedule)
- Notion's "AI suggestions" panel → Beamix's "Top 3 fixes ready"

### 4. PostHog Dashboards ([posthog.com](https://posthog.com))

**What's on /home (or default Dashboard):** KPI tiles, trend charts, recent events, funnels, retention. Tabs across multiple dashboards. The Dashboards page IS the home of insights.

**Why it works:** Analytics products explicitly treat the dashboard as the daily picture. PostHog leans into the rich-page model. Yes, PostHog has more sprawl than Beamix needs (~11 sidebar items per the Customer Journey audit) — but their *Home* is overview-maximalist. **The lesson is not to copy their sidebar; it's to copy their Home density.**

**Direct mapping to Beamix:**
- PostHog's KPI tiles → Beamix's Insights tab KPI cards
- PostHog's trend charts → Beamix's per-engine small multiples
- PostHog's funnel widgets → Beamix's recommendation conversion rate (which fixes get approved)

### 5. Vercel Dashboard ([vercel.com/dashboard](https://vercel.com/dashboard))

**What's on /home:** All projects in a grid. Recent deployments per project. Activity feed. Usage metrics. Account-level alerts.

**Why it works:** Vercel's Home is "your projects + their state + recent activity." For a multi-project user (= Yossi's multi-client equivalent), the Home is the lobby that shows all 20 projects at a glance. Beamix's Yossi-mode `/home` should similarly support a "show all 20 clients" overview when domain switcher is set to "All clients."

**Direct mapping to Beamix:**
- Vercel's project grid → Beamix's "All clients" Yossi-mode view (Scale tier feature)
- Vercel's deployment activity → Beamix's Activity tab
- Vercel's per-project status → Beamix's per-domain score chips

### 6. GitHub Home ([github.com](https://github.com))

**What's on /home:** Tabs (`For You`, `Following`). Activity feed. Pinned repos. Recent activity. Issues + PRs awaiting your action.

**Why it works:** GitHub's home is **two tabs across the same surface**, not two pages. The user picks their lens but stays on the same URL. This is the gold standard of "tab-as-mode-not-nav."

**Direct mapping to Beamix:**
- GitHub's `For You` tab → Beamix's Sarah-mode default (Inbox tab forward)
- GitHub's `Following` tab → Beamix's Yossi-mode default (Insights tab forward)
- GitHub's "issues awaiting action" → Beamix's Inbox tab content

### 7. Linear ([linear.app](https://linear.app)) — counter-example, why their pattern doesn't fit

**What's on /home (Linear's dashboard):** Linear *technically* has a Dashboard, but it's a slim summary. The product centers on Inbox / My Issues / Triage — work surfaces.

**Why it doesn't fit Beamix:** Linear is an **issue tracker**. The product IS the work queue. There's no "picture of your business" — there's only the work. So landing in the work is correct.

**Beamix is not Linear.** Beamix is a *visibility platform*. The customer pays to *see their visibility* (a picture) and to *act on it* (a queue). Linear's pattern (slim Dashboard, work-centric Inbox) optimizes for one half. Stripe / Mercury / Notion / PostHog / Vercel / GitHub optimize for both — and that's what Beamix needs.

The Customer Journey audit accidentally tilts toward Linear by saying "Linear has no home page — the default landing is the user's last view or Inbox." That's true and that's correct *for Linear*. It's the wrong reference for Beamix. The right references are dashboard products, not work trackers.

---

## 7. Counter to the Action-First Minimalist (Pre-Rebuttal)

Designer 2 is going to make these arguments. Here are my pre-rebuttals.

### Their argument 1: "Inbox should be its own page so Yossi can live there."

**My rebut:** Yossi already lives on `/home` per client domain — that's the Customer Journey audit's own finding (`/home: per-client landing, ~10×/day`). His Inbox time is concentrated DURING the per-client landing, not in a separate page session. Splitting Inbox into a sibling forces him to switch URLs every time he switches between "checking the picture" and "approving the work" for the same client. That is two mental models for the same loop. **One mental model: the client's `/home` shows the picture and the queue together; Yossi works the queue without leaving home.** That's faster, not slower.

If Yossi wants to focus only on Inbox across all 20 clients (the "Monday batch review" use case), the Domain Switcher's "All clients" mode + the Inbox tab is the answer. The tab fills the page; it's effectively the same as a dedicated Inbox page, but it stays inside the home environment. **Same density. Same keyboard. Same Cmd+K. One URL.**

### Their argument 2: "Linear has Dashboard + Inbox separate."

**My rebut:** Linear is an issue tracker, not a dashboard product. See §6 #7. Beamix is closer to Stripe / Mercury / Notion / PostHog / Vercel / GitHub — all of which keep the picture and the queue together on Home. Picking Linear as the reference is a category error. The Customer Journey audit makes this mistake explicitly when it says "Linear precedent confirmed: No comparable product (Linear, Notion, Stripe, Granola) has /archive as a top-level page." That sentence is right about /archive but wrong by extension — those four products handle Home very differently. **Notion and Stripe both have Home pages with rich content. Granola is a meeting tool, not a dashboard. Linear is an issue tracker, not a dashboard.** The audit confused "they don't have /archive" with "they don't have rich Home." Those are different claims.

### Their argument 3: "/home becomes overstuffed if you put 17 KPIs on it."

**My rebut:** 17 KPIs across 5 tabs = ~3-4 KPIs per tab. That is not overstuffed; that is *Stripe's exact pattern* (4 KPI cards on Home + Reports for depth). The Block 1+2 visible-on-load surface contains: 1 hero KPI (score), 1 trend (sparkline), 1 delta, 3 fixes, 1 CTA. That is **5 things visible above the fold**. The tabs progressively disclose the rest. The *visible density* on first paint is the same as Linear's Inbox. The *available density* is much greater because the tabs hold it. **Progressive disclosure is the answer to overstuffing. Killing KPIs is not.**

### Their argument 4: "If /home dies, every page becomes faster to reach because there are fewer sidebar items."

**My rebut:** Sidebar item count is a vanity metric. The cost of one extra sidebar item is ~zero. The cost of forcing the customer to navigate to *find* the picture they paid for is enormous. Sarah's bounce rate goes up if she has to choose "where do I look?" every morning. Yossi's per-client switch time triples if he has to navigate Inbox → Score → Activity for each of 20 clients instead of getting all three on one URL. **Removing /home doesn't speed anything up; it offloads cognitive work from us to the user.**

### Their argument 5: "The score banner on /inbox is enough — that's the Stripe pattern at small scale."

**My rebut:** A banner is a placeholder for a page. Stripe's Home is not a banner on Payments; it's a full surface with 4 KPI cards, sparklines, recent activity, alerts, and balance. Banners are for one number. **17 KPIs do not fit in a banner.** If we ship Beamix with only a score banner on `/inbox`, we are systematically hiding the data the customer paid for. That is a $79–$499 product showing $19 of UI.

### Their argument 6: "Beamix's product is the work the agents do — the queue is the product."

**My rebut:** This is the fundamental disagreement. **The agents are an *execution layer*. The visibility is the *value layer*.** The customer doesn't pay to use agents; they pay to BE VISIBLE in AI search. The agents are the means; the visibility is the end. The dashboard MUST show the end (visibility, score, trend) prominently, not just the means (agents, queue, work). Treating Beamix as a "queue product" undersells it. **Beamix is a visibility product with a built-in execution loop.** The home page must reflect that — picture first, queue second, both on the same surface.

---

## 8. Risks + Mitigations

### Risk 1: Visual overload on first load
A page with 17 KPIs available risks looking cluttered.

**Mitigation:**
- Progressive disclosure via tabs (only one tab visible at a time)
- Block 1 (hero score) is dominant; everything else is below the fold
- Sarah-mode default opens Inbox tab (lighter density); Yossi-mode opens Insights tab (denser, by choice)
- Hand-drawn brand language softens density (Rough.js outlines, sparklines, not corporate-stark)
- Empty states are warm, not stark ("Nothing to review — all caught up")

### Risk 2: Mobile rendering of dense home
A multi-section home is hard on a 375px screen.

**Mitigation:**
- Block 1 (hero) is full-width regardless
- Block 2 (top 3 fixes) collapses to 1 card + "see 2 more" expander on mobile
- TabBar collapses to a horizontal scrollable row
- Tab content stacks vertically on mobile
- Footer strip becomes a sticky bottom bar
- Tested against the Stripe iOS app pattern (which keeps Home rich on phone) and Mercury iOS (same)

### Risk 3: Tab switching lag on data fetches
Tabs with KPIs need data; switching shouldn't feel slow.

**Mitigation:**
- Server-render Block 1 + Block 2 + active tab on first load (Next.js 16 server components — already in stack)
- Pre-fetch other tab data on tab hover (200ms head start)
- Skeleton states with Rough.js outlines snap-in (matches brand)

### Risk 4: Yossi-mode and Sarah-mode confuse first-time users
Two defaults on the same page = unclear which one is "right."

**Mitigation:**
- Onboarding step asks: "Are you running Beamix for your own business, or for clients?" → sets default mode
- Mode toggle in page header is small and reversible
- Per-account preference; switching once persists

### Risk 5: Designer 2's argument holds: "Just do the score banner on /inbox."
Sceptics will say the Maximalist position is over-engineering.

**Mitigation:** Build the Maximalist `/home` and *measure* what Sarah and Yossi actually click. If 90% of Sarah's home clicks are on the Inbox tab, we've validated the Maximalist position (she stayed on home; she didn't navigate). If she ignores Insights, History, Schedule, *we already shipped them at low cost as tabs* and we can re-think — but **we shipped the picture at full strength**. The reverse (ship slim, add later) means months of customers paying for visibility they never see.

---

## 9. Adam's "Whole Environment" Frame

Adam's exact words from DECISIONS-CAPTURED:

> *"All the flows and all the features and all the buttons should feel like it's the right place where the customers will need them"*

> *"They are not super technical, and they're not super 'you need to know what you're doing'"*

> *"The app will guide you. The app will help you. Beamix will help you."*

> *"About the product designing and the flows and the subtle animations and all the environment that we are creating"*

The Maximalist position **directly serves** this frame:

1. **"It's a whole environment that we are building"** → ONE environment, ONE primary surface, ONE place where everything important lives. Splitting into 8+ sibling pages of equal weight makes the environment feel like a corridor of rooms, not a place. The Maximalist makes it a single living space — like Stripe's Home is the founder's daily room, like Mercury's dashboard is the founder's morning room.

2. **"Not super technical, not 'you need to know what you're doing'"** → A user who lands on `/home` and sees the picture + the action does not need to know the structure. A user who lands on `/inbox` and is told "the score is at /scans, the activity is at /workspace, the trend is at /scans/history" needs to navigate. **Maximalist reduces navigation. Action-First Minimalist increases it.**

3. **"The app will guide you. Beamix will help you."** → The home page IS the app's guidance. By showing the score AND the next action AND the context AND the history together, Beamix tells the user "this is where you are, this is what's next, this is what just happened." A slim home defers the guidance to the user's navigation choices.

4. **"All the buttons should feel like the right place"** → The "Run top fixes" CTA on Block 2 IS the right place because the score that motivates the click is right above it (Block 1). Splitting them across pages weakens the motivation-to-action chain.

Adam's reframe (the verbatim quote):

> *"The home page... it's gonna be just the inbox page or, like, it's the inbox page, but we will change the inbox page to show more data and to be like the main page. Like, the home page. And we will maybe, you know, like, create an overview page and insert inside there the tab with the inbox and all of the other things because you remember we have all sorts of KPIs and data points and graphs."*

Adam himself is articulating the Maximalist position. He's saying: take what would have been Inbox, expand it into the overview, put the Inbox as a tab inside, surface all the KPIs and graphs there. **That is exactly what this document specifies.** Designer 2's position contradicts Adam's reframe; Designer 1's position implements it.

---

## 10. The Final Position

**`/home` is the central surface and contains:**
- Hero score block (KPI #1)
- Top 3 fixes ready to run (action zone)
- Tab row: `Inbox · Activity · Insights · History · Schedule`
- The Inbox tab IS what would have been `/inbox` — full review queue, 3-pane on desktop, fits inside the home environment
- The History tab IS what would have been `/archive` — past scans, completed reviews, approved content
- The Insights tab holds 12+ KPIs and graphs (per-engine, mentions, citations, trends, credits burn)
- The Activity tab is the live event feed (recent agent runs, recent scans, recent approvals)
- The Schedule tab is recurring scans + agent schedules at-a-glance (with link to full /schedules page for editing)

**Sibling pages in the sidebar (NOT containing the daily essentials):**
- `/workspace` — full-screen agent execution (drill from Activity tab when run is in progress)
- `/scans` — deep per-scan drill-down (drill from History tab or Insights tab)
- `/competitors` — competitive intelligence (drill from Insights tab competitor mini-table)
- `/crew` — 11-agent roster (drill from Activity tab agent type)
- `/schedules` — schedule editing (drill from Schedule tab)
- `/reports` — Scale-tier exports (gated)
- `/settings` — sub-routed config

**Sidebar count: 8 items (`/home` + 7 siblings + chrome).** No `/inbox` sibling. No `/archive` sibling. The picture is whole. The action is at hand. The environment is one.

This is the Stripe pattern. This is the Mercury pattern. This is the Notion pattern. This is the GitHub pattern. This is what Adam said he wants.

Sarah's morning becomes 60–120 seconds, ONE URL, no decisions about where to look. Yossi's morning becomes 60 seconds × 20 clients, ONE URL pattern repeated, no per-client navigation between Inbox / Workspace / Scans / Score for the same client. **The product feels like an environment, not a corridor.**

---

## 11. Adam-Specific Open Questions

1. **Sarah-mode vs Yossi-mode default — onboarding step or auto-detect?** Should we ask "Are you running this for your own business, or for clients?" in onboarding (1 extra step) and persist the per-account default? Or auto-detect from plan tier (Discover → Sarah-mode; Build/Scale → Yossi-mode is a heuristic, not a guarantee)? Recommendation: ask explicitly in onboarding, default to Sarah-mode if skipped.

2. **Domain Switcher "All clients" view (Yossi-mode) — ship it in MVP or defer?** The `/home` for Yossi works perfectly per-client. But the "show me all 20 clients in one grid" view (Vercel-style project grid) is the highest-leverage Yossi feature for the Scale tier. Is that an MVP-1 feature or a fast-follow? Recommendation: scaffold the URL pattern (`/home?scope=all`) but ship per-client mode first, all-clients in fast-follow.

3. **Tab order — Insights or Inbox first in the tab row visually?** Even though defaults differ per mode, the tab order in the bar matters for keyboard nav (Tab key cycles through them). Recommendation: visual order is `Inbox · Activity · Insights · History · Schedule`. Active tab is colored — Sarah sees Inbox as colored, Yossi sees Insights as colored. Both see the same row order.

4. **History tab depth — last 30 days, 90 days, or all-time?** The Archive that this absorbs technically holds all completed items. Should the History tab on /home show all-time (with virtualization) or last 90 days with a "view full history →" link to a full-page archive view at `/scans/history`? Recommendation: 90 days on home, "view all →" link drills to `/scans` filtered to all-time history.

5. **Schedule strip (Block 5) — always-visible footer or collapsible?** The "What's coming up" strip is informational, not action-critical. Should it persist always or be a collapsed bar that Sarah can dismiss? Recommendation: persist always but make it visually quiet (small text, no color emphasis); never auto-dismiss.

---

## Sources

- [Stripe Web Dashboard — Documentation](https://docs.stripe.com/dashboard/basics) — Home page contains balances, transactions, customers, products at-a-glance with a sidebar router; KPI strip + content grid
- [Stripe — Dashboard home page charts for business insights](https://support.stripe.com/questions/dashboard-home-page-charts-for-business-insights) — confirms 4-card KPI strip with trend indicator and sparkline as the home pattern
- [Dashboard Design Patterns 2026 — Art of Styleframe](https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/) — confirms sidebar (240–280px) + 4–6 KPI metric strip + flexible content grid as 2026 strongest pattern
- [Mercury — Banking for Startups](https://mercury.com/) — real-time balances, burn rate, runway, recent transactions all on dashboard home
- [Mercury — updated transactions page](https://mercury.com/blog/updated-transactions-page) — cashflow chart defaults to current month directly on the page
- [Mercury Bank 2026 Design — Siiimple](https://siiimple.com/mercury-bank/) — comprehensive single-interface dashboard design
- [Notion — workspace home pattern](https://notion.so) — recently visited, comments, AI suggestions, tabs across home for filtering
- [PostHog — Dashboards as analytics home](https://posthog.com) — KPI tiles + trend charts + funnels + retention on a single dashboard surface
- [Vercel Dashboard — multi-project home](https://vercel.com/dashboard) — projects grid + recent deployments + activity feed on one home
- [GitHub Home tabs](https://github.com) — `For You` and `Following` tabs as modes-on-same-surface, not pages
- [Linear — Conceptual Model](https://linear.app/docs/conceptual-model) — counter-example; Linear lands in last view or Inbox because Linear is an issue tracker, not a dashboard product
- [Linear Triage — official docs](https://linear.app/docs/triage) — confirms Linear's "Inbox" is notifications and "Triage" is review (resolves naming clash, supports Beamix using `Inbox` as a tab inside `/home`)
- [Profound features — competitor IA](https://www.tryprofound.com/blog/best-ai-visibility-tools-for-marketing-agencies) — confirms agent roster as a top-level page in GEO category
- [Otterly features](https://otterly.ai/features) — confirms workspace primitive across competitors
- [Beamix Customer Journey audit — Agent A](docs/08-agents_work/2026-04-25-PAGE-ARCH-A-customer-journey.md) — Sarah's `/home` is daily 30s; Yossi's is per-client landing 10×/day
- [Beamix Page Architecture — full audit](docs/08-agents_work/2026-04-25-PAGE-ARCHITECTURE.md) — both auditing agents agreed Sarah's habit forms on `/home`; the disagreement was depth, not existence
- [Adam's Decisions — 2026-04-25](docs/08-agents_work/2026-04-25-DECISIONS-CAPTURED.md) — "whole environment" framing, "all the buttons should feel like the right place"
