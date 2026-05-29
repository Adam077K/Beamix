---
date: 2026-05-29
role: ceo
session: ceo-be-w2-held-revenue
tier: irreversible
qa_verdict: PASS
pr: 112
---

# CEO Session — land Wave 2 branch 1: held-revenue (Paddle webhook + refunds + day-61 sweep)

## What this branch ships
Wave 2 held-revenue accounting:
- Paddle webhook (`transaction.completed`, `subscription.activated`, `transaction.refunded`,
  `subscription.cancelled`) with HMAC-verified raw-body signatures + ts-freshness replay guard.
- `revenue_events` append-only ledger; `revenueBookingSweep` Inngest cron flips `booked_at` at day-61.
- Refund processing → append-only `refund_events` + Paddle cancel; ARR/MRR helpers read `booked_at` only.

## Path to green (rebase → BLOCK → fix → PASS)
1. Rebased onto current main (was 12 behind, off #98). Clean replay.
2. **CEO landing-fix:** registered `revenueBookingSweep` in the inngest serve route (was defined but
   never wired — would never have fired).
3. **First review round: BLOCK.** code-reviewer (2 P1) + security-engineer (2 High + 2 Med):
   - P1: refund INSERT schema-drift (wrote non-existent `subscription_id`/`status`, omitted NOT NULL
     `paddle_event_id`/`amount_cents`) → every prod refund would 23502-fail.
   - P1: no idempotency on `processRefund` (double-click → duplicate rows → wedged sweep).
   - P1: sweep refund-guard matched `customer_id` → blocked all future revenue for any refunded customer.
   - P1: Paddle-native `transaction.refunded`/`subscription.cancelled` unhandled → sweep books refunds.
   - P2: toCents(NaN)→0 silent zero insert; swallowed profile DB error; missing ts-freshness.
4. **backend-engineer fix** (commits 3a73211, f7168df, 5f7cccf): all 4 P1 + 3 P2 fixed; tests 12→23.
5. **CEO caught a false-green:** worker claimed typecheck clean; it wasn't (TS2352 in a test cast).
   Fixed (commit cb1fbae).
6. **CEO caught a latent runtime bug both reviewers waved as "out-of-scope":** webhook inserted
   `held_until` into `revenue_events`, which has no such column (it's on `subscriptions`). The
   `as never` cast hid it from typecheck; tests mock the insert. Would throw PGRST204 → 500 →
   Paddle retries forever → revenue never recorded on every real charge. Removed it from both
   `revenue_events` inserts (the `subscriptions.held_until` update is separate + correct). Fixed.
7. **Re-review round: PASS.** security-engineer PASS (all 4 blocking fixed, no regression — HMAC,
   23505 idempotency, append-only RLS, cron concurrency all intact). code-reviewer PASS (billing
   math verified: day-61 boundary correct, ARR/MRR reads booked_at only; 23 tests genuine incl. a
   schema-column regression guard).

## QA verdict: PASS
typecheck clean (independently verified), 23/23 tests pass, both out-of-band reviewers PASS,
held_until runtime bug fixed. Tier: **Irreversible** (Paddle billing money-flow + webhook). Needs
Adam sign-off.

## Tracked follow-ups (non-blocking, P2 — file before first paying customer)
- `handleTransactionRefunded` resolves `revenue_event_id` by most-recent-unbooked heuristic; for
  multi-charge customers it can FK the wrong event. Fix: look up by `paddle_event_id = tx.id`.
- `.single()` → `.maybeSingle()` on the refund insert chain (semantic clarity).
- `held_revenue_amount_cents` renewal-drift (not updated on `transaction.completed`); audit `actor_id`
  cosmetic; in-memory ARR/MRR aggregation → SQL view post-scale.
- `as never` casts on Supabase table refs → regenerate `database.types.ts`.

## Wave 2 merge train
Branch 1 of 6. Remaining: approvals-api, deliverables, approvals-ui, founding-100, new-agents —
each reviewed with the same rigor (two share the inngest route; careful ordering).
