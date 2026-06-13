---
doc: WF-3 UI Excellence Audit — Systemic Synthesis + Polish Plan
date: 2026-06-12
pages_audited: ask · builder · automation · archive · blog-studio
all_verdicts: NEEDS_WORK (0 PASS, 0 redesign-mandatory by brand-law; 1 redesign-grade by craft gap)
source_docs:
  - ./ask.md
  - ./builder.md
  - ./automation.md
  - ./archive.md
  - ./blog-studio.md
---

# WF-3 — Systemic Synthesis

All five pages returned NEEDS_WORK. None has a brand-law BLOCK (no retired colors, no font
violations, no slop-grade N-equal grid in the broken sense). Every page sits in the #173-dashboard
family — above template-grade. The gap to the Profound/Otterly bar is **craft**, and crucially it
is **the same five craft gaps repeated across pages because they live in shared components and
global tokens.** Fix those once and the cascade lifts every page; then a thin per-page pass closes
the rest.

---

## 1. SYSTEMIC PATTERNS (fix once → cascade)

### S-1. Capture/process failure — ONLY `populated-desktop` exists for all 5 pages
Every audit could see exactly one state. Empty, loading, error, mobile-375 — and on three pages the
**declared signature moment itself** — were never screenshotted:
- ask: the violet `GroundingLedger` morph only mounts while pending → invisible in every render.
- builder: the dry-run ledger overlay (`page.tsx:18` "the ONE signature moment") + template gallery empty state → never rendered.
- blog-studio: success markdown editor, running PipelineLedger, tier-locked → never rendered.
This is a **harness gap, not a design gap** — but it hard-blocks PASS on all five. The empty state is
what real users see first (ask `page.tsx:58`, builder gallery), and mobile-375 is the highest-risk
unaudited state on every page. **Action: a single capture pass that drives each page's `?state=` /
demo-tier overrides through empty/loading/error/mobile + the signature moment, then re-audit.** This
is shared infrastructure, owned centrally, not by per-page polishers.

### S-2. Tell #8 — blue=you/violet=agents is sub-threshold everywhere (global violet tokens too pale)
The brand's single most important idea is invisible at arm's length on **5 of 5** pages because the
shared agent-zone tokens are washed out:
- `--color-agent-tint #EEEAFD` used as a thin segment tint, not a zone ground (automation, blog-studio, builder).
- `#6E56F0/30` and `#6E56F0/40` hairlines/dots read grey (automation `AgentModeRow.tsx:107`, `page.tsx:65`).
- archive: Mode + Status are four near-identical chips, so the you/agents axis doesn't read (`RunTable.tsx:81-123`).
- builder: violet present but as a heavy 3px rounded top-lip, not a spatial ground (`WorkflowCanvas.tsx:214`).
**Root cause is the token opacities + the "tint a segment, not the zone" pattern, not five independent
bugs.** Raise the agent-tint to a real zone ground and the hairline to solid `#6E56F0`, define a
canonical "agent zone" treatment once → cascades to automation, blog-studio, builder, archive, ask.

### S-3. Tell #5 — content floats in a dead-whitespace void (shared layout shell + canvas)
`max-w-[880px]` columns and centered canvases sit in a ~1440px main area with no balancing element,
reading as "left-dumped / broken right half," not asymmetric-with-intent:
- builder: 360px centered node spine in a full-width dotted void — the worst instance, ~half the width is decorative nothing.
- blog-studio: ~430px of empty white right of every `ToolPage` card.
- archive: columns float to ~70%, COST header + chevron stranded mid-card.
- automation: header stat card floats past the body's `max-w-[880px]` right edge.
The shared cause is the **`ToolPage`/Console-Spine column + DashboardShell main width** giving no
recipe for the freed right space. The systemic fix is a **shared "earn the width" pattern**: either a
true center, or a canonical right-rail slot (live context / resting cost figure / preview) that pages
opt into. Decide this once at the shell/ToolPage level.

### S-4. Tell #4 — the signature data detail is faint or absent (shared `EngineMicroSparkline`)
The micro-sparkline that is supposed to be the repeatable signature renders as a 1.5px hairline that
reads as a stray mark (blog-studio `EngineMicroSparkline.tsx:85`, faint green diagonal), and is simply
absent on automation rows and archive rows. **One shared component fix** — thicker stroke + endpoint
dot + faint baseline + optional trend delta — makes the signature legible everywhere it is used and
gives automation/archive rows the in-row data texture they lack.

### S-5. Tell #6 — the one Fraunces beat lands on a weak word / at body size (shared `SerifVerdict`)
The single editorial serif beat is wasted on **4 of 5** pages:
- ask: lands on the common noun "gap" at 16px body — reads as an accidental italic (`AskThread.tsx:42`).
- archive: "replay" inside a 15px grey caption — does not register as serif at all (`page.tsx:30`).
- automation: "handled" in a `#9CA3AF` footer note, below the fold (`page.tsx:288`).
- blog-studio: no serif beat in the captured idle state at all.
- builder: the ONE page that gets it right (Fraunces on the workflow title) — preserve as the pattern.
The shared lever is the `SerifVerdict` component contract + a rule: it must land on a genuine verdict
word at a felt size/ink. Standardize the component's min size/contrast and audit each usage's word
choice.

### S-6. Tell #1 — depth tiers are told, not felt (global card tokens in `globals.css`)
The 3-tier depth system collapses because the tokens are too close in value and pages misuse them:
- archive: `card-console-hero` reads identical to a plain div — nothing to be elevated against (`globals.css:80`).
- blog-studio: **inverted** — the TIER-3 `.card-inset` header outweighs the TIER-2 `.card-console` input card (`ToolPage.tsx:82` vs `:117`).
- automation: six equal `card-console` rows, no TIER-2 focus vs TIER-3 recede.
- builder: five equal nodes, no hero.
Two shared levers: (a) tune `--shadow-card-hero` / surface tones in `globals.css` so the tiers are
felt at arm's length and the hero lifts off a warm canvas; (b) fix the `ToolPage` tier assignment so
the work surface commands and context recedes.

### S-7. Shared app-shell search pill is an unfinished stub (flagged on builder + blog-studio)
The global top-left "Search" pill is a flat placeholder with no scope or `⌘K` hint, reading as a stub
against Profound's `⌘K` search. Flagged on two pages, owned by the app shell, not by either page.
**One shell fix → off every page.**

---

## 2. WORST PAGES — ranked worst-first by craft gap vs the competitor bar

1. **builder** — `needs_redesign: true`. The declared TIER-1 focal (the canvas) is a dead-center
   360px spine of 5 near-identical violet cards in a wide void: tells #5 + #2 + #1 stacked in the
   single most prominent zone, ~half the width dead. Plus the signature dry-run + empty gallery were
   never rendered. This is the only page whose primary surface needs a layout rethink, not a polish.
2. **archive** — flat evenly-weighted 5-column SaaS list, invisible TIER-1 hero, zero signature data
   detail, wide dead right-band, you/agents axis flattened into 4 lookalike chips. Heaviest stack of
   tells (#1/#3/#4/#5/#7/#8) of the non-redesign pages; closest in kind to the competitor bar so the
   gap is most glaring.
3. **blog-studio** — inverted depth hierarchy (recede tier wins), ~430px dead right zone, lopsided
   mode-toggle, invisible sparkline, no serif beat in the default state. 4 P1s, all polish-grade but
   the depth inversion is a real "wrong thing wins the eye" miss.
4. **automation** — uniform full-width row stack with ragged right edge, invisible violet zone,
   header dead-band. Bones are strong (real mono hero, stepped type); explicitly "one focused polish
   pass from the bar."
5. **ask** — strongest bones (document-thread, element-level you/agents law, designed states). Real
   gaps: flat 6-paragraph hero answer with no focal number, composer crops the thread (real UI bug),
   wasted Fraunces beat. Closest to PASS; lightest craft gap.

---

## 3. SHARED-COMPONENT FIXES (concrete paths — fix once, cascades to many pages)

- **`apps/web/src/app/globals.css`** (tokens `--color-agent-tint #EEEAFD`, `#6E56F0/30`,`/40`; `--shadow-card-hero` @ `:80`, `:207`) — raise agent-tint to a real zone ground + solid violet hairline (S-2); tune hero shadow + warm-canvas tone so depth tiers are felt (S-6). Cascades to all 5.
- **`apps/web/src/components/console/ModeToggle.tsx`** — equal-width segments, centered pill, full-strength violet on the agent segment (fixes automation P2-1 redundancy + blog-studio P1-3 lopsided toggle). Cascades to automation, blog-studio, every tool page.
- **`apps/web/src/components/console/EngineMicroSparkline.tsx`** (`:85`) — thicker stroke + endpoint dot + faint baseline + optional trend delta (S-4). Cascades to blog-studio, automation, archive.
- **`apps/web/src/components/console/SerifVerdict`** — enforce min size/ink so the serif beat is felt, not body-grey (S-5). Cascades to ask, archive, automation, blog-studio.
- **`apps/web/src/components/.../ToolPage.tsx`** (`:79` width, `:82`/`:117` tier assignment) — define the "earn the width" right-rail/center recipe (S-3) + fix TIER-2/TIER-3 assignment so the work card commands (S-6). Cascades to blog-studio and every Console-Spine tool page.
- **App-shell top chrome (search pill)** — add `⌘K` + scope or remove (S-7). Owned by the shell; cascades off builder, blog-studio, and all protected pages.
- **Capture harness / `?state=` + demo-tier driver** — drive every page's empty/loading/error/mobile/signature states for re-audit (S-1). Central, not per-page.

---

## 4. POLISH PLAN — disjoint per-page ownership

Disjointness rule: shared-component and global-token edits (`globals.css`, `ModeToggle`,
`EngineMicroSparkline`, `SerifVerdict`, `ToolPage`, app-shell, capture harness) are owned by a single
**shared-foundation** worker and land FIRST. Each per-page worker then owns only that page's own files
(`(protected)/<page>/**` and its private `_components/**`) and must NOT touch the shared files above.
This keeps parallel worktrees collision-free. Per-page workers branch AFTER the shared pass merges so
they inherit the cascaded fixes and only do residual page-specific work.
