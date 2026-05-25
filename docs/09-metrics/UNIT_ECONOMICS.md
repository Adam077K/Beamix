# Unit Economics — Agency Model

*Updated 2026-05-23 — agency pivot*

> **Supersedes** the redirect stub pointing to PRODUCT_SPECIFICATION.md. Old $79/$189/$499 self-serve economics are archived. This file is the canonical unit economics source for the done-for-you GEO agency model.

---

## Decision this analysis informs

Whether the $499/$999/$1,499/$2,499 pricing holds given COGS structure, 60-day refund exposure, and blended LTV. Decision is open until first 10 customers provide real churn data. All CAC numbers are assumed.

---

## Pricing tiers (locked 2026-05-23)

| Tier | Monthly price | Customer profile |
|------|--------------|-----------------|
| Starter | $499 | 1 location, 3 engines, SMB anchor |
| Growth | $999 | 3 locations, 5 engines, mid-market |
| Scale | $1,499 | Unlimited locations, 7 engines, regional multi-site |
| Professional | $2,499 | Unlimited + custom, monthly strategy review, priority Slack |

---

## COGS model — per customer per month

*All cost lines labeled (fact / est. / assumed). Source: Anthropic pricing page, Inngest pricing page, internal agent architecture.*

### Cost assumptions (explicit)

**Claude Sonnet 4.6 cost:** $3/M input tokens, $15/M output tokens (fact — Anthropic pricing page 2026-05-23).

**Agent run volume per tier per month (assumed — based on tier deliverable matrix locked 2026-05-23):**

| Deliverable | Tokens consumed (est.) | Notes |
|-------------|----------------------|-------|
| Schema generation (4/mo Starter, 12/mo Growth, 24/mo Scale, unlimited pro) | ~3K in + 2K out per schema | (assumed) |
| FAQ content (2/mo Starter, 6/mo Growth, 10/mo Scale, 16/mo Pro) | ~4K in + 6K out per FAQ | (assumed) |
| GEO content pieces (derived from FAQ/schema mix) | ~8K in + 12K out per piece | (assumed) |
| Citation submissions (5/mo Starter, 15/mo Growth, 30/mo Scale, unlimited Pro) | ~1K in + 0.5K out per citation | (assumed) |
| Prompt tracking (25/engine/mo Starter, 75 Growth, 200 Scale, 500 Pro) | ~0.5K in + 1K out per batch of 25 | (assumed) |
| Weekly digest (1/week = 4/mo) | ~6K in + 4K out per digest | (assumed) |
| Discovery + brand brief (one-time but amortized over 12 months) | ~15K in + 10K out / 12 | (assumed) |

### Per-tier COGS calculation

Blended Claude cost rate: $3/M in + $15/M out. For a 1:1 in:out mix, effective rate ≈ $9/M tokens average.

**Starter ($499/mo):**
- Schema: 4 × (3K+2K) tokens × $9/M = 4 × 0.045 = $0.18
- FAQ: 2 × (4K+6K) tokens × $9/M = 2 × 0.09 = $0.18
- Citations: 5 × (1.5K) × $9/M = $0.07
- Prompt tracking (25 prompts × 3 engines = 75): 3 × (12.5K) × $9/M = $0.34
- Weekly digest: 4 × (10K) × $9/M = $0.36
- Brand brief amortized: (25K/12) × $9/M = $0.02
- **Total LLM cost: ~$1.15/mo** (assumed)
- Inngest: free tier (50K steps/mo) covers first 5 customers; at 5+ customers upgrade to Pro ~$75/mo blended across customers. Per-customer Inngest at 10 customers: $7.50/mo (assumed)
- Supabase: free tier to ~500MB; estimated $0 until 50+ customers (assumed)
- Vercel: free tier to $20/mo, negligible per customer (assumed $0.50/customer at 20 customers)
- Support touch (async, Starter = 48h SLA): ~15 min/month × $30/hr loaded = $7.50 (assumed)
- Paddle fee: 5% + $0.50 = $25.45 on $499 (fact — Paddle pricing page 2026-05-23)
- **Total COGS Starter: ~$36.60/mo** (assumed with fact Paddle fee)
- **Gross profit Starter: $499 - $36.60 = $462.40**
- **Gross margin Starter: 92.7%** (assumed — LLM costs dominate only at scale)

**Growth ($999/mo):**
- Schema: 12 × (5K) × $9/M = $0.54
- FAQ: 6 × (10K) × $9/M = $0.54
- Citations: 15 × (1.5K) × $9/M = $0.20
- Prompt tracking (75 prompts × 5 engines = 375): 15 × (12.5K) × $9/M = $1.69
- Weekly digest: 4 × (10K) × $9/M = $0.36
- Brand brief amortized: $0.02
- **Total LLM: ~$3.35/mo** (assumed)
- Inngest Pro pro-rated: $7.50 (assumed)
- Support (24h SLA): ~25 min/month = $12.50 (assumed)
- Paddle fee: 5% + $0.50 = $50.45 (fact)
- **Total COGS Growth: ~$73.80/mo**
- **Gross profit Growth: $925.20**
- **Gross margin Growth: 92.6%**

**Scale ($1,499/mo):**
- Schema: 24 × (5K) × $9/M = $1.08
- FAQ: 10 × (10K) × $9/M = $0.90
- Citations: 30 × (1.5K) × $9/M = $0.41
- Outreach emails: 10 × (3K in + 4K out) × $9/M = $0.63
- Prompt tracking (200 prompts × 7 engines = 1400): 56 × (12.5K) × $9/M = $6.30
- Discovery call + GBP/Yelp/Apple/GTM integrations: ~1hr support = $30 (assumed)
- Weekly digest: $0.36
- Brand brief: $0.02
- **Total LLM: ~$9.70/mo** (assumed)
- Inngest Pro pro-rated: $7.50 (assumed)
- Support (12h SLA, discovery call included): ~45 min/month = $22.50 (assumed)
- Paddle fee: 5% + $0.50 = $75.45 (fact)
- **Total COGS Scale: ~$115.15/mo**
- **Gross profit Scale: $1,383.85**
- **Gross margin Scale: 92.3%**

**Professional ($2,499/mo):**
- LLM (500 prompts × 7+ custom engines, unlimited schema, 16 FAQs, 30 outreach): ~$25/mo (assumed)
- Monthly strategy review (Adam-led through #50, agent-led after): 1hr × $30 loaded = $30 (assumed — Adam time cost, not a direct expense but opportunity cost)
- Slack priority queue + custom content briefs: ~60min support/month = $30 (assumed)
- Inngest Pro pro-rated: $7.50 (assumed)
- Paddle fee: 5% + $0.50 = $125.45 (fact)
- **Total COGS Professional: ~$217.95/mo**
- **Gross profit Professional: $2,281.05**
- **Gross margin Professional: 91.3%**

---

## Blended gross margin at assumed customer mix

Assumed founding-100 mix (assumed — no acquisition data): 50% Starter / 30% Growth / 15% Scale / 5% Professional.

| Tier | Weight | Gross margin | Weighted |
|------|--------|-------------|---------|
| Starter | 50% | 92.7% | 46.4% |
| Growth | 30% | 92.6% | 27.8% |
| Scale | 15% | 92.3% | 13.8% |
| Professional | 5% | 91.3% | 4.6% |
| **Blended** | | | **92.6%** |

**Blended gross margin central case: 92.6%** (assumed — all COGS except Paddle fee are assumed; Paddle fee is fact)

Gross margins this high are typical of LLM-light SaaS businesses at early scale. The main COGS risk is support labor as customer count grows beyond 50.

---

## LTV model — three retention scenarios

Using 24-month payback horizon. Monthly churn modeled as: 1 - (month-6 retention)^(1/6).

| Tier | Price | Month-6 retention 90% | Month-6 retention 80% | Month-6 retention 70% |
|------|-------|----------------------|----------------------|----------------------|
| Starter | $499 | Monthly churn ~1.7%; LTV = $499/0.017 = $29,353 | Churn ~3.5%; LTV = $14,257 | Churn ~5.5%; LTV = $9,073 |
| Growth | $999 | LTV = $58,765 | LTV = $28,543 | LTV = $18,164 |
| Scale | $1,499 | LTV = $88,177 | LTV = $42,829 | LTV = $27,254 |
| Professional | $2,499 | LTV = $147,000 | LTV = $71,400 | LTV = $45,436 |

**Note:** These are theoretical max LTV assuming no expansion revenue. In practice, upsell from Starter → Growth by month 3 (once results show) is a primary growth lever. All LTV numbers are (assumed — no cohort data).

**Practical 24-month LTV caps (more conservative):**

| Tier | 90% retention / 24mo | 80% retention / 24mo | 70% retention / 24mo |
|------|---------------------|---------------------|---------------------|
| Starter | $499 × 24 × 0.90^2 = $9,700 | $499 × 24 × 0.80^2 = $7,676 | $499 × 24 × 0.70^2 = $5,890 |
| Growth | $19,440 | $15,360 | $11,800 |
| Scale | $29,164 | $23,038 | $17,690 |
| Professional | $48,623 | $38,400 | $29,480 |

*(assumed — 24-month capped LTV with geometric decay, no expansion revenue assumed)*

---

## CAC headroom — LTV:CAC = 3 minimum

CAC ceiling = LTV / 3 (minimum healthy ratio for agency model with high service costs).

| Tier | 80% retention LTV (24mo) | CAC ceiling at 3:1 |
|------|--------------------------|-------------------|
| Starter | $7,676 | $2,559 (assumed) |
| Growth | $15,360 | $5,120 (assumed) |
| Scale | $23,038 | $7,679 (assumed) |
| Professional | $38,400 | $12,800 (assumed) |

**Beachhead motion (customers 1-50) has effectively $0 CAC** (warm network, personal LinkedIn, no paid acquisition). CAC headroom is not a near-term constraint. This becomes relevant at customer #51 when paid acquisition begins.

---

## 60-day refund exposure model

**Held-revenue accounting (locked decision #8):** Cash from day 1-60 is held; recognized as revenue on day 61 only after refund window closes.

**Refund mechanics:**
- Central case refund rate: 12% (fact — Quicksprout empirical data, research run tasks/a4684aa23fdeb01f7, 2026-05-23)
- Tail risk refund rate: 20% (assumed — Footbridge Media 90-day analog suggests this ceiling)
- Activation requirement: customer must complete 3-step onboarding to qualify. This filters bad-faith claims.

**Per-customer 60-day exposure (2 months revenue + 2 months COGS sunk):**

| Tier | 2-month cash received | 2-month COGS sunk | Net exposure if refund |
|------|----------------------|------------------|----------------------|
| Starter | $998 | $73.20 | $1,071.20 |
| Growth | $1,998 | $147.60 | $2,145.60 |
| Scale | $2,998 | $230.30 | $3,228.30 |
| Professional | $4,998 | $435.90 | $5,433.90 |

**At 12% refund rate on founding-100 (assumed 50/30/15/5 mix = 50 Starter / 30 Growth / 15 Scale / 5 Professional):**

| Tier | Refund count | Cash at risk |
|------|-------------|-------------|
| Starter (50 × 12%) | 6 | $6,427 |
| Growth (30 × 12%) | 3.6 → 4 | $8,582 |
| Scale (15 × 12%) | 1.8 → 2 | $6,457 |
| Professional (5 × 12%) | 0.6 → 1 | $5,434 |
| **Total 12% case** | **13 refunds** | **$26,900** |

**Worst case: 20% refund rate on all 100 customers:**
- Starter: 10 × $1,071 = $10,710
- Growth: 6 × $2,146 = $12,876
- Scale: 3 × $3,228 = $9,684
- Professional: 1 × $5,434 = $5,434
- **Worst-case total: $38,704** (assumed)

**Break-even refund rate** (at which gross profit = 0 for the cohort):

Since gross margin is ~92%, gross profit per customer in first 2 months = 0.926 × monthly_price × 2.

Break-even is where refund_rate × (2 × price) = (1 - refund_rate) × (2 × price × 0.926) minus per-customer COGS.

Simplified: refund_rate ÷ (1 - refund_rate) = gross_margin → break-even ≈ 1/(1+gross_margin) = 1/1.926 ≈ 52%.

**Break-even refund rate per tier: ~52%** (assumed — derived from gross margin model). The business can absorb refunds up to 52% before cohort gross profit goes negative — well above any empirical benchmark.

---

## Cash needed before first revenue recognition (day 61)

For founding-100 cohort, assuming ramp over 6 months (not all at once):

Month 1: 10 customers × blended $699 ARPC = $6,990 cash in (held)
Month 2: 20 customers × $699 = $13,980 (held)
Month 3: 35 customers × $699 = $24,465 (held + some releasing from M1)
Month 4-6: accelerating…

**Minimum cash needed to cover COGS before day-61 revenue recognition:**
- Month 1 COGS on 10 customers: 10 × $50 blended = $500 (assumed)
- Month 2 COGS on 20 customers: $1,000 (assumed)
- Cumulative COGS outlay before any revenue recognized: ~$3,000-8,000 depending on ramp speed (assumed)

**Cash-positive inflection: day 61 from first customer signup.** The first $499-$2,499 revenue recognition event occurs on day 61. Given $0 CAC and ~$37-218/mo COGS, the business is cash-generative almost immediately once revenue recognition begins.

---

## Sensitivity table

### Refund rate vs blended gross margin

| Refund rate | Effective gross margin (accounting for refund cost) |
|-------------|---------------------------------------------------|
| 5% (optimistic) | 92.6% × 0.95 = 87.97% |
| 12% (central — Quicksprout fact) | 92.6% × 0.88 = 81.49% |
| 20% (tail risk — assumed) | 92.6% × 0.80 = 74.08% |
| 30% (stress test — assumed) | 92.6% × 0.70 = 64.82% |

### Customer mix vs blended ARPC

| Mix scenario | Blended ARPC |
|-------------|-------------|
| 50/30/15/5 (base — assumed) | $499×0.5 + $999×0.3 + $1,499×0.15 + $2,499×0.05 = $874.30 |
| 60/25/10/5 (starter-heavy) | $796.40 |
| 40/35/20/5 (growth-heavy) | $974.20 |
| 30/30/25/15 (enterprise-tilted) | $1,198.70 |

### Month-6 retention vs blended LTV (24-month model, base mix)

| Month-6 retention | Blended LTV (24mo, base mix) |
|-------------------|------------------------------|
| 90% (upside) | $874 × 24 × 0.81 = $16,981 (assumed) |
| 80% (base — assumed) | $874 × 24 × 0.64 = $13,422 (assumed) |
| 70% (downside) | $874 × 24 × 0.49 = $10,278 (assumed) |
| 60% (stress) | $874 × 24 × 0.36 = $7,553 (assumed) |

---

## Assumptions to validate

1. Monthly churn rate — currently assumed from retention scenarios; no cohort data. Validate at month 3 with first 10+ customers.
2. Support labor load — assumed 15-60 min/customer/month. Validate after first 20 customers with time-tracking.
3. LLM token consumption per deliverable — estimated from deliverable matrix; actual API logs will confirm within first month.
4. Customer mix — assumed 50/30/15/5 Starter/Growth/Scale/Professional; no acquisition data to validate.
5. CAC for beachhead cohort — assumed ~$0 for first 50; validate against Adam time cost.

---

*Reversibility: easy — all numbers are assumed pre-revenue. Revise monthly once cohort data exists.*
*Requires Adam sign-off before any public commitment to margin figures.*
