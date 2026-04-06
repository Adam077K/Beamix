date: 2026-03-17
agent: design-lead
task: Dashboard complete visual redesign specification
status: COMPLETE

output:
  - file: docs/04-features/specs/dashboard-design-spec.md
    description: Dashboard design spec (blue brand). Original orange-era spec archived to docs/_archive/2026-04-06_dashboard-redesign-spec.md

decisions:
  - kept: All existing brand tokens unchanged (no breaking changes to CSS variables)
  - added: Glass utilities, glow utilities, shimmer skeleton, score-ring component spec, gradient system
  - removed: Emoji icons from all specs; replaced with Lucide SVG
  - philosophy: Purposeful depth over decorative glass; Blue #3370FF as signal not decoration

key_components:
  - ScoreRing: New SVG component with count-up animation + ring fill (1200ms cubic-bezier)
  - Login: Two-panel layout (dark brand left / form right) matching Framer marketing feel
  - Sidebar: Linear-style active pill with glow; trial progress bar
  - Cards: Three variants (standard, interactive, hero) with layered shadow system
  - Chat: Bubble-style with typing indicator; logical property RTL support

wcag: SPEC-level only; runtime WCAG audit required before implementation merges
rtl: All specs use logical Tailwind properties (ps/pe/ms/me/border-s/border-e)
phase_1_files: globals.css, dashboard-shell.tsx, dashboard-overview.tsx, score-ring.tsx (new)
