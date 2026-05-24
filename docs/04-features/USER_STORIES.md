# User Stories *(Updated 2026-05-23 — agency pivot)*

> **Source of truth:** `.claude/memory/DECISIONS.md` 2026-05-23 entry.
> Personas: [docs/01-foundation/PERSONAS.md](../01-foundation/PERSONAS.md).
> Full product spec: [docs/01-foundation/PRODUCT_SPECIFICATION.md](../01-foundation/PRODUCT_SPECIFICATION.md) (note: parts of that doc are superseded by agency pivot — read PRODUCT_SPECIFICATION banner first).

---

## Frame

Customers do not "use" Beamix as a tool. They **buy a result**: AI search visibility, delivered. The stories below are the buying / approving / outcome-watching journey — not the tool-operation journey.

---

## ICP A — B2B SaaS founder / VP marketing (< $5M ARR)

**As a B2B SaaS founder with no in-house GEO expertise,**
**I want to outsource AI search visibility to a vendor that does the work,**
**so that I can show up in ChatGPT / Gemini / Perplexity answers when my buyers research my category — without hiring a $3K–$8K/mo agency.**

**Key story beats:**
- Sees ad / LinkedIn post → lands on `/saas` page
- Runs free scan (no email) → sees "0 of 7 buyer-intent queries mentioned"
- Books 20-minute discovery call → discovery agent maps brand + restricted topics + competitors
- Selects Growth $999/mo (3 locations across product / pricing / docs URLs)
- Week 1: schema deployed on 4 landing pages, first FAQ drafted, 2 citations placed
- Week 2: approves first long-form article in approval queue (1-click)
- Week 4: visibility score up +12 points on Perplexity, +6 on ChatGPT
- Cancels day 47 because round closed and budget froze → 60-day money-back → keeps work product

## ICP B — Solo / small-firm lawyer

**As a solo attorney where 65% of qualified leads come from search,**
**I want to be the lawyer ChatGPT recommends when someone asks 'best DUI lawyer in Austin',**
**so that I capture intent before the user goes to a directory or pays a referral platform — and I want the vendor to handle the YMYL approval process correctly so I don't bear liability.**

**Key story beats:**
- Free scan from a podcast referral → result: "Not mentioned in any of 12 tracked legal-intent queries"
- Discovery call: explicitly flags YMYL approval requirements (every legal-content publish must hit human-approve, never auto)
- Selects Scale $1,499/mo (multi-location: office + sub-page per practice area)
- Week 1: schema deployed, 5 directory citations placed
- Week 2: approves first FAQ "What to do after a DUI in Austin" — single click, plain refund banner visible
- Week 6: starts seeing referral traffic logs cite ChatGPT / Perplexity in source URL parameters
- Stays past day 60. Renews at month 3.

## ICP C — Owner-dentist (single-location practice)

**As an owner-dentist already paying $1,200/mo for local SEO,**
**I want a separate vendor that handles 'AI search' specifically so I'm not betting my entire local-discovery channel on one agency,**
**so that when someone asks Gemini for 'best pediatric dentist near me' my practice shows up — and I want to see a weekly digest because I won't log in daily.**

**Key story beats:**
- Free scan referred by local-SEO consultant → "Not mentioned on 4 of 5 engines for pediatric dental queries"
- Self-guided onboarding (Starter $499/mo, single location)
- Week 1: GBP optimization update, schema markup on homepage, 3 review-site citations
- Weekly digest email lands every Friday → reviews wins, approves 2 FAQ cards via mobile
- Month 2: visibility +14 points across 3 engines, starts seeing "found you on ChatGPT" in new-patient forms
- Renews. Upgrades to Growth at month 4 to add multi-location.

---

## Cross-ICP Story Themes

| Theme | Story |
|---|---|
| **Approval-gate trust** | Customer must feel approval cards respect their authorship — no surprise publishes. |
| **Outcome visibility** | Customer must see the score move within 30 days, or they invoke the 60-day money-back. |
| **Traceability** | When a score moves, customer must be able to drill down and see exactly what Beamix did. |
| **Money-back as trust** | The 60-day no-questions guarantee removes the buying objection and signals confidence. |
| **One-click cancel** | Customer trusts the vendor more when cancel is visible, easy, and respected. |

---

## Anti-stories (explicitly NOT what we build)

- "As a power user, I want to configure scan cadence and manage agent credits" → No. Agents manage cadence; credits aren't customer-visible.
- "As a marketer, I want to A/B test agent prompts" → No. Agents are infrastructure; we tune them in ops.
- "As a customer, I want an Agent Hub to browse what each agent does" → No. Agent names hidden.
- "As a user, I want to write and edit content inline before approval" → Partial. Customer can edit text-only in the approval card. No rich editor. We're not a CMS.
- "As a customer, I want a 7-day or 14-day trial" → No. Retired. Replaced by 60-day money-back.

---

## Old user-stories framing (PRODUCT_SPECIFICATION.md sections 1.A and 1.B) — partially superseded

The Yael (marketing manager) and Avi (moving-company owner) personas in `docs/01-foundation/PRODUCT_SPECIFICATION.md` map to **deferred ICPs** (HVAC/services). The agency-pivot launch ICPs are the 3 above. Yael/Avi narratives are preserved in PRODUCT_SPECIFICATION.md for engineering reference but are not the launch persona set.
