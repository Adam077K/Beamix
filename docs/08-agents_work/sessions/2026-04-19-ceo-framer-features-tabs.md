---
date: 2026-04-19
lead: ceo
task: framer-features-tabs
outcome: COMPLETE
agents_used: [ceo]
decisions:
  - key: features_page_benefittabv2_content
    value: 4 tabs — Your Agent Workspace · Measure Every Fix · Automation That Runs for You · Your Competitor Gap Map
    reason: Fills the REVIEW→MEASURE→AUTOMATE→OUTRANK lifecycle gap — none of these were covered elsewhere on the features page
  - key: features_page_icons
    value: NotePencil · TrendUp · Lightning · Crosshair (Phosphor icon set)
    reason: Matches tab concepts visually; consistent with Phosphor icons already used in the project
context_for_next_session: "BenefitTabV2 copy and icons are defined but NOT yet pushed to Framer — waiting on product screen designs for DashboardImage01–04. Once screens are ready, update the 4 FeatureCardV5 nodes: K1uOwh6IR (tab 1), ShvnC1fzd (tab 2), mCwvfb3Jq (tab 3), hNbRvURE5 (tab 4). Fields: lOkzScCKA = title, fDECJFMcF = description."
---

## Summary

Audited the Framer features page (`/features`, nodeId `ibFeVtzT_`) to plan content for the `BenefitTabV2` component — the 4-tab feature showcase inside the "Let us handle the hard part" section.

**What we did:**

1. **Full page audit via Framer MCP.** Inspected every component on the features page: ScanDFR (3 cards), BenefitsSection 2 (AI Scan angle), HeroDashbord (screenshot), TheAdvantage (4 insight cards), IntegrationSection (engine wheel). Built a complete map of what features are already shown so nothing repeats.

2. **Read the product rethink docs.** Read `03-PRODUCT-VISION.md`, `07-AGENT-ROSTER-V2.md`, and `08-UX-ARCHITECTURE.md` from `docs/product-rethink-2026-04-09/`. Identified the full 4-stage GEO value chain (KNOW → UNDERSTAND → FIX → MEASURE) and confirmed the MEASURE stage and the proactive UX model (Workspace, Automation, Competitor gaps) were completely absent from the features page.

3. **Defined 4 feature tabs** that fill the gap — each a different lifecycle stage not covered elsewhere:

| # | Title | Description |
|---|-------|-------------|
| 1 | Your Agent Workspace | Agent output lands as a live document — not a notification. Read, edit, and approve before a single word reaches your site. |
| 2 | Measure Every Fix | Beamix rescans after every approved action. Watch your visibility score shift per engine, per query — so you know exactly what worked. |
| 3 | Automation That Runs for You | Schedule scans and content refreshes once. 15 trigger rules fire on every scan — drafts land in your Workspace automatically, ready to review. |
| 4 | Your Competitor Gap Map | 86% of AI citations aren't shared across engines. See every query your competitors win and you don't — each gap links to a fix ready to run. |

4. **Applied GEO optimization** (seo-geo skill). Copy uses specific stats (86% cross-engine citation gap, 15 trigger rules), self-contained quotable sentences, and direct answer patterns — all high-citability signals for AI engines.

5. **Defined icons and screen designs.** Phosphor icons: `NotePencil` · `TrendUp` · `Lightning` · `Crosshair`. Screen designs scoped per tab (Workspace 3-pane, score sparkline, automation schedule table, competitor query gap table).

---

## What's Needed Next

- [ ] Design the 4 product screenshots (DashboardImage01–04) based on the screen specs above
- [ ] Push copy + icons to Framer using `updateXmlForNode` on nodes K1uOwh6IR, ShvnC1fzd, mCwvfb3Jq, hNbRvURE5
- [ ] Confirm icon implementation approach (direct SVG or component prop)
