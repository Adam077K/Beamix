---
name: Product Improvement Sprint 2026-03-20
description: Major product overhaul — scan v3 pipeline, scan-aware agents, tier differentiation, recommendations auto-populate
type: project
---

## Completed (2026-03-20)

### Phase 1: Critical Fixes
- **FAQ agent route bug FIXED** — was calling `executeAgent('query-researcher')` instead of `'faq-agent'`
- **AI Readiness Auditor HIDDEN** from all nav (sidebar, top nav, mobile) — page preserved for future build
- **Paid scan rewritten to v3 pipeline** — now uses same quality as free scan: Perplexity research → smart queries → queryEngineRaw → Gemini Flash analyzer → shared buildScanResults
- **Scan tier config created** (`src/lib/scan/tier-config.ts`): free (7 calls), starter (10), pro (16), business (20)
- **Claude added to queryEngineRaw()** for Pro+ tier scans
- **Dead code deleted**: scan-free.ts Inngest function, 11 mock pipeline files
- **Recommendations auto-populated** from free scan quick_wins during onboarding
- **Upsell CTA** added to recommendations page for non-paying users
- **Scan polling timeout** added (90s max) to prevent infinite loading

### Phase 3: Agent Enhancement
- **Scan data injected into agent context** — agents now see visibility score, engine mentions, competitors, brand attributes, missing qualities
- **Perplexity pre-research** added for content_writer, blog_writer, competitor_intelligence, review_analyzer — gives agents current web data
- **Correct DB column**: `scans.results_summary` (NOT `results_data`)

## Remaining (from plan)
- **Phase 2**: Wire tier config into scan-manual.ts (queries 4-6 for higher tiers)
- **Phase 4**: i18n/Hebrew (next-intl wiring, language toggle, RTL CSS)
- **Phase 5**: Credit pricing redesign (research in progress)
- **Phase 6**: PDF reports, streaming, polish

## Founder Decisions (2026-03-20)
- AI Readiness: hide now, build later (real crawler in future)
- Paid scans must be better than free, tiered by plan
- Agents get scan data as context BUT must also do own research
- Non-paying users see free scan quick wins on recommendations
- Credit system needs redesign (research in progress)
- Hebrew/RTL is wanted, not a launch blocker
- Trial clock starts on first dashboard visit (confirmed)
- Launch strategy: 3-4 working agents, real scan, real billing, iterate (Option C)
