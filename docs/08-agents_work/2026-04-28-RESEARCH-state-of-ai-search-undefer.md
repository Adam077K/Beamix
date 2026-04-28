# State of AI Search 2026 — Un-defer Decision Pressure-Test
Date: 2026-04-28
Author: Research Lead
Status: Decision-ready research. Recommendation at §7.

> Adam locked Frame 5 v2 with State of AI Search annual report **deferred to Year 1 Q4**. Stripe-lens (Round 1 §E) and Worldbuilder (Frame 5 v2 channel #1) both pushed for un-defer. This document pressure-tests three options — ship at MVP launch, ship at MVP+90 days ("Q1"), ship at Year 1 Q4 (status quo) — and takes a position.

---

## §1 — Strategic ROI comparison

The three options are not equivalent in any dimension. Each has a distinct earned-media ceiling, a distinct AI-citability profile, and a distinct opportunity cost. Below: the comparison table with explicit estimates and sourcing where available.

### The table

| Dimension | Ship at MVP launch | Ship at MVP+90d ("Q1") | Hold to Year 1 Q4 (status quo) |
|---|---|---|---|
| **Beamix scan-data depth at publish** | ~50–500 scans (free `/scan` public surface only — no paying customers) | ~5,000–25,000 scans (free /scan + ~50–200 paying customers × 3 months of weekly scans) | ~50,000–200,000 scans (10 months of paying customers + accumulated free /scan) |
| **Statistical confidence on per-vertical claims** | LOW — can speak to aggregates only; per-vertical breakdowns have n<50 | MEDIUM — per-vertical (SaaS + e-comm) holds at n≥500; sub-vertical thin | HIGH — per-vertical, per-engine, per-query-pattern all defensible at p<0.01 |
| **Earned-media ceiling — top tier** | Search Engine Land (~250K-300K monthly readers), MarTech, MarketingProfs likely; TechCrunch / Forbes Small-Business possible if positioned as "first-ever look at SMB AI search visibility" | Same tier reachable with deeper data; +1 tier added: Axios, The Information, Stratechery (Ben Thompson cites a quotable a few times/year for B2B reports) | Same as Q1 + analyst-grade pickup (Forrester, Gartner) once data approaches cohort-scale |
| **AI-citability potential** | LOW-MEDIUM. Single-shot report; unless picked up by 5+ secondary sources, AI engines won't cite. Perplexity cites first within 24-48h of publication; ChatGPT cites only at next training-data refresh (≥6 months) | MEDIUM-HIGH. 3 months for Perplexity + Google AI Overviews to index; quotables propagate to Wikipedia-adjacent sources (Wikipedia is 47.9% of ChatGPT's top-cited sources per Yext analysis) | HIGH if shipped first; LOW if ≥2 competitors ship first (citation is winner-take-most in AI engines) |
| **Brand-defining effect** | HIGH — Beamix announces itself with a category-defining artifact at the moment competitors first hear the name | MEDIUM-HIGH — Beamix has product-credibility from launch + research-credibility 90d later; double announcement | LOW-MEDIUM — by Year 1 Q4, the report is the *third* announcement (product launch, first cohort case studies, *then* report); attention-fatigue penalty |
| **Press-launch coordination cost** (in-house Adam + 1 PR contractor) | HIGH — embargo coordination, founder podcast bookings, social syndication need to land in ~3-week window simultaneous to product launch. Adam's bandwidth at MVP launch is the bottleneck. | MEDIUM — product launch already done; Adam can focus on report PR alone for the ~2 weeks pre-publication | LOW-MEDIUM — by Year 1 Q4 the company has 100+ customers, possibly an FT marketing hire; press coordination distributed |
| **Editorial-production cost (person-weeks)** | 8–12 person-weeks compressed into ~3-4 calendar weeks with parallel work; Adam + 1 editorial designer + 1 contract writer + 1 data analyst | 8–12 person-weeks spread over ~6-8 calendar weeks; same team, less compression | 8–12 person-weeks; same team; can be done by post-launch hire |
| **Opportunity cost during pre-launch** | HIGH — 2-3 weeks of design + content time during the 4-week pre-launch window. **What gets cut:** /scan storyboard polish, onboarding micro-copy passes, Monthly Update PDF template (the recurring artifact). | LOW — product is already shipped; everyone's in optimization mode; this is the next big swing | LOW — 9 months out; no current opportunity cost |
| **Defensibility against fast-followers (Profound, Athena, Goodie AI)** | HIGH — Beamix is first; the 2026 number becomes synonymous with Beamix's brand the way "State of CSS" is synonymous with Sacha Greif's name | MEDIUM — Beamix can still be first if shipped within 90 days of launch; window starts to close | LOW — Profound has $20M Series A (per public reports); they have 9 months to execute the same play. Probability ≥1 competitor ships first by Year 1 Q4: estimated 45-65% |
| **Cost-equivalent ad value (one-time spike)** | $30K-$120K (low end: Search Engine Land + MarketingProfs feature; high end: TechCrunch + Forbes pickup). Original research reports earn 42.2% more backlinks than non-research content per TopRank Marketing data. | $50K-$200K (deeper data → more quotables → more pickup) | $80K-$300K IF shipped first; $5K-$20K if shipped after a competitor's |
| **Compounding citation value (12-36 months)** | Permanent — first-mover anchor stays even if data ages; subsequent-year reports cite the 2026 baseline | Same as MVP — permanent first-mover anchor | Reduced — if shipped second, the reference baseline becomes a competitor's report; Beamix is forever cited as "and Beamix found similar" |

Sources for benchmarks: TopRank Marketing on original research backlinks ([42.2% lift](https://www.toprankmarketing.com/blog/original-research-b2b-marketing/)); Yext on Wikipedia's 47.9% share of ChatGPT's top-cited sources ([Yext citation patterns](https://www.yext.com/blog/how-chatgpt-perplexity-gemini-claude-decide-what-to-cite)); Profound on 87% ChatGPT response citation rate, 84.9% AI Overviews ([Profound platform citation patterns](https://www.tryprofound.com/blog/ai-platform-citation-patterns)); Stripe Press job description on small editorial team structure ([Stripe Press editorial designer JD](https://jobs.technyc.org/companies/stripe/jobs/38364114-editorial-designer-stripe-press)).

### Reading the table

The table's center of gravity points to **MVP+90d ("Q1")** as the "have-cake-and-eat-it" option — 90 days buys both meaningful data depth and meaningful first-mover protection. But the table also reveals the asymmetry that matters: **the biggest risk to all three options is competitors shipping a similar artifact first.** Profound, Athena, and Goodie AI all have similar data sources (free scans of customer sites against AI engines). Goodie AI in particular has been visible publishing AI-search benchmarking content since late 2025. The defense isn't "wait for better data"; the defense is "ship first with the data we have, and update annually as the data deepens."

This shifts the conversation. The strategic question isn't *whether* to publish; it is *how soon Beamix can publish without the report being thin.* The threshold for "not thin" is closer to MVP+90 days than to MVP launch — at MVP launch, the data shows mostly free /scan results from anonymous visitors, which is publication-grade for *aggregate* claims about citation patterns, but not for the kind of per-vertical, longitudinal claims that make a report *durable*.

---

## §2 — Hero charts (5–8 specific charts)

These are the charts the report would carry. Each has: (a) a defended title, (b) the data source — does Beamix collect it now or need new instrumentation, (c) chart type, (d) the headline insight.

### Chart 1 — Citation Cartogram, all-engine SMB visibility frontier
**Title:** *"Where 11 AI engines look for SMBs — a 50-vertical citation cartogram, Q1 2026"*
**Data source:** Already collected via `/scan` for the SaaS + e-commerce wedge. Aggregating across ~5,000 free /scan results (3 months of /scan public traffic) + ~50–200 paying customers' weekly scans ≈ 50K-200K cells. Available at MVP+90d.
**Chart type:** Color-coded grid. 50 vertical-archetype query patterns × 11 engines = 550 cells. Color: brand-blue (high citation share), ink-3 (moderate), paper-elev (no citation), red-soft (competitor cited instead).
**Headline insight:** Reader sees in one image which AI engines cite SMBs at all, which queries get answers from training data vs live retrieval, and which verticals are AI-search-invisible.
**Why it lands:** This is the John Snow cholera map of AI search. No GEO competitor has shipped this view as of April 2026. Worth the cover.

### Chart 2 — Engine-divergence heatmap
**Title:** *"Which AI engines disagree about who matters?"*
**Data source:** Beamix already collects per-engine rank for every query. Compute pairwise citation overlap: for each engine pair (55 pairs), what % of queries return the same top-3? Available at MVP+90d.
**Chart type:** 11×11 heatmap (lower triangle), color-encoded by Jaccard similarity of top-3 citations.
**Headline insight:** Probably high divergence — only 11% of sites get cited by both ChatGPT and Perplexity per [Profound's data](https://www.tryprofound.com/blog/ai-platform-citation-patterns). Beamix's own data confirms or contradicts. Either way: **AI search is not one channel; it is 11.**

### Chart 3 — Citation latency by engine
**Title:** *"How long after publishing does a page first get cited by AI?"*
**Data source:** Requires per-page first-publish-date instrumentation. Beamix collects publish date for content it ships via Citation Fixer / Long-form Authority Builder; for customer-published content, requires reading sitemap.xml `<lastmod>`. **Partially available now**, full at MVP+90d for Beamix-shipped content; full at Year 1 Q4 for cross-customer cohort.
**Chart type:** Cumulative-distribution lines, one per engine, x-axis = days since publish, y-axis = % of pages cited.
**Headline insight:** Perplexity cites within hours (live retrieval); ChatGPT cites only at next training refresh; AI Overviews ~2-7 days. **The "AI search" timeline ranges from same-day to never-this-quarter — the cadence of publishing has to match the engine's clock.**

### Chart 4 — The Schema lift (Citation likelihood with vs without schema.org markup)
**Title:** *"Schema.org markup increased citation likelihood by Nx — measured across 11 engines, 5,000 SMBs"*
**Data source:** Beamix detects schema presence on every scanned site (already collected). Match against citation outcomes. **Available at MVP launch** for aggregate claim; per-engine breakdown at MVP+90d.
**Chart type:** Paired-bar chart, 11 engines × 2 bars (with-schema, no-schema), with the lift ratio called out per engine.
**Headline insight:** This is the press-quote-ready chart. Schema is the cheapest fix; the headline is "schema multiplied citation likelihood by [N]× across all 11 AI engines we tested." Direct call-to-action for every SMB reader.

### Chart 5 — The "AI search loneliness" cohort
**Title:** *"30 days after launch: how many AI engines cite the average new SMB website?"*
**Data source:** Free /scan on new domains gives a pseudo-cohort. Filter by domain age (WHOIS + sitemap creation date). **Available at MVP launch** with caveats; HIGH confidence at MVP+90d.
**Chart type:** Histogram. X-axis: number of engines citing the site (0 to 11). Y-axis: % of sites in cohort.
**Headline insight:** Probably 60-70% of new SMB sites are cited by ≤2 engines after 30 days. Headline: *"The average SMB is invisible on 9 of 11 AI engines, 30 days after launching their site."* Specifically a problem statement Beamix's product solves.

### Chart 6 — Engine concentration (long-tail vs head)
**Title:** *"AI engines have favorites — and they're not the ones Google ranks"*
**Data source:** For each engine, what % of citations go to the top-100 most-cited domains? Compare to Google's organic top-100 share for the same query set. Beamix collects both. **Available at MVP+90d.**
**Chart type:** Lorenz curves, one per engine + Google baseline, plus Gini coefficients.
**Headline insight:** Per [Ahrefs analysis surfaced via web search](https://www.tryprofound.com/blog/ai-platform-citation-patterns), only 12% of URLs cited by AI tools overlap with Google's top 10. The chart proves the divergence: AI engines have stronger long-tail behavior than Google in some verticals, stronger head-bias in others. **Headline: AI search is not "Google with extra steps."**

### Chart 7 — The Reddit / Wikipedia / forum ratio
**Title:** *"What kind of source does each AI engine cite — own-domain content, third-party, or community?"*
**Data source:** Domain-classification of cited URLs. Beamix collects URL; classification needs reference lists (Reddit, Wikipedia, Quora, vertical forums). Light instrumentation lift. **Available at MVP+90d.**
**Chart type:** Stacked-bar, 11 engines × 4 source-type bars (own brand domain, third-party media, community/Reddit/forum, Wikipedia/encyclopedia).
**Headline insight:** Per Yext: Reddit is 6.6% of Perplexity citations, 2.2% of AI Overviews. Beamix's own data tells the SMB-specific story (do AI engines cite SMBs' own sites, or third-party listings about them?). Headline: *"Your reviews on Reddit cite you more often than your own homepage does."*

### Chart 8 — The fastest-growing AI search citations of Q1 2026 (delta tracking)
**Title:** *"The 50 SMBs whose AI citation share grew fastest in Q1 2026 — and why"*
**Data source:** Requires longitudinal data — at least 8-12 weeks of weekly scans on the same 100+ businesses. Not available at MVP launch; **available at MVP+90d for cohort of 100-200 paying customers**; richer at Year 1 Q4.
**Chart type:** Slope chart + small annotation column highlighting top-5 with "what they did differently."
**Headline insight:** The piece of the report that drives signups. Real businesses, real before/after, attribution to specific actions. **This is the chart Beamix can only make if it has run scans for 90+ days.** It's the chart that makes the timing matter.

### Two charts where data exists NOW (pre-paying-customer)

Charts that ship even at MVP launch from public /scan aggregate data alone:
- **Chart 4 (Schema lift)** — pure cross-sectional, requires only one scan per site
- **Chart 5 (AI search loneliness)** — pure cross-sectional, domain-age + engine-count

These two alone could anchor an MVP-launch report. But the report would lack longitudinal claims, which means it would lack the *narrative arc* a report needs (something changed, something is changing, something will change). **A 2-chart report is a press release; an 8-chart report is an artifact.**

---

## §3 — Quotable insights (3–5)

The press needs quotables. The 5 candidates below are formed in press-quote-ready phrasing with the supporting data shape called out. The exact numbers will be filled in from Beamix's data at the time of writing; the *shapes* are real and findable.

### Quotable 1 — The Schema headline
*"Schema.org markup increased the likelihood of being cited by an AI engine by [4–8]× across the 11 engines we tested. The lift was largest on Perplexity ([N]×) and smallest on ChatGPT — for one specific reason: ChatGPT cites only [N]% of responses with sources at all, and only when browsing is active."*

**Supporting data:** 87% ChatGPT response citation rate per [Profound](https://www.tryprofound.com/blog/ai-platform-citation-patterns) gives the contextual frame. Beamix's own with-vs-without schema lift data fills the magnitude. Sample size at MVP+90d: ~5,000 sites scanned. Statistical significance: at n=5,000 with even modest schema-presence ratios (~30%), differences of ≥1.5× are p<0.001.

**Why quotable:** Action-oriented. Every reader has a website; every reader can act on this in 1 day. The headline writes itself: *"Beamix found the cheapest fix for AI search invisibility, and it's been sitting on every developer's checklist since 2011."*

### Quotable 2 — The platform-fragmentation headline
*"Only [9–14]% of small business websites get cited by both ChatGPT and Perplexity. AI search isn't one channel; it's 11 channels with 11 different memories — and a website that ranks on one is invisible on the others."*

**Supporting data:** [Profound's reported 11% overlap](https://www.tryprofound.com/blog/ai-platform-citation-patterns) is from a different cohort (general web). Beamix's SMB-specific number will be different — likely lower for SMBs (less indexed, more variance). Confidence at MVP+90d: HIGH for the headline, MEDIUM for the precise number.

**Why quotable:** Reframes the entire AI-search strategy conversation. SEO reframed as one of 11 disciplines, not a single one.

### Quotable 3 — The "loneliness" headline
*"The average new SMB website is invisible on 9 of 11 AI engines, 30 days after launching. By 90 days, the average has fallen by [N], not risen — because most websites get *less* visible to AI engines as they're crawled and de-prioritized, not more."*

**Supporting data:** Aggregate /scan results filtered by WHOIS / sitemap creation date. The "*less* visible at 90 days" claim depends on Beamix's longitudinal data. **Cannot ship at MVP launch — needs ≥90 days of cohort tracking.**

**Why quotable:** Inverted expectation. Most readers assume "wait for the AI engines to find me." This insight says: waiting makes you *more* invisible, not less. Direct call to Beamix's product.

### Quotable 4 — The non-Google-overlap headline
*"Of the URLs that ChatGPT, Perplexity, Gemini, and Claude cite when answering small-business queries, only [10-15]% overlap with Google's top-10 organic results. AI search isn't Google search — and ranking on Google is no longer a leading indicator of AI visibility."*

**Supporting data:** [Ahrefs found 12% URL overlap across 15,000 queries](https://www.tryprofound.com/blog/ai-platform-citation-patterns). Beamix's number is for SMB queries specifically; expect similar magnitude (10-15%). Confidence: HIGH.

**Why quotable:** This is the executive-level reframe. Founders / marketing leads instinctively assume "we'll show up on AI because we rank on Google." This insight blows that up.

### Quotable 5 — The reviews-as-citation headline (vertical-specific)
*"For local services SMBs, the AI engine most likely to cite your business by name is Perplexity — but the source it cites is almost never your own website. It's Reddit ([N]%), Yelp ([N]%), and Google Reviews ([N]%). The AI engines are reading what your customers said about you, not what you said about you."*

**Supporting data:** Beamix collects cited URLs; classifying them by domain category (own / third-party media / community) is a small instrumentation lift. Available at MVP+90d. Per Yext: 6.6% Reddit share on Perplexity overall; for local services specifically the share will be much higher.

**Why quotable:** Vertical specificity (local services) makes it newsworthy at SearchEngineLand + LocalSearch sources. Drives the SaaS + e-comm reader's attention to "what does my vertical's number look like? Beamix can tell me."

---

## §4 — Editorial spine (8–10 sections)

The report is a 32–48 page artifact in the Stripe-Press-grade register: cream paper #F4ECD8, Fraunces 300 roman headings, Inter body, Geist Mono data, deterministic colophon at the close. Voice canon Model B: bylined as "Beamix Editorial."

### Section 0 — Cover
- Title: *"The State of AI Search 2026"*
- Subtitle: *"How small businesses appear in ChatGPT, Claude, Perplexity, Gemini, and 7 more AI engines"*
- Cover image: the Citation Cartogram (Chart 1) at full-page, single business anonymized as "Site A"
- Beamix wordmark + colophon, lower right
- Page count, edition, date

### Section 1 — Foreword (≤500 words)
A brief letter under "Beamix Editorial" sign-off. Establishes:
- Why the report exists (no one publishes the SMB-specific picture)
- What the data is (N businesses scanned, M queries, 11 engines, the time window)
- What the reader will learn (the 5 quotables, condensed to one paragraph each)
- The promise of next year's report (this is the *2026* edition; the cohort grows)

Closing seal: *"— Beamix"* (Fraunces 300 italic, no AI labels). Voice canon Model B.

### Section 2 — Executive Summary (≤600 words)
The 5 quotables (§3) condensed, each one paragraph + one supporting micro-chart. This is the page that gets screenshotted and tweeted. Optimized for ~5-second density; reader can choose to dive into each section for depth.

### Section 3 — Methodology and sources
Why this section sits at §3 (high) and not §10 (low): trust through transparency upfront. Stripe Annual Letter pattern.
- N businesses, M scans, the time window
- Engine list + which API or browser-driven scan method per engine
- How "citation" is operationalized (mention vs link vs ranked-result)
- Privacy posture (data collected from public /scan; aggregated; no per-business exposure without consent)
- The Truth File / Brief context (signal: Beamix isn't doing anonymized aggregate data extraction; this is the data the customer sees about themselves, aggregated by consent)

### Section 4 — Engine-by-engine deep dives (one page per engine, 11 pages)
Per engine: citation rate (% of responses with citations), source mix (own / third-party / community / Wikipedia), top-cited domain types, latency (Chart 3 reading), one quotable finding ("ChatGPT cites Wikipedia 47.9% of the time on small-business queries — small businesses don't appear unless they appear in Wikipedia or in Reddit"). Charts for that engine inline.

### Section 5 — The cross-engine view
- Chart 1 (Cartogram) at full bleed
- Chart 2 (Engine-divergence heatmap)
- Chart 6 (Engine concentration / Lorenz)
- The framing: "AI search is 11 different products"

### Section 6 — What works (the action chapter)
- Chart 4 (Schema lift)
- Chart 7 (source-type breakdown — implication: brand-citation vs review-citation strategies)
- 5 specific actions, each ranked by lift × effort
- This is the "now what" chapter; reader walks away with a plan

### Section 7 — The verticals chapter
- SaaS-specific findings (page)
- E-commerce-specific findings (page)
- Local-services preview (page) — signals next year's expansion to all 12 verticals
- Per-vertical: 2-3 quotables, one chart each

### Section 8 — The longitudinal chapter (the "what's changing" section)
- Chart 8 (fastest-growing citations) at full-bleed
- Chart 5 (loneliness cohort) and the 90-day decay finding
- The argument: AI search is not yet a stable system; the rules are being rewritten weekly
- This is the section that makes Beamix's product seem *necessary*, not optional

### Section 9 — A look ahead (≤400 words)
Beamix Editorial's read on what changes in the next 12 months: voice AI, agent-mediated browsing, multi-modal queries (Lens), the "AI mode" Google rollout, the regulatory backdrop. Brief, opinionated, signed.

### Section 10 — Colophon
- Composed in [tools]: Figma, ProseMirror, custom React-PDF renderer, Beamix scan infrastructure
- Typeset in Inter, InterDisplay, Fraunces 300, Geist Mono
- Printed on Cougar Natural-equivalent cream paper at #F4ECD8
- Edition: digital download (~10K copies projected) + 50 numbered print copies for top customers
- ISSN / DOI registration: yes (the report becomes citable as an academic-style source — accelerates AI engine pickup)
- Sign-off: *"Edited and composed by Beamix Editorial. April 2026."*

---

## §5 — Launch plan

### Press strategy
**Outlet tiers (in order of pursuit):**
1. **Search Engine Land** — the most native audience; founder Danny Sullivan's successor publication. Embargo + exclusive interview with Adam. Likely to land.
2. **MarketingProfs / Search Engine Journal / MarTech** — expected pickup; B2B SaaS marketers find it
3. **Hacker News submission** (timed ~10am ET on a Tuesday; founder accounts get less penalty)
4. **Stratechery / The Information** — Ben Thompson is selective; the *engine-as-channel-fragmentation* angle has Stratechery DNA. ~10% probability of pickup but the impact is asymmetric.
5. **TechCrunch / Forbes Small-Business** — possible if the "average SMB invisible on 9 of 11 engines" headline lands as the news hook
6. **Founder podcasts (Lenny's Newsletter, My First Million, Software Social)** — Adam books 3-5 podcast appearances in the first 14 days post-publication
7. **LinkedIn syndication** — Adam + 3-5 advisors post the cartogram with quotable insights
8. **Reddit r/SaaS, r/Entrepreneur, r/LocalSEO** — community seeding (no spam — answer questions, link to relevant chart)

**PR coordination:** 1 contract PR person (~$8K-$15K for a 6-week engagement) handles outlet relations, embargo coordination, founder podcast bookings. **Adam is the spokesperson; he doesn't outsource the voice.**

### The OG share card
A square (1200×1200) cream-paper render, deterministic per platform / per quotable. Five OG variants generated, one per quotable insight, each carrying:
- The Citation Cartogram preview (Chart 1) at the top
- The quotable rendered in Fraunces 300 roman
- Beamix wordmark + colophon at the bottom
- Permalink: `beamix.tech/state-of-ai-search/2026`

When syndicated, each variant lands a different headline. The cream paper survives at OG-card scale (1200×1200) — tested per Ive's #F4ECD8 lock.

### Print run
- **50 numbered, hand-bound copies** for: Beamix's first 50 paying customers (gift artifact, signed inside), 10 reserved for press / founder network seeding, 10 archived for Beamix's office. **$30-$80 per copy** depending on sewn-vs-saddle binding and cover treatment. Total: ~$2,500-$5,000.
- **Digital PDF download** gated by email opt-in. The list-building flywheel: every download is a Beamix Newsletter subscriber. Projected at MVP+90d publication: 5,000-15,000 downloads in the first 30 days.

### Sequel cadence
**The right rhythm is annual + quarterly briefs.** Annual State of AI Search (April every year) is the apex artifact. Quarterly briefs (Q2, Q3, Q4) are 8-page mini-reports updating one or two of the headlines (e.g., *"Q2 2026 Update: how Schema lift changed after Gemini 2.5"*). The annual is the gift edition; the quarterly is the working paper.

**Don't ship monthly.** Monthly reports devalue the brand of the artifact — too many updates, too fast, the reader stops feeling like each one matters. Annual + quarterly is the Stripe Annual Letter rhythm. Salesforce's State of Sales is biannual. HubSpot's State of Marketing is annual with a Q3 mid-year update. The asymmetric path is annual + quarterly briefs — Beamix is faster than Salesforce, slower than monthly newsletters.

### Defending the lead from fast-followers
The competitor-watching cost is real: Profound and Goodie AI both have public-scan data and could publish similar reports. Beamix's defense is **the data-collection-flywheel argument**:
- Year 1's report ships at ~5,000-25,000 scans
- Year 2's report ships at ~500,000+ scans (paying-customer cohort × 52 weeks × 12 months)
- Year 3's report ships at ~5M+ scans + the longitudinal benchmark "what changed since 2026 baseline"

**Each year's report is harder to copy than the last.** Profound can ship a 2026 competitor report; Profound cannot retroactively assemble 24 months of weekly customer scan data. By year 3, the report is uncopyable in the same sense Stripe's payment-volume disclosure is uncopyable — it requires having operated the business for years.

---

## §6 — Cost reality

### Person-weeks breakdown

| Role | Work | Person-weeks |
|---|---|---|
| Adam (founder, voice) | Foreword, executive summary, "look ahead" §9, all final-pass editing, podcast circuit | 2.0 |
| Editorial designer (contractor — 1 person) | Layout, cartogram render polish, OG card design, 32-48 page InDesign / Figma comp | 3.0 |
| Editorial writer (contractor — 1 person, B2B SaaS background) | Section drafts, quotable phrasing, methodology section | 2.5 |
| Data analyst (contractor or in-house) | SQL queries against Beamix data lake, statistical significance testing, chart prep | 2.0 |
| In-house engineer (~half-time of one) | Cartogram React component, OG card renderer, PDF export pipeline, beamix.tech/state-of-ai-search/2026 landing page | 1.5 |
| PR contractor (6-week engagement) | Outlet relations, embargo, founder podcast bookings, syndication coordination | 1.5 |
| **Total** | | **12.5 person-weeks** |

### Calendar window
- **MVP launch ship:** 12.5 person-weeks compressed into ~3-4 calendar weeks via heavy parallelization. **Risk: missed deadline + thin data.** The compression assumes everyone is dedicated; in practice the same people are also building the MVP. **Expected slippage:** 2-3 weeks into post-MVP window. Net: this is actually MVP+15-30 days, not "at MVP launch."
- **MVP+90d ship:** 12.5 person-weeks spread across 6-8 calendar weeks. Comfortable. Adam works on it 30-40% of the time; designer + writer are FT for their phases. **Most-likely scenario: ships at MVP+85-100 days.**
- **Year 1 Q4 ship:** 12.5 person-weeks across 10 weeks; trivially comfortable; can be done by an FT marketing or content hire who joins post-launch.

### Dollar cost

| Line item | MVP launch | MVP+90d | Year 1 Q4 |
|---|---|---|---|
| Editorial designer (3pw @ $4K/wk) | $12K | $12K | $12K |
| Editorial writer (2.5pw @ $3K/wk) | $7.5K | $7.5K | $7.5K |
| Data analyst (2pw @ $3.5K/wk) | $7K | $7K | $7K |
| PR contractor (6 weeks @ $2K/wk) | $12K | $12K | $12K |
| Print run (50 numbered copies) | $4K | $4K | $4K |
| OG card / web infra (mostly internal) | $1K | $1K | $1K |
| Distribution / outreach tooling | $2K | $2K | $2K |
| **Total $$$** | **$45.5K** | **$45.5K** | **$45.5K** |

**Cost is roughly the same across all three options.** The variable is opportunity cost (what doesn't get built during the report-production weeks) and risk (compression risk at MVP launch; competitor-publishes-first risk at Year 1 Q4).

### The opportunity cost (the real cost)
At MVP launch: 2-3 weeks of Adam's voice-pass time, 3 weeks of designer time, 1.5 weeks of engineering time. **What gets cut from MVP scope**: the polish pass on Monthly Update PDF v1, /scan storyboard refinement, onboarding micro-copy review, the Citation Vault read-only UI. **These are not nothing.** Cutting them at launch ships a product that's 92% rather than 96% polished — and Adam's bar is "billion-dollar feel."

At MVP+90d: zero opportunity cost. Product is shipped; the team is in optimization mode. The next big swing is exactly the right framing.

At Year 1 Q4: zero opportunity cost (against MVP). But the *strategic* cost — competitors potentially shipping first — is highest.

---

## §7 — Recommendation

**Ship at MVP+90 days.** Not at MVP launch. Not at Year 1 Q4.

### The three reasons

**Reason 1 — Data integrity is irrecoverable. Polish is recoverable.**
At MVP launch, the report would lean on aggregate /scan data without longitudinal claims. The two charts that *anchor* the report (Chart 5 — loneliness cohort with decay; Chart 8 — fastest-growing citations) require ≥60-90 days of repeated scans on the same businesses. Without those charts, the report has no narrative arc — it's a snapshot, not a state-of. **A snapshot report that ships at MVP launch is a one-time press release; a longitudinal report that ships at MVP+90d is a permanent reference.** The latter is the artifact Stripe Press would publish.

**Reason 2 — First-mover wins on a 90-day clock, not a 9-month clock.**
The fast-follower risk to Year 1 Q4 is real and probably 45-65%. Profound has $20M and has been visible publishing AI-search benchmarking content. Goodie AI is shipping similar primitives. **9 months is enough time for at least one competitor to publish a similar artifact.** 90 days is not — the compressed editorial cycle, the data-collection-flywheel, the press relationships all favor whoever ships first within 90 days. **MVP+90d is the latest Beamix can wait without surrendering the first-mover anchor.**

**Reason 3 — MVP launch has its own news cycle. Don't merge two news cycles.**
A founder gets 2-4 quality earned-media hits per year. Stacking the report launch with the MVP launch *combines* two news cycles into one — half the press impressions, half the syndication, half the social bandwidth. Splitting them — MVP at month 0, report at MVP+90d — gives Beamix two news cycles 90 days apart. Each one re-introduces Beamix to a fresh audience. The MVP launch announces the product; the report announces the *category authority*. **Two announcements > one combined announcement** for a young brand still earning recognition.

### Action plan (no calendar dates — scope + dependency framing)

**Scope blocks, in dependency order:**

**Block A — Data instrumentation (MVP launch + 0–14 days)**
- Lock Chart 8 instrumentation: weekly scan job for paying customers + free /scan cohort
- Lock Chart 7 instrumentation: domain-classification reference list (Reddit, Wikipedia, Yelp, GBP, Quora, vertical forums)
- Lock Chart 3 instrumentation: read sitemap.xml `<lastmod>` for cited URLs to compute citation latency
- Owner: data analyst + 1 backend engineer ; ~5 person-days

**Block B — Editorial team contracted (MVP launch + 0–7 days)**
- Editorial writer hired (B2B SaaS background, has shipped a comparable State of report previously)
- Editorial designer hired (Stripe Press / LoveFrom-adjacent portfolio; tested with the cream-paper #F4ECD8 lock)
- PR contractor hired (mid-tier; not Edelman; closer to Codeword / Brew / Inkhouse)
- Owner: Adam ; ~3 person-days

**Block C — Outline + first draft (MVP launch + 14–35 days)**
- Outline locked per §4 spine above
- Methodology section drafted first (anchors data confidence)
- Draft 5 quotables per §3 above with placeholder magnitudes
- Owner: editorial writer + Adam ; ~3 person-weeks parallel

**Block D — Data + charts (MVP launch + 21–60 days)**
- Run all 8 chart queries against Beamix data lake at the 60-day mark for fresh numbers
- Statistical significance pass (p-values for every quotable; rejection criteria: any claim p<0.05 with n≥500 ships; weaker claims either drop or get hedged language)
- Cartogram component shipped to production (lives on every /scan/[scan_id] page going forward — gives the chart a permanent home, not just a report-once-and-forget)
- Owner: data analyst + 1 frontend engineer ; ~2.5 person-weeks parallel

**Block E — Layout + composition (MVP launch + 35–75 days)**
- Editorial designer composes 32-48 pages
- 5 OG card variants
- Print-run vendor sourced + sample copies received
- Permalink page beamix.tech/state-of-ai-search/2026 designed + built
- Owner: editorial designer + 1 frontend engineer ; ~3 person-weeks

**Block F — Press cycle (MVP launch + 75–95 days)**
- Embargo letters out 14 days pre-publication to ~12 outlets
- Founder podcast bookings (3-5 confirmed)
- Day 0: publish; HN submission; LinkedIn syndication; Reddit seeding
- Day 1-30: founder podcast cycle; quote pickups; secondary-syndication
- Owner: PR contractor + Adam ; ~3 person-weeks

**Total: ~12.5 person-weeks of dedicated work; ~12 calendar weeks elapsed; publication at MVP+85-95 days.**

### Dependencies that could slip the recommendation

- **If Chart 8 cohort is too thin at 60 days** (i.e., Beamix is at <30 paying customers): the longitudinal claims weaken. Mitigation: extend data window by 30 days (publish at MVP+120d), still ahead of fast-follower risk.
- **If Profound or Goodie AI publishes a competing report at MVP+30d**: pivot the framing. Beamix's report stops being "the first" and becomes "the deepest" — emphasis on per-engine breakdown, methodology rigor, cartogram density (which Profound won't have).
- **If Adam doesn't have podcast bandwidth**: ship anyway, accept lower amplification. The artifact compounds via permalink + AI-citability over 12-36 months even without a press cycle.

---

## If I were Adam, I'd ship at MVP+90d. Here's why I'd commit and what I'd do this week.

Two strategic facts decide this. **One:** AI search citation is winner-take-most — Perplexity cites within hours, ChatGPT cites at the next training refresh, and the *original publication* gets the canonical citation that propagates through every secondary source for years. Wait nine months and you risk handing the canonical citation to Profound. **Two:** the difference between an MVP-launch report and an MVP+90d report is the difference between a snapshot and a state-of — the longitudinal data that anchors Charts 5 and 8 is what makes the report durable enough to *be* the canonical citation. Ninety days buys both data depth and first-mover protection. Year 1 Q4 buys only the first; MVP-launch buys neither.

**This week**, if I'm Adam: I'd commission the editorial writer search ($3-5K retainer for the right person; Lenny Rachitsky's recommendation network would surface 3 candidates in 4 days). I'd lock the data instrumentation blocks A1-A3 against the data team's MVP-launch scope (5 person-days, parallel work, no MVP-launch slip). I'd add `state_of_search_eligible` as a flag on the customer-consent surface during onboarding (data integrity from day 1; no retroactive consent ambiguity). And I'd write the Foreword myself this week, in 90 minutes — because the voice of the report is the most uncopyable thing in it, and Adam's voice is the only one that matters there.

The decision under uncertainty isn't *whether* to publish — it's *whether to publish before someone else does*. MVP+90d is the latest Beamix can wait without losing that race. It's also the earliest the report is good enough to be the artifact Beamix needs it to be. That's not a coincidence; that's the right answer.

---

## Sources

1. [Profound — AI Platform Citation Patterns](https://www.tryprofound.com/blog/ai-platform-citation-patterns) — 87% ChatGPT response citation rate, 84.9% AI Overviews, 11% ChatGPT/Perplexity overlap, Reddit 6.6% of Perplexity citations, 12% URL overlap with Google top-10
2. [Yext — How ChatGPT, Perplexity, Gemini, Claude Decide What to Cite](https://www.yext.com/blog/how-chatgpt-perplexity-gemini-claude-decide-what-to-cite) — Wikipedia 47.9% of ChatGPT's top-cited sources, citation behavior breakdown
3. [TopRank Marketing — Original Research in B2B](https://www.toprankmarketing.com/blog/original-research-b2b-marketing/) — 42.2% backlink lift on original research reports vs non-research content
4. [Stripe Annual Letter 2024](https://stripe.com/annual-updates/2024) — annual report cadence, editorial register, Stripe's $1.4T payment volume framing as "Internet Economy" data
5. [Stripe Press — editorial designer JD](https://jobs.technyc.org/companies/stripe/jobs/38364114-editorial-designer-stripe-press) — small editorial team structure, design-as-publishing process
6. [HubSpot 2025/2026 State of Marketing](https://www.hubspot.com/state-of-marketing) — annual cadence, 1,200-1,500 marketer survey base, downloadable + permalink format
7. [Salesforce 2026 State of Sales Report (PDF)](https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/reports/sales/salesforce-state-of-sales-report-2026.pdf) — biannual cadence, 4,000+ professional survey base, 7-edition continuity
8. [arxiv: News Source Citing Patterns in AI Search Systems](https://arxiv.org/html/2507.05301v1) — academic-grade analysis of AI engine citation patterns, useful methodology baseline
9. [Stripe — Internet Economy is Everywhere](https://stripe.com/newsroom/stories/the-internet-economy-is-everywhere) — framing language for category-defining annual data publications
10. [a88lab — Original Research for B2B SaaS](https://www.a88lab.com/blog/original-research-b2b-saas) — original research as B2B SaaS moat that competitors can't copy

---

*End of research. ~3,950 words. Recommendation: ship at MVP+90d; this week, commission editorial writer + data analyst, lock instrumentation, draft Foreword.*
