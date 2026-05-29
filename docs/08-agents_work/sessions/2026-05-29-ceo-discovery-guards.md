---
date: 2026-05-29
role: ceo
session: ceo-discovery-guards
tier: irreversible
qa_verdict: PASS
pr: 110
---

# CEO Session — wire discovery agent security guardrails (the real SEC debt)

## Goal
Implement the 3 security guardrails that PR #108 left as honest `TODO(SEC)` markers
in the discovery agent — the genuine prompt-injection + cost-DoS hardening.

## Shipped (branch feat/discovery-guards)
1. **Token-budget DoS hard-close (Fix 6):** `MAX_TOTAL_TOKENS_PER_SESSION = 100_000`;
   accumulate `inputTokens + cacheReadTokens` per call; pre-call check at top of the
   agentic loop yields terminal `session_token_budget_exceeded` error + returns before
   the next paid LLM call.
2. **YMYL deep-scan (Fix 5):** recursive `detectYmylInJson()` on every tool-call input
   AND structured tool result (plus the kept body-text scan); each hit yields `ymyl_flag`
   + structured log.
3. **Force-approval (Fix 5 CRITICAL):** sticky `ymylSignalDetected` (never reset), set at
   every detection site; threaded via `SessionContext.ymylSignalDetected` into
   `executeEmitBrandFingerprint`, which forces `requires_human_approval = llm_supplied ||
   ymylSignalDetected` BEFORE Zod validation — an LLM cannot set `false` to bypass.
   Logs `ymyl_force_human_approval` when the override fires.

Docstring rewritten to ACTIVE; all TODO(SEC) markers removed.
Worker: ai-engineer. Files: discovery/index.ts, discovery/tools.ts.

## QA gate (Irreversible — out-of-band validators, both COMPLETE)
- typecheck pass; build lint/compile green (only local env `Missing INNGEST_EVENT_KEY`,
  not code).
- **security-engineer: PASS** — traced force-approval un-bypassable (sticky monotonic flag,
  forced value set before Zod safeParse on the validated object, survives into result.data;
  LLM cannot override). Token ceiling checked before next paid call (documented acceptable
  off-by-one). detectYmylInJson has no JSON.parse path — malformed results can't crash.
  No secret leakage in logs. No unsound casts.
- **code-reviewer: PASS** — 0 P1; 3 P2 + 2 P3, all non-blocking polish (see below). All 3
  guards correctly wired; no callers outside discovery/.
- Tier: **Irreversible** (`apps/web/src/lib/agents/discovery/**`). Label + Adam sign-off.
- **Verdict: PASS.**

## Follow-up polish (P2/P3 — non-blocking, tracked)
- P2: `fetch_site_content` result double-scanned (body scan + JSON deep-scan overlap) →
  duplicate `ymyl_flag` events; narrow the JSON scan to title+description.
- P2: misindented `else` block at emit site (cosmetic).
- P2: token-budget off-by-one — first call always runs regardless of `serverFetchedHistory`
  size; tighten docstring or pre-estimate history tokens.
- P3: `ymyl_force_human_approval` should be `console.warn` (security event), not `console.log`.
- P3: comment that `toLowerCase()` is harmless for Hebrew patterns.

## Closes
The session-long `TODO(SEC)` debt from the Vercel-unblock detour (#108).
