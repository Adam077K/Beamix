# GSA Startup Kit — Project Context
*Auto-loaded by Claude Code on every session*

---

## The Team

This project runs a 3-layer autonomous startup team. **Start every task with the CEO agent.**

```
Layer 1 ── CEO
              │ Entry point for ALL tasks. Questions → team assembly → delegate → synthesize.
              │
Layer 2 ── Team Leads (9 fixed)
              │ build-lead | research-lead | design-lead | qa-lead | devops-lead
              │ data-lead  | product-lead  | growth-lead | business-lead
              │
Layer 3 ── Workers (9 new + 12 gsd-* execution agents)
              backend-developer | frontend-developer | database-engineer | ai-engineer
              security-engineer | test-engineer | code-reviewer | researcher | technical-writer
              + gsd-executor | gsd-planner | gsd-debugger | gsd-verifier | [8 others]
```

**How to start any session:** Talk to CEO directly, or use a slash command.
**Slash commands:** `/build` `/fix` `/design` `/review` `/daily` `/plan` `/ship` `/audit` `/research`
**Agent identity:** `/color [colorname]` — set badge color · `/name [session-name]` — name the session

See `AGENTS.md` for the full routing table.

---

## Skills Library

This project includes **426+ expert skills** at `.agent/skills/[skill-name]/SKILL.md`.

**Skills load on-demand — never preload:**
```bash
# Step 1: Read .agent/skills/MANIFEST.json — filter by tags matching task domain
# Step 2: Load 3-5 matching .agent/skills/[name]/SKILL.md files (leads/CEO)
#         Load 2-3 matching .agent/skills/[name]/SKILL.md files (workers)
# Never use ls | grep directly — 426 skills makes grep unreliable
```

**Canonical discovery:** Read `.agent/skills/MANIFEST.json` and filter by tags. Never `ls | grep`.

**Source:** See [SKILLS_SOURCE.md](SKILLS_SOURCE.md) for upstream and update instructions.

Skill categories available:
- **AI/ML:** ai-engineer, rag-engineer, langgraph, prompt-engineering, voice-agents, multi-agent-patterns, and 50+ more
- **Frontend:** nextjs-app-router-patterns, react-patterns, tailwind-design-system, radix-ui-design-system, and more
- **Backend:** nodejs-backend-patterns, prisma-expert, postgresql, api-design-principles, error-handling-patterns, and more
- **DevOps:** cloudformation-best-practices, github-actions-templates, vercel-deployment, inngest, trigger-dev, and more
- **Business:** startup-financial-modeling, pricing-strategy, market-sizing-analysis, competitive-landscape, and more
- **SEO/Growth:** seo-content-writer, copywriting, marketing-psychology, email-systems, page-cro, and more
- **Security:** security-audit, web-security-testing, sql-injection-testing, wcag-audit-patterns, and more
- **Data:** data-scientist, dbt-transformation-patterns, segment-cdp, sql-optimization-patterns, and more

---

## Stack Defaults

```
Marketing:  Framer (separate project — NOT in this repo)
Product:    Next.js 16 (App Router), TypeScript (strict), Tailwind CSS, Shadcn/UI
Backend:    Next.js API Routes / Server Actions, Zod validation
Database:   Supabase
Auth:       Supabase Auth
Payments:   Paddle
Email:      Resend
Jobs:       Inngest
Hosting:    Vercel (product only)
AI:         OpenAI, Claude, Gemini, Perplexity (direct API integration)
```

*Override any of these per-project by editing this section.*

---

## Memory

| File | Purpose | Updated by |
|------|---------|-----------|
| `.claude/memory/DECISIONS.md` | Architecture + strategy decisions with rationale | Any agent making a decision |
| `.claude/memory/CODEBASE-MAP.md` | Key files, patterns, tech debt | Code Reviewer |
| `.claude/memory/USER-INSIGHTS.md` | Customer language, pain points, JTBD | Research Lead |
| `.claude/memory/LONG-TERM.md` | Cross-session facts: user prefs, project patterns, recurring issues | CEO after each session |
| `.claude/memory/sessions/` | Team lead session summaries (YYYY-MM-DD-[lead]-[task].md) | Each team lead |
| `.claude/memory/specs/` | Product specs written by Product Lead | Product Lead |

## Brain — Knowledge Navigation (docs/00-brain/)

**Before searching the full docs tree, read the relevant MOC in `docs/00-brain/`.** MOCs (Maps of Content) are navigation hubs that link to every document by domain. They save agents from blindly scanning 95+ files.

**Navigation flow:** `_INDEX.md` → domain MOC → specific document

| MOC File | Domain | Who reads it |
|----------|--------|-------------|
| `docs/00-brain/_INDEX.md` | Master hub — links to all 8 MOCs | CEO (every session) |
| `docs/00-brain/MOC-Product.md` | PRD, roadmap, 28 feature specs | product-lead, ceo |
| `docs/00-brain/MOC-Architecture.md` | System design, DB, APIs, tech stack | build-lead, backend-developer |
| `docs/00-brain/MOC-Business.md` | Vision, market, competitive, pricing | business-lead, research-lead |
| `docs/00-brain/MOC-Marketing.md` | GTM, messaging, SEO, channels | growth-lead |
| `docs/00-brain/MOC-Codebase.md` | Code map, patterns, conventions, tech debt | build-lead, code-reviewer |
| `docs/00-brain/MOC-History.md` | Changelog, decisions, audits, session logs | ceo, all leads |
| `docs/00-brain/MOC-Metrics.md` | North star, unit economics, growth | business-lead, data-lead |
| `docs/00-brain/MOC-Agents.md` | 32 agent definitions, commands, memory | ceo |
| `docs/00-brain/log.md` | Chronological activity record (append-only) | ceo, all leads |

**Rules:**
1. CEO reads `_INDEX.md` during pre-flight (after CLAUDE.md + memory)
2. Leads read their domain MOC before starting work
3. After significant work, CEO appends a line to `log.md`
4. MOCs are the source of truth for "what docs exist and where"

**Obsidian vault:** These same files power the Beamix Brain Obsidian vault at `~/BeamixBrain/` with 3D graph visualization.

---

## Project Documentation (docs/)

All startup project documentation lives in `docs/`. Agents **must** read and update the relevant file for their domain.

| Folder / File | Purpose | Owner |
|---------------|---------|-------|
| `docs/00-brain/` | Knowledge navigation MOCs + activity log | ceo, all leads |
| `docs/PRD.md` | Master product requirements | product-lead |
| `docs/BACKLOG.md` | Prioritized task backlog | product-lead, ceo |
| `docs/ENGINEERING_PRINCIPLES.md` | Code conventions + tech decisions | build-lead |
| `docs/COMPETITIVE_RESEARCH.md` | Competitive intelligence summary | research-lead |
| `docs/01-foundation/` | Vision, business model, target market, personas | ceo, business-lead |
| `docs/02-competitive/` | Landscape, positioning, moat, competitor profiles | research-lead |
| `docs/03-system-design/` | Architecture, stack, DB schema, API contracts, ADRs | build-lead |
| `docs/04-features/` | Roadmap, user stories, feature specs | product-lead |
| `docs/05-marketing/` | GTM, messaging, SEO, channels | growth-lead |
| `docs/06-codebase/` | Code map, conventions, patterns, tech debt | code-reviewer |
| `docs/07-history/` | Changelog, decisions, pivots, milestones | ceo, all leads |
| `docs/08-agents_work/` | Task index, session logs, handoffs | ceo, all leads |
| `docs/09-metrics/` | North star, growth metrics, unit economics | business-lead, data-lead |
| `docs/product-rethink-2026-04-09/` | **AUTHORITATIVE** — all decisions from April 2026 rethink | ceo, all leads |

**Template files** (copy + rename before filling): `_TEMPLATE.md` in `competitors/`, `adr/`, `specs/`, `sessions/`, `handoffs/`.

---

## MCPs — Full Availability Reference

All agents MUST check this table and use the appropriate MCP for their domain. Never use raw file reads or curl when an MCP tool exists for the job.

| MCP | Tool prefix | Who uses it | What for |
|-----|-------------|-------------|----------|
| **Supabase** | `mcp__supabase__*` | database-engineer, backend-developer, data-lead | DB queries, schema introspection, migrations, RLS — **MANDATORY** when Supabase is in stack |
| **Pencil** | `mcp__pencil__*` | design-lead, frontend-developer | Visual design, `.pen` files, design tokens — check availability first; skip gracefully if unavailable |
| **Playwright** | `mcp__playwright__*` | test-engineer | Browser automation, E2E tests, screenshots, form testing, network request capture |
| **Context7** | `mcp__context7__*` | researcher, phase-researcher | Library docs, API references — use BEFORE WebSearch for official library docs |
| **Framer** | `mcp__framer-mcp__*` | frontend-developer (marketing only), design-lead | Framer CMS, pages, code files, color/text styles, fonts — **ONLY for the Framer marketing site**, not the Next.js app |
| **IDE** | `mcp__ide__*` | backend-developer, frontend-developer | TypeScript diagnostics (`getDiagnostics`), code execution — run before final commit to catch type errors |
| **Stitch** | `mcp__stitch__*` | design-lead | AI-generated screen designs, design system scaffolding — alternative to Pencil when unavailable |
| **Refero** | `mcp__refero__*` | design-lead, frontend-developer | UI reference patterns, screen inspiration — use when designing new UI patterns or layouts |

### MCP Availability Rule
MCPs may not always be connected. Always check gracefully:
- If an MCP call fails → log "MCP unavailable, falling back to [alternative]" → continue
- **Never hard-fail because an MCP is unavailable** — always have a fallback
- **Exception:** Supabase MCP. If it's unavailable and you need DB access, flag it to the user before proceeding

### Per-agent MCP obligations
- `database-engineer`: MUST use `mcp__supabase__*` for all DB work when available
- `design-lead`: MUST call `mcp__pencil__get_editor_state` before any design work
- `test-engineer`: MUST use `mcp__playwright__*` for all browser/E2E tests
- `frontend-developer`: Run `mcp__ide__getDiagnostics` before final commit to catch TS errors
- `researcher`: Use `mcp__context7__*` for library docs BEFORE falling back to WebSearch

---

## Models (March 2026)

| Tier | Model | Use for |
|------|-------|---------|
| **Sonnet 4.6** | `claude-sonnet-4-6` | All team leads + most workers (default) |
| **Opus 4.6** | `claude-opus-4-6` | Research Lead, Researcher, AI Engineer (depth work) |
| **Haiku 4.5** | `claude-haiku-4-5` | Simple subagent tasks: log parsing, classification |

CEO recommends model per task. Sonnet handles 80%+ at 3x lower cost than Opus.

---

## Context Budget Enforcement (All Agents)

Hard limits — never exceed:
- `DECISIONS.md`: Max 50 entries. Archive older ones to `DECISIONS_ARCHIVE.md` when full.
- `LONG-TERM.md`: Max 100 lines total. Compress quarterly.
- Session summaries: Max 10 lines each (use YAML schema defined in CEO memory_update step).
- Agent handoffs: Summarize, never pass raw conversation history. Max 500 tokens per handoff.
- Skills per task: **3-5 for Team Leads and CEO. 2-3 for Workers.** Never preload.

**Turn efficiency — CRITICAL:**
- maxTurns is a safety ceiling, NOT a target. Use as few turns as needed.
- Batch tool calls: read multiple files in one turn, not one per turn
- Don't re-read files you already have in context
- Complete the task and stop — do not pad with unnecessary checks or summaries

Skills discovery — ALL agents MUST follow this pattern:
1. Read `.agent/skills/MANIFEST.json` — filter entries where tags match the task domain
2. Load 3-5 (leads/CEO) or 2-3 (workers) matching `.agent/skills/[name]/SKILL.md` files
3. Never use `ls | grep` on the skills directory directly

---

## Model Routing Rules (All Agents)

CEO specifies model in every worker brief. Workers default to Sonnet if not specified.

| Task type | Model | Who uses it |
|-----------|-------|-------------|
| Test execution, lint checks, log parsing, file classification | `claude-haiku-4-5` | test-engineer, simple verification tasks |
| Feature implementation, API design, code review, orchestration | `claude-sonnet-4-6` (default) | all leads + most workers |
| Security audits, deep research synthesis, complex AI/RAG design | `claude-opus-4-6` | security-engineer (audits), researcher, ai-engineer |

---

## Cost Optimization Rules (All Agents)

**Context discipline — most impactful:**
- Use `/clear` between unrelated tasks — saves 40-70%
- Use `/compact` when context gets long on a single task
- Skills load **on-demand only** — never preload
- Leads/CEO load 3-5 skills; Workers load 2-3 skills. Quality over quantity.

**Model discipline:**
- Sonnet 4.6 is the default — only escalate to Opus when genuinely needed
- Haiku for fast subagent tasks (log parsing, lint, test run)

**Delegation discipline:**
- Subagents run isolated contexts — pass summaries back, not raw data dumps
- Use memory files (`.claude/memory/*.md`) as shared state

---

## Layer Contract (Hard Rules — All Agents)

Each layer has an explicit DO / DO NOT. Violating these breaks the hierarchy.

### Layer 1 — CEO
| DO | DO NOT |
|----|--------|
| Plan, ask questions, delegate, synthesize | Write source code or edit app files |
| Write structured briefs with all required fields | Pass vague briefs ("build the thing") |
| Validate lead returns (workers_spawned, qa_verdict, session_file) | Accept a lead return missing required fields |
| Short-circuit to a worker directly for Quick-tier tasks | Skip the lead layer for Medium+ tasks |
| Set /color + /name at session start | Leave session unnamed or uncolored |

### Layer 2 — Team Leads
| DO | DO NOT |
|----|--------|
| Explore codebase, plan tasks, brief workers | Edit `.ts`, `.tsx`, `.sql`, or any source file directly |
| Spawn the right worker for each task | Do a worker's job yourself to "save turns" |
| Aggregate worker returns, verify branches exist | Trust worker summaries — verify with `git branch --list` |
| Spawn QA Lead before merge | Merge anything without QA Lead PASS |
| Write session file when task completes | Complete a task without leaving a session file |

### Layer 3 — Workers
| DO | DO NOT |
|----|--------|
| Implement one focused task in an isolated worktree | Touch files outside your assigned scope |
| Return structured JSON with branch + worktree + files_changed | Return vague "done" with no verifiable evidence |
| Auto-fix bugs, type errors, missing imports (Deviation Rules 1-3) | Make architectural decisions — return BLOCKED instead |
| Create one worktree per task, commit atomically | Commit to main or a lead's branch |

---

## Rules (All Agents)

1. **Read before acting** — Glob/Grep before creating; check memory before decisions
2. **Own your domain** — Don't do work that belongs to another agent
3. **Source claims** — Researchers source; no agent invents data
4. **Leave breadcrumbs** — Update DECISIONS.md when making choices that affect others
5. **Iterate, don't overwrite** — Understand existing code before replacing
6. **No placeholder UI** — Zero tolerance for stub components or TODO comments in deliverables
7. **Worktrees for code** — Every code worker creates a worktree before touching files
8. **QA gate is sacred** — No merge without QA Lead PASS + user confirmation

---

## Git Worktree Protocol

All code workers follow this:
```bash
git worktree add .worktrees/[task-name] -b feat/[task-name]
# work in .worktrees/[task-name]
# atomic commits: feat(scope): description
# signal completion to lead: branch + files + 2-line summary
```

`.worktrees/` is in `.gitignore`.

### Worktree Awareness — Critical for Code Agents

Agents (especially CEOs and Build Leads) may already be running inside a worktree (e.g., `.worktrees/ceo-1-[hash]`). Code workers spawned from a worktree context MUST detect this and create child worktrees from the **main repo root**, not from their current path.

**Detection — run at start of any code task:**
```bash
git worktree list
# If output shows more than one path, you are inside a worktree
# The FIRST path in the list is always the main repo root
pwd  # confirm current working directory
```

**Child worktree creation from within a worktree:**
```bash
# Get main repo root (first line of worktree list)
MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')
# Create child worktree from main repo root
git -C "$MAIN_REPO" worktree add "$MAIN_REPO/.worktrees/[task-name]" -b feat/[task-name]
```

**Rule:** Never run `git worktree add` from inside a worktree path. Always reference the main repo root.

---

## Agent Identity — Colors and Session Naming

### Color Convention
Every agent has a `color` set in its frontmatter. Colors visually identify agents in the Claude Code UI, making it easy to distinguish parallel sessions.

| Layer | Agent | Color |
|-------|-------|-------|
| **CEO** | Primary instance | `gold` |
| **CEO** | 2nd parallel instance | `orange` |
| **CEO** | 3rd parallel instance | `teal` |
| **CEO** | 4th parallel instance | `lime` |
| **Team Leads** | build-lead | `blue` |
| | research-lead | `purple` |
| | design-lead | `pink` |
| | qa-lead | `red` |
| | devops-lead | `orange` |
| | data-lead | `teal` |
| | product-lead | `green` |
| | growth-lead | `yellow` |
| | business-lead | `emerald` |
| **Workers** | backend-developer | `blue` |
| | frontend-developer | `pink` |
| | database-engineer | `teal` |
| | ai-engineer | `purple` |
| | security-engineer | `red` |
| | test-engineer | `yellow` |
| | code-reviewer | `gray` |
| | researcher | `purple` |
| | technical-writer | `gray` |

**Change color:** Use `/color [colorname]` in any session to update the badge color.

### Session Naming Convention
Every agent session should be named so parallel instances are identifiable at a glance.

```
CEO:     /name ceo-[task-slug]          e.g., /name ceo-auth-redesign
Leads:   /name [lead]-[task-slug]       e.g., /name build-auth-redesign
Workers: /name [type]-[task-slug]       e.g., /name backend-auth-api
```

**Rename at any time:** Use `/name [new-name]` to rename the current session.

**Parallel CEO rule:** When multiple CEOs run in parallel worktrees, each MUST use a unique name AND color. Example:
- `.worktrees/ceo-1-*` → `/color gold`, `/name ceo-feature-a`
- `.worktrees/ceo-2-*` → `/color orange`, `/name ceo-feature-b`

### Documentation Gate (Hard Rule)
No task is COMPLETE unless a session file has been written. Every Team Lead writes:
```
docs/08-agents_work/sessions/YYYY-MM-DD-[lead]-[task-slug].md
```
Workers return structured results to their lead — the lead writes the session file.

---

---

## Project State

- **Current focus:** Product rethink complete. Building MVP with new 11-agent GEO roster + proactive automation model.
- **Active sprint:** 2-week MVP build (target launch: early May 2026)
- **Product rethink:** Approved April 15, 2026. See `docs/product-rethink-2026-04-09/` for all decisions.
- **Pricing:** Discover $79 / Build $189 / Scale $499 (was $49/$149/$349)
- **Agents:** 11 MVP-1 + 1 MVP-2 GEO-specialized agents (was 7 generic agents)
- **UX:** Proactive automation model — suggestions → approve → agents run → review in Inbox (was Agent Hub)
- **Source of truth:** `docs/product-rethink-2026-04-09/` folder (9 files)
- **Blockers:** None
- **Next milestone:** 2-week MVP build sprint

---

## Conventions

*[Add project-specific conventions here]*

- [ ] Update when making architectural decisions
- [ ] Update after first Code Reviewer audit



# Beamix — Project Context

**Repository:** https://github.com/Adam077K/Beamix.git

This repo is the **Beamix product (dashboard/app)** only. The marketing website is a separate Framer project.

## Project Overview

Beamix scans SMBs for AI search visibility, diagnoses why they rank (or don't), and uses AI agents to fix it. Competitors show dashboards; Beamix does the work.

## Architecture Split (IMPORTANT)

| Surface | Platform | URL | What it covers |
|---------|----------|-----|---------------|
| **Marketing website** | **Framer** | average-product-525803.framer.app | Homepage, pricing, features, about, blog, contacts |
| **Product (app)** | **Next.js on Vercel** | This repo (`apps/web/`) | Dashboard, scan, onboarding, agents, settings, auth |

**This repo = product only.** All marketing pages (homepage, landing, pricing page, about, features) are built and maintained in Framer — NOT in this codebase.

## Monorepo Layout (2026-04-18)

This repo is a Turborepo + pnpm monorepo.

| Path | Purpose |
|------|---------|
| `apps/web/` | **Next.js 16 product dashboard (deployed to Vercel). Fresh scaffold from 2026-04-18.** |
| `packages/` | Reserved for shared UI / config packages. Empty for now; add as needed. |
| `_archive/saas-platform-2026-04-legacy/` | Old product folder. Reference only. Never modify. |
| `docs/` | Product + architecture specs |
| `.agent/` | Agent system (skills, prompts, manifests) |

Workspace commands run from repo root: `pnpm dev`, `pnpm build`, `pnpm typecheck`. Per-app: `pnpm -F @beamix/web <script>`.

## Key Paths

| Path | Purpose |
|------|---------|
| `docs/` | PRD, architecture, specs, competitive research |
| `apps/web/` | Next.js product app (dashboard, API routes, agents) |
| `apps/web/supabase/migrations/` | DB migrations (2-phase rethink migration applied on staging first) |
| `docs/_archive/` | Archived old design docs (pre-2026-03-17) |
| `docs/product-rethink-2026-04-09/` | **AUTHORITATIVE** — all decisions from April 2026 rethink |
| `_archive/saas-platform-2026-04-legacy/` | Old product codebase, preserved for reference |

## Default References

- **Repo:** https://github.com/Adam077K/Beamix
- **Framer site:** https://average-product-525803.framer.app
- **Product hosting:** Vercel

## Stack (Product)

- Next.js 16, React 19, TypeScript
- Supabase (auth, DB, RLS)
- Paddle (billing)
- LLMs: OpenAI, Claude, Gemini, Perplexity (direct integration via Next.js API routes)
- Hosting: Vercel

## Pricing (CURRENT — as of April 15, 2026)

| Tier | Monthly | Annual |
|------|---------|--------|
| Discover | $79/mo | $63/mo |
| Build | $189/mo | $151/mo |
| Scale | $499/mo | $399/mo |

Trial model: 14-day money-back guarantee (7-day trial is retired). Free one-time scan remains.

## Brand & Design

- **Marketing site:** Framer (separate, live at average-product-525803.framer.app)
- **Product:** Next.js dashboard in this repo
- **Primary accent:** Blue #3370FF (NOT orange, NOT navy, NOT cyan as UI accent)
- **Fonts:** Inter + InterDisplay (headings), Fraunces (serif accent), Geist Mono (code)
- **Guidelines:** `docs/BRAND_GUIDELINES.md` (v4.0) + `docs/PRODUCT_DESIGN_SYSTEM.md`
- **Old docs:** archived in `docs/_archive/`
- **Framer screenshots:** `docs/08-agents_work/framer-homepage-screenshots/`

## Conventions

- Hebrew + English in planning/docs as needed
- `docs/` is the source of truth for product and architecture
- `docs/product-rethink-2026-04-09/` supersedes older specs for pricing, agents, and UX
