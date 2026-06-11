# Otterly AI — Product Teardown

**Researched:** 2026-06-11
**Researcher:** researcher (purple)
**Method:** Marketing site + help center + 8 review sources + tool subdomain probing
**Overall confidence:** MEDIUM-HIGH on public surface; LOW on in-app screens behind auth (`app.otterly.ai`)

---

## 1. Positioning + Pricing

### One-line positioning
"AI Search Monitoring Tool" — track brand visibility, mentions, and citations across ChatGPT, Perplexity, Google AI Overviews, AI Mode, Gemini, and Microsoft Copilot, with a GEO Audit overlay for on-page recommendations. Used by 20,000+ marketing professionals. (Source: otterly.ai homepage + features page, 2026-06-11, HIGH)

### Pricing (monthly / annual)

| Tier | Monthly | Annual (effective/mo) | Prompts | Engines | GEO URL audits/mo | API/MCP requests/mo |
|------|---------|----------------------|---------|---------|-------------------|---------------------|
| **Lite** | $29 | $25 ($300/yr) | 15 | 4 (ChatGPT, AIO, Perplexity, Copilot) | 1,000 | – |
| **Standard** ⭐ "Most Popular" | $189 | $160 ($1,920/yr) | 100 | 4 same | 5,000 | 2,000 / 2,000 |
| **Premium** | $489 | $422 ($5,064/yr) | 400 | 4 same | 10,000 | 5,000 / 5,000 |
| **Enterprise** | Custom | – | Custom | Custom | Custom | Custom |

(Source: otterly.ai/pricing fetched 2026-06-11, HIGH)

**Add-ons:**
- Extra prompts (Standard/Premium): +100 prompts = $99/mo or $85/mo annual (HIGH)
- Google AI Mode: +$9/$59/$149 per tier (Lite/Std/Prem); annual $93/$610/$1,540 (HIGH)
- Google Gemini: same as AI Mode pricing (HIGH)
- Claude: "Coming soon" (HIGH)

**Trial:** 14-day free trial, no credit card (HIGH — otterly.ai homepage)

**Agency Partner bonus (Standard/Premium subscribers):** 150 prompts on Standard (vs 100), 500 on Premium (vs 400), unlimited workspace mgmt, pitch workspaces for prospects, custom Looker Studio branding, consolidated billing, co-marketing (HIGH — pricing page)

**Notable:** Lite ($29) was their original "agency-popular budget" tier. Premium $489/mo is positioned for in-house teams managing 100+ prompts. Pre-2026 the top tier was advertised as $989 ("Pro" plan, ~1,000 prompts) per dageno.ai review — that tier appears to have been deprecated/folded into Enterprise as of June 2026. (LOW — single secondary source)

---

## 2. NAV TREE

### Marketing site (otterly.ai)

- **Features** (dropdown)
  - Feature Overview
  - MCP (Model Context Protocol)
  - Public API
- **Solutions** (dropdown)
  - For Agencies
  - For Marketing Teams
  - (also referenced: For SEO Teams, For Enterprises)
- **Resources** (dropdown)
  - Blog
  - Help Center
  - API Documentation
  - Marketplace
  - Contact
  - Partners
  - Case Studies
  - Ambassadors
  - GEO Guide
  - Free Tools (→ `geo-tools/` and `geo.otterly.ai`)
- **Pricing**
- **Get a Demo**
- **Log In** / **Start Free Trial**

(Source: otterly.ai homepage 2026-06-11, HIGH)

### Product app (`app.otterly.ai`) — left sidebar (inferred from help center + reviews)

- **Prompts** (`/prompts` confirmed URL)
- **Brand Reports** (multiple, one per brand entity; "+" to add new)
  - Per-report tabs: Overview, Brand KPIs, Citations, Domain Ranking, Brand Visibility Index, Coverage Over Time
- **Citation Report** (cross-brand)
- **Domain Ranking** (cross-brand)
- **GEO Audit** (run-and-review screen)
- **Prompt Research** (AI keyword research)
- **Recommendations** (insights engine output)
- **Workspaces** (switcher; multiple workspaces on Standard+)
- **Settings / Account**
  - Team Management (invite, roles)
  - Workspace Management
  - Billing & Payment
  - Integrations (Looker Studio, MCP, API tokens)
  - SSO (Enterprise)
- **Agent Analytics** — closed beta (separate area)

(Source: composite — help.otterly.ai topic index + reviews from rankability, tryanalyze, dageno; HIGH on existence, MEDIUM on exact sidebar order, LOW on icons/labels since not screenshot-verified by researcher)

---

## 3. PER-PAGE PANEL INVENTORY

### 3.1 Prompts page (`/prompts`)

| Panel | Data shown | Update frequency | User action exposed | Evidence + confidence |
|-------|------------|------------------|---------------------|----------------------|
| Prompt list | All tracked prompts: text, target engines, target country, status | Real-time | Add prompt, edit prompt, delete prompt, set per-prompt country, set engines, set refresh frequency | discoveredlabs.com 2026, HIGH |
| Prompt tagging/categories | Categories: Branded / Non-Branded / Top/Bottom-of-Funnel | Static | Tag prompts, filter by tag | otterly.ai homepage screenshots desc, MEDIUM |
| Prompt usage counter | X of N prompts used (tier limit) | Real-time | Buy add-on prompts | otterly.ai/pricing, HIGH |

### 3.2 Brand Report — Overview / KPI panel

| Panel | Data shown | Update frequency | User action exposed | Evidence + confidence |
|-------|------------|------------------|---------------------|----------------------|
| Brand Mentions | Total mentions in selected period (1/0 per prompt/day/engine) | Daily (Lite Daily per pricing) | Filter by time range, engine, brand | help.otterly.ai/brand-report-kpi-definition, HIGH |
| Share of Voice | % of total mentions vs all tracked brands | Daily | Filter by competitors | same, HIGH |
| Avg. Brand Position | Sum of positions where brand appeared / mention count | Daily | Filter | same, HIGH |
| Brand Coverage | % of prompts mentioning brand vs all prompts | Daily | Filter | same, HIGH |
| Brand Sentiment | Net Sentiment Score −100 to +100 | Daily | Filter | same, HIGH |
| Domain Citation | Total citations of brand's domain across engines | Daily | Filter, drill to URL | same, HIGH |
| Domain Coverage | % of prompts citing brand's domain | Daily | Filter | same, HIGH |
| Brand Ranking | Top-10 brand mentions list | Daily | View — no edit | same, HIGH |
| Brand Rank Over Time | Daily ranking line chart | Daily | View, time-filter | same, HIGH |
| Brand Visibility Index | Scatter chart: coverage (x) vs likelihood-to-buy (y), Leaders/Niche/Low quadrants | Daily | View | help.otterly.ai/insights, HIGH |
| Domain Ranking | Top-10 cited domains | Daily | View, drill | same, HIGH |
| Coverage Over Time | Trend line for brand coverage vs competitors | Daily | Filter time/engine | rankability review 2026, HIGH |
| Top Prompts | Specific prompts where brand appears | Daily | View, drill into prompt | help.otterly.ai/insights, HIGH |
| Most Cited URLs | Brand's URLs cited by LLMs, ranked by frequency | Daily | View, drill | help.otterly.ai/insights, HIGH |
| Report settings (gear icon) | Brand name + variations, domains, competitor list, connected prompts | On save | Edit brand variations, edit domains, add/remove competitors, connect prompts, get auto-suggested competitors | help.otterly.ai/set-up-a-brand-report, HIGH |

### 3.3 Citation Report

| Panel | Data shown | Update frequency | User action exposed | Evidence + confidence |
|-------|------------|------------------|---------------------|----------------------|
| Most cited URLs | URL list with citation count per engine | Weekly (links specifically "Otterly tracks all links weekly" per features page) | Drill to source, filter engine | otterly.ai/features + rankability, HIGH |
| Citation by engine | Side-by-side citation counts per engine | Weekly | Filter | rankability, HIGH |
| Citation position over time | Movement in link positions across weeks | Weekly | Time filter | otterly.ai/features, HIGH |

### 3.4 Domain Ranking

| Panel | Data shown | Update frequency | User action | Evidence |
|-------|------------|------------------|-------------|----------|
| Domain leaderboard | Domains ranked by citation count across all monitored prompts | Weekly | Filter by industry/competitor set | features page + rankability, HIGH |
| Domain coverage % | % of prompts that cite each domain | Weekly | View | features page, HIGH |

### 3.5 GEO Audit

| Panel | Data shown | Update frequency | User action | Evidence |
|-------|------------|------------------|-------------|----------|
| URL audit input | URL entry field | On-demand | **Run audit on any URL** | otterly.ai/features, HIGH |
| 25+ on-page factors | Per-factor pass/fail/score: structured data, content depth, freshness, AI readiness, crawlability | Per audit run | View, export | rankability + tryanalyze 2026, HIGH |
| SWOT panel | Strengths, Weaknesses, Opportunities, Threats summary | Per audit | View | rankability 2026, HIGH |
| Competitor set | Auto-identified competitors with comparison | Per audit | View | rankability, HIGH |
| Tactic gaps | Specific improvement recommendations per URL | Per audit | View, mark as actioned (inferred) | features page, MEDIUM |
| Audit quota counter | URLs audited this month / tier cap | Real-time | Upgrade plan | pricing page, HIGH |

### 3.6 Prompt Research

| Panel | Data shown | Update frequency | User action | Evidence |
|-------|------------|------------------|-------------|----------|
| Input form | Brand name OR seed keywords OR URL OR advanced (multi-input) | On-demand | **Generate suggested prompts** | geo.otterly.ai/geo/ai-prompt-research, HIGH |
| Suggested prompt list | AI-generated conversational queries | On-demand | Add prompts to tracking, export | discoveredlabs 2026, HIGH |
| Query Fan-Out (advanced) | Variations a single query fans into | On-demand | Generate variations | geo.otterly.ai/geo/ai-query-fan-out, HIGH |

### 3.7 Recommendations

| Panel | Data shown | Update frequency | User action | Evidence |
|-------|------------|------------------|-------------|----------|
| Recommendation feed | Actionable suggestions derived from brand report + competitor cited URLs | Refreshed alongside brand reports (cadence unclear) | View, mark as completed (inferred) | features page, MEDIUM |
| Recommendation quota | 3/month on Lite, unlimited on Standard+ | Real-time | View | pricing page, HIGH |

### 3.8 Workspaces / Settings

| Panel | Data shown | User action | Evidence |
|-------|------------|-------------|----------|
| Workspace switcher | List of workspaces (1 on Lite, unlimited Standard+) | Create workspace, switch, rename | features + pricing, HIGH |
| Team management | Member list (unlimited on all tiers), roles | Invite, remove, set role | features + help index, HIGH |
| Billing | Plan, prompt usage, audit usage, invoice list | Upgrade/downgrade, buy add-ons, download invoices | help.otterly.ai billing topic, HIGH |
| Integrations | Looker Studio connector toggle, MCP server credentials, API tokens | Generate API token, configure connector | docs.otterly.ai, HIGH |
| SSO (Enterprise) | SSO config | Configure SSO | pricing page, HIGH |
| Pitch workspaces (Agency) | Demo workspaces with seeded data | Create pitch workspace for prospects | pricing page agency section, HIGH |

### 3.9 Agent Analytics (closed beta)

| Panel | Data shown | User action | Evidence |
|-------|------------|-------------|----------|
| AI crawler engagement | Which AI crawlers hit which site pages | Request early access | otterly.ai/features, HIGH |

---

## 4. MANUALLY-OPERABLE TOOLS (LOAD-BEARING SECTION)

This is **everything a user can actively run, create, edit, or configure** — i.e. tools that produce work, not just dashboards that display it.

### Paid product (inside app.otterly.ai)

1. **Add / edit / delete tracked Prompts** — text, target engines, target country, refresh frequency per prompt (HIGH — help center, multiple reviews)
2. **Tag prompts** into categories (Branded / Non-Branded / Top/Bottom-of-Funnel) (MEDIUM — homepage UI screenshot description, not explicitly named in help docs)
3. **Run AI Prompt Research** — input brand/keyword/URL, get suggested conversational prompts, push them into tracking (HIGH)
4. **Run Query Fan-Out** — see how Google AI Mode expands a single query (HIGH — free tool, also embedded)
5. **Create/edit Brand Report** — set brand name + variations, set domains, add competitors (auto-suggested or manual, unlimited), connect prompts (HIGH)
6. **Run GEO Audit on a URL** — get pass/fail scoring across 25+ on-page factors, SWOT, competitor set, tactic gaps (HIGH)
7. **Run Crawlability Check** — verify AI bot accessibility against robots.txt / server config (HIGH)
8. **Create / manage Workspaces** — multi-client separation (Standard+ unlimited) (HIGH)
9. **Invite team members + set roles** — unlimited seats all tiers (HIGH)
10. **Generate API tokens** — bearer tokens for `data.otterly.ai/v1` (HIGH — docs.otterly.ai)
11. **Enable MCP server** — expose brand reports, prompts, citations, recommendations, audit checks to user's own AI assistant (HIGH)
12. **Connect Google Looker Studio** — brand-level metrics, citations, filterable by date/country/brand-report (HIGH)
13. **Export CSV** — prompts, mentions, citations (HIGH)
14. **Export PDF reports** — for stakeholder presentations (MEDIUM — mentioned in help index + crawlraven review, no screenshot)
15. **Generate shareable read-only dashboard links** (LOW — mentioned only in crawlraven review, not cross-confirmed)
16. **Create Pitch Workspace** (Agency Partner) — demo workspace with seeded data for prospect sales calls (HIGH)
17. **Configure SSO** (Enterprise) (HIGH)
18. **Configure alert thresholds** — for "meaningful change" notifications (MEDIUM — crawlraven review mentions thresholds, not confirmed in official Otterly docs; competing source may have confused with Analyze AI)

### Free tools (geo.otterly.ai + otterly.ai/geo-tools/)

19. **GEO Email Course** — 7-step email series sign-up (HIGH)
20. **GEO Guide** — read free PDF/web guide (HIGH)
21. **Prompt Calculator** — input parameters → returns recommended # prompts for statistical reliability (HIGH)
22. **CustomGPT Prompt Research** — starter prompt discovery (HIGH)
23. **AI Prompt Research (Basic)** — free version of paid prompt research (HIGH)
24. **Simulate Query Fan-Out** — free standalone version (HIGH — "Used 11,415 times" counter)
25. **GEO Content Audit / Content Check** — input URL → returns GEO score + tips (HIGH)
26. **AI Crawlability Check** — input domain → bot accessibility report (HIGH)
27. **AI Search Referral Traffic** — set up tracking of visitors from ChatGPT/Perplexity/Gemini/Copilot (LOW — likely a tag/script users install; no confirmed UX detail)
28. **AI Brand Authority Check** — input brand → entity recognition signals from LLMs (MEDIUM)
29. **Industry Benchmarks** — pick category + geography → returns top-cited brands (MEDIUM)
30. **GEO Landing Page Creator** (geo.otterly.ai/geo/ai-landingpage-creator) — fill 6-field form (question, brand, USPs, competitors, data points, industry) + optional 2,000-char instructions + pick from 25 output languages → returns "AI search optimized" landing page copy. "Used 177 times" counter as of 2026-06-11 (HIGH — direct fetch)

**Count: ~18 tools inside the paid product. ~12 tools as free/marketing utilities.** This is unusually broad for a $29 entry-point monitoring product — the free tool surface is a large funnel.

---

## 5. MONITORING-ONLY vs ACTION — "I see it, now what?" GAP

This is the strategically important section for Beamix. Otterly's verbatim positioning is **"Optimize once. Get cited everywhere."** In practice the product almost always stops at *showing data* and hands the doing-work step back to the user.

### Where Otterly STOPS at monitoring (no action taken on user's behalf)

| Surface | What Otterly does | What it does NOT do | Evidence + confidence |
|---------|-------------------|---------------------|----------------------|
| Brand mentions trend down | Shows the drop in dashboard; possibly emails an alert | Does not draft new content, does not file fixes, does not contact source sites | features page + reviews, HIGH |
| Competitor displaces you | Shows the displacement in Share of Voice | Does not generate counter-content, does not propose a content brief | rankability + features, HIGH |
| GEO Audit returns 25+ failed factors | Lists per-factor failures with "tactic gap" text | Does not edit the user's CMS, does not push fixes to the page, does not file a PR or ticket | rankability review notes "data presented without built-in narrative flow or clear guidance on next steps", HIGH |
| Crawlability check fails | Shows robots.txt / bot access fail | Does not modify robots.txt, does not file ticket with dev team | features page, HIGH |
| Recommendations Engine | Surfaces "smart recommendations" / actionable suggestions text | Does not draft the FAQ/structured data/page copy itself; user takes the suggestion to their own writer/dev | features page + rankability ("too many disconnected table charts ... fragmented across reports"), HIGH |
| Prompt research | Suggests prompts to track | Does not write content answering them | tryanalyze + discoveredlabs, HIGH |
| Citation tracking | Shows which competitor URLs are cited | Does not reverse-engineer those URLs into a content brief / template / draft | rankability, HIGH |
| Sentiment analysis | Shows −100 to +100 score | Does not propose remediation copy or PR outreach | help.otterly.ai/brand-report-kpi-definition, HIGH |
| Domain ranking | Shows which domains LLMs trust | Does not pursue link-building / digital PR / inclusion in those domains | features page, HIGH |

### Where Otterly DOES execute work for the user

| Surface | What it does | Evidence |
|---------|--------------|----------|
| Daily prompt monitoring | Automatically queries 4-6 LLMs daily from neutral context | HIGH — pricing + features |
| Weekly link/citation tracking | Re-fetches citations weekly | HIGH — features page |
| Automated brand-report generation | Builds brand report in ~5 min after setup | HIGH — discoveredlabs review |
| **GEO Landing Page Creator** (free tool) | Actually generates landing page copy — only "doing-work" tool in the product surface | HIGH — direct fetch, but currently a free *marketing* tool, not a paid product feature; only "Used 177 times" |

### The "I see it, now what?" gap — explicit summary

Otterly is **~95% monitor, ~5% act**. The single piece of execution-on-the-user's-behalf in the paid product is the **Recommendations Engine** which outputs *text suggestions*, not artifacts. The GEO Landing Page Creator (an actual content generator) is sequestered as a free marketing tool — not promoted as a core product capability. A user paying $189-$489/mo for Standard/Premium walks away with **dashboards + audit reports + a recommendation list** and must then hire/use their existing content/dev team to act on it. This is the agency-friendly model (agencies sell the doing-work as their billable service on top of Otterly data) but is also Otterly's largest **upsell gap** for in-house teams who want a single tool that diagnoses *and* fixes.

(Source: composite — rankability review explicitly flags "data presented without built-in narrative flow or clear guidance on next steps"; crawlraven review calls it a "monitoring and audit layer rather than a complete strategic platform with advanced workflow automation"; HIGH confidence)

---

## 6. NOTABLE / DISTINCTIVE features

1. **MCP server (Model Context Protocol)** — Otterly is one of the first GEO platforms to ship an MCP server. Their brand reports, prompts, citations, recommendations, and audit checks are exposed as MCP tools so a user's own AI assistant (Claude Desktop, etc.) can query "how am I doing in ChatGPT this week?" directly. Standard tier 2,000/mo requests, Premium 5,000/mo. (HIGH — otterly.ai/features/mcp)

2. **Per-prompt country targeting** — each tracked prompt can target a specific country/locale (50+ countries supported). Recognizes that AI answers differ by region. (HIGH — discoveredlabs)

3. **Brand Visibility Index as a quadrant chart** — coverage × likelihood-to-buy scatter, classifies brand as Leaders / Niche / Low. Unusual visualization for the category. (HIGH — help.otterly.ai/insights)

4. **Free-tool funnel as scale moat** — 12+ free GEO tools at `geo.otterly.ai` and `otterly.ai/geo-tools/`. Query Fan-Out alone has been used 11,415 times. This is a heavy SEO/GEO funnel into the paid product. (HIGH)

5. **Unlimited team seats on all tiers** — including Lite. Standard+ also gives unlimited workspaces. Agency-friendly. (HIGH)

6. **Agency Partner program with bonus prompts** — Standard subscribers get 150 prompts (vs 100), Premium 500 (vs 400), plus white-label Looker Studio branding and "pitch workspaces" for prospect demos. (HIGH)

7. **Looker Studio Connector** — first-class integration, bundled into Standard/Premium at no extra cost; multiple workspaces can be connected for agencies. (HIGH)

8. **25+ on-page factor GEO Audit** — described in reviews as "the most detailed GEO audit" available. (HIGH — rankability)

9. **Daily refresh on Lite ($29)** — most competitors at this price tier offer weekly refresh. (HIGH — pricing page)

10. **Agent Analytics (closed beta)** — shows which AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) hit your site. Closed beta as of 2026-06-11. (HIGH)

11. **Compliance posture** — ISO-27001 and SOC-2 certified, GDPR data request workflow. Material for enterprise/agency procurement. (HIGH — help.otterly.ai security topic)

12. **Quarterly health checks** included on Enterprise. (HIGH — pricing page)

13. **Multi-language interactive demo and onboarding** — English, Spanish, French, German, Chinese. Signals serious EU + LATAM agency push. (HIGH — help.otterly.ai/learn-more)

14. **"Used X times" public counters** on free tools (e.g., Query Fan-Out 11,415 uses, Landing Page Creator 177 uses) — public social proof + lets researchers gauge product traction by tool. (HIGH — direct fetch geo.otterly.ai)

---

## Gaps / UNKNOWN (Beamix should fill these before final decision)

1. **Actual in-app sidebar / IA** — `app.otterly.ai` is auth-gated; researcher could not screenshot real product. Heavy reliance on help-center topic index + secondary reviews. Recommend Adam logs the free trial and screenshots sidebar.
2. **Alerts/notifications mechanism** — one review (crawlraven) mentions email + Slack alerts with configurable thresholds, but this is not confirmed on Otterly's own pages and may be confused with competitor Analyze AI in search noise. **MEDIUM-LOW confidence — verify with trial.**
3. **Shareable read-only dashboard links** — mentioned only by crawlraven; not in official docs. LOW confidence.
4. **PDF report export workflow** — listed in help-center topic index ("PDF report generation") but UX detail unknown.
5. **Recommendations Engine output format** — is it a list of bullet text, a kanban of fix-tickets, or a content brief? Reviewers describe it as text suggestions; no screenshot found.
6. **Whether "Pro $989/mo / 1,000 prompts" tier still exists** — only dageno.ai (one secondary source) describes it; current otterly.ai/pricing only shows Lite/Standard/Premium/Enterprise. LOW confidence the Pro tier was deprecated; possible the $989 was folded into Enterprise.
7. **Marketplace** (in nav under Resources) — content not fetched; unclear if it's a template/integration marketplace or partner directory.
8. **Ambassadors program** — exists in nav; details not fetched.
9. **White-label depth** — pricing page says "Custom Google Looker Studio branding" for agencies, but unclear whether the product UI itself can be white-labelled or only the embedded report.
10. **Semrush integration** — mentioned in one review (scalenut) as a positioning, but unconfirmed whether it's a live integration or directional partnership. (semrush.com/kb/1487-otterly-ai-search-monitoring suggests it exists in the Semrush App Center.)

---

## Evidence log (all URLs visited, dated 2026-06-11)

### Otterly first-party
- https://otterly.ai (homepage)
- https://otterly.ai/pricing
- https://otterly.ai/features
- https://otterly.ai/features/prompt-research
- https://otterly.ai/features/ai-search-analytics
- https://otterly.ai/features/ai-search-optimization
- https://otterly.ai/features/mcp
- https://otterly.ai/features/api
- https://otterly.ai/geo-tools/
- https://otterly.ai/ai-keyword-research/ (→ redirects to geo.otterly.ai)
- https://otterly.ai/geo/ai-crawler-simulation/ (→ redirects)
- https://otterly.ai/geo/query-fan-out/ (→ redirects)
- https://otterly.ai/blog/looker-studio-connector-ai-search-visibility/
- https://geo.otterly.ai/geo/ai-prompt-research/
- https://geo.otterly.ai/geo/ai-query-fan-out/
- https://geo.otterly.ai/geo/ai-landingpage-creator/
- https://app.otterly.ai/prompts (auth-gated, returned minimal content)
- https://docs.otterly.ai/introduction
- https://data.otterly.ai/v1 (API base inferred from docs)

### Help center
- https://help.otterly.ai/ (topic index)
- https://help.otterly.ai/what-is-otterly.ai
- https://help.otterly.ai/learn-more
- https://help.otterly.ai/set-up-a-brand-report
- https://help.otterly.ai/brand-report-kpi-definition
- https://help.otterly.ai/insights-on-brand-reports

### Third-party reviews (2026)
- https://www.rankability.com/blog/otterly-ai-review/ (HIGH — most detailed dashboard description)
- https://www.tryanalyze.ai/blog/otterly-ai-review (HIGH — setup steps detail)
- https://discoveredlabs.com/blog/otterlyai-review-quick-start-guide-and-data-validation-framework (HIGH — setup workflow)
- https://www.aipeekaboo.com/blog/otterly-ai-review (MEDIUM)
- https://pikaseo.com/articles/otterly-ai-review (MEDIUM)
- https://www.scalenut.com/blogs/otterly-ai-review (MEDIUM)
- https://crawlraven.com/blog/otterly-review (MEDIUM — sole source for alerts/Slack claim)
- https://trakkr.ai/reviews/otterly-review (LOW)
- https://dageno.ai/blog/otterly-ai-review-2026 (LOW — only source for deprecated "Pro $989" tier)
- https://generatemore.ai/blog/otterly-ai-review (LOW)
- https://www.g2.com/products/otterly-ai/reviews (referenced via search snippets, not directly fetched — surface-skim only)
- https://www.softwareadvice.com/product/522152-Otterly-AI/ (referenced via search snippets)

### Videos referenced (not transcribed)
- https://www.youtube.com/watch?v=zAxYOtn6NGQ ("Otterly.AI Full Walkthrough" published May 8 2026)
- https://www.youtube.com/watch?v=qsX3ua0Gdo4 ("Otterly AI Review 2026 — Honest Pros, Cons & Geo Audit Explained")
- https://www.youtube.com/@Otterly-AI (official channel)

### Other directories
- https://www.aeotools.space/tool/otterly
- https://www.semrush.com/kb/1487-otterly-ai-search-monitoring (Semrush App Center entry — confirms semrush integration likely real)
- https://aiagents.saastrac.com/ai-agent/otterly-ai/

---

## Confidence summary

**Overall: MEDIUM-HIGH.** Marketing surface and help-center topic index are well-documented (HIGH). In-app screens are inferred from help docs + 8 third-party reviews without direct screenshot verification (MEDIUM). Alerts mechanism and a few minor UX details are LOW. The "monitoring-only vs action" gap analysis is HIGH confidence — multiple independent reviewers explicitly flag it.

**Recommendation to Research-Lead:** Adam runs a 14-day free trial and screenshots the actual sidebar + Recommendations Engine output. That fills 80% of the LOW/MEDIUM gaps in one hour.
