---
date: 2026-05-28
agent: backend-engineer
task: w2-deliverables
branch: feat/be-w2-deliverables
worktree: .worktrees/be-w2-deliverables
qa_verdict: PASS
tier: irreversible
---

# Wave 2 Deliverables Gate — Session Log

Continuation of prior session which landed tier-caps + consumeDeliverable middleware.

## Commits this session

1. `feat(inngest): monthly deliverables reset cron` — committed reset-deliverables-monthly.ts (was uncommitted from prior session)
2. `feat(agents): wire deliverables gate into Wave 1 agent publish paths` — Inngest serve route, consumeDeliverable gate in pipeline runner, OverTierCapError as NonRetriableError in agent-execute
3. `test(billing): deliverables consume + cap-breach coverage` — vitest unit tests with mocked Supabase

## Key decisions

- Deliverable gate fires in `runAgentPipeline` after QA passes, before `persistOutput` — ensures no inbox item is created if the customer is over cap
- `OverTierCapError` treated as `NonRetriableError` in Inngest — cap breach will not be retried
- Agent types mapped to kinds: schema_generator→schema_pushed, faq_builder→faq_published, offsite_presence_builder+entity_builder→citation_submitted, content_optimizer+freshness_agent+authority_blog_strategist→content_published; query_mapper/performance_tracker/review_presence_planner/reddit_presence_planner are reports (not gated)
- Inngest serve route created at `apps/web/src/app/api/inngest/route.ts` — was missing from codebase

## Session A-3

Tests + vitest infra committed in session A-3. Branch ready for QA review.

## P1 Race-Condition Remediation (2026-05-29)

Confirmed race in `consumeDeliverable`: non-atomic read-modify-write on `deliverables_per_customer_per_month` allowed two concurrent agent runs to both read `used=cap-1`, both pass the cap check, and both increment — bypassing paid-usage caps (money leak).

**Fix:**
- Migration `20260529000007_atomic_consume_deliverable.sql`: adds `public.consume_deliverable(uuid, date, text, integer)` SQL function — conditional `UPDATE...RETURNING` in one transaction. `SECURITY DEFINER`, `search_path = ''`, `REVOKE EXECUTE FROM anon, authenticated`. Rollback file at `rollback/20260529000007_atomic_consume_deliverable.rollback.sql`.
- `deliverables.ts`: rewrote `consumeDeliverable` to call the RPC for capped tiers; unlimited tiers (Professional, null cap) use safe read-write (no cap to bypass).
- `database.types.ts`: added `consume_deliverable` to `Functions` so `getAdminClient().rpc(...)` typechecks.
- `deliverables.test.ts`: updated mocks to handle `rpc(...)` on admin client; added concurrency test asserting exactly one of two parallel calls succeeds when `used = cap - 1`.

**Verification:** `pnpm typecheck` PASS · `pnpm build` PASS · 13/13 tests PASS.

RLS finding: `subscriptions` has only `owner read` (SELECT) and `service_role all` — no authenticated UPDATE policy. Cap cannot be bypassed via direct client writes.

## CEO QA gate (ceo-wave2-merge-train, 2026-05-29) — INDEPENDENTLY VERIFIED
- code-reviewer + security-engineer (parallel, out-of-band) → 1 P1: non-atomic cap check in `consumeDeliverable` (TOCTOU → paid-deliverable cap bypass under concurrent agent runs). P1 remediated by the atomic `consume_deliverable` RPC migration (this branch).
- RLS confirmed: `subscriptions` has owner-SELECT + service_role-ALL only; no client UPDATE path to self-mutate counters.
- Checks re-run by CEO from inside the worktree (HEAD eb6890c), raw exit codes:
  - `tsc --noEmit` → exit 0 (clean)
  - `vitest run src/lib/billing/deliverables.test.ts` → 13/13 passed (vitest 4.1.7)
  - `SKIP_ENV_VALIDATION=1 … next build` → exit 0 (compiled; 18 static pages; 24 routes)
- Tier corrected FULL → IRREVERSIBLE (adds DB migration `20260529000007`). Pending Adam merge sign-off + migration apply.
- NOTE: an earlier integration branch (`integrate/w2-deliverables`, PR #112) was corrupted by a bad index reset (mass-deletion commit). It is abandoned; this clean branch (`w2/deliverables-clean` @ eb6890c) supersedes it.
