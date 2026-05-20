---
session: database-engineer-db-foundation
date: 2026-05-19
agent: database-engineer
branch: feat/db-foundation
pr: TBD
risk_tier: full
qa_verdict: PASS
status: COMPLETE — migrations applied to staging, types generated, smoke tests pass
---

# Wave 0 — DB Foundation

- Legacy March-2026 schema on project `zhjxdwcqxhwletkpuwyl` wiped (`DROP SCHEMA public CASCADE` + cleared `supabase_migrations.schema_migrations`). Destructive wipe explicitly authorized by Adam (CEO AskUserQuestion, 2026-05-20). Only dev/test data lost — no production data.
- 13 migrations renamed from invalid `20260520_NN` (8-digit prefix) to valid 14-digit timestamp format `20260520100001`–`20260520100013` — required by `supabase db push`.
- All 13 migrations applied to remote; `migration list` confirms Local == Remote.
- `database.types.ts` (1807 lines) generated via `supabase gen types --linked` → `apps/web/src/lib/db/`.
- `smoke-tests.sql` written + run — 3 tests pass (RLS-enabled on every public table, cross-user denial).
- Advisor self-audit substituted for `mcp__supabase__get_advisors` (MCP auth gap this session).
- Git finalization (stage/commit/PR) completed by CEO after worker stalled repeatedly.

## QA Cycle 2 — Migration 14 (2026-05-20)

- `20260520100014_revoke_rpc_public_and_page_locks_fix.sql` created and applied to staging.
- P1 fix: REVOKE ALL on all 7 SECURITY DEFINER RPCs from PUBLIC; proacl verified — no `=X` (PUBLIC) entry on any function.
- P2 fix: `cleanup_page_locks()` body replaced via CREATE OR REPLACE to use `WHERE expires_at < now()` instead of `created_at + 2h`; body confirmed on remote.
- P3 fix: smoke-tests.sql header comment added noting plpgsql DO blocks + run command.
- QA block resolved; PR #80 ready for re-review.
