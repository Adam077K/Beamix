# Diagnosis Engine Redesign — Measurement-Model Spec (LOCKED)

**Status:** LOCKED — spec-first gate. No code may be written for the diagnosis rebuild until this document is referenced as the source of truth.
**Owner:** CPO
**Date locked:** 2026-06-07 (Phase 0c board grill folded in same day)
**Supersedes:** the implicit measurement model embedded in `apps/web/src/lib/scan/prompts.ts` (Stage 3) and `apps/web/src/lib/scan/types.ts` (`FreeScanResults`, `AnalysisResult`).
**Related:** `docs/04-features/research/2026-06-07-diagnosis-research-brief.md` (Phase 0a — closed by 0c), `.claude/skills/beamix-scan-architecture/SKILL.md`.

---

## 0. Why we are rebuilding (problem statement, customer language)

The current scan has four measurement-validity defects that we cannot ship under the Beamix promise of "we measure AI-search visibility truthfully and fix it":

1. **2 of 3 engines recall training data, not live search.** Only Perplexity hits the live web. ChatGPT and Gemini, as currently wired, answer from parametric memory. We are presenting that as "AI search visibility" — it is not.
2. **One query decides the whole 0–100 score.** A single category-level prompt per engine determines whether the business is "mentioned." Visibility is a distribution; we are reporting a point estimate from a sample of one.
3. **"Issues" are fabricated from a label list with no evidence.** The Stage-3 prompt hands the LLM a fixed taxonomy ("Weak authority signals," "Missing structured data," "No citation sources") and asks it to pick which ones apply — with zero observation of the site, no schema check, no citation capture. The LLM hallucinates a count and we render it as a finding.
4. **Competitor and citation signal is discarded.** Engines name competitors in their answers and (for live engines) cite source URLs. Today we throw both away. They are the most actionable signal in the response.

Customer language we are accountable to (USER-INSIGHTS.md):

- "I have no idea if ChatGPT mentions us." → the score has to mean "across the prompts a buyer would actually type, here is how often you show up."
- "I'm paying for SEO and it's not reaching AI." → we have to surface the site-level reasons (schema, crawler access, citation absence) — not a label.
- "Show me proof it works." → every issue has to be defensible to a board, a buyer, and an agency client. No issue may exist without evidence.

We are rebuilding to truthfully measure AI-search visibility as a distribution and diagnose from observed evidence.

---

## Locked decisions (do not relitigate)

- **D1.** Spec-first. This doc is the gate before any code on the diagnosis rebuild.
- **D2.** Free scan = bounded-but-honest. 2 live engines + 4 queries (1 branded, scored separately) + single-page site audit + real competitor and citation capture for every call that runs. Full breadth is reserved for paid.
- **D3.** Live web retrieval for ALL engines that count toward the score. If an engine cannot run live (affordably or at all), it is dropped from the score — never faked, never silently folded in from parametric memory.
- **D4.** Free-scan vertical slice ships first. The data model is designed for both free and paid in one schema; the free slice is a subset of paid runs, never a parallel codepath.
- **D5.** The scalar visibility score is computed in code (module `scoring.ts`). The LLM never produces a number. The LLM narrates pre-derived, evidence-backed findings only.
- **D6.** Bucket labels are assigned in code, never by the LLM. LLMs expand templates into natural-sounding queries; the bucket they belong to is structural.
- **D7.** Branded queries are scored separately and never folded into the unbranded score. They are a diagnostic — "do engines know your brand exists" — not a measure of category visibility.
- **D8.** Every issue carries a mandatory `evidence` payload tied to a stored observation. The type system enforces this — there is no evidence-optional variant.
- **D9.** Every engine result carries `retrieval_mode = live_web | parametric_memory`. The UI must badge non-live engines truthfully and the score must never silently fold a parametric engine in.
- **D10.** CBO sign-off on free-tier unit cost is **GIVEN (Phase 0c)** with the conditions in §5.1 (kill-switch ceiling, scale-review trigger, key isolation).
- **D11 (0c).** Free-tier engines are LOCKED to **Perplexity Sonar (native citations) + GPT-4o-mini via OpenRouter web plugin (Exa, ~$0.005/req)** — "Option A." Dual-Sonar ("Option B") is KILLED as measurement fraud and negative-ROI. Honest labels are mandatory at the spec, adapter, and UI layer (§6.1).
- **D12 (0c).** The score is **never** displayed as a bare 2-digit integer until rerun-variance is measured. Default display is a **band or letter grade** (§3.7); point + "±SD" is only allowed when measured median rerun SD ≤ 5.
- **D13 (0c).** A **Reproducibility Gate** blocks public exposure of the new score until the variance harness has run on ~30 businesses × 5 reruns and the result is published. Variance suppression mechanisms are mandatory (§7.5).
- **D14 (0c).** An **External Validation Gate** blocks paid-tier monetisation and any "trust this number" framing until Spearman ρ ≥ 0.4 against a ground-truth signal is demonstrated (§7.6). Below the threshold → letter grade + "early indicator" framing only.
- **D15 (0c).** The result UI **leads with the Competitor Matrix.** The score and methodology caption demote to a Methodology expander below the matrix. Branded result is reframed and surfaced adjacent (§6.2).
- **D16 (0c).** Citation hostname normalisation is a **versioned, sunsetting rule** with measured false-zero rate. If false-zero rate >10% on 200 real responses, Citation weight drops 0.20 → 0.10 with the freed 0.10 reallocated to Breadth (0.15 → 0.25) until parser false-zero <5% (§3.8).
- **D17 (0c).** Wave 2 (site-audit) is launch-blocked on the SSRF-safe fetch and budget-guard requirements in §8 — these are spec-level launch gates, not engineering nice-to-haves.

---

## 1. Measurement model

### 1.1 Definition

> **AI search visibility** = the probability that, across the realistic set of prompts a customer of this business might type, an AI search engine surfaces the business — combined with the *quality* of that surfacing (rank position, sentiment, and whether the business's own domain is the cited source).

Operationally: visibility is a **distribution over (query, engine) pairs**, summarized to a scalar with **stored evidence behind every component**, and surfaced as a **band or grade** by default (D12).

### 1.2 What the distribution is, mechanically

For a single scan we observe a matrix of N queries × M engines = N·M observations. Each observation stores:

- `query_id` — references the query row (text + bucket + weight)
- `engine` — adapter id; for free tier exactly one of `perplexity_sonar` or `gpt4o_mini_web` (D11)
- `engine_label_public` — the customer-facing label this adapter MUST display (see §6.1) — stored alongside the result so historical scans render honest labels even if the public copy changes
- `retrieval_mode` — `live_web` or `parametric_memory` (per D9)
- `is_mentioned` — boolean
- `rank_position` — 1..N or null
- `rank_total` — total number of entities returned in the answer (denominator for rank quality)
- `sentiment` — `positive | neutral | negative | null`
- `competitors_named[]` — entities returned in the answer that were NOT this business
- `cited_sources[]` — URLs the engine cited (live engines only; null for parametric_memory)
- `own_domain_cited` — boolean — was the business's own domain in `cited_sources` (per the normalisation spec in §3.8)
- `raw_response` — the full text, for debug + future re-analysis
- `cache_key` / `cache_hit` — populated when served from the 14-day result cache (§7.5)

This matrix is the **single source of truth**. The scalar score, the issues, and the UI all derive from it.

### 1.3 What it explicitly is NOT

- It is **not** "did one engine mention you on one prompt." (today's failure mode)
- It is **not** "what does the LLM think your visibility is." (today's failure mode)
- It is **not** comparable across runs that used different weights or different engine sets without surfacing `weights_version` + `engine_set_id`.
- It is **not** a 0–100 integer in the UI by default — it is a band/grade until rerun-variance is bounded (D12).

---

## 2. Query set

### 2.1 Intent buckets (locked)

Every query belongs to exactly one bucket. Buckets carry a weight used in the Presence sub-score. **Branded is scored separately** — it never enters the unbranded composite (D7).

| Bucket | Weight `w_q` | Folded into composite? | Tier | Example template |
|---|---|---|---|---|
| `category_geo` | 1.0 | Yes | Free + paid | "best {category} in {location}" |
| `problem` | 1.0 | Yes | Free + paid | "{key_service} for {target_audience}" |
| `near_me` | 0.9 | Yes | Free + paid | "{category} near me" (with `location` injected at query expansion time) |
| `branded` | 0.5 | **NO — scored separately as Brand Recognition diagnostic** | Free + paid | "is {business_name} a good {category}" |
| `comparison` | 0.8 | Yes | Paid only | "{business_name} vs {top_competitor}" |
| `long_tail` | 0.7 | Yes | Paid only | "{key_service} for {target_audience} who {pain_phrase}" |

**Branded handling (D7):** the branded bucket produces a separate `brand_recognition` sub-score reported alongside `visibility`. It is never folded into the unbranded composite. When `brand_recognition` is high and `visibility` is low, that produces the `brand_recognized_category_invisible` code-derived issue and a specific UI reframe (§6.2).

### 2.2 Generation pipeline (LLM expands text, code assigns bucket)

```
BusinessContext { category, location, key_services[], target_audience }
        ↓
[code]    pick template set for tier (free: 4 templates; paid: full set)
        ↓
[code]    DETERMINISTIC PER-BUSINESS QUERY SET — same business produces
          the same expanded query strings on repeat scans (seeded LLM
          call with business_id as seed; cached after first generation).
          See §7.5 — variance suppression.
        ↓
[LLM]     expand each template into 1 natural-language query string
          (system prompt: "rewrite this template as a phrase a real
           customer would type; do not change intent; do not add buckets")
        ↓
[code]    attach bucket label + weight to each generated string
          (D6 — bucket is structural, never LLM-assigned)
        ↓
[code]    persist as `scan_queries` rows (immutable per business)
```

**Anti-pattern blocked at the type level:** the LLM expansion function returns `string`, not `{ text, bucket }`. There is no shape in which the LLM can hand back a bucket label.

### 2.3 Free-tier query set (locked)

Free scan runs exactly **4 queries** (1 branded, scored separately):

| # | Bucket | Template | Folded into visibility? |
|---|---|---|---|
| 1 | `category_geo` | "best {category} in {location}" (or "best {category}" if location = global) | Yes |
| 2 | `problem` | "{key_services[0]} for {target_audience}" | Yes |
| 3 | `near_me` | "{category} near me" with `location` injected as user-side context | Yes (skipped if location = global; replaced with second `problem` query using `key_services[1]`) |
| 4 | `branded` | "is {business_name} a good {category}" | **No — brand_recognition diagnostic only** |

So free-tier produces **3 queries × 2 engines = 6 observations** that feed the visibility composite, plus **1 branded query × 2 engines = 2 observations** for the brand_recognition diagnostic. The site audit (§5) is a separate, single fetch.

### 2.4 Paid-tier query set (structural)

Paid expands to **~15–25 queries** across all 6 buckets (exact distribution and engine list at paid-tier sign-off). Storage shape is identical; only the row counts differ. **No parallel codepath.**

---

## 3. Scoring formula

### 3.1 Where it runs (locked)

The composite score is computed in **`apps/web/src/lib/scan/scoring.ts`** — a pure function over the stored observation matrix. The LLM **does not** produce a number. The LLM narrates only, and only after the score and the code-derived findings exist (D5).

### 3.2 Inputs (from §1.2 matrix)

Let:
- `Q` = set of observations whose query bucket is folded into composite (i.e., bucket ≠ `branded`)
- `Q_mentioned ⊆ Q` = observations where `is_mentioned = true`
- `Q_live ⊆ Q` = observations where `retrieval_mode = live_web` (per D9, only live observations contribute to Citation; Presence/Rank/Breadth use all `Q` but the UI badges non-live engines)
- For each `q ∈ Q`, `w_q` = bucket weight from §2.1
- `B` = set of intent buckets present in the query set (excludes branded)

### 3.3 Sub-scores

**Presence — P ∈ [0, 1]**
```
P = Σ_{q ∈ Q} (w_q · 1[mentioned_q])  /  Σ_{q ∈ Q} w_q
```

**Rank quality — R ∈ [0, 1]**
```
R = mean over q ∈ Q_mentioned of  (rank_total_q + 1 − rank_position_q) / rank_total_q
```
Rank 1 of 5 → 1.0. Rank 5 of 5 → 0.2. If `Q_mentioned` is empty, `R = 0`.

**Citation — C ∈ [0, 1]**
```
C = (count of q ∈ Q_live where own_domain_cited = true)  /  |Q_live|
```
`own_domain_cited` is determined by the normalisation spec in §3.8. If `|Q_live| = 0`, `C = 0` and `no_live_engines_available` is flagged on the scan.

**Breadth — B_score ∈ [0, 1]**
```
B_score = (count of buckets in B with ≥1 mention across any engine)  /  |B|
```

### 3.4 Composite (default weights, versioned)

```
visibility_raw = 100 · ( 0.40·P + 0.25·R + 0.20·C + 0.15·B_score )
visibility     = clamp( round(visibility_raw), 0, 100 )
```

Weights live in `scan_scoring_config` with a `weights_version` column. Every scan stores the `weights_version` it was computed with. The weight set is **conditionally re-routed** by §3.8 (citation parser false-zero rate).

### 3.5 Stored alongside the score (mandatory)

| Field | Why |
|---|---|
| `weights_version` | Versioning of the weight set (D5) |
| `engine_set_id` | Which engines actually contributed (D9) |
| `n_queries` | Number of folded-in queries actually run |
| `n_engines` | Number of engines actually run |
| `n_live_engines` | Subset of `n_engines` with `retrieval_mode = live_web` |
| `confidence_band` | `wide | medium | narrow` — derived in code |
| `brand_recognition` | Separate scalar from branded bucket — never null, may be `n/a` if branded skipped |
| `display_mode` | `band | grade | point_with_sd` — see §3.7 |
| `display_value` | The string that the UI is permitted to render (e.g., "C", "45–60", "62 ±4") |

**Confidence band rule (code-derived):**
- `n_queries × n_live_engines < 8` → `wide`
- `8 ≤ n_queries × n_live_engines < 30` → `medium`
- `≥ 30` → `narrow`

Free tier: 3 × 2 = 6 → band = `wide`.

### 3.6 Branded excluded — restated

Branded observations never enter `P`, `R`, `C`, or `B_score`. They feed `brand_recognition` only, computed as the simple Presence formula restricted to the branded bucket.

### 3.7 Score display rule (LOCKED — D12)

The UI is permitted to render `display_value` only. The rule that produces it:

| Condition (measured globally, refreshed on each variance-harness run) | `display_mode` | What the UI shows |
|---|---|---|
| Median rerun SD across the last harness run ≤ 5 AND External Validation Gate passed (§7.6) | `point_with_sd` | `"62 ±4"` plus the methodology caption |
| Median rerun SD ≤ 5 AND External Validation Gate NOT passed | `band` | `"55–65"` (point ± 1 SD, rounded outward to a 10-pt band) plus "early indicator" copy |
| Median rerun SD > 5 OR variance harness not yet run | `grade` | `A` (80–100) `B` (60–79) `C` (40–59) `D` (20–39) `F` (0–19), plus "early indicator" copy |
| `n_live_engines = 0` for this scan | `grade` | Always — and the engine card shows the parametric badge |

**Hard UI contract:** no surface — dashboard, PDF, share-link, white-label report, embed, email digest — may render the raw integer outside `display_value`. The integer is a developer-debug field only and must not appear in any customer-facing surface unless `display_mode = point_with_sd`. QA snapshot tests enforce this (§7.7).

### 3.8 Citation hostname normalisation (LOCKED — D16, versioned, sunsetting)

`own_domain_cited` is computed by a normaliser with a stored `parser_version`. The rules:

1. **Canonical own-domain set** for a business = `{ own_apex_domain }` ∪ `{ all subdomains observed on the audited site }` ∪ `{ vanity domains registered on the business profile }`. Apex extraction uses the Public Suffix List (e.g., `clinic.example.co.uk` → apex `example.co.uk`).
2. **Normalise cited URL** before comparison: lowercase host, strip leading `www.`, IDN/punycode → unicode, resolve up to 3 redirect hops (each hop re-validated through the §8 SSRF rules) and use the *final* host, strip default ports, drop URL fragments.
3. **Third-party directories are NOT own-domain.** Stored exclusion list (versioned): `yelp.com`, `g.page`, `goo.gl/maps`, `linkedin.com`, `facebook.com`, `instagram.com`, `tripadvisor.com`, `yellowpages.com`, `bbb.org`, `clutch.co`, `g2.com`, `capterra.com`, `glassdoor.com`, plus an extensible config row. Citations to these count as "third-party mention" (stored separately for paid-tier diagnostic) but **not** as `own_domain_cited`.
4. **False-zero measurement (gating):** before Wave 1 GA, the parser is run against 200 real engine responses with human-labelled ground truth. The "false-zero rate" = the fraction of responses where the engine *did* cite the own domain but the parser said it did not.
5. **Conditional weight reroute:**
   - false-zero ≤ 10% → ship with default weights `(P 0.40, R 0.25, C 0.20, B 0.15)`.
   - false-zero > 10% → ship with **mitigated weights** `(P 0.40, R 0.25, C 0.10, B 0.25)` and a `weights_version = v1.parser-mitigated.YYYY-MM-DD` row. Parser fixes are tracked; once measured false-zero drops below 5% the spec sunsets the mitigated weights and the default weights row is re-activated.
6. **Both weight sets are versioned and historically queryable.** Re-rendering an old scan uses the `weights_version` it was computed with, not whatever is current.

---

## 4. Evidence contract

### 4.1 Type-level enforcement

No issue may be constructed without a mandatory `evidence` payload that references stored observations. This is enforced **at the type level**: the issue type has no evidence-optional variant.

```ts
// Sketch — final shape lives in apps/web/src/lib/scan/diagnosis-types.ts
export type IssueType =
  | 'not_retrieved_for_intent'
  | 'competitors_outrank_you'
  | 'missing_localbusiness_schema'
  | 'ai_crawler_blocked'
  | 'own_domain_never_cited'
  | 'no_page_targets_query'
  | 'brand_recognized_category_invisible';

export interface Issue<T extends IssueType = IssueType> {
  type: T;
  severity: 'critical' | 'high' | 'medium' | 'low';
  evidence: EvidenceFor<T>;   // mandatory — discriminated union, no optional variant
}
```

### 4.2 Issue table (free-tier minimum + paid expansions)

| Issue type | Precondition (must hold) | Evidence attached | Free or paid? |
|---|---|---|---|
| `not_retrieved_for_intent` | ≥1 observation where `bucket ∈ {category_geo, problem, near_me}` and `is_mentioned = false` for a given engine | `{ engine, bucket, query_id, query_text, observation_id }[]` | Free + paid |
| `competitors_outrank_you` | ≥1 observation where `is_mentioned = true` AND `rank_position > 3` AND `competitors_named` is non-empty | `{ engine, query_id, rank_position, rank_total, competitors_named[], observation_id }[]` | Free + paid |
| `missing_localbusiness_schema` | Site audit found `category` implies a local business AND no `LocalBusiness` JSON-LD on audited page | `{ audited_url, schemas_found[], schemas_expected[], audit_id }` | Free + paid |
| `ai_crawler_blocked` | `robots.txt` disallows any of: `GPTBot`, `Google-Extended`, `PerplexityBot`, `ClaudeBot`, `CCBot` | `{ robots_url, blocked_agents[], evidence_excerpt, audit_id }` | Free + paid |
| `own_domain_never_cited` | `Q_live` is non-empty AND no observation in `Q_live` has `own_domain_cited = true` (per §3.8 normaliser) | `{ live_observations: [{ engine, query_id, cited_sources[] }], own_domain, parser_version }` | Free + paid |
| `no_page_targets_query` | Site audit found <1 page whose visible text/headings reference `category` + `location` (or `key_services[0]`) | `{ audited_url, query_id, missing_phrases[], audit_id }` | Free + paid |
| `brand_recognized_category_invisible` | `brand_recognition ≥ 0.6` AND `visibility ≤ 30` | `{ brand_recognition, visibility, weights_version, contributing_observations[] }` | Free + paid |

### 4.3 LLM narration boundary (locked)

After the scoring module emits the matrix + the code-derived `Issue[]`, the LLM receives **only those Issues plus their evidence** and is asked to write a customer-facing sentence per issue. Any LLM-invented issue not in the code-derived set is dropped at parse time.

---

## 5. Free vs Paid scope

| Dimension | Free | Paid |
|---|---|---|
| Engines folded into composite | **Perplexity Sonar (live web) + GPT-4o-mini via OpenRouter web plugin (Exa)** (D11) | 3–5 live engines |
| Engine labels (mandatory, public) | "Perplexity Sonar (live web)" · "GPT-4o-mini (web-enabled) — proxy for ChatGPT search behavior, not ChatGPT's production search" — see §6.1 | Paid labels signed off per engine added |
| Query count (folded) | 3 | 12–24 |
| Branded queries (diagnostic) | 1 | 2–4 |
| Site audit depth | Single-page fetch of `website_url` — robots.txt + homepage HTML + JSON-LD + visible-text indexing (governed by §8) | Multi-page crawl, sitemap-aware |
| Competitor capture | Yes — `competitors_named[]` for every observation | Yes + cross-run tracking |
| Citation capture | Yes — `cited_sources[]` for every live observation, normalised per §3.8 | Yes + cited-domain frequency analysis |
| `retrieval_mode` badging in UI | Mandatory | Mandatory |
| Confidence band (computed) | `wide` | `medium` to `narrow` |
| Per-scan cost (engine layer) | ~$0.005–$0.010 (Sonar + GPT-4o-mini web plugin) — full breakdown lives in CBO ledger | Multiple of free |

### 5.1 CBO sign-off (LOCKED — D10)

CBO verdict from Phase 0c: **GO-WITH-CONDITIONS on Option A.** The conditions are spec-level and binding:

1. **Kill-switch ceiling $500/mo** of combined free-tier engine spend (~15,600 scans/mo at top-of-range per-scan cost). Engineering implements a hard counter that pauses new free scans when the rolling 30-day window crosses the ceiling, and posts to `#war-room`.
2. **Scale review at 10,000 scans/mo sustained for 2 weeks.** At that point CBO re-validates engine selection, per-call cost, and whether the kill-switch ceiling lifts. No automatic lift.
3. **OPENROUTER_SCAN_KEY isolation must be confirmed live before any merge.** Per `.claude/skills/beamix-scan-architecture/SKILL.md`, the scan key is separate from `OPENROUTER_AGENT_KEY`. Pre-merge check: the new scan adapters use only `OPENROUTER_SCAN_KEY`, and a synthetic spend report from OpenRouter confirms the split. QA-Lead verifies in the spec-compliance pass.

---

## 6. Retrieval honesty + UI contract

### 6.1 Engine labelling (LOCKED — D11)

Every adapter declares two labels: a stable internal `engine` id and a public `engine_label_public` string. The public string is stored per observation so historical scans never re-label.

| Adapter id | `engine_label_public` (verbatim — UI must render this string) | `retrieval_mode` source |
|---|---|---|
| `perplexity_sonar` | `Perplexity Sonar (live web)` | `live_web` whenever the call succeeds with native citations attached; `parametric_memory` on fallback |
| `gpt4o_mini_web` | `GPT-4o-mini (web-enabled) — proxy for ChatGPT search behavior, not ChatGPT's production search` | `live_web` whenever Exa-grounded variant returned citations; `parametric_memory` on fallback |

Forbidden phrasings — must not appear in product, marketing, PDF, white-label, share-link, or email digest:

- "We checked ChatGPT."
- "ChatGPT search results."
- "ChatGPT visibility."
- Any framing that implies the GPT-4o-mini call is OpenAI's production ChatGPT-with-search product.

This is a **product-truth** rule, not a marketing-tone preference. CMO copy review is a launch gate.

### 6.2 Result UI layout (LOCKED — D15)

The free-scan result page hierarchy, top to bottom:

1. **Competitor Matrix (HERO).** Rows = the 3 folded-in queries (category_geo / problem / near_me). Columns = the 2 engines. Cells = ranked list of names the engine returned, with the business's own row highlighted (or marked "not mentioned" if absent). All three customer archetypes ranked this #1 most persuasive — it owns the top of the page.
2. **Brand-recall vs Category-recall callout (adjacent to matrix).** Driven by `brand_recognized_category_invisible` when it fires. Copy (B2B default): **"Brand-recall 100% / Category-recall 0% — a demand-gen problem, not a brand problem."** B2C variant (selected by `BusinessContext.target_audience` heuristic — to be tightened by CMO before launch): **"AI knows you by name, not by need."** Both variants are stored as copy slots; CMO owns the final text.
3. **Evidence-led findings.** The `Issue[]` rendered as cards, each with its evidence payload visible inline (the engine query that fired it, the competitors named, the schema missing, the robots.txt excerpt).
4. **Score + methodology, demoted.** Renders `display_value` (per §3.7) — band, grade, or point+SD — with the methodology caption in a `<details>`-style expander labelled "How this is measured." Caption text: `"based on N queries across M engines (K live, band: {confidence_band}, parser: {parser_version}, weights: {weights_version})"`. The caption is **never** in the hero.
5. **Per-engine cards** (below findings). Each card shows the public engine label, the retrieval badge (green "Live AI search" or amber "Trained-knowledge answer (not live search)"), and that engine's raw answer text behind a "Show response" toggle.
6. **CTA slot** — tier-routed (§6.3).

QA snapshot tests (§7.7) enforce this order.

### 6.3 Tier-routed CTA (Wave 6 — 0c #7)

Replaces today's "book a discovery call." Routes by user state and business profile:

| User state | CTA |
|---|---|
| Anonymous, free scan complete | "Unlock paid scan — full engine set + multi-page audit" |
| Authenticated, Discover tier | "Start an agent — fix the top issue from your scan" |
| White-label agency tier | "Download client-ready PDF (evidence-led, score hidden)" — see white-label override below |

**White-label override:** for white-label agency tier, the rendered report (and the PDF) hide the numeric score entirely (regardless of `display_mode`). The Competitor Matrix and Evidence-led findings remain. This is a per-tier surface rule, not a global toggle. CTO + Design-Lead implement; QA-Lead verifies.

### 6.4 Retrieval-mode invariants

1. Adapters **never lie upward.** Fallback to `parametric_memory` writes that value.
2. Citation `C` is computed only over `Q_live`. `|Q_live| = 0` → `C = 0` and `no_live_engines_available` flagged.
3. Every engine card renders its retrieval badge. Every methodology caption renders the live count.
4. **If an engine cannot run live affordably, it is dropped — never faked, never silently included as parametric and folded in.** (D3)

---

## 7. Validity acceptance criteria (GATES, not nice-to-haves)

### 7.1 Golden-set separation

A curated set of ~20 businesses, half "known visible," half "known invisible" (Research-Lead curates, CPO approves before harness ships).

Acceptance:
- Mean `visibility_raw` of known-visible cohort ≥ 60.
- Mean `visibility_raw` of known-invisible cohort ≤ 25.
- 95th-percentile overlap between cohorts ≤ 10 points.

### 7.2 Rerun variance (baseline pre-reproducibility-gate metric)

Run the same scan 3 times within 1 hour for 10 fixed businesses.

Acceptance:
- Median absolute deviation of `visibility_raw` across the 3 runs ≤ 5 points.
- No issue type flips presence/absence across the 3 runs for ≥ 90% of businesses.

### 7.3 Evidence integrity (enforced in tests)

- 100% of issues emitted reference an `observation_id` (or `audit_id`) that exists in storage for the same scan.
- 100% of issues pass the type-level evidence requirement (compiler-enforced).
- 0 LLM-narrated issues that do not match a code-derived issue. Parse-time drop count is monitored; alert if > 0.

### 7.4 Retrieval honesty audit (enforced in tests)

- 100% of engine results have a non-null `retrieval_mode`.
- 100% of `cited_sources[]` payloads for `retrieval_mode = parametric_memory` rows are `null`.
- UI snapshot test: every engine card renders the retrieval badge; the methodology caption renders the live-count phrase.

### 7.5 Reproducibility Gate — LOCKED (D13, BLOCKING)

**Pre-go-live, blocking.** Before the new score is shown to any customer (free or paid), all of the following must be true:

1. **Variance harness run:** ~30 businesses × 5 reruns each (150 scans). **Median rerun SD must be published** in `docs/04-features/research/2026-06-XX-diagnosis-variance-baseline.md` and linked here as an Open Item closure.
2. **Deterministic query set per business:** the query expansion from §2.2 is seeded by `business_id` so reruns produce identical query strings. Implemented in `scan_queries` as immutable rows per business.
3. **Result cache, 14-day TTL:** engine results are keyed by `(business_id, query_id, engine_id, parser_version, weights_version)` and reused on rerun within 14 days. Cache-hit rate is logged per scan.
4. **`score_variance` shadow recompute:** 1% sampled real-traffic scans are re-scored with a clean cache (cache disabled for that sample) and the resulting `visibility_raw` is logged alongside the cached one. Drift over the rolling 7-day median triggers a `#war-room` alert.

Gate verdict criteria:
- Median rerun SD ≤ 5 → score may render per §3.7 mode `point_with_sd` (still subject to §7.6).
- Median rerun SD > 5 → score renders as `grade` per §3.7 until parser/query/engine changes bring SD ≤ 5 in a re-run of the harness.

### 7.6 External Validation Gate — LOCKED (D14, BLOCKING for monetisation)

**The deepest condition.** Before charging for the score, before any "trust this number" framing, and before any case-study or sales surface uses the integer:

- Run a Spearman correlation between `visibility_raw` and at least one ground-truth signal across ≥ 20 businesses where we have ground truth available. Acceptable signals (any one suffices):
  - Google Search Console "AI Overview" impressions / clicks for the target queries.
  - AI-bot referrer logs from the business's own server (GPTBot, PerplexityBot, ClaudeBot, Google-Extended).
  - Customer-reported lead-source attribution where AI search is a named bucket.
- **Pass:** Spearman ρ ≥ 0.4. → `display_mode` may use `point_with_sd` (also subject to §7.5) and copy may say "your AI-search visibility score."
- **Fail (ρ < 0.4):** `display_mode` is restricted to `grade`. Copy must say **"early indicator"** and the methodology expander must include the line *"This score is an early indicator; we are still validating it against external signals."* Monetisation is restricted to evidence-led tiers (paid scan unlock, agent runs, white-label) — never "pay for the score."

This is a launch gate, not a quarterly goal. CPO + Research-Lead publish the Spearman result in `docs/04-features/research/2026-06-XX-diagnosis-external-validation.md` before the score's first customer-facing render.

### 7.7 Display-rule enforcement (test-level)

- Snapshot test: dashboard, PDF, share-link, white-label PDF, email digest, embed iframe. None may render the raw integer outside `display_value`.
- White-label PDF test: no `display_value` rendered at all (§6.3 white-label override).
- Forbidden-phrase test: no rendered surface contains any phrase from §6.1's forbidden-phrasings list (CI grep + UI snapshot).

---

## 8. Security & abuse requirements (LOCKED — D17, LAUNCH-BLOCKING)

Wave 2 (site-audit) and the free-scan public entry-point cannot ship without the following. Full implementation detail lives in the CTO dispatch packet; this spec names them as launch gates so they are not negotiable downstream.

### 8.1 SSRF-safe site-audit fetcher (blocks Wave 2)

- IP-class denylist on every request and **on every redirect hop after re-resolution.** Blocks: RFC1918 (`10/8`, `172.16/12`, `192.168/16`), loopback (`127/8`, `::1`), link-local (`169.254/16`, `fe80::/10`), multicast, broadcast, reserved, cloud metadata (`169.254.169.254`, `fd00:ec2::254`), and **IPv4-mapped IPv6** (`::ffff:0:0/96`) — explicitly named because this is the common bypass.
- Per-hop DNS re-resolution. The host header from the redirect URL is re-resolved and re-checked against the denylist. Hops capped at 3.
- Caps: response body ≤ **2 MB**, total request time ≤ **8 s**, total bytes per audit ≤ **8 MB** (homepage + robots.txt + schema fetches combined). Connection timeout 3 s, read timeout 5 s.
- Method allowlist: `GET`, `HEAD`. Schemes: `https`, `http` (http only on the audited URL itself; redirects from https → http blocked).
- User-agent set to `BeamixAuditBot/1.0 (+https://beamixai.com/bots)`; logged per audit.

### 8.2 Free-scan budget guard (blocks free-scan public surface)

- **Atomic pre-call counter** in Redis (or Supabase-backed equivalent) decremented before the engine calls fire. If the rolling 30-day spend (or scan-count proxy) is at or above the §5.1 kill-switch ceiling, the scan is rejected before any paid API call.
- **Per-/24 subnet rate limit** on the free-scan endpoint (default: 20 scans/hour/subnet, configurable). Logged and alerted at 80% of the threshold.
- **Single-use Cloudflare Turnstile token** required on every free-scan request. Tokens are bound to `(scan_id, ip_subnet)`, single-use, 5-minute expiry. Replay attempts return 409.
- Authenticated paid scans bypass the subnet rate limit but still pass through the atomic pre-call counter for unit-cost accounting.

### 8.3 Verification gate

QA-Lead, in the spec-compliance pass, MUST confirm:
- SSRF denylist test suite (including IPv4-mapped IPv6 case) passes.
- Budget guard test: simulated 20-req burst from one /24 returns 429 with no engine calls fired.
- Turnstile replay test returns 409.
- Synthetic OpenRouter spend report shows the scan adapters use `OPENROUTER_SCAN_KEY` only (per §5.1 #3).

Without all four green, the free-scan rebuild does not merge.

---

## 9. Document control

- **Locked decisions** (top of doc) are not re-opened in side conversations. If an engineer or agent believes a locked decision must change, they file an ADR in `docs/03-system-design/adrs/` and CPO routes it through CEO.
- **Schema changes** implied by this spec (`scan_observations`, `scan_queries`, `scan_audits`, `scan_scoring_config`, `scan_result_cache`, retrieval-mode columns, `display_mode`/`display_value` columns) are owned by CTO → database-engineer. Sequence: DB migration → adapter changes → scoring module → narration → UI badge + matrix work → security/budget guard → variance harness → external-validation report. CTO writes the wave plan.
- **No code on the diagnosis rebuild may merge** without referencing this document by path in the PR description and citing the section it implements.
- **Customer-facing copy** (engine labels §6.1, callout strings §6.2, methodology caption §6.2, CTA strings §6.3, "early indicator" copy §7.6) is CMO-owned. Any edits to those strings ship through CMO and are reflected here in the same PR.
