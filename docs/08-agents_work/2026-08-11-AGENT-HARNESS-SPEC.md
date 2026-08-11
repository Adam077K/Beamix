# Agent Orchestration Harness — a build specification

**Audience:** a team of agents building this harness in a project that is *not* the one it was designed in.
**Status:** draft 1, 2026-08-11. Section 9 pending a comparative study of 24 external systems.
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

*Pending. A comparative study across 13 harness systems and 11 skill corpora on local disk is in flight,
answering the same seven questions of each: orchestration, enforcement, capability declaration, memory,
propagation, observability, and the one idea worth stealing. This section will be written from those findings
and not before.*

Four things are already established from earlier verified passes and will be carried in:

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
