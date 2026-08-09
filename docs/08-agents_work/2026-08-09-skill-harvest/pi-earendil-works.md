# Pi (earendil-works/pi, formerly badlogic/pi-mono) + companion repo badlogic/pi-skills

resolved: yes
repo: https://github.com/earendil-works/pi
"pi-mono" hint resolved: `badlogic/pi-mono` redirects via GitHub API to the exact same repo record as `earendil-works/pi` — same content, same description, same star count. Not a separate project — it's the prior name/path.

stats:
- `earendil-works/pi`: 85,598 stars, 10,627 forks, MIT license, TypeScript, not archived, pushed 2026-08-08, 93 open issues. Description: "AI agent toolkit: unified LLM API, agent loop, TUI, coding agent CLI."
- `badlogic/pi-skills` (companion repo, separately confirmed via API): 2,343 stars, MIT, not archived, created 2025-12-12, last pushed 2026-06-06, 31 open issues.

ships: skills (thin, in-repo) + skills (real corpus, sibling repo `badlogic/pi-skills`) / commands (prompt templates) / hooks (TS extensions) / agents (example subagent defs) / workflows (subagent chaining presets) / cli

## Enumeration method

GitHub REST API only, no cloning. `gh api repos/earendil-works/pi` for metadata; `gh api "repos/earendil-works/pi/git/trees/main?recursive=1"` for the full 1,521-entry tree (`truncated:false`), filtered in Python for `skills`/`prompts`/`extensions`/`SKILL.md` paths; `gh api repos/.../contents/{path} -H "Accept: application/vnd.github.raw"` to read actual frontmatter/content (not inferred from filenames) for `docs/skills.md`, `docs/prompt-templates.md`, `docs/extensions.md`, the add-llm-provider skill, all 5 prompt templates, and the subagent example files. Same two-step (tree + raw content) applied to `badlogic/pi-skills` once its own docs pointed to it (39-entry tree, not truncated; README read in full). `gh api repos/badlogic/pi-mono` confirmed the "pi-mono" hint resolves via redirect to the same repo record as `earendil-works/pi`.

## Items

### Real skill corpus — badlogic/pi-skills (8 skills, strict Claude-Code-compatible SKILL.md format)

| name | kind | path | purpose |
|------|------|------|---------|
| brave-search | skill | `badlogic/pi-skills/brave-search/SKILL.md` | Web search and content extraction via Brave Search API |
| browser-tools | skill | `badlogic/pi-skills/browser-tools/SKILL.md` | Interactive browser automation via Chrome DevTools Protocol |
| gccli | skill | `badlogic/pi-skills/gccli/SKILL.md` | Google Calendar CLI for events and availability |
| gdcli | skill | `badlogic/pi-skills/gdcli/SKILL.md` | Google Drive CLI for file management and sharing |
| gmcli | skill | `badlogic/pi-skills/gmcli/SKILL.md` | Gmail CLI for email, drafts, and labels |
| transcribe | skill | `badlogic/pi-skills/transcribe/SKILL.md` | Speech-to-text transcription via Groq Whisper API |
| vscode | skill | `badlogic/pi-skills/vscode/SKILL.md` | VS Code integration for diffs and file comparison |
| youtube-transcript | skill | `badlogic/pi-skills/youtube-transcript/SKILL.md` | Fetch YouTube video transcripts |

### In-repo (earendil-works/pi) — thin, mostly dogfooding/example/test content

| name | kind | path | purpose |
|------|------|------|---------|
| add-llm-provider | skill | `.pi/skills/add-llm-provider.md` | Repo-internal dogfooding skill: checklist for adding a new LLM provider to `packages/ai` |
| dynamic-resources (demo) | skill | `packages/coding-agent/examples/extensions/dynamic-resources/SKILL.md` | Example skill bundled inside the dynamic-resources example extension, demonstrating dynamic resource loading |
| skills test fixtures (11 files, not real content) | other | `packages/coding-agent/test/fixtures/skills/{consecutive-hyphens,disable-model-invocation,invalid-name-chars,invalid-yaml,long-name,missing-description,multiline-description,name-mismatch,nested/child-skill,no-frontmatter,root-skill-preferred,unknown-field,valid-skill}/SKILL.md` + `test/fixtures/skills-collision/{first,second}/calendar/SKILL.md` | Parser/validator unit-test fixtures for the skill-loader (edge cases, deliberately malformed) — not usable skill content |
| cl | command | `.pi/prompts/cl.md` | Audit changelog entries before release (prompt template, `/cl`) |
| is | command | `.pi/prompts/is.md` | Analyze GitHub issues, bugs or feature requests (prompt template, `/is`) |
| pr | command | `.pi/prompts/pr.md` | Review PRs from URLs with structured issue and code analysis (prompt template, `/pr`) |
| sa | command | `.pi/prompts/sa.md` | Update a GitHub security advisory for publication (prompt template, `/sa`) |
| wr | command | `.pi/prompts/wr.md` | Finish the current task end-to-end with changelog, commit, and push (prompt template, `/wr`) |
| import-repro.ts | hook | `.pi/extensions/import-repro.ts` | Repo-internal dev extension (TS, project-local) |
| prompt-url-widget.ts | hook | `.pi/extensions/prompt-url-widget.ts` | Repo-internal dev extension (TS, project-local) |
| redraws.ts | hook | `.pi/extensions/redraws.ts` | Repo-internal dev extension (TS, project-local) |
| tps.ts | hook | `.pi/extensions/tps.ts` | Repo-internal dev extension (TS, project-local) |

### Example extensions library (`packages/coding-agent/examples/extensions/`, 98 .ts/.md files total)

| name | kind | path | purpose |
|------|------|------|---------|
| permission-gate.ts | hook | `packages/coding-agent/examples/extensions/permission-gate.ts` | Example: confirm before destructive commands (rm -rf, sudo) |
| git-checkpoint.ts | hook | `packages/coding-agent/examples/extensions/git-checkpoint.ts` | Example: stash at each turn, restore on branch |
| protected-paths.ts | hook | `packages/coding-agent/examples/extensions/protected-paths.ts` | Example: block writes to .env, node_modules/ |
| sandbox | hook | `packages/coding-agent/examples/extensions/sandbox/index.ts` | Example: sandboxed tool execution extension (with own package.json) |
| custom-provider-anthropic | hook | `packages/coding-agent/examples/extensions/custom-provider-anthropic/index.ts` | Example: register a custom Anthropic-backed LLM provider |
| custom-provider-gitlab-duo | hook | `packages/coding-agent/examples/extensions/custom-provider-gitlab-duo/index.ts` | Example: register a custom GitLab Duo LLM provider |
| plan-mode | hook | `packages/coding-agent/examples/extensions/plan-mode/index.ts` | Example: plan-then-execute mode extension |
| todo.ts | hook | `packages/coding-agent/examples/extensions/todo.ts` | Example: stateful todo-list tool |
| custom-compaction.ts | hook | `packages/coding-agent/examples/extensions/custom-compaction.ts` | Example: custom conversation-compaction strategy |
| gondolin | hook | `packages/coding-agent/examples/extensions/gondolin/index.ts` | Example extension with its own package.json/deps |
| doom-overlay | hook | `packages/coding-agent/examples/extensions/doom-overlay/index.ts` | Example: playable Doom port rendered as a TUI overlay (novelty demo) |
| [+68 more example extensions not itemized individually] | other | `packages/coding-agent/examples/extensions/*.ts` (98 total .ts/.md files in this directory) | Full teaching corpus of extension patterns: tool overrides, custom UI, status lines, notifications, RPC demos, session-name automation, dirty-repo guards, event-bus, file-trigger, github-issue-autocomplete, interactive-shell, structured-output, timed-confirm, working-indicator, plus several game demos (snake, space-invaders, tic-tac-toe) |
| scout | agent | `packages/coding-agent/examples/extensions/subagent/agents/scout.md` | Example subagent definition: fast recon, returns compressed context (frontmatter: name/description/tools/model) |
| planner | agent | `packages/coding-agent/examples/extensions/subagent/agents/planner.md` | Example subagent definition: creates implementation plans from scout context + requirements |
| reviewer | agent | `packages/coding-agent/examples/extensions/subagent/agents/reviewer.md` | Example subagent definition: code review |
| worker | agent | `packages/coding-agent/examples/extensions/subagent/agents/worker.md` | Example subagent definition: general-purpose, full capabilities |
| implement | workflow | `packages/coding-agent/examples/extensions/subagent/prompts/implement.md` | Workflow preset chaining subagents: scout -> planner -> worker |
| scout-and-plan | workflow | `packages/coding-agent/examples/extensions/subagent/prompts/scout-and-plan.md` | Workflow preset: scout -> planner (no implementation) |
| implement-and-review | workflow | `packages/coding-agent/examples/extensions/subagent/prompts/implement-and-review.md` | Workflow preset: worker -> reviewer -> worker |

## Format notes

Two distinct corpora, both authored by Mario Zechner (npm scope `@mariozechner`):

**1. Skills (Agent Skills standard)** — directory `name/SKILL.md`, everything else in the dir is freeform (`scripts/`, `references/`, `assets/`). Frontmatter: `name` (required, ≤64 chars, lowercase a-z0-9-, no leading/trailing/consecutive hyphens), `description` (required, ≤1024 chars), optional `license`, `compatibility` (≤500 chars), `metadata` (arbitrary KV), `allowed-tools` (space-delimited tool allowlist, experimental), `disable-model-invocation` (bool, hides from system prompt, forces `/skill:name` invocation). Pi explicitly implements the cross-harness "Agent Skills standard" (agentskills.io/specification) and is deliberately lenient — most spec violations warn but still load; the one hard rule Pi diverges from the spec on is NOT requiring skill name == parent dir name ("suboptimal for shared skill directories used across multiple agent harnesses"). Discovery locations: global `~/.pi/agent/skills/`, `~/.agents/skills/`; project `.pi/skills/`, `.agents/skills/`; via `package.json` `pi.skills` entries; `settings.json` `skills` array; CLI `--skill`. Root `.md` files (not in a SKILL.md dir) are individually discovered as skills in `~/.pi/agent/skills/` and `.pi/skills/` only. Skills auto-register as `/skill:name` commands. Pi's own docs (`packages/coding-agent/docs/skills.md`) explicitly point to two skill sources: Anthropic's github.com/anthropics/skills, and `badlogic/pi-skills` — confirming Pi treats skills as an *installed, portable* corpus rather than something it ships wholesale itself.

**2. Prompt Templates ("commands")** — flat `*.md` in `.pi/prompts/` (project) or `~/.pi/agent/prompts/` (global). Filename = command name (`review.md` → `/review`). Frontmatter: `description` (optional, defaults to first non-empty line), `argument-hint` (optional, `<required>`/`[optional]` shown in autocomplete). Body supports `$ARGUMENTS` and `$@` substitution. Directly equivalent to Claude Code custom slash commands.

**3. Extensions ("hooks"/plugins, NOT skills)** — TypeScript modules in `.pi/extensions/` (project) or `~/.pi/agent/extensions/` (global), hot-reloadable via `/reload`. Register custom tools (`pi.registerTool()`), intercept lifecycle events, add commands (`pi.registerCommand()`), build custom TUI components, persist session state. This is Pi's merged analog of Claude Code hooks + MCP tools + plugins in one TS API — code, not markdown, so it does not fit the skill shape at all.

**Verdict on format to borrow:** the Agent-Skills-standard SKILL.md shape (matches Claude Code's own) is the strongest, most portable convention seen — worth keeping as-is for Adam's redesign. The prompt-template `argument-hint` frontmatter field (shown in autocomplete) is a nice small addition Claude Code commands lack. The TS-extension mechanism is a good model for "hooks" but is a different medium than markdown skills and shouldn't be conflated with the skill catalog question.

## Quality read

`earendil-works/pi` (the harness repo) is NOT itself a skills corpus — it's a full agent toolkit (agent loop, unified LLM API, TUI, CLI, protocol, session backends) that implements a skills-*loading* mechanism but ships almost no real skill content of its own: one dogfooding skill for its own contributors (`add-llm-provider.md`, a checklist for adding LLM providers to the codebase), one demo skill buried in example code (`dynamic-resources/SKILL.md`), and ~10 deliberately-malformed test fixtures used only to unit-test the skill-frontmatter parser (invalid-yaml, consecutive-hyphens, missing-description, etc. — not usable content, listed for completeness/honesty only). Its 5 prompt-templates are also purely repo-maintainer workflows (changelog audit, GitHub issue triage, PR review, security-advisory drafting, task wrap-up) — not general-purpose. Its most substantial shipped corpus is the 98-file example-extensions library, a broad, high-quality "look what you can build" teaching set (serious: permission gates, git checkpointing, sandboxing, custom LLM providers, path protection, subagent delegation — playful: a Doom port, Snake, Space Invaders, tic-tac-toe) but is explicitly example/reference code, not an installed-by-default feature set. This is an active, well-maintained, high-star (85,598★, MIT, pushed today) project, but as a *skills catalog* it is thin by design — it defers to external skill repos.

The real skill corpus is the companion repo the docs point to: `badlogic/pi-skills` (2,343★, MIT, not archived, created 2025-12-12, last pushed 2026-06-06 — small, stable, not actively growing but not dead either). It ships exactly 8 skills, each a real, narrowly-scoped integration (web search, browser automation via CDP, 3 Google Workspace CLIs, audio transcription, VS Code diffing, YouTube transcripts) in strict Claude-Code-compatible SKILL.md format, explicitly documented for cross-harness install (Claude Code, Codex CLI, Amp, Droid). It is a serious, tightly curated boutique library — not padded, not thin-stub — but small in absolute count (8), a fraction the size of Adam's own 117-skill library.

## Unresolved / caveats

None. `unresolved: []` in the source agent's final structured payload. The only ambiguity flagged (the "pi-mono" naming hint) was resolved: `badlogic/pi-mono` is a GitHub API redirect to the same repo record as `earendil-works/pi`, not a separate project.

Recovery note: the original agent made 5 StructuredOutput attempts (all with identical 39-item `items` array, progressively adding/reordering top-level keys) before exhausting retries on payload size/parse failure. This file reconstructs the fullest of those attempts (5th call, all fields present).
