# Scan & Measurement Model — v2 (authoritative, 2026-06-08)

**Status:** LOCKED source-of-truth for the scan/diagnosis rebuild. Supersedes the partial specs as the build reference; they remain as inputs: `DIAGNOSIS-REDESIGN.md` (measurement-model v1 + Phase-0 grill), `SCAN-ORCHESTRATION.md` (pipeline/flow lock), `research/2026-06-08-scan-rethink-synthesis.md` (the 10-agent rethink). Founder decisions folded in 2026-06-08.

> One line: **the scan's product is a prioritized "what you're missing vs the competitors AI names" checklist; the score is the hook; the moat is that we run before/after experiments no measurement-only tool can.**

---

## 1. What we measure

A business's AI visibility = **how often, and in what shape, an AI helps you when a real customer asks** — measured with neutral, brand-blind probes, scored in code, every claim evidence-bound.

**Six dimensions, each computed in code from the raw engine answer:**
1. **Presence** — named at all (rate across the query set).
2. **Position** — when named, how prominent.
3. **Context/Sentiment** — when named, does it help you (the one allowed LLM-judge call, over a preserved snippet).
4. **Cited-as-source** — is your *domain* a source the engine leaned on (split from "mention" — different things).
5. **Share-of-Voice** — how loud you are vs the competitors the engine itself names.
6. **Breadth** — across how many intent buckets and answer-shapes you win.

**Answer-shape-aware.** Every dimension is conditioned on the shape of the answer. "Mentioned" is not "winning" — winning is shape-dependent. The 12 shapes, each with its own WIN / PARTIAL / LOSS rule: ranked listicle · single recommendation · comparison · negative/"avoid" · cited-as-source · passing mention · category-defining · "do your own research" deflection · tool-vs-service-vs-product · local-pack · navigational/branded · no-answer.

**Representation = Band + Profile + Gap-list (triple), not one number:**
- **Band** (headline) — a presence/position range with a real confidence interval, e.g. "27 (22–31)". NOT a bare point.
- **Profile** — the six dimensions × intent-bucket × shape breakdown.
- **Gap-list** — the product (§3).

**Sequencing caveat (locked):** ship the **band as presence/position only**. Shape and sentiment are unvalidated multipliers today (no academic taxonomy; sentiment is a noisy single-snippet judge; multiplying two noisy estimates and hiding it in a CI is dishonest). Shape/sentiment ride as **annotations** in the Profile and Gap-list (they explain *why* a query is a loss and route agency work) and do **not move the headline** until each clears a gold-set.

---

## 2. Fact vs inference (the honesty spine — enforced in schema, not convention)

Every signal carries a truth-class:
- **FACT** — we fetched the bytes (no schema; 0 reviews; no Wikidata entity). Stated plainly.
- **OBSERVATION** — what an engine said today, this sample. Always shown with sample size, CI, date, pinned model id.
- **HYPOTHESIS** — any "why" claim. Must reference an underlying FACT + a sourced correlation + a confidence word. **Banned:** "you're invisible BECAUSE X"; "doing X WILL raise your score Y%".

The gap-list is ordered by **contrastive observed fact** (competitors AI names in *your* query set have this, you don't) + fixability + effort — **never** by borrowed vendor correlations. Impact weights live in a versioned `factor_catalog` config table (not code), so our own pilot data overwrites vendor priors without a deploy. This is the line between "rebranded SEO checklist" and a defensible product.

---

## 3. The post-scan gap checklist (the product; feeds the agency)

~18 factors, each detected as an **observed fact** ("you have NOT done X" is externally checkable). Detected via L1 site-crawl or L2 off-engine API. Each maps to an agent playbook.

**Tier 1 — PROVEN, fast/medium fix (lead here):** on-page Princeton tactics (stats/quotes/cited-sources/answer-first — +30-40%/tactic, KDD 2024) · extractable structure (TL;DR/FAQ/heading hierarchy, citations cluster in first 30%) · content freshness (visible dateModified; ~4.5-wk citation half-life) · third-party listicle inclusion (21-41% of commercial citations) · Reddit/Quora presence (Reddit #1 cited domain, ~40%) · review systems (volume/recency across Google+G2/Capterra/Trustpilot, 3.4× citation) · earned media/digital PR (82% of AI citations) · Wikidata entity · AI-bot allowlist (robots not blocking GPTBot/PerplexityBot/ClaudeBot/Google-Extended — blocked = invisible).

**Tier 2 — LIKELY (moderate impact):** topical-authority cluster · LinkedIn presence · YouTube (Perplexity #1) · basic schema (Organization/Product/FAQ/Review).

**Tier 3 — hygiene, NEVER promise lift:** llms.txt (n=300k: no measurable impact) · schema beyond basics (minimal) · backlinks/DR (3× weaker than mentions — do NOT repackage SEO link-building as GEO; the category's #1 sin).

**Agent mapping:** the four existing agent enum values (content_optimizer, schema_generator, review_presence_planner, reddit_presence_planner) cover ~80% of agentable gaps via a `playbook_id` discriminator. **No enum migration for MVP.**

---

## 4. Scan unit & cadence — four layers, four speeds

| Layer | What | Truth-class | Cadence | UI label |
|---|---|---|---|---|
| **L1 Base audit** | schema, robots, sitemap, meta, llms.txt, reviews, Wikidata, Reddit/listicle/social presence | FACT | once + on-change; per-type TTL (site wk→mo, reviews/reddit wk, wikidata/backlinks mo) | "Observed [date]" |
| **L2 Engine probes** | 6 dimensions × shapes, 4-6 engines | OBSERVATION | daily-light (20% subsample, change-detect) + weekly-deep (full, N≥5, Wilson CI) | "Band 22-31 (P50 27), as of [date]" |
| **L3 Time-series** | trends over L1/L2/L4 | DERIVED | continuous read-model | "Trend" — only after a significance test |
| **L4 Passive telemetry** | AI-bot crawl logs, GSC AI-Overview referrals, referrer headers, "how did you hear" survey | FACT (at source) | continuous/event | "Measured at source" |

**Refresh discipline:** (1) never hold a known-stale headline behind a quiet flag — when daily-light change-detection trips, the headline visibly shows "refreshing." (2) Kill the bare trend arrow — a trend renders only after a paired/CUSUM significance test; else "no significant change (within noise band)." Most ±6 moves are noise.

**Free scan stays** = one deep L2 run + a cold L1 audit, framed as a diagnostic snapshot (honors the locked "free one-time scan remains").

**Cost is a pricing gate, not a detail:** naive (4 engines × 50 q × N5 × daily) ≈ $300/mo/business — unsustainable at $79. Daily-light + weekly-deep + 6h prompt cache + industry-shared-query amortization cuts ~70%. Treat as a unit-economics gate.

---

## 5. Orchestration (carried from the 2026-06-08 lock)

4-stage pipeline: **(1) context + query set** (reuse cached context + saved `tracked_queries` for returning businesses) → **(2) neutral probe** (engine gets only the real-user query; NO business name / NO "is X mentioned" / NO JSON envelope; client detected in code after; lint-gate fails the scan if the name/domain leaks) → **(3) code extraction + code scoring** (no LLM picks mention/rank/score) → **(4) one evidence-bound narration** (Haiku free / Sonnet paid; can't invent issues or numbers; cheap code check that any quoted engine line really appears in raw_response).

**Structural firewall:** probe runs as its own job on `OPENROUTER_SCAN_KEY`, RLS-blocked from the identity row — physically can't leak the business. Narration runs on the separate agent key over the stored evidence only.

**Always show a fresh number** (founder lock): reuse cached *context + queries* for cost, but the displayed score/issues are always from a fresh probe. Engine-result caching deferred (cost-only if ever; or prove equivalence first). **"Why they beat you" = evidence we verified**, never the engine's confabulated stated reason (shown at most as a labeled "AI's guess").

---

## 6. The moat — before/after experiments (founder-locked, from client #1)

Because Beamix *does the work*, we can run **switchback experiments**: change one factor, hold the rest, re-probe with N≥5 + held-out controls, and measure **per-client causal lift** ("adding Wikidata moved your comparison-bucket presence 0.18→0.34, ΔCI excludes 0"). No observation-only tool can do this. Aggregated across clients × weeks it becomes the only real causal-weight dataset in the category and upgrades every `impact_weight` from "vendor-estimated" to "Beamix-measured." Baked into the agency workflow from client #1.

---

## 7. Proof-of-work to clients (founder decision 2026-06-08)

**Both — score gains AND real traffic — but lead with score gains early, shift toward real-traffic as L4 data accrues.** Hard rule: any probe-score delta shown as proof must **pass a significance test** (never claim credit for noise). As GSC AI-referrals / bot-hits / "how did you hear" accumulate, real-traffic deltas become the primary proof (honest, hard to game, best for renewals).

---

## 8. New ideas — adopt later

Agentic-buyability ("would a buyer-agent shortlist + transact with you" — start cheap: shortlist + price/CTA findability + dead-end detection via Playwright; defer real transactions) · buyer-journey survival curves (multi-turn neutral journeys; which turn you're eliminated) · brand-knowledge fidelity (AI gets your price/category wrong → a second product line: "correct the record").

---

## 9. What stays vs changes

**Stays (now marketable moats — advertise them):** no-leak neutral probing (competitors quietly violate it) · code-computes-the-number, LLM-narrates-only · evidence-bound claims (now FACT/OBSERVATION/HYPOTHESIS in schema) · free one-time scan · the 4-agent enum + inbox/suggestion human-confirm gate (ship MVP on `playbook_id`, no enum migration). Waves 1-2 (live retrieval, competitor capture, SSRF site audit) are all reused.

**Changes:** single 0-100 score → Band + Profile + Gap-list · flat 4-weight formula → 6 dimensions, shape-conditioned (shape/sentiment annotate, don't yet multiply the headline) · presence/citation split into two dimensions · one scan → L1-L4 · score asserted as truth → band+CI, gated against L4 before it headlines · engines averaged → per-engine subscores (never one cross-engine "truth"; ~11% source overlap) · gap ranking by borrowed correlation → by contrastive observed fact + fixability + effort.

---

## 10. Schema implications for Wave 3 (Irreversible migration)

Reuse existing unwired tables; do NOT invent duplicates:
- `query_positions` = the probe/observation ledger — add `evidence_id` PK + `sample_n`, `ci_low`, `ci_high`, `model_id`, `run_kind`.
- `scan_engine_results` = raw store — add `shape`, `shape_outcome`, `sentiment`.
- New: `business_contexts` (L1 cache, 30d TTL, invalidate on profile edit, `built_from_scan_id`); `telemetry_events` (L4); `factor_catalog` (versioned impact weights, config not code); wire `tracked_queries`.
- Free scan stays anonymous JSONB blob.
Tier: `risk:full`→`risk:irreversible` (new tables + migration) — QA-Lead PASS + Adam sign-off. **Sequence after the model is documented (this file) and before scoring/diagnosis waves.**

---

## 11. Build sequencing (then build with workflows)

Document (this file) → then build via the coding workflow per wave, each through the binding `qa.js` gate:
- **W3** DB migration (Irreversible) — the schema in §10.
- **W4** L1 base audit + factor detection (the FACT layer + gap-list detection).
- **W5** L2 probe v2 (6 dimensions + answer-shape classifier) + code scoring (band+CI).
- **W6** Gap-list (contrastive ordering) → agent playbook mapping; narration v2.
- **W7** Profile/Gap UI (competitor matrix hero, band, shape annotations).
- **W8** L4 telemetry + the calibration/validation gate; switchback-experiment harness.
- **W2b** budget/abuse guard — gates flipping `SCAN_LIVE_RETRIEVAL` on in prod (still required).

Validation gate (rerun variance SD≤5, measured cache-OFF; and L4 ground-truth calibration) earns the headline score; the gap-list ships ahead of it.
