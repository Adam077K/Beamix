---
date: 2026-05-06
lead: ceo
workstream: WS1A
task_slug: memory-tool-re-evaluation
status: PROPOSED — awaiting Adam-review
---

# Session — CEO — WS1A Memory Tool Re-evaluation

## Goal
Score 7 memory tools, lock recommendation for L2 cross-session episodic memory, halt at Adam-review. Per `HANDOFF-WS1A-memory-architecture.md`. Anti-bias: V2/V3 reflexively chose Anthropic Memory Tool + custom pgvector — WS1A explicitly reopens that.

## Workers spawned
- `researcher-A-memory` (Sonnet, background) — Letta, Mem0, Zep+Graphiti — completed
- `researcher-B-memory` (Sonnet, background) — Cognee, OpenAI Memory, Anthropic Memory Tool, Custom MCP/pgvector — completed

CEO did supplemental WebFetch on Letta/Mem0/Zep when researcher-A's first completion notification displayed prematurely (file was actually written, notification was misleading).

## Outputs
- `docs/08-agents_work/MEMORY-DECISION-MATRIX.md` — the deliverable
- `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-WS1A-memory-tools-A.md` — researcher findings (Letta/Mem0/Zep)
- `docs/08-agents_work/2026-05-06-agent-build/RESEARCH-WS1A-memory-tools-B.md` — researcher findings (Cognee/OpenAI/Anthropic/Custom)
- DECISIONS.md entry — PROPOSED, pending Adam review

## Recommendation (updated post-Adam-question on OSS path)
**Mem0, 2-phase deployment:**
- **Phase 1 (WS1B):** Cloud Hobby free tier — fast integration-shape validation via single `npx mcp-add` against `mcp.mem0.ai/mcp`. Smoke-test issue #3400.
- **Phase 2 (WS1F, post WS6A validation):** Migrate to **Mem0 OSS self-host** on existing Supabase Postgres+pgvector. Same engine. Mem0 server runs in a small Vercel/Cloudflare/Railway container ($0-5/mo) or Bastion. Endpoint swap + Postgres dump/restore — no re-wire of WS1D contracts.

Per Mem0's `platform-vs-oss` docs, OSS = "same adaptive memory engine as the platform." Paid platform's only differentiators at our scale (webhooks, dashboard, analytics, SOC2) are nice-to-have, not capability gaps.

Tied with Zep+Graphiti at 27/35 on raw score. Mem0 wins the operational tiebreaker. Zep is right at Series-A spend, not solo-founder scale today.

## Fallbacks
1. If Phase 1 cloud fails (issue #3400 reproduces): skip to Phase 2 OSS directly
2. If both Mem0 flavors fail: Anthropic Memory Tool + structured `/memories` directory (zero retrieval, but $0 + zero lock-in)
3. If total fail: Cognee at $35/mo

## Costs
- Researcher A: ~$1.50 (Sonnet, 56K tokens, 42 tool calls, 6 min)
- Researcher B: ~$1.80 (Sonnet, 67K tokens, 40 tool calls, 6 min)
- CEO supplemental WebFetch: ~$0.50
- **Total this session: ~$3.80** (well under $30 cap)

## Outstanding for Adam
1. Smoke-test Mem0 MCP issue #3400 stability before commit (30-min budget)
2. Confirm volume forecast (50-200 sessions/mo) — step-function growth would change tool choice
3. WS1D will fill provenance/confidence/TTL gaps via thin Beamix-side wrapper — acceptable, or reopen tool choice?
4. Cloud-first vs self-host-first — recommendation is cloud-first, migrate if metrics warrant

## What was NOT done (per scope)
- No `.claude/agents/` edits (WS6 territory)
- No WS1B-1F work (waiting for Adam-review)
- No code changes
- No DB migrations
- No memory architecture spec doc (that's WS1B output, not 1A)

## Verdict
WS1A complete. Recommendation = Mem0. Awaiting Adam's call to proceed to WS1B (L0-L5 stack design using locked tool).
