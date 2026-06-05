# `_components/` — the component & section library

The third kind of reference. `_product-feel/` holds the whole-product **soul**; each `[screen]/` folder holds a screen's **composition**. This folder holds the **parts**: "I love this exact card / table / chart / empty-state," independent of which product or screen it came from.

Use this when the founder points at a screenshot and says *"I love this specific thing"* — not the whole feel, not the whole screen, just that one component or section. The agents pull from here when building the matching part on any screen.

---

## The one law (read this before dropping anything)

**Color, fonts, and brand are NEVER taken from a reference.** They come only from `beamix-brand-quality-bar` — white/off-white surface (`#FFFFFF` / `#F7F7F7`), text `#0A0A0A`, accent `#3370FF` (CTAs / links / active only), locked fonts (InterDisplay / Inter / Fraunces / Geist Mono).

A reference exists **only** for its named *move*: depth, structure, spacing, density, motion, hierarchy. A black card you love becomes a **white** Beamix card with the same shadow ramp and padding, blue only on the CTA. If a screenshot is dark, that is irrelevant — the agent reads the **Take** note, not the pixels' color.

This is why every image needs a written note. A screenshot with no note is ambiguous and will leak the wrong palette. **No note = the agents ignore the image.**

---

## Folders (drop by part, not by product)

| Folder | What goes here |
|--------|----------------|
| `cards/` | Metric/score cards, content cards, pricing cards — anything where depth + internal hierarchy is the move |
| `tables-lists/` | Data tables, ranking lists, rows — "dense yet calm" treatments |
| `charts-dataviz/` | Charts, score rings, sparklines, gauges, deltas |
| `empty-first-run/` | Empty states, zero-data, first-run screens that still feel premium |
| `nav-shell/` | Sidebars, top bars, command palettes, the app shell |
| `forms-inputs/` | Inputs, search, filters, settings forms |
| `overlays-detail/` | Modals, drawers, detail panes, slide-overs |
| `motion/` | A short clip or frame-sequence whose *motion* is the move (note the timing/easing) |

---

## The per-image note schema (this is the whole point)

Every image gets a small block in this folder's `INDEX.md` (or a `.md` sidecar next to it — same fields). Fill all four lines. **Leave always starts with color + brand.**

```
### cards/score-card-stripe.png
- Take:  the move — what to absorb. "soft 2-layer shadow ramp + 1px top highlight,
         generous internal padding, the primary number is the loudest element"
- Leave: ALWAYS color + brand first. "dark surface -> Beamix WHITE #FFF, text #0A0A0A,
         #3370FF only on the CTA; its font -> Inter/InterDisplay; the literal layout"
- Maps to: where this lands in Beamix. "dashboard score card, paywall card"
- Source:  product / page it came from
```

`Take` = the move. `Leave` = everything else, color and brand first, every time. `Maps to` tells the agent which Beamix surface this informs. That's how the designer differentiates "the component I love" from "the colors of the product's soul."

---

## How it gets used

`product-designer` loads `_product-feel/` + the screen folder + any `_components/` notes tagged `Maps to: [this screen]` before building. `design-critic` grades whether the built part carries the same craft-**level** as its component reference — expressed in Beamix's palette, never the reference's. A critic flagging "the color doesn't match the reference" is malfunctioning; the color is *supposed* to differ.
