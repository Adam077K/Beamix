---
title: WS6 Deep Review — What the Second Pass Found
date: 2026-05-11
audience: Adam — pre-6B conversation prep
read_time: 10 minutes
source_doc: WS6-DEEP-REVIEW-AND-DELTAS.md
---

# WS6 Deep Review — What the Second Pass Found

## What this doc is for

After the first WS6 synthesis, 5 critics ran a parallel deep pass — each looking at the 21 agent scaffolds from a different angle (logic, completeness, cross-agent flow, improvement, stress-test). This doc distills what they found that's different from the first review. You now have 15 decisions to make before Phase 6B instead of 10: the original Q1-Q10 plus 5 new ones (Q11-Q15) that only surfaced in this second pass.

---

## The 3 biggest findings (architectural, not stylistic)

### 1. CTO Daily Plan can't actually dispatch workers

The current scaffold says "CTO Daily Plan spawns 6 parallel workers." That sentence is wrong in a fundamental way.

Anthropic Routines are fire-and-terminate — they run, they write output, they stop. They have no ability to spawn or orchestrate other agents. Workers like parallel-builder, parallel-researcher, and parallel-critic are interactive Task subagents — they only exist inside an interactive CEO session, where you're actively present in the Claude Code terminal. A Routine can't reach in and start one.

So the CTO Daily Plan as currently written describes a capability the system doesn't have. Two critics flagged this independently.

**What to do instead:** Reframe CTO Daily Plan's output as a work proposal for you. It reads the codebase, reviews open tickets, and produces a detailed breakdown — "here's what to parallelize today, here's what needs your judgment, here's what an agent can handle." You review that proposal, then decide which workers to fire manually in an interactive CEO session. The 6 worker `.md` files stay as templates you use in those sessions. They're not Routines and they never get provisioned in claude.ai. The INDEX.md line that says "spawned by cto-daily-plan by default" needs to be updated to reflect this.

This is a framing fix, not a structural rebuild. The 6 worker files are still valuable — they just work differently than the scaffold implied.

---

### 2. Synthesizer's `@board` trigger doesn't fire anything

Synthesizer is supposed to run when you type `@board` in a Linear comment. The problem: the Cloudflare bridge — the piece that listens to Linear events and fires Routines — has no handler that looks for `@board` text in comments and maps it to the Synthesizer Routine ID. It only fires on labels. So you'd type `@board`, the bridge would receive the event, find no matching label, and do nothing. The board meeting would silently deadlock.

The current workaround that actually works: manually add the `agent:synthesizer` label to the Linear ticket. That fires correctly. Two critics caught this gap.

There's a second problem here too: the 4 board-meeting personas (Visionary, Strategist, Architect, Aria) are in the scaffold as if they're standalone Routines with their own bearer tokens. They're not — they're roles that exist only inside a Synthesizer session. The Synthesizer reads their instructions and simulates their voices; they don't run independently. Treating them as Routines means provisioning 4 slots in claude.ai that do nothing, and setting 8 wrangler secrets that are never used.

**What to do:** For the `@board` gap, either wire a comment-event handler in the bridge that looks for `@board` text, or document clearly that `@board` = "add the `agent:synthesizer` label." No ambiguity. For the personas, remove them from the Routine provisioning list entirely. Add a `round_sequence` field to the Synthesizer's own config so the 4 persona names are machine-readable — that's all you need.

This matters beyond just saving slots. The 6 workers have the same problem: they're not Routines either. Reclassifying both workers and personas saves **10 Routine slots in claude.ai and 20 wrangler secrets**. That's the Q13 decision below.

---

### 3. All 21 agent bodies are still placeholders

This isn't new — it was always the plan that Phase 6B fills in the bodies. But the deep review made the consequence concrete: every resilience property in every agent is currently unimplemented.

When Mem0 goes down, what does the agent fall back to? The scaffold doesn't say — it's in the body stub. When an agent hits an Anthropic error mid-execution, does it write to audit_log before stopping? Unknown — body stub. When a Linear MCP call fails, does the agent retry, fall back to reading from memory, or just stop? Body stub.

All 5 critics independently noted that the frontmatter looks complete, but the frontmatter is just headers. The actual behavior — try/catch wrappers, Mem0 fallback to Anthropic Memory Tool, error writes to audit_log before aborting, Linear query predicates that don't return ambiguous results — none of this exists yet.

**What to do:** Phase 6B needs a mandatory error-handling section in every agent body, not just the happy path. The pattern is: explicit try/catch at the top level, named fallback for each MCP dependency, audit_log write before any abort. Without this, agents will fire and silently stop on partial failures with nothing in the audit trail to explain why.

---

## Roster proposals (Q11-Q13)

### Add security-watcher (HIGH — Q11)

A daily agent that runs dep CVE scanning, checks for exposed secrets, and reads audit_log for anomalies. Fires at 8:45 PM in Window 4 on Sonnet. Costs $0.30 per fire — about **+$9/month**.

Why this is the gap worth closing: all 10 disaster-recovery runbooks currently require Adam to notice something is wrong and manually check. There's no agent whose entire job is to look for security issues and surface them before they become disasters. Security-watcher fills that role without requiring you to remember to look.

CEO recommends YES.

---

### Add ai-search-rank-tracker (MEDIUM — Q12)

A daily agent that checks Beamix's own position in AI search results — asking ChatGPT, Perplexity, and Claude "what's a good AI SEO tool?" and recording where Beamix appears. Fires at 5:42 AM in Window 1 on Sonnet. Costs $0.35 per fire — about **+$10/month**.

The irony this closes: Beamix is a GEO platform — its entire product value proposition is that it tracks and improves AI search visibility. Currently Beamix has no agent watching its own AI search rank. Competitors do this manually or not at all. Closing this gap is both a product integrity story and useful data for the business.

CEO recommends YES.

If both agents are added, the roster grows to 23 agents and the max monthly Routine cost increases by $19. That's still well within the war room budget.

---

### Reclassify personas and workers as non-Routines (Q13 — strongly recommended)

The 4 personas (Visionary, Strategist, Architect, Aria) and the 6 workers (builder, researcher, critic, tester, deployer, watcher) are currently scaffolded as Routines. They shouldn't be.

Personas are voices inside a Synthesizer session — the Synthesizer reads their instructions and speaks in their perspective. They have no independent cron schedule, no independent bearer token, and no need to be provisioned in claude.ai.

Workers are agents you spawn manually inside an interactive CEO session in your terminal. They're powerful, but they're not scheduled and they're not autonomous Routines.

Reclassifying both groups saves 10 Routine slots in claude.ai plus 20 wrangler secrets you'd otherwise need to create, manage, and rotate. The `.md` files for all 10 stay — they become templates you use in interactive sessions instead of Routines you provision.

After reclassification: 11 original Routines + 2 proposed additions = **13 Routines to provision in claude.ai**. Not 21.

CEO recommends YES.

---

## Per-agent tweaks (top 10, ranked by impact)

These come from the D4 improvement critic and are applied during 6B body-writing:

1. **Synthesizer budget: $1.00 → $2.50.** A 4-round board meeting reads ~2,000 words of persona output and synthesizes to locked decisions. At Opus pricing, $1 cuts off before it finishes. $2.50 is the realistic floor confirmed by token math. (Note: first critique said $4; deep review says $2.50 is right. Pick $2.50.)
2. **Competitor Pulse maxTurns: 30 → 15.** Cuts the session cost roughly in half for a Routine that usually needs 5-8 turns to do its job.
3. **Competitor Pulse: drop `deep-research` skill.** Three skills loaded at $0.40/fire is over-provisioned for a daily pulse check. Drop `deep-research`, keep the other two.
4. **EOD Sync: grant Mem0.** The scaffold lists the memory skill but doesn't grant Mem0 access — the skill instructs the agent to call tools it can't reach. Fix this by granting Mem0 (reverses Q5's earlier recommendation of B; Adam should confirm explicitly in 6B).
5. **Parallel-researcher: grant Linear read-only.** Currently denied, which means it can't read the tickets it's supposed to research against. Grant read-only.
6. **Parallel-builder: enforce Supabase read-only.** Currently ambiguous. Lock it to read-only — the builder should never write to the database directly.
7. **GEO Algorithm Signal budget: $1.50 → $2.50.** Weekly Opus run on scan_results needs more room to do the deep analysis it's designed for.
8. **Auto-Unblock budget: $0.50 → $1.00.** Needs room to read audit trail, query GitHub CI logs (per Q6), and attempt a fix — $0.50 is too tight for a diagnostic agent.
9. **Morning Digest: shift 05:35 → 05:45.** Advisor writes to Mem0 at 05:30. Morning Digest reads from Mem0. A 5-minute gap is a real race condition. Ten more minutes eliminates it.
10. **Advisor: swap skills.** Drop `prompt-engineering` (not relevant to what Advisor actually does), add `startup-metrics-framework` (directly useful for the daily brief).

---

## New questions for 6B (Q11-Q15)

**Q11 — Add security-watcher?** High-recommended, +$9/month, closes the "Adam has to notice security issues himself" gap. All 10 disaster-recovery runbooks currently assume manual detection.

**Q12 — Add ai-search-rank-tracker?** Medium-recommended, +$10/month, closes the GEO-platform-blind-to-own-rank irony. The only GEO platform with no daily check on its own AI search visibility.

**Q13 — Reclassify 4 personas + 6 workers as non-Routines?** Saves 10 claude.ai Routine slots and 20 wrangler secrets. The scaffold currently treats them as Routines; they're Task subagents. Strongly recommended — this is a correctness fix, not a preference call.

**Q14 — Wire `@board` comment trigger or document the workaround?** Either add a comment-event handler in the Cloudflare bridge that detects `@board` and fires Synthesizer, or officially document that `@board` = "add the `agent:synthesizer` label to the ticket" and update the UX guidance. Both work; the bridge wiring is cleaner long-term.

**Q15 — Narrow the no-Telegram cost alerts rule?** Q7 locked "no real-time Telegram cost alerts" to avoid alert fatigue. The deep review found that rule has been applied too broadly — it's blocking signals for genuine anomalies, not just chatty micro-alerts. The proposal: keep Q7 intact for routine cost reporting, but allow Telegram P0 pings for exactly three specific situations: canary write failure on two consecutive cycles, any agent firing more than 1.5× its daily spec cap, and audit_log schema-validation failures. Three precise carve-outs. Not a flood.

---

## What stays sealed (anti-revisions)

These were locked in the first synthesis and the deep review confirmed they're correct. Don't relitigate them in 6B.

1. **Personas have empty MCP grants.** Correct. Board meeting determinism depends on in-context data only — adding MCPs to personas introduces data inconsistency risk.
2. **Synthesizer has 3 MCPs (Linear, Supabase, Mem0).** Correct. These are its three legitimate output channels.
3. **Parallel-watcher is Supabase read-only.** Correct safety posture.
4. **Mem0 outage is a memory gap, not a data-loss event.** Framing matters: if Mem0 goes down, agents temporarily lose episodic memory. Customer data and the audit_log are unaffected. Don't escalate this to P0 in runbooks.
5. **runaway-watcher's cost-summing logic is sound.** The gap is fire-frequency (no counter per agent per 24h), not the cost-summing itself. Don't rewrite the watcher — add the fire-count check.
6. **EOD Sync's Mem0 grant flip needs explicit Adam confirmation.** The deep review recommends granting Mem0 to EOD Sync (reversing the earlier Q5-B recommendation). That's a deliberate reversal and Adam should say yes explicitly in 6B, not inherit it silently.

---

## What changed since the first synthesis

| Item | First synthesis said | Deep review says |
|---|---|---|
| Synthesizer budget | $1.00 → $4.00 (first critique) | $1.00 → $2.50 (D4 token math confirms; $4 was too high) |
| Personas | Keep 4 as lightweight Routines | Reclassify as Task subagents inside Synthesizer; remove from Routine provisioning |
| Workers | Keep 6 as Routines | Reclassify as Task subagents inside CEO sessions; not Routines |
| Roster size | 21 fixed | Propose 23 total, but only 13 are Routines to provision |
| Q7 Telegram policy | No real-time cost alerts, full stop | Keep for routine reporting; add 3 anomaly carve-outs (canary fail, fire-rate spike, audit_log corruption) |

---

## What happens next

Phase 6B is a 2.5-3 hour conversation. You and the CEO work through Q1-Q15 (about 30-35 minutes for the decisions), then write all 21 agent bodies — 13 Routine bodies, 6 worker templates, and 4 persona templates. CEO token cost is approximately **$12-18** in Opus.

After 6B, Phase 6C runs autonomously: split the shared CEO token into per-Routine tokens, you provision 13 Routines in the claude.ai UI (copy-paste the system prompts from 6B), run `wrangler secret put` for ~20 secrets, smoke test each Routine. WS6 locked.

---

## TL;DR

- **3 architectural defects found:** CTO Daily Plan claims it dispatches workers but Routines can't do that; Synthesizer's `@board` trigger has no handler so it silently does nothing; all 21 agent bodies are empty stubs, meaning every resilience property (error handling, Mem0 fallback, retry logic) is unimplemented.
- **2 roster additions proposed + reclassification:** Add security-watcher (+$9/mo) and ai-search-rank-tracker (+$10/mo); reclassify 4 personas and 6 workers as non-Routines, saving 10 claude.ai slots and 20 wrangler secrets — making the actual Routine count 13, not 21.
- **15 decisions for Phase 6B:** Q1-Q10 from the first synthesis plus Q11 (security-watcher), Q12 (rank-tracker), Q13 (reclassify personas/workers), Q14 (`@board` trigger wiring), and Q15 (narrow the Telegram ban to allow 3 anomaly carve-outs).

---

*Source: `WS6-DEEP-REVIEW-AND-DELTAS.md` + `WS6-SYNTHESIS-AND-OPTIONS.md`. If this doc and the synthesis conflict, the synthesis wins.*
