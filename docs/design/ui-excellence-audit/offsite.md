---
page: /offsite (Off-Site Manager)
route: /offsite
states_audited:
  - populated-desktop.png  (idle, Citations tab, populated table)
states_NOT_captured:
  - empty-desktop, loading, error, success, mobile-375  (NONE provided — only one screenshot exists)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.37.47 AM.png  (editorial hero + glanceable rank rail)
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png  (dense "110 prompts" data table — the bar for a metrics table)
  - Profound-Screenshot 2026-06-12 at 10.38.02 AM.png  (left-aligned verdict hero + side panel)
  - otterly-Screenshot 2026-06-12 at 10.44.39 AM.png  (Brand Ranking table panel + asymmetric split)
verdict: NEEDS_WORK
---

# offsite — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/offsite/populated-desktop.png) — the ONLY captured state (idle, Citations tab)

## Verdict
**NEEDS_WORK** — bordering CRITICAL on coverage. The page has the right bones (Console Spine, a real type contract, a serif beat, an in-cell importance bar, a hero figure) and avoids the worst AI tells (no N-equal card grid, depth is staged, blue/violet roles are honored). But against Profound's dense, confident data table it reads thin and unfinished: a stranded micro-sparkline that looks like a stray pen stroke, a half-empty canvas with a vast dead zone below the table, a two-system Score/Status column that fights itself, and a brand-law violation (the data bar is painted in the `#3370FF` ACTION accent). Most damning for an audit: **only one of the page's six states was captured** — the empty/loading/error/success/mobile states (which is where this surface lives, per its own demo controls) are entirely unverified, so a PASS is impossible.

---

## P1 — must fix (looks AI / broken)

1. **The hero micro-sparkline renders as a stranded diagonal pen-stroke, not a signal (M4 broken).**
   In the screenshot, under the `62` figure there is a thin green line floating to the lower-left of "COVERAGE SCORE" with no baseline, no anchor, and no relationship to the number. It reads like a stray mark or a rendering glitch, not the engine sparkline. Profound's hero (`Profound-...10.38.02`) makes its trend unmistakable — a labelled `65% +5%` with a real line chart. Here the signature detail actively *lowers* perceived craft.
   - Why it reads broken: detail #4 (signature) is present in code but visually fails; it looks like a defect.
   - Fix (M4): give the sparkline a visible 1px `#E5E7EB` baseline, size it to ~64px wide / 24px tall, and right-align it directly under the `62` so the figure→spark→label form one vertical cluster. Score band is 62 = "Good" → line should be `#10B981` only if that is the score-band color; confirm it is not accidentally green-on-no-baseline. `ContextStat.tsx:42-47` + `EngineMicroSparkline`.

2. **Data viz is painted in the `#3370FF` ACTION accent — brand-law violation.**
   `ImportanceBar` fills the score bar with `#3370FF` for any value ≥ 75 (`OffsiteTabs.tsx:117`). BRAND_GUIDELINES + DESIGN-VISION are explicit: `#3370FF` is the ONLY action/CTA color and **must not be used for data visualization** ("Using `#3370FF` for data visualization" is a named anti-pattern). The blue bars on rows 91/78/88 collide visually with the blue "Off-Site" active nav and blue links — the you-vs-data signal blurs.
   - Why it reads AI/broken: blue/violet stop being spatial (tell #8); accent is sprayed as decoration.
   - Fix: use the data-viz series tokens, not the accent. Score-band coloring (`#06B6D4`/`#10B981`/`#F59E0B`/`#EF4444`) or a neutral `data` ramp is correct here; reserve `#3370FF` for the Track action + active nav only. `OffsiteTabs.tsx:115-119`.

3. **Half the canvas is dead space — the page floats in a centered 880px column with a vast empty lower-right void.**
   The content stops at the table (~y=800) and at ~x=1255, leaving roughly the entire right third and lower third of the 1440 viewport empty white. Profound and Otterly both fill the working canvas — Profound's table runs full-width with 6 metric columns; Otterly uses a deliberate asymmetric split with a populated side panel. Beamix's `max-w-[880px] mx-auto` (`ToolPage.tsx:79`) centered inside a 240px-nav shell produces an awkward off-center slab with big idle gutters, not intentional macro-whitespace.
   - Why it reads unfinished: dead-center-ish symmetry with unexplained voids (tell #5); the eye has nothing to rest on below the fold.
   - Fix (M3/M10): either widen the working column for table-dense tabs (a table this sparse does not need an 880px cap), or earn the lower space with the progressive-disclosure spine (recent off-site activity, a coverage-by-channel strip, last-run summary). Do not ship a screen that is 50% empty white.

4. **The Score column runs TWO visual systems side by side — a filled pill badge AND an outline ghost button — in the same column.**
   Tracked rows show a green "✓ Tracked" pill; untracked rows show a "+ Track" outline button (`OffsiteTabs.tsx:280-292`). Stacked vertically they create a jagged, mismatched column where some rows have solid green chips and others have hollow grey-bordered buttons of a different height/weight. It looks like two components were dropped in without reconciling.
   - Why it reads AI: evenly-weighted-but-inconsistent (tell #3); no single status language.
   - Fix: unify the column. Either (a) status is always a pill (Tracked/Untracked-as-quiet-neutral-pill) with Track as a row-hover affordance, or (b) Track is always a consistent ghost button that becomes a checkmark in place. Align baselines and pill/button heights to a single 24px chip. `OffsiteTabs.tsx:278-293`.

5. **The DEMO STATES dev toolbar is rendered inside the page chrome (idle/loading/empty/error/success pills, bottom of the card).**
   Gated by `NODE_ENV === 'development'` (`OffsiteTabs.tsx:792`) so it won't ship — but it IS in the captured render, sitting on a dashed hairline at the bottom of the cockpit and reading as an unfinished debug strip. (This is NOT the ignorable Next dev "N" badge — it is page-level UI.) For the audit it matters because it visually terminates the table on a debug artifact instead of a designed footer/empty-tail.
   - Fix: capture audit screenshots from a prod/preview build (per CRAFT-SYSTEM blocker note, screenshot prod or `next dev` w/o turbopack) so the real terminal state of the table is seen, and confirm the table's bottom edge has an intentional rest (count summary / "8 sources" footer), not a void.

6. **AUDIT COVERAGE GAP — five of six states are unverified, and this surface is state-heavy.**
   The page ships its own idle/loading/empty/error/success demo switch, meaning the design intent is that empty (M8 two-tier recovery), loading (skeleton), error (named recovery), success (TIER-1 hero output), and mobile are first-class. Only `idle/populated/desktop` was captured. The empty states call `EmptyState` with `align="top"` + two-tier CTA (good in code) but were never rendered; the success path uses `card-console-hero` (TIER-1) but is unseen; mobile collapse of a 4-column `grid-cols-[1fr_140px_80px_100px]` (`OffsiteTabs.tsx:215,240`) at 375px is a high overflow risk and is completely unverified.
   - Fix: capture populated-desktop, empty-desktop, loading, error, success, AND mobile-375 before any PASS. The fixed-px grid columns must be checked at 375px — `1fr_140px_80px_100px` = 320px of fixed columns + gaps will almost certainly overflow a 343px content width.

---

## P2 — substantive

7. **Redundant identity: the eyebrow names the business, then the input panel re-states it as a target.**
   Zone 1 eyebrow = "BRIGHT SMILE DENTAL · RAMAT GAN" (`page.tsx:28`); the Directories/Entities input panel then shows a "Target business" field with `brightsmile-dental.co.il` + "Ramat Gan, Israel" (`OffsiteTabs.tsx:531-541`). Same entity, said twice, in two registers. On Citations (the captured tab) there is no input panel at all, so the eyebrow is the only identity — fine — but across tabs it double-prints.
   - Fix: the target business is a page-level fact; show it once in Zone 1. In agent tabs, replace the redundant "Target business" block with the agent-specific input only.

8. **The SerifVerdict line + the tab cockpit live in one undifferentiated bordered card — the M5 beat has no editorial moment.**
   "Your off-site presence is *growing* — 9 sources tracked across 5 channels" sits at the top of the same `.card-console` that contains the tabs (`OffsiteTabs.tsx:727`). The single Fraunces word "growing" is present (M5 satisfied technically) but it is buried as a caption above tab chrome rather than given air. Profound's hero verdict ("Beamix's AI visibility is below industry benchmarks") commands the composition.
   - Fix (M2/M12): lift the verdict sentence out of the card onto its own hairline-separated band with more space above the tabs; tighten the gap between it and the tabs (M12 rhythm: related-tight, unrelated-wide). Consider raising the verdict to STEP-2 weight if it is the screen's headline insight.

9. **The big `62` and "COVERAGE SCORE" carry no trend or context — the one number the page is about is static.**
   Profound pairs every figure with a delta (`+8.6%`, `+5%`). Beamix shows `62` with a broken spark and no `+/-`, no "/100", no "vs last cycle". The hero figure does not tell the user whether 62 is good, rising, or in trouble.
   - Fix (M7/M11): add a mono delta chip beside or under `62` (`+4 this cycle`) in the band color, and a `/ 100` denominator in muted mono so the figure reads as a score, not a bare integer. Fix the sparkline (P1.1) so the trend is legible.

10. **Importance/Score column header says "SCORE" but the data is "importance" — mismatched vocabulary.**
    Header renders "SCORE" (`OffsiteTabs.tsx:223`) while the cell is an `ImportanceBar` with `aria-label="Importance {value}"` (`OffsiteTabs.tsx:125`). Two names for one column. Users (and screen readers) get conflicting labels.
    - Fix: pick one term (likely "Importance" or "Authority" for a citation source) and use it in the header, the cell, and the aria-label.

11. **Row entrance stagger is capped at 8 but tables can be longer — late rows get no choreography, and reduced-motion needs verifying.**
    `craft-enter-${Math.min(i+1,8)}` (`OffsiteTabs.tsx:242`) means rows 9+ share the row-8 delay (acceptable) but the whole-table fade-up on every tab switch could feel busy. M9 wants ~40ms priority stagger behind `prefers-reduced-motion`.
    - Fix: confirm `.craft-enter` has a `prefers-reduced-motion: reduce` static fallback (cannot verify from this single static screenshot); ensure tab-switch does not re-run the full stagger on every click (only first paint).

---

## P3 — nice-to-have

12. **Domain column uses Geist Mono with `tabular-nums` (`OffsiteTabs.tsx:264`) on a string (`denta.co.il`).** `tabular-nums` is a no-op on alpha domains and slightly widens any digits inconsistently. Mono is fine for a domain (truthy/technical), but drop `tabular-nums` there — reserve it for actual figures (M11).

13. **The `ExternalLink` icon on domain hover is `#D1D5DB` opacity-0→100 (`OffsiteTabs.tsx:267-269`)** — at that tint it is nearly invisible even on hover. Bump to `#9CA3AF` so the affordance is felt.

14. **Row hover ground is `#F4F6FA` (M7-correct) but there is no left status-color hairline** that M7 specifies ("row hover ground + left status-color hairline"). Add a 2px left accent in the row's status color on hover to complete the move.

15. **Tab badge for running uses violet `#6E56F0` dot (`OffsiteTabs.tsx:752`)** — correct (agent activity = violet, never a button). Good; preserve this. Just ensure it is not the only at-arm's-length violet signal — the agent tabs (Directories/Entities/Reputation/Community) could carry a faint `--color-agent-tint` ground on their *panels* (M6) so the agent zone reads different from the read-only Citations tab.

---

## Per-state notes

**Populated / desktop (Citations tab) — the only captured state:**
- 8 rows render cleanly; type contract is visibly stepped (64px mono `62` → 30px InterDisplay title → 12px uppercase eyebrow → 13–15px body). M2 largely working.
- Importance bars: 91/78 filled blue (brand violation, P1.2); 71/68/64/52/60 in neutral grey — the grey ones read fine and actually look more correct than the blue.
- Score/Status column is the jagged two-system column (P1.4).
- Below the table: dead canvas + dev debug strip (P1.3, P1.5).

**Empty — NOT captured.** Code path exists (`CitationTable` isEmpty → `EmptyState illustration="workspace" align="top"` + "Run first scan" primary + "Run a scan first →" quiet secondary, `OffsiteTabs.tsx:193-207, 626-653`). Looks M8-compliant in source (two-tier, titled, top-aligned not bare-center) but UNVERIFIED. Must render: the `EmptyState` warm glyph + alignment + that the secondary link is visually quiet, not a second button.

**Loading — NOT captured.** Skeleton path exists (`OffsiteTabs.tsx:166-179`) with sized skeleton rows matching the column rhythm — good intent, unverified.

**Error — NOT captured.** `ErrorState` with a named recovery ("Try again — it usually clears right up." / "Agent run failed… Check your connection and try again.") — M8-compliant copy in source, unverified render.

**Success — NOT captured.** `OutputSummaryPanel` in a `card-console-hero` (TIER-1) — this is the one place a second TIER-1 could collide with the Zone-1 header; needs visual check that there is still exactly ONE dominant focal (M1: "never two hero cards"). UNVERIFIED and a real risk.

**Mobile-375 — NOT captured.** HIGH RISK: the table grid is `grid-cols-[1fr_140px_80px_100px]` with `gap-4` = ~320px fixed + 48px gaps before the flexible Source column gets anything. At a 343px content width this overflows. No responsive variant of the grid is visible in source. Must capture and almost certainly must add a stacked/card mobile layout.
