# DECISIONS.md — Architecture & Strategy Log

*Updated by any agent making a decision that affects other agents or future work.*

---

### [2026-06-11] — Wave 7 free-scan v2 wiring landed (FIRST behavioral wave, flag-gated OFF in prod)

**Why:** Assemble the W4/W5/W6 measurement libraries into the live free-scan flow per the wiring wave. Behavioral but flag-gated: `SCAN_MEASUREMENT_V2` env flag, **default OFF in prod** → v1 byte-identical; flag ON → v2 path. Same risk posture as W1's `SCAN_LIVE_RETRIEVAL`. PR `feat/w7-scan-wiring` tip `96432d0`; 17 files / +4,175/−82 / 650 tests; Full tier (`apps/web/src/inngest/**`); free scan stays an anonymous JSONB blob (NO normalized-table writes — spec rule).

**Shipped:** narration hardening (4 W6 blockers cleared) · `competitor-audit.ts` (top-K + bounded L1 audit) · `assemble-free-scan-v2.ts` (pure injectable orchestrator: leak-gated neutral probe → code detect/shape → per-engine sentiment+scoring → client+competitor factor audit → contrastive gap-list → playbooks → narration; `headline_band`=median LABELED-secondary; ≥2/3 degraded; probes+sentiment parallelized with leak-fail-closed + degraded preserved) · `scan-free.ts`/`scan-free-v2-deps.ts` (flag-gated path, flag read once at entry; blob keeps legacy fields + adds `scan_v2`) · results page renders `scan_v2` progressively with honesty labels, v1 fallback.

**QA:** Full-tier binding `qa.js` — gate #1 (`b119032`) BLOCK on one confirmed P1 (flag=ON Inngest branch had zero function-level coverage); fixed in `96432d0` (scan-free.test.ts flag=ON block: scan-v2-assemble invoked once, v1 steps skipped, early-return+persist, ProbeLeakError→mark-failed, writes only free_scans, + flag-OFF regression guard). Gate #2 (`96432d0`) PASS, 0 block-eligible, no coverage gap. 2 worker stalls recovered (atomic-commit + narrow SendMessage resume).

**FLAG-FLIP READINESS CHECKLIST (clear BEFORE SCAN_MEASUREMENT_V2 goes ON in prod — NOT blockers for this dormant merge):** ProbeLeakError→NonRetriableError; `scan_v2: any`→validated type; SCAN_LIVE_RETRIEVAL-branch test in buildV2Deps; parallelize site-audit+catalog awaits; competitor-domain resolver (still null → gap-list in honest impact_fallback; citation-based resolver lights up real contrastive auditing); minor test/dead-code nits. Then: flag ON in staging→prod alongside W2b budget/abuse guard. Authenticated recurring-scan normalized persistence is a separate later wave.

### [2026-06-11] — Wave 6 contrastive gap-list + playbook mapping + narration v2 landed (pure library)

**Why:** Build the shippable gap-checklist (ships ahead of the calibrated score) per SCAN-MEASUREMENT-MODEL.md §3/§5 W6. Pure additive library (`apps/web/src/lib/scan/`), same build-then-wire pattern as W4/W5. PR `feat/w6-gap-narration` tip `0d62b38`; 9 files / +2,927 LOC / 406 tests; NO migration; live scan flow untouched.

**Shipped:** `gap-list-ordering.ts` (`buildContrastiveGapList` — ranks `absent` factors by CONTRASTIVE observed fact [how many audited competitors have it] as primary, impact_weight only a tiebreak; Tier-3 hygiene tail; honest `impact_fallback` mode when no competitor audits; `splitLiftVsHygiene`) · `playbook-mapping.ts` (gaps→4 agent enums, null=manual) · `fixability.ts` (per-factor effort config) · `gap-types.ts` · `narration.ts` (the ONE evidence-bound LLM call + deterministic grounding code-check that strips ungrounded quotes/competitors/numbers→degraded; templated fallback on error, never throws; no second LLM verifier; "why they beat you" = our verified evidence only).

**QA:** Full-tier binding `qa.js` — run #1 BLOCKed ONLY on an Opus-judge dropout (Anthropic spend limit, raised by Adam), not a quality finding; re-gated SAME tip `0d62b38` → PASS, 0 confirmed block-eligible, no coverage gap. CEO verified typecheck/test/`next build` in-worktree + branch vs GitHub truth between workers.

**GATING fast-follows (block the narration-wiring wave, NOT this library merge — judge scoped them "before narration ships to paying customers"; narration is unwired here):** (1) competitor grounding bypass when `knownCompetitors` empty; (2) number-grounding substring false-pass → word-boundary match; (3) PII log of raw LLM response on parse failure → redact; (4) dead `opts.now` param + untested bypass paths. Documented in the W6 session file as wiring-wave blockers.

**Deferred wiring (next wave):** audit top-K named competitors (reuse W2 SSRF `auditSite` + W4 `detectFactors`) → feed `CompetitorFactorAudit[]`; thread gap-list + narration into `scan-free.ts`; persist. Score go-live gates unchanged (variance SD≤5 cache-OFF; external ρ≥0.4) gate the SCORE, not the gap-list.

### [2026-06-10] — Wave 5 L2 probe v2 + code scoring landed (measurement core, pure library)

**Why:** Build the measurement core per SCAN-MEASUREMENT-MODEL.md §11 W5. Pure additive library (`apps/web/src/lib/scan/`), mirrors W4's "built, not yet wired" pattern. PR `feat/w5-probe-scoring` tip `681250b`; 13 files / +3,991 LOC / 322 tests; NO migration; live scan flow untouched.

**Shipped:** `measurement-types.ts` (type SoT; literals mirror migration 20260608000002 CHECKs) · `probe.ts` (`buildNeutralProbe` zero-identity input = firewall as type boundary; `checkProbeLeak`/`assertProbeClean({branded})` fail-closed gate) · `client-detection.ts` (code mention/rank/competitor extraction) · `answer-shape.ts` (12-shape + win/partial/loss, annotation-only) · `sentiment-judge.ts` (the ONE allowed LLM call, quote code-verified vs the sanitized snippet, unverifiable→`unknown`) · `dimensions.ts` (6 dims) · `scoring.ts` (Wilson CI + Band presence/position-only + per-engine subscores never merged + `rerunVariance` SD≤5).

**Invariant enforced + tested:** the sequencing lock — varying shape.outcome/sentiment leaves band.point + CI identical (headline = presence/position only). Branded probes bypass the leak-gate BY DESIGN (identity-bearing, scored separately, never feed the visibility band).

**QA:** Full-tier binding `qa.js` ran TWICE — gate #1 (`f0ea9e7`) PASS + 16 advisories cleared in `681250b`; gate #2 (merge candidate `681250b`) PASS, 0 block-eligible, no coverage gap. 14 finer advisories recorded as fast-follows (polish loop stopped intentionally — shape false-positive edges are W6-calibration, not headline-correctness, since shape is annotation-only). CEO re-ran typecheck/test/`next build` in-worktree at each tip; branch verified vs GitHub truth between workers.

**Deferred (next waves):** wiring — swap `buildEnginePrompt`→`buildNeutralProbe`, call `assertProbeClean` to fail-closed, split probe into its own Inngest job on `OPENROUTER_SCAN_KEY`, persist into `query_positions`/`scan_engine_results`. Irreversible follow-up: DB role-grant REVOKE for the firewall's DB half (scan service-role can't read `businesses` identity) — needs migration + Adam sign-off. Score go-live gates unchanged (variance SD≤5 cache-OFF; external ρ≥0.4) gate the SCORE, not the gap-list.

### [2026-06-08] — SCAN MEASUREMENT MODEL v2 locked (rethink workflow + 3 founder decisions)

**Why:** Founder pushed that "mention+rank" is too narrow and the real product is the action checklist. Ran a 10-agent workflow (wf_94614e3c-79c: 4 web researchers → 3 designers → adversary+visionary → Opus judge). Authoritative doc: `docs/04-features/SCAN-MEASUREMENT-MODEL.md` (supersedes DIAGNOSIS-REDESIGN + SCAN-ORCHESTRATION as the build reference). Synthesis: `docs/04-features/research/2026-06-08-scan-rethink-synthesis.md`.

**5 reframes locked:** (1) visibility = Band + Profile + Gap-list, NOT one number (AI returns same brand list <1% of the time → bare point is false precision); (2) "mentioned" ≠ "winning" — answer-SHAPE-dependent (12 shapes, each with win/partial/loss; #1 in a "tools to AVOID" list is a loss); (3) the GAP CHECKLIST is the product, score is the hook; (4) not one scan — 4 layers/4 cadences: L1 base audit (FACT, crawled) / L2 engine probes (OBSERVATION, daily-light+weekly-deep, N≥5 + Wilson CI) / L3 trend (significance-gated) / L4 passive telemetry (FACT at source); (5) honesty in the numbers that MOVE — gap-list ordered by CONTRASTIVE OBSERVED FACT (competitors AI names have it, you don't) + fixability + effort, NOT borrowed vendor correlations; impact weights in a versioned `factor_catalog` config table.

**Founder decisions (2026-06-08):** (D1) document-first, then build with workflows — this doc IS that document. (D2) Ship the gap-checklist NOW (pure observed fact); the headline SCORE is "early signal, calibrating" until validated against L4 real-traffic. (D3) Switchback before/after experiments from CLIENT #1 (the moat — per-client causal lift no observation-only tool can do; builds the only real causal dataset + upgrades impact weights). (D4) Proof-of-work = BOTH score gains + real traffic, lead with score gains early (significance-gated; never claim noise), shift to real-traffic as L4 accrues.

**Honesty spine (schema-enforced):** every signal is FACT (we fetched bytes) / OBSERVATION (engine said, with N+CI+date+model_id) / HYPOTHESIS (must cite a FACT + sourced correlation + confidence; banned: "invisible BECAUSE X", "X WILL raise score Y%"). Headline ships presence/position band only; shape+sentiment annotate (don't yet move the headline) until each clears a gold-set. Per-engine subscores, never one cross-engine "truth" (~11% source overlap).

**Stays/changes:** no-leak probing + code-scores + free scan + 4-agent enum (playbook_id, no enum migration) all STAY. Waves 1-2 reused. Wave 3 migration grows: reuse query_positions (add evidence_id + sample_n/ci/model_id/run_kind) + scan_engine_results (add shape/shape_outcome/sentiment); new business_contexts/telemetry_events/factor_catalog; wire tracked_queries. Build order updated (W3 migration → W4 base audit/factor detect → W5 probe v2+shape classifier+code scoring → W6 gap-list+playbooks → W7 UI → W8 telemetry+calibration+switchback). Tier 3 factors (llms.txt, schema-beyond-basics, backlinks) ship as hygiene, NEVER promised lift.

### [2026-06-08] — SCAN ORCHESTRATION locked (pipeline + model-routing + state)

**Why:** Founder pushed to rethink the scan FLOW, model-routing, and state (returning businesses). Ran 3 competing designs (purity / cost-state / report-separation) + 3 critics (validity adversary, CBO, architect). Doc: `docs/04-features/SCAN-ORCHESTRATION.md`.

**Locked 4-stage pipeline:** (1) context + query set — first scan researches, **returning business reuses cached context + saved tracked_queries**; (2) **neutral probe** — engine gets ONLY the real-user query, NO business name / NO "is X mentioned" / NO JSON envelope; client detected in code AFTER; (3) **code extraction + code scoring** (no LLM picks mention/rank/score); (4) one **evidence-bound narration** call (Haiku free / Sonnet paid), can't invent issues or numbers.

**Firewall is STRUCTURAL:** probe = its own Inngest fn on `OPENROUTER_SCAN_KEY`, RLS-blocked from the identity row → physically can't leak the business to the engine. Lint gate fails the scan if the probe prompt contains the name/domain.

**Two founder decisions (2026-06-08):**
1. **Always show a FRESH number.** Reuse cached context+queries for cost, but the DISPLAYED score/issues are always from a fresh probe. Caching the engine *results* and showing a ≤14-day-old score as "this week's" = KILLed by the adversary as dishonest. Engine-result caching deferred (cost-only if ever, or prove equivalence ρ≥0.9/|Δ|≤3 first).
2. **"Why they beat you" = evidence WE verified** (competitor has schema/reviews/citations you lack). The engine's OWN stated reason is confabulated (LLMs can't introspect their retrieval) → only ever shown as a labeled "what the AI said" guess, never the finding or a recommended action.

**Other locks:** cut the LLM verifier (Haiku-checking-Sonnet = theater); keep the cheap *code* substring check that a quoted engine line really appears in raw_response. Reuse existing unwired tables — **`query_positions` IS the evidence ledger (add `evidence_id`), `scan_engine_results` is the raw store — do NOT create new scan_observations/scan_result_cache tables** (changes Wave 3 migration). Add `business_contexts` (30d TTL, invalidate on edit) + wire `tracked_queries`. Variance gate (SD≤5) measured with cache OFF. Partial-engine → mark `degraded`, never silently complete. Narration model: Haiku free / Sonnet paid (LLM narrates code-derived issues, so the delta is ~$0.009/scan). Defer: result/audit/narration caches, shadow-recompute, separate LLM extractor, forced-fresh.

**Impact:** refines (does not replace) the [2026-06-07] measurement model. Wave 3 migration must reuse query_positions/scan_engine_results + add business_contexts/tracked_queries, NOT invent observation tables.

### [2026-06-07] — DIAGNOSIS-ENGINE REBUILD — measurement model locked (Phase 0, spec + grill)

**Why:** The shipped scan ([2026-06-05] entry below) has measurement-VALIDITY defects, not polish gaps (code-audited this session): 2 of 3 engines (`gpt-4o`, `gemini-2.0-flash`) answer from parametric memory, not live search; the whole 0-100 score is extrapolated from ONE query (`QUERIES_PER_ENGINE=1`); "issues" are fabricated from a hardcoded label list (analyst gets only `{mentioned,rank,sentiment}`, never fetches the site/schema/citations); the top-5 competitor `recommendations[]` per engine is parsed then DISCARDED. Good bones kept: openrouter-client, sanitization, robust JSON parse, ground-truth scoring guard, Inngest orchestration, scan_progress, kill-switch.

**Locked (spec `docs/04-features/DIAGNOSIS-REDESIGN.md`; research `docs/04-features/research/2026-06-07-diagnosis-research-brief.md`; grill = broad-adversary + customer-voice + risk-modeler + CBO):**
1. **Visibility = a distribution over queries×engines**, summarized to a score IN CODE (`scoring.ts`); LLM narrates, never scores. Formula `100·(0.40·Presence + 0.25·Rank + 0.20·Citation + 0.15·Breadth)`, versioned weights. Branded queries scored SEPARATELY (brand_recognition diagnostic), never folded.
2. **Evidence contract:** no issue may be constructed without a mandatory `evidence` payload referencing stored observations (type-level enforced). 7 free-tier issue types incl. not-retrieved-for-intent, competitors-outrank-you, missing-LocalBusiness-schema, ai-crawler-blocked, own-domain-never-cited.
3. **Live retrieval for all engines.** FREE = Option A LOCKED: Perplexity Sonar (native citations) + GPT-4o-mini/OpenRouter web plugin (Exa $0.005/req). **Option B (dual-Sonar) KILLED** — measurement fraud (one retrieval system twice). Honest labels mandatory: "GPT-4o-mini (web-enabled) — proxy for ChatGPT search, NOT production ChatGPT." retrieval_mode badge required. OpenRouter `:online` is deprecated → use `web_search` plugin; citations at `message.annotations[].url_citation.url`.
4. **Score = BAND not point** until rerun-variance bounded (only ~6 free observations → 2-digit precision is a lie). Display point+"±SD" only if median rerun SD ≤ 5, else band/letter-grade.
5. **Two pre-go-live GATES (blocking, Adam-level):** (a) Reproducibility — 30 businesses ×5 reruns, publish median SD; deterministic query set + 14-day cache + 1% shadow-recompute. (b) External validation — Spearman ρ ≥ 0.4 vs a ground-truth signal (GSC AI-Overview impressions / AI-bot referrer logs / customer-reported lead source) BEFORE the number is publicly trusted; else ship as letter grade "early indicator." This is the "signal vs sophisticated fabrication" gate.
6. **Citation sub-score parsing contract** (hostname canonicalization, exclude 3rd-party directories from "own-domain cited"); measure false-zero rate on 200 responses; if >10%, C 0.20→0.10, reallocate to Breadth, sunset at <5%.
7. **Result UI LEADS with the competitor matrix** (all 3 customer archetypes ranked it #1 persuasive); score + "based on N queries" methodology demoted to an expander. CTA tier-routed (unlock-paid-scan / start-agent / white-label-PDF), replacing "book a discovery call." White-label hides the numeric score, leads with matrix+evidence.
8. **SECURITY BLOCKING (Wave 2):** SSRF-safe fetch for the user-URL site audit — IP-class denylist incl IPv4-mapped-IPv6 (CVE-2026-47684 class), per-hop redirect re-validation, 2MB/8s caps (`request-filtering-agent`+`node-fetch` or equiv). Atomic PRE-call budget counter (Upstash), per-/24-subnet rate limit, single-use Turnstile. Google-compliant robots.txt parser that OMITS the claim on 5xx (never defaults to "blocked"). IP hashing + 30-day purge (GDPR).
9. **CBO sign-off:** GO-WITH-CONDITIONS on Option A. Kill-switch ceiling **$500/mo** (~15.6k scans), revisit at 10k/mo sustained 2 weeks. Break-even free→paid conversion 0.016% @ $79 — economics dominate at any realistic rate. Confirm OPENROUTER_SCAN_KEY isolation live before merge. Engine choice reversible (config flag).

**Verdicts:** adversary HOLD (65%→~40% with the 4 gates), risk-modeler HOLD (9-FM blocking set), customer-voice SHIP-with-fixes, CBO GO-with-conditions. None KILL. **Net: PROCEED to rebuild with these as hard gates.** Build = free-scan vertical slice first; data model designed for both free + paid. Waves: 1 live-retrieval · 2 evidence-capture+SSRF/budget · 3 DB migration (Irreversible) · 4 query-set+scoring · 5 evidence diagnosis · 6 UI · 7 eval/validation (moved to gate go-live, not last). Session: docs/08-agents_work/sessions/2026-06-07-ceo-diagnosis-rebuild.md. **Awaiting Adam go before Wave 1 dispatch.**


### [2026-06-07] — NAVIGABLE PRODUCT (design) — 3-page nav + auth + settings + polish, QA-PASSED

**Decision (Adam, locked this session):** (1) **Reduced 3-page outcomes nav** now — sidebar = Outcomes (→ polished `/dashboard`) · Approval Queue (→ `/approvals`) · Settings. **Weekly Digest Archive + Traceability deferred** (the full 5-page model in `08-UX-ARCHITECTURE.md §0` is NOT fully adopted this pass — only the 3 pages with real/buildable content, to guarantee zero placeholders). (2) **Design-first, wire-later** — auth + Settings ship as pixel-perfect warm-minimal screens with all four states; real Supabase auth wiring + Settings/Billing persistence are an explicit fast-follow (kept this OUT of Irreversible tier — no DB migration, no auth backend). (3) **Retired tool-framed routes redirect** (reversible) rather than delete: `home/scans/automation/competitors → /dashboard`, `inbox/archive → /approvals`.

**Shipped (`feat/navigable-product`, FULL tier, QA-PASSED):** sidebar reshape + 6 redirects; `(auth)` shell + login/signup/forgot-password (AuthCard mirrors ScoreHeroPanel finish, one Fraunces beat, OAuth, `next` preserved); six-tab Settings console (violet-identity Approval-preferences tab, violet never a button); `/scan/[scan_id]` rebuilt to tokens + `.card-console` (ScanScoreHero/EngineBand/IssueLedger/ScanPendingState, sanctioned score reveal, NO agent names per Eng #9); `/discovery` warm-minimal wrapper. Built via T5: 4 `design`-workflow specs → 4 worker builds (worktrees from origin/main, conflict-free merge, none touched globals.css).

**QA value:** binding `qa.js` gate #1 **BLOCKED** on 2 verified P1s — open-redirect via unvalidated `next` param rendered as `<a href>` (Login/Signup), and a squared ScanScoreHero ring offset under prefers-reduced-motion (score 50 → 25% arc). Both fixed with regression tests (`sanitizeNext` same-origin-only; `ring-math.ts` `ringOffset`); gate #2 **PASS** (0 block-eligible survived 3-way adversarial verify). design-critic 4 P1s + 3 advisories also fixed (cal.com CSP `frame-src`, ProfileTab persona-PII default removed, ScanPendingState reduced-motion + monotonic labels). Verified in-worktree: tsc 0, vitest 232/232, build 0, zero "Coming Wave 1" customer-facing.

**Note:** fix pass applied directly by CEO (subagent budget hit mid-run) — exception to the layer contract, driven by infra, not preference. **Fast-follows:** real auth/persistence wiring; Weekly Digest + Traceability pages; 9 QA advisories (auth-util dedupe, deriveScore/deriveEngines tests, setTimeout unmount guard, BillingTab dead branches). **Merge:** human-gated; awaiting Adam. Session: `docs/08-agents_work/sessions/2026-06-07-ceo-navigable-product.md`.

### [2026-06-05] — SCAN ENGINE BUILT (Track A) — the missing core, QA-PASSED

**Finding:** The GEO scan engine did not exist on main. `/api/scan/free` fired `scan/free.requested` with no consumer, no scan lib, and the `free_scans` table itself was never created in any migration — so the free-scan front door was silently broken at the insert step. The product's "diagnose" half + top-of-funnel lead magnet was hollow.

**Built (IRREVERSIBLE, QA-PASSED):** `feat/scan-engine-db` (free_scans migration + types, RLS service-role-only) + `feat/scan-engine-worker` (scan lib + `scan-free.ts` Inngest fn). Pipeline: Perplexity research → 3 engine queries (gpt-4o, gemini-2.0-flash, perplexity sonar via OpenRouter) → Gemini Flash analysis → FreeScanResults JSONB. ~$0.05/scan, 13 tests. Output contract locked to the result-page JSONB shape.

**QA value:** security caught a Critical wallet-drain (public endpoint, ~$4.5K–$45K/mo) → fixed with budget guard (system_kill_switch + daily/hourly free_scans count caps + email plus-strip). code-review caught 5 P1 (2 unapproved models, prompt injection, mark-running-outside-try, false never-throws). QA-Lead caught a final P1 (paused_by 'system' written to a uuid column, fail-open broke the latch). All fixed; CEO-verified in-worktree tsc 0 / 13 tests. Codex unavailable (graceful degradation).

**Decision — defer-to-followup (accepted by QA-Lead):** OPENROUTER_SCAN_KEY dedicated key (fallback in place), WHOIS DNS/ownership, drop email/ip from Inngest payload, PII retention cron, XFF hardening, status text→enum.

**Adam-run before merge:** sign-off (IRREVERSIBLE) + `supabase db push` 20260605120000_free_scans.sql (ref zhjxdwcqxhwletkpuwyl). Merge W1→W2. Session: docs/08-agents_work/sessions/2026-06-05-ceo-scan-engine.md

### [2026-06-05] — DESIGN VISION LOCKED (founder grill) — 8 decisions, single source of truth

**Decision:** Product design vision locked via founder grill. Canonical doc: `docs/design/DESIGN-VISION.md` (the WHAT); `DESIGN-WORKFLOW.md` is the HOW; `BRAND_GUIDELINES.md` holds tokens. The 8:
1. **Soul = warm-minimal** — restraint is the frame, warmth is the soul. Not austere, not maximalist.
2. **Palette = full, strictly role-scoped** — `#3370FF` is the ONLY primary/CTA color; everything added is role-locked punctuation.
3. **Signature law: blue = you, violet `#6E56F0` = the agents** (violet never a button). Agent runs/automations/AI/scan-diagram/score-gradient read violet.
4. **Character = moments only** (empty/first-run/loading/404), no persistent companion — honors `project_beamie_deferred`.
5. **Serif (Fraunces) = disciplined expansion** — editorial moments only, never UI chrome.
6. **Motion = minimal / transitions-only**; the free-scan score reveal (PR #130) is the ONE sanctioned animation.
7. **Designer-agent model = tight system, free composition** — primitives enforced exactly (critic BLOCKS), composition free (critic grades craft-parity).
8. **Docs = consolidate/supersede/archive** — DESIGN-VISION is SOT; 2026-06-03 `design-audit/DESIGN-DIRECTION.md` superseded (mined); ~40 April-era design docs → `docs/_archive/design-april-2026/`.

**Also locked this session:** `references/_product-feel/` = 6 (PostHog, Anthropic, Dia, Attio, Raycast, Linear); 40 references sorted + contracted in `references/CATALOG.md`; reference taxonomy = soul / screen / component with the per-image "color/brand never copied, only the move" law.

**Affects:** product-designer, design-critic, design-polisher (definitions updated to point here + carry the laws); any frontend/design build; BRAND_GUIDELINES v4.1. **Open (engineering):** wire tokens into the Tailwind theme + `beamix-brand-quality-bar` skill. **Provenance:** session `docs/08-agents_work/sessions/2026-06-05-ceo-design-vision-grill.md`. **QA-PASSED** (binding gate, 0 findings) + Adam sign-off; merged via PR #142 (Irreversible tier).

### [2026-05-30] — WAVE 2 SHIPPED — merge train complete (all 6 branches on main)

**Decision:** Landed Wave 2 via **squash-integration** (fresh branch from live main + `merge --squash`, one clean commit per branch) over literal rebase — cleaner history, conflicts resolved once. Each merge gated on CEO-run build+tests *inside the target worktree* + out-of-band code/security review + Adam `--admin` sign-off.

**Result:** main = `6c50e9f` (#117). PRs #111/#113/#114/#115/#116/#117. Merged main verified green: tsc 0, `next build` 0, vitest **108/108 (10 files)**.

**QA value proven:** the gate caught **7 P1s** that built clean — atomic-consume TOCTOU money leak (#113), RLS-blocked approvals UPDATE that silently no-op'd for everyone +3 more (#114), founding panel showing wrong cohort number (#116). None catchable by typecheck/build alone.

**Release blockers RESOLVED 2026-05-30 (Adam, same session):** migration `20260529000007` applied + `APPROVAL_SIGNING_SECRET` set in Vercel. Remaining non-blocker: regenerate `database.types.ts`. Follow-ups in `docs/08-agents_work/handoff/2026-05-30-handoff-wave2-complete.md`.

**Process correction (now memory `feedback-verify-build-in-worktree`):** verify in-worktree, never transcribe worker pass-claims into a verdict, sanity-check PR diff file-count.

### [2026-05-27] — WAVE 1 SHIPPED — agency-pivot customer surface live + maxTurns lifted

**Decision:** Beamix Wave 1 (agency-pivot customer-facing surface) merged to `main` across 7 PRs (#86–#92). The product can now flow free scan → discovery booking → 30-min text discovery agent → brand fingerprint capture → outcomes dashboard v1 + approval queue shell.

**PRs merged (squash):**
- `#86` feat/db-w1-agency-tables (Irreversible) — 4 migrations, RLS, qa-tier-floor.yml, rollback scripts → `1296880`
- `#87` feat/be-w1-scan-funnel (Full) → `f2ce2f5`
- `#88` feat/be-w1-discovery-chat (Full) → `4d3de35`
- `#89` feat/ai-w1-discovery-agent (Irreversible) → `fa8899c`
- `#90` feat/fe-w1-outcomes-shell (Full) → `c94a355`
- `#91` feat/be-w1-resend-scaffolding (Full) → `7310d3a`
- `#92` chore/worker-max-turns-50 (Irreversible) — see below

**Architectural sub-decisions locked during the dispatch:**
1. **CTO is planning-only, CEO is dispatcher.** Subagent runtime guards prevent nested `Task` dispatch (Claude Code 2.1.146); CTO subagent's `tools` declaration of `Task` is cosmetic until runtime allows it. CTO returns paste-ready dispatch packets to CEO. Reversibility: irreversible at runtime level until Anthropic ships nested-Task flag.
2. **Workers branch from `origin/main`, never local `main`.** Local main is frequently stale vs origin; workers branched from local main inherit empty `apps/web/` + missing dispatch brief and burn 50-130k tokens before discovering the gap. Pattern lives in `memory/feedback_worker_worktree_from_origin.md`. Reversibility: easy (pattern only).
3. **Workers run a sanity check in their first 3 tool calls.** Verify expected files exist (dispatch brief + apps/web/src/lib + key spec docs); return BLOCKED if stale. Cuts wasted-budget stalls from ~30 tool calls to 3.
4. **Workers commit each unit immediately.** Don't batch; commit per logical change. The "commit-as-you-go" failsafe means PARTIAL-but-committed beats empty branch when maxTurns hits.
5. **QA-Lead can't nest Task either — CEO directly dispatches reviewers.** Per branch + risk tier: code-reviewer + security-engineer (+ adversary-engineer for Irreversible). CEO synthesizes the per-PR verdict. Pattern proven on Wave 1.
6. **maxTurns 20 → 50 for the 9 worker types** (PR #92). Wave 1 stalled ~12 worker invocations across the 20-turn cap (initial + R2 + micro-continuation + mop-up + fix dispatch + QA fix dispatch). 50 gives a single focused feature room. Reviewers (15) and orchestrators (25-30) left unchanged. Adam textual consent: "I allow everything. Merge. Push. or do all the things you need to do." (CEO ceo-3-1779270080 session 2026-05-27). Reversibility: irreversible (touches `.claude/agents/`).
7. **Multi-judge for Irreversible.** 3 reviewers per Irreversible branch (Opus adversary + Opus security + Sonnet code-reviewer); 2 per Full branch. Verdicts synthesized by CEO. The Wave 1 adv-ai (Opus) review on `ai-w1-discovery-agent` caught 7 attack scenarios (2 CRITICAL + 4 HIGH + 1 LOW) that line-level review missed — confirming Opus adversary at tight scope is high-leverage for trust-boundary code.

**QA findings + fixes shipped on Wave 1:**
- ai-discovery: 7 blockers fixed (customer_id server-pin from session, SSRF defense in fetch_site_content, minimum-turn gate before emit_brand_fingerprint, YMYL reconciliation with Hebrew terms + JSON deep-walk, conversationHistory removed from public signature, evidence_links prefix allowlist, schema-drift resolved by db PR adding 7 missing columns)
- discovery-chat: 5 P1/High fixed (dev-mode HMAC bypass removed, CALCOM secret fallback removed, double SSE done event prevented, timingSafeEqual length guard, Principle #9 generic 503 string)
- db: 2 P1s fixed (rollback FK constraint name match, revenue_events.booked_at UPDATE policy for day-60 cron)

**Adam-actions remaining:**
1. Apply 4 Wave 1 migrations to staging Supabase via SQL Editor (consolidated script: `docs/08-agents_work/wave-1-staging-apply/WAVE-1-MIGRATIONS-COMBINED.sql`); then production
2. Optional: prune Paddle production webhook from 56 → 12 events
3. Optional: rotate `DISCOVERY_SESSION_SECRET` (one was exposed in chat during Vercel CLI debug; current live Vercel env value is uncompromised)

**Wave 1.5 in flight:** Domain + business verification (Task #12) — `w15-domain-verify` worker dispatched 2026-05-27.

**Wave 2 ready to brief:** Tier-gate middleware + weekly digest cron + held-revenue booked_at cron + founding-100 cohort UI + approval queue real wiring + Customer Success agent + Approval-gate writer agent. Plus the descoped Wave 1 verification item if Wave 1.5 doesn't ship it.

**Wave 3 sequenced after Wave 2 ships customer #1:** publishing integrations matrix.

**Cost reality:** ~1M tokens to ship Wave 1 — roughly 3× theoretical minimum. maxTurns:20 was the dominant amplifier; PR #92 addresses it.

**Reversibility:** Most decisions are operational patterns (reversible). The maxTurns bump + the runtime-level CTO planning-only constraint are HARD-reversible without Anthropic-side changes.

**See:**
- `docs/08-agents_work/sessions/2026-05-27-ceo-wave1-closeout.md` — full session synthesis
- `~/.claude/projects/.../memory/feedback_worker_worktree_from_origin.md` — branch-from-origin pattern
- Wave 1 PRs: #86, #87, #88, #89, #90, #91, #92

---

### [2026-05-24] — CEO ratifies 5 cross-team sub-decisions from agency pivot

**Decision:** After all four C-suite leads (CPO/CMO/CBO/CTO) completed the agency-pivot dispatch on 2026-05-23, they surfaced 5 sub-decisions outside the original 15 locked in the grill session. CEO ratifies all 5 under user authorization ("run your part"). All 5 are downstream-actionable by Build-Lead, Design-Lead, and ai-engineer workers in the coming wave dispatches.

**5 ratified sub-decisions:**

1. **North star metric = Month-3 retention rate** (CBO recommendation). Replaces free-scan completion. Justified by 45–90 day GEO time-to-result reality: a free-scan-completion metric rewards a top-of-funnel signal that doesn't predict revenue retention. Month-3 retention validates the 60-day money-back guarantee economically and forces the org to optimize for sticky outcomes. Target: 80% base, 70% watch trigger, 88% pricing-power signal. **Reversibility: easy** (dashboard metric swap).

2. **Wave 3 (publishing integrations) sequenced AFTER Wave 2 ships to customer #1, NOT in parallel** (CTO decision A10). Justified by dependency chain: publishing integrations against real customer properties require approval_queue + held_revenue_accounting + audit trail to be live first. Sequential reduces blast-radius risk. Flips to parallel only if customer #1 books before Wave 2 completes (acceptable degradation). **Reversibility: easy** (sequencing call, not code).

3. **Strategy agent runs on Opus 4.7** (CPO decision). For Professional tier $2,499/mo monthly strategy review. Justified by heaviest reasoning workload (90-day multi-source synthesis across visibility scans + customer brand brief + competitor moves + content performance); cadence is monthly so cost per customer per month stays under $1; $2,499 ACV absorbs trivially. Conforms to locked model routing rule (Sonnet default, Opus for orchestration/planning/synthesis/design). **Reversibility: easy** (model swap).

4. **YMYL always-human approval gate** across Brand-Brief Manager, Approval-Gate Writer, Customer Success, Strategy agents (CPO decision). When YMYL (Your Money Your Life — health, legal, financial) content is detected in customer brand brief or generated artifact, gating-rules force human approval regardless of tier defaults. YMYL fields are unwriteable by system_inferred source. Justified by Beamix's 3-vertical launch ICP (B2B SaaS + Legal + Dental) where 2 of 3 are YMYL-adjacent. Liability protection layered with the $1M E&O insurance. **Reversibility: hard once published** — but right call.

5. **Publishing actions = Irreversible QA tier** (CTO decision A9). Every PR touching `apps/web/src/lib/publishing/<platform>/` triggers Full QA + multi-judge + Adam sign-off. Codified in `.claude/qa-tier-floor.yml`. Justified by real-world side effects on customer external systems (customer site, GBP, email-as-them, citation networks) — defaultable rollback in some cases (WP post deletion) but not all (sent emails, claimed citations). Defense-in-depth on the highest-blast-radius surface. **Reversibility: easy** (YAML entry).

**Provenance:**
- Sub-decisions 1, 2, 3, 4 surfaced in respective C-suite session files (2026-05-23-{cbo, cto, cpo}*.md)
- Sub-decision 5 codified in CTO architectural decisions A8 + A9 (see 2026-05-23-cto-agency-pivot-wave-rescope.md)
- Ratification authorized by user instruction "run your part" 2026-05-24

**Session file:** `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md` (open decisions list updated to reflect ratifications)

---

### [2026-05-23] — CBO — Agency pivot financial documentation + north star + ToS draft

**Decision:** CBO session completing financial documentation for the 2026-05-23 agency pivot. Six existing docs rewritten, three new operational files created.

**Sub-decisions locked:**
1. **North star metric = Month-3 retention rate.** Replaces free-scan completion. Justified by 45-90 day GEO time-to-result. Target: 80% base, 70% watch trigger, 88% pricing-power signal. Reversibility: easy.
2. **Blended gross margin = 92.6% central case.** Derived from per-tier COGS model (Paddle fee = fact; LLM/support COGS = assumed). Break-even refund rate ~52% across all tiers. Reversibility: easy (model update with cohort data).
3. **Founding-100 12% refund case = $27,058 cash at risk.** Worst-case (100% refund) = $194,603. Both are manageable without external funding. Reversibility: easy (planning model). *(Corrected 2026-05-24 from $26,762 / $192,383 per QA-Lead PR #84 finding — Growth tier 60-day refund exposure was off by 1 month of COGS.)*
4. **Insurance procurement: $1M GL + $500K-$1M E&O, expected $800-$2,150/year.** Provider shortlist: Hibub first, then Phoenix. Adam-blocker before customer #1. Reversibility: easy.
5. **ToS v1 draft created.** All 15 required clauses. Marked DRAFT — requires Israeli lawyer review before publication. Liability cap = 12 months fees paid. Customer indemnification clause included. Reversibility: hard once published + customer #1 accepts.
6. **Product SPECIFICATION.md is now legacy reference only.** BUSINESS_MODEL.md supersedes all $79/$189/$499 references. CPO to add deprecation notice to PRODUCT_SPECIFICATION.md in separate session.

**Confidence:** MEDIUM — all COGS assumed; upgrades to HIGH at month 3 with first 10+ customer cost logs.

**Session file:** `docs/08-agents_work/sessions/2026-05-23-cbo-agency-pivot-financials.md`

**Files edited:** docs/09-metrics/UNIT_ECONOMICS.md, docs/09-metrics/NORTH_STAR.md, docs/09-metrics/GROWTH.md, docs/01-foundation/BUSINESS_MODEL.md, docs/01-foundation/TARGET_MARKET.md, docs/product-rethink-2026-04-09/18-LEGAL-PUBLISHING-PLAN.md

**Files created:** docs/09-metrics/UNIT_ECONOMICS_TIER_MODEL.md, docs/legal/TERMS_OF_SERVICE_v1_DRAFT.md, docs/business/INSURANCE_PROCUREMENT_PLAN.md

---

### [2026-05-23] — AGENCY PIVOT — 15 locked decisions from "grill me" session

**Decision:** Pivot Beamix from a self-serve GEO tool ($79/$189/$499) to a done-for-you GEO agency ($499/$999/$1,499/$2,499) that hides agent names from customers and shows outcomes + traceability. Decisions locked in interactive grill session with research backing from 2 async research-lead runs (ICP/TTR/pricing/WTP + competitor mechanic + empirical conversion data).

**15 locked decisions:**

1. **Business model:** Done-for-you SaaS — self-serve checkout + agent-led onboarding + light dashboard + real publishing on customer's behalf
2. **Approval gates:** Tiered — auto for citations/listings/schema/scans; 1-click approve in digest for content publishing, email-as-them, external outreach
3. **Push mechanism:** Hybrid — full auto on stable APIs (WordPress, Shopify, Webflow, GBP, Yelp, Apple, SendGrid sub-account, schema via GTM); paste-ready 1-click instructions on Wix/Squarespace/custom CMS
4. **Onboarding:** Agent discovery call day 1; Adam reviews/approves every brand brief through customer #50
5. **Service scope:** GEO-only — schema, citations, GBP/listings, GEO-tuned content, AI-engine corpora, multi-engine visibility tracking. Not general SEO, paid ads, social, email marketing.
6. **Tier strategy:** Free scan → discovery → tiered subscription. Old $79/$189/$499 SKUs killed. One product, one funnel.
7. **Customer dashboard:** Outcomes + traceability — visibility score per engine, weekly wins, top winning queries, approval queue, weekly digest archive, plus "how we got this" drill-down. No agent names, no credit counters, no raw scan tooling.
8. **Trial/refund mechanic:** 60-day no-questions money-back, month-to-month, no contract, one-click cancel in dashboard, customer keeps work product. Guardrails: activation requirement, domain+business verification, held-revenue accounting through day 60, first-100 "Founding Member" cohort cap, one-per-account refund rule.
9. **Pricing tiers:** Starter $499 / Growth $999 / Scale $1,499 / Professional $2,499. Professional includes Adam-led monthly strategy review through customer #50, then agent-handled.
10. **Launch ICP:** 3 verticals — B2B SaaS <$5M ARR + Solo/small law firms + Single-location dental. HVAC, real estate, DTC, healthcare-non-dental deferred to MVP+90. Three vertical-specific landing pages + discovery scripts.
11. **Tier spec baseline:** locked deliverable matrix per tier (locations, engines tracked, prompts/engine, schema/mo, FAQs/mo, citations/mo, outreach emails, publishing integrations, SLA) — see session file.
12. **Liability + SLA:** Standard SaaS — 12-month fees-paid liability cap, customer warrants property ownership, customer approves all content publishes, $1M general liability insurance, customer indemnifies on 3rd-party claims. No uptime SLA at launch (best-effort). Premium SLA defers to MVP+90.
13. **Beachhead motion (customers 1–50):** Warm network + content + referral incentive. Adam personal LinkedIn + Israeli SMB warm intros + cold DMs to 50 named businesses/vertical. Then "State of AI Search" report + 3 vertical blog posts/week. Then $500 referral credit. Zero paid until customer #50 case studies exist.
14. **Engineering sequencing:** Layer onto existing Wave 0/0.5/1/2. Waves 0+0.5 unchanged. Wave 1 rescoped (brand-fingerprint + discovery, free-scan→booking, outcomes dashboard v1, approval queue). Wave 2 rescoped (deliverables tracking + tier gates, digest, held-revenue accounting). Wave 3 NEW (publishing integrations matrix).
15. **Customer-facing agent fleet:** 7 new (Discovery, Brand-brief manager, Approval-gate writer, Digest writer, Customer success, Publisher, Strategy) + 4 repurposed (Content/FAQ, Schema, Citation, Visibility tracker) + 1 kept (Competitor intelligence, de-emphasized).

**Research provenance:** 2 async research-lead runs 2026-05-23 — `tasks/a98bc6df7d83e15e2` (ICP/TTR/pricing/WTP, 4 researchers Q1–Q4) + `tasks/a4684aa23fdeb01f7` (competitor mechanic table + empirical conversion data). Key citations: Quicksprout 12% money-back refund rate, Footbridge Media 90-day analog, Profound $1B Series C, B2B SaaS AI-buyer stats (73% / 51% / 14%), legal CPL $649–$784, Jay Abraham risk-reversal specificity.

**Marketing copy locked:** EN "If we don't move your AI search visibility in 60 days, you don't pay. No questions, no phone tree, no contract. Cancel in one click." HE "60 ימים. אם לא הצלחנו לקדם אותך — כסף חזרה, בלי שאלות."

**Next dispatch:** CPO writes 7 agent PRDs + tier-spec PRD; CMO writes 3 vertical landing pages + pricing copy + "State of AI Search" report outline + drafts the discovery DM templates; CBO models unit economics per tier and procures $1M general liability insurance + drafts ToS; CTO rescopes Wave 1+2 and writes Wave 3 brief.

**Session file:** `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md`

---

### [2026-05-16] — BOARD VERDICT on agent rethink — SHIP with hard scope reduction + 5-day cap

**Decision:** The 6-persona board meeting (Visionary, Strategist, Architect, Risk-Modeler, Customer-Voice, Broad-Adversary) reviewed the agent rethink plan in 4 rounds (R0 framings, R1 independent, R2 cross-critique, R3 synthesis). Adam accepted the synthesis 2026-05-16.

**Verdict:** SHIP with hard scope reduction. Execute **Phases 0 + 1 + 6-subset only** (~4 person-days). Defer Phases 2-5 and 7 to post-first-revenue. **5-calendar-day hard cap** on execution. Product work begins Day 6 regardless of completion state.

**10 locked decisions (with source_persona_round citation — Zod-validated, no hallucination):**

1. **Phase 0 ships immediately** (already executed this session — orphan skills + GSD agents archived, .agent/agents/ deleted, renames done) — universal consensus including Broad-Adversary | broad-adversary-r2 | easy
2. **5-calendar-day hard cap** on entire rethink execution. Day 5 = hard stop. Product work begins Day 6 regardless | risk-modeler-r2 | easy
3. **Scope reduction:** Phases 0 + 1 + 6-subset only (~4 person-days). Phases 2-5 and 7 defer to post-first-revenue | architect-r2 | easy
4. **Deterministic file-path tier-floor YAML map** replaces the Haiku tier classifier (10 lines, zero LLM cost, ships Phase 1 Day 1) | risk-modeler-r1 → architect-r2 changed mind | easy
5. **FM-12 (plan abandonment) is the #1 ranked risk** at 50-65% probability. Mitigated by 5-day cap + clean Phase 2 stopping point | risk-modeler-r2 | easy
6. **Codex CLI graceful-degradation clause:** if `codex review --diff` fails (auth expired, binary not found, CLI breaking change), proceed with Claude-only multi-judge + audit_log row `status: codex_unavailable`. Never hard-block merges | architect-r1 | easy
7. **Mem0 vendor lock-in formally accepted** (this entry constitutes the acceptance). 6-month review trigger = 2026-11-16. Write-ahead queue (Supabase `mem0_pending_writes`) + export pipeline design deferred to Phase 3 (post-first-revenue) | strategist-r1 + r2 | hard
8. **Full-tier QA threshold = 300 LOC** during pre-revenue MVP sprint (not 100). Feature-flagged API/DB code → Lite tier with mandatory post-sprint Full review. Reverts to 100 LOC after first paying customer | strategist-r2 | easy
9. **Product work begins Day 6** regardless of which phases completed. Rethink does NOT block product work. Phases 3-7 execute in parallel with product sprints OR defer to post-first-revenue | visionary-r2 | easy
10. **PostToolUse typecheck hook scoped to edited files only** (per-file `tsc --noEmit`, not full monorepo `pnpm typecheck`). <1s latency vs 3-8s. Prevents FM-13 (typecheck cascade session timeout) | architect-r1 | easy

**4 open questions (deferred to in-flight decisions during Phase 1 execution):**

- **OQ-1:** Phase 1 scope — does CTO+CPO authoring fit in 4 person-days, or only schema standardization of existing files?
- **OQ-2:** Phases 3-7 trigger — first scan? first revenue? first production agent failure?
- **OQ-3:** Is Phase 1 itself premature? Broad-Adversary + Customer-Voice R2 said "Phase 0 only"; 4 others overruled
- **OQ-4:** Auto-Unblock per-ticket idempotency (FM-2 mitigation) — ship date if Phase 4 is deferred?

**Preserved dissent — Broad-Adversary KILL (formal record):**

Verdict: KILL. Thesis-collapse probability 65% (R2, down from 70% in R1). Thesis: "Plan #5 in a project with 0% plan-completion rate. 37 days zero customer-facing commits. Existing system works. Ship Phase 0 only, then a real customer feature this week."

Vindication conditions (monitoring triggers — if any fires, board reconvenes with Adversary's recommendation as default):
1. FM-12 fires: rethink abandoned mid-Phase-1 leaving half-migrated system
2. 5-day cap violated (execution bleeds into week 2+)
3. Plan #6 proposed before first customer-facing feature ships
4. Day 30 (2026-06-15) post-rethink with zero customer-facing features shipped

If any of these triggers, the Adversary was right and the board was wrong. Adam must reconvene the board OR unilaterally pivot to "Phase 0 only + ship product."

**Board overruled the KILL on scope-reduction grounds, not on thesis grounds.** Final locked scope (4 person-days, Phases 0+1+6-subset) is closer to "Phase 0 only + ship product" than to the original 7-phase plan. The KILL is preserved as a real possibility, not paraphrased away.

**Sources (12 R1+R2 review artifacts, all under `docs/08-agents_work/2026-05-16-agent-rethink/board-review/`):**
- R1-visionary.md, R1-strategist.md, R1-architect.md, R1-risk-modeler.md, R1-customer-voice.md, R1-broad-adversary.md
- R2-visionary.md, R2-strategist.md, R2-architect.md, R2-risk-modeler.md, R2-customer-voice.md, R2-broad-adversary.md
- R3-synthesis.md (the locked synthesis)

**Affects:**
- Next CEO session: brief for Phase 1 with hard 5-day cap + scope reduction
- All future agent specs: 300-LOC threshold rule (until first paying customer)
- Mem0 integration: 6-month review trigger set 2026-11-16
- QA-Lead behavior: file-path tier-floor map is the deterministic enforcement
- PostToolUse hook design: per-file `tsc --noEmit` scoping
- DECISIONS.md monitoring: 4 Broad-Adversary vindication triggers active until 2026-06-15

**Reversibility:** 9 of 10 locked decisions are EASY-reversible (file deletes, prompt edits, schedule changes). 1 of 10 (Mem0 lock-in #7) is HARD-reversible with the 6-month export-pipeline trigger as the safety valve.

---

### [2026-05-16] — AGENT RETHINK — C-suite org locked, 13 workers, 4-tier QA with Codex second-opinion

**Decision:** Reorganize the Beamix agent system from 3 coexisting models (legacy 9-lead + new C-suite + GSD pipeline, 36+ files) into a focused production architecture: CEO (Opus 4.7) → 6 C-suite (CTO/CPO/CMO/CBO/QA-Lead/Research-Lead) + design-lead under CPO → 13 workers + 11 standing Routines + 7 board personas. CCO is folded into CPO (no separate customer chief at this stage). The 4-tier QA gate (Trivial/Lite/Full/Irreversible) becomes the structural enforcement layer with Claude primary judge + ChatGPT Codex CLI as a second-perspective reviewer on Full+ tiers (interactive sessions only — Anthropic Routines fall back to multi-Claude judges since Codex CLI isn't available in the Anthropic Routine cloud).

**Rationale:** The existing system had two CEO files in two directories with divergent operating models; CTO referenced workers (`backend-engineer`) that don't exist as files (`backend-developer`); 12 GSD-pipeline agents (6,800 lines) had zero live callers; 305 of 430 skills were orphans (~680K dormant tokens). The rethink: standardize identity (C-suite), standardize naming (`-engineer`), standardize schema (declarative frontmatter + 8-section body), cut dead weight (305 orphan skills + 10 GSD agents → `.archive/`), add 14 Beamix-specific skills the war-room needs (`war-room-orchestration`, `linear-mvp-recipe`, `mem0-patterns`, `qa-gate-protocol`, etc.), and structurally enforce the 4-tier QA gate via PostToolUse hooks + qa-lead-pass.yml + Codex CLI invocation from Bash.

**Supersedes:**
- [2026-04-15] 9-lead org model (build/product/design/qa/devops/data/growth/business/research-lead) — replaced by C-suite (CTO/CPO/CMO/CBO/QA-Lead/Research-Lead). devops-lead → devops-engineer (worker demotion). data-lead → data-engineer (worker demotion). build-lead, product-lead, growth-lead, business-lead → archived after C-suite replacements ship.

**Affects:**
- All `.claude/agents/*.md` files (renames, refactors, schema standardization)
- `.agent/agents/` (deleted — canonical is `.claude/agents/`)
- `.claude/skills/` (305 orphans archived; MANIFEST regenerated)
- `CLAUDE.md` (rewritten to C-suite model)
- `.claude/settings.json` (strict Bash allowlist; PostToolUse extension for lint+typecheck)
- `.github/workflows/qa-lead-pass.yml` (XML `<verdict>PASS</verdict>` parsing + tier check)

**Reversibility:**
- EASY: agent renames + skill archive moves (git revert)
- MEDIUM: CLAUDE.md rewrite (manual restore from git history)
- HARD: schema standardization across 30+ files (mechanical refactor; reverse would be larger work than redo)

**Phasing:**
- Phase 0 (hygiene, this session): archive orphans, rename workers, update CLAUDE.md/settings/qa-lead-pass.yml, log decisions
- Phase 1-7 (deferred to follow-up CEO sessions): schema standardization, author CPO/CMO/CBO, author 14 skills, author 11 Routine .md files, author 7 board personas, hooks (Codex CLI integration), Promptfoo CI, /war-room dashboard refinement

**Plan documents (read-once source of truth):**
- `docs/08-agents_work/2026-05-16-agent-rethink/01-AGENT-INVENTORY.md` (current state audit)
- `docs/08-agents_work/2026-05-16-agent-rethink/02-SKILLS-AUDIT.md` (430→110 skills + 14 new)
- `docs/08-agents_work/2026-05-16-agent-rethink/03-EXTERNAL-RESEARCH.md` (10 GitHub repos to steal from)
- `docs/08-agents_work/2026-05-16-agent-rethink/04-QA-QUALITY-RESEARCH.md` (4-tier matrix + evaluator-optimizer)
- `docs/08-agents_work/2026-05-16-agent-rethink/05-MASTER-PLAN.md` (the full plan, 1138 lines)
- `docs/08-agents_work/2026-05-16-agent-rethink/06-DECISIONS-LOG.md` (all 40 interview decisions)

**40 interview decisions (compressed):**
CEO=Opus-4.7 · CCO folded into CPO · CBO single · Design under CPO · 13 workers (merged qa-eng→test-eng, adversary→security-eng Full mode, product-designer→frontend-eng) · `-engineer` naming · debugger+codebase-mapper refactored to ~250 lines · workers don't write Linear · Trivial = deterministic hook only · Codex CLI via Bash on Full+ (local sessions only) · 2-of-3 majority for Irreversible · per-PR bypass no TTL · Mem0 primary + Anthropic Memory Tool auto-fallback · USER-INSIGHTS = CPO+CMO only · skills+C-suite parallel · 90d archive · 1 sub-ticket per worker · PR per worker · CTO Daily Plan + Content Idea auto-create tickets · loud Telegram for Morning Digest/Advisor/EOD · iOS/Telegram deferred · pgvector = DECISIONS+sessions+brain+skills · `.agent/agents/` deleted · Phase 0 in-session · Routines already provisioned · Promptfoo yes Phase 7 · 3 different rubric prompts for multi-judge · subscription-bound cost (Max + ChatGPT Plus, future Max 20×) · /war-room minimal rebuild after research · Codex local-only accepted · /war-room minimal+useful · Trivial via PR with branch protection · auto-fallback Mem0 3 retries · colors per CLAUDE.md table · 50-entry DECISIONS cap · Mem0 metadata 5 required fields · 7 board personas kept · 13 slash commands rewritten · GSD orphans archived · strict Bash allowlist · done signal = 7 days clean operation.

---

### [2026-05-13] — WS6 PROPOSED — War-Room Agent Roster + Bridge Cleanup

**Status:** PROPOSED — becomes LOCKED after Adam executes `docs/08-agents_work/ADAM-CHECKLIST-WS6-PROVISIONING.md` and smoke fires verify all 11 new Routines.

**Locked design decisions (Q1-Q15, 2026-05-12):** see `.claude/agents/war-room/INDEX.md` for the full Q-list. Highlights:
- **Q11 ADD `security-watcher`** Routine (daily 20:45, Sonnet, +$9/mo) — closes the gap where all 10 DR runbooks rely on Adam manually polling.
- **Q12 REJECT `ai-search-rank-tracker`** — Beamix product itself will track its own AI-SERP in the future; war room defers.
- **Q13 RECLASSIFY personas + workers as NOT Routines** — 4 personas and 6 workers are Task subagent templates only. Final Routine count: 12 (not 21). Saves 10 claude.ai slots + 20 wrangler secrets.
- **Q14 WIRE `@board` Linear comment handler** — bridge now detects `@board` in a Linear comment, synthesizes a trust spec server-side (5-min expiry, scope.intent='board'), and fires Synthesizer. No more silent deadlock.
- **Q15 NARROW Q7** — Telegram P0 allowed for 3 specific anomaly carve-outs (canary write failure ≥2 cycles, fire-rate spike >1.5× spec.max_fires_per_day, audit_log schema validation failure). Routine cost reporting remains silent.
- **Q4 Per-Routine token split RESOLVED** — every Routine has its own bearer token. No shared-CEO-token blast radius.
- **Q8 routing.ts cleanup** — stripped 8 stale labels (agent:ceo, agent:cto, agent:cmo, agent:cpo, agent:cbo, agent:cco, agent:qa-lead, agent:customer-voice). Renamed agent:competitor-signal → agent:competitor-pulse. Added 4 new env keys.

**Architectural fixes from deep review (HX1-HX3):**
- HX1: CTO Daily Plan is a "work proposal for Adam," NOT an autonomous dispatcher. Routines fire-and-terminate — they cannot spawn Task subagents. Worker dispatch happens interactively in Adam's CEO session.
- HX2: Synthesizer invokes 4 personas via Task tool in `round_sequence` order: visionary → architect → strategist → aria. Personas are not standalone Routines.
- HX3: Auto-Unblock has hard 3-cascade max. On cascade 4: escalate to Adam (Linear comment + Telegram P0 per Q15 carve-out). Triggers: `routine.timeout` (from Inngest) or `worker.stuck` (from parallel-watcher).

**Single highest-leverage hardening landed:**
- `apps/web/src/inngest/functions/audit-log-canary.ts` (D5 CC4) — 15-min cron writes `row_kind='internal_event'` with `spec.event_kind='canary'` via service-role + reads back. Two consecutive failures = Q15 carve-out → Telegram P0 (logged + `telegram_p0_pending` audit row until Telegram bot is deployed).

**Files in scope:**
- `.claude/agents/war-room/*.md` — 22 agent files (12 Routines + 6 worker templates + 4 persona templates)
- `.claude/agents/war-room/INDEX.md` — locked roster + provisioning checklist
- `infra/cloudflare-bridge/src/routing.ts` — 12-Routine env map + per-Routine token split + `detectBoardCommand` for Q14
- `infra/cloudflare-bridge/src/index.ts` — `@board` handler in `handleCommentCreated` (Q14); switched to env-driven `resolveRoutineId` instead of static placeholder map
- `infra/cloudflare-bridge/wrangler.toml` — updated secret list comments
- `apps/web/src/inngest/functions/audit-log-canary.ts` — NEW
- `docs/08-agents_work/ADAM-CHECKLIST-WS6-PROVISIONING.md` — NEW (Adam-action checklist)
- `docs/08-agents_work/WS6-DEEP-REVIEW-AND-DELTAS.md` + `WS6-DEEP-REVIEW-FOR-HUMANS.md` — 5-critic synthesis
- `docs/08-agents_work/WS6-SYNTHESIS-AND-OPTIONS.md` + `WS6-DESIGN-FOR-HUMANS.md` — first synthesis

**Affects:**
- WS7 (worker dispatch flow): not yet started. Worker .md templates exist as scaffolds; live dispatch requires future workstream.
- Anthropic Routine provisioning: Adam must execute `ADAM-CHECKLIST-WS6-PROVISIONING.md` to flip PROPOSED → LOCKED (11 Routines in claude.ai + 22 wrangler secrets + cron config).
- Bridge production deploy: `wrangler deploy` after Step 2 of the checklist.

**Cost:** ~$170/mo Max-quota Routine spend projected (per ROUTINE-ROSTER.md). No incremental API billing.

**Reversible?** All code reversible via git. routing.ts changes do NOT remove the CEO Entry Point Routine itself (still provisioned from WS4, just not routed). Bridge cleanup is forward-only once deployed — stale label fires now return 422.

**Status:** PROPOSED. Becomes LOCKED after Adam executes provisioning checklist + smoke fires green + QA Lead PASS on PR #72 + merge to main.

**See:**
- PR: https://github.com/Adam077K/beamix/pull/72
- Adam checklist: `docs/08-agents_work/ADAM-CHECKLIST-WS6-PROVISIONING.md`
- Roster: `.claude/agents/war-room/INDEX.md`

---

### [2026-05-11] — WS5 LOCKED — War Room Master synthesis doc

**Decision:** WS5 (synthesis master document for the war-room rethink) is LOCKED. The technical master at `docs/08-agents_work/WAR-ROOM-MASTER.md` (520 lines) is the single source of truth for everything WS1A-WS4 produced; the plain-English companion at `docs/08-agents_work/WAR-ROOM-MASTER-FOR-HUMANS.md` (~3,300 words, 13 min read) is the read-once onboarding doc for any future agent or human picking up the war room.

**Scope:** Synthesizes WS1A (Mem0 decision), WS1B (L0-L5 memory architecture), WS2 (ORCHESTRATION + spawning matrix + trust spec contract), WS3 (TECH-STACK BOM + DR runbooks + scaling cliffs), WS4 (Connection Layer + smoke tests + production deploy verification).

**Why locked now:** WS4 DEPLOY VERIFIED proved the design works end-to-end. The master doc froze the architecture before WS6 (agent .md files) starts adding implementation detail on top.

**Reversible?** Master doc is forward-only as a snapshot — it'll be updated as a separate WS6/WS7 entry when material changes happen. Plain-English companion is regenerated from the master when needed.
**Status:** LOCKED.
**See:** `docs/08-agents_work/WAR-ROOM-MASTER.md`, `docs/08-agents_work/WAR-ROOM-MASTER-FOR-HUMANS.md`.

---

### [2026-05-11] — WS4 PRODUCTION DEPLOY VERIFIED — Pipeline live end-to-end

**Decision:** WS4 is no longer just LOCKED in code — it is **operationally live** as of 2026-05-11. The Linear → Cloudflare bridge → Anthropic Routine → Supabase audit_log pipeline fires end-to-end in production, with verifiable side effects on every layer.

**Verification artifact:** Linear ticket **ADA-20** ("smoke-test-e2e-pipeline-A"), created 2026-05-11 10:49 UTC. Produced:
1. Bridge HMAC pass (`linear-signature` header)
2. `findRoutingLabel("board-meeting")` matched
3. `resolveRoutineId("board-meeting", env)` returned `trig_016HLUqwYqQA2sQjEEiNWw2u` from env-driven config
4. KV nonce dedup + `FireCountDO` rolling-24h check passed
5. `RoutineLock` Durable Object acquired
6. `audit_log` row written: `status='fired', row_kind='routine_dispatch', linear_ticket='ADA-20', nonce=<uuid>, spec includes _signature` — Q3 schema honored
7. POST to `https://api.anthropic.com/v1/claude_code/routines/trig_016HLUqwYqQA2sQjEEiNWw2u/fire` with `anthropic-beta: experimental-cc-routine-2026-04-01` + sentinel-wrapped spec in `text` body returned HTTP 200
8. Anthropic Console "Runs" page for `ceo-entry-point` confirms a new run at 13:49 (was empty before this test)

**Cumulative bridge deploys this phase (chronological):**
| Version ID | What it fixed |
|---|---|
| `dc48d641-...` (2026-05-08) | Initial deploy with KV + DO bindings |
| (multiple intermediate) | Linear webhook path alias, audit_log writer respecting Q3 schema, linear-signature header, Issue-create vs Issue-update log discrimination, env-driven Routine IDs, rolling-24h FireCountDO, anthropic-beta header, /text body format |
| `c948a2e6-...` (2026-05-11) | Token regenerate via Playwright + new `ROUTINE_CEO_ENTRY_POINT_TOKEN`. First successful fire. |
| `41fd708` (commit, deploy pending) | `anthropic_error` audit row on non-2xx Anthropic response (board-meeting path) |

**Wrangler secrets state (11 set on bridge worker):** `BRIDGE_HMAC_SECRET, LINEAR_WEBHOOK_SECRET, SHORTCUT_SECRET, ANTHROPIC_API_KEY, ROUTINE_CEO_ENTRY_POINT_TOKEN, ROUTINE_CEO_ENTRY_POINT_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LINEAR_API_KEY, TELEGRAM_BOT_TOKEN, ADAM_TELEGRAM_CHAT_ID, ALLOWED_ISSUERS`.

**Other 10 Routines (per ROUTINE-ROSTER.md):** NOT yet provisioned. Each will need its own `ROUTINE_<NAME>_ID` + `ROUTINE_<NAME>_TOKEN` secret pair before its `Issue:created` path is fireable. WS6 task.

**Deferred (Adam said "not need" 2026-05-11):**
- **Telegram bot worker** — code exists at `infra/telegram-bot/`, `BRIDGE_HMAC_SECRET`/`BRIDGE_INTERNAL_URL`/`ADAM_TELEGRAM_CHAT_ID` not yet set, KV namespace placeholder unfilled. Skip until needed.
- **iOS Shortcut** — code exists at `infra/shortcuts/Capture-Beamix-Idea.shortcut.json`, URL placeholder fixed to `YOUR_CF_ACCOUNT.workers.dev` pattern (commit `c750884`). Skip until needed.

**Smoke test results:**
- **Test A** (cron exemption from 15/day cap): MOOT — Adam's discovery 2026-05-08 that Anthropic doesn't 429 at 15/day; instead overages bill silently against Console-billed `ANTHROPIC_API_KEY`. Bridge `FireCountDO` enforces the hard 24h rolling cap (15) so overage billing is prevented at source.
- **Test B** (Retry-After granularity): WARN at 16 fires, all 200. Confirmed Anthropic overages silently rather than 429. Bridge rolling-window cap is the protective layer.
- **Test C** (Mem0 stability): SKIPPED per Adam.
- **Test D** (concurrent fire): PASS — 6/6 concurrent fires returned HTTP 200. Bridge needs no semaphore.

**Architectural learnings surfaced during deploy (now in code/docs):**
1. **Anthropic doesn't 429 at the 15/day cap — it silently routes overage to Console-billed `ANTHROPIC_API_KEY`.** Bridge enforces via `FireCountDO` rolling-24h window (Adam decision: not calendar-day, prevents midnight-burst). Constant = `MAX_FIRES_PER_24H = 15`.
2. **Routines on Max subscription = 5h-window quota. Adam aligns 4 fire-windows per day (05:30 / 10:30 / 15:30 / 20:30)** to maximize Max quota across the day. Documented in `docs/08-agents_work/ROUTINE-ROSTER.md`.
3. **CEO interactive, not a Routine.** Adam 2026-05-08 pivot. 11 specialized Routines slotted into the 4-window schedule; the originally-planned CEO/CMO/CPO/CBO/CCO Routine receivers are dropped in favor of Adam running CEO interactively on his machine.
4. **Linear webhook header is `linear-signature` (NOT GitHub-style `X-Hub-Signature`).** Bridge accepts both for defensive compatibility.
5. **Anthropic Routines `/fire` API requires the `anthropic-beta: experimental-cc-routine-2026-04-01` header AND `{"text": "..."}` body (not the structured `{spec: {...}}` body originally designed).** Bridge wraps the HMAC-signed trust spec in `<beamix-spec>...</beamix-spec>` sentinels inside the `text` field. Routine system prompts will extract + validate the spec from the text.
6. **Linear `Issue:created` only fires on `board-meeting` label.** All other agent routing requires a `Comment:created` event with a sentinel-bracketed spec comment (per WS2 §2B design).
7. **Routine IDs vs bearer tokens are TWO distinct values** (`trig_...` ≠ `sk-ant-oat01-...`). Both must be configured separately via wrangler secrets.

**Decided by:** CEO (this session, Opus 4.7) + Adam through E2E verification flow on 2026-05-11.
**Verified by:** Agent A (`general-purpose` with Playwright + Supabase MCP), full report at `docs/08-agents_work/sessions/2026-05-11-ceo-ws4-deployed.md`.
**Affects:**
- **WS5 (synthesis master doc):** UNBLOCKED — start now.
- **WS6 (agent .md files):** UNBLOCKED. First WS6 tasks: write Routine .md files per ROUTINE-ROSTER.md, provision the other 10 Anthropic Routines + tokens, populate `ROUTINE_<NAME>_ID` + `ROUTINE_<NAME>_TOKEN` wrangler secrets, set the 4-window cron schedules in Anthropic Console.
- **Cost:** ~$200/mo Max-quota Routine spend projected (per ROUTINE-ROSTER.md). No incremental API billing until/unless Adam upgrades to Max 20×.
**Reversible?** Code is reversible via git. Operational state (live KV namespace, Durable Objects with 5-min lock TTL, real audit_log rows) is forward-only. The 8 historical `rule_violation` + `fired` rows from the diagnostic period are now harmless noise in audit_log.
**Status:** LOCKED & DEPLOYED.
**See:** `docs/08-agents_work/sessions/2026-05-11-ceo-ws4-deployed.md`, `docs/08-agents_work/ROUTINE-ROSTER.md`, `docs/08-agents_work/ADAM-CHECKLIST-WS4-DEPLOY.md`, audit_log row for ADA-20 (`status=fired, row_kind=routine_dispatch, ts=2026-05-11 10:49:50 UTC`).

---

### [2026-05-08] — WS4: Connection Layer LOCKED (12 revision clusters + 5 Adam decisions)
**Decision:** WS4 (Cloudflare bridge + Telegram bot + iOS Shortcut + 11 Inngest functions + Supabase observability migration + `/war-room` page + qa-lead-pass workflow + WS2 Zod schemas) LOCKED. 4 parallel adversarial critics produced 55 unique findings (1 CRITICAL / 19 HIGH / 25 MEDIUM / 10 LOW). 12 revision clusters (R1-R12) applied to code. 5 questions resolved by Adam (Q1-Q5). Security critic agent failed (truncation); coverage absorbed by bridge + Inngest critics' security findings.
**Adam's 5 decisions (2026-05-08):**
- **Q1:** ADD `telegram_send_failed` to `audit_log.status` enum (15 values total). Runbook contract honored over errata 1's 14-value list.
- **Q2:** `parent_audit_log_id` FK uses `ON DELETE SET NULL`. Children survive 90-day parent retention; lineage chain is recoverable from `nonce`/`fan_in_key`. (Rejected RESTRICT for breaking retention permanently; rejected CASCADE for losing recent children.)
- **Q3:** `row_kind text NOT NULL CHECK (row_kind IN ('routine_dispatch','internal_event'))` discriminator + partial UNIQUE on nonce ONLY for dispatch rows. Internal observability rows skip nonce; dispatch rows MUST have it (CHECK enforces). (Rejected throwaway-UUID model for double-purposing the column and obscuring intent.)
- **Q4:** Per-Routine bearer tokens deferred to WS6. Shared `ROUTINE_CEO_ENTRY_POINT_TOKEN` ships in WS4 with documented FOLLOW-UP — WS6 must split before Routine A/B smoke tests run in production. Acceptable revoke-blast-radius risk during build phase.
- **Q5:** ALLOW Auto-Unblock 3-cascade Telegram-ping. Cap = `MAX_UNBLOCK_CASCADE_DEPTH = 3`. After 3 cascades, write `audit_log.status = 'over_budget'` with `event_kind = 'auto_unblock_max_attempts'` AND fire `🚨 Auto-Unblock cascaded 3× under <ticket>. Manual intervention required.` to Telegram. Tagged in code as Q5 EXCEPTION (incident escalation, NOT cost alert) — narrow Q7 carve-out for structural-failure escalation only.
**12 revision clusters applied:**
- **R1 (CRITICAL):** Fan-in barrier rewritten to query Linear GraphQL (sibling sub-ticket states) instead of `audit_log.status`. The audit-log-based check was inverted twice over and would have hung every fan-out flow forever.
- **R2 (HIGH):** Idempotent dispatch — `handleIssueCreated` now goes through KV nonce + DO lock; `FireCountDO` Durable Object replaces non-atomic KV `get/put` counter; all 3 affected Inngest functions use `step.sendEvent` (not `inngest.send` inside `step.run`).
- **R3 (HIGH):** HMAC scope hardened — `X-Beamix-Timestamp` header on every signed request, 5-min skew rejection; iOS Shortcut payload embeds `nonce`; `/telegram` endpoint now HMAC-verifies via shared `verifyHmacSignature` helper; recursive canonical-JSON serializer replaces broken `JSON.stringify(spec, sortedTopLevelKeys)`; `audit_log.nonce` partial-UNIQUE-with-CHECK enforces presence for dispatch rows.
- **R4 (HIGH):** DO lock alarm uses min-heap pattern — earliest-expiring lock owns the alarm; alarm handler reschedules for next-earliest surviving lock. Eliminates zombie-lock class.
- **R5 (HIGH/MED):** Haiku tier classifier `AbortSignal.timeout(8000)` + moved AFTER `acquireLock`+`writeAuditLog` so slow Anthropic responses don't pin dispatch pipeline. Per-Routine token split deferred to WS6 (Q4 LOCKED).
- **R6 (HIGH/MED):** Word-boundary `@mention` regex; `@board` → `agent:synthesizer` added to Telegram routing; `risk:irreversible` label now structurally enforced in qa-lead-pass.yml; case+whitespace-tolerant `qa_verdict: PASS` grep; multi-segment branch slug regex collapses internal slashes; iOS Shortcut reads bridge response status code + dictation-empty guard.
- **R7 (HIGH × 4):** pgvector RAG embed pipeline was DEAD-ON-ARRIVAL (`changed_files` vs `changed_paths` typo). Standardized on `changed_paths`. Per-file try/catch in 3 embed functions. OpenAI batches capped at 100 inputs with `Retry-After` parsing. Filter excludes `.d.ts`, `.snap`, `__snapshots__/`, `.generated.ts`, `database.types.ts`.
- **R8 (HIGH/MED):** Migration overhauled — `telegram_send_failed` enum value (Q1), `ON DELETE SET NULL` (Q2), `row_kind` discriminator + partial UNIQUE on nonce (Q3), `audit_log_aggregate_for_date(p_date)` SQL function created (no more silent-error-on-primary-path), `IF NOT EXISTS` everywhere (idempotent re-apply), agent-index `idx_audit_log_agent_ts`, `event_kind` column, `failures NOT NULL DEFAULT 0`, `runtime_s >= 0` CHECK.
- **R9 (HIGH × 3 + MED × 4):** War-room safety — removed `as any` Supabase cast; ADAM_EMAIL throws at module load in production; `MAX_TRACE_DEPTH = 8` + visited-set cycle detection in `buildTraceNode`; `.limit(50)` on children query with truncation flag; `useEffect` (not `useState`) initializes async trace load; hybrid Realtime + 30s polling on TodaySection; `loading` state wired correctly.
- **R10 (MED × 3):** `issues: read` GitHub permission added (bypass-comment lookup now works); inline `style={{ }}` props converted to Tailwind arbitrary values `[grid-template-columns:...]`; dark-mode hex variants on all status indicators (`#3370FF dark:#5A8FFF`, etc.).
- **R11 (MED/LOW):** `runaway-watcher` trigger changed from "single-row > $1" to "session accrued cost > spec.budget × KILL_MULTIPLIER (1.2)" — sums via `nonce`/`parent_audit_log_id` chain. All `cost_usd` reads wrapped in `Number()` (Supabase numeric returns string). Auto-Unblock cascade depth guard (Q5). `validateChildScope` rejects negative remaining budget. `source_persona_round` regex-validated in Zod.
- **R12 (LOW):** `/health` minimal response unauth + detailed state behind bearer; rotation script writes new secret to temp file, prints only path; trust spec adds `issued_by.telegram_chat_id` (Telegram fires no longer abuse `linear_user_id`); Shortcut README adds Keychain-stored API key as Option B; `claude_progress.status = 'killed'` writer added in runaway-watcher; agent-index, `runtime_s` CHECK, `event_kind` (covered in R8).
**Smoke tests:** Sub-phase 0 deferred to operational deploy. A+B (cron exemption + Retry-After granularity) run as 24h background once Anthropic Routines are provisioned by Adam. C+D (Mem0 MCP load + concurrent fire) run synchronously before first production fire.
**Files written/modified:**
- `infra/cloudflare-bridge/src/{index.ts (+1100 lines), durable-object.ts (+min-heap alarm), routing.ts (+@board), audit.ts}`, `infra/cloudflare-bridge/scripts/rotate-bridge-hmac.ts`, `infra/cloudflare-bridge/{wrangler.toml (+FireCountDO binding+v2 migration), package.json, README.md}`
- `infra/telegram-bot/{wrangler.toml, src/index.ts (+timestamp HMAC)}`, `infra/shortcuts/{Capture-Beamix-Idea.shortcut.json (+nonce+failure feedback+empty-dictation guard), README.md}`
- `apps/web/supabase/migrations/20260508_war_room_observability.sql` (overhauled — 15-value enum + row_kind + partial UNIQUE + RPC function + idempotent)
- `apps/web/src/inngest/functions/*.ts` (11 functions: fan-in-watcher Linear-rewritten, routine-timeout-watcher with Q5 cascade depth, parent-ticket-expiry-watcher, audit-log-rollup, cost-watchdog, runaway-watcher, embed-{decisions,sessions,brain,codebase,skills}); `apps/web/src/inngest/events.ts` (`changed_paths` standardized)
- `apps/web/src/lib/embeddings/embed-corpus.ts` (batch + Retry-After), `apps/web/src/lib/orchestration/{spec.ts (+telegram_chat_id IssuedBy), board.ts (+source_persona_round regex)}`
- `apps/web/src/app/(internal)/war-room/{layout.tsx, page.tsx, components/*, lib/queries.ts}` (auth + TraceTree + Realtime + dark-mode)
- `.github/workflows/qa-lead-pass.yml` (+`issues: read` + `risk:irreversible` step + tolerant grep + multi-segment slug); `.github/pull_request_template.md`
- `docs/08-agents_work/{WS4-CRITIQUE-AND-REVISIONS.md, WS4-CRITIQUE-FOR-HUMANS.md, sessions/2026-05-08-ceo-ws4-locked.md}` + 4 critic files at `2026-05-08-agent-build/CRITIQUE-WS4-*.md`
**Cumulative session cost:** ~$95-110 (within $150 cap; WS3+WS4 combined). WS3 ~$30, WS4 build $20-25, WS4 critics $20, synthesis $5, applied revisions $20-25.
**Adam-action checklist (post-LOCK, cannot be done by agents):**
1. Cloudflare Workers Paid plan upgrade ($5/mo) on Adam's Cloudflare account.
2. `wrangler kv:namespace create BRIDGE_STATE_KV` + fill `wrangler.toml` placeholders.
3. Cloudflare Worker deploy: `wrangler deploy` from `infra/cloudflare-bridge` (creates RoutineLock + FireCountDO Durable Objects via v1+v2 migrations).
4. 10 standing Anthropic Routines provisioned in Anthropic Console with single shared CEO bearer token (Q4 deferred per-Routine split to WS6).
5. Helicone proxy configured for product API (NOT Routines).
6. Linear webhook secret + bot user accounts (one per agent).
7. Telegram bot via BotFather; set `BRIDGE_HMAC_SECRET` shared between bridge + bot.
8. Apply migration on staging first (`mcp__supabase__apply_migration`), then production.
9. Run smoke tests A/B (24h background) and C/D (synchronous) once provisioning complete.
**Decided by:** CEO (this session, Opus 4.7) + Adam Q1-Q5 sign-off on 2026-05-08.
**Affects:** WS5 (synthesis master doc folds in WS3+WS4 — UNBLOCKED); WS6 (60+ agent .md files now have stable trust spec contract + per-Routine token split is the first WS6 task — UNBLOCKED); production deploy (Adam-action checklist must complete before first fire).
**Reversible?** R1+R7 are mechanical fixes (no rollback needed). R2-R6 + R8 + R10-R12 reversible via git. R9 reversible. Q1-Q3 (migration changes) HARD to reverse after data accumulates — Q3 row_kind discriminator in particular is forever (column rename = hours of zero-downtime migration on a populated table).
**Status:** LOCKED — Adam approved 2026-05-08.
**See:** `docs/08-agents_work/WS4-CRITIQUE-AND-REVISIONS.md`, `docs/08-agents_work/WS4-CRITIQUE-FOR-HUMANS.md`, `docs/08-agents_work/sessions/2026-05-08-ceo-ws4-locked.md`, `docs/08-agents_work/2026-05-08-agent-build/CRITIQUE-WS4-{bridge,inngest,supabase,war-room}.md`, `docs/08-agents_work/SMOKE-TESTS-WS4.md`, `docs/08-agents_work/CONNECTIONS.md`.

---

### [2026-05-08] — WS3: Tech Stack BOM, DR runbooks, Scaling Cliffs LOCKED
**Decision:** WS3 (war-room tech stack + 10 DR runbooks + cost instrumentation + scaling cliffs) LOCKED per `docs/08-agents_work/TECH-STACK.md` (BOM) + 10 runbook files at `docs/07-history/runbooks/`. War-room incremental new spend = **$5/mo** (Cloudflare Workers Paid). Mem0 stays free Hobby; upgrade to Starter $19/mo on-demand only when Hobby exhausts (Adam Q1). Inngest Pro corrected to **$75/mo** (was $150/mo in 2026-04-27 entry; verified via inngest.com/pricing on 2026-05-08). 7 critic-surfaced clusters of revisions (R1-R7 + R11) applied. R8/R9/R10 (procurement-grade compliance gaps) DROPPED from war-room scope after Adam's framing course-correction: war room is INTERNAL INFRA for Adam, not a customer-facing product; product-compliance items moved to `docs/security/PRODUCT-COMPLIANCE-BACKLOG.md`.
**Adam's 8 decisions (2026-05-08):**
- **Q1:** Mem0 stays free Hobby; upgrade to $19/mo Starter on-demand. Don't pre-pay.
- **Q2-Q5:** DROPPED (procurement compliance moved to product workstream).
- **Q6:** Write all 3 missing runbooks (Inngest, Vercel, Telegram).
- **Q7:** **NO real-time cost alerts to Telegram.** Cost observed passively (`/war-room` page, monthly burn-down). Runaway-watcher silent kill stays as safety fence. Anthropic Console hard cap is backstop. System-status alerts (security, infrastructure failures) still ping; cost-rate alerts do not.
- **Q8:** Inngest Pro $75/mo verified; DECISIONS.md 2026-04-27 entry corrected.
**10 DR runbooks written:** anthropic-outage, linear-api-break, cloudflare-compromise, supabase-corruption, secret-rotation, github-compromise, mem0-outage, inngest-outage, vercel-outage, telegram-failure (each ~150-300 lines, Detection / Immediate / Mitigation / Recovery / Post-incident / Decision tree / Related signals / Telemetry checklist).
**16 R4 procedural fixes applied to runbooks:** bridge-resume KV CLI, cloudflare-compromise self-lockout reorder, github-compromise PAT race, BRIDGE_HMAC_SECRET atomic-swap procedure, supabase-corruption non-circular forensic sources, mem0 inline fallback (KV side-buffer references removed), parallel-runbook redeploy fallback, anthropic-outage manual orphan replay, linear-api-break holding-queue references removed (fail-open accepted), Supabase service-role Inngest pause-drain procedure, SQL placeholder definition, mem0 Routine-side fallback (no KV flag), anthropic-outage 'escalate' defined, supabase-corruption Vercel deploy ordering gate, secret-rotation per-day smoke-test list, Friday Retro Routine `supabase` MCP grant added (ORCHESTRATION.md errata).
**Cost-alert philosophy locked (Q7):** runaway-watcher silently kills sessions over `max_cost_usd × 1.2` (no Telegram), Anthropic Console $1500/mo hard cap is backstop, monthly burn-down at `docs/09-metrics/cost-burn-YYYY-MM.md` is passive surface, `/war-room` Vercel page shows live cost (passive). System-status Telegram alerts (Anthropic outage, Cloudflare compromise, QA Lead bypass) preserved.
**ORCHESTRATION.md errata footer added (6 items):** audit_log.status enum extension, board-meeting cost correction ($5.83/meeting, $46/mo), Friday Retro supabase MCP grant, cost-watchdog Telegram pings stripped, Inngest Pro $75/mo, war-room scope note (internal infra not customer product).
**DECISIONS.md hygiene:** pre-2026-04-15 entries (System Initialized, GSD→GSA, Supabase Auth, Paddle Only, Trial 7d, Pricing $49/$149/$349 [superseded], OpenRouter, Credit RPC, No n8n, scan_id) archived to `DECISIONS_ARCHIVE.md` per Adam's ≤50 active entries rule.
**Smoke tests deferred to WS4 sub-phase 0:** A (cron Routine 15/day cap exemption), B (`/fire` cap Retry-After granularity), C (Mem0 MCP under 40 round-trips), D (concurrent Routine cap behavior). A+B run in background while WS4 build proceeds (Adam Q-plan-2 2026-05-08); C+D run synchronously before build commits.
**Rationale:** WS3 deep design (TECH-STACK.md v0 + 7 DR runbooks) → 4 parallel Sonnet critics (BOM, DR, cost, procurement-adversary) → 57 unique findings (26 H / 21 M / 10 L) → CEO/Opus dense synthesis → technical-writer plain-language version → Adam decision (8 questions, 4 immediately answered, 4 partially deferred to product workstream after framing correction) → revisions applied unilaterally (R1-R7 + R11; R8-R10 dropped).
**Decided by:** CEO (this session, Opus 4.7) + Adam Q1-Q8 sign-off on 2026-05-08.
**Affects:** WS4 (smoke tests use the 4-test design; bridge code uses Workers Paid Durable Object dedup; audit_log enum extended with 6 new values; Friday Retro grants supabase; build phase proceeds with smoke A+B in parallel background); WS5 (synthesis master doc folds in TECH-STACK references); WS6 (Routine .md files use new MCP grants for Friday Retro; cost-watchdog Routine prompt strips Telegram-alert behavior; runaway-watcher Routine prompt makes kill action silent).
**Reversible?** EASY for cost-alert decisions (config change). MEDIUM for Mem0 upgrade strategy (1-click). HARD for the war-room-scope-correction (would re-introduce 12 procurement items into war-room scope, but that contradicts Adam's stated intent). Other revisions are mechanical doc fixes.
**Status:** LOCKED — Adam approved 2026-05-08.
**Cost spent this phase:** ~$28-30 (within $30 cap; pre-flight $0.20, runbook design $5, 4 critics $15-18, synthesis $2.50, plain-language $3, integration edits $3, worker dispatches $5).
**See:** `docs/08-agents_work/TECH-STACK.md`, `docs/08-agents_work/WS3-CRITIQUE-AND-REVISIONS.md`, `docs/08-agents_work/WS3-CRITIQUE-FOR-HUMANS.md`, `docs/07-history/runbooks/*.md` (10 files), `docs/security/PRODUCT-COMPLIANCE-BACKLOG.md`, `docs/08-agents_work/2026-05-06-agent-build/CRITIQUE-WS3-bom.md`, `docs/08-agents_work/2026-05-08-agent-build/CRITIQUE-WS3-{dr,cost,adversary}.md`, `docs/08-agents_work/sessions/2026-05-08-ceo-ws3-locked.md`, ORCHESTRATION.md errata footer.

---

### [2026-05-08] — Bastion concept dropped. War room is cloud-only.
**Decision:** Remove the "Bastion" (home PC as 24/7 host) from the architecture. The war room runs entirely in cloud services we already pay for: Anthropic Routines (runtime), Cloudflare Workers (bridge + Telegram relay), Vercel (Next.js + Inngest functions), Supabase (DB + Realtime + pgvector + audit_log + claude_progress + Mem0 OSS Phase 2 host). Adam's home Windows PC is a normal dev workstation with no special role — the war room runs whether it's on or off, off the grid, or replaced. The "Bastion" stack from V3 ($33/mo home Mac with tmux farm + Postgres mirror + Redis + MCP servers + Whisper + ONNX MiniLM + disler dashboard + Mem0 OSS) is superseded.
**Rationale:** Three things changed since V3 (2026-05-06) made Bastion the core runtime: (1) WS1A locked Mem0 cloud + Supabase pgvector — Bastion lost its memory-host role; (2) WS2 confirmed Anthropic Routines run in Anthropic's cloud on the Max subscription — Bastion lost its agent-runtime role; (3) WS2 critique exposed that disler hooks fire to `localhost:4000` which Anthropic cloud containers cannot reach — Bastion lost most of its observability role. With those three gone, the Bastion was holding only "your dev workstation" + "optional Mem0 OSS Phase 2 host" — neither of which justifies a special architectural concept. Cleaner mental model: dev work happens on whichever machine Adam is using; Mem0 OSS Phase 2 (when WS1F migrates from cloud) hosts on Cloudflare Workers / Railway / Fly.io for ~$0-5/mo with cloud uptime independent of Adam's PC being on.
**What this changes in WS2:** ORCHESTRATION.md updated — hard rules table goes from 4 to 3 (drop "Bastion = Windows PC"); §2G observability simplified to cloud-only production view + optional dev-machine disler; data flow diagram reorganized; implementation order drops Bastion install step. Net: war-room incremental new spend stays $5/mo (Cloudflare Workers Paid for Durable Objects).
**What this changes in WS3:** BOM drops Bastion line items. DR scenarios drop "home PC stolen / power out / hardware fail." Scaling cliffs drop "Bastion RAM tight at 25 customers." WS3 is now smaller scope.
**What this changes in WS6:** No Routine .md file references "Bastion." Worker .md files don't depend on local services. Mem0 OSS host (Phase 2) becomes a TBD cloud container, not a Bastion service.
**Decided by:** CEO + Adam (2026-05-08, in response to "why was I setting it up on my home PC if it doesn't even run there")
**Affects:** WS2 ORCHESTRATION.md; V4 env map Layer 8 (now historical/superseded); WS3 BOM; WS1F migration plan; all "Bastion = ..." references in any planning doc
**Reversible?** Easy — re-introducing a Bastion would just mean adding a small home service back to the BOM. Nothing locked in to "no Bastion."
**Status:** LOCKED
**See:** `docs/08-agents_work/ORCHESTRATION.md` §Adam's 3 hard rules + §2G; `~/.claude/projects/.../memory/project_cloud_only_architecture.md`; `docs/08-agents_work/sessions/2026-05-08-ceo-bastion-dropped.md`

---

### [2026-05-07] — WS2: Orchestration Architecture LOCKED (7 sub-decisions + 7 critique-driven revisions)
**Decision:** WS2 orchestration architecture LOCKED with revisions per `docs/08-agents_work/ORCHESTRATION.md` (v2 — supersedes the 2026-05-06 PROPOSED draft). 6 specialized critics produced 2 Critical + 33 High + ~25 Medium findings; Adam approved 7 decisions on 2026-05-07 that integrate the revisions. Net architecture: (2A) main-thread Routines spawn workers via Task; workers spawn nothing; CEO short-circuits to worker for Quick-tier; QA-Lead independent gate **enforced structurally** (C-suite Routines have NO `mcp__github__merge_pull_request` grant + GitHub branch protection + audit log on bypass attempts). (2B) Linear sub-ticket + Cloudflare bridge re-fire with **two-layer dedup** (KV ticket-scoped + Durable Object lock — Cloudflare Workers Paid $5/mo APPROVED). Tier classifier = Haiku at the bridge ($0.001/ticket) per Q3 model rule. (2C) Inngest stays + new functions (cost-watchdog, runaway-watcher, parent-ticket-expiry-watcher) for crash/cost/Inngest-outage recovery. (2D) Async-spec-trust HARDENED with all 8 security fixes: bridge-side issuer verification (Linear user_id allowlist + HMAC), spec sentinel-bracketed in comments only (never ticket bodies), `skip_pre_flight` removed entirely, mandatory nonce + expires_at, `out_of_scope` non-empty + bridge-enforced child-narrowing, audit_log written by 3 parties (bridge fired → agent accepted → watcher complete), platform-side `max_cost_usd` enforcement via runaway-watcher. (2E) **10 standing Routines** (was 9 + a Synthesizer made into Routine #10). Cron Routines run on Max subscription, NOT API billing — incremental $-cost is $0; `$-cap` fields are runaway ceilings. Cron exemption from 15/day cap = DEFERRED to WS4 smoke-test A. (2F) **4-round board meeting** (added Round 0 de-anchored framings) with **6 personas** (Visionary, Strategist, Architect, Risk Modeler, Customer Voice [NEW Q4], Adversary branched per Q7 = Aria for vendor decisions, broad-Adversary for strategic). Synthesizer mandatory `source_persona_round` field (mechanical anti-hallucination). Adam-veto checkpoint required before locked_decisions propagate to DECISIONS.md. Cost cap $3/meeting × 8/mo = $24/mo. (2G) Observability split: production = `/war-room` Next.js (always-on, Supabase audit_log + claude_progress) + cost-watchdog Inngest alerting; dev = disler on **Bastion Windows PC** (NOT Mac per memory `project_bastion_windows_pc.md`). Helicone mandatory for product API code (NOT Routines — Routines run on Max subscription, Helicone doesn't sit in that path). Data retention = **90 days hot + 1 year cold** per Q6.
**Net war-room incremental new spend = $5/mo** (Cloudflare Workers Paid only). All Routine token costs absorbed by existing $100/mo Claude Max subscription. Inside the V4 "$0-11/mo" envelope.
**Adam's 3 hard rules applied throughout:** Bastion = Windows PC (not Mac); don't cut agent count for RAM reasons (9-Routine roster preserved, NOT consolidated despite Critic 2's suggestion); no timelines/weeks/sprints (plan by scope + dependencies + quality bar).
**Smoke tests deferred to WS4 (Q5):** Test A (cron exemption), Test B (`/fire` cap behavior), Test C (Mem0 MCP under load), Test D (concurrent Routine cap). Total cost ~$3-5; must run inside WS4 before implementation commits.
**Rationale:** Critique pass surfaced an architectural error (disler doesn't capture cloud Routines), 8 security HIGHs in the trust contract (issuer authority was convention-only, prompt-injectable, replay-vulnerable), KV-eventual-consistency × Linear-60s-retry race, missing structural QA-Lead enforcement, and a cost model that double-counted Routines as API billing. The original directional architecture survived (~40%); the contracts are now production-ready.
**Decided by:** CEO (WS2 deep design + 6 critic critique pass + Adam's Q1-Q7 sign-off on 2026-05-07)
**Affects:** WS3 (BOM includes Cloudflare Workers Paid $5/mo, observability decision pre-empted from §3C, Bastion=Windows), WS4 (Cloudflare bridge code with two-layer dedup + HMAC + sentinel parser, 4 smoke tests must run before commit, audit_log RLS + 3-party write contract, branch protection, secret rotation runbook), WS6 (10 Routine .md files including new synthesizer.md, 7 persona .md files including new customer-voice and broad-adversary, model assignment per Q3 rule, worker frontmatter excludes Agent/Task grants)
**Reversible?** Per honest reversibility table in ORCHESTRATION.md §reversibility: 2A platform-tied (non-negotiable), 2B/2C/2E MEDIUM (schema migration cost), 2D HARD at scale (audit_log schema versions are forever), Linear label vocabulary HARD, 2F/2G EASY.
**Status:** LOCKED — Adam approved 2026-05-07 with 7 decisions
**See:** `docs/08-agents_work/ORCHESTRATION.md` (v2 locked), `docs/08-agents_work/WS2-CRITIQUE-AND-REVISIONS.md`, `docs/08-agents_work/WS2-CRITIQUE-FOR-HUMANS.md`, `docs/08-agents_work/sessions/2026-05-07-ceo-ws2-locked.md`, `RESEARCH-WS2[B|C|G]-*.md`, `CRITIQUE-WS2-*.md`

---

### [2026-05-06] — WS2: Orchestration Architecture (7 sub-decisions) [SUPERSEDED by 2026-05-07 entry above]
**Decision:** Lock orchestration architecture per `docs/08-agents_work/ORCHESTRATION.md`. Seven sub-locks: (2A) main-thread Routines spawn workers via Task; workers spawn nothing; CEO short-circuits to worker for Quick-tier; QA-Lead independent gate. (2B) **Cross-Routine chaining = Linear sub-ticket + Cloudflare bridge re-fire** with KV dedup; direct `/fire` is fallback; Task-spawn is NOT VIABLE per Anthropic spec (subagents can't spawn subagents). (2C) **Inngest stays** — Anthropic Routines have zero documented durability, so Routines are triggers only and Inngest owns fan-out/fan-in/crash recovery. (2D) **Async-spec-trust JSON contract** — issuers (Adam/CEO/C-suite/standing-Routines) embed `trust_mode: true` payload with scope/budget/escalation/audit; mandatory `audit_log` row per invocation. (2E) **9 standing Routines** locked: CEO entry-point + 5 heartbeat (Morning Digest, EOD Sync, Auto-Unblock, Monday Standup, Friday Retro) + 3 signal (Competitor, Customer Voice, GEO Algorithm); cron Routines exempt from 15/day `/fire` cap; `claude_progress` Supabase table replaces local file as shared state. (2F) **Board-meeting protocol** — 3 rounds (parallel-no-anchoring → cross-critique → fresh-context Synthesizer Routine), 5 personas (Visionary/Strategist/Architect/Risk-Modeler/Adversary), $10/meeting cap, 4/month max. (2G) **Observability = disler hooks dashboard + custom `/war-room` Next.js page on Supabase audit_log** + optional Helicone proxy; Langfuse self-host disqualified (8GB min RAM, Bastion has 3.2GB).
**Rationale:** WS2 followed the master plan's 6-step methodology (research dispatch → design → halt at Adam-review). 3 parallel Sonnet researchers covered the 3 sub-phases needing external evidence (chaining mechanism, durable execution, observability stack); the other 4 sub-phases (spawning matrix, async-spec-trust, standing Routines, board-meeting) were designable from existing context (V4 env map, R3 best practices, V3 vision §3). Critical research findings: Anthropic /fire endpoint has no idempotency key (KV dedup mandatory), Routines have no durability semantics (Inngest indispensable), Langfuse self-host needs 8GB+ (Bastion can't host it).
**Decided by:** CEO (WS2 — 3 Sonnet researchers + Opus synthesis)
**Affects:** WS3 (tech stack BOM must include Inngest + Cloudflare Worker + Helicone optional), WS4 (Cloudflare bridge code, Inngest functions, audit_log/claude_progress schemas, Linear label vocabulary), WS5 (master design doc consumes the 7 locked sub-decisions), WS6 (every agent .md file uses the trust-mode payload, the spawning matrix, the structured return contract)
**Reversible?** Mostly yes. (2B) chaining mechanism is reversible (swap Cloudflare bridge for direct /fire calls — easy). (2C) Inngest is reversible (Trigger.dev v3 is a viable swap if Vercel timeouts bite). (2D)/(2F) protocols are config-only, fully reversible. (2A)/(2E) tied to platform constraints (subagents can't spawn) — those are non-negotiable. (2G) disler is OSS MIT — replace anytime.
**Status:** PROPOSED — pending Adam review.
**See:** `docs/08-agents_work/ORCHESTRATION.md`, `docs/08-agents_work/sessions/2026-05-06-ceo-ws2-orchestration.md`, `RESEARCH-WS2B-routine-chaining.md`, `RESEARCH-WS2C-durable-execution.md`, `RESEARCH-WS2G-observability.md`

---

## Format

```
### [YYYY-MM-DD] — [Title]
**Decision:** [What was decided]
**Rationale:** [Why — alternatives considered]
**Decided by:** [Agent]
**Affects:** [Which agents / files]
**Reversible?** [Yes / No / Hard]
```

---

## Log

*Pre-2026-04-15 entries (System Initialized, GSD→GSA, Supabase Auth, Paddle Only, Trial 7d, Pricing $49/$149/$349, OpenRouter, Credit RPC, No n8n) archived to `DECISIONS_ARCHIVE.md` on 2026-05-08 as part of WS3 lock.*

*Active log starts here from the 2026-04-15 product rethink.*

---

### [2026-04-15] — Pricing v2: $79/$189/$499 (Discover/Build/Scale)
**Decision:** Replace $49/$149/$349 pricing. New tiers: Discover $79, Build $189, Scale $499. Annual: $63/$151/$399. Kill 7-day trial. Keep free one-time scan. 14-day money-back guarantee.
**Rationale:** $49 is below "real work" perception. Build at $189 stays under Yael's NIS 700 approval ceiling ($189 = NIS 680). Scale $499 anchors. Research-backed: agencies $1,500-$30,000.
**Decided by:** CEO + Business Lead (board meeting)
**Affects:** Paddle price IDs, pricing page, onboarding, all tier-gated features
**Reversible?** Yes (config change)

---

### [2026-04-15] — Agent Roster v2: 11 agents MVP-1, total rethink
**Decision:** Kill all 7 old agents. Ship 11 new GEO-research-backed agents. Add Video SEO (12th) in MVP-2. Renames: Content Refresher→Freshness Agent, Citation Builder→Off-Site Presence Builder.
**Rationale:** Old agents didn't address GEO research. 85% of AI mentions are off-site. New roster covers all proven GEO levers. Reddit Presence added (Perplexity 46.7%).
**Decided by:** CEO + Research Lead + AI Engineer (board meeting)
**Affects:** All agent code, prompts, credit system, dashboard UI
**Reversible?** Hard (full rewrite)

---

### [2026-04-15] — Proactive Automation Model (not Agent Hub)
**Decision:** Replace manual "Agent Hub" with proactive automation. Scans trigger rules engine → suggestions → user accepts → agents run (scheduled or event-triggered) → output in Inbox → user approves. "Agents" removed from sidebar nav.
**Rationale:** Adam's directive: "not just a case of the customer manually choosing to run an agent." Continuous process, not one-time fix. Higher tiers unlock schedule frequency.
**Decided by:** CEO + Product Lead (board meeting)
**Affects:** Dashboard UI, Inngest jobs, agent execution pipeline, sidebar nav
**Reversible?** Hard

---

### [2026-04-15] — LLM Models: Only Claude/Gemini/GPT/Perplexity
**Decision:** No DeepSeek, Qwen, or other providers. Agents use ONLY: Claude (Sonnet/Haiku/Opus), Gemini (Flash/Pro), GPT (4o/4o-mini/5-mini), Perplexity (Sonar/Pro/Online). All via OpenRouter.
**Rationale:** Adam's directive. Quality control + trust + vendor simplicity.
**Decided by:** CEO (founder directive)
**Affects:** All agent model configs in openrouter.ts
**Reversible?** Yes

---

### [2026-04-15] — YMYL Safety: Hard-refuse medical/legal/financial advice
**Decision:** Topic-risk classifier (Haiku) in Query Mapper. Hard-refuse: clinical diagnosis, legal advice, investment advice. Soft gate: general health/finance education. MVP excludes regulated IL professions.
**Rationale:** AI error rate 18-88% on YMYL. FTC + CA AI Transparency Act + EU AI Act.
**Decided by:** CEO + Research Lead
**Affects:** Query Mapper prompts, content agent QA gates
**Reversible?** Yes (expand cautiously)

---

### [2026-04-15] — Dashboard pages: 7-page restructure
**Decision:** Home · Inbox · Scans · Automation · Archive · Competitors · Settings. "Agents" removed from nav. Inbox = 3-pane Superhuman. Freshness Agent gets inline chat editor.
**Rationale:** Proactive model makes agents invisible. User sees suggestions + review queue + automation status. Agents are backend.
**Decided by:** CEO + Design Lead + Product Lead
**Affects:** All dashboard routes, sidebar, shell
**Reversible?** Hard

---

### [2026-04-17] — Content Output Policy: No AI Labels
**Decision:** Agent-generated content contains no AI disclosure markers. Content reads as human-written. User handles disclosure on their own site.
**Rationale:** Adam's directive. "Assisted not autopilot" means user is the author. EU AI Act Article 50 falls on publisher, not tool.
**Decided by:** CEO (founder directive)
**Affects:** All agent prompts, Blog Strategist output, content export
**Reversible?** Yes

---

### [2026-04-17] — Day-1 Auto-Trigger Pipeline
**Decision:** Paddle payment webhook triggers Inngest chain: Query Mapper → paid scan → rules engine → first 2-3 agents auto-run. No empty dashboard on day 1.
**Rationale:** UX audit found "dead dashboard" problem — user pays and sees empty pages. Auto-trigger ensures populated dashboard within 5-10 minutes.
**Decided by:** CEO + UX Lead
**Affects:** Paddle webhook handler, Inngest functions, Home page loading states
**Reversible?** Yes

---

### [2026-04-17] — Assisted vs Autopilot Validated
**Decision:** "Assisted not autopilot" confirmed as correct positioning. 93-97% of marketers review AI content before publishing (Ahrefs, HubSpot). Optional auto-approve for Scale tier post-MVP.
**Rationale:** Research validation. Zero sources recommend full autopilot for SMBs.
**Decided by:** CEO + Research Lead
**Affects:** Product positioning, all agent interaction models
**Reversible?** Yes (can add autopilot mode later)

---

### [2026-04-17] — $19 Top-Up Pack + Annual Pricing at Launch
**Decision:** Ship $19/10 AI Runs top-up pack at launch. Ship annual pricing from day 1 (20% discount).
**Rationale:** Top-up prevents mid-month churn. Annual per Adam's preference despite Business Lead recommending 60-day delay.
**Decided by:** CEO
**Affects:** Paddle products, pricing page, billing UI
**Reversible?** Yes

---

### [2026-04-17] — Sonar Citation Verification in QA Pipeline
**Decision:** Add Perplexity Sonar verification step to catch hallucinated citations. $0.02/run extra.
**Rationale:** Haiku QA misses ~25% of hallucinated sources. Sonar cross-checks cited URLs/stats against live web.
**Decided by:** CEO + Research Lead
**Affects:** Agent QA pipeline, cost model (+$0.02/run)
**Reversible?** Yes

---

### [2026-04-17] — Email Domain: notify.beamixai.com
**Decision:** Transactional email via notify.beamixai.com (Resend). Cold outreach on separate subdomain. Main domain beamixai.com for website only.
**Rationale:** Protect transactional deliverability from cold email reputation damage.
**Decided by:** CEO
**Affects:** DNS config, Resend setup, EMAIL_FROM_ADDRESS env var
**Reversible?** Yes

---

### [2026-04-27] — Inngest tier: Free at MVP, Pro at ~5 paying customers
**Decision:** MVP launches on Inngest free tier (50K executions/month, shorter wall-clock timeouts). Migrate to Pro (~~$150/mo~~ **$75/mo** — corrected 2026-05-08 via inngest.com/pricing verification; original entry quoted wrong figure) when paying customers ≥ 5 OR monthly executions usage hits 75-80% of free-tier ceiling, whichever comes first. Pro tier includes 1M executions + 100+ concurrent steps + granular metrics.
**Rationale:** Cost discipline at pre-revenue stage. Free tier sufficient for first ~5 paying customers. Pro tier headroom isn't worth paying for until there's revenue to cover it. Revises board synthesis row 13 which had assumed Pro from day 1.
**Decided by:** Adam (CEO)
**Affects:** Tier 0 setup, agent runtime architecture (must fit free-tier wall-clock), DevOps migration runbook, cost model. Some agents (Long-form Authority Builder, Citation Predictor — both deferred past MVP) may need Pro tier on arrival; re-validate which MVP agents fit free-tier limits.
**Reversible?** Yes (upgrade is one-click; downgrade is hard if usage exceeds tier).
**2026-05-08 correction:** WS3 cost critic surfaced the $150/mo claim conflicted with Inngest's public pricing of $75/mo. Adam asked the CEO to verify; verified via WebFetch on inngest.com/pricing (2026-05-08). $75/mo locked.

---

### [2026-04-28] — Board meeting: 23 product/design/architecture decisions locked
**Decision:** Adam confirmed all board decisions from the 9-seat / 3-round board meeting documented in `docs/08-agents_work/2026-04-27-BOARD-MEETING-SYNTHESIS.md`. The synthesis doc is the canonical record; this entry captures the consolidated lock. The 23 confirmed decisions:

**Strategic (rows 1-15):**
1. Monthly Update permalink default = **PRIVATE** with explicit "Generate share link." Forwarding via PDF email attachment. Hybrid-redaction model rejected.
2. /crew layout = **Stripe-style table.** Yearbook DNA preserved as ceremonial state only (empty/first-load + per-agent profile pages).
3. White-label digest signature = **Both, tier-gated.** Discover/Build = "Beamix" non-removable. Scale = agency-primary with "Powered by Beamix" footer in Geist Mono 9pt at `--color-ink-4`. Cream paper survives white-labeling.
4. Voice canon = **Model B.** Agents named in product (`/home`, `/crew`, `/workspace`). "Beamix" on all external surfaces (emails, PDFs, permalinks, OG cards). Onboarding seal "— your crew" → "— Beamix."
5. Workspace tier-gating = **All tiers** (including Discover).
6. Marketplace install = **Build+ only.** Discover sees catalog read-only with upgrade CTA.
7. Workflow Builder access = **Scale-only** to build/edit. Build can install pre-built workflows.
8. Truth File schema = **Shared base + vertical-extensions** (Zod discriminatedUnion keyed by vertical_id, per-vertical schema versioning). Single Postgres row + JSONB.
9. "Full-auto" semantics = **Conservative.** Even on Full-auto, validator's `uncertain` outcome routes to /inbox.
10. Pre-publication validator binding = **Cryptographic signed-token** (60s TTL, draft-hash bound). First-party agents in same sandbox as future third-party.
11. L2 site-integration = **Manual paste + Git-mode (GitHub PR) at MVP.** WordPress plugin parallel-builds, ships MVP-1.5.
12. Real-time channel = **Supabase Realtime broadcast**, one channel per customer (`agent:runs:{customer_id}`), polling fallback at 10s.
13. Inngest contract = Free tier at MVP; Pro at ~5 paying customers (already locked above).
14. Day 1-6 silence cadence = **4 emails** plain-text Beamix register (D0+10min welcome / D2 first-finding / D4 review-debt nudge / D5 pre-Monday teaser). Skip Saturday/Sunday. Suppress if customer logged in that day.
15. /security public page = **Ship at MVP.** Stripe-style 6-min security doc covering storage region, retention, DSAR flow, encryption, audit logs, no-training-on-customer-content DPA clause, sub-processors.

**Critical corrections (rows 16-21):**
16. White-label config is **PER-CLIENT**, not per-account. Lives inside multi-client switcher.
17. Bulk-approve in /inbox at MVP (within single client). Cross-client bulk = MVP-1.5.
18. Vertical-aware UI from Step 1 (kill plumber DNA in SaaS). SaaS = UTM-first Step 2; e-comm = Twilio-first.
19. Truth File nightly integrity-hash job. Sev-1 alert + auto-pause-all-agents on >50% field loss in 24h.
20. Scale-tier DPA includes mutual indemnification: Beamix indemnifies for content errors that pass pre-pub validation, capped lesser of (3× monthly subscription) or ($25K/incident).
21. Workflow Builder dry-run = real LLM execution with `dry_run: true` flag. No mock-site sandbox needed.

**Tensions resolved (rows 22-23):**
22. Workflow Builder MVP scope = **Hybrid.** Day 1: full React Flow DAG editor + dry-run + 3-6 templates + manual/scheduled triggers + Brief grounding per node. Deferred to MVP-1.5: event triggers (`competitor.published`), workflow PUBLISHING to marketplace.
23. Workflow PUBLISHING = **Defer to MVP-1.5.** Cross-tenant Truth File binding ships and gets 4 weeks of telemetry first. Marketplace at MVP = browse + install Beamix-curated workflows + install counts visible.

**Decided by:** Adam (CEO) confirmed all 23 decisions on 2026-04-28 after the 9-seat board meeting (4 + 3 + 2 agents in 3 rounds).
**Affects:** PRD-wedge-launch (10 features changed), 6 design specs, MARKETPLACE-spec (rewards section removed), DESIGN-SYSTEM (token clarifications), AUDIT-CONSOLIDATED (mark BLOCKERS #1, 2, 3, 4, 16, 17, 18, 19 as resolved), Tier 0 build sprint (19 person-days plumbing).
**Reversible?** Hard. These shape every customer-facing surface and the build plan. Reversal requires re-running board.

---

### [2026-05-05] — War Room Rethink: 4-Wave Plan, Awaiting Sign-off
**Decision:** Execute a 4-wave rebuild of the agent infrastructure based on synthesis of 7 parallel audit + research streams. Wave 0 fixes 7 P0 bugs. Wave 1 moves `.agent/` → `.claude/`, adds permissions block, OTEL telemetry, hard model routing, risk-tiered QA. Wave 2 wires Linear → Claude via Routine + Vercel Edge bridge. Wave 3 adopts plugin bundling, vector memory MCP, Agent Teams. Full plan: `docs/08-agents_work/2026-05-05-war-room-rethink/00-SYNTHESIS.md`.
**Rationale:** Today's setup (a) silently breaks (workers point at archived saas-platform/ path, 12 GSD execution agents reference missing binary), (b) leaks 32 GB across 72 worktrees, (c) costs ~$0.14/session before any work via 42K-token MANIFEST.json read, (d) treats QA as theater (0 invocations across 29 sessions despite shipping Paddle webhooks), (e) misses the entire Anthropic May-2026 production stack (Plugins, Agent Teams, Routines, OTEL, headless `claude -p`, GitHub Action), and (f) is coupled to upstream `gsa-startup-kit` npm package that could overwrite our customizations.
**Decided by:** CEO (synthesis of 3 internal auditors + 4 external researchers, all sourced)
**Affects:** All agents, all skills, settings.json, hooks, memory files, worktree hygiene, future Linear/GitHub integration
**Reversible?** Wave 0 + Wave 1 yes (git revert). Wave 2 + 3 architectural — partial reversal only.

---

### [2026-05-05] — QA Gate Now Hard-Enforced Via Stop-Hook
**Decision:** QA gate transitions from documented-but-ignored to enforced. A Stop-hook will block any `git merge` when the branch's session file lacks `qa_verdict: PASS`.
**Rationale:** Across 29 sessions to date, qa-lead was invoked **zero times**. We shipped Paddle webhook + HMAC + 17 API routes with no security audit. This is not sustainable.
**Decided by:** CEO (rethink synthesis P0-3)
**Affects:** All build leads, all merges, `.claude/settings.json` hooks block
**Reversible?** Yes (remove the hook), but will not be reversed without explicit Adam sign-off.

---

### [2026-05-05] — Wave 2 Synthesis: Autonomous Army Blueprint (V2)
**Decision:** 6-stream Wave 2 research produces the full autonomous-army blueprint. Net effect: shift from "build the army" to "wire into Anthropic's native stack + add a few thin pieces." Plan file: `docs/08-agents_work/2026-05-05-war-room-rethink/00-V2-SYNTHESIS.md`. Adds Waves 2-4 on top of V1's Wave 0-1.
**Rationale:** Anthropic shipped Remote Control (Feb), Channels for Telegram/iMessage (Mar), Routines for cloud-headless (Apr), Memory Tool, context editing, tool_search, isolation:worktree, plugins, output styles between Oct 2025 and Apr 2026 — most of what solo founders were building custom is now native. Three picks at $295/mo for hosted overflow. Memory: don't rent Letta/Mem0/Zep — Anthropic Memory Tool + Supabase pgvector is enough. Architecture: dissolve leads for Medium tasks (CEO is a glorified router), keep QA Lead independent, add async-spec-trust mode for remote control. Board Meeting Pattern from Report 10 = cheap multi-persona strategic debate at ~$0.50/meeting.
**Decided by:** CEO (synthesis of architecture critique + 5 external researchers, all sourced)
**Affects:** Memory architecture (replace flat markdown with Memory Tool + pgvector), agent layer (dissolve leads for non-QA), worktree method (`isolation: worktree`), remote-control surfaces (Anthropic native), hosted overflow ($295/mo), Symphony-style Linear-as-control-plane
**Reversible?** Wave 2 yes. Wave 3 architectural changes (dissolve leads, async-spec-trust) partial reversal only.

---

### [2026-05-05] — Memory Architecture: Anthropic Memory Tool + Supabase pgvector (NOT third-party)
**Decision:** Adopt Anthropic Memory Tool (`memory_20250818`, beta) for cross-session episodic memory. Use Supabase pgvector (already in stack) for L3 project facts and L4 skills/tools. Decline Letta, Mem0 ($249/mo Pro), Zep, Cognee, OpenAI Memory.
**Rationale:** Anthropic Memory Tool is file-based `/memories`, ZDR-eligible, replaces ad-hoc LONG-TERM.md writes. pgvector on Supabase = zero new vendor. Mem0 Pro at $249/mo rents capabilities Anthropic now ships. Defer Graphiti (temporal supersession) until contradiction-management is measured pain post-50 customers.
**Decided by:** CEO (Wave 2 synthesis, Report 13)
**Affects:** `.claude/memory/` workflow, all CEO post-session memory updates, skill discovery (replaces 42K-token MANIFEST.json with embedding search)
**Reversible?** Yes (revert to flat markdown)

---

### [2026-05-05] — Remote Control Stack: Anthropic Native (4 surfaces, $0/mo delta)
**Decision:** Adopt all 4 official Anthropic surfaces as the canonical remote-control stack: Claude Code Remote Control (daemon on always-on Mac mini, steered from claude.ai/code or mobile app), Claude Code Channels (Telegram + iMessage plugins), Claude Code Routines (cloud cron jobs), Linear Mobile + GitHub Mobile + 50-line iOS Shortcut for voice idea-capture.
**Rationale:** All shipped Feb-Apr 2026 by Anthropic. Total cost delta: $0/mo (everything in existing Pro/Max). Replaces every Q4-2025 OSS bot wrapper (claude-code-telegram, agent-reachout, custom Vercel dashboards) — those are now legacy. Solves the three Adam-tests: in-the-car, asleep, in-meeting-approve-PR.
**Decided by:** CEO (Wave 2 synthesis, Report 11)
**Affects:** Daily Adam workflow, Linear setup, iOS Shortcuts, Mac mini daemon configuration
**Reversible?** Yes

---

### [2026-05-05] — Hosted Cloud Overflow: Phased Adoption (Routines first, $100/mo)
**Decision:** Phase 1 — Claude Code Routines only (~$100/mo Max 5x tier) for headless-coding-while-sleeping. Phase 2 — add Cursor Background Agents ($60-120/mo) when fleet pattern proves out. Phase 3 — add Inngest AgentKit + E2B sandboxes ($100/mo) for hybrid-durable execution. Total at full adoption: ~$295/mo.
**Rationale:** Don't pay for capacity until needed. Routines is on stack already (Pro/Max). Cursor Background Agents is the canonical dashboard for 5-10 parallel cloud agents. Inngest already in Beamix stack — AgentKit composes naturally. Skip Devin (overkill at our scale), Manus (acquisition uncertainty), Bolt/Lovable (no persistence), Replit (forks stack), v0 (frontend-only), AutoGen Studio (Microsoft maintenance mode).
**Decided by:** CEO (Wave 2 synthesis, Report 09)
**Affects:** Cloud agent budget, multi-agent orchestration, parallel-execution scaling
**Reversible?** Yes

---

### [2026-05-06] — V4 Corporate OS: Linear-as-Company, 24/7 Outside Laptop
**Decision:** V4 supersedes V3 with Adam's clarifying corrections. Drops Adam-OS (personal life — not what Adam wants). Drops dates/timelines (sequence by dependency only). Role-based agent names ONLY (CTO, AI Engineer, Product Designer) — NO personality names (Marcus/Aria/Yossi belong to the product, not the war room). Linear IS the canonical interface (not "an option"). Workers use TOOLS, never delegate to other workers (anti-bureaucracy hard rule). 24/7 architecture runs outside Adam's laptop entirely (Cloudflare Workers + Anthropic Routines + GitHub Actions = critical path; Mac is dev acceleration only). New spend: **$0-8/mo** (down from V3's $33). Vendor-copy aggressively from open-source: wshobson/agents (workers), spec-kit (constitution + spec flow), BMAD-METHOD (story templates), agent-os (standards extractor), SuperClaude (slash commands), claude-flow (orchestration), anthropics/claude-plugins-official (packaging). Org chart: Adam → CEO → 5 C-suite (CTO, CPO, CMO, CBO, CCO) + independent QA Lead → team leads → workers. Plan: `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-CORPORATE-OS.md`. New decisions D23-D30.
**Rationale:** Adam clarified the V3 vision: he wants the AI company that RUNS Beamix, not personal-life automation. He wants Linear as the company OS — file projects, get sub-tickets, agents pick up, status flows back. He wants 24/7 even when his laptop is off. He wants role-based generic agent names. He wants workers that use tools (not endless delegation chains). He wants to text the CTO directly (skip CEO express lane) for bounded scope. He wants agents that propose work autonomously (Friday Retro + worker "I noticed" reflections). He wants quality enforced by team leads + QA gate. He wants to steal proven prompts from open-source projects rather than write everything custom.
**Decided by:** CEO (V4 synthesis after Adam's correction)
**Affects:** All agent definitions (rewrite to role-based names), Linear setup (becomes canonical), Cloudflare Workers + Routines wiring, GitHub Actions, vendoring strategy from 6 OSS projects, the Bastion Mac becomes optional acceleration not critical path
**Reversible?** Mostly yes. Personality names removal: hard but worth it (clarity > attachment). 24/7 architecture: yes (just turn off the Routines).

---

### [2026-05-06] — V3 Vision: Bastion Stack + Company-as-Org + Day-1 Flywheel
**Decision:** V3 supersedes V2's economics. Adopt the Architect's $33/mo Bastion stack (8GB home Mac running Postgres+pgvector + Redis + Remote Control daemon + tmux farm of `claude -p --bare` = poor man's Devin) instead of V2's $295/mo cloud-overflow plan. Spawn 7 new "complete-company" agents by Day 30 (Customer Success, Sales, Brand Voice Guardian, CFO, Chief of Staff, Talent, Investor Update). Lock Day-1 data layer (8 tables, permanent retention) before MVP launches. Ship 5-Routine heartbeat ($5-15/mo). Implement Strategy Machinery (stop-loss + ANTI-ROADMAP fleet enforcement + 3 signal Routines). Risk-harden R1-R3 (Memory poisoning, prompt injection, cost runaway) BEFORE Wave 3. Adopt Adam-OS (energy-adaptive army via HealthKit, voice-erosion guardrail). Internal positioning reframe: "Bloomberg Terminal of AI Search funded by SMB subscription" (5 compounding datasets, uncatchable in 18 months). External messaging unchanged. Plan: `docs/08-agents_work/2026-05-05-war-room-rethink/00-V3-VISION.md`. New decisions D15-D22.
**Rationale:** Visionary identified that current army is "throughput infrastructure, not flywheel" — every action dies, zero data accrues. Architect proved the $295/mo V2 plan was 9× over-budget — same capability fits in $33/mo with 8GB home Mac as Bastion. Chief of Staff identified missing "fleet heartbeat" (5 Routines) as the single biggest operating gap. Strategist identified missing "strategy machinery" (currently a backlog, not a strategy engine). Personal Systems identified Adam-as-human is unsupported (army builds product, nothing builds Adam). Risk Modeler identified 3 existential threats that block safe Wave 2 ship.
**Decided by:** CEO (V3 board meeting synthesis: 6 specialized personas — Visionary, CoS, Strategist, Architect, Personal Systems, Risk Modeler)
**Affects:** All Wave 2-5 plans, hardware (8GB home Mac as Bastion), agent roster (+7), data schema (8 new tables), iOS Shortcut + HealthKit integration, existing $100/mo Claude Max budget (unchanged), new spend cap ($33/mo)
**Reversible?** Bastion stack: yes (move to cloud overflow). Day-1 data layer: hard (cannot recover lost retention). Company-as-org: yes (kill agents). Adam-OS: yes (behavioral).

---

### [2026-05-05] — Architecture: Dissolve Leads for Medium Tasks + Async-Spec-Trust Mode
**Decision:** Keep CEO as orchestrator, keep QA Lead as independent gate. Other 8 leads become **roles inside briefs** for Medium tasks rather than always-spawned agents (with a 5-turn task-scoped coordinator). Add **async-spec-trust mode** to CEO: when triggered from Linear/Slack/Telegram with a structured spec, skip the question-loop and act on the spec directly.
**Rationale:** Architecture critique found CEO is a glorified router (10 management steps before dispatch); leads add 2 overhead steps for non-QA work. The synchronous question-loop is incompatible with remote/async control (Adam answers in 6 hours, not 6 seconds). QA Lead retains independence because that IS its value, not hierarchy.
**Decided by:** CEO (Wave 2 synthesis, Report 08)
**Affects:** ceo.md execution_flow, all lead .md files (downgrade to brief-roles), all worker dispatches (CEO can spawn workers directly with role-typed briefs)
**Reversible?** Partial — re-spawning all leads as agents possible but loses async-control benefit

---

### [2026-05-05] — Risk-Tiered QA (Cloudflare Pattern)
**Decision:** QA Lead routes diffs through three tiers: **Trivial** (≤10 lines, no critical files → 1 reviewer Haiku), **Lite** (≤100 lines → 3 reviewers: tsc + semgrep + Sonnet), **Full** (>100 lines OR auth/billing/migrations/webhooks → 7 reviewers including Opus security-engineer + Opus adversary-engineer "Aria" + judge pass).
**Rationale:** Cloudflare runs this exact stack at $0.98/median review across 48,095 MRs with 0.6% break-glass. Anthropic Code Review reports <1% false-positive. Beamix today over-reviews trivial CSS and under-reviews critical paths.
**Decided by:** CEO + Research Lead (synthesis of QA + economics research)
**Affects:** qa-lead.md, security-engineer.md, code-reviewer.md, new adversary-engineer agent
**Reversible?** Yes (config-only)

---

### [2026-05-06] — WS1A: L2 Memory Tool = Mem0 (2-phase: cloud → OSS)
**Decision:** L2 cross-session episodic memory = **Mem0**. Phase 1: cloud Hobby (free, no card, vendor MCP at `mcp.mem0.ai/mcp`) for fast integration-shape validation. Phase 2 (WS1F): migrate to Mem0 OSS self-host on existing Supabase Postgres+pgvector. Same engine in both phases. Rejected: Custom MCP/pgvector (4-6 weeks build), OpenAI Memory (deprecated), Letta (no native MCP), Zep+Graphiti (Series-A spend), Anthropic Memory Tool (file primitive, not retrieval system).
**Decided by:** CEO (WS1A — 2 Sonnet researchers + Adam OSS follow-up)
**Affects:** WS1B (Phase 1 bring-up), WS1D (Mem0 wrapper), WS1F (Phase 2 migration), all WS6 agents, `.mcp.json`
**Reversible?** Easy. Apache 2.0, JSON/MCP contract, your data on your Postgres after Phase 2.
**Status:** PROPOSED — pending Adam review.
**See:** `docs/08-agents_work/MEMORY-DECISION-MATRIX.md` (full matrix + rationale), `docs/08-agents_work/sessions/2026-05-06-ceo-ws1a-memory-tools.md`, `docs/08-agents_work/2026-05-06-agent-build/HANDOFF-WS1B-L0-L5-stack-design.md`

---

### [2026-05-06] — WS1B: L0-L5 stack designed; Mem0 issue #3400 closed; Phase 1 unblocked
**Decision:** L0=CLAUDE.md (≤200 lines, WS1F compaction). L1=Claude Code session +/compact. L2=Mem0 (per WS1A). L3/L4/L5=pgvector tables in `memory.*` on existing Supabase, single embedding model `text-embedding-3-small` (~$0.10/mo total). Pre-flight = L0 + L2 last-10 only; L3/L4/L5 are MCP-callable on-demand. Phase 2 OSS host = Railway $5/mo (recommended).
**Status:** PROPOSED — pending Adam review (5 open Qs in spec).
**See:** `docs/08-agents_work/MEMORY-ARCHITECTURE.md`, `docs/08-agents_work/sessions/2026-05-06-ceo-ws1b-l0-l5-stack-design.md`

---

### [2026-05-07] — Bastion stays on home PC (not cloud VPS) — Anthropic ban risk
**Decision:** Bastion = Adam's home Win10 PC (Max plan + subscription OAuth = intended use). Cloud VPS (Hetzner CX53 $27.99/mo evaluated) deferred. Trigger to revisit: hard reliability event OR shift to commercial agent fleet serving customers (then API-key billing). On VPS, OAuth is the Jan-2026 crackdown pattern (3.3% appeal rate); safe path = ANTHROPIC_API_KEY but adds ~$200-500/mo metered API cost.
**Status:** PROPOSED — pending Adam review.
**See:** `docs/08-agents_work/2026-05-07-bastion-bootstrap/BAN-RISK-RESEARCH.md`

---

### [2026-05-20] — Wave 0 Foundation shipped; staging DB hard-reset; irreversible tier-floor confirmed
**Decision:** Wave 0 (db-foundation, app-shell, agent-system) built and merged to `main`. The Supabase staging project `zhjxdwcqxhwletkpuwyl` still carried the legacy March-2026 schema; per the migration plan and explicit Adam authorization, the entire `public` schema was dropped (`DROP SCHEMA public CASCADE`) and rebuilt from 15 fresh migrations — only dev/test data lost, no production data. The `qa-lead-pass` file-path tier-floor auto-classifies any PR touching `apps/web/supabase/migrations/**` as **irreversible**, requiring the `risk:irreversible` label + 2-of-3 multi-judge + Adam sign-off; #80 and #81 went through that gate (3 independent judges each + adversary pass).
**Rationale:** Hard-reset was cheaper and cleaner than an in-place legacy migration (pre-revenue, no production data). The irreversible classification was honored at Adam's explicit request rather than accepting the lighter Full-tier QA.
**Decided by:** CEO (Wave 0 orchestration) + Adam (destructive-wipe authorization + irreversible sign-off)
**Affects:** `apps/web/` (all three slices now on main), staging DB schema, Wave 1 build base
**Reversible?** DB wipe: no (legacy dev data gone — acceptable, no production data). Code: yes (revert PRs).
**Tech debt:** 10 judge-surfaced items logged in `docs/BACKLOG.md` §Wave 0.5.

---

### [2026-06-03] — T5 Workflow tier added — deterministic fan-out for big/mid+ work
**Decision:** Extend the orchestration topology from 4 tiers to 5. **T5 Workflow** uses the Claude `Workflow` tool — a deterministic JS script the CEO runs that fans out 15-20 agents (parallel finders/builders → adversarial verifiers → Opus judge) and spawns the fleet itself, bypassing the nested-Task block. T5 is for **big/mid+ work in any domain** (complex coding, design, research, QA), never trivial/small. **Trigger (Tier + complexity test):** code → Full or Irreversible QA tier; non-code → ANY of {≥3 parallel slices, multi-domain, high-ambiguity/novel, Adam flags}. A T5 library lives at `.claude/workflows/`: `coding.js` (parallel slices → chains into `qa.js`), `design.js` (judge panel + design-critic), `research.js` (multi-modal sweep + adversarial verify + synth), `qa.js` (dimension reviewers + 3 verifiers/finding + Opus judge; **loop-until-dry on Irreversible** → ~25-40 agents). `qa.js` IS the binding QA-Lead verdict — BLOCK stops the merge, no CEO/Adam override; T5-coding always chains into it. **Authorization:** the `Workflow` tool was added to ceo.md's tool list, and classifying a task T5 is the CEO's standing permission to fire the matching workflow; `ultracode` stays as Adam's manual force-everything override. **Cost/model:** Sonnet fleet, Opus judge, Haiku trivial; per-ticket escalation ceiling raised $10→$15 for T5 (≈ $3-6 typical, up to ≈ $15 for an Irreversible loop run).
**Rationale:** The war-room (T1-T4) is LLM-driven decomposition orchestration — it caps at ~3-7 agents/task because one CEO bookkeeps them inside a 30-turn budget, and it has no mechanism for cheap N-way redundancy (no judge panels, no adversarial verify, no loop-until-dry — only single-pass validators). "More agents per task" is therefore an architectural change, not a number bump. The Workflow tool is deterministic JS fan-out (16 concurrent, 1000 lifetime) purpose-built for redundancy-for-confidence. Splitting the two — war-room for decomposition, Workflow for depth/confidence — lets each do what it is structurally good at, and it finally lets QA-Lead's reviewer fan-out actually execute (the script spawns, the agent can't). Optimizes for quality over speed per Adam's directive.
**Decided by:** Adam (grill-me session, 2026-06-03) + CEO (design + implementation)
**Affects:** `.claude/agents/ceo.md` (tools += Workflow, T5 topology row + trigger + library + $15 ceiling), `project_orchestration_topology_locked.md` (re-locked 5-tier, out-of-repo auto-memory), `.claude/workflows/{coding,design,research,qa}.js` (new), `.claude/agents/_seeds/ceo.md` (T5 awareness for the launcher boot).
**Reversible?** Yes — config + scripts only. Revert the PR and delete `.claude/workflows/`. No data or schema touched.
**Status:** QA PASS (PR #132, run `wf_de0ee653-f58`, full tier, 4 P3 non-blocking) — pending Adam merge sign-off (Irreversible tier: edits an agent definition + a locked topology decision).
**Dogfood:** `qa.js` reviewed its own diff 5×: BLOCK×4 → PASS. Found real bugs each round (verifier-prompt injection, fail-open judge, dropout/null-deref tolerance), all fixed; ~$85-110 spend. Converges but expensive on self-referential net-new code.
**Follow-ups:** (1) **Cost — addressed (partial):** `qa.js` now 3-vote-verifies only *block-eligible* findings (P1 always; P2 at irreversible), so cost scales with serious findings (clean diff ≈ $4-6). The $15 ceiling remains *advisory* — a hard budget cap isn't CEO-settable on named-workflow calls (still open). (2) **Appeal path — DONE:** the no-override rule is amended — CEO can never override a BLOCK; only Adam may, via a logged finding-by-finding false-positive appeal (never to bypass a confirmed real defect). Encoded in ceo.md, qa.js, README, topology memory. (3) **Still open:** coding.js worktree-isolated slices need a real integrated-diff ref for qa.js.

### [2026-06-11] — Craft-elevation initiative: CRAFT-SYSTEM rubric is the de-AI standard
**Decision:** Adopt `docs/design/CRAFT-SYSTEM.md` (8 AI-generated tells + 12 craft moves M1-M12 + design-critic checklist) as the binding rubric for making every product screen read human-crafted, not AI-generated. Cascade per-screen (dashboard shipped first as exemplar): design → frontend build → design-critic Playwright visual check vs references → binding qa → Adam merge. Stays 100% inside the warm-minimal vision + token system + blue=you/violet=agents law; NO new colors/tokens (only additive utilities like `.card-inset` + a fade-up keyframe).
**Rationale:** Product was on-brand but applied tokens uniformly (uniform depth, N-equal grids, no serif beat, no signature detail) — the "AI-generated" tell. The fix is intentional hierarchy/asymmetry/depth-staging, not a redesign. A written rubric makes design-critic enforcement objective and repeatable across screens.
**Decided by:** ceo-craft-elevation (foundational workflow wf_57c0d5b6-c6a)
**Affects:** design-lead, design-critic, product-designer, frontend-engineer; all `apps/web/src/app` product screens; `apps/web/src/app/globals.css` (additive only)
**Reversible?** Yes (presentation-layer; per-screen PRs revertable)

### [2026-06-11] — QA worktrees must diff against origin/main, not local main
**Decision:** QA-Lead (and any scope/diff check) must measure the PR diff against `origin/main` (or `gh pr diff --name-only`, authoritative), never the local `main` checkout. On any scope-based BLOCK, re-verify the true file set before accepting it.
**Rationale:** PR #173 drew a false-positive Irreversible BLOCK (claimed 202 files + bundled migrations) because the QA worktree diffed against a stale local `main` (4 commits behind origin), folding in already-merged migrations. The real PR was 8 presentation files. Stale local main is a recurring trap in this repo.
**Decided by:** ceo-craft-elevation
**Affects:** qa-lead, all reviewers, CEO merge-gating
**Reversible?** Yes (process rule)

### [2026-06-11] — Beamix is a full self-serve product with an agents + done-for-you CORE
**Decision:** Amend (do NOT reverse) the 2026-05-23 agency-pivot positioning. Beamix is repositioned from a *hidden* done-for-you agency into a **full product usable self-serve**, whose **core remains the agents + the all-done-for-you experience**. Every one of the 11 registry agents gets a user-facing, manually-operable surface (a tool page: supply inputs → Run → review/edit → approve/publish). Agent names become user-facing on the self-serve surface (relaxes the "no agent names" rule for the in-product tool layer only; digest/concierge voice canon unaffected). Three operating modes are the conceptual spine: **Manual** (user does the labor) / **Autonomous seat** (limited auto-runs, `dailyCap` scaffolding already in registry) / **Done-for-you** (uncapped + concierge layer = today's product, kept as the soul/premium). Every tool page carries a "Run it myself" vs "Let Beamix handle it" toggle.
**Rationale:** The 2026-05-23 "tooling hidden / NOT a tool" lock solved buyer-simplicity but produced a product that *feels empty* — all work happens in the background with no visible surface. The fix is additive: surface the existing machinery (registry + `/api/agents/run` + approval gate + digests + traceability are untouched), not a parallel product. Code already leans self-serve (registry uses `discover`/`build`/`scale` tiers + per-agent daily caps), so this aligns positioning with what the code already assumes.
**Out of scope (explicit, Adam 2026-06-11):** pricing, packaging, tiers, credits, entitlement economics — all deferred and unchanged. No board meeting (additive reframe, not a full reversal).
**Decided by:** Adam (CEO session, 2026-06-11) + CEO (ceo-surface-full-product)
**Affects:** `docs/01-foundation/VISION.md` + `03-PRODUCT-VISION.md` (softened framing), all `apps/web/src/app` product surfaces (new tool pages), `docs/04-features/specs/` (new), `docs/02-competitive/teardown-2026-06/` (new). Amends the 2026-05-23 agency-pivot lock.
**Reversible?** Yes (positioning doc + future presentation-layer pages; agency core untouched). Full doc: `docs/01-foundation/POSITIONING-AMENDMENT-2026-06-11.md`.

### [2026-08-08] — Capability gap map run: `capability-gap-map.js`, 15 evidence-gated recs, net-file-delta conflict surfaced
**Decision:** Ran the harvest phase scoped in `docs/08-agents_work/2026-08-08-AGENT-SYSTEM-RETHINK-HANDOFF.md` as the "full approved run" (Adam's explicit choice over a cheaper survey-only pass). Built `.claude/workflows/capability-gap-map.js` (unmerged — no branch, generated inline via the Workflow tool) as a sibling of `agent-audit.js`, reusing its resolve→extract→verify→adopt skeleton with a new 5-dimension inventory schema (agent_roster/skill_corpus/command_set/hook_library/sandbox_permission_model) in place of the 8 architecture axes. Result: 60 agents, 0 errors, 209 capabilities collapsed across 10/14 resolved projects, 39 confirmed gaps, 15 evidence-gated recommendations (13 ADAPT, 2 REJECT) after adversarial verification killed 3 deep-dive findings for fabricated/misattributed evidence (2 of which were the deep-dive agent citing Beamix's own config paths as if they were inside the external repo — the safety net catching exactly the failure class it exists for). Full report: `docs/08-agents_work/sessions/2026-08-08-ceo-capability-gap-map.md` + published artifact (link in that session file).
**Open conflict surfaced, not resolved:** the 15 recommendations, if all actioned, net **+6 new files** with **zero deletions proposed** — against this task's own binding constraint that net agent/skill counts must not rise. Pairing new-file recs with the 12 already-identified zero-reference skill cuts (`stripe-integration`, `clerk-auth`, `payment-integration`, `nextjs-best-practices`, `frontend-dev-guidelines`, `create-pr`, `git-pr-workflows-git-workflow`, `finishing-a-development-branch`, `parallel-agents`, `ai-agents-architect`, `tool-design`, `vector-database-engineer`) would net to zero or negative.
**Rationale:** Cross-project capability harvest can't be done cheaply enough to matter without a deterministic fan-out; T5 workflow is the correct topology per the 2026-06-03 decision above. Evidence-gating in JS (not model self-policing) is what actually caught the 3 bad findings — validates the "spot-check the signal" lesson from the prior session's redesign-run caveat.
**Decided by:** CEO (ceo-capability-gap-map, 2026-08-08), scope choice confirmed by Adam via AskUserQuestion
**Affects:** future agent/skill/hook/command additions (13 recommendations to evaluate), `.claude/qa-tier-floor.yml` / `.claude/skills/MANIFEST.json` (several recs propose schema additions), no code merged this session
**Reversible?** N/A — read-only research session, nothing merged. Housekeeping note: this file is at 58 entries against the documented ≤50 cap (already 57 before this entry) — archiving is overdue but out of scope for this session.
**Update (same session):** Adam decided all 3 open items — offset new-file recs with the 12 pre-verified cuts (`stripe-integration`+`clerk-auth` cut unconditionally, 6 more paired 1:1 with the 6 new-file recs), chase the 2 high-confidence unresolved targets, re-verify container isolation. Follow-up run (`wf_394f5e4c-3b9`, 8 agents) resolved `buildermethods/agent-os` (ships nothing — deliberately retired its agent roster, v3.0 changelog) and `rohitg00/awesome-claude-code-toolkit` (136 agents/40 skills/42+220 commands/20 hooks, confirmed) and verified container isolation on redo (10/10 evidence, was citing dead code before). Total 17 recommendations sequenced into a 4-wave prioritized plan, now the artifact's first section.
