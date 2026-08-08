---
date: 2026-08-08
role: ceo
session: ceo-3-1786169720
task: Wave 2-4 planning (agent/skill/workflow additions from the 2026-08-08 Capability Gap Map) + item #5 (CI permissions convention) + item #8 (spec-conformance QA gate + qa-lead.md accuracy fix)
tier: irreversible
qa_verdict: MIXED — item #5 shipped (trivial-tier, no gate needed); item #8 BLOCKED after 1 QA round with 11 real findings, paused for a scope/approach decision
qa_note: This session also inherited Wave 1 (hook decomposition / Actions pinning / commitlint), already paused separately — see docs/08-agents_work/sessions/2026-08-08-ceo-wave1-hardening-paused.md. Do not re-read that work's detail here; this file covers only what happened AFTER that pause.
pr: none
branch: none merged; multiple unmerged branches, enumerated below
---

# CEO Session — Wave 2-4 planning, paused mid-item-#8

## Read this first

1. **This is a continuation, not a fresh start.** Earlier in this same CEO session, Wave 1 (3 items: hook compound-command decomposition, GitHub Actions SHA-pinning, commitlint enforcement) was executed and paused after 3 QA rounds each — full detail in `docs/08-agents_work/sessions/2026-08-08-ceo-wave1-hardening-paused.md`. That thread is still open and untouched by anything in this file. Adam explicitly chose to pivot to planning Waves 2-4 rather than keep grinding Wave 1's fix loop — that's why this session exists.
2. **Wave 2-4 planning happened via a `/grill-me` session with Adam** — one question at a time, each with a recommendation, working down the design tree. The full prioritization decision is below; don't re-derive it.
3. **Item #8 is the most important open thread right now.** It's paused mid-decision — Adam was asked whether to (a) take another comprehensive fix pass, (b) scale the feature down (drop CI-enforcement, keep it advisory-only), or (c) pause it alongside Wave 1's three. **No answer had been given when this handoff was written.** Read the "Item #8" section below in full before doing anything with that branch.

---

## Wave 2-4 prioritization (decided with Adam, full 12-item list)

The 2026-08-08 Capability Gap Map's Wave 2/3/4 plan has 12 remaining recommendations (after Wave 1's 3). Full mechanism/evidence/risk detail for all of them is in the published artifact linked from `docs/08-agents_work/sessions/2026-08-08-ceo-capability-gap-map.md` — re-read that before starting any item below, the summaries here are not implementation specs.

**Blocked on Wave 1 slice A resolving** (both extend `.claude/hooks/pre-tool-use.sh`, which is mid-rework and paused):
- **#6** Per-skill capability envelope with default-deny
- **#7** Hooks that rewrite what the model sees (secret redaction)

**Accept, in this sequence:**
1. **#5 (CI-half only)** — DONE, see below. *(The local-credential-scoping half of #5 was carved out as an Adam action item, not agent-buildable — see below.)*
2. **#8** — spec-as-machine-contract drift detection. BLOCKED, see below.
3. **#11** — runtime skill-corpus growth / proposal pipeline. **Not started.**
4. **#4** — prompt-injection scanning hook. **Not started.** Same risk shape as Wave 1's hook work (new bash/regex-adjacent security hook) — build with security-engineer or adversary-engineer in the loop from the start, not just at the QA gate, per the lesson from both Wave 1 and item #8.

**Defer (real value, not now — reasons captured for whoever revisits):**
- **#9** local git pre-commit gate — wait until Wave 1's slice C (commitlint) actually resolves; it's the same worktree/shared-`.git/config` problem, just generalized to pre-commit. Reuse slice C's eventual solution rather than re-solving it.
- **#10** skill overrides (team/personal layering) — no active pain point; cost is dominated by per-skill manual authoring (117 files), not the merge mechanism.
- **#12** container/VM isolation — highest blast radius on the entire list (a bad implementation could break every worker's git/pnpm/API access), highest effort (L). Defer to last, build only with heavy adversarial review.
- **#13** office documents skill (docx/pptx/xlsx/pdf) — blocked on a Python/LibreOffice/poppler toolchain Beamix doesn't have, and CLAUDE.md's Bash allowlist explicitly denies `pip install *`. Needs an infra/policy decision from Adam before it's buildable at all.
- **#15** install/uninstall/packaging CLI — real validated need (Adam's own `adamos` fork proves it) but the single largest-effort item (L, ~3,600 LOC in BMAD's version). Own initiative once quick wins are banked.

**Reject (not worth building under current conditions):**
- **#14** multi-host command rendering — the source research itself says the payoff is speculative until a real second interactive host shows up.

---

## Item #5 (CI-half) — DONE

**What it is:** least-privilege GitHub Actions `permissions:` blocks. The artifact bundled this with a local-Claude-Code-session credential-scoping half that isn't agent-buildable (needs Adam to provision separately-scoped tokens outside any repo file) — that half was carved out, see the Adam action item below.

**What was actually done:** audited both existing workflow files (`qa-lead-pass.yml`, `promptfoo-eval.yml`) — both already had correctly-scoped `permissions:` blocks, so there was no code gap to fix. The real gap was that this was tribal knowledge, not a documented convention. Added an explicit rule to `docs/ENGINEERING_PRINCIPLES.md`'s Security Standards section.

**State:** committed as `3dafd91` on branch `ceo-3-1786169720` (this CEO's own worktree branch — **not yet pushed or PR'd**). Trivial tier per `qa-tier-floor.yml` (docs-only change), no QA gate needed.

**Note for whoever resumes:** this commit currently sits alongside the Wave-1 pause handoff doc on the `ceo-3-1786169720` branch. It should get its own PR (or get bundled with whatever else lands from this branch) — it hasn't been pushed anywhere yet.

---

## Item #8 — BLOCKED, paused for a decision (READ IN FULL BEFORE TOUCHING)

**What it is:** three things bundled into one build, because they're tightly coupled:
1. The original ask (Wave 2 item #8): a `spec_conformance` check so the QA gate can detect when delivered work drifted from what was actually asked for — fixing a real, already-broken promise (`cpo.md` claims twice that QA-Lead runs "spec compliance mode" verification; `qa-lead.md` implemented none of it).
2. A related finding the CEO discovered while scoping #8: `.claude/agents/qa-lead.md` was stale — it described an old Trivial/Lite/Full, Task-spawned-reviewer QA model that nothing in the codebase actually invokes anymore. The real binding mechanism for Full/Irreversible tier is `.claude/workflows/qa.js` (a T5 Workflow script — dimension reviewers → 3-way adversarial verify → Opus judge). Adam explicitly chose "fix both together" over "just #8, leave qa-lead.md alone."
3. Another related finding: `.claude/qa-tier-floor.yml` had a gap — `.github/workflows/**` was floored at irreversible but `.claude/workflows/**` (where `qa.js` itself lives — the QA gate's own executable logic) fell through to the default `lite` tier.

**Branch:** `feat/spec-conformance-and-qa-lead-accuracy` · **Worktree (still exists on disk):** `.claude/worktrees/wf_34dc5750-12a-1`

**Commits (5, all CEO-verified before the QA run below):**
- `09b81ee` — `.claude/qa-tier-floor.yml`: added `.claude/workflows/**` → irreversible rule
- `3be3358` — `.claude/workflows/lib/gate-logic.mjs` + tests: `deriveSpecConformance({confirmed, failedDims})`, 5 new unit tests (28/28 total passing)
- `dd45204` — `.claude/workflows/qa.js`: added `spec-conformance` as a 6th DIMENSIONS entry, mirrored `deriveSpecConformance` inline, added `spec_conformance` to the returned verdict object
- `1922452` — `.github/workflows/qa-lead-pass.yml`: Step 3 extended to require `spec_conformance: PASS` for `tier: full|irreversible` session files
- `85ae1f9` — `.claude/agents/qa-lead.md`: rewritten to describe the real qa.js-based mechanism, after investigation confirmed Trivial/Lite tier still uses qa-lead (inline self-review, not the old Task-spawn model) while Full/Irreversible uses qa.js exclusively

**QA verdict (1 round so far): BLOCK, 18 raw findings deduplicating to 11 distinct blockers.** This was a materially worse result than Wave 1's typical rounds — several findings point at real defects the CEO's own careful review missed. Do not treat this as "almost done, one more round." Full detail in QA run `wf_87328371-439` (or re-run `Workflow` with that run's args to inspect). The 11 blockers, grouped:

1. **`qa-lead.md`'s rewrite is mechanically broken**: fails the repo's own `node .claude/hooks/schema-lint.js .claude/agents/qa-lead.md` validator (reproducibly — passes on `origin/main`, fails on this branch: missing `pre_flight_reads`, missing `## Key distinctions`, an unrecognized section-6 header); silently drops the agent's explicit Bash command allowlist (`only git diff, git log, semgrep, tsc, eslint, pnpm test`) with no replacement guard, widening a security-critical agent's tool surface; introduces a `BLOCKED` verdict value that contradicts the file's own declared "PASS or BLOCK, two outcomes only" contract.
2. **`deriveSpecConformance` has a real logic blind spot**: it can never actually return `FAIL` for a P2/P3 finding — only P1 — because `advisory` findings are hard-coded `confirmed: false` in `qa.js` and never reach the `confirmed` array the function checks. The function's own docstring describes a scenario (a P3 spec-conformance finding correctly reporting FAIL while the overall gate still PASSes) that the pipeline cannot actually produce. Also: sweep-phase findings (irreversible tier) get relabelled `dimension: 'sweep'`, silently defeating the dimension check for anything found only during a sweep round.
3. **The new CI enforcement fails in the dangerous direction**: when a session file's `tier:` line doesn't match the exact expected grep pattern, the new `spec_conformance` requirement is silently *skipped* (fails open) rather than blocking — the opposite of the existing, adjacent tier-check's fail-closed behavior. This was reproduced against two real, already-existing session files in the repo (one with trailing text after `tier: full`, one missing a `tier:` line entirely) — not hypothetical. The grep is also unscoped to the YAML frontmatter block, so a `spec_conformance: PASS` string anywhere in the file body (a code sample, a quote) would satisfy it.
4. **The new dimension's own verification chain is hollow**: the adversarial verifiers and the binding judge never actually receive the CEO's `CONTEXT` string, so a spec-conformance finding can never be re-checked against what was actually asked for — it's structurally unfalsifiable by the very mechanism meant to keep the gate honest. Related: the "no context → return empty findings" safety instruction is prompt-text only, with no deterministic code guard, inside a binding gate that the CEO cannot override.
5. **No migration path**: existing session files predating this change would need retrofitting to carry `spec_conformance`, and CLAUDE.md's Documentation Gate (the canonical instruction agents follow for what to put in session frontmatter) was never updated to mention the new field.
6. Minor/process: the `qa.js` inline mirror of `deriveSpecConformance` has zero test coverage of its own (drift-from-canonical risk), and — a pre-existing, not-new-to-this-diff meta-finding — nothing in CI/hooks actually runs `node --test` on `gate-logic.test.mjs` at all, so its 28 passing tests aren't automatically enforced going forward.

**Where this was left:** the CEO flagged all of this to Adam and asked how to proceed — comprehensive fix, scale the feature down (drop CI-enforcement, keep spec-conformance advisory-only inside qa.js's existing findings/blockers output, skip the qa-lead-pass.yml frontmatter requirement entirely), or pause alongside Wave 1's three. **Get that decision from Adam (or make the call yourself if picking this up later and Adam isn't available) before dispatching another fix round.** Given the volume and severity of findings, a full re-fix is a substantial task, not a quick patch — treat it with the same seriousness as a fresh Wave-1-style item, not as "finishing up."

---

## Items #11 and #4 — designed, not started

Both are next in the accepted sequence but no worktree/branch exists yet for either.

- **#11 (skill corpus growth):** the artifact's own binding mechanism is comparatively low-risk — extend `.claude/qa-tier-floor.yml` so paths under `.claude/skills/_proposals/**` floor at `tier: irreversible`, add a `status: proposal|active` field to `.claude/skills/MANIFEST.json`'s schema, and document a CEO end-of-session step that routes drafts to `_proposals/<slug>/PROPOSAL.md` instead of directly authoring `SKILL.md`. No new CI job needed — reuses the existing tier-floor + qa-lead-pass.yml mechanism (which, note, item #8 is currently modifying — check #8's final state before starting #11, since #11 will also touch qa-tier-floor.yml).
- **#4 (prompt-injection scanning):** new `.claude/hooks/prompt-injection-guard.sh` registered under a new `"UserPromptSubmit"` array in `.claude/settings.json` (currently absent). Same risk shape as Wave 1's hook-decomposition work — regex-based security logic in a hook that fires on every prompt. Build with elevated rigor (security-engineer/adversary-engineer in the build loop, not just QA-gate time) given how that pattern has gone twice now (Wave 1 slice A, and arguably item #8's verification-chain gaps).

---

## Adam action item (not agent-buildable)

**Local-session credential scoping** (the other half of item #5): Beamix agents inherit Adam's ambient credentials wholesale (gh auth, MCP tokens, env secrets) with no per-run reduction. Closing this needs Adam to provision separately-scoped credentials (a fine-grained read-only GitHub PAT for most worker sessions, scoped Supabase/Framer/Miro MCP tokens per role) and wire Claude Code to launch each agent role with the right one. This is a credential-provisioning decision outside any repo file — no agent can build it.

---

## Also from this session

- **Prime Agent research** — completed and delivered in full to Adam in-conversation (Prime Intellect's open-source RLM coding-agent harness, released 2026-08-05). Not related to Beamix's own agent system; no further action needed.
- An environment/session restart occurred mid-session (unrelated to any of this work) — three in-flight subagents were killed and had to be re-dispatched from scratch; no data was lost, but it's why some of the above took extra rounds.
- Two file-path mistakes were made and corrected during this session: (1) a `Workflow` resume without re-passing `args` silently defaulted to reviewing an empty diff and produced a vacuous PASS — caught and discarded, the real QA run was re-launched with explicit args; (2) two file writes used absolute paths that landed in the shared main repo's working tree instead of this worktree — caught before committing, files were moved to the correct location, and the accidental main-repo writes were cleanly reverted without touching the other unrelated uncommitted work sitting there. Worth remembering both patterns to avoid repeating them.

## Decisions made
- Adam chose "fix both together" (spec-conformance + qa-lead.md accuracy) over doing them separately.
- Adam chose "per-worktree git config" for Wave 1 slice C's local-hook architecture (recorded in the Wave-1 handoff, repeated here since it's still relevant to deferred item #9).
- The CEO carved out item #5's local-credential half as an Adam action item rather than attempting to build it.
- The CEO closed the `.claude/workflows/**` tier-floor gap directly (a single, clearly-scoped, protective YAML addition) before dispatching item #8's build, rather than leaving qa.js itself under-tiered while modifying it.

## Blockers
Item #8 is blocked pending a scope/approach decision from Adam (see above). Nothing else in this file is blocked on external information — #11 and #4 are ready to start whenever picked up.

## Session file
docs/08-agents_work/sessions/2026-08-08-ceo-wave2-4-planning-handoff.md
