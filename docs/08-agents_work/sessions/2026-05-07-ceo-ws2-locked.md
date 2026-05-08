---
session: 2026-05-07-ceo-ws2-locked
lead: ceo
workstream: WS2 (Orchestration Architecture)
status: LOCKED — Adam approved 2026-05-07
deliverables:
  - docs/08-agents_work/ORCHESTRATION.md (v2 locked)
  - .claude/commands/board-meeting.md (created)
  - .claude/memory/DECISIONS.md (PROPOSED → LOCKED entry appended)
  - /Users/adamks/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/feedback_model_routing_rule.md (Q3 rule saved)
  - /Users/adamks/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/MEMORY.md (index updated)
cost_estimate_usd: ~$10 design + ~$15 critique + ~$5 synthesis = ~$30 total WS2 cap
budget_cap_usd: $30 (at the limit)
---

# Session — WS2 Orchestration Architecture LOCKED

## What this session produced
- `docs/08-agents_work/ORCHESTRATION.md` — v2 locked design integrating all critique-driven revisions
- `.claude/commands/board-meeting.md` — slash command (was missing per Cluster 9 of critique)
- DECISIONS.md WS2 entry: PROPOSED → LOCKED with revised reversibility table
- Memory: model routing rule saved (Q3)

## Adam's 7 decisions (locked 2026-05-07)
1. Q1 — war-room incremental cost = $0-5/mo. Cost not a limitation.
2. Q2 — Cloudflare Workers Paid $5/mo APPROVED for race-fix
3. Q3 — model rule: Haiku simple, Sonnet default, Opus complex
4. Q4 — Customer Voice persona ADDED to board meetings
5. Q5 — smoke tests DEFERRED to WS4
6. Q6 — audit_log retention = 90d hot + 1y cold
7. Q7 — Aria for vendor decisions only; new broad-Adversary for strategic

## Adam's 3 hard rules (applied throughout)
- Bastion = Windows PC, NOT Mac
- Don't cut agent count for RAM reasons
- No timelines/weeks/sprints in plans

## Critique findings → revisions integrated (10 clusters)
- Cluster 1 (verified-not-real): smoke tests deferred to WS4 with explicit list + acceptance criteria
- Cluster 2 (concurrency races): two-layer dedup (KV + Durable Object), fire-and-forget rule, fan-in session_id binding, sequential-worker state passing
- Cluster 3 (security): 8 H findings fixed — bridge HMAC + Linear user_id allowlist, sentinel-only spec parsing, skip_pre_flight removed, nonce + expires_at, out_of_scope ≥1, 3-party audit log writers, mandatory cost enforcement, structural QA-Lead enforcement
- Cluster 4 (cost model): corrected — Routines on Max subscription, not API. Net new spend $5/mo
- Cluster 5 (observability): split into production (/war-room always-on) + dev (disler on Bastion Windows). Helicone for product API only. Cost-watchdog + runaway-watcher Inngest functions added
- Cluster 6 (multi-agent reasoning): Round 0 de-anchored framings, Customer Voice 6th persona, Synthesizer mandatory source_persona_round traceability, Adam-veto checkpoint, Aria/broad-Adversary branching
- Cluster 7 (tier classification): Haiku classifier at bridge ($0.001/ticket) per Q3 rule
- Cluster 8 (recovery): parent-ticket-expiry-watcher (24h backstop for Inngest outage), Cloudflare outage = Morning Digest opens manual-re-fire ticket
- Cluster 9 (deliverables): board-meeting slash command CREATED (was missing); 4 smoke tests in WS4 acceptance criteria
- Cluster 10 (reversibility): honest table replaces v1's overstated claims

## Net architecture changes from v1
- 9 standing Routines → 10 (Synthesizer Routine made explicit, was undocumented)
- 5 board personas → 6 (Customer Voice added)
- 1 Adversary → 2 (Aria for vendor; broad-Adversary for strategic)
- 3-round board meeting → 4 rounds (Round 0 added)
- Single-layer KV dedup → two-layer (KV + Durable Object)
- "Disler captures everything" → split production/dev observability
- "$5-15/mo Routines" → "$0/mo (Max-absorbed) + $5/mo Cloudflare"
- Smoke tests in §Verification → DEFERRED to WS4 with explicit acceptance criteria

## What's blocked
Nothing. WS2 is locked. WS3 (BOM, runs parallel) and WS4 (connection layer) are unblocked.

## What's next
- WS3 + WS4 can start in parallel.
- WS3 §3C observability is now redundant (decided in WS2 §2G) — WS3 skips it.
- WS4 must run the 4 smoke tests before committing implementation.
- WS5 (synthesis) blocked on WS3 + WS4.
- WS6 (agents) blocked on WS5.

## Tasks closed
1-8: WS2 sub-phases (ORCHESTRATION.md v1) ✓
9: 6-critic critique pass ✓
10: Critique synthesis (WS2-CRITIQUE-AND-REVISIONS.md) ✓
11: Apply revisions + lock WS2 ✓ (this session)

## Files modified
- docs/08-agents_work/ORCHESTRATION.md (rewrite as v2)
- .claude/memory/DECISIONS.md (LOCKED entry above SUPERSEDED PROPOSED)
- /Users/adamks/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/MEMORY.md (model routing rule indexed)

## Files created
- .claude/commands/board-meeting.md
- /Users/adamks/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/feedback_model_routing_rule.md
- docs/08-agents_work/sessions/2026-05-07-ceo-ws2-locked.md (this file)

## Cost
WS2 total ~$30 (design + critique + synthesis + lock). At the cap.

## Recommendation for next session
Adam can pick from:
- **WS3 (tech stack BOM)** — pin every component to a home with cost + role + failure mode + DR + scaling cliffs. Independent of WS4.
- **WS4 (connection layer)** — build the Cloudflare bridge code, GitHub Actions, Linear webhooks, iOS shortcut, Telegram bot. Includes the 4 deferred smoke tests as gating criteria.
- **Both in parallel** — WS3 doesn't block WS4 and vice versa.

Recommended: **start both in parallel.** WS3 is largely documentation + decisions (cheap, fast). WS4 is implementation work (slower, but the smoke tests inside it validate WS2 in real Anthropic infra).
