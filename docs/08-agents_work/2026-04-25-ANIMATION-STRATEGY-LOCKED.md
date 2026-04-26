# Beamix Animation Strategy — LOCKED
Date: 2026-04-25
Status: LOCKED by Adam decisions.

---

## Per-page skeleton-outline-draw decision (LOCKED)

| # | Page | Skeleton-draw on load? |
|---|---|---|
| 1 | `/home` | NO |
| 2 | `/inbox` | NO |
| 3 | `/workspace` | NO (courier flow + step-list IS the animation) |
| 4 | `/scans` | NO |
| 5 | `/competitors` | NO |
| 6 | `/crew` | YES — first visit only, localStorage-flagged |
| 7 | `/schedules` | NO |
| 8 | `/settings` | NO |
| 9 | `/scan` (public) | YES — full 15-17s First Scan Reveal (already locked) |
| 10 | `/onboarding` | YES — light flourishes per step (NOT /scan-grade theater) |
| 11 | `/reports` | YES — first visit only, localStorage-flagged |

## Cross-page motion vocabulary (LOCKED — these repeat across pages, become Beamix identity)

1. **Score Gauge Fill** (count-up) — appears on /home, /scans detail, /scan reveal, /reports. 600ms ease-out-quint, tabular nums.
2. **Path-Draw** (line/sparkline charts) — /home, /scans, /competitors, /scan, /crew first-visit, /reports. SVG `pathLength` 0→1, 600-1200ms.
3. **Card Hover Lift** — every page with cards. 150ms `translateY(-1-2px)` + shadow.
4. **Pill button spring-overshoot** — every primary CTA. 400ms spring with 4-6% overshoot. The "Run all" pill identity.
5. **Hand-drawn empty-state sketches** — /home, /inbox, /scans, /crew, /competitors. **5 distinct illustrations**, same Rough.js style, fixed seed, **static (not drawn-in)**.
6. **Optimistic UI on Approve** — /home, /inbox, /workspace, /onboarding. 200ms collapse + strikethrough + toast.
7. **Topbar asterisk** — chrome on **every page**. 1200ms breath when active. Claude.ai pattern. States: idle / running / error.

## Follow-up answers (Adam, 2026-04-25)

- **A1.** `/crew` first-visit flag → **localStorage** (once-ever per device, not per session)
- **A2.** `/reports` first-visit → **once per account** (Yossi's 20 domains share one celebration moment, not 20)
- **A3.** Empty-state illustrations → **5 distinct sketches**, same Rough.js style. Need illustration commission for: /home empty, /inbox zero, /scans first-visit, /crew empty, /competitors empty.
- **A4.** Topbar asterisk → **every page** (Granola persistent-indicator pattern)
- **A5.** Hebrew/RTL path-draw animations → **flip direction globally** (sparklines, line charts, all path-draw motions)

## What this means in practice

**Daily-frequency pages (/home, /inbox, /workspace, /scans, /competitors, /schedules, /settings):**
- Render content INSTANTLY — no skeleton-draw entrance
- Motion lives at the data level: count-up score, path-draw sparklines, hover lifts
- Repeat visits in same session: zero entrance animation
- The polish is in the typography, spacing, restraint — NOT page-skeleton theater

**One-time experiences (/scan public, /onboarding):**
- Skeleton-draw appropriate; this is the dramatic introduction
- /scan: full 15-17s First Scan Reveal storyboard (REFS-03 §11)
- /onboarding: light per-step flourishes, ≤500ms each, never page-grade theater

**First-visit-only experiences (/crew first time, /reports first time):**
- localStorage flag triggers one-time skeleton-draw entrance
- Subsequent visits: instant render, same as Tier 3 daily pages
- Rationale: meet-the-team or unlock-celebration is appropriate ONCE, never repeating

## Anti-patterns reaffirmed

- No looping animations on dashboards (except active-state indicator dots)
- No skeleton-shimmer (Stripe pattern: nothing-then-real)
- No gradient backgrounds on cards
- No confetti / celebration sounds
- No `/home` entrance on repeat visits in same session
- No skeleton-outline-drawing on Tier 3 pages
- No outlines AND content animating simultaneously (eye anchor rule)
