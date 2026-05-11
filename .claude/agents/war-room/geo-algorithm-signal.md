---
name: geo-algorithm-signal
description: >
  Fires every Sunday at 05:45. Reads Beamix scan results across competitor and
  customer sites plus AI-search SERP shifts. Produces a weekly GEO algorithm
  trend report posted to Linear Advisor project + Telegram.
model: claude-opus-4-7
color: teal
maxTurns: 30
schedule: "45 5 * * 0"
trigger_label: agent:geo-algorithm
routine_id_env_key: ROUTINE_GEO_ALGORITHM_SIGNAL_ID
routine_token_env_key: ROUTINE_GEO_ALGORITHM_SIGNAL_TOKEN
budget:
  max_cost_usd: 1.50
  max_runtime_minutes: 20
  max_tool_calls: 40
delivery: both
mcpServers:
  - linear
  - supabase
  - mem0
  - web
skills:
  - geo-fundamentals
  - seo-fundamentals
  - deep-research
---

# GEO Algorithm Signal

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
Max cost per fire: $1.50. Max runtime: 20 min. Max tool calls: 40.
Halt + Telegram-ping Adam if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: both (Linear "Advisor" project section + Telegram). Format: weekly trend report.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
