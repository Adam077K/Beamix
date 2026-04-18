# Handoff: Board Meeting 2026-04-15 → Next Session

## Context
Two-day board meeting (Apr 14-15) with Adam. Full product rethink completed.
Branch: ceo-1-1776183146

## What Was Decided

- **Pricing v2:** New tiers Discover $79 / Build $189 / Scale $499. Annual: $63/$151/$399. Kill 7-day trial — replace with 14-day money-back guarantee. Free one-time scan stays.
- **Agent Roster v2:** Kill all 7 old agents. Ship 11 new GEO-research-backed agents in MVP-1. Video SEO (12th) deferred to MVP-2. Renames: Content Refresher → Freshness Agent, Citation Builder → Off-Site Presence Builder.
- **Proactive Automation Model:** Replace manual "Agent Hub" with rules engine. Scans trigger suggestions → user accepts → agents run on schedule or event → output lands in Inbox → user approves. "Agents" removed from sidebar nav entirely.
- **Dashboard restructure:** 7 pages — Home · Inbox · Scans · Automation · Archive · Competitors · Settings. Inbox = 3-pane Superhuman layout. Freshness Agent gets inline chat editor for content editing.
- **LLM model roster locked:** Only Claude (Sonnet/Haiku/Opus), Gemini (Flash/Pro), GPT (4o/4o-mini/5-mini), Perplexity (Sonar/Pro/Online) via OpenRouter. No DeepSeek, Qwen, or other providers.
- **YMYL safety policy:** Topic-risk classifier (Haiku) in Query Mapper. Hard-refuse: clinical diagnosis, legal advice, investment advice. Soft gate: general health/finance education. MVP excludes regulated IL professions.
- **Hebrew localization:** 5 core dashboard screens in Hebrew + RTL at launch (EN fallback for rest). Israeli directory seed list locked (d.co.il, Easy, Rest, Bizmap/B144, Zap). Hebrew GEO benchmark study (50 queries × 4 engines) to be commissioned — gates Hebrew-first marketing.
- **Tier feature gates confirmed:** Blog Strategist is Build+ only on Discover. Competitor limit: Discover 3 / Build 5 / Scale 20 (pending explicit Adam confirmation).
- **Scan engine tiers:** Discover runs 3 engines (ChatGPT, Gemini, Perplexity). Build runs 7. Scale runs 9+.
- **Credit system:** "AI Runs" branding. Discover 25 runs/mo, Build 90/mo, Scale 250/mo. Blog Strategist capped at 40 runs/mo on Scale. 20% rollover. Per-agent costs: Schema/FAQ/Perf/Query=1, Optimizer/Freshness/Citation/Review/Entity/Reddit=1-2, Blog=3.

## Files Written This Session
- `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md` — all decisions
- `docs/product-rethink-2026-04-09/06-PRICING-V2.md` — pricing spec
- `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md` — agent roster + specs
- `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md` — UX spec
- `.claude/memory/DECISIONS.md` — updated with 6 new entries
- `docs/07-history/DECISIONS.md` — updated with 3 new entries

## Files to Read (in order for next session)
1. This handoff (`09-HANDOFF-PROMPT.md`)
2. `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md`
3. `docs/product-rethink-2026-04-09/06-PRICING-V2.md`
4. `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md`
5. `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md`
6. `docs/product-rethink-2026-04-09/10-PRE-BUILD-AUDIT.md` — audit findings, blockers, build order
7. `docs/product-rethink-2026-04-09/15-EXPERT-AUDIT.md` — 8-expert audit, security requirements, infra upgrades, agent priority tiers
8. `docs/product-rethink-2026-04-09/01-PRODUCT-STATE.md` (what exists in code today)
9. `docs/product-rethink-2026-04-09/02-GEO-RESEARCH.md` (research backing all decisions)

## What's Still OPEN (needs discussion before building)

### Round 3 — Cross-Cutting Systems (NOT YET DONE)
1. **Query Intelligence spine wiring** — how Query Mapper feeds all agents (data flow, DB schema, refresh triggers). This is the central data dependency — agents pull from it, not each other.
2. **Notifications system** — event → channel routing, Resend template mapping, daily digest logic. Which events notify by email vs in-app only?
3. **Content export flow** — how "Ready to post" Inbox items get to the user's website. Copy MD/HTML is v1. WordPress/Webflow/Shopify integration is post-MVP.
4. **Integrations roadmap** — GA4, GSC, WordPress, Webflow, Shopify, Slack, Zapier. Which ones ship in MVP-1? Which are post-launch?
5. **Hebrew-specific connections** — Israeli directory API integration (Dun & Bradstreet IL, Zap.co.il, etc.), IL-specific review platforms beyond Google.

### Round 4 — Archive Old Planning + Rewrite (COMPLETE)
- Old planning docs reviewed and superseded by rethink files.
- Old pricing/agent definitions noted for archival to `docs/_archive/`.
- `CLAUDE.md` project-state section flagged for update.
- `docs/PRD.md` old agent names and tier structure flagged for pass.

### Round 5 — Planning Summary + 2-Week Execution Plan (NOT YET DONE)
- Consolidate all rethink decisions into a single build brief.
- Define 7 parallel worktrees and daily milestones for the 2-week sprint.
- Write worker briefs per worktree (build-lead delegates to 7 backend/frontend workers).
- Define go/no-go criteria for day 14 launch readiness.

### Other Open Items
- **Per-agent budget sliders in Automation panel:** MVP-1 or MVP-2? Not decided.
- **BYO OpenRouter key for heavy users:** Post-MVP feature? Not decided.
- **Off-site verification close logic:** Auto-close Inbox hub item after scan confirms fix, or require explicit user action?
- **Settings Profile tab:** Separate from Business profile tab — 7 settings tabs total. Layout not spec'd yet.
- **Competitor limits:** Discover 3 / Build 5 / Scale 20 — used in specs but Adam has not explicitly confirmed. Needs sign-off before building.
- **Hebrew GEO benchmark:** 50 queries × 4 engines study. Not commissioned yet — assign to Research Lead.
- **Scan frequency limits:** Discover 1/week, Build 1/day, Scale unlimited — inherited from old spec, not re-confirmed in rethink.

## Pre-Build Audit (Completed 2026-04-17)
- Full audit by 5 agents: Product gaps, Tech stress-test, Business model, UX conversion, Research validation
- Findings documented in `10-PRE-BUILD-AUDIT.md`
- 7 P0 launch blockers identified and documented
- 5 spec contradictions resolved (Off-Site Builder credits, Blog Strategist tier, Competitors page, Settings tabs, daily caps)
- Key business decisions: monthly-only launch for 60 days, $19 top-up pack ships at launch, no AI disclosure labels in agent output content
- Build order defined: 4 waves, DB migration (Wave 0) must complete before any other worktree starts

## 8-Expert Audit (Completed 2026-04-18)
- 8 expert agents reviewed complete build plan from different perspectives
- Findings documented in `15-EXPERT-AUDIT.md`
- Key changes locked: Build tier $189, agent priority tiers (Deep 6 / Lighter 5), FAQ+Optimizer aha moment, query review gate
- Security: 3 Critical + 4 High findings → 10 requirements added to all worker briefs
- Infrastructure: Inngest Pro required ($75/mo), direct Anthropic SDK (bypass OpenRouter for 80% of calls)
- Customer Yael: 11 confusing terms → user-facing language policy (action labels only, no agent names, no "GEO")
- Missing features added: PDF report, share button, NPS, exit survey, feedback widget

## What to Do Next

1. Read this handoff + all rethink docs (in order listed above)
2. **Round 5: 2-Week Execution Plan** — the only remaining planning round:
   - 4-wave parallel build with 7 worktrees
   - Daily milestones for 14-day sprint
   - Worker briefs per worktree (include 10 security requirements from 15-EXPERT-AUDIT.md)
   - Go/no-go criteria for launch day
   - Wave 0 (DB migration) must run first — blocks everything
3. **Commission Research Lead** for Hebrew GEO benchmark (50 queries × 4 engines) — run parallel with build Week 1
4. **Commission Research Lead** for 5 customer problem interviews with Israeli SMBs — run Week 1
5. **Set up DNS** for notify.beamix.tech (Resend transactional email subdomain) — start warm-up 2 weeks before launch
6. **Create Paddle products** for Discover/Build/Scale monthly + annual + $19 top-up pack (note: Build is now $189/$151)
7. Get **Adam's explicit confirmation** on competitor limits (Discover 3 / Build 5 / Scale 20) — used in specs but never formally confirmed
8. **Upgrade Inngest** to Pro ($75/mo) before any load testing
9. Begin building!

## Session History

| Date | What happened |
|---|---|
| April 14 | Round 1 (7 pages), Round 2 (10+2 agents), pricing + credit model locked |
| April 15 | Round 3 (cross-cutting systems), DB schema, notifications, integrations, Hebrew research |
| April 17 | Round 4 (docs cleanup — 30+ docs, 14+ archived), pre-build audit (5 agents), final decisions locked, assisted-vs-autopilot validated |
| April 18 | 8-expert audit (CTO, VP Product, Growth, Security, AI/ML, DevOps, Startup Advisor, Customer Yael). Build→$189, agent priority tiers, security requirements, Inngest Pro, direct Anthropic SDK. |
