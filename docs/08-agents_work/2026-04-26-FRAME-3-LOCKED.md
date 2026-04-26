# Beamix Frame 3 — LOCKED
Date: 2026-04-26
Status: LOCKED. Supersedes the craft-first direction in `2026-04-26-PAGES-DESIGN-MOVES.md` for all primary surfaces. The prior work is preserved as depth-layer reference, not surface contract.

---

## What changed and why

Six prior sessions designed Beamix as a high-craft artisanal product — Notebook, Reasoning Receipt, Receipt-tape ribbon, Sentence Builder, Card flip, Letter, Press flip, hand-drawn empty states across 5 slots. Twelve distinctive moves competing to be the protagonist.

Adam corrected the frame on 2026-04-26: **the customer is not a marketer.** Beamix's user is a 15-200 person SMB owner or a small marketing team without GEO expertise. They don't have time to read agent journals. They hired Beamix to *not think about GEO*. Adding work to their plate — even artisanal work — breaks the product promise.

The right model is a **managed service** — like a great accountant, a good chief of staff, a robo-advisor. Most weeks: zero engagement required. When the user does engage: ONE clear answer in 2 seconds, ONE decision in one click, escape hatches for depth.

Two parallel research streams confirmed the frame:

- **Agent-as-teammate audit (R2)** north star is **GitHub Copilot Coding Agent**: "The agents should not have a home. The product IS their home." Agents appear in surfaces users already visit, with zero new UI paradigms. Anti-patterns identified: cute personality without utility, surveillance dashboards, approval fatigue.
- **Onboarding first-win audit (R3)** north star is **Vercel**: 3 clicks to a live deployment. The product IS the onboarding. Credits-configuration onboarding is an anti-pattern in 0 of 10 best-in-class products.
- **Competitor tier audit (R1)** confirmed Beamix's moat: every other GEO tool is a dashboard the user has to read. Beamix's category-defining wedge is the only product where the user doesn't need to know GEO.

---

## The signature move (LOCKED)

**One Status. One Decision. One Number.**

Every primary surface (and every email Beamix sends) opens with this triad above the fold:

| Element | Form | Always present |
|---|---|---|
| **One Status** | A single calm sentence with a color-coded state. "Healthy and gaining." / "We need you on one thing." / "Score dipped — we are acting." | Yes |
| **One Decision** | If anything needs the user: ONE card, ONE button. If nothing needs them: literally nothing here. | Conditional |
| **One Number** | The score and its delta this week. Tabular nums, prominent, calm. | Yes |

That is the entire above-the-fold of every primary surface. **Two seconds to read. Walk away with full understanding.**

Below the fold, on demand: rich layers (what changed, what the agents did, per-engine breakdown, competitor moves). Sarah scrolls past. Yossi reads. Both are served.

The visual signature is a **Status Token** — used in the app, in emails, on `/scan` public, on `/reports` cover. Three states (Healthy / Acting / Needs You), three colors, universally recognized in 0.3 seconds. Beamix's equivalent of Stripe's payment status pill or Linear's priority dot.

---

## The interaction philosophy

> **The product is designed to require zero engagement most of the time. Engagement is optional. Trust is the default.**

Three principles that govern every decision below:

1. **Outcomes over process.** Show what changed. Hide how it was done. Process is available on click; never primary.
2. **Calm by default, depth on demand.** Every status is clickable down to evidence — *never required*. Users pick depth on every visit.
3. **Email is a primary channel, not a fallback.** Most users live in their inbox. Beamix's weekly digest is the relationship; the app is the escape hatch and the consent surface.

---

## The five core mechanics (from R2 patterns)

Five mechanics translated directly from R2 research, each replacing 2-3 of the prior session's distinctive moves.

### 1. The Inbox = Run Log
*From: Notion Custom Agents, Devin sessions, Cursor Mission Control.*

Every agent action produces a logged, reviewable artifact. Users wake up to "Here is what your agents did overnight." Each entry: trigger, actions taken, outcome, optional rollback. The Inbox IS the board meeting.

This **replaces**: Reasoning Receipt as a separate component, /workspace as a "watch the agent work" surface, the Notebook as a rich artifact.

### 2. Agents-in-the-Roster (no Agent Hub)
*From: Linear AI Agent, GitHub Copilot Coding Agent.*

Agents appear in the same lists, activity feeds, and profile pages as if they were team members. They appear in the activity feed alongside user actions. They get assigned tasks (via Schedules). They post to the Inbox. **There is no special "Agent Hub" page.** The product is their home.

This **replaces**: /crew as a roster museum with card flips and monogram personality.

### 3. Async Handoff via Weekly Digest Email
*From: Devin's Slack standup, Granola's post-meeting note enhancement.*

The primary user-to-crew relationship is the **Monday Morning Digest** email. 3-5 sentences from the crew: what we did, what changed, what we recommend, anything that needs you. One link to the app for those who want depth. Most users live in this email; they may visit the app once a month for one approval.

This **replaces**: any need for `/crew` weekly meetings inside the product, decorative letter UIs, Notebook reading rituals.

### 4. Parallel Worker Visibility (optional depth)
*From: Cursor Mission Control.*

A grid view of all 11 agents with traffic-light status (Idle / Working / Needs Review / Failed) is available — but is **never the primary surface**. Power users (Yossi) reach it via the topbar status pill. Sarah may never visit. The grid lives behind one click, not in the chrome.

This **replaces**: the Live Crew topbar dock as headline move, persistent agent presence as primary signature.

### 5. Post-Action Enhancement, Never Interruption
*From: Granola.*

Routine work runs autonomously and surfaces a clean summary AFTER completion. Approval is required only for high-stakes actions (rewrite a service page, change pricing copy, publish to a public surface). Trust tiers are explicit:

- **Auto-run, post-review:** schema fixes, FAQ additions, citation corrections, weekly scans, monitoring scans.
- **Pre-approve, then run:** content rewrites, anything published to user's public site, anything visible to the user's customers.
- **Always escalate:** brand voice changes, pricing copy, anything irreversible.

This **replaces**: approval-for-everything inbox patterns (which would create approval fatigue per R2 anti-pattern).

---

## Page-by-page rebuild under Frame 3

Every page is restructured under "One Status / One Decision / One Number" + "Calm by default, depth on demand."

### `/home` (the daily destination)

**Above the fold (2-second read):**
- Status sentence + color: "Healthy and gaining" / "We need you on one thing" / "Score dipped — we're acting." Renders in 24-32px Inter.
- Score number + delta: 64-72px tabular nums, calm.
- IF "needs you" state: ONE Decision Card with one button. Otherwise: empty space.

**Below the fold (optional depth):**
- This week's net effect: brief 1-paragraph summary in plain English. "Schema Doctor fixed 3 errors. Citation Fixer added 11 FAQs. ChatGPT now cites you on 4 new queries."
- 12-week sparkline of score.
- Per-engine quick-strip (clickable to /scans).
- Recent crew activity (clickable to per-action depth).
- Next scheduled scan + when the next digest is sent.

**Killed from prior spec:** Hand-drawn metric illustrations, dynamic hero KPI animations, hero score block as page-opening anchor on every visit, Section 4's stripe of generic KPI cards.

### `/inbox` (the consent surface)

**Above the fold:**
- Status: "Nothing needs you" OR "N items need your eye."
- IF needs-you: a stacked list of ONE-LINE summaries, each with an inline Approve / Reject / View. Bulk approve with single keystroke.

**Empty state IS the success state.** "Nothing for you. Your crew is working on 3 things in the background." Calming. Branded.

**Below (depth):**
- Per-item expansion shows: what we changed, why, the diff, the rollback link.
- Tabs: Pending (default) / Auto-completed (post-review only — for users who want to see what ran without their approval) / Live runs.

**Killed from prior spec:** 3-pane Linear chrome, Reasoning Receipt typed-in animation, hand-drawn empty state slot 2, 40% right-pane width debate.

### `/workspace` (the optional spectator)

**Demoted from sidebar to a click-through.** Most users never visit. Reachable via topbar status pill ("3 working — see them") or per-item Inbox link ("View this run").

**Above the fold:**
- Status: "Schema Doctor — running for 47s" / "Done."
- ONE primary action: Approve output / Roll back / Re-run.

**Below (depth):**
- Step list with output per step, plain Inter, no hand-drawn courier flow.
- For users who want it: a "verbose" toggle that adds intermediate reasoning.

**Killed from prior spec:** Courier flow dissolution, Rough.js station markers, the "page is the journey" framing, breath animation on active step. Replaced with Linear-grade clarity.

### `/scans` (the historical record)

**Above the fold:**
- Status: "Last scan: healthy. Next scan: tomorrow 9am."
- One Number: this week's score + delta.

**Below (depth):**
- Stripe-style table: scan date, score, engines covered, delta, click-to-detail.
- Tabs: All / Per-Engine / Auto-completed items.

**Killed from prior spec:** Receipt-tape ribbon, serial-number bookkeeping format (SCN-YYYY-…), tape unfurl animation, 560px-vs-wider debate, "Completed Items" tab as `/archive` absorber. Tabs simplify; archive becomes a filter, not a tab.

### `/competitors` (the trajectory page — kept distinct)

**Above the fold:**
- Status: "Leading 3, behind on 2." Or: "Lost ground on Profound this week."
- One Number: aggregate competitor delta.

**Below (depth):**
- Stripe-style table of competitors with current score / their score / gap / trend arrow.
- Click row → trajectory chart for that competitor (the Rivalry Strip survives here as DEPTH, not surface).

**Kept from prior spec:** the Rivalry Strip dual-sparkline visualization survives — but as a *depth view*, not the page's headline. Sarah sees a clean table; Yossi clicks a row for the trajectory.

### `/crew` (rebuilt: not a roster, a digest authoring tool)

The biggest rebuild. `/crew` is no longer a museum of agent personalities with card flips. It is **the place where the Monday Morning Digest is composed and where agents-as-teammates appear in their work context.**

**Above the fold:**
- Status: "Your crew sent you a note this Monday." (with link to last digest)
- One Decision (if relevant): "Adjust how an agent works" — surface only when something needs tuning.

**Below (depth):**
- This week's digest preview (what your crew will say to you on Monday).
- 11 agents listed as roster — name, what they did this week (count), success rate, current state. Per Linear AI Agent / GitHub Copilot pattern: just contributors in a list.
- Per-agent click → "How [Agent] works" page with: scope, recent activity, settings (cadence, autonomy level, escalation rules).
- For Yossi: "Compose digest for client X" — pick which sections, white-label, send.

**Killed from prior spec:** Card flips with hand-written field notes in Excalifont, custom monogram icons, per-agent personality voice across 11 agents at launch, "Suggest a new agent" hand-drawn dashed-outline placeholder, the "agents-as-mascots" temptation.

**Connection mechanic preserved:** the Monday Morning Digest IS how the user feels their crew. The /crew page is where that digest is shaped.

### `/schedules` (admin, calmly)

**Above the fold:**
- Status: "5 schedules active. Next run: tomorrow 9am."

**Below (depth):**
- Stripe-style table: agent / cadence / next run / on/off toggle.
- Add Schedule = compact form (Frequency, Day, Time, Agent, On-done channel). Plain dropdowns.

**Killed from prior spec:** Sentence Builder primary view, chip-in-prose mechanic, hand-drawn dashed "Add a sentence" bar, Hebrew sentence grammar concerns (English-only UI now).

### `/settings` (boring on purpose)

**Tabs:** Profile / Billing / Notifications / Domains (Yossi) / Integrations.

**Each tab:** Stripe Settings replica. Stacked label-input rows. One save action per section. No decoration.

**Killed from prior spec:** The Letter on Profile tab, Excalifont prose with chips, signature line in Fraunces, cream paper background, receipt-tape on Domains tab.

### `/scan` (public — kept high-craft, this is acquisition)

**No change from prior spec.** This is the one surface where high-craft pays off — every lead sees this and decides to pay. Locked 15-17s storyboard with 10 frames stays. Strikethrough-and-rewrite Frame 3 mechanic stays.

**Why it survives high-craft:** acquisition surface, viral share moment, before the user becomes a customer. Different rules from logged-in product.

### `/onboarding` (rebuilt: Vercel pattern + first scan live)

The biggest rebuild after `/crew`. Onboarding is no longer 4 steps including credits configuration — it is 2 steps + a magic moment.

**Step 1 — Auto-detected confirm (≤30s):**
The /scan public flow already collected business URL, name, industry, language. After Paddle payment, onboarding opens with these pre-filled. User confirms or corrects. ONE screen, three fields, "Confirm" button.

**Step 2 — Pick your goal (≤30s):**
ONE question: *"What do you want from Beamix?"* Three opinionated options, not credits:
- "Get cited more on the AI engines my customers actually use." (the most common)
- "Match or beat my biggest competitor in AI search."
- "Show up when people ask AI about [my category]."

User picks one. This becomes the **goal track** that shows on `/home` forever as a progress bar with target. *"You're 67% of the way to your goal."*

**Step 3 — Magic moment (the "you're in"):**
Land on `/home` with the **first agent already running, live**. The UI shows: "Your crew is on it. Schema Doctor is reading your homepage. Citation Fixer is pulling your top FAQs. We'll send you their first findings in your Inbox within 24 hours."

This is the Vercel pattern: the user's existing asset (the scan) becomes the input; the product's magic (agents at work) becomes immediately visible. No credits screen. No "set your preferences." The product IS the onboarding.

**Killed from prior spec:** 4-step onboarding, sticky 120px horizon path-draw, hand-drawn station markers, breathing active station, Step 4 credits allocation, the chosen-agent spring-overshoot card pattern.

**Onboarding contract taught:** "We work; we tell you when we need you; you can check anytime — but you don't have to."

### `/reports` (white-label digest export — IN scope, simplified)

R1 confirmed white-label is the open category gap (no competitor offers it publicly). Yossi pays $499/mo partly because his client deliverables look premium.

**Above the fold:**
- Status: "3 reports generated this month."
- ONE Decision: "Generate this month's report" (button).

**Below (depth):**
- Form: client name / domain / date range / format (PDF/CSV) / white-label brand override.
- Recent reports list (5 visible, "View all" link).

**The output (the actual PDF):** this is where craft survives. The PDF cover and inside layout are Stripe Press-grade — InterDisplay headings, Fraunces editorial italics, Geist Mono data, proper editorial design. The artifact is premium. The tool surface is a calm form.

**Killed from prior spec:** "Press" button label and printing-press metaphor (cute-not-clear per Adam's customer), card-flip animation on the button, Excalifont-to-InterDisplay morph on first visit, 2-pane live preview (replaced with simpler "preview cover" link that opens a modal).

---

## The Monday Morning Digest (the relationship surface)

This is the most important new mechanic. The digest is HOW Beamix's crew connects to the user without burdening them.

**Cadence:** Monday morning, 9am user-local. Always on; user can pause but not customize content (opinionated).

**Format (3-5 sentences):**
> "This week your crew shipped 6 fixes. Score: 73 → 78 (+5). ChatGPT now cites you on 4 new queries. Citation Fixer ran a competitor check; you pulled even with [Competitor]. One thing needs your eye: [link]. Your next scan runs Friday."

**For Yossi:** white-label and client-segmented. He can configure: which clients get digests, what voice, his branding. The digest becomes his weekly client email — auto-generated, his to send.

**Why this is the headline mechanic:**
- Solves "how do we connect users to the crew" without adding work.
- Solves "how do we prove value at $189-499/mo" — five sentences a week is enough proof.
- Solves "how does Yossi show value to clients" — the digest is the client deliverable.
- Replaces the need for /crew rituals, Notebook reading, Briefing surfaces, etc.

---

## What's killed from the prior 6 sessions

The following moves from `2026-04-26-PAGES-DESIGN-MOVES.md` are **demoted from primary surface to optional depth** or **cut entirely**.

| Element | Status | Why |
|---|---|---|
| Notebook as primary surface | DEMOTED to depth | Adds reading work; customer doesn't have time |
| Reasoning Receipt typed-in animation | DEMOTED to expand-on-click | Animation tax on power users; outcome > process |
| Receipt-tape ribbon on /scans | CUT | Visual register replaced with Stripe table |
| Sentence Builder on /schedules | CUT | Cleverness over function |
| Card flip on /crew | CUT | "Cute personality without utility" anti-pattern (R2) |
| The Letter on /settings Profile | CUT | Settings should be uniformly boring |
| Press button + flip on /reports | CUT | Cleverness; "Generate report" reads more clearly |
| Horizon path-draw onboarding | CUT | 90-second one-time experience; budget misallocated |
| Step 4 credits configuration | CUT | Anti-pattern in 0/10 best-in-class onboarding flows (R3) |
| Chip-in-prose mechanic on 4 surfaces | CUT | Power-user-only grammar; Sarah never sees it |
| 5 hand-drawn empty-state illustration slots | REDUCED to 1 | Reserved for /home empty state only; others use clean text |
| Excalifont primary type | DEMOTED to /scan public + email digest accent only | Not a UI font for daily tool |
| Cream #F5F3EE on primary surfaces | DEMOTED to /scan + email + /reports cover only | UI is white; cream is for artifacts |
| Hebrew/RTL UI complexity | CUT | English-only UI per Adam's 2026-04-26 reframe |
| Beamie persistent character | UNCHANGED | Already deferred per prior locks |

---

## What's kept

| Element | Status | Notes |
|---|---|---|
| #3370FF brand blue | KEPT | Single accent, used for Status Token "Healthy" + CTAs |
| Inter / InterDisplay typography | KEPT | Primary type system; English-only simplifies stack |
| `/scan` public 10-frame storyboard | KEPT | High-craft acquisition surface; different rules |
| `/scan` strikethrough-and-rewrite Frame 3 | KEPT | Viral share mechanic survives on the public surface |
| Competitor Rivalry Strip | KEPT as depth view | Surface is a clean table; click-through reveals trajectory |
| Topbar asterisk / status indicator | KEPT, simplified | One pill: "Healthy" / "Acting" / "Needs You" |
| `/reports` white-label PDF | KEPT | Tool simplified, artifact stays Stripe Press-grade |
| Score Gauge Fill (count-up) | KEPT | Used on /home, /scan, weekly digest |
| Pill spring-overshoot button | KEPT | Used on primary CTAs only — fewer surfaces, same vocabulary |
| Hand-drawn register | KEPT for digest email + /scan + /reports cover | Reserved for artifacts user opted into |

---

## Build dependencies

### Tier 1 — Foundation (everything depends on these)
1. **Status Token component** (3 states, used everywhere) — the single most-reused component.
2. **Decision Card component** (above-the-fold "needs you" card with action buttons).
3. **Trust-tier router** (per-action: auto-run-post-review / pre-approve / always-escalate) — the rules engine for what hits the Inbox vs runs silently.
4. **Weekly Digest email template + composer** (cron Monday 9am, per-user-locale).
5. **Topbar status pill** (one pill, three states, click-through to optional Mission Control grid).

### Tier 2 — Primary surfaces (parallel after Tier 1)
- `/home` (One Status / One Decision / One Number + depth scroll)
- `/inbox` (consent surface; trust-tier router populates this)
- `/scans` (Stripe-table historical record)
- `/competitors` (table + click-through trajectory depth)

### Tier 3 — Secondary surfaces
- `/crew` (digest authoring + agents-in-roster)
- `/schedules` (calm admin table)
- `/settings` (Stripe-replica forms)
- `/workspace` (optional spectator depth view)

### Tier 4 — Acquisition + export
- `/scan` (public, locked storyboard already specced)
- `/onboarding` (rebuild per Vercel pattern above)
- `/reports` (Scale-tier white-label digest export)

### Killed from build queue
- All 5 hand-drawn empty-state illustrations (reduced to 1 for /home only)
- 11 Excalifont card-back agent personality writeups
- Sentence Builder editor component
- Letter / chip-in-prose mechanic
- Receipt-tape segment component
- Card flip motion token
- Hand-drawn courier flow component
- Onboarding horizon SVG component
- Press button flip animation

Roughly 40% reduction in component count vs the prior session's spec, with each remaining component executed at higher quality.

---

## Open questions (much fewer this time)

The prior session had 7. Frame 3 collapses most of them. Three remain:

1. **Trust-tier defaults.** Which agent actions run autonomously with post-review vs require pre-approval? Default proposal: schema fixes + FAQ additions + citation corrections run auto; content rewrites + public publishes pre-approve; pricing/brand voice always escalates. **Adam: confirm or adjust?**

2. **Goal options in onboarding Step 2.** The three opinionated options proposed are placeholders. They should be sharpened with marketing voice. **Adam: lock these three or want a copywriter pass?**

3. **Digest frequency for Yossi.** Sarah gets weekly. Yossi may want daily for active clients. Default proposal: weekly for everyone; Yossi can flip a per-client toggle to daily on Scale tier. **Adam: confirm Scale-tier-only daily option?**

---

## Scope competitors are upselling we should consider (from R1)

These are the four top-tier features GEO competitors gate at premium tiers. Beamix's $499 Scale should evaluate which to add:

| Competitor feature | Beamix equivalent | Recommendation |
|---|---|---|
| AthenaHQ ACE Citation Prediction (predict which content gets cited before publish) | Citation Predictor agent | Add to Scale tier — high value, no Beamix equivalent today |
| Profound Prompt Volume data (AI search demand dataset) | None — requires data acquisition | Defer; data investment is large |
| Peec Agency pitch workflows | /reports white-label digest export | Already in Frame 3 scope |
| AthenaHQ + Otterly BI integrations (Tableau / Looker / PowerBI) | Beamix data export API | Add to Scale tier as Phase 2 |

The Citation Predictor agent is the most defensible add — it directly extends Beamix's "agents that DO the work" wedge, no other competitor has anything like it as an executing agent (vs Athena's predictive *score* tool).

---

## Next moves (no timelines, dependency order)

1. **Visual design system consolidation** — color tokens (single accent #3370FF + Status Token semantic states), type scale (English-only, simpler stack), spacing rhythm, the Status Token + Decision Card components.
2. **Email digest template** (this is now a primary product surface, not a secondary channel).
3. **/scan public** (acquisition; locked storyboard already specced).
4. **/onboarding** rebuild per Vercel pattern.
5. **/home** with One Status / One Decision / One Number above fold + depth scroll.
6. **/inbox** with trust-tier router.
7. **/scans, /competitors** (Stripe-style tables + click-through depth).
8. **/crew** (rebuilt as digest authoring + agent roster).
9. **/schedules, /settings** (calm admin).
10. **/workspace** (optional depth view, last to ship).
11. **/reports** (Scale-tier; white-label digest export).

Each of these is a worker-implementable spec. The Build Lead can dispatch frontend-developer workers in dependency order without further design conversation, given the surface contract above plus the visual design system once consolidated.

---

## The promise this frame keeps

Frame 3 keeps the original brand promise the prior craft direction was drifting away from:

> **"Beamix does the work for you. You don't have to know GEO. You don't have to be in the app. You'll know when we need you. Otherwise: trust us."**

Every page, every email, every interaction in Frame 3 reinforces that promise. The signature is restraint at the surface, depth on demand. The competitive moat is being the only GEO product that respects the customer's time.
