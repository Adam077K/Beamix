# Strategic Decisions Log

_A permanent record of every non-trivial decision made about the product, architecture, or business._

<!-- Agent: ceo + any lead | When: any time a non-trivial decision is made — technology choices, product direction, pricing, hiring, architecture, process | Instructions: Add entries newest-first (newest at the top, below this comment). Include WHY, not just WHAT. A future team member should be able to read this and understand the full reasoning, what alternatives were considered, and who was accountable. Status values: Active (in effect), Superseded (replaced by a newer decision — link to it), Reversed (undone — explain why). -->

---

## How to Use

Each entry answers three questions: **What** was decided, **why** this over alternatives, and **who** is accountable. Entries are permanent — never delete them. Mark old decisions as Superseded or Reversed with a reference to the newer entry.

---

### [YYYY-MM-DD] — Example: Chose Supabase over PlanetScale for database

**Decision:** Use Supabase (PostgreSQL) as the primary database for all structured data storage.

**Context:** We needed a hosted database solution before the first sprint. The team evaluated PlanetScale (MySQL-compatible, branching model), Neon (serverless Postgres), and Supabase (Postgres + realtime + storage + auth).

**Rationale:** Supabase bundles Postgres, row-level security, storage, and realtime in one platform — reducing the number of vendor integrations at early stage. The team has existing Postgres expertise. RLS handles multi-tenant data isolation at the DB layer, which simplifies backend code. PlanetScale's branching is valuable at scale but adds workflow complexity we don't need yet.

**Made by:** _build-lead_

**Status:** Active

---

_Last updated: — | Updated by: —_


---

## Unresolved Decisions (from Backlog D1-D7)

*Source: docs1/BACKLOG.md — open founder-level decisions*

# Beamix — Strategic Backlog

> **Last synced:** March 2026 — aligned with 03-system-design/

> **Created:** March 5, 2026
> **Updated:** March 6, 2026 — reorganized to match System Design v2.1 §7 priority classification + Unresolved Decisions added from planning audit
> **Source:** System Design v2.1 priority classification + Audit Report observations
> **Status:** Logged for future work. Not blocking engineering handoff.

---

## Unresolved Decisions — Require Founder Input

> These could NOT be resolved from existing locked decisions and require an explicit founder call before the affected code can be built. Added by planning audit 2026-03-06.

| # | Decision | Files Affected | Context |
|---|----------|---------------|---------|
| D1 | **Pro tier monthly price: $99 vs $149** | `PRODUCT_SPECIFICATION.md`, pricing page | Tier table = $99, Pricing Rationale = $149. Annual $79×12=$948 matches $99 monthly. Which is right? |
| D2 | **Business tier monthly price: $199 vs $349** | `PRODUCT_SPECIFICATION.md`, pricing page | Tier table = $199, Pricing Rationale = $349. Annual $159×12=$1,908 matches neither. |
| D3 | **Free engine 4: | `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md`, scan engine, landing | Copilot locked as free engine 4 in decisions but has no public API and is Phase 3 deferred. Options: (a) Claude as engine 4 + make Claude available for scanning at all tiers, (b) 3 free engines until Copilot ready, (c) swap Copilot for You.com. |
| D4 | **MVP onboarding design: 3-step vs 4-step** | `onboarding-spec.md`, `_SYSTEM_DESIGN_PRODUCT_LAYER.md` | onboarding-spec = 3 steps (Business Name, Industry, Location). Product layer = 4 steps (+ Competitors). Which is MVP? |
| D5 | **Free scan result expiry: 30 days vs 14 days** | `scan-page.md`, `settings-spec.md`, `_SYSTEM_DESIGN_PRODUCT_LAYER.md` | 2 of 3 docs say 30 days; product layer says 14. Recommend confirming 30 days. |
| D6 | **Visibility score formula for 7+ engines** | `PRODUCT_SPECIFICATION.md`, scan engine | Current "25pts × 4 engines = 100" breaks at Pro/Business tiers. Must define normalization approach before building Pro scan. |
| D7 | **Trial: manual re-scans locked or allowed?** | `settings-spec.md` | Locking manual re-scans during trial prevents users from seeing their improvement — reduces trial value. Allow 1 re-scan during trial, or keep fully locked? |

---

## 1. Launch Critical (18 items)

Must be built before first paying customer.

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Scan engine with 3 free-tier engines (ChatGPT, Gemini, Perplexity) | Built (mock) | Real LLM calls needed. Claude is Pro-tier only. |
| 2 | Response parsing with 0-100 sentiment | Designed | In Intelligence Layer |
| 3 | Visibility scoring algorithm | Built (mock) | Wire to real scan data |
| 4 | Free scan flow (viral acquisition) | Built | |
| 5 | Dashboard overview with gauge, trends, rankings | Built | |
| 6 | 12 original agents (A1-A12) | Built (mock) | Real LLM pipelines needed |
| 7 | Credit system (hold/confirm/release) | Designed | **Credit RPCs SQL not defined** — engineers need exact function signatures |
| 8 | Onboarding 4-step flow | Built | |
| 9 | Content library with editor | Built | |
| 10 | WordPress integration (Pro tier) | Not started | CMS publish flow |
| 11 | Alert system (email + in-app) | Not started | 9 alert types |
| 12 | Settings (business, billing, preferences) | Built | Billing tab uses hardcoded data |
| 13 | Paddle billing integration | Built (partial) | Webhooks + portal wired |
| 14 | Auth (Supabase) | Built | |
| 15 | Recommendations agent (auto post-scan) | Designed | A4 auto-runs after scan |
| 16 | Prompt generation per industry | Designed | In Intelligence Layer |
| 17 | Source-level citation tracking | Designed | `citation_sources` table |
| 18 | AI readiness scoring | Designed | A11 agent |

### Cross-Cutting Launch Blockers (from Audit)

| # | Item | Impact | Source |
|---|------|--------|--------|
| B1 | **Mobile/responsive design spec** — no spec for how dashboard looks on phones/tablets | High — SMB users check metrics on mobile | Morgan O1 |
| B2 | **Hebrew/RTL implementation guide** — "dual language" needs actual RTL engineering guide | High — core target market is Israeli | Morgan O2 |
| B3 | **"10 engines" marketing vs reality** — actually 4 API engines at launch + 3 Phase 2 + 3 deferred. Marketing must be honest. | High — legal/trust risk | Sage O3 |
| B4 | **Database migration strategy** — how to deploy schema changes safely (Supabase migrations, rollback plan) | High — operational necessity | Atlas O2 |
| B5 | **Workflow chain infinite loop protection** — no cooldown between workflow triggers | Medium — could burn credits | Sage O5 |
| B6 | **LLM output caching** — identical prompts across users in same industry/location. Could save 30-50% on LLM costs. | Medium — significant cost savings | Sage O8 |
| B7 | **Circuit breaker tuning** — 5-failures-in-10-min threshold may be too aggressive for 429 rate-limit errors | Medium — could disable engines | Sage m11 |

---

## 2. Growth Phase — 3 months (15 items)

Build after launch, within first 3 months.

| # | Item | Dependencies | Notes |
|---|------|-------------|-------|
| G1 | Content Voice Trainer (A13) | Launch agents | Learns business writing voice |
| G2 | Content Pattern Analyzer (A14) | Launch agents | What makes cited content succeed |
| G3 | Content Refresh Agent (A15) | Content library | Audit + update stale content |
| G4 | Brand Narrative Analyst (A16) | Scan engine | WHY AI says what it says |
| G5 | Agent workflow chains | A4, event system | Event-triggered multi-agent automation |
| G6 | Content performance tracking | Content library, scan engine | Publication → visibility correlation |
| G7 | Prompt volume estimation | 500+ businesses scanning | Aggregate anonymized scan data |
| G8 | Typed content templates (6 types) | Content agents | Comparison, lists, location, case study, deep-dive, FAQ |
| G9 | GA4 integration | OAuth flow | Referral + conversion tracking |
| G10 | GSC integration | OAuth flow | Keyword data, CTR, indexed pages |
| G11 | Slack integration | Alert system | Alert delivery channel |
| G12 | Customer journey stage mapping | Scan engine | Haiku classification: awareness/consideration/decision |
| G13 | Competitive intelligence dashboard | Scan engine | Share of voice, gap analysis, competitor profiles |
| G14 | Recurring agent execution | Workflow system | Scheduled runs |
| G15 | Prompt auto-suggestion | Onboarding, scan setup | LLM-powered prompt recommendations |

### Cross-Cutting Growth Items (from Audit)

| # | Item | Impact | Source |
|---|------|--------|--------|
| B8 | **WCAG accessibility audit** — no a11y spec. Legal risk in EU/US markets. | Medium — compliance risk | Morgan O3 |
| B9 | **Share button UX for viral free scan** — polished share flow for growth loop | Medium — viral coefficient | Morgan O5 |
| B10 | **Supabase Realtime channel design** — live updates for scan progress, agent streaming | Medium — UX improvement | Atlas O3 |
| B11 | **Cross-model QA latency optimization** — QA adds 2-5s. Consider streaming intermediate results. | Low — UX polish | Sage O1 |
| B12 | **Scan frequency tier value gap** — big jump between Starter (1/week) and Pro (every 3 days). Consider intermediate. | Medium — pricing/churn risk | Sage O4 |

---

## 3. Moat Builders — 3-6 months (20 items)

Competitive moat features that differentiate long-term.

| # | Item | Notes |
|---|------|-------|
| M1 | Persona-based tracking | `personas` table + prompt modifiers |
| M2 | Browser simulation (Copilot, AI Overviews) | Playwright infrastructure |
| M3 | Multi-region scanning | Geographic proxy architecture |
| M4 | Public REST API | Business tier, API keys with SHA-256 hashing |
| M5 | Brand narrative history + trends | Historical brand perception tracking |
| M6 | Content performance attribution | Agent output → visibility change correlation |
| M7 | Agent suggestion engine | Dashboard recommends which agent to run next |
| M8 | Cross-agent memory | Agents remember previous outputs and user edits |
| M9 | Cloudflare integration | Business tier |
| M10 | Multi-person editorial review workflows | Agency tier, multi-person review queue |
| M11 | Hebrew prompt library (unique) | Zero competition — first-mover monopoly |
| M12 | "What Changed" weekly diff reports | Per-query, per-engine diffs with competitor context |
| M13 | Competitor weakness alerts | Notify when competitor's visibility drops |
| M14 | AI readiness progress tracker (gamified) | Score improvement with milestones + celebration UX |
| M15 | Refactor batch crons to fan-out pattern | Before 1K businesses — Inngest fan-out for scale |
| M16 | "Authority estimate" algorithm | Citation source authority scoring for A9 |
| M17 | Meta AI engine adapter | Pending Meta API access |
| M18 | Revenue attribution (GA4 deep) | AI visibility → traffic → conversion correlation |
| M19 | Near real-time monitoring | Reduce scan frequency for Pro+ tiers |
| M20 | AI crawler analytics | Which AI bots visit user's website |

---

## 4. Intentionally Skipped (14 items)

Evaluated and rejected for current scope. Each has explicit reasoning.

| # | Item | Why Skipped |
|---|------|------------|
| S1 | White-label agency mode | Enterprise scope, premature for MVP. Requires multi-tenant architecture. |
| S2 | Looker Studio connector | Agency-specific feature. REST API (Business tier) covers data export needs. |
| S3 | CDN-level site optimization (AXP) | Scrunch-only feature. Very high implementation effort, low competitive pressure. |
| S4 | Shopify / e-commerce module | Not core SMB market. Service businesses are primary ICP. |
| S5 | YouTube/TikTok/Reddit monitoring | Orthogonal to core GEO value prop. |
| S6 | Contentful/Sanity CMS | Enterprise-only CMS platforms. WordPress covers 40%+ of market. |
| S7 | AI Mode browser simulation | Unstable, rapidly changing. |
| S8 | Full revenue attribution | Requires e-commerce integration (Shopify). |
| S9 | Multi-workspace | Agency feature. Defer until agency tier. |
| S10 | Webflow integration | Low competitor pressure. |
| S11 | Akamai/AWS CloudFront CDN | Enterprise infrastructure, not SMB. |
| S12 | Reddit alerts | Niche channel monitoring. |
| S13 | Gamma integration | Single competitor only (Profound). |
| S14 | Amazon Rufus engine | E-commerce specific AI engine. |

---

## Notes

- **Prompt volume magnitude:** Enterprise competitors process 130M+ prompts. At <1K users Beamix processes ~10K. Not comparable; market honestly as "estimated relative volume."
- **Hebrew/RTL as advantage:** Market-specific, not universal. Don't over-index in global marketing.
- **Innovation claims honesty:** Some "structural advantages" (Inngest-native, event-driven) are UX differentiators, not truly unique innovations. Frame honestly.
- **Content performance causation:** System correctly disclaims causation between agent output and visibility changes (no action needed).
