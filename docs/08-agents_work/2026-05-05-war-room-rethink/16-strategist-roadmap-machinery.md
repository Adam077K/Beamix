# THE STRATEGIST — Round 1 (no cross-talk)
**Date:** 2026-05-06  
**Role:** Reforge-style product strategy advisor — roadmap machinery, not vision, not OKR cadence  
**Constraints:** $0 new software budget. Claude Max $100/mo. 8GB Mac. Solo founder.

---

## Headline

**The planning machinery is missing entirely — Beamix has a backlog, not a strategy engine; items get added but nothing gets killed, and the fleet has no mechanism to propose bets, surface market signal, or detect when a bet is wrong before week 8.**

---

## 1. The Living Roadmap

### Why roadmaps die in week 2

Linear, Notion, and Jira roadmaps die for one reason: they are written at a high point of certainty (the planning session) and then reality arrives. Nobody is assigned to challenge the roadmap — the team just executes until they hit a wall or a customer says something that should change everything. The roadmap becomes a historical artifact within 10 days.

The agent fleet solves this if — and only if — **roadmap review is a first-class recurring event, not an optional task**.

### The artifact: `docs/ROADMAP-90.md`

A single rolling 90-day file. Not a spreadsheet. Not Linear epics. A markdown file that is the single source of truth for what the next 90 days contain, why each item is there, and what would kill it.

**Schema (per initiative):**

```markdown
## [Initiative Name]
- **Status:** Active | Paused | At-Risk | Killed
- **Bet type:** Retention | Acquisition | Monetization | Moat | Infrastructure
- **RICE score:** [R × I × C ÷ E]  — recalculated each Monday
- **Entry date:** YYYY-MM-DD
- **Scheduled review:** YYYY-MM-DD (auto-set to entry + 14 days)
- **Stop-loss condition:** [specific measurable thing that kills this]
- **Pre-mortem (one sentence):** [the most likely way this fails]
- **Owner agent:** [which team or worker owns execution]
- **Week 2 checkpoint:** [what we need to see by day 14 to continue]
- **Signal source:** [what market signal or customer data triggered this bet]
```

### The update mechanism: Monday Roadmap Routine

Every Monday at 07:30, the **Strategy Routine** runs automatically (Claude Code Routine, $0 extra — already on Max plan). It:

1. Reads `docs/ROADMAP-90.md` and `docs/BACKLOG.md`
2. Reads the market signal digest from that week (see section 3)
3. Reads the stop-loss conditions for every active initiative
4. Produces a `ROADMAP-MONDAY-YYYY-MM-DD.md` in `docs/08-agents_work/sessions/` with:
   - Which initiatives hit or missed their week-N checkpoint
   - Which stop-loss conditions are approaching breach
   - Three proposed promotions from backlog (with RICE score)
   - Two proposed kills from active list

Adam reviews this Monday morning digest (5 minutes). He approves or overrides. The CEO agent updates `ROADMAP-90.md` with the approved changes.

This is **Shape Up's "cool-down + next cycle planning"** made weekly instead of 6-weekly, with agents doing the analysis work.

### What "alive" means concretely

An initiative is alive when three things are true simultaneously:
1. It has a named agent owner who has touched it in the last 7 days
2. Its stop-loss condition hasn't been triggered
3. Its RICE score is still in the top 70% of the active list

If any of these fails, it gets flagged At-Risk automatically by the Monday Routine. Two consecutive At-Risk flags = automatic proposed kill in next Monday's digest.

---

## 2. The Initiative Proposal Pipeline

### The problem with "agents just execute"

The current fleet is a delivery machine — it executes briefs. That's fine for the build sprint. It's catastrophic for the next 12 months. The people closest to the work (and the market signal) are the agents running the Growth Team's weekly tasks. If they can't propose new bets, Adam is the only idea intake channel — which means he's also the bottleneck.

### The format: the Mini-PR/FAQ (not a Bezos memo)

The Bezos 6-page memo is the gold standard for forcing clear thinking. But it's 6 pages. A solo-founder fleet needs the distilled version — 1 page, structured, parseable by agents downstream.

Every initiative proposal uses this template. Agents fill it. Adam approves or kills. No exceptions.

```markdown
## Initiative: [Name]
**Proposed by:** [agent or team]  
**Date:** YYYY-MM-DD

### The customer problem (one sentence, no jargon)
[E.g., "Israeli SMB owners can't tell if their Google Business Profile is hurting their AI search ranking."]

### The bet
[What we build or do.]

### Why now (urgency signal)
[What changed in the market, product, or customer behavior that makes this the right moment.]

### RICE Score
- **Reach:** How many users affected per month? [number]
- **Impact:** What's the effect per user? [0.25 / 0.5 / 1 / 2 / 3]
- **Confidence:** How certain are we? [10% / 25% / 50% / 80% / 100%]
- **Effort:** Agent-weeks to ship? [number]
- **RICE:** [R × I × C ÷ E] = [score]

### Stop-loss condition
[The one measurable thing that, if not hit by week 2, kills this. Must be specific: not "it's not working" but "fewer than 3 users click the CTA in the first 7 days of live."]

### Pre-mortem (one sentence)
[Most likely failure mode.]

### What we are NOT doing to make room
[Explicitly names what gets deprioritized or killed to create capacity for this.]
```

### The worked example: "Free GEO Scoring Widget"

The Growth Team proposes it. Here is how it flows through the pipeline:

**Growth Team's Mini-PR/FAQ (filled):**

- **Customer problem:** SMBs can't see their AI search visibility score without signing up for Beamix. The ask-before-value creates drop-off before the free scan even runs.
- **The bet:** Embeddable JavaScript widget. Any agency or blogger can embed it. Shows a live AI visibility score for any URL. Traffic comes back to Beamix branded.
- **Why now:** Three competitors (BrightEdge, Semrush, Moz) built free domain authority widgets and still cite them as their #1 acquisition channel in 2026. GEO scoring widget has zero competition today.
- **RICE:** Reach: 400 SMBs/mo (conservative, with 10 agency embeds). Impact: 2 (high — same as free scan but zero friction). Confidence: 50%. Effort: 3 agent-weeks. **Score: 400 × 2 × 0.5 ÷ 3 = 133.**
- **Stop-loss:** If fewer than 50 widget embeds happen in the first 30 days post-launch, kill.
- **Pre-mortem:** Agencies embed it, get traffic, never send to Beamix — zero conversion.
- **What we drop:** G8 (Competitive Intelligence Dashboard enhancements) moves to Wave 4.

**The scoring filter:**

RICE > 100 = eligible for Monday roadmap consideration. RICE 50–100 = backlog. RICE < 50 = kill immediately at proposal stage.

Widget scores 133. It goes to Monday's digest as a proposed promotion. Adam reviews. He flags the pre-mortem as the risk he cares about most. He approves with a 30-day conversion rate stop-loss added: "if widget embeds don't produce at least 5 trial signups in 30 days, kill the distribution strategy but keep the widget for brand."

**The kill rate target:**

At a healthy product company, roughly 70% of proposed initiatives never make it into active work. For a solo founder with a fleet: 80% kill rate at the proposal stage is correct. The RICE filter does most of this automatically — low-RICE proposals die on scoring, before anyone argues about them. This is the Linear equivalent of closing issues before they rot the backlog.

---

## 3. The Market Signal Loop

### What Beamix needs to watch

The AI search landscape moves faster than any human can track manually. Algorithm changes from Perplexity, OpenAI, Gemini — competitor pricing and feature drops — customer language shifts — Israeli market signals. All of this needs to feed the roadmap every week. Currently: nothing watches any of it systematically.

### The signal loop architecture

Three dedicated Routines, each with a specific scope and output artifact:

---

**Routine A — The Competitor Monitor**  
*Cadence: Weekly, every Sunday 06:00*  
*Agent: Research Lead (Sonnet)*  
*Scope: Top 5 competitors + AI engine algorithm signals*

Watches:
- Changelog pages and blog RSS feeds: Profound.ai, BrightEdge GEO, Conductor, Semrush AI Search, SE Ranking
- Perplexity Blog, OpenAI Blog, Anthropic Blog, Google Search Central (Gemini Overviews updates)
- ProductHunt launches tagged "GEO" or "AI SEO"
- Three Israeli market sources: The Marker Tech, Techtime.co.il, Geektime

Produces: `docs/08-agents_work/signal/COMPETITOR-YYYY-WW.md`

Format:
```markdown
## Week [N] Competitor Signal
**Date range:** [Mon-Sun]

### New features shipped (competitor name + what + source URL)
### Pricing changes (if any)
### Algorithm signals (AI engine behavior changes observed)
### Israeli market signals
### Implications for roadmap (agent's 3-bullet take)
```

Adam time: 3 minutes to read on Monday morning before the roadmap review.

---

**Routine B — The Customer Voice Aggregator**  
*Cadence: Weekly, every Sunday 07:00*  
*Agent: Research Lead (Sonnet)*  
*Scope: What customers are saying, in their words*

Watches (once integrations exist — stub with manual input pre-launch):
- Beamix Inbox action patterns (which agents get approved vs rejected, what gets edited)
- Support tickets (once Intercom/Crisp is wired)
- Stripe/Paddle churn events with exit survey data
- Any Reddit threads mentioning "GEO", "AI search visibility", "ChatGPT SEO"
- Israeli Facebook groups: "Digital Marketing Israel", "SEO ישראל"

Produces: `docs/08-agents_work/signal/CUSTOMER-VOICE-YYYY-WW.md`

Format:
```markdown
## Week [N] Customer Voice
### Exact quotes (verbatim from tickets, reviews, social)
### Patterns in Inbox accept/reject (what agents are getting ignored)
### Upgrade/downgrade triggers observed
### New pain points not yet addressed in product
### Language to adopt in copy (actual words customers use)
```

This feeds USER-INSIGHTS.md and the Monday roadmap digest.

---

**Routine C — The GEO Algorithm Watch**  
*Cadence: Bi-weekly, every other Tuesday 08:00*  
*Agent: AI Engineer (Sonnet — this is technical pattern detection, not commodity retrieval)*  
*Scope: How AI engine citation behavior is changing*

Watches:
- Anthropic, OpenAI, Google research papers (arxiv, official blogs)
- LLM benchmark leaderboards for web retrieval tasks
- SEO industry studies on AI citation patterns (Authoritas, Search Engine Land)
- Changes in what Perplexity and ChatGPT cite from the Israeli market specifically

Produces: `docs/08-agents_work/signal/GEO-ALGO-YYYY-MM-DD.md`

Format:
```markdown
## GEO Algorithm Signal — [Date]
### Citation pattern changes observed
### New content formats getting elevated in AI responses
### Sources being deprecated or suppressed
### Implications for our agent output formats (specific: FAQ structure, schema, etc.)
### Roadmap implications (specific initiatives to add, modify, or kill)
```

---

### The signal → roadmap bridge

All three signal files are read by the Monday Roadmap Routine. The Routine's job is to translate raw signal into roadmap language: "Competitor X shipped Y. Our W5-4 initiative now has a 30% lower RICE score because we're no longer first. Here's the updated score."

This is how signal actually changes the roadmap instead of being filed and forgotten.

---

## 4. Kill Bad Bets Fast

### The core problem

Beamix will pursue 5–10 bets in the next 12 months. Statistically, 7 will be wrong. The question isn't whether they'll be wrong — it's whether you detect failure at week 2 (cheap) or week 8 (expensive, after you've built, shipped, and told customers about it).

Most teams detect failure at week 8 because they don't define what success looks like at week 2 before starting.

### The three mechanisms

**Mechanism 1: Pre-mortems before every bet starts**

Before any initiative enters active status, the CEO agent writes a one-sentence pre-mortem: *"This initiative most likely fails because ___."* This gets stored in the ROADMAP-90.md schema. It is not optional.

Why it works: the act of naming the failure mode before starting does two things. First, it surfaces assumptions that weren't being examined. Second, it gives the Monday Routine a specific thing to check: "Did the pre-mortem failure mode occur?"

Example for "Free GEO Scoring Widget": pre-mortem is "agencies embed it but don't convert because there's no urgency to sign up." The Monday Routine checks week-2 conversion data and asks: "Are we seeing the pre-mortem scenario play out?" If yes, the agenda item is already framed — not "is this working" but "the specific thing we said would kill this is happening."

**Mechanism 2: Stop-loss conditions — binary, written before launch**

Every initiative has a stop-loss condition. It must be:
- A single specific metric
- With a specific threshold
- With a specific time window

Bad stop-loss: "It's not getting traction."  
Good stop-loss: "Fewer than 15 users run the GEO Widget scan in the first 14 days of live."

The Monday Routine reads every stop-loss condition and flags any initiative where the condition is at risk of being breached. Two consecutive at-risk flags = proposed kill in the Monday digest. Adam's job is binary: kill or explicitly override with a new stop-loss.

The override rule: Adam can override a stop-loss once, with a specific new threshold and window. He cannot override it twice. This is the Reforge equivalent of a budget amendment — allowed once, never twice for the same bet.

**Mechanism 3: Decision diaries — the paper trail**

Every time a significant product decision is made, the CEO agent appends a one-line entry to `docs/07-history/DECISION-DIARY.md`. Format:

```
YYYY-MM-DD | [Decision] | [Why] | [What would make us reverse this] | [Logged by]
```

Example:
```
2026-05-06 | Keep free scan, no free tier | Unit economics don't support free tier (board meeting consensus) | If CAC exceeds $150 and free-to-paid conversion drops below 8% | CEO
```

This is the lightweight version of Amazon's "disagree and commit" log. Its purpose: when you're tempted to revisit a decision at week 6, you read the diary entry. If the conditions for reversal haven't been met, you don't revisit it.

### The kill cadence

- **Week 2:** First checkpoint. Does the initiative show any of the pre-mortem signals? Is the stop-loss on track?
- **Week 4:** Second checkpoint. RICE score is recalculated with real data. Drops below 50? Proposed kill.
- **Week 8:** Final checkpoint. If not yet showing ROI signal, it's done. No exceptions.

Seven of ten bets fail. The goal isn't to save them — it's to kill them fast enough that the capacity goes to something better.

---

## 5. Discovery + Delivery Dual-Track

### The current state

The fleet is 100% delivery. This is appropriate for a 2-week MVP build sprint. It is a company-ending mistake if it continues past launch.

Delivery answers "are we building it right?" Discovery answers "are we building the right thing?" Most startup failures are discovery failures, not delivery failures.

### The concrete split

**Discovery Track:** 20% of fleet capacity, every week, non-negotiable.

| Discovery activity | Who runs it | Output |
|--------------------|-------------|--------|
| 2 customer interviews per week | Research Lead + researcher | Customer Voice signal file |
| 1 competitor feature deep-dive | Research Lead | Competitor signal file |
| 1 Mini-PR/FAQ proposal evaluation | Product Lead + CEO | ROADMAP-90.md update |
| Monday signal synthesis | CEO Routine | Monday digest |

This is not aspirational. 20% means 1 day of fleet capacity per week goes to discovery. If the fleet has 5 active workers on a given week, 1 of them spends their time on discovery tasks instead of shipping.

**Delivery Track:** 80% of fleet capacity, shipping against the roadmap.

The two tracks do not compete for the same queue. Discovery tasks live in a separate Linear project: "Discovery." Delivery tasks live in "Build Sprint N." The CEO agent never pulls discovery tasks into delivery sprints, and never trades discovery work for delivery pressure.

### The discovery-to-roadmap pipeline

Discovery work that surfaces a genuine insight goes through the Mini-PR/FAQ pipeline (section 2). It doesn't bypass RICE scoring just because research surfaced it. Research raises confidence scores — it doesn't replace the scoring process.

### What discovery looks like concretely for Beamix right now

This week: 2 customer interviews with Israeli SMB owners. The Research Lead writes the interview script (10 questions max), the researcher conducts them (phone/Zoom), the findings go into USER-INSIGHTS.md. The Monday Routine reads USER-INSIGHTS.md and flags any finding that contradicts an active roadmap bet.

This is how a solo founder with an agent fleet does the thing that every VC will ask about: "do you talk to customers?"

---

## 6. Quarterly OKRs That Survive Contact with Reality

### Why quarterly OKRs fail

They're set in a room. Reality arrives. The team either ignores the OKRs (and they become theater) or treats them as fixed (and ships irrelevant work). Neither is correct.

The correct pattern, from Reforge's product strategy frameworks: **OKRs are a constraint, not a contract.** They define the outcome space for the quarter. The specific initiatives that contribute to those outcomes can change. The outcomes cannot change without a formal review.

### The Beamix quarterly OKR structure

Maximum 3 OKRs per quarter. Each OKR has exactly 2–3 key results. No more. This isn't laziness — it's the discipline that makes OKRs work. Stripe shipped with 2 OKRs per quarter for their first 3 years.

**Q2 2026 example (MVP launch quarter):**

```
OKR 1: Reach product-market fit signal
  KR 1.1: 30 paying customers by end of quarter
  KR 1.2: NPS > 40 from first 20 customers
  KR 1.3: Week-4 retention > 60% (customers who ran at least 1 agent in week 4)

OKR 2: Prove the GEO improvement loop works
  KR 2.1: 80% of customers who run Content Optimizer see measurable visibility change within 30 days
  KR 2.2: Performance Tracker shows positive trend for 70% of customers at 60-day mark

OKR 3: Establish repeatable acquisition
  KR 3.1: Free scan → trial conversion > 15%
  KR 3.2: CAC < $60 (blended)
```

### The steering committee equivalent

Without a co-founder, Adam is the entire steering committee. The fleet acts as the analytical layer. The mechanism:

- **Monthly check:** CEO agent produces a one-page OKR status report on the 1st of each month. Red/Yellow/Green per KR. If any KR is Red for two consecutive months, a Board Meeting is triggered automatically.
- **Mid-quarter correction rule:** If a KR is structurally unreachable by month 2 (not just behind — structurally impossible), it gets replaced with a new KR that still serves the same OKR. This requires logging the change in the Decision Diary. One replacement per KR maximum per quarter.
- **End of quarter:** CEO agent synthesizes what actually happened vs. what was planned. This feeds the next quarter's OKR setting. The synthesis is the most important input for planning — not the plan itself.

---

## 7. The Anti-Roadmap

### Why solo founders need an explicit NOT list

Every feature request sounds reasonable in isolation. Every new competitor move looks like something to react to. Without an explicit NOT list, a solo founder becomes reactive — and a reactive roadmap is just a log of interruptions.

Linear's roadmap discipline is instructive: they publish an explicit "not doing" list in every planning cycle. It's not a "never" list — it's a "not this quarter" list, with a reason. This does two things: it helps the founder stay focused, and it helps the fleet understand what to deprioritize in their own judgment calls.

### Format: `docs/ANTI-ROADMAP.md`

Updated every quarter, reviewed in the Monday Routine, surfaced whenever an agent proposes something that conflicts.

```markdown
# Anti-Roadmap — Q2 2026
*Last updated: 2026-05-06*

These are things we are explicitly NOT doing this quarter. Any agent proposing one of these items must cite new market evidence that changes the calculus.

| Item | Why not now | Revisit condition |
|------|-------------|-------------------|
| White-label reselling | Requires separate onboarding flow; premature complexity | Post-50 paying customers |
| Multi-workspace / agency accounts | Build complexity exceeds demand signal | When 3+ agencies ask in the same week |
| Looker Studio connector | Zero customer requests; low RICE | If 5 customers ask in one quarter |
| Social Strategy agent | Killed in April rethink; no GEO signal data supports it | If AI engines start citing social content at >15% rate |
| Browser simulation for Copilot/AI Overviews | No public API; brittle; high maintenance | When Microsoft opens API or detection method stabilizes |
| Custom 3D agent canvas | Every solo founder builds this and abandons it | Never — use Linear |
| n8n or Zapier integration | Direct LLM integration is the moat; middleware weakens it | If >10 customers request Zapier specifically |
| Free tier (below Discover $79) | Unit economics don't support it; kills positioning | If CAC exceeds $150 and free-to-paid conversion drops below 8% |
```

### How the fleet enforces this

When a Growth Team agent proposes an initiative in a Mini-PR/FAQ, the first thing the Monday Routine checks is: "Is this on the Anti-Roadmap?" If yes, the proposal is automatically returned with the reason and revisit condition. The agent cannot escalate it to Adam without citing new evidence that meets the revisit condition.

This is not bureaucracy. It's the fleet protecting Adam's focus.

---

## 8. Board Meeting Budget

### When a question warrants a board meeting

The Board Meeting Pattern (from 00-V2-SYNTHESIS.md) costs $0.15–0.50 per meeting and takes 5 minutes of Adam's time. That's cheap. Cheap things get abused.

The correct frame: **board meetings are for irreversible or high-stakes decisions, not for interesting questions.** The test is the Jeff Bezos "Type 1 vs Type 2" decision framework:
- Type 2 (reversible, low-stakes) → no board meeting. CEO agent decides with Decision Diary entry.
- Type 1 (irreversible, or high-stakes and slow-to-reverse) → board meeting.

### The budget: 4 per month maximum

At Beamix's current scale, 4 board meetings per month is the upper bound. More than 4 means the planning machinery is broken — too much is reaching the board instead of being resolved by the fleet.

Target: 2 per month. One on a strategic question (market, positioning, pricing). One on a product question (a specific initiative's fate, a major UX direction).

### The trigger list — when a board meeting fires automatically

| Trigger | Example |
|---------|---------|
| OKR is Red for 2 consecutive months | Retention KR below target in month 1 and month 2 |
| A stop-loss condition is about to breach and Adam has already used his one override | "Free GEO Widget" has been at-risk for 3 consecutive weeks |
| A competitor ships something that directly attacks Beamix's primary value prop | Profound.ai announces "GEO agents that run automatically" |
| A proposed initiative has RICE > 200 and no obvious kill condition | Widget virality scenario with 5 agencies embedding on day 3 |
| A pricing or tier change is proposed | Any change to Discover/Build/Scale pricing or credit model |

### The trigger list — when NOT to call a board meeting

- "What should we build next?" → That's the Monday roadmap routine.
- "Should we use X technology?" → That's the Architect's brief.
- "Is our copy good?" → That's the Growth Lead's brief.
- "Should we respond to this competitor move?" → That's the Monday competitor signal digest.

### Board meeting format (the pattern from 00-V2-SYNTHESIS.md, refined)

```
Round 1 (parallel, 20 min):
  Participants: Marcus (analytical founder), Aria (enterprise buyer skeptic), Yossi (Israeli SMB buyer), Research Lead, Business Lead
  Each writes their position independently. No cross-talk. Each writes to a separate file.

Round 2 (serial reads, 20 min):
  Each participant reads all 5 Round-1 files.
  Each writes a rebuttal or confirmation (max 200 words).

Synthesis (10 min):
  Fresh-context Synthesis Agent (Sonnet, no Round-1 participation) reads all 10 documents.
  Produces: 3-bullet consensus + the one remaining point of genuine disagreement + recommended decision.
  Lands in Adam's Linear inbox as a card.

Adam decision (5 min):
  Binary: approve or override. With reason logged in Decision Diary.
```

Hard caps: 2 rounds maximum. 50K tokens per meeting. $0.50 ceiling per meeting.

---

## Bottom Line

**What the board must decide from this document:**

1. **The Monday Roadmap Routine is the keystone.** Everything else — signal loops, proposal pipeline, stop-loss enforcement, anti-roadmap — only works if there is a weekly forcing function that reads all the inputs and updates the roadmap. This Routine should be the first wave-4 task, ahead of the Board Meeting Pattern itself. Without it, the planning machinery is a set of unconnected artifacts.

2. **The RICE kill filter (score < 50 = never enters active work) is the most important guardrail for a solo founder.** The fleet will generate ideas faster than Adam can evaluate them. Without an automated scoring filter that kills proposals before they become debates, Adam becomes the bottleneck for every idea. The fleet should be presenting Adam with pre-scored, pre-filtered recommendations — not raw proposals.

3. **Discovery 20% is a hard budget, not a suggestion.** The fleet needs to be told explicitly: 1 in 5 agent-days goes to talking to customers, watching competitors, and evaluating new bets. This is not a task that can be deferred until after the sprint. It is the mechanism that keeps the sprint pointed at the right target.

**The three sharpest planning mechanisms in this document:**

**A. Stop-loss conditions written before launch (not after).** The single highest-leverage change in how Beamix runs bets. Write the kill condition before writing a line of code. The Monday Routine enforces it automatically. This is how you detect a bad bet at week 2 instead of week 8.

**B. The Anti-Roadmap as a fleet enforcement mechanism.** Not a list for Adam — a constraint the fleet checks before proposing anything. When an agent knows the Anti-Roadmap exists, bad proposals die at the agent level before consuming Adam's attention. Focus is enforced structurally, not willpower-based.

**C. The signal-to-roadmap bridge.** Three routines watching three signal sources, all reading into the Monday digest, which reads into ROADMAP-90.md. This is the mechanism that makes market intelligence actually change what the fleet builds, instead of being filed in a research doc that nobody reads by week 3.

---

*Filed by: The Strategist — Board Meeting Round 1*  
*Next: Cross-talk and rebuttal round reads all parallel Round-1 documents before responding*
