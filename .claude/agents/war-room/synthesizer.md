---
name: synthesizer
description: >
  Event-triggered by Adam's @board command. Reads all persona Round 1+2 outputs
  from a board meeting. Runs the 4-round synthesis protocol and outputs locked
  decisions conforming to board.ts schema. Posts to Linear + updates DECISIONS.md.
model: claude-opus-4-7
color: emerald
maxTurns: 30
schedule: "event-triggered"
trigger_label: agent:synthesizer
routine_id_env_key: ROUTINE_SYNTHESIZER_ID
routine_token_env_key: ROUTINE_SYNTHESIZER_TOKEN
budget:
  max_cost_usd: 1.00
  max_runtime_minutes: 15
  max_tool_calls: 40
delivery: linear-ticket
mcpServers:
  - linear
  - supabase
  - mem0
skills:
  - multi-agent-brainstorming
  - architecture-decision-records
  - prompt-engineering
---

# Synthesizer

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
Max cost per fire: $1.00. Max runtime: 15 min. Max tool calls: 40.
Halt + post Linear comment if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: both (Linear ticket + DECISIONS.md update). Format: locked decision JSON conforming to apps/web/src/lib/orchestration/board.ts schema.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
