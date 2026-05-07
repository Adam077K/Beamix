---
date: 2026-05-06
lead: ceo
workstream: WS1B
task_slug: l0-l5-stack-design
status: PROPOSED — awaiting Adam-review
---

# Session — CEO — WS1B L0-L5 Memory Stack Design

## Goal
Design the L0-L5 memory stack with concrete tool per layer and write/read/eviction contracts. Smoke-test Mem0 cloud integration end-to-end on Beamix Claude Code. Spec Phase 2 OSS migration (do NOT execute). Halt at Adam-review. Per `HANDOFF-WS1B-L0-L5-stack-design.md`.

## Workers spawned
- 1 Sonnet researcher (foreground, ~15 min, ~$1) — verified Mem0 install command, status of GitHub issue #3400, Hobby tier auth model. Findings inlined into `MEMORY-ARCHITECTURE.md`.

## Outputs
- `docs/08-agents_work/MEMORY-ARCHITECTURE.md` — the full WS1B deliverable
- `.claude/memory/DECISIONS.md` entry — one-line pointer (per Adam's "stay lean" instruction)
- This session file

## Key results
- L2 = Mem0 cloud (Phase 1) → Mem0 OSS on Railway+Supabase (Phase 2, WS1F)
- L3/L4/L5 = pgvector tables in `memory.*` schema on existing Supabase, single embedding model `text-embedding-3-small` (~$0.10/mo total)
- Pre-flight read budget = L0 + L2 last-10 only (~5K tokens). L3/L4/L5 are MCP-callable on demand, replacing the 42K-token MANIFEST.json scan
- Issue #3400 = CLOSED (fixed PR #3523, 2025-09-30) → Phase 1 cloud is unblocked
- Partial smoke test from CEO's Mac: endpoint live (HTTP 307 unauth, HTTP 401 with bad token, RTT 0.39–0.49s, well under Mem0's published 1.44s p95). Full write→read pending Adam's 5-min signup at app.mem0.ai

## Costs
- 1 Sonnet researcher: ~$1.00 (25K tokens, 7 tool calls, 100s)
- CEO local research + WebFetch + curl smoke + drafting: ~$2.50 estimated
- **Total this session: ~$3.50** (well under $30 cap)

## Outstanding for Adam (5 questions in MEMORY-ARCHITECTURE.md)
1. Confirm willingness to run the 5-min Mem0 signup runbook (or skip cloud and go straight to Phase 2)
2. Confirm `memory.*` schema in existing Beamix Supabase project (vs separate project)
3. Confirm L5 scope = `apps/web/src/**` + `apps/web/supabase/migrations/**`
4. Confirm `text-embedding-3-small` (vs upfront lock to `-3-large` for $0.55/mo more)
5. Confirm Railway $5/mo as Phase 2 hosting target

## Anti-scope (what WS1B did NOT do)
- Did NOT touch `.claude/agents/` (WS6's territory)
- Did NOT execute the Phase 2 OSS migration (WS1F)
- Did NOT touch CLAUDE.md or MEMORY.md (WS1F)
- Did NOT start WS1C/WS1D
- Did NOT relitigate L2 = Mem0 (WS1A locked it)
- Did NOT expand DECISIONS.md beyond a one-line pointer (per Adam's instruction)

## Next workstream
- If Adam approves: WS1C (RAG corpora & ingestion — chunking strategy, Inngest jobs, MCP server build) and WS1D (memory write contracts schema) can run in parallel
- If Adam rejects: iterate up to 3 cycles per the master plan methodology
