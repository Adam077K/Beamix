# Framer SEO Checklist — Beamix Marketing Site

> **How to apply:** In Framer, select a page in the left panel > click the gear icon (Page Settings) > fill in Title, Page Description, and Social Image.

---

## Page-Level SEO (copy-paste ready)

### Homepage `/`
- **Title:** `Beamix — Get Your Business Found on ChatGPT, Gemini & AI Search`
- **Description:** `Beamix scans your business across every major AI engine, shows where you rank, and uses AI agents to fix it. Free scan in 60 seconds.`
- **OG Title:** `Is your business invisible to AI? Find out in 60 seconds.`
- **OG Description:** `Beamix scans every major AI engine for your business — then writes the content that gets you ranked. Free scan, no account needed.`

### Features `/features`
- **Title:** `Features — How Beamix Gets You Ranked on AI Search`
- **Description:** `See how Beamix scans 10+ AI engines, diagnoses visibility gaps, and uses 16 AI agents to create the content that gets you recommended.`
- **OG Title:** `16 AI Agents That Do the Work for You`
- **OG Description:** `Beamix doesn't just show you a dashboard. It scans, diagnoses, and fixes your AI search visibility with specialized agents.`

### Pricing `/pricing`
- **Title:** `Pricing — AI Search Visibility Plans Starting at $49/mo`
- **Description:** `Start free. Upgrade when you see results. Beamix plans for every business size — Starter $49, Pro $149, Business $349. No agency required.`
- **OG Title:** `AI Search Visibility Starting at $49/mo`
- **OG Description:** `Everything your business needs to rank on AI search. 16 agents, 10+ engines, real deliverables. 7-day free trial included.`

### Company `/company`
- **Title:** `About Beamix — Why We Built the GEO Platform for SMBs`
- **Description:** `We built Beamix because insights without action is expensive confusion. The AI search platform that does the work for you.`
- **OG Title:** `Why We Built Beamix`
- **OG Description:** `Every GEO tool tells you where you stand. Most stop there. Beamix agents do the work.`

### Blog `/blog`
- **Title:** `Blog — AI Search Visibility Insights & GEO Strategy`
- **Description:** `Insights on AI search visibility, GEO strategy, and how businesses are getting found by ChatGPT, Gemini, Claude, and more.`
- **OG Title:** `The Beamix Blog — GEO & AI Search Insights`
- **OG Description:** `Learn how businesses are getting recommended by AI search engines. Strategies, guides, and industry analysis.`

### Contacts `/contacts`
- **Title:** `Contact Beamix — Questions About AI Search Visibility`
- **Description:** `Have a question about Beamix, pricing, or how AI search visibility works? Get in touch at support@beamix.tech.`
- **OG Title:** `Get in Touch with Beamix`
- **OG Description:** `Questions about AI search visibility? We'd love to hear from you.`

### Waitlist `/waitlist`
- **Title:** `Join the Waitlist — Beamix AI Search Visibility`
- **Description:** `Be first to get access when Beamix launches. AI agents that scan, diagnose, and fix your AI search visibility.`
- **OG Title:** `Join the Beamix Waitlist`
- **OG Description:** `Get early access to the AI search visibility platform that does the work for you.`

### Privacy Policy `/privacy-policy`
- **Title:** `Privacy Policy — Beamix`
- **Description:** `How Beamix collects, uses, and protects your data. Last updated March 2026.`
- **Show in search engines:** ON (important for trust)

### 404 `/404`
- **Show in search engines:** OFF (exclude from indexing)

---

## Structured Data (JSON-LD)

Add this in Framer: **Site Settings > Custom Code > Start of `<head>` tag**

### Organization Schema (site-wide)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Beamix",
  "url": "https://beamix.tech",
  "logo": "https://beamix.tech/logo/beamix_logo_blue_Primary.png",
  "description": "Beamix scans your business across AI engines, shows where you rank, and uses AI agents to fix it.",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@beamix.tech",
    "contactType": "customer support"
  },
  "sameAs": []
}
</script>
```

### FAQ Schema (add to Pricing page custom code)
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
        "text": "Beamix is a GEO (Generative Engine Optimization) product that scans your business across AI engines like ChatGPT, Gemini, and Claude, shows you where you rank, and uses AI agents to produce the content that gets you recommended."
      }
    },
    {
      "@type": "Question",
      "name": "What is an agent use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "One agent execution — one blog post, one schema file, one review analysis. One use per run, regardless of agent type."
      }
    },
    {
      "@type": "Question",
      "name": "Can I try before paying?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Run a free scan instantly — no account needed. Paid plans include a 7-day free trial with 5 agent credits. No credit card required."
      }
    },
    {
      "@type": "Question",
      "name": "Do unused agent uses roll over?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — up to 20% rolls over each month. We don't punish a slow month."
      }
    },
    {
      "@type": "Question",
      "name": "Can I cancel anytime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. No lock-in, no fees. Cancel in two clicks from your dashboard."
      }
    },
    {
      "@type": "Question",
      "name": "Which AI engines does Beamix scan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free scans cover ChatGPT, Gemini, and Perplexity. Starter adds a 4th engine. Pro covers 8 engines including Claude and Google AI Overviews. Business covers 10+ engines."
      }
    }
  ]
}
</script>
```

---

## Technical SEO Checklist

Do these in Framer's UI:

- [ ] **Custom domain:** Connect `beamix.tech` (or your domain) in Site Settings > Domains. Add 2 A records + 1 CNAME in DNS.
- [ ] **Page titles:** Set unique title for each page (copy from above)
- [ ] **Meta descriptions:** Set unique description for each page (copy from above)
- [ ] **OG images:** Upload a 1200x630px branded social card for each page (Page Settings > Page Images > Social Preview)
- [ ] **Exclude /404:** Page Settings > toggle "Show in search engines" OFF
- [ ] **Alt text on images:** Click each image > fill in alt text describing the image
- [ ] **One H1 per page:** Verify each page has exactly one H1 heading (Framer allows multiple — must check manually)
- [ ] **Submit sitemap:** After publishing, go to Google Search Console > Sitemaps > add `yourdomain.com/sitemap.xml`
- [ ] **Structured data:** Paste the JSON-LD scripts in Site Settings > Custom Code > `<head>`
- [ ] **Check with Meta Check:** Framer's built-in Meta Check tool (in Page Settings) previews how your pages appear on Google, X, LinkedIn

---

## SEO Content Strategy (for blog)

Target these keyword clusters when you write blog articles:

| Keyword Cluster | Search Intent | Article Ideas |
|----------------|--------------|---------------|
| "AI search optimization" / "GEO" | Informational | "What is GEO? The Complete Guide for 2026" |
| "ChatGPT business visibility" | Problem-aware | "Why Your Business Isn't Showing Up on ChatGPT (And How to Fix It)" |
| "AI search vs Google SEO" | Comparison | "GEO vs SEO: What's Different and Why It Matters" |
| "AI engine ranking factors" | Informational | "What AI Engines Look for When Recommending Businesses" |
| "small business AI marketing" | Solution-aware | "AI Search Visibility for SMBs: The $49/mo Alternative to Agencies" |
