# Beamix — Pricing Page Spec
**Route:** `/pricing`
**Version:** 1.0
**Date:** 2026-02-28
**Status:** Draft — Ready for Dev

> The standalone pricing page serves high-intent visitors — people who Googled "beamix pricing" or clicked Pricing in the nav. They want detail. Give them everything.

---

## Page Meta (SEO)

**Title:** `Beamix Pricing — AI Search Visibility Plans for SMBs`
**Meta description:** `Start free. Upgrade when you see results. Beamix plans from $49/mo — weekly scans, AI agents, competitor tracking, no credit card needed to start.`
**Canonical:** `https://beamix.io/pricing`

---

## Smart CTA Logic

All CTAs on this page are context-aware. Three states:

| State | Condition | Button Text | Destination |
|---|---|---|---|
| Default | No `?scan_id` param, not logged in | `Start Free Trial →` | `/signup` |
| Has scan | `?scan_id=XXX` in URL, not logged in | `Continue with My Scan →` | `/signup?scan_id=XXX` |
| Has scan + logged in | `?scan_id=XXX` + authenticated session | `Apply Scan to My Account →` | `/dashboard?import_scan=XXX` |

**Dev note:** On page mount, read `scan_id` from URL params (`useSearchParams()`). Check Supabase auth session. Set CTA variant accordingly. The `scan_id` is passed from `/scan/[id]` when user clicks the upgrade CTA there. During signup, read `scan_id` from the URL and store in Supabase session/localStorage. After account creation, link the `free_scans` record to the new `user_id` via: `UPDATE free_scans SET converted_user_id = $user_id WHERE scan_token = $scan_id`.

---

## Page Structure

```
1. Hero
2. Monthly / Annual Toggle
3. Tier Cards (4 cards)
4. Full Feature Comparison Matrix
5. AI Engines Per Plan (explainer)
6. FAQ (6–8 questions)
7. Final CTA
```

---

## Section 1 — Hero

**Label:** `PRICING`

**Headline:**
`Start free. Upgrade when you see results.`

**Subheadline:**
`Every plan includes a 7-day free trial — no credit card required. See your AI visibility first, then decide if you want to fix it.`

**Trust signals (3 pills, horizontal row):**
- `7-day free trial`
- `No credit card required`
- `Cancel anytime`

**Dev note:** Hero is intentionally minimal. The tier cards below do the selling.

---

## Section 2 — Monthly / Annual Toggle

```
[Monthly]  [Annual — Save 20%]
```

- Toggle switches all prices simultaneously
- Annual prices shown as `$XX/mo` with `billed annually` note below
- "Save 20%" badge on the Annual option (green pill)
- Default state: Monthly

**Dev note:** Toggle is a controlled React state. All price values are defined as constants:
```
PRICES = {
  starter: { monthly: 49, annual_monthly: 39, annual_total: 468 },
  pro:     { monthly: 149, annual_monthly: 119, annual_total: 1428 },
  business:{ monthly: 349, annual_monthly: 279, annual_total: 3348 }
}
```
When Annual is active, show `$XX/mo` + `billed $XXX/year` in smaller text below.

---

## Section 3 — Tier Cards

Four cards, side by side on desktop, stacked on mobile.

---

### Card 1 — Free Scan

**Badge:** (none)
**Price:** `$0`
**Billing note:** `Always free — no account needed`

**Description:**
`See where your business stands across all major AI engines. Instant results, no account required.`

**Features:**
- Scan across all major AI engines
- AI Visibility Score
- Top competitor ranking
- 3 quick-win recommendations
- Results shared via link (30-day expiry)

**CTA Button:** `Scan My Business — Free`
**CTA destination:** `/` (anchors to hero URL input)
**Note below button:** `No signup required`

---

### Card 2 — Starter

**Badge:** (none)
**Price:** `$49/mo` (Annual: `$39/mo`)
**Billing note (annual):** `billed $468/year`

**Description:**
`For small businesses ready to fix their AI visibility and start ranking.`

**Features:**
- 4 AI engines scanned
- 10 tracked queries
- Weekly scans
- 5 agent uses/month
- 3 competitors tracked
- Content Writer agent
- Blog Writer agent
- FAQ Agent
- Schema Optimizer agent
- Markdown + HTML output
- 4 weeks trend history
- Email digest: weekly

**CTA Button:** `Start Free Trial`
**Note below button:** `7 days free · No credit card required`

---

### Card 3 — Pro

**Badge:** `Most Popular` (cyan pill, top right of card)
**Price:** `$149/mo` (Annual: `$119/mo`)
**Billing note (annual):** `billed $1,428/year`

**Description:**
`For growing businesses serious about AI search visibility and consistent content output.`

**Features:**
- 8 AI engines scanned
- 25 tracked queries
- Scans every 3 days
- 15 agent uses/month
- 5 competitors tracked
- All 7 agents (incl. Review Analyzer, Social Strategy, Competitor Intelligence)
- Markdown + HTML + JSON-LD output
- 12 weeks trend history
- Export: PDF + CSV
- Email digest: weekly + ranking alerts
- Support: priority email

**CTA Button:** `Start Free Trial`
**Note below button:** `7 days free · No credit card required`

---

### Card 4 — Business

**Badge:** (none)
**Price:** `$349/mo` (Annual: `$279/mo`)
**Billing note (annual):** `billed $3,348/year`

**Description:**
`For businesses that want daily intelligence, maximum output, and a serious competitive edge.`

**Features:**
- 10+ AI engines scanned
- 75 tracked queries
- Daily scans
- 50 agent uses/month
- 10 competitors tracked
- All 7 agents
- Markdown + HTML + JSON-LD output
- Google AI Overviews tracking
- 52 weeks trend history
- Export: PDF + CSV
- Email digest: daily + ranking alerts
- Support: priority email + onboarding call
- Top-up: 5 uses/$15 or 15 uses/$35

**CTA Button:** `Start Free Trial`
**Note below button:** `7 days free · No credit card required`

---

**Below all 4 cards — add-on note:**
`Need more agent uses? Top up anytime: 5 uses for $15 · 15 uses for $35 (available on all paid plans)`

---

## Section 4 — Full Feature Comparison Matrix

Full-width table. Sticky column headers on scroll (desktop). Horizontally scrollable on mobile.

**Columns:** Feature | Free Scan | Starter | Pro | Business

---

### Group: AI Coverage

| Feature | Free Scan | Starter | Pro | Business |
|---|---|---|---|---|
| AI engines scanned | All major | 4 engines | 8 engines | 10+ engines |
| Google AI Overviews tracking | — | — | — | Included |
| Scan frequency | One-time | Weekly | Every 3 days | Daily |
| Manual scan trigger | — | — | Included | Included |

### Group: Tracking

| Feature | Free Scan | Starter | Pro | Business |
|---|---|---|---|---|
| Tracked queries | — | 10 | 25 | 75 |
| Competitors tracked | 1 (top only) | 3 | 5 | 10 |
| Trend history | — | 4 weeks | 12 weeks | 52 weeks |

### Group: AI Agents

| Feature | Free Scan | Starter | Pro | Business |
|---|---|---|---|---|
| Agent uses per month | — | 5 | 15 | 50 |
| Agent use top-up | — | Available | Available | Available |
| Content Writer | — | Included | Included | Included |
| Blog Writer | — | Included | Included | Included |
| FAQ Agent | — | Included | Included | Included |
| Schema Optimizer | — | Included | Included | Included |
| Review Analyzer | — | — | Included | Included |
| Social Strategy | — | — | Included | Included |
| Competitor Intelligence | — | — | Included | Included |

### Group: Content Output

| Feature | Free Scan | Starter | Pro | Business |
|---|---|---|---|---|
| Markdown output | — | Included | Included | Included |
| HTML output | — | Included | Included | Included |
| JSON-LD / Schema output | — | Included | Included | Included |
| PDF export | — | — | Included | Included |
| CSV export | — | — | Included | Included |

### Group: Reporting

| Feature | Free Scan | Starter | Pro | Business |
|---|---|---|---|---|
| Visibility Score | Included | Included | Included | Included |
| Competitive leaderboard | Included | Included | Included | Included |
| Per-engine breakdown | Included | Included | Included | Included |
| Weekly digest email | — | Included | Included | Included |
| Daily digest email | — | — | — | Included |
| Ranking change alerts | — | — | Included | Included |

### Group: Support

| Feature | Free Scan | Starter | Pro | Business |
|---|---|---|---|---|
| Support | — | Email | Priority email | Priority + onboarding call |
| Team seats | — | Coming soon | Coming soon | Coming soon |
| Language | EN + HE | EN + HE | EN + HE | EN + HE |

**Dev note:** Render as a real `<table>` with `<thead>` and `<tbody>` grouped by `<tr>` group headers. Use a sticky `<thead>` on desktop. On mobile, make the table horizontally scrollable with the feature column fixed/sticky on the left. Checkmarks: use a filled circle icon for "Included", an em dash for "—". Plan tier column headers repeat the CTA button at the bottom of the table.

---

## Section 5 — AI Engines Per Plan

**Label:** `HOW AI ENGINE COVERAGE WORKS`

**Headline:**
`More engines = more visibility opportunities.`

**Body:**
`Each AI engine has its own ranking signals, its own way of discovering businesses, and its own audience. Higher plans scan more engines — giving you more surfaces to rank on and more data to act on.`

**Engine count display — 3 blocks:**

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Starter        │  │   Pro            │  │   Business       │
│                  │  │                  │  │                  │
│  4 Engines       │  │  8 Engines       │  │  10+ Engines     │
│                  │  │                  │  │                  │
│  [logo] [logo]   │  │  [logo] [logo]   │  │  [logo] [logo]   │
│  [logo] [logo]   │  │  [logo] [logo]   │  │  [logo] [logo]   │
│                  │  │  [logo] [logo]   │  │  [logo] [logo]   │
│                  │  │  [logo] [logo]   │  │  [logo] [logo]   │
│                  │  │                  │  │  + more          │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Note below blocks:**
`Exact engine list is finalized based on coverage at launch. All major AI engines are included at Business tier.`

**Dev note:** Logo placeholders — use gray rounded squares with engine initial until real logos are confirmed. When engine list is finalized, update this section and the scan-page.md. The Free Scan tier scans all major engines too — the difference is that paid plans track specific queries over time across those engines.

---

## Section 6 — FAQ

**Label:** `COMMON QUESTIONS`
**Headline:** `Everything you need to know before you start.`

---

**Q1: What is a "free scan"?**
The free scan is a one-time analysis of your business across all major AI engines. Enter your website URL — no account required — and we'll show you your AI Visibility Score, how you rank against competitors, and 3 specific things you can do to improve. Results are ready in about 60 seconds.

**Q2: What is an "agent use"?**
One agent use = one execution of any AI agent. Run the Blog Writer and get one blog post — that's one use. Run the FAQ Agent and get a full FAQ page — that's one use. It doesn't matter which agent you run or how long the output is: one run, one use. Agent uses reset at the start of each billing period.

**Q3: Do unused agent uses roll over?**
Yes — up to 20% of your monthly allocation rolls over each month. If you're on Pro (15 uses) and only use 10, 1 use carries forward. We don't penalize a slow month.

**Q4: Can I change plans anytime?**
Yes. Upgrade anytime — your new plan activates immediately. Downgrade anytime — the lower plan takes effect at the end of your current billing period. No lock-in, no fees.

**Q5: What happens after the 7-day free trial?**
After 7 days, your account moves to a read-only state. All your scan data is saved — you can still see your visibility score, rankings, and competitor data. To run new scans or use agents, upgrade to any paid plan. No charges happen automatically — we never require a credit card to start.

**Q6: Is there a contract or commitment?**
No contract. All plans are month-to-month (or annual if you choose). Cancel anytime in two clicks from your dashboard. If you cancel, access continues until the end of your paid period.

**Q7: Do you offer refunds?**
If you're not satisfied within the first 7 days of a paid plan, contact us and we'll make it right. After that, we don't offer prorated refunds for mid-cycle cancellations — but you keep access until your period ends.

**Q8: Can I add team members?**
Team seats are coming soon. Today, each account is single-user. We'll notify you when team access launches — you can opt in from your Settings page.

**Dev note:** Render as an accordion (Shadcn Accordion component). All collapsed by default. Q1 can be open by default as a hint to the interaction pattern.

---

## Section 7 — Final CTA

**Headline:**
`Still not sure? Start with the free scan.`

**Subheadline:**
`See your AI visibility score in 60 seconds. No account, no credit card. Then decide.`

**Primary CTA:** Smart CTA (same logic as header — see Smart CTA Logic above)
- Default: `Scan My Business — Free →` → `/`
- With scan_id: `Continue with My Scan →` → `/signup?scan_id=XXX`

**Trust line:** `7-day free trial on all paid plans · No credit card required · Cancel anytime`

**Secondary link:** `View the comparison table ↑` (anchor link back to Section 4)

---

## Visual Design Notes

**Theme:** Dark — matches dashboard and scan page. Not the light landing page style.
**Background:** Subtle gradient (dark navy → near-black). No hero illustration needed — this is a utility page.
**Tier cards:** Elevated dark cards with subtle border. Pro card has a distinct border (cyan) + "Most Popular" badge.
**Matrix table:** Alternating row shading (very subtle). Feature group headers are full-width with slightly lighter background.
**Toggle:** Pill-style switch. Annual state shows a green "Save 20%" tag that appears with a small animation on switch.
**Mobile:** Cards stack vertically in order: Free Scan → Starter → Pro → Business. Matrix becomes horizontally scrollable with feature column sticky.

---

## Hebrew Support

- Full page translates to Hebrew when HE toggle is active
- RTL layout applies (use Tailwind logical properties: `ps-`, `pe-`, `ms-`, `me-`)
- Prices remain in USD (do not convert — Israeli market pays in USD for SaaS)
- Hebrew copy status: not yet written — produce as separate deliverable after English version is approved

---

*Document version: 1.0 | Created: 2026-02-28 | Author: Iris (CEO Agent)*
*Smart CTA logic: scan_id from URL carries through signup to link free scan to new account.*
