# Internal Audit: Skills, MCPs, Commands, Hooks
**Date:** 2026-05-05
**Auditor:** Internal Audit Agent
**Scope:** Skills library, MCPs, slash commands, hooks, settings

---

## P0 Findings (Top 5)

**P0-1: MANIFEST.json costs ~42K tokens per session read — bloated discovery tax.**
The MANIFEST.json is 3,950 lines / 167KB / ~42,000 tokens. Every session that follows the prescribed skill-discovery flow pays this cost before a single useful token is spent. At Sonnet pricing ($3/M in), that's ~$0.13 per session just to filter a catalog. For 10 sessions/day, $450/month in manifest overhead alone. The instruction "Read MANIFEST.json, then filter by tags" is the single most expensive ritual in the codebase. There is no caching mechanism.

**P0-2: Confirmed exact duplicate skills shipping as separate entries.**
`error-debugging-error-analysis` and `error-diagnostics-error-analysis` have _identical_ descriptions and identical `beforeSend` Sentry code in their implementation playbooks. Two different directory trees, one skill. This is not an edge case — the `error-debugging-*` and `error-diagnostics-*` namespaces are parallel duplicates of each other across at least 3 skill entries. Total redundancy in the debug/error cluster: 11 entries for what should be 3-4.

**P0-3: Hooks reference dead commands (`/gsa:pause-work`, `/gsa:update`) that do not exist in this project.**
`gsa-context-monitor.js` tells agents to run `/gsa:pause-work` when context is critical. `gsa-statusline.js` shows `⬆ /gsa:update` when an npm update is available. Neither command exists in `.agent/commands/`. The npm package `gsa-startup-kit` is not installed in this repo. Agents receiving critical-context warnings are told to run a command that will silently fail.

**P0-4: MCP table in CLAUDE.md lists Pencil (design) and IDE (TypeScript diagnostics) as mandatory — neither is connected.**
The system-reminder shows which MCPs are actually in the deferred tool list: Supabase, Playwright, Framer, Stitch, Refero. Context7, Pencil, and IDE are not listed. CLAUDE.md says design-lead "MUST call `mcp__pencil__get_editor_state` before any design work" and frontend-developer "Run `mcp__ide__getDiagnostics` before final commit." Both are phantom mandates. No graceful fallback is defined for Pencil.

**P0-5: No Paddle or Resend MCP exists. Beamix's two most operationally important integrations (billing, email) have zero tooling assistance.**
Billing bugs, webhook failures, and email deliverability issues must be debugged by reading code files manually. Stack says Paddle is the only payment provider; no MCP, no skill that covers Paddle specifically (`payment-integration` and `billing-automation` exist but are generic, not Paddle-specific). The `stripe-integration` skill (456 lines) is deeply detailed — for a provider explicitly removed from this stack.

---

## Skills Library Health

| Metric | Count / Grade |
|--------|--------------|
| Total skills | 430 |
| Likely redundant (confirmed duplicates or near-identical descriptions) | ~60-80 (~15-18%) |
| Likely stale / wrong-stack (stripe-integration, clerk-auth, n8n-*, copilot-sdk) | ~20 (~5%) |
| Quality grade A (>150 lines, structured, examples) | ~30% |
| Quality grade B (50-150 lines, reasonable) | ~35% |
| Quality grade C (<50 lines, thin wrapper description only) | ~25% |
| Quality grade D (2-5 lines, boilerplate description, no substance) | ~10% |

**Token cost of the full discovery dance (per session):**
- MANIFEST.json read: ~42,000 tokens
- Load 3-5 SKILL.md files (avg 120 lines each): ~3,000-5,000 tokens
- Total minimum discovery overhead: ~45,000-47,000 tokens
- At Sonnet input pricing: ~$0.14 per session before any actual work

**Confirmed redundant clusters:**

| Cluster | Entries | Should be |
|---------|---------|-----------|
| Code review | 6 (`code-reviewer`, `code-review-excellence`, `code-review-checklist`, `code-review-ai-ai-review`, `requesting-code-review`, `receiving-code-review`) | 2 |
| Security | 14 (`security-audit`, `security-auditor`, `security-scanning-*` x3, `api-security-*` x2, `backend-security-coder`, `frontend-security-coder`, `cc-skill-security-review`, `security-bluebook-builder`, `security-compliance-compliance-check`, `security-requirement-extraction`) | 3-4 |
| SEO | 12+ entries under `seo-*` | 4-5 |
| Prompt engineering | 6 (`prompt-engineering`, `prompt-engineer`, `prompt-engineering-patterns`, `prompt-library`, `prompt-caching`, `llm-application-dev-prompt-optimize`) | 2 |
| Next.js | 4 (`nextjs-best-practices`, `nextjs-app-router-patterns`, `nextjs-supabase-auth`, `react-nextjs-development`) | 2 |
| Context management | 10 (`context-manager`, `context-management-context-restore`, `context-management-context-save`, `context-window-management`, `context-fundamentals`, `context-optimization`, `context-compression`, `context-degradation`, `context7-auto-research`, `code-refactoring-context-restore`) | 3 |
| Error/debug | 11 (`error-debugging-*` x3, `error-diagnostics-*` x3, `debugging-toolkit-*`, `debugger`, `debugging-strategies`, `systematic-debugging`, `error-detective`) | 3 |
| Agent orchestration | 8 (`agent-*` x5, `autonomous-agents`, `autonomous-agent-patterns`, `multi-agent-patterns`) | 2-3 |

**Spot-check quality assessment (10 skills sampled):**

| Skill | Lines | Grade | Notes |
|-------|-------|-------|-------|
| `code-review-checklist` | 446 | A | Comprehensive, structured, usable |
| `code-reviewer` | 180 | A | Solid role definition |
| `code-review-excellence` | 42 | C | Thin wrapper, minimal value |
| `security-audit` | 218 | A | Structured OWASP workflow |
| `security-auditor` | 172 | B | Overlaps with security-audit |
| `geo-fundamentals` | 161 | A | On-mission, unique to Beamix |
| `prompt-engineer` | 253 | B | Framework list without depth |
| `prompt-engineering` | 176 | B | Duplicate territory |
| `nextjs-best-practices` | 208 | A | Well-structured |
| `nextjs-app-router-patterns` | 35 | D | 35 lines total — barely a description |

**Wrong-stack skills (KILL candidates):**
- `stripe-integration` — Stripe was explicitly removed from Beamix stack 2026-03-02
- `clerk-auth` — Stack uses Supabase Auth, not Clerk
- `n8n-*` x3 — n8n explicitly prohibited in CLAUDE.md ("NO n8n")
- `copilot-sdk` — Not in stack
- `neon-postgres` — Stack uses Supabase, not Neon
- `hugging-face-*` x2 — Not in stack

---

## MCP Gap Table

| Tool | MCP Available? | Connected? | Used in Agent Briefs? | Criticality |
|------|---------------|-----------|----------------------|-------------|
| Supabase | YES (`mcp__supabase__*`) | YES | Yes (DECISIONS.md, session refs) | HIGH |
| Playwright | YES (`mcp__playwright__*`) | YES | Yes (session handoff refs) | HIGH |
| Framer | YES (`mcp__framer-mcp__*`) | YES | Not seen in briefs | LOW (marketing only) |
| Stitch | YES (`mcp__stitch__*`) | YES | Not seen in briefs | LOW (design explore) |
| Refero | YES (`mcp__refero__*`) | YES | Not seen in briefs | LOW (design ref) |
| **Pencil** | NO | NO | MANDATORY in CLAUDE.md | DESIGN BLOCKER |
| **Context7** | NO | NO | MANDATORY in CLAUDE.md | RESEARCH BLOCKER |
| **IDE (TypeScript)** | NO | NO | MANDATORY in CLAUDE.md | DEV BLOCKER |
| **Paddle** (billing) | NO MCP exists | — | Not mentioned | CRITICAL GAP |
| **Resend** (email) | NO MCP exists | — | Not mentioned | HIGH GAP |
| **Inngest** (jobs) | NO MCP exists | — | Not mentioned | MEDIUM GAP |
| **GitHub** | NO | NO | Not mentioned | MEDIUM GAP |
| **Linear** | NO | NO | Not mentioned | LOW |
| **OpenAI** | NO MCP | — | Not mentioned | MEDIUM GAP |

**Summary:** 5 MCPs connected, 3 listed as mandatory but not connected (Pencil, Context7, IDE), 4 critical integrations (Paddle, Resend, Inngest, OpenAI) have no MCP and no skill coverage specific enough to compensate.

---

## Slash Command Inventory

| Command | Purpose | Quality | Agent Entry Point | Verdict |
|---------|---------|---------|-------------------|---------|
| `/build` | Full feature pipeline: CEO → Product Lead → Build Lead → Workers → QA → Merge | HIGH — 7 steps, clear abort conditions, worktree protocol | CEO → leads → workers | KEEP |
| `/audit` | Codebase health: codebase-mapper → Code Reviewer + Security Engineer (parallel) → QA Lead synth | HIGH — parallel steps, clear output format | CEO → parallel leads | KEEP |
| `/plan` | Feature/sprint planning: CEO → Product Lead PRD → Build Lead breakdown | HIGH — 5 steps, RICE scoring, wave ordering | CEO → leads | KEEP |
| `/ship` | Pre-deploy pipeline: Scout → Guardian → Nexus deploy | HIGH — abort conditions clear, rollback defined | CEO → leads | KEEP |
| `/debug` | Scientific bug investigation: hypothesis-driven, systematic | HIGH — unique methodology, not redundant with /fix | CEO → workers | KEEP |
| `/fix` | Bug fix pipeline: diagnosis → isolated fix → QA gate → confirmation | HIGH — well-structured, delegates to /debug for complex bugs | CEO → leads | KEEP — minor overlap with /debug |
| `/design` | Full design pipeline: research → brainstorm → implement → verify → critique | HIGH — comprehensive, MCP-aware, 10 steps | CEO → Design Lead | KEEP — but Pencil MCP is dead |
| `/review` | Code review before merge: Code Reviewer + Security Engineer parallel | HIGH — clear P1/P2/P3 verdicts | CEO → workers | KEEP |
| `/research` | Parallel research threads → synthesis | HIGH — sourced claims, confidence levels | CEO → Research Lead | KEEP |
| `/daily` | Daily planning kickoff: reads memory, proposes focus | MEDIUM — reads Iris (old name, not current agent) | Iris (stale reference) | FIX — references "Iris" (old agent name), should be CEO |
| `/color` | Set badge color of session | HIGH — purely instructional, well documented | n/a (instructional) | KEEP |
| `/name` | Set/rename session name | HIGH — purely instructional | n/a (instructional) | KEEP |

**Issues found in commands:**
- `/daily` references "Iris" (old agent name from GSA starter kit) — no "Iris" in this project's agent roster. Command needs name updated to "CEO."
- `/ship` references "Scout," "Atlas," "Guardian," "Nexus" — old agent names. Current CLAUDE.md uses role-based names (build-lead, security-engineer, devops-lead). The agent names in ship.md don't match the AGENTS.md roster.
- No `/test` command — running the test suite has no dedicated slash command. Test Engineer is only invoked as part of `/build` and `/audit`.
- No `/migrate` command — database migrations (critical for Supabase schema changes) have no dedicated workflow.

---

## Hooks

### gsa-statusline.js
**What it does:** Renders a status bar in the Claude Code UI showing model name, current todo task (read from `~/.claude/todos/`), working directory, and a context usage progress bar with color coding (green/yellow/orange/red skull).
**Bridge role:** Writes context metrics to `/tmp/claude-ctx-{session_id}.json` — this is the data source for the context monitor hook.
**Works?** YES — functionally correct. The 80%-scaling logic is accurate. Silent-fail pattern is good.
**Needed?** YES — the context bar is genuinely useful for users. No changes needed in logic.
**Issue:** Shows `/gsa:update` when npm package `gsa-startup-kit` update is available. This npm package is not installed in this repo. The update check will never find a version file, always silently passing — the update indicator will never show. Dead code path.

### gsa-context-monitor.js
**What it does:** PostToolUse hook. Reads the metrics file written by statusline, injects a WARNING (>65% used) or CRITICAL (>75% used) message into the agent's conversation as `additionalContext`. Debounces to avoid spam (5 tool-use gap). Severity escalation bypasses debounce.
**Works?** PARTIALLY. The context injection mechanism is correct and valuable. The thresholds are reasonable. However: (1) the CRITICAL message tells agents to run `/gsa:pause-work` — a command that does not exist. (2) If statusline hook is not running, the metrics file won't exist, and this hook silently exits — meaning context warnings may never fire in non-interactive sessions.
**Needed?** YES — context awareness injection is genuinely useful. Fix the dead command reference.

### gsa-check-update.js
**What it does:** SessionStart hook. Spawns a background process that calls `npm view gsa-startup-kit version`, compares against a VERSION file in `.claude/get-shit-done/` or `~/.claude/get-shit-done/`. Writes result to `~/.claude/cache/gsa-update-check.json`. The statusline reads this cache to show the update indicator.
**Works?** PARTIALLY. The background spawn is clean. However: (1) no VERSION file exists in this project (confirmed: find returns nothing), so installed version will always be `0.0.0`. (2) npm network call on every session start adds latency. (3) This whole mechanism only matters if you manage this project via the `gsa-startup-kit` npm package — which this project does not.
**Needed?** NO. This is vestigial GSA package management infrastructure with no value for a standalone Beamix project. It should be removed or disabled.

**Settings.json correctness:** Hook paths reference `.claude/hooks/gsa-*.js`. The actual files exist in both `.agent/hooks/` AND `.claude/hooks/` (exact copies, confirmed identical). Settings.json correctly points to `.claude/hooks/`. No path issue — but maintaining duplicate copies in two directories is an accident waiting to happen.

---

## GSA Legacy Rot: "gsa-*" Naming

The entire hooks layer is named with `gsa-` prefix (for "get-shit-done," the upstream npm starter kit). This is visible to users in:
- File names: `.claude/hooks/gsa-*.js`
- Status bar: shows `/gsa:update` update nudge
- Context warnings: references `/gsa:pause-work`
- Package manifest: `gsa-file-manifest.json` with version `1.21.0`

This project is **Beamix**, not a GSA instance. The `gsa-file-manifest.json` is an integrity manifest for the upstream package installation — it serves no runtime purpose but does create a coupling signal: if someone runs `npx gsa-startup-kit update`, it will attempt to overwrite these files using the checksums in that manifest.

**Risk:** Accidental `npx gsa-startup-kit update` would overwrite `.claude/` infrastructure including hooks, commands, and agent definitions, potentially reverting Beamix-specific customizations.

---

## Bottom Line (5 Bullets)

1. **KILL ~80 skills** — The redundant clusters (error/debug, security, context, code-review, prompt) should be collapsed from ~50 entries to ~12. Kill wrong-stack skills (stripe, clerk, n8n, neon). Target: 350 skills max, zero confirmed duplicates.

2. **KILL or REPLACE the MANIFEST.json discovery pattern** — At 42K tokens per read, the current discovery ritual costs more than most tasks it supports. Replace with a lightweight tag-index (one line per skill: name, tags, 20-word description), targeting <5K tokens. The current MANIFEST.json should not be the live discovery artifact.

3. **FIX the three phantom MCP mandates** — Remove or downgrade Pencil, Context7, and IDE from "MANDATORY" to "use if available." Add graceful fallback instructions. Update the CLAUDE.md MCP table to reflect actual connected MCPs only.

4. **FIX the gsa-context-monitor dead command** — Change `/gsa:pause-work` references to `/compact` (actual command). Consider removing `gsa-check-update.js` entirely — the npm update check is vestigial infrastructure for a package this project doesn't manage.

5. **ADD two missing workflows** — Create `/test` command (dedicated test runner pipeline) and `/migrate` command (Supabase migration workflow). The gap between commands and actual dev workflows is most visible here; database migrations in a Supabase-first product have no agent-assisted path.
