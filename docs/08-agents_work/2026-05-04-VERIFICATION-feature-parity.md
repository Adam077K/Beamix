# PRD v4 → v5 Feature Parity Verification Audit

**Date:** 2026-05-04
**Auditor:** Product Lead (verification agent)
**Source documents:**
- `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v4.md` (canonical predecessor — F1–F47)
- `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.md` (new canonical — F1–F54)
- `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` (13 Q-decisions)
- `docs/08-agents_work/2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` (12 onboarding fixes)
**Purpose:** Confirm NO feature, acceptance criterion, or design detail was lost in the v4→v5 consolidation.

---

## §1 — Feature ID Coverage Table (F1–F54)

| Feature ID | Present in v5? | Amendments Preserved? | Issues Found |
|------------|---------------|----------------------|--------------|
| F1 /scan public | Yes — with Amendment v5 | Yes — "Claim this scan" CTA, /start routing, 14-day guarantee surfaced on page | MINOR: v4 stated the guarantee is shown as part of a two-column tier picker. v5 shows it as a footer line below the tier picker. Substance identical; placement slightly reworded. |
| F2 Onboarding flow | Yes — DEPRECATED (v4 spec) + replaced by F2 v5 `/start` unified route | DEPRECATED notice present; replacement clearly labeled. All 9 phases of /start specified. | See §3 for deep-dive. Several v4 F2 ACs are not explicitly restated — they are assumed absorbed by §4 Architecture Overview. Risk of implementation gap. |
| F3 Truth File | Yes — "(No changes from v4. Full spec preserved.)" | Yes — base schema, SaaS extension, e-commerce extension, all ACs present | Clean. |
| F4 Pre-publication validation | Yes — with Amendment v5 for billing placement | Yes — Free Account billing state correctly added. All v4 ACs present. | MINOR: The deprecation header on F4 is confusing — it says "DEPRECATED (v4 spec)" but then immediately presents a full unchanged spec. The deprecation language applies only to the billing story embedded in v4, not F4 itself. A reader could misread F4 as deprecated. Should be labeled "Amendment" not "DEPRECATED." |
| F5 /home | Yes — with Amendment v5 for Free Account state | Yes — all 8 locked sections preserved, Free Account banner + sample data correctly added | Clean. |
| F6 /inbox | Yes — "(Spec unchanged from v4.)" + sample item note | Yes — all ACs from v4 present. New AC for sample /inbox items added. | Clean. |
| F7 MVP agent roster | Yes — "(Spec unchanged from v4.)" | Yes — all 6 agents with descriptions; voice canon; deterministic seed rule | MINOR: v4 F7 had full paragraph descriptions per agent including which schema types each emits. v5 condenses to 1-line summaries per agent. Substance is the same but granular spec (e.g., "generates `llms.txt` manifest" for Schema Doctor) is still present. No information loss confirmed on close read. |
| F8 /workspace | Yes — "(Spec unchanged from v4.)" | Yes — execution-as-narration, all ACs present | MINOR: v4 had the explicit "Agent name shown in /workspace header (in-product surface, Voice Canon Model B)" AC. v5 compressed ACs do not include this line explicitly. It is implied by Voice Canon Rule but not stated as a checkbox AC. |
| F9 /scans | Yes — "(Spec unchanged from v4.)" | Yes — all ACs present. | MINOR: v4 had "Brief grounding citation visible in Done lens row expansion per F30 specification" as an explicit AC. v5 compressed ACs omit this line. Cross-reference to F30 is intact but the explicit per-surface AC is missing from the checkbox list. |
| F10 /competitors | Yes — "(Spec unchanged from v4.)" | Yes — all ACs present | Clean. |
| F11 /crew | Yes — "(Spec unchanged from v4.)" | Yes — all ACs present including autonomy selector, 500-char custom instructions, schedule override | MINOR: v4 explicitly stated "Per-agent autonomy level is independent per agent and per client" — this cross-client independence clause is not in v5's compressed AC list. |
| F12 Lead Attribution Loop | Yes — "(No changes from v4.)" + Free Account cross-reference | Yes — all ACs present. Twilio trigger correctly tied to Paddle checkout. | Clean. |
| F13 /settings | Yes — "(Spec unchanged from v4.)" | Yes — all tabs listed; ACs present. "Privacy & Data" tab present (referenced from F34). | Clean. |
| F14 Email infrastructure | Yes — "(Spec unchanged from v4, with email count update.)" | Yes — cadence preserved. Template count 15 → 18 correct. F53 cross-link present. | MINOR: v4 explicitly stated "Monthly Update PDF attachment included in delivery email regardless of permalink privacy" as a checkbox AC. v5 has this ("attachment included regardless of permalink privacy setting") — verified present. Clean. |
| F15 11 text AI engine coverage | Yes — "(Spec unchanged from v4.)" | Yes — all ACs present | Clean. |
| F16 2 vertical knowledge graphs | Yes — "(Spec unchanged from v4.)" | Yes — all ACs present | Clean. |
| F17 Marketplace | Yes — "(Spec unchanged from v4.)" | Yes — constrained scope preserved. "No Hall of Fame" omitted but "no leaderboards, no rev-share" present. No information loss on substance. | MINOR: v4 explicitly stated "No grant references, no Hall of Fame" in addition to no leaderboards and no rev-share. v5 says "no leaderboards, no rev-share references." The Hall of Fame and grant exclusions are dropped from the AC list. Low risk — these were specific Board 2 discussion artifacts, but should be preserved. |
| F18 Incident runbook | Yes — "(Spec unchanged from v4.)" | Yes — all ACs present | Clean. |
| F19 Workflow Builder | Yes — "(Spec unchanged from v4. Scale-only. React Flow DAG editor. Cream-paper canvas.)" + "See full v4 spec for complete acceptance criteria. No changes in v5." | PROBLEM: v5 says "See full v4 spec for complete acceptance criteria" — this is a lazy cross-reference to a deprecated document. The v5 PRD should be self-contained. F19 has extensive ACs in v4 (node anatomy, handle visibility, Brief grounding cell in inspector, dry-run mode, etc.) that are NOT reproduced in v5. A build team reading only v5 would not find these ACs. | CRITICAL: F19 ACs are not included in v5. "See full v4 spec" is a broken reference to a deprecated document. |
| F20 /security public page | Yes — "(Spec unchanged from v4. Aria's 5 fixes applied.)" | ACs not reproduced. Same issue as F19 — v5 says "unchanged" and "3 person-days" but does not include any ACs. | IMPORTANT: F20 has 12 explicit ACs in v4 including "cream hex selection: research and confirm from 3 swatches" and the "cannot publish" vs "refuses to publish" voice canon. None appear in v5 body. |
| F21 Scale-tier DPA | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | IMPORTANT: Same issue — F21 has 6 ACs in v4 including indemnification cap ($25K/incident), Paddle DPA signing at checkout, tech E&O insurance minimum. Not in v5. |
| F22 AI Visibility Cartogram | Yes — with Amendment v5 (Phase 2 of /start added) | Yes — core spec preserved; v5 amendment adds Phase 2 surface. All v4 ACs listed as "preserved" + new Phase 2 AC added. | MINOR: v4 Amendment had "pilot readability validation: show 10 customers and confirm in under 10 seconds without instruction" — not in v5 ACs. Low risk but a measurable quality gate dropped. |
| F23 Cycle-Close Bell | Yes — "(Spec unchanged from v4. Amendment: Wave added in v4 Amendment preserved.)" | ACs not reproduced in v5 body. v5 says "Priority: MVP" only. | IMPORTANT: F23 has 9 detailed ACs in v4 including easing curves per motion moment, exact ms durations, non-replay rule, sequence order. These are not in v5. The reference to "Wave added in v4 Amendment preserved" is the only callout. |
| F24 Brief Re-Reading | Yes — "(Spec unchanged from v4.)" | ACs not reproduced in v5. | IMPORTANT: F24 has 10 ACs in v4 including auto-redirect timer (3-second countdown line), timezone-awareness, dismiss-equals-looks-good behavior. Not in v5. |
| F25 Receipt-That-Prints card | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | IMPORTANT: F25 has 9 ACs in v4 including 96px height, clip-path entrance animation, 24h lifetime, "does not appear if PDF generation fails" rule. Not in v5. |
| F26 Print-Once-As-Gift | Yes — "(Spec unchanged from v4. Explicitly Post-MVP.)" | ACs not reproduced. | Same pattern — unchanged features have zero ACs in v5. Post-MVP status correctly preserved. |
| F27 Print-the-Brief button | Yes — "(Spec unchanged from v4. Now fires at end of Phase 7.)" | ACs not reproduced. | IMPORTANT: F27 has 7 ACs in v4 including 8-second timer (NOW CHANGED: v5 WCAG fix removes the auto-dismiss timer — this is a spec conflict. See §5 item 5 below). |
| F28 "What Beamix Did NOT Do" | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F29 Printable A4 ops card | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F30 Brief grounding citation | Yes — with Amendment v5 (Phase 6 right-column preview) | Yes — core spec unchanged text present; Amendment v5 adds preview with its own ACs | MINOR: v4 Amendment v4 (Extend to API) — "Every Beamix API response includes `authorized_by_brief_clause` field" — this v4 amendment is not mentioned in v5. It may be intentionally deferred but is not marked as such. |
| F31 Brief binding line | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern as F23–F29. |
| F32 Brief Re-author + Undo Window | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F33 Team Seats + Role Permissions | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F34 Customer Data Export | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. F34 had extensive ACs including the Privacy & Data tab required content (storage region statement, encryption statement, training opt-out, data retention summary, sub-processors link, DSAR link, section header). |
| F35 Graceful Cancellation | Yes — with 3 Amendment v5 blocks | Yes — all 3 amendments present and clearly labeled. v4 ACs noted as "preserved, plus" new ACs. | Clean. Best-practice Amendment block in the document. |
| F36 Domain Migration Flow | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F37 /reports | Yes — "(Spec unchanged from v4. No changes in v5.)" | ACs not reproduced. | Same pattern. |
| F38 Subscription Pause | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F39 Competitor Removal | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F40 Multi-Domain Scale Tier | Yes — "(Spec unchanged from v4. No changes in v5.)" | ACs not reproduced. | Same pattern. |
| F41 Cmd-K command bar | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F42 Trust Center | Yes — with Amendment v5 (/trust crosslink from Phase 7) | Yes — Amendment correctly labeled. "See v4 criteria preserved, plus" structure used. | MINOR: v4 ACs included "Customer in Israel: DPA includes hebrew-language-supplement note" and "Customer is Yossi (multi-client agency): DPA addendum for sub-vendor pass-through" and "Sub-processor mid-audit: 'audit in progress' status row." These edge-case ACs not in v5's "preserved plus" list. |
| F43 Vulnerability disclosure | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F44 /changelog | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F45 Compact mode toggle | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F46 Editorial error pages | Yes — "(Spec unchanged from v4.)" | ACs not reproduced. | Same pattern. |
| F47 State of AI Search 2026 | Yes — "(Spec unchanged from v4. Ships MVP+90.)" | ACs not reproduced. Priority correctly maintained at MVP+90. | Same pattern. |
| F48 Agency Batch Onboarding | Yes — NEW. MVP+30. | Full spec present with ACs. Matches Q1 lock. | Clean. |
| F49 Embeddable Score Badge | Yes — NEW. MVP+30. | Full spec present with ACs. Matches Q10 lock. | Clean. |
| F50 Public Dogfooding Scan | Yes — NEW. Built MVP / published MVP+30. | Full spec present with ACs. Matches Q11 lock. | Clean. |
| F51 Two-Tier Activation Model | Yes — NEW. MVP. | Full spec present with ACs. Matches Q6 lock. | Clean. |
| F52 Free Account Sample Data | Yes — NEW. MVP. | Full spec present with ACs. | Clean. |
| F53 Day-N Free Account Recovery Emails | Yes — NEW. MVP. | Full spec with email copy, timing, suppression rules, ACs. | Clean. |
| F54 Refund Risk: Agent-Run Caps | Yes — NEW. MVP. | Full spec with cap enforcement logic, ACs. Matches Q8 lock. | Clean. |

### §1 Summary Finding — Systemic Pattern

Features F19–F32, F34, F36–F46 all follow the same pattern: v5 writes "(Spec unchanged from v4.)" and provides only a priority line, with NO acceptance criteria reproduced. This creates a broken reference structure. A build team using v5 as the sole source of truth — which is required by the "v4 deprecated, do not reference" rule — cannot find the ACs for 24+ features. This is the single largest structural problem in v5.

---

## §2 — Q1–Q13 Decision Coverage Table

| Q# | Decision | Present in v5? | Acceptance Criteria Match? | Drift? |
|----|---------|---------------|--------------------------|--------|
| Q1 | Yossi agency batch onboarding at MVP+30 | Yes — F48 with "MVP+30 (Q1 lock)" label | Yes — 9 ACs present, MVP+30 scope correct | Clean. |
| Q2 | Heebo 300 italic as Hebrew companion | Yes — §11 Design System Canon "Hebrew typography stack (Q2 lock)" | Yes — conditional loading rule, `dir="ltr"` for Geist Mono, next/font config specified | Clean. |
| Q3 | Brief grounding preview at MVP in Phase 6 | Yes — F30 Amendment v5 + F2 v5 Phase 6 spec | Yes — right-column preview, real-time update, labeled "This is how Beamix will cite your Brief" | Clean. |
| Q4 | Activation = first /inbox approval within 7 days post-Paddle | Partially — F2 v5 Phase 9 mentions activation gate; F51 mentions "trial clock running from Paddle checkout" | DRIFT: The synthesis document shows Q4 was originally "within 24h" and Q7 extended it to "7 days." v5 F2 Phase 4 says "Trial clock starts here (Q4 + Q7 lock: activation = first /inbox approval within 7 days of this moment)." The analytics events spec and lifecycle email triggers for this redefinition are not specified anywhere in v5. F12 (Lead Attribution) is not updated to reflect the new 7-day activation window. The Day-14 Marcus evangelism trigger timing in F12 may be stale. |
| Q5 | Quiet "Security & DPA" footer link in Phase 7 | Yes — F2 v5 Phase 7 AC: "Phase 7: 'Security & DPA' footer link visible (13px ink-3, links to /trust)" + F42 Amendment v5 specifying the link treatment | Yes — treatment specified, linked to /trust, non-intrusive weight confirmed | Clean. |
| Q6 | Paddle inline overlay, not redirect | Yes — F51 Two-Tier Activation Model (Q6 lock) + F2 v5 Phase 4 spec | Yes — inline modal, dismissable, Free Account state on dismiss | Clean. |
| Q7 | 7-day activation window | Partially — referenced as "Q4 + Q7 lock" in F2 v5 Phase 4 | DRIFT: Q7 extended the activation window from 24h to 7 days, but the specific analytics events and lifecycle email triggers that depend on this window are not updated in v5. See Q4 notes above. F35 Amendments don't mention the 7-day window adjustment. |
| Q8 | 14/14/30 split + agent-run caps | Yes — F35 Amendment v5 (refund windows) + F54 (agent-run caps) | Yes — Discover 14d, Build 14d, Scale 30d. Caps: 5/10/20. Both correctly specified. | Clean. |
| Q9 | Google OAuth as primary auth | Yes — Tier 0 item 13, F2 v5 Phase 3 AC, §8 Success Metrics "Google OAuth adoption rate" | Yes — primary CTA, email+password as secondary, Supabase Auth config | Clean. |
| Q10 | Embeddable badge at MVP+30 | Yes — F49 with "MVP+30 (Q10 lock)" | Yes — badge spec, threshold ≥70, two variants, CDN-served | Clean. |
| Q11 | Dogfooding scan built MVP / published MVP+30 | Yes — F50 with "Built at MVP, published at MVP+30 (Q11 lock)" | Yes — timeline, what's built vs published, public permalink spec | Clean. |
| Q12 | Option E approved | Yes — §4 Architecture Overview "Decision locked: Q12 + Q13" + cross-link to `OPTION-E-START-FLOW-SPEC.md` | Yes — 9 phases specified, two surfaces (scan vs /start) defined | Clean. |
| Q13 | Ship at MVP (not Tier 5 deferred) | Yes — F2 v5 is Priority: MVP. F48 (Yossi batch) is correctly at MVP+30, not Tier 5. | Yes — /start is Tier 1 (MVP), not deferred | Clean. |

### §2 Summary

Q4 and Q7 have drift: the 7-day activation window is stated but the downstream consequences (analytics event spec, lifecycle email trigger adjustments, F12 Day-14 update) are not reflected. Q1, Q2, Q3, Q5, Q6, Q8, Q9, Q10, Q11, Q12, Q13 are all clean.

---

## §3 — F2 Onboarding Deep-Dive

F2 was the most heavily changed feature. Detailed audit:

### ACs from v4 F2 preserved or explicitly retired in v5 F2?

**v4 ACs and their v5 status:**

1. "Step 2 content is vertical-aware: SaaS sees UTM panel prominently" → v5 Phase 6 AC: "vertical-aware (SaaS = UTM first; e-commerce = Twilio first)" — PRESERVED.

2. "'Send setup instructions to your developer' button present in Step 2" → v5 Phase 6 AC present — PRESERVED.

3. "72-hour verification check: reminder email fires if Twilio not detected" → v5 F12 AC preserved — PRESERVED.

4. "Step 3 includes 'This doesn't describe my business' link" → NOT EXPLICITLY STATED in v5 F2 ACs. This escape hatch was a specific v4 AC (13px, ink-3 color, navigates to Step 1 with industry combobox pre-focused). It is not mentioned in Phase 5 or Phase 6 ACs in v5. **POTENTIAL DROP.**

5. "Onboarding detects `?scan_id=` — skips redundant scan" → v5 Phase 0: "only for direct-signup path; skipped if `?scan_id=` present" — PRESERVED (architecturally).

6. "Brief is Beamix-authored (not customer-written). Editing uses chip menus." → v5 mentions pre-filled Three Claims but doesn't explicitly state chip-menu editing UI. Implicit from v4 but not explicitly stated. MINOR GAP.

7. "Seal stamps in 540ms using stamping easing curve" → v5 Phase 7 + Seal ceremony block: explicit — PRESERVED.

8. "Print this Brief → link appears below signature area after Seal lands" → v5 Phase 7 AC: present — PRESERVED.

9. "Optional office address field in Step 1 (used for F26)" → NOT mentioned in v5 F2 ACs. Phase 5 (vertical-confirm) and Phase 6 (brief-co-author) specs don't mention this optional field. **POTENTIAL DROP** — F26 depends on it.

10. "After approval: first agent run queued automatically" → v5: "On completion as Paid Customer: first agent run queued automatically within 5 minutes" — PRESERVED. (Note: correctly conditioned on Paid Customer state, not Free Account.)

11. "Every client account (Yossi's 12 clients) gets full Brief ceremony" → v5 F48 specifies "Full Seal ceremony preserved on every Brief regardless of batch mode" — PRESERVED.

12. "Amendment v4: Arc's 'Hand' 1px ink-1 dot" → v5 Phase 7 AC: "Arc's Hand dot present (1px ink-1, fades in at t=120ms, fades out with seal-fade)" — PRESERVED.

### Cross-link to OPTION-E-START-FLOW-SPEC.md

The file `docs/08-agents_work/2026-05-04-OPTION-E-START-FLOW-SPEC.md` exists on disk. The cross-reference in v5 §4 is correct and functional. Section name referenced as "pixel-level detail" — the target exists.

### Does v5 F2 mention all 9 phases?

Yes — all 9 phases (Phase 0 through Phase 9 / `/home`) are described in §4 Architecture Overview, which is what v5 F2 references.

### Does v5 F2 mention Heebo for Hebrew (Q2 lock)?

Yes — Phase 6 AC: "Heebo 300 italic loaded and active on `[lang="he"]` pages as Fraunces companion font." PRESENT.

### Does v5 F2 mention pre-fill Three Claims (Q3 lock)?

Yes — Phase 6 spec: "Three Claims pre-filled from scan data via Claude. Customer reviews + edits." Phase 6 AC explicit. PRESENT.

### Does v5 F2 mention Arc's Hand 1px ink-1 dot?

Yes — Phase 7 AC: "Arc's Hand dot present (1px ink-1, fades in at t=120ms, fades out with seal-fade)." PRESENT.

### Does v5 F2 mention "Security & DPA" footer (Q5 lock)?

Yes — Phase 7 AC: "'Security & DPA' footer link visible (13px ink-3, links to /trust)." PRESENT.

### Does v5 F2 mention vertical-conditional hours field (O-18 fix)?

Yes — Phase 8 AC: "`hours` and `service_area` fields hidden for SaaS customers." PRESENT. Also in Phase 6 (brief-co-author): "Phase 6: `hours` and `service_area` fields absent for SaaS-classified customers."

### Missing from v5 F2

Two v4 ACs appear to be dropped:

1. **"This doesn't describe my business" escape hatch** (Step 3 → Step 1 with industry combobox pre-focused): v5 F2 mentions skip-cinema and brief consistency check but NOT this escape hatch. However, F32 (Brief Re-author) references this: "Re-author flow includes 'This is still wrong about my business' escape hatch back to Step 1's industry combobox — same mechanic as onboarding" — so the concept is preserved in F32 but the ONBOARDING instance is not explicitly in v5 F2 ACs.

2. **Optional office address field in Step 1** (required for F26 Print-Once-As-Gift at month 6): not mentioned anywhere in v5 F2 or Phase 5 spec. F26 still exists and still depends on `customer_profiles.office_address`, but the collection point during onboarding is no longer specified. This is a data integrity gap — F26 will fail if address is never collected.

---

## §4 — Domain Reference Audit

Comprehensive search across v5 for forbidden domain references:

**"beamix.tech" occurrences in v5:** Zero. The deprecation header and §14 Domain Infrastructure Status both confirm "old domain `beamix.tech` is retired." Clean.

**"BeamixAI" occurrences in v5:** Zero. Header states: "Customer-facing brand name remains **Beamix** — never write 'BeamixAI.'" §14 confirms. Clean.

**"beamixai.com" usage:**
- Header: beamixai.com — correct.
- F1: No explicit domain URL mentioned. /scan public uses relative path.
- F43: "scope = beamixai.com + api.beamixai.com + customer dashboards" — correct.
- F46: "/status: external page (status.beamixai.com via Better Stack)" — v5 says "(Spec unchanged from v4)" for F46 but doesn't reproduce the ACs. In v4, the status URL is `status.beamixai.com`. Since F46 ACs aren't in v5 body, the URL doesn't appear explicitly — but the v4 reference is correct.
- §14: all infrastructure entries use beamixai.com, app.beamixai.com, notify.beamixai.com — correct.

**Webhook URLs:** v5 doesn't specify webhook URLs explicitly (Vercel/Resend/Inngest/Twilio/Paddle). These are implementation details not typically in PRDs. No drift detected — v4 also doesn't specify webhook URLs in feature bodies.

**app.beamixai.com:** Referenced correctly in §14.

**notify.beamixai.com:** Referenced correctly in Tier 0 item 9 (Resend setup + DKIM/SPF/DMARC on notify.beamixai.com) and §14.

Domain audit: PASS.

---

## §5 — Onboarding Audit Fix Coverage Table (12 Fixes)

| # | Fix | Source | Present in v5? | Notes |
|---|-----|--------|---------------|-------|
| 1 | Pre-fill Three Claims from scan data (O-4) | CRO | Yes — F30 Amendment v5 + F2 v5 Phase 6 AC | Clean. |
| 2 | Heebo 300 italic (O-2) | Form factors | Yes — §11 Design System Canon "Hebrew typography stack (Q2 lock)" | Clean. |
| 3 | handle_new_user trigger smoke test (O-6) | Failure modes | Yes — Tier 0 item 18: "handle_new_user trigger smoke test — deploy-time check creates test user in staging" | Clean. |
| 4 | Activation redefinition = first /inbox approval within 7d (O-5, extended by Q7) | CRO | Partially — F2 v5 Phase 4 mentions "Q4 + Q7 lock: activation = first /inbox approval within 7 days." | IMPORTANT: The analytics events and lifecycle email trigger adjustments are not updated. F12 (Lead Attribution) retains its v4 text with no mention of 7-day window. The Day-14 Marcus email event ("a developer found you on Claude") is not recalibrated to the 7-day activation window. |
| 5 | WCAG 2.1 AA token + focus + autodismiss fixes (O-8) | Form factors | Partially — §11 Design System Canon has the 4 token fixes, focus ring fix, and `useReducedMotion()` hook note. | IMPORTANT: Print-the-Brief auto-dismiss timer is removed per §11 ("REMOVED. Timer now manual-dismiss only"). However F27 is marked "(Spec unchanged from v4)" and v4 F27 ACs explicitly state "After 8 seconds: 300ms opacity fade-out and DOM removal" and "Visible for 8 seconds." This is a CONTRADICTION. v5 §11 changes the behavior but v5 F27 is supposed to be unchanged and v5's "See v4 spec" instruction would yield the old 8-second behavior. |
| 6 | Yossi skip-cinema (MVP partial relief, O-19) | Personas | Yes — F2 v5 AC: "Skip-cinema option visible for customers who have ≥1 prior signed Brief. Skips Phases 0–5, enters at Phase 6." | Clean. |
| 7 | Brief grounding preview during Phase 6 (O-9) | CRO + Trust | Yes — F30 Amendment v5 + F2 v5 Phase 6 spec | Clean. |
| 8 | Dual-tab Brief lock (O-11) | Failure modes | Yes — F2 v5 AC: "Dual-tab lock: if Phase 6 is open in two tabs, second tab shows 'another session is editing — return there or take over.'" | Clean. |
| 9 | Brief consistency check pre-Seal (O-12) | Failure modes | Yes — F2 v5 AC: "Phase 7 (brief-signing): Brief consistency check runs before Seal. Contradictions surfaced to customer." | Clean. |
| 10 | Step 4 (Phase 8) hours field vertical-conditional (O-18) | Personas | Yes — F2 v5 Phase 8 AC: "`hours` and `service_area` fields hidden for SaaS customers." | Clean. |
| 11 | 3-email abandoned-account recovery (O-13) | Failure modes | Yes — F53 Day-N Free Account Recovery Email Sequence (MVP). Email copy, timing, suppression rules all specified. | MINOR: Onboarding audit synthesis called these "abandoned-account recovery" emails for *any* abandoned account. v5 F53 scopes them specifically to Free Account state (post-Brief, pre-Paddle). Customers who abandon BEFORE completing Brief signing have no recovery email sequence. This is a narrower scope than O-13 intended. |
| 12 | 14-day guarantee surfacing + /trust footer (O-3 + O-14) | CRO + Trust | Yes — F1 shows guarantee below tier picker; F2 v5 Phase 2 and Phase 7 both surface guarantee; Phase 7 has "Security & DPA" footer. | Clean. |

### §5 Critical Conflict: F27 Auto-Dismiss Timer

v5 §11 WCAG section explicitly removes the 8-second auto-dismiss timer from Print-the-Brief (O-8 fix). v5 F27 says "(Spec unchanged from v4)" — v4 F27 has the 8-second timer as a hard AC. These two instructions contradict each other in the same document. A build team cannot follow both. This is a critical spec conflict requiring resolution.

---

## §6 — Cross-Reference Integrity

**Every "see XYZ doc" cross-link in v5:**

1. `docs/08-agents_work/2026-05-04-OPTION-E-START-FLOW-SPEC.md` — File confirmed to exist on disk. Section reference is general ("pixel-level detail"). VALID.

2. `docs/08-agents_work/BOARD-aria-simulator.md` — Referenced in Persona D (Aria) section. v5 preserves this from v4. File was present in v4 and likely exists. NOT VERIFIED (file not read, but reference unchanged from v4 which was presumably valid).

3. v5 cross-references to v4 ("See full v4 spec for complete acceptance criteria" — F19): v4 is explicitly deprecated. BROKEN cross-reference. Cannot use a deprecated document as the authoritative source.

**Every "Amendment v5" subsection — clearly labeled?**

- F1: "Amendment v5 (2026-05-04)" — present. CLEAR.
- F4: "Amendment v5 (2026-05-04) — Billing placement" — present. CLEAR.
- F5: "Amendment v5 (2026-05-04) — Free Account state on /home" — present. CLEAR.
- F6: "(Spec unchanged from v4.)" + one new AC added inline without "Amendment v5" label. MINOR: new AC for sample items is not wrapped in an "Amendment" callout.
- F22: "Amendment v5 (2026-05-04)" — present. CLEAR.
- F30: "Amendment v5 (2026-05-04)" — present. CLEAR.
- F35: Three "Amendment v5 (2026-05-04)" blocks, all labeled. CLEAR.
- F42: "Amendment v5 (2026-05-04)" — present. CLEAR.

**Every "DEPRECATED" marker — clearly cross-linked?**

- F2 v4 spec: "DEPRECATION NOTICE (v5):" present. Cross-link to §4 and to `OPTION-E-START-FLOW-SPEC.md`. CLEAR.
- F4 "DEPRECATED (v4 spec)" header: The header appears but the feature is NOT actually deprecated — only the billing story embedded in v4 was. The DEPRECATED header misleads. Should say "Amendment v5" instead. CONFUSING.

**Feature ID Summary table at document end:** All 54 features listed with priority, build effort, and v5 status. The table correctly marks REPLACED, NEW, Amended, and Unchanged. Useful navigation aid. CLEAN.

---

## §7 — Lost-in-Transfer Check

The following items from v4 do not appear in v5 AND are not intentionally retired:

### Design details not reproduced

1. **F7 (Agent roster) — first-person blurbs per agent:** v4 explicitly states each agent gets a "first-person blurb" in the /crew row expand. Not mentioned in v5. This is an in-product copy specification.

2. **F8 (workspace) — "Agent name shown in /workspace header" AC:** Explicitly in v4 AC list; not in v5 compressed ACs.

3. **F9 (scans) — "Brief grounding citation visible in Done lens row expansion" AC:** In v4; not in v5.

4. **F11 (/crew) — "Per-agent autonomy level is independent per agent and per client" AC:** v4 explicit; v5 omits.

5. **F11 (/crew) — "18 agent colors locked and tested at 12px on cream paper before MVP launch":** v4 has this as a numbered AC; v5 has "18 agent colors locked and tested" but without the "before MVP launch" launch-gate qualifier.

6. **F17 (Marketplace) — "No grant references, no Hall of Fame":** Dropped from v5 ACs.

7. **F22 — "Pilot readability validation: show 10 customers, confirm in under 10 seconds":** v4 Amendment v4 AC; not in v5.

8. **F26 — Optional office address collection during onboarding Step 1:** v4 explicitly ties F26 to an optional field in onboarding Step 1. v5 F26 is "(Spec unchanged from v4)" but v5 F2 doesn't mention this field. Collection point is undefined.

9. **F30 — "Extend to API" amendment (v4 Amendment v4):** Every API response includes `authorized_by_brief_clause` field. Not mentioned in v5. May be intentionally deferred but not marked as such.

10. **F34 — Privacy & Data tab required content:** v4 F34 has a bulleted list of 7 required elements on the Privacy & Data tab (storage region statement, encryption statement, training opt-out, data retention summary, sub-processors link, DSAR link, section header "Your data, on your terms."). These are acceptance criteria, not implementation details. v5 F34 is "unchanged" with no ACs reproduced.

11. **F42 — Edge case ACs for DPA:** v4 F42 had "Customer in Israel: DPA includes hebrew-language-supplement note," "Customer is Yossi (multi-client agency): DPA addendum for sub-vendor pass-through," and "Sub-processor mid-audit: 'audit in progress' status row instead of date." Not in v5.

12. **F2 v4 — "This doesn't describe my business" escape hatch in Step 3:** Not explicitly in v5 F2 Phase ACs. The escape hatch in F32 covers post-signing re-author but not the pre-signing Step 3 instance.

13. **Tier 0 — "brief_quarterly_reviews" table:** v4 F24 explicitly adds `brief_quarterly_reviews` to Tier 0 dependencies: "`brief_quarterly_reviews` table (new — add to Tier 0 Supabase migration)." v5 Tier 0 migration item 2 lists existing tables but does NOT include `brief_quarterly_reviews`. This table is required for F24 (Brief Re-Reading quarterly trigger), which is an MVP feature. Data schema gap.

14. **Margin temporal decay specification:** v4 F14 (Email) and F5 (/home) specify the exact temporal decay percentages for the Margin: "full opacity current week, 20% prior month, 6% archived." This detail appears in v4's F14 Email acceptance criteria. v5 F14 ACs are not reproduced. The Monthly Update PDF temporal decay rule may be lost for the build team.

---

## §8 — Severity-Ranked Issue List

### 🔴 Critical (must fix before merge)

**C-1: F19 Workflow Builder has zero ACs in v5.**
v5 says "See full v4 spec for complete acceptance criteria. No changes in v5." v4 is deprecated. F19 has the most complex acceptance criteria in the document (React Flow DAG editor, cream-paper canvas, node anatomy, Brief grounding cell in inspector, dry-run mode, etc.). A build team using v5 as canonical cannot find these criteria. Fix: reproduce all F19 ACs in v5 inline, OR add a clear note that v4 is preserved as an archival reference specifically for ACs.

**C-2: F27 auto-dismiss timer contradiction.**
v5 §11 WCAG section removes the 8-second auto-dismiss timer (O-8 fix). v5 F27 says "(Spec unchanged from v4)" — v4 F27 explicitly specifies the 8-second timer as an acceptance criterion. Two parts of the same document give contradictory build instructions. Fix: F27 must add "Amendment v5" removing the timer AC, replacing with "manual dismiss only" AC per the WCAG fix.

**C-3: `brief_quarterly_reviews` table missing from Tier 0.**
v4 F24 explicitly adds this table to the Tier 0 migration requirement. v5 Tier 0 migration item 2 lists tables but omits `brief_quarterly_reviews`. F24 (Brief Re-Reading quarterly trigger) is an MVP feature. Without this table, F24 cannot be implemented. Fix: add `brief_quarterly_reviews` to the Tier 0 Supabase schema migration list in v5 §5.

**C-4: Systemic AC loss for "unchanged" features (F19–F47 pattern).**
24+ features have their acceptance criteria stripped to "(Spec unchanged from v4.)" + a priority line. v4 is deprecated and must not be referenced. This makes v5 incomplete as a standalone specification. The build team has no ACs for F20, F21, F23, F24, F25, F27–F34, F36–F46. Fix: either reproduce ACs inline, or explicitly define v4 as an appendix/reference document that is preserved alongside v5 (not deprecated as a specification). The current "deprecated" framing is architecturally inconsistent with "see v4 for full spec."

### 🟡 Important (should fix)

**I-1: Q4/Q7 activation window drift downstream.**
The 7-day activation window is stated but F12 (Lead Attribution Loop) and the Marcus Day-14 evangelism email trigger are not updated to reflect it. Analytics event spec for activation is not defined in v5. The "24h" framing from v4 may persist in implementation.

**I-2: F4 "DEPRECATED" header is misleading.**
F4 is not deprecated — it is amended. The DEPRECATED label on the spec header before the feature content causes reader confusion about whether to use F4's acceptance criteria. Fix: Change header to "Amendment v5" to match the pattern used on F1, F5, F22, F30, F35, F42.

**I-3: Optional office address field not collected in v5 F2.**
v4 F2 had "Optional office address field in Step 1 (used for F26 at month 6)" as an explicit AC. v5 F2 and the Phase 5 spec don't mention this field. F26 (Print-Once-As-Gift) still requires `customer_profiles.office_address` to trigger. Without a collection point in the onboarding flow, F26 will have no data to use. Fix: Add the optional office address field back to Phase 5 (vertical-confirm) or Phase 8 (truth-file) ACs in v5 F2.

**I-4: "This doesn't describe my business" escape hatch in Phase 7.**
v4 F2 had this as an explicit AC for Step 3 (now Phase 7 brief-signing). v5 F2 doesn't include it in Phase 5/6/7 ACs. F32 covers the post-signing re-author escape hatch, but the pre-signing escape hatch (during Brief co-authoring, back to vertical classification) is not specified. Fix: Add escape hatch AC to Phase 6 (brief-co-author) in v5 F2.

**I-5: F30 "Extend to API" amendment (v4 Amendment v4) not in v5.**
The v4 Amendment to F30 added: "Every Beamix API response includes `authorized_by_brief_clause` field with Brief clause UUID + truncated text (≤120 chars)." v5 F30 Amendment v5 adds the Phase 6 preview but makes no mention of the API extension. Either this was intentionally deferred (in which case it should be marked as deferred), or it was dropped accidentally.

**I-6: F53 scope narrower than O-13 intended.**
The onboarding audit O-13 specified "3-email abandoned-account recovery sequence" for accounts that abandon at any stage. v5 F53 scopes these emails specifically to Free Account state (post-Brief, pre-Paddle). Customers who abandon before completing their Brief signing receive no recovery sequence. This is a funnel gap — pre-Brief abandonment is the highest drop-off point in most onboarding flows.

**I-7: F42 edge case ACs for DPA dropped.**
v4 F42 had specific ACs for Israeli customers (Hebrew DPA supplement) and Yossi/agency customers (sub-vendor pass-through addendum). These are not in v5 F42 Amendment. The Israeli customer DPA note is particularly relevant given the target market.

**I-8: F6 /inbox new AC for sample items lacks "Amendment v5" label.**
The new AC for Free Account sample /inbox items was added inline without a labeled amendment block, inconsistent with the pattern used for other amended features.

### 🟢 Minor (nice to fix)

**M-1: F8 /workspace — "Agent name shown in /workspace header" AC omitted from compressed list.** The voice canon requirement for in-product surfaces is architecturally important but was dropped from the compressed v5 ACs.

**M-2: F9 /scans — "Brief grounding citation visible in Done lens row expansion" AC omitted.** This is an explicit cross-surface F30 requirement that should appear in F9 ACs.

**M-3: F11 /crew — cross-client autonomy independence clause omitted.** "Per-agent autonomy level is independent per agent and per client" is a functional spec that was dropped.

**M-4: F17 Marketplace — "No grant references, no Hall of Fame" ACs dropped.** These were specific Board 2 outputs that should be preserved even if low-risk.

**M-5: F7 Agent roster — first-person blurbs per agent omitted from row-expand spec.** Low impact but a specific copy specification.

**M-6: F22 — Pilot readability validation AC dropped.** "Show 10 customers, confirm in under 10 seconds" is a measurable quality gate that was in v4.

**M-7: F34 Privacy & Data tab required content (7 elements) not in v5 ACs.** These are customer-facing legal and trust elements that should be reproduced.

**M-8: Margin temporal decay percentages for Monthly Update PDF.** "20% prior month, 6% archived" — a design token specification that may be lost.

### ✅ Verified Clean

- §1 Frame 5 v2 Strategic Positioning — preserved verbatim.
- §2 Pricing + Tiers — preserved verbatim.
- §3 Personas (A, B, C, D + Shared Traits) — preserved verbatim. Aria persona preserved including BOARD-aria-simulator.md cross-link.
- §4 Architecture Overview — fully specced, clean.
- F1, F3, F5, F6, F12, F13, F14, F15, F16, F18 — core spec preserved, amendments cleanly labeled.
- F22, F30, F35, F42 — amendments cleanly labeled and ACs explicitly extended.
- F48, F49, F50, F51, F52, F53, F54 — all new features fully specced with ACs.
- §6 Locked Design Decisions (Locks A–E) — preserved verbatim. All 5 locks clean.
- §11 Design System Canon — all v4 design system preserved; v5 additions (Heebo, phase transitions, two-tier UI tokens, WCAG fixes, mobile breakpoints) cleanly added.
- §12 Outstanding Adam-Decisions — correctly states "None. All Q1–Q13 locked."
- §13 Version History — accurate.
- §14 Domain Infrastructure — all entries use beamixai.com correctly.
- Domain audit — zero beamix.tech or BeamixAI references.

---

## Verdict

**FAIL — pending resolution of C-1 through C-4 before merge.**

The four critical issues (F19 AC loss, F27 timer contradiction, missing `brief_quarterly_reviews` from Tier 0, and the systemic pattern of stripped ACs across 24+ unchanged features) make v5 insufficient as a standalone build specification. The PRD v5 header correctly deprecates v4, but then instructs the reader to reference v4 for feature details — a contradiction that cannot be resolved without either reproducing the ACs in v5 or explicitly preserving v4 as a reference appendix alongside v5. Until these four issues are resolved, a build team cannot use v5 as the sole source of truth with confidence.

The 8 important-severity items should be resolved in the same pass. The 8 minor items may be batched into a clean-up PR after the critical fixes land.
