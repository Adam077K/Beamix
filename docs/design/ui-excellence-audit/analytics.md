---
page: /analytics — Answer-Engine Insights (Analytics Console)
states_audited:
  - populated-desktop.png (1440×900, above-the-fold viewport crop)
  - populated-mobile.png (375-wide)
states_NOT_captured:
  - empty-desktop (real-user default state — NOT screenshotted; audited from source only)
  - loading / error
  - full-page desktop scroll (only the top viewport was captured; SoV-over-time + avg-position 2-up + topic matrix were read from source, not seen rendered)
competitor_refs_used:
  - Profound "Answer Engine Insights" table (Profound 10.39.25) — the direct page-type analog / bar
  - Profound brand-visibility line chart (Profound 10.38.02)
  - Otterly monitor dashboard (otterly 10.44.17)
verdict: NEEDS_WORK
---

# analytics — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/analytics/populated-desktop.png)
- [populated-mobile.png](screenshots/analytics/populated-mobile.png)

> Capture gap: only a single 1440×900 viewport was captured for desktop, so the page is
> cut off mid-way through the Visibility-trend chart. The SoV-over-time + Avg-position
> weighted 2-up and the Topic-rank matrix below the fold were audited from source
> (`AnalyticsWorkbench.tsx`, `SovOverTimeChart.tsx`, `AvgPositionPanel.tsx`,
> `TopicRankMatrix.tsx`) but NOT seen rendered. The empty/loading/error states were also
> not screenshotted. Findings on those surfaces are source-derived and flagged as such.

## Verdict
**NEEDS_WORK.** The bones are genuinely strong — this is the most structurally ambitious
page in the product: a real asymmetric hero (1fr/360px), a donut + line + area + heatmap
instrument set, mono numerics, and a sensible TIER-1→TIER-3 depth plan. It sits in the
same league as the Profound "Answer Engine Insights" surface and does NOT read template.
But two real rendering bugs and several craft gaps keep it below the competitor bar: every
engine filter chip renders **blue regardless of its engine color** (the rail is a wall of
identical blue rows — tell #8, and a literal correctness bug), the engine "swatch" dots are
nearly invisible, and the page is built almost entirely on one global `space-y-8` with five
near-identical full-width `card-console` rectangles below the hero (tell #1 / tell #2 in
its softer "stacked-equal-cards" form). No brand-BLOCK, no clone. With the chip-color bug
fixed and depth/rhythm varied, this clears the bar.

---

## P1 — must fix (looks AI / broken)

### 1. Engine filter chips render BLUE for every engine — the rail is a wall of identical blue rows (tell #8 + real bug)
**Problem:** In both screenshots the ENGINES list (ChatGPT, Gemini, Perplexity, Claude, AI
Overviews) renders every active chip as **blue text (`#3370FF`) on blue tint (`#EEF2FF`)**.
The color swatch dot is the only thing that differs — and even that is barely legible (see
P1.2). So Gemini reads blue, Perplexity reads blue, Claude reads blue, AI Overviews reads
blue. The whole identity system — five engines = five data-band colors — collapses into one
flat blue stripe.
**Why it reads AI/broken vs the ref:** Profound's engine/platform identity is instantly
glanceable (per-platform marks, distinct rows). Here the "blue=you / per-engine = data band"
promise is invisible at arm's length — exactly tell #8 (blue/violet as a token detail, not
spatial). It also looks like a copy-paste active-state bug, not a decision.
**Fix (M6/M8 color discipline):** The active chip should NOT recolor the label to the accent.
Keep the label in `#0A0A0A` (active) / `#6B7280` (inactive) and let the **swatch carry the
engine color** at full saturation + size. Reserve `#3370FF` text strictly for "You"/brand
context, not for all five engines. `AnalyticsScopeRail.tsx:101-106` (`active ? 'bg-[#EEF2FF]
text-[#3370FF]'`) and the identical `TopicFilterGroup.tsx:36-41`.
**File:** `apps/web/src/components/console/AnalyticsScopeRail.tsx:101-106`;
`apps/web/src/app/(protected)/analytics/_components/TopicFilterGroup.tsx:36-41`.

### 2. Engine color swatches are 8px dots that are nearly invisible against the blue chip ground
**Problem:** The swatch is `h-2 w-2` (8px) sitting on the `#EEF2FF` active ground. At normal
viewing distance the cyan/green/amber/red dots read as faint specks; the desktop crop shows
five near-uniform blue pills. The one signal that distinguishes engines is too small to do
its job.
**Why it reads AI/broken vs the ref:** the competitor refs make platform identity legible
without effort; here you must lean in to tell the engines apart.
**Fix:** raise the swatch to 10px (`h-2.5 w-2.5`), or use a 3px-wide colored left-edge bar on
the chip, and remove the blue ground (see P1.1) so the color reads. This is the page's
declared signature system (engine = band color) — it must survive a glance.
**File:** `AnalyticsScopeRail.tsx:108-113`; `TopicFilterGroup.tsx:43-49`.

### 3. Below the hero the page is five near-identical full-width `card-console` rectangles on one global `space-y-8` (tell #1 + tell #2-soft + M12)
**Problem:** `WorkbenchBody` (`AnalyticsWorkbench.tsx:124-144`) stacks: hero → full-width
trend card → 2-up → full-width matrix, all wrapped in a single `space-y-8` with every
non-hero surface using the identical `card-console p-6` treatment and the identical
`mb-5` eyebrow+sentence header block. The result below the fold is uniform depth and uniform
rhythm — the "stacked equal cards" cousin of the N-equal grid, and the canonical AI tell #1
(every surface the same card, hierarchy told not felt).
**Why it reads AI/broken vs the ref:** Profound varies its surfaces (dense table vs framed
chart vs metric strip) so the eye is led; here once you pass the hero everything is the same
weight and the same 32px gap.
**Fix (M1 + M12):** (a) vary the inter-section gap by relationship — tighten the trend chart
to the hero (it is the hero's proof: ~24px), then a wider 48px break before the "competitive
field" 2-up, then 48px before the matrix; replace the global `space-y-8`. (b) Demote at least
one surface to TIER-3 `.card-inset` (the Avg-position panel is a natural recede — it is the
"lighter half" already) so depth is felt, not just declared in comments.
**File:** `apps/web/src/app/(protected)/analytics/_components/AnalyticsWorkbench.tsx:126-144`.

### 4. Donut center figure is grey `#374151`, not blue — the one place "you" should own blue, it doesn't
**Problem:** The hero donut center reads **"23% / YOUR SHARE" in neutral grey** while the
arc's "you" segment is blue. The comment at `SovHeroPanel.tsx:92` says this is deliberate
("reserves the blue 64px hero figure as the single TIER-1 focal"), but visually the donut now
has a blue arc wrapped around a grey number labelled "YOUR SHARE" — the color and the label
contradict each other, and the donut reads mostly-grey (you=23% arc, 77% grey field) so at a
glance it looks like you are LOSING.
**Why it reads AI/broken vs the ref:** Profound's brand-visibility figure is unambiguously
the brand's color. Here the blue=you promise is muted exactly where it should be loudest.
**Fix (M8/M6):** either tint the donut center figure `#3370FF` to match its arc and its label
(the 64px left figure stays the dominant STEP-1 by size, not by being the only blue thing),
or make the "you" arc visually dominate the grey field (thicker, or pull the you-segment
forward). Don't let the single most important number on the donut be grey under a "YOUR
SHARE" label.
**File:** `apps/web/src/app/(protected)/analytics/_components/SovHeroPanel.tsx:92-98`.

---

## P2 — substantive

### 5. No Fraunces serif beat anywhere — and the rationale is thin (tell #6)
The component header (`AnalyticsWorkbench.tsx:20-21`) declares "/analytics keeps no Fraunces
beat … the serif beat belongs to /sentiment." But the rubric (M5) is "one serif beat per
**screen**," and this is the flagship data screen with a perfect host: the verdict headline
"You hold {n}% of AI answers in your category." Dropping the serif entirely on the product's
most-looked-at analytics page leaves tell #6 fully present here.
**Fix (M5):** set ONE word of the verdict in Fraunces italic — e.g. the category noun or
"answers" — inline in the InterDisplay sentence at `SovHeroPanel.tsx:149-154`. One beat,
verdict only, never in chrome. If the team still wants /analytics to be the "disciplined
blue-structure" page with no serif, that is a defensible call — but it should be an explicit
DESIGN-VISION note, not a per-file comment, because as-is it reads as the serif simply being
forgotten.

### 6. Agent-event markers on the trend chart use only a thin 40%-violet vertical line + sans label — the violet "agents moved the needle" moment is weak (M6/tell #8)
The single most on-brand moment on this page is "violet = where the agents moved the needle"
(`VisibilityTrendChart.tsx:145-160`). But it is rendered as a `rgba(110,86,240,0.4)` 1px line
with an 11px sans label — easily lost behind five colored engine lines. In the desktop crop
the violet labels ("Content agent ran", "Schema agent ran") are faint and the lines barely
register. The product's whole thesis (we don't just show, we DO) is whispering here.
**Fix (M6):** strengthen the agent marker — a solid violet dot on the line at the event date,
a slightly stronger line (`rgba(110,86,240,0.55)`), and a small violet pill label rather than
bare text — so the "an agent ran here" beat is glanceable. Keep violet off any button (it is
correctly an annotation here).

### 7. Avg-position list and topic matrix repeat the same `card-console p-6` + `mb-5` header block as the charts — no in-cell hierarchy contrast (M7)
The Avg-position panel (`AvgPositionPanel.tsx:43-90`) and the topic matrix
(`TopicRankMatrix.tsx:42-50`) reuse the exact card + eyebrow + 14px-sentence header used by
the two charts. Four+ surfaces with identical chrome flattens M7's "number-over-label extreme
hierarchy." The matrix cells are a strong move (tinted ground + mono rank), but the panels
around them don't step.
**Fix (M7/M1):** give the avg-position panel the TIER-3 inset treatment (P1.3) and let its
mono `#1.4` figures be the loud element with the engine label receding; tighten its header to
just the eyebrow (drop the explanatory sentence, or move it to a hover/tooltip) so the panel
reads as a dense stat strip, not another full chart card. (Source-only — not seen rendered.)

### 8. Mobile: the Scope Rail (engines/timeframe/topics) renders as a tall stacked filter wall ABOVE the data (tell #5 + progressive disclosure)
On mobile (populated-mobile.png) the page leads with Export, then the entire filter rail —
ENGINES (5 rows), TIMEFRAME, TOPICS (6 rows) — pushing all actual insight (the SoV hero, the
charts) far below a long scroll of controls. The user opened "How AI search sees you" and the
first full screen is filters, not the answer.
**Why it reads unfinished vs the ref:** on mobile the value should lead; filters should be
collapsed behind a sheet/disclosure.
**Fix (M10):** on `< lg`, collapse the Scope Rail into a single "Filters" button that opens a
bottom sheet (the AnalyticsDrillDrawer pattern already exists), and let the SoV hero be the
first thing below the header. Verify in `AnalyticsLayout.tsx`.

### 9. Every non-hero card carries the identical eyebrow + sentence header → repetitive copy rhythm
"Visibility trend / How often each engine surfaces you…", "Average position / Where you
land…", "Share of voice over time / Your slice…", "Rankings by topic / Your average rank…".
Four identical 12px-eyebrow + 14px-grey-sentence blocks in a row is a copy cadence that reads
generated.
**Fix (M12):** vary it — let the dominant trend chart keep a full header, but reduce the
secondary panels to eyebrow-only (the sentence becomes a tooltip), so the headers don't drum
the same beat four times.

---

## P3 — nice-to-have

### 10. Delta chip mixes mono + sans inside one pill with two type families crammed at 12px
`DeltaChip` (`SovHeroPanel.tsx:104-122`) renders "+6pp" (mono) + "vs. previous 30d" (sans
grey) inside one rounded pill. It is legible but busy — three visual treatments in a 12px
pill. Consider moving "vs. previous 30d" outside the pill as quiet caption text so the pill
holds only the mono delta.

### 11. Empty-state preview is a ghost of the workbench, which is good — but verify the warm character glyph + two-tier CTA actually render (M8)
Source (`AnalyticsWorkbench.tsx:165-193`) has the right shape: titled context, specific next
step, blue pill + quiet "See a sample report" link, `illustration="scan"`. Not screenshotted,
so confirm the illustration is the warm on-brand glyph (not a bare centered icon) and that the
ghost preview doesn't look like a broken-loading skeleton to a first-time real user.

### 12. Loading skeleton uses `craft-enter` stagger (good) — confirm `prefers-reduced-motion` fallback is wired
`AnalyticsSkeleton.tsx` and the donut's 600ms `stroke-dashoffset` transition + the 200ms
engine-fade should all degrade under `prefers-reduced-motion`. Verify the keyframe/transition
are gated; the rubric (M9) requires a static fallback. Not verifiable from a still.

---

## Per-state notes

**Populated desktop (above-fold only):** Strong asymmetric hero — the 64px blue mono "23%",
the 30px InterDisplay verdict, the delta chip, and the right-rail donut + legend are a real
TIER-1 focal and the best part of the page; it stands next to Profound. The damage is in the
left Scope Rail (all-blue chips, P1.1/P1.2) and the fact that everything below the hero is
not visible in this crop — re-capture full-page desktop to validate the 2-up + matrix
rhythm (P1.3 / P2.7).

**Populated mobile:** Header + Export read fine, but the page then becomes a long filter wall
before any insight (P2.8). The engine chips show the same all-blue bug even more starkly here
(five blue pills stacked). The 375 layout does not appear to horizontally overflow.

**Empty / loading / error (source-only, NOT screenshotted):** Empty state is well-structured
on paper (two-tier recovery, ghost preview); error state names a real recovery ("try again …
usually clears right up") + a contact-support link — both meet M8 in source. Must be
screenshotted before a PASS: the brief explicitly requires all four states designed, and the
real-user default for this page IS the empty state, so it is the most-seen state and was not
captured.
