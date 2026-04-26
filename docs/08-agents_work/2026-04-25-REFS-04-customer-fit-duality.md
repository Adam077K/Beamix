# Reference Hunt 4 — Fit-for-Customer Duality
Date: 2026-04-25
Goal: How do products serve non-technical AND power users at the same time, on the same surface, without "Pro mode" toggles?

---

## TOP 5 ANCHOR PRODUCTS

### Anchor 1 — Linear (the gold standard)
URL: https://linear.app
Non-technical PMs use the same product senior engineers swear by — calm surface, depth behind keystrokes.

**Specific design moves to copy:**
1. Multiple paths to the same action — button, contextual menu, keystroke, command palette
2. Contextual menus teach shortcuts (right-click → keystroke shown next to label)
3. Cmd+K is THE single mental model — create, search, navigate, change status
4. "Invisible details" philosophy — confidence comes from polish
5. No "advanced settings" page — power features live in context
6. `?` opens cheat sheet anywhere
7. Single letters (C, E, X) reserved for most-used actions

Sources: linear.app/changelog/2021-03-25-keyboard-shortcuts-help · medium.com/linear-app/invisible-details-2ca718b41a44 · linear.app/docs/conceptual-model

---

### Anchor 2 — Notion
URL: https://notion.so
Same product runs grandma's recipes AND F500 ops wikis.

**Specific design moves:**
1. Job-based intent at signup ("plan project / build wiki / personal tasks") → routes to template gallery
2. Templates teach by being editable — power features encountered as cells
3. One primitive (the block) scales infinitely — paragraph for novice, database for power
4. Slash command `/` as universal escape hatch
5. Advanced features tucked behind "..." menus
6. Public template marketplace — power users build, beginners install

Sources: venue.cloud/news/insights/from-signup-to-sticky-slack-notion-canva-s-plg-onboarding-playbook · medium.com/design-bootcamp/how-notion-uses-progressive-disclosure-on-the-notion-ai-page-ae29645dae8d

---

### Anchor 3 — Stripe Dashboard
URL: https://dashboard.stripe.com
First-time founder reads "Today's revenue: $1,420." F500 finance team runs Sigma queries on same data.

**Specific design moves:**
1. **Summary → detail → raw layering.** Top: "How am I doing?" Next: "Why?" Deepest: raw event JSON
2. Calm technology — no exclamation points, no "PRO TIP" badges
3. Search bar IS the navigation — Cmd+K finds charge by ID, email, or amount
4. Code snippets context-aware — devs see actual API key, founders don't see code
5. Test/live mode is the ONE acceptable mode toggle (it's about safety, not capability)
6. **Numbers are clickable** — every metric → underlying transaction list with full filters

Sources: mattstromawn.com/projects/stripe-dashboard · medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e

---

### Anchor 4 — Raycast
URL: https://raycast.com
Designers use it as launcher. Engineers use it as programmable runtime.

**Specific design moves:**
1. Reframes the verb — not "open things" but "do things"
2. Single command bar = whole product surface (no menus, no nav)
3. Extensions appear in the same list as built-ins (no "extensions panel" separation)
4. AI Commands wrap power features in natural language
5. Aliases & hotkeys are per-user (power user binds; novice never sees)
6. Quicklinks — saved URL with placeholder, weaponized for parametrized commands

Sources: raycast.com/blog · pixelmatters.com/insights/raycast-for-software-engineers

---

### Anchor 5 — Superhuman (cautionary tale + good patterns)
URL: https://superhuman.com
Busy execs use it; email-shortcut sociopaths weaponize it.

**Specific design moves to copy:**
1. `?` from anywhere → full shortcut grid
2. Cmd+K = "do anything" universal palette
3. Every action labels its shortcut on hover
4. Split Inbox = customizable view (default acceptable, custom rules available)
5. Snippets as growth-path feature (write replies → keyboard-trigger libraries)

**The cautionary lesson:** Superhuman's mandatory 30-min onboarding tells us what happens when you skip "learns by doing" — you have to teach by human. Beamix should design so we never need a Beamix coach.

Sources: download.superhuman.com/Superhuman%20Keyboard%20Shortcuts.pdf · blog.superhuman.com/the-fastest-way-to-inbox-zero-a-single-coaching-session

---

## FULL REFERENCE LIBRARY (16 products)

| # | Product | Beginner surface | Power surface | Bridge moves |
|---|---|---|---|---|
| 1 | **Linear** | "+", drag between columns | Cmd+K, single-letter shortcuts, bulk multi-select, custom views, API | Menu shows keystroke; `?` cheat sheet |
| 2 | **Notion** | Type words, drag blocks | Database properties, formulas, relations, rollups, API | Slash menu, jobs onboarding, templates, "..." advanced |
| 3 | **Stripe Dashboard** | "Today's revenue: $X" | Sigma SQL, webhook logs, raw JSON, multi-account orgs | Numbers clickable, summary→detail→raw, Cmd+K |
| 4 | **Raycast** | Cmd+Space → type → enter | TS extensions, AI commands, hotkey bindings, snippets, window manager | Extensions in same list as built-ins |
| 5 | **Superhuman** | Read email, reply | 100+ shortcuts, snippets, split inbox, follow-ups | `?` cheat sheet, every button shows keystroke |
| 6 | **Granola** | Open meeting, write notes, AI fills rest | Custom templates per meeting type, search, client folders | Looks like Apple Notes; templates auto-apply |
| 7 | **Mercury** | Balance + recent transactions | Auto-transfer rules, virtual cards, API | "Move money in 3 clicks" first; rules added on demand |
| 8 | **Things 3** | Inbox/Today/Anytime/Someday + "+" | "Type Travel" navigation, Quick Entry hotkey, areas/projects/tags | Menu commands expose shortcuts; single-keystroke nav invisible to novices |
| 9 | **Webflow** | Drag boxes, visual style picker | Full CSS control, custom JS, CMS schemas, hosting/dev pipeline | Visual editor IS the code; "show CSS" toggle exposes underlying truth |
| 10 | **Coda** | Type, add table, click "Calculate" | Hundreds of formulas, AI columns, automations, packs | Formulas read like English; chain or wrap syntax — user picks |
| 11 | **Arc Browser** | Sidebar with tabs in Spaces | Boosts (CSS/JS per site), keyboard nav, split view, command bar | Onboarding rewards little wins (gradient picking) before exposing power |
| 12 | **Apple Notes** | Type, save | `#tags` inline, Smart Folders rules, scan-doc, drawing layer | Tags activate by typing `#` (no menu); depth in URL schemes/Shortcuts |
| 13 | **Loom** | Click record, share link | Trim/edit, CTAs, branding, team library, async workflows | "Record your first Loom in seconds" — value before complexity |
| 14 | **Pitch** | Pick template, edit, present | Multi-player editing, brand systems, analytics, custom themes | Templates do the duality work |
| 15 | **Figma** | Click rectangles, type text | Auto Layout, Variants, Variables, Components, Plugin API, Dev Mode | Built-in contrast checker; Auto Layout sensible defaults; Dev Mode on demand |
| 16 | **Notion Calendar** | Click to add event | Cmd+K palette, multi-cal overlay, time-zone, scheduling links | Cmd+K does everything; aggressive defaults |

---

## THE 12 DUALITY PRINCIPLES

### 1. Sensible defaults that 80% accept without thinking
The system makes a confident choice. Power users override. Beginners never know an override exists.
*Example:* Mercury auto-categorizes transactions; the dentist accepts; agencies build rules.

### 2. Power moves discoverable through interaction, not settings
You discover depth by clicking the thing in front of you, not by opening settings.
*Example:* Linear right-click → menu shows keystroke. The interaction teaches the power move.

### 3. Plain-language surface, technical truth one layer deeper
Top label says "Visibility score: 42." Click → "Mentioned in 31% of relevant queries." Click → raw query log per engine.
*Example:* Stripe Dashboard's revenue → transaction list → raw event JSON.

### 4. Templates for the new user, raw canvas for the expert
Not a separate product. The template *is* the canvas, pre-filled.
*Example:* Notion's onboarding asks "what are you doing?" → drops working template → editing reveals databases.

### 5. One universal command (Cmd+K) is the entire app's escape hatch
Single keystroke that does everything. Beginners never need it; experts live in it.
*Example:* Linear, Raycast, Stripe, Notion Calendar all use this.

### 6. Empty states teach by doing, not lecturing
Empty page = working example with clear CTA, NOT a tutorial popup.
*Example:* Linear's empty Projects view shows the kind of work + "New issue" primary + "New document" secondary.

### 7. Multiple paths to the same action — discover via clicking, master via keyboard
Every action reachable 3+ ways: button, menu, shortcut, palette.

### 8. Keystroke is shown next to the click target
Button says "Archive" — and "E" floats next to it. Repeated exposure subliminally teaches.
*Example:* Superhuman, Linear, Things 3 menus.

### 9. The `?` key is sacred — it shows what the app can do
Press `?` from anywhere → full shortcut/command grid. Single discoverability lever for power.

### 10. Numbers and pills are clickable — they drill into reality
Every aggregate is a query into the underlying data.
*Example:* Stripe, Linear (status pill click → bulk filter view).

### 11. No jargon on the front lawn — technical truth one click away
Home view uses customer language ("Top fix"). Deeper view uses precise terms ("FAQPage schema, JSON-LD"). Translation is the product's job.

### 12. Onboarding is "your first win in 60 seconds"
Never "let me show you around." One action that produces real value.
*Example:* Loom's "Record your first Loom in seconds"; Granola joining a real meeting in your first session.

---

## BEAMIX-SPECIFIC RECOMMENDATIONS

### The Two Personas

**Sarah (52, dentist, 2-chair practice in Tel Aviv) sees:**
```
Beamix Score: 42 / 100  ↑ +6 vs last week
[Run top 3 fixes — 14 credits]   [See what's broken]
```
One number, one button, one outcome. Done. Inbox shows results when fixes complete.

**Yossi (SEO consultant, 20 client domains) sees the same screen, then clicks:**
```
Per engine:
  ChatGPT     38 ████░░░░░░  72/180 mentions
  Gemini      45 ████░░░░░░  85/188
  Perplexity  40 ████░░░░░░  76/190
  Claude      51 █████░░░░░  98/192
  AI Overviews 39 ████░░░░░░ 74/191
  Grok        42 ████░░░░░░  79/188
  You.com     44 ████░░░░░░  82/186
  [click any engine → query-level data]

Top 23 recommendations [select all] [run selected]
  ☐ Add FAQ schema to /services       ✦ +8 score est.   [Run] [Edit]
  ☐ Improve location data             ✦ +5              [Run] [Edit]
```
**Same product. Same screen. Yossi just clicks deeper.**

### 5 Specific Beamix Design Moves

1. **The Beamix Score is a clickable number.** Sarah sees 42; Yossi clicks the 42 to drill into 9-engine breakdown → query-level → raw model output. **No "Pro mode" toggle.** Depth is one click deep.

2. **Cmd+K is the universal action palette.**
   - For Sarah: discoverable through onboarding hint. She probably never uses it.
   - For Yossi: Cmd+K → "run agent" / "find competitor" / "go to scan #123" / "approve top 5." Entire workflow in one keystroke.

3. **Recommendation cards = "Run" CTA + collapsible "Show details" disclosure.**
   - Sarah clicks Run. Done.
   - Yossi clicks "Show details" → per-engine impact, raw recommendation, edit field, agent assignment.

4. **Industry-tuned scan profiles as templates.**
   - Sarah picks "Dental practice" → preloaded queries + FAQ schema preset + local-business defaults.
   - Yossi picks "Custom" → blank slate, raw query list, configurable schemas, custom engines.
   - Same dropdown contains presets AND "Custom."

5. **Numbers, pills, charts are all clickable. No "Advanced settings" page anywhere.**
   - Score 42 → 9-engine breakdown
   - Engine pill (e.g., "Gemini") → query-level data
   - Competitor name → competitor profile
   - Recommendation badge → recommendation detail with edit + run

### Keyboard shortcuts Beamix should ship from day 1

Adopt Linear's letter convention:
- `Cmd+K` — universal palette
- `?` — shortcut cheatsheet overlay
- `R` — run a recommendation (when focused)
- `A` — approve (selection)
- `S` — start scan
- `G then S` — go to Scans page
- `G then I` — go to Inbox
- `G then C` — go to Competitors
- `/` — focus search
- `J` / `K` — next / previous in list
- `Cmd+Enter` — run/approve focused action

**Rule:** Single letters reserved for the 5-7 most-used actions. Document via `?` overlay. Show keystroke next to every relevant button.

### Templates vs raw canvas matrix

| Surface | Template | Raw |
|---|---|---|
| Industry profile | Dental, Restaurant, Law firm, etc. | "Custom" — paste own queries, choose schemas, pick engines |
| Recommendation flow | "Top 3 fixes — 1-click run" | Full list, bulk select, edit before run, schedule |
| Reporting | "Monthly summary email" auto-on | Per-engine, per-query exports, scheduled webhooks (Build/Scale) |
| Competitor tracking | Top 5 auto-detected | Add/remove/edit, query-level competitor diffing |

---

## ANTI-PATTERNS

1. **Two separate products** ("Beamix Lite + Beamix Pro") — splits brand, doubles maintenance, novice can't grow into Pro without re-learning.
2. **"Beginner / Advanced" mode toggle** — hides UI based on a setting the user has to understand to flip.
3. **Tooltip-driven UI** — if the label needs a tooltip, the label is wrong.
4. **Settings panel that requires understanding to configure** — replace with industry preset (1 click) + "Customize" button.
5. **Wizards that block the power user** — must be skippable AND one-time-only per account.
6. **Per-engine rendering as 9 separate tabs** — replace with one summary view + click engine pill to drill.
7. **"PRO" badges on power features** — tells novice they're missing something; tells expert they're paying. Show "Upgrade to Build/Scale" inline at moment of attempt, not as locked-out icons.
8. **Hidden complexity revealed by surprise** — drill-downs must remain explainable; first heading on deeper page describes content in customer language.

---

## CONFIDENCE: HIGH for design patterns; MEDIUM for Beamix-specific recommendations.

Every principle is supported by 2+ products. Beamix recommendations are derived analogies and should be validated with 5 dentist + 5 SEO-consultant interviews before locking design.

## Key sources
- linear.app/changelog/2021-03-25-keyboard-shortcuts-help
- medium.com/linear-app/invisible-details-2ca718b41a44
- venue.cloud/news/insights/from-signup-to-sticky-slack-notion-canva-s-plg-onboarding-playbook
- mattstromawn.com/projects/stripe-dashboard
- raycast.com/blog/how-raycast-api-extensions-work
- download.superhuman.com/Superhuman%20Keyboard%20Shortcuts.pdf
- nngroup.com/articles/modes/
- nngroup.com/articles/progressive-disclosure/
- useronboard.com/onboarding-ux-patterns/sensible-defaults
