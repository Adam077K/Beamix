# Board Meeting Verdict — 2026-05-16

**Convened before:** Wave 0 spawn.
**Charter:** Read the entire build-prep + product-rethink corpus; simulate worker execution; verify customer value, vision fidelity, quality bar, and QA effectiveness; report blockers.
**Board:** 7 members, parallel review, independent verdicts.

---

## Headline

**The structure is sound. The craft is not yet locked.** All 7 board members converged on a single pattern: **the technical plan ships; the experience that justifies the price does not — unless we patch the design-lead, QA-craft, and Hebrew gaps BEFORE Wave 0 spawns.**

Without the patches below, the MVP will ship: secure, fast, correct, functional — and visually indistinguishable from every other AI-search-visibility SaaS. With the patches, it ships at the Stripe/Linear/Mercury bar Adam keeps locked in memory.

**Recommendation: SPAWN WAVE 0 AS-IS. APPLY P0 PATCHES BEFORE WAVE 1 SPAWNS.** Wave 0 and 0.5 are infrastructure (DB, agent system, app shell, shared types). They are spawnable today. The patches below land between Wave 0.5 ship and Wave 1 spawn — that gate is the right insertion point because Wave 1 is the wave with all 6 frontend/UI workers + the 11 agent prompts.

---

## Verdicts at a glance

| # | Member | Lens | Verdict |
|---|--------|------|---------|
| 1 | Agent Execution Simulator | Will workers ship spec? | **SHIP WITH PATCHES** — Wave 0/0.5 spawnable; W1/W2 need 5 patches |
| 2 | Customer Value Auditor | Does it serve real SMB outcomes? | **VALUE COMPROMISED** — off-site over-promise, Hebrew asymmetry, refund-cap timing |
| 3 | Product-Rethink Fidelity | Does April-25 vision survive? | **PARTIALLY FAITHFUL** — April-09→18 yes, April-25 aesthetic almost zero |
| 4 | Quality Bar Enforcer | Linear/Stripe-grade? | **60-70%** — empty states + spring/skeleton/typography unspec'd; Full-tier QA has no craft criteria |
| 5 | Customer Outcome Simulation | Will Day-30 customer renew? | **50/50** — Hebrew Discover users lose; Build wins; Discover Days 2-6 are silent |
| 6 | Design Fidelity | Will it look like Adam's approved designs? | **DESIGN LOST IN TRANSLATION — ~40-50%** — HOME-DESIGN-SPEC + animation strategy stranded |
| 7 | QA Process Enforcer | Will the gate catch what matters? | **60% caught — misses what matters** — no craft reviewer, no customer-outcome charter |

**Three of seven verdicts use the same phrase: "will pass technical correctness, will ship Shadcn-template UI."** That convergence is the signal.

---

## P0 patches (must apply before Wave 1 spawn)

### P0-A — Add `craft-reviewer` to Full-tier QA + verdict schema for craft
**Origin:** Members 4 + 7
**What:** New Sonnet reviewer in `qa-lead` with explicit BLOCK criteria (Tailwind default tracking on >24px text, Shadcn default focus ring, Framer Motion default spring, pulse-skeleton, placeholder SVG empty state, "Loading..." copy, etc.). Verdict frontmatter gains `craft_score` (1-5), `craft_findings: []` (never empty on FE PR), `customer_outcome_check`.
**Owner:** Patch into `09-WAVE-1-BRIEF.md` QA section + `qa-lead` agent definition.
**Cost:** ~30 min to draft charter; runs on every FE PR.

### P0-B — Upgrade Wave 1 design-lead prep from 2-hour markdown → half-day deliverable with Adam-approval gate
**Origin:** Members 4 + 6
**What:** Design-lead's required reading expands from 4 files to the full April-25 pack: `08-agents_work/2026-04-25-BEAMIX-VISION.md`, `2026-04-25-HOME-DESIGN-SPEC.md` (1271 lines), `PER-PAGE-ANIMATION-STRATEGY.md` (488 lines), `REFERENCES-MASTERLIST.md` (767 lines), `DESIGN-DIRECTION-v1/v2`. Deliverables: typography scale, spring-preset-to-component map, skeleton designs, hover/focus library, 9 empty-state illustrations (Day-1 home is #1 priority), Tier 1/2/3 animation budget per page, per-FE-worker reference anchors. **Adam approves the design-lead output before any FE worker spawns.**
**Owner:** Patch into `09-WAVE-1-BRIEF.md` §design-lead prep + add new gate "G-design-lead-approval" before "all 6 FE workers may spawn."
**Cost:** Delays Wave 1 FE spawn by ~half-day. Saves Wave 2 polish reconciliation that would have cost 2-3 days.

### P0-C — Bridge April-25 vision into wave briefs
**Origin:** Members 3 + 6
**What:** Add a "Vision References" appendix to each Wave 1 FE brief naming 1-2 specific anchors per page (Home→Linear+Anthropic typography; Scan wound-reveal→Stripe payment reveal; Inbox→Things3 empty state; etc.). Add "GEO research stats surface here" callouts (76% freshness, 46.7% Reddit, 16.3% Wikipedia) to evidence-panel briefs. Reference Rough.js / Excalifont / hand-drawn aesthetic decisions in FE briefs that touch illustration.
**Owner:** Patch into `09-WAVE-1-BRIEF.md` FE-1, FE-2, FE-3 sections.
**Cost:** ~1 hour writing.

### P0-D — Split user-initiated vs auto-initiated runs in refund-cap math
**Origin:** Member 2
**What:** ADQ-5 50%-consumption cap currently counts the 6-step Day-1 auto-run chain against the customer. Yossi gets Day-1 auto-run (consumes 5-6 runs), gets Hebrew junk drafts, refunds in week 1 — and is now penalized for usage Beamix initiated. Fix: `credits_consumed_for_refund_math` = `total_consumed - auto_initiated_consumed`. Document in `18-LEGAL-PUBLISHING-PLAN.md` refund clause and BE-2 worker brief.
**Owner:** Patch `18-LEGAL-PUBLISHING-PLAN.md` + `09-WAVE-1-BRIEF.md` BE-2.
**Cost:** 30 min.

### P0-E — Ship Hebrew product-AND-business surface at MVP launch, not just product
**Origin:** Members 2 + 5
**What:** Auto-run on Day 1 fires before Wave 2 Hebrew prompts ship today. Move Hebrew prompt variants from Wave 2 Worker 1B → Wave 1 BE-1 (agent prompts ship with HE+EN at launch). Add Hebrew Resend template variants (welcome, digest, refund-processed). Add Hebrew refund-policy excerpt + HE-fluent support SLA promise to `19-SUPPORT-CHANNEL-SPEC.md`. T&Cs can stay EN; refund policy + receipt + emails must ship HE.
**Owner:** Patch `09-WAVE-1-BRIEF.md` BE-1 + BE-3 + `19-SUPPORT-CHANNEL-SPEC.md` + `18-LEGAL-PUBLISHING-PLAN.md`.
**Cost:** ~1 day of LLM-driven Hebrew authoring + review. Saves estimated 50-60% Hebrew Discover refund rate.

### P0-F — Pre-stub layout collision points + spec-gate script
**Origin:** Member 1
**What:** Wave 0 Worker 3 ships `(protected)/layout.tsx` with all three Wave 1 slot imports as commented-out scaffolding (NotificationBell, PreviewBanner, KillSwitchBanner). Each Wave 1 FE worker un-comments their own line — no merge conflicts. Add `scripts/spec-gate.sh` (50 lines, bash + grep) to catch stub-ship class of failures: prompts missing `<USER_DATA>` wrap, `z.any()` on hard endpoints, `Loading...` strings.
**Owner:** Patch `07-WAVE-0-BRIEF.md` Worker 3 + new file `scripts/spec-gate.sh`.
**Cost:** 1 hour.

---

## P1 patches (apply before Wave 1 ship, can spawn first)

### P1-G — Discover Day-1 "burst" + per-CMS deployment helper
**Origin:** Members 2 + 5
**What:** Discover gets 3-5 extra credits on Day 1 only (a "first-week burst" to attack the 11 wound-reveal items visibly). Per-CMS deployment helper on every draft: detect Shopify/WordPress/Wix/Webflow from `scanUrl`, show paste instructions, add "Email to my developer" CTA. ~8 hours of work, turns silent Approve→Publish gap into a 30-second customer action.
**Owner:** Wave 1 FE-3 (Inbox) + BE-2 (credit allocation).
**Cost:** ~1 day total.

### P1-H — Move 1 golden-case eval per agent into Wave 1 QA gate
**Origin:** Member 1
**What:** Adam currently reviews 55 golden cases at end of Wave 2 — will skim. Move 11 cases (1 per agent) into Wave 1 QA gate, rubric-graded 5/5 publish-ready. Catches the "LLM outputs plausible junk that looks fine on first read" failure mode that would otherwise surface only at Wave 2 eval.
**Owner:** Patch `09-WAVE-1-BRIEF.md` QA section.
**Cost:** 30 min to draft rubric.

### P1-I — Day-7 Perplexity micro-rescan + citation-watch alerts
**Origin:** Members 2 + 5
**What:** Bridge the activation-vs-refund-window gap. Day 7 fires a single Perplexity rescan on top-3 user queries. If any improvement, push a celebration-state notification. If any new citation appears on the customer's URL (Reddit, Quora, directory), push a "you've been cited" alert. Customer sees movement inside the 14-day refund window.
**Owner:** Wave 1 BE-1 (Inngest schedule).
**Cost:** ~2 hours.

### P1-J — Drop Reddit Presence Planner from MVP-1, ship at MVP+30
**Origin:** Member 2
**What:** Reddit Presence Planner output is *posting calendar + comment templates* — pure homework, lowest "we did the work" credibility, longest customer execution time. Ship MVP-1 with 10 agents not 11; reintroduce at MVP+30 with at least a draft-comment-in-Reddit-format-with-mod-rules-checked feature.
**Owner:** Patch `07-AGENT-ROSTER-V2.md` + Wave 1 BE-1 + `12-AGENT-BUILD-SPEC.md`.
**Cost:** Saves Wave 1 agent prompt time (~half day).

---

## P2 (advisory — not blocking)

- **Re-frame "Beamix does the work" copy → "Beamix runs the playbook, you click publish."** Marketing positioning fix, not product fix. Apply to landing, Day-1 chain UI strings, refund email.
- **Add GMB API write as MVP+30 stretch.** One real off-site automation lifts the "agency replacement" promise.
- **Adam-facing PR review checklist printed + taped to monitor** (Member 7's 10-point list).
- **Cut Scale tier to ONE single-business workspace OR add multi-tenant.** Currently $499 has no agency model — agency owners bounce <1 day.

---

## Wave gate redefinition

Current: G0 (Wave 0 ready) → G0.5 (types frozen) → G1 (Wave 1 spawn) → G2 (Wave 2 spawn) → Launch.

**Proposed:** insert **G-design-lead-approval** between G0.5 and G1. Adam reviews the `_patterns.md` + illustration set + spring-table + skeleton designs from design-lead before any FE worker spawns. This is the single highest-leverage gate insertion. Without it, 6 FE workers ship divergent UIs that Wave 2 cannot reconcile.

```
G0 → G0.5 → G-design-lead-approval (NEW) → G1 → G2 → Launch
```

---

## What we are NOT changing

- **Hard-reset decision.** Stands.
- **11-agent roster.** Stands (with possible 10-agent MVP-1 if P1-J is accepted).
- **Pricing.** Stands. Discover thinness fixed via Day-1 burst, not price change.
- **14-day money-back + ADQ-5 50% cap.** Stands (math fixed in P0-D).
- **Anthropic-direct LLM routing, annual pricing day-1, all 24 P0 + 42 P1 patches.** All stand.
- **Wave 0 + 0.5 briefs.** No changes — spawnable today.

---

## Next action (Adam)

Pick one:

1. **APPLY ALL P0 + ACCEPT P1 LIST** — board's recommended path. CEO patches the 6 P0s (~3-4 hours of doc edits + one new bash script) before Wave 0 spawns OR between G0.5 and G1. Then spawns Wave 0 immediately.
2. **APPLY P0 ONLY, DEFER P1 TO MID-WAVE** — faster start, accept Hebrew refund risk + thin Discover until Wave 1 ships.
3. **SPAWN WAVE 0 AS-IS, PATCH IN PARALLEL** — Wave 0 is DB + agent system + app shell. None of its workers touch the patched areas. Patches land while Wave 0 runs, before Wave 1 spawn. Recommended if Adam wants visible build progress today.
4. **OVERRIDE ANY SPECIFIC PATCH** — name which P0/P1 to drop or modify.

**Board's recommendation: option 3.** Spawn Wave 0 today, apply P0 patches in the Wave 0 window, gate Wave 1 spawn on `G-design-lead-approval`.

---

## Per-member files

1. `01-agent-execution-simulator.md` — 30,751 bytes
2. `02-customer-value-auditor.md` — 18,220 bytes
3. `03-product-rethink-fidelity.md` — 6,560 bytes
4. `04-quality-bar-enforcer.md` — 11,914 bytes
5. `05-outcome-simulator-founder.md` — 17,302 bytes
6. `06-design-fidelity.md` — 8,413 bytes
7. `07-qa-process-enforcer.md` — 10,216 bytes

Total: 7 independent perspectives, 103KB of board-room reasoning, converging on the same 6 P0 patches.
