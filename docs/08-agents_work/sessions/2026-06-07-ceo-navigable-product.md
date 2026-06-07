---
date: 2026-06-07
role: ceo
task: navigable-product
branch: feat/navigable-product
tier: full
qa_verdict: PASS
workflow: T5 (design ×3 + qa binding gate)
---

# CEO Session — Navigable Product (Design)

## Goal
Make the whole product feel real and navigable: no customer-facing placeholder anywhere.
Before: only the free-scan funnel and `/dashboard` were polished; 8 screens said "Coming Wave 1"
and the sidebar's "Home" pointed at a ghosted empty `/home`.

## Locked scope (Adam, this session)
1. **Reduced 3-page nav** — sidebar = Outcomes (→ polished `/dashboard`) · Approval Queue (→ `/approvals`) · Settings. Weekly Digest + Traceability deferred.
2. **Design-first, wire later** — pixel-perfect warm-minimal screens, all four states; real Supabase auth + Settings persistence is a fast-follow.
3. **Redirect old routes** — retired tool-framed routes redirect to new equivalents (reversible, no 404s).

## What shipped (branch `feat/navigable-product`, 35 files, ~3.2k insertions)
- **WS1 nav** — `sidebar.tsx` → 3 outcomes items; 6 retired routes (`home/inbox/scans/automation/archive/competitors`) replaced with `redirect()` (home/scans/automation/competitors→/dashboard, inbox/archive→/approvals).
- **WS2 auth** — `(auth)/layout.tsx` + `AuthCard` (mirrors `ScoreHeroPanel` finish + warmth gradient + one Fraunces beat) + login/signup/forgot-password, all four states, OAuth, `next` preserved. Submit handlers are typed stubs.
- **WS3 settings** — six-tab console (Profile/Brand fingerprint/Billing/Approval preferences/Publishing integrations/Cancel); violet-identity Approval-preferences tab (agent rows only, violet never a button); status pills; Geist Mono IDs; all four states.
- **WS4 scan-result + discovery** — `/scan/[scan_id]` rebuilt to tokens + `.card-console` (ScanScoreHero/EngineBand/IssueLedger/ScanPendingState), sanctioned score-reveal, no agent names (Eng Principle #9); `/discovery` warm-minimal wrapper + states around the Cal.com iframe.

## Process (T5)
- 4 design specs synthesized via the `design` workflow (auth/settings/scan-result + nav built directly).
- 4 builds in isolated worktrees from `origin/main` (9b59903), merged conflict-free into `feat/navigable-product` (none touched globals.css).
- design-critic (code-level): NEEDS_WORK, 4 surgical P1s.
- **Binding `qa.js` gate #1: BLOCK** — 2 verified P1s: open-redirect on `next`, ScanScoreHero squared ring offset under reduced-motion.
- Consolidated fix pass (applied directly by CEO — subagent budget exhausted mid-run): both blockers + 4 critic P1s + 3 advisories (cal.com CSP, ProfileTab PII default, ScanPendingState reduced-motion/monotonic labels) + 2 regression test suites.
- **Binding `qa.js` gate #2: PASS** — 0 block-eligible findings survived adversarial verification; 9 advisory P2/P3 recorded as fast-follows.

## Verification
- typecheck 0 · vitest **232 passed (26 files, incl. ring-math + next-param suites)** · production build 0.
- `grep "Coming Wave 1|Coming Soon"` across app src = **zero** customer-facing hits.
- Sidebar = 3 outcomes items; every retired path redirects (no 404).

## Fast-follows (NOT in this pass)
- Wire real Supabase auth (browser/server client helpers + callback + `handle_new_user`) + Settings/Billing persistence (raises to Irreversible tier).
- Build Weekly Digest Archive + Traceability pages (deferred from the 5-page model).
- QA advisories: dedupe auth `validateEmail`/`validatePassword`/`Dots` across 3 files; `scoreColor` dup of `ringColor`; test `deriveScore`/`deriveEngines`; ProfileTab `setTimeout` unmount guard; BillingTab dead state branches.

## Merge
Human-gated. Recommend a single PR for `feat/navigable-product` (cohesive design pass; merges its 4 sub-branches). CEO cannot self-merge; awaiting Adam.
