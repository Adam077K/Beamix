# HANDOFF — Next Team / Next CEO Session
Date: 2026-04-27
Branch: `ceo-1-1777220835` — pushed to origin
PR: https://github.com/Adam077K/Beamix/pull/52

This is a context-preservation document. The current CEO session is approaching context-window exhaustion. The next CEO/team picks up from this state.

---

## Open this conversation with the prompt below

Copy-paste into a new Claude Code session as the first message:

> I'm continuing the Beamix product design + planning work. Context window of the prior session is exhausted. Read these files in order to load state:
>
> **Master state:**
> 1. `docs/08-agents_work/2026-04-27-HANDOFF-NEXT-TEAM.md` (THIS FILE — read first)
> 2. `docs/08-agents_work/2026-04-27-FRAME-5-v2-BUILD-INDEX.md` (the spec index)
> 3. `docs/08-agents_work/2026-04-26-FRAME-5-v2-FULL-VISION.md` (Frame 5 v2 LOCKED — positioning)
>
> **The 9 product specs (skim, do not deep-read):**
> 4. `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md`
> 5. `docs/08-agents_work/2026-04-27-PRD-wedge-launch-v1.md`
> 6. `docs/08-agents_work/2026-04-27-HOME-design-v1.md`
> 7. `docs/08-agents_work/2026-04-27-ONBOARDING-design-v1.md`
> 8. `docs/08-agents_work/2026-04-27-CREW-design-v1.md`
> 9. `docs/08-agents_work/2026-04-27-EDITORIAL-surfaces-design-v1.md`
> 10. `docs/08-agents_work/2026-04-27-INBOX-WORKSPACE-design-v1.md`
> 11. `docs/08-agents_work/2026-04-27-MARKETPLACE-spec-v1.md`
> 12. `docs/08-agents_work/2026-04-27-SCANS-COMPETITORS-design-v1.md`
>
> **The audit findings (3 files, may not be ready when you load — check git status):**
> 13. `docs/08-agents_work/2026-04-27-AUDIT-1-consistency.md`
> 14. `docs/08-agents_work/2026-04-27-AUDIT-2-feasibility.md`
> 15. `docs/08-agents_work/2026-04-27-AUDIT-3-customer-journey.md`
>
> **Critical context:** Adam's quality bar is "real billion-dollar company designed this." His thesis: one founder + hundreds of AI agents = 500-person company output. Plan accordingly. NO scope cuts based on team size; AI agents do the work.
>
> **The next move:** review the 3 audit reports, surface findings to Adam, resolve the 5+ open conflicts, then dispatch Build Lead with the locked spec set.

---

## Where we are RIGHT NOW (state snapshot)

### Locked
- **Positioning:** "Beamix" — vertical AI Operating System for AI Search Visibility. Single-character externally; 18 agents internally on `/crew`.
- **Wedge customer:** B2B SaaS founders (10-100 employees) + e-commerce operators (Adam's Q1 lock).
- **Pricing:** Free / Discover $79 / Build $189 / Scale $499 (4 tiers, not 5).
- **Distribution:** social media + cold email + AI citations of Beamix content (Adam's Q2 lock).
- **Trust Architecture:** locks BEFORE MVP launch (4 mechanisms).
- **Default-private permalinks** with explicit-share button (Adam's lock; conflict with Editorial Designer override — see below).
- **State of AI Search annual report:** deferred to Year 1 Q4 (Adam's Q4 lock).
- **MVP surfaces:** 11 text engines only; voice + multimodal + agent-mediated by Year 1+ (Adam's Q5 lock).
- **Vertical KGs at launch:** 2 — SaaS + e-commerce (Adam's Q6 lock).
- **Marketplace:** ships at MVP with reward system for most-used agents/workflows (Adam's Q7 lock).
- **Power User + Certified Agency programs:** designed now, launch Year 1 Q3 (Adam's Q8 lock).
- **Realistic financial:** $1M ARR bootstrap; PRODUCT must be billion-dollar grade (Adam's clarification).

### Built (committed to PR #52)
- Frame 5 v2 LOCKED doc
- 9 product specs (~83K words; design + planning)
- Build Index synthesis
- 4 prior board outputs (~30K words; strategic backing)
- Total: ~120K words on PR #52

### In flight (when this handoff was written)
- 3 audit agents running in background:
  - **Audit 1 (consistency):** finds contradictions/gaps between specs → `2026-04-27-AUDIT-1-consistency.md`
  - **Audit 2 (feasibility):** engineering reality check → `2026-04-27-AUDIT-2-feasibility.md`
  - **Audit 3 (customer journey):** Sarah/Yossi end-to-end → `2026-04-27-AUDIT-3-customer-journey.md`

The next CEO loads this handoff, then waits for or reads the 3 audit files when ready.

---

## Conflicts already flagged (need Adam's resolution)

### From the 9 specs:
1. **Default-public Monthly Update permalink override** — Editorial Designer overrode Adam's default-private lock under auto mode. Resolution path: keep private (Adam's lock holds) / make Monthly Update a permalink exception / reverse the lock entirely.
2. **/crew roster table vs card grid** — Senior Designer C broke from Master Designer's card grid; chose Stripe-table for scannable density across 18 rows. Cross-surface coherence with /scans + /competitors. Designer C's choice accepted unless Adam reverts.
3. **Marketplace top-10 rev share boost level** — 80% (proposed) vs 75% / 85%? Adam to decide.
4. **Marketplace grant pool size** — $50K (proposed) vs other? Adam to decide.
5. **Discover tier marketplace access** — read-only browse vs hidden entirely? Adam to decide.

### Likely additional conflicts (from audit 1, when ready):
The audit board will find more. Expect 10-20 total when audits land. Severity ratings (BLOCKER / SHOULD-FIX / NICE-TO-HAVE) will be assigned.

---

## Critical context the next CEO MUST hold

1. **Adam's vision is BILLION-DOLLAR QUALITY product, $1M ARR financial outcome.** Don't confuse the two. Plan the full vision; the financial target is conservative bootstrap because Adam ships solo with AI agents.

2. **Adam corrected me twice during this session:**
   - First correction: I proposed cutting scope based on $1M ARR → he clarified the financial target ≠ product scope target.
   - Second correction: I positioned Beamix as "AI Marketing Department" → he clarified it's "AI Visibility / GEO" specifically, NOT marketing-broad.

3. **The single-character "Beamix" rule is absolute on customer-facing surfaces.** No agent names ("Schema Doctor did X") on the front door, in emails, on /home, in /inbox, or in marketing copy. Agent names appear ONLY in `/crew` for power users.

4. **The 4-mark sigil system (Ring, Trace, Seal, Margin)** is Beamix's visual identity. Don't drop these as "decoration." Designer's argument (validated by Architect + Worldbuilder): craft IS moat when coupled to product purpose.

5. **The Lead Attribution Loop is the renewal mechanic.** Score is the leading indicator; calls + form submissions are the lagging indicator that justifies $189-499/mo. Every customer-facing surface must surface attribution numbers.

6. **The Brief replaces the Standing Order.** Beamix authors a 1-paragraph proposed Brief from the first scan; customer reads, edits any sentence (chips), approves with the Seal-draw signature ceremony. Customer never writes prose from scratch.

7. **Trust Architecture is non-negotiable pre-MVP.** Truth File + pre-publication validation + review-debt counter + incident runbook + E&O insurance posture. Adds 3-4 weeks to MVP build but is required.

8. **Two ICPs from the PRD:** Marcus (B2B SaaS founder, 10-100 employees, $500K-$5M ARR, Build tier as primary) and Dani (e-commerce operator, $2M-$10M, Shopify, Discover-then-Build progression). The plumber-Sarah from prior sessions was REPLACED.

9. **6 agents at MVP** (not 11 or 18): Schema Doctor, Citation Fixer, FAQ Agent, Competitor Watch, Trust File Auditor, Reporter. Other 12 are dated MVP-1.5 / Year 1 / Year 1.5+. Marketplace at MVP shows the 5-7 first-party agents as listings even though Beamix built them — populates the marketplace from day 1.

10. **The Monthly Update is the renewal-anchor artifact.** Sent 7 days before billing. Sarah forwards to her CEO. Yossi forwards to client (white-label on Scale). React-PDF generation. 6-page composition.

---

## What's NOT yet built (next phases after build phase begins)

- Trust Architecture infrastructure spec (separate engineering deliverable; the 4 mechanisms detailed)
- Database schema spec
- Brief schema canonical definition (referenced across specs but not formally spec'd)
- House Memory schema canonical definition (same)
- Provenance envelope canonical schema (Architect referenced; needs formal definition)
- Agent Runtime architecture detailed spec (Architect's L2 layer outlined; needs formal spec)
- Email infrastructure detailed spec (transactional vs marketing ESP, deliverability)
- Lead Attribution Loop infrastructure detailed spec (Twilio + UTM + attribution logic + storage)
- The 5-7 chip menus for Onboarding Step 2 (growth-lead deliverable)
- /schedules + /settings detailed designs (admin surfaces; spec'd at high level in PRD only)

---

## What I (current CEO) recommend the next team does

### Step 1 — Wait for the 3 audit files to land
They're running. ~15-20 minutes from when this handoff was written.

### Step 2 — Read the audit findings + present them to Adam in chat
Synthesize the 3 audit reports. Surface ALL conflicts (the 5 already flagged + the new ones the audit will find). Group by severity (BLOCKER / SHOULD-FIX / NICE-TO-HAVE).

### Step 3 — Resolve open questions with Adam
Adam needs to lock the conflicts. ~10 questions max. Surface them clearly.

### Step 4 — Update affected specs
Once locks are in, edit the affected specs to reflect the resolutions. Push to PR #52.

### Step 5 — Dispatch Build Lead
With the resolved spec set, Build Lead can begin worker dispatch in 6-tier dependency order (see Build Index doc).

### Step 6 — Trust Architecture infrastructure spec (parallel to Step 5)
Adam locked this as the pre-MVP requirement. Dispatch a senior security/AI engineer (or a board) to produce the infrastructure spec for Truth File + pre-publication validation + review-debt counter + incident runbook.

### Step 7 — Database schema spec (parallel to Step 5)
Dispatch a database engineer to produce the canonical schema for: Brief, House Memory, Truth File, audit log, provenance envelope, Lead Attribution Loop tables, marketplace agent listings.

---

## What NOT to do (lessons from this session)

1. **Do NOT cut scope based on Adam's "$1M ARR bootstrap" framing.** That's the financial target, not the product target. Plan full vision.

2. **Do NOT position Beamix as "AI Marketing Department."** It's AI Visibility / GEO specifically. Marketing is too broad and fights HubSpot/Klaviyo on their turf.

3. **Do NOT auto-approve agent overrides on locked decisions.** When the Editorial Designer overrode default-private permalinks, the right move was to FLAG it for Adam's resolution, not silently accept it.

4. **Do NOT assume Activity Ring / Crew Traces / hand-drawn elements are "decoration."** They are part of the moat per cross-board agreement.

5. **Do NOT dispatch agents with overly long prompts.** Two of the original 9 dispatches stalled (Marketplace + /scans-competitors) — both had 6,000-9,000-word prompts. The compact versions (~1,500-2,000 words) succeeded. Keep prompts focused.

6. **Do NOT batch too many agents in parallel without considering synthesis cost.** This session ran 9 agents in parallel — synthesizing 83K words of output ate significant context. Consider sequencing or smaller boards for follow-up.

---

## Open Q&A — the next CEO will need answers to

These are the questions the next CEO should bring to Adam in chat:

**Conflicts (must resolve before build):**
1. Default-public Monthly Update permalink override — keep private / make exception / reverse lock?
2. /crew roster table vs card grid — confirm table?
3. Marketplace top-10 rev share boost — 80% / 75% / 85%?
4. Marketplace grant pool size — $50K / other?
5. Discover tier marketplace access — read-only browse / hidden?

**Spec gaps (need explicit specs):**
6. Brief canonical schema — needed before /onboarding builds.
7. House Memory canonical schema — needed before /inbox + /home build.
8. Trust Architecture infrastructure — needed before any agent runs against customer.
9. Database schema — needed before any backend work.

**Strategic open:**
10. Build Lead dispatch timing — start now (Path A) / after full review (Path B) / after another board (Path C)?

---

## Branch + commit state

- Branch: `ceo-1-1777220835` (worktree at `.worktrees/ceo-1-1777220835`)
- Pushed to origin: yes
- PR: #52 (open, awaiting Adam's review + locks)
- Last commit before this handoff: `bdb8764` (Build Index)
- All 9 specs + Build Index + this handoff committed and pushed

---

## Final state of the asymmetric scale (in 24 hours)

- 4 boards (16 specialized agent seats)
- 9 design + planning specs (parallel agents)
- 3 audit agents running (will land after this handoff)
- ~120K words of strategy + design + planning
- 1 founder + ~28 specialized agent runs

The build phase is unblocked once the audit findings are synthesized and the 10 open questions are resolved.

---

*End of handoff. Next CEO: pick up from Step 1.*
