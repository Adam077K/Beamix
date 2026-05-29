# Handoff to next CEO — 2026-05-30

**You are starting a fresh CEO session. Paste the prompt below at the start of your session OR read this file directly. It catches you up on yesterday's work without forcing you to re-derive context.**

---

## Status as of 2026-05-29 end-of-session

### Just shipped to main (5 PRs)

```
495fe31 feat(wave2): W2.2 weekly_digests migration + digest-builder Inngest cron (#102)
0a6cb1b feat(email): scaffold weekly-digest Resend template (W2.2) (#103)
3a0feb8 feat(ai): W2.2 digest-writer agent (system prompt + types + runner) (#101)
d174797 fix(types): register scan/free.requested + discovery/chat events in BeamixEvents (#100)
674a067 feat(wave2): W2.5 founding-100 cohort tracking foundation (#99)
```

What this means for the product:
- W2.5 founding-100 cohort tracking has its column + cron skeleton
- W2.2 weekly digest has its full foundation: table, Inngest cron, AI agent (security-hardened), Resend template
- W2.2 still NOT sending real emails (depends on W2.3 for held-revenue data + Resend wiring + /approval/:id endpoint with signed-URL auth)

### What was unblocked

1. **All 25 agent files are dual-mode** — both legacy-JSON-return AND Agent Teams (`team_name` parameter) work
2. **T1-T4 orchestration topology LOCKED** — see `.claude/memory/project_orchestration_topology_locked.md`
3. **Agent Teams empirically validated** — T3 pilot shipped real code
4. **`bin/beamix` rewrite now unblocked** — task #6 was waiting on this

## Open tasks (prioritized)

| Priority | Task | Why |
|---|---|---|
| **1** | Rewrite `/Users/adamks/bin/beamix` to use `TeamCreate` + per-role `Agent` calls reading seed prompts from `.claude/agents/_seeds/[role].md` (or `_paste-prompts/`) | The tmux war-room launcher's hardcoded `CEO_PREAMBLE` references stale ontology (`.agent/agents/...`, `build-lead`, `backend-developer`) that doesn't match the actual canon. Every CEO pane is being seeded with a wrong agent map. |
| 2 | Delete the abandoned `feat/be-w2-weekly-digest` worktree + branch (1,400 LOC of pre-existing W2.2 work from a previous session, superseded by yesterday's three merged PRs) | Stale artifact; watcher caught it yesterday to prevent duplication |
| 3 | Fix `.claude/hooks/pre-tool-use.sh` chmod over-match (denies any Write that mentions chmod, treating it as `chmod +x`) — distinguish mode-bits (`chmod 644`) from executable-bit (`chmod +x`) | Caused a worker BLOCK in yesterday's PoC v1 |
| 4 | Add `Bash` to `.claude/agents/technical-writer.md` tools array (currently can't do worktree/git ops; team-lead had to do them manually) | Architectural gap from T3 pilot |
| 5 | The five P2/P3 quality items deferred from PR reviews (TODO needs Linear ticket, `computeCostUsd` dedupe, mock fixture realism, Sentence case rule, etc.) | Backlog polish, low urgency |
| 6 | Adam needs to add `Bash(tmux kill-pane:*)` to `.claude/settings.json` himself (classifier blocks self-modification even with explicit auth) | Recurring blocker on stuck-teammate cleanups; one-line file edit |

## Key locked decisions to honor

Read these memory files at session start:
- `.claude/memory/project_orchestration_topology_locked.md` — 4-tier orchestration (T1 Solo / T2 Dispatch-Packet DEFAULT / T3 Ephemeral Team / T4 Persistent Team)
- `.claude/memory/feedback_cto_planning_only.md` — nested-Task is structurally blocked at runtime; chiefs emit dispatch packets, CEO spawns
- `.claude/memory/project_opus_4_8_available.md` — Opus 4.8 is available; bump `claude-opus-4-7` references when touched
- `.claude/memory/project_war_room_paste_prompt_source.md` — where the launcher prompt lives and why it's stale

## What NOT to redo

- Don't re-discover that nested-Task is blocked. It's structurally blocked at the runtime layer + Auto-Mode classifier. CC version 2.1.154 doesn't change it.
- Don't re-test Agent Teams primitives. They work. PoC v2 + T3 pilot proved it end-to-end.
- Don't re-refactor agent files. All 25 already dual-mode (commit `d3e1085`).
- Don't try to skip chiefs in T2. The 2026-05-29 decision is explicit: chiefs mandatory in T2 for expertise layer.

## Recommended next step

**Rewrite `bin/beamix`** (task #1 above). The agents are ready, the topology is locked, the launcher is the last piece. This is what unlocks the war-room model in real use.

Suggested path:
1. Read `/Users/adamks/bin/beamix` lines 52–96 to see the stale preamble
2. Create `.claude/agents/_seeds/` directory (or `_paste-prompts/`)
3. Write a seed file per role (CEO, CTO, CPO, CMO, CBO, CCO, QA-Lead, Research-Lead, Design-Lead)
4. Rewrite `bin/beamix` to read seeds + use `TeamCreate` + per-role `Agent` calls
5. Test on one ephemeral team
6. Commit

## Identity for your session

```
/color gold
/name ceo-bin-beamix-rewrite     # or whatever you tackle first
```

If running a parallel CEO, use `/color orange` (or teal/lime).

## Session summary file (mandatory at end of your session)

Write to `docs/08-agents_work/sessions/YYYY-MM-DD-ceo-[task-slug].md` with frontmatter:
```yaml
---
date: YYYY-MM-DD
role: ceo
session_slug: ...
qa_verdict: PASS
---
```

Enforced by `.github/workflows/qa-lead-pass.yml`.

---

# Paste-prompt for your fresh session (if you want a one-shot catch-up)

```
You are CEO of Beamix continuing from the 2026-05-29 session. Pre-flight:

1. Read docs/08-agents_work/sessions/2026-05-29-ceo-t3-pilot-and-w2-merges.md (yesterday's summary)
2. Read docs/08-agents_work/handoff/2026-05-29-handoff-to-next-ceo.md (this file's parent)
3. Read .claude/memory/LONG-TERM.md
4. Read .claude/memory/project_orchestration_topology_locked.md (LOCKED 2026-05-29 — chiefs mandatory in T2, T1-T4 tiers, validators out-of-band)
5. Read .claude/memory/feedback_cto_planning_only.md (structural runtime constraint — chiefs emit packets, CEO spawns)

KEY FACTS:
- 25 agent files are now dual-mode (Agent Teams + legacy JSON return). DO NOT refactor again.
- 5 PRs merged yesterday (#99, #100, #101, #102, #103). W2.2 weekly digest foundation is on main.
- bin/beamix launcher is stale and is the recommended next task.

Set identity: /color gold, /name ceo-[your-task-slug]

Then ask Adam what to work on, with bin/beamix rewrite as the recommended default.
```
