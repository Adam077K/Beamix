# North Star Metric

*Updated 2026-05-23 — agency pivot*

> **Supersedes** the redirect stub pointing to VISION.md. Old north star (free-scan completion rate) is retired. This file is the canonical north star definition for the done-for-you GEO agency model.

---

## Decision this analysis informs

What single metric best predicts Beamix's long-term revenue and customer health, given the pivot to a done-for-you agency model where value delivery takes 45-90 days.

---

## Old north star (retired)

**Free-scan completion rate** — measured whether visitors saw scan results. Appropriate for a self-serve tool where value was immediate. Wrong for an agency model where value is delivered over 60+ days.

---

## New north star: Month-3 Retention Rate

**Definition:** Percentage of activated customers who are still active paying subscribers 3 months after their first invoice.

**Why month-3:**
- GEO time-to-result reality: 45-90 days for established sites (fact — session research 2026-05-23, tasks/a98bc6df7d83e15e2). Month-3 is the first point customers can observe concrete AI visibility improvement.
- 60-day refund window closes on day 61. Month-3 means the customer stayed past the refund window AND through the first results cycle.
- Month-3 retention is the strongest leading indicator of lifetime value in done-for-you services (est. — SaaS cohort research; primary source not verified. Treat as assumed until validated with Beamix cohort data).

**Formula:**
```
Month-3 retention = customers who paid month-4 invoice / customers who paid month-1 invoice
(cohort-based, not monthly snapshot)
```

**Target (assumed — no cohort data):**
- Year 1 target: 80% month-3 retention (base case)
- Watch trigger: below 70% for 2 consecutive cohorts → revisit onboarding, deliverable quality, and time-to-result
- Upside indicator: above 88% → consider pricing power test at next tier pricing review

---

## Supporting metrics (second-order signals)

| Metric | Why it matters | Target |
|--------|---------------|--------|
| Qualified-discovery-to-paid conversion | Measures how well the free-scan → discovery-call → checkout funnel works | >25% of discovery calls convert to paid (assumed) |
| Time to first deliverable approved | Measures onboarding quality and customer trust | <7 days from signup (assumed) |
| Approval queue throughput rate | Customers blocking on approval queues = churn risk | >85% of approval requests actioned within 48h (assumed) |
| Month-6 retention | Lagging confirmation of month-3 signal | >75% (assumed) |
| ARPC expansion (Starter → Growth upgrades) | Measures upsell motion effectiveness | >15% of Starter cohort upgrades by month 6 (assumed) |

---

## What north star does NOT measure (and why)

- **Number of agent runs** — customers do not care about agent runs; they care about AI visibility improvement. Agent runs are an input metric, not an outcome metric.
- **Free scan completion** — top-of-funnel signal, no longer the core value event in an agency model.
- **MRR** — MRR is a financial output, not a health signal. A business can grow MRR while month-3 retention collapses (churn lagging growth).

---

## How to measure

**Source:** Supabase `subscriptions` table. Cohort = all customers with `created_at` in a given month. Month-3 retained = count of those with `status = 'active'` AND `current_period_end > created_at + 90 days`.

**Reporting cadence:** Weekly for first 6 months (small cohorts need observation at each renewal cycle). Monthly thereafter.

**Dashboard location:** `docs/09-metrics/cost-burn-YYYY-MM.md` — add month-3 retention column starting with first cohort.

---

## Sensitivity range

| Scenario | Month-3 retention | Implied annual churn | 24-month LTV at $874 ARPC |
|----------|--------------------|---------------------|--------------------------|
| Upside | 90% | ~13% annual | $16,981 (assumed) |
| Base | 80% | ~27% annual | $13,422 (assumed) |
| Downside | 70% | ~42% annual | $10,278 (assumed) |
| Stress | 60% | ~59% annual | $7,553 (assumed) |

At the base case (80%), unit economics remain strong against an assumed $0 CAC for first 50 customers and sub-$220/mo COGS. The downside scenario (70%) still clears a 3:1 LTV:CAC at any CAC below $3,426. The stress scenario (60%) triggers a board review.

---

*Reversibility: easy — metric definition is a document change. Changing the tracked metric in-product requires one Supabase query update.*
*Requires Adam sign-off before communicating to investors or board.*
