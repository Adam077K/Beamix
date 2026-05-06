# Claude Code Production Patterns (May 2026)

> Researcher: researcher-claude-code-production-patterns
> Date: 2026-05-05
> Sources: Anthropic official docs at code.claude.com (formerly docs.claude.com), platform.claude.com, github.com/anthropics, plus dated third-party references.
> Confidence overall: HIGH (every primitive cross-checked against official docs as of May 2026).

---

## Executive Summary

Anthropic shipped a coherent production stack in 2025-2026: **Skills (open standard), Subagents, Plugins (with marketplaces), Hooks (19 events), Output Styles, Statuslines, MCP, Agent SDK (Python + TypeScript), Agent Teams (experimental multi-instance), full OpenTelemetry export, and `anthropics/claude-code-action` for GitHub.** Beamix already uses 4 of those primitives (Skills, Subagents-as-files, Hooks, Statusline) but is missing the highest-leverage ones: **Plugins (zero), Output Styles (zero), MCP allowlists in settings.json (none), OTEL telemetry (off), the GitHub Action (not installed), Agent SDK headless invocation (not used), and explicit prompt-cache discipline.**

The single biggest insight from the docs: **Skills now follow the open Agent Skills standard (agentskills.io), `.claude/commands/*.md` and `.claude/skills/<name>/SKILL.md` are equivalent and both create `/<name>` slash commands**, and skill descriptions are **truncated to 1,536 chars** in the listing — Beamix's 430 skills is far above the practical budget and likely getting silently clipped (Anthropic's `SLASH_COMMAND_TOOL_CHAR_BUDGET` defaults to 1% of context window or 8,000 chars). Beamix also has no `permissions` block in `.claude/settings.json`, no `CLAUDE_CODE_ENABLE_TELEMETRY=1`, and no plugin marketplace — three changes that compound to a 30-50% cost reduction with stronger guard-rails.

---

## 1. Sub-agents

**What it is:** Specialized Claude instances with their own context window, system prompt, tool grants, and (optionally) model. Defined as Markdown files with YAML frontmatter. Built-in subagents: **Explore (Haiku, read-only), Plan (read-only, used in plan mode), general-purpose (all tools), statusline-setup (Sonnet), claude-code-guide (Haiku)**. (Source: code.claude.com/docs/en/sub-agents)

**File location & priority** (highest to lowest):
1. Managed settings (org-wide)
2. `--agents` CLI flag (JSON, session-only)
3. `.claude/agents/<name>.md` (project)
4. `~/.claude/agents/<name>.md` (user)
5. Plugin's `agents/` directory

**Frontmatter schema** (only `name` and `description` required):
```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep                # allowlist (or omit to inherit)
disallowedTools: Write, Edit            # denylist
model: sonnet | opus | haiku | inherit  # or full ID like claude-opus-4-7
permissionMode: default | acceptEdits | auto | dontAsk | bypassPermissions | plan
maxTurns: 10
skills: [...]                           # preloaded into subagent system prompt
mcpServers: [...]
hooks: {...}
memory: user | project | local          # cross-session learning
background: false
effort: low | medium | high | xhigh | max
isolation: worktree                     # auto-creates a temp git worktree
color: red | blue | green | yellow | purple | orange | pink | cyan
initialPrompt: "..."                    # auto-submitted on first turn
---
```

**Key new feature (v2.1.63):** The Task tool was renamed to **Agent**. `Task(...)` references still work as aliases. Use `tools: Agent(worker, researcher)` to restrict which subagents the parent can spawn.

**Adoption recipe for Beamix:**
- Beamix has **32 agent files** in `.agent/agents/` but they are not in the canonical `.claude/agents/` location, so Claude Code doesn't auto-discover them. Either symlink `.agent/agents → .claude/agents`, or move them.
- Add `isolation: worktree` to all code workers (frontend-developer, backend-developer, database-engineer) — Anthropic's docs explicitly recommend this for parallel/isolated work, replacing the fragile manual `git worktree add` protocol in CLAUDE.md.
- Add `tools: Agent(...)` restrictions to leads so they cannot accidentally spawn the wrong worker type.

---

## 2. Skills

**What it is:** Open-standard (agentskills.io) Markdown files with YAML frontmatter and progressive disclosure. **Custom commands and skills are now merged**: `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both create `/deploy`. Skill bodies load only when invoked (cost-efficient).

**Locations:**
| Scope | Path |
|---|---|
| Personal | `~/.claude/skills/<name>/SKILL.md` |
| Project | `.claude/skills/<name>/SKILL.md` |
| Plugin | `<plugin>/skills/<name>/SKILL.md` (namespaced as `plugin-name:skill-name`) |
| Enterprise | Managed settings |

**Frontmatter (all optional except `description`):**
```yaml
---
name: my-skill                    # max 64 chars, lowercase + hyphens
description: ...                  # used for auto-invoke decision
when_to_use: ...                  # appended to description
disable-model-invocation: true    # only user can /invoke
user-invocable: false             # only Claude can invoke
allowed-tools: Read Grep          # pre-approved when skill is active
model: sonnet | opus | haiku | inherit
effort: low|medium|high|xhigh|max
context: fork                     # run in subagent
agent: Explore | Plan | general-purpose | <custom>
hooks: {...}
paths: ["**/*.ts"]                # auto-activate only for matching files
shell: bash | powershell
arguments: [issue, branch]        # named positional args
---
```

**Critical lifecycle facts:**
- Skill content **stays in context the entire session** after first invocation — every line is a recurring token cost. Keep SKILL.md under 500 lines.
- After auto-compaction, Claude re-attaches **first 5,000 tokens** of each invoked skill, capped at **25,000 tokens combined** across all skills.
- Skill descriptions in the listing are **truncated at 1,536 chars** per entry. Total budget = 1% of context window or fallback 8,000 chars (`SLASH_COMMAND_TOOL_CHAR_BUDGET`).
- `!`bash command`` syntax injects shell output before Claude sees the skill (preprocessing). `${CLAUDE_SKILL_DIR}` resolves to skill's bundled scripts.
- **Live change detection**: edits under `~/.claude/skills/`, project `.claude/skills/`, or `--add-dir` directories take effect within current session without restart. New top-level skills directory requires restart.

**Adoption recipe for Beamix:**
- Beamix has **430 skills** in `.agent/skills/` — but they're not in `.claude/skills/`, so they're invisible to Claude Code's auto-discovery. Symlink or move.
- 430 skills will overflow the 1% context-window budget. Curate to **~50-80 high-value skills** in project scope, archive the rest.
- Set `SLASH_COMMAND_TOOL_CHAR_BUDGET=20000` if keeping the full library.
- Add `disable-model-invocation: true` to all command-style skills (deploy, ship) to prevent accidental Claude triggering.
- Use `paths:` filtering on skills (e.g. `paths: ["apps/web/**/*.tsx"]` for frontend skills) so they only auto-load in relevant files.

---

## 3. Plugins

**What it is:** Distributable bundles containing skills, subagents, hooks, MCP servers, LSP servers, monitors, and default settings. Installed via `/plugin` from a marketplace.

**Plugin file structure** (root level, NOT inside `.claude-plugin/`):
```
my-plugin/
├── .claude-plugin/plugin.json   # only this lives in .claude-plugin/
├── skills/<name>/SKILL.md
├── agents/<name>.md
├── commands/*.md                # legacy; prefer skills/
├── hooks/hooks.json
├── .mcp.json
├── .lsp.json                    # LSP server config (TypeScript, Python, etc.)
├── monitors/monitors.json       # background watchers (e.g. tail -F)
├── bin/                         # executables added to Bash $PATH
└── settings.json                # default settings (only `agent`, `subagentStatusLine` keys supported)
```

**plugin.json schema:**
```json
{
  "name": "my-plugin",
  "description": "...",
  "version": "1.0.0",            // if omitted, git SHA used (every commit = new version)
  "author": { "name": "..." }
}
```

**Marketplace install flow:**
- Browse: `/plugin` command opens marketplace
- Install from custom marketplace: `extraKnownMarketplaces` in settings.json with `{"source": "github", "repo": "..."}`.
- Submit to official: claude.ai/settings/plugins/submit or platform.claude.com/plugins/submit
- Lock down: `strictKnownMarketplaces` (allowlist), `blockedMarketplaces`, `allowedChannelPlugins`, `pluginTrustMessage` for IT-managed environments.

**Plugin namespacing:** All plugin skills are namespaced as `/<plugin-name>:<skill-name>` to prevent conflicts. Plugin subagents do **not** support `hooks`, `mcpServers`, or `permissionMode` frontmatter (security restriction).

**Adoption recipe for Beamix:**
- **Beamix has zero plugins.** This is the single biggest gap.
- Convert Beamix's 11-agent GEO roster into a `beamix-team` plugin (private GitHub repo) so the team config travels across machines and can be versioned.
- Install at minimum: a code-intelligence plugin for TypeScript (gives Claude precise symbol nav vs grep — confirmed cost saver per Anthropic's docs).

---

## 4. Hooks (19 events)

Hooks are **deterministic**, fire at specific lifecycle points, and live in `.claude/settings.json` (or `hooks/hooks.json` in plugins).

**Complete event list** (May 2026):
| Event | Fires when | Decision control |
|---|---|---|
| `SessionStart` | session begin/resume | inject `additionalContext` |
| `Setup` | `claude --init-only` | inject context |
| `InstructionsLoaded` | CLAUDE.md / rules load | observability only |
| `UserPromptSubmit` | before prompt processed | block, inject context, set `sessionTitle` |
| `UserPromptExpansion` | slash command expansion | block, inject context |
| `PreToolUse` | before tool call | allow/deny/ask/defer, **`updatedInput`** to mutate args |
| `PermissionRequest` | permission dialog | auto-approve, override input |
| `PermissionDenied` | auto-mode classifier denied | retry |
| `PostToolUse` | after tool success | block (sends stderr to Claude), inject context |
| `PostToolUseFailure` | after tool failure | inject suggestions |
| `PostToolBatch` | after parallel batch | stop loop |
| `Stop` | turn ends | block to continue conversation |
| `StopFailure` | turn ends due to API error | observability only |
| `SubagentStart` | subagent spawned | observability |
| `SubagentStop` | subagent finishes | block (subagent continues) |
| `Notification` | notification shown | observability |
| `PreCompact` | before context compaction | block |
| `PostCompact` | after compaction | observability |
| `SessionEnd` | session terminates | cleanup only |

**Plus team-coordination hooks** (when `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`): `TeammateIdle`, `TaskCreated`, `TaskCompleted`.

**Hook handler types:** `command` (shell), `http` (POST to URL), `mcp_tool`, `prompt`, `agent`.

**Hooks JSON structure:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Edit|Write",
        "hooks": [
          { "type": "command", "if": "Bash(rm *)", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/validate.sh", "timeout": 10 }
        ]
      }
    ]
  }
}
```

**Key env vars in hooks:** `$CLAUDE_PROJECT_DIR`, `$CLAUDE_PLUGIN_ROOT`, `$CLAUDE_PLUGIN_DATA`, `$CLAUDE_ENV_FILE` (persists vars across hook calls in `SessionStart`/`Setup`/`CwdChanged`/`FileChanged`).

**Adoption recipe for Beamix:**
- Beamix has 2 hooks today: `SessionStart` (update check) + `PostToolUse` (context monitor). Add **6 more** for production-grade safety:
  1. `PreToolUse` matcher `Bash` — block destructive `rm -rf`, `git push --force`, `psql DROP`.
  2. `PreToolUse` matcher `Bash` for test runners — filter output to errors only (Anthropic's official cost-saving pattern; can cut log tokens 100x).
  3. `PostToolUse` matcher `Edit|Write` for `*.ts/*.tsx` — auto-run `pnpm lint --fix` (Beamix's existing lint).
  4. `Stop` — verify `pnpm typecheck` passes before allowing stop on code-changing turns.
  5. `PreCompact` — write a compaction-snapshot file to `.claude/memory/sessions/` so context survives compaction.
  6. `UserPromptSubmit` — auto-inject current git branch + uncommitted file count.

---

## 5. Output Styles

**What it is:** Markdown files that **replace** the software-engineering parts of Claude Code's system prompt. Used to repurpose Claude Code as a writer, teacher, reviewer, etc.

**Built-in:** Default, **Explanatory** (educational "Insights"), **Learning** (collaborative; adds `TODO(human)` markers).

**Locations:** `~/.claude/output-styles/<name>.md`, `.claude/output-styles/<name>.md`, plugins' `output-styles/`.

**Frontmatter:**
```yaml
---
name: My Custom Style
description: ...
keep-coding-instructions: false   # if true, retains coding parts of system prompt
---
```

**Set with:** `/config` → Output Style picker, or directly:
```json
{ "outputStyle": "Explanatory" }
```

**Critical fact:** "Because the output style is set in the system prompt at session start, changes take effect the next time you start a new session. This keeps the system prompt stable throughout a conversation so prompt caching can reduce latency and cost." — Beamix should never toggle output styles mid-session.

**Adoption recipe for Beamix:**
- Beamix has **zero output styles**. Add three:
  1. `beamix-board-meeting` — for the 7-board-member multi-agent critique pattern Adam already uses (encoded in feedback memory).
  2. `beamix-marketing-copy` — for Framer/website copy (Hebrew + English, no AI labels per `feedback_no_ai_labels.md`).
  3. `beamix-aria-procurement` — for the "Aria" persona vendor-facing reviews (per `project_aria_4th_persona.md`).

---

## 6. Statusline

**What it is:** A custom shell script run for every prompt that receives JSON session data on stdin and prints anything you want shown at the bottom of the terminal.

**Config location:** `.claude/settings.json` →
```json
{
  "statusLine": { "type": "command", "command": "~/.claude/statusline.sh" }
}
```

**Available data on stdin (JSON):** session_id, model, cwd, transcript_path, cost, duration, lines_added/removed, context window usage, git info, and more.

Anthropic's docs show a multi-line statusline with **model, directory, git branch on line 1; color-coded context-usage progress bar with cost and duration on line 2** as the recommended template.

**Adoption recipe for Beamix:**
- Beamix has `.claude/hooks/gsa-statusline.js`, but Anthropic recommends **multi-line** with context-bar. Audit the existing script to ensure it shows: `model | branch | context % | cost`. The "context %" is the most under-displayed and most decision-relevant metric per Anthropic's best-practices doc.

---

## 7. MCP

**What it is:** Model Context Protocol — Claude's standard for connecting external tools (databases, browsers, APIs).

**Config files:**
- User: `~/.claude.json`
- Project: `.mcp.json` (committed to repo)
- Inline in subagent's `mcpServers:` frontmatter (subagent-only scope)

**Server transport types:** `stdio`, `http`, `sse`, `ws`.

**Settings.json controls:**
```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["memory", "github"],
  "disabledMcpjsonServers": ["filesystem"],
  "allowedMcpServers": [{"serverName": "github"}],
  "deniedMcpServers": [{"serverName": "filesystem"}],
  "allowManagedMcpServersOnly": true
}
```

**Per Anthropic, MCP tool definitions are deferred by default** ("Scale with MCP tool search") — only tool names enter context until Claude calls a specific tool. But CLI tools (`gh`, `aws`, `gcloud`) are still **more context-efficient** than MCP because they don't add per-tool listings.

**Adoption recipe for Beamix:**
- Beamix already uses Supabase MCP (mandatory per CLAUDE.md), Pencil, Playwright, Context7, Framer, IDE, Stitch, Refero. Add explicit `enabledMcpjsonServers` and `deniedMcpjsonServers` to `.claude/settings.json` so MCP servers are pinned and a malicious `.mcp.json` change in a PR cannot silently enable a new server.
- Move Playwright from "always on" to inline-in-subagent (`test-engineer.md`) per the docs' guidance: "To keep an MCP server out of the main conversation entirely and avoid its tool descriptions consuming context there, define it inline here rather than in `.mcp.json`."

---

## 8. Headless Mode / Agent SDK

**What it is:** Run Claude Code programmatically via `claude -p "prompt"` (CLI) or the **Claude Agent SDK** (Python `claude-agent-sdk`, TypeScript `@anthropic-ai/claude-agent-sdk`). The TypeScript SDK bundles the Claude Code binary as an optional dep — no separate install.

**Output formats:** plain text (default), `--output-format json`, `--output-format stream-json`.

**Session controls:** `--continue` (resume most recent), `--resume <session-id>` (pick specific), `--allowedTools "Edit,Bash(git commit *)"`.

**Auto mode for unattended runs:**
```bash
claude --permission-mode auto -p "fix all lint errors"
```
Note: in `-p` mode, auto mode aborts if the classifier repeatedly blocks (no human fallback).

**SDK quickstart (Python):**
```python
from claude_agent_sdk import query, ClaudeAgentOptions
async for message in query(
    prompt="Find and fix the bug in auth.py",
    options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"]),
):
    print(message)
```

**Compared to Claude Code CLI:** Same agent loop, same tools. Anthropic's recommendation: "Many teams use both: CLI for daily development, SDK for production."

**Production note:** SDK supports MCP servers, hooks (as Python/TS callbacks), subagents (`agents` option), permissions, sessions, and **TRACEPARENT propagation** for distributed tracing.

**Adoption recipe for Beamix:**
- Beamix has **zero `claude -p` usage** today. Add headless invocations to:
  1. `pnpm verify` — runs `claude -p "review uncommitted diff for issues" --output-format json` as a pre-push check.
  2. Linear webhook → Inngest job → `claude -p` worker that triages incoming bug reports against codebase.
  3. Slack `/beamix` slash command → `claude -p` invocation against the Beamix agent system.

---

## 9. Settings & Permissions

**Settings file precedence (high → low):**
1. Managed (org-deployed; cannot be overridden)
2. CLI args
3. `.claude/settings.local.json` (gitignored)
4. `.claude/settings.json` (committed)
5. `~/.claude/settings.json` (user)

Array settings **merge** across scopes; scalars override.

**Critical permission keys:**
```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Bash(git status *)"],
    "deny": ["Bash(curl *)", "Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)", "Bash(git push --force *)"],
    "ask": ["Bash(git push *)"],
    "additionalDirectories": ["../docs/"],
    "defaultMode": "acceptEdits | auto | default | plan | dontAsk | bypassPermissions",
    "disableBypassPermissionsMode": "disable",
    "skipDangerousModePermissionPrompt": false
  }
}
```

**Skill control (deny dangerous skills):**
```json
{ "permissions": { "deny": ["Skill(deploy *)", "Skill(reset-db)"] } }
```

**Other key knobs:**
- `model`, `availableModels`, `effortLevel`, `alwaysThinkingEnabled`
- `env: {...}` — set env vars for every Claude session in this scope (great for `OTEL_*`, `MAX_THINKING_TOKENS`)
- `attribution: {commit, pr}` — control the "Generated with Claude Code" footer
- `outputStyle`
- `editorMode: vim`
- `respectGitignore: true`
- `cleanupPeriodDays: 30`
- `minimumVersion: "2.1.100"` — refuse to start on older versions
- `disableAllHooks`, `allowManagedHooksOnly`

**Validation:** Add `"$schema": "https://json.schemastore.org/claude-code-settings.json"` for IDE autocomplete.

**Adoption recipe for Beamix:**
- Beamix's `.claude/settings.json` is **28 lines**. Expand to include:
  - `permissions.deny`: the 8 destructive patterns above + `Read(./apps/web/.env*)`
  - `permissions.allow`: `Bash(pnpm *)`, `Bash(git status *)`, `Bash(gh pr view *)`, `Read(./apps/web/**)` to cut prompt fatigue
  - `env.OTEL_*` block (see §11)
  - `env.MAX_THINKING_TOKENS=8000` for default tasks
  - `env.SLASH_COMMAND_TOOL_CHAR_BUDGET=20000` (since Beamix has 430 skills)
  - `attribution.commit: "🤖 Generated with Claude Code (Beamix war-room)"`
  - `cleanupPeriodDays: 7`
  - `minimumVersion: "2.1.63"` (the Task→Agent rename)
  - `$schema` for editor support

---

## 10. Cost & Context Economy

**Prompt caching:**
- Default TTL: **5 minutes** (Anthropic silently dropped from 1h on 2026-03-06 — confirmed multiple sources).
- Extended 1-hour TTL is opt-in: `"cache_control": {"type": "ephemeral", "ttl": "1h"}`.
- Pricing: 5-min cache writes = **1.25× input price**; 1-hour writes = **2× input price**; cache reads = **0.1× input price**.
- Beamix's CLAUDE.md says "5-min TTL" — accurate.

**Context management primitives:**
- `/clear` — reset between unrelated tasks (Anthropic's #1 cost saver: 40-70% savings).
- `/compact <instructions>` — focused compaction.
- `/rewind` (Esc + Esc) — restore to checkpoint.
- `/btw` — "side question" overlay that never enters conversation history.
- Auto-compaction: re-attaches first 5K tokens of each invoked skill, capped at 25K combined.

**Model routing (Anthropic's own recommendations):**
- **Sonnet 4.6 default** ($3/M in, $15/M out) — handles 80%+ of tasks.
- **Opus 4.7** for complex architecture, multi-step reasoning, deep AI/RAG (Anthropic now recommends Opus 4.7 in agent SDK 0.2.111+).
- **Haiku 4.5** ($1/M in, $5/M out) — "approximately 90% of Sonnet 4.5's agentic-coding performance, 4-5× faster, fraction of the cost." Anthropic's official recommendation: Haiku for fast subagents, classification, real-time tasks. Beamix already uses this for test-engineer/log-parsing.

**Anthropic's published cost benchmarks:**
- Avg per developer per active day: **~$13**
- Avg per developer per month: **$150-250**
- 90% of users stay under **$30/active day**
- **Agent teams use ~7× more tokens** than a standard session (especially in plan mode).

**Recommended TPM/RPM for Beamix-size team (1-5 users):** 200k-300k TPM/user, 5-7 RPM/user.

**Adoption recipe for Beamix:**
- Add `MAX_THINKING_TOKENS=8000` to settings.json (default budget is "tens of thousands" per request).
- Set `effortLevel` to `medium` (default), reserve `high`/`xhigh` for sage/security-engineer/research-lead.
- Enforce `model: haiku` in **test-engineer**, **gsa-verifier**, **integration-checker** subagents (currently inferred from CLAUDE.md but not in agent frontmatter).
- Move large reference content out of CLAUDE.md (currently 200+ lines) into skills with `paths:` filters per Anthropic's explicit recommendation: "Aim to keep CLAUDE.md under 200 lines by including only essentials." Beamix's CLAUDE.md is **already over 200 lines** (the auto-loaded MEMORY.md was 266 lines and got truncated — confirmed by the system reminder in this very session).

---

## 11. Observability (OpenTelemetry)

**What it is:** Native OTEL export for **metrics, logs/events, and (beta) distributed traces** — built into Claude Code, no external SDK required.

**Enable with env vars:**
```bash
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp        # or prometheus, console, none
export OTEL_LOGS_EXPORTER=otlp           # or console, none
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc  # or http/protobuf, http/json
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer ..."
```

**Default export intervals:** metrics 60s, logs 5s. Lower (`OTEL_METRIC_EXPORT_INTERVAL=10000`) for debugging.

**Metrics exported (counters):**
- `claude_code.session.count`
- `claude_code.lines_of_code.count`
- `claude_code.commit.count`
- `claude_code.pull_request.count`
- `claude_code.cost.usage` (USD by model)
- `claude_code.token.usage` (input, output, cacheRead, cacheCreation by model + query_source)
- `claude_code.code_edit_tool.decision.count` (accept/reject by tool + source + language)
- `claude_code.active_time.count` (excludes idle)

**Events (logs):**
- `claude_code.user_prompt`
- `claude_code.tool_result` (with `tool_use_id` matching hook IDs — perfect for cross-correlation)
- `claude_code.api_request` (cost_usd, duration_ms, ttft_ms, tokens, request_id)
- `claude_code.tool_decision`

**Distributed tracing (beta, requires `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`):**
- Span tree: `claude_code.interaction` → `claude_code.llm_request` → `claude_code.tool` → `claude_code.tool.execution`
- TRACEPARENT propagation: Bash subprocesses inherit it automatically; SDK sessions read it from env.

**Cardinality controls:** `OTEL_METRICS_INCLUDE_SESSION_ID=false`, `OTEL_METRICS_INCLUDE_ACCOUNT_UUID=false` if storage cost is a concern.

**Multi-team attribution:**
```bash
export OTEL_RESOURCE_ATTRIBUTES="department=engineering,team.id=beamix-warroom"
```

**Third-party observability tools** (referenced by Anthropic):
- **LiteLLM** — for cost tracking on Bedrock/Vertex/Foundry deployments where Claude Code can't send native metrics.
- The OpenTelemetry collector can fan out to **Helicone, Langfuse, AgentOps, Braintrust, Honeycomb, Grafana, Datadog** — all standard OTLP receivers. Anthropic does not officially endorse a specific SaaS observability tool.

**Adoption recipe for Beamix:**
- Beamix has **zero OTEL** today. This is a major production gap because Adam runs autonomous "war room" sessions with no spend visibility per agent.
- Run a local OTEL collector (1 line of docker-compose: `otel/opentelemetry-collector-contrib`) → forward to Grafana Cloud free tier or self-hosted Prometheus + Loki.
- Add `env.OTEL_RESOURCE_ATTRIBUTES="team.id=beamix,session.role=ceo|build|research|..."` per agent worktree so dashboards segment by role.

---

## 12. GitHub Integration

**Two official actions:**
- **`anthropics/claude-code-action`** — high-level: handles PR/issue context, mode detection (review vs implement vs answer), progress checkboxes.
- **`anthropics/claude-code-base-action`** — primitive: just runs Claude with a prompt; you build the workflow.

**Supported triggers:**
- `issue_comment` (with `@claude` mention)
- `pull_request_review_comment`
- `issues` (assignment)
- `pull_request_review`
- `pull_request`

**Auth options:** `anthropic_api_key` (direct), `aws_access_key_id`, `google_vertex_ai_credentials`, `azure_api_key`.

**One-line install:**
```bash
claude /install-github-app
```
Requires repo admin. Creates the GitHub App, adds secrets.

**`@claude` mention pattern:** Comment `@claude implement the fix` on any issue/PR. The action runs on the GitHub runner with your repo checked out.

**Common use cases (per Solutions Guide):** auto PR review, path-specific reviews (e.g. only `apps/web/`), external-contributor reviews, custom checklists, scheduled maintenance, issue triage & labeling, doc sync, security-focused reviews.

**Adoption recipe for Beamix:**
- Beamix has the GitHub repo (`Adam077K/Beamix`) but **no Claude GitHub Action installed**. Run `claude /install-github-app` and add a basic workflow:
  ```yaml
  on:
    pull_request:
      types: [opened, synchronize]
  jobs:
    review:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: anthropics/claude-code-action@v1
          with:
            anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
            prompt: "Review this PR against docs/ENGINEERING_PRINCIPLES.md"
  ```
- This replaces the manual "spawn code-reviewer worker" pattern in Beamix's lead workflow for PR reviews.

---

## 13. Multi-instance / Parallel Sessions

**Anthropic's official options (in order of automation):**

1. **Git worktrees** — manual, what Beamix already does. Anthropic confirms: "run separate CLI sessions in isolated git checkouts so edits don't collide." (`code.claude.com/docs/en/worktrees`)
2. **Desktop app** — visual session manager, each in its own worktree.
3. **Claude Code on the web** — Anthropic-managed cloud VMs, isolated sandboxes.
4. **Agent Teams** (experimental, requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, requires v2.1.32+) — shared task list, mailbox messaging, lead + teammates, optional `tmux`/iTerm2 split panes via `teammateMode: "tmux"` or `"in-process"`.

**Agent Teams architecture:**
- Team config: `~/.claude/teams/<team-name>/config.json` (auto-managed; do not edit by hand)
- Task list: `~/.claude/tasks/<team-name>/`
- Lead spawns teammates, teammates self-claim tasks via file-locking, can message each other directly by name.
- Quality-gate hooks: `TeammateIdle`, `TaskCreated`, `TaskCompleted` (exit 2 sends feedback to keep teammate working).
- Token cost: **~7× a standard session** when teammates run in plan mode.
- Practical sweet spot: **3-5 teammates** with **5-6 tasks each**.
- Limitations: no session resumption (`/resume` doesn't restore in-process teammates), one team per session, no nested teams, lead is fixed.

**Anthropic's explicit recommendation:** "Use subagents when you need quick, focused workers that report back. Use agent teams when teammates need to share findings, challenge each other, and coordinate on their own."

**Adoption recipe for Beamix:**
- Beamix currently uses **manual worktrees** (`.worktrees/ceo-1-*`, `.worktrees/ceo-2-*`). This is appropriate for the CEO-level orchestration.
- For inside-a-task parallelism (e.g. "have 3 reviewers audit this PR simultaneously"), enable Agent Teams: `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json.
- Adopt Anthropic's **Writer/Reviewer two-session pattern** explicitly in Beamix's docs: one CEO session writes, another CEO session (fresh context) reviews. Already implicit in the gold/orange/teal CEO color convention.

---

## What Beamix Already Uses (Map)

Reading `.claude/`, `.agent/`, `CLAUDE.md`, and project memory:

| Primitive | Status | Evidence |
|---|---|---|
| **CLAUDE.md** | ✅ HEAVY (266+ lines) | `/Users/adamks/CLAUDE.md` + `apps/web/CLAUDE.md` + auto-loaded MEMORY.md being truncated |
| **Subagents** | ⚠️ PARTIAL — files exist in `.agent/agents/` (32 files) but NOT in `.claude/agents/` so auto-discovery won't work | `ls .agent/agents` = 32 .md; `ls .claude/agents` = empty |
| **Skills** | ⚠️ PARTIAL — 430 skills in `.agent/skills/`, NOT `.claude/skills/`; over the 1% context budget | `ls .agent/skills | wc -l` = 430 |
| **Slash commands** | ✅ — 12 in `.agent/commands/` | `audit, build, color, daily, debug, design, fix, name, plan, research, review, ship` |
| **Hooks** | ⚠️ MINIMAL — only 2 (SessionStart update check, PostToolUse context monitor) | `.claude/settings.json` lines 2-23 |
| **Statusline** | ✅ — `node .claude/hooks/gsa-statusline.js` | `.claude/settings.json` line 25-27 |
| **Plugins** | ❌ ZERO | no `.claude-plugin/` dirs anywhere |
| **Output Styles** | ❌ ZERO | no `.claude/output-styles/` dir |
| **Permissions** | ❌ ZERO `permissions` block in settings.json — relies on default prompts | settings.json has no `permissions` key |
| **MCP** | ✅ HEAVY (8 servers per CLAUDE.md) but ❌ no `.claude/settings.json` allowlist | Supabase, Pencil, Playwright, Context7, Framer, IDE, Stitch, Refero |
| **OTEL telemetry** | ❌ ZERO | no `OTEL_*` env vars set |
| **Agent SDK / headless `-p`** | ❌ ZERO | no `claude -p` invocations anywhere in repo |
| **GitHub Action** | ❌ NOT INSTALLED | no `.github/workflows/claude*.yml` |
| **Agent Teams** | ❌ NOT ENABLED | no `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |
| **Worktrees** | ✅ MANUAL | `.worktrees/ceo-1-1778005572` (current), `.worktrees/ceo-2-*` exists |
| **Output style for marketing copy** | ❌ — handled via CLAUDE.md prose | risks polluting code sessions |
| **Plan mode** | ⚠️ — referenced in CLAUDE.md but no `defaultMode: plan` for risky leads | |

---

## Top 10 Production Patterns to Adopt (ranked by impact × ease)

| # | Pattern | Impact | Ease | Concrete change |
|---|---|---|---|---|
| 1 | **Move agents/skills to `.claude/`** | HIGH (Claude Code can't find them today) | EASY | `ln -s $(pwd)/.agent/agents .claude/agents && ln -s $(pwd)/.agent/skills .claude/skills` (or move). Add `SLASH_COMMAND_TOOL_CHAR_BUDGET=20000` to `env`. |
| 2 | **Add `permissions` block to settings.json** | HIGH (zero guard-rails today) | EASY | Add `deny` for `rm -rf`, `git push --force`, `Read(./apps/web/.env*)`, `Bash(curl *)`; `allow` for safe `pnpm`, `gh`, `git status`. |
| 3 | **Enable OpenTelemetry** | HIGH (zero cost visibility per agent) | MEDIUM | Add `env.CLAUDE_CODE_ENABLE_TELEMETRY=1` + OTEL exporter env vars. Run local `otel-collector` container, forward to Grafana Cloud free tier. |
| 4 | **Install GitHub Action** | HIGH (auto PR review, no human required) | EASY | `claude /install-github-app`. Add `.github/workflows/claude-review.yml`. |
| 5 | **Curate skills 430→80** | HIGH (description budget overflow today) | MEDIUM | Audit `.agent/skills/`; archive 350+ unused ones; add `paths:` filters to remaining. |
| 6 | **Add 6 hooks (lint, typecheck, branch-info, log-filter, kill-switch, pre-compact snapshot)** | MEDIUM (deterministic safety net) | MEDIUM | Edit `.claude/settings.json` hooks block; reuse Anthropic's filter-test-output.sh template. |
| 7 | **Convert Beamix agents to a private plugin** | MEDIUM (versioned, distributable) | MEDIUM | `mkdir beamix-team-plugin/.claude-plugin && cp -r .agent/agents → plugin/agents`; commit to private GitHub repo; install via marketplace. |
| 8 | **Add `claude -p` headless to verify pipeline** | MEDIUM (catches regressions) | EASY | `pnpm verify` runs `claude -p "review uncommitted diff" --output-format json --allowedTools Read,Grep,Bash`. |
| 9 | **Add 2-3 output styles** | LOW-MEDIUM (consistency for non-code outputs) | EASY | `.claude/output-styles/beamix-marketing.md`, `.claude/output-styles/beamix-aria.md`. |
| 10 | **Enable Agent Teams for parallel review/research** | MEDIUM (speed up board-meeting pattern) | MEDIUM | `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`; document Writer/Reviewer pattern; add `TeammateIdle` hook. |

---

## Cost Optimization Playbook — 5 highest-leverage moves to cut Claude Code spend by 40%+

1. **Trim CLAUDE.md to <200 lines + move detail to skills with `paths:` filters.** Anthropic's explicit recommendation; Beamix's current 266+ line CLAUDE.md is loaded into every session token-bill. Estimated saving: **15-25% per session** (mostly via better cache hits because the system prompt becomes stable).

2. **Force `model: haiku` on test-engineer, gsa-verifier, integration-checker, plan-checker, statusline-setup.** Anthropic confirms Haiku 4.5 = 90% of Sonnet 4.5 perf at 1/3 the cost. These agents do classification/verification work that Haiku handles perfectly. Estimated saving: **10-15%**.

3. **Add `PreToolUse` hook to filter test/log output** before Claude sees it (Anthropic's official template). 10K-line test logs become 100-line error-only summaries. Estimated saving on test-heavy days: **20-40%**.

4. **Set explicit prompt-cache strategy.** Add stable env vars + a stable system prompt (output style or trimmed CLAUDE.md) so 5-min cache hits regularly. For long-running war-room sessions, opt into 1-hour TTL on the team prompt: `cache_control: {ttl: "1h"}` (2× write cost, but worth it for >5-min reuse). Estimated saving: **20-30%** on multi-hour sessions.

5. **Use `/clear` between unrelated tasks + `/btw` for side questions.** Anthropic's #1-listed recommendation. The "kitchen sink session" anti-pattern is the highest single cost-driver per their docs. Train Adam to use `/clear` between feature switches. Estimated saving: **40-70% on long sessions**.

**Bonus:** Disable `alwaysThinkingEnabled` for daily work; set `MAX_THINKING_TOKENS=8000` (default is "tens of thousands"). Reserve `effort: high|xhigh` for `sage`, `security-engineer`, `research-lead`. Estimated saving: **10-20%** on planning-heavy days.

**Combined realistic spend reduction: 40-60%** if all five are adopted.

---

## Sources (URL + date)

All URLs accessed 2026-05-05. Anthropic's docs migrated from `docs.claude.com` → `code.claude.com` for Claude Code content (confirmed via 301 redirects on every URL).

**Anthropic official:**
- [Sub-agents](https://code.claude.com/docs/en/sub-agents) — full subagent spec, frontmatter fields, scope priority, built-in agents (Explore/Plan/general-purpose), Task→Agent rename in v2.1.63
- [Skills](https://code.claude.com/docs/en/skills) — Agent Skills open standard, SKILL.md format, frontmatter (name/description/disable-model-invocation/allowed-tools/paths/context/agent), 1,536-char description cap, 25K-token re-attach budget after compaction, !`bash` injection, `${CLAUDE_SKILL_DIR}` substitution
- [Plugins](https://code.claude.com/docs/en/plugins) — `.claude-plugin/plugin.json`, marketplace, quickstart, monitors, LSP, settings.json overrides
- [Hooks](https://code.claude.com/docs/en/hooks) — full 19-event reference, JSON I/O schemas, exit codes, decision-control fields
- [Output Styles](https://code.claude.com/docs/en/output-styles) — built-in (Default/Explanatory/Learning), custom format, frontmatter, why session-scoped
- [Statusline](https://code.claude.com/docs/en/statusline) — JSON stdin schema, multi-line example
- [Settings](https://code.claude.com/docs/en/settings) — full settings.json schema, precedence, permissions, MCP allowlist, env vars
- [MCP](https://code.claude.com/docs/en/mcp) — `.mcp.json`, transport types, deferred tool listing, scoped subagent MCP
- [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) — Python `claude-agent-sdk`, TS `@anthropic-ai/claude-agent-sdk`, sessions, hooks-as-callbacks, Opus 4.7 requires v0.2.111+
- [Best Practices](https://code.claude.com/docs/en/best-practices) — formerly the Anthropic Engineering blog post; covers CLAUDE.md, plan mode, headless mode, parallel sessions, fan-out, auto mode, Writer/Reviewer pattern
- [Agent Teams](https://code.claude.com/docs/en/agent-teams) — experimental, requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, v2.1.32+, in-process vs tmux/iTerm2 split panes, ~7× token cost, 3-5 teammates sweet spot
- [Costs](https://code.claude.com/docs/en/costs) — $13/dev/active-day, $150-250/dev/month, 90% under $30/day, agent-team token cost guidance, /usage command, model routing
- [Monitoring (OTEL)](https://code.claude.com/docs/en/monitoring-usage) — full env-var list, metrics catalog (session/lines_of_code/commit/PR/cost/token/code_edit_tool_decision/active_time), events catalog, distributed tracing beta, OTEL_RESOURCE_ATTRIBUTES, LiteLLM for cloud deployments
- [claude-code-action README](https://github.com/anthropics/claude-code-action) — supported triggers, auth methods, `claude /install-github-app`
- [Haiku 4.5 announcement](https://www.anthropic.com/news/claude-haiku-4-5) — $1/$5 per 1M tokens, 90% of Sonnet 4.5 agentic-coding perf, 4-5× faster

**Third-party (dated):**
- [Cache TTL silently dropped 1h→5m around 2026-03-06](https://github.com/anthropics/claude-code/issues/46829) — GitHub issue #46829
- [Dev.to: Claude's Prompt Cache TTL Silently Dropped from 1 Hour to 5 Minutes](https://dev.to/whoffagents/claudes-prompt-cache-ttl-silently-dropped-from-1-hour-to-5-minutes-heres-what-to-do-13co) — 2026-03
- [The Register: Anthropic says Claude quota drain not caused by cache tweaks](https://www.theregister.com/2026/04/13/claude_code_cache_confusion/) — 2026-04-13
- [AI Checker Hub: Anthropic Prompt Caching in 2026](https://aicheckerhub.com/anthropic-prompt-caching-2026-cost-latency-guide) — 2026
- [Prompt caching API docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — official, 5-min default + 1-hour ttl opt-in

**Confidence:** HIGH on every primitive's existence and behavior (all cross-checked against Anthropic's official `code.claude.com` docs). MEDIUM-HIGH on the cost-savings %s (estimates derived from Anthropic's published per-pattern reasoning, but actual savings depend on Beamix's specific session mix). LOW only on the "30-50% combined cut" claim because no public Anthropic data ties multiple optimizations together — that figure is the researcher's synthesis.
