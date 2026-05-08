---
session: 2026-05-06-ceo-ws2-orchestration
lead: ceo
workstream: WS2 (Orchestration Architecture)
status: PROPOSED — awaiting Adam review
deliverable: docs/08-agents_work/ORCHESTRATION.md
cost_estimate_usd: ~$10 (3 Sonnet researchers + Opus synth)
budget_cap_usd: $30
---

# Session — WS2 Orchestration Architecture

## What this session produced
- `docs/08-agents_work/ORCHESTRATION.md` — full WS2 deliverable covering 2A-2G
- 3 research files in `docs/08-agents_work/2026-05-06-agent-build/`:
  - `RESEARCH-WS2B-routine-chaining.md`
  - `RESEARCH-WS2C-durable-execution.md`
  - `RESEARCH-WS2G-observability.md`

## Locked decisions (PROPOSED — pending Adam review)
1. **2A spawning matrix** — Routines = main threads; workers = leaves; CEO short-circuits to worker for Quick-tier; QA-Lead independent gate.
2. **2B Routine-chaining** — Linear sub-ticket + Cloudflare bridge re-fire (Option ii). KV dedup mandatory. Direct API `/fire` is fallback.
3. **2C Durable execution** — Inngest stays. Routines are triggers only, not durable. Inngest owns fan-out/fan-in barriers, cross-Routine waits, crash recovery.
4. **2D Async-spec-trust** — JSON payload schema with issuer authority, scope, budget, escalation, audit. Mandatory `audit_log` row per invocation.
5. **2E Standing Routines** — 9 Routines (8 cron + 1 entry-point) with locked schedules, $-caps, MCP grants, claude_progress write contract. CTO→CEO callback resolved via Inngest fan-in-watcher.
6. **2F Board-meeting** — 3 rounds (parallel-no-anchoring → cross-critique → fresh-context synthesis), 5 personas, $10/meeting cap, 4/month max.
7. **2G Observability** — disler hooks dashboard + custom `/war-room` Next.js page on Supabase audit_log. Helicone optional. Langfuse self-host disqualified (8GB minimum).

## Open questions for Adam (7)
See ORCHESTRATION.md § Open questions. Highlights:
- Routine cold-start latency (no Anthropic benchmark — 2s estimate)
- 15-runs/day cap behavior under burst
- Aria-as-Adversary confirmation
- Routine cron exemption from /fire cap (smoke-test in WS4)

## Methodology compliance
- Research dispatch: 3 Sonnet researchers (parallel, time-boxed 30 min each) ✓
- Design dispatch: 1 design pass (this synth) ✓
- Adam review: HALTED HERE ✓
- Cost cap: $30. Estimated spend ~$10. ✓

## What's NOT in this deliverable
- Per-agent .md files (WS6)
- Cloudflare Worker code (WS4)
- Inngest function implementations (WS4)
- Linear project structure (WS4)
- Disler fork or vendor decision (WS4)
- Tech stack BOM (WS3 — runs in parallel)

## Next workstream gates
- WS3 (tech stack pin) can start in parallel — no dependency on WS2 outputs
- WS4 (connection layer) blocked on WS2 approval
- WS5 (synthesis) blocked on WS2 + WS3 + WS4
- WS6 (agents) blocked on WS5

## Files created
- docs/08-agents_work/ORCHESTRATION.md (~700 lines)
- docs/08-agents_work/2026-05-06-agent-build/RESEARCH-WS2B-routine-chaining.md
- docs/08-agents_work/2026-05-06-agent-build/RESEARCH-WS2C-durable-execution.md
- docs/08-agents_work/2026-05-06-agent-build/RESEARCH-WS2G-observability.md
- docs/08-agents_work/sessions/2026-05-06-ceo-ws2-orchestration.md (this file)

## Files modified
- .claude/memory/DECISIONS.md (PROPOSED entry appended)

## Tasks closed
1. WS2A — Spawning matrix ✓
2. WS2B — Routine-chaining ✓ (Option ii)
3. WS2C — Durable execution ✓ (Inngest)
4. WS2D — Async-spec-trust ✓
5. WS2E — Standing Routines ✓
6. WS2F — Board-meeting ✓
7. WS2G — Observability ✓ (disler + custom + optional Helicone)
8. ORCHESTRATION.md synthesis ✓
