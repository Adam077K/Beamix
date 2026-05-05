# Beamix — Canonical Docs Index
**Date:** 2026-05-05
**Status:** Navigation authority. Every document in `docs/` is classified here. New contributors: read §2 first.
**Maintained by:** CEO (update whenever a new doc is added or a prior doc is superseded)

---

## §1 — How to use this index

Every link below is one of:
- **CANONICAL** — Active source of truth. Build and design decisions cascade from these. If this file and any other file disagree, this file wins.
- **REFERENCE** — Still valuable background. Not the source of truth for any live decision. Read for context, not for acceptance criteria.
- **DEPRECATED** — Superseded. Kept only for audit trail. Never reference for build decisions. If you find yourself reading one of these to answer a build question, stop — find the canonical successor instead.

---

## §2 — Quick start (the 5 docs every contributor reads first)

These five docs give you the complete build context. Read in order.

| # | File | Why |
|---|------|-----|
| 1 | `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` | The canonical product requirements: 54 features, 4 personas, Option E architecture, all locked decisions. If you read one doc, read this. |
| 2 | `docs/08-agents_work/2026-05-04-BUILD-PLAN-v3.1.md` | The canonical build ticket backlog: 147 tickets across Tiers 0–5, dispatch order, effort estimates, acceptance criteria per ticket. |
| 3 | `docs/08-agents_work/2026-05-04-OPTION-E-START-FLOW-SPEC.md` | Pixel + state-machine spec for the unified `/start` route (9 phases, Zustand store, all 5 entry paths). Frontend implements from this doc. |
| 4 | `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` | Foundation tokens (colors, type, spacing, motion, sigils), voice canon Model B, all 4 visual registers. Referenced by every page-level design spec. |
| 5 | `docs/08-agents_work/2026-05-05-INFRA-STATE-COMPLETE.md` | What is live in production today: domain, DNS, auth, billing, email, Supabase, Vercel. Tier 0 tickets can begin immediately. |

---

## §3 — Active canonical docs (organized by category)

### Strategic / Business

**CANONICAL**

- `docs/08-agents_work/2026-04-26-FRAME-5-v2-FULL-VISION.md` — The locked strategic positioning: B2B SaaS + e-commerce wedge, 8 answered Q-decisions, the full maximum-ambition vision that all product specs execute from.
- `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md` — April 15 board decisions by Adam: pricing v2, agent roster v2, UX architecture, proactive automation model. The rethink approval event.
- `docs/product-rethink-2026-04-09/06-PRICING-V2.md` — Canonical pricing table: Discover $79 / Build $189 / Scale $499 (annual: $63 / $151 / $399). Supersedes all prior pricing in MEMORY.md.
- `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md` — 11 MVP-1 + 1 MVP-2 GEO agents, canonical names, content-output policy (no AI disclosure markers).
- `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md` — Proactive automation model: agents surface suggestions → user approves → /inbox. Supersedes Agent Hub and legacy onboarding.
- `docs/08-agents_work/2026-04-25-DECISIONS-CAPTURED.md` — Adam's April 25 decisions: company-not-tool vision lock, animation locks, page-architecture confirmations. Source for the "category-leading company" framing.
- `docs/BRAND_GUIDELINES.md` — Brand identity v4.0: name, personality, colors, typography, buttons, logo. Read before any design or copy task.

**REFERENCE**

- `docs/01-foundation/VISION.md` — Pre-rethink vision. Context only; Frame 5 v2 supersedes for strategic framing.
- `docs/01-foundation/BUSINESS_MODEL.md` — Business model structure. Background context; pricing decisions in PRICING-V2 and PRD v5.1 are canonical.
- `docs/01-foundation/TARGET_MARKET.md` — Target market definition. Background; Frame 5 v2 wedge (B2B SaaS + e-commerce) is the active scope.
- `docs/02-competitive/GEO-RESEARCH-FULL-REPORT.md` — The full GEO research report that grounded the April rethink. High-value context for any AI search positioning question.
- `docs/02-competitive/POSITIONING.md` — Competitive positioning summary. Context; Frame 5 v2 is the live positioning frame.
- `docs/09-metrics/NORTH_STAR.md` — North star metric definition. Background; update when first metrics baseline is set.
- `docs/09-metrics/UNIT_ECONOMICS.md` — Unit economics model. Background reference.

---

### PRD + Build Plan

**CANONICAL**

- `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` — **THE canonical PRD.** F1–F54, Option E architecture, 4 personas, 13 Adam-locked Q-decisions, all Board Meeting + Design Board locks. Supersedes v1 through v5.
- `docs/08-agents_work/2026-05-04-BUILD-PLAN-v3.1.md` — **THE canonical build backlog.** T1–T147 across Tiers 0–5. v3.1 patches the T119/T120 promotions, T100 effort, and T132 split confirmed in the verification audit. Supersedes v1, v2, v3.
- `docs/08-agents_work/2026-05-04-OPTION-E-START-FLOW-SPEC.md` — Pixel-precise `/start` unified route spec. 9 phases, state machine architecture, Zustand store shape, all 5 entry paths, voice canon enforcement on cream-paper surfaces.
- `docs/08-agents_work/2026-04-27-MARKETPLACE-spec-v1.md` — Marketplace + Agent SDK + Reward System spec. MVP: Beamix-first-party workflows only. MVP-1.5: third-party SDK opens.

**REFERENCE** (inputs that fed into PRD v5.1 and are now consolidated there)

- `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` — CEO synthesis of 3 parallel audits. Birthed Option E and the 13 Adam-locked Q-decisions. Now consolidated into PRD v5.1 + Build Plan v3.1; read this if you want the reasoning behind Option E.
- `docs/08-agents_work/2026-05-04-BUILD-PLAN-v3.md` — Build Plan v3 (pre-patch). Superseded by v3.1; preserved as diff reference for what v3.1 changed.
- `docs/08-agents_work/2026-04-28-PRD-12-unanswered-questions.md` — 12 customer journey questions that added F32–F43 to PRD v4. Now consolidated into v5.1.
- `docs/08-agents_work/2026-04-28-PRD-AMENDMENTS-v4.md` — Amendment doc that folded F32–F47 + design-system canon into v4. Now in v5.1.
- `docs/product-rethink-2026-04-09/11-EXECUTION-PLAN.md` — April 15 execution plan (pre-Frame-5-v2). Context; Build Plan v3.1 is the live dispatch document.
- `docs/product-rethink-2026-04-09/12-AGENT-BUILD-SPEC.md` — Agent build specs from the April rethink. Context; PRD v5.1 F7 is canonical.
- `docs/product-rethink-2026-04-09/10-PRE-BUILD-AUDIT.md` — Pre-build audit that validated the rethink. Historical.

**DEPRECATED**

- `docs/08-agents_work/2026-04-27-PRD-wedge-launch-v1.md` — DEPRECATED. Superseded entirely by v5.1.
- `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v2.md` — DEPRECATED. Superseded entirely by v5.1.
- `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v3.md` — DEPRECATED. Superseded entirely by v5.1.
- `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v4.md` — DEPRECATED. Superseded entirely by v5.1. All F1–F47 acceptance criteria retired in favor of v5.1.
- `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.md` — DEPRECATED. Superseded by v5.1 (the v5.1 patch applied phase-numbering fixes). Do not reference v5 — use v5.1.
- `docs/08-agents_work/2026-04-28-BUILD-PLAN-v1.md` — DEPRECATED. Superseded by Build Plan v3.1.
- `docs/08-agents_work/2026-04-28-BUILD-PLAN-v2.md` — DEPRECATED. Superseded by Build Plan v3.1.

---

### Design Specs

**CANONICAL**

- `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` — **Foundation canon for all surfaces.** Colors, typography, spacing, motion tokens, 4 visual registers (Editorial Artifact, Product Utility, Data Intelligence, Admin Utility), 4 sigils (Ring, Trace, Seal, Margin), voice canon Model B, 18 agent monograms. All page specs reference this.
- `docs/08-agents_work/2026-04-27-HOME-design-v1.md` — `/home` pixel spec: renewal-decision surface, Evidence Strip, Crew at Work, Recent Activity, sparkline placement.
- `docs/08-agents_work/2026-04-27-INBOX-WORKSPACE-design-v1.md` — `/inbox` (consent surface) + `/workspace` (agent-at-work courier flow) pixel spec. Two surfaces designed together for interaction coherence.
- `docs/08-agents_work/2026-04-27-SCANS-COMPETITORS-design-v1.md` — `/scans` and `/competitors` pixel spec. Data Intelligence register, Stripe-table grammar, cartogram placement, engine column layout.
- `docs/08-agents_work/2026-04-27-CREW-design-v1.md` — `/crew` pixel spec: agent directory + Workflow Builder surface for power-user (Yossi/Marcus) orchestration.
- `docs/08-agents_work/2026-04-27-EDITORIAL-surfaces-design-v1.md` — `/scan` public storyboard + Monday Digest email + Monthly Update PDF/permalink. Cream-paper Editorial Artifact register across all three.
- `docs/08-agents_work/2026-04-27-ONBOARDING-design-v1.md` — Onboarding `/onboarding/[1..4]` pixel spec v1. Superseded in specific areas by v1.1 below; read together.
- `docs/08-agents_work/2026-04-28-DESIGN-onboarding-vertical-aware-v1.1.md` — Onboarding vertical-aware amendment: SaaS path leads with UTM, e-commerce leads with Twilio, re-route escape hatch, Brief seal changes to "— Beamix".
- `docs/08-agents_work/2026-04-28-DESIGN-security-page-v1.md` — `/security` public page pixel spec. Editorial Artifact register. Aria-grade trust architecture (6 gaps + resolution paths).
- `docs/08-agents_work/2026-04-28-DESIGN-multi-client-switcher-v1.md` — Multi-client switcher pixel spec. Scale-tier only, Yossi 5x/day interaction model, Admin Utility register.
- `docs/08-agents_work/2026-04-28-DESIGN-workflow-builder-canvas-v1.md` — Workflow Builder Canvas pixel spec. Full DAG editor + dry-run, Scale-only. Supersedes `/crew` §4 sketch.
- `docs/08-agents_work/2026-04-28-DESIGN-onboarding-vertical-aware-v1.1.md` — (listed above under onboarding)
- `docs/08-agents_work/2026-04-28-DESIGN-ai-visibility-cartogram-v1.md` — AI Visibility Cartogram pixel spec (F22): 50 queries × 11 engines = 550 cells. Primary render target: `/scans/[scan_id]`, Monthly Update PDF page 2, public OG card.
- `docs/08-agents_work/2026-04-28-DESIGN-small-multiples-grids-v1.md` — Small-multiples grids pixel spec: 11-engine × 12-week trend grid (Tufte Opp 1) + 5-competitor × 11-engine parity grid (Tufte Opp 2).
- `docs/08-agents_work/2026-04-28-DESIGN-features-F23-F31-specs.md` — Design specs for features F23–F31: Cycle-Close Bell, skeleton states, Cmd-K, status vocabulary, block primitives, and companion features. All reference DESIGN-SYSTEM-v1 tokens.
- `docs/08-agents_work/2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md` — Design Board Round 1 (Rams, Ive, Tufte, Kare) synthesis: 65 surgical spec edits, 5 contested locks resolved, 10 new features F22–F31. Source of Record for Round 1 decisions still in v5.1.
- `docs/08-agents_work/2026-04-28-DESIGN-BOARD-ROUND2-3-SYNTHESIS.md` — Design Board Round 2 (Linear v2, Stripe v2, Vercel) + Round 3 (Arc, Notion) + Aria + State-of-AI-Search synthesis: 20 changes, Cmd-K + slash commands locked for MVP, status vocabulary lock, cream-paper surface partition.
- `docs/08-agents_work/2026-04-25-ANIMATION-STRATEGY-LOCKED.md` — Per-page animation decision table locked by Adam: which surfaces get skeleton-draw on load, which use the courier flow, all motion canon decisions.

**REFERENCE**

- `docs/08-agents_work/2026-04-26-BOARD3-seat-2-designer.md` — Master Designer brief (the "9,183 words" source that DESIGN-SYSTEM-v1 synthesizes). Read this for the reasoning behind design tokens; skip for build work.
- `docs/08-agents_work/2026-04-26-FRAME-5-v2-BUILD-INDEX.md` — Build index written the day Frame 5 v2 was locked. 9 deliverables summary. Useful orientation doc; Build Plan v3.1 is the live dispatch.
- `docs/PRODUCT_DESIGN_SYSTEM.md` — Earlier product design system doc. Superseded by DESIGN-SYSTEM-v1 for all token values; kept for pre-rethink historical context.
- `docs/DASHBOARD_REDESIGN_SPEC.md` — Dashboard redesign spec from April 6. Pre-rethink. Context only; all active surface specs are in `docs/08-agents_work/`.
- `docs/product-rethink-2026-04-09/13-DESIGN-SYSTEM-SPEC.md` — April rethink design system spec. Reference; DESIGN-SYSTEM-v1 is the canonical successor.
- `docs/product-rethink-2026-04-09/14-SCAN-UX-SPEC.md` — April rethink scan UX spec. Reference; EDITORIAL-surfaces-design-v1 and OPTION-E-START-FLOW-SPEC are canonical successors.

---

### Audits + Verification

**CANONICAL** (these audit findings are folded into PRD v5.1 + Build Plan v3.1 — keep as standalone for reasoning)

- `docs/08-agents_work/2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` — CEO synthesis of 4 parallel onboarding audits: 12 action items, Yossi multi-client timing, Dani Hebrew RTL blocker, WCAG 5 fails, mobile rendering breaks. All 12 items now in PRD v5.1 + BP v3.1 tickets.
- `docs/08-agents_work/2026-05-04-ONBOARDING-AUDIT-personas.md` — Persona walkthrough audit: Marcus, Dani, Yossi, Aria step-by-step internal monologue. Read to understand per-persona drop-off points.
- `docs/08-agents_work/2026-05-04-ONBOARDING-AUDIT-failure-modes.md` — 30 onboarding failure modes cataloged with recovery paths. Reference for edge-case handling.
- `docs/08-agents_work/2026-05-04-ONBOARDING-AUDIT-cro-craft-trust.md` — CRO + craft + trust audit: Apple/Linear/Stripe craft bar, friction matrix, Aria-grade trust gaps per step.
- `docs/08-agents_work/2026-05-04-ONBOARDING-AUDIT-form-factors.md` — Mobile (375px) + Hebrew RTL + WCAG 2.1 AA audit. Specific px fixes and Heebo font decision.
- `docs/08-agents_work/2026-05-04-USER-FLOW-ARCHITECTURE.md` — User-flow architect's 12-entry-path analysis + state diagram. Input to FLOW-ARCHITECTURE-SYNTHESIS; kept for the state diagram and path enumeration.
- `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-RECOMMENDATION.md` — CEO/architectural integrator's recommendation (one of 3 parallel inputs). Read for the reasoning behind Option E vs Options A/B/C/D.
- `docs/08-agents_work/2026-05-04-ACQUISITION-FUNNEL-CRITIC.md` — Drop-off analysis vs Profound/Plausible/Stripe Atlas, per-stage estimates. Funnel context for `/start` design decisions.
- `docs/08-agents_work/2026-05-04-VERIFICATION-cross-doc-consistency.md` — Cross-doc consistency audit of v5 docs: phase numbering critical finding (the fix that produced v5.1). Record of what was fixed.
- `docs/08-agents_work/2026-05-04-VERIFICATION-feature-parity.md` — PRD v4 → v5 feature parity audit: confirms no feature or acceptance criterion was lost in the v4→v5 consolidation.
- `docs/08-agents_work/2026-05-04-VERIFICATION-build-plan-integrity.md` — Build Plan v3 integrity audit vs v2 + PRD v5: PASS-WITH-MINOR-FIXES (the fixes became v3.1).
- `docs/08-agents_work/2026-05-04-VERIFICATION-strategic-completeness.md` — Strategic completeness audit: Frame 5 v2 alignment check, Option E coverage, post-v5 gap list.
- `docs/08-agents_work/2026-05-04-FIX-PLAN-v5-to-v5.1.md` — The mechanical patch list that produced PRD v5.1 from v5 and BP v3.1 from v3. Record of every targeted Edit applied.
- `docs/08-agents_work/2026-04-27-AUDIT-CONSOLIDATED.md` — Consolidated design audit from April 27: consistency, feasibility, customer journey (3 parallel lenses + synthesis). Led to the 12 unanswered customer questions.
- `docs/08-agents_work/2026-04-27-AUDIT-1-consistency.md` — Design consistency audit (lens 1 of 3). Detail behind AUDIT-CONSOLIDATED.
- `docs/08-agents_work/2026-04-27-AUDIT-2-feasibility.md` — Design feasibility audit (lens 2 of 3). Detail behind AUDIT-CONSOLIDATED.
- `docs/08-agents_work/2026-04-27-AUDIT-3-customer-journey.md` — Customer journey coherence audit (lens 3 of 3). Source of the 12 unanswered questions → F32–F43.

---

### Research + Strategy

**CANONICAL**

- `docs/08-agents_work/2026-04-28-RESEARCH-state-of-ai-search-undefer.md` — Decision-ready research: MVP vs MVP+90 vs Year-1-Q4 for State of AI Search report. Adam locked MVP+90 (see auto-memory `project_state_of_ai_search_timing.md`).
- `docs/08-agents_work/2026-04-28-BOARD-aria-simulator.md` — Aria (4th canonical persona, CTO buyer) reviews `/security` page v1. 6 procurement gaps identified, all now in PRD v5.1 F42.
- `docs/08-agents_work/2026-04-27-BOARD-MEETING-SYNTHESIS.md` — The canonical record of 23 locked decisions from the April 27 board meeting (9 seats × 3 rounds). All 23 locked by Adam on 2026-04-28. These decisions are embedded in PRD v5.1 and cannot be reopened.
- `docs/08-agents_work/2026-04-28-LEAD-ATTRIBUTION-tech-spec-v1.md` — F12 Lead Attribution tech spec: Twilio, UTM, attribution data model, "Send to Your Developer" handoff design. Implementation-ready.
- `docs/08-agents_work/2026-04-28-BOARD2-rams.md` — Dieter Rams critique. Source detail for DESIGN-BOARD2-CEO-SYNTHESIS decisions.
- `docs/08-agents_work/2026-04-28-BOARD2-ive.md` — Jony Ive critique. Source detail.
- `docs/08-agents_work/2026-04-28-BOARD2-tufte.md` — Edward Tufte critique. Source of cartogram + small-multiples design decisions.
- `docs/08-agents_work/2026-04-28-BOARD2-kare.md` — Susan Kare critique. Source detail for sigil family decisions.
- `docs/08-agents_work/2026-04-28-BOARD2-linear.md` — Linear (Round 1) critique. Source detail.
- `docs/08-agents_work/2026-04-28-BOARD2-linear-v2.md` — Linear v2 (Round 2) critique. Source of Cmd-K + slash command MVP lock, status vocab lock.
- `docs/08-agents_work/2026-04-28-BOARD2-stripe.md` — Stripe (Round 1) critique. Source detail.
- `docs/08-agents_work/2026-04-28-BOARD2-stripe-v2.md` — Stripe v2 (Round 2) critique. Source of voice-through-structured-restraint principle.
- `docs/08-agents_work/2026-04-28-BOARD2-vercel.md` — Vercel critique. Source of Geist + typography precision discipline confirmation.
- `docs/08-agents_work/2026-04-28-BOARD2-arc.md` — Arc (Round 3) critique. Source of branded keyboard behavior decisions.
- `docs/08-agents_work/2026-04-28-BOARD2-notion.md` — Notion (Round 3) critique. Source of slash-command (/) as universal insert entry point.
- `docs/08-agents_work/2026-04-28-PRD-AMENDMENTS-v4.md` — (see PRD section above) Amendment source doc for Round 2/3 features F41–F47.
- `docs/02-competitive/GEO-RESEARCH-FULL-REPORT.md` — Full GEO research that justified the product rethink. Read for market context.

**REFERENCE**

- `docs/08-agents_work/2026-04-26-R1-competitor-tier-audit.md` — Competitor tier audit. Background context; COMPETITIVE_RESEARCH.md is more current.
- `docs/08-agents_work/2026-04-26-R2-agent-team-ux.md` — Agent team UX research. Context for /crew + /workspace design decisions.
- `docs/08-agents_work/2026-04-26-R3-onboarding-firstwin.md` — First-win onboarding research. Context; ONBOARDING-AUDIT-SYNTHESIS is the live spec input.
- `docs/08-agents_work/2026-04-26-R4-geo-positioning.md` — GEO positioning research. Context for Frame 5 v2 vertical wedge decisions.
- `docs/02-competitive/LANDSCAPE.md` — Competitive landscape summary.
- `docs/02-competitive/MOAT.md` — Moat analysis. Background.
- `docs/COMPETITIVE_RESEARCH.md` — Top-level competitive research summary. Background.

---

### Infrastructure + Ops

**CANONICAL**

- `docs/08-agents_work/2026-05-05-INFRA-STATE-COMPLETE.md` — Complete infrastructure state as of 2026-05-05: domain, DNS, auth, billing (Paddle production), email (Resend), Supabase, Vercel. Build team can start Tier 0 immediately.
- `docs/ENGINEERING_PRINCIPLES.md` — Coding standards, conventions, workflow rules. Every engineer follows without exception. Owned by build-lead.
- `docs/BRAND_GUIDELINES.md` — Brand identity v4.0 (listed also under Strategic).
- `docs/03-system-design/ARCHITECTURE.md` — System architecture. Reference; updated by build-lead as decisions finalize.
- `docs/03-system-design/DATABASE_SCHEMA.md` — DB schema. Reference; Supabase MCP (`mcp__supabase__list_tables`) is ground truth for live schema.
- `docs/03-system-design/TECH_STACK.md` — Tech stack decisions. Reference.

**REFERENCE**

- `docs/03-system-design/API_CONTRACTS.md` — API contracts. Background.
- `docs/03-system-design/AI_AGENTS.md` — AI agent architecture (pre-rethink). Context; PRD v5.1 F7 + Build Plan v3.1 Tier 1 are canonical.
- `docs/06-codebase/MAP.md` — Codebase map. Updated by code-reviewer after audits.
- `docs/06-codebase/CONVENTIONS.md` — Code conventions.
- `docs/06-codebase/PATTERNS.md` — Code patterns.
- `docs/06-codebase/TECH_DEBT.md` — Tech debt register.
- `docs/06-codebase/TESTING.md` — Testing conventions.

---

### Handoffs + Session Logs

**Most relevant handoffs (context for understanding current state)**

- `docs/08-agents_work/2026-04-28-HANDOFF-NEXT-SESSION-PRD-V4-BUILD.md` — Handoff from the session that produced PRD v4 + Round 2/3 board + Aria persona. Entry point for understanding that work.
- `docs/08-agents_work/2026-04-28-HANDOFF-NEXT-SESSION-A+C.md` — Handoff from the Round 2/3 session covering Category A (strategic) + Category C (gaps). 9 work items context.
- `docs/08-agents_work/2026-04-27-HANDOFF-COMPREHENSIVE.md` — Master handoff from the Frame-5-v2 lock + 9-spec session (PR #52). Full context from the ~120K word design blitz.
- `docs/08-agents_work/2026-04-27-HANDOFF-NEXT-TEAM.md` — Brief handoff from the same session, pointing to PR #52.

**Most relevant session logs**

- `docs/08-agents_work/sessions/2026-04-28-ceo-board-meeting-locks.md` — Session log: April 28 Adam locks all 23 board decisions.
- `docs/08-agents_work/sessions/2026-04-28-build-plan-v1.md` — Session log: Build Plan v1 creation.
- `docs/08-agents_work/sessions/2026-04-25-ceo-board-meeting.md` — Session log: April 25 board meeting session.
- `docs/08-agents_work/sessions/2026-04-25-ceo-vision-framework.md` — Session log: Frame 5 vision framework session.

---

## §4 — Reference docs (kept but supplementary)

Documents with value but not active source-of-truth for any build decision.

**Product rethink context (docs/product-rethink-2026-04-09/)**
- `01-PRODUCT-STATE.md` — Code audit at the time of the April rethink. Context for what existed at commit `48ff496`.
- `02-GEO-RESEARCH.md` — GEO research that grounded the rethink decision.
- `03-PRODUCT-VISION.md` — Product vision proposal document. Frame 5 v2 is the active vision.
- `04-OPEN-QUESTIONS.md` — Open questions before April 15 board. All answered in `05-BOARD-DECISIONS-2026-04-15.md`.
- `15-EXPERT-AUDIT.md` — Expert audit that reduced Build tier from $199 to $189. Historical record.
- `README.md` — Rethink folder readme.

**Design board input docs (pre-synthesis)**
- `docs/08-agents_work/2026-04-24-BOARD-MEETING-MINUTES.md` — April 24 board meeting minutes. Superseded by April 27 synthesis.
- `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION.md` — First design direction proposal. Superseded by Frame 3 → Frame 5 v2 progression.
- `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION-v2.md` — Design direction v2. Superseded.
- `docs/08-agents_work/2026-04-24-BOARD-01-reductionist.md` through `2026-04-24-BOARD-07-moat-strategist.md` — 7 board seat reports from April 24. Led to Frame 3. Context only.
- `docs/08-agents_work/2026-04-25-PAGE-ARCHITECTURE.md` — Page architecture proposal. Superseded by Page List LOCKED.
- `docs/08-agents_work/2026-04-25-PAGE-LIST-LOCKED.md` — Locked page list (April 25). Now embedded in PRD v5.1.
- `docs/08-agents_work/2026-04-25-BEAMIX-VISION.md` — Vision document (April 25 framework). Superseded by Frame 5 v2 Full Vision.
- `docs/08-agents_work/2026-04-25-REFERENCES-MASTERLIST.md` — Master reference list of design influences. Useful for design inspiration research.
- `docs/08-agents_work/2026-04-25-HOME-PREMIUM-REFS.md` — Home page premium design references. Useful for design inspiration.
- `docs/08-agents_work/2026-04-25-OVERVIEW-DECISION.md` — Overview decision doc. Superseded by Frame 5 v2 locks.
- `docs/08-agents_work/2026-04-26-FRAME-4-PROPOSAL.md` — Frame 4 proposal. Superseded by Frame 5 v2.
- `docs/08-agents_work/2026-04-26-FRAME-5-PROPOSAL.md` — Frame 5 (v1) proposal. Superseded by Frame 5 v2.
- `docs/08-agents_work/2026-04-26-FRAME-3-LOCKED.md` — Frame 3 locked doc. Historical; shows the iteration path.
- `docs/08-agents_work/2026-04-26-PAGES-DESIGN-MOVES.md` — Per-page design moves (pre-Frame 5). Context; surface specs above are canonical.
- `docs/08-agents_work/2026-04-26-DESIGNER-1-distinctive-moves.md` + `2026-04-26-DESIGNER-2-discipline.md` — Two designer briefs that fed into the Master Designer. Context.
- `docs/08-agents_work/2026-04-26-HANDOFF-NEXT-DESIGN-TEAM.md` — Handoff from Frame 5 proposal session.
- `docs/08-agents_work/2026-04-27-BOARD-architect.md` — Architect board seat (DAG runtime, L2 architecture). Reference for Workflow Builder decisions.
- `docs/08-agents_work/2026-04-27-BOARD-brand-distribution.md` — Brand distribution seat report.
- `docs/08-agents_work/2026-04-27-BOARD-customer-voice.md` — Customer voice seat report.
- `docs/08-agents_work/2026-04-27-BOARD-marcus-simulator.md` — Marcus simulator report.
- `docs/08-agents_work/2026-04-27-BOARD-product-lead.md` — Product lead seat report.
- `docs/08-agents_work/2026-04-27-BOARD-trust-safety.md` — Trust & Safety seat report.
- `docs/08-agents_work/2026-04-27-BOARD-yossi-simulator.md` — Yossi simulator report.
- `docs/08-agents_work/2026-04-26-BOARD-frame4-seat-*.md` (4 files) — Frame 4 board seats. Superseded by Frame 5 v2.
- `docs/08-agents_work/2026-04-26-BOARD2-seat-*.md` (4 files) — Frame 5 attack board. Led to Frame 5 v2.
- `docs/08-agents_work/2026-04-26-BOARD3-seat-*.md` (4 files) — Board 3 seats (Architect, Designer, Domain Expert, Worldbuilder). Source material for design specs; DESIGN-SYSTEM-v1 synthesizes them.
- `docs/08-agents_work/2026-04-25-DESIGNER-1-overview-maximalist.md` + `2026-04-25-DESIGNER-2-action-first.md` — Two early designer proposals (maximalist vs action-first). Context.
- `docs/08-agents_work/2026-04-25-PER-PAGE-ANIMATION-STRATEGY.md` — Per-page animation strategy (pre-lock). Superseded by ANIMATION-STRATEGY-LOCKED.
- `docs/08-agents_work/2026-04-25-REFS-01-handdrawn-animation.md` through `2026-04-25-REFS-05-hebrew-rtl.md` — 5 design reference deep-dives. Inspiration files.
- `docs/08-agents_work/2026-04-24-design-research-A.md` + `B.md` — April 24 design research. Early context.
- `docs/08-agents_work/2026-04-24-R2-research-*.md` (3 files) — Round 2 design research (companion character, flow viz, motion PMF). Context.
- `docs/08-agents_work/2026-04-24-product-ui-audit.md` — April 24 UI audit.
- `docs/08-agents_work/2026-04-25-PAGE-ARCH-A-customer-journey.md` + `B-ia-audit.md` — Page architecture audit inputs.
- `docs/05-marketing/` folder (all files) — Marketing GTM, messaging, SEO, content style. Background; Framer marketing site is separate and deferred.
- `docs/07-history/CHANGELOG.md` — Product changelog.
- `docs/07-history/DECISIONS.md` — Historical decisions log (pre-rethink era).
- `docs/07-history/MILESTONES.md` — Milestones history.
- `docs/07-history/PIVOTS.md` — Pivot record.
- `docs/04-features/ROADMAP.md` — Feature roadmap. Background; PRD v5.1 is the live roadmap.
- `docs/04-features/USER_STORIES.md` — User stories. Background.
- `docs/04-features/specs/` folder — Feature specs from pre-rethink era.
- `docs/BACKLOG.md` — Pre-rethink backlog. Background; Build Plan v3.1 is the live backlog.
- `docs/PRD.md` — Top-level PRD summary (pre-rethink). Background; PRD v5.1 is canonical.
- `docs/WAR-ROOM-GUIDE.md` — War room guide from March 2026. Historical.
- `docs/00-brain/` MOC files — Obsidian-style navigation maps (MOC-Product, MOC-Architecture, etc.). Useful for Obsidian vault navigation; this index supersedes them for build-team purposes.

---

## §5 — Deprecated docs (do not reference)

These files are preserved only for audit trail. Do not cite them in build work, tickets, or decisions.

### PRD versions (superseded by v5.1)
- `docs/08-agents_work/2026-04-27-PRD-wedge-launch-v1.md` — DEPRECATED → superseded by PRD v5.1
- `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v2.md` — DEPRECATED → superseded by PRD v5.1
- `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v3.md` — DEPRECATED → superseded by PRD v5.1
- `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v4.md` — DEPRECATED → superseded by PRD v5.1
- `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.md` — DEPRECATED → superseded by PRD v5.1 (phase-numbering patch)
- `docs/PRD.md` — DEPRECATED pre-rethink summary → superseded by PRD v5.1

### Build Plan versions (superseded by v3.1)
- `docs/08-agents_work/2026-04-28-BUILD-PLAN-v1.md` — DEPRECATED → superseded by Build Plan v3.1
- `docs/08-agents_work/2026-04-28-BUILD-PLAN-v2.md` — DEPRECATED → superseded by Build Plan v3.1
- `docs/08-agents_work/2026-05-04-BUILD-PLAN-v3.md` — DEPRECATED → superseded by Build Plan v3.1 (the v3.1 patch is the canonical version)

### Old vision + strategic docs (pre-Frame-5-v2)
- `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION.md` — DEPRECATED (pre-Frame-3)
- `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION-v2.md` — DEPRECATED (pre-Frame-3)
- `docs/08-agents_work/2026-04-26-FRAME-4-PROPOSAL.md` — DEPRECATED (superseded by Frame 5 v2)
- `docs/08-agents_work/2026-04-26-FRAME-5-PROPOSAL.md` — DEPRECATED (superseded by Frame 5 v2 Full Vision)
- `docs/08-agents_work/2026-04-26-FRAME-3-LOCKED.md` — DEPRECATED (superseded by Frame 5 v2)
- `docs/08-agents_work/2026-04-25-BEAMIX-VISION.md` — DEPRECATED → superseded by Frame 5 v2 Full Vision
- `docs/08-agents_work/2026-04-25-OVERVIEW-DECISION.md` — DEPRECATED (pre-Frame-5 decision doc)
- `docs/08-agents_work/2026-04-24-BOARD-MEETING-MINUTES.md` — DEPRECATED → superseded by April 27 Board Meeting Synthesis
- `docs/01-foundation/PERSONAS.md` — DEPRECATED stub → redirects to PRODUCT_SPECIFICATION.md (itself pre-rethink). Active personas are in PRD v5.1 §3.
- `docs/01-foundation/PRODUCT_SPECIFICATION.md` — DEPRECATED pre-rethink spec → superseded by PRD v5.1.

### Old design system (pre-DESIGN-SYSTEM-v1)
- `docs/PRODUCT_DESIGN_SYSTEM.md` — DEPRECATED pre-rethink design system → superseded by DESIGN-SYSTEM-v1 for all token values.
- `docs/product-rethink-2026-04-09/13-DESIGN-SYSTEM-SPEC.md` — DEPRECATED rethink-era design system → superseded by DESIGN-SYSTEM-v1.

### Archive (docs/_archive/)
- All files in `docs/_archive/` are historical artifacts. They document the pre-April-2026 codebase and planning. Never reference for any active build or design decision.

### AUDITS subfolder (docs/08-agents_work/AUDITS/)
- `AUDIT-FUNCTIONAL-BUGS-2026-03-08.md` — March 2026 functional bug audit. Historical; codebase has been rebuilt.
- `FULL_DESIGN_AUDIT.md`, `FULL-AUDIT-REPORT.md`, `MASTER-BUG-AUDIT-2026-03-08.md` — March 2026 audit reports. Historical.
- `PLANNING_INCONSISTENCIES_AUDIT.md`, `PLANNING_SYNC_REPORT.md` — Pre-rethink planning audits. Historical.
- `PRICING-IMPACT-ANALYSIS.md`, `HANDOFF-FEATURE-PLANNING.md` — Pre-rethink planning docs. Historical.

---

## §6 — Where to find specific things

A reverse index for contributors who know what they want.

| I'm looking for… | File to open |
|---|---|
| **Pricing** (Discover/Build/Scale) | `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §2 |
| **The 9 phases of /start** | `docs/08-agents_work/2026-05-04-OPTION-E-START-FLOW-SPEC.md` §2 |
| **The 13 Adam-locked Q-decisions** (Q1–Q13) | `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` or PRD v5.1 §4 |
| **Voice canon Model B** (where agents are named vs "Beamix" only) | `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` Voice canon section; also auto-memory `project_voice_canon_model_b.md` |
| **The 18 agent monograms** | `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` §agent-monograms |
| **The 11 AI engines at MVP** | `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §F15 |
| **6 MVP agents** (names + what they do) | `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §F7 and `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md` |
| **The 23 board-locked decisions** | `docs/08-agents_work/2026-04-27-BOARD-MEETING-SYNTHESIS.md` |
| **Yossi multi-client / agency mode** | `docs/08-agents_work/2026-04-28-DESIGN-multi-client-switcher-v1.md`; auto-memory `project_white_label_per_client.md` |
| **Truth File schema** (discriminatedUnion + vertical-extensions) | `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §F3; Board Meeting Synthesis decision 8 |
| **Beamix domain** (beamixai.com, not beamix.tech) | `docs/08-agents_work/2026-05-05-INFRA-STATE-COMPLETE.md`; auto-memory `project_domain.md` |
| **Color tokens** (hex values, dark mode) | `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` §1.1 |
| **Typography** (Inter, Fraunces, Geist Mono usage rules) | `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` §1.2; `docs/BRAND_GUIDELINES.md` §Typography |
| **Cream paper surfaces** (which surfaces never go dark) | `docs/08-agents_work/2026-04-28-DESIGN-BOARD-ROUND2-3-SYNTHESIS.md` cream-paper surface partition; PRD v5.1 §Architecture |
| **State of AI Search report timing** | Auto-memory `project_state_of_ai_search_timing.md`; `docs/08-agents_work/2026-04-28-RESEARCH-state-of-ai-search-undefer.md` |
| **Inngest tier decision** (free vs Pro trigger) | Auto-memory `project_inngest_tier_strategy.md` |
| **Beamie character** (deferred until when?) | Auto-memory `project_beamie_deferred.md` |
| **Framer marketing site scope** (what goes there vs this repo) | Auto-memory `project_framer_marketing_after_product.md`; `CLAUDE.md` Architecture Split section |
| **Quality bar definition** (Stripe/Linear/Anthropic-grade) | Auto-memory `project_quality_bar_billion_dollar.md` |
| **Workflow Builder MVP scope** (full DAG + dry-run day 1) | `docs/08-agents_work/2026-04-28-DESIGN-workflow-builder-canvas-v1.md`; auto-memory `project_workflow_builder_mvp_scope.md` |
| **Lead attribution tech spec** (Twilio + UTM + data model) | `docs/08-agents_work/2026-04-28-LEAD-ATTRIBUTION-tech-spec-v1.md` |
| **Aria persona** (CTO buyer, 4th canonical persona) | `docs/08-agents_work/2026-04-28-BOARD-aria-simulator.md`; auto-memory `project_aria_4th_persona.md` |
| **Ticket T-number lookup** (e.g., T100 = Option E state machine) | `docs/08-agents_work/2026-05-04-BUILD-PLAN-v3.1.md` — search by T-number |
| **Supabase live schema** (ground truth) | Run `mcp__supabase__list_tables` — never trust a doc; MCP is authoritative |
| **What infrastructure is live** | `docs/08-agents_work/2026-05-05-INFRA-STATE-COMPLETE.md` |
| **Paddle product IDs** (live production) | `docs/08-agents_work/2026-05-05-INFRA-STATE-COMPLETE.md` §Billing |

---

## §7 — Auto-memory files (cross-session canon)

These files live at `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/` and persist across all agent sessions. They are the source of truth for the facts listed; the docs tree above may have older references.

| File | What it locks |
|------|--------------|
| `project_pricing_v2.md` | Discover $79 / Build $189 / Scale $499; annual discounts. Supersedes all MEMORY.md pricing blocks. |
| `project_voice_canon_model_b.md` | Where agent names appear vs "Beamix" only. The lint-rule surface list. |
| `project_quality_bar_billion_dollar.md` | The quality standard: Stripe/Linear/Apple/Anthropic-grade. Every space, button, letter intentional. |
| `project_aria_4th_persona.md` | Aria as Marcus's hidden CTO co-founder; B2B procurement-grade reviewer. |
| `project_state_of_ai_search_timing.md` | State of AI Search annual report ships at MVP+90 (not MVP launch, not Year-1-Q4). |
| `project_inngest_tier_strategy.md` | Start on Inngest free tier (50K steps/mo); migrate to Pro at ~5 paying customers. |
| `project_white_label_per_client.md` | White-label config is per-CLIENT (Yossi agency scenario), NOT per-account. |
| `project_workflow_builder_mvp_scope.md` | Full DAG editor + dry-run ships day 1; event triggers + publishing → MVP-1.5. |
| `project_beamie_deferred.md` | Persistent Beamie character is NOT in MVP; hand-drawn animations YES; companion NO until product base is done. |
| `project_domain.md` | beamixai.com apex (Framer), app.beamixai.com (Vercel product), notify.beamixai.com (Resend). All beamix.tech references retired. |
| `project_vision_company_not_tool.md` | Beamix is a category-leading company, not a tool. Past-MVP framing, full product quality. |
| `project_framer_marketing_after_product.md` | Marketing site Framer work happens AFTER product is right — don't work on Framer until product is solid. |
| `feedback_board_meeting_style.md` | Multi-agent critical brainstorming style; validate costs against real API pricing. |
| `feedback_no_ai_labels.md` | Agent output reads human-written; no AI disclosure in content; user handles disclosure. |
| `feedback_no_timeline_planning.md` | Don't include weeks/sprints/days in plans; plan by scope + deps + quality bar. |
| `feedback_supabase_plpgsql_bug.md` | SQL Editor splits on semicolons inside $$; always use LANGUAGE sql + CTEs. |
| `DECISIONS.md` | Architecture + strategy decision log (current session decisions). |
| `reference_design_system.md` | Design system quick-reference for agents. |

---

*Index last updated: 2026-05-05. Update this file when a new canonical doc is added or a prior doc is superseded.*
