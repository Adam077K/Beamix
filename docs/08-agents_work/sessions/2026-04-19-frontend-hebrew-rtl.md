---
date: 2026-04-19
lead: frontend-developer (CEO-assisted commit)
task: wave2-hebrew-rtl
outcome: PARTIAL
branch: feat/wave2-hebrew-rtl
commits:
  - "feat(i18n): add next-intl + Heebo font + locale-driven dir/lang on root layout"
  - "feat(i18n): RTL-safe logical Tailwind props on HomeClient"
---

## Summary

Scaffolded next-intl + Heebo (Hebrew sister-font to Inter) and wired locale-driven `<html lang dir>` on the root layout. Converted HomeClient to logical Tailwind properties. Israeli directory seed list added. **Partial** — the remaining 4 screens (Scans, Inbox, PaywallModal, free-scan result) + full translation key wiring were not completed before the worker turn budget expired.

## Files changed

- `apps/web/package.json` + `pnpm-lock.yaml` — `next-intl@^4.9.1` installed
- `apps/web/src/app/layout.tsx` — Heebo font + locale detection → `<html lang dir>`
- `apps/web/src/lib/i18n/locale.ts` — locale resolution helper
- `apps/web/src/lib/i18n/messages/en.ts` — English key scaffold
- `apps/web/src/lib/i18n/messages/he.ts` — Hebrew translations (key labels)
- `apps/web/src/lib/constants/israeli-directories.ts` — d.co.il, Easy.co.il, Rest.co.il, Bizmap/B144, Zap.co.il (for Off-Site agent reference)
- `apps/web/src/components/home/HomeClient.tsx` — `ml-/mr-/pl-/pr-` replaced with logical equivalents

## Known gaps / follow-up (REQUIRED before merge-to-MVP)

1. **RTL conversion not applied** to: Scans page, Inbox page, PaywallModal component, free-scan result page
2. **Translation keys not wired** on the 5 screens — `en.ts`/`he.ts` exist but pages still show hardcoded English strings
3. Locale detection mechanism chosen (query param `?lang=he` OR cookie `NEXT_LOCALE`) — verify in locale.ts and document
4. Tailwind config extension for `--font-heebo` (if added) — verify font family cascade
5. Typecheck + build not verified on this branch

## Recommendation

Merge this branch to MVP as a spike only if RTL isn't launch-blocking. Otherwise treat as a follow-up PR and keep this branch open.
