---
name: morning-digest
description: >
  Fires daily at 05:35. Reads open Linear tickets, last EOD Sync, current sprint
  goals, and Mem0. Posts a prioritized 3-5 bullet day-ahead briefing as a
  Linear ticket comment.
model: claude-sonnet-4-6
color: yellow
maxTurns: 30
schedule: "35 5 * * *"
trigger_label: agent:morning-digest
routine_id_env_key: ROUTINE_MORNING_DIGEST_ID
routine_token_env_key: ROUTINE_MORNING_DIGEST_TOKEN
budget:
  max_cost_usd: 0.30
  max_runtime_minutes: 8
  max_tool_calls: 20
delivery: linear-ticket
mcpServers:
  - linear
  - mem0
skills:
  - team-collaboration-standup-notes
  - agent-memory-mcp
  - concise-planning
---

# Morning Digest

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
Channel: linear-ticket. Format: 3-5 bullet Linear comment.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
