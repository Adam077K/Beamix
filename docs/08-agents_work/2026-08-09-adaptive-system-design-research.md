# Design research — QM, GSD, and the five questions under an adaptive agent system

**Run:** `wf_5c6af736-b3d` (research.js, depth: standard) · 67 agents · 3.36M tokens · 466 tool calls
**Date:** 2026-08-09 · **Confidence:** medium · 40 claims verified, 20 rejected in adversarial verification
**Purpose:** input to the locked three-layer adaptive architecture (orchestrator → invokable thinking layer → workers)

---

## Target 1 — "the YC agent system" = **QM (Quartermaster)**

Published and open-sourced by **Y Combinator itself**, MIT, ~2026-07-31 to 08-03.
`qm.ycombinator.com` · `github.com/yc-software/qm` · 12.5k stars / 1.4k forks / 67 open issues / 84 open PRs.

Node.js + TypeScript, Fastify core, **Postgres persistence**, **per-scope isolated sandboxes**, three
**security modes (Strict / Auto / Dangerous)**, and **pluggable coding harnesses** — Claude Code, OpenCode,
Codex, Pi. Runs in Slack and on the web. YC dogfoods it across accounting, legal, events and engineering,
including using QM to build QM.

**The origin story is this project's situation, verbatim.** YC built QM after outgrowing a basic internal
Ruby agent loop, then **50+ individual bespoke "Hermes" agents** — wanting *"Hermes' flexibility with the
original system's simplicity,"* on infrastructure they could own and host. That is precisely the arc from
a simple loop → 26 hand-authored agents → wanting adaptivity without the sprawl.

**Ruled out, do not conflate:** "YC AI Stack" is a free dev-tool credits bundle for students at YC
university events, not an agent system.

**Self-improvement at YC is weakly sourced.** A YC Startup Podcast episode (2026-05-27, GP Pete Koomen)
describes a single shared database with broad agent access plus a nightly self-improving "skill loop." The
*concept* is sourced; the commonly-repeated specifics (that the DB is Postgres, that the loop reads
employee-agent conversations) are **unverified — no transcript checked.** Do not build on the specifics.

> **Side effect:** this resolves one of the two targets the 2026-08-08 capability gap map left unresolved
> ("qm agent orchestration framework with Postgres leases and reaper"). The gap map's resolver correctly
> refused to guess; it simply predated the release being findable.

## Target 2 — GSD resolves, but downward

`gsd-build/get-shit-done` — *"meta-prompting, context engineering and spec-driven development system for
Claude Code by TÂCHES."* 64,734 stars, 5,472 forks, MIT, created 2025-12-14.

**Archived 2026-06-26, read-only.** Last push 2026-05-31. Active development moved to `open-gsd/gsd-core`.
Anything built on the original is building on a frozen artifact. All 12 agent names Beamix archived exist
there, among 33 total.

**The one transferable element** — the plan phase: parallel stack/features/architecture/pitfalls researchers
→ planner synthesizes `PLAN.md` + `VALIDATION.md` → **plan-checker validates feasibility and loops up to 3x
if the plan doesn't achieve the phase goal.** A bounded replan loop with an explicit cap.

**Unresolved:** what GSD enforces deterministically vs. by prompt. Do **not** assume the 3x cap or the stage
ordering is code-enforced — that was not established from primary docs.

---

## (a) Dynamic capability composition — progressive disclosure, not a router

The most mature documented approach (Anthropic Agent Skills) is **three-level progressive disclosure with
model-driven matching, not a trained classifier**:

| Level | What loads | When |
|---|---|---|
| 1 | name + description, ~100 tokens per skill | **always** in the system prompt |
| 2 | `SKILL.md` body, < 5k tokens | only on match |
| 3 | resources / scripts | only when referenced — **script code never enters context, only its output** |

Selection happens by the model matching against the **`description` field**. That makes description quality
the load-bearing surface of the whole mechanism.

**Tool Search Tool** extends the same just-in-time principle to tools: `defer_loading: true` plus regex or
BM25 retrieval, auto-expanded as `tool_reference` blocks. Documented thresholds — standard tool calling
under 10 tools; tool search at **10+ tools, >10k tokens of definitions, or 200+ MCP tools**. Limits: 10k
deferred tools, 5 results default, 200-char regex, 500-char BM25. A typical multi-server setup (GitHub,
Slack, Sentry, Grafana, Splunk) consumes ~55k tokens; >85% reduction with 3-5 tools loaded.
**Non-obvious cost:** deferred definitions are still sent server-side on every request — only *model
context* is saved, not bandwidth or server-side cost.

**MCP provides no discovery router at all:** `tools/list` is paginated only, no semantic filter or search;
tools are "model-controlled." Its security requirements are explicit — human-in-the-loop SHOULD be able to
deny invocations, clients MUST treat tool annotations as untrusted unless the server is trusted, servers
MUST validate inputs, enforce access control, rate-limit and sanitize outputs.

**Known failure mode, stated by Anthropic:** a malicious Skill can direct the model to invoke tools or
execute code contrary to its stated purpose. Skills also don't sync across claude.ai / API / Claude Code.
On the API they run sandboxed with no network; **in Claude Code they have full network access.**

## (b) Multi-perspective reasoning — the answer splits hard by purpose

**For EVALUATION, panels have the best evidence.** PoLL — a panel of 3 *smaller* models from **disjoint
families** — beats a single GPT-4-class judge, shows less intra-model self-preference bias, and costs **7x+
less**, across 3 judge settings and 6 datasets. *(arxiv 2404.18796)*

**The active ingredient is heterogeneity, not headcount.**

**For GENERATION, homogeneous debate is weak-to-negative:**
- 5 representative multi-agent-debate methods across 9 benchmarks and 4 models: MAD **frequently fails to
  beat single-agent CoT or self-consistency** *(arxiv 2502.08788)*
- **Debate can actively degrade accuracy across rounds** — models flip correct answers to incorrect via
  sycophancy and social conformity, even when stronger models outnumber weaker ones. This is the concrete
  mechanism by which a multi-perspective thinking layer can be *worse* than one strong pass.
  *(arxiv 2509.05396)*
- Competitive debate has a game-theoretic **cheap-talk incentive** — persuade the judge rather than inform
  it ("debate hacking"). A collaborative non-zero-sum reframing (ColMAD) reports **+19% over competitive
  MAD**. *(arxiv 2510.20963)*
- Isolated single-agent **self-correction outperforms unguided homogeneous debate at lower cost**.
  *(arxiv 2605.00914)*

**Do not overclaim the negative:** equal-compute evidence is genuinely mixed. One 2026 study finds
single-agent matches or beats multi-agent under matched reasoning-token budgets; another finds MoA/debate
beats self-consistency by +1.3 to +2.7pp at comparable compute on MMLU-Pro. "Multi-agent loses at equal
compute" is **not** settled.

**Judge hygiene, if a panel runs at the gate:** position bias is non-random, varies by judge and task, and
is driven by the **quality gap** between compared solutions (15 judges, 22 tasks, 150k+ instances).
Self-preference bias correlates with lower perplexity of a judge's own output, is measurable across 20
mainstream LLMs, and is **reducible ~31.5% via rubric-decomposed multi-dimensional scoring** rather than
holistic verdicts.

## (c) Depth / effort selection — essentially unsourced

**No primary evidence** that either computed task features *or* model classification reliably picks a
compute budget. The only sourced analogues are capability-count thresholds (the Tool Search numbers above)
and GSD's fixed 3x replan cap.

Stated plainly: the "compute depth from diff risk" direction has **no external evidence base.** It is still
better than a classification that is never recorded and gates nothing, but it should ship as an instrumented
hypothesis, not a settled design.

## (d) Self-improvement gating — **no mature prior art exists**

This is the highest-risk area of the locked architecture, and the finding is that nobody has solved it.

Anthropic's Managed Agents memory store is the **best sourced primitive**: immutable versions per mutation
(`memver_…`) as an audit trail and point-in-time recovery, 30-day retention, `content_sha256` optimistic
concurrency, and a redact operation.

**But the same API has:** no restore/rollback endpoint (*"retrieve the version you want and write its
content back"* — rollback is manual), **no mandatory human approval**, no documented write rate limit, and
no auto-rollback on eval regression. The docs explicitly warn that a `read_write` store on a session with
untrusted input lets **prompt injection plant memory that later sessions read as trusted.**

Claude Code is blunter still, and this is the single most important sentence in this brief:

> CLAUDE.md and auto-memory are *"context, not enforced configuration. To block an action regardless of
> what Claude decides, use a PreToolUse hook instead."*

**→ Any hard constraint in a self-improving system must live in a hook, not in a prompt file.**

That is an independent restatement of the architecture audit's root cause ("prose is both the specification
language and the enforcement language"). Two separate investigations converged on it.

**Conclusion: an orchestrator that lets agents edit their own skills/prompts must build review, diff,
rate-limiting and rollback itself. Nothing sourced ships it.**

## (e) Instrumentation — the weakest-sourced area of all

Versioned memory is an audit trail, and MCP tells servers to rate-limit and log. Beyond that, **no primary
evidence was found of any of these systems using run telemetry to retire or improve mechanisms.**

So the run-log-plus-retirement-TTL direction has no prior art either. The local evidence for it remains
strong — T3, T4, `coding.js` and `research.js` died unnoticed precisely because nothing recorded usage, and
the architecture audit had to reconstruct usage by grepping prose written by the agents being audited. But
it should be built as an original bet, not as a known-good pattern.

---

## Design implications for the locked architecture

1. **The thinking layer should be heterogeneous and collaborative, never homogeneous debate.** Distinct
   roles with genuinely different objective functions (feasibility vs. cost vs. risk vs. user impact) is the
   version the evidence supports. The same model prompted five ways, arguing across rounds, is the version
   that measurably degrades.
2. **Put the panel at the QA gate, where the evidence is strongest** — and score by decomposed rubric rather
   than holistic verdict, which is the sourced mitigation for self-preference bias. `qa.js` already does
   dimension-scored review; that shape is validated.
3. **Capability composition should ride the native progressive-disclosure mechanism**, not a hand-built
   router. The existing 146-skill corpus plus MANIFEST is already roughly Level 1/Level 2 — the gap is that
   selection quality now depends on **description quality**, which nothing currently checks.
4. **Hard constraints go in hooks. Everything else is advisory by construction.** This is the design rule
   that follows from (d), and it makes the blast-radius split enforceable rather than aspirational.
5. **Adopt GSD's bounded replan loop** — plan → check → loop with an explicit cap — as the thinking layer's
   control structure. It is the one clearly transferable element, and a cap is deterministic where a
   "keep going until it's good" instruction is not.
6. **Depth selection and run-log-driven retirement are original bets.** Ship them instrumented, and say so
   rather than presenting them as established practice.

## What this research does not cover

Whether QM's internals are worth borrowing beyond the origin story and the security-mode idea — the repo
was characterized, not read. GSD's successor `open-gsd/gsd-core` was not examined. And the deterministic-vs-
prompt enforcement question, which is the single most relevant thing about GSD for this redesign, is
unresolved.
