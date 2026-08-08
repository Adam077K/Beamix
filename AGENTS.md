# AGENTS.md — Routing Table
*3-layer agent system: CEO → C-suite → Workers. 26 active agents.*

All task entry starts at CEO. CEo reads CLAUDE.md + memory, picks the right C-suite, and synthesizes returns. Never route directly to a worker or a GSD agent (archived — see note at bottom).

---

## Layer 1: CEO

| Agent | File | Job | Model |
|-------|------|-----|-------|
| **ceo** | `ceo.md` | Entry point for ALL tasks. Routes to C-suite, validates returns, synthesizes one Linear comment per ticket. Never implements. | Opus 4.7 |

---

## Layer 2: C-suite

Dispatched by CEO. Each owns one organizational domain end-to-end.

| Agent | File | Domain | Model |
|-------|------|--------|-------|
| **cto** | `cto.md` | Engineering: code, infra, architecture. Emits a dispatch packet; CEO spawns workers from it (nested Task blocked in CC 2.1.146+). | Opus 4.7 |
| **cpo** | `cpo.md` | Product: PRDs, roadmap, RICE prioritization, acceptance criteria, post-ship DoD verification. | Opus 4.7 |
| **cmo** | `cmo.md` | Growth: copy, SEO/GEO, email, GTM, CRO. Hard gate: USER-INSIGHTS.md must exist before any drafting. | Sonnet 4.6 |
| **cbo** | `cbo.md` | Business: pricing, financials, unit economics, OKRs, legal/compliance, vendor decisions. Numbers first. | Sonnet 4.6 |
| **cco** | `cco.md` | Customer: support, onboarding, retention, churn analysis, NPS. Mandatory USER-INSIGHTS.md update after every session. | Sonnet 4.6 |
| **qa-lead** | `qa-lead.md` | Independent quality gate. 4-tier risk classification, binding PASS/BLOCK verdict. CEO and CTO cannot override a BLOCK. | Sonnet 4.6 |
| **research-lead** | `research-lead.md` | Research: competitive, market sizing, tech eval, user research. Decomposes into parallel researcher threads. Reports to CEO. | Opus 4.7 |
| **design-lead** | `design-lead.md` | Design: screens, components, design systems, visual audits. Reports under CPO. Runs a build→critic→polish loop. | Sonnet 4.6 |

---

## Layer 3: Workers

Receive structured briefs from C-suite, create worktrees, execute atomically, return structured JSON.

### Engineering workers (spawned by CTO)

| Agent | File | Job | Model |
|-------|------|-----|-------|
| **backend-engineer** | `backend-engineer.md` | API routes + server logic. TypeScript strict, Zod on all inputs. | Sonnet 4.6 |
| **frontend-engineer** | `frontend-engineer.md` | React components, pages, Tailwind + Shadcn/UI. Zero placeholder UI. | Sonnet 4.6 |
| **database-engineer** | `database-engineer.md` | Supabase migrations, RLS policies, indexes. Never drops columns without explicit double confirmation. | Sonnet 4.6 |
| **ai-engineer** | `ai-engineer.md` | LLM integration, prompts, evals, RAG pipelines. Every feature ships with eval + cost logging. | Opus 4.7 |
| **devops-engineer** | `devops-engineer.md` | CI/CD, Vercel deployment, infra. Staging first; writes rollback plan before every forward migration. | Sonnet 4.6 |
| **data-engineer** | `data-engineer.md` | SQL queries, metric definitions, event tracking. All queries via Supabase MCP — never inline estimation. | Sonnet 4.6 |

### QA workers (spawned by QA-Lead)

| Agent | File | Job | Model |
|-------|------|-----|-------|
| **security-engineer** | `security-engineer.md` | OWASP audit, dependency scan, auth review, RLS check. Structured severity findings table. | Opus 4.7 |
| **adversary-engineer** | `adversary-engineer.md` | Adversarial review on Full/Irreversible tiers. Simulates hostile attacker. Reads only — never edits code. | Opus 4.7 |
| **code-reviewer** | `code-reviewer.md` | P1/P2/P3 findings on changed files only. Quality, patterns, security basics. | Sonnet 4.6 |
| **qa-engineer** | `qa-engineer.md` | Writes unit/integration tests for code under active review on Lite+ tiers. | Haiku 4.5 |
| **test-engineer** | `test-engineer.md` | TDD from specs; coverage from implemented code. Playwright MCP for browser tests. | Haiku 4.5 |

### Design workers (spawned by design-lead)

| Agent | File | Job | Model |
|-------|------|-----|-------|
| **product-designer** | `product-designer.md` | First-paint screen build. Synthesizes ORIGINAL Beamix-language screens at pixel-level craft. Never traces references. | Sonnet 4.6 |
| **design-critic** | `design-critic.md` | Grades craft-parity and feeling against reference folder. Returns PASS / NEEDS_WORK / CRITICAL_ISSUES. Never edits code. | Sonnet 4.6 |
| **design-polisher** | `design-polisher.md` | Adds craft density to a functional build: depth, micro-interactions, motion, spacing/type. Post-critic only. | Sonnet 4.6 |

### Research worker (spawned by Research-Lead)

| Agent | File | Job | Model |
|-------|------|-----|-------|
| **researcher** | `researcher.md` | Deep research on one specific bounded question. Sources every claim with URL + date + confidence. Never invents data. | Opus 4.7 |

### Cross-cutting workers (spawned by any lead)

| Agent | File | Job | Model |
|-------|------|-----|-------|
| **technical-writer** | `technical-writer.md` | Docs, READMEs, PR descriptions, API docs, changelogs. Reads the code first — never documents the brief. | Sonnet 4.6 |
| **supabase-cleaner** | `supabase-cleaner.md` | Audits Beamix Supabase project against post-rethink schema. Emits SQL plan files for Adam to apply — never runs destructive SQL directly. Spawned by CEO or CTO. | Sonnet 4.6 |

---

## Routing matrix

Derived from `ceo.md` Step 2. Every destination below is a real agent.

| Ticket signal or label | Route to | Notes |
|------------------------|----------|-------|
| `agent:cto` / code / infra / migrations / `apps/web/src/` | CTO | CTO classifies risk tier |
| `agent:cpo` / PRD / spec / roadmap / prioritization | CPO | Lite by default |
| `agent:cmo` / copy / SEO / GEO / email / campaigns | CMO | Lite; needs USER-INSIGHTS.md |
| `agent:cbo` / pricing / finance / legal / compliance | CBO | Full (touches business decisions) |
| Customer / onboarding / churn / support | CCO | Lite; mandatory USER-INSIGHTS.md update |
| `agent:qa-lead` / security audit / red-team / pre-deploy | QA-Lead directly | Full minimum |
| `agent:research-lead` / competitive / market / tech eval | Research-Lead | Lite |
| Design / screens / components / design audit | CPO → Design-Lead | Design-Lead operates under CPO |
| Bug fix / debugging | CTO | CTO picks engineer + diagnosis-first brief |
| Cross-functional (e.g., "ship a top-up flow") | Multiple parallel: CTO + CPO + CBO | Each agent tier-classifies its own piece |
| `board-meeting` label / strategic question | `/board-meeting` 4-round protocol | Irreversible — Adam veto required |

---

## Orchestration tiers (T1–T5)

As defined in `ceo.md`. Match topology to task complexity — default is T2.

| Tier | Topology | When |
|------|----------|------|
| **T1 Solo Task** | 1 worker Task, no chief | Trivial: lint fix, single-file edit, focused lookup |
| **T2 Dispatch-Packet** (DEFAULT) | Chief → packet → CEO spawns workers | Most tasks: 1-3 workers, single domain |
| **T3 Ephemeral Team** | TeamCreate → chiefs + workers → TeamDelete | Cross-functional waves, 3+ workers, mid-flight refinement |
| **T4 Persistent Team** | Long-lived TeamCreate across sessions | Multi-day sustained work, active sprint wave |
| **T5 Workflow** | Named workflow script fans out 15-20 agents | Full/Irreversible code; complex design/research; multi-domain |

T5 uses scripts in `.claude/workflows/` (`coding.js`, `design.js`, `research.js`, `qa.js`). T5-coding always chains into `qa.js` before merge. Chiefs are mandatory in T2 — never skip to save tokens.

---

## Memory files

| File | Written by | Read by |
|------|-----------|---------|
| `.claude/memory/DECISIONS.md` | Any agent | CEO, all leads |
| `.claude/memory/CODEBASE-MAP.md` | code-reviewer | CTO, CEO |
| `.claude/memory/USER-INSIGHTS.md` | CMO, CPO | CMO, CPO, CCO, CEO |
| `.claude/memory/LONG-TERM.md` | CEO | CEO (every session) |
| `.claude/memory/sessions/` | Each C-suite / lead | CEO |
| `.claude/memory/specs/` | CPO | CTO, design-lead |

---

## Archived agents

GSD pipeline agents (executor, planner, debugger, verifier, roadmapper, codebase-mapper, integration-checker, plan-checker, phase-researcher, project-researcher, research-synthesizer, nyquist-auditor) were archived 2026-05-16. Reference only at `.archive/agents/gsd-pipeline-2026-05-16/`. Do not route to them.
