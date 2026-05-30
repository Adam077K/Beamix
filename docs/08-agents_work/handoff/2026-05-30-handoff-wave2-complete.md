---
date: 2026-05-30
from: ceo-wave2-merge-train
purpose: Wave 2 merge train COMPLETE — release tasks + follow-ups for next CEO
---

# Handoff — Wave 2 merge train COMPLETE

All 6 Wave 2 branches are on main. **Main = `6c50e9f` (#117).** Merged main verified green:
`tsc` 0 · `next build` 0 · `vitest` 108/108. Worktrees + branches cleaned up.

Wave 2 PRs: #111 held-revenue · #113 deliverables · #114 approvals-api · #115 approvals-ui ·
#116 founding-100 panel · #117 new agents.

## ⚠️ DO BEFORE THIS SHIPS (release blockers)
1. **Apply the DB migration** `apps/web/supabase/migrations/20260529000007_atomic_consume_deliverable.sql`
   to Supabase (staging → prod). Additive function, reversible via the paired rollback. Without it,
   `consumeDeliverable` for capped tiers errors at runtime. Drive via supabase CLI — project ref
   `zhjxdwcqxhwletkpuwyl` (memory `project_supabase_cli_db_workflow`).
2. **Set `APPROVAL_SIGNING_SECRET`** in Vercel (≥32 chars, NOT the dev fallback). Email approval links
   throw at module load in production without it.
3. Regenerate `database.types.ts` after the migration — kills the documented untyped-client escape
   hatches in `deliverables.ts` and `founding-100.ts`.

## Follow-ups before GA / first paying customer (non-blocking, tracked)
**YMYL safety (highest priority — it's a safety control):**
- `shared/ymyl.ts` regex is **English-only**; Beamix is Hebrew+English. Add Hebrew medical/legal/financial
  terms; add leet/unicode normalization (NFKC + zero-width strip + leet fold); consider an LLM-classifier
  fallback. Today it fails-closed + routes through human approval, so it's safe-but-leaky.
- **Two YMYL detectors exist** — new `shared/ymyl.ts` (5-cat) and `brand-brief-manager`'s private
  4-pattern copy. Refactor brand-brief-manager to import the shared one to prevent drift.

**new-agents correctness P2s (code review):**
- approval-gate-writer: DB insert failure returns `reason:'draft_invalid'` → add `insert_failed`.
- customer-success: `insertApprovalQueueRow` throws uncaught at the call site → wrap, audit, return
  structured outcome (currently escapes the return contract → bypasses audit logging).
- customer-success approval inserts omit explicit `expires_at` (DB default 7d applies; spec wants 48h).
- dead `first_50_customers` union member — implement the founding-cohort gate or remove.

**new-agents security P2s:** confirm Inngest event sources are trust-bounded — `customerId`/`customerEmail`
are taken from the event payload; derive `customerEmail` server-side from `auth.users`.

**Wiring:** the 2 new agents are NOT yet wired to Inngest triggers (infra agents, separate task — same
pattern as brand-brief-manager). Wire customer-success (weekly cron) + approval-gate-writer
(gated_publish event) when their upstream callers are built.

**approvals-ui polish:** lift `Toast.Provider` out of the per-row component; shared `getServerUser()` helper.

**held-revenue (prior session, still open):** refund FK by `paddle_event_id` not most-recent heuristic;
`.maybeSingle()` on refund insert; `held_revenue_amount_cents` renewal drift; audit `actor_id` cosmetic.

## Untouched / not your job
- PR #44 (engine-unique-drop migration) — Adam said LEAVE IT.

## Lesson baked into memory this run
- `feedback-verify-build-in-worktree`: run tsc/build/test INSIDE the target worktree (Beamix build needs
  `SKIP_ENV_VALIDATION=1` + dummy Inngest/approval envs); never write a QA verdict from a worker's summary
  — re-run and paste real exit codes; sanity-check PR diff file-counts.
