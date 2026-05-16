# START HERE — Next CEO Session Bootstrap

You are picking up the Beamix MVP build at the wave-orchestration layer. Everything you need is already specced. Your job is to launch the next wave with the right worker fleet and gate at QA before merging.

---

## 30-Second Orientation

- **Product:** Beamix — GEO platform for SMBs. Scans AI search visibility, diagnoses gaps, runs agents to fix it. Proactive automation → Inbox review model.
- **Decision (2026-05-13):** Hard reset of `apps/web/` before Wave 0. Existing 40% code is reference only, in `_archive/saas-platform-2026-05-13-reset/`.
- **Spec source of truth:** `docs/product-rethink-2026-04-09/` (15 board-locked files, April 15, 2026) + this build-prep folder (`build-prep-2026-05-13/`).
- **Pricing:** Discover $79 / Build $189 / Scale $499. 14-day money-back. **Annual pricing ships day-1** (Discover $63, Build $151, Scale $399/mo billed annually — per board April-17, supersedes the earlier "monthly-only" plan).
- **Agents:** 11 MVP-1 + 1 MVP-2 (Video SEO, deferred).
- **Quality bar:** Stripe / Linear / Apple / Anthropic-grade craft. Every space intentional.

---

## Cold-Start Reading Order (15 minutes)

Read these in sequence before doing anything:

1. `/Users/adamks/.claude/plans/i-want-you-to-warm-nebula.md` — parent plan + Adam's hard-reset decision
2. `00-INDEX.md` (this folder) — what's here, P0/P1 status summary
3. `../05-BOARD-DECISIONS-2026-04-15.md` — pricing, agents, UX locked decisions
4. `../07-AGENT-ROSTER-V2.md` — 11 agents business logic
5. `../08-UX-ARCHITECTURE.md` — 7-page UX spec
6. `01-P0-RESOLUTIONS.md` — every audit gap status
7. Whichever wave brief is next: `07-WAVE-0-BRIEF.md` → `10-WAVE-2-BRIEF.md`

### Critical operational substrate (Fix Agent 5 / Cluster H — read before the wave that touches them)

8. `../17-ANALYTICS-SPEC.md` — PostHog (EU) + 16 events + 2 funnels. Read before Wave 1 BE-3 spawn.
9. `../18-LEGAL-PUBLISHING-PLAN.md` — T&Cs / Privacy / Cookies / DPA. Read before Wave 2 Worker 5 spawn.
10. `../19-SUPPORT-CHANNEL-SPEC.md` — Plain (or Crisp) + support@beamixai.com + error-state CTAs. Read before Wave 2 Worker 4/5 spawn.
11. `../20-ADMIN-DASHBOARD-SPEC.md` — Adam `/admin` route + 6 read-only sections. Read before Wave 2 Worker 4 stretch.
12. `../21-DATA-GOVERNANCE.md` — GDPR deletion + retention + Supabase Pro PITR + DR runbook. Read before Wave 2 backend stretch.

---

## Current State (as of 2026-05-16)

| Item | Status |
|------|--------|
| Product spec | LOCKED (`docs/product-rethink-2026-04-09/` — 21 files) |
| Build-prep folder | COMPLETE — 14 files in this folder |
| 6-lens audit + 5-agent fix swarm | COMPLETE — 24/24 P0 + 42/42 P1 patched |
| ADQ-1..5 | RESOLVED 2026-05-14 |
| Domain (`beamix.tech` → `beamixai.com`) | CORRECTED 2026-05-15 (107 files, 0 stale refs anywhere) |
| **All waves (0 / 0.5 / 1 / 2) — spec side** | **READY** — every wave brief is paste-ready end-to-end. Hebrew product+business surface moved from Wave 2 → Wave 1 launch (board verdict 2026-05-16, P0-E): HE agent prompts (BE-1) + HE Resend templates (BE-3) + HE refund excerpt/receipt + HE support SLA ship at Wave 1. Wave 2 Worker 1B scope reduced to Hebrew QA + RTL polish + copy review (no prompt authoring). |
| Adam's manual setup | **SUBSTANTIALLY COMPLETE 2026-05-16** — see `06-ADAM-CHECKLIST.md` §Completion log |
| Wave 0 spawn | **UNBLOCKED** — Supabase + Anthropic + OpenRouter + Perplexity + Vercel + Turnstile + PostHog + Sentry + Resend + Email routing all configured. `apps/web/` archive is first action of Wave 0. |
| Wave 1 dependency | Paddle vendor ID + public key (Adam to fetch when re-logging into sandbox-vendors.paddle.com). Inngest Pro upgrade recommended pre-Wave-1. |
| Wave 2 dependency | Supabase Pro upgrade on `beamix-v2-prod` for production PITR backups. |

**Translation:** Wave 0 is fully spawnable now. The 3 deferred items map to specific later waves — no surprises, no global blockers.

---

## Your Next Action (Decision Tree)

**If you're a fresh CEO session and Adam pasted the orientation prompt from `13-CEO-HANDOFF-PROMPT.md`:** follow that prompt. Read the cold-start list, then ask Adam the 3 orientation questions. Don't auto-spawn.

**If you're continuing inside a session already familiar with the project:**

```
Has Adam confirmed Comet finished the manual setup (06-ADAM-CHECKLIST.md done)?
│
├─ NO  → Ask Adam for status. Do NOT spawn workers until env_block is verified.
│
└─ YES → Are you in a worktree? (run `git worktree list` to check)
         │
         ├─ YES, in `.worktrees/ceo-*` → Open 07-WAVE-0-BRIEF.md.
         │   Step 0: archive apps/web/ to _archive/saas-platform-2026-05-13-reset/
         │            (use main repo root, NOT this worktree).
         │   Step 1: spawn 3 Wave 0 workers per the brief.
         │
         └─ NO, in main repo → Same as above. Step 0, then spawn.
```

After Wave 0 merges → continue with `08-WAVE-0.5-BRIEF.md` → `09-WAVE-1-BRIEF.md` → `10-WAVE-2-BRIEF.md`. All briefs are paste-ready; no spec gaps remain.

---

## After Wave 0

```
1. Wait for all 3 Wave 0 PRs to merge (Adam reviews each).
2. Write session file: docs/08-agents_work/sessions/<date>-ceo-wave-0-foundation.md
3. Open 08-WAVE-0.5-BRIEF.md. Spawn 1 backend-developer for shared types.
4. After 0.5 merges → SPAWN design-lead (half-day prep per 09-WAVE-1-BRIEF.md
   §Design-Lead Prep). Do NOT spawn FE workers yet.
5. Adam reviews design-lead output → writes "design-lead approved" in wave
   thread (G-design-lead-approval gate per P0-B).
6. After Adam approval → spawn the 6 Wave 1 workers (3 BE + 3 FE) in parallel
   per 09-WAVE-1-BRIEF.md.
7. After Wave 1 merges → 10-WAVE-2-BRIEF.md (4 workers + qa-lead).
8. After Wave 2 → Go/No-Go gate → cutover.
```

**Wave gate order (P0-B):** `G0 → G0.5 → G-design-lead-approval (NEW) → G1 → G2 → Launch`. The new gate sits between Wave 0.5 ship and Wave 1 FE spawn. Without it, 6 FE workers ship divergent UIs that Wave 2 cannot reconcile.

---

## Worktree Hygiene (Critical)

You may be inside a worktree right now (e.g., `.worktrees/ceo-2-*`). All child worktrees must be created from the **main repo root**, NOT from within a worktree:

```bash
MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')
git -C "$MAIN_REPO" worktree add "$MAIN_REPO/.worktrees/<task>" -b feat/<task>
```

Verify with `git worktree list` after creation. If `<task>` appears nested under another worktree path, you did it wrong — remove and retry.

---

## QA Gate (Sacred)

No PR merges without QA Lead PASS. Use Risk-Tiered QA (memory `project_red_team_decisions_2026_05_05.md`):

- **Trivial** — Haiku-only review (e.g., copy edit, single-line fix)
- **Lite** — code-reviewer + qa-engineer + semgrep (e.g., new component, isolated feature)
- **Full** — Lite + security-engineer + adversary-engineer + Opus security (e.g., DB schema, agent system, billing, auth — all of Wave 0, 1, 2)

Adam reviews after QA passes. CEO and CTO cannot override QA — that's a hard rule.

---

## Identity & Color (CEO Convention)

Per project CLAUDE.md, set your session identity at start:

```
/color orange    # If you're the 2nd parallel CEO instance
/name ceo-wave-0    # Or whichever wave you're running
```

If a previous CEO has been running in this worktree, keep the existing name + color and continue from where they left off — check the most recent session file in `docs/08-agents_work/sessions/`.

---

## Memory Anchors

Project memory at `/Users/adamks/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/`. Relevant for build:

- `feedback_supabase_plpgsql.md` — never use LANGUAGE plpgsql with DECLARE; use LANGUAGE sql + CTEs
- `feedback_no_ai_labels.md` — zero AI disclosure in content output
- `feedback_no_timeline_planning.md` — don't include weeks/sprints/days in plans (already followed in these briefs)
- `feedback_dont_cut_agent_roster.md` — 11 MVP-1 agents is sized for value, not cost — don't cut
- `feedback_model_routing_rule.md` — Sonnet default, Haiku for simple lookups, Opus for orchestration/synthesis
- `project_pricing_v2.md` — Build is $189, NOT $199
- `project_quality_bar_billion_dollar.md` — Stripe/Linear/Apple/Anthropic-grade craft
- `project_inngest_tier_strategy.md` — start free tier, migrate to Pro at ~5 paying customers
- `project_red_team_decisions_2026_05_05.md` — Risk-tiered QA after every wave

---

## What's covered well (Fix Agent 5 audit pass)

Post-audit (2026-05-13), the plan is solid on:

- **Day-1 chain + leading-indicator panel** — `03-DAY-1-FLOW.md` + Wave 1 FE-1 wire the activation surface for the 14-day refund window.
- **Operational substrate** — analytics (`../17-ANALYTICS-SPEC.md`), legal (`../18-LEGAL-PUBLISHING-PLAN.md`), support (`../19-SUPPORT-CHANNEL-SPEC.md`), admin (`../20-ADMIN-DASHBOARD-SPEC.md`), data governance (`../21-DATA-GOVERNANCE.md`) — all five "Cluster H" missing-perspective absences specced.
- **Funnel discipline** — industry-select gate (Fix Agent 5 / I1) blocks YMYL refund leaks pre-paywall; scan-saved fallback (I5) closes CAC leak.
- **Naming canonicalization** — "AI Runs" everywhere user-facing (I7); USER_FACING_AGENT_LABELS map for action labels (board April-18).
- **Wave-orchestration layer** — worktree discipline, JSON returns, Risk-Tiered QA, slot props on `DashboardShell` — autonomous-army layer is solid.

## ADQ decisions (Adam-resolved 2026-05-14)

All 5 ADQs from the audit synthesis are resolved. Reference only — no further decision required.

- **ADQ-1 — Refund window.** **DECIDED: keep 14-day money-back guarantee.** Activation cliff (first citation week 3–4) is accepted risk; leading-indicator panel (Wave 1 FE-1) is the chosen mitigation, no T&Cs amendment.
- **ADQ-2 — Visual direction.** **DECIDED: ship per current `../13-DESIGN-SYSTEM-SPEC.md`.** Vercel-cold reference (`https://getdesign.md/vercel/design-md`) is canon; brand tokens (`#3370FF`, Inter/InterDisplay) override Vercel palette. Project-memory "Notion warmth" framing does NOT mix in. Workers do not hybridize — one stance, the one in `13-DESIGN-SYSTEM-SPEC.md`.
- **ADQ-3 — Discover tier.** **DECIDED: keep current.** 1 visible suggestion per weekly scan. Monitor Discover→Build conversion at month 2; revisit only if Discover churn >50%.
- **ADQ-4 — Hebrew payment rail.** **DECIDED: launch with cards (Paddle); add Israeli rails (Hora'at Keva, Bit, PayBox, etc.) as a month-2 priority backlog item.** Not a launch blocker. See `10-WAVE-2-BRIEF.md` §Post-Launch.
- **ADQ-5 — Refund-bomb cap.** **DECIDED: refund cap based on credit consumption.** If user has consumed >50% of their plan's AI Runs at refund-request time, the refund is capped at 50% of the price paid. ≤50% credits consumed → full refund. Configured in Paddle policy + enforced in BE-2 webhook handler (see `09-WAVE-1-BRIEF.md`). **Refund-cap math clarified 2026-05-16:** counts user-initiated consumption only; auto-runs (Day-1 chain, scheduled scans) excluded.

Full audit context in `audit-2026-05-13/00-SYNTHESIS.md` §Adam-decision items.

## If Something's Wrong With This Plan

If you notice contradictions between this folder and the source-of-truth specs (`05-BOARD-DECISIONS-2026-04-15.md` etc.), **the source-of-truth specs win**. This build-prep folder fills gaps; it does not override locked decisions.

Flag any contradiction to Adam before proceeding. Don't paper over it.

---

## Final Check Before Spawning

Before you spawn ANY worker, you can answer YES to:
- [ ] I read this START-HERE file
- [ ] I read 00-INDEX.md
- [ ] I read the wave brief for the wave I'm about to run
- [ ] Adam has confirmed the manual prereqs for that wave
- [ ] I know which worktree I'm in (`git worktree list`)
- [ ] I know which worker types I'm spawning and have the brief copy-ready

If any is NO, do the missing item first.
