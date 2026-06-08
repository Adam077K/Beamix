# Scan Rethink — Workflow Synthesis (2026-06-08)

_Opus judge synthesis from a 10-agent workflow (wf_94614e3c-79c): 4 web researchers (SOTA, causal factors, answer-type taxonomy, validity) -> 3 designers -> adversary + visionary critics -> judge. Full designs/critiques in the workflow transcript._

This is a synthesis task. I have all the inputs I need — four research briefs, three designs, two critiques. No file reads required. Let me produce the founder-ready synthesis directly.

---

# Beamix Measurement Model — Synthesis & Decision Brief

The four research dossiers, three designs, and two critiques converge on one conclusion: your founder instinct was right on all five concerns, but the first design instinct (build a richer score) is half-wrong. The richer score is a trap. The real product is the gap checklist, and the real moat is that you are the agency that can run experiments no tool can run. Here is the sharp version.

---

## 1. THE BIG REFRAMES — five shifts in the locked thinking

**Reframe 1 — Visibility is a profile, not a number.**
Before: one 0-100 score = 0.40·Presence + 0.25·Rank + 0.20·Citation + 0.15·Breadth.
After: a *band with a confidence interval* (e.g. "22–31, P50 27") as the glanceable headline, sitting on top of a per-dimension, per-intent-bucket profile. The single number was a marketing artifact that hid exactly the information the agency needs to act. SparkToro proved AI returns the identical brand list less than 1% of the time; a bare point is false precision. This is non-negotiable and every source agrees.

**Reframe 2 — "Mentioned" is not "winning." Winning is shape-dependent.**
Before: presence=true is a win; rank is the quality measure.
After: the same answer can be a win or a catastrophe depending on its *shape*. Ranked #1 in a listicle titled "5 GEO tools to AVOID" is a disaster the old formula scored as a perfect win. A "do your own research" deflection where competitors get named is a loss; where nobody gets named it is a neutral tie. This answer-shape layer is the single biggest open lane in the entire market — no incumbent classifies it. It is also your most defensible differentiation *on the measurement side*.

**Reframe 3 — The gap checklist is the product; the score is the hook.**
Before: the scan produces a score; the agency then "does work."
After: the scan's primary output is a ranked, observed-fact list of "things you have NOT done that businesses who outrank you HAVE done." That list *is* the agency's invoice line items and the agents' task queue. The score gets you in the door; the checklist is what you sell and execute. Every "LOSS" row becomes an agent job.

**Reframe 4 — It is not one scan. It is four signal layers at four cadences.**
Before: one monolithic scan.
After: L1 base audit (slow facts, crawled, on-change) + L2 engine probes (volatile, daily-light/weekly-deep, banded) + L3 time-series (derived trend) + L4 passive telemetry (continuous, real-user ground truth). The free one-time scan is a thin slice (L1 + one light L2 run) used as the funnel hook. The paid agency relationship is the recurring loop. "One scan" was a free-funnel artifact mistaken for an architecture.

**Reframe 5 — Honesty has to live in the numbers that move, not in the badges next to them.**
Before (and the first design's flaw): build a beautiful FACT/OBSERVATION/INFERENCE labeling system, then quietly re-import unproven causal correlations as the *ranking function* that orders the invoice. The adversary caught this cleanly. After: the gap list is ordered by *contrastive observed fact* (what your engine-named competitors have and you don't) plus agency-fixability plus effort — NOT by borrowed correlation coefficients (r=0.664 etc., which all four researchers flagged as MEDIUM-to-LOW, vendor-sourced, no methodology). Causal priors are a hint, never the ordering math, until your own pilot calibrates them.

---

## 2. RECOMMENDED MEASUREMENT MODEL (plain language)

We measure, per business, **how often and in what shape an AI helps you when a real customer asks** — using neutral, brand-blind queries, code-computed scoring, every claim evidence-bound. The headline is a band, the diagnosis is a profile, and the product is a checklist.

**What we measure (six dimensions, each computed in code from the raw answer):**
1. **Presence** — are you named at all (boolean → rate across the query set)?
2. **Position** — when named, how prominent (rank in a list, paragraph order)?
3. **Context/Sentiment** — when named, does it help you (the one place an LLM judge is allowed, over a preserved snippet)?
4. **Cited-as-source** — is your *domain* a source the engine leaned on (split from mention — they are different things)?
5. **Share-of-Voice** — how loud are you vs. the competitors the engine *itself* names (captured, not supplied)?
6. **Breadth** — across how many intent buckets and shapes do you win?

**Answer-type-aware:** every dimension is conditioned on the answer's *shape* (listicle / single-recommendation / comparison / negative / cited-source / passing / category-proxy / deflection / segment-mismatch / local-pack / navigational / no-answer). Each shape has its own WIN/PARTIAL/LOSS definition.

**Fact-vs-inference honest (the spine, enforced in DB schema, not convention):**
- **FACT** — we fetched the bytes (schema, reviews count, no Wikidata entity). Stated plainly.
- **OBSERVATION** — what an engine said today, this sample. Always shown with sample size, CI, date, and pinned model ID.
- **HYPOTHESIS** — any "why" claim. Must point to an underlying FACT + a sourced correlation + a confidence word. Banned: "you're invisible BECAUSE X" and "doing X WILL raise your score by Y%."

**The critical sequencing call (from the adversary, and I agree):** ship the Band as a **presence/position band only** at first — the one thing measurable at N≥5 with an honest, propagated CI. Shape and sentiment are *unvalidated multipliers* today (no academic taxonomy; sentiment is a single-snippet Haiku judge with its own un-budgeted error; multiplying two noisy estimates makes the product noisier than either, and the Wilson CI does NOT currently propagate that error). So shape and sentiment ride along as **descriptive annotations in the Profile and Gap-list** — they explain *why* a query is a loss and route the agency's work — but they do **not silently move the headline** until each clears its gold-set. This keeps the headline defensible on day one.

---

## 3. THE POST-SCAN GAP CHECKLIST (the canonical factor list that feeds the agency)

Eighteen factors, each detected as an **observed fact** ("you have NOT done X" is always externally checkable — that is what makes it honest). Detection is L1 site-crawl or L2 off-engine API. Ranked by the honest formula (see decision in §7), with confidence multiplied in so folklore *literally cannot rank high*.

**Tier 1 — PROVEN factors, fast/medium fix (lead with these):**
- On-page Princeton tactics — statistics, quotes, cited sources, answer-first first-200-words (+30-40% per tactic, KDD 2024, the one academic result). Agent: content_optimizer.
- Extractable structure — TL;DR, FAQ, heading hierarchy, first-30% density (Zyppy: 44.2% of citations in first 30%). content_optimizer.
- Content freshness — visible dateModified, ≤13-week half-life on commercial pages (4.5-week median half-life). content_optimizer.
- Listicle inclusion — named in third-party "best-of" lists (21.9–40.86% of commercial citations). content_optimizer (outreach).
- Reddit/Quora presence — organic, niche subs (Reddit is the #1 cited domain, 40.1%; 4× lift). reddit_presence_planner.
- Review systems — volume/recency/descriptive content across Google + G2/Capterra/Trustpilot (3.4× ChatGPT citation, +41% multi-platform). review_presence_planner.
- Earned media / digital PR — 82% of AI citations are earned media. reddit_presence_planner (outreach).
- Wikidata entity — lower bar than Wikipedia, feeds knowledge graphs. schema_generator.
- AI-bot allowlist — robots.txt not blocking GPTBot/PerplexityBot/ClaudeBot/Google-Extended (mechanical: blocked = invisible). schema_generator.

**Tier 2 — LIKELY (ship, claim moderate impact):** topical-authority cluster, LinkedIn presence (#2 cited source), YouTube (Perplexity's #1), basic schema (Organization/Product/FAQ/Review).

**Tier 3 — honestly downgraded, ship as free hygiene, NEVER promise lift:** llms.txt (SERanking n=300k: no measurable impact), schema beyond basics (Ahrefs n=1,885: minimal), backlinks/DR (3× weaker than mentions — do NOT repackage SEO link-building as GEO; this is the category's #1 sin and protects your brand to avoid it).

**Detection vs prioritization:** every factor is detected as a FACT. The *impact weight* is the only inferential part, and it lives in a versioned `factor_catalog` config table — not in code — so your own pilot data overwrites the vendor priors without a deploy. The four existing agent enum values (content_optimizer, schema_generator, review_presence_planner, reddit_presence_planner) cover ~80% of agentable gaps via a `playbook_id` discriminator. No enum migration needed for MVP — ship on the current schema.

---

## 4. SCAN UNIT & CADENCE

| Layer | What | Truth-class | Cadence | UI label |
|-------|------|-------------|----------|----------|
| **L1 Base audit** | schema, robots, sitemap, meta, llms.txt, reviews, Wikidata, Reddit/listicle/social presence | FACT | once + on-change; per-type TTL (site weekly→monthly, reviews/reddit weekly, wikidata/backlinks monthly) | "Observed [date]" |
| **L2 Engine probes** | 6 dimensions × shapes across 4–6 engines | OBSERVATION | **daily-light** (20% subsample, change-detection) + **weekly-deep** (full set, N≥5, Wilson CI) | "Band 22–31 (P50 27), as of [date]" |
| **L3 Time-series** | trends across L1/L2/L4 | DERIVED | continuous read-model | "Trend" — only after significance test |
| **L4 Passive telemetry** | AI-bot crawl logs, GSC AI-Overview referrals, referrer headers, "how did you hear" survey | FACT (at source) | continuous, event-driven | "Measured at source" |

**Refresh discipline (the adversary's two catches, fixed):**
1. Do NOT hold a known-stale headline for 6 days behind a quiet "drift detected" flag. The moment the daily-light CUSUM crosses threshold, the headline must visibly flag "refreshing." Never show "Band 27, up 6" on day 5 when the light run already saw a drop.
2. KILL the bare trend arrow. A trend renders only after a paired/CUSUM significance test clears; otherwise show "no significant change (within noise band)." Most ±6 moves are noise given 20-60% run-to-run variance and 34-42% day-to-day citation overlap.

**Cost reality:** naive (4 engines × 50 queries × N5 × daily) ≈ $300/mo/business — unsustainable at Discover $79. Daily-light + weekly-deep + 6h prompt cache + industry-shared query amortization cuts ~70%. This feeds pricing directly; treat it as a unit-economics gate, not a detail.

**The free scan stays** — it is one deep run + a cold L1 audit, explicitly framed as a diagnostic snapshot. That preserves your locked "free one-time scan remains" decision while fixing "one scan is the wrong unit."

---

## 5. BEST NEW IDEAS (from the visionary), ranked

**Adopt now (protocol + schema already support them):**
1. **Causal switchback experiments (#2)** — the highest-leverage idea in any of these documents. You ARE the intervention, so you can change one factor, hold the rest, re-probe with N≥5/CI/held-out controls, and measure *per-client causal lift* ("adding Wikidata moved your comparison-bucket presence 0.18→0.34, ΔCI excludes 0"). No observation-only tool can ever do this. Aggregated across ~30 clients × ~12 weeks, it becomes the only real causal-weight dataset in the category — and it retroactively upgrades every `impact_weight` from "industry-estimated" to "Beamix-measured." This is the moat. It is also exactly the pilot the validity research prescribes. Start the protocol with your first paying clients.
2. **Ground-truth tether (#4)** — connect L4 telemetry at onboarding and surface a live calibration coefficient ("a +10 probe move tracked +18% AI-referral sessions on your site, r=0.6, n=11 weeks"). This is your honest answer to "validated before trusted," and a competitive weapon: incumbents say "trust our number," you show the tether.
3. **Answer-shape mix as a distribution (#3)** — feasible now for the 5-6 well-sourced shapes; report the shape histogram + your win-rate per shape per intent bucket. This routes the agency's work (single-rec loss → entity/PR fixes; negative → review/accuracy; deflection → training-data presence).

**Adopt later (genuinely new, but need build-out or are higher-cost):**
4. **Agentic-buyability (#1)** — "can a buyer-agent shortlist, compare, and transact with you?" Skates to where the puck is going as buyers delegate purchasing to agents. Start now with the cheap core (shortlist + can-it-find-price/CTA + dead-end detection via Playwright); defer real transaction follow-through (sandbox/consent issues).
5. **Buyer-journey survival curves (#6)** — multi-turn neutral journeys, measure which turn you get eliminated. Genuinely new unit. Cost multiplies with turns, so reserve for weekly-deep + paying clients.
6. **Brand-knowledge fidelity (#5)** — hallucination rate on surfaced facts (wrong price, wrong category). A whole second agency product line ("the AI thinks you cost $499 and are a tool, not an agency — we're correcting the record"). Feasible now for accuracy-diff and knowledge-gap rate.

---

## 6. WHAT STAYS vs WHAT CHANGES

**Stays locked (and is now defensible as a moat, advertise it):**
- **No-leak neutral probing** — research confirms this is best practice most competitors quietly violate by allowing brand-named prompts. Market it.
- **Code computes the number; LLM only narrates** — rare in a market where most tools let an LLM grade itself. The only defensible posture given published noise levels.
- **Evidence-bound claims** — now hardened into the FACT/OBSERVATION/HYPOTHESIS signal-class system enforced in schema.
- **Free one-time scan remains** — re-cast as L1 + one light L2 run.
- **The four-agent enum + inbox/suggestion human-confirm gate** — ship MVP on it via `playbook_id`; no migration.

**Changes:**
- Single 0-100 score → Band + Profile + Gap-list triple.
- Flat 4-weight formula → 6 dimensions, shape-conditioned (with the sequencing caveat: shape/sentiment annotate, don't yet multiply the headline).
- Presence conflated with citation → split into two dimensions.
- One scan → L1–L4 four-cadence decomposition.
- Score asserted as truth → band with CI, validated against L4 ground truth before it earns the headline.
- Engines averaged → per-engine subscores, never one cross-engine "truth" (11% source overlap).
- **Gap ranking by borrowed correlation → ranking by contrastive observed fact + fixability + effort** (the adversary's most important fix).

**On the orchestration lock (2026-06-08) and Waves 1-2 shipped:** none of this disturbs the orchestration topology or QA gates. The schema changes ARE real work: new `business_contexts` (L1 cache), `telemetry_events` (L4), and additive columns on `query_positions` (sample_n, ci_low/high, model_id, run_kind) and `scan_engine_results` (shape, shape_outcome, sentiment). Per your tier-floor map these are `risk:full` to `risk:irreversible` (new tables + migrations) — QA-Lead PASS + Adam sign-off required. Sequence them behind the §7 decisions; don't migrate before the forks are settled.

---

## 7. OPEN DECISIONS FOR ADAM (the genuine forks)

**Decision 1 — Headline on day one: full shape-aware composite, or presence-band-only?**
Either/or: (A) ship the shape×sentiment composite as the headline now, or (B) ship a presence/position band with a real CI now and add shape/sentiment as *annotations* until each clears a gold-set.
**Recommendation: B.** The adversary is right that A multiplies two unvalidated, low-agreement judgments and hides the error inside a CI that doesn't propagate it. B is defensible on day one and you upgrade as calibration lands. Low downside, high credibility.

**Decision 2 — Gap-list ordering: causal impact weights, or contrastive observed fact?**
Either/or: (A) order by `impact_weight × symptom_link` (the vendor correlations), or (B) order by "competitors the engine names in YOUR query set have this, you don't" + fixability + effort, with `impact_weight` as a tiebreaker hint and `symptom_link` set to zero until your pilot calibrates it.
**Recommendation: B.** It is pure observed fact, auto-suppresses generic SEO advice (only surfaces gaps that correlate with being named in *this specific market*), needs no unproven prior, and is the honest core of the whole rethink. This is the difference between "rebranded GEO checklist" and a defensible product.

**Decision 3 — When does the score earn the dashboard headline: now, or after the L4 pilot?**
Either/or: (A) ship the Band as the headline immediately with caveats, or (B) gate the headline behind ~30-client × ~12-week L4 calibration, labeling it "early signal, calibrating" until ΔProbe correlates with ΔGSC-AI/Δbot-hits.
**Recommendation: B as a hard gate, not a soft caveat** — but ship the *gap checklist* (the sellable, honest, FACT-level product) immediately. This lets you sell and execute from day one while the score earns trust honestly. The checklist doesn't need the calibration; the headline score does.

**Decision 4 — Start the switchback causal program with the first paying clients, yes or no?**
Either/or: (A) defer experiments until post-MVP, or (B) bake the one-factor-at-a-time staggered-rollout protocol into the agency workflow from client #1.
**Recommendation: B.** The experiments ARE the calibration data, the proof-of-work for clients, and the moat-building dataset — all at once. The schema already supports it. Deferring it wastes the single thing no competitor can copy. Marginal cost over "just doing the work" is the measurement discipline (N≥5, held-out controls), which you want anyway.

**Decision 5 — Proof-of-work to clients: probe-score deltas, or L4 real-traffic deltas?**
Either/or: (A) show "your visibility went up 6 points," or (B) tie proof-of-work to L4 ground truth (GSC AI-impressions, bot hits, AI-referral sessions) and only show probe deltas that pass a significance test.
**Recommendation: B.** Probe-delta proof-of-work is the metric eating itself — it creates the corrupting incentive to claim credit for noise. Real-traffic deltas are honest, harder to game, and far more convincing to a paying client. This protects the brand and the renewal.

---

**Bottom line:** the rethink is correct in spirit and the founder concerns are all validated. The one discipline that makes or breaks it: keep the honesty in the numbers that move (band-with-CI, contrastive gap ordering, significance-gated trends, L4-tethered proof) — not in the badges next to them. Ship the gap checklist now (it's the product), gate the headline score behind real-traffic calibration, and start the switchback experiments with client #1 — that's the moat no tool vendor can ever build.