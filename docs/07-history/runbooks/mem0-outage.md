# Runbook — Mem0 cloud outage / MCP unavailable

**When:** Mem0 cloud platform unavailable, `mcp.mem0.ai/mcp` returns 5xx, OR Routines log sustained `memory_write_failed` errors.
**Severity:** **P1.** Memory is L2 (cross-session episodic). Routines can continue running with degraded memory: in-session memory works, but cross-session retrieval is impaired. No data loss because session files (`docs/08-agents_work/sessions/`) are written in parallel.
**Owner today:** Adam.
**Last reviewed:** 2026-05-08 (WS3 lock).

---

## Detection

| Signal | Where | Threshold |
|---|---|---|
| Mem0 cloud Status (TBD: confirm Mem0 has a public Status page) | https://status.mem0.ai (verify URL on first incident) | Any |
| `mcp.mem0.ai/mcp` returns 5xx | Routine session logs | ≥3 in 5 min |
| `mcp.mem0.ai/mcp` returns connection refused / DNS failure | Routine session logs | ≥3 in 5 min |
| `audit_log.status = mem0_error` rows | Supabase | ≥3 in 5 min |
| Routine logs `memory_write_failed` OR `memory_read_failed` | session logs | ≥3 in 5 min |
| Mem0 GitHub issue #3400 reproduction (round-trip degradation) | Routine behavior | After ~40 round-trips, retrieval quality drops |
| Telegram bot `[mem0-error]` ping | Telegram | First page sent after threshold |

---

## Immediate (first 5 minutes)

1. **Confirm scope.** Try `curl https://mcp.mem0.ai/mcp/health` (or whatever Mem0's health endpoint is — verify on first incident). Check Mem0 Twitter / Discord for outage chatter.
2. **Telegram-ping Adam (P1, not P0):**
   ```
   [P1 mem0-outage]
   Mem0 MCP unavailable. Routines continuing on Anthropic Memory Tool fallback. No work pause.
   ```
3. **Routines fall back inline** — no bridge-level flag flip needed. Each Routine's MCP grant for `mem0` includes a try/catch wrapper that, on error, falls back to the Anthropic Memory Tool primitive (`memory_20250818`). This is implemented in the Routine system prompt template (WS6). The bridge does NOT need to inject any field; Routines self-detect and fall back. **No operator action required for Routine-side fallback.** Operator action is only needed if Mem0 stays down past 24h, in which case see Mitigation.
4. **No bridge pause.** Routines continue running — just with degraded memory.
5. **Open a tracking Linear ticket** in `Strategy/Signals` project.

---

## Mitigation (next hour)

### Mem0 cloud platform outage

- **Routines run on Anthropic Memory Tool fallback** (`memory_20250818` beta). This was the WS2 R5 fallback path: agents read/write to file-based `/memories` instead of Mem0 MCP.
- **Quality degradation expected:** Anthropic Memory Tool is file-based, no semantic retrieval. Cross-session memory is preserved but harder to query. Routines that rely heavily on retrieval (e.g., Friday Retro reading prior week's sessions) may produce shallower outputs. Acceptable for P1.
- **During Mem0 outage, memory writes that would have gone to Mem0 are LOST.** Cross-session episodic memory has a gap. Routines fall back to writing to Anthropic Memory Tool (file-based `/memories`) during the outage window — those writes survive but are not queryable via Mem0's semantic retrieval until the next Phase 2 OSS re-indexing job. Acceptable degradation for P1.

### Mem0 issue #3400 (round-trip degradation)

- Suspected bug: Mem0 cloud quality drops after ~40 round-trips per session. WS4 smoke-test C is designed to verify this.
- **Mitigation if reproduced:** session-cap each Routine at 30 round-trips, then force a session restart to reset Mem0 cache. Adds ~15s per restart; acceptable.
- **Long-term fix:** WS1F Phase 2 OSS migration. Self-hosted Mem0 with our own Postgres+pgvector eliminates cloud-side state.

### Mem0 cloud account issue (rate-limit, billing, suspension)

- Hobby tier has rate limits (unspecified by Mem0; ~10K writes/mo as soft). If hit, upgrade to Starter ($19/mo) — within budget.
- Account suspension would be unusual; would require contacting Mem0 support. Recovery path = WS1F migration acceleration.

---

## Recovery (full restore)

1. **Confirm Mem0 cloud green.** Test write + read round-trip from one Routine.
2. **No flag to lift.** Routines self-detect Mem0 availability inline; they will automatically resume writing to Mem0 once it is reachable.
3. **After Mem0 returns, no replay needed;** new memory writes resume going to Mem0 directly. Phase 2 OSS migration (WS1F) closes the memory-gap issue permanently.
4. **Audit memory consistency.** Pick 3-5 cross-session memory entries that should exist post-outage; verify they're queryable.
5. **Telegram-ping Adam** `[mem0-outage resolved]`.

---

## Post-incident

- [ ] Postmortem if outage >2h OR repeat incident.
- [ ] If repeat: accelerate WS1F (Phase 2 OSS migration).
- [ ] Update this runbook.
- [ ] Friday Retro tags this incident.

---

## Decision tree

```
Mem0 MCP errors detected?
├─ Verify scope via curl health check + Mem0 Twitter/Discord
│
├─ Cloud-wide outage
│   ├─ Routines self-detect and fall back to Anthropic Memory Tool inline (no operator action needed)
│   ├─ Telegram-ping Adam P1
│   ├─ Routines continue running (degraded memory)
│   └─ Memory writes during outage window are lost (gap closed by WS1F Phase 2 OSS migration)
│
├─ Round-trip degradation (issue #3400)
│   ├─ If smoke-test C confirmed this is real:
│   │   → cap Routine round-trips at 30, force restart pattern
│   ├─ If not yet confirmed:
│   │   → investigate this incident as smoke-test C signal
│   └─ Long-term: accelerate WS1F migration
│
├─ Account / rate limit
│   ├─ Hobby tier hit (10K writes/mo soft cap)
│   │   → upgrade to Starter ($19/mo) — 1-click in Mem0 dashboard
│   └─ Suspension
│       → contact Mem0 support; accelerate WS1F migration
│
└─ Persistent issues despite Mem0 cloud green
    └─ Suspect MCP server bug. File Mem0 GitHub issue with reproduction.
        Continue on fallback until upstream fix.
```

---

## Related runbooks

- `secret-rotation.md` — Mem0 API key rotation procedure
- `anthropic-outage.md` — independent failure mode; memory is independent of compute path
- `supabase-corruption.md` — relevant post-WS1F (when Mem0 OSS lives on Supabase Postgres)

## Related signals

- `audit_log.status = mem0_error`
- Routine logs `memory_write_failed` / `memory_read_failed`
- Mem0 dashboard write count anomaly
- WS4 smoke-test C result

## Telemetry to verify is wired

- [ ] `audit_log` accepts `status: mem0_error` enum value (WS4 migration)
- [ ] `mcp__mem0__*` tool errors logged to `audit_log` with full error message
- [ ] Routines have try/catch fallback to Anthropic Memory Tool inline (WS6 system prompt template)
- [ ] Mem0 dashboard write count is part of monthly burn-down report
