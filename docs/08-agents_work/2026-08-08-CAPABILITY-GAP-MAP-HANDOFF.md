# Capability Gap Map — Handoff

**Date:** 2026-08-08 · **From:** `ceo-capability-gap-map` · **Next task:** execute Wave 1 of the prioritized plan (implementation, not more research)

---

## Read this first

1. **The harvest phase is done.** Prior session (`ceo-gsa-kit-audit`, see `docs/08-agents_work/2026-08-08-AGENT-SYSTEM-RETHINK-HANDOFF.md`) diagnosed *why* the QA gate doesn't enforce anything. This session inventoried *what to actually build* — 14 external agent-framework projects, diffed against Beamix's own verified baseline, collapsed into capabilities, evidence-gated. **Do not re-run the harvest.** Full data, all 39 gaps, all 17 recommendations, and the prioritized plan are in the published artifact linked from `docs/08-agents_work/sessions/2026-08-08-ceo-capability-gap-map.md` (redeploys to the same URL — re-read that session file for the link before doing anything else).
2. **The next task is implementation, not more analysis.** Adam has already made the calls that were blocking action: net-file-delta gets offset against 12 pre-verified skill cuts, the 2 resolvable unresolved targets were chased (done), container isolation was re-verified (done, now recommendation #16). What's left is dispatching CTO to actually brief workers for Wave 1.
3. **This is a separate thread from `ceo-gsa-kit-audit`'s Phase 0 branches.** `fix/coding-integration-ref`, `docs/agents-md-real-roster`, `feat/agent-audit-workflow`, `feat/system-redesign-workflow` are a different CEO session's unmerged work — not touched by this session, still pending someone's attention. Don't conflate the two threads.

---

## What shipped this session

- `.claude/workflows/capability-gap-map.js` + `capability-gap-map-followup.js` — new, reusable T5 workflow scripts (sibling of `agent-audit.js`'s resolve→extract→verify→adopt skeleton, retargeted at capability inventory). Documented in `.claude/workflows/README.md`.
- Two runs: main (`wf_e3a4ad25-1d2`, 60 agents, 0 errors, 48 min) + follow-up (`wf_394f5e4c-3b9`, 8 agents, 0 errors, 16 min). 68 agents total, 0 errors across both.
- 209 capabilities collapsed across 5 dimensions (agent_roster, skill_corpus, command_set, hook_library, sandbox_permission_model) from 12/14 resolved external projects, diffed against Beamix's hand-verified baseline (26 agents, 149 skills, 13 commands, 7 hooks).
- **39 confirmed gaps → 17 evidence-gated recommendations** (15 ADAPT/actionable + 2 REJECT, recorded so they aren't rediscovered) → sequenced into a **4-wave prioritized plan**, published as the lead section of the artifact.

## The prioritized plan (summary — full detail + evidence in the artifact)

| Wave | Theme | Items | Effort |
|------|-------|-------|--------|
| **1** | Harden what already works | Structural (not flat-regex) compound-Bash-command decomposition in `pre-tool-use.sh`; GH Actions SHA-pinning + dependabot; commit-message convention (commitlint) | S, S, S |
| **2** | Close the inbound gap | Prompt-injection scanning (new UserPromptSubmit hook); least-privilege credential scoping; per-skill capability envelope; hooks that redact secrets from tool output | M each |
| **3** | Fix already-broken promises | Spec-as-machine-contract drift detection (cpo.md promises this, unenforced); local git pre-commit gate; team/personal skill overrides; runtime corpus growth (draft→approve pipeline) | M each |
| **4** | Bigger bets, sequence last | Container/VM isolation of agent execution (L, re-verified); office-document skill (needs a Python/LibreOffice toolchain Beamix doesn't have); multi-host command rendering (no live second host to justify yet — backlog); install/uninstall CLI + packaging (L, validated need via Adam's `adamos` fork) | L, M, M, L |

**Net-file-delta policy (Adam's decision, 2026-08-08):** cut `stripe-integration` + `clerk-auth` unconditionally (wrong-stack landmines, independent of anything else). Pair each of the other 6 new-file recommendations 1:1 with one of the remaining 10 pre-verified zero-reference cuts (pairings are in the plan table in the artifact — e.g. commit-message-convention ↔ `git-pr-workflows-git-workflow`). 4 cuts (`payment-integration`, `frontend-dev-guidelines`, `create-pr`, `parallel-agents`) are spare headroom, not required.

---

## NEXT SESSION'S TASK — execute Wave 1

Wave 1 is 3 items, all S effort, all `extend_existing`/one `new_file` (paired):

1. **Structural compound-command decomposition** — extend `.claude/hooks/pre-tool-use.sh` to split on unescaped `$()`, backticks, and heredoc bodies before running the existing grep rules, so nested subshells/heredocs can't evade the blocklist. Self-evidenced this session by directly reading the hook (not deep-dived by an agent) — read the artifact's recommendation card for the exact gap description before implementing.
2. **GitHub Actions SHA-pinning** — pin every `uses:` line in `.github/workflows/*.yml` to a 40-char commit SHA + version comment, add `.github/dependabot.yml` (`package-ecosystem: "github-actions"`) to keep pins from going stale. `enforced_by` in the artifact names the exact verify-step shape.
3. **Commit-message convention (commitlint)** — new `.husky/commit-msg` + `commitlint.config.js` (extends `@commitlint/config-conventional`, scope the type-enum to Beamix's actual `feat|fix|chore` branch-prefix convention, not commitlint's broader default) + a `commit-lint` job in `qa-lead-pass.yml` as a required branch-protection check. Pair with cutting `.claude/skills/git-pr-workflows-git-workflow/`.

**Dispatch shape:** T2 (Dispatch-Packet, default) — spawn CTO with a brief covering all 3 items (they touch `.claude/hooks/`, `.github/workflows/`, and possibly `.husky/` — CTO risk-tiers, likely Full given hook + CI-workflow changes; confirm whether `.claude/hooks/*.sh` edits classify as Irreversible under the "workflow file" trigger before scoping the QA gate). Read each recommendation's full `mechanism`/`evidence`/`enforced_by`/`risk` fields from the artifact — they're written as implementation-ready specs, not just findings.

**Also open, lower priority:**
- `superpowers` and `qm` remain unresolved with no strong candidate — not worth pursuing further unless Adam has a more specific pointer.
- 2 deep-dive findings still failed verification and weren't redone this session (`Supply-chain policy checks on dependency changes`, `Typed hook contracts with priority/ordering/block-cancel semantics`) — both are in the artifact's "Needs your input" section if worth a redo later.
- 19 gaps were never deep-dived at all (deferred past the top-20 cap) — full list in the artifact.
- `.claude/memory/DECISIONS.md` is at 58 entries against the documented ≤50 cap — archiving is overdue.
- `ceo-gsa-kit-audit`'s Phase 0 branches (see point 3 above) are still unmerged and un-gated.
