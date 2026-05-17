# Runbook — Linear API breaking change OR Linear outage

**When:** Linear API returns errors at sustained rate, OR Linear introduces a breaking change to webhook/MCP/REST contract, OR Linear service is fully down.
**Severity:** **P1.** Work continues but is invisible — agents can keep running on cached state, but Adam cannot file new tickets and bridge cannot route new work.
**Owner today:** Adam.
**Last reviewed:** 2026-05-17 (Phase 7.5 re-test — structural pass, currency verified against 2026-05-16 agent rethink).

---

## Detection

| Signal | Where | Threshold |
|---|---|---|
| Linear Status page incident | https://status.linear.app | Any active incident |
| Cloudflare Worker logs `linear_api_4xx` | Worker dashboard | ≥5 in 10 min |
| Cloudflare Worker logs `linear_api_5xx` | Worker dashboard | ≥3 in 5 min |
| Webhook silence | bridge has not received a Linear webhook in time-since-last > expected (Adam typically files ≥1 ticket per work-day) | >24h with no webhook |
| Routine logs `linear_mcp_unavailable` | `audit_log` | ≥3 in 5 min |
| MCP `mcp__linear-server__*` tool calls return errors | Routine session logs | Any |

Distinguishing **outage** from **breaking change**:
- Outage: HTTP 5xx, connection refused, or error message includes `"service unavailable"`.
- Breaking change: HTTP 4xx with structured error like `"unknown field"` or `"deprecated endpoint"`. Often follows a Linear changelog post.

---

## Immediate (first 5 minutes)

1. **Confirm scope.** Linear Status page + Linear changelog (https://linear.app/changelog).
2. **Telegram-ping Adam:**
   ```
   [P1 linear-api-break]
   Linear API errors detected. Ticket creation may fail. War-room agents pause routing. Reply 'ack'.
   ```
3. **Soft-pause the bridge** for Linear webhooks ONLY (Telegram + iOS Shortcut paths still attempt ingest but will fail-open during Linear outage; Adam must manually re-send captured ideas after recovery). Set Cloudflare KV `bridge:linear_paused = true`.
4. **Open a tracking Linear ticket** in `Strategy/Signals` project — assuming Linear-create still works. If create also fails, file a GitHub Issue at the canary repo.
5. **Switch Adam's primary capture to GitHub Issues** for the duration. Notify via Telegram `[linear-fallback-active]`.

---

## Mitigation (next hour)

### Linear platform outage

- **Wait.** Linear's typical incident resolution is 30-90 min.
- **Inngest fan-in-watcher** holds state during the outage — it polls Linear's `issue.updated` event but if no events arrive, it just keeps waiting (per WS2 §2C). When Linear resumes, the queue catches up.
- **Do NOT manually flip tickets to Done** as a workaround — that breaks the `session_id` binding required for fan-in synth (WS2 R8).

### Breaking change

- **Read the Linear changelog entry.** Identify the changed contract: webhook payload shape, label semantics, MCP tool signature, REST endpoint deprecation.
- **Pin Linear MCP version.** If Adam upgrades Linear MCP automatically, downgrade to last-known-good in `.mcp.json`. Test bridge with one ticket.
- **If label vocabulary changed** (e.g., `agent:cto` reserved for system use): rename via Linear bulk-edit API + update bridge `routing.ts` + update WS6 agent .md files. This is a coordinated change. Linear has historically given 30-day deprecation windows; act within that window, not at the cliff.
- **If webhook payload changed**: update Cloudflare Worker parser. Smoke-test by triggering one ticket end-to-end.

### Idempotency considerations

- If bridge dropped a webhook during the outage, Linear's 3× retry over 7h re-delivers it. KV nonce dedup catches duplicates. **But:** if outage spanned >7h, a webhook may be permanently lost. Detection: orphan ticket with no audit_log row. Recovery: Morning Digest opens "manual re-fire" ticket.

---

## Recovery (full restore)

1. **Confirm Linear platform green** (Status page) AND `mcp__linear-server__list_issues` returns successfully.
2. **Lift bridge linear-pause:** Cloudflare KV `bridge:linear_paused = false`.
3. **Drain backlogged ideas.** Telegram + iOS Shortcut idea-capture endpoints fail-open during Linear outage (return 5xx to caller). For Telegram: Adam re-sends the message after Linear recovers. For iOS Shortcut: Adam re-runs the Shortcut. There is no automatic queue at MVP — accepted limitation. Future enhancement: Cloudflare KV holding queue with replay job (post-MVP).
4. **If breaking change handled with version pin:** schedule the proper migration as a Linear ticket with `agent:devops-lead, tier:lite` label. Don't leave the version pin in place forever.
5. **Reconcile orphans.** Morning Digest scans `audit_log` for `status: fired` rows where no matching `accepted` row exists in 7h, and opens manual-recovery tickets.

---

## Post-incident

- [ ] Postmortem if breaking change required code changes.
- [ ] Update `infra/cloudflare-bridge/src/routing.ts` if label vocabulary changed (HARD reversibility per BOM — coordinate with WS6 agents).
- [ ] If outage >2h: Friday Retro tags this; consider Linear standby (GitHub Issues fallback runbook elevated to P0 if recurring).
- [ ] Update this runbook.

---

## Decision tree

```
Linear API errors detected?
├─ Status page red → outage path
│   └─ Soft-pause Linear webhook intake. Telegram Adam.
│       Wait. Recovery: 30-90 min typical.
│       After recovery: drain backlogged ideas (Adam re-sends manually), reconcile orphans.
│
└─ Status page green → breaking change path
    ├─ Read changelog. Identify contract change.
    │
    ├─ MCP version drift
    │   → Pin .mcp.json to last-known-good. Test. File migration ticket.
    │
    ├─ Webhook payload shape
    │   → Update Cloudflare Worker parser. Deploy. Smoke-test 1 ticket.
    │
    ├─ Label semantics
    │   → Coordinated rename: Linear bulk-edit + bridge routing.ts +
    │     WS6 agent .md files. Plan a tier:full ticket for it.
    │
    └─ REST endpoint deprecation
        → If used directly: refactor to MCP equivalent.
        → If 30-day window: file ticket, defer.
        → If <7d window: tier:full ticket NOW.
```

---

## Related runbooks

- `secret-rotation.md` — Linear webhook secret rotation procedure
- `anthropic-outage.md` — independent; both can fail simultaneously without cascading

## Related signals

- `audit_log.status = linear_api_error`
- bridge logs `linear_api_4xx | linear_api_5xx`
- Linear Status page incident
- Adam manually reports

## Telemetry to verify is wired

- [ ] `audit_log` accepts `status: linear_api_error` enum value
- [ ] bridge writes `linear_api_4xx` / `linear_api_5xx` events to `audit_log`
- [ ] Telegram bot has `[linear-api-break]` and `[linear-fallback-active]` templates
