# Agent Orchestration Harness — a build specification

**Audience:** a team of agents building this harness in a project that is *not* the one it was designed in.
**Status:** draft 2, 2026-08-11. Section 9 written from a comparative study of 24 external systems read on disk.
Not yet challenged — a panel review is the next step, and section 12 is where to aim it.
**Companion:** this document explains and specifies. It does not schedule. The origin project's own build
order lives separately and is not portable.

---

## 0 · How to read this

You are not being handed a finished system to install. You are being handed a **design, its reasoning, and its
evidence**, so that you can build it in your project and know which parts to change.

Three kinds of statement appear, and they are marked:

- **PRINCIPLE** — why the design is shaped this way. Change these only deliberately.
- **SPEC** — build this. Where a spec has a choice inside it, the choice is named.
- **EVIDENCE** — how we know. Every number here was produced in *the origin project*, a working repo where
  this harness was designed and partially built. Origin-project numbers are evidence about a real system, not
  requirements for yours. Where a number is load-bearing, its verification method is stated.

Two more markers matter more than any other convention here:

- **UNIVERSAL** — the same in every project. Build it once, propagate it.
- **LOCAL** — bound per project. The harness must not assume your stack, your rails, or your risk tolerance.

Getting the universal/local split wrong is the most expensive mistake available, because a universal file that
encodes one project's stakes will silently break every other project it reaches. Section 8 is about nothing else.

**A note on the word "agent."** Throughout, an agent is a model instance with its own context window, a system
prompt, and a tool set. Nothing here depends on a particular vendor, framework, or SDK. It depends on three
things being true of your runtime: you can spawn sub-agents, you can run a script before or after a tool call,
and you can run a check on a diff before it merges. If your runtime lacks the middle one, section 5 needs
rethinking before you start.

---

## 1 · What the harness is

A request arrives. It flows through four layers and leaves a trace.

```
request
  │
  ├─→ THINKING LAYER  reads the task, chooses its own depth, and produces:
  │                   a plan · a capability envelope · acceptance criteria
  │
  ├─→ ORCHESTRATOR    owns the decision, may override the plan, dispatches
  │
  ├─→ WORKER          receives a goal, criteria, and an envelope.
  │                   Method is entirely its own.
  │
  ├─→ GATE            verifies the result against those acceptance criteria
  │
  └─→ RUN LOG         records the run, including every reach past the envelope
                      └─→ a reader consumes the log and acts or escalates
```

Three terms, defined once:

- **Capability envelope** — a machine-readable list of the skills, tools, MCP servers, and paths a task is
  expected to need. It is *advisory*. Its job is not containment; its job is to make the difference between
  what a task was given and what it actually reached for into recorded data.
- **Acceptance criteria** — per-task, written at dispatch, checked at the gate. Each is either
  `verified_by: command` (a deterministic check) or `verified_by: judge` (a model reads and decides). The two
  halves carry different consequences on failure.
- **Run log** — one append-only JSONL line per run. Flat file. `jq` is the entire user interface. No dashboard.

The shape is deliberately unremarkable. **The design content of this harness is not its topology — it is the
insistence that every rule in it is compiled into something that executes.** That is section 5, and it is the
only part you should refuse to compromise on.

---

## 2 · The problem it solves

> **PRINCIPLE.** The failure mode of a mature agent system is not bad architecture. It is that the system
> accumulates *stated* rules far faster than *enforced* ones, and nothing in it notices the gap.

Agent systems are written in prose, and prose is cheap. A rule costs one sentence to add and nothing to
maintain, so rules accumulate: in the project config, in each agent's definition, in skill files, in memory
documents, in commit messages. Each is true at the moment of writing. None of them is connected to anything
that would fail if it stopped being true.

The result is a system whose documentation describes a machine that does not exist. Not through carelessness —
through the absence of a resolver.

**EVIDENCE, origin project.** Every figure below was confirmed by reading the implementing file:

| Measurement | Value |
|---|---|
| Rules stated across config, agent definitions, and memory | 63 |
| Rules actually enforced by a hook, CI job, or data file | **9** |
| Unenforced but mechanizable (a check could exist and does not) | 40 |
| Inherently judgment — should stop being written as rules at all | 14 |
| Mechanisms described in the decision record that **do not exist in code** | 6 |

Fourteen percent enforcement. And the six fabricated mechanisms are the sharper number: these were not
aspirations, they were entries in the file that records what the team decided, describing enforcement that had
never been built. One claimed a particular hook hard-blocked merges; that hook returns success on every path,
and the class of hook it belongs to cannot intercept the operation in question even in principle.

The same pattern appeared at every layer once it was looked for. A capability field declared in 23 agent
definitions, configured in zero. Agent definitions instructing themselves to call tools they had not been
granted — so the documented fallback for "tool unavailable" appeared in none of 142 session records, because
that code path was never reached. A merge gate whose PASS decision was a `grep` for a hand-typed string in a
markdown file, with the actual review script never invoked by anything.

**Two findings generalize beyond the origin project, and you should expect both.**

*First: this is not a discipline problem — and how we learned that is itself the lesson.*

An externally built harness, by a different team, with a much larger hook library, hit this exact bug: a hook
file was built, copied, and installed, but never registered as an event handler. It shipped and did nothing.
Their fix was not better habits. It was **a required test that fails the build if any shipped hook lacks a
registration call**, plus a second test for the inverse — registrations pointing at files that no longer exist.
Both test files exist *because the bug happened*, and both name the issue number in their header comments.

That is the strongest external evidence available for the resolver argument, and it is evidence twice over:
an experienced team hit the disease, and the thing that cured it was a check, not a convention.

> **RETRACTION, and read the direction of the error.** An earlier draft of this document made a stronger claim:
> that five of that system's hooks were shipped, documented, and registered *nowhere at all*. **That claim was
> wrong and is withdrawn.** It came from scanning one of two registration mechanisms — the system ships both a
> plugin manifest and a classic installer, and a hook registered only by the second looks unregistered to a scan
> of the first. Verified directly: its workflow guard appears **zero** times in the plugin manifest, **six**
> times in the installer's registration module, and does hard-block (`decision: 'block'`, `process.exit(2)`).
> Every one of its 26 hook files resolves to a registration somewhere.
>
> The disease was real and occurred once. It was not endemic. **And note which way this error pointed: unlike
> the eight catalogued in section 11, which all overstated a gap, this one overstated the external evidence for
> our own thesis.** An error that flatters the argument it supports is the more dangerous class, because nothing
> about it feels wrong while you are writing it.

*Second: the gap is invisible from inside the documents.* Every audit that read the prose concluded the system
was in good shape. The gap only appeared when someone executed the implementing files.

### The twenty-minute diagnostic

Before you build anything, measure your own project. This is the cheapest work in this document and it will
tell you whether you have this problem at all.

1. Grep your agent system for imperative statements — "always", "never", "must", "before any". Count them.
2. For each, ask: *what would fail if this stopped being true tomorrow?* If the answer names a file that runs,
   it is enforced. If the answer is "someone would notice," it is not.
3. Take your decision or architecture record. For every claim that something is implemented, check that the
   named file exists and does what the claim says.

Ratio and fabrication count in hand, you know the size of your problem. **SPEC: record both numbers before you
start, because they are the only before/after measurement this harness offers.**

---

## 3 · The principle

> **PRINCIPLE. Constrain outcomes, not methods.**

Freedom on the path; precision at the destination; verification of claims rather than gating of writes. Where a
gate exists, it exists because being wrong *there* is unrecoverable — not because the path needed supervising.

This came from the origin project's owner, and it is worth quoting because the phrasing carries the intent:

> *"we want to give the worker and the other agents some freedom to explore new ways to handle things, solve
> them, get different context and more — they get a task and they need to do it in a high quality. so we need
> to give them space to work."*

Four consequences follow, and each one contradicts a reflex you will have:

1. **A worker gets a goal and a quality bar, never a procedure.** If you find yourself writing step-by-step
   method into an agent definition, you are specifying a program badly. Write the definition of done instead.
2. **Observation beats prevention wherever the failure is recoverable.** The envelope logs rather than blocks
   precisely because a blocked reach is a reach you never see — and reaches are the highest-signal data the
   system can collect about whether its own task composition is any good.
3. **Where a gate is genuinely required, it is deterministic and file-path-driven**, not a judgment call made
   fresh each time. Judgment is reserved for what cannot be computed.
4. **Every constraint costs something, and the cost must be named.** This design has two costs it has never
   priced, recorded honestly in section 12.

---

## 4 · The layers

### 4.1 Orchestrator

Always the entry point. Holds the lists — every agent, skill, and MCP description — and composes what each task
gets. Dispatches, tracks, starts the gate, owns the quality bar. **Never implements.**

The list-holding is a real cost, roughly 10k tokens of standing context in the origin project, and it is
accepted deliberately: composition is a *decision*, and decisions belong to the layer that can see everything.
The worker then retrieves *within* what it was given.

**Anti-pattern, learned expensively:** do not let the orchestrator become an org chart. See 4.5.

### 4.2 Thinking layer

**Always invoked. Never skipped.** It reads the task *first*, then chooses its own depth: a fast
single-perspective pass for a one-line fix, a wide multi-perspective fan-out for genuine ambiguity. It produces
the plan, the envelope, and the acceptance criteria.

Two design details carry most of the value:

**It right-sizes itself, and logs the choice.** The judgment sits with the only party that has actually read the
task, rather than with an orchestrator guessing before anyone looked. Logging the choice is what makes
under-thinking and over-thinking measurable later.

**The workflow is the control structure; the perspectives are real agents carrying real domain procedure.**
This is the hybrid, and it matters. Scaffolding — "read the ticket, produce a plan, return JSON" — should be
generated, because in the origin project 63 lines of it were duplicated by hand across five agent definitions.
But genuine encoded expertise is not scaffolding. "Pull live numbers, validate against real pricing, run a
sensitivity analysis, flag reversibility" is a domain procedure a generic agent will not reconstruct. Generate
the first; keep the second.

**SPEC — the panel shape, and it is not the obvious one:**

```
framing → N independent verdicts from genuinely different objective functions → fresh-context synthesis
```

with **no cross-critique round** for generative decisions. The synthesizer sees the verdicts and none of the
discussion. On irreversible decisions, route at least one verdict to a *different model family*.

**Why no cross-critique.** Heterogeneous panels win for *evaluation*. For *generation*, homogeneous debate is
weak-to-negative: accuracy degrades across rounds through sycophancy, and agents converge on consensus rather
than on truth. The active ingredient is heterogeneity of objective and of model family — not headcount, and not
argument rounds. A panel of five agents from one model family, differing only in prompt framing, is one
perspective wearing five hats.

That distinction has teeth. In the origin project a gate advertised "three independent adversarial verifiers";
all three calls passed the same model identifier. Cross-family coverage was zero, not "degraded."

### 4.3 Workers

Receive a goal, acceptance criteria, and an envelope. Method is theirs. Work in isolation — a separate
worktree, branch, or sandbox — and return structured output.

**SPEC — the roster rule, which will save you from a common waste:**

> **Collapse two agents if only their *skills* differ. Keep them separate if their *procedure* differs.**

Measured in the origin project: the backend and frontend engineer definitions had identical procedures
differing by one declared skill — two files, one agent. But "write the rollback plan before the forward
migration" and "every LLM feature ships with an eval" are not procedures, they are **definitions of done and
safety invariants**, and those justify a separate agent. Step-by-step method never does.

### 4.4 Validators, out of band

Reviewers are spawned *after* work, read-only, and never edit what they judge. They are not teammates and do
not participate in the work. An agent that can edit what it reviews will review what it can edit.

### 4.5 The layer that is not here: the org chart

**EVIDENCE, and this is the most transferable lesson in the section.** The origin project ran a five-tier
topology classification: every task was classified before dispatch into one of five orchestration shapes. It
was documented at length, it was locked by decision, and it was referenced throughout the system.

Its measured result: tier 4 never fired once. Tier 3 fired once in two and a half months. Tier 5 fired a
fifteen-to-twenty-agent fan-out purely because a risk tier said "full," so a one-line policy fix and an
ambiguous multi-domain feature drew identical machinery. The classification predicted nothing, gated nothing,
and was never recorded — so it could not even be evaluated without archaeology.

It is being **deleted, not refined.**

The reflex when an org-chart rule fails is to write a better org-chart rule. Resist it. A convention holds only
where an agent chooses to honour it; the moment work nests one level deeper than you imagined, the convention
is simply absent. **A hook fires identically at every spawn depth.** That is the entire argument for section 5,
and it is why the depth-invariant enforcement point is a hook and not a rule about who may spawn whom.

Related, and worth checking in your own runtime rather than inheriting: the origin project's entire
"chiefs may not spawn workers" apparatus existed because nested sub-agent spawning was blocked. That block was
tested once, seventy-two runtime versions earlier. It is false today. **A capability constraint you have not
re-tested this quarter is a rumour.**

---

## 5 · The mechanism rule — the spine

> **PRINCIPLE. A rule enforced by prose is not a rule.**

**SPEC.** Every rule in the harness must name exactly one of four enforcement mechanisms. A component that
cannot name one is disqualified by construction — it does not get built, and it does not get written down as
though it were real.

| Mechanism | What it is | Use it when |
|---|---|---|
| **Hook** | A script the runtime executes before or after a tool call, whose exit status can block | The rule must hold at every spawn depth, in real time |
| **CI job** | A check on a diff, required before merge | The rule is about what enters the repository |
| **Resolver** | A check that a *claim* corresponds to reality | The rule is about the truthfulness of a record |
| **Data file** | A declarative file that code reads, rather than logic embedded in prose | The rule is a classification or a list that several consumers must agree on |

Four rules for using them:

**One classifier, many consumers.** Blast radius — how bad is it if this change is wrong — belongs in exactly
one data file, read by the merge gate *and* the self-modification gate *and* the escalation trigger. If two
places compute risk, they will disagree, and you will find out during the incident.

**A resolver is the one mechanism most systems lack, and it is the one that killed the fabrications.** It does
not block writes. It asks: this record claims X is implemented and names a file — does that file exist and do
that? In the origin project one such check would have caught all six fabricated mechanisms without blocking a
single write.

**Prefer the deterministic mechanism, always.** A model can be asked whether a change is risky. A file-path map
*computes* it, at zero cost, identically every time, and can be reviewed as data. Reserve judgment for what has
no deterministic form.

**Beware the mechanism you cannot see the edge of.** Two failures in the origin project's own classifier are
instructive, because both were in the *implementation*, not the data. Its resolver matched patterns by
substring rather than parsing the file, so any comment containing the word `pattern:` was read as a live rule —
a comment could corrupt the classifier that gates every merge. Separately, a catch-all rule at the bottom
combined with highest-tier-wins semantics made one of its four tiers **structurally unreachable**; the labels
for that tier described a state the system could never compute. Neither was found by reading. Both were found
by running the resolver against a list of paths and comparing the output to intent.

**SPEC: whatever your classifier is, test it by execution against a path list, not by reading it.**

### The recursion, stated rather than hidden

This rule — the one that disqualifies mechanism-less components — **has no resolver of its own.** Checking it
means a human reading prose, which is precisely the failure mode it exists to prevent.

The fix is small and you should build it on day one: make the mechanism a **required labelled field** in your
component records, so a linter can check that every component has one. In the origin project all ten components
did name a mechanism, but only six carried it as a labelled field — the other four named theirs in body prose,
and a grep therefore reported 6 of 10. The gap between that number and the truth was formatting, not design,
and it was found by applying the method rule to a claim in a commit message.

---

## 6 · The components

Ten. Each names its mechanism. Sizes are the origin project's estimates: S is hours, M is a day, L is longer.

| # | Component | Mechanism | Size |
|---|---|---|---|
| 1 | **Blast-radius classifier** with an advisory lane and a provenance axis | Data file, read by CI and by the pre-tool hook | M |
| 2 | **One depth-invariant enforcement point** — a single pre-tool hook | Non-zero exit blocks | S |
| 3 | **A gate whose verdict cannot be forged**, on a check that is actually required | Signed verdict artifact bound to the commit SHA + enabled branch protection + CI that executes code | M |
| 4 | **A schema linter wired to CI**, extended to capability declarations | The lint *is* the compilation step: a declared capability that does not resolve fails the build | S |
| 5 | **Run log + a scheduled reader** | Append-only JSONL written by a stop hook; a reader agent consumes it | M |
| 6 | **Thinking layer** — independent verdicts, fresh-context synthesis, no cross-critique | One parametrized fan-out engine configured by a data file | M |
| 7 | **Fix the gate's own overclaims**, and check its mirrored logic for drift | Rename or make true; a mechanical drift check | S |
| 8 | **Depth in shadow mode**; delete the topology classifier | Static trigger list in the same data file; the choice is logged and gates nothing at first | S |
| 9 | **Canonical repo + a sync tool that re-classifies against the receiver** | Per-file hash manifest; refuse on failure | L |
| 10 | **Context injection** — one advisory hook, one data file | Emits context only; never blocks | S |

### The three that carry the most weight

**Component 3 — the gate.** If you build one thing, build this. Until it exists, every other component's work
can merge unreviewed, *including the harness's own*. Three parts land together or none matters: the verdict must
be an artifact bound to the commit rather than a string someone can type; the check must be *required*; and CI
must actually **execute code** against the diff. In the origin project, no CI job ran a compiler, a linter, a
test, or a build. A forgery-proof verdict on a gate that compiles nothing is theatre with better paperwork.

**Component 5 — the run log, and the reader that ships with it.** A write-only log is a document nobody reads,
which is the disease at one level up. **SPEC: the reader is not optional and does not ship later.** It is an
agent that consumes the log and *acts or escalates*, and it stamps the log when it runs, so a far more frequent
path — session start, or CI — can warn loudly when that stamp goes stale.

Two mechanisms from an external source belong in this component, and they are prior art rather than invention.
Both come from a production Python agent framework whose source was read directly:

- **Typed, loud failure.** On retry exhaustion it *raises*. It never returns nothing and never silently drops a
  result. This reframes a real incident: when twelve agents returned nothing, the diagnosis was "the payload was
  too big." A framework that cannot return nothing says something between the failure and the caller was
  **swallowing the signal** — a different defect. Detect the symptom *and* remove the cause.
- **A pre-flight cost ceiling.** Limits are checked *before the next model call is dispatched*, not reported
  afterwards. Two origin-project runs burned 540k and 1.58M tokens and returned nothing; both were invisible in
  real time and reconstructed by archaeology. A ceiling checked at the request boundary stops them.

One trap in the same library, worth naming because the two mechanisms read as interchangeable in summary and
are not: the retry mechanism **re-runs generation from scratch**. Applied to an oversized-output failure it
repeats the same all-or-nothing attempt and exhausts the budget *faster*. The correct mechanism for size is
streaming validation of partial results. Porting the wrong one would have made the incident worse.

**Component 9 — propagation.** Last, and non-negotiable. The entire economic case for a harness is that it
serves many projects. Until sync works end-to-end on a project other than the one you built it in, every hour
spent pays back in exactly one repo. Treat "it has never been run against another project" as a stop condition,
not a detail.

---

## 7 · Build order, and the reasoning

Each step exists because it unblocks the next. The reasoning is portable even though the step numbers are not.

1. **Close your lapsed commitments first.** Find every stop condition, review date, and expiring flag in your
   system and record a verdict. This is not throat-clearing: it is the proof case for why every stop condition
   below must be a checked artifact. In the origin project a set of "vindication triggers" carried an explicit
   expiry; the date passed eight weeks earlier with no verdict recorded and nothing noticed.
2. **Wire your schema linter to CI as-is, and fix whatever fails.** Cheapest item, gates everything downstream,
   because every later component declares capabilities that need a resolver to be real. In the origin project
   this linter already existed, was named in the project config as *the* review gate for the lowest tier, was a
   correct 361-line validator — and was registered in zero hooks and zero workflows. **Check for this before
   building anything. The most valuable mechanism in your repo may already be written and simply not wired.**
3. **Extend the linter to capability declarations.** Must follow 2 to matter, and must precede any rewrite of
   agent definitions, since that rewrite touches exactly these fields.
4. **Build the classifier data file.** Components 2, 3 and 8 all read it.
5. **Run your sync tool in check-only mode across every project that carries the system.** Read-only, zero
   write risk, and it produces the cross-project inventory that later decisions require and cannot otherwise
   obtain.
6. **Extend the pre-tool hook.** Needs the classifier. This is the moment deeper spawning becomes safe *without*
   org-chart rules, which is what unblocks deleting them.
7. **Fix the gate.** All parts together.
8. **Delete the dead surface** — after the hook exists, because the hook is what replaces the convention being
   deleted.
9. **Ship the run log and its reader.** After the deletion, so it measures the system you are keeping. Before
   any self-improvement work, because there is nothing to improve from until it has data.
10. **Collapse your fan-out scripts into one engine** with per-kind configuration as data.
11. **Canonical repo and sync**, verified on two projects that are not the one you built it in.
12. **Trim agent definitions last.** Deliberately last: it is the only cut nobody can prove is quality-neutral,
    so it goes after the run log exists to detect a quality drop.

**The single most transferable sequencing lesson:** the gate is the one item to pull forward regardless of
order. Until it lands, anything can merge — including the harness's own work. In the origin project, three
changes at the highest risk tier were merged by a human typing a PASS string into a markdown file. That is not a
process failure; it is what the gate *was*.

---

## 8 · Universal versus project-owned

> **PRINCIPLE. Split by who holds the knowledge, not by who wrote the file.**

A fact that is true everywhere is universal. A fact that encodes one project's stakes is local. Applied
consistently, the split is unambiguous:

| Knowledge | Split | Why |
|---|---|---|
| A new model generation shipped | **UNIVERSAL** | True everywhere the moment it is true anywhere |
| Which model a given role should use here | **LOCAL** | A project's stakes and budget |
| The mechanism rule, layer contract, panel shape | **UNIVERSAL** | The design itself |
| Blast-radius map contents | **LOCAL**, universal *schema* | `billing/**` matters here and is meaningless elsewhere |
| Where work arrives from | **LOCAL** binding, **UNIVERSAL** contract | Every task has an id, goal, criteria, record; the rail differs |
| The skill corpus | **UNIVERSAL** | See the cut test below |
| Memory, credentials, brand | **LOCAL** | Never propagate |

### The cut test, which is not the obvious one

**SPEC: cut a skill only if it is useless in *every* project — never because it is unused *here*.**

A payments-integration skill is wrong for a project with no payments and exactly right for a sibling. A cut
scoped to one project silently breaks the others. **EVIDENCE:** the origin project's earlier cut list used
"wrong stack for this repo" and had to be discarded and re-run.

The corpus is cheap to carry — roughly 7,400 tokens in the origin project — and composition already filters per
task. Carrying a skill you do not use costs almost nothing. Deleting one a sibling needs costs a silent failure
in a repo nobody is looking at.

### Two mechanisms propagation cannot work without

**Fit-precedence.** Project-owned files are never overwritten by an update. Without this, the first sync
destroys every local customization, and you will not do a second. This is not hypothetical: in the origin
project's fleet, one sibling had *more* hooks than the project the system was designed in. A sibling being ahead
is the normal case, not the exception.

**Per-file integrity.** A manifest carrying a hash of every installed file, so the tool can distinguish
*unchanged* from *locally modified* from *drifted*. Without it, an update cannot tell what it is about to
destroy. This is one of several mechanisms worth copying rather than inventing — section 9.

**SPEC: on apply, re-run the linter and the classification against the *receiving* project, and refuse on
failure.** A file that is valid in the canonical repo can be invalid in the receiver. This is the one mechanism
the origin project's otherwise-mature sync tool did not have.

---

## 9 · What twenty-four other systems actually do

Thirteen harness systems and eleven skill corpora, cloned locally and read — not summarized from their READMEs.
Each harness was asked the same seven questions so the answers compare: orchestration, enforcement, capability
declaration, memory, propagation, observability, and what to steal or refuse. Every claim below carries a
VERIFIED (implementing file opened) or ESTIMATED (pattern-matched) mark in the underlying study files.

**Read this section for the negative results as much as the positive ones.** Several mechanisms this design
intended to copy turned out not to work where they came from.

### 9.1 · The finding that matters most: enforcement is claimed far more often than it is built

This is not a Beamix pathology, and it is not a discipline problem. It is the normal state of shipped agent
systems. **Five independent systems, built by five different teams, ship something that reads as a gate and
enforces nothing:**

| System | What it looks like | What it is |
|---|---|---|
| A popular skills plugin | "Mandatory skill invocation." Injected at session start wrapped in `<EXTREMELY_IMPORTANT>` tags: *"YOU DO NOT HAVE A CHOICE... This is not negotiable. You cannot rationalize your way out of this."* | A one-time context injection. No block, no prompt rewrite, no gate. If the model ignores it, nothing happens |
| A spec-driven dev toolkit | An `extensions.yml` **hook** system, referenced by every command template | The hook executor contains **zero** `subprocess`/`Popen`/`os.system` calls. It renders text telling the model which command to run next. A hook system by name; prompt injection by mechanism |
| A multiplayer agent harness | A skill capability grammar (`requiredCapabilities: [egress:<host>]`) with a publish gate that refuses to promote a skill whose required capabilities are not granted | **Every** call site passes the skill's own declaration back in as the grant — self-signing. A schema-typed no-op that can never fail. The granted set is then never read again except to echo it in an admin UI |
| A methodology framework | A skill validator emitting CRITICAL / HIGH / MEDIUM severity findings | CI lint on committed files only. The severity vocabulary implies runtime consequences that do not exist |
| A capability-security platform | An approval queue every side-effecting call must pass through, with its own docs saying *"It's critically important that you add ApprovalQueue to all API operations that interact with the outside world, otherwise the gatekeeper security model is broken"* | Enforced by code review. Nothing structurally stops a new adapter from shipping a method that reaches the outside world without ever calling the queue |

Note the last one especially: a team that built genuine object-capability security, whose *type system* makes
certain methods impossible to omit, still has a load-bearing rule enforced by "reviewers read every line."
**The gap survives even where the surrounding engineering is excellent.**

**The counter-example is the one to imitate.** One toolkit's workflow engine *rejects* a `permissions:` key on
shell steps at validation time, with this reasoning in its own source: a shell step always runs with the user's
privileges, so declaring permissions *"reads like a runtime capability gate, but no such gate exists... Remove
it and gate sensitive steps with a `gate` step instead."*

> **SPEC. Refuse syntax that implies a boundary you have not built.** Rejecting the misleading field is better
> than accepting and ignoring it, because a declaration nobody enforces does not degrade to zero — it degrades
> to *false confidence*, which is worse than nothing. Shipping a "granted capabilities" field that is always
> auto-populated with the requested value is worse than shipping no capability system at all.

### 9.2 · What actually blocks, and where

Across thirteen harnesses, real enforcement is rare, narrow, and **almost never at the agent's tool call.**

| Boundary | Systems that gate there | Note |
|---|---|---|
| **Tool call** (the boundary this design uses) | 3 of 13 | Two hook guards in one system; one SDK's `beforeToolCall` block; one `Stop`-hook block conditioned on a single trigger word |
| **Network egress** | 2 | One standalone signed-token proxy with SSRF-safe DNS-then-IP checks; one runtime primitive that hard-disables outbound fetch for a sandboxed worker |
| **Commit** | 1 | An auto-installed pre-commit hook blocking lint, typecheck, format, and unreviewed lockfile changes |
| **Deploy** | 1 | ~20 explicit `throw`s on malformed configuration before anything ships |
| **Merge / CI** | 3 | Standard required checks |
| **Nothing at all** | 4 | Prose conventions only |

Two systems with the largest hook libraries in the set have, between them, **10 hook files that can block out of
39** — and in one of them the single block-capable hook is opt-in and off by default. **29-30 of those 39 files
contain no code path that can block anything.** They inject context, refresh caches, render a status line, or
announce updates.

That advisory majority is the class this design was missing, and it is why component 10 exists. **The strongest
version of the argument is not "add more gates" — it is that mature systems converge on shaping what an agent
knows rather than restricting what it may do.**

**Two hard-won details worth copying:**

- **A blocking hook that can re-trigger itself needs cycle detection.** The one genuinely well-built `Stop`-hook
  block in the set inspects the *second-to-last* event, not just whether its block condition is met, so it
  cannot loop forever. It ships with a unit test.
- **The same file name can carry opposite semantics across two forks of one system.** One system's workflow
  guard hard-blocks; its sibling's identically-named file says in its header *"This is a SOFT guard — it
  advises, not blocks. The edit still proceeds."* **SPEC: state each hook's enforcement posture in its own first
  five lines.** Free to do, and it is the only thing that lets a reader know a hook's blast radius without
  tracing its registration.

### 9.3 · Capability declaration — the inversion

**The field that is mechanically enforced is the one almost nobody fills in. The fields people fill in are not
enforced.**

The host runtime enforces a `tools:` frontmatter field on sub-agents — a real, non-bypassable restriction that
requires no work to adopt. Measured adoption:

| Corpus / system | `allowed-tools` or `tools:` adoption |
|---|---|
| The largest corpus studied | 81 of 331 skills (~24%), heavily concentrated in one skill family |
| Three other large corpora | 3 of 67 · 3 of 90 · 1 of 104 |
| **The reference corpus published by the runtime vendor** | **0 of 18** |
| A 23-agent harness | **1 of 23** — including a `security-auditor` whose stated job is read-only review, running with full inherited write access |

Everything else declared is decorative:

- Two harnesses have **no capability concept at all** — zero matches for any such field.
- One explicitly documents having no permission system by design, pushing containment to the operator via
  external sandboxes.
- The richest grammar found anywhere scopes *specific paths and specific scripts* — `file_read`, `file_write`,
  `shell.allowed_scripts` — and appears in roughly three files out of 331.
- **No corpus in 803 skill files declares network egress.** One harness does, and it is the self-signing case
  from 9.1.

**The one system that gets this right is worth studying in detail.** An SDK sandboxes extensions behind a bridge
object: a permissions object is baked into the worker's construction properties, every bridged method begins
with a `#require...()` check that **throws** if the manifest did not declare that permission, and — independently
— the runtime disables outbound network entirely for that worker unless the manifest lists hosts. **Two
independent enforcement layers for one grant: a per-capability gate function, plus a coarser hard sandbox as
backup.** That shape ports even where the infrastructure does not.

> **What this means for the envelope in this design.** Nothing in 24 systems implements a per-task capability
> envelope that is both checked against actual behaviour *and* on by default. The closest live enforcement is a
> scope-wide admin allowlist that never consults any skill's declaration. **Building the enforcement half is
> genuinely open work, not a re-implementation of prior art** — which is also a warning about how hard it is.

### 9.4 · Propagation — four postures, ranked

This is the question with the clearest winner and the most consequential correction to this design.

| Posture | System | Verdict |
|---|---|---|
| **Per-file backup with integrity and rollback** | A CLI's extension updater: SHA256-keyed backup directories, symlink-vs-regular-file handling preserved, **refuses** to update a hard-linked file rather than silently corrupting whatever else points at it, atomic "do not rewrite an untouched installation on validation failure," and a rollback path that fails loudly when a backup is missing | **Best found. Fully portable** — plain filesystem operations, no cloud dependency |
| **Structural boundary** | A deployment template pulls the platform in as a git submodule and keeps every customizable file *outside* that boundary. Its own docs: prefer wrapper-owned components "rather than a generated overlay" | Strong. Protection by construction rather than by checksum — an update cannot clobber what it never writes to |
| **Detect-then-clobber** | A per-file SHA256 manifest regenerated every install, classifying each file as unchanged / user-modified / user-added before overwriting | **Weaker than advertised, and this design intended to copy it** — see below |
| **All-or-nothing** | A single `y/N` prompt covering an entire folder | One customized file and fifty get the same warning and the same fate. Worse than doing nothing at file granularity |

**The correction.** The per-file hash manifest this design named as the integrity mechanism to adopt does
**detect** a user-edited file before overwriting — but it does not preserve it. The newly shipped version wins
at the original path; the user's edit survives only as a sibling `.bak` for manual reconciliation. Net-new user
files *are* fully restored. And there is a silent failure mode: if the previous manifest predates the hash
column, modification detection is skipped entirely rather than failing safe.

> **SPEC, revised by this study: the hash manifest is a conflict *detector*, not fit-precedence.** Adopt it for
> detection, and get the actual protection from the structural boundary — **never write generated content into a
> directory a project customizes.** Detection tells you a conflict happened; structure prevents it. A system
> that needs both has them at different layers.

One further data point: a harness whose contributor docs require all non-customization files to remain
"byte-identical to upstream" has **no automated check of that claim** — no CI step, no hash diff. The rule that
protects propagation integrity is itself enforced by prose.

### 9.5 · Observability — two of thirteen have a read path

Almost every system writes and almost none reads.

- One ships thirteen named publish channels with a documented "zero overhead when nobody subscribes," and no
  default subscriber in the repo.
- One POSTs batched events to the vendor's own analytics endpoint; a grep for any local reader returns zero.
- One's session log states its write-only invariant in its own documentation: *"the caller never re-reads the
  file mid-session."*
- One ships a well-modelled span/event contract with, by explicit design, no exporter.

**The two that close the loop:** an admin metrics surface with latency percentiles, an egress-audit tail, and an
audit-log tail; and a workflow engine whose per-run state log is genuinely read back to resume an interrupted
run and to answer CLI status queries.

> This is the strongest available support for a rule already in this document: **the reader ships with the log,
> never after it.** Eleven of thirteen systems demonstrate what "later" turns into.

### 9.6 · Resolvers that check a claim against reality — also two of thirteen

The mechanism this design treats as central is nearly absent in the wild. Two real examples:

- **Evidence with an expiry date.** Stored decisions and evidence carry a `valid_until` field; a dedicated
  routine finds expired items and forces one of three explicit outcomes — **Refresh** (re-run and get new
  evidence), **Deprecate** (the decision is obsolete), or **Waive** (accept the risk, with a recorded new
  deadline). Its rationale: *"A benchmark from 6 months ago may no longer reflect current system performance.
  When evidence expires, the decision it supports becomes questionable."* **This is directly applicable to any
  append-only decision record** — including this design's, which today has an entry cap nobody enforces and no
  staleness concept at all.
- **A typed disposition for unverifiable claims**, plus an auditor agent whose job is to check that a state
  file's claims (phase complete, tests passing) match the actual repository. Its documentation is explicit that
  the cheapest model tier *"degrades toward confident false-pass"* on this task and mandates re-validation when
  the tier changes — a rare, honest statement that a judged check's reliability is a function of model choice.

Everywhere else: none found.

### 9.7 · Orchestration — and the strongest external challenge to this design

**One system deleted its agent roster twice, on the record, and said why both times.**

- First removal: a roles-and-verifiers system was retired because it *"added no real benefit over simply using
  available tooling (like Claude Code's own subagent generator) for spinning up your subagents."*
- Second removal, four months later, took orchestration and implementation with it: *"AI coding tools have
  evolved significantly... plan mode, extended thinking, and improved models now handle much of the scaffolding
  that earlier versions provided... Implementation/orchestration phases retired — frontier models handle this
  well on their own now."*

Its current main branch is 22 files with zero agent definitions of any kind, verified by direct listing. The
project refocused on standards injection and defers everything else to the host tool.

**Take this seriously.** It is a team with a shipped product concluding twice that their own orchestration layer
stopped earning its keep against improving native capability. It is one vendor's self-report rather than a
controlled comparison — but this design proposes exactly the machinery they deleted, and owes an answer.

**The honest counter-evidence, which is narrower than one might hope:**

- A team-lead agent in another system bounds parallel width to *"target ~3 parallel steps, min 1, max 5"* with a
  stated reason — *"the orchestrator's context cost grows non-linearly with amount of parallel steps"* — and
  **writes the resulting plan back into the task file**, so the decision is durable and auditable. That is a
  roster component earning its keep with a named mechanism and a recorded output.
- Another separates rubric generation from rubric application: one agent produces an evaluation specification,
  a second, differently-modelled agent applies it, deliberately so the judge never invents its own criteria.
  That separation is real design, not org-chart cosplay.

**And a finding that vindicates one deletion in this design:** *no system studied automatically decides how much
machinery a task gets.* Every one either lets a human choose the scope at invocation, lets the model decide
implicitly, or bounds the run by explicit budget limits. **Nobody has built the task-complexity classifier this
design is deleting.** The deletion is consistent with universal practice; the shadow-mode replacement is ahead
of it.

The most sophisticated real control found is not a classifier but a **budget**: four ordered limits —
continuations, turns, tokens, wall-clock — checked in a fixed order and returning a named reason, paired with a
quality gate that runs shell commands as a hard precondition before the loop may report itself done, plus a
git-worktree snapshot hash that detects "the agent claims to be finished but nothing has changed since the last
failure" and escalates to exhaustion instead of looping. **That stall detector is worth stealing outright.**

### 9.8 · Skill selection at scale — genuinely unsolved

**No corpus in this study gives an agent an in-context ranked search over its own skills.** Where search exists
at all, it is pushed *outside* the model: one corpus shells out to an external package CLI; another defers to a
hosted "live catalog" that it explicitly treats as more authoritative than its own static text.

| Corpus size | What they do |
|---|---|
| 18 skills (the vendor's reference corpus) | Nothing. The model reads every description. This is the baseline everything else compensates for |
| 31-104 skills | Directory naming and a hand-written, unenforced guide. No machine-consumed manifest, no pruning, no routing |
| 69 skills | **Architectural avoidance** — *"Commands over skills: commands load on-demand; skill descriptions load into context by default."* Anything that does not need natural-language triggering is moved out of the discovery tier entirely. Secondary lever: a documented description-writing convention (start with "Use when...", name concrete symptoms and error strings) |
| 90 skills | A real marketplace manifest plus a meta-skill that shells out to an external search index |
| 331 skills | Four layers: an 18-category manifest covering 330 of 331; an **enforced** registry where unregistered directories are pruned by an hourly automated sync; a router skill that triages relevance and then defers to the external catalog; and a governance/trust pipeline |

**The one piece of written size discipline in the entire study** comes from the runtime vendor's own
skill-authoring guidance, and it is worth adopting verbatim: three loading levels — metadata (name and
description) always in context at roughly 100 words; the skill body when it triggers, ideally under 500 lines;
bundled resources loaded only as needed, with scripts that can execute without being loaded at all.

> **For a project holding more than about 70 skills and selecting by description matching: you are past every
> corpus that has no mechanism, and at the size where the two that do have one moved search out of the model's
> context.** Plan for an external index or for architectural avoidance. Do not assume description matching will
> keep scaling, and do not assume someone has solved this — nobody in this sample has.

### 9.9 · Your frontmatter is probably idiosyncratic — check before you propagate

A whole-corpus grep across **803 real skill files** found that only `name` and `description` are near-universal.
A `metadata:` block appears in four corpora with **four mutually incompatible sub-schemas**. The origin
project's own additional fields — a risk tier, a source, a last-updated date — returned **zero, one (and that
one was a code example inside body prose), and one** hit respectively across all 803 files.

> **SPEC: lint what you require, and do not require what nobody writes.** A portable harness that assumes its
> own frontmatter conventions will fail on contact with any corpus it did not author. Validate the two universal
> fields; treat everything else as local.

**A counting trap, since this study nearly fell into it.** Three of the eleven "corpora" are link indexes:
two contain **zero** skill files, and one contains two. One of them advertises "1497+" on its own badge against
1,190 link bullets actually counted. Treating the three as corpora would have inflated the total by roughly
1,340 phantom entries. **A repository that indexes skills is not a repository that has skills**, and a badge is
not a measurement.

### 9.10 · The steal list

Ranked by value per unit of effort, each verified in a real implementation:

1. **A required test that cross-references every capability-bearing file that ships against every place that
   must register it.** The system that has this built it *after* shipping a hook that was installed and never
   registered. It converts an entire class of silent failure into a build failure.
2. **Per-file update with backup, integrity, and loud-failing rollback** — plus refusing outright to update a
   hard-linked file rather than corrupting whatever else points at it.
3. **The structural boundary**: never write generated content into a directory a project customizes.
4. **Evidence expiry with Refresh / Deprecate / Waive** on any append-only decision record.
5. **The git-snapshot stall detector**: hash the working tree; if the agent claims done or retries with nothing
   changed since the last failure, escalate to exhaustion rather than looping.
6. **Two enforcement layers per capability grant**: a per-capability gate that throws, plus a coarser hard
   sandbox as backup.
7. **Cycle detection in any hook that can re-trigger itself**, with a unit test.
8. **Every hook declares its own enforcement posture in its first five lines.**
9. **Name the escape hatch and require an explicit flag to use it** — block by default, with one documented,
   greppable override.
10. **A rationalization table**: map the specific plausible excuses a model uses to skip a step to one-line
    rebuttals. Pure text, no infrastructure, and aimed at the real failure mode.

### 9.11 · The refuse list

1. **Do not market context injection as enforcement.** If it cannot block, the honest word is "nudge."
2. **Do not ship a capability field that is auto-granted whatever it requests.** Worse than no field.
3. **Do not maintain two registration paths for the same runtime.** One system's plugin manifest and classic
   installer cover different subsets of the same hooks, with no test asserting parity between them — which is
   exactly what makes "is this actually live?" unanswerable without reading both.
4. **Do not use severity vocabulary that implies consequences you have not built.**
5. **Do not offer whole-folder all-or-nothing overwrite prompts.**
6. **Do not default to guessing over stopping.** One autonomy design instructs the model, when blocked, to
   *"make a reasonable assumption and verify it"* rather than pause — with a known open defect where the loop
   re-schedules itself with no new information.
7. **Do not adopt a core loop that ships no permission system** without independently re-adding the containment
   its own documentation says it does not provide.
8. **Do not put fear-based coercion in agent prompts.** Two agent definitions in one system tell the model it
   *"will be KILLED"* if it underperforms. The persuasion research they cite is real; normalizing this is still
   a bad default, and strong direct instruction works without invented stakes.

### 9.12 · Method note on this study

Five workers read 24 systems in parallel. Each was told to open implementing files rather than pattern-match, to
mark every number VERIFIED or ESTIMATED, to prefer "I could not determine X" over a plausible guess, to write
findings to a file and return only a pointer, and — critically — **not to assume the briefer's description over
what the files say.**

That last instruction earned itself twice in one run. One worker **refuted two numbers it had been handed as
settled**, including one already written into this document (see section 11). Another **falsified two
load-bearing claims in an existing internal brief**, both of which had erred in the reviewed framework's favour:
a claim that a system's core loop lived in a different repository (it did not — the fork had simply kept its
upstream package names), and a claim that it had no deterministic self-verification gate (it has one, shallower
than ours but real).

One worker wrote 5,400 words to its file and then went idle without ever sending its summary. **The findings
survived because the brief required writing to a file rather than returning a payload.** That is the operational
rule from section 11, demonstrated live.

Every finding above is one worker's read, verified in the underlying study files but not independently
replicated except where noted. Treat the specific numbers as good evidence, not as settled fact — which is
exactly the standard this document asks you to hold it to.

---

Four things established by earlier verified passes, carried in:

- **The mechanisms worth copying rather than inventing** — a per-file hash install manifest, capability-scoped
  credential brokering, a skill-frontmatter capability grammar, and a session-start hook enforcing skill
  invocation. Each exists in readable source. None needed to be designed.
- **Advisory context hooks are the class we were furthest behind on.** VERIFIED by opening every file in two
  external libraries: **29-30 of their 39 hook files (74-77%) contain no code path that can block anything.**
  They inject context, cache configuration, render a status line, or announce updates. They shape what an agent
  *knows* rather than what it *may do*, which fits "constrain outcomes, not methods" better than any gate in
  this design. The origin project had exactly one hook of this class. It became component 10.
- **The counts published first were wrong, all of them, and the corrections kept coming.** A claimed 78-vs-7
  hook gap was a file-path grep artifact including documentation and tests. Its replacement — 15-and-8
  block-capable — was itself revised down to **9 and 1** by opening every file and reading the actual exit and
  decision paths. Even the denominators (31, 47) could not be reconciled against any file-count basis. Section 11
  is about this.
- **The same file name can carry opposite semantics in two forks of one system.** `gsd-workflow-guard.js`
  hard-blocks in one repo and, in the other, carries the literal header comment *"This is a SOFT guard — it
  advises, not blocks. The edit still proceeds."* **SPEC, and it costs nothing: make every hook state its own
  enforcement posture in its first five lines.** Anyone reading the source then knows its blast radius with no
  other context — which is exactly what nobody had here.
- **Two assumptions did not survive contact.** One system believed to be an agent organization has zero agents
  and zero hooks — it is a skill-*format* innovation, and copying its mechanism while ignoring its structure was
  correct. Another ships 22 files and has deliberately *retired* its agent roster.

---

## 10 · What this deliberately does not build

Refusals are part of a design. Each of these was considered and declined, with the reason:

| Refused | Why |
|---|---|
| A successor to the tier classifier | It predicted nothing and gated nothing. Replace it with a hook, not a better taxonomy |
| Cross-critique rounds for generative decisions | Degrades accuracy through sycophancy; the active ingredient is heterogeneity, not rounds |
| Peer fan-out scripts, one per domain | Collapses to one engine plus configuration data |
| A dashboard or query layer on the run log | `jq` is sufficient. Build the reader, not the UI |
| Auto-retirement of unused mechanisms | Requires trusting the log before it has ever been read |
| A generalized policy language | The classifier is a list of paths. Keep it a list of paths |
| Enterprise self-modification machinery | Immutable versioning and restore endpoints solve multi-actor trust problems a small team does not have. Git is the review mechanism: every self-edit is a diff on a branch, recorded, stopped at the propagation boundary, revertible with one command |
| Commit-message enforcement | Real rule, but the tooling caused an incident that broke 50+ worktrees. Value did not justify recurrence |
| Container isolation per agent | The runtime's native filesystem and network sandbox covers the motivating case at a fraction of the cost |
| Autonomous inbound work | Deliberately deferred, not smuggled in. Work arriving unattended is a separate decision with its own risks |
| **Any further audit or research pass** | The hardest open questions have no mature prior art. More reading cannot resolve them; only running the system can |

That last one is a stop condition on this document's own genre. Three of the four questions in section 12 have
been researched repeatedly and remain open, because they are empirical questions about a system that has not run
yet.

---

## 11 · How we know what is true

> **PRINCIPLE. A count produced by pattern-matching is a hypothesis, not a finding.**

This rule earned itself. On a single day in the origin project, **eight claims were checked against their
implementing files. All eight were wrong, and every one overstated reality.** Three were the orchestrator's own.
One of those had been written *into the plan document describing how to prevent exactly this*.

The corrections, as a class:

| Claim | Reality | How it was produced |
|---|---|---|
| "78 hooks versus our 7" | Difference in live blocking hooks: **two** | Counted files under any path matching `*hook*`, including docs and tests |
| "23 blocking versus 3" | Same error, one layer down | Matched files *mentioning* a blocking primitive without being enforcement points |
| "The classifier is first-match-wins" | Highest-tier-wins; **rule order has no effect** | Relayed from the file's own header comment, which had been wrong since it was written |
| "A second parser hazard exists" | It did not | Misread a worker's phrase and wrote it into the plan |
| "62 of 149 descriptions corrupted" | 18, one failure mode | Estimated from a pattern, not a diff against source |
| "Every component names a mechanism as a field" | 6 of 10 carry the field; all 10 name one in prose | A grep answered a different question than the one asked |

**A ninth arrived two days later, and it is the most instructive of the set.** The claim that an external system
had five hooks "shipped but registered nowhere" — quoted in section 2 as evidence that this is not a discipline
problem — was produced by scanning one of that system's *two* registration mechanisms. It was wrong. A worker
briefed to check rather than accept it opened every file and refuted it, and the refutation was then verified
independently before being accepted.

Three things separate it from the other eight, and each is worth carrying:

- **It pointed the other way.** The eight all overstated a gap. This one overstated *external validation for our
  own thesis*. An error that flatters your argument produces no friction while you write it.
- **It was caught only because the brief said to check it.** The worker was handed the number as settled
  context — "do not rediscover this" — and told in the same brief not to assume the briefer's description over
  what the files say. It refuted the number it was told to trust. Without that sentence, it would have carried
  the error forward with a verified stamp on it.
- **The corrected finding was better than the false one.** The real story — an experienced team hit the bug once
  and answered it with a build-failing registration-completeness test — is stronger evidence for the resolver
  argument than the fabrication it replaced. **Retracting a claim usually improves the case it was supporting**,
  because what survives verification is load-bearing and what does not was decoration.

**SPEC — four practices that follow, and they cost nothing:**

1. **Verify by reading the implementing file before repeating any number.** Mark every figure as verified or
   estimated. An unmarked number is a claim about work you did not do.
2. **When briefing anyone on a premise, add: "do not assume my description over what the file says."** That
   single sentence caught a wrong premise the orchestrator had asserted as a critical correctness detail.
3. **Split verification by kind.** `verified_by: command` for anything with a deterministic check;
   `verified_by: judge` only where nothing deterministic exists. Label the judged ones, so you can later measure
   how often judgment was wrong — the only way to learn whether prose criteria are worth anything.
4. **Test the tool you verify with.** One repro in this project returned false for every case including one that
   was logically impossible; the shell's `case` statement does not expand an unquoted variable as a glob in the
   interactive shell, but does in the CI shell. A result that absurd got a second look. A subtler one would not
   have.

> **The deeper lesson is not "be more careful."** It is that **a relay without a resolver produces fabrications
> regardless of who relays.** Care is not a mechanism. This is the same argument as section 5, demonstrated
> eight times in a day against the people who wrote it.

### One operational finding worth more than it looks

A natural experiment ran unplanned. Three research workers were briefed to write their payload to a file and
return only a pointer. All three landed cleanly. A fourth agent, not briefed that way, did complete work and
returned **nothing** — its findings recovered only because an interim message happened to arrive first.

**SPEC: never ask an agent for a large enumeration inside a structured return.** Have it write the payload to a
file and return a pointer plus counts. Tell every agent to finish inside budget, and that a partial structured
return beats a perfect unwritten one. Every agent so instructed returned.

---

## 12 · Where this is soft

Recorded because a design that hides its weak points cannot be challenged, and this one is about to be.

**What friction actually costs.** Four independent design perspectives separately admitted they cannot price
what it feels like to hit a denial mid-task. Every gate in this design was proposed by someone who conceded they
could not cost it. This is not a small gap: the entire advisory-versus-blocking choice rests on an unpriced
variable.

**Whether the agent-definition trim is quality-neutral.** Seven thousand lines across 26 files. Nobody could
identify which prose does real cognitive work; the recommendation was inferred from line count and drift alone.
It is a cost-minimization bet, sequenced last for exactly that reason.

**Whether the evidence base was verified honestly.** Much of this rests on an 88-finding audit produced by this
system, about itself — possibly by the same single-model-family panel flaw it identified elsewhere. Three
separate design perspectives flagged this independently. Section 11 is the partial answer; it is not a complete
one.

**The single point of consumption.** One person is sole flag-holder, sole log reader, sole approver above the
orchestrator. Nobody examined what happens when they do not read. That is precisely how the entry cap, the
expiring commitments, and two dead orchestration tiers all played out — each died silently at a step that
terminated in a human who did not look. The reader agent of component 5 is the structural answer, and it is
worth asking whether it removed the problem or merely moved it one level up.

**Context cost, never priced.** Component 10 injects context on every matching call, in every project, forever.
That is a real recurring token cost and this design has never estimated it.

**Whether the roster earns its keep at all — the strongest external challenge, added after the comparative
study.** One shipped system deleted its agent roster twice in four months, on the record, concluding first that
it *"added no real benefit over simply using available tooling"* and later that *"frontier models handle this
well on their own now."* It kept standards injection and deferred everything else to the host tool. Section 9.7
has the detail.

This design proposes the machinery that team deleted. Three honest observations, none of which settles it:

- Their evidence is a vendor self-report about their own roster, not a controlled comparison — and their
  roster was a static list of role assignments, which is the weakest form of the idea.
- The roster components that survive scrutiny elsewhere are the ones with a **named mechanism and a recorded
  output** — a width-bounding planner that writes its plan back to disk, a rubric generator separated from a
  rubric applier. Those are not org charts. Section 4.3's roster rule already points this way: keep an agent
  when its *procedure* differs, collapse it when only its skills do.
- **Nothing in this document has measured it.** The run log is the instrument that would answer it, and it does
  not exist yet.

**The uncomfortable reading, stated plainly:** if the deletion argument is right, most of the value here is in
the mechanism layer — the classifier, the gate, the run log, the resolvers — and comparatively little is in the
layer diagram. That would not invalidate the build. It would reorder it. This is the first question to put to
anyone challenging this document.

---

## 13 · Stop conditions, as artifacts

**PRINCIPLE.** A stop condition written as a sentence is not a stop condition. It must be something that is
*checked*, by something that runs, on a schedule you did not choose in the moment.

**EVIDENCE:** the origin project's previous set expired with no verdict recorded and nobody noticed for eight
weeks. That is the failure this whole document is about, applied to the document's own safeguards.

Stop and reassess if any of these becomes true:

1. Any component is declared done while its enforcement is a sentence rather than a named hook, CI job,
   resolver, or data file.
2. The run log exists for four weeks with no reader, or the reader was never built.
3. A run burns more than 200k tokens and returns no structured output, *after* the stall envelope ships.
4. The build extends past the components sized S and M without an explicit decision to continue.
5. The sync tool still has not run against a project other than the one you built it in.
6. The project ships no user-facing work during the rebuild.
7. A new named mechanism is added that nothing invokes within two weeks.

**SPEC: give each of these a checker and a date.** Condition 7 in particular is the one that catches this
document's own worst failure mode — building mechanisms because they are satisfying to build.

---

## 14 · Your first week

If you take nothing else from this document:

1. **Measure your enforcement ratio and your fabrication count** (section 2). Twenty minutes. Everything else is
   contingent on this being a real problem in your project.
2. **Find the mechanism you have already written and never wired.** In the origin project it was a correct,
   passing, purpose-built validator registered nowhere, guarding the file class the project's own classifier
   called its most dangerous. Look for yours before building anything new.
3. **Make your gate unforgeable and required, and make CI execute code.** Until this lands, nothing else you
   build is protected — including this.
4. **Write the run log and its reader together.** Never the log alone.
5. **Delete your topology classifier** and put a hook where it was.

And one habit, which costs nothing and is the difference between this working and this becoming another
document describing a machine that does not exist:

> **Before you write that something is true, run the thing that would fail if it were not.**
