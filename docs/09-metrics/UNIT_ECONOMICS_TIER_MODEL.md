# Unit Economics — Per-Tier Structured Model

*Created 2026-05-23 — agency pivot*

> This file is the detailed quantitative model. The summary narrative lives in `docs/09-metrics/UNIT_ECONOMICS.md`.
> All numbers are labeled: (fact) = verified primary source, (assumed) = no supporting data — validate with cohort data.

---

## Model inputs

| Input | Value | Label |
|-------|-------|-------|
| Claude Sonnet 4.6 input cost | $3/M tokens | fact — Anthropic pricing 2026-05-23 |
| Claude Sonnet 4.6 output cost | $15/M tokens | fact — Anthropic pricing 2026-05-23 |
| Effective blended token rate (1:1 in:out mix) | $9/M tokens | assumed — ratio varies by task |
| Paddle fee | 5% + $0.50/transaction | fact — Paddle pricing page 2026-05-23 |
| Inngest free tier | 50K steps/month | fact — Inngest pricing page (see DECISIONS.md 2026-05-08 correction: Pro = $75/mo) |
| Inngest Pro threshold | ~5 paying customers | assumed — Inngest free-tier strategy per MEMORY.md |
| Inngest Pro cost per customer at 10 customers | $75/10 = $7.50/mo | assumed |
| Support labor fully-loaded rate | $30/hr | assumed — contractor rate estimate |
| Refund rate central case | 12% | fact — Quicksprout empirical benchmark (research 2026-05-23, tasks/a4684aa23fdeb01f7) |
| Refund rate tail risk | 20% | assumed — Footbridge Media 90-day analog |

---

## Per-tier model

### Tier 1: Starter ($499/mo)

**Deliverable matrix (locked decision #11, 2026-05-23):**
- 1 location, 3 engines tracked
- 25 prompts/engine/month
- 4 schema pushes/month
- 2 FAQs/month
- 5 citations/month
- Publishing integrations: WordPress, Webflow, Shopify
- Weekly digest (4/month)
- SLA: 48 hours

**Monthly COGS breakdown:**

| Line item | Calculation | Cost | Label |
|-----------|------------|------|-------|
| Schema (4 × 5K tokens) | 4 × 5,000 × $9/M | $0.18 | assumed |
| FAQs (2 × 10K tokens) | 2 × 10,000 × $9/M | $0.18 | assumed |
| Citations (5 × 1.5K tokens) | 5 × 1,500 × $9/M | $0.07 | assumed |
| Prompt tracking (25 × 3 = 75 prompts, 3 batches × 12.5K) | 3 × 12,500 × $9/M | $0.34 | assumed |
| Weekly digest (4 × 10K tokens) | 4 × 10,000 × $9/M | $0.36 | assumed |
| Brand brief amortized (25K tokens ÷ 12 months) | 2,083 × $9/M | $0.02 | assumed |
| **Subtotal LLM** | | **$1.15** | assumed |
| Inngest (Pro pro-rated at 10 customers) | $75/10 | $7.50 | assumed |
| Supabase (free tier, negligible) | $0 | $0.00 | assumed |
| Vercel (negligible) | $0.50 | $0.50 | assumed |
| Support labor (15 min × $30/hr) | 0.25h × $30 | $7.50 | assumed |
| Paddle fee (5% × $499 + $0.50) | $25.45 | $25.45 | fact |
| **Total COGS** | | **$42.10** | |
| **Gross profit** | $499 - $42.10 | **$456.90** | |
| **Gross margin** | $456.90 / $499 | **91.6%** | |

**60-day refund exposure:**
- 2 months revenue received: $998
- 2 months COGS sunk: $84.20
- **Net exposure if refund: $1,082.20** (assumed)

**Break-even refund rate:** 1 / (1 + gross_margin) = 1 / 1.916 = 52.2% (assumed)

**LTV model (24-month horizon):**

| Month-6 retention | Monthly churn implied | 24-month LTV | CAC ceiling at LTV:CAC = 3 |
|------------------|----------------------|--------------|--------------------------|
| 90% | ~1.74%/mo | $499 / 0.0174 = $28,678 (theoretical) | $9,559 (assumed) |
| 80% | ~3.56%/mo | $499 / 0.0356 = $14,017 (theoretical) | $4,672 (assumed) |
| 70% | ~5.51%/mo | $499 / 0.0551 = $9,056 (theoretical) | $3,019 (assumed) |

**24-month capped LTV (more conservative):**

| Month-6 retention | 24-month capped LTV |
|------------------|---------------------|
| 90% | $499 × 24 × (0.9)^4 = $7,862 (assumed) |
| 80% | $499 × 24 × (0.8)^4 = $4,915 (assumed) |
| 70% | $499 × 24 × (0.7)^4 = $2,877 (assumed) |

---

### Tier 2: Growth ($999/mo)

**Deliverable matrix:**
- 3 locations, 5 engines tracked
- 75 prompts/engine/month
- 12 schema pushes/month
- 6 FAQs/month
- 15 citations/month
- Publishing: + Ghost, Squarespace paste, Wix paste
- SLA: 24 hours

**Monthly COGS breakdown:**

| Line item | Calculation | Cost | Label |
|-----------|------------|------|-------|
| Schema (12 × 5K tokens) | 12 × 5,000 × $9/M | $0.54 | assumed |
| FAQs (6 × 10K tokens) | 6 × 10,000 × $9/M | $0.54 | assumed |
| Citations (15 × 1.5K tokens) | 15 × 1,500 × $9/M | $0.20 | assumed |
| Prompt tracking (75 × 5 = 375 prompts, 15 batches) | 15 × 12,500 × $9/M | $1.69 | assumed |
| Weekly digest | $0.36 | $0.36 | assumed |
| Brand brief amortized | $0.02 | $0.02 | assumed |
| **Subtotal LLM** | | **$3.35** | assumed |
| Inngest | $7.50 | $7.50 | assumed |
| Supabase | $0.50 | $0.50 | assumed |
| Support labor (25 min × $30/hr) | 0.42h × $30 | $12.50 | assumed |
| Paddle fee (5% × $999 + $0.50) | $50.45 | $50.45 | fact |
| **Total COGS** | | **$74.30** | |
| **Gross profit** | $999 - $74.30 | **$924.70** | |
| **Gross margin** | $924.70 / $999 | **92.6%** | |

**60-day refund exposure: $2,146.60** (2 × $999 + 2 × $74.30 COGS) (assumed)

**24-month capped LTV:**

| Month-6 retention | 24-month capped LTV | CAC ceiling at 3:1 |
|------------------|---------------------|--------------------|
| 90% | $999 × 24 × 0.6561 = $15,731 (assumed) | $5,244 (assumed) |
| 80% | $999 × 24 × 0.4096 = $9,826 (assumed) | $3,275 (assumed) |
| 70% | $999 × 24 × 0.2401 = $5,754 (assumed) | $1,918 (assumed) |

---

### Tier 3: Scale ($1,499/mo)

**Deliverable matrix:**
- Unlimited locations, 7 engines tracked
- 200 prompts/engine/month
- 24 schema pushes/month
- 10 FAQs/month
- 30 citations/month
- 10 outreach emails/month
- Publishing: + GBP, Yelp, Apple Maps, schema via GTM
- Discovery call included
- SLA: 12 hours

**Monthly COGS breakdown:**

| Line item | Calculation | Cost | Label |
|-----------|------------|------|-------|
| Schema (24 × 5K tokens) | $1.08 | $1.08 | assumed |
| FAQs (10 × 10K tokens) | $0.90 | $0.90 | assumed |
| Citations (30 × 1.5K) | $0.41 | $0.41 | assumed |
| Outreach emails (10 × 7K tokens) | 10 × 7,000 × $9/M | $0.63 | assumed |
| Prompt tracking (200 × 7 = 1400 prompts, 56 batches) | 56 × 12,500 × $9/M | $6.30 | assumed |
| Weekly digest | $0.36 | $0.36 | assumed |
| Brand brief amortized | $0.02 | $0.02 | assumed |
| **Subtotal LLM** | | **$9.70** | assumed |
| Inngest | $7.50 | $7.50 | assumed |
| Supabase | $1.00 | $1.00 | assumed |
| Support labor (45 min × $30/hr) | 0.75h × $30 | $22.50 | assumed |
| Discovery call (one-time, amortized 6 months) | 1hr × $30 / 6 | $5.00 | assumed |
| Paddle fee (5% × $1,499 + $0.50) | $75.45 | $75.45 | fact |
| **Total COGS** | | **$121.15** | |
| **Gross profit** | $1,499 - $121.15 | **$1,377.85** | |
| **Gross margin** | $1,377.85 / $1,499 | **91.9%** | |

**60-day refund exposure: $3,240.30** (assumed)

**24-month capped LTV:**

| Month-6 retention | 24-month capped LTV | CAC ceiling at 3:1 |
|------------------|---------------------|--------------------|
| 90% | $1,499 × 24 × 0.6561 = $23,591 (assumed) | $7,864 (assumed) |
| 80% | $1,499 × 24 × 0.4096 = $14,736 (assumed) | $4,912 (assumed) |
| 70% | $1,499 × 24 × 0.2401 = $8,630 (assumed) | $2,877 (assumed) |

---

### Tier 4: Professional ($2,499/mo)

**Deliverable matrix:**
- Unlimited everything, 7+ custom engines
- 500 prompts/engine/month, unlimited schema
- 16 FAQs, unlimited citations, 30 outreach emails
- Custom CMS support, custom content briefs
- Deep discovery + monthly strategy review (Adam-led through customer #50; agent-led after)
- Priority queue, Slack channel, 4h SLA

**Monthly COGS breakdown:**

| Line item | Calculation | Cost | Label |
|-----------|------------|------|-------|
| LLM (high volume — 500 prompts × 7 engines + all deliverables) | ~$25/mo estimated | $25.00 | assumed |
| Monthly strategy review (1hr × $30, Adam through #50) | $30.00 | $30.00 | assumed |
| Slack setup + priority queue management | 60 min/mo × $30 | $30.00 | assumed |
| Custom content briefs (additional 30 min/brief × 2 briefs) | $30.00 | $30.00 | assumed |
| Inngest | $7.50 | $7.50 | assumed |
| Supabase | $1.50 | $1.50 | assumed |
| Paddle fee (5% × $2,499 + $0.50) | $125.45 | $125.45 | fact |
| **Total COGS** | | **$249.45** | |
| **Gross profit** | $2,499 - $249.45 | **$2,249.55** | |
| **Gross margin** | $2,249.55 / $2,499 | **90.0%** | |

**60-day refund exposure: $5,497.90** (assumed)

**24-month capped LTV:**

| Month-6 retention | 24-month capped LTV | CAC ceiling at 3:1 |
|------------------|---------------------|--------------------|
| 90% | $2,499 × 24 × 0.6561 = $39,322 (assumed) | $13,107 (assumed) |
| 80% | $2,499 × 24 × 0.4096 = $24,553 (assumed) | $8,184 (assumed) |
| 70% | $2,499 × 24 × 0.2401 = $14,381 (assumed) | $4,794 (assumed) |

---

## Founding-100 cohort — worst case exposure

**Assumption:** All 100 customers refund (impossible in practice, but serves as stress-test floor).

| Tier | Count | Per-customer exposure | Total exposure |
|------|-------|----------------------|----------------|
| Starter (50 customers) | 50 | $1,082.20 | $54,110 |
| Growth (30 customers) | 30 | $2,146.60 | $64,398 |
| Scale (15 customers) | 15 | $3,240.30 | $48,605 |
| Professional (5 customers) | 5 | $5,497.90 | $27,490 |
| **Total worst case** | **100** | | **$194,603** (assumed) |

**At 12% refund rate (Quicksprout fact):**

| Tier | Refunds expected | Cash at risk |
|------|----------------|-------------|
| Starter | 6 | $6,493 |
| Growth | 3.6 → 4 | $8,586 |
| Scale | 1.8 → 2 | $6,481 |
| Professional | 0.6 → 1 | $5,498 |
| **12% case total** | **13** | **$27,058** (assumed) |

**Cash needed pre-revenue-recognition (day 61):** The COGS outlay before first day-61 revenue event depends on ramp pace. Estimated $5,000-$15,000 COGS exposure before first recognized revenue at 10-20 customer ramp (assumed). This is well within reach without external funding.

---

## Sensitivity tables

### Table 1: Refund rate vs blended gross margin (net of refund cost)

Base mix: 50% Starter / 30% Growth / 15% Scale / 5% Professional.
Blended ARPC: $499×0.5 + $999×0.3 + $1,499×0.15 + $2,499×0.05 = $899.00 (assumed)
Blended gross margin before refunds: 92.6% × $899.00 = $832.47 gross profit per customer.

| Refund rate | Net gross profit per customer (accounts for refund cash outflow) | Net gross margin % |
|-------------|------------------------------------------------------------------|-------------------|
| 5% | $809.60 × 0.95 = $769.12 | 88.0% |
| 12% (central — fact) | $809.60 × 0.88 = $712.45 | 81.5% |
| 20% (tail risk — assumed) | $809.60 × 0.80 = $647.68 | 74.1% |
| 30% (stress test — assumed) | $809.60 × 0.70 = $566.72 | 64.8% |

### Table 2: Customer mix vs blended ARPC

| Mix (Starter/Growth/Scale/Pro) | Blended ARPC |
|-------------------------------|-------------|
| 50/30/15/5 (base — assumed) | $899.00 |
| 60/25/10/5 (starter-heavy) | $796.40 |
| 40/35/20/5 (growth-heavy) | $974.20 |
| 30/30/25/15 (enterprise-tilted) | $1,198.70 |

### Table 3: Month-6 retention vs blended LTV (24-month, base mix)

| Month-6 retention | Blended LTV (base mix ARPC $899) |
|------------------|----------------------------------|
| 90% | $899 × 24 × 0.6561 = $14,138 (assumed) |
| 80% | $899 × 24 × 0.4096 = $8,831 (assumed) |
| 70% | $899 × 24 × 0.2401 = $5,177 (assumed) |
| 60% | $899 × 24 × 0.1296 = $2,797 (assumed) |

---

## Summary per-tier scorecard

| Tier | Price | Total COGS | Gross profit | Gross margin | 60-day refund exposure | Break-even refund rate | CAC ceiling (80% ret.) |
|------|-------|-----------|-------------|-------------|----------------------|----------------------|----------------------|
| Starter | $499 | $42.10 | $456.90 | 91.6% | $1,082 | 52.2% | $4,672 |
| Growth | $999 | $74.30 | $924.70 | 92.6% | $2,147 | 52.4% | $3,275 |
| Scale | $1,499 | $121.15 | $1,377.85 | 91.9% | $3,240 | 52.2% | $4,912 |
| Professional | $2,499 | $249.45 | $2,249.55 | 90.0% | $5,498 | 50.0% | $8,184 |

**Key finding:** All tiers have break-even refund rates above 50% — the business absorbs refunds up to 50% of customers before cohort gross profit goes negative. The 12% empirical benchmark is well within safe range on all tiers.

---

## Assumptions to validate at month 3

1. LLM token consumption per deliverable (validate via API cost logs)
2. Support labor per customer per month (validate via time-tracking after first 10 customers)
3. Customer mix 50/30/15/5 (validate from actual signup tier distribution)
4. Month-6 retention 80% (validate from first cohort)
5. Inngest step count per customer (validate from Inngest dashboard)

---

*Reversibility: easy — this is a planning model. Update monthly with actual cost data.*
*Requires Adam sign-off before sharing externally (investor materials, board decks).*
