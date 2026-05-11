---
name: cto-daily-plan
description: >
  Fires daily at 10:30. Reads open Linear tickets, last EOD Sync, runaway-watcher
  reports, last 24h audit_log, and pgvector RAG on codebase + decisions. Plans the
  day's parallel-ready work for the 100-worker agent army. Outputs Linear ticket +
  3-5 bullet Telegram summary.
model: claude-opus-4-7
color: blue
maxTurns: 30
schedule: "30 10 * * *"
trigger_label: agent:cto-daily-plan
routine_id_env_key: ROUTINE_CTO_DAILY_PLAN_ID
routine_token_env_key: ROUTINE_CTO_DAILY_PLAN_TOKEN
budget:
  max_cost_usd: 1.50
  max_runtime_minutes: 20
  max_tool_calls: 50
delivery: both
mcpServers:
  - linear
  - supabase
  - mem0
skills:
  - dispatching-parallel-agents
  - agent-orchestration-multi-agent-optimize
  - concise-planning
---

# CTO Daily Plan

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
Max cost per fire: $1.50. Max runtime: 20 min. Max tool calls: 50.
Halt + Telegram-ping Adam if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: both (Linear ticket + Telegram). Format: day's parallel-ready work breakdown + 3-5 bullet summary.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
