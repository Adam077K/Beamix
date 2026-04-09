# Design Handoff Prompt — Product Screenshot Components for Framer

> **Purpose:** Give this prompt to a CEO agent session to design product UI mockups/screenshots that will be used as image assets on the Framer marketing website.
>
> **When to use:** After the Framer site content is finalized. The designed components get exported as images (PNG/SVG) and uploaded to Framer as `backgroundImage` assets on hero sections, feature showcases, and dashboard previews.

---

## Prompt for CEO Agent

```
You are the CEO agent. Your mission: Design 5 high-fidelity product screenshot components for the Beamix marketing website. These will be rendered as static images and uploaded to our Framer marketing site.

**Context:**
Beamix is a GEO (Generative Engine Optimization) platform for SMBs. It scans businesses across AI engines (ChatGPT, Gemini, Claude, Perplexity), diagnoses visibility gaps, and uses AI agents to produce content that fixes those gaps. The marketing site lives in Framer. The product app is Next.js.

**CRITICAL — Read these files first:**
1. `docs/BRAND_GUIDELINES.md` — Colors, fonts, spacing (primary accent: #3370FF, headings: InterDisplay-Medium, body: Inter)
2. `docs/PRODUCT_DESIGN_SYSTEM.md` — Product dashboard design system
3. `docs/05-marketing/MESSAGING.md` — What features to highlight and exact copy
4. `docs/01-foundation/PRODUCT_SPECIFICATION.md` — User journeys, features, pricing

**Design tool:** Use Pencil MCP (`mcp__pencil__*`) or Stitch MCP (`mcp__stitch__*`) to create the designs. If neither is available, create them as React components in a scratch file using Tailwind CSS + Shadcn/UI, then screenshot with Playwright MCP.

**Brand rules (non-negotiable):**
- Background: #FFFFFF or #F7F7F7
- Primary accent: #3370FF (buttons, links, active states, progress rings)
- Text: #0A0A0A (primary), #6B7280 (muted)
- Card border: #E5E7EB, border-radius: 20px
- Score colors: Excellent #06B6D4, Good #10B981, Fair #F59E0B, Critical #EF4444
- Headings: InterDisplay-Medium. Body: Inter 400. Code: Geist Mono.
- Shadows: Card base `0 2px 8px rgba(0,0,0,0.08)`
- Container max: 1280px. Dashboard sidebar: 240px.
- NO placeholder text. NO lorem ipsum. Use realistic Beamix data.

---

## Component 1: Dashboard Overview (Hero Screenshot)
**Used on:** Homepage hero section, Features page
**Dimensions:** 1380px × 900px (matches Framer hero dashboard component)

**What to show:**
- Left sidebar navigation (240px): Logo, Dashboard (active), Scan, Agents, Content, Rankings, Settings
- Main content area with:
  - Top bar: "Welcome back, Sarah" + business name "Tel Aviv Insurance Co."
  - Visibility Score card: Large circular progress ring showing 67/100 in #3370FF, labeled "Visibility Score"
  - Engine breakdown row: 5 small cards — ChatGPT (72, Good), Gemini (58, Fair), Claude (81, Excellent), Perplexity (45, Fair), Google AI (61, Good)
  - Trend chart: Line graph showing visibility score over 8 weeks, trending upward from 42 to 67
  - Quick actions: "Run New Scan" button (#3370FF), "View Recommendations" button (outline)
  - Recent agent activity: 2-3 items like "Content Writer completed — 'Best Insurance FAQ Page'" and "Schema Optimizer — JSON-LD file ready"

**Data must look real.** Use an insurance company in Tel Aviv as the example business throughout all components.

---

## Component 2: Scan Results View
**Used on:** Features page, Homepage benefits section
**Dimensions:** 1100px × 700px

**What to show:**
- Header: "Scan Results — Tel Aviv Insurance Co." with timestamp "Scanned 2 minutes ago"
- Per-engine results in a clean table/card layout:
  | Engine | Mentioned? | Position | Sentiment |
  |--------|-----------|----------|-----------|
  | ChatGPT | ✓ Yes | #3 | Positive |
  | Gemini | ✓ Yes | #5 | Neutral |
  | Claude | ✗ No | — | — |
  | Perplexity | ✓ Yes | #2 | Positive |
  | Google AI | ✗ No | — | — |
- Mentioned = green checkmark (#10B981), Not mentioned = red X (#EF4444)
- Composite visibility score badge: "67/100" with color ring
- Competitors section below: "Harel Insurance (#1), Phoenix Group (#2), Your Business (#3), Migdal Insurance (#4)"
- "3 Recommendations" CTA button at bottom

---

## Component 3: Agent Chat Interface
**Used on:** Features page, Homepage agent showcase
**Dimensions:** 1100px × 750px

**What to show:**
- Full-page agent chat view (no sidebar needed)
- Header: Agent icon + "Content Writer" + status badge "Running"
- Chat thread:
  1. System message: "I'll create an FAQ page optimized for AI search engines. Based on your scan results, your business is missing structured FAQ content that ChatGPT and Perplexity look for."
  2. Agent output: A preview of generated FAQ content with 3-4 Q&A pairs about "Tel Aviv Insurance Co." — real-looking insurance questions
  3. User message: "Can you add a question about car insurance specifically?"
  4. Agent response: "Added. Here's the updated version with the car insurance FAQ:"
  5. Preview card: Shows the updated FAQ with formatting
- Bottom: "Approve & Save to Content Library" button (#3370FF) + "Edit" button (outline)
- Credit usage badge: "1 agent credit used"

---

## Component 4: Before/After Visibility Improvement
**Used on:** Homepage "The Advantage" section, Features page
**Dimensions:** 1000px × 500px

**What to show:**
- Split view: Left = "Before Beamix" (Week 1), Right = "After 4 Weeks"
- Left side (muted, slightly faded):
  - Visibility Score: 28/100 (#EF4444 red)
  - ChatGPT: Not mentioned, Gemini: Not mentioned, Perplexity: #8
  - "0 AI engines recommend your business"
- Right side (vibrant, full color):
  - Visibility Score: 72/100 (#10B981 green)
  - ChatGPT: #3, Gemini: #4, Perplexity: #1
  - "3 of 5 AI engines now recommend your business"
- Arrow or timeline connecting them: "4 weeks of agent work"
- Small upward trend sparkline between the two sides

---

## Component 5: Recommendations Panel
**Used on:** Features page, Homepage features section
**Dimensions:** 1100px × 650px

**What to show:**
- Header: "Your Recommendations" + "3 high-impact actions"
- 3 recommendation cards, each with:
  - Impact badge: "High Impact" (#EF4444), "Medium Impact" (#F59E0B), "High Impact" (#EF4444)
  - Title: e.g., "Create structured FAQ page", "Add JSON-LD schema markup", "Publish local authority content"
  - Description: 1-2 lines explaining why this matters for AI search
  - Suggested agent: Icon + name (e.g., "FAQ Agent", "Schema Optimizer", "Content Writer")
  - "Run Agent →" button (#3370FF)
  - Estimated improvement: "+8 points" / "+12 points" / "+6 points"
- Summary bar at bottom: "Total estimated improvement: +26 points" with progress bar showing 67 → 93

---

## Output format
For each component:
1. Create the design using the design tool (Pencil/Stitch/React)
2. Export as PNG at 2x resolution
3. Save to `saas-platform/public/marketing/` as:
   - `dashboard-overview.png`
   - `scan-results.png`
   - `agent-chat.png`
   - `before-after.png`
   - `recommendations.png`
4. Write a session file to `docs/08-agents_work/sessions/` with what was created

These images will be uploaded to Framer as background images for the marketing site sections.
```

---

## Where Each Component Goes in Framer

| Component | Framer Page | Section | Node to Update |
|-----------|-------------|---------|---------------|
| Dashboard Overview | Homepage `/` | Hero Dashboard (componentId: `G2Ufs_Tmm`) | Replace backgroundImage |
| Dashboard Overview | Features `/features` | Hero Dashboard (componentId: `G2Ufs_Tmm`) | Same component |
| Scan Results | Features `/features` | Benefits section AI Scan card | Left card backgroundImage |
| Agent Chat | Features `/features` | New section or benefit tab | Add as new content |
| Before/After | Homepage `/` | The Advantage component | Replace current visual |
| Recommendations | Features `/features` | Feature showcase area | Add as tab content |
