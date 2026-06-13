---
page_route: /prompts
states_audited:
  - populated-desktop.png   (ONLY state captured — empty/loading/error/mobile NOT screenshotted)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png   (110-prompts table — direct analog)
  - Profound-Screenshot 2026-06-12 at 10.37.47 AM.png   (ranked list panel)
  - Profound-Screenshot 2026-06-12 at 10.38.02 AM.png   (brand-visibility chart + running-prompts)
  - otterly-Screenshot 2026-06-12 at 10.45.13 AM.png    (generating high-impact prompts state)
  - otterly-Screenshot 2026-06-12 at 10.44.17 AM.png    (form + analytics two-pane)
verdict: NEEDS_WORK
---

# prompts — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/prompts/populated-desktop.png)

(NOTE: only `populated-desktop.png` exists in the screenshot folder. The page's other
three table states — loading / empty / error — and the mobile breakpoint were NOT
captured. Findings on those states are code-derived, flagged, and NOT eligible for a PASS
until rendered.)

## Verdict

**NEEDS_WORK.** The bones are genuinely good — the Console Spine shell gives real depth
staging (TIER-3 inset header → TIER-2 input → TIER-1 hero output), the type contract is
mostly stepped, the SerifVerdict beat is present, and the table is honest. But it does not
yet sit beside Profound's 110-prompts table as one hand. Two things hold it back hardest:
(1) a **catastrophic left-gutter offset** — the entire 880px column is shoved to the right
of a huge dead white band, so the page reads broken/misaligned at first glance, not
composed; and (2) the **output table is quantitatively thin** next to Profound — Profound
packs Visibility Rank / Visibility Score with +deltas / Avg Position / Citation Share per
row (every cell a weighted number with trend), while Beamix shows a coverage dot, a bare
`#2`, a raw `54`, and a grey text tag — no in-cell shading, no sparkline (M4), no deltas.
The screen looks tidy but under-informed and off-center; it is one strong layout pass and
one data-density pass away from the bar.

---

## P1 — must fix (looks AI / broken)

### P1-1 — The whole content column is offset right against a dead left gutter (reads broken)
In `populated-desktop.png` the sidebar ends at ~x=240, then there is a wide empty white
band, and the 880px content column begins at roughly x=420 and is centered in the
*remaining* space rather than in the content viewport. The result is a large, unexplained
dead zone on the left and the column hugging the right edge. At arm's length this reads as
a **layout bug / mis-centered container**, not intentional asymmetry — the exact opposite
of Profound, whose table fills the working area edge-to-edge with a left-aligned content
column. This is tell #5 (dead/awkward whitespace) presenting as a real bug.
- **Why it's broken vs ref:** Profound and Otterly both left-anchor their working content
  to the rail and let it breathe rightward; Beamix floats a fixed-width doc in the middle
  of an asymmetric main area, producing a lopsided void.
- **Fix (M3 / M12):** Either left-align the `max-w-[880px]` column to the content area
  (`mx-0` + a right gutter cap) so it sits flush under the page chrome, OR widen the
  document and introduce a real dominant-column + rail split for the populated table so the
  width is *earned by content*. Center-floating a narrow doc in a wide main area is the
  thing to kill.
- **File:** `apps/web/src/components/console/ToolPage.tsx:79`
  (`mx-auto w-full max-w-[880px]`).

### P1-2 — Output table is quantitatively thin vs the direct competitor (Profound 110-prompts)
Side-by-side with `Profound-...10.39.25 AM.png`: Profound's prompt table carries, per row,
**Visibility Rank (#1), Visibility Score (92.5% with a green +6.4% delta), Average Position
(1.4 with +0.2 trend), Citation Share (8.9% with -8.4%)** — four weighted numeric columns,
each with a colored delta, so the eye instantly ranks rows. Beamix's row (PromptTable.tsx)
shows a coverage dot, `#2`, `54`, and a grey "Bottom-funnel" tag — three thin values, no
deltas, no trend, no comparative shading. It reads like a list, not analytics.
- **Why it's AI/thin vs ref:** flat, evenly-weighted cells with no in-cell hierarchy
  (tell #1 + tell #7 leak into the table). Nothing in a row commands; nothing recedes.
- **Fix (M4 / M7 / M11):** Add the **engine micro-sparkline** signature detail per row
  (24px-tall ~64px polyline of the prompt's last ~5 freq/position points in the score-band
  color; flat baseline when null — never fake). Promote one column to a big mono figure
  with the others receding (number-over-label). Add a delta/trend chip on Freq or Position
  so rows self-rank like Profound.
- **File:** `apps/web/src/app/(protected)/prompts/_components/PromptTable.tsx:404-462`
  (row grid); signature detail import absent.

### P1-3 — Engine names are rendered in Geist Mono — M11 violation (mono is for truth, not prose)
`EngineChip` sets `font-[var(--font-mono)]` on the engine *name* ("ChatGPT", "Gemini",
"Perplexity") and even applies `tabular-nums` to a proper noun. M11 is explicit: every real
*number* is mono; **all prose is Inter**. Engine names are prose. In the screenshot the
chips read with a code-y monospace texture that fights the Inter table around them and
makes the engine tokens look like log output.
- **Why it's a tell vs ref:** Profound/Otterly render engine labels in their UI sans; mono
  on a brand name is an AI-grid texture, not a deliberate choice.
- **Fix (M11):** Remove `font-[var(--font-mono)]` and `tabular-nums` from `EngineChip`; use
  Inter 500. Keep mono strictly for `#position`, `freq`, counts, deltas.
- **File:** `apps/web/src/app/(protected)/prompts/_components/PromptTable.tsx:27`.

### P1-4 — The full-width blue "Run Query Mapper" button is an over-weighted full-width stack
The primary CTA spans the entire 880px width as a solid `#3370FF` bar
(`populated-desktop.png`, mid-page). A full-bleed primary button is tell #5 (full-width
stack) and overpowers the hero "10" and the verdict line above it — the eye is dragged to a
giant blue slab before it reads the page's actual subject (the prompts). The dashboard
exemplar never uses a full-width primary slab in the body.
- **Why it's AI vs ref:** Profound's "Continue" / "Run prompts" CTAs are contained,
  left-anchored, sized to their label — confident, not shouting. A full-width fill is the
  template default.
- **Fix (M3 / brand buttons):** Size the Run button to its content and left-anchor it under
  the ModeToggle (it already lives in a `flex-col` — just drop the implicit full-width
  Button block stretch). Let the table, not the button, be the heaviest object on screen.
- **File:** `apps/web/src/components/console/RunControl.tsx:90-98` + Button default width;
  rendered via `page.tsx:170`.

---

## P2 — substantive

### P2-1 — The you-vs-agents split is invisible at arm's length on the ModeToggle (tell #8 / M6)
"Run it myself" (selected, blue tint) sits next to "Let Beamix handle it" as two near-
identical neutral pills. The Beamix/agent side carries **no violet structure** — no
`#EEEAFD` ground, no `rgba(110,86,240,0.12)` hairline, no agent glyph. The product's core
promise (blue = you, violet = the agents) is not legible here at a glance; it's a token
detail, not spatial.
- **Fix (M6):** Give the "Let Beamix handle it" option a violet-tint ground / hairline and
  a small agent indicator so the two halves read as two territories. Violet stays off the
  button itself — only the agent *zone* tints.
- **File:** `apps/web/src/components/console/ModeToggle.tsx` (verify; not deeply audited).

### P2-2 — Two competing hero numbers dilute the single STEP-1 focal (M2 / M10)
The header rail shows a 64px mono "10" (the sanctioned STEP-1 figure), but the table's
"10 of 10" count and the row Freq numbers (`54`, `47`, `38`) all sit nearby in mono with
similar visual claim. M2 requires *exactly one* STEP-1 figure per screen with obvious gaps.
Right now several mono numbers read at similar weight, flattening the hierarchy.
- **Fix (M2):** Keep "10" as the only 64px figure; ensure all in-table numbers are clearly
  STEP-4-scale (13px) and that the verdict line (STEP-2, 30px InterDisplay) — currently the
  grey 15px "Your query landscape is growing" — is actually rendered at verdict weight, not
  body weight. The verdict beat is undersized vs the type contract.
- **File:** `apps/web/src/app/(protected)/prompts/page.tsx:319-322` (verdict rendered at
  `text-[15px] text-[#6B7280]` — should be STEP-2 30px, not body grey).

### P2-3 — Position math is fabricated from frequency (data-integrity smell)
`avgPosition = Math.floor(1 + (1 - row.frequency/60)*4)` derives a "rank" from frequency —
i.e. the `#1/#2` column is not a real position, it's a function of another column. This is
the kind of fake-correlated data the rubric warns against; two columns that are secretly
the same signal will look plausible but be meaningless, and will read as filler the moment
a real backend lands.
- **Fix:** Carry a real (mock) position field in the fixture, decoupled from frequency.
- **File:** `apps/web/src/app/(protected)/prompts/_components/PromptTable.tsx:386-388`.

### P2-4 — "Cited / Covered" reduced to a 6px dot — under-reads as a primary signal
Coverage is arguably the most important fact per row (are you cited or not), yet it's a
single 1.5×1.5 dot in a 60px column. Profound gives Citation Share a full % + delta.
Beamix's dot is easy to miss and carries no magnitude.
- **Fix (M7):** Pair the dot with a mono label ("Yes/No" or a citation %) or use a left
  status-color hairline on the row so coverage is glanceable down the column.
- **File:** `apps/web/src/app/(protected)/prompts/_components/PromptTable.tsx:438-441`.

### P2-5 — Tag column is grey text with no system (visual dead weight)
"Bottom-funnel / Top-funnel / Branded" render as plain `#9CA3AF` text (PromptTable.tsx:459).
It looks like a leftover label, not a designed column — and it's derived from intent
(`tagLabel`), so it's redundant with the Intent badge two columns left.
- **Fix:** Either make tags real pill chips with their own meaning, or drop the column
  (it duplicates Intent) and give the freed width to the sparkline/score.
- **File:** `apps/web/src/app/(protected)/prompts/_components/PromptTable.tsx:135-139, 457-462`.

---

## P3 — nice-to-have

### P3-1 — "Cycle state" dev button is visible in the populated render
Top-right of the output header (`page.tsx:324-337`) — gated on `NODE_ENV==='development'`,
so it will not ship, but it is present in the audited screenshot and clutters the verdict
row. Confirm it is gone in any prod capture.

### P3-2 — Input summary bar "Change inputs" is the only blue thing above the fold besides the CTA
The collapsed summary (`brightsmile-dental.co.il · ChatGPT, Gemini, Perplexity` +
"Change inputs") is fine, but the blue "Change inputs" link competes with the blue Run CTA
for the single-accent moment. Consider demoting it to neutral-with-hover.

### P3-3 — Footer note + "+ Track a new prompt" duplicate the empty-state's secondary action
Minor: the table footer "+ Track a new prompt" and the empty state's "Or add a prompt
manually" are two phrasings of the same affordance. Align the copy.

### P3-4 — Engine dots in the input panel are all green regardless of engine
InputPanel renders every engine chip with a `#0E9E6E` dot (`page.tsx:271`). Reads as a
"connected" status that is identical for all three — fine as a status, but if it's meant to
be per-engine identity it's misleading. Confirm intent.

---

## Per-state notes

**Populated (desktop) — the only rendered state.** Strengths to preserve: real depth
staging (inset header / hero output card visibly different), the SerifVerdict italic
"growing" beat is present and tasteful, the table toolbar (Filter / All·Covered·Gap /
"10 of 10") is clean and competitor-grade, and numbers in cells are correctly mono. Gaps:
the left-gutter offset (P1-1), thin per-row data vs Profound (P1-2), mono-on-engine-names
(P1-3), full-width CTA slab (P1-4), undersized verdict line (P2-2).

**Empty / Loading / Error — NOT captured.** Code review shows all three are *implemented*
and look promising: the loading skeleton mirrors the real grid (good — not a generic
spinner), the empty state has a titled context + two-tier recovery (primary "Discover my
prompts" + quiet "add a prompt manually") per M8, and the error state names a real recovery
("temporary glitch", Try again). But none were screenshotted, so M8 compliance is unverified
visually — these must be rendered before any PASS. Watch: the EmptyState `illustration="scan"`
must be a warm on-brand glyph, not a bare centered icon-in-circle (tell #5).

**Mobile — NOT captured.** The row has a dedicated `md:hidden` mobile layout
(PromptTable.tsx:465-480) collapsing to dot + query + intent/engine chips + freq, which is
the right instinct, but it is unverified. The header rail's 64px "10" + the full-width CTA
are the likeliest mobile failure points — must be screenshotted at 375px.
