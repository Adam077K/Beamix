# Re-critic — /approvals

**Verdict: CRITICAL_ISSUES (capture failure — polished render not gradable)**
Date: 2026-06-12 · Reviewer: design-critic (re-critic / PASS gate)

## The blocking problem: the screenshots do not show the page

Both files in `screenshots-final/approvals/` (`populated-desktop.png`, `empty-desktop.png`)
are **byte-identical** (48993 bytes each) and both render the **error fallback**, not the
approvals UI:

> "Could not load approvals — There was a problem fetching your pending items. Give it
> another go." + a blue "Try again" pill.

That is the `RefreshErrorState` branch in `apps/web/src/app/(protected)/approvals/page.tsx`
(lines 47–57 / 101–106). It only fires when `getCurrentUser()` returns null (unauthenticated
capture) or `getPendingApprovals` errors. So:

- The **populated queue** (`card-console` → `ApprovalsList` → `ApprovalRow` rows with
  `KindBadge`, mono expiry, risk pill, accordion `ProposalPreview`) **never rendered** in the
  capture.
- The **designed empty state** (`EmptyApprovals` — breathing violet dot, "All clear — the
  crew is watching") **never rendered**.
- There is **no mobile capture** at all.

I grade rendered pixels, not source. The one screen actually captured is the error state, so
a PASS is impossible — there is no polished populated render to certify, and the polish loop
has nothing to iterate against. Re-capture is required before this page can be graded.

Root cause is almost certainly the known **turbopack-dev font blocker + missing demo auth**
documented in `CRAFT-SYSTEM.md` §"Blocker for the design-critic visual loop": screenshots
must be taken against **prod logged in as demo@beamixai.com** (which returns `DEMO_APPROVALS`
fixtures, so the populated state is guaranteed), or via `next dev` without `--turbopack`.

## What the code *would* render (read, not graded — for context only)

The source is genuinely strong and looks like it already absorbed the craft moves:
mono tabular-nums expiry (M11), `text-status-warning` on expiring-soon, status-color row
hover ground `#F4F6FA` (M7), KindBadge typing, two-tier warm empty with violet glyph (M8/M6),
accordion progressive disclosure (M10), "Needs your sign-off" risk pill, and an error state
with a real `router.refresh()` recovery (M8). If this renders as written it is plausibly
close to PASS. But that must be confirmed in pixels — not approved from code.

## The one thing that DID render — the error state — graded

Acceptable but plain, and it carries two tells because it is currently the *only* thing on screen:
- **Tell #5 (dead-center-in-void / bare icon-in-circle):** a lone critical-tinted triangle in
  a circle, centered card in a large empty canvas. M8 asks for a warm character glyph, not a
  bare icon, and the surrounding void is unbalanced (no asymmetry, no anchor).
- **No Fraunces beat, no mono figure, no signature detail** — but an error block legitimately
  carries less of this than a data surface, so this is a P2, not the blocker.
- It does name a real recovery action ("Try again" → `router.refresh()`), which is correct.

## Required to clear the gate (re-capture, then re-grade)

1. **P1 — Re-capture the page in a real rendered state.** Against prod logged in as
   `demo@beamixai.com` (guaranteed `DEMO_APPROVALS`) or `next dev` (webpack, no turbopack).
   Produce THREE distinct captures: `populated-desktop`, `populated-mobile`, `empty-desktop`.
   The current two files are the same error screen and cannot be graded.
2. **P1 — Confirm the data path / auth for the capture session** so `getPendingApprovals`
   returns rows (the error branch must not be what we screenshot).
3. **P2 — Error-state polish** (once it is no longer standing in for the whole page): swap the
   bare triangle-in-circle for the warm character glyph idiom used in `EmptyApprovals`, and
   give the block a left-anchored / asymmetric composition instead of dead-center-in-void.

Re-run the re-critic once a genuine populated + empty + mobile capture exists.
