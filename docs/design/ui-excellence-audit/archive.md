---
page: /archive (Run History / Output Archive)
states_audited:
  - populated-desktop.png
competitor_refs_used:
  - Profound "110 prompts" data table (Profound-Screenshot 2026-06-12 at 10.39.25 AM.png)
  - Profound answer-engine insights table (Profound-Screenshot 2026-06-12 at 10.37.47 AM.png)
  - Profound onboarding rail (Profound-Screenshot 2026-06-12 at 10.38.16 AM.png)
  - Otterly populated dashboard (otterly-Screenshot 2026-06-12 at 10.44.17 AM.png)
verdict: NEEDS_WORK
---

# archive — UI Excellence Audit

## Screenshots
- [populated-desktop.png](./screenshots/archive/populated-desktop.png)

Only ONE state screenshot was captured (`populated-desktop.png`). The empty, error, loading, mobile, and drawer-open states were NOT rendered, so this audit cannot certify those states visually — it can only audit the source for them. **This is a coverage gap: re-capture `empty-desktop`, `mobile-375`, and `drawer-open` before a PASS verdict is possible.**

## Verdict
**NEEDS_WORK** — The page is clean, on-brand, and free of any brand-law violation (blue=you / violet=agents is correctly applied, numbers are mono, status pills use the tinted-ground set, no retired colors/fonts). But it does NOT yet hit the competitor bar. Next to Profound's "110 prompts" table — which carries rank columns, color-coded deltas, in-cell visual weight, and a confident dense-data rhythm — Beamix's run table reads as a flat, evenly-weighted "5-column SaaS list" with no signature data detail, no felt depth hierarchy inside the card, and an oversized empty zone of dead whitespace on the right. The TIER-1 "hero" wrapper is functionally invisible (no felt elevation). It is professional but generic; the craft tells #1 (uniform depth), #3 (evenly-weighted type), #4 (zero signature detail), and #7 (flat motion at rest) are all present.

---

## P1 — must fix (looks AI / broken)

### P1-1. The "hero" card has no felt depth — TIER-1 is invisible (tell #1, M1)
The whole table sits in `card-console-hero` (`page.tsx:36`) whose shadow is `--shadow-card-hero: 0 0 0 1px rgba(10,10,10,0.06), 0 2px 6px …, 0 8px 24px rgba(10,10,10,0.05)` (`globals.css:80`). In the render the card edge is barely perceptible — it reads as a hairline rectangle flush on white, indistinguishable from a TIER-2 surface. The page claims "TIER-1 focal" in its own comment but there is only ONE surface on the page, so there is nothing for it to be elevated *against* — the depth-staging move (3 felt tiers) collapses to one flat plane. Against Profound, whose table sits on a clearly recessed app canvas with a distinct content card, this reads as unfinished.
- **Why AI/broken:** uniform depth, hierarchy told-not-felt (tell #1). A "hero" that looks identical to a plain div is the canonical AI giveaway.
- **Fix (M1, M12):** put the table card on the standard `--color-surface-warm`/canvas tone so the white card lifts off it, OR drop the hero shadow and instead introduce a genuine TIER differential — e.g. a slim TIER-3 `.card-inset` meta strip (count + last-run timestamp + total-cost summary) ABOVE the table so the table card visibly reads as the focal TIER-2/1 surface beside a recessed strip. One focal must be felt at arm's length.
- **File:** `page.tsx:36`, `globals.css:80,207`.

### P1-2. No signature data detail anywhere — the table is a bare 5-column list (tell #4, M4/M7)
Every row is `name + grey snippet | mode pill | status pill | time | cost | chevron` (`RunTable.tsx:319-389`). There is no rank figure, no sparkline, no in-cell data weighting, no big-mono-figure-over-label. Compare Profound's table: each row carries a rank chip (`#1`), a bold visibility-score figure, a green/red delta, average-position and citation-share columns — the data *is* the design. Beamix's only "numbers" are a tiny grey timestamp and a tiny grey cost, both visually recessive, so the table has zero data presence. This is the literal "nothing a template wouldn't have" tell.
- **Why AI/broken:** zero signature detail (tell #4); no in-cell data shading / number-over-label hierarchy (M7 absent).
- **Fix (M4/M7/M11):** give the run row a piece of *truth* with weight. Options that fit the data: (a) a mono **cost** figure promoted to a real column-right metric with tabular alignment and a subtle band when >\$0; (b) a tiny **duration/step-count** mono figure; (c) the M4 engine micro-sparkline is not applicable here, but a per-run **mini outcome indicator** (e.g. "+3 schema fields", "scored 94/100") pulled from the trace, rendered mono, would give each row a reason to exist. At minimum, right-align cost as a dominant mono figure and let it carry the row, not a 11px grey afterthought.
- **File:** `RunTable.tsx:360-368`.

### P1-3. Massive dead whitespace right of every row — columns float left, COST/chevron stranded mid-table (tell #5, M3/M12)
In the render the five data columns (`AGENT … COST`) are packed into roughly the left 70% of the card and the chevron sits well short of the right edge, leaving a wide empty band down the entire right side of the table. The header labels (TIME, COST) and the chevron do not reach the card's right padding, so the table looks like it was authored at a narrower width and dropped into a wider card. This is the "awkward gaps / floating elements" tell and it makes the surface read unbalanced and unfinished.
- **Why AI/broken:** mis-weighted layout / dead space (tell #5); whitespace not varied by relationship (M12). Profound's table fills its content width edge-to-edge with the rightmost metric column flush to the container.
- **Fix (M3/M12):** make the table `w-full` actually distribute — give AGENT a generous `w-full`/`min-w-0` truncating cell and push MODE/STATUS/TIME/COST/chevron to the right edge with the chevron column flush to the card's right padding. Right-align the COST and TIME headers + cells so the numeric columns form a clean right rail (standard data-table craft). Kill the floating mid-card chevron.
- **File:** `RunTable.tsx:487-517` (table is `w-full min-w-[640px]` but cells use `pr-4` left-flow with no right anchor), header `:494-503`.

---

## P2 — substantive

### P2-1. Evenly-weighted typography — nothing commands, nothing recedes inside the table (tell #3, M2)
Agent name is 14px medium; snippet 12px grey; all five header labels 11px grey uppercase; time and cost 12px grey mono. Every row is visually the same weight as every other — there is no STEP-1 figure, and the STEP-2/3/4 contract is compressed into a narrow 11–14px band. The four-step type contract (M2) is not visibly stepped on this surface. The eye has no anchor.
- **Fix (M2):** introduce one clear weight anchor per row (the agent name slightly larger / darker, or a promoted mono metric per P1-2), and let the snippet recede further (lighter grey, single line). Make the gap between the name and the metadata obvious.
- **File:** `RunTable.tsx:336-339`.

### P2-2. Serif beat is effectively absent at arm's length (tell #6, M5)
`<SerifVerdict>replay</SerifVerdict>` wraps the word "replay" in the subtitle (`page.tsx:31`). In the render this italic serif beat is not perceptible — at body size inside a grey 15px caption it does not register as the one editorial Fraunces moment the rubric wants; it reads as ordinary body text. The screen's "one serif beat" is therefore functionally missing.
- **Fix (M5):** either make the serif beat land on a more prominent verdict word with real contrast (size/color/italic), or accept that a dense data table is a chrome surface where the serif beat may not belong and move the one editorial beat to a genuine verdict moment (e.g. inside the trace drawer's outcome line). Confirm `SerifVerdict` actually renders Fraunces italic and is legible at 15px — verify in the render, currently it does not read as serif.
- **File:** `page.tsx:30`, `components/console/SerifVerdict`.

### P2-3. Filter bar reads as three identical grey dropdowns — generic, no active/result feedback (tell #2-adjacent)
Three equal-width-ish `Select` triggers (`RunTable.tsx:166-212`) sit in a row with the "12 runs" count below. This is fine functionally but visually it is the flattest possible filter treatment and competes with Profound's richer filter rail (period selector, "Group by", customize columns, search). No visual indication of which filters narrow the 12 runs. The "Clear filters" link only appears when filtered, so at rest the bar is three undifferentiated pills.
- **Fix (M12):** tighten the filter cluster (it is a related group — smaller gap), move the "12 runs" count inline/right-aligned with the filters on one hairline row, and add a subtle active-filter affordance (accent ring or count chip) so the bar reads as a control surface, not decoration. Consider a lightweight search input to match the competitor density.
- **File:** `RunTable.tsx:160-228, 478-483`.

### P2-4. Flat at rest — no entrance choreography is visible and no row-level life (tell #7, M9)
The page applies `craft-enter craft-enter-1/2` (`page.tsx:21,36`) for a fade-up, which is correct and on-spec, but as a static screenshot the table is inert and the only motion in the source is the `running` status dot pulse (`RunTable.tsx:92-95`) — and there is no running row in the demo data, so even that is absent. Row hover ground (`hover:bg-[#F4F6FA]`, `RunTable.tsx:322`) is present (good, M7) but there is no left status-color hairline on hover as M7 prescribes.
- **Fix (M7/M9):** add the M7 left status-color hairline on row hover (green/red/violet 2px inset-left keyed to status), so hover reads as designed, not just a grey wash. Verify the entrance stagger fires per-row, not just on the whole card.
- **File:** `RunTable.tsx:322`.

### P2-5. Status + Mode pills are visually near-identical small rounded chips (M6 partially flattened)
Mode "Manual" (blue tint) / "Autonomous" (violet tint) and Status "Done" (green) / "Failed" (red) are all the same `rounded-md px-2 py-0.5 text-xs` chip shape (`RunTable.tsx:84-89, 108-122`). The blue=you / violet=agents law is correctly colored, but because Mode and Status pills are the same shape and size sitting in adjacent columns, the agent-vs-you spatial signal does not read at arm's length (tell #8) — it looks like four interchangeable colored tags. The violet "Autonomous" ring is the right move but it is one tiny chip, not a spatial zone.
- **Fix (M6):** differentiate the Mode signal from the Status signal — e.g. Mode as a quiet text+dot (violet dot for autonomous, blue dot for manual) rather than a second pill, reserving the pill shape for Status. That makes the you-vs-agents axis glanceable instead of a fourth tag.
- **File:** `RunTable.tsx:81-123`.

---

## P3 — nice-to-have

### P3-1. Snippet truncation is hard mid-word with no tooltip (`RunTable.tsx:337`)
Snippets truncate at `max-w-[380px]` with `truncate`. Several visible rows cut mid-sentence ("3 lo…", "Tel Aviv…", "page with 2026 pricing data and updated pos…"). Add a `title` attribute or row-expand so the full snippet is recoverable; right now the most informative part of each row is clipped.

### P3-2. Cost "—" em-dashes stack visually (`RunTable.tsx:51`)
Three rows show "—" for zero cost. Stacked grey em-dashes in the rightmost numeric column create a faint vertical pattern of "missing" that reads as broken data rather than "free run". Consider a quieter treatment (e.g. "$0.00" muted, or "free" tag) so zero-cost reads as intentional.

### P3-3. Eyebrow "BRIGHT SMILE DENTAL" + "Run History" — the business-name eyebrow is good, but verify it is real per-account data, not hardcoded
`page.tsx:25` hardcodes `eyebrow="Bright Smile Dental"`. Fine for Phase-1 mock, but flag for wiring — a hardcoded demo business name shipping to a real account is a classic mock-data leak.

### P3-4. Header label casing/tracking is on-spec but the empty 6th column header is a bare `''` (`RunTable.tsx:494`)
The chevron column uses an empty-string header keyed `''` in the map. Harmless but fragile (duplicate-key risk if another empty header is added); give it `aria-hidden` spacer semantics.

---

## Per-state notes

**Populated (desktop) — the only captured state:**
- Clean, legible, on-brand. No brand-law violations. Numbers are mono. Violet/blue split is correctly applied. This is a competent baseline.
- Reads generic vs Profound: flat single-plane depth, no data signature, dead right-side whitespace, evenly-weighted type. NEEDS_WORK, not CRITICAL.
- 11 rows visible; the 12th ("Review Presence Planner", 04 Jun 26) is at the fold — vertical rhythm is a uniform `py-3` per row (`RunTable.tsx:335` etc.), no M12 relationship-based spacing variation, which contributes to the "flat list" feel.

**Empty / filtered-empty (source-only, NOT rendered):**
- Source looks well-built: `EmptyState` with two-tier CTA (`RunTable.tsx:434-453`) and `EmptyFiltered` with reset + secondary link (`:277-307`). BUT `EmptyFiltered` (`:280-289`) is exactly the "bare centered icon-in-circle" the rubric calls out (tell #5) — a 40px circle with a grey magnifier glyph, centered, `py-16`. This is the AI-empty pattern M8 explicitly bans. **Must verify in render and likely fix:** replace the bare centered glyph with a warm, designed empty per M8.
- Cannot certify either empty state visually — re-capture required.

**Error (source-only, NOT rendered):**
- Uses shared `ErrorState` with a real recovery action and honest copy ("stored locally — usually clears up on retry", `RunTable.tsx:421-428`). Looks correct in source; not visually verified.

**Loading (source-only, NOT rendered):**
- Two parallel skeletons exist (`page.tsx:50-86` Suspense fallback AND `RunTable.tsx:235-271` SkeletonRows) — they are near-duplicates. Confirm they match each other to avoid a layout flash on hydration. Not visually verified.

**Mobile (375) — NOT rendered:**
- Table is `min-w-[640px]` inside `overflow-x-auto` (`RunTable.tsx:486-488`), so on mobile it horizontally scrolls rather than reflowing. Horizontal-scroll tables are a known mobile-craft weakness — needs a render at 375px to judge whether the scroll is acceptable or whether rows should collapse to a stacked card layout. **Coverage gap — must capture.**

**Drawer (RunTraceDrawer) — NOT rendered:**
- `page.tsx` comment claims "M6 violet in drawer". The trace drawer is the surface where the agent-zone violet structure and the one serif verdict beat could genuinely land, but it was not captured. Re-capture `drawer-open` to audit the most craft-load-bearing state on this page.
