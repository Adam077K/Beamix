# GSA Startup Kit — Project Context
*Auto-loaded by Claude Code on every session*

---

## The Team

This project has a 12-agent autonomous startup team. Each agent has a dedicated role. See `AGENTS.md` for the full roster and routing table.

**How to start any session:** "Iris, [what I need]"
**Slash commands:** `/daily` `/plan` `/ship` `/audit` `/research`

---

## Skills Library

This project includes **938+ expert skills** at `.agent/skills/[skill-name]/SKILL.md`.

Agents load skills on demand: `READ .agent/skills/[skill-name]/SKILL.md`

**Source:** See [SKILLS_SOURCE.md](SKILLS_SOURCE.md) for upstream (antigravity-awesome-skills) and update instructions.

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
Frontend:   Next.js 14+ (App Router), TypeScript (strict), Tailwind CSS, Shadcn/UI
Backend:    Next.js API Routes / Server Actions, Zod validation
Database:   Supabase
Auth:       Clerk
Payments:   Stripe
Email:      Resend
Jobs:       Inngest
Hosting:    Vercel
AI:         Anthropic Claude API
Vector DB:  Pinecone (prod) / pgvector (early)
```

*Override any of these per-project by editing this section.*

---

## Memory

| File | Purpose |
|------|---------|
| `.claude/memory/DECISIONS.md` | Architecture + strategy decisions with rationale |
| `.claude/memory/CODEBASE-MAP.md` | Key files, patterns, tech debt (updated by Scout) |
| `.claude/memory/USER-INSIGHTS.md` | Customer language, pain points, JTBD (updated by Rex) |

---

## Models (February 2026)

| Tier | Model | Use for | Cost |
|------|-------|---------|------|
| **Sonnet 4.6** | `claude-sonnet-4-6` | Daily work: atlas, iris, morgan, nova, axiom, lyra, scout, nexus, spark | $3/M in · $15/M out |
| **Opus 4.6** | `claude-opus-4-6` | Depth work: sage (AI), guardian (security), rex (research) | $5/M in · $25/M out |
| **Haiku 4.5** | `claude-haiku-4-5` | Fast subagents: simple classification, test running, log parsing | $1/M in · $5/M out |

---

## Cost Optimization Rules (All Agents)

**Context discipline — most impactful:**
- Use `/clear` between unrelated tasks — prevents stale context, saves 40-70%
- Use `/compact` when context gets long on a single task
- Skills load **on-demand only** — never preload; each `READ skill` costs tokens
- Load only the 1-2 skills actually needed per task, not all possible skills

**Model discipline:**
- Sonnet 4.6 handles 80%+ of tasks at 3x lower cost than Opus — default to it
- Only escalate to Opus when genuinely needed: security audits, complex AI reasoning, deep synthesis
- For simple subagent tasks (run tests, check lint, fetch docs) use Haiku explicitly

**Delegation discipline:**
- Subagents run isolated contexts — verbose output (logs, test results) stays in subagent
- Pass *summaries* back to main agent, not raw data dumps
- `maxTurns` is set on all agents — respects it, don't try to extend loops
- Use memory files (`.claude/memory/*.md`) as shared state instead of passing large contexts

**Prompt caching (automatic):**
- System prompts are cached automatically — stable instructions reuse at 10% of input cost
- Keep agent instructions stable and structured (cached after first run)
- Don't randomize or vary instructions — breaks caching

---

## Rules (All Agents)

1. **Read before acting** — Glob/Grep before creating; check memory before decisions
2. **Delegate correctly** — Check AGENTS.md; never do work outside your domain
3. **Source claims** — Rex sources; agents don't invent data
4. **Leave breadcrumbs** — Update DECISIONS.md when making choices that affect others
5. **Iterate, don't overwrite** — Understand existing code before replacing
6. **Context discipline** — Follow cost optimization rules above on every session

---

## Project State

*[Update this section as the project evolves. Use as template for new projects.]*

- **Current focus:** [e.g., "Building MVP auth + core feature"]
- **Active sprint:** [e.g., "Week 1 — Foundation"]
- **Blockers:** [e.g., "None"]
- **Next milestone:** [e.g., "First paying customer"]

---

## Conventions

*[Add project-specific conventions here]*

- [ ] Update when making architectural decisions
- [ ] Update after first Scout audit
