# GSD (get-shit-done)

**resolved:** yes — two repos, both confirmed via `gh api` metadata + full recursive git-tree listings.
**repo:** https://github.com/gsd-build/get-shit-done (archived) and https://github.com/open-gsd/gsd-core (active successor)
**stats:**
- ARCHIVED (`gsd-build/get-shit-done`): id 1116260703 · 64,734 stars · 5,472 forks · 267 subscribers · MIT · size 20,286 KB · created 2025-12-14 · archived (read-only) since 2026-06-26 · 0 open issues (closed on archive) · last push 2026-05-31 · default branch `main` · topics: claude-code, context-engineering, meta-prompting, spec-driven-development · README replaced with a redirect notice pointing to the successor.
- SUCCESSOR (`open-gsd/gsd-core`): id 1246625636 · 7,919 stars · 551 forks · 32 subscribers · MIT · size 49,706 KB (~2.4x archived repo) · created 2026-05-22 (~5 weeks *before* the archived repo was formally archived — a planned, overlapping migration, not a reactive fork) · NOT archived · 145 open issues · default branch `next` · last push 2026-08-08T20:05:20Z (day before this harvest — actively maintained) · homepage opengsd.net · published to npm as `@opengsd/gsd-core` · ships a `.claude-plugin/plugin.json` marketplace manifest declaring both `"commands": "./commands/gsd/"` and `"skills": "./skills/"` as plugin surfaces.

**ships:** skills (successor only), agents, commands, hooks, workflows, templates, cli

> Recovery note: this transcript is the `GSD (get-shit-done)` harvester from workflow `wf_e3e37f38-729`. It completed real research (GitHub REST API via `gh api`: repo metadata, full recursive tree listings of both repos, and base64-decoded raw file reads of `docs/skills/discovery-contract.md`, sample `SKILL.md`/command/agent/`capability.json` files, both READMEs, and a targeted grep of the archived repo's installer for skill-conversion logic) but never returned successfully — 5 consecutive `StructuredOutput` attempts were rejected by schema validation (alternating `must NOT have additional properties` and `must have required property 'enumeration_method'`). The three real-content attempts (transcript lines 53, 56, 59) all carry an **identical 132-item list** with identical paths — the content is stable across retries; only the top-level JSON shape kept failing schema (extra fields like `repo_url`/`stats`/`resolution_note`/`unresolved` vs. a missing `enumeration_method`). Two later attempts (lines 62, 65) are trivial `{"name":"test",...}` placeholder payloads the agent sent after exhausting its real attempts — ignored here. This file is reconstructed from the fullest of the real attempts (line 59).

## Items

**Skills** (successor repo `open-gsd/gsd-core` ONLY — 70 total `skills/gsd-*/SKILL.md` files; the archived repo ships zero checked-in skills):

| name | kind | path | purpose |
|---|---|---|---|
| gsd-add-tests | skill | `skills/gsd-add-tests/SKILL.md` | Generate tests for a completed phase based on UAT criteria and implementation |
| gsd-ai-integration-phase | skill | `skills/gsd-ai-integration-phase/SKILL.md` | AI-integration-specific phase workflow |
| gsd-audit-fix | skill | `skills/gsd-audit-fix/SKILL.md` | Fix issues found by an audit pass |
| gsd-audit-milestone | skill | `skills/gsd-audit-milestone/SKILL.md` | Audit a completed milestone |
| gsd-audit-uat | skill | `skills/gsd-audit-uat/SKILL.md` | Audit UAT criteria coverage |
| gsd-autonomous | skill | `skills/gsd-autonomous/SKILL.md` | Run GSD in autonomous/unattended mode |
| gsd-capture | skill | `skills/gsd-capture/SKILL.md` | Capture an idea/decision into the project inbox |
| gsd-cleanup | skill | `skills/gsd-cleanup/SKILL.md` | Clean up stale planning artifacts |
| gsd-code-review | skill | `skills/gsd-code-review/SKILL.md` | Run cross-tool code review pass |
| gsd-complete-milestone | skill | `skills/gsd-complete-milestone/SKILL.md` | Close out and archive a milestone |
| gsd-config | skill | `skills/gsd-config/SKILL.md` | View/edit GSD project configuration |
| gsd-debug | skill | `skills/gsd-debug/SKILL.md` | Start a structured debug session |
| gsd-discuss-phase | skill | `skills/gsd-discuss-phase/SKILL.md` | Capture implementation decisions before planning a phase |
| gsd-docs-update | skill | `skills/gsd-docs-update/SKILL.md` | Sync docs after implementation changes |
| gsd-eval-review | skill | `skills/gsd-eval-review/SKILL.md` | Review an eval/benchmark run |
| gsd-execute-phase | skill | `skills/gsd-execute-phase/SKILL.md` | Execute all plans in a phase with wave-based parallelization; `effort: high` |
| gsd-explore | skill | `skills/gsd-explore/SKILL.md` | Open-ended exploration of the codebase/problem space |
| gsd-extract-learnings | skill | `skills/gsd-extract-learnings/SKILL.md` | Extract reusable learnings from a completed phase |
| gsd-fast | skill | `skills/gsd-fast/SKILL.md` | Lightweight/low-ceremony fast-path flow |
| gsd-forensics | skill | `skills/gsd-forensics/SKILL.md` | Post-mortem forensic analysis of a failure |
| gsd-graphify | skill | `skills/gsd-graphify/SKILL.md` | Build a dependency graph of plans/phases |
| gsd-health | skill | `skills/gsd-health/SKILL.md` | Report project/installation health |
| gsd-help | skill | `skills/gsd-help/SKILL.md` | GSD help/command index |
| gsd-import | skill | `skills/gsd-import/SKILL.md` | Import external docs/specs into the project |
| gsd-inbox | skill | `skills/gsd-inbox/SKILL.md` | Manage the capture inbox |
| gsd-ingest-docs | skill | `skills/gsd-ingest-docs/SKILL.md` | Ingest external documentation into project context |
| gsd-manager | skill | `skills/gsd-manager/SKILL.md` | Top-level project/workstream manager entry point |
| gsd-map-codebase | skill | `skills/gsd-map-codebase/SKILL.md` | Map an existing codebase's structure/conventions |
| gsd-mempalace-capture | skill | `skills/gsd-mempalace-capture/SKILL.md` | Capture info into the mempalace memory system (successor only) |
| gsd-mempalace-recall | skill | `skills/gsd-mempalace-recall/SKILL.md` | Recall info from the mempalace memory system (successor only) |
| gsd-milestone-summary | skill | `skills/gsd-milestone-summary/SKILL.md` | Summarize a milestone's outcome |
| gsd-mvp-phase | skill | `skills/gsd-mvp-phase/SKILL.md` | MVP-scoped phase workflow |
| gsd-new-milestone | skill | `skills/gsd-new-milestone/SKILL.md` | Scaffold a new milestone |
| gsd-new-project | skill | `skills/gsd-new-project/SKILL.md` | Scaffold a new GSD project |
| gsd-next | skill | `skills/gsd-next/SKILL.md` | Determine/run the next actionable step (successor only) |
| gsd-ns-context | skill | `skills/gsd-ns-context/SKILL.md` | Non-software ("ns") project context step |
| gsd-ns-ideate | skill | `skills/gsd-ns-ideate/SKILL.md` | Non-software ideation step |
| gsd-ns-manage | skill | `skills/gsd-ns-manage/SKILL.md` | Non-software project management step |
| gsd-ns-project | skill | `skills/gsd-ns-project/SKILL.md` | Non-software project scaffold |
| gsd-ns-review | skill | `skills/gsd-ns-review/SKILL.md` | Non-software review step |
| gsd-ns-workflow | skill | `skills/gsd-ns-workflow/SKILL.md` | Non-software generic workflow step |
| gsd-onboard | skill | `skills/gsd-onboard/SKILL.md` | Onboard a new user/project (successor only) |
| gsd-pause-work | skill | `skills/gsd-pause-work/SKILL.md` | Checkpoint and pause in-flight work |
| gsd-phase | skill | `skills/gsd-phase/SKILL.md` | Generic phase entry point |
| gsd-plan-phase | skill | `skills/gsd-plan-phase/SKILL.md` | Create a detailed phase plan (PLAN.md) with verification loop |
| gsd-plan-review-convergence | skill | `skills/gsd-plan-review-convergence/SKILL.md` | Converge multi-reviewer plan feedback |
| gsd-pr-branch | skill | `skills/gsd-pr-branch/SKILL.md` | Create/manage the PR branch for a phase |
| gsd-profile-user | skill | `skills/gsd-profile-user/SKILL.md` | Build a user preference/skill profile |
| gsd-progress | skill | `skills/gsd-progress/SKILL.md` | Report roadmap/phase progress |
| gsd-quick | skill | `skills/gsd-quick/SKILL.md` | Quick unstructured task path |
| gsd-resume-work | skill | `skills/gsd-resume-work/SKILL.md` | Resume paused work |
| gsd-review | skill | `skills/gsd-review/SKILL.md` | General-purpose review step |
| gsd-review-backlog | skill | `skills/gsd-review-backlog/SKILL.md` | Review the project backlog |
| gsd-secure-phase | skill | `skills/gsd-secure-phase/SKILL.md` | Security-focused phase workflow |
| gsd-settings | skill | `skills/gsd-settings/SKILL.md` | Edit GSD settings |
| gsd-ship | skill | `skills/gsd-ship/SKILL.md` | Create the PR and ship a phase |
| gsd-sketch | skill | `skills/gsd-sketch/SKILL.md` | Rough sketch/spike planning |
| gsd-spec-phase | skill | `skills/gsd-spec-phase/SKILL.md` | Spec-first phase workflow |
| gsd-spike | skill | `skills/gsd-spike/SKILL.md` | Time-boxed technical spike |
| gsd-stats | skill | `skills/gsd-stats/SKILL.md` | Project statistics report |
| gsd-surface | skill | `skills/gsd-surface/SKILL.md` | Surface relevant context/decisions |
| gsd-thread | skill | `skills/gsd-thread/SKILL.md` | Manage a discussion thread |
| gsd-ui-phase | skill | `skills/gsd-ui-phase/SKILL.md` | UI-specific phase workflow |
| gsd-ui-review | skill | `skills/gsd-ui-review/SKILL.md` | Review UI implementation |
| gsd-ultraplan-phase | skill | `skills/gsd-ultraplan-phase/SKILL.md` | Deep/extended planning mode for a phase |
| gsd-undo | skill | `skills/gsd-undo/SKILL.md` | Undo the last GSD action |
| gsd-update | skill | `skills/gsd-update/SKILL.md` | Update GSD installation/version |
| gsd-validate-phase | skill | `skills/gsd-validate-phase/SKILL.md` | Validate a phase's plans before execution |
| gsd-verify-work | skill | `skills/gsd-verify-work/SKILL.md` | Verify completed work against plan/UAT |
| gsd-workspace | skill | `skills/gsd-workspace/SKILL.md` | Manage the planning workspace |
| gsd-workstreams | skill | `skills/gsd-workstreams/SKILL.md` | Manage parallel workstreams |

**Agents** (`agents/*.md`, both repos — 33 in archived, 34 in successor; Task-tool subagent definitions, NOT skills):

| name | kind | path | purpose |
|---|---|---|---|
| gsd-advisor-researcher | agent | `agents/gsd-advisor-researcher.md` | Advisory research support (both repos) |
| gsd-ai-researcher | agent | `agents/gsd-ai-researcher.md` | AI/ML-specific research |
| gsd-assumptions-analyzer | agent | `agents/gsd-assumptions-analyzer.md` | Surfaces unstated assumptions |
| gsd-code-fixer | agent | `agents/gsd-code-fixer.md` | Applies fixes for identified code issues |
| gsd-code-reviewer | agent | `agents/gsd-code-reviewer.md` | Code review pass |
| gsd-codebase-mapper | agent | `agents/gsd-codebase-mapper.md` | Maps an existing codebase's architecture/conventions |
| gsd-debug-session-manager | agent | `agents/gsd-debug-session-manager.md` | Manages a structured debug session |
| gsd-debugger | agent | `agents/gsd-debugger.md` | Diagnoses and fixes bugs |
| gsd-doc-classifier | agent | `agents/gsd-doc-classifier.md` | Classifies ingested documents |
| gsd-doc-synthesizer | agent | `agents/gsd-doc-synthesizer.md` | Synthesizes multiple docs into one artifact |
| gsd-doc-verifier | agent | `agents/gsd-doc-verifier.md` | Verifies doc accuracy against source |
| gsd-doc-writer | agent | `agents/gsd-doc-writer.md` | Writes documentation |
| gsd-domain-researcher | agent | `agents/gsd-domain-researcher.md` | Domain-specific research |
| gsd-eval-auditor | agent | `agents/gsd-eval-auditor.md` | Audits eval/benchmark results |
| gsd-eval-planner | agent | `agents/gsd-eval-planner.md` | Plans an eval suite |
| gsd-executor | agent | `agents/gsd-executor.md` | Executes a single PLAN.md's tasks |
| gsd-framework-selector | agent | `agents/gsd-framework-selector.md` | Chooses tech-stack/framework |
| gsd-integration-checker | agent | `agents/gsd-integration-checker.md` | Checks integration points |
| gsd-intel-updater | agent | `agents/gsd-intel-updater.md` | Updates the project's competitive/market intel |
| gsd-nyquist-auditor | agent | `agents/gsd-nyquist-auditor.md` | Signal/sampling-rate style completeness audit |
| gsd-pattern-mapper | agent | `agents/gsd-pattern-mapper.md` | Maps recurring code patterns |
| gsd-phase-researcher | agent | `agents/gsd-phase-researcher.md` | Researches a specific roadmap phase |
| gsd-plan-checker | agent | `agents/gsd-plan-checker.md` | Verifies a PLAN.md before execution |
| gsd-planner | agent | `agents/gsd-planner.md` | Creates executable phase plans with task breakdown and dependency analysis |
| gsd-project-researcher | agent | `agents/gsd-project-researcher.md` | Whole-project research |
| gsd-research-synthesizer | agent | `agents/gsd-research-synthesizer.md` | Synthesizes research findings |
| gsd-roadmapper | agent | `agents/gsd-roadmapper.md` | Builds the project roadmap |
| gsd-security-auditor | agent | `agents/gsd-security-auditor.md` | Security audit pass |
| gsd-ui-auditor | agent | `agents/gsd-ui-auditor.md` | Audits UI implementation |
| gsd-ui-checker | agent | `agents/gsd-ui-checker.md` | Checks UI against spec |
| gsd-ui-researcher | agent | `agents/gsd-ui-researcher.md` | UI/UX research |
| gsd-user-profiler | agent | `agents/gsd-user-profiler.md` | Builds a user preference profile |
| gsd-verifier | agent | `agents/gsd-verifier.md` | Verifies completed work meets UAT |
| gsd-mempalace-curator | agent | `agents/gsd-mempalace-curator.md` | Curates the mempalace memory store (successor repo only — 34th agent, not present in archived repo's 33) |

**Commands** (`commands/gsd/*.md`, both repos — 65 in archived, 69 in successor; only a representative sample was individually enumerated by the source agent, not the full list):

| name | kind | path | purpose |
|---|---|---|---|
| gsd:plan-phase | command | `commands/gsd/plan-phase.md` | Slash command wrapping the plan-phase workflow (both repos) |
| gsd:execute-phase | command | `commands/gsd/execute-phase.md` | Slash command wrapping the execute-phase workflow |
| gsd:discuss-phase | command | `commands/gsd/discuss-phase.md` | Slash command wrapping the discuss-phase workflow |
| gsd:new-project | command | `commands/gsd/new-project.md` | Scaffold a new GSD project |
| gsd:ship | command | `commands/gsd/ship.md` | Create PR and ship a phase |
| gsd:autonomous | command | `commands/gsd/autonomous.md` | Unattended full-loop execution |
| gsd:code-review | command | `commands/gsd/code-review.md` | Cross-tool code review |
| gsd:add-tests | command | `commands/gsd/add-tests.md` | Generate tests for a completed phase (65 archived / 69 successor total — full list not individually enumerated) |

**Capabilities** (`capabilities/<name>/capability.json`, successor repo ONLY — 55 total; NOT skills, a separate plugin/adapter layer — only a sample was individually enumerated):

| name | kind | path | purpose |
|---|---|---|---|
| tdd | other | `capabilities/tdd/capability.json` | Feature capability: injects TDD heuristics into planner, gates RED/GREEN on `type:tdd` plans |
| claude | other | `capabilities/claude/capability.json` | Runtime capability manifest for Claude Code: declares `artifactLayout` (commands-to-skills conversion for global installs), hook surface, reviewer-CLI integration |
| cursor | other | `capabilities/cursor/capability.json` | Runtime adapter manifest for Cursor |
| windsurf | other | `capabilities/windsurf/capability.json` | Runtime adapter manifest for Windsurf |
| codex | other | `capabilities/codex/capability.json` | Runtime adapter manifest for OpenAI Codex CLI |
| security | other | `capabilities/security/capability.json` | Feature capability for the security-audit workflow injection |
| mempalace | other | `capabilities/mempalace/capability.json` | Feature capability for the mempalace long-term memory system (55 `capability.json` files total, not all individually enumerated) |

**Workflows, templates, hooks, CLI:**

| name | kind | path | purpose |
|---|---|---|---|
| execute-phase workflow | workflow | `gsd-core/workflows/execute-phase/` | Step-by-step procedure the gsd-execute-phase skill/command imports via `@`-reference (successor; archived equivalent at `get-shit-done/workflows/execute-phase/`) |
| discuss-phase workflow | workflow | `gsd-core/workflows/discuss-phase/` | Step-by-step discuss-phase procedure, with `modes/` and `templates/` subdirs |
| discuss-phase-assumptions workflow | workflow | `gsd-core/workflows/discuss-phase-assumptions/` | Assumption-surfacing variant workflow (successor only) |
| new-project workflow | workflow | `get-shit-done/workflows/new-project.md` | Project scaffolding procedure (archived-repo path) |
| STATE.md template | template | `get-shit-done/templates/state.md` | Skeleton for the project's STATE.md tracking file |
| ROADMAP.md template | template | `get-shit-done/templates/roadmap.md` | Skeleton for the milestone roadmap document |
| UAT.md template | template | `get-shit-done/templates/UAT.md` | Skeleton for user-acceptance-test criteria |
| gsd-workflow-guard | hook | `hooks/gsd-workflow-guard.js` | Claude Code hook enforcing workflow-gate compliance |
| gsd-read-guard | hook | `hooks/gsd-read-guard.js` | Claude Code hook guarding required-read compliance before actions |
| gsd-context-monitor | hook | `hooks/gsd-context-monitor.js` | Claude Code hook monitoring context-window utilization |
| gsd-statusline | hook | `hooks/gsd-statusline.js` | Claude Code statusline integration showing GSD state |
| gsd-core npm CLI | other (CLI) | `bin/` (archived) and `bin/` + `gsd-core/bin/` (successor) | Node.js installer/CLI (`npx @opengsd/gsd-core`) that scaffolds `.planning/`, installs agents/commands/skills into `~/.claude/`, and runs the workflow engine — the actual distribution mechanism for everything else in this catalog |

**Full-scale counts (not all individually enumerated above):** ARCHIVED ships 33 `agents/*.md`, 65 `commands/gsd/*.md`, 0 `skills/*/SKILL.md`, ~30-40 `get-shit-done/workflows/*.md`, ~44 `get-shit-done/templates/*.md`, ~15 `hooks/*.{js,sh}`, plus a TypeScript `sdk/` (query engine, golden fixtures, config). SUCCESSOR ships 34 `agents/*.md`, ~69 `commands/gsd/*.md`, 70 `skills/gsd-*/SKILL.md`, 55 `capabilities/*/capability.json`, 17 top-level `gsd-core/workflows/NAME/` directories, plus new infra: `eslint-rules/`, `examples/`, `vscode/` (VS Code extension), `.claude-plugin/` (marketplace manifest), `.kilo/plugins`, `.opencode/plugins`.

## Format notes

Two distinct source-authoring formats coexist, confirmed by reading actual files, plus a third generated projection:

1. **AGENT files** (`agents/*.md`, both repos, format unchanged across the fork): YAML frontmatter `name` (`gsd-*`), `description`, `tools` (comma-separated string, not a YAML list), `color`, optional commented-out `hooks:` block. Body wrapped in a single `<role>` tag, pulling in shared context via `@~/.claude/get-shit-done/references/mandatory-initial-read.md` (archived) or `@~/.claude/gsd-core/references/...` (successor). These are Task-tool subagent definitions, not skills.

2. **COMMAND files** (`commands/gsd/*.md`, both repos): frontmatter `name: gsd:<name>` (colon, slash-style), `description`, `argument-hint`, `allowed-tools` (YAML list), `requires: [...]` (dependency list on other commands), sometimes `argument-instructions`. Body uses custom XML-ish tags: `<objective>`, `<execution_context>` (imports the real step-by-step logic via `@~/.claude/get-shit-done/workflows/<name>.md` or `@~/.claude/gsd-core/workflows/<name>.md`), optional `<runtime_note>` (Copilot/VS Code equivalence notes), `<context>`, `<process>`. The command file itself is a thin orchestrator shell — actual procedural logic lives in the separate `workflows/` tree.

3. **SKILL files** (`skills/gsd-*/SKILL.md`, successor repo ONLY): near-identical shape to commands minus the colon — frontmatter `name: gsd-<name>` (hyphen), `description`, `argument-hint`, `allowed-tools`, optional `effort: high` field. Same `<objective>/<execution_context>/<context>/<process>` body tags, same `@~/.claude/gsd-core/workflows/*.md` import pattern. One skill dir per command, 1:1 name-mapped (`commands/gsd/add-tests.md` <-> `skills/gsd-add-tests/SKILL.md`).

**Critical evidence on the command-to-skill relationship:** `capabilities/claude/capability.json` (successor repo) declares an explicit `artifactLayout`: global installs go to `skills/` (`destSubpath: "skills"`, prefix `"gsd-"`, converter `convertClaudeCommandToClaudeSkill`) while local installs go to `commands/` and `agents/` unconverted. This proves commands are the authored source of truth and skills are a generated/parallel Claude-Code-native projection of the same content, packaged for the global skill-discovery path. A code comment found in the ARCHIVED repo's installer (`get-shit-done/bin/lib/profile-output.cjs`, near line 801) references issue #2973: "v1.39.0's skills-only migration removed the legacy `commands/gsd` subdirectory in favor of `skills/<skill>/SKILL.md`" for the INSTALLED artifact target (what lands in the end user's `~/.claude/` directory) — meaning even the archived repo's installer was already writing GSD's commands into the user's global skills/ folder before the source repo itself ever checked in a `skills/` tree. The successor repo made that `skills/` format a first-class checked-in source alongside `commands/`.

4. **capabilities/<name>/capability.json** (successor repo only, 55 total) — NOT skills. JSON manifests with `id`, `role` (`"feature"` | `"runtime"`), `version`, `title`, `description`, `tier` (core|full), `requires`, `engines.gsd` (semver range). `"feature"` role entries (tdd, security, audit, ui, code-review, drift, gap-analysis, schema-gate, nyquist, pattern-mapper, research, mempalace, external-job, assumption-delta, ai-integration, claude-orchestration, profile-pipeline, intel, hermes, graphify, broken-windows) carry `config{}` (toggleable settings), `contributions[]` (named injection points like `plan:pre`, `execute-wave:pre` that splice a fragment .md file or inline snippet into a workflow), and `gates[]` (blocking/non-blocking post-hooks). `"runtime"` role entries (claude, cursor, windsurf, codex, gemini, copilot, cline, ollama, kilo, kimi, kimi-code, llama-cpp, lm-studio, opencode, pi, qwen, trae, vscode, zcode, antigravity, augment, codebuddy, coderabbit) describe how GSD adapts itself to each host AI-coding tool: config-home location, artifact layout mapping, hook surface, and (for several) a reviewer block that shells out to that tool's own CLI as a second-opinion code reviewer.

5. **workflows/*.md** (both repos, under `get-shit-done/workflows/` [archived, ~30+ files] or `gsd-core/workflows/<name>/` [successor, 17 top-level workflow dirs, several with a `steps/` subdirectory]) — the actual step-by-step procedure files that command/skill frontmatter `execution_context` blocks `@`-import. This is where the real logic lives, separate from both the command and skill wrapper layers.

6. **templates/*.md** (both repos, ~30-45 files: STATE.md/ROADMAP.md/SUMMARY.md/UAT.md/etc document skeletons the workflows fill in) and **hooks/*.js|*.sh** (both repos, ~14-15 files: Claude Code PreToolUse/PostToolUse/statusline hooks for update-checking, prompt-injection scanning, workflow-guarding, commit validation).

Naming convention is uniform across every kind: `gsd-verb-or-noun` for agents/skills, `gsd:verb-or-noun` for command frontmatter `name` (file itself is hyphenated), all lower-kebab-case, no numbering.

## Quality read

This is a large, seriously-engineered, actively-maintained corpus — not a thin stub set. Evidence: 65-69 fully-written command files (each with real multi-paragraph objectives, argument parsing, and gate logic, not placeholders), 33-34 agent role definitions with distinct responsibilities, a matching `workflows/` tree of ~30-40 step-by-step procedure files that the commands actually import via `@`-references (verified by reading two full files), a TypeScript SDK with golden-fixture tests, ESLint governance rules, and (in the successor) a 55-entry capability/plugin system that adapts the same content to 20+ different AI coding tools. The successor repo (`open-gsd/gsd-core`) pushed a commit the day before this harvest (2026-08-08) and carries 145 open issues plus an active Discord — this is a live, maintained project, not an abandoned fork. The archived repo (`gsd-build/get-shit-done`) was cleanly retired with an explicit README redirect, not silently killed — continuity of ownership/intent is credible.

**Caveat specific to a "skills" catalog:** the ARCHIVED repo (the one matching the 64,734-star / MIT / 2025-12-14 / archived-2026-06-26 fingerprint given in the harvest brief) does **NOT** ship a checked-in `skills/` corpus at all — it ships `agents/` + `commands/gsd/` + a `get-shit-done/` engine tree, and only converts commands into Claude-Code skills at install time (confirmed via a code comment and the `docs/skills/discovery-contract.md` spec, which describes SCANNING for skills, not authoring them). Only the successor, `open-gsd/gsd-core`, checks in an actual `skills/*/SKILL.md` tree (70 files) as first-class source. Anyone citing "GSD's skills" from memory without specifying which repo/date they mean would likely be wrong about the archived repo and right about the successor — exactly the kind of ambiguity the harvest brief's hard-evidence rule was designed to catch.

## Unresolved / caveats

- Full lists of all 65 (archived) / 69 (successor) commands and all 55 capability manifests were not individually enumerated by name in the recovered payload — only path-prefix counts from the recursive tree listing plus a representative sample of each were captured. The skills list (70 items) and agents list (33/34 items) ARE believed complete — they match the source agent's own stated total counts.
- `resolution_note` in the original payload states repo IDs, exact star/fork/subscriber counts, and push timestamps for both repos, cross-checked via `gh api repos/OWNER/REPO`, not memory or search-engine summaries.
- Enumeration method (as stated by the source agent): GitHub REST API via `gh api`, zero reliance on memory or search-engine summaries. Steps: (1) `gh api repos/OWNER/REPO` for both repos to confirm identity/star-count/license/archived-status/dates. (2) `gh api repos/OWNER/REPO/git/trees/BRANCH?recursive=1` (`main` for archived, `next` for successor) — full recursive file/directory tree of both repos in one call each; this produced every path in the items list and every directory-count claim. (3) `gh api repos/OWNER/REPO/contents/PATH` piped through base64 decode to read full raw file contents for: `docs/skills/discovery-contract.md` (both repos), two sample `skills/*/SKILL.md` files, one sample `commands/gsd/*.md` file, one sample `agents/*.md` file, two sample `capabilities/*/capability.json` files, both repos' `README.md`, and a targeted grep of `get-shit-done/bin/lib/profile-output.cjs` for the string "skill" to trace the command-to-skill conversion logic. Every count reported (33/34 agents, 65/69 commands, 70 skills, 55 capabilities) is a literal count of the recursive tree-listing output filtered by path prefix and file type, not an estimate.
