# THE CHIEF OF STAFF — Round 1 (no cross-talk)
**Date:** 2026-05-06 · **Role:** McKinsey-trained operator, COO-equivalent at 3 AI-native startups
**Constraint set:** $0 new software, Claude Max $100/mo paid, 8GB Mac for self-hosting, $20-50/mo cloud max, Adam is solo

---

## Headline

**The missing operating system is a cadence layer that sits between "Adam has an idea" and "an agent works on it" — without that layer, the army has no rhythm, accountability, or memory of its own mistakes.**

V2 correctly identifies what to build (Routines, Memory Tool, remote control, pgvector). What it hasn't answered is: once those are wired, how does the fleet run *itself* day to day? Right now, Adam IS the cadence. When he's in the car, the army idles. When he opens Claude Code, the army scrambles. That's a founder-in-the-loop bottleneck masquerading as an autonomous company.

The fix: **five operating rituals encoded as Routines** (cron-scheduled headless agents), a **single shared runtime doc that agents read AND write**, and a **weekly 1:1 protocol** so Adam audits the fleet's own thinking rather than doing its work.

---

## The Cadences

### Principles first

Every cadence must satisfy three tests:
1. Adam can miss it entirely and catch up in under 5 minutes.
2. The output lives in a file agents can read — not only in Adam's head.
3. The Routine costs less than $0.50 to run.

### Daily Cadences

**07:30 — Morning Digest Routine** (`routine/morning-digest`)

Headless agent (Sonnet) reads:
- `docs/00-brain/log.md` (last 7 entries)
- `.claude/memory/DECISIONS.md` (last 3 entries)
- Linear: open `[BEAMIX]` tickets with status `In Progress` or `Blocked` (via Linear MCP or API)
- `docs/08-agents_work/sessions/` (files from last 24h)

Writes to: `docs/08-agents_work/digests/YYYY-MM-DD-morning.md`

Format (fixed, parseable):
```markdown
## Morning Digest — YYYY-MM-DD 07:30

### Overnight completions
- [agent] completed [task] — [branch] merged | blocked
- ...

### Blocked agents (needs Adam)
- [agent]: [1-sentence blocker] — decision needed: [A or B?]
- ...

### Today's recommended focus (top 1)
[Single paragraph. What would a McKinsey COO do today if they could only touch one thing?]

### Cost yesterday
API spend (estimated): $X.XX | Routines: $X.XX | Total: $X.XX
```

Adam reads this on his phone in under 2 minutes. He responds by creating a Linear ticket or tapping approve — not by opening Claude Code.

**20:00 — End-of-Day Sync Routine** (`routine/eod-sync`)

Headless agent (Haiku — cheap) reads all session files written today, appends to `docs/00-brain/log.md`, checks for open worktrees older than 12h with no commit in the last 2h (potential abandoned work), pings Adam via Telegram if any found.

Output: 3-bullet append to `docs/00-brain/log.md`. No separate file. Zero Adam time unless a ping fires.

**On-demand — BLOCK escalation Routine** (`routine/unblock`)

Fires when any agent writes `BLOCKED` to its session file. Automated trigger via stop-hook watching for `outcome: BLOCKED` pattern. The Routine (Sonnet) reads the blocker, attempts 3 resolution strategies:
1. Re-read relevant docs — does the answer already exist?
2. Check DECISIONS.md — was this decided before?
3. Synthesize a recommendation with 2 clear options.

If resolved: patches the session file, re-fires the original agent.
If not: sends a Telegram ping to Adam with the 2-option question. Max 1 ping per 4 hours per agent.

This is the single highest-leverage daily mechanism. It converts "agent waits for Adam" into "agent self-resolves or sends Adam a binary choice."

### Weekly Cadences

**Monday 08:00 — Weekly Fleet Standup Routine** (`routine/weekly-standup`)

Runs before Adam's day starts. Sonnet reads:
- All session files from the past 7 days
- DECISIONS.md (full)
- `docs/BACKLOG.md`
- Linear: all tickets closed in the last 7 days + all tickets still open

Writes to: `docs/08-agents_work/digests/YYYY-WW-weekly.md`

Format:
```markdown
## Weekly Standup — Week WW (YYYY-MM-DD)

### Shipped last week
| Task | Agent | Status | Branch |
|------|-------|--------|--------|

### Not shipped — why
| Task | Agent | Blocker | Days stuck |
|------|-------|---------|------------|

### Decision log (made this week)
| Decision | Rationale | Reversible? |
|----------|-----------|-------------|

### Decisions you'll regret (Chief of Staff flag)
[Decisions made this week that look right now but carry hidden risk — with specific reasoning]

### Cost & time allocation
| Domain | Sessions | Est. tokens | Est. $ |
|--------|----------|-------------|--------|
| Build | X | X | $X |
| Research | X | X | $X |
| QA | X | X | $X |
| Other | X | X | $X |
**Total:** $X

### Dependency map (who's blocked on what)
[If none: "No cross-agent dependencies this week."]

### Recommended focus this week (top 3 ordered)
1. [Task] — because [1-sentence reason]
2. [Task] — because [1-sentence reason]
3. [Task] — because [1-sentence reason]
```

This IS the Monday morning standup. Adam reads it while having coffee. It replaces any need to "check in" with individual agents.

**Friday 18:00 — Weekly Retro Routine** (`routine/weekly-retro`)

See dedicated Retros section below.

**Wednesday 10:00 — Dependency Sweep** (`routine/dependency-sweep`)

Mid-week check. Haiku reads all open session files with `outcome: BLOCKED` or `outcome: PARTIAL`. Writes a 10-line dependency map to `docs/08-agents_work/digests/YYYY-WW-deps.md`. Pings Adam only if any agent has been blocked more than 48h.

### Monthly Cadences

**1st of month — OKR Review Routine** (`routine/monthly-okr-review`)

Sonnet reads the OKR file (see OKRs section), reads all weekly digests from the prior month, and writes a 1-page review to `docs/08-agents_work/digests/YYYY-MM-okr-review.md`.

Format: each OKR graded Red/Yellow/Green, 1-sentence why, recommended adjustment.

Adam reads in under 5 minutes. Adjusts OKRs if needed by editing the OKR file directly.

**1st of month — Cost Audit Routine** (`routine/monthly-cost-audit`)

Haiku aggregates all daily digest cost lines from the prior month. Flags any domain spending >20% above its prior-month average. Output: `docs/08-agents_work/digests/YYYY-MM-cost-audit.md`. Adam reads if flagged; ignores if clean.

### Quarterly Cadences

**Quarterly — Architecture Review**

Not a Routine — this is Adam + CEO agent in a live session. Agenda: read all monthly OKR reviews + cost audits from the quarter, then answer three questions:
1. Which agents are delivering disproportionate value? (promote — give more scope, better model)
2. Which agents are consistently blocked or silent? (diagnose — bad spec? wrong model? retire?)
3. What parts of the system are accumulating debt? (schedule a dedicated cleanup sprint)

Output: updated DECISIONS.md + updated agent files if behavior changes are warranted.

---

## OKRs for Agents

### Why agents need OKRs

Without goals, agents optimize for task completion, not outcomes. An agent that ships 10 features but introduces 3 P0 bugs is not performing. OKRs give agents a measurable contract — and give Adam a legible signal of fleet health.

### OKR File Structure

One file: `docs/08-agents_work/OKRs.md`

```markdown
# Beamix Agent Fleet OKRs
*Quarter: Q2 2026 (May–Jul)*
*Set by: CEO + Adam*
*Reviewed: 1st of each month*

## Fleet-level Objective
Ship a GEO platform that earns its first 10 paying customers.

### Key Results (fleet-wide)
- KR1: 0 P0 bugs reach main branch (measured: weekly code review by qa-lead)
- KR2: QA gate passes on 100% of merges (measured: session file audit, Routine)
- KR3: Token cost per session <$0.40 average (measured: monthly cost audit)
- KR4: 0 sessions abandoned without a session file written (measured: Routine check)

## Per-Agent OKRs
[One entry per active agent lead — see examples below]
```

### OKR Template (per agent lead)

```markdown
### [Agent Name] — Q2 2026
**Objective:** [What the agent exists to accomplish this quarter]
**Key Results:**
- KR1: [Measurable. Has a number and a measurement method.]
- KR2: [Measurable. Has a number and a measurement method.]
- KR3: [Measurable. Has a number and a measurement method.]
**Owner:** [Agent name — the agent reads and updates this]
**Reviewed by:** CEO Routine on 1st of each month
```

### Worked Example 1 — Build Lead

```markdown
### build-lead — Q2 2026
**Objective:** Ship all Wave 2 + Wave 3 features with zero P0 bugs and no abandoned worktrees.
**Key Results:**
- KR1: 100% of build sessions have qa_verdict PASS in session file (measured: monthly-okr-review Routine reading session files)
- KR2: 0 worktrees older than 48h with no commit (measured: eod-sync Routine nightly check)
- KR3: All Wave 2 features merged to main by end of May 2026 (measured: git branch list + BACKLOG.md)
```

### Worked Example 2 — Growth Lead + Growth Team

```markdown
### growth-lead — Q2 2026
**Objective:** Build the content and SEO foundation that earns Beamix's first organic signups.
**Key Results:**
- KR1: 6 GEO-specific blog posts published (measured: /archive page + Framer CMS count)
- KR2: Framer marketing site passes Core Web Vitals on mobile (measured: Playwright test added to weekly QA)
- KR3: 3 outbound email sequences drafted and approved by Adam (measured: docs/05-marketing/ file count)
```

### Worked Example 3 — QA Lead

```markdown
### qa-lead — Q2 2026
**Objective:** Make the QA gate real — not theater.
**Key Results:**
- KR1: QA stop-hook installed and blocking merges on 100% of non-trivial PRs (measured: .claude/settings.json audit)
- KR2: Risk-tiered QA applied correctly — Trivial/Lite/Full assigned per PR scope (measured: session file review)
- KR3: 0 P0 bugs discovered post-merge (measured: AUDIT_LOG.md entries tagged P0)
```

### How OKRs are set

1. Adam writes the fleet-level Objective each quarter in a 10-minute session with CEO.
2. CEO drafts per-agent KRs based on the Objective + current BACKLOG.md.
3. Adam reviews and approves the full OKRs.md file.
4. The file is committed. Agents read it in pre-flight as part of DECISIONS.md.
5. Monthly OKR Review Routine grades them and flags drift.

Adam's time investment: 30 minutes per quarter to set, 5 minutes per month to review.

---

## Accountability Model

### How "performance" is tracked across an agent's lifecycle

Agents don't have feelings. But they do have a behavioral record. The record lives in three places:

**1. Session files** (`docs/08-agents_work/sessions/YYYY-MM-DD-[agent]-[task].md`)
Each file has `outcome: COMPLETE | BLOCKED | PARTIAL`. The monthly-okr-review Routine counts these ratios per agent type. An agent with >30% PARTIAL outcomes over a month is flagged.

**2. AUDIT_LOG.md** (`.claude/memory/AUDIT_LOG.md`)
Every P0 bug, security issue, or failed deployment gets a dated entry with the responsible agent type noted. The monthly cost audit checks this file for patterns.

**3. OKRs.md**
Monthly grading gives each agent lead a Red/Yellow/Green per KR. Two consecutive Red months on any KR triggers an "agent PIP" (see below).

### What happens when an agent ships a bug

1. P0/P1 bug discovered post-merge.
2. qa-lead (if available) or CEO writes an AUDIT_LOG.md entry immediately:
   ```markdown
   ### [YYYY-MM-DD] — [BUG TYPE] — [Severity]
   **Agent responsible:** [agent type]
   **Session file:** [path]
   **Root cause:** [1 sentence]
   **Escaped because:** [what QA check should have caught it]
   **Fix:** [branch/commit]
   **Prevention:** [concrete rule change — written to which agent's .md file]
   ```
3. The "Prevention" step is mandatory and non-negotiable. If no concrete rule change is written, the bug WILL recur.

### The agent-equivalent of a PIP

An agent "PIP" is a targeted modification to the agent's system prompt or brief template — not punishment, but recalibration. Two consecutive Red OKR months, or any P0 bug, triggers a PIP review:

1. CEO reads the agent's `.agent/agents/[name].md` + all its recent session files.
2. Identifies the failure pattern: Is the agent over-scoped? Under-constrained? Using the wrong model? Missing a critical skill?
3. Writes a concrete fix to one of:
   - The agent's `.md` file (behavior change)
   - The CEO brief template for that agent (constraint added)
   - The relevant SKILL.md (new pattern to follow)
4. The fix is committed. Next session with that agent uses the updated file.
5. If the same failure recurs after the PIP: the agent's scope is reduced or the role is retired.

The PIP cycle costs 30 minutes and permanently improves every future session. It is the highest-ROI maintenance action in the fleet.

---

## Blocker Escalation

### The problem with today's pattern

Today: agent hits ambiguity → writes `outcome: BLOCKED` → stops → waits. Adam sees it when he next opens Claude Code. Average delay: 4-16 hours. The army idles.

### The better path: 4-level escalation ladder

**Level 1 — Self-resolve (agent, no Adam, ~0 turns)**

Before writing BLOCKED, every agent MUST attempt:
1. Re-read the relevant MOC in `docs/00-brain/` — does the answer exist?
2. Grep DECISIONS.md for the keyword — was this decided before?
3. Check the relevant SKILL.md — is there a known pattern?

This is NOT optional. "I couldn't find the answer" is the required evidence to escalate. An agent that writes BLOCKED without showing evidence of L1 attempts gets its brief rejected by CEO.

**Level 2 — Routine unblock (automated, no Adam, ~5 min)**

The `routine/unblock` Routine (described in Cadences) fires automatically. It reads the blocker and attempts resolution with a fresh context. It has access to all docs but no write access to source files. If it resolves: patches the session file and re-fires the agent. If not: proceeds to L3.

**Level 3 — Binary ping (1 Telegram message to Adam, ~30 seconds Adam time)**

The Routine sends one Telegram message in this exact format:
```
[BEAMIX AGENT BLOCKED]
Agent: build-lead
Blocker: "Should the scan API return 202 or 200 for async scans?"
Option A: 202 Accepted (async, industry standard)
Option B: 200 OK (simpler, current mock returns this)
Recommendation: A
Reply A or B.
```

Adam replies A or B. The Routine writes the answer to DECISIONS.md and re-fires the agent. Adam time: 30 seconds.

This message format is non-negotiable. No paragraphs. No context dumps. One binary question. The Routine does the synthesis — Adam only decides.

**Level 4 — Synchronous session (Adam opens Claude Code, ~30 min)**

Reserved for blockers that are genuinely architectural — cannot be answered with A or B. These are rare. The morning digest flags them prominently. Adam schedules a session.

### Hard rules

- An agent MUST show L1 evidence before escalating to L2.
- The Routine MUST format L3 as a binary question before pinging Adam.
- No agent pings Adam more than once per 4 hours.
- No agent escalates to L4 without first attempting L1-L3.

---

## Retros That Compound

### Why retros matter for an AI fleet

Agents don't carry lessons between sessions by default. Every new session is a fresh context. Without explicit retro capture, the fleet makes the same mistakes forever. The supabase_plpgsql bug is the proof: it required 6 iterations in one session, burned ~$3 in tokens, and only got written to memory because Adam's feedback loop was intact. Without a retro mechanism, that lesson evaporates.

### The retro mechanism

**Trigger:** Every feature merge OR every failed task.

**Who runs it:** The Friday 18:00 Weekly Retro Routine (`routine/weekly-retro`) — automated, headless, Sonnet.

**What it reads:**
- All session files from the week with `outcome: COMPLETE` or `outcome: PARTIAL` or `outcome: BLOCKED`
- AUDIT_LOG.md entries from the week
- Git log from the week (`git log --oneline --since="7 days ago"`)

**What it writes:** One retro file per week at `docs/08-agents_work/retros/YYYY-WW-retro.md`

Format (strict — must be machine-readable for the monthly OKR routine to parse):

```markdown
# Weekly Retro — Week WW (YYYY-MM-DD to YYYY-MM-DD)

## What shipped
- [task] — [agent] — [commit hash]

## What didn't ship (and why)
- [task] — [agent] — [root cause in 1 sentence]

## Mistakes made (with evidence)
| Mistake | Agent | Root cause | Prevention written? |
|---------|-------|------------|---------------------|
| [e.g., used wrong PK column name] | backend-developer | agent file didn't include schema facts | YES — added to backend-developer.md §DB_FACTS |

## Patterns emerging
[2-3 sentences. What failure pattern is appearing across sessions? E.g., "Workers consistently miss the daily-cap enforcement check — it needs to be in the brief template, not just the agent file."]

## Rules added this week
- [Rule text] → written to [file]
- [Rule text] → written to [file]

## Token spend this week
- Estimated: $X.XX
- vs prior week: +/- X%
- Biggest single session: [task] at ~$X.XX
```

**The "Rules added this week" section is the compounding flywheel.** Each retro produces 1-3 concrete rule changes, written to agent files, brief templates, or SKILL.md files. These rules persist. Over 12 weeks, the fleet's failure rate drops because the same mistakes stop being possible.

### Retro indexing

The monthly OKR review Routine reads all 4 retro files from the month. It extracts the "Patterns emerging" sections and synthesizes a monthly pattern report, which becomes an input to quarterly architecture review.

This is how the fleet learns: retro → rule → pattern → architecture change. Each layer compounds the previous.

---

## Adam's Weekly 1:1 with the Fleet

### What this is

Not a work session. A CEO audit. Adam reads what the fleet produced and evaluates whether the fleet is thinking correctly — not whether the code is correct (that's QA's job), but whether the *decisions and reasoning* are correct.

30 minutes. Every Monday. After reading the weekly digest.

### The script

**Step 1: Read the weekly digest** (5 min, already done as part of morning routine)

`docs/08-agents_work/digests/YYYY-WW-weekly.md`

**Step 2: Spot-check 2 session files** (10 min)

Pick 2 sessions from last week at random. Read the `decisions` field and `context_for_next_session`. Ask: "Does this decision make sense? Would I have made the same one? Is the context complete enough for the next session to continue without briefing?"

If NO: write a correction to DECISIONS.md and flag it in the morning digest for next session.

**Step 3: Read the "decisions you'll regret" section** (3 min)

The weekly digest includes this section (populated by the Routine). These are decisions that looked correct at the time but carry hidden risk. Adam's job: either confirm them or reverse them now, while the cost of reversal is low.

**Step 4: Check the dependency map** (2 min)

`docs/08-agents_work/digests/YYYY-WW-deps.md`

Is anything blocked more than 48h? Is there a pattern of the same agent blocking repeatedly?

**Step 5: Write one instruction** (5 min)

Based on what Adam saw, write one concrete instruction to the fleet. This goes into one of:
- A specific agent's `.md` file
- The CEO brief template
- DECISIONS.md
- A new SKILL.md or memory file

One instruction, written clearly, committed to main. This is the most important 5 minutes of the week. It is Adam's primary operating lever on the fleet's behavior.

**Step 6: Update OKRs if needed** (5 min)

Is anything drifting? Adjust a KR or objective in `docs/08-agents_work/OKRs.md`. This takes 2 minutes if nothing is wrong and 5 minutes if something is.

### Outputs from the 1:1

1. 0-2 corrections written to agent files or DECISIONS.md
2. 1 instruction committed
3. OKRs confirmed or adjusted
4. Mental model of fleet health refreshed — without reading hundreds of lines of code

### The 1:1 is NOT

- A work session (Adam is not building anything)
- A code review (that's QA's job)
- A planning session (that's the quarterly architecture review)

If Adam finds himself wanting to "jump in and fix" something during the 1:1, that's a signal the fleet didn't do its job. Write that gap as an instruction instead.

---

## Onboarding the 33rd Agent (and the 1st Human Hire)

### For the 33rd agent (a new AI agent added to the fleet)

Today's pattern: Adam manually briefs the new agent, explains context, it goes off half-cocked.

**The better pattern — self-onboarding via the Brain:**

Every new agent MUST run this exact sequence before any task:

```markdown
# Agent Onboarding Protocol (all new agents)

Step 1: Read CLAUDE.md (project conventions, stack, rules)
Step 2: Read docs/00-brain/_INDEX.md (knowledge navigation hub)
Step 3: Read the domain MOC for your area (see _INDEX.md)
Step 4: Read .claude/memory/DECISIONS.md (all past decisions)
Step 5: Read docs/08-agents_work/OKRs.md (your objectives)
Step 6: Read docs/08-agents_work/retros/[most recent retro] (what failed recently)
Step 7: Read .claude/memory/AUDIT_LOG.md (what broke and why)
Step 8: Read your own agent file: .agent/agents/[name].md
Step 9: Read 2-3 session files most relevant to your domain
Step 10: Report back to CEO: "I have read X files. My understanding of my role is: [2 sentences]. My first question is: [1 question]."
```

This protocol is written into every agent's `.md` file as a mandatory first step. An agent that skips it gets re-briefed.

**The onboarding test:** After the above, CEO asks: "What is the primary accent color? What is the current pricing? Who runs the QA gate?" If the agent answers correctly: onboarded. If not: it didn't read the files — re-run.

### For the 1st human hire (the day the company gets a real employee)

The same Brain infrastructure serves them. The human hire gets:

1. Access to the repo
2. A 15-minute read of CLAUDE.md + docs/00-brain/_INDEX.md + their domain MOC
3. A 30-minute walkthrough of the weekly digest format so they understand the operating rhythm
4. Write access to their domain's docs folder
5. A Linear account linked to the same project the fleet uses

The key architectural point: **the Brain is not the agent's documentation — it's the company's documentation.** It serves humans and AI equally. The human hire doesn't need a separate onboarding wiki. The Brain is the wiki.

The only delta for humans: they attend the quarterly architecture review live (30 min via call) and write their own session files in the same format after any significant work session.

---

## Documentation as Runtime

### The problem with docs-written-then-forgotten

Every agent reads `CLAUDE.md` at session start. But then it reads `PRD.md` for context, writes some code, and exits. The PRD didn't change. The code might contradict the PRD. Neither the agent nor the PRD knows.

Documentation as a *runtime* means: **every file that agents read, agents also write to**. The docs are not static reference — they are the live state of the company.

### The read/write matrix

| File | Who reads it | Who writes it | Frequency |
|------|-------------|---------------|-----------|
| `docs/00-brain/log.md` | CEO (every session) | CEO + all leads (every session) | Every session |
| `docs/08-agents_work/OKRs.md` | All agents (pre-flight) | CEO + Adam (quarterly/monthly) | Quarterly + monthly |
| `docs/08-agents_work/digests/YYYY-WW-weekly.md` | Adam (Monday AM) | Weekly Standup Routine | Weekly |
| `docs/08-agents_work/digests/YYYY-MM-DD-morning.md` | Adam (daily AM) | Morning Digest Routine | Daily |
| `docs/08-agents_work/retros/YYYY-WW-retro.md` | CEO + all leads (pre-flight if recent) | Weekly Retro Routine | Weekly |
| `.claude/memory/DECISIONS.md` | All agents (pre-flight) | Any agent making a decision | Per decision |
| `.claude/memory/AUDIT_LOG.md` | QA Lead + CEO + Routines | Any agent finding a P0/P1 bug | Per bug |
| `.claude/memory/LONG-TERM.md` | CEO (every session) | CEO after each session | Per session |
| `docs/BACKLOG.md` | All leads (domain-specific) | product-lead + CEO | Weekly |
| `docs/PRD.md` | product-lead + build-lead | product-lead | Per feature |
| Agent `.md` files | Each agent (mandatory) | CEO (PIPs + retro rule additions) | Per PIP/retro |

### The three runtime behaviors that matter

**1. Agents COMMIT documentation changes as part of task completion.**

A task is not COMPLETE until:
- A session file is written (`docs/08-agents_work/sessions/`)
- `docs/00-brain/log.md` has a new entry
- DECISIONS.md has any new decisions

This is enforced by the CEO validation step. A lead that returns without these artifacts gets re-briefed.

**2. The weekly retro writes rules back into agent files.**

This is the compounding mechanism. Rules don't live only in DECISIONS.md — they get written into the specific agent `.md` file they apply to. So next time that agent runs, the rule is in its system prompt, not in a separate file it has to remember to read.

**3. The Brain MOCs are kept current by the lead who owns the domain.**

Every domain MOC in `docs/00-brain/` has a designated owner (build-lead owns MOC-Codebase.md, product-lead owns MOC-Product.md, etc.). When a new file is added to that domain, the lead adds a link to the MOC in the same session. An un-linked doc is invisible to agents — it effectively doesn't exist.

### Concrete daily runtime flow

```
07:30: Morning Digest Routine reads 6 files → writes 1 digest file
[Adam reads digest on phone]
09:00: Agent session starts → reads CLAUDE.md + DECISIONS.md + domain MOC + OKRs + recent retro
[Agent works]
[Agent writes session file + updates log.md + updates domain doc if changed]
20:00: EOD Sync Routine reads all new session files → appends to log.md → checks worktrees
[Loop]
Friday 18:00: Weekly Retro Routine reads all session files → writes retro → adds rules to agent files
Monday 08:00: Weekly Standup Routine reads retro + sessions + Linear → writes weekly digest
[Adam reads weekly digest — 1:1 with fleet]
1st of month: OKR Review Routine grades all agents → Adam adjusts OKRs
```

This is the runtime. Documentation is not a deliverable. It is the medium through which the fleet operates.

---

## Bottom Line

**Three decisions the board must make:**

**Decision 1: Encode the 5 Routines into Claude Code Routines (or Inngest) before any other Wave 3 work.**

The V2 synthesis describes what to build. But it doesn't prescribe *when* the fleet operates. Without the 5 Routines (morning-digest, eod-sync, unblock, weekly-standup, weekly-retro), "autonomous army" means "army that works when Adam is at his terminal." The Routines are the autonomy. They cost ~$5-15/mo in API tokens and $0 in new software. This is the first week's work, not the last.

**Decision 2: Adopt the binary-ping escalation protocol as a hard rule in every agent's .md file.**

Today's BLOCKED pattern is a silent time bomb. Every hour an agent waits is an hour of compound delay on everything downstream. The binary-ping protocol (L1 self-resolve → L2 Routine unblock → L3 binary Telegram ping → L4 live session) caps maximum agent downtime at 4 hours. It requires 30 minutes to implement (update 9 agent files + write the unblock Routine). The ROI is every future blocked agent resolved without Adam opening Claude Code.

**Decision 3: Commit to one weekly 1:1 with the fleet (Monday, 30 min).**

This is the operating lever Adam doesn't realize he needs. The Routines run the army. The 1:1 steers it. Without the 1:1, the fleet drifts — correct locally, wrong directionally. The weekly instruction written during the 1:1 is Adam's primary tool for shaping the fleet's behavior without micromanaging it. Thirty minutes per week. Non-negotiable if the goal is a company, not a terminal session.

---

*Written by the Chief of Staff — no cross-talk with other board personas.*
*File: `docs/08-agents_work/2026-05-05-war-room-rethink/15-chief-of-staff-fleet-ops.md`*
