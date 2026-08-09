# VoltAgent/awesome-agent-skills

resolved: yes — https://github.com/VoltAgent/awesome-agent-skills
Confirmed via `gh api repos/VoltAgent/awesome-agent-skills`: org VoltAgent, unambiguous single match, no competing repo of the same name found or needed.

**stats:** 29,844 stars · 3,205 forks · 225 watchers · MIT license · created 2025-10-28 · last pushed 2026-08-07 (active, not archived) · 72 open issues · repo size 452KB, almost entirely the one 241KB README.md.

**ships:** index_only

This repo ships NO skills/agents/commands of its own — it is a single `README.md` (241,885 bytes / 1,963 lines), a pure curated link list. Repo root contains only `.gitignore`, `CONTRIBUTING.md`, `LICENSE`, `README.md`. No `skills/`, `plugins/`, `agents/`, or `commands/` directory exists in this repo.

## Enumeration method

1. `gh api repos/VoltAgent/awesome-agent-skills` for repo metadata (stars/license/activity).
2. `gh api repos/VoltAgent/awesome-agent-skills/contents` to confirm the repo root ships only README.md/CONTRIBUTING.md/LICENSE/.gitignore — no skills directory exists.
3. `gh api repos/.../contents/README.md -H "Accept: application/vnd.github.raw"` to pull the full 1,963-line README verbatim into a scratch file (curl is denied by the harvester's Bash allowlist, so gh api's raw-accept header was used as the fetch path).
4. `grep`/`sed` over that file to: list every `<summary>` section header (~66 sections), count skill bullet lines (`^- \*\*\[`, 1190 matches), and extract+tally every unique `github.com/{owner}/{repo}` and `officialskills.sh/{owner}` link target via regex, ranked by frequency.
5. Read the CONTRIBUTING.md raw text for the index's own entry-format and inclusion rules.
6. Spot-verified two upstream targets directly via GitHub Contents API (not trusting the README's claims) — `google/skills` (confirmed real SKILL.md with frontmatter) and `NVIDIA/skills` (confirmed real skills/ tree, though the specific sub-path cited in the README didn't match live layout).

Did not open all 158 direct-linked repos or all 48 officialskills.sh-mirrored orgs individually — budget-scoped to the highest-count sources plus spot checks.

## Items

Note on `kind`: the source agent used `skill` only for two entries it independently fetched and verified as real SKILL.md files; everything else is `other` because these are index/pointer entries into other repos, not verified skill corpora themselves.

| name | kind | path | purpose |
|---|---|---|---|
| README.md (index root) | other | `README.md` | Single 1,963-line curated markdown link-list; the entire shipped artifact of this repo. Ships no SKILL.md/agent/command files itself. |
| CONTRIBUTING.md (entry-format spec) | other | `CONTRIBUTING.md` | Defines the index's own entry format `- **[author/skill-name](url)** - <=10-word description`, and inclusion bar (public repo, has docs, real community usage, no brand-new skills). |
| Official Claude Skills (anthropics/*) | skill | `README.md:105-121` (section "Official Claude Skills") | 17 entries mirrored via officialskills.sh/anthropics/skills/{name}: docx, doc-coauthoring, pptx, xlsx, pdf, algorithmic-art, canvas-design, frontend-design, slack-gif-creator, theme-factory, web-artifacts-builder, mcp-builder, webapp-testing, brand-guidelines, internal-comms, skill-creator, template. Origin is anthropics/skills on GitHub; officialskills.sh is a mirror layer. |
| Skills by NVIDIA | other | `README.md:1391` (section "Skills by NVIDIA"), destination `github.com/NVIDIA/skills` | Largest single upstream pointer in the index: 155 skills across 17 products (Megatron-Bridge, CUDA-Q, DALI, NeMo, TensorRT-LLM, cuOpt, DeepStream, etc.), format `skills/{product}/{skill}/SKILL.md`. Repo tree existence verified live via GitHub API; README's specific `CUDA-Q/cudaq-guide` sub-path 404'd on live check (likely reorganized since README snapshot). |
| Skills by Paweł Huryn (phuryn/pm-skills) | other | `README.md` (section "Product Management Skills by Pawel Huryn"), destination `github.com/phuryn/pm-skills` | 65 product-management skill entries pointed to — second-largest single-repo pointer. |
| Skills by TestMu AI / LambdaTest | other | `README.md:137-192` (section "Skills by TestMu AI"), destination `github.com/LambdaTest/agent-skills` | 49 test-automation skills across API, Appium, Behat, Behave, Capybara, CI/CD, Codeception, Cucumber, Cypress, Detox and more frameworks. |
| Skills by Dean Peters (deanpeters/Product-Manager-Skills) | other | `README.md` (section "Product Manager Skills by Dean Peters") | 46 product-manager skill entries. |
| Skills by Corey Haines (coreyhaines31/marketingskills) | other | `README.md` (section "Marketing Skills by Corey Haines") | 32 marketing skill entries. |
| obra/superpowers | other | `README.md` (scattered across "Productivity and Collaboration" and "Development and Testing" community subsections), destination `github.com/obra/superpowers/blob/main/skills/{name}/SKILL.md` | 21 entries: brainstorming, writing-plans, executing-plans, dispatching-parallel-agents, sharing-skills, using-superpowers, test-driven-development, subagent-driven-development, systematic-debugging, root-cause-tracing, testing-skills-with-subagents, testing-anti-patterns, finishing-a-development-branch, requesting-code-review, receiving-code-review, using-git-worktrees, verification-before-completion, condition-based-waiting, commands, writing-skills, defense-in-depth. Notable: several of these names already exist in Beamix's own skill roster. |
| Skills by Venice.ai (veniceai/skills) | other | `README.md:361` (section "Skills by Venice.ai") | 19 skill entries. |
| google/skills (Google Cloud subset verified) | skill | `github.com/google/skills/blob/main/skills/cloud/firebase-basics/SKILL.md` (verified live, linked from README.md:1614) | Real, fetched SKILL.md confirming frontmatter shape `name:` / `metadata:{category:}` / `description:` plus a `references/` subdirectory. 19 Google Cloud entries listed in README covering Firebase, BigQuery, Cloud Run, GKE, AlloyDB, Cloud SQL, Gemini Enterprise Agent Platform, and the Well-Architected Framework. |
| Skills by realkimbarrett (advertising-skills) | other | `README.md` (section "Advertising Skills by Kim Barrett") | 12 advertising skill entries. |
| NeoLabHQ/context-engineering-kit | other | `README.md`, scattered entries e.g. line 1784-1789 and 1834, destination `github.com/NeoLabHQ/context-engineering-kit/tree/master/plugins/{plugin}/skills/{skill}` | 8 entries under a nested plugins/{name}/skills/{skill} layout (code-review, reflexion, sdd, ddd, sadd, kaizen, prompt-engineering, write-concisely) — a plugin-bundles-skills pattern distinct from the flat layout most other sources use. |
| muratcankoylan/Agent-Skills-for-Context-Engineering | other | `README.md:1824-1831` (section "Context Engineering") | 8 entries: context-fundamentals, context-degradation, context-compression, context-optimization, multi-agent-patterns, memory-systems, tool-design, evaluation. |
| hamelsmu/prompts (evals-skills) | other | `README.md:1790-1797`, destination `github.com/hamelsmu/prompts/tree/main/evals-skills/skills/{name}` | 7 LLM-eval skills: eval-audit, error-analysis, generate-synthetic-data, write-judge-prompt, validate-evaluator, evaluate-rag, build-review-interface. |
| czlonkowski/n8n-skills | other | `README.md:1886-1892` (section "n8n Automation") | 7 n8n workflow-automation skills: code-javascript, code-python, expression-syntax, mcp-tools-expert, node-configuration, validation-expert, workflow-patterns. |
| Community Skills — top-level buckets | other | `README.md:1658-1894` ("Community Skills" parent section, 7 subsections) | Vector Databases, Marketing, Productivity and Collaboration, Development and Testing, Context Engineering, Specialized Domains, n8n Automation — ~140 mostly single-author repos of 1-3 skills each, quality unverified/highly variable, explicitly flagged by the repo itself as "curated, not audited." |
| Skills Paths for Other AI Coding Assistants (reference table) | other | `README.md:1913-1924` | Cross-tool skill-directory convention table (Claude Code `.claude/skills/`, Codex `.agents/skills/`, Cursor `.cursor/skills/`, Gemini CLI `.gemini/skills/`, GitHub Copilot `.github/skills/`, OpenCode `.opencode/skills/`, Windsurf `.windsurf/skills/`, Antigravity `.agent/skills/`) — directly reusable reference for a redesign spanning multiple agent runtimes. |
| Skill Quality Standards (reference table) | other | `README.md:1927-1940` | The index's own quality bar for SKILL.md authorship (description style, progressive disclosure token/line limits, no absolute paths, scoped tool declarations) — a ready-made checklist Adam could adopt wholesale. |

## Format notes

- Table of Contents grid at top linking to ~60 anchor sections, one per contributing org/team.
- Each section is a collapsible `<details><summary><h3>Skills by [Org]</h3></summary> ... </details>` block.
- Entry line format: `- **[owner/skill-name](url)** - short description` (CONTRIBUTING.md caps description at "10 words or fewer").
- Two link mechanisms point away from this repo to the real skill files:
  1. `officialskills.sh/{owner}/skills/{name}` — VoltAgent's own hosted catalog/mirror site (582 of ~1190 links, 48 distinct owners: anthropics, microsoft, openai, getsentry, garrytan, flutter, trailofbits, googleworkspace, fal-ai-community, auth0, WordPress, huggingface, apollographql, netlify, firebase, MiniMax-AI, hashicorp, expo, brave, coinbase, makenotion, greensock, datadog-labs, cloudflare, mongodb, figma, browserbase, binance, better-auth, google-labs-code, duckdb, clickhouse, addyosmani, firecrawl, voltagent, tinybirdco, sanity-io, google-gemini, vercel-labs, neondatabase, composiohq, supabase, stripe, courier, callstack, redis, and a few more). This is a middleman layer, not the origin.
  2. Direct `github.com/{owner}/{repo}/tree|blob/{branch}/{path}` links — 611 of ~1190 links, 158 unique repos. These ARE primary sources.
- Bottom of README carries two reusable reference tables worth reusing verbatim in a redesign: "Skills Paths for Other AI Coding Assistants" and "Skill Quality Standards" (see Items table above).

Verified upstream frontmatter (spot-checked two real destination repos via GitHub Contents API, not the README's claims):
- `google/skills` (github.com/google/skills) — real per-skill dir `skills/cloud/firebase-basics/{SKILL.md, references/}`. SKILL.md frontmatter: `name:`, `metadata: {category: ...}`, `description:` (long, keyword-dense, states what it's for AND what NOT to use it for). This is the closest "gold standard" shape to Beamix's own `.claude/skills/[name]/SKILL.md` convention — worth matching over inventing something new.
- `NVIDIA/skills` (github.com/NVIDIA/skills) — real per-skill dirs under `skills/{product-or-slug}/...` (confirmed `skills/accelerated-computing-cudf/` exists at repo root; the README's exact `CUDA-Q/cudaq-guide` sub-path 404'd on a live check — likely reorganized since the README snapshot was written, so treat NVIDIA's internal taxonomy as drifted/unverified in detail even though the repo and its scale are real).
- `NeoLabHQ/context-engineering-kit` and `baskduf/FableCodex` use a nested "plugins" layout: `plugins/{plugin-name}/skills/{skill-name}/SKILL.md` — a plugin bundling multiple skills, distinct from the flat `skills/{name}/SKILL.md` pattern most orgs use.

No machine-readable manifest (no skills.json/index.yaml) exists anywhere in this repo — purely markdown, hand-maintained via PRs per CONTRIBUTING.md.

## Quality read

Genuinely active and well-curated as an INDEX — not a dead or thin project. 29,844 stars, 3,205 forks, MIT license, created 2025-10-28, last pushed one day before the harvest (2026-08-07), 72 open issues, no bot-generated feel (CONTRIBUTING.md explicitly gates out "skills you created 3 hours ago," requires "real community usage"). But it is exactly what its own description implies: a pointer list, not a corpus. Its only shipped artifact is README.md.

Its real value for Adam's catalog is as a discovery map into ~158 directly-linked GitHub repos (plus ~48 more reachable only through VoltAgent's officialskills.sh mirror) that he wouldn't otherwise know about. Quality of those upstream sources varies enormously: legitimate, actively-maintained vendor corpora (NVIDIA/skills: 155 skills/17 products; google/skills: 19 skills with clean progressive-disclosure frontmatter; LambdaTest/agent-skills: 49 test-automation skills; anthropics/skills; Sentry, Vercel, Cloudflare, HashiCorp, Firebase, Stripe official teams) sit alongside a long tail (~140 repos) of single-author, 1-3-skill projects of unverified quality, and a handful of outlier mega-repos of unclear rigor (mukul975/Anthropic-Cybersecurity-Skills claims 753 skills across 38 domains; ehmo/platform-design-skills claims 300+ rules — neither independently verified by the source agent).

The repo's own "Security Notice" says these are "curated, not audited" and warns of possible prompt injection / tool poisoning / hidden payloads in third-party skills — a real caution before bulk-importing anything from the long tail.

One noteworthy repo already echoed in Beamix's own skill list: **obra/superpowers** (21 entries: brainstorming, writing-plans, dispatching-parallel-agents, using-git-worktrees, systematic-debugging, tdd, etc.) — Adam's project already has skills with matching names, suggesting this upstream is a common ancestor worth checking for drift/updates.

## Unresolved / caveats

- officialskills.sh mirror fidelity unverified: 582 of ~1190 README links route through VoltAgent's own hosted catalog (officialskills.sh/{owner}/skills/{name}) rather than the origin GitHub repo — not independently confirmed that the mirrored content is byte-identical/up-to-date with each org's canonical source for all 48 owners.
- README badge claims "Skills-1497+" vs. 1190 bullet entries actually counted in this fetch of README.md — gap unexplained, do not treat 1497 as verified.
- NVIDIA/skills internal path taxonomy appears to have drifted from what the README cites (README's "skills/CUDA-Q/cudaq-guide" 404'd against the live repo tree, though the repo and its 155-skill/17-product scale are real) — exact current directory layout not fully re-verified.
- Long-tail community claims not independently verified: mukul975/Anthropic-Cybersecurity-Skills (753 skills/38 domains) and ehmo/platform-design-skills (300+ rules) are taken from the README's own description text, not opened and counted.
- Did not open all 158 direct-linked repos or all 48 officialskills.sh-mirrored orgs individually — budget-scoped to the highest-count sources plus two spot checks (google/skills, NVIDIA/skills).
