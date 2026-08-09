# Prime Agent — research brief

**Run:** `wf_1222755d-edd` (research.js, depth: deep) · 80 agents · 3.72M subagent tokens · 537 tool calls · ~20 min
**Date:** 2026-08-09 · **Purpose:** input to the clean-sheet agent-system re-architecture
**Confidence:** medium overall · 54 claims verified, 18 rejected in adversarial verification

> This is the **second** time Prime Agent was researched. The first run (prior session, 2026-08-08) was
> delivered only in conversation, recorded as *"not related to Beamix's own agent system, no further
> action needed,"* and lost. Both the dismissal and the non-persistence were wrong. This file exists so
> it does not happen a third time.

---

## What it actually is

`github.com/PrimeIntellect-ai/prime-agent` · MIT · TypeScript · announced **2026-08-05** as
*"Prime Agent: A self-improving RLM agent."* Repo created 2026-05-08, ~8.6k stars, 766 forks, 4,480 commits.

Two facts reframe everything below:

**1. It is not a clean-sheet Prime Intellect build.** The LICENSE carries dual copyright — *"Copyright (c)
2025 Mario Zechner"* and *"Copyright (c) 2026 Prime Intellect."* Contributor counts are dominated ~9.4x by
badlogic (Zechner, author of the `pi` harness): 3,071 vs 326 for second place. The repo's fork flag is
false, so the lineage is invisible in GitHub metadata. **The core turn loop is not even in this repo** —
`packages/coding-agent` depends on `@earendil-works/pi-agent`, and `runLoop` lives in `earendil-works/pi`.
Prime Agent is a productized, heavily extended superset of `pi`.

**2. There is no RL in the harness.** Verbatim from the launch post: *"currently no model has been trained
around Prime Agent or its core feature set."* Every behaviour — planning, tool use, stopping,
self-improvement — is prompt plus TypeScript control flow driving stock third-party models (Opus 5,
GPT-5.6 Sol, GLM-5.2, Claude Pro/Max and Copilot subscriptions, self-hosted vLLM/Ollama).

That second fact is the most decision-relevant thing in this brief: almost nothing is gated on custom
weights, so the mechanisms **are** portable.

## Two core abstractions

- **RLM (Recursive Language Model)** — context treated as a programmable variable; sub-agent delegation
  expressed as function calls inside a persistent IPython kernel. Framed as *"models in Prime Agent use a
  persistent IPython kernel as their only tool."*
- **Continual Harness** — harness state formalized as **H = (prompt ρ, sub-agents G, skills K, memory M)**,
  which the agent CRUDs via a `/refine` command. Self-improvement is *"the smallest relevant CRUD edit"* to
  prompts/skills/memory — file editing, not weight updates.

**Note the convergence:** that four-part decomposition is essentially the one this re-architecture is
already working with (prompts, agents, skills, memory). Independent arrival at the same model is mild
evidence the decomposition is right.

---

## ADOPT — four mechanisms, all deterministic code

### 1. Multi-dimensional autonomy budget
`DEFAULT_AUTONOMOUS_LIMITS = { maxContinuations: 3, maxTurns: 12, maxTokens: 80_000, timeoutMs: 30*60*1000 }`,
enforced by `autonomousLimitReason()` checking continuations → turns → tokens → wall-clock **in that order**
and returning a *named reason*. Deterministic, no model judgment.
`packages/coding-agent/src/core/autonomous.ts`

**Why this matters here:** this is the exact mechanism whose absence cost 540k tokens today. Beamix has
`maxTurns` in agent frontmatter and nothing else — no token budget, no wall-clock, no continuation cap —
and its cost ceilings ($10 / $15 T5) are prose. This brief's own research run spent 3.72M tokens against
that prose ceiling.

### 2. Stop-hook composition
`AgentSession._shouldStopAfterTurn` chains, in order: terminal-message goal check → goal-budget accounting
(which queues a `budget_limit` *steer message* rather than hard-killing) → serialized-`/refine` checkpoint →
compaction-threshold check → pending steering-stop. **Policy is fully externalized from the loop**; core
`runLoop` has no max-turn, token, or retry cap of its own.
`packages/coding-agent/src/core/agent-session.ts`

The steer-don't-kill pattern is notable: budget exhaustion injects a message the agent can respond to,
rather than terminating mid-work with nothing returned.

### 3. Deterministic compaction, with an integrity rule
`shouldCompact()` returns `contextTokens > contextWindow - reserveTokens`;
`DEFAULT_COMPACTION_SETTINGS = { enabled: true, reserveTokens: 16384, keepRecentTokens: 20000 }`. Arithmetic
threshold, not model-decided. The algorithm walks backward accumulating messages until `keepRecentTokens` is
reached, then cuts older history but **never cuts inside a tool-call/tool-result pair**, and replaces the
removed span with an LLM-generated summary — history is summarized, not silently dropped. Branch
summarization keeps assistant messages with tool calls and prior summaries while explicitly skipping raw
tool-result bodies.
`packages/coding-agent/src/core/compaction/{compaction,branch-summarization}.ts`

### 4. Least-privilege MCP posture
MCP servers configured in `~/.prime/agent/settings.json` or project `.prime/agent/settings.json`; remote HTTP
transport only; auth via OAuth (RFC 7591 dynamic client registration) or `bearerTokenEnvVar`, credentials in
`~/.prime/agent/auth.json`. **Built-in integrations ship DISABLED** and require explicit `/login`; calling one
without credentials raises `NotEnabled`.
`packages/coding-agent/docs/mcp-integrations.md`

---

## DO NOT ADOPT

### Verification posture — Beamix's is stronger
Across README, `architecture.md`, `rlm-runtime.md`, `extensions.md`, `mcp-integrations.md` and the launch
post, **no deterministic self-verification subsystem is documented**: no test-runner gate, no LLM judge, no
adversarial reviewer, no reward signal in the harness. Correctness rests on the model executing its own
checks. Beamix's `qa.js` — dimension reviewers → 3-way adversarial verify → Opus judge, with a binding
verdict — is materially better. **This is a load-bearing keep for the redesign.**

*Caveat, stated honestly: this is an answer from absence. The full source tree was not exhaustively grepped
for a test-runner/judge/verifier subsystem. Treat as strong-but-not-conclusive.*

### Sandboxing
`architecture.md`: *"Workers and kernels are separate processes for lifecycle and failure containment, not
security sandboxes."* `rlm-runtime.md`: *"IPython executes model-generated Python and shell-magics with the
worker's OS permissions"* and *"The kernel boundary isolates protocol and lifecycle concerns; it is not a
security sandbox."* No container/VM/worktree isolation in the default path.

### The RL machinery — a different artifact entirely
INTELLECT-3 (arXiv:2512.16144, **2025-12-18 — predates Prime Agent**) is a separate 106B MoE built on
GLM-4.5-Air-Base. Its reward machinery is training-side and infra-heavy: math-verify + CompassVerifier-7B
judge, code run against up to 15 test cases in Prime Sandboxes, SWE scoring via repo test suites against a
registry of 20,000+ pre-built GitHub-repo images, 200-turn cap; trained on prime-rl across 60 nodes split
16 training / 44 inference. Not reproducible by a solo developer, and **not shipped as part of Prime Agent.**

---

## Maturity — read this before borrowing anything

- **3 days old at time of research.** 229 open PRs, 149 open non-PR issues; only 16 closed non-PR issues.
- **No SWE-bench, SWE-bench Verified, or Terminal-Bench number exists** anywhere — blog, README, repo, or
  launch coverage. Not present on the Terminal-Bench 2.1 leaderboard. A fuller technical report is promised
  and unpublished.
- **Flagship result:** ARC-AGI-3, 95.5% RHAE Best@1 with Opus 5 (95.0 / 95.2 / 95.5 across three runs),
  narrowly above the ARC-reported human-expert baseline of 95.4%; 183/183 levels.
- **Long-context suite (9 evals):** GLM-5.2 + Prime Agent beats GLM-5.2 + pi-mono 8/9; Opus 5 + Prime Agent
  beats Opus 5 + Claude Code 6/9; Sol + Prime Agent beats Sol + Codex 6/9. **All self-reported, none
  independently replicated** — and the head-to-heads are vendor-run comparisons of competitors' harnesses.
- **Day-one defects** (filed within ~48-72h): kernel bootstrap lock race (#1005), stream-parser data loss
  (#995), TUI crash at 5 concurrent subagents (#648), OAuth token-refresh file-locking (#999), install-time
  process orphaning (#1008).

**Two defects are direct warnings for this redesign:**
- **#986 "Goal Mode Keeps Looping After Completion"** — when a goal is blocked pending human input,
  autonomous mode *"repeatedly schedules itself despite having no new information or executable work,"*
  burning tokens instead of pausing.
- **#1011** — RLM subagents inherit the parent's model with no accessible per-subagent selector. No model
  routing at launch.

## The most useful comparison in the whole brief

**mini-swe-agent** (Princeton/Stanford SWE-bench team): a **~100-line single-agent scaffold** — linear
non-branching history, bash-only, no tool-calling schema — officially reporting **>74% on SWE-bench
Verified**, runnable in Docker/Podman/Singularity/Bubblewrap.

Far simpler than Prime Agent, and it has the hard benchmark number Prime Agent lacks. Worth holding onto as
a caution against elaborateness for its own sake in the redesign.

*(Dated comparison, for context only: OpenHands reported 60.6% SWE-bench Verified single-trajectory, 66.4%
at 5 attempts with a trained critic — but that source is 2025-04-17 and likely superseded.)*

---

## Open questions the research could not close

1. **`/refine` write gating is unknown** — the agent CRUDs its own prompt, sub-agents, skills and memory, but
   no source shows whether those writes are reviewed, diffed, version-controlled, rate-limited, or
   reversible. *For a system with a QA gate, this is the highest-risk unknown and the most interesting one.*
2. **Persistent cross-run memory** — "memory M" appears in the formalism; storage format, scope, eviction
   policy, and cross-session survival are undocumented in what was examined.
3. **Verification by absence** — needs a targeted grep of `packages/coding-agent/src` for
   test-runner/judge/verifier/reward code before asserting definitively.
4. **Tool-surface contradiction** — the blog says IPython is the *only* tool; `extensions.md` lists three
   overridable built-ins (`ipython`, `bash`, `edit`). Unresolved which is the real runtime surface.
5. **Retry / failure recovery above the loop** — `runLoop` has no retry; whether `AgentSession` or the worker
   supervisor implements LLM-call retry, kernel restart, or resume-after-crash was not established. Bug
   #1005 suggests this layer is immature.
6. **Decomposition** — appears model-driven (sub-agent delegation as emitted function calls), but no source
   confirms whether any deterministic routing layer exists.

**Do not cite line numbers from this research.** Cited locations in `agent-loop.ts` and `autonomous.ts` were
disputed during verification — the logic was confirmed verbatim, the line numbers were not.

## Bottom line

Conceptually rich, commercially serious, and 3 days old, with a quality mechanism that is model
self-judgment. **Adopt its context, budget, and state mechanics. Do not adopt its verification posture or
its sandboxing posture — on both, the system being redesigned here is already ahead.**
