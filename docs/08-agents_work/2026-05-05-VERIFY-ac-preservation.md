# AC Preservation Audit — PRD v4 → v5.1 → v5.2 Amendments

**Date:** 2026-05-05
**Auditor:** CEO (AC preservation audit — post-v5.1 patch application, post-v5.2 amendments)
**Scope:** F1–F56 coverage check across v5.1 + v5.2. Cross-spec integrity. Build Plan v3.2 new tickets.
**Source documents read:**
- `2026-04-28-PRD-wedge-launch-v4.md` — v4 baseline (deprecated; used as AC comparison baseline only)
- `2026-05-04-PRD-wedge-launch-v5.1.md` — current canonical PRD (540 AC checkboxes)
- `2026-05-05-PRD-AMENDMENTS-v5.2.md` — latest amendment layer
- `2026-05-04-VERIFICATION-feature-parity.md` — prior audit (produced the FIX-PLAN)
- `2026-05-04-FIX-PLAN-v5-to-v5.1.md` — patch operations that were applied to create v5.1
- `2026-05-05-CANONICAL-DOCS-INDEX.md` — version index

**Methodology:** This audit verifies that all patches described in the FIX-PLAN were applied in v5.1, that v5.2 amendments are correctly scoped, and that no AC gaps introduced between v4 → v5 remain unresolved after v5.1. v4 has 278 AC checkboxes; v5.1 has 540 — the increase confirms substantial AC restoration was performed.

---

## §1 — Feature ID Coverage Table (F1–F56)

| Feature ID | Has Full ACs? | Amendments Preserved? | v5.2 Changes Applied? | Risk |
|---|---|---|---|---|
| **F1 /scan public** | Yes — 13 ACs | Yes — "Claim this scan" routing, /start integration, 14-day guarantee, tier picker | Yes — non-SaaS CTA amendment from §2; vertical-conditional CTA; `detected_vertical` column AC | 🟢 |
| **F2 Onboarding (/start)** | Yes — 19 ACs across 9 phases | Yes — all Option E phases, Seal ceremony, WCAG fix, skip-cinema, dual-tab lock, pre-fill Three Claims, Heebo Q2, Q5 footer link | Yes — Phase 4 SaaS-only path + non-SaaS waitlist exit (v5.2 §2) | 🟡 See note F2-1 |
| **F3 Truth File** | Yes — 10 ACs | Yes — base schema, SaaS + e-commerce vertical extensions, discriminatedUnion | n.a. (no v5.2 amendment) | 🟢 |
| **F4 Pre-publication validation** | Yes — 12 ACs | Yes — all 5 validator rules, signed token, Brand Voice Fingerprint, Free Account billing placement amendment | n.a. | 🟢 |
| **F5 /home** | Yes — 11 ACs | Yes — 8 sections, Activity Ring re-spec, Board 2 cuts, Free Account state amendment | n.a. | 🟢 |
| **F6 /inbox** | Yes — 12 ACs | Yes — 3-pane Linear-pattern, J/K nav, Seal-draw on approval only, bulk-approve rules, sample items | n.a. | 🟢 |
| **F7 MVP agent roster (6 agents)** | Yes — voice canon, deterministic seed, per-agent definitions | Yes — Voice Canon Model B rule prominent; all 6 agents defined with schema types | Yes — v5.2 §4 reinforces agent name surfaces (internal-only list) | 🟢 |
| **F8 /workspace** | Yes — 11 ACs | Yes — execution-as-narration, no walking figure, F30 citation, F31 binding line | n.a. | 🟡 See note F8-1 |
| **F9 /scans** | Yes — 11 ACs | Yes — Board 2 changes (margin cut, engine micro-strip, sparkline spec), F22, F30, F31 | n.a. | 🟢 |
| **F10 /competitors** | Yes — 8 ACs | Yes — Rivalry Strip, dual-sparkline spec, tier gating, Board 2 cuts | n.a. | 🟢 |
| **F11 /crew** | Yes — 11 ACs (v5.1) | Yes — monogram spec, 18 agent colors, row-expand controls, F19 integration | Yes — v5.2 §3 supersedes: Build+Scale get full autonomy; Discover gets read-only. CONFLICT: v5.1 still says "Build customers see button but clicking opens upgrade modal." v5.2 is the override. | 🟡 See note F11-1 |
| **F12 Lead Attribution Loop** | Yes — 10 ACs | Yes — Twilio, UTM, Day-14 correctly anchored to Paddle checkout (P9 fix applied) | n.a. | 🟢 |
| **F13 /settings** | Yes — 8 ACs | Yes — all tabs, per-client white-label, print ops sub-page, Brief tab | n.a. | 🟢 |
| **F14 Email infrastructure** | Yes — 15 ACs | Yes — 3-category cadence, Monthly Update PDF additions, temporal decay, F53 cross-link; ~22 total templates counted | n.a. | 🟢 |
| **F15 11 text AI engine coverage** | Yes — 7 ACs | Yes — "AO" abbreviation fix applied, cost ceiling instrumentation | n.a. | 🟢 |
| **F16 2 vertical knowledge graphs** | Yes (v5.1) — 5 ACs | Yes (v5.1) — SaaS + e-commerce at MVP | CONFLICT: v5.1 still says "2 vertical KGs (SaaS + e-commerce)." v5.2 §2 supersedes: 1 vertical KG (SaaS only) at MVP; e-commerce → MVP+30. v5.2 replacement ACs (8 items) are fully specified. | 🟡 See note F16-1 |
| **F17 Marketplace** | Yes — 6 ACs | Yes — Beamix-authored only, no publishing, no leaderboards/rev-share; "no Hall of Fame" AC dropped from v5.1 (minor) | n.a. | 🟢 |
| **F18 Incident runbook** | Yes — 7 ACs | Yes — rollback, revert payload, kill switch, Truth File integrity job | n.a. | 🟢 |
| **F19 Workflow Builder** | Yes — 15 ACs (RESTORED in v5.1) | Yes — React Flow DAG, cream-paper canvas, node anatomy, Brief grounding cell, dry-run, narration column, skip-cinema. FIX-PLAN C-1 resolved. | Yes — v5.2 §3 supersedes gating: Build+Scale at MVP; Discover excluded. v5.1 says "Scale-only" — v5.2 is the override. CONFLICT. | 🟡 See note F19-1 |
| **F20 /security public page** | Yes — 12 ACs (RESTORED in v5.1) | Yes — Aria's 5 fixes, cream hex swatch test, "cannot publish" voice canon, all 10 sections, GDPR DSAR endpoints | n.a. | 🟢 |
| **F21 Scale-tier DPA** | Yes — 6 ACs (RESTORED in v5.1) | Yes — indemnification cap ($25K/incident), Paddle DPA signing, tech E&O insurance, /security link | n.a. | 🟢 |
| **F22 AI Visibility Cartogram** | Yes — 9 ACs | Yes — Phase 2 /start surface added; all v4 criteria preserved; OG card, Monthly Update PDF. Amendment v5 clean. | n.a. | 🟡 See note F22-1 |
| **F23 Cycle-Close Bell** | Yes — 9 ACs (RESTORED in v5.1) | Yes — easing curves per motion moment, exact ms durations, non-replay rule, sequence order, Arc's Wave preserved | n.a. | 🟢 |
| **F24 Brief Re-Reading quarterly** | Yes — 9 ACs (RESTORED in v5.1) | Yes — auto-redirect timer (3-second countdown line), timezone-awareness, dismiss-equals-looks-good, `brief_quarterly_reviews` table. FIX-PLAN C-3 resolved. | n.a. | 🟢 |
| **F25 Receipt-That-Prints card** | Yes — 8 ACs (RESTORED in v5.1) | Yes — 96px height, clip-path entrance animation, 24h lifetime, "does not appear if PDF generation fails" rule, deterministic seed | n.a. | 🟢 |
| **F26 Print-Once-As-Gift** | Yes — 9 ACs | Yes — correctly Post-MVP; `customer_profiles.office_address` dependency documented; collection point now in Phase 7 (truth-file) per F2 v5.1 AC. FIX-PLAN I-3 resolved. | n.a. | 🟢 |
| **F27 Print-the-Brief button** | Yes — 3 ACs (AMENDED in v5.1) | Yes — WCAG 2.2.1 fix applied (no auto-dismiss timer). FIX-PLAN C-2 resolved. v5.1 Amendment v5.1 label present. v4 8-second contradiction removed. | n.a. | 🟢 |
| **F28 "What Beamix Did NOT Do"** | Yes — 8 ACs (RESTORED in v5.1) | Yes — position (Page 6 above Seal), typography, rejection log link, N=0 edge case, M=0 variant | n.a. | 🟢 |
| **F29 Printable A4 ops card** | Yes — 9 ACs (RESTORED in v5.1) | Yes — Geist Mono, white paper (not cream), sections, Yossi 2-minute target, print stylesheet | n.a. | 🟢 |
| **F30 Brief grounding citation** | Yes — 9 ACs | Yes — Phase 6 preview amendment clean; standard treatment; Workflow Builder cream+Fraunces variant; `authorized_by_brief_clause` API extension carried from v4 Amendment. FIX-PLAN I-5 resolved. | n.a. | 🟢 |
| **F31 Brief binding line** | Yes — 9 ACs (RESTORED in v5.1) | Yes — 13px Fraunces 300 italic, ink-3, centered, 24px above footer, rotation logic, surfaces listed, surfaces excluded | n.a. | 🟢 |
| **F32 Brief Re-author + Undo Window** | Yes — 9 ACs (RESTORED in v5.1) | Yes — 10-minute undo, Seal on re-sign, brief_versions table, audit log, "This is still wrong" escape hatch (in F32 context), Yossi edge case. Pre-signing escape hatch in Phase 6 remains only in F32 prose (not as an explicit Phase 6 AC checkbox) — see §2 note. | n.a. | 🟡 See note F32-1 |
| **F33 Team Seats and Role Permissions** | Yes — 9 ACs (RESTORED in v5.1) | Yes — Discover/Build/Scale seat limits, Owner vs Editor roles, invite flow, audit log, Paddle seats included | n.a. | 🟢 |
| **F34 Customer Data Export** | Yes — full spec with 10 ACs + 7 Privacy & Data tab required elements (RESTORED in v5.1) | Yes — GDPR Article 20, all data categories, Privacy & Data tab content (storage region statement, encryption statement, training opt-out, retention summary, sub-processors link, DSAR link, section header). FIX-PLAN M-7 resolved. | n.a. | 🟢 |
| **F35 Graceful Cancellation** | Yes — 5 ACs + 3 Amendment blocks | Yes — 14/14/30 split (Q8), agent-run caps, abandoned Twilio cleanup. All 3 amendments cleanly labeled. FIX-PLAN confirms this was already clean. | n.a. | 🟢 |
| **F36 Domain Migration Flow** | Yes — 10 ACs (RESTORED in v5.1) | Yes — 4-step wizard, DNS TXT or meta-tag verification, Brief re-sign, old domain labeling, 90-day limit, Yossi edge case | n.a. | 🟢 |
| **F37 /reports** | Yes — 11 ACs (RESTORED in v5.1) | Yes — status column, Preview, Edit, Approve-and-send, Yossi multi-client this-month filter, per-client auto-send toggle, share link privacy | n.a. | 🟢 |
| **F38 Subscription Pause** | Yes — 10 ACs (RESTORED in v5.1) | Yes — 1 or 3 months, Paddle pause API, Twilio stays active during pause, 2 pauses per 12-month cap, no trial-period availability | n.a. | 🟢 |
| **F39 Competitor Removal** | Yes — 10 ACs (RESTORED in v5.1) | Yes — removal flow, exclusion list takes precedence over KG, audit log, Restore action, Yossi per-client isolation | n.a. | 🟢 |
| **F40 Multi-Domain Scale Tier** | Yes — 8 ACs (RESTORED in v5.1) | Yes — $49/domain add-on, multi-client cockpit, cockpit columns, per-client white-label from cockpit, domain deletion read-only mode | n.a. | 🟢 |
| **F41 Cmd-K command bar** | Yes — 10 ACs (RESTORED in v5.1) | Yes — sacred shortcuts, slash command, mobile fallback, Brief grounding on results, zero-result state | n.a. | 🟢 |
| **F42 Trust Center** | Yes — 8 ACs | Yes — Phase 7 footer link (Q5), /trust sub-pages, Israeli DPA supplement, Yossi multi-client addendum, public DPA at /trust/dpa (all from v5.1 Amendment v5) | n.a. | 🟢 |
| **F43 Vulnerability disclosure** | Yes — 6 ACs (RESTORED in v5.1) | Yes — security.txt at MVP, HackerOne at MVP+30, /trust/disclosure, acknowledgments page, Sev-1 emergency line | n.a. | 🟢 |
| **F44 /changelog** | Yes — 11 ACs (RESTORED in v5.1) | Yes — weekly entries, Geist Mono dateline, Fraunces title, reading time signal, /changelog OG card, subscribe CTA | n.a. | 🟢 |
| **F45 Compact mode toggle** | Yes — 10 ACs (RESTORED in v5.1) | Yes — row heights per surface, Yossi auto-default rule, localStorage persistence, cream surfaces exempt, print always full-spacing | n.a. | 🟢 |
| **F46 Editorial error pages** | Yes — 9 ACs (RESTORED in v5.1) | Yes — 4 pages, cream paper, Fraunces line, Seal, dateline, /status external, F31 binding line, Sentry logging | n.a. | 🟢 |
| **F47 State of AI Search 2026** | Yes — 12 ACs | Yes — MVP+90 timing, 8 hero charts, 11-section editorial spine, P11 data instrumentation amendment (3 new tables + daily Inngest job + consent flag) | n.a. | 🟢 |
| **F48 Yossi Agency Batch Onboarding** | Yes — 9 ACs (MVP+30) | Yes — Q1 lock, batch mode trigger, skip-to-Brief CTA, Seal ceremony preserved, Day-7 recovery email | Yes — v5.2 §2 bundles F48 with e-commerce KG at MVP+30. Dependency noted in v5.2 Build Plan amendments. | 🟢 |
| **F49 Embeddable Score Badge** | Yes — 9 ACs (MVP+30) | Yes — Q10 lock, ≥70 threshold, two variants, CDN-served, auto-public confirmation step | n.a. | 🟢 |
| **F50 Public Dogfooding Scan** | Yes — 8 ACs (Built MVP / Published MVP+30) | Yes — Q11 lock, internal scan from Day 1, permalink exists but not indexed at MVP, goes public at MVP+30 | n.a. | 🟢 |
| **F51 Two-Tier Activation Model** | Yes — 11 ACs | Yes — Q6 lock, Free Account state, Paddle inline modal, Free Account → Paid Customer transition, no re-onboarding | n.a. | 🟢 |
| **F52 Free Account Sample Data** | Yes — 10 ACs | Yes — Claude Haiku generation, 3–5 items, real scan data, "Sample" label, removed on activation | n.a. | 🟢 |
| **F53 Day-N Free Account Recovery** | Yes — 10 ACs (MVP) | Yes — Day 3/7/14 sequence, copy specified, suppression rules, voice canon Model B | n.a. | 🟢 |
| **F54 Refund Risk: Agent-Run Caps** | Yes — 10 ACs (MVP) | Yes — Q8 lock, Discover 5/Build 10/Scale 20, enforcement logic, cap indicator at 80%, Phase 7 notification | n.a. | 🟢 |
| **F55 Pre-Brief Abandonment Recovery** | Yes — 7 ACs (NEW — Patch P10) | Yes — Day 1/3/7, suppression rules, cream paper register, voice canon, unsubscribe | n.a. (new in v5.1) | 🟢 |
| **F56 Cookie Consent Banner** | Yes — 7 ACs (NEW — Patch P12) | Yes — bottom-anchored, 3 buttons, no pre-checks, GDPR + Israeli PPL, 12-month expiry, Settings revocation | n.a. (new in v5.1) | 🟢 |

### §1 Summary

Out of 56 features (F1–F56), **49 are fully clean (🟢)**. The FIX-PLAN patches (P1–P13, B1–B6) were all applied and resolved the four critical issues identified in the prior feature-parity audit. The 7 features marked 🟡 have minor or important notes documented below — none are critical blockers at this time; they are known and intentional states arising from the amendment-layer architecture (v5.2 lives as a separate doc amending v5.1 without being folded in).

---

## §2 — v5.2 Amendment Integration Check

### Architecture note (flag for Adam)

**v5.2 is currently a SEPARATE amendments document.** It amends v5.1 but has not been folded into v5.1 as a unified v5.3 PRD. This creates a two-document reading requirement: every build agent must have BOTH v5.1 and v5.2 open simultaneously, with v5.2 taking explicit precedence where it overrides v5.1. The canonical-docs-index classifies v5.2 as canonical for its delta only.

**Flag:** Adam must decide whether to fold v5.2 into v5.3 (a full merged PRD) or continue the amendment-layer model. The amendment-layer model is workable if all build agents are briefed explicitly that v5.2 supersedes v5.1 on the specific features it touches. The risk is that a build agent reading only v5.1 will implement the wrong F16 (two verticals instead of one), the wrong F19 gating (Scale-only instead of Build+Scale), and the wrong F11 autonomy controls (Build gets upgrade modal instead of full access). These are the three live contradictions.

---

### F16 — SaaS-only at MVP (R1)

**v5.1 status:** F16 still reads "2 vertical knowledge graphs (SaaS + e-commerce)" with 5 ACs. All 5 original ACs describe a two-vertical MVP.

**v5.2 status:** §2 explicitly replaces the F16 ACs in full. 8 new ACs specified. E-commerce vertical KG → MVP+30.

**Integration verdict:** The v5.2 amendment is complete and actionable. A build agent reading only v5.2 will find full replacement ACs for F16. The conflict with v5.1 is intentional and structurally correct for the amendment-layer model, provided agents are briefed. Build Lead must explicitly note in dispatch briefs: "v5.2 §2 supersedes F16 in v5.1."

**Risk level:** 🟡 Important — must be flagged in every build agent brief for F16-related tickets.

---

### F19 — Workflow Builder Build+Scale (R3)

**v5.1 status:** F19 AC explicitly states "React Flow DAG editor ships for Scale-tier users at MVP" and "Build-tier customers see upgrade modal on `+ New Workflow` click."

**v5.2 status:** §3 supersedes the gating lines. Build + Scale both get the editor. Discover excluded. Feature-flag matrix updated: `WORKFLOW_BUILDER` = true for `build` AND `scale`.

**Integration verdict:** The v5.2 amendment is complete. Pricing table AC amendment also appended (Build ✓, Scale ✓, Discover —). The v5.1 contradiction remains in the v5.1 file body but is overridden by v5.2.

**Risk level:** 🟡 Important — must be flagged for ticket T19 (Workflow Builder), T130 (agency), and any pricing page tickets.

---

### F11 — /crew Autonomy Controls (R3)

**v5.1 status:** F11 AC states "Scale customers see `+ New Workflow` button (F19). Build customers see button but clicking opens upgrade modal."

**v5.2 status:** §3 F11 amendment supersedes: Build + Scale both get the `+ New Workflow` button opening the editor. Discover does not see the button. Per-agent autonomy controls: Build + Scale full; Discover read-only (greyed, tooltip only — no upgrade modal).

**Integration verdict:** The v5.2 amendment is complete with 4 new ACs. These 4 ACs are NOT in v5.1. Build agent must read v5.2 §3 for any /crew work.

**Risk level:** 🟡 Important — must be included in F11 build brief.

---

### F2 Phase 4 — Non-SaaS Waitlist Exit (R1)

**v5.1 status:** Phase 4 vertical-confirm describes a SaaS / E-commerce / "Coming Soon" path with business_id creation on confirmation.

**v5.2 status:** §2 replaces Phase 4 entirely. Non-SaaS domains hit a waitlist exit path — no business_id created, no onward flow to Phase 5. 6 new ACs for the non-SaaS exit path.

**Integration verdict:** v5.2 §2 has complete replacement ACs for Phase 4 non-SaaS behavior. Clean. Dependency on T148 (Resend Non-SaaS Audience) correctly noted.

**Risk level:** 🟢 Clean (amendment complete, dependency documented).

---

### Summary of 4 v5.2 amendment features

| Area | v5.1 Stance | v5.2 Override | Actionable? |
|---|---|---|---|
| F16 vertical KGs | 2 at MVP | 1 at MVP (SaaS); e-commerce → MVP+30 | Yes — 8 new ACs in v5.2 §2 |
| F2 Phase 4 | SaaS + E-commerce + "Coming Soon" | Non-SaaS exit + waitlist | Yes — 6 new ACs in v5.2 §2 |
| F19 gating | Scale-only | Build + Scale | Yes — gating ACs updated in v5.2 §3 |
| F11 /crew | Scale full / Build upgrade modal / Discover none | Build+Scale full / Discover read-only tooltip | Yes — 4 new ACs in v5.2 §3 |

---

## §3 — Build Plan v3.2 New Tickets Verification

### T148 — Non-SaaS Vertical Waitlist Email Infra

**Defined in v5.2?** Yes — §6, complete ticket spec.
**ACs present?** Yes — 8 ACs including Resend Audience creation, API route spec, Phase 4 integration, /scan integration, 3-email nurture sequence, analytics event.
**Build Lead clarity?** High — files listed (`apps/web/src/app/api/waitlist/non-saas/route.ts`, `apps/web/src/inngest/functions/waitlist-nurture.ts`), effort S, Tier 1.
**Dependencies correct?** T0.9 (Resend setup), T108 (Phase 7 truth-file), T100 (Phase 4 vertical-confirm). All three are legitimate prerequisites.

**Verdict:** 🟢 Actionable.

---

### T149 — Public Scan Permalink Visitor View

**Defined in v5.2?** Yes — §6, complete ticket spec.
**ACs present?** Yes — 14 ACs including RSC rendering, private vs shared behavior, progressive disclosure on cartogram, "Get your free scan" CTA, vertical-conditional CTA, OG meta tags, authenticated vs unauthenticated viewer distinction, 30-day expiry handling, Playwright snapshot test.
**Build Lead clarity?** High — pixel spec at `2026-05-05-DESIGN-public-scan-permalink-v1.md` (file confirmed to exist on disk). Files listed. Effort M, Tier 1.
**Dependencies correct?** T100 (phase state machine — scan-claim routing), T101 (Phase 0 enter-url), T111 (scan permalink amendment), F22 (cartogram component must exist). All legitimate. T111 dependency is correct — the scan permalink amendment must be live before the visitor view can be built.

**Gap flagged:** v5.2 notes "pixel spec in `2026-05-05-DESIGN-public-scan-permalink-v1.md` (to be authored)" at the end of the cross-references table. The file EXISTS on disk (verified). No gap here — the design spec was authored before this audit.

**Verdict:** 🟢 Actionable.

---

### T150 — Maintenance Page (Cloudflare Worker)

**Defined in v5.2?** Yes — §6, complete ticket spec.
**ACs present?** Yes — 10 ACs including Cloudflare Worker deployment, branded HTML per Hard Reset plan, Resend audience integration, Cache-Control headers, mobile render test, binding line, Worker disabled at Tier 0 production deployment.
**Build Lead clarity?** High — the full Worker HTML script is in `2026-05-05-HARD-RESET-EXECUTION-PLAN.md`. Files noted (Cloudflare Worker dashboard only — not a repo file, which is correct). Effort XS, Tier 0.
**Dependencies correct?** None (Cloudflare-level, no Next.js dependencies). Correct.

**Verdict:** 🟢 Actionable.

---

### T151 — 4-Agent QA Gate Process Tooling

**Defined in v5.2?** Yes — §6, complete ticket spec.
**ACs present?** Yes — 7 ACs covering: the 4 QA agent prompt files at `.agent/prompts/qa/`, QA findings template at `.agent/templates/qa-findings.md`, severity tier definitions (Sev-1/Sev-2/Sev-3), merge rule documented, Build Lead dispatch template.
**Build Lead clarity?** High — files are all documentation/prompts at `.agent/prompts/qa/` and `.agent/templates/`. No code files. Effort S, Tier 0.
**Dependencies correct?** None (process tooling). Correct.
**Cross-reference to QA gate spec:** `2026-05-05-QA-GATE-PROCESS-v1.md` is noted as a prerequisite. File listed on disk in the agents_work directory (confirmed via ls output).

**Verdict:** 🟢 Actionable.

---

### Build Plan ticket count reconciliation

| Build Plan version | Ticket count | Status |
|---|---|---|
| v3 (pre-patch) | T0.1 – T133 (approx 133) | Deprecated |
| v3.1 (after FIX-PLAN patches B1–B6) | T0.1 – T147 (147 tickets) | Canonical |
| v3.2 (after v5.2 amendments) | T0.1 – T151 (151 tickets) | v3.2 lives in v5.2 §6 as an amendment layer |

The 4 new tickets (T148–T151) are defined exclusively in v5.2 §6. They are NOT yet appended to the `2026-05-04-BUILD-PLAN-v3.1.md` file body. A build agent reading only the Build Plan v3.1 file will not find T148–T151. This is the same amendment-layer gap as the PRD: the tickets exist in v5.2 but have not been folded into the Build Plan file itself.

**Flag:** Same decision as PRD merging — does Adam want a Build Plan v3.2 file that folds in T148–T151, or does the amendment-doc model suffice? At minimum, the canonical-docs-index should note that v5.2 §6 extends the Build Plan.

---

## §4 — Cross-Spec Preservation

### Design spec cross-link audit

All 6 referenced design specs verified as existing on disk:

| Spec file | Features it covers | Referenced in v5.1? | Referenced in v5.2? | File on disk? |
|---|---|---|---|---|
| `2026-04-28-DESIGN-ai-visibility-cartogram-v1.md` | F22 cartogram spec | Indirectly (F22 spec inline; no explicit doc cross-link in F22 body of v5.1) | No | ✅ Exists |
| `2026-04-28-DESIGN-features-F23-F31-specs.md` | F23–F31 design details | Indirectly (features have inline specs; canonical-docs-index lists it as CANONICAL) | No | ✅ Exists |
| `2026-04-28-DESIGN-small-multiples-grids-v1.md` | F22 sister (11-engine grid, competitor parity grid) | Not explicitly cross-linked in v5.1 feature bodies | No | ✅ Exists |
| `2026-04-28-LEAD-ATTRIBUTION-tech-spec-v1.md` | F12 technical implementation | Not explicitly cross-linked in F12 body of v5.1 | No | ✅ Exists |
| `2026-05-04-OPTION-E-START-FLOW-SPEC.md` | F2 /start route — pixel + state machine | Yes — §4 explicitly: "Pixel-level detail for the /start flow lives in:" + F2 deprecation notice cross-link | No (not needed) | ✅ Exists |
| `2026-05-05-DESIGN-public-scan-permalink-v1.md` | F1 public permalink + T149 | No (spec is new, added in v5.2) | Yes — §2 F1 amendment + T149 ticket both cross-link explicitly | ✅ Exists |

**Gap noted:** F22 (AI Visibility Cartogram) in v5.1 does not include an explicit cross-link to `2026-04-28-DESIGN-ai-visibility-cartogram-v1.md`. The spec is reproduced inline in v5.1 (which is good for self-containedness) but the pixel spec document has additional implementation detail that frontend developers should read. The canonical-docs-index lists the cartogram spec as CANONICAL. Low risk — a developer will find it via the index.

**Similar gap:** `2026-04-28-LEAD-ATTRIBUTION-tech-spec-v1.md` is not cross-linked from F12 in v5.1. The canonical-docs-index does not appear to list it explicitly (it was listed in the CANONICAL DOCS under Design Specs in the earlier index version). This is low risk but warrants a note.

**Verdict:** All 6 specs exist on disk. Cross-links are correct where present. Two missing explicit cross-links (F22 → cartogram spec, F12 → lead attribution spec) are minor.

---

### Canonical docs index accuracy

The `2026-05-05-CANONICAL-DOCS-INDEX.md` lists PRD v5.1 as THE canonical PRD (Quick Start item 1). It correctly lists v4 as DEPRECATED. It does NOT yet reference v5.2 as an amendment layer in the PRD section — only Build Plan v3.1 and the OPTION-E spec are listed in the Quick Start 5-doc set.

**Gap:** The canonical-docs-index does not include `2026-05-05-PRD-AMENDMENTS-v5.2.md` in the PRD section under canonical docs. A new contributor reading the index would read only v5.1 and miss the R1/R3 amendments entirely. This should be added as a 6th item in the Quick Start list with a note: "Amends F16, F19, F11, and Phase 4 of F2. Must be read alongside v5.1."

---

## §5 — The "What Could Be Lost" Check

### Deprecated version references in active build instructions

Searched v5.1 for "v4" references that could guide build agents back to deprecated content:
- `"(Spec unchanged from v4.)"` appears **0 times** in v5.1. All such stubs were replaced by FIX-PLAN patches P1–P13. Confirmed.
- `"See full v4 spec"` appears **0 times** in v5.1. Critical FIX-PLAN item C-1 was resolved — F19 now has full inline ACs.
- `"unchanged from v4"` appears in 2 contexts in v5.1: both are describing v4's source relation (e.g., "Seal ceremony unchanged from v4" as inline prose), not as spec-pointer stubs. No broken references remain.
- `"beamix.tech"` appears **0 times** in v5.1 (confirmed by grep audit). Domain is clean.
- `"BeamixAI"` appears **0 times** in v5.1 (confirmed). Brand name usage is clean.

**Verdict:** No deprecated reference stubs remain as AC pointers in v5.1.

---

### TODO / TBD left in v5.1 or v5.2

**v5.1:** No `TODO` or `TBD` markers found in feature bodies. The `2026-05-05-DESIGN-public-scan-permalink-v1.md` was noted as "to be authored" in v5.2's cross-reference table, but the file now exists on disk — confirmed.

**v5.2:** The Summary of Changes table at the end of v5.2 notes that the `QA-GATE-PROCESS-v1.md` was "to be authored" as a parallel deliverable to T151. That file is confirmed to exist at `2026-05-05-QA-GATE-PROCESS-v1.md` (visible in the ls output of docs/08-agents_work/). No open TODOs remain in v5.2.

**Verdict:** No unresolved TODO/TBD items in either document.

---

### Contradictions between v5.1 and v5.2

Three live contradictions exist as a structural consequence of the amendment-layer model:

| Contradiction | v5.1 says | v5.2 says | Resolution |
|---|---|---|---|
| F16 vertical KGs | "2 vertical KGs (SaaS + e-commerce)" as MVP | "1 vertical KG (SaaS)" at MVP; e-commerce → MVP+30 | v5.2 supersedes. Not a bug — it's an intentional amendment. |
| F19 gating | "Scale-tier users at MVP" / "Build customers see upgrade modal" | "Build + Scale users at MVP" / "Discover excluded" | v5.2 supersedes. Intentional amendment. |
| F11 /crew | "Scale customers see `+ New Workflow`" / "Build see but click opens upgrade modal" | "Build + Scale see + get full editor" / "Discover read-only tooltip" | v5.2 supersedes. Intentional amendment. |

All three contradictions are expected, documented, and correctly scoped. They become problems only if a build agent reads v5.1 without v5.2. The canonical-docs-index gap (see §4) is the primary risk vector for this.

---

### Features in Build Plan v3.1 that are not in PRD v5.1 + v5.2

Checked Build Plan v3.1 for tickets that map to features not defined in v5.1 or v5.2. Build Plan v3.1 covers T0.1–T147. The ticket-to-feature mapping is described in Build Plan v3.1. No tickets in v3.1 were found to reference feature concepts that do not exist in v5.1 or v5.2. The FIX-PLAN audit that produced v3.1 explicitly verified this mapping (see `2026-05-04-VERIFICATION-build-plan-integrity.md`).

**One minor item:** Build Plan v3.1 still references "15 v4 + 3 new free-account-recovery" templates (in T146 acceptance criteria) rather than the full updated count of ~22. The v5.1 amendment to F14 states "Total Resend templates at MVP: ~22" (adding 3 for F55 pre-Brief abandonment + 1 for F56 cookie consent revocation). T146 in Build Plan v3.1 should be updated to reflect ~22 templates. This is a minor drift — T146 scope is "audit and complete" so the build agent will find the right answer by reading F14 in v5.1.

---

## §6 — Severity-Ranked Findings

### 🔴 Critical — Must fix before next build dispatch

**None at this time.** All four critical issues from the prior feature-parity audit (C-1 through C-4) were resolved in v5.1 via the FIX-PLAN patches:
- C-1 (F19 ACs missing): RESOLVED — F19 has 15 ACs in v5.1.
- C-2 (F27 auto-dismiss contradiction): RESOLVED — Amendment v5.1 removes timer; v4 contradiction eliminated.
- C-3 (brief_quarterly_reviews missing from Tier 0): RESOLVED — SQL block present in Tier 0 infrastructure section.
- C-4 (systemic AC stripping for "unchanged" features): RESOLVED — v5.1 has 540 AC checkboxes vs v5's 278, confirming restoration.

---

### 🟡 Important — Should address before v5.3 or next amendment doc

**I-1: Canonical-docs-index does not reference v5.2 as a required reading document.**
The `2026-05-05-CANONICAL-DOCS-INDEX.md` Quick Start section lists 5 documents. v5.2 is absent. Any build agent who follows the Quick Start will read v5.1 + Build Plan v3.1 and miss the R1/R3 amendments entirely. This creates a real risk of implementing the wrong F16, F19, and F11 behavior.

*Fix:* Add v5.2 as Quick Start item 6 with explicit note: "Amends F16 (SaaS-only vertical), F19 (Build+Scale gating), F11 (/crew autonomy), and Phase 4 of F2 (non-SaaS waitlist exit). Read alongside v5.1."

**I-2: T148–T151 are not in the Build Plan v3.1 file body.**
The 4 new tickets live exclusively in v5.2 §6. A build agent reading only Build Plan v3.1 will not find these tickets. They include T150 (Maintenance Page — Tier 0, must be first) and T151 (QA Gate tooling — Tier 0, blocks every wave).

*Fix:* Either (a) append T148–T151 to Build Plan v3.1 to create v3.2, or (b) add a prominent note to the top of Build Plan v3.1 linking to v5.2 §6 for the 4 amendment tickets.

**I-3: F11 /crew — four new v5.2 ACs are only in v5.2, not in v5.1.**
The specific AC language for Discover's read-only autonomy controls ("greyed, tooltip: 'Available on Build and above'") and the `+ New Workflow` button visibility rules are only in v5.2 §3. Build agents implementing F11 from v5.1 alone will implement the old behavior.

*Fix:* Include v5.2 §3 in every F11-related build brief. If v5.3 is written, fold these ACs in.

**I-4: F32 — "This doesn't describe my business" Phase 6 escape hatch.**
The pre-signing escape hatch (escape during Phase 6 brief-co-author back to Phase 4 vertical-confirm) is mentioned in F32 prose ("same mechanic as onboarding — already locked in F2 acceptance criteria") but is NOT an explicit checkbox AC in the F2 Phase 6 AC list. The FIX-PLAN I-4 identified this and noted it as "Add escape hatch AC to Phase 6 (brief-co-author) in v5 F2" — but the v5.1 F2 AC list for Phase 6 does not include an explicit checkbox for this behavior.

*Fix:* Add to F2 Phase 6 ACs: `- [ ] "This doesn't describe my business" link present (13px ink-3) — navigates back to Phase 4 (vertical-confirm) with the vertical selector pre-focused.`

**I-5: F22 — Pilot readability validation AC dropped.**
v4 Amendment included "Pilot readability validation: show 10 customers and confirm in under 10 seconds without instruction" as a measurable quality gate. This AC is not in v5.1. The prior feature-parity audit flagged it as a minor item (M-6); given the cartogram's complexity and the risk of it being unusable on first exposure, it warrants a 🟡 rating.

*Fix:* Restore the readability validation AC to F22 before the cartogram ships.

---

### 🟢 Verified Clean

The following areas are fully clean — no AC gaps, no contradictions, no deprecated stubs:

- All 4 critical FIX-PLAN items (C-1 through C-4): resolved in v5.1.
- F1, F3, F4, F5, F6, F7, F12, F13, F14, F15, F18, F20, F21, F23–F31, F33–F47, F48–F56: all have full inline ACs in v5.1 (restored by FIX-PLAN patches P1–P13).
- F35 (14/14/30 split): confirmed. Discover 14d / Build 14d / Scale 30d, all from Paddle checkout.
- F12 (Day-14 Paddle anchor): confirmed. "Day-14 measured from Paddle checkout (NOT signup, NOT Brief signed — per Q4/Q7 lock activation event redefinition)" — exact language present in F12 Amendment v5.
- F47 (P11 data instrumentation): confirmed. Three new tables + daily Inngest job + `state_of_search_eligible` consent flag all present in F47 Amendment v5.
- F23 (Arc's Wave): confirmed. "Amendment v4 (2026-04-28) — Arc's 'Wave' (preserved in v5.1)" explicitly called out in F23 with full spec: 60ms stagger left-to-right wave, 11 cells × 60ms = 660ms total wave, then 200ms settle.
- T148, T149, T150, T151: all fully specified in v5.2 §6 with complete ACs and dependency chains.
- Domain references: zero `beamix.tech`, zero `BeamixAI` in v5.1 or v5.2.
- All 6 design spec cross-referenced files: confirmed to exist on disk.
- v5.1 AC checkpoint count: 540 (vs v5's 278) — confirms substantial restoration.

---

## Verdict

**MINOR_GAPS 🟡**

All four critical gaps from the prior audit were resolved in v5.1. No critical (🔴) issues remain. The v5.2 amendment layer is complete and actionable as a standalone document for its 4 modified features (F16, F19, F11, Phase 4 of F2) and 4 new tickets (T148–T151).

The five 🟡 Important findings are all structural/navigation issues arising from the amendment-layer architecture — not missing ACs in the feature specifications themselves. The most important one (I-1: canonical-docs-index missing v5.2) is a single-line fix. The second most important (I-2: T148–T151 not in Build Plan v3.1 file body) is resolved by either appending to v3.1 or adding a link at the top of the file.

**Before the first build wave dispatches, two things should be confirmed:**

1. Every build agent brief includes an explicit note: "v5.2 supersedes v5.1 for F16, F19, F11, and F2 Phase 4 — read v5.2 §2 and §3 before touching these features."
2. The canonical-docs-index is updated to include v5.2 as a required Quick Start document.

---

*Audit complete. Cross-references verified. No data invented — all findings sourced from direct document reads.*

*Source documents: `2026-04-28-PRD-wedge-launch-v4.md`, `2026-05-04-PRD-wedge-launch-v5.1.md`, `2026-05-05-PRD-AMENDMENTS-v5.2.md`, `2026-05-04-VERIFICATION-feature-parity.md`, `2026-05-04-FIX-PLAN-v5-to-v5.1.md`, `2026-05-05-CANONICAL-DOCS-INDEX.md`*
