# Beamix Agent Roster v2 — Board-Approved (2026-04-15)

**STATUS: APPROVED**
**Agents:** 11 MVP-1 + 1 MVP-2
**Renames applied:** Freshness Agent (canonical name; early proposal used "Content Refresher") · Off-Site Presence Builder (was: Citation/Directory Builder)

---

## Content Output Policy (All Agents)

**No AI disclosure markers in agent-generated content.** All output reads as professional, human-quality work.
- No "drafted with AI assistance" language in any content output
- No AI disclosure footers or inline disclosure markers
- User is the author — they review, edit, and publish. Disclosure to end readers is the publisher's responsibility.
- A single disclosure note lives in Settings (tooltip only). It does not appear in any content output.

This policy applies to all 11 agents without exception.

---

## Roster Summary

| # | Agent | One-Line Promise | GEO Stat | Tier | Cost | Cadence (Discover/Build/Scale) | Cost/Run |
|---|-------|-----------------|----------|------|------|-------------------------------|----------|
| 1 | **Query Mapper** | "Here are 50 queries where you should appear — ranked by opportunity" | 86% of top citations aren't shared across engines → engine-specific targeting mandatory | All | 1 Run | Weekly / Daily / Daily | ~$0.08 |
| 2 | **Content Optimizer** | Rewrites existing pages with statistics, citations, expert quotes | +40–115% AI visibility from stats+citations (GEO paper, KDD 2024) | All | 2 Runs | Weekly / Daily / Daily | ~$0.18 |
| 3 | **Freshness Agent** | Updates stale content with new data so AI engines keep citing it | 76% of ChatGPT's top citations updated within 30 days (Frase/ChatGPT study) | All | 1 Run | Weekly / Daily / Daily | ~$0.09 |
| 4 | **FAQ Builder** | Creates comprehensive FAQ pages per query cluster | AI engines cite FAQ content at above-average rates; FAQ schema confirmed by Google | All | Free | Weekly / Daily / Daily | ~$0.04 |
| 5 | **Schema Generator** | JSON-LD for LocalBusiness, Product, FAQ, Article types | Google + Microsoft confirmed schema helps AI systems (2025 official statements) | All | Free | On-demand / On-demand / On-demand | ~$0.03 |
| 6 | **Off-Site Presence Builder** | Maps where you're missing + guides through getting listed on sources AI trusts | 85% of AI brand mentions come from third-party sources (Foundation Inc, 2026) | All | Free | Weekly / Daily / Daily | ~$0.06 |
| 7 | **Review Presence Planner** | Builds a strategy to earn reviews on platforms AI engines trust | ChatGPT: 48.7% of citations from Yelp, TripAdvisor, review sites | All | 2 Runs | Weekly / Daily / Daily | ~$0.15 |
| 8 | **Entity Builder** | Guides through Wikidata, Google Business Profile, knowledge graph presence | Wikipedia = 16.3% of ChatGPT citations; entity recognition is foundational for LLMs | All | 2 Runs | Monthly / Monthly / Weekly | ~$0.20 |
| 9 | **Authority Blog Strategist** | Creates GEO-optimized long-form content targeting specific AI queries | Listicle/comparison content cited 2–5x more; must include stats + citations + quotes | **Build, Scale** | 3 Runs | — / Daily / Daily | ~$0.38 |
| 10 | **Performance Tracker** | Before/after comparison per action — did your score actually improve? | Only 20-30% of brands stay visible across 5 consecutive AI query runs | All | Free | Weekly / Daily / Daily | ~$0.05 |
| 11 | **Reddit Presence Planner** | Identifies subreddits where your audience asks questions you should answer | Reddit = 46.7% of Perplexity's top-10 sources; 21% of Google AI Overviews | All | 1 Run | Weekly / Daily / Daily | ~$0.07 |
| 12 | **Video SEO Agent** *(MVP-2)* | Optimizes YouTube presence for AI Overview citations | YouTube = 18.8% of Google AI Overview citations (SurferSEO, 36M overviews) | Scale | 2 Runs | — / — / Weekly | ~$0.22 |

**Free agents run unlimited** (daily cap applies — see Cost Classification). Credit-gated agents consume AI Runs from tier allocation.
**Authority Blog Strategist is not available on Discover.** Discover users see a locked/upgrade prompt.

---

## Per-Agent Spec Summaries

### 1. Query Mapper
**Promise:** Maps the full query landscape — what users ask AI engines about your business category, ranked by opportunity gap.
**Engines helped:** All (engine-specific scoring).
**Interaction:** Async. User reviews and selects priority queries.
**Input:** Business profile, category, location, competitors list.
**Output:** Ranked query list with per-engine opportunity scores, competitor presence per query.
**Handoffs:** Feeds Content Optimizer, FAQ Builder, Blog Strategist.
**MVP scope:** 50 queries max. No real-time web data — query generation via LLM + scan data.
**Failure modes:** Generic queries if business profile is thin. Mitigation: prompt user to complete profile before first run.

---

### 2. Content Optimizer
**Promise:** Rewrites existing pages to include statistics, citations, and expert quotes — the three proven GEO levers.
**Engines helped:** All, especially Gemini (brand-owned site citations = 52%).
**Interaction:** Human review required before publish. User approves rewrite diff.
**Input:** Current page URL or pasted content, business context, target queries from Query Mapper.
**Output:** Full rewrite with change summary, GEO signal checklist (stats ✓, citations ✓, quotes ✓).
**Handoffs:** Passes to Performance Tracker post-publish.
**MVP scope:** One page per run. No direct CMS publishing — outputs markdown/HTML for copy-paste.
**Failure modes:** Generic statistics if no business data provided. Mitigation: business data injection required as pre-step.

---

### 3. Freshness Agent
**Promise:** Detects stale content and updates it with current data, dates, and fresh citations.
**Engines helped:** All (content freshness correlates with citation rate across all engines).
**Interaction:** Async with review gate. Shows old vs new diff.
**Input:** Page content + last-updated date. Optional: new data points to inject.
**Output:** Updated content with freshness markers and new citations.
**Handoffs:** Passes updated content to Schema Generator (date metadata).
**MVP scope:** Text refresh only. No image or media updates.
**Failure modes:** May not detect all stale data in complex pages. Mitigation: user can flag specific sections.

---

### 4. FAQ Builder
**Promise:** Creates comprehensive FAQ pages per query cluster that AI engines actively cite.
**Engines helped:** All — FAQ schema confirmed by Google; AI engines extract Q&A pairs directly.
**Interaction:** User reviews FAQ list before generation. Approves final page.
**Input:** Query cluster from Query Mapper, business profile, common customer questions.
**Output:** Full FAQ page (HTML + JSON-LD FAQ schema) per query cluster.
**Handoffs:** Schema Generator for JSON-LD; Performance Tracker post-publish.
**MVP scope:** Up to 20 Q&A pairs per page. No dynamic FAQ (static output).
**Failure modes:** Generic questions if business context is thin. Requires 3+ real customer questions as seed input.

---

### 5. Schema Generator
**Promise:** Generates correct JSON-LD markup for LocalBusiness, Product, FAQ, and Article types.
**Engines helped:** Google AI Overviews (confirmed); helps structured understanding across all engines.
**Interaction:** One-click. User copies output to `<head>` or forwards to developer.
**Input:** Business profile data, page type, existing page content.
**Output:** JSON-LD block(s) with implementation instructions.
**Handoffs:** Can receive structured data from FAQ Builder and Article outputs.
**MVP scope:** 4 schema types: LocalBusiness, FAQ, Article, Product.
**Failure modes:** Wrong schema type selected. Mitigation: auto-suggest based on page type detection.

---

### 6. Off-Site Presence Builder
**Promise:** Maps the third-party sources AI engines trust, identifies where you're missing, guides through getting listed.
**Engines helped:** ChatGPT (third-party consensus), Perplexity (niche directories = 24% of citations).
**Interaction:** Multi-step guided flow. Each directory = separate task card with instructions.
**Input:** Business category, location, current known listings.
**Output:** Prioritized gap list with per-directory submission guides. Not automated — guided.
**Handoffs:** Review Presence Planner (review platforms); Entity Builder (knowledge graph).
**MVP scope:** 50 pre-mapped directories/sources. No automated submission.
**Failure modes:** Outdated submission instructions if directories change. Reviewed quarterly.

---

### 7. Review Presence Planner
**Promise:** Builds a review strategy targeting platforms AI engines trust — not just asking for reviews, but where and how.
**Engines helped:** ChatGPT (48.7% citations from Yelp, TripAdvisor, review sites).
**Interaction:** Output is a review strategy doc + templated ask sequences. Human executes.
**Input:** Business category, current review platform presence, AI engine findings.
**Output:** Platform priority list, review request templates, response templates.
**Handoffs:** Off-Site Presence Builder (listing confirmation); Performance Tracker.
**MVP scope:** Strategy output only. No direct platform integration or automation.
**Failure modes:** Generic templates. Mitigation: personalization prompts require real business context.

---

### 8. Entity Builder
**Promise:** Guides through building a complete knowledge graph presence — Wikidata, Google Business Profile, entity markers.
**Engines helped:** All — entity recognition is foundational for LLM training data.
**Interaction:** Step-by-step guided flow. Complex — designed for monthly cadence.
**Input:** Business profile, existing Wikipedia/Wikidata presence check.
**Output:** Wikidata entry draft, GBP optimization checklist, entity attribute list.
**Handoffs:** Off-Site Presence Builder (directories as entity signals).
**MVP scope:** Guided checklist. Wikidata draft generation. GBP audit. No automated submission.
**Failure modes:** Wikidata entry rejected (notability requirements). Mitigation: notability check pre-step.

---

### 9. Authority Blog Strategist
**Promise:** Creates long-form GEO-optimized articles targeting specific AI queries with statistics, citations, and quotes.
**Tier:** Build and Scale only. Not available on Discover.
**Engines helped:** All — especially Gemini (brand-owned content) and Google AI Overviews.
**Interaction:** User approves outline → approves final article → publishes manually.
**Input:** Target query from Query Mapper, competitor content analysis, business expertise signals.
**Output:** Full article (800–2,000 words) with GEO signal checklist, meta, and internal link suggestions.
**Handoffs:** Schema Generator (Article JSON-LD); Performance Tracker post-publish.
**MVP scope:** One article per run. Hard cap: 40 posts/mo on Scale. No direct CMS publishing.
**Failure modes:** Content commoditization without unique data injection. REQUIRED: user provides at least one proprietary data point before run.

---

### 10. Performance Tracker
**Promise:** Measures before/after for every agent action — shows which engine improved and by how much.
**Engines helped:** All (measurement layer, not optimization layer).
**Interaction:** Async. Triggers post-publish rescan. Shows delta dashboard.
**Input:** Action log from other agents, scan results (before), new scan results (after).
**Output:** Per-engine visibility delta, query-level before/after, recommended next action.
**Handoffs:** Feeds back into Query Mapper (re-prioritize based on results).
**MVP scope:** Comparison requires at least 2 scans. 30-day measurement window.
**Failure modes:** False attribution if multiple actions taken simultaneously. Mitigation: recommend one action at a time.

---

### 11. Reddit Presence Planner
**Promise:** Identifies subreddits where your audience asks the exact questions you should be answering.
**Engines helped:** Perplexity (Reddit = 46.7% of top sources), Google AI Overviews (Reddit = 21%).
**Interaction:** Output is a strategy doc + comment/thread templates. Human executes.
**Input:** Business category, target queries, location/language.
**Output:** Subreddit list with engagement strategy, response templates, posting calendar.
**Handoffs:** Off-Site Presence Builder (community signals as directory equivalent).
**MVP scope:** Strategy output only. No Reddit API integration. No automated posting.
**Failure modes:** Reddit community rules vary. Mitigation: output includes per-subreddit rule summary.

---

### 12. Video SEO Agent *(MVP-2 — Scale tier only)*
**Promise:** Optimizes YouTube channel and video metadata for Google AI Overview citation.
**Engines helped:** Google AI Overviews (YouTube = 18.8% of citations).
**Interaction:** Audit existing channel + generate optimized titles/descriptions/chapters.
**Input:** YouTube channel URL or video list, target queries.
**Output:** Optimized metadata per video, new video topic suggestions, chapter timestamps.
**Handoffs:** Performance Tracker (track AI Overview appearance post-optimization).
**MVP scope:** Metadata optimization only. No video production. Requires existing YouTube presence.
**Failure modes:** No YouTube channel = no value. Mitigation: prerequisite check at run start.

---

## Agent Pipeline Model

Every credit-gated agent runs 5 LLM calls:

```
1. PLAN     — Decompose task, select strategy, check business context completeness
2. RESEARCH — Pull relevant scan data, competitor data, query intelligence
3. DO       — Generate primary output (content, strategy, plan)
4. QA       — Check GEO signals: stats present? citations present? quotes present? YMYL risk?
5. SUMMARIZE — Compress output for dashboard display + human review card
```

Free agents (Schema, FAQ, Off-Site, Perf Tracker) run 3 calls: PLAN → DO → QA.

---

## Model Routing Table

**Allowed models only:**

| Stage | Default | High-Stakes | Fast/Cheap |
|-------|---------|-------------|------------|
| PLAN | Claude Sonnet 4.6 | Claude Opus 4.6 | GPT-4o-mini |
| RESEARCH | Perplexity Sonar Pro | Perplexity Sonar Online | Perplexity Sonar |
| DO | Claude Sonnet 4.6 | Claude Opus 4.6 | Gemini 2.0 Flash |
| QA | Claude Haiku 4.5 | Claude Sonnet 4.6 | GPT-4o-mini |
| SUMMARIZE | Claude Haiku 4.5 | — | Gemini 2.0 Flash |

**Per-agent routing:**

| Agent | PLAN | RESEARCH | DO | QA | SUMMARIZE |
|-------|------|----------|----|----|-----------|
| Query Mapper | Sonnet 4.6 | Perplexity Sonar Pro | Sonnet 4.6 | Haiku 4.5 | Haiku 4.5 |
| Content Optimizer | Sonnet 4.6 | Perplexity Sonar | Sonnet 4.6 | Sonnet 4.6 | Haiku 4.5 |
| Freshness Agent | Haiku 4.5 | Perplexity Sonar | Sonnet 4.6 | Haiku 4.5 | Haiku 4.5 |
| FAQ Builder | Haiku 4.5 | — | Sonnet 4.6 | Haiku 4.5 | Haiku 4.5 |
| Schema Generator | Haiku 4.5 | — | Haiku 4.5 | Haiku 4.5 | — |
| Off-Site Presence Builder | Sonnet 4.6 | Perplexity Sonar | Gemini 2.0 Flash | Haiku 4.5 | Haiku 4.5 |
| Review Presence Planner | Sonnet 4.6 | Perplexity Sonar | Sonnet 4.6 | Haiku 4.5 | Haiku 4.5 |
| Entity Builder | Sonnet 4.6 | Perplexity Sonar Pro | Sonnet 4.6 | Sonnet 4.6 | Haiku 4.5 |
| Authority Blog Strategist | Opus 4.6 | Perplexity Sonar Pro | Opus 4.6 | Sonnet 4.6 | Haiku 4.5 |
| Performance Tracker | Haiku 4.5 | — | Gemini 2.0 Flash | Haiku 4.5 | Haiku 4.5 |
| Reddit Presence Planner | Sonnet 4.6 | Perplexity Sonar Pro | Sonnet 4.6 | Haiku 4.5 | Haiku 4.5 |
| Video SEO Agent | Sonnet 4.6 | Perplexity Sonar | Sonnet 4.6 | Haiku 4.5 | Haiku 4.5 |

**Prohibited:** DeepSeek (any version), Qwen (any version). Not approved for customer data processing.

---

## Killed Agents (and Why)

| Agent | Verdict | Reason |
|-------|---------|--------|
| **Social Strategy** | Killed | Social media doesn't affect GEO. Different product category. Confuses positioning. |
| **Competitor Intelligence (v1)** | Replaced | Was a chat interface over static data. Replaced by Query Mapper + Performance Tracker with real scan data. |
| **Content Writer (v1)** | Replaced | Generic content tool with no GEO signals. Replaced by Content Optimizer (engine-aware, stats/citations required). |
| **Review Analyzer (v1)** | Replaced | Analyzed existing reviews. Replaced by Review Presence Planner (builds review PRESENCE, not analytics). |
| **llms.txt Generator** | Killed | Only 0.1% of AI crawlers read it. 8/9 test sites saw zero measurable change (OtterlyAI study). |

---

## Cost Classification

| Type | Agents | Daily Cap (Discover/Build/Scale) | Cost/Run | Rationale |
|------|--------|----------------------------------|----------|-----------|
| **Free (unlimited, daily-capped)** | Schema Generator, FAQ Builder, Off-Site Presence Builder, Performance Tracker | Schema: 20/20/20 · FAQ: 3/5/10 · Off-Site: 3/5/10 · Perf Tracker: unlimited | < $0.10 | Low LLM cost; high frequency of use; drives daily engagement |
| **1 Run** | Query Mapper, Freshness Agent, Reddit Presence Planner | — | $0.07–$0.09 | Moderate cost; run 1–2x/week typical |
| **2 Runs** | Content Optimizer, Review Presence Planner, Entity Builder | — | $0.15–$0.22 | Higher cost; produces primary deliverables |
| **3 Runs** | Authority Blog Strategist | — | ~$0.38 | Opus 4.6 in PLAN + DO stages; long output |

---

## GEO Lever Coverage Matrix

| GEO Lever | Primary Agent | Secondary Agent | Coverage |
|-----------|--------------|-----------------|---------|
| Statistics in content | Content Optimizer | Freshness Agent | Strong |
| Citations/sources | Content Optimizer | Authority Blog Strategist | Strong |
| Expert quotes | Content Optimizer | Authority Blog Strategist | Moderate |
| FAQ pages | FAQ Builder | — | Strong |
| Schema markup | Schema Generator | FAQ Builder | Strong |
| Content freshness | Freshness Agent | — | Strong |
| Off-site mentions | Off-Site Presence Builder | Review Presence Planner | Moderate |
| Review platform presence | Review Presence Planner | Off-Site Presence Builder | Moderate |
| Knowledge graph / entity | Entity Builder | — | Moderate |
| Query targeting | Query Mapper | — | Strong |
| Reddit / community | Reddit Presence Planner | — | Moderate |
| Video / YouTube | Video SEO Agent (MVP-2) | — | Weak (MVP-2 only) |
| Competitor gap analysis | Performance Tracker | Query Mapper | Moderate |

---

## Engine Coverage Matrix

| Engine | Best Agents | Gap |
|--------|------------|-----|
| **ChatGPT** | Off-Site Presence Builder, Review Presence Planner, Entity Builder | Reddit strategy (indirect) |
| **Gemini** | Content Optimizer, Freshness Agent, Authority Blog Strategist, Schema Generator | None — strong on-site coverage |
| **Perplexity** | Reddit Presence Planner, Off-Site Presence Builder, FAQ Builder | Niche directory depth |
| **Google AI Overviews** | Schema Generator, FAQ Builder, Video SEO Agent, Authority Blog Strategist | Video gap in MVP-1 |
| **Claude** | Content Optimizer, FAQ Builder | Citation pattern not yet documented |
| **Grok (X)** | (Deferred) | No clear citation pattern data yet |
| **You.com** | Off-Site Presence Builder | Limited public data on citation sources |

**Gaps identified:**
- **Reddit (MVP-1):** Reddit Presence Planner gives strategy — no API integration. Execution is manual.
- **Video (MVP-2):** Covered by Video SEO Agent but Scale-only, not MVP-1.
- **Grok:** Deferred to Phase 2. No public citation pattern research available.

---

## YMYL Policy per Agent

YMYL (Your Money or Your Life) content requires stricter QA. The QA stage flags YMYL topics and the Inbox card shows a YMYL indicator to prompt careful human review. No disclosure language is added to the content output itself — see Content Output Policy above.

| Agent | YMYL Risk | Policy |
|-------|-----------|--------|
| Content Optimizer | Medium (if finance/health/legal client) | QA flags YMYL topics; Inbox card marked for careful human review before publish |
| Authority Blog Strategist | High (if YMYL category) | Inbox card shows YMYL flag; human sign-off required before marking ready to publish |
| FAQ Builder | Medium | YMYL topics flagged; FAQ answers include "consult a professional" where legally appropriate |
| Review Presence Planner | Low | Standard output |
| All others | Low | Standard output |

Business category detected at onboarding. YMYL flag set on profile. Applied at every run.

---

## Pre-Launch Evaluation Criteria

Each agent must pass before GA release:

| Criterion | Requirement |
|-----------|-------------|
| Golden cases | 5 distinct business profiles tested per agent |
| Pass threshold | 4/5 outputs rated "publish-ready" by human reviewer |
| GEO signal check | 100% of content outputs must include stats, citation, or quote (where applicable) |
| QA gate | Internal Claude QA must catch generic output and flag for retry |
| Engine accuracy | Engine-specific recommendations must match documented citation patterns |
| Judge type | Human reviewer (not LLM-as-judge for MVP) |

---

## Cross-Agent Coordination

Agents share state via three mechanisms:

| Mechanism | Purpose | Agents Using It |
|-----------|---------|-----------------|
| `page_locks` | Prevents two agents from editing the same URL simultaneously | Content Optimizer, Freshness Agent, Authority Blog Strategist |
| `topic_ledger` | Tracks published topics to prevent duplication | Authority Blog Strategist, FAQ Builder |
| `rate_limit_budget` | Shared monthly publish rate (max 40 posts/mo on Scale) | Authority Blog Strategist, Content Optimizer |

Query Mapper is the upstream source for all content agents — run it first on any new business profile.
Performance Tracker is the downstream receiver for all publish events — fires automatically post-publish.
