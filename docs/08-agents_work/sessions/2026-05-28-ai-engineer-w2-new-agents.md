---
date: 2026-05-28
role: ai-engineer
task: w2-new-agents-customer-success-and-approval-gate-writer
branch: integrate/w2-new-agents
worktree: .worktrees/ai-w2-new-agents
qa_verdict: PASS
tier: irreversible
---

## Integration onto main (2026-05-29)

Squash-merged feat/ai-w2-new-agents → integrate/w2-new-agents (rebased off origin/main 1d0aa30).

**Conflicts resolved:**
- `apps/web/package.json` — main already had `vitest@^4.1.7` (sibling W2 branch); kept main's newer version.
- `apps/web/vitest.config.ts` — unioned: kept main's `globals: true` + `pool: 'forks'` + `setupFiles: []` (required by sibling tests), plus the feat branch's oxc/JSX explanation comment. The `server-only` alias was already on main.
- `pnpm-lock.yaml` — took main's lockfile (no net new top-level deps; vitest@4 already present).

**Build fix:** two ESLint `react/no-unescaped-entities` errors in `success-nudge.tsx` (lines 144, 148) — replaced `'` with `&apos;` inside JSX text.

**Stub audit (all 4 markers triaged):**
- `customer-success/index.ts:27` — JSDoc reference to Group A integration (forward-doc, no stub code)
- `customer-success/index.ts:450` — code-comment explaining that the deliverables gate is not yet wired (real fall-through to step 7 is implemented and tested)
- `customer-success/index.ts:488` — multi-line TODO comment with exact wiring instructions for when `lib/billing/deliverables.ts` lands (Group A); no placeholder code — the path falls through to the real send. Documented as accepted technical debt, traceable to CEO Wave 2 brief.
- `shared/audit.ts:20` — JSDoc explaining the `AuditClient` interface is a test-friendly shape, not a code stub.

No code stubs remain. YMYL detector is a real regex-based scanner (5 pattern categories + explicit YMYL marker), audit writer inserts real `audit_log` rows with the exact columns from migration `20260520100004_audit_feature_flags.sql` (actor_type, actor_id, event_type, target_table, target_id, payload).

**YMYL deduplication note:** the existing detector on main (`brand-brief-manager/index.ts:60-80`) is a private, narrower 4-pattern version scoped to that agent. The new `shared/ymyl.ts` is a broader 5-category detector exposing typed match results (`YmylMatch`) and is reused by both new agents. Reconciliation deferred — brand-brief-manager could later import from `shared/` but that refactor was out of scope for this wave.

**Agent registry:** customer-success and approval-gate-writer are infrastructure agents (Inngest-triggered, not credit-gated dashboard agents), so they are intentionally NOT in `config/registry.ts` (same model as `brand-brief-manager`). No registration needed.

**Verification (from worktree, with env prefix):**
- `pnpm install` — lockfile up to date
- `pnpm -F @beamix/web exec tsc --noEmit` — PASS (zero errors)
- `pnpm -F @beamix/web build` — PASS
- `pnpm -F @beamix/web exec vitest run src/lib/agents` — Test Files 2 passed (2), Tests 33 passed (33)

---


# Wave 2 — Customer Success + Approval-gate Writer agents

## Scope

Two new LLM agents under `apps/web/src/lib/agents/`:

1. **customer-success** — weekly proactive nudge email, YMYL hard-gate, defers to approval_queue when required.
2. **approval-gate-writer** — drafts approval cards, inserts to `approval_queue` with brand-tone-aware copy + late-YMYL catch.

Shared infra under `apps/web/src/lib/agents/shared/`:
- `ymyl.ts` — keyword + explicit-marker detector
- `audit.ts` — typed `audit_log` writer

## D-3 session — tests committed

Tests committed in session D-3. Branch ready for QA review.

- **33 vitest tests** total (6 customer-success + 27 approval-gate-writer)
- vitest@4.0.0 added to `apps/web/package.json` devDependencies (parallel with sibling W2 branches — reconcile at merge)
- vitest config + `server-only` mock + tsconfig test-exclude added
- vite import-analysis can't parse the React Email TSX under Next's `jsx: preserve` tsconfig — worked around with `vi.mock('../../../emails/success-nudge')` in the customer-success test (template renders are not under test here; the SuccessNudge React component is exercised by Resend e2e in a separate path)

## Commits on this branch (8 total)

1. `a4a5fa5` feat(agents): shared helpers — YMYL detector + audit log writer
2. `ad7521b` feat(emails): success-nudge React Email template
3. `62aa271` feat(agents): Customer Success — weekly nudges, YMYL hard-gate, approval queue defer
4. `d054ea2` fix(agents): cast Supabase client to AuditClient via unknown
5. `974b043` feat(agents): Approval-gate Writer — drafts cards, queue inserts, YMYL hard gate
6. `af89f53` chore(deps): add vitest@4 + config
7. `bda9390` test(agents): Customer Success + Approval-gate Writer coverage

## Typecheck status

`pnpm -F @beamix/web typecheck` reports two pre-existing errors NOT in this branch's scope:
- `src/app/api/discovery/chat/route.ts:472` — TS2554 expected 2 args got 1
- `src/app/api/scan/free/route.ts:235` — TS2352 Inngest payload typecast

Both are pre-Wave-2 main-branch debt. Brief explicitly forbade touching them.

## Cost instrumentation

Both agents log `event:llm_call` per call with model, tokens, cost_usd. Both enforce a `$1.00` per-run ceiling and emit `cost.alert` above `$0.50`. Per-run cost on Sonnet 4.6 with the prompts in `prompt.ts`: $0.005 typical, well under the $1 budget.

## Hand-off to QA

Run:
```bash
pnpm -F @beamix/web exec vitest run src/lib/agents
```
Expected: `Test Files 2 passed (2), Tests 33 passed (33)`.
