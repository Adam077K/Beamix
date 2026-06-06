---
role: backend-engineer
task: live-scan-streaming-backend
branch: feat/live-scan-worker
tier: irreversible
qa_verdict: PENDING
date: 2026-06-06
---

Implemented the backend half of live-fidelity free-scan streaming.

Deliverables:
- progress.ts: ScanProgress/EngineProgress seam types (maps 1:1 to scan-contract.ts EngineState)
- 20260606120000_scan_progress.sql: PII-free progress table + anon SELECT RLS + Realtime publication
- progress-writer.ts: best-effort upsert with deep-merge by engine id and regression guard
- /api/scan/free/[scan_id]/progress/route.ts: polling fallback with in-memory token-bucket (burst 4, refill 4/s)
- scan-free.ts: split single engine-queries step into engine-chatgpt/engine-gemini/engine-perplexity with writeProgress calls at each boundary
- scan-free.test.ts + progress-writer.test.ts: 15 tests, all passing (tsc=0, lint=0, vitest=0)

Adam must apply 20260606120000_scan_progress.sql via Supabase SQL Editor and confirm Realtime is enabled on scan_progress before merging.
