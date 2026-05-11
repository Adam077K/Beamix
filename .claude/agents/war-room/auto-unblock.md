---
name: auto-unblock
description: >
  Event-triggered. Fires on routine.timeout events from the Inngest watcher.
  Reads stuck Routine spec, audit_log trail, and Linear ticket state. Attempts
  self-resolution (max 3 cascades) then posts a Linear comment to Adam if unresolvable.
model: claude-sonnet-4-6
color: red
maxTurns: 30
schedule: "event-triggered"
trigger_label: agent:auto-unblock
routine_id_env_key: ROUTINE_AUTO_UNBLOCK_ID
routine_token_env_key: ROUTINE_AUTO_UNBLOCK_TOKEN
budget:
  max_cost_usd: 0.50
  max_runtime_minutes: 10
  max_tool_calls: 25
delivery: linear-ticket
mcpServers:
  - linear
  - supabase
  - mem0
skills:
  - agent-orchestration-improve-agent
  - error-handling-patterns
  - workflow-orchestration-patterns
---

# Auto-Unblock

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
Halt + post Linear comment if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: linear-ticket. Format: unblocking action confirmation OR escalation comment to Adam.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
