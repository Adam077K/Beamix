---
title: War Room Agent Index
date: 2026-05-11
status: scaffolded — bodies pending WS6-6B
---

# War Room — Agent Index

21 agents total: 11 Routines + 6 Workers + 4 Personas.
Body sections are empty placeholders. Frontmatter is complete.

---

## 11 Routines

| Filename | Role | Model | Schedule / Trigger |
|---|---|---|---|
| `advisor-daily-thinking.md` | Multi-domain Advisor Brief — business, tech, GTM, contrarian synthesis | claude-opus-4-7 | Daily 05:30 (`30 5 * * *`) |
| `morning-digest.md` | Day-ahead briefing from Linear + Mem0 — 3-5 bullets via Telegram | claude-sonnet-4-6 | Daily 05:35 (`35 5 * * *`) |
| `competitor-pulse.md` | Competitor diff monitor — Telegram only on material changes | claude-sonnet-4-6 | Daily 05:40 (`40 5 * * *`) |
| `geo-algorithm-signal.md` | Weekly GEO algorithm trend report from Beamix scan data | claude-opus-4-7 | Sunday 05:45 (`45 5 * * 0`) |
| `cto-daily-plan.md` | Army-of-100 daily work breakdown — Linear ticket + Telegram | claude-opus-4-7 | Daily 10:30 (`30 10 * * *`) |
| `content-idea-generator.md` | 3 ranked content ideas with hooks — Linear "Content" tickets | claude-sonnet-4-6 | Daily 10:35 (`35 10 * * *`) |
| `monday-standup.md` | Week-ahead sprint plan — Linear sprint planning ticket | claude-sonnet-4-6 | Monday 10:40 (`40 10 * * 1`) |
| `friday-retro.md` | Weekly retro — what shipped, slipped, learned + action items | claude-sonnet-4-6 | Friday 15:30 (`30 15 * * 5`) |
| `eod-sync.md` | Day recap + tomorrow's priorities — Linear ticket + Telegram | claude-sonnet-4-6 | Daily 20:30 (`30 20 * * *`) |
| `auto-unblock.md` | Self-healing for stuck Routines — 3 cascade max, then Adam ping | claude-sonnet-4-6 | event-triggered (`routine.timeout`) |
| `synthesizer.md` | Board meeting synthesis — locked decision JSON + DECISIONS.md update | claude-opus-4-7 | event-triggered (`@board` command) |

---

## 6 Workers

All workers are spawned by `cto-daily-plan` by default. Model: claude-sonnet-4-6.

| Filename | Role | Model | Isolation |
|---|---|---|---|
| `parallel-builder.md` | Feature/fix implementation in worktree, PR creation | claude-sonnet-4-6 | worktree |
| `parallel-researcher.md` | Targeted web + library research, no operational writes | claude-sonnet-4-6 | none |
| `parallel-critic.md` | PR and ADR review — PASS / CHANGES_REQUESTED verdict | claude-sonnet-4-6 | none |
| `parallel-tester.md` | E2E and integration test runner via Playwright | claude-sonnet-4-6 | worktree |
| `parallel-deployer.md` | DB migrations + Vercel deploy trigger, no PR merge | claude-sonnet-4-6 | worktree |
| `parallel-watcher.md` | Read-only audit_log + claude_progress anomaly monitor | claude-sonnet-4-6 | none |

---

## 4 Personas

Board meeting participants. Invoked via `@<name>` comment in a Synthesizer session.

| Filename | Role | Model | Invoke via |
|---|---|---|---|
| `persona-visionary.md` | Horizon-3 opportunities, contrarian takes, category-defining moves | claude-opus-4-7 | `@visionary` |
| `persona-strategist.md` | Execution plan, metrics, trade-offs, competitive positioning | claude-opus-4-7 | `@strategist` |
| `persona-architect.md` | Technical feasibility, system design options, BOM estimates | claude-opus-4-7 | `@architect` |
| `persona-aria.md` | Vendor/procurement critic — SLA, security, compliance, TCO | claude-opus-4-7 | `@aria` |

---

## Notes for WS6-6B

- All body sections (`## Role`, `## Mission`, `## Inputs`, `## Outputs`, `## Golden path`, `## Anti-patterns`, `## Escalation`, `## Fire signal`) contain `<!-- WS6-6B: Adam + CEO will write this -->` markers.
- `## Cost cap` and `## Delivery` are pre-filled from ROUTINE-ROSTER.md data.
- Ambiguity flag resolutions (first-option picks per R1): Advisor uses `multi-agent-brainstorming`; Competitor Pulse uses `search-specialist`; GEO loads both `geo-fundamentals` + `seo-fundamentals`; parallel-critic uses `code-review-excellence` as primary + `architect-review` as secondary; Visionary uses `startup-business-analyst-market-opportunity`.
- EOD Sync MCPs: `mem0` was flagged ambiguous in R2 (option B: deny, Morning Digest reads Linear ticket). This scaffold implements option B — no Mem0 grant for EOD Sync. Flagged for Adam to review in 6B.
- parallel-researcher MCP: R2 flagged Linear grant as ambiguous (option A: grant read; option B: deny). This scaffold implements option B — no Linear grant. Flagged for Adam to review in 6B.
- parallel-builder Supabase scope: R2 flagged service-role vs read-only. Scaffold lists `supabase` without explicit scope restriction — Adam to set RLS/role in 6B.
