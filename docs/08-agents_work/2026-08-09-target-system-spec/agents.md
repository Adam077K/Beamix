# Agent roster — target spec

Surface: **Agent roster**, part of the clean-sheet agent-system re-architecture. This is planning only — nothing here is built until Adam says build.

---

## Current state (measured, with the commands you ran)

All commands run from `/Users/adamks/VibeCoding/Beamix/.worktrees/ceo-1-1786220343`.

**Roster inventory.**
```
ls .claude/agents/*.md | wc -l                    → 26
find .claude/agents -type d                       → .claude/agents/war-room, .claude/agents/_seeds
wc -l .claude/agents/*.md | sort -n                → 214–435 lines/file, 7012 total, avg 270
```
The 26: `adversary-engineer, ai-engineer, backend-engineer, cbo, cco, ceo, cmo, code-reviewer, cpo, cto, data-engineer, database-engineer, design-critic, design-lead, design-polisher, devops-engineer, frontend-engineer, product-designer, qa-engineer, qa-lead, research-lead, researcher, security-engineer, supabase-cleaner, technical-writer, test-engineer`.

**Schema-lint, actually run.**
```
node .claude/hooks/schema-lint.js   → Summary: 16 pass · 10 fail · 5 warnings
```
All 10 failures are the identical cause: `maxTurns=50 outside range [5, 30]` — `ai-engineer, backend-engineer, data-engineer, database-engineer, design-polisher, devops-engineer, frontend-engineer, product-designer, researcher, supabase-cleaner`. All 5 warnings are the identical cause: `isolation=worktree but body lacks MAIN_REPO worktree-creation block` — `code-reviewer, cto, technical-writer`. Both are uniform, single-root-cause failures, not 15 unrelated bugs — the fix is one schema change plus one template fix, not ten hand-edits. `schema-lint.js` itself is wired into nothing: `grep -rl schema-lint .github .claude/settings.json package.json turbo.json` → zero hits. It runs correctly when invoked by hand and is invoked by nothing.

**MCP grants vs. what actually resolves.** Three real config layers exist for this repo: project `.mcp.json` (`supabase` only), the user-level global `~/.claude.json` `mcpServers` block (`stitch, refero, miro, runpod, playwright, higgsfield, mem0, pencil`), and a project-scoped entry inside `~/.claude.json`'s `projects["/Users/adamks/VibeCoding/Beamix"]` (`framer-mcp, refero, playwright`). Union of all three = 10 real, resolvable server names: `supabase, stitch, refero, miro, runpod, playwright, higgsfield, mem0, pencil, framer-mcp`.

Agent files declare 13 unique `mcpServers` names (counted from `mcpServers:` blocks across all 26 files): `supabase`(9), `linear`(9), `github`(8), `playwright`(6), `refero`(5), `ide`(5), `context7`(5), `pencil`(3), `mem0`(3), `stitch`(2), `framer-mcp`(2), `segment-cdp`(1), `pgvector`(1).

Cross-referencing: 7 of 13 resolve (`supabase, playwright, refero, pencil, mem0, stitch, framer-mcp`). 6 of 13 resolve in **no** config layer: `linear, github, context7, ide, segment-cdp, pgvector`. Of those six, `pgvector` and `segment-cdp` aren't MCP servers at all — they're skill names (`pgvector-rag-beamix`, and a skill literally named `segment-cdp`) miscopied into an `mcpServers:` block. `ide` is Claude Code's built-in IDE-diagnostics connector — auto-present only inside a connected IDE session, never a config-file entry. `linear`, `github`, `context7` are genuine gaps: `linear` is the single most-declared MCP name in the roster (9 agents, and `grep -rl mcp__linear__` hits 23 files) yet is **not documented anywhere in CLAUDE.md's own MCP table** and has never been added to any config layer. `context7` **is** documented in CLAUDE.md's MCP table ("researcher... try BEFORE WebSearch") but likewise resolves nowhere. `github` is declared by 8 agents but the project's own Bash allowlist already grants unrestricted `gh *` — a dedicated MCP is redundant with a tool already available.

Naming split confirmed: `grep -rl mcp__linear__ .claude .agent | wc -l` → 23; `grep -rl mcp__linear-server__ .claude .agent | wc -l` → 4. Two names for one integration, majority/minority split, not a 50/50 ambiguity.

**Model IDs.** `grep -h "^model:" .claude/agents/*.md | sort | uniq -c` → `claude-haiku-4-5`(2), `claude-opus-4-7`(8), `claude-sonnet-4-6`(16). These match CLAUDE.md's own "Models (May 2026 — locked Q3 2026-05-07)" table exactly — the agent files are internally consistent with the doc that specced them. The staleness is external: per `project_opus_4_8_available` (memory, 2026-05-28) Opus 4.8 was already available three months before this measurement, and this session itself runs as "Sonnet 5" (per its own system context) — a model-family/generation that postdates every literal ID string baked into the 26 files. The files aren't internally broken; they're frozen to a lock date that reality has moved past, with no mechanism to update them short of a 31-file find-and-replace.

**Duplication.** `for f in .claude/agents/*.md; do sort -u "$f"; done | sort | uniq -c | sort -rn` shows 26/26 files sharing, verbatim: the frontmatter key set (`skills:`, `return_contract:`, `pre_flight_reads:`, `escalates_when: |`, `mcpServers:`, `isolation: worktree`), and nine identical section headers (`## Identity & mission`, `## Skills — load on demand`, `## Pre-flight reads`, `## Operating procedure`, `## Anti-patterns`, `## Return contract`, `## Key distinctions`, `## Workflow position`, `## Agent Teams mode (when spawned into a team)` — the last in 25/26). This is a hand-copied template, not organic duplication — the fix is templating, not editing.

**Workflow scripts (the invokable "thinking… or a workflow" half).** `wc -l .claude/workflows/*.js` → `capability-gap-map-followup.js`(133), `capability-gap-map.js`(476), `coding.js`(107), `design.js`(128), `qa.js`(232), `research.js`(167) = 1,243 lines, 6 files. `ceo.md`'s own "T5 library" table (line 83–90) lists only 4 of its 6 scripts — `coding.js, design.js, research.js, qa.js` — omitting `capability-gap-map.js` and `capability-gap-map-followup.js` entirely. Session-log grep for real invocations: `coding.js`/`research.js` → 0 hits in 142 session files; `design.js` → 0 hits; `qa.js` → 1 hit; `capability-gap-map*` → 1 hit (this very harvest). Every script independently re-implements its own args-normalizer; `qa.js` line 15 says so directly: `"NOTE: this normalizer is duplicated across all .claude/workflows/*.js — keep the 4 copies in sync"` — because, per the same comment, **the Workflow runtime has no shared-module import**. This is a real technical constraint, not an oversight, and it shapes the consolidation mechanism below.

**Thinking-layer personas (currently living under `.claude/agents/war-room/`, Routine-schema, not top-level).** 7 files: `persona-architect, persona-aria, persona-broad-adversary, persona-customer-voice, persona-risk-modeler, persona-strategist, persona-visionary`, plus `synthesizer.md`. All personas are `claude-opus-4-7`, `isolation: none`, `tools: [Read, Write, Glob, Grep]` — no `Bash`, no `Task` — they cannot spawn and cannot loop indefinitely. `synthesizer.md`'s frontmatter hardcodes `round_sequence: [persona-visionary, persona-architect, persona-strategist, persona-aria]` — 4 of the 7 personas. `persona-broad-adversary`, `persona-customer-voice`, and `persona-risk-modeler` all declare a `decision_type_routing` field (`strategic`, `strategic + product`, `vendor + strategic`) but are absent from `synthesizer`'s actual invocation list — three fully-built agents that the one script that's supposed to call them never calls. The other four personas (`architect`, `aria`, `strategist`, `visionary`) don't even declare `decision_type_routing` — the routing schema is applied to less than half the roster it governs.

**The board-meeting-protocol skill contradicts the locked architecture.** `.claude/skills/board-meeting-protocol/SKILL.md` documents, verbatim: *"R0 framing, R1 independent verdicts, R2 cross-critique, R3 fresh-context synthesis"* and, at R2: *"personas read R1 outputs, may change votes"* (line 93–99). This is the exact mechanism the rethink's locked decision forbids: *"NO cross-critique/debate round for generative decisions (accuracy degrades across rounds via sycophancy)."* Three persona files (`persona-broad-adversary`, `persona-customer-voice`, `persona-risk-modeler`) carry `round_protocol_position: r1 + r2` in their own frontmatter, baking the forbidden round into the schema itself. This is not a hypothetical risk — it's live, documented, and three files currently encode it as data.

**Docs are stale against the real file list.** `AGENTS.md`'s worker table documents 9 workers (`Backend Developer, Frontend Developer, Database Engineer, AI Engineer, Security Engineer, Test Engineer, Code Reviewer, Researcher, Technical Writer`) plus a "GSD Execution Agents" section for 12 agents that CLAUDE.md's own banner says were archived 2026-05-16 to `.archive/agents/gsd-pipeline-2026-05-16/`. Undocumented in `AGENTS.md` but present as real files: `adversary-engineer, data-engineer, devops-engineer, design-critic, design-polisher, product-designer, qa-engineer, supabase-cleaner` — 8 of the 26. `AGENTS.md` still lists `cco` as an active C-suite agent (line 35) despite CLAUDE.md's banner stating *"CCO folded into CPO (premature org)"* as a locked 2026-05-16 board decision — `cco.md` is a live 303-line file today, contradicting a decision that's supposedly already made.

**Skills corpus.** `.claude/skills/MANIFEST.json`'s own `totalSkills` field says 145; `find .claude/skills -maxdepth 1 -type d | tail -n +2 | wc -l` counts 146 directories; the `skills` array inside the same JSON file has 149 entries; CLAUDE.md's prose says "117 curated skills." Four numbers, four different sources, none agreeing — confirmed, not merely alleged. Spot-checked 149 skill descriptions for truncation: 26 end mid-word or mid-phrase (e.g. `beamix-brand-quality-bar` ends `"...spacing, animation budget, and empty-state requirem"`; `competitive-landscape` ends mid-quoted-example). This directly undermines the locked "selection keys on the DESCRIPTION field" decision for any of the 26 truncated entries.

**Memory.** `grep -c "^### " .claude/memory/DECISIONS.md` → 58 entries against the documented 50-entry cap; file is 935 lines. `.claude/memory/sessions/` has 4 files (latest dated 2026-05-29); `docs/08-agents_work/sessions/` has 142 files and is visibly the live directory — both are listed as canonical in CLAUDE.md's memory table. `.claude/memory/specs/` does not exist on disk (`ls` → No such file or directory) despite being in the same table.

**`_seeds/` and `_paste-prompts/`.** `.claude/agents/_seeds/` holds 9 files (`ceo.md` + 8 C-suite/lead seeds). `grep -rl _seeds .claude .agent` returns exactly one hit: `.claude/memory/DECISIONS.md` — i.e. a decision entry that *mentions* `_seeds` in prose, not a script that reads it. `.claude/agents/_paste-prompts/` does not exist (`ls` → No such file or directory), confirming the memory note `project_war_room_paste_prompt_source` that the real paste-prompt source is still `/Users/adamks/bin/beamix` lines 52–96, never migrated.

**Hooks, as actually written.** `pre-tool-use.sh` (226 lines) hard-blocks a documented dangerous-command list (exit non-zero → refused) and soft-warns on the rest (exit 0, stderr message). `stop.sh`'s own header states, verbatim: *"SOFT-WARN ONLY — never blocks... EXIT CODE: always 0."* `.claude/settings.json` wires `SessionStart→gsa-check-update.js`, `PreToolUse→pre-tool-use.sh`, `PostToolUse→gsa-context-monitor.js + post-edit-typecheck.sh`, `Stop→stop.sh`. `schema-lint.js` appears in none of these hook slots and in no `.github/workflows/*.yml` — it is a correct, unwired tool.

**QA-gate file-path map, confirmed real.** `.claude/qa-tier-floor.yml` exists and its irreversible-tier rules include `.claude/agents/**` (reason: *"Agent definitions; bad prompt cascades across every spawn"*), `.claude/hooks/**`, `.claude/settings.json`, and DB migrations. `.github/workflows/qa-lead-pass.yml` exists and enforces a session-file / QA-verdict check on every PR to `main`. This machinery is real and already governs `.claude/agents/**` at the highest tier — any roster-generation mechanism this spec proposes inherits that gate automatically, it doesn't need a new one.

---

## Target state (the complete enumeration)

### Design decisions this roster answers

**1. Is the thinking layer agents, a workflow, or both — and who decides?** Both, and it already is both in embryonic form — `persona-*.md` files (agents, pure judgment, no tools beyond Read/Write/Glob/Grep) plus a `synthesizer` role, invoked today through the Routine/`@board` path and, going forward, addressable directly by name from any spawn point. **Who decides to invoke it:** the CEO or any Lead (thinking-layer chief) — never a worker, never a validator. A worker that hits a decision it can't make returns `BLOCKED` upward; it does not invoke thinking itself. This is enforced structurally, not by convention: only `ceo` and the 6 Leads declare `Task` in `tools`; personas, synthesizer, validators, and all 12 workers do not.

**2. Can a thinking-layer agent spawn its own workers, or does everything route through the orchestrator?** Yes — a Lead spawns its own domain workers directly (this is already true today: CTO spawns `backend-engineer`, Design-Lead spawns `product-designer`). The "only the CEO spawns" convention is dead per the locked decision; a hook enforces spawn-depth rules regardless of who spawns, which is what makes decentralized spawning safe. What does **not** change: `ceo` remains the mandatory entry point for every task (nothing skips it to start), and the QA gate remains mandatory before any merge regardless of who did the spawning. Pure judgment agents (personas, `synthesizer`) never spawn workers themselves — they hand a verdict back to whoever invoked them, and that caller (a Lead or the CEO) decides what to spawn next. This keeps "reason, then decide, then act" as three distinct steps even though steps 2 and 3 can be the same agent.

**3. Minimum agent set that covers "every task is different"?** Not more agent files — more **skill combinations loaded per task** on a fixed, small roster. Adaptability lives in the skills layer (progressive disclosure, on-demand loading), not in proliferating near-duplicate agent files for every possible task shape. The roster below is sized to *distinct capability shapes* (an agent that writes SQL is categorically different from one that writes React, which is different from one that only reads and verdicts) — 31 agents, not 100. Two agents were flagged as candidates for further specialization (`ai-engineer` splitting into RAG vs. agent-orchestration; `frontend-engineer` splitting web vs. native) and explicitly rejected below (see Changes) — the fix for "different task, different depth" is choosing the right skill subset and the right thinking-layer panel per task, not minting a new file.

**4. File format — how is 7,012 lines / 26 files with duplicated blocks fixed?** Generation from one template plus per-agent data, detailed in **Format & schema** below. Not shared includes (the Workflow-runtime constraint that forces `qa.js` to duplicate its normalizer does **not** apply to `.md` agent files — those aren't executed by that runtime, they're loaded once by the Claude Code agent loader — so a build-time generator is unconstrained by the same limitation that forces the workflow scripts to stay separate).

### Layer 1 — Orchestrator (1 agent)

#### `ceo` — model: opus (tier: orchestration-heavy) — layer: orchestrator
Entry point for every task. Plans, questions, assembles the right team (Lead(s) + thinking-layer panel when warranted), delegates, tracks progress via `TaskList`, starts the QA gate, owns the quality bar. Never touches source.
- **May:** read anything; spawn any Lead or the fan-out engine directly; validate structured returns; reject a return missing required fields; invoke the thinking layer directly for cross-domain decisions that don't cleanly belong to one Lead.
- **May not:** `Write`/`Edit` source files of any kind (no `Write`/`Edit` in `tools`); implement a fix itself under any time pressure; accept a worker/Lead return missing required fields; override a QA `BLOCK`.
- **Skills:** `multi-agent-patterns`, `dispatching-parallel-agents`, `war-room-orchestration`, `board-meeting-protocol`, `linear-mvp-recipe`, `mem0-patterns`, `context-compression`.
- **MCPs:** `linear`, `mem0`.
- **Tools:** `Read, Grep, Glob, Bash, Task, SendMessage, TaskCreate, TaskUpdate, TaskList`.
- **isolation:** `none` (never touches the working tree directly).
- **Breaks without it:** no task has a single entry point; every project reinvents its own kickoff convention; nothing tracks cross-Lead progress or owns the merged quality bar.

### Layer 2 — Thinking (invokable, not always-on) — 13 agents

Two structurally different kinds live here, and the schema distinguishes them (see Format & schema): **Leads**, who own a domain, spawn workers, and may invoke deeper thinking; and **pure-judgment agents** (personas + synthesizer), who never spawn and never build — they only reason and hand back a verdict.

#### Leads (6)

##### `cto` — model: sonnet-default — layer: thinking (lead)
Owns all engineering: code, infra, architecture. Classifies task, briefs the right worker(s), reviews returns for spec fit, escalates architectural calls to the thinking-layer panel when a decision is genuinely contested.
- **May:** spawn any engineering worker; invoke `persona-architect`/`persona-risk-modeler` for a contested architecture call; reject a worker return that doesn't meet the brief.
- **May not:** `Write`/`Edit` `.ts`/`.tsx`/`.sql` directly (delegates, never implements — hard layer-contract rule); merge without a QA PASS.
- **Skills:** `multi-agent-patterns`, `dispatching-parallel-agents`, `qa-gate-protocol`, `worktree-isolation-pattern`, `architecture-patterns`, `architecture-decision-records`, `writing-plans`.
- **MCPs:** `linear`, `context7`.
- **isolation:** `none`.
- **Breaks without it:** every engineering task routes through the CEO directly, destroying the whole point of a domain layer; no one owns "is this the right architecture," only "did this pass QA."

##### `cpo` — model: sonnet-default — layer: thinking (lead)
Owns product: PRDs, roadmap, RICE, acceptance criteria, spec compliance, plus (absorbed from the cut `cco`, see Changes) onboarding/retention/customer-voice ownership and mandatory `USER-INSIGHTS.md` updates.
- **May:** write PRDs and specs; spawn Design-Lead for screens; spawn `researcher` for market/user data via Research-Lead; update `USER-INSIGHTS.md` (co-authorized with CMO).
- **May not:** invent customer data — must cite or spawn Research-Lead/`researcher`; skip the `USER-INSIGHTS.md` update after a session that touched customer-facing scope (this is a hard gate per CLAUDE.md, not a preference).
- **Skills:** `product-manager-toolkit`, `linear-mvp-recipe`, `brainstorming`, `architecture-decision-records`, `writing-plans`, `deep-research`, `onboarding-cro`, `page-cro`, `form-cro`.
- **MCPs:** `linear`, `mem0`.
- **isolation:** `none`.
- **Breaks without it:** no one owns "does this match the spec," specs drift silently across engineering/design work; customer-voice ownership (absorbed from CCO) has no home and `USER-INSIGHTS.md` goes stale.

##### `cmo` — model: sonnet-default — layer: thinking (lead)
Owns growth: copy, SEO/GEO, email, GTM, CRO. Gate: requires `USER-INSIGHTS.md` before writing customer-facing copy.
- **May:** write and ship copy to Framer staging; spawn `technical-writer` for long-form; block its own output if `USER-INSIGHTS.md` is stale/missing.
- **May not:** publish directly to the live Framer site (must stage to preview, spawn QA-Lead in brand+voice mode first); write copy without having read current `USER-INSIGHTS.md`.
- **Skills:** `copywriting`, `marketing-psychology`, `seo-content-writer`, `beamix-voice-canon`, `linear-mvp-recipe`, `launch-strategy`, `humanizer`.
- **MCPs:** `linear`, `framer-mcp`, `mem0`.
- **isolation:** `none`.
- **Breaks without it:** copy ships ungrounded in real customer language; GTM work has no domain owner.

##### `cbo` — model: sonnet-default — layer: thinking (lead)
Owns business: pricing, financials, unit economics, OKRs, RICE, legal/compliance, vendor decisions. Numbers first, sensitivity range always, reversibility flagged.
- **May:** produce pricing/financial recommendations with a sensitivity range; spawn `researcher`/Research-Lead for sourced competitive data; spawn `data-engineer` for real metric pulls.
- **May not:** invent market data (must spawn Research-Lead and wait for a sourced return); change a price/vendor contract/public commitment without spawning QA-Lead in "numbers + reversibility" mode first.
- **Skills:** `startup-financial-modeling`, `pricing-strategy`, `startup-metrics-framework`, `paddle-integration`, `linear-mvp-recipe`, `market-sizing-analysis`, `competitive-landscape`.
- **MCPs:** `linear`, `supabase` (read-only metric pulls).
- **isolation:** `none`.
- **Breaks without it:** pricing/financial calls get made ad hoc by whichever agent is in the room, with no sensitivity-range or reversibility discipline.

##### `research-lead` — model: opus (synthesis-heavy) — layer: thinking (lead)
Owns all research: competitive, market sizing, tech evaluation, user research. Reports to CEO directly (cross-cutting, not nested under a domain chief).
- **May:** spawn 2–3 `researcher` instances in parallel for a multi-angle sweep; synthesize into one cited brief.
- **May not:** report a claim without a source; let a `researcher` return stand un-synthesized as the final artifact.
- **Skills:** `deep-research`, `competitive-landscape`, `market-sizing-analysis`, `search-specialist`, `pgvector-rag-beamix`, `mem0-patterns`.
- **MCPs:** `linear`, `context7`, `mem0`.
- **isolation:** `none`.
- **Breaks without it:** research work has no synthesis point; every domain chief re-researches the same competitive landscape independently.

##### `design-lead` — model: opus (orchestration-heavy) — layer: thinking (lead)
Cross-cutting design orchestrator, reports under CPO. Classifies task type, gathers references, brainstorms direction, delegates to `product-designer`/`frontend-engineer`, verifies visually with Playwright, loops through `design-critic` until the quality bar is met.
- **May:** spawn `product-designer`, `design-critic`, `design-polisher`, `frontend-engineer`; loop build→critic→polish until PASS or 2 re-briefs exhausted.
- **May not:** ship a design that contradicts `BRAND_GUIDELINES.md` without either resolving it or escalating to CEO when Adam is unreachable; treat `design-critic`'s judgment as advisory (it's a gate within the loop, not a suggestion).
- **Skills:** `design-taste-frontend`, `design-orchestration`, `high-end-visual-design`, `emilkowal-animations`, `beamix-brand-quality-bar`, `minimalist-ui`, `stitch-design-taste`.
- **MCPs:** `refero`, `stitch`, `pencil`, `playwright`, `linear`.
- **isolation:** `none`.
- **Breaks without it:** design work has no single quality-bar owner; the build→critic→polish loop (the mechanism that produced the 2026-06 craft-elevation pass) has no orchestrator.

#### Pure-judgment agents — personas (6, cross-project base set)

Promoted from `.claude/agents/war-room/persona-*.md` to top-level `.claude/agents/`. These are the "reason from different perspectives" mechanism made concrete: each declares a distinct **objective function** (not a distinct topic), is invoked in parallel by whoever needs a panel (CEO or a Lead), never sees another persona's output before returning its own verdict (this is what makes R1 independent rather than R2 cross-critique), and never spawns anything. `tools: [Read, Write]` only — no `Bash`, no `Task`, no `Edit`. `isolation: none`.

##### `persona-strategist` — model: claude-opus-4-7
Lens: does this move the company toward its stated strategy, and at what opportunity cost. **May:** issue a verdict + confidence + alternatives-considered. **May not:** read another persona's output before writing its own. **Skills:** `board-meeting-protocol`, `brainstorming`, `startup-metrics-framework`. **MCPs:** none. **Breaks without it:** every decision gets evaluated tactically with no one asking "does this even matter strategically."

##### `persona-adversary` (renamed from `persona-broad-adversary` — the "broad" qualifier was never load-bearing; nothing scoped a "narrow" adversary) — model: **Codex CLI, with `claude-opus-4-7` fallback on unavailability** (same graceful-degradation contract already proven in `qa.js`'s Codex step — `status: codex_unavailable` logged, never a hard block)
Lens: strongest argument against the proposal; issues KILL verdicts when evidence warrants. This is the one persona deliberately assigned outside the Anthropic model family — per the locked decision, *"heterogeneity of objective AND model family is the active ingredient, not headcount."* Six personas all reasoning inside one model family satisfies objective-heterogeneity but not model-heterogeneity; putting the adversarial lens on a different vendor is the cheapest way to buy real heterogeneity without doubling headcount. **May:** issue a KILL verdict with a `thesis_collapse_probability_18mo` field. **May not:** soften a KILL because it's unpopular; run when Codex is unavailable without logging the fallback. **Skills:** `board-meeting-protocol`, `find-bugs`, `brainstorming`. **MCPs:** none. **Breaks without it:** strategic decisions get rubber-stamped by a panel that's structurally incapable of a strong "no."

##### `persona-customer-voice` — model: claude-opus-4-7
Lens: what would the actual user/customer say, grounded in `USER-INSIGHTS.md` — not an idealized user. **May:** cite `USER-INSIGHTS.md` phrases verbatim in its verdict. **May not:** invent customer language not in `USER-INSIGHTS.md` or a cited research brief. **Skills:** `board-meeting-protocol`, `marketing-psychology`. **MCPs:** `mem0` (read-only, for `USER-INSIGHTS.md`-adjacent memory). **Breaks without it:** strategic/product panels reason about users in the abstract with no grounding in what customers actually said.

##### `persona-risk-modeler` — model: claude-opus-4-7
Lens: what's the downside, how reversible is it, what's the blast radius if wrong. **May:** flag irreversibility explicitly; assign a rough cost-of-being-wrong. **May not:** conflate "risky" with "bad" — its job is to surface the risk, not veto on its own. **Skills:** `board-meeting-protocol`, `architecture-decision-records`. **MCPs:** none. **Breaks without it:** irreversible-tier decisions get evaluated with the same casualness as reversible ones.

##### `persona-architect` — model: claude-opus-4-7
Lens: technical feasibility and system-design soundness. **May:** flag a proposal as technically unworkable as specified. **May not:** redesign the proposal itself (that's `cto`'s job after synthesis, not this persona's). **Skills:** `board-meeting-protocol`, `architecture-patterns`. **MCPs:** none. **Breaks without it:** strategic decisions get made with no technical-feasibility check until engineering discovers the problem mid-build.

##### `persona-visionary` — model: claude-opus-4-7
Lens: does this compound toward the category-defining, "company not tool" vision, or is it a local optimum. **May:** argue for a bolder version of a proposal. **May not:** ignore near-term reversibility/cost constraints raised by `persona-risk-modeler` — argues for boldness, doesn't get to unilaterally override the risk read. **Skills:** `board-meeting-protocol`, `market-sizing-analysis`. **MCPs:** none. **Breaks without it:** every decision gets pulled toward the safe, incremental option with nothing arguing the other direction.

*(`persona-aria` — the Beamix-specific "hidden CTO co-founder, B2B procurement-grade reviewer" persona — stays a **project-local extension**, not part of the cross-project base six. See Open questions for why this is a judgment call, not a certainty.)*

#### Synthesis (1)

##### `synthesizer` — model: claude-opus-4-7 — layer: thinking (synthesis)
Reads all independent persona verdicts **fresh** — never the deliberation transcript, never a prior round's output — and produces one locked decision. This is the literal mechanism behind "fresh-context synthesis": it is invoked as a new context that receives only the R1 verdict JSON files as input, nothing else.
- **May:** read persona verdict files; write the synthesized decision + post to `DECISIONS.md`.
- **May not:** see R0 framing chatter or any persona's reasoning-in-progress; be invoked mid-round (only after all panel verdicts are in); spawn anything (`Task` absent from `tools`).
- **Skills:** `multi-agent-brainstorming`, `board-meeting-protocol`, `architecture-decision-records`, `context-compression`, `writing-plans`.
- **MCPs:** `linear`, `mem0`.
- **Tools:** `Read, Write, SendMessage` (narrowed from today's `[Read, Write, Edit, Bash, Glob, Grep, Task]` — none of the dropped tools are needed for "read verdicts, write decision").
- **isolation:** `none`.
- **Breaks without it:** independent verdicts pile up with nothing reconciling them into one decision; without the "fresh context" discipline specifically, whoever synthesizes is contaminated by having watched the debate, reintroducing the sycophancy risk the whole no-R2 design exists to avoid.

### Layer "validator" — mandatory gate, blast-radius QA (5 agents)

Distinguished from thinking-layer judgment by object and mandate: these agents judge **artifacts** (a diff, a build, a security posture), not **decisions**, and — critically — the QA gate they belong to is **not** invokable-on-demand like the thinking layer; it is a mandatory, hook-and-CI-enforced step (`qa-tier-floor.yml` + `qa-lead-pass.yml`) that fires on every merge regardless of task type. All five are read-only against the artifact under review — none of them may `Edit` the thing they're judging, only report on it. `isolation: none` for all five (they never mutate the working tree).

##### `qa-lead` — model: sonnet-default (opus on Full-tier judge step) — layer: validator (gate owner)
Independent quality gate, spawned before any merge. Risk-tiers the diff, spawns the right validators in parallel, aggregates into one binding PASS/BLOCK. Cannot be overridden by CEO or CTO.
- **May:** spawn `code-reviewer`, `security-engineer`, `adversary-engineer`, `test-engineer` (coverage-gap mode); classify tier; issue a binding BLOCK.
- **May not:** be overridden by CEO/CTO under any circumstance; PASS to avoid conflict; fix findings itself (routes back to the spawning Lead, who dispatches the fix).
- **Skills:** `code-review-excellence`, `multi-agent-patterns`, `dispatching-parallel-agents`, `security-audit`, `qa-gate-protocol`, `find-bugs`, `production-code-audit`.
- **MCPs:** `linear`.
- **Breaks without it:** nothing merges with a binding, unoverridable quality check — the entire risk-tiered QA gate collapses to "whoever's reviewing feels like it."

##### `code-reviewer` — model: sonnet-default — layer: validator
Reads a diff, returns prioritized P1/P2/P3 findings on quality, patterns, and security basics. Diff-scoped only.
- **May:** flag a P1 that blocks; scope strictly to changed files.
- **May not:** edit the diff it's reviewing; expand scope beyond changed files without flagging why.
- **Skills:** `code-review-excellence`, `find-bugs`, `qa-gate-protocol`, `cc-skill-coding-standards`, `code-refactoring-tech-debt`, `production-code-audit`.
- **MCPs:** none (drop `github` — `gh` CLI via Bash allowlist covers PR-comment posting if ever needed).
- **Breaks without it:** the QA fan-out loses its general-quality dimension reviewer; every P1/P2/P3 finding has to come from a narrower specialist that isn't scoped for general code quality.

##### `security-engineer` — model: opus (depth work) — layer: validator
OWASP audit, dependency vulnerability scan, auth review, RLS policy check on changed files. Structured severity findings.
- **May:** flag missing RLS policies, injection risk, auth bypass; scan changed files' dependency deltas.
- **May not:** write the fix (routes back through the spawning Lead); pass an RLS-touching diff without an explicit RLS check.
- **Skills:** `security-audit`, `trust-spec-contracts`, `supabase-rls-beamix`, `web-security-testing`, `broken-authentication`, `api-security-testing`, `xss-html-injection`.
- **MCPs:** none (drop `github`).
- **Breaks without it:** no dedicated security dimension in the gate — RLS/auth/injection defects rely on `code-reviewer`'s general pass catching them, which it isn't scoped to guarantee.

##### `adversary-engineer` — model: claude-opus-4-7 — layer: validator
Adversarial reviewer, spawned by QA-Lead on Full/Irreversible tiers. Simulates a malicious user or hostile reviewer to surface worst-case scenarios. Read-and-audit only — never writes or fixes.
- **May:** run worst-case/attack-scenario simulation against the diff; serve as one of the "3 independent adversarial verifiers per finding" the QA fan-out spawns on block-eligible (P1, and P2 at Irreversible) findings — parametrized at spawn time by *which* finding it's verifying, not by having a separate agent-file per finding-domain.
- **May not:** write a fix; verify its own prior finding (verification must be by a fresh spawn, not the same context that raised the finding).
- **Skills:** `security-audit`, `api-security-testing`, `find-bugs`, `web-security-testing`, `broken-authentication`, `xss-html-injection`.
- **MCPs:** none (drop `github`; keeps `WebSearch` as a tool for CVE lookups).
- **Breaks without it:** the "3 adversarial verifiers on block-eligible findings" mechanism — the thing that keeps the gate from over-blocking on a single reviewer's false positive — has no agent to instantiate it with.

##### `design-critic` — model: sonnet-default (moved off Opus — see model notes) — layer: validator
Grades craft-parity and feeling of an implemented build against its reference folder. Screenshots via Playwright, compares side-by-side, scores the richness gap, returns PASS/NEEDS_WORK/CRITICAL_ISSUES.
- **May:** score against references; block a design-lead loop iteration.
- **May not:** edit the build under review (explicit in its own current description — "judges, never edits" — kept verbatim as a hard rule); accept 1:1 copy-fidelity to a reference as a passing bar (must be Beamix-language, not a trace).
- **Skills:** `ui-visual-validator`, `beamix-brand-quality-bar`, `wcag-audit-patterns`, `design-taste-frontend`, `screenshots`.
- **MCPs:** `playwright`.
- **Breaks without it:** the build→critic→polish design loop has no judge; craft quality regresses to "looks done" instead of "meets the reference bar."

### Layer 3 — Workers (12 agents)

Execute one focused task, read skills on demand, never spawn (`Task` absent from every worker's `tools`). All twelve mutate the working tree (`isolation: worktree`) — this is the actual, structural distinction between "worker" and "validator": workers write, validators only read-and-report.

##### `backend-engineer` — model: sonnet-default
API routes, server logic, TypeScript strict, Zod validation on all inputs. **May:** implement one focused backend task in its own worktree; atomic commits. **May not:** decide architecture unilaterally — returns BLOCKED to CTO instead. **Skills:** `nodejs-backend-patterns`, `nextjs-app-router-patterns`, `api-design-principles`, `error-handling-patterns`, `nextjs-supabase-auth`, `paddle-integration`, `inngest`. **MCPs:** `supabase`, `context7`; `ide` auto-available when running in a connected IDE (optional, not a config dependency). **Breaks without it:** every API/server task routes through a generalist with no backend-specific skill loadout.

##### `frontend-engineer` — model: sonnet-default
React components, Tailwind + Shadcn/UI. **May:** implement UI to a spec/design handoff; use `framer-mcp` **only** when the task is explicitly Framer-marketing-scoped (never by default — this repo is the product app, Framer is a separate project per CLAUDE.md's architecture split). **May not:** invent visual design decisions outside a handoff — that's `product-designer`'s job. **Skills:** `react-patterns`, `nextjs-app-router-patterns`, `beamix-brand-quality-bar`, `tailwind-design-system`, `radix-ui-design-system`, `react-ui-patterns`, `frontend-design`. **MCPs:** `pencil`, `context7`, `framer-mcp` (conditional). **Breaks without it:** design handoffs have no code-correctness owner distinct from the visual-craft owner (`product-designer`).

##### `database-engineer` — model: sonnet-default
Schema design, migrations, queries. **May:** design and write migrations. **May not:** apply a migration to production without explicit confirmation; drop anything without confirmation. **Skills:** `postgresql`, `sql-optimization-patterns`, `supabase-rls-beamix`, `database-design`, `nextjs-supabase-auth`, `sharp-edges`. **MCPs:** `supabase` (mandatory per CLAUDE.md's MCP table for any DB work). **Breaks without it:** schema work happens via raw SQL with no RLS/migration discipline; migrations (already Irreversible-tier in `qa-tier-floor.yml`) get authored by a generalist unfamiliar with the tier's stakes.

##### `ai-engineer` — model: opus (depth work)
LLM integration, RAG, embeddings, agent orchestration features. Every feature ships with eval + cost logging. **May:** design prompt/RAG pipelines; ship with an eval harness. **May not:** ship an LLM feature with no cost logging or eval. **Skills:** `prompt-engineering-patterns`, `llm-evaluation`, `beamix-scan-architecture`, `llm-app-patterns`, `prompt-caching`, `agent-memory-systems`, `rag-engineer`. **MCPs:** `supabase` (pgvector lives inside Supabase Postgres — there is no separate pgvector MCP; the `pgvector-rag-beamix` skill documents the pattern), `context7`. **Breaks without it:** AI-feature work (the product's core differentiator — scan/diagnose/fix) has no dedicated owner with eval/cost discipline built in.

**Rejected split:** RAG-pipeline work vs. agent-orchestration work were considered as two separate agents. Rejected — both draw from the same skill corpus (`agent-memory-systems`, `llm-app-patterns`) and the same eval/cost-logging discipline; splitting would duplicate the mandatory-eval rule across two files instead of enforcing it once.

##### `devops-engineer` — model: sonnet-default
Deployment, CI/CD, infrastructure. Staging first, production only on explicit confirmation, rollback plan before every forward migration. **May:** deploy to staging freely. **May not:** deploy to production without explicit confirmation; forward-migrate without a written rollback plan. **Skills:** `vercel-deployment`, `deploy-to-vercel`, `github-actions-templates`, `anthropic-routines`, `secrets-management`, `deployment-procedures`, `cloud-devops`. **MCPs:** `supabase` (drop `github` — `gh *` is already Bash-allowlisted). **Breaks without it:** deploys happen ad hoc with no staging-first discipline or rollback-plan requirement.

##### `data-engineer` — model: sonnet-default
SQL queries, metric definitions, event tracking. All queries via Supabase MCP — never inline LLM estimation. **May:** run verified queries with sanity checks. **May not:** estimate a number instead of querying it; use Segment (not in the stack — dropped `segment-cdp` MCP declaration, which never resolved to a real server and references a product not in CLAUDE.md's stack table). **Skills:** `sql-optimization-patterns`, `postgresql`, `data-engineer`, `data-storytelling`, `supabase-rls-beamix`. **MCPs:** `supabase`. **Breaks without it:** metric claims get estimated by whichever agent needs a number instead of verified via query.

##### `supabase-cleaner` — model: sonnet-default — *specialist, retained as-is per current scope*
Audits the Supabase project against the post-rethink schema. Never runs destructive SQL — emits reviewed SQL plan files for Adam to apply manually. **May:** audit and emit plans. **May not:** execute a destructive statement itself, ever. **Skills:** `postgresql`, `database`, `sql-optimization-patterns`, `supabase-rls-beamix`, `database-design`. **MCPs:** `supabase`. **Breaks without it:** schema drift between spec and live DB has no dedicated, safety-railed auditor — the alternative is `database-engineer` running ad hoc audits with destructive-SQL tools already in hand.

##### `product-designer` — model: **sonnet** (moved off Opus — see model notes)
Absorbs a reference folder, synthesizes an original Beamix-language screen at pixel-level craft — never traces references. **May:** produce first-paint builds with craft-mastery heuristics always-on. **May not:** trace/copy a reference 1:1; skip Playwright self-verification before handoff. **Skills:** `design-taste-frontend`, `high-end-visual-design`, `emilkowal-animations`, `beamix-brand-quality-bar`, `frontend-design`, `humanizer`, `full-output-enforcement`. **MCPs:** `pencil`, `stitch`, `refero`, `playwright`. **Breaks without it:** no dedicated first-paint craft owner distinct from `frontend-engineer` (code correctness) — screens regress to functional-but-generic.

##### `design-polisher` — model: sonnet
Adds craft density to an already-functional build — micro-interactions, motion choreography, spacing/type refinement — measured against the reference folder as vibe, not copy-fidelity. **May:** execute concrete polish fixes from `design-critic`'s gap list. **May not:** re-litigate the critic's verdict — executes against it. **Skills:** `high-end-visual-design`, `emilkowal-animations`, `beamix-brand-quality-bar`, `design-taste-frontend`, `full-output-enforcement`, `humanizer`. **MCPs:** `playwright`, `pencil`. **Breaks without it:** the build→critic→polish loop has a judge but no executor for the gap it finds — every critic finding has to route back to `product-designer` for a full re-pass instead of a targeted fix.

##### `test-engineer` — model: haiku (cheap, mechanical) — **merged with `qa-engineer`, see Changes**
Writes unit, integration, and E2E tests, in one of two modes: **TDD mode** (red-first from a spec, spawned by CTO pre-merge) or **coverage-gap mode** (extends the suite for a diff under active review, spawned by QA-Lead on Lite+ tiers). The mode is a spawn-time parameter, not a different file.
- **May:** write failing tests before implementation (TDD mode); extend coverage for an existing diff (coverage-gap mode).
- **May not:** mark a test suite complete without running it; skip TDD-red confirmation when spawned in TDD mode.
- **Skills (union of the former two files):** `testing-patterns`, `e2e-testing-patterns`, `tdd-workflow`, `e2e-testing`, `playwright-skill`, `unit-testing-test-generate`, `qa-gate-protocol`.
- **MCPs:** `playwright`.
- **Breaks without it:** either TDD tests or gate-time coverage-gap tests have no owner — two files that were 6-of-7 skills identical collapse into one confusing "which one do I spawn" decision every time.

##### `researcher` — model: opus (sourced-depth work)
Deep research on one specific question. Sources every claim. HIGH/MEDIUM/LOW confidence. **May:** cite sources with confidence levels. **May not:** invent a claim with no source; return an unsourced "fact." **Skills:** `deep-research`, `competitive-landscape`, `search-specialist`, `market-sizing-analysis`, `pgvector-rag-beamix`. **MCPs:** `context7`, `mem0`. **Breaks without it:** every domain chief researches ad hoc with no sourcing discipline, and Research-Lead has nothing to fan out to.

##### `technical-writer` — model: sonnet
Documentation, READMEs, PR descriptions, API docs, changelogs, written after work completes. Reads the actual code before writing — never documents the brief. **May:** write docs against the shipped artifact. **May not:** document the brief instead of the implementation (a real failure mode named in its own current description). **Skills:** `documentation`, `api-documentation`, `documentation-templates`, `code-documentation-code-explain`, `readme`, `beamix-voice-canon`. **MCPs:** `linear`, `mem0` (optional). **Breaks without it:** docs drift from implementation with nothing reading the actual diff before writing them up.

---

## Changes: kept / cut / merged / added

| Original agent | Decision | Rationale |
|---|---|---|
| `adversary-engineer` | **KEEP** (rewrite → template) | Distinct from `security-engineer`: adversarial-verifier role for the 3-vote block-eligible-finding mechanism, not a static-checklist audit. Both are needed; they're not duplicates. |
| `ai-engineer` | **KEEP** | Core differentiator (scan/diagnose/fix is the product). No split — see rejected-split note above. |
| `backend-engineer` | **KEEP** | No substitute exists for API/server-logic implementation. |
| `cbo` | **KEEP** | Pricing/financial/unit-econ ownership has no other home. |
| `cco` | **CUT** | CLAUDE.md's own banner documents this as an *already-locked* 2026-05-16 board decision ("CCO folded into CPO (premature org)"). The file existing today as a live, spawnable agent — and `AGENTS.md` still listing it as active — is the bug this cut fixes, not a new call. Remit (onboarding-cro, page-cro, form-cro, USER-INSIGHTS.md contribution) folds into `cpo`. |
| `ceo` | **KEEP** (rewrite → template + narrower `tools`) | Mandatory single entry point; no substitute. |
| `cmo` | **KEEP** | Growth/copy/GTM ownership has no other home. |
| `code-reviewer` | **KEEP** (rewrite → `isolation: none`, drop `github` MCP) | General code-quality dimension reviewer; distinct from `security-engineer` (security-specific) and `adversary-engineer` (adversarial-verify role). |
| `cpo` | **KEEP** (absorbs `cco`'s remit) | Product-spec ownership has no other home; natural absorber for customer-voice given the existing co-authorization of `USER-INSIGHTS.md` with CMO. |
| `cto` | **KEEP** (rewrite → `isolation: none`, add MAIN_REPO block via template) | Engineering-domain ownership has no other home. |
| `data-engineer` | **KEEP** (rewrite → drop `segment-cdp` MCP + skill, both non-existent/wrong-stack) | Distinct from `database-engineer`: metric definitions and verified-number discipline vs. schema/migration work. |
| `database-engineer` | **KEEP** | Schema/migration/RLS discipline needs a dedicated, careful owner given Irreversible-tier stakes. |
| `design-critic` | **KEEP** (moved to validator layer, model → sonnet) | Read-only judge role, structurally distinct from workers that write. Opus was observed stalling on this role (memory: design agents stall 100–185k tokens) — Sonnet is the fix, not a demotion. |
| `design-lead` | **KEEP** | Design-domain orchestration has no other home. |
| `design-polisher` | **KEEP** (model already sonnet — confirmed correct in current file) | Genuinely distinct phase from `product-designer` (first-paint) and `design-critic` (judge-only, never edits) — the generate→critique→execute cascade is a deliberate, working pattern (2026-06 craft-elevation initiative), not accidental proliferation. |
| `devops-engineer` | **KEEP** (drop `github` MCP) | Deployment/CI/CD discipline (staging-first, rollback-plan) has no other home. |
| `frontend-engineer` | **KEEP** | Code-correctness ownership for UI, distinct from `product-designer`'s visual-craft ownership. No web/native split — no evidence of native-app work in this codebase's actual scope. |
| `product-designer` | **KEEP** (model → sonnet, was opus) | Same stall-avoidance rationale as `design-critic`/`design-polisher`. |
| `qa-engineer` | **MERGE into `test-engineer`** | 6 of 7 declared skills are byte-identical between the two files; both Haiku; both spawned in a test-authoring capacity by QA-Lead. The only real distinction (TDD-red-from-spec vs. coverage-gap-on-diff) is a mode, not a different skillset, model, or capability — a spawn-time parameter, not grounds for two files. |
| `qa-lead` | **KEEP** (moved to validator layer, `isolation: none`) | Binding, unoverridable gate owner — the single most load-bearing agent after `ceo`. |
| `research-lead` | **KEEP** | Cross-cutting research ownership has no other home. |
| `researcher` | **KEEP** | Sourced-research execution has no substitute. |
| `security-engineer` | **KEEP** (`isolation: none`, drop `github` MCP) | Dedicated security dimension in the QA fan-out; distinct from `adversary-engineer`'s adversarial-verify role. |
| `supabase-cleaner` | **KEEP as-is** (per explicit brief instruction — specialist retained) | Safety-railed schema-drift auditor with a real, narrow, working scope (emits plans, never executes destructively). |
| `technical-writer` | **KEEP** (add MAIN_REPO block via template) | Docs ownership, "read the code not the brief" discipline, has no substitute. |
| `test-engineer` | **KEEP** (rewrite → absorbs `qa-engineer`'s coverage-gap mode) | See `qa-engineer` merge rationale. |
| — | **ADDED:** `synthesizer` | Promoted from `.claude/agents/war-room/synthesizer.md` (Routine-schema) to a top-level, addressable thinking-layer agent. Fresh-context synthesis is a locked-in requirement of the thinking-layer design — it needs to be invocable outside the `@board` Routine trigger path, not exclusively event-triggered. |
| — | **ADDED:** `persona-strategist` | Promoted from war-room. One of the six base objective-function lenses the thinking layer's "reason from different perspectives" design requires. |
| — | **ADDED:** `persona-adversary` (renamed from `persona-broad-adversary`) | Promoted + renamed (the "broad" qualifier was never load-bearing) + reassigned to Codex-first model routing to satisfy the locked "heterogeneity of objective AND model family" requirement, which the current all-Opus persona roster does not satisfy. |
| — | **ADDED:** `persona-customer-voice` | Promoted from war-room. Currently built but unwired (absent from `synthesizer`'s hardcoded `round_sequence`) — promoting it to top-level with dynamic panel selection (see Mechanism) fixes that by construction. |
| — | **ADDED:** `persona-risk-modeler` | Same as above — built, currently unwired, fixed by promotion + dynamic selection. |
| — | **ADDED:** `persona-architect` | Promoted from war-room. Technical-feasibility lens for strategic panels. |
| — | **ADDED:** `persona-visionary` | Promoted from war-room. Category-defining-vision counterweight to `persona-risk-modeler`. |

**Net:** 26 current → 24 survive (26 − 1 cut [`cco`] − 1 merged-away [`qa-engineer`]) + 7 added (6 personas + `synthesizer`) = **31 target**.

**Explicitly considered and rejected as additions:** a dedicated "growth-engineer" worker under CMO (rejected — `technical-writer` + `frontend-engineer` already cover CMO's implementation needs; no evidence of unmet capability); an `ai-engineer` RAG/orchestration split (rejected, see above); a `frontend-engineer` web/native split (rejected — no native-app work in scope); a general-purpose "specialist worker spawner" meta-agent for arbitrary one-off tasks (rejected — this is precisely what skills-on-demand loading on the existing 12 workers already provides; a meta-agent would just be an unscoped worker with no domain discipline).

---

## Format & schema

### Frontmatter (every `.claude/agents/*.md`)

```yaml
---
name: string                       # matches filename, kebab-case
description: string                # 1–3 sentences: layer prefix, purpose, who spawns it — see rule below
layer: orchestrator | thinking-lead | thinking-persona | thinking-synthesis | validator | worker   # NEW — machine-readable, replaces prose-parsing the description
model: string                      # symbolic tier, NOT a literal version ID — see Model tiers below
tools: [ ... ]                     # exact Claude Code tool names; Task present ⟺ layer ∈ {orchestrator, thinking-lead}
maxTurns: integer                  # range depends on layer — see table below
color: string
isolation: worktree | none         # worktree ⟺ layer == worker (or researcher/technical-writer, which write files); none everywhere else
mcpServers: [ ... ]                # only names present in .mcp.json or ~/.claude.json (project- or user-scoped) — see MCP resolution table
skills: [ ... ]                    # skill directory names, must exist in .claude/skills/MANIFEST.json
risk_tier_default: trivial | lite | full | irreversible
escalates_to: string               # agent name or "adam"
escalates_when: |
  - bullet list, one condition per line
return_contract:
  required_fields: [ ... ]
  optional_fields: [ ... ]
pre_flight_reads: [ ... ]          # omit entirely for personas/synthesizer — they receive their input, they don't go read the repo
---
```

**`layer` is new and mandatory.** Today, "layer" is inferred by a human reading the first word of `description` ("Worker.", "C-suite."). That's exactly the kind of rule this rethink's own locked decisions disqualify by construction ("the agent should remember" doesn't count as enforcement) — so it becomes real, `enum`-validated frontmatter, checked by `schema-lint.js`, and it's what lets `generate.js` and the fan-out engine query "give me every validator" without parsing prose.

**Model tiers, not literal IDs.** `model:` holds a symbolic tier (`opus-deep`, `sonnet-default`, `haiku-fast`, or, for `persona-adversary` specifically, `codex-external`), resolved at generation time against one file: `.claude/agents/_data/models.json`, e.g. `{"opus-deep": "claude-opus-4-8", "sonnet-default": "claude-sonnet-4-6", "haiku-fast": "claude-haiku-4-5"}`. Bumping a model generation is a one-line edit to one file, then `node generate.js`, instead of a 31-file find-and-replace — this is the direct fix for the "model IDs are stale" finding, and it stays fixed the next time a new model ships.

**`maxTurns` ranges become layer-dependent** (fixes all 10 current schema-lint failures by correcting the schema, not the agents — every failure was the same worker doing legitimately-turn-heavy multi-file build work hitting a ceiling written for a different layer):

| Layer | maxTurns range | Rationale |
|---|---|---|
| orchestrator | 15–30 | Delegates; doesn't implement. |
| thinking-lead | 15–30 | Same. |
| thinking-persona | 5–15 | Bounded single-pass judgment, no tool loop possible (`Task`/`Bash` absent). |
| thinking-synthesis | 10–20 | Reads verdicts, writes one decision. |
| validator | 10–25 | Reads a diff/build, writes findings — no multi-file implementation loop. |
| worker | 10–60 | Real implementation work; the 10 files hitting 50 today are within a corrected [10, 60] range. |

**`isolation` becomes a direct function of `layer`**, not a per-agent judgment call: `worktree` for every `worker`, plus `researcher` and `technical-writer` (they write files even though they're not "workers" in the code-implementation sense); `none` for everything else. This resolves all 5 current schema-lint warnings by construction — the 3 failing files (`code-reviewer`, `cto`, `technical-writer`) were declaring `worktree` without the required boilerplate; `code-reviewer` and `cto` fix by moving to `isolation: none` (they're read-only/delegating, worktree was never appropriate), `technical-writer` fixes by the template always including the MAIN_REPO block whenever `isolation: worktree` is declared.

### Body sections (every agent file)

Nine section headers are already, verbatim, shared across 26/26 or 25/26 current files — that's not an accident to fix, it's a template to formalize:

1. `## Identity & mission` — mandatory, all layers.
2. `## Skills — load on demand` — mandatory, all layers (personas keep it short: 2–3 skills, not 7).
3. `## Pre-flight reads` — mandatory for orchestrator/thinking-lead/validator/worker; **omitted** for thinking-persona/thinking-synthesis (they receive input directly, they don't independently explore the repo — that's what keeps a persona's verdict cheap and bounded).
4. `## Operating procedure` — mandatory, all layers.
5. `## Anti-patterns` — mandatory, all layers.
6. `## Return contract` — mandatory, all layers (mirrors frontmatter `return_contract`, human-readable).
7. `## Key distinctions` — mandatory, all layers. This is the section that answers "why does this file exist and not get merged into agent X" — every agent must be able to state its own non-duplication case, which is exactly the discipline that would have caught the `qa-engineer`/`test-engineer` near-duplication earlier.
8. `## Workflow position` — mandatory, all layers — who spawns this agent, what it spawns (if anything), what it hands back to.
9. `## Agent Teams mode (when spawned into a team)` — mandatory only for orchestrator/thinking-lead/validator/worker (any agent capable of being spawned into a T3 team); omitted for pure personas/synthesizer, which are always invoked directly by name, never as team members.

Beyond these nine, an agent may append free-form domain-specific sections (escalation examples, tool notes) — no fixed cap, but they come *after* the nine mandatory ones so every file has the same skeleton up front.

### Duplication elimination — generation, not editing

The Workflow-runtime constraint that forces `qa.js`/`coding.js`/etc. to duplicate their args-normalizer (*"the Workflow runtime has no shared-module import"*) does **not** apply to `.claude/agents/*.md` files — those are read once by the Claude Code agent loader at spawn time, not executed as JS by the Workflow runtime. That means a build-time generator is unconstrained:

```
.claude/agents/_template/AGENT.md.hbs     — one Handlebars template encoding the 9 mandatory sections + frontmatter shape
.claude/agents/_data/<name>.yml           — one small data file per agent: description, layer, model tier, tools, mcps, skills, escalation rules, free-form body content
.claude/agents/_data/models.json          — symbolic tier → literal model ID, single source of truth
.claude/agents/_build/generate.js         — reads _template + _data/*.yml + models.json, emits .claude/agents/<name>.md
```

`generate.js --check` (no writes, diff-only) is the drift check: it regenerates every file into memory and diffs against what's committed. Any mismatch — someone hand-edited a generated file instead of its data file — fails the check. This is wired into the mechanism section below, not left as a "please remember to run it" convention.

### MCP resolution table (target state — what must actually be added)

| Declared name | Real today? | Target action |
|---|---|---|
| `supabase` | Yes (`.mcp.json`) | Keep as-is. |
| `playwright`, `refero`, `pencil`, `mem0`, `stitch`, `framer-mcp` | Yes (global/project `~/.claude.json`) | Keep as-is. |
| `linear` | **No — resolves nowhere**, despite being the single most-declared name (9 agents) and 23 files calling `mcp__linear__*` | **Add to project `.mcp.json`.** This is a load-bearing gap, not a nice-to-have — session files, QA-gate tooling, and half the roster's `escalates_to`/ticket-referencing workflow assume it exists. |
| `context7` | **No — resolves nowhere**, despite being documented in CLAUDE.md's own MCP table | **Add to project `.mcp.json`** (or narrow its declared users to just `researcher`/`cto` if cost/availability is a concern — see Open questions). |
| `github` | **No — resolves nowhere** | **Drop the declaration everywhere** (8 agents). `gh *` is already unrestricted in the Bash allowlist — a dedicated MCP is redundant, not missing. |
| `ide` | Built-in, IDE-session-only, never a config entry | Document as auto/optional in the 3 code-writing engineers' MCP lists; never require it. |
| `pgvector`, `segment-cdp` | **Not MCP servers at all** — skill names miscopied into `mcpServers:` blocks | **Remove from every `mcpServers:` block.** (`pgvector-rag-beamix` and `segment-cdp` remain valid *skill* names where genuinely used.) |

**Naming fix:** standardize on `mcp__linear__*` (23 of 27 current call-sites already use it); the 4 files calling `mcp__linear-server__*` for the same integration get corrected in the same pass that adds `linear` to `.mcp.json`.

---

## The mechanism that keeps this honest

Per the locked constraint, every item below is a hook, CI check, linter rule, or generated data file — nothing here is "the agent should remember."

1. **`schema-lint.js` gets wired in** (currently correct but connected to nothing). Add it as a step in `.github/workflows/qa-lead-pass.yml`'s existing pipeline, gated at the *existing* Irreversible tier `.claude/agents/**` already carries in `.claude/qa-tier-floor.yml` — no new tier definition needed, this file path is already the highest gate in the system. Update the schema itself for: the new `layer` enum field (mandatory, validated), layer-dependent `maxTurns` ranges (table above), and the `isolation ⟺ layer` rule (table above).

2. **`generate.js --check` runs in the same CI step**, immediately before schema-lint, on every PR touching `.claude/agents/**`. A generated-vs-committed mismatch fails the same gate a schema violation would. This is what actually eliminates the duplicated-block problem going forward — not a one-time cleanup, a standing check that a hand-edit to a generated file can't silently drift from its data file.

3. **`.claude/agents/MANIFEST.json`**, generated by the same `generate.js` run, mirrors `.claude/skills/MANIFEST.json`'s pattern: one row per agent with `name, layer, model_tier, mcps, skills, spawns, spawned_by`. This is what lets the CEO or a Lead answer "which validators exist" or "which personas route to `decision_type: vendor`" by reading one small JSON file instead of grepping 31 markdown files — directly fixing the context-budget problem that made `synthesizer.md` hardcode a stale 4-persona list in the first place (it had no cheap way to discover the other 3).

4. **`.claude/agents/_data/models.json` is the only place a literal model ID string lives.** A model-generation bump is a one-line diff there, then `generate.js`, then the existing drift-check catches any file that wasn't regenerated. This is the concrete fix for "model IDs are ~2 generations stale, no mechanism to update them" — it does not rely on anyone remembering to do a 31-file sweep next time either.

5. **Board-meeting-protocol becomes 3 rounds, not 4, enforced by schema not memory.** `board-meeting-protocol` SKILL.md is rewritten to R0 (framing) → R1 (independent verdicts, personas never see each other's output) → R2 (fresh-context synthesis by `synthesizer`) — R2-cross-critique is deleted from the document, not just discouraged. The `round_protocol_position` frontmatter field is removed from every persona file (it only ever encoded the now-forbidden R1+R2 pattern) and `schema-lint.js` rejects any persona file that still declares it. Panel selection stops being `synthesizer`'s hardcoded `round_sequence` array and becomes a runtime read of `.claude/agents/MANIFEST.json` filtered by the caller-supplied `decision_type` against each persona's `decision_type_routing` field — adding a persona to the roster automatically makes it eligible for matching panels, with no second file to remember to edit. `decision_type_routing` becomes mandatory frontmatter for every `thinking-persona`-layer agent (today 3 of 6 lack it entirely), validated by `schema-lint.js`.

6. **`.mcp.json` gets `linear` and `context7` added**, and every `mcpServers:` declaration across the roster is checked against the union of `.mcp.json` + `~/.claude.json` (project- and user-scoped) by a small addition to `schema-lint.js`: a declared MCP name that resolves in no config layer is a **fail**, not a silent no-op, going forward. This is what prevents "8 of 13 declared names exist nowhere" from recurring — it becomes a build-time-detectable defect the moment someone adds a `mcpServers:` entry for a server that was never actually configured.

7. **The spawn-authority rule (`Task` in `tools` ⟺ `layer ∈ {orchestrator, thinking-lead}`) is checked by `schema-lint.js`**, and enforced at runtime by the already-locked spawn-depth hook (out of scope for this document, assumed per the brief) — belt-and-suspenders: the schema check catches a misconfigured file before it ships; the hook catches any runtime attempt regardless of what the file declares.

8. **The fan-out engine consolidation is a dependency, not a re-litigation here.** `coding.js/design.js/research.js/qa.js/capability-gap-map.js/capability-gap-map-followup.js` (6 files, 1,243 lines, each duplicating its own args-normalizer because the Workflow runtime can't share modules) collapse into one `.claude/workflows/fanout.js` dispatching on an `args.kind` parameter, with the per-kind configuration (dimension-reviewer list, verifier count, judge model, persona-panel-selection query) living as data in `.claude/workflows/_configs/<kind>.json` rather than as a sixth hand-maintained script. This is the concrete shape of the locked "one parametrized fan-out engine, configured by data" decision, and it's what the roster above assumes will exist to spawn `code-reviewer`/`security-engineer`/`adversary-engineer`/`test-engineer` by name for the QA kind and the persona panel by `decision_type_routing` query for the thinking kind. This spec treats it as a dependency (see `depends_on`) because the workflow-engine mechanics are properly a different surface's concern; the roster spec's job is only to guarantee the agent *names* the engine will reference are stable and addressable, which the `layer`-tagged, `MANIFEST.json`-indexed roster above provides.

---

## Open questions

1. **Does `context7` need an API key or paid tier before it's added to `.mcp.json`?** This spec recommends adding it (it's already documented in CLAUDE.md's MCP table as intended for `researcher`), but I don't have pricing/access-requirement information — needs a quick check before `generate.js` can assume it resolves.

2. **Should `persona-aria` join the cross-project base six, or stay Beamix-only?** Judgment call made above: keep it project-local, since "hidden CTO co-founder, B2B procurement-grade reviewer for vendor-facing surfaces" is a Beamix-specific framing (per the memory note calling it "the 4th canonical persona" *for this project*), not an obviously portable lens for the other ~10 projects this roster serves. If Adam disagrees, it's a one-line change (add to the base six, drop the "project-local extension" carve-out) — but I didn't have grounds to decide it either way with confidence.

3. **What is the actual current literal model ID to put in `models.json`?** This spec resolves the staleness problem structurally (symbolic tiers, one source of truth) but deliberately does **not** guess a literal replacement string for `claude-opus-4-7`/`claude-sonnet-4-6`/`claude-haiku-4-5` — the memory note confirms Opus 4.8 existed as of 2026-05-28, and this session itself runs as "Sonnet 5," but I don't have a confirmed, complete, current ID string for every tier. That's a one-file edit whenever confirmed — not a blocker to building the rest of this spec, but it's the one piece of data this document can't supply.

4. **Does merging `qa-engineer` into `test-engineer` lose a real separation-of-duties value?** The two files' skill lists were 6/7 identical, which is why this spec merges them — but there's a legitimate counter-argument: if the same agent (mode-parametrized or not) writes both the original TDD tests *and* the gate-time coverage-gap tests, a systematic blind spot in how it thinks about test coverage reappears at both stages instead of getting a second, differently-biased look. This spec's judgment is that mode-parametrization plus QA-Lead's independent spawn (a fresh context each time, not persistent state) is enough separation — but flagging this as a real trade-off, not a costless simplification.

5. **Is dropping the `github` MCP declaration (8 agents) in favor of `gh` CLI actually lossless?** `gh api`/`gh pr`/`gh issue` via the already-allowlisted Bash access covers everything observed in the current files' usage patterns, but this spec didn't exhaustively verify every current `mcp__github__*` call-site has a `gh`-CLI equivalent — worth a quick grep-and-confirm pass before actually deleting the declarations, not just trusting the general "gh covers it" assumption made here.
