---
date: 2026-05-23
agent: ceo
session_slug: agency-pivot-grill
status: COMPLETE
qa_verdict: n/a (planning session, no code)
linear_ticket: (none — interactive grill)
---

# Beamix Agency-Pivot Grill — Decisions In Progress

Interactive "grill me" session: stress-testing a pivot from "GEO tool" to "done-for-you GEO agency that hides agents and shows results."

## Locked decisions (in order)

| # | Decision | Choice |
|---|---|---|
| 1 | Agency model | **Done-for-you SaaS** — $499–$2,500/mo, self-serve checkout + onboarding call, weekly report + light dashboard, real publishing on customer's behalf |
| 2 | Approval gates | **Tiered** — auto for citations/listings/schema/scans; gated (1-click approve in digest) for content publishing, email-as-them, external outreach |
| 3 | Push mechanism | **Hybrid** — full auto on stable APIs (WordPress, Shopify, Webflow, GBP, Yelp, Apple Maps, SendGrid sub-account, schema via GTM); paste-ready with 1-click instructions on Wix/Squarespace/custom CMS |
| 4 | Onboarding | **Agent discovery call** day 1; Adam reviews/approves every brand brief through customer #50, then phases out |
| 5 | Service scope | **GEO-only** — schema, citations, GBP/listings, GEO-tuned content, AI-engine corpora, multi-engine visibility tracking. NOT general SEO, paid ads, social, email marketing. |
| 6 | Tier strategy | **Free scan → discovery → tiered subscription** ($499 / $999 / $1,499). Old $79/$189/$499 Discover/Build/Scale tiers killed. One product, one funnel. |
| 7 | Customer dashboard | **Outcomes + traceability** — AI visibility score per engine, weekly wins, top winning queries, approval queue, weekly digest archive, PLUS "how we got this" drill-down trail. NO agent names, NO credit counters, NO raw scan tooling. |
| 8 | Trial/refund mechanic | **60-day no-questions money-back, month-to-month, no contract, one-click cancel in dashboard, customer keeps all work product, 5 guardrails** (see below) |
| 9 | Pricing tiers | **4 tiers: Starter $499 / Growth $999 / Scale $1,499 / Professional $2,499**. Professional includes Adam-led monthly strategy review through customer #50, then agent-handled. Old $79/$189/$499 tiers killed. |
| 10 | Launch ICP | **3 verticals at launch: B2B SaaS <$5M ARR + Solo/small law firms + Single-location dental.** 3 vertical-specific landing pages, 3 discovery script variants, separate case-study tracks per vertical. HVAC, real estate, DTC, healthcare-non-dental deferred to MVP+90. |
| 11 | Tier spec baseline | **Locked the deliverable matrix** — Starter (1 loc, 3 engines, 25 prompts, 4 schema/mo, 2 FAQs, 5 citations, WP/Webflow/Shopify, 48h SLA) → Growth (3 loc, 5 engines, 75 prompts, 12 schema, 6 FAQs, 15 citations, +Ghost/Squarespace/Wix paste, 24h SLA) → Scale (unlimited loc, 7 engines, 200 prompts, 24 schema, 10 FAQs, 30 citations, 10 outreach emails/mo, +GBP/Yelp/Apple/GTM, discovery call, 12h SLA) → Professional (unlimited, 7+custom, 500 prompts, unlimited schema, 16 FAQs, unlimited citations, 30 outreach, custom CMS, deep discovery + monthly strategy review, custom content briefs, priority queue, 4h SLA + Slack). See session file for full table. |
| 12 | Liability + SLA | **Standard SaaS liability cap** — 12-month fees paid cap, customer warrants property ownership, customer approves all content publishes per approval-gate model, $1M general liability insurance, customer indemnifies on 3rd-party claims from their content. No uptime SLA at launch (best-effort). Premium SLA defers to MVP+90 with first enterprise upsell. |
| 13 | Beachhead motion (customers 1–50) | **Warm network + content + referral incentive** — 1–10: Adam personal LinkedIn + warm Israeli SMB intros + direct DMs to 50 named businesses per vertical. 11–20: "State of AI Search" report drops + 3 vertical blog posts/week. 21–30: free scan link in Adam's LinkedIn + vertical community engagement. 31–50: $500 referral credit for case-study customers. Zero paid acquisition until customer #50 case studies exist. |
| 14 | Engineering sequencing | **Layer onto existing Wave 0/0.5/1/2 plan.** Waves 0 + 0.5 unchanged (hard reset, scaffold, Supabase, Auth, Paddle, Inngest). Wave 1 rescoped: brand-fingerprint + discovery flow, free-scan→discovery-booking, outcomes dashboard v1, approval queue UI. Wave 2 rescoped: deliverables tracking + tier gates, weekly digest generator, held-revenue accounting. **Wave 3 NEW**: publishing integrations matrix (WP/Shopify/Webflow/GBP/Yelp/SendGrid sub-account/schema-via-GTM). CTO + Build-Lead coordinate rescope from session file. |
| 15 | Customer-facing agent fleet | **7 new agents + 4 repurposed + 1 kept.** NEW (CPO writes PRD per): Discovery agent (Wave 1), Brand-brief manager (Wave 1), Approval-gate writer (Wave 2), Digest writer (Wave 2), Customer success agent (Wave 2), Publisher agent (Wave 3), Strategy agent (Wave 3). REPURPOSED: Content/FAQ agent, Schema agent, Citation agent, Visibility tracker. KEPT (de-emphasized): Competitor intelligence. CPO + ai-engineer + Build-Lead dispatch parallel work. |

## Mechanic guardrails (locked with #8)

1. **Activation requirement** to qualify for refund: customer must complete 3-step onboarding (discovery call + property connect + first scan).
2. **Domain + business verification** at signup. Hard ban on re-signups under new emails.
3. **Held-revenue accounting** for the first 60 days. Don't book as revenue until day 61. Cash stays intact if refund fires.
4. **First 100 customers = "Founding Member" cap.** If refund rate ≥25%, tighten next cohort to 30 days. Track refund_rate weekly in audit_log.
5. **One-per-account rule.** Refund-then-resubscribe = no second money-back window. The refund WAS the trial.

## Marketing copy (English + Hebrew)

> EN: "If we don't move your AI search visibility in 60 days, you don't pay. No questions, no phone tree, no contract. Cancel in one click."
> HE: "60 ימים. אם לא הצלחנו לקדם אותך — כסף חזרה, בלי שאלות."

## Open decisions remaining

All 15 decisions locked above. C-suite dispatch complete (CPO + CMO + CBO + CTO + CPO follow-up). 5 sub-decisions surfaced by leads ratified by CEO 2026-05-24 (see DECISIONS.md 2026-05-24 entry):

1. ✅ North star = month-3 retention rate
2. ✅ Wave 3 sequenced after Wave 2 ships to customer #1
3. ✅ Strategy agent on Opus 4.7
4. ✅ YMYL always-human approval gate
5. ✅ Publishing actions = Irreversible QA tier

## Cross-team dispatch outcomes (2026-05-23 evening)

| Lead | Files edited | Files created | Session file | Status |
|---|---|---|---|---|
| **CPO** | 10 + agent-system-spec (now INDEX) | 7 agent PRDs + session file | `2026-05-23-cpo-agency-pivot-spec-update.md` | ✅ Clean (after 1 follow-up) |
| **CMO** | 11 (incl. USER-INSIGHTS.md) | 3 landing pages + DM templates | `2026-05-23-cmo-agency-pivot-copy-update.md` | ✅ Clean |
| **CBO** | 6 | ToS draft + insurance plan + tier model | `2026-05-23-cbo-agency-pivot-financials.md` | ✅ Clean |
| **CTO** | 11 | Wave 3 brief (449 lines, 10 architectural decisions) | `2026-05-23-cto-agency-pivot-wave-rescope.md` | ✅ Clean (turn limit on synthesis only) |

## Adam-blockers (must-do before customer #1)

1. **Procure $1M GL + $500K-$1M E&O insurance.** Contact Hibub (hibub.co.il). $800-$2,150/yr. 5-10 business days. Full checklist: `docs/business/INSURANCE_PROCUREMENT_PLAN.md`.
2. **Israeli lawyer review** of `docs/legal/TERMS_OF_SERVICE_v1_DRAFT.md` (15-clause v1). Hard once published.
3. **Validate gross margin thesis** (CBO assumed 92.6%). Hold financial projections as planning models until first 10 customers provide API cost logs.
4. **CTO sequencing decision** (A10): Wave 3 sequenced AFTER Wave 2 ships to a paying customer, NOT parallel. Customer #1 onboards on Wave 1+2 only. Flips to parallel if customer #1 books before Wave 2 completes.

## North star changed

Old: free-scan completion. **New: month-3 retention rate** (per CBO decision, validates 60-day money-back guarantee survival).

## Key architectural decisions (CTO)

10 architectural decisions logged in `docs/08-agents_work/sessions/2026-05-23-cto-agency-pivot-wave-rescope.md`. Highlights: brand_fingerprints/approval_queue/publishing_credentials/deliverables_per_customer_per_month tables; held-revenue accounting via subscriptions.held_until + revenue_events ledger; customer-facing API never returns agent names; publishing actions = Irreversible tier in QA gate.

## Next dispatch (when Adam confirms)

1. CTO → ai-engineer + backend-engineer + database-engineer + security-engineer (Publisher Irreversible review) per Wave 1/2/3 sequencing
2. CMO → Adam reviews 3 vertical landing pages + DM templates BEFORE Adam runs first 50 cold DMs
3. CBO → Adam executes insurance procurement (Hibub contact) + lawyer ToS review
4. CEO → Monitor customer #1 trial; validate gross margin assumptions at month 3

## 2026-05-24 — CEO closeout actions executed

- ✅ PR #84 opened with 5 commits + QA-Lead PASS verdict (Lite tier) + 2 P2 arithmetic fixes applied inline
- ✅ 5 sub-decision ratifications locked in DECISIONS.md 2026-05-24 entry
- ✅ CTO dispatched async to scope 6 infrastructure gaps (booking, voice chat, WP plugin distribution, Resend status, Paddle status, free-scan rate limit)
- 🔵 Awaiting Adam: PR #84 merge approval + insurance procurement + lawyer ToS review + landing-page/DM approval

## Key research findings backing decisions

- Top 3 launch ICP candidates (HIGH-MEDIUM confidence):
  1. B2B SaaS <$5M ARR — 73% buyers use AI; 51% start in AI chatbot vs Google; only 14% have mature AI-visibility strategy
  2. Solo + small law firms — highest digital CPL of any industry ($649–$784); $1K–$3K/mo budget; YMYL trust premium
  3. Single-location dental practices — established habit of paying $800–$1,500/mo for local SEO
- HVAC/plumbers DROPPED from launch ICP — budgets exist but AI-search-driven inbound is unproven for these verticals
- GEO time-to-result reality: 45–90 days for established sites; 90–180 days for low-authority SMBs (most Beamix targets)
- Comparable done-for-you GEO retainers run $2,000–$8,000/mo industry standard; $10K–$25K enterprise. Beamix at $499–$1,499 sits 50–80% below market.

## Research provenance

- Research-Lead async runs 2026-05-23 (4 researchers Q1–Q4 ICP/TTR/pricing/WTP; then 2 researchers competitor-mechanics + empirical-conversion)
- Quicksprout 12% money-back refund rate
- Footbridge Media as closest analog (90-day no-questions, $249/mo)
- Jay Abraham risk-reversal specificity principle
- Kahneman/Tversky 2x loss aversion asymmetry
- Profound, Athena HQ, Otterly, Mintlify, SearchBerg, Scorpion, HubSpot, Ziffity competitor mechanic table
