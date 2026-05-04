# Cross-Document Consistency Audit — Beamix v5 Docs
**Date:** 2026-05-04
**Auditor:** CEO Subagent (cross-doc verification pass)
**Documents reviewed (in order):**
1. `2026-05-04-PRD-wedge-launch-v5.md` (canonical PRD)
2. `2026-05-04-BUILD-PLAN-v3.md` (canonical Build Plan)
3. `2026-05-04-OPTION-E-START-FLOW-SPEC.md` (canonical Option E spec)
4. `2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` (synthesis, Q1–Q13 locked)
5. `2026-04-28-DESIGN-BOARD-ROUND2-3-SYNTHESIS.md` (Round 2/3 synthesis)
6. `2026-04-27-DESIGN-SYSTEM-v1.md` (design system canon)

---

## §1 — Phase Numbering Consistency

### Finding 1.1 — CRITICAL: Phase numbering schema differs between PRD v5 + Flow Synthesis vs. Option E Spec

This is the most significant structural inconsistency in the document set.

**PRD v5 §4 (Architecture Overview) and the Flow Architecture Synthesis** describe a 9-phase flow with Paddle inline (paid checkout) as **Phase 4**, making the phase sequence:
- Phase 0: enter-url
- Phase 1: scanning
- Phase 2: results
- Phase 3: signup-overlay
- **Phase 4: paddle-inline**
- Phase 5: vertical-confirm
- Phase 6: brief-co-author
- Phase 7: brief-signing
- Phase 8: truth-file
- Phase 9: /home (post-onboarding destination)

**The Option E Spec (§2)** describes a different 9-phase flow with NO dedicated paddle-inline phase in the sequence. The Q6 Adam-decision deferred Paddle to post-onboarding. In the Option E Spec, Paddle is Phase 9 ("paid-activation") and is explicitly described as NOT part of the /start flow itself — it is a modal on /home. This makes the spec's sequence:
- Phase 0: enter-url
- Phase 1: scanning
- Phase 2: results
- Phase 3: signup-overlay
- **Phase 4: vertical-confirm** (NOT paddle-inline)
- Phase 5: brief-co-author
- Phase 6: brief-signing
- Phase 7: truth-file
- Phase 8: complete
- Phase 9: paid-activation (on /home — "NOT part of the /start flow itself")

**Build Plan v3 tickets confirm the Option E Spec numbering:**
- T101 = Phase 0 enter-url
- T102 = Phase 1 scanning
- T103 = Phase 2 results
- T104 = Phase 3 signup-overlay
- **T105 = Phase 4 vertical-confirm** (Build Plan calls this Phase 4, not paddle-inline)
- T106 = Phase 5 brief-co-author
- T107 = Phase 6 brief-signing
- T108 = Phase 7 truth-file
- T109 = Phase 8 complete

**PRD v5 F2 v5 acceptance criteria** cross-references phases using the PRD's Phase 4 = paddle-inline numbering. It says: "Phase 4 (paddle-inline): Paddle appears as inline modal within /start." But the Option E spec and Build Plan use Phase 4 = vertical-confirm.

**PRD v5 F51 (Two-Tier Activation)** says: "Customers who dismiss Phase 4 Paddle modal enter Free Account state and continue to Phase 5–8." Under the Option E/Build Plan numbering, there IS no Phase 4 Paddle modal inside /start.

**PRD v5 F12 (Lead Attribution)** says: "Phase 6 (brief-co-author) shows UTM panel first for SaaS-classified customers." Under PRD's own numbering this is Phase 6 = brief-co-author (correct). Under Option E numbering, Phase 6 = brief-signing. This further compounds the cross-doc confusion.

**PRD v5 F42 amendment** says "Phase 7 (brief-signing) footer now includes 'Security & DPA' link." Under PRD v5 §4 numbering (which includes paddle-inline as Phase 4), Phase 7 = brief-signing. Under Option E numbering, Phase 6 = brief-signing.

**Summary of drift:** PRD v5 §4 retained a Phase 4 = paddle-inline numbering from an earlier draft of Option E (before Q6 deferred Paddle to post-onboarding). The Option E Spec correctly reflects the Q6 decision: no Paddle inside /start. The Build Plan tickets correctly map to Option E Spec. PRD v5 §4 and F2/F12/F35/F42/F51 use the stale paddle-inline-as-Phase-4 numbering throughout.

**Severity: 🔴 RED — Blocking.** Build team implements from both PRD v5 and Option E Spec. The phase mismatch will cause implementation confusion at every PRD→ticket mapping point.

### Finding 1.2 — Step 0/1/2/3/4 deprecation: not formally deprecated in PRD v5

The audit brief asked whether PRD v5 explicitly marks "Step 0/1/2/3/4" (the v4 onboarding step language) as DEPRECATED in favor of Phase numbering. PRD v5 §F2 includes the deprecation notice for "F2 Onboarding flow — DEPRECATED (v4 spec)" and replaces it with F2 v5. The DEPRECATION NOTICE at the top correctly deprecates v4 as a whole. However, PRD v5 never explicitly states "Step 1/2/3/4 terminology is retired — use Phase numbering." The Option E Spec uses language such as "current Step 1 in v4" and "current Step 2 in v4" to explain the remapping, which implies but doesn't formally deprecate Step terminology. The Build Plan ticket T120 references "Step 4" in its title ("T120 — Step 4 hours field vertical-conditional") even though it should use Phase 7 language. This is a minor residual inconsistency.

**Severity: 🟡 YELLOW — Minor residue.**

---

## §2 — Tiered Timing Consistency

### Finding 2.1 — F47 (State of AI Search): MVP+90 — CONSISTENT across all docs

PRD v5 §F47: "Priority: MVP+90." Flow Architecture Synthesis §N-6: explicitly deferred. Round 2/3 synthesis R2-15: "LOCK ship at MVP+90." Build Plan v3 T90 (from v2): MVP+90 slot. No inconsistency found.

### Finding 2.2 — F48 (Yossi Agency Batch): MVP+30 — CONSISTENT

PRD v5 F48: "Priority: MVP+30 (Q1 lock — Adam confirmed 2026-05-04)." Build Plan v3 T130: "Tier: 5 (MVP+30)." Q1 in Build Plan locked decisions table: "Yossi agency batch onboarding at MVP+30 (not MVP)." Flow Architecture Synthesis: "Q1: Yossi agency mode at MVP+30." Consistent across all docs.

### Finding 2.3 — F49 (Embeddable Score Badge): MVP+30 — CONSISTENT

PRD v5 F49: "Priority: MVP+30 (Q10 lock)." Build Plan v3 T131: "Tier: 5 (MVP+30)." Q10 in Build Plan: "Embeddable score badge at MVP+30." Consistent.

### Finding 2.4 — F50 (Dogfooding): "built MVP, published MVP+30" — CONSISTENT

PRD v5 F50: "Built at MVP, published at MVP+30 (Q11 lock)." Build Plan v3 T132: "Tier: 5 (build at MVP; publish/announce at MVP+30)." Q11 in Build Plan: "Publish Beamix's own scan publicly (dogfooding) — build at MVP, publish at MVP+30." Consistent.

### Finding 2.5 — F51–F54 (Two-tier activation, sample data, recovery emails, agent caps): MVP — CONSISTENT

PRD v5 lists all four features as MVP priority. Build Plan v3 tickets T112–T118 are in Tier 2. Consistent.

### Finding 2.6 — MINOR: F42 (Trust Center) + SOC 2 Type I timing cross-reference

PRD v5 F42 title says "Trust Center at /trust + SOC 2 Type I — Amendment v5." Body says SOC 2 Type I ships at MVP+90 (same as Round 2/3 synthesis R2-7). Build Plan v3 T129 (SOC 2 tracking note) confirms observation period must START at MVP. No numerical inconsistency, but T129 is Tier 5 (tracking only) — which is correct since the report itself ships at MVP+90. This is consistent.

---

## §3 — Money-Back Guarantee Consistency

### Finding 3.1 — 14/14/30 split consistent across PRD v5 and Build Plan v3

PRD v5 §2 (Pricing): "Refund windows: Discover 14 days, Build 14 days, Scale 30 days."
PRD v5 F35 Amendment v5: "Discover: 14-day money-back. Build: 14-day money-back. Scale: 30-day money-back."
PRD v5 F54: confirms Discover 5 runs / Build 10 / Scale 20 caps during respective 14/14/30-day windows.
Build Plan v3 T116: "Discover ($79): 5 agent runs. Build ($189): 10 agent runs. Scale ($499): 20 agent runs."
Build Plan v3 T117: `REFUND_WINDOW_DAYS = { discover: 14, build: 14, scale: 30 }` constant.
Flow Architecture Synthesis §N-3: "Discover 14d, Build 14d, Scale 30d (if Q8 approved)" — Q8 was approved.
All consistent.

### Finding 3.2 — Option E Spec Phase 9 activation modal copies: CONSISTENT (with annotation)

The Option E Spec Phase 9 (paid-activation modal) Discover card reads: "14-day money-back." Build card reads: "14-day money-back." Scale card reads: "30-day money-back." This is consistent with Q8. The modal copy also says: "14/14/30 money-back guarantee surfaced inline above the Paddle frame." Consistent.

### Finding 3.3 — STALE LANGUAGE: Option E Spec recovery email domain

The Option E Spec §3 (State machine, Transition events) says: "Recovery emails: sent from `notify@notify.beamix.tech`." The correct domain is `notify.beamixai.com` (locked throughout PRD v5 and Build Plan v3). `beamix.tech` is explicitly retired in the PRD v5 preamble. This is a stale domain reference in the Option E Spec.

**Severity: 🔴 RED — Domain error (though in an internal state-machine comment, it could propagate to email config).**

### Finding 3.4 — MISMATCH: Phase 7 money-back guarantee copy

PRD v5 F35 Amendment v5 says: "Customer is notified of cap during Phase 7 (brief-signing)."
PRD v5 F54 says: "Phase 7 (brief-signing) footer: 'Your full scan + [N] agent runs included in your [refund-window-days]-day guarantee period; unlimited after Day [N+1].'"

Under PRD v5's own phase numbering (Phase 7 = brief-signing because Phase 4 = paddle-inline), this is correct.
Under Option E Spec / Build Plan numbering (Phase 6 = brief-signing), the brief-signing phase is Phase 6.
Build Plan v3 T107 (Phase 6 brief-signing component) acceptance criteria: "Money-back guarantee footer: 'All Beamix plans include a 14-day money-back guarantee.' in Geist Mono 11px."
Build Plan v3 T116 disclosure: says "Phase 8 (Complete) component (T109) mentions cap in Geist Mono 11px footer: 'Your first [N] agent runs are included during the [X]-day trial period.'"

PRD says Phase 7 (brief-signing). Build Plan says the cap disclosure is in Phase 8/T109 (Complete). The guarantee line and the cap disclosure appear in different phases depending on which doc you read. This is a consequence of the phase numbering drift in Finding 1.1, cascading into specific acceptance criteria.

**Severity: 🔴 RED — Cascading from the phase numbering drift in Finding 1.1.**

---

## §4 — Activation Event Consistency

### Finding 4.1 — 7-day window post-Paddle: CONSISTENT across all docs

PRD v5 §2: "Trial clock starts at Paddle checkout."
PRD v5 F51 (Two-Tier Activation): "Paid Customer... Trial clock running from Paddle checkout moment."
Build Plan v3 Q4: "Activation = first /inbox approval within 7 days post-Paddle-checkout (extended from 24h per N-2)."
Build Plan v3 Q7: "Activation window extended to 7 days (was 24h at Q4)."
Build Plan v3 T118: "first /inbox approval within 7 days of `subscriptions.paddle_checkout_at`."
Option E Spec §3 state machine: "PAID_ACTIVE — subscriptions.status='active', trial_ends_at set. Activation event clock running (7 days, per Q7)."
Flow Architecture Synthesis §N-2: "Extend activation window to 7 days."
All docs agree: 7 days, post-Paddle.

### Finding 4.2 — Marcus Day-14 evangelism trigger anchor: PARTIALLY CONSISTENT, DRIFT FLAGGED

**PRD v5 F2 v5 "Renewal anchor" note (in Persona A Marcus section):** "The Day 14 event-triggered email — 'a developer found you on Claude' — is the emotional renewal moment."

**PRD v5 §3 Persona A:** Marcus's renewal anchor is "The Day 14 event-triggered email." This paragraph doesn't specify Day 14 from what event.

**Build Plan v3 T118 acceptance criteria:** "Marcus Day-14 evangelism trigger (F12): recalculated from `subscriptions.activated_at` (not from `paddle_checkout_at`); Day 14 from **activation date**, not checkout date."

**Flow Architecture Synthesis §N-2:** "Adjust Marcus's Day-14 evangelism trigger accordingly" (after extending activation to 7 days) — implies it adjusts, but doesn't specify the new anchor.

**PRD v5 F12 (Lead Attribution Loop) cross-reference note:** "Cross-reference: Twilio number provisioning trigger fires at Phase 4 Paddle checkout completion." F12 describes the Day-14 event email in context but doesn't re-specify the new anchor.

There is minor drift here: Build Plan T118 says Day 14 from `activated_at` (the moment of first /inbox approval). The PRD doesn't say this explicitly. The PRD's F12 describes the event email without specifying the new anchor post-Q7. The Build Plan's definition (Day 14 from `activated_at`) is more specific and should be treated as canonical since it's the implementation spec. No contradiction exists, but PRD v5 F12 is silent on the updated anchor.

**Severity: 🟡 YELLOW — PRD v5 F12 needs a one-line clarification of the Day-14 anchor post-Q7.**

### Finding 4.3 — "Within 7 days of Paddle checkout" vs. "within 7 days of Brief signing"

PRD v5 §2 says: "Trial clock starts at Paddle checkout." This is consistent with Q4+Q7. No doc says "trial clock starts at Brief signing." Finding: CONSISTENT, no drift.

---

## §5 — Two-Tier Activation Model Consistency

### Finding 5.1 — Free Account definition: MOSTLY CONSISTENT, one wording discrepancy

PRD v5 F51 defines Free Account as: "post-Brief, pre-Paddle." Specifically: "Customer has completed Phase 7 (Brief signed) but dismissed the Paddle modal in Phase 4."
Option E Spec Phase 8 DB state: "`subscriptions` row exists with `tier=null` and `status='free_account'` (NOT trial)."
Build Plan v3 T96 (account state tokens): "Free Account = signed up + Brief signed + /home with sample data."
Build Plan v3 T112: "Free Account state on /home (post-Brief, pre-Paddle)" — consistent.

The one wording discrepancy: PRD v5 F51 says "Customers who dismiss Phase 4 Paddle modal enter Free Account state." Under Option E/Build Plan numbering there is no Phase 4 Paddle modal — Paddle is deferred to /home entirely. PRD v5's language reflects the stale phase numbering from Finding 1.1. However, the logical intent is consistent: customer skips Paddle and enters Free Account.

**Severity: 🟡 YELLOW — Wording artifact of the phase numbering drift; logical intent consistent.**

### Finding 5.2 — Free Account /home banner copy: MINOR WORDING DISCREPANCY

PRD v5 F5 Amendment: Banner reads: "Beamix is ready — activate your agents to start improving your AI visibility."
Build Plan v3 T112 acceptance criteria: Banner copy: "Your agents are ready. Activate them to start fixing your AI search visibility."

These are two different banner copies for the same banner. Neither cites the other as authoritative.

**Severity: 🟡 YELLOW — Copy needs to be locked to one version. PRD v5 is the feature spec authority; T112 should match PRD v5 F5 wording.**

### Finding 5.3 — Recovery emails anchor: MOSTLY CONSISTENT

PRD v5 F53 says Day-3/Day-7/Day-14 from "Phase 8 completion" (truth-file done).
Build Plan v3 T115 says "elapsed time since `/start` completion" and "based on `(today - onboarding_completed_at)` in days."
Option E Spec Phase 8 (complete): "users.onboarding_completed_at set" when truth file is done.
These all align: the anchor is `onboarding_completed_at`, which is set at truth-file completion. Consistent.

### Finding 5.4 — "Activate agents" CTA also present in /inbox and /crew: CONSISTENT

PRD v5 F51 says: "Activation CTA: persistent 'Activate agents →' banner on /home. Also surfaced in: empty /inbox state, /crew page header." Build Plan v3 T112 covers /home. There is no separate ticket for /inbox and /crew CTA placement — this is an implementation gap in the Build Plan (coverage issue, not a doc-to-doc inconsistency). Flagged as 🟡 YELLOW — the PRD describes the CTA in 3 places; the Build Plan only tickets it in one.

---

## §6 — Voice Canon Model B Consistency

### Finding 6.1 — Agent names in customer-facing copy: NO VIOLATIONS found in reviewed docs

The following agent names were searched across all five documents: "Schema Doctor", "Citation Fixer", "FAQ Agent", "Competitor Watch", "Trust File Auditor", "Reporter."

**Option E Spec Phase 1:** Agent monograms appear as visual artifacts ("Schema Doctor → Citation Fixer → FAQ Agent → Competitor Watch → Trust File Auditor → Reporter → Coverage Mapper → Voice Auditor"). This is within the Phase 1 scanning visual — agent names appear here as part of the in-product scanning experience, not in external copy. However, Phase 1 is technically an onboarding phase. The Design System v1 Voice Canon says agent names are permitted on: "/home (Evidence Strip, Crew at Work, Recent Activity), /crew (the personnel directory), /workspace (the courier-flow execution viewer), /inbox row attribution columns." It does NOT explicitly list the Phase 1 scanning monogram strip.

This is a borderline case: agent names in Phase 1 are visual-only (monograms, not body copy), visible before the customer has signed anything or committed. The Option E Spec itself acknowledges "Voice canon: Model B" in its header, and the Phase 1 agent names are visually present as the "teaser of the crew waiting to work."

The Design System v1 says: "Where ONLY 'Beamix' appears (single-character externally): all emails, Monthly Update PDF, /scan public surface, public permalinks, OG share cards, marketing site copy, /onboarding seal." The /start flow is internal/product — agent names in Phase 1 scanning are technically permitted by the rule (they're internal, not emails/PDF/public). But it's a gray area.

**Conclusion:** No clear voice canon violation, but the Phase 1 agent monogram strip in /start is not explicitly authorized by the Design System v1 permitted-surfaces list. This is a gap to clarify, not a violation.

**Severity: 🟢 GREEN — Gray area; clarify in Design System v1 permitted surfaces.**

### Finding 6.2 — "— Beamix" seal signature: CONSISTENT across all docs

All docs agree: Seal signs "— Beamix." No doc says "— your crew" or any agent name. Design System v1, Option E Spec Phase 6, PRD v5 F2 v5, and Build Plan v3 T107 all specify "— Beamix." Consistent.

### Finding 6.3 — Recovery emails: signed "— Beamix": CONSISTENT

Build Plan v3 T115: "Voice canon Model B compliance: emails signed '— Beamix' not '— your crew' or agent names." PRD v5 F53: all emails "signed '— Beamix'." Consistent.

---

## §7 — Domain Consistency

### Finding 7.1 — CRITICAL: `beamix.tech` still appears in Option E Spec

The Option E Spec §3 (Transition events) contains: "Recovery emails: sent from `notify@notify.beamix.tech`."

The correct address is `notify.beamixai.com`. PRD v5 preamble: "Domain: beamixai.com (all `beamix.tech` references retired)." Build Plan v3 Domain Infrastructure table: "Resend: notify.beamixai.com (Verified)." PRD v5 F14: Resend emails on `notify.beamixai.com`.

This is the only `beamix.tech` reference found in any of the six documents. It's in the Option E Spec state machine section.

**Severity: 🔴 RED — Stale domain in canonical spec. If a developer copies this config it will misconfigure email routing.**

### Finding 7.2 — "BeamixAI" written customer-facing: NO INSTANCES found

No doc uses "BeamixAI" as a customer-facing brand name. All use "Beamix." PRD v5 preamble explicitly prohibits "BeamixAI." Consistent.

### Finding 7.3 — Webhook and email URLs: CONSISTENT

Build Plan v3 Domain Infrastructure: `app.beamixai.com` (product dashboard), `notify.beamixai.com` (email). All ticket acceptance criteria in Build Plan reference these domains. PRD v5 references align. Only the Option E Spec stale email address is the exception (Finding 7.1). No other domain discrepancies found.

### Finding 7.4 — Monthly Update permalink domain

PRD v5 mentions `/r/{nanoid21}` pattern. Build Plan v3 Domain section: "Monthly Update permalinks: `beamixai.com/r/{nanoid21}`." Consistent with the apex domain. No discrepancy.

---

## §8 — Pricing Consistency

### Finding 8.1 — Discover $79 / Build $189 / Scale $499: CONSISTENT across all docs

PRD v5 §2: "Discover $79/mo, Build $189/mo, Scale $499/mo."
Build Plan v3 T116: "Discover ($79): 5 agent runs. Build ($189): 10 agent runs. Scale ($499): 20 agent runs."
Option E Spec Phase 9 tier cards: "Discover — $79/mo. Build (default selected) — $189/mo. Scale — $499/mo."
Flow Architecture Synthesis: does not list prices explicitly but refers to Discover/Build/Scale consistently with PRD.
Round 2/3 Synthesis: references PRD v4 pricing; v4 prices were already $79/$189/$499 per the DECISIONS.md memory.
No old pricing ($49/$149/$349) found in any doc.

### Finding 8.2 — Annual pricing: ONLY in PRD v5, not in other docs (by design)

PRD v5 §2 table: "Discover $63/mo (annual), Build $151/mo (annual), Scale $399/mo (annual)." Option E Spec Phase 9 modal shows an annual toggle but doesn't list specific annual prices. This is expected — the spec describes the toggle UI, not the specific prices (which come from Paddle config). No inconsistency.

### Finding 8.3 — Option E Spec agent run counts in tier cards: DISCREPANCY

Option E Spec Phase 9 tier cards specify agent run counts inline:
- "Discover — $79/mo · 5 agent runs/mo · 14-day money-back."
- "Build (default selected) — $189/mo · 25 runs/mo · 14-day money-back."
- "Scale — $499/mo · 100 runs/mo · 30-day money-back."

PRD v5 F54 (Agent-run caps during refund window) specifies caps of 5/10/20 runs respectively during the refund window — these are caps, not the full monthly allocations. The Option E Spec's "25 runs/mo" and "100 runs/mo" represent the full tier allocations, not caps. These agent run allocation numbers (25/mo for Build, 100/mo for Scale) do not appear in PRD v5's tier table (§2), which only lists Engines (3/6/11), Seats (1/2/5), and Domains. The run allocations seem to have been added to the Option E Spec without PRD v5 validation.

**Severity: 🟡 YELLOW — Agent run allocation numbers in Option E Spec Phase 9 modal copy (25 runs/Build, 100 runs/Scale) are not sourced from PRD v5 §2 tier table. Either PRD v5 §2 is incomplete (missing run allocations) or the Option E Spec numbers are assumptions. Needs one-source resolution.**

---

## §9 — Design System Canon Consistency

The audit checks whether all 10 Tier 0 design system canon items are present across the relevant documents.

### Finding 9.1 — 10 named easing curves: PRESENT in Design System v1, referenced in Build Plan v3

Design System v1 §3.1 lists the 6 distinct curves per moment (seal stamping, ink-bleed, path-draw, card entrance, pill spring, topbar status pulse). Round 2/3 synthesis R2-4 locked "10 named easing curves." Build Plan v3 T58 (from v2) is the Tier 0 ticket for named easing curves in `motion.css`. PRD v5 §11 (Design System Canon — v5 Additions) does not contradict any of these.

**Minor gap:** The Design System v1 lists 6 curves in its motion table and the "distinct curves per moment" section. The Round 2/3 Synthesis says "10 named curves." The Build Plan references T58 for this. The exact count (6 vs. 10) is not reconciled in the Design System v1 itself — the table shows 6 explicit curves, but Vercel's original recommendation was 10 named curves. This is likely a Design System v1 documentation gap.

**Severity: 🟡 YELLOW — Design System v1 should document all 10 named curves by name, not just the 6 used in existing motion tokens.**

### Finding 9.2 — ESLint rules (no-shared-easing, no-banned-status-synonyms, server-only-pdf): PRESENT

Round 2/3 synthesis R2-2 + R2-4 locked these. Build Plan v3 T59 (from v2) covers ESLint rules. PRD v5 Tier 0 Infrastructure list does not mention ESLint rules explicitly, but Build Plan T59 is in the preserved v2 tickets. Design System v1 §Voice Canon mentions a "frontend lint rule" for agent names in email/PDF output. The three specific rules are mentioned in the Round 2/3 synthesis. Consistent in intent; not duplicated across all docs (by design — the Build Plan is the implementation home for ESLint tickets).

### Finding 9.3 — Variable Inter + subset Fraunces (~140KB savings): CONSISTENT

Round 2/3 synthesis R2-5: locked. Design System v1 §1.2 typography: "InterDisplay — CSS name: 'InterDisplay', sans-serif, weights: 500." Does NOT say "variable Inter." This is a minor inconsistency: Round 2/3 synthesis locked "Variable Inter only" (eliminates separate InterDisplay file) but Design System v1 still lists InterDisplay as a separate family. Design System v1 predates the Round 2/3 amendment.

**Severity: 🟡 YELLOW — Design System v1 §1.2 font families table still lists InterDisplay as a separate family. Should be updated to reflect "Variable Inter (covers InterDisplay axis)" per Round 2/3 lock R2-5.**

### Finding 9.4 — Heebo 300 italic for Hebrew (Q2): PRESENT and CONSISTENT

Q2 locked in Build Plan v3. Build Plan v3 T93 provides the full acceptance criteria. PRD v5 F2 v5 acceptance criteria: "Phase 6: Heebo 300 italic loaded and active on `[lang="he"]` pages as Fraunces companion font." Option E Spec Phase 5 (brief-co-author): "Heebo 300 italic loaded if `[lang="he"]` (Q2 lock)." Design System v1 §1.2: does NOT mention Heebo (Design System v1 predates Q2 decision). Round 2/3 synthesis: does not mention Heebo (that decision came later, in the onboarding audit session).

**Minor gap:** Design System v1 typography section does not include Heebo 300 italic. As the canonical design system document, it should document this font even though the Q2 decision came after v1 was written. Not an inconsistency between the 5 audited docs — more of a Design System v1 update gap.

**Severity: 🟢 GREEN — Design System v1 needs a Heebo row added to §1.2 font families table. PRD/Build Plan/Option E Spec are consistent with each other.**

### Finding 9.5 — Status vocabulary lock (14 canonical terms): CONSISTENT

Round 2/3 synthesis R2-2: locked 14-word vocabulary + ESLint rule. Design System v1 §4.1 StatusToken: defines 3 states (Healthy, Acting, NeedsYou). The 14 canonical status terms are not enumerated in Design System v1 §4.1 — only the 3 StatusToken states appear. Build Plan v3 T59 references the vocabulary lock. The Design System v1 predates the full 14-word lock.

**Severity: 🟡 YELLOW — Design System v1 §4.1 should include the 14-word canonical status vocabulary table, not just the 3 StatusToken states. Currently the full list exists only in the Round 2/3 synthesis and Build Plan T59.**

### Finding 9.6 — Cream-paper-stays-light forever partition (8 surfaces): CONSISTENT

Round 2/3 synthesis R2-3: locked. Design System v1 §1.1: "The editorial artifact register. Reserved strictly for: Brief background, Monthly Update PDF, /scan public hero section, email digest header strip (32px), OG share card." Option E Spec §1: "Cream is forever-light; never dark-mode swap." Build Plan v3 T65 (from v2): cream partition. PRD v5: no contradiction.

The specific count "8 surfaces" appears in the audit prompt. The Round 2/3 synthesis says "6 admin-utility surfaces ship dark mode at MVP+30; 8 cream-register surfaces stay light forever." The Design System v1 lists the cream surfaces but doesn't say "8 surfaces." The number 8 appears only in the synthesis. Consistent in substance.

### Finding 9.7 — Block primitive interfaces (18 primitives): CONSISTENT (background item)

Round 2/3 synthesis R2-11: "18 block primitives... TypeScript interfaces + Storybook." Design System v1: does not enumerate the 18 primitives by name. Build Plan v2 T-architectural: covered in v2 tickets (not in scope for v3 new tickets). This is an architectural canon item noted in Round 2/3 synthesis; its implementation lives in the Build Plan. No contradiction found.

### Finding 9.8 — Speed CI gate: CONSISTENT

Round 2/3 synthesis R2-13: locked "Playwright + Lighthouse at PR." Build Plan v3 (inherited from v2): speed CI gate ticket exists. PRD v5: no contradiction. Consistent.

### Finding 9.9 — Phase-transition motion canon (NEW Q12-related): PRESENT in Build Plan, NOT in PRD v5 §11

Build Plan v3 T94: "Phase-transition motion canon: 140ms cross-fade default + Phase 6 Seal exception." PRD v5 §11 (Design System Canon — v5 Additions) does not explicitly list the phase-transition motion canon. The section should enumerate this as a Tier 0 design system addition since it's a new named constant.

**Severity: 🟡 YELLOW — PRD v5 §11 should mention the phase-transition timing constants (`--duration-phase-transition: 140ms`, `--duration-seal-ceremony: 540ms`) as part of the v5 design system additions.**

### Finding 9.10 — Two-tier UI state tokens (NEW Q6-related): PRESENT in Build Plan T96, referenced in PRD v5 F51

Build Plan v3 T96: full token spec for Free Account and Paid Customer tokens. PRD v5 F51: references the token treatment. PRD v5 §11: does not list the new token group by name. Same gap as Finding 9.9.

**Severity: 🟡 YELLOW — PRD v5 §11 should list the two-tier UI state tokens as a design system canon addition.**

---

## §10 — General Drift Sweep

### Finding 10.1 — Feature count: PRD v5 lists F1–F54. Build Plan v3 Executive Overview says 133 tickets total.

PRD v5 has 54 features numbered F1–F54. The feature count is internally consistent within PRD v5 (F48–F54 are "NEW" additions). No cross-doc feature count mismatch found.

### Finding 10.2 — Option E Spec §4 data flow table: Phase numbering uses Option E numbering (correct), but one row is ambiguous

Option E Spec §4 data flow table row: "3 → 4: `users` (insert via Supabase Auth)" — in the Option E Spec, Phase 3 = signup-overlay and Phase 4 = vertical-confirm. This is correct per Option E Spec's own numbering (user is created at Phase 3 auth, Phase 4 begins vertical-confirm). No issue.

But the table also says: "4 → 5: `businesses` (insert)" — Phase 4 = vertical-confirm creates `businesses`. Phase 5 = brief-co-author. Consistent with Option E Spec.

The drift is that PRD v5 §4 Architecture Overview says: "`business_id` created at Phase 5 (vertical confirmed)." Under PRD v5's phase numbering (where Phase 4 = paddle-inline and Phase 5 = vertical-confirm), this is correct. Under Option E Spec's numbering (Phase 4 = vertical-confirm), the business_id should be created at Phase 4. This is another cascade of the phase numbering drift in Finding 1.1.

**Severity: 🔴 RED — Cascade of Finding 1.1. The data carry-over table in PRD v5 §4 uses PRD's Phase 4 = paddle-inline numbering; the Option E Spec's §4 table uses Phase 4 = vertical-confirm. Developers will be confused about which phase creates the `business_id`.**

### Finding 10.3 — Scan count in Option E Spec Phase 2 subheadline: "4 engines"

Option E Spec Phase 2 hero subheadline: "Across 4 engines, 12 prompts, 47 sources." PRD v5 F15: "11 text AI engines" at full coverage; Discover tier gets 3 engines. The Phase 2 results page in /start is shown before the customer selects a tier. Showing "4 engines" suggests the scan ran against 4 engines (plausible for a free scan preview), but this is not explicitly stated anywhere in PRD v5 or Build Plan v3 as the free-scan engine count. The free scan engine count is ambiguous.

**Severity: 🟡 YELLOW — The free scan (pre-signup) engine count is unspecified in PRD v5 F1. Option E Spec says "4 engines" in a subheadline without citing this as a decision. PRD v5 F15 says 3 engines for Discover and 11 for Build/Scale, but doesn't specify the free scan engine count. Needs clarification.**

### Finding 10.4 — Option E Spec Phase 1 scanning shows "8 monogram tiles" (8 agents), but MVP agent roster is 6

Option E Spec Phase 1 body: "A horizontal strip of 8 monogram tiles. Order: Schema Doctor → Citation Fixer → FAQ Agent → Competitor Watch → Trust File Auditor → Reporter → Coverage Mapper → Voice Auditor."

PRD v5 F7 (MVP agent roster): 6 agents. Agents deferred: "Brand Voice Guard, Long-form Authority Builder (MVP-1.5). Content Refresher, Trend Spotter, Citation Predictor, Local SEO Specialist (Year 1)."

"Coverage Mapper" and "Voice Auditor" are listed in the Phase 1 monogram strip but not in PRD v5 F7 as MVP agents. They appear in the Phase 1 display as a teaser/preview, not as fully active agents. However, the PRD v5 MVP roster only has 6 agents (Schema Doctor, Citation Fixer, FAQ Agent, Competitor Watch, Trust File Auditor, Reporter). Showing 8 monograms including 2 non-MVP agents in the onboarding scanning view is a product decision that isn't documented in PRD v5.

**Severity: 🟡 YELLOW — Option E Spec Phase 1 shows 8 agent monograms; MVP agent roster is 6. The extra 2 agents (Coverage Mapper, Voice Auditor) are not in PRD v5 F7. Either Phase 1 should show 6 monograms, or PRD v5 F7 should explicitly permit "preview monograms for deferred agents" in Phase 1.**

### Finding 10.5 — "Seal size" discrepancy between Design System v1 and Option E Spec Phase 6

Design System v1 §2.3 Seal sizes: "Brief completion (onboarding step 3): 24×24 — Animated stamp on approval."
Option E Spec Phase 6: "The Seal — a 96×96 px hand-drawn Rough.js sigil mark."

These are dramatically different sizes. The Design System v1 was written before Option E; the 24×24 size was for "onboarding step 3" (the old 4-step flow). The Option E Spec Phase 6 expanded the Seal to 96×96 for the full signing ceremony. This is likely an intentional upgrade to the signing ceremony, but the Design System v1 §2.3 was not updated to reflect it.

**Severity: 🟡 YELLOW — Design System v1 §2.3 Seal size for "Brief completion" should be updated from 24×24 to 96×96 per Option E Spec Phase 6.**

### Finding 10.6 — Cross-reference to "Phase 9" is inconsistent

PRD v5 §4 Architecture Overview says: "Phase 9 — /home (post-onboarding, first dashboard visit)." This uses the PRD's numbering where /home is Phase 9 after paddle-inline is Phase 4.

Option E Spec's Phase 9 is "paid-activation" (the Paddle modal on /home). The Option E Spec explicitly states "Phase 9 is NOT part of the /start flow itself."

Build Plan v3 T109 is "Phase 8 `complete` component." T109 references "Flow Architecture Synthesis §Phase 9 ('/home' destination)." This means the Build Plan uses Phase 9 = /home destination (not the Paddle modal).

Three interpretations of "Phase 9" exist across documents:
1. PRD v5 §4: Phase 9 = /home (the post-onboarding first dashboard visit)
2. Option E Spec: Phase 9 = paid-activation (Paddle modal on /home, not in /start)
3. Build Plan v3 T109: Phase 9 = /home destination (same as PRD §4)

The Option E Spec's Phase 9 is a different construct (the Paddle modal) that happens on /home, not a phase of /start itself. PRD v5 and Build Plan agree that /home is the destination after /start. The Option E Spec's "Phase 9" label is confusing because it applies the phase label to a post-/start event.

**Severity: 🟡 YELLOW — "Phase 9" is ambiguous across the three documents. Should be clarified: /start has 9 phases (0–8), /home has a separate paid-activation modal that is not a phase of /start.**

### Finding 10.7 — Option E Spec §4 data flow: `paddle_subscription_id` created at Phase 9

Option E Spec §4: "`paddle_subscription_id` created at Phase 9 (post-/home)" — this correctly reflects the Q6 deferral. But PRD v5 §4 data carry-over table says: "`paddle_subscription_id` — Created at phase: Phase 4 (if completed)." Under PRD v5's own numbering, Phase 4 = paddle-inline = inside /start. Under Q6 (Paddle deferred to /home), the `paddle_subscription_id` is created on /home, not during /start at all.

This is another cascade of Finding 1.1: PRD v5 §4's data carry-over table still says paddle_subscription_id is created at Phase 4 (inside /start), which contradicts the Q6 decision. Q6 was: "Paddle inline-overlay placement during `/start` (no redirect) — deferred post-onboarding phases (Free Account gates the modal, not onboarding)."

**Severity: 🔴 RED — PRD v5 §4 data carry-over table says paddle_subscription_id created at Phase 4 inside /start. Q6 + Option E Spec say Paddle is on /home. Contradicts Q6 directly.**

---

## §11 — Severity-Ranked Issue List

### 🔴 CRITICAL (must fix before implementation begins)

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| C-1 | Phase numbering schema drift: PRD v5 uses Phase 4 = paddle-inline (inside /start); Option E Spec + Build Plan use Phase 4 = vertical-confirm (Paddle deferred to /home). All PRD v5 cross-references to phases 4–9 are off-by-one relative to Option E Spec / Build Plan. | PRD v5 §4, F2, F12, F35, F42, F51 vs. Option E Spec + Build Plan T101–T109 | Will cause systematic implementation errors at every PRD→ticket mapping |
| C-2 | PRD v5 §4 data carry-over table says `paddle_subscription_id` created at Phase 4 inside /start. Q6 + Option E Spec say Paddle is on /home post-onboarding. Direct contradiction of locked decision Q6. | PRD v5 §4 data carry-over table | Agent activation, Twilio provisioning, trial clock anchor all wrong |
| C-3 | Option E Spec §3 state machine says recovery emails sent from `notify@notify.beamix.tech`. Correct domain is `notify.beamixai.com`. `beamix.tech` is explicitly retired. | Option E Spec §3 Transition events | Will misconfigure Resend email routing if copied directly |
| C-4 | Money-back guarantee cap disclosure placed at "Phase 7 (brief-signing)" in PRD v5 F35/F54, but at "T109 Phase 8 Complete" in Build Plan v3. Different phases due to cascade from C-1. | PRD v5 F35, F54 vs. Build Plan v3 T116 | Frontend team will implement cap disclosure in wrong phase |

### 🟡 IMPORTANT (fix before content freeze or first build sprint)

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| I-1 | Free Account /home banner copy differs: PRD v5 F5 says "Beamix is ready — activate your agents to start improving your AI visibility." Build Plan T112 says "Your agents are ready. Activate them to start fixing your AI search visibility." | PRD v5 F5 vs. Build Plan T112 | Two different banner strings in product |
| I-2 | Option E Spec Phase 9 tier cards show agent run allocations (Build: 25 runs/mo, Scale: 100 runs/mo) not present in PRD v5 §2 pricing table. | Option E Spec Phase 9, PRD v5 §2 | Tier pricing table incomplete; modal copy may ship with unvalidated run counts |
| I-3 | Option E Spec Phase 1 shows 8 agent monograms (including Coverage Mapper + Voice Auditor). PRD v5 F7 MVP agent roster has 6 agents. Two non-MVP agent names appear in an onboarding context. | Option E Spec Phase 1, PRD v5 F7 | Non-MVP agent names visible in /start before customer selects a plan |
| I-4 | Marcus Day-14 evangelism trigger anchor: PRD v5 F12 is silent on the updated anchor post-Q7. Build Plan T118 says Day 14 from `activated_at`. | PRD v5 F12 vs. Build Plan T118 | F12 email implementation may use wrong anchor |
| I-5 | Design System v1 §1.2 still lists InterDisplay as a separate font family. Round 2/3 synthesis R2-5 locked "Variable Inter only (eliminates InterDisplay file)." | Design System v1 §1.2 | Two conflicting font loading strategies |
| I-6 | Design System v1 §2.3 Seal size for Brief completion: 24×24. Option E Spec Phase 6: 96×96. | Design System v1 §2.3 vs. Option E Spec Phase 6 | Seal component built at wrong size |
| I-7 | Design System v1 §4.1 does not enumerate the 14-word canonical status vocabulary. The list lives only in Round 2/3 synthesis and Build Plan T59. | Design System v1 §4.1 | Developers without access to synthesis doc cannot find the 14-word lock |
| I-8 | PRD v5 §11 missing: phase-transition timing constants (--duration-phase-transition: 140ms, --duration-seal-ceremony: 540ms) and two-tier UI state tokens as named v5 design system additions. | PRD v5 §11 | Tier 0 design system additions not fully inventoried in PRD |
| I-9 | Free scan engine count unspecified: Option E Spec Phase 2 says "4 engines" in the subheadline. PRD v5 F1 and F15 do not define how many engines run on a free scan. | Option E Spec Phase 2, PRD v5 F1/F15 | /start Phase 2 copy may ship with unvalidated engine count claim |
| I-10 | "Phase 9" is ambiguous: PRD v5 §4 + Build Plan T109 use Phase 9 = /home destination. Option E Spec uses Phase 9 = paid-activation Paddle modal on /home (not a /start phase). | Option E Spec, PRD v5 §4, Build Plan T109 | Developer confusion about what Phase 9 refers to |
| I-11 | Step-terminology residue: Build Plan T120 title says "Step 4 hours field vertical-conditional" — should use Phase 7 language per Option E Spec. | Build Plan v3 T120 | Minor label inconsistency in backlog |
| I-12 | Free Account "Activate agents" CTA on /inbox and /crew: described in PRD v5 F51, but no Build Plan tickets cover /inbox and /crew placement. | PRD v5 F51 vs. Build Plan coverage | CTA placement in /inbox + /crew unticketted |

### 🟢 MINOR (address in next doc update cycle)

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| M-1 | Agent names in Phase 1 scanning monogram strip (/start): technically within product surfaces (not external), but not explicitly permitted in Design System v1 Voice Canon permitted-surfaces list. | Option E Spec Phase 1 vs. Design System v1 Voice Canon | Gray area; clarify in Design System v1 |
| M-2 | Design System v1 §1.2 does not include Heebo 300 italic (Q2 decision came after v1 was written). | Design System v1 §1.2 | Font families table incomplete |
| M-3 | Design System v1 motion token table: lists 6 distinct curves. Round 2/3 synthesis says "10 named curves." The count discrepancy is undocumented. | Design System v1 §3.1 vs. Round 2/3 synthesis R2-4 | Named curve library may be incomplete |

### ✅ CONSISTENT (no issues)

| Area | Result |
|------|--------|
| F47 State of AI Search timing (MVP+90) | Consistent across all 5 docs |
| F48 Yossi timing (MVP+30) | Consistent |
| F49 badge timing (MVP+30) | Consistent |
| F50 dogfooding timing (built MVP, published MVP+30) | Consistent |
| F51–F54 timing (MVP) | Consistent |
| 14/14/30 money-back split | Consistent (PRD v5, Build Plan T116/T117, Option E Spec Phase 9) |
| 7-day activation window post-Paddle | Consistent (all docs) |
| Discover $79 / Build $189 / Scale $499 pricing | Consistent (all docs) |
| Annual pricing ratios | Consistent |
| No old $49/$149/$349 pricing | Confirmed clean |
| "— Beamix" Seal signature | Consistent |
| Recovery emails signed "— Beamix" | Consistent |
| beamixai.com as apex domain | Consistent except Option E Spec state machine (C-3) |
| No "BeamixAI" customer-facing | Confirmed clean |
| Free Account definition (post-Brief, pre-Paddle) | Consistent |
| Refund window starts at Paddle checkout | Consistent |
| Cream-paper-stays-light partition | Consistent |
| Speed CI gate | Consistent |
| Block primitive interfaces (18) | Consistent |

---

## Verdict: PASS-WITH-MINOR-FIXES

The document set is internally coherent on pricing, timing, money-back windows, activation anchors, voice canon, and domain usage (with one stale exception). The document set has **four critical issues** (C-1 through C-4) that share a single root cause: **the PRD v5 §4 phase numbering was not fully updated when Q6 (Paddle deferred post-onboarding) was locked.** PRD v5 §4 and the data carry-over table retained the old "Phase 4 = paddle-inline inside /start" numbering, while the Option E Spec and Build Plan both correctly reflect Q6 by removing Paddle from the /start phase sequence.

**The four critical issues are all downstream of one root fix: update PRD v5 §4 to remove paddle-inline from the /start phase sequence and renumber accordingly (Phase 4 = vertical-confirm, Phase 5 = brief-co-author, Phase 6 = brief-signing, Phase 7 = truth-file, Phase 8 = complete), consistent with the Option E Spec and Build Plan tickets T101–T109.**

Fixing C-1 resolves C-2 and C-4 as cascades. C-3 (wrong domain in Option E Spec) is an independent fix.

No contradictions were found on the core product strategy, pricing, personas, or launch timing.

---

*End of cross-doc consistency audit. Output: `2026-05-04-VERIFICATION-cross-doc-consistency.md`.*
