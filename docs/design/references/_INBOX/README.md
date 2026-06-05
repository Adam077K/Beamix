# `_INBOX/` — drop unsorted screenshots here

You have a pile of screenshots of different kinds. Don't sort or annotate them yourself. **Drop them here, and the design-lead (or CEO) sorts + writes the proper contract for each**, then moves them into the right folder. An image only counts once it has a written Take/Leave note in its destination folder — that is done for you from here.

## How to drop — the filename IS the instruction

Name each screenshot **`website_what-you-liked.png`**. That filename is the whole input from the founder — no separate notes file needed.

- Left of the first underscore = **the source** (e.g. `stripe`, `linear`, `mercury`, `plausible`).
- Right of it = **what you loved**, in hyphens (e.g. `card-depth`, `dense-table-calm`, `empty-state`, `score-ring`, `sidebar-nav`).

Examples:
- `stripe_card-depth.png`
- `linear_dense-table-calm.png`
- `mercury_empty-state.png`
- `plausible_kpi-strip.png`
- `notion_first-run-that-sells.png`

Then tell the agent **"sort the inbox."** For each image it:
1. Reads the source + the "what you liked" from the filename.
2. Decides the kind (soul / screen / component) and the component type.
3. Writes the full Take / Leave / Maps-to contract — `what-you-liked` seeds **Take**; **Leave** is always color + brand first (dark -> Beamix white-and-blue); the agent derives **Maps to**.
4. Renames to the folder convention and files it into `_product-feel/`, `_components/[type]/`, or the right `[screen]/`.

If a filename is ambiguous, the agent files it to its best-guess folder and flags the row for a quick founder confirm — it never silently drops an image.

## How each image gets routed (the three kinds)

| If the screenshot is really about... | It is a... | Lands in |
|--------------------------------------|------------|----------|
| The whole-product *feeling* (overall calm/confidence) | **Soul** | `_product-feel/` |
| A *full screen's* layout and hierarchy | **Screen** | `dashboard/`, `home/`, `[screen]/` |
| One *part* you love (a card, table, chart, empty-state, nav) | **Component** | `_components/[type]/` |
| A *marketing / landing* surface | Soul or Component | `_product-feel/` or `_components/`; never a dashboard screen folder |

The same screenshot can spawn two entries (e.g. a dashboard shot used both as a soul ref and for its specific chart). The contract for each says exactly what to take.

## The law that travels with every image

Color, fonts, and brand are never taken from a reference — only the named move. Dark references become white-and-blue Beamix. See `_components/README.md`.
