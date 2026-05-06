# /crew/workflows — Workflow Builder Canvas Design v1

**Author:** Senior Product Designer (power-user surfaces / DAG-editor specialist)
**Date:** 2026-04-28
**Status:** Pixel-precise spec, ready for build-lead estimation
**Source-of-truth references:**
- `docs/08-agents_work/2026-04-27-CREW-design-v1.md` §4 (sketch superseded by this doc), §1–2 (register continuity)
- `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` §1 (tokens), §6.4 (Admin Utility), §6.1 (Editorial Artifact)
- `docs/08-agents_work/2026-04-27-BOARD-architect.md` §3 (DAG runtime, dry-run, cycle detection, bundle strategy)
- `docs/08-agents_work/2026-04-27-BOARD-yossi-simulator.md` (the workflow scenario this surface must serve)
- `docs/08-agents_work/2026-04-27-BOARD-trust-safety.md` §3 (review pipeline, kill switch)
- `docs/08-agents_work/2026-04-27-BOARD-MEETING-SYNTHESIS.md` (locked hybrid scope: full DAG + dry-run + 3–6 templates day 1; event triggers + publishing → MVP-1.5)

---

## 1. Page job + Yossi's primary workflows

The Workflow Builder is the single feature that justifies the 2.6× price step from Build ($189) to Scale ($499). Yossi lives here; Marcus visits once and marvels; Sarah never visits.

**Three workflow shapes the canvas must serve:**

1. **Competitor → fix → review → ship** (~60%). Schedule daily 6am → Competitor Watch on `acme.com/compare/*` → Citation Fixer on matching client page → Notify Slack → Wait for approval → Custom HTTP (GitHub PR) → Notify CTO. 7 nodes.
2. **Weekly client-pack** (~25%). Schedule Mon 7am → fan-out across Schema Doctor / FAQ Agent / Trust File Auditor in parallel → Reporter compose → Generate Monthly Update → email. 8 nodes, branching.
3. **Diagnostic / one-shot** (~15%). Manual trigger → single agent with narrow input filter, dry-run armed. *"Show me what Citation Fixer would do on Vinotek's collections page."*

All three shapes must feel like 60-second compositions. They are the test set.

---

## 2. /crew/workflows route — list view + empty state

**Route:** `/crew/workflows` — reached from the /crew left-rail tab `Roster · Workflows · Marketplace` or Cmd-K typing "wf". No React Flow loads here; bundle stays light.

**Tier gate.** Build/Discover users see a locked surface — full Editorial register, cream paper, single Fraunces line *"Workflows are part of Scale — the place where Beamix becomes yours."* + primary CTA *Upgrade to Scale →*. Scale replaces with the working view.

**Scale-populated layout.** Page max-width 1340px (matches /crew). 72px breath, title "Workflows" 48px InterDisplay 500 `cv11` letter-spacing -0.01em, subtitle 13px Inter ink-3 *"4 workflows · 2 active · 1 paused · 1 draft"* (segments click-to-filter).

Toolbar sticky 56px `paper-elev` + 1px border bottom: 280px search left, filter chips (`Active · Paused · Drafts · All`, `Trigger ▾`), right cluster ghost `Browse templates →` + primary `+ New workflow` (brand-blue, 36px, `radius-chip`).

Workflow table (`paper`, `radius-card`, 1px border):

| Column | Width | Content |
|---|---|---|
| Name | flex | 15px Inter 500 ink + 13px ink-3 description |
| Trigger | 168px | 16×16 icon + "Mon 9:00 Asia/Jerusalem" / "Manual" / disabled "Coming MVP-1.5" |
| Steps | 88px | "7 steps" + 96px monogram strip (max 4, "+3" trailing) |
| Last run | 112px | 13px Geist Mono "14m ago" or "—" |
| Status | 88px | Pill: Draft / Active (brand-blue dot) / Paused / Error (score-critical dot) |
| Owner | 88px | "You" / "Beamix" (template) |
| Actions | 56px | Caret menu: Edit · Duplicate · Pause · Run now · Delete |

Row 56px tall. Hover `paper-elev`. Click → open canvas. Right-click → context menu.

**Empty state (Yossi just upgraded, 0 workflows).** Centered 480px column, 48px from toolbar: a single `text-serif-lg` line (28px Fraunces 300 italic, opsz 144, ink): *"Workflows are how you teach the crew your operating procedure."* Below in 15px Inter ink-3, max 320px: *"Compose triggers, agents, and outputs into a DAG. Beamix runs them on your schedule and reports back."*

48px below: the **template gallery** (§11) — 3-column grid of 320×200 cards, 24px gap. Below grid: 13px ink-3 link *"Or start from a blank canvas →"*.

No illustration — anti-pattern §7 forbids illustrative empty states except /inbox. The template gallery IS the illustration.

---

## 3. Canvas layout (1440×900)

When Yossi clicks a workflow row or `+ New workflow`, canvas opens at `/crew/workflows/[id]`. SSR-off `dynamic()` import (Architect §3.5). On entry: `WorkflowEditorSkeleton` for ~140ms, then canvas snaps in (no fade — skeleton matches final layout exactly per anti-pattern "no shimmer").

**Full-bleed focus mode.** Global topbar replaced; left-rail tabs replaced. Escape → back to `/crew/workflows`.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  WORKFLOW TOPBAR (56px, paper, 1px border-bottom)                            │
│  [← /crew/workflows]  [Workflow name · v3 · Draft]    [Saved 2s ago]         │
│                              [Dry-run] [Save draft] [Save & activate]        │
├───────┬──────────────────────────────────────────────────────────┬───────────┤
│       │                                                          │           │
│ LEFT  │             CANVAS (paper, 24×24 dot grid)               │   RIGHT   │
│ PALETTE│                                                          │ INSPECTOR│
│       │   ┌──────────────┐                                       │           │
│ 280px │   │ Trigger      │                                       │   320px   │
│       │   └──────┬───────┘                                       │           │
│       │          │                                                │           │
│       │   ┌──────┴───────┐                                       │           │
│       │   │ Citation Fxr │                                       │           │
│       │   └──────┬───────┘                                       │           │
│       │          │                                                │           │
│       │       (...)                                               │           │
│       │                                                          │           │
│       │                              [Minimap 200×120 bottom-rt] │           │
└───────┴──────────────────────────────────────────────────────────┴───────────┘
```

Canvas viewport: `calc(100vw - 600px)` × `calc(100vh - 56px)`.

**Canvas background (2026-04-28 — Adam's Decision C lock):**

The canvas does NOT use a dot grid. Background is **`--color-paper-cream` at 30% opacity over `--color-paper`** (white). Effect: a sheet of cream paper visible through 70% white, giving a subtle warm-paper feel without breaking the Admin Utility chromatic register too far.

Rationale: a workflow is a sentence written in the constitution. The Brief is cream paper; the Brief grounding cell (in the inspector) is cream paper; the canvas extends this register to the surface where workflows are *composed*. Beamix's Workflow Builder feels like writing — not like configuring.

The 24×24 grid stays as INVISIBLE math (used internally for snap-to-grid alignment) without becoming visible furniture. No dot pattern is rendered.

(Decision C overrides the original Designer's "Admin Utility = clinical canvas" position. Justified because Admin Utility already permits one cream cell — the Brief grounding cell — and the canvas-as-cream completes the writing metaphor.)

Pan: space-drag or middle-mouse. Zoom: Cmd-scroll, pinch, `+`/`-`. Minimap bottom-right 200×120 `paper-elev` `radius-chip` toggleable with `m`.

**Topbar (left → right):** 16px from edge, `← /crew/workflows` breadcrumb 13px Inter 500 ink-2 (Cmd-`[`); 12px gap, workflow name 16px Inter 500 ink (click-edit inline, Enter commits, Esc reverts); 8px gap, `paper-elev` chip with `v3 · Draft` in 11px Geist Mono ink-3 (click → version popover §9). Center-left: save state pill 13px Inter ink-3 (states in §9). Center: validation pill — *"Ready · 0 errors"* with `--color-score-good` dot OR *"3 issues — review →"* score-critical dot (clickable, scrolls inspector to issues). Right cluster 16px from edge: **Dry-run** ghost button 36px (icon 14×14 dashed-stroke circle, hover tooltip *"Run this workflow against real data without writing changes. Costs 1 agent credit per node."*); **Save draft** ghost (enabled when dirty); **Save & activate** primary brand-blue 36px `radius-chip` 8px (NOT `radius-pill` — pill reserved for marketing per §1.5; disabled with tooltip if errors).

Left palette 280px, right inspector 320px, both `paper-elev` + 1px border on canvas-facing edge, scroll independently, both collapsible via 16px chevron handle for full-bleed canvas mode.

**Cmd-K quick-add** anywhere on canvas: 480px fuzzy palette (`paper-elev`, `shadow-lg`) listing all node types. Type "fix" → Citation Fixer; Enter places at viewport center. The Yossi power-user keystroke.

---

## 4. Trigger node spec

Every workflow has exactly one trigger. The palette shows two trigger types active and one disabled:

### 4.1 Manual trigger
240×80 node. Background: `--color-paper-cream` at 30% over `--color-paper` (≈ `#FCFAF6`). The only canvas use of cream paper — the trigger is the workflow's signature, the place where intent originates, and so it carries an Editorial-register echo. Header strip 24px, `--color-brand` background, white 11px Inter caps tracking 0.10em: `TRIGGER · MANUAL`. Body 56px, 16px padding, 14px Inter ink: *"Run only when triggered manually."* Below: 12px Inter ink-3 last-run timestamp or "Never run."

### 4.2 Scheduled trigger (where design love goes)

Same frame; header `TRIGGER · SCHEDULE`. Body shows human-readable cadence in 14px Inter ink: *"Every Monday at 9:00 AM Asia/Jerusalem."* Below in 12px Geist Mono ink-4: cron expression `0 9 * * 1` — power-users verify; new users never read it.

**Cron picker (in the inspector, never on the node face).** Yossi never writes cron syntax. Segmented control with four modes:

- **Every** — minute/hour/day/week/month dropdowns. *"Every 30 minutes"* / *"Every Monday at 9:00 AM"* / *"Every 1st of month at 8:00 AM."*
- **At specific times** — date+time pickers, `+` to add. *"April 30 at 6:00 PM, May 7 at 6:00 PM."*
- **Interval** — number + unit. *"Every 4 hours starting now."*
- **Cron** — raw textbox for power users. Live preview line below in 14px Fraunces 300 italic ink-2 (one tiny dose of Editorial — parsing cron is a moment of editorial confidence): *"Reads as: every weekday at 9:00 AM."*

Timezone selector below (default = onboarding-set account TZ). Below that, **next 3 fire times** in 13px Geist Mono: `Mon 28 Apr 09:00 IST · Tue 29 Apr 09:00 IST · Wed 30 Apr 09:00 IST` — instant trust signal.

### 4.3 Event trigger — disabled placeholder

Event-trigger card sits below Schedule in palette with `Coming MVP-1.5` 11px caps badge on `paper-elev`. Drag disabled (`not-allowed` cursor). Hover tooltip: *"Event triggers — `competitor.published`, `score.delta`, `truth_file.changed` — ship after we've proven cross-tenant safety. Use Schedule + filter chips to approximate today."*

Visible-but-disabled by design: Yossi plans around what he can see; a hidden feature is one he doesn't know exists.

---

## 5. Agent node spec (per node anatomy)

Six MVP agents (Schema Doctor, Citation Fixer, FAQ Agent, Competitor Watch, Trust File Auditor, Reporter), one parameterized template per node.

**Agent node dimensions (2026-04-28 — Kare's tighten):**
- Width: **220px** (was 240) — tighter horizontal footprint
- Height: **72px** (was 88) — drops the config-summary line; user clicks into inspector for full config
- Header: 24px charcoal strip with category color
- Body: 48px (one tight row of 16×16 monogram + 14px name + status pill)
- The node reads as symbol, not form-field

**Node anatomy (2026-04-28 — Tufte cut redundant identifications):**
- KEEP: 24px header strip with category color (brand-blue for trigger, ink-2 for agent, ink-3 for action) + status pill
- CUT: 1px agent-color left stripe (was redundant — color already in header)
- CUT: 16×16 monogram in body (the header's category-color carries identity; agent name in 14px is sufficient at this scale)

**Header strip (24px tall).** `--color-ink-2` charcoal background. White text 11px Inter caps tracking 0.10em: `AGENT · CITATION FIXER`. Right edge: 12×12 status token matching /workspace step states —
- `pending` empty 1px ink-4 ring
- `running` `--color-brand` filled with `motion/ring-pulse` 1.6s
- `done` `--color-score-good` filled + 8×8 check
- `failed` `--color-score-critical` filled + 8×8 ×
- `dry-run-pending` dashed 1px brand-blue ring (armed but not committed)

**Body (48px tall, 16px horizontal padding).** Single row: agent name in 14px Inter 500 ink `cv11`, output handle hint right-aligned. The header's category color is the identity carrier; no body monogram, no left stripe, no config-summary line.

**Connection handles (2026-04-28 — Kare's discoverability fix):**
- ALWAYS visible at low priority: 6×6 ink-4 ring, 1px stroke, no fill
- On hover or active drag: brighten to 8×8 brand-blue solid dot
- Per n8n's pattern (the canonical reference for handle discoverability)
- Was: invisible until hover (discoverability bug, not design choice)
- Input top-center, output bottom-center; right-edge "any handle" available for branching layouts; top-input/bottom-output is canonical.

**States.**
- Default: 1px `--color-border-strong`, `radius-card` 12px, `paper`, `shadow-sm`.
- Hover: border → `--color-brand` at 40%, `shadow-md`; 3 horizontal ink-4 drag dots appear at top.
- Selected: 2px solid `--color-brand` + `shadow-md`. Inspector populates.
- Conflict: 2px `--color-needs-you` border + 16×16 amber triangle top-right.
- Cycle: edges go red, not node (§10).
- Dry-run executing: brand-blue handle dots flow `motion/path-draw` along inbound edge.

~~Color-coding limited to a 1px left-edge stripe inside body, in the agent's /crew-assigned color.~~ **(Cut 2026-04-28 — Tufte: the header strip already carries identity; the stripe was redundant.)** Full background tint would produce rainbow chaos at 8+ nodes — header strip alone is sufficient identity.

**Action nodes** (Notify, Conditional Branch, Wait, Custom HTTP) use frame 240×64 (no monogram row), header strip `--color-ink-3` (lighter — plumbing vs labor), 13px Inter body summary. Conditional Branch has two output handles labeled `if`/`else` in 11px caps along the bottom.

---

## 6. Edge / connection spec

Edges are the structure. They must read as intentional lines, not afterthoughts.

- **Default edge.** 1.5px stroke `--color-ink-3` (#6B7280), React Flow bezier with control tension 0.4 (curved reads composition; sharp angles read CAD). 8×8 chevron at target end.
- **Active edge** (during real or dry-run execution): stroke becomes 2px `--color-brand`. One 4px brand-blue dot travels at 480px/s via `motion/path-draw`. One dot, not a stream — multiple read like Christmas lights.
- **Branch edges (`if`/`else`).** Labels in 11px Inter caps tracking 0.08em on a 4×8px `paper-elev` pill, `radius-sm` 6px, midpoint-positioned. `if` labels in `--color-brand-text`; `else` in ink-3.
- **Drawing.** Hover output handle → 6×6 brand-blue dot appears. Click-drag → 1.5px brand-blue wire follows cursor. Drop on input handle → 200ms `motion/edge-draw` (dasharray-stroke source→target, `cubic-bezier(0.2,0,0,1)`).
- **Drop on existing edge** → auto-split, new node inserts inline (n8n/Make grade), 240ms reflow.
- **Delete.** Click edge → 2px brand-blue ghost + 4×8px delete pill at midpoint. `Delete` key or right-click context menu.
- **On save.** A one-shot 600ms ink-fill along active edges — the only save-time motion. No position-animations (motion anti-pattern).
- **On dry-run.** Executing path lights brand-blue at 40% (background trace); dots travel along currently-running nodes; completed edges turn `--color-score-good` 1.5px until the user clears state.

---

## 7. Inspector — Brief grounding (THE distinctive move)

This is the canvas's design soul. It is what makes Beamix's Workflow Builder visibly, structurally, irreducibly different from Zapier, n8n, and Make.

When Yossi selects a node, the right inspector populates with **four stacked sections**, top to bottom. The first three sit in Admin Utility (white surface, Inter, clinical). The middle section — Brief grounding — is a **cream-paper Editorial cell embedded inside the Admin surface.** This is a deliberate register-shift, the same move /scan Frame 8 uses (a clinical engine grid floating inside cream paper, but inverted: here, a cream paper paragraph floating inside a clinical surface).

### 7.1 Inspector structure (top to bottom, 320px wide)

```
┌──────────────────────────────────────┐
│ [HEADER] Citation Fixer  [×]         │  56px
│                                      │
│ ▾ Configuration                      │  expandable
│   Apply on:  [/compare/api-monit ▾] │
│   Autonomy:  ( ) Auto  (•) Review   │
│   Max edits per run: [3            ] │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  ╔══════════════════════════════╗   │  ← cream cell
│  ║                                  ║   │
│  ║  Authorized by your Brief        ║   │
│  ║                                  ║   │
│  ║  "show up for emergency-         ║   │
│  ║   plumbing queries on            ║   │
│  ║   ChatGPT — local, fast,         ║   │
│  ║   clear pricing."                ║   │
│  ║                                  ║   │
│  ║  — clause 2 of 4    Edit Brief → ║   │
│  ║                                  ║   │
│  ╚══════════════════════════════╝   │
│                                      │
├──────────────────────────────────────┤
│ ▾ Truth File reads                   │
│   • services[]                       │
│   • voice_words[]                    │
│   • never_say[]                      │
│                                      │
├──────────────────────────────────────┤
│ ▾ Validation (will run automatically) │
│   • Brand Voice Guard ≥ 0.85        │
│   • Truth File Auditor 'never_say'  │
│   • Schema Doctor sanity            │
│                                      │
├──────────────────────────────────────┤
│ ▾ Provenance preview                 │
│   [JSON tree, collapsed]            │
│                                      │
└──────────────────────────────────────┘
```

### 7.2 Section 1 — Configuration (Admin Utility)

`paper-elev` (one tone above canvas-default), 24px padding. Section header: 11px Inter caps `CONFIGURATION` ink-3, tracking 0.10em. Right chevron toggles collapse.

Fields stack vertically 16px gap. Each is a Stripe-grade field: 36px tall, `radius-chip` 8px, 1px `--color-border-strong`, `paper` bg, focus-ring `--shadow-focus`. Save on blur, optimistic, toast `motion/toast-slide-up` 220ms on failure.

Per-agent fields are agent-specific (rendered off the build-time agent manifest, Architect §3). Citation Fixer: `Apply on` URL pattern, `Max edits per run`, `Autonomy override` (Inherit · Auto · Review · Escalate), `Output destination` (Inbox · Direct CMS · GitHub PR). FAQ Agent: `Question pool source`, `Tone override`, `Max FAQs per page`. Reporter: `Template`, `Recipient list`, `Cover-letter style`.

### 7.3 Section 2 — Brief grounding (the design soul)

**This is the cell that compresses Beamix's constitutional moment into the inspector.** When the Brief was authored in onboarding, it lived on cream paper in 28px Fraunces 300; that paper does not get to live only in onboarding. The clause comes back to Yossi every time he composes a workflow node. The system reminds him: this step is not arbitrary; it answers to the Brief he wrote.

**Visual spec.**

The cell is a 272px-wide × auto-height container, 24px from inspector left edge, 24px from right. Background: `--color-paper-cream` (`#F7F2E8`). Border: none — the paper edge is the border (per Editorial register §6.1). Padding: 24px all sides. `radius-card` 12px. Drop shadow: `--shadow-sm` warm-tinted to bridge the register shift.

Inside the cell, top to bottom:

1. **Eyebrow label.** 11px Inter caps tracking 0.08em, `ink-3`, content: `AUTHORIZED BY YOUR BRIEF`. 16px gap below.
2. **The clause itself.** `text-serif-lg` (28px Fraunces 300, opsz 144, soft 100, wonk 0, italic, `ss01`), `ink`. The clause text is rendered with curly quotes (`"…"`), no straight quotes. Hyphenation enabled. Line-height 40px. Maximum 4 lines before truncation with a "Read more →" affordance — most clauses are 1–3 lines.
3. **24px gap.**
4. **Provenance line.** 13px Inter `ink-3`. Pattern: *"— clause 2 of 4    Edit Brief →"* — left-justified clause reference, right-justified `Edit Brief →` link in `--color-brand-text` 13px Inter 500 underlined-on-hover. Click navigates to `/settings/brief` with the clause anchored and highlighted.

**Why the cream paper survives the register-shift.** The register-shift is the design statement. Inside Admin Utility, Beamix doesn't normally use cream — but the Brief is constitutional, and the constitution is in Editorial. This cell is the *only* place in the entire product where Editorial register lives inside Admin Utility. That singularity is why it carries weight. If we used cream casually elsewhere, this moment would be ordinary.

**Brief grounding cell first-time-per-session (2026-04-28 — Ive's mechanic, Decision B lock):**

When a node is selected, the Brief grounding cell renders in cream paper + Fraunces 300 italic (locked per Decision B).

**First selection per session:**
- Cell fades in over 400ms (slower than subsequent — feels invoked)
- One-time Trace underneath the clause text — Rough.js underline at 28% opacity, drawn over 800ms
- The Trace persists as long as the cell is visible in this session (does NOT redraw on subsequent selections)

**Subsequent selections per session:**
- Cell fades in over 120ms (standard panel-switch speed)
- No Trace under clause (used the one-time-per-session weight already)

The constitution feels invoked the first time, routine thereafter. Singularity creates weight.

### 7.4 The Brief-clause matcher (LLM-assisted)

When Yossi drops a Citation Fixer node onto the canvas, the inspector opens with the Brief grounding cell **pre-populated**. How does it know which of the 4 Brief clauses to surface?

A single Claude Haiku call fires on node creation:
- **Input:** the agent's purpose ("Citation Fixer rewrites comparison and FAQ blocks to surface in AI-engine answers"), the agent's manifest `domain` tags, and the customer's Brief (4 clauses, ~600 words total).
- **Output:** structured JSON `{ clause_index: 1, confidence: 0.92, rationale: "Clause 2 references emergency-plumbing queries, which Citation Fixer optimizes for." }`.
- **Fallback:** if confidence < 0.7, the cell renders with a placeholder: *"Choose the Brief clause that authorizes this step →"* and a clause-picker dropdown.

**Yossi can override.** A small chevron menu in the cell's bottom-right opens a dropdown of all 4 clauses; Yossi picks. The override persists per-workflow-per-node (stored in `workflow_nodes.config.brief_clause_index`).

**No clause matches?** A footer line in 13px Inter `ink-3` italic: *"None of these? Add a clause to your Brief →"*. The Brief is constitutional and editable; if Yossi's workflow exposes a gap in his Brief, the canvas surfaces the gap.

### 7.5 Section 3 — Truth File reads

`paper-elev` Admin. Header `TRUTH FILE READS` 11px Inter caps. Bullet list of TF fields this agent consults at runtime, 13px Inter ink-2. Click a field → opens it in `/settings/truth-file` via 320px side-drawer overlay (doesn't leave canvas). Workflow node and TF in conversation.

### 7.6 Section 4 — Validation

Bullet list of validators that will fire on this node's output: Brand Voice Guard with configured cosine threshold, Truth File Auditor with TF rules, Schema Doctor sanity (if schema-relevant). Each row clickable → opens validator settings.

### 7.7 Section 5 — Provenance preview

Collapsed by default. Expand → 12px Geist Mono JSON tree of the envelope structure this node will emit at runtime (keys only, values don't exist until execution). Same envelope surfaces in /workspace — visual continuity = trust.

---

## 8. Dry-run mode UX

**Trigger.** Yossi clicks `Dry-run` in the topbar. Modal slides up (`motion/modal-slide-up` 220ms, `paper-elev`, `radius-card`, `shadow-lg`, 480px):

```
Dry-run this workflow
─────────────────────────────────────
Executes every node with real LLM calls and
real Truth File reads. Renders the proposed
output without writing changes anywhere.

Estimated cost:  4 agent credits
Customer:        TechCorp B2B SaaS
Output renders:  /workspace (new tab opens)

[Cancel]                    [Run dry-run →]
```

**Execution.** On confirm: `workflow_runs` row inserts `mode='dry_run'`; Inngest fires `workflow/run.requested { dry_run: true }`; DAG runtime calls each agent's `propose()` with `dry_run: true` (Architect §3.5 — proposals partition to `inbox_items.status='dry_run'`).

**The canvas IS the execution view.** Does not close. As each node runs:

- Status indicator: `dry-run-pending` (dashed brand-blue ring) → `running` (filled brand-blue + pulse) → `done` (`score-good` + check).
- Active edge: 2px brand-blue, one dot travels source→target.
- **Execution-as-narration (2026-04-28 — Ive's narration refinement; replaces the prior floating dry-run console):**

  When the customer triggers Dry-run, every agent in the workflow executes with `dry_run: true` flag (real LLM execution, no writes to customer's CMS). The canvas renders execution live:
  - Each node's status indicator advances (queued → running → completed → failed) in real-time
  - Edges between currently-executing nodes light brand-blue with traveling 4px dots (motion/edge-flow at 1200ms loop)
  - **The right inspector temporarily transforms into a narration column** (replacing the static node inspector for the duration of execution)
  - Each node, while executing, pushes a sentence to the narration: *"Schema Doctor is reading /pricing for FAQPage schema. 2.3s."*
  - 18px Inter 400 sentences, 12px gap between sentences
  - Active sentences in `--color-ink`; completed sentences fade to `ink-2` over 30s
  - Geist Mono duration counter updates in real-time per sentence

  The console-log register (developer-tool reflex) is REPLACED by the narration column (Beamix-shaped). The execution becomes narration; the workflow becomes a sentence being read aloud.

  When dry-run completes, the narration column transitions back to the node inspector with a 200ms cross-fade. Final outputs viewable via *"Open in /workspace →"* link at the column's bottom.
- Per-node click swaps inspector from Configuration to a **dry-run output preview** view: actual proposed envelope, TF references resolved, validator scores live, diff rendered. Real agent output, never committed.

**Where the full output goes.** Toast 800ms after last node completes: *"Dry-run complete · 7 nodes · 4 credits used. Open in /workspace →"* (15s duration; click opens `/workspace?run_id=...&mode=dry_run` in a new tab).

**Why the split between canvas and /workspace.** The canvas shows the *flow*; /workspace (Journey Canvas register, §6.2) shows the *content the flow produced*. Forcing prose into a 320px inspector crowds it; forcing it onto the canvas hides the DAG. The split honors each surface's job. Yossi watches his DAG breathe in the canvas, then reads the artifact in /workspace.

**Cost transparency.** 1 credit per agent node. Shown in modal, toast, and topbar pill during execution (*"Dry-run · 4 credits"*). Hiding cost is a Yossi-grade trust fail.

---

## 9. Save flow + versioning

**Two states: Draft and Active.** A workflow has exactly one Active version (or `status='draft'` if never activated). Drafts auto-save debounced 800ms. Active workflows keep running on their committed version while a draft is being edited (Stripe deployment grammar).

**Topbar save state pill.** `Saving…` during the write; `Saved 2s ago` → `Saved 1m ago` → `Saved 14m ago` (relative, updates every 30s); `Unsaved changes` (`--color-needs-you` + 6px filled dot when write pending); `Sync error · Retry` (score-critical, clickable).

**Save & activate.** If validation has errors, modal blocks with the error list (clicking an error scrolls to the offending node). Clean → confirm modal:

```
Activate workflow v3
─────────────────────────────────────
You're activating "Competitor → Citation Fixer → PR".
This replaces the currently active v2.
Next scheduled run (Mon 9:00) will use v3.
v2 is preserved in version history.

[ ] Notify me on the first 3 runs

[Cancel]            [Activate v3 →]
```

On confirm: `workflow_versions` inserts immutable snapshot, `workflows.version` increments, `status='active'`. Topbar chip updates to `v3 · Active`. A 1.6s `motion/seal-draw` plays on the chip — the Seal mechanic from /home and /scan, scaled to chip size. One unique brand moment per activate. No confetti (anti-pattern §7).

**Version history popover.** Click the `v3 · Draft` chip → 320×auto popover (`paper-elev`, `shadow-lg`, `radius-card`):

```
Version history
─────────────────────────────────
● v3 · Draft (current)         editing now
○ v2 · Active                  Active since Apr 14
○ v1                           Apr 7 — Apr 14

[Restore selected →]
```

Restore is non-destructive: *"Restore v1 as a new draft? Your v3 changes save as v3-archived."* Up to 50 versions per workflow; banner at v45 prompts to pin keepers.

---

## 10. Cycle detection + resource conflict feedback

### 10.1 Cycle detection

Runs at save time (Architect §3.4 — Kahn's algorithm in the API route, 422 with offending node IDs).

**Visual when cycle detected (e.g., Schema Doctor → Citation Fixer → Schema Doctor):**

1. Offending edges turn 2px solid `--color-score-critical` (#EF4444).
2. 240ms shake on the cycle's first node (Stripe's invalid-input shake: translateX -2px↔+2px, 4 cycles, ease-out).
3. Topbar validation pill flips to *"Cycle detected"* in score-critical. Click → highlights edges + centers canvas on them.
4. Inspector pins a top alert card: *"Cycle: Schema Doctor → Citation Fixer → Schema Doctor"* with a `Resolve →` popover offering `Remove edge from Citation Fixer to Schema Doctor` / `Remove edge from Schema Doctor to Citation Fixer`.
5. Save & activate disabled. Save draft stays enabled — drafts may hold invalid topology, just not activate.

No toast, no banner. The canvas itself communicates the error. Yossi is looking at the canvas; that's where the message belongs.

### 10.2 Resource conflict feedback

Conflicts are warnings, not errors. Workflow saves; workflow activates; runs at risk. By design — sometimes Yossi wants two agents writing the same path (FAQ Agent generates, Brand Voice Guard rewrites).

**Visual when both write `json_ld:faqpage`:**

1. Both nodes: 2px `--color-needs-you` border + 16×16 amber triangle badge top-right.
2. **Conflict edge overlay** between them: 1.5px dashed amber, no chevron, 60% opacity, labeled 11px caps `WRITE CONFLICT · json_ld:faqpage`.
3. Inspector adds a section: *"Resource conflict — both Citation Fixer and Schema Doctor write json_ld:faqpage. Last writer wins at runtime. → Resolve"* with options: *Add execution dependency (sequence)* / *Limit one node by URL pattern* / *Acknowledge and continue*.

Per-conflict acknowledgment persists (`acknowledged_at`); after ack, border fades to 1px ink-4 + dot badge. Conflict still detectable, canvas stops shouting.

---

## 11. Templates — empty state library

**Six Beamix-curated templates ship at MVP**, surfacing in the `/crew/workflows` empty state and via `Browse templates →` in the toolbar.

**Card spec.** 320×200. `paper`, 1px `--color-border`, `radius-card` 12px, `shadow-sm`; hover → `shadow-md` + `border-strong`. 24px padding.

- Top half (96px): an embedded **static React Flow snapshot** of the template's DAG (no pan/zoom, no interaction, ~40% scale). Three to five tiny nodes wired with edges. The first thing the user sees is what they're buying.
- Bottom half: name in 16px Inter 500 ink; 13px Inter ink-3 description (2 lines max); footer row with `7 steps · Schedule` in 11px Geist Mono ink-4 left, `Use this template →` in 13px Inter 500 `--color-brand-text` right.

Click → clone into user's account as a new draft, open canvas immediately.

**The 6 templates:**

1. **Daily monitoring** — Schedule (weekday 9am) → Scan → Competitor Watch → If delta>3, Notify Slack. *5 steps.*
2. **Weekly digest with custom report** — Schedule (Mon 7am) → fan-out across 3 agents → Reporter compose → email. *6 steps.*
3. **Monthly client review** — Schedule (1st 8am) → loop over clients → Reporter per client → Monthly Update PDF → email. *7 steps. (Yossi white-label.)*
4. **New SaaS pillar content pack** — Manual → Competitor Watch on category → FAQ Agent → Schema Doctor → /inbox. *5 steps.*
5. **E-commerce product page optimizer** — Manual on URL → Citation Fixer → Trust File Auditor → /inbox. *4 steps.*
6. **Competitor citation hunt** — Schedule (daily 6am) → Competitor Watch → if new comparison page → Citation Fixer on matching URL → Notify Slack with diff. *6 steps. (Yossi competitor-watch.)*

Templates 3 and 6 are deliberately modeled on Yossi's two main shapes — when he opens the gallery, his own use cases are pre-built. 60 seconds to clone, customize, and ship.

---

## 12. Publishing UI (deferred to MVP-1.5)

Yossi sees the surface. The button is disabled. The roadmap is visible.

**Where the publish button lives.** Inside the right inspector when no node is selected (workflow-level metadata view), a *Sharing* card at the bottom:

```
Sharing
─────────────────────────────────
( ● ) Private — only you
( ○ ) Shareable link — anyone with the URL can clone

──────────────────────────────────
Marketplace
──────────────────────────────────
[ Publish to Marketplace ]      ← disabled
Coming MVP-1.5

Publishing lets other Scale customers install
this workflow. We're shipping it once cross-
tenant safety has 4–6 weeks of production
telemetry. Read the roadmap →
```

The disabled button uses `paper-elev` background, ink-4 text, `not-allowed` cursor. The "Coming MVP-1.5" badge is 11px Inter caps in `--color-needs-you` (warm, not red — deferred isn't broken).

**Why ship the surface at MVP.** (1) Yossi explicitly OK'd the deferral *if* the surface exists — the surface is the contract. (2) Implementing it disabled now costs ~30 minutes; retrofitting later requires inspector restructuring. (3) `Read the roadmap →` is a real link to `/changelog#workflow-publishing` — a trust artifact in itself.

**Shareable links** (private clone-via-URL, not a marketplace listing) DO ship at MVP. Toggle to "Shareable link" → a `paper-elev` row appears with Geist Mono URL `app.beamix.tech/workflows/share/abc123`, copy button, `Revoke` link. Handles the *"send my agency partner this workflow"* use case without touching the marketplace pipeline.

---

## 13. Brief grounding walkthrough (a real Yossi scenario)

4:47pm Tuesday. Yossi is composing the "competitor → fixer → PR" workflow on TechCorp's account. Schedule trigger placed, Competitor Watch (`acme.com/compare/*`) connected. He drags Citation Fixer onto the canvas.

**t=0** — He grabs the Citation Fixer card from the left palette; cursor goes `grab`; the preview ghosts at 40% opacity following the cursor.

**t=400ms** — He drops. The node materializes in 200ms (`motion/node-place`: scale 0.96 → 1, opacity 0 → 1, easing-out-expo). Status indicator: `pending` (empty ink-4 ring).

**t=600ms** — Inspector populates. Section 1 (Configuration) shows Citation Fixer's fields with sensible defaults.

**t=900ms — the moment.** A 300ms Claude Haiku call has fired in the background with the 4 Brief clauses + the Citation Fixer manifest. The Brief grounding cell fades in over 240ms (`motion/cell-rise`: opacity 0→1, translateY 8px→0). The clause appears in 28px Fraunces 300 italic, ink, on cream:

> *"focus on developer-tooling and API-discovery queries on ChatGPT and Claude, where developers ask 'what's the best library for X.'"*

Below in 13px Inter ink-3: *"— clause 2 of 4    Edit Brief →"*.

**t=1.2s** — Yossi nods. The Brief he wrote 7 days ago authorizes this exact step. The cream paper, the Fraunces, the clause itself — none of it is decoration; it is the constitutional moment compressed into the inspector.

**t=2s** — He clicks `Edit Brief →`. A 320px side-drawer slides from the right, rendering the full Brief in Editorial register (cream paper, 28px Fraunces, all 4 clauses; clause 2 highlighted with a 2px brand-blue border). He confirms, closes the drawer.

**t=4s** — Configures `Apply on: /compare/*`. Clicks canvas to deselect. The node sits with its quiet evidence: clinical body, cream-paper soul.

**The mechanic in one sentence.** *Every workflow node, the moment it's selected, presents the Brief clause that authorizes it — in Fraunces 300, on cream paper, italic, with a way to edit.* This is what Zapier and n8n cannot copy without rebuilding their data model.

---

## 14. Mobile treatment

The canvas is **explicitly desktop-only**. Below 1024px viewport, the editor route renders a fallback: workflow name + version chip + status pill on top; pan/zoom-only React Flow canvas (no editing) middle; 56px banner above in `paper-elev` ink-2 14px Inter 500 *"Open this workflow on a desktop to edit"*; 64px action row below with three buttons (`Run now`, `Pause`/`Resume`, `Share`), each 44px tall.

Yossi composes at his desk. On-the-go interaction is observation + override, not authoring.

The `/crew/workflows` index (Section 2) works on mobile at 375px with truncated columns (Name + Status + Actions kebab). Yossi can pause a misbehaving workflow from his phone in 4 taps.

---

## 15. Accessibility + keyboard + undo/redo

### Keyboard map (canvas focused)

| Key | Action |
|---|---|
| `Cmd-K` | Quick-add fuzzy palette |
| `Cmd-Z` / `Cmd-Shift-Z` | Undo / redo (50-step ring buffer) |
| `Cmd-A` / `Cmd-D` | Select all / duplicate at +24px |
| `Cmd-S` | Save draft |
| `Delete` / `Backspace` | Remove selected (confirm if downstream exists) |
| `Space` held | Pan mode (`grab` cursor) |
| `+` / `-` / `0` | Zoom in / out / reset 100% recenter |
| `Arrow` / `Shift+Arrow` | Nudge selected 8px / 24px |
| `Tab` / `Enter` / `Esc` | Next node (topological) / open inspector / deselect-then-close-popover-then-exit-pan |

Cmd-K from anywhere on /crew opens the global palette ("Open workflow…", "+ New workflow", "Run workflow…").

### Accessibility

- Every interactive element Tab-reachable. RF custom nodes use `role="button"` + `aria-label="Citation Fixer node, status pending, configures /compare/* URL pattern"`. Edges expose `aria-describedby` for screen readers.
- Contrast: chrome ≥ WCAG AA. `--color-brand-text` (#2558E5) used for body links (#3370FF fails AA on white at 13px). The Brief clause at 28px Fraunces ink on cream passes AAA.
- `prefers-reduced-motion` disables `motion/path-draw`, `motion/cell-rise`, `motion/seal-draw`, `motion/ring-pulse`. Status indicators use static colors; dry-run edges light up but no moving dot.
- Cycle detection announces via ARIA live region: *"Cycle detected: Schema Doctor to Citation Fixer to Schema Doctor. Resolve to enable activation."*
- `--shadow-focus` 3px brand-blue 25% halo on every focused element. Selection ring is additional — selected ≠ focused.

### Undo/redo

50-step ring buffer per workflow document. Tracked: node add/remove/move, edge add/remove, config edits (debounced 800ms — one undo step per idle window), Brief clause override. Save events do NOT clear undo. Restore-from-version-history clears undo.

---

## 16. Implementation notes

### 16.1 React Flow + bundle

`@xyflow/react` v12+, dynamic-imported on `/crew/workflows/[id]` only (Architect §3.5):

```typescript
const WorkflowCanvas = dynamic(
  () => import('@/components/workflow/WorkflowCanvas'),
  { ssr: false, loading: () => <WorkflowEditorSkeleton /> }
);
```

Custom node types: `triggerNode`, `agentNode`, `notifyNode`, `branchNode`, `waitNode`, `httpNode`. Custom edge types: `defaultEdge`, `branchEdge`, `conflictEdge`, `dryRunActiveEdge`. `<Background variant="dots" gap={24} size={1} color="rgba(10,10,10,0.04)" />`. Total chunk ~110kb gzipped — never loads on /crew or /crew/workflows index.

### 16.2 State shape (Zustand store)

```ts
interface WorkflowEditorState {
  workflow: { id, name, version, status, trigger_type, trigger_config };
  nodes: WorkflowNode[];   // RF-shape: id, type, position, data
  edges: WorkflowEdge[];
  selection: { nodeId?: string; edgeId?: string };
  validation: { errors: ValidationError[]; warnings: Warning[] };
  briefMatches: Record<NodeId, { clause_index: number; confidence: number; }>;
  dryRun: { run_id?: string; status; per_node_state: Record<NodeId, NodeRunState>; };
  saveState: 'saved'|'saving'|'unsaved'|'error';
  undoStack: WorkflowSnapshot[]; redoStack: WorkflowSnapshot[];
}
```

### 16.3 Endpoints

- `GET /api/workflows/:id` — full spec
- `PUT /api/workflows/:id` — debounced 800ms save; Kahn's cycle check + write-target conflict scan; 422 on cycle
- `POST /api/workflows/:id/dry-run` — fires Inngest `workflow/run.requested { dry_run: true }`; returns `run_id`; client subscribes to `agent_run_state` realtime channel
- `POST /api/workflows/:id/activate` — version bump + immutable snapshot to `workflow_versions`
- `POST /api/workflows/match-brief` — `{ agent_id, customer_id }` → `{ clause_index, confidence, rationale }`. Claude Haiku, ~300ms p50, cached per (agent_id, brief_hash) in `agent_memory` 24h.

### 16.4 Brief-clause matcher

System prompt: *"You map agents to Brief clauses. Given an agent's purpose and a customer's Brief, return the index of the clause that most authorizes the agent's work, with confidence 0–1 and one-sentence rationale."*

Fires on node creation + Brief edit (cache bust). ~$0.0001 per match; at 2000 nodes/month across all customers, ~$0.20/month total cost. Cheap; meaningful.

### 16.5 Perf + tier gating

- Canvas TTI < 1.2s on M2/50Mbps (skeleton 140ms → RF mount 600ms → hydration 1.1s)
- Per-node render < 16ms for up to 50 nodes
- DAG runs emit per-step via Supabase realtime; client patches one indicator at a time, no full re-render
- **Tier gate**: server check `customer.tier !== 'scale'` → 403 on every workflow endpoint. Client-side route guard redirects non-Scale to the locked surface (§2). Both required — client is theatre, server is law.

### 16.6 Build estimate (delta from Architect §3 viewer-only budget)

Custom nodes (6 agents + 5 actions + 1 trigger) ~5d · Inspector 5 sections + Brief matcher ~4d · Cycle/conflict UI ~2d · Save+version chip ~1.5d · Dry-run UX + /workspace handoff ~3d · 6 templates ~2d · Mobile fallback ~0.5d · A11y/keyboard ~1.5d. **~19.5 person-days canvas + ~6 days runtime = 25.5 person-days total.** Achievable inside the 2-week MVP build sprint with parallel ownership (canvas team + runtime team).

---

## 17. Reference exemplars analyzed

- **Zapier:** strong "if-this-then-that" mental model; linear list view rejected. Borrowed: trigger-first orientation.
- **n8n:** closest visual referent — top-down DAG, drag-from-handle, conditional branches, dry-run. Borrowed: canvas grammar. Rejected: corporate-saas-2018 chrome.
- **Make.com:** rich but chaotic (too many colors, too many icons). Borrowed: auto-edge-split-on-drop.
- **Linear automations:** rules-only, not DAG. Borrowed: version chip + inspector form grammar.
- **GitHub Actions visual editor:** borrowed the trigger-card prominence + the "next 3 fire times" preview line.
- **Cursor tool-call traces:** conceptual model for the dry-run console and per-node output preview — execution lives in the same surface as composition.

The single move none of these exemplars have: *the inspector's cream-paper Brief grounding cell.* That is Beamix's. It is what makes a workflow not a script but a constitutional act.

---

## 18. Brief binding line at page bottom (F31, locked 2026-04-28)

A single line sits at the bottom of the workflow editor page (below the canvas, above any footer chrome):

- 13px Fraunces 300 italic `ink-3`, centered
- Rotates daily through 4 Brief clauses (the customer's own clauses, surfaced by index 1–4)
- Visible on every load of the workflow editor; the binding line carries the constitutional voice into the composition surface
- No animation, no CTA — pure quiet text. The customer is reminded that what they compose answers to what they signed.

— Senior Product Designer, 2026-04-28
