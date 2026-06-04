<!--
  TEMPLATE — copy this whole folder to docs/design/references/[screen]/ to start a new screen.
  Name the folder after the route (dashboard, home, scan-results, onboarding, settings).
  Fill every row. A reference with no written contract does not count.
  References are VIBE, not blueprint: steal the FEELING / the move, never the layout or brand.
-->

# Reference contract — [Screen name]

- **Route:** `/[route]`
- **Status:** founder north-stars dropped → Refero-expanded → **LOCKED** _(advance as the folder fills; build starts only at LOCKED — founder checkpoint #1)_
- **Owner:** design-lead

## The feeling in one line

> _One sentence. The single feeling this whole screen is chasing. Decisive, not a list. E.g. "Calm command-center confidence — the user's score is the loudest thing on the screen and everything else recedes."_

---

## References

One row per image in this folder. North-stars first, Refero-pulled screens after. **Steal the move, not the layout.**

| File | Source | What we steal — the FEELING / the move | What NOT to copy |
|------|--------|----------------------------------------|------------------|
| `north-star-1.png` | _Where it's from (product, page)_ | _The specific move that earns the slot — "the way one hero number anchors the page and the surrounding cards layer real depth"_ | _The layout, the fonts, the colors, the brand — the literal pixels_ |
| `north-star-2.png` | _Product / page_ | _The move_ | _The literal pixels_ |
| `north-star-3.png` | _Product / page_ | _The move_ | _The literal pixels_ |
| `refero-1.png` | _Refero — real product screen_ | _The adjacent craft move worth absorbing_ | _The literal pixels_ |
| `refero-2.png` | _Refero — real product screen_ | _The move_ | _The literal pixels_ |

---

## Craft moves to absorb

The concrete techniques lifted across the references — expressed as Beamix, not as the references' brand. Be specific enough that the `design-critic` can grade against each one.

- **Depth:** _e.g. double-bezel cards, considered shadow ramps — never flat, never harsh `shadow-md`._
- **Hierarchy:** _what is loudest, what recedes; the one element that owns the screen._
- **Motion:** _the signature moment (one per screen, Tier 1) + the subtle transitions; `ease-out` in, `ease-in` out, `prefers-reduced-motion` fallback._
- **Density:** _the rhythm of considered detail that makes it feel inevitable rather than sparse-or-cluttered._
- **Type:** _the typographic confidence move, translated to InterDisplay / Inter / Fraunces / Geist Mono._

---

## Beamix translation

How the feeling lands in Beamix's **locked** brand. The references' fonts and colors are never imported — only their craft level.

- **Fonts:** InterDisplay (headings) · Inter (body/UI) · Fraunces (dark sections / testimonials only) · Geist Mono (scan data / code).
- **Color:** accent `#3370FF` (CTAs / links / active only) · surface `#FFFFFF` / `#F7F7F7` · text `#0A0A0A` · muted `#6B7280` · border `#E5E7EB` · score colors `#06B6D4` / `#10B981` / `#F59E0B` / `#EF4444` (data-viz only).
- **System:** 8pt grid · `rounded-lg` product utility · Lucide icons, single strokeWidth · all four states designed (loading / empty / error / success).

`beamix-brand-quality-bar` is authoritative. Steal the move, not the palette.

---

## PASS bar for this screen

PASS = "indistinguishable in craft-**level** from the references above, expressed as Beamix" — not pixel-match. The critic scores the **richness gap** against this contract and returns a specific list of what's missing to reach the references' craft bar, in Beamix's own language.
