# External Research: Multi-Agent Orchestration Landscape

**Date:** 2026-05-16  
**Author:** Research Lead  
**Status:** COMPLETE  
**Confidence:** HIGH (80%+ from official docs and verified repos)

---

## Executive Summary: Top 10 Ideas to Steal

1. **Evaluator-Optimizer Loop** (Anthropic Cookbook) — Separate generation from evaluation. One agent writes, another grades with explicit PASS/FAIL. Adopt for QA Lead.
2. **Planner-Generator-Evaluator Architecture** (Anthropic Harness / Shiplight) — Three structurally separated roles prevent self-evaluation bias. Map directly to our CEO-Lead-Worker-QA pipeline.
3. **TeammateTool + Task Board** (Claude Code Agent Teams) — Official Anthropic multi-agent coordination with shared task lists, file-based inboxes, and dependency chains. Replace our ad-hoc delegation.
4. **PostToolUse Hooks as Quality Gates** (disler/claude-code-hooks) — Deterministic enforcement layer: linters, formatters, and security scans run automatically after every file write and feed errors back to the agent.
5. **Hybrid Memory Architecture** (Mem0) — Central shared state + private agent-scoped memory with 4-dimensional scoping (user/agent/session/app). Prevents the "context dumping" anti-pattern.
6. **Token-as-Performance Metric** (Anthropic Research System) — Token usage explains 80% of task success variance. More tokens = more reasoning = better results. Budget tokens, not turns.
7. **Effort Scaling Rules in Prompts** (Anthropic Research System) — Embed complexity-based scaling: "1 subagent for simple, 3-5 for standard, up to 10 for complex." Prevents over/under-investment.
8. **ComposioHQ Agent Orchestrator** — Agent-agnostic lifecycle management: spawning, activity detection, CI failure routing, PR dashboard. Steal the state machine pattern.
9. **Promptfoo in CI** — Version prompts alongside code, run regression evals on every PR, gate deploys on quality thresholds. Zero rollbacks in 6 months with 15-test suite.
10. **Progressive Skill Disclosure** (Claude Code official) — Load only name+description at startup; full SKILL.md on demand. Our 430 skills should use this pattern (we partially do).

---

## Tier 1: Claude Ecosystem Deep Dives

### 1. Anthropic's Multi-Agent Research System

**Source:** https://www.anthropic.com/engineering/multi-agent-research-system  
**Confidence:** HIGH (official Anthropic engineering blog)

**What to steal:** The orchestrator-worker architecture with explicit task decomposition. Each subagent receives: an objective, output format, tool guidance, and clear boundaries. The lead agent uses Claude Opus 4 for orchestration while subagents run Sonnet 4 — outperforming single-agent by 90%+ in internal evals.

**Key engineering insights we must adopt:**
- Token usage alone explains 80% of success variance on browsing tasks
- Embedding effort-scaling rules directly in prompts prevents 50-subagent spawning for trivial queries
- "Broad-to-narrow search strategy" — mirrors expert research behavior
- Use Claude itself to diagnose prompt failures (reduced tool completion time by 40%)
- Parallel tool calling (3+ simultaneously) cuts research time by up to 90%

**Where it falls short for us:** Their system is synchronous/sequential at the lead level. True parallel orchestration with async fan-out/fan-in (which we need for Inngest-style durable execution) is acknowledged but not yet implemented.

**Concrete artifact to steal:**
- Research lead prompt template with `<research_process>`, `<subagent_count_guidelines>`, `<delegation_instructions>` XML structure
- LLM-as-judge eval: single prompt evaluating "factual accuracy, citation accuracy, completeness, source quality, tool efficiency"
- Rainbow deployments for gradual agent rollout

**Effort to adapt:** LOW — Our research-lead.md already follows this pattern. Refine with their explicit scaling rules.

---

### 2. Anthropic Cookbook — Agent Patterns

**Source:** https://github.com/anthropics/anthropic-cookbook/tree/main/patterns/agents/  
**Stars:** ~12K (cookbook repo)  
**Confidence:** HIGH (official reference implementations)

**What to steal:** Three canonical patterns implemented as runnable notebooks:

1. **basic_workflows.ipynb** — Prompt chaining, routing, parallelization
2. **orchestrator_workers.ipynb** — Dynamic task decomposition + worker delegation
3. **evaluator_optimizer.ipynb** — Generate-evaluate-refine loop until "PASS"

The evaluator-optimizer is the most directly applicable. Implementation:
```
loop():
  response = generate(task, feedback_history)
  evaluation = evaluate(response, criteria)
  if "PASS" in evaluation:
    return response
  else:
    feedback_history.append(evaluation)
    loop()  # retry with accumulated feedback
```

The evaluator must output exactly "PASS" within `<evaluation>` tags. This binary gate prevents ambiguous quality assessments.

**Where it falls short:** These are minimal reference implementations (< 200 lines each). No error recovery, no durable execution, no cost tracking. Production needs wrapping.

**Concrete artifact to steal:**
- `prompts/research_lead_agent.md` — Full orchestrator prompt (extracted above)
- `prompts/research_subagent.md` — Worker prompt template
- The `util.py` pattern: `llm_call()` + `extract_xml()` as thin abstractions

**Effort to adapt:** LOW — We already have the pattern. Formalize the PASS/FAIL gate.

---

### 3. Claude Code Agent Teams (Official)

**Source:** https://code.claude.com/docs/en/agent-teams  
**Confidence:** HIGH (official docs, experimental feature)

**What to steal:** This IS the future of our runtime. Agent Teams provides:

- **TeammateTool** with 13 operations: spawnTeam, requestJoin, approveJoin, write, broadcast, requestShutdown, approvePlan, cleanup, etc.
- **Shared task board** at `~/.claude/tasks/{team-name}/` with dependency chains
- **File-based inboxes** for inter-agent messaging
- **Plan approval workflow** — teammates plan in read-only mode, leader approves before implementation
- **Quality gate hooks**: `TeammateIdle`, `TaskCreated`, `TaskCompleted` — exit code 2 to reject and send feedback

**Architecture:**
```
Team Lead (Opus) → creates team → spawns teammates
  |-- Teammate A (Sonnet) — owns frontend files
  |-- Teammate B (Sonnet) — owns backend files  
  |-- Teammate C (Haiku) — runs tests continuously
All share: task list, mailbox, CLAUDE.md context
```

**Where it falls short:** Experimental (needs `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`). No session resumption for in-process teammates. One team at a time. No nested teams. Fixed leader. These limitations mean we cannot yet rely on it for 24/7 autonomous operation — but we should build our agent definitions to be compatible.

**Concrete artifact to steal:**
- Hook patterns: `TeammateIdle` (exit 2 to keep working), `TaskCompleted` (exit 2 to reject)
- Subagent-as-teammate: define role once in `.claude/agents/`, use as both subagent AND team member
- Task dependency model: `addBlockedBy` array, automatic unblocking on completion
- Team size guidance: 3-5 teammates, 5-6 tasks per teammate

**Effort to adapt:** MEDIUM — Requires enabling experimental flag and restructuring our 33 agent .md files to work as both subagents and team members.

---

### 4. disler/claude-code-hooks-multi-agent-observability

**Source:** https://github.com/disler/claude-code-hooks-multi-agent-observability  
**Stars:** ~824  
**Confidence:** HIGH (working code, well-documented)

**What to steal:** The complete hook-based observability pipeline:

```
Claude Agents -> Hook Scripts (Python) -> HTTP POST -> Bun Server -> SQLite -> WebSocket -> Vue Dashboard
```

All 12 Claude Code lifecycle events are intercepted:
- `pre_tool_use.py` — blocks `rm -rf`, validates inputs
- `post_tool_use.py` — runs linters after file writes, feeds errors back as `additionalContext`
- `stop.py` — validates that plan files contain required sections before session ends
- `subagent_start.py` / `subagent_stop.py` — tracks subagent lifecycle

**Key pattern — PostToolUse as automatic QA:**
When PostToolUse detects a linter error after a file write, it returns exit code 2 with the error in `additionalContext`. The agent receives this feedback and auto-fixes in its next action — NO human intervention needed. This is a deterministic quality gate.

**Where it falls short:** Vue dashboard is nice but overkill for our needs. SQLite won't scale to multi-machine. The Builder/Validator agent split is simplistic (we need richer role taxonomy).

**Concrete artifact to steal:**
- `send_event.py` pattern — universal event forwarding
- `stop_hook_active` guard preventing infinite hook loops
- PostToolUse -> linter -> feedback -> auto-fix cycle
- Worktree-manager-skill for isolated parallel work

**Effort to adapt:** LOW — We already have hooks infrastructure conceptually. Need to implement the actual Python scripts.

---

### 5. wshobson/agents

**Source:** https://github.com/wshobson/agents  
**Stars:** ~2.5K  
**Confidence:** MEDIUM (community project, well-structured)

**What to steal:** The most comprehensive Claude Code plugin system in the wild: 185 agents, 153 skills, 80 plugins, 100 commands. Key organizational patterns:

**Plugin architecture:**
```
plugins/
  agent-orchestration/     # Multi-agent coordination
    agents/
    commands/
    skills/
  agent-teams/             # Parallel team presets
    agents/ (4)
    commands/ (7: /team-review, /team-debug, /team-feature...)
    skills/ (6)
  full-stack-orchestration/ # 7-agent pipeline
  conductor/               # Stateful project management
  qa-orchestra/            # Multi-agent QA with Chrome MCP
```

**Three-tier model allocation:**
- Tier 1 (Opus 4.7): 42 agents — architecture, security, code review
- Tier 2 (Inherit): 42 agents — complex tasks, flexible model
- Tier 3 (Sonnet 4.6): 51 agents — documentation, testing, debugging
- Tier 4 (Haiku 4.5): 18 agents — operational tasks

**Where it falls short:** 185 agents is bloat. No evidence of actual production use at scale. Many agents are "expert in X language" one-liners without deep system prompts. Quantity over quality.

**Concrete artifact to steal:**
- `/team-security` command: 4-reviewer parallel security audit (OWASP, auth, deps, secrets)
- Conductor plugin pattern: `/conductor:setup` -> `/conductor:new-track` -> `/conductor:implement` with persistent state
- Three-tier progressive skill loading (metadata -> instructions -> resources)

**Effort to adapt:** LOW — Cherry-pick patterns; don't adopt wholesale.

---

### 6. Pimzino/claude-code-spec-workflow

**Source:** https://github.com/Pimzino/claude-code-spec-workflow  
**Stars:** ~1.8K  
**Confidence:** MEDIUM (popular, well-documented npm package)

**What to steal:** Spec-driven development enforcement:

```
/spec-create → Requirements Doc → Design Doc → Tasks Doc → /spec-implement
/bug-create → /bug-analyze → /bug-fix → /bug-verify
```

Each phase requires **explicit user approval** before proceeding. The triple-layer context optimization reduces token consumption by 60-80% through pre-formatted, deduplicated context.

**Where it falls short:** Single-agent workflow (no multi-agent coordination). The approval gates are human-in-the-loop only — we want agent-to-agent approval (QA Lead approves Build Lead's spec).

**Concrete artifact to steal:**
- The 4-doc pipeline: Requirements -> Design -> Tasks -> Implementation
- Context optimization: dedicated commands that provide pre-formatted context snapshots
- npm package structure for distributable Claude Code workflows

**Effort to adapt:** LOW — We already have this conceptually in our Build Lead workflow. Formalize the doc artifacts.

---

### 7. ComposioHQ/agent-orchestrator

**Source:** https://github.com/ComposioHQ/agent-orchestrator  
**Stars:** ~1.2K  
**Confidence:** MEDIUM-HIGH (production tool, active development)

**What to steal:** Agent-agnostic orchestration for parallel coding agents. Key innovation: the **lifecycle state machine** with 6-state activity detection.

**Lifecycle States:**
```
not_started -> working -> idle -> needs_input / stuck -> done / terminated
```

**Activity Detection (required per agent):**
- `active`: Work in progress (<30s since activity)
- `ready`: Finished, resumable (30s-5min window)
- `idle`: Quiet >5min
- `waiting_input`: Permission prompt detected
- `blocked`: Unrecoverable error
- `exited`: Process dead

**Plugin system (8 slots):** Runtime, Agent, Workspace, Tracker, SCM, Notifier, Terminal, Lifecycle

**Key feature:** Agents autonomously fix CI failures. When CI breaks on a PR, the failure is automatically routed back to the agent that created it. Review comments are similarly routed back.

**Where it falls short:** Requires tmux/ConPTY for runtime. Not cloud-native. No Anthropic Routines integration. The Kanban dashboard is nice but separate from Linear.

**Concrete artifact to steal:**
- 6-state activity detection model
- CI failure auto-routing back to owning agent
- Plugin architecture with 8 replaceable slots
- `ao start` CLI pattern for spawn-and-walk-away

**Effort to adapt:** MEDIUM — The state machine and CI routing are directly applicable to our Inngest-based execution.

---

### 8. VILA-Lab/Dive-into-Claude-Code

**Source:** https://github.com/VILA-Lab/Dive-into-Claude-Code  
**Stars:** ~3K  
**Confidence:** HIGH (academic reverse-engineering, paper on arXiv)

**What to steal:** Key finding from reverse-engineering Claude Code v2.1.88: **Only 1.6% of the codebase is AI decision logic. The other 98.4% is deterministic infrastructure** — permission gates, context management, tool routing, recovery logic.

**Five architectural layers, 21 subsystems:**
- Permission system with 7 modes and ML-based classifier
- Five-layer compaction pipeline for context management
- Four extensibility mechanisms: MCP, plugins, skills, hooks
- Subagent delegation and orchestration
- Append-oriented session storage

**Recurring design pattern:** "Graduated layering over monolithic mechanisms" — Safety, context, and extensibility all use stacked independent stages rather than single solutions.

**Where it falls short:** Academic analysis, not a toolkit. No runnable code. But the architectural insights are gold for understanding HOW to build production agent infrastructure.

**Concrete artifact to steal:**
- The 98.4% infrastructure principle: invest in gates, recovery, routing — not more AI logic
- Five-layer compaction pipeline concept (for our context management)
- Graduated layering pattern for our permission/QA system

**Effort to adapt:** Conceptual only — informs architecture decisions, not copy-paste code.

---

### 9. kieranklaassen/claude-code-swarm-orchestration (Gist)

**Source:** https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea  
**Confidence:** HIGH (reverse-engineered from Claude Code binary, verified working)

**What to steal:** The complete TeammateTool API reference extracted by running `strings` on the Claude Code binary. This is the most detailed public documentation of how Agent Teams works internally.

**13 Operations fully documented:**
- `spawnTeam`, `discoverTeams`, `requestJoin`, `approveJoin`, `rejectJoin`
- `write` (targeted message), `broadcast` (expensive — N messages for N teammates)
- `requestShutdown`, `approveShutdown`, `rejectShutdown`
- `approvePlan`, `rejectPlan`, `cleanup`

**5 Orchestration Patterns:**
1. Parallel Specialists — multiple reviewers, leader synthesizes
2. Sequential Pipeline — task dependency chains via `addBlockedBy`
3. Self-Organizing Swarm — workers claim pending tasks autonomously
4. Research-Then-Implement — sync research subagent, then async implementer
5. Plan Approval Workflow — `mode: "plan"` -> leader approval -> implementation

**Message types:** shutdown_request, idle_notification, task_completed, plan_approval_request, join_request, permission_request

**Where it falls short:** Based on reverse-engineering, may break with Claude Code updates. The gist is informational only, not a runnable package.

**Concrete artifact to steal:**
- Self-organizing swarm pattern: workers continuously poll TaskList, claim pending tasks, complete, repeat
- Plan approval workflow: enforce planning before implementation
- Graceful shutdown sequence: requestShutdown -> wait for approval -> cleanup

**Effort to adapt:** LOW — This documents what Agent Teams already does. We just need to enable and use it.

---

### 10. Anthropic's "Building Effective Agents" Guide

**Source:** https://www.anthropic.com/research/building-effective-agents  
**Confidence:** HIGH (official Anthropic research)

**What to steal:** The canonical decision framework for when to use agents vs. workflows:

**5 Workflow Patterns (in order of complexity):**
1. Prompt Chaining — sequential steps with gates
2. Routing — classify input -> specialized handler
3. Parallelization — sectioning (independent) or voting (same task, multiple perspectives)
4. Orchestrator-Workers — dynamic decomposition + delegation
5. Evaluator-Optimizer — generate-evaluate loop until PASS

**3 Core Production Principles:**
1. Simplicity: agents are "just LLMs using tools based on environmental feedback in a loop"
2. Transparency: explicitly display planning steps
3. Tool Documentation: invest as much in ACI (agent-computer interface) as HCI

**Critical guidance:** "Start with simple prompts, optimize them with comprehensive evaluation, and add multi-step agentic systems only when simpler solutions fall short."

**Where it falls short:** High-level guidance only. No production code, no error handling, no cost management. The cookbook notebooks are the implementation counterpart.

**Concrete artifact to steal:**
- Decision tree: workflow (predictable) vs. agent (open-ended)
- The principle that tool documentation quality determines agent effectiveness
- Evaluator-optimizer as the go-to pattern for quality-gated outputs

**Effort to adapt:** Already adopted conceptually. Formalize in our ENGINEERING_PRINCIPLES.md.

---

## Tier 2: Frameworks Beyond Claude Code (Key Takeaways)

### Microsoft AutoGen / Agent Framework

**Source:** https://github.com/microsoft/autogen (~36K stars)

**Steal this:** Graph-based Workflows with typed nodes and edges (replacing implicit "who speaks next" with explicit flow control). Session-based state management with checkpointing for "millions of steps." Pydantic models as forced output schemas.

**Skip this:** Migrating to MAF would lock us into Microsoft's ecosystem. Their agent abstractions (AssistantAgent, UserProxyAgent) are too generic for our CEO-Lead-Worker hierarchy. Heavy dependency chain.

---

### CrewAI

**Source:** https://github.com/crewaiinc/crewai (~48K stars, 2B+ agent runs)

**Steal this:** Role-based agent definition with backstory, goal, and task assignment. Three process types: sequential, hierarchical (manager delegates), consensual (agents vote). The spec-writer -> test-generator -> code-generator -> reviewer crew pattern.

**Skip this:** Python-only runtime. Would require running alongside Claude Code rather than within it. The "Manager Agent" pattern is less reliable than explicit graph orchestration for production. 5.76x faster than LangGraph but lower success on complex reasoning (54% vs 62%).

---

### LangGraph

**Source:** https://github.com/langchain-ai/langgraph (~12K stars)

**Steal this:** Conditional edges based on state (e.g., evaluator confidence < 0.85 triggers rewrite loop). Scatter-gather pattern for parallel decomposition. The Send API for dynamic worker node creation. Built-in checkpointing with time travel.

**Skip this:** LangChain dependency chain is heavy and opinionated. We're Claude Code native — adding LangGraph would be architectural sprawl. The stateful graph concepts ARE applicable but through our Inngest implementation, not LangGraph directly.

---

### OpenHands (formerly OpenDevin)

**Source:** https://github.com/OpenHands/OpenHands (~47K stars, 77% SWE-bench)

**Steal this:** Event-driven execution with immutable event log (deterministic replay, pause/resume). Sandboxed execution in Docker containers. The composable SDK pattern: agent logic, execution environment, and interface as independently replaceable modules.

**Skip this:** Different architecture (Docker sandboxes vs. Claude Code native). Would require running as a separate system. The CodeAct paradigm (all actions as code) conflicts with our tool-use paradigm.

---

### Cline

**Source:** https://github.com/cline/cline (~38K stars)

**Steal this:** `.clinerules/` — version-controlled, file-scoped governance rules. Plan/Act mode separation (plan in read-only, act only after approval). The "propose-and-approve" interaction pattern for high-stakes operations.

**Skip this:** VS Code extension architecture, not compatible with our Claude Code CLI runtime. Single-agent, no multi-agent orchestration.

---

## Tier 3: Quality / QA / Evals

### Promptfoo

**Source:** https://github.com/promptfoo/promptfoo (~6K stars, used by OpenAI + Anthropic)

**Steal this:** Declarative YAML eval configs. GitHub Action that runs evals on every PR and posts results as comments with improvements/regressions. Claude Agent SDK evaluation support. Red-teaming and vulnerability scanning for agent prompts.

**Key pattern for us:** Version agent prompts in filenames (e.g., `qa-lead_v1.2.0.md`), run 15-test regression suite on every PR that touches agent files. Teams with this achieved 0 rollbacks in 6 months.

**Skip this:** Now owned by OpenAI. May drift toward OpenAI-first. But it's MIT licensed and the GitHub Action is standalone.

---

### Langfuse

**Source:** https://langfuse.com (open-source, self-hostable)

**Steal this:** Typed observation structures: prompts/completions for generations, document counts for retrievals, pass/fail for guardrails. Per-trace cost attribution. OpenTelemetry-native tracing. The pattern of pairing LLM-native observability with whole-stack APM.

**Skip this:** Adding a separate observability platform is overhead for MVP. Start with our `audit_log` table + hooks-based event capture. Adopt Langfuse when we have 10+ agents running in cloud.

---

### Inspect AI (UK AISI)

**Source:** https://github.com/UKGovernmentBEIS/inspect_ai (~4K stars)

**Steal this:** The opinionated primitive chain: Dataset -> Task -> Solver -> Scorer. 200+ pre-built evals. Support for running external agents (Claude Code, Codex CLI) as eval targets. VS Code log viewer for debugging eval runs.

**Skip this:** Focused on safety/capability evaluation of models, not production agent system QA. Overkill for "does our QA Lead correctly gate bad code."

---

## Concrete Patterns to Adopt

### Pattern 1: Evaluator-Optimizer QA Gate

**Lives at:** `.claude/agents/qa-lead.md` (update existing)

```yaml
---
name: qa-lead
description: "Reviews all agent work products. Runs after every task completion. Returns PASS or FAIL with structured feedback."
model: sonnet
tools: ["Read", "Grep", "Glob", "Bash"]
maxTurns: 8
---
```

**System prompt must include:**
```
You evaluate work products against acceptance criteria. You MUST output one of:
- <verdict>PASS</verdict> — work meets all criteria
- <verdict>FAIL</verdict> — work has issues

When FAIL, provide:
- <issues> specific problems found </issues>
- <fix_instructions> exact steps to resolve </fix_instructions>

Evaluation criteria:
1. Does the output match the spec/brief?
2. Are there type errors, lint failures, or broken tests?
3. Is the code/doc quality at production grade?
4. Are there security concerns?

Temperature: 0. Be strict. Never pass ambiguous work.
```

---

### Pattern 2: PostToolUse Hook Quality Gate

**Lives at:** `.claude/hooks/post_tool_use.py`

```python
#!/usr/bin/env python3
"""PostToolUse hook: runs after every Write/Edit tool use.
Exit 0 = allow, Exit 2 = block with feedback."""

import sys, json, subprocess

event = json.loads(sys.stdin.read())
tool = event.get("tool_name")
file_path = event.get("tool_input", {}).get("file_path", "")

if tool in ("Write", "Edit") and file_path.endswith((".ts", ".tsx")):
    # Run TypeScript check
    result = subprocess.run(
        ["npx", "tsc", "--noEmit", "--pretty"],
        capture_output=True, text=True, cwd=event.get("cwd")
    )
    if result.returncode != 0:
        # Feed errors back to agent as additionalContext
        print(json.dumps({
            "additionalContext": f"TypeScript errors found:\n{result.stdout}\nFix these before proceeding."
        }))
        sys.exit(2)  # Block — agent will auto-fix

sys.exit(0)  # Allow
```

---

### Pattern 3: Structured Agent Handoff Protocol

**Lives at:** `.claude/memory/HANDOFF-PROTOCOL.md`

**Pattern:** Never pass full context. Use typed handoff objects:

```json
{
  "from_agent": "build-lead",
  "to_agent": "qa-lead",
  "task_id": "ADA-42",
  "branch": "feat/auth-flow",
  "worktree": ".worktrees/auth-flow",
  "files_changed": ["src/auth/login.ts", "src/auth/middleware.ts"],
  "summary": "Implemented login flow with Supabase Auth. Needs QA for session handling edge cases.",
  "acceptance_criteria": ["Login redirects correctly", "Session persists across tabs", "Logout clears all state"],
  "context_tokens_saved": "~15,000 (vs full conversation history)"
}
```

This reduces handoff from 5,000-20,000 tokens to 200-500 tokens (per Augment Code research).

---

### Pattern 4: Agent Prompt Versioning in CI

**Lives at:** `.github/workflows/agent-eval.yml`

```yaml
name: Agent Prompt Regression
on:
  pull_request:
    paths: ['.claude/agents/**', '.agent/skills/**']

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: promptfoo/promptfoo-action@v1
        with:
          config: tests/agent-evals.yaml
          comment-on-pr: true
```

Eval config tests each agent against 3-5 regression scenarios. PR blocked if any scenario regresses.

---

### Pattern 5: Memory Scoping (Mem0 + File-based)

**Lives at:** `.claude/memory/` (existing) + Mem0 integration

**Architecture:**
```
Shared (all agents read):
  .claude/memory/DECISIONS.md       — architectural decisions
  .claude/memory/CODEBASE-MAP.md    — current code state
  .claude/memory/LONG-TERM.md       — cross-session facts

Agent-scoped (private):
  .claude/agent-memory/{agent-name}/ — agent-specific learnings
  
Session-scoped (ephemeral):
  Task board, inbox messages, handoff objects

User-scoped (in Mem0):
  user preferences, project patterns, recurring issues
```

**Critical rule from Mem0 research:** "Design your memory architecture before you write your first agent. Answer three questions: Where does shared state reside? Which agents access what? How do systems resolve conflicting facts?"

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Context Dumping on Handoff

**What it is:** Passing full conversation history between agents at every handoff.

**Why it's deadly:** Token costs scale quadratically — a 50-message thread with 4 handoffs means the 5th agent processes ~200 messages. At $15/M output tokens, this burns budget fast AND degrades reasoning quality (agents lose focus in long contexts).

**What to do instead:** Pass typed handoff objects (200-500 tokens). Let receiving agents READ files from the shared filesystem if they need more context. Never forward raw conversation transcripts.

**Source:** https://www.augmentcode.com/guides/multi-agent-orchestration-architecture-guide

---

### Anti-Pattern 2: Self-Evaluation (Generator = Judge)

**What it is:** Asking the same agent that produced output to evaluate its own quality.

**Why it's deadly:** Self-evaluation bias is well-documented. When one model plans, generates, AND evaluates, you compress three distinct cognitive tasks into one pass. The evaluator can't catch its own blind spots. Production systems at OpenAI, Anthropic, and Cognition ALL converged on structurally separating evaluation from generation.

**What to do instead:** Always use a DIFFERENT agent (ideally different model tier) for evaluation. Our QA Lead must NEVER be the same agent instance that produced the work. The Planner-Generator-Evaluator architecture is the minimum viable quality system.

**Source:** https://www.shiplight.ai/blog/planner-generator-evaluator-multi-agent-qa

---

### Anti-Pattern 3: Infinite Handoff Loops

**What it is:** Agent A passes to B, B passes to C, C passes back to A. Each agent replans because nobody owns the task, and context loss compounds with every transfer.

**Why it's deadly:** This is the #1 failure mode in multi-agent systems. Each handoff loses information. After 3+ handoffs, agents are operating on degraded context and making decisions based on summaries-of-summaries.

**What to do instead:** 
1. Assign clear OWNERSHIP — one agent owns each task from start to finish
2. Set `maxTurns` on all agents (we already do this)
3. Use dependency chains (`addBlockedBy`) rather than circular delegation
4. Implement loop detection: if the same task returns to the same agent twice, escalate to human

**Source:** https://gurusup.com/blog/multi-agent-orchestration-guide

---

## Bonus Anti-Patterns (Quick Hits)

- **Over-spawning agents:** Anthropic found teams spawning 50 subagents for simple queries. Solution: embed scaling rules directly in prompts (1 for simple, 3-5 for standard).
- **Memory writes blocking response:** Making memory updates synchronous adds latency the user feels. Always async.
- **Cascade hallucination:** One hallucinated detail in step 2 propagates through 12 downstream agents, each treating fiction as ground truth. Solution: shared memory with validation checkpoints.
- **185-agent bloat:** wshobson/agents proves that quantity != quality. 33 well-crafted agents (our approach) beats 185 thin ones.

---

## Linear Integration Patterns

**Source:** https://github.com/linear/linear-agent-demo + https://github.com/calltelemetry/openclaw-linear-plugin

**Key findings:**
- Linear Agent Sessions track lifecycle of agent tasks (created when agent mentioned/delegated)
- Webhooks fire on issue create/update/delete — our Cloudflare Worker bridge is the right pattern
- OpenClaw Linear plugin dispatches issues in dependency order, up to 3 in parallel
- Linear's Business/Enterprise plans include Automations for auto-triage

**For Beamix:** Our existing pattern (Linear webhook -> Cloudflare Worker -> HMAC trust spec -> Claude Code Routine) is architecturally sound. Enhance with:
- Session state tracking (Linear Agent Session model)
- Parallel dispatch (up to 3 issues simultaneously)
- Auto-routing CI failures back to the originating agent via Linear comment

---

## Anthropic Routines — Current State

**Source:** Multiple (DevOps.com, InfoQ, pasqualepillitteri.it)  
**Confidence:** HIGH (official feature, research preview since April 14, 2026)

**What they are:** Cloud-hosted automated workflows. Configure prompt + repo + connectors once, then routine runs unattended on:
- **Schedule:** hourly, daily, weekday, or weekly
- **GitHub event:** PR opened, release published
- **API call:** any service hits the routine endpoint

**Limits (preview):**
- Pro: 5 daily
- Max: 15 daily
- Team/Enterprise: 25 daily

**For Beamix:** Routines ARE our cloud workforce. Current architecture is correct:
- Nightly: code quality scan, security audit, dependency updates
- On PR: automated code review, test coverage check
- On Linear webhook: task dispatch to appropriate agent

**No public templates exist yet.** We'd be early adopters building our own.

---

## Highest-Leverage Moves for Beamix

### Move 1: Implement PostToolUse Quality Hooks (1 day)
Add hooks that run TypeScript checks, ESLint, and format verification after every file write. Agents auto-fix errors without human intervention. This single change eliminates the majority of our "QA Lead catches type errors" cycles.

### Move 2: Formalize the Evaluator-Optimizer Gate (2 days)
Update `qa-lead.md` to use explicit PASS/FAIL verdicts with structured feedback. Add `TeammateIdle` / `TaskCompleted` hooks that enforce QA review before any task can be marked complete. Binary gate, no ambiguity.

### Move 3: Adopt Agent Teams for Parallel Work (3 days)
Enable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Restructure our 33 agent .md files to work as both subagents (quick delegation) and team members (parallel coordination). Start with the build pipeline: frontend + backend + test teammates working in parallel.

### Move 4: Add Promptfoo Regression Testing (2 days)
Version our agent prompts. Create 3-5 test scenarios per critical agent (QA Lead, Build Lead, CEO). Run on every PR that touches `.claude/agents/`. Gate merges on eval results. Target: 0 agent regressions in production.

### Move 5: Implement Typed Handoff Protocol (1 day)
Replace any remaining "pass full context" patterns with typed JSON handoff objects. Each handoff is max 500 tokens. Receiving agent reads files from filesystem for additional context. Document the protocol in `.claude/memory/HANDOFF-PROTOCOL.md`.

---

## Sources

1. https://www.anthropic.com/engineering/multi-agent-research-system — Anthropic's multi-agent research system
2. https://github.com/anthropics/anthropic-cookbook/tree/main/patterns/agents/ — Official agent patterns
3. https://code.claude.com/docs/en/agent-teams — Official Agent Teams documentation
4. https://code.claude.com/docs/en/sub-agents — Official subagent documentation
5. https://github.com/disler/claude-code-hooks-multi-agent-observability — Hook-based observability
6. https://github.com/wshobson/agents — 185-agent plugin system
7. https://github.com/Pimzino/claude-code-spec-workflow — Spec-driven development
8. https://github.com/ComposioHQ/agent-orchestrator — Agent lifecycle management
9. https://github.com/VILA-Lab/Dive-into-Claude-Code — Academic reverse-engineering
10. https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea — TeammateTool complete reference
11. https://www.anthropic.com/research/building-effective-agents — Canonical agent patterns guide
12. https://github.com/promptfoo/promptfoo — Agent eval in CI
13. https://mem0.ai/blog/multi-agent-memory-systems — Memory architecture patterns
14. https://www.shiplight.ai/blog/planner-generator-evaluator-multi-agent-qa — PGE architecture
15. https://github.com/nwiizo/ccswarm — Git worktree multi-agent orchestration
16. https://langfuse.com — Agent observability
17. https://github.com/UKGovernmentBEIS/inspect_ai — Agent evaluation framework
18. https://github.com/comet-ml/opik — Agent evals and optimization
19. https://www.augmentcode.com/guides/multi-agent-orchestration-architecture-guide — Handoff patterns
20. https://github.com/linear/linear-agent-demo — Linear agent integration
21. https://github.com/calltelemetry/openclaw-linear-plugin — Linear multi-agent routing
22. https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices — Skill authoring
23. https://github.com/rohitg00/awesome-claude-code-toolkit — 135 agents, 35 skills, 20 hooks
24. https://promptbuilder.cc/blog/prompt-testing-versioning-ci-cd-2025 — Prompt versioning in CI
