# 01 — Research Summary (Condensed)

> The full research lives in `docs/05-marketing/research/` (5 files, ~80 KB, every claim sourced with URL + access date 2026-04-14). This file is the executive summary. Read this before writing. Open the linked source files when you need depth.

---

## The 10 Findings That Matter Most

### 1. Princeton GEO paper is the anchor (Aggarwal et al., KDD 2024, arXiv 2311.09735)
Four techniques measurably lift LLM citation rate:
- **Statistics Addition → +41%**
- **Quotation Addition → +28%**
- **Stats + Fluency combined → ~+40%**
- **Citation linking** (inline links to sources) → measurable lift

**Rule:** Every Beamix article opens with ≥1 sourced statistic in the first 100 words + includes ≥1 named expert quote.

Source: `research/GEO_MECHANICS.md` §2–3

### 2. Every AI engine cites differently
| Engine | Top citation source | Our play |
|--------|---------------------|----------|
| ChatGPT | Wikipedia (~48% of top-10 share) | Get Beamix on Wikipedia (notability bar) + cited by Wikipedia-referenced sources |
| Perplexity | Reddit + authoritative specialists | Publish on Reddit AMAs, SEO subreddits; be the specialist |
| Gemini / AI Overviews | 52% brand-owned + Reddit + YouTube | Own our own site authority + YouTube repurposing |
| Claude | Long-form authoritative content | Pillar pages, original research reports |

Source: `research/GEO_MECHANICS.md` §4

### 3. FAQPage schema is the cheapest GEO win
Articles with FAQPage JSON-LD are **3.2× more likely to appear in Google AI Overviews**. Every article ships with one.

Source: `research/GEO_MECHANICS.md` §5, `research/FRAMER_SEO.md` §3

### 4. E-E-A-T now applies to ALL competitive queries, not just YMYL
December 2025 Google core update extended E-E-A-T scrutiny beyond Your-Money-Your-Life categories. Author bylines + Person schema are **non-negotiable** — 74% of Helpful Content Update losers (Lily Ray analysis, n=500) lacked them.

Source: `research/EEAT_2026.md` §2

### 5. "Delve" is a flag. So are these.
AI writing detectors flag specific vocabulary and phrase patterns 10× more often in machine-written prose. Hard-banned:
- **delve, tapestry, realm, navigate the landscape**
- "In today's fast-paced/rapidly evolving digital world"
- "It is important to note that..."
- "In conclusion"
- "Furthermore / Moreover / Additionally" as triadic openers
- Unnecessary "Certainly!" or "Absolutely!" acknowledgments

Full list → `research/HUMAN_SOUNDING_CONTENT.md` §2. Find/replace on every draft.

### 6. Google does NOT use AI detectors as a ranking signal
(John Mueller, Danny Sullivan — restated through 2025.) We humanize for **reader trust** and **brand authority**, not to beat detectors. Good writing reads human *and* ranks.

Source: `research/HUMAN_SOUNDING_CONTENT.md` §1

### 7. Vertical SMB content is Beamix's blue ocean
We audited 8 major GEO competitors (Profound, Otterly, AthenaHQ, Writesonic GEO, Surfer, HubSpot AI coverage, SE Ranking, Semrush). **Zero** of them publish vertical-specific guides for law firms, restaurants, movers, insurance, dental, real estate, or trades. This is our Pillar 1 territory.

Source: `research/COMPETITIVE_CONTENT_GAPS.md` §3 (coverage matrix)

### 8. Hebrew GEO content = zero competition
No GEO tool or blog publishes in Hebrew. 3–5 strong Hebrew articles = instant category authority for the Israeli market.

Source: `research/COMPETITIVE_CONTENT_GAPS.md` §4

### 9. Framer has one critical SEO blocker
`robots.txt` and `sitemap.xml` are not directly editable in Framer. **Required workaround: Cloudflare reverse proxy** in front of the Framer domain, serving custom `robots.txt` + `llms.txt` at the edge. Without this we can't allow-list AI crawlers properly.

Everything else is doable: JSON-LD via Custom Code blocks with `{{Field | json}}` CMS syntax. Recipes in `research/FRAMER_SEO.md` §3.

### 10. llms.txt is insurance, not strategy
Adoption is ~10%. No major LLM has confirmed they read it (Google's Gary Illyes said July 2025 they don't and won't). Deploy it cheaply; don't build strategy around it.

Source: `research/GEO_MECHANICS.md` §7

---

## The Content Formula (derived from research)

Every Beamix article follows this structure:

```
1. HEADLINE
   • Question-based where possible ("Why Do Law Firms Disappear on ChatGPT?")
   • Includes primary keyword
   • 8-12 words

2. TL;DR BLOCK (50-80 words, visually distinct)
   • Answers the headline in 3 bullets
   • Optimized for LLM extraction — each bullet is a self-contained claim

3. OPENING (first 100 words)
   • ≥1 sourced statistic (Princeton +41%)
   • Specific hook (named business, named number, named date)
   • No throat-clearing

4. BODY (1500-2500w for clusters, 3000-4000w for pillar)
   • H2 questions (People Also Ask + LLM query match)
   • H3 sub-sections
   • ≥1 comparison table OR original chart every ~700w
   • ≥1 named expert quote (Princeton +28%)
   • Inline citation links [1][2] style
   • Short paragraphs (2-3 sentences)
   • Burstiness check: vary sentence length 5-30 words

5. FAQ SECTION (5-7 Q&A)
   • Each answer 40-80 words, self-contained, definition-first
   • Renders as FAQPage JSON-LD (3.2× AI Overview lift)

6. AUTHOR BOX
   • Byline with credential line
   • Person schema ready
   • "Last updated" visible timestamp

7. INTERNAL LINKS
   • 3-5 to other articles / FAQ hub
   • 1-2 to product pages (/pricing, /scan)

8. META + SCHEMA
   • Title: <60 chars
   • Description: 150-160 chars
   • Article + Person + FAQPage JSON-LD
```

Full spec → `CONTENT_PLAYBOOK.md`.

---

## Humanization Rules (quick reference)

From `research/HUMAN_SOUNDING_CONTENT.md`:

**Do:**
- Vary sentence length dramatically (5 words → 30 words → 8 words)
- Use specific named examples ("A moving company in Herzliya...")
- Insert dated anecdotes ("Last March, we scanned 400 law firms and found...")
- Take a position, even a contrarian one
- Use contractions (it's, don't, we've) like a human would
- Write the way you'd explain it to a smart friend

**Don't:**
- Start paragraphs with "Furthermore," "Moreover," "Additionally"
- Use triadic lists reflexively ("powerful, intuitive, and intelligent")
- Hedge unnecessarily ("can potentially help you possibly...")
- End with "In conclusion" or "To summarize"
- Use "utilize" when "use" fits
- Use "leverage" as a verb

---

## Competitive Gaps We're Claiming

From `research/COMPETITIVE_CONTENT_GAPS.md`:

1. **Vertical SMB GEO guides** — 0 competitors cover restaurants, law firms, movers, insurance, dental, real estate
2. **"Done-for-you" framing** — all competitors sell dashboards; none sell outcomes
3. **Hebrew-language GEO content** — uncontested
4. **Original citation data** — Profound owns this flywheel; we can share it with quarterly SMB reports
5. **Tactical playbooks (step-by-step checklists)** — highest LLM-extractable format; under-covered
6. **SMB-priced framing** — most competitor content targets enterprise ($2k+/mo); we own the $79–$499 price band narrative

---

## Quick Source Index

| Need depth on... | Read... |
|-------------------|---------|
| How LLMs pick citations | `research/GEO_MECHANICS.md` |
| Author bylines, trust signals, Person schema | `research/EEAT_2026.md` |
| What makes writing sound human vs AI | `research/HUMAN_SOUNDING_CONTENT.md` |
| What competitors publish + gaps | `research/COMPETITIVE_CONTENT_GAPS.md` |
| How to implement schema in Framer | `research/FRAMER_SEO.md` |
| The operating rulebook | `CONTENT_PLAYBOOK.md` |

---

*Next: read `02-EXECUTION-PLAN.md` to see how Phase B is scheduled.*
