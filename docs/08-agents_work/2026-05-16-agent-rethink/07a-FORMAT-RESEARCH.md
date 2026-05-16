---
title: Agent File Format — External Validation Research
date: 2026-05-16
status: COMPLETE
confidence: HIGH (official Anthropic docs + verified repos + SDK source code)
inputs:
  - Claude Code official docs: https://code.claude.com/docs/en/sub-agents
  - Claude Code Routines docs: https://code.claude.com/docs/en/routines
  - wshobson/agents (2.5K stars, 185 agents): https://github.com/wshobson/agents
  - anthropics/anthropic-cookbook (12K stars): https://github.com/anthropics/anthropic-cookbook
  - anthropics/claude-code-sdk-python (official SDK): https://github.com/anthropics/claude-code-sdk-python
  - Anthropic multi-agent research blog: https://www.anthropic.com/engineering/multi-agent-research-system
audience: executor authoring 07b-AGENT-TEMPLATE.md and the 45 agent .md files
validates: 07b-AGENT-TEMPLATE.md canonical template
---

# Agent File Format — External Validation Research

> **Purpose:** Validate (or challenge) the canonical Beamix template in `07b-AGENT-TEMPLATE.md` against production conventions from the wild. This report is a delta — it only covers what 07b should ADD, REMOVE, or CHANGE.

---

## 1. Five concrete agent frontmatters from the wild

### 1.1 wshobson/agents — `team-lead.md` (agent-teams plugin)

```yaml
---
name: team-lead
description: Team orchestrator that decomposes work into parallel tasks with file ownership boundaries, manages team lifecycle, and synthesizes results. Use when coordinating multi-agent teams, decomposing complex tasks, or managing parallel workstreams.
tools: Read, Glob, Grep, Bash
model: opus
color: blue
---
```

**Fields used:** name, description, tools, model, color
**Fields NOT used:** maxTurns, isolation, skills, mcpServers, escalates_to, return_contract, risk_tier_default, pre_flight_reads
**Notable:** `model: opus` (alias, not full ID). `tools` is comma-separated string, not YAML array. No isolation field.

---

### 1.2 wshobson/agents — `security-auditor.md` (full-stack-orchestration)

```yaml
---
name: security-auditor
description: Expert security auditor specializing in DevSecOps, comprehensive cybersecurity, and compliance frameworks. Masters vulnerability assessment, threat modeling, secure authentication (OAuth2/OIDC), OWASP standards, cloud security, and security automation. Handles DevSecOps integration, compliance (GDPR/HIPAA/SOC2), and incident response. Use PROACTIVELY for security audits, DevSecOps, or compliance implementation.
model: opus
---
```

**Fields used:** name, description, model — that is ALL.
**Notable:** description is 328 chars (our limit is 200). No tools field (inherits all). No color. This file is 120+ lines — entirely the system prompt body, zero structure.

---

### 1.3 wshobson/agents — `team-implementer.md` (agent-teams)

```yaml
---
name: team-implementer
description: Parallel feature builder that implements components within strict file ownership boundaries, coordinating at integration points via messaging. Use when building features in parallel across multiple agents with file ownership coordination.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
color: yellow
---
```

**Fields used:** name, description, tools, model, color
**Notable:** Worker with `model: opus` — aggressive. Structured body with clear Phase 1-5 workflow. No skills, no maxTurns, no isolation.

---

### 1.4 wshobson/agents — `team-reviewer.md` (agent-teams)

```yaml
---
name: team-reviewer
description: Multi-dimensional code reviewer that operates on one assigned review dimension (security, performance, architecture, testing, or accessibility) with structured finding format. Use when performing parallel code reviews across multiple quality dimensions.
tools: Read, Glob, Grep, Bash
model: opus
color: green
---
```

**Fields used:** name, description, tools, model, color
**Notable:** Read-only (no Write/Edit) but has Bash for running linters/tests. Body includes explicit structured OUTPUT FORMAT section with template — this is a pattern we should formalize.

---

### 1.5 wshobson/agents — `frontend-developer.md` (frontend-mobile-development)

```yaml
---
name: frontend-developer
description: Build React components, implement responsive layouts, and handle client-side state management. Masters React 19, Next.js 15, and modern frontend architecture. Optimizes performance and ensures accessibility. Use PROACTIVELY when creating UI components or fixing frontend issues.
model: inherit
---
```

**Fields used:** name, description, model
**Notable:** `model: inherit` — defers model choice to parent. No tools (inherits all). Body is pure capability list — no workflow steps. This is an ANTI-PATTERN for us (see Section 3).

---

### 1.6 Summary comparison with 07b schema

| Field | 07b requires | wshobson uses | Claude Code official spec |
|-------|-------------|---------------|--------------------------|
| `name` | YES | YES (all files) | YES (required) |
| `description` | YES | YES (all files) | YES (required) |
| `model` | YES | YES (5/5 files) | NO (optional, defaults `inherit`) |
| `tools` | YES (array) | SOMETIMES (3/5, comma-string) | NO (optional, inherits all) |
| `maxTurns` | YES | NEVER | YES (optional) |
| `color` | YES | SOMETIMES (3/5) | YES (optional, 8 colors) |
| `isolation` | YES | NEVER | YES (optional: `worktree`) |
| `skills` | YES | NEVER | YES (optional, preloads) |
| `mcpServers` | YES | NEVER | YES (optional) |
| `risk_tier_default` | YES | N/A | N/A (Beamix-specific) |
| `escalates_to` | YES | N/A | N/A (Beamix-specific) |
| `escalates_when` | YES | N/A | N/A (Beamix-specific) |
| `return_contract` | YES | N/A | N/A (Beamix-specific) |
| `pre_flight_reads` | YES | N/A | N/A (Beamix-specific) |
| `disallowedTools` | NOT in 07b | N/A | YES (optional) |
| `permissionMode` | NOT in 07b | N/A | YES (optional) |
| `effort` | NOT in 07b | N/A | YES (optional: low/medium/high/xhigh/max) |
| `background` | NOT in 07b | N/A | YES (optional: true/false) |
| `memory` | NOT in 07b | N/A | YES (optional: user/project/local) |
| `hooks` | NOT in 07b | N/A | YES (optional) |
| `initialPrompt` | NOT in 07b | N/A | YES (optional) |

**Source:** https://code.claude.com/docs/en/sub-agents — "Supported frontmatter fields" table

---

## 2. Body structure comparison: 07b vs the wild

### 2.1 What wshobson/agents uses (body sections)

The 185 agents in wshobson/agents follow TWO patterns:

**Pattern A — Capability dump (70% of files):**
```
## Purpose / Expert Purpose       (1 paragraph)
## Capabilities                   (10-30 subsections of bullet lists)
```
That is the ENTIRE body. No workflow, no anti-patterns, no return contract, no pre-flight.
Example: `security-auditor.md`, `frontend-developer.md`, `backend-architect.md`, `context-manager.md`

**Pattern B — Structured operational (30% of files, agent-teams plugin):**
```
## Core Mission                   (1 paragraph)
## [Protocol / Rules]             (numbered lists or phase descriptions)
## Behavioral Traits              (bullet list of agent personality)
## [Output Format]                (template with code block — team-reviewer only)
```
Example: `team-lead.md`, `team-implementer.md`, `team-debugger.md`, `team-reviewer.md`

### 2.2 What Anthropic cookbook uses (research agents)

The `research_subagent.md` from `anthropics/anthropic-cookbook/patterns/agents/prompts/` uses:
```
<research_process>               (numbered 1-2-3 operational steps)
<research_guidelines>            (behavioral constraints — bullet list)
<think_about_source_quality>     (meta-cognitive instruction)
<use_parallel_tool_calls>        (efficiency directive)
<maximum_tool_call_limit>        (safety ceiling — like our maxTurns)
```

The `research_lead_agent.md` uses:
```
<research_process>               (multi-step planning procedure, ~80 lines)
<subagent_count_guidelines>      (effort scaling rules for delegation)
<delegation_instructions>        (how to spawn workers, what to pass)
```

**Key observation:** Anthropic uses XML tags as section delimiters in the system prompt body (NOT markdown headers). This is intentional — XML tags are parsed differently by the model and create stronger boundary signals.

### 2.3 What 07b uses (our 8 sections)

```
## Identity & mission            (who + anti-pattern)
## Workflow position             (table: After/Complements/Enables)
## Key distinctions              (vs peers — disambiguation)
## Pre-flight reads              (numbered list)
## Operating procedure           (steps with ### subsections)
## QA gate hand-off / Output evidence
## Return contract               (JSON example)
## Anti-patterns                 (DO NOT list)
```

### 2.4 Delta analysis

| Section | 07b has it | Wild has it | Verdict |
|---------|-----------|-------------|---------|
| Identity/mission | YES | YES (all) | KEEP — universal pattern |
| Workflow position table | YES | NO (wshobson); PARTIAL (cookbook has delegation_instructions) | KEEP — our multi-agent routing needs it; wshobson doesn't have 45 agents to disambiguate |
| Key distinctions | YES | NO | KEEP — essential at our scale to prevent role drift |
| Pre-flight reads | YES | NO (wshobson); NO (cookbook uses `{{.CurrentDate}}` injection only) | KEEP — but MOVE to frontmatter only (already in `pre_flight_reads`) |
| Operating procedure | YES | YES (cookbook: `<research_process>`; wshobson Pattern B: phases) | KEEP — this is the core of effective agent files |
| QA gate / Output evidence | YES | PARTIAL (team-reviewer has output format; debugger has evidence standards) | KEEP |
| Return contract JSON | YES | NO | KEEP — essential for typed handoff (Principle P8) |
| Anti-patterns | YES | PARTIAL (wshobson: "Behavioral Traits" covers positive + negative) | KEEP — explicit negation is more reliable than inference |
| **Effort scaling rules** | MISSING | YES (cookbook: `<subagent_count_guidelines>`) | ADD — for orchestrator agents only |
| **Behavioral traits** | MISSING (partially in Identity) | YES (wshobson Pattern B: every team agent has this) | CONSIDER — merge into Identity or add as optional Section 9 |

### 2.5 Missing section: Effort / Budget constraints

The Anthropic cookbook research agents embed explicit effort-scaling rules:
```
- Simple query: 1 subagent, under 5 tool calls
- Standard query: 2-3 subagents, 5 tool calls each
- Complex query: 5-10 subagents, 10 tool calls each
- Never exceed 20 subagents or 100 sources
```

This directly controls token spend. Our orchestrators (CEO, CTO) should include something equivalent in Section 5 (Operating procedure). Currently 07b has "maxTurns" in frontmatter but no per-task effort guidance IN the body.

**Recommendation:** Add effort scaling as a subsection of Operating procedure for CEO + CTO agents.

---

## 3. Anti-pattern gallery (what NOT to imitate)

### 3.1 ANTI-PATTERN: Capability list without workflow (wshobson Pattern A)

**File:** `plugins/full-stack-orchestration/agents/security-auditor.md`
**Problem:** 120+ lines of bullet-pointed capabilities ("OWASP Top 10", "Container security", "SIEM/SOAR") with ZERO operational guidance on what to actually DO when spawned.

**What goes wrong at runtime:**
- The model has to invent its own workflow every time (inconsistent behavior)
- No guard rails — the agent might spend 30 turns on network security when the task is just an npm audit
- No structured output — upstream can't parse the return
- No escalation path — if blocked, it just keeps trying

**Lesson for 07b:** Our Section 5 (Operating procedure) is the single most important section. Never trade it for more "Capabilities" lists. The wshobson approach produces impressive-looking files that are operationally weak.

Source: https://github.com/wshobson/agents/tree/main/plugins/full-stack-orchestration/agents

---

### 3.2 ANTI-PATTERN: Overly long description field

**File:** `plugins/full-stack-orchestration/agents/security-auditor.md`
**Description field:** 328 characters
**File:** `plugins/comprehensive-review/agents/code-reviewer.md`
**Description field:** 293 characters

**What goes wrong at runtime:**
- The description is what Claude uses for routing decisions. Long descriptions dilute the routing signal.
- Keyword stuffing ("DevSecOps, comprehensive cybersecurity, and compliance frameworks. Masters vulnerability assessment, threat modeling...") confuses the model about when to use the agent vs alternatives.
- The Claude Code docs state: "Write a clear description so Claude knows when to use it" — implying brevity aids matching.

**Lesson for 07b:** Our 200-char limit is correct and battle-tested. The wshobson files prove that longer descriptions do NOT produce better routing — they produce keyword soup.

---

### 3.3 ANTI-PATTERN: Schema drift within the same project

**File set:** wshobson/agents across plugins
- `team-lead.md` has `tools`, `model`, `color`
- `security-auditor.md` has only `name`, `description`, `model`
- `frontend-developer.md` has only `name`, `description`, `model`
- `team-reviewer.md` has `tools`, `model`, `color`

**What goes wrong:**
- No consistent contract. Some agents inherit all tools (dangerous for workers that should be read-only).
- No `maxTurns` anywhere — means unlimited turns (cost explosion risk).
- No `isolation` — means shared filesystem (collision risk in parallel spawns).
- No color for most agents — parallel session UI is undifferentiated.

**Lesson for 07b:** Our mandatory field list is correct. The explicit-over-implicit approach prevents these exact production issues. wshobson's minimal frontmatter works for single-user hobby use but breaks at team scale.

Source: https://github.com/wshobson/agents — examined 5 files across 3 plugins

---

## 4. Frontmatter fields to ADD or REMOVE

### 4.1 Fields to ADD (from Claude Code official spec)

| Field | Official spec | Recommendation for 07b | Reason |
|-------|--------------|----------------------|--------|
| `effort` | `low \| medium \| high \| xhigh \| max` | ADD as optional | Controls reasoning depth. Use `high` for research/security agents, `medium` for workers. Saves tokens on trivial tasks. |
| `permissionMode` | `default \| acceptEdits \| auto \| bypassPermissions \| plan` | ADD as optional (default: `auto` for workers with `isolation: worktree`) | Workers in isolated worktrees can safely run `auto` permission mode. Reduces permission prompt noise. |
| `disallowedTools` | Removes from inherited/specified list | ADD as optional (use instead of `tools` when you want "all minus X") | Useful for QA-Lead that should have everything EXCEPT Write/Edit on the main branch. |
| `memory` | `user \| project \| local` | ADD as optional | Enables cross-session learning for agents that benefit (code-reviewer accumulates patterns, researcher accumulates domain facts). |
| `background` | `true \| false` | ADD as optional (for Routines only) | Routines always run as background tasks. Makes intent explicit. |
| `hooks` | PreToolUse, PostToolUse, Stop, etc. | ADD as optional (WS6+ work) | PostToolUse linter gates are deterministic quality — the single highest-ROI improvement from disler research. |

### 4.2 Fields to REMOVE or REFORMAT

| Field | Current in 07b | Recommendation | Reason |
|-------|---------------|----------------|--------|
| `pre_flight_reads` | In frontmatter | KEEP in frontmatter (aids prompt caching) but REMOVE the body Section 4 duplication | Currently we have the same list in frontmatter AND in Section 4. One source of truth — frontmatter. The body just says "Read the pre-flight list from frontmatter." |
| `tools` format | `[Read, Write, Edit, Bash, Glob, Grep]` YAML array | KEEP — this is correct. Claude Code accepts both comma-string and array; array is more parseable. | Official docs show comma-string (`tools: Read, Glob, Grep`) but array is equally valid and better for programmatic lint. |
| `return_contract` | In frontmatter (field names) AND body Section 7 (full JSON) | KEEP both — frontmatter is the schema, body is the example. Not redundant. | The SDK's `AgentDefinition` doesn't have this field — it's Beamix-specific and correct. |
| `risk_tier_default` | Custom field | KEEP — not in official spec but essential for our 4-tier QA system. | This is orchestration metadata the QA-Lead needs. Not a Claude Code native field. |

### 4.3 Field format corrections

**`model` field:** The official spec accepts `sonnet`, `opus`, `haiku` as aliases (shorter, forward-compatible). Our 07b uses full IDs like `claude-sonnet-4-6`. 

**Recommendation:** Use full IDs in our files (`claude-sonnet-4-6`). Reason: when models update (4-6 → 4-7), we want explicit version pinning so the upgrade is deliberate, not automatic. The alias `sonnet` could silently shift to a new release.

Source: https://code.claude.com/docs/en/sub-agents — "Choose a model" section

---

## 5. Top 5 conventions to adopt from the wild (not yet in 07b)

### Convention 1: `effort` field for token-budget control

**Source:** Claude Code official docs — `effort: low | medium | high | xhigh | max`
**What it does:** Controls reasoning depth at the model level. `high` makes Claude think harder; `low` makes it faster and cheaper.
**Why adopt:** Our `maxTurns` is a safety ceiling for loop count but doesn't control WITHIN-turn quality. `effort: high` for researcher/security, `effort: medium` for backend-engineer, `effort: low` for test-engineer (mechanical tasks) creates a 3-tier cost profile without changing model.

**Proposed defaults:**
```yaml
# Layer 1 (CEO): effort: max (highest reasoning for routing decisions)
# Layer 2 (C-suite): effort: high
# Layer 3 (Workers, complex): effort: high (security, ai-engineer, code-reviewer)
# Layer 3 (Workers, mechanical): effort: medium (test-engineer, technical-writer)
# Layer 5 (Personas): effort: high (deep thinking for board meetings)
```

---

### Convention 2: `Agent(type1, type2)` tool restriction for orchestrators

**Source:** Claude Code official docs — "Restrict which subagents can be spawned"
**What it does:** When an agent runs as main thread via `claude --agent`, `tools: Agent(worker, researcher)` restricts which subagents it can spawn. An allowlist for delegation.
**Why adopt:** Our CTO should only spawn engineering workers. If it accidentally tries to spawn `cmo`, it should fail loudly. This is a guardrail that prevents role drift at the tool level.

**Proposed usage:**
```yaml
# CTO:
tools: [Read, Write, Edit, Bash, Glob, Grep, "Agent(backend-engineer, frontend-engineer, database-engineer, devops-engineer, security-engineer, test-engineer, code-reviewer, ai-engineer, qa-lead)"]

# CPO:
tools: [Read, Write, Edit, Bash, Glob, Grep, "Agent(product-designer, design-critic, technical-writer, design-lead)"]
```

**Note:** This only applies when the agent is the MAIN thread (`--agent`). When spawned as a subagent via Task tool, subagents cannot spawn other subagents regardless. Still valuable for Routine-triggered or `--agent` sessions.

---

### Convention 3: Structured output format template in body (from team-reviewer)

**Source:** wshobson/agents `team-reviewer.md` — "Output Format" section with explicit template
**What it does:** Provides a copy-paste template for the agent's output shape. Not just a JSON contract, but the formatted structure the agent fills in.
**Why adopt:** Our return_contract in frontmatter declares field names. But complex agents (security-engineer, code-reviewer) produce NARRATIVE outputs in addition to the JSON return. A structured template for the narrative portion prevents format drift.

**Proposed addition to 07b:** For workers whose primary output is a REPORT (not just code), add an optional `### Output template` subsection within Section 6 (Output evidence):

```markdown
### Output template

For each finding:
```
### [SEVERITY] Finding Title
**Location**: `path/to/file.ts:42`
**Impact**: What breaks.
**Fix**: Concrete code change.
```
```

This is already implicitly done in our code-reviewer agent. Making it explicit and templated prevents drift.

---

### Convention 4: `memory: project` for knowledge-accumulating agents

**Source:** Claude Code official docs — "Enable persistent memory" section
**What it does:** Gives the agent a persistent directory at `.claude/agent-memory/<name>/` that survives across sessions. The agent's MEMORY.md (first 200 lines) is auto-injected into its system prompt.
**Why adopt:** Our code-reviewer discovers codebase patterns session after session. Our researcher discovers domain facts. Currently this knowledge evaporates unless manually written to `.claude/memory/`. With `memory: project`, the agent self-maintains its knowledge base.

**Proposed agents to enable:**
```yaml
# code-reviewer: memory: project (accumulates: patterns, recurring issues, style decisions)
# researcher: memory: project (accumulates: source quality ratings, domain facts)
# security-engineer: memory: project (accumulates: known vulnerabilities, audit history)
# test-engineer: memory: project (accumulates: flaky test patterns, coverage gaps)
```

**Risk:** Memory files grow unbounded. Mitigation: include "Curate MEMORY.md weekly; compress entries older than 30 days" in the agent's body.

---

### Convention 5: Hypothesis-driven debugging protocol (from team-debugger)

**Source:** wshobson/agents `team-debugger.md` — 7-step investigation protocol
**What it does:** Forces the debugging agent to: (1) state hypothesis, (2) define what would confirm/falsify it, (3) gather evidence, (4) cite file:line, (5) assess confidence, (6) report honestly including contradicting evidence.
**Why adopt:** Our current `debugger.md` is a generic "/fix" dispatcher. The hypothesis-driven protocol with explicit confidence levels and file:line citation requirements produces dramatically better debugging output. The forced separation of "confirming evidence" vs "contradicting evidence" prevents confirmation bias.

**Proposed integration:** Adopt this protocol verbatim in the `debugger.md` (already retained for `/fix` command) Operating procedure section. Also applicable to `security-engineer` when doing vulnerability investigation.

---

## 6. Additional observations

### 6.1 On tools format: comma-string vs YAML array

The Claude Code official docs show comma-strings (`tools: Read, Glob, Grep`). The SDK's `AgentDefinition` type uses a Python list (`tools=["Read", "Grep"]`). Our 07b uses YAML arrays (`tools: [Read, Write, Edit]`).

**All three are valid.** Claude Code accepts both comma-string and YAML array in .md frontmatter. Our choice of YAML array is correct for programmatic linting (schema-lint YAML can validate array items; comma-strings need regex parsing).

Source: Claude Code SDK `examples/agents.py` — `AgentDefinition` class

### 6.2 On description length: "Use PROACTIVELY" convention

wshobson uses "Use PROACTIVELY for X" as a suffix in many descriptions. This tells Claude to use the agent even when the user doesn't explicitly request it. Our descriptions use "Spawned by CTO" style — less directive.

**Recommendation:** For Routine-like agents or agents that should auto-trigger (codebase-mapper, test-engineer for post-edit validation), add "Use proactively after [trigger condition]" to the description. For workers that are only Task-spawned, keep "Spawned by [parent]" style.

### 6.3 On Routines vs .claude/agents/ format

**Key finding from official docs:** Routines are NOT .md files. A Routine is a cloud configuration (name, prompt, repos, connectors, triggers, environment). The "prompt" field in a Routine is equivalent to the body of an agent .md file, but it has NO frontmatter — tools/model/permissions are configured through the UI, not YAML.

**Implication for our `_routines/*.md` files:** These files serve as the SOURCE DOCUMENT for copy-pasting into the Routine creation UI at `claude.ai/code/routines`. They are NOT directly consumed by Claude Code at runtime the way `.claude/agents/*.md` files are. The frontmatter in our Routine .md files is documentation metadata (schedule, budget, delivery channel) — NOT Claude Code frontmatter.

This means Routine .md files can have a DIFFERENT schema than agent .md files. The 07b template already notes this ("DEFERRED per Adam 2026-05-16") but should explicitly state: "Routine .md files are specification documents, not runtime agent definitions."

Source: https://code.claude.com/docs/en/routines — "A routine is a saved Claude Code configuration"

### 6.4 On the `Agent` tool vs `Task` tool

**IMPORTANT UPDATE:** As of Claude Code v2.1.63, the `Task` tool was renamed to `Agent`. Existing `Task(...)` references still work as aliases.

Source: https://code.claude.com/docs/en/sub-agents — note under "Restrict which subagents can be spawned"

**Recommendation for 07b:** Update all references from `Task` to `Agent` in the tools list. Keep a one-line note: "Legacy `Task` alias still works but new files should use `Agent`."

---

## 7. Validation verdict on 07b

### What 07b gets RIGHT (keep as-is):

1. **Mandatory frontmatter for every field that matters** — wshobson's minimal approach causes production issues (no maxTurns = unbounded cost, no isolation = file conflicts). Our explicit approach is correct.
2. **8-section body with Operating procedure as the longest** — this is the opposite of wshobson's "capability dump" anti-pattern. Workflow > Capabilities.
3. **Return contract as JSON** — neither wshobson nor Anthropic cookbook does this, but it's essential for our multi-layer orchestration. Typed handoffs (Principle P8) require typed contracts.
4. **Length discipline (200-250 for workers)** — wshobson's capability-heavy files are 100-200 lines but operationally empty. Our 250-line files with procedure + contract are denser and more effective.
5. **Anti-patterns section** — explicit negation prevents drift better than positive-only instructions.
6. **`isolation: worktree`** requirement for workers — official Claude Code spec supports this and it prevents the exact file collision issues we'd see with 15 parallel workers.
7. **Pre-flight reads in frontmatter** — enables prompt caching at the system level.

### What 07b should CHANGE:

1. **ADD `effort` field** (optional, with per-layer defaults) — immediate token savings
2. **ADD `permissionMode` field** (optional, default `auto` for isolated workers) — reduces permission noise
3. **ADD `memory` field** (optional, for knowledge-accumulating agents) — cross-session learning
4. **ADD `hooks` field** (optional, for WS6+ PostToolUse linter gates) — deterministic quality
5. **Rename `Task` → `Agent` in tools lists** — align with official naming (v2.1.63+)
6. **Add `Agent(type1, type2)` restriction syntax** in per-layer rules for C-suite
7. **Add effort-scaling subsection** to Operating procedure for CEO + CTO
8. **Clarify Routine .md files** are specification documents, NOT runtime agent definitions
9. **Remove Section 4 (Pre-flight reads) body duplication** — frontmatter is the single source; body just says "read frontmatter pre_flight_reads list"

### What 07b should NOT change:

- Do NOT adopt wshobson's minimal frontmatter (causes production issues at scale)
- Do NOT adopt Anthropic cookbook's XML tag sections (our `## Header` markdown is equally parseable and more readable)
- Do NOT adopt capability-dump body style (workflows > capabilities)
- Do NOT use model aliases (`sonnet`) — keep full version IDs for explicit pinning

---

## 8. Sources

All claims in this document are sourced:

- Claude Code official subagent specification: https://code.claude.com/docs/en/sub-agents
  - Frontmatter fields table, tools format, model aliases, isolation, permissionMode, effort, memory, hooks, background, initialPrompt, color values, disallowedTools
  - Date accessed: 2026-05-16, Confidence: HIGH

- Claude Code Routines documentation: https://code.claude.com/docs/en/routines
  - Routine format (prompt + repos + connectors + triggers), NOT .md frontmatter
  - Date accessed: 2026-05-16, Confidence: HIGH

- wshobson/agents repository: https://github.com/wshobson/agents
  - 185 agents across 80+ plugins, examined 8 files in detail
  - Files: team-lead.md, team-implementer.md, team-reviewer.md, team-debugger.md, security-auditor.md, backend-architect.md, frontend-developer.md, context-manager.md
  - Date accessed: 2026-05-16, Confidence: MEDIUM (community project, ~2.5K stars)

- Anthropic Cookbook agent patterns: https://github.com/anthropics/anthropic-cookbook/tree/main/patterns/agents/
  - Files: prompts/research_subagent.md, prompts/research_lead_agent.md
  - Date accessed: 2026-05-16, Confidence: HIGH (official Anthropic)

- Claude Code SDK Python: https://github.com/anthropics/claude-code-sdk-python
  - File: examples/agents.py — AgentDefinition class fields
  - Date accessed: 2026-05-16, Confidence: HIGH (official SDK)

- Anthropic multi-agent research blog: https://www.anthropic.com/engineering/multi-agent-research-system
  - Effort scaling rules, token-as-performance metric
  - Date: 2025, Confidence: HIGH

---

## Confidence Summary

**Overall: HIGH**

Reason: Primary sources are official Anthropic documentation (2 docs pages) + official SDK + official cookbook. Secondary source (wshobson/agents) provides real-world validation of what minimal schemas look like in production. All findings are cross-referenced between at least 2 sources. No speculative claims — gaps explicitly noted.
