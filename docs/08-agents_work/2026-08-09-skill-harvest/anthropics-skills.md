# anthropics/skills

resolved: yes — https://github.com/anthropics/skills
stats: 167,053 stars · 19,913 forks · not archived · created 2025-09-22 · last pushed 2026-08-07T17:14:15Z (2 days before this check) · default branch `main` · 411 tracked files total, 16 top-level skills · no repo-root LICENSE (per-skill licensing instead: most skills Apache-2.0 "Complete terms in LICENSE.txt"; the 4 Office-format skills "Proprietary. LICENSE.txt has complete terms")

**Resolution note:** Unambiguous — canonical `anthropics/skills` GitHub repo (owner "anthropics", description "Public repository for Agent Skills", 167k stars). No competing candidates; confirmed via `gh api repos/anthropics/skills`.

**Enumeration method:** GitHub API via `gh` CLI, read-only: (1) `gh api repos/anthropics/skills` for repo metadata; (2) `gh api "repos/anthropics/skills/git/trees/main?recursive=1"` for the full recursive file tree — 411 blobs returned, `truncated:false` confirmed complete; (3) `gh api repos/anthropics/skills/contents/<path>` + base64 decode to directly read the YAML frontmatter of all 16 SKILL.md files, `template/SKILL.md`, `README.md`, `spec/agent-skills-spec.md`, `skill-creator/references/schemas.md`, and `.claude-plugin/marketplace.json`.

ships: skills, agents (bundled sub-agents inside one skill), templates

## Items

| name | kind | path | purpose |
|---|---|---|---|
| algorithmic-art | skill | skills/algorithmic-art/SKILL.md | Generative/algorithmic art with p5.js using seeded randomness; original work only, not copies of existing artists. |
| brand-guidelines | skill | skills/brand-guidelines/SKILL.md | Applies Anthropic's own brand colors/typography to artifacts — a worked example of a brand-kit skill. |
| canvas-design | skill | skills/canvas-design/SKILL.md | Creates visual art/posters as .png/.pdf using a design philosophy; ships ~90 bundled font files under canvas-fonts/. |
| claude-api | skill | skills/claude-api/SKILL.md | Reference for the Claude API/SDK — models, pricing, streaming, tool use, MCP, caching, managed agents; per-language (csharp/go/java/php/python/ruby/typescript/curl) reference docs under subfolders. |
| doc-coauthoring | skill | skills/doc-coauthoring/SKILL.md | Structured workflow for co-authoring docs/proposals/specs with a user (no license file — the one skill without LICENSE.txt). |
| docx | skill | skills/docx/SKILL.md | Create/read/edit Word .docx/.dotx files; production skill that powers Claude's built-in document creation feature (per README). |
| frontend-design | skill | skills/frontend-design/SKILL.md | Guidance for distinctive, intentional UI visual design (aesthetic direction, typography) rather than templated defaults. |
| internal-comms | skill | skills/internal-comms/SKILL.md | Templates/guidance for internal comms (status reports, leadership updates, newsletters, FAQs, incident reports); example docs under examples/. |
| mcp-builder | skill | skills/mcp-builder/SKILL.md | Guide for building high-quality MCP servers (Python FastMCP or Node/TS SDK); includes eval scripts and reference docs. |
| pdf | skill | skills/pdf/SKILL.md | Read/merge/split/rotate/watermark/fill/OCR PDFs; production skill behind Claude's PDF capability; ships forms.md, reference.md, and 8 Python scripts. |
| pptx | skill | skills/pptx/SKILL.md | Create/edit PowerPoint .pptx/.potx decks; production skill; shares the same office/ OOXML validator+schema toolkit as docx/xlsx. |
| skill-creator | skill | skills/skill-creator/SKILL.md | Meta-skill: create/edit/optimize skills and run quantitative evals against them; documents the SKILL.md format and progressive-disclosure model itself. |
| slack-gif-creator | skill | skills/slack-gif-creator/SKILL.md | Build animated GIFs sized/validated for Slack; ships Python easing/frame-composer/gif-builder/validator modules. |
| theme-factory | skill | skills/theme-factory/SKILL.md | Apply one of 10 preset visual themes (or generate a new one) to artifacts/slides/docs/landing pages; themes as individual .md files. |
| web-artifacts-builder | skill | skills/web-artifacts-builder/SKILL.md | Tooling for complex multi-component claude.ai HTML artifacts (React/Tailwind/shadcn) needing state/routing, beyond single-file artifacts. |
| webapp-testing | skill | skills/webapp-testing/SKILL.md | Playwright-based toolkit for testing local web apps — console logs, element discovery, screenshots. |
| xlsx | skill | skills/xlsx/SKILL.md | Create/edit/clean .xlsx/.xlsm/.xltx/.csv/.tsv spreadsheets, formulas, charts; production skill; includes recalc.py. |
| template-skill | template | template/SKILL.md | Bare two-field-frontmatter skeleton (`name` + `description`) that the README points to as the starting point for a new skill. |
| analyzer (skill-creator sub-agent) | agent | skills/skill-creator/agents/analyzer.md | Bundled sub-agent definition used by skill-creator's eval loop; shows the repo's one instance of agents nested inside a skill, not top-level. |
| comparator (skill-creator sub-agent) | agent | skills/skill-creator/agents/comparator.md | Bundled sub-agent used by skill-creator to compare skill versions during iterative improvement. |
| grader (skill-creator sub-agent) | agent | skills/skill-creator/agents/grader.md | Bundled sub-agent used by skill-creator to grade eval runs against expectations (outputs grading.json). |
| anthropic-agent-skills marketplace manifest | other | .claude-plugin/marketplace.json | Claude Code plugin-marketplace manifest grouping the 16 skills into 3 installable plugins (document-skills, example-skills, claude-api); not a skill itself. |
| agent-skills-spec pointer | other | spec/agent-skills-spec.md | One-line redirect: "The spec is now located at https://agentskills.io/specification" — repo does not host the schema text itself. |

**Total: 16 skills + 1 template + 3 bundled sub-agents + 2 non-skill manifest/pointer files = 22 path-verified items.**

## Format notes

Directory layout: `skills/<skill-name>/SKILL.md` is the only required file per skill; optional siblings are `LICENSE.txt`, `scripts/` (executable code), `references/` (docs loaded into context on demand), `assets/` (templates/fonts/icons used in output), and `examples/`. Repo root also carries `template/` (bare skeleton skill), `spec/` (a one-line pointer to the external agentskills.io spec — the repo does NOT itself host the schema), and `.claude-plugin/marketplace.json` (Claude Code plugin-marketplace manifest that groups the 16 skills into three installable plugins: `document-skills` [xlsx, docx, pptx, pdf], `example-skills` [the other 11 creative/dev/enterprise skills], and `claude-api`).

**Frontmatter schema** (verified by reading all 16 SKILL.md files directly): YAML block with exactly two required keys — `name` (lowercase-hyphenated, matches the folder name) and `description` (a single string; long/multi-line descriptions use YAML `|-` block style). One optional key seen in practice: `license` (either "Complete terms in LICENSE.txt" for the Apache-2.0 example skills, or "Proprietary. LICENSE.txt has complete terms" for the four production document skills). No `version`, `tags`, `author`, or `allowed-tools` keys appear in any actual file, though skill-creator's own authoring guide mentions an optional, "rarely needed" `compatibility` field (required tools/dependencies) that none of the 16 skills actually use.

**Documented loading model** (from `skills/skill-creator/SKILL.md` — Anthropic's own stated design, not inferred): three-tier progressive disclosure — (1) name+description only, always in context (~100 words); (2) SKILL.md body, loaded into context once the skill triggers, kept under ~500 lines by convention; (3) bundled scripts/references/assets, pulled in only as needed and unbounded in size (scripts can even execute without ever being loaded into context). skill-creator also explicitly instructs authors to write "pushy" descriptions (over-specify triggering contexts) because Claude tends to under-trigger skills — all "when to use this" logic belongs in `description`, none in the body.

This SKILL.md-per-folder + minimal-frontmatter + progressive-disclosure pattern is exactly what this project's own `.claude/skills/[skill-name]/SKILL.md` + MANIFEST.json convention already follows, so no format migration would be needed to adopt Anthropic's corpus directly.

## Quality read

This is the real thing, not a thin reference. 167,053 stars / 19,913 forks, last pushed 2 days before this check (2026-08-07) — actively maintained, not abandoned. It's small by design (16 skills) rather than thin by neglect: four of them (docx/pdf/pptx/xlsx) are the actual source-available production skills that power Claude's built-in document-generation feature, ship full ISO/ECMA OOXML XSD schemas plus Python validators/converters, and are licensed "Proprietary" rather than Apache-2.0 like the rest. skill-creator is unusually sophisticated for a "skill about skills" — it defines JSON schemas for evals, grading, and version-history, and bundles three sub-agents (analyzer/comparator/grader) to run iterative benchmark-driven improvement, which is more tooling than almost any third-party skill collection carries.

Net read: highest-quality, canonical-format reference corpus, but narrow in scope (creative/design, document I/O, dev-tooling, comms) — it will not by itself cover Beamix's domain-specific needs (Next.js/Supabase/Paddle/agent-orchestration patterns), so it's a format-and-quality-bar reference to imitate, not a corpus to bulk-import.

## Unresolved / caveats

None — the original harvester marked `unresolved: []`. Every item above was found by directly listing the recursive git tree and/or reading file contents via the GitHub API, not inferred or recalled from memory.

**Recovery note:** The source agent gathered this data correctly but failed 4 consecutive StructuredOutput attempts on schema-validation errors ("must NOT have additional properties" / "must have required property 'enumeration_method'") while trying to emit the full ~10.5KB payload (including `format_notes` and `quality_read` prose fields) in one call. Its final, 5th attempt gave up and submitted a stub (`resolved: false`, 1 item only) that does NOT reflect its actual findings — that stub should be disregarded. This file reconstructs the true result from the 4th retry's full tool-call input (`items` array of 23, `resolved: true`), cross-checked against the 3rd retry which carried the identical 23-item enumeration.
