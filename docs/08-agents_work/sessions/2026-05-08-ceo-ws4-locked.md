---
date: 2026-05-08
lead: ceo
task: ws4-connection-layer-locked
qa_verdict: PASS
tier: full
risk_class: cross-system-foundation
files_changed:
  - infra/cloudflare-bridge/**
  - infra/telegram-bot/**
  - infra/shortcuts/**
  - apps/web/supabase/migrations/20260508_war_room_observability.sql
  - apps/web/src/inngest/functions/**
  - apps/web/src/inngest/events.ts
  - apps/web/src/lib/embeddings/embed-corpus.ts
  - apps/web/src/lib/orchestration/{spec.ts,board.ts}
  - apps/web/src/app/(internal)/war-room/**
  - .github/workflows/qa-lead-pass.yml
  - .github/pull_request_template.md
  - docs/08-agents_work/{CONNECTIONS.md,SMOKE-TESTS-WS4.md,WS4-CRITIQUE-*.md}
  - .claude/memory/DECISIONS.md (+WS4 LOCKED entry)
---

# WS4 Connection Layer — LOCKED

## Summary

WS4 LOCKED on 2026-05-08. 12 revision clusters (R1-R12) applied to bridge, Inngest, Supabase, war-room, and GitHub workflow code. 5 Adam decisions (Q1-Q5) resolved. Cross-file contracts verified (telegram_chat_id in spec.ts ↔ buildTelegramSpec; row_kind discriminator in migration ↔ audit_log writers; canonical-JSON serializer in bridge ↔ trust spec consumers).

`pnpm -F @beamix/web typecheck` clean.

## Adam decisions (locked)

| Q | Decision | Reasoning |
|---|---|---|
| Q1 | ADD `telegram_send_failed` to enum (15 values total) | Runbook contract honored; Adam's note "you can add it" |
| Q2 | `ON DELETE SET NULL` on parent_audit_log_id | Adam asked CEO opinion → SET NULL: children survive 90-day retention; lineage recoverable from `nonce`/`fan_in_key`. RESTRICT permanently breaks retention; CASCADE loses recent children. |
| Q3 | row_kind discriminator + partial UNIQUE on nonce | Adam said "DO what you think is right - with good resons" → row_kind preserves clean semantics (dispatch ≠ internal events), enables analytics, doesn't double-purpose nonce. +1 column is trivial cost. |
| Q4 | Per-Routine token split deferred to WS6 | Adam: "split later... when we set up all the agents." Acceptable revoke-blast-radius during build phase. WS6 task documented in code comments. |
| Q5 | ALLOW Auto-Unblock 3-cascade Telegram-ping | Adam: "allow." Tagged `Q5 EXCEPTION: Adam-approved incident escalation, NOT a cost alert.` MAX_UNBLOCK_CASCADE_DEPTH = 3. |

## Critique pass

4 parallel adversarial critics, 55 unique findings:

| Critic | Findings | Severity |
|---|---|---|
| Bridge | 15 | 6H / 6M / 3L |
| Inngest | 16 | 1 CRITICAL / 7H / 6M / 2L |
| Supabase | 11 | 2H / 6M / 3L |
| War-room | 13 | 5H / 6M / 2L |
| **Total** | **55** | **1 CRITICAL / 19 HIGH / 25 MEDIUM / 10 LOW** |

Security critic agent failed (truncation mid-flow). Coverage absorbed by bridge-critic (5 H-sev security findings: HMAC scope, replay, dedup, token blast radius) and Inngest-critic (idempotency, replay-prevention enforcement). Decision: did not re-dispatch. Documented in WS4-CRITIQUE-AND-REVISIONS.md header.

## Headline finding (CRITICAL)

**R1 — Fan-in barrier queries the wrong column.** The original `fan-in-watcher` checked `audit_log.status IN ('fired','accepted')` to count pending siblings — but `accepted` is dispatch-time state, never transitions to `complete` for sibling sub-tickets. Every fan-out flow would have hung forever. CEO synth never fires. Parent ticket never closes.

**Fix:** Replaced audit-log query with direct Linear GraphQL `searchIssues` call against `LINEAR_API_KEY`. Walks parent→children, counts `state.type !== "completed"`. 30s early-exit on Linear API failure → writes `linear_api_error` audit row, parent-ticket-expiry-watcher retries.

## Honorable-mention findings

- **R2** — `handleIssueCreated` skipped both KV nonce + DO lock; `FireCountDO` (atomic Durable Object counter) replaces non-atomic KV `get/put`; `step.sendEvent` replaces `inngest.send` inside `step.run`.
- **R3** — `JSON.stringify(spec, sortedTopLevelKeys)` was a *replacer*, not a recursive sort. HMAC verification was flaky on nested objects. Replaced with hand-rolled canonical-JSON serializer.
- **R7** — pgvector RAG embed pipeline was DEAD-ON-ARRIVAL. `events.ts` defined `changed_files`; all 5 embed functions read `changed_paths`. Every push silently no-op'd. The pgvector index would have been empty in production until someone asked "where are the embeddings?". Fixed via single typo correction + 4 reliability fixes (per-file try/catch, OpenAI batching, exclude generated files).
- **R9 F4** — `useState(() => loadTrace(...))` misuse in TraceTree (initializer must be synchronous + return state value). Replaced with `useEffect`.
- **R10 F12** — qa-lead-pass.yml missing `issues: read` permission; bypass-comment lookup was silently broken via 403.

## Smoke tests deferred

Per WS3 plan: A+B (24h cron exemption + Retry-After granularity) run as background once Anthropic Routines provisioned by Adam. C+D (Mem0 MCP load + concurrent fire) run synchronously before first production fire. Runbook scaffold at `docs/08-agents_work/SMOKE-TESTS-WS4.md`.

## Adam-action checklist

1. Cloudflare Workers Paid plan upgrade ($5/mo).
2. `wrangler kv:namespace create BRIDGE_STATE_KV` + fill placeholders in `infra/cloudflare-bridge/wrangler.toml`.
3. `wrangler deploy` from `infra/cloudflare-bridge` — creates `RoutineLock` (v1) + `FireCountDO` (v2) Durable Objects.
4. 10 Anthropic Routines in Anthropic Console (shared CEO bearer for now per Q4).
5. Helicone proxy for product API (not Routines).
6. Linear webhook secret + bot user accounts.
7. Telegram bot via BotFather; share `BRIDGE_HMAC_SECRET` between bridge + bot.
8. Apply migration on staging first (`mcp__supabase__apply_migration`), then production.
9. Run smoke A/B (24h) and C/D (synchronous) once provisioning complete.

## Cost

WS4 phase: ~$45-55 (build $20-25, critics $20, synthesis $5, applied revisions $20-25). Cumulative session: ~$95-110, within raised $150 cap.

## What's unblocked

- **WS5** — synthesis master doc. WS2/WS3/WS4 are now stable inputs.
- **WS6** — 60+ agent .md files. Trust spec contract is stable. First WS6 task: per-Routine bearer token split (Q4 follow-up).
- **Production deploy** — pending Adam-action checklist completion + smoke test results.

## Verification

- `pnpm -F @beamix/web typecheck` — clean (zero errors).
- Cross-file contract verified: `telegram_chat_id` in `IssuedBy` Zod schema (spec.ts) matches bridge `buildTelegramSpec` consumer.
- Migration is idempotent: `IF NOT EXISTS` on all CREATE statements; `CREATE OR REPLACE FUNCTION`; `DROP POLICY IF EXISTS ... ; CREATE POLICY ...`.
- All `inngest.send(...)` inside `step.run` replaced (verified via grep — only references in comments).
- `MAX_TRACE_DEPTH = 8` constant + visited-set in `lib/queries.ts`.
- `MAX_UNBLOCK_CASCADE_DEPTH = 3` + Telegram escalation in `routine-timeout-watcher.ts`.
- `FireCountDO` class exported in `index.ts` AND bound in `wrangler.toml` (binding name `FIRE_COUNT_DO`, v2 migration entry).
