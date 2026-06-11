---
date: 2026-06-11
role: ceo
task: demo-mock-mode (email-gated showcase data across the product)
branch: feat/demo-mock-mode
tier: full
qa_verdict: PASS
---

# CEO Session — Email-gated demo / mock mode

Built a code-level demo mode: when the logged-in user's email is `demo@beamixai.com`,
protected pages render a coherent mock dataset ("Bright Smile Dental", Ramat Gan) so the
whole product can be shown/demoed. Real users (any other email) are unaffected — the gate
is test-locked.

## Shipped
- `lib/demo/index.ts` — `DEMO_EMAILS = ['demo@beamixai.com']`, `isDemoUser(email)` (strict
  lowercase exact-match + null-guard), `DEMO_SCAN_ID`.
- `lib/demo/fixtures.ts` — Bright Smile Dental dataset typed to each page's real contract:
  DEMO_DASHBOARD (rising engine scores 71/64/78 + wins), DEMO_APPROVALS (4 items incl. a YMYL
  health-claim), DEMO_DIGESTS (3 weeks), DEMO_TRACEABILITY (dated evidence trail), DEMO_SCAN.
- `lib/demo/scan-gate.ts` — `isDemoScan(scanId)` for the public scan route.
- Wired (one localized `isDemoUser`/`isDemoScan` conditional each, additive): dashboard,
  approvals (getCurrentUser adds email; short-circuits getPendingApprovals), digests,
  traceability, and public `/scan/[scan_id]` (gated by DEMO_SCAN_ID).
- Gate tests: `lib/demo/index.test.ts` (isDemoUser — true for demo + case variants; FALSE for
  null/undefined/''/real-email + evil-domain/substring vectors), `scan-gate.test.ts` (isDemoScan
  — DEMO_SCAN_ID → object, null for any non-exact id).

## QA (binding gate, full tier — 2 rounds)
1. BLOCK → the two isolation predicates (isDemoUser/isDemoScan) had zero test coverage (they ARE
   the leak-prevention gate).
2. After adding gate tests + consistency fixes (DEMO_SCAN.id refs DEMO_SCAN_ID, approvalCount
   derives from DEMO_APPROVALS.length): **PASS**, 0 confirmed blockers.
- Verified in-worktree: typecheck 0 · test 0 (838 tests) · build 0.

## Adam action required to activate
Create the `demo@beamixai.com` auth user (Supabase → Authentication → Add user → Auto Confirm,
or sign up via /signup). The handle_new_user trigger creates its profile + subscription. Then
logging in as demo@beamixai.com shows the full demo.

## Fast-follow cleanup ticket (10 advisories)
- **P2** add a test asserting DEMO_DASHBOARD.approvalCount === DEMO_APPROVALS.length; scan-gate
  test should assert the full ScanResult required fields, not just id.
- **P3** demo approval rows render live Approve/Reject buttons (clicking calls the real action on
  fixture ids — consider disabling actions in demo mode for a cleaner show); demo scan is public
  to anyone with the fixed UUID (curated no-PII content, acceptable); rename isDemoScan (not an
  is-predicate); DEMO_RESOLVED_APPROVALS dead export; isDemoUser test add trailing-space case;
  traceability page now does one extra auth.getUser per request (negligible, required for the gate).

## Notes
- Settings was NOT given demo data — all 6 tabs are 'use client' with no server-data seam;
  BillingTab already shows persona-matching stub data. A small server-data seam would be needed
  to populate Profile/Brand in the demo (separate follow-up).
