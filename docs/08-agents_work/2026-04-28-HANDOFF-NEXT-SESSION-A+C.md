# Handoff — Next Session
**Date:** 2026-04-28
**Scope:** Category A (Strategic / Vision-pushing) + Category C (Close the Gaps) — 9 work items
**Branch:** `main` is current (PR #53 merged at `dd5e2b1`). Open a new worktree for this session.

---

## ⚡ Paste this prompt at the start of your next Claude Code session

> I'm the next CEO continuing the Beamix product design + planning work. The prior session merged PR #53 to main on 2026-04-28 — full design board (Round 1) + PRD v3 + Build Plan v1 + ~65 surgical edits to design specs. Everything is on `main` already; no pull needed.
>
> **Load this state first (in order):**
>
> **Master state:**
> 1. `docs/08-agents_work/2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md` — the design legend Round 1 synthesis with the 5 locked decisions and 10 new features (F22-F31)
> 2. `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v3.md` — canonical PRD (supersedes v2)
> 3. `docs/08-agents_work/2026-04-28-BUILD-PLAN-v1.md` — 57 tickets across Tier 0-5
> 4. `docs/08-agents_work/2026-04-27-BOARD-MEETING-SYNTHESIS.md` — Board 1 strategic synthesis (23 decisions Adam confirmed on 2026-04-28)
> 5. `docs/08-agents_work/2026-04-26-FRAME-5-v2-FULL-VISION.md` — strategic positioning LOCKED
> 6. `.claude/memory/DECISIONS.md` — all architectural decisions including 2026-04-28 board lock entry
>
> **Round 1 design legend reports (skim — they inform Round 2):**
> 7. `docs/08-agents_work/2026-04-28-BOARD2-rams.md`
> 8. `docs/08-agents_work/2026-04-28-BOARD2-ive.md`
> 9. `docs/08-agents_work/2026-04-28-BOARD2-tufte.md`
> 10. `docs/08-agents_work/2026-04-28-BOARD2-kare.md`
> 11. `docs/08-agents_work/2026-04-28-BOARD2-linear.md` (partial — earlier dispatch)
> 12. `docs/08-agents_work/2026-04-28-BOARD2-stripe.md` (partial — earlier dispatch)
>
> **Audit + journey context:**
> 13. `docs/08-agents_work/2026-04-27-AUDIT-CONSOLIDATED.md`
> 14. `docs/08-agents_work/2026-04-27-AUDIT-3-customer-journey.md` (12 unanswered customer questions live here)
>
> **Designer reference (for new spec work):**
> 15. `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` (CANONICAL — amended with Section 2.5 Agent Fingerprint Function, sigil typology change, motion surgery, registers 4→3)
> 16. `docs/08-agents_work/2026-04-27-EDITORIAL-surfaces-design-v1.md` (amended with F22 Cartogram on Monthly Update Page 2, F28 line, Margin temporal decay)
> 17. `docs/08-agents_work/2026-04-27-HOME-design-v1.md` (amended)
> 18. `docs/08-agents_work/2026-04-27-SCANS-COMPETITORS-design-v1.md` (amended — Margin cut, engine micro-strip)
> 19. `docs/08-agents_work/2026-04-27-INBOX-WORKSPACE-design-v1.md` (amended — narration column replaces walking figure)
>
> **Quality bar reminder:** Adam's bar is "real billion-dollar company designed this." His thesis: one founder + AI agents = 500-person-company output. NO scope cuts based on team size. NO timelines in planning (plan by scope + dependencies + quality bar). NO AI labels on output. Single-character externally ("Beamix"); agents named only on /crew. Voice canon Model B locked. Hand-drawn elements ONLY when earned (per Round 1 cuts).
>
> **The work for this session is divided across two categories — A (Strategic) and C (Close the Gaps). 9 items total. Plan in two phases, dispatch in waves to manage org usage budget.**

---

## PHASE 1 — Category A (Strategic / Vision-pushing) — 4 items

### A1. Resume the Design Legend Board — Round 2 (Linear / Stripe / Vercel)

The org usage limit blocked Round 2 in the prior session. Round 1 (Rams/Ive/Tufte/Kare) completed and produced sharp critique that drove the 65 cuts now on main. Round 2 reviews the **cleaned-up** spec corpus — sharper review, not relitigating Round 1.

**Three agents in parallel (general-purpose, opus model):**

1. **Linear (Karri Saarinen lens)** — speed audit (16ms-or-it-doesn't-ship), keyboard discipline, density vs whitespace, dark mode pressure-test (Beamix deferred dark mode; Linear ships parity), the missing /changelog as canon. **The Linear partial output already exists at `BOARD2-linear.md`** — extend or refine rather than restart. Output to `docs/08-agents_work/2026-04-28-BOARD2-linear-v2.md`.

2. **Stripe lens** — /security comparison vs stripe.com/security (Stripe is the explicit exemplar); Monthly Update PDF as Stripe Press; brand-at-every-scale audit; the editorial artifact missing at MVP. **The Stripe partial output already exists** — extend. Output to `docs/08-agents_work/2026-04-28-BOARD2-stripe-v2.md`.

3. **Vercel/Rauno lens** — **most consequential missing voice.** Distinct curves per motion moment (Round 1 raised that the 5 motions sharing one curve was wrong; Vercel resolves this), narration column refinement, Workflow Builder canvas physics, bundle craft audit, Geist + typography stack pressure-test. Output to `docs/08-agents_work/2026-04-28-BOARD2-vercel.md`.

**Each agent prompt:** ~1500-2000 words, briefs the legend's lens + required reading + specific deliverables + output format. Use the prior session's Round 1 prompts at `docs/08-agents_work/2026-04-28-BOARD2-{rams,ive,tufte,kare}.md` as length-and-style reference. The cleaned-up spec corpus is the review surface.

**CEO synthesis** after Round 2 returns: extend the existing `2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md` with Round 2 + 3 findings, surface new convergences, mark resolutions for Adam.

---

### A2. Round 3 Alternative-Vision Designers — Arc + Notion

**Two agents in parallel after Round 2 returns. High-risk, high-reward — pressure-tests Frame 5 v2 foundation.**

4. **The Browser Company / Arc lens** — *"What if Beamix were character-led, not single-character? What if there were a 'Beamie' character throughout?"* Adam locked Beamix as single-character externally per Frame 5 v2 (and "Beamie deferred" in auto-memory — see `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_beamie_deferred.md`). Arc would push back. Specifically test: does the single-character voice hold up against Arc's character-led product DNA? Does the Brief / Cycle-Close Bell / Receipt-That-Prints have soul or restraint to a fault? Output to `docs/08-agents_work/2026-04-28-BOARD2-arc.md`.

5. **Notion / Ivan Zhao lens** — *"What if Beamix were composable like blocks, not a fixed page set?"* The 9 page-surface spine (/home, /inbox, /scans, /workspace, /crew, /competitors, /security, /settings, /reports) is locked. Notion would ask: what if the customer composed their own surfaces from Beamix primitives? Block-based Brief? Block-based dashboard? The Workflow Builder is already block-flavored — could that pattern extend? Output to `docs/08-agents_work/2026-04-28-BOARD2-notion.md`.

**Both agents:** opus model, ~3500 words each, output as critique + alternative-vision-proposal. They're explicitly NOT redesigning Beamix — they're pressure-testing whether the foundation is right. Adam will read both and either confirm Frame 5 v2 (most likely) or reframe (low probability but the value of running them is the confirmation).

**CEO synthesis** integrates Arc + Notion findings into the design-board synthesis doc.

---

### A3. The Aria Simulator (Marcus's hidden CTO co-founder)

**One agent (general-purpose, opus). Most-consequential single agent in this session.**

Round 1 surfaced Aria as the load-bearing hidden persona for B2B SaaS sales. Marcus simulator: *"Without a /security page Aria can read in 6 minutes I can't bring him along, and without him I can't justify Scale upgrade at month 9."* Aria has never been simulated.

**Brief:** You are Aria — Marcus's CTO co-founder at Acme SaaS (B2B dev-tooling, $1.8M ARR, 30 employees). 10 years engineering, security-aware, GitHub-native. Marcus just sent you a Beamix /security page link with the message "thoughts?"

Walk through:
- The 6-second / 60-second / 6-minute reads of /security
- Specifically critique the §9 cryptographic-primitive paragraph (the "this is the right answer" moment Marcus simulator predicted)
- The sub-processors table — what would procurement need that's missing?
- The DPA / indemnification clause — strong enough for a B2B SaaS vendor signoff?
- The DSAR endpoints (Article 15/17/20/33) — implementable enough that you'd vouch for it?
- Forward Beamix to your Slack? Or block Marcus's renewal?
- What 2-3 specific things would make you write a "Beamix is solid" Slack message instead of asking Marcus to push back?

Output to `docs/08-agents_work/2026-04-28-BOARD-aria-simulator.md`. ~2500 words.

**Adds Aria as the 4th canonical persona** alongside Marcus / Dani / Yossi. Future sessions can simulate Aria on any new surface.

---

### A4. State of AI Search — un-defer from Year 1 Q4 to MVP launch?

**One agent (research-lead, opus).**

Stripe-design voice (Round 1 partial) suggested un-deferring this. Worldbuilder originally specced as Year 1. The question: does shipping a Beamix-authored "State of AI Search 2026" report at MVP launch (or Q1) create the editorial artifact + earned-media flywheel that justifies the cream-paper register and validates Beamix as the category-defining brand?

**Brief:** Pressure-test the un-defer decision. Specifically:
- What's the strategic ROI of shipping at MVP vs Year 1 Q4? Earned media estimate, AI-citability potential, brand-defining effect.
- Build the report's structure: 5 hero charts (built from data Beamix already collects via /scan public scans), 8-10 narrative sections, the editorial spine.
- The 3-5 quotable insights that Beamix has unique data to speak to (small business AI search visibility statistics, vertical-specific citation patterns, engine-citation reliability rankings).
- Launch plan: TechCrunch + Techmeme + founder Twitter coordination, embargoed press, launch-day OG card design (cream paper + cartogram).
- The cost: ~2-3 weeks of editorial + design work. Worth it at MVP?

Output to `docs/08-agents_work/2026-04-28-RESEARCH-state-of-ai-search-undefer.md`. ~3000 words ending with explicit recommendation: MVP / Q1 / hold-at-Year-1-Q4.

If the recommendation is un-defer, this becomes a major project for a future session — but the structure + plan exist by end of this session.

---

## PHASE 2 — Category C (Close the Gaps) — 5 items

These are spec-completion tasks. Most are 1-day each. Run AFTER Phase 1 returns (or in parallel if usage budget allows).

### C11. Pixel-precise spec for F22 AI Visibility Cartogram

**One agent (general-purpose, opus).**

The Cartogram is the single highest-leverage new feature (Tufte's John Snow move). PRD v3 names it but doesn't pixel-spec it.

**Brief:** Design the AI Visibility Cartogram to pixel precision.
- 50 queries × 11 engines = 550-cell grid layout (~880×600px desktop)
- Cell color encoding: brand-blue (top citation 1-3), ink-3 (cited late 4+), paper-elev (not cited), score-critical-soft (competitor cited instead)
- 1-character glyph per cell (position number 1-3 OR competitor initial)
- Direct labeling: queries down left margin in 11px Inter caps; engines across top in 11px Inter caps
- Legend / key (or NO legend per Tufte direct-labeling)
- Hover state: cell expands to show full query + engine + position + competitor detail
- Three placements: /scans/[scan_id] page, Monthly Update PDF Page 2, public OG share card
- Mobile (375px): how does 550 cells render? Scroll? Grid resize? Or different cartogram shape?
- Accessibility: screen reader interpretation
- Implementation notes: HTML grid + CSS conditional formatting; SVG for OG; React-PDF embed for Monthly Update

Output to `docs/08-agents_work/2026-04-28-DESIGN-ai-visibility-cartogram-v1.md`. ~3000 words with diagrams.

---

### C12. Pixel-precise specs for F23-F31 (9 new features)

**One agent (general-purpose, sonnet — these are mostly simpler specs).**

PRD v3 names them; pixel-precise specs needed for build:
- **F23 Cycle-Close Bell** — full motion choreography (Ring close + sparkline settle + status sentence rewrite)
- **F24 Brief Re-Reading** — quarterly trigger UX (cream paper, Fraunces clauses, the 3-second moment, "Looks good" CTA)
- **F25 Receipt-That-Prints card** — paper-fold motion + 96px cream card + auto-file logic
- **F26 Print-Once-As-Gift** — month-6 trigger + print-on-demand vendor flow + the bookmark insert design
- **F27 Print-the-Brief button** — onboarding moment + A4 PDF render (cream paper editorial register)
- **F28 "What Beamix Did NOT Do" line** — Monthly Update Page 6 placement + rejection log link
- **F29 Printable A4 ops card** — /settings sub-page + print stylesheet + Yossi multi-client flow
- **F30 Brief grounding inline citation** — visual treatment everywhere except WB Inspector (1px brand-blue rule + Inter italic spec)
- **F31 Brief binding line** — page-bottom rotating clause display + the rotation algorithm

Output to `docs/08-agents_work/2026-04-28-DESIGN-features-F23-F31-specs.md`. ~4000 words covering all 9.

---

### C13. Answer the 12 unanswered customer questions (audit-3 BLOCKER)

**One agent (product-lead, sonnet).**

Audit 3 listed 12 customer questions with no spec'd answer:
1. Can I undo Brief approval?
2. How do I add a teammate to my Beamix account?
3. Where do I see my Twilio phone numbers if I lose track?
4. Can I export my data?
5. What happens if I cancel?
6. Can I share my Monthly Update without making it public?
7. How do I migrate my domain (e.g., business rebrand)?
8. What's the data privacy/storage policy?
9. The /reports route is referenced — what is it?
10. How do I pause my subscription?
11. How do I remove a Beamix-detected competitor I don't care about?
12. Multi-domain Scale tier pricing details

Output: each gets a PRD addition (with feature/spec spec section, acceptance criteria, build effort) OR an explicit "deferred to MVP-1.5" rationale. Output to `docs/08-agents_work/2026-04-28-PRD-12-unanswered-questions.md`. PRD v4 amendments will fold these in.

---

### C14. Tufte's small-multiples grids — detailed design

**One agent (general-purpose, opus).**

Tufte's Round 1 Section C surfaced 3 small-multiples opportunities:
- **Opportunity 1:** 11 engines × 12 weeks grid for /home (and /scans/[scan_id])
- **Opportunity 2:** 5 competitors × 11 engines parity grid for /competitors drill-down
- **Opportunity 3:** Monthly Update Page 4 redesign as small-multiples action timeline (this overlaps with F22 work)

**Brief:** Pixel-precise specs for Opportunities 1 + 2 (Opp 3 is covered in EDITORIAL spec amendment). Each grid: cell dimensions, layout, direct labeling, hover/click states, mobile treatment, motion (none on entrance per Tufte's Round 1 cut), implementation notes.

Output to `docs/08-agents_work/2026-04-28-DESIGN-small-multiples-grids-v1.md`. ~2500 words.

---

### C15. Lead Attribution Loop technical implementation spec

**One agent (backend-developer + ai-engineer collab via build-lead, sonnet).**

PRD v3 F12 names it but tech is partially undefined.

**Brief:** Detailed implementation spec for Lead Attribution Loop:
- Twilio dynamic phone number provisioning (regional bundle handling for IL/EU; latency budget; cost per provisioned number; the 3-numbers-async-not-sync UI flow)
- UTM tag system (URL builder, snippet placement instructions, customer-site distribution)
- Form-attribution snippet (DEFERRED to MVP-1.5 but spec the architecture now): customer-site JavaScript snippet that captures `document.referrer` at form-submit + posts to Beamix attribution endpoint
- Attribution data model: Postgres tables, Twilio webhook handler, UTM click logger, form-submission logger, the rollup logic for Monthly Update headline
- "Send to your developer" handoff design — copy-paste snippet + verification check + tracking the customer-site implementation status
- Marcus's Day-14-evangelism-trigger (first attributed click email) — exact email content + send conditions

Output to `docs/08-agents_work/2026-04-28-LEAD-ATTRIBUTION-tech-spec-v1.md`. ~3500 words.

---

## DISPATCH STRATEGY (manage org usage budget)

Org usage limit blocked Round 2 designers TWICE in the prior session. Manage budget carefully:

**Wave 1 (light load, 4 sonnet/general-purpose agents):**
- A3 Aria simulator (opus — high-value)
- C12 F23-F31 specs (sonnet — simpler)
- C13 12 customer questions (sonnet — simpler)
- C15 Lead Attribution tech (sonnet — simpler)

**Wave 2 (after Wave 1 returns, 3-5 agents):**
- A1 Round 2 designers (Linear / Stripe / Vercel) — all opus
- C11 Cartogram pixel spec (opus)
- C14 Small multiples (opus)

**Wave 3 (after Wave 2 returns, 3 agents):**
- A2 Round 3 designers (Arc / Notion) — both opus
- A4 State of AI Search un-defer research — opus

**If usage limit hits anywhere:** stop dispatch, complete what's returned, write checkpoint synthesis, defer remainder to a session after limit refreshes.

---

## CEO RESPONSIBILITIES (you)

1. **Pre-flight** (mandatory, ~10 min): read CLAUDE.md + all 6 master state docs above + check `~/.beamix/history/` for prior CEO records.

2. **Set session identity:** `/color teal` (3rd parallel CEO) and `/name ceo-design-board-cleanup` or similar.

3. **Synthesize after each wave** — don't wait for everything to return. Produce running deltas Adam can confirm.

4. **Final synthesis at end:** extend `2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md` with Round 2 + 3 findings; produce the consolidated change list (KEEP / CUT / IMPROVE / REPLACE / ADD format from prior synthesis).

5. **Update PRD v3 → v4** with the new spec additions (F22 detailed spec, 12 customer Q answers, Lead Attribution tech, etc.).

6. **Commit + push + open PR + merge** at end of session (per Adam's pattern this round). Reference PR #53 as the predecessor.

7. **Update auto-memory** if anything cross-session-worthy emerges (especially if Aria simulator surfaces a new persona pattern, or Round 2/3 designers shift a brand position).

8. **Write next handoff** for the session after this one. Pattern: this exact format.

---

## WHAT NOT TO DO

- **Do NOT** restart strategy from scratch. Frame 5 v2 is locked. The 23 strategic decisions are confirmed. The 5 design board locks are confirmed. Build on what exists.
- **Do NOT** relitigate Round 1 cuts. The 65 surgical edits are merged. They stand.
- **Do NOT** dispatch agents with prompts >2000 words (causes stalls per prior session lessons).
- **Do NOT** include timelines in any plan output (Adam ships with agent army; plan by scope + deps + quality).
- **Do NOT** add AI labels to any content output (Adam's hard rule).
- **Do NOT** push to main directly — use PR + merge flow per the prior session's pattern.

---

## WHAT SUCCESS LOOKS LIKE

By end of session:
- 9 work items completed (or, if usage-blocked, 6+ completed with the rest documented as deferred)
- New PR opened + merged to main with all session output
- DESIGN-BOARD2-CEO-SYNTHESIS extended with Round 2 + 3 findings
- PRD v4 (or PRD v3 amendments doc) covering F22 detail + 12 customer Qs + small-multiples + lead attribution tech
- New persona (Aria) added to design canon
- State of AI Search un-defer: explicit recommendation with launch plan if recommended
- Next handoff doc written

If usage-budget allows everything: this session puts Beamix into a state where build can begin **immediately** on Adam's 8 prereq confirmations, with zero remaining design or spec gaps.

---

*End of handoff. Branch state: `main` at `dd5e2b1`. Open new worktree as `ceo-2-{timestamp}` or similar. PR #53 is the immediate predecessor.*
