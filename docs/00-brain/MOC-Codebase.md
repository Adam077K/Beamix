---
title: Codebase MOC
type: moc
domain: codebase
summary: Code map, conventions, patterns, integrations, tech debt, testing strategy
tags:
  - codebase
  - nextjs
  - typescript
  - conventions
status: active
updated: 2026-04-10
---

# Codebase MOC

> How the Next.js app is organized, coding patterns, conventions, and tech debt.

## Code Organization

- [[docs/06-codebase/MAP]] — File map of saas-platform/src/
- [[docs/06-codebase/CONVENTIONS]] — Coding conventions and style
- [[docs/06-codebase/PATTERNS]] — Design patterns used in the codebase
- [[docs/06-codebase/INTEGRATIONS]] — Third-party integrations (Supabase, Paddle, Resend, etc.)
- [[docs/06-codebase/TESTING]] — Testing strategy and coverage
- [[docs/06-codebase/TECH_DEBT]] — Known tech debt and priorities

## Key Paths

```
saas-platform/src/
├── app/          — Next.js App Router pages
│   ├── (auth)/   — Login, signup, forgot-password
│   ├── (protected)/ — Dashboard, agents, settings
│   ├── scan/     — Free scan page
│   └── api/      — API routes (scan, onboarding, agents, billing)
├── components/   — React components (ui, dashboard, scan, onboarding, auth)
├── lib/          — Core logic (agents, scan, supabase, paddle, blog)
├── inngest/      — Background jobs (scan-free, scan-manual, agent-execute)
└── constants/    — Static data (industries, engines)
```

## Engineering Principles

- [[docs/ENGINEERING_PRINCIPLES]] — Core engineering decisions
- [[CLAUDE]] — Project-level conventions and rules

## Agent Memory of Codebase

- [[memory/CODEBASE-MAP]] — Agent's codebase map (updated by Code Reviewer)
- [[memory/DECISIONS]] — Architecture decisions affecting code

## Related MOCs

- [[MOC-Architecture]] — System design these files implement
- [[MOC-Product]] — Features the code delivers
