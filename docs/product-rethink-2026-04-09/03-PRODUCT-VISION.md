# Beamix Product Vision — Redesign Proposal (2026-04-09)

STATUS: PROPOSAL — Not yet approved by Adam. Requires review and decisions on open questions (see 04-OPEN-QUESTIONS.md).

---

## Core Thesis

Beamix is NOT a dashboard. It's an **AI agency for SMBs** — a team of AI agents that does the GEO work for you, like professionals, but transparent and affordable.

**The positioning no competitor occupies:** Full agentic GEO execution at SMB pricing ($49-$349/mo vs $1,500-$30,000/mo agencies).

---

## The GEO Value Chain

Everything maps to 4 stages:

```
1. KNOW   → Am I being mentioned? By which engines? For which queries?
2. UNDERSTAND → Why am I ranking (or not)? What signals do AI engines use?
3. FIX    → Create/optimize content and signals that make AI engines cite me
4. MEASURE → Did it work? Am I improving over time?
```

### Current product coverage:
- KNOW: Strong (scan engine works, real LLM queries)
- UNDERSTAND: Weak (recommendations exist but generic, no query-level intelligence)
- FIX: Partial (7 agents, but they're generic content tools, not GEO-specialized)
- MEASURE: Missing (no before/after, no rescan comparison)

---

## The Research-Backed Agent System

### Design Principles (from GEO research)

1. **Every piece of content must include real statistics, citations, and expert quotes** — this is the #1 proven GEO lever (+40-115% visibility)
2. **Agents must know WHICH engine they're optimizing for** — ChatGPT needs third-party mentions, Gemini needs on-site content, Perplexity needs directory/community presence
3. **Human review gate is mandatory** — not optional, legally and practically required
4. **Unique business data is the moat** — generic AI content is worthless; agents must inject business-specific data, local stats, real case studies
5. **Off-site presence is 85% of the game** — agents that only write on-site content solve 15% of the problem
6. **Content rate limits** — never flood a site with 50+ pages/month (triggers ranking crashes)
7. **QA must check for GEO signals** — not just readability, but: does this content have statistics? citations? quotes?

---

## Proposed Agent Redesign

### Current agents → Proposed agents

| Current Agent | Verdict | Proposed Replacement |
|---------------|---------|---------------------|
| Content Writer | RETHINK | **Content Optimizer** — rewrites existing pages with stats, citations, quotes |
| Blog Writer | KEEP + ENHANCE | **Blog Strategist** — targets specific AI queries, includes GEO signals |
| FAQ Agent | KEEP + ENHANCE | **FAQ Builder** — comprehensive FAQ pages per query cluster |
| Schema Optimizer | KEEP | **Schema Generator** — JSON-LD for business, product, FAQ, article |
| Review Analyzer | RETHINK | **Review Strategy** — builds review PRESENCE, not just analyzes |
| Social Strategy | REMOVE or DEPRIORITIZE | Social media doesn't directly affect GEO |
| Competitor Intelligence | RETHINK | **Competitor Tracker** — real scan data, not chat-based |

### New agents to build (based on research gaps)

**Tier 1 — On-Site Optimization:**

| Agent | What It Does | Research Backing |
|-------|-------------|------------------|
| **Content Optimizer** | Rewrites existing pages to add statistics, citations, expert quotes | +40-115% proven impact (GEO paper) |
| **Content Refresher** | Updates stale content with fresh data and citations | 76% of top citations are <30 days old |
| **Blog Strategist** | Creates authority content targeting specific AI queries with GEO signals | Must include stats + citations + quotes |
| **FAQ Builder** | Creates comprehensive FAQ pages per query cluster | AI engines frequently cite FAQ content |
| **Schema Generator** | JSON-LD for LocalBusiness, Product, FAQ, Article types | Google/Bing confirmed it helps |

**Tier 2 — Off-Site Visibility (THE MOAT — no competitor does this at SMB prices):**

| Agent | What It Does | Research Backing |
|-------|-------------|------------------|
| **Citation Builder** | Identifies where business SHOULD be listed, guides through getting listed | 85% of mentions come from third parties |
| **Directory Optimizer** | Ensures consistent presence across industry-specific directories | 24% of Perplexity citations from niche dirs |
| **Review Strategy** | Plans for getting reviews on platforms AI engines trust | ChatGPT trusts Yelp, TripAdvisor, etc. |
| **Entity Builder** | Guides through Wikidata, Google Business Profile, knowledge graph | Foundation for AI entity recognition |

**Tier 3 — Intelligence & Measurement:**

| Agent | What It Does | Why It Matters |
|-------|-------------|---------------|
| **Query Intelligence** | "Here are 50 queries where you SHOULD appear" | Centers the whole product around queries |
| **Competitor Tracker** | Real competitive scanning, comparative data | Know who you're losing to per query |
| **Performance Analyzer** | Before/after measurement per action taken | Proves ROI, reduces churn |

---

## Proposed UX Model: The GEO Roadmap

### Replace "Agent Hub" with "GEO Roadmap"

Instead of users browsing 7+ agent cards and figuring out what to run, they see a personalized roadmap:

```
YOUR GEO ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score: 34/100 → Target: 70/100

COMPLETED (3)
  - FAQ page created for "best [industry] in [city]"
  - Schema markup added (LocalBusiness + FAQ)
  - Google Business Profile optimized

IN PROGRESS (2)
  - Blog post: "10 things to know about [topic]" — awaiting your review
  - Directory listing: Yelp — needs your input

UP NEXT (5)
  - Content refresh: homepage (add statistics + citations)
  - Create comparison page targeting "[you] vs [competitor]"
  - Get listed on [industry directory]
  - Add expert quotes to services page
  - Build Wikidata entity

FUTURE (8 more items)
```

**Key principles:**
- Users don't pick agents — they see actions and click "do this next"
- Agents are invisible infrastructure, not the product surface
- Each action shows: what it fixes, which engines it helps, estimated impact
- Progress is visual and satisfying (gamification through completion)
- The roadmap is generated from scan results + query intelligence

### The Transparency Layer

Users should feel like they have a GEO team working for them:
- Every action shows WHY it matters ("ChatGPT mentions you in 2 of 15 relevant queries — this content targets the other 13")
- Before/after metrics per completed action
- The user approves everything before it goes live (human-in-the-loop)
- Weekly summary: "This week, your agents completed 3 tasks. Your score improved from 34 → 41."

---

## Proposed Pricing Alignment

Current pricing ($49/$149/$349) maps to:

| Tier | Scan | On-Site Agents | Off-Site Agents | Intelligence |
|------|------|---------------|----------------|-------------|
| **Starter $49/mo** | 3 engines, weekly | Content Optimizer, FAQ Builder, Schema Gen | Citation Builder (guided) | Basic query tracking |
| **Pro $149/mo** | 4+ engines, daily | All on-site + Content Refresher, Blog Strategist | All off-site agents | Full query intelligence |
| **Business $349/mo** | All engines, unlimited | All agents, priority execution | All + dedicated strategy | Competitor tracking + performance |

---

## What to Build First (Proposed Priority)

### Week 1: Fix Launch Blockers (from 01-PRODUCT-STATE.md)
- Apply production DB migration
- Wire Resend email sending (3 critical templates)
- Fix settings billing tab
- Hide competitor scores or build real scanning
- Build scheduled scan Inngest function

### Week 2-3: Upgrade Existing Agents with GEO Research
- Inject statistics + citations + quotes into all agent system prompts
- Add GEO-signal QA checks (does content have stats? citations? quotes?)
- Make agents engine-aware (different advice for ChatGPT vs Gemini vs Perplexity)
- Add Content Refresher agent (existing content optimization)

### Month 1: Build the GEO Roadmap
- Query Intelligence system (what queries should this business rank for?)
- Roadmap generation from scan + query data
- Before/after measurement (rescan comparison)
- Roadmap UI replacing agent hub

### Month 2: Off-Site Agents (The Moat)
- Citation Builder
- Directory Optimizer
- Entity Builder
- Review Strategy

### Month 3: Polish & Scale
- Competitor real scanning
- Performance analytics
- Content rate limiting and scheduling
- Agency-grade reporting

---

## What to NOT Build (Based on Research)

| Feature | Why Skip |
|---------|----------|
| llms.txt generator | 0.1% of AI crawlers touch it, 8/9 test sites saw zero change |
| Social media strategy | Doesn't affect GEO; different product category |
| AI Readiness as separate page | Merge into scan results — redundant as standalone |
| Automated publishing (no human review) | Legally risky, quality risk, ranking crash risk |
| Content voice profiles (for now) | Nice-to-have moat builder, not launch priority |
| Agent workflows / automation chains | Over-engineering — users need simple roadmap, not workflow builder |
| API keys / developer access | Business tier feature, post-launch |
