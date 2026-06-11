---
date: 2026-06-11
role: ceo
task: wave-7-scan-wiring
tier: full
qa_verdict: PASS
branch: feat/w7-scan-wiring
workers_spawned: [backend-engineer, backend-engineer, frontend-engineer, backend-engineer]
---

# Wave 7 — Wire v2 measurement into the live free scan (flag-gated OFF in prod)

The first BEHAVIORAL wave: the W4/W5/W6 measurement libraries are now assembled into the live free-scan flow, behind `SCAN_MEASUREMENT_V2` (env flag, **default OFF in prod** → v1 byte-identical). 17 files, +4,175/−82, 650 passing tests. Full tier (`apps/web/src/inngest/**` floor). Free scan stays an anonymous JSONB blob — no normalized-table writes (spec rule).

## What shipped
- **Narration hardening** — cleared the 4 W6 gating blockers (empty-knownCompetitors competitor-grounding bypass; substring→word-boundary number grounding; PII raw-response log removed; dead `opts.now`).
- `competitor-audit.ts` — `selectTopCompetitors` (cross-engine frequency, client-excluded) + `auditCompetitors` (bounded, per-competitor try/catch skip, injected `auditSite`/`detectFactors`).
- `assemble-free-scan-v2.ts` — pure injectable orchestrator: per engine×query `buildNeutralProbe`→`assertProbeClean` (FAIL-CLOSED, `ProbeLeakError` propagates)→probe→code detect/shape→sentiment judge→`computeDimensions`→`scoreEngine`; client `auditSite`+`detectFactors`+`buildGapList`; competitor audits; `buildContrastiveGapList`→`mapGapsToPlaybooks`; `narrate`; `headline_band = medianAcrossEngines` (LABELED secondary, never "the truth"); ≥2/3-engine degraded handling. Engine probes + sentiment calls run in parallel (`Promise.all`) — fail-closed leak preserved (leak rejects the batch), per-engine soft failures caught (resolved "failed" marker), stable engine order.
- `scan-free.ts` + `scan-free-v2-deps.ts` — flag-gated v2 path (flag read ONCE at entry → retry-safe); supplies the real deps (probe on `OPENROUTER_SCAN_KEY`, `auditSite`, `detectFactors`, `loadFactorCatalog`); blob keeps legacy fields (`visibility_score`=headline_band.point, issues/total_issues from gap_list, engines_checked) + adds `scan_v2`. v1 path byte-identical when flag OFF.
- Results page (`scan/[scan_id]`) — renders `scan_v2` progressively (banded headline labeled "median across engines"; per-engine subscores; lift-vs-hygiene gap checklist with playbook chips; low_confidence/degraded/impact_fallback honesty labels; competitors when present; narration). v1 fallback when `scan_v2` absent.

## QA — binding qa.js Full gate
- Built via 3 workers (composable core → scan-free wiring → results UI); 2 worker stalls recovered (committed work + CEO finished the dangling test / narrow SendMessage resume). CEO re-ran typecheck/test/`next build` in-worktree at each tip; branch verified vs GitHub truth.
- Gate #1 (`b119032`): **BLOCK** — one confirmed, judge-reproduced P1: the flag=ON Inngest branch had zero function-level test coverage. Fixed in `96432d0`: `scan-free.test.ts` flag=ON block asserting (a) `scan-v2-assemble` invoked once, (b) v1 steps skipped, (c) early-return + persist, (d) `ProbeLeakError`→mark-failed, (e) writes only `free_scans` (no `query_positions`/`scan_engine_results`), + flag-OFF regression guard. Also parallelized probes/sentiment, sanitized `factor_key`, flag-once-at-entry.
- Gate #2 (`96432d0`, merge candidate): **PASS**, 0 block-eligible, no coverage gap.

## Flag-flip readiness checklist (clear BEFORE SCAN_MEASUREMENT_V2 goes ON in prod — NOT blockers for this dormant-code merge)
13 gate-2 advisories, all non-blocking (flag OFF = no user impact). Highest value:
1. `ProbeLeakError` → wrap as `NonRetriableError` in scan-free.ts (deterministic failure shouldn't burn 2 retries).
2. `FreeScanResults.scan_v2` typed `any` → a validated type at the persistence read site.
3. `SCAN_LIVE_RETRIEVAL=true` branch in `buildV2Deps` — add test coverage.
4. Parallelize the independent client site-audit + catalog-load awaits (`assemble-free-scan-v2.ts`).
5. Competitor-domain resolver still null (from W7) → gap-list runs in honest `impact_fallback`; wire a citation-based resolver to light up real contrastive auditing.
6. Carry-over zero-risk items: degraded-placeholder coverage; clean-run `degraded===false` assertion; `location` into the narration grounding corpus (needs a `NarrationInput` type change); minor dead-code/log-truncation/regex-hoist nits.

## Deferred (next waves)
- Flip readiness (above) → then SCAN_MEASUREMENT_V2 on in staging → prod (with W2b budget/abuse guard, which still gates `SCAN_LIVE_RETRIEVAL`).
- Authenticated recurring scans (normalized `query_positions`/`scan_engine_results` persistence) — the free scan stays a blob; the recurring path is a later wave.
- Score go-live gates unchanged (variance SD≤5 cache-OFF; external ρ≥0.4) gate the SCORE, not the gap-list.
