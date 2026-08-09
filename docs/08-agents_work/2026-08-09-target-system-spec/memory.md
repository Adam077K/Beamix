# Memory system — target spec

Surface: **Memory**. Scope: everything under `.claude/memory/`, the two competing
session-file locations, the memory-related rows in root `CLAUDE.md`, and the
mechanism that stops memory from lying to the agents that read it.

---

## Current state (measured, with the commands you ran)

All commands run from
`/Users/adamks/VibeCoding/Beamix/.worktrees/ceo-1-1786220343`.

```
find .claude/memory -type f | sort
find .claude/memory -type d | sort
```
→ `.claude/memory/` holds 8 files (no subdirectory except `sessions/`):

| File | Lines | Notes |
|---|---|---|
| `DECISIONS.md` | 935 | `grep -c "^### \["` → **58 entries** |
| `DECISIONS_ARCHIVE.md` | 92 | pre-2026-04-15 cold storage |
| `LONG-TERM.md` | 65 | *(task brief said 74 — wrong; measured 65)* |
| `CODEBASE-MAP.md` | 108 | header says `Updated by: CEO audit — 2026-03-19` |
| `USER-INSIGHTS.md` | 86 | header says `Updated by CMO 2026-05-23` |
| `AUDIT_LOG.md` | 27 | `grep -c "^\[20"` → 4 entries |
| `feedback_mock_data.md` | 14 | single stray fact, not one of the 6 documented stores |
| `supabase-cleanup-plan.md` | 88 | live runbook, has its own status legend already |
| `sessions/*.md` | 4 files | see below |

```
grep -c "^### \[" .claude/memory/DECISIONS.md   → 58
grep -n -i "50-entry\|cap" .claude/memory/DECISIONS.md → no hits inside the file itself
```
The **58 > 50 cap** is confirmed. The cap is stated in root `CLAUDE.md`
(`DECISIONS.md ≤ 50 entries`) and in the meta `CLAUDE.md`
(`| DECISIONS.md | ... 50-entry cap |`) — it is not stated, checked, or
enforced anywhere *inside* `.claude/memory/` itself. Nothing greps for it.

```
grep -n "^\*\*Status:\*\*" .claude/memory/DECISIONS.md
```
→ 13 of 58 entries already improvise a `**Status:**` line
(`PROPOSED`, `LOCKED`, `LOCKED & DEPLOYED`, `QA PASS ... pending Adam merge
sign-off`, …) with **no fixed vocabulary** and **no machine check** — an
organic, inconsistent precedent for exactly the field this spec formalizes.

**Two session-file locations, both documented as canonical:**
```
find .claude/memory/sessions -type f | wc -l        → 4
find docs/08-agents_work/sessions -type f | wc -l    → 142 (+ _TEMPLATE.md)
git log -1 --format="%ad %s" -- .claude/memory/sessions/
  → Fri May 29 11:47:24 2026 — last touch, 10 weeks before today (Aug 8)
git log -1 --format="%ad %s" -- docs/08-agents_work/sessions/
  → Sat Aug 8 23:17:22 2026 — touched today
```
Root `CLAUDE.md`'s memory table lists `.claude/memory/sessions/` as "Lead
session summaries," and the Documentation Gate section separately requires
every session file at `docs/08-agents_work/sessions/YYYY-MM-DD-[role]-[task].md`.
Both are asserted canonical in the same file; only one has been touched since
May.

**`.claude/memory/specs/` does not exist:**
```
ls .claude/memory/specs   → No such file or directory
```
It appears in root `CLAUDE.md`'s memory table (`Product specs`, owner CPO) and
has never existed. `docs/04-features/` already does this job per the same
file's docs table.

**Session-file line cap is fictional:**
```
wc -l docs/08-agents_work/sessions/*.md → count=142  min=5  median=45  p90=113  max=381
```
Documented cap: "Session summaries: ≤ 10 lines each." Measured median is 45,
4.5× the cap; the max is 381. Every file above 10 lines is currently in
"violation" of a rule nobody enforces or, realistically, could enforce as
written.
```
grep -l "^## Summary" docs/08-agents_work/sessions/*.md | wc -l → 18
```
18 of 142 files (13%) already carry a short `## Summary` heading as an
organic convention — a usable seed for a real, checkable version of the
≤10-line rule (see Target state).

**The five fabrications, checked directly:**

1. **Stop hook blocks merges — false.**
   `.claude/memory/DECISIONS.md:782`: *"A Stop-hook will block any `git merge`
   when the branch's session file lacks `qa_verdict: PASS`."*
   `.claude/hooks/stop.sh:4`: `# PURPOSE: Validate session hygiene at close.
   SOFT-WARN ONLY — never blocks.` The hook exists; the claimed behavior does
   not.

2. **`craft-reviewer` agent — does not exist.**
   `grep -rl craft-reviewer` hits `CLAUDE.md`, `.claude/agents/_seeds/qa-lead.md`,
   and 8 planning/session docs. `ls .claude/agents/*.md` lists 26 real agent
   files; none is `craft-reviewer.md`.

3. **Codex second opinion — invoked nowhere.**
   `grep -rn codex .claude/workflows/*.js` → zero hits. The QA workflow
   (`qa.js`) never shells out to `codex review --diff`. The mechanism is
   documented (`DECISIONS.md:278`, `qa-gate-protocol` skill, `qa-lead.md`
   seed) but no executable path calls it.

4. **Mem0 + pgvector — zero imports.**
   `grep -rl "mem0\|pgvector" apps/web/src` → 0 files.
   `grep "mem0\|pgvector" apps/web/package.json package.json` → 0 hits.
   Root `CLAUDE.md`'s stack table still asserts, present tense:
   `Memory: Mem0 (primary) + Anthropic Memory Tool (auto-fallback after 3
   retries)`.

5. **"Permission classifier" — one session file, nothing else.**
   `grep -rl "permission classifier"` → exactly
   `docs/08-agents_work/sessions/2026-06-10-ceo-auth-dedup-hardening.md`. No
   hook, script, or agent file implements it. The claim originates and ends
   in a single prose sentence.

**Why memory got to carry five live fabrications unchecked:**
```
grep -n "memory" .claude/qa-tier-floor.yml
→ .claude/memory/** → tier: trivial → "Memory files — append-only, no runtime impact"
```
Trivial tier means, per the QA-gate table, "Haiku schema-lint hook only
(auto-pass)." `schema-lint.js` exists (360 lines) but:
```
grep -rn "schema-lint" .claude/settings.json .github/workflows/*.yml → 0 hits
```
It is wired into nothing. So the actual review pipeline that ran on every
past edit to `DECISIONS.md` was **none** — not "trivial-tier light review,"
literally zero. That is how a false claim about `stop.sh`'s own behavior sat
54 lines from `stop.sh`'s own header (which says the opposite) for weeks
without anything, human or automated, cross-checking the two.

**What worked — `LONG-TERM.md` as the model:**
65 lines against a 100-line cap (task brief said 74/100 — the shape claim
holds even if the exact number was off). Index-shaped: `- Fact: one line`,
never narrative. Append-and-compress, never freeform. Owner is singular (CEO,
end of session). No fabrication was found in it — it makes no "implemented"
claims, only preferences and config defaults, which is itself informative:
the failure mode lives specifically in the store that records *what got
built*, not the store that records *what's preferred*.

---

## Target state (the complete enumeration)

Six store types replace the current flat, undifferentiated pile of eight
files. Every store below states: **what it holds**, **its shape**, **its
bound and how the bound is enforced**, **its owner**, **whether it is
hand-written or generated**.

### 1. `.claude/memory/DECISIONS.md` — DECISION store (active window)
- **Holds:** irreversible-in-spirit choices among alternatives: architecture,
  pricing, agent roster, topology, gate design. One entry per choice.
- **Shape:** append-only. Each entry is immutable once written — a changed
  mind is a *new* entry with `Status: superseded` on the old one, never an
  edit to the old text. See schema below.
- **Bound:** ≤ 50 entries (`^### \[` count), enforced by CI (see Mechanism).
  Not "someone archives at 50" — the PR literally cannot merge past 50; the
  only way through is to archive the oldest N entries into
  `DECISIONS_ARCHIVE.md` in the same PR.
- **Owner:** any agent that makes a decision affecting others. CEO/C-suite in
  practice.
- **Hand-written.** A decision is a judgment call; nothing generates it.

### 2. `.claude/memory/DECISIONS_ARCHIVE.md` — DECISION store (cold)
- **Holds:** entries evicted from `DECISIONS.md` by the archive step. Verbatim
  copy, never re-edited.
- **Shape:** same per-entry schema as `DECISIONS.md`, oldest-first, grouped
  under a one-line archive-batch header (`*Archived YYYY-MM-DD as part of
  cap enforcement*`) so the provenance of *why* something moved is itself
  preserved.
- **Bound:** unbounded. It is cold storage, read rarely, by design cheap to
  let grow — the whole point of an archive is to not need a second cap.
- **Owner:** whichever agent/CI step performs the archive move (mechanical,
  not a judgment call).
- **Hand-written at creation, mechanically relocated thereafter.**

### 3. `.claude/memory/LONG-TERM.md` — standing context (the model file)
- **Holds:** durable, low-churn facts about *how this system should be run*:
  user preferences, stack defaults, standing conventions. Not decisions
  (no rationale/alternatives), not measured facts (no filesystem truth to
  check) — a third thing: curated defaults that change rarely and are worth
  paying to keep short.
- **Shape:** index-only. One bullet per fact. No narrative, no rationale
  paragraphs. This is the shape every other store is graded against.
- **Bound:** ≤ 100 lines, enforced by CI. Unlike `DECISIONS.md`, this file is
  *edited* (compressed), not strictly append-only — "compress when full" is
  the documented and correct behavior, so its CI check is a hard line-count
  ceiling with no archive escape valve (compression IS the escape valve).
- **Owner:** CEO, updated at the end of every session.
- **Hand-written**, but narrow enough in scope (preferences, not claims about
  what exists) that it has never fabricated anything — keep it exactly as
  shaped.

### 4. `.claude/memory/CODEBASE-MAP.md` — FACT store (generated)
- **Holds:** what the codebase currently looks like — route tree, API routes,
  stack versions, latest migration. Everything in this file must be true
  *because a script read the filesystem*, never because an agent typed it
  from memory.
- **Shape:** deterministic output of `.claude/scripts/gen-codebase-map.js`
  (new — see Mechanism), which walks `apps/web/src/app/**`,
  `apps/web/src/app/api/**`, `apps/web/package.json`, and
  `apps/web/supabase/migrations/**`, and re-emits the file whole. A header
  comment records `<!-- generated: <git-sha-of-inputs> -->`.
- **Bound:** implicit — size tracks the real codebase, not agent verbosity.
  No cap needed because nothing accumulates; each run replaces the whole
  file.
- **Owner:** the generator script, triggered on merge to `main` touching
  `apps/web/src/app/**` or `apps/web/supabase/migrations/**` (see
  Mechanism). No agent hand-edits this file — a hand-edit is now a
  contradiction-in-terms for this store and should be treated as a bug.
- **Generated, never hand-written.** This is the direct fix for "hand-
  maintained, stale since 2026-03-19, still says `saas-platform/` months
  after the April monorepo move."

### 5. `.claude/memory/USER-INSIGHTS.md` — sourced-finding store
- **Holds:** customer pain language, JTBD, ICP segments — always attributed
  to a source (research run, survey, interview).
- **Shape:** existing per-entry format is correct and unchanged: `Pain →
  Customer quote → Frequency → JTBD → Source`. Keep it; it already requires
  a citation per entry, which is the right discipline for this store.
- **Bound:** ≤ 150 lines, enforced by CI (new cap — none existed; current
  86 lines gives headroom before the enforced ceiling bites).
- **Owner:** CMO and CPO exclusively (already documented; keep as the only
  two authorized writers — this is a content-integrity rule worth the
  narrow ownership).
- **Hand-written**, sourced.

### 6. `.claude/memory/AUDIT_LOG.md` + `.claude/memory/AUDIT_LOG_ARCHIVE.md` — gate-event store
- **Holds:** the record that a gate *fired* and what it found — MERGE /
  DEPLOY / SECURITY / SCHEMA / CONFIRM entries. This is distinct from
  `DECISIONS.md` (a choice with rationale) and from the run log (ambient,
  auto-captured, high-volume): it is a hand-written, typed, one-paragraph
  summary written by the specific agent that owns that gate, immediately
  after the gate resolves.
- **Shape:** unchanged existing format:
  `[YYYY-MM-DD HH:MM] | TYPE | Agent | Scope | Outcome | Actions taken`.
  Confirmed live and referenced by `qa-lead.md` and `devops-engineer.md` —
  keep as-is.
- **Bound:** ≤ 75 entries in the active file (mirrors `DECISIONS.md`'s
  density — these entries run long), archived to `AUDIT_LOG_ARCHIVE.md`
  (new file, unbounded, same archive-batch-header convention as
  `DECISIONS_ARCHIVE.md`) beyond that, enforced by CI.
- **Owner:** qa-lead (SECURITY), devops-engineer (DEPLOY), database-engineer
  (SCHEMA), any agent (CONFIRM, MERGE).
- **Hand-written**, immediately post-gate — this is the one store where
  "hand-written" is correct because a gate's *verdict* is a judgment
  artifact even though its *inputs* (test results, findings) may be
  generated.

### 7. Session files — `docs/08-agents_work/sessions/*.md` (sole canonical location)
- **Holds:** one file per completed task: what shipped, QA verdict, decisions
  made, what's next. The narrative memory of the system.
- **Shape:** mandatory YAML frontmatter (formalizing what root `CLAUDE.md`'s
  Documentation Gate already half-specifies) —
  ```yaml
  ---
  date: YYYY-MM-DD
  role: <agent-role-slug>
  task: <short-task-slug>
  branch: <git-branch-name>
  tier: trivial | lite | full | irreversible
  qa_verdict: PASS | BLOCK | N/A
  ---
  ```
  followed by a **mandatory `## Summary` section, ≤ 10 lines**, then a
  free-length body (sections: What Was Done, Files Changed, Decisions Made,
  What's Next, Blockers). The 10-line cap now applies to the *part meant to
  be skimmed cheaply* (formalizing the 18-file organic convention already
  found), not to the whole file — which resolves the tension between the
  documented "≤10 lines" rule and the measured median of 45 without
  pretending real work fits in 10 lines.
- **Bound:** file *count* is unbounded by design (it is the historical
  ledger — one entry per task, forever, same reasoning as
  `DECISIONS_ARCHIVE.md`). Each file's `## Summary` block is capped at 10
  lines by CI; the body has no hard cap (guideline: keep it proportional to
  the work, not to an arbitrary number).
- **Owner:** whichever lead/CEO closes the task.
- **Hand-written.**
- **`.claude/memory/sessions/` is deleted.** Its 4 files
  (`2026-03-17-design-lead-dashboard-redesign.md`,
  `2026-04-06-marketing-showcase-audit.md`,
  `2026-04-06-marketing-showcase-handoff.md`,
  `2026-05-29-cmo-w2.2-weekly-digest-template.md`) are moved verbatim into
  `docs/08-agents_work/sessions/` (no content loss, no renaming needed —
  their date-prefixed names already fit the target convention and don't
  collide with existing files there). The directory is removed. Root
  `CLAUDE.md`'s memory table row for `.claude/memory/sessions/` is deleted.
  This is the direct fix for the two-canonical-locations problem — there is
  now exactly one.

### 8. `.claude/memory/supabase-cleanup-plan.md` — agent-scoped runbook (kept as its own category)
- **Holds:** a live todo-list for one specialist agent (`supabase-cleaner`):
  what's been audited, queued, applied-staging, applied-prod.
- **Shape:** already has its own status legend
  (`proposed / queued / applied-staging / applied-prod`) — good precedent,
  unchanged.
- **Bound:** none imposed by this spec; it is a working document for one
  narrow agent, not an accumulating log. If it grows past ~150 lines,
  `supabase-cleaner` compresses it the same way `LONG-TERM.md` compresses.
- **Owner:** `supabase-cleaner` exclusively — confirmed live and referenced
  4 times in `.claude/agents/supabase-cleaner.md` (read on every run, write
  on every pass).
- **Hand-written.** Explicitly exempted from the DECISION/FACT taxonomy: it
  is neither a decision nor a system fact, it's a task tracker for one
  agent's one job. Keeping this pattern legitimizes narrow specialist
  runbooks without inviting every worker to invent its own memory file —
  the exemption is granted *once*, by name, not as a general license.

### 9. The run log — NOT under `.claude/memory/`
- **What it is:** the already-locked OTEL trace/span stream, plus a
  hook-emitted structured sidecar at `.claude/run-log/YYYY-MM-DD.jsonl` —
  one JSON line per significant event: agent spawn (with depth), tool call,
  hook fire, QA verdict, cost figure. Auto-emitted by the hook layer and the
  OTEL SDK; no agent hand-writes it.
- **Shape:** high-volume, raw, ambient. The opposite of memory's "curated,
  small, index-shaped."
- **Bound:** date-partitioned files with a 7-day local retention (OTEL
  backend, wherever it's configured, is the durable copy; the local JSONL
  is a cheap grep-window, not the archive). Enforced by a rotation cron, not
  by an agent remembering to delete old files.
- **Owner:** the hook/OTEL layer. No agent writes to it directly.
- **Relationship to memory (this is the answer to "how does it relate"):**
  1. Memory entries **cite** the run log as provenance
     (`` `IMPLEMENTED: .claude/hooks/stop.sh` `` plus, optionally, a trace
     ID) — they never **copy** it. The run log is evidence; memory is the
     curated claim the evidence backs.
  2. Generated FACT stores (`CODEBASE-MAP.md` today; any future one) may
     **query** the run log to derive measured facts ("which hooks actually
     fired in the last 30 days" is a real question the run log can answer
     and hand-typed memory cannot).
  3. Cost figures live **only** in the run log and stay advisory
     (already-locked decision) — memory never restates a cost number as
     fact, because cost drifts every run and a hand-typed number in
     `DECISIONS.md` would go stale the same way `craft-reviewer` did.
  4. Nothing in the run log is ever "promoted" into memory automatically —
     promotion (an agent deciding a pattern in the run log is worth a
     `DECISIONS.md` entry) is always a hand-written act, keeping memory
     small by construction rather than by discipline.

### 10. Deleted: `.claude/memory/specs/`
Never existed. Redundant with `docs/04-features/` (already documented,
already owned by CPO, already the real location product specs live). The row
is removed from root `CLAUDE.md`'s memory table rather than the directory
being created to satisfy the documentation — the documentation was wrong, not
the codebase.

### 11. Deleted: `.claude/memory/feedback_mock_data.md`
References `saas-platform/src/app/(protected)/dashboard/page.tsx` (pre-
monorepo path, doesn't exist post-April-18 restructure) and a
`USE_MOCK_DATA` flag confirmed absent from current `apps/web/src`
(`grep -rl USE_MOCK_DATA apps/web/src` → 0 hits). It is not one of the six
documented stores, was never wired to any agent's read list, and its one
piece of guidance now points at dead code. Nothing to merge — the fact it
records is no longer true.

### 12. Deleted claim: Mem0 + pgvector in `CLAUDE.md`'s stack table
See "Format & schema" → item 6 below for the exact edit. Answered here: **the
claim is deleted, not built.**

---

## Changes: kept / cut / merged / added

**Kept (8):** `DECISIONS.md` (schema extended, cap now enforced) ·
`DECISIONS_ARCHIVE.md` (unchanged) · `LONG-TERM.md` (unchanged — it's the
model) · `CODEBASE-MAP.md` (ownership changes from hand-written to
generated, file itself kept) · `USER-INSIGHTS.md` (cap added, otherwise
unchanged) · `AUDIT_LOG.md` (cap added, otherwise unchanged) ·
`supabase-cleanup-plan.md` (unchanged, formally recognized as its own
category) · `docs/08-agents_work/sessions/` (schema formalized, becomes sole
location).
*Rationale, one line each: these either already work (`LONG-TERM.md`,
`supabase-cleanup-plan.md`), or are structurally sound and only need a bound
or an ownership fix, not a redesign.*

**Cut (4):** `.claude/memory/specs/` documentation row — never existed, and
`docs/04-features/` already does the job. `.claude/memory/sessions/`
directory — 10-week-dead duplicate of the live location. `feedback_mock_data.md`
— points at code and a flag that no longer exist. Mem0/pgvector stack-table
claim — zero imports anywhere, nothing to preserve.
*Rationale: each is a documented store or claim with zero live referents —
cutting them removes exactly the gap where "documented but never true" lives.*

**Merged (1):** the 4 files in `.claude/memory/sessions/` move verbatim into
`docs/08-agents_work/sessions/`, collapsing two "canonical" locations into
one.
*Rationale: no content is lost; the merge is the fix for the dual-canonical-
location bug itself, not a separate cleanup.*

**Added (4):** `AUDIT_LOG_ARCHIVE.md` (overflow target, mirrors
`DECISIONS_ARCHIVE.md`) · the run log (`.claude/run-log/*.jsonl` + OTEL,
already locked at the architecture level but not previously named as a
memory-adjacent store with its own bound and relationship spelled out) ·
`.claude/scripts/gen-codebase-map.js` (turns `CODEBASE-MAP.md` from
hand-written into generated) · `.claude/scripts/memory-truth-check.js` +
`.github/workflows/memory-truth-check.yml` (the mechanism — see next
section).
*Rationale: each is required by one of the six things the brief asked this
spec to answer — none is speculative scope-creep.*

---

## Format & schema

### 1. `DECISIONS.md` / `DECISIONS_ARCHIVE.md` entry schema (extends the existing `## Format` block — adds `Status`, `Verified`, `Superseded by`)

```
### [YYYY-MM-DD] — [Title]
**Decision:** [What was decided]
**Rationale:** [Why — alternatives considered]
**Decided by:** [Agent/role]
**Affects:** [Which agents / files / systems]
**Reversible?** [Yes / No / Hard]
**Status:** proposed | implemented | superseded
**Verified:** `IMPLEMENTED: <path>[:<anchor-string>]` (one per concrete
  artifact the decision claims exists — zero or more) — OR the literal line
  `**Verified:** N/A — no concrete artifact (strategy/pricing/process
  decision)` when the decision names no file/hook/agent to check.
**Superseded by:** [date + title anchor] — present only when Status is
  `superseded`.
```

Path resolution for `IMPLEMENTED:` tokens (used by the CI check):
- literal repo-relative path (`.claude/hooks/stop.sh`) → checked as-is.
- `hook:<name>` → expands to `.claude/hooks/<name>`.
- `agent:<name>` → expands to `.claude/agents/<name>.md`.
- `skill:<name>` → expands to `.claude/skills/<name>/SKILL.md`.
- `workflow:<name>` → expands to `.claude/workflows/<name>.js`.
- optional `:<anchor-string>` suffix — a literal substring that must appear
  **inside** the resolved file (not just the file existing). This is what
  would have caught the `stop.sh` fabrication: the correct tag for that
  entry is `` `IMPLEMENTED: hook:stop.sh:hard-block` `` — the file exists,
  but `stop.sh` contains `SOFT-WARN ONLY — never blocks`, not `hard-block`,
  so the anchor check fails.

### 2. Session file frontmatter (mandatory, all 6 keys)
```yaml
---
date: YYYY-MM-DD
role: <agent-role-slug>          # e.g. ceo, cto, backend-engineer
task: <short-task-slug>
branch: <git-branch-name>
tier: trivial | lite | full | irreversible
qa_verdict: PASS | BLOCK | N/A
---
```
Body requires a `## Summary` heading immediately after frontmatter, content
≤ 10 non-blank lines before the next `##`. Everything after that is
free-length.

### 3. `LONG-TERM.md` — unchanged, documented here for completeness
```
- <One-line fact.> [optional: source/date]
```
Grouped under stable `##` category headers (`User Preferences`, `Project
Stack`, …). No new fields — it already works.

### 4. `AUDIT_LOG.md` / `AUDIT_LOG_ARCHIVE.md` — unchanged
```
[YYYY-MM-DD HH:MM] | TYPE | Agent | Scope | Outcome | Actions taken
```
`TYPE ∈ {MERGE, DEPLOY, SECURITY, SCHEMA, CONFIRM}` (existing enum, kept).

### 5. `CODEBASE-MAP.md` — generated header (new)
```
<!-- generated: <git-sha-of-apps/web/src+migrations at generation time> -->
<!-- generator: .claude/scripts/gen-codebase-map.js -->
```
Everything below the header is script output. A hand-edit below this header
is a lint violation (see Mechanism, check 9).

### 6. Root `CLAUDE.md` stack-table edit (Mem0/pgvector — the claim is deleted)
Replace:
```
Memory:     Mem0 (primary) + Anthropic Memory Tool (auto-fallback after 3 retries)
```
with:
```
Memory:     Flat files under .claude/memory/ — no vector store. Revisit only
            if the memory corpus exceeds what fits in a single context read
            (~2,000 lines total across all stores as of 2026-08-09).
```
The `mem0-patterns` and `pgvector-rag-beamix` skills stay in the skills
library as dormant reference material (a skill describing *how to* adopt a
pattern is not a claim that it's adopted) — only the present-tense stack-
table assertion is fabricated and only that line changes.

---

## The mechanism that keeps this honest

Name: **`memory-truth-check`** — a new, always-required, deterministic CI
job. Two new files:

- `.claude/scripts/memory-truth-check.js` — the check logic.
- `.github/workflows/memory-truth-check.yml` — triggers it on every PR
  touching `.claude/memory/**`, `docs/08-agents_work/sessions/**`, or
  `CLAUDE.md`; required in branch protection (not gated by QA risk tier —
  this runs regardless, because it is cheap, deterministic, and exactly the
  kind of check `.claude/qa-tier-floor.yml` currently (wrongly) assumes
  "trivial + unwired schema-lint" already covers).

What it does, in full (every check below is a hard FAIL, not a warning,
because "the agent should remember" is exactly the failure mode this
replaces):

1. **Anti-fabrication (existence).** For every `` `IMPLEMENTED: <path>` ``
   token added or changed in the diff, resolve the path (literal or
   `hook:`/`agent:`/`skill:`/`workflow:` alias) and `fs.existsSync` it. FAIL
   listing file:line for every miss. This alone would have caught
   `craft-reviewer` (no such agent file), the `permission classifier` (no
   such hook), and Mem0/pgvector (no such import) the moment anyone tried to
   tag them as implemented.

2. **Anti-fabrication (behavior anchor).** For every token with an
   `:<anchor-string>` suffix, `grep -F` the anchor inside the resolved file.
   FAIL if absent. This is what catches claims that name a file that *does*
   exist but doesn't do what's claimed — the `stop.sh` case.

3. **Opt-out must be explicit.** Any entry with `**Status:** implemented`
   must contain at least one `IMPLEMENTED:` token in its block, **or** the
   literal `**Verified:** N/A — no concrete artifact` line. A `Status:
   implemented` entry with neither is a FAIL. This closes the loophole where
   an agent avoids the check simply by not tagging anything.

4. **`DECISIONS.md` cap.** Count `^### \[` in the post-diff file. FAIL if
   > 50, with a message naming how many entries must move to
   `DECISIONS_ARCHIVE.md` to pass.

5. **`LONG-TERM.md` cap.** Count non-blank lines. FAIL if > 100.

6. **`USER-INSIGHTS.md` cap.** Count non-blank lines. FAIL if > 150.

7. **`AUDIT_LOG.md` cap.** Count `^\[20` entries. FAIL if > 75.

8. **No-regression: dual session locations.** FAIL if
   `.claude/memory/sessions/` exists at all, with the message "canonical
   session location is `docs/08-agents_work/sessions/` — do not resurrect
   the split." (The directory is deleted as part of this spec; this check
   stops it from silently coming back.)

9. **No-regression: documented-but-absent stores.** Extract every literal
   `.claude/memory/...` path mentioned in root `CLAUDE.md`'s memory table.
   FAIL if any such path does not exist on disk. This is the general form of
   the `specs/` bug — it catches *any future* row someone adds to the table
   without actually creating the store, not just this one instance.

10. **Session frontmatter schema.** Every new/changed file under
    `docs/08-agents_work/sessions/*.md` must parse as YAML with exactly the
    6 required keys, `tier` and `qa_verdict` matching their enums. FAIL
    otherwise.

11. **Session `## Summary` cap.** Every new/changed session file must
    contain a `## Summary` heading whose block (to the next `##`) is
    ≤ 10 non-blank lines. FAIL otherwise.

12. **`CODEBASE-MAP.md` hand-edit guard.** If the diff touches
    `.claude/memory/CODEBASE-MAP.md` below its `<!-- generated: -->` header
    line and the commit is not authored by the
    `gen-codebase-map.js` bot/step, FAIL with "this file is generated —
    edit `apps/web/src/app/**` and let the generator regenerate it."

Regeneration itself (`gen-codebase-map.js`) runs as a separate, non-blocking
scheduled/post-merge job (nightly, and on every merge to `main` that touches
`apps/web/src/app/**` or `apps/web/supabase/migrations/**`) — it is
deliberately **not** a PR-blocking step on unrelated app-code PRs, to avoid
coupling every feature PR to a memory-doc regeneration. Staleness is bounded
by "at most one day old," which is enough for a FACT store nobody is meant
to read as of-the-second truth.

This single job (checks 1–3) is the direct answer to "the CI check that
kills all five fabrications": existence (1) catches `craft-reviewer`,
`permission classifier`, and Mem0/pgvector the moment they're tagged;
existence+anchor (2) catches `stop.sh`'s behavior claim; and the Codex
fabrication is caught the same way existence would be, the moment anyone
tags `` `IMPLEMENTED: workflow:qa:codex review --diff` `` against
`qa.js` — the anchor string `codex review --diff` is not present in the
file, so it fails exactly like `stop.sh` does. Checks 4–9 are the "bounds by
construction" answer: none of them is a number an agent has to remember,
each is a `> N` comparison that fails a build.

---

## Open questions

The mechanism has one honest gap, not papered over: **the tag is opt-in.**
Nothing stops an agent from writing an untagged prose claim
("X is now implemented") that names a real-sounding mechanism without ever
using the `` `IMPLEMENTED:` `` token — `memory-truth-check` only verifies
claims that *choose* to be checkable. The mitigation is social, not
mechanical: `code-reviewer`'s existing prose/advisory pass (blast-radius:
docs are advisory, per the already-locked QA design) should flag
claim-shaped sentences ("blocks," "enforces," "is implemented in," "is now
live") that lack an adjacent `IMPLEMENTED:` tag, as a style nit — advisory,
not blocking, because full claim-detection over free English is not a
deterministic problem and pretending otherwise would just move the
fabrication one layer down (a flaky detector agents learn to route around).
Whether that advisory nit is worth wiring into `code-reviewer`'s existing
pass, or left as a norm enforced by whoever reads the diff, is the one thing
this spec did not resolve — it's a judgment call about how much friction to
add to writing a decision, not an architecture question, and it's cheap to
add later without touching anything else in this document.
