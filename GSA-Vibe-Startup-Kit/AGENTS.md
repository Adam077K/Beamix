# AGENTS.md — Full Agent Registry
*All 23 agents read this to find each other. Updated when adding new agents.*

---

## Quick Routing Table

| Task involves... | Call |
|-----------------|------|
| Starting any task, planning, routing | **iris** |
| Code, TypeScript, Next.js, API, DB | **atlas** |
| LLM, RAG, AI agents, embeddings | **sage** |
| Tests, security, OWASP, pre-deploy | **guardian** |
| Deploy, CI/CD, infra, monitoring | **nexus** |
| Feature specs, PRDs, roadmap | **morgan** |
| SEO, copy, email, launch, growth | **nova** |
| Pricing, financials, RICE, OKRs | **axiom** |
| Research, competitive intel, market | **rex** |
| UI/UX, Tailwind, design system | **lyra** |
| Code review, documentation, debt | **scout** |
| Metrics, SQL, dashboards, dbt | **spark** |
| Structured plan execution with atomic commits | **gsa-executor** |
| Scientific bug investigation | **gsa-debugger** |
| Goal-backward verification (did it actually work?) | **gsa-verifier** |
| Executable plan creation with dependency analysis | **gsa-planner** |
| Phased roadmap from requirements | **gsa-roadmapper** |
| Technical domain research before planning | **gsa-phase-researcher** |
| Codebase analysis and structured mapping | **gsa-codebase-mapper** |
| Plan quality verification before execution | **gsa-plan-checker** |
| Cross-phase E2E integration verification | **gsa-integration-checker** |
| Project ecosystem research | **gsa-project-researcher** |
| Research synthesis from parallel outputs | **gsa-research-synthesizer** |

---

## Named Agents (The Team)

### Iris — CEO & Orchestrator
**File:** `.claude/agents/iris.md` | **Model:** sonnet
**Use for:** Starting any task, daily planning, routing, cross-agent coordination, strategy
**Do NOT use for:** Writing code, copy, deep research (delegate those)

### Morgan — CPO / Product Manager
**File:** `.claude/agents/morgan.md` | **Model:** sonnet
**Use for:** PRDs, user stories, roadmap, RICE scoring, acceptance criteria
**Do NOT use for:** Code, design mockups, financial modeling

### Atlas — CTO / Lead Engineer
**File:** `.claude/agents/atlas.md` | **Model:** sonnet
**Use for:** All code (TypeScript, Next.js, Prisma, Postgres), API, DB schema, architecture
**Do NOT use for:** Copy, design, financial modeling, research

### Sage — AI Engineer
**File:** `.claude/agents/sage.md` | **Model:** opus
**Use for:** LLM, RAG pipelines, AI agents, vector DBs, prompt engineering, background AI jobs
**Do NOT use for:** Standard web features, UI code, non-AI DB schema, deployment

### Nova — CMO / Growth
**File:** `.claude/agents/nova.md` | **Model:** sonnet
**Use for:** Landing page copy, SEO, email campaigns, feature announcements, GTM, launch
**Do NOT use for:** Writing code, financial modeling, primary research

### Axiom — CFO / Business Analyst
**File:** `.claude/agents/axiom.md` | **Model:** sonnet
**Use for:** Pricing, financial projections, RICE, OKRs, unit economics, business cases
**Do NOT use for:** Code, copy, user research

### Rex — Research Analyst
**File:** `.claude/agents/rex.md` | **Model:** opus
**Use for:** Competitor research, market sizing, tech evaluation, user pain from public sources
**Do NOT use for:** Code, copy, financial modeling (hand findings to axiom/nova)

### Lyra — Head of Design
**File:** `.claude/agents/lyra.md` | **Model:** sonnet
**Use for:** UI/UX design, Tailwind components, Radix UI, design system, WCAG accessibility
**Do NOT use for:** Copy, backend code, financial analysis, research

### Scout — Code Intelligence
**File:** `.claude/agents/scout.md` | **Model:** sonnet
**Use for:** Code review, codebase audit, documentation, tech debt analysis, architecture review
**Do NOT use for:** New product features, copy, design, deployment

### Guardian — QA & Security
**File:** `.claude/agents/guardian.md` | **Model:** sonnet
**Use for:** Writing tests, OWASP security, accessibility testing, LLM eval, pre-deploy gate
**Do NOT use for:** Product features, copy, design, financial analysis

### Nexus — Head of DevOps
**File:** `.claude/agents/nexus.md` | **Model:** sonnet
**Use for:** Production deploys, CI/CD, infrastructure, monitoring, runbooks
**Do NOT use for:** Product features, copy, design, financial analysis

### Spark — Data & Analytics
**File:** `.claude/agents/spark.md` | **Model:** sonnet
**Use for:** Metrics dashboards, SQL, dbt models, data pipelines, cohort analysis
**Do NOT use for:** Product features, copy, design, financial projections

---

## GSA Execution Agents

*Specialized execution agents spawned as subagents by named agents or GSA orchestrators. They handle structured workflows with checkpoints, state management, and verification.*

### gsa-executor — Plan Executor
**File:** `.claude/agents/gsa-executor.md` | **Model:** sonnet
**Use for:** Executing implementation plans with atomic commits, deviation handling, checkpoints
**Spawned by:** Atlas, Iris, Nexus, Sage, or GSA orchestrators
**Do NOT use for:** Planning, research, verification

### gsa-debugger — Scientific Debugger
**File:** `.claude/agents/gsa-debugger.md` | **Model:** opus
**Use for:** Bug investigation with hypothesis testing, debug session management, persistent debug files
**Spawned by:** Atlas, Guardian, Sage, or GSA orchestrators
**Do NOT use for:** Feature implementation, testing, deployment

### gsa-verifier — Goal Verifier
**File:** `.claude/agents/gsa-verifier.md` | **Model:** sonnet
**Use for:** Goal-backward verification that features actually work (not just exist), gap analysis
**Spawned by:** Guardian, Scout, Lyra, or GSA orchestrators
**Do NOT use for:** Writing code, fixing bugs, planning

### gsa-planner — Plan Creator
**File:** `.claude/agents/gsa-planner.md` | **Model:** sonnet
**Use for:** Decomposing phases into executable plans with dependency analysis, wave-based parallelization
**Spawned by:** Morgan, Iris, or GSA orchestrators
**Do NOT use for:** Execution, verification, research

### gsa-roadmapper — Roadmap Creator
**File:** `.claude/agents/gsa-roadmapper.md` | **Model:** sonnet
**Use for:** Creating phased roadmaps with requirement mapping and success criteria
**Spawned by:** Iris, Morgan, or GSA orchestrators
**Do NOT use for:** Plan execution, code review, debugging

### gsa-phase-researcher — Phase Researcher
**File:** `.claude/agents/gsa-phase-researcher.md` | **Model:** sonnet
**Use for:** Technical domain research before planning (Context7 > Docs > WebSearch)
**Spawned by:** Rex, Morgan, Nova, Axiom, or GSA orchestrators
**Do NOT use for:** Code implementation, testing, deployment

### gsa-codebase-mapper — Codebase Analyst
**File:** `.claude/agents/gsa-codebase-mapper.md` | **Model:** sonnet
**Use for:** Structured codebase analysis (tech, arch, quality, concerns focus areas)
**Spawned by:** Scout, or GSA orchestrators
**Do NOT use for:** Code changes, testing, deployment

### gsa-plan-checker — Plan Validator
**File:** `.claude/agents/gsa-plan-checker.md` | **Model:** sonnet
**Use for:** Verifying plans will achieve phase goal before execution starts
**Spawned by:** Morgan, or GSA orchestrators
**Do NOT use for:** Execution, debugging, research

### gsa-integration-checker — Integration Verifier
**File:** `.claude/agents/gsa-integration-checker.md` | **Model:** sonnet
**Use for:** Cross-phase E2E wiring verification, checking features connect properly
**Spawned by:** Guardian, Nexus, or GSA orchestrators
**Do NOT use for:** Code implementation, unit testing, research

### gsa-project-researcher — Ecosystem Researcher
**File:** `.claude/agents/gsa-project-researcher.md` | **Model:** sonnet
**Use for:** Full domain ecosystem research for new projects (stack, features, architecture, pitfalls)
**Spawned by:** Rex, Iris, or GSA orchestrators
**Do NOT use for:** Code implementation, testing, deployment

### gsa-research-synthesizer — Research Synthesizer
**File:** `.claude/agents/gsa-research-synthesizer.md` | **Model:** sonnet
**Use for:** Synthesizing parallel research outputs into actionable summaries
**Spawned by:** Rex, or GSA orchestrators
**Do NOT use for:** Primary research, code implementation, testing

---

## Subagent Mesh

```
IRIS ──────────→ ALL agents (orchestrates everything)

MORGAN   → Atlas / Rex / Nova / Axiom / Lyra / gsa-planner / gsa-plan-checker / gsa-roadmapper
ATLAS    → Sage / Scout / Guardian / Nexus / Spark / gsa-executor / gsa-debugger / gsa-verifier
SAGE     → Atlas / Guardian / Rex / gsa-executor / gsa-debugger / gsa-verifier
NOVA     → Rex / Axiom / Atlas / Lyra / gsa-phase-researcher
AXIOM    → Rex / Nova / Iris / gsa-phase-researcher
REX      → Iris / Morgan / Nova / gsa-phase-researcher / gsa-project-researcher / gsa-research-synthesizer
LYRA     → Atlas / Nova / gsa-verifier
SCOUT    → Atlas / Guardian / gsa-codebase-mapper / gsa-verifier
GUARDIAN → Atlas / Nexus / gsa-verifier / gsa-integration-checker / gsa-debugger
NEXUS    → Atlas / Guardian / gsa-executor / gsa-integration-checker
SPARK    → Atlas / Sage / Iris / gsa-executor
```

---

## Slash Commands

| Command | What it does |
|---------|-------------|
| `/daily` | Morning planning — Iris reviews context and proposes today's focus |
| `/plan [goal]` | Sprint/feature planning — Iris orchestrates PRD + estimate + task list |
| `/ship [feature]` | Pre-deploy pipeline — Scout review → Guardian gate → Nexus deploy |
| `/audit [focus]` | Codebase health report — Scout maps, rates, and scores tech debt |
| `/research [topic] [type]` | Rex deep research — sourced intelligence report |

---

## Skills Library

938+ skills at `.agent/skills/[skill-name]/SKILL.md`

Key skill → Agent mapping:
| Skill folder | Primary agent |
|-------------|--------------|
| `nextjs-*`, `react-*`, `prisma-*`, `postgresql-*` | atlas |
| `rag-*`, `ai-*`, `llm-*`, `prompt-*`, `langgraph` | sage |
| `seo-*`, `copywriting`, `marketing-*`, `email-systems` | nova |
| `startup-financial-*`, `pricing-strategy`, `competitive-*` | axiom / iris |
| `deep-research`, `market-sizing-*`, `competitor-*` | rex |
| `tailwind-*`, `radix-*`, `react-ui-*`, `wcag-*` | lyra |
| `testing-*`, `security-*`, `tdd-*`, `sql-injection-*` | guardian |
| `vercel-*`, `cloudformation-*`, `github-actions-*`, `inngest` | nexus |
| `data-*`, `dbt-*`, `sql-optimization-*`, `segment-cdp` | spark |
| `code-refactoring-*`, `codebase-cleanup-*`, `production-code-audit` | scout |

---

## Memory Files

| File | Updated by | Purpose |
|------|-----------|---------|
| `.claude/memory/DECISIONS.md` | Any agent making a permanent decision | Architecture + strategy log |
| `.claude/memory/CODEBASE-MAP.md` | Scout, Atlas | Project code map |
| `.claude/memory/USER-INSIGHTS.md` | Rex (research), Nova (campaigns) | Customer language + pain |
