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

See `AGENTS.md` for the full routing table.

---

## Skills Library

This project includes **426+ expert skills** at `.agent/skills/[skill-name]/SKILL.md`.

**Skills load on-demand — never preload:**
```bash
# Step 1: Read .agent/skills/MANIFEST.json — filter by tags matching task domain
# Step 2: Load 1-2 matching .agent/skills/[name]/SKILL.md files only
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

## Project Documentation (docs/)

All startup project documentation lives in `docs/`. Agents **must** read and update the relevant file for their domain.

| Folder / File | Purpose | Owner |
|---------------|---------|-------|
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

**Template files** (copy + rename before filling): `_TEMPLATE.md` in `competitors/`, `adr/`, `specs/`, `sessions/`, `handoffs/`.

---

## MCPs

| MCP | When to use |
|-----|------------|
| **Supabase** (`mcp__supabase__*`) | Always — if project uses Supabase, database workers MUST use MCP tools |
| **Pencil** (`mcp__pencil__*`) | Design Lead + Frontend Developer — check availability first. If available: use for UI. If not: skip gracefully. |
| **Playwright** (`mcp__playwright__*`) | Test Engineer — browser automation, E2E validation, screenshot testing |
| **Context7** (`mcp__context7__*`) | Researcher + Phase Researcher — library docs, API references |

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
- Skills per task: Max 2 loaded. Never preload.

**Turn efficiency — CRITICAL:**
- maxTurns is a safety ceiling, NOT a target. Use as few turns as needed.
- Batch tool calls: read multiple files in one turn, not one per turn
- Don't re-read files you already have in context
- Complete the task and stop — do not pad with unnecessary checks or summaries

Skills discovery — ALL agents MUST follow this pattern:
1. Read `.agent/skills/MANIFEST.json` — filter entries where tags match the task domain
2. Load 1-2 matching `.agent/skills/[name]/SKILL.md` files only
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
- Load only the 1-2 skills actually needed, not all possible

**Model discipline:**
- Sonnet 4.6 is the default — only escalate to Opus when genuinely needed
- Haiku for fast subagent tasks (log parsing, lint, test run)

**Delegation discipline:**
- Subagents run isolated contexts — pass summaries back, not raw data dumps
- Use memory files (`.claude/memory/*.md`) as shared state

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

---

## Project State

*[Update this section as the project evolves]*

- **Current focus:** Building startups with the 3-layer agent system
- **Active sprint:** Released — ready for public use
- **Blockers:** None
- **Next milestone:** Community feedback and iteration

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
| **Product (app)** | **Next.js on Vercel** | This repo (`saas-platform/`) | Dashboard, scan, onboarding, agents, settings, auth |

**This repo = product only.** All marketing pages (homepage, landing, pricing page, about, features) are built and maintained in Framer — NOT in this codebase.

**Landing components in `src/components/landing/` are DEPRECATED** — do not update or extend them. They will be removed in a follow-up cleanup. The marketing site lives in Framer now.

## Key Paths

| `docs/` | PRD, architecture, specs, competitive research |
| `saas-platform/` | Next.js product app (dashboard, API routes, agents) |
| `docs/_archive/` | Archived old design docs (pre-2026-03-17) |

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
