---
date: 2026-05-25
agent: backend-engineer-w1-funnel
session_slug: w1-scan-funnel
status: COMPLETE
qa_verdict: pending (Full tier)
tier: full
branch: feat/be-w1-scan-funnel
parent_session: 2026-05-25-cto-wave1-closeout.md
---

# Backend Engineer — W1 Free-Scan + Discovery Funnel (closeout)

## Mission
Wave 1 Group B — Free-scan endpoint with hardened rate limits + agency-framed scan results page + Cal.com discovery booking funnel (page + webhook + book endpoint).

## Commits on `feat/be-w1-scan-funnel`
1. `2ef5aea` feat(scan): wave 1 R2 drafts — rate-limit + free scan + results page (R2 drafts salvaged by CEO post-stall)
2. `6bf19d3` feat(discovery): cal.com booking page + embed
3. `b35c137` feat(discovery): cal.com webhook handler with HMAC
4. `9636e26` feat(discovery): discovery book endpoint with rate limit
5. (this) chore(docs): fix stale Resend DNS dig command in CTO infra-gap session
6. (this) docs(session): be-w1-funnel closeout

## Files shipped
- `apps/web/src/lib/security/rate-limit.ts` — Supabase-backed primitives (IP / email / domain), CIDR allowlist, signed `adamkey` token allowlist
- `apps/web/src/app/api/scan/free/route.ts` — POST with Turnstile + honeypot + WHOIS reject + rate limits per CTO B6 spec
- `apps/web/src/app/scan/[scan_id]/page.tsx` — agency-framed results page, CTA → `/discovery`
- `apps/web/src/app/discovery/page.tsx` — Cal.com embed via `NEXT_PUBLIC_CALCOM_DISCOVERY_LINK`
- `apps/web/src/app/api/webhooks/calcom/route.ts` — HMAC verify via `CALCOM_WEBHOOK_SECRET` using `crypto.timingSafeEqual`, fires Inngest `discovery.booked`
- `apps/web/src/app/api/discovery/book/route.ts` — per-IP 5/24h + per-email 1/24h

## Notes
- Resend DNS verified GREEN by CEO 2026-05-25 (stale dig command in CTO infra-gap session doc corrected as a separate commit on this branch).
- NO agent names in any returned DTO (Engineering Principle #9 / CTO A8).
- `discovery_sessions` table arrives via `feat/db-w1-agency-tables`; webhook handler stubs gracefully if missing.

## Decisions made
None new — followed dispatch brief spec + CTO B6 rate-limit numbers.

## QA-Lead requirement
Full tier (touches public API + auth + paying-customer surface). Security review + craft-reviewer + Codex CLI second opinion before merge.
