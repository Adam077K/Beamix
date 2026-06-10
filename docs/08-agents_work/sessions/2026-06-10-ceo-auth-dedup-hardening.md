---
date: 2026-06-10
role: ceo
task: auth-dedup-hardening (follow-up B1)
branch: feat/auth-dedup-hardening
tier: full
qa_verdict: PASS
---

# CEO Session — Auth hardening B1 (dedup + helper adoption)

Follow-up Job B1 from the navigable-product handoff. Strictly behavior-preserving
refactor + test-coverage on top of live `main` (`63e055b`).

## Shipped
- Extracted the 4 duplicated `Dots()` components → `components/auth/auth-ui.tsx`.
- Extracted `validateEmail`/`validatePassword` → `components/auth/auth-validation.ts`
  (+ node-env unit tests).
- Named the magic `4000`ms PASSWORD_RECOVERY gate timeout → exported
  `PASSWORD_RECOVERY_TIMEOUT_MS` in `auth-logic.ts` (+ regression-guard test).
- Adopted `createServerSupabaseClient()` in 5 server files (dashboard page,
  approvals page/_data/_actions, agents/run route). Middleware left untouched
  (must use `NextRequest.cookies`, can't import the server-only helper).
- Added `oauth-click.test.ts` assertion that `handleGoogleOAuth` forwards `next`
  into `signInWithOAuth` `redirectTo`.
- Folded in first-pass advisories: `agents/run/route.test.ts` now mocks
  `@/lib/supabase/server` (not `@supabase/ssr`); timeout regression guard added.

## Verification
- typecheck 0 · test 0 (405 tests) · build 0 — re-run in-worktree.
- Branch is a clean linear descendant of live `main` `63e055b`; merges with no conflicts.
- Binding QA gate (`.claude/workflows/qa.js`, full tier) run **twice** → **PASS**
  both times, zero confirmed blockers (runs `wf_c337e213-a45`, `wf_49bff111-300`).

## Fast-follow cleanup ticket (7 advisories, all non-blocking — sweep in one pass)
From the two binding-gate runs. None affect correctness/security of the merged change:
- **P2** `approvals/_actions.test.ts` still mocks `@supabase/ssr` instead of
  `@/lib/supabase/server` after the B1 refactor (twin of the route.test.ts fix we landed).
- **P3** `agents/run/route.test.ts` — two stale comments still attributing
  `userClient` / `createServerClient` to `@supabase/ssr` after the mock was updated.
- **P3** `approvals/_actions.ts` — `getUserClient()` is now a dead single-line
  async wrapper; inline it.
- **P3** `agents/run/route.test.ts` — no test for the `createServerSupabaseClient`
  rejection/throw path (unguarded throw in the route).
- **P3** (run 1) `auth-logic.test.ts` resetSubmit error-path tests don't assert
  `signOut` is skipped; spy-restore + log-args assertions are loose.
- **P3** (run 1) `LoginForm.tsx` calls `createClient()` per submit instead of memoizing.

## Notes / constraints confirmed this session
- Migration `20260608000001_handle_new_user_trigger.sql` + backfill APPLIED by Adam
  in Supabase SQL Editor and verified by read query (fn+trigger present, SECURITY
  DEFINER, EXECUTE revoked, 0 users missing profile/subscription). Signup blocker cleared.
- Agents are HARD-blocked from prod-DB writes in auto-mode (permission classifier
  blocks `mcp__supabase__*` writes AND editing `.mcp.json`'s `--read-only`, even with
  direct Adam authorization). Adam runs prod DDL/DML in the SQL Editor.
