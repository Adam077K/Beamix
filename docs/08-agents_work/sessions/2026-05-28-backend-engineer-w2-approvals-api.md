---
date: 2026-05-28
agent: backend-engineer
task: w2-approvals-api
branch: integrate/w2-approvals-api
worktree: .worktrees/be-w2-approvals-api
qa_verdict: PASS
tier: irreversible
---

Wave 2 approvals API — signed-token helper, approve/reject Server Actions, quick-approve route, approval-pending email handler. All committed in 4 prior commits.

Tests added in continuation session: 18 vitest tests across signed-token (10) and _actions (8). Vitest + @vitest/coverage-v8 added to devDependencies. `server-only` stub + vitest.config.ts added.

P1 bug fix (integration session): `performStateTransition()` was running the approval_queue UPDATE through the user cookie client (anon key), but approval_queue RLS is Pattern A — SELECT-only for customers, no UPDATE policy. Every approve/reject silently returned "not found or already actioned" for all users. Fix: UPDATE now goes through the service-role admin client via `getApprovalQueueClient()` (un-generic `createClient`) with explicit `.eq('customer_id', userId)` scoping to enforce ownership at the application layer.

Schema drift fix: approval_queue is not yet in database.types.ts. All four files that reference this table (_actions.ts, _data.ts, route.ts, send-approval-pending-email.ts) now use un-generic Supabase clients for approval_queue queries; typed `Database`-generic clients are retained for tables that ARE in the schema (audit_log, user_profiles). Zero TypeScript errors. Build PASS. 23/23 vitest tests pass.

Round 2 P1 fixes (2026-05-29):
- P1-1: quick-link POST changed `.single()` → `.maybeSingle()` on the UPDATE call; added explicit `if (!updated) return goneResponse()` guard BEFORE audit_log write — race/replay returns 410, not 500.
- P1-2: quick-link POST now fires `approval.approved` Inngest event (matching _actions.ts data shape) after a successful UPDATE. Non-fatal: Inngest failure is caught and logged.
- P1-3: audit_log write in quick-link route wrapped in try/catch with structured console.error (event_type, approvalId, customerId). _actions.ts audit_log console.error improved to include event_type and customerId for alertability (deliberate non-fatal-but-logged — Principle #10).
- Sec P2-1: DEV_FALLBACK named const in signed-token.ts; production guard now throws if secret equals the literal dev fallback (not just if it's short).
- Tests: 10 new assertions across route.test.ts (new) and signed-token.test.ts. Total 33/33 vitest tests pass. tsc: 0 errors. Build: PASS.
