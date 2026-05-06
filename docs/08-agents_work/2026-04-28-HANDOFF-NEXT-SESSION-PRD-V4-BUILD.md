# Handoff — Next Session
**Date:** 2026-04-28 (later session)
**Scope:** Consolidate PRD v4 + update Build Plan + get Adam's confirmations + begin Tier 0 build (or do another design pass first)
**Branch state:** PR for this session pending merge. Predecessors: PR #53 (`dd5e2b1`), PR #52 (`a48344b`).

---

## ⚡ Paste this prompt at the start of your next Claude Code session

> I'm the next CEO continuing the Beamix product design + planning work. The prior session ran the full Round 2 + Round 3 design board (Linear v2 / Stripe v2 / Vercel / Arc / Notion), simulated Aria as 4th persona, ran the State of AI Search un-defer research, and produced PRD v4 amendments covering F32-F47 + design-system canon additions. Everything is on `main`; no pull needed.
>
> **Load this state first (in order):**
>
> **Master state:**
> 1. `docs/08-agents_work/2026-04-28-DESIGN-BOARD-ROUND2-3-SYNTHESIS.md` — THIS session's synthesis with R2-1 through R2-20 changes (READ FIRST)
> 2. `docs/08-agents_work/2026-04-28-PRD-AMENDMENTS-v4.md` — F41-F47 specs + amendments to F2/F20/F22/F23/F30 + design-system canon additions
> 3. `docs/08-agents_work/2026-04-28-PRD-12-unanswered-questions.md` — F32-F40 specs (12 customer questions answered)
> 4. `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v3.md` — PRD v3 (F1-F31; basis for v4)
> 5. `docs/08-agents_work/2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md` — Round 1 synthesis
> 6. `docs/08-agents_work/2026-04-28-BUILD-PLAN-v1.md` — 57 tickets across Tier 0-5 (basis for v2)
> 7. `.claude/memory/DECISIONS.md`
>
> **Round 2/3/Aria/Research outputs (skim — they inform PRD v4 detail):**
> 8. `docs/08-agents_work/2026-04-28-BOARD2-linear-v2.md`
> 9. `docs/08-agents_work/2026-04-28-BOARD2-stripe-v2.md`
> 10. `docs/08-agents_work/2026-04-28-BOARD2-vercel.md`
> 11. `docs/08-agents_work/2026-04-28-BOARD2-arc.md`
> 12. `docs/08-agents_work/2026-04-28-BOARD2-notion.md`
> 13. `docs/08-agents_work/2026-04-28-BOARD-aria-simulator.md`
> 14. `docs/08-agents_work/2026-04-28-RESEARCH-state-of-ai-search-undefer.md`
> 15. `docs/08-agents_work/2026-04-28-DESIGN-features-F23-F31-specs.md` — F23-F31 pixel specs
> 16. `docs/08-agents_work/2026-04-28-DESIGN-ai-visibility-cartogram-v1.md` — F22 pixel spec
> 17. `docs/08-agents_work/2026-04-28-DESIGN-small-multiples-grids-v1.md` — Tufte's small-multiples
> 18. `docs/08-agents_work/2026-04-28-LEAD-ATTRIBUTION-tech-spec-v1.md` — F12 implementation spec
>
> **Quality bar reminder:** Adam's bar is "real billion-dollar company designed this." NO scope cuts. NO timelines in plans. NO AI labels. Voice canon Model B locked. Single-character externally; agents only on /crew. Aria added as 4th canonical persona (see auto-memory `project_aria_4th_persona.md`).
>
> **The work for this session is divided into 3 categories — pick one or do all in sequence.**

---

## OPTION A — Consolidate PRD v4 (foundational; if Adam wants build-ready PRD)

The current state:
- `PRD-wedge-launch-v3.md` (F1-F31, ~116K, canonical)
- `PRD-12-unanswered-questions.md` (F32-F40, ~57K, amendment-format)
- `PRD-AMENDMENTS-v4.md` (F41-F47 + amendments to F2/F20/F22/F23/F30 + design-system canon, ~22K)

The work: produce a single canonical `PRD-wedge-launch-v4.md` that supersedes v3 and folds in F32-F47 + amendments + canon.

**Approach:**
1. Read v3 in full
2. Read both amendment docs in full
3. Apply amendments inline to F2, F20, F22, F23, F30 (replace sections with v4 versions)
4. Append F32-F47 sections (each in PRD format)
5. Update the design-system canon section with the 10 named curves, ESLint rules, variable Inter, status vocab lock, dark partition, block primitives
6. Update Frame 5 v2 references (no strategic changes)
7. Output ~150K — check structure is clean (TOC, section anchors, search-friendly)

**Spawn:** product-lead (sonnet), with explicit brief that this is a consolidation task, not a rewrite — preserve v3's exact wording where unchanged.

---

## OPTION B — Update Build Plan v1 → v2

The current state:
- `BUILD-PLAN-v1.md` (57 tickets, Tier 0-5, ~74K)
- 7 new features (F41-F47) + 9 features (F32-F40) + 5 amendments need build tickets
- Tier 0 (foundational) needs design-system canon additions: 10 named curves, ESLint rules, variable Inter, speed CI gate, dark token additions, block primitives, security.txt
- Trust Center routes (Tier 1)
- /changelog (Tier 1)
- Cmd-K (Tier 2)
- State of AI Search 2026 (Tier 5 — MVP+90 production)

**Approach:**
1. Read BUILD-PLAN-v1 in full
2. Read PRD v4 amendments + F32-F40 amendments
3. Add ~25 new tickets (one per feature + amendment + canon item) with effort estimates
4. Re-tier: ensure design-system canon is in Tier 0 BEFORE feature work starts
5. Output BUILD-PLAN-v2.md (~95K)

**Spawn:** build-lead (sonnet), with explicit brief: "amend, don't rewrite — preserve v1 ticket numbers; new tickets append."

---

## OPTION C — Get Adam's confirmations + begin Tier 0 build

**Outstanding Adam-decisions:**
1. **R2-18:** State of AI Search timing — MVP+90 (research recommended) OR MVP launch (Stripe v2 alternative). PRD v4 has it as MVP+90; Adam can override.
2. **R2-19:** Composability scope at MVP — /reports + Workflow Builder Inspector only (Notion hybrid recommended) OR broader.
3. **8 prerequisites still owed by Adam (from prior session's handoff):**
   - Inngest account + signing/event keys
   - Supabase staging connection string + service_role_key
   - DNS access for notify.beamix.tech (DKIM/SPF/DMARC)
   - DPA indemnification cap confirmation
   - Tech E&O insurance binding status
   - Workflow Builder full-DAG editor at MVP (re-confirm)
   - GitHub OAuth App (CLIENT_ID + CLIENT_SECRET) for Git-mode
   - Confirm exactly 2 MVP verticals: SaaS + E-commerce

**If Adam confirms 1-3 above:** dispatch Build Lead → spawn workers → begin Tier 0 (design-system canon). The Tier 0 list:

- Add 10 named easing curves to `apps/web/src/styles/motion.css` + `tailwind.config.js`
- Add ESLint custom rules: `@beamix/no-shared-easing`, `@beamix/no-banned-status-synonyms`, `@beamix/server-only-pdf`
- Switch to variable Inter axis + subset Fraunces (40 chars) — saves ~140KB cold load
- Status vocabulary lock — `apps/web/src/lib/status-vocab.ts` + lint rule
- Dark token additions — 12 dark tokens in design system (deferred ship; canon now)
- Block primitive interfaces — `apps/web/src/blocks/types.ts` (18 primitives)
- Speed CI gate — `.github/workflows/speed-gate.yml` with Playwright + Lighthouse
- `/.well-known/security.txt` (RFC 9116) — `apps/web/public/.well-known/`
- Trust Center route group — `apps/web/src/app/trust/`
- Block list of cream-paper-stays-light surfaces in design system

These are independent and parallelizable across 4-6 workers.

---

## OPTION D — Another design pass (if Adam wants more design-board iterations)

Possibilities Adam might want next:
- **D1:** Design audit by an in-house designer simulator (not legend lens) — pressure-test the cleaned spec against "would you actually build this in 4 weeks?"
- **D2:** Specific surface deep-dives: redesign /home from scratch one more time; redesign Workflow Builder Inspector; redesign /scans cartogram drawer
- **D3:** Mobile-first audit of the entire spec corpus (currently desktop-leaning)
- **D4:** Hebrew (RTL) audit — Beamix targets Israeli SMBs primarily; full RTL pressure-test
- **D5:** Email design system — every Resend template designed (15 templates from prior PRD)
- **D6:** Onboarding edge case audit — what happens when Brief signing fails, when domain verification times out, when Twilio provisioning fails

**Spawn pattern:** if Adam picks D1-D6, dispatch 2-3 agents per pass; each ~3K-4K words.

---

## RECOMMENDED SEQUENCE (CEO recommendation)

If Adam doesn't specify a category:
1. **First:** Get Adam's confirmations (Option C, items 1-3) — they unblock Build
2. **Second:** Consolidate PRD v4 (Option A) — provides build-team source of truth
3. **Third:** Update Build Plan (Option B) — adds the 25 new tickets to v1
4. **Fourth:** Begin Tier 0 build (Option C, Tier 0 dispatch) — actual code shipping starts
5. **Fifth:** Hebrew/RTL audit (Option D4) before MVP — Israel is primary market; getting RTL right is hard

If Adam wants more pressure-testing first: Options D1-D6.

---

## DISPATCH STRATEGY (manage org usage budget)

The prior session used ~50% of org usage limit (no blocks hit). This session likely starts with similar budget.

**If Option A (PRD v4 consolidation):** 1 large product-lead agent (sonnet, ~12K word output)
**If Option B (Build Plan v2):** 1 build-lead agent (sonnet, ~10K word output)
**If Option C dispatch begins:** 4-6 worker agents in parallel (mostly sonnet, security-engineer for Trust Center)
**If Option D pressure-test:** 2-3 design-board agents (opus)

Stay under 6 parallel agents per dispatch wave. If usage limit hits: stop dispatch, complete what's returned, write checkpoint, defer remainder.

---

## CEO RESPONSIBILITIES (you)

1. **Pre-flight** (mandatory): read CLAUDE.md + the 7 master state docs above + auto-memory updates (Aria, State of AI Search timing)
2. **Set session identity:** `/color lime` (4th parallel CEO) and `/name ceo-prd-v4` or `ceo-build-tier0` based on chosen option
3. **Confirm with Adam** which option (A/B/C/D) to start with — or recommend the sequence above
4. **Synthesize after each agent returns** — don't wait for everything
5. **Commit + push + open PR + merge** at end of session per established pattern
6. **Update auto-memory** if anything cross-session-worthy emerges
7. **Write next handoff** in this format

---

## WHAT NOT TO DO

- Do NOT relitigate Round 1 / Round 2 / Round 3 design decisions — they're locked. Build on what exists.
- Do NOT relitigate Frame 5 v2 strategic positioning — confirmed by Arc + Notion pressure-tests.
- Do NOT relitigate the 23 Board 1 strategic decisions or the 5 Round 1 design board locks.
- Do NOT include timelines in plans (no Q1/Q2/Sprint-N — plan by scope + dependencies + quality)
- Do NOT add AI labels to any output
- Do NOT push to main directly — PR + merge flow
- Do NOT dispatch agents with prompts >2000 words (causes stalls)

---

## WHAT SUCCESS LOOKS LIKE

By end of next session:
- **If Option A+B chosen:** PRD v4 consolidated; Build Plan v2 complete; both merged to main
- **If Option C chosen:** Adam's 8 prerequisites + 2 R2-decisions confirmed; Tier 0 build begun (design-system canon + foundational routes shipped to staging)
- **If Option D chosen:** Additional design pressure-test outputs added to design corpus; new convergences synthesized
- New PR opened + merged
- Next handoff written

---

*End of handoff. Branch state pending PR merge. Next predecessor will be PR #54.*
