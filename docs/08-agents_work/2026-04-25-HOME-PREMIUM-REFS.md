# Premium /home Page References — What Makes "Billion-Dollar" Look Real
Date: 2026-04-25
Author: researcher (purple)
Goal: Catalog of premium SaaS dashboard /home pages with specific design moves Beamix should copy. Anti-references from competitors with merciless detail on what reads cheap.

---

## TL;DR — what this document gives you

- **5 anchor /home references** Beamix should feel like a sibling of: Stripe Dashboard, Linear (Dashboards + new chrome), Mercury Transactions, Vercel/Geist, Anthropic Console.
- **15 supporting product references** with specific moves to copy or adapt.
- **5 studio-grade portfolio references** for motion language and type pairings.
- **4 anti-references** (competitors + generic templates) with the specific moves that read "AI-slop" so Beamix avoids them.
- **12 patterns that make a /home feel "expensive"** — the cross-product synthesis.
- **8 patterns that make a /home feel "cheap"** — the don't-list.
- **Per-section treatment guide** for all 8 locked Beamix `/home` sections.
- **Charts/dataviz spec** for score gauge, trend line, per-engine strip, KPI cards.
- **Animation choreography** for first-load on /home, frame by frame.
- **Illustration philosophy** — where hand-drawn lives on /home and where it must not.

Adam's quality bar (verbatim, locked): "Real billion dollar company designed this." Source: `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_quality_bar_billion_dollar.md`. Every recommendation below is filtered through that bar.

---

## TOP 5 ANCHOR /home PAGES — Beamix /home should feel like a sibling of these

Each anchor: 1 paragraph WHY → 7-10 specific design moves to copy.

---

### Anchor 1 — Stripe Dashboard (web + iOS)

**Why this is the anchor.** Stripe Dashboard is the canonical reference for "every number is a doorway, every chart is restrained, every state is intentional." It is the only SaaS dashboard that earns the "billion-dollar feel" without ever shouting. The iPhone app's design has been publicly dissected by Brian Lovin and others; the patterns translate directly to a `/home` surface for a B2B SaaS scoring product. Stripe sets the bar for tabular numerals, sparkline restraint, KPI card spacing, and the "summary → detail → raw" navigation pattern that Beamix needs for `score → trend → per-engine drill`. Sources: [Stripe Dashboard basics](https://docs.stripe.com/dashboard/basics), [Brian Lovin — Stripe Dashboard for iOS](https://brianlovin.com/design-details/stripe-dashboard-ios), [Michaël Villar — Exploring the product design of the Stripe Dashboard for iPhone](https://medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e), [Stripe Press](https://press.stripe.com).

**Moves to copy:**

1. **KPI card row with single number + trend arrow + sparkline.** Stripe's home shows total revenue, charges, payouts, disputes — each card has one big number, a small trend indicator (up arrow, percentage), and an inline sparkline. Beamix's KPI row (Mentions / Citations / Credits / Top competitor delta) should follow the same template exactly. Source: [Stripe Help — Dashboard home page charts](https://support.stripe.com/questions/dashboard-home-page-charts-for-business-insights).

2. **Minimal label, no decoration.** Stripe writes "Revenue" not "Total Revenue for the Current Period." No gradient backgrounds, no badges, no "PRO TIP" callouts. The label is small, the number is huge. Source: Stripe Dashboard direct observation, also documented in [Brian Lovin's review](https://brianlovin.com/design-details/stripe-dashboard-ios).

3. **Tabular numerals everywhere a number lives.** Stripe uses Söhne (Klim Type Foundry) on web — a paid foundry typeface. Beamix can match the move with Inter (`font-feature-settings: 'tnum'`) or Geist Mono on tabular columns. The visual effect: vertically aligned digits feel "engineered." Source: [Sohne in action on stripe.com — Typ.io](https://typ.io/s/59wr), [Inter tabular figures default](https://madegooddesigns.com/inter-font/).

4. **6 distinct type sizes/weights as the entire scale.** The dashboard does not use 12 sizes. It uses about 6: hero number (32-48px semibold), section title (18-20px medium), label (12-13px regular caps with letter-spacing), metric value (24-32px semibold tabular), body (14-15px regular), caption (12px regular muted). Source: [Stripe Apps style guide](https://docs.stripe.com/stripe-apps/style).

5. **Cards "slide open from the side with a slight spring."** From Brian Lovin / Michaël Villar's iPhone teardown. The interaction signals manipulability without screaming. Beamix's KPI cards on hover/click can use a similar 250ms spring with a 6-8px slide. Source: [Michaël Villar — Stripe Dashboard for iPhone](https://medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e).

6. **Smart graph transitions on time-period change.** When user switches "7d → 30d → 90d" Stripe fades the old graph and scales it as the unit shifts. This is the move that signals "we care about the in-between." Source: same teardown.

7. **Data loads completely before showing UI — no spinner blink.** "Data loads completely before showing UI with no extra spinner or UI blinking." 100ms tap delay so user sees where they tapped while data resolves. Source: same teardown.

8. **Drill-down via clickable numbers.** Every number in a Stripe table is a link. Click "32 disputes" → list of 32 disputes. Beamix `/home` must apply this rule: click the score → score detail; click a citation count → citations list; click "engine: ChatGPT 73" → /scans/per-engine?engine=chatgpt.

9. **No gratuitous color.** Stripe's home is mostly white/black/grey with one purple accent and one green/red for up/down deltas. The discipline is what makes it feel expensive. Source: [Quick UI review — Stripe homepage](https://dev.to/kyleparisi/quick-ui-review-stripe-homepage-4bab).

10. **Notifications respect timezone.** Push notifications never wake a user up. This is "billion-dollar care" applied to a non-visual surface. Beamix should match: scheduled scan emails respect locale, daily digests at 9am local. Source: same teardown.

---

### Anchor 2 — Linear (Dashboards feature + the 2024-2026 chrome refresh)

**Why this is the anchor.** Linear is the only major SaaS to publish (a) an Agent Interaction Guidelines spec, (b) a dashboards feature that lives at workspace home level, and (c) two consecutive UI refreshes (March 2024 and the warmer-gray refresh after) that document what "calmer chrome, sharper content" actually means in tokens. Three reports point at Linear independently — that's the signal. Beamix's `/home` chrome (sidebar dim, header alignment, content density) should be calibrated to Linear's post-2026 refresh values exactly. Sources: [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui), [A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh), [Linear Dashboards changelog](https://linear.app/changelog/2025-07-24-dashboards), [Welcome to the new Linear](https://linear.app/changelog/2024-03-20-new-linear-ui).

**Moves to copy:**

1. **Sidebar a few notches dimmer than the main content.** Direct quote from Linear's refresh post: "Don't compete for attention you haven't earned." The main content area must take precedence. Beamix sidebar should be `~85% lightness in light mode`, `~62% lightness in dark mode` — not the same value as content. Source: [Behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh).

2. **LCH color space, not HSL.** Linear migrated to LCH because human-perceived lightness is uniform there. Beamix's design tokens should be LCH-defined so dark mode and light mode share the same perceived contrast ratios. Source: [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui).

3. **Inter Display for headings + Inter regular for body.** Linear introduced Inter Display "to add more expression to our headings while maintaining their readability" and kept regular Inter elsewhere. Beamix already loads InterDisplay (per BRAND_GUIDELINES.md v4.0) — make sure all `/home` headings and the hero score number use it explicitly with `font-feature-settings: 'cv11', 'ss03'`. Source: same.

4. **Warmer gray, not blue-gray.** The 2026 refresh moved from "cool, blue-ish hue" to "warmer gray that still feels crisp, but less saturated." Beamix should pick neutrals biased toward warm (greige) not cool (slate). Source: [Behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh).

5. **Softer borders, rounded edges, "structure should be felt not seen."** Linear's refresh: "By rounding out their edges and softening the contrast, the polished interface gives users structure on the page without cluttering their view." Beamix: card borders at `rgba(black, 0.06)` not `rgba(black, 0.12)`; corner radius 12px on cards, not 8px or 16px. Source: same.

6. **Smaller icon-only tabs, fewer-but-meaningful icons.** Linear scaled icon sizes down and removed colored team icon backgrounds. Beamix `/home` should show icons sparingly — KPI cards do NOT need icons, the number is the icon. Source: same.

7. **Linear Dashboards layout: charts + tables + single-number metrics in one grid.** The Bug & Cycle dashboard shows: graph tracking issue volume over time, categorized chart of open bugs by priority, single-metric "median triage time: 58 minutes," 90-day bug resolution chart, age distribution. Beamix `/home` follows the same grammar — score is the single-number, trend is the line, per-engine is the categorized chart. Source: [Linear Dashboards changelog](https://linear.app/changelog/2025-07-24-dashboards).

8. **Inverted-L global chrome.** Linear's chrome is the inverted-L of sidebar + header bar. Everything inside is content. Beamix mirrors this: sidebar (left) + topbar (notifications, command palette trigger, profile) → all chrome; everything below is `/home` content. Source: [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui).

9. **Frosted-glass material on mobile.** The October 2025 mobile refresh introduced "a custom frosted glass material that adds depth and contrast." Beamix mobile `/home` (when we ship it) should use the same: backdrop-filter blur on bottom nav, scroll content visible faintly through it. Source: [Mobile app redesign](https://linear.app/changelog/2025-10-16-mobile-app-redesign).

10. **Multiple paths to the same action with keystrokes shown next to labels.** Right-click menu shows the keystroke. Beamix `/home` action menus (e.g., "Run all 3 fixes") should display ⌘↵ next to the label.

---

### Anchor 3 — Mercury Transactions / Insights / IO

**Why this is the anchor.** Mercury is fintech's quietest premium dashboard — it solves the same fundamental problem Beamix does: take a stream of events (transactions / scans), put aggregate charts at the top, put a filterable detail table below, let the chart respond to filters. Mercury's Transactions page is a textbook for `/home` → `/scans` flow. Sources: [Mercury — Updated Transactions page](https://mercury.com/blog/updated-transactions-page), [Mercury Insights overview](https://support.mercury.com/hc/en-us/articles/44277089544084-Insights-page-overview), [Mercury — Bank for Startups](https://mercury.com), [Mercury Dribbble](https://dribbble.com/mercuryfi).

**Moves to copy:**

1. **Two real-time charts above the fold, then table.** Cashflow graph (current month default) + money movement breakdown (top 5 sources / outflows). Beamix `/home`: hero score block + KPI row above the fold, score trend below. Source: [Mercury — Updated Transactions](https://mercury.com/blog/updated-transactions-page).

2. **Charts respond to filters applied to the table.** The cashflow graph automatically updates based on any filters. Beamix should mirror: choose engine filter → trend chart re-projects to that engine. Source: same.

3. **Hover = daily breakdown.** "View daily changes by hovering over the graph." Beamix score-trend chart hover shows the date + score + delta vs prior day. Tooltip uses tabular nums. Source: [Mercury — Viewing cashflow data](https://support.mercury.com/hc/en-us/articles/38790547830036-Viewing-cashflow-and-transactions-data-on-your-Transactions-page).

4. **Levitating card with subtle shimmer for the hero element.** Mercury's marketing-side card has a subtle shimmer signaling premium-metallic. Beamix's hero score block can have a barely-perceptible gradient shift on the score number on first paint (1.2s, only once per session). Source: [Mercury home page card review](https://uxplanet.org/captivating-design-of-the-mercury-fintech-app-d472bc0288bb).

5. **Saved filter "Data Views."** Mercury lets users save commonly-used filters as one-click views. Beamix `/scans` should pick this up; on `/home` we don't need it but the pattern signals "the product respects your time."

6. **Spreadsheet-density table with 1-click filters.** "Filter by date, keyword, or amount in one click; advanced filters: category, merchant type, team member, GL code." Beamix `/home` activity feed should show similar 1-click filtering on hover (chip turns into a filter pill).

7. **Real-time graphs broken down by top vendor / category / account / card — front and center.** Source: same article. Beamix translates to: per-engine strip (9 pills) front and center.

---

### Anchor 4 — Vercel Dashboard + Geist Design System

**Why this is the anchor.** Vercel/Geist is the canonical reference for "developer-grade craft applied to a product surface." It is also the design system Rauno Freiberg (Staff Design Engineer at Vercel) personally maintains and the typeface (Geist Sans + Geist Mono) basement.studio designed specifically for the web. The dashboard's "project thumbnails + screenshots of latest production deployments" is an unusual move that Beamix can adapt: each scan in the activity feed could show a tiny preview of the score change as a sparkline thumbnail. Sources: [Vercel dashboard redesign](https://vercel.com/blog/dashboard-redesign), [Geist design system intro](https://vercel.com/geist/introduction), [Geist typography](https://vercel.com/geist/typography), [Vercel Design](https://vercel.com/design), [The Birth of Geist — basement.studio](https://basement.studio/post/the-birth-of-geist-a-typeface-crafted-for-the-web).

**Moves to copy:**

1. **Geist Mono for code-like and technical numbers.** Geist Mono is a monospace developer typeface; Beamix already loads it for code. Use it for engine names ("ChatGPT", "Perplexity") on the per-engine strip — gives a "technical badge" feel without needing color. Source: [Geist typography](https://vercel.com/geist/typography).

2. **Project thumbnails of latest production deployments.** The dashboard shows screenshot previews of the actual deployed page. Beamix can adopt: each row in `/home`'s recent activity feed shows a tiny sparkline thumbnail of the score change for that scan. Source: [Vercel dashboard redesign](https://vercel.com/blog/dashboard-redesign).

3. **Status in browser tab icons.** Vercel: "Deployment status (queued, building, error, ready) appears in tab icons." Beamix can match — favicon updates while a scan is running. Subtle, but billion-dollar care. Source: same.

4. **High-contrast, accessible color system.** Geist explicitly markets itself as "high contrast, accessible color system." Beamix tokens must achieve WCAG AAA on key text/score combinations and AA on chrome. Source: [Geist intro](https://vercel.com/geist/introduction).

5. **Performance is part of design.** Vercel reports: "First Meaningful Paint reduced by 1.2s through preconnection optimization, React memoization, batch updates reducing re-renders by 20%, SWR for real-time data." Beamix `/home` must hit FMP < 1.5s on 3G — perceived speed IS the brand. Source: [Vercel dashboard redesign](https://vercel.com/blog/dashboard-redesign).

6. **Production deployment + preview deployments hierarchy.** Vercel home highlights two things: live production + preview-by-team-member. Beamix `/home` mirrors: current score + 3 fixes ready (the agent equivalent of "preview"). One is the state, one is the change.

---

### Anchor 5 — Anthropic Console (admin home + usage page)

**Why this is the anchor.** Console is a dashboard for engineers who are themselves at the bleeding edge — they know what dashboards should look like, and Anthropic has chosen restraint. It is also the closest cultural sibling to Beamix's intended craft register (Claude.ai's hand-drawn idiom, deferred but architected for Beamie). The Usage page is a textbook for "click into bar chart bars for hour and minute granularity." Sources: [Console](https://console.anthropic.com), [Cost and Usage Reporting in Console](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console), [Claude Design help](https://support.claude.com/en/articles/14604416-get-started-with-claude-design).

**Moves to copy:**

1. **Bar charts that drill into hour-and-minute granularity on click.** Console's Usage page lets you click a bar → that bar expands to per-hour breakdown → click again → per-minute. Beamix score trend can do the same: click a week → that week opens a daily view inline. Source: [Cost and Usage Reporting](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console).

2. **Selectors for model / month / API key.** Console keeps filters in a thin top row. Beamix `/home` filters (timeframe, engine, audience) should live in the same single row with same restraint. Source: same.

3. **Workspace hierarchy.** Console organizes by workspace, each with own keys and collaborators. Beamix multi-domain switcher (the locked chrome element) is a direct cousin — same dropdown grammar.

4. **Settings → Organization is its own deep page; never bleeds into the home.** No CTAs on `/home` push to settings. Beamix `/home` must avoid the trap of "complete your profile" banners. Configuration lives at `/settings`, period.

5. **Hand-drawn idiom restricted to thinking states.** Claude.ai's asterisk family `· ✻ ✽ ✶ ✳ ✢` only appears during model-thinking. On `/home` (a static surface), no hand-drawn elements EXCEPT empty-state and possibly the "1 line diagnosis" copy. Source: [Kyle Martinez — Reverse-engineering Claude's ASCII spinner](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0).

---

## FULL PRODUCT LIBRARY (15 products) — `/home` deep dives

For each: URL, contents, density score, charts treatment, hierarchy, color, whitespace, typography, animations, illustrations, empty state, the one expensive move, the one load-bearing detail, verdict.

---

### 1. Stripe Dashboard

- **URL:** https://dashboard.stripe.com (private; references via [Brian Lovin teardown](https://brianlovin.com/design-details/stripe-dashboard-ios), [Michaël Villar teardown](https://medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e), [SaaSFrame screenshots](https://www.saasframe.io/examples/stripe-payments-dashboard)).
- **/home contents:** 4 KPI cards (revenue, charges, payouts, disputes) → main chart (gross volume over time with comparison to previous period) → recent activity table → quick-action shortcuts (issue refund, view balance).
- **Density:** 6/10 — generous whitespace, 4 KPIs above fold, one big chart, table.
- **Charts:** Sparklines inside KPI cards (1px line, no fill, current-period color #635BFF Stripe purple). Main chart = line chart with two series (current/previous), 1px stroke, no markers, 24px Y-axis label spacing.
- **Hierarchy:** Top-left = total revenue (largest). Eye flow: KPI row left→right, then down to chart, then down to table.
- **Color:** White/black/Stripe-purple with green/red for deltas. Maybe 2-3% gray for surfaces.
- **Whitespace:** Generous — 32px gutters between cards, 64px above main chart.
- **Typography:** Söhne (Klim Type Foundry, paid). Hero number ~32-40px semibold tabular. Labels 12-13px caps with 0.04em letter-spacing. Source: [Sohne in action — Typ.io](https://typ.io/s/59wr).
- **Animations on /home:** Cards slide in 250ms spring on first load, KPIs counter up briefly (~600ms), chart line draws left-to-right (~800ms), table rows fade in 200ms staggered 30ms. Source: [Brian Lovin teardown](https://brianlovin.com/design-details/stripe-dashboard-ios).
- **Custom illustrations:** None on home. Empty states use minimal line illustrations. Stripe Press uses photographic covers; the Dashboard does not.
- **Empty state:** New account = "Get started" card with 3 setup steps (connect bank, add team, accept first payment). No fake data, no skeleton-with-placeholder-content.
- **The ONE expensive move:** Tabular-numerals + a paid foundry typeface (Söhne) on every KPI value. The eye reads "engineered."
- **The ONE load-bearing detail:** The 100ms tap-feedback delay before opening cards. Without it, the card would open before the user sees their tap — feels janky.
- **Verdict for Beamix:** **COPY DIRECTLY** as the master template for the KPI row + main chart + activity table grammar.

---

### 2. Linear (Workspace home + Dashboards)

- **URL:** https://linear.app (private; refs: [Now feed](https://linear.app/now), [Behind the refresh](https://linear.app/now/behind-the-latest-design-refresh), [Dashboards](https://linear.app/changelog/2025-07-24-dashboards), [Linear UI Kit on Figma](https://www.figma.com/community/file/1279162640816574368/linear-ui-free-ui-kit-recreated)).
- **/home contents:** "My Issues" + "Active cycles" + recent activity. Dashboards (Enterprise) live at /dashboards as a separate surface. Workspace home is sparse on purpose.
- **Density:** 7/10 — tight, list-heavy, but breathing.
- **Charts:** Dashboards uses small line charts, single-number metrics ("median triage time: 58 minutes"), categorized stacked bars (bugs by priority).
- **Hierarchy:** Sidebar (dim) → header (filter chips) → content (max-width grid). Eye flow: top-down, left-to-right.
- **Color:** Warmer gray neutrals (post-2026 refresh). Brand purple #5E6AD2 used sparingly. Status pills (red/yellow/green) for triage state.
- **Whitespace:** Compact horizontally, generous vertically. 12px row height in tables, 24px section gaps.
- **Typography:** Inter Display for headings, Inter for body. ~13px base, ~12px metadata, ~24-30px page titles. Source: [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui).
- **Animations:** Sidebar items fade in 100ms on hover. List rows expand on hover with a 150ms ease-out. Modals slide in 200ms. The 2025 mobile refresh added frosted-glass nav blur.
- **Illustrations:** Almost none on home. Empty state has small monochrome line art.
- **Empty state:** "No issues yet — create one" with one CTA, one keyboard shortcut hint.
- **Expensive move:** The chrome dimming. Sidebar is perceptibly dimmer than content. Hard to see, impossible to unsee once you do.
- **Load-bearing detail:** LCH color space — dark mode and light mode have identical perceived contrast.
- **Verdict:** **COPY DIRECTLY** for chrome and tokens; copy ELEMENTS for charts (Linear is more sparse than Beamix needs).

---

### 3. Mercury (Transactions + Insights + IO admin)

- **URL:** https://demo.mercury.com/dashboard, [updated transactions blog](https://mercury.com/blog/updated-transactions-page).
- **/home contents:** Account balance row, cashflow chart (current month default), money-movement breakdown chart, transactions table with chips for filtering, insights tabs.
- **Density:** 7/10 — table-heavy by nature but charts breathe.
- **Charts:** Cashflow line chart (subtle area fill, single primary color, no grid), top-5 outflows as horizontal bar chart with merchant logos, insights tab has interactive dashboards.
- **Hierarchy:** Balance is the biggest element top-right. Charts mid. Table bottom. Eye flow: balance (1) → cashflow chart (2) → table (3).
- **Color:** White, dark text, single brand-blue accent, green/red for in/out.
- **Whitespace:** Card padding 24px, section gap 32px, table row 44px tall.
- **Typography:** Custom-feeling sans (Polysans family rumored). Tabular nums on amounts. ~14px base.
- **Animations:** Hover on chart shows tooltip with value + date, ~150ms fade. Table row hover lightens background ~80ms. Filter chips animate width on add/remove.
- **Illustrations:** None on dashboard. Marketing site has a "shimmer" on the metallic credit card.
- **Empty state:** "Add your first transaction" prompt with sample CSV import.
- **Expensive move:** The cashflow graph that auto-updates on filter — feels like the data is alive.
- **Load-bearing detail:** Real-time graph re-projection on filter (no spinner). If it lagged, it would feel cheap.
- **Verdict:** **COPY DIRECTLY** the chart-responds-to-filter mechanic.

---

### 4. Vercel Dashboard

- **URL:** https://vercel.com/dashboard (private; refs: [Dashboard redesign blog](https://vercel.com/blog/dashboard-redesign)).
- **/home contents:** Project grid with thumbnails of latest production deployment, "Create New" actions, recent activity, team switcher.
- **Density:** 6/10 — grid-based, breathing.
- **Charts:** Per-project sparklines for traffic/build time inside cards. Analytics dashboard (separate page) has full charts.
- **Hierarchy:** Project grid is the focal element. Header is thin chrome. Eye flow: row by row through project cards.
- **Color:** Pure white/black + Vercel-black UI. Minimal accent. Status (queued/building/error/ready) uses pill colors.
- **Whitespace:** 16px card gap, 24px card padding, 64px section margin.
- **Typography:** Geist Sans (basement.studio designed) + Geist Mono. ~14-15px base.
- **Animations:** Project card hover lifts ~2px shadow, 150ms. Skeletons during data fetch are subtle pulse, not shimmer. Browser tab favicon animates with deployment status.
- **Illustrations:** None on dashboard. Marketing has triangle/geometric Vercel motifs.
- **Empty state:** "Import your first project" with two paths (GitHub, GitLab).
- **Expensive move:** Browser tab favicon updates with deployment state. Outside the page entirely. Crazy attention to detail.
- **Load-bearing detail:** Project thumbnail = actual deployed page screenshot. Self-evidently real.
- **Verdict:** **COPY ELEMENTS** — adapt favicon-state-update for Beamix when a scan is running, adapt thumbnail-as-proof for activity feed sparklines.

---

### 5. Anthropic Console

- **URL:** https://console.anthropic.com (private; refs: [Cost and usage reporting](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console)).
- **/home contents:** API key management, workspaces, usage chart, billing summary, recent activity.
- **Density:** 5/10 — sparse.
- **Charts:** Usage bar chart (clickable bars to drill from day → hour → minute), spend line chart, pie chart for model breakdown.
- **Hierarchy:** Workspace selector top-left, usage chart center, billing summary right.
- **Color:** Anthropic-cream + black. Subdued accent. Hand-drawn idiom restricted to Claude.ai not Console.
- **Whitespace:** Generous. ~48px section gaps.
- **Typography:** Styrene B (Anthropic brand) or fallback to system. Tabular nums on usage values.
- **Animations:** Bar drill-down expands inline ~200ms. No first-load splash.
- **Illustrations:** None on Console (in contrast to Claude.ai). 
- **Empty state:** "Generate your first API key" — single CTA, no decoration.
- **Expensive move:** Click-to-drill from day → hour → minute on the bar chart. Recursive drill-down through one component is rare.
- **Load-bearing detail:** Filters live in a thin top row, never sidebar — keeps content area uncluttered.
- **Verdict:** **COPY ELEMENTS** for click-drill on Beamix score-trend chart.

---

### 6. Notion Calendar

- **URL:** https://notion.com/calendar (private; refs: [Notion Calendar help](https://www.notion.com/help/notion-calendar-apps), [calendar view docs](https://www.notion.com/help/calendars)).
- **/home contents:** Calendar grid (week or month), event detail panel right, command bar top.
- **Density:** Variable — month view is dense, week view is breathing.
- **Charts:** None — calendar is the chart.
- **Hierarchy:** Calendar grid dominates, 3-column layout (mini-cal left, main center, event panel right).
- **Color:** Per-calendar pastel pills, white surface, dark text. Notion-black accents.
- **Whitespace:** Compact within calendar cells, generous in event panel.
- **Typography:** Inter. ~13px event titles, ~11px times.
- **Animations:** Event drag has snap-to-15min increments. Hover on event slightly elevates the pill.
- **Illustrations:** None.
- **Empty state:** "Connect Google Calendar" — single CTA.
- **Expensive move:** "Buttery-but-quiet" smooth scroll between weeks; near-zero perceptible jank.
- **Load-bearing detail:** Same-second sync between desktop, mobile, web — feels like one app even though it's three.
- **Verdict:** **COPY ELEMENTS** — adapt the smooth quiet-motion register for Beamix `/home` scroll behavior.

---

### 7. Pitch (Workspace home)

- **URL:** https://pitch.com (refs: [What's New](https://pitch.com/whats-new), [Pitch dashboard guide](https://help.pitch.com/en/articles/8038180-get-to-know-your-pitch-dashboard)).
- **/home contents:** Recent presentations grid with thumbnails, template gallery, quick "create new" actions, recent activity.
- **Density:** 5/10 — generous thumbnail-driven.
- **Charts:** None on home. Analytics on per-deck pages.
- **Hierarchy:** Recent decks dominate, quick actions secondary.
- **Color:** White, dark text, vibrant accent for CTAs (purple/blue brand).
- **Whitespace:** Generous between deck thumbnails.
- **Typography:** Custom Pitch sans. ~14px base.
- **Animations:** Hover on deck thumbnail tilts slightly (~3 degree). Bursty but tasteful.
- **Illustrations:** Custom-made icons batch (announced 2024). Subtle private-deck indicator.
- **Empty state:** "Start with a template" gallery.
- **Expensive move:** Hover-tilt on thumbnails. A 3-deg rotation does enormous work for 0.2s.
- **Load-bearing detail:** Custom icon set — generic Lucide/Heroicons would have read templated.
- **Verdict:** **COPY ELEMENTS** — adapt hover-tilt for /scans card preview; do NOT use on /home (too playful for the score block).

---

### 8. Things 3 (Today screen)

- **URL:** https://culturedcode.com/things ([Things features](https://culturedcode.com/things/features/), [Wikipedia](https://en.wikipedia.org/wiki/Things_(software))).
- **/home contents:** Today list (calendar events at top, then tasks), drag-rearrange, "starred" prioritization, quick add.
- **Density:** 4/10 — extremely calm.
- **Charts:** None.
- **Hierarchy:** Calendar events first (passive context), tasks (active work), evening-tasks (deferred section).
- **Color:** Neutral with one blue accent. iOS/macOS native feel.
- **Whitespace:** Generous; row height ~36px.
- **Typography:** SF Pro / system. ~15-16px base.
- **Animations:** Magic Plus (the floating + button) bounces playfully on tap. Task completion has a subtle satisfying check-fill animation.
- **Illustrations:** None on home; the empty state shows a thoughtful "all done" message.
- **Empty state:** When all tasks are done: a celebratory message with a star — earned, not gratuitous.
- **Expensive move:** Magic Plus is a brand element that exists nowhere else. It's THE Things 3 motif.
- **Load-bearing detail:** Single brand color discipline. One blue. That's it.
- **Verdict:** **COPY ELEMENTS** — translate Magic Plus into Beamix's "Run all 3 fixes" CTA: a single, brand-distinctive interaction primitive.

---

### 9. Cron (pre-Notion-acquisition; archived)

- **URL:** Was https://cron.com — now Notion Calendar. References: [Notion Calendar evolution](https://medium.com/design-bootcamp/why-i-decided-to-design-a-new-feature-for-notion-calendar-616f672ed2ff).
- **/home contents:** Same as Notion Calendar today (Cron lineage).
- **Density:** Medium.
- **Charts:** None.
- **Hierarchy:** 3-pane (mini-cal / main / event).
- **Color:** Cron-purple gradient + white. Now subdued under Notion brand.
- **Whitespace:** Compact-but-breathing.
- **Typography:** Inter.
- **Animations:** "Buttery" was the word — under-150ms transitions everywhere.
- **Illustrations:** None.
- **Empty state:** Calendar grid + "no events today."
- **Expensive move:** Speed. Sub-150ms response on every action.
- **Load-bearing detail:** Cmd+K everywhere; even meeting links are pasteable into the bar.
- **Verdict:** **COPY ELEMENTS** — speed register is what Beamix `/home` needs to match.

---

### 10. Granola (Notes home)

- **URL:** https://granola.ai (refs: [Updates](https://www.granola.ai/updates), [A new look for Granola](https://www.granola.ai/blog/a-new-look-for-granola)).
- **/home contents:** Search bar + upcoming meetings + "Start notes" CTA + recent notes list.
- **Density:** 4/10 — extremely calm.
- **Charts:** None.
- **Hierarchy:** Upcoming meeting block top, search bar, then notes list.
- **Color:** Granola-green retained, given a "proper system" in the late-2025 redesign. White background.
- **Whitespace:** Generous.
- **Typography:** Quadrant (mechanical slab serif for display) + Melange (neutral UI sans). Pairing creates "approachable and optimistic" yet "sharp enough to feel like a serious tool." Source: [A new look for Granola](https://www.granola.ai/blog/a-new-look-for-granola).
- **Animations:** Note-open feels snappier post-Dec-2025 (flicker-fix). Pressing Esc returns to homescreen instantly.
- **Illustrations:** Logo is "hand-drawn and deliberately imperfect" — intentionally avoiding committee-designed look.
- **Empty state:** "Start your first meeting note."
- **Expensive move:** Quadrant + Melange pairing. A serif for display in a productivity app is uncommon and reads "designed."
- **Load-bearing detail:** Hand-drawn logo. Without it, Granola would look like every other meeting tool.
- **Verdict:** **COPY ELEMENTS** — adapt the calm + serif-display for Beamix's "1 line diagnosis" copy under the hero score (Fraunces serif accent, per BRAND_GUIDELINES.md v4.0).

---

### 11. Raycast (window / new tab equivalent)

- **URL:** https://raycast.com ([Manual](https://manual.raycast.com)).
- **/home contents:** Single search field + recent commands + suggestions row. Beautifully sparse.
- **Density:** 3/10 — almost nothing.
- **Charts:** None on launcher; Pro Insights has small charts.
- **Hierarchy:** Search field is the hero. Everything else supports it.
- **Color:** Dark with vibrant brand-red accent.
- **Whitespace:** Maximal.
- **Typography:** SF Pro / system. ~14px base.
- **Animations:** Window appears <100ms. Result list fades in 80ms.
- **Illustrations:** None on launcher.
- **Empty state:** Just the search field.
- **Expensive move:** Sub-100ms first paint on launcher window. The product feels like an extension of the OS.
- **Load-bearing detail:** Brand-red accent is exact and consistent everywhere.
- **Verdict:** **DO NOT COPY DIRECTLY** for /home (Beamix needs more content), but **COPY THE LAUNCH-SPEED bar** as a perceptual goal.

---

### 12. Arc Browser (new tab / startup screen)

- **URL:** https://arc.net (refs: [Arc design analysis](https://medium.com/design-bootcamp/arc-browser-rethinking-the-web-through-a-designers-lens-f3922ef2133e), [Arc home page intro](https://medium.com/@abhimanyouknow/arcs-home-page-navigating-the-nexus-f709c274b0cf)).
- **/home contents:** Search bar centered, vertically scrollable Spaces in left tab rail.
- **Density:** Variable — Spaces can be 0 or many.
- **Charts:** None.
- **Hierarchy:** Vertical tab list left, content takes the rest.
- **Color:** Per-space themed gradient backgrounds. Distinctive.
- **Whitespace:** Hero-first.
- **Typography:** SF Pro.
- **Animations:** Peek (tab preview) "inspired by everyday objects and the satisfaction of opening or closing things." Zoom-in zoom-out feel.
- **Illustrations:** Per-space themed wallpapers — playful but contained.
- **Empty state:** Search bar visible immediately.
- **Expensive move:** "Press any key to start typing" — the search bar is implicit, not explicit. This pre-emptive keyboard handling reads as care.
- **Load-bearing detail:** Vertical tab layout that preserves full tab titles regardless of count.
- **Verdict:** **COPY ELEMENTS** — Beamix Cmd+K handler can use Arc's "any keystroke triggers search" pattern.

---

### 13. PostHog Insights / Dashboard

- **URL:** https://posthog.com/dashboards (refs: [PostHog charts docs](https://posthog.com/docs/product-analytics/trends/charts), [Dashboard insights](https://posthog.com/docs/product-analytics/dashboards)).
- **/home contents:** Dashboard grid of insight cards, each with chart + headline number + filter chips.
- **Density:** 7/10 — dense by analytics convention.
- **Charts:** Trends, funnels, retention curves, lifecycle, stickiness, paths. Toggleable legend, optional data labels on series.
- **Hierarchy:** Per-card; the dashboard is a flat grid.
- **Color:** PostHog-orange + neutrals.
- **Whitespace:** Compact card padding.
- **Typography:** Inter. Counts shown bold, labels small.
- **Animations:** Refresh button has a "sparkle" icon that triggers AI-analysis comparison of before/after.
- **Illustrations:** Their "Max" mascot on toolbar/help only — never on home.
- **Empty state:** Pre-built dashboard templates.
- **Expensive move:** AI-analysis on refresh comparing snapshot before/after. Outsized utility for one button.
- **Load-bearing detail:** Toggleable legend / data labels per chart — power users get density, others get clarity.
- **Verdict:** **COPY ELEMENTS** — Beamix can add an optional "analyze changes" sparkle to the score-trend chart (Build/Scale tier).

---

### 14. Attio (CRM home)

- **URL:** https://attio.com (refs: [Attio dashboards](https://attio.com/help/reference/managing-your-data/dashboard-and-reports/dashboards), [Attio Figma kit](https://www.figma.com/community/file/1533024283737732966/attio-full-dashboard-ui-screens-250-screens-for-research-inspiration), [SaaSUI screenshots](https://www.saasui.design/application/attio)).
- **/home contents:** **No dedicated customizable home** — login goes straight to spreadsheet-style contact list view. Caveat: Attio shipped Dashboards & Reports as a separate page in 2025.
- **Density:** 9/10 in tables.
- **Charts:** Dashboards (separate page) have charts, single-number metrics, tables.
- **Hierarchy:** Sidebar is the nav backbone, content is the table.
- **Color:** White, dark text, minimal accent.
- **Whitespace:** Tight in tables, breathing in dashboards.
- **Typography:** Inter-like.
- **Animations:** Modal slides in 200ms. Row hover at 80ms.
- **Illustrations:** None.
- **Empty state:** Onboarding-driven — guided first steps.
- **Expensive move:** Spreadsheet-grade table editing where every cell is editable inline (rare in CRMs).
- **Load-bearing detail:** Consistent column-resize and reorder feel — table-as-app.
- **Verdict:** **DO NOT COPY HOME** — Beamix `/home` is rich, not table-first. **COPY ELEMENTS** for `/scans` table editing.

---

### 15. Ramp (Finance home)

- **URL:** https://ramp.com (refs: [Webflow customer story](https://webflow.com/customers/ramp), [Bakken & Baeck case](https://bakkenbaeck.com/case/ramp), [Jitter motion case](https://jitter.video/customers/ramp/)).
- **/home contents:** Spend overview cards, recent transactions, budget bars, integration cards.
- **Density:** 6/10.
- **Charts:** Spend line chart (1 series, current vs comparison), budget bars (horizontal with per-category color), funds-tracking widget.
- **Hierarchy:** Spend overview top, transactions middle, integrations bottom.
- **Color:** Ramp-orange + warm neutrals. Brand color is distinctive enough to be a moat.
- **Whitespace:** Generous.
- **Typography:** Custom-feeling sans.
- **Animations:** Ramp's design team uses Jitter for motion design; transitions are "seamless, intentional, and on-brand." Spend chart animates in left-to-right.
- **Illustrations:** Custom motion expressions for currency transactions. Multi-currency animation when switching.
- **Empty state:** Onboarding-driven.
- **Expensive move:** Branded multi-currency animation — when you swap currencies, the digits roll. Outsized motion treatment for one feature.
- **Load-bearing detail:** Ramp-orange consistency. Without it, Ramp would look like Brex.
- **Verdict:** **COPY ELEMENTS** — Beamix can adopt rolling-digit animation on score change (per the count-up gauge pattern from Speedtest documented in REFS-02).

---

## STUDIO-GRADE PORTFOLIO REFERENCES (translatable techniques)

These are NOT dashboards but the quality bar. Capture techniques translatable to a SaaS `/home`.

### S1 — Family.co (https://family.co)
- **Translatable:** Micro-interactions everywhere; phone mockup as proof-of-product card; emoji carousel for personality without childishness.
- **Beamix application:** Activity-feed rows can have a "phone mockup" equivalent — a tiny visual proof of the action (the actual sparkline of the score change for that scan).
- Source: family.co direct observation.

### S2 — Basement.studio (https://basement.studio)
- **Translatable:** Confidence in copy ("We make cool shit that performs"); informal tagline + premium execution = expensive feel; bold Geist typography as branding.
- **Beamix application:** Empty-state copy can be more direct than committee-safe ("No scans yet. One click to find out what AI sees.").
- Source: [basement.studio](https://basement.studio), [Codrops studio profile](https://tympanus.net/codrops/2025/12/15/from-basement-to-breakthroughs-inside-the-studio-powering-the-internets-boldest-brands/).

### S3 — Tonik (https://tonik.com)
- **Translatable:** "Strategic whitespace" — sections breathe; specific deliverables transparency; rotated showreel; "1/10" pagination as curiosity hook.
- **Beamix application:** Per-engine strip can show "1/9" pagination chip if user scrolls horizontally on mobile.
- Source: tonik.com direct observation.

### S4 — Rauno Freiberg (https://rauno.me, [Devouring Details](https://devouringdetails.com))
- **Translatable:** Manifest-as-design-philosophy ("Make it fast. Make it beautiful. Make it consistent. Make it carefully. Make it timeless. Make it soulful. Make it."); subtle copy-to-clipboard with "Copied" feedback; year-versioned portfolios as honesty.
- **Beamix application:** Email link in `/settings` with "Copied" feedback; Devouring Details principles directly applicable: inferring intent, ergonomic interactions, simulating physics, motion choreography, contained gestures.
- Source: [rauno.me](https://rauno.me), [Devouring Details](https://devouringdetails.com), [ui.land interview](https://ui.land/interviews/rauno-freiberg).

### S5 — Emil Kowalski (https://emilkowal.ski)
- **Translatable:** Vaul (drawer component), Sonner (toast component) — both shipped to Linear. Animation course documents specific easings.
- **Beamix application:** Use Sonner for toast notifications on `/home` (e.g., "Scan complete"). Use Vaul for mobile bottom sheets.
- Source: [emilkowal.ski](https://emilkowal.ski).

---

## ANTI-REFERENCES (Tier 4 — what Beamix `/home` MUST NOT do)

For each: what reads cheap, why, alternative.

### A1 — Profound (https://tryprofound.com)
- **What looks cheap:** Custom dashboards via drag-and-drop widget grid → results in inconsistent layouts user-by-user. "Visibility Score, Share of Voice, Average Position, Citation Rank" displayed as default templated cards. Filter chips at the top. Indistinguishable from any Looker Studio export. Source: [Profound — Introducing Custom Dashboards](https://www.tryprofound.com/blog/introducing-custom-dashboards-in-profound).
- **Why cheap:** Letting the user assemble the dashboard means no opinion. The product has nothing to say.
- **Beamix alternative:** Beamix `/home` is OPINIONATED — fixed 8 sections, the order is the product's argument. No widget customization.

### A2 — Otterly.ai (https://otterly.ai)
- **What looks cheap:** Generic "Brand Coverage Over Time" + "Me + Top 5 competitors" line chart with default chart-library styling. Tabbed filters. Default category-toggle UI. "Cluttered UI, difficulty turning visibility data into actionable steps" — reviewers' words. Source: [Otterly direct observation](https://otterly.ai/), [Visible/SE Ranking review](https://visible.seranking.com/blog/peec-ai-alternatives/).
- **Why cheap:** Default chart-library = no design opinion. Tabs+filter chips above charts = generic Plotly/Chart.js look.
- **Beamix alternative:** Custom-styled charts with brand color discipline; no tab-strip above charts; filters live in a single thin row, not above each chart.

### A3 — Peec.ai (https://peec.ai)
- **What looks cheap:** Better than competitors but still generic four-area dashboard (Dashboard / Prompts / Sources / Competitors). Brand-visibility percentage as a big number, ranking table, mention list, sources summary — all on one screen. Source: [Peec.ai review](https://writesonic.com/blog/peec-ai-vs-profound).
- **Why cheap:** "Brand visibility percentage" as the headline reads like a commodity metric. No proprietary number, no insight.
- **Beamix alternative:** Beamix's hero score block shows a SCORE (a calculated, opinionated single number) — not a percentage. The 1-line diagnosis is the differentiator: "Your AI visibility is at 73 — Perplexity is the gap."

### A4 — Generic Shadcn-template SaaS (e.g., admin templates)
- **What looks cheap:** 4 KPI cards in a row with Lucide icons in colored circles, gradient background on KPI cards, chart with default Recharts styling and pastel multi-color palette, "Welcome back, {name}!" greeting at the top, sidebar with full-color icons, "Quick Actions" buttons with shadows. Sources: [AdminLTE SaaS templates](https://adminlte.io/blog/saas-admin-dashboard-templates/), [TailAdmin templates](https://tailadmin.com/blog/saas-dashboard-templates).
- **Why cheap:** The template is the design. There is no point of view.
- **Beamix alternative:** No icons on KPI cards, no greeting, no gradient backgrounds, no Lucide colored circles, no "Quick Actions" panel.

---

## THE 12 PATTERNS THAT MAKE /home FEEL "EXPENSIVE"

Cross-product synthesis. Each appears in 3+ premium references.

### P1. Tabular numerals + paid foundry (or Inter with `tnum`) on every numeric value
- Definition: All numbers vertically align by digit. The eye reads "engineered."
- Examples: Stripe (Söhne), Vercel (Geist), Linear (Inter Display), Mercury (custom sans with tnum).
- Sources: [Sohne in action](https://typ.io/s/59wr), [Inter tabular figures](https://madegooddesigns.com/inter-font/), [Geist typography](https://vercel.com/geist/typography).

### P2. Sidebar dimmer than content
- Definition: Sidebar background lightness is perceptibly lower than content background. Linear's "don't compete for attention you haven't earned."
- Examples: Linear, Stripe Dashboard, Anthropic Console.
- Sources: [Linear behind the refresh](https://linear.app/now/behind-the-latest-design-refresh).

### P3. Sparkline-in-KPI-card (single 1px stroke, no fill, no markers)
- Definition: Every KPI card has a tiny last-N-period sparkline below the number. Single color, no gridlines, no points.
- Examples: Stripe, Vercel project cards, PostHog insight cards, Mercury cashflow widget.
- Sources: [Stripe Help](https://support.stripe.com/questions/dashboard-home-page-charts-for-business-insights).

### P4. One brand-distinctive interaction primitive
- Definition: A single motion or interaction that is THE product's signature.
- Examples: Things 3 Magic Plus, Stripe card-slide-with-spring, Ramp currency-roll, Arc Peek.
- Sources: [Brian Lovin Stripe teardown](https://brianlovin.com/design-details/stripe-dashboard-ios), [Things features](https://culturedcode.com/things/features/), [Jitter Ramp case](https://jitter.video/customers/ramp/).

### P5. "Buttery" sub-150ms transitions everywhere on routine actions
- Definition: Hover → response < 100ms. Click → state change < 150ms. No spinners on routine ops.
- Examples: Cron / Notion Calendar, Linear, Raycast, Stripe.
- Sources: [Stripe iPhone teardown](https://medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e).

### P6. Click-to-drill on every aggregate (numbers, charts, pills, badges)
- Definition: No number is a dead-end. Click → next level of detail.
- Examples: Stripe (every number is a link), Anthropic Console (bar drill day→hour→minute), Linear (status pills filter views), Hebbia.
- Sources: REFS-02 / REFS-04 from existing master list, [Cost and Usage Reporting](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console).

### P7. LCH-defined color tokens for perceptually-equal dark/light modes
- Definition: Color tokens defined in LCH (Lightness, Chroma, Hue) so dark and light modes have identical perceived contrast.
- Examples: Linear (explicit migration), Vercel Geist (high contrast accessible color system).
- Sources: [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui).

### P8. Charts respond to filters applied below
- Definition: When user filters the table, the chart above re-projects in real-time with no spinner.
- Examples: Mercury Transactions, Linear Dashboards, PostHog.
- Sources: [Mercury — Updated Transactions](https://mercury.com/blog/updated-transactions-page).

### P9. Custom fonts for display, even when body is Inter/system
- Definition: A display font (often a serif or display-cut) for largest type, body in neutral sans.
- Examples: Granola (Quadrant slab serif + Melange sans), Stripe (Söhne single family but cut differently for display), Linear (Inter Display + Inter), Tonik (display sans + body sans).
- Sources: [A new look for Granola](https://www.granola.ai/blog/a-new-look-for-granola), [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui).

### P10. Empty states are calm, single-CTA, no fake data
- Definition: New account = one inviting CTA. Never "Welcome dashboard with placeholder $XX,XXX revenue."
- Examples: Stripe ("get started" 3-step), Linear ("create first issue"), Things 3 ("celebratory done"), Granola ("start first meeting note").
- Sources: direct observation + [Things features](https://culturedcode.com/things/features/).

### P11. Status reflected in places outside the page (favicon, browser tab title, OS notifications)
- Definition: Product state extends beyond the canvas. Tab favicon reflects deployment status, push notifications respect timezone.
- Examples: Vercel (deployment status in tab favicon), Stripe (timezone-respecting push), Linear (mobile bottom-tab badge counts).
- Sources: [Vercel dashboard redesign](https://vercel.com/blog/dashboard-redesign), [Brian Lovin Stripe teardown](https://brianlovin.com/design-details/stripe-dashboard-ios).

### P12. One brand color used with extreme discipline
- Definition: One accent. Used sparingly. Everything else is neutral. Green/red ONLY for semantic deltas.
- Examples: Stripe (purple), Things 3 (blue), Ramp (orange), Anthropic (cream-and-black + Claude orange micro-accent).
- Sources: [Quick UI review Stripe](https://dev.to/kyleparisi/quick-ui-review-stripe-homepage-4bab), [Things features](https://culturedcode.com/things/features/).

---

## THE 8 PATTERNS THAT MAKE /home FEEL "AI-SLOP / CHEAP"

### N1. KPI cards with colored Lucide icons in circles
- Looks like: Every Shadcn admin template ever. Icon-in-tinted-circle to the left of the metric.
- Why cheap: Templates ship with this. No premium product uses it.
- Alternative: NO icon on KPI cards. The number IS the visual.

### N2. Gradient backgrounds on cards
- Looks like: Pastel gradient from top-left to bottom-right of a card.
- Why cheap: 2018 dashboard tropes. The gradient IS the design.
- Alternative: White (or surface) cards with `border: 1px solid rgba(black, 0.06)`. Period.

### N3. "Welcome back, {name}!" greeting at top
- Looks like: H1 with user's first name + emoji + helpful tip below.
- Why cheap: Every B2B template. Wastes the most valuable real estate.
- Alternative: The hero score is the headline. Greeting belongs in `/inbox` if anywhere.

### N4. Default Recharts/Chart.js multi-color palette
- Looks like: Pastel rainbow line chart. Each series a different pastel.
- Why cheap: Library default = no design opinion.
- Alternative: One color per chart, different luminosities for series differentiation. Weight matters more than hue.

### N5. "Pro tip" / "Did you know?" callout boxes
- Looks like: Yellow or blue tinted box with a lightbulb icon and helpful copy.
- Why cheap: Stripe explicitly avoids "exclamation points" and "PRO TIP badges" (per REFS-04 Anchor 3 in Beamix master list). Treats the user as needing a tutor.
- Alternative: Tooltips on hover. Help icon `?` opens a side panel.

### N6. "Quick Actions" panel with 6 stacked buttons
- Looks like: A right-rail or top-strip with buttons "New Project / Invite Team / View Reports / etc."
- Why cheap: Implies the product has too many paths. Cmd+K solves this elegantly.
- Alternative: One primary CTA per section. Cmd+K for everything else.

### N7. Skeleton screens with shimmer animations
- Looks like: Gray bars with traveling-shimmer gradient during data fetch.
- Why cheap: Templated. Stripe (per Brian Lovin) waits for data and shows nothing rather than skeleton-shimmer.
- Alternative: Pre-render the layout with last-cached values; refresh in place when new data lands. Subtle pulse on the changed value.

### N8. Confetti / celebration animations on completion
- Looks like: A burst of colored particles when user completes onboarding or first scan.
- Why cheap: Reads as a B2C trick. Billion-dollar products reward with a quiet checkmark + a useful next step.
- Alternative: A small green check + "You're set up. Your first scan is running →" with a subtle line-draw animation on the check.

---

## SPECIFIC TREATMENT RECOMMENDATIONS PER BEAMIX /home SECTION

For each of the 8 locked sections (per `2026-04-25-PAGE-LIST-LOCKED.md`).

### Section 1 — Hero score block
- **Anchors:** Stripe Dashboard (KPI hero), Mercury (cashflow widget), Anthropic Console (drillable bars).
- **Moves:**
  - Score number in InterDisplay 64-72px semibold tabular nums, color = neutral (not blue).
  - Delta below in 18px medium tabular, with up/down arrow in semantic green/red. Sparkline (12 weeks) to the right of the score, 1px brand-blue stroke (#3370FF), no fill, no markers, ~120px wide × 32px tall.
  - 1-line diagnosis in Fraunces 17-19px regular italic, muted text color. (Serif-display per Granola's Quadrant pairing pattern.)
  - On first paint: score number counts up from 0 over 600ms with ease-out (per the Speedtest gauge pattern from REFS-02 §11). Sparkline draws left-to-right over 800ms after the count completes.
  - Click score → drills to a "score detail" overlay (inline expand 200ms, NOT page nav) showing: 12-week breakdown, contribution by engine, recent changes.
- **Source patterns:** P1, P3, P6, P9.

### Section 2 — Top 3 fixes ready
- **Anchors:** Stripe (KPI grouping), Linear (action with keystroke shown), Things 3 (Magic Plus signature CTA).
- **Moves:**
  - Three RecommendationCards in a vertical stack (NOT horizontal — readability + mobile parity).
  - Each card: agent icon (small, monochrome — NOT colored circle, anti-pattern N1) + agent type label + 1-line problem + 1-line proposed action + credit cost chip + "Approve" button with `⌘↵` keystroke shown (Linear pattern).
  - Bottom of section: "Run all 3 — N credits" CTA. This is Beamix's Magic Plus equivalent: a brand-distinctive primary action. Uses #3370FF, pill shape (radius 999px) per BRAND_GUIDELINES.md, hover scales 1.02.
  - On approve: card collapses with a 200ms ease-in (height to 0), strikethrough fade on action label. Optimistic UI.
- **Source patterns:** P4, P12.

### Section 3 — Inbox pointer line
- **Anchors:** Linear (sibling-surface pointer), Stripe (minimal nav).
- **Moves:**
  - Single line: "3 items in your Inbox awaiting review →"
  - Right arrow chevron is the affordance, no button styling. Hover changes color to brand-blue.
  - On click: `/inbox` page transition (smooth, no flash).
  - 14-15px regular, muted text. NEVER a banner. NEVER colored.
- **Source patterns:** P12 (discipline).

### Section 4 — KPI cards row (Mentions / Citations / Credits / Top competitor delta)
- **Anchors:** Stripe Dashboard KPI row (master template), Vercel project grid (sparkline thumbnail), PostHog insight cards (toggleable detail).
- **Moves:**
  - 4 cards in a row at desktop, 2×2 grid at tablet, vertical stack mobile.
  - Each card: label (12px caps regular, letter-spacing 0.04em, muted), big number (28-32px semibold tabular), delta (12px medium tabular with arrow), sparkline (1px brand-blue stroke, 12 weeks).
  - NO ICONS on cards (anti-pattern N1).
  - Border 1px `rgba(black, 0.06)`, radius 12px (Linear refresh value).
  - Hover: 6-8px slide on entire card with 250ms spring (Stripe slide pattern).
  - Click → drills to specific page (mentions → /scans?metric=mentions, etc.).
- **Source patterns:** P1, P3, P6.

### Section 5 — Score trend chart
- **Anchors:** Mercury cashflow chart, Linear Dashboards line chart, Anthropic Console drillable bars.
- **Moves:**
  - Line chart, single series, 1.5px stroke #3370FF.
  - Y-axis: tabular nums, 4-5 ticks max, 12px regular muted.
  - X-axis: dates, 12px regular muted, format "Mar 12" not "March 12, 2026."
  - Grid: NONE on Y-axis. Single 1px dashed `rgba(black, 0.05)` line at the previous-period average (the comparison line).
  - Hover: vertical guide line + dot on data point + tooltip with date + score + delta. Tooltip uses tabular nums, white surface, soft shadow, NO border.
  - Click any week → that week expands to daily view inline (Anthropic drill pattern).
  - On first paint: line draws left-to-right, 1.2s ease-out (after KPI cards have settled).
- **Source patterns:** P3, P5, P6, P8.

### Section 6 — Per-engine performance strip (9 engines)
- **Anchors:** Linear status pills, Vercel project status, Mercury filter chips.
- **Moves:**
  - 9 pills horizontally (scrollable on mobile). Each pill: engine name (Geist Mono 12px caps), score (Inter Display 16px semibold tabular), delta arrow.
  - Background: white. Border: 1px `rgba(black, 0.06)`. Radius: 999px (full pill).
  - On hover: pill lightens slightly, sparkline appears below the pill in a tooltip (50ms delay).
  - On click: drills to `/scans/per-engine?engine={name}`.
  - Engines render in pre-defined logical order (NOT alphabetical): ChatGPT, Claude, Gemini, Perplexity, Grok, You.com, Google AIO, Bing, Other. Order is the product's argument.
  - For LOCKED engines (Pro tier above current plan), render with 50% opacity + small lock icon. Click = paywall modal.
- **Source patterns:** P12 (discipline).

### Section 7 — Recent activity feed
- **Anchors:** Linear changelog list, Vercel deployment list, Granola notes list.
- **Moves:**
  - Vertical list, 5-10 most recent events.
  - Each row: timestamp (12px regular muted, "2h ago" not "2026-04-25 14:32"), event type (small icon - monochrome), one-line description, sparkline thumbnail showing the score change for that scan (Vercel pattern: visual proof).
  - Hover: row lightens, sparkline tooltip shows full chart.
  - Click row → relevant detail page (scan completed → /scans/[id], agent run → /workspace/[runId]).
  - Empty state: "No activity yet. Your first scan is queued for {time}." NO illustration, NO emoji.
- **Source patterns:** P3, P5, P10.

### Section 8 — What's coming up footer
- **Anchors:** Things 3 today/upcoming distinction, Notion Calendar upcoming, Linear cycles overview.
- **Moves:**
  - Three lines: next scheduled scan (with countdown if <24h), next agent run, next billing date.
  - Each line is a clickable row → relevant settings.
  - Section title: 12px caps regular, letter-spacing 0.04em ("UP NEXT").
  - Body: 14-15px regular.
  - Footer is the lowest-contrast section on the page (muted background `rgba(black, 0.02)`).
- **Source patterns:** P10, P12.

---

## CHARTS / DATAVIZ TREATMENT — THE SPECIFIC GUIDANCE

### Chart 1 — Score gauge / hero score number
**References showing premium treatment:**
- Speedtest count-up gauge ([REFS-02 master list reference](https://www.speedtest.net))
- Stripe revenue hero number ([Stripe basics docs](https://docs.stripe.com/dashboard/basics))
- Mercury balance ([Mercury home](https://mercury.com))

**Specific styling rules:**
- Number: InterDisplay 64-72px semibold, `font-feature-settings: 'tnum'`, color = `var(--text-primary)` not brand color.
- Counter animation: 0 → final value over 600ms, `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint). Only on first paint per session.
- Sparkline beside it: 1px stroke #3370FF, no fill, no markers.
- Label below ("AI Visibility Score"): 12px caps regular, letter-spacing 0.04em, muted color.

**Anti-examples:**
- Donut/radial gauge with thick arc and color-stops (red→yellow→green) — looks like a 2010 fitness tracker. Reject.
- Number with a gradient fill — gradient is the design. Reject.

### Chart 2 — Score trend line chart
**References:** Mercury cashflow, Linear Dashboards, Stripe gross volume, Anthropic Console spend chart.

**Specific styling rules:**
- 1.5px stroke (NOT 1px — too thin at retina; NOT 2px — too heavy).
- Single color #3370FF for current period; muted gray dashed line for previous-period comparison.
- No fill area (or 4% opacity max if comparison is shown via fill).
- No gridlines.
- 4-5 Y-axis ticks max, tabular nums, 12px regular muted.
- X-axis labels every 4 weeks at month-quarter cadence.
- Hover: vertical guide line at `rgba(black, 0.06)` 1px solid + dot at intersection in #3370FF + tooltip (white, no border, soft shadow `0 4px 12px rgba(black, 0.08)`).
- Animation: line draws left-to-right over 1.2s ease-out.

**Anti-examples:**
- Multi-color rainbow lines — Recharts default. Reject.
- Heavy fill area gradient — Looker default. Reject.
- Visible gridlines on both axes — Excel default. Reject.

### Chart 3 — Per-engine performance strip (small multiples / pills)
**References:** Linear status pills, [Tableau small multiples](https://www.phdata.io/blog/tableau-chart-talk-small-multiples/), Mercury filter chips.

**Specific styling rules:**
- Pills horizontal, full radius (999px), `border: 1px solid rgba(black, 0.06)`, padding 8px 12px.
- Engine name in Geist Mono 12px caps (technical badge feel).
- Score in InterDisplay 16px semibold tabular.
- Delta arrow + percent in 12px medium tabular, semantic green/red.
- On hover: pill lightens 4%, sparkline tooltip appears below after 50ms delay.

**Anti-examples:**
- Engine logos in colored circles with shadow — generic competitor pattern. Reject.
- Bar chart with 9 vertical bars — works for small-multiples but reads commodity. Pills are more brand-distinctive.

### Chart 4 — KPI sparklines (4 cards)
**References:** Stripe KPI cards, Vercel project sparklines, Mercury cashflow widget.

**Specific styling rules:**
- 1px stroke #3370FF, no fill, no markers, no axis labels.
- Width: card width minus 24px padding × 2; height: 32px fixed.
- Renders 12 weeks of weekly data points (or N points based on metric).
- On card hover: sparkline tooltip shows specific data points with vertical guide.

**Anti-examples:**
- Sparkline with markers/dots on every data point — Highcharts default. Reject.
- Filled gradient sparkline — clunky. Reject.

---

## ANIMATION CHOREOGRAPHY ON /home (first load)

Frame-by-frame sequence on first load. Total budget: < 2.5s perceived (longer if data is slow but visual choreography stays).

| t (ms) | Event | Easing | Notes |
|---|---|---|---|
| 0 | Page chrome paints (sidebar, topbar) | none | Sidebar dimmed (P2). |
| 0-50 | Hero score block container fades in | linear | Opacity 0 → 1 over 50ms. |
| 50-650 | Hero score number counts up from 0 | cubic-bezier(0.22, 1, 0.36, 1) ease-out-quint | 600ms count. Tabular nums vertical-align without jitter. |
| 200 | Hero sparkline starts drawing | ease-out | Lags hero number by 150ms. |
| 200-1000 | Hero sparkline draws left-to-right | ease-out | 800ms duration. |
| 250 | Top 3 fixes section fades in | ease-out | 200ms fade, staggered card entry: card 1 at 250ms, card 2 at 280ms, card 3 at 310ms. |
| 400 | Inbox pointer line slides in | ease-out | 12px slide-up + 200ms fade. |
| 500 | KPI cards row begins entering | spring | 4 cards staggered 30ms each, 6-8px slide-up + 200ms fade. |
| 700 | KPI sparklines draw | ease-out | 600ms after cards settle. |
| 900 | Score trend chart container fades in | linear | 80ms. |
| 980-2180 | Score trend line draws left-to-right | ease-out | 1.2s draw. |
| 1100 | Per-engine strip pills enter | spring | Staggered 25ms each. |
| 1500 | Recent activity feed rows appear | ease-out | 200ms fade, staggered 30ms each. |
| 1700 | Footer "What's coming up" appears | ease-out | 150ms fade. |

**Restraint rules:**
- This sequence runs ONCE per session (sessionStorage flag). Subsequent visits do NOT re-animate.
- Reduced-motion preference: skip all sequencing, all elements appear instantly with 0ms fade.
- After first load, hover/click animations all use < 250ms.

**Source patterns:** P5 (sub-150ms responses), P11 (status reflected outside the page — favicon could update mid-load).

---

## ILLUSTRATIONS / HAND-DRAWN ELEMENTS ON /home

Per existing references master list (`2026-04-25-REFERENCES-MASTERLIST.md` rule 1): "Hand-drawn lives only on thinking-state, idle, and artifact surfaces — never on chrome, settings, or data tables." That rule applies here.

**On /home:**
- **YES, hand-drawn:** Empty-state illustration ONLY. If the account has zero scans, a small (max 120×120px) Excalidraw-style hand-drawn placeholder (using rough.js with `roughness: 1.0, seed: fixed`) showing a sketchy magnifying glass over a sketchy square representing "scan."
- **YES, hand-drawn:** The "1 line diagnosis" sentence under the hero score uses Fraunces serif italic (NOT hand-drawn but a parallel "designed personality" register).
- **NO, hand-drawn:** KPI cards, charts, activity feed, per-engine strip, footer — all crisp, all geometric.
- **MAYBE:** The ambient "thinking" state of any agent that is currently running (visible in /home if a scheduled scan is mid-flight). The Linear AIG four-state pill applies (REFS-02 master Anchor 4). When status = "thinking," an asterisk family icon (Claude pattern, REFS-01 Anchor 1) micro-animates inside the pill. NEVER on a static surface.

**Source URLs:** [Rough.js](https://roughjs.com/), [Excalifont](https://plus.excalidraw.com/excalifont), [Linear AIG](https://linear.app/developers/aig), [Kyle Martinez Claude spinner](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0).

---

## CONFIDENCE + SOURCES

### Overall confidence
**Overall: HIGH**

Reason: Most patterns synthesize 3+ named premium products with public design documentation (Stripe, Linear, Vercel, Anthropic, Mercury). Anti-patterns are documented in independent reviews. A few specific competitor screenshots (Profound, Otterly, Peec) were inferred from review articles + landing-page observation rather than direct dashboard access — those claims marked LOW where applicable.

### Confidence breakdown by claim type
- Linear refresh details (warmer gray, LCH, sidebar dim, Inter Display): **HIGH** — Linear's own design blog.
- Stripe Dashboard interaction details (card slide, tap-feedback delay, drill on numbers): **HIGH** — Brian Lovin + Michaël Villar teardowns + Stripe's own design docs.
- Mercury Transactions chart-on-filter behavior: **HIGH** — Mercury's own product blog.
- Vercel deployment status in tab favicon: **HIGH** — Vercel's own dashboard redesign blog.
- Anthropic Console drill day→hour→minute: **HIGH** — Anthropic's own usage reporting docs.
- Granola Quadrant + Melange typography: **HIGH** — Granola's own brand blog.
- Profound / Otterly / Peec screenshots: **MEDIUM** — synthesized from independent review articles, not direct visual observation.
- Anti-pattern N7 "Stripe waits rather than skeleton-shimmer": **MEDIUM** — Brian Lovin teardown describes "no spinner blink" but specifically about iPhone, not web.

### Gaps
- Direct Stripe Dashboard web screenshots not accessible without account; relied on third-party reviews and SaaSFrame.
- Linear Dashboards visual screenshots beyond changelog descriptions are limited; recommendations adapted from changelog text + similar Linear patterns.
- Mercury IO admin home (vs Transactions page) — could not confirm whether IO admin home reuses the same chart language.
- Anthropic Console UI updates from late 2025 / 2026 not deeply documented; older patterns assumed stable.
- Things 3 / Granola "Magic Plus" / brand-distinctive primitives — these are macOS-native; translating to web requires care.

### Source URLs cited (consolidated)
- [Stripe Dashboard basics](https://docs.stripe.com/dashboard/basics)
- [Stripe Apps style guide](https://docs.stripe.com/stripe-apps/style)
- [Stripe Help — Dashboard charts](https://support.stripe.com/questions/dashboard-home-page-charts-for-business-insights)
- [Brian Lovin — Stripe Dashboard for iOS](https://brianlovin.com/design-details/stripe-dashboard-ios)
- [Michaël Villar — Stripe Dashboard iPhone](https://medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e)
- [Sohne in action — Typ.io](https://typ.io/s/59wr)
- [Stripe homepage UI review](https://dev.to/kyleparisi/quick-ui-review-stripe-homepage-4bab)
- [Stripe Press](https://press.stripe.com)
- [Stripe Dashboard examples — SaaSFrame](https://www.saasframe.io/examples/stripe-payments-dashboard)
- [Linear: How we redesigned the UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Linear: Behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh)
- [Linear Dashboards changelog](https://linear.app/changelog/2025-07-24-dashboards)
- [Linear: Welcome to the new Linear](https://linear.app/changelog/2024-03-20-new-linear-ui)
- [Linear: Mobile app redesign](https://linear.app/changelog/2025-10-16-mobile-app-redesign)
- [Linear AIG developers](https://linear.app/developers/aig)
- [Linear UI Kit Figma](https://www.figma.com/community/file/1279162640816574368/linear-ui-free-ui-kit-recreated)
- [Mercury — Updated Transactions](https://mercury.com/blog/updated-transactions-page)
- [Mercury — Viewing cashflow data](https://support.mercury.com/hc/en-us/articles/38790547830036-Viewing-cashflow-and-transactions-data-on-your-Transactions-page)
- [Mercury — Insights overview](https://support.mercury.com/hc/en-us/articles/44277089544084-Insights-page-overview)
- [Mercury demo dashboard](https://demo.mercury.com/dashboard)
- [Mercury Dribbble](https://dribbble.com/mercuryfi)
- [Mercury home](https://mercury.com)
- [Vercel dashboard redesign](https://vercel.com/blog/dashboard-redesign)
- [Geist intro](https://vercel.com/geist/introduction)
- [Geist typography](https://vercel.com/geist/typography)
- [Vercel Design](https://vercel.com/design)
- [The Birth of Geist — basement.studio](https://basement.studio/post/the-birth-of-geist-a-typeface-crafted-for-the-web)
- [Anthropic Console](https://console.anthropic.com)
- [Anthropic — Cost and Usage Reporting](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console)
- [Claude Design help](https://support.claude.com/en/articles/14604416-get-started-with-claude-design)
- [Kyle Martinez — Claude ASCII spinner](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0)
- [Notion Calendar help](https://www.notion.com/help/notion-calendar-apps)
- [Notion Calendar view docs](https://www.notion.com/help/calendars)
- [Notion Calendar feature design — Medium](https://medium.com/design-bootcamp/why-i-decided-to-design-a-new-feature-for-notion-calendar-616f672ed2ff)
- [Pitch — What's New](https://pitch.com/whats-new)
- [Pitch dashboard guide](https://help.pitch.com/en/articles/8038180-get-to-know-your-pitch-dashboard)
- [Pitch home](https://pitch.com)
- [Things 3 features](https://culturedcode.com/things/features/)
- [Things 3 Wikipedia](https://en.wikipedia.org/wiki/Things_(software))
- [Cultured Code](https://culturedcode.com)
- [Granola updates](https://www.granola.ai/updates)
- [A new look for Granola](https://www.granola.ai/blog/a-new-look-for-granola)
- [Raycast Manual](https://manual.raycast.com)
- [Raycast home](https://www.raycast.com)
- [Arc browser design analysis — Medium](https://medium.com/design-bootcamp/arc-browser-rethinking-the-web-through-a-designers-lens-f3922ef2133e)
- [Arc home page intro — Medium](https://medium.com/@abhimanyouknow/arcs-home-page-navigating-the-nexus-f709c274b0cf)
- [PostHog dashboards docs](https://posthog.com/docs/product-analytics/dashboards)
- [PostHog charts docs](https://posthog.com/docs/product-analytics/trends/charts)
- [PostHog home](https://posthog.com/dashboards)
- [Attio dashboards help](https://attio.com/help/reference/managing-your-data/dashboard-and-reports/dashboards)
- [Attio Figma 250 screens](https://www.figma.com/community/file/1533024283737732966/attio-full-dashboard-ui-screens-250-screens-for-research-inspiration)
- [Attio screenshots — SaaSUI](https://www.saasui.design/application/attio)
- [Ramp — Webflow customer story](https://webflow.com/customers/ramp)
- [Ramp — Bakken & Baeck case](https://bakkenbaeck.com/case/ramp)
- [Ramp motion — Jitter](https://jitter.video/customers/ramp/)
- [Profound — Custom Dashboards](https://www.tryprofound.com/blog/introducing-custom-dashboards-in-profound)
- [Otterly home](https://otterly.ai/)
- [Peec.ai vs Profound — Writesonic](https://writesonic.com/blog/peec-ai-vs-profound)
- [Peec.ai alternatives — SE Ranking](https://visible.seranking.com/blog/peec-ai-alternatives/)
- [Family.co](https://family.co)
- [Basement.studio](https://basement.studio)
- [Codrops studio profile](https://tympanus.net/codrops/2025/12/15/from-basement-to-breakthroughs-inside-the-studio-powering-the-internets-boldest-brands/)
- [Tonik](https://tonik.com)
- [Rauno.me](https://rauno.me)
- [Devouring Details](https://devouringdetails.com)
- [Rauno — ui.land interview](https://ui.land/interviews/rauno-freiberg)
- [Emil Kowalski](https://emilkowal.ski)
- [Madegooddesigns — Inter font review](https://madegooddesigns.com/inter-font/)
- [Inter on GitHub](https://github.com/rsms/inter)
- [Tableau small multiples — phData](https://www.phdata.io/blog/tableau-chart-talk-small-multiples/)
- [Rough.js](https://roughjs.com/)
- [Excalifont](https://plus.excalidraw.com/excalifont)
- [AdminLTE SaaS templates](https://adminlte.io/blog/saas-admin-dashboard-templates/) (anti-reference)
- [TailAdmin templates](https://tailadmin.com/blog/saas-dashboard-templates) (anti-reference)
