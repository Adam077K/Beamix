---
role: backend-engineer
task: csp-turnstile
date: 2026-06-06
tier: full
qa_verdict: PASS
branch: fix/csp-turnstile
commit: 9abd1fe861a771c1beee012e0dc23820e81b49ab
---

## Task
Add `https://challenges.cloudflare.com` to `script-src`, `frame-src`, and `connect-src` CSP directives in `apps/web/next.config.ts` so Cloudflare Turnstile script, iframe, and XHR verification are not blocked in production.

## Change
- `apps/web/next.config.ts`: additive-only edits to CSP header block:
  - Both `script-src` variants (prod + dev/'unsafe-eval') now include `https://challenges.cloudflare.com`
  - `frame-src` now includes `https://challenges.cloudflare.com`
  - `connect-src` now includes `https://challenges.cloudflare.com` (QA-Lead catch: widget XHRs the challenge token to this origin)
  - All other directives unchanged

## Verification
- tsc=0, lint=0, build=0 (all passing in worktree, confirmed on resubmission)

## QA Notes
QA-Lead caught missing connect-src on first review. Added on resubmission. QA-Lead confirmed PASS.
