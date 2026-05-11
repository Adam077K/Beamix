---
title: WS6 Deep Review — Synthesis + Deltas
date: 2026-05-11
author: CEO (Opus 4.7)
status: DRAFT — awaiting Adam decisions in Phase 6B
inputs:
  - docs/08-agents_work/2026-05-11-ws6-deep-review/DEEP-REVIEW-D1-logic.md
  - docs/08-agents_work/2026-05-11-ws6-deep-review/DEEP-REVIEW-D2-completeness.md
  - docs/08-agents_work/2026-05-11-ws6-deep-review/DEEP-REVIEW-D3-flow.md
  - docs/08-agents_work/2026-05-11-ws6-deep-review/DEEP-REVIEW-D4-improvement.md
  - docs/08-agents_work/2026-05-11-ws6-deep-review/DEEP-REVIEW-D5-stress.md
  - docs/08-agents_work/2026-05-11-ws6-research/CRITIQUE-WS6.md (first critique, dedupe)
---

# WS6 Deep Review — Synthesis + Deltas

## Executive summary

5 critics (logic / completeness / cross-agent flow / improvement / stress-test) reviewed the 21 war-room scaffolds in parallel. They surfaced **3 architectural defects that 2+ critics found independently**, **2 proposed roster additions (1 HIGH + 1 MEDIUM)**, **10 per-agent deltas (skill/MCP/budget/maxTurns tweaks)**, and **6 stress-failure modes** — most of which trace back to the same root: **all 21 agent body sections are still `<!-- WS6-6B -->` stubs, so every resilience property is unimplemented**. The single highest-leverage hardening (D5) is a 15-min canary-write Inngest cron — independent of any Routine — that simultaneously tests service-role write path, RLS config, audit_log health, and client init.

---

## HIGH cross-critic findings (2+ critics independently)

### HX1 — CTO Daily Plan cannot actually dispatch workers (D1.R2 + D3.F2)

The current scaffold says "CTO Plan spawns 6 parallel workers." But Routines are fire-and-terminate — they cannot orchestrate child agents. Workers are Task subagents that only run inside interactive CEO sessions. INDEX.md line 34 "spawned by cto-daily-plan by default" is aspirational, not operational.

**Fix:** Reframe CTO Daily Plan's output as a **work proposal for Adam to approve and dispatch interactively**, not an autonomous dispatcher. Update CTO Plan body + INDEX.md + roster doc to match. The 6 worker .md files stay as templates Adam uses inside interactive sessions, not Routines.

### HX2 — Synthesizer `@board` trigger has no handler (D1.R3 + D3.F7)

Synthesizer's trigger is "Adam types `@board` in a Linear comment." The bridge has no comment-event handler that detects `@board` text and fires `ROUTINE_SYNTHESIZER_ID`. Currently the only way to fire Synthesizer is to manually add the `agent:synthesizer` label to a ticket. Adam will type `@board`, nothing will happen, board meeting deadlocks silently.

Also: the 4 personas are **Task subagents inside the Synthesizer session**, not standalone Routines. They should NOT be in the routing table or get their own bearer tokens — but the scaffold treats them as Routines.

**Fix (split into 2):**
- Wire a comment-event handler in `infra/cloudflare-bridge/src/index.ts` that detects `@board` and fires Synthesizer (or document `@board` = "add label `agent:synthesizer`" + update UX guidance).
- Remove the 4 personas from the Routine provisioning list. They need no `routine_id_env_key` / `routine_token_env_key`. Add a Synthesizer frontmatter field `round_sequence: [persona-visionary, persona-architect, persona-strategist, persona-aria]` so the round protocol is machine-readable.

### HX3 — Auto-Unblock has no real trigger source (D1.R4 + D3.F3 + D5.S1)

`routine.timeout` Inngest event is referenced in 3 places but never produced by any existing function. Workers aren't Routines — they're invisible to Auto-Unblock. Even if Anthropic outage hits during W2 fires, `routine.timeout` events that arrive during the outage have no re-queue guarantee.

**Fix:** Define in 6C what produces `routine.timeout` (Cloudflare Bridge Durable Object timeout OR a new Inngest cron polling `audit_log` for stalled entries). Also add a `worker.stuck` event from parallel-watcher → Auto-Unblock for worker visibility.

---

## Cross-cutting (single-critic but high impact)

### CC1 — WS6-6B body stubs hide every resilience property (D1 pattern + D5 cross-cutting #2)

The frontmatter looks complete but the entire Mem0 try/catch fallback (S2), worker teardown on `anthropic_error` (S1), self-healing logic in Auto-Unblock, error handling in Linear MCP failures — ALL of it lives in the body sections that are still `<!-- WS6-6B -->`. Until 6B writes the bodies with explicit error-handling patterns, the agents fire and silently abort on any partial failure.

**Fix:** 6B agenda gets a **mandatory error-handling section in every agent body**. Pattern: explicit try/catch wrapper, fallback path (Anthropic Memory Tool when Mem0 is down, Linear-only when Mem0 not granted), audit_log write before action.

### CC2 — Q7 "no Telegram" is applied too broadly (D5 cross-cutting #1)

Q7 (locked 2026-05-08) said "no real-time Telegram cost alerts." That was the right call for chatty micro-alerts. But it's been applied broadly enough that genuine anomalies (S5 fire-rate spike, S3 RLS misconfig, S6 audit_log corruption, canary failures) have no proactive signal.

**Fix:** Narrow Q7's scope to *routine cost reporting only*. Permit Telegram P0 for: (a) canary write failure ≥2 consecutive cycles, (b) fire-count spike per agent >1.5× spec.max_fires_per_day, (c) audit_log schema-validation read failure. Three precise carve-outs, not a flood.

### CC3 — No fire-frequency guard at any layer (D5.S5)

`runaway-watcher` guards session cost. `cost-watchdog` passively observes daily cost. Neither counts **fires per agent per 24h** against the spec cap. A cheap, fast-misfiring Routine could drain the Anthropic daily cap before either guard triggers.

**Fix:** Add fire-count check in `runaway-watcher` step 1: query audit_log for fires from this agent in last 24h. If `count > spec.max_fires_per_day × 1.5`, revoke token + write `anomaly` row + Telegram P0 (per CC2 carve-out). One extra Supabase query per insert.

### CC4 — Canary heartbeat is the single highest-leverage hardening (D5 final)

15-min Inngest cron writes `row_kind = canary` to audit_log via service-role, reads back. Validates: service-role write, RLS config, audit_log health, client init — all in one independent test. If 2 consecutive failures: Telegram P0 (per CC2 carve-out).

**Fix:** Add new Inngest function `apps/web/src/inngest/functions/audit-log-canary.ts` in 6C.

### CC5 — Linear query predicates missing in 4 flows (D3 F-CC1)

F1 (EOD→Morning), F2 (CTO Plan→Workers — invalidated by HX1), F5 (Friday Retro→Monday Standup), F6 (Competitor Pulse→Content Idea — actually decoupled). Each needs: label filter + project + date window. Without these, Linear queries return ambiguous results.

**Fix:** 6B body-writing must specify exact Linear queries per agent. Standard: each agent that writes a ticket adds `label: agent:<name>`. Each consumer queries by label + date.

---

## Per-critic unique findings (not yet covered)

### D1 (Logic)
- **D1.R1 [H]** `competitor-pulse.md` trigger_label says `agent:competitor-signal` — legacy name mismatch. Fix in 6C: rename to `agent:competitor-pulse` in both scaffold + routing.ts.
- **D1.R5 [M]** parallel-watcher `spawned_by: cto-daily-plan` but description says "or auto-unblock." Update to `[cto-daily-plan, auto-unblock]`.
- **D1.R7 [M]** Friday Retro reads "runaway-watcher reports" but watcher doesn't persist to a queryable store. Fix: either persist anomaly summaries to a `watcher_log` table OR replace "runaway-watcher reports" with "audit_log anomaly entries" in Retro's reads.
- **D1.R8 [M]** Parallel workers have no `budget.max_cost_usd` frontmatter — "CTO sets per-task budget" is unenforceable. Fix: set conservative static caps (builder $2.00, tester $1.00, deployer $0.50, researcher $0.75).
- **D1.R9 [L]** Morning Digest at 05:35 reads Mem0 that Advisor wrote at 05:30 — 5-min race window. Fix: shift Morning Digest to 05:45.

### D2 (Completeness — open scope)
- **D2.A1 [HIGH ADD]** `security-watcher` — daily dep CVE + secret scan + audit_log anomaly. W4 20:45, Sonnet, $0.30/fire. All 10 DR runbooks rely on Adam manually polling — this Routine closes that gap.
- **D2.A2 [MED ADD]** `ai-search-rank-tracker` — daily check of Beamix's own AI-SERP position (ChatGPT, Perplexity, Claude answers for "AI SEO tool"). W1 05:42, Sonnet, $0.35/fire. **The highest-irony gap: GEO platform blind to its own GEO rank.**
- **D2.A3 [LOW DEFER]** `post-mortem-builder` — defer to 50-customer milestone.
- **D2.R1** Morning Digest Monday suppression: cron `35 5 * * *` → `35 5 * * 2-5`. Monday Standup at 10:40 covers Monday already.

### D4 (Improvement — top deltas)
| # | Agent | Delta |
|---|---|---|
| 1 | synthesizer | Budget $1 → $2.50 (confirms CRITIQUE-WS6 R2) |
| 2 | competitor-pulse | Drop `deep-research` skill (3 skills at $0.40 wasteful) |
| 3 | advisor-daily-thinking | Drop `prompt-engineering`, add `startup-metrics-framework` |
| 4 | eod-sync | Grant Mem0 (flip R2 ambiguity from B → A) |
| 5 | parallel-researcher | Grant Linear read-only (flip R2 from B → A) |
| 6 | parallel-builder | Enforce Supabase read-only (R2 B confirmed) |
| 7 | competitor-pulse | maxTurns 30 → 15 |
| 8 | auto-unblock | Budget $0.50 → $1.00 |
| 9 | parallel-critic | Drop `multi-agent-brainstorming` skill |
| 10 | synthesizer | maxTurns 30 → 20 |
| +budget | geo-algorithm-signal | $1.50 → $2.50 (weekly Opus on scan_results) |

### D5 (Stress-test) — unique scenarios
- **S1 fix:** Anthropic outage post-recovery — `auto-unblock` auto-queries `audit_log` for fired-but-not-accepted rows and re-fires.
- **S4 gap:** No GitHub-compromise runbook for parallel-builder/deployer tokens. Add to secret-rotation.md + GitHub audit log webhook → Telegram on push-to-main from agent service account.
- **S6 fix:** Independent canary read heartbeat — separate from canary write — validates audit_log schema shape.

---

## Proposed roster changes (Adam decides in 6B)

### Additions (2 proposed, 1 deferred)

| ID | Agent | Priority | Schedule | Model | Budget | Add? |
|---|---|---|---|---|---|---|
| D2.A1 | security-watcher | HIGH | Daily 20:45 (W4) | Sonnet | $0.30/fire (+$9/mo) | **Recommended: YES** |
| D2.A2 | ai-search-rank-tracker | MEDIUM | Daily 05:42 (W1) | Sonnet | $0.35/fire (+$10/mo) | **Recommended: YES** |
| D2.A3 | post-mortem-builder | LOW | Event-triggered | Sonnet | $0.50/fire (~$2/mo) | Recommended: DEFER (50-customer milestone) |

If both A1 + A2 added: roster grows to **23 agents** (+$19/mo Max-quota).

### Removals

**None.** All 6 workers + 4 personas justified by D2. Only adjustment: Morning Digest Monday cron suppression (`35 5 * * 2-5`).

### Reclassifications

- **4 personas: REMOVE from Routine provisioning list.** They are Task subagents inside Synthesizer session, not standalone Routines. Saves 4 Routine slots in claude.ai + 8 wrangler secrets (no `ROUTINE_PERSONA_*_ID/TOKEN` needed).
- **6 workers: keep as .md templates.** They are NOT Routines. They are Task subagents Adam spawns in interactive CEO sessions. Saves 6 Routine slots + 12 wrangler secrets.

**Net Routine count after reclassification:** 11 → 11 (unchanged) + 2 additions if approved = **13 Routines to provision in claude.ai**, not 21. The other 10 .md files stay as templates.

---

## Per-agent delta table (10 changes + budget bumps)

| Agent | Skill | MCP | Budget | maxTurns | Schedule |
|---|---|---|---|---|---|
| advisor-daily-thinking | drop `prompt-engineering`, add `startup-metrics-framework` | none | none | none | none |
| morning-digest | none | none | none | none | shift 05:35 → 05:45 (race with Advisor Mem0 writes) + Mon suppression `35 5 * * 2-5` |
| competitor-pulse | drop `deep-research` | none | none | 30 → 15 | trigger_label `agent:competitor-signal` → `agent:competitor-pulse` |
| geo-algorithm-signal | none | none | $1.50 → $2.50 | none | none |
| cto-daily-plan | none | none | none | 30 → 50 | reframe output as "work proposal for Adam" |
| content-idea-generator | none | none | none | none | none |
| monday-standup | none | none | none | none | none |
| friday-retro | none | replace "watcher reports" reads with "audit_log anomaly entries" | none | none | none |
| eod-sync | none | **grant Mem0** | none | none | none |
| auto-unblock | none | add **`worker.stuck` Inngest trigger** | $0.50 → $1.00 | none | event-triggered (also define `routine.timeout` producer in 6C) |
| synthesizer | none | none | $1.00 → $2.50 | 30 → 20 | add `round_sequence` field for personas; wire `@board` comment handler |
| parallel-builder | none | enforce Supabase **read-only** | add $2.00 | none | none |
| parallel-researcher | none | **grant Linear read-only** | add $0.75 | none | none |
| parallel-critic | drop `multi-agent-brainstorming` | none | add (TBD ~$0.75) | none | none |
| parallel-tester | none | none | add $1.00 | none | none |
| parallel-deployer | none | none | add $0.50 | none | none |
| parallel-watcher | none | add escalation path: write `worker.stuck` Inngest events | none | none | none |
| 4 personas | (no change individually) | (no change) | (no change) | (no change) | **REMOVE from Routine provisioning list — Task subagents only** |

---

## R1 + R2 ambiguity-flag resolutions (locked by D4)

**R1 (skill ambiguities):**
- Advisor: `multi-agent-brainstorming` (NOT `agent-orchestration-multi-agent-optimize`)
- Competitor Pulse: `search-specialist` (drop `deep-research`)
- GEO: load both `geo-fundamentals` + `seo-fundamentals` (weekly cadence makes overhead negligible)
- parallel-critic: keep both `code-review-excellence` + `architect-review`
- Visionary: `startup-business-analyst-market-opportunity` (NOT `market-sizing-analysis`)

**R2 (MCP ambiguities):**
- EOD Sync Mem0: **A — grant**
- parallel-researcher Linear: **A — grant read-only**
- parallel-builder Supabase: **B — read-only** (enforce)
- Competitor Pulse Playwright: **B — WebFetch only** (accept coverage gap)
- Architect persona Supabase: **B — deny** (in-context only)

---

## New Q-questions for 6B agenda (Q11-Q15)

In addition to Q1-Q10 from `WS6-SYNTHESIS-AND-OPTIONS.md`:

- **Q11** — Add `security-watcher` Routine? (D2.A1 — HIGH-recommended, +$9/mo, fixes all 10 DR runbooks' detection gap)
- **Q12** — Add `ai-search-rank-tracker` Routine? (D2.A2 — MEDIUM, +$10/mo, closes the GEO-platform-blind-to-own-rank gap)
- **Q13** — Reclassify personas + workers as **NOT-Routines** (Task subagents only)? Saves 10 claude.ai Routine slots + 20 wrangler secrets. (Strongly recommended; current scaffold treats them as Routines incorrectly.)
- **Q14** — Wire `@board` Linear comment handler in bridge OR document `@board` = "add `agent:synthesizer` label"? (HX2 fix)
- **Q15** — Narrow Q7 (no-Telegram) to allow Telegram P0 on 3 anomaly carve-outs (canary fail, fire-rate spike, audit_log schema corruption)? (CC2)

---

## Anti-revisions — what NOT to change

1. **Personas with empty `mcpServers`** — correct. Board meeting determinism depends on in-context data only.
2. **Synthesizer's 3-MCP grant (linear + supabase + mem0)** — correct. Three legitimate output channels.
3. **EOD Sync currently denied Mem0 — flipping this** (D4 Delta #4 says grant) overrides the previous scaffold-builder decision. Adam should explicitly confirm in 6B.
4. **parallel-watcher read-only Supabase** — correct safety posture.
5. **Mem0 outage = data-loss event** — wrong framing. It's a memory gap; customer data + audit_log are unaffected (D5 anti-claim A2).
6. **runaway-watcher cost-summing logic** — sound. The gap is fire-frequency (CC3), not cost.

---

## 6B agenda update

Total questions for 6B: Q1-Q10 (from first synthesis) + Q11-Q15 (new) = **15 decisions**.

Phase 6B order:
1. **Roster decisions (Q11-Q13)** — 15 min. Adam decides additions + reclassification.
2. **Architectural fixes (Q14, HX1-HX3)** — 20 min. Trigger wiring, work-proposal reframing.
3. **Original Q1-Q10** — 30 min.
4. **Per-agent body writing** — 90-120 min. With deltas applied. 13 Routines + 6 worker templates + 4 persona templates = 23 .md bodies.

Updated 6B estimate: 2.5-3 hours, ~$12-18 in CEO Opus tokens.

---

## Verification checklist (end of 6A-bis)

- All 5 deep-review critic files exist + non-stub (`wc -l` ≥ 50) ✓
- This synthesis doc references all 5 inputs + first critique ✓
- Roster delta table covers all 21 agents + 2 proposed additions ✓
- 15 decision questions enumerated ✓
- Anti-revisions explicit ✓
- Plain-English version pending (6A-bis.3 next)

---

## What changed since the first synthesis (`WS6-SYNTHESIS-AND-OPTIONS.md`)

| Concern | First synthesis | Deep review verdict |
|---|---|---|
| Synthesizer budget | $1 → $4 (R2 of first critique) | D4 confirms $1 → $2.50 (lower than $4 first call, more realistic per D4 token math). **Pick $2.50.** |
| Persona scope | Keep all 4 as cheap event-only Routines | Reclassify: NOT Routines. Task subagents inside Synthesizer. (HX2) |
| Worker scope | Keep 6 as Routines | Reclassify: NOT Routines. Task subagents inside CEO sessions. (HX1) |
| Roster size | 21 fixed | Propose 23 (+ security-watcher, + ai-search-rank-tracker), but only 13 are Routines to provision |
| Q7 cost-alert policy | Locked no-Telegram | Narrow to allow 3 specific anomaly carve-outs (CC2) |
