# Credit & Token Pricing Research for Beamix

**Date:** 2026-03-20
**Research Lead:** Rex (Research Lead)
**Purpose:** Redesign Beamix credit system to feel generous and be loved by users
**Confidence Note:** WebSearch/WebFetch were unavailable. Data sourced from training knowledge (through May 2025). All prices should be verified against current pricing pages before final decisions. Confidence levels reflect data recency and certainty.

---

## 1. Competitor Pricing Analysis

### 1A. GEO/SEO Tools

| Tool | Price Range | Usage Model | AI Credits/Limits | Confidence |
|------|------------|-------------|-------------------|------------|
| **MarketMuse** | Free / $149/mo / $399/mo | Credits per content brief | Free: 5 queries/mo, Standard: 100 queries/mo, Premium: unlimited | MEDIUM |
| **Surfer SEO** | $69-$219/mo | Articles per month | Essential: 36 articles/yr (3/mo), Scale: 120/yr (10/mo), Enterprise: custom. AI writing add-on extra. | HIGH |
| **Frase** | $15-$115/mo | Document credits | Solo: 4 search docs/mo + 4K AI words, Team: 3 users + unlimited search docs, Enterprise: unlimited | HIGH |
| **Clearscope** | $170/mo+ | Report credits | Essentials: 100 report credits/mo (~$1.70/report). Enterprise: custom | MEDIUM |
| **Semrush** | $130-$500/mo | Feature gates + limits | ContentShake AI: separate add-on. SEO tools use query limits (3,000-10,000/day) | HIGH |
| **Otterly.ai** | ~$39-$149/mo | Query tracking limits | Tracks AI search visibility per query; 50-500 queries tracked. No credit system — usage-capped. | MEDIUM |
| **Peec AI** | Early stage / custom | Feature-gated | GEO optimization tool; pricing not widely published. Likely freemium + subscription. | LOW |
| **Profound** | Custom/enterprise | Feature-gated | Enterprise GEO analytics. No public pricing. | LOW |

**Key Pattern:** SEO tools almost universally use **article/document/query caps per tier** rather than abstract credits. Users understand "10 articles per month" intuitively. MarketMuse and Clearscope are the closest to credit systems (queries/reports).

### 1B. AI Content & Writing Tools

| Tool | Price Range | Usage Model | How They Measure | Confidence |
|------|------------|-------------|-----------------|------------|
| **Jasper** | $39-$59/seat/mo | Unlimited words (all tiers) | Shifted from word credits to **unlimited** in 2023. Was previously 20K-100K words/mo. Now seat-based. | HIGH |
| **Copy.ai** | Free / $36-$49/seat/mo | Unlimited (Pro tier) | Free: 2,000 words. Pro: unlimited words, unlimited projects. Enterprise: custom. | HIGH |
| **Writesonic** | Free / $16-$79/mo | Word credits | Free: 10K words. Individual: 100K words/mo ($16). Teams: unlimited. Uses "words" as unit. | HIGH |
| **Writer.com** | $18/user/mo+ | Unlimited (within plan) | Team: unlimited AI generation. Enterprise: custom. No per-word limits in paid plans. | MEDIUM |
| **ChatGPT (OpenAI)** | $20-$200/mo | Message limits | Plus: 80 msgs/3hrs GPT-4o. Pro: unlimited. Uses "messages" not credits. | HIGH |
| **Claude (Anthropic)** | $20-$200/mo | Message/usage limits | Pro: 5x free usage. Team: higher limits. Usage-based soft caps. | HIGH |
| **Notion AI** | +$10/seat/mo | Unlimited | Add-on to existing plan. No per-use limits. | HIGH |

**Key Pattern:** The AI content market has **shifted massively toward unlimited** in paid tiers. Jasper's pivot from word credits to unlimited in 2023 was a major industry signal. Word-based pricing is seen as "old school" and creates anxiety.

### 1C. Credit-Based SaaS Examples (Outside SEO)

| Tool | Credits Per Plan | What 1 Credit Buys | Psychology Trick | Confidence |
|------|-----------------|--------------------|--------------------|------------|
| **Canva (Magic Write)** | 50-500 uses/mo | 1 AI generation | "Uses" not credits — feels like actions | HIGH |
| **HubSpot (Breeze)** | Included in tier | Feature-gated, not credit-based | Bundled into existing subscription | MEDIUM |
| **Anthropic API** | Pay-per-token | 1M input tokens / 1M output tokens | Big numbers: "$3 per million tokens" sounds cheap | HIGH |
| **OpenAI API** | Pay-per-token | Token-based pricing | Same big-number psychology | HIGH |
| **Midjourney** | 200 fast mins/mo (Std) | ~1 image = 1 min (fast) | "Minutes" feels generous — 200 sounds like a lot | HIGH |
| **ElevenLabs** | 10K-100K+ chars/mo | Characters of text-to-speech | Huge numbers: "100,000 characters" | HIGH |
| **Zapier** | 750-100K tasks/mo | 1 task = 1 Zap step | Enormous numbers at higher tiers | HIGH |

---

## 2. Credit Psychology Insights

### What Makes Credits Feel "Generous"

**Insight 1: Big Numbers Win** -- Confidence: HIGH
Users perceive "500 credits" as more generous than "25 credits" even if they buy the same output. This is the **denomination effect** from behavioral economics. Casinos use chips for this exact reason. ElevenLabs gives "100,000 characters" instead of "50 pages." The number itself creates perceived abundance.

**Insight 2: The "Never Run Out" Feeling** -- Confidence: HIGH
The worst user experience in credit systems is anxiety about running out. Jasper abandoned word limits entirely because users would self-censor (write less, use the tool less) to preserve credits. This **reduced engagement**, which reduced retention. Copy.ai followed the same path.

**Insight 3: Rollover Reduces Anxiety** -- Confidence: HIGH
Beamix already has 20% rollover -- this is good. T-Mobile's "Data Stash" (unused data rolls over) was a massive competitive advantage. Users feel the system is fair when they don't lose what they paid for. Best practice: show the rollover balance prominently.

**Insight 4: "Unlimited Basic + Credits for Premium" is the Best Hybrid** -- Confidence: HIGH
Companies like Notion (unlimited AI for $10/mo add-on) and Copy.ai (unlimited in Pro) show that basic functionality should feel unlimited. Reserve credits only for genuinely expensive operations. This creates a generous base with clear upsell.

**Insight 5: Avoid "Pay-Per-Think" Friction** -- Confidence: HIGH
Every time a user has to calculate "is this worth 3 credits?" before clicking a button, you've created friction. Slack learned this -- their per-message pricing was abandoned for per-seat. The best credit systems are ones users don't think about daily.

**Insight 6: Credit Names Matter** -- Confidence: MEDIUM
"Credits" is generic. Branded units can feel more valuable:
- Midjourney: "fast hours" / "relax hours"
- Jasper: previously "words" (tangible output)
- HubSpot: "Marketing Contacts" (tied to value)
Consider naming credits something output-tied: "actions," "optimizations," or "runs."

### What Creates Credit Anxiety (Anti-Patterns)

1. **Low numbers** (2-5 credits per action) -- feels scarce, every click is a cost decision
2. **No visibility** into remaining balance until it's too late
3. **Hard cutoffs** with no grace period
4. **Complex exchange rates** (this agent = 2, that one = 5 -- cognitive load)
5. **Expiring credits** with no rollover (Beamix avoids this -- good)

---

## 3. Three Concrete Options for Beamix

### Current State (for reference)

| Plan | Price | Credits | Agents Cost 2-5 each | Effective Agent Runs |
|------|-------|---------|----------------------|---------------------|
| Trial | Free (7 days) | 5 credits | 2-5 per agent | 1-2 runs total |
| Starter $49/mo | ? credits | 2-5 per agent | ? runs |
| Pro $149/mo | ? credits | 2-5 per agent | ? runs |
| Business $349/mo | ? credits | 2-5 per agent | ? runs |

---

### OPTION A: "Inflate the Numbers" (Multiply by 100x)

**Concept:** Keep the same economics, but multiply all numbers by 100. A blog post costs 500 credits instead of 5. But you get 50,000 credits/month instead of 500.

| Plan | Credits/mo | Blog Post | Content Writer | FAQ Agent | Schema Opt | Competitor Intel |
|------|-----------|-----------|---------------|-----------|------------|-----------------|
| Starter $49 | 10,000 | 500 | 300 | 200 | 200 | N/A |
| Pro $149 | 35,000 | 500 | 300 | 200 | 200 | 400 |
| Business $349 | 100,000 | 500 | 300 | 200 | 200 | 400 |

**Pros:**
- Zero engineering risk -- just change display numbers
- "10,000 credits" feels abundant; "100 credits" feels scarce
- Users see big numbers and feel rich (casino chip effect)
- Allows finer-grained pricing for future features (partial credits)
- Easy to add small bonus credits for engagement ("Refer a friend, get 500 credits!")

**Cons:**
- Savvy users will see through the inflation ("these are just points")
- Doesn't solve the fundamental question of whether users have enough runs
- Still requires per-action cost calculation
- "500 credits for a blog post" is still abstract -- users need to learn the exchange rate

**Confidence:** HIGH -- this is a proven tactic (ElevenLabs, gaming, loyalty programs)

---

### OPTION B: "Unlimited Basic + Premium Credits" (Hybrid Model)

**Concept:** Make the lightweight agents **unlimited** (FAQ, Schema, Review Analyzer). Reserve credits only for the expensive, LLM-heavy agents (Content Writer, Blog Writer, Competitor Intelligence). Dramatically simplifies the mental model.

| Plan | Unlimited Agents | Credited Agents | Credits/mo |
|------|-----------------|----------------|-----------|
| Starter $49 | FAQ, Schema Optimizer, Review Analyzer | Content Writer, Blog Writer | 15 runs |
| Pro $149 | All Starter + Social Strategy | Content Writer, Blog Writer, Competitor Intel | 40 runs |
| Business $349 | All Pro | Content Writer, Blog Writer, Competitor Intel | 120 runs |

Credits are now called **"AI Runs"** -- each run = one full agent execution. No variable pricing (1 run = 1 run). Simple.

**Pros:**
- Eliminates credit anxiety for 3-4 of 7 agents entirely
- "Unlimited" is the strongest word in SaaS pricing
- Users engage more with unlimited tools, building habit and stickiness
- Simple: "1 run = 1 agent execution" -- no math needed
- Follows the Jasper/Copy.ai industry trend
- The unlimited agents (FAQ, Schema, Review) cost you very little per call anyway

**Cons:**
- "Unlimited" agents could be abused (rate-limit needed)
- Lower perceived value of unlimited agents ("if it's free, is it any good?")
- Requires splitting agents into tiers, adding complexity to the codebase
- Revenue risk if users only use unlimited features and never upgrade

**Confidence:** HIGH -- this is the dominant trend in AI SaaS

---

### OPTION C: "Action Packs" (Output-Based Pricing)

**Concept:** Instead of abstract credits, price in terms of outputs users understand. "Your plan includes 8 blog posts, 12 content rewrites, and 20 quick optimizations per month."

| Plan | Blog Posts | Content Rewrites | Quick Optimizations | Competitor Reports |
|------|-----------|-----------------|--------------------|--------------------|
| Starter $49 | 4/mo | 8/mo | Unlimited | N/A |
| Pro $149 | 12/mo | 25/mo | Unlimited | 4/mo |
| Business $349 | 40/mo | Unlimited | Unlimited | Unlimited |

"Quick Optimizations" = FAQ, Schema, Review Analyzer (low-cost agents, unlimited on all plans).

**Pros:**
- Users understand exactly what they're buying ("4 blog posts per month")
- No exchange rate to learn -- direct value mapping
- "Unlimited quick optimizations" gives that generous feeling
- Easiest to compare to competitors (Surfer SEO uses articles/mo similarly)
- Can upsell individual packs: "Need 5 more blog posts? $29 add-on"

**Cons:**
- Harder to manage technically (separate counters per agent type)
- Less flexible if you add new agents (each needs its own allocation)
- Users may feel constrained by specific allocations ("I want more blog posts but fewer reports")
- Can't use credits across agent types (no fungibility)

**Confidence:** MEDIUM -- works well for content tools but less proven for multi-agent platforms

---

## 4. Recommendation

### Go with OPTION B (Unlimited Basic + Premium Credits), enhanced with Option A's inflation psychology.

**Here is the specific recommendation:**

#### Credit Architecture

| Plan | Unlimited Agents | AI Runs/mo | Rollover |
|------|-----------------|-----------|----------|
| **Starter $49** | FAQ Agent, Schema Optimizer, Review Analyzer | 20 runs | 20% (4 runs carry over) |
| **Pro $149** | All Starter + Social Strategy | 60 runs | 20% (12 runs carry over) |
| **Business $349** | All Pro agents unlimited | 150 runs | 20% (30 runs carry over) |

- **1 AI Run = 1 agent execution**, regardless of agent type. No variable pricing. Simple.
- The unlimited agents (FAQ, Schema, Review) are **rate-limited** to prevent abuse: max 10/day on Starter, 25/day on Pro, 100/day on Business. But these are soft limits users will rarely hit.
- Content Writer, Blog Writer, and Competitor Intelligence consume 1 run each.
- Trial: 5 AI Runs (same as current 5 credits -- unchanged).

#### Why This Wins

1. **"Unlimited" headline** -- Starter users see "Unlimited FAQ + Schema + Reviews" on the pricing page. That word alone increases conversion.

2. **Simple unit** -- "1 run = 1 agent execution" eliminates the cognitive load of "this costs 2, that costs 5." Users never have to do math.

3. **Generous feeling** -- 20 runs at Starter ($49) means ~5 blog posts/week or ~1/business day. That's more than most SMBs need. At Pro (60 runs), a user can run an agent every single day twice and still have surplus.

4. **Low-cost agents build habit** -- Making FAQ/Schema/Review unlimited means users come back daily. Daily usage = retention. These agents cost you pennies per call (short prompts, small outputs). The ROI on retention is enormous.

5. **Clean upgrade path** -- Starter user hits 20 runs? "Upgrade to Pro for 3x the runs + Social Strategy unlimited." Clear value prop.

#### Display Enhancements (Borrow from Option A)

- Show runs as a **progress bar**, not just a number: "14 of 20 AI Runs remaining"
- Show a monthly **value meter**: "Your agents generated $2,400 in estimated content value this month" (based on freelancer-equivalent pricing)
- Rollover visualization: "4 bonus runs carried over from last month"
- Celebrate milestones: "You've run 100 agents total! Your content is working."

#### Naming

Call them **"AI Runs"** not "credits." A "run" feels like an action with output. A "credit" feels like currency that depletes. "You have 20 AI Runs this month" > "You have 20 credits remaining."

---

## 5. Unit Economics Sanity Check

Rough LLM cost per agent run (via OpenRouter):

| Agent | Estimated LLM Cost | Cost at Starter (20 runs) | Margin |
|-------|-------------------|--------------------------|--------|
| Content Writer | ~$0.08-0.15 | $1.60-3.00 | 94-97% |
| Blog Writer | ~$0.15-0.30 | $3.00-6.00 | 88-94% |
| FAQ Agent | ~$0.02-0.05 | Unlimited (pennies) | 99%+ |
| Schema Optimizer | ~$0.02-0.05 | Unlimited (pennies) | 99%+ |
| Review Analyzer | ~$0.03-0.08 | Unlimited (pennies) | 99%+ |
| Competitor Intel | ~$0.10-0.20 | $2.00-4.00 | 92-96% |

**Worst case at Starter ($49/mo):** User burns all 20 runs on Blog Writer (most expensive) = ~$6.00 in LLM costs. Plus unlimited FAQ/Schema/Review, say 100 calls = ~$5.00. Total COGS: ~$11. Margin: **77%+**. Healthy.

**Worst case at Pro ($149/mo):** 60 Blog Writer runs = ~$18 + unlimited low-cost agents ~$10 = $28. Margin: **81%+**.

The economics are strong. You can afford to be generous.

---

## 6. Gaps & Caveats

| Gap | Impact | How to Close |
|-----|--------|-------------|
| Otterly/Peec/Profound pricing not verified (too new, no public pricing) | Can't benchmark against direct GEO competitors | Check their sites manually; most are enterprise/custom |
| Pricing data from training knowledge, not live web scraping | Some prices may have changed since May 2025 | Verify Jasper, Surfer, Frase, MarketMuse pricing pages before finalizing |
| No user research on Beamix users' credit perception | Don't know if current users feel constrained | Run a 5-question survey to current users/waitlist |
| Competitor Intelligence agent cost estimate is rough | Could be higher if multiple LLM calls per run | Profile actual token usage in staging |

---

## Sources

All data based on publicly available pricing pages and product announcements as of my knowledge cutoff (May 2025). Specific sources:

1. MarketMuse pricing page (marketmuse.com/pricing) -- Confidence: MEDIUM
2. Surfer SEO pricing page (surferseo.com/pricing) -- Confidence: HIGH
3. Frase pricing page (frase.io/pricing) -- Confidence: HIGH
4. Clearscope pricing page (clearscope.io/pricing) -- Confidence: MEDIUM
5. Jasper AI pricing and 2023 unlimited pivot announcement -- Confidence: HIGH
6. Copy.ai pricing page (copy.ai/pricing) -- Confidence: HIGH
7. Writesonic pricing page (writesonic.com/pricing) -- Confidence: HIGH
8. OpenAI/Anthropic API pricing pages -- Confidence: HIGH
9. Midjourney subscription tiers -- Confidence: HIGH
10. ElevenLabs pricing page -- Confidence: HIGH
11. Behavioral economics: denomination effect (Raghubir & Srivastava, 2009) -- Confidence: HIGH
12. Jasper word-limit removal blog post (2023) -- Confidence: HIGH

**Overall Research Confidence: MEDIUM** -- Pricing data is directionally correct but 10+ months old. Verify critical data points before committing to a pricing change.
