---
page: /team — Team & Roles
route: /team
states_audited:
  - populated-desktop.png  (the only screenshot captured)
states_missing:
  - empty-desktop (the "It's just you for now" solo state — NOT captured)
  - loading (skeleton — NOT captured)
  - error (ErrorState — NOT captured)
  - mobile-375 (NOT captured)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png  (Answer Engine Insights — dense data table, the table-page bar)
  - Profound-Screenshot 2026-06-12 at 10.37.47 AM.png  (ranked-list panel, right-rail data card)
  - otterly-Screenshot 2026-06-12 at 10.44.17 AM.png    (split-pane form + data preview)
  - Profound onboarding region/topics shots (chrome + form density baseline)
verdict: NEEDS_WORK
source:
  - apps/web/src/app/(protected)/team/page.tsx
  - apps/web/src/app/(protected)/team/_components/TeamConsole.tsx
  - apps/web/src/app/(protected)/team/_components/SeatMeter.tsx
  - apps/web/src/components/page-header.tsx
  - apps/web/src/components/dashboard-shell.tsx
---

# team — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/team/populated-desktop.png)

Only ONE state was captured (populated desktop). The page renders four other distinct states in code — empty ("It's just you for now"), loading skeleton, error, and a mobile breakpoint — and **none were screenshotted**. Several of my findings below are code-derived for those states and flagged as such; they are not visually confirmed.

## Verdict
**NEEDS_WORK.** This is a genuinely restrained, intentional surface — the code is the most disciplined of the Settings family, the "calm contract" is real, and it correctly avoids forcing a fake hero/sparkline/violet where none belongs. But as rendered it does NOT yet sit beside the #173 dashboard as one hand, and it loses badly to the Profound table bar on two counts: (1) a catastrophic left-pinned layout that leaves ~40% of the canvas as dead white space, which reads unfinished/broken at a glance; and (2) a flat, evenly-weighted body where nothing commands — the page is all TIER-2/TIER-3 at one register with no felt focal, so the eye has nowhere to land. The seat-meter signature is good but is visually outgunned by the table directly under it. No brand-law violations (palette/fonts/violet are clean). Fix the layout pinning and the type-contract flatness and this passes.

---

## P1 — must fix (looks AI / broken)

### P1-1 — Content is hard-pinned left; ~40% of the canvas is dead white space (looks broken/unfinished)
The whole surface lives in `max-w-[760px]` with **no `mx-auto` and no horizontal padding on the column** (`Shell` → `<div className="max-w-[760px]">`, TeamConsole.tsx:94), inside a `<main className="flex-1 overflow-y-auto">` that also has zero horizontal padding (dashboard-shell.tsx:80). The result in the screenshot: every element jams against the sidebar and the entire right ~40% of a 1440px viewport is empty white. Against the Profound Answer-Engine-Insights table (10.39.25), which is a confident full-bleed dense table that owns its canvas, this reads as a half-finished page or a broken container. This is the single worst thing on the screen.
- **Why it reads AI/broken:** dead-center/edge dumping with no composition (tell #5 family) + no intentional whitespace rhythm (M12). A pro table page either fills the canvas (Profound) or centers its column with generous symmetric gutters — this does neither.
- **Fix (M3, M12):** Give `<main>` real page padding (`px-8 lg:px-10 py-8`) at dashboard-shell.tsx:80 OR center the content column. For a Settings-family reading surface, the right move is a constrained-but-centered column: `mx-auto max-w-[860px]` with comfortable left/right gutters — OR commit to intentional asymmetry (dominant content column + a narrow right rail carrying the seat meter / enterprise affordances). Do NOT leave it edge-pinned.
- **Where:** `TeamConsole.tsx:94` (`max-w-[760px]` with no centering) + `dashboard-shell.tsx:80` (main has no padding).

### P1-2 — The body is evenly-weighted; nothing commands, nothing recedes (the flatness tell)
Every cluster renders at one visual register: the seat meter, the members table, the legend, the invite composer, pending invites, and Enterprise are all roughly equal-weight text-and-hairline blocks separated by an identical `my-8` `ClusterDivider` (TeamConsole.tsx:101). There is no TIER-1 focal — the eye scans top-to-bottom with no anchor. The members table (the actual subject of the page) is given the SAME weight as the "What each role can do" legend box, which is a secondary reference. M2's four-step type contract is not visibly stepped on this surface: the H1 (30px), the section eyebrows (12px), and the 15px member names are the only registers, and they read close together.
- **Why it reads AI/broken:** tell #1 (uniform depth) + tell #3 (evenly-weighted type). Profound's table makes the data the unmistakable hero — big tabular numbers, clear column hierarchy, everything else recedes. Here the page has no subject.
- **Fix (M1, M2, M10):** Promote the members table to the page's focal — it is the reason the page exists. Tighten the "What each role can do" legend further into a genuine TIER-3 recede (it currently reads as a near-equal grey card). Make the seat-meter → table relationship tighter (it's the table's header context) and push the legend/enterprise further down with more breathing room (M12 — vary the gap, don't use one global `my-8`).
- **Where:** `TeamConsole.tsx:646-728` (PopulatedBody cluster order, all separated by identical dividers) + `TeamConsole.tsx:101` (one global divider).

### P1-3 — H1 "Team & Roles" does not render as the InterDisplay display register
In the screenshot the H1 reads as a generic heavy/bold sans, not the 30px InterDisplay-Medium, -0.02em, tight-tracking display voice the PageHeader spec promises (page-header.tsx:51 sets `font-[var(--font-display)] ... font-medium ... tracking-[-0.02em]`). The rendered weight looks like a default bold with little negative tracking and no display-face character. This is very likely the known turbopack-dev `--font-family-display` → Inter Tight fallback bug documented in CRAFT-SYSTEM.md §"Blocker". Either way, the title currently lacks the editorial confidence the dashboard H1 has.
- **Why it reads AI/broken:** tell #3 — the most important word on the page doesn't command; it looks like default browser bold.
- **Fix:** Verify the screenshot was taken against prod or webpack-dev (NOT turbopack-dev) per CRAFT-SYSTEM.md §Blocker, then re-shoot. If the font still falls back, this is a CTO font-import fix. The H1 must carry visible InterDisplay-Medium -0.02em weight to match the #173 dashboard.
- **Where:** `page-header.tsx:51` (intended) vs rendered fallback; CRAFT-SYSTEM.md:44-45 (the documented turbopack font blocker).

---

## P2 — substantive

### P2-1 — Role <select> triggers are visually noisy and the disabled Owner picker reads as washed-out/broken
The "Role" column renders four full bordered Select triggers stacked down the table (TeamConsole.tsx:378-420). The Owner row's select is `disabled` (correct behavior) but renders as a greyed, lower-contrast box that, next to the three active pickers, reads as a rendering glitch rather than an intentional locked state. Four bordered dropdowns in a column also fight the table's hairline calm — they're the heaviest element in each row and pull focus from the member name.
- **Why it's below the bar:** Profound's table cells are quiet; the data is the loudest thing, controls recede. Here the controls are the loudest.
- **Fix (M7):** Make the role read as a quiet inline value by default (a `RoleBadge`-style token or borderless text) that only becomes an editable Select on row-hover/focus, OR drop the border to a ghost trigger. For the Owner, replace the disabled greyed select with a static `RoleBadge role="Owner"` + a lock affordance so it reads as deliberately immutable, not broken.
- **Where:** `TeamConsole.tsx:378-420`.

### P2-2 — "What each role can do" legend is a near-equal grey card, not a felt TIER-3 recede
The `PermissionLegend` uses `.card-inset p-5` (TeamConsole.tsx:129) and in the screenshot sits as a soft grey rounded box with generous internal padding directly below the table at near the same visual weight. Against the depth-staging intent (M1: TIER-3 = transparent/surface-warm, 1px border, NO shadow, clearly receding) it instead reads as "another card," competing with the table rather than receding behind it.
- **Fix (M1):** Push it to a true recede — drop any shadow, lighten the ground, tighten the heading register (it's a 15px semibold that competes with member names at 15px), and increase the gap above it so it clearly reads as secondary reference, not a co-equal section.
- **Where:** `TeamConsole.tsx:127-154`.

### P2-3 — Seat-meter dots read as a row of identical blue circles with weak meaning at arm's length
The `SeatMeter` pill-bar (SeatMeter.tsx:73-91) renders 4 filled `#3370FF` circles + 1 empty `#E5E7EB`. It's the intended signature and the concept is good, but at arm's length it reads as decorative dots rather than a meter — there's no track/container, no tick rhythm, and the filled/empty contrast (saturated blue vs light grey) is the only signal. Directly above a heavy bordered table, the meter is visually outgunned.
- **Fix (M4/M7):** Give the meter a faint track or a 1px container so it reads as a gauge, tighten its relationship to the "4 of 5" mono figure (make the number the dominant element, dots the supporting detail), and ensure it has enough weight to hold the top of the page now that the table is being promoted (P1-2).
- **Where:** `SeatMeter.tsx:56-103`.

### P2-4 — Identical `my-8` dividers everywhere flatten the editorial rhythm
Six `<ClusterDivider>` instances, all `my-8 h-px` (TeamConsole.tsx:101), separate every cluster at the exact same cadence. M12 explicitly calls for varying whitespace by relationship (tight within a cluster, wide between). The seat meter and the members table are tightly related (meter is the table's summary) and should sit closer; the Enterprise block is unrelated and should sit further apart with more air.
- **Fix (M12):** Replace the single global divider with intentional spacing — e.g. tighter gap meter→table, wider gap before Enterprise, and not every boundary needs a hairline rule.
- **Where:** `TeamConsole.tsx:101` and its six call-sites (663, 672, 677, 690, 699).

### P2-5 — No entrance choreography (flat motion tell)
Per the calm contract the only animated moment is the seat-meter scale-in (SeatMeter.tsx). The rest of the surface paints flat with no fade-up priority stagger (M9). The dashboard exemplar has staggered entrance; this page has none, which contributes to the "static template" feel.
- **Fix (M9):** Add a subtle priority-order fade-up (8px, ~40ms stagger, ≤200ms ease-out, behind `prefers-reduced-motion`) to the major clusters so the page assembles with intent. Keep it minimal — this is a calm surface.
- **Where:** `TeamConsole.tsx` PopulatedBody clusters (no entrance animation present).

---

## P3 — nice-to-have

### P3-1 — Avatar fallbacks are uniform two-letter initials on identical tint discs
All four avatars are `AvatarFallback` initials on the same `--color-accent-tint` ground (TeamConsole.tsx:362-365). They read as a uniform stack. Minor, and acceptable for a calm surface, but a touch of differentiation (or real photos when wired) would lift it toward the Profound polish bar.

### P3-2 — Mono timestamps are good; consider a quieter relative hint
`formatStamp` correctly uses Geist Mono tabular-nums (M11 ✓, TeamConsole.tsx:423) and the deliberate ISO-grafted format ("12 Jun 2026 · 08:41") is a strong anti-AI choice. Optional: a faint relative hint ("· 2d ago") could aid scannability without breaking the mono-truth rule.

### P3-3 — Pending-invites and Enterprise sections were below the screenshot fold
The capture cuts off after the legend; clusters 4–6 (invite composer, pending invites, enterprise affordances) were not visually verified. The code looks sound (typographic ledger rows, gated-not-hidden affordances with tooltips — a good pattern) but should be screenshotted before sign-off.

---

## Per-state notes

**Populated (captured):** Covered above. Worst issues: left-pinned dead-space layout (P1-1) and evenly-weighted flatness (P1-2). The screenshot only shows down to the permission legend — the bottom half of the page (invite composer, pending invites, Enterprise) is unverified.

**Empty (NOT captured — code-derived):** `EmptyBody` (TeamConsole.tsx:555-603) is well-designed on paper — warm `--color-surface-warm` ground, a non-bare glyph in a tinted disc, a real headline ("It's just you for now"), an inline invite composer, and a two-tier recovery (primary Send invite + quiet "Learn about roles" link). This matches M8 intent. BUT it is centered text inside a centered box — verify it does not become the "bare centered icon-in-circle" tell (#5) when rendered, and that it inherits the same left-pinning problem as P1-1. **Must be screenshotted.**

**Loading (NOT captured — code-derived):** `LoadingBody` (TeamConsole.tsx:517-549) uses layout-matched skeletons (good — not a generic spinner). Verify the skeleton widths match the real content so there's no layout jump.

**Error (NOT captured — code-derived):** Uses the shared `ErrorState` with real recovery copy ("Try again — it usually clears right up") — names a recovery, not just "refresh" (M8 ✓). Note the catch-all error does a hard `window.location.reload()` (TeamConsole.tsx:786) while the inline action error correctly avoids reload — verify the page-level error isn't jarring.

**Mobile-375 (NOT captured):** The code uses `sm:` breakpoints throughout (flex-col → flex-row, `overflow-x-auto` on the table at TeamConsole.tsx:335). The members table on a 375px viewport with four columns including bordered selects is a real risk for horizontal scroll/cramping. **Must be screenshotted** before sign-off.

---

## Brand-law check (no violations found)
- Accent `#3370FF` only on actions (Add seats link, seat dots, focus rings, avatar initials use accent-tint) ✓
- No violet anywhere (correct — no agent surface lives on /team) ✓
- No Fraunces in chrome (correct — calm contract) ✓
- Numbers in Geist Mono tabular-nums (seat count, timestamps) ✓
- 8pt grid respected ✓
- No retired colors/fonts ✓
The brand laws are clean. This is a craft-gap (layout + hierarchy + motion), not a brand-block.
