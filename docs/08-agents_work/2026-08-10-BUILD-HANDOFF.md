# BUILD HANDOFF — implement the agent system, then convene the board

**Planning is COMPLETE.** 23 locked decisions, 10 components, every component names a mechanism.
This document is the build order. Paste the block below into a fresh CEO session.

Two phases, in order. **Phase 1 builds. Phase 2 attacks what was built.** Do not skip Phase 2 —
the whole system was designed by the system, about itself, and has never been reviewed by
anything that did not help write it.

---

```
You are the CEO/orchestrator for Beamix. Read .claude/agents/ceo.md for your role.
Set /color gold and /name ceo-build-agent-system.

MISSION: BUILD the agent system. Planning is finished — do not re-open the design, do not
re-run research, do not re-grill. 23 decisions are locked across two documents and every
component names a mechanism. Your job is to turn them into code, in one run, then have a
board of thinking agents attack the result.

This is a CROSS-PROJECT asset used in ~10 repos. 11 repos carry it today; etsyc (689
commits/90d) and evalove (385) both out-commit Beamix. Build accordingly.

READ FIRST, IN THIS ORDER — cache as one block, do not re-read mid-session:
1. docs/08-agents_work/2026-08-09-AGENT-SYSTEM-ARCHITECTURE.md   <- 23 decisions
2. docs/08-agents_work/2026-08-09-AGENT-SYSTEM-REBUILD-PLAN.md   <- 10 components + sequence
3. docs/08-agents_work/2026-08-09-HANDOFF.md                     <- verified facts, do not re-derive
4. docs/08-agents_work/2026-08-09-hook-audit/SYNTHESIS.md        <- what is actually broken
Only if a component needs it: docs/08-agents_work/2026-08-09-target-system-spec/ (8 files).

ALREADY BUILT — do not redo:
  #198 bd8e7d0  qa-tier-floor pattern gaps closed
  #196 0471927  settings.json.proposed hook registrations restored
  #197 46f4ddd  schema-lint wired into CI (26 pass, 0 fail) — SEQUENCE STEP 1 IS DONE

=====================================================================
PHASE 1 — THE BUILD, in dependency order
=====================================================================
Each step names its acceptance criteria. A step is done when its criteria pass BY COMMAND, not
by assertion. Work each step in its own worktree branched from origin/main. One PR per step.

STEP 0 · Close the lapsed stop conditions. (XS)
  CLAUDE.md still says "Vindication triggers active until 2026-06-15" — expired ~8 weeks ago
  with no verdict recorded. State whether FM-12 fired, whether the 5-day cap held, whether a
  customer feature shipped. This is the proof case for why every stop condition must be a
  checked artifact.
  DONE WHEN: CLAUDE.md carries a dated verdict, not an active-but-expired claim.

STEP 2 · Extend schema-lint. (S)  [step 1 done]
  a) Lint `tools:` and `mcpServers:` — a declared capability that does not resolve fails the
     build. Generate .claude/mcp-manifest.json from .mcp.json and check against it.
     THIS CATCHES: linear (declared in 23 files, configured nowhere), context7 (13 files,
     nowhere). .mcp.json contains ONLY supabase.
  b) Description lint — flag truncated/malformed descriptions. Progressive-disclosure selection
     keys on the description field, so a broken one is a SILENT matching failure.
  c) Fix the MANIFEST generator's three YAML parsing bugs corrupting 62 of 149 descriptions.
     THE SOURCE SKILL.md FILES ARE FINE. Fix the generator, not the skills.
  d) Make `**Mechanism:**` a required labelled field on every plan component and lint it —
     the disqualification rule currently has no resolver (spec gap 4).
  DONE WHEN: schema-lint exits 0; every declared tool/MCP resolves or the build fails;
             regenerated MANIFEST has 0 corrupted descriptions.

STEP 3 · Tier-floor: advisory lane, provenance axis, remaining holes. (M)
  a) Prose/docs globs -> a new `advisory` tier.
  b) `provenance: untrusted` flag that hard-gates memory and skill writes whose content traces
     to scanned pages, fetched URLs, or third-party API responses — REGARDLESS of file type.
     Directly relevant: 24 third-party systems are cloned at ~/VibeCoding/_reference/.
  c) Close the three remaining holes: .mcp.json (grants EVERY agent's tool and API access,
     currently lite), .claude/commands/**, and .claude/workflows/** (the QA gate's own scripts;
     a fix exists on unmerged branch feat/spec-conformance-and-qa-lead-accuracy @ 09b81ee —
     cherry-pick it, it conflicts textually with merged #198).
  d) The static escalation trigger list for the thinking layer (component 8) lives here too.
  KNOWN, DO NOT REDISCOVER: the resolver is HIGHEST-TIER-WINS (max rank, no break,
  qa-lead-pass.yml:215-217) — rule ORDER HAS NO EFFECT. And it SUBSTRING-MATCHES rather than
  parsing YAML, so any line containing "- pattern:" or "tier:" is read as a rule INCLUDING
  COMMENTS. `trivial` is structurally unreachable because the ** catch-all sits at lite.
  DONE WHEN: real YAML parsing replaces the substring scan (see step 5d); every path in a
             38-path sweep resolves as intended; no comment parses as a rule.

STEP 3.5 · gsa-sync --check across the 9 live repos. (M)
  Read-only: per-file sha256 vs canonical + receiving-project re-classification. Reports drift,
  missing tier-floor, per-repo skill presence. NO WRITES.
  Targets: aiclub beeond etsyc evalove finfun ghostb noam-website realestate adamos.
  OUT OF SCOPE by data: hitstampjavagame, ml2, test1 — zero commits in 90 days.
  NOTE adamos has 11 hooks to Beamix's 7 — a sibling is AHEAD. Fit-precedence is load-bearing.
  DONE WHEN: a drift report exists for all 9, and it yields the cross-repo skill inventory that
             decision 12's "useless in EVERY project" cut test needs.

STEP 4 · pre-tool-use.sh — the single depth-invariant enforcement point. (S)
  a) Blast-radius + provenance gate reading step 3's data.
  b) Self-modification block on hooks/settings behind an explicit session env flag.
  c) ENVELOPE DETECTION (decision 18): read .claude/run/<task_id>/envelope.json
     {skills[], mcps[], tools[], paths[]}; on an out-of-envelope call append
     {event:'envelope_reach', tool, task_id, agent} to the run log and EXIT 0. ADVISORY. NEVER
     BLOCKS. Session->task_id resolution reuses the per-session scratch file (hooks.md:315).
  d) The native filesystem/network sandbox replaces the substring blacklist.
  DONE WHEN: a reach is logged at spawn depth 2 without blocking; a blast-radius violation
             blocks with a non-zero exit.

STEP 5 · THE QA GATE — all four parts land together or none matters. (M)
  This is the most important step in the build. Right now anything can merge, including this
  rebuild's own work. The CEO merged three irreversible-tier PRs on 2026-08-09 by hand-typing
  `qa_verdict: PASS` into a markdown file.
  a) qa.js emits qa-verdict.json {commit_sha, tier, verdict, findings_hash}; CI asserts
     commit_sha == head.sha. Replaces the grep against a hand-typed string.
  b) Enable ruleset 13276203 (currently enforcement: disabled) with the check required.
  c) CI MUST EXECUTE CODE. No job today runs tsc, eslint, pnpm test, pnpm build or pnpm audit.
     Decide which and wire them. A forgery-proof verdict on a gate that compiles nothing is
     theatre. SPEC GAP: which commands is not yet decided — decide it, record it, justify it.
  d) Close the SECOND forgery path: the file-path tier-floor hard-fails ONLY at irreversible;
     a `full` floor prints an info line and lets a forged `tier: lite` session file merge.
  e) ACCEPTANCE CRITERIA plumbing (decision 19). qa.js has ZERO args. today and all five
     dimensions are generic code-quality lenses. Add: criteria {id, text, check,
     verified_by: command|judge}. A failed `command` criterion is a deterministic BLOCK via the
     existing P1-override; a failed `judge` criterion enters findings and must survive the
     3-verifier adversarial pass. Run-log fields ac_total, ac_judged, ac_failed.
  DONE WHEN: a hand-typed PASS string cannot merge anything; the ruleset is a required check;
             a deliberately-broken diff fails CI on executed code.

STEP 6 · Delete the dead surface. (S)  [after step 4 — the hook replaces the convention]
  T1-T5 topology, T3/T4, coding.js, research.js, the self-contradicting routing text in ceo.md,
  the ghost roster in ~/CLAUDE.md, and the 13 merged-branch worktrees. Also delete the
  dispatch-packet apparatus: nested spawning WORKS (verified at depth 2), so "chiefs are
  planning-only" is obsolete.
  DONE WHEN: no file references T1-T5 or dispatch packets; git worktree list is clean.

STEP 7 · Run log v1 + weekly reader + reader heartbeat. (M)
  One JSONL line per run: run_id, TASK_ID, agent, mechanism, model, tokens, cost_usd, tier,
  thinking_layer_invoked, qa_verdict, duration_s, structured_output_emitted, plus status:
  completed | STALLED | BLOCKED with blocker_reason, plus ac_* and envelope_reach events.
  TASK_ID IS REQUIRED — decision 16's two-panel-runs-per-task bound is unimplementable without
  it, and run_id is per-run.
  Reader (decision 21): a scheduled AGENT reads the log and prior reports, then acts,
  escalates, or does nothing. It appends {event:'reader_ran', ts}. A far-more-frequent path —
  CEO session start, or schema-lint in CI — WARNS LOUDLY when that stamp is >10 days stale.
  ALSO ADD (from the Pydantic AI harvest, which is prior art, not speculation):
    - A PRE-FLIGHT cost ceiling that stops a run at the next request boundary, not a post-hoc
      report. Two runs burned 540k and 1.58M tokens returning nothing.
    - TYPED FAILURE PROPAGATION. Their contract raises on retry exhaustion and NEVER returns
      nothing. Our 12-agents-returned-nothing incident is a SWALLOWED SIGNAL, not only an
      oversized payload. The STALLED envelope detects the symptom; propagating a typed failure
      removes the cause. Build both.
  DONE WHEN: a stalled run is visible in the log within one run; a stale reader warns at session
             start; a run exceeding the ceiling stops at a request boundary.

STEP 8 · The one fan-out engine. (L)
  Collapse coding.js/design.js/research.js/qa.js/capability-gap-map*.js into ONE
  .claude/workflows/fanout.js dispatching on args.kind, with per-kind config as DATA in
  .claude/workflows/_configs/<kind>.json. The thinking layer and qa.js become two configs of one
  engine, validated by the same schema-lint.
  Thinking layer shape: framing -> N independent verdicts from different objective functions ->
  fresh-context synthesis. NO CROSS-CRITIQUE ROUND for generative decisions. Perspective sets by
  decisionType are already specified in target-system-spec/workflows.md:307.
  Add the mechanical drift check between gate-logic.mjs and the copies qa.js inlines — the
  Workflow runtime has NO module-import support, which is why they are hand-mirrored.
  At irreversible tier route one verifier CROSS-FAMILY (decision 13/14: Codex CLI, which is NOT
  installed and NOT on the allowlist — install and wire it, with the proven graceful-degradation
  contract: log status: codex_unavailable, never hard-block).
  DONE WHEN: one engine, N config files, zero peer scripts; qa.js's advertised "3 independent
             adversarial verifiers" is either true or renamed.

STEP 9 · Model routing tier map. (S) [decision 15 — currently has NO build step in the old plan]
  .claude/model-routing.yml universal: tiers {depth, default, cheap, orchestration, adversary}
  -> concrete IDs, plus default per-agent assignments. .claude/model-routing.local.yml
  project-owned overrides, protected by gsa-sync fit-precedence.
  A generator writes the resolved `model:` into agent frontmatter; schema-lint FAILS when
  frontmatter disagrees with the map. The weekly reader also runs GET /v1/models and reports
  dead pins and available bumps — advisory.
  WHY: 51 agent files pin literal dated IDs; the Opus 4.8 bump recorded 2026-05-28 was never
  applied; two generations have shipped since.
  DONE WHEN: one line changes a generation everywhere; disagreeing frontmatter fails the build.

STEP 10 · Work-arrival contract. (S) [decision 17 — no build step in the old plan]
  Universal: every task carries task_id, goal, acceptance criteria, durable record.
  Project-owned .claude/arrival.local.yml binds the rail; schema-lint validates that `rail`
  resolves to a configured MCP server or the literal `terminal`.
  Beamix binds linear, PULL-ONLY: add it to .mcp.json. This makes 23 dead mcp__linear__ call
  sites and ceo.md step 7 real. Rail unavailable -> log status: rail_unavailable, never block.
  NO BRIDGE, NO WEBHOOK — autonomous inbound is deliberately deferred.

STEP 11 · Context injection. (S) [decision 22, component 10]
  One advisory hook reading .claude/context-injection.yml:
    {on: <event>, when: <condition>, inject: <content>}. NEVER BLOCKS.
  First entries: reader-staleness warning at SessionStart; envelope-reach feedback; a tier
  warning when an agent opens an irreversible-tier file; and the highest-value one — inject the
  relevant DECISIONS.md entry when an agent edits a file that decision covers. That turns "read
  before acting" and "leave breadcrumbs" from prose into context.
  ACCEPTED COST, do not silently drop it: injected context is paid in tokens on EVERY matching
  call, in ~10 repos. This plan has never priced context cost.

STEP 12 · Canonical repo + gsa-sync --apply. (L)
  Move to its own repo. On apply, re-run schema-lint and tier classification against the
  RECEIVING project and refuse on failure. Adopt BMAD's per-file sha256 manifest
  (~/VibeCoding/_reference/harness/bmad-code-org_BMAD-METHOD, files-manifest.csv).
  DONE WHEN: --apply has run end-to-end on 2 NON-BEAMIX projects. Until then every hour above
             pays back in exactly one repo. Stop condition 5 covers this.

STEP 13 · Skills cut list, then the agent-file trim. (M) — DELIBERATELY LAST
  Re-run the cut with decision 12's test: "useless in EVERY project," NOT "wrong-stack for
  Beamix." Run it against step 3.5's cross-repo inventory + the 24 cloned systems
  (~/VibeCoding/_reference/, 1,150 SKILL.md vs our 146). stripe-integration and clerk-auth are
  wrong for Beamix and possibly right for a sibling.
  Then trim the 26 agent files (7,012 lines) to short form in one batch. LAST because it is the
  only cut nobody could prove is quality-neutral — it goes after the run log exists to detect a
  quality drop.

=====================================================================
RULES FOR THE BUILD — non-negotiable
=====================================================================
- WORKTREES: git -C $MAIN_REPO worktree add ... -b <branch> origin/main. NEVER branch from local
  main — it goes stale (it was at deabafd while origin was be9db29). Sanity-check the base SHA.
- QA GATE IS SACRED. Every PR risk-tiered. Irreversible tier (settings, workflows, agent files,
  hooks, migrations, billing) needs code-reviewer + security-engineer + adversary-engineer AND
  Adam's sign-off. The CEO cannot override a BLOCK. Do not merge on 1-of-3 coverage.
- VERIFY IN THE WORKTREE and paste REAL exit codes. Until step 5 lands, CI executes no code, so
  local verification is the ONLY verification. Do not accept a green check as evidence.
- ATOMIC conventional commits. One focused task per worktree.
- SESSION FILE per task at docs/08-agents_work/sessions/YYYY-MM-DD-[role]-[slug].md with
  qa_verdict and tier in frontmatter.

OPERATIONAL LESSONS — these cost real tokens, do not repeat them:
- NEVER ask an agent for a large enumeration inside a structured return. Have it WRITE the
  payload to a file and return a pointer plus counts. Natural experiment on 2026-08-09: three
  workers briefed that way landed cleanly; the one NOT briefed that way did full work and
  returned NOTHING.
- Tell every agent to finish inside budget, and that a partial structured return beats an
  unwritten perfect one. Every agent so instructed returned.
- Tell reviewers what NOT to flag, or they rediscover corrections already made.
- When briefing a premise, add "do not assume my description over what the file says." That one
  line caught a wrong premise the CEO had asserted as critical.
- Guard against dropout BEFORE any synthesis stage. If the input is empty, REFUSE.

THE METHOD RULE — it earned itself eight times in one day:
**A count produced by pattern-matching is a hypothesis, not a finding.** On 2026-08-09 eight
claims were checked against implementing files and eight were wrong, every one overstating
reality — three of them the CEO's own, including one written INTO the plan describing how to
prevent exactly this. Verify by reading the implementing file before repeating any number.
```

---

## PHASE 2 — the board attacks the build

**Do not skip this.** The entire system was designed by this system, about itself. Three separate
design lenses flagged that the 88-finding audit grounding much of it was produced by the same
same-family panel flaw it identified in `qa.js`. Nothing that did not help write this has ever
reviewed it.

Convene after Phase 1's PRs are merged, or after the last one that will merge.

**Shape — evaluation, not generation, so the rules differ.** Heterogeneous panels win for
evaluation; the no-cross-critique rule applies to *generative* decisions and does not bind here.
Independent verdicts first, then fresh-context synthesis from someone who saw none of them.

**Seats, and what each is for:**

| Persona | Attacks |
|---|---|
| `persona-adversary` | The strongest case that this rebuild made things worse. Must be routed **cross-family (Codex)** per decisions 13-14 — the panel is otherwise six agents from one model family, which is the exact flaw it exists to catch |
| `persona-risk-modeler` | Failure modes of the built system, ranked probability × severity. What breaks first in production, and what breaks silently |
| `persona-architect` | Whether the mechanisms actually compose, or whether ten components each work alone and fight each other |
| `persona-operator` / operator-experience | What it feels like to hit these gates mid-task. **This has NEVER been priced** — four design lenses separately admitted they could not cost friction |
| `persona-strategist` | Whether this was worth the opportunity cost against shipping customer features. Stop condition 6 exists for this |
| `synthesizer` | Fresh context, saw none of the above, produces the verdict |

**Questions the board must answer — these are the ones nobody has been able to answer yet:**

1. **Is the agent-file trim quality-neutral?** 7,012 lines across 26 files. Nobody could tell which
   prose does real cognitive work; the recommendation was inferred from line count and drift.
2. **What does the friction actually cost?** Every gate in this design was proposed by someone who
   admitted they cannot price it. Now it is built and can be measured.
3. **Was the evidence base verified honestly?** The 88-finding audit was produced by this system
   about itself. Re-check its load-bearing claims against the built artefacts.
4. **Adam as single point of consumption.** Sole flag-holder, sole log reader, sole approver above
   the CEO. Decision 21 removed him from the run-log loop. Did it work, or did it move the problem?
5. **Cross-project fit.** Do these tier floors and defaults actually suit the 9 live receivers, or
   only Beamix? `gsa-sync --check` produces the evidence — read it rather than assume.
6. **What did we build that nothing invokes?** Stop condition 7. Check the run log for mechanisms
   with zero invocations, and retire them.
7. **What is still enforced by prose?** Re-run the 63-rule inventory. It was 9 enforced of 63 before
   the build. What is it now, and which of the 40 mechanizable ones are still open?

**Output:** one synthesis document at `docs/08-agents_work/YYYY-MM-DD-board-review-built-system.md`
with, for each finding: what is weak, the evidence, and a specific change — not a sentiment. Then
a short list of what to change next, ranked. Findings without a named mechanism are not findings.

**The board's own stop condition:** if it recommends further research or another audit pass, that
is a signal it has nothing to say. The plan already places "any further audit or research pass" on
the not-building list, and the three hardest questions are established as having no mature prior
art. Only running the system resolves them.
