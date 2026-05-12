---
name: parallel-builder
description: >
  Spawned by cto-daily-plan. Implements a scoped feature or fix in an isolated
  worktree. Creates a PR on completion. Does not merge — QA gate is structural.
model: claude-sonnet-4-6
color: blue
spawned_by: cto-daily-plan
isolation: worktree
maxTurns: 20
budget:
  max_cost_usd: 2.00
  max_runtime_minutes: 30
  max_tool_calls: 80
supabase_scope: read-only  # Q9/D4 — DDL goes through parallel-deployer only
mcpServers:
  - linear
  - supabase
  - github
  - context7
skills:
  - nextjs-app-router-patterns
  - backend-development-feature-development
  - error-handling-patterns
---

# Parallel Builder

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
Max cost per task: $2.00 hard cap (cto-daily-plan may allocate less; this is the ceiling). Max runtime: 30 min.
Halt + report back to spawning agent if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: github PR + Linear ticket comment. Format: structured return JSON with branch, worktree, files_changed, commits, summary.
