# Profound — Full Product Teardown

**Researched:** 2026-06-11 | **Researcher:** researcher (CEO-2 spawn) | **Confidence overall:** MEDIUM-HIGH
**Reason:** The marketing site + feature pages give HIGH confidence on product surface area and nav. Pricing tiers below Enterprise have MEDIUM confidence (third-party reviewers disagree on Lite vs Starter naming and exact prompt caps). Inside-the-app panel inventory is MEDIUM (assembled from reviewer screenshots/walkthroughs + Profound's own feature pages — the product is behind a sales-gated login).

---

## 1. Positioning + Pricing

**One-liner (verbatim from tryprofound.com home):** "The full stack marketing platform for the marketer of the future." Subtitle: "Optimize Your Brand's Visibility in AI Search." Frames itself as the leader of **AEO (Answer Engine Optimization)** — Adam-grade enterprise GEO, not SMB.

**Pricing (as of June 2026):**

| Tier | Price | Engines | Prompts/mo | Seats | History | Notes |
|------|-------|---------|------------|-------|---------|-------|
| Starter / Lite | $99–$499/mo (sources conflict) | ChatGPT only | ~50 | 1 | 30 days | No API. Trakkr says "Starter $99"; aisearchvisibility.com / Trakkr both reference a "$499 Lite" variant. Likely tier rename mid-2026. |
| Growth | $399/mo | ChatGPT + Perplexity + Google AI Overviews (3) | ~100 | 3 | 6 months | Content cap (6 articles/mo). Competitor tracking. |
| Enterprise | **Custom — $2,000–$5,000+/mo typical** | Up to 10–11: ChatGPT, Perplexity, Claude, Gemini, Grok, DeepSeek, Microsoft Copilot, Google AI Mode, Amazon Rufus, Meta AI | Custom | Unlimited | All-time | Prompt Volumes data, API, SOC 2, SSO, RBAC. Sales-gated. 1–3 week onboarding. |

**Sources:** [Trakkr Profound pricing](https://trakkr.ai/reviews/profound-review/pricing) (2026), [aisearchvisibility.com review](https://www.aisearchvisibility.com/product-review-profound), [tryprofound.com/pricing](https://www.tryprofound.com/pricing) — confidence MEDIUM on sub-Enterprise tiers, HIGH that Enterprise is the real product.

---

## 2. NAV TREE

Top-level marketing nav (verbatim from tryprofound.com homepage, 2026-06-11):

- **Platform**
  - Answer Engine Insights
  - Prompt Volumes (aka Conversation Explorer — Profound renamed/merged these 2026)
  - Shopping
  - Agent Analytics
  - Agents
- **Solutions** (by team)
  - AEO Teams
  - Content Teams
  - PR & Brand Teams
  - Agencies
- **Enterprise**
- **Resources**
  - Customers
  - Integrations
  - AEO Report
  - Profound University
  - Resource Center
  - Research Hub
  - Profound Index
  - Blog
  - Engineering Blog
- **Pricing**
- **Careers**
- **Log in** | **Get a Demo** | **Get Started**

**In-app nav** (inferred from reviewer walkthroughs — getmint.ai, rankability.com, aisearchvisibility, tryanalyze.ai):

- **Answer Engine Insights** (sub-tabs)
  - Visibility (Visibility Score + Share of Voice + Average Position)
  - Visibility Rankings By Topic
  - Citations
  - Sentiment
  - Query Fanouts
  - Relevant Prompts (Brand Relevant Prompts)
  - Opportunities
  - Personas
  - Custom Dashboards
- **Prompt Volumes** (formerly Conversation Explorer)
  - Keyword volume / hierarchy
  - Intent classification
  - Demographics (age / income / gender)
  - Co-Citation Mapping
  - Uncited Prompt Detection
  - Keyword Lists & Grouping
- **Shopping**
  - Shopping Visibility
  - Attribute Accuracy
  - Shopper Sentiment
  - SKU-Level Analysis
  - Merchant Layer
  - Keyword Intelligence (shopping)
- **Agent Analytics**
  - AI Crawler Visibility
  - Attribution & Traffic Insights (GA4 join)
  - Content Performance Tracking
  - Benchmarking (Profound Network — 100k+ pages)
  - Submit to AI Search
- **Agents** (the marketing-automation builder)
  - Templates (Content Refresh, AEO FAQ Generation, Competitive Research, Net-New Content)
  - Agent Builder (DAG / node canvas)
  - Background Agents (scheduled / threshold-triggered)
  - Profound Sheets (parallel agent orchestration)
  - Documents / Profound Docs
  - Knowledge Bases
  - Skills (reusable instruction sets)
  - Brand Kit
- **Ask Profound** (NL chat interface over your AI Search data)
- **Settings / Admin**
  - Brand & Competitors
  - Prompts (upload, modify, add)
  - Topics
  - Regions / Languages (30+ languages, 150+ regions)
  - Team / RBAC (Admin / Analyst / Viewer)
  - Integrations (CDN, CMS, GA4, Slack, Teams, MCP)
  - API keys (Enterprise only)

---

## 3. PER-PAGE PANEL INVENTORY

### 3.1 Answer Engine Insights

| Panel | Data shown | Update freq | User action | Evidence + confidence |
|-------|------------|-------------|-------------|-----------------------|
| Visibility Score | % of tracked responses that mention your brand, vs. previous period checkbox, vs. competitors toggle | Daily | Toggle "Compare competitors"; filter by topic / platform / region / language / date | tryprofound blog "How to Track Visibility" — HIGH |
| Share of Voice | Brand vs. competitor mention share + "Share of Voice Rank" list | Daily | Check competitors to include; click to drill | getmint.ai walkthrough — HIGH |
| Average Position | Ordinal rank of brand within answers, time series | Daily | Filter by platform / topic | getmint.ai — MEDIUM |
| Visibility Rankings By Topic | Topic-grouped leaderboard of all tracked prompts | Daily | Hover-focus a competitor; click-through to per-prompt analysis | tryprofound homepage + getmint — HIGH |
| Citations — Citation Share | % of all citations earned by your domain | Daily | Filter; export CSV | tryprofound + aisearchvisibility — HIGH |
| Citations — Citation Rank | Leaderboard of domains by citation frequency | Daily | Filter by engine / topic | aisearchvisibility — HIGH |
| Citations — Top Citation Domains | Source domains driving AI answers | Daily | Click to inspect; **add a page to tracking** | getmint.ai — HIGH |
| Citations — Top Citation Pages | URL-level mentions | Daily | Click-to-track a specific URL | getmint.ai — HIGH |
| Citations — Earned / Owned / Social categorisation | Source type breakdown | Daily | Filter by category | aisearchvisibility — HIGH (NEW in 2026) |
| Sentiment Analysis | Positive vs negative perception % | Daily | View full underlying responses | aisearchvisibility + tryprofound blog — HIGH |
| Sentiment Themes | Recurring narrative themes (e.g. cost / complexity / reliability) with examples from model outputs | Daily | Click a theme → see source quotes | aisearchvisibility — HIGH |
| Query Fanouts | Sub-queries the engines fan a prompt out into | Daily | View word-transformation diff | tryprofound blog/product — MEDIUM |
| Brand Relevant Prompts | Prompts that cite you even though not in tracking set | Daily | Add to tracked set with one click | tryprofound blog/product — HIGH |
| Opportunities | Suggested actions (outreach / content / optimization) | On change | Click to triage / dispatch to an Agent | getmint.ai — MEDIUM |
| Personas | Audience segment views over the same data | Daily | Select persona | tryprofound product blog — MEDIUM |
| Custom Dashboards | User-built shareable views | User-controlled | Build, save, share | tryprofound product blog — MEDIUM |
| Asset Hierarchies | Track products / features / sub-assets independently | Daily | Define hierarchy | tryprofound product blog — MEDIUM |

### 3.2 Prompt Volumes (Conversation Explorer)

| Panel | Data shown | Update freq | User action | Evidence + confidence |
|-------|------------|-------------|-------------|-----------------------|
| Interactive Keyword Hierarchy | Seed keyword → related sub-topics tree | On query | Click to drill | tryprofound prompt-volumes — HIGH |
| Multi-Tab Keyword Analysis | Volume / Intent / Demographics / Hierarchy tabs | On query | Switch tabs, change filters | tryprofound — HIGH |
| Sunburst Chart | Sub-intent spectrum for a keyword | On query | Drill into wedges | tryprofound — HIGH |
| Volume by platform | ChatGPT, Gemini, Claude, Perplexity, Copilot, Other | Continuously | Filter | tryprofound — HIGH |
| Demographics | Age / income / gender breakdown | Continuously | Filter | tryprofound product blog (2026 addition) — HIGH |
| Geography | 10 countries (US, UK, Canada, Germany, France, Italy, Brazil, Australia, Spain, South Korea) | Continuously | Filter | tryprofound prompt-volumes — HIGH |
| Automated Intent Classification | informational / commercial / conversational / generative | Continuously | Filter, list view | tryprofound — HIGH |
| Co-Citation Mapping | Competitors appearing alongside you | Continuously | Click competitor → drill | tryprofound — HIGH |
| Uncited Prompt Detection | Prompts where competitors rank but you don't | Continuously | Click → add to tracking → dispatch Agent | tryprofound — HIGH |
| Keyword Lists & Grouping | User-built lists per initiative | User-controlled | Create / edit / share | tryprofound — HIGH |
| Prompt Research Reports | One-shot reports against 1.5B+ real-user prompts | On request | Generate | nicklafferty/athena — MEDIUM |

### 3.3 Shopping

| Panel | Data shown | Update freq | User action | Evidence + confidence |
|-------|------------|-------------|-------------|-----------------------|
| Shopping Visibility | Baseline product visibility in ChatGPT-Shopping responses | Daily | Filter category / region | tryprofound/shopping — HIGH |
| Shopping Mode Rate | % of category queries triggering ChatGPT Shopping UI vs text | Daily | Filter | tryprofound — HIGH |
| Visibility Score Rankings (Shopping) | Per-product rank within shopping responses | Daily | Drill into product | tryprofound + getmint — HIGH |
| Attribute Accuracy | How AI categorises/describes your product attributes | Daily | View errors → push fix to PDP | tryprofound — HIGH |
| Shopper Sentiment | How AI shopping descriptions influence buyer perception | Daily | Themed view | tryprofound — HIGH |
| SKU-Level Analysis | Per-SKU citations + prompts triggering it | Daily | Pick a SKU | tryprofound — HIGH |
| Merchant Layer | Which retailers / DTC stores own checkout share | Daily | Compare share | tryprofound — HIGH |
| Keyword Intelligence (Shopping) | Prompts driving product discovery | Daily | Add to tracking | tryprofound — HIGH |
| Competitive Targeting | Categories where competitor appears but you don't | Daily | Dispatch action | tryprofound — HIGH |
| Sentiment & Visibility Matrix | 2-axis competitive map | Daily | View | getmint.ai walkthrough — MEDIUM |

### 3.4 Agent Analytics

| Panel | Data shown | Update freq | User action | Evidence + confidence |
|-------|------------|-------------|-------------|-----------------------|
| AI Crawler Visibility | When/how-often/which AI bots hit your site (GPTBot, PerplexityBot, ClaudeBot, GoogleOther, etc.) | Real-time | Filter by bot / page | tryprofound/agent-analytics — HIGH |
| Spoofed-bot filter | IP-validated vs spoofed crawler hits | Real-time | Toggle | tryanalyze.ai — HIGH |
| Attribution & Traffic Insights | Human visitors landing from AI sources, joined to GA4 | Daily | Filter, GA4 join | tryprofound — HIGH |
| Content Performance Tracking | Pages most referenced in AI answers | Daily | Drill | tryprofound — HIGH |
| Benchmarking | Citation perf vs 100k+ pages in Profound Network | Daily | View percentile | tryprofound — HIGH |
| Crawling Analytics | Crawl health: frequency + completeness | Real-time | View gaps | nicklafferty — HIGH |
| Submit to AI Search | Push pages for AI indexing | On action | Click "submit" | tryprofound — MEDIUM |
| Bot Visits + Human Referrals nodes | Embeddable in Agents | n/a | Use as Agent node | tryprofound product blog — HIGH |

**Integrations driving Agent Analytics:** AWS, GCP, Akamai, Cloudflare, Fastly, Netlify, Vercel, WordPress (custom plugin), Shopify, Adobe.

### 3.5 Agents (the marketing automation builder)

| Panel | Data shown | Update freq | User action | Evidence + confidence |
|-------|------------|-------------|-------------|-----------------------|
| Templates | 4 named: Content Refresh / AEO FAQ Generation / Competitive Research / Net-New Content Creation | n/a | Clone & customize | tryprofound/agents — HIGH |
| Agent Builder canvas | DAG of nodes | User-controlled | Drag-drop, connect, run | tryprofound + product blog — HIGH |
| Node library | Web scrape, LLM prompt, AEI lookup, API call, Google Suite (email/docs/sheets/slides), CMS (WordPress/Sanity/Contentful/Webflow/Framer), Google Search, Search Console, Slack, Gamma, v0 landing-page gen, PartnerStack, Noble (citations), OpenAI Ads, Google Drive, Notion, Iteration nodes, Bot Visits, Human Referrals | Live | Drop on canvas | tryprofound product blog — HIGH |
| Agent Assistant | Build agents by NL or voice description | Live | Type/speak the agent | tryprofound 2026 post — HIGH |
| Background Agents | Always-on, threshold/schedule-triggered | Live | Configure trigger | tryprofound 2026 — HIGH |
| Profound Sheets | Spreadsheet UI for parallel agent runs | Live | Fill rows → batch run | tryprofound + nicklafferty — HIGH |
| Knowledge Bases | Brand/product context for agents | User-controlled | Upload, sync (Notion/GDrive) | tryprofound product blog — HIGH |
| Skills | Reusable instruction sets | User-controlled | Create/share | tryprofound product blog — HIGH |
| Brand Kit | Logos, voice, palette injection for content | User-controlled | Configure | tryprofound — HIGH |
| 16 reasoning models | OpenAI / Anthropic / Google / etc. selectable per node | Live | Pick model | tryprofound/agents — HIGH |
| Image Generation | Brand-kit aware image creation | Live (shipping) | Generate | tryprofound 2026 — MEDIUM |
| Profound Docs | Full rich-text, collaborative, AI-assisted docs | Live (shipping) | Edit | tryprofound 2026 — MEDIUM |

### 3.6 Cross-product / Platform-wide

| Panel | What | Evidence |
|-------|------|----------|
| Ask Profound | Conversational chat over all your AI-search data, with citations + sentiment | tryprofound 2026 + nicklafferty/athena — HIGH |
| Custom Dashboards | Shareable views combining any panels | tryprofound product blog — HIGH |
| Instant Citation Alerts | Push notifications on visibility change | nicklafferty review — MEDIUM |
| Change-log correlation | Compare visibility against your CMS/content changes | nicklafferty — MEDIUM |
| Screenshot archive | Timestamped snapshots of AI answers | nicklafferty — MEDIUM |
| Slack integration | Live | tryprofound 2026 — HIGH |
| Microsoft Teams | "Coming next" | tryprofound 2026 — HIGH |
| MCP support | Query Profound from ChatGPT / Claude / Cursor | tryprofound 2026 — HIGH |

---

## 4. MANUALLY-OPERABLE TOOLS — The Load-Bearing List

This is the focused inventory of every action the user actively performs (not just views). Grouped by "what can a customer DO".

### 4.1 Configure what's measured
1. **Upload custom prompts** or design tailored ones (any tier).
2. **Modify / add prompts** after initial config.
3. **Define topics** (and topic-level scopes).
4. **Add competitors** to track.
5. **Add brands / sub-brands / products / features** via **Asset Hierarchies**.
6. **Pick regions** (150+) and **languages** (30+).
7. **Pick engines** (tier-gated; up to 10–11 at Enterprise).
8. **Promote a `Relevant Prompt`** (one Profound found you cite on) into the tracked set.
9. **Click-to-track** any URL from the citation panels.
10. **Create Personas** (audience segments) and re-cut all dashboards by them.
11. **Build Keyword Lists & Groupings** per initiative.

### 4.2 Investigate (drilldown / research)
12. **Filter** all dashboards by date / region / language / platform / brand / prompt / topic.
13. **Drill** into a sunburst wedge / hierarchy node / theme / sub-query.
14. **View full underlying AI responses** behind any sentiment / theme.
15. **Compare to previous period** (toggle) and **compare against competitors** (toggle).
16. **Run a Prompt Research Report** against 1.5B+ real-user prompt corpus.
17. **Query the dataset in natural language with Ask Profound** (returns answers with citations + sentiment).
18. **Use MCP** to query Profound from ChatGPT / Claude / Cursor.
19. **Export CSV** of any panel.

### 4.3 Build / Author content & agents (the "do the work" tier)
20. **Build an Agent** in the DAG canvas (drag-drop nodes: web scrape, LLM prompt, AEI lookup, API call, CMS publish, Google Suite, Slack, Search Console, v0 landing-page gen, etc.).
21. **Build an Agent by NL or voice** via Agent Assistant.
22. **Clone a Template Agent** (Content Refresh, AEO FAQ Generation, Competitive Research, Net-New Content).
23. **Schedule an Agent** or fire it on a threshold via **Background Agents**.
24. **Run an Agent in bulk via Profound Sheets** (one row = one execution).
25. **Connect a Knowledge Base** (Notion / GDrive sync) and a **Brand Kit** to Agents.
26. **Create reusable Skills** (instruction sets agents share).
27. **Pick from 16 reasoning models** per node.
28. **Publish output directly to CMS** (WordPress, Sanity, Contentful, Webflow, Framer).
29. **Generate brand-aware images** (shipping).
30. **Author docs** in Profound Docs (collab + AI-assisted, shipping).
31. **Generate a landing page** via v0 node.
32. **Generate a deck** via Gamma node.
33. **Generate FAQs** with the AEO-Optimized FAQ Generator.

### 4.4 Operate the technical AEO surface
34. **Install CDN integration** (Cloudflare/Vercel/Fastly/Akamai/Netlify/AWS/GCP) to capture crawler logs.
35. **Install the Profound WordPress plugin** (or Shopify integration).
36. **Submit pages to AI Search** ("Submit to AI Search" action).
37. **Validate crawlers** (toggle IP-range spoof filter).
38. **Join GA4** for human-visitor attribution.

### 4.5 Collaborate / operate the org
39. **Build Custom Dashboards** and **share** them.
40. **Triage Opportunities** (action queue).
41. **Set up Instant Citation Alerts** (push to Slack / Teams).
42. **RBAC**: assign Admin / Analyst / Viewer.
43. **Compare against your changelog** via Change-log correlation.
44. **Browse Screenshot archive** of past AI answers (timestamped).

### 4.6 Shopping-specific manual tools
45. **Drill any SKU** to see citing prompts + competitor SKUs.
46. **Spot Attribute-Accuracy errors** in how AI describes your product → push fix to PDP.
47. **See where competitors win** and your SKU doesn't → dispatch an Agent.

### 4.7 What the user can NOT manually do (notable absences)
- No Reddit / forum monitoring panel (per Trakkr; competitors like Athena have it).
- No self-serve onboarding for Enterprise — sales-required, 1–3 week implementation.
- No free trial; Lite tier is paid.
- Below Enterprise: no API, no full engine set, no Prompt Volumes panel.

---

## 5. NOTABLE / DISTINCTIVE features competitors lack

1. **Prompt Volumes panel data** — Profound buys real prompt logs from double-opt-in consumer panels (claims 400M+ prompts, growing toward 1.5B+ in reports). No competitor matches the scale.
2. **Conversation Explorer with demographic cuts** (age / income / gender) and 10-country coverage.
3. **Agents as a full DAG marketing-automation builder** with 30+ named nodes incl. CMS publish, v0, Gamma, Search Console, PartnerStack, OpenAI Ads — closer to Zapier-for-AEO than a "write me an article" button.
4. **Profound Sheets** — spreadsheet UI for running an agent thousands of times in parallel; a real workflow primitive.
5. **Ask Profound + MCP** — query your entire AEO dataset conversationally, also from inside Claude/ChatGPT/Cursor.
6. **Agent Analytics at scale** — billions of CDN server logs processed; benchmarking against 100k+ pages in the Profound Network. Most competitors offer only a JS pixel.
7. **Shopping module with Shopping Mode Rate + Merchant Layer + SKU-level analysis** — purpose-built for ChatGPT Shopping, with attribute-accuracy diagnostics.
8. **Earned / owned / social citation categorisation** (added 2026) — PR-team-grade source typing.
9. **Sentiment Themes with verbatim model-output examples** — not just a +/- score.
10. **Query Fanouts panel** — exposes the sub-queries an engine internally generates from a prompt.
11. **Background Agents** — threshold-triggered always-on; closest competitor analogue is generic Zapier.
12. **HIPAA + SOC 2 Type II + SSO + RBAC** — only enterprise-grade GEO platform with HIPAA (claimed in 2026 product post).
13. **Asset Hierarchies + Personas** — multi-brand / multi-segment cuts of the same data; rare in the category.
14. **Submit-to-AI-Search action** — proactive crawl invite, not just observation.
15. **Screenshot archive of AI answers** (forensic / legal-grade evidence).

---

## 6. Evidence log

| # | URL | Title | Date accessed |
|---|-----|-------|---------------|
| 1 | https://www.tryprofound.com/ | Profound homepage — nav + product list | 2026-06-11 |
| 2 | https://www.tryprofound.com/features/answer-engine-insights | Answer Engine Insights feature page | 2026-06-11 |
| 3 | https://www.tryprofound.com/features/prompt-volumes | Prompt Volumes feature page | 2026-06-11 |
| 4 | https://www.tryprofound.com/features/conversation-explorer | Conversation Explorer (redirects to Prompt Volumes) | 2026-06-11 |
| 5 | https://www.tryprofound.com/features/shopping | Shopping feature page | 2026-06-11 |
| 6 | https://www.tryprofound.com/features/agent-analytics | Agent Analytics feature page | 2026-06-11 |
| 7 | https://www.tryprofound.com/features/agents | Agents feature page | 2026-06-11 |
| 8 | https://www.tryprofound.com/blog/profound-2026 | "Where we're taking the Profound product" — 2026 roadmap | 2026-06-11 |
| 9 | https://www.tryprofound.com/blog/product | Product changelog feed | 2026-06-11 |
| 10 | https://www.tryprofound.com/blog/how-to-track-your-visibility-in-ai-search | Step-by-step UI walkthrough by Profound | 2026-06-11 |
| 11 | https://trakkr.ai/reviews/profound-review | Trakkr Profound review w/ pricing detail | 2026-06-11 |
| 12 | https://trakkr.ai/reviews/profound-review/pricing | Trakkr pricing-only breakdown | 2026-06-11 |
| 13 | https://nicklafferty.com/reviews/profound-best-aeo-geo-platform-for-ai-search/ | Lafferty review w/ navigation list | 2026-06-11 |
| 14 | https://nicklafferty.com/blog/profound-vs-athena/ | Profound vs Athena comparison | 2026-06-11 |
| 15 | https://www.aisearchvisibility.com/product-review-profound | Hands-on Profound review w/ dashboard tabs | 2026-06-11 |
| 16 | https://www.rankability.com/blog/profound-ai-review/ | Rankability review (lighter on UI specifics) | 2026-06-11 |
| 17 | https://www.tryanalyze.ai/blog/profound-ai-review | Analyze AI review w/ side-by-side panel inventory | 2026-06-11 |
| 18 | https://getmint.ai/resources/profound-review | Getmint review (loader hit — used summary cache only) | 2026-06-11 |

---

## Gaps / UNKNOWN

- **Exact Starter/Lite naming and price** — Trakkr lists "$99 Starter (ChatGPT only)" while aisearchvisibility lists "$499 Lite (ChatGPT only)". Likely Profound renamed/restructured mid-2026; no source quotes the pricing page directly because the page is JS-rendered behind a loader. **UNKNOWN.**
- **Exact prompt cap by tier above Growth** — Enterprise is "custom"; no public number. **UNKNOWN.**
- **Trigger types** for Background Agents (threshold options, webhook payload schema) — known to exist but not documented publicly. **UNKNOWN.**
- **Full list of node types in Agent Builder** — Profound says "180+ production nodes" appear in Analyze AI's comparison article, but that count is for Analyze AI, not Profound. Profound's own count is undisclosed; we documented 25+ named node types. **UNKNOWN** (exact total).
- **Whether Microsoft Teams + Profound Docs + Image Gen have shipped or remain "coming next"** as of 2026-06-11 — 2026 roadmap post said "shipping shortly". **MEDIUM.**
- **Profound Index** (resource center item) — referenced as a research database; structure/UI not documented publicly. **UNKNOWN.**

---

**File path:** `/Users/adamks/VibeCoding/Beamix/.worktrees/ceo-2-1781190242/docs/02-competitive/teardown-2026-06/PROFOUND-TEARDOWN.md`
