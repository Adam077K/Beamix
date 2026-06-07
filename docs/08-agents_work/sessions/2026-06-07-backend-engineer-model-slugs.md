---
role: backend-engineer
task: fix-model-slugs
date: 2026-06-07
branch: fix/scan-model-slugs
tier: full
qa_verdict: PASS
qa_lead_verdict: "PASS (Lite) — slug-string-only change; zero retired slugs in executable code; MODEL_ROUTER consistent. P3: reconcile gemini-2.5-flash pricing post-invoice."
tsc_exit: 0
lint_exit: 0
vitest_exit: 0
---

## Task

Update stale OpenRouter model slugs that caused `upstream_api_error` on Gemini during a live production scan of imagen-ai.com.

## Slugs changed

| Location | Before | After |
|---|---|---|
| `engine-query.ts` gemini | `google/gemini-2.0-flash` | `google/gemini-2.5-flash` |
| `engine-query.ts` perplexity | `perplexity/llama-3.1-sonar-large-128k-online` | `perplexity/sonar` |
| `analysis.ts` ANALYSIS_MODEL | `google/gemini-2.0-flash` | `google/gemini-2.5-flash` |
| `perplexity-research.ts` RESEARCH_MODEL | `perplexity/llama-3.1-sonar-large-128k-online` | `perplexity/sonar` |
| `agents/config/models.ts` MODEL_ROUTER + MODEL_PRICING | `google/gemini-2.0-flash` (x3) | `google/gemini-2.5-flash` |

GPT-4o (`openai/gpt-4o`) confirmed present in live list — kept unchanged.

## Verification

Slugs verified against live OpenRouter `/api/v1/models` list on 2026-06-07 before applying. All chosen slugs confirmed present (not preview, not :free, not lite).

## Files changed

- `apps/web/src/lib/scan/engine-query.ts`
- `apps/web/src/lib/scan/analysis.ts`
- `apps/web/src/lib/scan/perplexity-research.ts`
- `apps/web/src/lib/agents/config/models.ts`
- `docs/ENGINEERING_PRINCIPLES.md`
