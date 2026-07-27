# Beamix Agent System — Project Context
*Auto-loaded by Claude Code on every session.*

@.claude/AGENT-SYSTEM.md

> **2026-05-16 rethink applied.** Org chart, QA gate, skills library, and naming were standardized this date. The source of truth is `docs/08-agents_work/2026-05-16-agent-rethink/` (11 planning docs + 13 board review files + 2 session files). The 10 locked decisions live in `.claude/memory/DECISIONS.md` under the "2026-05-16 BOARD VERDICT" entry.

> **GSD pipeline agents archived 2026-05-16** (codebase-mapper, debugger, executor, integration-checker, nyquist-auditor, phase-researcher, plan-checker, planner, project-researcher, research-synthesizer, roadmapper, verifier). Reference only at `.archive/agents/gsd-pipeline-2026-05-16/`.

---

## Skills Library

**117 curated skills** at `.claude/skills/[skill-name]/SKILL.md` (down from 423 — 308 orphans archived 2026-05-16 to `.archive/skills-orphans-2026-05-16/`).

Skill categories (post-cleanup highlights):
- **AI/ML:** ai-engineer, rag-engineer, prompt-engineering-patterns, multi-agent-patterns, agent-memory-systems
- **Frontend:** nextjs-app-router-patterns, react-patterns, tailwind-design-system, radix-ui-design-system, frontend-design
- **Backend:** nodejs-backend-patterns, prisma-expert, postgresql, api-design-principles, error-handling-patterns
- **DevOps:** vercel-deployment, inngest, github-actions-templates, cloud-devops
- **Business:** startup-financial-modeling, pricing-strategy, market-sizing-analysis, competitive-landscape
- **Growth/SEO:** copywriting, marketing-psychology, email-systems, page-cro, seo-content-writer
- **Security:** security-audit, web-security-testing, xss-html-injection, broken-authentication, wcag-audit-patterns

(Discovery protocol — read MANIFEST.json, load-on-demand — is defined in `.claude/AGENT-SYSTEM.md`.)

---

## Stack

```
Marketing:  Framer (separate project — NOT in this repo)
Product:    Next.js 16 (App Router), React 19, TypeScript strict, Tailwind, Shadcn/UI
Backend:    Next.js API Routes / Server Actions, Zod validation on all inputs
Database:   Supabase (auth, DB, RLS)
Payments:   Paddle (NOT Stripe)
Email:      Resend
Jobs:       Inngest
Hosting:    Vercel (product only)
AI:         OpenAI, Claude, Gemini, Perplexity (direct API integration)
Memory:     Mem0 (primary) + Anthropic Memory Tool (auto-fallback after 3 retries)
```

---

## Brain — Knowledge Navigation (docs/00-brain/)

Read the MOC for your domain **before** searching the full docs tree.

**Navigation:** `_INDEX.md` → domain MOC → specific document.

| MOC | Domain | Reader |
|-----|--------|--------|
| `docs/00-brain/_INDEX.md` | Master hub | CEO (every session) |
| `MOC-Product.md` | PRD, roadmap, feature specs | CPO, CEO |
| `MOC-Architecture.md` | System design, DB, APIs | CTO, backend-engineer |
| `MOC-Business.md` | Vision, market, competitive, pricing | CBO, Research-Lead |
| `MOC-Marketing.md` | GTM, messaging, SEO | CMO |
| `MOC-Codebase.md` | Code map, patterns, tech debt | CTO, code-reviewer |
| `MOC-History.md` | Changelog, decisions, audits | CEO, all C-suite |
| `MOC-Metrics.md` | North star, unit economics | CBO, data-engineer |
| `MOC-Agents.md` | Agent definitions, commands | CEO |
| `docs/00-brain/log.md` | Chronological activity record (append-only) | CEO + all C-suite |

After significant work, append one line to `log.md`.

---

## Project Documentation (docs/)

| Path | Purpose | Owner |
|------|---------|-------|
| `docs/00-brain/` | Navigation MOCs + activity log | CEO, all leads |
| `docs/PRD.md` | Master product requirements | CPO |
| `docs/BACKLOG.md` | Prioritized backlog | CPO, CEO |
| `docs/ENGINEERING_PRINCIPLES.md` | Code conventions | CTO |
| `docs/COMPETITIVE_RESEARCH.md` | Competitive intel summary | Research-Lead |
| `docs/01-foundation/` | Vision, business model, personas | CEO, CBO |
| `docs/02-competitive/` | Landscape, positioning, moat | Research-Lead |
| `docs/03-system-design/` | Architecture, schema, API contracts, ADRs | CTO |
| `docs/04-features/` | Roadmap, user stories, specs | CPO |
| `docs/05-marketing/` | GTM, channels | CMO |
| `docs/06-codebase/` | Code map, conventions | code-reviewer |
| `docs/07-history/` | Changelog, pivots, milestones | CEO, all leads |
| `docs/08-agents_work/` | Task index, session logs, handoffs | CEO, all leads |
| `docs/09-metrics/` | North star, unit economics | CBO, data-engineer |
| `docs/product-rethink-2026-04-09/` | **AUTHORITATIVE** — product decisions from April 2026 rethink | CEO, all leads |
| `docs/08-agents_work/2026-05-16-agent-rethink/` | **AUTHORITATIVE** — agent system rethink (org, QA, skills) | CEO, CTO |

---

## MCPs

| MCP | Tools prefix | Used by | Purpose |
|-----|--------------|---------|---------|
| Supabase | `mcp__supabase__*` | database-engineer, backend-engineer, data-engineer | **MANDATORY** for DB work when Supabase is in stack |
| Pencil | `mcp__pencil__*` | design-lead, frontend-engineer | `.pen` design files (check availability; skip gracefully if unavailable) |
| Playwright | `mcp__playwright__*` | test-engineer | E2E + browser automation |
| Context7 | `mcp__context7__*` | researcher | Library docs — try BEFORE WebSearch |
| Framer | `mcp__framer-mcp__*` | frontend-engineer (marketing only), design-lead | **ONLY** for the Framer marketing site, NOT the Next.js app |
| IDE | `mcp__ide__*` | backend-engineer, frontend-engineer | TypeScript diagnostics (`getDiagnostics`) before final commit |
| Stitch | `mcp__stitch__*` | design-lead | AI-generated screen designs (Pencil alternative) |
| Refero | `mcp__refero__*` | design-lead, frontend-engineer | UI reference patterns |

**Availability:** MCPs may not always be connected. On call failure → log "MCP unavailable, falling back to [alt]" → continue. **Exception:** Supabase MCP failure for DB work → flag to user before proceeding.

---

## Cost Optimization — Project Notes

- Mem0 vendor lock-in accepted 2026-05-16 with 6-month review trigger (2026-11-16) and export-pipeline commitment (Phase 3, post-first-revenue)

(General cost-optimization rules are defined in `.claude/AGENT-SYSTEM.md`.)

---

## Models — Project Notes

- Model routing table locked May 2026 (Q3 2026-05-07). Current tiers live in `.claude/AGENT-SYSTEM.md`.

---

## Project State

- **Current focus:** Agent rethink Phase 0+1 (2026-05-16, hard 5-day cap → product work begins 2026-05-21 regardless).
- **Active sprint:** Phase 0 hygiene → Phase 1 schema + tier-floor + hook → Day 6 pivot to MVP build (per board decision #9).
- **Pricing:** Discover $79 / Build $189 / Scale $499 (annual: $63 / $151 / $399).
- **Product MVP source of truth:** `docs/product-rethink-2026-04-09/build-prep-2026-05-13/`.
- **Agent system source of truth:** `docs/08-agents_work/2026-05-16-agent-rethink/`.
- **Vindication triggers active until 2026-06-15:** FM-12 fires · 5-day cap violated · Plan #6 proposed before first customer feature · zero customer features by Day 30.

---

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
