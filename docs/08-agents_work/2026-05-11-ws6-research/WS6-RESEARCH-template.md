# WS6 Research — Agent .md Template

Distilled from: `ceo.md`, `researcher.md`, `qa-lead.md`, `supabase-cleaner.md`
Date: 2026-05-11

---

## 1. Distilled Frontmatter (canonical)

```yaml
---
name: <slug>                         # required — matches Linear label agent:<slug>
description: >                       # required — one-line, describes when to invoke
  Use when X happens. Does Y. Returns Z.
model: claude-sonnet-4-6             # required — sonnet (default) | opus-4-6 (depth) | haiku-4-5 (fast)
color: <color-name>                  # required — see color table in CLAUDE.md
tools:                               # optional — omit to allow all; list to restrict
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task                             # orchestrators only
maxTurns: 25                         # optional — set ceiling, not target
isolation: worktree                  # optional — worktree | none
mcpServers:                          # optional — only list MCPs the agent actually needs
  - linear
  - github
  - supabase
skills:                              # optional — 2-3 for workers, 3-5 for leads/CEO
  - multi-agent-patterns
  - context-compression
---
```

**Tool restriction pattern (MCP-specific agents — see `supabase-cleaner.md`):**
When an agent needs only specific MCP methods, list each method explicitly in `tools:` rather than the server name:
```yaml
tools: Read, Write, Edit, Bash, Glob, Grep,
  mcp__supabase__list_tables,
  mcp__supabase__execute_sql,
  mcp__supabase__get_advisors
```
This limits blast radius — the agent can't use any MCP tool it wasn't briefed on.

---

## 2. Routine-Specific Extensions

Add these fields **in addition to** the canonical frontmatter for the 11 Routines only:

```yaml
schedule: "0 8 * * 1-5"             # cron expression OR "event-triggered"
trigger_label: agent:morning-digest  # Linear label that fires this Routine
routine_id_env_key: ROUTINE_MORNING_DIGEST_ID     # Worker-env key in routing.ts
routine_token_env_key: ROUTINE_MORNING_DIGEST_TOKEN
budget:
  max_cost_usd: 2.00
  max_runtime_minutes: 10
  max_tool_calls: 40
delivery: telegram                   # telegram | linear-ticket | both
```

---

## 3. Worker-Specific Extensions

```yaml
spawned_by: cto                      # which lead/orchestrator spawns this worker
isolation: worktree                  # always worktree for code workers; none for read-only workers
```

---

## 4. Persona-Specific Extensions

```yaml
invoke_via: "@aria"                  # @aria | @visionary | board-meeting comment
round_protocol: "round-2-critic"     # if board-meeting: round number + role
```

---

## 5. Body Section Structure (in order)

Every agent .md body follows this section sequence:

1. `# <Name>` — one-line identity statement
2. `## Role` — what this agent IS (not what it does)
3. `## Mission` — prime directive in one sentence
4. `## Inputs (reads)` — what files/context/payloads it reads before acting
5. `## Outputs` — what it produces (files, comments, JSON, SQL)
6. `## Golden path` — the happy-path numbered steps (≤10 steps)
7. `## Anti-patterns` — explicit DO NOT list (≥5 items)
8. `## Cost cap` — tier estimates (Trivial/Lite/Full) or flat cap in USD
9. `## Escalation` — when and how to escalate (binary-ping format for Adam)
10. `## Delivery` — final structured return JSON schema
11. `## Fire signal` — **Routine-only**: HMAC verification spec + `audit_log` write pattern

---

## 6. Sample Scaffold — Morning Digest

```markdown
---
name: morning-digest
description: >
  Fires every weekday at 08:00. Reads overnight Linear activity, open blockers,
  and Competitor Signal queue. Posts a prioritized digest to Adam via Telegram.
  CEO-tier orchestrator — does not implement.
model: claude-sonnet-4-6
color: yellow
tools: Read, Bash, Glob, Grep, Task
maxTurns: 20
isolation: none
mcpServers:
  - linear
  - supabase
skills:
  - multi-agent-patterns
  - context-compression
schedule: "0 8 * * 1-5"
trigger_label: agent:morning-digest
routine_id_env_key: ROUTINE_MORNING_DIGEST_ID
routine_token_env_key: ROUTINE_MORNING_DIGEST_TOKEN
budget:
  max_cost_usd: 1.50
  max_runtime_minutes: 8
  max_tool_calls: 30
delivery: telegram
---

# Morning Digest

<!-- WS6-6B: one-line identity statement -->

## Role <!-- WS6-6B: what this agent IS -->
## Mission <!-- WS6-6B: prime directive — one sentence -->
## Inputs (reads) <!-- WS6-6B: files + MCP sources -->
## Outputs <!-- WS6-6B: Telegram message format + Linear comment if any -->
## Golden path <!-- WS6-6B: numbered steps ≤10 -->
## Anti-patterns <!-- WS6-6B: ≥5 DO NOT items -->
## Cost cap <!-- WS6-6B: target cost vs ceiling -->
## Escalation <!-- WS6-6B: binary-ping conditions -->

## Delivery

```json
{
  "status": "COMPLETE | BLOCKED",
  "agent": "morning-digest",
  "summary": "<!-- WS6-6B -->",
  "telegram_sent": true,
  "linear_comment": "BEAMIX-N",
  "cost_usd_approx": 0.00,
  "tokens_used_approx": 0
}
```

## Fire signal

<!-- WS6-6B: HMAC header verification + audit_log write -->
<!-- Pattern: verify X-Beamix-Sig header; write to audit_log before any action -->
```
---

## 7. Env-var Alignment Notes

Cross-referenced against `infra/cloudflare-bridge/src/routing.ts` `ROUTINE_ID_ENV_KEY` map (lines 64–86) and `ROUTINE_TOKEN_ENV_KEY` map (lines 110–131).

### Missing entries (not in routing.ts — propose adding)

These Routine names appear in the WS6 roster but have no entry in `ROUTINE_ID_ENV_KEY`:

| Routine | Proposed ID env key | Proposed TOKEN env key |
|---------|--------------------|-----------------------|
| `advisor-daily-thinking` | `ROUTINE_ADVISOR_DAILY_THINKING_ID` | `ROUTINE_ADVISOR_DAILY_THINKING_TOKEN` |
| `cto-daily-plan` | `ROUTINE_CTO_DAILY_PLAN_ID` | `ROUTINE_CTO_DAILY_PLAN_TOKEN` |
| `content-idea-generator` | `ROUTINE_CONTENT_IDEA_GENERATOR_ID` | `ROUTINE_CONTENT_IDEA_GENERATOR_TOKEN` |

Add to both `ROUTINE_ID_ENV_KEY` and `ROUTINE_TOKEN_ENV_KEY` in `routing.ts`, and register the corresponding `wrangler secret put` calls.

### Stale entry (in routing.ts but NOT in current ROUTINE-ROSTER)

| Entry | Current value | Action |
|-------|--------------|--------|
| `"agent:customer-voice"` mapped to `ROUTINE_CUSTOMER_VOICE_SIGNAL_ID` | Points to `PLACEHOLDER_ROUTINE_ID` | Flag for removal — `customer-voice` label not referenced in current ROUTINE-ROSTER. Removing eliminates dead route and avoids a misconfigured silent ignore. |

### C-suite token blast-radius note

All C-suite agents (`cto`, `cmo`, `cpo`, `cbo`, `cco`, `qa-lead`) currently share `ROUTINE_CEO_ENTRY_POINT_TOKEN` (routing.ts line 122–127). This is documented as a WS6 follow-up: split into per-Routine bearer tokens (`ROUTINE_CTO_TOKEN`, etc.) when 10 Anthropic Routines are provisioned. Until then, revoking the CEO token disables all C-suite Routines simultaneously.
