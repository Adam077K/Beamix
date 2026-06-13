---
page: /automation
route: /automation
states_audited:
  - populated-desktop.png  (only state captured)
states_missing:
  - empty-desktop  (NOT captured)
  - loading-desktop  (NOT captured)
  - error-desktop  (NOT captured)
  - populated-mobile-375  (NOT captured)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png  (110 prompts data table — density/number-truth bar)
  - Profound-Screenshot 2026-06-12 at 10.37.47 AM.png  (ranking list, right rail)
  - Profound-Screenshot 2026-06-12 at 10.38.16 AM.png  (topic checklist + side tips)
  - otterly-Screenshot 2026-06-12 at 10.44.48 AM.png  (brand competitors list + ranking table)
  - otterly-Screenshot 2026-06-12 at 10.44.17 AM.png  (form + preview rail)
verdict: NEEDS_WORK
---

# automation — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/automation/populated-desktop.png)

> Only ONE state was captured. The dev-mode state switcher (bottom-right "loading / empty / error / populated") is visible in the screenshot, proving the other three states exist in code but were NOT screenshotted. **empty, loading, error, and mobile-375 were not audited from pixels** — findings on those states are code-derived and flagged as such.

## Verdict
**NEEDS_WORK.**

The bones are right and clearly more considered than a default scaffold: a real TIER-1 mono hero ("4 AUTONOMOUS"), a stepped type contract, a violet-tinted "Beamix handle it" segment, and an inset explainer that recedes. It is NOT AI-slop-broken. But against the competitor bar it falls short on three fronts: (1) the populated body is a stack of near-identical full-width rows that reads as a uniform list — Profound and Otterly both break their lists with column structure, in-row data, and a right rail, while this page has none of that rhythm; (2) the you-vs-agents color promise is nearly invisible at arm's length — the violet tint segment and the 3px violet hairline are so low-contrast they read grey; (3) the header has a large dead band between the title block and the floating stat card that reads as misalignment, not intentional asymmetry. It is roughly one focused polish pass from the bar, not a redesign.

---

## P1 — must fix (looks AI / broken)

### P1-1 — The agent rows are a uniform full-width stack (tells #1 + #2)
**Problem:** Every agent renders as the same `rounded-[16px] border border-[#E5E7EB] bg-white` card at the same height and same depth (`AgentModeRow.tsx:99-110`, `page.tsx:266`). Six identical rectangles top to bottom. Within each row the toggle and the "Open tool →" link float to the far right with a large, variable dead gap (the gap differs row-to-row because the CapBadge is conditionally present at `AgentModeRow.tsx:147`), so the right edge never lines up — it reads ragged, not gridded.
**Why it reads AI/broken vs the ref:** Profound's 110-prompts table (`10.39.25`) and Otterly's brand-ranking table (`10.44.48`) both impose a clear column grid — names left, numbers in aligned mono columns, deltas color-coded — so the eye reads structure. This page is the canonical "N identical stacked cards" tell with no internal column alignment, so it reads as a generated list.
**Fix (M1 + M3 + M12):** Give the rows a real column grid so the toggle, the allotment, and "Open tool" sit in fixed-width aligned columns regardless of which badges are present (reserve the CapBadge column width even when empty). Then break the uniform depth: the row currently in `beamix` mode (or the one needing sign-off) should read as the TIER-2 focus while manual rows recede toward `.card-inset` (TIER-3, no shadow). Don't ship six equal `card-console` rows.
**File:** `_components/AgentModeRow.tsx:99-184`, `page.tsx:265-282`.

### P1-2 — The you-vs-agents color promise is invisible at arm's length (tell #8 / M6 fail)
**Problem:** At a glance the only thing that differentiates an autonomous agent from a manual one is a `#EEEAFD` tint behind "Let Beamix handle it" plus a 3px `bg-[#6E56F0]/30` left hairline (`AgentModeRow.tsx:107`). Both are so pale they read as light grey in the render — you cannot tell which agents Beamix is running without reading every word. The CRAFT-SYSTEM names exactly this as tell #8: "blue/violet as a token detail, not spatial — the you-vs-agents promise invisible at arm's length."
**Why it reads AI/broken vs the ref:** the whole product premise is the blue=you / violet=agents split, and it must be glanceable. Here it is sub-threshold. The inactive toggle segment, the active violet segment, and the explainer dots are all roughly the same value.
**Fix (M6):** Make the autonomous rows read as a violet zone at arm's length — full `--color-agent-tint #EEEAFD` row ground (not just behind one segment) and/or raise the left hairline to a solid `#6E56F0` at full opacity and a touch wider. The violet `/30` and `/40` opacities (`page.tsx:65`, `AgentModeRow.tsx:107`) are the problem — they wash out. Keep violet off buttons (the toggle tint+ring is correct), but the *zone* must be obvious.
**File:** `_components/AgentModeRow.tsx:106-108`; explainer dots `page.tsx:65`.

### P1-3 — Header dead-band: title block and stat card read as misaligned, not asymmetric (tell #5)
**Problem:** In the render the eyebrow + "Automation" + subtitle sit flush-left while the "4 AUTONOMOUS" card is pinned to the far right edge, with a very wide empty band between them and the card sitting visually higher than the title baseline. Because the body content below is constrained to `max-w-[880px]` (`page.tsx:213`) but the PageHeader action is pushed to the page edge, the stat card does not align to the body's right edge — it floats past it. This reads as a layout bug, not intentional asymmetry.
**Why it reads AI/broken vs the ref:** Profound's hero (`10.37.47`) and Otterly's onboarding (`10.44.17`) both pair a left content column with a right rail that is *aligned to the same grid* and vertically related to the heading. Here the relationship is broken.
**Fix (M3):** Constrain the header to the same `max-w-[880px]` as the body so the stat card's right edge aligns to the rows below it, and vertically center the card against the title/subtitle cluster (or top-align it deliberately). The asymmetry should be "dominant title column + aligned stat rail," not "title left, card adrift right."
**File:** `page.tsx:213-235` and the `PageHeader` action slot.

---

## P2 — substantive

### P2-1 — Allotment data is stated twice per row (redundancy reads unfinished)
**Problem:** For autonomous rows the allotment appears in the CapBadge ("weekly · 6 of 10 autonomous runs left", `AgentModeRow.tsx:147-150`) AND again under the toggle as the ModeToggle's own explainer line ("Beamix runs this weekly · 6 of 10...", `ModeToggle.tsx:88-92`). The same fact, twice, a few centimeters apart. The render clearly shows both.
**Why it matters vs the ref:** competitor rows show each datum once, in one canonical place. Duplication reads like two components that weren't reconciled.
**Fix (M11/M12):** Pick one home for the allotment — recommend keeping it under the toggle (where it explains the active mode) and dropping the CapBadge, OR keep the CapBadge as the compact truth and strip the toggle's explainer line. Don't show both.
**File:** `_components/AgentModeRow.tsx:146-151` vs `components/console/ModeToggle.tsx:87-92`.

### P2-2 — No signature detail anywhere on the page (tell #4 / M4 absent)
**Problem:** There is no micro-data per agent — no last-N-runs sparkline, no run-success indicator, nothing that a generic settings list wouldn't have. Each row is label + meta + toggle + link.
**Why it matters vs the ref:** Profound puts a visibility trend / delta on every prompt row; the data is the texture. A config page can still carry one signature detail.
**Fix (M4):** Add the engine/agent micro-sparkline (24px tall, ~64px, last ~5 runs) to autonomous rows in the band color, with the flat `#E5E7EB` baseline when null — never fabricate. This also gives the rows internal column structure (helps P1-1) and turns "Last run 3 days ago" into something felt.
**File:** `_components/AgentModeRow.tsx:125-143`.

### P2-3 — Three-mode explainer dots are too quiet to teach the spectrum
**Problem:** The Manual / Autonomous / Done-for-you columns are differentiated only by a 2px dot (`#E5E7EB`, `#6E56F0/40`, `#6E56F0` at `page.tsx:52,65,80`). At render size the three dots are nearly indistinguishable, so the manual→autonomous→concierge escalation the copy describes is not visualized.
**Fix:** Make the dots carry the blue→violet education: Manual = blue `#3370FF` (you), Autonomous = violet `#6E56F0` at full strength, Done-for-you = violet deep / filled. Right now Manual is grey, which throws away the chance to reinforce blue=you on the very card that teaches the model.
**File:** `page.tsx:50-89`.

### P2-4 — Section rhythm is a flat `space-y-3` (M12)
**Problem:** Rows are evenly spaced with `space-y-3` (`page.tsx:266`) and the explainer-to-section and section-to-rows gaps don't vary by relationship strongly enough. The page is one even vertical cadence.
**Fix (M12):** Vary whitespace by relationship — tighter within the autonomous cluster if you group by mode, wider between the explainer and "All agents." Consider grouping rows by mode (Autonomous first, then Manual, then locked) so the violet zone is contiguous and the list has internal structure rather than registry order.
**File:** `page.tsx:259-282`.

---

## P3 — nice-to-have

### P3-1 — "Open tool →" is the only blue link and competes with the toggle's blue
**Problem:** Each row has a blue "Run it myself" segment AND a blue "Open tool →" link. Two blue affordances per row slightly dilute "blue = your primary action."
**Fix:** Consider demoting "Open tool →" to neutral `#6B7280` with the arrow as the only accent, reserving solid blue for the active mode segment.
**File:** `_components/AgentModeRow.tsx:174-181`.

### P3-2 — Serif beat lands below the fold and on a non-verdict word
**Problem:** The one Fraunces beat is `<SerifVerdict>handled</SerifVerdict>` (`page.tsx:288`) in a muted `#9CA3AF` footer note. "handled" is not really a verdict word, and at `#9CA3AF` the serif soul is barely legible. M5 wants the serif on a verdict word, readable.
**Fix:** Either lift the beat to a more present line (and a stronger ink color) or move it to a genuine verdict moment. A grey footnote is the weakest possible home for the page's single editorial beat.
**File:** `page.tsx:286-296`.

### P3-3 — Locked agent affordance is passive
**Problem:** Tier-locked rows get `opacity-75` + a "Build+" badge + a dead grey "Open tool" (`AgentModeRow.tsx:109,166-172`). There is no path to upgrade from the row.
**Fix:** Make the locked "Open tool" an "Upgrade to unlock" affordance (blue link to billing), so the lock converts instead of just dimming.
**File:** `_components/AgentModeRow.tsx:165-172`.

---

## Per-state notes

### populated (captured)
Covered above. Strong: real TIER-1 mono hero, stepped type, inset explainer, mono for times/counts. Weak: uniform row stack, invisible violet zone, header dead-band, duplicated allotment.

### empty (NOT captured — code review only, `page.tsx:145-171`)
Code looks compliant with M8: titled context, specific next step, two-tier CTA (blue pill "Start with Query Mapper" + quiet "View run history →"), `illustration="automation"`. **Must be screenshotted to confirm** the EmptyState component centers correctly and the illustration is on-brand (not a bare centered icon-in-circle, tell #5). Cannot PASS the empty state from code alone.

### loading (NOT captured — code review only, `page.tsx:99-139`)
Skeleton mirrors the real row shape (good — matches layout sizes, not a spinner). Note it skeletons the explainer as `sm:grid-cols-3` equal (`page.tsx:110`) while the real explainer is weighted `1fr_1.4fr_1.2fr` (`page.tsx:48`) — the skeleton will visibly reflow when content lands. Minor, but **must be screenshotted**.

### error (NOT captured — code review only, `page.tsx:245-252`)
ErrorState names a real recovery ("Try again… usually clears right up") with a Retry that returns to populated. Compliant in code. **Must be screenshotted.**

### mobile-375 (NOT captured — HIGH RISK)
`AgentModeRow` collapses to `flex-col` below `sm:` (`AgentModeRow.tsx:112`) and the page is `max-w-[880px]` — likely okay, but the toggle is a two-segment pill ~280px wide and the "needs your sign-off" + name + badges wrap could get cramped at 375px. The header stat card (`min-w-[140px]`, `page.tsx:223`) plus the title may collide. **This was not captured and is the highest-risk unaudited state — must be screenshotted before any PASS.**

---

## Bottom line
No retired colors, no font violations, no broken N-equal grid in the slop sense, and the four states exist in code. But the populated body does not yet sit beside the #173 dashboard as one hand: it needs row column-alignment + depth differentiation (P1-1), a glanceable violet zone (P1-2), and a fixed header alignment (P1-3). Plus the missing four screenshots must be captured — a PASS cannot be granted on one state.
