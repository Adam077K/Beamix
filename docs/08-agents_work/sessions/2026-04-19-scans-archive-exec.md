---
session: 2026-04-19-scans-archive-exec
lead: build-lead
worker: frontend-developer
branch: feat/rebuild-scans-archive
status: COMPLETE
---

## Summary

Rebuilt Scans timeline and Archive pages to Linear/Vercel deployments quality. Both pages now have real filter chips with counts, proper row density, all 4 states (loading/empty/error-filter/success), and atomic commits.

## Files Changed

### Scans
- `apps/web/src/components/scans/ScansClient.tsx` — Full rebuild: filter chips (All/Completed/Running/Failed with counts), Linear-style rows with animated status dots (ping animation for active), date separators (Today/Yesterday/Apr N), skeleton loader, empty state, filter-empty state, ChevronRight reveal on hover
- `apps/web/src/components/scans/ScanDrilldown.tsx` — Redesigned to row-based engine breakdown with progress bars, rank position column, column headers, cleaner score header layout
- `apps/web/src/app/(protected)/scans/page.tsx` — Updated mock data to cover all 3 statuses across multiple days for realistic grouping

### Archive
- `apps/web/src/components/archive/ArchiveClient.tsx` — Full rebuild: filter chips (All/Published/Pending/Unverified), compact list rows with checkbox per item, impact dots, agent badge, action menu on hover, bulk selection that swaps header export button, AnimatePresence for filter transitions
- `apps/web/src/app/(protected)/archive/page.tsx` — Expanded mock data to 5 items with varied status/verification states

## Design Decisions

- Used animated status dots with CSS ping (opacity pulse) for running/completed states — matches Linear's "live" dot feel without heavy Framer overhead
- Filter chips use `bg-gray-900 text-white` for active state — consistent with the rest of the app's chip pattern
- Archive rows are table-like (border-b dividers inside rounded container) not cards — matches Vercel deployments density
- Bulk selection shows indeterminate checkbox state via DOM ref
- Left accent bar on selected archive rows uses ::before pseudo-element via Tailwind `before:` classes

## Future Ideas (not implemented — scope boundary)

- Real Supabase data wiring (currently mock)
- Scan comparison view (diff between two scan dates)
- Export API endpoint at `/api/archive/export`
- Archive item detail drawer/page
- PublishToggle in archive row (removed from row to reduce density; can be in detail drawer)
