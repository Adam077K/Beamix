# Agent System Rebuild — the plan

**Status:** PLANNING ONLY. Nothing here is built. Adam says go, or it doesn't happen.
**Date:** 2026-08-09 · **Session:** ceo-1-1786220343
**Supersedes:** the Wave 1-4 sequencing in the 2026-08-08 capability gap map (reconciliation below).

---

## The diagnosis, in one sentence

**The three-layer shape is right. The rebuild is not an architecture problem, it is a compilation problem** —
nothing in this system turns "we decided X" into "X is true," which is why 88 audit findings, five fabricated
mechanisms, and a QA gate that is a grep against a hand-typed string all coexist with a sound design.

All eight design lenses, optimizing for mutually incompatible things, reached that independently. It is the
strongest signal this initiative produced.

## The target architecture (locked by Adam)

1. **CEO / orchestrator** — always the entry point. Gives workers goals, tracks progress, starts QA, owns the
   quality bar. Never implements.
2. **Thinking layer** — invokable, not always-on. Breaks down goals, plans, reasons from different
   perspectives before deciding.
3. **Workers** — receive a goal, read skills, execute.

Cross-project asset, own repo, propagated by one mechanism. Adapts per task; improves over time.

---

## Reconciliation: what three research streams actually agree on

The gap map proposed 17 additions. The architecture audit found the system's real problem was enforcement,
not missing capability. The skill harvest then found working implementations of things both had treated as
novel. Net effect: **the plan is smaller than the gap map's, not larger.**

| Gap-map item | Status now | Why |
|---|---|---|
| #1 hook compound-command decomposition | **Superseded** | The native filesystem/network sandbox replaces the substring blacklist entirely, including the `node -e` bypass class. Three QA rounds were spent hardening a mechanism the platform now obsoletes. |
| #2 Actions SHA pinning | **Keep, standalone** | Real supply-chain hygiene, unaffected by the rest. Salvaged work exists on `chore/gh-actions-pinning-v2`. |
| #3 commitlint | **Cut** | Lowest value on the list; caused an incident that broke 50+ worktrees; no lens defended it. |
| #4 prompt-injection scanning | **Folded into the provenance axis** | Becomes a `provenance: untrusted` tag checked in the existing PreToolUse hook, not a new UserPromptSubmit hook. |
| #5 credential scoping | **Has a reference implementation** | Cloudflare `cloudflare-os` Gatekeeper — capability-scoped credential brokering, now *verified* (it was unverified in the gap map). The local half is covered by the global-permissions decision. |
| #6 per-skill capability envelope | **Already shipped by someone** | QM's skill frontmatter carries `requiredCapabilities: [egress:<host>, ...]` on top of the vanilla Skills format. Copy the mechanism; don't invent it. |
| #7 hooks that redact tool output | **Still open** | No prior art found. Genuinely unbuilt. |
| #8 spec-conformance | **Already scaled to advisory-only** | Decided 2026-08-08. CI frontmatter requirement dropped, not deferred. |
| #9 local pre-commit gate | **Deferred** | Same worktree/config problem as #3. |
| #10 skill overrides | **Deferred** | No active pain point. |
| #11 runtime skill-corpus growth | **Becomes the self-improvement pilot** | Narrow: skill descriptions only. See Decision 1. |
| #12 container isolation | **Superseded** | The native sandbox covers the Bash-call case that motivated it, at a fraction of the effort. |
| #13 office documents | **Adopt, don't build** | `anthropics/skills` ships production `docx`/`pdf`/`xlsx`/`pptx` skills. The blocker was always a toolchain, not authoring. |
| #14 multi-host rendering | **Stays rejected** | Unchanged. |
| #15 install/update/uninstall CLI | **Merges with the sync work** | BMAD's installer tracks every installed file's sha256 in `files-manifest.csv` — the integrity mechanism `gsa-sync --apply` lacks. |

**Four items the harvest de-risked from "original bet" to "copy a working implementation":** the per-skill
capability envelope (QM), credential brokering (Cloudflare), install-integrity manifests (BMAD), and
mandatory skill invocation (Superpowers' SessionStart hook). Also confirmed: **`anthropics/skills` uses the
same `SKILL.md` format already in use here** — no corpus migration to plan.

---

## The design — nine components, each with a mechanism

A component without a named hook, CI job, resolver, or data file is disqualified by construction. "The agent
should remember" is what produced the current state.

### 1 · Tier-floor file gains an advisory lane and a provenance axis · **M**
`.claude/qa-tier-floor.yml` is already the system's only working deterministic classifier (first-match-wins,
zero LLM cost, consumed by CI). Extend in place: prose/docs globs map to a new `advisory` tier; a
`provenance: untrusted` flag hard-gates memory and skill writes whose content traces to scanned pages,
fetched URLs, or third-party API responses — **regardless of file type**.
**Mechanism:** the YAML data file, read by `qa-lead-pass.yml` and (new) by `pre-tool-use.sh`.
**Why the provenance axis:** blast radius says *where* to hard-gate and nothing about the advisory lane's own
risk. Under a blanket "advisory on prose" rule, a scanned competitor page becoming a trusted instruction that
fans out to 8 sibling repos is unblocked by construction.

### 2 · `pre-tool-use.sh` becomes the single depth-invariant enforcement point · **S**
The hook already exists, is wired, and has genuine hard-block semantics. Add: agent-system paths gated behind
an explicit session env flag; the tier-floor and provenance lookup from component 1; the native sandbox
replacing the substring blacklist.
**Mechanism:** non-zero exit = BLOCK. ~30-50 lines on a proven file.
**Why a hook and not a rule:** nested spawning is confirmed alive at depth 2. The reflex is to replace the
"chiefs are planning-only" org-chart rule with a better org-chart rule. Don't. A hook fires identically at
every spawn depth; a convention is exactly the class of control that collapsed everywhere else.

### 3 · QA verdict becomes a SHA-bound artifact, and the ruleset is turned on · **M**
Two holes, both confirmed live. The PASS decision is `grep -qiE 'qa_verdict:...PASS'` against a file located
by branch-slug heuristic, with **qa.js never invoked by the workflow** — hand-typing the string goes green.
And ruleset `13276203` has `enforcement: disabled`, so it isn't a required check at all.
**Fix:** qa.js emits `qa-verdict.json {commit_sha, tier, verdict, findings_hash}`; CI asserts
`commit_sha == head.sha`; the ruleset is enabled with the check required.
**Both halves land together or neither matters.** A forgery-proof check nobody must pass is theater; enabling
enforcement on a forgeable grep blocks merges on nothing.

### 4 · `schema-lint.js` wired to CI, extended to `mcpServers`, plus a description lint · **S**
It exists, is named in CLAUDE.md as *the* Trivial-tier gate, is wired to nothing, and fails 10 of 26 agents
when run. It already cross-checks `skills:` against `MANIFEST.json` — the exact pattern needed.
**Add:** wire it in; generate `.claude/mcp-manifest.json` and apply the same check to `mcpServers:` (8 of 13
declared names resolve nowhere); lint descriptions for truncation — several are cut mid-word, and since
progressive-disclosure selection keys on the description field, that is a **silent matching failure**, not
cosmetic.
**Mechanism:** the lint *is* the compilation step. A declared capability that doesn't resolve fails the build.

### 5 · Run log v1 — append-only JSONL with a STALLED envelope, plus one scheduled reader · **M**
One line per run: `run_id, agent, mechanism, model, tokens, cost_usd, tier, thinking_layer_invoked,
qa_verdict, duration_s, structured_output_emitted`. **A run ending with no structured output is written as
`status: STALLED`.** Paired at launch with one dumb weekly cron reporting: mechanisms with zero invocations
in N days, STALLED runs, cost totals.
**Mechanism:** `stop.sh` appends JSONL; a cron greps it. Flat file, `jq` as the entire UI. No dashboard, no
auto-retirement logic.
**Why the envelope:** three separate runs today burned 540k, and then 1.58M tokens returning nothing. Both
were invisible in real time and reconstructed by archaeology afterward.
**Why the reader ships with it:** a write-only log is `DECISIONS.md` repeating at higher stakes — 935 lines
against a 50-entry cap, breached and "noted" by three consecutive sessions.

### 6 · Thinking layer — independent verdicts, then fresh-context synthesis, **no cross-critique round** · **M**
Framing → N independent verdicts from genuinely different objective functions (feasibility / cost / risk /
user-impact / operator-experience) → a synthesizer with fresh context who saw none of them.
**Explicitly drop the cross-critique round for generative decisions.** Personas are objective functions, not
characters. On irreversible decisions, route at least one verdict cross-family.
**Mechanism:** one parametrized fan-out-and-synthesize engine whose perspective set, width, and model routing
come from a config data file — not four hand-maintained peer scripts. qa.js's shape and the thinking layer
become two configs of one engine, validated by the same schema-lint.
**Why:** heterogeneous panels win for *evaluation*; for *generation*, homogeneous debate is weak-to-negative
and accuracy degrades across rounds via sycophancy. The active ingredient is heterogeneity of objective and
of model family — not headcount, not argument rounds.

### 7 · qa.js — keep the behaviour, fix the overclaim, check the mirrored logic · **S**
(a) `verifyFinding()` spawns three `agent()` calls all passing `model: 'sonnet'` — three prompt framings, one
model — while `meta.description` advertises "3 independent adversarial verifiers." Rename it or make it true;
agents read self-descriptions at face value, and that is how five fabricated mechanisms became instructions.
The documented Codex second opinion appears nowhere in qa.js and the binary isn't installed, so cross-family
coverage today is **zero**, not "degraded fallback."
(b) At irreversible tier only, route one verifier slot cross-family.
(c) Add a mechanical drift check between `gate-logic.mjs` (unit-tested, the system's one prose-lifted-into-code
success) and the copies qa.js inlines and actually executes. `node --test` can be green forever while the
executing logic has drifted.
Its 5-dimension rubric decomposition is evidence-aligned and **stays untouched**.

### 8 · Depth ships in shadow mode; T1-T5 is deleted, not refined · **S**
Default: one worker, proportionate QA. Escalation to the thinking layer is a short **static** trigger list in
the same YAML. The "invoke thinking layer?" boolean is logged alongside its outcome — recorded, gating
nothing, for the first 20-30 real tasks. Only after correlating against rework and QA-BLOCK does anything
computed gate anything.
**Why:** "depth is computed" rests on research that calls depth/effort selection *"essentially unsourced."*
Meanwhile the old table's measured result is decisive — T4 never fired, T3 fired once in 2.5 months, and T5
fires a 15-20-agent fan-out purely because the QA tier is Full, so a one-line RLS fix and an ambiguous
multi-domain feature draw identical machinery.

### 9 · Canonical repo + `gsa-sync --apply` with receiving-project re-classification · **L**
Move to its own repo with a proportionate gate — advisory on its own prose, hard on its executable surface.
Then make sync work: it has never been run with `--apply` anywhere, Beamix alone carries ~54 pending updates,
and active sync worktrees exist in 8 sibling projects. On apply, re-run schema-lint and tier classification
against the **receiving** project and refuse on failure. Adopt BMAD's per-file sha256 manifest for integrity.
**Why last, and why non-negotiable:** the entire cross-project ROI thesis is that this reaches ~10 projects.
Until sync works, every hour above pays back in exactly one repo. The value-maximizing and risk-minimizing
lenses independently named this decisive.

---

## Sequence

Each step exists because it unblocks the next.

0. **Close the lapsed stop conditions** (10 min). CLAUDE.md still says *"Vindication triggers active until
   2026-06-15"* — that window expired eight weeks ago with no verdict recorded. State whether FM-12 fired,
   whether the 5-day cap held, whether a customer feature shipped. *This is the proof case for why every stop
   condition below must be a checked artifact.*
1. **Wire `schema-lint.js` as-is; fix the 10 failing agents.** Cheapest item; gates everything downstream,
   because every later component declares capabilities that need a resolver to be real.
2. **Extend it to `mcpServers` + the description lint.** Must follow 1 to matter; must precede the agent-file
   trim, which rewrites exactly these fields.
3. **Extend the tier-floor YAML** — advisory lane, provenance axis, static escalation list. This is the data
   file components 2, 3, and 8 all read.
4. **Extend `pre-tool-use.sh`.** Needs step 3's data. This is when nested spawning becomes safe *without*
   org-chart rules — which unblocks step 6.
5. **Fix the QA verdict + enable the ruleset.** Both halves together.
6. **Delete the dead surface** — T3, T4, `coding.js`, `research.js`, the self-contradicting routing text, the
   ghost roster in `~/CLAUDE.md`. Prune the 13 merged-branch worktrees. *After* step 4, because the hook is
   what replaces the convention being deleted.
7. **Ship run log v1 + the weekly reader.** After 6, so it measures the system being kept, not the one being
   deleted. Before any self-improvement work — there is nothing to improve from until it has data.
8. **Build the one engine**; express the thinking layer and qa.js as two configs. Add the drift check.
9. **Canonical repo + sync**, verified end-to-end on 2 non-Beamix projects.
10. **Trim the 26 agent files** to short form, in one batch. Deliberately last: it is the only cut nobody could
    prove is quality-neutral, so it goes after the run log exists to detect a quality drop.

---

## What is NOT being built

The T1-T5 successor · T3 and T4 as orchestrator tiers · `coding.js` and `research.js` as peer scripts · the
cross-critique round for generative decisions · grep-on-markdown as a verdict artifact · "keep N copies in
sync" as an enforcement comment · blanket unresolved `mcpServers` grants · a dashboard or query layer on the
run log · auto-retirement-on-TTL · a generalized policy DSL · enterprise self-modification machinery
(immutable versioning, restore endpoints — these solve multi-actor trust problems a one-person shop lacks) ·
irreversible-tier machinery applied to the new repo's own prose · **any further audit or research pass.**

The three hardest questions are already established as *"no mature prior art"* and *"essentially unsourced."*
More reading cannot resolve them. Only running the system can.

---

## Locked decisions

1. **Planning only.** Nothing is built until Adam says build.
2. **No hard cap** — "work until it feels right." *Consequence: the stop conditions below are the only brake,
   so they must be checked artifacts, not sentences.*
3. **Self-modification gate** = flag-gated hard block on agent-system paths + a gate at the `gsa-sync`
   boundary where a change fans out to 8 sibling repos. Not a review queue — that over-checkpoints the loop
   into uselessness, and stays available if the run log later shows a bad pattern.
4. **Global permissions come into scope, narrowly.** Keep the skips for Adam's interactive sessions; require
   autonomous runs to be distinguishable and subject to the project-level gate.
5. **Self-improvement in v1** = visibility + the hard hook, called *"adapts," not "self-improves."* Then a
   narrow instrumented pilot: one worker type, one edit kind (**skill descriptions only** — the load-bearing
   surface of progressive disclosure), dedicated branch, rate-capped, 100% human review, measuring how often
   the automated check alone would have let a bad edit through.

## Stop conditions — as artifacts, not sentences

1. Any component declared done while its enforcement is a sentence rather than a named hook, CI job, or data file.
2. The run log exists 4 weeks with no reader, or the weekly cron was never built.
3. A run burns >200k tokens and returns no structured output *after* the STALLED envelope ships.
4. The build extends past components marked S and M without an explicit decision to continue.
5. `gsa-sync --apply` still has not run on a non-Beamix project by the time the rest is built.
6. Beamix ships no customer-facing feature during the rebuild.
7. A new named mechanism is added that nothing invokes within two weeks.

## Questions kept open, not smoothed over

- **Whether the agent-file trim is quality-neutral.** 7,012 lines across 26 files. Nobody could tell which
  prose does real cognitive work; the recommendation is inferred from line count and drift. A
  cost-minimization bet, sequenced last for that reason.
- **What friction actually costs.** Four lenses separately confessed they cannot price what it feels like to
  hit a PreToolUse denial mid-task. Every gate here is proposed by someone who admits they cannot cost it.
- **Whether the evidence base was itself verified honestly.** Three lenses lean on the 88-finding audit; all
  three flagged it was produced by this system, about itself, possibly by a same-family verifier panel — the
  exact flaw it identified in qa.js.
- **Adam as single point of consumption.** Sole flag-holder, sole log reader, sole question target, sole
  bypass authority. Nobody examined what happens when he does not read — which is precisely how the 50-entry
  cap, the vindication triggers, and T3/T4's silent death all played out.
- **Cross-project fit.** Nobody checked whether these tier floors and defaults suit the other ~9 projects.

## The one thing I would pull forward regardless of sequence

**The QA gate is both forgeable and unenforced.** Right now anything can merge — including work from this
rebuild.
