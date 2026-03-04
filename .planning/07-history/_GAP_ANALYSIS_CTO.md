# CTO Gap Analysis: Engineering Plan vs Competitive Features Blueprint

> **Date:** 2026-03-04
> **Author:** Atlas (CTO)
> **Scope:** Systematic comparison of every competitive feature against the Beamix engineering plan
> **Verdict:** The engineering plan covers core functionality well but has significant gaps in data collection methodology, attribution/analytics, agency features, and several advanced capabilities competitors already ship.

---

## 1. Feature Coverage Matrix

### System Engineer Summary: 30 Items

Each item from the "System Engineer Summary: The Perfect GEO Platform" in the competitive blueprint, checked against the engineering plan.

| # | Feature | Status | Engineering Plan Reference | Notes |
|---|---------|--------|---------------------------|-------|
| **Data Layer** |
| 1 | Multi-engine monitoring (10+ AI platforms) via browser simulation | ??? PARTIAL | Phase 1 (2.1) — 7 engines defined; Copilot/AI Overviews marked "deferred" | Only 7 engines in Phase 1. Browser simulation listed but deferred. API-first means less accurate data than Peec/Rank Prompt. No plan to reach 10+ engines. |
| 2 | Daily automated scans with historical trend storage | ??? COVERED | Phase 1 (2.6) — Inngest cron, daily/3-day/weekly by tier | Fully specified with scan frequency per tier + historical storage in scan_results. |
| 3 | Source-level citation tracking (exact URLs) | ??? PARTIAL | Phase 1 (2.3) — citations[] extracted in parsing pipeline | Citations extracted but NO dedicated source-level UI component. No URL-level attribution dashboard (Airefs' key differentiator). Engineering plan stores citations but doesn't specify source-level analysis views. |
| 4 | AI crawler detection at CDN/edge level | ??? COVERED | Phase 9 (10.1-10.3) — 3 progressive approaches defined | JS snippet -> Server logs -> Vercel/Cloudflare integration. Well designed with dashboard widget spec. |
| 5 | Proprietary prompt volume data (or estimated volumes) | ??? MISSING | Not addressed anywhere in engineering plan | Profound has 130M conversations, Writesonic 120M, Ahrefs 190M prompts. Engineering plan has ZERO concept of prompt volume estimation, trending topics, or conversation volume data. This is the #1 competitive data gap. |
| **Analytics Layer** |
| 6 | Visibility score (0-100%) per engine per prompt | ??? COVERED | Phase 1 (2.4) — computeVisibilityScore with per-engine breakdown | Fully specified with scoring algorithm. |
| 7 | Sentiment scoring (positive/neutral/negative) with 0-100 scale | ??? PARTIAL | Phase 1 (2.3) — sentiment in ParsedEngineResult | Sentiment is captured as 'positive'/'neutral'/'negative' enum but NOT as a 0-100 numeric scale. Competitors like Peec and SE Visible use a 0-100 scale for finer granularity. |
| 8 | Share of voice vs competitors | ??? COVERED | Phase 4 (5.1) — Share of Voice pie chart specified | Defined in competitive intelligence phase. |
| 9 | AI readiness score for websites (0-100%) | ??? COVERED | Phase 8 (9.1-9.3) — 5 categories, weighted scoring, cheerio crawl | Well designed with free scan integration. |
| 10 | Gap analysis: where brand is missing vs competitors | ??? COVERED | Phase 4 (5.1) — Gap analysis query defined | "WHERE competitor.is_mentioned = true AND user.is_mentioned = false" |
| 11 | Revenue attribution (AI visibility -> conversions) | ??? PARTIAL | Phase 7 (8.4) — GA4 integration with AI referral domains | GA4 integration is specified for traffic attribution, but the plan only covers referral domain detection. No conversion/revenue tracking pipeline. No e-commerce integration. AthenaHQ and Goodie track actual revenue, not just visits. |
| **Action Layer** |
| 12 | Prioritized action center (what to fix, in what order) | ??? COVERED | Phase 2 (3.4, A4) — Recommendations Agent, auto-runs after scan | Generates 5-8 prioritized recommendations. Dashboard view specified in Phase 3. |
| 13 | AI agents that execute fixes autonomously | ??? COVERED | Phase 2 (3.1-3.7) — 12 agents with Inngest pipeline | Core differentiator. Fully designed with credit system, QA gates, cross-agent context. |
| 14 | Content generation (6+ types, brand-voiced) | ??? PARTIAL | Phase 2 (3.4) + Phase 6 (7.2) — Multiple agent types, content voice training mentioned | Agents cover: articles, blog posts, FAQs, social posts, schema, llms.txt, outreach templates. Content voice training listed as "Phase 3+" in 7.2. BUT: no comparison articles, ranked lists, location pages, case studies, or product deep-dives as specific content types (Rank Prompt has 6 typed generators). Agent output is generic "content" not typed templates. |
| 15 | Schema/JSON-LD auto-generation | ??? COVERED | Phase 2 (3.4, A3) — Schema Optimizer Agent with cheerio + Claude pipeline | Includes existing schema detection, gap analysis, generation, and validation. |
| 16 | LLMS.txt creation and management | ??? COVERED | Phase 2 (3.4, A10) — LLMS.txt Generator Agent | Crawl + generate pipeline specified. |
| 17 | PR/citation outreach automation | ??? COVERED | Phase 2 (3.4, A9) — Citation Builder Agent | Identifies cited sources, researches contacts, generates outreach emails. |
| **Intelligence Layer** |
| 18 | Conversational AI analyst ("Ask Beamix") | ??? COVERED | Phase 2 (3.4, A12) — "Ask Beamix" with Claude Sonnet + SSE | Free for Pro+ tier. Full business context injection. |
| 19 | Content pattern analysis (what makes cited content succeed) | ??? MISSING | Not addressed in engineering plan | Spotlight's key feature: analyze what structural/tonal patterns make top-cited content successful, then generate content following those patterns. Engineering plan agents generate content based on research but do NOT analyze citation-winning patterns from the market. |
| 20 | Persona-based visibility views | ??? MISSING | Not addressed in engineering plan | Scrunch's differentiator. Track visibility differently per buyer persona. No persona concept in the data model or dashboard. |
| 21 | Customer journey stage mapping | ??? MISSING | Not addressed in engineering plan | Spotlight's feature: map prompts to awareness -> consideration -> decision stages. No funnel stage concept in the engineering plan's data model. |
| 22 | Competitive intelligence with anonymous monitoring | ??? COVERED | Phase 4 (5.1) — Competitor tracking with anonymous monitoring | Explicit: "No notification to tracked brands." |
| **Platform Layer** |
| 23 | CMS integration (WordPress one-click publish minimum) | ??? COVERED | Phase 7 (8.3) — WordPress REST API + Application Passwords | Phase 1: REST API + App Passwords. Phase 2: custom plugin. |
| 24 | Analytics integration (GA4, GSC) | ??? PARTIAL | Phase 7 (8.4) — GA4 specified | GA4 is designed. Google Search Console is listed in the integrations table schema (`provider IN ('wordpress', 'ga4', 'gsc', 'slack', 'cloudflare')`) but has NO implementation specification. GSC could provide keyword/ranking data that feeds back into prompt generation. |
| 25 | Looker Studio connector | ??? MISSING | Not addressed in engineering plan | Otterly, SE Visible, and Peec all offer this. Zero mention in the engineering plan. Important for agencies/power users who build custom reports. |
| 26 | API access for custom integrations | ??? COVERED | Phase 10 (11.1-11.2) — Full REST API with key management | Well designed: 12 endpoints, scoped API keys, rate limiting. |
| 27 | Multi-language/multi-region support (Hebrew first!) | ??? PARTIAL | Phase 1 (2.2) — language: 'en' / 'he' in prompts | Prompt generation supports EN/HE. Content agents accept language param. BUT: no multi-region scan concept (scanning from different geolocations), no multi-market segmentation in dashboard, no per-country visibility breakdown. Competitors like Goodie and Peec support multi-country segmentation. |
| 28 | White-label agency mode | ??? MISSING | Not addressed in engineering plan | Otterly and Rank Prompt offer white-label reports and multi-client agency management. Zero mention in the engineering plan. No multi-workspace, no custom branding on reports. |
| 29 | Real-time alerts (Slack, email, in-app) | ??? COVERED | Phase 5 (6.1-6.4) — 9 alert types, 3 channels, rules engine | Well designed with deduplication, severity levels, channel routing. |
| 30 | Free scan as viral acquisition hook | ??? COVERED | Phase 1 (2.5) — Full free scan flow with shareable results | Rate limited, generates AI readiness score, shareable. |

### Summary Counts

| Status | Count | Percentage |
|--------|-------|------------|
| ??? COVERED | 16 | 53% |
| ??? PARTIAL | 7 | 23% |
| ??? MISSING | 7 | 23% |

---

### Master Feature Comparison Matrix Coverage

Every row from the competitive blueprint's Master Feature Comparison Matrix, checked against the engineering plan.

| Feature | Status | Notes |
|---------|--------|-------|
| **MONITORING** |
| Brand Mention Tracking | ??? COVERED | Core scan engine functionality |
| Daily Auto Monitoring | ??? COVERED | Inngest cron schedules |
| AI Engines Tracked | ??? PARTIAL | 7 in Phase 1 (competitors track 5-11). Missing: Meta AI, AI Mode, AI Overviews (browser-only), Mistral, Amazon Rufus |
| Prompt Volume Data | ??? MISSING | Zero concept of estimated conversation volumes per topic |
| Prompt Auto-Suggest | ??? PARTIAL | Prompts are generated per business type (2.2) but no smart suggestion UI based on website content analysis like Peec |
| **ANALYSIS** |
| Sentiment Analysis | ??? PARTIAL | Captured but as enum not 0-100 scale |
| Citation/Source Tracking | ??? PARTIAL | Citations extracted, no dedicated source-level analytics view |
| Source-Level URLs | ??? PARTIAL | URLs captured in parsing but no dedicated tracking/display system |
| Share of Voice | ??? COVERED | Phase 4 |
| Competitor Benchmarking | ??? COVERED | Phase 4 |
| Regional/Multi-Language | ??? PARTIAL | EN/HE supported, no multi-region geographic scanning |
| Brand Narrative Analysis | ??? MISSING | AthenaHQ's ACE analyzes WHY AI says what it says about your brand. No narrative analysis concept in engineering plan. |
| Persona-Based Tracking | ??? MISSING | No persona concept |
| **CONTENT & AGENTS** |
| Content Generation | ??? COVERED | 12 agents |
| AI Agents (Autonomous) | ??? COVERED | Inngest pipelines |
| CMS Auto-Publish | ??? COVERED | WordPress integration |
| PR/Outreach Automation | ??? COVERED | Citation Builder Agent |
| Content Type Variety | ??? PARTIAL | Generic content writer + blog writer. No comparison article, ranked list, location page, case study, or product deep-dive templates |
| Schema Recommendations | ??? COVERED | Schema Optimizer Agent |
| **TECHNICAL** |
| AI Crawler Detection | ??? COVERED | Phase 9 |
| AI Site Optimization | ??? MISSING | Scrunch's AXP generates AI-optimized version of entire site at CDN level. Nothing comparable in engineering plan. |
| Website AI Readiness Audit | ??? COVERED | AI Readiness Auditor Agent + free scan |
| LLMS.txt Support | ??? COVERED | LLMS.txt Generator Agent |
| **ATTRIBUTION** |
| Revenue Attribution | ??? PARTIAL | GA4 traffic detection only, no actual conversion/revenue tracking |
| E-Commerce Integration | ??? MISSING | No Shopify, no product-level tracking, no AI shopping optimization |
| AI Traffic Identification | ??? PARTIAL | GA4 referral domain detection planned, but no CDN-level direct identification like Writesonic/Scrunch |
| **INTEGRATIONS** |
| WordPress | ??? COVERED | Phase 7 |
| Slack | ??? COVERED | Phase 7 |
| GA4/GSC | ??? PARTIAL | GA4 specified, GSC listed but undesigned |
| Shopify | ??? MISSING | Not in engineering plan |
| Looker Studio | ??? MISSING | Not in engineering plan |
| API Access | ??? COVERED | Phase 10 |
| CDN Integration | ??? PARTIAL | Listed in Phase 9 (Vercel/Cloudflare) but only for crawler detection, not for site optimization |
| **REPORTING** |
| White-Label Reports | ??? MISSING | Not in engineering plan |
| Multi-Workspace/Agency | ??? MISSING | Not in engineering plan. Data model is single-user with businesses, no workspace/agency concept |
| YouTube/TikTok/Reddit | ??? MISSING | Not in engineering plan |
| Free Scan/Trial | ??? COVERED | Core feature |

---

## 2. System Gaps

### 2.1 Browser Simulation Infrastructure

**Competitive reality:** Peec AI and Rank Prompt use browser simulation (Playwright/Puppeteer) to capture actual front-end AI responses, which are more accurate than API calls because:
- API responses can differ from what real users see
- Some engines (Copilot, AI Overviews, AI Mode) have NO public API
- Browser simulation captures the full rendering including inline citations and formatting

**Engineering plan status:** API-first approach with browser simulation "deferred to Phase 2" for Copilot and AI Overviews. No Playwright infrastructure, no headless browser pool, no anti-bot evasion strategy.

**Gap severity: MEDIUM-HIGH.** The API-first approach is pragmatically correct for launch, but the plan needs a concrete Phase 2 spec for browser simulation. Currently it's a one-line deferral.

### 2.2 CDN-Level Site Optimization (AXP)

**Competitive reality:** Scrunch AI's Agent Experience Platform (AXP) sits at the CDN level (Akamai/Cloudflare/Vercel), intercepts AI bot requests, and serves an AI-optimized version of the entire site (98% code reduction, restructured for LLM consumption). Human visitors see the normal site.

**Engineering plan status:** Nothing comparable. The llms.txt agent and schema optimizer address individual files but not the concept of a parallel AI-optimized site rendering.

**Gap severity: LOW for MVP, HIGH for enterprise.** This is an advanced capability that could become a major differentiator. No immediate action needed but should be on the roadmap.

### 2.3 Proprietary Dataset / Prompt Volume Estimation

**Competitive reality:**
- Profound: 130M+ real user conversations (GDPR-compliant opt-in panel)
- Writesonic: 120M conversations
- Ahrefs: 190M+ prompts
- These power "prompt volume data" -- the equivalent of keyword volumes for AI search

**Engineering plan status:** Zero concept. No data aggregation, no volume estimation, no trending topics engine, no conversation analysis.

**Gap severity: HIGH.** Prompt volume data is the "keyword volume" of AI search. Without it, Beamix cannot answer "which AI queries have the most traffic for my industry?" This is the single largest data gap vs enterprise competitors.

**Mitigation path (not in plan):** Aggregate anonymized scan data across all Beamix users to build estimated prompt volume data. Even with 1K businesses scanning, cross-referencing which prompts produce mentions creates a lightweight volume proxy.

### 2.4 Multi-Region / Geographic Scanning

**Competitive reality:** Goodie AI, Peec AI, Profound, and Rank Prompt support multi-country, multi-language scanning. They run the same prompts from different geographic locations (VPN/proxy) to capture location-specific AI responses.

**Engineering plan status:** Language support (EN/HE) is specified, but NO geographic proxy concept. All scans presumably run from a single location (Vercel's region). AI responses can vary significantly by geography.

**Gap severity: MEDIUM.** For Israeli SMB focus this is fine initially, but any expansion to "global simultaneously" (stated in brand brief) requires geographic scan distribution.

### 2.5 Content Pattern Analysis Engine

**Competitive reality:** Spotlight analyzes all data sources used by LLMs, discovers patterns in top-performing cited content (structure, format, tone, length), and uses those patterns to generate content with higher citation probability.

**Engineering plan status:** Agents generate content based on real-time research (Perplexity) and business context, but there is no systematic analysis of WHAT MAKES content get cited. No pattern extraction from top-cited pages.

**Gap severity: MEDIUM.** This would significantly improve agent output quality. Could be added as a step in the content agent pipeline: "Analyze top 5 cited pages for this topic -> extract structural patterns -> follow those patterns in generation."

---

## 3. Agent Gaps

### Engineering Plan Agents (12)

| # | Agent | Competitive Equivalent |
|---|-------|----------------------|
| A1 | Content Writer | Profound Agents, Writesonic Content Suite, Rank Prompt |
| A2 | Blog Writer | Bear AI Blog Agent, Gauge Content Engine, Goodie AEO Writer |
| A3 | Schema Optimizer | Goodie Optimization Hub, Rank Prompt Schema Recommendations |
| A4 | Recommendations | AthenaHQ Action Center, Writesonic GEO Action Center |
| A5 | FAQ Agent | Rank Prompt FAQ articles |
| A6 | Review Analyzer | No direct competitor equivalent (unique to Beamix) |
| A7 | Social Strategy | Writesonic social content |
| A8 | Competitor Intelligence | Gauge AI Analyst (competitive aspect) |
| A9 | Citation Builder | Bear AI PR Outreach |
| A10 | LLMS.txt Generator | Bear AI LLMS.txt Support |
| A11 | AI Readiness Auditor | RankScale AI Readiness Score, Otterly GEO Audit |
| A12 | Ask Beamix | Gauge AI Analyst (conversational aspect) |

### Missing Agent Capabilities

| Missing Capability | Which Competitor Has It | Priority | Description |
|--------------------|------------------------|----------|-------------|
| **Content Voice Training / Author Stamp** | Goodie AI | HIGH | Train on business's existing content to match their writing voice. Engineering plan mentions "Content Voice Training" in Phase 6 (7.2) as "Phase 3+" but it has NO pipeline specification, no model training approach, no data collection strategy. |
| **Content Pattern Analyzer** | Spotlight | MEDIUM | Analyze top-cited content in a niche to extract winning patterns (structure, length, tone, format). Feed patterns into content generation agents. |
| **Site Optimizer / AI-Ready Page Generator** | Scrunch AXP | LOW | Generate AI-optimized versions of existing pages. Different from content writer (which creates new content) -- this rewrites existing pages for LLM consumption. |
| **E-Commerce / Product Visibility Agent** | AthenaHQ, Writesonic, Goodie | LOW | Track and optimize product-level AI visibility in shopping contexts. |
| **Automated Content Refresh Agent** | Profound Workflows | MEDIUM | Schedule monthly/weekly audits of existing published content, flag stale content, auto-update. Engineering plan agents are one-shot; no concept of recurring agent execution on existing content. |
| **Multi-Format Content Agent** | Writesonic, Rank Prompt | MEDIUM | Generate comparison articles, ranked lists, location pages, case studies, product deep-dives as distinct typed outputs with specialized templates. Current agents produce generic articles/blogs. |

### Agent Architecture Gaps

1. **No agent workflow/chain concept.** Profound has "Workflows" -- trigger-based automation chains (visibility drop -> audit -> draft -> review -> publish). Engineering plan agents are individually triggered. No concept of automated multi-agent workflows triggered by events.

2. **No recurring agent execution.** All agents are one-shot. No concept of "re-run this agent monthly on all published content" for freshness/optimization. Profound and Goodie schedule recurring content audits.

3. **No editorial queue / review workflow.** Profound agents create drafts that go through a review queue before publishing. Engineering plan has content status tracking (Draft -> Ready for Review -> Published) but no multi-user review workflow, no approval gates, no team collaboration on content.

---

## 4. Dashboard/Analytics Gaps

### Essential Components (all competitors have these)

| Component | Status | Notes |
|-----------|--------|-------|
| Visibility Score | ??? COVERED | Gauge widget in Phase 3 (4.1) |
| Competitor Comparison | ??? COVERED | Phase 4 (5.1) |
| Time Trend Charts | ??? COVERED | 7d/30d/90d toggle in Phase 3 (4.1) |
| Per-Platform Breakdown | ??? COVERED | Per-Engine Grid in Phase 3 (4.1) |

### Advanced Components (top competitors only)

| Component | Status | Notes |
|-----------|--------|-------|
| Sentiment Scoring | ??? PARTIAL | Data captured but no dedicated sentiment dashboard component specified. No 0-100 scale. |
| Citation Source Tracking | ??? PARTIAL | Data exists in scan results but no "Citation Sources" dashboard view like Airefs/Profound |
| Prompt-Level Insights | ??? MISSING | No per-prompt performance view. Rankings view shows queries but not individual prompt-level breakdown with competitor logos (like Peec) |
| AI Crawler Feed | ??? COVERED | Phase 9 (10.3) dashboard widget spec |
| Revenue Attribution | ??? PARTIAL | GA4 referral tracking only, no revenue/conversion dashboard |
| Agent Activity Feed | ??? COVERED | Recent Agent Activity widget in Phase 3 (4.1) |
| Content Performance | ??? MISSING | No dashboard component showing how generated content impacts visibility over time. Gauge and Bear track whether published content improved AI visibility. |
| Opportunity Pipeline | ??? PARTIAL | Recommendations view exists (kanban/list in Phase 3) but no "Opportunity Pipeline" connecting content gaps -> recommended actions -> impact estimates like Profound/Gauge |

### Unique Dashboard Innovations

| Component | Status | Notes |
|-----------|--------|-------|
| Prompt Volume Data | ??? MISSING | No data source for this |
| Persona-Based Views | ??? MISSING | No persona concept in data model |
| Customer Journey Stage View | ??? MISSING | No funnel stage mapping |
| AI Readiness Score | ??? COVERED | Phase 8, integrated into free scan |
| Multi-Surface Tracking (YouTube/TikTok/Reddit) | ??? MISSING | Not in plan |
| Brand Reputation Score | ??? MISSING | No aggregate brand perception metric. Visibility score measures presence, not reputation quality. |

---

## 5. Integration Gaps

| Integration | Engineering Plan Status | Competitor Coverage | Gap Severity |
|-------------|----------------------|---------------------|-------------|
| WordPress | ??? COVERED (Phase 7) | 6 competitors | -- |
| Contentful | ??? MISSING | Profound only | LOW -- enterprise CMS |
| Sanity | ??? MISSING | Profound only | LOW -- enterprise CMS |
| Shopify | ??? MISSING | AthenaHQ | MEDIUM -- e-commerce is a growing segment |
| Webflow | ??? MISSING | AthenaHQ | LOW |
| GA4 | ??? COVERED (Phase 7) | 6 competitors | -- |
| Google Search Console | ??? LISTED BUT UNDESIGNED | 3 competitors | MEDIUM -- GSC data feeds prompt optimization |
| Google Looker Studio | ??? MISSING | 3 competitors (Otterly, SE Visible, Peec) | MEDIUM -- agency requirement |
| Slack | ??? COVERED (Phase 7) | 3 competitors | -- |
| Cloudflare (analytics) | ??? PARTIAL (Phase 9 only for crawler detection) | Profound, Writesonic, Scrunch | MEDIUM -- real CDN integration for AI traffic |
| Akamai | ??? MISSING | Profound, Scrunch | LOW -- enterprise CDN |
| AWS CloudFront | ??? MISSING | Profound | LOW |
| Gamma | ??? MISSING | Profound only | LOW -- niche |
| Reddit alerts | ??? MISSING | Airefs | LOW -- niche but growing |

### Critical Integration Gaps

1. **Google Search Console (GSC):** Listed in the integrations table schema but has zero implementation specification. GSC provides: keyword rankings, click-through rates, indexed pages, crawl data. This data could feed back into the scan engine for better prompt generation ("what keywords does this business already rank for in traditional search?"). 3 competitors offer this.

2. **Looker Studio connector:** 3 competitors offer this. For agency/power users who build custom dashboards, this is a table-stakes expectation. No spec in engineering plan.

3. **Shopify:** AthenaHQ, Writesonic, and Goodie all have e-commerce integrations. Product-level AI visibility tracking is a growing niche (ChatGPT Shopping). Zero e-commerce concept in engineering plan.

---

## 6. Critical Missing Items (Ranked by Competitive Importance)

### Tier 1: Competitively Necessary (should be in engineering plan)

| # | Missing Item | Competitive Pressure | Impact | Effort |
|---|-------------|---------------------|--------|--------|
| 1 | **Prompt Volume Data / Trending Topics** | Profound, Writesonic, Ahrefs, Gauge (4 competitors) | HIGH -- answers "which AI queries matter for my business?" Without this, users don't know which queries to track. | HIGH -- requires data aggregation infrastructure |
| 2 | **Content Performance Tracking** | Bear AI, Gauge, Goodie, Spotlight (4 competitors) | HIGH -- proves ROI of agents. "You published this article, and your ChatGPT visibility went from 0 to position 2." | MEDIUM -- correlate content_items publication dates with scan_results changes |
| 3 | **Content Voice Training** | Goodie AI "Author Stamp" | HIGH -- without this, all agent-generated content sounds generic AI. SMBs need it to match their brand voice. | MEDIUM -- fine-tune on existing website content + past edits |
| 4 | **Numeric Sentiment Scale (0-100)** | Peec, SE Visible, Goodie (3 competitors) | MEDIUM -- finer granularity for trend analysis. Enum values lose information. | LOW -- change parser output type |
| 5 | **Source-Level Citation Analytics View** | Airefs (key differentiator), Profound, Writesonic | MEDIUM -- "AI cites these exact URLs about you" is more actionable than "AI mentions you" | LOW -- data already captured, need UI + API |

### Tier 2: Differentiation Opportunity (should be planned)

| # | Missing Item | Competitive Pressure | Impact | Effort |
|---|-------------|---------------------|--------|--------|
| 6 | **Brand Narrative Analysis** | AthenaHQ ACE, Spotlight | MEDIUM -- understands WHY AI says what it says, not just WHAT | MEDIUM -- additional LLM analysis step in scan pipeline |
| 7 | **Agent Workflows / Event-Triggered Chains** | Profound Workflows | MEDIUM -- automates "visibility drop -> fix" without manual trigger | MEDIUM -- Inngest event chains (already has infrastructure) |
| 8 | **Content Pattern Analysis** | Spotlight | MEDIUM -- improves agent output quality by following citation-winning patterns | MEDIUM -- new analysis step in content pipeline |
| 9 | **Typed Content Templates (6+ types)** | Rank Prompt (6 types), Writesonic | MEDIUM -- comparison articles, location pages, case studies are distinct from generic "articles" | LOW -- template system for existing agents |
| 10 | **Google Search Console Integration** | AthenaHQ, Gauge, Goodie (3 competitors) | MEDIUM -- traditional search data improves AI search strategy | MEDIUM -- OAuth flow + data pull |

### Tier 3: Future Roadmap (nice to have)

| # | Missing Item | Competitive Pressure | Impact | Effort |
|---|-------------|---------------------|--------|--------|
| 11 | **Looker Studio Connector** | Otterly, SE Visible, Peec (3 competitors) | LOW-MEDIUM -- agency requirement | MEDIUM |
| 12 | **White-Label Agency Mode** | Otterly, Rank Prompt | LOW -- enterprise/agency only | HIGH |
| 13 | **Persona-Based Tracking** | Scrunch only | LOW -- single competitor | MEDIUM |
| 14 | **Customer Journey Stage Mapping** | Spotlight only | LOW -- single competitor | MEDIUM |
| 15 | **Multi-Surface Monitoring (YouTube/TikTok/Reddit)** | Ahrefs only | LOW -- orthogonal to core GEO | HIGH |
| 16 | **E-Commerce / Shopify Integration** | AthenaHQ, Writesonic, Goodie | LOW for SMB focus, MEDIUM if expanding to e-com | HIGH |
| 17 | **Browser Simulation Infrastructure (detailed spec)** | Peec, Rank Prompt | LOW for launch, HIGH for accuracy | HIGH |
| 18 | **CDN-Level Site Optimization (AXP-like)** | Scrunch only | LOW -- very advanced capability | VERY HIGH |
| 19 | **Brand Reputation Score** | Spotlight | LOW -- single competitor | LOW |
| 20 | **Recurring Agent Execution / Content Refresh** | Profound Workflows | MEDIUM -- keeps content fresh | MEDIUM |

---

## 7. Summary Assessment

### What the Engineering Plan Does Well

1. **Agent system is best-in-class by design.** 12 agents with Inngest step functions, cross-agent context sharing, credit hold/confirm/release pattern, QA gates -- this is more sophisticated than any single competitor's agent system.

2. **Scan engine architecture is solid.** Engine adapter pattern, rate limiting, LLM-assisted parsing, scoring algorithm -- well designed and extensible.

3. **Alert system is comprehensive.** 9 alert types, 3 channels, rules engine, deduplication -- matches or exceeds competitors.

4. **Background job infrastructure is well chosen.** Inngest with step functions gives retry, concurrency control, and observability without managing Redis/BullMQ.

5. **Security/RLS design is thorough.** Full RLS matrix, credential encryption, API key management with scopes.

### What the Engineering Plan Misses

1. **Data layer is thin compared to market leaders.** No prompt volume data, no content pattern analysis, no multi-region scanning. The plan builds great agents but feeds them limited intelligence.

2. **Analytics and attribution are underdeveloped.** Revenue attribution stops at referral domain detection. Content performance tracking is absent. These are how SMBs justify the $49/month spend.

3. **No agency/multi-workspace features.** The data model is single-user. Agencies managing 10+ SMB clients have no path forward.

4. **Content generation is untyped.** Agents produce "articles" and "blog posts" but competitors ship distinct templates for comparison articles, location pages, case studies, ranked lists, and product deep-dives.

5. **No concept of automated workflows.** Agents are individually triggered by users. Competitors offer event-driven chains: visibility drops -> automatic audit -> draft fix -> review queue -> publish.

### Recommended Engineering Plan Amendments

**Add to Phase 1 (Scan Engine):**
- Numeric sentiment scoring (0-100) in parser output
- Source-level citation analytics (dedicated data structure + API endpoint)
- Prompt auto-suggestion based on website content analysis

**Add to Phase 2 (Agents):**
- Content voice training pipeline specification (currently a one-liner)
- Content type template system (comparison, location, case study, list, FAQ, deep-dive)
- Recurring agent execution concept (monthly content refresh schedule)

**Add to Phase 3 (Dashboard):**
- Content performance tracking widget (publication -> visibility change correlation)
- Source-level citation view
- Brand narrative/reputation analysis view

**Add to Phase 6 (Content Engine):**
- Content impact tracking pipeline specification (currently just "Content Impact Tracking begins")
- Content performance dashboard component

**New Phase (or Phase 7 expansion): Agent Workflows**
- Event-triggered multi-agent chains
- "Visibility drop -> audit -> draft -> review -> publish" automation
- Scheduled recurring agent runs on existing content

**New Phase: Data Intelligence Layer**
- Prompt volume estimation from aggregated scan data
- Content pattern analysis engine
- Trending topics detection

---

> **Bottom line:** The engineering plan is a strong foundation. The agent execution system and scan engine are well-architected. The primary gaps are in data intelligence (prompt volumes, content patterns, narrative analysis), analytics/attribution (revenue tracking, content performance), and platform features for agencies/power users (white-label, multi-workspace, Looker Studio). Of the 30 items in the competitive blueprint's "perfect GEO platform" list, 16 are fully covered, 7 are partially covered, and 7 are missing entirely.
