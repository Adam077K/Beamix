---
page: /builder (Workflow / Agent Builder — Console Spine, Batch 3)
states_audited:
  - populated-desktop.png (success state, demo user, seeded "Monthly FAQ Refresh" workflow)
states_missing:
  - empty-desktop (template gallery — the real-user first-run; NOT captured)
  - error-desktop (flagged QA node + recovery banner; NOT captured)
  - dry-run overlay (the declared "signature moment"; NOT captured)
  - sheets view (NOT captured)
  - mobile-375 (NOT captured)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.38.57 AM.png (Answer Engine Insights — asymmetric chart + ranked rail; the analytics craft bar)
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png (110 prompts dense data table — mono numbers, tight rhythm)
  - otterly-Screenshot 2026-06-12 at 10.44.39 AM.png (brand-ranking split-pane onboarding)
  - Profound-Screenshot 2026-06-12 at 10.38.10 AM.png (split-pane region step — restrained chrome)
verdict: NEEDS_WORK
source_root: apps/web/src/app/(protected)/builder/
audited: 2026-06-12
---

# builder — UI Excellence Audit

## Screenshots
- [populated-desktop.png](./screenshots/builder/populated-desktop.png) — the ONLY state captured (success / demo user)

> Coverage gap: 1 of 6 meaningful states captured. The page's own header docstring (`page.tsx:18`) names the **dry-run ledger overlay** as "the ONE signature moment," and `BuilderSurface.tsx:83` makes the **template gallery the real empty/first-run state** — neither was screenshotted. The error banner + flagged-node state, the Sheets view, and mobile are also un-captured. Findings below are scoped to what is visible; the verdict cannot be raised above NEEDS_WORK until those states are seen.

## Verdict
**NEEDS_WORK.** Against the competitor bar this is mid-tier: the chrome is clean and on-palette and the blue=structure / violet=agents law is correctly applied (trigger node blue, agent nodes violet, no violet on a button), which is genuinely good. But the canvas — the declared TIER-1 focal — is a **dead-center vertical spine of five near-identical violet cards floating in a wide empty grid** (CRAFT tells #2 + #5 in the single most prominent zone), and roughly half the visible width is dead negative space with no information in it. Profound never lets its primary surface read as a centered stack in a void: it pairs a dominant left zone with a working right rail so the eye always has a weighted composition. Until the canvas earns its width and the spine stops reading as a generic flow-chart template, this sits clearly below the Profound/Otterly bar.

---

## P1 — must fix (looks AI / broken)

### P1-1 — The canvas is a dead-center vertical spine in a void (tell #5 + tell #2, the worst thing on the page)
The whole node graph is laid out on a **single centered 360px column** (`node-vocab.ts:67` `layoutSpine` centers a 320px node within a 360px content box) which is itself `mx-auto`-centered inside the full-width canvas (`WorkflowCanvas.tsx:73`). In the screenshot the trigger + 5 nodes sit as a narrow ribbon down the dead center, with ~360px of empty dotted grid on the LEFT and ~360px on the RIGHT carrying zero information. This is the textbook AI tell #5 (dead-center symmetry / full-width void) and, because the five agent cards are the same width, same height (96px, `node-vocab.ts:49`), same violet ground, same 3px violet lip and same internal layout, it is also tell #2 (N-equal stack). A real composition tool (and Profound's analytics canvas, ref 10.38.57) never floats its primary content as a centered column in emptiness — it weights one side and fills the rail.
- **Why it reads AI/broken vs ref:** Profound's primary surface = dominant chart (left, ~60%) + ranked-asset rail (right, ~40%); the composition is intentionally asymmetric and every pixel of width does work. Here, half the surface is decorative dotted nothing and the content is a symmetric stack.
- **Fix (M3 + M1):** Break the symmetry. Either (a) left-align the spine and use the freed right ~40% as a persistent inspector/rail (node config, run summary, est. cost) so the width is earned, or (b) make the dry-run ledger / a "what this run produces" panel a permanent right rail at rest instead of an on-demand overlay. The canvas should never render as a centered ribbon in a void. Pair with M1 inside the spine (below).
- **File:line:** `_components/node-vocab.ts:67` (`layoutSpine` centering), `_components/WorkflowCanvas.tsx:72-75` (`mx-auto` content box, `width: CONTENT_WIDTH`), `BuilderSurface.tsx:172-204` (canvas occupies full `flex-1` with no rail at rest).

### P1-2 — Five equal-weight agent nodes: no hierarchy, nothing commands (tell #2 + tell #3, missing M1)
Every agent node is the identical card: `bg-agent-tint`, 3px `#6E56F0` top lip, 320×96, eyebrow + label + `~N steps`. There is no TIER-1 focal **within** the focal — PLAN, RESEARCH, DO, QA, SUMMARISE all read at exactly the same volume even though "DO — generate FAQ schema blocks (~4 steps)" is the workflow's center of gravity. The rubric (M1) demands felt tiers and "never two hero cards"; here there are five co-equal cards and zero hero.
- **Why it reads AI/broken vs ref:** Otterly's brand-ranking rail (ref 10.44.39) and Profound's asset list both let the #1 / owned row dominate; weight communicates importance. A flat equal stack is the canonical "AI generated this flowchart" look.
- **Fix (M1 + M7):** Let the highest-cost / longest node read as the dominant card — larger, `--shadow-card-hero`, the step-count figure promoted to a bigger Geist Mono number — while the 1-step nodes (`~1 step` plan/qa/summarise) recede toward `.card-inset` weight. The eye should land on DO first.
- **File:line:** `_components/WorkflowCanvas.tsx:182-243` (`AgentNode` — single uniform style), `_components/node-vocab.ts:30-36` (every type same stepHint treatment), `_components/node-vocab.ts:49` (`NODE_H = 96` fixed for all).

### P1-3 — The declared signature moment and the real empty state were never rendered/verified
`page.tsx:18` and `BuilderSurface.tsx:206-217` declare the **dry-run ledger overlay** as "the ONE signature moment," and `BuilderSurface.tsx:83-98` makes the **template gallery** the real-user empty/first-run surface. Neither is in the screenshot set. "Designed on mock data, nobody has seen it rendered" is exactly the risk here: the signature animation (`DryRunLedger.tsx:59-72`, a 650ms-per-row stream) and the two-tier empty (M8) are unverified. A builder whose headline differentiator (honest dry-run before spending a credit) has never been seen rendered cannot pass.
- **Why it matters vs ref:** Profound/Otterly invest their best craft in the moment of value (the chart reveal, the ranking table). If Beamix's equivalent moment is broken or flat at render, the page fails its own thesis.
- **Fix:** Capture and re-audit `?state=empty` (gallery), `?state=error` (flagged node + recovery banner), the dry-run overlay (click "Dry run"), Sheets view, and mobile 375 before any PASS. Verify the 650ms stagger respects `prefers-reduced-motion` (code path exists at `DryRunLedger.tsx:60-63` — confirm visually).
- **File:line:** `page.tsx:37-43` (state override), `_components/DryRunLedger.tsx:59-72`, `_components/TemplateGallery.tsx`.

---

## P2 — substantive

### P2-1 — The violet node top-accent renders as a heavy rounded "bookmark lip," not a crisp accent
The 3px violet bar is `absolute inset-x-0 top-0` over a `card-console` with the card's corner radius (`WorkflowCanvas.tsx:214-218`). In the screenshot it reads as a thick, slightly clumsy rounded tab capping each card rather than the intended clean spatial signal — and because it repeats five times identically it amplifies the equal-stack tell. The radius mismatch (square-ish accent vs rounded card) is the kind of detail that reads unfinished.
- **Fix (M6):** Either inset the accent so it follows the card radius cleanly, or replace the top-lip with the violet **ground + left hairline** the rubric prefers (M6: `rgba(110,86,240,0.12)` hairline) so the agent zone reads spatial without five loud caps. Keep violet off any clickable affordance (already correct).
- **File:line:** `_components/WorkflowCanvas.tsx:214-218`.

### P2-2 — Edges are nearly invisible; the graph barely reads as connected
Edge paths stroke at `#E5E7EB` 1.5px (`WorkflowCanvas.tsx:147`) — against the white canvas with a `#EAEAEA` dotted grid this is so low-contrast the connectors almost vanish in the screenshot, and the arrow markers (`#D1D5DB`, `node-vocab.ts`-driven `builder-arrow`) are imperceptible at this zoom. A flow tool whose flow lines don't read undercuts the entire spatial metaphor.
- **Fix (M12 / signature):** Raise edge contrast (e.g. `#CBD2DC` or a faint violet `rgba(110,86,240,0.35)` to tie agents together as one pipeline), and consider a subtle directional gradient or a slightly thicker active-path. The connection is the product story; make it legible.
- **File:line:** `_components/WorkflowCanvas.tsx:139-151` (`EdgeLine` stroke), `_components/WorkflowCanvas.tsx:92` (arrow fill).

### P2-3 — No STEP-1 hero figure; the page has almost no Geist Mono "truth"
The only mono on the visible surface is `saved 12:04` (12px, `BuilderSurface.tsx:115`) and the per-node `~N steps`. For a composition tool the honest-cost number IS the truth that should command — but the **estimated total cost / total step count is hidden until you open the dry-run overlay** (`BuilderSurface.tsx:242-245`, `DryRunLedger.tsx:139`). At rest the page never shows the user what this workflow costs or how many steps it is. That is both a craft gap (M2 STEP-1 absent, M11) and a product gap.
- **Fix (M2 + M11):** Surface a resting summary near the header or in the proposed rail — total steps + estimated cost in large Geist Mono tabular-nums — so the page has one commanding figure and the cost is honest before the modal. This also gives the asymmetric rail (P1-1) real content.
- **File:line:** `BuilderSurface.tsx:104-140` (header has no figure), `_components/builder` (no resting cost summary).

### P2-4 — "Set a schedule — runs manually for now" reads like a disabled/coming-soon tease
The schedule strip (`BuilderSurface.tsx:158-167`) is a real button styled as `.card-inset` with a hover border, but the trailing "— runs manually for now" in `#9CA3AF` reads as a "not built yet" disclaimer rather than a confident affordance. It sits in the top-right where Profound puts real controls (Chart Config, Export). The brand law bans "Coming Wave 1" language; this is adjacent to that smell.
- **Fix:** Either make it a genuine action (opens a schedule panel) with confident copy, or demote it to a quiet inline note. Don't let a primary-row control hedge.
- **File:line:** `_components/BuilderSurface.tsx:158-167`.

### P2-5 — Search bar in the global top chrome is empty and purposeless on this page
The top-left "Search" pill (global chrome, visible top of screenshot) is a flat `#F7F7F7` placeholder with no scope or shortcut hint. Against Profound's `⌘K`-hinted search it reads as an unfinished stub. (Shared chrome, not builder-owned — flag to the shell owner.)
- **Fix:** Add a `⌘K` affordance + scope, or remove from this surface. Route to the app-shell component.

---

## P3 — nice-to-have

### P3-1 — No entrance choreography visible on the canvas (tell #7)
The dry-run column uses `craft-enter craft-enter-1` (`BuilderSurface.tsx:208`) but the canvas + nodes paint flat with no priority fade-up (M9). For the resting page this is acceptable-minimal, but a single ~40ms-stagger fade-up of the spine on first paint would lift it from "static" to "intentional-minimal."
- **File:line:** `_components/WorkflowCanvas.tsx:116-129` (nodes render with no stagger).

### P3-2 — Hover lift exists but is the only node interaction signal
Nodes `hover:-translate-y-[1px]` (`WorkflowCanvas.tsx:205`) — good — but there's no hover ground/shadow notch (M9 "hover lifts one shadow notch"). Minor.
- **File:line:** `_components/WorkflowCanvas.tsx:203-211`.

### P3-3 — One Fraunces beat is correctly placed (preserve)
`h1` workflow name is Fraunces italic 28/30px (`BuilderSurface.tsx:110-112`) — exactly one serif beat, on the verdict/name word, not in chrome. This is correct M5; do not let polish spread Fraunces into labels or buttons.

---

## Per-state notes

### Populated (success) — the only state seen
- Strengths to preserve: correct blue=structure (trigger node blue accent, `WorkflowCanvas.tsx:160-167`) / violet=agents split; violet never on a button; one Fraunces beat correctly on the title; clean on-palette chrome; tabs + run/dry-run controls well placed top-right like the refs.
- Failures: dead-center spine in a void (P1-1), five equal-weight nodes / no focal (P1-2), invisible edges (P2-2), no resting cost figure (P2-3), heavy violet lip (P2-1).

### Empty (template gallery) — NOT captured
- `BuilderSurface.tsx:83-98` renders a `max-w-[1100px]` PageHeader + `TemplateGallery`. This IS the real-user first impression and the M8 two-tier-empty test. Unverified — must be screenshotted and audited before PASS.

### Error — NOT captured
- `BuilderSurface.tsx:197-203` shows a recovery banner ("QA step needs a target brand…") + a `#DC2626` ring on node index 3. M8 requires errors name a real recovery — the copy does, but the rendered treatment (red ring on a violet card, banner as a floating pill) is unverified.

### Dry-run overlay (signature) — NOT captured
- `DryRunLedger.tsx` streams rows at 650ms each over a dimmed/blurred canvas. The single most important moment on the page; rendering + reduced-motion fallback unverified.

### Mobile (375) — NOT captured
- The canvas content box is a fixed 320px node in a 360px column inside a `max-w-[1280px]` flex (`BuilderSurface.tsx:103`). At 375px the node (320px) barely fits and the schedule strip + header controls (`flex-wrap`) and the canvas `overflow-auto` need verification for horizontal scroll / clipping. Unverified.
