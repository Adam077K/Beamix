---
name: parallel-tester
description: >
  Spawned by cto-daily-plan. Runs E2E and integration tests using Playwright
  against a staging branch. Reads test fixtures from Supabase. Returns PASS/FAIL
  with a structured test report.
model: claude-sonnet-4-6
color: yellow
spawned_by: cto-daily-plan
isolation: worktree
maxTurns: 20
mcpServers:
  - supabase
  - github
  - playwright
skills:
  - playwright-skill
  - e2e-testing-patterns
  - testing-qa
---

# Parallel Tester

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
Halt + report back to cto-daily-plan if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: GitHub PR comment + Linear ticket comment. Format: structured test report — PASS / FAIL with failing test names and stack traces.
