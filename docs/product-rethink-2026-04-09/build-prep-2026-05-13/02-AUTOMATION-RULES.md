# Automation Rules Engine — 15 Rules

Resolves **P0-3** in `../10-PRE-BUILD-AUDIT.md`. Closes the rules-engine spec gap that blocks the Home + Automation pages and the suggestion generator.

These 15 rules are evaluated on every scan completion. Each emits zero or more `Suggestion` rows (`07-AGENT-ROSTER-V2.md` schema). When >5 rules fire on a single scan, the Haiku ranker (~$0.002/scan) orders the queue by `estimatedImpact × creditFit × tierAvailability`.

**Implementation home:** `apps/web/src/lib/suggestions/rules.ts` (Wave 1 Backend Worker 1)
**Trigger:** Inngest event `scan.completed` → invokes `evaluateRules(scanId, businessId)` → bulk-inserts to `suggestions` table.
**Each rule encodes as:**
```typescript
interface AutomationRule {
  id: string;                    // R01..R15
  name: string;
  triggerAgent: AgentType;       // which agent fires
  condition: (ctx: RuleContext) => boolean;
  impact: 'low' | 'medium' | 'high';
  title: (ctx: RuleContext) => string;     // shown on Home card
  description: (ctx: RuleContext) => string;
  availableOnTiers: PlanTier[];
  cooldownDays: number;          // don't re-suggest within window
}

interface RuleContext {
  scan: ScanResult;
  business: BusinessContext;
  previousScans: ScanResult[];   // last 4
  queryPositions: QueryPosition[];
  competitorData: CompetitorData[];
  archive: InboxItem[];          // approved items in last 90d
  ledger: TopicLedger;
}
```

---

## R01 — FAQ Content Stale
- **Triggers:** FAQ Builder
- **Condition:** Any approved FAQ Builder item in `archive` is older than 30 days AND no Freshness Agent item targeting that URL since.
- **Impact:** medium
- **Title:** `FAQ content older than 30 days — refresh it`
- **Description:** `Your FAQ page hasn't been updated in 32 days. Fresh data raises citation likelihood ~76% on ChatGPT.`
- **Tiers:** all
- **Cooldown:** 14 days
- **Suggestion creditCost:** 0 (free agent, daily-capped)

## R02 — Schema Missing on Homepage
- **Triggers:** Schema Generator
- **Condition:** `business.scanUrl` returned `hasSchema: false` on this scan AND no Schema Generator approval in archive for this URL.
- **Impact:** high
- **Title:** `Your homepage has no structured data — generate Schema.org`
- **Description:** `Google and Microsoft confirm schema markup increases AI citation likelihood. Schema.org JSON-LD is a 5-minute fix.`
- **Tiers:** all
- **Cooldown:** 90 days
- **Suggestion creditCost:** 0

## R03 — Score Drop ≥5 Points
- **Triggers:** Performance Tracker (with chained Content Optimizer suggestion)
- **Condition:** `scan.overallScore - previousScans[0].overallScore <= -5`.
- **Impact:** high
- **Title:** `Your visibility score dropped {{delta}} points — investigate`
- **Description:** `Visibility trend appears to have moved downward. Top driver: {{topDriverQuery}}.`
- **Tiers:** all
- **Cooldown:** 3 days (don't repeat-trigger on the same drop)
- **Note:** Output uses directional language only per board decision B5.

## R04 — Competitor Gap (Loss Aversion)
- **Triggers:** Content Optimizer
- **Condition:** Any tracked competitor is mentioned in ≥3 queries where the user is not mentioned.
- **Impact:** high
- **Title:** `{{competitorName}} appears in {{n}} queries where you don't`
- **Description:** `Three queries where they win and you're invisible: {{queryList}}. Optimize your top relevant page.`
- **Tiers:** all
- **Cooldown:** 7 days
- **Suggestion creditCost:** 2

## R05 — Citation-Thin Page
- **Triggers:** Content Optimizer
- **Condition:** A target URL has `query_positions.is_mentioned = false` on ≥4 of its tracked queries AND the page has no citations/stats detected (heuristic: <1 external link, <1 numeric stat in scraped content).
- **Impact:** medium
- **Title:** `{{pageTitle}} needs citations and stats to rank`
- **Description:** `AI engines cite pages with statistics and verified sources +40–115% more often. We'll inject the right ones.`
- **Tiers:** all
- **Cooldown:** 21 days per URL
- **Suggestion creditCost:** 2

## R06 — Under-Served Query Cluster (FAQ Opportunity)
- **Triggers:** FAQ Builder
- **Condition:** Query Mapper output identifies a cluster of ≥3 related queries with no FAQ Builder approval in archive AND `topic_ledger.isTopicCovered({{cluster}}) === false`.
- **Impact:** medium
- **Title:** `Build an FAQ page for "{{clusterName}}"`
- **Description:** `Three customer questions in this cluster have no clear answer on your site. FAQ schema gets cited above average.`
- **Tiers:** all
- **Cooldown:** 30 days per cluster
- **Suggestion creditCost:** 0

## R07 — Off-Site Presence Gap
- **Triggers:** Off-Site Presence Builder
- **Condition:** Engine results show ≥30% of citations come from third-party directories AND user has <5 verified `url_probes` rows for off-site placements (or 0 approved Off-Site items in last 60 days).
- **Impact:** medium
- **Title:** `Map directories AI engines trust for your industry`
- **Description:** `85% of AI mentions come from third-party sources. We'll find the highest-trust ones for {{industry}} and prep submission packs.`
- **Tiers:** all
- **Cooldown:** 60 days
- **Suggestion creditCost:** 0

## R08 — Review Presence Weak
- **Triggers:** Review Presence Planner
- **Condition:** ChatGPT engine results cite Yelp/TripAdvisor/G2 in the user's industry but the user has no verified review-platform presence (heuristic: `competitorData` shows ≥2 competitors with review-platform mentions, user has 0).
- **Impact:** medium
- **Title:** `Build review presence on platforms AI cites`
- **Description:** `ChatGPT pulls 48.7% of its citations from review platforms in {{industry}}. You're invisible there.`
- **Tiers:** all
- **Cooldown:** 45 days
- **Suggestion creditCost:** 2

## R09 — Competitor Movement Alert
- **Triggers:** Performance Tracker → notification (not an agent run; emits a `NotificationItem` of type `competitor_alert` AND a Suggestion to chain into Content Optimizer)
- **Condition:** A tracked competitor appears in ≥2 queries this scan where they were not present in any of the previous 4 scans (genuinely new visibility, not noise).
- **Impact:** high
- **Title:** `{{competitor}} gained visibility on {{n}} new queries`
- **Description:** `They appeared in: {{queryList}}. Last 28 days they had 0 presence. Worth investigating their content.`
- **Tiers:** all
- **Cooldown:** 7 days per competitor
- **Suggestion creditCost:** 0 (alert only; chained Content Optimizer suggestion uses 2 if accepted)

## R10 — Wikipedia / Knowledge-Graph Signal Weak
- **Triggers:** Entity Builder
- **Condition:** Business has no Wikidata Q-id detected (manual flag on `businesses` row) AND business is in eligible industry list (services, local, brand) AND last Entity Builder approval >90 days ago.
- **Impact:** medium
- **Title:** `Add knowledge-graph entries for {{business.name}}`
- **Description:** `Wikipedia accounts for 16.3% of ChatGPT citations. We'll guide a Wikidata + GBP entity build.`
- **Tiers:** all
- **Cooldown:** 90 days
- **Suggestion creditCost:** 2

## R11 — Reddit Topical Opportunity
- **Triggers:** Reddit Presence Planner
- **Condition:** Perplexity engine result includes a reddit.com source AND the user is not the cited brand AND business industry is in Reddit-active list (consumer SaaS, lifestyle, B2C services, gaming).
- **Impact:** medium
- **Title:** `Perplexity cites Reddit for {{queryText}} — show up there`
- **Description:** `Reddit drives 46.7% of Perplexity citations. We'll identify the 3 subreddits your audience reads and plan a presence strategy.`
- **Tiers:** all
- **Cooldown:** 30 days
- **Suggestion creditCost:** 1

## R12 — New Query Opportunity (Query Mapper Re-Run)
- **Triggers:** Query Mapper
- **Condition:** Business's `tracked_queries` is older than 60 days OR business has added a new `service` since last Query Mapper run.
- **Impact:** medium
- **Title:** `Re-map your queries — your services or industry shifted`
- **Description:** `Query landscape moves. A fresh Query Mapper run keeps every other agent aimed at the right targets.`
- **Tiers:** all
- **Cooldown:** 60 days
- **Suggestion creditCost:** 1

## R13 — Engine Coverage Gap
- **Triggers:** Content Optimizer (with engine-specific instructions)
- **Condition:** User is mentioned on ≥4 queries in 1 engine but ≤1 query in a different engine (e.g., visible on ChatGPT, invisible on Gemini).
- **Impact:** medium
- **Title:** `You're invisible on {{weakEngine}} — content tuning needed`
- **Description:** `Engines weight signals differently. {{weakEngine}} prefers {{signalType}}. We'll tune your top page for it.`
- **Tiers:** Build, Scale (Discover has 3 engines only — not enough breadth for this rule)
- **Cooldown:** 21 days
- **Suggestion creditCost:** 2

## R14 — Brand Mention Drop
- **Triggers:** Content Optimizer
- **Condition:** Average `is_mentioned` rate across all tracked queries drops ≥15 percentage points vs the average of the previous 4 scans.
- **Impact:** high
- **Title:** `Mention rate dropped {{deltaPp}}pp — diagnose & fix`
- **Description:** `Your brand was cited on {{prevPct}}% of queries last month; now {{currPct}}%. Trend suggests {{likelyCause}}.`
- **Tiers:** all
- **Cooldown:** 7 days
- **Suggestion creditCost:** 2

## R15 — Authority Blog Opportunity (Listicle/Comparison Gap)
- **Triggers:** Authority Blog Strategist
- **Condition:** Query Mapper output flags a high-volume cluster as "comparison" or "listicle" intent AND `topic_ledger` has not registered this cluster AND business has ≥1 Blog Strategist run in archive (proves prior approval — don't suggest cold).
- **Impact:** high
- **Title:** `Write the definitive "{{clusterTitle}}" piece`
- **Description:** `Listicles get cited 5× more often. Comparison pages 2.1×. This cluster has the signal — own the answer.`
- **Tiers:** Build, Scale (Authority Blog is Build+ only)
- **Cooldown:** 45 days per cluster
- **Suggestion creditCost:** 3

---

## Ranking algorithm (when >5 rules fire)

`src/lib/suggestions/ranker.ts` (Haiku, ~$0.002/scan):

```
score = baseImpact × creditFit × tierAvailability × freshnessBoost
```

- `baseImpact`: high=3, medium=2, low=1
- `creditFit`: 1.0 if `creditCost ≤ credit_pools.available - existing_holds`, 0.4 otherwise
- `tierAvailability`: 1.0 if rule available on current tier, 0.0 otherwise (rule dropped)
- `freshnessBoost`: **1.2 if rule has never fired for this business AND no `baseImpact='high'` recurring rule exists in the candidate set; 1.0 otherwise.** (Fix Agent 5 / I8: prevents constant "yet another new thing" surfacing over actionable repeat rules like a still-open competitor fix. High-impact recurring suggestions always win the slot over a fresh-but-medium one.)

Top 3 surface on Home. Remainder visible on Home in a "More" tray (NOT in the Inbox). Below position 5 hidden until top 3 are resolved.

**Where suggestions live (Fix Agent 5 / I2):** Suggestions live on Home. Suggestions never appear in the Inbox. The Inbox is the central review queue for agent-produced **content drafts** (post-run). Suggestions are pre-run "what to do next" cards — conceptually separate. This avoids the UI ambiguity flagged in audit synthesis SR-1.

## Day-1 special case

When `03-DAY-1-FLOW.md` fires the first scan, only the **top 1 high-impact rule** surfaces immediately. The next 2 unblock after 60 seconds (avoids overwhelming the first-impression dashboard). See §Day-1 in `03-DAY-1-FLOW.md`.

## Discover-tier modifier

Discover users see only 1 suggestion fully (rest blurred behind paywall). The ranker still scores all 15; the top-1 result is rendered, the rest go behind `PaywallGate`.

**Where Discover suggestions render (Fix Agent 5 / I2):** Discover users see 1 fully-visible suggestion on Home + a "More" tray with 4 blurred placeholder cards as an upgrade signal. Inbox is for content drafts (post-run) only, not for suggestions. Discover users have no Inbox-side suggestions surface — preventing the conceptual mix of pre-run suggestions with post-run drafts.

## Cooldown enforcement

`evaluateRules()` reads `suggestions` table (status filter: all) and filters out rules whose last-emitted timestamp for this `(businessId, ruleId, [keyContext])` is within `cooldownDays`. `keyContext` includes URL (R01, R05), competitor name (R04, R09), cluster (R06, R15).

## Quality gate before merge

Wave 1 Backend Worker 1 ships these 15 rules with a Vitest suite (one test per rule) that builds a fixture `RuleContext` and asserts the rule fires/doesn't fire. Test fixtures live in `apps/web/src/lib/suggestions/__fixtures__/`. QA Lead blocks merge if any test is missing.
