# GEO Research Findings — Sourced (2026-04-09)

Research conducted by 3 parallel Researcher agents (Opus-tier). All claims sourced.

---

## 1. What Makes AI Engines Mention & Recommend a Business

### Proven GEO Techniques (Princeton/Georgia Tech KDD 2024 Paper)

The foundational GEO paper tested 9 optimization strategies across 10,000 queries.
Source: Aggarwal et al., arxiv.org/abs/2311.09735 (KDD 2024)

| Technique | Visibility Impact | Confidence |
|-----------|------------------|------------|
| Adding citations/sources | +30% avg, **+115% for lower-ranked sites** | HIGH |
| Adding quotations | **+41%** | HIGH |
| Adding statistics | **+40%** | HIGH |
| Fluency optimization | +15-30% | HIGH |
| Easy-to-understand language | +15-30% | HIGH |
| Best combo (fluency + statistics) | Beats any single technique by 5.5%+ | HIGH |
| Authoritative tone | No significant improvement | HIGH |
| Keyword stuffing | No improvement, **10% worse on Perplexity** | HIGH |

**Key insight:** GEO democratizes visibility. Lower-ranked sites benefit MORE from these techniques than top-ranked sites. This is perfect for SMBs.

### Domain-Specific Effectiveness
- Statistics Addition works best in: Law & Government, Debate, Opinion
- Quotation Addition works best in: People & Society, Explanation, History
- Cite Sources works best in: Statement/Facts, Law & Government
- Fluency Optimization works best in: Business, Science, Health
Source: GEO Paper, arxiv.org/html/2311.09735v3

---

## 2. How Each Engine Is Different

### Citation Patterns by Engine

| Engine | Primary Trust Source | Key Data Point |
|--------|---------------------|---------------|
| **ChatGPT** | Third-party consensus | Wikipedia 16.3% of citations; 48.7% from third-party sites (Yelp, TripAdvisor) |
| **Gemini** | Brand-owned websites | 52.15% of citations come from brand-owned sites |
| **Perplexity** | Community + niche directories | Reddit 46.7% of top-10 sources; 24% from niche directories |
| **Google AI Overviews** | Balanced / diverse | Reddit 21%, YouTube 18.8%, Quora 14.3% |

Sources:
- tryprofound.com/blog/ai-platform-citation-patterns (680M citations analyzed)
- yext.com/blog/ai-visibility-in-2025
- ahrefs.com/blog/top-10-most-cited-domains-ai-assistants

**Summary formula:** "Gemini trusts what your brand says. ChatGPT trusts what the internet agrees on. Perplexity trusts industry experts and customer reviews." (Yext, 2025)

### Cross-Engine Overlap Is Minimal
- Only 12% of URLs cited by AI engines also rank in Google's top 10 (Ahrefs, 15K queries)
- Only 7 websites appear in top 50 for ALL THREE major platforms
- 86% of top-mentioned sources are NOT shared across platforms
Source: ahrefs.com/blog/ai-search-overlap (78.6M interaction study)

**Implication:** Engine-specific optimization is NOT optional. A one-size-fits-all content strategy fails.

---

## 3. The Off-Site Problem (85% of Mentions)

- **85% of brand mentions in AI answers come from third-party sources**, not the business's own domain
Source: Foundation Inc, foundationinc.co/lab/generative-engine-optimization (2026)

- Industry-specific directory presence matters enormously for Perplexity (24% of citations from niche directories)
Source: yext.com/blog/ai-visibility-in-2025

- Brand mentions across authoritative sources have stronger predictive power than backlinks for LLM visibility
Source: Multiple industry sources (gen-optima.com, discoveredlabs.com)

- Wikipedia entries significantly increase citation rates (primary training data for LLMs)
Source: discoveredlabs.com/blog/entity-recognition-knowledge-graphs

- Cross-platform consistency is required: owned site (Gemini), directories/review sites (ChatGPT), community platforms (Perplexity)

**Implication:** A GEO product that only optimizes on-site content is solving 15% of the problem. Off-site presence is the majority of the game.

---

## 4. Content Types That Perform Best

| Content Type | Citation Rate | Source |
|-------------|--------------|--------|
| Video (YouTube) | ~23.3% of all AI Overview citations | SurferSEO, 36M AI Overviews |
| Listicle pages | 5x higher than standard blog posts | GenOptima (LOW confidence) |
| Comparison content | 2.1x more cited than non-comparative | GenOptima (LOW confidence) |
| FAQ pages | High citation rate, AI engines love FAQs | Multiple sources |
| Press releases | 0.04% citation rate (almost worthless) | ALM Corp |

- Content freshness: 76.4% of ChatGPT's top-cited pages updated within 30 days
Source: frase.io/blog/faq-schema-ai-search-geo-aeo

---

## 5. Technical Signals

### Schema Markup (JSON-LD)
- Google and Microsoft confirmed schema helps their AI systems (official statements, 2025)
- BUT: Search Atlas study found "no correlation between schema coverage and citation rates"
- ChatGPT, Perplexity, Anthropic have NOT disclosed whether they use schema
- No peer-reviewed studies exist on schema's impact on AI visibility
Source: searchengineland.com/schema-markup-ai-search-no-hype-472339

**Verdict:** Implement schema (low cost, some benefit), but don't treat it as a silver bullet.

### llms.txt
- Proposed standard by Jeremy Howard (fast.ai), adopted by Anthropic, Cloudflare, Stripe, Vercel
- BUT: Only 0.1% of AI crawler requests touch /llms.txt (OtterlyAI data)
- 8 of 9 test sites saw NO measurable change after implementation
- Only 5-15% of websites have implemented it
Source: otterly.ai/blog/the-llms-txt-experiment

**Verdict:** Low effort to generate, near-zero proven impact. Nice to have, not a priority.

### Traditional SEO's Role
- Moderate correlation between backlinks and AI visibility (Pearson ~0.23, Spearman ~0.36)
- Follow vs nofollow links have nearly identical AI impact (departure from SEO)
- Content depth, readability, freshness matter MORE than traditional SEO metrics
- Brands cited in AI Overviews earn 35% more organic clicks, but organic CTR dropped 61% for queries with AI Overviews
Sources: semrush.com/blog/backlinks-ai-search-study, salt.agency, dataslayer.ai

---

## 6. AI Content Risks & Safeguards

### Google's Stance
- Google does NOT penalize AI content per se — it penalizes low-quality content regardless of origin
- "Scaled content abuse" is the trigger: generating many pages without adding value
- 86.5% of top-ranking pages use AI assistance
- Sites publishing 50+ AI pages/month saw ranking crashes within 60-90 days
Sources: developers.google.com/search/blog/2023/02/google-search-and-ai-content, iconier.com

### The Commoditization Trap
- 75% of content professionals say AI has increased volume (survey, Nov 2025)
- When competitors use same AI tools on same topics, content becomes identical noise
- Only 30% of brands stay visible between consecutive AI answers; 20% across 5 runs
- DIFFERENTIATION is survival: unique data, real statistics, proprietary insights
Sources: eMarketer, triangledirectmedia.com, AirOps research

### Quality Requirements
- 93% of marketers edit AI content before publishing
- Google rates AI content as "Lowest" ONLY when it "lacks human oversight and review"
- YMYL content (health, finance, legal) faces stricter standards — AI error rates 18-88%
- E-E-A-T is "non-negotiable" for AI visibility: author credentials, real case studies, expert reviews
Sources: searchengineland.com, Google Quality Rater Guidelines, ipullrank.com

### Legal Requirements (ALL Apply to Beamix)
- **FTC:** AI content in marketing must be transparent and not misleading
- **California AI Transparency Act (Jan 2026):** AI detection tools and content disclosures required
- **EU AI Act (Aug 2026):** Full transparency obligations for AI-generated content
- **Copyright risk:** Fully AI-generated content may not be copyrightable without meaningful human contribution
Sources: ftc.gov, pearlcohen.com, workos.com/blog/why-ai-still-needs-you

### Safeguards Our Product MUST Have
1. Human review gate before publishing — mandatory, not optional
2. Inject unique business-specific data (statistics, local data, proprietary insights)
3. Add E-E-A-T signals (author attribution, credentials, real experience markers)
4. Topic risk tiers (YMYL content needs stricter review)
5. Disclosure mechanisms built into content output
6. Content rate limits (never flood a site with 50+ pages/month)

---

## 7. Competitive Landscape

### The Market Gap

No tool at $49-$349/mo offers full agentic GEO execution. The market is split:
- **Affordable monitors** ($29-$500/mo): Show dashboards, don't fix anything
- **Enterprise execution** ($3,000+/mo): BrightEdge Autopilot does autonomous optimization
- **Agencies** ($1,500-$30,000/mo): Full service but expensive

### Key Competitors

| Tool | Price | What It Does | Agentic? |
|------|-------|-------------|----------|
| Otterly.ai | $29-$489/mo | Monitor 6 engines, audits, reporting | NO |
| Peec.ai | EUR 85-425/mo | Monitor up to 10 engines, sentiment | NO |
| Profound | $99+/mo | Share-of-voice, prompt research, attribution | NO |
| Scrunch AI | $100-$500/mo | Persona tracking, AXP bot optimization (pilot) | PARTIAL |
| Writesonic | $249+/mo (GEO) | Monitor + content creation | PARTIAL |
| Frase | $39+/mo | AI Agent with 80+ skills, SEO+GEO scoring | YES (content only) |
| Semrush AI | $99-$199/mo | AI visibility add-on to SEO suite | NO |
| Ahrefs Brand Radar | $828+/mo | Brand visibility monitoring | NO |
| BrightEdge Autopilot | $3,000+/mo | Autonomous content optimization | YES (enterprise) |
| GEO Agency | $1,500-$30,000/mo | Full service | YES |
| **Beamix** | **$49-$349/mo** | **Scan + agentic fix** | **YES (our goal)** |

### What Nobody Does (Our Opportunity)
1. Full agentic GEO for SMBs at affordable pricing
2. Diagnose AND fix in one platform at SMB pricing
3. Multi-engine scan + AI agents that execute fixes
4. The "agency replacement" positioning — wide open
5. Localized Israeli market focus (Hebrew GEO)

### Market Size & Adoption
- GEO market: $848M (2025) → projected $33.7B by 2034 (50.5% CAGR)
- 54% of US marketers plan to implement GEO within 3-6 months
- AI-driven visitors convert 4.4x higher than standard organic
- Traditional search declining 25-40% by 2026 due to AI (Gartner)
Sources: Dimension Market Research, eMarketer, Semrush, Gartner

### Beamix Pricing vs Agencies
At $49-$349/mo, Beamix is:
- 4-85x cheaper than lowest agency GEO tier ($1,500/mo)
- 10-30x cheaper than mid-tier agency work ($3,000-$7,000/mo)
- Competitive with monitoring-only tools that don't actually fix anything
