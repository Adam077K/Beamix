---
role: backend-engineer
task: scan-engine-worker
date: 2026-06-05
branch: feat/scan-engine-worker
worktree: .worktrees/scan-engine-worker
base_commit: 80d0f47
tier: irreversible
qa_verdict: PASS
qa_lead_verdict_commit: b8b08be
qa_lead_note: "PASS — code-review 5 P1 fixed, security Critical (budget guard) fixed, QA-Lead paused_by P1 fixed. Codex unavailable (graceful degradation). CEO-verified in-worktree tsc 0 / 13 tests."
---

## Summary

Implemented the GEO free-scan pipeline: 6 library modules under `src/lib/scan/`,
one Inngest function `scan-free` consuming `scan/free.requested`, registration in
the Inngest serve route, and 13 tests (6 integration + 7 unit). QA review pass
applied 10 fixes (1a-1d, 2-9, 10).

## Files produced / modified

- `src/lib/scan/types.ts` — FreeScanResults, BusinessContext, EngineRawResult, AnalysisResult, ScanInput
- `src/lib/scan/prompts.ts` — prompt builders + parsers; XML delimiters + sanitizeForPrompt + total_issues ground truth
- `src/lib/scan/openrouter-client.ts` — OPENROUTER_SCAN_KEY fallback, NonRetriableError on missing key, debug-gated body logging
- `src/lib/scan/perplexity-research.ts` — Stage 1 research; callOpenRouter wrapped in try/catch, fallback context honors "never throws"
- `src/lib/scan/engine-query.ts` — Stage 2 engine queries; gemini → google/gemini-2.0-flash
- `src/lib/scan/analysis.ts` — Stage 3; google/gemini-2.0-flash; total_issues always computed from ground truth
- `src/inngest/functions/scan-free.ts` — check-budget step, mark-running inside try, single engine-queries step, secret-scrub on error_message, NonRetriableError for kill-switch block
- `src/app/api/scan/free/route.ts` — budget guard (kill-switch + daily/hourly cap), auto-flip kill switch on daily breach, email plus-stripping
- `src/app/api/inngest/route.ts` — scanFree registered
- `apps/web/.env.example` — created with SCAN_FREE_DAILY_BUDGET=500, SCAN_FREE_HOURLY_BUDGET=60

## QA-review fixes applied

| # | Fix | File(s) |
|---|-----|---------|
| 1a | Kill-switch + daily/hourly budget guard in route | route.ts |
| 1b | check-budget Inngest step before pipeline stages | scan-free.ts |
| 1c | Email plus-stripping (user+alias@domain → user@domain) | route.ts |
| 1d | .env.example with budget env vars | .env.example |
| 2 | Approved models: google/gemini-2.0-flash | engine-query.ts, analysis.ts |
| 3 | Prompt injection: XML delimiters + sanitizeForPrompt | prompts.ts |
| 4 | mark-running moved inside try/catch so mark-failed covers it | scan-free.ts |
| 5 | researchBusiness wraps callOpenRouter in try/catch | perplexity-research.ts |
| 6 | Secret scrubber on error_message + status_class logging | scan-free.ts, openrouter-client.ts |
| 7 | total_issues computed from issues.reduce — LLM value discarded | prompts.ts, analysis.ts |
| 8 | NonRetriableError for config errors + budget block | openrouter-client.ts, scan-free.ts |
| 9 | Single engine-queries step (Promise.all inside one step.run) | scan-free.ts |
| 10 | OPENROUTER_SCAN_KEY fallback to OPENROUTER_API_KEY | openrouter-client.ts |

## Deferred followups (separate tickets)

1. **Cost key split** — provision `OPENROUTER_SCAN_KEY` as a separate OpenRouter key from
   `OPENROUTER_API_KEY`. The fallback is in place; this is an ops/infra ticket.
2. **WHOIS DNS/ownership check** — additional domain validation layer.
3. **PII retention cron** — delete free_scans.email/ip after N days.
4. **Drop email/ip from Inngest event payload** — not needed by the worker, reduces event log exposure.
5. **XFF hardening** — validate X-Forwarded-For chain depth vs trusted proxy count.
6. **status column text→enum** — migrate free_scans.status to a proper DB enum.
7. **Over-daily-budget route test** — add a route-level integration test (manual-verify for now;
   budget guard is covered by unit tests in scan-free.test.ts test (e)).
