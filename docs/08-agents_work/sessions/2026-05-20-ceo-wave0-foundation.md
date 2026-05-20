---
session: ceo-wave0-foundation
date: 2026-05-20
agent: ceo
branch: ceo-1-1779270078
risk_tier: irreversible
qa_verdict: PASS
status: COMPLETE — Wave 0 merged to main, build green
---

# Wave 0 — Foundation: CEO Orchestration Close-Out

## Result
All of Wave 0 merged to `main` (HEAD `0bede61`). `pnpm typecheck` + `next build` green.

| PR | Scope | Tier | QA |
|----|-------|------|-----|
| #78 | archive legacy apps/web/ | Trivial | merged (prior session) |
| #80 | db-foundation — 15 migrations, RLS, RPCs, types | Irreversible | PASS — 3 independent judges |
| #79 | app-shell — Next.js 16 scaffold, 7 routes, 27 Shadcn, security boundary | Full | PASS — cycle 2 |
| #81 | agent-system — 11 agents, 5-step pipeline, Inngest | Irreversible | PASS — adversary + 3 judges |
| #82 | post-merge integration — Inngest typing + eslint | Lite | PASS |

## What QA caught and forced fixed
- Critical RCE in `next@15.3.2` (GHSA-9qr9-h5gf-34mp) → bumped 15.3.9.
- Insecure auth gate — `getSession()` → `getUser()` in middleware.
- Credit-drain hole — 7 SECURITY DEFINER RPCs callable by any authenticated user via PostgREST → migration 14 `REVOKE … FROM PUBLIC` (live proacl verified).
- Prompt-injection bypass — `renderCustomInstructions` wrapped but skipped `sanitizeCustomInstructions` → fixed.
- Two `database.types.ts` corruption bugs — CLI stdout/stderr leaked into the generated file (head + tail).
- Non-idempotent `plans` seed → `ON CONFLICT` (migration 11 + 15).
- `/api/health` leaking secret-name inventory to unauthenticated callers → `missing_count` only.

## Key facts
- Supabase project `zhjxdwcqxhwletkpuwyl` legacy March-2026 schema was DROP SCHEMA-wiped (Adam-authorized) and rebuilt fresh — 15 migrations applied to staging.
- The 3 Wave 0 branches were disjoint slices of `apps/web/`; only compile combined — integration pass (#82) was required and expected.
- Supabase MCP unusable this session (dead `.envrc` token + `--read-only`); DB work driven via `supabase` CLI with a fresh token.

## Wave 0.5 tech-debt (judge findings, non-blocking — see BACKLOG.md)
content_items/inbox_items WITH CHECK business_id gap · non-atomic daily-cap increment · updateJobStage swallows DB errors · businessId/userId ownership check missing · uncontrolled-text columns lacking CHECK · credit_holds no FK to agent_jobs · redundant plans_tier_idx.
