# Skills the CEO + CTO Need (May 2026)

Research conducted 2026-05-05 by researcher agent (Opus 4.6).

---

## Already in our .agent/skills/ (inventory by topic)

### Orchestration & Multi-Agent

| Local skill | Lines | Quality | Keep or replace | Notes |
|-------------|-------|---------|-----------------|-------|
| `multi-agent-patterns` | 262 | **A** | KEEP | Best local skill. Covers supervisor, peer-to-peer, hierarchical. Token economics table (1x/4x/15x). Source: muratcankoylan/Agent-Skills-for-Context-Engineering |
| `dispatching-parallel-agents` | 182 | **B** | KEEP | Good decision tree for when to parallelize. Practical pattern: identify domains, create focused agent tasks. Focused on debugging but generalizable. |
| `agent-orchestration-multi-agent-optimize` | 241 | **B** | KEEP | Profiling, workload distribution, cost-aware orchestration. Has $TARGET/$BUDGET_CONSTRAINTS args. |
| `full-stack-orchestration-full-stack-feature` | 137 | **D** | REPLACE | Stub quality — generic "clarify goals" boilerplate with no real patterns. |
| `workflow-orchestration-patterns` | 335 | **C** | KEEP (niche) | Temporal-focused, not agent-team focused. Useful for durable workflow design but not CEO/CTO orchestration. |
| `autonomous-agent-patterns` | 763 | **B+** | KEEP | Largest skill. Tool integration, permission systems, HITL workflows. Cline/Codex-inspired. |
| `autonomous-agents` | 72 | **C** | KEEP (supplement) | Short but has key insight: "Autonomy is earned, not granted." Good philosophical grounding. |
| `design-orchestration` | — | **?** | CHECK | Not assessed in detail. |

### Memory & Context

| Local skill | Lines | Quality | Keep or replace | Notes |
|-------------|-------|---------|-----------------|-------|
| `context-compression` | 270 | **A** | KEEP | Best context skill. Anchored iterative summarization, opaque compression, regenerative summary. Tokens-per-task metric. Source: muratcankoylan |
| `context-degradation` | 238 | **A** | KEEP | Lost-in-middle, poisoning, distraction, clash patterns. Essential for diagnosing CEO context rot. Source: muratcankoylan |
| `context-optimization` | 186 | **A** | KEEP | Compaction, masking, caching strategies. Observation masking (tool outputs = 80% of tokens). Source: muratcankoylan |
| `context-fundamentals` | 192 | **B+** | KEEP | Good primer. Prerequisite for other context skills. Source: muratcankoylan |
| `context-window-management` | — | **B** | KEEP | Serial position effect, lost-in-the-middle, summarization vs retrieval. vibeship-spawner source. |
| `context-management-context-restore` | — | **D** | REPLACE | Stub — "Clarify goals, constraints" boilerplate. No real patterns. |
| `context-management-context-save` | — | **D** | REPLACE | Same stub quality. No actionable content. |
| `context-manager` | — | **C** | KEEP (supplement) | Claims "elite specialist" but community source, stub instructions. |
| `memory-systems` | 228 | **A** | KEEP | Short-term, long-term, graph-based memory architectures. Knowledge graphs, temporal awareness. Source: muratcankoylan |
| `agent-memory-systems` | 71 | **C** | KEEP (supplement) | Short. "Retrieval problem, not storage problem" insight. vibeship-spawner. |
| `agent-memory-mcp` | — | **C** | KEEP (reference) | Describes agentMemory MCP server setup. Useful if we build custom MCP. |
| `conversation-memory` | 65 | **C** | KEEP (supplement) | Short-term, long-term, entity-based. When to remember vs forget. vibeship-spawner. |
| `cost-optimization` | 288 | **C** | KEEP (wrong domain) | Cloud cost optimization (AWS/Azure/GCP), NOT token/agent cost. Misleading name. |

### Planning & Delegation

| Local skill | Lines | Quality | Keep or replace | Notes |
|-------------|-------|---------|-----------------|-------|
| `plan-writing` | 154 | **B** | KEEP | Structured task planning. 2-5 min tasks, verification criteria. Source: obra/superpowers. |
| `writing-plans` | 121 | **B** | KEEP | "Assume engineer has zero context." DRY/YAGNI/TDD. Good for CTO briefs. |
| `executing-plans` | 81 | **B** | KEEP | Load plan, batch execution, checkpoints. Good complement to writing-plans. |
| `concise-planning` | 67 | **B** | KEEP | Atomic checklist generation. Quick-use. |

### Quality Gates

| Local skill | Lines | Quality | Keep or replace | Notes |
|-------------|-------|---------|-----------------|-------|
| `clarity-gate` | 22 | **D** | REPLACE | Stub — just a description of "9-point verification." No actual checklist. |
| `code-review-excellence` | 42 | **C** | KEEP (thin) | Short but has correct principles: correctness, security, performance, maintainability. |
| `agent-evaluation` | 68 | **C** | KEEP (supplement) | "Agents that aced benchmarks fail in production." Behavioral regression tests. vibeship-spawner. |

### Integration (Linear / GitHub / MCP)

| Local skill | Lines | Quality | Keep or replace | Notes |
|-------------|-------|---------|-----------------|-------|
| `linear-automation` | 183 | **B+** | KEEP | Good tool sequences. Create/search/update issues, projects, cycles. Requires Rube MCP (Composio). |
| `github-automation` | 232 | **B+** | KEEP | Issues, PRs, branches, CI/CD via Rube MCP. Good pitfall notes (pagination, permissions). |
| `mcp-builder` | 241 | **B+** | KEEP | How to build MCP servers. API coverage vs workflow tools. Good for building Linear MCP if needed. |
| `github-actions-templates` | — | **?** | CHECK | Not assessed. |
| `github-workflow-automation` | — | **?** | CHECK | Not assessed. |

---

## CEO Orchestrator Skill Stack (recommended load order)

The CEO's job: receive tickets, decide teams, write briefs, validate returns, synthesize, update memory, manage costs.

| Priority | Skill name | Source | When to load | Token cost est. |
|----------|-----------|--------|--------------|-----------------|
| 1 | `multi-agent-patterns` | Local (.agent/skills/) | Every session — foundational | ~4K tokens |
| 2 | `context-compression` | Local (.agent/skills/) | Every session — context discipline | ~4K tokens |
| 3 | `dispatching-parallel-agents` | Local (.agent/skills/) | When spawning 2+ leads in parallel | ~3K tokens |
| 4 | `plan-writing` or `writing-plans` | Local (.agent/skills/) | When writing structured briefs | ~2K tokens |
| 5 | `linear-automation` | Local (.agent/skills/) | When processing Linear tickets or posting comments | ~3K tokens |
| 6 | `context-degradation` | Local (.agent/skills/) | When debugging quality drops in long sessions | ~3.5K tokens |
| 7 | `memory-systems` | Local (.agent/skills/) | When designing/updating DECISIONS.md or session files | ~3.5K tokens |
| 8 | **NEW: `orchestrator-cost-control`** | Vendor from Anthropic docs + MindStudio pattern | When managing fleet token budgets | ~3K tokens |
| 9 | **NEW: `board-meeting-protocol`** | Custom (from existing board meeting pattern in docs/08-agents_work/) | Weekly board meetings | ~2K tokens |
| 10 | **NEW: `structured-brief-authoring`** | Custom (synthesized from BMAD + SuperClaude /spawn) | Every delegation to a lead | ~2K tokens |

**CEO loads max 3 per session.** Typical load: #1 + #2 + (one situational from #3-#10).

---

## CTO Engineering-Chief Skill Stack (recommended)

The CTO's job: receive briefs, plan implementation across leads, manage worktrees, coordinate parallel workers, hand off to QA.

| Priority | Skill name | Source | When to load | Token cost est. |
|----------|-----------|--------|--------------|-----------------|
| 1 | `multi-agent-patterns` | Local (.agent/skills/) | Every session — foundational | ~4K tokens |
| 2 | `dispatching-parallel-agents` | Local (.agent/skills/) | When spawning Code/Design/QA workers in parallel | ~3K tokens |
| 3 | `writing-plans` | Local (.agent/skills/) | When breaking feature brief into worker tasks | ~2K tokens |
| 4 | `executing-plans` | Local (.agent/skills/) | When monitoring worker execution batches | ~1.5K tokens |
| 5 | `github-automation` | Local (.agent/skills/) | PR creation, branch management, code review coordination | ~3.5K tokens |
| 6 | `autonomous-agent-patterns` | Local (.agent/skills/) | When designing worker permission/tool boundaries | ~10K tokens (large!) |
| 7 | `code-review-excellence` | Local (.agent/skills/) | QA handoff review | ~1K tokens |
| 8 | `context-optimization` | Local (.agent/skills/) | When workers hit context limits | ~3K tokens |
| 9 | **NEW: `worktree-lifecycle`** | Custom (from CLAUDE.md git worktree protocol) | Every code task | ~1.5K tokens |
| 10 | **NEW: `qa-gate-protocol`** | Custom (from existing QA Lead patterns) | Merge time | ~1.5K tokens |

**CTO loads max 3 per session.** Typical load: #1 + #2 + (one situational).

---

## Context + Token Management — the Discipline

The 10 specific techniques the CEO+CTO must apply, sourced from Anthropic official docs and OSS patterns.

### 1. Prompt Caching (90% cost reduction on cached tokens)
- Cache lifetime: 5 minutes (default) or 1 hour (2x base cost)
- Cache read cost: 0.1x base input price (= 90% savings)
- Cache write cost: 1.25x base (5-min) or 2x base (1-hour)
- **Structure for orchestrators:** tools (cached) -> system instructions (cached) -> agent registry (cached) -> growing conversation (auto-cached)
- Minimum cacheable: 4096 tokens (Opus/Haiku 4.5), 2048 tokens (Sonnet 4.6)
- Max 4 explicit cache breakpoints per request
- **Source:** [Anthropic Prompt Caching Docs](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching) — Confidence: HIGH

### 2. Auto-Compaction Threshold
- Triggers at 83.5% context fill
- Manual `/compact` recommended at 60% (proactive)
- 33K tokens reserved for summarization process
- **What gets lost first:** reasoning about "why" decisions were made, architectural rationale, earlier exclusions
- **Fix:** Move security-critical rules to CLAUDE.local.md (re-read after compaction)
- **Source:** [orchestrator.dev](https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/) — Confidence: HIGH

### 3. `/clear` Between Unrelated Tasks
- Saves 40-70% per CLAUDE.md guidance
- Stale context wastes tokens on every subsequent message
- Use `/rename` before clearing so sessions are findable via `/resume`
- **Source:** [code.claude.com/docs/en/costs](https://code.claude.com/docs/en/costs) — Confidence: HIGH

### 4. Model Routing (5-10x savings)
- Opus orchestrator + Haiku sub-agents = 5-10x token cost reduction
- Specify `model: haiku` in subagent YAML frontmatter for simple tasks
- Sonnet for leads/most workers (80% of tasks)
- Opus only for: security audits, deep research, complex AI reasoning
- **Source:** [MindStudio orchestrator pattern](https://www.mindstudio.ai/blog/smart-orchestrator-cheaper-sub-agent-models-claude-code) — Confidence: HIGH

### 5. Subagent Context Isolation
- Each subagent runs in own context window — verbose output stays there
- Only summaries return to orchestrator
- Delegate test runs, log parsing, doc fetching to subagents
- **Source:** [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents) — Confidence: HIGH

### 6. CLAUDE.md Under 200 Lines
- Every line competes for attention at context squeeze
- Move specialized instructions into on-demand skills
- Golden rule: "Would removing this line cause Claude to make a mistake? If not, cut it."
- **Source:** [orchestrator.dev](https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/) — Confidence: HIGH

### 7. MEMORY.md Under 200 Lines
- First 200 lines auto-load each session (hard threshold)
- Compress quarterly; archive old entries
- Index entries should be one line under ~200 chars; move detail into topic files
- **Source:** [orchestrator.dev](https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/) + CLAUDE.md — Confidence: HIGH

### 8. Subagent Memory Isolation (v2.1.33+)
- Each named subagent gets isolated memory store
- Supports `user`, `project`, or `local` scope
- First 200 lines injected into system prompt at startup
- Subagents do NOT share memory with coordinator or each other
- Shared `claude-progress.txt` enables coordination without context contamination
- **Source:** [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents) — Confidence: HIGH

### 9. Hooks for Preprocessing (context reduction)
- PreToolUse hooks can filter test output to show only failures
- Reduces context from tens of thousands of tokens to hundreds
- Example: grep ERROR from logs before Claude sees them
- **Source:** [code.claude.com/docs/en/costs](https://code.claude.com/docs/en/costs) — Confidence: HIGH

### 10. Agent Team Token Discipline
- Agent teams use ~7x more tokens than standard sessions (teammates in plan mode)
- Keep teams to 3-5 teammates max
- 5-6 tasks per teammate is the sweet spot
- Use Sonnet for teammates, not Opus
- Clean up teams when done — idle teammates still consume tokens
- Average enterprise cost: ~$13/dev/active day, $150-250/dev/month
- **Source:** [code.claude.com/docs/en/costs](https://code.claude.com/docs/en/costs) + [code.claude.com/docs/en/agent-teams](https://code.claude.com/docs/en/agent-teams) — Confidence: HIGH

---

## MCP Usage Patterns for Orchestrators

### Recommended MCP Config for CEO

```yaml
# CEO frontmatter MCPs
mcps:
  - linear:        # Ticket intake, comment posting, status updates
      required: true
      fallback: "gh CLI for GitHub-side; flag user for Linear"
  - supabase:      # Read session files, check memory state
      required: false
      fallback: "direct SQL via Bash"
  - context7:      # Library docs lookup before WebSearch
      required: false
      fallback: "WebSearch"
```

**CEO MCP obligations:**
- MUST use Linear MCP for all ticket operations (intake, comment, status update)
- SHOULD use GitHub MCP for PR status checks and merge approvals
- Linear MCP currently available via Rube MCP (Composio) — requires `RUBE_MANAGE_CONNECTIONS` with toolkit `linear`
- **Source:** Local `linear-automation` skill + [code.claude.com/docs/en/costs](https://code.claude.com/docs/en/costs) (prefer CLI tools for context efficiency)

### Recommended MCP Config for CTO

```yaml
# CTO frontmatter MCPs
mcps:
  - github:        # PR creation, branch management, code review
      required: true
      fallback: "gh CLI"
  - supabase:      # DB schema checks, migration verification
      required: true
      fallback: "flag user"
  - ide:           # TypeScript diagnostics before merge
      required: false
      fallback: "tsc --noEmit via Bash"
  - playwright:    # E2E test coordination
      required: false
      fallback: "delegate to QA Lead"
```

**CTO MCP obligations:**
- MUST use GitHub MCP (or `gh` CLI) for all branch/PR operations
- MUST use IDE MCP `getDiagnostics` before approving merge
- SHOULD use Supabase MCP for schema verification during DB-touching features

### MCP Context Efficiency Note
From Anthropic docs: "Prefer CLI tools when available — tools like `gh`, `aws`, `gcloud` are more context-efficient than MCP servers because they don't add per-tool listing overhead." MCP tool definitions are deferred by default (only names enter context until Claude uses a tool), but CLI tools add zero overhead.
- **Source:** [code.claude.com/docs/en/costs](https://code.claude.com/docs/en/costs) — Confidence: HIGH

---

## Commands the Orchestrator Should Expose

Based on SuperClaude Framework patterns, BMAD Method phases, and Anthropic agent-teams docs.

### CEO Commands

| Command | What it does | Source pattern |
|---------|-------------|----------------|
| `/board-meeting` | Spawn 5-7 expert agents (reductionist, storyteller, executor, advocate, etc.) to critique a topic adversarially. Each writes findings, CEO synthesizes minutes. | Beamix existing pattern (docs/08-agents_work/2026-04-24-BOARD-*) + SuperClaude `/sc:spec-panel` |
| `/dispatch` | Receive ticket -> classify tier (Quick/Medium/Large) -> assemble team -> write structured briefs -> spawn leads | SuperClaude `/sc:spawn` (Epic->Story->Task decomposition) + BMAD orchestrator |
| `/halt-all` | Emergency stop: message all active teammates/subagents to shut down, clean up teams | Anthropic agent-teams: "Ask the lead to clean up" pattern |
| `/digest` | Aggregate all session files from past 24h/week, summarize into brain/log.md entry | Custom — uses memory-systems patterns |
| `/retro` | Post-task retrospective: what worked, what didn't, cost analysis, lessons learned | SuperClaude `/sc:reflect` + BMAD `bmad-retrospective` |
| `/cost-check` | Run `/usage` across active sessions, aggregate token spend, compare to budget | Anthropic `/usage` command + cost tracking patterns |
| `/escalate` | Binary-ping to Adam via Telegram with structured blocker report | Custom — Beamix-specific |
| `/validate-return` | Check lead return for required fields: workers_spawned, qa_verdict, session_file, branch, files_changed | Custom — from CLAUDE.md layer contract |

### CTO Commands

| Command | What it does | Source pattern |
|---------|-------------|----------------|
| `/plan-impl` | Break feature brief into worker tasks with deps, generate task list | SuperClaude `/sc:workflow` + BMAD `bmad-create-epics-and-stories` |
| `/spawn-workers` | Create worktrees, spawn parallel workers with focused briefs, model routing | Anthropic subagent docs + SuperClaude `/sc:task` |
| `/merge-gate` | Hand off to QA Lead, require PASS before merge, run IDE diagnostics | BMAD `bmad-check-implementation-readiness` (PASS/CONCERNS/FAIL) |
| `/worktree-status` | Run `git worktree list`, check branch status for all active workers | Git worktree protocol from CLAUDE.md |
| `/integrate` | After QA PASS: merge branches, resolve conflicts, verify build | SuperClaude `/sc:build` + `/sc:git` |

---

## Top 10 Lifts for Beamix

Specific files to vendor-copy or create, with source URLs.

### 1. NEW: `orchestrator-cost-control` skill
**Action:** Create custom skill from Anthropic prompt caching docs + MindStudio orchestrator pattern
**Sources:**
- [Anthropic Prompt Caching](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching)
- [MindStudio Orchestrator Pattern](https://www.mindstudio.ai/blog/smart-orchestrator-cheaper-sub-agent-models-claude-code)
- [Claude Code Cost Management](https://code.claude.com/docs/en/costs)
**Content:** Prompt caching config, model routing table, per-agent budget caps, compaction discipline, monitoring via `/usage`
**Priority:** CRITICAL — directly saves money

### 2. NEW: `structured-brief-authoring` skill
**Action:** Create custom skill synthesizing BMAD orchestrator handoff format + SuperClaude `/sc:spawn` decomposition
**Sources:**
- [BMAD Workflow Map](https://docs.bmad-method.org/reference/workflow-map/)
- [SuperClaude Commands](https://github.com/SuperClaude-Org/SuperClaude_Framework/blob/master/docs/user-guide/commands.md)
**Content:** Brief template with: objective, constraints, expected output format, tools available, model to use, validation criteria, max turns
**Priority:** HIGH — every delegation depends on brief quality

### 3. NEW: `qa-gate-protocol` skill
**Action:** Create from BMAD `bmad-check-implementation-readiness` pattern (PASS/CONCERNS/FAIL)
**Source:** [BMAD Workflow Map](https://docs.bmad-method.org/reference/workflow-map/)
**Content:** Pre-merge checklist, TypeScript diagnostics, test pass requirement, structured verdict format
**Priority:** HIGH — QA gate is "sacred" per CLAUDE.md

### 4. REPLACE: `full-stack-orchestration-full-stack-feature` (137 lines, grade D)
**Action:** Replace with content from Anthropic agent-teams docs (practical orchestration for full-stack features)
**Source:** [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
**Content:** Team setup, task assignment, file conflict avoidance, quality hooks (TeammateIdle, TaskCreated, TaskCompleted)
**Priority:** MEDIUM

### 5. REPLACE: `clarity-gate` (22 lines, grade D)
**Action:** Replace stub with real quality gate checklist from BMAD implementation-readiness + Anthropic hooks
**Sources:**
- [BMAD Workflow Map](https://docs.bmad-method.org/reference/workflow-map/) — `bmad-check-implementation-readiness`
- [Claude Code Agent Teams Hooks](https://code.claude.com/docs/en/agent-teams)
**Priority:** MEDIUM

### 6. REPLACE: `context-management-context-restore` + `context-management-context-save` (both grade D)
**Action:** Replace both stubs with content from orchestrator.dev memory best practices
**Source:** [orchestrator.dev Claude Code Agent Memory 2026](https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/)
**Content:** 4-layer memory architecture, compaction survival rules, initializer+coding agent pattern, session-boundary instructions
**Priority:** MEDIUM

### 7. NEW: `worktree-lifecycle` skill
**Action:** Extract and formalize the git worktree protocol already in CLAUDE.md into a loadable skill
**Source:** Local CLAUDE.md (already written, just needs skill packaging)
**Content:** Detection from inside worktree, child worktree creation, main repo root resolution, cleanup
**Priority:** MEDIUM — CTO loads this every code task

### 8. UPGRADE: `linear-automation` (183 lines, grade B+)
**Action:** Add Beamix-specific patterns: webhook intake, ticket classification (Quick/Medium/Large), comment-back synthesis
**Source:** Local skill + [Rube MCP docs](https://rube.app/mcp)
**Priority:** MEDIUM — needed for CEO ticket intake flow

### 9. NEW: `board-meeting-protocol` skill
**Action:** Formalize existing board meeting pattern (7 expert agents, adversarial critique, synthesis)
**Source:** Local `docs/08-agents_work/2026-04-24-BOARD-MEETING-MINUTES.md` + SuperClaude `/sc:spec-panel`
**Priority:** LOW — weekly use only

### 10. NEW: `subagent-definition-patterns` skill
**Action:** Codify Anthropic's official subagent definition format: YAML frontmatter, scope, model, tools, memory, skills
**Source:** [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
**Content:** Quickstart template, scope priority table (managed > CLI > project > user > plugin), per-agent memory config, tool allowlists, model routing
**Priority:** HIGH — foundation for the entire agent fleet definition

---

## Appendix: Key External Sources Referenced

| Source | URL | Date | Confidence |
|--------|-----|------|------------|
| Anthropic Prompt Caching | https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching | 2026 | HIGH |
| Claude Code Agent Teams | https://code.claude.com/docs/en/agent-teams | 2026 (v2.1.32+) | HIGH |
| Claude Code Subagents | https://code.claude.com/docs/en/sub-agents | 2026 (v2.1.33+) | HIGH |
| Claude Code Cost Management | https://code.claude.com/docs/en/costs | 2026 | HIGH |
| Anthropic Building Effective Agents | https://www.anthropic.com/research/building-effective-agents | 2025 | HIGH |
| orchestrator.dev Agent Memory 2026 | https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/ | 2026-04 | MEDIUM (community) |
| MindStudio Orchestrator Pattern | https://www.mindstudio.ai/blog/smart-orchestrator-cheaper-sub-agent-models-claude-code | 2026 | MEDIUM (community) |
| SuperClaude Framework Commands | https://github.com/SuperClaude-Org/SuperClaude_Framework/blob/master/docs/user-guide/commands.md | 2026-01 | MEDIUM (OSS, 20.4K stars) |
| BMAD Method Workflow Map | https://docs.bmad-method.org/reference/workflow-map/ | 2025 | MEDIUM (OSS) |
| muratcankoylan Context Engineering Skills | https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering | 2025-2026 | HIGH (already vendored locally) |
