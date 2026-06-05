---
role: backend-engineer
task: scan-engine-worker
date: 2026-06-05
branch: feat/scan-engine-worker
worktree: .worktrees/scan-engine-worker
base_commit: 80d0f47
tier: irreversible
qa_verdict: PENDING
---

## Summary

Implemented the GEO free-scan pipeline: 6 library modules under `src/lib/scan/`,
one Inngest function `scan-free` consuming `scan/free.requested`, registration in
the Inngest serve route, and 10 tests (4 integration + 6 unit).

## Files produced

- `src/lib/scan/types.ts` — FreeScanResults, BusinessContext, EngineRawResult, AnalysisResult, ScanInput
- `src/lib/scan/prompts.ts` — pure prompt builders + parsers for all 3 stages
- `src/lib/scan/openrouter-client.ts` — thin native-fetch wrapper (no new deps)
- `src/lib/scan/perplexity-research.ts` — Stage 1 research
- `src/lib/scan/engine-query.ts` — Stage 2 engine queries (chatgpt/gemini/perplexity)
- `src/lib/scan/analysis.ts` — Stage 3 Gemini Flash analysis → FreeScanResults
- `src/inngest/functions/scan-free.ts` — Inngest function (retries:2, concurrency keyed on scan_id)
- `src/app/api/inngest/route.ts` — scanFree registered

## Decisions

1. Used `OPENROUTER_API_KEY` (not `OPENROUTER_SCAN_KEY`) — codebase only has one key.
   Cost-isolation gap flagged as followup.
2. Analysis model: `google/gemini-flash-1.5` per SKILL.md.
3. Research + engine models per SKILL.md (perplexity-online for research + perplexity engine).
4. mark-failed is inside step.run so it is memoised on retry and cannot double-write.

## Followups

- Cost isolation: split OPENROUTER_API_KEY into OPENROUTER_SCAN_KEY / OPENROUTER_AGENT_KEY
  (CEO to file separate ticket — affects infra secrets and possibly billing dashboard).
