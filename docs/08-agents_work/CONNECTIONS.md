# CONNECTIONS — External contracts the war room obeys

**Status:** PROPOSED — pending Adam-review gate (post-WS4 critique)
**Workstream:** WS4 sub-phase 4A-4F
**Source:** Locked WS2 (`docs/08-agents_work/ORCHESTRATION.md`) + WS3 BOM (`docs/08-agents_work/TECH-STACK.md`).
**Scope:** war-room only (Adam's internal AI agent army that builds Beamix-the-product). Customer-facing contracts live in `docs/security/PRODUCT-COMPLIANCE-BACKLOG.md`.

This file documents every external surface the war room exchanges data with: Linear, GitHub, Telegram, iOS, Cloudflare Workers, Anthropic Routines. Each section answers: what events, what payloads, what auth, what retries, what idempotency.

---

## A. Linear contract (4A)

### Webhook events the bridge listens for

Configured in Linear → Settings → API → Webhooks → endpoint `https://beamix-bridge.workers.dev/linear`.

| Event | When | What the bridge does |
|---|---|---|
| `Issue:created` | Adam files a new ticket | Parse comment for trust spec sentinel; if found and validates, fire the routed Routine. If no sentinel, just write `audit_log` row tracking the ticket existed. |
| `Issue:updated` | Status change (e.g., Done) | If `fan_in_key` matches a parent ticket awaiting completion, validate session_id binding, fire CEO synth via Inngest fan-in-watcher. |
| `Comment:created` | Adam OR an agent comments | Parse for sentinel spec. Same flow as Issue:created. |
| `IssueLabel:added` / `removed` | Label changes | Re-evaluate routing if `agent:*`, `tier:*`, `risk:*` labels change. |
| `Project:updated` | Project metadata changes | Currently no-op; logged for audit. |

### Comment formats

**Trust spec (only valid format for triggering Routines):** the comment body must contain a sentinel-bracketed JSON block:
```
---BEAMIX-SPEC-V1-START---
{
  "spec_version": "1.0",
  "trust_mode": true,
  "nonce": "uuid-v4",
  "issued_at": "2026-05-08T14:33:00Z",
  "expires_at": "2026-05-08T15:03:00Z",
  "issued_by": { "kind": "adam", "linear_user_id": "<adam-id>" },
  "linear_ticket": "BMX-123",
  "scope": { ... },
  "budget": { ... },
  "escalation": { ... },
  "audit": { ... }
}
---BEAMIX-SPEC-V1-END---
```
Bridge HMAC-signs this body using `BRIDGE_HMAC_SECRET` before injecting into `/fire`. Receiving Routine verifies HMAC.

**DONE comment (sub-ticket completion):** must contain `fan_in_key: <uuid>` and `session_id: <id>` to be valid for fan-in synth.

**Adam-veto reply (board meeting Adam-veto checkpoint):** Adam replies with `accept`, `reject`, or `revise` plus rationale on the board-meeting Linear ticket.

### Label semantics (HARD reversibility — see WS2 §reversibility)

| Label | Meaning | Used by |
|---|---|---|
| `agent:ceo` `agent:cto` `agent:cpo` `agent:cmo` `agent:cbo` `agent:cco` `agent:qa-lead` | Routes the ticket to the named C-suite Routine | bridge `routing.ts` |
| `tier:quick` `tier:lite` `tier:full` | Sets the dispatch tier (per WS2 §2A short-circuits) | bridge tier classifier |
| `risk:irreversible` | Forces tier to `full`; QA Lead Full-tier review required | qa-lead-pass workflow |
| `board-meeting` | Triggers `/board-meeting` slash command flow via bridge | bridge + Synthesizer Routine |
| `proposed-by-agent` | Tickets agents propose for Adam review (Friday Retro, signal Routines) | Adam's review filter |
| `decision_type:vendor` `decision_type:strategic` | Routes Adversary persona for board meetings (Aria vs broad-Adversary) | board-meeting flow |
| `incident` | Tracking ticket opened by a DR runbook | runbooks |

### MCP usage per Routine

Per ORCHESTRATION.md §2E. Each Routine's `.mcp.json` declares its grants. Friday Retro's grant updated per ORCHESTRATION.md errata 3 to include `supabase`.

---

## B. GitHub contract (4B)

### `claude-code-action@v1` configuration

Adam configures the GitHub App when ready (post-WS4). Required secrets in repo settings:
- `ANTHROPIC_API_KEY` (for `@claude` mention triggers, Console-billed)
- `LINEAR_API_KEY` (for cross-posting back to Linear)

### Branch naming policy

- `feat/<task-slug>` — features
- `fix/<task-slug>` — bug fixes
- `chore/<task-slug>` — maintenance / tooling

The `qa-lead-pass.yml` workflow expects to find a session file matching the slug.

### PR template

`.github/pull_request_template.md` — see file.

### `qa-lead-pass` check requirements

Workflow at `.github/workflows/qa-lead-pass.yml`. Gates merge to `main`:
1. Session file exists at `docs/08-agents_work/sessions/<date>-<lead>-<slug>.md`
2. Session file frontmatter contains `qa_verdict: PASS`
3. OR PR has `qa-lead-bypass` label AND a comment from Adam containing `BYPASS REASON:` text
4. If neither — workflow fails; merge blocked

Branch protection on `main` (configured manually in GitHub repo settings) requires this check. See WS2 §2A "QA Lead enforcement is structural" — the workflow is the second layer; MCP grants are the first; audit_log `rule_violation` row is the third.

### Auto-merge rules

Auto-merge eligible only after:
- All required checks pass (including `qa-lead-pass`)
- All requested reviews approved
- No `risk:irreversible` label

---

## C. Telegram contract (4C)

### Bot routing matrix

Bridge `infra/telegram-bot/src/index.ts` parses incoming Telegram messages from `ADAM_TELEGRAM_CHAT_ID`. Routing:

| Message starts with | Routes to | Notes |
|---|---|---|
| (default — no prefix) | CEO Entry-point Routine | Standard ad-hoc capture |
| `@cto` | CTO Routine | Skip-the-CEO express lane (per V4 design) |
| `@cmo` | CMO Routine | |
| `@cbo` | CBO Routine | |
| `@cco` | CCO Routine | |
| `@cpo` | CPO Routine | |
| `@qa` | QA Lead Routine | |
| `@synth` | Synthesizer Routine | Direct synthesizer invocation |
| `@retro` | Friday Retro Routine | Manual retro trigger |
| `@unblock` | Auto-Unblock Routine | Manual unblock trigger |
| `@board` | Triggers `/board-meeting` flow via Synthesizer Routine | Strategic decisions |

Note: mention matching uses word-boundary regex `^(@[a-z-]+)\b` — `@cto-something` does NOT match `@cto`.

### Auth

Telegram bot (`infra/telegram-bot`) → bridge `/telegram` includes HMAC signature over `X-Beamix-Timestamp + "\n" + body` using `BRIDGE_HMAC_SECRET`. Bridge verifies with the same `verifyHmacSignature` helper used for `/idea-capture`.

### Escalation format (binary-ping)

Auto-Unblock Routine sends Adam binary-ping format messages:
```
[L3 binary-ping]
<concise question>
Reply 'A' or 'B' (or 'pause' to defer)
```

### Idempotency

Telegram update_id stored in Cloudflare KV `telegram:dedup:<update_id>` with 24h TTL. Duplicate updates dropped silently.

### Rate limits

Telegram side: 30 messages/sec from the bot. Bridge does not need to rate-limit incoming (Telegram handles it).

### Cost-alert philosophy (locked Adam Q7 2026-05-08)

**Telegram is for system-status alerts only.** It does NOT receive cost-rate alerts. Cost is observed passively via the `/war-room` page and monthly burn-down report. See ORCHESTRATION.md errata 4 + TECH-STACK.md §3D.3 for the full philosophy.

---

## D. iOS Shortcut contract (4D)

### Voice-to-Linear flow

1. Adam invokes Shortcut "Capture Beamix Idea" on iPhone (Siri OR home-screen tap).
2. Shortcut prompts for voice input.
3. Voice transcription sent to Anthropic Haiku via API to expand into Linear ticket title + body.
4. Shortcut POSTs to bridge `/idea-capture` with HMAC signature using `SHORTCUT_SECRET`.
5. Bridge creates Linear ticket via Linear API.

### Auth

HMAC-SHA256 over `X-Beamix-Timestamp + "\n" + body` using `SHORTCUT_SECRET`. Bridge rejects unsigned or stale (>300s skew) requests. Body must include a UUID `nonce` field (deduped 24h in KV — prevents replay within rotation window).

Required headers:
- `X-Beamix-Signature: sha256=<hex>`
- `X-Beamix-Timestamp: <unix-epoch-seconds>`

### Failure modes

- **Voice dictation empty:** Shortcut shows "No voice detected" alert and exits (R6 safety check).
- **Anthropic API timeout:** Shortcut shows generic failure message; Adam re-tries.
- **Bridge timeout / error:** Shortcut shows "Capture FAILED: <error>" notification (R6 — no silent failures). Adam re-runs Shortcut after recovery.
- **Linear down:** bridge returns 5xx; Shortcut shows error; Adam re-runs after Linear recovers.

### Setup

See `infra/shortcuts/README.md` for installation steps.

---

## E. Cloudflare Worker bridge contract (4E)

### Endpoints

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/linear` | POST | Linear webhook receiver | HMAC via `LINEAR_WEBHOOK_SECRET` |
| `/idea-capture` | POST | iOS Shortcut idea ingest | HMAC via `SHORTCUT_SECRET` |
| `/telegram` | POST | Telegram bot relay | Validation against `ADAM_TELEGRAM_CHAT_ID` + bot token |
| `/health` | GET | Liveness check | None |

### HMAC verification

All write endpoints verify HMAC using Web Crypto API (`crypto.subtle.verify`). Constant-time comparison.

HMAC input format (R3):
- Linear webhooks: `body` only (Linear does not send a timestamp header)
- iOS Shortcut → `/idea-capture`: `X-Beamix-Timestamp + "\n" + body`
- Telegram bot → `/telegram`: `X-Beamix-Timestamp + "\n" + body`
- Timestamp skew window: ±300 seconds. Requests outside this window are rejected.

`/health` endpoint: returns `{ ok: true }` for unauthenticated requests. Detailed state (bridge_paused, linear_paused, binding status) requires `Authorization: Bearer <BRIDGE_HMAC_SECRET>`.

### Two-layer dedup

Per WS2 §2B + R2.1:
- **Layer 1 — Cloudflare KV:** ticket-scoped 24h TTL on `fire:<ticket_id>:<label>`. Catches Linear webhook 3× retries.
- **Layer 2 — Cloudflare Durable Object:** strongly-consistent `(routine_id, ticket_id)` lock. Catches cross-region KV propagation race.

### Secret rotation policy

Per `runbooks/secret-rotation.md`. 90-day routine cadence; immediate emergency rotation on compromise. Bridge holds: `BRIDGE_HMAC_SECRET`, `LINEAR_WEBHOOK_SECRET`, `SHORTCUT_SECRET`, `TELEGRAM_BOT_TOKEN`, 10× per-Routine bearer tokens, `ANTHROPIC_API_KEY` (Console-billed for tier classifier), `SUPABASE_SERVICE_ROLE_KEY`.

### Retry semantics

- Bridge does NOT retry inline (per WS2 R2.2 fire-and-forget rule).
- On `/fire` 5xx: write `audit_log` row `status: anthropic_error`, schedule Inngest delayed event for retry with exponential backoff.
- On Linear API 5xx (e.g., for ticket creation from `/idea-capture`): same — no inline retry; Inngest delayed event.

### Idempotency keys

- `nonce` field in trust spec (R3.4 replay prevention)
- Linear `update_id` for webhook events
- Telegram `update_id` for bot messages
- iOS Shortcut: HMAC body itself acts as fingerprint; bridge dedups recent body hashes (24h KV TTL)

---

## F. Anthropic Routines contract (4F)

### The 10 Routines

Per ORCHESTRATION.md §2E:
1. CEO Entry-point (Sonnet, $1.00/run cap, on-demand)
2. Morning Digest (Sonnet, $0.30/run cap, daily 07:30 IL)
3. EOD Sync (Haiku, $0.10/run cap, daily 20:00 IL)
4. Auto-Unblock (Sonnet, $0.50/run cap, on-demand)
5. Monday Standup (Sonnet, $0.50/run cap, Mon 08:00 IL)
6. Friday Retro (Opus, $1.50/run cap, Fri 18:00 IL — `supabase` MCP added per errata 3)
7. Competitor Signal (Sonnet, $0.50/run cap, Sun 06:00 IL)
8. Customer Voice Signal (Sonnet, $0.50/run cap, Sun 07:00 IL)
9. GEO Algorithm Signal (Sonnet, $0.50/run cap, bi-weekly Sun 08:00)
10. Synthesizer (Opus, $1.00/run cap, on-demand from board meetings)

### Per-Routine bearer tokens

Each Routine has a unique bearer token for its `/fire` endpoint. Tokens stored in Cloudflare Worker env vars `ROUTINE_<NAME>_TOKEN`. Adam generates them in Anthropic Console.

### Trust-mode payload

Bridge HMAC-signs the spec body and POSTs to `https://api.anthropic.com/v1/claude_code/routines/{routine_id}/fire` with the `Authorization: Bearer <ROUTINE_TOKEN>` header. Receiving Routine verifies HMAC against `BRIDGE_HMAC_SECRET` before trusting any spec field.

### Cron Routines

Configured in Anthropic Console (NOT in `wrangler.toml` — Routines are not Cloudflare crons). Cron exemption from 15/day cap is verified by WS4 smoke-test A.

### Cost cap enforcement

Per Routine: `runaway-watcher` Inngest function silently revokes the bearer token if `cost_usd > 1.2 × spec.max_cost_usd`. Per Adam Q7 — no Telegram alert on kill.

### Anthropic Console hard cap

$1500/mo absolute backstop set by Adam in Console. If hit, Anthropic emails Adam directly (vendor-side notification, can't be suppressed).

---

## Open contracts to verify (smoke tests + post-MVP)

- **Cron Routine cap exemption** — WS4 smoke-test A
- **`/fire` Retry-After granularity** — WS4 smoke-test B
- **Mem0 MCP load behavior** — WS4 smoke-test C
- **Concurrent Routine cap** — WS4 smoke-test D
- **Anthropic ZDR coverage on Max subscription** — Adam Q4 (deferred to product compliance backlog)
- **iMessage Channel as alternative to Telegram bot** — out of WS4 scope; future enhancement
- **GitHub Advanced Security secret scanning** — flagged in `runbooks/github-compromise.md` post-incident; not in WS4 scope

---

## See also

- `docs/08-agents_work/ORCHESTRATION.md` — full WS2 architecture (the contract source)
- `docs/08-agents_work/TECH-STACK.md` — BOM (the components these contracts reach)
- `docs/07-history/runbooks/*.md` — failure-mode procedures for each contract
- `docs/08-agents_work/SMOKE-TESTS-WS4.md` — verification scripts for the open contracts
- `infra/cloudflare-bridge/README.md` — bridge deployment + setup
