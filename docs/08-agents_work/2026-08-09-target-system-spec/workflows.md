# Workflow layer — target spec

**Surface:** Workflow layer (`.claude/workflows/`)
**Status:** PLANNING ONLY. Nothing here is built. Adam says go, or it doesn't happen.
**Session:** ceo-1-1786220343 · 2026-08-09

---

## Current state (measured, with the commands you ran)

```
ls -la .claude/workflows/ && wc -l .claude/workflows/*.js
```
→ 6 real `.js` scripts: `qa.js` (232 lines) · `coding.js` (107) · `design.js` (128) ·
`research.js` (167) · `capability-gap-map.js` (476) · `capability-gap-map-followup.js` (133).
1,243 lines total. Plus `lib/gate-logic.mjs` (56) + `lib/gate-logic.test.mjs` (87), `README.md`
(4,135 bytes), and `design-screen.md` (20,103 bytes — see finding below). This matches the
"6 workflow scripts" figure given in the brief.

```
grep -n "require(\|readFile\|fs\.\|import \|process\.\|__dirname" .claude/workflows/*.js
```
→ **zero hits across all 6 files.** Confirmed: the Workflow runtime executes each script as a
standalone body with no module system and no filesystem access — only injected globals
(`args`, `phase`, `log`, `agent`, `parallel`, `pipeline`, `workflow`, `budget`). This is not
incidental — `qa.js`'s own header comment says so explicitly: *"the Workflow runtime has no
shared-module import"* and warns that its arg-normalizer is "duplicated across all
`.claude/workflows/*.js` — keep the 4 copies in sync." `lib/gate-logic.mjs` exists as a
parallel, unit-tested spec (`node --test .claude/workflows/lib/`) precisely because `qa.js`
cannot `import` it — it can only mirror it by hand. **This constraint is the central design
problem the target state below has to solve**, not a detail to work around casually.

```
cat .claude/workflows/README.md
```
→ Confirms proof/usage split from the brief: `qa.js` = "**binding** verdict" (proven — the
sacred gate). `design.js` documented with real shape (Explore→Critique→Synthesize). `coding.js`
and `research.js` listed with equal billing in the same table despite, per `ceo.md`'s own T5
library table and the rebuild-plan doc below, **zero real invocations**. `capability-gap-map.js`
+ its followup are described in the README itself as one specific dated run
(`wf_e3a4ad25-1d2`, 60 agents) whose sibling script's "targets/redo are hardcoded for that
specific run — copy and edit rather than re-invoking as-is" — i.e. one-off by the README's own
admission.

```
grep -n "budget\." .claude/workflows/*.js
grep -n "runtime_constraint" .claude/workflows/capability-gap-map-followup.js
```
→ `budget.total` / `budget.remaining()` / `budget.spent()` are real injected globals, used only
in `qa.js`'s Irreversible-tier sweep loop (`budget.remaining() > 60000`). The unit of `60000` is
**never stated anywhere in the codebase** — could be tokens, could be a cost proxy. Separately,
`capability-gap-map-followup.js`'s own `DEEPDIVE_SCHEMA` enumerates a `runtime_constraint` value
called `no_hard_workflow_budget` — **the system's own schema already documents, as a first-class
enum value, that there is no hard workflow-level budget enforcement.** This matches `ceo.md`'s own
admission: *"The $15 ceiling is advisory, not yet hard-enforced (a budget directive isn't
CEO-settable on named-workflow calls — open follow-up)."*

```
grep -n "workflows" .claude/qa-tier-floor.yml
```
→ **Zero matches.** `.claude/workflows/**` has **no explicit pattern** in the 142-line tier-floor
file. It falls through to the final catch-all rule (`pattern: "**", tier: lite`). **This
contradicts `docs/08-agents_work/2026-08-09-AGENT-SYSTEM-REBUILD-PLAN.md`'s own claim** ("`.claude/
agents/**`, `.claude/hooks/**`, and `.claude/workflows/**` all floor at irreversible") — verified
false by direct read of the file. `qa.js` is the binding merge gate for every other change in this
repo, and today a change to it requires only a **Lite**-tier review (code-reviewer + qa-engineer +
semgrep) — no security-engineer, no craft-reviewer, no Adam sign-off. This is a real, currently-live
gap, not a hypothetical one; it is fixed below.

```
find . -iname "design-screen*"; grep -rln "design-screen" --include="*.md" --include="*.js" .
```
→ **Finding: a 7th, never-real "workflow."** `.claude/workflows/design-screen.md` is a full
design-pipeline spec (Reference → Build → First-paint checkpoint → Validate-loop → Judge-checkpoint,
3 founder pause-points) with a complete `js` code block *embedded inside the markdown prose* —
but there is **no `.claude/workflows/design-screen.js` file**. Given the `Workflow({name:"qa"})` →
`.claude/workflows/qa.js` convention every other script follows, `Workflow({name:"design-screen"})`
cannot resolve to anything. The only two references to it are session logs from 2026-06-04, one of
which records: *"Founder mentioned an existing ultracode 'designing' workflow we could never find
in the repo."* This is direct, dated evidence of a named mechanism that was speced, documented as
shipped in a session summary, and never actually invoked — the exact failure mode sub-question 5
asks how to prevent, already realized once in this repo's own history.

```
head -60 .claude/hooks/schema-lint.js
```
→ `schema-lint.js` is a real Node CLI (`fs`, `path` available — unlike the sandboxed workflow
scripts) that today validates only `.claude/agents/*.md` against a template. It never touches
`.claude/workflows/` at all. It already implements exactly the pattern needed here (cross-checking
a declared field — `skills:` — against `MANIFEST.json`), just not extended to this surface yet.

```
find .claude/agents -maxdepth 1 -name "*.md" | wc -l   → 26
find .claude/hooks -maxdepth 1 -type f | wc -l          → 7
find .claude/commands -maxdepth 1 -name "*.md" | wc -l  → 13
find .claude/skills -maxdepth 1 -type d | tail -n +1 | wc -l → 146
```
→ Confirms the brief's headline counts for the surfaces adjacent to this one.

**Net measured picture:** 6 scripts, but only 2 are proven (`qa`, `design`); 2 have zero
invocations (`coding`, `research`); 2 are one-off by their own admission (`capability-gap-map` +
followup); and a 7th ("design-screen") never worked at all. The enforcement gap is real and
currently live: the file that decides every merge is under-tiered by the project's own tier-floor
file, and one of the project's own planning documents states the opposite of what the file says.

---

## Target state (the complete enumeration)

### 0. Why "one engine" cannot mean "one file" here — and what it means instead

The instruction is "ONE parametrized fan-out-and-synthesize engine configured by DATA, not four
hand-maintained peer workflow scripts." Taken literally inside the measured constraint above (no
`import`, no `require`, no `fs` inside a workflow script), a single hand-edited `.js` file cannot
serve four different `Workflow({name:...})` call sites, because the runtime resolves `name` to a
specific file and that file cannot pull in shared code at run time.

The target design resolves this with **generation, not duplication**:

```
.claude/workflows/
  lib/
    fanout-engine.mjs        # THE engine. Canonical, unit-tested. The ONLY place fan-out,
                              #   verify, judge, sweep, retry, budget, and STALLED logic is
                              #   ever hand-written. Absorbs today's lib/gate-logic.mjs whole
                              #   (same 5 functions, renamed into the decisionFn registry — see
                              #   Format & schema). Tested via `node --test .claude/workflows/lib/`.
    fanout-engine.test.mjs   # Supersedes gate-logic.test.mjs (same assertions, moved).
  configs/
    qa.json                  # DATA. The only file a human edits to change the QA gate's shape.
    thinking.json            # DATA. The invokable C-suite reasoning layer.
    design.json              # DATA. Explore → Critique → Synthesize, now with optional checkpoints.
    research.json            # DATA. Decompose → Sweep → Verify → Synthesize.
  build.mjs                  # Regenerates every .claude/workflows/<name>.js from
                              #   lib/fanout-engine.mjs + configs/<name>.json. Run locally
                              #   (`node .claude/workflows/build.mjs`) and in CI.
  qa.js                      # GENERATED. Checked in (the runtime needs a real file per name).
  thinking.js                # GENERATED.
  design.js                  # GENERATED.
  research.js                # GENERATED.
  fanout-adhoc.js            # GENERATED from the same engine, with configSource="args" instead
                              #   of a baked config file — see §4 (ad-hoc path) below.
  README.md                  # Rewritten: documents the engine/config split, not per-script prose.
```

Every generated file opens with:
```js
// GENERATED by .claude/workflows/build.mjs from lib/fanout-engine.mjs + configs/<name>.json.
// DO NOT EDIT THIS FILE. Edit the config (or the engine, if the change is cross-workflow) and
// regenerate. A CI drift check fails the build if this file does not match its regeneration.
```
This makes "configured by data, not hand-maintained scripts" literally true and mechanically
checked (see **The mechanism that keeps this honest**), rather than a description that quietly
stops being accurate the first time someone hand-patches a generated file under deadline pressure
— which is exactly how `qa.js`'s 4 duplicated arg-normalizers came to exist in the current system.

### 1. The engine, concretely — `lib/fanout-engine.mjs`

The engine implements one fixed, six-phase shape. Every config is an instantiation of it; no
config may add a phase the engine doesn't know about (that would be a hand-maintained peer script
again, wearing a config's clothes).

| Phase | What it does | Optional? |
|---|---|---|
| **Frame** | One agent call (usually opus) that expands a raw input into N sub-units (research's sub-questions) or resolves a named default set (thinking's perspective list for a `decisionType`). Skipped when a config's roles are statically declared (qa's 5 dimensions never change per call). | Yes |
| **Generate** | The fan-out: one `agent()` call per role/unit, run via `parallel()` or `pipeline()` per config. Every call goes through the engine's resilience wrapper (see §2). | No |
| **Evaluate** | Optional scoring/verification of what Generate produced. Three mutually exclusive modes: `adversarial-vote` (N voters, quorum+majority, qa/research), `independent-score` (each critic scores independently, no cross-talk, design), `none` (thinking — explicitly, by rule, never a debate round for generative output). | Yes |
| **Sweep** | An optional extra Generate+Evaluate round, gated by a boolean expression over `tier`/`args` and bounded by dry-round/round-cap/budget-floor stop conditions. Only `qa` at `tier:irreversible` uses this today; the field is general so any config can opt in. | Yes |
| **Judge** | One final agent call (model config-set, usually opus) that reads **only** the structured outputs of Evaluate/Generate — never the intermediate conversation transcripts — and emits the workflow's bound return schema. Supports a `decisionFn` for deterministic post-processing that the LLM is not trusted to apply alone (qa's severity override; thinking's dissent-preservation check). Every judge declares a `failSafe`. | No |
| **Return** | Structured result. Any array field whose natural size is unbounded is `outputMode:'file-pointer'` (see §3) — never inlined raw. | — |

### 2. Per-agent resilience contract (engine-level, not per-config)

Every `agent()` call the engine makes — in every phase, in every config — goes through one
wrapper function (`callRole()`) inside `fanout-engine.mjs`. A config cannot opt out of this; it is
not a per-workflow discipline problem anymore, it is a property of the one place all agent calls
originate from.

```
callRole(role, prompt) does, in order:
  1. Up to role.retries attempts (config default: 1 retry on top of the first try — matches
     today's qa.js reviewDim() pattern exactly).
  2. Each attempt wrapped in .catch(() => null) — an engine call NEVER throws. A thrown error
     from the platform is caught and treated as attempt failure, not a workflow crash.
  3. A hard ceiling per attempt: role.maxTurns (engine default 40) and role.maxTokens (engine
     default 200,000 — the exact number named in the rebuild plan's Stop condition #3: "a run
     burns >200k tokens and returns no structured output"). Config MAY lower these per role;
     it may NOT raise maxTokens above 300,000 without an explicit `justification` string field
     (schema-lint enforced — see Format & schema) because that ceiling is the direct fix for the
     540k-token/zero-output failure mode measured today.
  4. If a ceiling is hit before StructuredOutput is called: the attempt is recorded to the run
     log as one `role_call` line with status:"stalled" (see run-log schema), and treated
     identically to a dropout by the caller — never a special case the phase logic has to
     remember to handle.
  5. All retries exhausted with no structured return → return null. The calling phase's existing
     aggregation pattern (`.filter(Boolean)`, coverage-gap tracking, advisory demotion) — already
     present in every one of today's 4 scripts — is what absorbs the null. The engine guarantees
     the wrapper never throws; it does NOT guarantee every phase has a graceful null-handling
     path — that is still config-author responsibility, but it is now the ONLY thing left for a
     config author to get right, not error handling, retries, ceilings, and logging as well.
```

This directly answers failure mode (a) — **agents that work to exhaustion and return nothing**.
The 540k-token Wave-1 incident (3 agents, ~180k tokens each, zero StructuredOutput calls, no
checkpoint) is exactly the shape `maxTokens: 200000` + mandatory-STALLED-logging is built to catch
early instead of discovering by archaeology afterward. For workloads that are legitimately large
(a multi-file build slice, not a review), the config-level answer is `role.chunk` (see Format &
schema): split one big unit of work into N smaller role calls with an intermediate structured
return required after each chunk, rather than one all-or-nothing task — the specific mitigation
the postmortem names as missing ("no incremental checkpoint").

### 3. Output-size contract — `outputMode`

This directly answers failure mode (b) — **enumeration payloads too large to serialize** (the
12-agent, 13KB-payload, 5-retries-each failure from earlier today, and the mechanism this very
task's own prompt was written to avoid).

Every role's schema is one of two shapes, and `schema-lint` (see below) refuses to register a
config where a role is neither:

- **`outputMode: 'inline'`** (default). The role's JSON schema MUST declare `maxItems` on every
  array property, and the product of `maxItems × ` (estimated per-item byte size from the schema's
  string-length hints) must stay under an engine-enforced ceiling (**4 KB per role response**,
  chosen from the measured 13KB-failure being ~3x over whatever the runtime could reliably
  round-trip). `capability-gap-map.js`'s own `INVENTORY_ITEM_SCHEMA` already hand-rolled the
  correct fix in one place — `sample_items` capped to 20 with an explicit "do NOT try to enumerate
  a 1000+ item corpus exhaustively" instruction — the target state makes that the **only** legal
  shape for a large-corpus role, engine-wide, instead of one script's local convention.
- **`outputMode: 'file-pointer'`**. For roles whose natural output is a full enumeration (a skill
  corpus, an agent roster, a research claim list beyond the per-subquestion cap). The role's prompt
  is engine-appended with the exact instruction this task itself was given: *"Write your full
  output to `<scratch_path>`. Your structured return carries only a pointer and counts — never put
  a large enumeration in a structured-output call."* The schema for these roles is the shared
  `FILE_POINTER_SCHEMA` fragment (`{path, count, summary}` — see Format & schema), never a custom
  shape. Scratch files land under `.claude/workflows/.scratch/<run_id>/<role_key>.json` (see Open
  questions for retention).

`schema-lint` mechanically rejects (non-zero exit, CI-blocking) any role schema with an unbounded
array and `outputMode` unset or `'inline'` — the 13KB failure becomes structurally unreachable
rather than something a config author has to remember to avoid.

### 4. Invocation surface

```
Workflow({ name: "qa",       args: { ref?, tier: "full"|"irreversible", context? } })
Workflow({ name: "thinking", args: { question, decisionType?, perspectives?, tier? } })
Workflow({ name: "design",   args: { brief, target?, variations?, reference?, screenRef? } })
Workflow({ name: "research", args: { question, depth?: "standard"|"deep" } })
Workflow({ name: "fanout-adhoc", args: { config: {...inline config object...}, ...call args } })
```
The first four calls are byte-identical in shape to today's convention — a CEO/lead script that
already calls `Workflow({name:"qa", args})` needs zero changes. `fanout-adhoc` is new: the ad-hoc
path described in §6, for genuinely one-off shapes (the `capability-gap-map` case) that should not
become a permanent named mechanism just because they need the engine's machinery once.

### 5. The four named workflows (configs) — complete enumeration

#### 5a. `qa` — the binding gate. **Behavior unchanged**, re-hosted on the engine.

| Field | Value |
|---|---|
| Frame | none — 5 dimensions are static |
| Generate (roles) | 5 dimension reviewers: `correctness`* , `security`*, `patterns`, `tests`, `perf` (*critical — coverage gap on these forces BLOCK). Model: sonnet. Retries: 1. `outputMode: inline`, `maxItems: 30` on `findings[]`. |
| Evaluate | `adversarial-vote`, 3 voters, model sonnet, only on **block-eligible** findings (P1 always; P2 only at `tier:irreversible`) — the exact cost-control reasoning in today's `qa.js` is preserved verbatim as `verification.scope: "blockEligible"`. `decisionFn: "quorumMajority"` (≥2 votes cast AND strict majority real — the 1-of-1/1-of-2-tie non-confirmation rule survives unchanged). `maxPerRole: 40` (today's `MAX_VERIFY` backstop, unchanged). |
| Sweep | Enabled iff `tier === 'irreversible'`. `dryLimit: 2`, `roundCap: 3`, `budgetFloor: 4.00` (USD — see Format & schema for the unit clarification made here). |
| Judge | Model opus. `decisionFn: "qaVerdictOverride"` — mirrors `gate-logic.mjs::decideVerdict` exactly: BLOCK if any confirmed P1 (P1/P2 at irreversible) OR a critical dimension is in the coverage gap, else defer to the judge's own verdict. `failSafe: "BLOCK"` (a dropped-out judge fails closed — never open, for a binding gate). |
| Return schema | `{verdict, ref, tier, verified, confirmed, advisory_count, advisory[], dimensions_failed, critical_gap, verdict, judge_verdict, summary, blockers[]}` — same fields as today. |
| Budget | `ceiling_usd: 15` (config default; CEO may tighten via `args.budget_usd`, never loosen past the config ceiling without an explicit `override_ceiling_usd` field that itself gets logged). |

**How the proof survives (sub-question 2, explicit):** every number, threshold, and rule named
above is copied from the currently-running `qa.js`, not reinvented. The 5-dimension rubric, the
critical-vs-non-critical split, the block-eligibility rule, the strict-majority-with-quorum vote
logic, the loop-until-dry bounds, and the deterministic severity override are all **data fields in
`configs/qa.json`**, sourced from the current file line-for-line — nothing about *what the gate
checks* changes. What changes is *where the logic that enforces those rules lives*: today it's
duplicated inline in `qa.js` with a separately-maintained, never-imported mirror in
`gate-logic.mjs`; in the target state, `quorumMajority` / `blockEligible` / `qaVerdictOverride` /
`capBySeverity` are each implemented exactly once, inside `fanout-engine.mjs`, unit-tested, and
referenced by name from `configs/qa.json` — the duplication-drift risk the current header comment
warns about is closed by construction, not by discipline.

#`.claude/workflows/lib/fanout-engine.test.mjs` inherits `gate-logic.test.mjs`'s assertions
unchanged — same test names, same expected outputs, now testing the functions where they actually
execute (today's tests exercise `gate-logic.mjs`, which `qa.js` never imports — so a green test
suite today proves nothing about what `qa.js` actually does; the target state's engine is the one
and only place both live).

#### 5b. `thinking` — **new**. The literal implementation of the locked architecture's Thinking Layer.

This is the single most important addition. None of the current 6 scripts implement "independent
verdicts from genuinely different objective functions, then fresh-context synthesis, no
cross-critique round" — `qa.js`'s dimension reviewers are heterogeneous by *lens*, but they are
**evaluating a diff**, not generating a decision; `design.js`'s critics score independently but
never generate the underlying options themselves. `thinking` is the config that makes the
orchestrator's invokable reasoning layer real.

| Field | Value |
|---|---|
| Frame | Resolves a `decisionType` to a default perspective set (data, extensible — see table below), or accepts a caller-supplied `perspectives[]` override. |
| Generate (roles) | N independent **verdict-generators**, one per perspective. Each is a genuinely different objective function — not the same agent asked to role-play. Model: sonnet, EXCEPT: on `tier:'irreversible'`, `crossFamilySlots: 1` routes one verdict to a different model tier (`opus` today — see Open questions on true cross-vendor routing). `outputMode: inline`, schema below. |
| Evaluate | **`none` — by explicit rule.** No cross-critique, no debate round. This is the one config field every other config leaves at a non-`none` value; here it is hard-set and `schema-lint` refuses a `thinking`-family config that sets it to anything else. Heterogeneity of objective function and (partially) model family is the working mechanism — not argument rounds, which the evidence base says degrade accuracy via sycophancy for generative decisions. |
| Sweep | Disabled — single pass. |
| Judge (Synthesize) | Model opus. Receives **only** the array of verdict objects — never the framing prompt's conversation, never sees which perspective "went first." `decisionFn: "preserveDissent"` — the return schema requires a non-omittable `dissent[]` field (empty array if genuinely unanimous, but the field cannot be dropped) naming every perspective the synthesis does NOT follow and why. `failSafe: "returnRawVerdicts"` — if the judge drops out, the engine returns the raw per-perspective verdicts unsynthesized rather than fabricating a merged consensus from nothing (matches the existing "don't lose the work" pattern in today's `design.js`/`research.js` synthesis-dropout handling). |
| Return schema | `{decision_type, perspectives_used[], verdicts[] (perspective, recommendation, reasoning, confidence, key_risk), tensions[] (between, nature), recommendation, dissent[], confidence}` |
| Budget | `ceiling_usd: 6` (default — 4-5 sonnet verdict-generators + 1 opus synthesis is materially cheaper than qa's fan-out). |

**Default perspective sets (data, in `configs/thinking.json`, not hardcoded per call site):**

| `decisionType` | Perspectives |
|---|---|
| `infra` | feasibility, cost, risk, operator-experience |
| `product` | user-impact, feasibility, cost, brand-fit |
| `process` | risk, operator-experience, cost, org-impact |
| `default` | feasibility, cost, risk, user-impact, operator-experience |

A caller (CEO or any C-suite lead) may pass `perspectives: [...]` explicitly to override the
default set for a novel decision the fixed table doesn't fit — the Frame phase becomes a no-op
pass-through when this is supplied.

#### 5c. `design` — kept, proven (~5 real runs), same Explore→Critique→Synthesize shape.

| Field | Value |
|---|---|
| Frame | none — angles are a static list (`configs/design.json.angles`, 6 entries, unchanged from today's `ANGLES` array) or caller-supplied |
| Generate | N explorers (`N = clamp(variations, 2, 6)`, default 4), `agentType: product-designer`, model sonnet, one per angle |
| Evaluate | `independent-score` — one `design-critic` per variation, no cross-talk, 0-40 scored across 4 axes (brand_fidelity, craft, usability, brief_fit), `decisionFn: "rankByTotal"` |
| Sweep | disabled |
| Judge (Synthesize) | opus, grafts strongest runner-up ideas into the winning angle, `failSafe: "returnRawRanking"` |
| **New optional field: `checkpoints`** | `["lock-reference", "first-paint", "judge-final"]` — activates only when `args.screenRef` is supplied (a folder under `docs/design/references/<screen>/`). Folds in the one genuinely valuable idea from the dead `design-screen.md` (see §6) — the script cannot block on human input mid-run, so each checkpoint is emitted as a `log()` line + a `checkpoint` field in the structured return, exactly as `design-screen.md` already specified; the CEO/design-lead relays it and re-invokes. This is now a mode of `design`, not a 7th separate file. |
| Budget | `ceiling_usd: 10` |

#### 5d. `research` — kept, unproven (zero real invocations to date), same Decompose→Sweep→Verify→Synthesize shape.

| Field | Value |
|---|---|
| Frame | opus decompose into 4-6 sub-questions, each tagged a distinct source-type angle |
| Generate | one `researcher`-typed sonnet agent per sub-question, blind to the others |
| Evaluate | `adversarial-vote`, **1 voter per claim** (not 3 — this is a deliberate, different depth from `qa`: a single binary holds/rejected check per sourced claim, `maxPerRole: 12` claims per sub-question, matching today's cap exactly) |
| Sweep | disabled |
| Judge (Synthesize) | opus, cited brief from verified claims only, `failSafe: "returnRawClaims"` |
| Budget | `ceiling_usd: 8` |

**Conditional survival clause (ties to sub-question 5):** unlike `qa` and `design`, `research`
has never actually run. It stays in the target roster because its shape (verification-heavy,
not debate-heavy) is architecturally sound and cheap to keep once the engine exists — but it is
explicitly flagged for the run-log-driven zero-invocation check (see **The mechanism that keeps
this honest**). The `/research` command should be updated to call `Workflow({name:"research",...})`
by default instead of freehand `Task` dispatch, specifically so this config gets a real invocation
history instead of repeating its first 2.5 months of existence.

### 6. What is cut, and what replaces the capability

- **`coding.js` as an auto-fired named workflow — cut.** Zero real invocations. Its shape (parallel
  build slices in isolated worktrees, then chain into `qa`) does not need bespoke fan-out/verify/
  judge machinery — it needs the CEO to dispatch N workers directly (ordinary Task dispatch, no
  Workflow tool) and then call `Workflow({name:"qa", args:{ref: <integration-branch-range>}})`
  explicitly once the slices land. The capability is not lost; the *auto-escalation into a
  15-20-agent fan-out purely because the QA tier is Full* is — which the rebuild plan separately
  identifies as the exact problem with the old T1-T5 tiering ("a one-line RLS fix and an ambiguous
  multi-domain feature draw identical machinery"). If a genuinely repeatable N-way-parallel-build-
  then-gate shape earns real usage later, it re-enters as a `configs/build.json` at near-zero
  marginal cost — same mechanism as any other config — but it does not exist until it has
  earned that, so there is nothing sitting unused in the meantime.
- **`capability-gap-map.js` + `capability-gap-map-followup.js` as checked-in scripts — cut, merged
  into an ad-hoc pattern.** The followup script's own header proves the point: *"targets/redo are
  hardcoded per-run... copy and edit rather than re-invoking as-is."* A one-off does not deserve a
  permanent named file. Its capability survives as a **worked example** in the engine's `README.md`
  — a full `resolve → extract → collapse → deepdive → verify` config object, invoked via
  `Workflow({name:"fanout-adhoc", args:{config:{...}}})` with no `configs/*.json` file ever
  created. It is still logged in the run log like any run (visible), but is explicitly exempt from
  the orphan-config lint (§ mechanism) because it was never checked in as a named mechanism in the
  first place — there is nothing to go stale.
- **`design-screen.md` — deleted outright.** It never had a working `.js` counterpart (confirmed
  above), was never successfully invoked once in 2 months, and its one good idea (3 founder
  checkpoints) is folded into `design`'s new optional `checkpoints` field (§5c) instead of being
  resurrected as a standalone 7th script that would just as easily go stale again.
- **`lib/gate-logic.mjs` + `lib/gate-logic.test.mjs` — merged into `lib/fanout-engine.mjs` /
  `.test.mjs`.** Not cut — the logic and its tests survive unchanged — but consolidated into the
  one file that actually executes it, closing the "tests pass, but test a file nothing imports"
  gap measured above.

### 7. Budget — how a workflow declares and enforces its own, given cost stays advisory

Sub-question 4, answered directly. Cost is locked as **advisory** (visible in a run log, never a
hard stop) — this spec does not relitigate that. What it adds is a *concrete, settable* budget
path, closing the "not yet hard-enforced... open follow-up" gap named in `ceo.md`:

1. Every config declares `budget.ceiling_usd` (see per-config tables above). Units are
   **standardized to USD (float)** across the engine — today's `budget.remaining() > 60000` in
   `qa.js` has no stated unit anywhere in the codebase; this spec fixes that ambiguity by defining
   `budget.total` / `budget.spent()` / `budget.remaining()` as USD-denominated globals injected by
   the runtime, and translates the sweep-floor check accordingly (`budgetFloor: 4.00` — stop the
   irreversible-tier sweep loop with at least $4 of headroom left for the judge call, preserving
   the original intent of "don't let the loop eat the budget the judge needs").
2. The CEO may **tighten** a config's ceiling per call via `args.budget_usd` (new — this is the
   concrete mechanism that makes the budget "CEO-settable on named-workflow calls," closing that
   exact open item). Loosening past the config's own ceiling requires an explicit
   `override_ceiling_usd` argument, which the engine logs verbatim to the run log alongside a
   `reason` string — an override is allowed, but it is never silent.
3. A config's own internal logic MAY use `budget.remaining()` to self-throttle (exactly as `qa`'s
   sweep loop already does) — this is a workflow *choosing* to adapt its own depth to remaining
   budget, which is a legitimate generative-config behavior, not a platform-level hard stop.
4. **The one hard boundary that is NOT budget-gated:** per-agent `maxTurns`/`maxTokens` (§2) are a
   *token/output* ceiling, not a *cost* ceiling — they exist to catch the exhaustion failure mode
   (a) regardless of budget headroom, and they DO abort an individual role call (never the whole
   workflow) even with budget remaining. This is deliberate and should not be confused with a cost
   hard-stop: it is a stall detector, not a spending limit.
5. Every run (and every role call within it) is appended to the run log with its config's
   `ceiling_usd`, actual spend, and whether an override was used. The weekly cron (component 5 of
   the rebuild plan; this spec assumes, not owns, that surface) reports overruns — advisory,
   surfaced to Adam, never a mid-run abort.

---

## Changes: kept / cut / merged / added

| Item | Disposition | One-line rationale |
|---|---|---|
| `qa.js`'s 5-dimension rubric, block-eligibility rule, quorum+majority vote, loop-until-dry sweep, deterministic severity override | **Kept, unchanged** | Proven — 9+ real BLOCK→fix→PASS cycles; evidence-aligned per the brief; moved to data (`configs/qa.json`) but not altered. |
| `qa.js`'s duplicated arg-normalizer + inline-mirrored gate logic | **Cut** | The engine/config split removes the need for any script to duplicate this; `fanout-engine.mjs` is the one place it lives. |
| `design.js`'s Explore→Critique→Synthesize shape | **Kept, unchanged** | ~5 real runs; already the correct heterogeneous-evaluation pattern (independent critics, no cross-talk). |
| `design-screen.md`'s 3 founder checkpoints | **Merged** into `design` as optional `checkpoints` field | The idea was good; the standalone file never worked and never will as a 7th hand-maintained script. |
| `design-screen.md` (the file) | **Cut** | Never had a working `.js` counterpart; never invoked once in 2 months; direct session-log evidence it was "a workflow we could never find in the repo." |
| `coding.js` as an auto-fired named workflow | **Cut** | Zero real invocations; duplicates ordinary multi-worker dispatch + an explicit `qa` call; was the concrete example of "identical machinery for a one-line fix and an ambiguous multi-domain feature." |
| `coding.js`'s capability (parallel build slices → chain into QA) | **Preserved, demoted to ordinary orchestration** | Doesn't need engine machinery; the CEO can already do this with plain `Task` dispatch + `Workflow({name:'qa'})`. |
| `research.js`'s Decompose→Sweep→Verify→Synthesize shape | **Kept, conditional** | Architecturally sound (verification-heavy, not debate-heavy) and now near-zero marginal cost as a config; explicitly flagged for the zero-invocation check since it has never actually run. |
| `capability-gap-map.js` + followup | **Cut as named scripts, merged as a documented ad-hoc pattern** | Both admit (in their own headers/README prose) to being one-off; a one-off does not deserve permanent-file status; the shape survives as a worked example callable via `fanout-adhoc`. |
| `lib/gate-logic.mjs` + test | **Merged into `lib/fanout-engine.mjs`/`.test.mjs`** | Consolidates the system's one prose-lifted-into-code success into the file that actually executes it, instead of a parallel file `qa.js` can only mirror by hand. |
| **`thinking` config** | **Added** | The locked architecture names an invokable Thinking Layer with independent verdicts from different objective functions + fresh-context synthesis + no cross-critique round; no existing script implements this. This is the gap the whole rebuild names as the missing piece. |
| **`fanout-adhoc` entry point** | **Added** | Gives genuinely one-off audit-shaped work (the `capability-gap-map` case) a legitimate path that doesn't require creating a permanent named mechanism, without losing engine features (resilience wrapper, output-size contract, run-log visibility). |
| **`budget_usd` / `override_ceiling_usd` call-time args** | **Added** | Closes the explicit "not yet hard-enforced... open follow-up" gap named in `ceo.md`, while keeping cost strictly advisory per the locked decision. |
| **`.claude/workflows/**` tier-floor entries** | **Added** | Measured gap: this surface currently has no explicit pattern and floors at Lite via the catch-all — for a file that is the binding merge gate, that is a live risk, not a hypothetical one. |

---

## Format & schema

### Config file shape (`configs/<name>.json`)

```
{
  "name": string,                          // must equal filename stem; schema-lint enforced
  "version": "x.y.z",
  "purpose": string,                       // one line; becomes meta.description verbatim
  "invocation": { "requiredArgs": string[], "optionalArgs": string[] },
  "budget": { "ceiling_usd": number, "sweepBudgetFloorUsd"?: number, "onExceed": "log" },
  "frame": null | { "model": "opus"|"sonnet"|"haiku", "schema": <schemaRef>, "maxUnits": number },
  "roles": [
    {
      "key": string,                        // e.g. "correctness", "feasibility", "explore:editorial"
      "kind": "reviewer"|"builder"|"verifier"|"judge"|"explorer"|"critic"|"researcher"|"verdict-generator",
      "lens": string,                       // the focus instruction text
      "critical": boolean,                  // failure here can force a coverage-gap BLOCK (qa only)
      "model": "opus"|"sonnet"|"haiku",
      "agentType"?: string,                 // maps to .claude/agents/<agentType>.md
      "isolation": "worktree"|"none",
      "schema": <schemaRef>,                // ref into the shared schema registry (below), or inline
      "retries": number,                    // default 1
      "maxTurns": number,                   // default 40
      "maxTokens": number,                  // default 200000; >300000 requires "justification"
      "outputMode": "inline"|"file-pointer",
      "chunk"?: { "by": string, "checkpointEvery": number }
    }
  ],
  "fanOut": { "widthSource": "roles.length" | "args.<field>" | "frame.output.length", "parallelism": "all"|"pipeline" },
  "verification": {
    "mode": "adversarial-vote"|"independent-score"|"none",
    "voters"?: number,
    "lensSet"?: string[],
    "model"?: "opus"|"sonnet"|"haiku",
    "scope"?: "all"|"blockEligible",
    "maxPerRole"?: number,
    "decisionFn"?: string                    // name from the closed registry, below
  },
  "sweep": { "enabledWhen": string, "dryLimit": number, "roundCap": number, "budgetFloorUsd": number } | null,
  "judge": {
    "model": "opus"|"sonnet"|"haiku",
    "schema": <schemaRef>,
    "decisionFn"?: string,
    "failSafe": "BLOCK" | "returnRawVerdicts" | "returnRawRanking" | "returnRawClaims"
  },
  "checkpoints"?: string[]
}
```

### Closed `decisionFn` registry (implemented once, in `fanout-engine.mjs`, unit-tested)

| Name | Signature | Behavior |
|---|---|---|
| `quorumMajority` | `(votes) => boolean` | `>=2` votes cast AND strict majority `is_real` — a lone 1-of-1 or a 1-of-2 tie never confirms. Verbatim from today's `isConfirmed`. |
| `blockEligible` | `(severity, tier) => boolean` | P1 always; P2 only at `tier:'irreversible'`. Verbatim from today's `isBlockEligible`. |
| `qaVerdictOverride` | `({confirmed, tier, failedDims, criticalDims, judgeVerdict}) => 'PASS'|'BLOCK'` | Verbatim from today's `decideVerdict`. |
| `capBySeverity` | `(findings, max) => {kept, dropped}` | Verbatim from today's `capBySeverity`. |
| `preserveDissent` | `(verdicts, synthesis) => synthesis'` | New. Asserts `synthesis.dissent[]` names every perspective whose `recommendation` the final `recommendation` field does not match; throws a schema-shaped validation error (caught, logged, `failSafe` applied) if the judge silently dropped a disagreeing perspective. |
| `rankByTotal` | `(scored[]) => scored[]` | Sort descending by `.score.total`. From today's `design.js` inline sort. |

### Shared schema-fragment registry (referenced by `<schemaRef>` above, not redefined per config)

- `FINDINGS_SCHEMA` — `{findings: [{id, severity, file, line, title, detail}]}`, `maxItems: 30` on `findings`.
- `VERDICT_SCHEMA` — `{is_real: boolean, reason: string}`.
- `GATE_SCHEMA` — `{verdict: 'PASS'|'BLOCK', summary: string, blockers: [{id, file, title, fix}]}`.
- `CLAIMS_SCHEMA` — `{claims: [{claim, source_url, date, confidence}]}`, `maxItems: 12`.
- `CHECK_SCHEMA` — `{holds: boolean, reason: string, corrected: string}`.
- `THINKING_VERDICT_SCHEMA` — `{perspective, recommendation, reasoning, confidence, key_risk}`.
- `THINKING_SYNTH_SCHEMA` — `{tensions: [{between: [string,string], nature: string}], recommendation, dissent: [{perspective, position}], confidence}` — `dissent` required, may be `[]`.
- `FILE_POINTER_SCHEMA` — `{path: string, count: integer, summary: string}` — the ONLY legal shape for an `outputMode:'file-pointer'` role.

### `agent()` primitive — the injected global's full option surface

```
agent(promptString, {
  label: string,          // required — run-log key
  phase: string,          // must match an active phase() call
  model: 'opus'|'sonnet'|'haiku',
  agentType?: string,
  isolation?: 'worktree'|'none',       // default 'none'
  schema: object,                       // JSON schema passed to StructuredOutput
  maxTurns?: number,                    // engine default 40
  maxTokens?: number,                   // engine default 200000
  outputMode?: 'inline'|'file-pointer', // default 'inline'
}) → Promise<object | null>             // null on exhausted retries/STALLED — never throws
```
`parallel(fns[])`, `pipeline(items[], generateFn, evaluateFn)`, `phase(title)`, `log(msg)`,
`workflow(name, args)` (call another named workflow — `coding`-shape composition, if ever
re-added, would use this to chain into `qa` exactly as today's `coding.js` already does) — all
unchanged from today's runtime.

### Run-log extension this spec assumes (owned by a different surface — see Open questions/depends_on)

This spec adds one record kind to whatever JSONL run-log format the observability surface ships
(rebuild-plan component 5's per-run schema): a `kind:"role_call"` line per individual `agent()`
call, not just one line per top-level `Workflow()` run, because STALLED detection (§2) needs
role-level granularity a single top-level line cannot provide.

```
{ kind: "role_call", run_id, workflow, role_key, model, tokens, tool_uses, duration_s,
  structured_output_emitted: boolean, status: "ok"|"stalled"|"dropout" }
```

---

## The mechanism that keeps this honest

Every item below is a named hook, CI check, linter rule, or data file — never a sentence.

1. **`schema-lint.js` extended to `.claude/workflows/configs/*.json`.** New checks, all
   CI-blocking (non-zero exit): (a) each config validates against the config JSON-schema above;
   (b) every `roles[].schema` array field declares `maxItems`, or the role is `outputMode:
   'file-pointer'` using exactly `FILE_POINTER_SCHEMA` — an unbounded inline array fails the lint,
   structurally closing failure mode (b); (c) every `decisionFn` name referenced resolves against
   the closed registry in `fanout-engine.mjs` — an unresolvable name fails, exactly like today's
   `mcpServers` cross-check finds 8-of-13 names resolving nowhere; (d) **orphan-config check** —
   every file under `configs/` must be referenced by at least one command `.md`, agent `.md`, or
   another config's `workflow()` call; a config present but referenced nowhere fails lint. This is
   the direct, mechanical answer to sub-question 5.
2. **Drift check (`build.mjs --check`, CI step).** Regenerates every `.claude/workflows/<name>.js`
   from `lib/fanout-engine.mjs` + `configs/<name>.json` into a temp path and diffs it byte-for-byte
   against the committed file. Non-zero diff = CI failure. This is what makes "GENERATED — DO NOT
   EDIT" enforced rather than a comment nobody reads — the exact class of gap that let `qa.js`'s
   duplicated arg-normalizer and the never-imported `gate-logic.mjs` drift apart silently today.
3. **`.claude/qa-tier-floor.yml` gains explicit patterns** (currently absent — measured gap above):
   ```yaml
   - pattern: ".claude/workflows/lib/**"
     tier: irreversible
     reason: "The fan-out engine — every workflow's fan-out/verify/judge/sweep logic lives here"
   - pattern: ".claude/workflows/configs/**"
     tier: irreversible
     reason: "Config data IS the QA gate's rubric and the thinking layer's perspective set — editing
       it is exactly as gate-defeating as editing code"
   - pattern: ".claude/workflows/*.js"
     tier: irreversible
     reason: "Generated runtime files the Workflow tool actually executes"
   ```
   Closes the measured gap where `qa.js` — the binding merge gate for everything else — currently
   requires only Lite-tier review to modify.
4. **Run log v1 + weekly cron** (this spec assumes, does not own, the surface — see depends_on):
   flags (a) any `role_call` with `status:"stalled"`, (b) any config in `configs/` with zero
   `Workflow()` invocations in the 14 days after it first appears in the log — directly
   implementing rebuild-plan Stop condition #7 ("a new named mechanism is added that nothing
   invokes within two weeks"), scoped here specifically to workflow configs, and (c) any run whose
   `override_ceiling_usd` was set, with its logged `reason`. This is the mechanical answer to "what
   stops a new workflow being added that nothing ever invokes": the absence of an invocation is a
   visible, dated line in a report, not something anyone has to remember to check.
5. **Adam-gated keep/cut on the weekly flag.** When the cron flags a zero-invocation config, the
   config is not auto-deleted (no auto-retirement-on-TTL — explicitly excluded by the rebuild
   plan) and it is not silently kept either: Adam makes an explicit keep-or-cut call, recorded as a
   one-line `DECISIONS.md` entry. The record is the artifact; the weekly recurrence of the flag
   until that entry exists is what prevents "noted, acted on by none" — the exact fate that befell
   `DECISIONS.md`'s own 50-entry cap for three consecutive sessions.

---

## Open questions

- **True cross-family model routing is not built.** `thinking`'s `crossFamilySlots` field wants to
  route ≥1 verdict-generator to a genuinely different model family on irreversible decisions, per
  the locked "heterogeneity of objective AND model family is the active ingredient" principle. The
  `agent()` primitive's `model` param today only accepts `opus`/`sonnet`/`haiku` — all Claude-family
  tiers. Beamix's product stack already integrates OpenAI/Gemini/Perplexity directly, but there is
  no evidence the Workflow runtime's `agent()` can target a non-Anthropic model as a role. Until
  that's built, `crossFamilySlots` degrades to routing one slot to `opus` instead of `sonnet` —
  real heterogeneity of depth, not of vendor. This is a dependency on a runtime capability outside
  this surface's control, not a design gap in the config schema itself.
- **Scratch-file retention for `outputMode:'file-pointer'` payloads is undefined.** `.claude/
  workflows/.scratch/<run_id>/<role_key>.json` needs a cleanup policy or it becomes its own
  unbounded-growth problem — directly analogous to the measured "7 worktrees under
  `.claude/worktrees/`, no cleanup mechanism observed" finding from the same session. Not resolved
  here; flagged for whichever surface owns worktree/scratch lifecycle.
- **Whether `thinking`'s default perspective-set table is the right cut.** Four `decisionType`
  buckets (infra/product/process/default) were chosen by inspection of this system's own decision
  history, not stress-tested against a real board-style decision under the target design. The
  first several real `thinking` invocations should be treated as calibration, not as proof the
  table is right.
- **Whether the `fanout-adhoc` path is a lint blind spot in practice.** Nothing stops repeated use
  of an inline `args.config` as a way to indefinitely dodge the orphan-config check instead of
  graduating a genuinely-repeated shape into a checked-in `configs/*.json` file. The run log makes
  repeated identical-shaped ad-hoc calls visible (same `config.name`/`purpose` recurring), but
  nothing in this spec makes that pattern act on itself — it would need the same weekly-cron
  treatment as zero-invocation configs, just inverted (high-frequency-but-never-named), and that is
  not designed here.
- **Whether `configs/*.json` (data) truly deserves the same `irreversible` floor as `lib/
  fanout-engine.mjs` (code).** This spec recommends uniform `irreversible` because, for `qa`
  specifically, a config edit (e.g., quietly dropping the `security` dimension) is exactly as
  gate-defeating as a code edit — but this was not weighed against the friction cost of every
  future perspective-set tweak in `thinking.json` drawing the full irreversible-tier pipeline. The
  rebuild plan's own open question ("nobody examined what friction actually costs") applies here
  unresolved.
