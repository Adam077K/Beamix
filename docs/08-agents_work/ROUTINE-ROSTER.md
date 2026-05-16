---
title: Beamix War Room — Routine Roster v1
date: 2026-05-08
status: LOCKED — Adam approved 2026-05-08
supersedes: ORCHESTRATION.md §2E (10 standing Routines design — CEO Routine dropped)
inputs_to: WS6 (Routine .md files get written from this roster)
---

> **2026-05-11 UPDATE — Telegram deferred:** Adam locked Telegram bot deploy as out-of-scope for WS6.
> All Routines deliver via **Linear ticket only** until Telegram is wired in a later workstream.
> The `Delivery` columns below that mention Telegram are historical — treat them as "Linear ticket" for now.
> Reference: WS6 Phase 6A-bis plan. Routine .md files in `.claude/agents/war-room/` are already updated.

# Routine Roster

## Architecture pivot (2026-05-08)

**CEO Routine is DROPPED.** Adam runs CEO interactively from his machine (Claude Code CLI / claude.ai chat). Routines are now reserved for **specialized scheduled autonomous work** that benefits from running without Adam's attention. Linear webhook → bridge → Anthropic-Routine fires are no longer the primary CEO entry path.

Trade-offs:
- **Pro:** Adam keeps real-time judgment in the loop. Routines focus on high-leverage scheduled patterns. Budget pressure dramatically reduced.
- **Con:** Linear webhook → bridge → CEO fire path is mostly inactive. Bridge primarily serves: ticket fan-in to specialized Routines (rare), Telegram routing (manual), iOS Shortcut idea-capture (creates ticket only, no fire).

## Schedule constraints

Two layered constraints govern Routine timing:

1. **15 fires per rolling 24h window.** Hardcoded in `infra/cloudflare-bridge/src/index.ts` (`MAX_FIRES_PER_24H`). Anthropic does NOT 429 at this cap — overage silently routes to Console-billed `ANTHROPIC_API_KEY`. The bridge's `FireCountDO` enforces this hard rejection so we never overage-bill.

2. **Anthropic Max plan = 5h rolling session quota.** Each fire opens a Max-session window. Spacing fires 5h apart gives each Routine a "fresh" quota window. Firing two Routines within the same 5h block shares the window's quota.

## 4-window daily fire schedule

```
W1: 05:30 – 10:29  Adam wakes, commutes 06:30-07:45 (reads outputs)
W2: 10:30 – 15:29  Morning work block
W3: 15:30 – 20:29  Afternoon work block
W4: 20:30 – 05:29  Adam sleeps — no fires
```

Adam's first fire of the day at 05:30 starts the rolling-24h cap window. Next 05:30 = window resets.

## The 11 Routines

### Daily — Window 1 (05:30)

#### 1. Advisor Daily Thinking ⭐ NEW

| Field | Value |
|---|---|
| Schedule | Daily 05:30 |
| Model | `claude-opus-4-7` |
| Budget | $2.00/fire |
| Reads | HackerNews top 10, AI/SEO news, X/Twitter, TechCrunch, Beamix Mem0, last 7d audit_log |
| Thinks | Multi-domain: business, tech, systems, marketing, GTM, contrarian takes, news synthesis |
| Outputs | ~500-1000 word "Advisor Brief" — sections: 🎯 Today's interesting · 🤔 Worth questioning · 💡 New idea · 📰 News that matters |
| Delivery | Posted to private Linear "Advisor" project + Telegram message |
| Why 05:30 | Adam reads on the 06:30-07:45 commute |

#### 2. Morning Digest

| Field | Value |
|---|---|
| Schedule | Daily 05:35 |
| Model | `claude-sonnet-4-6` |
| Budget | $0.30/fire |
| Reads | Open Linear tickets, last EOD Sync, current sprint goals, Mem0 |
| Thinks | What needs attention today? What's blocking what? |
| Outputs | Day-ahead briefing — 3-5 bullets in Telegram |
| Delivery | Telegram message to Adam |

#### 3. Competitor Pulse (B)

| Field | Value |
|---|---|
| Schedule | Daily 05:40 |
| Model | `claude-sonnet-4-6` |
| Budget | $0.40/fire |
| Reads | Competitor pricing pages, blog posts, social posts, AI-search rankings |
| Thinks | What changed vs. yesterday materially? |
| Outputs | Diff summary — Telegram only when material changes (silent on no-change days) |
| Delivery | Telegram message (when relevant) |

#### 4. GEO Algorithm Signal (weekly — Sundays)

| Field | Value |
|---|---|
| Schedule | Sunday 05:45 |
| Model | `claude-opus-4-7` |
| Budget | $1.50/fire |
| Reads | Beamix's own scan results across competitor + customer sites, AI-search SERP shifts |
| Thinks | What changed in AI search algorithms this week? |
| Outputs | Weekly trend report — section in Linear, posted to Slack/Telegram |
| Delivery | Telegram + Linear Advisor project |

### Daily — Window 2 (10:30)

#### 5. CTO Daily Plan ⭐ NEW

| Field | Value |
|---|---|
| Schedule | Daily 10:30 |
| Model | `claude-opus-4-7` |
| Budget | $1.50/fire |
| Reads | Open Linear tickets, last EOD Sync, runaway-watcher reports, last 24h audit_log, pgvector RAG on codebase + decisions |
| Thinks | What ships today across the worker army (effective 100-worker capacity)? What parallelizes? What needs Adam decision vs. agent decision? |
| Outputs | Linear ticket with day's parallel-ready work breakdown + 3-5 bullet Telegram summary |
| Delivery | Linear ticket + Telegram |

#### 6. Content Idea Generator (G)

| Field | Value |
|---|---|
| Schedule | Daily 10:35 |
| Model | `claude-sonnet-4-6` |
| Budget | $0.50/fire |
| Reads | Competitor content, AI search trends, customer questions, Beamix recent activity |
| Thinks | What 3 content ideas should we ship this week? |
| Outputs | 3 blog/social ideas, ranked, with hooks |
| Delivery | Linear "Content" project tickets |

#### 7. Monday Standup (weekly — Mondays)

| Field | Value |
|---|---|
| Schedule | Monday 10:40 |
| Model | `claude-sonnet-4-6` |
| Budget | $0.50/fire |
| Reads | Last week's EOD Syncs, last Friday Retro, current sprint backlog |
| Thinks | What's the week's plan? What ships? What's at risk? |
| Outputs | Week-ahead plan posted to Linear |
| Delivery | Linear sprint planning ticket |

### Daily — Window 3 (15:30)

#### 8. Friday Retro (weekly — Fridays)

| Field | Value |
|---|---|
| Schedule | Friday 15:30 |
| Model | `claude-sonnet-4-6` |
| Budget | $0.75/fire |
| Reads | Last week's commits, audit_log, runaway-watcher reports, customer wins/losses |
| Thinks | What shipped? What slipped? What did we learn? |
| Outputs | Retro summary with action items |
| Delivery | Linear "Retro" project ticket |

W3 is otherwise reserved for **ad-hoc Linear fires** — unexpected work, board meetings, emergencies. ~4 fires of headroom.

### Daily — Window 4 (20:30)

#### 9. EOD Sync

| Field | Value |
|---|---|
| Schedule | Daily 20:30 |
| Model | `claude-sonnet-4-6` |
| Budget | $0.30/fire |
| Reads | Today's commits, today's audit_log, current Linear sprint state |
| Thinks | What did we ship? What's blocked? What's tomorrow's priority? |
| Outputs | Day's recap + tomorrow's priorities |
| Delivery | Linear ticket + Telegram |

### Event-triggered (any window)

#### 10. Auto-Unblock

| Field | Value |
|---|---|
| Trigger | `routine.timeout` event from Inngest watcher |
| Model | `claude-sonnet-4-6` |
| Budget | $0.50/fire |
| Cap | 3 cascades max (Q5 LOCKED) — beyond that, Telegram-ping Adam |
| Reads | Stuck Routine's spec + audit_log trail + Linear ticket state |
| Thinks | Can I self-resolve this? If not, who needs to know? |
| Outputs | Unblocking action OR escalation |

#### 11. Synthesizer

| Field | Value |
|---|---|
| Trigger | Adam invokes `@board` command |
| Model | `claude-opus-4-7` |
| Budget | $1.00/fire |
| Reads | All persona Round 1+2 outputs from a board meeting |
| Thinks | 4-round protocol — synthesize the personas into locked decisions |
| Outputs | Locked decision JSON conforming to `apps/web/src/lib/orchestration/board.ts` |
| Delivery | Linear ticket + DECISIONS.md update |

## Daily fire budget tally

| | Daily | Weekly |
|---|---|---|
| Always-on Routines (Advisor, Morning, Competitor, CTO, Content, EOD) | 6/day | 42/wk |
| Weekly Routines (GEO, Standup, Retro) | 3/wk avg | 3/wk |
| Event-triggered (Auto-Unblock + Synthesizer) | ~0.6/day | ~4/wk |
| **Subtotal scheduled** | **~7.4/day** | **49/wk** |
| **15-fire cap** | **15/day** | **105/wk** |
| **Headroom for ad-hoc Linear fires** | **~7/day** | **~56/wk** |

Plenty of headroom for unexpected work. Comfortable margin.

## Weekly cost projection

| Routine | $/fire | Fires/wk | $/wk |
|---|---|---|---|
| Advisor | $2.00 | 7 | $14.00 |
| Morning Digest | $0.30 | 7 | $2.10 |
| Competitor Pulse | $0.40 | 7 | $2.80 |
| GEO Signal | $1.50 | 1 | $1.50 |
| CTO Daily Plan | $1.50 | 7 | $10.50 |
| Content Idea | $0.50 | 7 | $3.50 |
| Monday Standup | $0.50 | 1 | $0.50 |
| Friday Retro | $0.75 | 1 | $0.75 |
| EOD Sync | $0.30 | 7 | $2.10 |
| Auto-Unblock | $0.50 | ~3 | $1.50 |
| Synthesizer | $1.00 | ~1 | $1.00 |
| **Total** | | **~49** | **~$40/wk** |

**Monthly:** ~$170/mo Routine token spend.

**Important:** these tokens come from Adam's Max subscription quota, NOT from API billing. No incremental cash outlay if Max quota covers it. If Max 5× quota depletes too quickly, the options are:
1. Upgrade to Max 20× ($200/mo)
2. Demote CTO + Advisor from Opus to Sonnet (saves ~$90/wk)
3. Reduce Routine cadence (e.g., Advisor weekly instead of daily)

## What's removed from the original WS2 design

- **CEO Entry Point Routine** — Adam runs interactively
- **CMO / CTO / CPO / CBO / CCO Routine receivers** — Adam routes those Linear tickets through interactive CEO sessions
- **QA Lead Routine receiver** — qa-lead-pass workflow runs in GitHub Actions, not as a Routine

## What's added vs. original WS2 design

- **Advisor Daily Thinking** (multi-domain creative)
- **CTO Daily Plan** (army-of-100 work scheduler)
- **Competitor Pulse** (formerly "Competitor Signal" — daily instead of weekly, more aggressive)
- **Content Idea Generator** (new)

## Implementation notes for WS6

When WS6 writes the Routine .md files:
- Each .md file describes ONE Routine in this roster
- Frontmatter: name, model, schedule (cron), budget, MCP grants, reads, outputs
- Body: full system prompt
- WS6 must also update `infra/cloudflare-bridge/src/routing.ts` to remove dropped routes (no more `agent:cmo` → CEO route) and add new ones if needed
- `Synthesizer.md` is the only Routine that consumes `apps/web/src/lib/orchestration/board.ts` schema directly
- All Routines write to `audit_log` via Supabase MCP grant (per WS2 §2D)

## Reversibility

| Decision | Reversible? |
|---|---|
| CEO interactive vs. Routine | EASY — re-create CEO Routine if needed |
| 11-Routine roster vs. 10 | EASY — add/remove Routines anytime |
| 4-window schedule | EASY — Anthropic Console UI lets you change cron |
| Opus vs. Sonnet for CTO+Advisor | EASY — model swap in Routine config |
| 15-fire 24h cap | MEDIUM — change `MAX_FIRES_PER_24H` constant + redeploy bridge |
| 5h Max session window | NOT REVERSIBLE — Anthropic platform behavior |

## Status

LOCKED. Adam approved 2026-05-08 with the schedule + roster. Inputs to WS6.
