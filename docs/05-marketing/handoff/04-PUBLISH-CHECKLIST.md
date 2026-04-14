# 04 — Pre-Publish Checklist

> The gate every article must clear before the user pastes it into Framer. qa-lead runs this. BLOCK verdict if any P1 fails or any 3 P2s fail.

---

## P1 — Hard Blockers (any single fail = BLOCK)

### Content Integrity
- [ ] H1 present, unique, contains primary keyword
- [ ] Opening paragraph has a sourced statistic in the first 100 words
- [ ] At least one named expert quote with role + source link in the body
- [ ] FAQ section present with 5-7 Q&A pairs (40-80 words each)
- [ ] Author byline with credential line present
- [ ] "Last updated: YYYY-MM-DD" timestamp visible on page
- [ ] Conclusion does NOT use "In conclusion" / "To summarize"

### Sourcing Integrity (zero tolerance)
- [ ] Every statistic in body has URL + access date in sources.md
- [ ] Every quote is real and attributed (name + role + link)
- [ ] No source dated before 2023 (foundational papers exempt)
- [ ] No source is an AI summary / AI blog
- [ ] No fabricated testimonials, case studies, or customer names

### Banned-Word Purge
- [ ] Zero instances of: delve, tapestry, realm, navigate the landscape
- [ ] Zero "In today's [X] world/landscape/era"
- [ ] Zero "It is important to note that"
- [ ] Zero triadic adjective lists (powerful, intuitive, intelligent)

### Schema (JSON-LD)
- [ ] Article schema present (datePublished, dateModified, author)
- [ ] Person schema present (name, jobTitle, sameAs with LinkedIn)
- [ ] FAQPage schema present and matches article FAQ section
- [ ] All three validate on https://validator.schema.org/

### Brand Accuracy
- [ ] Pricing claims match locked values: Starter $49, Pro $149, Business $349
- [ ] AI engine counts match: Free/Starter 3, Pro 7, Business 9+
- [ ] Trial length = 7 days with 5 agent credits
- [ ] No "dashboard" framing ("not a dashboard" is the line)

---

## P2 — Strong Guidance (3+ fails = BLOCK)

### SEO Technical
- [ ] Primary keyword density 0.5-1.5%
- [ ] 3-5 semantic variations used naturally
- [ ] Title tag <60 chars
- [ ] Meta description 150-160 chars
- [ ] 3-5 internal links placed naturally
- [ ] URL slug readable, keyword-present, ≤60 chars
- [ ] External citation links inline [1][2] style

### Voice / Humanization
- [ ] Sentence length variance — not monotone (read aloud test)
- [ ] Contractions used in conversational sentences
- [ ] ≥3 specific named examples (cities, businesses, numbers, dates)
- [ ] Active voice dominates passive
- [ ] Adverb density low ("really", "very", "quite" — used sparingly)

### Structure
- [ ] TL;DR block present, 50-80 words, 3 bullets
- [ ] Question-based H2s preferred (match People Also Ask)
- [ ] Comparison table OR structured list every ~700 words
- [ ] Paragraphs 2-3 sentences
- [ ] Subheadings every 200-400 words

### Readability
- [ ] Reading grade 8-10 (state tool used)
- [ ] FAQ answers each 40-80 words
- [ ] FAQ answers definition-first and self-contained
- [ ] Scannable format: bullets, tables, callouts

### GEO Specifics
- [ ] At least one original angle or data point (not just aggregation)
- [ ] Comparison table or numbered list (LLM-extractable format)
- [ ] "Last updated" timestamp is recent (≤90 days for launch batch)

---

## P3 — Nice-to-Have (flag but don't block)

- [ ] OG image prompt provided (for Framer featured image)
- [ ] Alternate title variants (3) provided
- [ ] Alternate meta description variant (1-2) provided
- [ ] Hebrew localization notes (if applicable)
- [ ] Suggested social post copy
- [ ] Suggested email newsletter teaser

---

## Final Verdict Format

```
VERDICT: PASS | BLOCK

Summary: [1-2 sentences]

P1 status: [X/Y passed]
P2 status: [X/Y passed]
P3 notes: [what's flagged]

Required fixes before re-submit: [numbered list if BLOCK]

Confidence: HIGH / MEDIUM / LOW
Confidence reasoning: [1 sentence]

Session file written to: docs/08-agents_work/sessions/YYYY-MM-DD-qa-lead-[slug].md
```

---

## Validation Tools (qa-lead runs these)

| Check | Tool |
|-------|------|
| Schema JSON-LD | https://validator.schema.org/ |
| Rich results preview | https://search.google.com/test/rich-results |
| Readability grade | Hemingway App, Yoast readability, or equivalent |
| Banned-word scan | Grep the article for banned terms |
| Keyword density | Manual calc: (keyword count × word length) / total words × 100 |
| Link resolution | WebFetch each external link |

---

*If qa-lead flags BLOCK, Growth Lead addresses the fixes and re-submits. qa-lead re-runs the checklist. Loop until PASS.*
