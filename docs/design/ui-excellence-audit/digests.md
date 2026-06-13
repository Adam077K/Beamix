---
page: /digests (weekly digest archive — list view)
states_audited:
  - populated-desktop.png (3 digests, list view at ~1440px)
  - empty-desktop.png (zero-digest empty state — ghost preview, above-fold only)
states_NOT_captured:
  - populated-mobile (375px accordion) — NOT provided, mobile claims unverified
  - loading skeleton — NOT provided
  - error state — NOT provided
  - desktop slide-over panel open — NOT provided
competitor_refs_used:
  - Profound-10.39.25 (Answer Engine Insights data table — 110 prompts, mono numbers + green/red deltas)
  - Profound-10.38.57 (Nike Visibility Score dashboard — 72.9% hero figure + line chart + ranked asset list)
  - Profound-10.38.16 (topic-selection split with right-rail tips card)
  - otterly-10.44.17 (onboarding split — left form / right preview rail)
  - dashboard exemplar + _product-feel (feel-attio-whitespace, feel-dia-blue-hero) per REFERENCE.md
verdict: CRITICAL_ISSUES
---

# digests — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/digests/populated-desktop.png)
- [empty-desktop.png](screenshots/digests/empty-desktop.png)

> Scope note: the captured screenshots are the **`/digests` archive LIST view** (rendered by `DigestList.tsx`), NOT the `/digests/[digestId]` detail view that `references/digests/REFERENCE.md` was written for. The detail page (hero delta, sparkline, Fraunces beat, customer note) is unaudited — no screenshot was provided for it. This audit grades the LIST view that was actually rendered, against the competitor bar and CRAFT-SYSTEM rubric. Mobile, loading, error, and panel-open states were not captured and are flagged as unverified.

## Verdict
**CRITICAL_ISSUES.** As rendered, the list view sits well below the competitor bar and reads AI-generated on first glance. It commits the two loudest tells at once: a flat single-card list with no felt depth or focal (tell 1), and a layout dominated by a half-empty right gutter with no rail (tell 5). The single most important typographic object — the weekly verdict headline — is **truncated to three words** ("Perplexity pi…"), so the one thing that should command the scan is illegible. The empty state, as rendered above the fold, looks like a stuck loading skeleton rather than a designed empty (M8 fail). Profound and Otterly both fill the canvas with a weighted two-region layout and a real data hierarchy; this screen leaves ~45% of the viewport dead and presents the data as an undifferentiated list of equal rows.

This is fixable without a ground-up redesign — the bones (rows, mono deltas, violet reviewed-pill, search toolbar) are sound — but the focal, the truncation, the dead space, and the empty state are all P1 and the screen cannot ship in this state.

---

## P1 — must fix (looks AI / broken)

### 1. Verdict headline is truncated to 3 words — the loudest object is illegible
**Problem:** Each row's headline (the weekly *verdict* — "Perplexity picked up your FAQ block — three queries landing this week") is rendered `truncate` at `text-[14px]` flex-1, so on desktop it shows "Perplexity pi…", "Schema fix la…", "Audit comple…". The single most meaning-bearing string on the page is cut after ~3 words.
**Why it reads AI/broken vs ref:** Profound's table (10.39.25) never truncates its primary label to nonsense — prompt rows wrap or are sized to be readable. A list whose primary content is unreadable is a template that was never tested with real copy (tell 3 + 4, M2 violation — the STEP-2 verdict register is destroyed).
**Fix (M2, M3):** This is a symptom of the dead-space problem (#3). With the list given proper width (or a 2-line clamp `line-clamp-2` instead of single-line `truncate`), the headline must read as the dominant row element — Inter 15px `#0A0A0A`, not 14px `#374151` muted. The verdict is the content; the date/deltas are metadata.
**File:** `apps/web/src/components/digests/DigestRow.tsx:86-88` (`min-w-0 flex-1 truncate text-[14px] text-[#374151]`).

### 2. No TIER-1 focal anywhere — flat uniform list, hierarchy told not felt
**Problem:** The entire page is `PageHeader` + one `.card-console` containing equal-weight rows. There is no hero, no score-movement headline, no depth staging. Every row is the same weight; nothing commands, nothing recedes.
**Why it reads AI/broken vs ref:** Profound's dashboard (10.38.57) opens with a **72.9%** hero figure and a chart before the ranked list — the eye lands on the number first (M10 above-the-fold focal). Beamix's own dashboard exemplar opens with a 64px mono score. This list opens with… a search box and three identical rows. Tells 1 (uniform depth) + 3 (evenly-weighted type) + 10 (no progressive disclosure).
**Fix (M1, M10):** Promote the most-recent digest ("Week of Jun 8") to a TIER-1 hero strip above the archive list: the dominant engine delta in 64px Geist Mono (`+8` / Perplexity), the verdict headline in 30px InterDisplay-Medium, then the older weeks recede into the TIER-2/3 archive list below. This is exactly the move REFERENCE.md §"Depth" specifies — it currently lives only on the detail page; the list landing needs its own focal so the page isn't a flat directory.
**File:** `apps/web/src/components/digests/DigestList.tsx:93-166` (the list is the whole page; add a hero region above it).

### 3. ~45% of the viewport is dead space — no rail, mis-weighted asymmetry
**Problem:** At 1440px the list column renders at ~600px wide (capped to `max-w-[560px]` only when a panel is open, but even unselected it floats left and the whole `max-w-6xl` page leaves the right half empty). The screenshot shows a large blank zone from ~x:910 to the edge.
**Why it reads AI/broken vs ref:** Both Profound (10.38.16) and Otterly (10.44.17) use a **weighted two-region** layout — dominant content + a narrower right rail (tips card / preview). Beamix leaves the gutter empty with nothing in it. This is tell 5 (mis-weighted, content stranded left) and a missed M3.
**Fix (M3):** Give the page a real `[1fr_360px]` (or `[1fr_340px]`) split. Left = the archive list. Right rail (always present, not only on selection) = a standing summary: "Where you stand right now" mini score snapshot (the 3 engines, current scores, mono), or "Your record: 3 weeks tracked" with the cumulative trend. The slide-over detail panel can replace the rail on row click. The canvas must not read half-finished.
**File:** `apps/web/src/components/digests/DigestList.tsx:94-101` + `apps/web/src/app/(protected)/digests/page.tsx:31` (`max-w-6xl`).

### 4. Empty state renders as a broken loading skeleton above the fold
**Problem:** `DigestEmptyState` is a ghost-preview card at `opacity-40`/`opacity-30` filled with em-dashes and grey `bg-[#F3F4F6]` bars. In the captured viewport that is ALL the user sees — the actual designed content (the "Your first weekly digest lands this Sunday" headline + link) is at the very bottom of the card, **entirely below the fold**. As rendered, the page looks like data failed to load.
**Why it reads AI/broken vs ref:** A designed empty (M8) must lead with titled context + a specific next step, never a bare ghost. The skeleton-at-30%-opacity is indistinguishable from a stuck loading state — it violates the "never a dead placeholder" rule the component's own comment claims to follow.
**Fix (M8):** Invert the priority. Lead the empty card with the warm verdict — "Your first weekly digest lands this Sunday" (InterDisplay, real weight), the one-line promise, and the quiet "See your live dashboard →" link — ABOVE the fold. The ghost preview, if kept at all, should be a small secondary illustration, not the dominant element at near-zero opacity. Add a warm character glyph per M8 (moments-only). The two-tier recovery (primary intent + quiet link) must be visible without scrolling.
**File:** `apps/web/src/components/digests/DigestEmptyState.tsx:15-118` (the Sunday promise at lines 101-116 must move up; the ghost at 24-99 must recede or shrink).

---

## P2 — substantive

### 5. Delta trio is an N-equal micro-grid with no signature detail
**Problem:** Each row shows three identical green pills (`68 →71`, `63 →64`, `70 →78`) of equal size and weight via `DeltaTrioBadge`. No dominant-engine emphasis, no sparkline, no spatial weighting.
**Why it reads AI vs ref:** Profound's table pairs each number with a colored delta AND a trend context; REFERENCE.md §"Signature detail" mandates the **24px micro-sparkline** (M4) of the 4-week arc on each engine. None is present here. Three equal chips is tell 2 in miniature.
**Fix (M4, M7):** Add the micro-sparkline (the screen has `fourWeeksAgo` data in the stub for exactly this). Weight the dominant mover — the engine with the largest delta should read louder (bolder, or first). The `→` arrow currently renders at `opacity-70` and is nearly invisible at 12px; make the before-value the recessive one and the after-value the figure.
**File:** `apps/web/src/components/digests/DeltaTrioBadge.tsx:27-44` and `:82-86` (the faint arrow).

### 6. Zero serif beat — Fraunces absent (tell 6)
**Problem:** Nowhere on the list view does the warm-minimal soul appear. The page header is plain Inter/InterDisplay; rows are all sans.
**Why it matters vs ref/rubric:** REFERENCE.md §"Type" and CRAFT-SYSTEM M5 both require exactly one Fraunces italic beat per screen (the dominant engine name in the narrative line). The list view has no narrative line, so it currently has no place for it — but if a TIER-1 hero is added (#2), the hero's one-line summary is the natural home for the single italic-serif beat (e.g. "_Perplexity_ moved the most this week").
**Fix (M5):** Land one Fraunces italic word in the new hero strip's narrative line. Never in the row chrome.
**File:** new hero region (see #2).

### 7. Flat/near-absent motion (tell 7)
**Problem:** The list `<ul>` rows mount instantly. REFERENCE.md §"Motion" specifies `.craft-enter-1..4` staggered fade-up for the wins; the rows here have no entrance choreography, only a CSS hover color (`hover:bg-[#F4F6FA]`).
**Why it matters:** The dashboard exemplar uses a priority-ordered fade-up on first paint (M9). A static list reads as the generic default state.
**Fix (M9):** Apply the `.craft-enter` stagger to the archive rows (and the hero strip first), ≤200ms ease-out, 40ms stagger, behind `prefers-reduced-motion`.
**File:** `apps/web/src/components/digests/DigestList.tsx:140-163`.

### 8. The whole result lives in one undifferentiated `.card-console` — no editorial rhythm
**Problem:** Toolbar + every row + (empty) ghost all sit in one card with a single `divide-y divide-[#F3F4F6]` and uniform `py-4` rows. There is one global rhythm, not relationship-driven spacing.
**Why it matters vs rubric:** M12 wants tight-within-cluster, wide-between-section spacing. Here every gap is identical, so the "this week vs last week vs 2 weeks ago" relationship is invisible — the screenshot shows "This week / Last week / 2 weeks ago" but they're spaced identically to each other.
**Fix (M12):** Separate "This week" (the hero/most recent) from the archive with deliberate whitespace; keep the archive rows tight. Let the rhythm tell the recency story.
**File:** `apps/web/src/components/digests/DigestList.tsx:140` (`divide-y`).

### 9. Win-count + reviewed pill crowd the right edge; metadata competes with the verdict
**Problem:** Each row crams date / headline / 3 delta pills / "4 wins" / "2 reviewed" violet pill / chevron into one non-wrapping flex row. With the headline truncated to nothing, the row's visual weight is dominated by metadata chips, not content.
**Why it matters:** Profound's rows keep the primary label dominant and push secondary metrics into aligned columns with clear headers. Beamix has no column headers and the metadata out-shouts the (truncated) verdict.
**Fix (M7, M2):** Once the headline is legible (#1), demote the metadata: the violet "reviewed" pill and "4 wins" are TIER-3 metadata and should be quieter / right-aligned in a fixed column, not competing at row-center.
**File:** `apps/web/src/components/digests/DigestRow.tsx:48-122`.

---

## P3 — nice-to-have

### 10. "3 digests" count and search toolbar feel like raw chrome, not designed
The `{n} digest{s}` count (DigestList.tsx:126) is correct mono/tabular but floats alone; pair it with an eyebrow ("YOUR RECORD") on a hairline (M12) so the toolbar reads intentional rather than a default search bar.

### 11. Search input is a generic 8px-tall rounded box
`DigestList.tsx:111-123` — the search field is fine but unremarkable. With only 3 digests it is arguably premature; consider hiding search until N>6 so the empty-ish populated state doesn't lead with a search box over 3 rows (a Profound-grade screen earns its search by data volume).

### 12. Date stamp `weekRelative` ("This week"/"Last week") is in Geist Mono
`DigestRow.tsx:80-82` renders "This week" in `font-mono` — mono is for *numbers/truth* (M11), and "This week" is prose. Use Inter for the relative label; keep mono for dates/counts only. Minor M11 leak.

---

## Per-state notes

**Populated (populated-desktop.png):** The dominant impression is a flat directory with a large empty right half. Truncated headlines (#1) make the rows near-meaningless. Delta pills (#5) and the violet "reviewed" pill render correctly color-wise (violet text on violet tint is on-brand, blue=you/violet=agents respected — the reviewed pill is agent work, correctly violet). The blue active-nav "Weekly Digest" in the sidebar is correct. No TIER-1 focal (#2), no sparkline, no serif beat (#6). The page does not yet read as a "confident editorial briefing" — it reads as an un-styled list page.

**Empty (empty-desktop.png):** As rendered above the fold, this is the most broken-looking state — a 30-40% opacity ghost of em-dashes and grey bars that is indistinguishable from a failed/stuck load (#4). The designed "Sunday promise" copy exists in the component but is pushed entirely below the fold by the oversized ghost. A first-time user landing here would reasonably think the app is broken. This must be inverted so the warm promise leads.

**Mobile / loading / error / panel-open:** NOT captured. The code shows a mobile accordion (DigestList.tsx:151-160), a loading skeleton (page.tsx:48 / DigestSkeleton), an error state (DigestError), and a desktop slide-over (DigestPanel) — none were screenshotted, so their rendered craft is **unverified**. A complete audit needs `populated-mobile-375`, `loading`, `error`, and `panel-open` captures. The `/digests/[digestId]` detail page (where the full hero/sparkline/Fraunces/customer-note contract lives) was also never captured and is entirely unaudited.

---

## Bottom line for the polisher
The fastest path to the bar: (1) stop truncating the verdict, (2) give the page a real `[1fr_rail]` split to kill the dead gutter, (3) promote the most-recent week to a TIER-1 hero with the 64px mono delta + one Fraunces beat + the micro-sparkline, and (4) invert the empty state so the warm Sunday promise leads instead of the ghost. Those four moves convert this from "AI-generated list page" to "confident weekly briefing." The detail page and the four uncaptured states still need their own screenshot pass before any PASS.
