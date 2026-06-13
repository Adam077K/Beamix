---
page: /traceability (list view)
route: /traceability
states_audited:
  - populated-desktop.png
  - empty-desktop.png
mobile_state: NOT CAPTURED (no populated-mobile / empty-mobile screenshot)
competitor_refs_used:
  - Profound — "110 prompts" Answer Engine Insights table (10.39.25)
  - Profound — onboarding visibility chart + ranked MarTech list (10.37.47, 10.39.25)
  - Otterly — "Your brand competitors" + Brand Ranking table (10.44.48)
  - Otterly — onboarding right-rail data preview (10.44.17)
verdict: CRITICAL_ISSUES
auditor: design-critic
date: 2026-06-12
---

# traceability — UI Excellence Audit

## Screenshots

- [populated-desktop.png](./screenshots/traceability/populated-desktop.png)
- [empty-desktop.png](./screenshots/traceability/empty-desktop.png)

(No mobile or loading/error captures were provided. The audit cannot certify responsive or
loading/error craft — see Per-state notes.)

## Verdict

**CRITICAL_ISSUES.**

From the visual evidence, the populated `/traceability` list is the canonical AI-generated layout:
three byte-for-byte identical full-width rows stacked in a flat `space-y-3`, no focal element, no
depth staging, no serif beat, the `deltaPoints` figure shrunk into a tiny right-aligned pill, and
roughly 55% of the viewport left as dead white space below the fold. It does not read as the
"forensic, earned-trust receipt" the page's own REFERENCE.md contract demands — it reads as a stub.
Against the competitor bar (Profound's dense, sparkline-laden insight tables; Otterly's ranked,
hierarchy-rich brand tables) this page looks unfinished. The REFERENCE.md PASS bar requires "exactly
one TIER-1 focal (`deltaPoints` hero figure)" and "the type contract visibly steps in four registers
(64px mono → 30px InterDisplay → 12px eyebrow → 14px body)" — neither exists on the list. This needs
a real redesign, not cosmetic polish.

---

## P1 — must fix (looks AI / broken)

### P1-1 — Three identical full-width rows = AI tell #2, and there is NO TIER-1 focal (tell #1 + M1/M3/M10)
From the visual evidence the populated state is three identical rounded rectangles in a vertical
stack, each weighted exactly the same. This is simultaneously: tell #2 (literal N-equal stack of
identical cards), tell #1 (uniform depth — every row the same `.card-console`), and tell #3
(evenly-weighted type — nothing commands). The Profound and Otterly refs always establish a clear
focal/most-important row (Profound bolds `#22 Beamix` in its ranked list; Otterly highlights the
brand's own `#1` row with a colored ring). Beamix's list has no anchor at all.
- **Why it reads AI/broken:** the page's own PASS bar (REFERENCE.md §1, §6, CRAFT-SYSTEM M1/M3) mandates exactly one TIER-1 focal and "No N-equal grid." The build delivers the opposite.
- **Fix (M1 + M3 + M10):** promote the most recent / highest-impact outcome to a TIER-1 hero band — `.card-console-hero` with the `deltaPoints` rendered as the 64px Geist Mono figure (the contract's STEP-1) and the outcome statement as 30px InterDisplay verdict beside it. Render the remaining outcomes as TIER-3 `.card-inset` rows beneath it (no shadow, surface-warm), so depth steps 1→3. Consider an asymmetric `[1fr_320px]` for the hero (statement left, delta + engine + date rail right) to break the full-width stack.
- **File:** `TraceabilityList.tsx:49–74` (the `space-y-3` map of identical `OutcomeCard`s); `OutcomeCard.tsx:48` (`card-console` on every row).

### P1-2 — The `deltaPoints` hero figure is missing entirely; it is a 12px pill (tell #3, M2/M11)
From the visual evidence, "+17 pt / +13 pt / +9 pt" appear as tiny 12px right-aligned blue pills.
The contract (REFERENCE.md §1, "STEP-1 hero: `deltaPoints` in Geist Mono 64px") makes this number
the single loudest object on the screen. As built, the number that proves the product worked is the
smallest, most ignorable element in each row.
- **Why it reads AI/broken:** the four-step type contract (CRAFT-SYSTEM M2) is supposed to be *visibly* stepped — here the verdict (15px statement) and the truth-number (12px pill) are nearly the same size; there is no 64px register anywhere on the page. The type is flat.
- **Fix (M2 + M11):** in the TIER-1 hero (P1-1), render `+{deltaPoints}` at 64px Geist Mono, `-0.03em`, tabular-nums, in `--color-score-good` (#10B981 for positive). Keep the small blue pills only on the secondary TIER-3 rows. Every register (64 / 30 / 12 / 14) must be present and obviously different.
- **File:** `OutcomeCard.tsx:65–68` (the 12px `+{deltaPoints} pt` pill is the only place the figure appears).

### P1-3 — ~55% of the viewport is dead white space below the rows (M10/M12)
From the visual evidence, on a 1440-wide desktop the three rows + hint end at roughly y=472, leaving
the entire lower half of the page empty white. There is no progressive-disclosure spine, no
secondary content, no summary. Profound and Otterly fill the data canvas (tables run the height;
right rails carry charts). Beamix leaves a void.
- **Why it reads AI/broken:** dead space with no compositional intent reads as an unfinished stub, not a designed page. M12 demands whitespace vary *by relationship*, not collapse into one empty zone.
- **Fix:** the TIER-1 hero (P1-1) plus a TIER-3 inset summary (e.g. a small "trail at a glance" — total points recovered, # of deliverables, engines touched, all in Geist Mono) will give the lower canvas a reason to exist. At minimum, anchor the content with a left-rail/right-rail asymmetry so the page does not float as a narrow centered stack inside `max-w-6xl`.
- **File:** `traceability/page.tsx:39,52` (`max-w-6xl` + single-column `space-y-8` with one child).

### P1-4 — No Fraunces serif beat anywhere on the populated list (tell #6, M5)
From the visual evidence, the populated state uses only Inter/InterDisplay + mono. The contract
(REFERENCE.md §34) earns exactly one Fraunces italic beat — the engine name inside the outcome
statement ("Now ranked on *Perplexity*"). The list renders engine names as plain Inter inside the
statement string; the serif soul is absent on the screen a user actually lands on first.
- **Why it reads AI/broken:** tell #6 — Fraunces used nowhere. The warm-minimal soul is invisible on the primary surface.
- **Fix (M5):** render the engine name (Perplexity / ChatGPT / Gemini) as inline italic Fraunces within the TIER-1 hero's outcome statement — one beat, the verdict word only. Do not add it to the secondary rows (one beat per screen).
- **File:** `OutcomeCard.tsx:59–61` (statement rendered as flat 15px Inter, engine name not isolated).

### P1-5 — Empty state is a dead-center icon-in-circle on a symmetric card (tell #5, M8) and is single-CTA, violating the contract's two-tier recovery
From the visual evidence, the empty state is a tall warm card with a small centered thread-and-node
glyph, centered headline, centered body, and a single centered blue "Run your first scan" button —
content floating mid-card with large empty margins above and below. The contract (REFERENCE.md §45,
CRAFT-SYSTEM M8) explicitly requires a **two-tier** recovery: "primary blue pill + quiet secondary
link" (a "view history / view scans" link). Only the primary CTA is present.
- **Why it reads AI/broken:** tell #5 (dead-center symmetry, bare centered icon-in-circle empty) + M8 violation (missing the quiet secondary link the contract names). This is the textbook AI empty state.
- **Fix (M8):** add the quiet secondary link beneath/beside the primary CTA (e.g. "or view past scans →" in muted accent). Break the dead-center symmetry — left-align the headline/body block against the thread illustration, or anchor the content to the upper third of the card rather than vertically centering it. Keep the warm surface and the single Fraunces headline (those are correct).
- **File:** `TraceabilityEmpty.tsx:43–66` (`items-center text-center`, single `<Link>` CTA, no secondary).

---

## P2 — substantive

### P2-1 — The violet timeline/thread (the signature detail) is hidden until expand; it never appears on the list (tell #8, M6)
The thread + violet agent nodes — the page's signature "work trail" detail and its blue=you /
violet=agents spatial promise — only render inside the expanded `OutcomeCard` panel
(`OutcomeCard.tsx:103–133`). On the collapsed list (what the screenshot shows) there is zero violet,
zero thread; the agent dimension is invisible at arm's length (tell #8). The REFERENCE.md PASS bar
§3 wants the rail + violet nodes "glanceable from a meter away."
- **Fix (M6):** surface a hint of the violet thread on each collapsed row — e.g. a short violet thread stub + node count ("3 deliverables") in `--color-status-agent` on the right cluster, so the agent work is legible before expand. Keep violet off buttons/links (currently respected).
- **File:** `OutcomeCard.tsx:64–80` (collapsed trailing cluster has no agent signal).

### P2-2 — Delta pill uses `bg-status-info` + `text-status-info` — tinted ground is fine, but verify it is not low-contrast (M11, WCAG)
The +17/+13/+9 pills render as a pale blue ground with blue text (`bg-status-info text-status-info`,
`OutcomeCard.tsx:66`). Visually the blue-on-blue-tint is low-contrast in the screenshot. Per the
status-pill spec the ground should be `--color-status-info-bg` (#EEF2FF) and the text
`--color-status-info` (#3370FF) — confirm the class `bg-status-info` resolves to the *-bg* token, not
the saturated text token, or the pill is mid-blue on mid-blue.
- **Fix:** ensure ground = `--color-status-info-bg`, text = `--color-status-info`; verify ≥4.5:1.
- **File:** `OutcomeCard.tsx:66` and `:128` (same pattern on the terminal pill).

### P2-3 — "View scans" outline button is a weak primary action for a near-empty page (M8/hierarchy)
On the populated state the only header action is a quiet outline "View scans" top-right, while the
list itself has no clear next step beyond the muted "View latest" link. The page lacks a confident
primary action tying the trail to "run the next scan" / "see the outcome detail."
- **Fix:** keep "View scans" as secondary; make the TIER-1 hero row's detail link the confident primary affordance (it already routes to `/traceability/[id]`), visually weighted.
- **File:** `traceability/page.tsx:45–49`; `TraceabilityList.tsx:77–86`.

### P2-4 — `max-w-6xl` centered single column wastes the asymmetry budget (M3)
The whole surface is a centered `max-w-6xl` single column. Combined with full-width identical rows,
there is no dominant-column-plus-rail composition anywhere. This is what makes the page feel like a
template stack rather than a designed console.
- **Fix:** introduce the dominant/rail asymmetry at the hero level (P1-1) and let the secondary rows be a tighter inset list, varying rhythm per M12 rather than one global `space-y-8`.
- **File:** `traceability/page.tsx:39,52`.

---

## P3 — nice-to-have

### P3-1 — Entrance choreography unverifiable / likely absent on the list (M9, tell #7)
REFERENCE.md §32 calls for TIER-1 fade-up + staggered deliverable rows (`.craft-enter-1..4`). The
`OutcomeCard` rows on the list carry no `.craft-enter` classes (`TraceabilityList.tsx:50–73`). A
static screenshot can't fully confirm, but no stagger utilities are wired on the list rows.
- **Fix (M9):** add priority fade-up (~40ms stagger, ≤200ms ease-out, `prefers-reduced-motion` safe) to the hero then the inset rows.

### P3-2 — "3 results traced" count is correct mono usage — preserve it
`TraceabilityList.tsx:45–47` renders the count in Geist Mono tabular-nums #6B7280. This is correct
M11 usage and reads well; keep it as the eyebrow-adjacent micro-label when the redesign lands.

### P3-3 — Dates ("Jun 9 / Jun 8 / Jun 6") are mono tabular-nums — correct (M11)
The right-cluster dates use `font-mono tabular-nums` (`OutcomeCard.tsx:71–73`). Correct; preserve.

---

## Per-state notes

**Populated (populated-desktop.png):** the core failure surface. Three identical rows, no focal, no
hero figure, no serif beat, no visible violet thread, ~55% dead space. This is the CRITICAL_ISSUES
driver. See P1-1 through P1-4, P2-1, P2-4.

**Empty (empty-desktop.png):** warmer and closer to spec than populated — correct warm surface
(`bg-surface-warm`), correct single Fraunces headline, on-brand thread glyph, blue CTA. But it is a
dead-center symmetric card with a single CTA, violating the contract's two-tier recovery and tell #5.
See P1-5. Content also floats vertically centered in a very tall card, leaving large top/bottom voids.

**Mobile:** NOT CAPTURED. No `populated-mobile` / `empty-mobile` screenshot was provided, so the 375px
layout, the row trailing-cluster wrap behavior (`OutcomeCard.tsx:63–80` uses `shrink-0`/`gap-3` which
could crowd the statement on narrow screens), and tap-target sizes are unverified. This is a coverage
gap, not a clean bill — re-audit once mobile states are captured.

**Loading / error:** components exist (`TraceabilityLoading.tsx`, `TraceabilityError.tsx`) but were not
captured. Unverified.
