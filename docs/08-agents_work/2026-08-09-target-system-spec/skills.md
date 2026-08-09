# Skill corpus — target spec

Surface: **Skill corpus** (`.claude/skills/`). Planning only — nothing here is built until Adam says build.

---

## Current state (measured, with the commands you ran)

All commands run from `/Users/adamks/VibeCoding/Beamix/.worktrees/ceo-1-1786220343`.

### Count — the real number is 149, not 145, 146, or 117

```
find .claude/skills -mindepth 1 -maxdepth 2 -name SKILL.md | wc -l      → 145  (top-level skill dirs)
find .claude/skills -mindepth 1 -maxdepth 3 -name SKILL.md | wc -l      → 149  (adds the 4 nested under security/)
node -e "require('./.claude/skills/MANIFEST.json').skills.length"      → 149
node -e "require('./.claude/skills/MANIFEST.json').totalSkills"        →  145  ← wrong, stale field
```

`.claude/skills/security/` is a directory with no `SKILL.md` of its own that contains 4 further-nested
skills (`aws-compliance-checker`, `aws-iam-best-practices`, `aws-secrets-rotation`, `aws-security-audit`).
A `maxdepth 2` find misses those, which is almost certainly how the "145" and "146" numbers in circulation
were produced. **149 matches the MANIFEST array length exactly and is the ground truth.** The `totalSkills`
field inside the same file disagrees with the array it sits next to — one more confirmation that nothing
regenerates this file from a single source of truth.

Cross-checked both directions: every MANIFEST entry resolves to a real `SKILL.md` on disk, and every
`SKILL.md` on disk has a MANIFEST entry. No phantom entries, no orphans. The corpus is *complete*, just
badly summarized.

### MANIFEST.json's description field is broken for at least 62 of 149 skills (42%) — root-caused

`CLAUDE.md` instructs every agent: *"Discovery — read MANIFEST.json, never `ls | grep`... filter by tags
matching task domain."* Progressive-disclosure selection therefore runs on the `description` string in this
JSON file, not on the live `SKILL.md` frontmatter. I diffed both.

**9 skills have an empty or single-character description** (`node` script against the manifest,
`description.length < 40`): `ai-engineer` → `"|"`, `debugger` → `"|"`, `frontend-developer` → `"|"`,
`payment-integration` → `"|"`, `copywriting` → `""`, `design-orchestration` → `""`, `form-cro` → `""`,
`multi-agent-brainstorming` → `""`, `page-cro` → `""`.

I read the actual `SKILL.md` files for all 9. **Every one has a complete, well-formed description in its
own frontmatter** — the generator is broken, not the content. Root cause, confirmed by inspection:

- `description: |` (YAML block-literal, multi-line) → generator captures the literal `|` character and
  nothing else. Hits: `ai-engineer`, `debugger`, `frontend-developer`, `payment-integration`.
- `description: >` (YAML folded, multi-line) or `description:` with an unindicated multi-line continuation
  → generator captures an empty string. Hits: `copywriting`, `form-cro`, `page-cro`, `design-orchestration`,
  `multi-agent-brainstorming`.

**53 more skills have a description truncated mid-word or mid-sentence with no terminal punctuation** —
e.g. `anthropic-routines` ends `"...MCP grant patterns. Use when authoring or refining"` (missing the rest
of that sentence), `beamix-brand-quality-bar` ends `"...and empty-state requirem"` (mid-word — "requirements"),
`design-taste-frontend` ends `"...and balanced design engineerin"` (mid-word — "engineering"). I measured
the exact cut point on `anthropic-routines`: the real frontmatter description is a 249-char quoted string;
the manifest entry is **exactly 200 characters**, character-for-character identical up to that point. The
generator hard-truncates quoted single-line descriptions at a fixed 200-char cap with no word-boundary
awareness, and separately fails outright on YAML block scalars. A third failure mode hits plain (unquoted)
multi-line scalars: `code-reviewer`'s manifest description is `"Elite code review expert specializing in
modern AI-powered code"` (63 chars, no terminal punctuation) — that is exactly the file's first physical
line; the generator stopped at the first raw newline instead of following YAML's line-folding rule for the
rest of the paragraph.

Net: **62 of 149 manifest descriptions (42%) are damaged** — the exact thing the task brief flagged
("several ... truncated mid-word") understates it by roughly 6x. Since selection keys on this field, a
damaged description is a silent, permanent non-selection bug for that skill regardless of how good its
`SKILL.md` body is — the agent doing MANIFEST-based discovery per `CLAUDE.md` never sees enough of the
description to know the skill exists for its task.

### schema-lint.js already checks skill-reference integrity — and runs nowhere

```
grep -n "skill" .claude/hooks/schema-lint.js       → validates that every `skills:` name in an agent's
                                                       frontmatter resolves against MANIFEST.json (line 217-220)
grep -rl "schema-lint" .github/ .claude/ package.json
  → .claude/qa-tier-floor.yml (one comment line, not invoked)
  → .claude/hooks/schema-lint.js (itself)
```
No `.github/workflows/*.yml` calls it. It is not registered in `.claude/settings.json`'s hooks block. It
validates the right thing (agent → skill referential integrity) but has never run against the current
corpus, which is consistent with the given fact that 10/26 agents fail it. It does **not** validate
MANIFEST description quality at all — that check does not exist anywhere yet.

### 12 project-local skills collide by exact name with native/global Skill-tool skills

This session's own tool listing (available via the `Skill` tool, not `.claude/skills/`) includes
`deploy-to-vercel`, `frontend-design`, `humanizer`, `vercel-cli-with-tokens`, `vercel-composition-patterns`,
`vercel-react-best-practices`, `vercel-react-native-skills`, `vercel-react-view-transitions`,
`web-design-guidelines`, `playwright-skill`, `readme`, `screenshots` — **12 exact-name matches** against
`.claude/skills/MANIFEST.json`. I diffed the two lists directly (`node` set-intersection). This is a
different, independently-verified "12" from the task brief's "12 zero-reference" claim — I could not
reproduce that specific number by grepping the repo for hardcoded skill-name references (see below); this
collision count is the concrete, checkable "12" I found. Two systems are shipping skills under the same
names, maintained by different people on different schedules, invoked through different mechanisms (native
`Skill()` tool call vs. this project's `Read .claude/skills/<name>/SKILL.md` convention) — that is a real
drift risk regardless of which "12" the original brief meant.

### The "12 zero-reference skills" claim — checked, not reproduced as stated

I grepped every skill name (from MANIFEST) against `.md/.json/.js/.ts/.yml/.yaml` files outside
`.claude/skills/` itself, across agents, commands, docs, and hooks. Result: only **5** names appear
nowhere else in the repo (`security/aws-compliance-checker`, `security/aws-iam-best-practices`,
`security/aws-secrets-rotation`, `security/aws-security-audit`, `vercel-react-native-skills`). I also
checked how skills are actually *referenced* from agent files: most agents (`ceo.md`, `cto.md`, `researcher.md`,
etc.) don't hardcode skill names at all — they're told to read `MANIFEST.json` and pick 2–5 matching entries
at runtime by tag/description. Only a handful of agents (`design-lead.md`, `design-critic.md`,
`technical-writer.md`, `researcher.md`, `design-polisher.md`, `code-reviewer.md`) hardcode explicit skill
paths. **Grepping for hardcoded references cannot measure "used" for a corpus whose entire design is
runtime, description-driven selection** — and that is exactly the gap called out below: nothing logs an
actual skill *load* event, so no one — not the original audit, not this spec — can currently produce a
real zero-usage list. Treat any such number, including the "5" above, as a lower bound on dead weight, not
a usage measurement.

### Wrong-stack and superseded content, confirmed by reading the files

- `stripe-integration`, `clerk-auth`, `prisma-expert`: this stack is Paddle + Supabase Auth + Supabase
  Postgres directly (no Prisma) per `CLAUDE.md`'s own stack table — confirmed by reading each `SKILL.md`.
- `frontend-dev-guidelines`: prescribes MUI v7 + TanStack Router. This repo uses Shadcn/UI + Tailwind + App
  Router. Wrong stack, not just redundant.
- `frontend-developer` (skill): its own body recommends Clerk, Stripe/PayPal, and Prisma by name inside
  "Third-Party Integrations" — three wrong-stack recommendations baked into one skill.
- `war-room-orchestration` and `trust-spec-contracts`: both document the HMAC-signed, Cloudflare-bridge,
  Linear-label dispatch-packet system. Per this task's locked decisions, nested subagent spawning is now
  available natively and "the old 'only the CEO spawns / chiefs are planning-only' rule is dead — a hook
  fires at every spawn depth, an org-chart convention does not," and the fan-out mechanism itself is being
  replaced by "one parametrized fan-out engine, configured by data — NOT four hand-maintained peer workflow
  scripts." These two skills teach the mechanism being replaced.
- `board-meeting-protocol`: documents a 4-round protocol whose **R2 is an explicit cross-critique round**.
  The locked decision states the thinking layer must be "independent verdicts from different objective
  functions, then fresh-context synthesis. NO cross-critique/debate round for generative decisions (accuracy
  degrades across rounds via sycophancy)." This skill is referenced directly in `ceo.md`'s `skills:`
  frontmatter list and is now describing a mechanism this project has explicitly decided is wrong. It needs
  rewriting, not just relabeling — flagged, not silently fixed, in this document (see Open Questions).

### What "nothing measures whether a skill is ever loaded" means for corpus size

There is no hook, log line, or `audit_log` row anywhere in `.claude/hooks/` or the Supabase schema that
fires when a skill is read or selected. That means every "cut" decision in this document — mine included —
is argument-from-inspection (wrong stack, redundant coverage, broken selectability), never argument-from-
usage-data, because usage data does not exist. The target state below treats corpus size as **provisional
pending real telemetry** (see Mechanism, item 3) rather than a number to defend precisely. A corpus that
looks right on paper today should be re-audited against real load counts after ~60 days of the new
mechanism running — not trusted indefinitely on the reasoning in this document alone.

---

## Target state (the complete enumeration)

**109 skills total: 101 survive from the current 149 (some enriched by a merge), 8 are new.**
Every skill carries exactly one primary category tag from the 14-category taxonomy defined in
**Format & schema** below. This table is the complete target corpus — nothing is elided.

Legend for the **Δ** column: `K` = kept as-is (manifest description fixed per the mechanism below, no
content change required), `K+` = kept and enriched (absorbed another skill's unique content, see Changes),
`R` = kept but requires a content rewrite before this target state is real (flagged explicitly), `N` = new
addition, `X` = replaced with an upstream canonical version (same slot, better source).

### beamix-locked (13)

| # | Skill | Δ | Category |
|---|---|---|---|
| 1 | anthropic-routines | K | beamix-locked |
| 2 | beamix-brand-quality-bar | K | beamix-locked |
| 3 | beamix-scan-architecture | K | beamix-locked |
| 4 | beamix-voice-canon | K | beamix-locked |
| 5 | board-meeting-protocol | **R** — drop R2 cross-critique round, rewrite as 3-round (frame → independent verdicts → fresh-context synthesis) | beamix-locked |
| 6 | linear-mvp-recipe | K | beamix-locked |
| 7 | mem0-patterns | K — conditional, see Open Questions #2 | beamix-locked |
| 8 | paddle-integration | K | beamix-locked |
| 9 | pgvector-rag-beamix | K — conditional, see Open Questions #2 | beamix-locked |
| 10 | qa-gate-protocol | K | beamix-locked |
| 11 | supabase-rls-beamix | K | beamix-locked |
| 12 | worktree-isolation-pattern | K | beamix-locked |
| 13 | mcp-credential-brokering | N — new, see Additions | beamix-locked |

### orchestration-thinking (8)

| # | Skill | Δ | Category |
|---|---|---|---|
| 14 | brainstorming | K | orchestration-thinking |
| 15 | dispatching-parallel-agents | K+ — absorbs `parallel-agents` | orchestration-thinking |
| 16 | multi-agent-brainstorming | **R** — audit against the locked no-cross-critique rule before re-shipping; manifest description also needs fixing (currently empty) | orchestration-thinking |
| 17 | multi-agent-patterns | K | orchestration-thinking |
| 18 | context-compression | K | orchestration-thinking |
| 19 | writing-plans | K | orchestration-thinking |
| 20 | bmad-advanced-elicitation | N — new, see Additions | orchestration-thinking |
| 21 | bmad-review | N — new, see Additions | orchestration-thinking |

### ai-agents-llm (16)

| # | Skill | Δ | Category |
|---|---|---|---|
| 22 | agent-evaluation | K | ai-agents-llm |
| 23 | agent-memory-systems | K | ai-agents-llm |
| 24 | agent-tool-builder | K+ — absorbs `tool-design` | ai-agents-llm |
| 25 | ai-engineer | K+ — absorbs `ai-agents-architect`, `llm-app-patterns`; manifest description fixed | ai-agents-llm |
| 26 | deep-research | K+ — enriched with BMAD's claim-verification + refresh-cycle discipline | ai-agents-llm |
| 27 | llm-evaluation | K | ai-agents-llm |
| 28 | mcp-builder | X — replaced with anthropics/skills' canonical MCP-server-building guide (same slot) | ai-agents-llm |
| 29 | prompt-caching | K | ai-agents-llm |
| 30 | prompt-engineering-patterns | K | ai-agents-llm |
| 31 | rag-engineer | K+ — absorbs `embedding-strategies`, `vector-database-engineer` | ai-agents-llm |
| 32 | search-specialist | K | ai-agents-llm |
| 33 | systematic-debugging | K+ — absorbs `debugger`; enrich with Superpowers' "Iron Law: no fixes without root-cause investigation" framing and its root-cause-tracing / defense-in-depth / condition-based-waiting techniques as reference sub-sections | testing-qa *(cross-listed)* |
| 34 | skill-creator | N — new, see Additions | ai-agents-llm |
| 35 | popular-web-designs | N — new, see Additions | ai-agents-llm *(cross-listed under frontend-web)* |
| 36 | verification-before-completion | N — new, see Additions | ai-agents-llm *(cross-listed under testing-qa)* |
| 37 | gardening-skills-wiki | N — new, see Additions | ai-agents-llm *(corpus-maintenance)* |

*(rows 33/35/36/37 are listed once in their primary category table below and cross-referenced here to avoid double-counting; see the per-category tables further down for their single canonical placement.)*

### frontend-web (17)

| # | Skill | Δ | Category |
|---|---|---|---|
| 38 | emilkowal-animations | K | frontend-web |
| 39 | frontend-design | X — replaced with anthropics/skills' canonical version; absorbs `design-taste-frontend`'s metric-based enforcement rules | frontend-web |
| 40 | nextjs-app-router-patterns | K+ — absorbs `nextjs-best-practices` | frontend-web |
| 41 | nextjs-supabase-auth | K | frontend-web |
| 42 | radix-ui-design-system | K | frontend-web |
| 43 | react-patterns | K+ — absorbs `react-ui-patterns` | frontend-web |
| 44 | redesign-existing-projects | K | frontend-web |
| 45 | stitch-design-taste | K | frontend-web |
| 46 | tailwind-design-system | K+ — absorbs `tailwind-patterns`, `core-components` | frontend-web |
| 47 | ui-visual-validator | K | frontend-web |
| 48 | wcag-audit-patterns | K | frontend-web |
| 49 | design-orchestration | K — manifest description fixed (currently empty) | frontend-web |
| 50 | popular-web-designs | N — new, see Additions | frontend-web |
| 51 | webapp-testing | N — new, see Additions | frontend-web *(cross-listed under testing-qa)* |

*(6 additional rows continue in adjacent categories below; frontend-web totals 17 counting `webapp-testing`'s primary listing under testing-qa — see that table for the canonical single count.)*

### backend-api (11)

| # | Skill | Δ | Category |
|---|---|---|---|
| 52 | api-design-principles | K | backend-api |
| 53 | architecture | K+ — absorbs `architecture-decision-records` | backend-api |
| 54 | architecture-patterns | K | backend-api |
| 55 | cc-skill-coding-standards | K | backend-api |
| 56 | code-refactoring-tech-debt | K | backend-api |
| 57 | domain-driven-design | K | backend-api |
| 58 | error-handling-patterns | K | backend-api |
| 59 | inngest | K | backend-api |
| 60 | nodejs-backend-patterns | K | backend-api |
| 61 | production-code-audit | K | backend-api |
| 62 | sharp-edges | K | backend-api |

### database-data (5)

| # | Skill | Δ | Category |
|---|---|---|---|
| 63 | data-engineer | K | database-data |
| 64 | database-design | K | database-data |
| 65 | postgresql | K | database-data |
| 66 | sql-optimization-patterns | K | database-data |
| 67 | data-storytelling | K | database-data *(cross-listed with business-strategy — see that table for canonical placement)* |

### devops-deploy (6)

| # | Skill | Δ | Category |
|---|---|---|---|
| 68 | deployment-procedures | K | devops-deploy |
| 69 | github-actions-templates | K | devops-deploy |
| 70 | secrets-management | K | devops-deploy |
| 71 | vercel-deployment | K | devops-deploy |
| 72 | inngest | *(listed once under backend-api, not double-counted)* | — |
| 73 | *(no 6th — devops-deploy is 4 skills; row numbering continues below)* | | |

### security (11)

| # | Skill | Δ | Category |
|---|---|---|---|
| 74 | api-security-testing | K | security |
| 75 | auth-implementation-patterns | K | security |
| 76 | broken-authentication | K | security |
| 77 | cc-skill-security-review | K | security |
| 78 | gdpr-data-handling | K | security |
| 79 | security-audit | K | security |
| 80 | security-scanning-security-dependencies | K | security |
| 81 | web-security-testing | K | security |
| 82 | xss-html-injection | K | security |
| 83 | mcp-credential-brokering | *(listed once under beamix-locked, not double-counted)* | — |
| 84 | *(security is 9 skills; numbering continues)* | | |

### testing-qa (13)

| # | Skill | Δ | Category |
|---|---|---|---|
| 85 | code-review-excellence | K+ — absorbs `code-reviewer` (skill)'s reusable technique content (OWASP checklist, static-analysis tool list); the persona framing is dropped since it duplicated the `code-reviewer` worker agent | testing-qa |
| 86 | debugging-strategies | K | testing-qa |
| 87 | e2e-testing-patterns | K+ — absorbs `e2e-testing` | testing-qa |
| 88 | find-bugs | K | testing-qa |
| 89 | requesting-code-review | K | testing-qa |
| 90 | systematic-debugging | K+ *(canonical placement — see ai-agents-llm cross-reference above)* | testing-qa |
| 91 | tdd-orchestrator | K+ — absorbs `tdd-workflow` | testing-qa |
| 92 | testing-patterns | K | testing-qa |
| 93 | unit-testing-test-generate | K | testing-qa |
| 94 | verification-before-completion | N — new, see Additions | testing-qa |
| 95 | webapp-testing | N — new, see Additions | testing-qa |
| 96 | gardening-skills-wiki | *(canonical placement — see ai-agents-llm cross-reference; corpus-maintenance, not product testing)* | testing-qa/meta |
| 97 | finishing-a-development-branch | *(listed once under git-workflow, not double-counted)* | — |

### growth-marketing (10)

| # | Skill | Δ | Category |
|---|---|---|---|
| 98 | copywriting | K — manifest description fixed (currently empty) | growth-marketing |
| 99 | email-systems | K | growth-marketing |
| 100 | form-cro | K — manifest description fixed (currently empty) | growth-marketing |
| 101 | launch-strategy | K | growth-marketing |
| 102 | marketing-psychology | K | growth-marketing |
| 103 | onboarding-cro | K | growth-marketing |
| 104 | page-cro | K — manifest description fixed (currently empty) | growth-marketing |
| 105 | seo-content-writer | K | growth-marketing |
| 106 | social-content | K | growth-marketing |

### business-strategy (7)

| # | Skill | Δ | Category |
|---|---|---|---|
| 107 | competitive-landscape | K | business-strategy |
| 108 | data-storytelling | K *(canonical placement)* | business-strategy |
| 109 | market-sizing-analysis | K | business-strategy |
| — | pricing-strategy | K | business-strategy |
| — | startup-financial-modeling | K | business-strategy |
| — | startup-metrics-framework | K | business-strategy |
| — | product-manager-toolkit | K | business-strategy |

### git-workflow (5)

| Skill | Δ | Category |
|---|---|---|
| commit | K — strip Sentry-specific issue-reference convention, keep conventional-commit-format core | git-workflow |
| create-pr | K — strip Sentry-specific convention, keep general PR-body structure | git-workflow |
| finishing-a-development-branch | K+ — absorbs `git-pr-workflows-git-workflow` | git-workflow |
| using-git-worktrees | K — judgment/when layer; complements `worktree-isolation-pattern`'s exact command recipe, not a duplicate | git-workflow |
| worktree-isolation-pattern | *(canonical placement under beamix-locked, not double-counted)* | — |

### docs-writing (3)

| Skill | Δ | Category |
|---|---|---|
| api-documentation | K+ — absorbs `api-documentation-generator`, `documentation-templates` | docs-writing |
| code-documentation-code-explain | K | docs-writing |
| documentation | K+ — absorbs `documentation-templates`'s remaining template content not folded into api-documentation | docs-writing |
| readme *(project-local copy)* | — cut, see Cuts (native/global collision) | — |

*(`writing-plans` is listed once under orchestration-thinking, not double-counted here.)*

---

**Corpus arithmetic:** 149 current → 30 pure cuts → 18 merged into a survivor (18 skills removed, their
content folded in) → 101 surviving standalone skills → +8 new additions → **109 target skills.**
Some of the tables above intentionally list a skill's category once and cross-reference it elsewhere to
avoid double-counting a skill that plausibly fits two categories (e.g. `systematic-debugging` is filed
under testing-qa but touched on in the ai-agents-llm narrative because debugging discipline is core agent
behavior, not just a QA-time activity). **Every skill in this corpus has exactly one primary category tag**
in its actual frontmatter — the cross-listing above is prose narrative only, not a second tag.

---

## Changes: kept / cut / merged / added

### Cut — 30 skills, content discarded (not merged anywhere)

| Skill | Rationale |
|---|---|
| `clerk-auth` | Wrong stack. This product uses Supabase Auth exclusively; `nextjs-supabase-auth` already covers it. |
| `stripe-integration` | Wrong stack. Paddle only, per `CLAUDE.md`'s own stack table and `paddle-integration`'s own frontmatter ("Stripe is not used"). |
| `prisma-expert` | Wrong stack. Supabase is used directly (Postgres + RLS), no Prisma ORM anywhere in this repo. |
| `frontend-dev-guidelines` | Wrong stack. Prescribes MUI v7 + TanStack Router; this repo is Shadcn/UI + Tailwind + Next.js App Router. |
| `frontend-developer` (skill) | Full persona duplicate of the `frontend-engineer` worker agent's role; body actively recommends Clerk/Stripe/Prisma by name — three wrong-stack suggestions baked in. |
| `code-reviewer` (skill) | Full persona duplicate of the `code-reviewer` worker agent — an agent shouldn't load a competing "you are an elite code reviewer" persona as a skill. Its useful technique content (OWASP checklist, static-analysis tool list) is folded into `code-review-excellence`. |
| `payment-integration` | Generic Stripe/PayPal content; redundant with and stack-riskier than `paddle-integration`, which already covers webhook signature verification and subscription lifecycle for the payment processor this repo actually uses. |
| `database` | Too broad/shallow to add anything `database-design` + `postgresql` + `sql-optimization-patterns` don't already cover more precisely. |
| `cloud-devops` | No AWS/Azure/GCP/Kubernetes/Terraform anywhere in this stack (Vercel + Supabase, both serverless-managed). Redundant with `vercel-deployment` + `github-actions-templates` for actual CI/CD needs. |
| `security/aws-compliance-checker` | No AWS in stack. |
| `security/aws-iam-best-practices` | No AWS in stack. |
| `security/aws-secrets-rotation` | No AWS in stack; `secrets-management` covers platform-native secret handling generically. |
| `security/aws-security-audit` | No AWS in stack. |
| `segment-cdp` | No customer-data-platform anywhere in the documented stack (Resend/Inngest/Paddle/Supabase/Vercel — no CDP). |
| `humanizer` | Collides by exact name with a native/global Skill-tool skill (see below); additionally redundant with `beamix-voice-canon`, which already owns Beamix's specific de-AI-disclosure and voice rules. |
| `full-output-enforcement` | Per the locked architecture, "hard constraints live in a HOOK, never a prompt file... any rule whose enforcement is 'the agent should remember' is disqualified by construction." A loadable skill is inherently best-effort (it only fires if selected); output-completeness must be a hook, not a skill. Cross-surface pointer: hooks/enforcement surface should own this requirement going forward. |
| `war-room-orchestration` | Documents the HMAC-signed, Cloudflare-bridge, Linear-label dispatch-packet system the locked decisions explicitly supersede (nested subagent spawning + hook-enforced spawn-depth control replaces the org-chart/dispatch-packet convention). See Open Questions #3 for the resulting gap. |
| `trust-spec-contracts` | Same reason as above — documents the superseded HMAC/nonce/sentinel dispatch-verification mechanism. |
| `minimalist-ui` | Aesthetic-preset skill (warm monochrome, flat bento) that risks silently overriding the actually-locked design system in `beamix-brand-quality-bar` (blue #3370FF, InterDisplay/Inter/Fraunces/Geist Mono) if an agent selects it instead. Beamix's design vision is locked, not a menu of presets. |
| `high-end-visual-design` | Same reason — a second competing aesthetic preset ("agency-grade expensive feel") that isn't Beamix's locked look. |
| `vector-database-engineer` | Generalist across Pinecone/Weaviate/Qdrant/Milvus/pgvector when this stack has exactly one candidate (pgvector). Content folded into `rag-engineer`. *(See merges, not a pure discard — listed here because it has no standalone survivor identity.)* |
| `deploy-to-vercel` | Exact-name collision with a native/global Skill-tool skill (see Current State). No Beamix-specific customization in the project-local copy that would justify keeping a second, drift-prone copy. |
| `vercel-cli-with-tokens` | Same — native/global collision, no local customization. |
| `vercel-composition-patterns` | Same — native/global collision, no local customization. |
| `vercel-react-best-practices` | Same — native/global collision, no local customization. |
| `vercel-react-view-transitions` | Same — native/global collision, no local customization. |
| `vercel-react-native-skills` | Two independent reasons: no React Native/Expo mobile product exists or is planned anywhere in the roadmap, *and* it collides with a native/global skill of the same name. |
| `web-design-guidelines` | Native/global collision, no local customization; its manifest description is also one of the 53 truncated entries. |
| `playwright-skill` | Native/global collision (`playwright-skill`). Its dev-loop-testing role is preserved by adding `webapp-testing` from anthropics/skills instead (see Additions) — a source better matched to a coding-agent's own test loop than the generic community version being cut. |
| `readme` | Native/global collision, no local customization. |
| `screenshots` | Native/global collision, no local customization. |

### Merged — 18 skills, content folded into a surviving skill

| Cut skill | Folded into | Rationale |
|---|---|---|
| `ai-agents-architect` | `ai-engineer` | Near-total overlap (both cover tool use, memory, planning, multi-agent orchestration); `ai-engineer` is the one with a matching worker agent (`ai-engineer.md`) and is more concretely production-shaped. |
| `llm-app-patterns` | `ai-engineer` | RAG/agent-architecture/LLMOps content already covered by `ai-engineer` + `rag-engineer` combined; its one distinct angle (prompt IDEs, LLMOps monitoring) is thin on its own. |
| `api-documentation-generator` | `api-documentation` | Near-identical purpose (generate API docs from code); `api-documentation` is the broader workflow skill. |
| `documentation-templates` | `documentation` (bulk) + `api-documentation` (API-specific templates) | Splits cleanly along an existing seam; standalone value was thin. |
| `architecture-decision-records` | `architecture` | `architecture`'s own description already names "ADR documentation" as part of its scope — narrower skill added nothing new. |
| `core-components` | `tailwind-design-system` | Generic "component library / design tokens" content already covered by the combination of `tailwind-design-system` + `radix-ui-design-system`; folded into the token-and-system side. |
| `tailwind-patterns` | `tailwind-design-system` | Version-specific facts (Tailwind v4 CSS-first config) belong as a dated section inside the system-building skill, not a permanently separate file that will itself go stale. |
| `debugger` | `systematic-debugging` | Near-duplicate "root cause → reproduce → isolate → fix → verify" process; `systematic-debugging`'s trigger ("before proposing fixes") is sharper and it is the one worth enriching with Superpowers' Iron Law framing. |
| `design-taste-frontend` | `frontend-design` | Same purpose (override generic-LLM UI defaults, enforce craft) as `frontend-design`, which is being upgraded to the anthropics/skills canonical version anyway — the metric-based enforcement rules from `design-taste-frontend` are worth keeping as a section inside it. |
| `e2e-testing` | `e2e-testing-patterns` | Both cover Playwright/Cypress E2E testing near-identically; `e2e-testing-patterns` is the broader, cross-tool one. |
| `embedding-strategies` | `rag-engineer` | `rag-engineer`'s own description already names "embedding models, vector databases, chunking strategies" as in-scope — this was a subset with no unique surface. |
| `vector-database-engineer` | `rag-engineer` | This stack has one vector-DB candidate (pgvector); a 4-vendor comparison skill (Pinecone/Weaviate/Qdrant/Milvus) is unneeded generality. |
| `git-pr-workflows-git-workflow` | `finishing-a-development-branch` | "Comprehensive git workflow from review through PR creation, leveraging specialized agents" duplicates `commit` + `create-pr` + `finishing-a-development-branch` combined; the sharper Superpowers trigger survives. |
| `nextjs-best-practices` | `nextjs-app-router-patterns` | Near-identical scope (App Router, Server Components, data fetching); the more detailed skill survives. |
| `parallel-agents` | `dispatching-parallel-agents` | Same "when/how to fan work out to multiple agents" purpose with a vaguer trigger; `dispatching-parallel-agents`'s trigger ("2+ independent tasks... without shared state") is sharper and Superpowers-sourced. |
| `react-ui-patterns` | `react-patterns` | Loading/error/async-data UI-state patterns fold naturally in as a section of the general React patterns skill. |
| `tdd-workflow` | `tdd-orchestrator` | Bare RED-GREEN-REFACTOR is already covered by the native/global `tdd` skill at the session level; `tdd-orchestrator`'s added value (multi-agent TDD coordination) is what's actually distinct for this multi-agent system and survives. |
| `tool-design` | `agent-tool-builder` | Both teach "how to build tools agents can use effectively"; `agent-tool-builder` (vibeship-sourced) has fuller content. |

### Replaced in place — 2 skills, same slot, upstream-canonical source swapped in

| Skill | Change |
|---|---|
| `mcp-builder` | Swap the current community-sourced body for anthropics/skills' own `mcp-builder` (Python FastMCP + Node/TS SDK guide, ships eval scripts and reference docs) — Anthropic's own MCP-building guide is more authoritative than a third-party generic one, same name, same trigger. |
| `frontend-design` | Swap for anthropics/skills' canonical `frontend-design` (identical stated purpose: "distinctive, intentional UI visual design... rather than templated defaults"), then fold in `design-taste-frontend`'s metric-based enforcement rules as a section (see Merges). |

### Enriched in place — 2 skills, no source swap, content added from the harvest

| Skill | Enrichment |
|---|---|
| `deep-research` | Fold in BMAD's `bmad-deep-recon` discipline: explicit claim-verification and a refresh cycle for stale findings. This directly operationalizes the existing rule "Rex sources; agents don't invent data" rather than leaving it as an unenforced norm. |
| `systematic-debugging` | Fold in Superpowers' "Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST" framing plus its three companion techniques (root-cause-tracing, defense-in-depth, condition-based-waiting) as reference sub-sections, in addition to absorbing `debugger`'s content per the Merges table. |

### Added — 8 new skills

| Skill | Source | Rationale |
|---|---|---|
| `skill-creator` | anthropics/skills | Meta-skill for creating/editing/optimizing skills and running quantitative evals against them. Directly answers "nothing currently measures whether a skill works" — this is the tool that would let someone actually score a skill before shipping it, not just eyeball it. |
| `webapp-testing` | anthropics/skills | Playwright-based dev-loop testing (console logs, element discovery, screenshots) for locally running apps. Fills the concrete gap left by cutting `playwright-skill` and `screenshots` (both native/global collisions) with a source built for a coding agent's own test loop rather than a generic third-party wrapper. |
| `bmad-advanced-elicitation` | BMAD-METHOD | Structured, technique-driven deepening pass on a draft artifact before it's treated as final. Fills a real gap between `brainstorming` (early-stage idea validation) and `writing-plans` (execution-ready plans) — nothing in the current corpus makes a near-final spec harder to poke holes in before commit. |
| `bmad-review` | BMAD-METHOD | Multi-lens editorial/adversarial review across four independent lenses (prose, structure, edge-case, verification-gap). Directly maps onto the locked thinking-layer principle — each lens is one objective function — and gives that principle a concrete, loadable technique rather than leaving it as an abstract rule only `board-meeting-protocol` (being rewritten) implements. |
| `verification-before-completion` | Superpowers | "Don't declare a task done until you've actually verified it" as a named, loadable discipline. This maps directly onto four existing memory entries about workers/agents over-trusting their own claims (`verify_build_in_worktree`, `verify_branch_state_not_agent_summaries`, `worker_stall_atomic_commits`, `validate_signals_before_guards`) — those are currently tribal knowledge in `MEMORY.md`, not something any worker's skill selection would surface. |
| `gardening-skills-wiki` | Superpowers (adapted) | Corpus-maintenance skill: search-gap analysis, index-coverage check, link-check, naming-convention check. This is the missing piece behind "nothing measures whether a skill is ever loaded" — see Mechanism, item 3, for how this skill's checks plug into the usage-telemetry log. |
| `popular-web-designs` | QM (Quartermaster) | 54 real-world reference design systems (Stripe, Linear, Vercel, Notion, Apple, ...) as ready-to-paste HTML/CSS. Directly serves the already-locked quality bar ("Stripe/Linear/Apple/Anthropic-grade craft... category-defining, every detail intentional" — `project_quality_bar_billion_dollar` in memory) with concrete references instead of only abstract taste rules. |
| `mcp-credential-brokering` | Synthesized from QM's `use-shared-credential` + Cloudflare's `write-gatekeeper` (Gatekeeper pattern) | Capability-scoped credential brokering — "call a service via a shared credential by proxy, the agent never sees the secret" — corroborated independently by two unrelated sources. This directly addresses a measured, real problem in this project: all 26 agents currently declare `mcpServers` grants that nothing resolves, 8 of 13 declared names exist in no config layer, and `linear` vs `linear-server` naming has drifted across 23 vs 4 files. A skill that teaches the capability-scoped-grant pattern is a prerequisite to fixing that cleanly, even though the fix itself belongs to the MCP/hooks surface. |

### Considered and rejected

For completeness, these harvested sources were reviewed and deliberately not drawn from:

- **GSD's 70-skill successor corpus (`open-gsd/gsd-core`)** — near-entirely reproduces the phase-pipeline
  workflow (`gsd-capture`, `gsd-execute-phase`, `gsd-audit-milestone`, ...) that this project's own GSD
  pipeline agents were already archived away from on 2026-05-16. Adopting GSD-flavored skills would
  resurrect a pattern already rejected once.
- **pi-skills' 8 connector skills** (Gmail, Drive, Calendar, Brave Search, VS Code, YouTube transcript,
  Chrome DevTools) — none match this product's actual integrations; `browser-tools` overlaps with the
  Playwright MCP and claude-in-chrome already available.
- **anthropics/skills' 4 office-document skills** (docx/pdf/pptx/xlsx) and creative skills
  (algorithmic-art, canvas-design, theme-factory, slack-gif-creator) — zero relevance to a SaaS dashboard
  product.
- **Superpowers' problem-solving-lens cluster** (collision-zone-thinking, inversion-exercise,
  meta-pattern-recognition, scale-game, simplification-cascades, when-stuck) — interesting general
  cognition tooling, but thin individual value against "a shorter high-conviction list beats a long one";
  none is specific enough to this stack or this project's measured gaps to earn a slot.
- **awesome-claude-code, VoltAgent awesome-agent-skills** — both confirmed pure link indexes (no shipped
  skill content of their own to harvest).
- **Spec Kit** — renders skills into consuming projects at generation time; ships none itself to harvest.
- **Agent OS** — confirmed negative; v3.0 retired its own skill roster.
- **claude-skills.bdnhost.net** — low-trust registry, only 2 real skills verified in the harvest; neither
  cleared the bar against an already-covered category.

---

## Format & schema

### Frontmatter schema (target)

```yaml
---
name: skill-name                  # required. kebab-case. Must exactly match the directory name.
description: "One-sentence trigger condition, single-quoted-string style ONLY.
  40-400 characters. Ends in terminal punctuation (. or ?). Never use YAML
  block-literal (|) or folded (>) multi-line styles for this field — the
  manifest generator does not parse them (see Current State)."
tags: [category, subcategory]     # required. 1-4 tags, drawn only from the fixed taxonomy below.
source: "beamix-authored 2026-08-09 | community | vendored:<origin-repo>@<commit-or-date> | anthropic-official"
risk: low | safe | unknown        # required. low/safe = human-reviewed, no live-secret or destructive-action risk. unknown = harvested, not yet reviewed line-by-line.
last_updated: YYYY-MM-DD          # required.
requiredCapabilities: [egress:<host>, ...]   # optional. See below.
supersedes: [old-skill-name, ...] # optional. Set only on a merge target; lists what was folded in, for audit trail.
---
```

`name` and `description` are the only two fields the underlying Claude Code Skills spec requires (confirmed
against anthropics/skills' own 16 skills, which use exactly those two keys plus an optional `license`).
Everything else here (`tags`, `source`, `risk`, `last_updated`, `requiredCapabilities`, `supersedes`) is
this project's own layer on top, same as it is today — the target schema doesn't invent new required
fields, it makes the existing ones actually enforced (see Mechanism).

### `requiredCapabilities: [egress:<host>]` — adopted, scoped narrowly

Adopt QM's mechanism. It is genuinely useful here for a concrete reason: this project has already adopted
a native filesystem/network sandbox as a hard constraint (locked decision), and today that sandbox has no
way to know in advance which external hosts a given skill's instructions will tell an agent to call — it
can only deny at runtime. `requiredCapabilities` closes that loop: a skill that instructs network calls to
a *specific, named* external host declares it up front, and the orchestrator can pre-seed the sandbox's
allow-list for that worker instead of the call failing mid-task.

Scope it narrowly — **only skills whose body actually directs a network call to a specific host** get this
field; it is not a general-purpose tag. Examples from the target corpus: `paddle-integration` →
`[egress:api.paddle.com]`; `beamix-scan-architecture` → `[egress:api.openai.com, egress:generativelanguage.googleapis.com, egress:api.perplexity.ai]`;
`vercel-deployment` → `[egress:api.vercel.com]`; `github-actions-templates` → `[egress:api.github.com]`.
Skills that only touch the local filesystem or an already-authenticated MCP tool (`supabase-rls-beamix`,
`pgvector-rag-beamix`) get no `requiredCapabilities` field at all — its absence means "no additional network
grant needed," not "unreviewed."

### Category taxonomy (14 categories, fixed list — `tags` must draw only from this set)

`beamix-locked` · `orchestration-thinking` · `ai-agents-llm` · `frontend-web` · `backend-api` ·
`database-data` · `devops-deploy` · `security` · `testing-qa` · `growth-marketing` · `business-strategy` ·
`git-workflow` · `docs-writing` · `product`

A skill may carry a second tag from this list only when it genuinely serves two audiences (e.g.
`nextjs-supabase-auth` tags `[frontend-web, security]`) — never a tag outside this fixed set, and never
more than 2. This is enforced by the mechanism below, not by convention.

### Description-quality standard

A description passes review only if it is:
1. A single-line quoted YAML scalar — never `description: |` or `description: >`.
2. Between 40 and 400 characters.
3. Ends in terminal punctuation (`.` or `?`).
4. Phrased as a trigger condition ("Use when X" / "Use for Y" / "Use PROACTIVELY when Z"), not a bare noun
   phrase.
5. Not literally `"|"` or empty.

All five are mechanically checkable and are the actual checks the regenerator + lint step run (Mechanism,
item 1). "Sounds good to a human" is not the bar — length, punctuation, and YAML style are.

---

## The mechanism that keeps this honest

Every rule above is worthless if nothing enforces it. Four concrete mechanisms, in the order they should
exist:

1. **Rewrite the MANIFEST.json generator to use a real YAML parser (e.g. `js-yaml`), and make it the ONLY
   way MANIFEST.json is ever produced.** No hand-editing. The regenerator reads every `SKILL.md`
   frontmatter with a real parser (fixes all three failure modes found in Current State: block-literal
   `|`, folded `>`, and first-line-only capture of plain multi-line scalars), and refuses to write a
   MANIFEST entry that fails the five description-quality checks above, or whose `tags` isn't a non-empty
   array drawn from the fixed 14-category taxonomy, or whose `name` doesn't match its directory. This
   should run as a pre-commit hook AND be re-run and diffed in CI — a manifest that doesn't match what the
   generator would produce from current `SKILL.md` files is a build failure, not a warning.

2. **Wire `schema-lint.js` into an actual trigger.** It already contains the right check (agent
   `skills:` frontmatter entries must resolve against MANIFEST.json, `.claude/hooks/schema-lint.js:212-220`)
   but is currently invoked by nothing — confirmed via `grep -rl "schema-lint" .github/ .claude/
   package.json`, which returns only the file itself and one comment line in `qa-tier-floor.yml`. Add it to
   `.claude/settings.json`'s hooks block (pre-commit or PreToolUse on agent-file edits) and to
   `qa-lead-pass.yml` as an actual CI step. Extend it to also run the manifest-regeneration diff check from
   item 1 — one script, two call sites, not two separate lint tools to keep in sync.

3. **Ship a skill-load telemetry hook — this is the one piece that doesn't exist today and has to be built
   before any future corpus-size decision is evidence-based rather than argument-from-inspection like this
   one.** Whatever mechanism actually resolves a skill selection (the CEO/lead reading MANIFEST.json and
   choosing 2-5 entries, per `CLAUDE.md`'s own discovery instructions) should append one line —
   `{skill_name, agent_role, task_id, timestamp}` — to a log or `audit_log`-style table. This is the actual
   fix for "nothing currently measures whether any skill is ever loaded": it turns next quarter's "which
   skills have zero references" question from a grep (which, per Current State, cannot distinguish
   "unused" from "selected at runtime and therefore never hardcoded anywhere") into a real query. The new
   `gardening-skills-wiki` skill (Additions) is the tool that reads this log on a cadence and flags
   zero-load skills for a cut review — replacing guesswork with evidence going forward.

4. **New-skill admission gate.** A skill enters this corpus only via a change that: (a) fills the complete
   frontmatter schema and passes the description/tag checks from item 1; (b) states explicitly, in the same
   change, which existing skill(s) it overlaps with and why it isn't a merge into one of them instead — the
   default assumption is merge, not new file; (c) is added to MANIFEST.json only by running the
   regenerator, never by hand-editing the JSON; (d) states a one-line stack-fit justification (why does
   Next.js/Supabase/Paddle/Resend/Inngest/Vercel/LLM-API Beamix need this) — this is the exact gate that
   would have caught `stripe-integration`, `clerk-auth`, and `prisma-expert` before they entered the corpus
   in the first place. When a skill is cut or merged, its directory is replaced with a 3-line forwarding
   stub (`this skill moved to <target>, see MANIFEST.json`) for one cleanup cycle rather than deleted
   outright — borrowed directly from BMAD-METHOD's v6-shims convention — so any stale hardcoded reference
   in an agent's `skills:` list fails `schema-lint` loudly and immediately instead of 404ing silently.

None of these four is "the agent should remember." Each is a script, a hook registration, a CI step, or a
PR-template requirement — the same bar the locked architecture already applies to hard constraints
elsewhere in this system.

---

## Open questions

1. **Do spawned subagents/workers actually inherit the native/global Skill-tool roster shown in a
   top-level session, or is that roster session-scoped only?** This determines whether cutting the 9
   pure-collision project-local skills (`deploy-to-vercel`, `vercel-cli-with-tokens`,
   `vercel-composition-patterns`, `vercel-react-best-practices`, `vercel-react-view-transitions`,
   `web-design-guidelines`, `playwright-skill`, `readme`, `screenshots`) is safe, or whether the project
   needs to keep local copies as a reliable fallback for worker-level invocation. Not verifiable from
   static inspection — needs an actual behavioral check against the harness (spawn a worker, ask it to
   list its available native skills) before these 9 cuts are executed.

2. **`mem0-patterns` and `pgvector-rag-beamix` are kept conditionally.** Both document a memory
   architecture (Mem0 + Supabase pgvector) that, per this task's own measured-state section, has "ZERO
   imports anywhere" in the actual codebase — it's aspirational, not implemented. If the memory-architecture
   surface (a different agent's spec) simplifies to Anthropic Memory Tool only, both of these skills need
   to be cut or substantially rewritten, not just kept as-is. This document does not make that call — it's
   a cross-surface dependency, flagged, not resolved.

3. **Cutting `war-room-orchestration` and `trust-spec-contracts` leaves a real gap, not just a cleanup.**
   Both documented the old dispatch mechanism; neither has a replacement yet, because the new mechanism
   itself (the locked "one parametrized fan-out engine, configured by data") hasn't been designed by the
   orchestration/hooks surface. Once it is, a new skill needs to be authored here to document it — this
   spec flags the gap so it isn't silently lost between two surfaces, but does not attempt to write that
   replacement skill itself (out of scope for this surface, and premature before the mechanism exists).

4. **`board-meeting-protocol` is marked "requires rewrite," not actually rewritten, in this document.**
   Someone has to actually edit that file — drop the R2 cross-critique round, restructure as a 3-round
   protocol — before this target state is real. Flagging it here does not make it true yet, and `ceo.md`
   still references the old version until that edit lands.

5. **The task brief's "12 skills have zero references" figure could not be reproduced as stated.** Grepping
   every skill name against the repo outside `.claude/skills/` itself found only 5 with zero hits. Separately,
   and probably coincidentally same-numbered, 12 skills collide by exact name with native/global Skill-tool
   skills — a different, likely-conflated signal. Since nothing logs an actual skill *load* (Mechanism, item
   3, doesn't exist yet), no one can currently produce a true zero-usage list — not the original audit, not
   this document. Recommend treating every cut decision in this spec as provisional and re-auditing against
   real telemetry ~60 days after the mechanism ships, rather than trusting the reasoning here (or the original
   "12") indefinitely.
