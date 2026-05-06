# Internal Audit: Memory, Docs, Worktree Hygiene
> Date: 2026-05-05
> Auditor: Internal (CEO-tier)
> Scope: .claude/memory/, docs/00-brain/, docs/08-agents_work/sessions/, docs/product-rethink-2026-04-09/, worktrees

---

## P0 Findings (Top 5)

### P0-1 — 32 GB of disk wasted on merged worktrees
**72 worktrees total (1 main + 71 named). 43 of 71 are already merged to main but their directories were never removed.** Combined disk: 32 GB. Protocol says "atomic, then merge or remove" — remove half was never executed. This is a pure cost leak with no benefit. Zero recovery cost: one cleanup script removes all merged trees + their branches.

### P0-2 — DECISIONS.md contains contradictory pricing (both $49 and $79 tiers coexist)
Entry `[2026-03-06]` documents Starter/Pro/Business at $49/$149/$349. Entry `[2026-04-15]` supersedes it with Discover/Build/Scale at $79/$189/$499. The old entry was never marked SUPERSEDED or removed. Any agent reading DECISIONS.md linearly encounters the old price first. No conflict flag, no archive, just contradictory entries. The 2026-05-05 red-team decisions (R1–R7, hard reset codebase) are entirely absent from DECISIONS.md — the most consequential strategic decisions of the month are only in the auto-memory file (`project_red_team_decisions_2026_05_05.md`), which is per-machine, not committed to the repo.

### P0-3 — CODEBASE-MAP.md is a ghost document pointing at an archived codebase
CODEBASE-MAP.md still describes `saas-platform/` paths (archived April 18, 2026). The actual codebase is `apps/web/src/`. Every route listed (dashboard/overview, rankings, agents-hub, credits) maps to the pre-rethink structure. Build Lead and backend-developer reading this file will navigate to the wrong place on every task.

### P0-4 — No cross-session memory mechanism actually works
`~/.beamix/history/` directory does not exist. The CLAP directory (`~/.beamix/`) exists but contains only event logs, not agent memory. LONG-TERM.md is the only committed cross-session mechanism, but has placeholder sections ("Populated as patterns are confirmed", "Populated when same problem appears 2+ times") that were never filled. USER-INSIGHTS.md is a blank template — the project has done zero structured customer research capture. AUDIT_LOG.md has 0 substantive entries. Cross-session continuity is currently "hope the CEO reads DECISIONS.md."

### P0-5 — 20 stale unmerged worktrees spanning 16–35 days
20 worktrees are unmerged AND stale (>14 days without a commit). These include entire product feature sets (polish-auth, polish-home, polish-inbox, wave2-hebrew-rtl, wave2-e2e-tests, design-dashboard-polish, rankings-redesign) that were likely superseded by the April rethink but never explicitly abandoned. They are consuming ~15+ GB and creating branch namespace pollution. The codebase they represent targets the old `saas-platform/` structure — they are not forward-compatible with the current `apps/web/` monorepo.

---

## Worktree Sprawl Report

| Metric | Value |
|--------|-------|
| Total worktrees | 72 (including main) |
| Disk usage | 32 GB |
| Merged to main (safe to delete) | 43 |
| Unmerged stale (>14 days, no recent commits) | 20 |
| Unmerged recent (<14 days) | 9 (credibility-pass set + 3 docs branches) |
| Oldest stale worktree | `design-agents-competitors` — last commit 2026-03-30 (35 days) |
| % stale by count | 28% unmerged stale + 60% merged-but-present = 88% that should not exist |
| Estimated recoverable disk | ~28 GB (43 merged + 20 stale) |

### Stale unmerged worktrees (>14 days, NOT merged):
- `design-agents-competitors` (35d), `design-dashboard-polish` (35d), `rankings-redesign` (35d) — March codebase era
- `design-dashboard-overview` (28d), `marketing-showcase` (28d) — April pre-rethink
- `db-rethink-schema` (18d) — schema work, status unknown
- `polish-*` set: auth, automation-archive, competitors, home, inbox, paywall, public-scan, scans, settings, shell (all 16d)
- `wave2-*` set: cmd-palette-mobile, e2e-tests, hebrew-rtl, sentry-lint (all 16d)

### Cleanup script:

```bash
#!/bin/bash
# Safe cleanup: remove merged worktrees + their branches
# Run from repo root. Review list before executing.

MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')

git worktree list --porcelain | awk '/^worktree/{wt=$2} /^branch/{print wt, $2}' | while read wt branch; do
  # Skip main
  [ "$wt" = "$MAIN_REPO" ] && continue
  # Check if branch is merged to main
  branch_short="${branch#refs/heads/}"
  if git branch --merged main | grep -qx "  $branch_short\|+ $branch_short"; then
    echo "Removing merged worktree: $wt (branch: $branch_short)"
    git worktree remove --force "$wt" 2>/dev/null
    git branch -d "$branch_short" 2>/dev/null || true
  fi
done

# For stale unmerged: manual review required before deletion
echo "Stale unmerged worktrees require manual review before removal."
```

**Before running:** Tag current state: `git tag pre-cleanup-2026-05-05`

---

## Memory Health

### `.claude/memory/LONG-TERM.md`
| Metric | Value | Assessment |
|--------|-------|-----------|
| Lines | 64 of 100 cap | Within cap |
| Last updated | 2026-04-19 | 16 days stale |
| Signal-to-noise | **D** | 3 of 7 sections are placeholder boilerplate ("Populated as patterns are confirmed"). Stack section is accurate. Agent architecture section accurate. Skills section slightly off (says "max 2 skills" vs CLAUDE.md "3-5 for leads"). |
| Key gap | Red-team decisions (2026-05-05) not reflected | Critical miss |

### `.claude/memory/DECISIONS.md`
| Metric | Value | Assessment |
|--------|-------|-----------|
| Entries | 22 of 50 cap | Within cap |
| Last entry | 2026-04-17 | 18 days stale |
| Signal-to-noise | **C-** | Contains contradictory pricing entries (old $49 + new $79 without SUPERSEDED mark). 2 entries use placeholder dates (`[DATE]`, `[YYYY-MM-DD]`). Missing: red-team decisions, hard-reset codebase decision, R1-R7 locked answers, Workflow Builder tier change (R3). |
| Conflict | `[2026-03-06]` Pricing entry vs `[2026-04-15]` Pricing v2 | Active conflict |

### `.claude/memory/CODEBASE-MAP.md`
| Metric | Value | Assessment |
|--------|-------|-----------|
| Lines | 108 | No cap defined |
| Last updated | 2026-03-19 (stated) | 47 days stale |
| Signal-to-noise | **F** | Describes `saas-platform/` which was archived 2026-04-18. All route paths, file paths, and module descriptions are wrong. Agents using this to navigate will spend multiple turns finding the correct files. Requires complete rewrite targeting `apps/web/src/`. |

### `.claude/memory/USER-INSIGHTS.md`
| Metric | Value | Assessment |
|--------|-------|-----------|
| Lines | ~30 | Template-only |
| Signal-to-noise | **F (by design?)** | Entirely blank template. No customer quotes, no ICP, no pain categories filled. Pre-launch product — defensible for now but the growth-lead content plan session (2026-04-14) noted this explicitly. Should be populated or explicitly labeled "PRE-LAUNCH: NO DATA." |

### `.claude/memory/AUDIT_LOG.md`
| Metric | Value | Assessment |
|--------|-------|-----------|
| Lines | 19 | Mostly boilerplate |
| Substantive entries | 0 | The log exists but no merge, deploy, schema change, or security review has ever been logged here. Every Wave 0–4 merge happened without an AUDIT_LOG entry. The format and instructions are correct; the practice never started. |

### `~/.claude/projects/-Users.../memory/MEMORY.md` (auto-memory)
| Metric | Value | Assessment |
|--------|-------|-----------|
| Lines | 266 | Exceeds 200-line cap by 33% |
| Signal-to-noise | **B-** | Contains the most current facts (red-team decisions, vision decisions, quality bar, voice canon). But it stores LOCKED DECISIONS that should be in the repo's DECISIONS.md, not in a machine-local file. If Adam switches machines or a new agent instance starts, these decisions are invisible. The per-project memory topic files (19 files) are the best-structured part of the system. |

### `~/.beamix/history/`
| Status | Does not exist |
|--------|--------------|
| Assessment | The mechanism was designed but never implemented. `~/.beamix/` exists as a CLAP event store only. There is no working cross-session history at the shell level. This is not a blocker (repo-committed memory files serve the same purpose) but the CLAUDE.md implies it should exist. |

---

## Session Log Compliance

### Volume
| Period | Required (every significant task = 1 file) | Actual | Gap |
|--------|------------------------------------------|--------|-----|
| 2026-03-13 to 2026-03-31 | Estimated 15+ tasks | 7 session files | ~53% compliance |
| 2026-04-01 to 2026-04-30 (last 30d) | Estimated 30+ tasks | 20 session files | ~67% compliance |
| 2026-05-01 to 2026-05-05 | At least 2 tasks (red-team, current audit) | 0 session files | 0% compliance |

**Total session files: 29** (including _TEMPLATE.md). Note: docs/08-agents_work/ also contains 80+ board/design/research files that are NOT session logs but appear in the same directory, creating noise.

### Schema compliance (29 session files, excluding template):
| Field | Present in | % |
|-------|-----------|---|
| YAML frontmatter delimiters (`---`) | 22/28 | 79% |
| `date:` field | 24/28 | 86% |
| `lead:` or `agent:` field | 24/28 | 86% |
| `outcome:` or `status:` field | 25/28 | 89% |
| `decisions:` block | ~15/28 | ~54% |
| `context_for_next_session:` | ~8/28 | ~29% |

**6 session files have no YAML frontmatter at all** (2026-03-13-design-homepage.md, 2026-04-14-growth-lead-content-plan.md, 2026-04-14-research-lead-geo-content.md, 2026-04-19-ceo-wave0-wave1-complete.md, 2026-04-20-build-wave3-plan.md, 2026-04-20-growth-wave3-copy-system.md).

The best session files (2026-04-07-ceo-scan-production.md, 2026-04-25-ceo-board-meeting.md) are well-structured and include full decision blocks. The worst are raw prose without any schema.

### docs/08-agents_work/ directory structure problem
The directory contains 90+ files at root level — session files, board research, design docs, handoffs, and sub-folders all mixed together. The schema says sessions go in `sessions/`, handoffs in `handoffs/`. In practice, 70+ non-session files live at root. The `handoffs/` folder contains only `_TEMPLATE.md`.

---

## Source-of-Truth Conflicts

### Conflict 1 — Pricing (HIGH SEVERITY)
| Source | Pricing | Status |
|--------|---------|--------|
| `.claude/memory/DECISIONS.md` entry `[2026-03-06]` | Starter $49 / Pro $149 / Business $349 | NEVER MARKED SUPERSEDED |
| `.claude/memory/DECISIONS.md` entry `[2026-04-15]` | Discover $79 / Build $189 / Scale $499 | Current |
| `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md` | Discover $79 / Build $189 / Scale $499 | Authoritative |
| `~/.claude/memory/MEMORY.md` | Discover $79 / Build **$189** / Scale $499 (note: emphasizes $189 NOT $199) | Current with annotation |
| `CLAUDE.md` (project) | Discover $79 / Build $189 / Scale $499 | Current |

**Active conflict:** DECISIONS.md has both prices. Agents can read them in sequence without knowing which wins. Fix: mark old entry `**[SUPERSEDED by 2026-04-15]**`.

### Conflict 2 — Trial model (MEDIUM SEVERITY)
| Source | Trial model |
|--------|------------|
| `DECISIONS.md` `[2026-03-06]` | 7-day trial, starts on first dashboard visit |
| `DECISIONS.md` `[2026-04-15]` | 7-day trial KILLED. 14-day money-back guarantee. |
| `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md` | 14-day money-back only |
| `~/.claude/memory/MEMORY.md` | 14-day money-back guarantee (correct) |

Same problem as pricing — old entry not marked superseded.

### Conflict 3 — LLM routing (MEDIUM SEVERITY)
| Source | LLM routing |
|--------|------------|
| `DECISIONS.md` `[2026-03-06]` | All LLM calls via OpenRouter. 2 keys: OPENROUTER_SCAN_KEY + OPENROUTER_AGENT_KEY |
| `LONG-TERM.md` | Direct Anthropic SDK for Claude (ANTHROPIC_API_KEY). OpenRouter only for Gemini + Perplexity Sonar. |
| `docs/product-rethink-2026-04-09/15-EXPERT-AUDIT.md` | Direct Anthropic SDK bypasses OpenRouter for 80% of calls |

DECISIONS.md says "No direct provider SDKs." LONG-TERM.md says use Anthropic SDK directly. These are contradictory operational instructions for the build team.

### Conflict 4 — "Source of truth" claim vs reality (LOW SEVERITY)
- `docs/PRD.md` states: "Authoritative source: `docs/product-rethink-2026-04-09/`"
- `CLAUDE.md` (project) states: "Source of truth: `docs/product-rethink-2026-04-09/` folder (9 files)"
- **Actual count:** 16 files (01 through 15-EXPERT-AUDIT.md + README.md) — the "9 files" claim is outdated
- MOC-Architecture.md was last updated 2026-04-10 — predates several major build decisions
- MOC-Codebase.md was last updated 2026-04-10 — predates the monorepo restructure

### Conflict 5 — Workflow Builder tier (MEDIUM SEVERITY — red-team R3)
| Source | Workflow Builder gating |
|--------|------------------------|
| Original PRD | Scale-only ($499) |
| `project_red_team_decisions_2026_05_05.md` | Build AND Scale ($189+) — LOCKED 2026-05-05 |
| `DECISIONS.md` | Not mentioned |
| `docs/product-rethink-2026-04-09/` | Not reflected (pre-dates red-team) |

This change is locked but nowhere in the committed repo docs.

### Conflict 6 — docs/00-brain/log.md date format
Two formats coexist: `## [YYYY-MM-DD]` and `## YYYY-MM-DD — description`. This is cosmetic but breaks any tooling that parses dates from the log.

---

## docs/00-brain/ MOC Health

| MOC | Last Updated | Status | Notes |
|-----|-------------|--------|-------|
| `_INDEX.md` | Not dated | Unclear | Links to all 8 MOCs — needs verification |
| `MOC-Product.md` | 2026-04-19 | Acceptable | Includes April rethink links. Dashboard-7-pages and proactive-automation-model specs linked. |
| `MOC-Architecture.md` | 2026-04-10 | Stale | Updated before monorepo restructure, before Anthropic-SDK-direct decision, before expert audit findings |
| `MOC-Codebase.md` | 2026-04-10 | Stale | Does not reflect apps/web/ structure. Points agents at saas-platform/ era conventions. |
| `MOC-Business.md` | Not verified | Likely stale | Pricing links not checked |
| `MOC-Marketing.md` | Not verified | Likely current | No major marketing changes post-April |
| `MOC-History.md` | Not verified | Acceptable | Points to sessions/, decisions |
| `MOC-Metrics.md` | Not verified | Acceptable | Metrics not changed |
| `MOC-Agents.md` | Not verified | Needs update | Agent roster changed from 7→11 in April rethink |
| `log.md` | Last entry 2026-04-26 | 9 days stale | Red-team session (2026-05-05) not logged. Format inconsistency (2 date styles). |

---

## Bottom Line (5 bullets)

**KILL — 43 merged worktrees (32 GB recoverable in one script run).**
The merged-worktree pile is the single highest-cost line item. Run the cleanup script with `git tag pre-cleanup-2026-05-05` first. Zero information lost — all code is on main. Estimated time: 10 minutes.

**REWRITE — CODEBASE-MAP.md (complete replacement needed).**
Every path is wrong. It describes the archived `saas-platform/` codebase. A build agent reading this file will waste 3-5 turns navigating to non-existent files. One focused Code Reviewer session against `apps/web/src/` produces the replacement.

**MERGE + MARK SUPERSEDED — DECISIONS.md stale entries.**
Do not delete old entries (they document reasoning). Add `[SUPERSEDED — see entry YYYY-MM-DD]` inline on lines 72-76 (old pricing), lines 62-68 (old trial), lines 80-86 (old LLM routing). Then add 3 new entries: R1-R7 red-team decisions, hard-reset codebase decision, Workflow Builder tier change.

**KEEP — docs/product-rethink-2026-04-09/ as authoritative, but fix the "9 files" claim everywhere.**
The folder is the correct single source of truth for product decisions. The CLAUDE.md and MOC-Product.md claim "9 files" — the actual count is 16. Update both references. The rethink folder itself does not need changes.

**ADD — AUDIT_LOG.md must actually be used + session coverage for red-team decisions.**
The AUDIT_LOG has existed since March with zero entries. Every merge, schema change, and deploy from Waves 0-4 is unlogged. Write a catch-up log entry for the hard-reset decision (the single most destructive upcoming action) and mandate it for all future Wave operations. Write a session file for the 2026-05-05 red-team decisions — they are currently only in machine-local auto-memory.
