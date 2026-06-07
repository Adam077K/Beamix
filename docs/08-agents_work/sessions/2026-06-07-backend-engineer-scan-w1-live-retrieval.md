---
date: 2026-06-07
role: backend-engineer
task: scan-w1-live-retrieval
branch: feat/scan-w1-live-retrieval
worktree: .worktrees/scan-w1-live-retrieval
qa_verdict: pending
tier: full
linear_ticket: BMX-W1
---

# Session: BMX-W1 — Wire OpenRouter web_search plugin + retrieval_mode field, flag-gated

## What was done

Implemented live-retrieval plumbing for the scan engine pipeline behind a `SCAN_LIVE_RETRIEVAL` flag. Three files modified (additive only), four atomic commits.

## Files changed

- `apps/web/src/lib/scan/types.ts` — added `retrieval_mode`, `provider_note?`, `citations?` to `EngineRawResult`
- `apps/web/src/lib/scan/openrouter-client.ts` — added `web`/`webMaxResults` request options, `plugins` array injection, citation annotation parsing, `sourceUrls` on response
- `apps/web/src/lib/scan/engine-query.ts` — complete rewrite with `SCAN_LIVE_RETRIEVAL` flag gate, Option A engine map, honest chatgpt proxy labeling
- `apps/web/src/lib/scan/prompts.ts` — auto-fix: added default `retrieval_mode: 'parametric_memory'` to `parseEngineResult` return objects (required by updated type)
- `apps/web/src/lib/scan/analysis.test.ts` — auto-fix: added `retrieval_mode` to `EngineRawResult` fixtures
- `apps/web/src/inngest/functions/scan-free.test.ts` — auto-fix: added `retrieval_mode` to fixtures + `sourceUrls` to `makeORResponse`
- `apps/web/src/lib/scan/engine-query.test.ts` — new: 25 tests covering flag OFF/ON per engine
- `apps/web/src/lib/scan/openrouter-client.test.ts` — new: 25 tests covering plugin body shape + citation parsing

## Key decisions

- **Gemini kept parametric under flag ON**: OpenRouter's web plugin is Exa-backed (not Google's grounding API). Enabling it for gemini-2.5-flash would be a proxy rather than Google's actual search-grounded mode. Deferred to Wave 2 when Google AI Search Grounding API (Vertex) is evaluated.
- **ChatGPT proxy honest labeling**: `provider_note: 'proxy:gpt-4o-mini+web'` encodes clearly that this is NOT production ChatGPT search. Comment in engine-query.ts reinforces this.
- **`plugins` array not `:online` suffix**: The deprecated `:online` model-suffix is not used; the current `plugins: [{id:'web', max_results: N}]` contract is used instead.
- **Flag strictly `=== 'true'`**: Only the exact string `'true'` enables live retrieval; `'1'`, `'false'`, unset all fall back to parametric behavior.

## Verification

- `pnpm typecheck`: exit 0
- `pnpm test src/lib/scan` (flag OFF): 50/50 pass
- `SCAN_LIVE_RETRIEVAL=true pnpm test src/lib/scan` (flag ON): 50/50 pass
