# Beamix Design Review — Through Linear's Lens
Date: 2026-04-28
Reviewer: Senior Designer applying Linear's speed + keyboard + density + opinion + changelog disciplines

---

## A — Speed audit

Linear's bar is 16ms. If a frame skips, the team treats it as a bug, not a polish item. Beamix's specs talk about motion the way most product teams do — easing curves, durations, choreography. They do not yet talk about it the way Linear does — frame budgets, prefetch policy, route-level instant-paint. Walk the surfaces.

**Multi-client switcher (the second most-used surface in the product, per the v1 spec).** The latency budget is in the spec — Cmd+K → palette visible <80ms (tolerance 120ms), search input → filtered results <40ms, total Cmd+K → seeing the new client's /home <1100ms (tolerance 1800ms). That target is one full second slower than Linear's workspace switch. Linear measures sub-300ms route swaps end-to-end on cached workspaces and treats anything above 500ms as a regression. Beamix's 1100ms target accepts a 600ms TTFB and a 600ms first-meaningful-paint after that. The honest read: this is a server-rendered Next.js 16 app talking to Supabase across the Atlantic, and the budget is realistic — but it is not Linear-grade. The fix is on the spec page already (300ms hover-dwell prefetch on `/api/client/[id]/preload`), but it needs to ship hard. Without warm prefetch, every Cmd+K → Enter is a cold round-trip.

**/inbox J/K nav and Approve.** The spec is correct — J/K row nav, `e` approve, `r` reject, `m` modify, optimistic UI fires at T+80ms with a 200ms row-collapse, Seal-draw begins at T+100ms and completes at T+700ms. Linear-shaped so far. The violation is the choreography after T+700ms: row slide-up at T+1000ms, preview pane transition at T+1300ms, topbar Activity Ring brighter pulse at T+1800ms, toast hold to T+5700ms. Yossi pressing `e e e e e` at 200ms intervals overruns this choreography by frame 3. The spec needs an explicit rule: **interrupt-and-collapse**. If a second `e` arrives before the first ceremony completes, the first row's animation snaps to its final state instantly and the second row's optimistic UI starts. Linear's archive flow handles this; Beamix's spec implies a queue. Yossi will hate the queue at speed. The Seal-draw becomes ceremonial at burst rate, which is the inverse of what it should be — the seal earns its weight by being rare.

**Workflow Builder canvas.** Per-node render budget is stated at <16ms for up to 50 nodes (§16.5). That is the right target. The risk is React Flow's bezier edge routing under conflict-overlay state — when 8 of 12 nodes carry an amber conflict triangle and a dashed conflict edge is overlaid, the canvas paints six layers per node. Test at 50 nodes with simulated conflicts before claiming the budget. The Cmd+K quick-add palette (480px fuzzy palette, 120ms enter, instant search) is Linear-grade if implemented client-side; if it makes a server call, kill it.

**/scans table sort + filter.** No latency budget specified. This is the surface where Linear's sort-by-status feels instant — column header click, table re-sorts in <50ms because Linear sorts client-side from a fully-loaded page state. Beamix's spec doesn't say. If the team is server-side-sorting a page of 50 scans, every column click is a 300ms round trip, and the user feels the lag. Spec the rule: **for any list under 500 rows, sort and filter are client-side, no spinner, no skeleton.**

**Page transitions.** The Design System v1 §3 rule (line 946) is correct: "Navigation is instant. No full-page wipes, fades, or slides on route change." This is the most Linear-grade sentence in the entire system. Hold it ruthlessly. The risk is the entrance choreography on /home (1600ms total ring-draw + score-fill + card-entrance + trace-fade, §3.2) firing on every navigation back to /home. The session-level "fire once per session per page" rule is in the spec but it is one config flag away from being violated. Lock it in storage; never per-tab.

The aggregate: Beamix understands speed conceptually but has not yet committed to the frame-level discipline that makes Linear feel different from every other SaaS. The 1100ms switcher target needs to come down to 600ms cached. The Approve burst rate needs an interrupt path. The /scans sort needs to be client-side. None of these are research questions; they are commitments the build team needs handed to them this week.

---

## B — Keyboard audit

Linear's claim is that you never need a mouse. The Beamix specs are halfway there. Walk through:

**/inbox.** The spec ships J/K nav, `e`/`r`/`m` decision, `n` add note, `?` help overlay, Cmd+A multi-select, shift-click range, Esc to close toast/modal. This is correct. What is missing: **`o` to open the item full-screen** (Linear's `o` for "open" is muscle memory across the category), **`u` to undo** (the 5-second Undo toast lives, but pressing `u` should also hit it — easier than chasing the toast with a mouse), **`/` to focus search** (Linear's universal shortcut), **`g i` / `g h` / `g s` / `g c`** for navigate-to-Inbox / Home / Scans / Crew (Linear's two-keystroke navigation grammar — the muscle memory that turns a power user into a fanatic). Add these. They cost nothing.

**/crew + multi-client switcher.** The spec is solid: Cmd+K opens workspace palette, Cmd+1–9 quick-switch to pinned, Cmd+Shift+K opens /all-clients, Cmd+P toggles pin, Cmd+Return opens in new tab, → opens config panel, ← returns. The /crew spec adds `Cmd+/` or `?` for the help overlay. Good. What is missing: **Cmd+K should be unified across the product, not workspace-scoped.** The spec splits Cmd+K (workspace) from Cmd+P (global actions, deferred to MVP-1.5). This is Linear's exact opposite. Linear's Cmd+K is the universal switcher — it routes to issues, projects, settings, actions, search, *everything*. Splitting Beamix's Cmd+K from a deferred Cmd+P is asking the user to learn two palette shortcuts when one will do. **Ship Cmd+K as the universal palette from day one** with workspace switch as the top result section, action commands below ("Run scan now," "Approve all safe items," "Open Brief," "Open /workspace"), navigation commands below that. Cmd+P does not need to exist.

**Workflow Builder.** The spec ships a deep keyboard map (§15) — Cmd+K quick-add, Cmd+Z/Shift+Z undo/redo (50-step ring), Cmd+A/D select-all/duplicate, Cmd+S save, Delete/Backspace remove, Space pan, +/-/0 zoom, arrow nudge 8px / Shift+arrow 24px, Tab next-node, Enter open inspector, Esc deselect. This is the most keyboard-complete surface in Beamix. What is missing: **keyboard-only edge connection.** Currently you must mouse-drag from output handle to input handle. Linear-grade would be: select a node, press `c` for "connect," J/K to move selection to the target node, Enter to commit the edge. Without this, the Workflow Builder is mouse-required for the most common operation, which is a Linear violation per the spec's own §15 ambition.

**/home.** Not specified at all. Fix this now. **g h** lands here. Once on /home, the Activity Ring is read-only; the Decision Card needs `Enter` to expand and `e`/`r` to act on it (the same `e`/`r` as /inbox — consistency). Receipts table needs J/K row nav and Enter to drill in. The "What changed" list needs J/K + Enter. The Crew at Work strip needs nothing — it is read-only ambient — but pressing `c` should focus the strip and J/K should walk it.

**Global Cmd+K — the unified command palette I am championing.** Sections, in order: (1) workspace switch (when ≥2 clients), (2) navigate (Home, Inbox, Scans, Crew, Competitors, Reports, Settings — each with its own `g _` shortcut shown right-aligned), (3) actions (Run scan, Approve safe items, Open Brief, Trigger workflow, Add client, Edit Truth File), (4) recent (last 5 items touched), (5) help (`?` overlay). Fuzzy-search across all. Search latency <40ms client-side. This single surface handles the scan-trigger / agent-trigger / navigate-to-X cases the prompt asked about. It also kills the "Cmd+K hint chip floating below the workspace switcher for 7 days" tutorial chrome — Cmd+K appears in the search input itself, on every page, every time. Train via repetition, not chrome.

**`?` help overlay.** Every keyboard-driven Linear-grade surface needs one. The /crew spec ships it (`Cmd+/` or `?`). The /inbox spec mentions a "keyboard-shortcuts hint icon" but does not commit to the overlay. Commit. One component, every surface. Sections by action category, shortcuts right-aligned in 11px Geist Mono. The cost is a single React component reused across surfaces. The benefit is that no one ever asks "what does `m` do" again.

The aggregate keyboard verdict: the team is shipping Linear-grade keyboard for two surfaces (Workflow Builder, multi-client switcher), Linear-adjacent for one (/inbox), and nothing for /home. Lift /home to parity, ship `g _` two-keystroke nav across the product, unify Cmd+K, and you are at Linear's bar.

---

## C — Density audit

Linear packs more rows of meaning per pixel than any product in the category. Beamix is half-there.

**/home above-fold (5-second test).** The spec has lead-attribution headline + 96px score inside 200px Activity Ring + tier badge + Decision Card. That is four units of information, well-packed. Where it loses density: 120px hero stretch above the headline is luxurious; Linear would not pay 120px for breath above headline. Tighten to 64px, recover the screen real estate for Receipts. The decision card itself is one unit of meaning — *one decision*, one button — which is correctly opinionated; do not let it grow to three.

**/inbox 3-pane (240/440/600).** Linear's inbox is 3-pane at the same proportions, almost exactly. The Beamix spec is Linear-correct on layout. The density loss is per-row: 112px cozy rows are *generous* — Linear's issue rows are 32px in compact, 44px in cozy. Beamix's 112px row holds checkbox + monogram + agent name + date + 2-line headline + diff preview + tier badge + shortcut hint. That is 8 elements at 112px. Linear renders comparable density at 56px. **Cut /inbox cozy rows from 112px to 72px** by collapsing diff preview to hover-only and moving the shortcut hint into the `?` overlay. Yossi's compact mode (64px, headline-only-with-hover-diff) is closer to Linear's grammar — make it the default for Yossi (any user with ≥2 clients), keep cozy default for Sarah. Density-as-respect: Yossi sees 12 rows at a glance, Sarah sees 7.

**/crew table.** The spec is 8 columns × 64px rows — Roster name + monogram + autonomy slider + status + last-acted + queue depth + governance + actions. This is Linear's project-list grammar at 64px and the spec is right. The risk is the autonomy slider widget — a 3-state segmented control at 64px row height eats horizontal real estate that should belong to the data. Replace with a single-letter abbreviation (`A`/`R`/`E` for Auto/Review/Escalate, the keyboard shortcuts that toggle them) on a 24×24 click target. The Linear move is to compress the control and let the data breathe.

**/scans Stripe-table at 44px.** This is the best-density surface in Beamix. Tufte calls it Beamix's quietest victory. Hold the line. The Margin column at 24px is the only loss — kill it (Rams, Tufte, and Kare all agree) and recover 24px for engine-coverage micro-charts.

**Multi-client switcher per-client row.** 56px tall with status dot + 28×28 logo + name + domain · vertical + activity hint + inbox count + chevron. Six elements at 56px. Linear-grade. The 5-second scan succeeds for Yossi at 12 rows. At 25 rows, the modal scrolls — fine, because search-by-typing is the primary interaction at scale. But the row could go to 48px by killing the activity hint (only one priority shows; demote to hover) and pushing the domain · vertical to 10px Geist Mono. Yossi sees 11 rows above the fold instead of 9. That is 22% more density.

The density verdict: Beamix has Linear's instincts but pays for breath at the wrong moments. /scans is correct; /inbox is loose; /home above-fold is loose; /crew is correct; multi-client switcher is close. Tighten /inbox cozy rows to 72px and /home hero to 64px breath, and the system gets to Linear's bar.

---

## D — Customization vs opinion

Linear's discipline is to make decisions so users don't have to. "We sort issues by status, then priority, then updated_at. That's the default. You can change it. You probably won't." Beamix is asking the user to configure too much.

**/crew per-agent autonomy levels.** Three options × 18 agents = 54 configs. Yossi might tune all 54. He shouldn't have to. The Linear move: ship **three opinionated presets** (Conservative startup / Aggressive e-commerce / White-glove agency) as the only first-pass UX. Per-agent override is a second-class affordance, behind a "Customize per agent →" link below the preset picker. The preset is the default; the override is the escape hatch. The CREW spec hints at this in §7.4 but does not commit. **Make the preset the only first-pass UI. The 18-agent grid only appears after the user clicks "Customize."**

**Workflow Builder triggers + per-node config + Brief-grounding overrides.** The Brief-grounding cell pre-populates via Claude Haiku with confidence ≥0.7 fallback (§7.4). Yossi can override per-node. This is correct — auto-suggest with override is the Linear pattern. The per-node config friction comes from the agent-specific fields (Citation Fixer's "Apply on" URL pattern, "Max edits per run," "Output destination," "Autonomy override"). Four configs per Citation Fixer node. Most of these have one sensible default. **Inherit from the workflow-level setting unless explicitly overridden.** The node inspector shows inherited values in ink-3 italic, overrides in ink-1 normal. The user sees what is custom at a glance. This is Stripe's settings-inheritance grammar; it is also Linear's project-template grammar.

**Per-client white-label config.** Six tabs per client × 12 clients = 72 panels Yossi might touch. The switcher spec acknowledges this risk in its closing. **Three of the six tabs should be one-shot setup, not ongoing config:** Lead Attribution (set once, never revisit), Scheduling (set on add-client, change quarterly), Agent Autonomy (set via preset, change rarely). The three that matter daily are Brief, Truth File, White-label. Demote the three one-shot tabs to a single "Setup" tab grouped under "Set up once." The switcher's per-client config now reads as "Brief · Truth File · White-label · Setup." Four tabs, three of which the user touches weekly, one of which they touch quarterly. That is Linear-grade information architecture.

**Day 1–6 cadence email opt-out per email.** Six toggles for six emails is too granular. The Linear move: **one toggle, three settings:** "Quiet (no cadence emails) / Standard (key milestones only) / Full (everything Beamix sends)." Default to Standard. This is Apple's Mail digest pattern; it is also Linear's notification-preferences grammar. The customer who wants email surgery has a "Customize per email →" link below; the rest pick a setting and forget.

The aggregate: Beamix is at the moment where every additional knob feels like respect for the user. It is the opposite. **Every knob is a decision the team failed to make on the user's behalf.** Linear ships fewer settings than its competitors and wins because the defaults are right. Pick the defaults. Hide the rest behind progressive disclosure. The user should encounter customization only when the default has visibly failed them.

---

## E — The missing /changelog

Beamix has /security, /scan public artifacts, and a Monthly Update PDF. It does not have /changelog. This is the missing artifact, and it is the artifact most Linear-shaped of all.

Linear's changelog is product. Every release is a thoughtful post — title in Inter Display, hero illustration (often static, often hand-drawn), 2–4 paragraphs of prose explaining what shipped and why, embedded screenshots or short videos. Karri writes some of them. The changelog is searchable, archivable, and shared on social — every Linear release earns 200+ retweets. It is also the trust artifact: customers know Linear ships weekly because the changelog is the evidence.

Beamix's changelog should exist for three reasons: (1) every release adds an agent capability or refines a Brief grounding rule — this is rich changelog material, (2) the customer's trust in the agents grows with visibility into how the agents are evolving, (3) the changelog is the OG card factory for organic growth.

**The route:** `/changelog` (public, indexable). Each entry at `/changelog/[slug]`.

**The grammar.** Editorial Artifact register — cream paper, Fraunces 300 italic for the headline, Inter 400 ink-2 for body, Geist Mono for the date stamp and version number. One hand-drawn illustration per entry (deterministic seed per entry slug — Kare's seed-as-spine rule extends here). The Beamix Seal at the bottom of every entry. Entries are typeset like Stripe Press blog posts at 720px reading column.

**The cadence.** Weekly. Every Monday morning, Beamix ships a changelog post. It is the *companion artifact to the Monday Digest email* — the email links to the post.

**The content shape.** 4 sections per entry: (1) "What shipped this week" — 2–4 sentences. (2) "Agent updates" — bullet list of which agents got new capabilities, e.g., "FAQ Agent now reads Truth File `never_say` array on every run." (3) "Brief grounding refinements" — when the Claude Haiku clause-matcher gets retrained, the post documents which clause patterns improved. (4) "What we considered and didn't ship" — Rams' "what Beamix did not do" idea, transplanted from the Monthly Update to the changelog. Honesty is the moat.

**The OG card.** Same Editorial register, the entry's headline in Fraunces 300, the deterministic Rough.js illustration, the Seal in the bottom-right. Every changelog post is a tweet-ready image. Yossi screenshots them for his agency's prospect deck.

The cost: one writer-day per week (Adam writes the first 12, then a content lead takes over). One template route. One CMS table. The OG card is a reuse of the Monthly Update PDF's React component with a different prop. Total build: ~3 person-days.

The strategic effect: the changelog is the public proof that Beamix is the category-leader. It is also the trust artifact procurement teams cite ("they ship every week and document it"). It is also the organic-growth flywheel — every entry is a tweet, every tweet is a customer.

This is the single missing artifact. Ship it before launch.

---

## F — Direct response to Round 1 legends

**Rams says kill the Margin.** Agree, with sharper rationale. Linear has zero ornamental columns in any of its tables. The closest Linear comes to a "margin glyph" is the issue identifier ("ENG-2387") in Geist Mono — which carries data weight, not ornamental weight. The Margin's 24px-wide accumulating Rough.js circles encode "which agents touched this row" in colors no user will learn (Tufte and Kare both confirm). Cut it. Recover 24px for engine-coverage micro-charts (per Tufte's Section C, Opportunity 1). Use the activity log for "which agents touched this." Use the row expansion for "what they did." The Margin is decoration with a backstory.

**Ive says delete the Workflow Builder dot grid.** Agree on diagnosis, disagree on prescription. Ive proposes "nothing — let the cream paper carry the canvas." Linear would do something different: Linear's automation canvas (and Linear's projects timeline) ship on a flat ink-1 surface, no grid, no texture, no paper. The visual signal is *the nodes themselves* and *the edges between them*. The canvas is not a "page" — it is a void that the user fills with structure. Ship Beamix's Workflow Builder canvas as a flat `--color-paper` (white) field, no dot grid, no cream wash. Snap-to-grid stays as invisible math (24×24 internal, never rendered). Save the cream paper for the trigger node and the Brief-grounding inspector cell — those are the moments the canvas earns the register-shift. The void in between is white. This is Linear-grade. The category-default dot grid is Figma-canvas reflex; Linear refuses it; Beamix should too.

**Tufte says ship the AI Visibility Cartogram.** Linear-grade move, ship it. Linear has no equivalent because Linear is not in a data-visualization category — but if Linear had a chart that compressed an entire competitive landscape into one image, they would ship it as the OG card factory. The cartogram is exactly that. 50 queries × 11 engines = 550 cells, color-coded, 1-character glyph per cell, ~880×600px single image. It becomes the page Sarah and Yossi screenshot. It becomes the page procurement reviewers cite. **Ship it on /scans/[scan_id], in the Monthly Update PDF, and as a public OG card on /scan/[token]/og-image.png.** This is the Tufte move that turns Beamix from "another GEO dashboard" into "the GEO dashboard." Linear would champion it.

**Kare says unified 2-letter monogram system.** Disagree, with Linear's discipline. Linear's icon set is **label-only** for almost all UI surfaces — agent attribution in Linear's automations panel is the agent name in 13px Inter 500, no avatar, no monogram, no color block. The label is the identity; the icon is decoration. Beamix should do the same for /inbox, /home, /scans, and the Workflow Builder canvas — agent name in 13px Inter 500, no monogram on the row. Save the 2-letter monogram for /crew (the introduction surface) and the Workflow Builder palette (the picker). Two surfaces, total. Everywhere else: name only. This kills 16 monogram instances per /home page-load, kills the cognitive load of learning 18 colors, and aligns with Linear's "the label is the identity" rule. Kare's unified 2-letter rule is correct *for the surfaces where monograms appear*; the Linear refinement is *fewer surfaces*. Engines stay as 2-letter chips (PX, GP, GM, AO) because they need a small visual marker in tight rows; agents do not.

---

## G — The Linear-grade Beamix

What Beamix looks like if shipped at Linear's quality bar today. Specific moves.

**Move 1 — Cmd+K is the universal switcher.** One palette, one shortcut, four sections (workspace · navigate · action · recent). Workspace switch lives here, not in a separate dropdown. Cmd+P does not exist. The palette opens in <80ms cold, <40ms warm, searches client-side under 500 rows, returns results as you type with no debounce. This is the spine of the keyboard-first product.

**Move 2 — `g _` two-keystroke navigation.** `g h` /home, `g i` /inbox, `g s` /scans, `g c` /crew, `g r` /reports, `g t` /settings. Mac users learn these in three sessions. After that, no one mouses to the topbar nav. The topbar nav becomes secondary chrome — visible for discoverability, never used by power users. Linear's is exactly this.

**Move 3 — Page transitions are zero.** Already in the spec (§3 line 946). Hold it. Route swaps render instantly with cached layout shells; data hydrates asynchronously with no spinners (use the previous page's data as the loading state). Linear feels different from every other SaaS because of this single rule. Beamix has it on paper; protect it in code review.

**Move 4 — `/changelog` ships before launch.** Weekly cadence, cream paper, Editorial register, OG card per entry. The product's discipline becomes public.

**Move 5 — /inbox cozy rows go to 72px.** Move diff preview to hover. Move shortcut hints to `?` overlay. Recover 40px per row, see 6 more rows above the fold, double the morning-triage throughput.

**Move 6 — Interrupt-and-collapse on burst Approve.** Yossi pressing `e e e e e` at 200ms intervals snaps each prior ceremony to its final state and starts the next optimistic UI. The Seal-draw is rare, not queued. The undo toast shows the count: "5 approved · Undo all."

**Move 7 — One unified empty state, not three.** Rams was right that the laptop-leaf Rough.js illustration on /inbox empty is decoration with a backstory. Linear's empty states are 1–2 lines of Fraunces, centered, no illustration. Apply across /inbox, /scans, /reports — one Fraunces line, one quiet Beamix attribution, no Rough.js, no figure, no chrome. The empty state is the success state; the success state is silent.

**Move 8 — `/scans` sort and filter are client-side.** Below 500 rows, no server round-trip. Tap a column header, table re-sorts in <50ms, no spinner, no skeleton. Linear's issue list does this. Beamix should match.

**Move 9 — The decision card on /home gets keyboard primacy.** Land on /home, focus is on the decision card, `Enter` expands, `e`/`r` decide. Sarah opens /home and acts without touching the mouse. This is the /home interaction Linear would design.

**Move 10 — Kill the customization knobs that cost the user a decision.** Three autonomy presets at the workspace level, not 54 per-agent toggles. One cadence-email setting (Quiet / Standard / Full), not six per-email toggles. Three configurable tabs per client, not six. The defaults are good; the user accepts them; the system is calmer.

**Move 11 — Cycle-Close as a real moment.** Ive proposes the Cycle-Close Bell. Linear has no equivalent because Linear has no cycles in this sense, but Linear's "issue closed" is a small haptic-feeling animation that hits every time. Beamix's weekly scan completing should feel like that — the Activity Ring closes its 30° gap over 800ms, the KPI sparklines settle to their final positions in 200ms, the status sentence rewrites once. Two-second curtain, no copy required. This is the single ceremony that earns its motion.

**Move 12 — Monthly Update PDF gets the AI Visibility Cartogram.** Tufte's move. The Cartogram replaces Page 4's narrative blocks. The CFO reads it in 5 seconds.

The Linear-grade Beamix ships fewer marks (kill Margin, kill walking-figure, kill score-fill animation), fewer settings (3 presets not 54 toggles), fewer surfaces (kill Cmd+P, kill /scans server-sort), and one new artifact (/changelog). The system gets smaller and faster. That is what Linear-grade means.

---

## H — Dark mode

Beamix specs light mode locked, dark mode deferred. This is defensible if Beamix's customer is exclusively Sarah at her morning desk. It is not defensible at Yossi's archetype. Yossi works late, on multiple monitors, in mixed light. Yossi's first action with any new SaaS tool is **toggle dark mode**. If Beamix doesn't ship one, Yossi opens DevTools and applies a stylesheet hack within his first session. That is an indignity to the product.

Linear ships dark mode at parity, not as a port. Linear's dark mode was designed in parallel with the light mode — every token has a dark-mode value, every component renders correctly, every screenshot in the changelog is taken in both modes. The dark mode is not an afterthought; it is half the product.

Beamix has the right foundation for dark mode parity — the Design System v1 specifies borders as opacity values, not hex colors (`rgba(10,10,10,0.06)` becomes `rgba(255,255,255,0.06)` in dark mode automatically; this is Rams-grade discipline). The token system is structured for the swap. The fonts are the same. The geometry is the same. What is missing: dark-mode values for `--color-paper-cream` (cream paper does not have a dark equivalent — the Editorial register collapses; Beamix needs a "warm-ink-1" register that carries the same emotional weight as cream-on-light, perhaps a #1A1612 deep warm charcoal), dark-mode values for the score color palette (`--color-score-good` etc. need to lift in saturation by ~12% to read correctly on dark), and dark-mode values for the Activity Ring (the 2px brand-blue arc on dark needs to brighten to `#5A8FFF` per the brand spec, which is correctly noted in CLAUDE.md).

The deferral cost: every changelog screenshot in light mode only; every OG card light-only; the Workflow Builder canvas (white) blinding at midnight; the Yossi-archetype customer leaving a 2-star review on G2. This is real revenue at Yossi's tier ($499/mo) where dark mode is table stakes.

The fix: design dark mode in parallel with light, ship both at MVP, screenshot both in the changelog, let the user toggle in /settings. The build cost is small — the token system is already structured for the swap. The deferral is brand-eroding.

---

## Closing — the one Linear principle Beamix is most violating

Speed-as-feature is the principle Beamix talks about most and lives least — the multi-client switcher's 1100ms target, the /home 1600ms entrance choreography, the absence of `g _` navigation, and the un-specified /scans sort latency all add up to a product that *feels* slower than its rhetoric. The fix is mechanical: 600ms switch end-to-end, instant page transitions in code review, client-side sort under 500 rows, and `g _` on every surface. Speed is the feature; everything else is decoration.
