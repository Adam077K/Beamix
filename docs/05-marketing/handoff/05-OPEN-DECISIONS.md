# 05 — Open Decisions (User Input Needed)

> Phase B writing cannot start until these are answered. CEO asks the user these questions first. As each is answered, mark ✅ and fill in the answer.

**Status:** 4 of 4 pending (as of 2026-04-14)

---

## Decision 1 — Your 5 Custom Topics

**Status:** ⏳ PENDING

**Context:** Growth Lead has drafted 20 blog ideas in `TOPIC_MAP.md`. Five additional slots are reserved (labeled `USER_TOPIC_01` through `USER_TOPIC_05`) for topics you want to add on top of our recommendations.

**Question:** What are the 5 topics you want written? For each, share:
- Working title
- Who it's for (SMB vertical + awareness level if known)
- Why you want it (business reason)

**When answered:** Add entries to `TOPIC_MAP.md` replacing the placeholder slots. Growth Lead will pull keyword + intent + GEO angle for each.

**User answer:**
```
1.
2.
3.
4.
5.
```

---

## Decision 2 — Author Identity for Person Schema

**Status:** ⏳ PENDING

**Context:** E-E-A-T in 2026 requires a named author with Person schema on every article. 74% of Google HCU losers (n=500) lacked author bylines. This is non-optional for ranking.

**Question:** Who is the named author for the launch batch?

We need:
- **Full name** (e.g., "Adam Kowalsky")
- **Credential line** (e.g., "Founder of Beamix · 8 years marketing Israeli SMBs")
- **Headshot** (path to image file OR URL)
- **LinkedIn URL** (for schema.org `sameAs` property)
- **Optional:** Twitter/X, personal site, published articles elsewhere (more `sameAs` links = stronger entity signal)

**Recommendation:** Adam K. as launch author. Add one more author (a credible guest name — maybe a GEO practitioner) in month 2 for variety.

**User answer:**
```
Full name:
Credential line:
Headshot path/URL:
LinkedIn URL:
Other sameAs URLs:
```

---

## Decision 3 — 1,000 SMBs Data Report

**Status:** ⏳ PENDING

**Context:** One of our P0 launch articles is "We Scanned 1,000 Israeli SMBs — Here's What We Found". This is a citation-flywheel piece: original data that other publications and LLMs can cite, which compounds our authority.

**Question:** Does Beamix have real scan data from beta users right now that we could responsibly turn into an aggregate report (no named customers, no PII, just aggregate percentages and patterns)?

**Three possible answers:**

- **A. Yes — data is available now.** → Article ships in launch batch (Week 1). Growth Lead will brief data-lead to pull the aggregate cuts.
- **B. Not yet, but will have it in 2-4 weeks.** → Article moves to month 2. Week 1 substitute: "Why Restaurants Disappear on AI Search" (the next-highest P0).
- **C. No, won't have it soon.** → Article is dropped or reframed as a hypothesis piece ("What we expect to find when we scan 1,000 Israeli SMBs — and how we'll publish the results").

**User answer:** A / B / C — ____________

---

## Decision 4 — First-Batch Writing Order

**Status:** ⏳ PENDING

**Context:** We recommend writing in priority order: the pillar first (hub for internal linking), then two clusters, then FAQ hub 1.

**Recommended first batch (week 1):**
1. **Pillar** — "The SMB Owner's Complete Guide to AI Search Visibility in 2026" (3,500-4,000w)
2. **Cluster article 1** — "Why Law Firms Disappear on ChatGPT — And What to Do About It"
3. **Cluster article 2** — "We Scanned 1,000 Israeli SMBs" (IF Decision 3 = A) OR "Why Restaurants Disappear on AI Search"
4. **FAQ Hub 1** — "GEO Basics FAQ" (8 Q&A)

**Question:** Accept this order, or reshuffle? If reshuffle, specify the first 4 deliverables.

**User answer:**
```
Accept recommendation: yes / no
If no, write instead:
  1.
  2.
  3.
  4.
```

---

## Decision 5 (Technical Setup — Non-blocking but required before publish)

**Status:** ⏳ PENDING

**Context:** Framer does not allow direct editing of `robots.txt` or `sitemap.xml`. Required fix: Cloudflare reverse proxy in front of the Framer domain, serving custom `robots.txt` + `llms.txt` at the edge. Instructions in `research/FRAMER_SEO.md` §6.

**Question:** Can the user (or devops-lead) action this? Writing can proceed in parallel, but publishing needs this live.

**Three possible paths:**
- **A.** User actions themselves (Cloudflare account access + domain DNS).
- **B.** CEO spawns devops-lead to do it (needs credentials).
- **C.** Defer — publish articles without custom robots/llms.txt, lose some AI-crawler allow-list precision. Not recommended.

**User answer:** A / B / C — ____________

If A: Target completion date: ____________
If B: Provide Cloudflare + Framer access credentials when ready.

---

## Decision 6 (Optional — Tracking Setup)

**Status:** ⏳ OPTIONAL

**Context:** To measure success, we need AI citation tracking. Two options:

- **Profound** — enterprise-priced, most comprehensive
- **Otterly.ai** — SMB-priced, solid coverage, our target customer's budget band

**Question:** Pick a tool, or skip tracking for launch and measure manually (grep AI responses weekly)?

**Recommendation:** Otterly for now — matches our SMB price band and gives us dogfooding insight. Upgrade to Profound if we land enterprise customers.

**User answer:** Otterly / Profound / Manual / Other — ____________

---

## When All Answered

CEO updates this file with user answers, then:
1. Updates `TOPIC_MAP.md` with the 5 user topics
2. Updates the author-byline placeholder in all prompt files with real name
3. Marks this file's header: `Status: All decisions resolved — Phase B can begin`
4. Kicks off Growth Lead using `03-AGENT-PROMPTS/01-growth-lead.md` for article #1
