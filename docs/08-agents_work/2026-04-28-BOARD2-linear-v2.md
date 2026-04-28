# Beamix Design Review — Through Linear's Lens (v2)
Date: 2026-04-28
Reviewer: Karri Saarinen voice — extending the partial v1 against the post-Round-1 spec corpus
Status: Replaces `2026-04-28-BOARD2-linear.md`. v1's diagnoses stand; v2 adds the speed/keyboard/density/dark/changelog/status/Cmd-K spec work the prompt asked for.

---

A note before §1. I'm not relitigating Round 1. The 65 surgical cuts that landed (Margin off product chrome, ring-pulse/score-fill/microcopy-rotate gone, Seal re-curved to 540ms stamp, deterministic-seed-per-agent locked as brand canon, Cartogram in PRD as F22, Brief grounding as F30/F31, register count 4 → 3) are correct, and most of them are more Linear-shaped after the cuts than they were before. The work that remains is the work Linear cares about most: **frame budgets, keyboard grammar, density-as-respect, dark mode parity, public editorial cadence, vocabulary discipline, and the unified command surface**. Seven sections, then the 5-7 hardest cuts/adds, then a one-paragraph close.

---

## §1 — Speed audit (the 16ms pass)

Linear's discipline is one sentence: **if a frame skips, it's a bug**. Not a polish item. Not a P2. A bug. Beamix's specs talk about motion the way most teams do — easing curves, durations, choreography. Linear talks about it as frame budget. Walk every Beamix surface where the frame budget is at risk.

**/home boot — the most frame-stressed page in the product.** Render budget at first paint: hero Activity Ring (200px, 1.5px stroke, geometry-only per the 2026-04-28 lock — good, no entrance animation), the score number (96px InterDisplay, tabular numerals), four KPI sparklines (perfect-freehand strokes, ~80 points each), the Decision Card (cream paper, Fraunces 300 italic, Seal-in-waiting), the Receipt-That-Prints card (F25, only on Monthly Update day — paper-fold motion 600ms), the Cycle-Close Bell (F23, only Mondays — Ring closes 800ms + sparklines settle 200ms + status sentence rewrite once), the Crew at Work strip (11 monogram dots, brand-blue topbar status pulse infinite at 1600ms), the Brief binding line at footer (F31, 13px Fraunces 300 italic).

The number that matters: **first contentful paint must hit 100ms server-cache-warm, 400ms cache-cold, perceived ready-state ≤800ms**. Linear's home boot warm is 60ms, cold 280ms. Beamix should target Linear's range, not loosen to "what Next.js 16 gives us by default."

Risks I see in the spec corpus:

1. **Perfect-freehand sparklines are not free.** The library generates SVG paths via deterministic Catmull-Rom interpolation; for ~80 points × 4 sparklines × Rough.js wrapper that's ~16,000 SVG path commands per page-load. On the first server-rendered HTML response that's fine, but if the team renders perfect-freehand client-side (e.g., for hover-animated states), the hydration cost balloons to 80-120ms on a mid-tier laptop. **Fix:** server-render the sparkline SVGs at request time, never client-side. Rough.js paths are deterministic; ship them in the initial HTML payload.

2. **The Receipt-That-Prints card's 600ms paper-fold animation uses clip-path.** Browser repaint cost on clip-path animation is ~3ms/frame on Chrome, ~7ms on Safari. At 600ms that's 36 frames; on Safari that's 252ms of paint work over the animation lifetime. **Fix:** transition `transform: translateY(...)` with `opacity` instead of clip-path. Same visual register, half the paint cost, holds 60fps on a 2019 MacBook Air.

3. **Cycle-Close Bell choreography (F23) coordinates 3 things in 800ms:** Ring gap-close, sparkline-settle, status-sentence rewrite. Each is independently fine; coordinated they're three concurrent layout invalidations. **Fix:** put the Ring on a separate compositor layer (`will-change: transform` or `transform: translateZ(0)`), let the sparklines and status sentence share one layer, run the choreography as compositor-only animations. Zero layout, zero paint, pure transform.

4. **Topbar status pulse at 1600ms infinite is correct** (Linear ships an analogous pulse). Don't let any future change trigger a layout recalc on each pulse — it must be opacity-only. Watch for a future contributor adding a "subtle scale pulse" — that's the bug.

**Budget commitment for /home:** First paint ≤100ms warm / 400ms cold; interactive ≤200ms warm / 600ms cold; no animation longer than 800ms; all motion on compositor layers. Spec this as a CI gate: a Playwright trace test that fails the build if /home boot exceeds the budget on a regression run.

**/inbox row click → drawer open.** v1 noted the Approve burst-rate problem (Yossi pressing `e e e e e` overruns the seal-draw choreography). The drawer-open path has its own risk: clicking a row triggers a 240/440/600 layout shift as the preview pane updates with the row's full content, which can be ~3KB of HTML (diff preview, Brief grounding citation, agent metadata, action buttons). **Target ≤80ms perceived; budget the network at 0ms** — the row data is already in the list-page payload, the drawer is a render-from-cache, never a fetch. Linear's issue-detail drawer does this; Beamix must too. **No spinner on row open. Ever.** If the team is tempted to lazy-load the diff preview, prefetch on row hover with a 100ms dwell — the Linear pattern.

**/workspace step expand.** Same target ≤80ms. The narration column (added in Round 1, replacing the walking figure) needs its own compositor layer because it streams text. Streaming text into a layout-flowing div triggers reflow on every chunk; **ship the narration column as a fixed-width 320px block with `contain: layout style paint`** so the rest of the page never re-flows. This is the Linear-grade detail.

**Workflow Builder canvas.** The spec at §16.5 commits to <16ms per node render up to 50 nodes. That target is right. The risk is the conflict-overlay state — 8/12 nodes carrying amber conflict triangles + dashed conflict edges. Each conflict node renders six layers (header strip + body + status token + amber outline + conflict triangle + dashed edge). At 8 nodes that's 48 paint layers; React Flow's bezier edge router does its own layout pass on top. **Test before claiming the budget:** Playwright render with 50 nodes + 8 conflicts, measure paint time, fail if >16ms. The Cmd-K quick-add palette must be client-side fuzzy-search — never a server call. v1 said this; saying it twice.

**/scans Stripe-table at 44px row + 56px engine micro-strip per row.** The micro-strip is 11 columns × 4px wide × variable-height bars. Per row that's 11 SVG `<rect>` elements; at 50 rows that's 550 rects on first paint. **This is fine** — SVG with 550 simple rects renders in ~4ms. The risk is animating delta-changes on rescan: don't. Render the new state, no transition. Linear's issue-status-change is instant; the table doesn't tween.

**The Cartogram (F22).** 50 queries × 11 engines = 550 cells. Each cell is 24×24 with conditional-fill background + one character glyph (Geist Mono). HTML grid with CSS conditional formatting renders in ~8ms first paint, ~3ms re-render. The risk: if the team builds this as 550 individual React components with their own state, React's reconciliation cost climbs to ~30-60ms per render. **Ship the cartogram as a single component with one render pass** — 550 cells in one `.map()`, no per-cell state, no per-cell handlers (use event delegation on the parent grid). Hover tooltip via a single positioned tooltip component, not 550.

**Brief grounding inline citation (F30).** This appears on every action card (/inbox row, /workspace step, /scans Done lens, Workflow Builder node inspector). The citation is: 1px brand-blue rule + label "Authorized by your Brief" + Inter italic quoted clause + "clause N · Edit Brief →" link. Cost per render: ~6 DOM nodes, no images, no animations. **At /inbox cozy view with 12 rows, that's 72 extra nodes**. Negligible. The risk is if a future contributor adds a "fade-in trace" under each citation — kill that on sight; the citation is structural, not ceremonial.

**Page transitions — the Linear-grade rule.** The Design System v1 line 946 says "Navigation is instant. No full-page wipes, fades, or slides on route change." This is the most important sentence in the entire system. v1 said hold it ruthlessly. v2 says: **make it a CI gate**. A Playwright test that intercepts route change → measures DOM mutation time → fails if any animation is detected on `<main>` during route transition.

**The aggregate /home boot budget proposal:**
| Phase | Warm target | Cold target | Notes |
|---|---|---|---|
| HTML response | ≤30ms | ≤200ms | Edge-cached for 60s |
| First paint | ≤80ms | ≤350ms | Server-rendered Ring + sparklines |
| Hydration done | ≤180ms | ≤550ms | Compositor layers warm |
| Cycle-Close ready | ≤220ms | ≤600ms | Mondays only |
| Topbar pulse | always 60fps | always 60fps | Compositor opacity |

If Beamix can't hit warm-cache 100ms for /home, the marketing claim "Beamix does the work" reads as "Beamix takes its time." Speed is the credibility.

---

## §2 — Keyboard discipline (the full shortcut table)

Linear ships a `?` overlay that shows every shortcut on every page. It's the artifact that turns a power user into an evangelist. Beamix has J/K/e/r/m/n on /inbox and a deep map on Workflow Builder; everywhere else, nothing. Lift /home, /scans, /crew, /workspace, /competitors, /reports, /settings to keyboard parity, add the `g _` two-keystroke nav from v1, and ship the `?` overlay as one component reused on every surface.

**The full shortcut table (proposal — to lock in design system):**

### Global (every page)
| Key | Action | Notes |
|---|---|---|
| `Cmd-K` | Open command bar | Universal palette — workspaces, navigate, actions, recent, help. See §7. |
| `Cmd-/` | Open `?` help overlay | Same as `?`, for non-US keyboards |
| `?` | Open `?` help overlay | Lists every shortcut on the current page |
| `Esc` | Close modal / drawer / toast / palette | Standard |
| `/` | Focus inline search | When a search input exists on the page |
| `g h` | Navigate to /home | Two-keystroke grammar — Linear's pattern |
| `g i` | Navigate to /inbox | |
| `g s` | Navigate to /scans | |
| `g w` | Navigate to /workspace | |
| `g c` | Navigate to /crew | |
| `g k` | Navigate to /competitors | (k for "competitor" — c is taken) |
| `g r` | Navigate to /reports | |
| `g t` | Navigate to /settings | |
| `g b` | Open Brief | |
| `Cmd-,` | Open /settings | macOS convention |
| `Cmd-Shift-D` | Toggle dark mode | See §4 |

### List surfaces (/inbox, /scans, /workspace, /crew, /reports)
| Key | Action |
|---|---|
| `j` | Next row (focus + highlight) |
| `k` | Previous row |
| `Enter` | Open focused row (drawer or detail) |
| `o` | Open focused row full-screen |
| `x` | Toggle row selection |
| `Shift-j` / `Shift-k` | Extend selection down / up |
| `Cmd-A` | Select all in current view |
| `Esc` | Clear selection |

### /inbox specific
| Key | Action |
|---|---|
| `e` | Approve focused item (Seal fires) |
| `r` | Reject focused item |
| `m` | Modify focused item (opens inline editor) |
| `n` | Add note |
| `u` | Undo last action (within 5s window) |
| `a` | Approve all selected (bulk) |
| `1` / `2` / `3` / `4` | Switch tab (Pending / Drafts / Live / Auto-applied) |

### Workflow Builder
| Key | Action |
|---|---|
| `Cmd-K` (in canvas) | Quick-add node palette |
| `c` | Connect mode — select target node with j/k, Enter to commit edge |
| `Cmd-Z` / `Cmd-Shift-Z` | Undo / Redo (50-step ring) |
| `Cmd-A` / `Cmd-D` | Select all / Duplicate |
| `Cmd-S` | Save |
| `Delete` / `Backspace` | Remove selected |
| `Space` (hold) | Pan canvas |
| `+` / `-` / `0` | Zoom in / out / reset |
| `Arrow` | Nudge 8px |
| `Shift-Arrow` | Nudge 24px |
| `Tab` | Next node |
| `Enter` | Open inspector for focused node |
| `Cmd-Enter` | Run dry-run |
| `Cmd-Shift-Enter` | Publish workflow |

### Brief + artifacts
| Key | Action |
|---|---|
| `Cmd-Shift-P` | Print the Brief (F27) |
| `Cmd-Shift-M` | Open Monthly Update PDF |
| `Cmd-Shift-C` | Copy permalink to current scan / artifact |

### Multi-client switcher
| Key | Action |
|---|---|
| `Cmd-K` | Open switcher (universal) |
| `Cmd-1` … `Cmd-9` | Quick-jump to pinned client 1–9 |
| `Cmd-Shift-K` | Open /all-clients view |
| `Cmd-P` | Pin / unpin current client |
| `Cmd-Return` | Open client in new tab |

**The `?` overlay design pattern.** One React component, four columns at 880px wide, sectioned by category (Global / This page / Editing / Navigation). Each shortcut row: shortcut keys right-aligned in 11px Geist Mono on `--color-paper-elev` chips; action label left-aligned in 13px Inter 400. Esc closes. The overlay covers the whole viewport at 24% scrim; the shortcut card is 560px wide centered, cream paper register (this is the one place cream paper appears on a utility surface — it carries the "this is reference, not action" register-shift). No animation longer than 120ms entrance.

**Visible-hint pattern (Linear's secret weapon).** Inline shortcut hints appear next to button labels and right-aligned on focused rows: `Approve  e` rendered as `<span>Approve</span> <kbd>e</kbd>`. The `<kbd>` chip is 18px tall, 11px Geist Mono, `--color-paper-elev` background, `--color-border` 1px border, 4px radius. Linear ships these everywhere; they teach the keyboard grammar without onboarding chrome. **Beamix should ship them on every primary CTA in /inbox, /workspace, Workflow Builder, and the Brief approval flow.**

**The Cmd-K Brief grounding shortcut — Rams' structural commitment carried into Cmd-K.** Every Cmd-K result row that maps to an agent action shows the Brief clause that authorized it as 11px Inter italic right-aligned ink-3. Searching "approve homepage FAQ" in Cmd-K returns the action *plus* the clause: *"clause 2: Never publish content that contradicts the Truth File."* The constitution is invoked at the moment of search. This is uncopyable.

**Print-the-Brief shortcut (F27) — `Cmd-Shift-P`.** When the Brief is signed, the shortcut becomes available globally; the user can print the Brief at any time, not just at end-of-onboarding. Standard browser print sheet, cream paper editorial register (the print stylesheet enforces this — Geist Mono date stamp, Fraunces clause text, Seal letterpress at top). Yossi prints one per client and pins it. Free evangelism artifact.

**Mobile fallback.** Touch devices get a bottom-sheet "Actions" drawer that surfaces the same actions a keyboard surface would. Long-press on any list row opens the action sheet (Approve / Reject / Modify / Open / Note / Cancel). The `?` overlay becomes a "Shortcuts" tab in /settings on mobile — informational, since the actions don't apply.

---

## §3 — Density vs whitespace (the compact mode spec)

v1 said /inbox cozy rows are loose at 112px and proposed cutting to 72px. v2 commits the spec.

**The principle:** density-as-respect. Yossi (12-client agency) drowns in current spacing; Sarah (single SMB) reads better with breath. Two defaults, one toggle.

**Three pages get a compact toggle:** /inbox, /scans, /crew. Other surfaces (/home, /workspace, Brief, Monthly Update PDF, /security, /reports detail) stay at editorial spacing — those are artifact surfaces; density doesn't apply.

**Compact spec table:**

| Surface | Cozy default | Compact toggle | Trigger |
|---|---|---|---|
| /inbox row | 72px (down from 112 in v1 proposal — accept Round 1) | 40px | per-page toggle in topbar; default compact for users with ≥2 clients |
| /scans row | 44px (locked) | 32px | per-page toggle |
| /crew row | 64px (locked) | 48px | per-page toggle |

**Compact mode spec — what changes:**

1. **Row height reduces by ~33%.** /inbox 72 → 40; /scans 44 → 32; /crew 64 → 48.
2. **Type size shifts down one stop.** Headlines: 14px Inter 500 → 13px. Captions: 12px → 11px. Geist Mono numbers stay tabular for column alignment.
3. **Agent name labels (per Round 1 #25 Kare-refinement) replace monograms on rows.** Compact mode is where this rule earns its keep — 13px Inter 500 agent name, no monogram, no color block, no avatar.
4. **Diff previews collapse to hover-only.** /inbox compact shows headline + agent name + tier badge + date only; the diff renders in the preview pane on row focus.
5. **Margin column is already cut from product chrome (Round 1 lock); compact mode doesn't need to handle it.**
6. **Visible shortcut hints move from per-row to focused-row only.** Cozy mode shows `Press e` on every row; compact shows it only on the focused row, in 10px Geist Mono.
7. **Status pills shrink from 22px → 16px tall**, 10px caps Inter 500 (down from 11px). Single-word vocabulary lock makes this work — see §6.

**Toggle UI.** Top-right of the page header, 28px-tall icon button: two horizontal lines (cozy) or four (compact). 11px Geist Mono caption "Compact" appears on hover. Persists per-page in localStorage. No setting buried in /settings — local toggle, instant feedback. Linear's pattern.

**The Yossi-default rule.** Any user with ≥2 clients in their workspace defaults to compact on /inbox + /scans + /crew. Single-client users default to cozy. This is the "density-as-respect" principle in code: the system reads who the user is and ships the right default. The user can override; most won't.

**What density does NOT apply to.** The cream-paper register surfaces (Brief, /security, Monthly Update PDF, the Decision Card on /home, the Workflow Builder Brief grounding cell) stay at full editorial spacing forever. Those are artifacts, not lists. Compressing them breaks the register. **This is a feature, not a limitation — the cream-paper surfaces feel like reading a book; the white-utility surfaces feel like operating a workshop.** The toggle changes the workshop, not the book.

---

## §4 — Dark mode pressure-test

v1 made the case for parity-from-day-one. v2 commits the spec: **ship dark mode for 6 admin-utility surfaces at MVP+30 days; cream-register surfaces stay light-only forever.**

This is not a deferral. It is a **register decision**. The cream paper carries emotional weight; dark mode breaks that weight. So dark mode is the workshop view; cream is the library view. Yossi at 11pm on his second monitor gets the workshop. Sarah at 8am gets either.

**Surfaces that ship dark at MVP+30:**
1. /home (the score number, Ring, sparklines, Crew at Work strip — all utility chrome)
2. /inbox (lists are utility)
3. /scans (table is utility)
4. /crew (lists are utility)
5. /workspace (execution canvas is utility)
6. Workflow Builder canvas (Round 1 cut the dot grid; in dark mode it becomes flat `--color-paper-dark` = #0E0F12)

**Surfaces that stay light-only forever (this is canon, not a backlog item):**
1. The Brief — cream paper, Fraunces 300 italic, signed
2. /security — cream paper register (Round 1 kept; defended by Ive + Tufte)
3. The Workflow Builder Brief grounding cell (Design Lock B, Round 1)
4. The Decision Card on /home — cream paper inset within otherwise-dark page (this is the only mixed-register surface; the cream card stays cream even when /home is dark)
5. Monthly Update PDF — cream paper, always
6. Monday Digest email — cream paper header strip
7. /changelog (see §5)
8. The "Receipt That Prints" card (F25) — cream paper, even when /home is dark

**The Decision Card mixed-register rule** is the load-bearing detail. /home in dark = `--color-paper-dark` background, ink-1-dark text, Ring at brightened brand-blue (`#5A8FFF` per CLAUDE.md). The Decision Card sits on cream paper inset with a 1px dark-mode border and subtle drop shadow. **This is exactly the "glass case in a wood-panelled room" Ive defended on /security** — except now the room is the workshop and the case is the constitution. The register-shift gets sharper in dark mode, not softer.

**Token additions needed (12 tokens):**

| Token | Light value | Dark value |
|---|---|---|
| `--color-paper-dark` | #FFFFFF | #0E0F12 |
| `--color-paper-elev-dark` | #F7F7F7 | #15171C |
| `--color-ink-1-dark` | #0A0A0A | #F2F3F5 |
| `--color-ink-2-dark` | #404040 | #C8CBD0 |
| `--color-ink-3-dark` | #6B7280 | #8C9098 |
| `--color-ink-4-dark` | #9CA3AF | #5A5E66 |
| `--color-border-dark` | rgba(10,10,10,0.06) | rgba(255,255,255,0.08) |
| `--color-border-strong-dark` | rgba(10,10,10,0.12) | rgba(255,255,255,0.14) |
| `--color-brand-dark` | #3370FF | #5A8FFF |
| `--color-score-good-dark` | #10B981 | #1FCB91 (lifted +12% saturation) |
| `--color-score-fair-dark` | #F59E0B | #FBB83A |
| `--color-score-critical-dark` | #EF4444 | #FF5C5C |

The Round 1 lock that borders are opacity values (not hex) means most of the design system *already swaps automatically*. The 12 tokens above are the ones that need explicit dark values.

**The 18 agent colors at 12px on dark.** This is the test that hasn't been run yet. The Round 1 lock locked all 18 colors at 12px on cream paper; dark mode is the second test. Of the 18 agent colors, the ones at risk in dark mode are: any color below 30% lightness (Schema Doctor's deep blue, Citation Fixer's forest green) — they'll lose contrast against `#0E0F12`. **Lock revised dark-mode versions of those 4-6 colors before MVP+30.** Not all 18 need a separate dark value; only the dark ones do. The bright colors (Content Refresher's amber, Competitor Watch's orange) read fine on either.

**The toggle.** Top-right of /settings, three-state (Light / Dark / System). System = follows OS preference. Default to System. The toggle persists in user_preferences (synced across devices via Supabase) and is read on first paint via cookie (no flash-of-light when the user prefers dark).

**The /changelog screenshot rule.** Every changelog entry that includes a screenshot must include both modes — light first (cream artifact register), dark second (utility register). Linear does this; it's the trust artifact for "we ship parity, not a port."

---

## §5 — The /changelog (editorial voice + first-month entries)

v1 made the case. v2 commits the spec.

**The route:** `/changelog` (public, indexable, RSS-feeded). Each entry at `/changelog/[slug]`.

**The grammar.** Editorial Artifact register (cream paper, Fraunces 300 italic for the headline, Inter 400 ink-2 for body, Geist Mono for the date stamp and version number — same as the Brief). One hand-drawn Rough.js illustration per entry, deterministic seed per entry slug. Beamix Seal at the bottom of every entry. 720px reading column. Voice canon Model B applies — externally signed "— Beamix" only; the agent's name appears in the *body* of an entry only if the agent is the subject of the entry ("FAQ Agent now reads Truth File `never_say` array on every run").

**The cadence.** Weekly. Every Monday morning, Beamix ships a changelog post — the companion artifact to the Monday Digest email. The email links to the post.

**The reading-time signal.** Top of every entry, 11px Geist Mono ink-3: `2 min read · April 28, 2026 · v1.4.2`. Linear's pattern. Sets the contract.

**The four-section template (every entry):**
1. **What shipped this week** — 2–4 sentences. Plain language. No marketing voice; no exclamation points; no "we're excited to."
2. **Agent updates** — bullet list of which agents got new capabilities. Each bullet 1 sentence.
3. **Brief grounding refinements** — when the Claude Haiku clause-matcher gets retrained, the post documents which clause patterns improved.
4. **What we considered and didn't ship** — Rams' "what Beamix did not do" idea, transplanted from the Monthly Update to the changelog. Honesty as moat.

**The OG card.** Same Editorial register, headline in Fraunces 300, deterministic Rough.js illustration, Seal in bottom-right. Every changelog post is a tweet-ready image. Same React component as the Monthly Update PDF cover page, different props.

**First-month entries (sample — to give the build team a concrete target):**

### Entry 1 — "Beamix ships." (launch week)
> *2 min read · v1.0.0*
>
> This is the first changelog. Beamix is now generally available. Before today, it was a private beta with 28 customers; now it is a product anyone can sign up for. The work we shipped this week was the work of cutting the rough edges off four months of building.
>
> **Agent updates.** All eleven agents are live. FAQ Agent reads your Truth File on every run; Schema Doctor checks the published version against the proposed change before applying; Citation Fixer asks before edit, never after.
>
> **Brief grounding.** Every action carries a citation back to the clause in your Brief that authorized it. Click the citation to read the clause; click the clause to edit the Brief.
>
> **What we considered and didn't ship.** A "skip onboarding" button. We considered it for two weeks. We decided that onboarding is the moment Beamix earns the customer's signature; skipping it is signing without reading. Beamix does not offer it.
>
> — Beamix

### Entry 2 — "The Cycle-Close Bell."
> *3 min read · v1.0.4*
>
> When the weekly scan completes and all auto-fixes have shipped, the Activity Ring on /home closes its 30° gap, holds for half a second, and re-opens. This is the Cycle-Close Bell. It happens once a week, on Monday morning. We built it because the work of GEO is week-shaped, not minute-shaped, and the system that does it should signal the close of a week. It is the one ceremony Beamix carries.
>
> **Agent updates.** Citation Fixer learned to handle hreflang variants; Content Refresher now waits 48 hours after a publish before suggesting an edit, instead of 12.
>
> **Brief grounding.** A new clause pattern: "never publish on weekends" — recognized and respected.
>
> **What we considered and didn't ship.** A daily cycle-close. We tried it for a week internally; it felt frantic. The work is not daily-shaped. We cut it.
>
> — Beamix

### Entry 3 — "What Beamix did not do this month."
> *4 min read · v1.0.7*
>
> We've started publishing the Monthly Update to a public archive (with customer permission). One section of the Update — the new one — lists what Beamix considered and declined. This is also the section we're surfacing on the changelog as a recurring beat. The discipline of saying no is more important than the work of saying yes.
>
> This month: 14 changes considered, 6 rejected. Two were rejected because the Truth File said the customer didn't sell that product. Three because the Brief said never publish without a human on Fridays. One because the change would have contradicted a sentence the customer's CEO said in a podcast interview last quarter — Beamix found the transcript, read the sentence, and refused.
>
> **Agent updates.** None this week — we cut a release to focus on the discipline of the system over the surface area.
>
> **Brief grounding.** No retraining this week.
>
> **What we considered and didn't ship.** A "force apply" override on the Brief. We discussed it; we will not build it. The Brief is not a suggestion.
>
> — Beamix

### Entry 4 — "Dark mode."
> *3 min read · v1.1.0*
>
> /home, /inbox, /scans, /crew, /workspace, and the Workflow Builder canvas now ship in dark mode. The Brief, /security, the Monthly Update PDF, the Monday Digest, and the Decision Card on /home stay on cream paper — these are artifact surfaces, and cream is what an artifact reads in. The workshop runs in dark; the library reads on cream. The toggle is in /settings; the default is your operating system's preference.
>
> **Agent updates.** Schema Doctor's color in dark mode is brighter; the deep blue we shipped at light didn't pass legibility at 12px on a near-black background. The fix is one token.
>
> **Brief grounding.** No retraining this week.
>
> **What we considered and didn't ship.** Dark mode for the Brief. We tried it; the cream-on-light register is what makes the constitution feel constitutional. Dark mode would have made it feel like a settings panel.
>
> — Beamix

**Strategic effect.** The /changelog is the public proof of category leadership. It is the trust artifact procurement teams cite ("they ship every week and document it"). It is the OG card factory for organic growth. Pairs with the State of AI Search annual report Beamix publishes (per the marketing Round 1 conversations).

**Cost.** One writer-day per week (Adam writes the first 12, then a content lead). One template route. One CMS table. The OG card is a reuse of the Monthly Update PDF's React component. Total build: ~3 person-days.

---

## §6 — Status vocabulary lock

Beamix has accumulated the synonym sprawl Linear restraint would refuse. Walk the surfaces:

**/inbox tabs:** Pending · Drafts · Live · Auto-applied
**/scans status:** Healthy · Slipping · Critical (good — terse)
**/crew agent status:** Active · Paused · Cancelled (sprawl risk — see below)
**Action states elsewhere in the spec corpus:** Cited · Not cited · Approved · Rejected · Modified · Drafting · Published · Running · Idle · Awaiting input · NeedsYou · Acting · Healthy

The sprawl candidates:
- **Active vs Live vs Running vs Acting** — four words for one state ("the agent is currently doing something")
- **Pending vs Drafting vs Awaiting input** — three words for "needs human"
- **Cancelled vs Paused vs Rejected** — three words covering different but overlapping stops

**The lock (Linear-grade single-word vocabulary):**

| Canonical word | Use for | Banned synonyms |
|---|---|---|
| **Acting** | Any agent currently working — inbox row, /workspace step, /crew, topbar status | Active, Live, Running, Working, In progress, Drafting |
| **Pending** | Item awaiting human review in /inbox | Awaiting, Drafting (when agent has finished), In review, Open |
| **Drafting** | Reserved exclusively for: agent composing output before submission to /inbox (visible only on /workspace) | (none — used only here) |
| **Live** | Item approved + applied + confirmed by downstream pipeline | Published, Shipped, Applied, Active, Done |
| **Auto-applied** | Item applied without human review (auto-tier-of-trust) | Auto-published, Self-applied, Approved-no-review |
| **Approved** | Used only at the moment of authorship (toast: "5 approved · Undo all") | Accepted, Confirmed, Signed off |
| **Rejected** | Item the human declined | Declined, Denied, Cancelled (when human-driven) |
| **Cancelled** | Item the system stopped (rare — rate limits, conflicts) | Aborted, Killed, Stopped |
| **Paused** | Workflow / schedule the human paused | (none — distinct from Cancelled) |
| **Healthy** | /home + /scans top-level status (good) | Green, OK, Fine, Stable, Good |
| **Slipping** | /scans + /home middle status | Declining, Degrading, At risk, Yellow |
| **Critical** | /scans + /home worst status | Red, Failing, Bad, Down |
| **NeedsYou** | StatusToken state — review-debt active | NeedsAttention, ActionRequired, Urgent, Pending review |
| **Cited** | Engine result — business mentioned in answer | Mentioned, Found, Visible |
| **Not cited** | Engine result — business absent from answer | Missing, Absent, Skipped, Empty |

**The vocabulary-shrink moves:**
1. **Kill "Active" everywhere.** Replace with **Acting** (agent doing) or **Live** (item shipped). Currently /crew uses "Active" for both — this is the worst kind of synonym sprawl.
2. **Kill "Running."** Use **Acting**.
3. **Kill "Awaiting input"** as a phrase. Use **Pending** or **NeedsYou**.
4. **Kill "Drafting" outside /workspace.** /inbox tab "Drafts" is a borderline case — defensible because it refers to a distinct lifecycle stage (the agent has output but hasn't submitted to /inbox yet); keep, but treat as a singular term.
5. **Kill "Stable," "Good," "Green"** as status words anywhere. Use **Healthy**.

**Status pill design (Linear's tiny pills).** Pills are 16px tall in compact mode, 22px in cozy. **11px Inter 500 caps with 0.04em tracking, single word, color-coded background at 12% opacity, color-matched text at 100%.** Beamix's current pills run 24-28px tall and contain phrases like "Awaiting your input" — that's two violations of Linear restraint. **Lock: every status pill is one word. If it can't be one word, the state is wrong, not the pill.**

**One pill, one word, one color.** Document this as a design system canon at §4.1 (StatusToken) and §6 (status word table). Banned synonyms list goes in the design system glossary so future contributors can find it.

---

## §7 — Cmd-K command bar (the unified hub)

v1 made the case for Cmd-K as the universal switcher. v2 commits the spec.

**The principle.** Linear's Cmd-K is the universal nav. It routes to issues, projects, settings, actions, search, *everything*. Beamix's spec splits Cmd-K (workspace switcher) from a deferred Cmd-P (global actions). **This is wrong.** Ship Cmd-K as the single command surface from MVP. Cmd-P does not exist.

**Architecture.**
- One palette, one shortcut, four sections in priority order.
- 640px wide, centered, opens in 80ms cold / 40ms warm.
- Search input at top (auto-focused on open).
- Results below in sectioned groups.
- Each result row: 40px tall, icon (or 16×16 monogram for agents) + label + right-aligned shortcut hint or Brief grounding citation.
- Esc closes; Enter opens; arrow keys navigate; Cmd-1 through Cmd-9 jump to first 9 results.

**The four sections (in order):**

**1. Workspace switch (when ≥2 clients connected)**
- Top of palette. Each client = one row: 16×16 client logo + client name + domain in 11px Geist Mono.
- Pinned clients first (Cmd-1 through Cmd-9 hint); recent below.
- Pressing Enter switches workspace and routes to the new client's /home.
- Cold-switch budget: 600ms end-to-end (v1's correction to the spec's 1100ms).

**2. Navigate**
- Each top-level page: Home, Inbox, Scans, Workspace, Crew, Competitors, Reports, Settings.
- Each row shows the `g _` shortcut on the right (`g h`, `g i`, etc.).
- Brief and Truth File appear here too: `g b` Brief, "Open Truth File."

**3. Actions**
- Run scan now
- Approve all safe items in /inbox
- Open Brief
- Trigger workflow (sub-search opens for which workflow)
- Add client (workspace admin only)
- Edit Truth File
- Print the Brief (`Cmd-Shift-P`)
- Open Monthly Update (latest)
- Toggle dark mode
- Toggle compact mode
- Each action row shows the keyboard shortcut on the right when one exists.

**4. Recent**
- Last 5 items the user touched (rows from /inbox, scans from /scans, workflow nodes, recommendations).
- Each row carries the Brief grounding citation in 11px Inter italic right-aligned ink-3 — *the constitution is invoked at the moment of search*. This is Rams' structural commitment carried into the search surface. Uncopyable.

**5. Help (last section, low priority)**
- "Show all keyboard shortcuts" — opens the `?` overlay.
- "What's new" — opens latest /changelog entry.
- "Contact support" — opens support chat (only present at `Build` and `Scale` tiers).

**Search behavior.**
- Fuzzy match across: page names, agent names, recommendation titles, scan IDs, Brief clauses, Twilio numbers (when relevant), sub-processor names, settings labels.
- Client-side, no debounce, no spinner. Results update as you type.
- Empty query: shows Recent + Navigate (top 8 rows total).
- Search latency target: <40ms warm (in-memory index), <100ms cold (first open of session).

**The Brief-grounding-in-search detail.** Every result row that maps to an agent action carries the authorizing Brief clause as right-aligned 11px Inter italic ink-3. Searching "approve homepage" returns the action plus *"clause 2: Never publish content that contradicts the Truth File."* Linear shows shortcut hints on the right; Beamix shows shortcuts *and* clause citations. The brand becomes the search.

**The "i for inbox" pattern.** Cmd-K then a single character routes to that surface — Cmd-K → `i` → Enter goes to /inbox. This works because Navigate is the second section; the single character matches "Inbox" with high enough confidence that it's the top result. Linear users do this hundreds of times a day.

**Mobile.** No Cmd-K. Tap the global search icon in the topbar; same palette, full-screen instead of modal-centered. Keyboard becomes touch (no shortcut hints visible — they don't apply on touch). The Brief grounding citations stay visible.

**Build cost.** ~5 person-days for the palette + search index + workspace switch wiring. The search index is Supabase Realtime-backed for client list, a static manifest for navigate/actions, an in-memory ring for recent. The Brief grounding citations are the same renderer as F30; reuse it.

---

## §8 — The 5–7 highest-leverage cuts/adds Karri would push hardest

Through the Linear lens, the moves that move the most product:

**1. Ship Cmd-K as the universal palette at MVP, not deferred to MVP-1.5.** Kill Cmd-P from the spec. Cmd-K does it all. With Brief grounding citations on every result row, this becomes the single most uncopyable surface in the product. *Build cost: ~5 person-days. Strategic effect: keyboard-first credibility from day one.*

**2. Ship `g _` two-keystroke navigation on every surface at MVP.** Six lines of code per page. The single change that turns Beamix from "decent SaaS" to "Linear-grade tool." *Build cost: <1 person-day. Strategic effect: Yossi never mouses to the topbar nav again.*

**3. Ship dark mode for the 6 utility surfaces at MVP+30, not deferred indefinitely.** The token system is already structured for the swap (opacity-based borders are correct). Lock the 12 dark tokens, test the 18 agent colors at 12px on dark, screenshot every changelog entry in both modes. *Build cost: ~7 person-days (most of it is testing, not building). Strategic effect: kills the Yossi-archetype 2-star G2 review.*

**4. Ship /changelog at MVP, weekly cadence, cream-paper editorial register.** Pair it with the Monday Digest email. First 12 entries written by Adam. The OG card factory + trust artifact + organic growth flywheel in one surface. *Build cost: ~3 person-days. Strategic effect: the public proof of category leadership.*

**5. Lock the status vocabulary now, before MVP code lands.** Twelve canonical words; banned synonyms documented; one-word pill design enforced. *Build cost: <1 person-day (it's a doc + a lint rule). Strategic effect: the entire product reads in one voice.*

**6. Ship compact mode toggle on /inbox, /scans, /crew at MVP.** Default compact for users with ≥2 clients (Yossi), cozy for single-client (Sarah). Density-as-respect; 22-40% more rows above the fold for power users. *Build cost: ~2 person-days. Strategic effect: Yossi feels respected, not coddled.*

**7. Make the /home boot budget a CI gate.** Playwright trace test that fails the build if /home boot exceeds 100ms warm / 400ms cold. Linear's discipline is mechanical: speed is a CI gate, not a polish item. *Build cost: ~2 person-days. Strategic effect: speed is the credibility; CI is the enforcement.*

The combined cost is ~21 person-days for the seven moves. With a 2-week MVP sprint and an agent army, this is shippable. The combined effect is that Beamix at MVP feels indistinguishable from Linear in the dimensions Linear cares about most.

---

## If I could only ship 3 of these at MVP

If Adam said "pick three, not seven," I'd pick **Cmd-K with Brief grounding citations**, **/changelog with weekly cadence**, and **the speed CI gate for /home boot**. The first is the keyboard-first credibility surface that turns Yossi into a fanatic and that nobody else in the GEO category will ship for a year. The second is the public editorial spine that makes Beamix's discipline visible to procurement, to Twitter, and to the customer who screenshots every entry; it pairs with the Monday Digest and becomes the OG card factory for organic growth. The third is the load-bearing rule under everything else — if /home is fast, Beamix feels like Linear; if /home is slow, no amount of Fraunces italic on cream paper saves it. Speed is the credibility; Cmd-K is the keyboard-first proof; /changelog is the public artifact. The other four (g_ nav, dark mode, compact mode, status lock) are downstream of these three — they get ten times easier to ship once the discipline is in place. Pick the three that set the discipline; the rest follow.

— Karri
