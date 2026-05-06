# Agent .md Authoring Best Practices (May 2026)

**Authority:** Anthropic Claude Code official docs (code.claude.com), Anthropic engineering blog, Vercel engineering. All numerical and behavioral claims sourced inline.

---

## TL;DR — the 10 rules

1. **Two required fields. Everything else is power.** Only `name` and `description` are required in subagent frontmatter. The rest (`tools`, `model`, `isolation`, `maxTurns`, `skills`, `mcpServers`, `color`, `effort`, `memory`, `hooks`, `permissionMode`, `disallowedTools`, `background`, `initialPrompt`) are opt-in. (Anthropic, 2026.)
2. **Minimalism wins. Vercel removed 80% of their agent's tools and got +20pts success (80%→100%), 3.5× faster (274.8s→77.4s), 37% fewer tokens (102k→61k), 42% fewer steps (12→7).** Default to the smallest tool set that works. (Vercel, 2025.)
3. **Allowlist > denylist.** Use `tools:` to grant exactly what's needed; reach for `disallowedTools` only when inheriting. If both are set, denylist applies first. (Anthropic.)
4. **Subagents cannot spawn subagents.** Don't design hierarchies expecting nested delegation. Use chained subagents from the main thread, or Skills, or agent teams. (Anthropic.)
5. **Skills don't inherit.** A subagent only sees skills in its `skills:` frontmatter — parent's loaded skills don't pass through. (Anthropic.)
6. **The system prompt body IS the agent.** Subagents receive ONLY the markdown body + basic env (cwd) — not the parent's CLAUDE.md, not the parent's history. Front-load everything they need. (Anthropic.)
7. **`isolation: worktree` ships in v2.1.49.** Spawns the subagent in a temporary git worktree; auto-cleans if no changes. Use it for any worker that writes files. (Anthropic, GitHub issue #27023.)
8. **Prompt caching saves 90% on repeat reads** (cache reads = 0.1× base input price). 5-min TTL writes cost 1.25×; 1-hour cost 2.0×. Make your system prompt stable. (Anthropic platform docs.)
9. **Return summaries, not transcripts.** Anthropic's multi-agent guidance: subagents return ~1,000–2,000 tokens to coordinator, not raw tool output. Verbose output stays in subagent context. (Anthropic engineering, 2025.)
10. **Skill bodies stay in context for the rest of the session.** Once invoked, SKILL.md content does NOT get re-read. Auto-compaction re-attaches the most recent invocation per skill, capped at first 5,000 tokens each, total budget 25,000 tokens. Choose skills carefully. (Anthropic.)

---

## Frontmatter spec (May 2026)

Source: https://code.claude.com/docs/en/sub-agents (canonical).

### Required

| Field | Notes |
|---|---|
| `name` | Lowercase + hyphens. Unique. Becomes the dispatch identifier and the `@-mention` target. |
| `description` | When Claude should delegate. **This is the routing key** — Claude reads only descriptions to decide. Include trigger phrases like "Use proactively after code changes." Combined description+`when_to_use` is truncated at **1,536 chars** for the listing. |

### Optional (full list, May 2026)

| Field | Purpose | Notes |
|---|---|---|
| `tools` | Allowlist. Inherits all if omitted. | Comma-separated: `Read, Grep, Glob, Bash`. |
| `disallowedTools` | Denylist. | Applied before `tools`. Tools in both = removed. |
| `model` | `sonnet` \| `opus` \| `haiku` \| full ID (e.g. `claude-opus-4-7`) \| `inherit`. | Default: `inherit`. |
| `permissionMode` | `default` \| `acceptEdits` \| `auto` \| `dontAsk` \| `bypassPermissions` \| `plan`. | Parent's `bypassPermissions`/`acceptEdits`/`auto` always wins. |
| `maxTurns` | Hard ceiling on agentic turns. | Use as safety, NOT target. |
| `skills` | Skills to **preload** (full body injected at startup, not just metadata). | Skills are NOT inherited from parent. |
| `mcpServers` | Inline MCP server defs OR string refs to already-configured servers. | Inline = scoped to this subagent only — keeps tool descriptions out of parent context. |
| `hooks` | Lifecycle hooks scoped to this subagent. | `PreToolUse`, `PostToolUse`, `Stop` (auto-converted to `SubagentStop`). |
| `memory` | `user` \| `project` \| `local`. | Persistent dir at `.claude/agent-memory/<name>/`. Auto-enables Read/Write/Edit. |
| `background` | `true` to always run async. | Pre-approves permissions at launch. |
| `effort` | `low` \| `medium` \| `high` \| `xhigh` \| `max`. | Overrides session effort. Available levels depend on model. |
| `isolation` | `worktree`. | Spawns in temporary git worktree, auto-cleaned if no changes. Added v2.1.49. |
| `color` | `red` \| `blue` \| `green` \| `yellow` \| `purple` \| `orange` \| `pink` \| `cyan`. | UI badge. |
| `initialPrompt` | Auto-submitted as first user turn when run as main session via `--agent`. | Skills + commands processed. |

**Note:** `disable_model_fallback` is NOT a documented Claude Code subagent field as of May 2026. The Beamix `researcher.md` references it — not in spec. (Anthropic docs do not list it; GitHub search returned no doc.)

### Common mistakes
- Putting tool restrictions in CLAUDE.md instead of frontmatter (CLAUDE.md is advisory, frontmatter is enforced).
- Omitting `tools:` thinking it limits — omitting **inherits all tools** including all MCP tools.
- Writing prose descriptions ("This agent is a researcher who…") — Claude routes on keywords; lead with the trigger condition.
- Setting `model: opus` on workers that only do mechanical tasks — default Sonnet, escalate Opus only for synthesis/security/AI design.

---

## Tool grants — minimalism principle + allowlist patterns

### The Vercel finding (the headline result)

Vercel's d0 agent went from 15 tools to ~2 (bash + SQL). Result: **success 80%→100%, latency 274.8s→77.4s (3.5×), tokens 102k→61k (-37%), steps 12→7 (-42%).** Their thesis: *"addition by subtraction is real… the best agents might be the ones with the fewest tools."* Caveat from the same post: this only worked because their data layer was already well-named and documented.

### Allowlist patterns (in order of preference)

**Read-only researcher / reviewer:**
```yaml
tools: Read, Grep, Glob
```

**Read + investigate (run scripts):**
```yaml
tools: Read, Grep, Glob, Bash
```

**Code worker:**
```yaml
tools: Read, Write, Edit, Grep, Glob, Bash
```

**Bash precision — git only:**
```yaml
# Allowlist via permission rules in settings.json:
# "permissions": { "allow": ["Bash(git status:*)", "Bash(git diff:*)", "Bash(git log:*)"] }
```
The frontmatter `tools: Bash` lets the subagent CALL Bash; the per-command allowlist lives in settings (`Bash(git *)` syntax in `permissions.allow`). Frontmatter does NOT use `Bash(git *)` syntax — that's for `permissions`. (Anthropic permissions doc.)

**Coordinator that spawns workers (main-session only — see #4 below):**
```yaml
tools: Agent(backend-developer, frontend-developer), Read, Bash
```
`Agent(name)` allowlist only applies when run as `--agent` main thread. Subagents cannot spawn other subagents — `Agent(...)` in a subagent definition has no effect. (Anthropic.)

### When NOT to grant Task/Agent
Workers should never have `Agent` in tools — they're leaves. Only the CEO / Lead layer needs spawn capability, and only when running as `--agent` main session.

---

## MCP integration — per-agent scoping + tool-search

### Two patterns

**1. Reference a globally-configured server (shares parent's connection):**
```yaml
mcpServers:
  - supabase
  - playwright
```

**2. Inline definition (scoped to this subagent only — KEEPS TOOL DESCRIPTIONS OUT OF PARENT CONTEXT):**
```yaml
mcpServers:
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
```

Anthropic explicitly recommends inline scoping when an MCP server's tool descriptions would otherwise bloat the main session: *"To keep an MCP server out of the main conversation entirely and avoid its tool descriptions consuming context there, define it inline here rather than in `.mcp.json`."*

### Per-agent obligations (Beamix-specific from CLAUDE.md)
- `database-engineer`: must use `mcp__supabase__*` for all DB work
- `test-engineer`: must use `mcp__playwright__*` for E2E
- `frontend-developer`: must run `mcp__ide__getDiagnostics` before final commit
- `researcher`: try `mcp__context7__*` BEFORE WebSearch for library docs

These are policy choices in CLAUDE.md, enforced by agent prompts. To enforce mechanically, use `mcpServers:` in frontmatter to ensure connectivity, plus a hook to validate calls.

### MCP is ignored for plugin subagents
Plugin-distributed agents don't get `hooks`, `mcpServers`, or `permissionMode`. Copy to `.claude/agents/` to enable.

---

## Skills loading — progressive disclosure

### How Claude Code skills work (May 2026)

- Skill = directory with `SKILL.md` (required) plus optional supporting files.
- In a regular session: skill **descriptions** load into context so Claude knows what's available; full body loads only when invoked. Description budget scales at **1% of context window, fallback 8,000 chars**, set via `SLASH_COMMAND_TOOL_CHAR_BUDGET`.
- In a subagent with `skills:` frontmatter: **full content is injected at startup**. Different lifecycle.
- Once invoked, a skill body **stays in context for the rest of the session**. Claude Code does NOT re-read the file on later turns.
- Auto-compaction re-attaches the most recent invocation per skill, **first 5,000 tokens each**, **combined budget 25,000 tokens** total.

### Counts (Beamix CLAUDE.md policy, consistent with Anthropic guidance)
- **Workers:** 2–3 skills max
- **Leads / CEO:** 3–5 skills max
- Never preload "just in case" — every skill is recurring tokens.

### Discovery
Read `.agent/skills/MANIFEST.json` and filter by tags. **Never** `ls | grep .agent/skills/` (426 entries makes grep unreliable, per Beamix CLAUDE.md).

### Tip from Anthropic
Keep `SKILL.md` under 500 lines. Move detailed reference to separate files; reference from the body. Description should put the key use case **first** — the 1,536-char cap kicks in.

---

## Isolation — worktree flag spec

### What it does
Set `isolation: worktree` to spawn the subagent in a **temporary git worktree** — an isolated checkout of the repo. File edits land there, not in the parent's checkout. **Worktree is automatically cleaned up if the subagent makes no changes.** Added in **Claude Code v2.1.49**. (Anthropic, GitHub issue #27023.)

### When to use
- Any worker that writes files (`backend-developer`, `frontend-developer`, `database-engineer`).
- Parallel workers operating on potentially overlapping files.
- Code that must be reviewable in a branch before merge.

### When NOT to use
- Read-only researchers / reviewers.
- Workers that only run tests / report status.
- Tasks needing to see parent's uncommitted state.

### The "child worktree from worktree" bug class (Beamix-specific gotcha)
If your CEO is itself running in a worktree (e.g., `.worktrees/ceo-1-*`), and a code worker calls `git worktree add` from inside that path, git creates a worktree **of the CEO's branch**, not main. Beamix CLAUDE.md fix:
```bash
MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')
git -C "$MAIN_REPO" worktree add "$MAIN_REPO/.worktrees/[task]" -b feat/[task]
```
The first line of `git worktree list` is always the main repo root. Always reference it explicitly.

---

## Structured returns — JSON contract + PASS/BLOCK

### The principle
Anthropic's multi-agent context engineering: subagents return ~1,000–2,000 tokens to coordinator, not raw output. The orchestrator must parse the return programmatically — JSON is the contract.

### Worker JSON contract (Beamix standard, aligned with community pattern)
```json
{
  "status": "COMPLETE | BLOCKED | PARTIAL",
  "agent": "backend-developer",
  "branch": "feat/auth-redesign",
  "worktree": ".worktrees/auth-redesign",
  "files_changed": ["src/api/auth/route.ts", "src/lib/session.ts"],
  "commits": ["feat(auth): redesign session refresh"],
  "summary": "2-sentence description of what was done.",
  "decisions_made": [
    {"key": "session_ttl", "value": "30m", "reason": "matches OAuth provider default"}
  ],
  "blockers": []
}
```

### QA / Reviewer verdict pattern (PASS/BLOCK)
The Evaluator role has **no edit tools** and emits a single verdict + reason:
```json
{
  "verdict": "PASS | BLOCK",
  "reason": "1-sentence why",
  "checklist": [
    {"item": "TypeScript clean", "result": "pass"},
    {"item": "Tests added", "result": "pass"},
    {"item": "Schema migration matches DB", "result": "block", "evidence": "missing columns: foo, bar"}
  ],
  "must_fix": ["specific actionable items"],
  "should_fix": ["nice-to-haves"]
}
```
This pattern is referenced in community orchestration docs (jeremylongshore/claude-code-plugins-plus-skills) and matches Anthropic's "Evaluator" role description.

### Why JSON beats markdown
- Parser can branch on `status` / `verdict`.
- Token-efficient (no prose padding).
- Forces the worker to commit to a single state, not hedge.

---

## Context + token management (the BIG section)

This is the highest-leverage area. Quoted % savings throughout.

### 1. Prompt caching — 90% savings on cache reads

Source: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching

| Tier | Multiplier vs base input |
|---|---|
| Base input | 1.0× |
| 5-min cache write | **1.25×** |
| 1-hour cache write | **2.0×** |
| Cache read / refresh | **0.1×** ← 90% savings |

**Concrete: Sonnet 4.6 input is $3/M; cache reads are $0.30/M. Opus 4.7 input is $5/M; cache reads are $0.50/M.**

**Cache prefix order (strict):** Tools → System → Messages. Changing any level invalidates that level and all subsequent.

**Min cacheable tokens (May 2026):**
- Opus 4.5–4.7: **4,096**
- Sonnet 4.6: **2,048**
- Sonnet 4.5 + earlier: 1,024
- Haiku 4.5: **4,096**
- Haiku 3.5: 2,048

**Limits:**
- Max **4 explicit breakpoints** per request.
- **20-block lookback window** for prior cache entries.
- 5-min default TTL; refresh extends at no cost.

**Practical implication for agent .md files:**
- Keep frontmatter + body **stable** across runs. Variable timestamps / random data break the cache.
- Put dynamic content (current task, current files) at the END of the prompt, after the cached system block.
- Don't randomize agent instructions to "feel fresh" — destroys the cache.

### 2. Sub-agent isolation — verbose output stays out of parent

Source: Anthropic best-practices + multi-agent guidance.

> *"By delegating to a subagent, the verbose output stays in the subagent's context window. Only the summary returns to the parent."*

**Concrete pattern:** A test runner that emits 50KB of failures via `pnpm test` consumes 50KB of parent context if run inline. Inside a subagent, only `{ "verdict": "BLOCK", "must_fix": [...] }` (~500 tokens) returns. **~99% reduction** for verbose IO.

### 3. Compaction — automatic summarization

Subagents support auto-compaction with same logic as main conversation, **default trigger ~95% capacity**. Override earlier with `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (e.g., `50` = trigger at 50%).

**API-level compaction** (cookbook pattern, `compact_20260112`):
- Min trigger: 50,000 tokens
- Default trigger: 150,000 tokens
- Custom instructions preserve task-critical facts

### 4. Tool-result clearing — drop bulky responses

`clear_tool_uses_20250919` (cookbook pattern):
- Default trigger: 100,000 tokens
- `keep`: 3–6 most recent tool uses
- `clear_at_least`: 10,000+ tokens (so cache invalidation is worthwhile)
- `exclude_tools: ["memory"]` to protect persistent state

Real numbers from Anthropic's research-agent demo: **96.3% of context was file-read results** — prime candidate for clearing.

### 5. /compact discipline (manual)

> *"Use /clear frequently between tasks to reset… For more control, run `/compact <instructions>`, like `/compact Focus on the API changes`. To compact only part of the conversation, use `Esc + Esc` or `/rewind`."*

Beamix CLAUDE.md asserts `/clear` between unrelated tasks **saves 40–70%**. (This is a Beamix-internal claim, not officially benchmarked by Anthropic — flag as MEDIUM confidence.)

### 6. "Tools as compression"

Anthropic's tool-design guide: combine tools to return **digested, not raw**, data. Examples:
- `get_customer_context` returning structured summary > separate `list_users` + `list_events` + `list_invoices` calls
- Add `response_format: "concise" | "detailed"` enum so agent picks verbosity per call
- Implement pagination, filtering, truncation defaults so tools don't dump megabytes

### 7. Output discipline — terse JSON > verbose markdown

Token cost of structured returns: a 5-key JSON object ≈ 80 tokens. The "PASS — well done, here's a thorough explanation of why…" prose return is 800+. **~10× difference per worker return.** With 10 workers per session, that's 7,200 tokens of pure padding.

### 8. Don't re-read files already in context

Beamix CLAUDE.md: *"Don't re-read files you already have in context."* Every Read tool call costs the file size again. Verify by checking conversation history before issuing a Read.

### 9. MAX_THINKING_TOKENS

Not currently a documented Claude Code env var as of May 2026. Anthropic's extended thinking is controlled per-request via API param `thinking: { type: "enabled", budget_tokens: N }`. For Claude Code agents, use `effort: low|medium|high|xhigh|max` in frontmatter — this is the supported lever.

### 10. Memory files as shared state

Beamix uses `.claude/memory/*.md` so agents pass summaries through files instead of re-explaining context to each new spawn. CLAUDE.md cap: `DECISIONS.md` ≤ 50 entries, `LONG-TERM.md` ≤ 100 lines, session summaries ≤ 10 lines. Anthropic's MEMORY.md auto-load is **first 200 lines or 25KB**, whichever first.

---

## Pre-flight discipline

### The "always read X first" pattern (Beamix standard)
Before any non-trivial action:
1. CLAUDE.md (always auto-loaded by Claude Code)
2. `.claude/memory/LONG-TERM.md` (cross-session facts)
3. `.claude/memory/DECISIONS.md` (architectural decisions)
4. Domain MOC (`docs/00-brain/MOC-*.md`) for the relevant area
5. Then act.

### When to skip pre-flight
- Quick-tier tasks (typo, single-line fix, log-line addition).
- Async / spec-trust mode where the spec already encodes constraints.
- Re-runs in the same session where context is already loaded.

### Memory tool integration with provenance
Anthropic's `memory_20250818` tool is client-side — your app implements the file backend. Each entry should record:
- WHO wrote it (which agent)
- WHEN (timestamp)
- WHY (rationale or source URL)
- TTL (when it expires / needs re-validation)

This prevents stale memory from poisoning future sessions.

---

## Failure modes & retries

### The 3-retry budget rule (Beamix CLAUDE.md / researcher.md)
Max 3 retries on any tool failure or BLOCKED worker. On exhaustion: return BLOCKED with structured report. **Never loop past 3.**

Rationale: At retry 3, the issue is structural (missing dep, wrong scope, bad assumption), not transient. More attempts waste context and money without progress.

### When to return BLOCKED vs auto-fix

**Auto-fix (Beamix Deviation Rules):**
1. Missing imports → add them.
2. TypeScript errors in your scope → fix them.
3. Missing trivial deps (e.g., `@types/node`) → install them.

**Return BLOCKED:**
- Architectural decision needed (you're a Worker, not a Lead).
- Required external resource missing (env var, MCP unavailable, API key).
- Scope creep — the task as briefed conflicts with another decision.
- 3 retries exhausted on any sub-step.

### Error handling in tools
Anthropic's tool-design guide: errors should be **actionable**, not cryptic. *"Clearly communicate specific and actionable improvements that guide agents toward correct tool usage."* Apply same standard to BLOCKED reasons in JSON returns.

---

## Anti-patterns — the 10 worst mistakes

1. **Over-broad `Bash(*)` grants.** Frontmatter `tools: Bash` plus no permission allowlist = Claude can `rm -rf`. Use `permissions.allow: ["Bash(git status:*)", "Bash(pnpm test:*)"]`.
2. **Loading 10 skills "just in case."** Each skill body stays in context for the session. 10 × 2,000 tokens = 20K of overhead per worker.
3. **Verbose markdown returns when JSON would do.** ~10× token bloat per return × workers per session = thousands of wasted tokens.
4. **Workers spawning workers.** Subagents cannot spawn subagents (Anthropic). Designs that assume nested delegation silently fail or fall back to the main thread.
5. **"Read every file" pre-flight.** Reading 30 files because "context" is 30 × file size in tokens. Use Glob + Grep first; Read only what's load-bearing.
6. **Putting tool restrictions in CLAUDE.md instead of frontmatter.** CLAUDE.md is advisory; agents may ignore it. Frontmatter `tools:` is enforced.
7. **`description: "I am a researcher"`.** Claude routes on description keywords. Lead with trigger condition: `"Investigates one bounded question. Use proactively when researching libraries, APIs, or competitors."`
8. **Forgetting subagents inherit nothing.** No parent CLAUDE.md, no parent skills, no parent history. Front-load every fact the worker needs in the spawn prompt.
9. **Randomizing system prompts.** Breaks prompt caching (1.0× → 0.1× discount lost). Keep agent .md stable across runs; vary only the user-turn task.
10. **Ignoring `isolation: worktree` for code workers.** Without it, parallel workers stomp each other's edits. Beamix's child-worktree gotcha (running `git worktree add` from inside a worktree) makes this worse.

---

## A complete reference example (~80 lines, token-optimal)

```markdown
---
name: backend-developer
description: Implement one focused backend task. Use proactively when CEO/Build-Lead briefs a Next.js API route, Server Action, or Supabase RPC. Returns structured JSON with branch + files_changed.
tools: Read, Write, Edit, Grep, Glob, Bash
model: claude-sonnet-4-6
isolation: worktree
maxTurns: 30
color: blue
mcpServers:
  - supabase
  - ide
skills:
  - nextjs-app-router-patterns
  - api-design-principles
permissionMode: acceptEdits
---

You are a Backend Developer worker. You implement ONE focused task per spawn.

# Identity
- Layer 3 (Worker) per CLAUDE.md Layer Contract.
- DO: implement in your assigned scope, commit atomically, return JSON.
- DO NOT: make architectural decisions, edit files outside scope, spawn other agents.

# Pre-flight (mandatory)
1. Read your brief from the lead.
2. Read CLAUDE.md if not in context.
3. Read `.claude/memory/DECISIONS.md` if your task touches a decided area.
4. Verify worktree: `git worktree list && pwd`.

# Worktree protocol
You are spawned with `isolation: worktree` — your worktree is created automatically. Confirm with `git status` and `git branch --show-current`. Commit atomically per logical change: `feat(scope): what`.

# Implementation rules
1. Use `mcp__supabase__*` for all DB queries — never raw SQL through psql.
2. Run `mcp__ide__getDiagnostics` before final commit. Zero TS errors required.
3. Validate inputs with Zod at every API boundary.
4. Never log secrets. Never commit `.env`.

# Auto-fix (Deviation Rules — fix without asking)
- Missing imports → add them.
- TypeScript errors in your scope → fix them.
- Trivial missing deps (e.g., @types/X) → install with pnpm.

# Return BLOCKED for
- Architectural decision needed (you are a Worker — escalate).
- 3 retries exhausted on any sub-step.
- Scope creep conflicting with another decision.
- Required external resource (env var, MCP) missing.

# Structured return (JSON — REQUIRED)
{
  "status": "COMPLETE | BLOCKED | PARTIAL",
  "agent": "backend-developer",
  "branch": "feat/[task-name]",
  "worktree": ".worktrees/[task-name]",
  "files_changed": ["path/to/file.ts"],
  "commits": ["feat(scope): what was done"],
  "summary": "2-sentence description.",
  "decisions_made": [{"key": "...", "value": "...", "reason": "..."}],
  "blockers": []
}

# Hard rules
- One focused task per spawn. No scope expansion.
- Commit atomically. Never to main.
- Return JSON. No prose padding before/after.
- Failure budget: 3 retries max. Then BLOCKED.
```

**Why this is token-optimal:**
- Frontmatter declares tools, model, isolation, MCP, skills explicitly — caches stably.
- Body is ~80 lines, all load-bearing (verifiable: removing any line changes worker behavior).
- Forbids prose returns, enforces JSON contract.
- Auto-fix rules prevent BLOCKED-storms on trivial issues.
- Pre-flight is bounded (4 reads max), not "read everything."

---

## Sources

All claims above sourced from these primary documents (May 2026):

### Anthropic official (highest authority)
- [Create custom subagents — Claude Code Docs](https://code.claude.com/docs/en/sub-agents) — frontmatter spec, tool grants, isolation, skills field, mcpServers
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — CLAUDE.md guidance, subagent patterns, /clear & /compact discipline, failure modes
- [Extend Claude with skills](https://code.claude.com/docs/en/skills) — SKILL.md spec, lifecycle (5,000-token re-attach, 25,000-token combined budget, 1,536-char description cap, 1% context-window listing budget, 8,000-char fallback)
- [Prompt Caching](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching) — 1.25× / 2.0× / 0.1× multipliers, min token tables, 4-breakpoint limit, 20-block lookback
- [Effective context engineering for AI agents — Anthropic Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — compaction, structured note-taking, multi-agent (1,000–2,000 token returns), context pollution / context rot
- [Writing effective tools for AI agents — Anthropic Engineering](https://www.anthropic.com/engineering/writing-tools-for-agents) — tool description quality, namespacing, response_format enum, error actionability, tool consolidation
- [Context engineering: memory, compaction, and tool clearing — Claude Cookbook](https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools) — `compact_20260112` (50K min / 150K default trigger), `clear_tool_uses_20250919` (100K trigger, 3–6 keep, 10K min clear), `memory_20250818`, the 96.3% file-read finding

### Industry / community (secondary)
- [We removed 80% of our agent's tools — Vercel Engineering](https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools) — 80%→100% success, 274.8s→77.4s (3.5×), 102k→61k tokens (-37%), 12→7 steps (-42%), "addition by subtraction"
- [DOCS Subagents missing isolation — GitHub Issue #27023](https://github.com/anthropics/claude-code/issues/27023) — confirms `isolation: worktree` shipped in v2.1.49, doc gap
- [Claude Code Subagents 2026 — Morph](https://www.morphllm.com/claude-subagents) — 4-input rule (prompt, body, env, skills), summary-only returns, parallel-worker file-conflict caveat
- [Beamix CLAUDE.md (this repo)](file:///Users/adamks/VibeCoding/Beamix/CLAUDE.md) — internal /clear 40–70% claim (MEDIUM confidence, not Anthropic-benchmarked), 3-retry rule, child-worktree gotcha fix, MANIFEST.json discovery rule

### Confidence flags on numerical claims
- HIGH: all caching multipliers, min cacheable tokens, the 1,536-char skill cap, the 5,000/25,000 skill re-attach budgets, the 4-breakpoint limit, the 20-block lookback (Anthropic platform docs).
- HIGH: Vercel 80%→100% / 3.5× / -37% / -42% (Vercel blog, single source but specific and citation-grade).
- HIGH: 96.3% file-read context (Anthropic cookbook).
- MEDIUM: "/clear saves 40–70%" — Beamix internal claim, not Anthropic-published. Treat as guidance, not benchmark.
- MEDIUM: "1% context window" listing budget — Anthropic skill docs state this with 8,000-char fallback; exact percentage may shift across versions.
- LOW: `disable_model_fallback` — referenced in Beamix `researcher.md` but NOT in Anthropic spec. Likely a stale custom field; remove or document.

