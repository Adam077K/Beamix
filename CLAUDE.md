# Beamix — Project Context

**Repository:** https://github.com/Adam077K/Beamix.git

This is the Beamix GEO Platform project. All work happens in this repo.

## Project Overview

Beamix scans SMBs for AI search visibility, diagnoses why they rank (or don't), and uses AI agents to fix it. Competitors show dashboards; Beamix does the work.

## Key Paths

| Path | Purpose |
|------|---------|
| `saas-platform/` | Main Next.js app (landing, dashboard, API routes, agents) |
| `.planning/` | PRD, architecture, specs, competitive research |
| `agent-memory/` | Rex and other agent memory/context |
| `GSA-Vibe-Startup-Kit/` | GSA toolkit — **separate repo, do not update** |

## Default References

When discussing the project, repo, or deployments:
- **Repo:** https://github.com/Adam077K/Beamix
- **Clone:** `git clone https://github.com/Adam077K/Beamix.git`

## Stack

- Next.js 16, React 19, TypeScript
- Supabase (auth, DB, RLS)
- Stripe (billing)
- n8n Cloud (workflows)
- LLMs: OpenAI, Claude, Gemini, Perplexity...

## Context Optimization ⚡



## Conventions

- Hebrew + English in planning/docs as needed
- `.planning/` is the source of truth for product and architecture
