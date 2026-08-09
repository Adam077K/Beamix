# Spec Kit (github/spec-kit)

**resolved:** yes — unambiguous match. `github/spec-kit`, description "Toolkit to help you get started with Spec-Driven Development", GitHub-org-owned.
**repo:** https://github.com/github/spec-kit
**stats:** 125,892 stars · MIT license · not archived · last push 2026-08-07 (actively maintained, current as of harvest date)
**ships:** commands, templates, workflows, cli — **NOT** a pre-built SKILL.md corpus in its own repo (see Quality read).

> Recovery note: this transcript is the `Spec Kit` harvester from workflow `wf_e3e37f38-729`. It completed real research (GitHub Contents API walks + raw file reads across 17+ paths) but never returned successfully — 5 consecutive `StructuredOutput` attempts were rejected by schema validation (`must have required property 'enumeration_method'`, then repeatedly `must NOT have additional properties` after the agent kept adding descriptive extra fields like `repo_url`/`stats`/`resolution_note`/`unresolved`). The three richest attempts (lines 91, 93, 96 in the transcript) carry an **identical 25-item list** with identical paths — the content itself is stable and consistent across retries, only the top-level JSON shape kept failing schema. This file is reconstructed from the fullest of those attempts (line 93).

## Items

| name | kind | path | purpose |
|---|---|---|---|
| specify CLI | other (CLI) | `src/specify_cli/__init__.py` | Python CLI (`specify init\|check\|version`) that scaffolds `.specify/` in a target repo and renders the 10 command templates into 30+ agent-specific command or skill formats |
| speckit.constitution | command | `templates/commands/constitution.md` | Establish/update project governing principles; syncs dependent templates |
| speckit.specify | command | `templates/commands/specify.md` | Turn a natural-language feature description into a testable feature spec (max 3 clarification questions, tech-agnostic success criteria) |
| speckit.clarify | command | `templates/commands/clarify.md` | Ask targeted clarification questions (scope/security/UX priority) and encode answers back into the spec |
| speckit.plan | command | `templates/commands/plan.md` | Generate technical design/plan artifacts from the spec (stack, architecture, constraints) |
| speckit.tasks | command | `templates/commands/tasks.md` | Generate a dependency-ordered, phase-grouped task list with parallel-execution markers |
| speckit.checklist | command | `templates/commands/checklist.md` | Generate a custom quality checklist validating spec completeness/clarity (not code) |
| speckit.analyze | command | `templates/commands/analyze.md` | Read-only cross-artifact consistency/quality analysis across spec, plan, and tasks |
| speckit.implement | command | `templates/commands/implement.md` | Execute tasks in dependency order, optionally staged by phase |
| speckit.converge | command | `templates/commands/converge.md` | Assess codebase vs. artifacts for missed work; appends gaps as new tasks |
| speckit.taskstoissues | command | `templates/commands/taskstoissues.md` | Export generated tasks to tracker issues (name-inferred; not covered in the docs excerpt the agent fetched) |
| spec-template.md | template | `templates/spec-template.md` | Output-artifact skeleton for speckit.specify |
| plan-template.md | template | `templates/plan-template.md` | Output-artifact skeleton for speckit.plan |
| tasks-template.md | template | `templates/tasks-template.md` | Output-artifact skeleton for speckit.tasks |
| checklist-template.md | template | `templates/checklist-template.md` | Output-artifact skeleton for speckit.checklist |
| constitution-template.md | template | `templates/constitution-template.md` | Bracket-placeholder skeleton for the project constitution (principles, constraints, governance) |
| seed constitution | template | `.specify/memory/constitution.md` | Default/seed constitution instance materialized into new projects |
| helper scripts (bash/powershell/python) | other | `scripts/bash/` | Cross-platform prerequisite-check and support scripts each command's frontmatter invokes (mirrored in `scripts/powershell/` and `scripts/python/`) |
| extensions system | workflow | `extensions/` | Pluggable pre/post-command hooks (subdirs: agent-context, assess, bug, git, selftest, template), each with its own `extension.yml` manifest; `catalog.json` (official) + `catalog.community.json` (community) for discovery |
| agent-context extension | hook | `extensions/agent-context/extension.yml` | Example extension instance — ships `extension.yml`, `agent-context-config.yml`, `agent-context-defaults.json` plus `commands/` and `scripts/` subdirs |
| presets system | workflow | `presets/` | Stackable, priority-ordered template/command override collections (subdirs: constitution-sync, lean, scaffold, self-test), each with a `preset.yml` manifest |
| lean preset | workflow | `presets/lean/preset.yml` | Example preset instance with its own README.md, preset.yml, and commands/ override dir |
| workflows subsystem | workflow | `workflows/speckit/workflow.yml` | Declarative pipeline/workflow definitions, cataloged via `workflows/catalog.json` + `catalog.community.json` + `step-catalog.json` |
| bundles catalog | workflow | `bundles/catalog.community.json` | Packages integrations + extensions + presets together for one-shot install |
| agent integration adapters | other | `src/specify_cli/integrations/` | 37 per-agent renderer packages (e.g. claude, copilot, codex, cursor_agent, gemini, grok, devin, goose, zed, trae, kimi, qwen, ...) built on `SkillsIntegration`/`MarkdownIntegration`/`TomlIntegration`/`YamlIntegration` base classes; each maps the 10 templates to that agent's native command-or-skill format and output path |

## Format notes

Repo layout (verified via GitHub Contents API):
- `templates/commands/*.md` = 10 source-of-truth workflow prompts (agent-agnostic).
- `templates/*.md` = artifact templates (spec/plan/tasks/checklist/constitution) using bracket-placeholder convention (`[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`) with HTML-comment examples, no frontmatter.
- `.specify/memory/constitution.md` = seed instance of the constitution template, materialized into consuming projects by `specify init`.
- `scripts/{bash,powershell,python}/` = cross-platform helper scripts each command's frontmatter shells out to.
- `src/specify_cli/` = the Python CLI/renderer, with `integrations/` (37 per-agent adapter packages), `extensions/`, `presets/`, `workflows/`, `bundler/` mirroring the top-level `extensions/`, `presets/`, `workflows/`, `bundles/` source directories. Each of those four subsystems pairs an official `catalog.json` with a community `catalog.community.json` for discovery.

**Command-template frontmatter** (verified verbatim from `templates/commands/specify.md` and `checklist.md`):
```yaml
---
description: <string>
scripts:            # optional, per-shell script + args the prompt invokes
  sh: <bash path + args>
  ps: <powershell path + args>
  py: <python path + args>
handoffs:            # optional, chains to the next speckit command
  - label: <string>
    agent: speckit.<next-command>
    prompt: <string>
    send: <bool>
---
```
Body uses a literal `$ARGUMENTS` placeholder for user input, written agent-agnostically — one file is the single source rendered into every target agent's native format.

**Dual render targets** (confirmed via `docs/reference/integrations.md` + `AGENTS.md` + source strings in `src/specify_cli/integrations/claude/__init__.py`): each of the 10 templates renders EITHER as a slash-command file (`.claude/commands/`, `.github/agents/*.agent.md` for Copilot commands-mode, etc.) OR — for ~20 agents whose integration defaults to "skills mode," including Claude Code — as a real Claude Code skill at `.claude/skills/speckit-<command-name>/SKILL.md` (naming pattern `speckit-<name>`, frontmatter injected by the renderer). This rendering happens **inside a consuming project** when `specify init` runs; spec-kit's own repo ships only the source templates, never a checked-in `.claude/skills/` output. Other skills-mode output paths seen: `.agents/skills` (Codex, Zed), `.github/skills/` (Copilot default), `.grok/skills` (Grok).

**Extension/preset unit format**: each extension/preset ships its own `extension.yml`/`preset.yml` manifest plus `commands/` and/or `scripts/` subdirs (e.g. `extensions/agent-context/extension.yml` + `agent-context-config.yml` + `agent-context-defaults.json`), layered by priority order (core defaults → presets → extensions → project overrides) per `docs/reference/presets.md`. Per-project install state is tracked in `.specify/integrations/<key>.manifest.json` with SHA-256 file hashes for safe uninstall.

## Quality read

Large, active, feature-rich project — not a thin corpus. 125,892 stars, MIT-licensed, not archived, last pushed 2026-08-07 (essentially current). It is **NOT** a static skills corpus, though: it's a spec-driven-development **methodology + CLI + template-rendering engine**, with its own repo shipping zero pre-built SKILL.md files. What it ships directly is 10 agent-agnostic slash-command-style prompt templates (`templates/commands/*.md`) plus 5 fill-in-the-blank artifact templates, wrapped in a genuine plugin ecosystem (37 per-agent integration adapters, plus extensions/presets/bundles/workflows subsystems each with official+community catalogs and a priority-ordered override/layering model).

The interesting part for a redesign: when a consuming project runs `specify init` targeting Claude Code (or ~20 other assistants whose integration defaults to skills mode), the CLI renders those same 10 templates into real Claude Code skills at `.claude/skills/speckit-<name>/SKILL.md` — so spec-kit is best read as a **skill/command generator with per-agent adapters, not a skill library to copy from**. The 10 templates themselves are thin process-scaffolding prompts (constitution → specify → clarify → plan → tasks → checklist → analyze → implement → converge → taskstoissues), not deep domain expertise. The architecture worth stealing is the layering model (core defaults → presets → extensions → project overrides, priority-ordered) and the clean separation between agent-agnostic source templates and per-agent render adapters — more than any specific skill content.

## Unresolved / caveats

- `taskstoissues.md` purpose is inferred from its filename only — not found described in the `docs/reference` pages fetched (`docs/reference/agentic-sdd.md` covered the other 9 commands but omitted this one).
- The generated-skill frontmatter fields (`argument-hint`, `user-invocable`) are paraphrased from an AI summary of `src/specify_cli/integrations/claude/__init__.py` source strings, not a verbatim quote of the file, and no actual rendered `SKILL.md` output was inspected (spec-kit's own repo never checks one in — it's produced at `specify init` time in a consuming project).
- **Prior claim re-check:** an earlier research pass cited spec-kit for "hardened ingestion of untrusted external content," but that finding failed adversarial verification. This independent pass did not encounter any security-hardening/sandboxing language in any of the paths checked (repo root, `.specify`, `.specify/memory`, `templates`, `templates/commands`, `src`, `src/specify_cli`, `src/specify_cli/integrations`, `src/specify_cli/integrations/claude`, `scripts`, `workflows`, `workflows/speckit`, `presets`, `presets/lean`, `extensions`, `extensions/agent-context`, `bundles`, `docs`, `docs/reference`). The claim is therefore **neither re-confirmed nor specifically refuted** here — treat it as still unverified, do not inherit it.

**Enumeration method:** GitHub REST Contents API (`api.github.com/repos/github/spec-kit/contents/<path>`) via WebFetch, walked at repo root and 16 subdirectories: `.specify`, `.specify/memory`, `templates`, `templates/commands`, `src`, `src/specify_cli`, `src/specify_cli/integrations`, `src/specify_cli/integrations/claude`, `scripts`, `workflows`, `workflows/speckit`, `presets`, `presets/lean`, `extensions`, `extensions/agent-context`, `bundles`, `docs`, `docs/reference`. Cross-checked against `raw.githubusercontent.com` reads of `templates/commands/specify.md` and `checklist.md` (frontmatter, verbatim), `AGENTS.md`, `README.md`, `docs/reference/integrations.md`, `docs/reference/agentic-sdd.md`, `docs/reference/core.md`, `extensions/README.md`, `presets/README.md`, `templates/constitution-template.md`, and `src/specify_cli/integrations/claude/__init__.py` (source-string confirmation of the `.claude/skills` output path and `speckit-<name>` naming convention). Repo metadata (stars/license/archived/pushed_at) pulled from `api.github.com/repos/github/spec-kit`.
