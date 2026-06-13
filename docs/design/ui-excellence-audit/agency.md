---
page: /agency (Agency / Pitch Workspace)
route: /(protected)/agency
states_audited:
  - populated-desktop.png (demo user → success state, above the fold)
  - populated-mobile.png (375px, success state, above the fold)
states_NOT_captured:
  - idle / empty (real-user first run)
  - running (PipelineLedger)
  - error
  - Clients / White-label / Leads tabs
  - below-the-fold of the success audit (Top gaps list, footer actions)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.36.25 AM.png (loading state, dot-grid texture)
  - Profound-Screenshot 2026-06-12 at 10.37.47 AM.png (audit handoff, split layout + ranked list panel)
  - Profound-Screenshot 2026-06-12 at 10.38.10 AM.png (region step, split layout + dark CTA)
  - otterly-Screenshot 2026-06-12 at 10.44.17 AM.png (onboarding, split form + ghosted result preview)
  - otterly-Screenshot 2026-06-12 at 10.45.13 AM.png (generating state, animated diagram + skeleton)
verdict: NEEDS_WORK
---

# agency — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/agency/populated-desktop.png)
- [populated-mobile.png](screenshots/agency/populated-mobile.png)

> Only two states were captured, both for the demo user (forced `success`). The idle/empty, running, error states and the Clients/White-label/Leads tabs were NOT rendered, and the success view is cut off above the fold (Top gaps + footer not visible). This audit is therefore partial — the most important findings (P1-1, P1-2) are visible in both captured states, but the empty/running/error craft and the supporting tabs are unverified and must be screenshotted before a PASS.

## Verdict

**NEEDS_WORK.** This is not vibe-coded — the source is genuinely craft-aware (real depth tiers via `.card-inset`/`.card-console`/`.card-console-hero`, the 4-step type contract, the blue→violet narrative, a real micro-sparkline, a Fraunces verdict beat, a weighted 2-up engine breakdown). It already sits closer to the Profound/Otterly bar than most pages. BUT the success state — the one state a paying agency user lives in — has a hard layout bug and a duplicated hero that immediately read as broken/AI: an **orphaned full-width blue "Generate audit" button persists after the audit lands**, and **two giant "31" figures fight for the eye** (header ContextStat + audit hero). Profound and Otterly never show two competing focals or a stranded primary CTA. Fix those two and the page is close to PASS.

---

## P1 — must fix (looks AI / broken)

### P1-1. Orphaned full-width blue "Generate audit" button persists in the success state (real BUG)
**Problem.** In the desktop shot, after the audit has already been generated (collapsed input bar reads `goldendental.co.il · All engines` with "Change inputs"), a full-width blue **"Generate audit"** button + "Reset scope" link still render directly above the audit card. The audit also has its own "Re-run audit" / "Copy share link" actions in its footer. So the page presents a loud primary CTA to *generate* an audit that is *already on screen*.
**Why it reads broken vs the ref.** Profound's audit-handoff screen (`10.37.47`) shows exactly ONE action ("Continue") and never a stranded CTA from a prior step. Here the loudest element on the whole page is a redundant button — classic "state machine leaked a control it should have hidden." It also breaks M1/M10 (one focal, progressive disclosure) and the blue=you law twice over (two blue primaries).
**Fix (M1/M10).** `runControl` is suppressed only when `pageState === 'running'` (`AgencyWorkspace.tsx:284-285`). Suppress it in `success` too: `pageState === 'running' || pageState === 'success' ? null : (...)`. The re-run affordance already lives in the audit footer (`AuditReport.tsx:247`). 
**File:line.** `apps/web/src/app/(protected)/agency/_components/AgencyWorkspace.tsx:284-306`.

### P1-2. Two TIER-1 "31" hero figures on one screen (duplicate focal — tell #1 / M2 violation)
**Problem.** The header right-rail ContextStat renders `31` at 64px mono ("PROSPECT SCORE", black) and the audit hero renders `31` at 64px mono ("GEO VISIBILITY", amber). Same number, same size, two places, ~400px apart. The eye can't tell which is THE score.
**Why it reads AI vs the ref.** The rubric is explicit: "exactly one STEP-1/screen" (M2) and "one focal/screen, never two hero cards" (M1). Profound shows the rank/score once. Two identical 64px figures is the canonical "told-not-felt hierarchy" tell.
**Fix (M2/M1).** When `hasResult` is true, the ContextStat must NOT mirror the audit's own hero score. Either (a) switch the header stat to a *different* signal in success (e.g. CLIENTS count, or "queries tracked"), so the audit hero owns the score; or (b) shrink the header figure to a TIER-3 secondary register (e.g. 28-32px) so only the audit's 64px reads as STEP-1. Today `contextStat` is wired to `audit.score` whenever `hasResult` (`AgencyWorkspace.tsx:222-230`) — change the success branch.
**File:line.** `apps/web/src/app/(protected)/agency/_components/AgencyWorkspace.tsx:223-229` + `components/console/ContextStat.tsx:35-40`.

### P1-3. Header micro-sparkline reads as a stray pencil mark, not data (signature detail misfires — M4)
**Problem.** Under the header "31" sits a thin amber line angling slightly up. At arm's length it looks like an accidental underline or a smudge, not a sparkline — there's no baseline, no end-dot emphasis, and it's the same hairline weight as a divider. The audit's own engine sparklines (ChatGPT card) read better because they're paired with a number and a band color the eye expects.
**Why it reads unfinished vs the ref.** Otterly's generating-state diagram and Profound's ranked panel make every drawn line legible and intentional. A lone ambiguous squiggle under a number reads as a render glitch — the opposite of M4 ("signature detail," not noise).
**Fix (M4).** If P1-2 is fixed by removing the score from the header in success, this sparkline goes with it (preferred). If the header keeps a stat, give the sparkline a visible baseline + a terminal dot in the band color so it reads as a trend, and confirm it's not colliding with the figure's baseline. Verify against the `EngineMicroSparkline` null/flat-baseline path so it never renders an ambiguous 2px line.
**File:line.** `apps/web/src/components/console/ContextStat.tsx:42-48`; `components/dashboard/EngineMicroSparkline`.

### P1-4. The "Generate audit" CTA is a full-width blue bar — full-bleed stack (tell #5)
**Problem.** `runControl` wraps the Button in `flex flex-col`, so `align-items:stretch` makes the button span the entire 880px column as a solid blue bar. It is by far the heaviest element on the page and dominates even the audit hero.
**Why it reads AI vs the ref.** Profound (`10.38.10`) and Otterly (`10.44.17`) use *contained* dark/pink CTAs sized to their label inside a split layout — never a full-bleed accent bar. A full-width accent stack is tell #5 (dead-center / full-width stacks) and over-weights the one-blue-focal budget.
**Fix (M1/M3).** Constrain the primary to its content width and left-align it under the input (`self-start`), or right-align it to mirror the input's `[1fr_200px]` rail so it sits under Scope. The button already has `gap-2` — add `w-fit`/`self-start` on the Button (or remove the stretching flex column). This is also what makes the orphaned-CTA bug (P1-1) so visually violent.
**File:line.** `apps/web/src/app/(protected)/agency/_components/AgencyWorkspace.tsx:286-297` (the `flex flex-col` wrapper).

---

## P2 — substantive

### P2-1. No Fraunces serif beat is visible in the captured fold (M5 — likely fine below fold, unverified)
The one Fraunces beat lives in the audit verdict sentence ("Their AI visibility is *Fair*", `AuditReport.tsx:139` via `SerifVerdict`). In the desktop shot the word "Fair" does render italic-serif — good, that satisfies M5. BUT it sits in a 18px sentence that competes with the duplicate 64px figures, so the editorial beat is buried. Once P1-1/P1-2 are fixed it will read. No code change needed beyond the P1 fixes; re-verify the serif is the *only* Fraunces instance on screen (it must never appear in the tabs/chrome).

### P2-2. Tab bar is a flat, evenly-weighted 4-up with no depth or active-state richness (tell #3)
"Generate · Clients · White-label · Leads" sit as four equal-weight 14px links with a thin blue underline on the active one. It's correct but minimal — at arm's length the active tab barely separates from the inactive three, and there's no hairline/ground anchoring the bar to the content. Profound/Otterly anchor their nav with a clear container edge. Consider a 1px bottom hairline on the full `TabsList` and a touch more weight contrast (active 600 vs inactive 500) so the spine reads. M12 (hairline rhythm).
**File:line.** `AgencyWorkspace.tsx:387-401`.

### P2-3. The amber score is the loudest color on a page whose whole story is blue→violet (tell #8)
The audit hero "31" is amber (`--color-data-5`, Fair band) — correct per the score-band system — but combined with the duplicate header figure and the full-width blue bar, the screen's color story at arm's length is "big amber number + big blue bar," not the intended "blue you → violet agents" promise. The violet (Re-run audit `AgentRoute`) is entirely below the fold, so the spatial blue/violet split (M6/tell #8) is invisible in the primary view. Once the orphaned CTA is gone and the duplicate figure removed, pull one violet agent signal higher (e.g. a subtle violet "your crew ran this" provenance line on the audit cover) so the agent half of the promise is glanceable above the fold.

### P2-4. Mobile: the two-figure collision is worse, and the audit hero "31" is clipped by the dev badge
On the 375px shot, the header "31 PROSPECT SCORE" and the audit "31 GEO VISIBILITY" stack vertically — the duplicate is even more jarring because they're now ~600px apart in the same scroll. Separately, the audit hero "31" is partially overlapped by the (ignored) dev indicator pill in the bottom-left; that's a dev artifact, but it flags that the audit hero figure sits very low/left with little breathing room on mobile. Verify the audit cover's `flex items-start gap-6` doesn't crowd on narrow widths (`AuditReport.tsx:125`).

### P2-5. Empty/idle state is dead-center symmetric (tell #5) — UNVERIFIED, source-only
The idle/empty state uses `EmptyState` with `align="top"` (`pt-[18vh]`) + centered glyph + centered two-tier CTA (`AgencyWorkspace.tsx:338-366`). The two-tier recovery (primary "Try a sample prospect" + quiet "View client roster") satisfies M8, and `align="top"` avoids true dead-center — good. But it's still a centered icon-over-text-over-buttons column (the EmptyState template, `empty-state.tsx:161-188`), which is the softest form of tell #5. Not a blocker, but screenshot the idle state (real-user first run) and confirm the centered glyph doesn't read as "lost." Consider the `preview` prop (ghosted audit shape) the template supports — Otterly's onboarding (`10.44.17`) ghosts the real result behind the form, which is exactly this move and reads far more premium than an icon.

---

## P3 — nice-to-have

### P3-1. Input panel rail ratio drifts between zones (M3 consistency)
The input panel uses `sm:grid-cols-[1fr_200px]` (`AgencyWorkspace.tsx:235`) while the header uses a flex `flex-1 / shrink-0` split and the engine breakdown uses `[1.4fr_1fr]`. Three different asymmetry ratios on one page. Pick a consistent dominant/rail proportion so the asymmetry feels authored, not incidental.

### P3-2. "Reset scope" link sits oddly under a full-width CTA
Once P1-4 contains the button, re-check that "Reset scope" (`AgencyWorkspace.tsx:298-304`) reads as a clear secondary and isn't floating in dead space. It currently also only resets scope to 'all' — a weak action to give visual real estate.

### P3-3. InputSummaryBar mono summary is good; verify "Change inputs" is the only blue in the collapsed bar
The collapsed bar (`InputSummaryBar.tsx`) puts "Change inputs" in blue — correct (it's a you-action). Just confirm it's not competing with the orphaned blue CTA above it (resolved once P1-1 lands).

### P3-4. Verify entrance choreography respects reduced-motion
`ToolPage` applies `craft-enter craft-enter-1..6` stagger (`ToolPage.tsx:82,111,126,134,143`). Confirm the `craft-enter` keyframe has the `prefers-reduced-motion` static fallback the rubric (M9) and brand law require. Not visible in a still; flag for the polisher.

---

## Per-state notes

**populated-desktop (success):** The dominant problems live here — P1-1 (orphaned full-width blue CTA), P1-2 (two 64px "31" figures), P1-4 (full-width blue bar). The audit card itself (cover → 64px score → Fraunces verdict → weighted 2-up engines with sparkline) is genuinely good craft and matches the rubric; the ChatGPT "Weakest" focus card + receding Gemini/Perplexity insets is a correct M3/M1 application. The damage is everything ABOVE the audit card, not the audit card.

**populated-mobile (success):** Same bugs, amplified by vertical stacking (P2-4). Layout does collapse to single column correctly (no horizontal scroll observed), tap targets look ≥44px. The duplicate-figure problem is the standout mobile issue.

**idle / running / error / Clients / White-label / Leads:** NOT captured. Source review suggests they're built with care (designed EmptyState with two-tier recovery, ErrorState with named recovery "Retry", a real PipelineLedger). These must be screenshotted before any PASS — particularly the idle state (the real-user default) and the running PipelineLedger (where the violet agent zone, M6, should finally be glanceable).
