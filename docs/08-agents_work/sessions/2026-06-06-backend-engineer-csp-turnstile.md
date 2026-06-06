---
role: backend-engineer
task: csp-turnstile
date: 2026-06-06
tier: full
qa_verdict: PENDING
branch: fix/csp-turnstile
commit: 9abd1fe861a771c1beee012e0dc23820e81b49ab
---

## Task
Add `https://challenges.cloudflare.com` to `script-src` and `frame-src` CSP directives in `apps/web/next.config.ts` so Cloudflare Turnstile script and iframe are not blocked in production.

## Change
- `apps/web/next.config.ts`: additive-only edits to CSP header block:
  - Both `script-src` variants (prod + dev/'unsafe-eval') now include `https://challenges.cloudflare.com`
  - `frame-src` now includes `https://challenges.cloudflare.com`
  - All other directives unchanged

## Verification
- tsc=0, lint=0, build=0 (all passing in worktree)
