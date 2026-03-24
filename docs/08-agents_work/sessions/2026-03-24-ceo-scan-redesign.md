---
date: 2026-03-24
lead: ceo
task: scan-architecture-redesign-and-production-fixes
outcome: COMPLETE
agents_used:
  - product-lead
  - ai-engineer
  - plan-agent
  - code-reviewer (x4 rounds)
  - security-engineer
  - integration-checker
  - researcher (x2 — GEO methodology + model ID verification)
  - backend-developer
  - database-engineer
  - deep-scan-auditor
decisions:
  - key: scan_queries_perplexity_generated
    value: Perplexity generates the 3 scan queries as part of its research step
    reason: Template-based queries used services[0] verbatim which nobody searches for
  - key: scoring_formula_reweighted
    value: "50% mention + 20% position + 15% sentiment + 15% content richness"
    reason: SparkToro research (2961 queries) proved position is unreliable — downweighted from 30% to 20%
  - key: no_system_prompts_on_engines
    value: Pure user-role messages to scan engines
    reason: No GEO tool (Otterly, Peec, Profound) uses system prompts — they simulate real user searches
  - key: default_temperature
    value: Temperature omitted on engine queries
    reason: Perplexity docs say "do not tune temperature" — reflect real user experience
  - key: synchronous_scan
    value: Free scans run synchronously in the HTTP request
    reason: Vercel kills functions after response — after() and fire-and-forget both fail
  - key: mock_data_eliminated
    value: API failures return empty response, not fake competitor names
    reason: "TopCompetitor Co" was leaking into real results
context_for_next_session: "Scan system is production-ready with 15 PRs merged. Next priorities: wire the new prompts/scoring module (in src/lib/scan/prompts/) into the main pipeline, consider multi-run sampling for statistical reliability, and add user-defined custom queries for paid tiers."
---

# Session: Scan Architecture Redesign + Production Fixes

## What We Did

### Phase 1: Full Architecture Redesign (PRs #3-#5)

**Problem**: The scan engine measured brand recall instead of organic discoverability. The brand query explicitly asked "Tell me about [BusinessName]" which always returned a mention, inflating scores. Only 3 queries generated regardless of tier. Free scan ran synchronously with Vercel timeout risk.

**What we built:**
- **8 new prompt modules** (`src/lib/scan/prompts/`) — 7 organic query types, 3D scoring, dynamic analyzer, engine config
- **Schema migration** — 14 new columns across `scan_engine_results`, `scans`, `free_scans`
- **Async free scan** via Inngest (`scan-free.ts`) + shared `scan-core.ts` pipeline
- **Cleaned engine-adapter** — removed biased `buildPrompt()`, removed hardcoded temperature
- **Deleted dead code** — `parser.ts`, `scorer.ts`, legacy `process/route.ts`

**Research**: Deployed researcher agent (Opus) who analyzed 16 GEO industry sources (Otterly, Peec AI, Profound, SparkToro, Geneo, Conductor, Foundation Inc, SearchEngineLand, Perplexity docs, GenOptima, Princeton GEO paper). Key findings: no GEO tool uses system prompts, default temperature recommended, position ranking unreliable, 75/25 unbranded/branded split is standard.

### Phase 2: Security + Code Review (PRs #3 continued)

3 review rounds found and fixed 17 issues:
- **4 critical security**: SSRF in website scraper, prompt injection via business_name, IP rate limit bypass, URL scheme validation
- **3 high security**: Plan-tier rate limits on manual scan, scan expiry check, all-mock detection
- **7 logic bugs**: Brand query contamination, dead scoring code, broken problem queries, unsafe type cast, fabricated competitor scores, spurious DB writes, template replacement
- **1 critical integration**: scanFree not registered in Inngest serve route

### Phase 3: Making Scan Actually Work (PRs #5-#10)

**Problem**: OpenRouter showed zero usage — scans never completed.

Root causes found and fixed:
1. **PR #5**: `anthropic/claude-haiku-4` → `anthropic/claude-haiku-4.5` (404 on OpenRouter)
2. **PR #6**: Sync fallback when Inngest unavailable
3. **PR #7**: Fire-and-forget background scan (Vercel killed it)
4. **PR #8**: `after()` API (Vercel still killed it)
5. **PR #9**: Removed 90s frontend polling timeout
6. **PR #10**: **Final fix** — fully synchronous scan. DB updated before response sent. `maxDuration: 300`.

### Phase 4: Query Quality (PRs #11-#14)

**Problem**: Queries were terrible. "best Natural language app generation" — nobody searches for this.

Root causes:
- `generateScanQueries()` used `research.services[0]` verbatim as the search term
- Website scrape was never sent to Perplexity research prompt
- User's sector hint was collected but ignored
- Analyzer extracted ANY business as a "competitor" regardless of industry

Fixes:
1. **PR #11**: Simple natural queries + random 2-of-3 distribution per engine
2. **PR #12**: Website context + sector hint passed to Perplexity
3. **PR #13**: **Key fix** — Perplexity generates the scan queries itself (it understands the business and knows how users search)
4. **PR #14**: Analyzer filters competitors by industry + receives known competitors from research

### Phase 5: Scoring + Quality Overhaul (PR #15)

**Problem**: Scoring was unreliable, mock data leaked into results, leaderboard was unfair.

Deep architectural audit (2 Opus agents — code reviewer + GEO researcher) produced detailed report. 6 fixes implemented:
1. **Mock data fix** — empty response on API failure (not fake "TopCompetitor Co")
2. **Analyzer truncation** — 2500→4000 chars (mentions in long responses were cut off)
3. **Scoring reweight** — 50% mention + 20% position + 15% sentiment + 15% content richness
4. **Fair leaderboard** — same formula for user and competitors
5. **Share of Voice** — user vs top competitor (not aggregate sum)
6. **Score clamp** — ranking_quality_score capped at 0-100

Code review found 3 additional P1 issues, all fixed inline:
- Case-insensitive `is_user` matching (prevented duplicate leaderboard entries)
- User filtered from `top_competitors` before SOV calculation
- Removed asymmetric 95-cap on competitor scores

## All PRs Merged

| PR | Title | Files | Lines |
|---|---|---|---|
| #3 | feat(scan): complete scan architecture redesign | 24 | +2170/-1001 |
| #5 | fix(scan): invalid model ID + sync fallback | 2 | +107/-19 |
| #6 | fix(scan): run free scans synchronously | 1 | +20/-43 |
| #7 | fix(scan): return 202 immediately, run in background | 1 | +63/-56 |
| #8 | fix(scan): use Next.js after() | 1 | +70/-66 |
| #9 | fix(scan): remove 90s polling timeout | 1 | +3/-30 |
| #10 | fix(scan): synchronous scan — results saved to DB | 1 | +34/-73 |
| #11 | feat(scan): simple natural queries + smart engine distribution | 3 | +107/-78 |
| #12 | fix(scan): website context + sector hint to Perplexity | 2 | +60/-36 |
| #13 | fix(scan): Perplexity generates scan queries | 1 | +60/-35 |
| #14 | fix(scan): only show direct competitors in same industry | 3 | +21/-8 |
| #15 | fix(scan): scoring overhaul + mock data fix + analyzer quality | 3 | +70/-45 |

## Key Architecture Decisions

### Scan Flow (Final)
```
1. User submits URL + business name + sector + location
2. Website scraper extracts homepage content (title, meta, headlines)
3. Perplexity research: receives URL + scraped content + sector hint
   → Returns: industry, services, competitors, search_queries
4. 3 scan queries generated BY Perplexity (natural, user-like)
5. Queries sent to engines:
   - Perplexity: all 3 queries (best at finding businesses)
   - ChatGPT: 2 random (seeded by scanId)
   - Gemini: 2 random (different pair)
6. Gemini Flash analyzes ALL responses
   → Extracts: mentions, position, sentiment, competitors (filtered by industry)
7. Score calculated: 50% mention + 20% position + 15% sentiment + 15% content
8. Results saved to DB, frontend polls and displays
```

### Model IDs (Verified on OpenRouter)
- ChatGPT: `openai/gpt-4o-mini:online` (web search via :online suffix)
- Gemini scan: `google/gemini-2.0-flash-001:online` (web search)
- Perplexity: `perplexity/sonar-pro` (native web search)
- Gemini analyzer: `google/gemini-2.0-flash-001` (no web search)
- Haiku: `anthropic/claude-haiku-4.5` (was claude-haiku-4, which 404'd)

### Cost per scan: ~$0.13 (7 API calls + 1 research + 1 analysis)

## Files Changed (Final State)

### New files created
- `src/lib/scan/prompts/` (8 files) — new prompting architecture
- `src/lib/scan/scan-core.ts` — shared pipeline
- `src/inngest/functions/scan-free.ts` — async free scan
- `supabase/migrations/20260323_scan_schema_fix.sql`
- `docs/04-features/specs/scan-redesign-spec.md`

### Files heavily modified
- `src/app/api/scan/start/route.ts` — rewritten 3 times (Inngest→sync→after()→sync)
- `src/lib/scan/engine-adapter.ts` — cleaned, mock data fixed
- `src/lib/scan/query-templates.ts` — Perplexity generates queries
- `src/lib/scan/build-results.ts` — scoring overhaul
- `src/lib/scan/analyzer.ts` — industry filter, 4000 char truncation
- `src/lib/openrouter.ts` — fixed haiku model ID

### Files deleted
- `src/lib/scan/parser.ts` (dead code)
- `src/lib/scan/scorer.ts` (dead code)
- `src/app/api/scan/[scan_id]/process/route.ts` (legacy v1)

## Known Remaining Items

1. **New prompts module not wired in** — `src/lib/scan/prompts/` has a full new scoring system (`calculateScanScore`) that's exported but never called. The pipeline still uses the inline scoring in `build-results.ts`.
2. **Multi-run sampling** — SparkToro recommends 60-100x runs per query for statistical reliability. We do 1x. Future: Pro/Business tiers could run 5-10x.
3. **Browser automation** — Peec AI and Otterly use UI scraping (not API calls) because API responses differ from what users see. Worth investigating for V2.
4. **User-defined queries** — Industry standard (Otterly, Peec) lets users define custom queries. Our auto-generated queries are better now but custom would be ideal for paid tiers.
5. **Website scraper doesn't handle JS-rendered pages** — Modern SPAs return empty HTML. Consider Firecrawl or Browserless for V2.
