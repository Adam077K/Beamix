---
date: 2026-06-08
agent: backend-engineer
task: BMX-W2-COMPETITOR-CAPTURE
branch: feat/w2-competitor-parse
tier: full
qa_verdict: pending
---

Parsed the engine prompt's `recommendations[]` into a validated `competitors` field on `EngineRawResult`. Added `parseCompetitors` helper (internal) in prompts.ts with rank/name/why validation, 10-entry cap, and case-insensitive dedup by lowest rank. Added `competitors?` field to `EngineRawResult` in types.ts. 27 tests cover all edge cases; typecheck and tests exit 0.
