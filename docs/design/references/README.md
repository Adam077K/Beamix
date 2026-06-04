# Beamix Design References

This tree is the visual contract for every screen Beamix builds. It holds the references the design system grades against. Read `docs/design/DESIGN-WORKFLOW.md` first — this folder is the REFERENCE stage of its `REFERENCE -> DIRECTION -> BUILD -> VALIDATE` pipeline.

References are **vibe, not blueprint.** They transfer the feeling — the level of craft, the aesthetic confidence, the density of considered detail — not a pixel-spec to clone. The `product-designer` absorbs them and synthesizes something original in Beamix's own design language. The `design-critic` grades **craft-parity and feeling**, never copy-fidelity. A critic that flags "doesn't match the reference layout" is malfunctioning. PASS means "indistinguishable in craft-level from the references, expressed as Beamix" — not pixel-match.

---

## The two-folder model

```
docs/design/references/
  _product-feel/        GLOBAL soul. Loaded on EVERY screen. Set once.
  _TEMPLATE/            Copy this to start a new screen folder.
  dashboard/            PER-SCREEN folder (first application).
  home/                 PER-SCREEN folder (first application).
  [screen]/             One folder per screen, named after the route.
```

### `_product-feel/` — the global folder (set once)

A small curated set of screenshots that capture the whole-product soul: the single point of view that makes Beamix feel like one coherent thing, not a pile of screens by different hands. Every screen build loads this folder **plus** its own per-screen folder before any code is written. See `_product-feel/README.md` for what belongs and how to drop it.

### `[screen]/` — a per-screen folder (one per screen)

The contract everything for that screen is built toward and graded against. Each holds:

1. The founder's 2-3 **north-star** references — the screens Adam points at and says "that feeling."
2. **Refero-expanded** real-pixel reference screens — `design-lead` pulls adjacent real-product screens via Refero to widen the sample beyond the north-stars, so the bar is a body of evidence rather than three lucky shots.
3. A **`REFERENCE.md`** — the written contract. For each reference it names the **source**, **what we steal (the feeling / the move)**, and **what NOT to copy (the layout, the brand, the literal pixels)**.

---

## How the founder drops north-stars

1. Copy `_TEMPLATE/` to `docs/design/references/[screen]/`, naming the folder after the route (e.g. `dashboard`, `home`, `scan-results`, `onboarding`).
2. Drop 2-3 north-star images into that folder. Real screenshots, full-resolution, real-pixel — not Dribbble mood-board crops. Name them `north-star-1.png`, `north-star-2.png`, `north-star-3.png`.
3. For each one, fill the `REFERENCE.md` row: where it's from, the specific **move** that earns the slot, and what to ignore. Be specific — "the way the metric cards layer depth and the number is the loudest thing on the screen," not "looks clean."
4. Hand off to `design-lead`. The lead runs Refero expansion, completes the contract, and brings it to the **founder checkpoint #1 (LOCK)** before any build starts.

This is **founder checkpoint #1** of the three in the operating system: LOCK the reference folder before any build. The other two — see the ~50% first-paint build, and judge the final — happen later in the pipeline.

---

## Refero expansion (design-lead)

After the founder drops north-stars, `design-lead` widens the sample:

- `refero_search_screens` / `refero_search_flows` to find real-product screens adjacent to the north-stars' feeling.
- `refero_get_screen_image` to save the real-pixel captures into the screen folder as `refero-*.png`.
- `refero_get_style` to note the craft moves worth absorbing.

If Refero is unavailable, log "MCP unavailable, falling back to Playwright" and screenshot real product URLs with `mcp__playwright__browser_take_screenshot` instead. Every Refero-pulled image gets its own row in `REFERENCE.md` with the same source / steal / don't-copy structure — a reference with no written contract does not count.

---

## The `REFERENCE.md` convention

Every per-screen folder has exactly one `REFERENCE.md`. It is the contract the `design-critic` reads before grading and the `product-designer` reads before building. Structure (see `_TEMPLATE/REFERENCE.md`):

- **Screen** + **route** + **status** (founder north-stars dropped → Refero-expanded → LOCKED).
- **The feeling in one line** — the single sentence the whole screen is chasing.
- **References table** — one row per image: `source` · `what we steal (the FEELING / the move)` · `what NOT to copy`.
- **Craft moves to absorb** — the concrete techniques (depth, motion, density, hierarchy) lifted across the references, expressed as Beamix tokens.
- **Beamix translation** — how the feeling lands in Beamix's locked brand (Inter / InterDisplay / Fraunces / Geist Mono, `#3370FF` accent, 8pt grid). The references' fonts and colors are **never** imported; only their craft level is.

Keep it tight and opinionated. The contract is read before every build and every critique — it earns its length by being decisive, not exhaustive.

---

## Hard rules

- References are **vibe, not blueprint.** Absorb and synthesize; never trace.
- The critic grades **craft-parity and feeling**, never 1:1 copy-fidelity.
- Beamix brand tokens (`beamix-brand-quality-bar`) always win over a reference's fonts and colors. Steal the move, not the palette.
- No folder is build-ready until its `REFERENCE.md` is complete and the founder has LOCKED it (checkpoint #1).
- One `REFERENCE.md` per screen folder. One feeling per screen.
