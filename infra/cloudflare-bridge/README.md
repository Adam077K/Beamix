# Beamix Bridge — Cloudflare Worker

The Beamix Bridge is a Cloudflare Worker that sits between Linear, Telegram, iOS Shortcuts, and the Anthropic Routines `/fire` endpoint. It owns:

- HMAC verification on all inbound webhooks
- Two-layer idempotency (KV dedup + Durable Object lock)
- Trust-spec sentinel parsing and Zod validation
- Per-day `/fire` cap guard with Inngest delayed-event fallback
- Bridge soft-pause (via `bridge:paused` KV key — used during Anthropic outages)
- Haiku tier classifier for un-tagged Linear tickets
- Audit log writing before every Routine fire

Architecture: `docs/08-agents_work/ORCHESTRATION.md` §2B, §2D.
Security model: `docs/08-agents_work/ORCHESTRATION.md` §2D R3.1–R3.12.
DR runbooks: `docs/07-history/runbooks/cloudflare-compromise.md`, `secret-rotation.md`.

---

## Setup

### 1. Provision Cloudflare Workers Paid plan

Sign in to https://dash.cloudflare.com → Workers & Pages → Upgrade to Paid plan ($5/mo).
Required for Durable Objects (Layer 2 idempotency lock).

### 2. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 3. Create KV namespaces and Durable Object classes

```bash
# Bridge state KV (nonces, pause flags)
wrangler kv:namespace create BRIDGE_STATE_KV

# Copy the output `id` value and paste it into wrangler.toml under [[kv_namespaces]]
```

wrangler.toml requires two Durable Object class bindings:
- `ROUTINE_LOCK` → class `RoutineLock` (Layer 2 idempotency lock)
- `FIRE_COUNT_DO` → class `FireCountDO` (atomic per-day fire cap — R2 fix; replaces non-atomic KV get/put)

Add to `wrangler.toml`:
```toml
[[durable_objects.bindings]]
name = "ROUTINE_LOCK"
class_name = "RoutineLock"

[[durable_objects.bindings]]
name = "FIRE_COUNT_DO"
class_name = "FireCountDO"
```

Also create for the Telegram bot:
```bash
cd infra/telegram-bot
wrangler kv:namespace create TELEGRAM_QUEUE_KV
# Paste id into infra/telegram-bot/wrangler.toml
```

### 4. Set all secrets

Run each command and paste the value when prompted. Never commit secret values to git.

```bash
cd infra/cloudflare-bridge

# Bridge core secrets
wrangler secret put BRIDGE_HMAC_SECRET       # openssl rand -hex 32
wrangler secret put LINEAR_WEBHOOK_SECRET    # from Linear → Settings → API → Webhooks
wrangler secret put ANTHROPIC_API_KEY        # Console-billed key (NOT subscription OAuth)
wrangler secret put LINEAR_API_KEY           # from Linear → Settings → API → Personal API keys

# Per-Routine bearer tokens (one per standing Routine — from Anthropic Console)
wrangler secret put ROUTINE_CEO_ENTRY_POINT_TOKEN
wrangler secret put ROUTINE_MORNING_DIGEST_TOKEN
wrangler secret put ROUTINE_EOD_SYNC_TOKEN
wrangler secret put ROUTINE_AUTO_UNBLOCK_TOKEN
wrangler secret put ROUTINE_MONDAY_STANDUP_TOKEN
wrangler secret put ROUTINE_FRIDAY_RETRO_TOKEN
wrangler secret put ROUTINE_COMPETITOR_SIGNAL_TOKEN
wrangler secret put ROUTINE_CUSTOMER_VOICE_SIGNAL_TOKEN
wrangler secret put ROUTINE_GEO_ALGORITHM_SIGNAL_TOKEN
wrangler secret put ROUTINE_SYNTHESIZER_TOKEN

# Allowlist (comma-separated Linear user IDs — Adam's ID + any bot account IDs)
wrangler secret put ALLOWED_ISSUERS

# Channel secrets
wrangler secret put SHORTCUT_SECRET          # openssl rand -hex 32
wrangler secret put TELEGRAM_BOT_TOKEN       # from @BotFather in Telegram
wrangler secret put ADAM_TELEGRAM_CHAT_ID    # your Telegram numeric user ID

# Supabase (service role — never expose to client)
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### 5. Fill in Routine IDs

Edit `src/routing.ts`. Replace all `PLACEHOLDER_ROUTINE_ID` values with actual Routine IDs from Anthropic Console:

```
Anthropic Console → Claude Code → Routines → [select routine] → copy Routine ID
```

### 6. Deploy

```bash
cd infra/cloudflare-bridge
wrangler publish
```

For the Telegram bot:
```bash
cd infra/telegram-bot
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put ADAM_TELEGRAM_CHAT_ID
wrangler secret put BRIDGE_INTERNAL_URL     # https://beamix-bridge.workers.dev
wrangler secret put BRIDGE_HMAC_SECRET      # same value as bridge
wrangler publish
```

### 7. Register Linear webhook

Linear → Settings → API → Webhooks → Create webhook:
- URL: `https://beamix-bridge.workers.dev/linear`
- Events: Issue (created, updated), Comment (created)
- Secret: the value you set for `LINEAR_WEBHOOK_SECRET`

### 8. Register Telegram webhook

```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://beamix-telegram-bot.workers.dev/webhook"}'
```

### 9. Smoke-test

```bash
# Verify bridge health
curl https://beamix-bridge.workers.dev/health

# Expected response:
# {"status":"ok","kv_connected":true,"do_connected":true,"bridge_paused":false,"linear_paused":false}
```

For full smoke-test procedures (cap testing, Mem0 load testing, concurrent Routine test):
See `docs/08-agents_work/SMOKE-TESTS-WS4.md`.

---

## Bridge soft-pause (anthropic outage)

Per `docs/07-history/runbooks/anthropic-outage.md`:

```bash
# Pause:
wrangler kv:key put --namespace-id <BRIDGE_KV_NAMESPACE_ID> bridge:paused true

# Lift:
wrangler kv:key put --namespace-id <BRIDGE_KV_NAMESPACE_ID> bridge:paused false
```

`BRIDGE_KV_NAMESPACE_ID` is the `id` value under `[[kv_namespaces]]` in `wrangler.toml`.

---

## Routine token rotation (90-day cycle)

Per `docs/07-history/runbooks/secret-rotation.md` row #1:

1. In Anthropic Console → each Routine → Bearer tokens → Generate new.
2. Copy each new token.
3. `wrangler secret put ROUTINE_<NAME>_TOKEN` for each of the 10 Routines.
4. `wrangler publish`

For BRIDGE_HMAC_SECRET rotation (R12: secret written to temp file — not printed to terminal):
```bash
ANTHROPIC_API_KEY=<key> npx ts-node scripts/rotate-bridge-hmac.ts
# Script prints: "Secret written to: /tmp/bridge-hmac-<timestamp>.txt"
cat /tmp/bridge-hmac-<timestamp>.txt     # read the new secret
wrangler secret put BRIDGE_HMAC_SECRET   # paste the value from the temp file
rm /tmp/bridge-hmac-<timestamp>.txt      # delete temp file — removes from disk
wrangler publish
```
The script never prints the secret value to stdout. This prevents it appearing in terminal scrollback.

---

## Tail logs

```bash
wrangler tail
# or for telegram bot:
cd infra/telegram-bot && wrangler tail
```

---

## File structure

```
infra/cloudflare-bridge/
├── wrangler.toml              — Worker config, KV + DO bindings (no secret values)
├── package.json               — Dependencies (zod, wrangler, workers-types)
├── src/
│   ├── index.ts               — Main Worker fetch handler (all routes)
│   ├── routing.ts             — Label-to-Routine mapping + env type
│   ├── durable-object.ts      — RoutineLock DO class (Layer 2 idempotency)
│   └── audit.ts               — audit_log Supabase REST writer
└── scripts/
    └── rotate-bridge-hmac.ts  — Emergency/routine BRIDGE_HMAC_SECRET rotation
```

---

## Related docs

- `docs/08-agents_work/ORCHESTRATION.md` — Full architecture (§2B security, §2D spec schema)
- `docs/08-agents_work/TECH-STACK.md` — BOM and scaling cliffs (§3A.1 Cloudflare section)
- `docs/07-history/runbooks/cloudflare-compromise.md` — What to do if bridge is compromised
- `docs/07-history/runbooks/secret-rotation.md` — 90-day rotation procedure
- `docs/07-history/runbooks/anthropic-outage.md` — Soft-pause runbook
- `docs/08-agents_work/SMOKE-TESTS-WS4.md` — Smoke-test scripts
