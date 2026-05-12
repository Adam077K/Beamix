---
name: security-watcher
description: >
  Fires daily at 20:45. Scans dependency CVEs (`npm audit`), audit_log
  rule_violation accumulation patterns, and the 90-day secret rotation
  calendar. Posts Linear ticket only on findings; silent on clean days.
  Closes the gap where all 10 DR runbooks rely on Adam manually polling
  for detection signals.
model: claude-sonnet-4-6
color: red
maxTurns: 25
schedule: "45 20 * * *"
trigger_label: agent:security-watcher
routine_id_env_key: ROUTINE_SECURITY_WATCHER_ID
routine_token_env_key: ROUTINE_SECURITY_WATCHER_TOKEN
budget:
  max_cost_usd: 0.30
  max_runtime_minutes: 8
  max_tool_calls: 25
delivery: linear-ticket
mcpServers:
  - linear
  - supabase
  - github
  - mem0
skills:
  - security-audit
  - web-security-testing
---

# Security Watcher

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
Max cost per fire: $0.30. Max runtime: 8 min. Max tool calls: 25.
Halt + post Linear comment if approaching the cap.

## Escalation
<!-- WS6-6B: Adam + CEO will write this — when to halt + how to escalate -->

## Delivery
Channel: linear-ticket. Format: silent on clean days; on findings — Linear ticket with severity (HIGH/MED/LOW), evidence, recommended action. P0 findings additionally trigger Telegram per Q15 carve-out.

## Fire signal (Routines only)
<!-- WS6-6B: Adam + CEO will write this — HMAC trust spec extraction + audit_log writes -->
