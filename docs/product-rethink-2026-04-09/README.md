# Beamix Product Rethink — 2026-04-09

## What This Is

A comprehensive product state audit + research-backed redesign of Beamix, expanded through two board-meeting iterations into a complete build plan with execution specs.

This folder is the single source of truth for any agent continuing this work.

## Session Context

- **Initial audit:** 2026-04-09 (branch `ceo-2-1775739516`, initiated by Adam)
- **Board decisions:** 2026-04-15
- **Expert audit + pricing correction:** 2026-04-18
- **Goal:** Understand the real state of the product (not stale docs), research what actually works for GEO, rethink features from first principles, then plan the build.

## What Was Done

### Phase 1: Codebase Audit (5 parallel Explore agents)
Audited the ACTUAL codebase — not existing docs — to understand what's real, mock, stub, or missing.

1. **Routes & API audit** — every page and API endpoint, real vs mock status
2. **Business logic audit** — scan engine, agent system, LLM integration, all libs
3. **UI components audit** — all features, dashboard screens, user flows
4. **Database schema audit** — all 30+ tables, migrations, RPCs, RLS policies
5. **Config & infrastructure audit** — dependencies, env vars, Inngest, Vercel crons

### Phase 2: GEO Research (3 parallel Researcher agents)
Deep research with sourced findings on:

1. **GEO ranking factors** — what actually makes AI engines mention/recommend a business (Princeton GEO paper, Ahrefs 78.6M study, Semrush 1000-domain study, SurferSEO 36M AI Overview analysis)
2. **AI content risks** — can AI-generated content backfire? legal requirements, quality safeguards
3. **Competitive landscape** — 25+ tools analyzed, agency pricing, gap analysis

### Phase 3: Product Rethink (CEO + Product Lead synthesis)
Synthesized all findings into a redesigned product vision focused on what the research proves works.

### Phase 4: Board Meeting + Locked Decisions (2026-04-15)
Multi-agent critical review produced final locked decisions on pricing, agent roster, UX architecture, handoff prompts, and pre-build audit. Files 05-09 capture this phase.

### Phase 5: Execution Planning (2026-04-17)
Converted locked decisions into build-ready specs: 3-wave execution plan with CEO briefs, TypeScript agent pipeline types, design system spec, scan UX spec. Files 11-14.

### Phase 6: Expert Audit + Pricing Correction (2026-04-18)
8-expert adversarial audit uncovered Yael's NIS 700 approval ceiling, leading to Build tier correction ($199 → $189). File 15.

## Files in This Folder

| File | What It Contains |
|------|-----------------|
| `README.md` | This file — overview and context |
| `01-PRODUCT-STATE.md` | Complete audit of what exists in the codebase today |
| `02-GEO-RESEARCH.md` | All research findings with sources — ranking factors, content risks, competitive landscape |
| `03-PRODUCT-VISION.md` | Redesigned product — features, agent system, UX model, priorities (supersedes parts of this in later docs) |
| `04-OPEN-QUESTIONS.md` | Open decisions as of 2026-04-09 — most now resolved in 05 |
| `05-BOARD-DECISIONS-2026-04-15.md` | **MASTER LOCKED DECISIONS** — pricing, agents, UX, GTM. Canonical answers to all Phase 1-3 open questions. |
| `06-PRICING-V2.md` | Final pricing tiers Discover $79 / Build $189 / Scale $499 with positioning rationale |
| `07-AGENT-ROSTER-V2.md` | 11-agent MVP-1 roster + deep per-agent specs (Query Mapper, Content Optimizer, Freshness Agent, FAQ Builder, Schema Generator, Off-Site Presence Builder, Review Presence Planner, Entity Builder, Authority Blog Strategist, Performance Tracker, Reddit Planner) |
| `08-UX-ARCHITECTURE.md` | 7-page dashboard architecture + user flows + state model |
| `09-HANDOFF-PROMPT.md` | Session handoff brief for the next agent picking up the work |
| `10-PRE-BUILD-AUDIT.md` | P0/P1/P2 findings from pre-build review |
| `11-EXECUTION-PLAN.md` | 3-wave build plan with CEO briefs per wave |
| `12-AGENT-BUILD-SPEC.md` | TypeScript agent pipeline types, interfaces, and execution contract |
| `13-DESIGN-SYSTEM-SPEC.md` | Components, tokens, motion language |
| `14-SCAN-UX-SPEC.md` | Scan animation + free-scan-to-paywall conversion flow |
| `15-EXPERT-AUDIT.md` | 8-expert adversarial review — source of the Build $199→$189 correction |

## Canonical Answers (quick reference)

- **Pricing:** Discover $79 / Build $189 / Scale $499 per month (annual $63 / $151 / $399)
- **Agents:** 11 in MVP-1 (Deep 6: Query Mapper, Content Optimizer, Freshness Agent, FAQ Builder, Schema Generator, Off-Site Presence Builder. Lighter 5: Review Presence Planner, Entity Builder, Authority Blog Strategist, Performance Tracker, Reddit Planner)
- **LLM routing:** Direct Anthropic SDK primary for Claude; OpenRouter for Gemini / GPT / Perplexity
- **Orchestration:** Inngest Pro ($75/mo) required
- **Security:** SSRF protection + prompt injection defense + Turnstile on all user-triggerable backend paths
- **Localization:** Hebrew UI polished (5 key screens); generated content always English
- **Content voice:** No AI labels inside content. Agent names are internal identifiers; users see action labels.
- **Free preview:** FAQ Builder + Content Optimizer teaser before paywall
- **Reporting:** PDF report for boss approval (Yael requirement)

## How to Continue This Work

Any agent picking this up should:

1. Read `05-BOARD-DECISIONS-2026-04-15.md` first — that's the canonical locked state.
2. Then read `11-EXECUTION-PLAN.md` to understand the build plan.
3. For implementation, consult the wave-specific specs: 12 (agent pipeline), 13 (design system), 14 (scan UX).
4. `03-PRODUCT-VISION.md` and `04-OPEN-QUESTIONS.md` are superseded by 05 — keep for historical context only.
5. `15-EXPERT-AUDIT.md` is the living "watch-out" list — re-check before shipping.
