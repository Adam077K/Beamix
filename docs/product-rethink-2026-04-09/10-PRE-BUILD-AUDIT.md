# Pre-Build Audit Findings — 2026-04-17

**STATUS: DOCUMENTED — issues to resolve before/during build sprint.**

Audit conducted by 5 agents: Product gaps, Tech stress-test, Business model, UX conversion, Research validation.

---

## P0 — Launch Blockers

These must be resolved before or at the start of the build sprint. Any one of these can stall a worktree or break production.

1. **UX doc paywall section has old prices + trial refs** — `08-UX-ARCHITECTURE.md` still references 7-day trial and old pricing tiers. Fix in progress before worker briefs go out.

2. **Agent naming inconsistency** — Canonical name is **"Freshness Agent"** (not "Content Refresher"). All spec files, DB enums, UI strings, and prompt configs must use "Freshness Agent" consistently before build starts.

3. **Suggestions table + 15 automation rules not enumerated** — The rules engine is central to the Automation page and the proactive model. These 15 trigger-condition-action rules must be fully specced before the Home page and Automation page workers start. Missing spec = worker blocks.

4. **`plan_tier` enum migration required** — DB enum values must change: `starter → discover`, `pro → build`, `business → scale`. This is a 1–2 day migration that touches Paddle webhooks, RLS policies, and all feature gate checks. Blocks every worktree that touches billing or tier-gated features. Must run on staging first.

5. **Day-1 "dead dashboard" problem** — After payment, a new user lands on an empty dashboard with no data. The system must auto-trigger Query Mapper + paid scan + rules engine immediately on payment confirmation. This flow is not yet specced. Without it, the first impression is broken.

6. **DB migration must run on staging first** — The `plan_tier` enum rename and any schema changes from the rethink must be validated on a staging Supabase project before being applied to production. This is a hard dependency that blocks all worktrees touching auth, billing, or feature gates.

7. **Zero customer validation** — No problem interviews have been conducted. Run 5 problem interviews in Week 1 before finalizing the agent UX and onboarding flow. Validate: do SMBs understand "AI search visibility"? Do they connect it to business outcomes?

---

## P1 — Degrades Experience

These are not launch blockers but will result in visible product gaps at launch if not addressed.

8. **Empty states not spec'd** — Every page (Home, Inbox, Scans, Automation, Archive, Competitors) needs a defined empty state: what the user sees before any data exists, and what action they're directed to take.

9. **Free scan high-score user has no celebration state** — If a user scans and scores 80+, there is no acknowledgment. This is a key activation moment — needs a "you're already visible" message + suggested next actions rather than the default low-score optimization flow.

10. **Agent failure mid-pipeline UX undefined** — If an agent fails at step 3 of 5, the user experience is undefined. Define: does the run credit get refunded? Is there a retry UI? What does the Inbox card show?

11. **Haiku QA misses hallucinated citations ~25%** — Claude Haiku's QA stage does not verify that cited sources actually exist or contain the claimed information. Add Perplexity Sonar verification as a citation-check step in QA. Cost: ~$0.02/run. Required for any agent that outputs external citations (Content Optimizer, Authority Blog Strategist, FAQ Builder).

12. **Score drop empathy missing** — If a rescan shows a score drop, the current flow has no recovery messaging. Users need a "here's why + here's what to do" response, not just a number going down.

13. **Paddle checkout return route not built** — After a successful Paddle checkout, users must land on `/onboarding/post-payment` — not the generic dashboard. This route needs to: mark trial as converted, trigger Day-1 automation (see P0 item 5), and show a "you're in" confirmation screen.

14. **Kill switch ON — no global banner** — The kill switch for the scan engine exists in config but there is no global banner UI to display to users when it is active. Every page needs to check kill switch state and render a banner when enabled.

15. **No top-up mechanism** — Users who exhaust AI Runs have no way to buy more without upgrading their plan. Ship a **$19 / 10-run top-up pack** at launch. This is also a revenue signal: top-up demand = strong upgrade signal.

16. **Competitor alerts must ship MVP-1** — Without alerts when a competitor gains visibility, there is no retention hook between weekly scans. This feature is on the fence between MVP-1 and MVP-2 — it must ship in MVP-1 for retention.

17. **Hebrew prompts untested** — Agent prompts have not been tested in Hebrew mode. RTL layout and Hebrew-language outputs may behave unexpectedly, especially for structured outputs (schema, FAQ). Must be tested before Hebrew-market launch.

---

## Spec Contradictions Resolved

The following contradictions between spec files were identified and resolved. These decisions are canonical.

**C1. Off-Site Presence Builder tier + credits**
- Contradiction: Some docs listed it as credit-gated; others as free.
- Resolution: **FREE and unlimited with a daily cap.** This is the Board decision. Update all specs and feature gate code accordingly.

**C2. Blog Strategist on Discover tier**
- Contradiction: Pricing table in some versions included Blog Strategist in the Discover row.
- Resolution: **Blog Strategist is Build+ only.** Remove it from all Discover feature lists. Discover users do not have access.

**C3. Competitors page on Discover**
- Contradiction: Some specs excluded the Competitors page from Discover entirely.
- Resolution: **Discover gets full Competitors page with 3 tracked competitors.** Build gets 5, Scale gets 20.

**C4. Settings tab count**
- Contradiction: Specs ranged from 4 to 7 settings tabs.
- Resolution: **7 tabs.** Board decision is canonical. Spec the layout in `08-UX-ARCHITECTURE.md` before the Settings worker starts.

**C5. Daily caps per agent**
- Contradiction: Schema had 20/day; FAQ, Off-Site, and other sources had different numbers.
- Resolution (canonical):
  - Schema Generator: 20/day
  - FAQ Builder: 3 (Discover) / 5 (Build) / 10 (Scale) per day
  - Off-Site Presence Builder: 3 / 5 / 10 per day
  - Performance Tracker: unlimited

---

## Business Decisions

Decisions made during audit review that affect product scope, pricing, and build priorities.

**B1. English expansion timeline**
Israel alone cannot sustain break-even at current pricing. English-market expansion must begin by month 2. Plan the codebase for EN-first with HE as a locale from day 1 — do not treat Hebrew as the primary and English as a translation.

**B2. Monthly-only launch**
No annual pricing at launch. Ship monthly-only for 60 days. Introduce annual pricing only after usage data shows retention justifies the discount. This simplifies Paddle config and avoids locking users into a discount before value is proven.

**B3. $19 top-up pack at launch**
10 AI Runs for $19. Must be available at launch, not post-launch. This is both a revenue stream and a behavioral signal for upgrade conversion. Instrument all top-up purchases from day 1.

**B4. Instrument limit-hit events from day 1**
Every time a user hits an AI Run limit, a plan tier limit, or a feature gate, fire a tracking event. This data drives upgrade email sequences and surfaces high-intent upgrade candidates. Do not defer this instrumentation to post-launch.

**B5. Performance Tracker — directional claims only**
Performance Tracker output must use directional language: "trend observed," "visibility appears to have improved," not "your score increased by X% due to this action." LLM-attributed causation is not reliable. Copy and prompts must be written accordingly.

---

## Content Output Policy

This policy applies to all 11 agents and all content they produce.

- **No AI disclosure markers in agent-generated content.** Output reads as professional, human-quality work. No "drafted with AI assistance," no AI footers, no disclosure language in the content itself.
- **"Assisted not autopilot"** — Beamix assists the user, who is the author. The user reviews, edits, and publishes. The user bears responsibility for what they publish.
- **Settings tooltip** — A single disclosure note in Settings explains that AI tools assist content creation. This is the only place disclosure appears. It does not appear in content output.
- **EU AI Act Article 50** — The obligation to disclose AI-generated content to end readers falls on the publisher (the user), not the tool (Beamix). Beamix's obligation is to inform users of the tool's nature — satisfied by the Settings tooltip.
- **Action required:** The Authority Blog Strategist prompt previously included an "AI disclosure footer" instruction. **Remove it.** See `07-AGENT-ROSTER-V2.md` — no disclosure language in any agent prompt or output template.

---

## Technical Risks

Risks identified during the tech stress-test. Each has a mitigation action.

**T1. Prompt caching through OpenRouter**
OpenRouter may not pass through Anthropic's prompt caching headers correctly. If caching is broken, per-run costs increase 3–4x for long system prompts. Test on day 1 of build — verify cache hit rates in Anthropic dashboard.

**T2. Supabase Realtime — 200-connection limit**
The Inbox real-time update model could exhaust Supabase Realtime connections at scale (200 concurrent connection limit on free/pro plan). Start with polling (5-second interval) rather than persistent websockets. Migrate to Realtime only after validating connection usage at 100+ concurrent users.

**T3. Inngest fan-out — concurrency risk**
Multi-agent runs (e.g., Query Mapper triggering Content Optimizer + FAQ Builder simultaneously) can fan out to many Inngest function executions at once. Add concurrency keys per business ID and stagger dispatch with a 2-second delay between fan-out steps. Define `concurrencyKey: businessId` on all agent functions before launch.

**T4. Inline chat editor — first to cut**
The Freshness Agent inline chat editor for content editing is the highest-complexity UI component in the sprint. If time runs short, this is the first feature to cut and replace with a simpler textarea diff view. Do not block the Freshness Agent ship on the chat editor.

**T5. Agent pipeline latency (15–60s)**
Full 5-step agent pipelines take 15–60 seconds depending on model and output length. The UI must show a meaningful progress indicator at each pipeline stage (PLAN → RESEARCH → DO → QA → SUMMARIZE), not a generic spinner. This is a required UX component, not optional polish.

---

## Research Updates (April 2026)

**Google AI Overviews / Gemini 3**
Google AI Overviews has migrated to Gemini 3 as its underlying model. Early data shows increased citation of long-tail content and niche topic coverage. This is favorable for Beamix's content optimization strategy — clients targeting specific local queries should see faster citation gains.

**EU AI Act Article 50 — August 2, 2026 enforcement**
Article 50 of the EU AI Act requires disclosure when AI-generated content could be mistaken for human-authored content in certain contexts. Enforcement date: August 2, 2026. Obligation falls on the publisher (user), not the tool provider (Beamix). See Content Output Policy above. Monitor EU guidance updates through launch.

**Haiku hallucination rate — citation verification**
Claude Haiku's QA step misses hallucinated citations approximately 25% of the time in internal testing. Adding Perplexity Sonar as a citation verification step in the QA stage is confirmed as the correct mitigation. Cost is ~$0.02 per run — acceptable given the citation accuracy requirement for GEO content. Add to QA pipeline for Content Optimizer, Authority Blog Strategist, and FAQ Builder.

---

## Build Order (from Build Lead stress test)

Execute in this order. Earlier waves block later ones.

| Wave | Tasks | Parallelism |
|------|-------|-------------|
| **Wave 0** | DB migration (`plan_tier` rename + schema corrections) + type generation | Sequential — must complete before anything else |
| **Wave 1a** | Agent config rewrite (11 agents — prompts, model routing, pipeline steps) | After Wave 0 |
| **Wave 1b** | Sidebar + layout shell + navigation | After Wave 0, parallel with 1a |
| **Wave 1c** | Inngest functions (automation triggers, agent-execute, scan-free, scan-manual) | After Wave 0, parallel with 1a/1b |
| **Wave 2a** | Home page (dashboard summary, score, suggestions, Day-1 empty state) | After Wave 1 complete |
| **Wave 2b** | Inbox page (3-pane layout, Inbox items, approval flow) | After Wave 1 complete, parallel with 2a |
| **Wave 2c** | Scans page (scan history, rescan trigger, before/after delta) | After Wave 1 complete, parallel with 2a/2b |
| **Wave 3a** | Automation page (rules engine UI, suggestion cards, schedule config) | After Wave 2 complete |
| **Wave 3b** | Archive + Competitors pages | After Wave 2 complete, parallel with 3a |
| **Wave 3c** | Billing / Paddle integration + paywall enforcement + top-up pack | After Wave 2 complete, parallel with 3a/3b |
| **Wave 4** | Settings (7 tabs) + Email / Resend templates | After Wave 3 complete |

**Critical path:** Wave 0 → Wave 1 (all three) → Wave 2 → Wave 3 → Wave 4.

Do not start any Wave 1 worker until the DB migration is applied on staging and `database.types.ts` is regenerated.
