---
name: mock-data-toggle
description: Dashboard has a USE_MOCK_DATA flag for visual demos — agents should use it when the user wants to preview with data
type: feedback
---

The dashboard page at `saas-platform/src/app/(protected)/dashboard/page.tsx` has a `USE_MOCK_DATA` flag at the top of the file (line ~7).

- Set `const USE_MOCK_DATA = true` to show realistic fake data (score 58, 5 scans, 5 recommendations, 5 agent runs)
- Set `const USE_MOCK_DATA = false` to use real Supabase data (default)

**Why:** The user wants to preview designs with populated data before real data exists. Toggle it on for visual demos, off when done.

**How to apply:** Any agent doing UI work that needs to show the dashboard with data should flip this flag to `true`, let the user review, then flip it back to `false`.
