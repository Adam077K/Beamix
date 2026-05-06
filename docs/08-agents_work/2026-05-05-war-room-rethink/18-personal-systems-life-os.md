# THE PERSONAL SYSTEMS DESIGNER — Round 1 (no cross-talk)
**Date:** 2026-05-06 · **Persona:** Personal Systems Designer (Tiago Forte / James Clear / David Allen × AI-native)
**Scope:** Adam's personal operating layer — not product, not ops, not vision.

---

## Headline

Adam has a world-class army and no personal OS to command it from — the army is building the product, but nobody is building the infrastructure that keeps Adam himself operational, decisive, and human.

---

## Idea Capture Loop

**The problem:** Brilliant ideas at 2am, in the shower, driving on Route 1. The army can't help if the idea never makes it to structured storage. The lost-idea failure is a founder tax.

**The system:**

**Layer 1 — Zero-friction capture (voice-first)**
- iPhone + Apple Watch dictation as the primary capture surface. No app to open.
- Siri Shortcut: voice input → Anthropic Messages API (Haiku) → normalized JSON → Linear "Inbox" project as a draft ticket. 50-line iOS Shortcut per V2 synthesis — already scoped.
- CarPlay integration: same shortcut runs hands-free while driving. Output read aloud by CarPlay.
- Apple Watch: complication tap → dictate → same pipeline. 8-second capture while walking.

**Layer 2 — Triage (async, daily)**
A Routine fires at 07:30 each morning. It reads all overnight Linear Inbox tickets, clusters them by type (product, tech, marketing, personal), adds a "confidence score" (is this a real idea or 2am delirium?), and surfaces a 5-item curated list. Adam spends 3 minutes on his phone approving/deleting/tagging. Everything else stays in Inbox until next morning.

**Layer 3 — PARA-style home (Tiago Forte's system)**
- **Projects:** Ideas tied to active Linear milestones. Triage agent moves these automatically when approved.
- **Areas:** Recurring domains (GEO market, pricing, hiring, personal). Ideas here become "standing knowledge" in the relevant MOC file.
- **Resources:** Interesting signals, competitor moves, reading. Surfaces for Weekly Review.
- **Archive:** Rejected ideas stay archived with timestamp + reason. "Past Adam thought this was bad because..." is recoverable.

**Layer 4 — Resurface (army-assisted)**
The Research Lead's weekly competitor scan Routine appends a "Ideas that aged well" section — it scans the Archive for ideas from 30-90 days ago and checks if market/product context has changed enough to reconsider them. Costs ~$0.05 per run.

**What Adam does:** Dictates. Reviews 3-minute morning triage. Taps approve/delete. Nothing else.

---

## Decision Diet

Cal Newport talks about batching shallow work. The same logic applies to decisions. Decision fatigue is cognitive debt — it compounds.

**Tier 0 — Army decides, audits to DECISIONS.md (no Adam input):**
- Which model tier for a given agent task (routing is deterministic)
- PR formatting, commit message style, file naming conventions
- Which skill to load for a standard task type
- Competitor scan scheduling cadence
- Cache optimization choices

**Tier 1 — Adam decides asynchronously (Linear card, one-tap approve/reject):**
- PR merges (GitHub Mobile, one tap)
- Agent recommendations (Linear Inbox card, approve → agent executes)
- Content calendar items (approve/reschedule/reject)
- Non-urgent pricing/copy decisions that the army has already A/B-framed for him

**Tier 2 — Batch into one weekly "Decisions Session" (30 min, Sunday evening):**
- Roadmap prioritization changes
- Anything touching pricing tiers, trial model, billing logic
- Hiring/contractor decisions
- Architectural ADRs that cross multiple domains

**Tier 3 — Adam decides in real-time, today, alone:**
- Anything with a P0 customer or revenue impact
- Any decision another agent flagged as "strategic inflection" — defined by a keyword the Inbox Routine uses to escalate
- Anything that contradicts a previously locked decision in DECISIONS.md

**The rule:** If a decision appears in Tier 1 or 2 and Adam doesn't action it within 48h, the army makes the conservative default and logs it. The default is always the lowest-risk path. Adam can override but must do so explicitly.

**James Clear's 2-minute rule applied here:** Any decision that takes less than 2 minutes to make should not be deferred. The army should be triggering those in a batch format — "here are 8 quick decisions, each is a one-tap" — so the cost of the decision-making session itself stays low.

---

## Energy & Focus System

**The insight from Cal Newport's Deep Work:** The bottleneck is not compute — it's Adam's attention, which is finite, fragile, and irreplaceable. The army amplifies what Adam brings to deep-work sessions; it cannot substitute for them.

**The rhythm:**

**Morning block (08:00–12:00) — Deep Work. Army is silent unless P0.**
- No agent notifications during this block. iOS Focus mode: "Do Not Disturb (Startup). Exceptions: Telegram messages from [emergency contact]."
- Claude Code Remote Control daemon runs overnight and during deep work. Agents work autonomously. Outputs land in Linear, not in Adam's face.
- Adam's job during this window: write, design, think, make product decisions. Not supervise agents.

**Midday sync (12:00–12:30) — Army check-in.**
- Morning Routine has already summarized overnight completions, blockers, PR statuses.
- Adam reads a single Linear board view (In Progress, Review, Blocked). 3 taps to clear the queue.
- Any agent waiting for a Tier 1 decision gets it now.

**Afternoon block (14:00–17:00) — Execution work + async communication.**
- Agent dispatches, brief reviews, Linear ticket writing, calls if any.
- The army can be more active here. Notifications allowed.

**Evening review (21:00–21:30) — Decisions Session (when it falls on that day).**
- Weekly review (Sunday): PARA review, Decisions Session (Tier 2), upcoming week intentions.
- Daily journal (5 min): one entry, three fields: "What moved?" / "What's stuck?" / "What did I learn?" Feeds the Future-Adam context loop.

**What the army does during deep work:**
- Continues running (cloud Routines, overnight QA)
- Queues outputs in Linear — never pushes them to Adam's phone
- Sends exactly one Telegram message if a P0 blocker appears ("BLOCKER: Paddle webhook failing in prod — needs your immediate decision")

**"Do not interrupt unless P0" protocol:**
Defined in a system prompt for all Routines: P0 = production outage, billing error, security incident, or blocked merge that cannot proceed without Adam's decision and has been waiting 2+ hours. Everything else queues until the midday sync.

---

## Founder Loneliness — Agent as Thinking Partner

**The problem:** Solo founders don't have a co-founder to think out loud with. The echo-chamber risk is real — Adam makes a decision, nobody pushes back, the decision compounds. The army needs to function as an intelligent sounding board, not just an executor.

**The patterns:**

**1. Board Meeting Pattern (already scoped in V2 synthesis)**
5 personas (Marcus, Aria, Yossi, Business Lead, Research Lead), 2 rounds, fresh-context synthesizer. Cost: ~$0.15-0.50 per meeting. Adam time: 3 minutes to read the consensus. This is the structured "disagreement engine." Use it for any decision that involves a trade-off between customer experience, revenue, and technical complexity.

**2. The Devil's Advocate Routine (new)**
Before any Tier 2 decision is finalized, a single-agent Routine fires with one instruction: "Take the opposing position on this decision and produce the 3 strongest arguments against it." Not a board meeting — lighter, faster, costs ~$0.05. The output lands in the Linear ticket as a comment before Adam reviews.

**3. The Mirror Agent (new)**
A dedicated subagent whose only job is to maintain a running thread of "Adam's stated positions." When Adam makes a decision that contradicts something he said in the last 30 days, the Mirror Agent flags it: "Past Adam (2026-04-28) said X. Today you are doing Y. Deliberate change? If yes, update DECISIONS.md." This is the "you said X yesterday but Y today, are you sure?" pattern.

**The guardrail:** The Mirror Agent can flag contradictions but cannot block. Adam's prerogative is always to change his mind — the system just makes the change visible and deliberate rather than accidental.

**4. The Weekly "What Did I Refuse to Hear?" Question**
Built into the Sunday evening review Routine: "Scan all agent outputs from this week where Adam rejected or overrode a recommendation. Summarize the pattern. Are there blind spots?" Not to second-guess Adam — to surface systematic biases in his decision-making before they compound.

---

## Learning System

**The problem:** GEO market is moving fast. AI engineering patterns change weekly. Adam needs to level up in parallel with building — not instead of building.

**The architecture:**

**Daily 5-minute briefing (Routine, 07:00 — fires before deep work):**
- Research Lead (Sonnet, 07:00 Routine): scans 3 sources — Hacker News top 10, competitor LinkedIn/blog posts, AI newsletter digest. Filters for "signal, not noise" — only items with direct Beamix relevance. Outputs a 5-bullet Linear card. Adam reads it with coffee, spends 0 extra minutes fetching news.

**Learning Queue (Tiago Forte's PARA "Resources" area):**
- Any article/video/paper the briefing flags as "deep read needed" goes to Learning Queue as a Linear ticket tagged "learn."
- Weekly Review allocates 90-120 minutes of learning time (batched, not daily interruptions).
- The army estimates read time so Adam can pick a 15-minute item vs. a 90-minute paper based on available focus.

**Spaced repetition of past decisions (James Clear's habit stacking):**
- Every 30 days, a Routine resurfaces 5 decisions from DECISIONS.md that are 30-90 days old: "Here's what you decided and why. Does this still hold? Yes/No/Update?"
- If Adam answers "Update," the army revises the decision and logs the change with rationale.
- This is memory + learning working together. Past decisions become a knowledge base, not a dead archive.

**Domain-specific skill-ups (on trigger, not schedule):**
- When the army encounters a new domain (e.g., Adam wants to add voice agents), Research Lead fires a learning brief: "Here are the 3 things you need to understand before making architectural decisions in this domain." Not a textbook — a decision-relevant primer. ~500 words, 5 minutes.

---

## Dual-Language (HE + EN) System

**The reality:** Adam thinks in Hebrew sometimes, writes in English mostly, mixes both in planning and strategy. The army needs to follow, not force a choice.

**The system:**

**Language detection — automatic, never explicit:**
- All input (voice, text) passes through a lightweight Haiku classifier: detect language → route to the appropriate response language.
- Rule: respond in the language Adam used. If Hebrew, respond in Hebrew. If English, respond in English. If mixed, respond in English.
- Never ask "which language do you prefer?" — that's friction.

**Memory files — always English:**
- DECISIONS.md, LONG-TERM.md, session files: English. This is the canonical layer. Searchable, consistent, agent-readable.
- When Adam inputs in Hebrew, the agent translates to English for memory storage, preserves the original in a `raw_input` field.

**Context preservation across languages:**
- If Adam switches languages mid-conversation (common for emotional/strategic content where Hebrew feels more natural), the agent acknowledges the switch and continues in the new language. No reset of context.
- "הקוד עובד?" → agent understands this is a code question, responds in Hebrew.
- The Telegram/iMessage Channel plugin passes language metadata so cloud Routines know which language to use in push notifications.

**Israeli market context:**
- Research Lead's competitive briefing includes Israeli-market signals (Calcalist, Geektime, local investor moves) where relevant, written in English for the memory layer but flagged as "IL-market" for easy filtering.

---

## The Future-Adam Context Loop

**Tiago Forte's principle:** Your notes are a gift to your future self. The army can make this systematic.

**Daily breadcrumb (5 min, night):**
Three fields, spoken into voice capture or typed in Linear:
1. "What moved today?" — one sentence.
2. "What's stuck?" — one sentence.
3. "What would I tell tomorrow-Adam?" — one sentence.

The night Routine reads these, appends a timestamped entry to `.claude/memory/LONG-TERM.md`, and extracts any decision or technical fact into the appropriate memory file. Adam never manually updates memory files.

**Decision postmortems (monthly):**
Once a month, a Routine fires: "Pick 3 decisions from 30 days ago. One that was right, one that was wrong, one that's still unclear. Write 2-sentence postmortem for each." Output lands in `docs/07-history/` with a timestamp. This builds the "Past Adam" knowledge base.

**The 3-month context package:**
Every 90 days, the CEO agent assembles a "Past Adam brief": key decisions made, outcomes observed, things that were predicted and didn't happen, current momentum metrics. Written as if briefing a new co-founder. Stored in `docs/07-history/YYYY-QN-past-adam.md`. When Adam revisits a strategic question 6 months from now, he reads this first.

**"Past Adam said..." surfacing:**
Mirror Agent (from the Loneliness section above) handles this. Before any Tier 2 decision, it surfaces relevant past context from DECISIONS.md and session files: "Last time you considered X (2026-03-12), you decided against it because Y. Context today: Z."

---

## Guardrails Against Voice Erosion

**The risk:** Adam spends 8 hours a day reading agent output. Agent output is fluent, confident, structured. Over time, Adam starts "thinking like an agent" — precise, dispassionate, pattern-matched. The founder's intuition — which is not pattern-matched, which is sometimes irrational, which is often right — gets outsourced.

**This is the most subtle failure mode. The guardrails:**

**1. Weekly "Raw Adam" session (30 min, no agents):**
One session per week with no army input at all. Paper + pen (or voice memo). Adam thinks out loud about the company, product, market — unmediated. The output is stored as a voice memo or written note. The army may read it afterward but may not contribute to it. This is Adam's unfiltered signal.

**2. The "who is actually deciding here?" audit:**
Once a month, the CEO agent reviews the last 30 decision records and flags any where Adam approved an agent recommendation without modification. If >70% of decisions are unmodified approvals, the audit returns a warning: "You may be deferring too much to the army. The next 5 decisions should be made before consulting agents." Healthy autonomy ratio: 40-60% unmodified approvals. Higher than 70% is a warning sign.

**3. No agent output in customer conversations:**
Hard rule: agent-drafted content (pitch decks, sales emails, customer proposals) goes through Adam's voice before leaving the building. Not a light edit — a rewrite in his own words. The army researches and structures; Adam speaks.

**4. Preserve "I was wrong" in plain language:**
When Adam changes his mind, he writes the reason in his own words in DECISIONS.md — not delegated to the CEO agent to write. This is the one thing agents cannot do for him. The act of articulating "I was wrong, here's why" is what keeps the founder's critical faculty sharp.

**5. The "surprise budget":**
James Clear: the system should serve the human, not the other way around. Adam gets to break the system. 10% of his week is intentionally unscheduled, unagentified. No Routines fire. No Linear inbox review. Just founder time — conversations, walks, reading, curiosity. This is where the ideas that can't be captured in a dictation shortcut actually emerge.

---

## Health & Energy as System Input

**The insight:** Cognitive quality is correlated with sleep quality within 24-48 hours. If the army can read Adam's energy state, it can adjust the day's agent dispatch agenda, decision load, and notification frequency. This is not biohacking — it's operations.

**The signals (Apple Watch is sufficient — no new hardware needed):**
- Sleep hours and quality (Heart Rate Variability + resting HR from Health app)
- Active energy / movement
- Resting heart rate trends (elevated resting HR is a stress signal)

**The integration (simple, no paid tools):**
- A daily iOS Shortcut fires at 07:00, reads Apple Health data via HealthKit API, classifies Adam's energy state: Green (well-rested, HRV normal) / Yellow (moderate fatigue) / Red (sleep-deprived or high-stress signal).
- This classification is passed as a context variable to the morning Routine.

**What the army adjusts based on energy state:**

| State | Adjustment |
|-------|-----------|
| **Green** | Normal dispatch. Tier 2 Decisions Session can fire if Sunday. Deep-work block protected. |
| **Yellow** | Push non-critical Tier 1 decisions to tomorrow. Morning briefing shortened to 3 bullets. No new agent kickoffs until afternoon. |
| **Red** | Army goes minimal. Morning briefing is 1 bullet: "Top P0 only." Defer all Tier 2 decisions 24h automatically. Telegram sends: "Adam — low energy day. Army is running autonomously. Only P0s will ping you." |

**What the army never does:**
- Never tells Adam he's tired (paternalistic).
- Never cancels a decision Adam explicitly said he wants to make today.
- Red state reduces load — it doesn't stop work. The army continues; Adam is just shielded from notification volume.

**The sleep-protection rule:**
No Routine sends a Telegram notification between 23:00 and 07:30 Israel time unless it is a P0 production incident. Not "interesting," not "thought you'd want to know" — P0 only.

---

## The Family / Partner / Off-Hours Layer

**The problem:** Solo founders have a documented pattern of letting work colonize everything. The army, if not bounded, will operate exactly like the founder — without a sense of when to stop.

**The off-hours definition:**
Adam defines it explicitly, once, in a settings file (`.claude/personal/off-hours.json`):
```json
{
  "off_hours": {
    "weekdays": "20:00–07:30",
    "shabbat": "Friday 17:00–Saturday 20:00",
    "holidays": ["list of chagim"],
    "partner_time": "ad-hoc, triggered by /family command"
  }
}
```

**During off-hours:**
- All Routines continue running (the army doesn't sleep — that's the whole point).
- All Telegram/iMessage notifications are suppressed unless P0.
- Linear Inbox does not send push notifications.
- The morning Routine at 07:30 delivers the full summary of what happened overnight — Adam catches up in one 3-minute read.

**The /family command (new slash command):**
Adam types `/family 3h` (or speaks it via iMessage Channel) → all non-P0 interruptions pause for 3 hours, army logs "Family time: 3h block, resuming at [time]." No agent can override this except a live production outage. This command should feel like closing the office door, not like managing a system.

**Partner / family respect built-in:**
The army never surfaces work-related content via shared devices or family channels. Agent outputs go to Linear and Telegram (Adam's personal channels) only — not to shared family groups, not to iMessage threads that include others.

**The "present" signal:**
When Adam is genuinely off (Shabbat, vacation), the army's job shifts: it runs Routines, queues outputs, and prepares a "welcome back" brief — a curated summary of what happened while he was away, decisions pending, and recommended first actions. First thing Monday morning (or post-Shabbat): one Linear card, 5 bullets, zero notification debt from the weekend.

---

## Bottom Line

**What the board must decide:**

**1. The daily rhythm — does Adam commit to it?**
The capture loop, the energy classification, the midday sync, the evening journal — these only work if Adam treats them as system primitives, not nice-to-haves. The army can make them frictionless, but Adam must choose to engage with the 3-minute morning triage and the 5-minute evening journal. Without this, the army has no signal to work with.

**Decision needed:** Which of the daily touchpoints (morning triage, midday sync, evening journal) does Adam commit to? All three is ideal. Two is acceptable. Zero makes the rest unworkable.

**2. The off-hours boundary — who defines it?**
The army will work 24/7 unless bounded. The off-hours file needs to be written by Adam and treated as a policy, not a preference. This is about protecting the person, not optimizing the company.

**Decision needed:** Adam defines `off-hours.json` — weekday cutoff time, Shabbat rule, partner-time protocol. One-time setup, permanent effect.

**3. The voice-erosion guardrails — does Adam want them enforced?**
The "who is actually deciding here?" monthly audit and the "Raw Adam" weekly session are protective mechanisms against founder-identity erosion. They feel counterintuitive — "why would I not use the army?" — but the risk is real and documented at other AI-native companies.

**Decision needed:** Does Adam want the 70% unmodified-approval warning turned on? Does he commit to one 30-min no-army session per week?

---

**What this board is not deciding today:** health wearables (Apple Watch is already sufficient), new tools (zero new tools required — all of this runs on Linear + Claude + iOS Shortcuts + Claude Code Routines), or hiring. This is a human-systems question, not a product question.

The personal OS is already available. It just needs to be installed — one decision at a time.

---

*Filed by: Personal Systems Designer persona — board meeting round, no cross-talk. 2026-05-06.*
