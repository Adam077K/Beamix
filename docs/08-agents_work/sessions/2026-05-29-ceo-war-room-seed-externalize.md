---
date: 2026-05-29
role: ceo
session: ceo-war-room-seed-externalize
tier: irreversible
qa_verdict: PASS
pr: 105
---

# CEO Session — war-room launcher seed externalization (+ per-role seeds)

## Goal
Rewrite the tmux war-room launcher (`/Users/adamks/bin/beamix`) whose hardcoded
`CEO_PREAMBLE` seeded every new CEO pane with a dead agent ontology
(`.agent/agents/`, `build-lead`, `*-developer`). Externalize to versioned seed
files and bake in the locked T1–T4 topology + correct C-suite/worker canon.

## Shipped (this PR)
- **NEW** `.claude/agents/_seeds/ceo.md` — corrected CEO seed (8 chiefs:
  CTO/CPO/CMO/CBO/CCO/QA-Lead/Research-Lead/Design-Lead; `*-engineer` workers;
  T1–T4 topology; nested-Task constraint; no-CEO-subagent rule; QA-gate-sacred).
- **NEW** 8 thin role seeds (`cto/cpo/cmo/cbo/cco/qa-lead/research-lead/design-lead.md`)
  — pointers to `.claude/agents/<role>.md`, NOT duplicates, to minimize drift.
  Each carries remit + topology + QA gate + identity (color/name) + session-file gate.
- `/Users/adamks/bin/beamix` (OUTSIDE repo, live-edited) — `CEO_SEED_FILE` var +
  load-with-fallback; `inject_ceo_prompt()` single `send-keys -l` paste unchanged.
  Seed goes live for new war rooms after this PR merges; fallback used until then.

## QA gate (out-of-band validators per locked topology)
- code-reviewer PASS (P2/P3 nits only) + security-engineer PASS.
- Tier: **Irreversible** — `.claude/agents/_seeds/**` matches `.claude/agents/**`
  in `.claude/qa-tier-floor.yml`, and the resolver takes MAX rank, so seeds are
  Irreversible-tier (carries `risk:irreversible` label + Adam sign-off on merge).
- An earlier attempt to carve `_seeds/**` down to `full` was DROPPED — the max-rank
  resolver makes a lower-tier carve-out ineffective, and it was flagged as a
  self-weakening gate change. Seeds correctly stay Irreversible.
- **Verdict: PASS.**

## Notes / corrections to the inbound handoff
- Wave2 PRs #99–#104 ARE merged (main = 7436a2a). Earlier in-session confusion
  came from the local `main` *branch* ref being stale at #98 while `origin/main`
  was correctly #104 — see memory `feedback-verify-github-main-not-local-refs`.
- Adam selected per-role seeds; all 9 ship here.

## Follow-ups
- Worker C (add `Bash` to `.claude/agents/technical-writer.md`) — backlogged
  (1-line agent-def change trips full Irreversible; batch with next agent-def edit).
- ⚠ Adam manual: add `Bash(tmux kill-pane:*)` to `.claude/settings.json` allow.
- Consider relocating `_seeds/` outside `.claude/agents/` if Irreversible-per-edit
  proves too heavy (would need its own `full`-tier floor rule).
