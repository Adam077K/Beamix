# Superpowers

**resolved:** yes
**repo:** https://github.com/obra/superpowers (core plugin) + 3 sibling repos under the same author/org
**author:** Jesse Vincent (`obra`), MIT license
**ships:** skills, hooks, workflows (plus, at the marketplace level, some MCP-server plugins that are outside the skill/kind scope of this catalog — see "Non-skill marketplace plugins" below)

## Resolution

The prior resolver had FAILED on this source ("no matching repository... likely unrelated"). This run resolved it successfully via `gh api search/repositories?q=superpowers+claude+skills`, which surfaced `obra/superpowers-skills` directly and `obra/superpowers` by cross-reference from many forks.

Confirmed via `gh api repos/obra/superpowers` metadata: description "An agentic skills framework & software development methodology that works.", topics = `[ai, brainstorming, coding, obra, sdlc, skills, subagent-driven-development, superpowers]`, MIT license, homepage points to itself. Independently corroborated by multiple unrelated third-party repos that explicitly name-check `obra/superpowers` as their base (GadaaLabs/claude-code-on-steroids, dev-toolings/superpowers-symfony, squallopen/superpowers-zh-adapters, wishworldbetter/seedex-skills, binbinao/document-superpowers).

The ecosystem has 3 sibling repos under the same author, all fetched and enumerated directly via full recursive tree listings:

| Repo | Role | Stars | Blobs enumerated |
|---|---|---|---|
| `obra/superpowers` | Core plugin (mechanism: hook + bootstrap skills + harness adapters) | 269,283★ (see caveat below) | 180 |
| `obra/superpowers-skills` | Community-editable skill corpus, auto-cloned at runtime to `~/.config/superpowers/skills/` — the operative catalog | 737★ | 84 |
| `obra/superpowers-lab` | Experimental staging repo (v0.5.0) for skills not yet graduated into the main corpus | 410★ | 15 |
| `obra/superpowers-marketplace` | Plugin registry aggregating 10 plugins under one manifest (v1.0.13) | — | 4 |

The prior resolver's single hit, `eli5-claw/superpowers-crypto-skills` (0★), is confirmed unrelated — a different, unconnected project that happens to reuse the word "superpowers"; it does not appear anywhere in obra's org, forks, or the marketplace registry.

**Star-count caveat (reported, not adjusted):** the GitHub API reported 269,283 stars / 24,051 forks on `obra/superpowers`, a repo created 2025-10-09 (~10 months old at check time) — a growth rate far outside normal organic GitHub patterns. The harvesting agent could not cross-check this against a second source because the session's WebSearch budget (200/200) was already exhausted. It reported the number exactly as the API returned it rather than silently adjusting it, and flagged it as unverified. The corroborating signals (large fork/translation ecosystem, recent push activity, 324 open issues, real test suite, dogfooded internal docs) all independently point to this being a real, actively used project regardless of the star-count anomaly.

## Items

Verified via `gh api repos/{owner}/{repo}/git/trees/main?recursive=1` (full recursive tree, not cached/inferred) plus targeted `contents/` fetches (base64-decoded) for manifests and 2 sample `SKILL.md` files.

**Note on dedup:** the core repo (`obra/superpowers`) ships 14 skills flat at `skills/<name>/SKILL.md`; 13 of those 14 reappear in `obra/superpowers-skills` re-categorized under `skills/<category>/<name>/SKILL.md` with the same name/purpose. The table below lists each skill once, at its canonical (categorized) path, except `using-superpowers` which is unique to the core repo.

| name | kind | path | purpose |
|---|---|---|---|
| preserving-productive-tensions | skill | `obra/superpowers-skills/skills/architecture/preserving-productive-tensions/SKILL.md` | |
| brainstorming | skill | `obra/superpowers-skills/skills/collaboration/brainstorming/SKILL.md` | also shipped flat in `obra/superpowers/skills/brainstorming/SKILL.md` — the pre-planning spec-elicitation skill |
| dispatching-parallel-agents | skill | `obra/superpowers-skills/skills/collaboration/dispatching-parallel-agents/SKILL.md` | |
| executing-plans | skill | `obra/superpowers-skills/skills/collaboration/executing-plans/SKILL.md` | |
| finishing-a-development-branch | skill | `obra/superpowers-skills/skills/collaboration/finishing-a-development-branch/SKILL.md` | |
| receiving-code-review | skill | `obra/superpowers-skills/skills/collaboration/receiving-code-review/SKILL.md` | |
| remembering-conversations | skill | `obra/superpowers-skills/skills/collaboration/remembering-conversations/SKILL.md` | ships a full `tool/` subdir (TS source, embeddings, sessionEnd hook, search-agent) — largest skill in the corpus by file count |
| requesting-code-review | skill | `obra/superpowers-skills/skills/collaboration/requesting-code-review/SKILL.md` | |
| subagent-driven-development | skill | `obra/superpowers-skills/skills/collaboration/subagent-driven-development/SKILL.md` | ships `scripts/{review-package,sdd-workspace,task-brief}` — real orchestration tooling, not just prose |
| using-git-worktrees | skill | `obra/superpowers-skills/skills/collaboration/using-git-worktrees/SKILL.md` | |
| writing-plans | skill | `obra/superpowers-skills/skills/collaboration/writing-plans/SKILL.md` | |
| defense-in-depth | skill | `obra/superpowers-skills/skills/debugging/defense-in-depth/SKILL.md` | |
| root-cause-tracing | skill | `obra/superpowers-skills/skills/debugging/root-cause-tracing/SKILL.md` | |
| systematic-debugging | skill | `obra/superpowers-skills/skills/debugging/systematic-debugging/SKILL.md` | confirmed frontmatter: name+description only; body has an "Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST" |
| verification-before-completion | skill | `obra/superpowers-skills/skills/debugging/verification-before-completion/SKILL.md` | |
| gardening-skills-wiki | skill | `obra/superpowers-skills/skills/meta/gardening-skills-wiki/SKILL.md` | ships 4 shell scripts (analyze-search-gaps, check-index-coverage, check-links, check-naming) for maintaining the skill corpus itself |
| pulling-updates-from-skills-repository | skill | `obra/superpowers-skills/skills/meta/pulling-updates-from-skills-repository/SKILL.md` | |
| sharing-skills | skill | `obra/superpowers-skills/skills/meta/sharing-skills/SKILL.md` | |
| testing-skills-with-subagents | skill | `obra/superpowers-skills/skills/meta/testing-skills-with-subagents/SKILL.md` | |
| writing-skills | skill | `obra/superpowers-skills/skills/meta/writing-skills/SKILL.md` | includes `persuasion-principles.md` and `anthropic-best-practices.md` as reference sub-docs |
| collision-zone-thinking | skill | `obra/superpowers-skills/skills/problem-solving/collision-zone-thinking/SKILL.md` | |
| inversion-exercise | skill | `obra/superpowers-skills/skills/problem-solving/inversion-exercise/SKILL.md` | |
| meta-pattern-recognition | skill | `obra/superpowers-skills/skills/problem-solving/meta-pattern-recognition/SKILL.md` | |
| scale-game | skill | `obra/superpowers-skills/skills/problem-solving/scale-game/SKILL.md` | |
| simplification-cascades | skill | `obra/superpowers-skills/skills/problem-solving/simplification-cascades/SKILL.md` | |
| when-stuck | skill | `obra/superpowers-skills/skills/problem-solving/when-stuck/SKILL.md` | |
| tracing-knowledge-lineages | skill | `obra/superpowers-skills/skills/research/tracing-knowledge-lineages/SKILL.md` | |
| condition-based-waiting | skill | `obra/superpowers-skills/skills/testing/condition-based-waiting/SKILL.md` | |
| test-driven-development | skill | `obra/superpowers-skills/skills/testing/test-driven-development/SKILL.md` | |
| testing-anti-patterns | skill | `obra/superpowers-skills/skills/testing/testing-anti-patterns/SKILL.md` | |
| using-skills | skill | `obra/superpowers-skills/skills/using-skills/SKILL.md` | ships `find-skills` and `skill-run` executables |
| using-superpowers | skill | `obra/superpowers/skills/using-superpowers/SKILL.md` | the always-on skill loaded by the SessionStart hook; makes skill-invocation mandatory rather than optional. Unique to the core plugin repo — not in `obra/superpowers-skills` |

### `obra/superpowers-lab` (experimental staging repo — path-verified via tree listing, not itemized in the agent's final `items` array)

These 4 paths were confirmed present via the recursive tree fetch of `obra/superpowers-lab` (line 39 tool result in the transcript) but the harvesting agent did not carry them into its final `items` list. Recorded here since they meet the path-verification bar.

| name | kind | path | purpose |
|---|---|---|---|
| finding-duplicate-functions | skill | `obra/superpowers-lab/skills/finding-duplicate-functions/SKILL.md` | ships `scripts/{categorize-prompt.md, extract-functions.sh, find-duplicates-prompt.md, generate-report.sh, prepare-category-analysis.sh}` — semantic (not syntactic) duplicate-code detection for LLM-generated codebases |
| mcp-cli | skill | `obra/superpowers-lab/skills/mcp-cli/SKILL.md` | |
| using-tmux-for-interactive-commands | skill | `obra/superpowers-lab/skills/using-tmux-for-interactive-commands/SKILL.md` | ships `tmux-wrapper.sh` |
| windows-vm | skill | `obra/superpowers-lab/skills/windows-vm/SKILL.md` | |

### Hook (not a skill, but load-bearing mechanism)

| name | kind | path | purpose |
|---|---|---|---|
| SessionStart hook | hook | `obra/superpowers/hooks/hooks.json` (+ `hooks/session-start`, `hooks/run-hook.cmd`, plus a `hooks-cursor.json` variant) | Forces the model to read `skills/using-superpowers/SKILL.md` at conversation start; that skill then instructs the model it "does not have a choice" about invoking a matching skill before any response, including clarifying questions. This is the mechanism that makes skill-checking non-optional rather than best-effort. |

### Non-skill marketplace plugins (listed in `obra/superpowers-marketplace/.claude-plugin/marketplace.json`, no internal path enumerated — do not treat as skill items)

The marketplace registers 10 plugins total; 2 are the skill-bearing repos already itemized above (`superpowers`, and implicitly `superpowers-lab`). The other entries are separate tools distributed under the same brand, each with only a manifest-level `source` URL (no internal file tree was fetched for these, so no further path-level items can be reported):

- `superpowers-chrome` — Chrome DevTools Protocol access via a "browsing" skill (skill mode + MCP mode)
- `elements-of-style` — writing-guidance skill based on Strunk's *The Elements of Style*
- `superpowers-developing-for-claude-code` — meta skills/resources for building Claude Code plugins, skills, MCP servers
- `superpowers-dev` — dev branch of the core plugin
- `episodic-memory` — MCP server, semantic search over Claude Code/Codex conversations
- `claude-session-driver` — tmux-based multi-session orchestrator (launch/control/monitor other Claude Code sessions as workers)
- `private-journal-mcp` — MCP server, private journaling with semantic search
- `double-shot-latte` — suppresses "would you like me to continue?" interruptions

## Format notes

Two-part corpus format, deliberately decoupled:

1. **Core plugin repo** (`obra/superpowers`, v6.2.0, MIT) ships a flat bootstrap set: `skills/<skill-name>/SKILL.md`, no category folders, 14 skills total. Also ships one SessionStart hook whose entire job is to force the model to read `skills/using-superpowers/SKILL.md` at conversation start.

2. **Community-editable skill corpus** (`obra/superpowers-skills`) is a SEPARATE repo the plugin auto-clones at runtime to `~/.config/superpowers/skills/`. This is the operative, evolving catalog — 31 `SKILL.md` files organized into 7 category folders: `skills/<category>/<skill-name>/SKILL.md` (architecture, collaboration, debugging, meta, problem-solving, research, testing) plus one top-level `skills/using-skills/SKILL.md`.

**Frontmatter schema** (confirmed on 2 samples, both repos): exactly two YAML keys —
```yaml
---
name: <skill-name>           # matches directory name
description: <one sentence>  # phrased as a trigger condition ("Use when X, before Y")
---
```
No category, version, or author field in the frontmatter itself — versioning lives at the plugin/repo level (`plugin.json`), not per-skill.

Supporting files live inside the same skill directory as siblings to `SKILL.md` — `scripts/` (executable helpers), `references/` (harness-specific notes, e.g. `codex-tools.md`/`pi-tools.md`/`gemini-tools.md`/`antigravity-tools.md` under `using-superpowers/references/`), and freestanding prose files that function as "sub-skills" for progressive disclosure (e.g. `systematic-debugging/{root-cause-tracing.md, defense-in-depth.md, condition-based-waiting.md}`, each also promoted to a first-class `SKILL.md` in the -skills repo).

**Plugin/marketplace manifest:** `.claude-plugin/plugin.json` (name, description, version, author, license, keywords) + `.claude-plugin/marketplace.json` (registers one or more plugins, each with a `source` — either `"./"` local or a git URL with optional `ref` for a branch). The separate registry repo `obra/superpowers-marketplace` aggregates 10 plugins under this scheme, not all of them skill libraries (see "Non-skill marketplace plugins" above) — so the "Superpowers" brand spans skills + hooks + MCP servers + standalone tools registered together, not a single monolithic skill pack.

**Cross-harness:** the same corpus is adapted (not duplicated) for Claude Code, Antigravity, Codex App/CLI, Cursor, Factory Droid, Gemini CLI, GitHub Copilot CLI, Kimi Code, OpenCode, and Pi via harness-specific top-level files/dirs (`.codex-plugin/`, `.cursor-plugin/`, `.kimi-plugin/`, `.opencode/`, `.pi/extensions/`, `gemini-extension.json`, `AGENTS.md`/`CLAUDE.md`/`GEMINI.md` as harness-specific instruction shims) plus `references/*.md` inside `using-superpowers` for per-harness tool-name mapping.

## Quality read

Serious and actively maintained — not a stub set. Evidence:
- Real test suite (`tests/` covers brainstorm-server unit tests, claude-code/codex/kimi/opencode/pi harness integration tests, and a dedicated `tests/explicit-skill-requests/` behavioral-prompt suite that checks the invocation-discipline actually fires).
- The project dogfoods its own methodology on itself (`docs/superpowers/plans/` shows ~15 dated planning/design docs written using its own writing-plans/brainstorming skills).
- MIT licensed; pushed within the last day relative to the check date; 324 open issues (active tracker, not abandoned).
- A large secondary ecosystem of forks, translations, and extensions that explicitly cite `obra/superpowers` as their base: `jnMetaCode/superpowers-zh` (7,557★, Chinese localization + 6 original additions), `GadaaLabs/claude-code-on-steroids` (14→24 skill extension), `dev-toolings/superpowers-symfony` (44-skill Symfony-specific fork), `squallopen/superpowers-zh-adapters`, `binbinao/document-superpowers`, `wishworldbetter/seedex-skills` — that breadth of derivative work is a stronger maintenance/relevance signal than the star count alone.

**Design idea worth stealing for a clean-sheet redesign** (per the harvesting agent): the hard split between a stable, versioned *mechanism* repo (hook + invocation-discipline skill + harness adapters) and a separately-versioned, auto-updating *content* repo (the actual skill corpus). That lets the corpus grow/reorganize (14 flat skills → 31 categorized skills) without bumping the plugin version or touching the hook that enforces skill-checking.

## Unresolved / caveats

- **Star count unverified.** 269,283★ / 24,051 forks on a 10-month-old repo is anomalous; the agent could not cross-check via WebSearch (budget exhausted at 200/200 calls before this query could run). Treat the number as reported-not-verified; lean on the corroborating activity signals instead.
- **`obra/superpowers-lab` items not carried into the agent's own `items` array** even though the agent had path-verified them via a full tree listing — added separately above under "not itemized in the agent's final items array" for completeness, per this recovery task's instruction to keep anything path-verified.
- **Non-skill marketplace plugins** (superpowers-chrome, elements-of-style, superpowers-developing-for-claude-code, superpowers-dev, episodic-memory, claude-session-driver, private-journal-mcp, double-shot-latte) were named via the marketplace manifest but their internal file trees were never fetched — no item-level paths available for their contents, so they are listed only as named plugins, not enumerated as skill items.
- Agent explicitly stated it did not read all 49 `SKILL.md` bodies individually — it verified enumeration + format (frontmatter schema) on 2 samples (`systematic-debugging`, `using-superpowers`) rather than exhaustively.
- The original agent's StructuredOutput call failed 3 times on schema-shape errors unrelated to content (missing `source` field, extra properties, missing `enumeration_method`) — this is why the run never returned; the payload itself (recovered here) was complete and well-formed on the first attempt.
