# Design Variants — Ground-Up Exploration
*Design Lead · 2026-04-20 · No Pencil MCP — ASCII blueprints + prose direction only*

Cross-ref: `02-VISUAL-DIRECTION.md` (evolutionary token patch, Batch 1), `01-RESEARCH-SYNTHESIS.md` (reference teardowns)

---

## Framing: What Batch 1 Does vs. What This Doc Does

Batch 1 (Wave 3, running in parallel) patches token gaps: card-radius 20px→12px, container widths, gap-8→gap-5, consequence copy. It improves the current direction without rethinking it.

This document asks a different question: **What if we threw out the shell and redesigned from a clear aesthetic principle?** These three directions are not variations of the same product. They are three distinct worldviews. Adam picks one (or mixes per-page). Implementation workers then execute against the chosen spec.

---

## 1. Three Design Directions

---

### Direction A — "Monochrome Command"

**Aesthetic principle:** Zero chrome, maximum signal. The dashboard is a terminal that happens to be beautiful. Pure #0A0A0A text on #FFFFFF, one blue accent used with surgical precision — never decorative. Typography does all the hierarchy work: Inter 400 for data, InterDisplay 500 for section labels, Geist Mono for every number. No gradients. No shadows. No card borders unless they carry functional meaning. Borders replaced by `divide-y` and negative space.

**Color mode:** Light-only (but designed to feel dark-brained — density, precision, restraint)

**Typographic system:**
- Data numbers: Geist Mono 15px tabular-nums, #0A0A0A
- Section labels: InterDisplay 500 11px uppercase tracking-widest, #6B7280
- Body copy: Inter 400 14px, #0A0A0A
- Page headings: InterDisplay 500 20px, tracking -0.5px
- Accent labels (live, active states): #3370FF only

**Density:** 9/10 — cockpit mode. Every pixel justifies itself.

**Chrome level:** Near-zero. Cards exist only for modals and settings. Dashboard surfaces use `divide-y border-[#E5E7EB]` rows and section headers with top-border only. No rounded corners on data surfaces (rounded-sm max, 4px, for badge elements only).

**Inspiration sources:**
- Linear (linear.app) — issue list, keyboard-first, monochrome, zero decorative chrome
- Vercel dashboard — deployment rows, status dots, monospace commit hashes
- Stripe Radar — 48px rows, status indicators, zero card boxes in list views
- Raycast (raycast.com) — command palette aesthetic, keyboard shortcut density
- Tuple (tuple.app) — extreme restraint, black/white + one accent

**Brand fit note:** #3370FF is already correct for this direction. Inter/InterDisplay are exactly right. Fraunces would be used only in one place: the Workspace page content body (where users read/edit long-form agent output).

---

### Direction B — "Signal Blue"

**Aesthetic principle:** The product is a financial-grade intelligence platform. It looks like the tools that manage serious money — Ramp, Brex, Stripe Dashboard, Bloomberg Anywhere lite. Dense data, strong color, generous use of the blue accent across status indicators, charts, and progress bars. Cards exist and have clear structure. The user feels like they're looking at a real instrument, not a demo.

**Color mode:** Light primary, dark mode supported (same design language)

**Typographic system:**
- Data numbers: Inter 600 18px+ for hero KPIs, Geist Mono 13px for table cells
- Section labels: Inter 500 12px, uppercase, #6B7280
- Body copy: Inter 400 14px, #0A0A0A
- Page headings: InterDisplay 600 24px, tracking -0.8px
- Accent: #3370FF used at 15-20% of UI surface area (charts, progress fills, active nav, unread dots, CTA buttons)

**Density:** 7/10 — information-rich but never claustrophobic

**Chrome level:** Medium. Structured card containers with `rounded-xl` (12px), `border border-[#E5E7EB]`, `shadow-none`. Card headers use a `bg-muted/30` inset strip (`p-3 border-b`) for section label + action row. Tables still use `divide-y`, not individual row cards.

**Inspiration sources:**
- Ramp (ramp.com) — KPI strip with large numbers, feed layout with status dots, blue fill on progress
- Brex (brex.com/product) — financial dashboard confidence, structured cards, clear hierarchy
- Mixpanel (mixpanel.com) — chart-forward, side-panel filters, segmented data
- Ahrefs Brand Radar (ahrefs.com/brand-radar) — direct category competitor, platform-indexed metrics
- Statsig (statsig.com) — metric cards with trend arrows, experiment-table rows

**Brand fit note:** This direction leans into the #3370FF most aggressively. The brand description ("authoritative, direct") matches the financial-tool confidence. The risk: can feel heavy or enterprise-cold for Israeli SMB users. Mitigated by keeping copy warm and direct.

---

### Direction C — "Warm Document"

**Aesthetic principle:** The product feels like a smart workspace, not a dashboard. Inspired by Notion, Craft, and Attio — content-first, breathing room, the UI recedes so the data can lead. Cards are content blocks, not data containers. Typography is the primary design element. The sidebar is minimal. Every page feels like a well-structured document, not a control panel.

**Color mode:** Light. Warm-leaning whites (#FAFAFA vs pure #FFFFFF). No dark mode needed.

**Typographic system:**
- Data numbers: Inter 500 16px for inline numbers, tabular-nums only in dense tables
- Section labels: Inter 400 12px, #9CA3AF (lighter than brand default muted)
- Body copy: Inter 400 15px, line-height 1.6, max-w-[68ch]
- Page headings: InterDisplay 500 22px, #0A0A0A, tracking -0.3px
- Accent use: #3370FF on links, active states, unread indicators only — never fills
- Agent output in Workspace: Fraunces 300 16px, warm feel for long-form text

**Density:** 5/10 — focused density per section, not across the full viewport

**Chrome level:** Low-medium. Cards exist as `bg-white border border-[#F0F0F0] rounded-xl` — very soft borders, almost imperceptible. The hierarchy comes from typography scale and indentation, not box separation.

**Inspiration sources:**
- Notion (notion.com) — block editor model, toggle-based hierarchy, content-first layout
- Craft.do (craft.do) — warm white backgrounds, generous spacing, document feel
- Attio (attio.com) — structured but approachable, CRM that feels human
- Superhuman (superhuman.com) — keyboard-first inbox, content-as-primary, controls at edges
- Linear's Project pages (not issue list) — document header + collapsible sections

**Brand fit note:** The Fraunces usage (locked to Workspace agent output) gives this direction a distinctive warmth that competitors completely lack. The risk: lower data density may feel "less professional" to power users who want cockpit density. Mitigated by still applying dense table patterns inside pages (just with more whitespace between sections).

---

## 2. Per-Page Variant Table

**Pages:** Home, Inbox, Workspace, Scans Drilldown, Competitors, Automation
**Format per cell:** What changes from current | What's unique to this direction | 1 reference screen

---

### Home

| Direction | What changes from current | Unique to this direction | Reference |
|-----------|--------------------------|--------------------------|-----------|
| **A — Monochrome Command** | Container expands to full-width 2-col layout. Sticky strip uses borderless text-only KPIs. ScoreHero replaced by a large tabular number (`71`) with a delta line below in Geist Mono. No card borders on KPI row. | The score is a raw number, not a ring — treating it like a stock price. Engine coverage shown as `4/5` inline text, not visual chips. Aside is a pure list with `divide-y`, no card wrapper. | Linear Projects overview — number-forward, monospace delta, zero decoration |
| **B — Signal Blue** | Full-width 2-col layout. Sticky KPI strip with #3370FF fill on score delta. ScoreHero keeps the ring but ring fill is a strong blue. KPI cards get `bg-white border rounded-xl` with a card header strip. | Blue fill progress bars in the aside (credits, automation status). Charts use #3370FF primary line, gray comparison lines. The product reads like a financial instrument. | Ramp dashboard — KPI strip with fills, structured card containers, blue accent |
| **C — Warm Document** | Container narrows to 960px centered. Score ring stays but at a smaller 64px. Section headings use generous top-margin (`mt-8`) creating document-like breathing. | The ScoreHero has a subtitle in Fraunces italic: *"Your AI visibility snapshot"* — the only product surface with Fraunces (not Workspace). Creates brand differentiation at first glance. | Notion page header — centered, generous margin, section-per-block feel |

---

### Inbox

| Direction | What changes from current | Unique to this direction | Reference |
|-----------|--------------------------|--------------------------|-----------|
| **A — Monochrome Command** | 3-pane Superhuman layout (`260px / 1fr / 300px`). List pane uses `divide-y`, no card boxes. Unread state: left `border-l-2 border-[#3370FF]` on row. Keyboard strip at bottom-left in Geist Mono. | Inbox items show "impact estimate" in Geist Mono right-aligned — a raw number: `+8 pts`. Previewed item has a zero-chrome content pane: plain prose, action buttons at very bottom. | Superhuman inbox list — keyboard shortcuts, minimal decoration, left-border unread |
| **B — Signal Blue** | Same 3-pane layout. Unread dot is a `#3370FF` filled 8px circle. Evidence pane has a structured blue-header label block. | Evidence pane shows a "predicted impact" progress bar in blue fill (`+8 pts → 71→79`). Makes the agent suggestion feel like a financial projection. | Ramp transaction detail — structured evidence, amounts as primary element |
| **C — Warm Document** | List pane is narrower (240px). Items are more spaced (py-4 instead of py-3). The content pane leads with the agent's output in a large text block — reading it feels like reading a document, not reviewing a ticket. | The suggestion header shows the agent's "reasoning" in italic — a brief sentence before the actual content. Creates warmth: the AI explains itself. | Notion AI response block — explanation before action, document-first |

---

### Workspace

| Direction | What changes from current | Unique to this direction | Reference |
|-----------|--------------------------|--------------------------|-----------|
| **A — Monochrome Command** | Editor pane is pure textarea, `font-mono text-[14px] leading-relaxed`. Diff view uses only strikethrough vs. normal weight (no red/green). Aside is a plain `dl` list with no card wrapper. | The edit history at the bottom of the aside shows a compact timeline: `Apr 19 14:32 — AI draft`, `Apr 19 14:40 — User edit` in Geist Mono 11px. | Vercel build logs — monospace, event timeline, minimal chrome |
| **B — Signal Blue** | Editor pane uses `bg-white rounded-xl border p-6`. Diff view shows red/green highlight fills. The "Approve" button is a strong `bg-[#3370FF] text-white` pill. | The aside has a "Projected impact" card with a before/after score bar: `71 → 79` shown as a filled blue progress bar. Makes approval feel consequential. | Brex transaction approval — action card with projected outcome |
| **C — Warm Document** | Editor is the widest of three directions — 800px content column. Agent output renders in Fraunces 300 16px (the only place in the product). Aside is minimal: agent name, date, word count. | Approving content triggers a subtle paper-fold-out animation on the content block — it collapses and "files away" into the Inbox. The interaction is warm and satisfying. | Craft.do document acceptance — visual confirmation, content-first feel |

---

### Scans Drilldown

| Direction | What changes from current | Unique to this direction | Reference |
|-----------|--------------------------|--------------------------|-----------|
| **A — Monochrome Command** | Engine breakdown as 5 text rows in a single `divide-y` table, not visual cards. Engine name | rank | mention status | citation status | sentiment — all Geist Mono. Score as raw number in the KPI strip only. | The engine "score" per platform is a raw rank number (`#2`) not a colored badge. The entire page reads like a structured report. Scan metadata aside is a plain list. | Vercel deployment detail — structured rows, mono hash+timestamp, no visual flair |
| **B — Signal Blue** | Engine cards stay as cards (`rounded-xl border`) but with a blue-outlined "cited" badge and a blue-fill mention bar. The KPI strip leads with Score in a large `text-4xl font-semibold text-[#3370FF]`. | A "competitor gap" callout above the engine table: blue left-border callout block reading "CompetitorA outranks you on 3 of 5 engines — [Fix with Agents →]". Direct diagnosis with a CTA. | Ahrefs Brand Radar engine breakdown — platform cards, citation indicators |
| **C — Warm Document** | Engine breakdown is a 2+3 card grid but cards have `bg-[#FAFAFA] border-[#F0F0F0]` — almost invisible borders. Score shown as `71/100 · Good` in a small badge. The tone is analytical, not alarming. | The query table below has a `max-w-[68ch]` query column — queries wrap naturally as full sentences, making them readable rather than truncated data. | Profound query drilldown — full query text, readable prose format |

---

### Competitors

| Direction | What changes from current | Unique to this direction | Reference |
|-----------|--------------------------|--------------------------|-----------|
| **A — Monochrome Command** | SoV chart is a pure line chart, #3370FF your line, `#E5E7EB` competitor lines, no fills, no axis labels beyond the Y-axis numbers. Competitor table uses `divide-y`, engine presence shown as `✓` / `—` in Geist Mono. | Your brand row is not highlighted with color — it's highlighted by being the FIRST row, with a `font-medium` weight difference. The restraint signals confidence. | Linear team member table — first row is "you," minimal decoration |
| **B — Signal Blue** | SoV chart has a subtle `#3370FF` fill under your line (opacity 10%). Each competitor row shows a color-coded SoV percentage bar in the SoV cell — blue for you, gray for others. | A header callout above the competitor table: blue card showing `Your SoV: 34% | Market Leader Gap: -7pp | Opportunity: 2 missed engines`. Designed to feel like a Bloomberg terminal brief. | Ramp spend analysis — color fills, percentage bars in cells, header summary |
| **C — Warm Document** | SoV chart is simpler — just your line and a flat gray band for the competitor average. The competitor table has more vertical padding (`py-4` rows) and the engine heatmap is done with emoji-like `●` and `○` — editorial, not technical. | The aside shows a "Weekly insight" written in 2 sentences of plain prose (generated by AI): "You gained 3pp on Perplexity this week. CompetitorA remains dominant on ChatGPT — your FAQ content may help." | Notion insight block — prose before data, human voice |

---

### Automation

| Direction | What changes from current | Unique to this direction | Reference |
|-----------|--------------------------|--------------------------|-----------|
| **A — Monochrome Command** | Agent rows use `divide-y` table with no card borders. Status is a 6px dot (`bg-[#10B981]` or `bg-[#E5E7EB]`). Kill switch is a plain `<Switch>` in the header. Credits: plain text `34/100 used · resets May 1`. | The cadence selector is inline in the row: `Weekly ▸` as a plain underlined text trigger (not a Select component) — clicking it reveals a floating popover. Ultra-low-chrome pattern. | Linear agent settings — inline controls, minimal chrome, monospace status |
| **B — Signal Blue** | Credits bar is a prominent blue fill bar at the top: `████████░░░░░░░` with `34%` label. Agent rows have status badges with colored backgrounds: `bg-[#DCFCE7] text-[#166534]` for live. Kill switch is prominent — labeled "Emergency Stop" in red-tinted text. | Each running agent shows a blue "last output" timestamp in the row: `2h ago ·` then a truncated output preview. You can see what's running and what it produced without clicking. | Ramp scheduled payments — status fills, last-run previews, action-oriented rows |
| **C — Warm Document** | Agents are presented as "team members" — each has a brief description line below their name. "Content Optimizer — improves page copy for AI citability." This makes the product feel like you're managing an actual team. | The credits section is framed as a monthly "budget" narrative: "You've used 34 of 100 agent runs this month. At this pace, you'll finish with 42 unused." Consequence + projection. | Superhuman AI setting — agent description, human voice, context over data |

---

## 3. Recommendation

**My opinionated pick: Direction A (Monochrome Command) as the default, with Direction C reserved for Workspace.**

Here is the case:

**Direction A fits the product's actual job.** Beamix's core value is signal — specific, actionable competitive intelligence. The user needs to see what's wrong and act on it. Chrome, gradients, and structural decoration dilute that signal. Linear built the most beloved B2B product of the last 5 years on this exact principle: zero decoration, maximum clarity. Beamix's competitive strength (agents that do the work) is better served by a product that feels like it takes itself seriously.

**Direction B is the tempting wrong answer.** The financial-tool confidence is real. But blue fills and structured card headers are visual debt — every pixel of decoration requires maintenance, fights with content, and ages within 18 months. The current product (criticised as "AI slop") is already overdecorated. Adding more structure and color won't fix it. Direction A's restraint is harder to achieve but more durable.

**Direction C's warmth belongs only in Workspace.** The Fraunces serif rendering of agent output, the document-like breathing room, the approachable tone — all of these are right for the moment when a user is reading and editing AI-generated content. But they're wrong for the Home dashboard, Scans drilldown, and Automation page, where the user is in scan-and-act mode, not read-and-think mode.

**Per-page recommendation:**

| Page | Direction | Why |
|------|-----------|-----|
| Home | A | Dense KPI strip, monochrome authority. No decoration. |
| Inbox | A | Superhuman-grade list. Keyboard strip. Raw impact numbers. |
| Workspace | C | Agent output in Fraunces. Document feel. This is where warmth earns trust. |
| Scans Drilldown | A | Data is the hero. Engine rows as structured `divide-y` table. |
| Competitors | A | SoV numbers need precision, not color fills. The restraint signals confidence. |
| Automation | B (partial) | Credits bar benefits from the blue fill — visualizing "budget spent" is a financial-tool moment. Otherwise A. |

**Mixed approach is not a compromise — it's intentional.** The product has two emotional registers: "analysis mode" (A) and "creation mode" (C). Letting Direction A govern 5 pages and Direction C govern Workspace creates a meaningful UX shift when users move from reviewing intelligence to editing content.

---

## 4. What Adam Needs to Provide to Go Deeper

- **Screenshots of 3-5 products you open daily** (not "for inspiration" — literally: what dashboards do you look at when making business decisions). This tells me which end of the density-warmth spectrum feels natural to you.

- **One sentence about your target user's mental model.** Is the Discover plan SMB owner "checking in on their business like they check a bank app" (Direction B) or "reviewing agent work like reviewing a contractor's draft" (Direction C)? This single sentence changes the answer.

- **Dark mode or light mode as default?** Direction A works best in light mode (black-on-white is a statement). Direction B wants dark mode. This is a real decision, not aesthetic.

- **Do you want the "Warm Document" feel in Workspace, or does it feel too editorial/soft for your users?** If SMB owners feel more comfortable with structured cards (Direction B) than editorial document layouts (Direction C), the Workspace recommendation flips.

- **Which competitor UI do you hate most — and why?** If it's "Ahrefs Brand Radar feels cold and enterprise-alien" → Direction C has more weight. If it's "Notion feels too casual/consumer for a paid B2B tool" → Direction A has more weight.

- **Is Hebrew UI in scope for Wave 4?** RTL layout changes every grid decision. If yes, Direction A (pure `divide-y` tables) is the most RTL-safe. Direction B (structured cards with header strips) needs more rework for RTL.

---

## 5. Research References

| # | Product | Page type | URL | Direction | What it teaches |
|---|---------|-----------|-----|-----------|-----------------|
| 1 | Linear | Issue list | https://linear.app | A | `divide-y` rows, 48px height, monochrome, keyboard shortcuts in status bar. The gold standard of dense-but-humane B2B UI. |
| 2 | Vercel | Deployment list | https://vercel.com | A | Status dots + monospace commit hashes + relative timestamps. Zero card boxes in list views. Confidence through restraint. |
| 3 | Stripe Radar | Transaction list | https://stripe.com/radar | A | 48px rows, status badge (left-aligned), amount right-aligned in tabular-nums. Monochrome base + single accent. |
| 4 | Raycast | Extension store | https://raycast.com | A | Command-palette aesthetic at dashboard scale. Keyboard shortcuts as first-class UI. Extreme density without feeling cluttered. |
| 5 | Ramp | Expense dashboard | https://ramp.com | B | KPI strip with large numbers, blue fill progress bars, structured card containers with header strips. Financial confidence. |
| 6 | Brex | Spend analytics | https://brex.com | B | Color-coded SoV-like bars, strong hierarchy in structured cards, bold accent usage. Enterprise financial confidence. |
| 7 | Ahrefs Brand Radar | AI visibility dashboard | https://ahrefs.com/brand-radar | B | Direct category competitor. Platform-indexed KPI cards, engine breakdown per platform, competitive benchmarking. The "before" we improve on. |
| 8 | Notion | Project overview | https://notion.com | C | Content-as-blocks, generous spacing, the UI recedes behind the content. Toggle hierarchy. Document-first layout. |
| 9 | Attio | Contact record | https://attio.com | C | CRM that feels human. Structured aside panel, warm white backgrounds, content leads data. Good model for Workspace aside. |
| 10 | Superhuman | Inbox | https://superhuman.com | A/C | 3-pane layout with keyboard strip at bottom. List rows without decoration. Content pane is document-like. Bridge between A and C for Inbox. |
| 11 | Craft.do | Document view | https://craft.do | C | Warm white, generous line-height, serif accent for display, blocks that feel physical. The closest existing product to what Workspace could become. |
| 12 | Profound | Query drilldown | https://www.profound.ai | B | Enterprise GEO competitor. Per-prompt analysis, sentiment column, citation source list. Functional model but visually dull — Beamix can be this good + designed. |
| 13 | PostHog | Insights view | https://posthog.com | B | Chart-forward analytics. Filter strip above chart, table below, structured card for each insight. Dense but clear. Good model for Scans drilldown. |
| 14 | Tuple | App dashboard | https://tuple.app | A | Extreme restraint: just typography and one accent. Proves you don't need decoration if your information hierarchy is airtight. |
| 15 | Statsig | Metrics dashboard | https://statsig.com | B | Metric cards with `▲/▼` trend arrows, experiment rows in `divide-y` tables, one accent color. Good model for Home KPI strip variant B. |

---

## Appendix: ASCII Sketches — Home in Each Direction

### Direction A — Home (Monochrome Command)

```
┌────────────────────────────────────────────────────────────────────────┐
│  GEO Score   Citations   Coverage    Rank                               │  (sticky 48px, all text-only, divide-x border-[#E5E7EB])
│  71  ▲+4     23 this wk   4/5         #2                               │
└────────────────────────────────────────────────────────────────────────┘
                                                                          
┌──────────────────────────────────────────┐  ┌───────────────────────┐
│  71                                       │  │ INBOX                 │
│  15px text-[#6B7280] tracking-widest mono │  │ ─────────────────── │
│  "GEO SCORE · APR 20"                    │  │ ● FAQ update ready   │
│                                           │  │   2 hrs ago          │
│  ChatGPT #1  Gemini #3  Perplexity #2    │  │ ─────────────────── │
│  Claude  #4  Grok   —                    │  │ ● Competitor moved   │
│  (5 plain text rows, divide-y)            │  │   yesterday          │
│                                           │  ├───────────────────── │
│  SUGGESTIONS                             │  │ AUTOMATION            │
│  ─────────────────────────────────────── │  │ 3/11 running          │
│  · Update FAQ schema          +8 pts     │  │ 34/100 runs used      │
│  · Add ChatGPT citation fix    +5 pts     │  │ resets May 1          │
│  · Claim Google Business       +4 pts     │  └───────────────────────┘
└──────────────────────────────────────────┘  
```

---

### Direction B — Home (Signal Blue)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ●  GEO SCORE     CITATIONS    COVERAGE     YOUR RANK                    │  (sticky 48px, blue dot on Score)
│     71 ▲+4 ██    23 this wk    4/5 ████░    #2 of 4                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐ ┌────────────────────────────────────┐
│ SCORE OVERVIEW                   │ │ INBOX PREVIEW                      │
├──────────────────────────────────┤ ├────────────────────────────────────┤
│  ◉ 71                           │ │ ● FAQ Agent output ready  [Review→] │
│  prev: 67  delta: +4             │ │ ● Competitor gained on Gemini       │
│  ███████████████░░░░░  71%       │ ├────────────────────────────────────┤
│  [Sparkline 160px wide]          │ │ AUTOMATION STATUS                  │
│                                  │ │ ████████░░░░░░░  34/100 runs       │
│ ENGINE BREAKDOWN                 │ │ 3 of 11 agents running             │
├──────────────────────────────────┤ │ Next reset: May 1                  │
│ ChatGPT   ● Cited    Rank #1     │ └────────────────────────────────────┘
│ Gemini    ● Cited    Rank #3     │
│ Perplexity● Cited    Rank #2     │
│ Claude    ● Mentioned Rank #4    │
│ Grok      ○ Not found  —        │
└──────────────────────────────────┘
```

---

### Direction C — Home (Warm Document)

```
                          ┌────────────────────────────────────────────┐
                          │  ● 71                                       │
                          │  Your GEO score this week.                 │
                          │  Up 4 points from last scan.               │
                          │                                             │
                          │  You appear on 4 of 5 AI engines.         │
                          │  Grok hasn't indexed you yet.              │
                          │                                             │
                          │  ChatGPT: #1  ·  Perplexity: #2           │
                          │  Gemini: #3   ·  Claude: #4               │
                          │                                             │
                          │  ─────────────────────────────────────     │
                          │  3 agent suggestions waiting for you:       │
                          │                                             │
                          │  → Update your FAQ schema to add voice      │
                          │    search structure. Estimated +8 pts.     │
                          │  → Add a ChatGPT citation fix to your      │
                          │    main product page. +5 pts.             │
                          │                                             │
                          └────────────────────────────────────────────┘
```

---

*Design variants document complete. Recommendation: Direction A for 5 pages, Direction C for Workspace, Direction B credits bar for Automation. Pending Adam's feedback before round 2.*
