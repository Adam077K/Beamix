# Smoke Test — Production (after credibility pass merge)

**Date:** 2026-04-24
**Target:** https://beamix.vercel.app (demo/tester auth)
**Method:** Playwright MCP, shared session with design critic agent (navigation occasionally races; results verified by re-navigating).

## Summary

All pages render. **No 5xx errors.** Two recurring issues:
1. **React error #418 (hydration mismatch)** on `/scans`, `/scans/[id]`, `/inbox`, `/automation`, `/competitors`, `/settings*` — logs 20+ repeats.
2. **Sidebar prefetches 404 paths** `/settings/preferences` and `/settings/billing` — app uses `?tab=` query, not path segments.

All specific credibility fixes verified correct where observable.

## Per-page results

| URL | Render | Console errors | Network errors | Specific-check |
|-----|--------|----------------|----------------|----------------|
| `/login` | OK | 0 | none | "Continue as tester" button present |
| `/home` | OK | 0 on direct visit (but #418 appears after SPA nav) | none | Engine rates VARY: 83 / 67 / 100 / 67 / 67 / 67 / 100. Info icons (4) have `title` + `aria-label` tooltips. **NO blue trial banner** — top banner is "Preview mode — upgrade to unlock agents" (transparent bg). |
| `/scans` | OK | 1 (React #418) | none | Timestamps VARY: 10:17, 09:10, 16:03, 12:56, 14:49, 10:42, 09:35, 18:28, 12:21, 11:14, 15:07, 14:00. 12 scan rows, all with UUID links. |
| `/scans/[id]` | OK | 1 (React #418) | none | H1: "We checked 7 AI engines — here's what we found". Engine breakdown lists prompt-level rows (all 100%), not engine-aggregated — table appears to show per-prompt mentions not per-engine summary. |
| `/inbox` | OK | #418 repeating | none | Agent names MIXED: `freshness_agent` (snake_case, NOT fixed) alongside proper "Content Optimizer", "Competitor Intel". |
| `/competitors` | OK | 0 | none | Competitor links CORRECT: `https://ahrefs.com/brand-radar`, `https://tryprofound.com`, `https://otterly.ai`, `https://sparktoro.com`, `https://buzzworthy.ai` — no `https://https://` double prefix. |
| `/automation` | OK | #418 | none | H1 = "Schedules" (correct). Agent names MIXED: "FAQ Builder", "Content Optimizer", "Freshness Agent", "Competitor Intel" proper-cased, BUT `schema_generator` still snake_case. |
| `/archive` | OK | 0 | none | H1 = "Archive". Agent labels LOWERCASE: "schema generator", "content optimizer" (not proper cased here either). |
| `/settings` | OK | 0 | 404 on `/settings/preferences` prefetch | Default active tab = Profile (expected). |
| `/settings?tab=billing` | OK | 0 | 404 on `/settings/billing` prefetch | Active tab = Billing (correct). Heading "Billing", "CURRENT PLAN Free", invoice placeholder. |

## Confirmed fixes

- Home engine breakdown shows varied mention rates per engine.
- KPI info icons render with tooltip strings (native `title` attr + `aria-label`).
- Scans page timestamps are varied (not all 14:01).
- Competitor external URLs are single-prefixed.
- `/settings?tab=billing` activates Billing tab.
- Automation page title is "Schedules".

## Remaining issues

1. **Agent name casing is inconsistent** — `freshness_agent` (inbox) and `schema_generator` (automation) still raw snake_case. Archive uses lowercase "content optimizer". Proper-case formatter is not applied to all display paths.
2. **No blue trial banner** visible on /home or /inbox — only a transparent "Preview mode" strip with an Upgrade link. If a blue banner was expected post-merge, it is missing.
3. **React hydration error #418** on /scans, /scans/[id], /inbox, /automation, /competitors, /settings* — does not break rendering but floods console and will surface in Sentry.
4. **Sidebar prefetch 404s** — `/settings/preferences` and `/settings/billing` return 404 on RSC prefetch. App routes are query-based (`?tab=`) but Link `href` or prefetch points at path segments.
5. **[NotificationBell] fetch error for user: undefined** — NotificationBell attempts fetch before user context is ready (seen twice), swallowed but logs error.
6. **Scan detail engine breakdown table** — lists many rows at 100% per prompt rather than aggregated per-engine rates; likely rendering raw prompt-results instead of grouped summary.
