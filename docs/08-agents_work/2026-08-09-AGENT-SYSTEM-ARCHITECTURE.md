# Agent System — the architecture

**Status:** DESIGN LOCKED. Planning only — nothing is built until Adam says build.
**Date:** 2026-08-09 · **Session:** ceo-1-1786220343 · **Source:** 14-question `/grill-me` with Adam
**Authority:** This document supersedes the sequencing in `2026-08-09-AGENT-SYSTEM-REBUILD-PLAN.md`
where they differ. The plan is the *substrate*; this is the *system*.

---

## The principle

> **Constrain outcomes, not methods.**

Adam, verbatim: *"we want to give the worker and the other agents some freedom to explore new ways to
handle things, solve them, get different context and more — they get a task and they need to do it in a
high quality. so we need to give them space to work."*

Every decision below follows from it. Freedom on the path, precision at the destination, verification of
claims rather than gating of writes. Where a gate exists it is because being wrong there is
unrecoverable — not because the path needed supervising.

## The loop

```
request
  → THINKING LAYER (always on) reads the task, right-sizes its own depth,
    and produces: plan + capability envelope + acceptance criteria
  → CEO dispatches, owning the decision and able to override
  → WORKER receives goal + criteria + envelope, and works however it wants
  → GATE verifies against those acceptance criteria
  → RUN LOG records everything, including every reach past the envelope
  → that signal drives self-improvement
  → anything "big" by the tier map needs the layer above to agree, recorded and CI-verified
```

## The three layers

**1 · CEO / orchestrator.** Always the entry point. Holds the lists — every agent, skill and MCP
description costs ~10k tokens, which is affordable as a standing cost. Composes the envelope, dispatches,
tracks, starts QA, owns the quality bar. Never implements.

**2 · Thinking layer.** Always invoked, never skipped. Reads the task first, then chooses its own depth:
a fast single-perspective triage for a one-line fix, a full multi-perspective fan-out for genuine
ambiguity. Produces the plan, the envelope and the acceptance criteria. **The workflow is the control
structure; the perspectives are real agents carrying real domain procedure.**

**3 · Workers.** Receive a goal and a quality bar. Method is theirs.

Validators sit out-of-band: read-only, never editing what they judge.

---

## The 14 locked decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | **Scope: the build system only** — the 26 dev agents, across ~10 projects. | Business routines and the product's customer-facing agents stay out. |
| 2 | **Thinking layer is hybrid** — workflow controls, agents carry judgment. | Measured: 63 lines of scaffolding duplicated across 5 chief files, but CBO's "pull live numbers → validate against real pricing → sensitivity analysis → flag reversibility" is real encoded expertise. Scaffolding gets generated; expertise stays. Orchestration steps leave the chiefs entirely. |
| 3 | **The CEO composes the envelope** from the lists it holds; may delegate. | Composition is a decision, and decisions belong to the orchestrator. The worker then retrieves *within* the envelope via progressive disclosure. |
| 4 | **The envelope is advisory, and logged.** | Safety was never the envelope's job — the blast-radius and provenance gate handles that. Every reach past the envelope is recorded, and that is the highest-signal data the system can collect about its own composition quality. |
| 5 | **Roster rule: collapse if only skills differ; keep if procedure differs.** | Measured: backend and frontend engineers have identical procedures differing by one declared skill. But "write the rollback plan before the forward migration" and "write the eval" are **definitions of done and safety invariants** — those survive. Step-by-step method does not. |
| 6 | **Everything is self-editable except hooks and settings.** | Git is the review mechanism: every self-edit is a diff on a branch, recorded in the run log, stopped at the sync boundary before it reaches 10 repos, and revertible with one command. Review without a review queue. |
| 7 | **Per-task acceptance criteria, written at dispatch, verified at the gate.** | If method is free, the destination must be explicit. This also gives the gate something task-specific to judge — what the abandoned spec-conformance work was reaching for. |
| 8 | **Memory splits by writer, with an implemented-claim resolver.** | Facts are generated and never hand-written. Decisions are append-only and dated, carrying `proposed \| implemented \| superseded`. Observations are the machine-written run log. One CI check resolves every `implemented` claim naming a file or agent against the filesystem — killing all five current fabrications without blocking a single write. |
| 9 | **"Big" = the tier-floor map. The layer above agrees.** | Adam's rule: a worker's big change needs the thinking layer; the thinking layer's needs the CEO; the CEO's needs Adam. "Big" reuses the existing deterministic path-to-blast-radius map, so the self-modification gate and the merge gate can never disagree. Approval is recorded in the decisions store and CI-verified. |
| 10 | **The thinking layer is always on.** | Removes the per-task classification that killed T1-T5 — which predicted nothing, gated nothing, and was never recorded. |
| 11 | **It right-sizes itself, and logs the choice.** | Judgment sits with the only party that has actually read the task, rather than with the CEO guessing before anyone looked. Logged so under- and over-thinking become measurable. |
| 12 | **Propagation: system universal, memory/MCP/brand-skills project-owned, full skill corpus everywhere.** | The cut test changes from "unused in Beamix" to **"useless in every project."** `stripe-integration` and `clerk-auth` are wrong for Beamix and possibly right for a sibling — a Beamix-scoped cut would silently break another repo. The corpus costs ~7,400 tokens; composition already filters per task. |
| 13 | **Cross-family verification at irreversible tier.** | `qa.js` advertises "3 independent adversarial verifiers"; all three pass `model: 'sonnet'`. Cross-family coverage today is **zero**. Heterogeneity across disjoint model families — not headcount — is the measured active ingredient. |
| 14 | **Codex CLI as that verifier, and as a general second-opinion capability.** | A subprocess needs no client code and carries its own auth. Mandatory in the gate at irreversible tier; otherwise available to any agent wanting a genuinely different model's read. Reaches are logged. |

---

## The mechanisms

Every rule above is enforced by one of these. A rule enforced by prose is not a rule — that is the root
cause this rebuild exists to end.

| Mechanism | Enforces |
|---|---|
| `pre-tool-use.sh` | Blast radius + provenance gate; self-modification block on hooks/settings. Fires identically at every spawn depth, which an org-chart convention cannot. |
| `qa-tier-floor.yml` | The single definition of risk — used by the merge gate *and* the self-modification gate, so they cannot diverge. |
| `schema-lint.js` (wired to CI) | Capability declarations resolve or the build fails. Extended to `tools:` and the MCP manifest. |
| Implemented-claim resolver | Any decision claiming `implemented` must name something that exists. |
| Run log (`stop.sh` append + weekly reader) | Envelope reaches, depth choices, STALLED runs, cost. The only source of self-improvement signal. |
| SHA-bound QA verdict + enabled ruleset | The gate is currently a `grep` against a hand-typed string, and the ruleset has enforcement disabled. Both halves land together. |
| `gsa-sync` fit-precedence | Project-owned files are never overwritten. Already built and self-tested; never once run with `--apply`. |

---

## Verified findings that shaped this

Each was confirmed by direct execution or file inspection this session, not inherited from a prior document.

- **Nested subagent spawning works** — verified live at depth 2 (`DEPTH_2_ALIVE`). The block that justified
  the entire "chiefs are planning-only / dispatch packet" apparatus was last tested 72 runtime versions ago
  and is false today.
- **The QA gate is forgeable and unenforced.** Its PASS decision is a `grep` against a session file found by
  branch-name heuristic; `qa.js` is never invoked by the workflow. And branch protection returns 404 with
  ruleset `13276203` at `enforcement: disabled` — so nothing is required to pass.
- **`mcpServers:` was never the enforcement point.** Claude Code gates MCP access through `tools:`, and
  **zero of 26 agents have any `mcp__` entry there** — all 25 mentions are body prose. `database-engineer`
  instructs itself to call `mcp__supabase__execute_sql` seven times while lacking the tool. This is why the
  prescribed "MCP unavailable" fallback appears in zero of 142 session files: the path is never reached.
- **The manifest generator is broken, not the skills.** 62 of 149 descriptions (41%) are damaged by three
  distinct YAML parsing bugs — `ai-engineer`'s description is literally `'|'` — while the source `SKILL.md`
  files are fine. Since progressive-disclosure selection keys on the description, this is a silent matching
  failure across 42% of the corpus.
- **The Workflow runtime has no module-import support**, which is why `gate-logic.mjs` can never be imported
  by `qa.js` and survives only as hand-mirrored copies.
- **Codex was documented and never built** — promised in CLAUDE.md's Full-tier pipeline, absent from all
  code, not installed, not on the allowlist. A war-room persona had already logged **FM-7: "Codex CLI auth
  expires — WILL break on a predictable schedule"** for a mechanism that never existed.

## Open items

- **The skills cut list needs re-running.** Its 30 cuts used "wrong-stack for Beamix"; decision 12 changed
  the test to "useless in every project." That workflow ran before the decision.
- **Smaller branches not yet grilled:** model routing per role, worker BLOCKED handling, how work arrives.
- **Never priced:** what friction costs. Four design lenses separately admitted they cannot cost what it
  feels like to hit a denial mid-task.
- **Never validated:** the 88-finding audit that grounds much of this was produced by this system, about
  itself, possibly by the same same-family panel flaw it identified in `qa.js`.
- **Single point of consumption:** Adam is sole flag-holder, sole log reader, sole approver above the CEO.
  Nobody examined what happens when he does not read — which is how the entry cap, the vindication
  triggers, and two dead tiers all played out.

## Artifacts

| Document | What it holds |
|---|---|
| `2026-08-09-target-system-spec/` (8 files, 4,825 lines) | Complete target enumerations: agents 26→31, skills 149→109, MCPs 13→9, workflows 6→4, plus hooks, prompts, commands, memory |
| `2026-08-09-AGENT-SYSTEM-REBUILD-PLAN.md` | The substrate: 9 components with mechanisms, build sequence, stop conditions |
| `2026-08-09-skill-harvest/` (12 files, 510 items) | Path-verified skill enumerations from 12 external sources |
| `2026-08-09-adaptive-system-design-research.md` | QM, GSD, and the five cross-cutting design questions |
| `2026-08-09-prime-agent-research-brief.md` | What to take and refuse from Prime Agent |
| `sessions/2026-08-08-ceo-agent-system-clean-sheet-rethink.md` | The full session record, 9-surface audit results, earlier decisions |
