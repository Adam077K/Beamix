# Beamix Content Engine — Handoff Package

> **Read this file first.** Everything you need to continue the Beamix SEO/GEO content project is linked from here. Any agent (human or AI) should be able to pick up this project cold by reading only this README and the files it links to.

**Last updated:** 2026-04-14
**Session origin:** CEO ceo-1-1776160822 → Research Lead + Growth Lead (Phase A complete)
**Status:** Phase A (research + planning) COMPLETE. Phase B (writing) NOT YET STARTED — awaiting user decisions.

---

## 1. What This Project Is (30-second version)

Beamix sells **AI search visibility** to SMBs. The product scans ChatGPT / Gemini / Claude / Perplexity / AI Overviews for the customer's business, diagnoses why they don't rank, and uses AI agents to fix it (content, schema, FAQ, reviews).

The **marketing website** is built in **Framer** (https://average-product-525803.framer.app), separate from the product codebase.

**This project's job:** build a blog + FAQ engine on the Framer site that (a) ranks on Google, (b) gets **cited by LLMs** (GEO), and (c) sounds unmistakably human. Because Beamix literally sells this capability, our own content must be the lighthouse example.

---

## 2. The Full Doc Tree (map of everything)

```
docs/05-marketing/
├── handoff/                              ← YOU ARE HERE
│   ├── README.md                         ← this file, master index
│   ├── 00-CONTEXT.md                     ← project, brand, audience, constraints
│   ├── 01-RESEARCH-SUMMARY.md            ← condensed findings (read before writing)
│   ├── 02-EXECUTION-PLAN.md              ← Phase B step-by-step
│   ├── 03-AGENT-PROMPTS/                 ← ready-to-paste agent briefs
│   │   ├── 00-ceo-kickoff.md
│   │   ├── 01-growth-lead.md
│   │   ├── 02-technical-writer-blog.md
│   │   ├── 03-researcher-sourcing.md
│   │   ├── 04-copy-editor-humanize.md
│   │   ├── 05-qa-lead-prepublish.md
│   │   └── 06-technical-writer-faq.md
│   ├── 04-PUBLISH-CHECKLIST.md           ← pre-publish gate
│   └── 05-OPEN-DECISIONS.md              ← what the user still needs to decide
│
├── CONTENT_PLAYBOOK.md                   ← THE operating doc (Research Lead synthesis)
├── TOPIC_MAP.md                          ← pillar + 3 clusters + 20 ideas + 5 user slots
├── FAQ_ARCHITECTURE.md                   ← 40 Q&A across 5 hubs + JSON-LD example
├── CONTENT_STYLE_GUIDE.md                ← voice, banned-word list, reviewer checklist
├── MESSAGING.md                          ← current landing copy, existing voice
├── SEO_STRATEGY.md                       ← stub (superseded by CONTENT_PLAYBOOK.md)
│
└── research/                             ← primary research, every claim sourced
    ├── GEO_MECHANICS.md                  ← how LLMs pick citations (Princeton paper + more)
    ├── EEAT_2026.md                      ← E-E-A-T post-HCU, author schema, trust signals
    ├── HUMAN_SOUNDING_CONTENT.md         ← banned words, burstiness, AI-detector thresholds
    ├── COMPETITIVE_CONTENT_GAPS.md       ← Profound/Otterly/AthenaHQ gaps + 25-article backlog
    └── FRAMER_SEO.md                     ← Framer SEO specifics + schema code blocks
```

**Supporting project-wide docs referenced:**
- `docs/BRAND_GUIDELINES.md` — voice, colors, fonts
- `docs/PRODUCT_DESIGN_SYSTEM.md` — product visual system (reference only)
- `docs/PRD.md` — master product requirements
- `.claude/memory/MEMORY.md` — agent memory with locked decisions (pricing, tiers, agents)
- `CLAUDE.md` — project-wide agent instructions

---

## 3. Quick-Start for a New Agent Team

> If you are a CEO or Lead picking this up cold, follow these four steps in order.

### Step 1 — Orient (15 min)
Read in order:
1. `handoff/00-CONTEXT.md` — what Beamix is, who we sell to, brand rules
2. `handoff/01-RESEARCH-SUMMARY.md` — the 10-bullet research TL;DR + key tactics
3. `CONTENT_PLAYBOOK.md` — the operating rulebook (written by Research Lead)
4. `CONTENT_STYLE_GUIDE.md` — voice, banned words, headline formulas

### Step 2 — Understand the Plan (10 min)
Read:
1. `handoff/02-EXECUTION-PLAN.md` — what we're about to do
2. `TOPIC_MAP.md` — pillar + 3 clusters + 20 ideas
3. `FAQ_ARCHITECTURE.md` — 40 Qs + 5 FAQ hubs

### Step 3 — Check What's Blocked (5 min)
Read:
1. `handoff/05-OPEN-DECISIONS.md` — 4 user decisions needed before writing starts

If the user has answered them, continue. If not, ask the user those questions first.

### Step 4 — Execute
Use the prompt files in `handoff/03-AGENT-PROMPTS/` — they are ready-to-paste briefs for each agent in the writing pipeline. Start with `00-ceo-kickoff.md`.

---

## 4. The Writing Pipeline (what Phase B looks like)

```
Per blog post:
  CEO (reads handoff/)
    → Growth Lead (owns the article, picks skills, briefs team)
       → researcher (Opus) — sources every stat with URL + access date
       → technical-writer (Sonnet) — drafts article using CONTENT_PLAYBOOK + STYLE_GUIDE
       → copy-editor pass — humanize using HUMAN_SOUNDING_CONTENT.md rules
       → qa-lead — runs 04-PUBLISH-CHECKLIST.md
    → Growth Lead hands final Markdown + JSON-LD to user for Framer paste
```

```
For FAQ batch:
  CEO → Growth Lead → technical-writer (FAQ specialist prompt) → qa-lead
```

---

## 5. Non-Negotiable Rules (every agent, every article)

1. **No fabricated stats, testimonials, or quotes.** Ever. If research can't source it, drop the claim.
2. **Every article starts with a sourced statistic in the first 100 words.** Princeton GEO paper: +41% citation lift.
3. **Every article includes ≥1 named quote from a real expert (with role + source link).** +28% citation lift.
4. **Every article ships with FAQPage JSON-LD.** 3.2× more AI Overview appearances.
5. **Every article has Author byline + Person schema.** E-E-A-T requirement post-HCU.
6. **Banned-word list is enforced.** `HUMAN_SOUNDING_CONTENT.md §2` — find/replace before publish. No "delve", "tapestry", "realm", "navigate the landscape", "in today's fast-paced world".
7. **"Last updated" timestamp visible on page.** Required for freshness signal.
8. **Readability grade 8–10.** Measured via Hemingway or equivalent.
9. **Keyword density 0.5–1.5%.** No stuffing.
10. **Question-based H2s preferred.** Better LLM extraction + People Also Ask capture.

---

## 6. Brand Voice in Three Words

**Authoritative. Direct. Warm.**

- Authoritative → we know AI search; we have data; we cite sources
- Direct → no fluff, no throat-clearing, no "in today's digital landscape" openers
- Warm → written to SMB owners, not CMOs; Hebrew-friendly, real-business-friendly

Full voice rules in `CONTENT_STYLE_GUIDE.md`. Do/Don't table with examples.

---

## 7. What's Done vs What's Left

**DONE (Phase A):**
- ✅ 5-thread primary research with URL + date on every claim
- ✅ CONTENT_PLAYBOOK.md (operating doc)
- ✅ TOPIC_MAP.md (pillar + 3 clusters + 20 ideas + 5 open slots for user topics)
- ✅ FAQ_ARCHITECTURE.md (40 Qs, 5 hubs, JSON-LD template)
- ✅ CONTENT_STYLE_GUIDE.md (voice, banned words, checklist)
- ✅ This handoff package

**TO DO (Phase B — requires user decisions first):**
- ⏳ User confirms 5 custom topics to add to the 20 planned
- ⏳ User provides author identity for Person schema (name, credential, photo, LinkedIn)
- ⏳ User confirms beta scan data availability for the "1,000 SMBs" report
- ⏳ User picks first-batch writing order (recommended: pillar + 2 clusters + FAQ hub 1)
- ⏳ Writing sprint: draft → source → humanize → QA → handoff for Framer paste
- ⏳ Framer setup: author page + Person schema + Cloudflare reverse proxy for robots.txt + llms.txt
- ⏳ Hebrew localization pass (after EN approval)

---

## 8. Prompt Cache for Future Agents

If you are opening this project in a fresh Claude Code session, paste this as the opening message:

```
I'm continuing the Beamix marketing content project. Read
docs/05-marketing/handoff/README.md first — it's the master
index. Then read the files it instructs you to read in the
"Quick-Start for a New Agent Team" section. Check
handoff/05-OPEN-DECISIONS.md to see if user input is still
blocking Phase B. Once oriented, tell me what state we are in
and what you need from me to proceed.
```

---

## 9. Contact Points & Authority

- **Project owner:** Adam K. (founder of Beamix)
- **Marketing site:** https://average-product-525803.framer.app (Framer, separate repo)
- **Product repo:** https://github.com/Adam077K/Beamix
- **Agent system docs:** `AGENTS.md` + `.agent/agents/` in main repo

All agent work ends with a session file at `docs/08-agents_work/sessions/YYYY-MM-DD-[agent]-[task].md`.

---

*This README is the single source of truth for the content project. If you change the plan, update this file first.*
