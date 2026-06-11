---
date: 2026-06-05
role: qa-lead
task: scan-engine-pr-irreversible-synthesis
branches: [feat/scan-engine-db, feat/scan-engine-worker]
tier: irreversible
verdict: BLOCK
qa_verdict: BLOCK
---

# QA-Lead Synthesis — Scan Engine PR (IRREVERSIBLE)

Branches: feat/scan-engine-db (W1, 80d0f47) + feat/scan-engine-worker (W2, ef37dbd)
Diff stat: 17 files, 1937 insertions, 4 deletions

## Verdict: BLOCK

One new P1 found during independent verification. Must-fix before PASS.

## New P1 Found

file: apps/web/src/app/api/scan/free/route.ts:199-205
`paused_by: 'system'` is inserted into `system_kill_switch.paused_by` which is
`uuid REFERENCES auth.users(id)`. The upsert will throw a PostgreSQL type-cast
error at runtime when the daily budget cap is first breached.
The error is caught (fail-open behaviour preserved), but the kill-switch
AUTO-ACTIVATION silently fails — the system will NOT latch permanently after
daily cap is first breached. The per-request daily/hourly COUNT checks still
fire on every subsequent request (they re-count free_scans every time), so
continuous overspend IS capped, but the kill-switch latch — the "flip once,
block forever until manually reset" safety net — is broken.
Fix: omit paused_by from the upsert payload (column is nullable; NULL is valid).

## Confirmed Fixes (Original Critical + 5 P1s)

- Critical (budget guard): PRESENT. route.ts:339 checkBudget() called before insert.
- P1-1 (researchBusiness try/catch): PRESENT. perplexity-research.ts:49-57.
- P1-2/3 (gemini-2.0-flash model): PRESENT. engine-query.ts:22, analysis.ts:13.
- P1-4 (sanitizeForPrompt + XML delimiters): PRESENT. prompts.ts:15-27 + all buildXxxPrompt calls.
- P1-5 (mark-running inside try): PRESENT. scan-free.ts:156 inside main try block.

## Build Verification (run IN worktree)

- tsc --noEmit exit: 0
- vitest run "scan" exit: 0 (2 files, 13 tests passed)

## Migration Safety

- free_scans RLS: Pattern C (service-only, deny-all anon/authenticated). Correct.
- Rollback file: present (apps/web/supabase/migrations/20260605120000_free_scans.rollback.sql)
- system_kill_switch: pre-existing table in 20260520100009_automation.sql; no schema changes in this PR.

## Codex Status

codex_unavailable (binary not found). Proceeding Claude-only per graceful-degradation protocol.
