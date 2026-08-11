---
date: 2026-08-09
role: ceo
session: ceo-agent-system-rebuild
task: Close the un-grilled design branches on the locked agent-system architecture (handoff action #2), then a second grill round on the envelope, acceptance criteria, cross-project fit and run-log consumption; plus clone the 24 reference agent/skill systems locally for study
tier: trivial
qa_verdict: N/A
qa_note: Docs-only. No source, agent, skill, workflow, hook, or CI file changed. Planning-only per the standing lock — nothing here is built.
pr: none
branch: ceo-2-1786220344
---

# CEO Session — three grilled branches closed

## Outcome

Worktree fast-forwarded `deabafd` → `be9db29` (verified against GitHub's `main` via `gh api`, not the local ref —
per the standing lesson that `origin/main` can be stale). Clean, no local commits lost.

Ran `/grill-me` on the three branches the 2026-08-09 handoff left open. Five questions, five answers, all recorded
as decisions 15-17 in `2026-08-09-AGENT-SYSTEM-ARCHITECTURE.md`. The architecture doc's "smaller branches not yet
grilled" open item is now closed.

**15 · Model routing** — compiled tier map. Agent frontmatter declares a `tier:`; a generator writes the resolved
`model:`; `schema-lint.js` fails the build on disagreement. Five tiers (`depth`/`default`/`cheap`/`orchestration`/
`adversary`), with `adversary: codex` putting decisions 13-14's cross-family routing into data. Propagation splits
by who holds the knowledge: universal tier→ID map + defaults, project-owned per-agent overrides.

**16 · BLOCKED** — auto-invokes the thinking layer, which resolves and re-dispatches; Adam is not interrupted.
Bounded at two panel runs per `task_id`, counted in the run log. The panel may advise on an irreversible-tier action
but never authorize one (decision 9). Adds `task_id` and `status: BLOCKED` to the run-log spec.

**17 · Work arrival** — universal contract (`task_id`, goal, acceptance criteria, durable record) with a
project-owned rail binding. Beamix binds Linear, **pull-only**: one `.mcp.json` entry, no bridge. Work still does not
arrive while Adam is away — deferred deliberately, not smuggled in, per stop condition 4.

## Findings that changed the picture

Each was verified by direct inspection this session, and each is the same declared-never-wired pattern the rebuild
already identified in `mcpServers:` and the QA gate.

- **`.mcp.json` has exactly one server: `supabase`.** No `linear`, no Telegram — while 23 files call
  `mcp__linear__*`, `ceo.md` declares `linear` in its own `mcpServers`, and `ceo.md` step 7 ("post ONE Linear
  comment") is the mandated close-out of every ticket. Two of the three arrival rails in `ceo.md`'s own description
  are prose. **How work arrives today: Adam pastes into a terminal.**
- **`BLOCKED` is executable in exactly one file** — `coding.js`, which is on the not-being-built list. The only code
  that handles it is scheduled for deletion. `schema-lint.js:285` lints the *prose* describing BLOCKED, not any
  handling of it. "Max 3 retries per worker" (`cto.md:238`) and "max 2 re-briefs" (`design-lead.md:299`) count
  nothing. 123 mentions across 26 agent files, 8 of 144 session files, zero counters.
- **The old BLOCKED escalation was "Telegram binary-ping"** (`ceo.md:198`) — through the unwired rail. Decision 16
  replaces it.
- **The run log could not see a BLOCKED return.** Spec'd statuses are `completed` and `STALLED`, so a worker that
  correctly refuses to guess logged identically to one that shipped the feature — decision 4's own logic
  (envelope reaches are the highest-signal data) with its complement uninstrumented.
- **Two model notations are live and disagree.** 51 agent files pin literal dated IDs; workflow scripts pass
  aliases; the Agent tool's own schema accepts only the alias enum (`sonnet|opus|haiku|fable`). The Opus 4.8 bump
  was recorded as available 2026-05-28 and never applied; two generations have shipped since. The rot is proven,
  not hypothetical — which is why the map, not the 51 files, is the source of truth.

## Round 2 — decisions 18-21

Four more branches grilled after Adam asked to continue and develop the plan.

**18 · Capability envelope** — a machine-readable `envelope.json` (`skills[]`, `mcps[]`, `tools[]`, `paths[]`) written
at dispatch; `pre-tool-use.sh` logs out-of-envelope calls and never blocks. Until now the envelope had no definition
anywhere in any rebuild doc, which left decision 4 — "the highest-signal data the system can collect" — enforced by
prose.

**19 · Acceptance criteria** — `{id, text, check, verified_by: command|judge}`. A failed command criterion is a
deterministic BLOCK through the existing P1-override; a failed judged criterion enters findings and must survive
adversarial verification first. **Requires plumbing that does not exist:** `qa.js` has zero `args.` references and
its five dimensions are all generic code-quality lenses. `spec_conformance` is nowhere on main.

**20 · Propagation + sequencing** — target is the 9 live sibling repos plus Beamix. `gsa-sync --check` inserted as
step 3.5 (read-only, produces the cross-repo inventory the cut test needs); `--apply` stays at step 9.

**21 · Run-log consumption** — a reader agent consumes the log and acts or escalates, removing Adam from the loop.
**One hole left open and flagged, not closed: who checks the reader ran?** Proposed but not locked — the reader
stamps `last_run`, and a far-more-frequent path (CEO session start, or `schema-lint.js` in CI) warns when it goes
stale. Awaiting Adam.

## Measurement that replaced two open questions

**Cross-project fit was never an open question — it was an unmeasured fact.** 11 repos carry the system. Eight are
hand-copied clones of Beamix's 26/144/7/13 baseline; `adamos` is deliberately divergent with **11 hooks to Beamix's
7**; and `hitstampjavagame`/`ml2`/`test1` are stale forks with the pre-cleanup corpus, no tier-floor, and **zero
commits in 90 days** — out of scope by data. **The ROI thesis was understated:** `etsyc` (689 commits/90d) and
`evalove` (385, committed today) both out-commit Beamix. This system's busiest consumer is not the repo it is built in.

## Reference systems cloned

24 of 25 repos cloned shallow to `~/VibeCoding/_reference/` (406M, **1,150 `SKILL.md` files** vs Beamix's 146).
Full inventory and study guide: `docs/08-agents_work/2026-08-09-reference-systems-local.md`.

**Headline:** hooks are where Beamix is furthest behind, on the one axis its own doctrine calls load-bearing.
Beamix has 7. `open-gsd/gsd-core` has 78, `gsd-build/get-shit-done` 54, `cloudflare/agents` 41. This repo archived
GSD's *agents* in 2026-05-16 and never took its hook library — the actually-transferable half.

**Two assumptions corrected by looking:** `yc-software/qm` has **zero agents and zero hooks** — it is a skill-format
innovation (`requiredCapabilities` frontmatter), not an agent organization, so decision 6 was right to copy the
mechanism and nothing else. And `buildermethods/agent-os` ships 22 files with no roster, confirming the 2026-08-08
finding rather than contradicting it.

**Provenance:** all 24 are third-party content — the `provenance: untrusted` case component 1 exists for. Reading is
free; copying into `.claude/skills/` or `.claude/memory/` is the gated path.

## Shipped — the rebuild's first code

Adam lifted the planning-only lock for two changes; a third fell out of reviewing them. All three merged in
dependency order, all irreversible tier, all with 3-of-3 reviewer coverage.

| PR | Commit | Change |
|---|---|---|
| #198 | `bd8e7d0` | `qa-tier-floor.yml` pattern gaps — `MANIFEST.json` and `settings.json*` to irreversible, one latent parser hazard removed |
| #196 | `0471927` | `settings.json.proposed` — restored the `PreToolUse` + `Stop` registrations whose absence would have unwired all enforcement on apply |
| #197 | `46f4ddd` | `schema-lint.js` wired into CI; stale `maxTurns` bound corrected `[5,30]`→`[5,60]` |

**Step 1 of the plan's sequence is done.** `schema-lint.js` now runs on every PR (26 pass, 0 fail, exit 0), and
`.claude/agents/**` — the highest tier in the repo's own classifier — finally has its purpose-built checker running.
This repository's CI executes code against a diff for the first time.

Merge order was deliberate: #198 first, so no window existed in which #197's new lint was live while the
`MANIFEST.json` bypass that weaponises it was still open.

**Verified on `main` by command after merge**, not from merge output: the three tier-floor rules present, the
schema-lint step and SHA-pinned `setup-node` present, both hook registrations present, and `schema-lint` passing
26/0 at exit 0.

## The method finding

Seven claims were checked against implementing files today. **All seven were wrong, and every one overstated
reality** — two inherited from a prior audit, one from a subagent, and three my own, including one I wrote into the
plan document describing how to prevent exactly this. Full table in the handoff.

The lesson is not "be more careful." It is that **a relay without a resolver produces fabrications regardless of who
relays.** That is decision 8's case, demonstrated seven times in a day, and it is why decision 19 splits
`verified_by: command` from `verified_by: judge`.

A related natural experiment ran unplanned: three audit workers were briefed to write payloads to a file and return
only a pointer; all three landed cleanly. The one agent not briefed that way — QA-Lead — did full investigation and
stalled with no structured output, and its findings were recovered only because an interim message happened to
arrive first. That is precisely the failure component 5's STALLED envelope exists to catch.

## Not done / carried forward

- **Handoff action #1 — re-run the skills cut list — is still open**, but is no longer blocked on judgment. It now
  has real data: 1,150 external `SKILL.md` files plus 9 live sibling repos, with `gsa-sync --check` (step 3.5)
  producing the cross-repo inventory the "useless in every project" test requires.
- **Decision 21's open hole** — who checks the reader agent ran. Proposal recorded, awaiting Adam.
- **Still genuinely open, and not resolvable by more reading:** what friction costs (four design lenses separately
  admitted they cannot price a mid-task denial), and whether the 88-finding audit that grounds much of this was
  verified honestly. The plan puts "any further audit or research pass" on the not-building list; only running the
  system resolves these.
- Nothing built. The lock holds: planning only until Adam says build.
- The QA gate remains the one item flagged to pull forward regardless of sequence — right now anything can merge,
  including work from this rebuild.

## Decisions store

One consolidated entry appended to `.claude/memory/DECISIONS.md`, `Status: proposed` — deliberately **not**
`implemented`, since nothing here exists on disk yet. That is the exact claim class decision 8's resolver is built
to catch.
