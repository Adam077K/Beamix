# Beamix Dashboard — Final Page Specs (for agents and developers)

**Date:** 2026-03-26 | **Stitch Project:** "Beamix Product Dashboard v2" (ID: 18055490936955938913)

## Design System

| Token | Value |
|-------|-------|
| Primary blue | `#3370FF` |
| Page background | `#F6F7F9` |
| Card surface | `#FFFFFF` |
| Card border | 1px solid `#E5E7EB` |
| Card radius | 8px |
| Card padding | 20px |
| Text primary | `#111827` |
| Text muted | `#6B7280` |
| Text tertiary | `#9CA3AF` |
| Dividers | `#F3F4F6` |
| Score good | `#10B981` |
| Score fair | `#F59E0B` |
| Score critical | `#EF4444` |
| Font | Inter (body + headings) |
| Data font | tabular-nums |
| Button primary | `#111827` bg, white text, 6px radius |
| Button accent | `#3370FF` bg, white text, 6px radius |
| Sidebar | 220px, white, 1px right border |
| Active nav | `#3370FF` text, `#EBF0FF` bg, 2px left border |
| Shadows | None or max `0 1px 2px rgba(0,0,0,0.04)` |
| Gradients | None on cards/surfaces |

## Navigation (5 items)

```
Overview       → /dashboard
Rankings       → /dashboard/rankings (includes Competitors tab)
Action Center  → /dashboard/action-center (Recs + Agents + Readiness)
Content        → /dashboard/content
Settings       → /dashboard/settings
[Bell icon]    → Notifications dropdown (not a page)
```

## Pages

### 1. Overview (`/dashboard`)
- **Job:** "Am I getting better? What should I do next?"
- **Sections:** Welcome bar, 4 KPI cards (score, engines, sentiment, credits), top recommendation with agent CTA, engine status grid, score trend chart, recent activity, quick actions
- **Key features:** Onboarding checklist for new users, industry benchmarks, trial countdown in sidebar
- **Primary CTA:** "Fix This" on top recommendation
- **Stitch screen:** "Beamix Overview - Onboarding & Context"

### 2. Rankings (`/dashboard/rankings`)
- **Job:** "Where exactly do I appear in AI search?"
- **Tabs:** My Rankings | Competitors
- **My Rankings tab:** Score history chart (with compare toggle), engine performance table (with expandable AI response snippets), query performance (per-query per-engine results), "What AI Says About You" quote cards
- **Competitors tab:** Market position bars, head-to-head comparison, share of voice, gap analysis with agent CTAs
- **Key features:** Export CSV, diagnostic hints on "Not Found" engines, query topic grouping
- **Primary CTA:** "Fix This" on poorly-ranked queries
- **Stitch screens:** "Rankings Deep Dive (Refined)" + "Competitors - Gap Analysis"

### 3. Action Center (`/dashboard/action-center`)
- **Job:** "What specific thing should I do next?"
- **Sections:** Progress bar (X of Y complete), priority filter tabs, recommendation list with evidence + impact + agent CTA, technical readiness checklist (Schema/FAQ/Content/LLMS.txt), all agents grid grouped by category
- **Key features:** Each recommendation shows affected engines, estimated impact, one-click agent launch with pre-filled context. Completed items show proof of improvement.
- **Primary CTA:** "Fix with [Agent Name] →"
- **Stitch screens:** "Recommendations (Refined)" + "Agents Hub (Categorized)"

### 4. Agent Chat (`/dashboard/agents/[id]`)
- **Job:** "Work with an AI agent to fix my visibility"
- **Layout:** Full-page chat, centered column (720px max), info panel right
- **Key features:** Streaming markdown, suggested prompts, pre-filled business context, quality score, "Save to Content Library"
- **Primary CTA:** "Save to Content Library"
- **Stitch screen:** "Agent Chat Workspace"

### 5. Content (`/dashboard/content`)
- **Job:** "See everything my agents created, track impact"
- **Layout:** Table view (Notion-style), filter tabs, search
- **Key features:** Type filter, quality dots, status (Published/Draft), word count, "Edit" links, performance tracking per content item
- **Primary CTA:** "Edit" or "Publish"
- **Stitch screen:** "Content Library"

### 6. Settings (`/dashboard/settings`)
- **Job:** "Update business info, manage subscription"
- **Layout:** Left sidebar navigation (Business Profile, Billing, Preferences)
- **Key features:** Form with labels above inputs, tag input for services, focus state on active input, save/discard buttons
- **Primary CTA:** "Save Changes"
- **Stitch screen:** "Settings - Business Profile"

### 7. Free Scan Results (`/scan/[scan_id]`)
- **Job:** "See my results, decide if Beamix is worth it"
- **Layout:** Full-width public page, no sidebar, centered (680px)
- **Key features:** Score ring, 3 free engine results, 4 locked engines, 2 teaser recommendations, upgrade CTA card with blue border
- **Primary CTA:** "Start 7-day free trial →"
- **Stitch screen:** "Free Scan Results" (if generated)

### 8. AI Readiness (merged into Action Center)
- **Job:** "How ready is my website for AI search?"
- **Lives in:** Action Center as "Technical Readiness" section
- **Sections:** Overall score, 5-category breakdown, issues list with agent CTAs
- **Stitch screen:** "AI Readiness" (if generated, otherwise part of Action Center)

---

## Fresh Perspective Improvements Applied (2026-03-26)

### Overview restructured:
- Zone 1 (hero): Score ring (140px, COLOR by tier) + Top recommended action side by side
- Zone 2 (live): Agent Activity with results + QA badges ("Content Writer created 1,240-word blog — quality 85 ✓")
- Zone 3 (data): Trend chart + engine status (below fold)
- Warm micro-copy: "Here's what's happening" not "Stay on top of"

### Recommendations improved:
- Evidence line per recommendation (what scan data triggered it)
- Confidence badges (HIGH/MEDIUM)
- Completed items show proof: "Done · Claude now mentions your About page (+3 pts)"
- "What happens next" card at bottom

### Free Scan Results redesigned:
- NEW "What our agents would fix" section (3 agent preview cards with estimated impact)
- Total estimated improvement: "47 → 72 (+25 points)"
- Personalized social proof: "Built for businesses like yours in Insurance"
- Data expiry urgency: "Results expire in 28 days"
- Color-blind safe indicators: filled vs empty circles (not just green/red)

### Cross-cutting:
- Warm micro-copy throughout: "Hit a snag — Retry" not "Failed"
- QA badges on agent-generated content
- Score ring uses tier color (the ONE moment of color on each page)
- Filled vs empty circles for all status indicators (accessibility)

---

## Screens to KEEP in Stitch (final versions)

1. "Beamix Overview - Onboarding & Context" (improved)
2. "Beamix Rankings Deep Dive (Refined)"
3. "Beamix Recommendations (Refined)" (improved)
4. "Beamix Agents Hub (Categorized)"
5. "Beamix Competitors - Gap Analysis"
6. "Beamix Agent Chat Workspace"
7. "Beamix Content Library"
8. "Beamix Settings - Business Profile"
9. "Beamix Free Scan Results" (new, conversion-optimized)

All other screens are old drafts — ignore them.
