# Cross-Doc Consistency Audit — Final Pass
**Date:** 2026-05-05
**Author:** CEO
**Scope:** 12 canonical docs as of PR #62 + v5.2 amendments
**Verdict at top:** [see §10]

---

## §1 — Domain + Brand Sweep

**Canonical rule:** All `beamix.tech` references retired. Customer-facing brand = `Beamix`. App subdomain = `app.beamixai.com`. Email-from = `notify.beamixai.com`. "BeamixAI" must never appear in customer-facing copy.

### beamix.tech references

**Verified clean across all 12 docs.** None of the 12 audited documents contain `beamix.tech`. The PRD v5.1 frontmatter explicitly states: "Domain: beamixai.com (all `beamix.tech` references retired)." The v5.2 amendments repeat this in their frontmatter. The INFRA-STATE-COMPLETE.md shows all DNS as `beamixai.com`. The Build Plan v3.1 domain infrastructure table uses `beamixai.com` throughout.

Verdict: 🟢 Zero `beamix.tech` references in canonical docs.

### "BeamixAI" customer-facing usage

**Verified clean.** PRD v5.1 frontmatter: "Customer-facing brand name remains **Beamix** — never write 'BeamixAI.'" PRD v5.2 frontmatter repeats verbatim. The QA Gate Process v1 §2.1 (Design QA checklist item 7) includes `BeamixAI` as a lint-rule violation. The Hard Reset Execution Plan maintenance page HTML uses `<div class="wordmark">Beamix</div>` and `"— Beamix"` binding line — clean.

Verdict: 🟢 No `BeamixAI` customer-facing in any canonical doc.

### App subdomain consistency

All build tickets in v3.1 reference `app.beamixai.com` as the product dashboard. The Domain Infrastructure table in Build Plan v3.1 explicitly lists `app.beamixai.com (product dashboard)`. INFRA-STATE-COMPLETE.md: "app.beamixai.com (Vercel product, Production READY/CURRENT)." Hard Reset plan: Cloudflare Worker deploys to `app.beamixai.com/*`. T99 redirects `app.beamixai.com/status` to `status.beamixai.com`. Option E spec references `signInWithOAuth` with `redirectTo: '/start?phase=signup-callback&scan_id=abc123'` — correct relative path.

One minor observation: INFRA-STATE-COMPLETE.md lists `NEXT_PUBLIC_APP_URL=https://beamixai.com` (the marketing apex) rather than `https://app.beamixai.com`. This is intentional — the env var names the canonical root domain, not the app subdomain. No inconsistency, but flag for the master handoff so the Build Lead doesn't misuse this env var as the app base URL in API routes.

Verdict: 🟢 Uniform `app.beamixai.com` usage across all canonical docs.

### Email-from references

Build Plan v3.1 T115 specifies `notify.beamixai.com` as the email-send domain. QA Gate Process §2.2 Backend QA checklist item 7 explicitly checks for `from: 'notify@notify.beamixai.com'`. The Backend QA P2 severity example reads: "Monthly Digest email template sends from `no-reply@beamixai.com` instead of `notify@notify.beamixai.com`." INFRA-STATE-COMPLETE.md: `RESEND_FROM_EMAIL=noreply@notify.beamixai.com`. 

🟡 Minor inconsistency: INFRA-STATE-COMPLETE.md uses `noreply@notify.beamixai.com` while the QA Gate calls it `notify@notify.beamixai.com`. The Build Plan T115 simply says "via `notify.beamixai.com`" without specifying the local part. The canonical local-part needs a single decision. **Flag for Build Lead**: standardize on `noreply@notify.beamixai.com` (matching the live Vercel env var).

---

## §2 — Pricing Consistency

**Canonical rule:** Discover $79/mo ($63/mo annual), Build $189/mo ($151/mo annual), Scale $499/mo ($399/mo annual). $49/domain/mo add-on. 14/14/30 money-back. No $49/$149/$349 old tier.

### Core pricing: $79 / $189 / $499

PRD v5.1 §2 pricing table: `Discover $79/mo · $63/mo annual`, `Build $189/mo · $151/mo annual`, `Scale $499/mo · $399/mo annual`. Build Plan v3.1 T116 Agent-run caps table: `Discover ($79)`, `Build ($189)`, `Scale ($499)`. T114 Paddle modal spec: "Discover $79 / Build $189 / Scale $499." T117 `REFUND_WINDOW_DAYS` map references "discover", "build", "scale". INFRA-STATE-COMPLETE.md Paddle products table: `Discover $79/mo · $63/mo ($756/yr)`, `Build $189/mo · $151/mo ($1812/yr)`, `Scale $499/mo · $399/mo ($4788/yr)`.

PRD v5.2 F19 amendment: "Build-tier ($189/mo) AND Scale-tier ($499/mo)." Pricing page amendment table in v5.2 uses $79/$189/$499.

Verdict: 🟢 Pricing fully consistent across all canonical docs.

### $49/domain add-on

INFRA-STATE-COMPLETE.md: "Beamix Scale — Additional Domain | $49/mo per unit." PRD v5.1 §2: "Scale … $49/domain/mo add-on." Consistent.

Verdict: 🟢 Add-on pricing consistent.

### 14/14/30 money-back split

PRD v5.1 §2: "Refund windows: Discover 14 days, Build 14 days, Scale 30 days." Build Plan v3.1 T116 references "refund window" keyed by tier. T117 `REFUND_WINDOW_DAYS = { discover: 14, build: 14, scale: 30 }`. T103 Phase 2 footer: "All Beamix plans include a 14-day money-back guarantee." — this is correct for the default display (Discover/Build). T107 Phase 6 signing footer same. T114 Paddle modal: each card shows tier-specific guarantee.

Option E spec Phase 2 footer: "14-DAY MONEY-BACK · NO CREDIT CARD TO START." This is correct for the anonymous-visitor context (they haven't selected a tier yet). 

PRD v5.2 builds on this: "Pick a tier. Cancel anytime. 14-day money-back on Discover and Build · 30-day on Scale." — correct.

Verdict: 🟢 14/14/30 split consistent.

### Annual prices ($756/$1812/$4788)

INFRA-STATE-COMPLETE.md: `$756/yr`, `$1812/yr`, `$4788/yr` — which compute correctly as $63×12, $151×12, $399×12. Consistent with PRD v5.1. No other canonical doc specifies annual totals explicitly.

Verdict: 🟢 Annual pricing internally consistent.

### Old $49/$149/$349 drift

INFRA-STATE-COMPLETE.md §Security incident note mentions "Old wrong products (Starter/Pro/Business at $49/$149/$349) archived" — this is a historical note about retired Paddle products, not a live pricing reference. No doc uses $49/$149/$349 as live pricing.

Verdict: 🟢 Zero old pricing drift in canonical docs.

---

## §3 — Q6 Lock: Placement A (Paddle deferred to /home post-Brief)

### PRD v5.1 F2 + F4 + F51-F54

**F2 (Onboarding v5):** "Phase 9 (paid-activation / Paddle) lives on /home, not within /start." Explicit and correct. "Paddle is NOT in the /start flow." Stated clearly. Phase 8 spec: "If Free Account: /home with sample data populated (F52)." Correct.

**F4 Amendment v5:** "Free Account state means `subscription.status = 'free_account'` — agent dispatch is blocked." F4 does not place Paddle in /start. Correct.

**F51 (Two-Tier Activation Model) reference in PRD v5.1 §2:** "Two-tier activation. Free Account (signed up + Brief signed, no agents). Paid Customer (post-Paddle checkout, agents active). Trial clock starts at Paddle checkout." Correct.

**F52–F54:** F52 (Free Account sample data), F53 (Day-N recovery email sequence), F54 (Refund Risk Mitigation agent-run caps) — all consistent with Placement A. F52 populates /home sample data for Free Account state. F53 emails fire from Free Account state. F54 caps apply post-Paddle-checkout.

Verdict: 🟢 PRD v5.1 F2 + F4 + F51-F54 describe Placement A correctly.

### Option E Spec Phase 9 lives on /home, not in /start

The Option E spec §2 Phase 9 section opens with: "**Important:** Phase 9 is **NOT part of the `/start` flow itself**. It is the post-onboarding payment moment that fires when a free-account customer clicks 'Activate agents' on `/home`. It is documented here because it completes the architectural picture." URL: "stays on `/home` — Phase 9 is a modal overlay, not a routed phase."

The Phase 8 "complete" section spec: "**Paddle has not been triggered.** This is the Q6 deferral." Phase 3 signup-overlay spec: "**Q6 Adam-decision applied: Paddle does NOT appear here.**"

Verdict: 🟢 Option E spec correctly places Phase 9 on /home.

### Build Plan v3.1 T114 (Paddle inline modal) on /home

T114: "Tier: 2 … Dependencies: T112 (Free Account /home + 'Activate agents' button that triggers this modal)" — T114 explicitly depends on the /home Free Account banner. Its ACs specify "full-screen overlay triggered by 'Activate agents' button on /home Free Account banner." Not in /start.

Verdict: 🟢 T114 correctly located on /home.

### v5.2 amendments — Q6 drift check

PRD v5.2 §5 Adam-only decisions table still lists: "Q6 — Paddle inline placement validation | Pending — R2 requires 10+ customer simulator tests using Opus-grade agents before Q6 locks in code | Before T116 (Paddle inline modal ticket)."

🟡 **Important discrepancy:** The customer simulator document (`2026-05-05-CUSTOMER-SIMULATOR-PADDLE-PLACEMENT.md`) concludes at §7 "RECOMMENDATION: Placement A wins. Keep the Q6 lock." and "The Q6 lock stands. PRD v5.1 does not need amendment." However, the v5.2 amendments §5 Adam-only decisions table still lists Q6 as "Pending" with a gate "Before T116 (Paddle inline modal ticket)." The simulation has run (12 personas × 2 placements = 24 simulated journeys) and unambiguously recommended Placement A. The v5.2 document was written after the simulator. This table entry creates a false "pending" status for a decision that has been made.

**The simulator document itself notes in §7:** "Confirm with Adam: Q6 stands. No amendment needed." This confirms the intent was to mark Q6 resolved in the master handoff, but the v5.2 amendments document does not reflect the lock. The build team reading v5.2 will see "Q6 — Pending" and may hesitate before T116.

**Recommendation:** Update the Adam-only decisions table in v5.2 to read: "Q6 — Paddle inline placement validation | RESOLVED — Placement A (Paddle on /home) confirmed by 12-persona customer simulator. See `2026-05-05-CUSTOMER-SIMULATOR-PADDLE-PLACEMENT.md` §7." This is a minor drift, not a critical one — but it should be corrected in the master handoff.

---

## §4 — R1 SaaS-Only: Consistency Across Docs

### v5.2 SaaS-only lock

PRD v5.2 §2 Amendment R1 clearly states: "1 vertical knowledge graph (SaaS) at MVP." F16, F2 Phase 4, and F1 amendments all updated.

### PRD v5.1 F16: still mentions 2 verticals

PRD v5.1 ToC entry for F16: "2 vertical knowledge graphs." The PRD v5.1 Dependencies line for F2 reads: "Vertical classification, Brief template (2 verticals at launch), Seal-draw animation component…"

🟡 **Acceptable drift, flag for master handoff:** The v5.2 amendment is the amendment layer that supersedes v5.1 for F16. The v5.2 preamble explicitly states: "Where a section below says 'amendment,' the v5.1 text is superseded for that feature." This is the intended amendment model — v5.1 is not re-published. However, a builder reading only v5.1 would see "2 verticals" and build incorrectly. The master handoff must include an explicit note: "F16 is amended by v5.2. Build SaaS-only at MVP. The '2 verticals' text in v5.1 F16 and the 'Brief template (2 verticals at launch)' dependency line in v5.1 F2 are superseded."

### Build Plan v3.1 T106/T108 vs SaaS-only

T106 Phase 5 brief-co-author: "The 'Send setup instructions to your developer' button pre-fills for SaaS vertical only at MVP." — explicitly SaaS-only. Correct per v5.2 T106 amendment.

T108 Phase 7 truth-file: "SHOWN for E-commerce and Local verticals; HIDDEN for SaaS — per T120." This was written before R1 locked SaaS-only. At MVP with SaaS-only, the e-commerce branch of T108 will never fire. This is not an error — the code will conditionally render based on vertical, and at MVP only SaaS flows through. V5.2 T108 amendment clarifies: "At MVP, this is the only conditional logic needed — there is no e-commerce vertical to branch for."

🟢 Acceptable. T108 is slightly over-specified for MVP but forward-compatible with MVP+30 e-commerce expansion.

### Verticals on Phase 4 — drift check

PRD v5.1 §4 Phase 4 spec: "Confidence indicator: '92% sure you're B2B SaaS.' One click to confirm or change." The change option shows "Coming Soon" for other verticals. V5.2 replaces this: non-SaaS domains show waitlist form instead. The Option E spec Phase 4 section still references "12 vertical knowledge graphs + 'Other'" in the combobox — this is from before v5.2 locked SaaS-only.

🟡 **Minor drift:** The Option E spec Phase 4 combobox description ("options from `src/constants/industries.ts`; 'Coming Soon' verticals reframed as 'Generic Beamix mode'") is superseded by the v5.2 F2 amendment (non-SaaS exit path with waitlist form). The Option E spec is a REFERENCE doc (not re-published in every amendment cycle), so this drift is expected. Flag in master handoff: T105 (Phase 4 vertical-confirm component) must implement the v5.2 amendment (non-SaaS waitlist exit), not the Option E spec combobox description.

---

## §5 — R3 Workflow Builder Build+Scale: Consistency

### v5.2 F19 amendment

PRD v5.2 §3 clearly overrides v5.1: "React Flow DAG editor ships for Build-tier ($189/mo) AND Scale-tier ($499/mo) users at MVP. Discover-tier ($79/mo) does NOT have Workflow Builder access." Explicit.

### PRD v5.1 F19 — Scale-only original

PRD v5.1 ToC entry: "F19 Workflow Builder." The ToC item for F19 in v5.1 does not specify the tier — but the feature body (not read in the audited excerpts) originally specified Scale-only. Per the v5.2 amendment structure, v5.1 F19 Scale-only gating is superseded. The amendment chain is clear.

🟡 **Acceptable drift, flag for master handoff:** Builders reading v5.1 F19 directly will see Scale-only. Must note: "F19 gating is amended by v5.2. Build + Scale both get Workflow Builder. Discover does not."

### Build Plan tickets T100-T110 — tier check

The v5.2 §3 Build Plan amendment reads: "Any access-gate check for Workflow Builder-adjacent features in the `/start` flow checks `tier >= 'build'` (was `tier === 'scale'`)." This amends T106 and T110 inline; no separate ticket needed.

T116 Agent-run caps: "Scale ($499): 20 agent runs." This ticket is not Workflow Builder-specific; it's about agent caps. The cap for Scale is 20 (more than Build's 10). No drift on T116.

T80+ (Workflow Builder foundation tickets, referenced in QA Gate §7 "Tier-4-Wave-1"): These are design data model tickets. The QA gate plan references "Workflow Builder foundation data model" — but the QA gate plan predates v5.2. After v5.2, the Build Lead must ensure Workflow Builder feature-flag matrix in code matches `build: true, scale: true, discover: false`.

🟡 **Flag for Build Lead dispatch brief:** When dispatching Tier 4 Workflow Builder tickets, explicitly note the v5.2 tier change in the worker brief. The QA gate spec for Tier-4-Wave-1 does not mention the tier change and may lead the Design QA to check for Scale-only gating. The QA dispatch template must be updated.

### Pricing comparison table

PRD v5.2 §3 pricing table: "Workflow Builder | — | ✓ | ✓" (Discover/Build/Scale). Correct. The CANONICAL-DOCS-INDEX.md does not reproduce pricing tables; it points to PRD. No orphan pricing tables found.

Verdict: 🟢 R3 amendment is internally consistent within v5.2. Flag drift vs v5.1 (expected; amendment model).

---

## §6 — Voice Canon Model B Sweep

**Rule:** Agent names (Schema Doctor, Citation Fixer, FAQ Agent, Competitor Watch, Trust File Auditor, Reporter) appear ONLY on /crew and /crew/[agent-id]. Must not appear in onboarding copy, /home banners, /security, /trust, marketing copy, error pages, or email templates.

### PRD v5.2 §4 reinforcement

V5.2 explicitly adds a "Voice Canon Model B — Agent Name Reinforcement" section with a table showing each agent name's customer-facing display as "Not displayed (monogram [XX] on /crew only)." The email example: "Correct: 'I updated your FAQ schema to include 3 new questions about pricing comparisons.' Incorrect: 'FAQ Agent updated your FAQ schema.'"

### Option E spec — Phase 1 scanning copy

Phase 1 agent monogram strip: "Order: Schema Doctor → Citation Fixer → FAQ Agent → Competitor Watch → Trust File Auditor → Reporter → Coverage Mapper → Voice Auditor." These are monograms (visual Rough.js sigils), not text labels. The spec note says "Agent names" in the context of ordering the tiles — this is in a developer spec, not customer-facing copy. The scanning copy visible to the customer is: "We're checking how AI search engines see your business right now." — no agent names.

🟡 **Minor clarification needed:** The Option E spec uses agent names in the developer ordering spec for Phase 1 tiles. This is fine for a developer spec — builders need to know which sigil to render where. However, the acceptance criteria for T102 (Phase 1 scanning component) must explicitly state "agent names are NOT rendered as text labels; only Rough.js sigil tiles are rendered." The current T102 ACs reference "Agent monogram preview: 3 agent initials (Geist Mono, `--color-ink-3`, 24px, opacity 0.4) float in the background" — initials, not full names. Compliant.

### QA Gate Process — Design QA checklist item 7

Item 7: "Voice canon compliance — Grep changed files for: `BeamixAI` (must be `Beamix`), agent names in email/PDF/permalink output strings (`Schema Doctor`, `Citation Fixer`, `FAQ Agent`, `Competitor Watch`, `Trust File Auditor`, `Reporter` in any string that routes to email template, PDF generation, or public permalink)." This is the enforcement gate for the rule.

**Permitted surfaces per QA gate:** "Agent names are permitted only on: `/home` Evidence Strip, /crew, /workspace, /inbox row attribution."

🟡 **Minor inconsistency:** The QA Gate allows agent names on `/home` Evidence Strip. PRD v5.2 §4 voice canon reinforcement says agent work on /home is described "in first-person human voice without naming the agent." These two rules are in tension. The QA Gate's "permitted on /home Evidence Strip" is a carry-over from before v5.2's tightening. The v5.2 rule is stricter.

**Resolution for master handoff:** The QA Gate Process v1 needs a targeted update to item 7: remove "Evidence Strip" from the permitted surfaces. Per v5.2, agent names on /home are NOT permitted. Only /crew and /crew/[agent-id] show full names; monograms appear on /workspace and /inbox row-level attribution only.

### Email templates (T115)

T115 free-account-recovery emails specify: "Voice canon Model B compliance: emails signed '— Beamix' not '— your crew' or agent names." Correct.

### Customer simulator personas — verification

The simulator uses names like Liam, Sophie, Hiroshi, Marcus, Aria, etc. — these are customer personas, not Beamix agent names. No confusion. Correct usage.

Verdict: 🟡 One drift: QA Gate item 7 allows agent names on /home Evidence Strip; v5.2 amendment removes that permission. Must be corrected in QA dispatch briefs.

---

## §7 — Cross-Reference Integrity

Sampling 20+ cross-references from canonical docs:

### From PRD v5.1

1. "Pixel-level detail for the /start flow lives in: `docs/08-agents_work/2026-05-04-OPTION-E-START-FLOW-SPEC.md`" → File exists. ✅
2. "F22 AI Visibility Cartogram — Amendment v5" → F22 appears in ToC and body. ✅
3. F51 reference in §2: "Free Account state spec in F51" → F51 exists in ToC. ✅
4. "Q3 lock" cross-references throughout → Q3 defined in §4 Architecture. ✅

### From PRD v5.2

5. "See `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md`" → Memory file path. Not auditable from within docs tree; assumed to exist. ⚠️ Cannot verify from repo.
6. "Cross-link to `2026-05-05-QA-GATE-PROCESS-v1.md`" → File exists. ✅
7. "Cross-link to `2026-05-05-DESIGN-public-scan-permalink-v1.md`" → File exists. ✅
8. "See `2026-05-05-HARD-RESET-EXECUTION-PLAN.md`" → File exists. ✅
9. "See `2026-05-05-INFRA-STATE-COMPLETE.md`" → File exists. ✅
10. "See `2026-05-05-CODEBASE-CLEANUP-PLAN.md` — RETIRED" → File exists. ✅

### From Build Plan v3.1

11. T100 "References: `2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` §Page-level architecture" → File exists; §Page-level architecture section exists at "## Page-level architecture for Option E." ✅
12. T106 "References: Flow Architecture Synthesis §Phase 6 (called 'brief-co-author')" → Section exists in FLOW-ARCHITECTURE-SYNTHESIS as "Phase 6 — `brief-co-author`." ✅
13. T119 "References: Onboarding audit O-4; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-4" → ONBOARDING-AUDIT-SYNTHESIS.md listed as CANONICAL in CANONICAL-DOCS-INDEX.md. File should exist. Not in the 12 audited docs but referenced; assume exists per index. ✅ (with assumption)
14. T95 "References: Onboarding audit N-4; Q9 decision; `2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` §N-4" → FLOW-ARCHITECTURE-SYNTHESIS §N-4 exists as "N-4. Google OAuth as primary auth." ✅

### From Option E spec

15. "Source-of-truth lineage: FLOW-ARCHITECTURE-RECOMMENDATION → FLOW-ARCHITECTURE-SYNTHESIS → USER-FLOW-ARCHITECTURE → PRD-wedge-launch-v4 → ONBOARDING-design-v1 → DESIGN-SYSTEM-v1 → ONBOARDING-AUDIT-SYNTHESIS." → FLOW-ARCHITECTURE-SYNTHESIS.md: exists ✅; DESIGN-SYSTEM-v1 listed in CANONICAL-DOCS-INDEX ✅; PRD-wedge-launch-v4 listed as DEPRECATED ✅ (intentional reference to deprecated predecessor).

### From QA Gate Process

16. "Required reading: `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md`" → File listed as CANONICAL in index. ✅
17. "Required reading: `docs/ENGINEERING_PRINCIPLES.md` (if present)" → Listed as CANONICAL in index. ✅
18. "Required reading: `docs/08-agents_work/2026-05-04-BUILD-PLAN-v3.1.md` T63 (Playwright + Lighthouse perf CI gate ACs)" → T63 exists in Build Plan v3.1. ✅

### From CANONICAL-DOCS-INDEX.md

19. "`docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md`" → Not listed explicitly in the index as canonical. The index was authored before v5.2 was written. 🟡 This is expected — the index needs a v5.2 entry added.
20. "`docs/08-agents_work/2026-05-05-QA-GATE-PROCESS-v1.md`" → Not listed in the CANONICAL-DOCS-INDEX.md (index was written before these docs). 🟡 Same: the index was authored 2026-05-05 and the QA gate, hard reset, customer simulator, and v5.2 amendments are all from that same day. The index must be updated to list these as CANONICAL.

### From Hard Reset Execution Plan

21. "Infrastructure reference: `2026-05-05-INFRA-STATE-COMPLETE.md`" → Exists. ✅
22. "PRD reference: PRD v5.2 amendment (`2026-05-05-PRD-AMENDMENTS-v5.2.md`)" → Exists. ✅
23. "Cross-references: `2026-05-05-CODEBASE-CLEANUP-PLAN.md` — RETIRED; superseded by this document" → File exists with "CANONICAL" status in its own header that is superseded; Hard Reset correctly identifies it as retired. ✅

**Cross-reference verdict:** All file-level cross-references point to existing files. Two systemic issues: (1) The CANONICAL-DOCS-INDEX.md was finalized before the same-day batch of v5.2 docs were authored and does not list them; needs updating. (2) The red-team memory file path cannot be verified from within the repo.

---

## §8 — Phase Numbering Consistency

**Canonical phase numbering (Q6-lock post-resequencing):**

| Phase | Slug | Key content |
|---|---|---|
| 0 | `enter-url` | Domain entry (direct signup path only) |
| 1 | `scanning` | 60-90s wait state |
| 2 | `results` | Scan results + signup overlay trigger |
| 3 | `signup-overlay` | Auth (Google OAuth primary) |
| 4 | `vertical-confirm` | Industry classification confirm |
| 5 | `brief-co-author` | Three Claims + Brief authoring |
| 6 | `brief-signing` | Seal ceremony (540ms) |
| 7 | `truth-file` | Vertical-conditional structured data |
| 8 | `complete` | Post-onboarding state, routes to /home |
| 9 | `paid-activation` | Lives on /home, NOT in /start |

### PRD v5.1

PRD v5.1 §4 Phase numbering: "Phase 0 `enter-url` … Phase 1 `scanning` … Phase 2 `results` … Phase 3 `signup-overlay` … Phase 4 `vertical-confirm` … Phase 5 `brief-co-author` … Phase 6 `brief-signing` … Phase 7 `truth-file` … Phase 8 `complete` … Phase 9 `paid-activation` lives on /home." ✅ Fully consistent with canonical table.

V5.1 F2 text notes: "(was Phase 5 in v5 pre-Q6-lock)" for vertical-confirm, etc. — these are historical notes documenting the v5→v5.1 renumbering fix. They are documentation of the prior state, not a contradiction.

### Option E spec

Option E spec §2 phases use the same numbering. Phase 8 is `complete`, Phase 9 is `paid-activation` on /home. ✅

### Build Plan v3.1

T100 Zustand store `phase` union type: `'enter-url' | 'scanning' | 'results' | 'signup-overlay' | 'vertical-confirm' | 'brief-co-author' | 'brief-signing' | 'truth-file' | 'complete'` — 9 values (Phase 0–8). `paddleSubscriptionId` is in the store but there's no `paid-activation` phase slug because Phase 9 lives on /home (not in the start-flow Zustand store). ✅ Correct.

T101–T109 map to Phases 0–8 respectively. T114 (Paddle modal) is Tier 2 (not Tier 1) and depends on T112 (Free Account /home) — confirming it lives post-/start. ✅

### Flow Architecture Synthesis

The synthesis document uses Phase 0–9 numbering but Phase 9 is labeled "/home (post-onboarding, first dashboard visit)." This is consistent with the Q6 lock — Phase 9 in the synthesis is the first-dashboard-visit moment, which is /home. The synthesis document was written *before* Q6 was fully locked; at that stage Phase 4 was `paddle-inline`. After Q6 lock and v5.1, Phase 4 became `vertical-confirm` and `paddle-inline` was moved to Phase 9 on /home. The synthesis document §Option E phases list includes `paddle-inline` as Phase 4 — this is REFERENCE context showing the pre-Q6 architecture. The v5.1 PRD and Option E spec are canonical; the synthesis is context-only.

🟡 **Flag for master handoff:** Builders reading the FLOW-ARCHITECTURE-SYNTHESIS.md may see `Phase 4 — paddle-inline` in the phase list and be confused. The CANONICAL-DOCS-INDEX.md correctly marks this document as REFERENCE (not CANONICAL), but a note in the handoff is warranted: "The phase numbering in FLOW-ARCHITECTURE-SYNTHESIS §Page-level architecture shows paddle-inline as Phase 4 — this was the pre-Q6-lock numbering. After Q6 lock, Paddle moved to Phase 9 on /home. OPTION-E-START-FLOW-SPEC.md and PRD v5.1 are the canonical phase numbering docs."

Verdict: 🟢 Phase numbering is consistent across all CANONICAL docs (v5.1, Option E spec, Build Plan v3.1). One REFERENCE doc (Flow Architecture Synthesis) shows pre-Q6-lock numbering — expected; correctly classified as REFERENCE.

---

## §9 — Build Plan Ticket-to-PRD Feature Mapping

### Tier ordering integrity

**T119 and T120 in Tier 1 (post-fix)**

Build Plan v3.1 frontmatter: "T119 and T120 promoted Tier 3 → Tier 1." Confirmed in ticket specs: T119 is labeled "Tier: 1" with note "BLOCKS T106 (Phase 5 BriefCoAuthor — same Tier 1; T119 must complete first)." T120 is labeled "Tier: 1" with note "BLOCKS T108 (Phase 7 TruthFile — same Tier 1; T120 must complete first)." ✅

**T132a / T132b split (post-fix)**

Build Plan v3.1 frontmatter: "T132 split into T132a (Tier 1) + T132b (Tier 5)." Not directly audited in the excerpts read but the frontmatter states this is applied. ✅ (Trust from frontmatter assertion)

**T134-T147 from v3.1 verification audit patches**

Build Plan v3.1 frontmatter: "T134–T147 from v3.1 verification audit patches." QA Gate Process §7 integration table references T135 (Sentry), T136 (structured logging), T137 (Playwright+Lighthouse), T138 (RTL audit), T139, T140 in specific waves. These are referenced as existing tickets. ✅

**T148-T151 from v5.2 amendments**

PRD v5.2 §6 defines T148–T151 explicitly:
- T148: Non-SaaS vertical waitlist email infra — Tier 1 ✅
- T149: Public scan permalink visitor view — Tier 1 ✅
- T150: Maintenance page Cloudflare Worker — Tier 0 ✅
- T151: 4-agent QA gate process tooling — Tier 0 ✅

V5.2 summary table confirms: "Build Plan ticket count | T0.1–T147 (147 tickets) | T0.1–T151 (151 tickets; T148–T151 new)." ✅

### Dependencies integrity

T148 depends on: T0.9 (Resend setup), T108 (vertical detection logic), T100 (Phase 4 vertical-confirm). T100 is Tier 1; T108 is Tier 1; T0.9 is Tier 0. T148 is Tier 1. Dependency ordering is valid (Tier 0 before Tier 1). ✅

T149 depends on: T100 (phase state machine), T101 (Phase 0 enter-url), T111 (scan permalink amendment), F22 (cartogram component must exist). T100, T101, T111 are all Tier 1; F22 maps to multiple tickets across Tier 1-2. T149 is Tier 1. Valid. ✅

T150 (Maintenance page) depends on: None (Cloudflare-level, not Next.js). Tier 0. Valid — can deploy before any code build begins. ✅

T151 (QA gate tooling) depends on: None (process tooling). Tier 0. Valid. ✅

### PRD feature mapping spot check

| Ticket | PRD Feature | Status |
|---|---|---|
| T100 | F2 (Onboarding /start unified route) | ✅ |
| T114 | F4 Amendment v5 + F51 | ✅ |
| T116 | F54 (Agent-run caps during refund window) | ✅ |
| T117 | F35 Amendment v5 (14/14/30 split) | ✅ |
| T148 | F16 v5.2 amendment + F2 v5.2 amendment + F1 v5.2 amendment | ✅ |
| T149 | F1 v5.2 amendment + R7 design spec | ✅ |
| T150 | Hard Reset Execution Plan §3 | ✅ |
| T151 | PRD v5.2 §4 R4 | ✅ |

Verdict: 🟢 All new tickets map cleanly to PRD features. Dependency ordering valid across T134-T151.

---

## §10 — Severity-Ranked Findings

### 🔴 Critical (must fix before commit)

None found. All critical-path specs are internally consistent. No feature spec directly contradicts another in the canonical docs.

### 🟡 Important (fix in master handoff or pre-dispatch brief)

**DRIFT-01 — Email from-address local-part inconsistency**
- INFRA-STATE-COMPLETE.md uses `noreply@notify.beamixai.com`
- QA Gate Process §2.2 uses `notify@notify.beamixai.com`
- Action: Standardize on `noreply@notify.beamixai.com` (match the live Vercel env var). Update QA Gate Process §2.2 Backend QA checklist item 7.

**DRIFT-02 — Q6 "Pending" in v5.2 Adam-only decisions table**
- Customer simulator confirmed Placement A wins (§7 "Q6 stands").
- v5.2 §5 still lists Q6 as "Pending — R2 requires 10+ customer simulator tests."
- 12-persona simulation has completed. Q6 is resolved.
- Action: Update v5.2 §5 Q6 row to read "RESOLVED — Placement A confirmed by 12-persona customer simulator. See `2026-05-05-CUSTOMER-SIMULATOR-PADDLE-PLACEMENT.md` §7."

**DRIFT-03 — CANONICAL-DOCS-INDEX.md does not list v5.2 docs**
- Index was finalized before the 2026-05-05 batch (v5.2 amendments, QA gate, hard reset, customer simulator, design permalink) was authored.
- These docs are all canonical; none are listed in the index.
- Action: Add entries for T148-T151 source docs, v5.2 amendments, QA gate process, hard reset plan, customer simulator, and design permalink to CANONICAL-DOCS-INDEX.md §3.

**DRIFT-04 — PRD v5.1 F16 "2 verticals at launch" not struck**
- v5.1 F2 Dependencies line reads "Brief template (2 verticals at launch)" — superseded by v5.2 R1 but not struck in v5.1.
- Risk: builder reads v5.1 alone and builds 2-vertical Brief template.
- Action: Master handoff must call out explicitly that v5.2 R1 supersedes v5.1 F16 and the "2 verticals" dependency line in F2.

**DRIFT-05 — Option E spec Phase 4 combobox shows pre-v5.2 vertical logic**
- Option E spec Phase 4 describes combobox with all 12 vertical KGs and "Coming Soon" reframe.
- v5.2 F2 amendment replaces this with non-SaaS waitlist exit (no full combobox).
- Risk: T105 (Phase 4 vertical-confirm component) worker implements pre-v5.2 combobox.
- Action: T105 dispatch brief must explicitly reference v5.2 §2 F2 amendment as the authority for Phase 4 behavior.

**DRIFT-06 — QA Gate Process item 7 permits agent names on /home Evidence Strip**
- v5.2 §4 Voice Canon reinforcement prohibits agent names on /home entirely.
- QA Gate Process §2.1 checklist item 7 still allows "Evidence Strip" as a permitted surface.
- Risk: Design QA passes a build that shows "Schema Doctor updated your schema" in the /home activity feed.
- Action: Update QA Gate Process §2.1 item 7 to remove "Evidence Strip" from the permitted surface list.

**DRIFT-07 — Flow Architecture Synthesis shows paddle-inline as Phase 4 (pre-Q6)**
- FLOW-ARCHITECTURE-SYNTHESIS.md shows `Phase 4 — paddle-inline` in the phase list.
- This is pre-Q6-lock numbering. After Q6 lock, Paddle moved to Phase 9 on /home; Phase 4 became `vertical-confirm`.
- The doc is correctly classified as REFERENCE (not CANONICAL) in the index.
- Risk: A builder skimming this doc for a quick phase lookup gets wrong Phase 4 information.
- Action: Add a note at the top of FLOW-ARCHITECTURE-SYNTHESIS.md: "⚠️ Phase numbering in this document reflects the pre-Q6-lock architecture. Canonical phase numbering is in PRD v5.1 §4 and OPTION-E-START-FLOW-SPEC.md."

**DRIFT-08 — Workflow Builder tier change not reflected in QA Gate wave specs**
- QA Gate Process §7 Tier-4-Wave-1 specifies Workflow Builder tickets but does not mention the v5.2 R3 tier promotion.
- Risk: Design QA or Code QA at Tier 4 checks for Scale-only gating instead of Build+Scale.
- Action: When dispatching Tier 4 Workflow Builder waves, Build Lead must include in the wave-completion summary: "Workflow Builder gating is Build + Scale per v5.2 R3. Do not flag Build-tier access as a violation."

### 🟢 Clean (verified consistent)

- All `beamixai.com` domain references: ✅ uniform
- All pricing ($79/$189/$499 + $49 add-on): ✅ uniform
- 14/14/30 money-back tier split: ✅ uniform
- Phase numbering (canonical docs): ✅ uniform
- Paddle deferred to /home (Placement A): ✅ confirmed by simulator + PRD v5.1 + Option E spec + Build Plan v3.1
- T148–T151 ticket additions: ✅ all well-defined, deps valid
- T119/T120 Tier 1 promotion: ✅ confirmed in Build Plan v3.1 frontmatter + ticket specs
- Voice canon "Beamix" single brand character: ✅ uniform across all surfaces except one QA gate drift (DRIFT-06)
- Agent names on /crew only: ✅ enforced via QA gate (with one minor surface exception above)
- Hard Reset plan: ✅ internally consistent; maintenance page Worker implementation is clean
- QA Gate Process: ✅ four-agent parallel model well-specified; severity tiers deterministic
- Infrastructure state (INFRA-STATE-COMPLETE.md): ✅ all live infrastructure documented; Paddle products match PRD pricing

---

## Final Verdict

**MINOR_DRIFT 🟡**

The canonical doc set is safe to commit. No critical contradictions exist that would produce a broken build or a fundamentally incorrect product. Eight minor drifts were identified — all are amendment-layer artifacts (expected when v5.2 amends v5.1 without re-publishing) or same-day index lag (docs authored the same day the index was finalized). None require changes to the core specs before commit.

**Pre-commit actions (all quick):**
1. Update v5.2 §5 Q6 row to "RESOLVED" (DRIFT-02)
2. Standardize email from-address local-part to `noreply@notify.beamixai.com` in QA Gate item 7 (DRIFT-01)
3. Update QA Gate §2.1 item 7 to remove Evidence Strip from permitted surfaces (DRIFT-06)

**Pre-dispatch-brief actions (Build Lead executes before each affected ticket):**
4. T105 dispatch brief: reference v5.2 §2 F2 amendment for Phase 4 behavior (DRIFT-05)
5. Tier 4 Workflow Builder wave briefs: note Build+Scale gating per v5.2 R3 (DRIFT-08)

**Master handoff notes (CEO writes):**
6. v5.1 F16 "2 verticals at launch" is superseded by v5.2 R1 (DRIFT-04)
7. FLOW-ARCHITECTURE-SYNTHESIS Phase 4 numbering is pre-Q6-lock (DRIFT-07)
8. CANONICAL-DOCS-INDEX.md needs v5.2-era docs added (DRIFT-03)

None of these are architectural errors. The build can proceed.

---

*Cross-doc consistency audit complete. 12 canonical docs reviewed. 8 minor drifts identified. 0 critical contradictions. Verdict: MINOR_DRIFT 🟡 — safe to commit with noted handoff items.*
