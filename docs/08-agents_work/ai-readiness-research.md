# AI Readiness Audit — Research Brief
*Synthesized from parallel research. Date: 2026-03-10.*

---

## 1. Current State (Researcher 1 — Codebase Audit)

### Files Involved

| File | Role | Status |
|------|------|--------|
| `saas-platform/src/app/api/ai-readiness/route.ts` | POST handler — triggers audit; GET handler — fetches latest | **Complete stub** — POST writes all-zeros |
| `saas-platform/src/app/(protected)/dashboard/ai-readiness/page.tsx` | Server component — fetches from DB, maps `score_breakdown` JSONB, passes to view | Wired correctly — no changes needed |
| `saas-platform/src/components/dashboard/ai-readiness-view.tsx` | Client component — renders score + 5 category cards | Wired to real data — no changes needed |
| `saas-platform/src/lib/types/database.types.ts` | Type definitions | `ai_readiness_history` types present |

### Database Schema

Table: `public.ai_readiness_history`

```sql
CREATE TABLE IF NOT EXISTS public.ai_readiness_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  score       integer NOT NULL CHECK (score >= 0 AND score <= 100),
  score_breakdown jsonb NOT NULL DEFAULT '{}',
  recorded_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, (recorded_at::date))   -- one audit per day per business
);
```

TypeScript type (from `database.types.ts`):
```typescript
ai_readiness_history: {
  Row: {
    business_id: string
    id: string
    recorded_at: string
    score: number           // composite 0–100
    score_breakdown: Json   // JSONB — the 5 dimension objects live here
  }
  // Insert/Update omitted for brevity
}
```

**Key constraint:** `UNIQUE(business_id, (recorded_at::date))` — max one audit row per business per calendar day. The implementation must `UPSERT` (not `INSERT`) or check for an existing same-day row before inserting.

### What the page component expects from `score_breakdown` JSONB

```typescript
{
  crawlability:    { score: number; description: string }
  schema_markup:   { score: number; description: string }
  content_quality: { score: number; description: string }
  faq_coverage:    { score: number; description: string }
  llms_txt:        { score: number; description: string }
}
```

The `description` field is rendered directly in the UI card — it should be a 1-2 sentence human-readable explanation of what was found and what to fix.

### Current Implementation Gap

The entire POST body of `/api/ai-readiness/route.ts` is:

```typescript
// TODO: Replace with real AI readiness audit logic
score: 0,
score_breakdown: {
  crawlability:    { score: 0, description: 'Audit in progress...' },
  schema_markup:   { score: 0, description: 'Audit in progress...' },
  content_quality: { score: 0, description: 'Audit in progress...' },
  faq_coverage:    { score: 0, description: 'Audit in progress...' },
  llms_txt:        { score: 0, description: 'Audit in progress...' },
}
```

No HTTP fetch, no HTML parsing, no robots.txt inspection, no schema extraction — nothing. The UI layer and DB schema are complete. Only the audit logic is missing.

---

## 2. Technical Approach (Researcher 2 — Implementation)

### Packages Available (already in `package.json`)

| Package | Version | Role |
|---------|---------|------|
| `cheerio` | `^1.2.0` | HTML parsing — **already installed**, jQuery-like API |
| `@types/cheerio` | `^0.22.35` | Type definitions for cheerio |

No new packages are required. Cheerio is the correct choice for this use case:
- It parses server-side HTML without a DOM (no headless browser overhead)
- Its jQuery-like API makes CSS selector-based extraction straightforward
- It handles malformed HTML gracefully (htmlparser2 under the hood)
- `parse5` is more spec-compliant but harder to query; `node-html-parser` is faster but has a smaller API surface

### Fetch Strategy

Use the native `fetch` API (available in Next.js 16 / Node 18+). No axios needed. Key constraints:
- Set a **10 second timeout** — third-party sites can be slow
- Use a neutral User-Agent: `"Beamix-AuditBot/1.0 (+https://beamix.io)"`
- Follow redirects (default behavior of `fetch`)
- Treat non-2xx responses as a fetch failure with a scored fallback (score = 0, description explains the failure)
- Fetch sequentially: `robots.txt` → homepage → `/llms.txt`

```typescript
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 10_000)
const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
clearTimeout(timeout)
```

### Dimension 1 — Crawlability (robots.txt)

**What to fetch:** `${baseUrl}/robots.txt`

**Parsing approach:** Plain text parsing — no library needed. Parse line by line.

```typescript
// robots.txt grammar:
// User-agent: GPTBot
// Disallow: /
// Allow: /public/
```

**AI crawlers to check** (ordered by market importance):

| Bot Name | Engine | Why It Matters |
|----------|--------|---------------|
| `GPTBot` | OpenAI / ChatGPT | Most important — ChatGPT has largest user base |
| `Google-Extended` | Google AI Overviews + Gemini training | Affects Google's AI products |
| `Googlebot` | Google Search (feeds Gemini) | Blocking this also hurts AI visibility |
| `PerplexityBot` | Perplexity | Third largest AI search engine |
| `ClaudeBot` | Anthropic Claude | Growing fast |
| `anthropic-ai` | Anthropic (alternate UA) | Some Anthropic crawl uses this |
| `CCBot` | Common Crawl (training data) | Used for model training |
| `Bytespider` | ByteDance/TikTok AI | Emerging |

**Scoring logic:**
- No `robots.txt` file → score 60 (neutral — crawlers get full access by default, but no explicit welcome)
- `robots.txt` exists, no AI bot rules → score 70 (crawlers implicitly allowed)
- `robots.txt` exists, all AI bots explicitly allowed → score 100
- `robots.txt` exists, some AI bots blocked → score proportional (100 - 15 × blocked_count, min 0)
- `Disallow: /` for `User-agent: *` and no AI-specific overrides → score 20 (severe — all bots blocked)

**Edge cases to handle:**
- `robots.txt` returns 404 → score 60 (permissive default)
- `robots.txt` returns 403/5xx → score 50 (unknown state)
- `User-agent: *` rules apply to all bots — factor this into bot-specific scoring
- Wildcard path rules (`Disallow: /private*`) — treat as partial block

### Dimension 2 — Schema Markup (JSON-LD)

**What to fetch:** Homepage HTML

**Parsing approach:** Cheerio to extract all `<script type="application/ld+json">` blocks.

```typescript
const $ = cheerio.load(html)
const schemas: object[] = []
$('script[type="application/ld+json"]').each((_, el) => {
  try {
    const parsed = JSON.parse($(el).html() ?? '')
    // Handle @graph arrays
    if (Array.isArray(parsed['@graph'])) schemas.push(...parsed['@graph'])
    else schemas.push(parsed)
  } catch { /* malformed JSON-LD — skip */ }
})
```

**Schema types to detect and score** (schema.org types):

| Type | Points | Why It Matters |
|------|--------|---------------|
| `LocalBusiness` (or subtype) | +35 | Core for SMB AI visibility |
| `FAQPage` | +25 | Direct Q&A extraction by AI engines |
| `Service` | +15 | Describes service offerings |
| `BreadcrumbList` | +10 | Site structure signal |
| `Organization` | +10 | Brand identity signal |
| `Product` | +5 | For product-based businesses |

**Completeness check for `LocalBusiness`:** award bonus points for presence of:
- `name` (+0, required)
- `address` → `streetAddress`, `addressLocality`, `addressCountry` (+5)
- `telephone` (+5)
- `url` (+5)
- `openingHours` or `openingHoursSpecification` (+5)
- `aggregateRating` (+10)
- `description` (+5)

**Score cap:** 100. No schema at all → 0.

### Dimension 3 — Content Quality

**What to fetch:** Homepage HTML (reuse from schema step)

**NLP-free heuristics using Cheerio:**

```typescript
// Strip nav, header, footer, sidebar before counting
$('nav, header, footer, aside, script, style, noscript').remove()
const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
const wordCount = bodyText.split(' ').filter(Boolean).length
```

**Signals to score:**

| Signal | Check | Points |
|--------|-------|--------|
| Word count | 300+ words on homepage | 0–30 (proportional, cap at 800 words) |
| H1 presence | `$('h1').length === 1` | +15 |
| H2 structure | `$('h2').length >= 2` | +15 |
| Heading hierarchy | H1 present, H2s present, no H3 without H2 | +10 |
| NAP consistency | Phone number pattern in body text | +10 |
| Address detection | Street address pattern in body text | +10 |
| Author / About signal | `/about|team|author|founder/i` in text | +5 |
| Date signals | ISO date or readable date pattern present | +5 |

**NAP detection patterns (regex):**
```typescript
const phonePattern = /(\+?\d[\d\s\-().]{7,}\d)/
const addressPattern = /\d{1,5}\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)/i
```

### Dimension 4 — FAQ Coverage

**What to fetch:** Homepage HTML (reuse from schema step)

**Two signals — either can score points:**

**Signal A — FAQPage schema** (already detected in schema step — share the data):
- FAQPage schema present with 3+ questions → 60 base points
- Each additional question beyond 3 → +5 (cap at 100)

**Signal B — HTML FAQ patterns** (if no schema):
```typescript
// Pattern 1: <details>/<summary> accordion
const detailsCount = $('details').length

// Pattern 2: Definition lists
const dlCount = $('dl dt').length

// Pattern 3: Question-like headings (H2/H3 ending in ?)
let questionHeadings = 0
$('h2, h3').each((_, el) => {
  if ($(el).text().trim().endsWith('?')) questionHeadings++
})
```

**Scoring:**
- FAQPage schema with 3+ questions → 80–100
- FAQPage schema with 1–2 questions → 40–60
- HTML FAQ pattern detected (5+ items) → 40–60
- HTML FAQ pattern detected (1–4 items) → 20–40
- No FAQ signals detected → 0–10

### Dimension 5 — llms.txt

**What to fetch:** `${baseUrl}/llms.txt`

**The llms.txt spec** (from llmstxt.org, published 2024-09-03 by Jeremy Howard / Answer.AI):

A valid `llms.txt` file at the root of a website provides:
- An H1 with the project/site name (**required**)
- An optional blockquote with a short summary
- Optional markdown sections with more detail
- Optional H2-delimited "file lists" of URLs with descriptions
- An optional "Optional" section for secondary links

```markdown
# My Business Name

> Short description of what this business does

More detailed information here.

## Services

- [Service Page](https://example.com/services): Description of services offered

## Optional

- [About Us](https://example.com/about): Background information
```

**Scoring:**
- File not found (404) → 0
- File exists but malformed / empty → 20
- File has H1 only → 30
- File has H1 + blockquote summary → 50
- File has H1 + summary + at least one H2 section with links → 75
- File is comprehensive (H1 + summary + 3+ sections + Optional section) → 100

**Also check `/llms-full.txt`** — the extended context version. If present, award +10 bonus (cap at 100).

### LLM Synthesis Step

After computing raw scores for all 5 dimensions, run a single Claude Haiku call to generate human-readable `description` strings for each dimension. This avoids hardcoded description templates and produces context-aware text.

```typescript
const synthesisPrompt = `
Business: ${businessName} (${websiteUrl})

AI Readiness Audit Results:
- Crawlability: ${crawlabilityScore}/100 — ${crawlabilityRawFindings}
- Schema Markup: ${schemaScore}/100 — ${schemaRawFindings}
- Content Quality: ${contentScore}/100 — ${contentRawFindings}
- FAQ Coverage: ${faqScore}/100 — ${faqRawFindings}
- llms.txt: ${llmsScore}/100 — ${llmsRawFindings}

For each dimension, write a 1-2 sentence description that:
1. States what was found (specific, not generic)
2. Gives the most important fix if score < 70

Return JSON: { crawlability, schema_markup, content_quality, faq_coverage, llms_txt }
Each value is a string (the description).
`
```

---

## 3. Competitive Benchmark (Researcher 3 — Competitive Intelligence)

### What Otterly.ai Audits

Otterly.ai (Gartner "Cool Vendor 2025", 20,000+ users) focuses primarily on **brand monitoring** (query-level tracking of AI engine responses) but has added a **GEO Audit tool** that checks "25+ on-page factors." Key signals they advertise:
- Brand mention tracking across ChatGPT, Gemini, Perplexity, Google AI Overviews, Copilot
- Website citation tracking (which URLs get cited)
- Share of Voice vs competitors
- Content optimization recommendations

Their audit appears weighted toward content and citation signals rather than technical signals (schema, robots.txt).

### Emerging GEO Best Practices (2024-2025 Consensus)

From industry research, the AI readiness signals with the strongest documented impact on AI engine citation:

1. **Structured data / Schema markup** — FAQPage and LocalBusiness schemas are directly parsed by Google AI Overviews and increasingly by other engines
2. **robots.txt AI-bot rules** — GPTBot blocking has been widely documented to reduce ChatGPT citation rates
3. **llms.txt** — Adopted by Cloudflare, Anthropic docs, thousands of software projects as of late 2024. Growing adoption.
4. **Content density and authority signals** — Word count, heading hierarchy, NAP consistency
5. **FAQ content** — Q&A format content is disproportionately cited by LLMs due to its extractability

### Alternative Standards (Beyond llms.txt)

| Standard | Status | Notes |
|----------|--------|-------|
| `llms.txt` | Active — llmstxt.org | Jeremy Howard / Answer.AI. Widely adopted |
| `llms-full.txt` | Active — companion to llms.txt | Full context version with expanded links |
| `ai.txt` | Proposed but no adoption | Different spec, not gaining traction |
| `model-spec.txt` | Not an emerging standard | No evidence of adoption |
| `.well-known/ai-plugin.json` | OpenAI plugin spec | For ChatGPT plugins, unrelated to GEO |

**Conclusion:** `llms.txt` is the only emerging standard worth implementing. `ai.txt` and `model-spec.txt` have no meaningful adoption.

### Competitive Differentiation for Beamix

Most GEO tools (Otterly, Rankscale) focus on **monitoring** (query-level tracking). None of the mainstream tools appear to do technical website auditing as a first-class feature. Beamix's AI Readiness audit is differentiated because:

- It audits the business's own site configuration, not just AI responses
- It gives concrete, actionable technical fixes (add schema, fix robots.txt, create llms.txt)
- It scores dimensions separately so users know exactly where to improve

---

## 4. Scoring Rubric (Researcher 4 — Model Design)

### Dimension Weights

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| Schema Markup | 30% | Most direct signal for structured AI extraction. FAQPage + LocalBusiness are parsed directly by Google AI Overviews. |
| Content Quality | 25% | Foundational — thin or structureless content can't be cited regardless of other signals |
| Crawlability | 20% | A blocked crawler means zero visibility regardless of content quality |
| FAQ Coverage | 15% | Q&A is the most extractable format for AI engines; high leverage for SMBs |
| llms.txt | 10% | Emerging standard — high upside but currently lower adoption/impact than schema |

**Composite formula:**
```
overallScore = round(
  schema_score    × 0.30 +
  content_score   × 0.25 +
  crawlability    × 0.20 +
  faq_score       × 0.15 +
  llms_score      × 0.10
)
```

### Score Benchmarks Per Dimension

#### Crawlability

| Score | Meaning | Example State |
|-------|---------|---------------|
| 0–20 | Critical | `robots.txt` blocks `User-agent: *` with no AI exceptions |
| 21–50 | Poor | 3+ key AI bots blocked (GPTBot, Google-Extended, PerplexityBot) |
| 51–70 | Fair | 1–2 AI bots blocked; most crawlers can access |
| 71–85 | Good | All major AI bots allowed; no explicit welcome |
| 86–100 | Excellent | All AI bots explicitly allowed or welcomed in `robots.txt` |

**Quick win for low score:** Add explicit `Allow: /` rules for GPTBot, Google-Extended, PerplexityBot, ClaudeBot to `robots.txt`

#### Schema Markup

| Score | Meaning | Example State |
|-------|---------|---------------|
| 0 | None | No `<script type="application/ld+json">` found |
| 1–30 | Minimal | Only basic `WebSite` or `WebPage` schema present |
| 31–60 | Partial | `Organization` or `LocalBusiness` present but incomplete fields |
| 61–85 | Good | `LocalBusiness` with address + phone + `Service` schema |
| 86–100 | Excellent | `LocalBusiness` (complete) + `FAQPage` + `Service` + `aggregateRating` |

**Quick win for score < 50:** Add a `LocalBusiness` schema with name, address, telephone, url, openingHours

#### Content Quality

| Score | Meaning | Example State |
|-------|---------|---------------|
| 0–20 | Critical | Under 100 words, no H1, no structure |
| 21–40 | Poor | 100–300 words, H1 present but no H2 sections |
| 41–65 | Fair | 300–500 words, some heading structure, no NAP |
| 66–85 | Good | 500–800 words, clear H1/H2 structure, NAP detectable |
| 86–100 | Excellent | 800+ words, complete heading hierarchy, NAP + author signals |

**Quick win for score < 50:** Add descriptive H2 sections, ensure phone and address are in plain text on page

#### FAQ Coverage

| Score | Meaning | Example State |
|-------|---------|---------------|
| 0–10 | None | No FAQ content found anywhere |
| 11–40 | Weak | 1–2 Q&A items or question-like headings only |
| 41–65 | Fair | HTML FAQ pattern with 3–5 items, no schema |
| 66–80 | Good | FAQPage schema with 3–5 questions |
| 81–100 | Excellent | FAQPage schema with 6+ detailed questions |

**Quick win for score < 40:** Use the Beamix FAQ Agent to generate FAQ content (faq_agent → suggested_agent link)

#### llms.txt

| Score | Meaning | Example State |
|-------|---------|---------------|
| 0 | Missing | `/llms.txt` returns 404 |
| 20 | Exists but empty | File found but no valid content |
| 30–45 | Minimal | H1 only |
| 46–70 | Basic | H1 + blockquote summary |
| 71–85 | Good | H1 + summary + at least one H2 section with links |
| 86–100 | Complete | H1 + summary + 3+ sections + Optional section |

**Quick win for score = 0:** Create a minimal `/llms.txt` with at minimum: H1 (business name) + blockquote (one-sentence description of what the business does)

### Recommendation Templates Per Dimension (for `recommended_agent` mapping)

| Dimension | Failing Score | Suggested Agent | Recommendation Type |
|-----------|--------------|-----------------|---------------------|
| Schema Markup < 50 | → `schema_optimizer` | `technical` |
| FAQ Coverage < 40 | → `faq_agent` | `content` |
| Content Quality < 50 | → `content_writer` | `content` |
| Crawlability < 50 | → `null` (manual fix) | `technical` |
| llms.txt = 0 | → `content_writer` | `technical` |

---

## 5. Build Brief (Ready-to-Implement Spec for Backend Developer)

### What to Build

Replace the stub POST handler in `/api/ai-readiness/route.ts` with a real website audit pipeline. The GET handler, the dashboard page, and the view component require no changes.

### File to Modify

`saas-platform/src/app/api/ai-readiness/route.ts` — POST handler only.

Optionally extract audit logic to: `saas-platform/src/lib/audit/` (new directory)

### Implementation Steps

**Step 1 — URL normalization**
```typescript
// From: business.website_url (stored as full URL)
// Need: base URL for fetching robots.txt and llms.txt
const baseUrl = new URL(business.website_url).origin // e.g. "https://example.com"
```

**Step 2 — Parallel HTTP fetches** (with 10s timeout each)
```typescript
const [robotsRes, homepageRes, llmsRes] = await Promise.allSettled([
  fetchWithTimeout(`${baseUrl}/robots.txt`, 10_000),
  fetchWithTimeout(baseUrl, 10_000),
  fetchWithTimeout(`${baseUrl}/llms.txt`, 10_000),
])
```

**Step 3 — Parse each dimension** (pure functions, no side effects)
```typescript
const crawlabilityResult = parseRobotsTxt(robotsText)      // → { score, findings }
const schemaResult = parseSchemaMarkup(html)               // → { score, findings }
const contentResult = parseContentQuality(html)            // → { score, findings }
const faqResult = parseFaqCoverage(html, schemaResult)     // → { score, findings }
const llmsResult = parseLlmsTxt(llmsText)                  // → { score, findings }
```

**Step 4 — Compute composite score**
```typescript
const compositeScore = Math.round(
  schemaResult.score    * 0.30 +
  contentResult.score   * 0.25 +
  crawlabilityResult.score * 0.20 +
  faqResult.score       * 0.15 +
  llmsResult.score      * 0.10
)
```

**Step 5 — LLM synthesis** (Claude Haiku — generate human descriptions)
```typescript
const descriptions = await synthesizeDescriptions(anthropic, {
  businessName, websiteUrl,
  dimensions: { crawlabilityResult, schemaResult, contentResult, faqResult, llmsResult }
})
```

**Step 6 — Upsert to DB** (respect the UNIQUE constraint)
```typescript
await supabase
  .from('ai_readiness_history')
  .upsert({
    business_id: business.id,
    score: compositeScore,
    score_breakdown: {
      crawlability:    { score: crawlabilityResult.score, description: descriptions.crawlability },
      schema_markup:   { score: schemaResult.score,       description: descriptions.schema_markup },
      content_quality: { score: contentResult.score,      description: descriptions.content_quality },
      faq_coverage:    { score: faqResult.score,          description: descriptions.faq_coverage },
      llms_txt:        { score: llmsResult.score,         description: descriptions.llms_txt },
    },
    recorded_at: new Date().toISOString(),
  }, {
    onConflict: 'business_id, (recorded_at::date)',  // unique constraint
    ignoreDuplicates: false,  // update if same-day audit already exists
  })
```

**Step 7 — Return result** (return the full score_breakdown to avoid extra DB fetch)

### Error Handling Requirements

- Website unreachable / timeout → set all HTTP-dependent dimensions to score 0 with description "Could not reach website"
- `robots.txt` 404 → crawlability score 60 (permissive default)
- `/llms.txt` 404 → llms_txt score 0
- Invalid URL stored in `business.website_url` → return 400 before any fetch
- LLM synthesis failure → fall back to template descriptions (do not fail the whole audit)
- DB upsert failure → return 500

### Packages to Use

| Package | Already Installed | Use For |
|---------|------------------|---------|
| `cheerio` | Yes (`^1.2.0`) | HTML parsing for schema, content, FAQ |
| `@anthropic-ai/sdk` | Yes | Claude Haiku synthesis step |
| Native `fetch` | Yes (Node 18+) | HTTP fetches for robots.txt, homepage, llms.txt |

**No new dependencies required.**

### Performance Budget

- Total audit time target: < 20 seconds (3 parallel fetches + parsing + 1 LLM call)
- Use `Promise.allSettled` for the 3 fetches — never block on a slow site
- Cheerio parsing: < 500ms for typical homepage
- Claude Haiku synthesis: < 5s typical

### Security Considerations

- Validate `business.website_url` is a valid URL before fetching
- Do not follow redirects to non-HTTP(S) schemes
- Cap response body size at 2MB — use `response.text()` with size check
- The audit runs server-side only — no SSRF vector from user input since URL comes from authenticated business record, not the request body

### Testing Approach

Write unit tests for each parser function:
- `parseRobotsTxt` — test cases: empty, GPTBot blocked, all blocked, explicit allow
- `parseSchemaMarkup` — test cases: no schema, LocalBusiness only, full schema
- `parseFaqCoverage` — test cases: FAQPage schema, HTML details pattern, question headings
- `parseContentQuality` — test cases: thin page, structured page, NAP present
- `parseLlmsTxt` — test cases: 404, H1 only, full spec

---

*Research complete. All 4 dimensions researched. Brief ready for implementation.*
