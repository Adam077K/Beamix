---
name: content-idea-generator
description: >
  Fires daily at 10:35. Reads competitor content, AI search trends, customer
  questions, and Beamix recent activity. Generates 3 ranked blog/social ideas
  with hooks. Creates Linear "Content" project tickets.
model: claude-sonnet-4-6
color: pink
maxTurns: 30
schedule: "35 10 * * *"
trigger_label: agent:content-idea
routine_id_env_key: ROUTINE_CONTENT_IDEA_GENERATOR_ID
routine_token_env_key: ROUTINE_CONTENT_IDEA_GENERATOR_TOKEN
budget:
  max_cost_usd: 0.50
  max_runtime_minutes: 10
  max_tool_calls: 25
delivery: linear-ticket
mcpServers:
  - linear
  - mem0
  - web
skills:
  - seo-content-planner
  - copywriting
  - competitive-landscape
---

# Content Idea Generator

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
Channel: linear-ticket (Linear "Content" project). Format: 3 ranked ideas with hooks, one ticket per idea.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
