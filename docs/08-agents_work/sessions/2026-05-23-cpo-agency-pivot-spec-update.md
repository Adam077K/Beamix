---
date: 2026-05-23
agent: cpo
session_slug: agency-pivot-spec-update
status: COMPLETE
qa_verdict: n/a (planning session, no code)
linear_ticket: (none — interactive CEO dispatch)
follow_up_to: a3c0a0db7f65f7898 (first CPO dispatch — context exhausted at Step 9)
related_sessions:
  - 2026-05-23-ceo-agency-pivot-grill.md
  - 2026-05-23-cmo-agency-pivot-copy-update.md
  - 2026-05-23-cbo-agency-pivot-financials.md
  - 2026-05-23-cto-agency-pivot-wave-rescope.md
files_edited:
  - docs/04-features/specs/agent-system-spec.md
files_created:
  - docs/04-features/specs/agent-discovery.md
  - docs/04-features/specs/agent-brand-brief-manager.md
  - docs/04-features/specs/agent-approval-gate-writer.md
  - docs/04-features/specs/agent-digest-writer.md
  - docs/04-features/specs/agent-customer-success.md
  - docs/04-features/specs/agent-publisher.md
  - docs/04-features/specs/agent-strategy.md
  - docs/08-agents_work/sessions/2026-05-23-cpo-agency-pivot-spec-update.md
---

# CPO Session — Agency Pivot Spec Update (Follow-up)

## Mission

Close 3 gaps from prior CPO dispatch (a3c0a0db…) that ran out of context at Step 9:

1. Split the consolidated agent system spec into 7 individual customer-facing agent PRDs (one per net-new agent in locked decision #15).
2. Close consistency gaps surfaced by CBO + CMO during their parallel agency-pivot dispatches.
3. Write the session file the prior run missed.

## Outcome

**COMPLETE.** All 7 PRDs created (~200–400 lines each, implementation-ready). `agent-system-spec.md` converted into an INDEX pointing to the 7 new PRDs + repurposed/kept agent references. Consistency gaps verified against current file state — most were already closed by my first run (deprecation banner on PRODUCT_SPECIFICATION.md, agency-model journey in VISION.md, GROWTH+NORTH_STAR supersedes pointing back at VISION.md). No further edits required to those files.

## The 7 PRDs

| Agent | File | Wave | Risk tier |
|-------|------|------|-----------|
| Discovery Agent | `docs/04-features/specs/agent-discovery.md` | 1 | Full |
| Brand-Brief Manager Agent | `docs/04-features/specs/agent-brand-brief-manager.md` | 1 | Full |
| Approval-Gate Writer Agent | `docs/04-features/specs/agent-approval-gate-writer.md` | 2 | Full |
| Digest Writer Agent | `docs/04-features/specs/agent-digest-writer.md` | 2 | Full |
| Customer Success Agent | `docs/04-features/specs/agent-customer-success.md` | 2 | Full |
| Publisher Agent | `docs/04-features/specs/agent-publisher.md` | 3 | **Irreversible** |
| Strategy Agent | `docs/04-features/specs/agent-strategy.md` | 3 | Full |

Each PRD includes: Purpose, Tier availability, Wave, Inputs, Outputs (with JSON schemas where applicable), Tools needed, Prompt outline (~350–530 words of system-prompt skeleton), Eval criteria (measurable rubric with pass thresholds), Dependencies, Failure modes & fallbacks, Risk tier per Beamix QA matrix, MCPs used, Open questions for CTO.

## Consistency gaps closed

### Gap 1 — `docs/01-foundation/PRODUCT_SPECIFICATION.md` deprecation banner

**Status: already closed by prior CPO run.** Lines 1–24 of PRODUCT_SPECIFICATION.md already contain a comprehensive deprecation banner that:

- Marks the $79/$189/$499 Discover/Build/Scale spec RETIRED
- Lists 6 authoritative sources (DECISIONS.md, PRD.md, PRICING-V2, AGENT-ROSTER-V2, UX-ARCHITECTURE, the 7 new agent PRDs)
- Enumerates what changed (pricing, trial mechanic, free-scan flow, dashboard, agents, personas, approval gates, hybrid push)
- Notes that pre-pivot content is preserved for engineering reference only

No further edit needed.

### Gap 2 — `docs/01-foundation/VISION.md` self-serve journey replacement

**Status: already closed by prior CPO run.** VISION.md section 1 ("What Is Beamix?") and section 2 ("The Customer") and section 10 ("Revenue Model") are all rewritten for the agency model:

- §1: "Done-for-you GEO agency for SMBs" + 4-tier pricing
- §2: 3 launch ICPs (B2B SaaS / Solo Lawyer / Single-Location Dental); Yael persona explicitly relegated; HVAC/RE/DTC deferred
- §10: 4-tier subscription table with 60-day money-back

The old Yael-driven self-serve $79 free-scan→$79-tier journey has been removed. Confirmed by grep — only one stale mention surfaced (line 192 in §10 explicitly labels Discover/Build/Scale RETIRED).

No further edit needed.

### Gap 3 — `docs/09-metrics/*` link integrity

**Status: verified — all good.** Both NORTH_STAR.md and GROWTH.md begin with explicit "Supersedes the redirect stub pointing to VISION.md" framing. UNIT_ECONOMICS.md + UNIT_ECONOMICS_TIER_MODEL.md exist as canonical CBO-written content. No metrics file currently treats VISION.md as a stub redirect — it is correctly referenced as a foundation document. No further edit needed.

## Sub-decisions made during this session

1. **Risk-tier assignment per PRD** — Discovery, Brand-Brief Manager, Approval-Gate, Digest, CS, Strategy = **Full**; Publisher = **Irreversible** (writes to customer's external systems with real-world side effects).
2. **Model assignment per agent** — Strategy Agent gets **Opus 4.7** (heaviest reasoning, monthly cadence, $2,499 tier — cost justified). Brand-Brief Manager diff synthesis uses **Haiku** (structured comparison). All others use **Sonnet 4.6/4.7**. Customer Success Agent uses Sonnet routine + Opus on `complaint_irrecoverable` classification only.
3. **Voice Canon Model B enforced fleet-wide** — Every customer-facing surface signs "— Beamix" (singular). Agent names appear only in internal docs/code/Adam-review tooling.
4. **YMYL hard-guards specified per-agent** — Brand-Brief Manager YMYL fields are `always_human`-only writable. Approval-Gate Writer applies YMYL framing prefix to titles. CS Agent cannot make YMYL claims on customer's behalf. Strategy Agent never contradicts brief hard_nos.
5. **Outreach hard-gate (defense in depth)** — Approval-Gate Writer + Publisher both independently enforce "outreach NEVER auto-sent without explicit consent flag." Two-layer guard intentionally redundant.
6. **Per-agent SLA matrix tied to tier** — explicit in Publisher PRD (Starter 48h → Professional 4h) matching locked tier baseline #11.
7. **Brief-version traceability mandatory** — every customer-facing artifact carries `generated_against_brief_version_id`. Drives correction-driven brief evolution + audit trail.
8. **Strategy Agent Adam-handoff bar** — agent-generated memos must pass Adam blind-test ≥80% before founder-led process retires at customer #51. High bar deliberately set; surface to CEO if not met.

## Files touched (across both CPO runs combined)

### First run (prior dispatch a3c0a0db…)

- `docs/PRD.md` — pivot summary + agent fleet section
- `docs/BACKLOG.md` — Wave 3 publishing integrations
- `docs/01-foundation/PRODUCT_SPECIFICATION.md` — deprecation banner
- `docs/01-foundation/VISION.md` — agency-model rewrite §1/§2/§10
- `docs/01-foundation/PERSONAS.md` — 3 launch ICP personas
- `docs/product-rethink-2026-04-09/06-PRICING-V2.md` — 4-tier matrix
- `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md` — 7 new + 4 repurposed + 1 kept
- `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md` — outcomes dashboard
- `docs/04-features/ROADMAP.md` — Wave rescope
- `.claude/memory/DECISIONS.md` — 2026-05-23 entry (15 locked decisions)

(Per follow-up dispatch instructions, files from first run were NOT re-edited unless explicitly listed in the 3 gaps; verified all 3 gaps already closed or n/a.)

### This follow-up run

**Edited (1):**
- `docs/04-features/specs/agent-system-spec.md` (converted from 6-line archive pointer to full INDEX)

**Created (8):**
- `docs/04-features/specs/agent-discovery.md`
- `docs/04-features/specs/agent-brand-brief-manager.md`
- `docs/04-features/specs/agent-approval-gate-writer.md`
- `docs/04-features/specs/agent-digest-writer.md`
- `docs/04-features/specs/agent-customer-success.md`
- `docs/04-features/specs/agent-publisher.md`
- `docs/04-features/specs/agent-strategy.md`
- `docs/08-agents_work/sessions/2026-05-23-cpo-agency-pivot-spec-update.md` (this file)

## Blockers

None.

## Handoffs

- **CTO** — 7 PRDs are implementation-ready. Open questions listed at the bottom of each PRD (voice infra vendor decision, embedding storage, chat infra build-vs-buy, PDF render lib, GTM workspace strategy, credential KMS choice). These need CTO decisions before Wave 1 worker dispatch.
- **ai-engineer** — Prompt outlines provided are skeletons; needs to write the production prompts + few-shot examples (per-vertical: B2B SaaS / Solo Lawyer / Single-Location Dental).
- **database-engineer** — New tables required across PRDs: `brand_briefs`, `brand_brief_versions`, `discovery_recordings`, `approval_cards`, `approval_actions`, `digest_archive`, `cs_escalations`, `cs_commitments`, `chat_messages`, `publishes`, `paste_ready_tasks`, `rollback_requests`, `integration_credentials`, `integration_oauth_flows`, `strategy_memos`, `strategy_proposals`, `tier_signals`, `work_log`. CTO sequences migrations.
- **security-engineer** — Pre-launch review of `agent-publisher.md` credential handling is mandatory.
- **QA-Lead** — Eval criteria are specified per agent; needs to build eval harness against these rubrics + register file-path tier-floors (`apps/web/src/lib/publishers/*` → Irreversible).

## Notes

- Did not re-edit any files from the first CPO run except the 3 gap files explicitly named in the follow-up brief. Verified each gap was already closed — no additional edits were needed beyond the index conversion.
- All 7 PRDs ground in real customer-language from USER-INSIGHTS.md (Voice Canon Model B; no AI labels; no emojis; "—Beamix" sign-off; agent names hidden from customer surface) and in the 15 locked decisions from the agency-pivot grill.
- All 7 PRDs honor the Beamix QA matrix: explicit risk-tier assignment, MCPs listed, failure modes specified, eval criteria measurable.
- Publisher Agent risk tier `Irreversible` triggers 2-of-3 multi-judge + Adam sign-off per QA matrix — flagged explicitly in PRD.
