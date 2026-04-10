---
title: Architecture MOC
type: moc
domain: architecture
summary: System design, DB schema (32 tables), API contracts, AI agents, tech stack
tags:
  - architecture
  - system-design
  - database
  - api
status: active
updated: 2026-04-10
---

# Architecture MOC

> System design, database, APIs, AI intelligence layer, and tech stack.

## System Design (Master)

- [[docs/03-system-design/ARCHITECTURE]] — Master system design (4 layers: product, architecture, intelligence, validation)
- [[docs/03-system-design/DATABASE_SCHEMA]] — 32 Supabase tables, RLS policies, RPCs
- [[docs/03-system-design/API_CONTRACTS]] — All API routes and contracts
- [[docs/03-system-design/AI_AGENTS]] — 16 AI agent pipelines, LLM costs, execution flow
- [[docs/03-system-design/TECH_STACK]] — Full technology stack and rationale

## Engineering

- [[docs/ENGINEERING_PRINCIPLES]] — Code conventions and technical decisions
- [[docs/DASHBOARD_REDESIGN_SPEC]] — Dashboard redesign architecture

## Codebase (Implementation)

- [[MOC-Codebase]] — Code map, patterns, conventions, tech debt

## Key Architecture Decisions

- Supabase for auth + DB + RLS (not Clerk, not Firebase)
- Paddle for billing (not Stripe)
- OpenRouter as LLM gateway (2 keys: scan + agent)
- Inngest for background jobs (scan execution, agent pipeline)
- Direct LLM API integration (no n8n, no LangChain)

## Related MOCs

- [[MOC-Product]] — What these systems implement
- [[MOC-Codebase]] — How the code is organized
- [[MOC-Agents]] — Agent system that builds and maintains this
