# Session: Research Lead — GEO Content Initiative (Phase A)
*Date: 2026-04-14 · Owner: research-lead · Assigned by: CEO*

## Task
Produce the research + synthesis foundation for Beamix's marketing content engine (blog + FAQ on Framer). 5 parallel research threads → single operating doc for Growth Lead.

## Deliverables
All written to `/Users/adamks/VibeCoding/Beamix/.worktrees/ceo-1-1776160822/`:

- `docs/05-marketing/research/GEO_MECHANICS.md` — How LLMs pick citations in 2026
- `docs/05-marketing/research/EEAT_2026.md` — Post-HCU E-E-A-T operating rules
- `docs/05-marketing/research/HUMAN_SOUNDING_CONTENT.md` — Banned words + humanization workflow
- `docs/05-marketing/research/COMPETITIVE_CONTENT_GAPS.md` — Competitor audit + 25-article backlog
- `docs/05-marketing/research/FRAMER_SEO.md` — Framer SEO/GEO setup recipes
- `docs/05-marketing/CONTENT_PLAYBOOK.md` — Opinionated synthesis, THE operating doc

## Method
Research was executed directly by Research Lead (subagent dispatch unavailable from this context). Primary sources: Google QRG Sept 2025, Princeton GEO paper (KDD 2024 / arXiv 2311.09735), Profound citation analysis, Yext AI visibility study, Lily Ray HCU analysis, Stanford AI-detector study, Framer official docs + community practitioners, competitor blog browses. Every claim in deliverables is sourced with URL + access date.

## 10-bullet TL;DR (for CEO)
1. **Princeton GEO paper is the anchor primary source** — Statistics Addition (+41%), Quotation Addition (+28%), Fluency + Stats combined = ~+40% lift. Every Beamix article must include ≥1 stat in first 100 words, ≥1 named quotation, inline citation links.
2. **Each AI engine cites differently.** ChatGPT → Wikipedia-heavy. Perplexity → Reddit + authoritative specialists. Gemini/AI Overviews → 52% brand-owned sites + Reddit + YouTube. Optimize multi-channel.
3. **FAQPage schema = cheapest GEO win.** 3.2× more likely to appear in AI Overviews. Must ship on every article with Q&A block.
4. **E-E-A-T now applies to ALL competitive queries** (December 2025 core update extended beyond YMYL). Author bylines + Person schema are non-negotiable — 74% of HCU losers lacked them.
5. **The banned-word list is real.** "Delve" appears 10× more in AI text than human. Find/replace pass on every draft. Full list in HUMAN_SOUNDING_CONTENT.md §2.
6. **Google does NOT use AI detectors as a ranking signal.** But readers smell AI-cliché prose. Humanize for trust, not for detectors.
7. **Competitor content gap is massive for vertical SMB guides.** Zero coverage of restaurants/law firms/insurance/moving/dental etc. — this is Beamix's blue ocean.
8. **Hebrew content = zero competition.** Instant category authority for Israeli market with even 3-5 strong Hebrew articles.
9. **Framer SEO limitation:** robots.txt + sitemap.xml not directly editable. **Mandatory workaround: Cloudflare reverse proxy** to deploy custom robots.txt + llms.txt. Required for AI crawler allow-list.
10. **llms.txt is insurance, not strategy.** ~10% adoption, no major LLM confirms they read it. Implement as 1-line deploy; don't build content around it.

## Confidence: HIGH
- Primary academic source (Princeton paper, peer-reviewed KDD 2024)
- Primary Google source (QRG Sept 2025 live PDF)
- Multi-source corroboration on every major claim
- Framer docs directly confirmed via their help site
- Gaps explicitly flagged in each research file

## Gaps / Open questions for user
- **Headcount for content:** Who is the named author-of-record for Beamix? (Needed for Person schema.) Adam K. assumed; confirm bio + photo + LinkedIn URL.
- **Hebrew writer capacity:** Pillar 3 (Hebrew content, zero competition) requires a fluent Hebrew content editor. Do we have this?
- **Cloudflare proxy:** Is Beamix domain already behind Cloudflare? If not, someone needs to set it up before first article ships (not blocking research, but blocking launch).
- **Framer plan:** Confirm Pro plan is active (required for Custom Code / schema injection).
- **Measurement tool:** Profound ($$$) vs Otterly (cheaper) for AI citation tracking — Growth Lead decision.
- **Editorial calendar ownership:** Growth Lead needs to operationalize the 25-article backlog — recommend weekly editorial meeting starting week of 2026-04-21.

## No blockers on research. Ready for Growth Lead to operationalize.
