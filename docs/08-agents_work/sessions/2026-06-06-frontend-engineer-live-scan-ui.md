---
role: frontend-engineer
task: live-scan-ui
branch: feat/live-scan-ui
base_branch: feat/live-scan-worker
base_commit: 0fc1f3c
tier: irreversible
qa_verdict: PENDING
date: 2026-06-06
---

## Summary

Wired the `/scan` mock UI to the real live backend. The entry form now POSTs to
`POST /api/scan/free`, receives a `scan_id`, and drives the `ScanningLedger`
from `createLiveScanEmitter` (Supabase Realtime + polling fallback). On scan
completion, the user is navigated to `/scan/[scan_id]` — the authoritative
server-rendered result page.

## Files Created

- `Turnstile.tsx` — Cloudflare Turnstile widget; dev-mode placeholder when key absent
- `createLiveScanEmitter.ts` — Realtime subscription + polling fallback; PII-safe (no free_scans reads)
- `useLiveScan.ts` — State machine mirroring useMockScan; server-redirect reveal
- `EntryForm.test.tsx` — 26 logic-layer tests (validation, normalization, canSubmit, payload)
- `createLiveScanEmitter.test.ts` — 6 emitter tests (seeded event, mapping, done/failed/stop, polling fallback)

## Files Modified

- `EntryForm.tsx` — Added email field + Turnstile widget; extended submit guard
- `FreeScanFlow.tsx` — Async handleSubmit; ScanRunnerLive vs ScanRunnerMock split

## Reveal Strategy

**server-redirect**: After `done=true`, `ScanRunnerLive` navigates to `/scan/[scan_id]`
(Next.js router.push). This is PII-safe — the server-rendered page reads `free_scans`
via service-role server-side only. No new endpoint required. Client never reads `free_scans`.

## Verification

- tsc: 0 (zero errors)
- lint: 0 (zero warnings)
- vitest: 32/32 passing
- build: FAIL — pre-existing type error in `apps/web/src/app/api/scan/free/[scan_id]/progress/route.ts`
  (params not Promise<>), present on `feat/live-scan-worker` base before this branch was created.
  Zero new build errors introduced by this PR.

## Key Decisions

- **Optional email/turnstileToken in EntrySubmitPayload**: Makes the `autoStart` prop in
  `_post-payment-scan.tsx` still type-safe (no email/token needed for the mock runner path).
- **No conditional hook calls**: `useLiveScan` and `useMockScan` are in separate child
  components (`ScanRunnerLive`, `ScanRunnerMock`) — React rules-of-hooks satisfied.
- **useMockScan preserved**: Not deleted; still used by `ScanRunnerMock` (autoStart / storybook).
- **PII grep-safety**: `createLiveScanEmitter.ts` has a comment warning + never queries `free_scans`.
