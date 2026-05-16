---
persona: architect
round: 1
topic_id: agent-rethink-2026-05-16
date: 2026-05-16
---

# Architect — R1: Bill of Materials + Rollback Cost

## BOM

The framing: "What's the bill of materials for this rethink?" means listing every file, table, route, hook, config, and external dependency this plan introduces or modifies, classifying each by reversibility, and costing the build and undo paths.

| # | System | Change type | Specific file/artifact | Reversibility | Build (person-days) |
|---|--------|-------------|------------------------|---------------|---------------------|
| 1 | Agent files | Delete directory | `.agent/agents/` (34 files) | Easy — git revert | 0.1 |
| 2 | Agent files | Author 4 new C-suite | `.claude/agents/cpo.md`, `cmo.md`, `cbo.md`, `cco.md` | Easy — delete files | 2.0 |
| 3 | Agent files | Refine 5 existing leads | `.claude/agents/ceo.md`, `cto.md`, `qa-lead.md`, `research-lead.md`, `design-lead.md` | Easy — git revert to pre-refine | 1.5 |
| 4 | Agent files | Author 3 new workers | `adversary-engineer.md`, `product-designer.md`, `design-critic.md` (already exists) | Easy — delete | 1.0 |
| 5 | Agent files | Rename 4 workers | `backend-developer→backend-engineer`, `frontend-developer→frontend-engineer`, `devops-lead→devops-engineer`, `data-lead→data-engineer` | Medium — all references across CLAUDE.md, AGENTS.md, other agent files, hooks must update | 0.5 |
| 6 | Agent files | Archive 10 GSD + 4 legacy leads | Move to `.archive/agents/` | Easy — mv back | 0.2 |
| 7 | Skills | Archive 305 orphans, regenerate MANIFEST.json | `.archive/skills-orphans-2026-05-16/`, `.agent/skills/MANIFEST.json` | Easy — mv back + regenerate | 0.3 |
| 8 | Skills | Author 14 new Beamix-specific skills | `.agent/skills/{14-names}/SKILL.md` | Easy — delete | 4.0 |
| 9 | Routines | Author 11 .md spec files | `.claude/agents/_routines/*.md` | Easy — delete (specs only, Console provisioning is Adam-side) | 3.0 |
| 10 | Personas | Author 7 persona files | `.claude/agents/_personas/*.md` | Easy — delete | 2.0 |
| 11 | Config | `settings.json` Bash allowlist | `.claude/settings.json` — add `allowedTools.Bash` patterns | Medium — overly strict allowlist breaks existing workflows until tuned | 0.3 |
| 12 | Hooks | PostToolUse lint+typecheck auto-feedback | `.claude/hooks/lint-after-edit.js` (NEW) | Easy — remove hook entry from settings.json | 1.5 |
| 13 | Hooks | PreToolUse block dangerous Bash | `.claude/hooks/pre-tool-block.js` (NEW) | Easy — remove | 0.5 |
| 14 | Hooks | Stop hook (session file validation) | `.claude/hooks/stop-validate.js` (NEW) | Easy — remove | 0.5 |
| 15 | GitHub Actions | `qa-lead-pass.yml` refactor for XML verdict + tier check | `.github/workflows/qa-lead-pass.yml` (226 lines, existing) | Medium — existing PRs in flight depend on current schema | 1.0 |
| 16 | Codex CLI | Bash-invoked `codex review --diff` integration | Referenced in qa-lead + CTO operating procedure | Hard — depends on OpenAI's CLI stability, ChatGPT Plus local auth, no API contract | 1.0 |
| 17 | Mem0 integration | Episodic memory read/write in C-suite pre-flight/post-task | Wired via MCP `mem0` server (already connected) + fallback logic | Medium — Mem0 API changes or Hobby tier limits force rework | 1.5 |
| 18 | pgvector RAG | Corpus scope change: add skills + brain MOCs to existing embed functions | `apps/web/src/inngest/functions/embed-skills.ts`, `embed-brain.ts` (already exist) | Easy — scope is additive | 0.5 |
| 19 | Promptfoo | Regression suite: 5 scenarios x 5 critical agents | `tests/promptfoo/` (NEW directory) + GitHub Action | Medium — Promptfoo npm dep + CI minutes + ongoing maintenance per agent edit | 2.0 |
| 20 | CLAUDE.md | Full rewrite of Team/Memory/MCPs sections | `CLAUDE.md` (both repo root + worktree) | Medium — every active session caches the old version; mismatch during rollout | 0.5 |
| 21 | Linear labels | New vocabulary (`agent:cpo`, `agent:cmo`, `agent:cbo`, `tier:*`) | Linear project settings (external) | Hard — retroactive rename of existing labels on 50+ tickets is manual | 0.3 |
| 22 | Anthropic Routines | 10 new Routine provisioning in Console | claude.ai Console UI (Adam-manual) | Medium — each Routine needs bearer token, correct model, correct repos | 1.0 (Adam) |
| 23 | Debugger + codebase-mapper | Refactor to new schema, cut from ~1,200 / ~800 lines to ~250 each | `.claude/agents/debugger.md`, `codebase-mapper.md` | Medium — `/fix` and `/audit` commands depend on these; schema mismatch = broken commands | 1.0 |

**Total build path: ~25 person-days.** 15 items parallelizable (all authoring). 4 sequential gates: Phase 0 cleanup must land before Phase 1 schema standardization; Phase 1 before Phase 2 authoring; Phase 6 hooks before Phase 7 production readiness; all before production sign-off.

## Reversibility summary

- **Easy (can undo in a sprint):** 14 items. The bulk of the work is .md file authoring. Git revert or file delete undoes it.
- **Medium (undo in a quarter):** 6 items. Settings.json tuning, qa-lead-pass.yml schema, CLAUDE.md cached state, Mem0 patterns, rename references, Promptfoo dependency.
- **Hard (undo in a year or more):** 2 items. Linear label vocabulary (manual ticket re-label at scale) and Codex CLI dependency (if OpenAI changes the CLI interface, your QA gate degrades silently).
- **Irreversible:** 0 items technically. No database migrations, no public API contracts, no data destruction.

## Critical path analysis

The plan is architecturally sound in one critical respect: **zero database migrations, zero production API changes, zero user-facing code.** This is a prompt-engineering and configuration rethink, not a product rethink. That makes the blast radius unusually low for a 41-file rewrite.

The risk concentrates in three places:

**1. Codex CLI via Bash (item 16).** The plan calls agents to invoke `codex review --diff <patch>` during Full/Irreversible QA. This depends on: (a) OpenAI's Codex CLI binary being installed and authenticated on Adam's machine, (b) the CLI's `--diff` flag remaining stable, (c) ChatGPT Plus subscription auth persisting in the terminal session. OpenAI has no public SLA on CLI flag stability. They renamed `codex` from the original OpenAI CLI within 6 months of launch. The plan correctly scopes this to interactive sessions only (Routines cannot call Codex), but the QA gate for Full/Irreversible tier now has an external dependency with no contract.

**2. PostToolUse hooks (items 12-14).** Three new hook scripts (.js, not .py — note the plan says `.py` in Phase 6 task descriptions but the existing hooks are all `.js`). The existing `gsa-context-monitor.js` is 181 lines and already runs PostToolUse. Adding a lint+typecheck hook means `pnpm typecheck` runs after every Write/Edit call. On a 15-file worker session, that is 15+ typecheck invocations. Each takes 3-8 seconds on a Next.js 16 monorepo. Risk: session timeout or context bloat from repeated typecheck output piped back as `additionalContext`. The plan references "disler-style hooks" but disler's pattern is for small repos; Beamix's `apps/web/` is already ~15K lines of TypeScript.

**3. 4-tier QA classification in practice (the matrix enforcement problem).** The plan defines Trivial/Lite/Full/Irreversible beautifully but the classification happens via either: (a) CTO's judgment at spawn time, or (b) a `tier:*` Linear label. There is no deterministic classifier. A Haiku classifier is mentioned ("auto-classified by a Haiku classifier at the bridge") but never specified in the BOM. Without that Haiku classifier actually being authored and deployed, every classification is a prompt-level judgment call by CTO — which means a tired Sonnet session can under-classify a Full-tier change as Lite, skipping security-engineer review on an auth change.

## Rollback cost analysis

**Month 1:** Rollback cost is near-zero. The 41 files are in `.claude/agents/` and `.agent/skills/`. The old files are in `.archive/`. Git revert of the CLAUDE.md rewrite restores the 9-lead model. Linear labels are the only friction — you have to manually remove `agent:cpo` etc. from tickets created in the interim. Estimate: 2 hours of manual work + 1 git revert.

**Month 6:** Rollback cost is low-to-medium. By month 6, 11 Routines have been firing daily for 5 months. Mem0 has accumulated ~3,000 episodic entries keyed to the new agent names (`agent_id: 'cpo'`). pgvector embeddings reference the new skill set. Rollback means: orphan Mem0 entries (query noise), stale pgvector embeddings (re-embed required, ~1 hour via Inngest), and 10 Routine Console entries to disable manually. Estimate: 1 person-day of cleanup.

**Month 12:** Rollback cost is medium. A year of DECISIONS.md entries reference the C-suite vocabulary. Session files at `docs/08-agents_work/sessions/` use the new agent names. The institutional memory of the project assumes this org chart. Rollback is technically possible but semantically disorienting — every historical reference says "CTO decided X" and a rollback to "build-lead decided X" creates confusion. This is the soft lock-in: not data, but organizational vocabulary. Estimate: 3 person-days of vocabulary translation + Mem0 cleanup + Routine teardown.

## Architectural concerns

**1. Language mismatch in hook scripts.** Phase 6 says `.py` (6.1, 6.2, 6.3). The existing hooks are `.js`. The `settings.json` hook format uses `"command": "node .claude/hooks/..."`. Either commit to Node (consistent with repo) or explain why Python. This is a 0.5 person-day rework if someone authors in Python and then discovers the runtime expects Node.

**2. Codex is load-bearing for Full QA but has no fallback.** D4.2 says "Full + Irreversible only" and D4.3 says "Adam's $20/mo ChatGPT Plus subscription." The Mem0 integration has an explicit 3-retry-then-fallback pattern (D9.4). Codex has no stated fallback. If `codex review --diff` fails (binary not found, auth expired, OpenAI CLI breaking change), what does QA-Lead do? The plan should specify: "If Codex unavailable, proceed with Claude-only multi-judge (degrade gracefully, log to audit_log)."

**3. Agent Teams TeammateTool (Q3 in open questions).** The plan correctly defers this. The current `Agent(...)` restriction syntax in 07b Section 11.2 is a cleaner compile-time guardrail than TeammateTool's shared-state model. If Anthropic stabilizes TeammateTool, migration is additive (add `teammates:` field to frontmatter) not destructive. No cost to waiting.

**4. pgvector re-embed on git push.** Five Inngest functions exist: `embed-skills.ts`, `embed-decisions.ts`, `embed-brain.ts`, `embed-sessions.ts`, `embed-codebase.ts`. The rethink archives 305 skills and adds 14 new ones. The embed-skills function triggers on git push (presumably via webhook). After Phase 0, the corpus shrinks from ~430 to ~125 skills. The function needs to handle deletion — not just upsert — or the vector store retains 305 stale embeddings that pollute semantic search. Confirm: does `embed-skills.ts` do a full re-index or incremental? If incremental, add a one-time purge job to Phase 0.

**5. `qa-lead-pass.yml` is the single enforcement point for the entire 4-tier system.** At 226 lines today, it checks for `qa_verdict: PASS` in session files. The plan adds: XML tag `<verdict>PASS</verdict>` parsing, `tier:` label detection, multi-judge verdict aggregation for Irreversible. This workflow becomes the most complex GitHub Action in the repo. If it has a bug, the entire QA gate is either too permissive (ships without review) or too strict (blocks all PRs). Recommend: add the Promptfoo eval for `qa-lead-pass.yml` itself — test it against 10 historical PR scenarios (5 that should pass, 5 that should block).

```json
{
  "persona": "architect",
  "round": 1,
  "topic_id": "agent-rethink-2026-05-16",
  "verdict": "ship",
  "rationale": "The BOM is 25 person-days across 23 items with zero database migrations, zero user-facing changes, and zero irreversible commits. 14 of 23 items are Easy reversibility (file delete or git revert). The plan's blast radius is contained to prompt files, config, and hooks — all of which can be rolled back at month 1 for under 2 hours of work. The Hard-reversibility items (Linear labels, Codex CLI dependency) are manageable: labels are cosmetic, and Codex is correctly scoped to interactive-only with a documented constraint. The missing piece is an explicit Codex fallback path and a deterministic tier-classifier (the Haiku bridge classifier is named but not BOMMed). Ship with those two additions.",
  "risks": [
    "Codex CLI has no public stability contract — OpenAI can rename flags or deprecate the binary, degrading Full-tier QA silently",
    "PostToolUse lint hook on a 15K-line monorepo will add 3-8s latency per Write/Edit — 15+ invocations per worker session risks timeout",
    "4-tier QA classification has no deterministic fallback — the Haiku bridge classifier is mentioned but has zero BOM entries (no file, no route, no test)",
    "qa-lead-pass.yml becomes single point of enforcement failure — a bug in XML-tag parsing either blocks all PRs or lets everything through",
    "Linear label vocabulary change is the only Hard-reversibility item with real friction at scale (50+ existing tickets to re-label on rollback)"
  ],
  "alternatives_considered": [
    "Skip Codex integration entirely — rely on Claude multi-judge only (saves 1 person-day, eliminates external dependency; rejected because cross-provider perspective adds genuine value per D3.2)",
    "Scope PostToolUse hook to file-level typecheck (only the edited file via tsc --noEmit path) instead of full pnpm typecheck — reduces latency from 3-8s to <1s (not considered in plan)"
  ],
  "recommendation": "Ship. Add two items to BOM before Phase 6: (1) explicit Codex fallback clause in QA-Lead operating procedure, (2) scope PostToolUse typecheck to edited files only, not full monorepo. The rest is well-designed, appropriately reversible, and correctly sequenced.",
  "confidence": "high"
}
```
