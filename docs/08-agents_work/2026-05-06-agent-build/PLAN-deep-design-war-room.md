# Plan — Deep Design of the Beamix War Room

## Context

Across V1 (P0 audit), V2 (autonomous-army blueprint), V3 (Bastion + Adam-OS), and V4 (Linear-is-the-company), we wrote substantial strategy but the actual agent definitions and memory architecture remain shallow. The two Explore audits run today (`docs/08-agents_work/2026-05-06-agent-build/RESEARCH-01-source-agent-mds.md`, `RESEARCH-02-orchestrator-skills.md`, `RESEARCH-03-agent-md-best-practices-2026.md` plus today's inventory) confirm Adam's instinct: **we are messing around.**

Specifically:
- **Agent quality:** 32 .md files exist; 30% A-grade, 47% B-grade, 22% C-grade. 12 are dead GSD weight (`executor`, `planner`, `verifier`, `debugger`, `plan-checker`, `roadmapper`, `phase-researcher`, `integration-checker`, `project-researcher`, `research-synthesizer`, `codebase-mapper`, `nyquist-auditor`). ~46 of V4's 60-agent target are missing or stubs. The 3 agents I drafted today (CEO, CTO, QA Lead) are better than what existed but were written in one pass without rigorous prompt engineering.
- **Memory is theater:** `LONG-TERM.md` and `CODEBASE-MAP.md` are orphaned (no agent reads them). Zero agents read `docs/00-brain/` MOCs. Zero functional retrieval infrastructure exists — no pgvector, no Memory Tool wiring, no MCP memory server. Every session re-reads the 42K-token MANIFEST.json. Decisions D8-D14 are plan, not reality.
- **Orchestration is implicit:** R3 surfaced that subagents cannot spawn subagents. Our V4 mental model assumed a 3-layer hierarchy that Anthropic's spec doesn't support. We need to design the ACTUAL spawning + chaining contracts (Routine-to-Routine, main-thread Task spawning, durable-execution layer).
- **Tech stack is sketched, not pinned:** $33/mo, $0-8/mo, "Bastion Mac" — none of these are concretely allocated component-by-component with a real BOM, a real DR plan, real observability instrumentation.

**The intended outcome of this plan:** stop writing rushed .md files. Build the **foundations first** (memory, orchestration, tech stack, connection layer, synthesis), and **design agents LAST** so they're built against a stable platform — not the other way around. Per Adam's instruction (2026-05-06): *agent planning and writing tier-by-tier is the last workstream in the process.*

This plan is the path from "32 mediocre agents on theatrical memory" to "production-grade memory + orchestration + tech stack + connections — and only then ~60 agents designed deliberately on top of that foundation."

---

## The 6 workstreams (foundations first, agents last)

### Workstream 1 — Memory Architecture Deep Design (the WHERE knowledge lives)

**Why first:** every agent's behavior depends on what it can remember and retrieve. Designing agents before locking memory architecture means redesigning agents when memory changes. Memory is the substrate.

**Goal:** replace today's "agents write to DECISIONS.md, no one reads anything else" with a real architecture where memory is searchable, retrievable, time-decayed, provenance-tracked, and actually consulted.

**Sub-phases:**

- **1A — Re-evaluate third-party memory tools (honest comparison, not the V2/V3 "skip them" reflex):**
  - Letta (formerly MemGPT) — agent files, structured memory blocks, archival memory
  - Mem0 — multi-modal memory layer
  - Zep + Graphiti — temporal knowledge graph
  - Cognee — graph + vector hybrid, ECL pipeline
  - OpenAI Memory in Assistants API
  - Anthropic Memory Tool (`memory_20250818` beta) — file-based `/memories`, ZDR
  - Custom MCP memory server (we build one against pgvector)
  
  Output: decision matrix (cost, lock-in, Claude Code compatibility, retrieval quality, write semantics, provenance support, supersession handling). RECOMMENDATION committed.

- **1B — Design the L0-L5 memory stack with concrete tool per layer:**
  - L0 Boot: `CLAUDE.md` ≤ 200 lines — the project conventions
  - L1 Session: Claude Code session + auto-`/compact` at 70%
  - L2 Cross-session episodic ("what happened last time"): chosen tool from 1A
  - L3 Project facts (PRD, ENGINEERING_PRINCIPLES, brain MOCs, decisions): pgvector RAG corpus on Supabase
  - L4 Skills: pgvector embedding-search via `tool_search` MCP — replaces 42K-token MANIFEST.json discovery
  - L5 Codebase: pgvector index of `apps/web/src/**` for "where is X defined" queries
  
  For each layer: write contract (who writes what schema), read contract (when each agent queries with what query), retrieval quality target (top-K, recall@5).

- **1C — Design RAG corpora & ingestion:**
  - Codebase RAG: re-embed on every PR merge (Inngest job)
  - Decision/session/brain RAG: re-embed on git commit to the relevant paths
  - Skill RAG: re-embed when SKILL.md files change
  - Embedding model choice: `all-MiniLM-L6-v2` local (fast, $0) for short text, `text-embedding-3-large` (OpenAI, $0.13/M tokens) for nuanced queries — decision matrix
  - Chunking strategy per corpus

- **1D — Memory write contracts (the SCHEMA):**
  - Every memory entry MUST have: `source: <agent>+<session>+<input_hash>`, `confidence: low/med/high`, `expires_at: <30/90/never>`, `topic_tags: []`. Low-confidence auto-expires in 30 days.
  - Supersession: when a new entry contradicts an old one, the new one writes `supersedes: <old-entry-id>` and the old one auto-archives.
  - Provenance: every entry traces back to a session file in `docs/08-agents_work/sessions/`.

- **1E — Memory read contracts (the per-agent mental model — this becomes input to WS6):**
  - Pre-flight reads: limit to 1-2 layers per agent (R3 best practice)
  - On-demand reads: agents call MCP tools (`memory_search`, `decision_search`, `code_search`) when they need context
  - Output: a per-role "memory mental model" doc that WS6 will reference when designing each of the 60 agents

- **1F — Migration plan from current state:**
  - Audit all current memory files; categorize as keep/migrate/archive/delete
  - Migrate `DECISIONS.md` → Supabase table with provenance
  - Migrate `docs/00-brain/` MOCs → pgvector corpus
  - Delete orphan files (e.g., `feedback_design_preferences.md`, `feedback_engine_colors.md` per audit)
  - Compact `MEMORY.md` from 270 lines back under 200

**Deliverables:**
- Decision matrix from 1A with locked tool per layer
- Architecture spec (`docs/08-agents_work/MEMORY-ARCHITECTURE.md`)
- pgvector schema migrations (`apps/web/supabase/migrations/`)
- MCP memory server config (or vendored, depending on 1A outcome)
- Migration runbook with old→new mapping
- Per-role memory mental model doc (input to WS6)

---

### Workstream 2 — Orchestration Architecture (the HOW agents collaborate)

**Why second:** depends on WS1 (memory layer must exist for agents to share state). Output is the spawning + chaining + durable-execution model that every agent in WS6 must conform to.

**Goal:** make explicit who-spawns-whom, with what mechanism, with what handoff format, with what durable-execution guarantees.

**Sub-phases:**

- **2A — Spawning relationship matrix:** every agent's `can_spawn` allowlist. Workers spawn nothing (anti-bureaucracy). C-suite Routines spawn workers via Task. Cross-Routine calls go through Cloudflare bridge or Anthropic API.

- **2B — Routine-chaining contract:** when CEO Routine needs to invoke CTO Routine (separate main thread). Three options to compare:
  - (i) CEO calls Anthropic API to fire CTO Routine; CTO writes back to Linear; CEO polls Linear for completion
  - (ii) CEO writes a Linear sub-ticket with `agent:cto` label; the Cloudflare bridge re-fires with CTO routing; CTO comments back; CEO observes via webhook
  - (iii) CEO uses Task to spawn CTO as a SUBagent (loses "main thread" status — CTO can't spawn workers)
  
  Recommendation locked.

- **2C — Durable execution:** what happens if a Routine crashes mid-task? Compare Inngest (already in stack) / Trigger.dev v3 / Anthropic's own retries / custom Postgres job table.

- **2D — Async-spec-trust mode contract:** what the trigger payload must include for an agent to skip pre-flight reads. Schema, who can issue the trust flag, audit trail.

- **2E — Standing Routines specification:** the 5 heartbeat + 3 signal Routines, each with cron, model, system-prompt source file, MCP grants, $ cap, `claude-progress.txt` write contract for cross-Routine coordination.

- **2F — Board meeting protocol** (the V3 §3 "5 personas" pattern): how `/board-meeting` spawns 5 personas in parallel Round-1 (no anchoring), then full-trace Round-2, then synthesizer fresh-context. Concrete file paths, JSON message contracts, hard caps.

- **2G — Cross-agent observability:** the `claude-progress.txt` shared state, the `audit_log` Supabase table, the disler dashboard wire-up.

**Deliverables:**
- Orchestration spec (`docs/08-agents_work/ORCHESTRATION.md`)
- The locked Routine-chaining mechanism with code/config
- Durable-execution choice + wiring plan
- Spec for the 8 standing Routines (input to WS6, but the Routines themselves are agent definitions written in WS6)
- Board-meeting protocol design
- Observability dashboard spec

---

### Workstream 3 — Tech Stack & Hosting Pinning (the WHERE compute runs)

**Why third (parallel-eligible with WS1/WS2):** locks the BOM independently. Has no dependency on WS1/WS2 outputs and no downstream blocker — but its outputs feed WS4 (connection layer) and WS6 (agent model assignments).

**Goal:** every component pinned to a specific home with a specific role and a specific failure mode.

**Sub-phases:**

- **3A — BOM pin:** every component (Anthropic API, Routines, Cloudflare Workers/R2/KV, Supabase, GitHub Actions, Vercel, Linear, Telegram bot, iOS Shortcut, Mac Bastion, optional VPS, Tailscale) gets: cost line item, role, failure mode, who-calls-it, who-replaces-it.

- **3B — Bastion role decision:** acceleration only, or critical path? If critical, decide: home Mac with UPS + Tailscale, OR $5-30/mo VPS as failover, OR replace with second Anthropic Routine for everything. Lock the call.

- **3C — Observability stack:** disler dashboard self-host (Bun+SQLite), OR Langfuse self-host (need to confirm fits in 8GB), OR Langfuse Cloud free tier, OR AgentOps. Decision matrix + lock.

- **3D — Cost-tracking instrumentation:** OpenTelemetry export with what metrics, to what backend, with what dashboards. The "$/feature shipped" KPI we want to track.

- **3E — Disaster recovery:** Anthropic API down 12h, Linear API breaking change, Cloudflare account compromise, Bastion Mac stolen, Supabase data corruption — playbook for each.

- **3F — Scaling cliffs:** at 25 / 50 / 100 / 500 customers, what breaks first, what to add, with $/mo deltas.

**Deliverables:**
- BOM doc with line-item costs and ownership (`docs/08-agents_work/TECH-STACK.md`)
- Locked observability choice
- DR runbooks (one per scenario in `docs/07-history/runbooks/`)
- Scaling-cliff doc with $/mo trajectory

---

### Workstream 4 — Connection Layer (the GATEWAYS to external)

**Why fourth:** depends on WS2 (chaining mechanism) and WS3 (tech stack pin). Output is the contract every external surface obeys, which feeds WS6 (agent triggers + return formats).

**Goal:** every external surface (Linear, GitHub, Telegram, iOS, Cloudflare bridge) has an explicit contract — what events, what payloads, what auth, what retries, what idempotency.

**Sub-phases:**

- **4A — Linear contract:** every webhook event we care about (`Issue:created/updated`, `Comment:created`, `IssueLabel:added/removed`, `Project:updated`); comment formats per agent type; label semantics (`agent:cto`, `tier:full`, `risk:irreversible`, `proposed-by-agent`); MCP usage per agent.

- **4B — GitHub contract:** `claude-code-action@v1` configuration; branch naming policy (`feat/`, `fix/`, `chore/`); PR template; mention semantics (`@claude` for general, plus per-persona mentions if shipped); auto-merge rules + QA Lead PASS dependency.

- **4C — Telegram contract:** bot routing matrix (default → CEO, `@cto` → CTO, `@qa` → QA Lead); escalation format (binary-ping spec); idempotency on retries; rate limit on incoming.

- **4D — iOS Shortcut contract:** voice → Anthropic API (Haiku) → Linear ticket payload schema; auth via `SHORTCUT_SECRET`; failure modes (timeout, dictation error).

- **4E — Cloudflare Worker contract:** request/response schema for `/linear`, `/idea-capture`, `/health`; HMAC verification; secret rotation policy; retries with exponential backoff; idempotency keys.

- **4F — Anthropic Routines contract:** which Routines exist, what each accepts as input, what each returns, $ caps per Routine, how chains work (2B output).

**Deliverables:**
- Connection contracts doc (`docs/08-agents_work/CONNECTIONS.md`)
- Cloudflare Worker code (`infra/cloudflare-bridge/src/index.ts` + `wrangler.toml`)
- GitHub workflow YAML (`.github/workflows/claude.yml`)
- iOS Shortcut export (`infra/shortcuts/Capture-Beamix-Idea.shortcut`)
- Telegram routing config doc

---

### Workstream 5 — Synthesis (the MASTER DOC)

**Why fifth:** ties WS1-4 into one readable design BEFORE agents are written, so WS6 has a single coherent target. Without this synthesis, agent design has to re-derive how everything connects.

**Goal:** one document that an executing team can read in 30 minutes and explain to a hypothetical first hire.

**Deliverables:**
- Master design doc (`docs/08-agents_work/MASTER-DESIGN.md`) with:
  - Org chart visual (Mermaid or ASCII)
  - Data flow visual (request enters → agent picks up → Linear update)
  - Memory architecture visual (L0-L5 stack with arrows)
  - Deployment topology visual (Bastion + cloud + devices)
  - The "Adam operating manual" — one page on day-to-day use
  - The agent design template (output of WS1-4 distilled into a fillable per-agent spec — this is what WS6 fills in 60 times)
  - Honest limitations + open questions

---

### Workstream 6 — Agent Logic Design, Tier by Tier (the LAST workstream)

**Why last (per Adam's 2026-05-06 instruction):** agents are designed against a stable platform. Memory exists. Orchestration is locked. Tech stack is pinned. Connection contracts are written. Master design is published. Only then do we design ~60 agents that USE all of that — they don't define it.

**Goal:** every agent in the V4 roster (~60 agents) has a deliberately-designed definition with prompt engineering, minimal tools, scoped MCPs, the right 2-3 skills, model assigned by complexity, structured returns, and clear org position.

**Per-agent design checklist (applied rigorously, not in one pass):**

```yaml
agent: <role-name>
job_to_be_done: 1 sentence — the value this agent produces
prompt_design:
  role_frame: who-this-agent-is, in 2-3 sentences (e.g., "You are a principal-skeptic adversary reviewer...")
  expertise_frame: 3-5 bullets of domain knowledge the agent leans on
  behavioral_traits: 3-5 bullets — tone, defaults, escalation posture
  output_format: free-form vs JSON contract vs PR-only
tool_grants: minimal allowlist (Vercel "remove 80%" rule)
skills: max 3, specific names from .agent/skills/
mcp_servers: per-agent inline scoped (R3 best practice)
model: haiku | sonnet | opus by complexity
isolation: worktree (yes/no — yes for code workers)
maxTurns: appropriate ceiling (not target)
position:
  reports_to: <parent agent>
  peers: <list>
  key_distinctions: vs each peer, 1 sentence
trigger: what fires this agent (from WS4 connection contracts)
memory_access: which L0-L5 layers this agent reads at startup vs on-demand (from WS1 mental model)
return_contract: JSON schema specific to role (conforms to WS2 chaining contract)
escalation: when to BLOCK vs auto-fix vs return PARTIAL
vendored_from: source repo + commit SHA if applicable
```

**Sub-phases (sequential — each gets a deliverable + Adam review before next starts):**

- **6A — C-suite + QA Lead (7 agents):** ceo, cto, cpo, cmo, cbo, cco, qa-lead.
- **6B — Team Leads (~14):** code-lead, design-lead, security-lead, devops-lead, ai-lead, data-lead under CTO; pm, ux-researcher, analyst under CPO; content-lead, seo-geo-lead, growth-lead under CMO; cfo, legal-counsel, talent under CBO; support-lead, onboarding-lead, investor-relations under CCO.
- **6C — Engineering Workers (~15):** backend-engineer, frontend-engineer, mobile-engineer, devops-engineer, ai-engineer, data-engineer, ml-engineer, security-engineer, qa-engineer, performance-engineer, product-designer, ux-designer, brand-designer, motion-designer, technical-writer.
- **6D — Cross-functional Workers (~25):** content-writer, copywriter, seo-specialist, geo-specialist, growth-marketer, paid-ads, email-specialist, social-specialist; market-researcher, user-researcher, competitive-analyst; finance-analyst, compliance-analyst, pricing-analyst, recruiter; customer-success, sdr, account-executive, support-engineer, onboarding-specialist; adversary-engineer (the procurement-grade reviewer for QA Full-tier).

**Per sub-phase methodology:**
1. Research dispatch (2 parallel agents) — mine wshobson/agents + BMAD + spec-kit + agent-os for proven prompts/patterns for this tier
2. Design dispatch (1 design agent) — apply the per-agent checklist using WS1-5 outputs (memory mental model, orchestration contracts, tech stack pins, connection contracts, master design)
3. Adam reviews the design table (not all .md files in detail) — picks which to refine, kills any that shouldn't exist
4. Build wave — final .md files written to `.claude/agents/`, kill old/dead files
5. Validate by stress-testing on real Linear tickets BEFORE next sub-phase
6. Memory update — DECISIONS.md entry, brain/log.md, sessions file
7. Move to next sub-phase only after current is approved + validated

**Deliverables:**
- 6A → 7 production-grade C-suite + QA Lead .md files (replaces today's CEO/CTO/QA-Lead drafts)
- 6B → 14 team-lead .md files
- 6C → 15 engineering-worker .md files
- 6D → 25 cross-functional .md files
- Final: 61 total agent definitions (V4 target hit) + 12 dead GSD agents archived

---

## Per-workstream methodology (the rigor that's been missing)

Each workstream follows this loop:

1. **Research dispatch** — 2-4 parallel agents pull external sources + audit local state. Output: structured research file. Cost cap: $30/workstream.
2. **Design dispatch** — 1-2 design agents produce the architecture. Output: design table or spec doc, NOT final code.
3. **Adam review** — read the design, push back, request changes. We iterate up to 3 cycles.
4. **Build wave** — once design approved, write the actual code/files.
5. **Verification** — end-to-end test of the deliverable.
6. **Memory update** — DECISIONS.md entry, brain/log.md, session file. Verified by WS1's read-contract that agents actually consume these.

WS6 has 4 sub-phases (6A-6D), each running this 6-step loop. Sub-phases are sequential — 6B doesn't start until 6A is approved AND validated on real tickets.

---

## Sequencing & dependencies

```
WS1 — Memory architecture
  │
  ├──► WS2 — Orchestration       (depends on WS1's read/write contracts)
  │      │
  │      └──► WS4 — Connection layer  (depends on WS2's chaining mechanism)
  │             │
  │             └──► WS5 — Synthesis  (after foundations 1+2+3+4)
  │                    │
  │                    └──► WS6 — Agent design tier-by-tier  (LAST)
  │                            │
  │                            └──► 6A → 6B → 6C → 6D
  │
  └──► WS3 — Tech stack pin       (parallel with WS1/WS2 — locks BOM independently)
                  │
                  └──► (feeds WS5 synthesis)
```

**Critical path:** WS1 → WS2 → WS4 → WS5 → WS6. WS3 runs in parallel.

**WS6 starts only after WS1-5 are approved.** This is the foundations-first → agents-last principle Adam locked on 2026-05-06.

---

## Decisions locked by Adam (2026-05-06)

**Q1 — WS6 cadence: tier-by-tier, ship + validate.**
6A (7 C-suite + QA Lead) is designed, built, deployed, and validated on real Linear tickets BEFORE 6B starts. Each tier's lessons feed the next tier's per-agent checklist. No big-bang design pass.

**Q2 — Today's CEO/CTO/QA-Lead drafts: throwaway, redesigned in WS6A.**
The 3 .md files I wrote in `.claude/agents/{ceo,cto,qa-lead}.md` today are NOT to be wired into Routines. They stay in git history as `v0 drafts` for reference but WS6A produces the production v1 versions from scratch using the per-agent design checklist. No sunk cost; no migration debt.

**Q3 — Agent design is LAST, not first.**
Foundations come before agents. WS1 (memory) → WS2 (orchestration) → WS3 (tech stack, parallel) → WS4 (connections) → WS5 (synthesis) → WS6 (agents, tier-by-tier). This is the inverse of my original sequencing and is the correct order.

**Q4 — Execution stance: PLANNING ONLY this session.**
This document is a handoff plan for the next team that picks up the work — not a kickoff plan for the current session. No workstreams are started in this session. The role of this document is to be the SPEC the next team executes against.

## Other defaults (Adam can correct)

- **Memory tool re-evaluation:** WS1A re-opens the third-party question (Letta/Mem0/Zep/Cognee/Graphiti vs Anthropic Memory Tool vs custom MCP). Output: decision matrix → committed call.
- **Agent design depth:** rigorous (5-10 hours of compute across all WS6 sub-phases). Quality > speed.
- **Cost guardrails:** each workstream caps at $30 of API spend (~$180 total). If exceeded, halt + escalate.

---

## What we will explicitly NOT do (anti-scope)

- Write hasty .md files without per-agent design checklist
- Design any agent before WS1-5 are locked
- Ship memory architecture without read/write contracts AND a migration plan
- Spawn Routines without verifying the agents they call exist + are tested
- Skip prompt-engineering rigor on any agent (every agent gets role frame + expertise frame + behavioral traits + output format)
- Make tech-stack decisions without the BOM matrix from 3A
- Build connection layer (4) before WS2 picks the chaining mechanism

---

## What carries forward (don't re-do)

- V1-V4 strategic frame (`docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-CORPORATE-OS.md`)
- R1-R3 research from today (`docs/08-agents_work/2026-05-06-agent-build/RESEARCH-0[1-3]-*.md`)
- The 3 agents written today (CEO, CTO, QA Lead) — TREAT AS DRAFT V0; redesigned in WS6A
- Setup guide for Linear/Cloudflare/GitHub (`docs/08-agents_work/2026-05-05-war-room-rethink/SETUP-GUIDE-step-by-step.md`) — referenced during WS4 build phase
- Wave A P0 fixes (kill 12 GSD agents, sed `saas-platform/`) — done as Wave 0 alongside WS6A start (NOT before — they are agent-file changes, fall under WS6's domain)

---

## Critical files / paths to be created or modified

**Created in WS1 (memory):**
- `docs/08-agents_work/MEMORY-ARCHITECTURE.md` (the spec)
- `apps/web/supabase/migrations/<date>_memory_pgvector.sql`
- `infra/mcp-servers/memory/` (if we build custom MCP, decided in 1A)
- `apps/web/src/inngest/functions/embed-{decisions,sessions,brain,codebase}.ts`

**Created in WS2 (orchestration):**
- `docs/08-agents_work/ORCHESTRATION.md` (the spec)
- `.claude/commands/board-meeting.md` (the slash command)

**Created in WS3 (tech stack):**
- `docs/08-agents_work/TECH-STACK.md` (BOM + DR + scaling cliffs)
- `docs/07-history/runbooks/{anthropic-outage,linear-api-break,cloudflare-compromise,bastion-stolen,supabase-corruption}.md`

**Created in WS4 (connection layer):**
- `docs/08-agents_work/CONNECTIONS.md` (every contract documented)
- `infra/cloudflare-bridge/{wrangler.toml,src/index.ts,package.json,README.md}`
- `.github/workflows/claude.yml`
- `infra/shortcuts/Capture-Beamix-Idea.shortcut` (export of the iOS Shortcut)

**Created in WS5 (synthesis):**
- `docs/08-agents_work/MASTER-DESIGN.md`
- The agent design template (input to WS6)

**Created in WS6 (agents, LAST):**
- `.claude/agents/{ceo,cto,cpo,cmo,cbo,cco,qa-lead}.md` (6A — replaces today's drafts)
- `.claude/agents/{code-lead,design-lead,security-lead,devops-lead,ai-lead,data-lead}.md` (6B)
- `.claude/agents/{pm,ux-researcher,analyst,content-lead,seo-geo-lead,growth-lead,cfo,legal-counsel,talent,support-lead,onboarding-lead,investor-relations}.md` (6B)
- `.claude/agents/{backend-engineer,frontend-engineer,mobile-engineer,devops-engineer,ai-engineer,data-engineer,ml-engineer,security-engineer,qa-engineer,performance-engineer,product-designer,ux-designer,brand-designer,motion-designer,technical-writer}.md` (6C)
- `.claude/agents/{content-writer,copywriter,seo-specialist,geo-specialist,growth-marketer,paid-ads,email-specialist,social-specialist,market-researcher,user-researcher,competitive-analyst,finance-analyst,compliance-analyst,pricing-analyst,recruiter,customer-success,sdr,account-executive,support-engineer,onboarding-specialist,adversary-engineer}.md` (6D)
- `.claude/agents/_routines/{morning-digest,eod-sync,auto-unblock,monday-standup,friday-retro,competitor-signal,customer-voice-signal,geo-algorithm-signal}.md` (the 8 standing Routines, designed in 6 using WS2's spec)
- `.claude/agents/_archive/` directory (move 12 dead GSD agents here)

**Modified:**
- `CLAUDE.md` (compact to ≤200 lines per audit) — WS1
- `.claude/memory/MEMORY.md` (compact from 270 to ≤200) — WS1F
- `.claude/settings.json` (permissions block + MCP servers) — WS2
- `docs/00-brain/_INDEX.md` and MOC files (point to new memory architecture) — WS1

---

## Existing functions / utilities to reuse

- **R3 best practices spec** (`docs/08-agents_work/2026-05-06-agent-build/RESEARCH-03-agent-md-best-practices-2026.md`) — every agent in WS6 must conform
- **R2 skill stack** (`docs/08-agents_work/2026-05-06-agent-build/RESEARCH-02-orchestrator-skills.md`) — load 2-3 from inventory per agent; replace 4 stubs (`full-stack-orchestration`, `clarity-gate`, `context-restore/save`)
- **R1 source patterns** (`docs/08-agents_work/2026-05-06-agent-build/RESEARCH-01-source-agent-mds.md`) — Workflow Position, Key Distinctions, "Use PROACTIVELY for X", Orchestrator-as-Ledger
- **V4 environment map** (`docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md`) — cost & topology constraints
- **Setup guide** (`docs/08-agents_work/2026-05-05-war-room-rethink/SETUP-GUIDE-step-by-step.md`) — referenced during WS4 build phase
- **Existing high-quality skills** (per R2 inventory): `multi-agent-patterns` (A), `context-compression` (A), `context-degradation` (A), `memory-systems` (A), `dispatching-parallel-agents` (B), `linear-automation` (B+), `github-automation` (B+), `mcp-builder` (B+)

---

## Hand-off note for the next team

The team picking this up should:

1. **Read this plan end-to-end before doing anything.**
2. Read the four prerequisite reference docs (R1, R2, R3, V4 environment map).
3. Read today's CEO/CTO/QA-Lead drafts at `.claude/agents/{ceo,cto,qa-lead}.md` ONLY to see what NOT to do (rushed blends without per-agent checklist).
4. **Start with WS1A (memory tool re-evaluation).** That's the foundation. Do NOT start with WS6 (agents) — that's last.
5. Each workstream's 6-step methodology is non-negotiable. Halt at the Adam-review step.
6. Do NOT proceed past a workstream until Adam approves its deliverable.
7. WS6 only begins after WS1-5 are all approved AND the master design doc (WS5 output) is published.
8. WS6 sub-phases are sequential. 6B doesn't start until 6A is approved AND validated on at least 3 real Linear tickets.
9. After every workstream sub-phase, write a session file at `docs/08-agents_work/sessions/YYYY-MM-DD-[lead]-ws[N][letter]-[slug].md`.
10. Cost cap is $30 per workstream. If approaching, halt and escalate to Adam — never blow past silently.

---

## Verification — how we know each workstream is done

| Workstream | Verification |
|-----------|--------------|
| **WS1** | (a) Decision matrix from 1A approved. (b) pgvector tables exist + populated. (c) `tool_search` MCP serves a sample query <200ms. (d) Test agent demonstrably reads from L3 in pre-flight (verified via session-file audit). |
| **WS2** | (a) Spawning matrix published. (b) Routine-chain mechanism chosen + smoke-tested with a stub Routine. (c) Durable execution choice documented + sample retry tested. (d) Board-meeting protocol sample run produces a synthesizer output. |
| **WS3** | BOM totals match the audit; DR runbooks rehearsed (Anthropic outage simulated by pausing the Routine — fleet recovers gracefully). |
| **WS4** | All 5 surfaces tested end-to-end with payload examples logged. Cloudflare Worker `/health` 200s for 7 days straight. |
| **WS5** | Master design doc is one document Adam can read in 30 minutes and explain to a hypothetical first hire. The agent design template is one fillable spec used in WS6. |
| **WS6A** | All 7 C-suite + QA agents pass R3 lint (frontmatter complete, isolation set, JSON return contract, ≤220 lines, 2-3 skills, scoped MCPs, memory access pattern documented per WS1E mental model). Adam reviews design table. Validation: 3 real Linear tickets handled end-to-end with each C-suite at least once. |
| **WS6B-6D** | Same R3 lint per tier. Plus: Adam picks 3 random agents per tier and stress-tests them with a real ticket. |

**Final integration test (after WS6D):** Adam takes a 1-day vacation. Files 5 Linear tickets across 3 projects on the morning of day 1. By morning of day 2 (he's still away): all 5 have status updates, 2 have PRs awaiting his approval, 1 has a board-meeting recommendation, 1 was rejected by ANTI-ROADMAP with reason, 1 is BLOCKED with a binary-ping awaiting his answer. Total cost <$5. **If this works, the war room is real.**

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Designing 60 agents takes weeks → never ship | Tier-by-tier; ship 6A (7 agents) first; validate by using them; only then proceed |
| Memory architecture decisions cascade and re-open prior decisions | WS1A produces a decision matrix and locks; future workstreams reference, never re-litigate |
| Workstream creep (each becomes "while we're here, let's also...") | Hard scope gates per workstream; new ideas → BACKLOG, not in-flight |
| Cost runs away during research/design dispatch | $30/workstream cap; halt + escalate at threshold |
| Agent quality regresses under time pressure | Per-agent R3 lint is mechanical and non-negotiable in WS6 |
| External vendor evaluation in WS1A becomes endless | Hard time-box; vendors that don't have working Claude Code integration in <30 min are out |
| Foundations (WS1-5) get rushed because team is eager to write agents | The next team must understand: agents on bad foundations = redo agents. The discipline is foundations-first. |
