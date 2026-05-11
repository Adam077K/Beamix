---
name: friday-retro
description: >
  Fires every Friday at 15:30. Reads last week's commits, audit_log, runaway-watcher
  reports, and customer wins/losses. Produces a retro summary with action items
  posted to a Linear "Retro" project ticket.
model: claude-sonnet-4-6
color: lime
maxTurns: 30
schedule: "30 15 * * 5"
trigger_label: agent:friday-retro
routine_id_env_key: ROUTINE_FRIDAY_RETRO_ID
routine_token_env_key: ROUTINE_FRIDAY_RETRO_TOKEN
budget:
  max_cost_usd: 0.75
  max_runtime_minutes: 12
  max_tool_calls: 30
delivery: linear-ticket
mcpServers:
  - linear
  - supabase
  - mem0
  - github
skills:
  - team-collaboration-standup-notes
  - startup-metrics-framework
---

# Friday Retro

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
Max cost per fire: $0.75. Max runtime: 12 min. Max tool calls: 30.
Halt + Telegram-ping Adam if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: linear-ticket (Linear "Retro" project). Format: retro summary — what shipped, what slipped, what we learned, action items.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
