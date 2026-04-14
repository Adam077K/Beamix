# 02 — Execution Plan (Phase B)

> Phase A = research + planning (DONE). Phase B = writing + publishing. This file is the step-by-step plan for Phase B.

---

## Prerequisites (must be done before any writing)

These are tracked in `05-OPEN-DECISIONS.md`. Until the user answers them, do not start writing.

1. **User picks 5 custom topics** (add to the 20 in `TOPIC_MAP.md`)
2. **User provides author identity** (name, credential line, photo, LinkedIn URL)
3. **User confirms beta scan data availability** (gates article #3 — the 1,000-SMBs report)
4. **User picks first-batch writing order** (recommended: pillar + 2 clusters + FAQ hub 1)

Plus one technical setup the user must action in parallel:
5. **Cloudflare reverse proxy in front of Framer domain** (required for custom `robots.txt` + `llms.txt`) — instructions in `research/FRAMER_SEO.md` §6

---

## Phase B Timeline (2 weeks, assuming decisions in hand)

### Week 1 — Foundation Batch (1 pillar + 2 clusters + FAQ hub 1)

**Day 1 — Kickoff**
- CEO reads handoff package
- CEO confirms user decisions all answered
- CEO briefs Growth Lead (use `03-AGENT-PROMPTS/01-growth-lead.md`)

**Day 2–3 — Pillar article draft**
- Growth Lead spawns researcher → technical-writer → copy-editor → qa-lead
- Pillar: "The SMB Owner's Complete Guide to AI Search Visibility in 2026" (3,500–4,000w)
- See `03-AGENT-PROMPTS/02-technical-writer-blog.md`

**Day 4 — Cluster article 1**
- Cluster 1 theme: Vertical Visibility Guide — start with **Law Firms + ChatGPT** (highest value, zero competition)

**Day 5 — Cluster article 2**
- Cluster 2 theme: Original-data piece — "We Scanned 1,000 Israeli SMBs" *(conditional on decision #3)*
- Fallback if no data: **Why Restaurants Disappear on AI Search**

**Day 6–7 — FAQ hub 1**
- FAQ Hub: "GEO Basics FAQ" (8 core questions from `FAQ_ARCHITECTURE.md`)
- Uses `03-AGENT-PROMPTS/06-technical-writer-faq.md`

**End of week 1:** 3 articles + 1 FAQ hub delivered as Markdown + JSON-LD ready for Framer paste.

### Week 2 — Expansion Batch (5 more articles + 4 more FAQ hubs)

**Day 8–10 — Cluster 1 expansion**
- Restaurant, Moving Company, Insurance Agent vertical guides (3 articles)

**Day 11–12 — Cluster 3 tactical playbooks**
- "FAQPage Schema Is the Cheapest GEO Win" (technical tactical)
- One of user's 5 custom topics

**Day 13 — Remaining FAQ hubs**
- "How Beamix Works FAQ"
- "Pricing FAQ"
- "Industry-Specific FAQ"
- "Technical FAQ"

**Day 14 — QA sweep + packaging**
- qa-lead pre-publish checklist on every deliverable
- Package all into `deliverables/` folder for user to paste into Framer

### Week 3 (optional) — Hebrew pass
- Native Hebrew writer (human) or Hebrew-capable LLM pass
- Not literal translation — Israeli business tone, local examples, local keywords
- Top 5 articles only for first Hebrew batch

---

## Per-Article Agent Pipeline

Each article runs through this sequence. Each step has a ready-to-paste prompt in `03-AGENT-PROMPTS/`.

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 0 — CEO reads handoff + confirms article is in scope   │
│ Prompt: 03-AGENT-PROMPTS/00-ceo-kickoff.md                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 1 — Growth Lead owns the article                       │
│ • Re-reads CONTENT_PLAYBOOK.md + STYLE_GUIDE.md             │
│ • Writes per-article brief (keyword, outline, sources list) │
│ • Spawns researcher + technical-writer in sequence          │
│ Prompt: 03-AGENT-PROMPTS/01-growth-lead.md                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2 — researcher (Opus) — SOURCING                       │
│ • Finds ≥1 statistic for opening hook                       │
│ • Finds ≥1 named expert quote with source                   │
│ • Finds ≥3 additional supporting stats / studies            │
│ • Returns JSON: {stats: [...], quotes: [...], sources: [...]}│
│ Prompt: 03-AGENT-PROMPTS/03-researcher-sourcing.md           │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 3 — technical-writer (Sonnet) — DRAFTING               │
│ • Uses Content Formula (see 01-RESEARCH-SUMMARY.md)         │
│ • Integrates researcher's stats + quotes                    │
│ • Produces Markdown body + meta + JSON-LD blocks            │
│ Prompt: 03-AGENT-PROMPTS/02-technical-writer-blog.md         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 4 — copy-editor pass (can be same agent, skill swap)   │
│ • Runs banned-word find/replace                             │
│ • Varies sentence length for burstiness                     │
│ • Adds specific named examples where prose is generic       │
│ • Converts triadic lists into sharper formats               │
│ Prompt: 03-AGENT-PROMPTS/04-copy-editor-humanize.md          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 5 — qa-lead — PRE-PUBLISH GATE                         │
│ • Runs 04-PUBLISH-CHECKLIST.md                              │
│ • Validates JSON-LD on schema.org validator                 │
│ • Confirms readability grade 8-10                           │
│ • Verdict: PASS / BLOCK with specific issues                │
│ Prompt: 03-AGENT-PROMPTS/05-qa-lead-prepublish.md            │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 6 — Growth Lead hands final package to user            │
│ • Markdown body                                             │
│ • Meta title + description                                  │
│ • JSON-LD schema blocks (Article + Person + FAQPage)        │
│ • Internal linking notes                                    │
│ • OG image prompt (for design/AI-generation)                │
│ Saves to: deliverables/[article-slug]/                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Per-FAQ-Hub Pipeline (simpler)

FAQ hubs don't need the full 6-step pipeline. Shorter version:

```
Growth Lead → technical-writer (FAQ prompt) → qa-lead → package
```

Each hub = 6–10 Q&A pairs, each answer 40–80 words, one FAQPage JSON-LD block per hub. Spec in `FAQ_ARCHITECTURE.md`.

---

## Deliverable Folder Structure

As articles complete, package them here:

```
docs/05-marketing/deliverables/
├── blog/
│   ├── 01-pillar-smb-complete-guide/
│   │   ├── article.md                   ← paste this into Framer CMS body
│   │   ├── meta.md                      ← title, description, OG
│   │   ├── schema.html                  ← paste into Framer Custom Code
│   │   ├── sources.md                   ← for author reference
│   │   └── og-image-prompt.md           ← for image generation
│   ├── 02-law-firms-chatgpt/
│   ├── 03-...
│
└── faq/
    ├── 01-geo-basics/
    │   ├── faq.md
    │   ├── schema.html
    │   └── meta.md
    └── 02-...
```

---

## Skills Each Agent Loads

| Agent | Primary skills |
|-------|----------------|
| CEO | seo-content-writer, geo-fundamentals, copywriting, seo-content-planner, seo-keyword-strategist |
| Growth Lead | seo-content-planner, content-marketer, copywriting, seo-meta-optimizer, seo-structure-architect |
| researcher | geo-fundamentals, seo-content-auditor, copy-editing |
| technical-writer (blog) | seo-content-writer, copywriting, seo-structure-architect, seo-snippet-hunter |
| technical-writer (FAQ) | seo-content-writer, seo-snippet-hunter, copy-editing |
| copy-editor | copy-editing, copywriting |
| qa-lead | seo-audit, seo-content-auditor, seo-meta-optimizer |

Skills live at `.agent/skills/[skill-name]/SKILL.md` — agents load 3–5 each, on demand.

---

## Success Criteria (per article)

An article is DONE when:
- [ ] Passes `04-PUBLISH-CHECKLIST.md` in full
- [ ] qa-lead verdict: PASS
- [ ] Package in `deliverables/blog/[slug]/` complete
- [ ] Session file written at `docs/08-agents_work/sessions/YYYY-MM-DD-growth-lead-[slug].md`

---

## Parallel Work Streams (can run simultaneously)

Three streams that don't block each other:

1. **Content writing** (this doc) — Weeks 1-2
2. **Framer setup** (user does, parallel) — Week 1
   - Cloudflare reverse proxy setup
   - Author page with Person schema
   - Blog template with Article schema
   - FAQ page template with FAQPage schema
3. **Tracking setup** (user decides tool) — Week 1
   - Profound or Otterly account for AI citation tracking
   - Baseline measurement before publishing

---

*Next: open `03-AGENT-PROMPTS/` for ready-to-paste briefs.*
