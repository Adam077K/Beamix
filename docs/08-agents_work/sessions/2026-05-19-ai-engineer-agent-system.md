---
session: 2026-05-19-ai-engineer-agent-system
date: 2026-05-19
agent: ai-engineer
branch: feat/agent-system
pr: https://github.com/Adam077K/Beamix/pull/81
risk_tier: full
qa_verdict: PENDING
status: complete
---

# Wave 0 Worker 2 — Agent System

Built the 5-step pipeline (plan / research / do / qa / summarize), `runAgentPipeline`
orchestrator, and the `agent-execute` Inngest function on top of the 25 pre-existing
files (types, registry, prompts, llm runner, credits, coordination, security).

- Orchestrator: try/finally always releases page-locks; one QA-driven DO retry; credit
  hold/confirm/release (paid) + daily-cap (free); persists agent_costs, agent_job_outputs,
  inbox_items draft.
- QA stage runs Perplexity Sonar citation verification for Content Optimizer, Authority
  Blog Strategist, FAQ Builder. All user-controlled spans wrapped via `wrapUserData()`.
- Inngest function: `concurrency.key = event.data.businessId` (one job per business).
- Isolated typecheck not possible — this branch has no app scaffold (that lives on
  feat/app-shell, PR #79). Typecheck is a post-merge integration gate on main.

## QA cycle 2 — blocker fixes (2026-05-20)

Three QA-Lead blockers on PR #81 fixed in-place on `feat/agent-system`:

- **P1 (jailbreak bypass):** `renderCustomInstructions` wrapped raw `customInstructions`
  via `wrapUserData()` without first calling `sanitizeCustomInstructions()` — the
  jailbreak rejector never ran. Now sanitizes before wrapping. `renderTargetUrl`
  similarly wrapped a raw user URL; now runs `sanitizeScanUrl()` first.
- **P1 cont. + P2-3:** `loadBusinessContext` now applies `sanitizeBusinessName` to
  `data.name` and `sanitizeScanUrl` to `website_url` (null-guarded → `''`) at context
  load, so every downstream consumer (`renderBusinessBlock`, `fallbackSummary`) gets
  pre-sanitized values. Comment added in `renderBusinessBlock` noting this contract.
- **P2-1:** `inngest/client.ts` `eventKey` no longer falls back to `''` silently —
  `resolveEventKey()` throws when `INNGEST_EVENT_KEY` is absent in production, matching
  the `requireEnv` pattern in `llm/runner.ts`. Empty still allowed in dev.

Out of scope (tech-debt, separate branch): P2-2 atomic daily-cap increment needs a new
DB RPC + migration — `incrementDailyCap` left untouched.
