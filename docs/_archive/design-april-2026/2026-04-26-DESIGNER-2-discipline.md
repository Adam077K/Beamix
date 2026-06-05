# Designer 2 — The Shipping Discipline Position
**Position:** Restraint is the billion-dollar move. Most pages should look like they were *removed* into existence, not designed into existence. Linear's 2024 refresh earned its quality precisely by *taking things away*: less saturation, dimmer chrome, smaller icons, fewer borders. Stripe's "data-loads-completely-before-UI-shows" is a discipline of withholding. Mercury uses one accent color across the whole product. The most expensive products resist decoration. The cheap-feeling products are the ones that try hardest.

Author: Designer 2 (Shipping Discipline)
Date: 2026-04-26
Counter-position: Designer 1 (Distinctive Move on Every Page) — they argue every page needs an inventive Beamix-only flourish. I argue most pages should look like Linear / Stripe / Mercury and earn their distinctiveness through the rare moments where they don't.

Sources synthesized into every claim below:
- `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_quality_bar_billion_dollar.md` — quality bar
- `docs/08-agents_work/2026-04-25-PAGE-LIST-LOCKED.md` — locked 10 pages + chrome
- `docs/08-agents_work/2026-04-25-HOME-DESIGN-SPEC.md` — Section 3 (single text line, no card, no banner) is the move I'm defending
- `docs/08-agents_work/2026-04-25-ANIMATION-STRATEGY-LOCKED.md` — most pages = NO skeleton-draw (that decision is mine)
- `docs/08-agents_work/2026-04-25-HOME-PREMIUM-REFS.md` — anti-patterns N1-N8

---

## 0. THE THESIS — Restraint is rare, decoration is common

Adam pushed back on /home Section 4 because it defaulted to Stripe-pattern. The temptation reading that pushback is "every section needs a Beamix-only invention." That over-correction is the trap. The right reading is: **/home is the brand-defining surface and earns deliberate distinctive moves; the other 10 pages mostly do not.**

Designer 1 will argue that /settings deserves a hand-drawn Beamie illustration. That every empty state needs a custom Rough.js sketch. That /schedules cron rows should look like notebook handwriting. That /reports should have a Stripe-Press editorial register. **Every one of those is decoration disguised as design.** They're the moves a 20-person AI-startup-template makes. They're not what Linear does. They're not what Mercury does. They're not what Anthropic Console does.

The billion-dollar feel comes from:
1. **Calibration.** /home is loud (deliberate). /settings is quiet (deliberate). The contrast between the two is the brand.
2. **Withholding.** The hand-drawn idiom appears in 5 places across the entire product. Not 50.
3. **Calmness on admin surfaces.** Stripe's billing tab looks like a billing tab. The discipline of NOT prettifying admin is what telegraphs "we ship serious software for serious businesses."
4. **Borrowing existing patterns and not apologizing for it.** Linear's 3-pane Triage IS the right pattern for /inbox. Inventing a new pattern just to avoid the comparison would be ego, not design.
5. **Microcopy that earns its keep.** Words removed are weight added.

This document argues page-by-page where to PULL BACK from Designer 1's distinctive-move-per-page reflex. I'll concede where Designer 1 has the stronger case at the end (§11).

I'm not the "no animation, no character, plain Shadcn" voice. I built the animation strategy that puts the signature motion vocabulary on /home and /scan and lets every other page render instantly. That asymmetry IS the brand. Quiet rooms make the loud rooms feel earned.

The five anchor references for THIS position are: **Linear's chrome dimming**, **Stripe's wait-for-data instead-of-skeleton**, **Mercury's single-accent-blue across whole product**, **Anthropic Console's hand-drawn-restricted-to-Claude.ai-not-Console**, and **Things 3's single-brand-color discipline.**

---

## /inbox

### The discipline move (the headline restraint)
**Inbox borrows Linear Triage 3-pane verbatim. It does not try to invent a new triage pattern.** Filter rail left, item list center, sticky preview + ActionBar right. Multi-select with shift-click and `Cmd+A`. J/K nav. Tabs at top: Pending / Drafts / Live. The discipline is to ship the already-canonical pattern at billion-dollar fidelity, not to ship a "Beamix-distinctive triage paradigm" that will be slower to learn, harder to maintain, and worse for Yossi's hands. Yossi's velocity is measured in items-approved-per-minute. Anything that breaks his Linear muscle memory loses him 30% throughput.

### What animation does NOT belong here
- **NO skeleton-draw on entrance.** Inbox renders instantly. Animation strategy already locked this — I want to make sure it stays locked. Yossi opens /inbox 2-3× per day for 10-15 minutes. A 1.4s draw-in is not a "premium moment" the third time today; it's a performance regression he tolerates.
- **NO row-by-row staggered fade-in on the list.** The list shows up. That's it.
- **NO animated approve button.** Approve is `A` keypress → instant 200ms collapse + strikethrough + toast. The collapse IS the animation; the button itself does not animate.
- **NO hand-drawn empty state inside this page on the empty/zero-pending screen.** Yes, the animation strategy says one of the 5 illustrations lives on /inbox zero-state. I'm conceding to that decision (Adam locked it). But the illustration MUST stay static (no draw-in), MUST stay max 96×96px, and MUST not appear when filters are applied — only on the absolute zero-pending state.

### Where Designer 1 will be wrong
Designer 1 will propose that the Inbox /home-style score chip in the top-right "should be a Beamix-distinctive radial gauge" or "should pulse subtly to remind Yossi why he's there." Both are wrong. The score chip is **passive reference** — it's not chrome, not a banner, not a CTA. It's a context anchor: 12px caps weight 500 muted text + the number. If it pulses, it competes with the work surface, which is the only thing that should hold attention. The discipline is to make it so quiet that Yossi could forget it's there — and that's correct.

Designer 1 will also propose card-hover-tilt or 3-deg rotation on item rows in the list. NO. Item rows are work to be triaged at 60 items per minute. Hover-tilt costs Yossi 50ms of visual settling per row. Multiply that by 1000 items per week = 50 seconds of pure animation tax for nothing. Item rows have one hover state: a 1px left-border in #3370FF + background lighten. That's it.

### What's the smallest possible page that still works?
Three columns, no decoration, J/K nav, batch select, instant approve. No tabs even — just "Pending" with a count. The Drafts and Live tabs can ship in v2 if usage shows demand. **The minimum is shockingly close to the right answer.** A keyboard-driven 3-pane that disappears into the background is the move. Linear's whole insight is that the *interface should feel less and less* the more you use it.

### Where the page borrows from existing patterns (and that's correct)
- **Linear Triage 3-pane** — the canonical structure. Borrow whole.
- **Stripe payments queue** — single-action approve UX with optimistic UI.
- **Superhuman keyboard nav** — J/K + multi-select + bulk actions.
- **Sonner toast** (Emil Kowalski) — quiet confirmation pattern.

Inventing a new triage pattern here = AI slop in disguise. The Linear pattern is right because Linear spent two years finding it.

### Microcopy: what to remove
- Cut "Welcome to your Inbox" header. Inbox doesn't need to introduce itself.
- Cut "Pending review (3)" → "Pending · 3". Two words shorter, identical meaning.
- Cut "No items matching your filters" → "Nothing here." Three words, one period.
- Cut tooltips on the J/K hotkeys ("Press J to navigate down"). Show the keystroke once on first visit (`?` cheatsheet does this); after that, the user knows.
- Cut the "Last updated 2 minutes ago" timestamp at the top. Yossi doesn't need it. If the data is stale, the breath-pulse on the topbar asterisk surfaces it.

### When restraint loses
The zero-state hand-drawn illustration. Designer 1 wins this one. A small 96×96 sketch of an empty desk drawer or a checkmark is the warm moment Yossi sees once a week and remembers. It's the kind of micro-craft that makes the product feel made-by-humans. I concede.

---

## /workspace

### The discipline move (the headline restraint)
**The agent execution viewer is one screen, no chrome, no breadcrumbs, no second pane, no related-content suggestions.** Vertical step list down the left edge, streaming output in the center, that's the entire surface. The courier-flow animation between steps IS the page's distinctive move (already approved). Adding anything else competes with the run.

The discipline: **/workspace exists to be watched.** It is the rarest page in the product (transient — only when an agent is mid-run). It must not try to be useful when nothing is running. When idle, the page is a single calm line: "No agent running. Start one from /home or /inbox." That line links back to the work pages. The page does not "fill its empty state with content."

### What animation does NOT belong here
- **NO skeleton-draw on entrance.** The courier flow IS the animation; the page chrome should be invisible around it.
- **NO confetti or celebration on agent completion.** When an agent finishes, the run row collapses to a single status line: "Done. 2m 14s. View output →". Quiet. Restrained. That's how billion-dollar products end runs.
- **NO loading spinners.** The streaming output IS the proof of progress. Adding a spinner duplicates the signal.
- **NO progress bar in the top of the viewer.** The vertical step list with check-marks IS the progress indicator. Adding a bar duplicates it.
- **NO animated character / mascot watching the run.** Beamie was deliberately deferred (per DECISIONS-CAPTURED). Putting a sketch character on /workspace would un-defer the decision through the back door.

### Where Designer 1 will be wrong
Designer 1 will propose "live streaming of agent thought process with hand-drawn thinking-asterisk pulses next to each line" — basically Claude.ai's ASCII spinner family transplanted to /workspace. That breaks the Anthropic Console discipline I'm citing. Anthropic deliberately keeps the hand-drawn idiom OUT of Console (the work surface) and IN Claude.ai (the conversational surface). The reason: Console is where engineers do work; Claude.ai is where users have a conversation. Beamix /workspace = work surface, like Console. The hand-drawn lives on /home empty state and on /scan public reveal. Not here.

Designer 1 will also propose "what if the courier card shows the agent's persona avatar that the user customized in /crew?" NO. The agent's persona is set in /crew settings (per the locked spec). On /workspace, the agent identity is its name + monochrome icon. No avatar. No persona character. The work is what's on the page; the persona is the agent's *brand*, not its appearance during execution.

### What's the smallest possible page that still works?
Vertical step list + streaming output. That's it. No top toolbar. No breadcrumb. No "View related runs" sidebar. The page does ONE thing: show what the agent is doing right now. When done, it shows what it did. Done. The discipline of "/workspace is single-purpose" is the discipline that makes /scans and /home feel like multi-purpose surfaces by contrast.

### Where the page borrows from existing patterns (and that's correct)
- **Linear's "issue detail full screen"** — single column, full attention.
- **Vercel Build Logs** — streaming output rendered as monospace, no chrome.
- **GitHub Actions run page** — vertical step list with collapse/expand on each step.
- **Claude Code's run-output pane** — calm, monospace, no decoration.

The fact that all four references look similar is not a bug. It's a sign that the right pattern exists and the discipline is to use it.

### Microcopy: what to remove
- Cut "Agent is running..." header. The streaming output IS the proof.
- Cut "Run #4729 of 9847" run-counter. Yossi doesn't need it; Sarah doesn't either.
- Cut "Estimated time remaining: 1m 23s" — almost always wrong, undermines trust when wrong, and competes with the actual progress indicator.
- Cut "Tip: you can leave this page and the agent will keep running" hint. Show it ONCE on the first /workspace visit (per locked once-only flag pattern); after that, never.

### When restraint loses
The courier-flow animation between steps. Designer 1 deserves credit for that being a Beamix-distinctive primitive. I concede; it's earned because /workspace is the page where the agent's "work" is the entire content, and a unique transition between steps IS the work-feel. But the courier flow stays at 200ms, single-direction, no overshoot. Restrained inside its own distinctive move.

---

## /scans

### The discipline move (the headline restraint)
**/scans is a data-density surface for Yossi. It looks like a table. Tables are correct here. We do not prettify the table.**

Yossi opens /scans daily. He's looking for one of three things: which scan to look at, which engine result to drill into, which query to inspect. A table sorted by date with chips for engine + score delta is the right answer. Each row is 44px tall (Linear refresh value, NOT the 56-64px "premium spacing" Designer 1 will push for). Tabular numerals on date/score columns. Hover state lightens row background. Click → scan detail. That's the page.

The Completed Items tab and Per-Engine tab use the same table grammar with different column sets. The discipline: **same table, different columns.** Not "Completed Items has a card grid because variety" or "Per-Engine has bar charts because contrast." The grammar repeats; the data shifts. That's how you build a system instead of three pages.

### What animation does NOT belong here
- **NO skeleton-draw on entrance.** Animation strategy already locked NO. Holds firm — Yossi's daily page cannot have a 1.4s entrance.
- **NO row-by-row staggered fade-in.** The table appears.
- **NO chart inside the table rows.** Designer 1 will propose "tiny sparkline thumbnails next to each scan row showing score-over-time for that scan." Tempting. Wrong. Each scan is a point-in-time; "score over time for one scan" is meaningless. The sparkline lives on /home (cross-scan trend) and inside the per-scan detail (per-engine sub-trend). On the table list, no sparkline.
- **NO color-coded row backgrounds based on score.** Severity coloring whole rows = noise. Score chips per row = signal. Stay disciplined.

### Where Designer 1 will be wrong
Designer 1 will propose a "mini hero" at the top of /scans showing the most recent scan's score in /home-hero style — same 64-72px InterDisplay number, same Fraunces diagnosis line. NO. /home is /home; /scans is /scans. The page anchors are different. /scans should open with the section label "ALL SCANS" + a filter row + the table. No hero. No re-hero. The discipline of "each page has one identity, not three" is what stops the product feeling like a series of /home variants.

Designer 1 will also propose "hover the scan row to preview the scan detail in a side drawer" — Stripe-like preview pane. Tempting. But Yossi's mental model is "click row → scan detail page" (Linear pattern). Adding a hover-preview drawer adds two states (hover, click) for one action. Pick one. The Linear pattern wins because Yossi's flow is consistent: row click = navigate, never preview. Removing the preview drawer is an act of discipline that feels like loss until you ship without it and realize the page got faster.

### What's the smallest possible page that still works?
Tabs (All / Completed / Per-Engine) + filter row + table. No hero. No callout. No "tip of the day." No "saved views" until usage demands it (Mercury Data Views pattern is right but earned by 6 months of user data, not at v1). The minimum here is exactly the right answer for v1.

### Where the page borrows from existing patterns (and that's correct)
- **Mercury Transactions** — table-as-the-page, filter chips above, breathing chart only on summary surfaces (not on /scans, only on /home).
- **Linear Issues view** — 44px row height, J/K nav optional, click-to-detail.
- **Stripe Payments index** — sortable columns, status pill per row, hover lighten.
- **Anthropic Console Usage table** — drill-down through table, same grammar at every depth.

### Microcopy: what to remove
- Cut "Showing 1-25 of 247 scans" → "247 scans" (or footer "247 · Load more"). 
- Cut "Sort by:" label before the sort dropdown — make the dropdown self-evident.
- Cut "Filters" header above the filter row. The chips speak for themselves.
- Cut "No scans yet" → "No scans." Two words. The CTA below ("Run your first scan") is the verb.
- Cut date format "April 25, 2026 at 9:42am EDT" → "Apr 25 · 09:42". Tabular nums make this dense and readable.

### When restraint loses
Designer 1 actually has a point on per-scan detail (the click-into-row destination). The scan detail page DOES deserve a small score-gauge animation + per-engine path-draw. I concede; that's the second-most-important data view in the product (after /home) and a calm version of the /home hero treatment is correct. But the LIST page (the /scans top-level) stays a table.

---

## /competitors

### The discipline move (the headline restraint)
**Competitor intelligence is clinical, not editorial.** This page surfaces "ChatGPT cites your competitor 8× more often than you" and "your top 5 competitors by share-of-mention." It is a comparison surface. The treatment is a horizontal bar chart with labeled rows + a small per-competitor score chip + a delta. **No editorial copy. No "your nemesis" framing. No competitor logos in cards.** Just the data.

The pattern reference is **Stripe's "Plans comparison" table** + **Anthropic Console's per-model usage breakdown**. Both are clinical. Both are devastating in their factuality. Beamix /competitors should feel exactly that way: a piece of evidence, not a story.

### What animation does NOT belong here
- **NO skeleton-draw on entrance.** Locked NO.
- **NO bar-fill animation on every visit.** First visit only? Even that's debatable. I'd argue NO bar-fill at all on /competitors — the bars render at full length instantly. Reason: Yossi opens this page daily; if the bars animate every visit, it's tax. If they animate first-visit-only, the localStorage-flag complexity isn't worth one moment of motion. Just render the data.
- **NO hand-drawn elements.** This page has the smallest hand-drawn footprint of any page. Even the empty state is a one-line text "No competitors yet — add some →" link. NO illustration here. The illustration budget is reserved for /home, /inbox zero, /scans first-visit, /crew empty, /scan public — five total per Adam's lock. /competitors does NOT make the cut.
- **NO competitor logos as decoration.** Logos are pulled live from Clearbit Logo API as 16×16 monochrome variants when available, and a single-letter monogram chip when not. They are functional identifiers, not branding flourishes.

### Where Designer 1 will be wrong
Designer 1 will propose a "competitive head-to-head visualization" — radar chart, dual-spider chart, side-by-side battle card, etc. Every variant of "make competitors visually dramatic." NO. Bar charts are correct because share-of-mention is a single-axis comparison. A radar chart implies multi-dimensional comparison that Beamix isn't doing yet. A spider chart with 5 axes (mentions/citations/sentiment/queries/positions) would be inventing complexity to avoid the boring-but-correct horizontal bar.

Designer 1 will also propose "competitor profile cards with a 1-line tagline + a sentiment color." NO. Beamix doesn't have judgment-data on competitors yet. Surfacing a green/yellow/red color implies an analytical claim the product isn't making. The discipline is to surface the data we have and trust the user to interpret it.

### What's the smallest possible page that still works?
- A header row: "Competitors · 5"
- A horizontal bar chart of share-of-mention by competitor (one bar per competitor)
- A small filter row (date range, engine subset)
- A table below with: competitor name + monogram + share-of-mention % + delta + click-to-detail
- That's it.

That minimum IS the page. Adding "competitive moves to consider" or "predicted ranking change" or "competitor news feed" would be inventing scope.

### Where the page borrows from existing patterns (and that's correct)
- **Stripe pricing comparison table** — clinical, factual, zero-decoration.
- **Anthropic Console model breakdown** — horizontal bars, click to drill.
- **Linear's "Triage by team"** stacked-bar pattern — cousin grammar.
- **PostHog funnel comparison** — competitor X conversion, you Y conversion, on the same chart.

Stealing all four is correct. Inventing a fifth is decoration.

### Microcopy: what to remove
- Cut "Your competitive landscape" header → "Competitors". Single word.
- Cut tagline copy under each competitor name (Designer 1 will want this).
- Cut "Click to explore" CTAs on each row — the row IS the affordance.
- Cut "Add to watchlist" button — Yossi watches all competitors he added; there's no "extra-watch" tier. Remove the affordance.
- Cut the date "Last updated 12 minutes ago" — staleness is signaled by the topbar asterisk pulse if it matters.

### When restraint loses
The empty state on /competitors gets ONE concession. When Yossi has zero competitors added, the page shows a single calm sentence + a CTA: "Add a competitor to start tracking. Try `chatgpt.com` or your top organic search rival." The example URL IS the warmth. No illustration. Designer 1 wanted a hand-drawn binoculars sketch; I won't concede that one. But the example-URL move is a tiny hospitable gesture I respect.

---

## /crew

### The discipline move (the headline restraint)
**The 11-agent roster is shown as a 3-column grid of plain rows. Not 11 cards-with-illustrations. Not 11 distinct mascot-faces.** Each row is: agent name + 14×14 monochrome icon + 1-line role description in muted body type + last-run timestamp + status chip (idle / running / paused). Click row → agent detail page with settings.

The "meet the team" moment is the **first-visit skeleton-draw entrance** (already locked, localStorage-flagged, once-ever per device). On that first visit, the rows draw in vertically with the names appearing letter-by-letter at 30ms-per-character. That's the moment. After that, the page is a calm list of 11 agents that renders instantly.

Restraint here is the move because **agents-as-people is a metaphor**, not the product. The product is "AI does work for you." Treating each agent as a fully-illustrated character with a backstory invites the AI-mascot trap (every AI startup with a smiling robot avatar). Beamix's discipline is **agents-as-roles, not agents-as-mascots.**

### What animation does NOT belong here
- **NO ongoing per-row animations after first visit.** The breath-pulse on the topbar asterisk indicates active runs; per-row pulses on /crew would duplicate the signal.
- **NO hover-tilt on agent rows.** They're rows, not portrait cards. Hover lightens background. That's it.
- **NO "agent is thinking" animations on rows where status = running.** The status chip text says "Running"; the topbar asterisk breathes. No third indicator.
- **NO per-agent intro animation on click.** The agent detail page renders instantly — same as every other Tier 3 daily page.

### Where Designer 1 will be wrong
Designer 1 will fight HARDEST on this page. The case will be: "/crew is the meet-the-team moment. Each agent should have a hand-drawn portrait, a personality color, a typographic flourish on their name, an unmissable signature animation." This is the AI-mascot trap, dressed up as design ambition. The reason it's wrong:
1. **11 mascots = 11 characters competing for attention.** No premium product has 11 distinct mascots. Apple has Siri (1). Anthropic has Claude (1). Even Granola has 0 mascots (the hand-drawn logo is the brand, not a character).
2. **Mascots age faster than typography.** A hand-drawn "FAQ Agent" character will look dated in 18 months. The plain row will look like Linear in 2026 forever.
3. **Mascots break /workspace cohesion.** If /crew shows "FAQ Agent" as an illustrated character, /workspace either shows that same character (mascot creep) or doesn't (inconsistency). Both lose. Better: no mascot anywhere.
4. **The first-visit moment IS already locked.** That single moment of skeleton-draw entrance + name-typewriter is the meet-the-team gesture. It earns the restraint of every subsequent visit.

Designer 1 will also propose "per-agent color theme" — FAQ Agent is teal, Citation Fixer is amber, Schema Doctor is plum. NO. The single brand blue #3370FF is the product's accent. Per-agent colors fragment the palette into 11 micro-brands. The discipline of Mercury (one accent) and Things 3 (one blue) is what makes their products feel premium. Beamix /crew uses the same #3370FF on every status chip. The agents are differentiated by name + role + 14×14 icon, not by color.

### What's the smallest possible page that still works?
- Top: section label "CREW · 11"
- Filter row: "All / Active / Paused"
- 3-column grid of plain agent rows (or single-column on mobile)
- Each row: name + icon + 1-line role + last-run timestamp + status chip
- Click → agent detail
- That's it.

The minimum is right. Adding "agent leaderboard" (which agent ran most this month?) or "agent insights" (your FAQ Agent has fixed 47 issues!) is scope creep. Those features earn their existence after 6 months of usage data.

### Where the page borrows from existing patterns (and that's correct)
- **Linear team list** — plain rows, dim chrome, click-to-detail.
- **Notion connections list** — minimal status indicator + name + role.
- **GitHub Actions list of workflows** — table of named runners.
- **Claude.ai's "Projects" view** — calm card grid, no per-project mascots.

Inventing a 5th pattern here = guaranteed AI-template look.

### Microcopy: what to remove
- Cut "Meet your crew" header → "Crew · 11".
- Cut per-agent tagline copy. Role description (1 line) is enough.
- Cut "Status: Running" → status chip text alone says "Running".
- Cut "Last run: 14 minutes ago" → "14m ago" tabular.
- Cut "Powered by Claude / GPT-4 / etc" attribution on each row. That's a /settings detail.

### When restraint loses
The first-visit-only entrance animation IS the concession. Designer 1 wins it; the meet-the-team moment is real and once-ever. I locked it in the animation strategy already. Beyond that, no concession — the page stays a calm list.

---

## /schedules

### The discipline move (the headline restraint)
**Cron configuration is admin work. Admin work is calm. /schedules looks like /settings looks like /schedules — and that's correct.**

Yossi visits /schedules weekly to confirm scans are scheduled and auto-fix configs are set. He doesn't need a "premium scheduling experience." He needs:
- A list of scheduled scans (one per domain) with: domain + frequency + next run time + on/off toggle
- A list of auto-fix configs with: agent type + trigger condition + on/off toggle
- An "Add schedule" button
- That's the page.

The discipline: **never pretty up admin.** Stripe's /webhooks page is a list of webhooks. Linear's /integrations page is a list of integrations. Neither has illustrations, gradient cards, or "schedule visualizations." They're tables of admin records, and that calm consistency IS the brand promise: "we ship serious software."

### What animation does NOT belong here
- **NO skeleton-draw on entrance.** Locked NO.
- **NO calendar-grid visualization of scheduled scans across the week.** Designer 1 will want this. NO. A list with "next run in 6h 14m" is enough. A calendar grid is decoration that adds no information density.
- **NO countdown timer animation on "next run" timestamps.** Counting down by the second is anxiety theater. Show the relative time ("in 6h") and let it update on page navigation, not in a live ticker.
- **NO hand-drawn cron-row sketches.** Designer 1 will propose this with the framing "make admin warm." Admin is not warm. Admin is correct. The warmth lives elsewhere.

### Where Designer 1 will be wrong
Designer 1 will propose a "schedule timeline visualization" — a horizontal time axis with markers for upcoming scan times. Pretty in screenshots. Useless in practice. Yossi doesn't need to see "scans land at 9am, 12pm, 4pm in a beautiful Gantt." He needs to know "scan for client-12 runs Tuesday at 9am." The list IS the right form factor.

Designer 1 will also propose styling the cron-frequency dropdown as a "natural language editor" — "every Tuesday at 9am" parsed into chips. Mercury / Linear use plain `<select>` elements for frequency. The discipline is to use the boring control because it's reliable. The natural-language parser is a 2027 feature, not a v1 distinctive move.

### What's the smallest possible page that still works?
- Section label "SCHEDULES"
- Tab: "Scans / Auto-fixes"
- Table of records (domain + frequency + next run + toggle)
- "+ Add" button (small, secondary, top-right)
- Click row → edit modal

That's it. The minimum is the answer.

### Where the page borrows from existing patterns (and that's correct)
- **Stripe webhooks list** — the canonical "admin records as a table" reference.
- **Linear automations** — calm rows, status pill, click-to-edit.
- **Vercel Cron Jobs** — list, frequency, last run, status.
- **GitHub Actions schedules** — table grammar identical.

Four mature references all using the table pattern. Inventing a calendar-Gantt for /schedules is the move that says "we don't trust the boring solution."

### Microcopy: what to remove
- Cut "Schedule your scans here" intro paragraph. The page title is the intro.
- Cut "Tip: set scans to run weekly for best results." If a tip is needed, put it ONCE in onboarding. Not on every /schedules visit.
- Cut "Frequency: every 7 days" → "Weekly". One word does the work.
- Cut "Status: Active" status chip → just an on/off toggle without a redundant label.

### When restraint loses
None. /schedules has zero distinctive-move concessions. This is the page where I plant the flag hardest. If Designer 1 adds a single hand-drawn flourish here, the discipline of "admin is calm" breaks across the whole product. Hold the line.

---

## /settings

### The discipline move (the headline restraint)
**Don't decorate the boring page. That IS the discipline.**

5 tabs: Profile / Billing / Language / Domains / Notifications. Each tab is a vertical form. Each form uses Shadcn-style input controls at billion-dollar fidelity (Linear-tight spacing, Stripe-careful tabular nums on the billing tab). NO illustrations. NO gradient backgrounds. NO premium-photo-on-Profile-tab-header. NO "Upgrade your plan" upsell card on the Billing tab. The page looks like a high-end form. That's the entire move.

The reference is **Stripe Dashboard > Settings**. Open it; the tabs are calm; the forms are tight; nothing decorates anything. If Beamix /settings looks like a less-restrained version of Stripe /settings, it has failed. If it looks like a more-restrained version of any other competitor's /settings, it has succeeded.

### What animation does NOT belong here
- **NO skeleton-draw on entrance.** Locked NO. /settings is the canonical "render instantly" page.
- **NO save-confirmation toast** with a check-mark animation. A toast that says "Saved." in 200ms-fade-in fade-out at 1.5s. No celebration animation, no green-fill on the saved field, no inline "Saved 2s ago" indicator that lingers.
- **NO tab-switch animation.** Click a tab, content swaps instantly. NOT a slide transition.
- **NO hand-drawn elements anywhere.** Including empty states (e.g., "No connected domains yet"). The empty state is a single text line + CTA link. No illustration.
- **NO billing-plan-card animations.** Designer 1 will want the active plan card to glow / pulse / shimmer. NO. The active plan is indicated by a 1px brand-blue border + "Current" pill. That's it.

### Where Designer 1 will be wrong
Designer 1 will fight on the Billing tab specifically. The argument: "Billing is the page where users decide to upgrade. Make it gorgeous. Make it sell." NO. Billing is admin. Users upgrade because the product earned it elsewhere (the score they see, the fixes they ran, the value they got). A gorgeous billing page is a tell that the product elsewhere isn't earning the upgrade. **The discipline is to make billing so calm it bores them into trusting it.** Mercury's billing summary is calm. Stripe's invoice page is calm. They sell trillions of dollars of trust through restraint.

Designer 1 will also propose a "language picker as a beautifully designed flag-card-grid." Beamix supports HE + EN at v1. Two languages. A `<select>` is correct. A flag grid is decoration disguised as design. The Language tab is two radio buttons + a save button. Done.

Designer 1 will also propose styling the Notifications tab as "delight-toggles" — animated switches with custom haptic-feel transitions. NO. Standard Shadcn switch component, 200ms toggle, that's it. The decision-fatigue on Notifications is high; the user wants to set it and leave. Calm controls reduce abandonment.

### What's the smallest possible page that still works?
- 5 tabs across the top
- Each tab is a vertical form (label / control / help text triplet, repeating)
- Save buttons live next to each section, not at the bottom of the page
- That's it.

The minimum is exactly the right answer. /settings is the page where Designer 1's instinct is most expensive and most wrong.

### Where the page borrows from existing patterns (and that's correct)
- **Stripe Dashboard > Settings** — the canonical reference, copy verbatim.
- **Linear /settings** — calm tabs, tight forms, no decoration.
- **Vercel /settings** — minimal, instant, boring (correct).
- **Notion /settings** — same.

The fact that all four reference products' settings pages look interchangeable is THE signal that "settings should look like settings" is the right discipline.

### Microcopy: what to remove
- Cut "Manage your account here." intro on Profile tab. The label "Profile" is enough.
- Cut "Choose your preferred language" → "Language". (Tab name doubles as form label.)
- Cut "Email notifications" + "Push notifications" + "In-app notifications" → just one column: "Notifications" with sub-rows for each channel.
- Cut "Plan: Build" + "Status: Active" + "Renews on May 23" → tabular row "Build · Active · Renews May 23".
- Cut "Have questions? Contact support →" link in the footer of every tab. Put it ONCE in the global help affordance (`?` cheatsheet). Repeating it 5× is admin clutter.

### When restraint loses
None. /settings is the second flag-plant page. Hold every line. If you concede a single distinctive flourish here, the discipline collapses everywhere because /settings becomes the precedent ("Designer 1 won here, why not on /schedules?"). NO. Hold all lines.

---

## /scan (public, dramatic)

### The discipline move (the headline restraint)
**The 15-17s First Scan Reveal is locked and correct. The discipline move is to NOT overrun it with additional flourish.**

This is the only page where Designer 1's distinctive-move-per-section reflex is mostly correct. /scan is the acquisition surface; the customer is converting from prospect to user; the dramatic theater EARNS its existence here. So I'm not arguing against the reveal. I'm arguing against the over-correction where every step of the reveal gets a new distinctive Beamix-only animation.

The reveal already has:
- Score Gauge Fill (count-up)
- Path-Draw on per-engine sparklines
- Hand-drawn empty state for engines with no data
- Pill button spring-overshoot on the final CTA

Those four are the entire motion vocabulary. Designer 1 will propose a fifth, sixth, seventh. NO. The locked four ARE the page's animation budget. Adding a confetti burst on the final score reveal, a cinematic camera pan on the engine grid, or a typewriter-effect on the diagnosis line would push the page from "premium product reveal" to "carnival." The discipline is to use the same motion vocabulary as /home and /scans-detail — the user is recognizing the brand language across pages, not seeing a fresh trick on each page.

### What animation does NOT belong here
- **NO confetti or particle burst on score reveal.** The score appears via count-up; that IS the reveal moment. Adding confetti dilutes it.
- **NO sound effects.** Anti-pattern lock confirmed. Sound = cheap.
- **NO video-style camera pan across the engine grid.** Static reveal with sequential pop-ins. CSS only. No "cinematic" camera moves.
- **NO additional hand-drawn elements beyond the locked 5.** /scan gets ONE hand-drawn moment (the engine-empty-state placeholder). Not three.
- **NO progress bar showing "scanning ChatGPT... scanning Gemini..."** The sequential reveal IS the progress indicator.

### Where Designer 1 will be wrong
Designer 1 will propose adding a "personality reveal" at the end — "we noticed your business is in the dental-services category, and Tel Aviv businesses with similar profiles tend to score X" with a hand-drawn neighborhood sketch. NO. The /scan reveal stays as: hero score → per-engine grid → diagnosis → CTA. Adding "personality copy" at the end stretches the 17s budget into 25s and tests the user's patience right when they should be hitting the conversion CTA.

Designer 1 will also propose making each per-engine pill animate differently ("ChatGPT swooshes in from the right, Perplexity fades from below, Gemini pops with overshoot"). NO. All 9 engine pills use the SAME entrance animation, staggered 25ms each (already locked). Differentiated motion = inconsistent grammar. The discipline of "every engine pill is identical mechanically and differs only in name" is what makes the grid feel like a system.

### What's the smallest possible page that still works?
The locked storyboard IS the minimum. If anything, I'd argue for SHORTENING the reveal from 15-17s to 12-14s — the conversion moment hits faster, and the user remembers the speed more than they remember the theater. But Adam locked the storyboard, so I'm not re-litigating timing. I'm just saying: if cuts must be made, cut from the middle (engine-pill stagger from 800ms to 600ms), not from the bookends (hero count-up + final CTA spring).

### Where the page borrows from existing patterns (and that's correct)
- **Speedtest count-up gauge** — the canonical reveal pattern, locked anchor.
- **Stripe Atlas welcome screen** — clinical-but-warm copy, restrained motion.
- **Vercel deployment success screen** — calm celebration with minimal flourish.
- **Anthropic Claude.ai first-message animation** — quiet authority on entrance.

The four references all share "reveal as proof-of-work, not as theater." Beamix /scan inherits that DNA.

### Microcopy: what to remove
- Cut "We're scanning the world's biggest AI engines for your business..." preamble. Show the scan. Don't narrate the scan.
- Cut "Hold tight while we work our magic." Magic = AI-slop tell.
- Cut the pre-reveal quote/testimonial. The reveal IS the proof; testimonials dilute it.
- Cut "Powered by [LLM partner names]" attribution at the bottom. That's a /settings or /trust-center detail.

### When restraint loses
Designer 1 wins on the existence of the reveal itself. The 15-17s theater IS Beamix-distinctive (Speedtest is the closest cousin, but no SaaS dashboard does this). I concede; this is the page where investment in motion pays back at the conversion event. But the restraint move is to keep the vocabulary tight (4 animation types) and resist adding a 5th.

---

## /onboarding

### The discipline move (the headline restraint)
**4 steps. Each step is one screen. Each screen is one decision. No progress-bar visualization, no celebration on each step, no introductory tour overlay, no "tip" sidebar.**

The reference is **Linear's onboarding** (calm, fast, gone in 90 seconds) and **Granola's onboarding** (single-purpose, single-decision per screen). The discipline: **onboarding is friction we choose to introduce; minimize the friction.** Every animated micro-flourish on a step is friction. The user wants to be done with onboarding and start using the product.

Animation strategy already locked "light flourishes per step, ≤500ms each, never page-grade theater." That's the right ceiling. My discipline move: stay UNDER that ceiling on most steps. Step 1 (business profile form) = no flourish. Step 2 (language) = no flourish. Step 3 (first agent) = small spring-overshoot on the chosen agent's card. Step 4 (credits / first scan trigger) = small spring on CTA. That's the entire motion budget.

### What animation does NOT belong here
- **NO skeleton-draw entrance on each step.** The animation strategy says "light flourishes per step" — that's per-step content fade-in (200ms), NOT skeleton-draw outline.
- **NO celebration animation between steps.** Click "Continue" → next step appears. No "Step 2 complete!" toast. No checkmark fanfare. The user knows they advanced because the screen changed.
- **NO progress-bar growing animation.** Step indicator (2 of 4) is text. NOT a percentage bar.
- **NO confetti at the end of step 4.** The final action ("Run my first scan") leads into /scan reveal — THAT is the celebration. Adding confetti before it dilutes the actual moment.
- **NO "welcome video" or animated tutorial on step 1.** Designer 1 will want this. NO. Onboarding is decision-collection, not product-introduction.

### Where Designer 1 will be wrong
Designer 1 will propose "make each step feel like opening a present" — a slide-in transition with a subtle color shift between screens. NO. The transition is instant. Reason: a 400ms slide-transition × 4 steps = 1.6s of cumulative wait that the user doesn't owe Beamix. Faster onboarding = higher activation rate. Every product team that A/B tests this finds the same result.

Designer 1 will also propose "step 4 shows a hand-drawn illustration of the agents getting ready to work." NO. Step 4 is "Confirm your first scan and we'll start." It's a confirmation screen. A confirmation screen with a hand-drawn illustration is a confirmation screen with decoration. The user clicks "Run scan" and the /scan reveal begins. That sequence is taut.

### What's the smallest possible page that still works?
- Step 1: business profile (name, URL, industry) — one form, "Continue" button
- Step 2: language preference (HE / EN) — one radio group, "Continue" button
- Step 3: pick first agent (FAQ / Citation / Schema / etc) — one card grid, "Continue" button
- Step 4: confirm + first scan trigger — one summary, "Run my first scan" button

That's it. 4 screens, 4 decisions, ~90s total time to first scan. The minimum IS the right product.

### Where the page borrows from existing patterns (and that's correct)
- **Linear onboarding** — fast, 4-step, no theater.
- **Granola onboarding** — single-decision-per-screen, calm.
- **Stripe Atlas signup** — clinical and trust-building through restraint.
- **Notion onboarding (post-2023)** — single column, calm transitions.

### Microcopy: what to remove
- Cut "Welcome to Beamix! Let's get you set up." → "Let's set up your business." One sentence less.
- Cut step labels "Step 1 of 4 — Business Profile" → "1 of 4 · Business". Tabular. Tight.
- Cut "Why we ask for this" expandable disclosure on each form field. If a field needs an explanation, it doesn't belong in onboarding.
- Cut "Your data is encrypted and never shared" trust-line on each step. Put it ONCE on step 1 footer (or zero times — the privacy policy link in the footer is enough for users who care).
- Cut "Skip for now" links. If a step is skippable, don't ask. If it's required, no skip option.

### When restraint loses
The spring-overshoot on the chosen-agent card in step 3 is the one distinctive moment Designer 1 deserves. It's the one place where the product's playfulness should peek through during onboarding — the user is making their first PRODUCT decision (which agent to run), and a 400ms spring on the chosen card signals "yes, you chose, and the product is glad you did." I concede; that's the right one moment. Beyond it, hold all lines.

---

## /reports

### The discipline move (the headline restraint)
**/reports is a clinical export tool, not an editorial deliverable.** Yossi (Scale-tier, $499) opens this page to generate a white-label PDF/CSV for a client. The page is: domain selector + date range + format toggle (PDF / CSV) + "Generate report" CTA. After generation: download link. After download: nothing.

The discipline: **/reports is a transaction surface, not a destination.** Yossi doesn't browse /reports. He arrives, generates, leaves. The page should reflect that. NO illustrations. NO "report preview thumbnails." NO "recent reports gallery" with cover-page images. The page is a form.

The output PDF is where Designer 1's editorial instincts ARE correct (the cover page, typography, chart treatment in the PDF can absolutely be Stripe-Press level). But the /reports page that GENERATES the PDF should be a calm form. Don't confuse the tool surface with the artifact surface.

### What animation does NOT belong here
- **NO skeleton-draw entrance on first visit.** Locked NO (per animation strategy: /reports first-visit only, once per account, localStorage-flagged). Wait — actually the animation strategy DID lock first-visit-only skeleton-draw on /reports. I disagree with that lock. Let me note this honestly.

Actually rereading the animation strategy: "Yossi's 20 domains share one celebration moment, not 20." OK — the strategy is that the first-time-ever-visiting-/reports moment gets a one-time skeleton-draw. After that, instant render. Fine; the localStorage flag handles the once-only rule. I won't relitigate Adam's lock. The discipline move on subsequent visits is what matters: instant render, no animation, no "preparing your report" pre-state.

- **NO PDF generation progress animation.** When the user clicks "Generate", show a calm "Generating..." text + the topbar asterisk in running state. When done, the download link appears. No progress bar (the time isn't predictable enough), no skeleton-of-the-PDF preview during generation.
- **NO "your report is ready!" celebration toast.** A calm "Report ready · Download PDF" link. That's it.
- **NO recent-reports gallery with thumbnail previews.** A list of past reports (date / domain / format / re-download link / delete) is fine. Thumbnail previews of cover pages = decoration that costs us a screenshot-generation pipeline for zero user value.

### Where Designer 1 will be wrong
Designer 1 will propose "make /reports feel like a Stripe Press product page" — large hero, editorial typography, a hand-drawn illustration of a report being printed. NO. Two reasons:
1. The user is here to do a job. Editorial framing slows them down.
2. The user is GENERATING a Stripe-Press-quality artifact. Making the tool feel as editorial as the artifact creates a recursive loop where every layer is "premium" and nothing is workmanlike. Beamix /reports = workmanlike tool. Beamix Report PDF = editorial artifact. Distinct registers, intentionally.

Designer 1 will also propose "show a live preview of the cover page as the user changes settings (date range, domain)." Tempting. But the cover page is generated server-side from the actual data, not from a client-side preview. Adding a fake client-side preview is decoration that risks being WRONG (preview shows X, actual PDF shows Y). The discipline is to not preview what we can't actually preview accurately.

### What's the smallest possible page that still works?
- Page header: "REPORTS"
- Form: domain selector / date range / format toggle / "Generate" button
- Section: "Recent reports" (table of past reports with re-download)
- That's it.

### Where the page borrows from existing patterns (and that's correct)
- **Stripe Reports / Sigma export tool** — clinical generator + history table.
- **Mercury statement generator** — one form, one button, one download.
- **Vercel Audit Logs export** — same grammar.
- **Anthropic Console invoice download** — same.

Four references, all the same pattern. Inventing a 5th is wrong.

### Microcopy: what to remove
- Cut "Create beautiful client reports" header. The page is "Reports". The user knows what reports are.
- Cut "Pro tip: schedule recurring reports" upsell on the page. Schedule recurring reports lives in /schedules.
- Cut "Your white-label PDF includes..." feature list. Yossi already knows what's in the PDF; he's downloaded 100 of them.
- Cut date format "Generate report for the period of April 1 to April 25, 2026" → date range pickers labeled "From" / "To" with dates in tabular nums.

### When restraint loses
The PDF artifact itself. Designer 1 is correct that the PDF should look like Stripe Press. Fraunces serif on cover, careful chart typography, intentional whitespace, etc. That's editorial work that earns its place because the artifact is being SENT TO A CLIENT, not consumed by Yossi. I concede on the PDF. The page that generates the PDF stays a form.

---

## SUMMARY TABLE — The 10 pages and their headline discipline moves

| Page | Headline discipline move (1 line) |
|------|-----------------------------------|
| `/inbox` | Borrow Linear Triage 3-pane verbatim; do not invent a new triage paradigm. |
| `/workspace` | Single-purpose viewer; calm down on completion (no confetti). The courier flow IS the page. |
| `/scans` | Table is correct; do not chart-ify the list. Per-scan detail can have hero treatment, the list cannot. |
| `/competitors` | Clinical horizontal bars; no radar chart, no head-to-head theater, no per-competitor color. |
| `/crew` | 11 plain rows, not 11 mascots. Single brand color across all agents. |
| `/schedules` | Never pretty up admin. Stripe webhooks list is the reference. |
| `/settings` | Don't decorate the boring page. That IS the discipline. |
| `/scan` | Reveal storyboard locked at 4 motion types; do not add a 5th. Same vocabulary as /home. |
| `/onboarding` | 4 fast screens, instant transitions, one spring on chosen-agent in step 3. |
| `/reports` | Tool surface stays workmanlike; the generated PDF carries the editorial register. |

---

## THE 3 MOST AGGRESSIVE RESTRAINT MOVES — Where Designer 1 Will Fight Hardest

### 1. /crew = 11 plain rows, not 11 mascots
Designer 1's case: "/crew is the meet-the-team moment. Each agent should have hand-drawn portraits, personality colors, signature flourishes." This is the loudest fight because /crew is genuinely the page where personality COULD live, and Designer 1's instinct is correct that personality DOES belong in the product. My counter: personality belongs in *one* place per product, not eleven. Anthropic = Claude (one). Things 3 = Magic Plus button (one). Granola = hand-drawn logo (one). Beamix's "one place" is the deferred-but-architected Beamie character + the hand-drawn empty states (5 total) + the Fraunces-italic diagnosis line on /home. /crew gets the first-visit skeleton-draw entrance (already locked) and that is THE meet-the-team moment. No mascots. No per-agent colors. Hold the line.

### 2. /settings stays a Stripe-replica form
Designer 1's case: "Billing is the upgrade-conversion page. Make it sell. Make it gorgeous." My counter: gorgeous billing is a tell that the product elsewhere isn't earning the upgrade. Mercury's billing is calm. Stripe's invoice page is calm. They sell trillions through the discipline of "trust > flair." Beamix /settings = 5 tabs of Shadcn-tight forms with zero illustrations, zero gradient cards, zero animated plan-toggles. The whole page is a high-end form. If Designer 1 wins one decoration here, the precedent breaks across /schedules, /reports, and the rest of the admin surfaces. Hold every line.

### 3. /schedules has zero distinctive moves
Designer 1's case: "Make admin warm. Hand-drawn cron-row sketches. Calendar timeline visualization. Natural-language frequency editor." My counter: admin is not warm. Admin is correct. Stripe webhooks, Linear automations, Vercel cron jobs, GitHub Actions schedules — all four mature references use plain table grammar. Inventing a "warm /schedules" is the move that says "we don't trust the boring solution." We do trust it. The boring solution IS the right solution. Zero distinctive-move concessions on /schedules. This is the cleanest flag-plant in the document; if I lose this one, the discipline collapses everywhere.

---

## 3 PAGES WHERE DESIGNER 1 HAS THE STRONGER CASE

### 1. /scan (public reveal)
Conceded. The 15-17s First Scan Reveal IS the brand-defining theater of the product. /scan is the conversion surface where prospects become users; investment in motion pays back at the conversion event. Designer 1's instinct that this page should be loud is correct. My only counter is "stay tight on the motion vocabulary" (the 4 locked motion types), but I'm not arguing against the reveal itself. Designer 1 wins this page conceptually; I just guard the budget.

### 2. /home (sections 1, 2, 5, 7 of 8)
Conceded. The hero score block, the Top 3 Fixes action zone, the score trend chart, and the recent activity feed all benefit from Designer 1's distinctive-move-per-section approach because /home is the brand-defining surface and earns the deliberate distinctive moves. My contribution here is Section 3 (the inbox-pointer single text line) — that's already in the locked spec and is THE move I'm proudest of. Beyond that, /home is Designer 1's territory, and I cede it.

### 3. /onboarding step 3 (chosen-agent spring)
Conceded. The 400ms spring on the chosen agent's card in step 3 is the one moment of playfulness in onboarding, and it lands at the user's first product decision. Designer 1 wins the existence of that spring. I just keep it bounded (one spring, not a sequence; 400ms, not 800ms; no confetti follow-up).

---

## CLOSING

The billion-dollar feel is asymmetric calibration. /home is loud (deliberate). /settings is quiet (deliberate). /scan is theatrical (deliberate). /schedules is workmanlike (deliberate). The contrast between the four IS the brand. Linear earned its 2024 refresh quality by *removing* — less saturation, dimmer chrome, smaller icons, fewer borders. Stripe waits for data instead of showing skeletons. Mercury uses one accent color across the whole product. Anthropic restricts the hand-drawn idiom to Claude.ai and keeps it OUT of Console.

Beamix's discipline budget: 5 hand-drawn empty-state illustrations (locked), one Fraunces-italic diagnosis line per /home page, one /scan public reveal storyboard, and one (deferred) Beamie character architecture. That's the entire personality budget for the whole product. Anything beyond that = decoration disguised as design = AI-slop in a nicer outfit.

The discipline move on the 7 admin/work surfaces (/inbox, /workspace, /scans, /competitors, /crew, /schedules, /settings, /reports) is to ship them at billion-dollar fidelity through *structure, typography, spacing, calmness* — not through inventive distinctive moves. That asymmetry is what makes /home and /scan feel earned when the user encounters them.

— Designer 2 (Shipping Discipline)

---

## APPENDIX A — Cross-Page Restraint Rubric (for code-review and design-review)

This rubric is for any future design or frontend agent reviewing work on the 10 pages. Apply each row to any proposed addition. If the answer to ANY question in the "Reject if" column is yes, the addition is decoration.

| Restraint test | Apply to | Reject if |
|----------------|----------|-----------|
| Does the page have ONE primary-color usage? | All pages | More than one color competes (e.g., per-agent themes, per-engine colors) |
| Does every animation have an information purpose? | All pages | Animation is for "polish" or "warmth" with no comprehension benefit |
| Does the page render content within 200ms of route load? | Tier-3 pages (`/inbox`, `/scans`, `/competitors`, `/schedules`, `/settings`, `/crew` after first visit) | Skeleton-draw, page-grade entrance theater, or progressive section reveals |
| Is the hand-drawn budget already spent? | All pages | Page wants to add a 6th illustration beyond the locked 5 |
| Does the page have a unique distinctive move? | Admin pages (`/schedules`, `/settings`, `/reports`) | Admin page has a hand-drawn flourish, a custom chart, or editorial hero |
| Does the action-zone CTA use the locked pill spring-overshoot primitive? | All pages with primary CTAs | The CTA invents a new motion that breaks the cross-page motion vocabulary |
| Does empty-state copy fit on one line? | All pages | Multi-line empty states "explaining why the page is empty" |
| Does the page borrow whole patterns from anchor refs (Linear/Stripe/Mercury/Vercel/Anthropic)? | All admin/work pages | Page invents a new pattern when an anchor pattern fits |

The rubric is intentionally hostile to additions. The default answer to "should we add this?" is no. The defense of an addition must be evidence-based (anchor reference + comprehension benefit + budget check), not aesthetic ("it would feel more premium").

---

## APPENDIX B — The Five Hand-Drawn Slots (locked) and What's NOT in Them

Per the animation strategy lock, Beamix has 5 hand-drawn empty-state illustration slots:

| Slot | Page | Illustration |
|------|------|--------------|
| 1 | `/home` empty | Magnifying glass over square, Excalidraw-style, 96×96px, fixed seed |
| 2 | `/inbox` zero-pending | Empty desk drawer or completed-task sketch, same Rough.js style |
| 3 | `/scans` first-visit ever | Stack-of-pages or scanner-icon sketch |
| 4 | `/crew` empty (new account, agents not yet activated) | Three-figure silhouette in line-art |
| 5 | `/competitors` empty (none added yet) | Two-figure side-by-side line-art |

Designer 1 will at various points propose adding slot 6 (`/scan` public empty engine), slot 7 (`/workspace` idle state), slot 8 (`/reports` no-history state), slot 9 (`/settings` connected-domains zero state), and slot 10 (`/schedules` no-schedules state). Each of these will sound reasonable. **Each of them is decoration.**

The locked 5 slots cover:
- The 5 highest-frequency pages where empty state genuinely happens (new account experience)
- The 5 pages where a single warm gesture earns a return on the user's emotional investment
- A budget that fits inside one illustrator's commission cycle without needing 10+ sketches

Slots 6-10 fail the test on at least one of:
- The page rarely shows empty state in practice (`/scan` engines, `/workspace` idle)
- The empty state is admin context where a sketch would feel out of register (`/settings`, `/schedules`)
- A second illustration on the same page (`/reports` history empty) duplicates the warmth budget already spent on the page's first illustration

The discipline of "5 illustrations, not 10" is what keeps the warmth feeling rare instead of templated.

---

## APPENDIX C — Anti-Pattern Watchlist Specific to Designer 1's Proposals

Designer 1's overview-maximalist position generates predictable proposals. This is the watchlist for code review:

1. **"What if /home had tabs for Inbox, Activity, History, Insights, Schedule?"** — Already rejected by Adam. /home is vertical scroll, no tabs. The siblings (`/inbox`, `/scans`, `/workspace`) are SEPARATE pages, and the `/home` Section 3 single-text-line is the pointer. If a tab proposal returns, reject by reference to PAGE-LIST-LOCKED.

2. **"What if every agent had a personality color theme?"** — Reject. Single brand blue across all agents. Per-agent colors fragment the palette into 11 micro-brands.

3. **"What if /workspace showed the agent's avatar / persona during execution?"** — Reject. Beamie deferred. /workspace shows agent name + 14×14 monochrome icon. No avatars.

4. **"What if /scans rows showed sparkline thumbnails of score-over-time?"** — Reject. Each scan is a point-in-time; per-row sparkline of "this scan over time" is meaningless data. Sparklines live on /home (cross-scan trend) and inside per-scan detail (per-engine sub-trend).

5. **"What if /competitors used a radar chart or spider chart?"** — Reject. Single-axis horizontal bars are correct. Radar implies multi-dimensional comparison Beamix isn't doing yet.

6. **"What if /schedules had a Gantt-timeline visualization?"** — Reject. Plain table is correct. Gantt is decoration.

7. **"What if /settings/billing had animated plan cards?"** — Reject. Mercury and Stripe billing are calm. Beamix billing stays calm.

8. **"What if /reports showed a live preview of the cover page?"** — Reject. Server-generated PDFs can't be accurately previewed client-side.

9. **"What if /onboarding had slide transitions between steps?"** — Reject. Instant transitions. 4 × 400ms = 1.6s tax for nothing.

10. **"What if /scan reveal added a 5th motion type for the diagnosis line?"** — Reject. The 4 locked motion types ARE the budget. Adding a 5th (typewriter, glitch, etc) breaks the cross-page motion vocabulary.

When any of these proposals appear in code review, link to this section and reject with a one-line rationale. The watchlist exists because these proposals will arrive in plausible language ("what if we just...", "wouldn't it be nice if...", "users might appreciate..."). Plausibility is the wrong test. Comprehension benefit + anchor reference + budget check are the right tests.

— End of document —
