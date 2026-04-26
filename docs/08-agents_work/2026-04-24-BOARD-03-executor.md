# Board Seat 3 — The Executor Critique
Reviewer persona: Engineering manager, ship-or-die
Date: 2026-04-24
Subject: Design Direction v2 — 12–14 week motion-first plan

---

## 1. WHAT V2 GETS RIGHT (execution-wise)

**Phase 0 is real.** The 10 quick-win fixes are correctly scoped. They are small, non-architectural, and some of them (InterDisplay, sidebar color, filter chip blue) are genuinely 30-minute jobs. If Phase 0 is the only thing that ships this sprint, Beamix looks meaningfully more professional. This is the only phase where the doc's timeline estimate holds.

**Motion library choice is correct.** Framer Motion (Motion package) is already in the repo. No new dependency risk. The 5 signature motions are described as reusable React components with clear props — `<ScoreGaugeFill score={n} />`, `<AgentPulse isActive={bool} />`. That is shippable component design. A frontend developer can build 3 of the 5 motions without touching the scan API or Rive.

**Rive is isolated.** The doc correctly constrains Rive to exactly one job: the Beamie character. Every other animation is Motion. If Rive falls through, you lose Beamie but keep 4 of 5 signature motions and the full Stage. The isolation is smart architecture. The risk is that the entire brand narrative is built around Beamie — so Rive failing means the marketing story fails even if the code ships.

**The "Inbox zero" and "Automation ready" empty states are specific enough to build.** The doc gives concrete copy, visual direction, and a Fraunces usage rule. An engineer can implement these without design handoff. Compare this to the generic "gray square + icon" boilerplate in the current code — these specs are actionable.

**Cutting dark mode is correct.** Every dark mode implementation adds 20–30% testing surface with zero new revenue. Right call.

---

## 2. WHAT WILL BREAK (attack)

### Risk 1 — Rive contractor availability: HIGH probability, HIGH impact
The Rive community is small. Designers who know Rive's state machine editor (not just Rive's basic timeline) number in the low thousands globally. A freelancer search on Toptal or Upwork for "Rive state machine animation + product character" currently returns 15–30 results. Most are booked 2–4 weeks out. The doc estimates $3,000–$8,000 for the character file. At the budget end, you get a basic 4-state file with no micro-expressions. At $8,000 you might get a character that matches the 12-rule spec. Probability of finding, contracting, and receiving a polished 8-state Beamie file within 3 weeks: **35%**.

### Risk 2 — The Stage requires streaming scan API that does not exist: HIGH probability, HIGH impact
Phase 2 says "Wire Stage to the real scan API (streaming updates as each engine responds)." The current scan API (`/api/scan/start/route.ts`) fires an Inngest event and returns 202. Inngest runs the scan in the background. There is no streaming endpoint. There is no SSE or WebSocket channel. For the Stage to show per-engine results in real time, you need a new streaming architecture: either SSE from a new `/api/scan/stream/[scanId]` endpoint polling Supabase Realtime, or Supabase Realtime subscriptions directly on `scan_engine_results`. This is 1–2 weeks of backend work that Phase 2 does not budget for. Without it, the Stage is a fake progress bar — all 7 engines animate, then results appear at once. The "watchable 30-second journey" becomes a 30-second wait with a reveal. Probability this is already built: **5%**. Probability it slips Phase 2's timeline by 1–2 weeks: **85%**.

### Risk 3 — 12 Beamie behavior rules is 6 months of QA, not 2 weeks: HIGH probability, MEDIUM impact
Count what "implementing the Beamie companion" actually requires:
- A React component that persists across all authenticated routes without re-mounting
- Drag with localStorage persistence keyed by user ID (8px threshold, spring settle, edge snap)
- Right-click context menu with hide behavior, 24-hour timer, re-appearance dot
- Gaze rotation toward target elements (requires DOM measurement via `getBoundingClientRect` plus CSS transforms)
- SVG arc animation from Beamie toward a target element (dynamic path calculation)
- 10-second silence timer with session-level dismissal memory
- 7-day DB-backed dismissal count per element per user (new table, new API endpoint)
- Supabase Realtime listener on `agent_jobs` to drive state transitions
- 3-step onboarding tour with first-hour detection and per-user completion tracking
- `prefers-reduced-motion` fallback for every state
- Mobile long-press dismiss (500ms threshold, separate from right-click)
- Inline text field (320px, auto-height, context-aware message, Escape-to-close, Send-to-API routing)

That is 12 distinct engineering deliverables. Phase 3 budgets 2 weeks. This list alone is 4–6 weeks for one developer to build and test correctly. Every behavior rule that ships broken (gaze vector miscalculates, nudge repeats after 7 days, drag jumps to wrong position on reload) is a regression in the product's most visible feature. Probability Phase 3 ships all 12 rules in 2 weeks: **10%**.

### Risk 4 — The Inbox action stubs will fail visibly on any demo: CERTAIN, HIGH impact
The audit confirmed: `handleApprove`, `handleReject`, `handleRequestChanges`, `handleArchive` all call `console.log` only. If any investor, user, or beta tester opens the Inbox and clicks "Accept" on a recommendation, nothing happens. Launching Beamie, the Stage, and the score animation on top of a non-functional Inbox is equivalent to adding chrome rims to a car with no engine. This is not a v2 risk — it is a currently-broken critical path that must ship before any v2 feature is visible to external users.

### Risk 5 — SVG engine logos require licensing research: MEDIUM probability, MEDIUM impact
The doc says "Commission or source SVG marks for the 7 AI engines — ChatGPT, Gemini, Perplexity, Claude, Grok, You.com, Google AIO." Using third-party brand logos in a commercial SaaS product is legally non-trivial. OpenAI, Google, and Anthropic have brand usage guidelines that restrict use in third-party products. Some require explicit approval. Sourcing 7 brand-safe SVGs, confirming usage rights, and implementing them is 3–5 days if licensing clears easily, 2–4 weeks if it does not. The doc treats this as a 1-hour icon swap. It is not.

### Risk 6 — Framer Motion migration risk from existing motion library: LOW-MEDIUM probability, MEDIUM impact
The repo already uses `framer-motion` with a local motion config at `apps/web/src/lib/motion.ts`. The v2 plan migrates to the `motion` package (Framer Motion v11+). These are not identical APIs. The `useAnimation`, `AnimatePresence`, and `LayoutGroup` APIs changed between v10 and v11. Existing animations across HomeClientV2, NextStepsSection, AutomationClient, and InboxClient may break on upgrade. Audit of existing framer-motion usage is needed before upgrading. Probability of migration causing regressions: **40%** without an audit first.

### Risk 7 — Supabase Realtime for Beamie state is an infrastructure dependency: MEDIUM probability, HIGH impact
Beamie's state machine must respond to real agent events: idle → thinking when a job starts, thinking → succeeded when it completes. The doc says "Wire Beamie state to real agent activity: listen to Supabase Realtime events on `agent_jobs` table." Supabase Realtime requires RLS policies that permit the authenticated user to subscribe to their own `agent_jobs` rows. If RLS is not configured for Realtime (it is often not — Realtime and REST have separate RLS enforcement paths), the subscription silently fails. Beamie never enters the thinking state. The most visually compelling feature ships as a static character. Probability RLS is already Realtime-compatible: **30%**.

### Risk 8 — "Phase 0 is 3–4 days" optimism: LOW-MEDIUM probability, LOW impact
The 10 fixes are correctly estimated individually. The aggregate risk is that context-switching between 10 different files across 4 pages, each requiring read-verify-fix-test cycles, takes 1.5–2x longer than the sum of parts. InterDisplay loading (1 hour) plus Tailwind config update plus verifying it renders correctly on all 4 pages at all breakpoints: 3 hours, not 1. The estimate is optimistic by 30–50% for a single focused developer. Not catastrophic, but budget 5–6 days, not 3–4.

---

## 3. THE RIVE SINGLE-POINT-OF-FAILURE ANALYSIS

### Contractor timeline: realistic estimate
- Week 0: Post job, review portfolios — **4–7 days**
- Week 1–2: Contract negotiation, NDA, brief alignment, first character sketch — **5–10 days**
- Week 3–4: Initial Rive file with 4 basic states, first review — **10–14 days**
- Week 5–6: State machine revision, micro-expression tuning, 8-state completion — **10–14 days**
- Week 7: Integration, bug fixes, handoff — **3–5 days**

**Realistic total: 7–9 weeks from start to production-ready Beamie file.** The doc implies 2–4 weeks. That is the timeline for a contractor who already knows your brand, has a brief, and starts immediately. From cold outreach: add 3–5 weeks.

### Skill requirement for in-house ownership
Adam learning Rive from scratch: the editor is approachable for simple timelines. A state machine with 8+ states, gaze vectors, and micro-expressions requires understanding Rive's blend trees, state machine inputs (trigger, boolean, number), and animation layering. Realistic ramp from zero to competent at this complexity level: **3–4 weeks** of focused practice. The doc says "1–2 weeks from After Effects background." That estimate applies to a 2-state idle + active character, not the full 12-rule Beamie specification.

### What happens if the character file slips 2 weeks
Phase 1 (Motion Foundation) and Phase 3 (Companion) are dependencies. If the Rive file arrives 2 weeks late:
- Phase 1 can still deliver the 4 non-Rive signature motions (ScoreGaugeFill, AgentPulse, RecommendationCascade, CompletionSettle)
- Phase 2 (The Stage) loses the Beamie courier animation — the Stage becomes engine pills and data packets, no character. Still shippable, less distinctive.
- Phase 3 delays to start from whenever the file arrives. This pushes Phase 3 completion from Week 8 to Week 10+.
- Total v2 delivery slips from 14 weeks to **16–18 weeks**.

### What happens if Rive licensing does not fit
Rive's commercial license (as of 2025) requires a paid plan for commercial SaaS products shipping to end users. The Community plan permits personal and open-source use. The Teams/Enterprise plans add white-labeling restrictions. If Beamix ever white-labels the product for agencies, Rive's licensing may require renegotiation. This is a business risk, not a launch blocker — but it needs to be verified before Phase 1 begins, not discovered after the character file is built.

### Fallback plan if Rive fails
**Lottie with pre-rendered states:** Ship 4 static Lottie files (idle, thinking, succeeded, error) that play as non-interactive loops. No real-time state machine — use React state to mount/unmount the correct Lottie file. Loses eyebrow micro-expressions and the gaze vector. Keeps the visual presence at 70% fidelity. Implementation: 2 weeks instead of 6. Cost: free (Lottie is open source). This is the fallback.

**CSS/SVG character:** A minimalist face drawn in SVG with CSS keyframe animations for the breathing idle and a simple `transform: rotate()` gaze approximation. No contractor required. Loses the micro-expressions entirely. Character looks static and toy-like vs. the Notion AI benchmark. Only viable as a bridge while the real Rive file is in production.

---

## 4. THE REAL TIMELINE

The plan bills 12–14 weeks. Here is the honest phase-by-phase range:

| Phase | v2 Doc Estimate | Pessimistic | Optimistic | Notes |
|---|---|---|---|---|
| Phase 0 — Quick Wins | 3–4 days | 6–8 days | 3 days | Context-switching tax; verify-on-4-pages adds time |
| Phase 1 — Motion Foundation | 2 weeks | 5–6 weeks | 3 weeks | Includes Rive integration + MVP character. Rive file is the risk. |
| Phase 2 — The Stage | 4 weeks | 6–8 weeks | 4 weeks | Streaming API does not exist. Backend work not budgeted. |
| Phase 3 — The Companion | 2 weeks | 6–8 weeks | 3 weeks | 12 behavior rules, Supabase Realtime, DB dismissal table. |
| Phase 4 — Per-Page Rebuilds | 4 weeks | 5–6 weeks | 3 weeks | Realistic if Phases 1–3 land cleanly. |
| Phase 5 — Polish | 2 weeks | 3 weeks | 1.5 weeks | Accurately scoped. |

**Total:**
- v2 doc claims: 12–14 weeks
- Optimistic (everything goes right, no contractor delays, streaming API built concurrently): **14–17 weeks**
- Pessimistic (Rive slips, streaming API is a separate sprint, Realtime RLS issues): **22–28 weeks**
- Realistic for a solo founder with 1–2 contractors: **18–22 weeks**

The plan is a 5-month build dressed as a 3-month build.

---

## 5. THE 4-WEEK MVP COUNTER-PROPOSAL

The goal: prove Beamix is visually distinct from Peec/Profound/Otterly. Show motion-first. Show character potential. Ship zero broken features. No Rive required.

### Week 1 — Fix the Broken and Load the Foundation

Ship list:
- Load InterDisplay and Geist Mono in `layout.tsx` (1 hour — highest ROI in the entire doc)
- Fix sidebar active state to full brand-blue background (30 min)
- Fix filter chip active color on /scans (30 min)
- Wire all 4 Inbox action stubs to real API endpoints with optimistic removal and spinner state (4–8 hours)
- Remove tinted-square icon pattern from KpiStripNew — replace with left-border accent tiles (2 hours)
- Purge non-brand colors: `#93b4ff`, `#0EA5E9`, violet/orange/teal agent tints (2 hours)
- Replace per-agent Zap icons with 7 distinct Lucide icons (1 hour)
- Fix "Pause all" from `rounded-full` to `rounded-lg` (5 min)
- Fix scoreVerdict "Good" missing label (30 min)
- Set score hero to 72px InterDisplay on /home (3 hours including layout adjustment)

**End of Week 1:** The product no longer looks like a Shadcn template. Critical bugs are fixed. The Inbox works.

### Week 2 — Motion Foundation (No Rive, No Character)

Ship list:
- Add Motion package (or confirm existing framer-motion version) and standardize easing curves as named constants in `lib/motion.ts`
- Build `<ScoreGaugeFill />` component: SVG circle, 0→score animation, 800ms, `enter` easing, tabular counter inside ring. Drop into /home hero and /scans row-expand.
- Build `<AgentPulse />` component: radial spring ring, `isActive` prop. Wire to Inbox items where agent job is in-progress state.
- Build `<RecommendationCascade />`: stagger wrapper, 40ms delay per child, `translateX(12px)` → `translateX(0)`, opacity 0→1. Wire to Inbox new-item arrival and NextSteps on /home.
- Build `<CompletionSettle />`: bounce + border flash HOC. Wire to Inbox "Approve" action confirmation.
- `prefers-reduced-motion` fallbacks for all 4 components.
- Design and build 3 differentiated empty states: First Scan, Inbox Zero, Automation Ready.

**End of Week 2:** 4 of 5 signature motions are live. The product has kinetic identity without a single line of Rive. Users who click Approve see a physical response. Score arrivals feel earned.

### Week 3 — The Stage, No Character

Ship list:
- Build the Stage modal shell: full-page overlay, blur backdrop, `panel` easing on open, 7 engine pills in arc layout, progress strip, side panel (static for now — step list from cached final data).
- Build engine pill state management: queued → active → done, color transitions, green check overlay.
- Build the `<DataPacket />` animation: 12px diamond, path travel from engine pill to center, 400ms.
- Build connector SVG path that draws as each engine activates.
- Build score ring materialization: ring draws in clockwise, number counts up, 800ms, `enter` easing.
- Wire Stage to existing scan API results (not streaming — load all results on scan complete, replay the 30-second animation from the result set). This is a client-side choreography over final data, not real-time streaming. It is achievable in Week 3. Real streaming is a Phase 2 enhancement.
- Implement "Re-watch scan" button.
- No Beamie in the Stage yet. The site card sits at left, the courier role is implicit. Add a placeholder Beamix logo mark as the "courier" if needed visually.

**End of Week 3:** The Stage exists. It is not streaming. It is a 30-second choreographed reveal of the completed scan results. Visually it is unlike anything a GEO competitor has shipped. The character is absent. The motion is present.

### Week 4 — Beamie Placeholder + Page Polish

Ship list:
- Implement Beamie as a CSS/SVG placeholder character: a 56×56px circle with a minimal face (2 eye ellipses, 2 eyebrow rectangles, 1 nose dot) using Beamix silver-gray base. No Rive. No micro-expressions. Implement idle breathing via CSS keyframes (scale 1.0 → 1.03, 4s period). Implement thinking state via faster breathing (1.2s) and a `#3370FF` drop-shadow tint shift.
- Implement drag mechanic and localStorage persistence.
- Implement click-to-open inline text field (320px, Escape-to-close, context-aware greeting message).
- Implement right-click hide + re-appearance button (24h timer).
- Wire Beamie thinking state to: scan running, agent job active (poll `agent_jobs` on 5-second interval as Realtime fallback).
- Per-page styling pass: fix all page H1s to 40px InterDisplay. Fix spacing to `max-w-7xl`. Fix all section headings from `text-sm font-semibold` to distinct typographic levels.
- Typography consistency pass: every heading is `font-display`, every code element is `font-mono`.

**End of Week 4:** Beamie exists as a placeholder with correct behavior but no Rive polish. The full motion system is live on all 4 pages. The Stage works. The Inbox works. The score is a hero number. Beamix looks and feels like a different product from Week 0.

### What's In vs. What's Out

| Feature | Week 4 Status | Comment |
|---|---|---|
| InterDisplay headings | IN | Week 1 |
| Brand colors enforced | IN | Week 1 |
| Inbox actions wired | IN | Week 1 prerequisite |
| ScoreGaugeFill | IN | Week 2 |
| AgentPulse | IN | Week 2 |
| RecommendationCascade | IN | Week 2 |
| CompletionSettle | IN | Week 2 |
| Differentiated empty states | IN | Week 2 |
| Stage modal (non-streaming) | IN | Week 3 |
| Score ring + data packets | IN | Week 3 |
| Beamie placeholder (CSS/SVG) | IN | Week 4 |
| Beamie drag + hide + inline text | IN | Week 4 |
| Rive Beamie character | OUT | Phase 2 — post-4-week plan |
| Real-time streaming Stage | OUT | Phase 2 — requires backend sprint |
| 12-rule full Beamie behavior | OUT | Phase 2 — weeks 5–10 |
| Gaze vector + nudge | OUT | Phase 2 |
| Onboarding tour | OUT | Phase 2 |
| Engine SVG logos | OUT | Licensing research first |
| Dark mode | OUT | Never (post-launch) |

---

## 6. BUGS THAT BLOCK THIS PLAN

These are issues that, if not fixed before launching v2 visuals, will fail visibly to any external user:

**Priority 0 — Fix before any v2 feature ships:**
1. **Inbox actions are console.log stubs.** Any user who clicks Approve during a demo sees nothing happen. This makes the entire Inbox — which is the primary user review loop — look broken. Fix in Week 1.
2. **Sidebar sign-out is a console.log stub** (per audit: `Sidebar.tsx` — sign-out not wired). A user who tries to log out during a demo cannot. Fix in Week 1.
3. **scoreVerdict "Good" has an empty label** on /scans. A score of 65 shows no verdict text. Fix in Week 1 (30 min).

**Priority 1 — Fix before Phase 2 (Stage):**
4. **No streaming architecture exists.** The Stage's per-engine real-time updates require SSE or Supabase Realtime on `scan_engine_results`. This does not exist. If shipped without it, the Stage animates a fake progress sequence, then reveals all results simultaneously. Users will notice. Accept the non-streaming Week 3 implementation as a v1 of the Stage, and budget a backend sprint for real streaming before any public demo of the Stage.
5. **SVG gradient ID collision** in ScoreOverTimeChart (`sot-grad` hardcoded). If multiple scan rows expand simultaneously, only the first gradient renders. Fix before Phase 4 per-page rebuild.

**Priority 2 — Fix before Phase 3 (Beamie full behaviors):**
6. **Supabase Realtime RLS compatibility** for `agent_jobs` subscription. Audit and fix before implementing Beamie state listening.
7. **`agent_jobs` table has no `title` or `summary` columns** (per MEMORY.md DB schema corrections). Beamie's inline text field ("What did you work on today?") needs a summary source. Confirm what data is available before building the API route.

---

## 7. THE "WE'RE A SOLO FOUNDER" VERSION

If Adam is the primary engineer, designer, founder, and marketer — and there is no contractor yet — this is the realistic plan:

**Monthly engineering capacity:** Assume 25–30 productive engineering hours per week (the rest goes to sales, support, product decisions, and contractor management). That is 100–120 hours per month.

**Phase 0:** 5–6 days of focused work. Do this first, no matter what. The ROI per hour is the highest of any work in v2.

**Month 1:** Phase 0 + Motion Foundation (4 signature motions, no Rive). Shippable, defensible, no contractor dependency. At the end of Month 1, Beamix looks different from every competitor on a static screenshot alone.

**Month 2:** The Stage (non-streaming), Beamie CSS placeholder, per-page rebuild. At the end of Month 2, a live demo shows the scan running, the Stage animating, a score ring filling, and Beamie present in the corner.

**Month 3:** Contractor Rive character (if found, contracted in Month 1, delivered in Month 3). Streaming Stage backend. Full Beamie behavior rules (prioritize drag, hide, inline text — skip gaze vector and nudge arc until Month 4).

**Month 4:** Gaze, nudge, onboarding tour. QA the 12 behavior rules. Polish wednesdays.

This is a 4-month plan, not a 3-month plan, and it treats Adam's time as the constrained resource it is.

**The honest trade:** If Adam spends Month 1 building the 4 motions and the Stage scaffold, and a user lands on the product in Month 2, they will see a GEO tool that animates, has a score that fills, and has a motion system. That is enough differentiation to close early customers. Beamie with micro-expressions can arrive in Month 3. Do not let the perfect character block the shippable product.

---

## 8. CONCESSIONS — WHERE V2'S PLAN IS ACTUALLY REALISTIC

**The 5 signature motions are correctly decomposed.** Each is a standalone component with a clear API. A focused frontend developer can ship all 5 in 2 weeks if the Rive character is excluded from Phase 1. The doc's Phase 1 estimate of 2 weeks is realistic for the non-Rive work.

**Phase 4 (per-page rebuilds) is correctly scoped at 4 weeks** given that Phases 1–3 have already built the component library. If the motion components and Beamie shell exist, wiring them into /home, /inbox, /scans, and /crew is largely integration work, not design-from-scratch work.

**The static styling fixes throughout are precisely estimated.** The doc knows where the bugs are (file path + line number for each). "30 minutes to fix sidebar active state" is accurate — this is a class name change in one file. The audit quality is high and the fix estimates reflect that quality.

**The "no dark mode" scope reduction is a significant timeline save.** Dark mode is typically 25–35% of a frontend design system's testing surface. Cutting it cleanly is worth 2–3 weeks of Phase 5 scope.

**The anti-Clippy rules are enforceable as unit tests.** Rules 2 (no repeat nudge more than 3x), 11 (10s silence timeout), and 12.1 (no auto-speak) can all be verified with integration tests. They are not vague aspirations — they are testable behaviors. This is well-scoped engineering.

---

## 9. THE SINGLE HARDEST QUESTION FOR ADAM

**Can you ship a first paying customer before Beamie has micro-expressions?**

Every other question about this plan — contractor timeline, streaming API, licensing — has a technical answer. This one is strategic and only Adam can answer it.

The v2 design system is built on a character that requires Rive expertise Adam does not currently have, from a contractor who will take 7–9 weeks to deliver, to animate behaviors that will take 6–8 weeks to implement correctly after the file arrives. That is 15–17 weeks until the product matches the v2 vision on the character alone.

Meanwhile, competitors are building. The motion system, the Stage, and the score hero moment can ship in 4–6 weeks without Beamie having a face that waves its eyebrows. That is enough to be visually different from every GEO tool on the market today.

If the answer is yes — "I will close the first customer with a CSS placeholder character and a working Stage" — then the 4-week plan above is the right path, and Rive becomes a Month 3 enhancement.

If the answer is no — "Beamie's micro-expressions are the product's credibility signal and I will not demo without them" — then the honest timeline is 5 months, and you need to find and contract a Rive specialist this week, not next month.

Pick one. Do not hedge. The plan you choose determines every engineering decision for the next 90 days.

---

*Filed by: Board Seat 3 — The Executor*
*2026-04-24*
