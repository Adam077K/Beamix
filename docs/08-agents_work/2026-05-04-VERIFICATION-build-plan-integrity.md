# Build Plan v3 — Integrity Verification Audit
**Date:** 2026-05-04
**Author:** Build Lead (integrity audit)
**Scope:** Build Plan v3 (T1–T133) vs Build Plan v2 (T1–T92) + PRD v5 (F1–F54)
**Verdict:** PASS-WITH-MINOR-FIXES

---

## §1 — Ticket ID Coverage: T1–T92 in v3

Build Plan v2 introduced numbered tickets from T58 to T92. Tickets T0.1–T5.6 / T1.1–T4.3 are v1 tickets referenced by placeholder in both v2 and v3 as "unchanged from v1." Build Plan v3 explicitly states all v1 (T0.1–T5.6) and v2 (T58–T92) tickets are "preserved intact."

The structured verification below covers the T58–T92 block (the first version-numbered tickets with full content), since T0.1–T5.6 are preserved via reference in both v2 and v3 under identical language.

| Ticket ID | Present in v3? | Scope/AC unchanged? | Effort unchanged? | Issues |
|-----------|---------------|--------------------|--------------------|--------|
| T58 (10 easing curves) | Yes — preserved intact | Yes | XS unchanged | None |
| T59 (ESLint rules) | Yes — preserved intact | Yes | S unchanged | None |
| T60 (Variable Inter font) | Yes — preserved intact | Yes | S unchanged | None |
| T61 (status-vocab.ts) | Yes — preserved intact | Yes | XS unchanged | None |
| T62 (Block primitive types) | Yes — preserved intact | Yes | S unchanged | None |
| T63 (Speed CI gate) | Yes — preserved intact | Yes | S unchanged | None |
| T64 (security.txt RFC 9116) | Yes — preserved intact | Yes | XS unchanged | None |
| T65 (Dark mode tokens) | Yes — preserved intact | Yes | XS unchanged | None |
| T66 (Trust Center /trust) | Yes — preserved intact | Yes | L unchanged | None |
| T67 (/changelog route) | Yes — preserved intact | Yes | S unchanged | None |
| T68 (Editorial error pages) | Yes — preserved intact | Yes | S unchanged | T99 now closes the status-redirect chain; dependency updated implicitly |
| T69 (Cmd-K command bar) | Yes — preserved intact | Yes | M unchanged | None |
| T70 (Slash command palette) | Yes — preserved intact | Yes | S unchanged | None |
| T71 (Brief Re-author + Undo) | Yes — preserved intact | Yes | S unchanged | None |
| T72 (Team Seats + Roles) | Yes — preserved intact | Yes | M unchanged | None |
| T73 (Data Export DSAR) | Yes — preserved intact | Yes | M unchanged | None |
| T74 (Graceful Cancellation) | Yes — preserved intact | Yes | S unchanged | F35 Amendment v5 (30-day cleanup for Free Account inactive accounts) not back-ported as explicit AC amendment; minor gap |
| T75 (Domain Migration Wizard) | Yes — preserved intact | Yes | M unchanged | None |
| T76 (/reports route) | Yes — preserved intact | Yes | M unchanged | None |
| T77 (Subscription Pause) | Yes — preserved intact | Yes | S unchanged | None |
| T78 (Competitor Removal) | Yes — preserved intact | Yes | XS unchanged | None |
| T79 (Scale Multi-Domain) | Yes — preserved intact | Yes | M unchanged | None |
| T80 (Cycle-Close Bell wave) | Yes — preserved intact | Yes | XS unchanged | None |
| T81 (Receipt-That-Prints card) | Yes — preserved intact | Yes | S unchanged | None |
| T82 (Print-the-Brief button) | Yes — preserved intact | Yes | S unchanged | None |
| T83 (Not-Do line) | Yes — preserved intact | Yes | XS unchanged | None |
| T84 (Ops Card A4) | Yes — preserved intact | Yes | S unchanged | None |
| T85 (Brief Grounding Citation) | Yes — preserved intact | Yes | S unchanged | None |
| T86 (Brief Binding Line) | Yes — preserved intact | Yes | XS unchanged | None |
| T87 (Arc's Hand dot) | Yes — preserved intact | Yes | XS unchanged | None |
| T88 (HackerOne bounty) | Yes — preserved intact | Yes | S unchanged | None |
| T89 (SOC 2 engagement) | Yes — preserved intact | Yes | XS unchanged | T129 added as tracking reminder; no scope conflict |
| T90 (State of AI Search) | Yes — preserved intact | Yes | L unchanged | None |
| T91 (Print-Once-As-Gift) | Yes — preserved intact | Yes | S unchanged | None |
| T92 (Brief Re-Reading cron) | Yes — preserved intact | Yes | XS unchanged | None |

**§1 Result:** All 35 v2 numbered tickets (T58–T92) confirmed present in v3 with identical scope and effort. The v1 tickets (T0.1–T5.6) are preserved identically via placeholder reference in both documents. **No ticket was dropped.**

One minor gap: T74's acceptance criteria does not explicitly reflect the F35 Amendment v5 clause about 30-day inactive Free Account Twilio cleanup. T126 (new in v3) covers orphan Twilio cleanup broadly, but the specific "inactive Free Account ≥30 days" cleanup path has dual coverage — T74 should reference T126 (and already does indirectly via its dependency listing).

---

## §2 — F1–F54 Feature → Ticket Mapping

| Feature | Priority | Covering Ticket(s) | Notes |
|---------|----------|--------------------|-------|
| F1 /scan public | MVP | T1.1 (v1 placeholder) | Covered. T111 adds "Claim this scan" CTA |
| F2 v5 /start unified route | MVP | T100–T110 (Tier 1) | Fully covered by Option E tickets |
| F3 Truth File | MVP | T1.4 / T0.1 (v1 placeholders) | Covered in v1 foundation |
| F4 Billing + Pre-pub validation | MVP | T0.5 / T1.4 (v1) + T114 | T114 is the Paddle inline modal; pre-pub validator in v1 tickets |
| F5 /home | MVP | T2.1 (v1) + T112 | T112 covers Free Account /home state |
| F6 /inbox | MVP | T2.1 (v1) + T113, T118 | T113 sample data; T118 activation event |
| F7 Agent roster (6 agents) | MVP | T2.2 (v1) | Covered in v1 |
| F8 /workspace | MVP | T2.2 (v1) | Covered in v1 |
| F9 /scans | MVP | T2.3 (v1) | Covered in v1 |
| F10 /competitors | MVP | T2.3 (v1) + T78 | T78 adds competitor removal |
| F11 /crew | MVP | T3.4 (v1) | Covered in v1 |
| F12 Lead Attribution Loop | MVP | T1.8 (v1) | Covered in v1. T118 updates Marcus Day-14 trigger timing |
| F13 /settings | MVP | T3.3 (v1) + T72, T73, T74, T77 | Covered across multiple tickets |
| F14 Email infrastructure (18 templates) | MVP | T0.11 (v1) + T115 | T115 covers 3 recovery emails. Other 15 templates assumed in v1 T0.11. SEE §7 for gap flag |
| F15 11 AI engine coverage | MVP | T0.5 / T1.1 (v1) | Covered in v1 |
| F16 2 vertical knowledge graphs | MVP | T0.4 (v1) | Covered in v1 |
| F17 Marketplace | MVP | T4.3 (v1) | Covered in v1 |
| F18 Incident runbook + rollback | MVP | T0.6 / T0.7 (v1) | Covered in v1 |
| F19 Workflow Builder | MVP | T4.1 (v1) | Covered in v1 |
| F20 /security public page | MVP | T3.5 (v1) | Covered in v1 |
| F21 Scale-tier DPA | MVP | T0.15 (v1) | Covered in v1 |
| F22 AI Visibility Cartogram | MVP | T2.4 (v1); v5 adds Phase 2 surface in T103 | Covered |
| F23 Cycle-Close Bell | MVP | T2.5 (v1) + T80 | T80 adds Arc's Wave stagger |
| F24 Brief Re-Reading quarterly | MVP | T92 | Covered (Tier 5 — post-MVP timing but ticket is MVP-priority in PRD) |
| F25 Receipt-That-Prints card | MVP | T81 | Covered |
| F26 Print-Once-As-Gift | Post-MVP | T91 | Correctly in Tier 5 / MVP+180 |
| F27 Print-the-Brief button | MVP | T82 + T107 | T107 Phase 6 includes the button; T82 builds the PDF component |
| F28 "What Beamix Did NOT Do" | MVP | T83 | Covered |
| F29 Printable A4 ops card | MVP | T84 | Covered |
| F30 Brief grounding citation | MVP | T85 + T106 | T106 Phase 5 preview; T85 all production surfaces |
| F31 Brief binding line | MVP | T86 | Covered |
| F32 Brief Re-author + Undo | MVP | T71 | Covered |
| F33 Team Seats + Roles | MVP | T72 | Covered |
| F34 Data Export DSAR | MVP | T73 | Covered |
| F35 Graceful Cancellation | MVP | T74 + T117 | T117 adds tier-split refund windows |
| F36 Domain Migration | MVP | T75 | Covered |
| F37 /reports | MVP | T76 | Covered |
| F38 Subscription Pause | MVP | T77 | Covered |
| F39 Competitor Removal | MVP | T78 | Covered |
| F40 Scale Multi-Domain | MVP | T79 | Covered |
| F41 Cmd-K + slash command | MVP | T69 + T70 | Covered |
| F42 Trust Center + SOC 2 | MVP | T66 + T64 + T89 + T99 | Covered. Q5 quiet footer in T108 |
| F43 Vulnerability disclosure | MVP | T88 (disclosure page); T64 (security.txt) | T88 is MVP+30 for HackerOne live; disclosure stub in T66 |
| F44 /changelog | MVP | T67 | Covered |
| F45 Compact mode toggle | MVP | T3.2 (v1) | Covered in v1 |
| F46 Editorial error pages | MVP | T68 + T99 | T99 closes /status redirect |
| F47 State of AI Search | MVP+90 | T90 | Correctly in Tier 5 / MVP+90 |
| F48 Yossi Agency Batch Onboarding | MVP+30 | T130 | Correctly in Tier 5 / MVP+30 |
| F49 Embeddable Score Badge | MVP+30 | T131 | Correctly in Tier 5 / MVP+30 |
| F50 Public Dogfooding Scan | Build MVP, Publish MVP+30 | T132 | Correctly noted as "build at MVP, publish at MVP+30" in Tier 5 |
| F51 Two-Tier Activation Model | MVP | T112 + T114 + T96 | T96 tokens; T112 Free Account /home; T114 Paddle modal |
| F52 Free Account Sample Data | MVP | T113 | Covered |
| F53 Day-N Recovery Emails | MVP | T115 | Covered. 3 templates |
| F54 Refund Risk: Agent-Run Caps | MVP | T116 + T117 | T117 defines windows; T116 enforces caps |

**§2 Issues:**
- F24 (Brief Re-Reading quarterly) has PRD priority "MVP" but ticket T92 sits in Tier 5. This is a potential misalignment — see §3 for tier ordering discussion.
- F43 (Vulnerability disclosure): the HackerOne program going live is MVP+30 (T88 Tier 5). The disclosure stub page is MVP (created in T66). This split is correct and intentional — verified.
- F50 two-phase split (build at MVP, publish MVP+30): T132 correctly reflects both phases in a single Tier 5 ticket. The "build at MVP" part is a Tier 5 ticket — this is slightly wrong tier-wise since the build work should happen before launch. See §3 for deeper tier discussion.

---

## §3 — Tier Ordering Integrity

### Option E Phase Components (T100–T110) in Tier 1

All 12 Option E tickets — T100 (state machine), T101–T109 (9 phase components), T110 (animation orchestration), T111 (claim-scan CTA) — are in Tier 1. T100 BLOCKS T101–T111 (all phase components depend on the route + Zustand store). This is structurally correct: T100 is the prerequisite, and all components are at the same tier since they can be parallelized once T100 ships.

**Verdict: Correct.**

### T119 (pre-fill Three Claims API) in Tier 3 — Forward Dependency to T106 (Tier 1)

T119 is in Tier 3. T106 (Phase 5 BriefCoAuthor, Tier 1) lists T119 as a dependency with the note "T119 must merge before T106 goes to production." This creates an inversion: a Tier 3 ticket is a hard dependency for a Tier 1 ticket.

This is a cross-tier dependency problem. T119 should be promoted to **Tier 0 or Tier 1** since T106 cannot ship to production without it. Build Plan v3's dependency table acknowledges this with the note "T119 (pre-fill API) → T106 (forward dep — T119 must ship before T106)" but does not fix the tier placement.

**Issue: T119 is mis-tiered. It is in Tier 3 but blocks Tier 1 work. Must be Tier 0 or Tier 1 at latest.**

### T62 (Block Primitives) Tier 0 → T76 (/reports) Tier 2

T62 is in Tier 0. T76 (/reports) is in Tier 2 and lists T62 as a dependency. T70 (slash command, Tier 1) also depends on T62. The chain is: T62 (Tier 0) → T70 (Tier 1) → T76 (Tier 2). This is correct tier ordering: each tier completes before the next.

**Verdict: Correct.**

### T132 (Dogfooding Scan) in Tier 5 with "Build at MVP"

T132's acceptance criteria say the Beamix domain scan and weekly Inngest cron should be set up "at MVP build." But the ticket is in Tier 5 (post-MVP). This means the implementation work is scheduled after launch. If the Beamix internal scan needs to run from Day 1 (to accumulate 30 days of trend data before MVP+30 publication), the build work must happen during the build sprint, not post-launch.

**Issue: T132 should have its build-side work (Inngest cron + scan setup) split into a separate Tier 1 or Tier 2 ticket, with only the publication/announcement deferred to MVP+30. As written, the cron setup may not run from Day 1.**

### F24 Brief Re-Reading Quarterly (T92) — Priority vs. Tier Mismatch

PRD v5 labels F24 as "Priority: MVP." T92 is in Tier 5 (post-MVP, "fires quarterly; first trigger is 90 days after MVP launch"). The quarterly trigger by definition cannot fire until 90 days post-launch, so placing it in Tier 5 is functionally correct even if the PRD labels it "MVP." The implementation must exist, but the functional effect is post-MVP. This is a labeling inconsistency between the PRD and Build Plan — minor.

**Issue (minor): PRD and Build Plan tier label disagree on F24. Consider aligning PRD v5 F24 priority to "MVP-ready, fires quarterly" or moving T92 to Tier 2/3 so the code is tested before post-launch.**

### T120 (Hours Field Vertical-Conditional) Tier 3 — Forward Dependency to T108 (Tier 1)

T120 is in Tier 3. T108 (TruthFile phase, Tier 1) says "T120 (hours field vertical-conditional logic — T120 is XS and should merge before T108)." This is the same inversion pattern as T119/T106. T120 is XS effort and must ship before T108.

**Issue: T120 is mis-tiered. It blocks Tier 1 ticket T108 and should be Tier 0 or Tier 1.**

---

## §4 — Q1–Q13 Decision Coverage in Build Tickets

| Decision | Ticket(s) | Acceptance Criteria Aligned? |
|---------|-----------|-------------------------------|
| Q1 Yossi agency batch at MVP+30 (not MVP) | T130 (Tier 5, MVP+30) | Yes. T130 is correctly Tier 5 MVP+30. T121 provides MVP partial relief. |
| Q2 Heebo 300 italic as Fraunces Hebrew companion | T93 (Tier 0) | Yes. Heebo loads conditionally on `[lang="he"]`; typography.css adds `--font-brief-clauses-he`. |
| Q3 Brief grounding preview in Phase 5 at MVP | T106 (Tier 1) | Yes. Right-column preview panel with inline citation preview. Q3 explicitly named in T106 references. |
| Q4 Activation = first /inbox approval within 7d post-Paddle | T118 (Tier 2) | Yes. `ACTIVATION_WINDOW_DAYS = 7` constant; activation trigger logic. Marcus Day-14 updated. |
| Q5 Quiet "Security & DPA" footer in Phase 6 + 7 | T108 (Phase 7 TruthFile) + T106 (Phase 5 BriefCoAuthor) + T107 (Phase 6 BriefSigning) | Yes. All three phase components reference Q5 and include the quiet footer link. |
| Q6 Paddle deferred post-onboarding (no mid-onboarding gate) | T114 (Paddle activation modal from /home) + T109 (Complete phase routes to /home in Free Account state) | Yes. T109 explicitly says user arrives at /home as Free Account (no Paddle during /start). T114 is the post-onboarding activation path. |
| Q7 Activation window 7 days | T118 (Tier 2) | Yes — T118 references Q4 and Q7 together; 7d window constant defined. |
| Q8 14/14/30 money-back tier split + caps | T117 (Tier 2) + T116 (Tier 2) + T123 (Tier 3) | Yes. T117 defines the constant map. T116 enforces caps. T123 surfaces guarantee lines across UI. |
| Q9 Google OAuth as primary signup | T95 (Tier 0) + T104 (Phase 3 signup-overlay, Tier 1) | Yes. T95 configures the Supabase provider; T104 uses it as primary CTA. Both reference Q9. |
| Q10 Embeddable score badge at MVP+30 | T131 (Tier 5) | Yes. Tier 5 MVP+30. Badge generator, API endpoint, embed script. |
| Q11 Dogfooding scan: build MVP, publish MVP+30 | T132 (Tier 5) + T133 (Tier 5) | Partially. T132 addresses build+publish. T133 is the transparency wall (opt-in). Build-side placement concern flagged in §3. |
| Q12 Adopt Option E | T100 (Tier 1) — the architectural root ticket | Yes. T100 creates the `/start` route with Zustand state machine for all 9 phases. |
| Q13 Ship Option E at MVP | T100–T111 all in Tier 1 | Yes. All Option E tickets are Tier 1 (not Tier 5). Per updated Tier 1 Quality Gate in v3. |

**§4 Result:** All 13 Adam-locked decisions have dedicated build tickets. Q8 coverage is split across three tickets (T117 constants, T116 enforcement, T123 UI surfacing) which is the correct separation of concerns. Q5 is covered across three Phase components (T106, T107, T108) — all three components reference Q5 in their acceptance criteria.

**Minor gap on Q11:** T132's build-side scope should be verified to ship before MVP launch (see §3 T132 tier concern).

---

## §5 — Effort Estimate Sanity Check

**T100 /start route (M effort)**

M effort for a state machine + URL params + 9 dynamically-imported phase components + session restoration + Zustand store setup is borderline under-estimated. The state machine itself is relatively contained, but the integration surface is large: OAuth callback, scan_id carry-through, URL hydration on refresh, Back button navigation, and dynamic imports for 9 phases. This is realistically M-L. However, since phase components T101–T109 each have their own tickets, the isolated complexity per ticket is correct. M is defensible if T100 is scoped strictly to the routing shell + store, with phases handled separately.

**Verdict: M is plausible but tight. Flag for Build Lead to confirm scope boundary between T100 and T101–T109.**

**T106 Phase 5 brief-co-author (L effort)**

L is well-justified: two-column desktop layout, Fraunces 300 italic clause rendering, Heebo fallback for Hebrew, right-column citation preview (real-time update as user edits), integration with T119 pre-fill API, Security & DPA quiet footer, and briefs draft API. This is genuinely L and correctly estimated.

**Verdict: Correct.**

**T130 Yossi Agency Batch Onboarding (L effort)**

L is appropriate. Multi-client cockpit upgrade, abbreviated Phase flow (Phase 3 skip, Phase 5 pre-fill from prior Brief), skip-cinema option for client #3+, recovery email template, and Inngest cron. The acceptance criteria are well-scoped for L. Note that T130 depends on T100, T106, T121, and T79 — all Tier 1/2/3 — so no sequential blocking concern (T130 is Tier 5 MVP+30).

**Verdict: Correct.**

**T133 Plausible-style transparency wall (M effort)**

M for `/wall` route with opt-in toggle, aggregate scan permalink display, privacy enforcement, pinned Beamix entry, and filter-by-vertical. This is a content/display page with a DB query. M feels slightly over-estimated — this is more S-M. The privacy enforcement (no PII, RLS) adds some complexity. M is acceptable.

**Verdict: Acceptable (could be S-M).**

**T119 Pre-fill Three Claims API (S effort)**

S for a `/api/brief/prefill` endpoint that calls Claude Haiku, parses scan results, generates 3 claims, and returns them with fallback logic. Straightforward LLM integration. S is correct.

**Verdict: Correct.**

**T124 Dual-tab Brief lock (M effort)**

M for Postgres advisory lock + optimistic client-side detection + "take over" action + `beforeunload` handler. This is genuinely M — advisory locks have edge cases (lock TTL, lost connection cleanup) and the client-side optimistic detection requires cross-tab communication (BroadcastChannel API or Supabase Realtime). M is justified.

**Verdict: Correct.**

**T95 Google OAuth (S effort)**

S for configuring Supabase Google OAuth provider, updating auth UI in Phase 3 and /login, OAuth callback route with state preservation, and a Playwright smoke test. This is straightforward S.

**Verdict: Correct.**

**T116 Agent-run caps (S effort)**

S for the cap enforcement gate in Inngest agent-execute + /home cap banner + cap disclosure in T109 footer. The counter logic is simple; the main complexity is the refund_window_ends_at timestamp check. S is correct.

**Verdict: Correct.**

---

## §6 — Dependency Graph Integrity

**T100 BLOCKS T101–T110: Correct.** T100 creates the `/start` route and Zustand store. All phase components (T101–T109) import from the Zustand store. T110 wraps the route in PhaseTransition. T111 updates `/scan/[scan_id]` to route to `/start`. All are correctly downstream of T100.

**T119 BLOCKS T106: Structurally correct, tier mismatch.** T119 (`/api/brief/prefill`) is called by T106's BriefCoAuthor component on phase entry. The dependency arrow is correct. The tier placement of T119 (Tier 3) is wrong given this dependency on a Tier 1 ticket — flagged in §3.

**T117 BLOCKS T116: Correct.** T117 defines `REFUND_WINDOW_DAYS` constant. T116 reads it for cap duration. T117 must ship before T116.

**T112–T114 BLOCK T115: Correct.** Recovery emails (T115) fire for Free Account users (T112 defines the state), linked from Paddle activation (T114). T115 cannot be meaningfully tested without T112 and T114 existing.

**T62 BLOCKS T76: Correct.** T76 (/reports) is the first composable surface and consumes `BeamixBlock<TData>` from T62. T70 (slash command) also depends on T62. Both are downstream in the correct tier.

**Circular dependency check:**

Examining the full graph:
- T119 (Tier 3) → T106 (Tier 1): not circular, but wrong direction
- T120 (Tier 3) → T108 (Tier 1): same issue, not circular but wrong direction
- T117 (Tier 2) → T116 (Tier 2): same tier, T117 must complete first within Tier 2. Not circular.
- T121 (Tier 3) → T130 (Tier 5): correct direction (upstream Tier 3, downstream Tier 5)
- T132 (Tier 5) → T133 (Tier 5): both Tier 5; T132 must complete first. Not circular.

**No circular dependencies found.** The two tier-ordering issues (T119 → T106, T120 → T108) are unidirectional forward dependencies placed in the wrong tier.

**Unreachable tickets:** All tickets have at least one upstream dependency reachable from Tier 0 (design system, schema). No orphaned tickets detected.

---

## §7 — Resend Template Count

**PRD v5 F14 states: 15 (v4) → 18 (v5) Resend templates, adding 3 Free Account recovery emails per F53.**

T115 covers the 3 new recovery email templates (day-3, day-7, day-14). This is verified.

**The other 15 templates** are referenced as "existing from v4" and assumed to be covered in v1 ticket T0.11 (Resend setup). Build Plan v3 does not enumerate specific tickets for the original 15 templates. The v2 Build Plan similarly did not create explicit tickets for them — they were assumed part of v1 scope.

**Gap identified:** There are no explicit Tier 0-4 tickets in v2 or v3 that specify building the original 15 Resend templates. T0.11 is a v1 placeholder that says "Resend setup" without listing individual templates. If the 15 templates have not been implemented from v1 work, there is no ticket to build them.

This is a documentation gap, not necessarily an implementation gap. If the 15 templates were built during the v1 sprint (which T0.11 covers), no new tickets are needed. If not, the following templates may be untracked:
1. Day 0 T+10min welcome email
2. Day 2 "inbox item created" email
3. Day 4 engagement email
4. Day 5 follow-up
5. Monday Digest
6. Monthly Update delivery
7. Event-triggered attribution email
8. 72-hour Lead Attribution verification
9. Twilio release 7-day warning
10. Twilio release 48-hour warning
11. "Data expiring" notice
12. Domain migration completion
13. Reactivation "Welcome back" email
14. Brief re-reading quarterly nudge
15. Invite email (Team Seats, T72)

**Recommendation:** Confirm during Tier 0 QA gate that all 15 templates are implemented. If not, create a single ticket under T0.11 extension or under T3.x.

---

## §8 — Domain Infrastructure Section

**Build Plan v3 includes:**

```
## Domain Infrastructure — DONE (updated 2026-05-04)
Status: PRODUCTION READY / CURRENT. No build tickets required.
```

Updated from v2's "(2026-04-29)" to "(updated 2026-05-04)" — reflecting 5 days of additional stabilization.

**v3 additions to the table vs v2:**
- Added: Inngest "Production keys rotated — Current"
- Changed: Resend from "LIVE" to "Verified" (more precise status)
- Changed: Google Search Console from "LIVE" to "Configured"
- Changed: Bing Webmaster Tools from "LIVE" to "Configured"

**Assessment:** The section is present and accurate. The status updates between v2 and v3 are minor clarifications (e.g., "Configured" vs "LIVE" for GSC/Bing). Inngest's addition is correct — production key rotation is a prerequisite for v3 ticket work. Domain naming convention is preserved: `app.beamixai.com`, `notify.beamixai.com`, `beamixai.com`, `beamixai.com/r/{nanoid21}`.

**§8 Result:** Domain Infrastructure section is present, updated, and accurate. No issues.

---

## §9 — What's Missing

### Pre-build validation tickets (5 items from synthesis)

The Flow Architecture Synthesis document lists 5 pre-build validations that should be confirmed before locking the final build:

1. **5-customer guerrilla test of Option A vs Option E mocks** — No ticket exists. This is explicitly a validation task before build begins.
2. **Paddle inline overlay browser compatibility** (Safari iOS, Chrome Android, low-end devices) — No ticket exists. T114 builds the modal but no ticket validates cross-browser reliability first.
3. **Yossi's multi-domain path map through Option E for client #2+** — No ticket exists. T130 is the build ticket; no pre-validation ticket.
4. **Phase 1→2 motion spec (scan completion → results reveal)** — No ticket exists. T110 implements animation orchestration; no ticket pixel-specifies the scan→results transition.
5. **Confirm "claim this scan" permalink routing** — No explicit test ticket, though T111 has acceptance criteria covering this. Partially covered.

**Gap: The 5 pre-build validations are untracked as discrete work items.** These are not engineering tickets — they are validation tasks (guerrilla user tests, browser compat checks, motion specs). They should be tracked even if as non-engineering tasks (notes, manual checks, or lightweight tickets). As written, no one is formally responsible for completing them before T100 dispatches.

### Agent-run cap monitoring / alerting dashboard

T116 builds the cap enforcement gate in Inngest. T116's acceptance criteria include /home banners at 80% and full-cap. However, there is no ticket for an **internal monitoring view** of cap utilization across all customers. If a tier-wide issue causes cap failures, there is no observability surface to diagnose it.

**Gap (minor): No ticket for internal admin monitoring of refund-window cap utilization.** Could be a Supabase query or a simple admin route.

### Refund-rate KPI dashboard

The synthesis document mentions refund-rate as a KPI to track weekly during the launch window. No ticket creates an internal refund-rate dashboard or Supabase query view for this metric.

**Gap (minor): No ticket tracks refund-rate as a weekly monitored KPI.**

### Sitemap and Search Console submission for new /start and /trust routes

T63 (Speed CI gate) and T64 (security.txt) and T66–T68 (new routes) all create new public-facing pages. There is no explicit ticket for:
- Adding `/start`, `/trust`, `/trust/*`, `/changelog`, `/state-of-ai-search` to the XML sitemap
- Submitting the updated sitemap to Google Search Console and Bing Webmaster Tools (both confirmed configured in Domain Infrastructure)

T67 (/changelog) mentions `noindex: false` (indexable) but does not create a sitemap ticket. T66 (Trust Center) is public and should be indexed. T68 (error pages) should be excluded from sitemap.

**Gap (minor): No sitemap update ticket exists for v2 and v3 new public routes.** This is typically a 1-2 hour task that prevents new routes from being discovered by Google. Could be folded into T63 or added as a standalone XS ticket.

---

## §10 — Severity-Ranked Issue List

| Severity | Issue | Tickets Affected | Action Required |
|---------|-------|-----------------|----------------|
| 🔴 | **T119 mis-tiered**: blocks Tier 1 ticket T106 but placed in Tier 3. T106 cannot go to production without T119. | T119, T106 | Promote T119 to Tier 0 or Tier 1 |
| 🔴 | **T120 mis-tiered**: blocks Tier 1 ticket T108 (TruthFile phase) but placed in Tier 3. Note says "XS and should merge before T108" — the tier placement contradicts this. | T120, T108 | Promote T120 to Tier 0 or Tier 1 (XS effort — minimal disruption) |
| 🟡 | **T132 build-side work in Tier 5**: Beamix self-scan weekly cron must run from Day 1 for 30-day trend data to exist at MVP+30. Cron setup in Tier 5 risks a Day 1 miss. | T132 | Split T132: add a Tier 1 or Tier 2 sub-ticket for Inngest cron + internal scan setup; keep the publication/announcement in Tier 5 |
| 🟡 | **Pre-build validations untracked**: 5 synthesis-sourced validations (guerrilla test, Paddle compat, Yossi path map, Phase 1→2 motion spec, claim-scan confirmation) have no assigned ticket or owner | — | Add as explicit items in a pre-dispatch checklist before T100 dispatches; assign to Build Lead or QA Lead |
| 🟡 | **Resend template gap**: 15 original templates not explicitly ticketed in v1/v2/v3 build plans. Risk of launch with missing transactional emails. | T0.11 (v1) | Audit T0.11 completion during Tier 0 QA gate; create extension ticket if any of 15 templates missing |
| 🟢 | **T74 acceptance criteria missing F35 v5 amendment**: 30-day inactive Free Account Twilio cleanup not explicitly listed in T74's AC. T126 covers orphan cleanup generally but the specific "inactive Free Account ≥30 days" path may fall between T74 and T126. | T74, T126 | Add explicit AC to T126 covering `free_account` state + 30-day inactivity cleanup trigger; confirm no gap |
| 🟢 | **F24/T92 priority mismatch**: PRD v5 labels F24 "Priority: MVP"; T92 is in Tier 5. Functionally the code cannot fire until 90 days post-launch, but the code itself should be testable at MVP. | T92 | Consider moving T92 to Tier 2 or Tier 3 so it is implemented and tested before launch; keep Tier 5 notation for "fires at" timing |
| 🟢 | **No sitemap tickets for new public routes**: /trust, /changelog, /state-of-ai-search, /start are all indexable public routes added in v2/v3 with no sitemap update ticket | — | Add XS ticket (or fold into T63) to update `sitemap.xml` + submit to GSC/Bing for all new public routes |
| 🟢 | **No internal refund-rate KPI or cap monitoring ticket**: T116 builds enforcement but no observability for Adam or Build Lead to monitor refund window utilization across customers | — | Low-priority; can be a Supabase saved query view. Flag for post-MVP if not needed pre-launch |
| ✅ | All 35 v2 numbered tickets (T58–T92) present in v3 with identical scope, effort, and dependencies | — | No action |
| ✅ | All 13 Adam-locked decisions (Q1–Q13) have dedicated implementing tickets | — | No action |
| ✅ | No circular dependencies in the dependency graph | — | No action |
| ✅ | All 12 Option E phase tickets (T100–T111) correctly placed in Tier 1 | — | No action |
| ✅ | F48–F54 new features all correctly ticketed (T129–T133) with correct MVP+30 or MVP tier | — | No action |
| ✅ | Domain Infrastructure section updated and accurate | — | No action |
| ✅ | Tier ordering correct for T62 → T70 → T76 chain | — | No action |
| ✅ | Effort estimates reasonable for T100 (M), T106 (L), T130 (L), T133 (M) | — | Minor note on T100 scope boundary |

---

## Verdict

**PASS-WITH-MINOR-FIXES**

Build Plan v3 is structurally sound. All v2 tickets are preserved. All F1–F54 features have covering tickets. All 13 Adam-locked decisions have implementing tickets. No circular dependencies. No dropped tickets.

**Two fixes required before Tier 1 dispatch begins:**

1. **Promote T119 to Tier 0 or Tier 1.** It is a hard dependency for T106 (Phase 5 BriefCoAuthor) and will block T106 from going to production if T119 ships after it.

2. **Promote T120 to Tier 0 or Tier 1.** It is XS effort and a hard dependency for T108 (TruthFile phase). The ticket text itself says "should merge before T108" — the tier placement contradicts this.

**One fix required before MVP launch:**

3. **Split T132** into a Tier 1/2 build-side ticket (Inngest cron + internal scan setup) and a Tier 5 publication ticket. If T132 stays entirely in Tier 5, the Beamix self-scan data will not exist 30 days post-launch when it needs to be published.

**Three items to track pre-dispatch:**

4. **Pre-build validations** (5 items from synthesis): assign to Build Lead or QA Lead as non-engineering tasks before T100 dispatches.
5. **Resend template audit**: confirm during Tier 0 QA gate that all 15 original templates are implemented under T0.11.
6. **Sitemap ticket**: add XS ticket for new public routes (/trust, /changelog, /state-of-ai-search).

The two tier-promotion fixes (T119, T120) are the only changes required to unblock Tier 1 dispatch. Everything else is advisory or post-launch.

---

*End of Build Plan v3 Integrity Audit. — Build Lead*
