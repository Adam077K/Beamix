# Frame 5 v2 — Build Index (Design + Planning Phase Complete)
Date: 2026-04-27
Status: All 9 design + planning specs committed. Ready for build.

---

## What just happened

Adam locked Frame 5 v2 (positioning + 8 strategic questions) on 2026-04-27.

In response, 9 agents (PMs + Designers + Architects) ran in parallel to produce implementation-ready product design + planning specs covering every primary surface, the platform layer, the marketplace, the trust architecture, and the wedge-launch product requirements.

**Total output: ~83,000+ words of pixel-precise, implementation-ready spec across 9 deliverables.**

Plus 4 prior board outputs (Architect, Master Designer, Domain Expert, Worldbuilder, ~30K words combined) that informed the specs.

This document is the **build index** — the table of contents and the synthesis flag list. Build Lead can dispatch frontend-developer + backend-developer + ai-engineer + database-engineer workers from this index.

---

## The 9 deliverables

| # | Deliverable | File | Length | Status |
|---|---|---|---|---|
| 1 | Visual Design System v1 | `2026-04-27-DESIGN-SYSTEM-v1.md` | 8,544 words / 1,280 lines | ✅ Committed |
| 2 | PRD Wedge Launch v1 | `2026-04-27-PRD-wedge-launch-v1.md` | ~8,000 words | ✅ Committed |
| 3 | /home design v1 | `2026-04-27-HOME-design-v1.md` | ~7,800 words | ✅ Committed |
| 4 | /onboarding design v1 | `2026-04-27-ONBOARDING-design-v1.md` | ~10,365 words | ✅ Committed |
| 5 | /crew + Workflow Builder design v1 | `2026-04-27-CREW-design-v1.md` | ~13,000 words | ✅ Committed |
| 6 | Editorial surfaces v1 (/scan public + Monday Digest + Monthly Update PDF) | `2026-04-27-EDITORIAL-surfaces-design-v1.md` | ~12,152 words | ✅ Committed |
| 7 | /inbox + /workspace design v1 | `2026-04-27-INBOX-WORKSPACE-design-v1.md` | ~12,425 words | ✅ Committed |
| 8 | Marketplace + Agent SDK + Rewards v1 | `2026-04-27-MARKETPLACE-spec-v1.md` | ~5,343 words | ✅ Committed |
| 9 | /scans + /competitors design v1 | `2026-04-27-SCANS-COMPETITORS-design-v1.md` | ~6,050 words | ✅ Committed |

All 9 are on PR #52 (https://github.com/Adam077K/Beamix/pull/52) on branch `ceo-1-1777220835`.

---

## Conflicts and design decisions to flag for Adam

The 9 agents worked in parallel; some made independent decisions that conflict with each other or with prior locks. **The synthesis preserves Adam's earlier locks unless he explicitly overrides.** Here's the conflict list:

### Conflict 1 — Default-public Monthly Update permalink override
- **Editorial Designer recommended:** default-PUBLIC for Monthly Update permalinks (justified by "forwarding mechanic")
- **Adam's earlier lock:** default-private permalinks across all customer-specific artifacts
- **Status:** Adam's lock holds unless Adam confirms the override
- **Resolution path:** Adam to decide — three options:
  1. Keep default-private; user clicks "Generate share link" to make it public
  2. Make Monthly Update an exception (it's specifically meant to forward)
  3. Reverse the lock entirely (default-public for everything)

### Conflict 2 — /crew roster: table vs card grid
- **Master Designer recommended:** 3-column card grid
- **Senior Designer C (/crew) recommended:** Stripe-table grammar for scannable density across 18 rows; cross-surface coherence with /scans + /competitors
- **Status:** Designer C's table grammar accepted (better cross-surface coherence + Yossi's needs)
- **Resolution:** Adam to confirm or revert

### Conflict 3 — Activity Ring placement
- **Master Designer specified:** Activity Ring as the single image of Beamix (on /home)
- **Senior Designer A (/home) confirmed:** Activity Ring on /home as primary
- **Senior Designer C (/crew) confirmed:** Activity Ring intentionally ABSENT on /crew; /crew gets its own signature (18 Rough.js monograms in Margin column)
- **Status:** Coherent. No conflict.

### Conflict 4 — Workflow Builder visual library
- **Senior Designer C chose:** React Flow for Workflow Builder DAG editor
- **Rationale:** Yossi's mental model is Zapier/n8n; differentiation lives in node types + validation + Brief grounding, not pan-zoom mechanics
- **Status:** Accepted; flag for build-lead consideration of bundle-size impact

### Conflict 5 — Onboarding Step 4 (Truth File): mandatory with no skip
- **Senior Designer B (/onboarding) confirmed:** Step 4 has NO Skip button — Trust Architecture non-negotiable
- **Master Designer's spec:** allowed minimal Truth File at MVP
- **Status:** No skip is correct per Trust Architecture mandate; Lead PM PRD agrees

### Conflict 6 — Brief: no Reject button
- **Senior Designer B (/onboarding):** No Reject button on the Brief — it's a "constitutional act"
- **Status:** Accepted; user can edit any sentence (chips) or contact support to reset, but cannot outright reject without committing

---

## 5 open questions still pending Adam's lock

From the 9 agents' outputs:

1. **Monthly Update permalink default** — public or private? (Conflict 1 above)
2. **Marketplace top-10 rev share boost level** — 80% (proposed) vs 75% / 85%?
3. **Marketplace grant pool size** — $50K (proposed) vs other?
4. **Discover tier marketplace** — read-only browse vs hidden entirely?
5. **Workflow Builder bundle-size budget** — React Flow adds ~100KB; acceptable for Scale-tier-only feature?

---

## What's now ready for the Build Lead

The Build Lead can dispatch worker streams in dependency order:

### Tier 0 — Foundations (no blockers)
1. **Visual Design System v1** → frontend-developer to scaffold:
   - Tailwind config extensions
   - CSS custom property file (full token set)
   - Rough.js + perfect-freehand utility module with seed strategy
   - Framer Motion variant primitives for the 12 motion tokens
   - 14 component primitives (StatusToken, DecisionCard, PillButton, CardSurface, TableRow, EvidenceCard, EngineChip, ScoreDisplay, Sparkline, EmptyState, CrewMonogram, TopbarStatus, SectionHeading, MutedSubtext)
2. **Trust Architecture infrastructure** → backend-developer + ai-engineer + security-engineer (PARALLEL stream — Adam's pre-MVP non-negotiable):
   - Truth File schema + storage + retrieval API
   - Pre-publication validation framework (per-agent class)
   - Review-debt counter logic
   - Incident-response runbook + E&O insurance posture
   - Provenance envelope schema
3. **Database schema** → database-engineer:
   - Brief schema + version history
   - House Memory schema
   - Truth File schema
   - Audit log + provenance envelope tables
   - Lead Attribution Loop tables (Twilio numbers, UTM tags, conversions)
   - Marketplace agent listings table

### Tier 1 — Critical-path product surfaces
4. **/scan public** → frontend-developer (Editorial Designer's spec; locked storyboard)
5. **/onboarding** → frontend-developer + backend-developer (Senior Designer B's spec; depends on Trust Architecture infrastructure)
6. **/home** → frontend-developer (Senior Designer A's spec; depends on Visual Design System)
7. **Lead Attribution Loop infrastructure** → backend-developer (Twilio integration, UTM tag system, attribution logic)

### Tier 2 — Primary product surfaces
8. **/inbox + /workspace** → frontend-developer (Senior Designer D's spec)
9. **/scans + /competitors** → frontend-developer (Senior Designer E's spec)
10. **Email infrastructure** → backend-developer + technical-writer (Monday Digest + Monthly Update + event-triggered briefs)

### Tier 3 — Secondary surfaces
11. **/crew Roster + Audit + Marketplace entry-points** → frontend-developer (Senior Designer C's spec)
12. **/schedules + /settings** → frontend-developer (admin Stripe-replica forms; spec'd in PRD)

### Tier 4 — Power-user features
13. **Workflow Builder** → frontend-developer + backend-developer (React Flow + DAG runtime; gates Scale tier; 6-8 week estimate per Senior Designer C)
14. **Marketplace SDK** → backend-developer (Firecracker microVM sandbox; agent SDK in TS + Python)

### Tier 5 — Reward system + Marketplace MVP
15. **Marketplace surface (MVP form)** → frontend-developer (10-12 first-party Beamix-built agents listed)
16. **Reward system data + UI** → frontend-developer + backend-developer (most-used / most-improvement / etc.)

### Tier 6 — Year 1 expansions (deferred)
- Voice + multimodal + agent-mediated browsing surfaces (8 of 19 surfaces)
- 7 deferred agents (Voice AI Optimizer, Visual Optimizer, etc.)
- 10 deferred vertical KGs
- Beamix Sessions + State of AI Search annual report
- Beamix Power User + Beamix Certified Agency programs

---

## Cross-cutting principles (re-asserted from Frame 5 v2)

These principles govern every build decision:

1. **Single-character externally — "Beamix did this."** No agent names on front door.
2. **Agent attribution everywhere internally** — every action traces back to which agent + Brief clause + Truth File reference + validation result.
3. **Default-private permalinks** with explicit-share button.
4. **Trust Architecture pre-MVP** — Truth File + pre-publication validation + review-debt counter + incident runbook locked before any agent runs against customer.
5. **Lead Attribution Loop is the renewal mechanic** — every customer-facing surface displays it.
6. **The 4-mark sigil system** (Ring, Trace, Seal, Margin) governs visual identity across surfaces.
7. **Calm but dense** — Stripe Dashboard discipline; no calm-as-empty.
8. **Outcomes over process** — show what changed; hide how unless asked.
9. **Email is a primary channel** — Monday Digest + event-triggered + Monthly Update + Quarterly + Annual.
10. **The customer journey extends beyond the product** — pre-purchase content, integrations, post-cancel grace.

---

## What I (CEO) recommend Adam does next

The strategic + design phase is complete. The build phase is unblocked. Three paths:

### Path A — Lock the 5 open questions and start building
Adam answers the 5 questions above (Marketplace permalink default, rev-share boost, grant pool, Discover marketplace access, Workflow Builder bundle budget). I dispatch Build Lead with the full spec set. Frontend + backend + AI + DB engineers begin in dependency order.

### Path B — Review the 9 specs first
Read through the 9 deliverables (~83K words). Push back on anything that doesn't match your mental model. Then I update the affected specs and we proceed to build.

### Path C — Deploy a 4th board to attack Frame 5 v2 from new angles
If you want one more attack pass before build (different from Board 2's structural attack — this one would be "what's missing," "what should be added that isn't on the table yet"). I'd add seats like: Marketing & Distribution Strategist, Customer Success Operator, AI Research Frontier expert.

**Auto mode default if you don't answer in 30 minutes:** Path A — I dispatch Build Lead with current spec set, preserving your earlier locks where conflicts exist.

---

## Closing — the asymmetric scale

Adam's thesis: *one founder + hundreds of AI agents = 500-person company output.*

In one day (2026-04-26 → 2026-04-27), the Beamix product strategy team has:
- Locked positioning (Frame 5 v2)
- Resolved 8 strategic questions
- Produced the canonical Visual Design System
- Produced detailed designs for every primary product surface
- Produced the PRD for the wedge launch (B2B SaaS + e-commerce ICPs)
- Produced the Marketplace + Agent SDK + Reward system spec
- Produced the editorial artifact specs (/scan public + Monday Digest + Monthly Update PDF)
- Identified 5 cross-doc conflicts that need explicit resolution
- Indexed every spec for the Build Lead

Total parallel agent runs: 4 boards (16 seats) + 9 design/PM specs = ~25 specialized agent deployments. ~120K words of design + product strategy in 24 hours.

Build Lead is unblocked. Build phase begins on Adam's word.

---

*End of Build Index. Frame 5 v2 design + planning phase complete.*
