# Agent OS (buildermethods/agent-os)

**resolved:** yes — unambiguous match. `buildermethods/agent-os`, description "Agent OS is a system for injecting your codebase standards and writing better specs for spec-driven development," homepage buildermethods.com/agent-os, org "buildermethods."
**repo:** https://github.com/buildermethods/agent-os
**stats:** 5,234 stars · 822 forks · 109 watchers · MIT license · not archived · created 2025-07-16 · last push 2026-05-05 (~3 months before harvest, actively maintained not abandoned) · repo size 424KB · open issues: 2 (discussions enabled) · language: Shell

**PRIOR FINDING VERIFIED TRUE:** an earlier research run had concluded this repo "ships nothing — deliberately retired its agent roster" per a v3.0 changelog. This harvester independently confirmed that verdict via primary evidence: `CHANGELOG.md`'s `[3.0]` entry (dated 2026-01-20) states verbatim *"Implementation/orchestration phases retired—frontier models handle this well on their own now."* A full recursive tree listing of current `main` (`git/trees/main?recursive=1`, ~19 total paths — exhaustive, not sampled) contains **zero** `agents/`, `subagents/`, or `SKILL.md` paths anywhere in the repo.

**ships:** commands, templates, cli (install/sync scripts) — explicitly **NOT** agents, skills, or an orchestration layer. See Quality read for what it ships instead and why.

> Recovery note: this transcript is the `Agent OS` harvester from workflow `wf_e3e37f38-729`. It completed real research (GitHub API metadata + a full recursive repo tree + full-content reads of README, CHANGELOG, config.yml, all 5 command files, and the default profile's tech-stack template) but never returned successfully — 5 consecutive `StructuredOutput` attempts were all rejected by schema validation, never by payload size: "must have required property 'enumeration_method'" (attempt 1), "must NOT have additional properties" (attempts 2–3, after adding `enumeration_method` but keeping extra descriptive fields like `repo_url`/`stats`/`resolution_note`/`unresolved`), then missing-required-property errors again on later stripped-down attempts (4–5) that dropped `items` detail trying to fit the schema. The item content itself was stable and consistent across the first two full attempts (identical 10-item list, identical paths) — only the top-level JSON shape kept failing. This file is reconstructed from the fullest attempt (retry 2, which added a valid `enumeration_method` field alongside the full descriptive fields from attempt 1).

## Items

| name | kind | path | purpose |
|---|---|---|---|
| discover-standards | command | `commands/agent-os/discover-standards.md` | Extract tribal knowledge from your codebase into concise, documented standards (interactive, uses AskUserQuestion) |
| index-standards | command | `commands/agent-os/index-standards.md` | Rebuild and maintain the standards index file (`index.yml`) so `/inject-standards` can suggest relevant standards without reading every file |
| inject-standards | command | `commands/agent-os/inject-standards.md` | Inject relevant standards into the current context (conversation, plan, or Claude Skill) — auto-suggest mode or explicit path arguments |
| plan-product | command | `commands/agent-os/plan-product.md` | Establish foundational product documentation (mission, roadmap, tech-stack) via interactive conversation |
| shape-spec | command | `commands/agent-os/shape-spec.md` | Gather context and structure planning for significant work; must be run in the host tool's plan mode; saves the resulting plan to the spec folder |
| tech-stack (default global template) | template | `profiles/default/global/tech-stack.md` | Seed template copied into a new project's `agent-os/product/tech-stack.md` during install; example stack doc (frontend/backend/database/other headings) |
| config.yml | other | `config.yml` | Root config: sets `version` (3.0), `default_profile`, and optional profile inheritance map (`profiles: <name>: inherits_from: <parent>`) |
| project-install.sh | other | `scripts/project-install.sh` | Installer script that materializes a profile's commands/templates into a target project's `agent-os/` folder |
| sync-to-profile.sh | other | `scripts/sync-to-profile.sh` | Syncs a project's edited standards back to the base profile |
| common-functions.sh | other | `scripts/common-functions.sh` | Shared bash functions used by `project-install.sh` and `sync-to-profile.sh` |

Note: an `index.yml` file (built at install time by `/index-standards`, not present in the template repo itself) maps each user-authored standards file to a short description so `/inject-standards` can auto-suggest relevant ones without reading every file — this is Agent OS's closest analog to a skill-discovery manifest, but it indexes a *consuming project's* standards docs, not a shipped skill corpus. Not counted as a repo item above since it doesn't exist in the source repo.

## Format notes

Two distinct formats, both plain markdown, **neither uses YAML frontmatter**:

1. **Commands** (`commands/agent-os/*.md`) — flat directory, 5 files, installed into a host tool's command namespace (Claude Code `/agent-os:*` etc. via `project-install.sh`). Structure: H1 title matching filename ("# Shape Spec"), one-line purpose statement, then H2 sections ("## Important Guidelines", "## Prerequisites", "## Process", "## Usage Modes") and H3 numbered steps ("### Step 1: ..."). Heavy use of prose directives like "Always use AskUserQuestion tool" and literal example blocks the agent should echo to the user. No frontmatter (no `name:`/`description:` header) — the H1 + filename ARE the identity.

2. **Templates/standards** (`profiles/<profile-name>/global/*.md`, e.g. `profiles/default/global/tech-stack.md`) — the seed content copied into a new project's own `agent-os/` folder (mission.md, roadmap.md, tech-stack.md, and user-authored standards/*.md). Plain markdown, H1 + H2 category sections, no frontmatter. A `profiles/<name>/` directory can inherit from another profile via `config.yml` (`profiles: <name>: inherits_from: default`), not via per-file frontmatter — inheritance is centralized in one `config.yml` (itself a v3.0 simplification; v2.x used separate inheritance files).

Supporting: `config.yml` (repo root) sets `version:` and `default_profile:` and optionally the inheritance map. `scripts/*.sh` (`common-functions.sh`, `project-install.sh`, `sync-to-profile.sh`) are the installer/sync CLI — they materialize profiles into a target repo's `agent-os/` folder and later sync edited standards back to the base profile.

**Enumeration method:** GitHub API: (1) `GET repos/buildermethods/agent-os` for metadata/stats; (2) `GET git/trees/main?recursive=1` for a complete recursive file listing of the entire repository (only ~19 paths total, so this is exhaustive, not sampled); (3) `GET contents/<path>` with base64 decode for `README.md`, `CHANGELOG.md`, `config.yml`, all 5 files under `commands/agent-os/`, and `profiles/default/global/tech-stack.md` — read in full, not summarized from search results. No blog posts or third-party summaries used.

## Quality read

Not dead, not thin — but genuinely minimalist **by design** as of v3.0, and the prior finding's "ships nothing" characterization for an agent-roster is correct.

Signals of health: 5,234 stars, 822 forks, MIT license, active maintainer (Brian Casel / Builder Methods), CHANGELOG shows post-3.0 "Unreleased" bugfixes (install-script portability fixes for `set -e`/`((var++))` and GNU-only `tac`), last push 2026-05-05 — not abandoned.

Signals of narrow scope: total repo size is 424KB across ~15 substantive files; root ships exactly 5 commands, 1 seed template, 3 shell scripts, 1 config file.

The project's own changelog documents a **progressive stripping-down** across three majors — v2.0 had a "Roles" system (`implementers.yml`/`verifiers.yml`) that got retired in 2.1 as "convoluted... added no real benefit over simply using available tooling," and specialized verifier subagents (spec-verifier, backend-verifier, frontend-verifier) were cut in 2.1 as "bloat," then the entire implementation/orchestration phase was retired in 3.0. So this isn't an abandoned corpus — it's a maintainer repeatedly and explicitly choosing to ship LESS as host tools (Claude Code plan mode, extended thinking) absorbed those responsibilities.

For a clean-sheet redesign, the useful signal isn't a skill catalog to harvest — it's the opposite lesson: a well-regarded, still-growing project concluded that a bespoke agent roster and orchestration layer becomes redundant maintenance burden once the underlying model/tool improves, and re-platformed itself onto "inject good standards + let the frontier model plan" instead.

Also worth noting: v2.1 added an opt-in config flag (`standards_as_claude_code_skills: true`) that converts a **project's own** standards docs into Claude Code Skills at install time — Agent OS doesn't ship skills, but it ships tooling to turn a user's docs into skills, which is a different, adjacent idea worth considering for the redesign (skills-as-a-compile-target rather than skills-as-a-shipped-library).

## Unresolved / caveats

None material. The source, repo identity, and the specific prior-finding claim under test were all fully resolved with primary-source evidence (GitHub API tree listing + full CHANGELOG/README/config/command-file reads, not inference from reputation or third-party summaries).
