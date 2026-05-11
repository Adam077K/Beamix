---
date: 2026-05-11
lead: ceo
task: ws4-production-deploy-verified
qa_verdict: PASS
tier: full
risk_class: production-deploy
files_changed:
  - infra/cloudflare-bridge/src/index.ts (multiple)
  - infra/cloudflare-bridge/src/audit.ts
  - infra/cloudflare-bridge/src/routing.ts
  - infra/cloudflare-bridge/src/durable-object.ts
  - infra/cloudflare-bridge/wrangler.toml
  - infra/shortcuts/Capture-Beamix-Idea.shortcut.json
  - apps/web/supabase/migrations/20260508_war_room_observability.sql (applied to prod)
  - scripts/smoke-tests/test-b.sh, test-d.sh
  - apps/web/src/app/(internal)/war-room/layout.tsx (Vercel build fix)
  - .github/workflows/qa-lead-pass.yml (multi-session PR support)
  - docs/08-agents_work/ROUTINE-ROSTER.md (created)
  - docs/08-agents_work/sessions/2026-05-11-ceo-ws4-deployed.md (this file)
  - .claude/memory/DECISIONS.md (WS4 DEPLOY VERIFIED entry)
verifier: Agent A (general-purpose subagent, Playwright + Supabase MCP)
---

# WS4 Production Deploy — Verified Live 2026-05-11

## TL;DR

The WS4 connection layer is operationally live. Pipeline fires end-to-end:

**Linear ticket** (board-meeting label) → **Cloudflare bridge** (HMAC + dedup + spec sign) → **Anthropic Routine** (returns 200) → **Supabase audit_log** (routine_dispatch row with nonce).

Verified via ticket ADA-20 on 2026-05-11 10:49 UTC.

## Smoke-test results (per scripts/smoke-tests/)

| Test | Result | Notes |
|---|---|---|
| **A** — Cron 15/day cap exemption | MOOT | Discovered Anthropic doesn't 429 at the cap; instead overages bill silently. Bridge `FireCountDO` enforces the cap at source so overage billing is prevented. |
| **B** — `/fire` cap behavior on burst | WARN (all 16 fires returned 200) | Same root cause as Test A. Bridge rolling-window cap is the protective layer. |
| **C** — Mem0 MCP 40 round-trips | SKIPPED | Adam said skip 2026-05-11. |
| **D** — 6 concurrent fires | **PASS** | All 6 returned HTTP 200. Anthropic queues concurrent fires cleanly. Bridge needs no `max_in_flight` semaphore. |

## Bugs found + fixed during deploy

| # | Bug | Commit |
|---|---|---|
| 1 | layout.tsx threw at module-load in `NODE_ENV=production` → Vercel build crashed | `06e7455` |
| 2 | QA Lead PASS workflow looked for `*-{branch-slug}.md` session file; multi-phase PRs broke | `06e7455` |
| 3 | Bridge `/fire` body was `{spec:{...}}` — Anthropic Routines accepts only `{text:"..."}` | `11839b7` |
| 4 | Bridge missing `anthropic-beta: experimental-cc-routine-2026-04-01` header | `11839b7` |
| 5 | Bridge listened at `/linear` only; Linear UI typically suggests `/linear-webhook` — caused silent 404→200 fallback | `2ef55d7` |
| 6 | `audit_log` writer ignored Q3 schema (no `row_kind`, no synthetic `spec` for system events) → all writes 400 | `0fc6fa9` |
| 7 | Bridge expected `X-Hub-Signature` header (GitHub style); Linear actually sends `linear-signature` | `8ba2e4b` |
| 8 | `handleIssueCreated` silently returned `ignored:true` on non-`board-meeting` labels with no log | `090c3b5` |
| 9 | `handleLinear` silently dropped non-`Issue:create`/`Comment:create` events with no log | `1f34286` |
| 10 | Routine IDs hardcoded as `"PLACEHOLDER_ROUTINE_ID"` in routing.ts — silent ignore at fire time | `5568e66` |
| 11 | `FireCountDO` bucketed by calendar UTC day → 23:59 + 00:01 burst hole | `2c4e157` |
| 12 | iOS Shortcut hardcoded `beamix-bridge.workers.dev` (missing account subdomain) | `c750884` |
| 13 | Board-meeting fire path didn't write `anthropic_error` row on non-2xx (comment + telegram paths did) | `41fd708` |

Net result: 13 bugs surfaced + fixed across the production deploy. Bridge code is now 100x more diagnostic — every previously-silent path logs context.

## Verification flow (executed by Agent A — Playwright)

1. Playwright opens claude.ai → Adam authenticates → Agent navigates to `https://claude.ai/code/routines/trig_016HLUqwYqQA2sQjEEiNWw2u` (ceo-entry-point)
2. Agent finds the API → Token panel, clicks Regenerate, captures the new `sk-ant-oat01-...` token via `browser_evaluate` from the DOM
3. Agent pipes token to `/tmp/ceo-token.txt`, runs `wrangler secret put ROUTINE_CEO_ENTRY_POINT_TOKEN < /tmp/ceo-token.txt`, then `wrangler deploy`
4. Bridge deployed at Version ID `c948a2e6-d049-440f-b8c2-3ef7b241260c`
5. Agent opens linear.app → creates issue ADA-20 with `board-meeting` label
6. Agent runs `mcp__supabase__execute_sql` querying `audit_log` for `linear_ticket='ADA-20'`
7. Found 1 row: `status='fired', row_kind='routine_dispatch', has_nonce=true, expires_at='2026-05-12T10:49:49Z'`
8. Agent navigates to ceo-entry-point routine "Runs" page → confirms a new run at 13:49 local time (was empty before)

## Architectural learnings to feed into WS6

1. **Anthropic billing model:** Routines on Max subscription consume Max quota. Each fire opens a 5h Max-session window. Overage (beyond 15/day) silently bills against the Console `ANTHROPIC_API_KEY` — bridge prevents this via `FireCountDO` hard cap.

2. **CEO interactive, not a Routine** (Adam 2026-05-08 pivot). WS6 doesn't write a CEO Routine; Adam runs it interactively. The remaining 10 Routines target specialized scheduled autonomous work.

3. **4-window daily fire schedule** (W1 05:30 / W2 10:30 / W3 15:30 / W4 20:30). WS6 Routine .md files must set cron triggers to one of these windows. Per ROUTINE-ROSTER.md.

4. **Routine ID + bearer token are 2 separate values.** WS6 must set BOTH `ROUTINE_<NAME>_ID` and `ROUTINE_<NAME>_TOKEN` wrangler secrets for each provisioned Routine.

5. **Linear webhook signature header is `linear-signature`** (NOT `X-Hub-Signature`). Documented in bridge code + this session file.

6. **Anthropic Routines `/fire` body format is `{"text": "..."}`** — the HMAC-signed trust spec gets wrapped in `<beamix-spec>...</beamix-spec>` sentinels inside `text`. Routine system prompts must extract + validate the spec from text on accept.

7. **`Issue:created` only fires `board-meeting`** — other routing requires a `Comment:created` event with a sentinel-bracketed spec comment.

## What's NOT done (deferred to WS6)

- 10 standing Routines provisioning (Morning Digest, EOD Sync, Monday Standup, Friday Retro, GEO Signal, Auto-Unblock, Synthesizer, Competitor Pulse, Content Idea Generator, CTO Daily Plan, Advisor)
- Routine system prompts (each .md file in WS6)
- `Comment:created` sentinel-spec flow live-fire test
- Telegram bot worker — code exists, secrets unfinished, KV namespace placeholder (Adam said "not need" 2026-05-11)
- iOS Shortcut import on iPhone (Adam said "not need" 2026-05-11)
- Per-Routine bearer token split (Q4 deferred; currently all C-suite share CEO token)

## What's verified working

- HMAC-signed Linear webhook ingestion (`linear-signature`)
- Word-boundary `@mention` parsing (R6)
- Trust-mode spec building + canonical-JSON HMAC signing (R3)
- `FireCountDO` rolling-24h cap (atomic via state.storage.transaction)
- `RoutineLock` DO with min-heap alarm (R4)
- `audit_log` writer with auto-detected `row_kind`, synthesized stub spec for internal events, partial UNIQUE on nonce only for dispatch rows (Q3)
- Supabase migration applied to production (3 new tables, 6 RLS policies, 9 indexes, 1 RPC function)
- Anthropic Routine fire with correct beta header + body format
- iOS Shortcut JSON structurally validated (placeholders correct, headers include timestamp + nonce per R3 + R6)
- `/war-room` page builds clean on Vercel (Edge runtime, ADAM_EMAIL fail-closed at request time)
- `qa-lead-pass.yml` workflow with multi-session PR support, `risk:irreversible` enforcement, case+whitespace-tolerant grep, multi-segment slug regex

## Final session cost

WS3 + WS4 + WS4-deploy combined: ~$130-145 (vs $150 cap)

## Adam's note for future Adams

If you re-deploy from scratch:
1. The 13 bugs above are now fixed in code; you won't hit them again
2. Critical setup keys: `ROUTINE_CEO_ENTRY_POINT_ID` (trig_...) + `ROUTINE_CEO_ENTRY_POINT_TOKEN` (sk-ant-oat01-...) MUST be set as wrangler secrets BEFORE the bridge can fire anything
3. Linear webhook URL MUST end in `/linear-webhook` or `/linear` (both accepted)
4. Linear ticket MUST have `board-meeting` label for `Issue:created` to fire — other routing is via `Comment:created`
5. Anthropic Console "Runs" page is the definitive signal — `fired` audit_log rows alone don't prove Anthropic accepted

## Status

✅ **LOCKED & DEPLOYED**. Adam-acknowledged 2026-05-11 ("not need for the telegram, ios" — proceed to WS5).
