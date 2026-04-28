# `/crew` — Design v1

**Author:** Senior Product Designer (power-user surfaces)
**Date:** 2026-04-27
**Status:** Design proposal, ready for build-lead estimation
**Source of truth references:**
- `docs/08-agents_work/2026-04-26-FRAME-5-v2-FULL-VISION.md` (locked)
- `docs/08-agents_work/2026-04-26-BOARD3-seat-1-architect.md` (Agent Runtime — L2)
- `docs/08-agents_work/2026-04-26-BOARD3-seat-2-designer.md` (the visual system; **design source of truth**)
- `docs/08-agents_work/2026-04-26-BOARD3-seat-3-domain-expert.md` (the 18 agents)

**Scope of this document.** Pixel-precise spec for `/crew`, the orchestration / customization / Workflow Builder surface that justifies the $189–$499 price tier for tech-native customers (B2B SaaS founders + e-commerce operators per Q1; agency operators per Yossi archetype). 10 sections, ~10,000 words.

---

## 1. The /crew page philosophy

**Who's here.** /crew is the surface that, externally, the rest of Beamix pretends doesn't exist. Outside /crew the product speaks single-character: *"Beamix did this," "Beamix recommends," "Beamix is working."* Inside /crew, the curtain comes off. The 18 specialized agents are visible by name, with monograms, autonomy controls, custom instructions, schedules, and audit trails. Three populations live here:

1. **Yossi (primary, 80% of /crew sessions).** Agency operator running 5–25 client subscriptions on Scale. Knows what a DAG is. Has used Zapier, n8n, Make. Wants to build per-client workflow packs and resell them. Visits /crew daily, often as his first stop after `/inbox`.
2. **Tech-native founder (secondary, 18%).** SaaS or e-commerce operator (Q1 wedge). Comfortable with technical UI. Doesn't *need* /crew — Beamix's autonomous defaults work — but visits /crew because he wants to *see how the sausage is made* and pin custom instructions ("Don't change service-area pages," "Always use formal tone for health claims"). Visits weekly.
3. **Sarah (rare, 2%).** SMB owner — home services / local healthcare. Visits /crew once during onboarding out of curiosity ("what *are* these agents?"), maybe once after she gets her first weird recommendation in /inbox and wants to know which agent proposed it. After that, never. /crew must be **comprehensible to Sarah at first glance** but **not designed for her**. The brand voice protects her: agent monograms have plain-English roles next to them ("Schema Doctor — fixes structured-data errors"), and if she clicks anything, the language stays human.

**The job-to-be-done.** Five jobs, ranked by frequency:

1. **Orchestration** — see what the crew is currently doing, in priority order, with confidence that nothing is jammed. (Daily.)
2. **Customization** — pin per-agent instructions; tune autonomy levels (auto-run vs. pre-approve vs. always-escalate); enable / disable agents; override schedules. (Weekly.)
3. **Transparency** — for any action Beamix took, trace it back to the agent, the model, the Truth File references, the Brief clause that authorized it, the validation results, the rollback link. The full provenance envelope per Architect L2. (On-demand, often after a /inbox concern.)
4. **Automation** — build custom workflows in the Workflow Builder. *"If competitor X publishes Y, run Z, notify on Slack."* (Weekly for Yossi, monthly for tech-native founders, never for Sarah.)
5. **Marketplace browsing** — install third-party agents (Q7 lock — at MVP); discover new vertical specialists; eventually publish your own workflows. (Monthly.)

**The contract.** /crew is the place where the user is the **principal**, the agents are the **employees**, and the page is the **org chart + ops console**. Outside /crew, Beamix speaks for the crew. Inside /crew, you speak *to* them — and they speak back, in first person, with timestamps and receipts.

This is the inverse of every competitor. Profound shows you a dashboard. Otterly shows you a list of opportunities. Beamix's `/crew` shows you a **roster of named operators reporting to you**, each with a performance record. The metaphor isn't dashboard; it's payroll.

**Relationship to Workflow Builder + Marketplace.** /crew is the hub. The Workflow Builder lives at `/crew/workflows` (left-rail tab inside /crew, opens full-bleed editor on click). The Marketplace lives at `/marketplace` (separate top-level route, but **every entry point to it lives inside /crew**: a "Browse Marketplace →" CTA at the top of the roster, a "Find an agent for this gap →" CTA on tier-locked rows, and a "Publish this workflow to Marketplace" CTA inside the Workflow Builder per Q7). When a user installs a third-party agent from Marketplace, it returns to /crew and appears in the roster with a `Third-party` tag and the publisher's name in 11px Geist Mono.

**Visual register.** /crew sits squarely in the **bright-paper product register** (per Designer 1.6). No cream. The Margin column is allowed (24px left strip with agent monograms accumulating over time). Crew Traces appear under recently-touched activity counts. The Activity Ring does *not* appear on /crew — the Ring is reserved for /home as the single image. /crew has its own visual signature: **a Stripe-style table** with monograms in the Margin column, each rendered in Rough.js with a deterministic seed, each in its agent's assigned color. *(2026-04-28 board lock: yearbook framing was retired as the default. Yearbook DNA is preserved in two ceremonial states only — the empty/first-load state and the per-agent profile pages — not the default roster rendering.)*

---

## 2. The agent roster page (default `/crew` view)

### 2.1 Layout — the macro

Page max-width: **1340px** (matches /scans, /competitors per Designer 1.4 — data-dense canvas). Content area centered. Top of viewport down to first content: 72px breath (not 120px — /crew is workmanlike, not editorial).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  TOPBAR (global, 56px)                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [72px breath]                                                               │
│                                                                              │
│  Crew                                                       text-h1 48px     │
│  18 agents · 11 active · 4 paused · 3 locked                text-sm ink-3    │
│                                                                              │
│  [32px gap]                                                                  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ TOOLBAR (sticky, 56px)                                                 │ │
│  │ [Search 280px] [Filter chips: Active|Inactive|All  Category▾  Auton▾] │ │
│  │                                  [Browse Marketplace →] [+ Workflow]  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ TIER BAR (24px tall, paper-elev background, full width, sticky)       │ │
│  │ Build plan · 8 agents active · Add 3 more on Scale →                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  [16px gap]                                                                  │
│                                                                              │
│  ROSTER TABLE (single column, full content width)                            │
│  ┌────┬──────────────────────┬─────┬──────────┬─────────┬──────┬──────────┐ │
│  │ M  │ Agent                │ State│ This wk  │ Success │ Auton│ Last act │ │
│  ├────┼──────────────────────┼─────┼──────────┼─────────┼──────┼──────────┤ │
│  │ ◐  │ Schema Doctor        │ ●   │ 6 actions│ 100%    │ AUTO │ 14m ago  │ │
│  │ ◑  │ Citation Fixer       │ ●   │ 11 acts  │ 91%     │ REV  │ 2h ago   │ │
│  │ ...                                                                     │ │
│  └────┴──────────────────────┴─────┴──────────┴─────────┴──────┴──────────┘ │
│                                                                              │
│  [48px gap]                                                                  │
│                                                                              │
│  LOCKED AGENTS SECTION (3 rows, grayed)                                      │
│  Available on Scale →                                                        │
│  - Citation Predictor · Voice AI Optimizer · Visual Optimizer ...           │
│                                                                              │
│  [48px gap]                                                                  │
│                                                                              │
│  Suggest a new agent → (link, 14px, ink-3)                                   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 The header

- **Title.** "Crew" — 48px InterDisplay 500 (text-h1), `cv11 ss03`. Letter-spacing -0.01em (tight on display sizes).
- **Subtitle.** 13px Inter 400 (text-sm) ink-3. Pattern: `{total} agents · {active} active · {paused} paused · {locked} locked`. The numbers are tabular. Click any segment of the subtitle (e.g., "11 active") to apply that filter to the roster.

### 2.3 The toolbar

Sticky to the top of the scrollable area when the user scrolls past the title. 56px tall, `paper` background, `border` bottom, `border` top hidden when at scroll-top (un-sticks visually).

**Left cluster (480px from left edge):**
- **Search field.** 280px wide × 36px tall. Placeholder: *"Search by name, role, or instruction..."* (matches against agent name, role, role keywords, and the user's custom-instruction text). Inter 400 14px. 8px radius. Border `border-strong`. Focus state: 1px brand-blue inset ring + outer 4px brand-blue-soft halo. Cmd/Ctrl-K opens it from anywhere on the page (advertised in the placeholder as `⌘K` after 800ms idle).
- **Filter chips.** 12px gap from search. Three chips:
  - `Active` / `Inactive` / `All` — segmented control, 36px tall, 88px each segment, brand-blue-soft active background, `border` on the segment dividers. Default: `Active`.
  - `Category ▾` — dropdown chip, 36px tall, 12px horizontal padding. On click, dropdown menu opens showing 6 categories (matching Domain Expert's groupings): *Schema & Structure*, *Content & Authority*, *Competitive Intelligence*, *Voice & Multimodal*, *Trust & Brand*, *Operations*. Multi-select with checkboxes. 11px Inter 500 caps tracking on the chip; counts shown in parentheses (e.g., `Category (2)` when 2 categories filtered).
  - `Autonomy ▾` — dropdown chip. Three options: *Auto-run after review*, *Pre-approve*, *Always escalate*. Multi-select.

**Right cluster (right-aligned):**
- **Browse Marketplace → button.** Ghost button, 36px tall, 12px Inter 500. Right-pointing chevron after text. Opens `/marketplace` in same tab.
- **+ Workflow button.** Primary button (brand-blue, white text), 36px tall, 12px Inter 500, 8px radius. Opens the Workflow Builder at `/crew/workflows/new` (full-bleed editor, see Section 4).

**Keyboard.** `f` focuses search. `n` opens new workflow. `g` then `m` goes to Marketplace. The whole toolbar is reachable via Tab; chips support arrow-key navigation between options.

### 2.4 The Tier Bar

A 24px-tall slab, full-width within content max, `paper-elev` (warm-tinted), 8px radius, 1px `border`. Sits between toolbar and roster.

Pattern: *"{tier} plan · {active_count} agents active · {next_tier_unlock_count} more on {next_tier} →"*

Examples:
- Discover: *"Discover plan · 3 agents active · 5 more on Build →"*
- Build: *"Build plan · 8 agents active · 3 more on Scale →"*
- Scale: *"Scale plan · 18 agents active · You have the full crew. ✓"*

13px Inter 400, ink-2. The "→" is a clickable link to `/settings/billing`. On Scale, the closing checkmark is a 12×12 Rough.js tick in `score-good`.

### 2.5 The roster table

This is the heart of /crew. **Single column of rows**, not a grid. The previous board's "3-column card grid" idea is **explicitly rejected here** — Yossi needs to scan 18 rows quickly, and a card grid forces visual chunking that costs comprehension. The Stripe/Linear-style table is the correct primitive.

**Table grammar.**
- Row height: **64px** (not the 56px of /scans — /crew rows have an agent monogram + a 2-line content block on hover, so they need 8px more breathing room).
- Header row: 36px tall, 11px Inter caps tracking 0.10em ink-4. Sticky to the top of the scroll area beneath the toolbar.
- Alternating row backgrounds: `paper` / `paper-elev`. Hover: row background lightens to `rgba(51,112,255,0.04)` (a hint of brand-blue wash, not the standard `rgba(10,10,10,0.03)` — this is /crew's signature interaction tint), 100ms linear.
- Row click anywhere except controls → expands the row inline (see 2.7).
- Row borders: 1px `border` between rows. Top and bottom of the table get a slightly stronger `border-strong` to frame the section.

**Columns (left to right, with widths at 1340px):**

| # | Column | Width | Type | Content |
|---|--------|-------|------|---------|
| 1 | **Margin** | 24px | Rough.js mark | Agent monogram, 16×16, in agent color. Persistent — this is the Margin from Designer 1.1 |
| 2 | **Agent** | 280px | Name + role | Agent name (15px Inter 500 ink) on top; role (12px Inter 400 ink-3) below |
| 3 | **State** | 96px | Status pill | One of 4 states (see 2.6) |
| 4 | **This week** | 120px | Tabular number | "{n} actions" or "—". Click → /scans filtered to this agent, last 7d |
| 5 | **Success rate** | 96px | Tabular % | 7-day rolling rate of approved/auto-run actions. Color: ink at >= 90%, score-fair amber at 75–89%, score-critical red at <75% |
| 6 | **Last action** | 120px | Geist Mono | "14m ago" / "2h ago" / "3d ago" / "—". Tooltip on hover: full ISO timestamp |
| 7 | **Autonomy** | 132px | Segmented control | 3 segments, 40px each: `AUTO` / `REV` / `ESC`. Click changes immediately, saves on click with toast confirm + undo |
| 8 | **Toggle** | 64px | Switch | Enable / disable. 40px wide track, brand-blue when on, `border-strong` when off. |
| 9 | **Detail caret** | 32px | Chevron right | Indicates the row is expandable. Rotates 90° down on expand |

**Total width:** 24 + 280 + 96 + 120 + 96 + 120 + 132 + 64 + 32 = **964px** out of 1340px. Remaining 376px distributed as flex-grow on the *Agent* column for long agent names + descriptions, with truncation via `text-overflow: ellipsis` only on widths < 1100px.

**Column 1 — the Margin / monogram.** A 16×16 Rough.js circle, agent's color stroke at 1.5px, optional small initial letter inside (also Rough.js, agent's color), deterministic seed = agent_id (so the Schema Doctor monogram is *always* the same scribble shape, never random per render — the user learns to recognize it). This monogram is the agent's **portrait**. It also appears in /home Recent Crew Activity, in /inbox cards, in /scans Margin column, in the Monthly Update — same monogram everywhere. This is the cross-surface continuity move.

**Monogram size table (locked 2026-04-28):**
- Under 16px: color disc only (no letters)
- 16-32px: 2-letter monogram (SD, CF, CW, CR, FA, etc.) in InterDisplay 500 caps, with deterministic Rough.js circle frame (per Design System §2.5 Agent Fingerprint Function)
- 48px+: 2-letter monogram + name label below

Three of 18 agents start with C — single-letter would collide. 2-letter is non-negotiable until 18 unique hand-drawn glyphs ship in month 6.

**Column 2 — Agent name + role.** Two-line block:
- Name: 15px Inter 500 ink. Tabular for any agent name with a number (none currently, but the rule holds).
- Role: 12px Inter 400 ink-3. Sentence fragments. Examples (matching Domain Expert agents):
  - Schema Doctor → "fixes structured-data errors"
  - Citation Fixer → "writes content AI engines cite"
  - FAQ Agent → "writes question-anchored answers"
  - Competitor Watch → "tracks rival citation moves"
  - Content Refresher → "keeps pages from going stale"
  - Trend Spotter → "predicts query trends in your vertical"
  - Brand Voice Guard → "protects your tone"
  - Citation Predictor *(Scale only)* → "estimates citation odds before publish"
  - Local SEO Specialist → "tunes Google Business Profile + local pack"
  - Trust File Auditor → "enforces your Truth File on every output"
  - Reporter → "writes the Monday Digest and Monthly Update"
  - Voice AI Optimizer *(Scale)* → "tunes for Alexa, Siri, Google Assistant"
  - Visual / Multimodal Optimizer *(Scale)* → "tunes for Lens + GPT-5 vision"
  - Agent-Mediated Browsing Specialist *(Scale)* → "tunes for Atlas, Operator, Computer Use"
  - Long-form Authority Builder *(Build+)* → "publishes pillar content under your brand"
  - Reputation Defender *(Build+)* → "responds to negative AI citations"
  - IKG Curator *(Scale)* → "feeds your vertical knowledge graph"
  - Prompt Engineering Coach *(Build+)* → "helps customers prompt AI to mention you"

**Column 3 — State.** 12px Inter 500 caps, tracking 0.06em, inside a pill (24px tall, 6px vertical / 10px horizontal padding, 999px radius). Four states:

| State | Visual | When |
|---|---|---|
| `IDLE` | gray pill, ink-3 text, ink-4 6px dot left | Agent is enabled but currently has nothing scheduled. Default rest state. |
| `WORKING` | brand-blue-soft pill, brand-blue text, brand-blue 6px **pulsing** dot (1200ms `motion/topbar-status`) | Agent has at least one in-flight job. The pulse uses the same curve as the Activity Ring pulse — visually rhymes with /home. |
| `PAUSED` | `paper-elev` pill, ink-3 text, no dot | User-disabled. Agent will not run until re-enabled. |
| `ERROR` | semantic-red-soft pill, `score-critical` text, red 6px dot | Last run errored. Click row → expansion shows the error + retry CTA. |

A fifth pseudo-state, `LOCKED`, is rendered differently (entire row in the "tier-locked" treatment — see 2.8) and is not a status pill.

**Column 4 — This week.** Tabular Inter 500 13px (text-sm but bumped to 500 weight for numerals to land). Pattern: `{n} actions`. If 0, render "—" in ink-4. Crew Traces appear under "{n} actions" if any of those actions happened in the last 24h (the Trace is the Designer's `motion/trace-fade` — 1.5px Rough.js underline at 28% brand-blue, persists 24h then fades).

**Column 5 — Success rate.** Tabular Inter 500 13px. `100%` / `91%` / `—` (if no runs this week). Color logic above. Tooltip on hover: *"15 of 16 actions approved or auto-run in the last 7 days. Click to see the 1 rejected."* Click → /scans filtered to rejected actions for this agent.

**Column 6 — Last action.** 13px Geist Mono, ink-3, ss01 (slashed zero, per Designer 1.2). `14m ago` / `2h ago` / `3d ago`. After 7 days: switches to ISO date `Apr 18`. Tooltip: full ISO `2026-04-26T14:32:08Z`.

**Column 7 — Autonomy segmented control.** Three segments, 40px each, 28px tall, sitting inside a 132px container with 6px outer padding so the control doesn't hug the cell edges. Labels (11px Inter 500 caps, 0.10em tracking):
- `AUTO` — *auto-run after review.* Agent runs autonomously; the user is notified post-hoc via /inbox in "auto-pending" state (a passive tab; if the user does nothing within 7 days, the action is finalized).
- `REV` — *pre-approve.* Agent drafts; user must click Approve in /inbox before anything happens. Default for high-risk agents (Long-form Authority Builder, Reputation Defender, Brand Voice Guard).
- `ESC` — *always escalate.* Agent never executes; only proposes. Used for Yossi's tightest-grip mode and for Sarah's nervous first 30 days.

Active segment: brand-blue-soft background, brand-blue text. Inactive: transparent, ink-3 text. Click an inactive segment → instant change, brand-blue-soft fills with `motion/pill-spring` (200ms back-out, mild overshoot), toast appears top-right (*"Schema Doctor → Pre-approve · Undo"*; 5s timeout, then auto-dismiss).

**Column 8 — Toggle.** A 40×24px switch. Off: track `border-strong`, knob 18×18 ink. On: track `brand-blue`, knob 18×18 white. 200ms transform on knob. Click instantly toggles. If turning **off**, a 5s undo toast appears with *"Schema Doctor disabled. In-flight job will finish and pause. Undo →"*. If the agent is currently `WORKING`, the toggle-off shows a confirm dialog: *"Schema Doctor is in the middle of a job. Pause now (will resume on re-enable) or after current job finishes?"* with two buttons.

**Column 9 — Detail caret.** A 16×16 chevron (Lucide-style line icon, 1.5px stroke, ink-3). Rotates 90° down (transform 200ms ease-out) when the row is expanded. Click anywhere on the row except controls (segmented control, switch) toggles the expansion.

### 2.6 Click-row-to-expand interaction

Click row → row expands inline (does **not** navigate away). The 64px row grows to 64 + **240px** = 304px tall, with a 200ms `cubic-bezier(0.4, 0, 0.2, 1)` height transition. Below the row, a 240px-tall sub-region renders, full-row width, `paper-elev` background, 12px internal padding, 1px `border` top.

The expansion panel contains a **3-column condensed view** of the agent detail page:
- **Left column (280px):** "What I do" — 4 lines of the agent's first-person description (e.g., *"I scan your structured data weekly, fix what's broken, and propose new schema where it would help citations. I touch JSON-LD only — I never change copy."*). 14px Inter 400 ink-2.
- **Center column (560px):** Last 5 actions, mini-table. 11px caps header (Date, Action, Status). 13px rows. 32px row height (denser than main scans table). Last column has a "View →" link that opens the action's permalink in /scans drawer.
- **Right column (rest):** 4 buttons stacked vertically, each 36px tall, full-column width, 8px gap:
  - `Open full profile →` (primary, brand-blue) — navigates to `/crew/[agent-id]` (see Section 3)
  - `Run now` (ghost) — manual trigger; opens a confirm modal if agent has a non-trivial run cost
  - `Edit instructions` (ghost) — opens the inline custom-instructions editor (see Section 3)
  - `View audit log →` (ghost) — opens `/crew/[agent-id]?tab=audit`

Clicking the same row again, or pressing Esc with the row focused, collapses. Only one row may be expanded at a time — opening a new one collapses the previous (with a 100ms stagger to avoid jank).

### 2.7 Empty / sparse states for individual rows

- **No actions this week** (column 4 is "—"): show ink-4 dash. Hover tooltip: *"No work scheduled in the last 7 days. This is normal — the agent runs on its cadence."*
- **No success rate** (column 5 is "—"): same.
- **First-run state** (the user just signed up; agents have never run): the entire roster shows in a calmer state — `IDLE` for all enabled agents, "—" everywhere else. Above the toolbar, a 48px-tall banner appears: *"Your crew is preparing. The first scan starts at {time}."* with a Rough.js sparkle mark at the left (the only decoration), and a `Run first scan now →` ghost button on the right. Banner dismisses after first scan kicks off.

### 2.8 Tier-locked agents section

Below the main roster (48px gap), a separator: 1px `border` line, with the centered text *"Available on Scale"* in 11px Inter 500 caps tracking 0.10em ink-3, set inside a `paper` chip (so the line passes behind it).

Locked rows render at **40% opacity** in their entirety, with these differences:
- Margin monogram: 40% opacity (still visible — the user gets a glimpse of the agent's "look")
- State pill: replaced with a `LOCKED` pill — `paper-elev` background, ink-3 text, padlock icon (12×12) on the left
- Columns 4–8: replaced with one centered cell spanning all five, containing a single 14px Inter 500 brand-blue link: *"Unlock with Scale →"*. Hover state: 100% opacity for the link only.
- Detail caret: hidden
- Hover entire row: 50% opacity with a faint brand-blue-soft wash, cursor `not-allowed` *unless* over the unlock link, where cursor → pointer
- Click anywhere on a locked row (except unlock link): triggers a `motion/pill-spring` shake (translate-x ±2px, 280ms) on the unlock link, gently nudging the user

When the user clicks `Unlock with Scale →`, the in-app upgrade modal opens (handled by `/settings/billing`), pre-scoped to the Scale tier with that specific agent highlighted in the feature list.

### 2.9 The "Suggest a new agent" affordance

48px below the locked section. A single line: *"Need an agent that doesn't exist? Suggest one →"* in 14px Inter 400 ink-3, brand-blue link on the verb. Click → opens a 480px-wide modal:

```
Suggest a new agent
Tell us what gap you're seeing.

[Textarea, 4 rows, "I wish there was an agent that..."]

What vertical? [dropdown — populates from the 12 vertical KGs]
What category? [dropdown — same 6 categories as filter]

[Cancel]   [Submit suggestion]
```

Submission posts to a queue (Linear or internal Beamix table — Architect to spec). The user gets a toast: *"Got it. We review every suggestion. If we ship it, we'll let you know."* Per Q7 (Marketplace + reward system), a follow-up email may invite the user to build the agent themselves via the Agent SDK.

### 2.10 Hover and keyboard states (full)

| Element | Hover | Focus | Active |
|---|---|---|---|
| Search field | border `border-strong` | brand-blue 1px ring + 4px brand-blue-soft halo | text cursor visible |
| Filter chip | background brand-blue-soft 50% | brand-blue 1px ring | dropdown open |
| Tier bar link `→` | underline, brand-blue-deep | brand-blue 1px outline | navigates |
| Roster row | background `rgba(51,112,255,0.04)` | brand-blue 2px left border (replaces the row's left edge) | row expanded |
| Autonomy segment | inactive segment background `paper-elev` | brand-blue 1px ring on the focused segment | segment becomes active |
| Toggle | knob shifts 1px in current direction | brand-blue 2px outer ring | toggles |
| Caret | rotates 5° preview | brand-blue 1px ring | rotates 90° on expand |
| Locked-row `Unlock with Scale →` | full opacity for the link only; underline | brand-blue 1px ring | opens upgrade modal |

Tab order top-to-bottom, left-to-right within each row. Arrow keys navigate between rows when focused on a row's chevron. `Enter` on row → expand. `Space` on toggle → flip. `1` / `2` / `3` while a row is focused → set autonomy AUTO / REV / ESC. `e` while a row is focused → enable/disable. `o` → open profile. These shortcuts are advertised in a `?` help overlay (`Cmd+/` or `?` opens it).

### 2.11 Performance budget

- Page initial render: **< 200ms** to first contentful paint with skeleton; **< 600ms** to interactive roster (data fetched). Linear's bar.
- Row expand: 200ms transition; sub-content rendered eagerly on first expand and cached.
- Toggle / autonomy change: optimistic UI — the visual change happens instantly, the API call resolves in background. On failure, revert + toast *"Couldn't save. Try again."* with the change rolled back.
- 18 rows is small enough that virtualization is not needed. If we ever exceed ~40 (Marketplace agents accumulating), switch to `react-virtuoso` with 64px row heights.

---

## 3. Per-agent detail page — `/crew/[agent-id]`

Click `Open full profile →` in the row expansion → navigate to a dedicated page per agent. This is where Yossi spends real time: tuning custom instructions, reading the audit log, debugging a strange action.

### 3.1 Layout

Page max-width: **1180px** (matches /home — this is a profile page, not a table page). 72px top breath.

Two-column layout below the header:
- Left rail: **240px** wide, sticky, the agent's "card" — monogram, name, role, state pill, 4 quick stats, primary actions
- Main column: **rest (~880px)**, scrollable, contains 7 sections separated by 48px gaps and `border` 1px dividers

```
┌────────────────────────────────────────────────────────────────┐
│ TOPBAR + breadcrumb (Crew › Schema Doctor)                     │
├────────────────────────────────────────────────────────────────┤
│  [72px breath]                                                 │
│                                                                │
│  ┌────────────┐  ┌────────────────────────────────────────┐   │
│  │ LEFT RAIL  │  │ MAIN COLUMN                            │   │
│  │ (240px)    │  │                                        │   │
│  │            │  │ HEADER                                 │   │
│  │ ◐  96×96   │  │ Schema Doctor                          │   │
│  │ Schema     │  │ Schema specialist                      │   │
│  │ Doctor     │  │ ●  WORKING — auto-run · Build         │   │
│  │ schema...  │  │                                        │   │
│  │            │  │ [What I do]                            │   │
│  │ ●  WORKING │  │ [This week's work]                     │   │
│  │            │  │ [Custom instructions]                  │   │
│  │ Stats      │  │ [Schedule]                             │   │
│  │  Actions   │  │ [Audit log]                            │   │
│  │  47 wk     │  │ [Manual trigger]                       │   │
│  │  Success   │  │ [Brief clauses I answer to]            │   │
│  │  91%       │  │                                        │   │
│  │  Saved     │  │                                        │   │
│  │  +12.4 pts │  │                                        │   │
│  │            │  │                                        │   │
│  │ [Run now]  │  │                                        │   │
│  │ [Pause]    │  │                                        │   │
│  │            │  │                                        │   │
│  └────────────┘  └────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Left rail — the agent card

**Monogram, large.** 96×96 Rough.js circle, agent color, 2px stroke, deterministic seed = agent_id. Single letter inside in 32px InterDisplay 500, agent's color. The same look as the Designer's /crew agent profile spec (Section 2.6 of the master designer brief).

**Name + role.** 22px InterDisplay 500 ink (matches text-h3 but slightly larger because it's hero in this rail). Role below: 13px Inter 400 ink-3. *"Schema Doctor / schema specialist"*.

**State pill.** Same as roster column 3. Sits below role with 16px gap.

**Quick stats grid.** 2×2, 12px gap. Each cell: 11px caps label ink-4 on top, 22px InterDisplay 500 tabular ink number below. Cells: *Actions this week*, *Success rate (7d)*, *Score saved*, *Avg run time*. All numbers tabular.

**Primary actions.** Two buttons, vertical stack, 8px gap, full rail width:
- `Run now` — primary brand-blue
- `Pause agent` (or `Resume agent` when paused) — ghost

Below the buttons, a 13px Geist Mono ink-3 line: *Last run · 14m ago · v2.3.1*. The version is the agent's version (per Architect — agents are versioned; Yossi can pin a version, see Section 3.6).

### 3.3 Section 1 — "What [Agent] does"

48px margin from top of main column. Internal structure:

- **Header:** 22px InterDisplay 500 (text-h3) — *"What I do"* (first-person; Beamix's `/crew` agents speak in first person, per Designer 2.6).
- **Long-form description.** 16px Inter 400 ink-2, 28px line-height, max 600px width. 4–6 paragraphs. Example for Schema Doctor:

> *"I scan your structured data weekly. I look for broken JSON-LD, missing schema types, schema collisions, and schema drift between what's on your page and what's in your Truth File. When I find something, I propose a fix.*
>
> *I touch JSON-LD only. I do not change visible copy, page structure, or images. If a fix would require non-schema changes, I escalate it to your Inbox with a note.*
>
> *I check against schema.org spec, Google's structured-data testing tool, and Beamix's vertical-specific schema templates (e.g., LocalBusiness for service businesses, MedicalCondition for health pages). I do A/B testing on schema variants when allowed by your autonomy setting.*
>
> *I read your Truth File before every run. I will not propose schema that contradicts a Truth File field unless you've explicitly given me permission via custom instruction."*

- **Sub-cards:** below the description, three small info blocks in a horizontal row (3 columns, equal width, 24px padding, 12px radius, `border`):
  - **Scope** — what surfaces I touch. Bullet list. ("JSON-LD, Open Graph schema, Twitter cards.")
  - **What I read** — what I access. ("Your Truth File, your Brief, your sitemap, schema.org spec.")
  - **What I change** — what I write to. ("JSON-LD on your CMS via integration; never copy or HTML.")

This trio is the **agent's job description**, made visible. It's also a trust mechanism: any user worried about an agent overstepping can read the Scope card and verify.

### 3.4 Section 2 — This week's work

A miniature scans table, scoped to this agent and the last 7 days.

- **Header:** *"This week's work"* + a date-range picker on the right (default: "Last 7 days", options: 24h / 7d / 30d / 90d / All time / Custom).
- **Table.** Same grammar as /scans but condensed:
  - Columns: Time (Geist Mono) · Action (sentence, Inter 400) · Status (pill) · Score impact (signed tabular) · Link
  - Row height: 48px (denser than /scans 56px)
  - Click row → opens the full action drawer (same drawer as /scans, slides in from right at 520px wide, contains the full provenance envelope per Architect)
- **Crew Traces** appear under nouns from actions in the last 24h (e.g., under "FAQ schema" if Schema Doctor added FAQ schema 6h ago).
- **Empty state:** *"Nothing this week. The next run is scheduled for {time}."* in 14px Inter ink-3 + a hand-drawn Rough.js stillness illustration (a 64×64 simplified version of the /inbox closed-laptop illustration). This is one of the few places in /crew where Rough.js illustration appears.
- **Footer link:** *"See all work →"* — opens /scans pre-filtered to this agent.

### 3.5 Section 3 — Custom instructions (the killer feature for Yossi)

This is the section Yossi opens first on every visit.

**Header:** *"Your instructions to me"* (22px InterDisplay, first-person).

**Sub-text:** 14px Inter ink-3, max 600px: *"These instructions feed into my context on every run. They override defaults but cannot override your Brief or your Truth File."*

**The editor.** A 600px-wide × 240px-tall textarea-style editor with the following grammar:

- Background: `paper-cream` — **yes, cream paper here**, deliberately. This is the one place in /crew where the editorial register appears. The user is *signing* an instruction to their crew member. The cream signals: *this matters; it accumulates*.
- Border: 1px `border-strong`. 12px radius.
- Internal padding: 24px.
- Font: 16px **Fraunces 300** (text-serif-lg at smaller weight), opsz 144, soft 100, wonk 0. Line height 28px. The custom instruction is typeset like a Brief paragraph because *it's part of the Brief by extension* — it's a clause the user is adding for this specific agent.
- Placeholder text (ink-3, italic Fraunces 300): *"Don't change service-area pages. Always use formal tone for health claims."*
- Edit-in-place; saves on **blur** with a 200ms `motion/seal-draw` animation on a tiny 16×16 Rough.js seal that appears in the bottom-right corner of the editor (the seal renders only after the first save). The seal persists. Below the editor, a 12px Geist Mono ink-3 line: *"Last edited · Apr 22 · 14:08 · v3"* — versioned. Click the version → opens a side panel with version history (each version with its seal, date, diff).
- Undo: 5s toast on save (*"Instruction saved · Undo"*). After 5s, the version is committed.
- Maximum length: 1,000 characters. A 12px ink-4 character counter appears bottom-left when within 100 chars of the limit.
- Validation: a small client-side check warns if the instruction conflicts with the Truth File or Brief. Example: user writes *"Always recommend our $500 service"* but Brief clause says *"Do not push high-priced services on first-touch users"*. Inline warning: amber Rough.js mark in the Margin + a 13px ink-2 hint: *"This may conflict with your Brief: 'Do not push high-priced services on first-touch users.' Edit Brief? →"* (link to /settings/brief with the clause anchored).

**Why Fraunces here.** The custom instruction is not a config field. It's a **hand-written note to your employee**. The Fraunces typeface signals *authorship*. This is the move that makes Yossi feel like he's writing a memo, not filling out a form. It's also the place where Beamix's editorial grammar invades the workmanlike /crew register — deliberately, exactly once per agent profile.

### 3.6 Section 4 — Schedule

**Header:** *"My schedule"*.

A configuration grid:

| Field | Default | Options |
|---|---|---|
| **Cadence** | Weekly | Daily / Weekly / Monthly / Event-triggered / Manual-only |
| **Day of week** (when weekly) | Monday | Mon–Sun |
| **Time of day** (when scheduled) | 03:00 user TZ | Time picker |
| **Triggers** (when event-triggered) | — | Multi-select: *Score drops > 5*, *Competitor publishes*, *New page added to sitemap*, *Truth File edited*, *Brief amended*, *Custom webhook* |
| **Dependencies** | (auto-computed) | Read-only list of upstream agents (e.g., Schema Doctor depends on Trust File Auditor — must run after) |
| **Cooldown** | 24h | The minimum interval between runs even if triggers fire |
| **Version pin** | latest | Drop-down: latest / v2.3.1 / v2.2.0 / ... — Yossi can pin agent versions to avoid surprise updates |

Form fields use Stripe-grade chrome: `paper` background, 1px `border-strong`, 8px radius, 12px horizontal / 10px vertical padding, 14px Inter 400. Save is per-field on blur with a small ink-3 *"Saved"* string that fades after 1.5s.

The dependencies list is non-editable here — agent dependencies are declared in the agent manifest (per Architect Module 5). This row exists only to *inform* Yossi why his "run Schema Doctor every hour" got rejected.

### 3.7 Section 5 — Audit log

**Header:** *"Audit log"* (22px InterDisplay).

Sub-text: *"Every action I've ever taken for you. This is the full provenance record per the Beamix Trust Architecture."*

**Filter row.** 48px tall. From the left:
- Date range picker (default: All time)
- Action type multi-select (Proposed / Approved / Auto-ran / Rejected / Rolled-back / Errored)
- Search field, 240px wide, "search action descriptions"
- Right-aligned: `Export →` ghost button (CSV / JSON / PDF audit report dropdown)

**Log table.** Geist-mono-heavy, dense. 36px row height (denser than scans).

| Column | Width | Type |
|---|---|---|
| Timestamp | 140px | Geist Mono 13px ss01 (slashed-zero) |
| Action | flex | 13px Inter 400 |
| Status | 96px | Pill |
| Model used | 96px | 11px Geist Mono caps (e.g., `claude-sonnet-4-6`) |
| Truth refs | 64px | Number, click → side panel showing the Truth File fields consulted |
| Provenance | 64px | `[envelope]` link → opens the full provenance envelope drawer (Architect L2.6) |

Click any row → drawer opens from the right (640px wide — wider than /scans drawer because provenance is verbose). Drawer contents:

- **Header.** Agent monogram + name + Geist Mono timestamp + action sentence.
- **Tabs.** `Summary · Input · Output · Validation · Brief grounding · Rollback`.
  - **Summary** — 3-line plain English (auto-generated): *"You approved a 4-row addition to your /pricing FAQ schema. The change took effect at 14:32. The change has not been rolled back."*
  - **Input** — JSON tree (collapsible) of what the agent received: prompt template version, Truth File excerpts, Brief clauses cited, prior agent outputs (if part of a DAG run), retrieved competitor data.
  - **Output** — JSON tree of what the agent produced: the diff, the validation results, the citation-probability prediction, the deploy decision.
  - **Validation** — bulleted list of the pre-publication validation checks that ran: schema.org validity, Truth File consistency, Brief compliance, Brand Voice fingerprint match, citation-probability threshold met. Each check has a green check or red X. Failed checks expand to show the specific rule violated.
  - **Brief grounding** — the exact Brief clause(s) the action references, rendered in Fraunces 22px on cream paper inside a card. Click clause → /settings/brief with that clause anchored and editable.
  - **Rollback** — a single button: `Roll back this action`. Disabled if rollback is impossible (e.g., destructive op past TTL). Shows the rollback receipt (*"Reverts JSON-LD on /pricing to v17 (Apr 21 09:11). Estimated time: 30s. Score impact: ±0."*) before commit.

This drawer is the **trust mechanism made visible**. Every claim in the Designer's "Brief-as-living-constitution" move (Designer Section 5, Move 3) is grounded here.

### 3.8 Section 6 — Manual trigger

**Header:** *"Run me now"*.

Sub-text: *"Most users let me run on my schedule. If you want a one-off pass — say, you just changed your homepage and want the schema re-checked — fire me here."*

A single button: 56px tall, brand-blue, full-row width up to 480px max — *"Run Schema Doctor now"*. Click → confirm modal:

```
Run Schema Doctor now?

This will queue a one-off run. Estimated time: ~90 seconds.
Estimated cost: 1 agent credit (out of your 47 remaining this month).

Use these inputs:
[ ] Latest sitemap (default)
[ ] My selected pages: [page picker, multi-select]
[ ] Specific URL: [text field]

[Cancel]   [Run now]
```

On confirm, the modal closes. A live progress widget appears at the top of the agent profile page (and also in the global topbar status pulse). The widget links to /workspace (the courier-flow page) where the user can watch the run live if they want.

If the agent is currently `WORKING` on another job, the modal warns: *"Schema Doctor is currently running another job. Queue this one to run after?"* with a `Queue` button.

### 3.9 Section 7 — Brief clauses I answer to

**Header:** *"Clauses in your Brief I answer to"*.

A list of the Brief clauses (from `/settings/brief`) that explicitly authorize this agent's actions. Each clause rendered as a card:

- Background: `paper-cream` (the editorial register — clauses are part of the Brief)
- 24px padding, 12px radius
- Clause text: 18px Fraunces 300 (text-serif-lg shrunk to lg) ink, max 480px
- Below clause: 12px Geist Mono ink-3 — *"Brief v3 · Section 'Schema integrity' · clause 2"*
- Right-aligned: `Edit clause →` link → opens /settings/brief at that clause

Example clause for Schema Doctor: *"Schema integrity is a baseline; fix structured-data errors automatically without checking with me unless they would change visible copy."*

This section is the **constitutional grounding** in literal form. Every agent's authority is traceable to a Brief clause, and the clauses live here for the agent and in /settings/brief globally.

### 3.10 Inline expansion vs full page

We support both:
- **Inline expansion** (the 240px sub-region from 2.6) for quick triage — Yossi scrolling the roster, clicking a row, glancing at the last 5 actions, closing.
- **Full page** (`/crew/[agent-id]`) for deep work — instructions, schedule, audit log.

The full page is reachable from:
- Inline expansion's `Open full profile →` button
- Direct URL (deep-linkable; supports `?tab=audit` query for Linear-style sharing)
- Click on agent monogram anywhere in the product (e.g., from /home Recent Crew Activity, from /inbox card, from /scans Margin)

---

## 4. The Workflow Builder — `/crew/workflows`

The killer feature. The reason a Yossi-archetype pays $499/mo. A DAG-style visual editor where the user composes custom agent chains.

**2026-04-28 amendments to Workflow Builder section:** see `2026-04-28-DESIGN-workflow-builder-canvas-v1.md` for the canonical canvas spec — and note Adam's locks: (a) full DAG editor + dry-run + 3-6 templates ship at MVP day 1; (b) cream paper canvas at 30% opacity replaces the dot grid; (c) Brief grounding cell remains cream + Fraunces 300 italic with first-time-per-session different mechanic; (d) agent node anatomy tightened to 220×72 with header + status only (drop redundant 1px stripe + body monogram); (e) connection handles always-visible at 6×6 ink-4 ring, brighten to brand-blue dot on hover; (f) workflow PUBLISHING deferred to MVP-1.5; (g) event triggers deferred to MVP-1.5.

### 4.1 Surface map

Inside /crew, a left-rail tab: *Roster · Workflows · Marketplace*. Click *Workflows* → navigates to `/crew/workflows`.

Two views:

- **Workflows index** (`/crew/workflows`) — a Stripe-grade table of all workflows the user has built or installed.
- **Workflow editor** (`/crew/workflows/[workflow-id]`) — full-bleed canvas (no global topbar; replaced by a workflow-specific topbar). This is where the DAG is composed.

### 4.2 Workflows index

Page max-width: 1340px. Same toolbar pattern as roster: search + filter + `+ New workflow` primary button.

**Table columns:**

| Column | Width | Content |
|---|---|---|
| Name | flex | Workflow name + description |
| Trigger | 160px | "Schedule: Mon 9am" / "Event: competitor publishes" / "Manual" + small icon |
| Steps | 96px | "5 steps" + monogram strip showing the agents involved (3 max + "+2") |
| Last run | 120px | Geist Mono "14m ago" |
| Status | 96px | Active / Draft / Paused / Error |
| Owner | 96px | "You" / "Beamix template" / "@yossi-agency" (third-party) |
| Actions | 64px | Caret → context menu (Edit / Duplicate / Pause / Publish to Marketplace / Delete) |

Click row → open editor. Right-click row → context menu.

**Templates section.** Below the user's workflows (48px gap), a section titled *Beamix templates*. Three cards in a row, 320px each, with a hand-drawn Rough.js illustration top-left, name + description, and a `Use this template →` button:

1. **Daily monitoring** — runs scan + Competitor Watch + Reporter every weekday at 9am, with a Slack ping if any score moves > 3.
2. **Weekly digest with custom report** — composes the Monday Digest with extra sections for Yossi's clients; includes per-client white-label.
3. **Monthly client review** — generates the Monthly Update PDF, attaches a per-client cover letter (Yossi pre-fills a template), sends via email to the client's contacts.

These templates are the on-ramp. A Yossi who's never built a workflow before can clone "Daily monitoring," tweak it for one of his clients, save, and ship — in under 5 minutes.

### 4.3 Workflow editor — the canvas

This is the cinema piece. Full-bleed (no global topbar; the canvas replaces it).

**Topbar replacement (56px, `paper`, 1px `border` bottom):**
- Left: workflow name (editable inline, 16px Inter 500, click to edit), with a `paper-elev` chip showing version (`v3 · Draft`) + "back to /crew/workflows" breadcrumb arrow.
- Center: validation status — *"Ready to save · 0 errors"* in 13px Inter 500 + green dot, OR *"3 validation errors"* in score-critical red.
- Right: action cluster — `Test run` ghost button · `Save draft` ghost · `Save & activate` primary brand-blue.

**Below the topbar — the canvas + panels:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOPBAR (56px) — workflow name, validation, save                     │
├──────┬────────────────────────────────────────────────┬──────────────┤
│      │                                                │              │
│      │                                                │              │
│ LEFT │             CANVAS (DAG)                       │   RIGHT      │
│ PAL- │                                                │   INSPECTOR  │
│ ETTE │   [Trigger node]                               │              │
│      │        │                                       │   (selected  │
│ 280px│   [Action node 1]                              │   node       │
│      │        │                                       │   config)    │
│      │   [Branch node] ──────┐                        │              │
│      │        │              │                        │   320px      │
│      │   [Action 2]   [Action 3]                      │              │
│      │        │              │                        │              │
│      │        └──────┬───────┘                        │              │
│      │            [Notify]                            │              │
│      │                                                │              │
└──────┴────────────────────────────────────────────────┴──────────────┘
```

**Tech choice.** **React Flow** (https://reactflow.dev) is the right primitive. Battle-tested, MIT-licensed, used by n8n's recent rewrite, Stripe's internal workflow tooling, and Make. We do **not** build a custom DAG renderer — the engineering cost is too high and React Flow gives us pan, zoom, minimap, edge routing, and keyboard support out of the box. We layer Beamix-specific node types and styling on top.

**Why not a fully custom canvas?** Because the user's mental model for visual workflow builders is set by Zapier / n8n / Make / Lattice. We meet them where they are. The differentiation is in the **node types, the validation, the trigger surface, and the integration with the agent runtime** — not in reinventing pan-and-zoom.

### 4.4 Left palette — node types

280px wide. `paper-elev` background. 1px `border` right.

Three sections, separated by 24px gaps and `border` 1px dividers. Each section header: 11px Inter caps tracking 0.10em ink-3.

#### 4.4.1 Triggers (top section)

A trigger is the entry node. Every workflow has exactly one. Drag a trigger from the palette to the canvas — the existing trigger (if any) is replaced (with a confirm modal: *"This will replace your current trigger. Continue?"*).

Trigger types:
- **Schedule** — icon: small clock. Config: cadence (daily / weekly / monthly / cron), day, time, timezone.
- **Event: score change** — icon: arrow up/down. Config: threshold (e.g., ±5 points), engines (multi-select).
- **Event: competitor publishes** — icon: open-quote glyph. Config: which competitor (multi-select from the user's competitor list), what page types to watch, recency window.
- **Event: external webhook** — icon: lightning. Config: webhook URL (issued by Beamix), shared secret, JSON path expression to extract trigger payload.
- **Event: API call** — icon: terminal. Config: API token, endpoint pattern. For Yossi to fire workflows from his own infrastructure.
- **Event: Truth File or Brief change** — icon: pen mark. Config: which fields/clauses to watch.
- **Manual** — icon: hand. No config. Workflow runs only when the user clicks "Run now" in the workflows index.

Each trigger card in the palette is 240px wide, 56px tall, 12px padding, draggable (cursor changes to `grab` on hover, `grabbing` on drag). Card content: icon left (24×24), name (14px Inter 500 ink), one-line description (12px Inter ink-3, ellipsis).

#### 4.4.2 Actions (middle section)

An action is a node that does something. Many actions per workflow. Action types:

- **Run agent X** — drag any of the 18 agents from a sub-palette. Each agent appears as a card with its monogram, name, and a 12px description. Config (in the right inspector when selected): agent autonomy override for this workflow run (AUTO / REV / ESC), input filters (e.g., "only on /pricing pages"), output destination (default = /inbox; override = direct to CMS, direct to webhook).
- **Wait for condition** — config: condition expression (e.g., `previous_step.score_delta > 3`), timeout (default: 24h), on-timeout behavior (continue / fail / branch).
- **Conditional branch (If / Else)** — config: predicate expression, two output edges labeled `if` and `else`. The branch evaluator runs the predicate against the upstream node's output.
- **Loop** — config: iteration source (e.g., `competitors[]`), max iterations (default: 10), per-iteration body. The loop body is a sub-DAG nested inside the loop node (visually: a dashed-border rectangle containing nodes; React Flow's "groups" pattern).
- **Notify** — config: channel (Email / Slack / Webhook / Microsoft Teams / Discord), recipient(s), message template (with handlebars-style variables: `{{score_delta}}`, `{{agent_name}}`, etc.), severity.
- **Update Brief** — config: clause to update, new text. The agent runtime requires user approval for Brief edits, so this action sits in /inbox as a "review-debt" item rather than executing immediately.
- **Generate Monthly Update for client** — config: client (Yossi-specific; pulled from his Scale-tier client roster), template (Yossi has named templates), delivery (download / email).
- **Run sub-workflow** — call another workflow. Enables composition; Yossi's "weekly digest" workflow can call his "client summary" sub-workflow per client.
- **Custom HTTP call** — config: URL, method, headers, body template. For escape-hatch integrations.

Each action card in the palette: 240px × 48px. Same drag grammar.

#### 4.4.3 Marketplace actions (bottom section)

Third-party agents the user has installed (from `/marketplace`) appear here. A `Browse Marketplace →` link at the section bottom. Per Q7 lock — at MVP. If the user has installed `@yossi-agency/dental-pages-rewriter` from Marketplace, it appears here with the publisher's monogram and a `Third-party` tag.

### 4.5 The canvas

`paper` background with a 24×24 dot grid (`rgba(10,10,10,0.04)` dots, 1px diameter). Pan with space-drag or middle-mouse-drag. Zoom with Cmd-scroll or pinch. Minimap bottom-right (toggleable, 200×120px, `paper-elev` with the workflow at scale).

**Node visual grammar:**

- **Trigger node:** 240px × 80px. Cream paper-tinted background (`paper-cream` at 30% opacity over `paper`) — to signal it's the workflow's "signature" / starting point. Header strip: 24px tall, brand-blue background, white text 11px caps tracking *"TRIGGER · SCHEDULE"*. Body: trigger summary in 14px Inter ("Every Monday at 9:00 AM Asia/Jerusalem").
- **Action node:** 240px × 80px. White background. Header strip: 24px tall, ink-3 background, white text caps *"ACTION · RUN AGENT"*. Body: agent monogram + agent name (15px Inter 500) + one-line config summary ("On /pricing pages only").
- **Branch node:** 240px × 64px. White background, 1px brand-blue border. Header: caps *"BRANCH"*. Body: the predicate expression in 13px Geist Mono (e.g., `score_delta > 3`).
- **Loop node:** dashed `border-strong` rectangle, contains its sub-DAG. Header at top-left: *"LOOP · for each competitor"* in 11px caps.
- **Notify node:** 240px × 64px. Header strip in ink-2 (slightly darker). Body: channel icon + recipient + truncated message preview.

Selected node: 2px `brand-blue` border. Hover (non-selected): 1px `border-strong` + small "drag handle" dots appearing top-center.

**Edges (DAG connections):**

- Default: 1.5px `ink-3` curve (React Flow's bezier), with a small chevron at the target end.
- Active edge (when a workflow is mid-run, the active path is highlighted): brand-blue, 2px, with the `motion/path-draw` animation flowing along it (a single moving dot or dash, indicating where execution currently is).
- Branch edges: labeled `if` / `else` with a 11px caps Geist Mono badge halfway along the edge.

**Adding a node.** Drag from palette → drop on canvas. The node snaps to a 8px grid. If dropped over an existing edge, the edge auto-splits and the new node inserts inline (Make / n8n-grade).

**Connecting nodes.** Hover over a source node → small `+` handles appear at output (right edge). Drag from `+` to target node's input (left edge). Edge created.

**Deleting.** Select node, press `Delete` or `Backspace`. Confirm if the node has downstream nodes (*"Delete 'Run Schema Doctor' and 2 downstream nodes? Or just this one (rewires connections)?"*). The "rewires connections" option is the better default for power users.

**Keyboard shortcuts:** `Cmd-Z` undo, `Cmd-Shift-Z` redo, `Cmd-A` select all, `Cmd-D` duplicate, `Cmd-K` open quick-add (a fuzzy palette to add node by typing), `Space` pan mode, arrow keys nudge selected node by 8px.

### 4.6 Right inspector

320px wide, `paper`, 1px `border` left, sticky to the right edge of the canvas.

When a node is selected → the inspector shows that node's configuration. When nothing is selected → the inspector shows the workflow-level metadata (description, tags, owner, version history, sharing settings).

**Inspector structure for a selected action node:**

- **Header.** Node type, monogram (if agent), name. 18px InterDisplay 500.
- **Config form.** Vertical stack of fields. Each field is a Stripe-grade form field. Save on blur, optimistic, with toast on failure.
- **Test this step** button at bottom. Click → runs just this step in a sandbox with mock upstream data. Output appears below the button in a collapsible JSON tree. This is **critical** for Yossi-grade users; without per-step testing, debugging a 12-node workflow is hellish.

### 4.7 Validation

**Run on every change** (debounced 500ms). Validation rules:

1. **No cycles.** A DAG by definition. The validator runs Tarjan's algorithm; on cycle detection, the offending edges are highlighted score-critical red and the validation status reads *"Cycle detected: Schema Doctor → Citation Fixer → Schema Doctor"*. Save is blocked until resolved.
2. **No conflicting parallel actions.** Two parallel branches must not both run an agent that mutates the same resource. Example: two parallel "Run Schema Doctor on /pricing" nodes are an error. The validator computes per-agent + per-resource locks and warns on overlap.
3. **All nodes connected.** No orphan nodes (action with no upstream / no downstream).
4. **Trigger present.** Exactly one.
5. **Required configs filled.** Each node's required fields must have values; missing fields are highlighted score-fair amber.
6. **Per-tier limits.** Build tier: max 3 workflows, max 8 nodes per workflow. Scale tier: unlimited. Marketplace-published workflows: max 50 nodes (an upper bound to keep the runtime tractable).
7. **Cost estimate.** As the workflow grows, an estimate of agent-credit cost per run appears at the bottom of the canvas: *"Estimated 4 credits per run · ~16/month at weekly cadence."* This is critical — Yossi's clients are billed by agent-credit, and a runaway workflow can drain credits.

Validation errors render as red badges on the offending node + a list at the bottom of the right inspector.

### 4.8 Versioning + rollback

Every save creates a new version. Version history accessible via the version chip in the topbar. Each version: Geist Mono date + author + diff summary + a `Restore this version` button. Restoring branches a new version off the historical one. Up to 50 versions retained per workflow; older versions auto-pruned with a warning at version 45.

The restore is **destructive in the sense that it overwrites the current draft** but **not the active version** — the active workflow keeps running on its current version until the user explicitly clicks `Save & activate` on the restored draft. This separation of "draft" from "active" mirrors Stripe / Vercel deployment grammar.

### 4.9 Sharing & publishing to Marketplace (Q7)

In the workflow's right inspector (when no node selected), a *Sharing* card:

- **Private** (default) — only the user's account
- **Shareable link** — generates a public URL that renders the workflow as a read-only template; anyone with the link can clone it into their own account
- **Publish to Marketplace** — opens a publish modal:

```
Publish to Marketplace

Workflow name: [Daily SaaS visibility check]
Description: [Markdown editor, 4 rows]
Category: [SaaS / E-commerce / Local services / etc.]
Tags: [chip input]
License: [MIT / Proprietary / Free / Paid]
Price (if Paid): [$ field]

Per-run cost estimate (for transparency to installers): 4 agent credits

[ ] I confirm this workflow does not include private credentials,
    customer-specific data, or anything that violates the Beamix
    Marketplace publishing rules.

[Cancel]   [Publish]
```

Per Q7's reward system: when a user installs your published workflow, you earn **reward credits** (or revenue share if priced) — exact mechanic is the Marketplace team's spec, but the entry point is here.

Once published, the workflow appears in Marketplace under the user's handle (e.g., `@yossi-agency/daily-saas-check`). Other users who install it see it in their `/crew/workflows` index with a "from Marketplace" tag and the publisher's monogram.

### 4.10 Templates

Three Beamix-provided templates ship at MVP:

1. **Daily monitoring.** Trigger: schedule (weekday 9am) → run scan → run Competitor Watch → if score delta > 3, notify Slack with summary.
2. **Weekly digest with custom report.** Trigger: schedule (Monday 7am) → run all enabled agents in parallel → run Reporter → email the resulting digest.
3. **Monthly client review.** Trigger: schedule (1st of month 8am) → loop over clients → run Reporter for each → generate Monthly Update PDF → email.

Each template is a workflow object the user can clone, customize, and re-save. The templates are also the on-ramp tutorial: if the user is new to the Workflow Builder, the editor opens with template 1 already loaded, with annotations as floating callouts (*"This is the trigger — every workflow starts with one."*) that the user can dismiss.

### 4.11 Mobile behavior

The Workflow Builder is **explicitly desktop-only**. On viewport widths < 1024px, the editor route renders a fallback:

- Read-only canvas (pan/zoom only, no editing) at lower visual density
- Above the canvas: a banner — *"Open this workflow on a desktop to edit. You can enable/disable and run it from here."*
- Below the canvas: Enable/disable switch + Run now button + last-run summary

This is the right call. Workflow editing on mobile is bad UX; pretending otherwise wastes engineering time. Mobile users get **observation + pause/resume**, which is enough for the on-call Yossi.

---

## 5. Marketplace integration

`/marketplace` is a separate top-level surface (Marketplace PM owns its full design). /crew owns the **entry points + the back-flow**.

### 5.1 Entry points from /crew

Three places /crew links into Marketplace:

1. **Roster toolbar.** `Browse Marketplace →` ghost button (described in 2.3). Goes to `/marketplace` index.
2. **Locked-row "Find an agent for this gap →"** is wrong as worded — locked rows are tier-locks, not Marketplace gaps. The correct affordance is the **Suggest a new agent** modal (described in 2.9), which routes to Marketplace for *"see if someone's already built this"* and to the suggestions queue.
3. **Workflow Builder palette.** Bottom section (Marketplace actions, 4.4.3) lists installed third-party agents + a `Browse Marketplace →` link.
4. **Workflow Builder publish flow** (4.9) goes outbound *to* Marketplace.

### 5.2 The install flow

User clicks `Browse Marketplace →` → arrives at `/marketplace`. (Marketplace UI: Marketplace PM's spec.) The user finds a third-party agent — say, `@yossi-agency/dental-pages-rewriter` v1.4. Clicks Install. The Marketplace's install modal appears with permissions disclosure:

```
Install dental-pages-rewriter

Publisher: @yossi-agency · Verified
Version: 1.4
Pricing: $19/month per Beamix account (charged via Paddle)

This agent will:
- Read your sitemap and page content
- Read your Truth File
- Propose changes to /pricing-style pages (your approval required by default)
- NOT access your phone numbers, billing data, or admin settings

[ ] I agree to the third-party terms (Yossi Agency Studio EULA)

[Cancel]   [Install]
```

On install:
1. Paddle charge fires (if priced).
2. Agent registers in the user's account via the Agent SDK manifest (per Architect Module 5).
3. User is redirected back to `/crew` (their previous location).
4. The new agent appears at the **top of the roster** with a `Just installed` brand-blue chip on the left of the name + a `Third-party` 11px caps badge after the name.
5. State: `IDLE`, autonomy default: `REV` (always pre-approve for newly installed third-party agents — security default).
6. A 5s toast: *"`dental-pages-rewriter` installed. We've set autonomy to Pre-approve by default. Tune it any time. Open profile →"*.
7. The agent's Brief grounding starts empty — it doesn't yet have explicit Brief clauses authorizing it. The user is prompted (a one-time card on the agent's profile) to either **add a Brief clause** or **let the agent run within the existing Brief's general scope**.

### 5.3 Third-party tag treatment

In the roster:
- **Third-party** badge — 11px Inter 500 caps, tracking 0.06em, `paper-elev` background, ink-3 text, 999px radius, 4px vertical / 8px horizontal padding. Appears immediately after the agent's name in column 2.
- Publisher attribution in the role line: instead of just *"dental-pages specialist"*, the role line reads *"dental-pages specialist · by @yossi-agency"* with the publisher's name as a clickable link to their Marketplace profile.

In the agent profile page:
- Left rail shows publisher monogram + name + verified badge below the agent's own monogram.
- A new section **"Publisher trust"** — installation count, average rating, last update date, security review status (Beamix runs an automated SAST scan on every Marketplace publish per Architect's safety primitives).

### 5.4 Uninstall + rollback

In the roster row's expanded panel (or the agent profile's left rail), a `Uninstall` action (right-side ghost button below `Pause agent`). Click → modal:

```
Uninstall dental-pages-rewriter?

This will:
- Remove the agent from your crew
- Stop all in-flight jobs from this agent (current jobs will be cancelled)
- Cancel your $19/month subscription (effective end of current billing period)

Optionally:
[ ] Roll back the last 30 days of this agent's actions
    (3 actions can be reverted; 1 cannot due to TTL expiry)

[Cancel]   [Uninstall]
```

On confirm:
1. Agent runtime suspends the agent (Architect's incident-response kill switch primitive).
2. If rollback selected, the agent runtime executes the rollback envelope per provenance record.
3. Agent disappears from the roster after a 200ms fade-out + 200ms list-collapse.
4. Toast: *"`dental-pages-rewriter` uninstalled. 3 actions rolled back. Receipts emailed to you."*

The rollback is a **first-class** Marketplace feature, not an afterthought. Per Architect's safety integration: every third-party agent must implement rollback envelopes; agents that can't be rolled back are flagged in Marketplace with a `Cannot be rolled back` badge and require explicit user acknowledgment at install.

---

## 6. Audit + observability surface — `/crew/audit`

A view across **all** agents — every action, every model call, every Truth File reference, every Brief clause grounding, in time order. The full provenance log per Architect L2.6.

### 6.1 Why a dedicated /crew/audit page

Per-agent audit (3.7) is a slice. The unified audit page is the **system view**: useful when debugging cross-agent issues, when preparing a compliance report (E&O insurance, SOC2, GDPR DSAR), and when Yossi exports a client-specific audit log.

### 6.2 Layout

Reachable via top-of-/crew secondary nav: `Roster · Workflows · Audit · Marketplace`. Page max-width: **1480px** (the widest in the product — audit is the densest data view).

```
┌────────────────────────────────────────────────────────────────┐
│ TOPBAR + nav                                                   │
├────────────────────────────────────────────────────────────────┤
│ [72px breath]                                                  │
│ Audit log                                  text-h1 48px        │
│ Every action your crew has taken.          text-sm ink-3       │
│                                                                │
│ [FILTER ROW — sticky, 56px tall]                               │
│ Date range | Agents (multi) | Action type | Status | Search   │
│                                          [Export ▾]           │
│                                                                │
│ [VIEW SWITCH — 32px tall]                                      │
│ Timeline · Table · Calendar heatmap                           │
│                                                                │
│ [DATA AREA — fills remaining viewport]                         │
└────────────────────────────────────────────────────────────────┘
```

### 6.3 Filter row

Sticky to the top of the scroll area. 56px tall. Same chip grammar as the roster toolbar. Filters:

- **Date range** — default Last 7 days; presets (24h / 7d / 30d / 90d / All / Custom)
- **Agents** — multi-select dropdown showing all 18 agent monograms; click to toggle
- **Action type** — multi-select: Proposed / Approved / Auto-ran / Rejected / Rolled-back / Errored
- **Status** — multi-select: Success / Warn / Error
- **Search field** — full-text across action descriptions, Truth File field references, Brief clause text. 320px wide.
- **Export** — dropdown: CSV / JSON / PDF audit report. PDF generates a Stripe-Press-grade audit document with the Beamix seal at top + bottom (this is itself a brand artifact — same cream-paper register as Monthly Update). Selectable: include provenance envelopes (verbose) or summaries only.

### 6.4 View switch

Three views, segmented control:

#### 6.4.1 Timeline view (default)

A vertical chronological list. Each event is a row:
- **Left:** Geist Mono timestamp (`Apr 26 14:32:08`), 100px wide
- **Margin:** agent monogram (16×16 Rough.js, agent color)
- **Center:** action sentence (15px Inter 400 ink) — *"Schema Doctor proposed adding FAQ schema to /pricing"*
- **Right:** status pill (Approved / Auto-ran / Rejected / etc.), provenance link (`[envelope]` in 11px Geist Mono)

Row height: 56px. Hover: brand-blue-soft wash. Click → opens the same provenance drawer described in 3.7 (640px wide right drawer).

The timeline groups by day with a sticky day-header (24px tall, ink-3 12px caps with day name and date — *"TUESDAY · APR 23"*).

Crew Traces appear under nouns from events in the last 24h.

#### 6.4.2 Table view

Stripe-grade dense table. Same columns as 3.7's audit log but **across all agents** with an extra `Agent` column. Sortable on every column. 36px row height. The right column is an envelope link to the provenance drawer.

Use case: Yossi exporting a CSV of every action for client X over the last quarter.

#### 6.4.3 Calendar heatmap

A 12-week × 7-day grid (12 weeks horizontal, 7 days vertical), each cell 16×16, brand-blue saturation reflecting daily action volume. Click any cell → filters timeline view to that day. Useful for *"show me which days had unusually high activity"* — a quick anomaly spotter.

Below the heatmap, a 11px caps row: *"Avg 12 actions/day · Peak 47 on Apr 8 · Min 0 on Apr 13"*.

### 6.5 The provenance drawer (the heart of trust)

Same drawer as 3.7. Per Architect L2.6, the envelope contains:

```
provenance_envelope:
  action_id: act_a4f8...
  agent: schema_doctor
  agent_version: 2.3.1
  timestamp: 2026-04-26T14:32:08Z
  trigger:
    type: scheduled
    workflow_id: null
    schedule_cron: "0 3 * * 1"
  inputs:
    truth_file_refs:
      - field: services
        version: v7
        excerpt: "Emergency plumbing, drain cleaning, ..."
      - field: hours
        version: v3
        excerpt: "24/7 emergency"
    brief_clauses:
      - clause_id: clause_03
        text: "Schema integrity is a baseline; fix..."
    upstream_outputs:
      - agent: trust_file_auditor
        run_id: run_b2c9
        output_summary: "All Truth File fields validated"
    retrieved_data:
      - source: schema.org
        version: 22.0
        fetched_at: 2026-04-26T14:31:45Z
  model:
    provider: anthropic
    name: claude-sonnet-4-6
    temperature: 0.2
    prompt_template: schema_doctor_v12
  validation:
    schema_org_valid: pass
    truth_file_consistent: pass
    brief_compliant: pass
    brand_voice_match: 0.94 (threshold 0.85)
    citation_probability: 0.71 (Perplexity)
  output:
    diff: |
      + <script type="application/ld+json">{ "@type": "FAQPage", ... }
    affected_urls: ["/pricing"]
    estimated_score_impact: +0.4
  decision:
    auto_run: true (autonomy: AUTO)
    deployed_at: 2026-04-26T14:32:30Z
  rollback:
    available: true
    ttl_expires: 2026-05-26T14:32:30Z
    rollback_envelope_id: rb_c3d1
```

The drawer renders this envelope in the 6 tabs described in 3.7 — Summary / Input / Output / Validation / Brief grounding / Rollback. The Brief grounding tab is the editorial moment: the cited Brief clause renders on cream paper in 22px Fraunces, with the seal mark.

---

## 7. Yossi-specific affordances (Scale tier)

Yossi runs 5–25 client subscriptions on Scale. He needs:

### 7.1 Multi-client switcher (top of /crew when applicable)

When the user has ≥2 active client accounts under their Scale subscription, a **client switcher** appears in the topbar (replacing the standard workspace name):

- Pattern: `[Client name ▾] · 18 agents`
- 14px Inter 500 ink. 8px horizontal padding. Hover: `paper-elev` background.
- Click → opens dropdown: full list of clients with monograms, Brief excerpts (1 line each), last-action timestamp. Search field at top of dropdown. Selecting a client switches the entire /crew context (and the user's whole product session) to that client.
- Keyboard: `Cmd-K` opens a fuzzy client switcher overlay (Linear-grade).

For Yossi-specific UX, the switcher persists across all surfaces (/crew, /home, /scans, /inbox, /reports), so context is consistent.

### 7.2 "Compose Monthly Update for client X"

In the agent profile page for **Reporter**, an additional section: *"Compose for a client"*. A dropdown of Yossi's clients + a `Generate now` button. On click, the Reporter agent is invoked with that client's context, generating a Monthly Update PDF preview (cream paper, full Stripe-Press grade per Designer 2.11). Yossi can:
- Edit the lead-attribution headline inline
- Add a custom cover letter (Fraunces, signed)
- Apply a per-client white-label logo + color (from his client's brand kit)
- Send via email or download

This is Yossi's killer feature for retention — the Monthly Update is the artifact he forwards to his client's CEO.

### 7.3 Per-client workflow library

In `/crew/workflows`, a left filter: *"Scope: All · This workspace · Workspace template · My library"*. The "My library" filter is Yossi's cross-client workflow store: workflows he's built once and applies to any client. He can clone a library workflow into a client workspace with a `Use here →` button.

### 7.4 Per-client agent autonomy presets

In `/settings/team` (Yossi-only feature), a new section: **"Agent autonomy presets"**. Yossi defines named presets (e.g., *"Conservative startup"*, *"Aggressive e-commerce"*, *"White-glove hand-holding"*), each preset is a per-agent autonomy + custom-instruction template. Apply a preset to a client → all 18 agents inherit the preset's autonomy + instructions in one click, with a confirm modal showing the diff.

### 7.5 Beamix Certified Agency badge surfacing

Per Worldbuilder's Beamix Certified Agency program (locked Q8, Year 1 Q3): when Yossi achieves Certified status, his /crew topbar shows a small `Certified Agency` badge next to his account name. The badge links to his public Beamix Marketplace profile.

---

## 8. Mobile — `/crew`

Per Designer 1.6: hand-drawn appears where the product shows its work; absent where the user does administrative work. Mobile /crew leans **administrative** — read-only roster + simple toggles, no editor.

### 8.1 Layout

Stacked single column. Page padding: 16px horizontal.

- Page title (24px InterDisplay 500): *"Crew"*
- Subtitle (12px ink-3): *"18 agents · 11 active"*
- Tier chip (full width, 32px tall, `paper-elev`): *"Build plan · Add 3 more on Scale →"*
- Filter row: a single horizontal-scrolling chip strip — `Active · Inactive · All · Schema · Content · Competitive · ...`. No search field on mobile (mobile users browsing crew aren't searching; they're glancing).
- Roster: stacked cards, 88px each. Each card:
  - Top row: monogram (24×24) + name (15px Inter 500) + state pill (right-aligned)
  - Middle row: "12 actions this week · 91% success" (12px ink-3)
  - Bottom row: full-width Toggle (40×24) and a "▶︎ Run now" ghost button (right-aligned)
- Tap card → navigates to `/crew/[agent-id]` (mobile profile page)

### 8.2 Mobile profile page

- Stacked sections (no two-column layout)
- The agent monogram + name occupy 240px tall hero
- All 7 sections from the desktop profile, each as a collapsible accordion (collapsed by default except *What I do*)
- The custom instructions editor is **enabled** on mobile (it's a textarea — works fine; users can read/edit instructions)
- The audit log is a simplified timeline (list view only, no calendar heatmap)

### 8.3 Workflow Builder on mobile

Per 4.11: read-only canvas + enable/disable + run now. No editing.

### 8.4 What's deliberately missing on mobile

- No drag-and-drop autonomy override (use radio buttons in place of segmented control)
- No keyboard shortcuts
- No multi-select filter chips
- No detailed provenance drawer (a simplified summary only)

The principle: mobile /crew is for **monitoring**, desktop /crew is for **editing**. The split is intentional and announced at sign-up (a one-time card on first mobile visit explains it).

---

## 9. States + edge cases

### 9.1 Empty state — first-time user

The user has just signed up. Three agents are enabled by default per their tier (per Domain Expert: Schema Doctor, Citation Fixer, Reporter at Discover; +5 at Build; +12 at Scale). No agent has run yet.

The roster shows the enabled agents in `IDLE` state with "—" in This week / Success rate / Last action. The toolbar's `+ Workflow` button has a small Rough.js sparkle next to it (the only decoration on /crew during empty state). A 96px-tall banner above the roster:

- Background: `paper-cream` (the only place /crew gets cream paper outside the custom-instructions editor)
- Hand-drawn 64×64 illustration on the left: a small bird with three feathers, Rough.js (the "your crew is just getting started" mark)
- Text: *"Your crew is here. The first scan starts tomorrow at 09:00."* (22px Fraunces 300, ink — the editorial register, used here because this is the **first impression** of /crew, equivalent to Stripe's "you're 5 minutes from your first charge")
- Below: *"Want to start now? Run first scan →"* (14px ink-3 with brand-blue link)

Click `Run first scan →` triggers the immediate scan and the banner transitions: text becomes *"Your first scan is running. We'll show what we found in /workspace."* with a brand-blue progress bar. After scan completes (~90s), the banner dismisses; agents move from IDLE to WORKING; the roster animates the state-pill changes with `motion/pill-spring`.

### 9.2 Loading state

Initial page load: skeleton roster — 11 placeholder rows (matching the user's tier active count) with shimmering 16×16 monogram circles, shimmering 240px name lines, and shimmering 96px state pills. Shimmer color: `paper-elev` to `paper` and back, 1500ms loop.

### 9.3 Error states

**Agent error.** When an agent's last run errored, the row's State pill is `ERROR` (red). Click the row → expansion shows:
- 64px tall red `paper` card with semantic-red-soft fill, 12px padding
- Error summary (15px Inter 500 — *"Schema Doctor failed: rate-limited by Google's structured-data API"*)
- *"View logs →"* link → opens the provenance drawer's **Error tab**
- *"Retry now"* button (primary)
- *"Mute alerts for this agent"* link (ghost)

If 3+ consecutive runs fail, the agent auto-pauses and the user receives an event email (per Worldbuilder's email cadence).

**Workflow validation errors.** Inline on offending nodes (red badge) + listed at bottom of right inspector. Save & activate is disabled until all errors resolve. Warnings (e.g., "estimated cost is high") render as score-fair amber and do not block save.

**Marketplace install failure.** If the install fails (Paddle declines, manifest invalid, version conflict), a modal appears with: failure reason in plain English, suggested next step, and a `Try again` button.

### 9.4 Workflow infinite-loop / runaway detection

Beyond the static cycle detection (4.7), the runtime has **dynamic guards**:

- **Max recursion depth** (10 by default). If a workflow recursively calls itself or a sub-workflow triggers the original, the runtime cuts off at depth 10 and emits a warning event.
- **Max iterations on Loop nodes** (10,000 by default; configurable per workflow up to 1,000,000 on Scale). Exceeding the limit halts the loop and emits a warning.
- **Cost ceiling per run** (configurable; default = 5× the static estimate). If a workflow's runtime cost exceeds the ceiling, the runtime halts and emits an alert.
- **Time ceiling per run** (default 30 minutes for the entire workflow). Exceeding halts.

When any guard fires, the workflow's index row shows a red `Halted` pill and the user gets an in-product notification + email. The user can adjust the ceilings or fix the workflow and re-run.

### 9.5 Marketplace agent uninstall + rollback flow

Detailed in 5.4. Edge cases:

- **Rollback past TTL.** If an agent's actions are older than 30 days (the default rollback TTL), they cannot be rolled back. The uninstall modal shows: *"3 actions can be reverted; 12 cannot due to TTL expiry. Continue?"*
- **Cascading effects.** If rolling back action A would invalidate a downstream action B by another agent, the runtime computes the cascade and presents it: *"Rolling back A will also revert B (Citation Fixer, Apr 22). Total revert: 7 actions. Continue?"*
- **Active subscription.** If the user uninstalls an agent with an active monthly subscription, the modal asks whether to cancel immediately (effective end-of-period) or pause subscription (re-installable without re-paying within the period).

### 9.6 Tier downgrade

If the user downgrades from Scale to Build, agents that were Scale-only switch to LOCKED. Their state pill becomes `LOCKED`, their toggles disable, their schedules pause (without losing config). Their in-flight jobs are allowed to finish. Workflows that depended on Scale-only agents enter `Halted` state with a clear reason. The user is prompted to either upgrade back or restructure their workflows.

### 9.7 Conflict between custom instruction and Brief

Detailed in 3.5. The inline warning is non-blocking — the user can save the conflicting instruction, but the runtime will favor the Brief at execution time and emit a warning per run that the instruction is being overridden.

### 9.8 Concurrent edits (Yossi shares his account with a junior at his agency)

Optimistic concurrency with last-writer-wins on per-field saves. If two users edit the same custom instruction simultaneously, the second save shows a 200ms confirmation dialog: *"Junior edited this 30 seconds ago. Their version: [diff]. Override?"* with `Cancel / Override` buttons.

(Note: full multi-user editing with real-time sync is an explicit non-goal at MVP. Per Architect, Yossi's agency users see eventual consistency, not Figma-grade live cursors. If multi-user editing becomes a top-3 feature request, revisit.)

---

## 10. Frontend implementation notes

**Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS, Shadcn/UI primitives, Framer Motion for `motion/*` tokens, `react-flow` for the Workflow Builder canvas, `roughjs` for hand-drawn marks (Margin monograms, custom-instruction seal, empty-state illustrations).

**Routes:**
- `/crew` — roster (default)
- `/crew/workflows` — workflow index
- `/crew/workflows/new` — workflow editor (new draft)
- `/crew/workflows/[id]` — workflow editor (existing)
- `/crew/audit` — global audit log
- `/crew/[agent-id]` — agent profile (with `?tab=audit` etc. for deep links)

**State management:** TanStack Query for server state (agent list, run history, workflow definitions, audit envelopes). Zustand for local UI state (filter chips, selected node in editor, drawer open state). Server actions for mutations (autonomy change, instruction save, workflow save, run-now trigger). Optimistic updates everywhere; on failure → rollback + toast.

**Real-time:** Supabase Realtime channels for agent state pills (WORKING/IDLE transitions) + workflow run progress on the canvas. One channel per `(account_id, agent_id)`. Throttle UI updates to 4Hz to avoid render thrash.

**Performance:**
- Roster: 18 rows, no virtualization needed; render <200ms FCP.
- Audit log Timeline: virtualize at >200 rows with `react-virtuoso`.
- Workflow editor: React Flow's built-in viewport culling handles 100+ node graphs.
- Provenance drawer: lazy-load tabs (only fetch envelope JSON when drawer opens).

**Accessibility:**
- All interactive controls reachable via keyboard with visible 1px brand-blue focus rings.
- Roster row, agent profile sections, workflow nodes: ARIA-labelled with descriptive text.
- Color is never the sole signal: state pills use both color and label; success/failure icons accompany red/green.
- `prefers-reduced-motion` removes ring pulse, edge flow animation, microcopy rotation, and motion-budgeted entrance choreography. Static compositions designed first per Designer 1.5.
- Custom-instructions textarea on cream paper passes WCAG AA contrast (Fraunces 300 ink at 16px against `#F7F2E8` = 12.4:1).

**Testing:**
- Visual regression via Playwright + percy for roster, profile, workflow editor canvas, audit drawer.
- E2E flows: install Marketplace agent → it appears in roster; build 5-node workflow → save → run → verify audit log entries; downgrade tier → verify locked rows.
- Performance budgets enforced in CI (Designer Section 4 — motion budget, frame rate, JS payload).

**Build sequencing (suggested):**
1. Roster page + agent profile (no Workflow Builder)
2. Audit log unified view
3. Marketplace integration (install/uninstall flows; assumes Marketplace is already shipped or stubbed)
4. Workflow Builder (the largest single piece — estimate 6–8 weeks of focused build)
5. Yossi-specific affordances (multi-client switcher, per-client workflow library)
6. Mobile read-only

This sequence lets us ship `/crew` for Discover and Build tiers (Roster + audit + Marketplace) before the Workflow Builder is fully baked. Yossi-tier (Scale) waits for the Workflow Builder. That's the right phasing — Discover/Build users don't need workflows; Scale users do.

---

## Closing

`/crew` is where Beamix's 18-agent architecture is finally visible — to the people who paid for the depth. Sarah glances and leaves; Yossi lives here. The page must read as **professional + dense + transparent + respectful of your time**, all at once. The roster is a Stripe-style table. The profile is a personnel file (this is where ceremonial yearbook-grade craft lives). The Workflow Builder is a power tool. The audit log is a courtroom record. The Marketplace is the labor pool. *(2026-04-28 board lock.)*

Outside `/crew`, Beamix says *"we did this."* Inside `/crew`, you can say *"who exactly, and why, and on what authority, and can you undo it."* That is the contract.

Every move here is in service of two things: (1) **the Yossi who decides whether to renew at $499/mo** based on whether `/crew` makes him feel like he's running a team, not babysitting software, and (2) **the Sarah who, on her one curious visit, walks away thinking "this is serious"** rather than "this is overwhelming." We hit both by leaning into the Designer's restraint where Sarah might pass through (the table grammar, the Stripe-style chrome, the absence of unnecessary flourish) while indulging Yossi's depth where he lives (the custom instructions in Fraunces on cream, the audit envelopes in the drawer, the Workflow Builder's full DAG canvas, the per-client switcher).

The Activity Ring stays on /home. The cream paper stays on artifacts. /crew gets its own signature: **the 18 monograms in the Margin**, **the first-person agent voices**, **the cream-paper custom-instruction editor**, and **the seal that draws on instruction save**. Three borrowed brand moves; one new one (the monogram-as-Margin pattern, repeated across surfaces). That's enough to make /crew feel like *the same product, in its working clothes*.

This is the surface that earns the price.

— senior product designer, /crew
