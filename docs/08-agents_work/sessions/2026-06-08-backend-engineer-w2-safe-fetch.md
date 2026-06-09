---
date: 2026-06-08
agent: backend-engineer
task: BMX-W2-SITE-AUDIT
branch: feat/w2-evidence
worktree: .worktrees/w2-evidence
tier: full
qa_verdict: PASS
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

## Hardening pass (BMX-W2-HARDEN, 2026-06-08)

- `safe-fetch.ts`: Fixed `::ffff:0:0/96` prefix in `BLOCKED_V6_RANGES` (was `[0,0x0000ffff,0,0]` — wrong word position; corrected to `[0,0,0x0000ffff,0]`); added NAT64 `64:ff9b::/96`; made `parseIPv4` strict (regex + leading-zero rejection); removed redundant `169.254.169.254/32` entry (subsumed by `/16`).
- `site-audit.ts`: Fixed `robots.isAllowed` to pass site root URL (not robots.txt URL) so allow/disallow rules evaluate the correct path; capped word-count text slice at 200 KB to prevent full-array allocation from 2 MiB response bodies.
- `prompts.ts`: Early-cap competitor array to 10 entries via `slice(0, 10)` before per-entry validation loop to bound attacker-controlled input.
