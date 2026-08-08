---
date: 2026-08-08
role: ceo
session: ceo-capability-gap-map
task: Capability gap map — T5 harvest of 14 external OSS agent-framework projects vs. Beamix's own baseline (per docs/08-agents_work/2026-08-08-AGENT-SYSTEM-RETHINK-HANDOFF.md)
tier: lite
qa_verdict: N/A
qa_note: Read-only research/harvest task. No source code, agent, skill, or workflow files were changed on any branch. Nothing to gate or merge.
pr: none
branch: none (workflow-only; ceo-2-1786169719 worktree unchanged, HEAD still origin/main deabafd)
---

# CEO Session — Capability gap map

## Outcome
Ran the "capability gap map" harvest scoped in the 2026-08-08 handoff doc, using the full approved run (~60-100 agents) Adam explicitly chose over a cheaper survey-only pass. Built a new T5 workflow script, `.claude/workflows/capability-gap-map.js` (sibling of `agent-audit.js`, reusing its resolve→extract→verify→adopt skeleton with a new 5-dimension inventory schema: agent_roster, skill_corpus, command_set, hook_library, sandbox_permission_model), and ran it as `wf_e3a4ad25-1d2`.

**Result:** 60 agents, 0 errors, ~4.86M tokens, 48 minutes. 10/14 target projects resolved (6 deep-cloned: BMAD-METHOD, anthropics/skills, doncheli/don-cheli-sdd, github/awesome-copilot, VoltAgent/voltagent, openclaw/openclaw; 4 API-surveyed: spec-kit, cloudflare/agents, cloudflare/cloudflare-os, rokicool/gsd-opencode). 4 unresolved (agent-os, "superpowers", rohitg00's toolkit, "qm") — the resolver correctly refused to guess among ambiguous candidates rather than picking wrong; two have strong single candidates (`buildermethods/agent-os`, `rohitg00/awesome-claude-code-toolkit` — 135 agents/35 skills/42 commands, almost exactly the handoff's "rohitg00 136 agent files" claim) worth a cheap targeted follow-up.

209 raw capabilities collapsed across the 5 dimensions: 49 HAVE, 121 PARTIAL, 39 confirmed GAP (0 flagged as suspect by the baseline cross-check safety net — a positive signal). Top-20 gaps by source-project frequency were deep-dived; 15 survived adversarial evidence verification and became recommendations (13 ADAPT, 2 REJECT — explicitly-dismissed anti-patterns worth recording so they aren't rediscovered). 3 deep-dive findings were caught citing fabricated or misattributed evidence (in two cases, Beamix's own config paths bled into the "evidence" for an external repo) and were correctly demoted to open questions rather than allowed through — the evidence-gate safety net worked as designed, not just in theory.

**Decision point for Adam, surfaced but not resolved by this session:** the 15 recommendations, if all actioned, net +6 new files (agent/skill/command/hook) with zero proposed deletions — against the handoff's binding constraint that net agent/skill counts must not rise. The prior session's methodology audit already identified 12 skills safe to cut with zero live references; pairing any actioned new-file recommendation with one of those would keep the net at zero or negative.

Full report published: **[Capability Gap Map artifact](https://claude.ai/code/artifact/7399b50f-ab61-48a9-9fa6-49d3ec2960e7)** — KPI breakdown per dimension, all 39 gaps ranked by frequency, full evidence/mechanism/risk for all 15 recommendations, the 2 rejects, unresolved-target candidates, the 5 failed-verification findings (with the fabrication catches called out), 19 deferred gaps, and full methodology.

## Decisions made
- Chose the "full approved run" scope (Adam's explicit choice via AskUserQuestion) over a cheaper survey-only first pass, given the handoff already budgeted 60-100 agents across phases and this exceeds the session's default 15-agent workflow guideline and the CEO's own $10-15 T5 cost ceiling — flagged to Adam before firing, per the risky-action confirmation norm for spend decisions.
- Skipped the two-blind-half extraction pattern `agent-audit.js` uses for architecture axes (subtle semantic judgment) since inventory counting is more mechanical; reserved the expensive adversarial-verify step for the deep-dive/recommendation stage where it actually gates an action.
- Precomputed Beamix's own baseline by hand (Bash/Read on this worktree) rather than having an agent re-derive it, so the diff is grounded in verified ground truth, not another agent's self-report — including the real-vs-nominal function of each hook (schema-lint.js and stop.sh are non-functional per the prior session's 2026-08-08 audit), which materially changes several PARTIAL/GAP calls in hook_library and sandbox_permission_model.
- Did not spend additional budget chasing the 2 high-confidence unresolved targets (agent-os, rohitg00's toolkit) this session — surfaced as an open decision for Adam instead of unilaterally expanding scope further.

## Addendum — follow-up + prioritized plan (same session, continued)
Adam's calls via AskUserQuestion: (1) offset net-file-delta with the 12 pre-verified cuts, (2) chase the 2 high-confidence unresolved targets, (3) re-verify container isolation, (4) draft a prioritized plan now.

Ran a small follow-up workflow (`capability-gap-map-followup.js`, `wf_394f5e4c-3b9`, 8 agents, 0 errors, 16 min):
- `buildermethods/agent-os` resolved — ships **zero** agents, hooks, or sandbox model at current HEAD (v3.0); its own changelog says it deliberately retired its prior subagent roster ("frontier models handle this well on their own now"). No new recommendations from it — a field-trend data point, not a source to port from.
- `rohitg00/awesome-claude-code-toolkit` resolved — confirmed 136 agents / 40 skills / 42 curated commands (+220 more via 120 bundled plugins) / 20 hooks, richer than its own README claims. Directly read against Beamix's actual `.claude/hooks/pre-tool-use.sh` (not just trusted the source project's framing) → new recommendation: extend pre-tool-use.sh with structural decomposition of compound Bash commands (nested `$()`, heredocs) before pattern-matching, since it currently does flat-string regex only.
- Container/VM isolation of agent execution: redone with an explicit correction (cite the actually-invoked `execInContainerStream`, not the dead `execInContainer` that fooled the first pass) — **10/10 evidence now verified**, promoted from open question to recommendation #16.

**17 total recommendations** (15 ADAPT/actionable + 2 REJECT), sequenced into a 4-wave prioritized plan in the artifact: Wave 1 hardens the one mechanism that already works (compound-command decomposition, Actions SHA-pinning, commitlint — all S effort); Wave 2 closes the inbound-content gap (prompt-injection scanning, credential scoping, per-skill envelopes, output redaction); Wave 3 fixes already-broken promises (cpo.md's unenforced spec-compliance claim, git pre-commit gate, skill overrides, runtime corpus growth); Wave 4 defers the big bets (container isolation, office-doc skill, multi-host command rendering, install/uninstall CLI — all L or speculative-payoff). Net-file-delta policy applied: `stripe-integration` + `clerk-auth` cut unconditionally (wrong-stack landmines), the other 6 new-file recommendations each paired 1:1 with one of the remaining 10 pre-verified cuts, 4 cuts left as spare headroom.

Artifact redeployed at the same URL with the plan as the first section (Adam flagged he doesn't have time to read a long report — plan is now front-and-center, detail is reference-only below it).

## Blockers
None. Remaining open items (not blocking, listed in the artifact): 2 targets still unresolved with no strong candidate ("superpowers", "qm" — genuinely ambiguous, not pursued further), 2 deep-dive findings still failed-verification and not redone (out of scope for this follow-up).

## Session file
docs/08-agents_work/sessions/2026-08-08-ceo-capability-gap-map.md
