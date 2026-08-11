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

## The design — ten components, each with a mechanism

A component without a named hook, CI job, resolver, or data file is disqualified by construction. "The agent
should remember" is what produced the current state.

*Component 10 added 2026-08-09 (decision 22). Verified the same day that all ten do name a mechanism — but only six
carry an explicit `**Mechanism:**` field; components 3, 7, 8 and 9 name theirs in body prose (`qa-verdict.json` +
`commit_sha == head.sha` + the ruleset; the `gate-logic.mjs` drift check; the static trigger list in the same YAML
plus the logged boolean; `schema-lint` + tier re-classification + a per-file sha256 manifest + refuse-on-failure).*
**Note the recursion: this rule — the one that disqualifies mechanism-less components — has no resolver of its own.**
Checking it means a human reading prose, which is the exact failure mode it exists to prevent. Making
`**Mechanism:**` a required labelled field on every component would let `schema-lint` check it. Filed as a spec gap.

### 1 · Tier-floor file gains an advisory lane and a provenance axis · **M**
`.claude/qa-tier-floor.yml` is already the system's only working deterministic classifier (**highest-tier-wins** —
corrected 2026-08-09; the file's own header comment claimed first-match-wins and this doc inherited the error. The
CI resolver at `qa-lead-pass.yml:215-217` keeps the MAX rank across ALL matching rules with no `break`, so rule
order has zero effect. Verified by reading the resolver and by a 34-path before/after sweep,
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

**Amended 2026-08-09 (hook audit) — there is a third half, and a second forgery path.**
(a) **No CI job anywhere runs `tsc`, `eslint`, `pnpm test`, `pnpm build`, or `pnpm audit`.** The gate is not just
forgeable — *no code is executed against the diff by CI at all*. A SHA-bound, unforgeable verdict on a gate that
compiles nothing is still theater, so component 3 must also land actual execution against the diff.
(b) `qa-lead-pass.yml`'s file-path tier-floor hard-fails **only at `irreversible`**. A `full`-tier floor — e.g.
touching `apps/web/src/lib/auth/**` — prints an info line and lets a session file declaring `tier: lite` merge. Both
forgery paths close together or the cheaper one is simply used.
(f) **The classifier had FIVE holes, found by five separate passes in one day — none by reading the file.**
| # | Path | Was | Found by | State |
|---|---|---|---|---|
| 1 | `.claude/settings.json` (exact string, no glob — missed `.proposed`) | lite | qa-lead, reviewing a fix | fixed, PR #198 |
| 2 | `.claude/skills/MANIFEST.json` (reachable at a non-blocking tier) | lite | adversary-engineer, reviewing a fix | fixed, PR #198 |
| 3 | `.claude/workflows/**` — **the QA gate's own scripts**, 10 tracked files | lite | earlier pass | fixed on unmerged `09b81ee` |
| 4 | **`.mcp.json`** — defines every agent's MCP/tool access surface | lite | adversary-engineer, PR #198 | **OPEN** |
| 5 | `.claude/commands/**` — slash-command definitions | lite | adversary-engineer, PR #198 | **OPEN** |
| 6 | **`CLAUDE.md` and `AGENTS.md`** — auto-loaded into every session in ~10 repos | lite | CEO, 2026-08-11, checking the tier of the file step 0 edits | **OPEN** |
Hole 4 is the notable one: `.mcp.json` grants tool and API access to every agent, a blast radius comparable to
`.claude/hooks/**` which is already `irreversible`, and it currently resolves via the `**` catch-all. **The rate of
discovery is the finding.** Each hole surfaced only when something with teeth was pointed at the file, and the count
rose every time — which is the argument for the resolver, not for another careful read.

**Hole 6, added 2026-08-11, and it makes the point twice.** `CLAUDE.md` is the file auto-loaded into every session
in every repo carrying this system. The rationale placing `.claude/agents/**` at `irreversible` is *"bad prompt
cascades across every spawn"* — `CLAUDE.md` cascades across every spawn of **every agent**, a strictly larger blast
radius, and it is gated at the same tier as a typo. `AGENTS.md`, the routing table, lands identically. Verified by
re-running the resolver's own matcher (`qa-lead-pass.yml:222-224`) rather than by reading the YAML: `CLAUDE.md`
matches **only** the `**` catch-all, because `**/*.md` requires a slash and bash `case` has no globstar — so the
`trivial` rule for markdown never fires for any root-level file at all. Second-order: this is a *third* independent
reason `trivial` is unreachable, on top of (e). **And the repro was first run in zsh, where `case` does not glob an
unquoted variable, which returned false for every pattern including `**` and would have produced the opposite
conclusion.** The finding survived only because a result that impossible got a second look — the method rule
applied to a repro rather than to a count.

(d) **PARSER HAZARD — the resolver substring-matches, it does not parse YAML.** `qa-lead-pass.yml:208` runs `sed`
over lines, so ANY line containing `- pattern:` or `tier:` is read as a real rule — **including comments**. Found
2026-08-09 when a worker's own draft of a corrected header comment silently promoted every file in the repo to tier
`full`; caught by before/after repro testing, not by inspection. **`main` carries exactly ONE such latent line**
(old line 18, `Require: tier:full review…`), inert only by position and removed by PR #198.
*Correction, same day: an earlier draft of this paragraph claimed a "second pre-existing instance dating to
2026-05-16." That was the CEO misreading a worker's phrase "close the second verified hole" — which referred to the
MANIFEST.json fix, not a second hazard line — and relaying it unverified. QA-Lead caught it by grepping every line
of both versions. Logged here rather than silently edited, because it is the exact fabrication class decision 8's
implemented-claim resolver exists to catch, committed into the document describing the fix.*
**A comment can corrupt the classifier that gates every merge.** Component 3 must replace
the substring scan with real YAML parsing, or the data file is not trustworthy no matter how correct its content is.
(e) **`trivial` is structurally unreachable.** The `**` catch-all sits at `lite`, and the resolver takes MAX rank, so
no path can ever resolve to `trivial` — the file's `trivial` labels describe a tier CI never computes. Fixing this is
an algorithm change in the resolver, not a data change, so it was deliberately kept out of the data-only PR #198
whose 34-path regression sweep would otherwise no longer cover its whole diff. Filed here because component 3 is
already reopening this logic, and because component 1's advisory lane is what `trivial` was reaching for.
(c) **Defuse `.claude/settings.json.proposed` first.** It has zero `PreToolUse` and zero `Stop` registrations, and
CLAUDE.md documents it as "pending apply" — applying it deletes the only blocking hook and the run log's append path
in one move. Highest-urgency item the audit found, and it is Irreversible by the tier map with nothing checking it.

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

**Amended 2026-08-09 — external prior art reframes this component.** Source-level research into Pydantic AI
(`docs/08-agents_work/2026-08-09-pydantic-ai-research.md`, v2.27.0, read from raw `.py` on `main`) found three
mechanisms that bear directly on this design, and one of them says we have been diagnosing our own bug wrong:

- **Failures are typed and loud, never silent.** On retry exhaustion — for tool calls and for output validation
  alike — Pydantic AI raises `UnexpectedModelBehavior`. It never returns `None` and never drops a result. That
  reframes our 12-agents-returned-nothing incident: if the harness received *nothing*, something between the
  failure point and the caller is **swallowing the signal**, which is a different defect from "the payload was too
  big." The STALLED envelope detects the symptom; propagating a typed failure would remove the cause. **Both are
  worth having; only one is currently planned.**
- **A pre-flight cost ceiling, not a post-hoc report.** `UsageLimits` (`request_limit`, `cost_limit`,
  `tool_calls_limit`, token limits) is checked by `check_before_request()` *before the next model call is
  dispatched*, raising `UsageLimitExceeded`. Our 540k and 1.58M-token runs would have stopped at a request
  boundary rather than after the money was spent. The run log as designed only observes; this stops.
- **Oversized structured output has a real answer that is not "write to a file" — and it is NOT the retry loop.**
  Explicitly confirmed: `ModelRetry` re-runs generation from scratch, so on an oversized payload it repeats the same
  all-or-nothing attempt and exhausts the retry budget *faster*. The two mechanisms sit adjacent in the same library
  and read as interchangeable in summary; they are not. Porting the retry loop to fix a size failure would make our
  incident worse, not better. The size mechanism is separate and architectural: `StreamedRunResult.stream_output()`
  validates each chunk with Pydantic's `allow_partial=True`, discarding partial-mode failures, and applies the
  strict check only to the final chunk — so the caller receives every valid partial snapshot as the object arrives.
  Two closed issues (#2833, #3194) show the seam has had real bugs, so budget for edge cases if we build an
  equivalent. Our pointer-to-file workaround stays valid and cheaper; this is the more capable version.

Two further confirmations, recorded because they validate decisions made the same day rather than changing them:
decision 19's split of deterministic from judged acceptance criteria is **the same shape** as Pydantic Evals, where
`Equals`/`Contains`/`MaxDuration` and `LLMJudge`/`GEval` all subclass one generic `Evaluator` and run from one
concatenated list — though notably *they* apply no type distinction at all, while our design deliberately gives the
two halves different teeth. And tool-contract resolution there is **static** (`function_schema()` runs at
construction, so a bad signature fails at definition time, before any model call), which is exactly the posture
`schema-lint.js` takes toward declared capabilities.

*Caveat carried from the brief: these strings were read from `main` on 2026-08-09, not a pinned SHA, in a
near-daily-release repo. Treat exact defaults and error text as true-as-of-that-date.*
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

### 10 · Context injection — one advisory hook, configured by a data file · **S** *(added 2026-08-09, decision 22)*
The only component the reference-system harvest ADDED rather than corrected. Measured: Beamix has exactly one hook
emitting `additionalContext` (`gsa-context-monitor.js`); 31 of GSD's 47 hooks are this class. These shape what an
agent **knows**, not what it **may do** — which fits *constrain outcomes, not methods* better than any gate in this
plan, because it widens what a worker knows without narrowing what it may try.
**Mechanism:** one context-emitting hook reading `.claude/context-injection.yml` — `{on: <event>, when: <condition>,
inject: <content>}`. Never blocks; emits `additionalContext` only.
**It already has members decided elsewhere**, which is why it is one component and not five hand-rolled hooks:
decision 21's reader-staleness warning at SessionStart, decision 18's envelope-reach feedback, and a tier warning
when an agent opens an irreversible-tier file.
**Highest-value entry:** inject the relevant `DECISIONS.md` entry when an agent edits a file that decision covers.
`DECISIONS.md` holds 61 entries, "read before acting" and "leave breadcrumbs" are prose rules nothing enforces, and
agents demonstrably do not read them. This turns both into context at the moment of editing without blocking anything.
**Accepted cost, recorded rather than glossed:** injected context is paid in tokens on every matching call, in ~10
repos, forever — and this plan has never priced context cost or friction. That open question now has a component
attached to it.

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
3.5 **`gsa-sync --check` across the 9 live repos** (added 2026-08-09, decision 20). Read-only: per-file sha256
   against the canonical set plus receiving-project re-classification, reporting drift, missing `qa-tier-floor.yml`,
   and per-repo skill presence. Zero writes, so nothing half-rebuilt fans out. Lands here because it needs steps
   1-3 and nothing above them, and because it produces the cross-repo inventory decision 12's "useless in every
   project" cut test requires — which is otherwise unrunnable. `--apply` stays at step 9, unmoved.
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
- ~~**Cross-project fit.** Nobody checked whether these tier floors and defaults suit the other ~9 projects.~~
  **Measured 2026-08-09** (decision 20). 11 repos carry the system, not "~10 projects" as an aspiration. Eight are
  near-identical hand-copied clones of Beamix's 26/144/7/13 baseline (`aiclub`, `beeond`, `etsyc`, `evalove`,
  `finfun`, `ghostb`, `noam-website`, `realestate`); `adamos` is deliberately divergent at 6 agents / 58 skills but
  **11 hooks to Beamix's 7**; and three — `hitstampjavagame`, `ml2`, `test1` — are stale forks carrying the
  pre-cleanup 426-574-skill corpus with no `qa-tier-floor.yml`, and are exactly the three repos with **zero commits
  in 90 days**. They are out of scope by data. What remains genuinely unchecked is whether the *tier floors
  themselves* suit the 9 live receivers — `--check` at step 3.5 answers it before `--apply` at step 9 can act on it.
  **Note the ROI is understated, not overstated:** `etsyc` (689 commits/90d) and `evalove` (385, committed
  2026-08-09) both out-commit Beamix. This system's busiest consumer is not the repo it is built in.

## The one thing I would pull forward regardless of sequence

**The QA gate is both forgeable and unenforced.** Right now anything can merge — including work from this
rebuild.
