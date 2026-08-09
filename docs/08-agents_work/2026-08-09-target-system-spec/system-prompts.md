# System prompts — target spec

**Surface:** every place instruction text reaches a model, and how duplication across those places is
eliminated. Planning only — nothing here is built until Adam says build.

---

## Current state (measured, with the commands you ran)

Every number below was re-measured in this session, not copied from the brief. Where my number differs from
the brief's, both are given.

### Inventory of prompt-bearing surfaces (all of them)

| # | Surface | Location | Count | Lines | Read by |
|---|---|---|---|---|---|
| 1 | Global project memory | `~/CLAUDE.md` | 1 file | 127 | Every session, every project (~10), always, first |
| 2 | Global commands | `~/.claude/commands/*.md` | 10 files | — | Any project without a same-named project command |
| 3 | Global agents | `~/.claude/agents/*.md` | 40 files | — | Any project without a same-named project agent |
| 4 | Project memory | `CLAUDE.md` (Beamix root) | 1 file | 402 | Every Beamix session, always |
| 5 | Routing doc | `AGENTS.md` (Beamix root) | 1 file | 110 | On-demand read by CEO |
| 6 | Top-level agent defs | `.claude/agents/*.md` | 26 files | 7,012 | `Task(subagent_type=X)` — resolved by filename |
| 7 | Launch seeds | `.claude/agents/_seeds/*.md` | 9 files | ~150 total | 1 of 9 (`ceo.md`) — read by `bin/beamix` only |
| 8 | War-room (Routines + Task templates) | `.claude/agents/war-room/*.md` | 26 files (incl. `INDEX.md`) | 3,338 | cron/webhook (Routines) or Task (workers, personas) |
| 9 | Skill bodies | `.claude/skills/*/SKILL.md` | 149 dirs (146 on disk — see below) | 35,382 | On-demand `Read` after MANIFEST match |
| 10 | Skill bundled resources | `.claude/skills/*/**` (non-SKILL.md) | 456 files | — | On-demand, only if SKILL.md references them |
| 11 | Workflow-embedded prompts | `.claude/workflows/*.js` | 6 scripts | 1,243 (code+prompts mixed) | `Workflow({name:...})` — string literals inside JS |
| 12 | Slash commands (project) | `.claude/commands/*.md` | 13 files | — | Typed by Adam or CEO |
| 13 | CEO tmux injection | `/Users/adamks/bin/beamix` (`CEO_PREAMBLE`, `inject_ceo_prompt`) | 1 script | ~150 | War-room launcher only |
| 14 | Cursor rule (different tool) | `~/.cursor/rules/gsa-startup-kit.mdc` | 1 file | — | Cursor sessions only, out of scope for this spec |

Fourteen distinct places instruction text reaches a model or is assembled for one. Six of them (1, 2, 3, 7, 8,
11) are either measurably stale, partially dead, or invisible to the one linter that exists.

### Commands run and what they proved

```
ls .claude/agents/ | wc -l                          → 26 top-level .md (matches brief)
wc -l .claude/agents/*.md | tail -1                  → 7,012 total (matches brief exactly)
node .claude/hooks/schema-lint.js                    → 16 pass · 10 fail · 5 warnings
```
All 10 failures share **one root cause**: `maxTurns: 50` in frontmatter against the schema's `[5,30]` range
(`ai-engineer`, `backend-engineer`, `data-engineer`, `database-engineer`, `design-polisher`,
`devops-engineer`, `frontend-engineer`, `product-designer`, `researcher`, `supabase-cleaner`). This is a
single mechanical typo class, not ten unrelated defects — evidence the lint has never actually gated a merge
(it would have caught this in one PR).

```
diff .../gsa-core/core/.claude/agents/_seeds/ceo.md  .../Beamix/.claude/agents/_seeds/ceo.md
```
→ exactly 3 lines differ, each substituting `{{PROJECT_NAME}}` → `Beamix`, byte-identical otherwise (both
files are 285 lines... actually the seed is 32 lines; `ceo.md` itself is 285 lines in both, 3-line diff).
**Confirms the brief's claim precisely** — token-substitution generation already exists and already works for
at least this file. `cto.md`/`cpo.md`/`cmo.md`/`cbo.md`/`research-lead.md`/`design-lead.md` diff at 8-40
lines against the same gsa-core source — meaning those six have accumulated hand-edits beyond the 2-token
template, i.e. real drift the sync tool would either overwrite or refuse to touch, depending on mode.

```
find .claude/core -type f          → does not exist
find . -iname gsa-project.json     → does not exist (project root or worktree)
```
**`gsa-sync.js` has never been run against Beamix, ever.** The mature sync tool (`bin/gsa-sync.js` in
`/Users/adamks/VibeCoding/gsa-core`, real dry-run/apply/diff modes, sha256 idempotency, git-clean gate,
scoped tar.gz backups, manifest-driven glob classification) exists and has been exercised — 16 backup
tarballs dated 2026-07-27 in `~/.gsa-backups/`, inspected and confirmed to belong to a **different** fleet
project (contains `impeccable-*` agents, matching the Adamos personal-OS project in memory, not Beamix's
roster). The mechanism is proven elsewhere in the fleet and simply was never pointed at this repo.

```
node -e "... m.skills.length ..."          → 149
grep totalSkills MANIFEST.json             → 145
ls -d .claude/skills/*/ | wc -l            → 146
grep "117 curated skills" CLAUDE.md        → present
```
**Four-way disagreement, confirmed**, not three: `CLAUDE.md` says 117, `MANIFEST.json`'s own `totalSkills`
field says 145, its `skills` array actually has 149 entries, and the directory count on disk is 146. No two
of these four numbers agree.

```
node -e "... regex-scan for descriptions ending mid-word/mid-sentence ..."
→ 48 of 149 manifest descriptions look truncated (heuristic; hand-verified a sample of 10, all genuine cuts,
  e.g. "beamix-brand-quality-bar" ends "...spacing, animation budget, and empty-state requirem",
  "anthropic-routines" ends "...MCP grant patterns. Use when authoring or refining")
```
Roughly a third of the live skill corpus has a description that ends before the sentence does. Since
progressive disclosure selects on `description`, this is a silent matching failure at ~32% of the corpus, not
2-3 cosmetic cuts.

```
grep -rl mcp__linear__ .claude/agents/*.md | wc -l          → 17
grep -rl mcp__linear-server__ . --include=*.md | ...        → .claude/agents/war-room/{eod-sync,monday-standup,
                                                                morning-digest,friday-retro}.md (4) +
                                                                docs/07-history/runbooks/linear-api-break.md
```
The split is real but not where the brief located it: `mcp__linear__` is used by 17 top-level agent files;
`mcp__linear-server__` is used by exactly the 4 war-room Routines with Linear-comment delivery, plus one
runbook doc. Two names for the same integration, split cleanly along the top-level/war-room boundary — worse
than random drift, because it looks intentional and isn't.

```
cat .claude/settings.json                    → hooks.SessionStart calls gsa-check-update.js (only)
                                                 hooks.PreToolUse calls pre-tool-use.sh
                                                 schema-lint.js appears in NO hook, in NO .github/workflows/*.yml
head .claude/hooks/gsa-check-update.js        → checks `npm view gsa-startup-kit version` and a
                                                 `.claude/get-shit-done/VERSION` file — the OLD (2026-02-)
                                                 "get-shit-done" npm-package updater, unrelated to gsa-core's
                                                 sync mechanism. Runs every session, checks nothing that matters.
head .claude/hooks/stop.sh                    → "SOFT-WARN ONLY — never blocks", "EXIT CODE: always 0"
```
Confirms the brief: `schema-lint.js` is wired into nothing. Additionally: the one hook that *does* run on
every `SessionStart` is a dead updater for a package that predates the current sync mechanism by one full
generation of tooling (`get-shit-done` npm package → `gsa-core`/`gsa-sync.js` → nothing wired into Beamix at
all). `.claude/gsa-file-manifest.json` is a third, independent artifact — a per-file sha256 manifest, but for
that same 2026-02-26 `get-shit-done` package, not for gsa-core. Three generations of "sync tooling," zero of
them connected to Beamix today.

```
find .claude/agents/_seeds -type f | wc -l    → 9
grep -rn "_seeds" bin/beamix .claude/ AGENTS.md CLAUDE.md
```
→ only `_seeds/ceo.md` is referenced anywhere (`bin/beamix`, `CEO_SEED_FILE`). The other 8
(`cbo cco cmo cpo cto design-lead qa-lead research-lead`) are read by nothing. Confirmed: 8 of 9 dead.
`.claude/agents/_paste-prompts/` does not exist (`ls` errors).

```
grep -n Iris ~/CLAUDE.md                                        → line 10, "How to start any session: Iris, [what I need]"
grep -rn Iris AGENTS.md .claude/agents/*.md                      → zero matches, anywhere in Beamix
grep -n "Iris\|Atlas\|Scout" ~/.claude/commands/*.md             → daily.md→Iris, debug.md→Atlas, ship.md→Scout
ls ~/.claude/agents/ | wc -l                                     → 40 files
```
`~/CLAUDE.md` names a persona ("Iris") as the entry point for every session in every project. No file
anywhere in Beamix's roster is named `iris`. The global commands directory (`~/.claude/commands/`, 10 files,
loaded into every project that doesn't define its own same-named command) references *different* stale
personas by name — `Iris`, `Atlas`, `Scout` — that also appear nowhere in `~/CLAUDE.md`'s own persona list
consistently (its team table names Iris/Atlas/Morgan/Nova/Axiom/Lyra/Scout/Nexus/Spark, 9 names, for "12
agents"). None of that reconciles internally. Separately, `~/.claude/agents/` (40 files: `build-lead`,
`business-lead`, `codebase-mapper`, `debugger`, `executor`, `growth-lead`, `integration-checker`,
`nyquist-auditor`, `phase-researcher`, `plan-checker`, `planner`, `product-lead`, `project-researcher`,
`research-synthesizer`, `roadmapper`, `verifier`, 10 `seo-*` files, plus 12 names that overlap Beamix's own
roster) is a live copy of **exactly** the GSD-pipeline roster Beamix's own `CLAUDE.md` documents as "archived
2026-05-16" to `.archive/agents/gsd-pipeline-2026-05-16/` — the archive happened locally in this repo; the
identical agent definitions are still live at the global layer, and are the effective default for any of the
other ~9 fleet projects that don't shadow them with a project-local file of the same name. Eleven names
overlap exactly between the global 40-file roster and Beamix's 26 (`ai-engineer`, `ceo`, `code-reviewer`,
`database-engineer`, `design-lead`, `qa-lead`, `research-lead`, `researcher`, `security-engineer`,
`technical-writer`, `test-engineer`) — those 11 are shadowed here (project-level wins) but live everywhere
else in the fleet.

```
cat .claude/agents/war-room/INDEX.md                → "4 Persona templates" documented
ls .claude/agents/war-room/persona-*.md | wc -l     → 7
```
INDEX.md (dated 2026-05-12, status "in progress") documents 4 personas (`visionary`, `strategist`,
`architect`, `aria`). Three more exist on disk with full, populated frontmatter and bodies
(`persona-broad-adversary`, `persona-customer-voice`, `persona-risk-modeler`) and are referenced nowhere in
the index that's supposed to be their table of contents. The same class of drift (index vs. filesystem) that
afflicts `MANIFEST.json` recurs one directory over, undetected because `schema-lint.js` explicitly excludes
`war-room/` rather than validating it against the (documented but never formally written) Routine/persona
schema variant.

```
grep -n "07b §4" .claude/hooks/schema-lint.js       → comment cites "07b §4" as authorizing the war-room exclusion
grep -n "Routines (Layer 4)" 07b-AGENT-TEMPLATE.md  → "DEFERRED per Adam 2026-05-16"
```
The citation is inaccurate: 07b §4's Routine section is explicitly deferred/unspecified, not a green light.
There is no written formal schema for what actually shipped at `.claude/agents/war-room/`.

```
grep -n "prompt\|dimension" .claude/workflows/qa.js
```
Confirms `qa.js` builds reviewer/verifier prompts as JS template literals inside the script (`dimPrompt(d)`,
`verifyPrompt(f,i)`), not as separate markdown files read at runtime. This is a third prompt-authoring
discipline (JS string literals) alongside markdown+YAML agent files and markdown skill bodies, and it is
invisible to `schema-lint.js`, `MANIFEST.json`, and every other file-classification mechanism inventoried
above.

```
grep -c "^### " .claude/memory/DECISIONS.md         → 58 entries (cap: 50) — matches brief
wc -l .claude/memory/DECISIONS.md                    → 935 lines
find .claude/memory/sessions -type f | wc -l          → 4
find docs/08-agents_work/sessions -type f | wc -l     → 142
find .claude/memory/specs -type d                     → does not exist
```
All confirmed exactly as the brief stated (memory-surface facts, included here because `DECISIONS.md` and
session files are themselves read into the CEO's context every session — they are part of the prompt
surface even though they're not agent definitions).

---

## Target state (the complete enumeration)

### The layering rule

One rule decides which of five places a piece of instruction text lives in:

> **Ask: at what scope is this true, and by what mechanism does it stay true?**
> If the answer to "by what mechanism does it stay true" is "someone remembers to edit N files," the text is
> in the wrong place, independent of which of the five layers it's currently in.

| Layer | Scope: true for... | Mechanism that keeps it true | Lives at |
|---|---|---|---|
| **A. gsa-core invariant** | Every GSA project, always, verbatim except a 2-token substitution | `gsa-sync.js --apply`, sha256-compared, git-clean-gated | `gsa-core/core/.claude/AGENT-SYSTEM.md`, `gsa-core/core/AGENTS.md`, `gsa-core/core/.claude/agents/*.md`, `gsa-core/core/.claude/commands/*.md`, `gsa-core/core/.claude/hooks/*`, `gsa-core/core/.claude/workflows/*` |
| **B. Project residue** | True for Beamix only: stack, pricing, brand, MCP inventory, model-ID lock date, project state, vindication triggers | Hand-edited; `gsa-sync` is hard-forbidden from touching it (`fit.neverTouch`) | `CLAUDE.md` (Beamix root) |
| **C. Agent/role file** | True for one role's behavior across every task it ever does | Generated frontmatter + template body (layer A) + a project-specific "residue" block (layer B pattern, one per role) | `.claude/agents/<role>.md` |
| **D. Skill** | True for one *capability* regardless of which role invokes it | Authored once, discovered by tag, versioned independently of any agent file | `.claude/skills/<name>/SKILL.md` (+ bundled resources) |
| **E. Launch seed** | True only for bootstrapping ONE out-of-band entry point (not reachable via `Task`) | 1:1 with entry points, generated from the matching role file's frontmatter `description` + a fixed 6-line skeleton | `.claude/agents/_seeds/<role>.md` |

**The seed rule, stated precisely:** a seed file exists if and only if an agent must be bootstrapped through a
channel that cannot `Read` a file before the model starts responding — i.e., a literal keystroke/paste
injection into a fresh terminal (tmux `send-keys`), not a `Task(subagent_type=X)` call (which resolves `X`
against `.claude/agents/X.md` directly, no seed needed) and not a Routine provisioned in claude.ai (which
takes the whole Routine `.md` as its system prompt directly — also no separate seed needed). **Today exactly
one entry point meets that bar: the tmux-launched CEO in `bin/beamix`.** Every other agent, worker, C-suite
chief, validator, war-room worker template, and war-room persona is either `Task`-spawned or
Routine-provisioned. Target state: **one seed file, `_seeds/ceo.md`. The other 8 are deleted** (see Cut, below).

### A. gsa-core invariant layer — the complete content list

`gsa-core/core/` becomes the **only place** cross-project instruction text is authored. Six categories,
matching (and correcting) `gsa-manifest.json`'s existing schema:

1. **`.claude/AGENT-SYSTEM.md`** (template, `{{PROJECT_NAME}}` token) — the exact content currently
   duplicated by hand into every project's `CLAUDE.md`: Team org chart, skills-discovery protocol, memory
   file table + caps, Models table, QA gate table, Context Budget hard limits, Cost Optimization rules,
   Layer Contract (CEO/C-suite/Workers DO / DO NOT tables), Rules (All Agents) 1-8, Git Worktree Protocol,
   Agent Identity (colors/naming), Documentation Gate, Bash Allowlist. **Updated for the 2026-08-09 locked
   decisions:** QA gate table gains the advisory lane + provenance axis (component 1 of the rebuild plan);
   the Layer Contract's "subagents cannot spawn subagents" line is deleted (nested spawning is confirmed live
   at depth 2 — the hook, not the doc, is now the enforcement point); T1-T5 topology language is removed
   entirely (superseded by "depth ships in shadow mode," component 8).
2. **`AGENTS.md`** (replace, no tokens — the full routing table is generic by construction) — already
   byte-identical between gsa-core and Beamix today; stays that way structurally by staying `replace` mode.
3. **`.claude/agents/*.md`** (template, 2 tokens) — every role file whose *behavior* is fleet-generic:
   `ceo`, `cto`, `cpo`, `cmo`, `cbo`, `qa-lead`, `research-lead`, `design-lead`, `code-reviewer`,
   `backend-engineer`, `frontend-engineer`, `database-engineer`, `ai-engineer`, `devops-engineer`,
   `data-engineer`, `security-engineer`, `test-engineer`, `researcher`, `technical-writer`,
   `supabase-cleaner`, `adversary-engineer`. **21 of Beamix's 26.** The remaining 5
   (`cco`, `design-critic`, `product-designer`, `design-polisher`, `qa-engineer`) are `fit`-owned —
   see Layer B below — because they encode Beamix-specific brand/voice/scan-architecture judgment that
   isn't generic across the fleet (gsa-manifest.json already carves 3 of these 5 out today; extend the carve
   to all 5, and add `qa-engineer` which the current manifest misses).
4. **`.claude/commands/*.md`** (replace) — the 10 generic commands (`build fix design review daily plan ship
   audit research color` — `name` folds into `color`'s pattern) that exist today at both layers; Beamix's
   3 Beamix-only commands (`board-meeting`, and any future project-only command) stay project-`fit`.
5. **`.claude/hooks/*`** (replace) — `pre-tool-use.sh`, `post-edit-typecheck.sh`, `stop.sh`, `schema-lint.js`.
   `gsa-check-update.js` and `gsa-context-monitor.js`/`gsa-statusline.js` are retired (see Cut).
6. **`.claude/workflows/*`** (replace) — the one parametrized fan-out engine (rebuild-plan component 6) and
   `qa.js`, now unified so both are configs of the same engine, plus `lib/`.

**Global (`~/`) becomes a sync target too, not a hand-maintained fossil:** `gsa-sync.js` already documents
`--allow-nongit` for exactly this case. `~/.claude/agents/*.md` and `~/.claude/commands/*.md` receive the
SAME `--apply` from gsa-core (categories 3-4 above, same manifest, same token substitution with
`PROJECT_NAME` resolved to a fleet-default placeholder like `"this project"` since there's no single project
at that scope). This replaces the 40-file GSD-pipeline fossil and the 10 Iris/Atlas/Scout commands with the
current, correct roster — so a brand-new fleet project with no local overrides yet still gets a coherent
default instead of a roster three generations out of date.

### B. Project residue — what stays hand-edited in Beamix's own `CLAUDE.md`

Everything gsa-sync is hard-forbidden from touching (`fit.neverTouch`), which after extraction to
`AGENT-SYSTEM.md` is genuinely project-specific and nothing else:

- Repo description, monorepo layout, key paths
- Stack table (Next.js/Supabase/Paddle/Resend/Inngest/Vercel/model providers/Mem0)
- Pricing table
- Brand & design pointers (`BRAND_GUIDELINES.md`, `PRODUCT_DESIGN_SYSTEM.md`)
- MCP table (project-specific: which servers, who uses them, availability fallback rule)
- Model IDs **as currently locked for this project** (`claude-opus-4-7` etc.) — the model *tier table*
  (which tier does what) is invariant and lives in A; the specific IDs are B, because they get bumped
  per-project on independent schedules (Opus 4.8 bump happened to Beamix's memory before this project's
  `CLAUDE.md` even reflects it in some places — a project-file problem, correctly scoped there)
- Project State section (current focus, active sprint, blockers)
- Time-boxed claims: "Vindication triggers active until 2026-06-15" — these MUST be project-local because
  they expire; a project-local file is the only place a stale timestamp is cheap to notice and fix, since
  nothing else depends on it
- 5 (of 21+5=26) Beamix-specific agent files: `cco`, `design-critic`, `product-designer`, `design-polisher`,
  `qa-engineer`
- Beamix-specific skills (brand-quality-bar, voice-canon, scan-architecture, pgvector-rag-*, supabase-rls-*
  — already correctly `fit`-carved in gsa-manifest.json today)
- `.claude/memory/**`, `.claude/qa-tier-floor.yml#rules`, `gsa-project.json` — never core, always project

**Target line count for Beamix's `CLAUDE.md`: ~120-150 lines**, down from 402. The ~250 lines being removed
are the exact content that duplicates `AGENT-SYSTEM.md` word-for-word today (Team, Skills Library discovery
protocol, Memory table, Models tier table, QA gate table, Context Budget, Cost Optimization, Layer Contract,
Rules, Worktree Protocol, Identity/Naming, Bash Allowlist — all present in both files today, confirmed by
direct comparison against gsa-core's `AGENT-SYSTEM.md` content above).

### C. Agent-file target shape

One template (07b-AGENT-TEMPLATE.md already specifies this; the target state is *wiring it up*, not
rewriting it):

**Frontmatter (mandatory, all 26 + war-room):**
`name, description, model, tools, maxTurns, color, isolation, mcpServers, skills, risk_tier_default,
escalates_to, escalates_when, return_contract, pre_flight_reads`. Persona variant adds
`round_protocol_position, voice_lens, decision_type_routing`. Routine variant adds `schedule, budget_usd,
delivery, schedule_window, pre_flight_skip` (formally written up for the first time — see Format & schema).

**Body (8 sections, mandatory in this order):**
`## Identity & mission` → `## Workflow position` → `## Key distinctions` → `## Pre-flight reads` →
`## Operating procedure` → one of {`## QA gate hand-off` | `## Output evidence` | `## Output format`} →
`## Return contract` → `## Anti-patterns`.

**Length targets (already in schema-lint.js as warnings; target state promotes them to a checked, reported
metric — not a hard fail, see the honest caveat below):**

| Role class | Target | Current worst offender |
|---|---|---|
| Worker | 200-300 lines | `product-designer.md` 328, `supabase-cleaner.md` 305 |
| C-suite / Lead | 300-450 lines | `cbo.md` 321, `cpo.md` 307 |
| CEO | 400-550 lines | `ceo.md` 285 (currently *under* target, not over) |
| Persona (war-room) | 150-250 lines | 7 files, 79-187 lines — all in range already |
| Routine (war-room) | ~120-220 lines | 12 files, 82-212 lines — in range already |

**Design-lead.md at 436 lines is the single largest top-level file** and the target-state review should
specifically decide whether its extra ~130 lines over the Lead target are load-bearing (unique Pencil/Stitch
MCP workflow detail) or copy-pasted boilerplate shared with `cpo.md`/`cmo.md` — this is exactly the kind of
call the honest caveat says nobody can currently make from line count alone.

**What's load-bearing vs. ceremony, by section (best current evidence, not proof — see caveat):**
- **Load-bearing, keep verbatim per role:** `Identity & mission` (the one place role-specific judgment
  lives), the role-specific rows of `Operating procedure`, `Anti-patterns` items that reference this role's
  actual observed failure modes (e.g. CEO's "DO NOT paste raw agent output" — traceable to a real
  synthesis-quality problem, not boilerplate)
- **Ceremony, candidate for generation from a shared template:** the QA-gate paragraph (byte-identical
  intent across 20+ files today), the worktree-creation bash block (byte-identical across every
  `isolation: worktree` worker), the Return-contract JSON skeleton (same shape, different field values —
  a template with substitution, not prose to hand-author 26 times), the Bash-allowlist reminder line

### D. Skill body target shape

No format change — `anthropics/skills` confirms the same `SKILL.md` (YAML frontmatter + markdown body,
progressive disclosure via bundled resources) is already the right format; zero migration needed. Three
concrete additions, each sourced from the 12-source harvest:

1. **`requiredCapabilities` frontmatter field** (from QM): `requiredCapabilities: [egress:<host>, ...]` —
   optional array declaring network/credential scope a skill needs. Feeds `pre-tool-use.sh`'s provenance
   check (rebuild-plan component 1) directly: a skill invocation that tries to reach a host outside its
   declared `egress:` set is exactly the class of drift the hard-gate on untrusted-provenance writes exists
   to catch.
2. **Description-quality gate**: every description must (a) end on a complete sentence — mechanically
   checkable (`/[.!?]"?$/` after trimming), catching the 48/149 truncation class found above — and (b) stay
   under a fixed character budget tuned to what the harness actually shows before truncating in the
   selection UI (measure this empirically, don't guess a number).
3. **Mandatory-invocation pattern where warranted** (from Superpowers' `using-superpowers` SessionStart
   hook): NOT adopted repo-wide (Beamix's on-demand-only discovery model is a deliberate, documented choice
   and correct for a 149-skill corpus vs. Superpowers' 14) but the *mechanism* — a SessionStart hook that
   forces one specific skill's read before the first response — is the right shape for exactly one thing in
   this system: making the QA-gate skill (`qa-gate-protocol`) non-optional reading for any agent whose
   `risk_tier_default` is `full` or `irreversible`, closing the gap where an agent could simply skip loading
   it.

`.claude/skills/MANIFEST.json`'s `totalSkills` field is deleted, not fixed — it's a cached count of a live
`skills` array and will re-drift the moment a skill is added or removed by hand. The array's own `.length` is
the only number that should ever be reported; nothing should hard-code a count anywhere (this is the same
"proxy that can't stay true" failure as the line-count targets above, in miniature).

### E. Launch seeds — the complete target inventory

**One file: `.claude/agents/_seeds/ceo.md`.** Generated, not hand-written: gsa-core's template-mode sync
already regenerates its 3 project-name tokens; extend the same generation to derive the seed's *content* from
`ceo.md`'s own frontmatter `description` field plus a fixed 6-line skeleton (role name, "you ARE this agent,"
pointer to the full file, one-line mission, identity command, deliverable-gate reminder) — so the seed can
never state a mission/role that contradicts the file it points at, because it's generated from that file.

**Deleted: `_seeds/{cbo,cco,cmo,cpo,cto,design-lead,qa-lead,research-lead}.md`** — 8 files, ~1.3KB each, read
by zero scripts. No launcher spawns a standalone CTO/CPO/CMO/CBO/QA-Lead/Research-Lead/Design-Lead tmux pane;
every one of them is `Task`-spawned in-session by the CEO, which reads `.claude/agents/<role>.md` directly.
A role reachable via `Task` needs no seed, by the rule above.

**`.claude/agents/_paste-prompts/`** — referenced in memory (`project_war_room_paste_prompt_source.md`) as a
planned refactor target for `bin/beamix`'s inline `CEO_ANSI_COLORS`/preamble logic, but never created. Target
state: does not get created as a *separate* directory — `_seeds/` already is that directory (one file,
generated). The memory note's refactor intent is satisfied by making `_seeds/ceo.md` generation-derived
(above), not by adding a second parallel directory for the same one file.

### F. War-room (thinking layer + Routines) — target shape

Two genuinely different things live here today under one folder; the target state keeps them together
(co-location is correct — they share the frontmatter format and the deploy unit) but gives each its own
formally written schema variant in 07b (currently: personas partially documented via `aria.md`'s worked
example; Routines explicitly marked "DEFERRED," never written up despite 12 of them shipping):

1. **12 Routines** — cron/webhook-triggered, provisioned whole into claude.ai as their own system prompt (no
   separate seed needed — see rule above). Target: `07b-AGENT-TEMPLATE.md` §4 Routines section gets written
   for real (schedule/budget_usd/delivery/schedule_window/pre_flight_skip semantics, the `spec_trust: true`
   trust-boundary rule already used ad hoc), and `schema-lint.js` gains a `--mode=routine` that validates
   against it instead of skipping the directory outright.
2. **6 worker templates + 7 personas (not 4 — `INDEX.md` is stale, see Current state)** — `Task`-spawned,
   need no seed. `INDEX.md` is regenerated from the directory listing + each file's frontmatter (name,
   role from `description`, model, `round_protocol_position`) rather than hand-maintained prose that can
   drift from the files it's supposed to index — the same generation fix applied to `MANIFEST.json`'s count
   field, applied here to a table.
3. **The 7 personas become the thinking layer's config data**, per rebuild-plan component 6: the one
   parametrized fan-out engine reads `round_protocol_position` / `voice_lens` / `decision_type_routing` /
   `model` straight from these files (or a generated JSON index of them) instead of the engine hard-coding a
   perspective list. Before that wiring happens, Adam needs to rule on the 3 undocumented personas
   (`broad-adversary`, `customer-voice`, `risk-modeler`) — canon or abandoned drafts — because an engine
   reading "whatever is in the directory" will silently pick up whichever answer is left unresolved.

### G. Workflow-embedded prompts (qa.js and the new one-engine file)

Target: these stop being ad hoc JS template literals with no schema coverage. The generation engine
(rebuild-plan component 6) takes its prompt fragments from **the same per-role/per-dimension markdown
convention as everything else** — a `dimensions:` or `personas:` list in a config data file, each entry
pointing at a short markdown fragment (identity + lens + return-schema, the persona-file shape minus the
full 8-section body) — rather than a `function dimPrompt(d) { return \`...\`}` string builder. This closes
the exact gap rebuild-plan component 7c calls out: a mechanical drift check between the tested logic
(`gate-logic.mjs`) and the copy the running script actually inlines is only checkable if the inlined copy is
a *reference to* a file, not a second hand-typed copy of one.

### H. The generation mechanism (answers "how is duplication structurally impossible")

`gsa-sync.js` already proves the concept end-to-end for one file (`_seeds/ceo.md`, 3-token diff, confirmed
above) and is a real, working, previously-exercised tool (not vaporware — 16 backup tarballs from a real
`--apply` run on a sibling project). The target state is **using it, not replacing it**:

1. **Author once, in `gsa-core/core/`.** Every file in layer A above.
2. **`gsa-project.json` created for Beamix** (currently missing — this alone is why sync has never run
   here), declaring `PROJECT_NAME=Beamix`, `PROJECT_DIR`, and the fit-carve additions (5 agent files, not 3).
3. **`gsa-sync.js --project <beamix-path> --dry-run --diff`** run first, by a human, reviewed. Then
   **`--apply --yes`** — git-clean gate refuses if the worktree is dirty; scoped backup to `~/.gsa-backups/`
   first; sha256 comparison skips files already identical; unresolved `{{TOKEN}}` placeholders block the
   apply outright.
4. **Re-run on a schedule or on gsa-core PR merge**, fanned out to all ~10 fleet projects via `--all` against
   `fleet.json` (a file that needs to be created — currently only referenced in the tool's own `--help` text,
   not found on disk in this session's search).
5. **Divergence is a signal, not silently overwritten**: `--include-skills`-style opt-in-only overwrite
   behavior (already implemented for the `sharedSkills` category) is the general policy — a project file
   that has diverged from its core template is reported as `skip-diverged`, not clobbered, forcing a human
   decision at the point of divergence instead of a silent loss either way.

This is a strictly better answer than "write a new templating system": the tool already handles the hard
parts (git safety, backups, idempotent hashing, fit/core precedence) that a fresh script would have to
re-earn.

---

## Changes: kept / cut / merged / added

**Kept**
- `SKILL.md` format (progressive disclosure, YAML+markdown) — `anthropics/skills` confirms it's already the
  industry-standard shape; no migration needed.
- The 8-mandatory-section agent-file template in `07b-AGENT-TEMPLATE.md` — already correct, just unenforced.
- `gsa-sync.js` and `gsa-manifest.json` — already correct and already proven; the gap is that Beamix was
  never onboarded to them, not that they need rework.
- On-demand skill discovery (MANIFEST tag filter, 3-5/2-3 load budget) — right call for a 149-skill corpus;
  Superpowers' mandatory-load pattern is adopted narrowly (one skill, QA-gate) not repo-wide.
- Co-location of Routines/workers/personas under `.claude/agents/war-room/` — the shared frontmatter format
  and deploy unit make this the right home; the fix is schema coverage, not relocation.

**Cut**
- `~/CLAUDE.md`'s project-specific content (Iris persona, "12-agent," "426+ skills," stack defaults that
  duplicate what each project's own `CLAUDE.md` states correctly) — retired to a ≤15-line bootstrap stub.
  *Rationale:* a global file that asserts project facts cannot stay true across ~10 independently-evolving
  projects; it is structurally the same failure as `MANIFEST.json`'s `totalSkills`, at a larger blast radius.
- `~/.claude/agents/` 40-file GSD-pipeline fossil and `~/.claude/commands/` Iris/Atlas/Scout set — replaced
  by sync from gsa-core (same content class as project-level, non-git `--apply`). *Rationale:* this is
  currently the live default roster for any fleet project without local overrides; leaving it means new
  projects bootstrap from a 3-generations-stale corpus by default.
- `.claude/hooks/gsa-check-update.js` — checks an npm package (`gsa-startup-kit`) that predates the current
  sync mechanism, runs every session, verifies nothing that affects this system. *Rationale:* dead weight
  masquerading as a live check; its replacement is `gsa-sync.js --dry-run` run deliberately, not a
  background poll of an unrelated registry.
- `.claude/gsa-file-manifest.json` — sha256 manifest for the same obsolete `get-shit-done` package.
  *Rationale:* superseded by `gsa-manifest.json` + `gsa-sync.js`'s own idempotency hashing; keeping both
  invites exactly the "which is canonical" confusion already afflicting `.claude/memory/sessions/` vs.
  `docs/08-agents_work/sessions/`.
- `_seeds/{cbo,cco,cmo,cpo,cto,design-lead,qa-lead,research-lead}.md` (8 of 9 seed files) — *Rationale:*
  read by nothing; no launcher spawns these roles standalone.
- `MANIFEST.json`'s `totalSkills` field — *Rationale:* a cached count of a live array is a second source of
  truth that can only ever be stale or redundant; report `skills.length` at read time instead.
- `schema-lint.js`'s war-room exclusion, and its inaccurate "acceptable per 07b §4" citation (07b §4 says
  Routines are deferred, not exempted). *Rationale:* the exclusion is why the INDEX.md/filesystem persona
  drift (4 documented vs. 7 real) went undetected for an unknown period.

**Merged**
- `AGENT-SYSTEM.md` (gsa-core, cross-project invariant) absorbs the ~250 lines currently duplicated
  byte-for-byte inside Beamix's own `CLAUDE.md` (Team, Skills discovery, Memory table, Models tier table, QA
  gate table, Context Budget, Cost Optimization, Layer Contract, Rules 1-8, Worktree Protocol,
  Identity/Naming, Documentation Gate, Bash Allowlist). Beamix's `CLAUDE.md` keeps only the residue that is
  actually project-specific. *Rationale:* this is the textbook case the layering rule exists for — one
  mechanism (sync), one place edits happen (gsa-core), everywhere else reads a generated copy.
- `qa.js`'s inlined `dimPrompt`/`verifyPrompt` string builders and the thinking-layer's persona files merge
  into one config-driven fan-out engine (rebuild-plan component 6), so the same schema-lint-style validation
  covers both instead of one being markdown-checked and the other being invisible JS.
- `bin/beamix`'s `CEO_PREAMBLE` sourcing logic stays exactly where it is (it already correctly externalizes
  to `_seeds/ceo.md` rather than hard-coding text in the launcher script) — no change needed here, it's
  already the target shape; only the *content* of `_seeds/ceo.md` becomes generation-derived rather than
  hand-written.

**Added**
- `requiredCapabilities: [egress:<host>, ...]` optional skill-frontmatter field (from QM), feeding the
  provenance-axis hard-gate.
- Description-completeness lint (mechanical: description must end on `.`/`!`/`?`), catching the 48/149
  truncated-description class.
- `07b-AGENT-TEMPLATE.md` §4 Routine schema, written for real instead of left "DEFERRED" while 12 Routines
  ship against an unwritten spec.
- `schema-lint.js --mode=routine` / `--mode=persona` covering `.claude/agents/war-room/*` with the extended
  field sets, instead of a blanket exclusion.
- `gsa-project.json` for Beamix (currently the literal reason sync has never run here).
- `fleet.json` (referenced in `gsa-sync.js --help` but not found on disk) — needed for the `--all` fan-out
  the cross-project ROI thesis depends on.
- A mechanical drift check between `gate-logic.mjs` (unit-tested) and whatever `qa.js` actually executes,
  once the config-driven engine replaces the inlined string builders (rebuild-plan component 7c).

---

## Format & schema

### Agent-file frontmatter (canonical — from `07b-AGENT-TEMPLATE.md`, enforced by `schema-lint.js`)

```yaml
name: <kebab-case, must equal filename minus .md>
description: |                      # one sentence, CEO routes on this — quality is load-bearing
  When to use this agent. Be specific. Avoid: <what NOT to use it for>.
model: claude-opus-4-7 | claude-sonnet-4-6 | claude-haiku-4-5
tools: [Read, Write, Edit, Bash, Glob, Grep, Task, ...]   # workers: no Task
maxTurns: 5-30                       # safety ceiling, not a target; C-suite typically 20-30
color: <named color from AGENT-SYSTEM.md's color table>
isolation: worktree | none
mcpServers: [<names resolvable against .claude/mcp-manifest.json — new, see below>]
skills: [<names, each verified present in MANIFEST.json>]
risk_tier_default: trivial | lite | full | irreversible
escalates_to: <agent-name> | adam           # required for all non-persona roles
escalates_when: |
  - condition 1
  - condition 2
return_contract:
  required_fields: [status, agent, summary, decisions_made, blockers, ...]
  optional_fields: [branch, worktree, files_changed, commits, qa_verdict, session_file]
pre_flight_reads: [<3-5 specific paths, not "read everything">]
```

**Persona extension** (`.claude/agents/war-room/persona-*.md`, additive on top of the above):
```yaml
round_protocol_position: r0 | r1 | r2 | synthesizer
voice_lens: <2-3 word description>
decision_type_routing: vendor | strategic
```

**Routine extension** (`.claude/agents/war-room/*.md` excluding `persona-*`/`parallel-*`, additive — newly
formalized by this spec, not previously written into 07b):
```yaml
schedule: <cron>
budget_usd: <number, hard cap per fire>
delivery: telegram | linear-comment | both
schedule_window: W1 | W2 | W3 | W4 | event
pre_flight_skip: true            # only valid alongside a trigger payload asserting spec_trust: true
```

### `.claude/mcp-manifest.json` (new — mirrors `MANIFEST.json`'s pattern for skills)

A generated, single source of truth for which MCP server names actually resolve in this project's config
layers (`~/.claude.json` global servers, `.mcp.json` project servers, and whatever else Claude Code
consults). `schema-lint.js` cross-checks every agent file's `mcpServers:` list against it, exactly the way it
already cross-checks `skills:` against `MANIFEST.json` — same pattern, new target field. This is what turns
"8 of 13 declared MCP names resolve nowhere" from a silent grant nobody notices into a build failure at the
point the bad grant is written.

### gsa-manifest.json category shape (already correct — target state extends the `list`/`neverTouch` entries)

```json
"core": {
  "<category>": {
    "mode": "template" | "replace" | "merge" | "special",
    "glob": "<path glob>",
    "tokens": { "{{TOKEN}}": "ProjectJsonKey" },   // template mode only
    "coreKeys": [...],                              // merge mode only
    "fitSection": "<key>",                           // merge mode, partial-file only
    "list": [...]                                    // sharedSkills-style explicit allowlist
  }
},
"fit": { "neverTouch": ["<glob>", ...] }
```

Target-state additions to `fit.neverTouch`: `.claude/agents/qa-engineer.md` (currently missing from the
5-file carve despite being as Beamix-specific as the other 4).

---

## The mechanism that keeps this honest

Every mechanism below is a named hook, CI check, linter rule, or data file. None of them is "the agent
should remember."

1. **`schema-lint.js`, wired into `.github/workflows/qa-lead-pass.yml` as a required check**, extended with:
   `--mode=routine`/`--mode=persona` for `war-room/`; `mcpServers:` cross-checked against the new
   `.claude/mcp-manifest.json`; description-completeness regex; the existing length-target warnings promoted
   from silent to CI-annotated (still non-blocking — see the caveat). **This is the compilation step**:
   a declared capability that doesn't resolve fails the build, the same principle already proven for
   `skills:` vs. `MANIFEST.json`.
2. **`gsa-sync.js --dry-run --diff`, run in CI on every gsa-core PR, against every project in `fleet.json`**
   (once that file exists). A gsa-core change that would fail to apply cleanly to any fleet project (dirty
   git state aside — that's inherent) fails the gsa-core PR before merge, not after eight weeks of silent
   drift like the Beamix/gsa-core `cpo.md`/`cmo.md`/`cbo.md` divergence found in this session.
3. **The `--include-skills`-style skip-diverged behavior, generalized to every core category**: any file a
   project has hand-edited beyond its template tokens is reported, never silently overwritten and never
   silently ignored. Divergence becomes a queue Adam clears deliberately, not a fact nobody notices until a
   session like this one greps for it.
4. **`.claude/mcp-manifest.json`, generated by a small script that reads every actual MCP config layer** and
   is the only thing `schema-lint.js` trusts for `mcpServers:` resolution — same role `MANIFEST.json` already
   plays for `skills:`.
5. **Run log v1** (rebuild-plan component 5, `stop.sh` appends one JSONL line per run including
   `thinking_layer_invoked` and `structured_output_emitted`) is the mechanism that lets the honest caveat
   below eventually get an answer instead of staying a permanent shrug — see below.
6. **The mechanical drift check between `gate-logic.mjs` and the config-driven engine's executed prompts**
   (rebuild-plan component 7c) — `node --test` stays green only if the executed copy matches the tested
   source, closing the class of bug where qa.js's `meta.description` claims "3 independent adversarial
   verifiers" while the code passes `model: 'sonnet'` to all three.
7. **`gsa-project.json`'s mere existence** is itself a mechanical gate: `gsa-sync.js --apply` already refuses
   to run against a project that lacks one. Creating it for Beamix isn't just an enabling step, it's the
   thing that makes "was sync ever run here" a yes/no fact checkable by `ls`, not a claim in a doc.

### On the honest caveat — measuring whether the trim is quality-neutral

Nobody can currently say which prose in the 7,012 lines does real cognitive work. The target design doesn't
solve that — it makes it measurable for the first time, via three things landing together:

- **The run log (mechanism 5)** ties every run to which agent file (and, once versioned via gsa-sync's
  sha256, which *exact version* of that file) produced it, plus `qa_verdict` and whether the run needed a
  re-brief (a `BLOCKED`-then-retried run is a proxy for "the prompt didn't give the agent what it needed").
- **`gsa-sync`'s sha256-tracked file versions** mean a length-reducing edit to a role file is a discrete,
  identifiable event, not a blur — "everything before commit X was long-form, everything after was trimmed"
  becomes a queryable boundary in the run log.
- **The sequencing choice already locked in the rebuild plan** — the agent-file trim is step 10, last,
  specifically so the run log exists first and can show whether `qa_verdict` rates or re-brief rates change
  across that boundary. This spec inherits that sequencing rather than re-litigating it: trimming without a
  log to measure against would make the caveat permanent instead of temporary.

This is still a proxy, not a controlled experiment — there's no A/B, just a before/after on one system with
everything else changing simultaneously. The honest position is that this design converts "unmeasurable" into
"measurable with confounds," not into "measured."

---

## Open questions

1. **The three undocumented personas.** `broad-adversary`, `customer-voice`, `risk-modeler` exist fully
   written on disk but appear in no index and are referenced by no board-meeting protocol doc found in this
   session. Before the thinking-layer engine reads the war-room directory as its config source, Adam needs
   to rule canon-or-delete on these three — an engine that silently includes whatever files happen to exist
   will inherit this ambiguity as behavior.
2. **Whether `~/.claude` should be an automatic sync target or a manual one-time `--apply`.** The tool
   supports `--allow-nongit --apply` today; automating it (e.g., via the same schedule as fleet-wide project
   sync) changes every session across every project the moment it runs, with no per-project git-clean gate
   to catch a bad push before it's live everywhere. This spec recommends manual, deliberate `--apply` runs
   at this layer specifically because of that blast radius, but doesn't resolve how often "deliberate" means
   Adam actually does it.
3. **The `design-lead.md` outlier (436 lines against a 300-450 target ceiling).** Flagged above as a
   candidate for the load-bearing-vs-ceremony review, but this session didn't do that review — it would
   require reading the file against `cpo.md`/`cmo.md` paragraph-by-paragraph, which is exactly the kind of
   work the honest caveat says can't be done from line count alone.
4. **`fleet.json` doesn't exist yet.** `gsa-sync.js --help` references it as the input to `--all`, but no
   file by that name was found anywhere searched in this session. Someone needs to enumerate the actual ~10
   fleet projects and their paths before cross-project sync (mechanism 2 above) can run at all — this spec
   assumes that inventory work happens but doesn't do it here.
5. **Whether the description-length budget (Format & schema, skill body section) should be a fixed character
   count or should be measured empirically against what the harness actually renders before truncating in
   whatever UI surfaces skill descriptions during selection.** This spec deliberately doesn't guess a number.
