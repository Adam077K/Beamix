# Framer SEO — Operating Doc for Beamix Blog + FAQ
*Research date: 2026-04-14 · Owner: Research Lead · Site: average-product-525803.framer.app*

## TL;DR

1. **Framer ships a credible default SEO foundation:** auto-generated sitemap.xml, robots.txt with sitemap pointer, per-page meta/OG/canonical, automatic 301 redirects on slug changes (with manual override). Most things work out of the box. [Source 1, 2]
2. **JSON-LD is supported via Custom Code on every page and CMS Collection Page template** — including dynamic CMS variables. The critical syntax: use `{{Field | json}}` (NOT raw `{{Field}}`) so values are properly escaped for JSON. [Source 3, 4]
3. **You CAN add FAQPage, BlogPosting/Article, Person, BreadcrumbList, Organization schema in Framer.** All require Custom Code blocks in `<head>`. Add Organization schema once site-wide; add the rest per page or per CMS template. [Source 3, 4, 5, 6]
4. **The biggest Framer SEO limitation: robots.txt and sitemap.xml are NOT directly editable** unless you proxy the site through a CDN (Cloudflare, etc.). For Beamix this matters because we want to add custom AI crawler directives. **Workaround: Cloudflare reverse proxy** — recommended setup. [Source 1, 2]
5. **CMS noindex limitation:** Framer cannot noindex a single CMS item. It's all-or-nothing per collection. Plan content accordingly — every blog post that exists will be indexed. [Source 1]
6. **Framer redirects require Pro plan or higher.** Wildcard with capture groups supported. Limit ~100 redirects on Pro, more on Business, unlimited on Enterprise.
7. **Performance is good by default.** Framer pre-renders for crawlers (no JS-only content), images served WebP with lazy loading, Core Web Vitals are typically green if you don't override defaults badly.
8. **Hreflang for HE/EN is supported via per-page settings.** Confirm in Page Settings → SEO. Beamix's bilingual strategy is feasible on Framer.
9. **RSS feed:** Framer generates one for CMS collections. URL pattern: `/blog/feed` or similar, depending on collection setup. Verify post-launch.
10. **Pre-launch checklist (8 must-dos in §8 below)** — robots.txt configuration via proxy, Organization schema, author pages with Person schema, FAQPage schema on top-level FAQ page, BlogPosting schema on blog template, hreflang, Search Console + IndexNow setup, llms.txt at site root.

---

## 1. Native SEO Capabilities

| Feature | Supported | How-to | Limitation |
|---------|-----------|--------|------------|
| Page meta title + description | ✅ | Page Settings → SEO | None |
| OG image + Twitter card | ✅ | Page Settings → Social Sharing | One image per page; site-default fallback |
| sitemap.xml | ✅ auto | `/sitemap.xml` auto-generated, only "indexable" pages | Cannot edit manually without proxy |
| robots.txt | ✅ basic | Auto-generated with sitemap pointer | Cannot add custom User-agent rules without proxy |
| Canonical URL | ✅ | Auto + manual override per page | None |
| 301 redirects | ✅ (Pro+) | Site Settings → Redirects | ~100 limit on Pro; permanent only (no 302) |
| Wildcard redirects | ✅ (Pro+) | Capture groups in redirect rules | Same plan limits |
| Noindex per page | ✅ | Page Settings → "Show page in search engines" toggle | Cannot noindex single CMS item — collection-wide only |
| HTTPS + SSL | ✅ auto | Custom domain auto-issues cert | None |
| Hreflang (HE/EN) | ✅ | Page Settings → SEO → Localization | Confirm syntax per page |
| Structured data (JSON-LD) | ✅ | Custom Code (Site Settings or per page) | All manual |
| Custom `<head>` code | ✅ (Pro+) | Site Settings → Custom Code → Start of `<head>` | Pro plan required |
| Image optimization | ✅ auto | WebP + lazy loading on by default | None |
| Pre-rendering for crawlers | ✅ | All public pages SSG/SSR-equivalent | Confirm with Search Console fetch |
| RSS feed | ✅ | Auto-generated per CMS collection | URL pattern depends on collection |

[Source 1, 2, 7]

---

## 2. Framer CMS for Blog — Setup Recipe

### Collection structure (Beamix Blog)
**Fields:**
- `Title` — Plain text, required
- `Slug` — Auto from title, override allowed
- `Excerpt` — Plain text, ~160 chars (also = meta description)
- `Cover Image` — Image, required (also = OG image)
- `Author` — Reference to "Authors" collection (single)
- `Category` — Reference to "Categories" collection (single)
- `Tags` — Multi-select or reference, optional
- `Published Date` — Date, required
- `Updated Date` — Date, required (initially = published, update on edits)
- `Reading Time` — Number (minutes)
- `Body` — Rich Text or Markdown
- `FAQ Items` — Repeating field with Question + Answer sub-fields (for FAQPage schema)
- `Show in Search` — Toggle (default true) — for accidental drafts
- `Featured` — Toggle for homepage promotion

### Authors collection (separate from Blog)
- `Name`, `Slug`, `Bio` (long text), `Photo`, `Job Title`, `LinkedIn URL`, `X URL`, `Personal URL`, `Knows About` (multi-text), `Email` (optional)

### URL structure
- Blog index: `/blog`
- Blog post: `/blog/[slug]`
- Author page: `/authors/[slug]`
- Category: `/blog/category/[slug]` (optional)

### Per-CMS-page Custom Code (in `<head>` of Collection Page template)
See §3 for full JSON-LD blocks.

[Source 3, 8]

---

## 3. JSON-LD Injection — Step-by-Step

**Where to add:**
- **Site-level (every page):** Site Settings → Custom Code → Start of `<head>`. Use for Organization schema.
- **Page-level (specific page):** Page Settings → Custom Code → Start of `<head>`. Use for static pages (FAQ page, homepage, About).
- **CMS Collection template (every item in collection):** Open the Collection Page template → Settings → Custom Code → Start of `<head>`. Use `{{Field | json}}` syntax for dynamic values.

**Critical syntax rule:** Use `{{Field Name | json}}` — the `| json` filter escapes the value safely. Never use `{{Field Name}}` raw — it will break the JSON when content contains quotes or newlines. `unsafeRaw` exists but is dangerous for user-entered text. [Source 3, 4]

### 3.1 Organization schema (site-wide, add once in Site Settings)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Beamix",
  "url": "https://beamix.com",
  "logo": "https://beamix.com/logo/beamix_logo_blue_Primary.png",
  "sameAs": [
    "https://www.linkedin.com/company/beamix",
    "https://x.com/beamixhq"
  ],
  "description": "Beamix scans your business across every major AI engine and uses agents to fix your visibility.",
  "foundingDate": "2026",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@beamix.com"
  }
}
</script>
```

### 3.2 BlogPosting / Article schema (Blog Collection template)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": {{Title | json}},
  "description": {{Excerpt | json}},
  "image": {{Cover Image | json}},
  "datePublished": {{Published Date | json}},
  "dateModified": {{Updated Date | json}},
  "author": {
    "@type": "Person",
    "name": {{Author.Name | json}},
    "url": "https://beamix.com/authors/{{Author.Slug}}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Beamix",
    "logo": {
      "@type": "ImageObject",
      "url": "https://beamix.com/logo/beamix_logo_blue_Primary.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://beamix.com/blog/{{Slug}}"
  }
}
</script>
```

### 3.3 FAQPage schema (FAQ page + any blog post with FAQ block)
**For static FAQ page:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Beamix?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Beamix scans your business across every major AI engine — ChatGPT, Gemini, Claude, Perplexity — and uses agents to fix your visibility."
      }
    },
    {
      "@type": "Question",
      "name": "How does the free scan work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Enter your URL. We query each AI engine with real prompts about your industry and location. Results in 60 seconds, no account needed."
      }
    }
  ]
}
</script>
```

**For CMS-driven FAQ on blog posts:** Build the schema dynamically by iterating the FAQ Items repeating field — Framer supports loops in Custom Code blocks.

### 3.4 Person schema (Author page template)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": {{Name | json}},
  "url": "https://beamix.com/authors/{{Slug}}",
  "image": {{Photo | json}},
  "jobTitle": {{Job Title | json}},
  "worksFor": {
    "@type": "Organization",
    "name": "Beamix",
    "url": "https://beamix.com"
  },
  "sameAs": [
    {{LinkedIn URL | json}},
    {{X URL | json}}
  ],
  "description": {{Bio | json}},
  "knowsAbout": {{Knows About | json}}
}
</script>
```

### 3.5 BreadcrumbList (Blog Collection template)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://beamix.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://beamix.com/blog" },
    { "@type": "ListItem", "position": 3, "name": {{Title | json}}, "item": "https://beamix.com/blog/{{Slug}}" }
  ]
}
</script>
```

**Validate every schema** at https://search.google.com/test/rich-results before publishing the template.

[Source 3, 4, 5, 6]

---

## 4. Performance & Crawler Rendering

- **Pre-rendering:** Framer serves pre-rendered HTML for all public pages — confirmed via "View Page Source" on existing Framer sites. AI crawlers (GPTBot, ClaudeBot, PerplexityBot) get full content without JS execution. [Source 7]
- **Verification method:** Use Google Search Console URL Inspection → "View Crawled Page" to confirm rendered HTML matches what crawlers see.
- **Core Web Vitals:** Generally green by default. Cover images can hurt LCP — use Framer's responsive image controls and avoid 4K hero images.
- **JS bundle size:** Framer ships a sizeable runtime — not ideal for performance, but acceptable. Don't add heavy custom JS.
- **AI crawler JS execution:** GPTBot/PerplexityBot DO execute JS but slowly and unreliably. Pre-rendered HTML is critical — confirmed by Framer's defaults.

---

## 5. Known Limitations & Workarounds

| Limitation | Workaround |
|------------|-----------|
| robots.txt not editable | **Cloudflare reverse proxy** — set up Cloudflare in front of Framer, override robots.txt at Cloudflare layer. Required if we want custom AI crawler rules. |
| sitemap.xml not editable | Auto-generation is sufficient for most needs; if needed, supplement with secondary sitemap (e.g., `/sitemap-news.xml`) hosted via proxy |
| No 302 (only 301/308) redirects | Accept the limitation — for SEO 301 is correct anyway |
| No noindex on single CMS item | Plan content carefully; use a "Hidden" toggle field + filter out from index page (note: page still indexable if discoverable) |
| Custom Code requires Pro plan | Upgrade to Pro minimum ($20/mo as of 2026) |
| No native llms.txt support | Host via Cloudflare proxy or upload to Framer as a static file (verify file extension support) |
| Limited custom URL patterns | Stick with Framer's CMS slug pattern: `/blog/[slug]` is fine |

---

## 6. AI Crawler Configuration

**Default Framer robots.txt** (typical):
```
User-agent: *
Allow: /
Sitemap: https://beamix.com/sitemap.xml
```

**Beamix-recommended robots.txt** (requires Cloudflare proxy to deploy):
```
# Search bots — allow
User-agent: Googlebot
Allow: /
User-agent: Bingbot
Allow: /

# AI search bots — allow
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Claude-User
Allow: /

# AI training bots — allow (we want to be in training data)
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: CCBot
Allow: /

# Abusive — block (server-level if respected, otherwise CDN block)
User-agent: Bytespider
Disallow: /

User-agent: *
Allow: /

Sitemap: https://beamix.com/sitemap.xml
```

**llms.txt** (host at `https://beamix.com/llms.txt`):
```
# Beamix

> Beamix scans SMBs across every major AI engine — ChatGPT, Gemini, Claude, Perplexity — and uses AI agents to fix their visibility. Free scan available.

## Core pages
- [How It Works](https://beamix.com/how-it-works): Three-step product overview — scan, diagnose, fix
- [Pricing](https://beamix.com/pricing): Three plans starting $49/mo
- [Free Scan](https://beamix.com): Anonymous AI search audit, results in 60 seconds

## Blog
- [Blog index](https://beamix.com/blog): SMB guides for AI search visibility
- [Vertical guides](https://beamix.com/blog/category/vertical): Industry-specific playbooks
- [The Beamix Visibility Index](https://beamix.com/blog/category/index): Quarterly data reports

## About
- [About Beamix](https://beamix.com/about): Company background and team
- [Authors](https://beamix.com/authors): Editorial team
```

---

## 7. Author Pages, RSS, hreflang

### Author pages
- Build `Authors` collection in Framer CMS (see §2 fields)
- Create Author Collection Page template at `/authors/[slug]`
- Add Person schema (see §3.4)
- Each author page shows: bio, photo, sameAs links, list of articles

### RSS feed
- Framer auto-generates RSS for CMS collections
- Verify URL post-launch: typically `/blog/feed` or `/blog/rss.xml`
- Submit to feed aggregators if relevant

### Hreflang for HE/EN
- Framer supports per-page localization in Page Settings → SEO → Localization
- For each English page, declare Hebrew variant URL, and vice versa
- Recommended URL structure:
  - English: `/blog/[slug]`
  - Hebrew: `/he/blog/[slug]` OR subdomain `he.beamix.com/blog/[slug]`
- Confirm hreflang tags render in `<head>` after publishing

---

## 8. Pre-Launch SEO Checklist for Beamix Blog

**One-time setup (before first article ships):**

- [ ] Pro plan active (required for Custom Code)
- [ ] Cloudflare reverse proxy live (required for custom robots.txt + llms.txt)
- [ ] Custom robots.txt deployed via Cloudflare (see §6)
- [ ] llms.txt deployed at `/llms.txt` (see §6)
- [ ] Organization schema added site-wide (Site Settings → Custom Code) (see §3.1)
- [ ] Blog Collection set up with all fields (see §2)
- [ ] Authors Collection set up with at least 1 author (see §2)
- [ ] Blog Collection Page template includes BlogPosting + BreadcrumbList schema (§3.2, §3.5)
- [ ] Author Collection Page template includes Person schema (§3.4)
- [ ] FAQ static page built with FAQPage schema (§3.3)
- [ ] hreflang configured for HE/EN if both languages launch together
- [ ] Search Console verified for `beamix.com`
- [ ] sitemap.xml submitted to Search Console
- [ ] IndexNow integration (if desired, via Cloudflare worker)
- [ ] Bing Webmaster Tools verified + sitemap submitted (powers ChatGPT)
- [ ] Test schema for every template at search.google.com/test/rich-results
- [ ] Test rendering at search.google.com/search-console URL inspector

**Per-article publishing checklist:**
- [ ] Cover image set (1200×630, <300KB)
- [ ] Excerpt = meta description (~150 chars)
- [ ] Author selected
- [ ] Published Date + Updated Date set
- [ ] FAQ Items populated if applicable
- [ ] Featured image alt text written
- [ ] Internal links to ≥3 related articles
- [ ] Outbound links to ≥2 authoritative sources
- [ ] Validate rendered schema in Rich Results Test before going live

---

## Sources

1. **Framer Help — SEO optimization features** — framer.com/help/articles/guide-to-seo-features-and-tools — accessed 2026-04-14 — HIGH (primary)
2. **Framer Help — robots.txt access** — framer.com/help/articles/how-can-i-access-the-robots-txt-file — 2026-04-14 — HIGH (primary)
3. **Framer Help — Structured data through JSON-LD** — framer.com/help/articles/structured-data-through-json-ld — 2026-04-14 — HIGH (primary)
4. **Josue Somarribas — JSON-LD Blog Schema in Framer CMS** — josuesomarribas.com/blog/seo-schema-in-framer — 2026-04-14 — MEDIUM (practitioner)
5. **BRIX Templates — FAQ Schema in Framer** — brixtemplates.com/blog/how-to-add-faq-schema-to-framer — 2026-04-14 — MEDIUM
6. **BRIX Templates — Breadcrumb Schema in Framer** — brixtemplates.com/blog/how-to-add-breadcrumb-schema-in-framer — 2026-04-14 — MEDIUM
7. **The SEO Kitchen — Honest Framer SEO Review (2025)** — theseokitchen.com/framer-seo-review — 2026-04-14 — MEDIUM (practitioner with hands-on)
8. **JaneUI — Robots.txt and Sitemap for Framer Websites** — janeui.com/articles/robots-and-sitemap — 2026-04-14 — MEDIUM
9. **Cogney — Schema Code on Framer CMS Page** — cogney.com/blog/schema-code-on-a-framer-cms-page — 2026-04-14 — MEDIUM
10. **Temlis — Framer SEO Checklist** — temlis.com/blogs/framer-seo-checklist-everything-you-need-to-optimize-your-site — 2026-04-14 — MEDIUM
11. **Framer Community — Modify Robots.txt and Sitemap.xml thread** — framer.community/c/support/modify-robots-txt-and-sitemap-xml — 2026-04-14 — MEDIUM (community confirmation of limitation)

## Gaps & Open Questions for Framer Support

- Confirm exact RSS feed URL pattern post-collection-creation
- Confirm whether `/llms.txt` can be uploaded as a static file in Framer or requires proxy
- Confirm hreflang tag rendering on multilingual setups (test in production)
- Confirm Pro plan redirect limit (~100) is still current as of 2026
- Verify that loop syntax in Custom Code can iterate FAQ Items field for dynamic FAQPage schema
- Verify that `{{Field | json}}` works for image fields (URL extraction) and reference fields (nested values)
