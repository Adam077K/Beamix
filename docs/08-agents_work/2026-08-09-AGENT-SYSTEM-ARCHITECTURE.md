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
| 15 | **Model routing is a compiled tier map, split universal/project by who holds the knowledge.** | A generation shipping is a global fact; a repo's stakes are a local one. The tier→ID map and default assignments are universal; per-agent overrides are project-owned. Measured: 51 files pin literal dated IDs, the Opus 4.8 bump was recorded as available 2026-05-28 and never applied, and two generations have shipped since. One line to bump beats a 51-file find-and-replace that demonstrably does not happen. |
| 16 | **A worker's `BLOCKED` auto-invokes the thinking layer; two panel runs per task, then Adam.** | The blocker is usually a thin brief, and the panel is the cheapest thing that can close it without an interrupt. The bound is a `jq` count on `task_id`, not prose — the current "max 3 retries" counts nothing. If a fresh multi-perspective panel cannot unblock it twice, the ambiguity is a *decision*, which decision 9 reserves for the layer above. |
| 17 | **Work arrival is a universal contract with a project-owned rail binding.** | Same cut as 15. The contract (`task_id`, goal, acceptance criteria, durable record) is universal; which rail supplies it is project-owned, because decision 12 already makes MCPs project-owned and this system serves ~10 repos. Beamix binds Linear, **pull-only**: one `.mcp.json` entry makes 23 dead `mcp__linear__*` call sites and `ceo.md`'s step 7 real, at S cost. Autonomous inbound stays a separate later decision. |
| 18 | **The capability envelope is a machine-readable list; `pre-tool-use.sh` detects reaches and logs them, never blocking.** | Decision 4 called envelope reaches the highest-signal data the system can collect, and until now nothing defined what an envelope *was* or how a reach would be seen — leaving decision 4 enforced by prose, the class the doctrine disqualifies. The hook is the one mechanism that fires identically at every spawn depth. Constrains the envelope to machine-checkable names; prose guidance cannot be part of it. |
| 19 | **Acceptance criteria are executable where possible and judged where not — and the two halves have different teeth.** | Mirrors the split the system already gets right: deterministic classification in the tier-floor, model judgment only where nothing deterministic exists. A failed `verified_by: command` criterion is a deterministic BLOCK through the existing P1-override; a failed `verified_by: judge` criterion enters findings and must survive adversarial verification first. Because every judged criterion is labelled, the run log can measure how often judged criteria were wrong — the only way to learn whether prose criteria are worth anything. |
| 20 | **Propagation target is the 9 live repos plus Beamix; sync splits — `--check` lands early, `--apply` stays last.** | Measured, not assumed: 11 repos carry the system, and the 3 without a `qa-tier-floor.yml` are exactly the 3 with zero commits in 90 days. Two live repos out-commit Beamix (etsyc 689, evalove 385 in 90d). `--check` gives drift visibility across 9 live repos with zero write risk, and produces the cross-repo inventory decision 12's "useless in every project" cut test requires. `--apply` stays at step 9 so no half-rebuilt state fans out. |
| 21 | **A reader agent consumes the run log and acts or escalates; Adam is out of the loop.** | The weekly reader now carries five signals at once (STALLED runs, envelope reaches, BLOCKED-rate, judged-criteria reliability, dead model pins), so a single unread report blinds all five. Every delivery-side fix still terminates at a human who may not look — which is exactly how the vindication triggers, the 50-entry cap, and T3/T4 died. Removing the human is the only structural answer. |

### Decisions 18-21 — detail, and the one hole left open

Resolved by `/grill-me` with Adam, 2026-08-09, same session. These close the envelope, acceptance-criteria, cross-project-fit
and single-point-of-consumption items. Two of the plan's five "questions kept open" are now answered with measurement rather
than judgment.

**18 · Envelope.** At dispatch the CEO writes `.claude/run/<task_id>/envelope.json` — `skills[]`, `mcps[]`, `tools[]`,
`paths[]`. `pre-tool-use.sh` compares each call, appends `{event: 'envelope_reach', tool, task_id, agent}` to the run log
when outside it, and exits 0 regardless. *Carried:* session→task_id resolution needs no new mechanism — `hooks.md:315`
already writes a per-session scratch file holding `{run_id, session_id, started_ts}`, and the envelope lives beside it.
*Carried:* the thinking layer proposes the envelope and criteria; the CEO owns and may override (decision 3's "may delegate").

**19 · Acceptance criteria.** Shape: `{id, text, check, verified_by: command|judge}`. **This requires plumbing that does not
exist** — `qa.js` has zero `args.` references today and its five dimensions (`correctness`, `security`, `patterns`, `tests`,
`perf`) are all generic code-quality lenses with no task-specific input of any kind. `spec_conformance` exists nowhere on
main; it died on the unmerged `feat/spec-conformance-and-qa-lead-accuracy` branch. Run-log fields: `ac_total`, `ac_judged`,
`ac_failed`.

**20 · Propagation.** Target set: `aiclub`, `beeond`, `etsyc`, `evalove`, `finfun`, `ghostb`, `noam-website`, `realestate`,
`adamos`, plus Beamix. Out of scope by data: `hitstampjavagame`, `ml2`, `test1` — zero commits in 90 days, no tier-floor, and
the pre-cleanup 426-574-skill corpus. Note `adamos` carries **11 hooks to Beamix's 7**: a sibling is ahead, so fit-precedence
is load-bearing on the first `--apply`, not theoretical.

**21 · Consumption.** A scheduled reader agent consumes the run log plus prior reports and decides act / escalate / nothing.
**Open hole, named by Adam at decision time and not yet closed: who checks that the reader ran?** A reader agent that
silently stops firing is the same failure one level up, and stop condition 7 starts its two-week clock the moment the
mechanism is named. *Proposed, not yet locked:* the reader stamps `last_run` into the run log, and a check that executes far
more often than weekly — CEO session start, or `schema-lint.js` in CI — fails or warns when that stamp is stale. That reuses
an existing frequent path rather than adding a watcher for the watcher. **Flagged for Adam's decision.**


Resolved by `/grill-me` with Adam, 2026-08-09, session `ceo-agent-system-rebuild`. These close the "smaller branches
not yet grilled" open item. Sub-decisions marked *carried* were settled by doctrine already locked above rather than
by a fresh choice, and are flagged as such so a later session can see which had Adam's direct hand on them.

**15 · Model routing.**
- Notation: agent frontmatter declares a `tier:`; a generator writes the resolved `model:`; `schema-lint.js` fails the
  build when frontmatter disagrees with the map. Same shape as `MANIFEST.json` for skills.
- Five tiers: `depth` · `default` · `cheap` · `orchestration` · `adversary`. `adversary: codex` is where decisions 13
  and 14's cross-family routing lives as **data**, rather than as prose inside one agent's description.
- Propagation: `.claude/model-routing.yml` universal (tier→ID map + default assignments);
  `.claude/model-routing.local.yml` project-owned (per-agent overrides), protected by `gsa-sync` fit-precedence.
- *Carried:* detection folds into the component-5 weekly reader, which also does `GET /v1/models` and reports two
  facts — a pinned ID the API no longer returns (dead pin), and a newer generation absent from the map (available
  bump). Advisory, logged, gates nothing. A dedicated cron would violate stop condition 7.

**16 · BLOCKED handling.**
- On receipt the CEO invokes the thinking layer, records the resolution in the decisions store, and re-dispatches.
  The worker never invokes thinking itself — enforced structurally, since only `ceo` and the 6 Leads declare `Task`.
- Bound: two thinking-layer runs per `task_id`. On the third block, escalate to Adam with both blocker reasons, both
  panel verdicts, and what changed between them.
- *Carried:* `BLOCKED` becomes a first-class run-log status alongside `completed`/`STALLED`, with `blocker_reason`,
  so the weekly reader can report BLOCKED-rate per agent and per brief-author. This is decision 4's own logic applied
  to its complement — today a worker that correctly refuses to guess logs identically to one that shipped.
- *Carried:* the panel may **advise** on an irreversible-tier action but never **authorize** one. Decision 9 governs.
- **Run-log spec addition:** `task_id`. The spec'd field list has `run_id`, which is per-run and cannot group a
  re-dispatch chain — so the bound above is unimplementable without it.

**17 · Work arrival.**
- Universal contract: every task carries `task_id`, goal, acceptance criteria (decision 7), and a durable record.
- Project-owned binding in `.claude/arrival.local.yml`. Beamix: `rail: linear`, record = session file + Linear
  comment. A sibling repo binds `rail: terminal` and nothing breaks.
- Beamix's Linear binding is **pull-only** — the CEO reads the ticket and posts the close-out inside a session Adam
  starts. No bridge, no webhook, no HMAC. Work still does not arrive while Adam is away; that is the known, accepted
  gap, deferred rather than smuggled in, per stop condition 4.
- *Carried:* rail unavailability degrades gracefully — `status: rail_unavailable` logged, never a hard block. Same
  contract already proven for Codex in `qa.js`.
- *Carried:* `schema-lint.js` validates `arrival.local.yml` — `rail` must resolve to a configured MCP server or the
  literal `terminal`.

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
| `model-routing.yml` + generator + `schema-lint` (decision 15) | Per-role model assignment. Frontmatter that disagrees with the resolved map fails the build; the weekly reader reports dead pins and available bumps. |
| Run-log `task_id` + `status: BLOCKED` (decision 16) | The two-panel-runs-per-task bound, and BLOCKED-rate per agent and per brief-author. A `jq` count, not a prose retry limit. |
| `arrival.local.yml` + `schema-lint` (decision 17) | Which rail supplies work per project. A `rail` naming an unconfigured MCP server fails the build — the exact class of failure that left 23 `mcp__linear__*` call sites dead. |

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

Added 2026-08-09 by the hook audit (`2026-08-09-hook-audit/SYNTHESIS.md`), each confirmed by reading the
implementing file:

- **63 rules are stated; 9 are enforced.** 40 are unenforced-but-mechanizable, 14 are inherently judgment and
  should stop being written as rules. **14% enforcement** is the measured size of the compilation problem.
- **`.claude/settings.json.proposed` would unwire the entire enforcement surface.** Zero `PreToolUse` and zero
  `Stop` registrations. CLAUDE.md documents it as the Bash allowlist, "pending apply." Applying it removes
  `pre-tool-use.sh` — the only blocking hook in the system — and `stop.sh`, the run log's append path.
  Irreversible by the tier map; checked by nothing.
- **No CI job runs `tsc`, `eslint`, `pnpm test`, `pnpm build`, or `pnpm audit`.** The gate is not merely
  forgeable — no code is executed against the diff by CI at all. A SHA-bound verdict is necessary, not sufficient.
- **A second forgery path in `qa-lead-pass.yml`:** its file-path tier-floor hard-fails only at `irreversible`. A
  `full`-tier floor prints an info line and lets a session file declaring `tier: lite` merge.
- **A sixth fabricated mechanism, live in `DECISIONS.md`** — an entry claims `stop.sh` hard-blocks merges without
  a QA PASS. `stop.sh` is hardcoded `exit 0` on every path, and a Stop hook cannot intercept a `git merge` Bash
  call in principle. The fabrication sits in the file that records what we decided.
- **The hook-count gap does not exist.** Live blocking hooks: Beamix 1, gsd-core 3, get-shit-done ~1. Three
  figures published earlier this session (78 vs 7, 23 vs 3, Beamix's 3) were all grep artifacts. **What GSD
  actually leads on is advisory context hooks** — 31 of its 47 inject context, cache state, or scan output rather
  than gating. Beamix has one. That class fits "constrain outcomes, not methods" better than any gate in this
  plan, and the plan does not contain it.
- **Declared-never-wired is not a Beamix pathology.** 5 of gsd-core's 31 hooks are shipped, config-gated,
  documented, and registered nowhere. An external team with a larger hook library has the same disease — the
  strongest available evidence that this is a missing-resolver problem, not a discipline problem.

## Open items

- **The skills cut list needs re-running.** Its 30 cuts used "wrong-stack for Beamix"; decision 12 changed
  the test to "useless in every project." That workflow ran before the decision.
- ~~**Smaller branches not yet grilled:** model routing per role, worker BLOCKED handling, how work arrives.~~
  **Closed 2026-08-09** — see decisions 15-17. Three new facts surfaced while grilling them, each the same
  declared-never-wired pattern as the `mcpServers:` and QA-gate findings above:
  - **`.mcp.json` contains exactly one server, `supabase`.** There is no `linear` entry, while 23 files call
    `mcp__linear__*`, `ceo.md` declares `linear` in its own `mcpServers`, and `ceo.md`'s step 7 — the mandated
    close-out of every ticket — is "post ONE Linear comment." Two of the three arrival rails named in `ceo.md`'s
    own description have no implementation in this repo. Work arrives today by Adam pasting into a terminal.
  - **`BLOCKED` is executable in exactly one file** — `coding.js`, which is on the not-being-built list. The only
    code that handles a BLOCKED return is scheduled for deletion. `schema-lint.js:285` lints for the *prose*
    describing BLOCKED, not for any handling of it, and the "max 3 retries" / "max 2 re-briefs" limits count nothing.
  - **The old BLOCKED escalation path was "Telegram binary-ping"** (`ceo.md:198`) — a rail that is not wired either.
    Decision 16 replaces it.
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
