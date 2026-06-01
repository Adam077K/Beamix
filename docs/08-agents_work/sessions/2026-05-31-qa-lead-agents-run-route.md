---
date: 2026-05-31
agent: qa-lead
task: QA gate review — feat/agents-run-route
branch: feat/agents-run-route
head_commit: fbe4c9c
qa_verdict: PASS
tier: full
codex_status: codex_unavailable
---

## Summary

Full-tier QA gate review for `POST /api/agents/run` ignition route. Independent verification performed against a clean `git reset --hard origin/feat/agents-run-route` to `fbe4c9c` — no dirty-worktree contamination.

## Scope

- `apps/web/src/app/api/agents/run/route.ts` (383 lines)
- `apps/web/src/app/api/agents/run/route.test.ts` (507 lines)

No migrations, no `database.types.ts` modification. Deferred items (daily-cap atomic reserve, type regen) confirmed absent.

## Exit Codes

- TYPECHECK_EXIT: 0
- TEST_EXIT: 0 (16/16 tests passing)
- BUILD_EXIT: 0

## All 9 Required Fixes — Verified Present

1. Inngest fail → `status='failed'` + `error_message` + 502: route.ts:351-378, test:408-431
2. `targetUrl` SSRF `.refine()` guard (169.254.x, file://, localhost, RFC-1918): route.ts:74-96, test:272-303
3. `queryCluster: z.array(z.string().min(1).max(500)).max(50).optional()`: route.ts:100
4. IDOR businesses SELECT on user-scoped client; admin only for INSERT: route.ts:233-238, 307
5. `resolveUserPlanTier` throws on DB error, falls back to `discover` only on no-subscription: route.ts:159-161, 254-264
6. `getAdminClient()` throw wrapped → structured 500: route.ts:179-188
7. IDOR test asserts `.eq('id')` AND `.eq('user_id', sessionUserId)` on user-scoped client: route.test.ts:339-347
8. Test for `agent_jobs` INSERT failure → 500: route.test.ts:392-403
9. Comment: `queryCluster` is event-only (no DB column): route.ts:303-304

## Findings

**P0/P1:** None

**P2 (non-blocking):** SSRF guard does not cover IPv6 ULA (fc00::/7) or link-local (fe80::/10) ranges beyond ::1. Low exploitability on IPv4-primary Vercel infra. File as separate hardening ticket.

**P3 (non-blocking):** No per-user rate limit on the route itself. Two DB reads execute before daily cap check. Mitigate with Vercel Edge or Upstash. File as separate infrastructure ticket.
