---
name: engine-color-palette
description: Use Traffic by AI Engine donut colors (not arbitrary bright colors) across all agent/engine components
type: feedback
---

Use the engine color palette from the "Traffic by AI Engine" donut chart consistently across ALL agent and engine-related components. Do NOT use arbitrary bright colors (old: #3370FF/#F59E0B/#EC4899).

Correct palette:
- ChatGPT: #10B981 (green)
- Claude: #D4A574 (warm tan)
- Gemini: #4285F4 (Google blue)
- Google AI: #EA4335 (red)
- Perplexity: #8B5CF6 (purple)
- Grok: #6B7280 (gray)

**Why:** User wants visual consistency between the donut chart data and the agent cursor/pill components. The engine colors feel more natural and branded vs arbitrary bright colors.

**How to apply:** Any component showing agent cursors, agent pills, agent activity feeds, or engine-related UI should use these colors. The shared constants are in `src/components/marketing/engine-colors.ts`.
