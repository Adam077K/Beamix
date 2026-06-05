# Expanded Palette Proposal — from the references

**Status: RATIFIED 2026-06-05 (founder grill) — full palette, strictly role-scoped.** Now canonical in `docs/design/DESIGN-VISION.md` §3. The locked law: `#3370FF` is the only primary/CTA color; **blue = you, violet = the agents** (violet never a button); all additions are role-scoped punctuation. This doc remains the rationale/derivation; DESIGN-VISION §3 + `BRAND_GUIDELINES.md` are the authoritative token tables. Still TODO: wire tokens into the Tailwind theme + `beamix-brand-quality-bar` skill (engineering pass).

**The founder's ask:** keep overall **blue and white**, but **add colors observed across the references**. Every color below is sampled from the dropped references and cited. The base does not change — blue stays the only primary; the additions are *secondary, gradient, data, status, and surface* roles so the product reads richer without losing its blue-and-white identity.

---

## 1. Base — unchanged (white + blue)

| Token | Hex | Role | Seen in |
|-------|-----|------|---------|
| `surface` | `#FFFFFF` | primary canvas | PostHog, Attio, Mixpanel, Dia |
| `surface-warm` | `#F7F6F2` | warm off-white alt surface (NEW) | Anthropic cream, Superhuman warm gray |
| `surface-muted` | `#F4F6FA` | cards/rows/hover ground | PostHog, Linear |
| `ink` | `#0A0A0A` | text | all |
| `ink-warm` | `#16140F` | warm near-black for editorial/dark panels | Anthropic, Dia |
| `muted` | `#6B7280` | secondary text | all |
| `border` | `#E5E7EB` | hairline borders/dividers | Attio, Anthropic, PostHog |
| **`accent` (PRIMARY)** | **`#3370FF`** | **the one primary — CTAs, links, active, focus** | validated by Raycast `#3B6FF2`, Dia `#3F6FE0`, Attio `#3B6FE0`, Linear `#3B7BF7` |
| `accent-tint` | `#EEF2FF` | blue chips, hovers, shortcut badges (NEW) | Dia `#EAF0FB`, Linear shortcut chips |
| `accent-deep` | `#2454D6` | gradient/pressed blue (NEW) | Dia/Numbers indigo end |

> Rule unchanged: **#3370FF is the only primary accent.** Everything below is restrained and role-scoped — none of it competes with blue as the call-to-action color.

## 2. Secondary accent — violet (NEW)

| Token | Hex | Role | Seen in |
|-------|-----|------|---------|
| `violet` | `#6E56F0` | secondary accent — pairs with blue for gradients, AI/agent surfaces, secondary emphasis | Superhuman `#6B5BFF`, Mixpanel `#7C5CD6`, Coda plum, Numbers `#4B3FD4` |
| `violet-tint` | `#EEEAFD` | violet chip ground | Mixpanel `#EDE7F6` |

Blue→violet is the single sanctioned gradient (`#3370FF → #6E56F0`), used only for hero washes, the AI/scan-engine diagram, and the score reveal — never on buttons.

## 3. Soft gradient washes (NEW — backgrounds/illustration only)

Low-opacity pastel washes for hero backdrops, empty-state grounds, and illustration fills. **Never** as fills on text, buttons, or data. Sampled from Superhuman + Mixpanel + Dia.

| Token | Hex | Seen in |
|-------|-----|---------|
| `wash-sky` | `#EAF0FB` | Dia hero arc |
| `wash-lavender` | `#ECE7FB` | Mixpanel/Superhuman |
| `wash-blush` | `#FBEAF0` | Superhuman `#F4C8D8` |
| `wash-mint` | `#E6F5EE` | Superhuman accent |

## 4. Data-viz ramp (charts, scores) — extend the locked set

Locked score-semantic colors stay (validated by PostHog/Retool status icons). Add desaturated series tints for multi-series charts (from Mixpanel's pastel bands), anchored on blue.

| Token | Hex | Role |
|-------|-----|------|
| `data-1` | `#3370FF` | primary series (blue) |
| `data-2` | `#6E56F0` | series 2 (violet) |
| `data-3` | `#06B6D4` | series 3 (cyan — locked) |
| `data-4` | `#10B981` | positive / series 4 (green — locked) |
| `data-5` | `#F59E0B` | warning / series 5 (amber — locked) |
| `data-6` | `#EF4444` | negative / critical (red — locked) |
| `data-grid` | `#EAEAEA` | gridlines, in-cell bar ground (Numbers/PostHog) |

Score ring & rank deltas keep cyan→green→amber→red. Charts default to the blue/violet pair + desaturated tints, not full saturation (Mixpanel lesson: pastel multi-band, not loud).

## 5. Status / category pills (NEW — soft tag set)

From PostHog nav icons + Superhuman category tags + Linear labels. Each = tinted ground + saturated text, never loud fills.

| Status | Text | Ground |
|--------|------|--------|
| info / active | `#3370FF` | `#EEF2FF` |
| agent / AI | `#6E56F0` | `#EEEAFD` |
| positive | `#0E9E6E` | `#E6F5EE` |
| warning | `#B8770B` | `#FDF3E0` |
| critical | `#DC2626` | `#FDECEC` |
| neutral | `#6B7280` | `#F3F4F6` |

## 6. Dark panels (NEW — contrast sections)

For testimonials, the AI/scan-engine diagram, and dark hero moments (Anthropic, Mixpanel band, Raycast, Coda). One warm near-black, one deep navy. Fraunces serif is allowed here (per brand).

| Token | Hex | Seen in |
|-------|-----|---------|
| `panel-dark` | `#14140F` | Anthropic, Dia ink |
| `panel-navy` | `#0E1424` | translation of Mixpanel oxblood/Raycast dark |

> Mixpanel's oxblood `#3D1626` and Coda's plum are **not** adopted — they translate to `panel-navy`/`panel-dark`. We take the dark-panel *move*, not the maroon.

## 7. Character (NEW — Beamie direction)

PostHog's hedgehog + Ship's pixel mascots confirm the direction: a mascot in empty/first-run/loading states. Render in near-black line + `#3370FF` accent fills (not multicolor). Ties to the existing deferred-Beamie decision — animations yes, full companion later.

---

## What this changes vs. today

- **Adds:** a violet secondary, a blue→violet gradient, four pastel washes, two extra chart series tints, a 6-status pill set, two dark-panel tokens, a character-color rule, and a warm off-white surface.
- **Keeps locked:** white base, `#3370FF` as the only primary/CTA accent, the score-semantic colors, the fonts (InterDisplay/Inter/Fraunces/Geist Mono), 8pt grid.
- **Net feel:** still unmistakably blue-and-white, but with the warmth (Anthropic), gradient softness (Superhuman/Dia), and data richness (Mixpanel/Numbers) the references carry — color as considered punctuation, never decoration.

**On approval:** I'll fold these tokens into `beamix-brand-quality-bar` + `docs/BRAND_GUIDELINES.md` + the Tailwind theme, and the `design-critic` will grade against them.
