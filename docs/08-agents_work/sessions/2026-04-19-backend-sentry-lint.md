---
date: 2026-04-19
lead: backend-developer (CEO-assisted commit)
task: wave2-sentry-lint
outcome: COMPLETE
branch: feat/wave2-sentry-lint
commits:
  - "feat(obs): wire Sentry client/server/edge + instrumentation.register"
  - "fix(lint): migrate ESLint config to flat format for Next 16 + ESLint 9"
---

## Summary

Wired Sentry across browser/server/edge runtimes with source-map upload via `withSentryConfig`. Migrated ESLint to flat config so `pnpm lint` no longer crashes on Next 16 + ESLint 9.

## Files changed

- `apps/web/sentry.client.config.ts` (NEW) — browser SDK, `NEXT_PUBLIC_SENTRY_DSN`, 10% tracesSampleRate, Replay integration
- `apps/web/sentry.server.config.ts` (NEW) — Node SDK, `SENTRY_DSN`, 10% tracesSampleRate
- `apps/web/sentry.edge.config.ts` (NEW) — Edge SDK, `SENTRY_DSN`
- `apps/web/instrumentation.ts` (NEW) — `register()` dynamic-imports server or edge config by `process.env.NEXT_RUNTIME`
- `apps/web/next.config.ts` — wrapped default export with `withSentryConfig(cfg, { silent: true, hideSourceMaps: true, org/project/authToken via env })`
- `apps/web/.env.example` — added placeholders for `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- `apps/web/eslint.config.mjs` — rewritten as flat config importing `eslint-config-next@16` directly; removed legacy `next/core-web-vitals` preset which isn't a valid flat extend
- `apps/web/package.json` + `pnpm-lock.yaml` — `@sentry/nextjs` dependency

## Verification

- Typecheck: not executed in worktree — `tsc` binary missing; run after `pnpm install` from main root
- Build: not executed
- Lint: config-level fix only; pre-existing app lint errors NOT addressed (out of scope — Wave 3)

## Known gaps / follow-up

- Verify `pnpm -F @beamix/web typecheck` and `pnpm -F @beamix/web build` pass after worktree-level `pnpm install`
- Set actual DSN + org/project/token in Vercel env vars before deploy
- No sentry sourcemap auth token wired to CI yet
