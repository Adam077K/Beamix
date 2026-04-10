# Open Questions — Decisions Needed from Adam

These questions came up during the product rethink session on 2026-04-09. They need Adam's input before building can proceed.

---

## Product Direction

### Q1: Remove Social Strategy agent?
**Context:** Research shows social media doesn't directly affect GEO. No evidence that social posts improve AI engine citations. It feels like it belongs in a different product (social media management).
**Options:**
- A) Remove entirely — simplifies the product, sharpens GEO focus
- B) Keep but deprioritize — don't show prominently, available for Pro+
- C) Rethink as "Community Presence" — guide users to participate in Reddit, Quora, forums (these DO affect Perplexity)
**Recommendation:** Option C — Reddit/Quora presence matters for Perplexity. Rename and refocus.

### Q2: Should agents be invisible (roadmap UX) or visible (agent hub)?
**Context:** Proposed replacing the "agent hub" (pick an agent to run) with a "GEO roadmap" (see your plan, click to execute next action, agent runs behind the scenes).
**Options:**
- A) Full roadmap model — agents are invisible, users see actions
- B) Hybrid — roadmap is the default view, but power users can still access agent hub
- C) Keep agent hub — familiar SaaS pattern, lower redesign cost
**Recommendation:** Option B — roadmap for most users, agent hub for power users.

### Q3: Engine-specific optimization — visible to users or hidden?
**Context:** Research shows each AI engine trusts different sources. Optimization should be engine-aware. But is this too complex for SMBs?
**Options:**
- A) Visible — "This action improves your ChatGPT visibility" tags on each roadmap item
- B) Hidden — agents optimize per-engine internally, users just see "improve your score"
- C) Summary level — show engine breakdown on dashboard, but don't tag individual actions
**Recommendation:** Option C — show the breakdown but don't burden per-action.

### Q4: Off-site agents (Citation Builder, Directory Optimizer, etc.) — how do they work?
**Context:** These are the biggest opportunity (85% of mentions are off-site) but also the hardest to build. They involve guiding users through EXTERNAL platforms (Yelp, Google Business Profile, industry directories, Wikidata).
**Options:**
- A) Fully guided — step-by-step instructions with screenshots, user does the work on external platforms
- B) Semi-automated — agent generates the content/text, provides direct links, user copy-pastes
- C) Automated where possible — use APIs (Google Business Profile API, Yelp API) to submit directly
**Recommendation:** Start with B, graduate to C for platforms with APIs.

---

## Content Quality

### Q5: Should QA gate BLOCK content that lacks GEO signals?
**Context:** Research proves statistics (+40%), citations (+115%), and quotes (+41%) are the highest-impact GEO techniques. Currently QA gate is warning-only.
**Options:**
- A) Block — refuse to deliver content without stats/citations/quotes
- B) Warn prominently — deliver but show clear warning: "This content is missing X, Y, Z — add them before publishing"
- C) Auto-enhance — if content lacks signals, run a second pass to add them automatically
**Recommendation:** Option C for premium agents, Option B for unlimited agents.

### Q6: Content rate limiting — should we enforce it?
**Context:** Sites publishing 50+ AI pages/month saw ranking crashes. Our agents could theoretically generate unlimited content.
**Options:**
- A) Hard limit — cap content generation per month per tier
- B) Soft limit — warn after threshold, allow override
- C) Smart scheduling — spread content publication over time automatically
**Recommendation:** Option C — smart scheduling with warnings.

---

## Prioritization

### Q7: What's the FIRST thing to build after fixing launch blockers?
**Options:**
- A) Upgrade existing agents with GEO research (inject stats/citations/quotes into system prompts) — 1 week
- B) Build Query Intelligence ("here are 50 queries you should rank for") — 2 weeks
- C) Build the Roadmap UX (replace agent hub) — 2-3 weeks
- D) Build off-site agents (Citation Builder, Directory Optimizer) — 3-4 weeks
**Recommendation:** A first (quick win, immediate quality improvement), then B (centers the product).

### Q8: Has the 20260318_reconciliation.sql migration been applied to production?
**Context:** This migration fixes credit system RPCs. Without it, every agent credit operation fails in production. It's a 15-minute SQL run.
**Action needed:** Check Supabase production and apply if missing.

### Q9: Current pricing ($49/$149/$349) — still correct after rethink?
**Context:** Research shows GEO agencies charge $1,500-$30,000/mo. Our pricing is 4-85x cheaper. Competitors (monitoring-only tools) charge $29-$500/mo.
**Question:** Is $49 too low for a product that actually does the work? Or is aggressive pricing the right growth strategy?

---

## Process & Session Notes

### What was decided in this session:
- Nothing was DECIDED — this was an exploration/brainstorming session
- Adam expressed dissatisfaction with current feature set
- Adam wants agents to be research-backed, professional, transparent
- Adam wants the "AI agency for SMBs" positioning
- Adam wants users to feel part of the journey

### What needs to happen next:
1. Adam reviews these questions and makes decisions
2. Based on decisions, update 03-PRODUCT-VISION.md from PROPOSAL to APPROVED
3. Build lead creates implementation plan
4. Start with launch blockers (Week 1), then execute based on priorities

### Session artifacts:
- 5 codebase audit reports (Explore agents)
- 3 research reports (Researcher agents, Opus-tier)
- 1 product state synthesis (Product Lead agent)
- This folder: `docs/product-rethink-2026-04-09/`
