---
page_route: /shopping
states_audited:
  - populated-desktop.png  (ONLY state captured; viewport-cut above the signature moment)
states_missing:
  - empty-desktop (no screenshot)
  - error (no screenshot)
  - loading/skeleton (no screenshot)
  - populated-mobile (no screenshot)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.38.57 AM.png  (Answer Engine Insights dashboard — has its own "Shopping" nav item; the direct analog)
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png  (110-prompts data table w/ visibility/position/citation columns)
  - Profound-Screenshot 2026-06-12 at 10.38.10 AM.png  (onboarding split — depth/rhythm reference)
  - otterly-Screenshot 2026-06-12 at 10.44.39 AM.png  (Brand Ranking table panel)
verdict: NEEDS_WORK
auditor: design-critic
date: 2026-06-12
note: Dev server was down during audit; visual findings are from the single captured screenshot + source read. Coverage is incomplete — see P1-1.
---

# shopping — UI Excellence Audit

## Screenshots

- [populated-desktop.png](./screenshots/shopping/populated-desktop.png) — the ONLY captured state. It is cut at the viewport: it shows the page header, the TIER-1 hero, and the first ~2 rows of the SKU table. The Attribute-Accuracy matrix (the component's own stated "signature moment"), the Shopper-sentiment panel, and the rest of the SKU table are below the fold and were NOT captured. No empty/error/loading/mobile screenshots exist.

## Verdict

**NEEDS_WORK** — but mostly on *audit coverage*, not on craft. From the visible evidence and a full source read, this is a genuinely strong, brand-disciplined build: it sits credibly beside the Profound "Answer Engine Insights" bar. The blue=you / violet=agents law is executed *spatially* (matrix data is neutral, the "Correct this →" fix-route is a violet ghost that is never a button — `AgentRoute.tsx`), depth tiers are real (`card-console-hero` / `card-console` / `card-inset`), the type contract is visibly stepped (64px mono blue figure → 30px display verdict → 12px eyebrows), there is no N-equal card grid, every number is Geist Mono tabular-nums, and all four states are actually designed in source. This is well above "vibe-coded." It is held back from PASS by: (1) only one partial state was captured, so the signature moment is unverified on screen; (2) a handful of real polish gaps in the one region we *can* see — an orphaned "AI" in the hero verdict, a thin/lonely sparkline rail, and a hero "depth tier" that reads nearly flat against the SKU card next to it.

---

## P1 — must fix (looks AI / broken)

**P1-1 · The signature moment was never screenshotted — audit is not closeable on visual evidence.**
The single capture (`populated-desktop.png`) is viewport-cut just below the second SKU row. The Attribute-Accuracy matrix — which the code itself names "THE SIGNATURE MOMENT" (`AttributeAccuracyMatrix.tsx:9`) and is the entire blue-vs-violet payoff of this page — plus the sentiment panel and the rest of the table are below the fold and unverified. The empty, error, loading, and mobile states (all of which exist in source: `ShoppingWorkbench.tsx:154-208`) were also never captured. A craft verdict on the most important region of the page cannot be issued from this. **Fix:** re-capture with `fullPage: true` at 1440, plus `?state=empty`, `?state=error`, `?state=loading`, and a 375px mobile shot. This is the gating blocker — not a code defect, an evidence defect.

**P1-2 · Hero verdict line orphans a single word ("AI") onto its own line.**
In the render the verdict reads "Your shop shows up *Often* when shoppers ask / AI" — the two-letter word "AI" drops alone to line 2 at the 520px max-width. A lone two-letter orphan under a 30px display headline reads unfinished and is the kind of typographic accident that signals "nobody looked at this rendered." `ShoppingHero.tsx:123-129`. **Fix (M2/M12):** bind the last words with a non-breaking space ("ask&nbsp;AI") or tune `max-w-[520px]` so the verdict breaks on a clause, not on a fragment. Verify against the live render, not the source.

---

## P2 — substantive

**P2-1 · The hero's "TIER-1" depth does not read as a tier above the SKU table in the render (tell #1).**
The hero uses `card-console-hero` with a `linear-gradient(135deg, #FFFFFF → surface-warm)` (`ShoppingHero.tsx:76-79`), but at arm's length in the screenshot the hero and the SKU-visibility card look like the same surface at the same elevation — the gradient is so subtle it's invisible and the shadow step is not legible. M1 demands three *felt* tiers; here TIER-1 and TIER-2 read as one. **Fix (M1):** make the hero shadow step obvious (`--shadow-card-hero` must be a visibly deeper/wider diffusion than `--shadow-card`), and/or warm the gradient end-stop enough to register. The eye should land on the hero *first* without being told to.

**P2-2 · The hero right rail (sparkline + "LAST 5 WEEKS" + "49% → 58%") is thin and lonely in its 220px column.**
A single 160×48px green polyline floating in a 220px rail with large dead space above and below reads under-designed next to the dense, confident right-hand panels in the Profound dashboard ref (the "Visibility Score Rank" asset list with rows + deltas). It is the page's one shot at a second data texture and it's nearly empty. `ShoppingHero.tsx:147-160`. **Fix (M4/M12):** give the rail more to say — e.g. a small stacked "best / worst SKU this week" pair or a 2-row mini-ledger under the sparkline — or tighten the rail width so the sparkline isn't adrift. Right now it's whitespace masquerading as composition.

**P2-3 · The green hero sparkline color collides with the green delta chip and the green sentiment series — green is doing three unrelated jobs.**
The hero sparkline renders green (it inherits the score-band-good color for a 58% "good" score), the "+4pp" delta chip is `status-positive` green, and the sentiment "positive" segment is `#10B981` green. Three different semantics (trend line / period delta / sentiment) all read as the same green at a glance, muddying the data language. **Fix (data-viz discipline):** the hero trend line is structural visibility, not "positive sentiment" — consider rendering the hero sparkline in the blue accent (it is *your* metric, blue=you) so it doesn't read as a "good = green" judgment, and reserve green for true positive-state semantics. Confirm against the score-band rule in `score-band.ts` so you don't break the dashboard's shared band language.

**P2-4 · SKU table "Trend" column sparklines are derived, not real, and that derivation is fragile.**
`SkuVisibilityTable.tsx:45` builds the trend shape from `Math.max(0, 100 - p * 6)` over a position trend. Any position ≥ 17 floors the whole series to 0 and the sparkline becomes a flat baseline that *looks like* "no data" — but it's actually masking real (bad) data. The rubric's M4 says flat baseline = null/no-data ONLY; a real-but-bad SKU should not look identical to an unmeasured one. **Fix (M4):** clamp/scale so a poor-but-measured position still draws a low line distinct from the null baseline, or pass a real visibility-over-time series from the fixture.

**P2-5 · Mobile composition is unverified and the matrix is a known risk.**
The Attribute-Accuracy matrix is a `min-w-[640px]` grid inside `overflow-x-auto` (`AttributeAccuracyMatrix.tsx:134-138`) with a sticky 200px label column. On a 375px viewport this forces horizontal scroll inside the card — acceptable IF the sticky column and the card padding behave, but it is exactly the kind of thing that clips or double-scrolls. The scope rail also drops below the content on mobile (the `[1fr_280px]` collapses) — its position in the stack is unverified. **Fix:** capture 375px and confirm no page-level horizontal scroll, the sticky SKU column holds, and the rail lands somewhere sensible (likely should move *above* the table on mobile, or become a collapsible filter bar).

---

## P3 — nice-to-have

**P3-1 · Workspace switcher label is clipped at the sidebar foot.**
The bottom-left shows "y workspace" — the avatar + workspace name is truncated/cut. Likely a shared layout (`AppSidebar`/console shell), not this page, but it's in-frame on every shopping screenshot. Worth a one-line fix in the shell so the workspace name doesn't read as broken text.

**P3-2 · Hero metric toggle (Visibility | Revenue) is quiet to the point of near-invisible.**
The segmented toggle at `ShoppingHero.tsx:91-112` is correctly *not* the focal, but in the render its low contrast (`#F3F4F6` ground, 11px) makes it easy to miss that the hero is interactive at all. A hair more contrast on the inactive label or a 1px container hairline would signal affordance without stealing focus.

**P3-3 · "Reset filters" link in the scope rail has no disabled/empty affordance.**
When no filter is changed, "Reset filters" (`ShoppingScopeRail.tsx:149-156`) still reads as an active link. Minor: dim or hide it when filters are already at default so it doesn't imply pending state.

**P3-4 · Entrance choreography unverifiable from a static shot.**
`craft-enter` stagger classes are applied (`ShoppingWorkbench.tsx:104,131`), which is correct per M9, but a single screenshot can't confirm the fade-up actually fires or that `prefers-reduced-motion` is honored. Verify in a live capture.

---

## Per-state notes

**Populated (desktop) — partial:** Strong. Hero reads confident; the 64px blue mono figure is the unambiguous STEP-1 focal; the verdict + Fraunces beat is present (renders as a serif italic via the Georgia fallback even if the Fraunces webfont is mid-load, so M5 is intact). The SKU table is correctly a *weighted* table (worst SKU gets the left critical hairline, `SkuVisibilityTable.tsx:90-95`), not an AI N-equal card grid. The scope rail is a proper TIER-3 inset. Held back only by P1-2 (orphan), P2-1 (flat tier), P2-2/2-3 (thin/green-collision rail). The signature matrix below it is unseen — see P1-1.

**Empty — not captured, but well-designed in source:** `ShoppingWorkbench.tsx:154-182` has a titled context + a two-tier CTA (blue "Connect catalog" pill primary + quiet "See sample (Bright Smile)" secondary) + a warm `scan` illustration. This is M8-compliant on paper. Must still be screenshotted to confirm it isn't a bare centered icon in practice and that the warm surface reads.

**Error — not captured, but designed in source:** `ShoppingWorkbench.tsx:186-206` names a real recovery ("Retry scan") plus a secondary "Check catalog connection" link, and the copy reassures ("Your data is safe"). M8 error rule satisfied in source. Verify on screen.

**Loading — not captured:** `ShoppingSkeleton` is wired (`ShoppingWorkbench.tsx:220`). Unverified — confirm it mirrors the real layout's shape (skeleton should match the hero + table + rail footprint, not generic blocks).

**Mobile — not captured:** Highest residual risk is the `min-w-[640px]` matrix and the rail-collapse order. See P2-5.
