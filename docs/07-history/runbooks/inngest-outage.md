# Runbook — Inngest outage

**When:** Inngest platform unavailable. Includes full platform outage, sustained function execution failures, or silent fan-in barrier stall (CEO synth never fires despite all sub-tickets closing Done).
**Severity:** **P1.** Inngest is the durable-execution layer (ORCHESTRATION.md §2C). Routines themselves continue running on Anthropic Routines (independent of Inngest). What stops: fan-in synth re-fires, routine-timeout-watcher, runaway-watcher silent-kill action, parent-ticket-expiry-watcher, audit-log-rollup, all embed jobs.
**Owner today:** Adam.
**Last reviewed:** 2026-05-17 (Phase 7.5 re-test — structural pass, currency verified against 2026-05-16 agent rethink).

> **WAR ROOM SCOPE:** This runbook covers the war room (Adam's internal startup-OS agent army), not the Beamix customer product. Section §Cross-impact on product notes where the two overlap.

---

## Cost-alert philosophy

**Per Adam Q7 (2026-05-08):** the war room does NOT push real-time cost alerts to Telegram. System-status alerts (this runbook's category) are still pushed; cost-rate alerts are not. The runaway-watcher's silent-kill action is preserved as a SAFETY fence. An Inngest outage removes that fence — document and monitor manually for the duration.

---

## Detection

| Signal | Where | Threshold |
|---|---|---|
| Inngest Status page red/degraded | https://status.inngest.com | Any active incident |
| `audit_log` shows zero new `status: complete` rows from fan-in-watcher | Supabase `audit_log` table | 30-min window during normally-active hours (06:00–23:00 Israel TZ) |
| Routine sessions complete (Linear sub-tickets show Done) but parent CEO ticket has no synth comment | Linear board | Any Full-tier task where sub-tickets closed >30 min ago with no synth |
| Inngest dashboard shows zero function executions | Inngest dashboard | Over any 30-min window during active hours |
| `cost-watchdog` Inngest heartbeat stops writing to `claude_progress` | Supabase `claude_progress` table | `cost-watchdog` cron fires hourly; no entry after 90 min |
| `audit_log.status = rate_limited` rows on Inngest functions | Supabase | ≥3 in 5 min |

**Distinguishing Inngest outage from fan-in logic bug:**
- Outage: Inngest Status page has an active incident AND/OR ALL Inngest functions stopped (not just fan-in-watcher).
- Logic bug: only fan-in-watcher stops but other Inngest functions (cost-watchdog, embed jobs) keep running. Treat as a code bug, not this runbook.

**The `cost-watchdog` heartbeat is the primary non-Inngest-Status signal.** The watchdog writes to `claude_progress` every hour. If the heartbeat stops but Routines are still writing progress rows, Inngest is the problem. This signal is deliberately NOT a cost-rate alert — it is a platform-availability signal.

---

## Immediate (first 5 minutes)

1. **Confirm scope.** Check Inngest Status page (https://status.inngest.com) and Inngest Twitter / Discord for outage chatter. Confirm it is platform-wide, not a single function deployment bug.
2. **Telegram-ping Adam** with system-status format (NOT cost-alert):
   ```
   [P1 inngest-outage]
   Inngest platform down. Routines continue running. Fan-in synth paused.
   runaway-watcher OFFLINE — manual cost monitoring required for duration.
   Reply 'ack' to acknowledge.
   ```
3. **Open a tracking Linear ticket** in `Strategy/Signals` project titled `Inngest outage YYYY-MM-DD HH:MM` with the `incident` label. All manual fan-in actions for the duration go as comments on this ticket.
4. **Do NOT pause Routines.** Routines run on Anthropic Routines — they are independent of Inngest. Routines continue firing, executing, and writing to `audit_log` and `claude_progress` normally.
5. **Note: runaway-watcher is OFFLINE during the outage.** The kill-action that fires when a session exceeds `max_cost_usd × 1.2` is gone. Adam must manually monitor the `/war-room` page or query `claude_progress` directly. See §Mitigation.

---

## Mitigation (duration of outage)

### Fan-in synth: manual trigger

Full-tier CEO tasks that fanned out to C-suite sub-tickets will NOT auto-synthesize. For each:

1. **Identify orphaned fan-ins.** Query Supabase (via Supabase MCP or Supabase dashboard):
   ```sql
   SELECT al.linear_ticket, al.fan_in_key, al.spec, al.ts
   FROM audit_log al
   WHERE al.status = 'fired'
     AND al.fan_in_key IS NOT NULL
     AND al.ts > NOW() - INTERVAL '4 hours'
     AND NOT EXISTS (
       SELECT 1 FROM audit_log al2
       WHERE al2.fan_in_key = al.fan_in_key
         AND al2.status = 'complete'
     );
   ```
2. **For each orphaned fan-in row**, check that all sub-tickets on the parent Linear ticket are in `Done` state with valid `session_id` comments (per ORCHESTRATION.md §2B fan-in session binding).
3. **Manually fire the CEO synth** via one of two paths:
   - **Path A (preferred):** Re-comment the parent Linear ticket with the synth trigger comment (the `---BEAMIX-SPEC-V1-START---` sentinel block with `trust_mode: true, scope.intent: "ship"` and the synth-only payload). The Cloudflare bridge will process this and fire CEO via `/fire`. This is the standard bridge path.
   - **Path B (fallback if bridge is also affected):** Fire the CEO synth Routine directly via Anthropic Console → Routines → CEO Entry-point → Fire, pasting a manually constructed synth-only spec. Document the manual fire in the tracking Linear ticket.
4. **Mark the tracking ticket** with a comment for each manual synth fired: `manual-synth: <parent-ticket-id>, fired via <Path A/B>, at <HH:MM>`.

### runaway-watcher OFFLINE: manual cost monitoring

The per-session cost kill-action is gone. For the duration:

1. Query `claude_progress` via Supabase MCP every 30 minutes during active hours:
   ```sql
   SELECT routine, session_id, SUM(cost_usd) as session_cost, MAX(ts) as last_seen
   FROM claude_progress
   WHERE ts > NOW() - INTERVAL '2 hours'
   GROUP BY routine, session_id
   ORDER BY session_cost DESC;
   ```
2. If any session shows `session_cost > 2.0` (2× the normal $1/session cap), manually inspect via Anthropic Console → Routines → active sessions. If the session appears runaway, pause it manually via Anthropic Console.
3. The Anthropic Console hard cap ($1,500/mo) is the absolute backstop — it cannot be removed by an Inngest outage.

### Inngest down >2h: pause Full-tier dispatches

If the outage extends beyond 2 hours AND manual fan-in is becoming unmanageable:

1. Temporarily pause all **Full-tier** (multi-C-suite fan-out) CEO dispatches. Adam sets Cloudflare KV key `bridge:full_tier_paused = true` via Wrangler:
   ```
   wrangler kv:key put --namespace-id=<KV_NAMESPACE_ID> bridge:full_tier_paused true
   ```
   The bridge checks this key and returns a `202 Accepted` with a `retry_after: inngest_restored` comment on the Linear ticket instead of fanning out.
2. **Quick-tier and Lite-tier tasks can continue.** Quick-tier goes CEO→worker in one Routine session (no fan-in needed). Lite-tier goes CEO→single C-suite→workers (no fan-in watcher needed for single C-suite).
3. When Inngest returns, lift the pause and process any queued Full-tier tickets. They will still have their Linear sub-tickets; the bridge re-fires from those ticket states.

### Other Inngest-dependent functions

| Function | Impact during outage | Manual workaround |
|---|---|---|
| `routine-timeout-watcher` | OFFLINE — hung Routines not auto-detected | Check `/war-room` page manually; if a session shows no progress >10 min, pause via Anthropic Console |
| `parent-ticket-expiry-watcher` | OFFLINE — 24h backstop is gone | The tracking Linear ticket for the outage serves as the manual backstop; Adam reviews open parent tickets on the day's Linear board |
| `audit-log-rollup` | OFFLINE — nightly rollup doesn't run | Acceptable; will catch up when Inngest returns. If outage >24h, run the rollup SQL manually via Supabase MCP |
| `embed-*` jobs | OFFLINE — no new embeddings during outage | Non-critical; RAG corpora just don't update during the window. Run manual re-embed via Inngest once restored |
| `cost-watchdog` | OFFLINE — heartbeat stops | Manual `claude_progress` queries per above |

---

## Recovery (Inngest platform returns)

1. **Confirm Inngest green.** Status page clears. Test by checking Inngest dashboard for function executions resuming. Confirm `cost-watchdog` writes a new `claude_progress` row within 90 minutes of Inngest returning.
2. **Lift Full-tier pause** (if it was set):
   ```
   wrangler kv:key put --namespace-id=<KV_NAMESPACE_ID> bridge:full_tier_paused false
   ```
3. **Replay dead-letter queue.** Inngest stores missed events in its dead-letter queue. Check Inngest dashboard → Dead Letters. Replay any events from `fan-in-watcher` that missed while Inngest was down. Verify by watching `audit_log` for new `complete` rows from the fan-in-watcher.
4. **Verify runaway-watcher is back.** It fires on `audit_log` insert where `cost_usd > $1`. Trigger a test: confirm the watcher function shows as active in Inngest dashboard.
5. **Verify embed jobs.** Force a manual re-embed trigger by pushing a trivial commit to `.claude/memory/DECISIONS.md`. Watch Inngest for the `embed-decisions` function to fire and complete.
6. **Telegram-ping Adam** `[inngest-outage resolved]`.
7. **Review any manual synth fires** logged in the tracking Linear ticket. Confirm each parent ticket reached Done state via the manual path.

---

## Post-incident

- [ ] Close the tracking Linear ticket with a summary of: duration, manual synths fired, any sessions that needed manual kill.
- [ ] Postmortem at `docs/07-history/postmortems/YYYY-MM-DD-inngest-outage.md` if outage >1h OR more than 2 manual synth fires required.
- [ ] Friday Retro tags this incident in the weekly retro doc.
- [ ] Update this runbook with anything that worked or didn't.
- [ ] If outage was triggered by our own function deployment: review the `apps/web/src/inngest/functions/` code that was deployed; add a staging-test requirement for Inngest functions to WS4 conventions.

---

## Decision tree

```
audit_log shows zero complete rows from fan-in-watcher >30 min?
├─ Check: are OTHER Inngest functions (cost-watchdog) also stopped?
│  ├─ YES (all functions stopped) → Inngest platform outage
│  │   → Check Inngest Status page
│  │   ├─ Platform-wide incident
│  │   │   → Telegram-ping Adam P1 (system-status)
│  │   │   → Open tracking Linear ticket
│  │   │   → Do NOT pause Routines (they're independent)
│  │   │   → Begin manual fan-in (§Mitigation)
│  │   │   → Monitor claude_progress for runaway sessions manually
│  │   │   → If outage >2h: pause Full-tier dispatches via KV flag
│  │   │   → Recovery: wait for Inngest green, replay dead-letter queue
│  │   │
│  │   └─ Inngest Status page green (but functions stopped)
│  │       → Possible partial outage or stale Status page
│  │       → Wait 15 min. Check Inngest Discord for chatter.
│  │       → If persists 30 min: Telegram-ping Adam P1. Treat as outage.
│  │
│  └─ NO (only fan-in-watcher stopped; other functions running)
│      → Not an Inngest outage. This is a fan-in-watcher code bug.
│      → Check Inngest dashboard for fan-in-watcher error logs.
│      → Do NOT run this runbook. Investigate the function error.
│
Inngest down >2h AND manual fan-in unmanageable?
└─ Pause Full-tier dispatches via KV flag bridge:full_tier_paused = true
   → Quick + Lite tiers continue unaffected
   → Lift flag immediately when Inngest returns
```

---

## Cross-impact on product

> **This section documents where the war room (internal) overlaps with the Beamix customer product.**

Inngest also hosts product-side functions (`scan-free`, `scan-manual`, `agent-execute`, `embed-*`, `email-*`). A full Inngest outage affects:
- **Customer-facing scans:** new scans queue but won't execute until Inngest returns. The Beamix product UI should handle gracefully (async scan pattern already implemented).
- **Agent execution jobs:** queued agent jobs stall. No data loss; Inngest dead-letter queue replays on recovery.
- **This is a product concern, not a war-room concern.** Flag to the Beamix product status page (TBD: `status.beamixai.com`) if outage >30 min. That escalation is outside this runbook's scope.

---

## Related runbooks

- `anthropic-outage.md` — independent failure mode; Routines can be independently down
- `vercel-outage.md` — Vercel hosts the Inngest function runtime; a Vercel outage may trigger this
- `mem0-outage.md` — independent failure mode; does not cascade to Inngest
- `secret-rotation.md` — Inngest functions hold secrets (Supabase service role key, OpenAI key); rotation procedure documented there

## Related signals

- `claude_progress` rows stop accumulating for `cost-watchdog` routine
- `audit_log` shows `status: fired` rows with no matching `complete` rows after 30+ min
- Inngest Status page incident
- Linear parent tickets showing all sub-tickets Done but no synth comment after 30 min

## Telemetry to verify is wired

- [ ] `cost-watchdog` Inngest function writes a `claude_progress` row every run (heartbeat — WS4 deliverable)
- [ ] `audit_log` accepts `status: rate_limited` enum value (WS4 migration per R1)
- [ ] Cloudflare KV has namespace entry for `bridge:full_tier_paused` flag (WS4 deliverable)
- [ ] `/war-room` page displays "Inngest: OFFLINE" when cost-watchdog heartbeat is stale >90 min (WS4 deliverable)
- [ ] Inngest dead-letter queue replay procedure tested in WS4 smoke tests
