---
title: Deep Review D2 — Completeness Critic
date: 2026-05-11
reviewer: D2 (completeness)
scope: roster additions and removals — open by Adam decision
---

# Deep Review D2 — Completeness Critic

## Frame

Does the 21-agent roster (11 Routines + 6 Workers + 4 Personas) cover every recurring operational need implied by the war room's own documentation? Sources surveyed: INDEX.md, ROUTINE-ROSTER.md, WAR-ROOM-MASTER.md, TECH-STACK.md (§3A security, §3D cost instrumentation), all 10 runbooks in `docs/07-history/runbooks/`, and the WS4 session notes. D1's findings (model-ID, routing.ts) are treated as read — not restated here.

---

## Proposed additions

### D2.A1 [HIGH] security-watcher

- **Role:** Daily scan — dependency CVEs (`npm audit`), committed-secret presence, `audit_log` anomaly patterns (rule_violation spikes, off-schedule fires).
- **Why add:** All 10 runbooks list detection methods that are pull-based and human-executed — "Adam's email," "Audit log" checked manually. `runbooks/github-compromise.md` detection relies entirely on Adam polling GitHub. TECH-STACK.md §3A mentions `gitleaks`/`trufflehog` in GitHub Actions CI, but only on PR runs — no scheduled scan. `parallel-watcher` covers runaway sessions; no Routine today checks for CVEs or `rule_violation` accumulation. The 15-secret rotation calendar (secret-rotation.md) has an Inngest calendar nudge but does not verify that rotation actually happened.
- **Proposed schedule:** Daily 20:45 (Window 4, after EOD Sync at 20:30 — no quota conflict). Model: Sonnet. Budget: $0.30/fire ($2.10/wk, +$9/mo). MCPs: supabase (read `audit_log`), github (read check runs). Skills: `security-audit`, `web-security-testing`.
- **Trade-off if added:** +$9/mo, one additional W4 fire (headroom: ~7/day unused).
- **Trade-off if NOT added:** Secret drift and dependency CVEs caught only after a compromise triggers a runbook. The war room's own security surface is unmonitored between Adam's manual checks.

---

### D2.A2 [MEDIUM] ai-search-rank-tracker

- **Role:** Daily check of Beamix's own AI-SERP position (ChatGPT, Perplexity, Claude answers for "AI SEO tool", "GEO platform for SMBs") — distinct from Competitor Pulse, which tracks competitor content changes, not Beamix's own ranking.
- **Why add:** Competitor Pulse reads "competitor pricing pages, blog posts, AI-search rankings" — that last item conflates two signals. Knowing a competitor's blog changed is not the same as knowing whether Beamix appears when a prospect asks an AI assistant. GEO Algorithm Signal reads Beamix scan data across customer sites, not Beamix's own SERP slot. WS4 session notes flag: "Beamix product itself has no visibility tracking loop." As a GEO platform, Beamix should dogfood its own core promise. The gap is also the highest-irony gap in the roster: a GEO platform blind to its own GEO rank.
- **Proposed schedule:** Daily 05:42 (Window 1, between Competitor Pulse 05:40 and GEO Signal 05:45 — same Adam read block). Model: Sonnet. Budget: $0.35/fire ($2.45/wk, +$10/mo). MCPs: web. Skills: `geo-fundamentals`, `competitive-landscape`.
- **Trade-off if added:** +$10/mo. W1 Sunday grows to 5 fires, all Sonnet-tier — no Opus quota collision.
- **Trade-off if NOT added:** No automated signal that Beamix's own AI-search visibility is degrading. Competitor Pulse cannot detect this reliably; it is not designed to.

---

### D2.A3 [LOW] post-mortem-builder

- **Role:** Event-triggered on P0 runbook resolution — auto-generate a structured postmortem from `audit_log` trail and write to Linear + `docs/07-history/`.
- **Why add:** All 10 runbooks include "post-incident review" steps but none assign who generates the postmortem. Manual burden falls on Adam at his most depleted moment. Pattern recognition across incidents is lost.
- **Proposed schedule:** Event-triggered (`incident.resolved`). Model: Sonnet. Budget: $0.50/fire (~$2/mo at current incident frequency). MCPs: supabase, linear, mem0. Skills: `error-handling-patterns`.
- **Verdict:** Skip at MVP. Incident frequency is too low to justify wiring cost now. Add at 50 customers when P0 events begin recurring.

---

## Proposed removals

### D2.R1 Morning Digest — Monday suppression only

Morning Digest fires at 05:35 daily, including Mondays. Monday already has Advisor (05:30) + Monday Standup (10:40) covering the same sprint-state data with more depth. Morning Digest on Mondays adds $0.30 of noise, not signal.

- **Recommendation:** Cron adjustment only — change `35 5 * * *` to `35 5 * * 2-5`. Not a removal.
- **What we lose:** ~5 minutes of earlier sprint awareness on Monday mornings. Not material.

---

### D2.R2 — No full agent removals proposed

**6 Workers:** Builder, Researcher, Critic, Tester, Deployer, Watcher map to non-overlapping execution phases. Collapsing any two creates a QA violation (Critic reviewing its own work). No redundancy.

**4 Personas:** Visionary (horizon-3), Strategist (execution), Architect (technical feasibility), Aria (vendor/procurement) are four irreconcilable lenses. Architect and Strategist overlap in vocabulary but not in frame — one answers "can we build it?" while the other answers "should we?" No consolidation warranted.

**3 briefing Routines:** Advisor, Morning Digest, Monday Standup are not the same signal. Advisor synthesizes external news; Morning Digest synthesizes internal Linear state; Monday Standup structures the week's plan. The overlap concern is valid only on Mondays (addressed in R1 above).

---

## Roster verdict

Add `security-watcher` — the runbooks assume human-triggered detection; a scheduled Routine closes that gap with real evidence from the war room's own stack. Add `ai-search-rank-tracker` — Beamix has a philosophical and operational obligation to track its own GEO rank, and neither Competitor Pulse nor GEO Algorithm Signal does this. Defer `post-mortem-builder` to 50-customer milestone. Apply Monday cron suppression to Morning Digest (one-line cron edit). Keep all 6 Workers and all 4 Personas as designed. Net change: **+2 Routines, 0 removals, 1 cron tweak. Roster becomes 23 agents.**

---

## Anti-claims

**Cost-summary Routine is missing.** TECH-STACK.md §3D.3 and WS4 Q7 explicitly lock passive-only cost observation. A dedicated cost-summary Routine contradicts an Adam-locked decision. Not a gap.

**adam-os-bot is missing.** The war room is for autonomous scheduled work, not Adam's personal inbox. Proposing this violates the war room's own scope boundary. Adam runs CEO interactively for personal workflow decisions.

**linear-triage is missing.** The Cloudflare bridge handles dedup via `FireCountDO` + KV. CTO Daily Plan assigns work from open tickets. Adding a dedicated triage Routine creates an ordering dependency and a ticket-mutation conflict with CTO Daily Plan. The current design avoids that collision correctly.

**log-anomaly-detector is missing.** `parallel-watcher` covers `audit_log` + `claude_progress` in real-time. The proposed `security-watcher` adds daily pattern-scan. Between the two, anomaly coverage is adequate without a third agent.

**dep-vuln-scanner should be standalone.** At single-operator stage with one Next.js app, a weekly `npm audit --json` appended to the `security-watcher` brief is sufficient. Splitting adds scheduling complexity for no additional coverage.
