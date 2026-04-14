# 00 — Project Context

> Read this to understand who Beamix is, what we're building, and what rails the content must ride on.

---

## What Beamix Does

Beamix is a **GEO platform for SMBs** — Generative Engine Optimization. We scan small and mid-sized businesses for AI search visibility across ChatGPT, Gemini, Claude, Perplexity, Google AI Overviews, and others. We diagnose why a business ranks (or doesn't) in AI answers, and then our agents *do the work* to fix it: writing content, adding schema, optimizing FAQs, analyzing reviews, tracking competitors.

**Competitive edge:** Competitors (Profound, Otterly, AthenaHQ) sell dashboards. Beamix sells **outcomes** — the agents ship deliverables, not to-dos.

**Tagline:** "Not a dashboard. Beamix does the work for you."

---

## Audience

**Primary:** Owner-operators of Israeli and global SMBs. Specifically in these verticals (product's current launch focus):
- Law firms
- Moving companies
- Insurance agents / brokers
- Restaurants
- Real estate brokers
- Dental practices
- Accountants / bookkeepers
- Home services & trades

**Awareness levels the content must serve:**
- **Unaware** — doesn't know AI search is a channel yet (needs education)
- **Problem-aware** — sees competitors in AI answers, doesn't know why (needs diagnosis)
- **Solution-aware** — knows GEO exists, comparing tools (needs competitive differentiation)
- **Product-aware** — evaluating Beamix specifically (needs trust + proof)

Most SMB-vertical content will target **problem-aware** and **solution-aware**. The pillar targets **unaware** and **problem-aware**.

---

## Brand Voice — The Three-Word Version

**Authoritative. Direct. Warm.**

**Authoritative.** We cite primary sources. We publish original data. We never say "studies show" without naming the study.

**Direct.** No throat-clearing. No "in today's rapidly evolving digital landscape". The first sentence of every article delivers the reader to the point.

**Warm.** We write to a restaurant owner in Tel Aviv, not to a Fortune 500 CMO. Plain language, practical examples, respect for the reader's time.

Full voice rules → `CONTENT_STYLE_GUIDE.md`.

---

## Locked Product Decisions (do not contradict in copy)

From `.claude/memory/MEMORY.md`:

**Pricing (2026-03-06 FINAL):**
- Starter: $49/mo (annual: $39/mo)
- Pro: $149/mo (annual: $119/mo)
- Business: $349/mo (annual: $279/mo)
- Free scan: $0, no account needed, 60-second results

**AI engines scanned by tier:**
- Free / Starter (3): ChatGPT, Gemini, Perplexity
- Pro (7): + Claude, Google AI Overviews, Grok (X), You.com
- Business (9+): TBD additions

**Trial:** 7 days, includes 5 agent credits, no credit card.

**Agents (16 total, A1–A16):** Content Writer, Blog Writer, FAQ Agent, Schema Optimizer, Competitor Intelligence, Review Analyst, Keyword Researcher, Local SEO Auditor, Brand Narrative Analyst, and others.

**Number of AI engines, agent count, or pricing claims in articles must match these exactly.**

---

## Architecture Split (critical — don't get confused)

| Surface | Platform | URL | What it covers |
|---------|----------|-----|----------------|
| Marketing website | **Framer** | average-product-525803.framer.app | Homepage, pricing, features, about, **blog**, **FAQ**, contacts |
| Product (dashboard/app) | **Next.js on Vercel** | This repo (`saas-platform/`) | Auth, scan, onboarding, dashboard, agents, settings |

**All blog + FAQ work lands in the Framer site, NOT the Next.js product.** The content agents deliver Markdown + JSON-LD schema blocks; the user pastes into Framer CMS.

The `src/components/landing/` folder in this repo is **deprecated** — do not touch.

---

## Brand Visual System (for reference — content is copy, not design)

- Primary accent: **#3370FF blue** (NOT orange, NOT cyan as accent)
- Fonts: Inter + InterDisplay (body/headings), Fraunces (serif accent), Geist Mono (code)
- Logo: blue star/cross mark + black "Beamix" wordmark
- Full specs → `docs/BRAND_GUIDELINES.md` v4.0

---

## Languages

- **Launch batch:** English only
- **Second pass:** Hebrew. Not literal translation — Hebrew localization with Israeli business tone
- Hebrew content is a **zero-competition** opportunity (no GEO competitor publishes in Hebrew)

---

## Hard Technical Constraints

### Framer SEO limitations (from research/FRAMER_SEO.md)
- `robots.txt` + `sitemap.xml` not directly editable → **requires Cloudflare reverse proxy** for custom robots.txt + llms.txt
- Custom Code block is where JSON-LD goes (one per page)
- CMS supports Markdown body + frontmatter fields
- Framer Pro plan required for Custom Code injection

### Schema we must deploy on every article
- `Article` schema (with `datePublished`, `dateModified`, `author`)
- `Person` schema (for author — requires bio, credential, LinkedIn)
- `FAQPage` schema (from the article's FAQ section)
- Optional: `BreadcrumbList`, `Organization` (site-wide)

All four have ready-to-paste templates in `research/FRAMER_SEO.md`.

---

## What Success Looks Like (90 days out)

- Beamix cited by ChatGPT / Perplexity / Gemini for 5+ SMB-vertical queries
- Pillar article ranking top 10 on Google for primary keyword within 60 days
- 20+ blog posts published covering all three clusters
- FAQ hub live on Framer site with 40+ Q&A
- Original-data report ("1,000 SMBs scanned") published and picked up by ≥3 external publications
- Hebrew content pass shipped

**North-star metric:** AI citations per week (tracked via Profound or Otterly).

---

## What Failure Looks Like (avoid)

- Generic "What is GEO?" articles that repeat what 5 competitors already published
- AI-generated prose with "delve", "tapestry", "realm" throat-clearing openers
- Missing author bylines, missing schema, missing "last updated" timestamps
- Articles without a sourced stat in the first 100 words
- Hebrew articles that are literal translations instead of native Israeli phrasing
- Fabricated testimonials or statistics (fireable offense)

---

*Next: read `01-RESEARCH-SUMMARY.md` for condensed findings from the 5-thread research sweep.*
