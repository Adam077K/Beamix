# Long-Term Memory
*Updated by CEO after each session. Max 100 lines — compress when full.*

---

## User Preferences

- Workflow: Explicit user confirmation required before merges and deploys
- Commits: Conventional commits format (feat/fix/chore/docs)
- QA gate: Mandatory — never skip, always run Security Engineer + Test Engineer in parallel
- Parallelism: 2-5 workers in parallel worktrees preferred for medium/complex tasks
- Models: Sonnet for default work, Haiku for test/lint/classification, Opus for security/research only
- Memory: CEO updates LONG-TERM.md and writes session file after every session

---

## Project Stack (Override per-project by editing this section)

- Frontend: Next.js 14+ App Router, TypeScript strict, Tailwind CSS, Shadcn/UI
- Backend: Next.js API Routes / Server Actions, Zod validation on all inputs
- Database: Supabase (use mcp__supabase__* tools when available)
- Auth: Clerk
- Payments: Paddle
- Email: Resend
- Jobs: Inngest
- Hosting: Vercel
- AI: Anthropic Claude API (claude-sonnet-4-6 default)
- Vector DB: Pinecone (prod) / pgvector (early)

---

## Agent Architecture

- 3-layer hierarchy: CEO → 9 Team Leads → 9 Workers + execution agents
- All code workers use isolated git worktrees (feat/[task-name]) — never commit to main directly
- QA Lead gate is mandatory before any merge (runs Security Engineer + Test Engineer in parallel)
- CEO updates memory after every session — session file + LONG-TERM.md + DECISIONS.md

---

## Skills System

- 430 skills in .agent/skills/ — discover via MANIFEST.json, filter by tags
- Discovery: Read .agent/skills/MANIFEST.json, filter by tags — never grep the directory
- Load max 2 skills per task, on-demand only

---

## Project Patterns

- [Populated as patterns are confirmed during real project sessions]

---

## Recurring Issues

- [Populated when same problem appears 2+ times]

---

## Important Decisions

- [Cross-referenced with DECISIONS.md — key cross-session decisions only]
