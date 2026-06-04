---
date: 2026-06-03
role: ceo
task: t5-workflow-tier
tier: irreversible
qa_verdict: PASS
status: READY_TO_MERGE
branch: ceo-4-1780491385
qa_run: wf_e40ddea1-f54 (full tier, PASS, 6 agents/~$4, 0 confirmed, 7 advisory non-blocking)
---

# CEO — T5 Workflow Orchestration Tier

**What:** Added a 5th orchestration tier (T5 Workflow) to the war-room. T5 uses the Claude `Workflow` tool — a deterministic JS script the CEO runs that fans out ~15-20 agents and spawns the fleet itself (sidesteps the nested-Task block). For big/mid+ work in any domain: complex coding, design, research, QA.

**Why:** War-room (T1-T4) is LLM-driven decomposition, capped at ~3-7 agents/task with no N-way redundancy. Workflow tool is deterministic fan-out built for redundancy-for-confidence. Split: war-room = decomposition, Workflow = depth/confidence. Optimizes for quality (Adam directive, grill-me session).

**Decisions (all Adam-confirmed via grill-me):** split mechanisms · trigger = Tier+complexity test · 4-template named library · T5 = the QA engine, `qa.js` binding · ~15-20 agents (loop-until-dry on Irreversible) · standing auth via T5 classification, `ultracode` = manual override · Sonnet fleet + Opus judge + Haiku trivial, $10→$15 ceiling · T5-coding chains into `qa.js`.

**Changed:** `.claude/agents/ceo.md`, `.claude/agents/_seeds/ceo.md`, `.claude/memory/DECISIONS.md`, `project_orchestration_topology_locked.md` (out-of-repo auto-memory), new `.claude/workflows/{qa,coding,design,research}.js` + `README.md` (531 LOC, all node --check valid).

**Dogfood:** PR #132 (6 commits). `qa.js` ran on its own diff 5×: BLOCK×4 (found real bugs each round — prompt-injection in verifier prompts, fail-open judge, null-deref/dropout tolerance) → **PASS** on run 5 (`wf_de0ee653-f58`, full tier, 4 P3 non-blocking). ~$85-110 total. Lesson: gate converges but is expensive on self-referential net-new code; real app-code diffs will be cheaper. Two governance follow-ups logged: (1) $15 cost ceiling is unenforceable (budget directive not CEO-settable on named-workflow calls); (2) "no-override" rule needs a false-positive appeal path (gate over-blocked twice on FPs). 3 P3s fixed post-PASS.

**Governance hardening (done):** cost-scoped verification (verify only block-eligible findings → final re-gate was 6 agents / ~$4, clean PASS) + Adam-only logged false-positive appeal path. Re-validated clean: run `wf_e40ddea1-f54`.

**Fast-follows (advisory, non-blocking, logged from the PASS run):**
- P2 `sec-design-prompt-injection` — design.js BRIEF/TARGET/REFERENCE raw in prompts → DATA-fence like qa.js.
- P2 `sec-coding-prompt-injection` — coding.js slice.id/brief/files raw in buildPrompt() → DATA-fence.
- P3 — qa.js inline severity-sort duplicates `capBySeverity` (no sync comment); `const advisory` mutated via .push() in Sweep; `normalizeArgs` missing a parseable-non-object test; `capBySeverity` exported/tested but unused; Sweep rounds lack the MAX_VERIFY fan-out backstop.

**Open / next:** Irreversible per policy → still needs Adam merge sign-off on PR #132. CEO `model:` still `claude-opus-4-7` (Opus 4.8 bump separate). Remaining open: coding.js worktree-ref integration + the 7 fast-follows above + hard cost-cap enforcement.
