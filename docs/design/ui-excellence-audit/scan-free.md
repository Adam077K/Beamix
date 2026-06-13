---
page: scan-free
route: /scan-free  (rendered as /scan/[scan_id], e.g. /scan/00000000-0000-4000-8000-00000000d3a0)
states_audited:
  - populated-desktop.png   # ONLY state captured
states_missing:
  - empty / no-issues state (NOT captured)
  - pending / scanning state (NOT captured — ScanPendingState)
  - failed state (NOT captured — FailedSection)
  - mobile 375px (NOT captured)
  - v2 measurement view (NOT captured — ScanV2View)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.37.47 AM.png   # asymmetric split, ranking list with logos
  - Profound-Screenshot 2026-06-12 at 10.38.02 AM.png   # brand-visibility line chart + running-prompts panel
  - Profound-Screenshot 2026-06-12 at 10.38.16 AM.png   # topic-select asymmetric split + tips rail
  - otterly-Screenshot 2026-06-12 at 10.44.17 AM.png    # onboarding split with skeleton dashboard rail
  - otterly-Screenshot 2026-06-12 at 10.44.48 AM.png    # brand-ranking table with logos + numbered rank
source: apps/web/src/app/scan/[scan_id]/page.tsx (+ _components/ScanScoreHero.tsx, EngineBand.tsx, IssueLedger.tsx)
verdict: NEEDS_WORK
---

# scan-free — UI Excellence Audit

## Screenshots
- [populated-desktop.png](./screenshots/scan-free/populated-desktop.png) — the only state captured

> Audit limitation: only `populated-desktop.png` was provided. The empty/no-issues, pending (`ScanPendingState`), failed (`FailedSection`), mobile-375, and v2 (`ScanV2View`) states were NOT rendered, so they are graded from source only and flagged as unverified. A full pass needs those captures.

## Verdict
**NEEDS_WORK.** The page is competent and on-brand — correct accent discipline, real Geist-Mono numerals, the Fraunces beat on "Good", a genuine TIER-1 hero ring, and clean copy. It is NOT broken and not a clone. But against the Profound/Otterly bar it reads thin and templated: the whole page is one narrow centered single-column stack at `max-w-3xl` with a uniform global `space-y-8`, the engine breakdown is the canonical AI 3-equal-cell grid, and three of the four surfaces share the exact same `card-console` depth so hierarchy is told, not felt. Competitors fill the frame with confident asymmetry, real data viz (line charts, logo'd ranking tables), and generous editorial whitespace. Beamix's page currently occupies the center third of a 1440 viewport with large dead margins. The gap is craft density and spatial confidence, not correctness.

---

## P1 — must fix (looks AI / broken)

### 1. Whole page is a narrow centered single-column stack — dead-center symmetry + huge dead margins (tell #5, fails M3/M10)
`page.tsx:303` wraps everything in `mx-auto max-w-3xl ... px-6 py-12`. On the 1440 desktop render the entire experience lives in the center ~720px, leaving two wide empty grey gutters. Every competitor ref (Profound 10.37.47, 10.38.02, Otterly 10.44.48) uses a confident **asymmetric split** — a dominant content column plus a data/visualization rail that fills the frame. Beamix looks like a mobile layout stretched onto a desktop. **Fix (M3):** above `lg`, move to a `grid-cols-[1fr_minmax(380px,420px)]` (or `[minmax(0,1fr)_360px]`) layout — hero + issues in the dominant column, a persistent rail (engine breakdown promoted to a sparkline panel, the discovery CTA pinned, or a "what happens next" card) in the narrower rail. Keep the single column only below `lg`. file: `page.tsx:303`.

### 2. EngineBand is a literal 3-equal-cell grid of identical cells (tell #2, the canonical AI layout; fails M3/M4)
`EngineBand.tsx:63` renders `flex divide-x` of three equal `flex-1` cells (ChatGPT 71 / Gemini 64 / Perplexity 78), each identical in weight, with no per-engine differentiation, no logos, no sparkline, no ranking context. This is the single most "AI-generated" element on the page. Otterly (10.44.48) and Profound (10.37.47) both show ranked, logo'd, visually-weighted engine/brand lists — the worst performer is visible at a glance. **Fix:** (a) M4 — add the engine **micro-sparkline** (24px-tall ~64px SVG polyline of last ~5 points in the score-band color; flat `#E5E7EB` baseline when null, never fake data) to each cell; (b) M3 — weight the cells: make the lowest-scoring engine (Gemini 64 here) the wider TIER-2 focus and the others recede, OR sort worst-first and add a one-line "where you're weakest" label so the band carries meaning, not just three tied numbers; (c) add the engine logo/glyph for recognition. file: `EngineBand.tsx:57-89`.

### 3. Uniform depth — EngineBand and IssueLedger share the identical `card-console` surface; only the hero differs (tell #1, fails M1)
The render shows three stacked white rounded rectangles below the hero, all the same elevation and radius. `EngineBand.tsx:59` and `IssueLedger.tsx:64` both use bare `card-console`; the hero uses `card-console-hero`. That is only TWO felt tiers, and the two secondary surfaces are indistinguishable — hierarchy is told (by order) not felt (by depth). **Fix (M1):** introduce the third tier. Demote the EngineBand (or whichever surface is moved to the rail) to `.card-inset` (transparent/surface-warm ground, 1px border, NO shadow) so it recedes, and keep ONE TIER-2 `--shadow-card` surface as the secondary focal (the IssueLedger, since the issues are the evidence that drives the CTA). Three felt tiers, one hero. files: `EngineBand.tsx:59`, `IssueLedger.tsx:64`.

### 4. Type contract leaks — verdict headline is 26px not the M2-required 30px, and the hero figure/verdict gap is not stepped enough (fails M2)
`ScanScoreHero.tsx:166` sets the verdict headline to `text-[26px]`. The rubric M2 STEP-2 explicitly says "verdict 30px InterDisplay-Medium -0.02em (raise from 26px)" and the dashboard exemplar already raised it. The headline in the render reads as merely "a bit bigger than body," not as a commanding STEP-2 register beneath the 64px STEP-1 figure. Tracking is `-0.01em` where M2 wants `-0.02em`. **Fix (M2):** raise to `text-[30px] tracking-[-0.02em]` to match the locked contract and the dashboard so the two pages sit as one hand. file: `ScanScoreHero.tsx:164-167`.

---

## P2 — substantive

### 5. One global `space-y-8` between every surface — no editorial rhythm (fails M12)
`page.tsx:303` applies a single uniform `space-y-8` (32px) to the entire stack: identity → hero → engines → issues → CTA → footnote all separated by the same gap. Real editorial layouts vary whitespace by relationship — tight within a cluster, wide between acts. The CTA dark panel especially should have a larger air gap before it (it is an "act separator" per the source comment) but currently sits 32px from the issues like everything else. **Fix (M12):** replace the global `space-y-8` with relationship-driven gaps — e.g. identity→hero 24px, hero→engines 40px, engines→issues 24px (they are one evidence cluster), issues→CTA 56–64px (act break), CTA→footnote 24px. file: `page.tsx:303`.

### 6. No signature detail anywhere (tell #4, fails M4)
Nothing on this page is something a generic template wouldn't have: a ring, three stat cells, a list of rows. The rubric's signature move is the engine micro-sparkline (M4) — it is entirely absent. Without it the page has no fingerprint. **Fix:** ship the M4 sparkline in the EngineBand (see P1 #2) — it is the one detail that makes the data surface unmistakably Beamix and ties this page to the dashboard exemplar. file: `EngineBand.tsx`.

### 7. Score band uses green for a 71 ("Good") — borderline against brand score scale, and ring color logic should be re-verified
`ScanScoreHero.tsx` + `ring-math` band a 71 as `--color-data-4` green via `verdictWord` (`score >= 50 → Good`). The brand score scale (BRAND_GUIDELINES score colors) bands 50–74 as Good `#10B981` green and 75–100 Excellent cyan, so 71→green is internally consistent. Flagging only to confirm the ring, the verdict word color, and the EngineBand cell colors all read from the SAME band function — in the render the ring is green, "Good" is green, but the per-engine 78 (Perplexity) should be cyan (≥75) while 71/64 are green; verify the EngineBand `scoreColor` (`EngineBand.tsx:28`) and the hero `ringColor` never diverge for the same number. Not broken in this render, but it is a latent inconsistency surface. file: `EngineBand.tsx:28-33`, `ScanScoreHero.tsx:97`.

### 8. IssueLedger rows are flat and undifferentiated — no in-cell data shading, no row hover, no severity hairline (fails M7)
`IssueLedger.tsx:80-97` renders each row as `label left + tinted count pill right`, all rows visually equal. There is no left status-color hairline, no row-hover ground (`#F4F6FA`), and the count is a small pill rather than a dominant figure. The "2" critical / "1" minor rows look the same weight as each other despite different severities. **Fix (M7):** add a 2px left status-color hairline per row keyed to severity, give the count more typographic dominance (mono, larger), and add a row-hover ground so the ledger feels like a real data surface rather than a styled `<ul>`. file: `IssueLedger.tsx:81-95`.

### 9. Hero is the only motion; entrance choreography absent for the rest (fails M9)
`ScanScoreHero.tsx` correctly animates the ring sweep + count-up (the sanctioned free-scan reveal) with a reduced-motion guard — good. But the engine band, issue ledger, and CTA pop in with zero choreography. M9 wants the surfaces to fade-up 8px in priority order (~40ms stagger, ≤200ms ease-out, behind `prefers-reduced-motion`). **Fix (M9):** add the additive fade-up keyframe to the secondary surfaces so the page resolves in priority order after the ring lands. file: `page.tsx:314-344`.

### 10. Identity line is muted and lost above the hero (fails M2/M12)
`page.tsx:305` / `IdentityLine` renders "Results for Bright Smile Dental · brightsmile-dental.co.il" in small muted text floating above the hero with a 32px gap. It reads as a stray caption, not a designed eyebrow. Competitors (Otterly 10.44.17, Profound 10.37.47) anchor the brand identity with a logo/favicon + confident treatment. **Fix:** either pull the identity INTO the hero card as a proper STEP-3 eyebrow on a hairline (M12), or add the business favicon + tighten the gap so it reads as a header, not orphaned text. file: `page.tsx:305`, `page.tsx:180-189`.

---

## P3 — nice-to-have

### 11. Header CTA and footnote could carry more finish
The sticky header (`page.tsx:163`) is a bare wordmark + blue pill on a hairline — fine, but the wordmark is `font-semibold tracking-tight` generic; consider the logo mark for brand recognition. The footnote (`page.tsx:262`) "Scan completed · Results expire in 30 days · ID: 00000000…" is good mono-truth (M11) but sits centered and disconnected; tie it to a hairline above for rhythm.

### 12. CTA dark panel headline could take the Fraunces beat or a stronger figure
`CtaBlock` (`page.tsx:239`) "We fix all 4 issues for you — end-to-end." is on a dark panel where Fraunces is sanctioned. The "4" is the emotional hook from the scan but is rendered inline in the sans headline. Consider making the issue count a mono figure or the act-verb a Fraunces beat to give the closer a second editorial moment (rubric allows Fraunces on dark panels). file: `page.tsx:239-243`.

### 13. Verify CTA pill on dark panel meets contrast + the "/100" disabled color is legible
`ScanScoreHero.tsx:153` renders "/ 100" in `text-text-disabled` — confirm it clears 4.5:1 on the warm-white-to-white gradient. On the dark CTA panel the `#6B7280` "No credit card" line (`page.tsx:254`) on `--color-panel-dark` is likely under 4.5:1 — verify and bump to `#9CA3AF` if it fails. files: `ScanScoreHero.tsx:153`, `page.tsx:254`.

---

## Per-state notes

### populated-desktop (captured)
- Layout occupies center ~720px of a 1440 viewport — large dead grey gutters L/R (P1 #1).
- Hero: ring + 64px mono figure + "Good" Fraunces beat + verdict — the strongest, most on-brand element. TIER-1 reads correctly.
- EngineBand: three tied equal cells, no sparkline, no logos (P1 #2) — the most templated element.
- IssueLedger: flat rows, tinted count pills (2/1/1), no row hierarchy (P2 #8).
- CTA dark panel: clean, correct, but no extra air before it (P2 #5).
- Verdict headline visibly only ~26px — under the M2 30px contract (P1 #4).

### empty / no-issues (NOT captured — source review)
- `IssueLedger.tsx:101-107` has a bare-centered "No specific issues detected in this scan." with no titled context, no two-tier CTA, no warm glyph — fails M8 designed-empty. Also `CtaBlock` swaps to "We make sure your AI search visibility stays strong." which is fine. NEEDS verification + an M8 pass.

### pending / scanning (NOT captured)
- `ScanPendingState` not reviewed in this audit — capture required.

### failed (NOT captured — source review)
- `FailedSection` (`page.tsx:197-223`) has good two-tier recovery ("Book a discovery call instead" + "Try a new scan") and names a real recovery — appears M8-compliant, but it is a bare-centered `card-console` (tell #5) with no warm glyph. Verify visually.

### mobile-375 (NOT captured)
- Source uses `flex-col` fallbacks on the hero (`ScanScoreHero.tsx:109`) and the engine band is `flex` (will compress 3 cells into a cramped row on 375 — likely too tight). MUST capture and verify no horizontal scroll and that the 3 engine cells don't crush.

### v2 view (NOT captured)
- `ScanV2View` is the richer per-engine path and was not exercised by this fixture — separate capture + audit required.
