---
title: Agents MOC
type: moc
domain: agents
summary: 32 agent definitions (CEO + 9 leads + 13 workers + 9 execution), 10 commands, memory files
tags:
  - agents
  - ceo
  - team-leads
  - workers
status: active
updated: 2026-04-10
---

# Agents MOC

> The 3-layer agent system that builds and maintains Beamix.

## Architecture

3-layer hierarchy: CEO → 9 Team Leads → 9 Workers + execution agents.
All code workers use isolated git worktrees. QA gate mandatory before merge.

## Layer 1 — CEO

- [[agents/ceo]] — Entry point for all tasks. Questions, team assembly, delegation.

## Layer 2 — Team Leads

- [[agents/build-lead]] — All code work (features, fixes, refactors)
- [[agents/research-lead]] — Competitors, market, tech evaluation
- [[agents/design-lead]] — UI/UX, screens, design systems
- [[agents/qa-lead]] — Security + test gate before merge
- [[agents/devops-lead]] — Deployments, CI/CD, Vercel
- [[agents/data-lead]] — SQL, metrics, dashboards
- [[agents/product-lead]] — PRDs, user stories, roadmaps
- [[agents/growth-lead]] — Copy, SEO, email, GTM
- [[agents/business-lead]] — Pricing, financials, OKRs

## Layer 3 — Workers

- [[agents/backend-developer]] — API routes, server logic
- [[agents/frontend-developer]] — React components, UI
- [[agents/database-engineer]] — Schema, migrations, queries
- [[agents/ai-engineer]] — LLM integration, RAG, agents
- [[agents/security-engineer]] — OWASP audit, auth review
- [[agents/test-engineer]] — Unit, integration, E2E tests
- [[agents/code-reviewer]] — Code quality, patterns, tech debt
- [[agents/researcher]] — Deep research on specific questions
- [[agents/technical-writer]] — Documentation, READMEs, API docs

## Execution Agents

- [[agents/executor]] — Executes plans with atomic commits
- [[agents/planner]] — Creates executable phase plans
- [[agents/debugger]] — Investigates bugs, manages debug sessions
- [[agents/verifier]] — Verifies phase goal achievement
- [[agents/roadmapper]] — Creates project roadmaps
- [[agents/plan-checker]] — Verifies plans before execution
- [[agents/phase-researcher]] — Researches before planning
- [[agents/codebase-mapper]] — Explores and maps codebases
- [[agents/integration-checker]] — Verifies cross-phase integration
- [[agents/nyquist-auditor]] — Generates tests for coverage
- [[agents/research-synthesizer]] — Synthesizes research outputs
- [[agents/design-critic]] — Reviews implemented designs
- [[agents/project-researcher]] — Domain ecosystem research

## Commands

- [[commands/build]] — Build features
- [[commands/ship]] — Ship to production
- [[commands/plan]] — Plan implementation
- [[commands/design]] — Design screens/components
- [[commands/review]] — Review code
- [[commands/audit]] — Audit codebase
- [[commands/research]] — Deep research
- [[commands/daily]] — Daily standup
- [[commands/debug]] — Debug issues
- [[commands/fix]] — Fix bugs

## Agent Memory

- [[memory/LONG-TERM]] — Cross-session patterns and preferences
- [[memory/DECISIONS]] — Architecture decisions
- [[memory/CODEBASE-MAP]] — Key files and tech debt
- [[memory/USER-INSIGHTS]] — Customer language and pain points
- [[memory/AUDIT_LOG]] — Audit history

## Session History

- [[docs/08-agents_work/INDEX]] — All agent work sessions
- [[MOC-History]] — Full history with session links

## Related MOCs

- [[MOC-Architecture]] — What the agents build
- [[MOC-Product]] — What the agents deliver
- [[CLAUDE]] — Project rules all agents follow
- [[AGENTS]] — Full routing table
