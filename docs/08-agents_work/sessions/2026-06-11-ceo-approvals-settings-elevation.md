---
date: 2026-06-11
role: ceo
task: approvals-settings-elevation (warm-minimal elevation of two existing screens)
branch: feat/elevations-integration
tier: full
qa_verdict: PASS
---

# CEO Session — Approvals + Settings elevation

Elevated two existing screens to the warm-minimal bar via the T5 `design` workflow
(winning directions synthesized from 4 variations each), built from spec, then 2 polish
rounds against the binding QA gate. Visual + interaction elevation only — existing data
shapes + server actions preserved (no DB / no billing money-flow changes).

## Shipped
- **Approvals** (`/approvals`) — "the decision desk": shadcn table → `.card-console` accordion
  list. Violet KindBadges, in-place expand to a `bg-surface-warm` preview micro-environment
  with a violet-left-bordered proposal inset (prose clamp / before-after diff), mandatory-human
  risk banner, hero blue Approve (the only blue button) + outline Reject, resolved-row state.
  Preserved ApprovalQueueItem DTO + approve/reject actions; additive getResolvedApprovals.
- **Settings** (`/settings`) — "the console": 200px left tab-rail + scrolling content,
  URL-addressable tabs (`?tab=`), per-section save-bar (4 states), all 6 tabs elevated —
  Profile, Brand Fingerprint (mono vocab pills + voice preview), Billing (status cards + 60-day
  refund), Approval Preferences (the violet tab + YMYL lockbox), Publishing Integrations
  (3-state cards), Cancel (what-you-keep-first + two-step gated confirm + success).

## QA (binding gate, full tier — 3 rounds on the combined branch)
1. Combined elevations: PASS (20 advisories).
2. After advisory polish: BLOCK → 1 P1 stored-XSS — `extractEvidenceUrl` accepted
   `javascript:`/`data:` schemes (agent-written evidence URL → executable href under
   CSP `unsafe-inline`).
3. After P1 fix (http(s) allowlist in extractEvidenceUrl + Zod `.refine()` + 11 tests):
   **PASS**, 0 confirmed blockers.
- Verified in-worktree: typecheck 0 · test 0 (714 tests) · build 0. Color law enforced
  (blue=customer/actions, violet=agents only, never on a button/link).

## Fast-follow cleanup ticket (14 advisories from the final gate + carryover) — sweep with Adam's review notes
- **P2** dead buttons (zero-placeholder rule): ProfileTab "Resend" email-verify, BillingTab
  "Switch to annual" — no onClick. Wire or remove.
- **P2** `getResolvedApprovals`: expired rows (acted_at IS NULL) sort to top (PostgreSQL NULLS
  FIRST) — add NULLS LAST; add a covering index on approval_queue(acted_at) (migration → Adam applies).
- **P2** Zod `.refine()` on evidenceUrl is dead at runtime (DTO not validated at the call site) —
  wire the parse or drop it; the runtime guard is the extractEvidenceUrl allowlist (tested).
- **P2** `passwordStrength()` unexported + untested — extract + node-test.
- **P3** getPendingApprovals leaks raw error.message; avatar MIME only client-validated;
  ApprovalActions re-implements getApproveLabel inline; extractEvidenceUrl normalization untested;
  per-render Intl.DateTimeFormat allocation; unbounded diff-line rendering; profileError dead state.

## Review + follow-up plan
- Merged to prod for Adam's live UI/UX review on app.beamixai.com/approvals + /settings
  (preview-domain auth was unworkable: Vercel auth wall + Google-OAuth `/?code=` 404 +
  Supabase redirect-allowlist gap on preview domains). Adam's notes + the cleanup ticket land
  in one follow-up polish PR.

## Separate follow-ups discovered (NOT part of this merge)
- **Google OAuth `/?code=` 404** — Supabase redirect allowlist likely missing `/auth/callback`;
  verify on prod, add allowlist entries + a root `?code=` safety-forward.
- **`/approvals` data-load failure** (customer resolution) — the elevated empty/error states fail
  gracefully, but the underlying fetch still needs a backend fix.
