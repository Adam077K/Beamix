---
date: 2026-06-08
agent: backend-engineer
task: BMX-W2-SITE-AUDIT
branch: feat/w2-safe-fetch-site-audit
worktree: .worktrees/w2-safe-fetch-site-audit
tier: full
qa_verdict: pending
---

## Task

BMX-W2-SITE-AUDIT — SSRF-safe fetch + structured site-audit observer.

## Deliverables

- `apps/web/src/lib/scan/safe-fetch.ts` — SSRF-safe HTTP fetcher with scheme allowlist, pre-connect DNS blocking, connect-time IP pinning (request-filtering-agent), per-hop redirect validation, sensitive header stripping on cross-origin redirects, 2 MiB body cap, 8s total timeout. IPv4-mapped IPv6 (CVE-2026-47684 class) handled via mixed-notation regex + pure-hex parser.
- `apps/web/src/lib/scan/site-audit.ts` — Structured site-audit observer: 4 parallel safe fetches (target, robots.txt, sitemap.xml, llms.txt). Parses title, meta description, h1/h2/h3 counts, word count, JSON-LD @type values. FM-5 GUARD enforced: robots.txt non-200 sets fetchStatus=unavailable and OMITS crawlers map (never defaults to blocked).
- `apps/web/src/lib/scan/__tests__/safe-fetch.test.ts` — 31 tests covering all SSRF controls.
- `apps/web/src/lib/scan/__tests__/site-audit.test.ts` — 17 tests covering JSON-LD parsing, FM-5 guard, crawler detection, presence flags.
- `apps/web/src/lib/scan/types.ts` — Added SiteAudit type (additive only).

## Key Decisions

- Used pure number arithmetic (uint32 for IPv4, 4-element uint32 array for IPv6) instead of BigInt — tsconfig targets ES2017 which doesn't support BigInt literals. ipaddr.js skipped as it's only a transitive dep (not directly installable without a new dep commit).
- IPv4-mapped IPv6 detection uses a regex for the mixed notation form (`::ffff:x.x.x.x`) plus a pure-hex parser fallback for the `0:0:0:0:0:ffff:xx:xx` form.
- site-audit.ts uses `vi.mock('../safe-fetch')` in tests (module-level mock) rather than DI params — cleaner API and correct for testing higher-level behavior.

## Verification

- typecheck: exit 0
- tests (48/48): exit 0
