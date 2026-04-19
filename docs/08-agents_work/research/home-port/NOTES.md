# Home Port — Archive Mining + Reference Notes

## Archive Gems Worth Porting

1. `sparkline-card.tsx` — recharts LineChart wrapped in a ResizeObserver pattern; measure width dynamically. Port the resize pattern; swap recharts for pure SVG since recharts not in new app deps.
2. `visibility-trend-chart.tsx` — ComposedChart with Area + Line, gradient fill, custom tooltip, empty state. Port the gradient/multi-line SVG concept and custom tooltip style.
3. `competitor-bar-chart.tsx` — horizontal BarChart with Cell coloring (user=blue, others=slate), frosted-glass lock overlay pattern. Port horizontal bar concept as pure SVG.

## Reference Patterns Applied

**Linear home:** Top greeting ("Good morning, Itsik"), single large KPI in InterDisplay with verdict word + trend arrow. Below: horizontal metric tiles, then sections with heading + "view all" end-side link.

**Vercel project overview:** Stacked cards, title + one primary metric + sparkline on end side. Small type, tight line-height, negative space. Used for KpiCardRow tiles.

**Ramp dashboard:** KPI icon in colored tinted circle (not solid fill), trend arrow in brand success/danger colors, metric numbers XL bold. Used for KpiCardRow icon treatment.

**Attio home:** "What's new" activity feed, agent icon + one-line event + relative time on end side. 3-col desktop / 1-col mobile. Used for ActivityFeed.

## New Components to Build

- `ScoreHero.tsx` — upgrade existing: bigger Fraunces number, verdict word, trend arrow, subtitle
- `KpiCardRow.tsx` — 4 tiles: mention rate, sentiment, competitor SoV, pending suggestions
- `TrendChart.tsx` — pure SVG area chart, 30 day / 6 scan view
- `EngineBreakdown.tsx` — pure SVG horizontal bars per engine
- `ActivityFeed.tsx` — agent icon + one-line event + relative time
- `NextStepsCard.tsx` — top 3 suggestions with Accept button
- `HomeDashboard.tsx` — orchestrates all above

## Brand Tokens
- Primary: #3370FF
- Excellent: #06B6D4, Good: #10B981, Fair: #F59E0B, Critical: #EF4444
- Font: Inter (body), Fraunces (score number accent)
- Radius: rounded-xl (cards), rounded-2xl (hero)
