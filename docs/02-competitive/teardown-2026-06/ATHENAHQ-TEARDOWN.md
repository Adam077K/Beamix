# AthenaHQ — Full Product Teardown

**Researched:** 2026-06-11
**Researcher:** researcher (deep-research)
**Confidence overall:** MEDIUM-HIGH
**Method:** Marketing site (athenahq.ai) + Plans, Enterprise, Agency, Capability sub-pages + 8 third-party reviews (G2, Capterra, Trakkr, Rankability, Dageno, Getmint, Indexly, Radarkit, aipeekaboo, Scalenut, tryprofound) + SourceForge demo article. Product UI is auth-gated; nav and panels are reconstructed from marketing imagery, demo article, and reviewer screenshots. Marked LOW where only one reviewer described it.

---

## 1. One-line positioning + pricing

> **"Agents to Win on AI Search."** AthenaHQ is a credit-metered GEO/AEO platform that monitors brand visibility across 8+ LLMs (ChatGPT, Gemini, Claude, Perplexity, Google AI Overviews, AI Mode, Copilot, Grok) and pairs the monitoring with an **Action Center** + autonomous **Content Agents** that draft/refresh brand content. Olympus is the unified dashboard; ACE (Athena Citation Engine) is the proprietary citation-probability model. (HIGH — `https://athenahq.ai/` 2026-06-11)

**Pricing (sticker, 2026-06-11):**

| Plan | Monthly | Annual (eff. /mo) | Credits/mo | Seats | Countries | Source |
|---|---|---|---|---|---|---|
| **Self-Serve / Lite** | $295 | ~$270 (17% off) | 3,600 | 3 (Unlimited+RBAC claimed on marketing) | 1 | athenahq.ai/plans (HIGH) |
| **Growth** (only on third-party reviews; not visible on /plans top-level) | $545 / $595 (conflicting) | — | 10,000 | 5+ | Multi | Trakkr, SourceForge (MEDIUM) |
| **Enterprise** | Custom (~$2,000+/mo per Trakkr) | Custom | Custom | Custom | Multi (90+ countries supported on platform) | athenahq.ai/plans + Trakkr (MEDIUM) |
| First-month promo | 67% off Self-Serve (~$95) | — | — | — | — | athenahq.ai/plans (HIGH) |
| Overage credits | $100 per 1,250 credits ≈ $0.08/credit | — | — | — | — | Trakkr, Rankability (MEDIUM) |

**Credit semantics:** "1 credit = 1 AI response." Credits are consumed by tracked prompts × engines × cadence × locations + Ask Athena queries + on-demand analyses. (HIGH — credit-calculator + plans page)

**No free trial. No free tier.** First-month discount only. (HIGH — multiple reviews)

**Compliance / scale claims (Enterprise page, HIGH):** SOC 2 Type I & II, GDPR, NIST CSF Tier 3; "1.7B page views, 85M unique AI sources, 90+ countries, 6 continents."

---

## 2. NAV TREE (reconstructed)

### Marketing site nav (athenahq.ai)
- **Platform** ▾ (Athena Capabilities)
  - Prompt Volume
  - Monitoring
  - Content Agents
  - Agencies
  - Ecommerce
  - Brand Integrity
- **Case Studies**
- **Plans** (pricing)
- **Enterprise**
- **Agencies** (and `/agency` Agency Program with Bronze/Silver/Gold tiers)
- **Industry** ▾ (33+ verticals: CPG, Beauty, Pet, Retail, E-Commerce, Luxury, Grocery, Finance, Banking, Insurance, Wealth, Healthcare, Wellness, Pharma, MedTech, GLP-1, Travel, Hotels, Tours, Software, SaaS, Dev Tools, Multi-Location, Restaurants, Franchise, Fitness, Auto Services, Location Services, Multi-Brand, Education, Higher Ed, EdTech)
- **Comparison** ▾ (vs Profound, Clearscope, BrightEdge, Conductor, Surfer, Semrush, Scrunch AI, Ahrefs, Peec AI)
- **Resources**
  - Blog
  - State of AI Search (annual report)
  - Credit Calculator
  - Trust Center
  - Brand Assets
- **Company** (About, Careers)
- **Contact Sales / Log in / Sign up** → `app.athenahq.ai`

### Product app nav (inferred — `app.athenahq.ai`)

Reconstructed from tryprofound review (most granular), SourceForge demo article, and Radarkit/Rankability descriptions. Confidence MEDIUM unless noted.

- **Olympus** (Home / Brand Intelligence Dashboard) — HIGH (named in multiple sources)
- **Monitor**
  - **Answer Engine Insights** — prompt-level results per engine (MEDIUM, tryprofound)
  - **Prompt Volumes** — query-volume estimation (HIGH; Enterprise-only per /plans)
  - **Shopping** — product-feed / ecommerce monitor (MEDIUM, tryprofound)
  - **Agent Analytics** — AI-bot/crawler traffic to your site (MEDIUM; conflicts with Trakkr's claim "no crawler analytics" — LOW until resolved)
- **Create**
  - **Agents** (Content Agents) — autonomous content drafters (HIGH)
- **Action Center** — prioritized fix tasks (HIGH; named everywhere)
- **Ask Athena** — conversational copilot over your visibility data (HIGH)
- **Pitch Workspace** (Agency only) — generates prospect reports in <5 min (HIGH)
- **Sources / Citations** — domain & page-level citation tracking (MEDIUM)
- **Competitors** — share-of-voice + impersonation tracking (HIGH)
- **Sentiment** — brand-tone monitoring (HIGH)
- **Content Optimizer / Recommendations** — gap-driven content briefs (HIGH)
- **Brand Integrity** — hallucination/claim accuracy monitor + recovery tracker (HIGH)
- **Settings**
  - Members / RBAC (HIGH; unlimited seats with RBAC claimed)
  - Integrations (Shopify, GA4, Webflow, Cloudflare, Vercel, Looker Studio, Tableau) (MEDIUM)
  - SSO (SAML/OIDC — Enterprise) (HIGH)
  - Audit logs (Enterprise) (HIGH)
  - API keys (Enterprise) (HIGH)
  - Credits & Billing (HIGH)

---

## 3. PER-PAGE PANEL INVENTORY

### 3.1 Olympus (Home Dashboard)
| Panel | Data shown | Update frequency | User action exposed | Evidence + confidence |
|---|---|---|---|---|
| Unified **GEO Score** | Aggregate of citation count, sentiment, traffic impact, query types | Continuous / per-run | View; drill-down | Dageno, Trakkr (HIGH) |
| **Share of Voice (SOV)** | Brand vs competitors across LLMs | Per-run | Filter by engine, period, competitor | SourceForge demo (HIGH) |
| **Responses analyzed / Sources tracked / Citations** counters | Top-line activity stats | Continuous | Click-through to detail | SourceForge demo (HIGH) |
| **Best/Worst performing content** | Pages your brand owns ranked by AI pickup | Per-run | Open → trigger Action Center fix | SourceForge demo (HIGH) |
| **Top sources** widget | Third-party domains feeding AI answers (e.g., SaaSworthy, Slashdot) | Continuous | Open source detail; trigger outreach | SourceForge demo (HIGH) |
| **Brand mentions over time** | Trend line of mention volume | Continuous | Date range filter | SourceForge demo + multiple reviews (HIGH) |
| Geographic / Region map | AI search performance by country | Per-run | Switch region (Enterprise) | athenahq.ai/monitoring (HIGH) |
| Live shareable dashboard link | Same view, shareable URL | Real-time | Copy share link to team/client | athenahq.ai/monitoring (HIGH) |

### 3.2 Monitor → Answer Engine Insights (Prompt Tracker)
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| Prompt list | Tracked prompts, mention rate, citation rate per engine | Per cadence (daily/weekly) | **Add prompt** (seed-phrase suggester); pause; delete; tag | tryprofound, aipeekaboo (HIGH) |
| Per-prompt response viewer | Raw AI response with brand/competitor tags highlighted | Per-run | View; copy; flag as hallucination → routes to Brand Integrity | tryprofound (HIGH) |
| Engine comparison | Same prompt across ChatGPT/Gemini/Claude/Perplexity/AIO/AI Mode/Copilot/Grok | Per-run | Toggle engines | aipeekaboo, plans page (HIGH) |
| Topic clusters | Automatic clustering of prompts | — | Filter; drill | aipeekaboo (MEDIUM) |
| Suggested prompts | "Curated or suggested prompts for coverage" | — | **Accept/add to tracked set** | Capterra feature list (MEDIUM) |

### 3.3 Monitor → Prompt Volumes (Enterprise only)
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| Estimated monthly query volume | Per prompt, by region | Monthly | View; export | athenahq.ai/prompt-volume (HIGH) |
| Trending prompts in your vertical | Emerging AI search patterns | Weekly | **Promote to tracked** | athenahq.ai/prompt-volume (HIGH) |
| Dollar value of prompt | Some reviewers describe $-assigned prompts | — | Sort/filter | aipeekaboo (LOW — single source) |

### 3.4 Sources / Citations
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| Domain-level citation table | Which 3P domains AI cites for your space, citation rate | Continuous | Open URL; **trigger Outreach** task | tryprofound (HIGH) |
| Page-level citations | Specific URLs cited + which prompts triggered them | Continuous | Open page; copy; tag | tryprofound (HIGH) |
| Source intelligence | Author identification for outreach | — | **Generate outreach brief** | tryprofound (MEDIUM) |

### 3.5 Competitors
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| SOV vs each competitor | Mentions, citations, recommendations | Per-run | **Add competitor**; remove; rename | rankability, radarkit (HIGH) |
| Impersonation tracking | Detect AI confusing your brand with a competitor | Per-run | View; flag | athenahq.ai/plans (HIGH) |
| Gap analysis | Prompts where competitor wins citation, you don't | Per-run | **Send to Action Center** | rankability, dageno (HIGH) |

### 3.6 Sentiment / Brand Integrity
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| Sentiment over time | Positive/neutral/negative per prompt and aggregate | Continuous | Filter; export | multiple reviews (HIGH) |
| AI Answer Accuracy Monitor | How AI describes your products/claims/competitors | Continuous | Flag inaccuracy | athenahq.ai/brand-integrity (HIGH) |
| **Hallucination & Claim Detection** | Fabricated facts, unsupported comparisons | Continuous | **Open fix workflow → routes to content/comms** | athenahq.ai/brand-integrity (HIGH) |
| **Prioritized Fix Routing** | Tasks tagged by team owner (content / comms / product) | On detection | **Assign owner**; mark resolved | athenahq.ai/brand-integrity (HIGH) |
| Before/After recovery tracker | Factual-accuracy delta after deployed fix | Per re-run | View; share | athenahq.ai/brand-integrity (HIGH) |

### 3.7 Action Center
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| Prioritized task list | Generated from gap/citation/sentiment data | Per-run | **Assign owner, set priority, mark complete** | dageno, rankability (HIGH) |
| Task type tabs | On-page fix · Off-page (PR/outreach/Reddit) · Schema · FAQ · Content refresh · Content sniping | — | **Open task → kicks Content Agent or generates brief** | tryprofound, rankability (HIGH) |
| Workflow status | Assigned → in progress → done | Real-time | Update status; comment | dageno (MEDIUM) |

### 3.8 Create → Content Agents (autonomous drafters)
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| Agent gallery | Available agents (content refresh, brand-voice drafter, brief writer, FAQ generator) | — | **Run agent → generates draft** | athenahq.ai/content-agents (HIGH) |
| Brand voice configuration | "On-Brand Content, At-Scale … in Your Brand's Unique Voice" | — | Configure voice/tone | athenahq.ai/content-agents (HIGH) |
| Draft output viewer | Generated content + reason | Per-run | **Edit → publish to Shopify/Webflow** | aipeekaboo (HIGH for publish) |
| Content gap → draft pipeline | Auto-pulled from Action Center | — | One-click draft from gap | dageno, aipeekaboo (HIGH) |
| **Deep Research** (Enterprise only) | Content Optimization AI Agent with Deep Research mode | — | **Run deep research draft** | athenahq.ai/plans (HIGH) |
| **Self-improving content workflows** (Enterprise only) | Loops generated content back through measurement | — | Enable/disable loop | athenahq.ai/plans (HIGH) |

### 3.9 Monitor → Agent Analytics / AI Traffic
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| AI-bot crawl trends | GPTBot, ClaudeBot, PerplexityBot, AppleBot hits to your site | Continuous | View; filter by bot/page | aipeekaboo (HIGH for Vercel/Webflow/Cloudflare integration); Trakkr says "no crawler analytics" so this likely requires integration (MEDIUM overall) |
| **LLM traffic analysis** (Enterprise only) | Sessions originating from AI referrers + on-site behavior | Continuous | Drill by source/page | athenahq.ai/plans (HIGH) |
| Page coverage | Which pages AI bots crawled | — | Filter | aipeekaboo (MEDIUM) |

### 3.10 Ecommerce / Shopping
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| Shopify product feed visibility | How AI surfaces your SKUs | Per-run | View per-SKU | athenahq.ai/ecommerce (HIGH) |
| Revenue attribution | Revenue/sales tied to AI Search citations | Continuous | Drill by source | athenahq.ai/ecommerce (HIGH) |
| **Publish GEO blog → Shopify** | One-click publish of AI-optimized blog | On-demand | **Publish to Shopify** | athenahq.ai/ecommerce (HIGH) |

### 3.11 Ask Athena (copilot)
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| Chat panel over your data | Conversational queries over visibility data | On-demand | **Ask question → receives synthesized answer with citations to your panels** | Trakkr, dageno (HIGH) |
| Credit meter | Each Ask Athena query costs credits | — | View remaining | inferred (MEDIUM) |

### 3.12 ACE — Athena Citation Engine (Enterprise only)
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| Citation probability score per page/passage | ML prediction of how likely AI will cite | Per-run | View score; **trigger refresh agent** | Sep 2025 launch post + science blog post; multiple reviews (HIGH) |
| Validation: "top-decile cited 87%, bottom-decile 38.6%" | Model accuracy stat | — | — | athenahq.ai blog 2026-05-28 (HIGH) |

### 3.13 Pitch Workspace (Agency only)
| Panel | Data shown | Frequency | User action | Evidence |
|---|---|---|---|---|
| Pre-built audit template | Prospect's AI visibility audit | On-demand (<5min generation) | **Generate report → white-labeled PDF/share link** | athenahq.ai/agencies + agency program (HIGH) |
| Content gap & citation projection | Forecast of improvements if hired | — | Edit / export | aipeekaboo (HIGH) |
| Competitive benchmark | Prospect vs competitors | — | Edit | aipeekaboo (HIGH) |
| Lead Routing | Inbound leads matched by vertical (Silver+/Gold tier) | — | Accept/decline | athenahq.ai/agency (HIGH) |

### 3.14 Settings
| Panel | Data shown | User action | Evidence |
|---|---|---|---|
| Members / RBAC | Roles, permissions; "unlimited seats with RBAC" | Invite, set role, remove | athenahq.ai/plans (HIGH) |
| Integrations | Shopify, GA4, Webflow, Cloudflare, Vercel, Looker Studio, Tableau, HubSpot Marketing Hub | Connect/disconnect | Capterra, SourceForge, aipeekaboo (MEDIUM) |
| SSO (SAML/OIDC) — Enterprise | Identity provider config | Configure | athenahq.ai/plans (HIGH) |
| Audit logs — Enterprise | Activity log | View, export | athenahq.ai/plans (HIGH) |
| API keys — Enterprise | Generate keys | Create/revoke | athenahq.ai/plans (HIGH) |
| Billing & Credits | Usage meter; top-up | **Buy 1,250-credit blocks**; switch plan | Trakkr (HIGH) |

---

## 4. MANUALLY-OPERABLE TOOLS (load-bearing — what the user can DO)

This is what an SMB owner/marketer can actively run, configure, or create themselves. Grouped by intent.

### Configure WHAT to monitor
1. **Add / remove / tag tracked prompts** with a seed-phrase suggester. (HIGH)
2. **Add / remove competitors** (unlimited per plans page). (HIGH)
3. **Select tracked AI engines** (subset of 8+). (HIGH)
4. **Select tracked geography** (1 country on Self-Serve; multi on Enterprise). (HIGH)
5. **Configure monitoring cadence** (consumes credits; cadence drives credit burn). (HIGH; cadence is an explicit credit-calculator input)
6. **Configure brand voice / tone** for Content Agents. (HIGH)

### Run / generate (core action surface)
7. **Run on-demand prompt re-check** across selected engines. (HIGH — credit spend)
8. **Ask Athena** — open-ended conversational queries against your data. (HIGH)
9. **Run a Content Agent** to draft / refresh a page in brand voice. (HIGH)
10. **Run Deep-Research Content Optimization Agent** (Enterprise). (HIGH)
11. **Generate an outreach brief** for a top-source domain. (MEDIUM — tryprofound only)
12. **Generate FAQ / schema additions** via Action Center task. (HIGH)
13. **Generate a content brief / "content sniping" suggestion** (steal weak-competitor citation). (HIGH — tryprofound)
14. **Generate a Pitch Workspace report** (Agency tier) — white-labeled, <5 min. (HIGH)

### Act on findings
15. **Assign Action Center tasks** to teammates with priority + status. (HIGH)
16. **Route hallucination fixes** to content / comms / product owners. (HIGH)
17. **Mark fixes resolved → triggers Before/After re-measurement.** (HIGH)
18. **Publish AI-optimized blog directly to Shopify.** (HIGH)
19. **Publish to Webflow (CMS) via integration.** (MEDIUM — Capterra; not on athenahq.ai)
20. **Flag an AI response as inaccurate** → enters Brand Integrity queue. (HIGH)
21. **Open / share a live dashboard URL** with team or client. (HIGH)

### Operate the account
22. **Invite teammates + assign RBAC roles** (unlimited seats). (HIGH)
23. **Connect integrations** (Shopify, GA4, Webflow, Cloudflare, Vercel, Looker Studio, Tableau, HubSpot Marketing Hub). (MEDIUM)
24. **Configure SSO** (SAML/OIDC — Enterprise). (HIGH)
25. **Buy add-on credit blocks** (1,250 credits for $100). (HIGH)
26. **Generate API keys** and call API (Enterprise). (HIGH)
27. **Export dashboards / data to Looker / Tableau** (Enterprise). (HIGH)
28. **Run the public Credit Calculator** to estimate monthly credit burn (pre-purchase tool, MEDIUM). (HIGH)

### NOT a user-operable tool (one notable absence)
- **No subreddit / Reddit monitoring**, only suggestions of subreddits to post in. (MEDIUM — Trakkr)
- **No native crawler analytics in the box** — requires Cloudflare/Vercel/Webflow integration to ingest. (MEDIUM)

---

## 5. NOTABLE / DISTINCTIVE features (vs Profound, Peec, Otterly, Scrunch, BrightEdge)

| # | Feature | Why distinctive | Confidence |
|---|---|---|---|
| 1 | **Action Center as a first-class workflow surface** (assignable, status-tracked tasks, not just a dashboard) | Profound/Peec/Otterly emphasize measurement; AthenaHQ's pitch is "measurement without action is theater." | HIGH |
| 2 | **Content Agents that auto-draft on-brand content** wired directly to Shopify publish | Most competitors stop at recommendations; AthenaHQ closes the loop to published content. | HIGH |
| 3 | **ACE — Athena Citation Engine** (Enterprise): ML model predicting citation probability with published validation (top-decile cited 87% vs bottom-decile 38.6%) | Few competitors expose a probabilistic citation model with public eval numbers. | HIGH |
| 4 | **Brand Integrity hallucination detection + Before/After recovery tracking** | A dedicated factual-accuracy product line with measurable rollback. | HIGH |
| 5 | **Pitch Workspace + Lead-Routing for agencies** (Bronze/Silver/Gold tier with referred client leads) | Turns the tool into a top-of-funnel for the agency itself; uncommon GTM lever. | HIGH |
| 6 | **Prompt Volume estimation with proprietary ML model** (Enterprise) | Volume = competitive AI-search-volume data; Profound's Conversation Explorer is comparable but Athena's is plan-gated. | HIGH |
| 7 | **Industry-vertical recommendation modes** (33+ verticals with tuned suggestions) | Most competitors are horizontal. | MEDIUM |
| 8 | **Self-improving content workflows** (Enterprise) — generated content loops back through measurement | Closes the optimization loop autonomously. | HIGH |
| 9 | **Live shareable dashboard URL** | Real-time client/team alignment without seat costs. | HIGH |
| 10 | **Unlimited seats with RBAC on Self-Serve** | Most competitors cap seats at this price. | HIGH |

---

## 6. Evidence log (all sources used)

### Official AthenaHQ (HIGH confidence)
- `https://athenahq.ai/` — homepage, nav, capability overview (fetched 2026-06-11)
- `https://athenahq.ai/plans` — pricing, tier gating (2026-06-11)
- `https://athenahq.ai/prompt-volume` — Prompt Volume feature (2026-06-11)
- `https://athenahq.ai/monitoring` — Monitoring product (2026-06-11)
- `https://athenahq.ai/content-agents` — Content Agents (2026-06-11)
- `https://athenahq.ai/brand-integrity` — Brand Integrity (2026-06-11)
- `https://athenahq.ai/ecommerce` — Shopify integration (2026-06-11)
- `https://athenahq.ai/agencies` — Pitch Workspace (2026-06-11)
- `https://athenahq.ai/agency` — Agency Program tiers (2026-06-11)
- `https://athenahq.ai/enterprise` — Enterprise + compliance (2026-06-11)
- `https://athenahq.ai/credit-calculator` — Credit calc inputs (2026-06-11)
- `https://athenahq.ai/comparison` — Comparison hub (2026-06-11)
- `https://athenahq.ai/about` — Founders, funding, advisors (2026-06-11)
- `https://athenahq.ai/blog` — ACE launch (Sep 29, 2025), Science of AI Citation (May 28, 2026), State of AI Search 2026

### Third-party reviews (HIGH–MEDIUM confidence)
- `https://www.capterra.com/p/10030173/AthenaHQ/` — feature list (37 items), integrations, pricing (2026-06-11)
- `https://trakkr.ai/reviews/athenahq-review` — full feature + pricing review (2026-06-11)
- `https://trakkr.ai/reviews/athenahq-review/pricing` — overage rates (2026-06-11)
- `https://dageno.ai/blog/athenahq-review-2026` — Olympus / Action Center / Ask Athena detail (2026-06-11)
- `https://dageno.ai/academy/athenahq-ai-review` — dashboards + nav (2026-06-11)
- `https://www.rankability.com/blog/athenahq-ai-review/` — Brand Intelligence Dashboard, Source Intelligence (2026-06-11)
- `https://getmint.ai/resources/athenahq-review` — ACE, Ask Athena, GA4 + Shopify attribution (2026-06-11)
- `https://indexly.ai/blog/athenahq-pricing/` — credit-system math (2026-06-11)
- `https://www.aipeekaboo.com/blog/athenahq-review` — most granular feature menu + nav (2026-06-11)
- `https://radarkit.ai/blog/athenahq-ai-review/` — panels + integrations (2026-06-11)
- `https://www.scalenut.com/blogs/athenahq-ai-review` — dashboards + screenshots described (2026-06-11)
- `https://www.tryprofound.com/blog/athenahq-review-not-the-best-for-enterprises` — most detailed product nav (Monitor → Answer Engine Insights/Prompt Volumes/Shopping/Agent Analytics; Create → Agents) — treat as MEDIUM (competitor review) but their nav granularity is unique (2026-06-11)
- `https://llmpulse.ai/blog/athenahq-vs-llm-pulse/` — corroboration (2026-06-11)

### Demo / sales (MEDIUM)
- `https://sourceforge.net/articles/athenahq-product-demo-showcase-generative-engine-optimization-geo-for-ai-search/` — demo transcript with explicit Olympus panel descriptions (2025)
- `https://www.youtube.com/watch?v=sQtKWPRWreo` — Andrew Yan (CEO) demo, May 15, 2025 (transcript not retrievable via WebFetch — UNKNOWN for direct verbatim)

### Gaps / UNKNOWN
- **Exact in-product sidebar order and labels** — auth-gated. Reconstruction is composite from reviews + sourceforge demo article; some labels conflict (e.g., "Olympus" vs "AI Visibility Dashboard" vs "Brand Intelligence Dashboard" — likely the same screen named differently by different writers).
- **Whether Agent Analytics is built-in or requires integration** — tryprofound lists it; Trakkr says no crawler analytics. Likely depends on Cloudflare/Vercel/Webflow integration. MEDIUM.
- **Growth tier ($545 or $595/mo)** — only on third-party reviews; not on athenahq.ai/plans which shows only Self-Serve + Enterprise. Possible recent SKU change or third-party tier reconstruction. MEDIUM. Worth re-checking before strategy decisions.
- **Whether "unlimited seats with RBAC" on Self-Serve is real** — plans page says it; some reviews say 3 seats. Conflict — LOW until verified by a Self-Serve trial.
- **API surface details** (endpoints, rate limits) — Enterprise-only and not documented publicly. UNKNOWN.
- **GA4 integration scope** (read-only attribution vs writeback) — described as attribution-only; not confirmed. MEDIUM.
- **Direct YouTube demo verbatim** — WebFetch returned only footer; would need transcript extraction. UNKNOWN.

---

**End of teardown.**
