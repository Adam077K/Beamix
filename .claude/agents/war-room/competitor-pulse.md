---
name: competitor-pulse
description: >
  Fires daily at 05:40. Fetches competitor pricing pages, blog posts, social posts,
  and AI-search rankings. Posts a diff summary to Telegram only when material changes
  are detected — silent on no-change days.
model: claude-sonnet-4-6
color: orange
maxTurns: 30
schedule: "40 5 * * *"
trigger_label: agent:competitor-signal
routine_id_env_key: ROUTINE_COMPETITOR_SIGNAL_ID
routine_token_env_key: ROUTINE_COMPETITOR_SIGNAL_TOKEN
budget:
  max_cost_usd: 0.40
  max_runtime_minutes: 10
  max_tool_calls: 25
delivery: telegram
mcpServers:
  - linear
  - mem0
  - web
skills:
  - competitive-landscape
  - search-specialist
  - deep-research
---

# Competitor Pulse

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
Max cost per fire: $0.40. Max runtime: 10 min. Max tool calls: 25.
Halt + Telegram-ping Adam if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: telegram. Format: diff summary — send only when material changes detected, silent otherwise.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
