# Scan Orchestration — pipeline, model-routing, state (LOCKED 2026-06-08)

Companion to `DIAGNOSIS-REDESIGN.md` (the WHAT/measurement model). This is the HOW: stages, the no-leak probe, model-routing, and state. Synthesized from 3 competing designs (purity-first / cost-state-first / report-separation) + 3 critics (validity adversary, CBO, system architect) + 2 founder decisions.

## The pipeline — 4 stages

1. **Context + query set.** First scan: research the business (Perplexity Sonar) → BusinessContext. Returning business: **read cached context + saved `tracked_queries`** (no re-research). Queries generated once, reused forever (so position trends are comparable).
2. **Neutral engine probe.** Send each engine ONLY the query a real user types ("best {category} in {location}"). **No business name, no "is X mentioned", no JSON envelope, no roleplay.** Capture the raw answer + citations.
3. **Code extraction + code scoring.** Our code (not an LLM) detects whether the business appeared, its rank, sentiment, and which competitors emerged — and computes the score per `DIAGNOSIS-REDESIGN.md`. No LLM produces a number or a mention verdict.
4. **Evidence-bound narration.** One LLM call writes the findings in plain language — every sentence must reference a stored observation; it cannot invent issues or numbers. Haiku on free tier, Sonnet on paid.

## The firewall is STRUCTURAL, not a convention

- Stage 2 (probe) runs as its **own Inngest function on `OPENROUTER_SCAN_KEY`** and **cannot read the business-identity row** (RLS on its service role). It is physically impossible for the probe to leak the business name to the engine.
- Stage 4 (narration) runs on the separate agent key and only ever sees the stored evidence ledger — never the probe prompts, never the raw engine call.

## No-leak probe contract (the measurement-validity core)

- The probe prompt is the **neutral user query only**. The current `buildEnginePrompt` (names the business + asks "is X mentioned" + forces a top-5 JSON) is the exact contamination we remove — telling the engine the answer, or forcing a ranked list it wouldn't volunteer, biases the measurement.
- Client detection happens **after**, in code (string/alias match against the raw response).
- **Lint gate:** assert the probe prompt contains neither the business name nor its domain; fail the scan rather than leak.
- Branded queries are the one identity-bearing probe — scored SEPARATELY as a brand-recognition diagnostic, never folded into visibility (already locked).

## The two founder decisions (2026-06-08)

- **Always show a fresh number.** Reuse cached *context + queries* to save cost, but the score/issues we DISPLAY always come from a fresh probe. We do NOT show a cached (up-to-N-day-old) score as the current weekly number. Engine-result caching is **deferred** — if adopted later it is cost-only and must never back the displayed measurement (or be proven equivalent: rerun study ρ≥0.9, |Δ|≤3 first).
- **"Why they beat you" = evidence we verified.** The causal "why" is built from observed facts (competitor has schema/reviews/citations you lack — from the site audit + who the engines cite). The engine's OWN stated reason is **confabulated** (LLMs have no introspective access to their retrieval) and may be shown only as a clearly-labeled "what the AI said" guess — never as the finding or the basis for a recommended action.

## Model routing

| Stage | Model | Why |
|-------|-------|-----|
| Context research | Perplexity Sonar (live, cited) | cheap, cached per business |
| Query generation | gpt-4o-mini / Gemini Flash, temp 0 + business-id seed | deterministic, one-time per business |
| Engine probe | Perplexity Sonar + GPT-4o-mini(+web) | live retrieval, honest labels (Option A, locked) |
| Extraction + scoring | **code, no LLM** | the locked ground-truth principle |
| Narration | Haiku (free) / Sonnet (paid) | LLM narrates code-derived issues only; the spec makes this a small job, so the Sonnet-vs-cheap delta is ~$0.009/scan |

- **Cut** the separate LLM "verifier" (Haiku-checking-Sonnet = correlated-error theater). **Keep** the cheap *code* check that any quoted engine text actually appears in the raw response (deterministic, blocking).
- A blinded second LLM extractor (sees the response but NOT the business name) is the fallback if code extraction proves unreliable — deferred, reversible, gated by a parser-agreement check (κ≥0.8).

## Schema — reuse, don't duplicate (drives Wave 3 migration)

- The existing unwired **`query_positions`** IS the observation ledger — add a stable `evidence_id` PK. The existing **`scan_engine_results`** is the raw-response store. **Do NOT create new `scan_observations` / `scan_result_cache` tables.** This avoids migrating twice.
- Add **`business_contexts`** (cached context, **30-day** TTL — not 90; invalidate on profile edit) and wire **`tracked_queries`**.
- Free scan stays the anonymous JSONB blob; do not normalize free scans into these tables.

## Variance gate

The rerun-variance gate (SD≤5) must be measured with **caching OFF** — otherwise cached identical rows fake a zero variance ("a thermometer in a thermos").

## Defer list (ship later, with a trigger)

14-day engine-result cache (until proven equivalent or scoped cost-only) · site-audit ETag cache · narration cache · 1% shadow-recompute · LLM verifier · separate LLM extractor · forced-fresh round-robin · multi-cache state machine. None block the next waves.

## Failure modes locked

- Partial engine failure (1 of N down) → mark scan **`degraded`/`partial`** and gate narration behind a success threshold (e.g. ≥2/3 engines). Never silently complete a half-sampled score.
- Inngest: 4 stages keeps Free-tier step headroom; move to Inngest Pro at ~5 paying customers.
- Stale context poisoning → 30-day TTL + invalidate on profile edit + `built_from_scan_id` traceability.
