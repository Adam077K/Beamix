# Beamix War Room — Rethink & Action Plan
**Date:** 2026-05-05 · **Author:** CEO (synthesis of 7 parallel audit + research streams) · **Status:** Awaiting Adam sign-off

---

## TL;DR

The war room is **structurally sound but operationally broken**. Three things are silently sabotaging every session today (P0s), the discovery layer for 430 skills costs ~$0.14 before any work begins, the QA gate is theater, and we are technically *coupled to an upstream npm package* (`gsa-startup-kit`) that could overwrite Beamix-specific agent files on `npx update`.

At the same time, the open-source ecosystem moved fast in late 2025 / early 2026: Anthropic shipped **Skills (Oct 2025), Plugins (Oct 2025), Agent Teams (experimental), Routines (Apr 2026), 19 lifecycle Hooks, GitHub Action, Slack integration, OTEL telemetry, headless `claude -p`** — and we are using **about 4 of these primitives**. Worst, our agent definitions live in `.agent/` and not `.claude/` so Claude Code itself cannot auto-discover them.

This document is the rethink. It has 4 waves. Wave 0 (today, 2-4 hours) unblocks broken plumbing. Wave 1 (this week) cuts cost ~50% and adds the GitHub-Action loop. Wave 2 (next week) wires Linear → Claude. Wave 3 (after MVP ships) adds Agent Teams, vector memory, and a multi-agent observability dashboard.

---

## Reports This Synthesizes
1. `01-internal-agent-system-audit.md` — agent hierarchy, briefing quality, dead lineages
2. `02-internal-skills-mcps-commands-audit.md` — 430 skills health, MCP gaps, command/hook rot
3. `03-internal-memory-docs-worktrees-audit.md` — 72 worktrees / 32 GB / memory drift
4. `04-external-frameworks-research.md` — spec-kit, BMAD, claude-flow, agent-os, claude-squad
5. `05-claude-code-production-patterns.md` — official Anthropic stack as of May 2026
6. `06-external-trigger-integration-research.md` — Linear / Slack / GitHub triggering
7. `07-qa-and-economics-research.md` — multi-agent QA + cost optimization

---

## P0 — Broken Right Now (fix today, ~2-4 hours total)

| # | Bug | Evidence | Fix |
|---|-----|----------|-----|
| **P0-1** | **12 GSD execution agents are dead weight.** `executor.md`, `planner.md`, `verifier.md`, `debugger.md`, `roadmapper.md`, `phase-researcher.md`, `plan-checker.md`, `nyquist-auditor.md`, `integration-checker.md`, `research-synthesizer.md`, `project-researcher.md`, `codebase-mapper.md` all depend on `gsa-tools.cjs` binary not present in repo. Zero `model`/`maxTurns` frontmatter. | Audit 01, P0-1 | Delete all 12 OR move to `.agent/agents/_archive/`. |
| **P0-2** | **Workers are pointed at a dead path.** `frontend-developer.md` and `design-lead.md` reference `saas-platform/src/` — that folder was archived 2026-04-18. Real path is `apps/web/src/`. | Audit 01, P0-2 | sed `saas-platform` → `apps/web` across all `.agent/agents/*.md`. |
| **P0-3** | **QA gate is theater.** "Mandatory" in 4 places. Invoked **0 times** across 29 sessions. Wave 1 shipped Paddle webhooks, HMAC verification, and 17 API routes with no security audit and no `AUDIT_LOG.md` entry. | Audit 01, P0-3 | Add a Stop-hook that blocks `git merge` on any branch that lacks a `qa_verdict: PASS` line in its session file. |
| **P0-4** | **Three MCPs declared mandatory but not connected.** Pencil, Context7, IDE — listed in CLAUDE.md MCP table as "MUST use." Not in `.claude/settings.json`. Workers receive impossible mandates. | Audit 02 | Either connect them or downgrade them from "MUST" to "use if available" in CLAUDE.md. |
| **P0-5** | **Hook references dead command.** `gsa-context-monitor.js` tells agents to run `/gsa:pause-work` — that command does not exist in this project. Silent failure on every context warning. | Audit 02 | Rewrite the message or kill the dead reference. |
| **P0-6** | **Live coupling to upstream `gsa-startup-kit` npm package.** `gsa-file-manifest.json` is a versioned hash manifest (1.21.0) — an accidental `npx gsa-startup-kit update` could overwrite our customized agent definitions and skills. | Audit 02 | Either fork & vendor (recommended) OR pin a specific version with a lockfile guard hook. |
| **P0-7** | **CLAUDE.md exceeds 200-line cap.** The system itself printed: *"WARNING: MEMORY.md is 266 lines (limit: 200). Only part of it was loaded."* Both project CLAUDE.md and auto-MEMORY.md are silently truncating, meaning agents are receiving partial instructions. | Research 05; system reminder this session | Compact CLAUDE.md to ≤200 lines (move detail into `docs/00-brain/` MOCs). |

**Estimated time to fix all P0s:** half a day. **Impact:** every agent dispatch starts working correctly.

---

## P1 — The Five Big Architectural Moves

### 1. Move `.agent/` → `.claude/` so Claude Code can actually discover our agents and skills
The single biggest mismatch. Anthropic's docs (May 2026) state subagents must live in `.claude/agents/` and skills in `.claude/skills/` for auto-discovery. Today, ours live in `.agent/`, which means `Task` invocations work via explicit `subagent_type` but **the broader Claude Code primitives don't see them at all** (no `/agents` listing, no skill auto-loading, no plugin packaging).

**Move:** `git mv .agent/agents .claude/agents && git mv .agent/skills .claude/skills`. Update CLAUDE.md path references. ~30 min.

**Source:** Research 05 (Anthropic official docs, code.claude.com).

### 2. Adopt a `permissions:` block in `.claude/settings.json`
Today there is no permissions block. Workers can run `rm -rf`, `git push --force`, read `.env*`. This is a production-grade footgun.

**Recipe** (Research 05):
```json
{
  "permissions": {
    "deny": ["Bash(rm -rf*)", "Bash(git push --force*)", "Read(./apps/web/.env*)", "Read(./.env*)"],
    "allow": ["Bash(pnpm *)", "Bash(gh *)", "Bash(git status)", "Bash(git diff *)", "Bash(git log *)", "Bash(git branch*)", "Bash(git worktree *)"],
    "ask": ["Bash(git push*)", "Bash(supabase db push*)"]
  }
}
```

### 3. Enable OpenTelemetry — observability is missing entirely
Set `CLAUDE_CODE_ENABLE_TELEMETRY=1` + 4 OTEL env vars + a local `otel-collector` container forwarding to Grafana Cloud free tier. We will finally see: which agents run, how many tokens, $/session, cache hit rate, who got blocked. We have **zero** of this today.

**Source:** Research 05 (Anthropic shipped OTEL export 2025-2026).

### 4. Hard-route models per agent — stop paying Opus prices for log parsing
Today: research-lead and researcher are **Opus by default**. Many other agents are unspecified (Sonnet by inheritance).

**Recipe** (Research 07):
- `model: claude-haiku-4-5` → test-engineer, code-reviewer (P3 reviews only), technical-writer, security-engineer (Lite-tier reviews)
- `model: claude-sonnet-4-6` → all leads, all developers, code-reviewer (P1 reviews)
- `model: claude-opus-4-6` → security-engineer (Full-tier on auth/billing/db), researcher (deep web only), AI-engineer (for prompt design)

Combined with prompt caching at 90% off cached tokens and `MAX_THINKING_TOKENS=10000`, projected **40-60% cost reduction**.

### 5. Risk-tier the QA gate — Cloudflare model
Today: QA spawns Security + Test in parallel for **every** merge. This is overkill for a CSS tweak and underkill for an auth change.

**Recipe** (Research 07, Cloudflare's $0.98/review across 48,095 MRs):

| Tier | Trigger | Reviewers |
|------|---------|-----------|
| **Trivial** | ≤10 lines, no ts/sql/auth files | 1 reviewer (Haiku, lints + tsc) |
| **Lite** | ≤100 lines, no critical paths | 3 reviewers: tsc + semgrep + Sonnet code-reviewer |
| **Full** | >100 lines OR touches `auth/`, `billing/`, `migrations/`, `webhooks/` | 7 reviewers: tsc + semgrep + Sonnet code-reviewer + Sonnet test-engineer + Opus security-engineer + Opus **adversary-engineer (Aria persona)** + qa-lead judge pass |

`semgrep` and `tsc` are **deterministic ground truth** the LLM triages — stop asking Sonnet to pattern-match what a $0/run linter already knows.

---

## P2 — Linear Integration MVP (cheapest path, ~$50/mo, same-day shippable)

Adam wants to file a Linear ticket and have agents pick it up. **Three reference architectures exist; we recommend the bridge pattern for week-1 and the OAuth-app pattern for week-2.**

### Week 1 — Same-day shippable

**Components:**
1. **GitHub side:** Drop `anthropics/claude-code-action@v1` into `.github/workflows/claude.yml` (~30 lines). Adam types `@claude implement X` on any GitHub issue or PR comment → Claude opens a `claude/<slug>` branch + a PR. Free except API tokens + GH Action minutes.
2. **Linear side:** Create one **Claude Code Routine** (Anthropic-hosted, launched 2026-04-14, $0.08/runtime hr + tokens) loaded with the CEO agent. One Vercel Edge function (~30 lines) verifies Linear's HMAC-SHA256 webhook signature and forwards comment text to the routine via `POST /fire`. Routine uses Linear's official MCP to comment back the PR URL.

**End-to-end MVP cost:** ~$50/mo (Claude Pro $20 + ~$30 API + Vercel free).

### Week 2 — Per-persona Linear Agents

Use Linear's official **Agent protocol** (announced 2026): each Beamix persona becomes a separate Linear OAuth app with its own avatar and `@build-lead`, `@qa-lead`, `@research-lead` mention names.

Cloudflare Worker (forked from `linear/linear-agent-demo`) routes by mention → spawns `claude -p --bare --append-system-prompt-file <persona>.md`. Wrap dangerous tools with HumanLayer's `@hl.require_approval()` decorator (free up to 1K ops/mo) for Slack-based human-in-the-loop gates.

### Hard safety rules (non-negotiable)
- Per-agent monthly $ caps in Anthropic Console (recommend $200/agent/mo to start)
- `--max-turns 30` ceiling on every headless call
- **Never `Bash(*)` — only allowlisted prefixes** (`Bash(git *)`, `Bash(pnpm *)`)
- HMAC verification on every webhook
- Filter agent-on-agent comment loops by `actor.id`

**Source:** Research 06 (Linear official docs, claude-code-action docs, claude-did-this/claude-hub reference impl).

---

## P3 — The 80-Skill Cleanup + 60-Worktree Cleanup

### Skill purge (Audit 02)
- 430 skills today. ~80 are duplicates or wrong-stack:
  - `error-debugging-*` and `error-diagnostics-*` are parallel copies → keep one
  - 14 security skills where 3-4 suffice
  - 6 code-review skills where 2 work
  - Stripe / Clerk / n8n skills (we use none)
- **Replace MANIFEST.json discovery** (~42K tokens / $0.14 per session **before any work**) with either:
  - **(a)** A small (≤200-line) `SKILLS_INDEX.md` with one-line summaries and tags (matches Anthropic's progressive-disclosure pattern from Skills v1.1)
  - **(b)** A `mcp-skills` MCP server that exposes `find_skills(tags, limit)` — agents call once instead of reading the whole file

### Worktree purge (Audit 03)
- **72 worktrees on disk, 32 GB total.**
- 43 already-merged → instant `git worktree remove` recovers ~28 GB
- 20 stale (16-35 days old) target the archived `saas-platform/` codebase → cannot forward-port → archive-tag and remove
- 9 active

**Cleanup script** (Audit 03 has the full version, gist):
```bash
git worktree list --porcelain | awk '/^worktree/{p=$2}/^branch/{print p,$2}' | \
  while read path branch; do
    short=${branch#refs/heads/}
    git merge-base --is-ancestor "$short" main 2>/dev/null && \
      echo "MERGED: $path → safe to remove"
  done
```

Adam approves the list, then `git worktree remove <path>` each.

---

## P4 — Memory & Knowledge System Repair

From Audit 03:

| File | Issue | Fix |
|------|-------|-----|
| `DECISIONS.md` | Contradictory pricing entries ($49 and $79 coexist with no SUPERSEDED flag) | Add `**SUPERSEDED-BY:**` field, mark April-15 entry as superseded by `2026-04-15-pricing-v2` |
| `CODEBASE-MAP.md` | Ghost — every path points to archived `saas-platform/`. Last touched 47d ago. | Re-run codebase-mapper against `apps/web/` |
| `AUDIT_LOG.md` | Zero substantive entries despite Waves 0-4 shipping | Backfill at least the Paddle webhook + DB rethink migration |
| `docs/00-brain/log.md` | 9 days stale, two incompatible date formats | Normalize and add this rethink as latest entry |
| Session files | ~67% YAML-compliance rate, 6 missing frontmatter entirely | Add a Stop-hook that validates session-file frontmatter on completion |
| `docs/product-rethink-2026-04-09/` | Auto-memory says "9 files" — there are **16** | Update auto-memory + audit which 16 files are authoritative |
| Auto-memory | MEMORY.md = 266 lines (cap 200) → silently truncating | Compact + move detail into topic files |

---

## P5 — Adopt 5 Patterns From the Open-Source Leaders

From Research 04:

| # | Pattern | Source | Beamix adoption |
|---|---------|--------|-----------------|
| 1 | **Multi-agent observability dashboard** | `disler/claude-code-hooks-multi-agent-observability` | 12 hooks → Bun + SQLite + Vue swim-lane dashboard. Show 60+ active worktrees in real time. |
| 2 | **Agent Teams for adversarial debate** | Anthropic experimental (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) | Use for hypothesis-debugging and competing-research only. Keep hierarchy for build/ship. |
| 3 | **Plugin bundling** | `anthropics/claude-plugins-official` (Oct 2025) + `wshobson/agents` (80 plugins) | Repackage each lead's domain (lead + workers + commands + skills + MCP) as installable `plugin.json` bundles. Future-proofs against the marketplace. |
| 4 | **Vector-indexed memory MCP** | claude-flow's SAFLA + AgentDB | pgvector-backed `mcp-memory` server indexing every session/decision/skill. Replaces our flat-markdown approach (which already overflows). |
| 5 | **Constitution + standards-extractor** | `github/spec-kit` + `buildermethods/agent-os` | A ≤200-line `CONSTITUTION.md` every spec inherits. A `standards-extractor` agent auto-derives `ENGINEERING_PRINCIPLES.md` from the codebase so it never drifts. |

---

## The 4-Wave Action Plan

(No timelines per Adam's preference — sequenced by dependency only.)

### Wave 0 — Stop the bleeding (today)
1. Fix P0-1 (kill 12 dead agents)
2. Fix P0-2 (sed `saas-platform` → `apps/web` in agent files)
3. Fix P0-3 (Stop-hook for QA gate)
4. Fix P0-4 (downgrade phantom MCP mandates)
5. Fix P0-5 (kill dead `/gsa:pause-work` reference)
6. Fix P0-6 (vendor or pin gsa-startup-kit)
7. Fix P0-7 (compact CLAUDE.md to ≤200 lines)
8. Worktree cleanup script — Adam approves list, then run

### Wave 1 — Make Claude Code see us + cut cost
9. P1.1 — Move `.agent/` → `.claude/`
10. P1.2 — Add `permissions:` block to settings.json
11. P1.3 — Wire OTEL + Grafana Cloud (free tier)
12. P1.4 — Hard-route models per agent
13. P1.5 — Risk-tier the QA gate
14. P3 — Skill purge to ≤350 + replace MANIFEST with SKILLS_INDEX.md
15. P4 — Memory repair (DECISIONS, CODEBASE-MAP, log.md, session-file hook)

### Wave 2 — External triggers
16. Drop `claude-code-action@v1` into `.github/workflows/claude.yml`
17. Stand up Vercel Edge function for Linear → Routine bridge
18. Run `/install-github-app` for PR review automation
19. Connect Linear MCP, set per-agent $ caps in Anthropic Console
20. End-to-end test: Linear ticket → PR

### Wave 3 — Production hardening (post-MVP-ship)
21. Adopt plugin bundling (lead + workers + commands → one `plugin.json`)
22. Spin up `mcp-memory` (pgvector) — migrate from flat markdown
23. Stand up multi-agent observability dashboard (disler pattern)
24. Enable Agent Teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) for debug + research
25. Linear Agent OAuth apps per persona (build-lead, qa-lead, etc.)
26. HumanLayer integration for human-in-loop approval gates

---

## Decisions Adam Needs to Make (binary, blocks Wave 0 → Wave 1)

| # | Decision | Default if no input |
|---|----------|---------------------|
| **D1** | Wave 0 fixes — go ahead now? | **YES** (low risk, all reversible) |
| **D2** | Vendor-fork `gsa-startup-kit` (own it forever) OR pin to a version with lockfile guard? | **Vendor-fork** (cleaner) |
| **D3** | Move `.agent/` → `.claude/` — accept 30 minutes of broken paths during the rename? | **YES** |
| **D4** | OpenTelemetry destination — Grafana Cloud free tier OR self-host OR Honeycomb free? | **Grafana Cloud free** |
| **D5** | Linear week-1 MVP — single shared Routine OR jump straight to Cloudflare Worker + per-persona OAuth apps? | **Single Routine** (faster, cheaper, fewer moving parts) |
| **D6** | QA gate enforcement — block merge with a Stop-hook (hard) OR warn-only for first 2 weeks (soft)? | **Hard from day 1** (we already shipped Paddle webhooks without QA — no more) |
| **D7** | Skill cleanup — go to ≤350 (cautious) OR ≤250 (aggressive, archive everything not used in last 30 days)? | **≤250 aggressive** (you can always restore from git) |

---

## Cost Math (the headline)

Today (estimated, no telemetry to confirm — fixing that is P1.3):
- Skill discovery dance: ~$0.14/session × ~5 sessions/day = **$21/mo wasted before any work**
- Researcher on Opus when Sonnet+caching would do: **~3x cost** on a daily-research workload
- No prompt caching: **10x cost** on the 5-min cache window
- No risk-tiered QA: every CSS tweak gets a full security audit

After Wave 1:
- Prompt caching at 90% off cached tokens
- Sonnet default (5x cheaper than Opus)
- Risk-tiered QA cuts 60-70% of merges to cheap paths
- `MAX_THINKING_TOKENS=10000` cuts 30-40% on remaining
- **Projected total: 40-70% cost reduction with stronger guardrails.**

Cloudflare runs the same shape at **$0.98/median review** across 48,095 merge requests. Anthropic's own Code Review reports **<1% false positive rate** and lifted PRs-with-substantive-comments from 16% → 54%. Both numbers are achievable for Beamix.

---

## What This Rethink Does NOT Cover (out of scope, can be follow-up)

- Agent-team-style swarm orchestration for non-code work (research, design)
- Voice / dictation interfaces for Adam (claude-cli + whisper)
- Beamix product-side agents (the 11 GEO agents) — that is a different rethink
- Replacing the planner/executor lineage with `spec-kit` formally (Wave 4 candidate)
- Branching strategy for parallel CEOs (currently 2 parallel CEOs; we have a color/name protocol but no merge protocol)

---

**End of synthesis. Ready for Adam sign-off on D1-D7.**
