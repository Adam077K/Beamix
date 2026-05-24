---
date: 2026-05-23
agent: cbo
session_slug: agency-pivot-financials
status: COMPLETE
qa_verdict: PASS (no externally visible price change — internal docs only; no QA-Lead spawn required for pure analysis session)
linear_ticket: none
source_decisions: 2026-05-23 AGENCY PIVOT entry in DECISIONS.md (15 locked decisions)
---

# CBO Session — Agency Pivot Financial Documentation

## Decision this session informs

How to financially document, model, and operationally plan the pivot from self-serve GEO tool ($79/$189/$499) to done-for-you GEO agency ($499/$999/$1,499/$2,499) across 6 existing doc files and 3 new operational files.

## Key uncertainties at time of analysis

1. All COGS numbers except Paddle fee are assumed — no production API cost logs exist
2. Month-6 retention is modeled at 80% base but no cohort data exists
3. Customer mix (50/30/15/5) is assumed — no acquisition data
4. CAC is ~$0 for beachhead cohort (Adam time, not cash)

## Files edited

1. `docs/09-metrics/UNIT_ECONOMICS.md` — full rewrite. Agency COGS model, gross margins, LTV at 3 retention scenarios, CAC headroom, 60-day refund exposure, sensitivity tables.
2. `docs/09-metrics/NORTH_STAR.md` — full rewrite. Retired free-scan completion. New north star: month-3 retention rate. Justified by 45-90 day GEO TTR.
3. `docs/09-metrics/GROWTH.md` — full rewrite. Three-scenario growth model (conservative/base/aggressive), beachhead motion phases, GTM cost model.
4. `docs/01-foundation/BUSINESS_MODEL.md` — inserted agency model documentation above legacy spec content. All old $79/$189/$499 references clearly superseded.
5. `docs/01-foundation/TARGET_MARKET.md` — full rewrite. Three launch ICP verticals with sourced data, TAM/SAM/SOM estimates, persona updates.
6. `docs/product-rethink-2026-04-09/18-LEGAL-PUBLISHING-PLAN.md` — added §A-E agency clauses: customer warrants property, customer indemnifies 3rd-party claims, CAN-SPAM compliance for email-as-them, approval gate as legal protection, schema publishing safety. Updated refund policy from 14-day to 60-day.

## Files created

1. `docs/09-metrics/UNIT_ECONOMICS_TIER_MODEL.md` — per-tier structured model with full COGS breakdown, 60-day refund exposure, break-even refund rates, LTV tables, sensitivity analysis.
2. `docs/legal/TERMS_OF_SERVICE_v1_DRAFT.md` — full ToS draft. All 15 required sections including: 12-month fees liability cap, customer warrants property, approval gate authorization, customer indemnifies, 60-day money-back terms + activation requirement, one-per-account rule, held-revenue accounting acknowledgment, IP (customer keeps work product), data processing (GDPR + Israeli Privacy Law), termination clauses, governing law (Israel). Marked DRAFT with mandatory lawyer-review Adam-blocker.
3. `docs/business/INSURANCE_PROCUREMENT_PLAN.md` — procurement checklist: $1M GL + E&O, Israeli providers (Hibub/Phoenix/Migdal/Clal), estimated annual premium $800-$2,150, required documents, timeline 5-10 business days, what's covered/excluded.

## Unit economics summary

- Blended gross margin central case: **92.6%** (assumed — Paddle fee is fact; LLM/support COGS are assumed)
- Break-even refund rate per tier: **~50-52%** (all tiers) — business absorbs refunds up to 50% before cohort gross profit goes negative
- CAC ceiling per tier (LTV:CAC = 3, 80% retention): Starter $4,672 / Growth $3,275 / Scale $4,912 / Professional $8,184 (all assumed)
- Founding-100 worst case (100% refund): **$192,383** (assumed)
- Founding-100 central case (12% refund, Quicksprout fact): **$26,762** (assumed)
- Cash needed before first revenue recognition (day 61): **$5,000-$15,000** (assumed)

## Insurance action

Adam-blocker: Contact Hibub first (fastest Israeli digital insurer), then Phoenix. Target: $1M GL + $500K-$1M E&O bundle, expected $800-$2,150/year. Must be active BEFORE customer #1 invoiced. See `docs/business/INSURANCE_PROCUREMENT_PLAN.md`.

## Consistency findings

1. `docs/01-foundation/PRODUCT_SPECIFICATION.md` — still references $79/$189/$499 Discover/Build/Scale tiers throughout. This file is now historical reference only, superseded by BUSINESS_MODEL.md. Recommend CPO adds a clear deprecation notice to top of PRODUCT_SPECIFICATION.md.
2. `docs/01-foundation/VISION.md` — references self-serve user journeys (Yael free scan → $79 tier). Not updated in this session — CMO/CPO should update persona journeys in a separate session when agency UX is designed.
3. `docs/09-metrics/NORTH_STAR.md` and `docs/09-metrics/GROWTH.md` were redirect stubs — now contain real content. Any doc linking to VISION.md for north star / growth data should be updated to point to these files.
4. `18-LEGAL-PUBLISHING-PLAN.md` previously referenced a 14-day refund in the ToS clauses — updated to 60-day. The old refund copy with "run-aware 50% cap" was specific to self-serve AI Runs and has been replaced.

## Decisions made (sub-decisions with reversibility)

1. **North star = month-3 retention** — reversibility: easy (doc change, product metric query update)
2. **Conservative annual premium range $800-$2,150** — reversibility: easy (assumed estimate, Adam gets real quotes)
3. **ToS liability cap = 12 months fees paid** — reversibility: hard (changes require lawyer + customer notification once published)
4. **Customer indemnification clause in ToS** — reversibility: requires-Adam-sign-off (core legal protection, should not be weakened)
5. **All financial model numbers labeled (assumed)** until cohort data exists — reversibility: easy (model update)

## Confidence

MEDIUM — Financial model is structurally sound and all inputs are labeled. Confidence is MEDIUM because zero real COGS data exists (no customers). Confidence upgrades to HIGH at month 3 with first 10+ customer cost logs.

## Blockers

None. All files written. Legal file is marked DRAFT pending Adam's lawyer-review action.
