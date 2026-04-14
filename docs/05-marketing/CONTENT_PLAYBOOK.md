# Beamix Content Playbook
*The operating doc for Beamix blog + FAQ on Framer. Synthesis of 5 research threads.*
*v1.0 · 2026-04-14 · Owner: Research Lead → Growth Lead to operationalize*

---

## What this doc is

This is the single source of truth for how Beamix produces content that:
1. Ranks on Google (traditional SEO)
2. Gets cited by LLMs (GEO — ChatGPT, Gemini, Claude, Perplexity)
3. Sounds human, not AI-generated
4. Reinforces Beamix's authority — our product sells GEO, so our content must exemplify it

This doc is opinionated. If you want the research behind each claim, follow the citations to the five research files in `docs/05-marketing/research/`.

**Voice baseline (from BRAND_GUIDELINES.md + MESSAGING.md):** Authoritative. Direct. Warm. Israeli + global SMB audience. No fluff, no hype. חד לעניין.

---

## The 10 Rules (print these, tape to the wall)

1. **One statistic in the first 100 words.** Sourced, linked. The Princeton GEO paper measured +41% citation lift from Statistics Addition. Do it. [GEO_MECHANICS.md §3]
2. **One direct quotation from a named source per article.** +28% citation lift. Not "experts say" — a real name.
3. **Inline citation links for every factual claim.** Not a "Sources" section at the bottom. Inline. With the URL and the year.
4. **FAQPage schema on every article that has a Q&A block.** 3.2× more likely to appear in Google AI Overviews. [GEO_MECHANICS.md §2]
5. **Real human author with Person schema.** 74% of sites hit by Google's Helpful Content Update lacked author bylines. Don't be them. [EEAT_2026.md §1]
6. **Last-updated date visible at top of every article** — not just published date.
7. **Ban the AI tell-words.** No "delve," "tapestry," "realm," "leverage," "utilize," "moreover," "in conclusion," "it's important to note." [HUMAN_SOUNDING_CONTENT.md §2]
8. **One contrarian sentence per article.** "Most advice says X. That's wrong because Y."
9. **Specific numbers beat round numbers.** 37% not "about a third." 8 minutes 14 seconds not "about 8 minutes."
10. **First-hand experience signal in every article.** "I tested…" "We scanned 50…" "When [Real Business] ran the agent…"

---

## The content engine (how we produce)

### Roles
- **Growth Lead** — owns the editorial calendar, assigns articles, final approver
- **Writer (human + AI-assisted)** — produces drafts
- **Editor (human)** — humanization pass + E-E-A-T injection + schema check
- **Author of record (real human)** — named on the byline, has Person schema

### Per-article workflow (target: 1 article/week initially, ramping to 2/week after month 3)

**Step 1 — Brief (Growth Lead, 30 min)**
- Title, target keyword, pillar, GEO angle, target word count, primary author
- Pull the article from `COMPETITIVE_CONTENT_GAPS.md §7` (first 25 ideas prioritized)
- One sentence: why this article exists — the decision it informs for a Beamix customer

**Step 2 — Outline (Writer, 30 min)**
- H2/H3 structure
- For each section, what statistic, quote, example, link goes in
- Target: 3+ specifics per 1,000 words (names, dates, numbers, places)

**Step 3 — AI draft (Writer, 15 min)**
- Use the voice-priming prefix from `HUMAN_SOUNDING_CONTENT.md §6`
- Feed the outline + voice prefix into Claude/GPT
- First draft = raw material, not the ship product

**Step 4 — Banned-word sweep (Writer, 5 min)**
- Find/replace using `HUMAN_SOUNDING_CONTENT.md §2` list
- Single pass catches ~60% of AI tells

**Step 5 — Humanization edit (Editor, 30-45 min per 1,000 words)**
- Sentence-length variance (mix 4-word fragments with 30-word builds)
- 3+ specifics per 1,000 words
- One contrarian paragraph
- Strip hedges and corporate qualifiers
- Read aloud check
- [Full workflow: `HUMAN_SOUNDING_CONTENT.md §5`]

**Step 6 — E-E-A-T injection (Editor, 15 min)**
- Real author byline + Person schema link
- Last-updated date set
- First-hand experience element added
- 2+ outbound links to authoritative sources
- 1+ original observation or data point
- Internal links to ≥3 related Beamix articles

**Step 7 — Schema check (Editor, 10 min)**
- Article/BlogPosting schema rendered (verify in Rich Results Test)
- FAQPage schema if Q&A block exists
- BreadcrumbList schema
- Person schema on author link

**Step 8 — Detector sanity check (Editor, 5 min)**
- Run through Originality.ai (or equivalent)
- Target: <30% AI score
- If higher: identify worst paragraphs, rewrite. Don't ship an obviously-AI article even though Google doesn't use detectors — readers do, and so do journalists quoting us.

**Step 9 — Publish (Growth Lead, 15 min)**
- Framer Blog Collection entry with all fields (see `FRAMER_SEO.md §2`)
- Cover image (1200×630, <300KB)
- OG image set
- FAQ Items populated if applicable
- Featured image alt text
- Submit URL to Search Console + Bing Webmaster (Bing powers ChatGPT)

**Step 10 — Distribute (Growth Lead, ongoing)**
- LinkedIn post from author's account (not Beamix brand)
- Share in relevant Reddit threads (real, helpful, not spam)
- X thread if fits
- Newsletter feature if scheduled

---

## The 3 content pillars (in priority order)

### Pillar 1 — Vertical Visibility Guides (highest priority — owns empty space)

Zero major competitors publish vertical-specific guides. Beamix's product targets specific verticals (restaurants, law firms, real estate, insurance, moving, dental, trades, accountants). Each vertical gets a pillar article + supporting pieces.

**Target articles (from `COMPETITIVE_CONTENT_GAPS.md §7`):**
- #1 How law firms get cited by ChatGPT (2026 playbook)
- #3 Why restaurants disappear on AI search
- #4 Insurance agents on Perplexity
- #7 Moving companies and ChatGPT: 90-day plan
- #12 Dentists on Google AI Overviews
- #15 Real estate brokers + AI search
- #17 Plumbers, electricians, contractors
- #21 Accountants on AI search

**Format:** Pillar piece (~2,500 words) + 2-3 supporting tactical articles per vertical.

**GEO pattern:** Statistic in opener (vertical-specific AI search behavior) → problem narrative → 5-7 specific fixes → FAQPage schema block at the end → internal link to Beamix free scan.

### Pillar 2 — The Beamix Visibility Index (citation flywheel)

Original research. The reason Profound gets cited across the niche is because they publish original citation data. Beamix must publish our own.

**Target articles:**
- #2 We scanned 1,000 Israeli SMBs — here's what we found
- #13 Beamix Visibility Index Q2 2026 (quarterly recurring)
- #19 Hebrew vs English: does AI search treat them differently?
- #23 I scanned 50 SMB blog posts. The cited ones had 3 things in common.

**Format:** Data report, 1,800-3,000 words. Charts. Methodology section. CSV download.

**GEO pattern:** Unique-data-as-quotable-asset. Other sites will cite our numbers → we become the primary source → LLMs train on us.

### Pillar 3 — Vertical SEO 101 for owners + How We Do It (trust + product proof)

Plain-English explainers written to SMB owner-operators, plus transparent "inside Beamix" content showing how our agents actually work.

**Target articles:**
- #5 AI Invisibility Cost Calculator (interactive tool + article)
- #6 Inside Beamix: FAQ Agent case study
- #8 GBP + ChatGPT combined checklist
- #11 What "AI search visibility" means for a 10-person business
- #14 We tried 5 GEO tactics. Two hurt visibility.
- #22 60-day GEO checklist for any local SMB

### Secondary — Hebrew content (category default-win)

Zero competitor coverage. Publishing even 3-5 strong Hebrew articles makes Beamix the de-facto category owner in Israel.

---

## Per-article structural template

Every Beamix article follows this skeleton. Deviating requires Growth Lead approval.

```markdown
# [Title — specific, not clever. Include target keyword.]

*By [Author Name], [credential] · Last updated [YYYY-MM-DD]*
[Reading time: N min]

[First sentence: a specific claim or a contrarian statement. NEVER "In today's fast-paced world…"]

[Opening paragraph: 60-120 words. MUST include one sourced statistic and one specific detail (date, name, or number).]

## What you'll find in this article
- Bullet 1
- Bullet 2
- Bullet 3

## [H2 — Definition / Context]
[Clear 2-3 sentence definition near top. This is the "passage Perplexity lifts.". Make it citable.]

## [H2 — The main argument / finding]

[Body: vary sentence length. Include quotations. Include citations. Include internal links.]

## [H2 — Specific tactics / steps]
1. [Specific tactic with example]
2. [Specific tactic with example]
3. [Specific tactic with example]

## [H2 — What we learned / observed at Beamix]
[First-hand experience section. "We scanned…" "When we ran…" with real data or screenshots.]

## Frequently asked questions

**Q: [Common question]**
A: [Concrete answer, 2-4 sentences. Will be extracted as FAQPage schema.]

**Q: [Common question]**
A: [Concrete answer.]

**Q: [Common question]**
A: [Concrete answer.]

## Next steps
[Clear CTA — free scan, related article, specific action. Not a generic "contact us."]

---

*About the author: [1-2 sentences with credential + link to /authors/[slug]]*
```

---

## Schema & technical setup (one-time, before first article)

Full details in `FRAMER_SEO.md §8`. Summary:

**Must-do before first article ships:**
- [ ] Framer Pro plan active
- [ ] Cloudflare reverse proxy live (for custom robots.txt + llms.txt)
- [ ] Custom robots.txt deployed (see `FRAMER_SEO.md §6`) — allow all search + training bots
- [ ] llms.txt deployed at site root
- [ ] Organization schema site-wide (see `FRAMER_SEO.md §3.1`)
- [ ] Blog Collection + Authors Collection built in Framer CMS
- [ ] BlogPosting + BreadcrumbList schema on Blog Collection template
- [ ] Person schema on Author Collection template
- [ ] FAQPage schema on static FAQ page
- [ ] Google Search Console + Bing Webmaster Tools verified (Bing powers ChatGPT)
- [ ] Rich Results Test passed for every schema template
- [ ] Author archive page live for at least 1 real author (Adam K.)

---

## Banned-word enforcement

Integrate the banned-word list from `HUMAN_SOUNDING_CONTENT.md §2` into:
- The writer's Grammarly style guide (custom dictionary)
- The editor's final-check script (optional: a simple `grep` pattern)
- The CI-style pre-publish check (manual for now, automate later)

**Hard-ban list (short version — full in HUMAN_SOUNDING_CONTENT.md §2):**

> delve, tapestry, realm, landscape, journey, beacon, cornerstone, testament, leverage (verb), utilize, facilitate, foster, harness, elevate, streamline, navigate the, unlock potential, moreover, furthermore, additionally, consequently, in conclusion, it's important to note, in today's fast-paced, in the digital age, robust, seamless, empower, game-changer, cutting-edge

If it's in the draft, it doesn't ship. No exceptions.

---

## Measuring success

### Month 1 KPIs (baseline)
- 4 articles published (1/week)
- 100% of articles have FAQPage schema where applicable
- 100% of articles have real author + Person schema
- 100% of articles pass Rich Results Test
- 0 articles contain banned words at publish time

### Month 3 KPIs
- 12-16 articles live
- First Beamix article cited by ChatGPT Search or Perplexity (measure via Profound, Otterly, or manual prompt testing)
- 2+ original data reports (Pillar 2) shipped
- First vertical pillar (Pillar 1) ranking for its target keyword

### Month 6 KPIs
- 30+ articles live
- Beamix cited in AI search answers for 10+ target SMB queries
- Beamix blog drives ≥20% of new free scans (measured via UTM)
- At least 2 Beamix data points cited by other industry blogs (Profound, HubSpot, etc. — the citation flywheel proof)

### Measurement tooling
- Google Search Console — organic performance
- Bing Webmaster Tools — ChatGPT proxy
- Profound or Otterly — AI citation tracking
- Manual prompt testing (monthly) — hit ChatGPT/Perplexity/Gemini with our target prompts and log which Beamix articles show up

---

## What NOT to do (direct rules)

- ❌ Don't publish without a real human author with Person schema
- ❌ Don't publish anything containing a banned word (do the find/replace pass)
- ❌ Don't write generic "What is GEO?" or "GEO vs SEO" articles — saturated, no value
- ❌ Don't publish before the schema validates in Rich Results Test
- ❌ Don't skip the first-hand experience injection — E-E-A-T's "Experience" is the second 'E' for a reason
- ❌ Don't round numbers when you have the real ones
- ❌ Don't publish placeholder testimonials (MESSAGING.md already flags this)
- ❌ Don't let AI drafts ship without human edit ≥30 min / 1,000 words
- ❌ Don't launch the blog without Cloudflare proxy + custom robots.txt
- ❌ Don't ignore Bing Webmaster Tools — ChatGPT Search uses Bing's index

---

## Authority-building side moves (run in parallel to publishing)

These matter for AI citation rate even if they're not "content":

1. **Wikipedia presence** — if Beamix or founder achieves notability, aim for a Wikipedia entry (ChatGPT's #1 source is Wikipedia)
2. **Reddit presence** — real, helpful participation in r/smallbusiness, r/SEO, r/Entrepreneur, vertical subreddits. Link to Beamix articles only when genuinely helpful. Reddit is a top source for Perplexity + AI Overviews.
3. **YouTube companion content** — short tutorials matching top articles. YouTube is Google AI Overviews' second-most-cited source.
4. **Podcast appearances** — founder interviews on SMB/marketing podcasts. Builds entity authority + natural backlinks + quotable passages.
5. **Guest posts on established publications** — Search Engine Journal, Search Engine Land, HubSpot guest column. Cite our own research in those guest posts.
6. **Get cited by Profound/Semrush/Ahrefs** — our quarterly data reports should be specifically designed to be quotable. Reach out directly when we publish.

---

## How this doc gets maintained

- **Owner going forward:** Growth Lead
- **Update cadence:** Quarterly review + major updates when Google/LLM citation patterns shift
- **Source of truth for tactics:** The 5 research files in `docs/05-marketing/research/`
- **Source of truth for voice:** `docs/BRAND_GUIDELINES.md` + `docs/05-marketing/MESSAGING.md`

When evidence contradicts this playbook (new Google update, new paper, new measurement): update the relevant research file first with sources, then update this doc.

---

## References (full research files)

- [`research/GEO_MECHANICS.md`](./research/GEO_MECHANICS.md) — how LLMs pick citations, Princeton GEO paper, crawler reference
- [`research/EEAT_2026.md`](./research/EEAT_2026.md) — current Google guidelines, HCU recovery patterns, author/trust signals
- [`research/HUMAN_SOUNDING_CONTENT.md`](./research/HUMAN_SOUNDING_CONTENT.md) — banned words, humanization workflow, detector reality
- [`research/COMPETITIVE_CONTENT_GAPS.md`](./research/COMPETITIVE_CONTENT_GAPS.md) — competitor content audit, 25-article backlog
- [`research/FRAMER_SEO.md`](./research/FRAMER_SEO.md) — Framer SEO setup, schema recipes, pre-launch checklist
