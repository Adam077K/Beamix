# Beamix — Handoff Document: New Feature Planning Sprint
> **Created:** March 8, 2026
> **For:** Next Claude Code session / agent team
> **Status:** Ready to execute — research + planning phase
> **Repo:** https://github.com/Adam077K/Beamix

---

## What Was Done This Session

### 1. Feature Documentation — COMPLETED ✅
A team of 5 Atlas agents was deployed to document every feature in the system in engineering-ready spec files. All docs are in `.planning/04-features/`:

| File | Lines | What It Covers |
|------|-------|----------------|
| `README.md` | 161 | Master index + reading order |
| `agent-system-spec.md` | 2,022 | All 16 agents, credit system, SSE streaming, workflow chains |
| `dashboard-analytics-spec.md` | 1,460 | Dashboard, rankings, recommendations, analytics |
| `integration-billing-spec.md` | 1,359 | Paddle billing, integrations, Public REST API |
| `scan-engine-spec.md` | 1,320 | 10 AI engines, 6-stage parsing, Inngest jobs |
| `alert-workflow-spec.md` | 1,258 | 9 alert types, workflow chains, event automation |
| `auth-onboarding-spec.md` | 1,100 | Auth, onboarding 4-step, C3 free scan import |
| `content-system-spec.md` | 1,053 | Content lifecycle, 12 types, voice training |
| `competitive-intelligence-spec.md` | 922 | Share of voice, A8 pipeline, competitor alerts |
| `ai-readiness-spec.md` | 604 | 5 scoring categories, A11 pipeline |

**Source of truth:** `.planning/03-system-design/` (4 files, ~6K lines total)

---

### 2. Competitive Gap Analysis — COMPLETED ✅
We analyzed all 15 competitors in `.planning/02-competitive/` and identified features competitors have that Beamix doesn't. The owner reviewed the list and selected specific features to plan.

---

## Your Mission: New Feature Planning

The owner has selected **11 new features** to research, analyze, and plan as engineering specs in `.planning/04-features/`. These are competitive gaps identified from 15 competitor analyses.

### The 11 Features to Plan

| # | Feature | Inspired By | Priority |
|---|---------|-------------|----------|
| 1 | **AI Crawler Feed** | Scrunch AI | High |
| 2 | **Content Comparison Tool** | RankScale | High |
| 3 | **Topic/Query Clustering** | SE Visible | High |
| 4 | **Conversation Explorer** | Profound | High |
| 5 | **Auto-Suggest Competitors from Industry DB** | Peec AI, SE Visible | High |
| 6 | **Browser Simulation Validation** (Pro tier) | Peec AI, RankPrompt | High |
| 7 | **Unlinked Citation / Web Mention Tracking** | Ahrefs Brand Radar | Medium |
| 8 | **Social Platform Monitoring** (YouTube, TikTok, Reddit) | Ahrefs Brand Radar | Medium |
| 9 | **Reduce Scan Refresh to 30 Minutes** + scan agent count optimization | Currently hourly | High |
| 10 | **Multi-Region / City-Level Scanning** | Peec AI | High |
| 11 | **Real Prompt Volume Data** (beyond estimation) | Profound, Writesonic, Ahrefs | Medium |

---

## What Each Agent Team Needs to Do Per Feature

For each feature, the analysis must cover:

### A. Research & Feasibility Analysis
- What exactly does this feature do (user perspective)?
- What does it cost to implement and operate (LLM calls, infrastructure, API costs)?
- How do competitors implement it technically?
- What's the minimum viable version vs. the full version?
- Does it increase LLM/API costs significantly? If so, by how much?

### B. Cost Impact Analysis (CRITICAL)
The owner is concerned about LLM costs. Current monthly LLM cost estimate at 1K businesses: **$15,000-25,000/month** (from system design). Each new feature must be analyzed for:
- Does it add LLM API calls? How many per user per month?
- Can it be done without LLM (rule-based, algorithmic, third-party API)?
- What's the marginal cost per user per month if we add this feature?
- Should this feature be gated to Pro/Business tier to recover costs?
- Does adding this feature justify a **pricing increase**? (Current: Starter $49, Pro $149, Business $349)

### C. Engineering Spec (Mini Feature Spec)
Write a mini-spec (not as long as the main feature docs, but covering):
- Feature scope and boundaries
- Data model changes needed (new tables, columns, indexes)
- API routes or UI changes
- Integration dependencies (new third-party APIs?)
- Inngest jobs needed
- Which plan tier gets this feature
- Build effort estimate (days/weeks)
- Risk factors

---

## Feature-Specific Context for Each

### Feature 1: AI Crawler Feed
**What competitors do:** Scrunch AI shows a real-time feed of which AI bots (GPTBot, ClaudeBot, Google-Extended, PerplexityBot) crawl your website, which pages they access, and how often.
**Key question:** How do we detect AI bot crawls? Options: (a) Vercel/Cloudflare log analysis, (b) GA4 bot detection events, (c) user installs a tracking pixel/script, (d) user connects Cloudflare account.
**Cost concern:** Could be zero LLM cost if purely algorithmic (log parsing). Or moderate if we use LLM to summarize crawl patterns.
**Constraint:** Requires user to have Cloudflare or Vercel on their site, OR we provide a JavaScript snippet they install. Either way requires user action.

### Feature 2: Content Comparison Tool
**What competitors do:** RankScale shows original content vs. AI-optimized version side by side. User can see exactly what changed.
**Beamix context:** We already have `content_versions` table and a Markdown editor. This is largely a UI feature — add a diff view to the content editor.
**Cost concern:** Low. Just a UI diff renderer (no additional LLM calls needed).
**Key decision:** Do we use a Markdown diff library (e.g., `diff` npm package + visual rendering), or do we use LLM to explain changes in natural language?

### Feature 3: Topic/Query Clustering
**What competitors do:** SE Visible groups tracked queries into topic clusters (e.g., "pricing queries," "location queries," "review queries"). Makes navigation easier as query count grows.
**Beamix context:** We have `tracked_queries` table. Clustering could be: (a) LLM-based semantic clustering, (b) keyword-based rule clustering, (c) embedding + k-means clustering.
**Cost concern:** Embedding-based clustering is cheap (Haiku or OpenAI embeddings). One-time per batch, not per scan.
**Key question:** How many queries does a typical user track? If <30, clustering has low value. If >50+, high value.

### Feature 4: Conversation Explorer
**What competitors do:** Profound's "Conversation Explorer" lets users browse what people are actually asking in their niche across AI engines — not just their own tracked queries, but the broader conversation happening.
**Key question:** How do we get this data? Options: (a) aggregate our own scan data across all users (privacy concern), (b) use Perplexity's related questions API, (c) use a keyword research tool API, (d) LLM generates likely queries based on industry/niche.
**Cost concern:** If LLM-generated, moderate cost per exploration session. If aggregated from existing scans, near-zero marginal cost.
**Privacy constraint:** Cross-user data aggregation must be anonymized. Only show industry-level patterns, never individual business data.

### Feature 5: Auto-Suggest Competitors from Industry Database
**What competitors do:** Peec AI suggests competitors based on your industry/category from a database, before any scan is run. You enter "dental clinic in Tel Aviv" and get a list of suggested competitors to track.
**Key question:** What's our industry database? Options: (a) LLM generates suggested competitors based on business type + location, (b) Google Places API / similar for local business discovery, (c) manual curated lists per industry, (d) web search for "[industry] [location]" and parse top results.
**Cost concern:** LLM-based: ~1 Haiku call per onboarding session = very cheap. Web search API: marginal cost per call. Google Places: usage-based pricing.

### Feature 6: Browser Simulation Validation (Pro tier)
**What competitors do:** Peec AI and RankPrompt use Playwright to simulate real browser sessions, getting the exact response a real user would see (vs. API which may differ). Used as a validation layer alongside API calls.
**Key question:** Where do we run Playwright? Options: (a) Vercel serverless (limited timeout), (b) dedicated browser infrastructure (Browserbase, Playwright Cloud), (c) self-managed EC2/GCP VM.
**Cost concern:** Playwright infrastructure adds $200-800/month baseline for a modest fleet. API responses differ from browser responses mainly for: Copilot, AI Overviews, Grok. For OpenAI/Anthropic/Perplexity, API and browser are nearly identical.
**Recommendation to analyze:** Is the accuracy improvement worth the infrastructure cost for SMBs? Or should we reserve browser simulation only for the engines that have NO API (Copilot, AI Overviews)?

### Feature 7: Unlinked Citation / Web Mention Tracking
**What competitors do:** Ahrefs Brand Radar tracks brand mentions in traditional web (news, blogs, forums) AND AI, showing both linked and unlinked citations.
**Key question:** How do we find unlinked web mentions? Options: (a) Google Alerts API (free but limited), (b) Brand24/Mention.com API (paid), (c) Perplexity search for "[brand name]" and parse mentions, (d) Google Search API for brand mentions.
**Cost concern:** Using Perplexity to search for brand mentions = moderate cost but leverages existing integration. Third-party mention tracking APIs = $50-200/month per business = not viable at SMB scale.
**Key insight:** Beamix already uses Perplexity in agents. Could we run a brand mention search via Perplexity as a lightweight "web presence" check during scans?

### Feature 8: Social Platform Monitoring (YouTube, TikTok, Reddit)
**What competitors do:** Ahrefs Brand Radar tracks brand mentions on YouTube, TikTok, Reddit, news sites.
**Key question:** APIs available? YouTube Data API (free tier limited), Reddit API (public, free), TikTok (limited API). All throttle heavily.
**Cost concern:** API calls are relatively cheap but the parsing and storage could add up. Social monitoring is a fundamentally different data type than AI engine visibility.
**Key decision:** Is this core to Beamix's GEO positioning, or scope creep? Social mentions ≠ AI engine mentions. Owner selected this, so analyze whether it fits the product narrative.

### Feature 9: Reduce Scan Refresh to 30 Minutes + Cost Optimization
**Current state:** `cron.scheduled-scans` runs every 1 hour via Inngest. Each scan queries multiple AI engines in parallel (5 Haiku parsing calls per engine response).
**What owner wants:** Reduce to 30-minute refresh cycles. BUT also reduce the number of agents/models used per scan to offset the 2x frequency increase.
**Cost math to do:**
- Current scan cost per business per day at hourly: X calls × Y engines × Z parsing = $/day
- At 30-min refresh: 2X cost, unless we reduce engines scanned per cycle
- Options: (a) rotate engines — scan 3 engines per 30-min cycle, full 7-engine sweep every 3.5 hours, (b) reduce model tier (Haiku instead of Sonnet for parsing), (c) cache responses for queries that haven't changed in >24 hours, (d) scan only "priority queries" at 30 min, full scan daily
**Goal:** 30-min refresh that costs no more than the current hourly scan, or only marginally more.

### Feature 10: Multi-Region / City-Level Scanning
**Current state:** System design has geographic scan architecture designed but explicitly deferred.
**What competitors do:** Peec AI tracks "best insurance Tel Aviv" vs. "best insurance Haifa" as separate queries. Different AI responses per geographic context.
**Key question:** Do AI engines actually give different answers for city-specific queries? (Mostly yes for Perplexity, partially for ChatGPT, rarely for Claude.)
**Implementation:** Each tracked query gets a "location modifier" — the scan engine appends " in [city]" to queries before sending to AI engines. Results are stored with a location tag in `scan_engine_results`.
**Cost concern:** Each additional city = additional scan calls = linear cost increase. Must be limited (e.g., Starter: 1 region, Pro: 5 regions, Business: unlimited).
**Israeli context:** This is especially important for Beamix's primary market. "עורך דין תל אביב" vs. "עורך דין חיפה" are very different queries.

### Feature 11: Real Prompt Volume Data
**Current state:** Beamix's `prompt_library` + `prompt_volumes` tables estimate query volume by aggregating its own scan data across users. This is a weak proxy vs. Profound's 130M conversations or Ahrefs' 239M real prompts.
**Key question:** Can we get real prompt volume data affordably? Options:
  - (a) Use Google Search Console data (users must connect GSC) — shows traditional search volume as a proxy
  - (b) Use Google Keyword Planner API as a proxy (search volume ≈ AI query volume directionally)
  - (c) Use Semrush/Ahrefs keyword API (paid)
  - (d) Use Perplexity's search to find "how often is X asked" (imprecise but cheap)
  - (e) Build our own panel over time — every Beamix scan is a data point, aggregate anonymously
**Cost concern:** Most accurate sources (Ahrefs, Semrush API) cost $0.01-0.05 per keyword lookup. At scale, expensive. GSC API is free if user connects it.

---

## Cost & Pricing Analysis Required

**Current pricing:**
- Starter: $49/mo (annual: $39/mo)
- Pro: $149/mo (annual: $119/mo)
- Business: $349/mo (annual: $279/mo)

**Current LLM cost estimate:** $15,000-25,000/month at 1K businesses = $15-25 per business/month

The owner wants agents to analyze: **Do these new features push costs high enough to justify a price increase?**

Analyze:
1. Total new LLM/API cost per feature per business per month
2. Which features add zero marginal LLM cost (UI-only, algorithmic)
3. Which features add significant cost and should be gated to higher tiers
4. Whether the feature set as a whole justifies:
   - Keeping current pricing (features are low-cost)
   - Adding a $10-20 price bump (features add moderate value)
   - Creating a new "Growth" tier between Pro and Business
   - Increasing Business tier from $349 to $449+ for the full feature set

---

## How to Execute This Work

### Recommended Agent Team Deployment

Deploy **3 parallel Atlas agents** + **1 Axiom (CFO/Analyst) agent**:

**Atlas Agent 1** — Features 1, 2, 3, 4
(AI Crawler Feed, Content Comparison, Topic Clustering, Conversation Explorer)

**Atlas Agent 2** — Features 5, 6, 7, 8
(Auto-Suggest Competitors, Browser Simulation, Unlinked Citations, Social Monitoring)

**Atlas Agent 3** — Features 9, 10, 11
(30-min Refresh + Cost Optimization, Multi-Region Scanning, Prompt Volume Data)

**Axiom Agent** — Pricing & Cost Impact Analysis
(After Atlas agents complete their feature analysis, Axiom synthesizes all cost data and recommends pricing adjustments)

### Output Expected

Each Atlas agent writes mini-specs to `.planning/04-features/`:
- `new-features-batch-1-spec.md` (Features 1-4)
- `new-features-batch-2-spec.md` (Features 5-8)
- `new-features-batch-3-spec.md` (Features 9-11)

Axiom writes:
- `.planning/PRICING-IMPACT-ANALYSIS.md`

### What Agents MUST Read Before Starting

1. `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md` — master overview
2. `.planning/02-competitive/COMPETITIVE_RESEARCH_DEEP.md` — full competitor profiles
3. `.planning/02-competitive/COMPETITIVE_FEATURES_BLUEPRINT.md` — feature comparison matrix
4. `.planning/02-competitive/_RESEARCH_SYNTHESIS.md` — Top 20 innovations + cost analysis
5. `.planning/03-system-design/_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` — current DB schema + APIs (read in chunks)
6. `.planning/03-system-design/_SYSTEM_DESIGN_INTELLIGENCE_LAYER.md` — LLM pipelines + current cost model (read in chunks)
7. The relevant existing feature spec in `.planning/04-features/` for context on what's already built

---

## Key Constraints Agents Must Respect

1. **Stack is fixed:** Next.js 16, React 19, TypeScript, Supabase, Paddle, Inngest, Resend, Vercel. No new infrastructure unless justified by the feature.
2. **NO Stripe** — Paddle only for billing. Don't suggest Stripe.
3. **NO n8n** — Direct LLM API integration only.
4. **LLM models available:** Claude Haiku 4.5 (cheap, fast), Claude Sonnet 4.6 (daily work), Claude Opus 4.6 (deep analysis only), GPT-4o (QA gates), Gemini 2.0 Flash (bulk), Perplexity Sonar Pro (research).
5. **Use Haiku by default** for any new parsing/classification tasks. Only escalate to Sonnet if quality requires it.
6. **Cost discipline:** Every new LLM call must be justified. If it can be done algorithmically, do it algorithmically.
7. **Tier gating:** Features that add meaningful LLM cost must be Pro or Business tier, not Starter.
8. **Hebrew/RTL:** New features that involve UI must work in Hebrew RTL mode.
9. **DB enum values:** `subscription_status`: UK spelling `'cancelled'` (NOT `'canceled'`). `plan_tier`: `'starter' | 'pro' | 'business'` (NO `'free'`). See memory for full schema corrections.

---

## Important Context From Memory

- Current build: All 12 phases complete (code exists but mocked — scan engine is PRNG, agents are mock)
- The 30-min refresh optimization is especially important because wiring real LLM calls will immediately increase costs — the cron frequency and model selection must be cost-efficient from day 1
- Israeli market is primary — Hebrew prompt library, RTL support, and city-level scanning ("Tel Aviv" vs "Haifa") are highly differentiated
- The scan cost correction: 5 Haiku calls per engine response (not 1) — this is why scan costs are higher than originally estimated
- `allocate_monthly_credits` RPC requires BOTH `p_user_id` AND `p_plan_id` params

---

## Files Written This Session (For Reference)

All in `.planning/04-features/`:
```
README.md                        ← Start here for navigation
agent-system-spec.md             ← 16 agents + credit system
dashboard-analytics-spec.md      ← Dashboard data flows
integration-billing-spec.md      ← Paddle + integrations + API
scan-engine-spec.md              ← Scan engine full spec
alert-workflow-spec.md           ← Alerts + workflow chains
auth-onboarding-spec.md          ← Auth + C3 import + onboarding bug fix
content-system-spec.md           ← Content lifecycle
competitive-intelligence-spec.md ← Competitor tracking
ai-readiness-spec.md             ← A11 auditor
```

---

*This handoff was written at the end of the March 8, 2026 session. All source files are in the repo. The owner has explicitly selected the 11 features listed above for analysis and planning — do not add features beyond what is listed without explicit approval.*
