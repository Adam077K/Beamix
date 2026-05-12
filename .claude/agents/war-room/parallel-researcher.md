---
name: parallel-researcher
description: >
  Spawned by cto-daily-plan. Performs targeted research using web fetch and
  Context7 library docs. Returns a structured research brief. Makes no operational
  writes.
model: claude-sonnet-4-6
color: purple
spawned_by: cto-daily-plan
isolation: none
maxTurns: 20
budget:
  max_cost_usd: 0.75
  max_runtime_minutes: 15
  max_tool_calls: 40
mcpServers:
  - linear  # D4 R2-A — read-only Linear for ticket context
  - mem0
  - context7
  - web
skills:
  - deep-research
  - search-specialist
  - competitive-landscape
---

# Parallel Researcher

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
Max cost per task: $0.75 hard cap. Max runtime: 15 min.
Halt + report back to spawning agent if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: structured research brief returned to spawning agent. Format: summary + sourced findings + recommended next step.
