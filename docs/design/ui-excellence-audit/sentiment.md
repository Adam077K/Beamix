---
page_route: /sentiment
states_audited:
  - populated-desktop.png (success state — demo user)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.38.57 AM.png (Answer Engine Insights — Visibility Score hero + ranked table)
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png (prompts table, mono numbers + colored deltas)
  - Profound-Screenshot 2026-06-12 at 10.38.02 AM.png (welcome / live-prompt panel)
  - otterly-Screenshot 2026-06-12 at 10.44.39 AM.png (Brand Ranking table)
  - otterly-Screenshot 2026-06-12 at 10.45.13 AM.png (loading / generating panel)
verdict: NEEDS_WORK
---

# sentiment — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/sentiment/populated-desktop.png)

> Only ONE state was captured (populated-desktop). The empty, loading, and error
> states — which the source clearly implements (`SentimentPanel.tsx:96–140, 315–338`)
> — were NOT rendered. They are audited from source only and flagged below; they
> must be screenshotted before this page can PASS. The single supplied PNG is also
> low-resolution (≈350px wide as delivered), so sub-pixel craft (hairline weights,
> shadow tiers, mono tracking) is read partly from source.

## Verdict
**NEEDS_WORK.** The bones are genuinely strong — this is the most ambitious surface in the set, and it is NOT a generic AI template: it has a real asymmetric hero (`[1fr_360px]`), a weighted 2-up theme block, an editorial verbatim-quote signature, a Fraunces verdict beat, and a disciplined violet-for-agents law. It sits in the same family as the #173 dashboard exemplar. It does NOT reach the competitor bar yet for three reasons visible at arm's length: (1) the page reads as a long vertical stack of nearly-equal-height white `card-console` boxes — depth is told in the class names but flat in the render (tell #1); (2) the hero's emotional payload (the 64px score + the Fraunces verdict) is under-weighted relative to the volume of cards beneath it, so the focal does not dominate the way Profound's "72.9% #1" does; (3) the right-hand theme/claim column reads as three stacked uniform tiles, drifting toward the equal-tile look the rubric forbids. Honest distance from the Profound/Otterly bar: ~70% there. Close the depth + focal-weight gaps and it crosses.

---

## P1 — must fix (looks AI / broken)

### 1. Flat uniform depth — the whole page is one shade of white card (tell #1, fix M1)
From the visual evidence, the hero, "Wait times" focus card, the right-rail theme tiles, and the "Pricing transparency / Gentle, pain-free / Insurance accepted" cards all read as the same flat white rectangle with the same near-invisible border. The rubric demands THREE FELT TIERS: TIER-1 hero `--shadow-card-hero`, TIER-2 `--shadow-card`, TIER-3 `.card-inset` (no shadow). In the render they collapse into one tier. Profound's dashboard (10.38.57) earns depth by *contrast* — the chart panel and the rank table sit on a clean ground with a single quiet elevation, and nothing competes. Here everything competes equally.
- **Why it reads AI:** uniform depth is the #1 tell — hierarchy is told (class names) not felt (pixels).
- **Fix (M1):** verify `.card-console-hero` actually renders a visibly heavier shadow than `.card-console`, and that `.card-inset` renders with NO shadow + the warm/transparent ground. The right-rail `InsetThemeCard` (`SentimentThemes.tsx:121`) uses `.card-inset` — good — but the FocusThemeCard (`SentimentThemes.tsx:74`), HallucinationList section (`HallucinationList.tsx:50`), and RecoveryTimeline (`RecoveryTimeline.tsx:15`) are ALL `.card-console` at the same elevation. Demote at least one (claims list or recovery) so the eye gets a depth staircase, not a wall.
- **File:line:** `SentimentThemes.tsx:74`, `HallucinationList.tsx:50`, `RecoveryTimeline.tsx:15` + the `.card-console*` token definitions in `globals.css`.

### 2. The hero focal does not dominate — score + verdict are out-weighed by the cards below (tell #3/#10, fix M2/M1)
From the visual evidence the "86" and the Fraunces "Trusted" verdict sit in a hero band that is roughly the same visual mass as each content card beneath it, and the verdict sentence is only 18px. Profound makes its "72.9% / #1" hero unmistakably the loudest thing on the screen. Here the eye lands on the dense "Wait times" quote card almost as fast as on the score.
- **Why it reads AI:** evenly-weighted typography / no progressive disclosure — nothing commands, everything is equal priority.
- **Fix (M2):** the verdict sentence is 18px (`SentimentPanel.tsx:197`) but the rubric STEP-2 is **30px InterDisplay-Medium -0.02em**. Raise it. The 64px score is correct (STEP-1) — but give the whole hero more vertical breathing room and a heavier shadow tier (see P1#1) so it reads as the single TIER-1 focal. The verdict is the emotional payload of this page ("your brand reads *Trusted*"); at 18px it whispers.
- **File:line:** `SentimentPanel.tsx:197` (raise 18px → 30px, swap to InterDisplay-Medium).

### 3. Right-rail column reads as three stacked uniform tiles (tell #2, fix M3/M1)
From the visual evidence, the right side of the themes block shows three cards of near-identical height/weight ("Pricing transparency", "Gentle, pain-free", "Insurance accepted") stacked vertically. Although the code is a weighted 2-up (good intent, `SentimentThemes.tsx:49` `[1.6fr_1fr]`), the rendered secondary stack still reads as an N-equal list of identical tiles — the canonical AI pattern, just rotated vertical.
- **Why it reads AI:** equal-tile repetition with no internal hierarchy among the secondary themes.
- **Fix (M3/M7):** give the secondary inset tiles internal hierarchy so they don't read as clones — e.g. lead each with its mono mention-count as the dominant figure (M7 number-over-label), let the theme name + quote-preview recede. Vary the tile heights by content (the line-clamp-2 currently forces uniform height). Consider capping the secondary stack at 2 visible + "view N more" so it is not a wall of equal tiles.
- **File:line:** `SentimentThemes.tsx:121–148` (InsetThemeCard).

### 4. Missing-state screenshots — empty / loading / error never rendered (rubric checklist (e))
The source implements all four states well on paper (honest empty at `SentimentPanel.tsx:315`, staggered loading skeletons at `:263`, two-tier error with support link at `:107`). But only `success` was screenshotted. The design-critic checklist requires all four states designed AND verified. A page cannot PASS on one state.
- **Why it matters:** the empty state is what every REAL (non-demo) Phase-1 user sees (`page.tsx:56`) — it is the *default* production experience, and it is the one state NOT verified.
- **Fix:** capture `?state=empty`, `?state=loading`, `?state=error` (the dev-only forcing is wired at `page.tsx:32`) and re-audit. Confirm the empty state is not a bare-centered icon (the `EmptyState` with `illustration="scan"` must render a warm glyph + the two-tier CTA, not a grey circle).
- **File:line:** `page.tsx:32–58`, `SentimentPanel.tsx:96–140, 315–338`.

---

## P2 — substantive

### 5. Scope rail is visually heavy and competes with the hero (M1/M12)
From the visual evidence there are TWO rails before content: the app nav sidebar, then a second "Engines / Frameworks / Themes" scope rail listing ChatGPT, Perplexity, Gemini, etc. The combined left-side furniture is wide and busy, pushing the hero rightward and shrinking the score's dominance. Profound uses a single quiet sidebar; Otterly keeps chrome minimal. Two stacked rails is a lot of pre-content weight on a page whose whole point is one emotional verdict.
- **Fix:** ensure the scope rail uses TIER-3 recede styling (quiet, hairline-separated, `#9CA3AF` labels) so it never competes with the hero. Confirm the rail list items are not full-weight `#0A0A0A`.
- **File:line:** `AnalyticsScopeRail` / `ThemeRail.tsx` + the AnalyticsLayout shell.

### 6. Verbatim-quote signature is present but under-celebrated (M4/M5)
The `VerbatimQuote` (the stated signature detail, `VerbatimQuote.tsx`) is genuinely good — left sentiment rule, pull-quote leading, mono meta, flagged-clause `<mark>`. But in the render it sits inside a flat card at the same weight as everything else, so the "owner reads their own situation in the model's words" moment doesn't land as a moment. The flagged-clause `<mark className="bg-status-critical text-[#0A0A0A]">` (`VerbatimQuote.tsx:26`) — verify the critical-tint ground gives ≥4.5:1 against `#0A0A0A` text; tinted status grounds are pale and may fail contrast on the marked words.
- **Fix:** let the focus quote breathe (more padding, slightly larger leading) and confirm the `<mark>` contrast. This is the page's signature — give it room.
- **File:line:** `VerbatimQuote.tsx:26, 77`.

### 7. "Correct this →" violet anchor — verify it reads as agent-zone, not a broken button (M6)
Good: violet is an anchor with `bg-status-agent` tinted ground, never a fill button (`HallucinationList.tsx:94`, `VerbatimQuote.tsx:88`) — the law is respected. But a tiny tinted-violet pill with an arrow can read as a disabled/secondary button rather than "the agents will fix this." The violet-for-agents promise should be glanceable as a *zone*, not just a pill color (tell #8).
- **Fix (M6):** consider a faint violet hairline or `#EEEAFD` ground band grouping the claims-to-correct section so the agent affordance reads as a structural zone at arm's length, not a per-row token.
- **File:line:** `HallucinationList.tsx:50, 94`.

### 8. Mono pills at 10px risk legibility (M11/WCAG)
Severity pills and sentiment badges are `text-[10px]` mono uppercase (`HallucinationList.tsx:82`, `SentimentBadge.tsx:26`). 10px tinted-on-tinted uppercase mono is at the legibility floor, especially the neutral grey pill. Profound/Otterly keep their micro-labels readable.
- **Fix:** bump to 11px and verify tinted-text-on-tinted-ground contrast for each status (positive/neutral/warning all need ≥4.5:1 or AA-large).
- **File:line:** `SentimentBadge.tsx:26`, `HallucinationList.tsx:82`.

### 9. Loading state uses one global `space-y-8` (M12 leak)
`LoadingBody` wraps everything in `space-y-8` (`SentimentPanel.tsx:265`) — exactly the "one global space-y" the rubric flags. The success body relies on section default gaps; verify it varies whitespace by relationship (tight within a cluster, wide between sections) rather than a uniform rhythm.
- **Fix (M12):** vary the loading skeleton gaps to match the success rhythm so the load-in doesn't telegraph a different layout than what resolves.
- **File:line:** `SentimentPanel.tsx:265`.

---

## P3 — nice-to-have

### 10. No micro-sparkline signature on the score (M4)
The dashboard exemplar's signature is the engine micro-sparkline. Sentiment has no trend visual on the integrity score — a 5-point sparkline of the integrity score over recent scans would tie this page to the dashboard's signature and answer "is my brand integrity improving?" Only if real history exists (never fake data — flat baseline when null).

### 11. SplitBar opacity 0.55 may wash out (M7)
`SplitBar` fills render at `opacity: 0.55` (`SplitBar.tsx:40`). On the `#F3F4F6` track the negative/red sliver may be hard to distinguish from neutral grey at a glance. Consider 0.7 for the negative segment or a saturated 2px cap.

### 12. RecoveryTimeline hard-coded quote colors (#7F1D1D / #14532D) (token drift)
`RecoveryTimeline.tsx:34, 53, 93` uses raw hex `#7F1D1D` / `#14532D` for before/after quote text instead of status tokens. Minor token-system drift; swap to the status text tokens for consistency and dark-mode safety.

---

## Per-state notes

**populated-desktop (success):** Strong structural intent — real asymmetry, real signature, real Fraunces beat, disciplined violet. Falls short on *felt* depth (everything one white tier) and on focal dominance (the 86/verdict should be unmistakably the loudest element). The right column drifts toward equal-tile repetition. This is a polish-the-hierarchy problem, not a redesign — the architecture is sound.

**empty (NOT captured):** Production default for all real users (`page.tsx:56`). Source looks honest and on-brand (`illustration="scan"` + two-tier CTA, `SentimentPanel.tsx:315`). MUST be screenshotted to confirm it is not a bare grey circle and that the warm glyph + CTA render.

**loading (NOT captured):** Staggered skeletons exist (`:263`) but use one global `space-y-8`. Verify it mirrors the success rhythm.

**error (NOT captured):** Two-tier recovery with support mailto exists (`:107`) — good pattern on paper. Verify the rendered ErrorState is not a bare centered icon and names a real recovery (it does in copy).

**mobile (NOT captured):** No mobile screenshot. The hero is `lg:grid-cols-[1fr_360px]` and themes are `lg:grid-cols-[1.6fr_1fr]`, so they collapse to single-column below `lg` — verify the 360px SplitBar and the verbatim quote don't overflow or clip at 375px, and that the two stacked rails (nav + scope) don't eat the viewport on mobile.
