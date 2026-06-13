---
doc: WF-5 UI Excellence Audit — Systemic Synthesis + Polish Plan
date: 2026-06-12
inputs: 8 per-page audits (approvals, digests, traceability, discovery, scan-free, onboarding-post-payment, login, signup)
verdict_rollup:
  CRITICAL_ISSUES: [approvals, digests, traceability, discovery]
  NEEDS_WORK: [scan-free, onboarding-post-payment, login, signup]
---

# WF-5 UI Excellence Audit — Synthesis

Eight surfaces were audited against the Profound/Otterly competitor bar and the CRAFT-SYSTEM rubric (tells #1-#8, moves M1-M12). Four are CRITICAL_ISSUES, four are NEEDS_WORK. The failures are not random — they cluster into a handful of systemic patterns driven by shared components, shared layout habits, and missing global tokens. Fixing the systemic roots cascades across most pages.

---

## 1. SYSTEMIC PATTERNS (fix once → cascades)

### S1 — "Dead-center / centered-single-column in a void" (tell #5) — the dominant failure
Six of eight pages float their content in a centered column or a dead-center card with vast empty gutters, instead of an asymmetric frame-filling layout.
- approvals (error block centered, ~600px dead vertical), traceability (`max-w-6xl` single column, ~55% dead canvas), digests (`max-w-6xl`, ~45% dead right gutter), scan-free (`max-w-3xl` centered stack in 1440 viewport), onboarding-post-payment (single card in ~70% white void), login/signup (centered card in cold empty canvas).
- Root habit: pages reach for `max-w-Nxl` + single-column `space-y-N` instead of a `[1fr_rail]` split. There is no shared layout primitive enforcing asymmetry.

### S2 — No TIER-1 focal / flat depth (tells #1 + #3, M1/M2/M10) — list pages render N-equal rows
The three list pages (approvals, traceability, digests) all render a flat stack of identical full-weight rows inside one `.card-console`, with no hero, no promoted row, no 64px mono truth-number. The proof-number (deltaPoints / engine delta / score) is demoted to a 12px pill instead of the contract-mandated 64px Geist Mono hero.
- traceability `OutcomeCard.tsx:65-68`, digests `DigestRow.tsx`/`DeltaTrioBadge.tsx`, approvals `ApprovalsList.tsx`/`ApprovalRow.tsx`.
- scan-free + onboarding share the same root: the headline figure (verdict / "60%") is undersized vs the M2 30px/64px contract the dashboard already meets.

### S3 — Fraunces serif beat absent (tell #6, M5) on nearly every surface
approvals, digests, traceability, discovery, onboarding (in dwelt state), scan-free all render zero Fraunces. Only login/signup carry a beat — and login's is buggy (italic period). The warm-minimal soul is invisible. There is no shared "verdict line" component that lands the one-italic-word beat, so every page reinvents (or skips) it.

### S4 — Designed empty/error states are bare centered icon-in-circle, single-CTA (tell #5, M8 two-tier recovery)
- approvals error state (`error-state.tsx:38-69`) is the shared `ErrorState` component — dead-center, single retry, no secondary tier, no surface framing. This is a SHARED component used across protected pages.
- traceability empty (`TraceabilityEmpty.tsx`) — centered, single CTA, no quiet secondary link.
- digests empty (`DigestEmptyState.tsx`) — a 30-40% opacity ghost skeleton that reads as a stuck load; the warm promise is below the fold.
- discovery fallback (`page.tsx` EnvMissingFallback) — bare centered card.
M8 requires two-tier recovery (primary pill + quiet secondary link) and a framed/warm surface — none comply.

### S5 — Signature detail (micro-sparkline) missing; engine data shown as N-equal pills (tell #4, M4)
digests `DeltaTrioBadge` and scan-free `EngineBand` both render the canonical AI 3-equal-cell grid of engine scores with no sparkline, no dominant-engine weighting — despite `fourWeeksAgo` data existing in the stub for exactly this. The 24px micro-sparkline is the Beamix signature detail and appears nowhere. A shared `<EngineDelta>` / sparkline primitive is missing.

### S6 — Auth surfaces lack figure/ground + texture (tells #1 + #5 + #4)
login + signup share `layout.tsx` (flat `bg-surface-warm`, bare text wordmark, no texture/bloom) and the `AuthCard` / `input.tsx` components. White card on warm-white = no elevation; inputs render as pale hairline boxes reading as disabled. These are shared-component fixes that fix both auth pages at once.

### S7 — Real data/capture bugs blocking certification (not craft — correctness)
- approvals: page renders the ERROR state on BOTH screenshots (byte-identical) because `getPendingApprovals` queries `approval_queue`, a table missing from the preview DB. The real list/empty/loading were never rendered. `_data.ts:104`.
- discovery: only the `EnvMissingFallback` was captured because `NEXT_PUBLIC_CALCOM_DISCOVERY_LINK` was unset; happy path never rendered.
- login: 3 of 4 states (error, submitting, field-error, mobile-375) never captured.
- Several pages: no mobile capture at all (traceability, digests, approvals, onboarding, scan-free).
These require an env/seed fix + re-capture before any PASS, independent of polish.

### S8 — Entrance choreography (M9) absent across list pages
No `.craft-enter` stagger wired on approvals, traceability, digests rows. The dashboard exemplar has it; the list pages render flat on first paint.

---

## 2. WORST PAGES (ranked worst-first by craft gap)

1. **approvals** — CRITICAL. Page is BROKEN: both captures are the byte-identical error state; real content never rendered (DB bug S7). On top, the intended list is flat N-equal rows, no focal, no serif, error state is the bare centered shared `ErrorState`. Needs data fix + full redesign. (P1: 5)
2. **traceability** — CRITICAL. Three byte-identical rows, proof-number shrunk to 12px pill (should be 64px hero), ~55% dead canvas, no serif, single-CTA empty. The page's own contract demands a forensic hero; build is a stub. Needs redesign. (P1: 5)
3. **discovery** — CRITICAL. Highest-intent conversion page, but only the degraded error fallback was captured (env unset, S7). Visible fallback is a bare centered card, no serif, no signature, mobile unverified on a fixed-height iframe. Needs env fix + re-capture + fallback redesign. (P1: 5)
4. **digests** — CRITICAL. Verdict headline (the loudest object) truncated to 3 words; flat list, ~45% dead gutter, empty state reads as a stuck loading skeleton. Bones are sound — heavy polish, not ground-up. (P1: 4)
5. **onboarding-post-payment** — NEEDS_WORK→redesign. Single small card in ~70% white void, "60%" demoted to 13px caption (should be 64px hero), card depth invisible on white. Most-dwelt funnel state under-delivers. (P1: 3)
6. **scan-free** — NEEDS_WORK. Narrow centered single column with huge gutters (reads like stretched mobile), EngineBand is the AI 3-equal grid, uniform depth, verdict headline under the 30px contract. Heavy polish. (P1: 4)
7. **signup** — NEEDS_WORK. No figure/ground (white card on warm-white), inputs read as disabled hairlines, equal-weight CTA vs Google button. Mostly shared-component fixes. (P1: 3)
8. **login** — NEEDS_WORK (least gap). Functional auth form; main gap is 3 of 4 states uncaptured + a Fraunces italic-period bug + missing wordmark/texture. Light polish + re-capture. (P1: 2)

---

## 3. SHARED-COMPONENT FIXES (one fix → cascades to many pages)

1. `apps/web/src/components/error-state.tsx:38-69` — `ErrorState`/`RefreshErrorState` is the shared recovery surface (renders on approvals today, reachable on all protected pages). Re-anchor left under the page header inside a framed `card-inset`/surface-warm panel, add two-tier recovery (primary "Try again" + quiet secondary link), break dead-center symmetry. Cascades to S4 across every protected page that errors.
2. `apps/web/src/app/(login|signup)/layout.tsx` (shared auth `layout.tsx:5,8-15`) — add sub-4% dot/grid texture or a `--color-wash-sky` blue bloom behind the card, replace the bare text wordmark with the ~24-28px #3370FF Beamix mark, wire `prefers-reduced-motion`-gated fade-up. Fixes S6 for BOTH login and signup at once. (No violet — auth is a you-surface.)
3. `apps/web/src/components/ui/input.tsx:11-17` — inputs render as pale hairline boxes reading as disabled. Raise border contrast + interior so they read as fillable. Cascades to BOTH auth pages and any form surface.
4. `apps/web/src/components/auth/AuthCard.tsx:44-49` — white card has near-invisible edge on warm-white; give it real figure/ground elevation (surface + shadow). Fixes the TIER-1 hero flatness on login + signup.
5. NEW shared primitive `<EngineDelta>` / micro-sparkline (24px 4-week arc, dominant-engine weighting) — extract once, consume in digests `DeltaTrioBadge.tsx`, scan-free `EngineBand.tsx`, and the traceability/approvals row signal. Fixes S5 (signature detail) in one place. Owner: assign to the scan-free worker to author, others consume read-only after merge (sequence note below).
6. NEW shared `<VerdictLine>` helper that lands exactly one Fraunces italic beat on the verdict word — consume in every hero/empty narrative line. Fixes S3 consistently and prevents the login italic-period bug from recurring. Lightweight; can live in `apps/web/src/components/ui/`.
7. `apps/web/src/components/ui/button.tsx:7` — confirm the 8px `rounded-lg` product law (no pill override leaking from marketing). Fixes login CTA corner-language concern; guards all CTAs.

> Sequencing note for parallel workers: items 5 and 6 are NEW shared files. To keep worktrees disjoint, the scan-free worker authors `<EngineDelta>` and the digests worker authors `<VerdictLine>` (each owns its file). All other workers consume these only AFTER those two land on the integration branch — they do NOT edit the shared file. If a worker needs the primitive before it lands, they inline a local version and a follow-up dedups. This preserves disjoint ownership.

---

## 4. POLISH PLAN — disjoint per-page ownership

Each owner works one page's own directory/components in its own worktree. The two NEW shared primitives are authored by exactly one owner each (scan-free → EngineDelta, digests → VerdictLine); the shared `ErrorState`, auth `layout`, `input`, `AuthCard`, `button` fixes are bundled into the auth owner + a dedicated shared-components owner so no two workers touch the same file. Owners are listed in the structured plan.
