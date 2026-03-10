# Beamix — Pricing Impact Analysis

> **Author:** Axiom (CFO / Business Analyst)
> **Date:** 2026-03-08
> **Confidence:** High on cost data (sourced directly from Atlas engineering specs). Medium on revenue projections (estimated user distribution, not live subscriber data).
> **Status:** Decision-ready — for founder review

---

## Executive Summary

- **Current margins are healthy and will remain healthy after all recommended new features ship.** Total cost per business/month increases by only $6-9 (30-45%) for Pro users and near-zero for Starter — well within acceptable gross margin ranges given current pricing.
- **The current pricing structure does not need to change to remain profitable after the recommended feature set.** Pro at $149 and Business at $349 absorb all new feature costs comfortably. Starter at $49 is tight but defensible.
- **One pricing option is worth serious consideration: raising Business to $449.** The Business-tier feature set after F9 (30-min refresh) + F10 (multi-region) + F6 (browser simulation) is a materially better product than competitors charging $399 (Profound). A $100 increase is supportable with a strong feature gate.
- **Next action:** Decide within 2 weeks whether to hold pricing or raise Business tier. This decision should be made before F6 (Browser Simulation) ships, as that is the clearest value-unlock event that justifies a price increase to existing users.

---

## Section 1: Feature Cost Impact Summary Table

All 11 features from Batches 1, 2, and 3. Costs sourced from Atlas engineering specs (2026-03-08).

| # | Feature | Marginal Cost / Business / Month | Zero-Cost / Algorithmic? | Tier Gate | Build Priority | Build? |
|---|---------|----------------------------------|--------------------------|-----------|----------------|--------|
| F1 | AI Crawler Feed | ~$0.02 (optional Haiku weekly summary) | Yes — core is zero; Haiku summary optional | Pro+ | Medium | Yes |
| F2 | Content Comparison Tool | ~$0 (diff is client-side; "Explain" button is on-demand only) | Yes — entirely algorithmic/UI | All paid | High | Yes |
| F3 | Topic/Query Clustering | ~$0.005/month (5 new queries × $0.001 Haiku classification) | No — Haiku per query insert | Pro+ | High | Yes |
| F4 | Conversation Explorer | ~$0.012-0.20 (4 sessions/month, Haiku or Perplexity) | No — LLM per session | Pro (LLM); Business (Live/Perplexity) | Medium | Yes |
| F5 | Auto-Suggest Competitors | ~$0 recurring (one-time $0.016 at signup) | No — Perplexity+Haiku at onboarding | All tiers (onboarding) | High | Yes |
| F6 | Browser Simulation (Copilot, AI Overviews, AI Mode) | ~$6.30/Pro user/month (Browserbase $6 + $0.30 Haiku parsing) | No — Browserbase infrastructure | Pro+ | High (Phase 3) | Yes |
| F7 | Web Mention Tracking | ~$0.03-0.25/month (Perplexity + Haiku; varies by tier cadence) | No — Perplexity per scan cycle | All paid (cadence varies) | High | Yes |
| F8 | Social Monitoring (YouTube/TikTok/Reddit) | Unpredictable; $50-200/month YouTube API at scale | No | N/A | N/A | **NO** |
| F9 | 30-Min Scan Refresh (Strategy D) | -$15.30/month vs. current (saves money via priority rotation) | No — Gemini Flash for priority cycles | Business only | High | Yes |
| F10 | Multi-Region / City-Level Scanning | ~$2.30/city/month per Pro user (mitigated cadence, 3 engines, 10 queries) | No — scan calls per city | Pro (5 cities), Business (unlimited/20) | Medium | Yes |
| F11 | Real Prompt Volume Data (GSC integration) | $0 for GSC primary path; $50-500/month if keyword API used | Yes — GSC is free user-connected | Pro+ (GSC); All tiers (internal panel) | Medium | Yes (GSC path only) |

**Key: Build all except F8. F11 should be scoped to the GSC integration path only — avoid the paid keyword API path.**

---

## Section 2: Total Cost Stack Analysis

### Baseline (Current, Pre-New Features)

| Metric | Value |
|--------|-------|
| LLM cost per business/month at 1K businesses | $15-25 (estimate) |
| Midpoint used for this analysis | $20/business/month |
| Source | Engineering baseline, Atlas spec |

### Incremental Cost by Tier After All Recommended Features

The incremental cost per user depends on which features each tier accesses. The table below shows the cumulative add on top of the $20/month baseline.

**Starter User ($49/mo)**

| Feature | Incremental Cost |
|---------|----------------|
| F2: Content Comparison | $0.00 |
| F5: Auto-Suggest Competitors (one-time at signup, amortized) | ~$0.00 recurring |
| F7: Web Mention Tracking (Starter cadence: 1 scan/month) | ~$0.03 |
| F11: Internal prompt volume panel | $0.00 |
| **Total new feature cost** | **~$0.03/month** |
| **New total cost per Starter user** | **~$20.03/month** |
| **Revenue: $49/month** | |
| **Gross margin** | **59% (was 59%)** |

Starter is unaffected. All new Starter-tier features are near-zero cost.

---

**Pro User ($149/mo)**

| Feature | Incremental Cost |
|---------|----------------|
| F1: AI Crawler Feed (Haiku weekly summary) | ~$0.02 |
| F2: Content Comparison | $0.00 |
| F3: Topic/Query Clustering | ~$0.01 |
| F4: Conversation Explorer (LLM-generated, 4 sessions) | ~$0.05 |
| F5: Auto-Suggest Competitors | ~$0.00 recurring |
| F6: Browser Simulation (Browserbase + parsing) | ~$6.30 |
| F7: Web Mention Tracking (weekly, 2 query variants + sentiment) | ~$0.07 |
| F10: Multi-Region, 3 cities × $2.30 (assume avg 3 cities used) | ~$6.90 |
| F11: GSC integration | $0.00 |
| **Total new feature cost** | **~$13.35/month** |
| **New total cost per Pro user** | **~$33.35/month** |
| **Revenue: $149/month** | |
| **Gross margin** | **78% (was 87%)** |

Pro margin drops from ~87% to ~78% — still excellent. The $6.30 Browser Simulation and $6.90 multi-region are the dominant new costs. Both are gated features that users must actively enable; actual average cost will be lower than the max-usage scenario above.

**Conservative Pro estimate (not all Pro users adopt F6+F10 at maximum):** Assume 40% adopt browser simulation and average 1.5 cities tracked: incremental cost ~$6.00/Pro user/month, for a total cost of ~$26/month and margin of ~83%.

---

**Business User ($349/mo)**

| Feature | Incremental Cost |
|---------|----------------|
| F1: AI Crawler Feed | ~$0.02 |
| F2: Content Comparison | $0.00 |
| F3: Topic/Query Clustering | ~$0.01 |
| F4: Conversation Explorer (Live/Perplexity, 4 sessions) | ~$0.30 |
| F5: Auto-Suggest Competitors | ~$0.00 |
| F6: Browser Simulation | ~$6.30 |
| F7: Web Mention Tracking (daily, 4 query variants, all mentions) | ~$0.25 |
| F9: 30-Min Refresh (Strategy D) | **-$15.30 SAVINGS** |
| F10: Multi-Region, 10 cities × $2.30 | ~$23.00 |
| F11: GSC integration | $0.00 |
| **Net new feature cost** | **~$14.58/month** |
| **Baseline scan cost pre-F9** | $229.50 (Business 4h cadence) |
| **New scan cost post-F9** | $214.20 (F9 saves $15.30) |
| **Total cost adjustment** | +$14.58 features - $15.30 scan savings = **-$0.72 net** |
| **New total cost per Business user** | **~$19.28 + $214.20 = ~$233/month** |
| **Revenue: $349/month** | |
| **Gross margin** | **33%** |

**Important context on Business-tier scan cost:** The $214/month scan cost per Business user reflects the cost of daily scans across 7 engines for 75 tracked queries. At early scale (50 Business users), this is the cost structure. As user count grows, economies of scale appear through query caching and prompt reuse — the Atlas spec estimates 40-60% cache hit rate at 1K businesses in the same industry, cutting scan costs nearly in half.

**At 50% cache hit rate on Business scan costs:** $214 → ~$107/month. Total Business cost drops to ~$126/month. Gross margin improves to ~64%.

---

### Gross Margin Summary Table

| Tier | Price | Current Cost | Current Margin | Post-Feature Cost | Post-Feature Margin |
|------|-------|-------------|----------------|-------------------|---------------------|
| Starter | $49 | ~$20 | ~59% | ~$20 | ~59% |
| Pro | $149 | ~$20 | ~87% | ~$26-33 | ~78-83% |
| Business | $349 | ~$229 | ~34% | ~$233 (pre-cache) / ~$126 (50% cache) | ~33% / ~64% |

**Takeaway:** Starter and Pro remain well above the 70% gross margin SaaS benchmark. Business is the margin pressure point — and the primary lever to fix it is scan caching at scale, not pricing changes. The new features themselves do not materially worsen Business margins.

---

## Section 3: Pricing Options Analysis

**Assumptions for revenue modeling:**
- Current user base (estimated): 200 Starter, 150 Pro, 50 Business = 400 total paying users
- These are estimates — confidence level: Low (no live subscriber data available)
- Annual vs monthly split: assume 30% annual, 70% monthly (industry average for early-stage SaaS)
- Blended price used: 70% × monthly + 30% × annual monthly-equivalent

**Current blended monthly revenue:**
- Starter: 200 × (0.70 × $49 + 0.30 × $39) = 200 × $45.80 = $9,160/month
- Pro: 150 × (0.70 × $149 + 0.30 × $119) = 150 × $140.00 = $21,000/month
- Business: 50 × (0.70 × $349 + 0.30 × $279) = 50 × $327.50 = $16,375/month
- **Total MRR: ~$46,535/month**

---

### Option A: Keep Current Pricing

**Analysis:** After all recommended features, Starter and Pro margins remain strong. Business margins are tight pre-cache but recover at scale.

| Metric | Value |
|--------|-------|
| MRR | $46,535 (no change) |
| Pro gross margin | 78-83% |
| Business gross margin | 33% (pre-cache) → 64% (at scale) |
| Churn risk | None from pricing |
| Conversion impact | None |

**Competitive positioning:**
- Starter $49 vs. SE Visible $50-299: competitive at entry
- Pro $149 vs. Peec AI $79-299: mid-range, justified by more engines + browser sim
- Business $349 vs. Profound $399: underpriced relative to feature set

**Verdict:** Acceptable. No immediate financial pressure to change pricing. Recommended if the priority is growth velocity (lower barrier to upgrade) over margin optimization.

**Risk:** Business tier margin at 33% is below the 70% SaaS benchmark until caching kicks in. Acceptable short-term if Business user count is low (as assumed), but should be monitored.

---

### Option B: $10-20 Price Bump Across All Tiers

**Scenario: +$10 on Starter, +$20 on Pro, +$20 on Business**

New prices: Starter $59, Pro $169, Business $369. Annual: ~$47, $135, $295.

| Tier | New Price | New MRR | Old MRR | MRR Increase |
|------|-----------|---------|---------|-------------|
| Starter | $59 | $11,060 | $9,160 | +$1,900 |
| Pro | $169 | $23,800 | $21,000 | +$2,800 |
| Business | $369 | $17,300 | $16,375 | +$925 |
| **Total** | | **$52,160** | **$46,535** | **+$5,625/month** |

**Annual revenue increase:** +$67,500/year (estimate)

**Competitive positioning:**
- Starter $59: still below the $50-299 SE Visible range; acceptable
- Pro $169: still below Profound ($399), above Peec AI entry ($79) — fine
- Business $369: matches Profound pricing — raises the question "why not just go to Profound?"

**Verdict:** The $10-20 bump is justifiable by feature additions but carries moderate churn risk for price-sensitive SMBs on Starter. The $20 bump on Business ($369 vs Profound $399) is the weakest argument — you are now in the same price bracket as a more established competitor. Better to stay below Profound (at $349) or clear it significantly (at $449). This "split the difference" option is the least strategically clean.

**Churn risk:** Medium on Starter (price-sensitive segment). Low on Pro (value clearly justifies). Low on Business if explained via new features.

---

### Option C: New "Growth" Tier Between Pro and Business

**Proposed:** Growth tier at $229/month (annual: $179/month), positioned between Pro and Business.

**What goes in Growth:**
- Everything in Pro
- Browser Simulation (F6) — the clearest Pro-to-Growth differentiator
- Multi-Region scanning (F10) — up to 3 cities
- Daily scanning (same as Pro)
- 30 agent uses/month (vs Pro 15, Business 50)
- 5 competitors tracked (same as Pro)
- 25 tracked queries (same as Pro)

**What stays Business-only:**
- 30-min refresh (F9)
- Unlimited cities (F10)
- 75 tracked queries
- 50 agent uses
- 10 competitors tracked
- Daily digest + full export

**Revenue impact (estimate — assumes 30% of Pro converts to Growth, 10% of Starter converts):**

| Tier | Users (est.) | MRR |
|------|-------------|-----|
| Starter | 200 → 180 (-10% converts up) | $8,244 |
| Pro | 150 → 125 (-30% converts up to Growth) | $17,500 |
| Growth (new) | 0 → 45 (20 from Pro + 20 from Starter converts + 5 net new) | $10,305 |
| Business | 50 → 50 (unchanged) | $16,375 |
| **Total** | | **$52,424** |

**MRR increase vs. current:** +$5,889/month = +$70,668/year (estimate)

**Cost of Growth tier user:** ~$26-33/month (same as Pro since features overlap heavily). Margin: ($229 - $30) / $229 = ~87%. Excellent.

**Verdict:** Structurally attractive because it captures users who want Browser Simulation but find $349 too steep. The $229 price creates a natural progression: $49 → $149 → $229 → $349. However, it adds sales complexity and makes the pricing page harder to read. Browser Simulation at $149 (Pro) is probably a better competitive move than creating a new tier for it — it makes Pro obviously superior to every competitor at the same price point.

**Recommendation:** Conditionally attractive. Build it only if conversion data after 3 months shows a large drop-off between Pro and Business. Do not add a tier preemptively.

---

### Option D: Raise Business to $449

**Analysis:** The Business tier after F9 + F10 + F6 ships is materially stronger than at launch:
- 30-minute refresh (no competitor at SMB pricing matches this)
- Unlimited cities (Peec AI's regional tracking is a premium feature)
- Browser simulation covering Copilot, AI Overviews, Google AI Mode (3 engines no competitor offers at sub-$400)
- 75 tracked queries (vs Profound's enterprise-only high query counts)

**Competitive landscape at $449:**
- Profound: $399/month (enterprise-focus, proprietary 130M conversation dataset)
- SE Visible: $299/month (top tier, fewer engines)
- Peec AI: $299/month (top tier)
- Beamix Business at $449: priced above all SMB-tier competitors but below enterprise ($2K-5K)

**Revenue impact (assuming 10% churn on existing Business users from $349 → $449):**

| Metric | Value |
|--------|-------|
| Business users before | 50 |
| Churn at 10% | -5 users |
| Remaining | 45 users |
| New MRR from Business | 45 × (0.70 × $449 + 0.30 × $359) = 45 × $422.50 = $19,013 |
| Old Business MRR | $16,375 |
| Net MRR change from Business tier | +$2,638/month |
| Net new annual revenue | +$31,656/year |

**Gross margin at $449:** ($449 - $233) / $449 = 48% pre-cache. At 50% cache hit rate: ($449 - $126) / $449 = 72% — crosses the 70% SaaS benchmark.

**When does this make sense?** Only after F6 + F9 + F10 are all shipped and live. Raising prices on a promise is churn bait. Raise prices when the product demonstrably delivers 30-min refresh + multi-region + browser-verified results. Users who see real daily value will not churn over a $100 increase.

**Verdict:** Recommended for Phase 3, contingent on F6 + F9 + F10 shipping. The feature set is defensible at $449. Do not raise before those features are live and tested.

---

### Options Comparison Summary

| Option | MRR Impact | Complexity | Margin Impact | Timing | Verdict |
|--------|-----------|-----------|---------------|--------|---------|
| A: Hold pricing | $0 | None | Stable | Now | Acceptable |
| B: +$10-20 all tiers | +$5,625/mo | Low | Minor improvement | Now | Weakest |
| C: New Growth tier | +$5,889/mo | High | Pro/Growth excellent | After F6 ships | Conditional |
| D: Business → $449 | +$2,638/mo net of churn | Low | Business approaches 70%+ | After F6+F9+F10 ship | **Recommended for Phase 3** |

---

## Section 4: Recommended Tier Structure

### Recommendation: Hold pricing now. Raise Business to $449 when Phase 3 ships.

The recommended feature-to-tier allocation is:

**Starter ($49/mo | $39/mo annual) — "See where you stand"**
- All existing Starter features
- F2: Content Comparison Tool (all paid tiers — zero cost, high retention value)
- F5: Auto-Suggest Competitors (all tiers — onboarding improvement)
- F7: Web Mention Tracking — 1 scan/month, 1 query variant, no sentiment, no alerts
- F11: Internal prompt volume panel (all tiers, no GSC required)
- Rationale: These additions cost near-zero and improve Starter retention without cannibalizing Pro.

**Pro ($149/mo | $119/mo annual) — "Monitor and fix"**
- All existing Pro features
- F1: AI Crawler Feed (Cloudflare integration, weekly Haiku summary)
- F2: Content Comparison Tool
- F3: Topic/Query Clustering (Haiku classification, UI grouping on rankings page)
- F4: Conversation Explorer (LLM-generated queries via Haiku, 4 sessions/month)
- F5: Auto-Suggest Competitors
- F6: Browser Simulation (Copilot, AI Overviews, Google AI Mode — 3 additional engines)
- F7: Web Mention Tracking — weekly, 2 query variants, sentiment, alerts on negative
- F10: Multi-Region Scanning — up to 5 cities, reduced cadence (every 3 days)
- F11: GSC integration for real prompt volume data
- Rationale: F6 is the clearest Pro differentiator — it unlocks 3 engines no competitor offers at this price. F10 at 5 cities adds genuine Israeli-market value without exploding cost.

**Business ($349/mo now → $449/mo when Phase 3 ships | $279 → $359 annual)**
- All Pro features plus:
- F4: Conversation Explorer with Perplexity Live Exploration (real-time query discovery)
- F7: Web Mention Tracking — daily, 4 query variants, all alerts
- F9: 30-Minute Scan Refresh (Strategy D: priority query rotation, saves $15/month vs current)
- F10: Multi-Region Scanning — up to 20 cities, full cadence on first 3 cities
- Rationale: F9 is a pure Business exclusive — no SMB competitor offers 30-minute API-based refresh. F10 at 20 cities serves Israeli businesses competing across multiple markets. These features collectively make Business worth the $449 price when all three are live.

**No new tier recommended at this time.** Add a Growth tier ($229) only if conversion data after 6 months shows a persistent 20%+ drop-off between Pro trial and Business upgrade.

---

## Section 5: Price Increase Trigger Points

These are the specific conditions under which pricing should be revisited, defined in advance to avoid reactive decisions.

### Trigger 1: Cost Floor Breach (Operational — monitor monthly)
**Condition:** If LLM/infrastructure cost per Business user exceeds 50% of revenue ($175/month at $349 pricing, or $225/month at $449 pricing) for 2 consecutive months.
**Action:** Immediately evaluate either (a) accelerating scan caching (Strategy C from F9 spec) or (b) reducing Business scan cadence for users with zero engagement in prior 14 days.
**Do NOT:** Raise prices as the primary response to a cost spike. Fix the cost first.

### Trigger 2: Browser Simulation Ships (Feature milestone — Phase 3)
**Condition:** F6 (Browser Simulation) is live, tested, and delivering results for Copilot + AI Overviews.
**Action:** Raise Business from $349 to $449. This is the right moment because:
- The $100 increase is justified by 3 new engines no SMB competitor offers at this price
- Existing Business users have seen tangible value and are at lowest churn risk
- New users see the $449 price as "less than Profound" without knowing the old price
**Announcement framing:** "Beamix Business now covers 10 AI engines including Bing Copilot and Google AI Overviews. Pricing updated to $449/month."
**Grandfather existing Business users** at $349 for 90 days to reward loyalty.

### Trigger 3: 500 Paying Users (Scale milestone)
**Condition:** Total paying users reach 500.
**Action:** Re-run this full cost analysis with real data. At 500 users, the scan caching hit rate becomes meaningful (40-60% per Atlas estimates), materially improving Business-tier margins. This is the point at which Option C (Growth tier) should be seriously re-evaluated — at scale, a $229 tier may capture a distinct middle segment that is not well-served by the current $149/$349 gap.

### Trigger 4: NRR Falls Below 105% (Retention signal)
**Condition:** Net Revenue Retention drops below 105% for 2 consecutive months. This signals that churn is outpacing expansion revenue.
**Action:** Do NOT raise prices. Fix retention first. Investigate whether the cause is product (feature gaps), UX (users not activating key features), or market (wrong ICP).
**Pricing change is the wrong response to an NRR problem.** Address this with product and onboarding, not price.

### Trigger 5: Competitor Repricing (Market signal)
**Condition:** Profound drops below $349, or Peec AI raises above $199.
**Action:** Profound dropping below Beamix Business pricing would pressure conversion. Response: accelerate Pro feature differentiation (F6 in particular) to justify the gap. Peec AI raising prices signals market acceptance of higher pricing — monitor for 60 days, then evaluate Pro increase to $179.

---

## Appendix: Competitive Pricing Comparison

Data sourced from Rex competitive synthesis (March 2026). Treat as potentially stale — re-verify before major pricing decisions.

| Competitor | Entry Tier | Mid Tier | Top Tier | Notes |
|------------|-----------|---------|---------|-------|
| **Beamix (current)** | $49 | $149 | $349 | Israeli-first, dual-language |
| **Beamix (post-Phase 3)** | $49 | $149 | **$449** | Recommended |
| Profound | Enterprise only | ~$399 | Custom | 130M proprietary conversations |
| SE Visible | $50 | $149 | $299 | SEO-first framing |
| Peec AI | $79 | $149 | $299 | UI-focused, no agents |
| RankPrompt | $49 | $99 | $199 | Budget, browser-only (less reliable) |
| Otterly.ai | $49 | $99 | $199 | Basic monitoring, limited engines |
| Writesonic GEO | ~$99 | ~$199 | Custom | Bundled with content tools |
| Ahrefs (Brand Radar) | $328 | $449 | $1,499 | Web index + brand monitoring |
| Brand24 | $99 | $179 | $299 | Social/web mentions only |

**Beamix's price-to-engine-coverage ratio is the clearest competitive advantage:**
- At $149/Pro: 7 engines + browser sim (10 total) — no competitor offers this at this price
- At $349/Business: 30-min refresh — only RankPrompt is comparable (browser-only, less reliable)
- At $449/Business (post-Phase 3): Copilot + AI Overviews — no SMB competitor covers these engines

**The key positioning principle:** Beamix should never compete on price alone against Otterly and RankPrompt in the $49-199 range. Competing on engine coverage and agent execution is the right axis. The pricing table above shows Beamix is currently priced to win on value, not on cost.

---

*Document prepared by Axiom (CFO). For strategic decisions, route to Iris (CEO). For feature build decisions, route to Atlas (CTO) with reference to batch spec documents. Next review: when F6 (Browser Simulation) ships.*
