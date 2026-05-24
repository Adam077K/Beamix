# Insurance Procurement Plan

*Created 2026-05-23 — agency pivot*
*Owner: Adam (personal action — not delegatable to agents)*
*Trigger: BEFORE customer #1 is invoiced*

**Status: OPEN — Adam-blocker. Do not sign customer #1 without confirming insurance is active.**

---

## What we need and why

Decision #12 (locked 2026-05-23) requires:
- **$1M general liability insurance** before customer #1
- Rationale: Beamix publishes content on behalf of customers. Even with the customer-indemnifies clause in ToS §10, Beamix faces potential first-party exposure from:
  - Defamation claims arising from published content (unlikely but possible)
  - Errors in published schema markup (e.g., wrong address causing economic damage)
  - Breach of contract claims (customer claims we damaged their SEO)
  - Third-party IP infringement claims on AI-generated content

Without insurance, a single credible claim could wipe out the first year of revenue.

**This is an Adam-blocker.** Beamix agents cannot procure insurance. Adam must complete this before customer #1.

---

## Coverage type needed

**Primary coverage required:**

| Coverage type | What it covers | Required limit |
|--------------|----------------|----------------|
| General Liability (GL) | Bodily injury, property damage, advertising injury (defamation from published content) | $1,000,000 per occurrence / $2,000,000 aggregate |
| Professional Liability / Errors & Omissions (E&O) | Claims that your work product caused financial harm (e.g., schema errors causing ranking damage) | $500,000-$1,000,000 per occurrence |

**Why E&O matters for Beamix specifically:** Publishing schema markup with errors (wrong NAP data, incorrect business category) could theoretically cause a customer's local rankings to decline. An unhappy customer may claim damages. E&O insurance covers this.

**Optional but recommended:**

| Coverage | Rationale |
|----------|-----------|
| Cyber liability | If Beamix's systems are breached and customer data (brand briefs, website credentials) is exposed |
| Directors & Officers (D&O) | Premature at this stage — defer to post-Series A |

---

## Israeli providers to contact

*Premium estimates below are (assumed) — actual quotes required. Israeli SaaS companies at this stage typically pay ILS 3,000-8,000/year (~$800-$2,100) for combined GL + E&O coverage.*

| Provider | Contact path | Notes |
|----------|-------------|-------|
| **Hibub (היבוב)** | hibub.co.il | Digital-first Israeli insurer. Often the fastest quote for tech startups. Start here. |
| **Phoenix Insurance (פניקס)** | phoenix.co.il/business | Major Israeli carrier. More traditional process but well-known. Ask for "ביטוח אחריות מקצועית" (professional liability) + "ביטוח צד שלישי" (third-party liability). |
| **Migdal (מגדל)** | migdal.co.il/business | Strong in SMB market. Comparable to Phoenix. |
| **Clal Insurance (כלל ביטוח)** | clalbit.co.il | Large carrier. May have digital SMB packages. |
| **Via insurance broker** | Any Israeli insurance broker | A broker can get quotes from all carriers simultaneously. Recommended if you want competitive pricing fast. Ask for a broker who specializes in tech / professional services. |

**International option (if Hebrew process is slow):**
- **Embroker** (embroker.com) — US-based digital insurer for tech startups. Offers GL + E&O bundle. Can cover Israeli-registered businesses operating internationally. Quote typically available in 24 hours.
- **Hiscox** (hiscox.com/business-insurance) — UK-based, operates in Israel via local partners. Tech E&O package well-suited for SaaS/agency.

---

## Expected annual premium

| Coverage | Estimated annual premium | Label |
|----------|------------------------|-------|
| General Liability $1M | ILS 2,000-4,000 ($540-$1,080) | assumed — Israeli market benchmark |
| Professional Liability / E&O | ILS 2,000-5,000 ($540-$1,350) | assumed — Israeli tech company range |
| Combined GL + E&O bundle | ILS 3,000-8,000 ($800-$2,150) | assumed |

**Expected annual total: $800-$2,150** (assumed). At $999 average subscription price, this is covered by 1-2 customer-months.

---

## Required documents for application

Have these ready when contacting insurers:

- [ ] Beamix business registration number (Israeli entity)
- [ ] Description of services (1-2 paragraphs — see below)
- [ ] Estimated annual revenue (Year 1 projection: $0-$1M, all from subscriptions)
- [ ] Number of employees (1 at launch — Adam; contractors as needed)
- [ ] Website URL (app.beamixai.com or beamixai.com)
- [ ] Claims history (none at this stage)
- [ ] Terms of Service (draft) — some insurers ask to review your liability limitation clause

**Service description for insurance application (paste-ready):**
> "Beamix is a B2B software-as-a-service company that provides AI search visibility management for small and medium businesses. We use autonomous AI agents to publish structured data (schema markup), submit business citations, generate search-optimized content, and track AI engine visibility on behalf of our clients. Clients approve content before publication. We are not a healthcare, legal, financial advisory, or regulated professional service provider. Revenue is subscription-based ($499-$2,499/month). Client contracts include a 12-month fee cap on our liability and require clients to indemnify us for third-party claims arising from their approved content."

---

## What is covered (what you're buying)

| Event | Covered by GL? | Covered by E&O? |
|-------|---------------|----------------|
| Customer claims published content defamed a third party | Yes (advertising injury) | Yes (errors in service) |
| Customer claims schema errors damaged their local rankings | No | Yes |
| Customer claims breach of service contract | No | Yes |
| Beamix employee or contractor injures someone at customer premises | Yes | No |
| Third party sues Beamix directly for content published on customer site | Yes (subject to your indemnification clause) | Yes |
| Data breach exposing customer business credentials | No (need cyber liability add-on) | Partial |

---

## What is excluded (important)

- **Criminal acts** — intentional fraud, deception not covered
- **Prior known claims** — events before policy start date
- **Excluded industries** — check policy for excluded business categories (cannabis, firearms, etc.)
- **War, government seizure** — standard exclusions

---

## Application timeline

| Step | Owner | Estimated time |
|------|-------|---------------|
| Get 2-3 quotes (Hibub + one major carrier + broker) | Adam | 2-5 business days |
| Review quotes + select coverage | Adam | 1-2 days |
| Complete application, pay first premium | Adam | 1 day |
| Policy effective | Insurer | Same day or 1-3 business days |
| **Total: 5-10 business days from first contact** | | |

**Recommended action: Contact Hibub first (fastest), then Phoenix as backup quote. Use a broker if you want all quotes in parallel.**

---

## What to do with the policy once active

- [ ] Store policy number and insurer contact in Adam's personal records
- [ ] Add insurer contact to Adam's emergency contacts
- [ ] Note renewal date — calendar reminder 60 days before expiry
- [ ] Update this file with actual policy details once active:
  - Insurer: [TBD]
  - Policy number: [TBD]
  - Coverage: GL $[X]M + E&O $[X]M
  - Annual premium: $[X]
  - Renewal date: [TBD]
  - Effective date: [TBD]

---

## Integration with ToS and legal plan

Once insurance is active:
- ToS §11 (Limitation of Liability) is backed by real coverage — do not reduce the $1M GL limit below your coverage
- Insurance does not replace the customer indemnification clause in ToS §10 — both operate together
- If a claim is made, notify your insurer BEFORE responding to the customer — most E&O policies require timely notice

---

*Reversibility: easy — insurance can be canceled with notice if business pivots. Premium is annual and partially refundable in most policies.*
*Adam-blocker: this cannot be delegated to agents. Adam must complete personally before customer #1.*
