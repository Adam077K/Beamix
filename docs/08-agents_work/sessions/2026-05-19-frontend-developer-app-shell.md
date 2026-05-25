---
session: frontend-developer-app-shell
date: 2026-05-19
agent: frontend-developer
branch: feat/app-shell
qa_verdict: PASS
tier: full
qa_cycle: 2
status: COMPLETE
---

# Wave 0 Worker 3 — App Shell (COMPLETE)

## Built

- **Routes (12):** `(public)/scan`, `(auth)/{login,signup}`, `(protected)/{home,inbox,scans,automation,archive,competitors,settings,onboarding/post-payment,layout}`, `api/health`. No `(protected)/dashboard/*` route per board.
- **DashboardShell** with 3 empty slot props (`notificationBell?`, `previewBanner?`, `killSwitchBanner?`) — Wave 1 FE injects via props.
- **(protected)/layout.tsx** ships with 3 commented-out slot imports (P0-F merge-collision prevention).
- **Sidebar** (Zustand `useSidebar` store for collapse state), **command-palette** (`cmdk` on all 7 routes), **EmptyState** (9 inline-SVG variants).
- **27 Shadcn primitives** in `src/components/ui/` extended with Beamix tokens. Notable extensions: tier-locked button variant, impact-low/medium/high badge, inbox-item card variant, paywall dialog max-width, underline tabs, ymyl-warning tooltip, SkeletonCard/SkeletonTable helpers.
- **Supabase Auth middleware** (`@supabase/ssr`) protecting `(protected)/*` with negative-lookahead matcher.
- **Security:**
  - `eslint-plugin-import` service-role boundary (H4): `db/admin`, `billing/paddle-webhook`, `**/server-only/**` forbidden from `(public)/**` + `components/**`.
  - `src/lib/security/url-guard.ts` SSRF stub with full JSDoc spec (Wave 1 BE-2 implements body).
  - `server-only` stubs for `db/admin.ts` + `billing/paddle-webhook.ts` (Wave 1 BE populates).
  - CSP + 4 hardening headers (X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy) in `next.config.ts`. `script-src` uses `'unsafe-inline'` with TODO Wave 0.5 to migrate to per-request nonce via middleware.
- **/api/health** validates 22 env vars. 503 path returns `{ ok: false, missing_count: N }` (integer only — no key names leaked). 200 path returns `{ ok: true, version }` (commit SHA omitted).

## Smoke tests

- `pnpm typecheck` ✓
- `pnpm lint` ✓
- `pnpm build` ✓

## Wave 1 handoff

- `NotificationBell` (FE-1), `PreviewBanner` (FE-3), `KillSwitchBanner` (FE-3) — each FE worker un-comments their assigned slot import line in `(protected)/layout.tsx`.
- `validateExternalUrl` body — Wave 1 BE-2 per JSDoc spec.
- Service-role Supabase client in `db/admin.ts` — Wave 1 BE.
- Paddle webhook handler in `billing/paddle-webhook.ts` — Wave 1 BE-2 (raw body HMAC + paddle_webhook_events idempotency).

## Commits

- `7e88300` scaffold + routes + DashboardShell
- `76a8dd0` 27 Shadcn primitives
- `aadc548` smoke-test fixes (empty-interface → type alias; cmdk type sync; middleware fix)
- `b7c9e96` fix: next bumped to 15.3.9 (patch GHSA-9qr9-h5gf-34mp RCE)
- `b41dee6` fix: middleware uses getUser() not getSession()
- `800e5e6` fix: /api/health 503 returns missing_count only (no key names)

## Out of scope (Wave 1)

Page content for all 11 placeholder routes; cmdk fuzzy-search content beyond route navigation; the 3 slot components themselves.

---

## QA-Lead Cycle 2 Verdict — 2026-05-20

**Verdict: PASS (Full tier, Cycle 2)**

### Cycle 1 blockers resolved

| Blocker | Status | Evidence |
|---------|--------|----------|
| P0 — next@15.3.2 RCE (GHSA-9qr9-h5gf-34mp) | RESOLVED | `apps/web/package.json` shows `"next": "15.3.9"`. `pnpm audit` shows 0 critical advisories. |
| P1 — middleware getSession() auth bypass | RESOLVED | `apps/web/src/middleware.ts` line 33 calls `supabase.auth.getUser()`. Protected-route guard at line 48 checks `!user`. |
| P2 — /api/health leaking secret key names | RESOLVED | 503 path returns `{ ok: false, missing_count: N }` (integer). 200 path returns `{ ok: true, version }`. No key names in either response. |

### Build gate (Cycle 2)

| Check | Result |
|-------|--------|
| `pnpm typecheck` | PASS — 0 errors |
| `pnpm lint` | PASS — 0 warnings/errors |
| `pnpm build` | PASS — 13 routes + middleware clean |

### Structural checks

| Check | Result |
|-------|--------|
| Sidebar routes | 7 routes (home, inbox, scans, automation, archive, competitors, settings) — correct |
| DashboardShell slot props | 3 slots intact: `notificationBell?`, `previewBanner?`, `killSwitchBanner?` |
| ESLint service-role boundary | `server-only` import in `db/admin.ts` and `billing/paddle-webhook.ts` — intact |
| SSRF stub | `url-guard.ts` present with full JSDoc deny-list spec |
| CSP header | Present in `next.config.ts` — covers default-src, script-src, style-src, img-src, connect-src, frame-src, frame-ancestors, base-uri, form-action |

### Residual advisory (no block)

GHSA-36qx-fr4f-26g5 — Next.js i18n cache key confusion (severity: high). Patched in >=15.5.16. No patch available in 15.3.x line. Not blocking per QA instructions (no published patch available). File as tech-debt ticket for next Next.js upgrade cycle.

`pnpm audit` summary: 0 critical | 18 high (all no-available-fix in current semver range) | 23 moderate | 3 low.

**Cleared for merge by QA-Lead. Do NOT merge — awaiting user confirmation.**
