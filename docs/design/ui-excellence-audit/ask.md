---
page: /ask  (Ask Beamix — cited copilot over the customer's own GEO data)
route: (protected)/ask
states_audited:
  - populated-desktop.png   (the only state captured)
  - empty-desktop          NOT captured — could not audit
  - loading                NOT captured — could not audit
  - error                  NOT captured — could not audit
  - mobile-375             NOT captured — could not audit
competitor_refs_used:
  - Profound-…10.39.25 (Answer Engine Insights data table — mono numbers, in-cell deltas, dense)
  - Profound-…10.37.47 (ranked competitor list with focal metric)
  - Profound-…10.38.02 (answer-engine chat: prompt + live "Running prompts" + brand-visibility chart)
  - Profound-…10.36.25 (full-bleed loading moment)
  - otterly-…10.44.39  (split-pane brand-ranking table)
verdict: NEEDS_WORK
---

# ask — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/ask/populated-desktop.png)  — **the only state available**

> Only ONE screenshot exists for /ask (`populated-desktop.png`). The empty, loading, and error
> states and the mobile breakpoint were NOT captured, so the single most important feature of this
> surface — the violet **GroundingLedger** "thinking → cited answer" morph (the page's declared
> signature moment, `AskThread.tsx:195`) — is NOT visible in any render. The empty state (real
> users land here, `page.tsx:58`) and mobile composer behaviour are also unaudited. Findings below
> are scoped to what the one screenshot proves; several P-items are flagged "verify when captured."

## Verdict
**NEEDS_WORK.** This is genuinely above template-grade: the document-thread metaphor (not chat
bubbles), the blue user-rule / violet-authorship-dot split, inline mono figures, inline citation
chips, and four designed states put it ahead of most AI-generated work and it sits in the same
family as the #173 dashboard. But against the competitor bar it has three real gaps: (1) the
declared signature moment is invisible in the default render and the page's hero answer is a flat
six-paragraph wall of evenly-weighted 16px body with no focal metric — Profound's answer surfaces
*pull the number out* (the 65% figure, the ranked list); (2) the one Fraunces beat lands on the
weak word "gap" at body size and reads as an accidental italic, not an editorial moment; (3) the
sticky composer's white gradient crops the thread and floats over live content. None are
brand-law BLOCKs and it is not a clone — so NEEDS_WORK, route to design-polisher.

---

## P1 — must fix (looks AI / broken)

1. **The hero answer is a flat six-paragraph wall — no focal, no felt hierarchy (tell #1 + tell #3, M1/M2/M10).**
   In the render, the first Beamix answer is six consecutive paragraphs of identical-weight 16px
   Inter body (`AnswerCard.tsx:115`, `space-y-3.5 text-[16px]`). Every sentence carries equal
   visual weight; the load-bearing facts ("cited first by ChatGPT and Gemini in 5 out of 6 tests",
   "₪400–₪800", "rank #1 on Perplexity") are buried inline at body weight. Compare Profound's
   answer-engine surface (10.38.02): the **65% Brand Visibility** figure is lifted into a large
   focal with a trend chart beside it — the answer *has a number you see at arm's length*. Beamix's
   answer has none. **Fix (M1 + M2 + M11):** give the FIRST grounded answer one TIER-1 focal — pull
   the single most important figure (e.g. the `5/6` citation rate or the `2.1 → #1` projection) into
   a 64px Geist Mono STEP-1 figure with a 12px eyebrow above it, set as a small lead block above the
   prose, so the eye lands on the verdict number before reading. Keep the prose, but lead with the
   number. Right now nothing commands. `AnswerCard.tsx:113-119`.

2. **The signature moment (violet GroundingLedger) is absent from every captured state — unverifiable.**
   `AskThread.tsx:11` + `:195` declare the violet ledger → answer morph as "the page's one signature
   moment," and it is the single thing that separates Ask Beamix from a generic chat UI. It only
   mounts while a question is `pending` (`AskThread.tsx:196`), so it is invisible in the seeded
   populated render and was never screenshotted. We cannot confirm the violet zone reads different
   at arm's length (tell #8 / M6), that the morph is calm, or that it survives reduced-motion.
   **Fix:** capture the ledger mid-run (force a pending state or screenshot immediately after
   picking a starter question) AND capture empty/loading/error/mobile before this surface can PASS.
   A signature moment that no reviewer can see is functionally tell #4 (zero signature detail) until
   proven otherwise. `AskThread.tsx:195-202`, `GroundingLedger.tsx`.

3. **Sticky composer crops the thread and floats over live content (real UI bug, M12/M10).**
   In the render the composer card ("Ask about your visibility…") sits directly under the second
   user turn ("What would closing that pricing gap actually do to our rankings?") and its white
   top-gradient (`AskThread.tsx:209`, `bg-gradient-to-t from-white via-white to-transparent`) fades
   out the bottom of the thread mid-sentence — the entire second answer is below the fold and the
   composer overlaps the tail of the conversation rather than resting beneath it. It reads as
   content disappearing under a panel, not as a calm pinned input. **Fix:** ensure the scroll column
   reserves bottom padding equal to the composer height (the `pb-44` at `AskThread.tsx:150` is being
   eaten by the absolute composer) and confirm the last turn is fully readable above the gradient.
   Verify on first paint that the thread scrolls to the latest answer, not stops mid-turn.
   `AskThread.tsx:147-218`.

## P2 — substantive

4. **The Fraunces beat lands on a weak word at body size — the editorial moment doesn't register (M5, tell #6 risk).**
   `AskThread.tsx:42` sets `VERDICT_WORD = 'gap'` and `AnswerCard.tsx:41` lifts the first occurrence
   into Fraunces italic at inherited 16px body size, mid-paragraph. In the render this is invisible —
   "the gap comes down to two specific factors" reads as a stray italic, not a verdict beat. M5
   wants the serif on a **verdict word** (a band label / judgement: "invisible", "climbing",
   "behind"), at a size where it is felt. "gap" is a common noun appearing 3× in the copy; the move
   is wasted. **Fix:** move the beat to a genuine verdict word and let it carry weight — e.g. lift
   the answer's actual judgement ("Smile Center is cited *first*" or the band word). Consider a hair
   larger optical size / colour so it reads as intentional. One per screen is correct; the *choice*
   of word is the miss. `AskThread.tsx:42`, `AnswerCard.tsx:31-47`.

5. **Answer paragraphs use one global `space-y-3.5` — no editorial rhythm (M12).**
   `AnswerCard.tsx:115` separates all six paragraphs with the same gap. The answer has natural
   structure ("First…", "Second…", the closing pivot "That's the gap you can widen") that wants
   varied whitespace — tighter within the two-factor cluster, wider before the closing
   recommendation pivot. Uniform spacing is exactly the M12 tell. **Fix:** group the two numbered
   factors tightly and open more air before the closing "widen-while-closing" sentence, or set the
   closing line as a quiet pulled-out conclusion.

6. **Citation chips are visually uniform — type carries no signal (M4/M7 opportunity).**
   `CitationChip.tsx:60` renders scan / prompt / competitor / page chips identically (same
   `#F4F6FA` ground, same border) — only the Lucide glyph differs and at 12px the four icons are
   near-indistinguishable in the render. The whole promise of this surface is *auditable, typed
   provenance*; the chips flatten that into one undifferentiated row. **Fix:** give the four source
   types a faint type-distinguishing cue (e.g. the scan/page = neutral, competitor = a hair of the
   competitor accent, prompt = mono-leading) so a glance tells you "this claim is backed by a scan
   vs a competitor page." Keep them quiet, but make the type legible — that *is* the signature
   detail for this surface, the equivalent of the dashboard's micro-sparkline (M4).

7. **Empty / loading / error states unverified — designed in code, never rendered.**
   The code is strong (StarterQuestions card-inset rows + McpConnectStrip two-tier affordance =
   a proper M8 empty; AskSkeleton ghosts the real shape; ErrorState names a real recovery), but
   none were screenshotted. The empty state is what **every real user sees** (`page.tsx:58`).
   **Fix:** capture all three + mobile and re-audit. Specifically verify: (a) the empty state isn't
   a bare centered void above the fold; (b) the McpConnectStrip doesn't read as an ad; (c) the
   skeleton's violet authorship dot (`AskSkeleton.tsx:21`, `#E0DAF8`) is warm not dead-grey.

## P3 — nice-to-have

8. **Composer helper line is two-tone grey-on-grey (`#C4C4CC` + `#9CA3AF`, `Composer.tsx:88-92`).**
   "Press / for suggested questions · Enter to send" at `#C4C4CC` is near-invisible on white and the
   `/` hint doesn't appear to be wired to anything in the seeded view. Either lift the contrast a
   notch or drop the `/` affordance if it's decorative. Verify it doesn't fail WCAG on the kbd hint.

9. **No relative timestamp on user turns in the seeded thread (M11 surface inconsistency).**
   `UserTurn.tsx` supports a mono timestamp but the fixture supplies none (`ask.ts` thread has no
   `timestamp`), so the "every figure is mono, even time" intent is invisible. A quiet relative time
   on each turn would reinforce the mono-truth grammar and make the thread feel logged, not staged.

10. **Subtitle reading width vs answer width mismatch.** PageHeader subtitle caps at `max-w-[480px]`
    (`page-header.tsx:55`) while answers run the full 760px column — a slight optical inconsistency
    at the top of the page. Minor; verify it reads intentional, not arbitrary.

---

## Per-state notes

**populated-desktop (audited):** Strong bones — document-thread, not bubbles; blue 2px user rule
(`UserTurn.tsx:17`) and violet authorship dot (`AnswerCard.tsx:105`) apply the you/agents law at
element level (good, not just a token detail). H1 + eyebrow + subtitle clean. Citation row present
and on-brand. The three real gaps: (a) the hero answer is a flat undifferentiated wall with no
focal metric (P1.1); (b) the composer crops the thread and the second answer is fully hidden
(P1.3); (c) the Fraunces beat is invisible (P2.4). The page currently reads "calm and competent"
but not "excellent" — there is no moment where a number commands the eye the way Profound's 65%
does.

**empty (NOT captured):** Real users land here. Code suggests a proper two-tier M8 empty
(StarterQuestions + McpConnectStrip). MUST be captured before PASS — it is the default first
experience.

**loading (NOT captured):** AskSkeleton ghosts the thread shape (good — not a spinner-in-void).
Unverified.

**error (NOT captured):** ErrorState names a real recovery ("Retry the question", `AskThread.tsx:129`)
and preserves the last answer — correct M8 error grammar. Unverified.

**mobile-375 (NOT captured):** The sticky composer + gradient + 16px textarea (iOS-zoom-guarded,
`Composer.tsx:86`) need a 375px render to confirm the composer doesn't eat the thread on a short
viewport and tap targets clear 44px. Unverified — this is the highest-risk unaudited state given
the P1.3 composer crop already visible on desktop.
