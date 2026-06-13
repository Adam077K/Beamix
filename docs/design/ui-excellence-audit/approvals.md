---
page: /approvals
route: /approvals (protected)
states_audited:
  - empty-desktop.png   (renders the ERROR state, not an empty state)
  - populated-desktop.png (BYTE-IDENTICAL to empty-desktop.png — also the ERROR state)
states_NOT_captured:
  - the real populated approval list (ApprovalsList with rows)
  - the designed empty state (EmptyApprovals "All clear")
  - the loading skeleton (LoadingSkeleton)
  - any mobile / tablet breakpoint
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png (110 prompts — dense data table)
  - Profound-Screenshot 2026-06-12 at 10.39.46 AM.png (content-review surface — doc preview + right-rail workflow, the direct approvals analogue)
  - Profound-Screenshot 2026-06-12 at 10.38.02 AM.png (analytics dashboard, depth/asymmetry bar)
  - otterly-Screenshot 2026-06-12 at 10.44.17 AM.png (onboarding split — asymmetry reference)
verdict: CRITICAL_ISSUES
---

# approvals — UI Excellence Audit

## Screenshots
- [empty-desktop.png](./screenshots/approvals/empty-desktop.png) — actually the **error** state
- [populated-desktop.png](./screenshots/approvals/populated-desktop.png) — **byte-identical** to the above (same 47148-byte file); also the **error** state

## Verdict
**CRITICAL_ISSUES.**

The page never rendered. Both captured states ("populated" and "empty") are the **exact same error screen** — "Could not load approvals" — and the two PNGs are byte-for-byte identical (47148 bytes each). The intended content (the approval list, the designed empty state, the loading skeleton) was **never produced**, so it cannot be graded visually. The root cause is in `_data.ts`: `getPendingApprovals` queries the `approval_queue` table, which the source itself flags as "not yet in database.types.ts (schema drift)" — in the preview DB the query errors and the page falls through to `RefreshErrorState`. **Nobody has seen this page work.** That is the headline finding and it BLOCKS any craft sign-off.

Separately, even the chrome + error state that we *can* see fall short of the Profound/Otterly bar: the error block is dead-center symmetric, the page header floats over a vast empty white canvas with no depth, there is no Fraunces beat, no signature detail, and the intended list design (read in code) is a single flat full-width `card-console` of identical rows — i.e. the canonical AI list with no asymmetry, no progressive disclosure rail, and the count-bearing subtitle is the only number in mono. The competitor analogue (Profound's content-review surface) is a dominant document column + a structured right rail — Beamix's intended layout has none of that richness.

---

## P1 — must fix (looks AI / broken)

1. **The page is broken — it renders the error state, not its content (REAL BUG, blocks everything).**
   Both screenshots show "Could not load approvals / There was a problem fetching your pending items." The two files are identical bytes, so there is no real "populated" capture at all. Root cause: `getPendingApprovals` selects from `approval_queue` (`_data.ts:104`), a table the code admits is missing from the typed schema (`_data.ts:14`); the query returns `{ok:false}` and `page.tsx:101-106` falls to `RefreshErrorState`. **Fix:** ensure the `approval_queue` table + RLS exist in the preview/staging DB (or seed the demo fixture path so `isDemoUser` is true for the QA account — `page.tsx:61`), re-run the capture, and only then can the list/empty/loading states be graded. Until this is fixed the audit cannot certify the page. **file:** `apps/web/src/app/(protected)/approvals/_data.ts:104` + `page.tsx:61-63`.

2. **Error state is dead-center symmetric — tell #5.**
   The icon-in-circle + title + body + button stack sits perfectly centered on the horizontal axis (`ErrorState` uses `flex flex-col items-center ... pt-[20vh]`, `error-state.tsx:43`). This is the exact "bare centered icon-in-circle" pattern the rubric calls out as an AI tell. The competitor refs never center a recovery block in a void. **Fix (M8):** anchor the error block left-aligned under the page header inside the content column, give it a contained surface (`card-inset` or `surface-warm` panel) so it reads as "this region failed" rather than "the whole app is empty," and keep the two-tier recovery (primary "Try again" + a quiet secondary link, e.g. "Check status"). **file:** `apps/web/src/components/error-state.tsx:38-69`.

3. **Vast dead white canvas + floating header — no depth, no focal (tells #1 + #5, fails M1/M10/M12).**
   Above the fold there is one 30px "Approvals" H1 floating top-left and then ~600px of empty white before the centered error chip. Profound fills the frame with a toolbar, column headers, and data; Beamix shows an near-empty page. There is zero depth staging — no TIER-1 focal, no surface, no rail. **Fix (M1/M10):** the content region should always present a framed surface (the `card-console` that `page.tsx:98` only renders on success should also frame the error/empty states), and the layout should establish at least a TIER-2 surface so the eye lands somewhere. **file:** `apps/web/src/app/(protected)/approvals/page.tsx:88-107`.

4. **Intended list is a flat, full-width stack of identical rows — tells #1, #2, #3, fails M3.**
   Read in code: success renders one `card-console` wrapping a `<ul className="divide-y">` of `ApprovalRow`s, each row the same weight, same depth (`ApprovalsList.tsx:90-95`, `ApprovalRow.tsx:135-198`). Every row is `KindBadge · summary · expiry · chevron` at identical visual weight — there is no dominant column, no priority/expiring-soon item promoted to a focal, no asymmetric rail. This is the canonical AI list. The direct competitor analogue (Profound's content-review, ref 10.39.46) is a **dominant preview column + a structured right rail** — Beamix's intended layout has neither. **Fix (M3/M10):** promote the most-urgent or highest-risk item to a TIER-2 focal card at the top, recede the rest into `card-inset` rows, and consider a `[1fr_320px]` split with a rail (counts by kind, "expiring soon", a "what is this" explainer) like the dashboard's `[1fr_360px]`. **file:** `apps/web/src/app/(protected)/approvals/_components/ApprovalsList.tsx:89-95`.

5. **No Fraunces serif beat anywhere on the surface — tell #6 (fails M5).**
   Neither the chrome, the header, the error state, nor the intended list/empty designs use Fraunces. The warm-minimal soul is absent. **Fix (M5):** one italic-serif beat on a verdict word — e.g. in the empty state "All clear" set "clear" in Fraunces italic, or in the count subtitle italicize the verdict word — inline in a sans sentence, never in chrome. **file:** `apps/web/src/app/(protected)/approvals/_components/ApprovalsList.tsx:30-31` (empty) / `page.tsx:69-74` (subtitle).

---

## P2 — substantive

6. **Numbers are barely in mono — only the subtitle count (fails M11 spirit).**
   The one mono number that exists (the `CountMono` in the subtitle, `page.tsx:31-37`) is invisible because the subtitle only renders when `count > 0` and the page never reached that branch. In the intended row, the expiry `relativeTime` is mono (`ApprovalRow.tsx:170-182`) — good — but there are no scores, deltas, or counts surfaced per-row the way Profound shows visibility rank / score / position / citation share. The surface reads thin next to a data competitor. **Fix (M4/M11):** add per-item truth — e.g. a mono "expires in" countdown that recedes, a kind count, or a small signature detail (the engine micro-sparkline transfers here if any item carries a score trend). **file:** `apps/web/src/app/(protected)/approvals/_components/ApprovalRow.tsx:157-182`.

7. **Zero signature detail — tell #4 (fails M4).**
   Nothing on this surface is something a generic admin template wouldn't have: a divided list, badges, a chevron accordion. There is no engine micro-sparkline, no distinctive Beamix mark. **Fix (M4):** introduce the signature micro-sparkline or a comparably distinctive per-row affordance so the surface is unmistakably Beamix. **file:** `ApprovalsList.tsx` / `ApprovalRow.tsx`.

8. **Violet structure is a token detail, not spatial — tell #8 (partially fails M6).**
   The agent identity shows up only as a small `bg-agent-tint` KindBadge pill (`KindBadge.tsx:43`) and the violet-bordered ProposalPreview *inside* an expanded row (`ProposalPreview.tsx:91-95`). At arm's length, collapsed, the list reads as a neutral admin queue — the "these are the agents' proposals awaiting *your* (blue) sign-off" promise is invisible until you expand a row. **Fix (M6):** make the agent zone glanceable while collapsed — e.g. a 1px `rgba(110,86,240,0.12)` left hairline on each row (agent-authored) so the violet=agents / blue=you split reads spatially, while the Approve button stays blue. Violet must never touch the button (currently correct — Approve is `variant="default"` blue, `ApprovalActions.tsx:137`). **file:** `apps/web/src/app/(protected)/approvals/_components/ApprovalRow.tsx:128-133`.

9. **Designed empty state is itself a bare centered icon-in-circle — tell #5 (fails M8).**
   The intended `EmptyApprovals` (not captured, read in code) is `flex flex-col items-center justify-center py-20 text-center` with a single `rounded-full bg-agent-tint` chip and two lines of copy (`ApprovalsList.tsx:11-38`). No two-tier CTA, no specific next action (it is a terminal "nothing to do" message). The breathing `animate-ping` dot is the only motion. While warmer than the error, it is still the centered-chip pattern the rubric flags. **Fix (M8):** keep the warmth but anchor it inside the framed surface, add a quiet secondary action (e.g. "See resolved →" — which already exists in code but is `hidden`, `page.tsx:78-84`), and add the Fraunces beat from finding #5. **file:** `apps/web/src/app/(protected)/approvals/_components/ApprovalsList.tsx:10-38`.

10. **The "Resolved →" action is permanently `hidden` — dead affordance.**
    `page.tsx:79` hard-codes `className="hidden ..."`, so the only secondary navigation off this surface never appears. That leaves the page with no escape hatch and no two-tier structure. **Fix:** ship the resolved view and unhide it, or remove the dead node — do not leave an invisible affordance in the tree. **file:** `apps/web/src/app/(protected)/approvals/page.tsx:77-85`.

11. **Entrance choreography absent — tell #7 (fails M9).**
    The list renders flat; there is no priority-ordered fade-up stagger on first paint. The only motion in the whole surface is the expand accordion (`animate-in fade-in`, `ApprovalRow.tsx:212`) and the empty-state ping. **Fix (M9):** add the ≤200ms, ~40ms-stagger fade-up to the rows behind `prefers-reduced-motion`, matching the dashboard exemplar.

---

## P3 — nice-to-have

12. **Header subtitle voice / mono pairing.** The "The crew has N items waiting" subtitle (`page.tsx:71`) is good warm voice, but pairs a violet mono number (`text-agent`, `page.tsx:33`) with a *user-facing* sentence; confirm the violet count reads as "the agents prepared these" and not as a clickable element. Consider neutral mono for the count and reserve violet for the badges only.
13. **Type contract is two-register, not four-stepped (M2).** The visible surface only exercises the 30px H1 and 13–15px body — there is no STEP-1 hero figure and no clear STEP-3 eyebrow rhythm on the main page (eyebrows only appear inside expanded rows, `ApprovalRow.tsx:239`). When the list/focal lands, make the four steps visibly stepped.
14. **Search field in the topbar shows placeholder "Search" with no scope** — minor, shared chrome, not this page's bug, but it reads inert next to Profound's scoped "Search Topics".

---

## Per-state notes

- **"populated-desktop.png":** Misnamed. It is byte-identical to empty-desktop.png and shows the **error** state, not a populated list. No real populated capture exists. Cannot grade the row design from pixels — graded from source only (findings 4, 6, 7, 8).
- **"empty-desktop.png":** Also the **error** state, not the designed empty state. The genuine `EmptyApprovals` ("All clear — the crew is watching") was never rendered; graded from source (finding 9).
- **error state (what both files actually show):** Dead-center, floating in a near-empty white page, no surrounding surface, single retry button (no secondary tier). Reads as "the whole app is empty/broken" rather than "this region failed." Findings 2 + 3.
- **mobile:** No mobile/tablet capture exists. Responsive behavior (header `sm:flex-row`, `max-w-5xl` content) is unverified. Re-capture at 375px after the data bug is fixed.
- **loading:** The `LoadingSkeleton` (`ApprovalsList.tsx:45-65`) is never reachable in this server-rendered path (no `isLoading` is passed from `page.tsx`) — confirm it is actually wired or it is dead code.
