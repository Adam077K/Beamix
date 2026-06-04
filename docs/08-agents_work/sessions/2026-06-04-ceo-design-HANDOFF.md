---
date: 2026-06-04
role: ceo
task: design-track-handoff
type: handoff
---

# HANDOFF → next CEO session (design track)

You are the CEO for Beamix's **design track**. Another session owns the agency-MVP **pipeline/engine** work on `main` — do NOT touch their files (e.g. `agent-pipeline-chain.test.ts`, approval-gate, inngest). Coordinate, never conflict.

**Mission:** take the Beamix product UI from "AI-generated / vibe-coded" to category-defining (Stripe/Linear/Anthropic grade). The founder judges richness/soul, not just "clean."

---

## What shipped (on `main`)
- **PR #128 (MERGED) — Wave A foundation:** white-canvas flip, PageHeader heading system (Inter Medium 30px/-0.02em), Stripe-grade card tokens, "selling" EmptyState + Error/Loading templates, mobile overlay drawer. Also fixed a latent `ui/button.tsx` `asChild` Slot bug (React.Children.only 500).
- **PR #130 (MERGED) — Free scan, instrument-grade [mock data]:** ENTRY → honest engine-by-engine SCANNING LEDGER (real customer queries streaming, ~12s dwell) → score REVEAL. Passed the design-critic gate. Includes a **dev-only CSP fix** in `next.config.ts` (gated `unsafe-eval` to development; production CSP unchanged) — this unblocked React hydration in `next dev`. Real-engine seams documented in `apps/web/src/app/(public)/scan/_components/{useMockScan.ts,scan-contract.ts}` (wiring the real engine = the OTHER session's lane).

## What's awaiting the FOUNDER
- **PR #133 (OPEN, gate GREEN, `risk:irreversible`) — the Design Operating System.** Founder must merge it. It is the design *machinery*, not a screen:
  - `docs/design/DESIGN-WORKFLOW.md` — the documented system.
  - `.claude/agents/product-designer.md` (UPGRADED) — dedicated front-end designer; 7 craft skills hard-wired always-on; reference protocol; **absorb-the-vibe-NEVER-clone** rule; self-verifies with Playwright.
  - `.claude/agents/design-critic.md` (REWRITTEN) — grades **craft-parity & feeling vs references** side-by-side; verdict enum `PASS|NEEDS_WORK|CRITICAL_ISSUES`; copy-fidelity grading FORBIDDEN.
  - `.claude/agents/design-polisher.md` (NEW) — craft-density specialist in the loop.
  - `docs/design/references/` — `_product-feel/` (global product-soul, uses README.md) + `_TEMPLATE/` + `dashboard/` + `home/` drop-zones (use REFERENCE.md).
  - `.claude/workflows/design-screen.md` — ultracode orchestrator: `Workflow(name: "design-screen", args: "<screen>")`.

## The design method (founder-approved via a grill session)
References are **VIBE, not BLUEPRINT** — absorb the feeling/craft-level, synthesize ORIGINAL Beamix-language work, steal the MOVE never the layout. Pipeline: **REFERENCE → DIRECTION → BUILD → VALIDATE(loop)**. Validate = critic (craft-parity) ↔ polisher loop until indistinguishable in craft-level from the references. **3 founder checkpoints:** (1) lock the reference folder, (2) ~50% first-paint, (3) judge final. Two reference folders: `_product-feel/` (global, set once) + per-screen. Two run-modes: ultracode Workflow OR CEO-Task-dispatch via design-lead.

---

## IMMEDIATE NEXT JOB (where this session stopped)
**Pre-seed the reference boards for `dashboard` + `home`** so the founder reacts/swaps instead of starting blank, then run the pipeline.

⚠️ **The parallel-Playwright approach FAILED — do NOT repeat it.** 3 subagents shared ONE Chrome, clobbered each other's tabs, screenshots failed. **DISCARD any pre-seed screenshots from 2026-06-04 (already deleted).** Redo the capture **SEQUENTIALLY** — ONE agent (or CEO inline) using ONE browser, one URL at a time. Curated target list + the "what we steal = the move" notes are in this session's history and in `docs/design/references/{dashboard,home}/REFERENCE.md` + `_product-feel/README.md`.

⚠️ **Auth-wall reality:** the best references (Stripe/Linear/Mercury actual app screens) are behind login — can't Playwright them live. Pull from public marketing pages + live public demos (Plausible's `plausible.io/plausible.io` is real). **Refero is the proper tool but its subscription is EXPIRED — founder must reactivate it** for real app-internal reference screens.

**Founder's required inputs to run dashboard+home:** (1) merge #133, (2) reactivate Refero, (3) drop/approve 2-3 north-star references per screen + seed `_product-feel/` once. The starting board (once captured sequentially) makes step 3 a "react & swap" 5-min job.

---

## Hard-won lessons / gotchas
- **Parallel Playwright subagents contend on one Chrome → run design-critic/screenshot work SEQUENTIALLY.**
- **Verify everything yourself** — re-screenshot via Playwright, re-run typecheck/build for real exit codes. Agent summaries stall mid-task and report optimistically. Build agents reliably stall ~130–160k tokens right before commit/push — resume via SendMessage, or CEO commits the uncommitted work + verifies.
- **Local preview recipe** (UI audit, no real secrets): write `apps/web/.env.local` with real public URL `https://zhjxdwcqxhwletkpuwyl.supabase.co` + JWT-shaped PLACEHOLDER anon/service keys + `LOCAL_PREVIEW=1`; add an uncommitted middleware top-guard `if (process.env.LOCAL_PREVIEW==='1') return NextResponse.next({ request })`; `pnpm -F @beamix/web dev -- -p <port>` (avoid 3000, other session). Pulling live Supabase keys is blocked by the classifier — don't; placeholders render the UI fine. Drive controlled inputs with Playwright `pressSequentially`+Enter (not `.fill()`).
- **Don't break prod CSP** — the `unsafe-eval` fix is dev-only (NODE_ENV gate). The classifier will block editing the committed CSP without founder authorization.
- **Prod `next build` currently FAILS** on the other session's pre-existing ESLint `any` errors (their lane, out of scope) — so deploys are blocked until they fix it; not a design-PR blocker.
- **Don't bundle a merge with an AskUserQuestion** in one batch. QA gate: agent/workflow files floor to **Irreversible** → PR needs `risk:irreversible` label + a session file with `qa_verdict: PASS` (slug must match `*-<branch-slug>.md`).

## Key artifacts
- `docs/08-agents_work/design-audit-2026-06-03/` — all audit + direction docs: `DESIGN-DIRECTION.md`, `DESIGN-SKILLS-STACK.md`, `FREE-SCAN-DIRECTION.md`, `CRITIC-REPORT.md`, 28 before-screenshots.
- `docs/design/` — the design OS + reference scaffolding (canonical version on PR #133).
- Memory: `project_design_initiative_2026_06_03` (full thread, decisions, recipes).

## Loose ends
- Stale agent worktrees under `.claude/worktrees/agent-*` and `.worktrees/{design-os,freescan-instrument-grade,design-wave-a-foundation,...}` — prune with `git worktree prune` / `git worktree remove` as needed.
- Founder mentioned an existing ultracode "designing" workflow we could never find in the repo — if they surface the path, merge ours (`.claude/workflows/design-screen.md`) into it.

## First move for the next session
1. Confirm #133 status (merge it if founder approves).
2. Pre-seed `dashboard` + `home` reference boards **sequentially** (one browser).
3. Show founder → they react/swap (checkpoint 1) → run `Workflow(name:"design-screen", args:"dashboard")` (or design-lead dispatch) → first-paint checkpoint → final.
