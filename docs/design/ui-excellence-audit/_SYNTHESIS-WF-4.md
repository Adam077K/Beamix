# WF-4 UI Excellence Audit — Synthesis

Pages in this wave: **reports, team, agency, shopping, settings** (all 5 verdict NEEDS_WORK, 0 needs_redesign).
P1 total: 16 · P2 total: 26 · P3 total: 17.

---

## 1. Systemic patterns (fix once → cascades)

### S1. Shell gives `<main>` zero horizontal padding → every page owns its own width, and they disagree
`apps/web/src/components/dashboard-shell.tsx:80-82` — `<main>` has `overflow-y-auto` and a bare `<div className="h-full">` with **no `px`/`max-w`/`mx-auto`**. Because the shell abdicates the content frame, each page reinvents it, and they reinvent it wrong:
- **team** pins to `max-w-[760px]` with no `mx-auto` → ~40% dead white space, reads broken (P1-1).
- **reports** uses a 3-zone grid inside `max-w-[1200px] px-8` with a fixed `320px` drawer that doesn't fit → drawer clipped at viewport edge (P1).
- **settings** subtitle orphans into a large dead right gutter (P1-3).
This is one root cause (no shared content frame) expressed three different ways. **Establishing a shared content container in the shell — `mx-auto w-full max-w-[1200px] px-6 sm:px-8` plus an opt-out for full-bleed/3-zone pages — neutralizes team P1-1 and the layout half of settings P1-3 at once, and gives reports a sanctioned wider track to opt into.**

### S2. Heading display register collapses to generic bold (turbopack-dev font fallback)
`team` P1-3 and `settings` P1-3 both report the H1 rendering as plain bold, not `InterDisplay-Medium -0.02em`. `page-header.tsx:51` already specifies `font-[var(--font-display)] ... font-medium tracking-[-0.02em]`, and `app/globals.css:61` maps the token correctly — so the **CSS is right; the renderer is wrong.** This is the known turbopack-dev font-fallback blocker (CRAFT-SYSTEM.md:44-45), an environment issue, not a per-page code fix. **Action: re-shoot all WF-4 states against prod/webpack build (not `next dev --turbopack`) before any polish worker writes "display register broken" findings. Likely clears 2 P1s as false-on-dev.**

### S3. Depth tiers collapse to "hero + flat" — TIER-1/TIER-3 not felt (tell #1, move M1)
`reports` (body tiles + inset rows too close in elevation), `team` (legend reads as near-equal grey card vs intended TIER-3 recede), `settings` (Profile + Password cards at identical `card-console` elevation), and `shopping` (hero TIER-1 reads as one surface with the SKU table) all report the same failure: the `--shadow-card` vs `--shadow-card-hero` / `card-console` vs `card-inset` gap is too small to read at arm's length. **Audit `--shadow-card`, `--shadow-card-hero`, `.card-console`, `.card-inset` in `app/globals.css` — widen the elevation step and recede insets — and the M1 fix cascades to 4 pages.**

### S4. Numbers are not mono tabular (move M11)
`settings` P2-6 (password strength %, downstream billing $/dates/seats in Inter) is the explicit instance, but the dashboard exemplar (#173) established Geist Mono `tabular-nums` for all figures. agency/reports/shopping all lean on big numerals (the `31`s, deltas, %s). **A shared numeric primitive (`<Stat>` / `<Num>` using `font-mono tabular-nums`) lands once and removes the single biggest divergence from the #173 bar across the wave.**

### S5. blue=you / violet=agents spatial promise is invisible (tell #8, move M6)
`settings` P1-4 (zero violet despite agent-domain tabs; source comment claims violet but rail icons render grey), `agency` P2-3 (violet entirely below the fold), and the team page (no agent-color coding) all fail the role-color promise. This is a token-application discipline gap, not one component. **Define and enforce the violet-on-agent-surface rule (sidebar/rail icons + agent CTAs) — covers settings P1-4 and agency P2-3.**

### S6. CTA weight / full-bleed primary buttons read as broken (tell #5)
`agency` P1-4 (`flex-col align-items:stretch` blows the Generate-audit button into a full-width blue bar — heaviest element on page) and `settings` P1-2 (disabled Save renders as washed translucent `#3370FF` on white → looks half-loaded). Both are button-state/sizing discipline. **A shared Button audit — never stretch a primary full-width by accident; disabled = neutral/bordered-ghost, full accent only when dirty — fixes agency P1-4 and settings P1-2.**

### S7. State coverage incomplete — checklist (e) cannot clear
`reports` (empty/loading/error not captured), `shopping` (signature matrix + sentiment + all non-populated + mobile never captured; single capture is viewport-cut). **Re-capture protocol: `fullPage` + every `?state=empty|loading|error` + 375px mobile for reports and shopping before polish.** Pairs with S2's re-shoot.

---

## 2. Worst pages, ranked worst-first by craft gap

1. **agency** — 4 P1 / 5 P2. Success state (the one paying users live in) reads outright broken: orphaned full-width blue "Generate audit" CTA above an already-landed audit + two identical 64px `31` hero figures fighting for the eye. Worst because the flagship paid surface looks buggy.
2. **settings** — 4 P1 / 6 P2 (highest P2 count). "Competent but soulless generic-SaaS": uniform depth, disabled-Save-looks-broken, zero blue/violet, no mono, no serif. Most individual defects; furthest from the #173 bar in soul.
3. **reports** — 3 P1 / 5 P2. One genuine hard layout bug (clipped 3-zone drawer) plus under-dense canvas; otherwise structurally sound. High-severity but localized.
4. **team** — 3 P1 / 5 P2. Single dramatic systemic tell (40% dead space from left-pin) that the S1 shell fix largely resolves; remainder is hierarchy/rhythm polish.
5. **shopping** — 2 P1 / 5 P2, BUT mostly **unverifiable** — the signature moment and all non-populated states were never captured. Lowest *confirmed* craft gap, highest *unknown* — must re-capture before it can be ranked honestly.

---

## 3. Shared-component fixes (concrete paths)

- `apps/web/src/components/dashboard-shell.tsx:80-82` — add shared content frame (`mx-auto w-full max-w-[1200px] px-6 sm:px-8`) with a full-bleed opt-out prop. Cascades: team P1-1, settings P1-3 (layout half), gives reports a sanctioned wide track. (S1)
- `apps/web/src/app/globals.css` — widen `--shadow-card` ↔ `--shadow-card-hero` step; recede `.card-inset` vs `.card-console`. Cascades: reports/team/settings/shopping depth (S3).
- `apps/web/src/app/globals.css` — token review only; confirm `--font-display` resolves under prod build. CSS is correct; defect is the turbopack-dev renderer (S2). **No code change — env/build re-shoot.**
- New shared numeric primitive (e.g. `apps/web/src/components/ui/stat.tsx`) — `font-mono tabular-nums`. Cascades: settings P2-6 + all figure-heavy pages (S4).
- `apps/web/src/components/ui/button.tsx` (shared Button) — disabled = neutral/bordered-ghost not washed-accent; never auto-stretch primary full-width. Cascades: agency P1-4, settings P1-2 (S6).

---

## 4. Polish plan — DISJOINT ownership

Each owner works in a separate worktree. **Hard rule: only the `shared-tokens-shell` owner touches `dashboard-shell.tsx`, `globals.css`, the shared `button.tsx`, and the new `stat.tsx`. That worktree MERGES FIRST; the four page owners rebase on it and touch only their own feature-component tree.** This keeps the five page workers conflict-free.

- **shared-tokens-shell** (heavy-polish, merge first): S1 shell content frame, S3 depth-step tokens, S4 `<Stat>` primitive, S6 Button disabled/stretch rules. Owns shell + globals.css + ui/button.tsx + ui/stat.tsx only.
- **agency** (heavy-polish): P1-1 suppress Generate-audit/Reset-scope CTAs in success state (only show for pre-run); P1-2 demote one of the two `31` figures (single STEP-1 focal); P1-3 fix sparkline (baseline + terminal dot); consume shared Button for P1-4. Owns `AgencyWorkspace.tsx` + `AuditReport.tsx` + `ContextStat.tsx`.
- **settings** (heavy-polish): P1-1 Password card → `.card-inset` (consume S3); P1-3 subtitle `max-w` (layout from S1) + stronger H1; P1-4 violet on agent tabs (S5); consume shared Button (P1-2) + `<Stat>` (P2-6). Owns `ProfileTab.tsx` + settings `page.tsx`.
- **reports** (heavy-polish): P1 raise 3-zone container to ~1320-1400px (opt into shell wide-track) OR narrow drawer to 300px — kill the clipped drawer; P1 mobile title 22-24px + truncate; P1 capture empty/loading/error + fix empty-state dead-center. Owns `ReportsConsole.tsx` + `ReportTile.tsx` + `BlockLibrary.tsx`.
- **team** (light-polish, after shell merges): P1-1 largely resolved by S1 shell frame — verify + remove the local `max-w-[760px]` pin; P1-2 promote members table to focal, recede legend (S3); P1-3 verify cleared by S2 re-shoot. Owns `TeamConsole.tsx`.
- **shopping** (light-polish, blocked on re-capture): FIRST re-capture fullPage + all `?state=` + 375px (S7); P1-2 hero verdict non-breaking-space / tune `max-w`. Re-rank after capture; may escalate to heavy-polish if the signature matrix is as weak as suspected. Owns `ShoppingHero.tsx` + `SkuVisibilityTable.tsx` + `AttributeAccuracyMatrix.tsx`.

**Sequencing:** re-shoot (S2 prod build + S7 missing states) → merge `shared-tokens-shell` → four page owners rebase + polish in parallel.
