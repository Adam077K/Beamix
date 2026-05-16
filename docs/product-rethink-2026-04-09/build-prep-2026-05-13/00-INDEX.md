# Build-Prep — 2026-05-13

Pre-flight artifacts produced before Wave 0 spawns. Closes the gaps flagged in `10-PRE-BUILD-AUDIT.md` (P0/P1) and packages every wave brief in ready-to-paste form.

**Decision context:** Adam confirmed **hard reset** of `apps/web/` on 2026-05-13. Build proceeds per `11-EXECUTION-PLAN.md` — existing code is reference only. See `/Users/adamks/.claude/plans/i-want-you-to-warm-nebula.md` for the parent plan.

## Current state (as of 2026-05-16)

| Layer | State |
|-------|-------|
| Product spec | LOCKED (21 files in `docs/product-rethink-2026-04-09/`) |
| Build-prep folder | COMPLETE — 14 files |
| 6-lens audit + 5-agent fix swarm | COMPLETE — 24/24 P0 + 42/42 P1 patched |
| ADQ-1..5 | RESOLVED 2026-05-14 |
| Domain correction (`beamix.tech` → `beamixai.com`) | DONE 2026-05-15 (107 files, 0 stale refs) |
| **Wave 0 / 0.5 / 1 / 2 briefs** | **ALL spec-ready — paste-ready end-to-end** |
| Adam's manual setup (`06-ADAM-CHECKLIST.md`) | **SUBSTANTIALLY COMPLETE 2026-05-16** — see Completion log section |
| **Wave 0 spawn** | **UNBLOCKED** — open a fresh CEO session per `13-CEO-HANDOFF-PROMPT.md` |
| Wave 1 deferral | Paddle vendor ID + public key (Adam fetches before Wave 1 BE-2 ships) + Inngest Pro upgrade |
| Wave 2 deferral | Supabase Pro upgrade for `beamix-v2-prod` PITR backups |

Wave 0 can spawn now from a fresh CEO session — see `13-CEO-HANDOFF-PROMPT.md` for the orientation prompt. The 3 deferred items have explicit wave gates and won't surprise anyone downstream.

## Reading order (next CEO session, cold-start)

1. `13-CEO-HANDOFF-PROMPT.md` — orientation prompt for a fresh CEO session (Adam pastes this into a new conversation; tells the new CEO to read context and then talk to Adam — NOT auto-spawn)
2. `11-START-HERE.md` (this folder) — bootstrap pointer
3. `../05-BOARD-DECISIONS-2026-04-15.md` — locked decisions
4. `01-P0-RESOLUTIONS.md` — every audit gap closed or deferred, with rationale
5. `02-AUTOMATION-RULES.md` — 15 rules enumerated, ready to encode in `src/lib/suggestions/rules.ts`
6. `03-DAY-1-FLOW.md` — post-payment dead-dashboard cure (concrete flow)
7. `04-EMPTY-STATES.md` — every page's empty state defined
8. `05-DB-MIGRATION-PLAN.md` — fresh-schema strategy for the reset
9. `06-ADAM-CHECKLIST.md` — manual prereqs (Paddle, DNS, env) — Comet/PropelX auto-pilot prompt embedded at top
10. `07-WAVE-0-BRIEF.md` → `10-WAVE-2-BRIEF.md` — ready-to-paste CEO briefs
11. `12-AUDIT-FIX-REPORT.md` — what the 2026-05-13 audit + fix cycle changed

### Wave gate order (board P0-B 2026-05-16)

`G0 → G0.5 → G-design-lead-approval (NEW) → G1 → G2 → Launch`

The `G-design-lead-approval` gate is new per the 2026-05-16 board verdict (P0-B). It sits between Wave 0.5 ship and Wave 1 FE spawn: design-lead delivers a half-day prep (typography scale, spring map, skeleton designs, 9 empty-state illustrations, Tier 1/2/3 animation budget, per-page reference anchors), Adam personally reviews, then writes "design-lead approved" in the wave thread before any FE worker spawns. See `09-WAVE-1-BRIEF.md` §Design-Lead Prep for the full deliverable spec.

### Operational substrate (parent-level specs, Fix Agent 5 / Cluster H)

These live at the parent `docs/product-rethink-2026-04-09/` level (not in this build-prep folder) because they are authoritative product specs, not pre-flight artifacts. Read whichever applies to the wave you're spawning.

- `../17-ANALYTICS-SPEC.md` — PostHog (EU) + 16 events + 2 funnels + identity model. Owner: Wave 1 BE-3. Closes board B4 instrument-from-day-1 mandate.
- `../18-LEGAL-PUBLISHING-PLAN.md` — T&Cs, Privacy Policy, Cookie Policy, DPA. Owner: Wave 2 Worker 5. Pre-launch blocker.
- `../19-SUPPORT-CHANNEL-SPEC.md` — Plain (recommended) or Crisp + `support@beamixai.com` + every error-state CTA. Owner: Wave 2 Worker 4 or 5. Pre-launch blocker.
- `../20-ADMIN-DASHBOARD-SPEC.md` — Adam-only `/admin` route, allowlist-gated, 6 read-only sections. Owner: Wave 2 Worker 4 stretch or new Worker 5.
- `../21-DATA-GOVERNANCE.md` — GDPR Article 17 deletion + Article 20 export, retention windows, Supabase Pro PITR, DR runbook. Owner: Wave 2 backend stretch + devops-lead.

## What this folder is NOT

- It does not re-spec what `05-BOARD-DECISIONS-2026-04-15.md`, `07-AGENT-ROSTER-V2.md`, `08-UX-ARCHITECTURE.md`, `12-AGENT-BUILD-SPEC.md`, `13-DESIGN-SYSTEM-SPEC.md`, or `14-SCAN-UX-SPEC.md` already cover. Those remain the authoritative product/agent/UX/system specs.
- It does not contain code. All files here are planning artifacts that feed Wave 0 onwards.

## State of P0/P1 blockers (one-line summary; details in `01-P0-RESOLUTIONS.md`)

| # | Blocker | Status |
|---|---------|--------|
| P0-1 | UX paywall — old prices/trial | RESOLVED in `08-UX-ARCHITECTURE.md` §4 (verified) — annual pricing day-1 verified per board April-17 |
| P0-2 | Agent naming — Freshness Agent canonical | RESOLVED across all locked specs (verified) |
| P0-3 | 15 automation rules not enumerated | RESOLVED — `02-AUTOMATION-RULES.md` |
| P0-4 | `plan_tier` enum migration | RESOLVED (simplified by hard reset) — `05-DB-MIGRATION-PLAN.md` |
| P0-5 | Day-1 dead-dashboard auto-trigger | RESOLVED — `03-DAY-1-FLOW.md` |
| P0-6 | Migration must run on staging first | RESOLVED — process defined in `05-DB-MIGRATION-PLAN.md` §Staging Gate |
| P0-7 | Zero customer validation | DEFERRED — runs in parallel with Wave 0; not a code blocker |
| P1-8 | Empty states not spec'd | RESOLVED — `04-EMPTY-STATES.md` |
| P1-9 | High-score celebration state | RESOLVED — `04-EMPTY-STATES.md` §Free-scan high-score |
| P1-10 | Agent failure mid-pipeline UX | RESOLVED — `04-EMPTY-STATES.md` §Inbox failure card |
| P1-11 | Haiku QA misses citations | ALREADY IN SCOPE — `12-AGENT-BUILD-SPEC.md` Wave 1 (Sonar verification step) |
| P1-12–17 | Score drop empathy, Paddle return route, kill-switch banner, top-up, competitor alerts, Hebrew prompts | TRACKED — assigned in Wave 1/2 briefs (`09-WAVE-1-BRIEF.md`, `10-WAVE-2-BRIEF.md`) |
| H1 | Analytics tool / event schema / funnels | RESOLVED via `../17-ANALYTICS-SPEC.md` (PostHog EU + 16 events + 2 funnels). Owner: Wave 1 BE-3. |
| H2 | T&Cs / Privacy Policy / Cookie Policy / DPA | RESOLVED via `../18-LEGAL-PUBLISHING-PLAN.md`. Owner: Wave 2 Worker 5. Pre-launch blocker. |
| H3 | Customer support routing + error-state CTAs | RESOLVED via `../19-SUPPORT-CHANNEL-SPEC.md` (Plain default; Crisp fallback). Owner: Wave 2 Worker 4 or 5. |
| H4 | Admin dashboard for daily ops | RESOLVED via `../20-ADMIN-DASHBOARD-SPEC.md` (`/admin` allowlist + 6 read-only sections). Owner: Wave 2 stretch. |
| H5 | GDPR deletion + portability + retention + DR | RESOLVED via `../21-DATA-GOVERNANCE.md` (Article 17/20 + retention + Supabase Pro PITR). Owner: Wave 2 backend stretch + devops-lead. |
| H6 | Adam-checklist amendments (PostHog / support email / Supabase Pro / Postmaster / dunning / lawyer) | RESOLVED via `06-ADAM-CHECKLIST.md` §Analytics, support, data governance. |
| I1 | Excluded-vertical funnel gate | RESOLVED — `09-WAVE-1-BRIEF.md` FE-2 (industry-select + server validation) + `04-EMPTY-STATES.md` §Excluded industry. |
| I2 | Suggestions don't belong in Inbox | RESOLVED — `02-AUTOMATION-RULES.md` (Home only; "More" tray for overflow). |
| I5 | Scan-saved-by-email fallback | RESOLVED — `09-WAVE-1-BRIEF.md` FE-2 + BE-3 Resend template `scan_saved_reminder`. |
| I6 | Day-1 state count (5 vs 7) | RESOLVED — `09-WAVE-1-BRIEF.md` FE-3 references 7-state `Day1State` union from shared types. |
| I7 | "AI Runs" vs "credits" naming | RESOLVED — `04-EMPTY-STATES.md` §Canonical naming locks "AI Runs"; all UI copy aligned. |
| I8 | Suggestion freshness boost re-prioritization | RESOLVED — `02-AUTOMATION-RULES.md` §Ranking algorithm (freshnessBoost only when no high-impact recurring rule exists). |
