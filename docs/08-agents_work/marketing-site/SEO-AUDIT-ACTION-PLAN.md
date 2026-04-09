# Beamix SEO Audit — Action Plan

> **Audit date:** April 9, 2026
> **SEO Health Score:** 39/100 (Poor → target 75+ after fixes)
> **Site:** https://beamix.tech (Framer)

**Note:** Structured data (Organization, SoftwareApplication, FAQ schemas) ARE working — confirmed via Google Rich Results Test. Audit agents couldn't detect them because WebFetch doesn't execute Framer's client-side script injection.

---

## CRITICAL — Fix Before Launch

### 1. Fix Broken Footer Links
- `/terms-privacy` → 404. Change link to `/privacy-policy`
- `/contact` → 404. Change link to `/contacts`
- **Where:** Footer component in Framer
- **Impact:** Trust + crawl errors in Search Console

### 2. Create llms.txt
A GEO platform without llms.txt is a credibility gap. Create a page at `/llms.txt` in Framer (or via custom code redirect) with this content:

```
# Beamix
> AI search visibility platform for SMBs

## About
Beamix scans your business across ChatGPT, Gemini, Claude, Perplexity, and 10+ AI engines. It shows where you rank, diagnoses why you're missing, and uses 16 AI agents to produce the content that gets you recommended.

## Product
- Website: https://beamix.tech
- Category: GEO (Generative Engine Optimization) / SaaS
- Target: Small and medium businesses (5-200 employees)
- Pricing: Starter $49/mo, Pro $149/mo, Business $349/mo

## Key Pages
- Features: https://beamix.tech/features
- Pricing: https://beamix.tech/pricing
- Company: https://beamix.tech/company
- Blog: https://beamix.tech/blog
- Contact: https://beamix.tech/contacts

## How It Works
1. Scan: Query 10+ AI engines with real prompts about your industry and location
2. Diagnose: See where you rank, who outranks you, and why
3. Fix: 16 AI agents create content, schema markup, FAQs, and strategy
4. Repeat: Rescan, measure improvement, compound the advantage

## AI Agents
Content Writer, Blog Writer, FAQ Agent, Schema Optimizer, Competitor Intelligence, Review Analyzer, Brand Narrative Analyst, and 9 more specialized agents.
```

**How in Framer:** You can't create a `.txt` file directly. Options:
- Add it via Framer custom code that serves at `/llms.txt` path
- Or create it on your hosting/CDN level
- Or add the content as a meta tag / structured data alternative

### 3. Add Founder Name to Company Page
- Add your name, role, and 1-2 lines of background to the Mission section
- Example: "Founded by [Your Name], [brief background]"
- Optional: Add a photo and LinkedIn link
- **Where:** Company page, Mission section in Framer
- **Impact:** E-E-A-T trust signal — Google weights author transparency heavily

### 4. Remove/Fix Testimonials on Live Site
The audit detected testimonials with generic names (Sophia Green, Emma Carter, Daniel Reed) on the live homepage. Either:
- These are from a component we didn't clean (check the Testimonials component `jcLpI2oeS`)
- Or the site needs republishing after our edits
- **Action:** Remove entirely until you have real testimonials, or verify our earlier removal is live

---

## HIGH — Fix This Week

### 5. Fix Heading Hierarchy
Every page should follow: H1 → H2 → H3 → H4 (no skipping levels).

Current problems:
- Homepage: H2 jumps to H6
- Pricing: Uses H6 for major sections
- Company: Uses H4 and H6 with no H2/H3

**How in Framer:** Select each text layer → right panel → change the Tag dropdown to the correct heading level. Each page needs exactly 1 H1, then H2s for sections, H3s for subsections.

| Page | H1 | H2s |
|------|----|-----|
| `/` | "AI Search Visibility. Scan. Fix. Rank." | Each section title (Benefits, Scan.D.F.R, Features, Pricing, FAQ) |
| `/features` | "Features" | Each feature section |
| `/pricing` | "Start free. Upgrade when you see results." | Plan names, FAQ |
| `/company` | "Why We Built Beamix" | The Gap, Three Beliefs, Vision, Mission |
| `/blog` | "The Beamix Blog" | — |
| `/contacts` | "Get in Touch" | — |
| `/waitlist` | Main CTA headline | — |

### 6. Improve Content Citability (First 60 Words)
AI engines extract from the top of the page. Add a citable definition paragraph early on the homepage, right after the H1:

> "Beamix is the AI search visibility platform for small and medium businesses. It scans your business across ChatGPT, Gemini, Claude, Perplexity, and 10+ AI engines, diagnoses why you're not being recommended, and uses 16 AI agents to produce the content that fixes it — ready to publish in minutes."

This is a 50-word passage that any AI can extract and cite.

### 7. Add Alt Text to All Images
Go through each page in Framer. Click every image → fill in alt text:

| Image | Alt text suggestion |
|-------|-------------------|
| Hero background | "Beamix AI search visibility dashboard" |
| Dashboard mockup | "Beamix dashboard showing visibility score across AI engines" |
| AI engine logos | "AI engines scanned by Beamix: ChatGPT, Gemini, Claude, Perplexity" |
| Logo | "Beamix logo" |
| Company images | Describe what's shown |

### 8. Homepage HTML Size (1MB)
This is a Framer platform limitation (it bundles CSS/JS inline). Not much you can do directly, but:
- Reduce number of images on homepage (compress or lazy-load)
- Remove unused components
- This becomes less of an issue as Framer optimizes their rendering

---

## MEDIUM — Fix Within 1 Month

### 9. Add hreflang Tags (HE/EN)
When you add Hebrew language support, add hreflang tags. Not needed until Hebrew pages exist.

### 10. Add /privacy-policy to Sitemap
In Framer Page Settings for /privacy-policy, ensure "Show in search engines" is ON.

### 11. Publish Blog Content
Write 3-4 seed articles targeting:
- "What is GEO? Complete Guide 2026"
- "Why Your Business Isn't Showing Up on ChatGPT"
- "GEO vs SEO: What's Different"
- "AI Search Visibility for SMBs"

### 12. Add Citable Definition to Key Pages
Add a clear, extractable definition paragraph to /features and /company pages too (not just homepage). AI engines crawl all pages.

### 13. Expand Thin Content
- Pricing page: Add more detail below pricing cards (comparison table, feature matrix)
- Company page: Expand to 800+ words with founder story, team info, mission detail

### 14. Add AI Crawler Rules to robots.txt
Framer doesn't let you edit robots.txt directly, but if you ever move to a CDN/proxy, add:
```
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /
```

---

## LOW — Backlog

### 15. IndexNow Protocol
Submit URLs to Bing/Yandex for faster indexing. Not critical for launch.

### 16. Canonical Tags
Framer doesn't support custom canonicals on non-Enterprise plans. Monitor for duplicate content issues in Search Console. If problems appear, consider upgrading.

### 17. Content-Security-Policy Header
Platform limitation (Framer controls headers). Not actionable now.

---

## Expected Score After Fixes

| Category | Current | After Fixes | Delta |
|----------|---------|-------------|-------|
| Technical SEO | 52 | 70 | +18 |
| Content Quality | 32 | 65 | +33 |
| On-Page SEO | 55 | 80 | +25 |
| Schema | 10 | 85 | +75 |
| Performance | 40 | 45 | +5 |
| AI Search Readiness | 34 | 72 | +38 |
| Images | 50 | 75 | +25 |
| **Weighted Total** | **39** | **71** | **+32** |

Target: 71/100 (Good) after all Critical + High items are fixed.
