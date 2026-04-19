---
title: Product MOC
type: moc
domain: product
summary: PRD, roadmap, user stories, feature specs — everything about what Beamix does
tags:
  - product
  - features
  - specs
status: active
updated: 2026-04-19
---

# Product MOC

> Everything about what Beamix does, how users interact with it, and what's planned.

## Core Documents

- [[docs/PRD]] — Master product requirements (index document)
- [[docs/01-foundation/PRODUCT_SPECIFICATION]] — Full user journeys, features, pricing, IA
- [[docs/04-features/ROADMAP]] — Feature roadmap and phases
- [[docs/04-features/USER_STORIES]] — User stories by persona
- [[docs/BACKLOG]] — Prioritized task backlog
- [[docs/PRODUCT_DESIGN_SYSTEM]] — Product dashboard design system
- [[docs/BRAND_GUIDELINES]] — Brand identity (shared with marketing)

## April 2026 Rethink — Authoritative Decisions

- [[docs/product-rethink-2026-04-09/]] — All April 2026 product decisions (agents, UX, pricing)

## Feature Specs

### Current Dashboard (April 2026)

- [[docs/04-features/specs/dashboard-7-pages.md]] — 7-page dashboard spec: Home, Inbox, Scans, Automation, Archive, Competitors, Settings
- [[docs/04-features/specs/proactive-automation-model.md]] — Proactive automation model (replaces Agent Hub)
- [[docs/04-features/specs/free-scan-to-paywall.md]] — Free scan → paywall conversion flow
- [[docs/04-features/specs/notifications-and-content-export.md]] — Notifications and content export

### Scan & Auth

- [[docs/04-features/specs/scan-engine-spec]] — Multi-engine scan pipeline (ChatGPT, Gemini, Perplexity, Claude)
- [[docs/04-features/specs/scan-page]] — Free scan landing page (`/scan/[scan_id]`)
- [[docs/04-features/specs/scan-redesign-spec]] — Scan UX redesign (discovery query vs brand recall)
- [[docs/04-features/specs/auth-onboarding-spec]] — Auth flow + 4-step onboarding
- [[docs/04-features/specs/onboarding-spec]] — Onboarding detail spec

### Billing & Settings

- [[docs/04-features/specs/integration-billing-spec]] — Paddle billing integration (hold/confirm/release)
- [[docs/04-features/specs/email-system-spec]] — Resend email templates

### Intelligence & Automation

- [[docs/04-features/specs/content-comparison-spec]] — Before/after content comparison
- [[docs/04-features/specs/alert-workflow-spec]] — Alert and notification workflows (needs agent name update)
- [[docs/04-features/specs/auto-suggest-competitors-spec]] — Auto-suggest competitors

### Advanced / Phase 2-3

- [[docs/04-features/specs/scan-refresh-optimization-spec]] — Scan scheduling optimization
- [[docs/04-features/specs/multi-region-scanning-spec]] — Multi-region scanning
- [[docs/04-features/specs/topic-query-clustering-spec]] — Topic/query clustering
- [[docs/04-features/specs/prompt-volume-data-spec]] — Prompt volume data
- [[docs/04-features/specs/web-mention-tracking-spec]] — Web mention tracking
- [[docs/04-features/specs/browser-simulation-spec]] — Browser simulation for engines without API
- [[docs/04-features/specs/new-features-batch-1-spec]] — New features batch 1 (F1–F4)
- [[docs/04-features/specs/new-features-batch-2-spec]] — New features batch 2 (F5–F7)
- [[docs/04-features/specs/new-features-batch-3-spec]] — New features batch 3 (F9–F11)

## Archived Specs (Pre-April 2026 Rethink)

These specs describe the old product and are kept for historical reference only. Do not build from them.

- `docs/_archive/2026-04-pre-rethink/specs/agent-system-spec.md` — 16-agent system (A1–A16), Agent Hub
- `docs/_archive/2026-04-pre-rethink/specs/ai-readiness-spec.md` — /dashboard/ai-readiness page (removed)
- `docs/_archive/2026-04-pre-rethink/specs/ai-crawler-feed-spec.md` — Cloudflare bot detection, LLMS.txt (killed)
- `docs/_archive/2026-04-pre-rethink/specs/blog-infra-spec.md` — Blog CMS in Next.js (now Framer)
- `docs/_archive/2026-04-pre-rethink/specs/competitive-intelligence-spec.md` — Old A8 agent, old tier limits
- `docs/_archive/2026-04-pre-rethink/specs/content-system-spec.md` — /dashboard/content nav page (removed)
- `docs/_archive/2026-04-pre-rethink/specs/conversation-explorer-spec.md` — /dashboard/explore (killed)
- `docs/_archive/2026-04-pre-rethink/specs/dashboard-analytics-spec.md` — Old Rankings/Recommendations pages
- `docs/_archive/2026-04-pre-rethink/specs/dashboard-design-spec.md` — Old sidebar structure
- `docs/_archive/2026-04-pre-rethink/specs/dashboard-redesign-spec.md` — Pre-rethink redesign (orange→blue era)
- `docs/_archive/2026-04-pre-rethink/specs/dashboard-spec.md` — Old 8-page dashboard
- `docs/_archive/2026-04-pre-rethink/specs/pricing-page-spec.md` — Old $49/$149/$349 tiers
- `docs/_archive/2026-04-pre-rethink/specs/product-ux-review-2026-03-20.md` — UX review of old product
- `docs/_archive/2026-04-pre-rethink/specs/settings-spec.md` — Old 7-day trial, old tier names

## Related MOCs

- [[MOC-Architecture]] — Technical implementation of these features
- [[MOC-Business]] — Pricing strategy behind tier decisions
- [[MOC-Metrics]] — How we measure feature success
