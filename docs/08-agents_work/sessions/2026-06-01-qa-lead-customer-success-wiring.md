---
date: 2026-06-01
role: qa-lead
task: customer-success-wiring
branch: feat/customer-success-wiring
tip: fc71ae1
qa_verdict: PASS
tier: irreversible
reviewers: qa-lead (independent, multi-judge)
codex_status: unavailable (Claude-only multi-judge applied)
---

# QA-Lead Session: customer-success-wiring

## Branch
feat/customer-success-wiring (tip fc71ae1 — merge commit over origin/main)

## Tier
IRREVERSIBLE — new cron Inngest fn + new event `deliverables.over_cap` + per-customer email/nudge path + billing-path emit.

## Scope
12 files changed, 1868 insertions, 0 deletions. No DB migrations. 3 session .md files expected from main merge (not Phase C work).

## Independent Verification — Real Exit Codes
- TYPECHECK_EXIT: 0
- TEST_EXIT: 0 (27/27 tests passing across 5 test files)
- BUILD_EXIT: 0

## Per-Area Checks

1. **cost.alert NOT re-registered** — PASS. `cost.alert` appears exactly once in `BeamixEvents` (line 136, pre-existing). This branch added only `deliverables.over_cap` (line 134). No duplicate/redefinition.

2. **All 3 fns registered in api/inngest/route.ts** — PASS. `customerSuccessWeekly`, `customerSuccessOnApprovalRejected`, `customerSuccessOnOverCap` all imported and appended to the `functions[]` array.

3. **Cap enforcement integrity** — PASS. `deliverables.ts` uses `.catch((e) => console.error(...))` (no await). `OverTierCapError` throw is unconditional and follows the emit, never gated on it. Cap integrity test exercises the rejection path: `mockInngestSend.mockRejectedValueOnce(sendError)` — asserts both `rejects.toThrow(OverTierCapError)` and that the `over_cap emit failed` log was called. NOT a resolving mock. Test passes (CAP-INTEGRITY test confirmed green).

4. **weekly-context correctness** — PASS. wins = approved + 7d window via `acted_at`; queued = pending (no window, order by `created_at`); concerns = rejected + 7d window via `acted_at`. Each bucket capped at 5 via `.limit(BUCKET_CAP)`. State values used: 'approved', 'pending', 'rejected' — correct for approval_queue. Returns `{ wins, queued, concerns }` matching `CustomerSuccessInput.weeklyContext`.

5. **Cron syntax** — PASS. `{ cron: '0 14 * * 0' }` (Sunday 14:00 UTC). Comment: "Per-customer timezone scheduling is a follow-up ticket — UTC is the MVP baseline".

6. **Trigger enum match** — PASS. `NudgeTrigger` in `index.ts` declares `'cron_weekly' | 'approval_rejected' | 'deliverables_over_cap'`. Used: `trigger: 'cron_weekly'` (weekly fn), `trigger: 'approval_rejected'` (rejected fn), `trigger: 'deliverables_over_cap'` (over-cap fn). All match exactly.

7. **No DB migration** — PASS. `git diff origin/main...origin/feat/customer-success-wiring -- "*.sql" "*/migrations/*"` returned empty. Composite index on approval_queue is deferred.

## Findings

### P0/P1
None.

### P2/P3
- **P3** — `deliverables.ts` build emits a single `console.error` log on over_cap send failure with limited context (missing `occurredAt`). Not a blocker; a structured logger call would be preferable. File as tech-debt.
- **P3** — `customer-success-weekly.ts` loads up to 100 customers with a hard `.limit(100)` comment noting "pilot ceiling". No cursor pagination implemented. Fine for MVP but should be ticketed before first 101st customer.

## Verdict
PASS — Irreversible tier, Claude-only multi-judge (Codex unavailable). No P0/P1 findings. Build, typecheck, and all 27 tests green. Cap enforcement integrity verified against rejection path. cost.alert not re-registered. All 3 Inngest fns registered.
