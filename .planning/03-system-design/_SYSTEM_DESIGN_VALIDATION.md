# System Design Validation — Completeness Checklist

> **Author:** Rex (Research Analyst)
> **Date:** March 4, 2026
> **Purpose:** Ensure the rewritten system design closes every gap identified in `_GAP_ANALYSIS_CTO.md` and achieves competitive parity where needed
> **Sources:** `_GAP_ANALYSIS_CTO.md`, `COMPETITIVE_FEATURES_BLUEPRINT.md`, `_RESEARCH_SYNTHESIS.md`, `ENGINEERING_PLAN.md`, `BEAMIX_PRODUCT_SYSTEM.md`
> **Method:** Every item sourced to specific competitor evidence. No assumptions presented as facts.

---

## 1. Gap Closure Checklist

Every PARTIAL or MISSING item from the CTO gap analysis. The new system design must address each one.

### 1.1 PARTIAL Items (7 total)

---

#### GAP-P1: Multi-Engine Monitoring (10+ engines)

- **CTO Status:** PARTIAL
- **What was missing:** Only 7 engines in Phase 1. Browser simulation deferred with no concrete spec. Missing: Meta AI, AI Overviews (browser-only), Copilot, Mistral, Amazon Rufus.
- **What the new system design MUST include:**
  - Concrete engine adapter roadmap: Phase 1 (4 API engines), Phase 2 (8 engines with browser sim spec), Phase 3 (10+ all engines)
  - Playwright infrastructure specification (headless browser pool, anti-bot strategy, proxy rotation)
  - Per-engine adapter spec for browser-only engines (Copilot, AI Overviews, AI Mode)
- **Owning layer:** Architecture
- **Validation criteria:** The system design contains a named engine adapter for each of the 10+ engines listed in BEAMIX_PRODUCT_SYSTEM.md (ChatGPT, Gemini, Perplexity, Claude, Grok, Copilot, Google AI Overviews, AI Mode, Meta AI, DeepSeek), with method (API/browser) and phase assignment for each.

---

#### GAP-P2: Source-Level Citation Tracking

- **CTO Status:** PARTIAL
- **What was missing:** Citations extracted in parsing but no dedicated source-level UI component. No URL-level attribution dashboard.
- **What the new system design MUST include:**
  - Data model: `citation_sources` table or JSONB structure storing exact URLs, domains, and page titles AI cites
  - API endpoint: `GET /api/citations?business_id=X` returning source-level citation data
  - Dashboard component spec: citation sources view (inspired by Airefs)
- **Owning layer:** Architecture (data model + API), Product (dashboard component)
- **Validation criteria:** A dedicated citation tracking data structure exists, an API endpoint serves it, and a dashboard view displays "these specific URLs were cited instead of you."
- **Competitor reference:** Airefs (source-level URLs at $24/mo), Profound, Writesonic, RankPrompt

---

#### GAP-P3: Sentiment Scoring (0-100 scale)

- **CTO Status:** PARTIAL
- **What was missing:** Captured as enum ('positive'/'neutral'/'negative'), not as 0-100 numeric scale.
- **What the new system design MUST include:**
  - Parser output type change: `sentiment_score: number` (0-100) alongside `sentiment_label: 'positive' | 'neutral' | 'negative'`
  - Scoring methodology: LLM-based analysis using keywords (e.g., "reliable", "leading" = high; "problematic", "avoid" = low)
  - Dashboard display: per-engine sentiment score with trend over time
- **Owning layer:** Intelligence (scoring logic), Architecture (data model)
- **Validation criteria:** Scan results contain a numeric 0-100 sentiment score per engine per prompt. Dashboard shows sentiment trends.
- **Competitor reference:** Peec (0-100 scale), SE Visible, Goodie, AthenaHQ, Writesonic, Scrunch, Spotlight (7/15 competitors)

---

#### GAP-P4: Revenue Attribution (beyond referral detection)

- **CTO Status:** PARTIAL
- **What was missing:** GA4 integration covers referral domain detection only. No conversion/revenue tracking pipeline. No e-commerce integration.
- **What the new system design MUST include:**
  - GA4 deep integration: referral domain detection + event tracking (conversions, goals)
  - Attribution pipeline: AI visibility change --> traffic change --> conversion change correlation
  - Dashboard: "AI Impact" widget showing traffic and conversion trends from AI sources
  - Note: Revenue attribution (actual dollar values) deferred to Phase 4 with Shopify/e-commerce. Phase 2-3 focuses on traffic + conversion correlation.
- **Owning layer:** Architecture (GA4 integration), Product (attribution dashboard)
- **Validation criteria:** GA4 integration spec includes conversion/goal tracking, not just referral identification. Dashboard shows correlation between visibility changes and traffic/conversion changes.
- **Competitor reference:** AthenaHQ (Shopify + GA4 --> revenue), Goodie (AI sessions --> conversions --> revenue), Bear AI

---

#### GAP-P5: Content Type Variety

- **CTO Status:** PARTIAL
- **What was missing:** Agent output is generic "content" -- no typed templates. RankPrompt ships 6 distinct content types.
- **What the new system design MUST include:**
  - Content type template system with at least 6 types: (1) Comparison articles, (2) Ranked lists, (3) Location pages, (4) Case studies, (5) Product deep-dives, (6) FAQ pages
  - Each type has a distinct prompt template, output structure, and optimization strategy
  - Content type selection in agent launch UI
  - `content_type` field in content_items table
- **Owning layer:** Intelligence (prompt templates), Product (UI for type selection)
- **Validation criteria:** Agent system supports >= 6 named content types with distinct templates. Content library can filter by type.
- **Competitor reference:** RankPrompt (6 types at $29/mo), Writesonic (blogs, ads, social, landing pages)

---

#### GAP-P6: Multi-Language/Multi-Region

- **CTO Status:** PARTIAL
- **What was missing:** EN/HE prompt support exists, but no multi-region scanning concept (different geolocations), no per-country visibility breakdown.
- **What the new system design MUST include:**
  - Phase 1: Dual-language prompts (EN/HE) -- already designed
  - Phase 2: Multi-city scanning for Israel (Tel Aviv, Haifa, Jerusalem, Be'er Sheva) using location-aware prompts
  - Phase 3: Geographic proxy infrastructure for international scanning (VPN/proxy-based geolocation)
  - Data model: `scan_region` field in scan_results
- **Owning layer:** Architecture (proxy infrastructure), Intelligence (location-aware prompts)
- **Validation criteria:** System design includes a regional scanning concept with at least multi-city support for Israel in Phase 2 and international proxy scanning in Phase 3.
- **Competitor reference:** Goodie (multi-country), Peec (115+ languages, regional tracking), Profound (10 countries), RankPrompt (multi-region in all plans)

---

#### GAP-P7: GA4/GSC Integration Completeness

- **CTO Status:** PARTIAL
- **What was missing:** GA4 is designed. GSC is listed in schema but has ZERO implementation specification.
- **What the new system design MUST include:**
  - GSC integration spec: OAuth flow, data pull (keyword rankings, CTR, indexed pages, crawl data)
  - Data correlation: traditional search keywords --> AI prompt suggestions ("you rank #3 for 'best lawyer Tel Aviv' in Google -- track this as an AI prompt")
  - Phase assignment: GSC as Phase 3 (after GA4)
- **Owning layer:** Architecture (OAuth + data pipeline)
- **Validation criteria:** GSC integration has a concrete specification (not just a schema column), including OAuth flow and data mapping.
- **Competitor reference:** AthenaHQ, Gauge, Goodie (3/15 competitors offer GSC)

---

### 1.2 MISSING Items (7 total)

---

#### GAP-M1: Proprietary Prompt Volume Data / Trending Topics

- **CTO Status:** MISSING -- "the single largest data gap"
- **What was missing:** Zero concept of prompt volume estimation, trending topics, or conversation volume data.
- **What the new system design MUST include:**
  - **Aggregate data pipeline:** Anonymize and aggregate scan data across all Beamix users to build relative prompt volume estimates
  - **Trending topics detection:** Identify prompts with rising mention frequency across the platform
  - **Dashboard component:** "Trending in your industry" widget showing estimated prompt importance
  - **Privacy design:** All aggregation is anonymous -- no cross-user data leakage, no PII
  - **Scale threshold:** Feature becomes useful at ~500+ businesses scanning regularly. Until then, show curated industry prompt lists.
  - **Data model:** `prompt_analytics` table or materialized view aggregating prompt frequency across scans
- **Owning layer:** Intelligence (aggregation logic), Architecture (pipeline + data model), Product (dashboard widget)
- **Validation criteria:** System design includes a prompt volume estimation pipeline spec, privacy safeguards, and a dashboard display component.
- **Competitor reference:** Profound (130M real conversations -- unreachable for Beamix), Writesonic (120M), Ahrefs (190M prompts), Gauge (keyword-to-prompt mapping), Spotlight
- **Realistic note:** Beamix cannot match Profound's 130M conversation panel. The design should specify an honest "estimated relative volume" approach, not claim parity with proprietary datasets.

---

#### GAP-M2: Content Pattern Analysis Engine

- **CTO Status:** MISSING
- **What was missing:** No analysis of what structural/tonal patterns make top-cited content successful. Agents generate content based on research but do not learn from citation-winning patterns.
- **What the new system design MUST include:**
  - Analysis step in content agent pipeline: "Before generating, analyze top 5 cited pages for this topic"
  - Pattern extraction: structure (H2/H3 depth), length, tone, format, FAQ presence, citation density
  - Pattern application: feed extracted patterns into content generation prompts
  - Storage: `content_patterns` cache (per industry/topic, refreshed monthly)
- **Owning layer:** Intelligence
- **Validation criteria:** Content agent pipeline includes a pre-generation analysis step that examines top-cited content and extracts structural patterns. These patterns are injected into the generation prompt.
- **Competitor reference:** Spotlight (content pattern analysis is their key differentiator)

---

#### GAP-M3: Persona-Based Visibility Views

- **CTO Status:** MISSING
- **What was missing:** No persona concept in data model or dashboard. Different buyer personas see different AI responses.
- **What the new system design MUST include:**
  - This feature is correctly deferred to Phase 4 (enterprise). The system design should acknowledge it as a future capability and include the data model extensibility note (persona_id FK on tracked_queries).
  - NOT required for launch or growth phase.
- **Owning layer:** Product (future)
- **Validation criteria:** System design acknowledges persona tracking as a Phase 4 item and notes the extensibility approach (persona as a query dimension).
- **Competitor reference:** Scrunch (only 1/15 competitors has this)

---

#### GAP-M4: Customer Journey Stage Mapping

- **CTO Status:** MISSING
- **What was missing:** No funnel stage concept (awareness --> consideration --> decision).
- **What the new system design MUST include:**
  - Like GAP-M3, correctly deferred to Phase 4. System design should note it as future capability.
  - Lightweight implementation note: map prompts to journey stages via LLM classification (informational = awareness, comparative = consideration, transactional = decision).
- **Owning layer:** Intelligence (future)
- **Validation criteria:** System design acknowledges journey stage mapping as a future capability with a brief implementation approach.
- **Competitor reference:** Spotlight (only 1/15 competitors has this)

---

#### GAP-M5: Brand Narrative Analysis

- **CTO Status:** MISSING
- **What was missing:** No concept of analyzing WHY AI says what it says about a brand. Only tracks WHAT (mentions, position).
- **What the new system design MUST include:**
  - Phase 3 feature: add an LLM analysis step post-scan that summarizes the "brand narrative" -- what themes AI associates with this brand, what positioning AI assigns
  - Output: "AI perceives your brand as [X] because [Y]. Your competitors are positioned as [Z]."
  - Dashboard: "Brand Narrative" card showing AI perception summary
- **Owning layer:** Intelligence (LLM analysis), Product (dashboard component)
- **Validation criteria:** System design includes a brand narrative analysis concept, even if deferred to Phase 3.
- **Competitor reference:** AthenaHQ ACE (brand narrative analysis), Spotlight (brand reputation scoring) -- only 2/15 competitors

---

#### GAP-M6: Looker Studio Connector

- **CTO Status:** MISSING
- **What was missing:** Zero mention in original engineering plan. 3 competitors offer it.
- **What the new system design MUST include:**
  - Acknowledged in Phase 4 roadmap as an agency/enterprise feature
  - Implementation note: Looker Studio Community Connector using Google Apps Script pulling from Beamix Public API
  - Dependencies: requires Public API (Phase 4) to be built first
- **Owning layer:** Architecture (Phase 4)
- **Validation criteria:** Looker Studio connector appears in the Phase 4 roadmap with a brief implementation approach.
- **Competitor reference:** Otterly, SE Visible, Peec (3/15 competitors)

---

#### GAP-M7: White-Label Agency Mode

- **CTO Status:** MISSING
- **What was missing:** No multi-workspace concept, no custom branding on reports, no agency management.
- **What the new system design MUST include:**
  - Phase 4 feature: multi-workspace data model (workspaces table, workspace_members, workspace_businesses)
  - White-label reports: PDF export with custom branding (logo, colors, contact info)
  - Not required for launch. Correctly deferred.
- **Owning layer:** Product (Phase 4), Architecture (data model extensibility)
- **Validation criteria:** System design includes multi-workspace/agency as a Phase 4 item with data model notes.
- **Competitor reference:** Otterly (workspaces + white-label), RankPrompt (white-label reports)

---

### 1.3 Additional MISSING Items from Master Feature Matrix

These were identified in the CTO gap analysis master matrix but not in the top-7 MISSING list.

---

#### GAP-M8: AI Site Optimization (AXP-like)

- **CTO Status:** MISSING
- **What was missing:** No concept of generating an AI-optimized version of a site.
- **Required:** Deferred correctly. Phase 4+ or skip entirely. Only Scrunch (1/15) has this.
- **Owning layer:** Architecture (future)
- **Validation criteria:** Acknowledged as future/skip with reasoning. Not required for any phase before Phase 4.

---

#### GAP-M9: E-Commerce / Shopify Integration

- **CTO Status:** MISSING
- **What was missing:** No product-level AI visibility tracking. No Shopify integration.
- **Required:** Phase 4 or skip. AthenaHQ is the only competitor with Shopify. Beamix targets service SMBs, not e-commerce.
- **Owning layer:** Architecture (future)
- **Validation criteria:** Acknowledged as Phase 4 with note that target persona is service SMBs.

---

#### GAP-M10: Multi-Surface Monitoring (YouTube/TikTok/Reddit)

- **CTO Status:** MISSING
- **What was missing:** Only Ahrefs has this. Orthogonal to core GEO value proposition.
- **Required:** Skip. Only 1/15 competitors. Outside core value prop.
- **Validation criteria:** Explicitly listed as "Skip" with reasoning.

---

#### GAP-M11: Agent Workflows / Event-Triggered Chains

- **CTO Status:** Identified in Section 3 (Agent Architecture Gaps)
- **What was missing:** All agents are individually triggered. No concept of automated multi-agent workflows (e.g., visibility drop --> audit --> draft --> review --> publish).
- **What the new system design MUST include:**
  - Event-driven workflow system using Inngest event chains (infrastructure already exists)
  - At least 3 built-in workflow templates: (1) Visibility drop --> auto-audit, (2) New scan --> recommendations --> agent suggestion, (3) Content published --> track impact --> re-scan
  - Custom workflow builder: Phase 3
- **Owning layer:** Architecture (Inngest event chains), Product (workflow UI)
- **Validation criteria:** System design specifies at least 2-3 event-triggered automation workflows using Inngest. Not all agents manual.
- **Competitor reference:** Profound Workflows (trigger-based automation chains)

---

#### GAP-M12: Recurring Agent Execution / Content Refresh

- **CTO Status:** Identified in Section 3 (Agent Architecture Gaps)
- **What was missing:** All agents are one-shot. No concept of "re-run this agent monthly on all published content."
- **What the new system design MUST include:**
  - Recurring agent execution concept: schedule agent re-runs on published content
  - Content freshness scoring: flag stale content for re-optimization
  - Implementation: Inngest cron-triggered agent runs with content library as input
- **Owning layer:** Intelligence (freshness scoring), Architecture (cron scheduling)
- **Validation criteria:** System design includes a recurring agent execution concept with scheduling.
- **Competitor reference:** Profound (scheduled monthly/weekly content audits), Goodie (content refresh)

---

#### GAP-M13: Content Performance Tracking

- **CTO Status:** MISSING from dashboard
- **What was missing:** No dashboard showing how generated content impacts visibility over time.
- **What the new system design MUST include:**
  - Content impact correlation: link `content_items.published_at` to `scan_results` changes after publication
  - Dashboard widget: "Content Impact" showing visibility delta after each content publication
  - Closes the loop: scan --> agent creates content --> content published --> visibility changes tracked
- **Owning layer:** Product (dashboard widget), Architecture (correlation query)
- **Validation criteria:** A content performance tracking concept exists that correlates content publication dates with subsequent visibility changes.
- **Competitor reference:** Bear AI, Gauge, Goodie, Spotlight (4/15 competitors)

---

#### GAP-M14: Content Voice Training

- **CTO Status:** Listed as PARTIAL (one-liner in Phase 6, no specification)
- **What was missing:** Zero pipeline specification, no data collection strategy, no training approach.
- **What the new system design MUST include:**
  - Voice sample collection: user pastes 2-3 existing website pages or blog posts during onboarding or settings
  - Voice extraction: LLM analyzes samples for tone, vocabulary, sentence structure, formality level
  - Voice profile storage: `brand_voice_profiles` table with extracted characteristics
  - Injection: voice profile injected into all content agent system prompts
  - Phase assignment: Phase 3 (not MVP)
- **Owning layer:** Intelligence (voice extraction + injection), Product (voice sample UI)
- **Validation criteria:** Content voice training has a concrete pipeline: sample collection --> extraction --> storage --> injection. Not just a one-liner.
- **Competitor reference:** Goodie AI "Author Stamp" (trains voice into content output)

---

## 2. Competitive Feature Parity Matrix

Every feature from the competitive blueprint, assessed for Beamix inclusion.

### MONITORING

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| Brand Mention Tracking | 15/15 | Yes -- P0 | Table stakes. Already built. |
| Daily Auto Monitoring | 13/15 | Yes -- P0 | Table stakes. Inngest cron already designed. |
| Multi-Engine (4+ engines) | 15/15 | Yes -- P0 | 4 at launch, 8+ by Phase 2, 10+ Phase 3. |
| Prompt Volume Data | 5/15 (Profound, Writesonic, Ahrefs, Gauge, Spotlight) | Yes -- Phase 3 | Cannot match proprietary datasets, but aggregate estimation is competitively necessary for query prioritization. |
| Prompt Auto-Suggestions | 3/15 (Peec, SE Visible, Gauge) | Yes -- Growth Phase | Nice-to-have, not launch-blocking. Auto-suggest based on industry + website content. |
| Near Real-Time Monitoring | 1/15 (RankPrompt: 15-30 min) | No -- Skip | Resource-intensive. Daily/3-day scans sufficient for SMBs. Not worth the infrastructure cost. |

### ANALYSIS

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| Sentiment Analysis (0-100) | 7/15 | Yes -- P1 | Nearly half of competitors have this. Finer granularity drives urgency and trend analysis. Low effort change. |
| Citation/Source Tracking | 11/15 | Yes -- P1 | Widely available. Data already captured; needs dedicated UI. |
| Source-Level URLs | 2/15 (Airefs, RankPrompt) | Yes -- P2 | Highly actionable: "this exact article is cited instead of you." Differentiating at SMB price. |
| Share of Voice | 14/15 | Yes -- P0 | Table stakes. Already designed in Phase 4. |
| Competitor Benchmarking | 15/15 | Yes -- P0 | Table stakes. Already designed. |
| Regional/Multi-Language | 5/15 (Profound, Goodie, Peec, Airefs, RankPrompt) | Yes -- Phase 2 | Essential for Hebrew-first positioning and Israeli multi-city tracking. |
| Brand Narrative Analysis | 2/15 (AthenaHQ ACE, Spotlight) | Yes -- Phase 3 | Differentiating intelligence. Adds "why" to "what." Only 2 competitors, both expensive. |
| Persona-Based Tracking | 1/15 (Scrunch) | No -- Phase 4 | Only one competitor. Data Model CLOSED — Pipeline Integration DEFERRED. `personas` table exists. Scan pipeline does not query or use personas at launch. Full integration is Phase 4. |
| Customer Journey Stages | 1/15 (Spotlight) | No -- Phase 4 | Only one competitor. SPEC ONLY — Phase 4 Implementation. Data model and classification logic fully designed in Intelligence Layer. Pipeline integration deferred to Phase 4. No `journey_stage` column on `scan_results` at launch. |

### CONTENT & AGENTS

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| Content Generation | 7/15 (Profound, Gauge, Writesonic, Bear, Goodie, Spotlight, RankPrompt) | Yes -- P0 | Core differentiator. Already built. |
| AI Agents (Autonomous) | 3/15 (Profound, Bear, Gauge) | Yes -- P0 | Beamix's #1 competitive advantage. Most comprehensive interactive autonomous agent suite with streaming chat UX under $100/month. (Note: Verify RankPrompt current pricing — as of research date they offered content generation + WP publishing at $29/month. Beamix differentiator is interactive streaming agent chat + multi-agent workflows, not just content generation.) |
| CMS Auto-Publish (WordPress) | 6/15 | Yes -- Pro tier (Phase 2) | High impact. Eliminates copy-paste friction. 40%+ of websites are WordPress. Gated to Pro tier (not Business). |
| PR/Outreach Automation | 1/15 (Bear AI) | Yes -- Phase 3 | High SMB value (can't afford PR agencies). Citation Builder agent already designed. |
| Content Type Variety (6+) | 2/15 (RankPrompt: 6 types, Writesonic: blogs/ads/social/landing) | Yes -- Phase 3 | RankPrompt offers this at $29. Must match at $49. |
| Content Voice Training | 1/15 (Goodie: Author Stamp) | Yes -- Phase 3 | Prevents generic-sounding output. High perceived value. |
| Content Pattern Analysis | 1/15 (Spotlight) | Yes -- Phase 3 | Improves agent output quality. Competitive intelligence applied to content structure. |
| Schema Recommendations | 2/15 (Goodie, RankPrompt) | Yes -- P0 | Already built (Schema Optimizer agent). |
| LLMS.txt Support | 1/15 (Bear AI) | Yes -- P1 | Already designed. Low effort, high perceived value. |
| Agent Workflows | 1/15 (Profound) | Yes -- Phase 3 | Event-triggered chains are a natural extension of Inngest architecture. |
| Recurring Agent Execution | 2/15 (Profound, Goodie) | Yes -- Phase 3 | Content freshness matters. Scheduled re-optimization. |
| Editorial Queue / Review | 1/15 (Profound) | MVP: Self-Review Queue | MVP: single-user approve/reject via `in_review` status. Multi-person editorial deferred to agency tier (Phase 4). |

### TECHNICAL

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| AI Crawler Detection | 3/15 (Writesonic, Scrunch, AthenaHQ) | Yes -- Phase 3 | Already designed in Phase 9. Good "wow factor" dashboard feature. |
| AI Site Optimization (AXP) | 1/15 (Scrunch) | No -- Skip | Only one competitor. Extremely complex CDN-level infrastructure. Not SMB-relevant. |
| Website AI Readiness Audit | 4/15 (RankScale, Otterly, Scrunch, RankPrompt) | Yes -- P0 | Perfect for free scan. Already designed. |
| Content Comparison (orig vs optimized) | 1/15 (RankScale) | No -- Future | Nice-to-have. Not competitively necessary. |

### ATTRIBUTION

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| Revenue Attribution | 3/15 (AthenaHQ, Goodie, Bear) | Phase 3 (traffic correlation) / Phase 4 (revenue) | SMBs need to see ROI. Start with traffic correlation (GA4), add revenue in Phase 4. |
| E-Commerce Integration | 3/15 (AthenaHQ, Writesonic, Goodie) | No -- Phase 4 | Target is service SMBs, not e-commerce. Defer. |
| AI Traffic Identification | 4/15 (AthenaHQ, Writesonic, Bear, Scrunch) | Yes -- Phase 3 | Part of AI Crawler Detection. Shows AI bot visits. |

### INTEGRATIONS

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| WordPress | 6/15 | Yes -- Pro tier (Phase 2) | Most important CMS integration. High demand. Moved from Business to Pro tier — 6 competitors offer it at lower tiers. |
| GA4 | 6/15 | Yes -- Phase 2 | Proves ROI. Widely expected. |
| GSC | 3/15 (AthenaHQ, Gauge, Goodie) | Yes -- Phase 3 | Enriches data. Keyword-to-prompt correlation. |
| Slack | 3/15 (Profound, AthenaHQ, Gauge) | Yes -- Phase 2 | Low effort. Pro+ feature. |
| Shopify | 1/15 (AthenaHQ) | No -- Phase 4 | Only one competitor. Niche. |
| Looker Studio | 3/15 (Otterly, SE Visible, Peec) | No -- Phase 4 | Agency feature. Not core SMB. |
| API Access | 3/15 (Profound, Peec, Airefs) | Yes -- Phase 4 | Business tier. Already designed in Phase 10. |
| Contentful/Sanity | 1/15 (Profound) | No -- Skip | Enterprise headless CMS. Not our market. |
| Webflow | 1/15 (AthenaHQ) | No -- Skip | Low demand. Only one competitor. |
| CDN (Cloudflare/Vercel) | 3/15 | Yes -- Phase 3 | For crawler detection. Already designed in Phase 9. |

### REPORTING

| Feature | Competitors | Required? | Justification |
|---------|-------------|-----------|---------------|
| White-Label Reports | 2/15 (Otterly, RankPrompt) | No -- Phase 4 | Agency feature. Not MVP. |
| Multi-Workspace/Agency | 3/15 (Profound, Otterly, RankPrompt) | No -- Phase 4 | Requires data model changes. Defer to enterprise. |
| YouTube/TikTok/Reddit Tracking | 2/15 (Ahrefs, Airefs-Reddit only) | No -- Skip | Outside core GEO. Ahrefs has infrastructure Beamix cannot match. |
| Free Scan/Trial | 3/15 (Otterly trial, Airefs trial, RankPrompt credits) | Yes -- P0 | Beamix's instant free scan is the strongest version in the market. Already built. |
| PDF/CSV Export | 5/15 | Yes -- Phase 2 | Business tier. Standard expectation. |

---

## 3. Missing Connections

Cross-cutting concerns and data flows that require coordination between agents writing independently.

### 3.1 Data Flows That Cross Layers

| Flow | From | To | Risk If Missed |
|------|------|----|---------------|
| **Scan results --> Recommendations --> Agent triggers** | Architecture (scan pipeline) | Intelligence (recommendation logic) --> Product (agent launch UI) | Without this end-to-end flow, scan results are dead data. The "scan-to-fix pipeline" breaks. |
| **Content publication --> Visibility tracking --> Content performance** | Product (content library publish action) | Architecture (correlate content_items.published_at with subsequent scan_results) --> Product (content impact widget) | Without this, users cannot see ROI of agent-generated content. #1 cause of churn: "I paid for content but don't know if it helped." |
| **Agent output --> Content library --> WordPress publish** | Intelligence (agent generates content) | Product (content library stores it) --> Architecture (WordPress API integration pushes it) | If content lives only in agent chat output, the library is empty. If library doesn't connect to WordPress, manual copy-paste remains. |
| **GA4 traffic data --> Attribution dashboard --> Upgrade triggers** | Architecture (GA4 OAuth + data pull) | Product (attribution widget) --> Product (upgrade prompt when ROI proven) | GA4 data without an attribution display is wasted integration effort. |
| **Prompt volume aggregation --> Trending topics --> Prompt auto-suggestions** | Intelligence (aggregate pipeline) | Product (trending widget) --> Product (onboarding prompt suggestions) | These three features are interconnected. Prompt suggestions should factor in volume data when available. |
| **Voice training samples --> Voice profile --> Content agent prompts** | Product (settings UI for voice samples) | Intelligence (voice extraction) --> Intelligence (all content agent system prompts) | If voice profile is not injected into EVERY content agent, some agents produce brand-voiced content and others produce generic content. Inconsistency. |
| **Competitor scan data --> Share of Voice --> Gap Analysis --> Agent recommendations** | Architecture (competitor monitoring) | Product (SoV chart) --> Product (gap analysis view) --> Intelligence (recommendations agent) | Competitor data must flow through all three display layers AND into the recommendations engine. |

### 3.2 Features Requiring Cross-Layer Coordination

| Feature | Product Layer | Architecture Layer | Intelligence Layer | Coordination Note |
|---------|-------------|-------------------|-------------------|-------------------|
| **Content Performance Tracking** | Dashboard widget showing impact | Correlation query joining content_items + scan_results by date | None | Product needs to specify the time window for correlation (e.g., "compare visibility 7 days before and after publication"). Architecture needs the query. |
| **Agent Workflows** | Workflow templates UI, workflow builder (Phase 3) | Inngest event chain definitions, workflow state machine | Workflow triggers based on intelligence signals (visibility drop threshold) | The trigger conditions are intelligence decisions. The execution pipeline is architecture. The display is product. All three must align on the event schema. |
| **Prompt Volume Estimation** | "Trending" widget, prompt suggestion enhancement | Aggregation pipeline, privacy-safe materialized views | Statistical estimation methodology | Intelligence defines the estimation algorithm. Architecture builds the pipeline. Product displays it. The privacy model (no cross-user leakage) must be agreed. |
| **Brand Narrative Analysis** | "Brand Narrative" dashboard card | LLM call within scan pipeline (additional post-processing step) | Prompt engineering for narrative extraction | This is an additional LLM call per scan. Architecture owns the cost impact calculation. Intelligence owns the prompt. Product owns the display. |
| **Multi-Region Scanning** | Region selector in scan setup, per-region dashboard filter | Proxy infrastructure, scan_region field in data model | Location-aware prompt generation | Prompts change per region ("best lawyer Tel Aviv" vs "best lawyer Haifa"). Intelligence must generate region-specific prompts. Architecture must route scans through region-appropriate infrastructure. |

### 3.3 Edge Cases in User Journeys

| Journey | Edge Case | Which Layers Must Handle It |
|---------|-----------|---------------------------|
| **Free scan --> signup --> onboarding** | User scans, sees results, signs up 3 days later. Scan results must still be linkable to their new account. | Architecture (free_scans.scan_id must remain valid for 30 days), Product (onboarding must detect scan_id param and skip re-scan) |
| **Agent generates content --> user edits --> republishes** | User modifies agent output in content library editor. Voice training must NOT overwrite user edits on re-generation. | Product (editor must save user version separately), Intelligence (re-generation should offer "update" not "replace") |
| **Visibility drops --> automated workflow triggers --> user is on free tier** | Workflow triggers agent, but free tier has no agent uses. System must not burn credits the user doesn't have. | Architecture (workflow pre-checks credit balance before triggering), Product (notify user: "visibility dropped, upgrade to auto-fix") |
| **Competitor is also a Beamix user** | User A tracks User B as competitor. User B tracks User A. Neither should see each other's dashboard data. | Architecture (RLS ensures competitor tracking reads only public scan data, never dashboard data) |
| **Content published to WordPress fails** | WordPress credentials expired or site is down. Content must not be marked as "published" if the push failed. | Architecture (WordPress adapter returns success/failure), Product (content status remains "Draft" on failure with retry option) |
| **Multiple agents running simultaneously** | User launches Blog Writer while Content Writer is still running. Credit holds must not double-charge. | Architecture (credit hold is per-job, not per-user-session. Each job independently holds/confirms/releases.) |

### 3.4 Integration Points Between Modules

| Module A | Module B | Integration Point | Risk |
|----------|----------|-------------------|------|
| Scan Engine | Agent System | Scan results as agent context | Agents must always receive the LATEST scan data, not stale cached data. |
| Agent System | Content Library | Agent output storage | Content must be stored in content_items immediately on agent completion, not only when user "saves." |
| Content Library | WordPress Integration | Content push | Content format (Markdown) must be compatible with WordPress block editor. Test with real WordPress instances. |
| Alert System | Agent Workflows | Visibility alerts triggering workflows | Alert deduplication must prevent workflow spam (don't trigger 5 workflows for 5 alert notifications about the same event). |
| Billing (Paddle) | Agent System | Credit enforcement | Paddle webhook delays can cause billing state desync. Use local credit tracking, not Paddle API for real-time credit checks. |
| GA4 Integration | Dashboard | Traffic attribution display | GA4 data has 24-48hr latency. Dashboard must show "data as of [date]" not imply real-time. |

---

## 4. Innovation Opportunities

8 features uniquely combined in Beamix — 5 genuinely novel, 3 with the most comprehensive implementation in the market. Ranked by feasibility and SMB value.

### Innovation 1: "Fix It" Button — One-Click Agent Trigger from Any Gap

**What it is:** Every dashboard view where a problem is identified (gap analysis, low sentiment, missing citation, competitor outranking) has a contextual "Fix It" button that launches the appropriate agent with pre-loaded context.

**Partial competitor equivalents:** Gauge's AI Analyst executes strategy from insights. AthenaHQ's Action Center drafts optimizations. However, neither integrates the trigger directly into every dashboard insight view with pre-loaded agent context — Beamix's implementation is the most comprehensive.

**Why Beamix can build it:** Agent system + dashboard are built by the same team in the same codebase. Cross-agent context sharing is already designed. Technical cost: routing logic to map gap type --> agent type.

**SMB value:** HIGH. Non-technical users see a problem and click one button to fix it. Eliminates "I see the problem, now what?" paralysis.

**Effort:** LOW. UI routing + context pre-loading. No new backend needed.

---

### Innovation 2: Agent Impact Scorecard — Prove ROI Per Agent Execution

**What it is:** After each agent creates content and it's published, Beamix tracks the visibility change and shows: "This blog post improved your ChatGPT visibility by +12 points."

**Partial competitor equivalents:** Bear AI tracks blog agent output performance. Gauge tracks content performance generally. However, neither attributes specific visibility changes to specific agent outputs at the per-content-piece level — Beamix provides the most granular attribution.

**Why Beamix can build it:** scan_results + content_items + timestamp correlation. Data already exists; needs a correlation query and display.

**SMB value:** VERY HIGH. Answers "was this $49/mo worth it?" with concrete data.

**Effort:** MEDIUM. Requires correlation logic accounting for confounding variables (other factors that changed visibility).

---

### Innovation 3: Hebrew Prompt Library — Industry-Specific AI Prompt Templates in Hebrew

**What it is:** Pre-built Hebrew prompt templates for Israeli industries (lawyers, restaurants, insurance, real estate, medical clinics, accountants). "מה הביטוח הכי טוב בתל אביב?" not just English translations.

**Why no competitor has it:** Zero competitors serve Hebrew. All prompt suggestions are English-only.

**Why Beamix can build it:** Hebrew-first positioning. Cultural knowledge of Israeli business landscape. Can be curated manually for launch (50-100 prompts across 10 industries), then expanded via AI.

**SMB value:** VERY HIGH for Israeli market. Removes the biggest friction: "what prompts should I track?"

**Effort:** LOW. Curated content, not engineering. Store in `prompt_templates` table.

---

### Innovation 4: Competitor Weakness Alerts — "Your Competitor Just Lost Visibility"

**What it is:** When a tracked competitor's AI visibility drops, Beamix alerts the user with a specific recommendation: "Your competitor dropped from #2 to #5 in ChatGPT for 'best insurance Tel Aviv.' This is your window. Run [Agent] to create content for this gap."

**Why no competitor has it:** Competitors track competitor visibility but don't alert on competitor DROPS as opportunities. All alerts are about YOUR changes, not theirs.

**Why Beamix can build it:** Already tracking competitor scan data. Already have alert system. Add a "competitor drop" alert type.

**SMB value:** HIGH. Turns competitor monitoring from passive to actionable.

**Effort:** LOW. New alert rule in existing alert engine.

---

### Innovation 5: AI Readiness Progress Tracker — Gamified Improvement Score

**What it is:** Track AI Readiness Score (0-100%) over time with a progress bar and achievement milestones. "You improved from 34% to 67% this month. Next milestone: 75% (add FAQ schema)."

**Why no competitor has it:** RankScale has the readiness score but no progress tracking or gamification. Score is a snapshot, not a journey.

**Why Beamix can build it:** AI Readiness Auditor already designed. Store historical scores. Add milestone definitions.

**SMB value:** HIGH. Gamification drives engagement. "Level up" psychology keeps users active.

**Effort:** LOW. Historical score storage + milestone definitions + progress bar UI.

---

### Innovation 6: Cross-Agent Memory — Agents That Remember Previous Conversations

**What it is:** When a user launches the Blog Writer for the second time, the agent remembers what it wrote before: "Last time I wrote about topic X. Want me to cover a related topic, or update the previous article?"

**Why no competitor has it:** All competitor agents treat each execution as independent. No session memory across runs.

**Why Beamix can build it:** Content library already stores all agent outputs. Inject previous outputs into agent context window. Cross-agent context sharing is already designed.

**SMB value:** HIGH. Prevents duplicate content. Creates a coherent content strategy over time.

**Effort:** MEDIUM. Context window management (previous outputs can be large -- need summarization).

---

### Innovation 7: "What Changed" Weekly Diff Report

**What it is:** Weekly email/dashboard showing a precise diff: "This week: +3 new mentions in ChatGPT, -1 mention in Perplexity. Competitor X gained 2 new citations from [URL]. Your blog post from Tuesday was cited for the first time by Gemini."

**Partial competitor equivalents:** Otterly generates reports with historical data. SE Visible has historical trend analysis. However, neither provides per-query, per-engine diffs with competitor context and content attribution at the granularity Beamix offers.

**Why Beamix can build it:** All data exists in scan_results, content_items, competitor tracking. Diff computation is a query.

**SMB value:** HIGH. SMBs don't log in daily. A precise weekly diff keeps them engaged and informed without dashboard fatigue.

**Effort:** MEDIUM. Diff computation + email template.

---

### Innovation 8: Agent Suggestion Engine — "You Should Run This Agent"

**What it is:** Based on scan results, proactively suggest which agent the user should run next. "Your FAQ content is weak (cited 0 times). Run the FAQ Agent to create optimized FAQ content. Estimated impact: +8 visibility points."

**Why no competitor has it:** Recommendations agents suggest actions, but don't estimate impact or connect directly to agent launches with pre-filled context.

**Why Beamix can build it:** Recommendations agent already generates prioritized actions. Add impact estimation based on historical data (users who ran FAQ agent after similar gaps saw X% improvement).

**SMB value:** VERY HIGH. Answers "which agent should I use?" -- the #1 question new users have.

**Effort:** MEDIUM. Impact estimation requires sufficient historical data. Start with heuristic estimates, improve with real data.

---

## 5. Priority Classification

Every feature and system component classified.

### LAUNCH CRITICAL (Day-1 Requirements)

Must ship for the product to be viable at all. Without these, there is no product.

| Feature | Justification |
|---------|---------------|
| **Real Scan Engine (4 API engines)** | Currently mock. Nothing works without real scans. |
| **Real Agent Execution (Content Writer, Blog Writer, Schema Optimizer, Recommendations)** | Core differentiator. Currently mock. |
| **Dashboard with Real Data** | Currently wired to mock. Must display real scan results. |
| **Visibility Score (0-100)** | Central metric. Every competitor has it. |
| **Per-Engine Breakdown** | 15/15 competitors show this. Table stakes. |
| **Competitor Comparison** | 15/15 competitors have it. Essential context. |
| **Share of Voice** | 14/15 competitors. Table stakes. |
| **Time Trend Charts (7d/30d/90d)** | 15/15 competitors. Table stakes. |
| **Free Scan with AI Readiness Score** | Primary acquisition channel. Already designed. Must work with real data. |
| **Scheduled Scans (daily/3-day/weekly by tier)** | 13/15 competitors have daily auto-monitoring. Manual-only is not competitive. |
| **Recommendations Feed** | Bridges monitoring and action. Without it, dashboard is passive. |
| **Content Library** | Stores all agent outputs. Without it, content is lost after generation. |
| **Agent Hub** | Central agent management. Core UX for agent-first product. |
| **Paddle Billing (working)** | Already built. Must be verified and wired to real subscription data. |
| **LLMS.txt Generator Agent** | Low effort, high perceived value. Only Bear AI has it. |
| **Prompt Auto-Suggestions** | Reduces onboarding friction. 3/15 competitors. Critical for non-technical SMBs. |
| **Inngest Background Jobs** | Scans and agents cannot run synchronously. Already designed. |
| **RLS Security** | Non-negotiable. Already designed. |

### GROWTH PHASE (Within 3 Months of Launch)

Needed for retention, competitive parity, and preventing early churn.

| Feature | Justification |
|---------|---------------|
| **Sentiment Scoring (0-100)** | 7/15 competitors. Low effort to add. Drives urgency. |
| **Source-Level Citation Tracking** | Highly actionable. Transforms "invisible" into "this URL beats you." |
| **FAQ Agent** | Low-effort agent addition. Completes basic agent set. |
| **Review Analyzer Agent** | Pro tier unlock. Differentiation at SMB price. |
| **Social Strategy Agent** | Pro tier unlock. Content calendar is high perceived value. |
| **WordPress Integration (Pro tier)** | 6/15 competitors. Eliminates copy-paste friction. Moved from Business to Pro tier. |
| **GA4 Integration** | 6/15 competitors. Proves ROI. Reduces churn. |
| **Slack Integration** | 3/15 competitors. Low effort. |
| **"Ask Beamix" Chat** | Reuses existing chat infrastructure. Gauge's differentiator brought to SMB price. |
| **Visibility Drop Alerts (email)** | 13/15 competitors have alerts. Retention mechanism. |
| **Weekly Digest Email** | Keeps non-daily-login users engaged. |
| **Content Performance Tracking** | Proves agent ROI. "This blog post improved your visibility by +12." |
| **PDF/CSV Export** | Business tier. Standard expectation. |
| **Gap Analysis Dashboard** | Shows WHERE brand is missing. Connects to agent triggers. |
| **"Fix It" Buttons (Innovation 1)** | One-click agent launch from any gap. Low effort, high impact UX. |

### MOAT BUILDERS (3-6 Months Post-Launch)

Features that create competitive defensibility and lock-in.

| Feature | Justification |
|---------|---------------|
| **Content Voice Training** | Prevents generic output. Lock-in: voice profile is effort to recreate elsewhere. |
| **6+ Content Types** | Matches RankPrompt at $49. Comparison articles, location pages, case studies. |
| **Content Pattern Analysis** | Improves agent quality. Spotlight's unique feature at SMB price. |
| **Agent Workflows (event-triggered)** | "Visibility drop --> auto-fix." Reduces manual work. Profound's feature at SMB price. |
| **Recurring Agent Execution** | Content freshness. Scheduled re-optimization. |
| **Brand Narrative Analysis** | "Why AI says what it says." Only AthenaHQ and Spotlight have this. |
| **Browser Simulation (Phase 2 engines)** | Grok, Copilot, AI Overviews, AI Mode. Expands to 8+ engines. |
| **Competitor Intelligence Agent** | Business tier. Deep competitive analysis. |
| **Citation Builder Agent** | Bear AI's PR outreach concept at $49. |
| **AI Readiness Auditor (full)** | Deep site audit. Extends free scan value. |
| **Multi-City Hebrew Scanning** | Tel Aviv, Haifa, Jerusalem, Be'er Sheva. Hebrew market moat. |
| **Google Search Console Integration** | Keyword data feeds AI prompt optimization. |
| **Prompt Volume Estimation** | Aggregate data from Beamix users. Gets better with scale. |
| **Hebrew Prompt Library (Innovation 3)** | Curated industry prompts. Zero competition. |
| **Competitor Weakness Alerts (Innovation 4)** | Actionable competitor intelligence. Unique. |
| **Cross-Agent Memory (Innovation 6)** | Agents remember previous work. Compounding value. |
| **Agent Impact Scorecard (Innovation 2)** | Per-content ROI proof. Differentiating. |
| **"What Changed" Weekly Diff (Innovation 7)** | Granular weekly report. Better than competitor digests. |
| **CDN AI Crawler Detection** | Phase 9. Writesonic/Scrunch feature. Dashboard wow-factor. |
| **Revenue Attribution (traffic correlation)** | GA4-based traffic-to-conversion correlation. |

### SKIP (Intentionally Not Building)

Features competitors have that Beamix should NOT build. Each with reasoning.

| Feature | Competitor(s) | Why Skip |
|---------|---------------|----------|
| **Near Real-Time Monitoring (15-30 min)** | RankPrompt | Resource-intensive. Daily scans are sufficient for SMBs. The cost of scanning every 15 minutes does not justify the marginal value. Even Peec and Otterly do daily, not real-time. |
| **AI Site Optimization (AXP)** | Scrunch | CDN-level middleware is extremely complex. Only 1/15 competitors has it. Enterprise-only feature. Would require CDN partnerships Beamix cannot negotiate as a solo founder. |
| **E-Commerce / Shopify (MVP)** | AthenaHQ, Writesonic, Goodie | Target persona is service SMBs (lawyers, restaurants, insurance), not e-commerce. Shopify integration is 3-4 weeks of effort for a niche use case. Revisit only if customer demand materializes. |
| **Multi-Surface Tracking (YouTube/TikTok/Reddit)** | Ahrefs | Requires massive data infrastructure Beamix cannot build. Ahrefs has 190M prompt dataset. Outside core GEO value proposition. |
| **Contentful/Sanity/Gamma Integration** | Profound | Enterprise headless CMS. Not SMB-relevant. Zero demand signal from target market. |
| **Webflow Integration** | AthenaHQ | Only 1/15 competitors. Small percentage of SMB market uses Webflow. |
| **Looker Studio Connector (MVP)** | Otterly, SE Visible, Peec | Agency feature. Core SMBs don't know what Looker Studio is. Build only when/if agency tier is prioritized (Phase 4). |
| **White-Label Reports (MVP)** | Otterly, RankPrompt | Agency feature. Not relevant for single-business SMB users. Phase 4 at earliest. |
| **Multi-Workspace/Agency (MVP)** | Profound, Otterly, RankPrompt | Requires data model changes. Not needed for core SMB persona. Phase 4. |
| **Editorial Queue / Multi-User Review** | Profound | Single-user SMBs don't need editorial workflows. This solves an enterprise team problem Beamix users don't have. |
| **Persona-Based Tracking (MVP)** | Scrunch | Only 1/15 competitors. Data model CLOSED; pipeline integration DEFERRED to Phase 4. Adds complexity SMBs won't use. |
| **Customer Journey Stage Mapping (MVP)** | Spotlight | Only 1/15 competitors. SPEC ONLY — Phase 4 implementation. Classification logic designed in Intelligence Layer but no pipeline integration or DB column at launch. |
| **Content Comparison Tool** | RankScale | "Current vs optimized" side-by-side. Interesting but low priority. Agents already produce optimized content -- showing the diff adds little value when the agent does the work. |
| **SOC 2 Compliance** | Airefs, Profound | Enterprise requirement. Not needed for SMB product. Build when enterprise customers demand it. |

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **PARTIAL gaps to close** | 7 |
| **MISSING gaps to close** | 14 (7 original + 7 additional from matrix) |
| **Launch Critical features** | 18 |
| **Growth Phase features** | 15 |
| **Moat Builder features** | 20 |
| **Intentionally Skipped** | 14 |
| **Innovation Opportunities** | 8 |
| **Cross-layer data flows** | 7 |
| **Cross-layer coordination points** | 5 |
| **Edge cases documented** | 6 |
| **Module integration points** | 6 |

### Competitive Context Notes

**Otterly Bulk Query Tracking:** Otterly supports bulk query import (50+ queries at once). Beamix data model supports this — no hard limit on `tracked_queries` table. UX for bulk add/import (CSV upload, paste-multiple) is a Growth Phase feature, not launch-blocking.

**Data Freshness Warning:** Competitive research conducted February-March 2026. Features and pricing of competitors change rapidly. Validate against current competitor websites before using for positioning claims. Re-verify all competitor feature claims if more than 60 days have elapsed since March 1-4, 2026.

### Completeness Verdict

The new system design closes the addressable competitive gaps (4/7 MISSING closed, 3/7 intentionally deferred, 7/7 PARTIAL upgraded) IF:

1. **Every PARTIAL item** has a concrete specification (not a one-liner deferral)
2. **Every MISSING item marked "Required"** has at least a data model note, phase assignment, and implementation approach
3. **Cross-layer data flows** (Section 3.1) are explicitly documented with owning teams
4. **The content pipeline is end-to-end:** scan --> recommendation --> agent --> content library --> WordPress publish --> visibility tracking --> impact display
5. **Skip decisions are explicit and reasoned** -- no silent omissions

The three agents (Morgan/Product, Atlas/Architecture, Sage/Intelligence) should each verify against this document that their layer covers every item assigned to them.

---

> **This document is the definitive validation checklist for the Beamix system design rewrite.**
> **Every competitive claim is sourced to specific competitors.**
> **Use this to verify completeness of all three system design layers.**
> **Author: Rex (Research Analyst) | March 2026**
