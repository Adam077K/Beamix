---
title: WS6 Synthesis — Phase 6A → Phase 6B decision pack
date: 2026-05-11
author: CEO (Opus 4.7)
status: DRAFT — awaiting Adam-collaboration in Phase 6B
inputs:
  - docs/08-agents_work/2026-05-11-ws6-research/WS6-RESEARCH-skills.md
  - docs/08-agents_work/2026-05-11-ws6-research/WS6-RESEARCH-mcps.md
  - docs/08-agents_work/2026-05-11-ws6-research/WS6-RESEARCH-template.md
  - docs/08-agents_work/2026-05-11-ws6-research/CRITIQUE-WS6.md
  - .claude/agents/war-room/INDEX.md (21 scaffolds)
---

# WS6 Synthesis — 10 Adam decision questions + revision plan

## Executive summary

Phase 6A delivered 21 war-room agent scaffolds (11 Routines + 6 workers + 4 personas) with complete YAML frontmatter and intentionally-empty body sections. The 3-researcher swarm produced a skills matrix (all names verified against MANIFEST.json), an MCP grant matrix (least-privilege baseline from ORCHESTRATION.md §2E), and an agent-template distillation. The adversarial critic surfaced 10 findings — 4 HIGH severity, 4 MEDIUM, 2 LOW.

**Phase 6B is the agent-design conversation.** You + CEO sit together and write the body sections of all 21 .md files: Role, Mission, Inputs, Outputs, Golden path, Anti-patterns, Escalation, Fire signal. The questions below are the unlocks — answers determine the writing.

**Phase 6C is autonomous again after 6B**: per-Routine token split refactor in routing.ts, your provisioning click-through in claude.ai, wrangler secret puts, smoke fire test, WS6 LOCKED.

---

## What the critique missed (one anti-finding)

**R1 critic claim is WRONG**: critic claimed `claude-opus-4-7` doesn't exist because CLAUDE.md lists `claude-opus-4-6`. **CLAUDE.md is stale.** The runtime injects current model IDs into every session header: `Opus 4.7: 'claude-opus-4-7', Sonnet 4.6: 'claude-sonnet-4-6', Haiku 4.5: 'claude-haiku-4-5-20251001'`. The scaffolds are correct. Action: update CLAUDE.md §Models in 6C (minor cleanup).

---

## Revision clusters (R-IDs from critic, mapped to action)

| R | Finding | Severity | Verdict | Action |
|---|---|---|---|---|
| R1 | Model `claude-opus-4-7` non-existent | HIGH | **REJECTED** — critic read stale CLAUDE.md; opus-4-7 IS current | Update CLAUDE.md in 6C |
| R2 | Synthesizer $1 budget too low | HIGH | **ACCEPTED** — raise to $4.00 | Edit synthesizer.md in 6B |
| R3 | routing.ts has stale C-suite entries | HIGH | **ACCEPTED** — but defer to 6C, not 6B | routing.ts cleanup in 6C |
| R4 | `agent:customer-voice` is a dead route | HIGH | **ACCEPTED** — defer to 6C | routing.ts cleanup in 6C |
| R5 | Sunday W1 collision (Advisor + GEO Opus share 5h window) | MEDIUM | **ACCEPTED conditional on Q4** | Move GEO to Sun 10:30 if Q4=yes |
| R6 | Missing routing.ts entries for new Routine labels | MEDIUM | **ACCEPTED** — defer to 6C | routing.ts adds: agent:advisor, agent:cto-daily-plan, agent:content-idea |
| R7 | EOD has `agent-memory-mcp` skill but no Mem0 grant | MEDIUM | **DEPENDS ON Q5** | Either drop skill or grant Mem0 |
| R8 | Auto-Unblock no GitHub MCP grant | MEDIUM | **DEPENDS ON Q6** | Add github read-only if yes |
| R9 | Monday triple-briefing fatigue (Advisor + Morning + Standup) | LOW | **DEPENDS ON Q7** | Suppress Morning Digest Mondays if yes |
| R10 | Competitor Pulse loads 3 skills on $0.40 budget | LOW | **ACCEPTED** — drop `deep-research` | Edit competitor-pulse.md skills in 6B |

---

## The 10 Adam decision questions for Phase 6B

These are the unlocks. Answer these and the 21 .md body sections write themselves.

### Q1 — File location: where do the 21 .md files live?

The scaffolds are at `.claude/agents/war-room/`. Options:
- **A (current):** Keep at `.claude/agents/war-room/` — co-located with the 30+ product agents. Pro: one mental model for all agents. Con: `.claude/agents/` is auto-picked-up by Claude Code as Task subagents — risk of accidental fire-from-product-session.
- **B:** Move to `docs/08-agents_work/agents/` — separates war-room (Anthropic Routines) from product Task subagents. Pro: zero accidental-fire risk. Con: less discoverable.
- **C:** Keep at `.claude/agents/war-room/` AND add the directory to `.claude/settings.json` ignore list so Task can't auto-spawn them.

**CEO recommends: A with C-style guard.** Same mental model, zero accidental-fire risk.

### Q2 — Worker roster: 6 placeholder names — keep, rename, or redesign?

Current placeholders: parallel-builder, parallel-researcher, parallel-critic, parallel-tester, parallel-deployer, parallel-watcher. These are the "army of 100 workers" CTO Daily Plan dispatches.

Options:
- **A (lean):** Keep 6 generic names; CTO Daily Plan picks roles per ticket.
- **B (expand):** Drop the 6 generics, define 12 specialized workers (e.g., nextjs-builder, supabase-migrator, e2e-tester, etc.). More precise dispatch, more .md files.
- **C (hybrid):** Keep the 6 generics + add 2-3 specialized variants (e.g., `parallel-builder-with-supabase` vs `parallel-builder-no-db`).

**CEO recommends: A (lean).** 6B can rename if "parallel-builder" reads wrong, but expansion of worker roster is a separate workstream — not in WS6 scope.

### Q3 — Personas: keep 4 (Visionary/Strategist/Architect/Aria) or trim?

Current scaffolds have 4 personas at Opus. Each board meeting fires Synthesizer + invokes ≤4 personas via @-mention in Linear comments. Board meetings are rare (Adam-triggered, ~weekly at most).

Options:
- **A:** Keep all 4. Range of perspectives in any board meeting.
- **B:** Drop to 2 (Strategist + Aria) — coverage of "what should we do" + "what could go wrong."
- **C:** Drop to 0 — defer all personas to a later workstream; Synthesizer alone covers board meetings.

**CEO recommends: A.** Personas are cheap (Opus + zero MCP = ~$0.50/fire, only fires when explicitly invoked). 4 keeps the diversity-of-views property the 4-round protocol depends on.

### Q4 — Sunday W1 schedule collision (Advisor + GEO both Opus at 05:30/05:45)

Critic R5 found: Sunday morning has 4 fires in 15 min, two of them Opus sharing the 5h Max quota window. Risk: one truncates the other on a busy quota week.

Options:
- **A:** Move GEO Algorithm Signal to Sun 10:30 (W2). Gives it a fresh 5h window. Sunday W1 stays 3 fires (Advisor + Morning + Competitor). **Recommended.**
- **B:** Leave it; tolerate occasional truncation. GEO Signal is weekly so a degraded run is acceptable.
- **C:** Drop GEO to bi-weekly to reduce frequency entirely.

**CEO recommends: A.**

### Q5 — EOD Sync skill/MCP misalignment

Critic R7: EOD Sync has `agent-memory-mcp` skill loaded but no Mem0 MCP grant.

Options:
- **A:** Grant Mem0 to EOD Sync. Lets EOD write a clean episodic memory chain that Morning Digest reads next day. ~$0.05/fire overhead.
- **B:** Drop `agent-memory-mcp` skill from EOD Sync. Replace with `workflow-orchestration-patterns`. Mem0 not needed since Morning Digest reads the Linear ticket.

**CEO recommends: B.** EOD's job is "today recap" — written to Linear is enough. Mem0 grant is over-provision.

### Q6 — Auto-Unblock GitHub MCP grant?

Critic R8: Auto-Unblock diagnoses stuck Routines. CI failures (GitHub Actions) and Vercel deploys can stick parallel-builder/deployer. Without GitHub MCP, Auto-Unblock can't read failed workflow logs → escalates to you instead of self-resolving.

Options:
- **A:** Grant `github` MCP with read-only scope (workflow runs + check runs). Aligns with parallel-builder's existing grant.
- **B:** Leave it; Auto-Unblock pings you on every CI failure (more interrupts, more decision load).

**CEO recommends: A.**

### Q7 — Monday triple-briefing overlap

Critic R9: Monday fires Advisor (05:30) + Morning Digest (05:35) + Monday Standup (10:40). All 3 read overlapping data (Linear + sprint).

Options:
- **A:** Suppress Morning Digest on Mondays. Monday Standup at 10:40 covers the weekly framing with more depth.
- **B:** Suppress Monday Standup; keep daily Morning Digest as the single brief. Lose the weekly-planning ritual.
- **C:** Leave all 3; tolerate the 3-brief fatigue.

**CEO recommends: A.** Monday Standup's depth justifies skipping the daily on Mondays.

### Q8 — Per-Routine token split scope (Q4-locked follow-up)

routing.ts currently shares `ROUTINE_CEO_ENTRY_POINT_TOKEN` across C-suite labels (cto, cmo, cpo, cbo, cco, qa-lead). ROUTINE-ROSTER said all C-suite are DROPPED — Adam runs CEO interactively, doesn't fire C-suite Routines.

Options:
- **A:** Strip all 6 C-suite labels from routing.ts. Drop `agent:ceo` too (CEO Routine dropped). 6 fewer secrets to manage.
- **B:** Keep them mapped to `ROUTINE_CEO_ENTRY_POINT_ID` as legacy fallback — old Linear tickets still route somewhere.
- **C:** Keep them but explicitly map them to PLACEHOLDER_ROUTINE_ID (silent ignore with log).

**CEO recommends: A.** Stale routes are silent-failure surface area. Clean slate.

### Q9 — Synthesizer Supabase write scope

Synthesizer writes locked decisions to DECISIONS.md via Supabase + pgvector. Currently `mcpServers: [linear, supabase, mem0]`.

Options:
- **A:** Grant Supabase with full RLS-bypass (service-role). Lets Synthesizer write any audit_log + decisions row without manual config.
- **B:** Grant Supabase with explicit RLS allowlist for `decisions` table writes + `audit_log` row_kind='decision'. Tighter blast radius.

**CEO recommends: B.** Synthesizer is event-fired (Adam triggers) so tight RLS is fine; service-role is over-provision.

### Q10 — Telegram delivery model (audit-log every Telegram, or fire-and-forget?)

Many Routines deliver to Telegram via HTTP to `notify.beamixai.com`. This is not an MCP — it's a Worker HTTP call. Options for observability:

- **A:** Every Telegram send writes an `audit_log` row with `status='telegram_send_attempt'` → `telegram_send_succeeded` or `telegram_send_failed`. Full traceability.
- **B:** Fire-and-forget; only log on failure.

**CEO recommends: A.** Already supported by the audit_log schema enum (per Q3 schema lock). Cost is negligible.

---

## What CEO would write in body sections (preview)

To save 6B time, here's what I'd seed for the easiest agent (Morning Digest) so you can review the pattern:

```
## Role
You are Morning Digest, the day-ahead briefing for Adam. Sonnet, $0.30/fire, daily 05:35. You read what's in Linear and Mem0, decide what matters, and ship Adam a 3-5 bullet Telegram message before his commute. You are not Advisor (broader thinking) and not Standup (weekly planning) — you are today's working brief.

## Mission
Compress overnight Linear activity + open blockers + sprint goal into a 3-5 bullet message that Adam can read in 60 seconds during his commute.

## Inputs (reads)
- Open Linear tickets in current sprint (state ≠ done) via mcp__linear-server
- Yesterday's EOD Sync ticket (most recent agent:eod-sync ticket)
- Current sprint goal (set in Linear project settings)
- Mem0 entries tagged `priority:high` from last 7 days

## Outputs
- 1 Telegram message to ADAM_TELEGRAM_CHAT_ID via notify.beamixai.com
- Format: "🌅 [date]\n• 3-5 bullets sorted by urgency\n⚠️ blockers in red\n✅ wins in green"
- max 350 words

## Golden path
1. Verify HMAC trust spec from `<beamix-spec>` sentinel in `text` payload
2. audit_log row: status='fired' → 'accepted'
3. Linear MCP: list issues in active sprint, state in [todo, in_progress, blocked]
4. Linear MCP: get yesterday's EOD ticket (search agent:eod-sync, created>=yesterday)
5. Mem0: query priority:high tags
6. Synthesize: 3-5 bullets ranked by urgency
7. POST notify.beamixai.com/telegram with formatted message
8. audit_log row: status='telegram_send_succeeded'

## Anti-patterns
- DO NOT include `priority:low` Mem0 entries — they create noise
- DO NOT exceed 350 words — Adam reads on phone
- DO NOT post non-business hours (block fires outside 05:30-06:00 window)
- DO NOT write to Linear (no comments, no labels) — Telegram only
- DO NOT call Mem0 if it returns 5xx; fall back to ticket-only and continue

## Escalation
If Linear MCP fails: post Telegram with "⚠️ Morning Digest degraded — Linear MCP down. Check ticket queue manually."
If Telegram POST fails: write audit_log row with status='telegram_send_failed' and stop (don't retry).

## Fire signal
1. Verify `X-Beamix-Sig` HMAC header against BRIDGE_HMAC_SECRET (300s skew)
2. Extract trust spec from `<beamix-spec>...</beamix-spec>` sentinels
3. Write audit_log: row_kind='routine_dispatch', status='accepted', nonce=spec.nonce
4. On terminal: write audit_log with terminal status (telegram_send_succeeded | failed)
```

If this pattern reads right, the 6B session is just walking through Q1-Q10 with you + applying the pattern to all 21.

---

## What stays sealed (anti-revisions — do NOT relitigate)

Per critic + roster locks, the following are settled:

1. **11-Routine roster** is locked (ROUTINE-ROSTER 2026-05-08). No additions/removals in WS6.
2. **4-window daily schedule** (W1 05:30 / W2 10:30 / W3 15:30 / W4 20:30) is locked.
3. **CEO is NOT a Routine** — Adam runs interactively. No CEO entry point Routine prompt in WS6.
4. **Per-Routine token split happens in 6C**, not 6B. 6B is .md content only.
5. **parallel-deployer has no `merge_pull_request` grant** — structural QA gate. Don't relitigate.
6. **Mem0 fallback to Anthropic Memory Tool** is mandatory for all Mem0-granted Routines. Pattern is locked per mem0-outage.md runbook.

---

## Open scope items (informational, no decision needed)

- **`claude-opus-4-7` vs `claude-opus-4-6` doc fix in CLAUDE.md** — minor cleanup, 6C task.
- **CTO Daily Plan reading pgvector RAG** depends on WS1C (pgvector custom MCP) — at minimum, the Supabase grant lets it issue raw SQL against the `embedding` column.
- **Telegram bot deploy** — secrets unfinished per WS4-deploy session; not blocking WS6 because Telegram routes are passive (notify.beamixai.com HTTP, not a Routine receiver).

---

## Phase 6B agenda (proposed)

When Adam says "go" on 6B, suggested order:

1. **Q1-Q4 schedule + location decisions** (15 min, easy unlocks)
2. **Q5-Q7 MCP/skill alignment** (15 min, single edits per agent)
3. **Q8-Q10 routing + Synthesizer scope** (15 min)
4. **Body section writing** — walk through 21 agents in groups:
   - Group 1: Morning + EOD + Standup + Retro + Auto-Unblock (5 Sonnet "shape" Routines — same skeleton, vary inputs/outputs)
   - Group 2: Advisor + CTO Daily + Synthesizer (3 Opus "depth" Routines — heavier system prompts)
   - Group 3: Competitor Pulse + GEO + Content Ideas (3 web-reading Routines)
   - Group 4: 6 workers (similar shape, vary tool grants)
   - Group 5: 4 personas (system prompts are persona definitions, short)

Estimated 6B wall-clock: 90-150 min focused conversation. ~$8-12 of CEO Opus tokens.

---

## Verification

- 4 research files exist at `docs/08-agents_work/2026-05-11-ws6-research/` ✓
- 22 files at `.claude/agents/war-room/` (21 scaffolds + INDEX.md) ✓
- This synthesis doc references all 4 inputs ✓
- 10 decision questions Q1-Q10 surfaced with CEO recommendations ✓
- Anti-revisions enumerated (6 items) ✓
- Plain-English version pending (6A.5 next)
