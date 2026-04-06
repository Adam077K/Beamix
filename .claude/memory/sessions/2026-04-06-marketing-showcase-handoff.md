# CEO Handoff — Marketing Showcase Design Session

## What This Is

You are continuing a marketing showcase design session for Beamix (AI visibility platform for SMBs). The showcase is a developer-only page at `/marketing-showcase` that renders product dashboard components with polished demo data — meant to be screenshotted and used as marketing visuals on the Framer marketing website.

**You ARE the CEO.** Read `.agent/agents/ceo.md` for your operating instructions. You manage all agents directly.

---

## Current State

### Branch & Worktree
- **Branch:** `feat/marketing-showcase` (20 commits)
- **Worktree:** `/Users/adamks/VibeCoding/Beamix/.worktrees/marketing-showcase/`
- **Dev server:** Run `cd .worktrees/marketing-showcase/saas-platform && node_modules/.bin/next dev --port 3001` — page at `http://localhost:3001/marketing-showcase`
- **Main product dashboard** (for reference): `http://localhost:3000/preview-dashboard`

### Files You Own
All marketing files are in `saas-platform/src/components/marketing/`:
```
src/app/marketing-showcase/page.tsx          — Main showcase page with 6 sections + sticky nav
src/components/marketing/group-b.tsx          — Track Your Growth (trend chart, donut, stat cards)
src/components/marketing/group-c.tsx          — Beat Competitors (bar chart, leaderboard)
src/components/marketing/group-d.tsx          — AI Models Scanned (engine checklist)
src/components/marketing/group-e.tsx          — Hero Composites (performance overview, before/after)
src/components/marketing/group-new.tsx        — Feature Cards (trending topics, top sources, queries, invisibility card, dark donut)
src/components/marketing/group-premium.tsx    — Premium Charts (nivo bar, nivo donut, NumberFlow stats, multi-brand line chart)
src/components/marketing/group-glossy.tsx     — Glossy Variants (dark bg glassmorphism — NEEDS WORK)
src/components/marketing/logos.tsx            — Logo system (logo.dev API + local PNGs for Claude/Gemini)
src/components/marketing/charts/
  blue-donut-chart.tsx     — Blue-only recharts donut
  blue-trend-chart.tsx     — Blue-only single-line area chart
  blue-score-ring.tsx      — Always-blue SVG circular score ring
  nivo-donut-chart.tsx     — Nivo/pie premium donut (spring animations)
  multi-brand-chart.tsx    — Multi-brand colored line chart (Attio-style, the ONE exception to blue-only)
  premium-dark-donut.tsx   — Dark bg dual Traffic/Conversions donut with engine logos
```

### Installed Libraries
- **recharts 3.7.0** — standard charts (area, line, bar, pie)
- **@nivo/pie 0.99.0** — premium donut with spring animations
- **@nivo/bar 0.99.0** — premium horizontal bar chart
- **@nivo/heatmap 0.99.0** — available but not yet used
- **@nivo/core 0.99.0 + @nivo/colors 0.99.0** — nivo dependencies
- **@number-flow/react 0.6.0** — animated digit-morphing number transitions
- **framer-motion 12.34.3** — animation library (already in project)

### Logo System
- `logos.tsx` uses logo.dev API (`pk_Zl-VsfExQ8Ou_bmqOwe1sA`) for real brand logos
- Local overrides: `/public/logos/claude-logo.png`, `/public/logos/gemini_logo.png`
- Coffee brand PNGs: starbucks.png, bluebottlecoffee.png, peets.png, dunkin.png, timhortons.png
- CSP updated in `next.config.ts` to allow `https://img.logo.dev`

---

## Design Rules (CRITICAL — user is very particular)

### Color Palette
- **UI elements: BLUE ONLY** — #3370FF (primary), #5A8FFF (medium), #93B4FF (light), #1E40AF (dark), #2563EB (darker), #60A5FA (accent), #C5D7FF (lighter)
- **TWO exceptions to blue-only:**
  1. **Multi-brand line charts** — each competitor gets a distinct color (red, amber, green, purple) so lines are distinguishable
  2. **Engine brand logos** — use real brand colors (ChatGPT green, Claude orange, Gemini multi-color) because logos must be recognizable
- Everything else (progress bars, badges, dots, deltas, status indicators) = blue shades only

### What the user HATES (AI slop indicators)
- Uppercase tracking-widest gray labels ("VISIBILITY SCORE")
- Colored accent stripes on cards
- Gradient info boxes (blue summary banners)
- Multi-color score tiers (cyan/green/amber/red) in marketing materials
- Letter squares instead of real logos
- Loud pill badges for status
- Progress bars that look like loading indicators
- Generic template patterns

### What the user LOVES (reference quality)
- Attio dashboard style — clean tables with brand logos, dark tooltips, subtle borders
- Wavespace dashboard — Performance section with structured metrics grid
- Bankio — clean activity tables with small status dots
- Glassmorphism on DARK backgrounds (not light — glass is invisible on light)
- Real brand logos (logo.dev API)
- Near-invisible card borders with subtle shadows
- Color restraint — 95% grayscale chrome, color only for data
- Generous whitespace, tight typography tracking

### Reference Images
The user provided 12 inspiration images at:
`saas-platform/public/Inspiration for components, graphs, and elements/`
- `Visibility Chart.png` — Multi-brand Attio-style line chart with dark tooltip
- `Pie Chart ai, traffic.png` — Dark bg dual donut (Traffic + Conversions)
- `Competitors table.png` — Clean Attio competitor table with logos
- `Agent - show and example..png` — Dark agent showcase
- `Agent Analytics.png` — Multi-line analytics with persona labels
- `Crawlers & Agents dashboard.png` — Dark metrics dashboard
- `Map.png` — Scatter quadrant (Visibility vs Sentiment) with brand logos
- `Models pick.png` — Engine checklist with real logos
- `Recent Scan: Chat: Agents.png` — Query list with source icons
- `Top Websites that ai loves.png` — Domain table with type badges
- `Trending Topics in Your Category.png` — Dark ranked topic table
- `Screenshot 2026-04-06 at 12.55.20 PM.png` — Dark overview dashboard

Also 4 earlier references at `saas-platform/public/old/dashboard/`:
- dashboard1.png (Bankio), dashboard3.png (Talentry), dashboard5.png (Attio), dashboard6.png (Wavespace)

---

## Known Issues & Unfinished Work

### CRITICAL: Glossy Section is Broken
`group-glossy.tsx` — Changed to dark navy background (#0F1629) with glass cards (bg-white/10), but the cards may still be rendering as mostly invisible/blank. The recharts chart inside GlossyDarkHero has a sizing warning ("width(-1) height(-1)"). Needs investigation and fixing — the glass cards need to actually be visible and impressive.

### Design Polish Still Needed
- Some cards still have developer subtitle text that should be removed
- The nivo bar chart in Premium Charts may have cut-off labels on the left
- The multi-brand line chart legend could be centered better
- Some sections have inconsistent card heights in 2-col grids
- The page is VERY long — consider which sections add the most value

### Demo Brand
- Using "Brew & Bean" as the fictional coffee shop throughout
- Competitors: The Daily Grind, Morning Roast Co, Bean Scene, Espresso Lab
- Before score: 23 ("Invisible"), After score: 75 ("Visible")

---

## Audit Report
A combined 3-perspective audit was written to:
`saas-platform/AUDIT-COMBINED.md`
Contains: customer UX audit, professional designer audit, business/conversion audit, with card-by-card ratings and specific improvement recommendations. Read it.

## Chart Library Research
A researcher evaluated 13 React chart libraries. Key findings:
- Keep recharts + nivo for current needs
- @number-flow/react for animated numbers (installed)
- CSS/SVG + framer-motion for custom premium visualizations
- Don't add apexcharts (470KB), echarts (800KB+), or chart.js (canvas = no glassmorphism)

---

## What to Do Next

The user wants to continue iterating on the designs. They are hands-on — they look at the page in their browser, take screenshots, and give direct feedback. Your workflow:

1. **Always take screenshots** with Playwright MCP before and after changes — the user expects to see visual results
2. **Use the inspiration images** — read them, analyze them, extract design patterns
3. **Deploy specialist teams** (design-lead, frontend-developer) for implementation
4. **Be opinionated** — suggest improvements, new card ideas, layout changes
5. **Fix the glossy section** — this is the most broken part right now
6. **Keep iterating** — the user treats this as a canvas. Add versions, variants, try new styles

### Specific tasks the user mentioned wanting:
- More glossy/glass effect variants that actually work
- Continue improving visual quality of all components
- Research and try new visualization libraries/approaches
- Add new component ideas from the inspiration images
- Make everything look premium, not AI-generated

### How to take screenshots:
```
mcp__playwright__browser_navigate → http://localhost:3001/marketing-showcase
mcp__playwright__browser_take_screenshot → fullPage or viewport
mcp__playwright__browser_evaluate → scroll to sections
```

### How to check the page:
```bash
cd /Users/adamks/VibeCoding/Beamix/.worktrees/marketing-showcase/saas-platform
node_modules/.bin/tsc --noEmit  # must exit 0
node_modules/.bin/next dev --port 3001  # start dev server
```

---

## Memory References
- `/Users/adamks/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/feedback_blue_only_palette.md` — Blue-only palette rule
- `/Users/adamks/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/MEMORY.md` — Project memory index
