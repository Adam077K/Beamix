---
date: 2026-05-30
from: ceo-bin-beamix-rewrite (+ wave2 merge train)
purpose: Continue the Wave 2 merge train — 5 of 6 branches remain
---

# Handoff — Wave 2 merge train (5 branches left)

## Where main is
`origin/main` = `755efde` — held-revenue (#111) just landed. Recent merges this run:
#105 war-room seeds · #106 hook chmod fix · #107 tmux kill-pane · #108 vercel-build unblock ·
#109 technical-writer Bash · #110 discovery guardrails · #111 held-revenue.
Vercel is GREEN on main (was red all session; #108 fixed it). Keep it green.

## The job: land Wave 2 branches 2–6
Six branches were built in ONE dispatch (2026-05-28) and stranded, all forked from #98 (~12
behind). **Branch 1 (held-revenue) is DONE.** Remaining, in recommended merge order:

| # | Branch | Notes / risk |
|---|--------|--------------|
| 2 | `feat/be-w2-deliverables` | Touches `apps/web/src/app/api/inngest/route.ts` — will CONFLICT with #111's route change (resolve the `functions:[]` array + imports). Registers `reset-deliverables-monthly` cron — verify it's wired into the serve route. 1 stub marker. |
| 3 | `feat/be-w2-approvals-api` | Touches `api/inngest/route.ts` AND `inngest/client.ts` (same conflict class as #2). **Had 7 UNCOMMITTED files** in its worktree — sort/commit those first. signed-token + quick-approve route — security-review the token HMAC + middleware. 4 stub markers. |
| 4 | `feat/fe-w2-approvals-ui` | Depends on #3 (shares `approvals/_actions.ts`, `_data.ts`). Land AFTER approvals-api. 0 stubs (cleanest). |
| 5 | `feat/fe-w2-founding-100` | Independent, low-risk. NOTE: its `founding-100.ts` lives at `apps/web/src/lib/billing/founding-100.ts` — check it doesn't collide with the founding-100 work already on main from #99. 3 stubs. |
| 6 | `feat/ai-w2-new-agents` | 2 new agents (customer-success, approval-gate-writer) + shared `ymyl.ts`/`audit.ts`. 8 stub markers — review hardest. Irreversible (lib/agents). |

## The PROVEN per-branch recipe (held-revenue taught us this — follow it exactly)
1. `git fetch origin` then **verify origin/main is real** (`gh api repos/Adam077K/Beamix/branches/main`) — local ref drifted on me this session; see memory `feedback-verify-github-main-not-local-refs`.
2. `git -C <worktree> rebase origin/main` (resolve inngest-route conflicts for #2/#3 — it's a functions-array + imports merge, mechanical).
3. **Register any cron** the branch adds into `api/inngest/route.ts` (held-revenue's sweep was defined-but-unregistered → would never fire; assume each backend branch has this gap).
4. `pnpm install --frozen-lockfile` → `pnpm -F @beamix/web typecheck` → `pnpm vitest run <branch test files>`.
5. **Run the FULL build** `INNGEST_EVENT_KEY=dummy INNGEST_SIGNING_KEY=signkey_dummy pnpm -F @beamix/web build` — `next build` runs ESLint and typecheck SEPARATELY; typecheck passing does NOT mean build passes. Every wave-2 branch so far had build-lint failures (unused vars, unescaped JSX apostrophes) that only the full build catches. Vercel runs the full build, so a green Vercel = this passing.
6. Dispatch code-reviewer + security-engineer (out-of-band, parallel). Money-flow / agent / token paths = expect P1s.
7. Fix all P1s (+ cheap P2s) → re-run build+tests → re-review until both PASS.
8. **Independently verify** the worker's claims — held-revenue's worker reported "typecheck clean" when it wasn't, and reviewers waved a real `held_until`-wrong-table runtime bug as "out of scope." Trust the build output, not the summaries.
9. Session file (`qa_verdict: PASS`, `tier: irreversible`) → push → PR → `risk:irreversible` label → Adam sign-off → merge → remove worktree + branch.

## Hard-won gotchas (all cost time this session)
- **`as never` casts on Supabase tables hide schema drift from typecheck.** held-revenue inserted `held_until` into `revenue_events` (no such column — it's on `subscriptions`); tests mocked the insert so it was invisible until a real build/runtime. Grep each branch's inserts against the actual migration columns.
- **Branch name ≠ worktree dir name.** Worktrees are `.worktrees/be-w2-X` but branches are `feat/be-w2-X`. Push with the branch name.
- **QA gate needs BOTH** the `risk:irreversible` label AND a session file with `qa_verdict: PASS` matching the branch slug. Missing either = red gate.
- **Vercel red ≠ your bug** only if main itself is red. Main is green now, so a red Vercel on your PR IS your branch.

## Tracked follow-ups from held-revenue (non-blocking, file before first paying customer)
- `handleTransactionRefunded` resolves `revenue_event_id` by most-recent-unbooked heuristic → wrong FK for multi-charge customers. Fix: look up by `paddle_event_id = tx.id`.
- `.single()` → `.maybeSingle()` on refund insert; `held_revenue_amount_cents` renewal drift; audit `actor_id` cosmetic; regenerate `database.types.ts` to kill the `as never` casts.

## Untouched / not your job
- **PR #44** (engine-unique-drop migration) — Adam said LEAVE IT. Do not merge or close.
- Identity: `/color gold` · `/name ceo-wave2-merge-train` (or per-branch).

## What NOT to redo
- Don't re-review held-revenue (#111 merged). Don't re-run the bin/beamix seed work (#105 merged). Don't re-test Agent Teams primitives. Read `.claude/memory/project_orchestration_topology_locked.md` + `feedback_cto_planning_only.md` + `feedback-verify-github-main-not-local-refs.md` at start.
