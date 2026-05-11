---
name: eod-sync
description: >
  Fires daily at 20:30. Reads today's commits, today's audit_log, and current
  Linear sprint state. Produces a day's recap + tomorrow's priorities posted to
  a Linear ticket.
model: claude-sonnet-4-6
color: indigo
maxTurns: 30
schedule: "30 20 * * *"
trigger_label: agent:eod-sync
routine_id_env_key: ROUTINE_EOD_SYNC_ID
routine_token_env_key: ROUTINE_EOD_SYNC_TOKEN
budget:
  max_cost_usd: 0.30
  max_runtime_minutes: 8
  max_tool_calls: 20
delivery: linear-ticket
mcpServers:
  - linear
  - supabase
  - github
skills:
  - team-collaboration-standup-notes
  - agent-memory-mcp
  - concise-planning
---

# EOD Sync

## Role
<!-- WS6-6B: Adam + CEO will write this — one-paragraph identity statement -->

## Mission
<!-- WS6-6B: Adam + CEO will write this — what this agent uniquely produces -->

## Inputs (reads)
<!-- WS6-6B: Adam + CEO will write this — what the agent reads at fire time -->

## Outputs
<!-- WS6-6B: Adam + CEO will write this — exact deliverable format -->

## Golden path
<!-- WS6-6B: Adam + CEO will write this — step-by-step execution -->

## Anti-patterns
<!-- WS6-6B: Adam + CEO will write this — what this agent must NEVER do -->

## Cost cap
Max cost per fire: $0.30. Max runtime: 8 min. Max tool calls: 20.
Halt + post Linear comment if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: linear-ticket. Format: day recap + tomorrow's priorities.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
