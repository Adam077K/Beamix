---
name: monday-standup
description: >
  Fires every Monday at 10:40. Reads last week's EOD Syncs, last Friday Retro,
  and current sprint backlog. Produces a week-ahead plan posted to a Linear sprint
  planning ticket.
model: claude-sonnet-4-6
color: cyan
maxTurns: 30
schedule: "40 10 * * 1"
trigger_label: agent:monday-standup
routine_id_env_key: ROUTINE_MONDAY_STANDUP_ID
routine_token_env_key: ROUTINE_MONDAY_STANDUP_TOKEN
budget:
  max_cost_usd: 0.50
  max_runtime_minutes: 10
  max_tool_calls: 25
delivery: linear-ticket
mcpServers:
  - linear
  - mem0
skills:
  - team-collaboration-standup-notes
  - concise-planning
  - product-manager-toolkit
---

# Monday Standup

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
Max cost per fire: $0.50. Max runtime: 10 min. Max tool calls: 25.
Halt + Telegram-ping Adam if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: linear-ticket (sprint planning ticket). Format: week-ahead plan — what ships, what's at risk.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
