# Beamix — SEO Strategy

*Updated 2026-05-23 — agency pivot*
*v2.0 · Owner: CMO*

---

## Strategic position

Beamix is a done-for-you GEO agency. Our SEO strategy targets two audiences simultaneously:

1. **Prospective customers** — B2B SaaS founders, law firm managing partners, dental practice owners searching for AI search visibility solutions
2. **AI engines** — ChatGPT, Perplexity, Gemini, Google AI Overviews — because Beamix must demonstrate GEO by ranking in the AI answers we sell

Our content must rank on Google AND be cited by LLMs. These are complementary, not competing goals.

---

## Keyword strategy — agency + vertical targeting

*Updated 2026-05-23 — agency pivot*

### Primary: GEO agency keywords

These signal purchase intent. Buyers who search these are looking for a service, not a tool.

| Keyword | Intent | Priority |
|---------|--------|----------|
| GEO agency for SaaS | High purchase intent | P0 |
| AI search visibility agency | High purchase intent | P0 |
| done-for-you GEO service | High purchase intent | P0 |
| AI search optimization agency | High purchase intent | P0 |
| generative engine optimization agency | High purchase intent | P0 |

---

### Vertical: B2B SaaS

| Keyword | Intent | Priority |
|---------|--------|----------|
| AI search visibility for SaaS | Commercial | P0 |
| ChatGPT visibility B2B SaaS | Commercial | P0 |
| how SaaS companies rank on ChatGPT | Informational → commercial | P0 |
| GEO for SaaS founders | Commercial | P1 |
| Perplexity visibility B2B software | Commercial | P1 |

---

### Vertical: legal

| Keyword | Intent | Priority |
|---------|--------|----------|
| AI search visibility for law firms | Commercial | P0 |
| ChatGPT optimization for attorneys | Commercial | P0 |
| law firm ChatGPT visibility | Commercial | P0 |
| how law firms rank on AI search | Informational → commercial | P0 |
| GEO for legal services | Commercial | P1 |

---

### Vertical: dental

| Keyword | Intent | Priority |
|---------|--------|----------|
| ChatGPT optimization for dentists | Commercial | P0 |
| AI search visibility for dental practices | Commercial | P0 |
| dentist Google AI Overviews | Informational → commercial | P0 |
| how dental practices rank on ChatGPT | Informational → commercial | P0 |
| GEO for dentists | Commercial | P1 |

---

### Secondary: broad SMB and GEO education

These are high-volume awareness keywords. They drive free scan traffic and build topical authority.

| Keyword | Intent | Priority |
|---------|--------|----------|
| AI search visibility small business | Informational | P1 |
| GEO for small business | Informational | P1 |
| how small businesses rank on ChatGPT | Informational | P1 |
| Beamix vs Profound | Commercial (branded) | P1 |

---

## Content architecture (revised for 3-vertical focus)

*Updated 2026-05-23 — agency pivot*

### Pillar pages (one per launch ICP)

Each vertical gets a pillar page (2,500–3,000 words) that targets the primary commercial keyword for that vertical and links to all vertical cluster articles.

1. `/blog/geo-agency-for-saas` — "The Done-For-You AI Search Visibility Guide for B2B SaaS"
2. `/blog/ai-search-visibility-law-firms` — "How Law Firms Get Cited by ChatGPT — The 2026 Playbook"
3. `/blog/chatgpt-optimization-dentists` — "How Dental Practices Appear in AI Search — The 2026 Guide"

Plus: the broad SMB pillar remains for awareness-stage traffic.
- `/blog/ai-search-visibility-guide-smb` — "The SMB Owner's Complete Guide to AI Search Visibility in 2026"

### Cluster articles (3 per week, one per vertical)

Each pillar page is supported by 4–8 cluster articles on more specific topics within that vertical. See CONTENT_PLAYBOOK.md for the full article list.

### State of AI Search annual report

The flagship data report (MVP+90) serves as an SEO and PR asset:
- Primary keyword: `State of AI Search 2026`
- Targets: journalists, industry publications, researchers who will link to it
- Distribution: featured on Beamix homepage, LinkedIn, outreach to Dentaltown/Above the Law/SaaS publications

---

## GEO: ranking in AI engines

*Updated 2026-05-23 — agency pivot*

Beamix must appear in AI answers for its own target keywords. This is both a business need and a proof of concept — if our content ranks in ChatGPT, it proves our method works.

### Technical GEO requirements

Every page on the Framer marketing site must have:
- [ ] Organization schema (site-wide)
- [ ] BlogPosting schema on blog posts
- [ ] FAQPage schema on pages with Q&A blocks
- [ ] BreadcrumbList schema
- [ ] Person schema on author pages
- [ ] llms.txt at site root (low-cost signal — worth implementing)
- [ ] Custom robots.txt allowing all AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Googlebot)

### Content GEO requirements

Every article must include:
- Self-contained definition block in first 400 words
- Sourced statistic in first 100 words
- Named quotation (not "experts say")
- FAQ block with FAQPage schema (for Q&A articles)
- Original data or observation from Beamix's own scanning

### Competitive comparison pages

These pages target high-intent buyers comparing options:

| Page | Primary keyword | Priority |
|------|-----------------|---------|
| Beamix vs Profound | Branded comparison | P1 |
| Beamix vs Otterly | Branded comparison | P1 |
| Beamix vs GEO agency | Category comparison | P1 |
| Done-for-you GEO vs DIY tool | Category education | P1 |

**Note:** "Done-for-you GEO vs DIY tool" is now a key differentiator page. Beamix is the service option; Profound/Otterly are the tool options. The comparison should be honest: tools give you data, Beamix does the work.

---

## Technical SEO requirements

### Framer marketing site

- Cloudflare reverse proxy for custom robots.txt + llms.txt
- All schema validates in Google Rich Results Test
- Google Search Console + Bing Webmaster Tools verified (Bing powers ChatGPT)
- Blog Collection + Authors Collection in Framer CMS
- OG images: 1200×630px for all pages
- Page speed: Core Web Vitals passing

### URL structure

| Page type | URL pattern |
|-----------|-------------|
| Vertical landing — SaaS | `/saas` |
| Vertical landing — Legal | `/legal` |
| Vertical landing — Dental | `/dental` |
| Blog posts | `/blog/[slug]` |
| State of AI Search | `/research/state-of-ai-search-2026` |
| FAQ hubs | `/faq/[topic]` |
| Pricing | `/pricing` |

---

## Measurement

| Metric | Tool | Target |
|--------|------|--------|
| Organic sessions to vertical landing pages | Google Search Console | Track growth |
| Ranking for primary vertical keywords | GSC + manual check | Top 20 by Month 3 |
| AI citations for target queries | Profound / Otterly / manual | First citation by Month 3 |
| Free scan completions from organic | UTM tracking | Track % of total |
| Discovery call bookings from blog | UTM tracking | Track % of total |
