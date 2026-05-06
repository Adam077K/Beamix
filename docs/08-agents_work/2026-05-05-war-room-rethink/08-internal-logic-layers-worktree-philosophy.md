# Beamix War Room — Architectural Philosophy Critique
*Author: Architecture Critic (principal-engineer perspective) | Date: 2026-05-05*
*Inputs: CLAUDE.md Layer Contract, all 9 core agent files, AGENTS.md, Wave 1 reports 00-07, git worktree list*

---

## Verdict in One Paragraph

The current shape is **partially correct in one dimension and wrong in three others.** The dimension it gets right is the core structural insight: LLMs coordinating in isolated contexts, with filesystem separation, produce more reliable output than one fat prompt trying to do everything. That insight is sound. What is wrong: (1) the hierarchy is modeled on human org charts, not on information-flow graphs — the 3-layer model forces all work through a single CEO bottleneck, serializing what could be parallel, and adding 2 overhead steps (brief → lead → worker) to every task regardless of whether those steps add value; (2) the worktree-per-task method has already proven uneconomical at 72 worktrees / 32 GB and no cleanup protocol; (3) quality is caught at the worst possible moment — after a full diff is built, not before. The system has all the right instincts and exactly the wrong calibration. It is not broken enough to rebuild, but it is miscalibrated enough that it will continue burning money and shipping bugs at its current configuration. Five targeted changes, documented below, would correct it.

---

## The 3-Layer Hierarchy — Defense, Prosecution, Verdict

### Defense
The hierarchy solves a real coordination problem. Without it, a single LLM session does everything — reads specs, explores code, writes, tests, reviews — running out of context window and making architectural choices it should not make. The 3-layer model enforces specialization: CEO owns goals and briefs, leads own planning and verification, workers own implementation. The deviation rules in workers (auto-fix bugs / escalate architecture) are a genuine contribution — they define explicit decision trees that prevent workers from guessing. Wave 1's batch execution (17 routes, 8 pages, 7 Inngest functions) was possible precisely because the hierarchy created parallel work lanes.

### Prosecution

**The anthropomorphism trap.** The hierarchy maps human corporate structure (CEO → VPs → ICs) onto information-flow problems. A human org chart solves coordination, communication, and authority problems across thousands of people. The Beamix system has one human (Adam) and a fleet of stateless LLM sessions. The hierarchy adds ceremony — color-coding, session naming, 12-field briefs, YAML session files — that is meant to mirror human management practices but does not address the LLM's actual failure modes (context loss, instruction drift, sycophancy, and hallucination). The CEO's 25 maxTurns are not a real budget — they are a cap. There is no mechanism inside the CEO prompt that says "I have 8 turns left; I must stop asking questions and delegate now." The question loop is unbounded ("No limit on questions. No assumptions"), which means the CEO can exhaust its budget on clarification and never dispatch.

**The CEO is a glorified router with extra steps.** Read ceo.md with fresh eyes: pre-flight (read 4 files) → set identity → load 3-5 skills → ask questions → assign tier → pick agents → write brief → validate return → update memory → write session file. That is 10 steps for every task, at Sonnet prices, before a single line of code is written. For a "Quick" task (1 file, 1 obvious fix), this protocol is theater. The brief format (12 required fields) is a template that was never actually filled in practice — the session audit in report 01 found zero structured briefs in 29 sessions. The CEO is performing management ritual, not management.

**The lead layer adds latency without adding signal.** build-lead reads context, plans waves, dispatches workers, verifies branches, runs QA, awaits merge confirmation — but never touches code and never makes irreversible decisions. In the Anthropic multi-agent research system (their canonical published design), the orchestrator does planning + synthesis; workers execute with tools. There is no middle management layer between them. That design is also what LangGraph, BMAD Method, and spec-kit use: orchestrator + workers, no leads. The lead layer in Beamix is a wrapper that consumes tokens and turns without producing artifacts.

**Real judgment vs mechanical dispatch.** The CEO has one genuine judgment call: tier assignment (Quick/Medium/Complex). Everything else is mechanical: pick the agents from the table, fill in the brief template, validate the JSON return fields. The CEO is not reasoning about whether this task requires a backend developer vs a full-stack rethink. It is routing by keyword match ("any code work → build-lead"). This is a router with a 25-turn budget dressed as a strategic orchestrator.

### Verdict

**Keep the 2-layer pattern (CEO + workers), dissolve the lead middle layer as a permanent standing role.** Leads should become task-scoped orchestrators instantiated on demand and dissolved on completion — not standing agents with fixed identities. The build-lead pattern (explore → plan waves → dispatch workers) is valuable; instantiate it as a planning step inside the CEO for Medium tasks, not as a separate agent. For Complex tasks that genuinely span multiple domains (code + research + design), the CEO should spawn domain-specific coordinators with explicit scope and a fixed turn budget, not 9 standing leads each with their own identity setup ritual.

**The exception:** QA Lead must remain a separate, independent agent for a different reason — not hierarchy, but independence. The QA agent must not share a context with the build agent. Merging them removes the independence that makes QA meaningful.

---

## The Worktree Method — Defense, Prosecution, Verdict, Recommended Alternative

### Defense
The worktree-per-task method solves a genuine problem: LLM workers operating in the same filesystem create race conditions, overwrite each other's changes, and lose track of which files belong to which task. Git worktrees give each worker its own checked-out copy of the repo at a specific branch — changes are isolated at the filesystem level, not just at the prompt level. This is sound engineering. Sculptor (Imbue), Devin (Cognition), and Crystal all use some form of filesystem isolation for the same reason.

### Prosecution

**72 worktrees / 32 GB with no lifecycle management.** This is the worktree method's failure mode, already realized. At 72 worktrees, the system has accumulated state that no agent is responsible for cleaning. The cleanup script in report 03 identifies 43 already-merged worktrees that are safe to delete instantly. The worktree-per-task method works for 3-5 concurrent tasks; it does not scale to 72 without a retention policy and a garbage collector.

**The worktree is the wrong unit of isolation for most tasks.** A git worktree is a full repo checkout — 32 GB for the Beamix repo times 72 instances. For a worker whose task is "add a Zod validator to this one route," that is extraordinary overhead. Compare the alternatives:

- **Anthropic's official sub-agent isolation (May 2026):** `isolation: worktree` in agent frontmatter creates a temporary worktree automatically and cleans it up on completion. This is the same mechanism but with a managed lifecycle — the platform handles creation and destruction.
- **Docker/container approach (Sculptor, Devin):** Full environment isolation including Node.js, npm cache, env vars. Better for tasks requiring service startup. Overkill for pure filesystem changes.
- **Branch-only approach (no filesystem copy):** Worker operates on a branch in the main repo, uses `git stash` for isolation. Works for sequential tasks; fails for parallel tasks sharing files.

**At 200 worktrees:** the filesystem would hold ~88 GB of redundant repo copies, `git worktree list` itself takes ~2 seconds, and any command that walks the worktree tree (most git operations) degrades. At 1000 worktrees: the system becomes operationally ungovernable. There is no cluster-wide agent that monitors worktree count and triggers cleanup.

**The nested worktree bug is a symptom.** The CLAUDE.md worktree protocol warns at length about "child worktrees from a worktree context" and provides a complex detection + creation script. That complexity exists because agents kept running `git worktree add` from inside a worktree, creating nested structures that corrupt the git index. The correct fix is not better documentation — it is removing the footgun by using `isolation: worktree` in agent frontmatter (platform-managed) or establishing a single worktree-manager agent that receives requests and creates/destroys worktrees on behalf of workers.

### Recommended Alternative

**Use `isolation: worktree` in agent frontmatter (Anthropic-native, May 2026).** Set this on all code workers (`backend-developer`, `frontend-developer`, `database-engineer`). The platform creates a temp worktree on spawn, commits on completion, and removes the worktree when the agent exits. No manual worktree add/remove protocol needed. No nested-worktree bugs. No 32 GB accumulation.

For the transition: run the report-03 cleanup script immediately to recover the 43 merged worktrees. Remaining active worktrees (9 per report 03) should have explicit owners and a 14-day retention policy enforced by a nightly hook.

---

## QA Gate Placement — Where to Actually Catch Bugs

The current QA gate is post-flight: a diff is fully built, committed, and waiting to merge before any quality check runs. This is the most expensive place to catch a bug, for three reasons: (1) the worker has already spent its full turn budget implementing the wrong thing; (2) a BLOCK verdict requires another round-trip through build-lead → worker → fix → QA; (3) in practice (session audit, report 01), the gate is never invoked — the cost of invoking it after the fact is too high, so it gets skipped.

The right quality architecture has three layers, each cheaper than the previous:

**Pre-flight (before code is written):** Spec validation. Before the CEO dispatches a build-lead, the task spec should be machine-readable and complete. This is the spec-kit constitution pattern. A spec-checker agent (Haiku, cheap) verifies the brief has: clear success criteria, no ambiguous file scope, no architectural changes flagged as worker-level tasks. A bad spec caught here costs 2K tokens. A bad spec caught at QA costs 50K tokens plus rework.

**Mid-flight (during implementation):** TypeScript diagnostics (`mcp__ide__getDiagnostics`) and semgrep on the partial diff. The worker should call these tools before committing each logical unit — not as a separate QA pass, but as part of the commit workflow. This is already partially specified in CLAUDE.md ("Run `mcp__ide__getDiagnostics` before final commit") but not enforced. A Stop-hook that blocks `git commit` if `tsc` reports errors would enforce it at zero extra agent cost.

**Post-flight (the current QA gate):** Retained for security-sensitive paths only (auth, billing, RLS, webhooks). For these, run the full tiered stack from report 07: semgrep as ground truth, security-engineer (Sonnet) for triage, adversary-engineer (Opus/Aria) for exploit chains. For everything else, a lightweight Haiku pass on the diff is sufficient.

The key insight from Cloudflare's 48,095 MR dataset: most bugs are caught not by deep security review but by the trivial checks (tsc, semgrep, linting) that run in milliseconds and cost nothing. The expensive LLM review layer should be reserved for business-logic gaps that static analysis cannot see.

---

## Skills Architecture — Load-On-Demand vs RAG vs Plugins

### Current State
430 skills in flat files, discovered via a 42K-token MANIFEST.json read before any task begins. Agents are instructed to "load 3-5 skills per task." Two incompatible skill directories (`.agent/skills/` and `.claude/skills/`) invisible to 70% of agents.

### Load-On-Demand (Current): Partially right, badly implemented
The principle is correct: skills should load on demand, not preloaded. But "read MANIFEST.json, filter by tags, load 3-5 SKILL.md files" costs ~$0.14 per session before any work begins (report 03). For 5 sessions/day, that is $21/month wasted on skill discovery — before the first line of code is written. The mechanism is also unreliable: agents use tag-matching on a 42K-token file, which is itself a context-window hazard, and the two-directory split means many skills are simply not found.

### RAG over Knowledge (Vector DB)
The right architecture for 430 items is a `find_skills(tags: string[], limit: int)` MCP call, not reading a 42K-token file. This is the claude-flow/AgentDB pattern: a vector-indexed MCP server returns the top-N matching skills based on semantic similarity to the task description. Token cost: ~500 tokens per skill lookup vs ~42K for the full MANIFEST. The hit rate would be higher too — semantic similarity beats tag-matching on a flat JSON file.

However: building and maintaining a skills MCP server is non-trivial infrastructure for an MVP-stage startup. The pragmatic intermediate step is a `SKILLS_INDEX.md` — a ≤200-line file with one-line summaries and tags — as recommended in report 00. This cuts discovery from 42K tokens to ~4K tokens with no new infrastructure.

### Plugins (Anthropic Oct 2025)
Plugin bundling (lead + workers + commands + skills + MCP config as one installable `plugin.json`) is the right long-term target. It solves the two-directory problem by eliminating it: each domain plugin (build-plugin, research-plugin, qa-plugin) ships its own agents, skills, and MCP config as a coherent unit. Claude Code discovers them via the plugin registry, not by reading directories. This is Wave 3 work — correct direction, wrong timing for pre-MVP.

### Is Load-On-Demand Actually Improving Outcomes?
The honest answer: almost certainly not in the way it is described. The instruction "load 3-5 skills before starting" produces agents that begin by reading SKILL.md files, then proceed to implement tasks in whatever way they were going to anyway. The skills provide vocabulary and heuristic patterns, but there is no evidence in the session audit that skill loading changed a single implementation decision. The skills system has value as a vocabulary/heuristic layer, but its current implementation is cargo-cult: the ritual of reading skills is performed without measuring whether it changes output quality.

The correct test: run 10 matched task pairs (same task, same codebase, with and without skill loading). Measure output quality on a 5-point rubric. Until that test is run, skill loading is a cost center with assumed benefits.

**Recommendation:** Replace MANIFEST.json with `SKILLS_INDEX.md` (≤200 lines). Consolidate skills into one directory. Keep load-on-demand but add a feedback loop: agents note which skills were actually referenced in their implementation, and that signal informs quarterly skill pruning.

---

## The 3 Places the System Doesn't Think

### Place 1: Before Spawning Parallel Workers (The Fan-Out Decision)

**What happens now:** Build-lead identifies independent tasks, places them in Wave 1, and dispatches up to 3 workers in parallel. The decision to parallelize is made heuristically ("these tasks don't share files") without verifying that the tasks truly don't share files, without checking if the combined token cost of 3 parallel workers is justified by the speed gain, and without asking whether the tasks might require coordinated architectural decisions that would require re-briefing anyway.

**The failure mode:** Three workers fan out, each makes different assumptions about the shape of an interface they all touch. Worker A defines `ScanResult` one way; Worker B imports it and redefines it; Worker C ignores it and uses `any`. The build-lead then spends 5 turns reconciling the conflict — costing more tokens than sequential execution would have.

**What should happen instead:** Before any fan-out, a mandatory interface-contract step. Build-lead defines the shared interfaces (TypeScript types, API contracts, DB schemas) as a short machine-readable document, posts it to `.claude/memory/` as a temp contract file, and includes it in every worker brief. Workers read the contract before implementing. This is the "write the spec before the code" principle applied at micro-scale. Cost: 1 extra turn for build-lead. Saving: eliminates interface reconciliation turns.

---

### Place 2: Before a Costly Opus Call (The Escalation Decision)

**What happens now:** research-lead and researcher are both Opus by default. The CEO dispatches research-lead for any research task without assessing whether the task requires Opus-grade reasoning. "What are three GEO competitors doing for content optimization?" is a Sonnet task. "Synthesize 5 conflicting academic papers on citation graph algorithms and derive implications for our ranking model" is an Opus task. The system cannot distinguish them.

**The failure mode:** $12 per research session for competitive pricing lookups that a Sonnet call at $4 would answer with equal accuracy. At 5 research sessions/week, that is $192/month of excess Opus spend on commodity questions.

**What should happen instead:** The CEO should pause before dispatching any Opus agent and apply a 2-question test: (1) Does this task require genuine multi-step reasoning across conflicting sources, or is it retrieval + formatting? (2) Would a Sonnet agent with the same instructions and same sources produce materially different output? If the answer to both is no, dispatch Sonnet. This pause costs 0 tokens — it is a conditional in the CEO's execution flow. The CEO prompt should include an explicit "model escalation checkpoint" step with these two questions, not just a routing table that defaults to Opus for research roles.

---

### Place 3: Before Merging (The "Done" Criteria Check)

**What happens now:** Build-lead presents a merge table with branch names, file counts, and "QA Lead: PASS" — and waits for user confirmation. The user sees a table of green checkmarks and types "yes." In practice, QA Lead is never invoked (report 01: zero QA invocations in 29 sessions), so the table shows PASS by default assertion. The merge happens. The code is in main with no independent verification.

**The failure mode:** 17 API routes, Paddle webhook handlers, and RLS-adjacent DB migrations merged without a single OWASP check (report 01, Wave 1 evidence). This is documented fact, not hypothetical risk.

**What should happen instead:** The merge step must be gated by evidence, not self-report. Specifically: (1) a Stop-hook blocks `git merge` on any branch where the session file lacks a `qa_verdict: PASS` line written by the QA Lead's own session file (not the build-lead's JSON); (2) for auth/billing/db branches, `semgrep --config=p/owasp-top-ten` must run as a pre-merge tool call (not an agent) and produce zero Critical findings before the merge table is shown. This is not "more process" — it is replacing unverifiable self-report with deterministic evidence.

---

## Theory of Failure — Who Validates the CEO?

### The Validation Gap

The system has a well-specified validation chain: workers → leads → CEO. Workers have deviation rules (auto-fix / escalate). Leads validate worker returns against branch existence and QA verdicts. The CEO validates lead returns against structured JSON fields. But nothing validates the CEO. The CEO can: dispatch a brief that contradicts a prior DECISIONS.md entry; assign a task to the wrong tier (calling a complex architectural change "Quick" to skip lead overhead); answer its own question loop insufficiently; or return a synthesis that papers over a BLOCKED return.

### Current "Appeal Mechanism"

There is none. The CEO's only check on itself is the `FAILURE BUDGET` rule ("Max 3 retries on any BLOCKED return"). That rule governs retries, not judgment quality. A CEO that consistently produces vague briefs, skips memory reads, and self-reports PASS on incomplete tasks will never trigger a BLOCKED return — it will just produce low-quality work quietly.

### The Principal Problem

Adam is the only validator of the CEO, and Adam operates on synthesized summaries (not raw agent outputs). The CEO is instructed to "NOT paste raw agent outputs — synthesize." This means Adam sees the CEO's interpretation of worker output, not the workers' actual output. The CEO can selectively emphasize wins and bury failures in a synthesis. This is not dishonesty — it is the natural result of giving a summarizing agent no obligation to surface uncomfortable signals.

### Recommended Pattern: Red-Team-as-Reflection

Three concrete additions:

**1. Constitution check (pre-action).** Before any build task, a Haiku agent reads the brief against the project CONSTITUTION (the spec-kit pattern) and returns a 5-item checklist: does this task contradict a prior DECISIONS.md entry? Does it touch an architectural boundary (DB schema, auth, billing) that requires explicit Adam sign-off? This runs in ~2K tokens and catches CEO reasoning errors before workers are dispatched.

**2. Adversary pass (post-build, pre-merge).** For Complex-tier tasks, after QA Lead returns PASS, the CEO spawns an adversary-engineer (Opus, Aria persona) with the brief: "This CEO said the task is complete. Here is the diff. Find the gap between what was asked and what was delivered." This is the "external signal" that makes LLM self-correction work (per the CRITIC paper cited in report 07). The adversary cannot block the merge on its own — it produces a findings list Adam reviews.

**3. CEO reflection step (post-session).** After every Complex task, before writing the session file, the CEO runs a 5-question structured self-assessment: Did we drift from the original goal? Did any worker return in a way that was suspicious? Did we skip any mandatory step (skill loading, QA, brief quality)? This costs ~2K tokens and creates an audit trail of CEO reasoning quality over time.

---

## Solo-Founder Async Fit

### Where the Architecture Breaks Under Async Control

The current design assumes Adam is at the terminal, ready to:
- Answer the CEO question loop (potentially 5-10 questions before dispatch)
- Confirm the merge table ("type 'yes' to confirm")
- Review the synthesis and approve follow-up actions
- Monitor parallel CEO sessions with color-coded badges

None of these are async-compatible. The CEO question loop in particular is a synchronous blocking call — "No limit on questions. No assumptions. Vague requests = bad results." If Adam answers in 6 hours instead of 6 seconds, the CEO session has timed out or spent its context budget waiting.

The merge confirmation pattern is even more fragile: the build-lead presents a merge table and stops. If Adam is traveling and doesn't confirm for 8 hours, that session is holding context budget and blocking the worktree indefinitely.

### Concrete Changes for Async Control

**1. Pre-commit the question loop to Linear/Slack.** Adam files a Linear ticket or Slack message with enough context that the CEO should not need to ask questions. The CEO's question loop should have an "async mode" trigger: if the ticket contains a `## Spec` section with measurable success criteria, skip the question loop and proceed directly to tier assessment. This requires Adam to learn the spec format once; it saves 5-10 CEO turns per task.

**2. Replace merge confirmation with a time-bounded auto-approve.** The build-lead posts the merge table to a Linear comment (via Linear MCP) and sets a timer: "Will auto-merge in 4 hours unless you comment 'hold'." Adam reviews from his phone. This requires the Linear integration from Wave 2, but is the single highest-value async change — it unblocks the fleet when Adam is unavailable.

**3. Async task queuing via Routines.** Anthropic Routines (launched 2026-04-14) run a CEO instance on a cron schedule or webhook trigger. Adam fires a Linear webhook → Routine wakes up → CEO reads the ticket → dispatches workers → posts results back to Linear. The CEO session is fully headless. This is the architecture described in report 06 (Week 1 integration plan) and is already recommended. The point here is philosophical: the system's question-loop-first design is fundamentally incompatible with headless async execution. The CEO needs a "headless mode" that trusts the spec rather than asking questions.

**4. Approval gates via HumanLayer.** For irreversible actions (merges to main, DB migrations, Paddle-touching code), wire HumanLayer's `@hl.require_approval()` to Slack. Adam gets a Slack message with approve/reject buttons. No terminal required.

---

## Cost-of-Thinking Gradient — Recommended Model Routing

The current system has three model tiers but applies them to roles, not task types. A researcher on competitive pricing and a researcher synthesizing conflicting DB architecture papers are both Opus by default. A code-reviewer finding a missing `await` and a code-reviewer auditing RLS policy are both Sonnet. The gradient should apply to the task type within each role, not just to the role itself.

| Agent | Current | Recommended | Why |
|-------|---------|-------------|-----|
| CEO | Sonnet | Sonnet (keep) | Orchestration is routing + template-filling — Sonnet is sufficient. Flag: reduce question-loop token burn by adding async-spec-trust mode. |
| build-lead | Sonnet | Sonnet (keep) | Wave planning and brief writing is structured work, not deep reasoning. |
| research-lead | Opus | **Sonnet by default, Opus on explicit escalation** | Decomposing a research question into parallel threads does not require Opus. Escalate to Opus only for synthesis of conflicting sources (MEDIUM+ confidence conflicts). |
| design-lead | Sonnet | Sonnet (keep) | UI planning is vocabulary-heavy but not reasoning-intensive. |
| qa-lead | Sonnet | **Sonnet → Haiku for triage** | QA Lead's job is risk classification and report aggregation. That is pattern-matching, not reasoning. Sonnet for the final verdict; Haiku for diff triage and tier classification. |
| devops-lead | Sonnet | Sonnet (keep) | |
| data-lead | Sonnet | Sonnet (keep) | |
| product-lead | Sonnet | Sonnet (keep) | |
| growth-lead | Sonnet | Sonnet (keep) | |
| business-lead | Sonnet | Sonnet (keep) | |
| backend-developer | Sonnet | Sonnet (keep) | Implementation is the task type that justifies Sonnet. |
| frontend-developer | Sonnet | Sonnet (keep) | Same. |
| database-engineer | Sonnet | **Sonnet; Opus for RLS + multi-tenant policy design** | Schema migrations are Sonnet. Security-critical policy design (RLS, multi-tenant data isolation) warrants Opus depth. |
| ai-engineer | Sonnet | **Opus** | Prompt design, eval system design, RAG architecture — this is depth work. The current Sonnet assignment is likely underpowered. |
| security-engineer | Sonnet | **Sonnet for triage; Opus for adversary-engineer (Full tier)** | As per report 07 recommendation. Aria/adversary-engineer must be Opus — adversarial reasoning requires it. |
| test-engineer | Sonnet | **Haiku for unit-test generation; Sonnet for invariant derivation** | Writing parameterized unit tests is mechanical. Deriving non-obvious invariants warrants Sonnet. |
| code-reviewer | Sonnet | **Haiku for P3-only reviews; Sonnet for P1/P2** | P3 reviews (style, JSDoc) are pattern-matching. Use Haiku. |
| researcher | Opus | **Sonnet by default; Opus only for deep multi-source synthesis** | Web retrieval + structured output = Sonnet. Same reasoning as research-lead. |
| technical-writer | Sonnet | **Haiku** | Document generation from a complete implementation is template-filling. |

**Projected savings from this routing alone:** report 07 estimates 5x cost reduction (Opus → Sonnet) on research workloads. Applying Haiku to test-engineer, code-reviewer (P3), and technical-writer adds another 30-40% on those workloads. Combined with prompt caching, projected total reduction: 40-60%.

---

## The Doc Gate — Earning Its Keep, or Ritual?

### The Data

~67% compliance rate on session file writing (report 00). Session files use 3 incompatible formats (report 01, F10). The `context_for_next_session` field — the most critical field for continuity — is missing from most sessions. CEO reads session files in pre-flight but cannot reliably parse them due to format inconsistency. DECISIONS.md has contradictory pricing entries with no SUPERSEDED flag. CODEBASE-MAP.md points to an archived directory. AUDIT_LOG.md has zero entries despite Waves 0-4 shipping. log.md is 9 days stale.

### The Honest Verdict

The documentation system is performing ritual, not function. The overhead is real: every task requires a session file, DECISIONS.md entry, log.md entry, and MOC update. The benefit — continuity across sessions — is undermined by inconsistent formats that make automated or agent reading unreliable. The system is paying the cost of a documentation culture without capturing the benefit.

### What to Keep

**DECISIONS.md** (keep, enforce): This is the single most valuable file in the entire memory system. Architectural decisions with rationale + date is information that genuinely cannot be recovered from code inspection. But it needs two rules: (a) every entry must have a `status: ACTIVE | SUPERSEDED` field, and (b) the CEO's pre-flight step must do a quick diff check: "does this task contradict any ACTIVE decision?" This is 1K tokens of read + 500 tokens of comparison per session — worth it.

**LONG-TERM.md** (keep, compress): User preferences and project patterns are high-signal. The current 266-line overflow is solvable with quarterly compression (topic files pattern already exists in memory). Keep the concept, enforce the 100-line cap with a Stop-hook.

**Session files** (keep structure, kill compliance theater): Session files should be written by a dedicated post-task hook, not by the CEO manually. The CEO should populate a structured template via tool call; a hook validates the format and rejects malformed files. 67% compliance becomes 100% automatically. Kill the "write a session file" step in the CEO prompt — it becomes a hook.

**log.md** (kill as manual, convert to hook): The brain activity log is a good idea expressed as a manual step that nobody does. Wire it to a PostToolUse hook: after any session file is written, append one line to log.md automatically. Zero marginal cost; 100% compliance.

**MOC system** (keep for navigation, kill as mandatory update): MOCs are valuable for document navigation — they work. Making MOC updates mandatory after every task is what produces the 67% compliance failure. MOCs should be updated on a weekly cadence by a dedicated `codebase-mapper` run, not by every individual agent on every task.

**What to kill:** The AUDIT_LOG.md as a separate file (merge into session files with a `security_review: PASS | SKIP | N/A` field). The `.claude/memory/sessions/` directory (3 files, incompatible format — consolidate into `docs/08-agents_work/sessions/`). The 12-field structured brief logging requirement in the CEO prompt (replace with a validated template tool call).

---

## Bottom Line

The 5 architectural changes that matter most, in dependency order:

### 1. Dissolve the lead layer for all non-QA tasks (highest leverage)
The CEO → leads → workers chain adds 2 overhead steps, each consuming tokens and turns, before a single line of code is written. Collapse leads into task-scoped planning passes within the CEO (or a single coordinator subagent with a fixed 5-turn budget) for Medium tasks. Retain QA Lead as an independent agent because independence is its value. This does not require rewriting agent files — it requires a change to the CEO's tier-assessment logic: Medium tasks skip the standing lead and dispatch a lightweight coordinator + workers directly.

### 2. Adopt `isolation: worktree` in agent frontmatter (highest immediate ROI)
Set `isolation: worktree` on all code worker agents. Delete the manual worktree protocol from CLAUDE.md. Run the cleanup script to recover 43 merged worktrees and 28+ GB. This change eliminates the nested-worktree bug class, the 32 GB accumulation problem, and the complex detection script in one move. The platform manages worktree lifecycle; workers just implement.

### 3. Add a pre-merge evidence gate (most critical for safety)
Block `git merge` on any branch where: (a) `semgrep --config=p/owasp-top-ten` returns Critical findings, or (b) the QA Lead session file (not build-lead JSON) does not contain `qa_verdict: PASS`. This is a Stop-hook, not a new agent. It converts the "mandatory but unenforced" QA gate into a physically enforced gate. For auth/billing/db branches, adversary-engineer (Opus/Aria) must run and return no Critical exploit chains before the gate opens. This is the single change most likely to prevent a security incident.

### 4. Correct the model gradient (fastest cost reduction)
Research-lead, researcher → Sonnet by default. Technical-writer, code-reviewer (P3 only), test-engineer (unit test generation) → Haiku. ai-engineer → Opus. Adversary-engineer → Opus. Everything else stays at Sonnet. Combined with prompt caching at 90% off cached tokens, this routing change produces the majority of the 40-60% cost reduction projected in report 07 with zero quality loss on the downgraded tasks.

### 5. Replace MANIFEST.json with SKILLS_INDEX.md + async-spec mode (removes the two biggest wastes)
Replace the 42K-token MANIFEST read with a ≤200-line `SKILLS_INDEX.md`. Consolidate `.agent/skills/` and `.claude/skills/` into one path. Add an "async-spec-trust" mode to the CEO: if the incoming task includes a `## Spec` section with measurable success criteria, skip the question loop and proceed to tier assessment. This removes $21/month in skill-discovery overhead and removes the synchronous blocking behavior that makes the system incompatible with async control.

---

*End of critique. The system is not broken — it is miscalibrated. Fix the 5 levers above and the architecture becomes appropriate for a solo founder running a serious autonomous fleet.*
