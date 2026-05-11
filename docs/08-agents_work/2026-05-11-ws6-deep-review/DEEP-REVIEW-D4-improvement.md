# Deep Review D4 — Improvement Critic

**Date:** 2026-05-11

## Frame

The 21 scaffolds are fixed. Every delta below works within that constraint — swapping skills, resolving MCP ambiguity flags, and right-sizing budgets and maxTurns. The goal is to reduce wasted tokens on silent days, surface two under-powered budgets before they hard-halt in production, and lock the five R2 ambiguity flags so WS6-6B can write bodies without revisiting them. No agent is added, removed, or re-modeled.

---

## Top 10 Deltas (ranked by impact)

| Rank | Agent | Delta type | Specific change | Why |
|---|---|---|---|---|
| 1 | synthesizer | Budget | $1.00 → $2.50 | 4-round board synthesis with 4 persona inputs + DECISIONS.md write reliably exceeds $1 on Opus 4-7. Hard-halt at $1 cuts output mid-synthesis, producing no usable decision JSON. |
| 2 | competitor-pulse | Skill | drop `deep-research`; keep `competitive-landscape` + `search-specialist` | 3 skills at $0.40/fire is wasteful. `deep-research` encourages long multi-hop chains incompatible with the silent-on-no-change contract. `search-specialist` + `competitive-landscape` are sufficient and cheaper. |
| 3 | advisor-daily-thinking | Skill | drop `prompt-engineering`; add `startup-metrics-framework` | `prompt-engineering` is self-referential — Advisor reads external signals, it doesn't tune prompts. `startup-metrics-framework` grounds the "worth questioning" section in real unit economics. |
| 4 | eod-sync | MCP | Grant Mem0 (flip R2 option B → A) | EOD Sync writes the episodic chain that Morning Digest reads at 05:35. Without Mem0, Morning Digest must parse a raw Linear ticket — fragile and noisy. The dual-write risk is lower than the brittle-parsing risk. |
| 5 | parallel-researcher | MCP | Grant Linear read (flip R2 option B → A) | Without Linear read, the spawning parent (cto-daily-plan) must serialize the full ticket into the brief — consuming tokens in the parent context. Read-only Linear grant is zero write-blast-radius and saves ~500 parent tokens per spawn. |
| 6 | parallel-builder | MCP | Set Supabase scope to read-only (enforce R2 option B) | Builder does feature implementation; schema changes belong to parallel-deployer. Service-role in a builder worktree is full DDL — one bad migration wipes prod. Read-only scope enforces the QA gate structurally. |
| 7 | competitor-pulse | maxTurns | 30 → 15 | Silent-on-no-change days should exit after ~5 turns. maxTurns 30 is headroom for an agent that should almost never use it. 15 aligns the ceiling with real work volume and prevents runaway web-fetch loops. |
| 8 | auto-unblock | Budget | $0.50 (inferred from roster) → $1.00 | Auto-Unblock reads audit_log, diagnoses a stuck Routine, and fires a corrective cascade (up to 3 levels). That's heavier than a digest agent. If the budget is too tight it will halt before resolving the incident it was spawned to fix. |
| 9 | parallel-critic | Skill | remove `multi-agent-brainstorming`; keep `code-review-excellence` + `architect-review` | `multi-agent-brainstorming` is a coordination pattern, not a review pattern. Critic is a single-agent pass producing PASS/CHANGES_REQUESTED. Removing it frees ~200 skill-load tokens per spawn. |
| 10 | synthesizer | maxTurns | 30 → 20 | Board synthesis is a structured 4-round protocol. 30 turns encourages exploratory tangents. 20 is still generous for the protocol; 10 turns below cap reduces tail-token waste on well-formed inputs. |

---

## R2 Ambiguity Resolutions (5 cases)

- **EOD Sync Mem0:** **A (grant)** — EOD Sync is the primary writer of episodic context that Morning Digest reads. Denying Mem0 forces Morning Digest to parse a Linear ticket format instead of a structured memory query. The "avoid dual-write" concern is minor: EOD Sync only writes, Morning Digest only reads, no collision path.

- **parallel-researcher Linear:** **A (grant read-only)** — Researcher needs ticket context to scope its work correctly. Parent passing full context wastes tokens at the orchestrator layer. Read-only Linear cannot write tickets or close issues — zero blast-radius. Grant it.

- **parallel-builder Supabase scope:** **B (read-only)** — Builder worktrees run untested feature code. Service-role grants DDL rights in a branch context. Any schema mutation must go through parallel-deployer with a migration file and QA gate review. Read-only is the structurally correct enforcement, not a nice-to-have.

- **Competitor Pulse Playwright:** **B (WebFetch only — current)** — Competitor Pulse fires daily at $0.40. Playwright adds capability scope, MCP complexity, and cost variance that don't match a monitoring agent's contract. If a target page requires JS rendering, the Routine should flag it for manual review — not silently escalate its own toolset. Accept the coverage gap.

- **Architect persona Supabase:** **B (deny — current)** — Personas receive in-context data from the board session opener. Granting Supabase to a persona means live schema access during a synthesis session, which introduces timing risk (schema mid-change during a long board meeting). Parent passes schema snippets; Architect reasons over them. Zero MCP footprint is the right choice for a board-meeting-only agent.

---

## R1 Ambiguity Resolutions (5 cases)

- **Advisor brainstorming vs orchestration:** Use `multi-agent-brainstorming`. Advisor is a pure synthesis agent — it reads 5 sources and writes a brief. It does not coordinate downstream agents. `agent-orchestration-multi-agent-optimize` is the wrong frame for a single-output reader.

- **Competitor Pulse deep-research vs search-specialist:** Use `search-specialist` (already in scaffold, confirmed correct). `deep-research` is incompatible with the silent-on-no-change contract — it encourages long reasoning chains. Drop it (see Delta #2 above).

- **GEO single vs dual fundamentals:** Load both `geo-fundamentals` + `seo-fundamentals`. GEO Algorithm Signal is a weekly Opus-tier report synthesizing scan data against algorithm trends. Losing `seo-fundamentals` loses the baseline comparison layer that makes GEO deltas legible to Adam. The weekly cadence makes the extra skill-load cost (once per week) negligible.

- **parallel-critic code-review-excellence vs architect-review:** Use `code-review-excellence` as primary, `architect-review` as secondary (both in scaffold). Critic reviews PRs by default. When reviewing an ADR, `architect-review` is the active skill. Keeping both lets the critic serve both use cases from a single scaffold.

- **Visionary market-opportunity vs sizing:** Use `startup-business-analyst-market-opportunity`. Visionary's output is narrative horizon-3 framing for board consumption, not a TAM/SAM/SOM table. `market-opportunity` grounds that narrative; `market-sizing-analysis` produces numbers that belong in Strategist's output, not Visionary's.

---

## Per-Agent Budget Audit

| Agent | Current Budget | Verdict | Recommended |
|---|---|---|---|
| advisor-daily-thinking | $2.00 | OK | $2.00 |
| morning-digest | $0.30 | OK | $0.30 |
| competitor-pulse | $0.40 | OK (after Delta #2 skill drop) | $0.40 |
| geo-algorithm-signal | $1.50 (inferred) | LOW — weekly Opus synthesis over scan_results rows | $2.50 |
| cto-daily-plan | $1.50 (inferred) | OK | $1.50 |
| content-idea-generator | $0.50 (inferred) | OK | $0.50 |
| monday-standup | $0.40 (inferred) | OK | $0.40 |
| friday-retro | $0.60 (inferred) | OK | $0.60 |
| eod-sync | $0.50 (inferred) | OK | $0.50 |
| auto-unblock | $0.50 (inferred) | LOW — see Delta #8 | $1.00 |
| synthesizer | $1.00 | LOW — see Delta #1 | $2.50 |
