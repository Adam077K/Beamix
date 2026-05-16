# Audit Lens — Product / UX / Business Coherence

Audit date: 2026-05-13
Scope: 11 build-prep files + `05-BOARD-DECISIONS-2026-04-15.md` / `06-PRICING-V2.md` / `07-AGENT-ROSTER-V2.md` / `08-UX-ARCHITECTURE.md` / `03-PRODUCT-VISION.md`
Lens: end-to-end customer journey of a Tel Aviv lawyer Googling "AI search visibility", landing on Framer, scanning, signing up for Build, running first agent. Does the spec compose?

---

## Customer-journey gaps (P0 conversion / activation risks)

### CJ-1. The "lawyer" persona is explicitly excluded — but no spec catches this at the funnel level
`05-BOARD-DECISIONS-2026-04-15.md` §Safety, §MVP vertical exclusions:
> "Medical diagnostic, law-advisory, financial advisory, regulated Israeli professions. These verticals are excluded from MVP launch."

But the funnel (`14-SCAN-UX-SPEC.md` / `04-EMPTY-STATES.md` / `06-ADAM-CHECKLIST.md`) has **no industry gate**, no copy that surfaces exclusion before payment, no signup-time refusal. A Tel Aviv lawyer who completes the scan, signs up for Build, and pays $189 will then hit YMYL hard-refuses on every content agent. Result: paid customer with a useless product → refund. The persona used in the user prompt is literally a refund event.
**Fix needed:** Pre-scan industry-select must flag excluded verticals before the scan completes (or before paywall), and the result page needs alternate copy ("we don't currently cover legal — join waitlist").

### CJ-2. Free-scan industry input is captured but never used to gate
`05-BOARD-DECISIONS-2026-04-15.md` line 207 specifies pre-scan form asks for industry. But `14-SCAN-UX-SPEC.md` and Wave 1 Frontend Worker 2 brief do NOT specify what happens when industry === "legal/medical/financial". Nothing in `04-EMPTY-STATES.md` covers the "excluded-industry result page" — the spec defaults to either wound-reveal or high-score. There is a hole between board decision (exclude) and execution (no gate).

### CJ-3. Free scan → Paddle path has TWO different conversion paths that fork the activation experience
- `08-UX-ARCHITECTURE.md` §4 step 4: "Explore the product first" → Preview mode → paywall trigger on "Run Agent"
- `03-DAY-1-FLOW.md`: "Fix this now → Paddle checkout" → `/onboarding/post-payment` → 60–120s Day-1 chain
Two completely different first 10 minutes. The "explore first" path skips the Day-1 chain entirely — a preview user who later upgrades from inside the dashboard does NOT get the Day-1 dead-dashboard cure spec'd in `03-DAY-1-FLOW.md`. Result: the bug `03-DAY-1-FLOW.md` was designed to fix (dead dashboard post-payment) **comes right back** for the "explore first → upgrade later" cohort, which is plausibly half the funnel. The Day-1 chain must also fire on a Discover→Build (or preview→paid) upgrade, not just first-payment. The spec says "no Day-1 chain on tier change" (§Existing-subscriber day-1) — but preview→paid IS first-payment, not tier change. Edge case undefined.

### CJ-4. Sign-up auth method is unspecified anywhere
`08-UX-ARCHITECTURE.md` says "Auto-create Supabase account (email capture or magic link)". `07-WAVE-0-BRIEF.md` says `(auth)/login/page.tsx` is a placeholder. No spec decides: passwords? magic link? OAuth? Email confirmation required? A Tel Aviv user with Hebrew keyboard typing a password may abandon. No friction analysis. This belongs in `14-SCAN-UX-SPEC.md` or a Wave 1 brief — currently nowhere.

### CJ-5. The Day-1 chain assumes the user waits on `/onboarding/post-payment` for 60–120s
What if the user closes the tab? `03-DAY-1-FLOW.md` says "Resume from current state" (idempotent) — but does NOT specify what email/notification reaches the user when their workspace finishes setup async. A user who closes the tab and gets no "Your workspace is ready" email may never return. The `welcome-onboarded` Resend template (Step F) fires regardless, but the trigger is at completion, not at session-resume, and the template content doesn't account for "user already saw the dashboard". Spec gap.

### CJ-6. Lawyer + Hebrew: free scan form has NO Hebrew-language toggle in the spec
The free scan page is the FIRST product surface. `14-SCAN-UX-SPEC.md` (per Wave 1 brief) covers the spec but Hebrew/RTL is Wave 2 (`10-WAVE-2-BRIEF.md` Worker 1). The acquisition surface for the primary market (Israel) ships English-only at launch. An Israeli lawyer's first impression is English; if the Framer marketing site is Hebrew, the language jump is a friction point. Conversion risk: meaningful.

---

## Coherence issues (specs that say different things about the same surface)

### CO-1. "Agents" naming and visibility — two policies fight
- `05-BOARD-DECISIONS-2026-04-15.md` line 467: "Agent names internal only. Users see action labels. 'GEO' never shown. Use 'AI Search Visibility.'"
- But `04-EMPTY-STATES.md` line 198: "Refine top queries — **Freshness Agent** schedule"
- And `09-WAVE-1-BRIEF.md` Inbox UI: "Card title: {{agentDisplayName}} — Run failed at {{stage}}"
- And `07-AGENT-ROSTER-V2.md` agents are referred to by name throughout user-facing copy
This is a board-locked decision that is **not enforced anywhere in the build-prep**. Workers will ship "Freshness Agent" labels in the UI because every brief uses them. Conformance to the "action labels only" policy requires a name-mapping table that does not exist. **Add a `USER_FACING_AGENT_LABELS` map** to Wave 0.5 shared types, or workers will ship the wrong copy.

### CO-2. Suggestion ranking: top 3 on Home, but ranker outputs 1 on Day-1
`02-AUTOMATION-RULES.md` says: Day-1 special case = top-1 immediately, +2 unblocked after 60s. `03-DAY-1-FLOW.md` Step E confirms this. But `08-UX-ARCHITECTURE.md` §3 Home says "top 3 suggestions, ranked by estimated impact" — no mention of the 60s reveal staging. A frontend worker reading only `08-UX-ARCHITECTURE.md` (which is on the required-reading list) will NOT know to implement the staged reveal. The Wave 1 Worker 1 brief mentions Day-1 empty state but not staged reveal animation. **Spec inconsistency that will surface as a UI bug.**

### CO-3. Discover tier sees "1 suggestion" vs "1 fully visible, rest blurred"
- `02-AUTOMATION-RULES.md` §Discover-tier modifier: "Discover users see only 1 suggestion fully (rest blurred behind paywall)."
- `04-EMPTY-STATES.md` §Discover paywall blur: "Score and 1 suggestion visible. Suggestions 2–3 rendered behind frosted `<PaywallGate>`"
- `08-UX-ARCHITECTURE.md` §3 Home: "Discover (free preview) sees score + 1 suggestion, rest blurred with paywall prompt"
Three sources agree only 1 is visible. Discover at $79/mo paying customer sees 1 suggestion / week. **Is that enough value?** Build at $189 sees 3 suggestions / day (scan cadence daily). Discover's value-per-dollar is dramatically lower than Build's. This is intentional anchoring but the spec doesn't tell us **how many actionable items a Discover user gets per month** — likely 4 (weekly scans × 1 suggestion each) on Discover vs 21 (daily × 3) on Build. That's 5x activity gap for 2.4x price. Discover may feel crippled-demo despite the "real value, not crippled" rule (`06-PRICING-V2.md` line 148).

### CO-4. Discover's Authority Blog Strategist is "locked", but R15 (Authority Blog rule) lists tiers `Build, Scale` — what does a Discover user see when R15 fires?
`02-AUTOMATION-RULES.md` R15: "Tiers: Build, Scale". The rule's `tierAvailability` filter drops the rule entirely. But the ranker comment says "tierAvailability: 0.0 otherwise (rule dropped)". So a Discover user **never sees** an Authority Blog suggestion. But the upgrade pitch ("upgrade to unlock Blog Strategist") requires the user to know what they're missing. Spec gap: how does the upgrade prompt know what's gated? The `<PaywallGate>` shows "Upgrade to Build" but the **content of the missed suggestion is invisible to Discover**. The motivational asymmetry is wrong — Discover doesn't know what they'd unlock.

### CO-5. Inbox polling vs Supabase Realtime — two specs
- `08-UX-ARCHITECTURE.md` §6: "Supabase Realtime: Inbox subscribes to new item inserts — no polling."
- `01-P0-RESOLUTIONS.md` T2: "Wave 1 Frontend Worker 1 implements `useInboxPolling()` at 5-second interval as default; Realtime is opt-in via env flag until 100+ concurrent users verified."
Build-prep overrides the source-of-truth spec — but `11-START-HERE.md` says "the source-of-truth specs win". A worker following the priority rule literal will ship Realtime, not polling. **Decision needs to be ratified explicitly** or workers will fight over which spec applies.

### CO-6. "AI Runs" vs "Actions" vs "Credits" — three names alive at once
`05-BOARD-DECISIONS-2026-04-15.md` line 468: "'AI Runs' → consider 'Actions' or 'Credits'". `06-PRICING-V2.md` uses "AI Runs". `02-AUTOMATION-RULES.md` calls it `creditCost`. UI copy in briefs uses "credits" ("Run all — N credits"). No final decision. Workers will ship inconsistent labels.

### CO-7. Inline chat editor — "cuttable" per `01-P0-RESOLUTIONS.md` T4, but `05-BOARD-DECISIONS-2026-04-15.md` lists it as the canonical Freshness Agent UX
The Freshness Agent's differentiator is the inline chat editor. T4 says ship textarea-diff first, upgrade-if-time. If it's cut, Freshness Agent has no UX moment — it's just "another content agent". Removing the moat-feature of the only agent that has one. Adam should know "ship textarea-only" means the Freshness Agent loses its hook.

### CO-8. Wave 0 spawns 3 workers, but Worker 2 (agents) is "blocked by Worker 1". That's 2 parallel, not 3.
`07-WAVE-0-BRIEF.md` says "Deploy 3 workers in parallel worktrees" but Worker 2 "Blocked by: Worker 1". Worker 3 (frontend) is not blocked on Worker 1 (it builds against placeholder types). Actual parallelism is 2 (Workers 1 + 3), then 1 (Worker 2 waits for `database.types.ts`). Not a coherence bug, just an estimation issue — Wave 0 is longer than planned.

---

## Pricing/value-step concerns

### PV-1. Discover → Build is the WRONG value-step shape
Math on activity volume (the user-facing metric):
- Discover: weekly scan × 1 visible suggestion = **~4 active items/month**, 25 AI Runs (most users will not exhaust them given gating), 3 competitors, 15 queries.
- Build: daily scan × 3 suggestions = **~90 active items/month**, 90 AI Runs, 5 competitors, 50 queries, +Authority Blog Strategist, +daily cadence.
**Activity bump: ~22x for 2.4x price.** Coverage bump: 2.3x engines (3→7), 3.3x queries (15→50). This is NOT a 3.5x value bump — this is a "Discover is unusable, Build is the real product" structure. Either Discover is sandbagged (looks-like-trap) or Build is over-delivering at $189. The pricing v2 spec calls Discover the "not sure yet" tier — accurate; it's a probation tier, not a real plan.

### PV-2. Build → Scale step is a soft cliff
Build → Scale: 2.6x price ($189→$499). Increment:
- Engines 7→9 (+2)
- Queries 50→200 (+150)
- AI Runs 90→250 (+160, 2.8x)
- Competitors 5→20 (4x)
- Schedules: 3 → unlimited
- Authority Blog cap: 20→40 posts/mo
- History retention: 6mo → 24mo
- Daily refresh on competitors, bulk approve, CSV/JSON export
For an SMB on Build that publishes 5–10 posts/mo, the Scale increment is largely unused; the spend is luxury-bracketed. The **Scale ROI sentence** ("replacing $3,000+/mo agency fees") works on cognitive anchor, not actual SMB usage. Scale will convert primarily on agencies-managing-multiple-clients, not on SMBs. **Risk:** the spec assumes Scale converts SMBs; the price ladder converts agencies. The product is not built for agencies (no client-switching, no white-label per-account — though white-label is per-CLIENT per memory, this is hinted but not specced in MVP).

### PV-3. The $19 top-up creates a perverse incentive against upgrade
Build user on 90 runs: hits 100% in week 3 → buys $19/10 runs → has 100/mo for $208 = effective $208/mo. Next month same → $208 again. Scale at $499 buys 250 runs. The break-even is at $499 − $189 = $310 / $19 per pack = 16 top-up packs → 160 extra runs needed before Scale beats Build+top-ups. Heavy Build users will rationally never upgrade. Pricing v2 does not model this — it should cap top-up purchases per month (e.g., 3 packs max) to force the upgrade decision, or the Scale tier loses its conversion path from heavy Builds.

### PV-4. NIS ceiling is solved for Build, ignored for Scale
Build at $189 ≈ NIS 680 — under Yael's NIS 700 self-approval limit (intentional). Scale at $499 ≈ NIS 1,795 — well above any SMB self-approval ceiling. Israeli Scale conversions require explicit business-owner approval, **which the product does not facilitate** (no "send to approver" flow, no shared seat/multi-user). Scale is an Adam-only sale in Israel.

### PV-5. Annual pricing is shipped Day 1 per board update 2026-04-17, but `07-WAVE-0-BRIEF.md` and `09-WAVE-1-BRIEF.md` say monthly-only at launch with annual deferred
- `05-BOARD-DECISIONS-2026-04-15.md` Updates 2026-04-17 §Annual Pricing: "Ship with annual pricing from day 1"
- `06-ADAM-CHECKLIST.md`: "Discover annual — $63/mo billed annually" (price IDs required)
- `09-WAVE-1-BRIEF.md` Frontend Worker 3 paywall: "monthly-only (annual deferred per B2)"
- `10-WAVE-2-BRIEF.md` Post-Launch: "Month 2: introduce annual pricing (board decision B2)"
**Spec contradiction.** The April 17 decision overrides B2. Build-prep didn't catch the update. Paddle products are being created for annual, the paywall isn't wiring them in. Either Adam creates 4 Paddle products instead of 7, or the paywall ships annual support — pick one.

---

## Quality-bar specificity gaps (places workers will under-deliver)

### QB-1. "Notion warmth + Vercel polish" is not a falsifiable spec
`08-UX-ARCHITECTURE.md` says brand tokens (#3370FF, Inter, etc.) but the Wave 0 brief points workers to https://getdesign.md/vercel/design-md as the "visual baseline reference". Vercel's design-md is precise (motion easing, hover states, sharp-edge geometry). Notion is the opposite (rounded, soft, warm-coloured surfaces). The brand brief in MEMORY (CLAUDE.md project state) says "billion-dollar feel" but nowhere does the spec resolve Vercel-tight vs Notion-warm. Workers will pick one or hybridize awkwardly. **The visual decision needs to be made before Wave 1 frontend workers spawn**, not assumed.

### QB-2. "Notion warmth" example never appears in `13-DESIGN-SYSTEM-SPEC.md` (not read in this audit, but `_patterns.md` is supposed to be a 1-page summary)
The Wave 1 design-lead prep is a "1-page reference" produced in 2 hours, supposed to cover motion presets, illustration approach, accent token usage. **A 1-page reference cannot specify the difference between Vercel-cold and Notion-warm with enough fidelity to guide 3 frontend workers in parallel.** Either the design-lead prep is longer (10-page system) or workers will diverge.

### QB-3. Empty-state illustrations are "simple inline SVGs for now; design-lead can refine later"
`07-WAVE-0-BRIEF.md` Worker 3 §6: simple SVGs as placeholders. The 9 illustration variants are spec'd in `04-EMPTY-STATES.md` with prose descriptions ("line art of an empty desk with a soft glow on the chair"). At billion-dollar quality bar, simple SVGs ≠ category-defining empty states. Linear/Stripe ship custom illustrated empties. The "refine later" defers a quality moment to a wave that may never happen.

### QB-4. Score animation, sparkline, suggestion-card spring — three "polish" surfaces, no concrete spec
`09-WAVE-1-BRIEF.md` Frontend Worker 1 says "animated counter, 8-week sparkline, delta pill" — no spring config, no easing curve, no example. `10-WAVE-2-BRIEF.md` Worker 4 §3 "tune any spring that feels off" — this is the gate, two waves later. **Two-pass UI polish for a billion-dollar feel is too few.** The spec needs a "Motion Library" output from design-lead before Wave 1.

### QB-5. No spec for the "first time the score updates" moment
`08-UX-ARCHITECTURE.md` §9 hook 3 ("You shipped something" confirmation) is named but not designed. What's the moment? Modal? Toast? Confetti? Full-screen takeover? Linear-style? The retention hook copy exists; the visual moment doesn't. If the moment is a toast, retention impact is near-zero.

### QB-6. Inbox 3-pane on mobile = single column. Spec says "tap → full screen → swipe to approve/reject."
This is the daily-driver screen. Tap-and-swipe on mobile while approving 3 drafts in a coffee shop is the **canonical use case**. No spec for swipe physics, no spec for what happens after the last item, no spec for offline behaviour. Workers will ship vanilla.

---

## Retention loop concerns

### RL-1. The three named retention hooks (`08-UX-ARCHITECTURE.md` §9) don't compose into a weekly habit
1. Score timeline → passive
2. Competitor loss alert → weekly email (Build), in-app (Scale)
3. "You shipped" confirmation → triggered by user action, not by product
Hook #1 is observational, not action-driving. Hook #2 fires weekly but only when a competitor moves. Hook #3 requires the user to act first. **None of these pull the user back daily.** The Inbox unread badge is the real daily hook — but it depends on Inbox having items, which depends on scheduled runs producing drafts. For Build users (daily scans, daily potential drafts), this should work. For Discover (weekly scans), Inbox produces ~1 item/week → opening 5x in week 1 is implausible.

### RL-2. Weekly digest is sent at 7am — fire-and-forget. No re-engagement ladder.
`08-UX-ARCHITECTURE.md` §8: "Daily digest 7am" + "Email max 1/day". `09-WAVE-1-BRIEF.md` Backend Worker 3 implements this. There is no re-engagement spec for inactive users (no "you haven't logged in in 7 days" email, no "you have 3 unread drafts" nudge). The notification system caps at 1 email/day with no escalation for inactivity. **Churn signal: no spec.**

### RL-3. Score updates take 4 weeks for first citation (`08-UX-ARCHITECTURE.md` §10 Expectations Timeline)
"Week 1–2: Activity indicators only. Week 3–4: First citations on Perplexity + Gemini." A Build user paying $189 sees no score movement for 14–28 days. The 14-day money-back window CLOSES at day 14 — the user has not yet seen a citation when they decide whether to refund. **The refund decision is made BEFORE activation evidence exists.** This is the single biggest churn risk in the spec.

### RL-4. No "Adam's WhatsApp / human concierge" fallback for first 100 users
For Israeli market, personal-touch onboarding from the founder is a churn-blocker. No spec mentions a manual high-touch layer for early customers (e.g., founder check-in at Day 3 / Day 10). The product is being designed as if it's at 1,000 customers, not 5.

---

## Activation moment

### AM-1. The activation moment is at best WEEK 4 (first citation appears). The refund window closes at DAY 14. This is the central business risk in the spec.
- Day 1: 3 suggestions appear (not activation — utility unproven)
- Week 1: First content published (effort spent — also not activation)
- Day 14: Refund window closes
- Week 3–4: First citation appears on Perplexity/Gemini (activation)
- Week 8: ChatGPT shifts begin
- Month 3: Real score movement

**Concrete activation moment per the spec: a Performance Tracker delta that says "Your mention rate on Perplexity went from 0 → 2 queries this week."** That can plausibly happen at week 3.

**Churn-before-activation risk is structural.** Three possible mitigations not in the spec:
- (a) Shorten time-to-first-signal by including a "leading indicator" panel from day 1 — `08-UX-ARCHITECTURE.md` §Decisions Added 2026-04-17 hints at "Leading indicators shown early (content published, actions completed, citations detected)" but no UI spec exists. This is the single most important missing UI surface.
- (b) Extend the refund window to 30 days. The spec keeps 14.
- (c) Have a "concierge week" where Adam personally walks Build users through their first 3 suggestions.

The spec implements neither. **Conversion → activation → retention is the central unsolved problem.**

---

## Strong points (what holds together — sanity check)

- **Day-1 chain is well-specified.** `03-DAY-1-FLOW.md` has UI states, polling endpoint, failure modes, DB columns, E2E test. This is genuinely shippable.
- **15 automation rules are concretely enumerated** with trigger/condition/impact/cooldown/cost — workers can encode 1:1.
- **The empty-state taxonomy** in `04-EMPTY-STATES.md` is more complete than most products ship with at v1 — it covers failure cards, tier-locked, high-score celebration, day-1 setup.
- **The "high-score celebration" P1-9 fix** is correct — it converts to retention ("Stay ahead") not churn ("I'm fine, why pay?"). The spec is good here.
- **Cross-spec validation:** `04-EMPTY-STATES.md` Day-1 state and `03-DAY-1-FLOW.md` Day-1 chain match. The UX state names line up. Workers will not drift between them.
- **The hard-reset decision** simplifies migration risk dramatically. The DB plan is clean.
- **Worktree discipline + JSON returns + QA gates** are repeatedly enforced — the autonomous-army layer is unusually solid.
- **No timeline pressure in the briefs** (per `feedback_no_timeline_planning.md` memory) — quality bar is preserved over speed bar.

---

## Suggestions ranking surface area

### SR-1. Top 3 on Home, remainder on Inbox under "Pending" filter (`02-AUTOMATION-RULES.md` §Ranking)
Inbox is "the central review queue for agent-produced **content**" (`08-UX-ARCHITECTURE.md` §Inbox). Mixing suggestion cards (pre-run) with content drafts (post-run) in one filter is conceptually confused. A user doesn't think "let me check pending suggestions in my Inbox" — Inbox is where APPROVALS happen. **Suggestions belong on Home or in a dedicated `/suggestions` route.** Current spec creates a UI ambiguity that workers will resolve differently.

### SR-2. 15 rules, cooldowns 3–90 days. Will 3 fresh suggestions appear weekly?
Modeling: for an active Build user with content published, plausible fresh suggestions per week:
- R03 score drop: rare, maybe once/month
- R04 competitor gap: every 7 days if movement exists
- R05 citation-thin page: every 21 days per URL → ~1/week across all URLs
- R09 competitor movement: every 7 days per competitor → ~5/week for Build (5 competitors)
- R12 query re-map: every 60 days
- R13 engine coverage gap: every 21 days
- R14 brand mention drop: every 7 days

Plausible weekly fresh-suggestion count: 5–8 once steady state is hit. **Sufficient.** But for a new account in week 1, only R02 (schema missing) and R10 (Wikidata gap) reliably fire on Day 1. The risk is **week 2**: scan didn't produce new score drops or competitor moves yet, and most rules are on 7+ day cooldowns. **Week 2 may be the suggestion-dry week**, which is also the week after refund-window closes — bad timing.

### SR-3. Discover sees 1 suggestion (rest blurred). With weekly scans → 1 suggestion every 7 days. Discover dashboard is functionally dead Mon–Fri.
This is the same point as PV-1 but UX-side: a Discover user who pays $79 logs in mid-week and sees the same single suggestion they saw Monday. **No reason to open the dashboard 5x.** Discover may churn at week 2.

---

## Conversion narrative (free scan → paid)

### CN-1. The 8-blurred-fixes hook is a wound-reveal that works for low scores; for high scores the spec correctly pivots to "stay ahead" (P1-9). But:
- The high-score state assumes ≥80. Likely <30% of free scans hit this.
- The wound-reveal assumes <80. For scores in the 50–80 range, the wound is real but not dramatic. The "3 visible + 8 blurred" pattern needs to hold up at score 65 ("not winning, not losing") — and no spec covers what the 3 visible fixes say for mid-range scores. Workers default to generic copy.

### CN-2. Closing the tab during email gate — no spec
The email gate is "soft gate on result page at 20s; hard gate on Explore CTA". Closing the tab returns the user to nothing. No "we saved your scan, here's a link to come back" email. The scan was paid for ($0.045 COGS) and lost. At a 1% conversion rate, every abandoned scan is a marketing-CAC leak. **The spec needs a "scan-saved + retrieve-by-email" fallback** if the user does not complete the email gate within X seconds.

### CN-3. "Fix this now" vs "Explore the product first" — preview path strips Day-1 chain (see CJ-3)
The two-path funnel splits conversion psychology: high-intent users click "Fix this now" (good); low-intent users click "Explore first" (a discovery path). The preview-mode user converts later from within the dashboard — but, as flagged in CJ-3, this path doesn't fire Day-1 chain. The lower-intent cohort that needs more activation help **gets less activation help**. Inverse of what we want.

---

## Hebrew-market fit

### HM-1. Build at $189 ≈ NIS 680 — under Yael's NIS 700 ceiling (intentional). Good. But Paddle in Israel:
- Paddle supports cards only, no Israeli direct-debit (Hora'at Keva), no Bit, no PayBox, no Israeli card-specific flows.
- For Hebrew-speaking SMBs, "credit card monthly subscription" is culturally less common than for US/EU SMBs (B2B in Israel runs on `Hora'at Keva` direct debit).
- Spec does not mention this limitation anywhere.
- The Hebrew GTM (per board) is primary market — and the payment rail is unaligned with primary-market habits. **Conversion-rate ceiling on Israeli market is structural until Israeli payment rail is added.**

### HM-2. Hebrew shipping in Wave 2 means launch product is English-first for Israeli market
Acquisition surface (Framer site) likely supports Hebrew; product surface launches English. The hand-off is broken at the most-friction-sensitive moment. The product launches with **mismatched language between marketing and product** for the primary market. Adam should know.

### HM-3. Hebrew prompt eval is "1 golden case per agent" in Wave 2 Worker 1
That's 11 evals total. The English eval is 5 cases per agent = 55 evals (`07-AGENT-ROSTER-V2.md` Pre-Launch Evaluation Criteria). Hebrew gets 1/5 the rigor for the primary market. Output quality on Hebrew will be lower at launch. Spec acknowledges this implicitly (Wave 2 placement), but doesn't accept the consequence: Israeli users get worse content.

---

## Onboarding info-density

### OD-1. Day-1 produces 3 suggestions + first agent run + Inbox draft + score chart + scan history page. Is this overwhelming?
For a power user: about right.
For an SMB owner who paid $189 on impulse from the wound-reveal: probably overwhelming. There is no "guided tour" overlay spec'd. The user lands on `/home` and sees:
- Score hero with sparkline
- 3 suggestion cards (one delayed by 60s, animation)
- Inbox preview (3 drafts after Day-1 agents fire)
- Automation status strip
- Recent activity
- Notification bell with unread

That's 5+ live surfaces on first impression. `08-UX-ARCHITECTURE.md` §Decisions Added 2026-04-18 §Guided Step-by-Step Path: "Home suggestions as numbered sequential steps with progress bar. Not unordered suggestion cards." — **this decision is not echoed in build-prep at all.** The Wave 1 brief specs "Top-3 suggestions list" not "numbered sequential steps with progress bar". Another lost board decision.

### OD-2. Simplest "alive" state would be: score hero + 1 numbered suggestion with progress + "what we're doing right now" panel
That's the board-decided "guided step-by-step path" (April 18). Build-prep doesn't carry it forward. **This is the highest-priority decision drop.**

---

## Conversion readiness verdict (300-word summary follows)

The plan is internally consistent at the wave-orchestration layer but has structural holes at the funnel and activation layers. The Day-1 chain is good engineering work pointed at the wrong moment — activation happens at week 4, not Day 1. The spec implicitly bets that "Day-1 wow" → "week 14 refund window" → "week 4 first citation" is a survivable sequence. It is not, without a leading-indicator surface that does not exist.

Top three product/UX risks:
1. **Excluded-vertical funnel leak** (lawyer persona — the literal user-prompt persona — converts and refunds).
2. **Activation-after-refund-window** (refund decided at day 14; first citation appears day 21–28).
3. **Day-1 chain bypassed by preview→paid path** (the cohort that needs the most help gets the least).

Top business/pricing risk: **Discover tier offers ~1/22 the activity of Build at ~1/2 the price → either Discover is sandbagged into churn or Build is over-delivered.** The price step is wrong-shaped.

Three lost board decisions that should be re-surfaced before Wave 1 spawns:
- "Agent names internal only / GEO never shown" — not enforced anywhere
- "Guided step-by-step suggestions with numbered progress bar" — Wave 1 brief uses unordered cards
- "Annual pricing day 1" — Wave 1 brief still says monthly-only

Conversion readiness: **Yellow.** Spec is shippable but conversion economics are over-optimistic. Activation gap is the single largest risk. Fix the lost-board-decision drift + add a leading-indicator surface + extend the refund window OR add a Day-3 founder-touch ritual, and the plan is green.

---

*Audit complete · 2026-05-13 · scope: 11 build-prep files + 5 source-of-truth specs*
