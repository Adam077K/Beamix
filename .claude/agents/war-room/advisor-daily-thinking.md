---
name: advisor-daily-thinking
description: >
  Fires daily at 05:30. Synthesizes HackerNews, AI/SEO news, X/Twitter, TechCrunch,
  Beamix Mem0, and last 7d audit_log into a multi-domain Advisor Brief. Posts to
  Linear "Advisor" project so Adam reads it on the 06:30-07:45 commute.
model: claude-opus-4-7
color: gold
maxTurns: 30
schedule: "30 5 * * *"
trigger_label: agent:advisor
routine_id_env_key: ROUTINE_ADVISOR_DAILY_THINKING_ID
routine_token_env_key: ROUTINE_ADVISOR_DAILY_THINKING_TOKEN
budget:
  max_cost_usd: 2.00
  max_runtime_minutes: 15
  max_tool_calls: 50
delivery: linear-ticket
mcpServers:
  - linear
  - supabase
  - mem0
  - web
skills:
  - deep-research
  - multi-agent-brainstorming
  - startup-metrics-framework
---

# Advisor Daily Thinking

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
Max cost per fire: $2.00. Max runtime: 15 min. Max tool calls: 50.
Halt + post Linear comment if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: linear-ticket (Linear "Advisor" project). Format: ~500-1000 word Advisor Brief with sections: Today's interesting · Worth questioning · New idea · News that matters.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
