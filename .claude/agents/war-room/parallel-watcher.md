---
name: parallel-watcher
description: >
  Spawned by cto-daily-plan or auto-unblock. Monitors audit_log and
  claude_progress tables for runaway or stuck Routines. Read-only Supabase access
  only. Reports anomalies back to the spawning agent.
model: claude-sonnet-4-6
color: gray
spawned_by: cto-daily-plan
isolation: none
maxTurns: 20
mcpServers:
  - supabase
skills:
  - agent-orchestration-improve-agent
  - api-testing-observability-api-mock
  - workflow-orchestration-patterns
---

# Parallel Watcher

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
Max cost per fire: scoped per task. Max runtime: cto-daily-plan sets per-task budget.
Halt + report back to spawning agent if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: structured report to spawning agent. Format: anomaly list — stuck Routine name, last heartbeat, recommended action.
