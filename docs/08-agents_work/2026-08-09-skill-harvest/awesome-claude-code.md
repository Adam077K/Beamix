# awesome-claude-code

**resolved:** yes
**repo:** https://github.com/hesreallyhim/awesome-claude-code
**author:** hesreallyhim, license NOASSERTION (LICENSE file present but no SPDX-recognized license text)
**ships:** index_only — a pure link index. Zero SKILL.md files, zero `.claude/commands/*.md`, zero hooks, zero agent definitions in the repo itself. Every catalog entry is a pointer to a *different* external repo.

## Resolution

Confirmed via `gh api search/repositories?q=awesome-claude-code+in:name` sorted by stars: `hesreallyhim/awesome-claude-code` has 51,934 stars — an order of magnitude ahead of every other repo literally named "awesome-claude-code" (next closest: `jqueryscript/awesome-claude-code` at 492 stars, `subinium/awesome-claude-code` at 110 stars). The only larger "awesome-claude-code*" hit, `VoltAgent/awesome-claude-code-subagents` (24,143 stars), is a differently-scoped, differently-named project (subagents only, not a general index) and was judged not a plausible alternate match for "the awesome-claude-code list." No ambiguity.

**Stats:** 51,934 stars, 4,530 forks, 813 open issues, not archived, pushed 2026-08-08 (actively maintained, daily activity). Catalog size: 153 active entries across 18 categories in the current CSV, plus 198 additional entries preserved only in a frozen legacy snapshot (Agent Skills 19, Workflows & Knowledge Guides 35, Tooling 51, Status Lines 7, Hooks 11, Slash-Commands 43, CLAUDE.md Files 24, Alternative Clients 5, Official Docs 3, Latest Additions 3).

## Enumeration method

Resolved the repo via `gh api search/repositories?q=awesome-claude-code+in:name&sort=stars` (GitHub API, not memory/reputation). Enumerated the full file tree via `gh api repos/hesreallyhim/awesome-claude-code/git/trees/main?recursive=1` (56 blobs — confirms no `skills/`, `commands/`, `hooks/`, or `agents/` directory exists in the repo). Fetched and parsed `THE_RESOURCES_TABLE_NEW.csv` (153 data rows) via `gh api .../contents/...` + base64 decode + Python `csv.DictReader`, tabulating exact category/sub-category counts. Fetched `config.yaml` (category taxonomy, confirmed as sole source of section order/schema per its own header comment) and `resources/categories.py` (confirms `categories.py` reads `config.yaml`, not the CSV, for validation). Fetched `README.md` head to confirm generated-output structure/badges match the CSV. Fetched `CONTRIBUTING.md` for submission rules. Fetched `README_ALTERNATIVES/README_CLASSIC.md` in full and parsed it with a regex over `## ` headings and `` [`Name`](link) `` bullet patterns to get exact per-legacy-category counts, then extracted full name+link lists for the Agent Skills, Hooks, and Slash-Commands sections specifically (the three most relevant to this catalog). Cross-checked the current CSV for any additional skill-shaped entries hiding in non-"Skills" categories by grepping description/name text for "skill" (32 hits, all itemized below with their actual category). All data is from live API/file fetches, not recollection.

## Items

The repo's own machinery (generator/data/CI), then pointers it lists — grouped by which of the repo's two coexisting formats they came from.

### The repo's own machinery (not a skill/command/hook itself)

| name | kind | path | purpose |
|---|---|---|---|
| generate_readme.py | other | `generate_readme.py` | Renders README.md from THE_RESOURCES_TABLE_NEW.csv + config.yaml + templates/README.template.md — the list's own generator, not a Claude Code skill/command/hook |
| config.yaml | other | `config.yaml` | Single source of truth for category/sub-category names, order, descriptions, submittable flag |
| THE_RESOURCES_TABLE_NEW.csv | other | `THE_RESOURCES_TABLE_NEW.csv` | The actual catalog data — 153 rows across 18 categories, each a link to an external repo/article/plugin |
| templates/README.template.md | template | `templates/README.template.md` | Jinja-style template consumed by generate_readme.py to produce README.md |
| resources/ (add_resource.py, update_resource.py, move_resource.py, parse_issue_form.py, create_resource_pr.py, categories.py, ids.py, resource_utils.py) | other | `resources/` | CLI automation for maintaining the CSV from GitHub issue-form submissions |
| ticker/ (fetch_repo_ticker_data.py, generate_ticker_svg.py, generate_recently_added_svg.py, ticker_filters.py) | other | `ticker/` | Builds the animated "repo ticker" and "recently added" SVGs shown at the top of README.md by polling GitHub stats for listed repos |
| .github/workflows/ (handle-resource-submission-commands, regenerate-readme, update-repo-ticker, validate-new-issue, notify-on-merge) | workflow | `.github/workflows/` | CI automation gluing the issue-form submission pipeline to CSV updates and README regeneration |
| recommend-resource.yml | template | `.github/ISSUE_TEMPLATE/recommend-resource.yml` | GitHub issue-form template that is the ONLY accepted submission path; its Category dropdown is generated from config.yaml |
| README_CLASSIC.md / README_AWESOME.md / README_EXTRA.md / README_FLAT_ALL_AZ.md | other | `README_ALTERNATIVES/` | Frozen alternate renderings of the pre-relaunch list, preserved for reference but not updated by the CSV pipeline |

### Pointers from the CURRENT CSV catalog (THE_RESOURCES_TABLE_NEW.csv)

Each row is a link to an *external* repo. "Path" below records where in this indexing repo the pointer was found, not a path inside the target project.

| name | kind | path (in this repo) | points to / purpose |
|---|---|---|---|
| fable-mode | skill | THE_RESOURCES_TABLE_NEW.csv (row skill-64ab28b2) | Skill activating multi-stage planning, sub-agent delegation, self-verification — points to `mrtooher/fable-mode` |
| Caveman | skill | THE_RESOURCES_TABLE_NEW.csv (row 6de46512) | Token-conserving "caveman speak" compression plugin/skill ecosystem — points to `JuliusBrussee/caveman` |
| Claude Code Infrastructure Showcase | skill | THE_RESOURCES_TABLE_NEW.csv (row 75404630) | Hook-driven technique for automatic skill selection/activation — points to `diet103/claude-code-infrastructure-showcase` |
| Superpowers | skill | THE_RESOURCES_TABLE_NEW.csv (row 2e01f4b3) | Bundle of SDLC-covering skills (plan/review/test/debug) — points to `obra/superpowers`; also separately listed in the legacy Agent Skills section |
| Agent Skills (anthropics/skills) | skill | THE_RESOURCES_TABLE_NEW.csv (From Anthropic category) / README.md | Official Anthropic repo for the SKILL.md format, a skill template, and example skills — the canonical upstream spec |
| Bedrock | skill | THE_RESOURCES_TABLE_NEW.csv (Documentation/Obsidian) | 8-skill plugin turning an Obsidian vault into an entity-typed Zettelkasten graph — `iurykrieger/claude-bedrock` |
| AI Research Skills | skill | THE_RESOURCES_TABLE_NEW.csv (Research & Scientific Inquiry) | 15 skills mapped to 8 research-workflow stages — `WenyuChiou/ai-research-skills` |
| Bloom | skill | THE_RESOURCES_TABLE_NEW.csv (Documentation) | Self-contained skill turning Bloom's 2-sigma tutoring research into an AI tutor — `Li-Evan/Bloom` |
| MDXG Redline | skill | THE_RESOURCES_TABLE_NEW.csv (Documentation) | Skill + HTML tool for human-review loop on AI-written docs — `oubakiou/mdxg-redline` |
| OpenWeb | skill | THE_RESOURCES_TABLE_NEW.csv (Providers, Runtime & Integration Infra) | Agent-native skill calling 90+ website APIs directly instead of DOM-scraping — `openweb-org/openweb` |
| chrome-cdp-ex | skill | THE_RESOURCES_TABLE_NEW.csv (Providers, Runtime & Integration Infra) | Zero-dependency skill (68 commands) giving a perception layer over a real logged-in Chrome instance — `EndeavorYen/chrome-cdp-ex` |
| Cate | skill | THE_RESOURCES_TABLE_NEW.csv (Alternative Clients) | Infinite-canvas desktop IDE that ships skills letting Claude Code spawn agent terminals on the canvas — `0-AI-UG/cate` |
| claude-statusbar | other | THE_RESOURCES_TABLE_NEW.csv (Status Lines) | Status-line tool with rate-limit/context/cost tracking — `leeguooooo/claude-code-usage-bar` (not itself a skill, mentions skills in usage) |
| Dev Browser | skill | THE_RESOURCES_TABLE_NEW.csv (Design & UI/UX) | Browser-automation plugin/skill for self-verification via Playwright + computer-use — `SawyerHood/dev-browser` |
| StyleSeed | skill | THE_RESOURCES_TABLE_NEW.csv (Design & UI/UX) | Design-judgment engine encoding ~74 unwritten pro design rules — `bitjaru/styleseed` |
| UI Craft | skill | THE_RESOURCES_TABLE_NEW.csv (Design & UI/UX) | Layered design-engineering skill with 22 single-lens commands + deterministic MCP/CI gates — `educlopez/ui-craft` |
| Avoid AI Writing | skill | THE_RESOURCES_TABLE_NEW.csv (Writing & Prose Quality) | Portable writing skill removing AI-isms via 49+ pattern categories — `conorbronsdon/avoid-ai-writing` |
| naming | skill | THE_RESOURCES_TABLE_NEW.csv (Writing & Prose Quality) | Skill for naming products/brands via structured metaphor-driven process — `glacierphonk/naming` |
| capcut-cli | skill | THE_RESOURCES_TABLE_NEW.csv (Creative Media) | CLI + Claude Code plugin/skill for programmatic CapCut/JianYing video editing — `renezander030/capcut-cli` |
| motion-skills | skill | THE_RESOURCES_TABLE_NEW.csv (Creative Media) | ~50 motion-graphics/animation skills across 14 installable packs — `iart-ai/motion-skills` |
| terraform-skill | skill | THE_RESOURCES_TABLE_NEW.csv (Infrastructure & DevOps) | Best-practices skill for safer Terraform/OpenTofu via diagnose-first workflow — `antonbabenko/terraform-skill` |
| otelcol-doctor | skill | THE_RESOURCES_TABLE_NEW.csv (Infrastructure & DevOps) | Skill that writes/fixes/validates OpenTelemetry Collector configs — `s3onghyun/otelcol-doctor` |
| SkillSpector | other | THE_RESOURCES_TABLE_NEW.csv (Security) | NVIDIA security scanner FOR AI agent skills (detects vulns/malicious patterns in skill packages) — `NVIDIA/SkillSpector` |
| SkilLock | other | THE_RESOURCES_TABLE_NEW.csv (Security) | Pins skill behavior, blocks unapproved drift in CI — `skills-lock/skil-lock` |
| Agent Collab Skills | skill | THE_RESOURCES_TABLE_NEW.csv (Agent Orchestration) | Marketplace of skills for multi-agent collab (task splitter, adversarial debate, acceptance gate) — `WenyuChiou/agent-collab-skills` |
| Hivemind | skill | THE_RESOURCES_TABLE_NEW.csv (Memory & Context Persistence) | Turns agent traces into reusable skills across agents — `activeloopai/hivemind` |
| agnix | other | THE_RESOURCES_TABLE_NEW.csv (Linting) | Linter/LSP validating CLAUDE.md, AGENTS.md, SKILL.md, hooks, MCP config — `agent-sh/agnix` |
| BlockWatch | other | THE_RESOURCES_TABLE_NEW.csv (Linting) | Language-agnostic linter keeping code/docs/config in sync, with a Claude Code plugin skill — `mennanov/blockwatch` |
| Schliff | other | THE_RESOURCES_TABLE_NEW.csv (Linting) | Deterministic 8-dimension quality scorer for SKILL.md/CLAUDE.md/.cursorrules/AGENTS.md — `Zandereins/schliff` |
| Upkeep | other | THE_RESOURCES_TABLE_NEW.csv (Linting) | AI audit crew catching docs/spec/asset drift; Claude Code plugin/skill + CI workflow — `wei18/Upkeep` |
| cc-thinking-skills | skill | THE_RESOURCES_TABLE_NEW.csv (Documentation) | Installable thinking-framework skills with a meta-router — `tjboudreaux/cc-thinking-skills` |
| gstack | agent | THE_RESOURCES_TABLE_NEW.csv (Agent Orchestration) | Garry Tan's Claude Code "software factory" setup with agents + in-depth skills/tools + workflows — `garrytan/gstack` |
| Vox director skill | skill | THE_RESOURCES_TABLE_NEW.csv (Creative Media) | Turns a topic into a finished paper-collage explainer video — `Alisa0808/vox-director` |
| visual-explainer | skill | THE_RESOURCES_TABLE_NEW.csv (Design & UI/UX) | Skill/plugin turning terminal output into styled HTML pages/slide decks — `nicobailon/visual-explainer` |
| CC Harness | other | THE_RESOURCES_TABLE_NEW.csv (Observability & Monitoring) | Desktop workbench rendering subagent/workflow topology as a live graph from session files — `lookfree/cc-harness` |
| Agentic Workflow Patterns | workflow | THE_RESOURCES_TABLE_NEW.csv (Documentation) | Documented agentic patterns incl. "Progressive Skills," with diagrams — `ThibautMelen/agentic-workflow-patterns` |
| Harness | skill | THE_RESOURCES_TABLE_NEW.csv (Agent Orchestration) | Meta-skill that designs domain-specific agent teams and generates the skills they use — `revfactory/harness` |

### Pointers from the FROZEN legacy snapshot (README_ALTERNATIVES/README_CLASSIC.md) — Agent Skills section

These are preserved but no longer updated (repo explicitly says this snapshot is frozen).

| name | kind | path (in this repo) | points to |
|---|---|---|---|
| AgentSys | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `avifenesh/agentsys` |
| Book Factory | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `robertguss/claude-skills` |
| cc-devops-skills | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `akin-ozer/cc-devops-skills` |
| Claude Code Agents | agent | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `undeadlist/claude-code-agents` |
| Claude Codex Settings | other | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `fcakyon/claude-codex-settings` |
| Claude Mountaineering Skills | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `dreamiurg/claude-mountaineering-skills` |
| Claude Scientific Skills | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `K-Dense-AI/claude-scientific-skills` |
| Codebase to Course | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `zarazhangrui/codebase-to-course` |
| Codex Skill | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `skills-directory/skill-codex` |
| Compound Engineering Plugin | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `EveryInc/compound-engineering-plugin` |
| Context Engineering Kit | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `NeoLabHQ/context-engineering-kit` |
| Everything Claude Code | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `affaan-m/everything-claude-code` |
| Fullstack Dev Skills | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `jeffallan/claude-skills` |
| read-only-postgres | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `jawwadfirdousi/agent-skills` |
| Superpowers (legacy listing) | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | duplicate of the current-list entry — `obra/superpowers` |
| Trail of Bits Security Skills | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `trailofbits/skills` |
| TACHES Claude Code Resources | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `glittercowboy/taches-cc-resources` |
| Web Assets Generator Skill | skill | README_ALTERNATIVES/README_CLASSIC.md (Agent Skills section) | `alonw0/web-asset-generator` |

### Pointers from the FROZEN legacy snapshot — Hooks section

| name | kind | path (in this repo) | points to |
|---|---|---|---|
| Britfix | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | Hook converting American→British spelling on file write — `Talieisin/britfix` |
| CC Notify | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | Desktop notifications on input-needed/task-complete via hooks — `dazuiba/CCNotify` |
| cchooks | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | Lightweight Python SDK for writing Claude Code hooks — `GowayLee/cchooks` |
| Claude Code Hook Comms (HCOM) | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | Real-time hook-based sub-agent comms CLI — `aannoo/claude-hook-comms` |
| claude-code-hooks-sdk | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | Laravel-inspired PHP SDK for building hook JSON responses — `beyondcode/claude-hooks-sdk` |
| claude-hooks | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | Hooks tooling — `johnlindquist/claude-hooks` |
| Claudio | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | Hooks tooling — `ctoth/claudio` |
| Dippy | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | Hooks tooling — `ldayton/Dippy` |
| parry | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | Hooks tooling — `vaporif/parry` |
| TDD Guard | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | Hook enforcing TDD discipline — `nizos/tdd-guard` |
| TypeScript Quality Hooks | hook | README_ALTERNATIVES/README_CLASSIC.md (Hooks section) | TypeScript-specific quality-gate hooks — `bartolli/claude-code-typescript-hooks` |

### Sampled Slash-Commands (from the FROZEN legacy snapshot) — confirms field convention

23 of the section's entries were sampled to confirm the path shape used across consuming repos. All but one follow `.claude/commands/<name>.md`.

| name | kind | path |
|---|---|---|
| /create-hook | command | `omril321/automated-notebooklm/.claude/commands/create-hook.md` |
| /commit | command | `evmts/tevm-monorepo/.claude/commands/commit.md` |
| /commit-fast | command | `steadycursor/steadystart/.claude/commands/2-commit-fast.md` |
| /create-pr | command | `toyamarinyon/giselle/.claude/commands/create-pr.md` |
| /create-pull-request | command | `liam-hq/liam/.claude/commands/create-pull-request.md` |
| /create-worktrees | command | `evmts/tevm-monorepo/.claude/commands/create-worktrees.md` |
| /fix-github-issue | command | `jeremymailen/kotlinter-gradle/.claude/commands/fix-github-issue.md` |
| /fix-issue | command | `metabase/metabase/.claude/commands/fix-issue.md` |
| /fix-pr | command | `metabase/metabase/.claude/commands/fix-pr.md` |
| /husky | command | `evmts/tevm-monorepo/.claude/commands/husky.md` |
| /update-branch-name | command | `giselles-ai/giselle/.claude/commands/update-branch-name.md` |
| /check | command | `rygwdn/slack-tools/.claude/commands/check.md` |
| /code_analysis | command | `kingler/n8n_agent/.claude/commands/code_analysis.md` |
| /optimize | command | `to4iki/ai-project-rules/.claude/commands/optimize.md` |
| /repro-issue | command | `rzykov/metabase/.claude/commands/repro-issue.md` |
| /tdd | command | `zscott/pane/.claude/commands/tdd.md` |
| /tdd-implement | command | `jerseycheese/Narraitor/.claude/commands/tdd-implement.md` |
| /context-prime | command | `elizaOS/elizaos.github.io/.claude/commands/context-prime.md` |
| /initref | command | `okuvshynov/cubestat/.claude/commands/initref.md` |
| /load-llms-txt | command | `ethpandaops/xatu-data/.claude/commands/load-llms-txt.md` |
| /prime | command | `yzyydev/AI-Engineering-Structure/.claude/commands/prime.md` |
| /rsi | command | `ddisisto/si/.claude/commands/rsi.md` |
| /add-to-changelog | command | `berrydev-ai/blockdoc-python/.claude/commands/add-to-changelog.md` |
| /create-docs | command | `jerseycheese/Narraitor/.claude/commands/create-docs.md` |
| /docs | command | `slunsford/coffee-analytics/.claude/commands/docs.md` |
| /explain-issue-fix | command | `hackdays-io/toban-contribution-viewer/.claude/commands/explain-issue-fix.md` |
| /update-docs | command | `Consiliency/Flutter-Structurizr/.claude/commands/update-docs.md` |
| /release | command | `kelp/webdown/.claude/commands/release.md` |
| /run-ci | command | `hackdays-io/toban-contribution-viewer/.claude/commands/run-ci.md` |
| /create-command | command | `scopecraft/command/.claude/commands/create-command.md` |
| /create-plan | command | `hesreallyhim/inkverse-fork/.claude/commands/create-plan.md` (authored by the list's own maintainer) |
| /create-prp | command | `Wirasm/claudecode-utils/.claude/commands/create-prp.md` |
| /do-issue | command | `jerseycheese/Narraitor/.claude/commands/do-issue.md` |
| /todo | command | `chrisleyva/todo-slash-command/todo.md` (outlier: root-level, not under `.claude/commands/`) |
| /use-stepper | command | `zuplo/docs/.claude/commands/use-stepper.md` |

## Format notes

Two distinct formats coexist in this repo, from two eras of the list:

**CURRENT (active) format** — data-driven, CSV + YAML, README auto-generated:
- `THE_RESOURCES_TABLE_NEW.csv` is the single data source. Row schema: ID, Display Name, Category, Sub-Category, Link, Author Name, Author Link, Active, Date Added, Last Checked, Description, Stale. IDs are opaque 8-char hex (the category `prefix` in config.yaml is vestigial/unused for ID minting).
- `config.yaml` is the ONLY place category/sub-category order and section descriptions live (a comment in the file states this explicitly). Schema: `categories: [{name, description?, submittable?(default true), subcategories: [{name, description?}]}]`.
- `generate_readme.py` + `templates/README.template.md` render `README.md` from the CSV + config.yaml (entries sorted alphabetically within category; per-entry shields.io badges for created/last-commit/license/stars auto-appended for GitHub links).
- `resources/*.py` (add_resource.py, update_resource.py, move_resource.py, parse_issue_form.py, create_resource_pr.py) are the CLI/automation for maintaining the CSV; `scripts/sync_issue_form.py` keeps the GitHub issue-form dropdown in sync with config.yaml; `.github/workflows/*.yml` wire this into CI (handle-resource-submission-commands, regenerate-readme, update-repo-ticker, validate-new-issue).
- Contribution rule (CONTRIBUTING.md): resource must be ≥14 days old with post-day-1 commits OR have ≥100 stars; one resource per issue; submissions must go through the GitHub issue-form template only (no PRs), human-submitted (agent-built is fine, agent-submitted is not); descriptions must be neutral one-liners, no emoji, no sales pitch.

**LEGACY (frozen) format** — preserved but no longer updated, in `README_ALTERNATIVES/README_CLASSIC.md` (and sibling README_AWESOME.md / README_EXTRA.md / README_FLAT_ALL_AZ.md, not individually parsed): hand-written markdown, `## Category` headings with emoji, `<details><summary>` collapsible GitHub-stats blocks per entry, entries as `` [`Name`](link) by [Author](link) `` + one-line description + optional license badge.

**What's actually worth mirroring for a clean-sheet redesign:** not this repo's own layout (it ships no skills) — it's what the Slash-Commands section's links reveal about the field's de facto convention: individual commands live at `.claude/commands/<name>.md` inside consuming repos (34/34 sampled links follow this path shape, one outlier at root level), and the "From Anthropic" category points to `anthropics/skills` as the canonical `SKILL.md` format spec.

## Quality read

Genuinely serious and actively maintained as a curation/aggregation project: 51,934 stars, 4,530 forks, 813 open issues, pushed within the last day, with real CI (pre-commit hooks, automated issue-form validation, README regeneration, a repo-star ticker, a tests/ directory covering the generator and badge logic). The maintainer runs a deliberately strict submission bar (14-days-old-with-activity OR 100+ stars; one submission per issue; human-submitted only; issue-form-only, no PRs).

But as a source of skills/commands/hooks it is thin and getting thinner by design: the CURRENT active list has only 4 entries in its "Skills" category and 0 in dedicated Hooks/Slash-Commands categories, because those categories no longer exist in the current taxonomy at all (README.md states plainly this iteration was "launched with the express intent to highlight resources not on the last iteration" and that legacy resources are being re-added "over the coming weeks" — as of this check they have not been). The richer breakdown (Agent Skills: 19, Hooks: 11, Slash-Commands: 43, Workflows & Knowledge Guides: 35, Tooling: 51, CLAUDE.md Files: 24) exists only in the FROZEN legacy snapshot at README_ALTERNATIVES/README_CLASSIC.md, which the repo explicitly says it will not update. So: not dead, but the part relevant to this catalog (skills/commands/hooks) is either sparse-and-current or rich-and-stale, never both.

Critically, this repo ships zero SKILL.md files, zero `.claude/commands/*.md`, zero hooks, zero agent definitions itself — it is a pure link index (a README + the Python/YAML machinery that generates it from a CSV). Every name in the items list above is a pointer to a DIFFERENT external repo that would need to be fetched separately to get an actual corpus. For "what skills exist in the field," this source is best used as a discovery map (which repos to go fetch), not as a corpus to absorb directly.

## Unresolved / caveats

- `README_ALTERNATIVES/README_AWESOME.md`, `README_EXTRA.md`, and `README_FLAT_ALL_AZ.md` were located (same directory as README_CLASSIC.md, fetched to confirm the directory listing) but not individually parsed — likely reformattings/supersets of the same legacy dataset as README_CLASSIC.md rather than distinct content; low-value to re-parse unless a specific different grouping is needed.
- Per-item descriptions for the sampled Slash-Commands entries were not extracted beyond name+link — the classic README's Slash-Commands section entries carry short blurbs in the source that could be pulled if per-command detail becomes useful.
- The original agent's `StructuredOutput` call failed repeatedly on schema-shape errors (missing `enumeration_method`, then "must NOT have additional properties") — this is why the run never returned; the payload itself (recovered here from the tool_use input on the agent's second/final attempt) was complete and well-formed.
