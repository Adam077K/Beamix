# Beamix Pricing v2 — Board-Approved (2026-04-15, updated 2026-04-18)

**STATUS: APPROVED**
**Supersedes:** MEMORY.md pricing block (Starter $49 / Pro $149 / Business $349)
**Updated 2026-04-18:** Build tier reduced from $199 to $189 (annual $151). See 15-EXPERT-AUDIT.md.

---

## Tier Comparison

| | **Discover** | **Build** | **Scale** |
|---|---|---|---|
| **Monthly** | $79/mo | $189/mo | $499/mo |
| **Annual** | $63/mo | $151/mo | $399/mo |
| **Annual savings** | Save $192/yr | Save $456/yr | Save $1,200/yr |
| **Badge** | — | Most Popular | — |
| **Positioning** | "Not sure yet" | Sweet spot | Power users / agencies |

---

## What's in Each Tier

| Feature | Discover | Build | Scale |
|---------|----------|-------|-------|
| **AI Engines scanned** | 3 (ChatGPT, Gemini, Perplexity) | 7 (+ Claude, AI Overviews, Grok, You.com) | 9+ (all) |
| **Scan cadence** | Weekly | Daily | Unlimited / on-demand |
| **Tracked queries** | 15 | 50 | 200 |
| **Competitors tracked** | 3 | 5 | 20 |
| **AI Runs (credits/mo)** | 25 | 90 | 250 |
| **Premium AI Runs/mo** | — | Included | Included |
| **Off-site agents** | Guided only | Full access | Full access |
| **History retention** | 30 days | 6 months | 24 months |
| **Schedule cadence** | Weekly | Daily, Weekly | Daily, Weekly, Monthly |
| **Support** | Email (48h) | Priority email (24h) | Dedicated + onboarding call |
| **Agents** | All 11 MVP-1 agents | All 11 MVP-1 agents | All 12 (incl. Video SEO MVP-2) |

---

## Credit Model (AI Runs)

**Branding:** "AI Runs" — not "credits". Runs feel like work; credits feel like tokens.

### Per-Agent Cost

| Credit Cost | Agents | Daily Cap (Discover/Build/Scale) |
|-------------|--------|----------------------------------|
| **Free (unlimited, daily-capped)** | Schema Generator, FAQ Builder, Off-Site Presence Builder, Performance Tracker | Schema: 20/20/20 · FAQ: 3/5/10 · Off-Site: 3/5/10 · Perf Tracker: unlimited |
| **1 AI Run** | Query Mapper, Freshness Agent, Reddit Presence Planner | — |
| **2 AI Runs** | Content Optimizer, Review Presence Planner, Entity Builder | — |
| **3 AI Runs** | Authority Blog Strategist (Build and Scale only) | — |

### Tier Allocations

| | Discover | Build | Scale |
|---|---|---|---|
| **AI Runs/mo** | 25 | 90 | 250 |
| **Authority Blog cap** | — (not available) | 20 posts/mo max | 40 posts/mo max (hard cap) |
| **Rollover** | 20% of unused (5 max) | 20% of unused (18 max) | 20% of unused (50 max) |

**Blog hard cap rationale:** Uncapped Blog at 3 runs/post would push Scale COGS to 23%+. 40-post cap holds effective COGS to ~17%. Users who need more can buy top-up packs.

---

## Scan Pricing (Separate from Agent Credits)

Scans run on AI engines and consume LLM tokens. Priced per scan, not per query.

| | Discover | Build | Scale |
|---|---|---|---|
| **Cost per scan** | $0.090 | $0.155 | $0.205 |
| **Engines per scan** | 3 | 7 | 9+ |
| **Cost driver** | Perplexity Sonar x3 queries | + 4 engines at higher per-call cost | All engines, more queries per engine |

---

## LLM COGS per Tier

Modeled at 80th-percentile usage (not average, not worst case).

| | Discover | Build | Scale |
|---|---|---|---|
| **Scan COGS** | ~$1.40/mo | ~$4.80/mo | ~$8.20/mo |
| **Agent COGS** | ~$3.40/mo | ~$27.20/mo | ~$106.80/mo (capped) |
| **Total COGS** | **~$4.80/mo** | **~$32.00/mo** | **~$115.00/mo** |
| **Revenue** | $79/mo | $189/mo | $499/mo |
| **Gross margin** | **~94%** | **~83%** | **~77%** (pre-Blog cap) |
| **Gross margin (Blog cap applied)** | — | — | **~83%** |

**Healthy SaaS benchmark:** 70-80% gross margin. All tiers exceed floor. Scale lands at 83% after Blog cap — strong.

---

## Margin Scenarios

| Scenario | Discover | Build | Scale |
|----------|----------|-------|-------|
| Light user (40th pct) | 97% | 92% | 91% |
| Typical user (80th pct) | 94% | 83% | 83% |
| Heavy user (95th pct) | 88% | 75% | 74% |
| Worst case (100% Blog, no cap) | 85% | 71% | 69% |

Blog cap activates before worst case. Scale floor is 74%+ under any realistic scenario.

---

## Yael Test — One-Sentence ROI per Tier

**Discover ($79/mo):** "I spend $79 to know exactly why my business doesn't show up in ChatGPT — worth it just for the answer."

**Build ($189/mo):** "My AI agents fixed 3 pages last month. I can't afford a GEO agency, but I can afford $189 that does the same work."

**Scale ($499/mo):** "At $499 I'm replacing $3,000+/mo in agency fees and tracking 20 competitors across 9 AI engines."

---

## Anchor Strategy

- **Scale ($499)** anchors the page. Shows full capability ceiling. Makes Build look accessible.
- **Build ($189)** is highlighted "Most Popular" — drives conversion. Best margin tier.
- **Discover ($79)** exists for the "not sure yet" buyer. Low friction entry. Upsell surface.

**Left-to-right order:** Discover → Build (highlighted) → Scale

---

## Annual Toggle

- Default: **ON** (annual pricing shown first)
- Toggle label: "Annual — save 20%"
- Monthly toggle available but not promoted
- Annual discount: exactly 20% (round numbers: $63/$151/$399)

---

## What NOT to Include at Discover (Upgrade Gates)

These features are intentionally withheld to force Build upgrade:

| Gate | Why It Drives Upgrade |
|------|-----------------------|
| Daily scan cadence | Weekly scans feel slow once user sees daily value |
| >3 competitors tracked | Every user wants to track 5+ |
| >15 tracked queries | 15 fills up in week 1 for any real SMB |
| Authority Blog Strategist | Not available on Discover — 3 AI Runs/post; requires Build upgrade |
| 7-engine scan | ChatGPT+Gemini+Perplexity leaves Claude/Grok/AIOverviews gap visible |
| >30-day history | Can't show trend lines without Build |

**Rule:** Discover users must feel they're getting real value — not a crippled demo. Gates should frustrate growth, not basic usage.

---

## Pricing Page Composition

**Left-to-right order:** Discover | **Build** (highlighted, "Most Popular" badge) | Scale

**Social proof placement:**
- Above the table: aggregate stat ("Join 1,200+ SMBs improving their AI visibility")
- Below Build card: 1-2 testimonials from Build users
- Below Scale card: logo strip of known brands (if available)

**Badge placement:**
- Build: "Most Popular" (blue #3370FF pill)
- Scale: "Best Value" (optional — only if annual savings math is compelling in context)
- Discover: no badge

**FAQ section (below cards):** 6 questions covering: what's an AI Run, cancel anytime, free trial, what engines are included, refund policy, can I switch plans.

---

## Free Scan Economics

| Metric | Value |
|--------|-------|
| Cost per free scan | ~$0.045 (3 engines × Perplexity Sonar tier) |
| LTV at 5% churn (avg) | ~$1,200 Discover / ~$3,400 Build |
| Break-even conversion rate | **0.064%** |
| Realistic conversion rate | 1-5% (industry benchmark for freemium-to-paid) |
| Headroom vs break-even | **15x – 78x** |

Free scans are a near-zero-risk acquisition channel. A 1% conversion rate delivers ~15x headroom over COGS. Run them freely.

---

## Refund Policy

- **14-day money-back guarantee**, no questions asked
- Displayed prominently on pricing page and checkout
- No credit cap fine print — full refund on unused AI Runs
- Monitor: if refund rate exceeds 3%/mo, trigger exit survey + product review
- Refund policy removes risk objection at Discover; materially improves Build conversion

---

## Competitor Limits by Tier

| Tier | Competitors Tracked |
|------|---------------------|
| Discover | 3 |
| Build | 5 |
| Scale | 20 |

Competitors tracked = businesses scanned head-to-head per query. Competitor data feeds the Query Mapper and Performance Tracker agents.
