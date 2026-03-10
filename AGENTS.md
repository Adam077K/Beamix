# AGENTS.md — Routing Table
*3-layer agent system: CEO → Team Leads → Workers*

---

## How to Route

**Always start with CEO.** The CEO reads memory, asks questions, and assembles the right team.

| Request type | Start here |
|-------------|-----------|
| Any task | CEO |
| Slash commands | `/build` `/fix` `/design` `/review` `/daily` `/plan` `/ship` `/audit` `/research` |

---

## Layer 1: CEO

| Agent | File | Job | Model |
|-------|------|-----|-------|
| **CEO** | `ceo.md` | Entry point for ALL tasks. Questions → team assembly → delegate → synthesize. | Sonnet 4.6 |

---

## Layer 2: Team Leads

Team leads are dispatched by CEO. They plan worker tasks, coordinate parallel work, run QA gates, and write session memory.

| Agent | File | Domain | Model |
|-------|------|--------|-------|
| **Build Lead** | `build-lead.md` | Code implementation: features, fixes, refactors. Manages worktrees, QA gate, merge confirmation. | Sonnet 4.6 |
| **Research Lead** | `research-lead.md` | All research: competitive analysis, market sizing, tech evaluation, user research. Parallel researchers + synthesis. | Opus 4.6 |
| **Design Lead** | `design-lead.md` | UI/UX: screens, components, design systems. Pencil MCP check, Frontend Developer, WCAG gate. | Sonnet 4.6 |
| **QA Lead** | `qa-lead.md` | QA gate: OWASP check + test coverage. PASS/BLOCK verdict. Called before any merge. | Sonnet 4.6 |
| **DevOps Lead** | `devops-lead.md` | Deployments: Vercel, CI/CD, monitoring. Requires QA PASS. Staging first, production after confirmation. | Sonnet 4.6 |
| **Data Lead** | `data-lead.md` | Analytics: SQL, metrics dashboards, dbt, event tracking, Segment CDP. | Sonnet 4.6 |
| **Product Lead** | `product-lead.md` | Product: PRDs, user stories, roadmaps, RICE scoring, acceptance criteria. Spec completeness gate. | Sonnet 4.6 |
| **Growth Lead** | `growth-lead.md` | Marketing: copy, SEO, email, GTM launches. Requires USER-INSIGHTS.md. Customer language gate. | Sonnet 4.6 |
| **Business Lead** | `business-lead.md` | Business: pricing, financials, RICE, OKRs, unit economics. Evidence classification + confidence levels. | Sonnet 4.6 |

---

## Layer 3: Workers

Workers receive structured briefs from leads, create worktrees (for code), execute atomically, and return completion signals.

### New Worker Agents

| Agent | File | Job | Model |
|-------|------|-----|-------|
| **Backend Developer** | `backend-developer.md` | API routes, server logic. TypeScript strict, Zod validation. Git worktrees. | Sonnet 4.6 |
| **Frontend Developer** | `frontend-developer.md` | React components, Tailwind + Shadcn/UI. Pencil MCP for designs. Git worktrees. | Sonnet 4.6 |
| **Database Engineer** | `database-engineer.md` | Schema design, migrations, queries. Supabase MCP. Never drops without confirmation. | Sonnet 4.6 |
| **AI Engineer** | `ai-engineer.md` | LLM integration, RAG, embeddings. Every feature ships with eval + cost logging. | Opus 4.6 |
| **Security Engineer** | `security-engineer.md` | OWASP audit, injection testing, auth review, npm audit. Structured severity findings. | Sonnet 4.6 |
| **Test Engineer** | `test-engineer.md` | Unit, integration, E2E tests. Playwright MCP for browser tests. TDD from specs. | Sonnet 4.6 |
| **Code Reviewer** | `code-reviewer.md` | Code quality, patterns, tech debt. P1/P2/P3 findings. Diff-scoped only. | Sonnet 4.6 |
| **Researcher** | `researcher.md` | Deep research on 1 specific question. Sources every claim. HIGH/MEDIUM/LOW confidence. | Opus 4.6 |
| **Technical Writer** | `technical-writer.md` | Documentation, READMEs, PR descriptions, API docs. | Sonnet 4.6 |

### GSD Execution Agents (Worker Backbone)

These agents are the execution backbone. Dispatched by leads for structured project work.

| Agent | File | Job |
|-------|------|-----|
| **GSD Executor** | `executor.md` | Executes PLAN.md files atomically with deviation handling and checkpoint protocols |
| **GSD Planner** | `planner.md` | Creates detailed phase plans with goal-backward methodology and dependency graphs |
| **GSD Debugger** | `debugger.md` | Root cause investigation using scientific method, persistent DEBUG.md state |
| **GSD Verifier** | `verifier.md` | Goal-backward verification: exists → substantive → wired (3-level check) |
| **GSD Roadmapper** | `roadmapper.md` | Project roadmap creation with requirement traceability and success criteria |
| **GSD Codebase Mapper** | `codebase-mapper.md` | Codebase exploration and documentation (STACK.md, ARCHITECTURE.md, etc.) |
| **GSD Integration Checker** | `integration-checker.md` | Cross-phase integration and E2E flow verification |
| **GSD Plan Checker** | `plan-checker.md` | Pre-execution plan quality gate (8 verification dimensions) |
| **GSD Phase Researcher** | `phase-researcher.md` | Phase-specific technology research (RESEARCH.md) |
| **GSD Project Researcher** | `project-researcher.md` | Domain ecosystem research before roadmap creation |
| **GSD Research Synthesizer** | `research-synthesizer.md` | Consolidates parallel research outputs into SUMMARY.md |
| **GSD Nyquist Auditor** | `nyquist-auditor.md` | Validation gap filling for Nyquist compliance |

---

## Routing Examples

| What you need | Who handles it |
|--------------|----------------|
| "Build a new feature" | CEO → Build Lead → Backend Developer + Frontend Developer |
| "Research competitors" | CEO → Research Lead → Researcher (x2-3) |
| "Design a new screen" | CEO → Design Lead → Frontend Developer |
| "Write copy for landing page" | CEO → Growth Lead |
| "Decide on pricing" | CEO → Business Lead |
| "Write a PRD for new feature" | CEO → Product Lead |
| "Deploy to production" | CEO → DevOps Lead (needs QA PASS first) |
| "Analyze our SQL queries" | CEO → Data Lead → Database Engineer |
| "Fix a bug" | CEO → Build Lead → gsd-debugger → Backend/Frontend Developer |
| "Security audit" | CEO → QA Lead → Security Engineer |
| "Write tests for feature" | CEO → Build Lead → Test Engineer |
| "Review my PR" | CEO → Code Reviewer + Security Engineer |
| "New project from scratch" | CEO → gsd-roadmapper → gsd-planner → Build Lead |

---

## Memory Files

| File | Written by | Read by |
|------|-----------|---------|
| `.claude/memory/DECISIONS.md` | Any agent | CEO, all leads |
| `.claude/memory/CODEBASE-MAP.md` | Code Reviewer | Build Lead, CEO |
| `.claude/memory/USER-INSIGHTS.md` | Research Lead | Growth Lead, Product Lead, CEO |
| `.claude/memory/LONG-TERM.md` | CEO | CEO (every session) |
| `.claude/memory/sessions/` | Each lead | CEO (for daily) |
| `.claude/memory/specs/` | Product Lead | Build Lead |
