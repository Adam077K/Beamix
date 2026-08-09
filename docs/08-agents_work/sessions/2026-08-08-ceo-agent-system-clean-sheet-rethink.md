---
date: 2026-08-08
role: ceo
session: ceo-1-1786220343
task: Reframe the agent-system initiative as a clean-sheet re-architecture of the ENTIRE agent system as a cross-project asset; lock scope/home/sequencing with Adam; run the ground-truth audit of the 9 surfaces prior research never covered
tier: irreversible
qa_verdict: N/A (research + planning session — no code merged; one docs-only PR opened)
pr: "#193 (docs-only, risk:trivial)"
branch: ceo-1-1786220343 (this file); docs/wave-handoffs-2026-08-08 (PR #193)
status: IN PROGRESS — three workflow runs in flight at time of writing
---

# CEO Session — agent system, clean-sheet re-architecture

## Read this first

**The mission changed this session.** Prior sessions treated the agent-system work as Beamix
infrastructure and executed it as a queue of discrete hardening items. Adam corrected that framing
directly: the agent system is **everything** — agents, skills, commands, hooks, prompts, workflows,
orchestration, memory, worktrees, sandboxes, propagation — and it is a **cross-project asset used in
~10 projects**, not Beamix tooling. It is considered old (designed 2026-05-16), and the goal is to
**learn from the best external agentic systems, take what is good, and produce one complete refreshed
system**, not to apply 17 patches over several months.

If you are picking this up: the deliverable is a redesigned system, not a closed ticket queue.

## Locked decisions (Adam, 2026-08-08, via AskUserQuestion)

1. **Clean-sheet re-architecture.** The shape itself is in question — the C-suite metaphor, the T1-T5
   topology, the 26-agent / 146-skill roster, the skill-corpus format. The 17 capability-gap-map
   recommendations are *input*, not the plan.
   **Two prior constraints are LIFTED:** (a) "net agent/skill counts must not rise"; (b) "T1-T5 tier
   names and C-suite role names are frozen." Both are encoded verbatim in
   `.claude/workflows/system-redesign.js` (unmerged, PR #190 branch) and must be relaxed before that
   script is reused.
2. **The canonical system moves to its own repo**, with its own proportionate gate. **gsa-core's sync
   becomes the single propagation path** (finally run with a real `--apply`). The hand-maintained
   `GSA_startup_kit` twin is retired.
3. **Ground truth before design.** Audit the 9 surfaces prior research never covered, plus a subtract
   pass, before designing anything.

## Why the initiative felt incoherent (root cause, worth not repeating)

Two separate research efforts were running with no document stating how they relate, and execution had
already started on one of them:

- **GSA Startup Kit Field Audit** (artifact `7077187b`) — *"what do I actually have installed,
  everywhere?"* Found that Beamix's `.claude/` **is** the reference implementation (content-identical
  to gsa-core), while `~/.claude` is the genuinely broken thing: still the old 12-persona roster,
  `~/CLAUDE.md` still instructs every session to open with "Iris, [what I need]", and `/daily`,
  `/debug`, `/ship` invoke agents that no longer exist. gsa-core's sync has **never been run with
  `--apply` anywhere**; Beamix alone has ~54 pending updates.
- **Capability Gap Map** (artifact `7399b50f`) — *"what capabilities am I missing vs 14 external
  frameworks?"* 17 evidence-gated recommendations in 4 waves.

**They converge and neither says so.** Gap-map item **#15** (install/update/uninstall + packaging) sits
in Wave 4 as a future nice-to-have, while the field audit shows *two half-built versions of exactly that*
already competing in production. Until propagation is settled, every improvement lands in Beamix only
and reaches the other ~8 projects by hand.

## The framing that was missing

A redesign needs four passes. Before this session, one had been done.

| Pass | State |
|------|-------|
| **Subtract** — what is dead, duplicated, or wrong | Barely started. `system-redesign.js` exists for this but is unmerged and constraint-bound |
| **Adopt** — what is proven elsewhere and worth taking | **Done** — the gap map's 17 recommendations |
| **Re-architect** — is the *shape* right at all | **Never asked** |
| **Propagate** — one mechanism, actually applied | Two half-built mechanisms competing |

And the gap map inventoried **5 of ~14 surfaces**. Covered: agent roster, skill corpus, command set,
hook library, sandbox/permissions. **Not covered:** orchestration topology + workflow layer, memory
system, QA gate + risk-tier model, worktree/isolation protocol, prompt layer, settings + bash allowlist,
MCP configuration, model routing, propagation.

## Structural observation: venue, not just quality

Wave 1 produced 9 QA rounds across 3 items, 38 confirmed findings, and **zero merges**. Some of that is
genuine defect density. But part is **venue**: `.claude/agents/**`, `.claude/hooks/**`, and
`.claude/workflows/**` all floor at **irreversible** tier in `.claude/qa-tier-floor.yml`, so a commitlint
tweak draws the full adversarial fleet plus human sign-off. A cross-project asset with its own lifecycle
plausibly wants its own repo and its own proportionate gate — which is decision 2 above.

## Corrections made to the record this session

- **Item #5 shipped** as PR #192 (`6e28f31`). The Wave 2-4 handoff said "not yet pushed or PR'd."
- **All four parked branches are pushed** to origin (`fix/hook-compound-command-decomposition` @ `18e637a`,
  `chore/gh-actions-sha-pinning` @ `ccdd5ce`, `feat/commitlint-enforcement` @ `c8735be`,
  `feat/spec-conformance-and-qa-lead-accuracy` @ `85ae1f9`). No PRs on any.
- **Prime Agent research was wrongly dismissed.** The prior handoff recorded it as "not related to
  Beamix's own agent system, no further action needed." Under a clean-sheet re-architecture of a
  coding-agent system that is exactly backwards. It was also only relayed in conversation and never
  written to a file, so it was lost entirely and had to be re-run. **Lesson: research delivered only
  in conversation does not exist.**

## Item #8 disposition (decided earlier this session)

Scaled down to **advisory-only**: `spec_conformance` stays as a dimension inside `qa.js`'s findings
output; the `qa-lead-pass.yml` CI frontmatter requirement is **dropped, not deferred**. Full rationale
in `.claude/memory/DECISIONS.md`. Not executed — decision recorded only.

## Work in flight at time of writing

| Run | What | Notes |
|-----|------|-------|
| ~~`wf_50fc94dd-a19`~~ | Wave 1 rework | **FAILED — see below.** All 3 build agents ran to completion (540k tokens, 198 tool uses, 17 min) but none called StructuredOutput, so the pipeline dropped every slice and the red-team and fix stages never ran |
| `wf_30f1b97b-d8a` | Architecture audit of the 9 uncovered surfaces | Internal-only, evidence-gated (every claim cites a real path + verbatim quote), cross-cutting coherence pass, 3 adversarial verifiers, Opus synthesis |
| `wf_1222755d-edd` | Prime Agent research, re-run | Scoped as redesign input; explicitly asks which patterns are **inapplicable** because they need RL training or self-hosted models |

## Wave 1 rework failure — `wf_50fc94dd-a19` (and why it is evidence, not just a setback)

**What happened:** 3 build agents, one per slice, each with a long brief carrying the full prior-defect
anti-requirement list and a schema demanding measured proof per defect. All three worked (198 tool uses,
540k subagent tokens, ~17 min) and all three **completed without ever calling StructuredOutput**. The
journal contains 3 `started` entries and 0 `result` entries. With no structured return the pipeline
dropped all slices, so the red-team and fix stages — the entire point of the run — never executed.

**Token math:** 540k / 3 ≈ **180k tokens per agent**. `.claude/memory/` already documents this exact band:
*"Worker stalls — atomic commits: large workers stall at high tokens; brief atomic commits + SendMessage
resume"* and *"Design agents stall ~100-185k tokens."* The failure landed squarely inside a documented,
known threshold.

**CEO design error:** the brief was long, the schema was heavy (per-defect proof arrays), and there was no
incremental checkpoint — a single long-running agent per slice with an all-or-nothing return. The
mitigation was already written down in memory and was not applied.

**Why this is evidence for the redesign:** a rule that lives in a memory file and does not change
behaviour is functionally the same failure class the architecture audit is hunting — unenforced prose.
Memory that must be *remembered* is not a mechanism. This belongs in the audit's `unenforced_rule` /
`systemic_patterns` evidence, and any redesigned system should make the worker-brief size and
checkpoint discipline structural (schema/runtime enforced), not advisory.

**Work preserved, not lost.** All three branches were committed and pushed with explicit
`[UNREVIEWED SALVAGE]` commit subjects — unreviewed, ungated, not merge-ready:

| Branch | State |
|--------|-------|
| `fix/hook-decomposition-v2` @ `39aa2c8` | modified `.claude/hooks/pre-tool-use.sh` + new `.claude/hooks/tests/` |
| `chore/gh-actions-pinning-v2` @ `9082c87` | 3 commits: SHA-pinning, a dependency-free pin checker + 245-line test suite + 8 fixtures, and the CI workflow file (which the agent had left untracked — the checker existed but nothing ran it) |
| `feat/commitlint-v2` @ `79f50cb` | `commitlint.config.js`, `scripts/setup-git-hooks.js` + 2 test files, `package.json` |

**Side evidence for the worktree surface:** this run left 3 more worktrees under `.claude/worktrees/`,
bringing that pool to 7, with no cleanup mechanism observed.

## Ground truth measured this session

26 agents · 146 skills · 13 commands · 7 hooks · 6 workflows on `origin/main`.
`agent-audit.js` and `system-redesign.js` exist only on PR #190's branch, unmerged.
`DECISIONS.md` is at 59 entries against its documented 50-entry cap — noted by three consecutive
sessions and acted on by none, which is itself evidence about prose-enforced rules.

## Architecture audit results — `wf_30f1b97b-d8a` (9/9 surfaces, 88 findings, 14 agents, 2.02M tokens)

Full output: the run's task-output file + `journal.jsonl` in the workflow transcript dir. Verdicts:
**REWORK** — orchestration, memory, QA gate, worktrees, prompt layer. **REPLACE** — settings/permissions,
MCP configuration. (Remaining two surfaces in the full output.)

### The finding that reframes everything: the runtime overtook the system

**Verified by execution this session, not by changelog reading:** a subagent successfully spawned a
subagent and returned `DEPTH_2_ALIVE`. **The nested-Task block is FALSE.** It was last empirically tested
2026-05-28 against CC 2.1.154; installed today is **2.1.226** — 72 versions later, with the default flipped
three times in between (5-deep at .172, disabled at .217, 3-deep at .219). `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
is live in this environment.

The platform now ships native equivalents for most hand-built machinery, with **zero adoption measured**
(grep across `.claude/` returns only prose mentions):

| Native primitive | What it replaces here |
|---|---|
| `--max-budget-usd` | prose $10/$15 ceiling, overrun 5.7-7.3x once |
| hardened `isolation:'worktree'` (fixes `git -C`/`--git-dir`/`GIT_DIR` redirection into the shared checkout) | the exact class that caused the 2026-08-08 incident |
| filesystem/network sandbox, `denyRead`/`denyWrite`/`strictAllowlist` | substring blacklist bypassable via `node -e` |
| OTEL `workflow.run_id` / `workflow.name` | no run log exists at all |
| `MAX_CONCURRENT_SUBAGENTS` / `MAX_SUBAGENTS_PER_SESSION` | nothing |

Correct framing: *not* "we built mechanisms and they rotted" but **"we built workarounds for a 2026-05
platform, the platform grew past them, and nobody re-checked."**

### Root cause: one missing build step, appearing seven times

Specification language and enforcement language are the same markdown, in the same tense, with no artifact
that fails when a rule is violated. Measured: `DECISIONS.md` 58 vs a ≤50 cap; `schema-lint.js` named in
CLAUDE.md as the Trivial-tier CI gate, wired to nothing, and **failing 10 of 26 agents** when actually run;
all 26 agents declare `mcpServers:` grants that nothing resolves, with **8 of 13 names existing in no config
layer** (`linear` 24 refs, `github` 15 refs); `MANIFEST.json` `totalSkills` has no consumer and four counts
disagree; branch protection on `main` returns **404** (re-verified), so "the CEO and CTO cannot override" is
fiction — PR #191 merged through a failing check.

**The capability already exists and was never generalized:** `skills:` frontmatter IS cross-checked against
`MANIFEST.json` — by the very linter that leaves `mcpServers:` unchecked.

Second-order effect: memory records "we will" and "it does" identically, so **five fabricated mechanisms**
now propagate as instructions agents act on — a Stop hook claimed to "block any git merge" (its own header
reads `SOFT-WARN ONLY — never blocks`), a Codex second opinion invoked nowhere, a `craft-reviewer` agent
that does not exist, Mem0 + pgvector present-tense in the stack table with zero imports, a "permission
classifier" whose only occurrence in the repo is the session file asserting it.

### Other measured facts

T4 has **never** fired; T3 fired once in 2.5 months; `coding.js` and `research.js` have zero real
invocations while `ceo.md` gives them equal standing with `qa.js` (and omits 2 of its own 6 scripts).
Worktrees: **31.2GB** across two pools, 13 on already-merged branches, oldest merged 2026-04-20, no reaper.
`~/CLAUDE.md` unchanged since 2026-03-10, auto-loads into every session in ~10 projects, opens with
*"Iris, [what I need]"* — a persona with no file in any roster. Three mutually inconsistent live rosters
exist on this machine, and the stalest layer holds the widest permission grant
(`skipAutoPermissionPrompt` / `skipDangerousModePermissionPrompt` both true globally).

### Keep (load-bearing — a redesign discarding these is a regression)

`qa.js`'s actual runtime behaviour (9+ real BLOCK→fix→PASS cycles; caught severe defects CEO review missed
twice) · `gate-logic.mjs` as a pure unit-tested decision core — the only rule lifted out of prose into
testable code, and the seed of the manifest-and-resolver pattern · the `skills:`→MANIFEST resolver ·
worktree-per-task as a primitive (zero nesting violations across 61 live worktrees; all breakage is
lifecycle) · `design.js` · the CEO seed-injection mechanism · **`LONG-TERM.md`'s shape** — bounded,
append-only, one line per fact, the only memory file both in budget and current · Supabase MCP as the
reference integration (exists at every layer that claims it) · `gsa-sync.js`'s diff engine (tested clean
across 8 projects) · Adam's Wave-1 diagnosis that adversarial review belongs inside the build loop.

## LOCKED — target architecture (Adam, 2026-08-09)

Adam rejected all three roster options and specified a fourth. **Three layers, with adaptivity as the point:**

1. **CEO — the orchestrator.** Always the entry point. Gives workers goals, tracks progress, manages them,
   starts QA, owns the quality bar. Never implements.
2. **The thinking layer (C-suite) — invokable, not always-on.** Agents *or* a workflow the orchestrator
   turns on to break down goals/tasks/challenges, plan, and reason **from different perspectives** before
   deciding. Judgment lives here.
3. **Workers.** Receive a goal, read skills, execute.

**Defining requirement:** every task differs in required skills, kind of reasoning, complexity, depth,
expertise, tools and MCPs. The system **composes its capabilities per task** and **improves itself over
time**. Explicit inputs to learn from: YC agent system, Prime Agent, GSD, and others.

### Also locked this session

- **Native primitives: SPLIT.** Adopt sandbox, `isolation:'worktree'`, and OTEL unconditionally (they
  replace things currently fabricated or absent). Keep orchestration thin and **depth-agnostic with a
  startup capability probe** writing to the run log — the nesting default flipped 3x in 65 versions, so a
  future change must be a logged event, not a blind spot.
- **QA gate: SPLIT BY BLAST RADIUS.** Hard enforcement on executable surface (code, hooks,
  `settings.json`, `.mcp.json`, migrations); advisory on prose and docs. Matches where real defects were
  found and removes the perverse tax that gates prose maximally and `qa.js` minimally.
- **Cost: ADVISORY.** No hard `--max-budget-usd` stop — Adam does not want to be halted. The run log still
  records cost and fan-out per run so a 60-agent run is *visible*, not *blocked*. (Note the unresolved
  billing question: account usage shows $0 costUSD across all models, consistent with a flat-fee
  subscription, while three docs treat $10/$15 as real dollars.)

### Design consequences (CEO-added, follow from the above)

1. **Capability composition must be RESOLVED, not declared.** Per-task selection of skills/tools/MCPs is
   now the central mechanism, so it cannot live in hand-typed frontmatter — that is precisely what is
   broken today. Needs a runtime resolver that fails loudly.
2. **The run log is a prerequisite for self-improvement, not a nice-to-have.** You cannot improve what you
   do not measure; T3/T4/`coding.js`/`research.js` died unnoticed because nothing recorded usage.
3. **Self-modification is gated by blast radius.** Prime Agent's `/refine` CRUDs its own prompts/skills/
   memory with *unknown* gating — the highest-risk unknown in that brief. Adam's blast-radius rule composes
   directly: rewriting a skill is advisory, rewriting a hook or permission is hard-gated.
4. **Depth is computed, not classified.** Replaces the T1-T5 first-move classification that predicts
   nothing, gates nothing, and is never recorded.
5. **The system must be able to say "I don't know how to do this well" and escalate** rather than
   confidently producing mediocre output. If the bar is best-quality, refusing to fake competence is part
   of the mechanism.

## Eight-lens design round — `wf_17f8be59-f86` (8/8 lenses, 13 agents, 1.04M tokens)

Lenses with deliberately different objective functions: architecture · implementation · coding-ergonomics ·
design/UX · QA · evidence · business · adversary. Independent passes, **no cross-critique round** (the
evidence says homogeneous debate degrades via sycophancy), then a conflict-finder, 3 adversarial verifiers,
Opus synthesis.

**Headline:** *"The three-layer shape is right and needs no re-litigation — the rebuild is not an
architecture problem, it is a compilation problem. Nothing turns 'we decided X' into 'X is true.'"*

### Three verified findings (all HELD under adversarial attack)

1. **The QA gate is forgeable AND unenforced.** `qa-lead-pass.yml`'s entire PASS decision is
   `grep -qiE 'qa_verdict:[[:space:]]+"?PASS"?[[:space:]]*$'` against a session file located by
   branch-slug heuristic. No commit SHA, no hash of qa.js output, and **qa.js is never invoked by the
   workflow**. Hand-typing the string goes green (verified by replaying the regex). Worse and previously
   unknown: `branches/main/protection` → 404, and ruleset `13276203` has **`enforcement: disabled`** — so
   it is not a required check and a PR merges whether it passed, failed, or never ran. **Both halves must
   be fixed together or neither matters.**
2. **qa.js's "3 independent adversarial verifiers" are three prompt framings against one model.**
   `verifyFinding()` spawns 3 `agent()` calls, all with `model: 'sonnet'`; only the lens text varies. The
   `meta.description` advertises independence it does not have, and agents read self-descriptions at face
   value. The documented Codex second opinion appears nowhere in qa.js and the binary is not installed —
   **cross-family coverage today is zero, not "degraded fallback."** Its 5-dimension rubric decomposition
   IS evidence-aligned and stays.
3. **Computed depth selection is unsourced** and should ship in shadow mode. Fair correction noted: the
   "design consequences" list in this file is CEO-added inference, not Adam-ratified word-for-word.

### Unanimous consensus (strongest signal available — 8 incompatible objectives, same conclusion)

**Prose-as-enforcement is the root cause; every declared invariant must name a hook, CI job, or data file
that makes it true.** Also converged: QA rigor and orchestration depth are two axes wrongly fused into one
trigger · `gate-logic.mjs` is the template AND its hand-mirrored inline copies in qa.js are a live
unchecked liability · `schema-lint.js` must be wired to CI or deleted · progressive disclosure is ~80%
built and needs an edit pass, not new machinery (several MANIFEST descriptions are truncated mid-word — a
silent matching failure, since selection keys on the description field) · same-family panels overclaim ·
dead mechanisms (T3/T4/coding.js/research.js) must be retired · **gsa-sync is the load-bearing unfinished
thing, named independently by the value-maximizing AND risk-minimizing lenses** · silent zero-output runs
must be structurally impossible.

### New gap in what was locked: provenance as a second axis

The adversary lens found that under a blanket "advisory on prose" rule, a **scanned competitor page
becoming a trusted instruction fanning out to 8 sibling repos is unblocked by construction.** Blast radius
says *where* to hard-gate; it says nothing about the advisory lane's own risk. Fix: a
`provenance: untrusted` tag set at write time and checked in the same PreToolUse hook.

### Honestly declared blind spots

- **Nobody priced friction.** Four lenses separately confessed they cannot cost what it feels like to hit
  a PreToolUse denial mid-task. Every gate proposed here is proposed by someone who admits they cannot
  price it.
- **The evidence base was never independently validated.** Three lenses lean on the 88-finding audit; all
  three flagged that it was produced by this same system, about itself, possibly by a same-family verifier
  panel — the exact flaw they identified in qa.js.
- **Adam is the single point of consumption** in every proposed mechanism: sole flag-holder, sole log
  reader, sole question target, sole bypass authority. Nobody examined what happens when he does not read
  — which is precisely how the 50-entry cap, the vindication triggers, and T3/T4's silent death played out.
- **No lens produced a positive design for the defining requirement.** Every one recommended deferring,
  shadowing, gating, or static-ising "adapts and improves itself on the go." The round flagged this against
  itself, and one lens named the risk that "the evidence says wait" becomes its own unfalsifiable stalling
  pattern.

## LOCKED — four more decisions (Adam, 2026-08-09, post-design-round)

1. **PLANNING ONLY for now.** No implementation. The minimum-viable list, the self-improvement pilot, and
   decisions 3-4 below are all recorded as *plan*, not applied. Nothing is built until Adam says build.
2. **No hard cap on the rebuild** — "work until it feels right." Adam was shown that the previous rethink
   needed a hard 5-day cap and that its vindication triggers lapsed eight weeks unchecked, and chose no cap
   anyway. **Consequence: the round's 7 stop conditions become the only brake, so they must be live
   artifacts rather than prose** — otherwise this decision reproduces the exact pattern that lapsed.
3. **Self-modification gate = flag-gated block + gsa-sync boundary gate.** Agent-system paths
   (`.claude/agents/**`, `.claude/workflows/**`, `.claude/hooks/**`, `settings.json`, `.mcp.json`) hard-blocked
   in `pre-tool-use.sh` unless an explicit session env flag is set (~30 lines on a proven hook, preserves
   autonomy), PLUS a gate at the propagation boundary where a change fans out to 8 sibling repos holding
   production credentials. NOT a review queue — that over-checkpoints the loop into uselessness, and stays
   available later if the run log surfaces a bad pattern.
4. **Global permission layer comes into scope, narrowly.** Keep `skipDangerousModePermissionPrompt` /
   `skipAutoPermissionPrompt` for Adam's interactive sessions (zero tax on his velocity), but require
   autonomous/headless runs to be **distinguishable** and subject to the project-level PreToolUse gate.
   Honest caveat: nobody tested whether the scan pipeline's third-party content currently reaches a
   memory-writable path — treat as a documented risk designed against, not a confirmed exploit.

### The round's 7 stop conditions (now the only brake — see decision 2)

1. Any component declared done while its enforcement is a sentence rather than a named hook/CI job/data file.
2. The run log exists 4 weeks with no reader, or the weekly cron reader was never built.
3. Another run burns >200k tokens and returns no structured output after the STALLED envelope ships.
4. The build extends past components marked S and M without an explicit decision to continue.
5. `gsa-sync --apply` has still never run successfully on a non-Beamix project by the time the rest is built.
6. Beamix ships no customer-facing feature during the rebuild.
7. A new named mechanism is added that nothing invokes within its first two weeks.

## Next steps

1. **In flight:** `wf_5c6af736-b3d` — research on the YC agent system (referent to be resolved, not
   guessed), the GSD plan→check→execute→verify pipeline, and the five cross-cutting design questions
   (dynamic capability composition · multi-perspective reasoning · depth selection · self-improvement
   gating · instrumentation).
2. Reconcile this audit against the 2026-08-08 capability-gap-map — the audit explicitly did **not** read
   it, and two of its recommendations surfaced second-hand, so duplicated or contradictory recommendations
   are a real risk. Do this **before** design work.
3. Re-run `system-redesign.js` as the subtract pass with the two constraints relaxed.
4. Produce the design, with propagation built in rather than bolted on.
5. Land the quick wins that are independent of the design (see audit output): kill `~/CLAUDE.md`'s Iris
   roster; branch protection or delete the "cannot override" language; tier-floor inversion; wire
   `gate-logic.test.mjs` and `schema-lint.js` into CI; prune 13 merged-branch worktrees and commit
   `.claude/worktrees/` to `.gitignore` (its exclusion currently lives only in per-machine
   `.git/info/exclude` and will NOT survive the move to the new canonical repo).

## Blockers

None. One research run in flight; no external dependencies.

## Session file
docs/08-agents_work/sessions/2026-08-08-ceo-agent-system-clean-sheet-rethink.md
