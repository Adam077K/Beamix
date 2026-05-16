---
title: Agent Rethink — Interview Decisions Log
date: 2026-05-16
status: LOCKED — Adam approved each item via AskUserQuestion
supersedes: parts of 05-MASTER-PLAN.md (where called out below)
read_time: 8 minutes
---

# Interview Decisions Log

This is the **single source of decision truth** captured during the 10-batch interview between CEO (Opus 4.7 session, 2026-05-16) and Adam. Each row is a locked decision. Where it diverges from 05-MASTER-PLAN.md, this file wins.

## Batch 1 — Org chart (top-level identity)

| ID | Decision | Recommendation | Adam's call |
|---|---|---|---|
| D1.1 | CEO model | Opus 4.7 | **Opus 4.7** ✓ |
| D1.2 | CCO existence | Defer | **Fold CCO into CPO** (CPO owns product + customer + onboarding) |
| D1.3 | CBO scope | Single (biz + finance + legal + HR) | **Single CBO** ✓ |
| D1.4 | Design-Lead reporting | Direct to CEO (peer) | **Under CPO** (product owns design) |

**Net org chart:** CEO (Opus 4.7) → CTO / CPO / CMO / CBO / QA-Lead / Research-Lead. **6 C-suite agents** (no CCO, no separate Design-Lead at Layer 2 — design-lead exists as an agent file under CPO).

## Batch 2 — Workers & naming

| ID | Decision | Adam's call |
|---|---|---|
| D2.1 | Worker count | **Merge to 10 workers** — collapse `qa-engineer` → `test-engineer`, `adversary-engineer` → `security-engineer` (Full-tier mode), `product-designer` → `frontend-engineer` |
| D2.2 | Naming | **Rename `*-developer` → `*-engineer`** (backend-engineer, frontend-engineer) |
| D2.3 | Legacy `debugger` (1,284 lines) + `codebase-mapper` (798 lines) | **Refactor to new schema, cut to ~250 lines each**, link to `systematic-debugging` skill |
| D2.4 | Workers writing to Linear | **No** — only Lead+ writes; workers return JSON to parent who synthesizes |

**Final worker list (13):** backend-engineer, frontend-engineer, database-engineer, devops-engineer, data-engineer, ai-engineer, security-engineer (with Full-tier adversary mode), test-engineer (also authors tests for QA), code-reviewer, researcher, technical-writer, design-critic, supabase-cleaner (specialist).

## Batch 3 — QA gates

| ID | Decision | Adam's call |
|---|---|---|
| D3.1 | Trivial QA | **Lint + typecheck via deterministic PostToolUse hook only** — no LLM judge for Trivial |
| D3.2 | Cross-family judge | **Claude (primary) + ChatGPT Codex (second perspective)** — Claude calls Codex in-session |
| D3.3 | Irreversible multi-judge verdict | **2-of-3 PASS to ship** (majority rules) + Adam veto |
| D3.4 | Bypass mechanism | **Per-PR, no TTL** — invalidated by new commits; logged to audit_log |

## Batch 4 — Codex integration + Memory

| ID | Decision | Adam's call |
|---|---|---|
| D4.1 | Codex invocation | **Codex CLI via Bash** — agents invoke `codex review --diff <patch>` |
| D4.2 | Codex tier | **Full + Irreversible only** (skip Trivial/Lite to control cost) |
| D4.3 | Codex billing model | **Adam's $20/mo ChatGPT Plus subscription** (not API-billed). Runs only on machines signed in to ChatGPT — i.e., interactive Claude Code sessions. **Routines (Anthropic cloud) cannot invoke Codex.** Documented constraint. |
| D4.4 | L2 episodic memory primary | **Mem0 cloud** (primary), **Anthropic Memory Tool** (auto-fallback after 3 Mem0 retries) |
| D4.5 | USER-INSIGHTS.md writers | **CPO + CMO only** — other agents return raw insights in JSON; CPO/CMO curate |

## Batch 5 — Skills + Linear + PRs

| ID | Decision | Adam's call |
|---|---|---|
| D5.1 | Skills authoring order | **Parallel with C-suite** — Phase 1 / 2 / 3 simultaneously |
| D5.2 | Orphan skills removal | **Move to `.archive/skills-orphans-2026-05-16/` for 90d**, then hard-delete |
| D5.3 | Linear granularity | **One sub-ticket per parallel worker spawn**; parent ticket synthesizes |
| D5.4 | PR strategy | **PR per worker**, merged independently when QA-Lead PASSes |

## Batch 6 — Routine behavior + observability

| ID | Decision | Adam's call |
|---|---|---|
| D6.1 | Routines that auto-create Linear tickets | **CTO Daily Plan + Content Idea Generator only**; others post comments |
| D6.2 | Telegram delivery defaults | **Loud:** Morning Digest, Advisor, EOD Sync. **Silent (Linear only):** Competitor Pulse (only on material change), GEO Signal, Friday Retro. **Event:** Auto-Unblock binary pings (3-cascade carve-out per WS4 Q5). |
| D6.3 | iOS Shortcut + Telegram bot deferred work | **Keep deferred** (Adam 2026-05-11: "not need") — wire later if Adam wants mobile capture |
| D6.4 | pgvector RAG corpus scope | **DECISIONS + sessions + brain MOCs + skills** (no code files — too volatile) |

## Batch 7 — Execution sequencing

| ID | Decision | Adam's call |
|---|---|---|
| D7.1 | Directory canonical | **`.claude/agents/` only — DELETE `.agent/agents/`** |
| D7.2 | Phase 0 execution timing | **In this session, after all interview is done — no rush** |
| D7.3 | Anthropic Routine provisioning | **Already done by Adam** — Phase 4 reduces to authoring .md files + verifying secrets |
| D7.4 | Promptfoo | (Adam asked for explanation — answered in Batch 8) |

## Batch 8 — Promptfoo + multi-judge + cost + /war-room

| ID | Decision | Adam's call |
|---|---|---|
| D8.1 | Promptfoo regression tests | **Yes — Phase 7**, 5 scenarios per critical agent, GitHub Action gates merge |
| D8.2 | Multi-judge variant for Irreversible | **3 different rubric prompts** (correctness+tests / security+RLS / maintainability+style) |
| D8.3 | Cost ceiling | **Subscription-bound, not $ cap.** Adam uses Claude Max 5× ($100/mo, 5h windows) + ChatGPT Plus ($20/mo, Codex). Future upgrade to Max 20× ($200/mo). No API billing. Bridge FireCountDO enforces rolling-15/day cap. |
| D8.4 | /war-room rebuild | **Research minimal-but-useful agent UIs first** (disler dashboard + Claude Code's native /teammates terminal) — then propose minimal additions to /war-room (do NOT over-build). |

## Batch 9 — Codex + war-room + PRs + memory fallback

| ID | Decision | Adam's call |
|---|---|---|
| D9.1 | Codex local-only constraint | **Accepted** — interactive CTO/QA sessions can call Codex; Routines cannot. Document. |
| D9.2 | /war-room drill-down | **Keep minimal + useful.** Research existing dashboards (disler, Claude native UI) first; propose minimal additions. |
| D9.3 | Trivial-tier PR requirement | **Yes — every change via PR with branch protection**; Trivial auto-merges on lint+typecheck pass via PostToolUse hook + qa-lead-pass.yml |
| D9.4 | Mem0 fallback trigger | **Automatic** — 3 retries with exponential backoff, then Anthropic Memory Tool. Logs fallback to audit_log. |

## Batch 10 — Colors + DECISIONS cap + Mem0 schema + personas

| ID | Decision | Adam's call |
|---|---|---|
| D10.1 | New C-suite colors | **CTO=blue, CPO=green, CMO=yellow, CBO=emerald, QA-Lead=red, Research-Lead=purple, Design-Lead=pink** (per CLAUDE.md table). CEO=gold (primary) / orange/teal/lime for parallel instances. |
| D10.2 | DECISIONS.md cap | **50 hot + archive older to DECISIONS_ARCHIVE.md** |
| D10.3 | Mem0 metadata required fields | **All required:** `source: <agent>+<session>+<input-hash>`, `confidence: high|med|low`, `expires_at: 30d/90d/null`, `agent_id`, `session_id` |
| D10.4 | Board personas | **Keep all 7** — visionary, strategist, architect, risk-modeler, customer-voice, aria, broad-adversary (WS2 Q4 + Q7 locked) |

## Final housekeeping

| ID | Decision | Adam's call |
|---|---|---|
| H.1 | 13 slash commands | **Keep all 13, rewrite each to map to new C-suite vocabulary** |
| H.2 | 10 GSD orphan agents | **Archive to `.archive/agents/gsd-pipeline-2026-05-16/`** (don't delete) |
| H.3 | Bash allowlist | **Strict:** only `git *`, `pnpm *`, `gh *`, `node *`, `mkdir`, `mv`, `cp`, `ls`. Workers needing beyond this must ask Adam. |
| H.4 | Production-readiness done signal | **All 7 phases pass DoD + 7 days of war-room running without P0 incident** |

---

## Delta against 05-MASTER-PLAN.md

The master plan's Section 2.3 (final inventory) is now:

| Category | Count | Files |
|---|---|---|
| Interactive C-suite | **6** (was 7) | ceo, cto, cpo, cmo, cbo, qa-lead — no cco |
| Cross-cutting leads | 2 | research-lead, design-lead (latter reports to CPO) |
| Workers | **13** (was 15) | backend-engineer, frontend-engineer, database-engineer, devops-engineer, data-engineer, ai-engineer, security-engineer (with Full-tier adversary mode), test-engineer (also QA test-author), code-reviewer, researcher, technical-writer, design-critic, supabase-cleaner |
| Standing Routines | 11 | unchanged |
| Board personas | 7 | unchanged |
| Legacy retained | 2 | debugger + codebase-mapper (BOTH refactored to new schema, ~250 lines each) |
| **Total active** | **41 files** | (down from 45 in the original plan) |

## Net work for Phase 0 (this session, no rush)

Adam directed Phase 0 execution **in this session after all planning was resolved**. Phase 0 = the safe hygiene cleanup that doesn't require new authoring. Specifically:

| # | Task | Estimated change |
|---|---|---|
| 0.1 | Delete `.agent/agents/` directory | Drop 34 files (.claude/agents/ is canonical) |
| 0.2 | Move 305 orphan skills → `.archive/skills-orphans-2026-05-16/` | ~68K lines moved |
| 0.3 | Move 10 GSD orphan agents → `.archive/agents/gsd-pipeline-2026-05-16/` | ~5,500 lines moved |
| 0.4 | Rename `backend-developer.md` → `backend-engineer.md` + update all 7 references | mechanical sed-rename |
| 0.5 | Rename `frontend-developer.md` → `frontend-engineer.md` + update all references | mechanical sed-rename |
| 0.6 | Rename `devops-lead.md` → `devops-engineer.md` (demoted to worker) | rename + body refactor for worker role |
| 0.7 | Rename `data-lead.md` → `data-engineer.md` (demoted to worker) | rename + body refactor for worker role |
| 0.8 | Regenerate `MANIFEST.json` after skill archival | ~167KB → ~36KB |
| 0.9 | Update `CLAUDE.md` to new C-suite model | rewrite "The Team" + "Memory" + "MCPs" sections |
| 0.10 | Update `.claude/settings.json`: strict Bash allowlist, PostToolUse extension for lint+typecheck | additive |
| 0.11 | Update `qa-lead-pass.yml` for XML verdict tag + new schema | additive |
| 0.12 | DECISIONS.md entry for this rethink | one append-only entry |
| 0.13 | `docs/00-brain/log.md` append | one-line activity entry |

**NOT in Phase 0** (deferred to Phase 1+):
- Authoring CPO/CMO/CBO files (Phase 2 — author the C-suite)
- Authoring the 14 new skills (Phase 3 — parallel)
- Authoring the 11 Routine .md files (Phase 4 — Adam already provisioned)
- Authoring the 7 board personas (Phase 5)
- Refactoring debugger + codebase-mapper to new schema (Phase 1)
- Archiving legacy leads (build-lead, product-lead, growth-lead, business-lead) — wait until C-suite replacements exist in Phase 2
- /war-room rebuild — wait until Phase 7 polish after researching existing dashboards
- Promptfoo authoring — Phase 7
- Codex CLI integration — Phase 6 (hook authoring)

## Next actions for the executor

After Phase 0 lands in this session, the natural follow-up sessions are:
1. **Phase 1** — Schema standardization on existing files (separate CTO session)
2. **Phase 2** — Author CPO, CMO, CBO files (parallel workers)
3. **Phase 3** — Author 14 new skills (parallel workers)
4. **Phase 4** — Author 11 Routine .md files (verify Adam's existing Console provisioning matches)
5. **Phase 5** — Author 7 board persona files
6. **Phase 6** — Author hooks (PostToolUse lint, Codex CLI integration)
7. **Phase 7** — Production readiness (Promptfoo, /war-room rebuild, DR re-test)

Each gets its own CEO session with structured brief.

---

**End of decisions log.** All branches resolved. Ready for Phase 0 execution.
