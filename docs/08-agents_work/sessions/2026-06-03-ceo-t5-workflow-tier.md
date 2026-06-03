---
date: 2026-06-03
role: ceo
task: t5-workflow-tier
tier: irreversible
qa_verdict: PENDING
status: PROPOSED
branch: ceo-4-1780491385
---

# CEO — T5 Workflow Orchestration Tier

**What:** Added a 5th orchestration tier (T5 Workflow) to the war-room. T5 uses the Claude `Workflow` tool — a deterministic JS script the CEO runs that fans out ~15-20 agents and spawns the fleet itself (sidesteps the nested-Task block). For big/mid+ work in any domain: complex coding, design, research, QA.

**Why:** War-room (T1-T4) is LLM-driven decomposition, capped at ~3-7 agents/task with no N-way redundancy. Workflow tool is deterministic fan-out built for redundancy-for-confidence. Split: war-room = decomposition, Workflow = depth/confidence. Optimizes for quality (Adam directive, grill-me session).

**Decisions (all Adam-confirmed via grill-me):** split mechanisms · trigger = Tier+complexity test · 4-template named library · T5 = the QA engine, `qa.js` binding · ~15-20 agents (loop-until-dry on Irreversible) · standing auth via T5 classification, `ultracode` = manual override · Sonnet fleet + Opus judge + Haiku trivial, $10→$15 ceiling · T5-coding chains into `qa.js`.

**Changed:** `.claude/agents/ceo.md`, `.claude/agents/_seeds/ceo.md`, `.claude/memory/DECISIONS.md`, `project_orchestration_topology_locked.md` (out-of-repo auto-memory), new `.claude/workflows/{qa,coding,design,research}.js` + `README.md` (531 LOC, all node --check valid).

**Open / next:** Irreversible tier — needs Adam sign-off + QA before merge. Not yet committed/PR'd. Optional dogfood: run `qa.js` on this very diff as the first live test. CEO `model:` still `claude-opus-4-7` (Opus 4.8 bump is a separate decision).
