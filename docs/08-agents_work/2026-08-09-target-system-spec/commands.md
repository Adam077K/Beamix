# Command set — target spec

**Surface:** Slash commands (`.claude/commands/*.md` project-level, `~/.claude/commands/*.md` global-level).
**Status:** PLANNING ONLY. Nothing here is built until Adam says build.
**Reads on:** the locked three-layer architecture (CEO / thinking layer / workers), the 2026-08-09
`AGENT-SYSTEM-REBUILD-PLAN.md` (T1-T5 deleted, four peer workflow scripts collapse into one parametrized
engine, run log v1, tier-floor provenance axis), and `.claude/agents/ceo.md` as the only place pipeline
*logic* is allowed to live.

---

## Current state (measured, with the commands you ran)

Commands run: `ls .claude/commands/`, `ls ~/.claude/commands/`, `diff` on every filename that exists in
both, full `Read` of all 23 files (13 project + 10 global), `Read` of `.claude/agents/ceo.md` (285 lines),
`AGENTS.md` (110 lines), `.claude/hooks/schema-lint.js` (361 lines), `.claude/qa-tier-floor.yml` (143
lines), `.claude/workflows/qa.js` (head), `.claude/agents/war-room/morning-digest.md` and `INDEX.md`,
`war-room-dashboard/server/collectors/{state,tmux,subagents}.ts`, `.github/workflows/qa-lead-pass.yml`
(grep), and `docs/08-agents_work/2026-08-09-AGENT-SYSTEM-REBUILD-PLAN.md` (246 lines) in full. Agent roster
counted directly: `ls .claude/agents/*.md` → **26 files**, matches the measured-state claim. Skills:
`ls .claude/skills/ | wc -l` → **149**, not 146 — one more disagreeing number, consistent with the warning
that these figures are unreliable until checked.

### 1. Two directories, three populations

| Population | Count | Location |
|---|---|---|
| Project commands | 13 | `.claude/commands/*.md` |
| Global commands | 10 | `~/.claude/commands/*.md` |
| Project-only (no global equivalent) | 3 | `board-meeting.md`, `color.md`, `name.md` |

`diff` on every name present in both directories:

| File | Result |
|---|---|
| `audit.md` | **Different** — project version rewrites Step 1 to name `code-reviewer` (real agent); global still says `codebase-mapper` writing `ARCHITECTURE.md`/`STRUCTURE.md`/`CONVENTIONS.md`/`TESTING.md`/`CONCERNS.md` (GSD-pipeline artifacts, archived) |
| `build.md` | **Byte-identical** |
| `daily.md` | **Byte-identical** |
| `debug.md` | **Byte-identical** |
| `design.md` | **Different** — project version is a 10-step, ~120-line pipeline (Refero → brainstorm → wireframe → 4-layer design → Design Critic loop); global is a 5-step ~50-line version. Neither matches `design-lead.md`'s actual tool list exactly. |
| `fix.md` | **Different** — project version correctly names `backend-engineer` / `frontend-engineer` / `database-engineer` / `ai-engineer` and the `systematic-debugging` skill; global still says a `debugger` agent maintaining `DEBUG.md` state (GSD agent, archived) |
| `plan.md` | **Byte-identical** |
| `research.md` | **Byte-identical** |
| `review.md` | **Byte-identical** |
| `ship.md` | **Byte-identical** |

**7 of 13 project commands are unedited copies of the global GSA-kit template.** They were never adapted to
Beamix at all.

### 2. The ghost-agent census

Grepping `Iris|Atlas|Scout|Guardian|Nexus|Build Lead|Product Lead|Growth Lead|Business Lead` across both
command directories:

| Ghost name | Project files | Global files | What it actually was |
|---|---|---|---|
| Iris | `daily.md` (7 refs) | `daily.md` | Persona from the *other* project's kit — `~/CLAUDE.md` (the personal GSA Startup Kit, a different codebase) still says `"How to start any session: Iris, [what I need]"`. Never existed in Beamix's roster. |
| Atlas | `debug.md` (3), `ship.md` (3) | same | Never existed in Beamix's roster. |
| Scout | `ship.md` (5) | same | Never existed in Beamix's roster. |
| Guardian | `ship.md` (3) | same | Never existed in Beamix's roster. |
| Nexus | `ship.md` (1) | same | Never existed in Beamix's roster. |
| Build Lead | `fix.md`, `build.md`, `plan.md` (6 refs) | `fix.md`, `build.md`, `plan.md` | Retired 2026-05-16 per `AGENTS.md`'s own text; folded into CTO. |
| Product Lead | `build.md`, `plan.md` (3 refs) | same | Retired 2026-05-16; folded into CPO. |

None of these 7 names appear in any of the 26 live `name:` frontmatter fields under `.claude/agents/`.
Cross-checked directly: `grep "^name:" .claude/agents/*.md` returns `adversary-engineer, ai-engineer,
backend-engineer, cbo, cco, ceo, cmo, code-reviewer, cpo, cto, data-engineer, database-engineer,
design-critic, design-lead, design-polisher, devops-engineer, frontend-engineer, product-designer,
qa-engineer, qa-lead, research-lead, researcher, security-engineer, supabase-cleaner, technical-writer,
test-engineer` — none of them Iris/Atlas/Scout/Guardian/Nexus/Build Lead/Product Lead.

### 3. `AGENTS.md` — the routing table itself is stale, not just the commands

`AGENTS.md` line 21 says the "legacy 9-lead model was retired on 2026-05-16" — then its own "GSD Execution
Agents" table (lines ~55-70) lists 12 agents (`executor.md`, `planner.md`, `debugger.md`, `verifier.md`,
`roadmapper.md`, `codebase-mapper.md`, `integration-checker.md`, `plan-checker.md`, `phase-researcher.md`,
`project-researcher.md`, `research-synthesizer.md`, `nyquist-auditor.md`) with file paths that do not exist —
they were archived to `.archive/agents/gsd-pipeline-2026-05-16/` per the top-level `CLAUDE.md`. Its "Routing
Examples" table (lines ~85-97) then uses `Build Lead`, `Growth Lead`, `Business Lead`, `Product Lead`,
`DevOps Lead`, `Data Lead` — the exact roles the same document just said were retired. The command drift is
a symptom of a routing table that documents its own history incorrectly, not an isolated commands bug.

### 4. What actually decides routing today: `ceo.md`, not the commands

`.claude/agents/ceo.md` (285 lines) is the real, current, internally-consistent source of truth for how work
is routed: entry via Linear ticket / Telegram DM / `claude /agent ceo`; T1-T5 topology classification;
Step-2 routing matrix (`agent:cto` / `agent:cpo` / `agent:cmo` / `agent:cbo` / `agent:qa-lead` /
`agent:research-lead` / `board-meeting` label / cross-functional / bug-fix rows); structured YAML brief;
parallel dispatch; return validation; QA-verdict gate; synthesis. **None of this matches what any of the 7
stale commands describe.** The commands and the agent they're supposed to invoke have diverged into two
different, un-reconciled pipelines, and only one of them (`ceo.md`) is being kept current.

### 5. `docs/08-agents_work/2026-08-09-AGENT-SYSTEM-REBUILD-PLAN.md` already locks the shape this spec must fit

Read in full (246 lines, same date as this task). Load-bearing decisions this spec must not contradict:

- **T1-T5 topology is deleted, not refined** (component 8). Default becomes "one worker, proportionate QA."
  Escalation to the thinking layer is a short *static* trigger list in the tier-floor YAML, shadow-mode
  logged for the first 20-30 tasks before anything computed gates anything.
- **`coding.js` and `research.js` are explicitly named as dead** ("What is NOT being built": *"`coding.js`
  and `research.js` as peer scripts"*). `design.js` is not separately named but is subsumed by the same
  argument (component 6: *"not four hand-maintained peer scripts"* — the four are `coding.js`, `design.js`,
  `research.js`, `qa.js`).
- **One parametrized fan-out engine, configured by data**, replaces the four scripts. `qa.js`'s shape and
  the thinking layer become two configs of that one engine, "validated by the same schema-lint."
- **The cross-critique round is explicitly dropped for generative decisions** (component 6): "heterogeneity
  of objective and of model family is the active ingredient, not headcount, not argument rounds." This
  directly contradicts `board-meeting.md`'s current Round-2 "cross-critique" step.
- **Cost is advisory, never a hard stop** (locked architecture, echoed in component 5's run-log design).
  `board-meeting.md`'s current "$3/meeting cap, 8/month max" hard limit contradicts this.
- **Run log v1**: append-only JSONL, one line per run — `run_id, agent, mechanism, model, tokens, cost_usd,
  tier, thinking_layer_invoked, qa_verdict, duration_s, structured_output_emitted`. STALLED envelope for
  runs that end with no structured output. `jq` is explicitly the entire UI — "No dashboard, no
  auto-retirement logic."
- **`schema-lint.js` gets wired to CI and extended** (component 4) — the existing pattern of
  cross-checking `skills:` against `MANIFEST.json` is the template to reuse for anything else that needs a
  live-registry check, including commands (this spec's own mechanism section below).

### 6. `schema-lint.js` never looks at commands

Read in full. `AGENTS_DIR = .claude/agents`; the script globs `.claude/agents/*.md` only. There is no
reference to `.claude/commands/` anywhere in the file. **Nothing in this repository validates that a
command's frontmatter or body references a real agent.** This is *why* the ghost-agent census in §2 above
was able to sit unnoticed through however many sessions produced these files.

### 7. `.claude/qa-tier-floor.yml` has no rule for `.claude/commands/**`

Read the full 143-line file. `.claude/agents/**` is `irreversible` ("bad prompt cascades across every
spawn"). `.claude/hooks/**` is `irreversible` ("execute on every action"). There is **no explicit pattern
for `.claude/commands/**`** — it falls through to the generic `**/*.md` catch-all at line 135, which is
`trivial` ("Default for markdown not caught above"). A command file, today, gets the *lowest* review tier
in the system — Haiku schema-lint only, and schema-lint doesn't even parse it (§6). This is the exact,
named, structural reason the ghost-agent drift in §2 was able to merge and stay merged.

### 8. `/color` is provably dead code — verified against its only real consumer

`war-room-dashboard/server/collectors/state.ts` line 51:
```ts
color: CONFIG.ceoColors[(n - 1) % CONFIG.ceoColors.length],
```
Color is computed **purely from the worktree index `n`** (parsed from `.worktrees/.registry` lines matching
`ceo-(\d+):(\d+)`). `subagents.ts` derives sub-agent color from `deriveColor(ceoColor, layer)` — a function
of layer depth, not of anything an agent said. **No file, table, or field anywhere reads a color value that
`/color` (or any agent) writes.** `/color`'s entire mechanism, as authored today, is "the agent states a
color word in chat" — nothing downstream consumes it. This is the literal shape of the disqualification rule
stated in the task brief ("any rule whose enforcement is 'the agent should remember' is disqualified by
construction"), independently rediscovered by reading the dashboard's own collector code.

### 9. `/name`'s only real consumer is a forgeable branch-slug heuristic

`grep -n "session" .github/workflows/qa-lead-pass.yml`: the QA gate locates a session file via
`docs/08-agents_work/sessions/*-<TASK_SLUG>.md` where `TASK_SLUG` is parsed from the PR branch name — not
from anything `/name` writes at session start. So `/name`'s value today is indirect: Adam is expected to
keep the slug he types into `/name` consistent with the branch name and the session-file basename by hand,
and CI checks the *branch* side of that convention, not the `/name` invocation itself. `state.ts`'s `task`
field (shown on the dashboard) is read from a plain file, `.worktrees/ceo-N.task` — a real, file-based
mechanism that nothing in `.claude/commands/name.md` currently writes to.

### 10. `board-meeting.md` is grounded in a real 908-line spec, but the spec predates the lock

`docs/08-agents_work/ORCHESTRATION.md` §2F (lines 458-583) is a real, detailed protocol — not vaporware —
and `board-meeting.md` correctly cites it. But the protocol's Round 2 is "cross-critique," and its hard caps
("$3 per meeting," "8 meetings per month max") are exactly what the 2026-08-09 rebuild plan (§5 above) now
overrides: no cross-critique round for generative decisions, cost advisory not a hard stop.

### 11. War-room Routines already do `/daily`'s job, on a different rail

`.claude/agents/war-room/morning-digest.md` (real, 110-line spec) fires autonomously at 05:35 Tue-Fri via a
signed HMAC trust-spec from the Cloudflare bridge, reads yesterday's EOD Sync from Mem0 + open Linear
tickets + `priority:high` Mem0 entries, and posts a 3-5 bullet digest as a Linear comment. `daily.md` (the
slash command) reimplements the same *idea* — "read memory, propose today's focus" — from scratch, citing
`Iris`, reading different files (`CLAUDE.md`, `.claude/memory/DECISIONS.md`,
`.claude/memory/CODEBASE-MAP.md` — none of which `morning-digest.md` reads), and producing a different
output shape. Two independently-maintained implementations of "what should Adam do today," one of them
already broken.

---

## Target state (the complete enumeration)

**12 commands total.** Every command is a thin, project-agnostic wrapper: it names one thing to invoke and
what to pass it. No command file contains pipeline logic — that lives exactly once, in the invoked agent's
`.md` file or the engine's config. This is the structural fix for §4 and §5 above: when there is only one
place a pipeline is described, there is nothing left to drift out of sync with it.

Two invocation kinds appear across the 12:

- **`type: agent, name: ceo`** — the command hands CEO a goal plus a `task_type_hint` (and any typed flags).
  CEO's own `Step 2` routing matrix (already correct, already current) decides which C-suite agent(s) it
  goes to. **`ceo` is the only legal value of `name` when `type: agent`** — see Mechanism section. This is
  the direct answer to "how does Adam dispatch a worker": he doesn't, ever, by name, from a slash command.
  He hands CEO a goal; CEO decides worker count (default: one, per rebuild-plan component 8) and whether to
  escalate.
- **`type: engine, config: <qa|thinking>`** — the command calls the one parametrized fan-out engine (rebuild
  plan component 6) directly, bypassing CEO ceremony, for the two cases where Adam wants the mechanism
  itself on demand: a binding QA verdict, or an independent-verdicts-then-synthesis decision. This is the
  direct answer to "how does Adam run QA" and "how does Adam invoke the thinking layer."

A third kind, `type: routine`, exists once (`/daily` re-fires `morning-digest`'s golden path in an
interactive, non-HMAC context). A fourth, `type: file-op`, exists once (`/name` writes session identity to a
real file the dashboard already reads). `/log` is `type: query` — canned `jq` filters against the run log,
consuming component 5 directly, adding no new storage or dashboard of its own.

### 1. `/audit`

| Field | Value |
|---|---|
| Purpose | Whole-codebase health sweep — architecture, quality, security. Produces a report and refreshes `.claude/memory/CODEBASE-MAP.md`. Distinct from `/review`: whole-repo scope, informational output, never blocks a merge. |
| Argument hint | `[focus: security \| quality \| architecture \| all]` (default `all`) |
| Invokes | `type: agent, name: ceo` |
| Passes | `task_type_hint: audit`, `focus: <arg>` |
| Real mechanism | CEO's existing "Cross-functional" routing row — spawns CTO (for `code-reviewer` in mapper mode) and QA-Lead (for `security-engineer`) in parallel; each tier-classifies its own piece. No new CEO logic needed. |
| Output | Report format unchanged from current `audit.md` (Critical / High / Medium / Low / Tech Debt Summary / Recommended Next Steps), written by whichever agent CEO routes to, not by the command. |

### 2. `/board-meeting`

| Field | Value |
|---|---|
| Purpose | Invoke the thinking layer directly for any decision that benefits from independent perspectives before committing — not gated to "strategic" or "irreversible" anymore, since the thinking layer is invokable-not-always-on by design. Name kept (Adam's established pattern per `feedback_board_meeting_style.md`); mechanism rewritten. |
| Argument hint | `<topic-slug> [--decision-type=vendor\|strategic\|technical]` |
| Invokes | `type: engine, config: thinking` |
| Passes | `topic`, `decision_type` (default `strategic`), `context_files` (Adam-supplied or CEO-inferred) |
| Real mechanism | Engine's `thinking` config: framing → **N independent verdicts from different objective functions** (feasibility / cost / risk / user-impact / operator-experience — not fixed "personas") → **fresh-context synthesis with no round the synthesizer's inputs were exposed to each other in**. **Round 2 cross-critique is deleted** — direct consequence of the locked decision in rebuild-plan component 6. On `decision_type: irreversible`-adjacent topics, at least one verdict is routed cross-model-family. |
| Cost | **Advisory only** — visible in the run log's `cost_usd` field per invocation, never a hard block. The old "$3/meeting, 8/month" caps are deleted; if Adam wants a budget signal, `/log` surfaces cumulative `thinking`-config spend on request. |
| Veto | Adam-veto checkpoint unchanged: `locked_decisions` do not enter `DECISIONS.md` until Adam replies `accept`. Each `locked_decision` still carries mandatory `source_persona_round` (now `source_verdict_id`) traceability, Zod-validated — the one anti-hallucination guard from the old protocol that has nothing to do with cross-critique and is kept. |
| Output artifact | `docs/08-agents_work/board-meetings/YYYY-MM-DD-<topic-slug>.md` — same location, one fewer round in the body. |

### 3. `/build`

| Field | Value |
|---|---|
| Purpose | New feature or capability, start to finish. |
| Argument hint | `[feature description] [--deploy]` |
| Invokes | `type: agent, name: ceo` |
| Passes | `task_type_hint: build`, `deploy_requested: <true if --deploy>` |
| Real mechanism | CEO's own Step-1-through-7 procedure, unchanged by this command. If CEO classifies the work Full/Irreversible tier, it (not the command) chains into the engine's `qa` config before merge — per the existing "T5-coding output always chains into `qa.js`" rule, now phrased as "any Full/Irreversible-tier code change chains into the engine's `qa` config." |
| Notes | The command file is ~15 lines. It does **not** re-describe worktree strategy, worker parallelism, or merge confirmation — all of that is `ceo.md`'s job, described once. |

### 4. `/daily`

| Field | Value |
|---|---|
| Purpose | On-demand day-ahead brief, printed to the terminal, for when Adam is already in an interactive session and doesn't want to wait for the 05:35 cron fire or leave Claude Code to read Linear. |
| Argument hint | none |
| Invokes | `type: routine, name: morning-digest` |
| Passes | `mode: interactive` (skips the Routine-only HMAC verification, `audit_log` writes, and Monday suppression check — those exist for the unattended cron path only) |
| Real mechanism | Re-runs `morning-digest.md`'s own "Golden path" steps 3-7 (read EOD Sync from Mem0 → read open Linear sprint tickets → read `priority:high` Mem0 entries → synthesize and rank → draft 3-5 bullets) in-session, printing the same output format to the terminal instead of posting a Linear comment. **One implementation, two entry points** — this is the direct fix for §11 above: `daily.md` no longer contains its own copy of "read memory, propose focus." |
| Output | Same format `morning-digest.md` already defines: `**Morning Digest — [DAY], [DATE]**` + up to 5 ranked bullets + Blockers + Carry-forward. |

### 5. `/design`

| Field | Value |
|---|---|
| Purpose | UI/UX work — new page, redesign, component, design-system change, polish pass, or visual audit. |
| Argument hint | `[component, page, or screen description]` |
| Invokes | `type: agent, name: ceo` |
| Passes | `task_type_hint: design` |
| Real mechanism | CEO routes to CPO → Design-Lead (Design-Lead reports under CPO per the locked org chart). All pipeline detail — reference gathering via Refero, brainstorm-before-code for NEW_PAGE/REDESIGN, layered design, Frontend-Developer handoff, Design-Critic loop, WCAG gate — lives in `design-lead.md` and `design-critic.md`, not in this command. Today's `design.md` duplicates ~100 lines of that; the target file duplicates none of it. |

### 6. `/fix`

| Field | Value |
|---|---|
| Purpose | Bug fix — obvious or non-obvious, diagnosis-first when needed. Absorbs everything `/debug` used to do (see Changes, below). |
| Argument hint | `[bug description]` |
| Invokes | `type: agent, name: ceo` |
| Passes | `task_type_hint: fix` |
| Real mechanism | CEO's routing matrix already has exactly one row for this: *"Bug fix / debugging → CTO (CTO picks the right engineer — backend/frontend/database/ai — with a diagnosis-first brief; uses `systematic-debugging` skill)."* The `systematic-debugging` skill (confirmed present at `.claude/skills/systematic-debugging/`) already contains the full evidence-gathering → falsifiable-hypothesis → binary-search → root-cause procedure that today's `debug.md` duplicates under the name "Atlas." One copy, correctly wired. |

### 7. `/log`

| Field | Value |
|---|---|
| Purpose | **New.** Inspect the run log (rebuild-plan component 5) on demand, ad hoc, between the weekly cron reader's reports. Direct answer to "how does Adam check the run log." |
| Argument hint | `[recent \| stalled \| cost \| mechanisms] [--since=<days>]` |
| Invokes | `type: query` (no agent, no engine — reads a file) |
| Passes | n/a — runs locally |
| Real mechanism | Canned `jq` filters against the run-log JSONL (path owned by the hooks/run-log surface — see Open Questions). No new storage, no dashboard — this command *is* the promised "`jq` as the entire UI," made typeable. |
| Canned queries | `recent` → `jq -s '.[-20:]' <log>` (last 20 runs, all fields). `stalled` → `jq 'select(.status=="STALLED")' <log>` (runs that ended with no structured output). `cost` → `jq -s '[.[] | select(.duration_s? and (.timestamp > (now - (86400 * (\$since // 7))))) ] | group_by(.agent) | map({agent: .[0].agent, total_cost: ([.[].cost_usd] | add)})' <log>` (cost by agent over the window). `mechanisms` → `jq -s 'group_by(.mechanism) | map({mechanism: .[0].mechanism, invocations: length, thinking_layer_invoked: ([.[] | select(.thinking_layer_invoked)] | length)})' <log>` — the exact "mechanisms with zero invocations in N days" check the weekly cron also runs, available on demand. |

### 8. `/name`

| Field | Value |
|---|---|
| Purpose | Set or rename the current session's identity — the slug used for the branch, the worktree, and the session file. |
| Argument hint | `[agent-type]-[task-slug]` |
| Invokes | `type: file-op` |
| Passes | n/a |
| Real mechanism | Writes the slug to `.worktrees/ceo-N.task` — the exact file `war-room-dashboard/server/collectors/state.ts` already reads for the dashboard's `task` field (confirmed by reading the collector, §9 above). This gives `/name` a **verified, real** downstream consumer for the first time, instead of "the agent says a string in chat and everyone is supposed to remember it." Convention unchanged: this slug should also become the branch name and the session-file basename (`docs/08-agents_work/sessions/YYYY-MM-DD-[agent]-[slug].md`), which is what `qa-lead-pass.yml`'s branch-slug heuristic actually checks — the command doesn't enforce that match today; see Open Questions on whether it should write both. |
| `/color` | **Cut.** See Changes — no rewrite exists because there is nothing left for it to do. |

### 9. `/plan`

| Field | Value |
|---|---|
| Purpose | Produce a plan — task breakdown, worktree names, wave ordering — without executing it. Distinguishes from `/build` by one flag: nothing gets built until Adam separately says go. |
| Argument hint | `[feature or sprint description]` |
| Invokes | `type: agent, name: ceo` |
| Passes | `task_type_hint: plan`, `execute: false` |
| Real mechanism | Same CEO routing as `/build`, with `execute: false` meaning CEO stops after producing the task breakdown (today's `plan.md` Step 4 output) instead of proceeding to Step 3/dispatch. If the idea is vague, CEO's existing PRD-first branch (route to CPO) applies unchanged. |

### 10. `/research`

| Field | Value |
|---|---|
| Purpose | Sourced research on any question — competitive, market, technical, or user research. |
| Argument hint | `[topic or question]` |
| Invokes | `type: agent, name: ceo` |
| Passes | `task_type_hint: research` |
| Real mechanism | CEO's routing matrix sends this straight to Research-Lead (reports to CEO directly, per the locked org chart — not nested under any C-suite). Research-Lead's own decomposition-into-threads / parallel-researcher / synthesis / confidence-level procedure is unchanged and lives in `research-lead.md`, not in this command. |

### 11. `/review`

| Field | Value |
|---|---|
| Purpose | Fast, ad hoc, binding QA verdict on a diff — the same gate that blocks a merge, run early and on demand, without a full CEO cycle. Direct answer to "how does Adam run QA." |
| Argument hint | `[git-ref-range] [--tier=full\|irreversible]` (default ref: `origin/main...HEAD`; default tier: auto-read from `.claude/qa-tier-floor.yml` against the changed files) |
| Invokes | `type: engine, config: qa` |
| Passes | `ref`, `tier`, `context` (optional freeform) — the exact three fields `qa.js`'s current arg-normalizer already expects (`ref`, `tier`, `context`), confirmed by reading its header. |
| Real mechanism | Engine's `qa` config: parallel dimension reviewers → 3 adversarial verifiers on block-eligible findings only (P1 always, P2 at irreversible) → Opus judge → binding PASS/BLOCK. Same mechanism CEO chains into automatically before merge on Full/Irreversible-tier code (see `/build`) — this command exposes it directly so Adam can run it *before* asking CEO to do anything, e.g. on a branch nobody has briefed CEO about yet. |
| Output | Per rebuild-plan component 3: emits `qa-verdict.json {commit_sha, tier, verdict, findings_hash}` bound to the actual commit SHA under review — not a hand-typed string a CI grep can be fooled by. |

### 12. `/ship`

| Field | Value |
|---|---|
| Purpose | Take existing, already-QA'd work and put it in production. Distinct from `/build --deploy`: no new work is dispatched, this is purely the deploy-and-verify path for something already sitting on a branch. |
| Argument hint | `[feature-name or branch]` |
| Invokes | `type: agent, name: ceo` |
| Passes | `task_type_hint: ship`, `target_ref: <arg>` |
| Real mechanism | CEO confirms `qa_verdict: PASS` is present (re-running `/review`'s engine `qa` config itself if it isn't), then routes to `devops-engineer` for the deploy. No `Scout` / `Guardian` / `Nexus` — those names are deleted, not renamed; the actual gate is the same engine `qa` config `/review` uses, and the actual deploy is a real worker (`devops-engineer.md`) that exists today. Rollback-on-failed-health-check behavior moves into `devops-engineer.md`'s own return contract, described once. |

---

## Changes: kept / cut / merged / added

### Project set (13 → 12)

| Command | Disposition | Reason |
|---|---|---|
| `audit.md` | **REWRITE** | Thin out to a `task_type_hint` pass-through; delete the hard-coded direct-dispatch-to-Security-Engineer step, which violates the Layer Contract ("CEO does not spawn workers directly when a C-suite owns the domain") — let CEO's own cross-functional routing row do it. |
| `board-meeting.md` | **REWRITE** | Real mechanism, wrong shape: drop the Round-2 cross-critique (contradicts the locked no-cross-critique decision), soften the $3/8-per-month hard cap to advisory (contradicts the locked cost-is-advisory decision), route through the one parametrized engine's `thinking` config instead of the bespoke `synthesizer.md` + 6 fixed personas. Name kept — established, positive pattern (`feedback_board_meeting_style.md`). |
| `build.md` | **REWRITE** | Byte-identical to the stale global GSA-kit template — references Product Lead / Build Lead (retired 2026-05-16). Thin out to a pass-through; all pipeline detail already lives correctly in `ceo.md`. |
| `color.md` | **CUT** | Verified dead code (§8): `war-room-dashboard`'s only color consumer computes color purely from worktree index `n`; nothing reads a value `/color` would produce. A command whose entire effect is an agent narrating a word in chat, consumed by nothing, is exactly the "agent should remember" pattern disqualified by construction. |
| `daily.md` | **REWRITE** | Byte-identical to the stale global template (references "Iris," which never existed in Beamix's roster). Reimplements — with different files, different logic — what `morning-digest.md` (a real, already-scheduled Routine) already does. Rewrite to re-run `morning-digest.md`'s own golden path in an interactive context rather than maintaining a second copy. |
| `debug.md` | **CUT — merged into `/fix`** | `ceo.md`'s routing matrix has exactly one row for "Bug fix / debugging," not two. `debug.md`'s entire 4-phase hypothesis-testing procedure is already captured as the `systematic-debugging` skill, which `fix.md` already references correctly. Two command names for one pipeline is exactly the kind of duplication that drifted: `debug.md` kept citing "Atlas" while `fix.md` (independently edited) was updated to the real roster. |
| `design.md` | **REWRITE** | Real, detailed, ~120-line pipeline that mostly matches `design-lead.md`'s actual tool list (Refero, Stitch, Pencil, Playwright — all genuinely in the MCP table) but duplicates it wholesale instead of deferring to it. Thin out; the pipeline detail belongs in `design-lead.md` alone. |
| `fix.md` | **KEEP, thin out** | The one project-customized command that is *already correctly aligned* to `ceo.md`'s real routing matrix (names `backend-engineer`/`frontend-engineer`/`database-engineer`/`ai-engineer` and `systematic-debugging` correctly). Trim the re-description of CTO's dispatch logic — it duplicates `ceo.md` even though it happens to currently agree with it, which is still a drift risk. |
| `name.md` | **REWRITE** | Currently pure convention (no verified write path). Rewrite to write `.worktrees/ceo-N.task` — the file the dashboard already reads (§9) — giving it a real, checkable side effect. |
| `plan.md` | **REWRITE** | Byte-identical to the stale global template — references Product Lead / Build Lead. Thin out to a pass-through with `execute: false`. |
| `research.md` | **REWRITE** | Byte-identical to the stale global template. Content is not wrong (no ghost agents), but it duplicates `research-lead.md`'s own decomposition procedure instead of deferring to it. Thin out. |
| `review.md` | **REWRITE** | Byte-identical to the stale global template. Currently describes a bespoke "Code Reviewer + Security Engineer in parallel" pipeline that predates the engine. Rewrite to call the engine's `qa` config directly — the same binding gate `/build`/`/ship` chain into automatically, exposed for ad hoc use. |
| `ship.md` | **REWRITE** | Byte-identical to the stale global template — the worst offender: `Scout`/`Guardian`/`Nexus`, all three never in Beamix's roster. Full rewrite to route through CEO → engine `qa` config → `devops-engineer`, all three of which are real. |

**New:** `log.md` — the run log has no interactive query surface anywhere else in the system; without it, `jq
as the entire UI` (rebuild-plan component 5) is only true for whoever remembers the field names and writes
the filter by hand each time.

### Global set (10 files)

Every one of the 10 global commands is either byte-identical to a project file already listed above
(`build`, `daily`, `debug`, `plan`, `research`, `review`, `ship` — 7 files) or a *different, also-broken*
version of one (`audit`, `design`, `fix` — 3 files, diffed individually in §1). **None of the 10 survive
as-is.** Under the target propagation model (see Format & schema, below), the global directory becomes the
single canonical copy of all 12 target commands — the 3 project-only files (`board-meeting`, `color`,
`name`) either promote to global (`board-meeting`, `name`) or get cut (`color`) — and the 10 stale files are
replaced wholesale, not patched.

---

## Format & schema

### Frontmatter contract (every command file)

```yaml
---
name: build                        # MUST equal the filename minus .md — lint-checked
description: >                     # <=100 chars rendered, shown in Claude Code's / picker
  Start a new feature end-to-end via CEO.
argument-hint: "[feature description] [--deploy]"
invokes:
  type: agent                      # agent | engine | routine | file-op | query
  name: ceo                        # for type:agent this MUST be "ceo" — no other value is legal
  # for type:engine: config: qa | thinking
  # for type:routine: name: <filename under .claude/agents/war-room/*.md, minus .md>
passes:                            # fields forwarded to the invoked target — documents the contract,
  task_type_hint: build            # doesn't execute anything itself
  deploy_requested: "{{flag:--deploy}}"
---
```

Fields beyond Claude Code's native `description` / `argument-hint` (`invokes`, `passes`) are consumed only
by this project's own lint tooling (see Mechanism, below) — Claude Code itself ignores unrecognized
frontmatter keys, so this is additive, not a fork of the command format.

### Body convention

Target length: **15-30 lines.** A body contains, in order: (1) one sentence restating the purpose, (2) the
literal line "Invokes: `<type> <name/config>`, passing `<fields>`" copy-pasted from the frontmatter — human-
readable restatement, not new information, (3) one usage example, (4) nothing else. Any pipeline detail
(steps, agents dispatched, output format) belongs in the invoked agent's `.md` file or the engine's config,
never in the command body. This is the single structural fix for the drift documented in Current State §4:
when a command body cannot contain pipeline logic, it cannot drift out of sync with the agent that owns that
logic, because there is nothing in the command left to go stale.

### Propagation: one canonical set, not global-plus-project-extensions

Per rebuild-plan component 9, the canonical agent-system repo is the source of truth, propagated by
`gsa-sync --apply`. Applied to commands specifically:

- The **canonical repo** owns exactly these 12 files, once.
- `gsa-sync --apply` writes them to **`~/.claude/commands/`** (global) — because every one of the 12 is
  project-agnostic: it names `ceo` (a role every synced project has, by definition of having adopted this
  org shape) or an engine config (also universal), never a project-specific worker name.
- **Beamix's project-level `.claude/commands/` directory becomes empty** — zero files — after migration.
  There is no project-specific command content left to hold, because project flavor (which personas exist
  for `/board-meeting`'s `decision_type` branching, which domains route where in CEO's matrix) lives in
  **data files** the commands read at invoke time, not in duplicate command markdown. This is the direct
  answer to "how do project and global commands relate": they don't, after this migration — there is one
  set, it lives globally, and per-project variation is a config file's job, never a second copy of a `.md`
  command.
- If a future project genuinely needs a command with no canonical equivalent (a project without a CEO-style
  org wouldn't want any of these 12 at all), it goes in that project's own `.claude/commands/` under a name
  that does not collide with the canonical 12 — collision would mean the project file silently shadows the
  global one, reintroducing exactly the two-copies-of-one-command problem this migration removes.
- **Until `gsa-sync --apply` actually exists and has been run** (rebuild-plan sequence step 9, explicitly
  last), this propagation is aspirational — Adam must manually mirror the 12 files into both locations,
  which is the same manual-copy failure mode that produced today's stale global set. Flagged in Open
  Questions.

---

## The mechanism that keeps this honest

Four artifacts, all extending mechanisms the rebuild plan already commits to rather than inventing new ones.

### 1. `.claude/qa-tier-floor.yml` gets an explicit rule for `.claude/commands/**`

Today (§7 above) command files fall through to the generic `**/*.md` → `trivial` catch-all — the lowest
tier in the system, lower than a memory file. Add, immediately after the existing `.claude/agents/**` rule
(first-match-wins ordering matters):

```yaml
  - pattern: ".claude/commands/**"
    tier: irreversible
    reason: "Entry-point routing; a command that names a dead agent misfires on every single Adam-initiated invocation, with no other check in the loop before it reaches CEO"
```

Same reasoning the file already applies to `.claude/agents/**` ("bad prompt cascades across every spawn")
and `.claude/hooks/**` ("execute on every action") — a command is exactly as blast-radius-wide as either,
and today gets neither's protection.

### 2. `schema-lint.js` is extended to lint `.claude/commands/*.md`, not just `.claude/agents/*.md`

The script already has the exact pattern needed — it cross-checks `skills:` frontmatter against
`MANIFEST.json`'s live skill set (lines 212-226 of the file as read) and fails the file if a referenced
skill doesn't resolve. Add a second entry point, `lintCommandFile()`, invoked over `.claude/commands/*.md`
in the same run, that:

1. Parses `invokes.type` and `invokes.name` (or `invokes.config`) from frontmatter using the same
   no-dependency YAML parser already in the file.
2. Builds the live registry at lint time: for `type: agent`, the only legal `name` is the literal string
   `ceo` — checked as a hard equality, not a set membership, because the Layer Contract makes every other
   value illegal by construction, not just currently-nonexistent. For `type: engine`, `config` must be a key
   present in the engine's config manifest (owned by the workflows/engine surface — path not yet fixed, see
   Open Questions; the lint fails closed — treats an unresolvable manifest path as a lint failure, not a
   skip). For `type: routine`, `name` must match a filename under `.claude/agents/war-room/*.md` minus
   `.md`. For `type: file-op` or `type: query`, no registry check applies — this is only for `/name` and
   `/log`.
3. Checks `name:` frontmatter equals the filename, same rule already applied to agents.
4. Fails (`process.exit(1)`) on any unresolved reference, with the same `✗ path — FAIL` / issue-list output
   format already used for agents — one lint report, two file populations.

This is the mechanism that would have caught every one of the 7 ghost-agent references in §2 before merge:
`Iris`, `Atlas`, `Scout`, `Guardian`, `Nexus`, `Build Lead`, `Product Lead` are all plain-English prose today,
not a structured `invokes:` reference — which is itself part of the fix. A command file that names its
target only in a sentence ("Atlas investigates a bug...") is unlintable by construction; a command file that
declares `invokes: {type: agent, name: ceo}` in frontmatter is checked automatically, every time, the same
way `skills:` already is.

### 3. Both checks are wired into the existing CI job, not a new one

`.github/workflows/qa-lead-pass.yml` already exists and is where the tier-floor lookup + schema-lint should
run per rebuild-plan component 4 ("wired to CI"). No new workflow file — command-file changes hitting
`irreversible` tier (via mechanism 1) means they get the same `full` review pipeline plus 2-of-3 multi-judge
plus Adam sign-off that `.claude/agents/**` changes already require. This closes the loop: today a command
edit gets *less* scrutiny than a typo in a skill's `SKILL.md`; after this change it gets *more* scrutiny than
almost anything except a DB migration, an agent definition, or a hook.

### 4. `gsa-sync --apply`'s receiving-project re-classification (component 9) re-runs both checks per project

Per the rebuild plan, `gsa-sync --apply` "re-run[s] schema-lint and tier classification against the
**receiving** project and refuse[s] on failure." Once mechanism 2 exists, this means a canonical-repo
command edit that references a name not present in *that specific receiving project's* `.claude/agents/`
directory (in the rare case a project's roster genuinely differs) fails the sync, not just Beamix's own CI.
This is the second, independent enforcement point the task brief asks for — the same reference is checked
once at authoring time (mechanism 3, this repo) and again at every propagation boundary (this mechanism, all
~10 receiving repos) — matching the "hook fires at every spawn depth, a convention does not" logic already
locked for `pre-tool-use.sh`.

---

## Open questions

- **Engine config manifest path.** This spec assumes a file (proposed: `.claude/engine/configs.json`) that
  lists valid `config:` values (`qa`, `thinking`) for `type: engine` commands to reference and for
  `schema-lint.js`'s extension to validate against. The engine itself — the "one parametrized fan-out
  engine" from rebuild-plan component 6 — is a different surface's spec to write; this document only
  consumes its existence and needs its manifest path confirmed there.
- **Run log file path and writer.** `/log`'s canned `jq` queries assume a single JSONL file
  (rebuild-plan component 5 proposes `stop.sh` as the appender). This spec did not verify where that file
  will physically live — needed before `/log`'s body can hard-code a path instead of a placeholder.
- **Whether `/name` should also enforce branch-name / session-file-basename consistency**, not just write
  `.worktrees/ceo-N.task`. Today `qa-lead-pass.yml` checks the branch-name side of that convention
  independently; `/name` writing the task file doesn't guarantee the three stay in sync. Left open rather
  than inventing a fourth file write without confirming the dashboard and CI collectors agree on one shape.
- **Cross-project variance in the routing matrix.** All 12 commands assume `task_type_hint` values
  (`build`/`fix`/`design`/`research`/`audit`/`plan`/`ship`) mean the same thing in every one of the ~10
  projects this system will sync to — i.e., that every receiving project's CEO has a routing matrix with
  equivalent rows. Nobody has checked this against a non-Beamix project; flagged as a rebuild-plan-level open
  question ("Cross-project fit... nobody checked whether these tier floors and defaults suit the other ~9
  projects"), inherited here unresolved.
- **`/board-meeting`'s `decision_type` → persona-set data file** does not yet have a defined location or
  schema. This spec names the requirement (project-specific objective-function sets should be data, not
  duplicate command files) without designing the file — that belongs with whichever surface owns the
  thinking-layer engine's config shape.
- **Whether `gsa-sync --apply` landing (rebuild-plan sequence step 9, explicitly last) should block shipping
  this command rewrite**, or whether Adam manually double-writes the 12 files into both `.claude/commands/`
  and `~/.claude/commands/` in the interim. The spec recommends the latter (ship the correct 12 now, migrate
  the *location* later) but this is a sequencing call for whoever executes the build, not this planning
  document.
