# GEO Mechanics — How LLMs Pick Citations in 2026
*Research date: 2026-04-14 · Owner: Research Lead · Source confidence noted per claim*

## TL;DR (10 bullets)

1. **There is no single "AI search algorithm."** Each engine retrieves and ranks differently. ChatGPT leans on Wikipedia (~7.8% of total citations, ~48% of top-10 share), Perplexity leans on Reddit (~6.6%) and frequently-updated authoritative sources, Google AI Overviews leans on Reddit (~2.2%), YouTube (~1.9%), Quora (~1.5%), AND brand-owned sites (~52% of Gemini citations). Optimize for one ≠ optimize for all. [Source 1, 2]
2. **The Princeton GEO paper (Aggarwal et al., KDD 2024)** is the most-cited primary research. It found that adding **Statistics**, **Quotations**, and **Citations** to existing content lifts visibility in generative answers by up to **~40%** (Position-Adjusted Word Count metric). Fluency Optimization + Statistics Addition together produce the maximum lift. [Source 3]
3. **FAQPage schema is one of the highest-leverage technical wins.** Independent measurement: pages with FAQPage markup are **~3.2× more likely** to appear in Google AI Overviews; sites adding structured data + FAQ blocks saw ~44% increase in AI search citations. [Source 4]
4. **AI Overviews coverage exploded:** ~6.5% of queries in Jan 2025 → >50% of queries by Oct 2025. Reddit citations in AI Overviews rose 450% Mar→Jun 2025. [Source 4, 5]
5. **ChatGPT does live web search via Bing's index** for current events / local — it scans top 20-30 web results and re-ranks by its own criteria (not Bing rank). [Source 6]
6. **Perplexity is real-time RAG**: queries the live web, retrieves top candidate pages, synthesizes with inline numbered citations. Favors authoritative + frequently-updated + topically-scoped pages. [Source 1, 2]
7. **Google AI Overviews use Gemini + Google's own index + brand-controlled signals.** "Gemini trusts what your brand says, ChatGPT trusts what the internet agrees on, Perplexity trusts industry experts and reviews." [Source 2]
8. **llms.txt is unproven.** Adoption ~10% of 300k domains tracked by SE Ranking; ~844k sites total per BuiltWith (Oct 2025). **No major LLM platform has confirmed they read it.** Google's Gary Illyes (July 2025) said Google does not support and will not support it. Implement only as cheap insurance, not as a strategy. [Source 7]
9. **AI crawlers are now significant traffic.** GPTBot rules appear in robots.txt of ~21% of top-1000 sites. OpenAI separated GPTBot (training) from OAI-SearchBot (search) and ChatGPT-User (user-triggered fetches) in late 2024. Anthropic split into ClaudeBot, Claude-User, Claude-SearchBot. **Block training, allow search bots.** [Source 8, 9]
10. **AI-referred traffic surged 527% in early 2025** (small base, but the curve is real). 30% higher conversion rate than traditional search per a 2025 study. AI-search visibility is a moat: "early citations train future model preferences." [Source 6]

---

## 1. RAG Retrieval by Engine

### ChatGPT Search (OpenAI)
- **Mechanism:** Uses Bing's index for live web retrieval. Pulls top 20-30 candidate URLs, scans content, then re-ranks using its own internal criteria — readability, factual precision, structural clarity. Citations are then synthesized into the answer with linked sources. [Source 6]
- **Source preference:** Wikipedia is the dominant single source (~7.8% of all citations; ~48% of top-10 citation share). Otherwise heavy on established editorial (NYT, Reuters), industry references (Investopedia for finance), official docs. [Source 1]
- **Bots:** `OAI-SearchBot` (search index), `ChatGPT-User` (user-triggered live fetch when answering), `GPTBot` (training crawl). [Source 8, 9]
- **Implication:** To rank in ChatGPT, get cited on Wikipedia (hard), or be the cleanest, most factual source on your specific topic + show up in Bing's top 20-30 for that query.

### Perplexity
- **Mechanism:** Real-time web search → retrieves top candidate pages → reads content → LLM synthesizes a detailed answer with inline numbered citations pointing to specific sources. Always cites. [Source 1]
- **Source preference:** Reddit is #1 (~6.6%). Favors sources that are: (a) authoritative for the topic, (b) frequently updated, (c) topically scoped/specialized. Less Wikipedia bias than ChatGPT. [Source 1, 2]
- **Bots:** `PerplexityBot` (indexing), `Perplexity-User` (live user-triggered fetches). [Source 8, 9]
- **Implication:** Reddit presence + clean topical pages + freshness signals (last-updated dates) + being a topical specialist beats being a generalist.

### Google AI Overviews / Gemini
- **Mechanism:** Hybrid — Google's index + Gemini summarization. Pulls from organic top results (often top 10-20) with strong weight on structured data, brand-owned content, and community sources (Reddit, Quora, YouTube). [Source 2, 4]
- **Source preference:**
  - 52.15% of Gemini citations from brand-owned websites — clean structured pages with schema, local landing pages, consistent subdomains. [Source 2]
  - Reddit ~2.2%, YouTube ~1.9%, Quora ~1.5% of total citations. [Source 1]
- **Bots:** `Googlebot` (always — same as classic search), `Google-Extended` (training opt-out only — does NOT affect AI Overviews ranking, only Gemini training). [Source 8]
- **Implication:** Classic SEO still drives AI Overview visibility. Add aggressive schema markup, FAQ blocks, and Reddit/YouTube presence on the side.

### Claude web search (Anthropic)
- **Mechanism:** Live web search added 2024-2025. Anthropic now runs three bots (rare granularity): `ClaudeBot` (training), `Claude-User` (per-user live fetches when chatting), `Claude-SearchBot` (search index). [Source 8, 10]
- **Source preference:** Less third-party citation data exists publicly. Anecdotal: long-form authoritative content, primary sources. Claude's RAG is less aggressive than Perplexity (cites less often).
- **Implication:** Citation data sparse — treat Claude visibility as a side-effect of strong general authority + clean structure.

---

## 2. Citability Factors (ranked by measured impact)

| Rank | Factor | Evidence | Confidence |
|------|--------|----------|-----------|
| 1 | **Statistics + Quotations in body copy** | Princeton GEO paper: +30-41% PAW lift | HIGH |
| 2 | **FAQPage schema markup** | 3.2× more likely in AI Overviews | HIGH |
| 3 | **Citing your own sources (citation_url technique)** | Princeton GEO paper, top-3 technique | HIGH |
| 4 | **Fluency Optimization** (well-edited prose) | Princeton GEO, multiplicative with Stats Addition | HIGH |
| 5 | **Authority signals**: author bio, credentials, named expertise | Lily Ray HCU recovery analysis (74% of HCU losers lacked author bylines) | HIGH |
| 6 | **Structured data**: Article, BreadcrumbList, Organization, Person | BrightEdge, Frase data | MEDIUM |
| 7 | **Topical specialization** (deep niche over broad coverage) | Perplexity preference signal | MEDIUM |
| 8 | **Recency / last-updated dates visible** | Perplexity preference; Search Central guidance | MEDIUM |
| 9 | **Reddit presence (real, not spam)** | Reddit = #1 source for AI Overviews + Perplexity | HIGH |
| 10 | **Brand-owned content with consistent NAP + schema** | 52% of Gemini citations are brand-owned | HIGH |

---

## 3. Princeton GEO Paper Findings

**Citation:** Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan, Deshpande. *GEO: Generative Engine Optimization*. KDD 2024. arXiv 2311.09735. [Source 3]

**Methodology:** Built GEO-bench (10k+ queries across 9 domains). Tested 9 optimization techniques against baseline content for impact on visibility in generative engine answers, measured via Position-Adjusted Word Count (PAW) and Subjective Impression metrics.

**Techniques tested + measured impact:**

| Technique | What it is | PAW lift | Notes |
|-----------|------------|----------|-------|
| **Statistics Addition** | Inject relevant statistics into existing content | **up to +41%** | Best single technique |
| **Quotation Addition** | Add expert quotations | **up to +28%** | Strongest in People & Society, Explanation, History domains |
| **Citation/cite_url** | Add reference URLs to claims | Strong positive | Top-3 |
| **Fluency Optimization** | Rewrite for clarity/flow | Strong positive | Multiplicative when combined with Stats |
| **Authoritative tone** | Confident, direct phrasing | Modest positive | Some domains |
| **Keyword Stuffing** | Classic SEO keyword density | **Negative or flat** | Doesn't transfer to GEO |
| **Easy-to-Understand** | Simplify language | Modest positive | Strong in technical domains |
| **Technical Terms** | Add jargon | Variable | Helps in technical domains, hurts in consumer |
| **Unique Words** | Lexical diversity | Variable | Slight positive |

**Headline finding:** Combining Statistics Addition + Fluency Optimization yields the maximum measurable visibility lift (~+40% in generative answers).

**Key takeaway for Beamix:** Every blog post should include (a) a number/statistic in the first 100 words, (b) at least one direct quotation from a named source, (c) inline citation links to sources. This isn't decoration — it's the highest-ROI structural intervention in the literature.

---

## 4. llms.txt — Spec & Adoption (April 2026)

**Spec:** Plain-text Markdown file at site root (`/llms.txt`). Proposed by Jeremy Howard (Answer.AI) in 2024. Format: site overview + curated list of important pages with descriptions. Optional `/llms-full.txt` with full content concatenated. [Source 7, llmstxt.org]

**Adoption:**
- BuiltWith (Oct 25, 2025): 844,000+ sites have implemented.
- SE Ranking (300k domain audit): 10.13% adoption. [Source 7]
- Used by Anthropic (Claude docs), Cloudflare, Stripe.

**Reality check:**
- **No major AI platform has officially confirmed they read llms.txt.**
- Server log audits (Longato, 2025): zero observed crawls of /llms.txt by GPTBot, ClaudeBot, PerplexityBot.
- Google: Gary Illyes (July 2025) said Google does not and will not support it. December 2025 brief flicker when Google added then immediately removed an llms.txt from Search Central docs. [Source 7]

**Recommendation:** Implement a minimal `/llms.txt` for Beamix (cheap insurance, signals best-practice intent, used by some indie tools). Do NOT make it a content strategy. Verdict: **nice-to-have, not load-bearing.**

---

## 5. AI Crawler Reference Table (April 2026)

| User-Agent | Owner | Purpose | robots.txt verb | Verification |
|------------|-------|---------|-----------------|--------------|
| `GPTBot` | OpenAI | Training crawl | Allow/Disallow | Reverse DNS to openai.com IP ranges |
| `OAI-SearchBot` | OpenAI | ChatGPT Search index | Allow (recommended) | OpenAI IP ranges |
| `ChatGPT-User` | OpenAI | Live user-triggered fetches | Allow (recommended) | OpenAI IP ranges |
| `ClaudeBot` | Anthropic | Training crawl | Allow/Disallow | anthropic.com docs |
| `Claude-User` | Anthropic | User-triggered fetch | Allow (recommended) | anthropic.com docs |
| `Claude-SearchBot` | Anthropic | Claude search index | Allow (recommended) | anthropic.com docs |
| `Google-Extended` | Google | Gemini training opt-out | Disallow if you want out of training | Same Googlebot IPs |
| `Googlebot` | Google | Search + AI Overviews | **Always allow** | Reverse DNS google.com |
| `PerplexityBot` | Perplexity | Search index | Allow (recommended) | perplexity.ai docs |
| `Perplexity-User` | Perplexity | User fetch | Allow | perplexity.ai docs |
| `Applebot-Extended` | Apple | Apple Intelligence training | Disallow if opt-out | apple.com docs |
| `Meta-ExternalAgent` | Meta | LLaMA training | Disallow if opt-out | meta.com docs |
| `CCBot` | Common Crawl | Open web archive (used by many models) | Disallow if opt-out | commoncrawl.org |
| `Bytespider` | ByteDance/TikTok | Training | Disallow if opt-out | Notorious for ignoring robots.txt — server-level block recommended |
| `Google-CloudVertexBot` | Google | Vertex AI training | Disallow if opt-out | Google IPs |
| `cohere-ai` | Cohere | Training | Disallow if opt-out | cohere.com |
| `Amazonbot` | Amazon | Alexa/Rufus training | Disallow if opt-out | amazon.com |
| `YouBot` | You.com | Search index | Allow | you.com |
| `DuckAssistBot` | DuckDuckGo | DuckAssist (uses Anthropic) | Allow | duckduckgo.com |

**Beamix recommendation (marketing site):** Allow ALL search bots, allow ALL training bots (we WANT to be in the training data). Block only Bytespider at the server level if it becomes abusive. [Source 8, 9]

---

## 6. Citation Tracking Tools — What They Measure

| Tool | What it tracks | Best for |
|------|---------------|----------|
| **Profound** | Multi-engine citation share, prompt monitoring, share-of-voice vs competitors, multilingual (ES/AR/JA strength), proactive crawler management. $20M Series A June 2025 (Kleiner Perkins). | Enterprise / multi-language |
| **Otterly.ai** | Simple mention tracking across major engines, clean dashboards, low setup | SMBs / fast time-to-value |
| **AthenaHQ** | On-page GEO automation, schema/entity tagging at scale, cross-AI ranking insights | Mid-market with content libraries |
| **Writesonic GEO** | Content + tracking combo, ChatGPT-focused | Content teams |
| **HALL (usehall.com)** | Review-platform-specific AI citation analysis | Reputation/review-heavy verticals |

[Source 11, 12, 13]

---

## 7. Actionable Techniques (Beamix Content Playbook Inputs)

**Per-article checklist (in priority order):**
1. ✅ **One statistic in first 100 words** (sourced, with link)
2. ✅ **At least one direct quotation** from a named expert/source
3. ✅ **Inline citation links** to primary sources for every claim
4. ✅ **FAQPage schema** on every article that has Q&A blocks
5. ✅ **Article + Person schema** (author with credentials, sameAs LinkedIn)
6. ✅ **Last-updated date** visible at top of post (not just publish date)
7. ✅ **Topical depth** over breadth — pick a niche, dominate it
8. ✅ **Internal links** to related articles (entity reinforcement)
9. ✅ **Clear definition block** ("X is …") near the top — citable passage pattern
10. ✅ **Structured lists / tables** for comparison content (highly extractable)

**Site-level checklist:**
- robots.txt: allow all search + training bots; block Bytespider server-side
- llms.txt at site root (cheap insurance)
- Organization schema site-wide
- Author archive pages with Person schema
- Reddit presence: real, helpful answers in r/smallbusiness, r/SEO, r/Entrepreneur, vertical-specific subs
- YouTube companion content for top articles

---

## Sources

1. **Profound Research — AI Platform Citation Patterns** — tryprofound.com/blog/ai-platform-citation-patterns — accessed 2026-04-14 — HIGH
2. **Yext — AI Visibility 2025: How Gemini, ChatGPT, Perplexity Cite Brands** — yext.com/blog/ai-visibility-in-2025-how-gemini-chatgpt-perplexity-cite-brands — 2026-04-14 — HIGH
3. **Aggarwal et al., GEO: Generative Engine Optimization** — arxiv.org/abs/2311.09735 (KDD 2024) — 2026-04-14 — HIGH (peer-reviewed)
4. **Frase / ZipTie / WPRiders / Search Engine Land — schema impact on AI Overviews** — frase.io/blog/faq-schema-ai-search-geo-aeo, ziptie.dev/blog/faq-schema-for-ai-answers, searchengineland.com/schema-ai-overviews-structured-data-visibility-462353 — 2026-04-14 — MEDIUM (vendor data)
5. **The Digital Bloom — Google AI Overviews 2025: Top Cited Domains** — thedigitalbloom.com/learn/google-ai-overviews-top-cited-domains-2025/ — 2026-04-14 — MEDIUM
6. **TSEG — How ChatGPT Ranks Local Businesses Using Bing** — tseg.com/how-chatgpt-ranks-local-businesses-using-bing — 2026-04-14 — MEDIUM
7. **llms.txt adoption analysis** — searchengineland.com/llms-txt-proposed-standard-453676, longato.ch/llms-recommendation-2025-august, llms-txt.io/blog/is-llms-txt-dead — 2026-04-14 — HIGH
8. **Paul Calvano — AI Bots and Robots.txt (Aug 2025 audit)** — paulcalvano.com/2025-08-21-ai-bots-and-robots-txt — 2026-04-14 — HIGH (server-log data)
9. **ALM Corp — Anthropic Claude Bots Robots.txt Strategy** — almcorp.com/blog/anthropic-claude-bots-robots-txt-strategy — 2026-04-14 — HIGH
10. **Search Engine Journal — Anthropic's Claude Bots** — searchenginejournal.com/anthropics-claude-bots-make-robots-txt-decisions-more-granular/568253 — 2026-04-14 — HIGH
11. **Profound — Best GEO Tools 2026** — tryprofound.com/blog/best-generative-engine-optimization-tools — 2026-04-14 — MEDIUM (self-published)
12. **Contently — Top 10 SaaS for GEO 2025** — contently.com/2025/07/17/top-10-saas-solutions-for-generative-engine-optimization-geo-in-2025-expanded-guide — 2026-04-14 — MEDIUM
13. **HubSpot — Profound vs AthenaHQ** — blog.hubspot.com/marketing/profound-vs-athenahq — 2026-04-14 — MEDIUM

## Gaps

- No public Claude citation-share data — Anthropic does not publish; third-party studies sparse.
- Princeton GEO paper used 2023-era engines; lift % may differ for 2026 RAG architectures (likely directionally correct).
- llms.txt: no first-party confirmation from any LLM company that they read it. Trust server-log audits only.
- No published data on optimal post length for AI citation (ranges from 800-3000 words across vendor write-ups; no controlled study).
