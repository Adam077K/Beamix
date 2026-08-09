# BMAD-METHOD

resolved: yes · https://github.com/bmad-code-org/BMAD-METHOD
stats: 51,654 stars · 5,913 forks · 129 open issues · MIT license (LICENSE file confirms MIT; GitHub API shows "Other" only because of a separate TRADEMARK.md carve-out on the "BMad" name/mark) · not archived · last push 2026-08-08 · latest tagged release v6.10.0 (2026-07-03) with substantial unreleased work on top

resolution_note: Unambiguous. Confirmed via `gh api repos/bmad-code-org/BMAD-METHOD` (51,654 stars, MIT license, pushed 2026-08-08), matching the URL and CLI details given in the task brief (`tools/installer/bmad-cli.js` with install/status/uninstall verbs, `files-manifest.csv` with sha256 tracking — both verified present at the exact paths described).

enumeration_method: GitHub API only (`gh api` / `gh search code`) — no memory, no inference.
1. `gh api repos/bmad-code-org/BMAD-METHOD` for repo metadata/confirmation.
2. `gh api git/trees/main?recursive=1` (861 blobs, not truncated) saved to a scratchpad file and grep-filtered by prefix to enumerate `src/core-skills` (78 files), `src/bmm-skills` (214 files), `web-bundles` (17 files), `tools/installer` (full subtree).
3. `gh api contents/<path> --jq .content | base64 -d` to read actual file bodies for `bmad-modules.yaml`, `.claude-plugin/marketplace.json` (parsed with python3 json), `module.yaml` x2, a sample `SKILL.md` and `customize.toml`, `web-bundles/README.md`, `README.md`, `CHANGELOG.md`, `LICENSE`.
4. `gh search code` to locate `files-manifest.csv` references across `tools/installer/core/*.js`.

Every path below was seen directly in the recursive tree listing or the file contents pulled — none inferred.

ships: skills, agents, commands, cli, templates

## Items

| name | kind | path | purpose |
|---|---|---|---|
| bmad-advanced-elicitation | skill | src/core-skills/bmad-advanced-elicitation/SKILL.md | Structured technique-driven elicitation/deepening pass on a draft artifact |
| bmad-brainstorming | skill | src/core-skills/bmad-brainstorming/SKILL.md | Facilitated brainstorming with a curated 60-technique library, visual picker |
| bmad-customize | skill | src/core-skills/bmad-customize/SKILL.md | Lists/edits customizable skills and their customize.toml overrides |
| bmad-deep-recon | skill | src/core-skills/bmad-deep-recon/SKILL.md | Decision-grade research harness: 6 research types, claim verification, refresh cycle |
| bmad-forge-idea | skill | src/core-skills/bmad-forge-idea/SKILL.md | Persona-driven interrogation to pressure-test an idea until it hardens or dies cheaply |
| bmad-help | skill | src/core-skills/bmad-help/SKILL.md | Guidance catalog / what-comes-next router across installed BMad skills |
| bmad-party-mode | skill | src/core-skills/bmad-party-mode/SKILL.md | Multi-perspective roundtable discussion between agents/custom personas |
| bmad-review | skill | src/core-skills/bmad-review/SKILL.md | Multi-lens editorial/adversarial review (prose, structure, edge-case, verification-gap) |
| bmad-editorial-review-prose (v6-shim) | skill | src/core-skills/v6-shims/bmad-editorial-review-prose/SKILL.md | Deprecation forward to bmad-review |
| bmad-editorial-review-structure (v6-shim) | skill | src/core-skills/v6-shims/bmad-editorial-review-structure/SKILL.md | Deprecation forward to bmad-review |
| bmad-editorial-review (v6-shim) | skill | src/core-skills/v6-shims/bmad-editorial-review/SKILL.md | Deprecation forward to bmad-review |
| bmad-review-adversarial-general (v6-shim) | skill | src/core-skills/v6-shims/bmad-review-adversarial-general/SKILL.md | Deprecation forward to bmad-review |
| bmad-review-edge-case-hunter (v6-shim) | skill | src/core-skills/v6-shims/bmad-review-edge-case-hunter/SKILL.md | Deprecation forward to bmad-review |
| bmad-review-verification-gap (v6-shim) | skill | src/core-skills/v6-shims/bmad-review-verification-gap/SKILL.md | Deprecation forward to bmad-review |
| core module manifest | other | src/core-skills/module.yaml | Module metadata + installer prompts (user_name, project_name, communication_language, output_folder) |
| core module help index | other | src/core-skills/module-help.csv | Help-catalog rows consumed by bmad-help |
| bmad-agent-analyst (Mary) | agent | src/bmm-skills/agents/bmad-agent-analyst/SKILL.md | Business Analyst persona-skill, evidence-grounded discovery |
| bmad-agent-architect (Winston) | agent | src/bmm-skills/agents/bmad-agent-architect/SKILL.md | System Architect persona-skill |
| bmad-agent-dev (Amelia) | agent | src/bmm-skills/agents/bmad-agent-dev/SKILL.md | Senior Software Engineer persona-skill, TDD-disciplined story execution |
| bmad-agent-pm (John) | agent | src/bmm-skills/agents/bmad-agent-pm/SKILL.md | Product Manager persona-skill, JTBD-driven |
| bmad-agent-ux-designer (Sally) | agent | src/bmm-skills/agents/bmad-agent-ux-designer/SKILL.md | UX Designer persona-skill |
| bmad-architecture | skill | src/bmm-skills/plan/bmad-architecture/SKILL.md | Produce system architecture artifact |
| bmad-create-epics-and-stories | skill | src/bmm-skills/plan/bmad-create-epics-and-stories/SKILL.md | Break plan into epics/stories |
| bmad-document-project | skill | src/bmm-skills/plan/bmad-document-project/SKILL.md | Reverse-document an existing/inherited codebase |
| bmad-generate-project-context | skill | src/bmm-skills/plan/bmad-generate-project-context/SKILL.md | Generate durable project-context artifact carried across sessions |
| bmad-prd | skill | src/bmm-skills/plan/bmad-prd/SKILL.md | Product Requirements Document authoring |
| bmad-prfaq | skill | src/bmm-skills/plan/bmad-prfaq/SKILL.md | Working-Backwards PRFAQ (Amazon-style) drafting |
| bmad-product-brief | skill | src/bmm-skills/plan/bmad-product-brief/SKILL.md | Guided product-brief creation/update/validate |
| bmad-project-context | skill | src/bmm-skills/plan/bmad-project-context/SKILL.md | Project-context maintenance (not in the marketplace bundle list, install-only) |
| bmad-spec | skill | src/bmm-skills/plan/bmad-spec/SKILL.md | Feature/change specification authoring |
| bmad-sprint-planning | skill | src/bmm-skills/plan/bmad-sprint-planning/SKILL.md | Sprint planning + implementation-readiness gate + sprint-status view (absorbed bmad-check-implementation-readiness and bmad-sprint-status per Unreleased changelog) |
| bmad-ux | skill | src/bmm-skills/plan/bmad-ux/SKILL.md | UX design/spec skill |
| bmad-build | skill | src/bmm-skills/ship/bmad-build/SKILL.md | Implementation/build execution against a story |
| bmad-build-auto | skill | src/bmm-skills/ship/bmad-build-auto/SKILL.md | Unattended/autonomous build variant |
| bmad-checkpoint-preview | skill | src/bmm-skills/ship/bmad-checkpoint-preview/SKILL.md | Preview a checkpoint before proceeding |
| bmad-code-review | skill | src/bmm-skills/ship/bmad-code-review/SKILL.md | Code review pass with severity triage |
| bmad-correct-course | skill | src/bmm-skills/ship/bmad-correct-course/SKILL.md | Mid-course correction when implementation drifts from plan |
| bmad-qa-generate-e2e-tests | skill | src/bmm-skills/ship/bmad-qa-generate-e2e-tests/SKILL.md | Generate end-to-end test coverage |
| bmad-retrospective | skill | src/bmm-skills/ship/bmad-retrospective/SKILL.md | Post-implementation retrospective |
| bmad-create-architecture (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-create-architecture/SKILL.md | Deprecation forward to bmad-architecture |
| bmad-create-prd (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-create-prd/SKILL.md | Deprecation forward to bmad-prd |
| bmad-create-story (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-create-story/SKILL.md | Deprecation forward to bmad-create-epics-and-stories |
| bmad-dev-auto (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-dev-auto/SKILL.md | Single-iteration unattended dev worker (bmad-loop precursor entry point) |
| bmad-dev-story (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-dev-story/SKILL.md | Deprecation forward to bmad-build |
| bmad-domain-research (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-domain-research/SKILL.md | Deprecation forward to bmad-deep-recon |
| bmad-edit-prd (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-edit-prd/SKILL.md | Deprecation forward to bmad-prd |
| bmad-market-research (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-market-research/SKILL.md | Deprecation forward to bmad-deep-recon |
| bmad-quick-dev (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-quick-dev/SKILL.md | Deprecation forward |
| bmad-sprint-status (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-sprint-status/SKILL.md | Deprecation forward to bmad-sprint-planning status view |
| bmad-technical-research (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-technical-research/SKILL.md | Deprecation forward to bmad-deep-recon |
| bmad-validate-prd (v6-shim) | skill | src/bmm-skills/v6-shims/bmad-validate-prd/SKILL.md | Deprecation forward to bmad-prd validate mode |
| bmm module manifest | other | src/bmm-skills/module.yaml | Module metadata, agent roster (code/name/title/icon/team/description), install prompts |
| bmm module help index | other | src/bmm-skills/module-help.csv | Help-catalog rows consumed by bmad-help |
| brainstorming-coach (web bundle) | other | web-bundles/brainstorming-coach/SKILL.md | ChatGPT/Gemini repackaging of bmad-brainstorming; ships with INSTRUCTIONS.md + brain-methods.csv |
| market-and-industry-research (web bundle) | other | web-bundles/market-and-industry-research/SKILL.md | ChatGPT/Gemini repackaging of a deep-recon research flow |
| prd-coach (web bundle) | other | web-bundles/prd-coach/SKILL.md | ChatGPT/Gemini repackaging of bmad-prd; ships prd-template.md + prd-validation-checklist.md |
| prfaq-coach (web bundle) | other | web-bundles/prfaq-coach/SKILL.md | ChatGPT/Gemini repackaging of bmad-prfaq |
| product-brief-coach (web bundle) | other | web-bundles/product-brief-coach/SKILL.md | ChatGPT/Gemini repackaging of bmad-product-brief |
| ux-coach (web bundle) | other | web-bundles/ux-coach/SKILL.md | ChatGPT/Gemini repackaging of bmad-ux; ships ux-validation.md |
| marketplace.json | other | .claude-plugin/marketplace.json | Registers 6 Claude-Code plugins (bmad-brainstorming, bmad-party-mode, bmad-forge-idea, bmad-deep-recon, bmad-analysis, bmad-method-lifecycle) each pointing at a skills[] array of the paths above |
| bmad-modules.yaml | other | bmad-modules.yaml | Registry of 7 separate sibling-repo modules the installer can add (bmad-builder/bmb, creative-intelligence-suite/cis, test-architecture-enterprise/tea, bmad-loop, game-dev-studio/gds, automator [deprecated], wds-expansion [deprecated]) — NOT shipped in this repo |
| bmad-cli.js | other | tools/installer/bmad-cli.js | Commander-based CLI entrypoint (npx bmad-method install/status/uninstall) |
| install command | other | tools/installer/commands/install.js | Installs selected module(s) into target project's _bmad/ |
| status command | other | tools/installer/commands/status.js | Reports install status vs manifest |
| uninstall command | other | tools/installer/commands/uninstall.js | Removes installed module files |
| manifest-generator.js | other | tools/installer/core/manifest-generator.js | Writes {configDir}/files-manifest.csv with per-file sha256 hashes |
| manifest.js | other | tools/installer/core/manifest.js | Manifest read/write logic used by install/update/uninstall |
| installer.js | other | tools/installer/core/installer.js | Core install/update orchestration; diffs current files vs files-manifest.csv to detect user edits before overwrite |
| resolve_customization.py | other | src/scripts/resolve_customization.py | Merges customize.toml layers (skill default -> team -> user) per skill activation |
| skill-validator.md | other | tools/skill-validator.md | Doc describing the skill-authoring/validation contract |
| validate-skills.js | other | tools/validate-skills.js | CI validator enforcing SKILL.md conventions (trigger present, etc.) across the corpus |

## Format notes

Two parallel conventions coexist, both anchored on Claude-Code-native SKILL.md:

**1. INSTALLED SKILL** (`src/{core-skills,bmm-skills}/{category}/{skill-name}/SKILL.md`) — the primary format.
- Frontmatter is minimal: only `name:` and `description:` (description doubles as the model-facing trigger, e.g. "Use when the user asks to talk to Amelia or requests the developer agent.").
- Directory layout per skill: `SKILL.md` (required) + optional `customize.toml` (persona/config defaults, TOML, header comment "DO NOT EDIT -- overwritten on every update") + optional `assets/` (csv/html/json data), `references/` (progressive-disclosure markdown loaded on demand), `scripts/` (Python, each with `scripts/tests/test_*.py` sitting alongside it), `types/` (research-type variants).
- Skills are grouped two levels deep under a module: `src/{module}/{category}/{skill-name}/`. `bmm-skills` uses verb-named categories (`agents/`, `plan/`, `ship/`) that were renamed from numbered phase folders (`1-analysis`→`4-implementation`) in the Unreleased changelog entry — evidence the format itself is actively iterated.
- Each module carries one `module.yaml` at its root (code, name, description, default_selected, an `agents:` roster array with code/name/title/icon/team/description, and installer prompt/config-variable definitions like user_name, output_folder) plus a `module-help.csv`.
- Deprecated/renamed skills aren't deleted — they become forwarding "v6-shims" (`src/{module}/v6-shims/{old-name}/SKILL.md`) that redirect to the new skill and print a deprecation notice, with a root `removals.txt` listing skills to be purged from existing installs. This is a deliberate migration-safety convention worth copying.
- `customize.toml` uses a documented merge algorithm across three layers: `{skill-root}/customize.toml` (defaults) → `_bmad/custom/{skill-name}.toml` (team) → `_bmad/custom/{skill-name}.user.toml` (personal), with scalars=override, arrays=append, arrays-of-tables keyed by code/id=replace-matching+append-new. Resolved by `src/scripts/resolve_customization.py`, invoked from inside each SKILL.md's activation steps.
- A path-variable convention is standardized in every SKILL.md's "Conventions" section: `{skill-root}`, `{project-root}`, `{skill-name}` placeholders.

**2. WEB BUNDLE** (`web-bundles/{bundle-name}/SKILL.md` + `INSTRUCTIONS.md` + data files) — a repackaging of a subset of the installed skills for Gemini Gems / ChatGPT Custom GPTs, generated by a separate sibling tool (`bmad-os-skill-to-bundle`, in another repo) and distributed as versioned ZIPs via GitHub Releases from https://bmadcode.com/web-bundles/, not from this repo directly (this folder is declared source-only, "end users do not install from here").

**Distribution/packaging layer** (not a skill format, but relevant to a redesign):
- `.claude-plugin/marketplace.json` registers 6 Claude-Code plugins (bmad-brainstorming, bmad-party-mode, bmad-forge-idea, bmad-deep-recon, bmad-analysis, bmad-method-lifecycle), each just a `skills: [...]` array of paths into `src/`. This is the direct-to-Claude-Code install path (separate from the `npx bmad-method` CLI installer path).
- `bmad-modules.yaml` at repo root is a registry of 7 SEPARATE sibling repos (bmad-builder, bmad-module-creative-intelligence-suite, bmad-method-test-architecture-enterprise, bmad-loop, bmad-module-game-dev-studio, bmad-automator [deprecated], bmad-method-wds-expansion [deprecated]) that the installer can pull in — meaning BMAD-METHOD's true footprint spans multiple repos under the bmad-code-org org; this repo ships only the "core" and "bmm" (BMad Method) built-in modules directly.
- The CLI (`tools/installer/bmad-cli.js`, Commander-based; verbs in `tools/installer/commands/`: `install.js`, `status.js`, `uninstall.js`) installs the chosen module(s) into a target project's `_bmad/` directory and writes `tools/installer/core/manifest.js` + `manifest-generator.js` output to `{configDir}/files-manifest.csv` (per-file sha256 tracking, used by `installer.js` to detect user-modified files before an update) — confirms the task brief's premise exactly.

## Quality read

Serious, actively maintained, real-adoption corpus — not a stub set. 51,654 GitHub stars, 5,913 forks, 129 open issues, last push 2026-08-08 (yesterday relative to this session), MIT-licensed (LICENSE confirms MIT despite GitHub API classifying it "Other" due to the separate TRADEMARK.md carve-out on the "BMad" name/mark). The CHANGELOG has a substantial "Unreleased" entry beyond the tagged v6.10.0 (2026-07-03) describing a real architectural rename (numbered phase folders → verb-named agents/plan/ship) shipped with 37 new tests for a deterministic sprint-planning script core — evidence of continuous, disciplined engineering rather than a dumped snapshot. The corpus has real CI hygiene: a dedicated skill-validator contract (`tools/skill-validator.md`) and validator script (`tools/validate-skills.js`) that check SKILL.md conventions, plus test fixtures for the validator itself (`test/fixtures/validate-skills/`, excluded from this catalog as non-shipped fixtures). Deprecations are handled with a genuine migration path (v6-shims forwarding + removals.txt) rather than silent breakage — a pattern worth studying. Overall: this is one of the most format-disciplined open Claude-Code-skill corpora surveyed — the customize.toml three-layer merge convention, the {skill-root}/{project-root} path-variable standard, and the sha256-tracked files-manifest.csv update-safety mechanism are all strong candidates to copy into a clean-sheet redesign.

## Unresolved / caveats

- `src/bmm-skills/plan/bmad-project-context/SKILL.md` — present in the source tree and has a SKILL.md, but not referenced by name in `.claude-plugin/marketplace.json`'s bundle skill lists; unclear if it's install-only, a helper invoked by other skills, or mid-deprecation. Not confirmed either way from the files the original agent read.
