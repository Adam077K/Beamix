# Beamix PRD — Master Document

> **Version:** 5.0
> **Date:** 2026-05-23
> **Status:** Agency Pivot — supersedes v4.0 (April 2026 rethink)
> **Authoritative source:** `.claude/memory/DECISIONS.md` 2026-05-23 entry + `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md`

> *Updated 2026-05-23 — agency pivot.* Beamix is no longer a self-serve GEO tool. It is a **done-for-you GEO agency** delivered as software. Customers pay $499–$2,499/mo for outcomes; agents run in the background, invisible to the customer.
>
> **Repository:** https://github.com/Adam077K/Beamix

---

## Document Structure

| Document | Purpose | Location |
|----------|---------|----------|
| **DECISIONS.md (2026-05-23 entry)** | 15 locked agency-pivot decisions | `.claude/memory/DECISIONS.md` |
| **Agency Pivot Session File** | Full grill session synthesis + tier matrix | `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md` |
| **Pricing v2 (RETIRED + new tiers)** | New 4-tier matrix (Starter/Growth/Scale/Professional) | `docs/product-rethink-2026-04-09/06-PRICING-V2.md` |
| **Product Vision (updated)** | Done-for-you agency category framing | `docs/product-rethink-2026-04-09/03-PRODUCT-VISION.md` |
| **Customer-Facing Agent Roster (updated)** | 7 new + 4 repurposed + 1 kept agents | `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md` |
| **UX Architecture (updated)** | Outcomes dashboard, approval queue, digest archive | `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md` |
| **Personas (updated)** | 3 launch ICPs: B2B SaaS / Solo Lawyer / Single-Location Dental | `docs/01-foundation/PERSONAS.md` |
| **Vision narrative (updated)** | Strategic framing of the done-for-you category | `docs/01-foundation/VISION.md` |
| **Engineering Principles** | Code conventions, tech stack decisions | `docs/ENGINEERING_PRINCIPLES.md` |
| **Roadmap (Wave 0/0.5/1/2 + new Wave 3)** | Engineering sequencing post-pivot | `docs/04-features/ROADMAP.md` |

---

## Executive Summary *(Updated 2026-05-23 — agency pivot)*

### What Is Beamix?

Beamix is a **done-for-you AI search visibility agency** delivered as software. Customers pay a monthly subscription; Beamix's agent fleet does the GEO work in the background — schema, citations, content, listings, outreach — and pushes results live with tiered approval gates. The customer sees outcomes (visibility score per engine, queries won, weekly wins), not tools.

### The Problem

People search inside ChatGPT, Gemini, Perplexity and Claude before they ever see Google. SMB owners and B2B SaaS founders are losing pipeline because they're invisible in AI search and don't know it. The tools that exist (Profound, Athena HQ, Otterly) show dashboards. Agencies that do the work charge $2,000–$8,000/mo. Nothing exists in the middle.

### The Solution

A done-for-you GEO operation, priced like SaaS, run by agents, with humans only in the loop where approval is required:

1. **Free scan** shows the visibility gap (no signup, no email).
2. **Discovery call** (agent-led) maps the brand, services, market, and approval preferences into a **brand fingerprint**.
3. **Subscription starts.** Agents start delivering schema, citations, listings, content, outreach.
4. **Tiered approval gates:** auto-publish for schema, citations, listings, scans; 1-click approve in the weekly digest for content, email-as-them, external outreach.
5. **Outcomes dashboard:** per-engine visibility score, weekly wins, top winning queries, approval queue, weekly digest archive, "how we got this" drill-down trail.
6. **60-day no-questions money-back.** If we don't move your AI search visibility in 60 days, you don't pay.

### The Differentiator

Every competitor builds dashboards. Every agency charges $2K–$8K. Beamix is the **done-for-you category leader at SMB pricing** — outcomes, not tools, at $499–$2,499/mo.

| What competitors do | What Beamix does |
|---|---|
| "You rank #7 in ChatGPT" (Profound, Athena, Otterly) | Schema landed. 3 citations placed. 2 articles published. Visibility +14 points. |
| $2,000–$8,000/mo agency retainer | $499–$2,499/mo software subscription |
| 30–60 day setup with PM, designer, copywriter | Discovery call day 1 + first deliverables in week 1 |
| Builds a dashboard for the customer to operate | Operates on behalf of the customer; customer sees outcomes |
| Locks customer into 6–12 month contract | Month-to-month + 60-day money-back |

---

## Customer *(Updated 2026-05-23 — 3 launch ICPs)*

**Launch ICPs (3 verticals):**

1. **B2B SaaS founder / VP marketing at companies < $5M ARR** — 73% of buyers use AI in evaluation; 51% start in AI chatbot vs Google; only 14% have a mature AI-visibility strategy. CAC pressure makes "be in the chatbot answer" the highest-leverage growth lever.
2. **Solo lawyer or managing partner at small law firm** — highest digital CPL of any industry ($649–$784); $1K–$3K/mo legal-marketing budget is standard; YMYL trust premium means AI-mention drives qualified intake. Ethics-aware approval gate is core requirement.
3. **Owner-dentist at single-location practice** — established habit of paying $800–$1,500/mo for local SEO; GBP + listing + review workflow already understood; AI-search overlay is incremental, not new behavior.

**Deferred to MVP+90:** HVAC/plumbing, real estate, DTC e-commerce, non-dental healthcare.

**Primary market:** Israel + US (Hebrew + English from day 1).

---

## Product Overview *(Updated 2026-05-23 — agency pivot)*

### Subscription Tiers (4 tiers — RETIRED Discover/Build/Scale)

| | **Starter** | **Growth** | **Scale** | **Professional** |
|---|---|---|---|---|
| **Price** | $499/mo | $999/mo | $1,499/mo | $2,499/mo |
| **Locations** | 1 | 3 | Unlimited | Unlimited |
| **AI engines tracked** | 3 | 5 | 7 | 7 + custom |
| **Prompts tracked per engine** | 25 | 75 | 200 | 500 |
| **Schema deployments/mo** | 4 | 12 | 24 | Unlimited |
| **FAQs published/mo** | 2 | 6 | 10 | 16 |
| **Citations placed/mo** | 5 | 15 | 30 | Unlimited |
| **Outreach emails/mo** | — | — | 10 | 30 |
| **Publishing integrations** | WordPress, Webflow, Shopify | + Ghost, Squarespace, Wix paste-ready | + GBP, Yelp, Apple Maps, schema via GTM | + Custom CMS |
| **Discovery** | Self-guided | Self-guided | Discovery call | Deep discovery + monthly strategy review |
| **SLA** | 48h | 24h | 12h | 4h + Slack |
| **Money-back** | 60-day | 60-day | 60-day | 60-day |

**Discovery → Subscription funnel:**
```
Free scan (no email)
  → Discovery booking (book 20-min agent-led call)
  → Brand fingerprint locked (agent + Adam-reviewed through customer #50)
  → Trial month-1 starts. 60-day money-back window opens.
  → Held-revenue accounting through day 60.
  → Day 61: revenue booked. Customer continues month-to-month.
```

### Tier Strategy Notes

- **Old tiers killed:** $79 / $189 / $499 (Discover/Build/Scale) RETIRED 2026-05-23. No migration path required — pre-revenue.
- **Annual not yet offered** — month-to-month only at launch. Annual revisited after refund rate stabilizes (post-customer #100).
- **Professional tier** includes Adam-led monthly strategy review through customer #50, then agent-handled (Strategy agent).

### Customer-Facing Agent Fleet *(Updated 2026-05-23 — 7 new + 4 repurposed + 1 kept)*

**Customers see outcomes, not agent names.** Agent names appear only in internal tooling, ops dashboards, and CPO/CTO planning docs. CMO must police every customer-facing surface for agent-name leakage.

| # | Agent | Wave | Status | Customer-visible? |
|---|-------|------|--------|-------------------|
| 1 | **Discovery agent** | 1 | NEW | No — runs the discovery call |
| 2 | **Brand-brief manager agent** | 1 | NEW | No — generates and maintains brand fingerprint |
| 3 | **Approval-gate writer agent** | 2 | NEW | No — drafts approval cards in digest |
| 4 | **Digest writer agent** | 2 | NEW | No — composes weekly digest |
| 5 | **Customer success agent** | 2 | NEW | No — proactive churn-risk + support flow |
| 6 | **Publisher agent** | 3 | NEW | No — pushes to WP/Shopify/Webflow/GBP/Yelp/Apple/SendGrid/GTM |
| 7 | **Strategy agent** | 3 | NEW | No — monthly strategy briefs (Professional tier) |
| 8 | **Content/FAQ agent** | repurposed | from old Content Optimizer + FAQ Builder + Authority Blog | No |
| 9 | **Schema agent** | repurposed | from old Schema Generator + Entity Builder | No |
| 10 | **Citation agent** | repurposed | from old Off-Site Presence + Review Presence + Reddit Planner | No |
| 11 | **Visibility tracker agent** | repurposed | from old Query Mapper + Performance Tracker | No |
| 12 | **Competitor intelligence agent** | kept (de-emphasized) | from old Competitor Tracker | No |

**Killed entirely:** Freshness Agent (folded into Content/FAQ), Reddit Presence Planner (folded into Citation), Video SEO (deferred to MVP+90).

**Full PRDs per new agent:** `docs/04-features/specs/agent-*.md` (7 specs).

### Tiered Approval Gates

| Action class | Approval model |
|---|---|
| Schema deployment | **Auto** — no human approval |
| Citation placement (low-effort directories) | **Auto** |
| GBP / Yelp / Apple Maps updates | **Auto** |
| Scan + visibility tracking | **Auto** |
| Content publishing (blog, FAQ, landing page) | **1-click approve** in weekly digest |
| Email-as-customer (outreach, review requests) | **1-click approve** in weekly digest |
| External outreach to third parties | **1-click approve** in weekly digest |
| Anything YMYL (legal / health / financial) | **Mandatory human review** before queue |

### Push Mechanism (Hybrid)

- **Auto-push on stable APIs:** WordPress, Shopify, Webflow, Google Business Profile, Yelp, Apple Maps Connect, SendGrid sub-account, schema via Google Tag Manager.
- **Paste-ready on Wix/Squarespace/custom CMS:** Beamix generates the artifact + 1-click instructions; customer pastes. We treat paste-ready as "shipped" once customer confirms.

### Brand Fingerprint

Every customer has a **brand fingerprint** built during the discovery call: tone, voice, services, target queries, restricted topics, approval preferences, publishing integrations connected. All agents read from the fingerprint. Adam reviews and approves every brand fingerprint through customer #50, then phases out.

---

## Product Philosophy *(Updated 2026-05-23 — agency pivot)*

- **Done-for-you, not assisted.** We do the work. The customer reviews approvals when required and watches the score move.
- **Outcomes, not tools.** Dashboard surfaces visibility score, weekly wins, queries won — never agent names, credit counters, raw scan tooling, or pipeline plumbing.
- **Traceability is a feature.** Every outcome has a drill-down: "How we got this" — what was published, where, when, citing what.
- **Auto where safe, approve where consequential.** Tiered approval, never autopilot on customer-as-author actions.
- **Money-back is the trust contract.** 60-day no-questions refund. Held-revenue accounting. One-click cancel in dashboard.
- **Adam in the loop through customer #50.** Brand fingerprints + Professional monthly strategy reviews. Phase out cleanly after that.

---

## Outcomes Dashboard (Customer-Facing) *(Updated 2026-05-23 — agency pivot)*

Old 7-page tool-framed dashboard (Home/Inbox/Scans/Automation/Archive/Competitors/Settings with `/dashboard/agents` plumbing) is **superseded**. New shape:

| Page | Purpose |
|---|---|
| **Outcomes (Home)** | Visibility score per engine · weekly wins · top winning queries · score trajectory chart |
| **Approval Queue** | 1-click approve cards for content / email / outreach. Cards generated by Approval-gate writer. |
| **Weekly Digest Archive** | Every weekly digest, searchable, dated. The narrative record of the relationship. |
| **Traceability ("How we got this")** | Per-outcome drill-down: which deliverable produced which score movement, when, with citations. |
| **Settings** | Profile · Brand fingerprint · Billing · Approval preferences · Publishing integrations · Cancel (one-click) |

**No-go (removed from nav):** Agent Hub, Agent Chat, Scans page (folded into Outcomes), Automation page (managed by agents, not customer), Credit counters anywhere.

---

## Key User Flows *(Updated 2026-05-23 — agency pivot)*

### 1. Free Scan → Discovery → Subscription

```
Public landing (vertical-specific: SaaS / Legal / Dental)
→ Free scan form (URL + business name + industry — no email)
→ 60–90s scan animation (engines light up live)
→ Result: visibility score per engine + 3 named opportunities (no blur, no paywall)
→ "Book your 20-minute discovery call" CTA (primary)
→ Discovery agent runs the call (agent-led; Adam reviews fingerprint through customer #50)
→ Brand fingerprint locked → checkout (Paddle) → first deliverables scheduled in week 1
→ 60-day money-back clock starts on activation (= discovery + connect + first scan complete)
```

### 2. Tiered Approval Cycle

```
Agents work → Approval-gate writer drafts approval card → card lands in Approval Queue
→ Customer clicks "Approve" (1 click) → Publisher agent pushes to integrations
→ Outcome lands in dashboard → Visibility tracker re-scans → Score updated
→ Digest writer composes weekly digest → email sent + archived in Weekly Digest Archive
```

### 3. 60-Day Money-Back

```
Day 1: Activation (discovery + connect + first scan). Held-revenue accounting starts.
Day 1–60: Cancel from Settings → refund processed → revenue never booked
Day 61: Revenue booked. Customer continues month-to-month or churns normally.
First-100 Founding Member cap. If refund rate ≥ 25%, tighten next cohort to 30-day mechanic.
```

---

## Tech Stack *(unchanged from v4.0; agency pivot is product-layer)*

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript strict |
| UI | Tailwind CSS, Shadcn/UI |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Background Jobs | Inngest |
| Payments | Paddle (subscriptions + webhooks) — NOT Stripe |
| Email | Resend + SendGrid sub-accounts (for email-as-customer outreach) |
| Publishing integrations | WordPress, Shopify, Webflow, GBP API, Yelp Fusion, Apple Maps Connect, GTM API |
| LLM — Claude | Direct Anthropic SDK |
| LLM — Others | OpenRouter for Gemini, GPT, Perplexity |
| Deployment | Vercel + Supabase Cloud |

### Wave 3 (NEW) — Publishing Integrations Matrix

Wave 3 builds out the Publisher agent + the integrations it needs:
- WordPress (REST API via app password)
- Shopify (Admin GraphQL)
- Webflow (CMS API)
- Google Business Profile (Business Profile API)
- Yelp (Yelp Fusion)
- Apple Maps Connect (Maps Connect API)
- SendGrid sub-account provisioning (for email-as-customer)
- Schema via Google Tag Manager (Tag Manager API)
- Paste-ready package generator (Wix / Squarespace / custom CMS — produces artifact + instructions only)

---

## Trial / Refund / Liability *(Updated 2026-05-23 — agency pivot)*

- **60-day no-questions money-back guarantee.** Plain refund. No fine print. One-click cancel in dashboard.
- **Activation requirement:** discovery call + property connect + first scan = activation. Required for refund eligibility.
- **Domain + business verification at signup.** Hard ban on re-signups under new emails.
- **Held-revenue accounting through day 60.** Cash stays intact if refund fires.
- **First 100 customers = "Founding Member" cohort.** If refund rate ≥ 25%, tighten next cohort to 30-day.
- **One-per-account refund rule.** Refund-then-resubscribe = no second money-back window.
- **Liability cap:** 12-month fees paid. Customer warrants property ownership. Customer approves all publishes. $1M general liability insurance. Customer indemnifies on 3rd-party claims from their content.
- **No uptime SLA at launch.** Best-effort. Premium SLA defers to MVP+90 with first enterprise upsell.

**Marketing copy:**
> EN: "If we don't move your AI search visibility in 60 days, you don't pay. No questions, no phone tree, no contract. Cancel in one click."
> HE: "60 ימים. אם לא הצלחנו לקדם אותך — כסף חזרה, בלי שאלות."

**Old 14-day money-back trial is RETIRED 2026-05-23.**

---

## Positioning & Copy *(Updated 2026-05-23 — agency pivot)*

**Hero (English):** "We get your business into ChatGPT, Gemini, Perplexity, and Claude. Done for you. From $499/mo. 60-day money-back."

**Hero (Hebrew):** "אנחנו דואגים שתופיע ב-ChatGPT, Gemini, Perplexity ו-Claude. אנחנו עושים את העבודה. החל מ-$499 לחודש."

**Agency anchor:** "A GEO agency charges $2,000–$8,000/month. Beamix delivers the same outcomes for $499–$2,499 — and shows you exactly what we did."

**Three positioning principles (CMO copy review required on every customer-facing surface):**
1. **Never name an agent.** Customers see "Beamix published 3 articles this week" — not "the Content Agent published 3 articles."
2. **Never expose credit counters or scan tooling.** Hide the plumbing.
3. **Lead with outcomes.** "Visibility +14 points" before "we did 3 things."

---

## Markets *(unchanged)*

**Primary:** Israel + US (Hebrew + English from day 1)
**Secondary:** UK, Australia (English-speaking SMBs)

---

## Beachhead Motion (Customers 1–50)

Per decision #13: Warm network + content + referral incentive. **Zero paid acquisition until customer #50 case studies exist.**

| Cohort | Motion |
|---|---|
| 1–10 | Adam personal LinkedIn + warm Israeli SMB intros + cold DMs to 50 named businesses per vertical |
| 11–20 | "State of AI Search" report drops + 3 vertical blog posts/week |
| 21–30 | Free scan link in Adam's LinkedIn + vertical community engagement |
| 31–50 | $500 referral credit for case-study customers |

---

## What We Are NOT Building *(Updated 2026-05-23 — agency pivot)*

- General SEO (Beamix is GEO-only)
- Paid ads management
- Social media management
- Email marketing (general — we only do email-as-customer outreach for GEO)
- Enterprise analytics platform (we serve SMBs)
- A self-serve dashboard that the customer operates (we operate; they approve)
- An "Agent Hub" or credit-counter UI (hidden behind outcomes layer)
- Video / YouTube SEO (deferred to MVP+90)

---

## Full Documentation

For complete detail, read the authoritative source documents:

- **15 locked agency-pivot decisions:** `.claude/memory/DECISIONS.md` (2026-05-23 entry)
- **Full grill session synthesis + tier matrix:** `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md`
- **Pricing v2 (updated):** `docs/product-rethink-2026-04-09/06-PRICING-V2.md`
- **Agent roster v2 (updated):** `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md`
- **UX architecture (updated):** `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md`
- **7 new agent PRDs:** `docs/04-features/specs/agent-*.md`
- **Personas (3 launch ICPs):** `docs/01-foundation/PERSONAS.md`
- **Vision narrative:** `docs/01-foundation/VISION.md`
