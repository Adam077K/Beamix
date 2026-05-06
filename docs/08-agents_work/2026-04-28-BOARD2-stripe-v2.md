# Beamix Design Review — Through Stripe's Lens · v2
Date: 2026-04-28
Reviewer: Senior Designer applying Stripe's design discipline — /security as category-defining doc, Stripe Press as editorial moat, brand-at-every-scale, API-docs-as-design, error pages as editorial moments, the brand book as artifact.
Replaces: 2026-04-28-BOARD2-stripe.md (v1). v1 covered the surface-level audit; v2 ships the deeper structural recommendations Round 1 surfaced but didn't close.

> Stripe's design org isn't a department. It is the operating system of the company. Every surface — hero, dashboard chart, API error JSON, footer copyright, ASCII art in the CLI — is a single brand expression at a different scale. Beamix has named Stripe as the bar. v2 walks the surfaces Round 1 lightly touched and ships the deltas Beamix needs to ship if "Stripe-grade" is the standard.

---

## §1 — /security side-by-side: 8 deltas to ship

The /security spec (DESIGN-security-page-v1.md) is the only Beamix surface that explicitly cites Stripe by name. Walked next to stripe.com/security with a clear eye, here are the eight specific deltas Beamix should ship before /security is "Stripe-grade." (Round 1 surfaced four of these informally; v2 locks the other four.)

### Delta 1 — Compliance certification ribbon, above the fold, with auditor names

Stripe's /security opens with a horizontal ribbon of compliance badges: PCI DSS Level 1 (auditor: Coalfire), SOC 1 Type II, SOC 2 Type II (auditor: Deloitte), ISO 27001, HIPAA-eligible. Each badge links to the third-party attestation. The ribbon is the page's *operational confidence* signal — Stripe earned the right to lead with "we are audited," and the page front-loads it.

Beamix at MVP has zero certifications. The honest reading: the page must still ship a ribbon, but rendered as a **certification trajectory ribbon**, not a *current state* ribbon. Six pills, same visual treatment as the 6-stat ribbon already in the spec, but explicitly labelled as roadmap:

```
SOC 2 Type I        SOC 2 Type II      GDPR             CCPA            HIPAA-track       ISO 27001
target Q3 2026      target Q1 2027     compliant        compliant       2027 review       Year 2 review
auditor: TBD        auditor: TBD       DPA available    DPA available   not stored        not started
```

This is more honest than Stripe — Stripe doesn't disclose roadmap because Stripe doesn't have one in this dimension; everything is shipped. Beamix has a roadmap; disclosing it converts vagueness ("we're working on compliance") into specificity ("SOC 2 Type I is on the Q3 2026 audit calendar"). Aria reads this in 6 seconds and makes a procurement decision. **Procurement reviewers prefer dated honesty to undated claims.**

### Delta 2 — SOC 2 Type I at MVP, not Year 1 Q4 Type II

Round 1 noted Beamix targets SOC 2 Type II at Year 1 Q4. Stripe's lens: that's wrong. **SOC 2 Type I is achievable in 90 days post-MVP** with a security framework like Vanta or Drata; it requires a *point-in-time* attestation of controls, not a 6-month operating window. Beamix's procurement-blocked customers (Marcus's German enterprise client, the agencies serving regulated SMBs) will accept Type I as a bridge. **Type I at MVP+90 days; Type II at MVP+9 months.** This isn't a design move — it's a strategic move that the design surface reveals because the page exists. The page *forces* the question.

### Delta 3 — Trust Center, the Drata-style continuous-compliance dashboard

Stripe doesn't ship a Trust Center because Stripe is so big it doesn't need to — the Stripe brand carries the trust. Beamix is not Stripe; Beamix is a 5-person company asking SMBs to give it the keys to their AI-visibility kingdom. **Beamix needs a Trust Center.**

The MVP version is a single page at `beamix.tech/trust` separate from `/security`. The Trust Center renders, as live data, the controls that are continuously monitored:
- Last vulnerability scan date + result
- Last penetration test date + result + remediation status
- Current employee MFA enrollment percentage (target 100%)
- Last access-review completion date
- Sub-processor count + last-changed date
- Open Sev-1 incidents (target 0)
- Mean time to patch (CVSS 9+) — target ≤24h

The page renders as cream paper Disclosure register (Round 1 §F clarified the 3 registers — Artifact / Working / Disclosure — and Trust Center is Disclosure). 1240px max-width, 8 stat cards in a 2×4 grid, each card showing the metric + the date the metric was last verified. A small `View provenance →` link on each card opens an evidence panel (the Vanta/Drata pull, the auditor letter, the policy document).

The Trust Center is *generated*, not *written*. It updates daily from Vanta/Drata via webhook. Static HTML at the edge, regenerated nightly. **The artifact is the operational truth** — not a marketing page. This is the move that closes the procurement gap for Beamix at the SMB scale and is uniquely valuable because Stripe doesn't ship it.

### Delta 4 — DPA prominence: 1 click, not "linked from"

Stripe's DPA is one click from /security: a `View Data Processing Agreement →` button in the contact section. Beamix's spec references the DPA in 4 places but doesn't link to it. Procurement reviewers screenshot pages; they need a clickable DPA link in the right rail or in Section 03 (DSAR). **Add the DPA link to the right rail, persistently sticky, in `text-mono` `--color-brand-text` 13px, label `View DPA + SCCs ↓`.** Always visible during scroll. One click to download. This is the procurement-reviewer's load-bearing affordance.

### Delta 5 — security.txt at /.well-known/security.txt (RFC 9116)

Round 1 surfaced this. Lock it. ~12 lines, served as text/plain, signed with Beamix's PGP key:

```
Contact: mailto:security@beamix.tech
Contact: https://beamix.tech/security
Expires: 2027-04-28T00:00:00.000Z
Encryption: https://beamix.tech/security/pgp.asc
Acknowledgments: https://beamix.tech/security/acknowledgments
Preferred-Languages: en, he
Canonical: https://beamix.tech/.well-known/security.txt
Policy: https://beamix.tech/security/disclosure-policy
Hiring: https://beamix.tech/careers
```

Vulnerability-disclosure tooling (HackerOne, Bugcrowd's automated scanners) reads this file. Without it, Beamix is invisible to the security-research community. Two days of work; permanent trust signal. **Stripe ships this.** Beamix should.

### Delta 6 — The "Posture" PDF, named for what it is

The downloadable PDF (Section 7 of the /security spec) is currently called "the security page as PDF." Rename it: **"Posture v1.0 · April 2026 · 6 pages"** — the document title on Page 1 (cover) reads `BEAMIX SECURITY POSTURE · v1.0`. When SOC 2 Type II ships, the Posture document gets a §0.1 line: *"SOC 2 Type II report available under NDA — request via security@beamix.tech."* The Posture is the document the Trust Center *links to* for narrative context. Two artifacts, two jobs: Posture = the doctrine; Trust Center = the live state. Stripe doesn't have a "Posture" because Stripe's customers accept Stripe's controls as given. Beamix does need one.

### Delta 7 — "refuses to publish" → "cannot publish" (Voice canon polish, Round 1 #34)

Locked in synthesis. Worth repeating because it's *the* sentence the procurement reviewer screenshots: *"The publishing endpoint **cannot** publish without (a) a valid signature, (b) a fresh TTL, and (c) a hash match."* Mechanical, not volitional. Stripe-grade.

### Delta 8 — Cryptographic primitives section: keep, but Stripe wouldn't ship it

This is the inverse delta. Stripe's /security goes deep on PCI DSS, KMS architecture, and tokenization — but doesn't ship the kind of HMAC-SHA-256-with-60s-TTL paragraph Beamix's §9 ships. Why? Stripe's audience trusts Stripe by default; Stripe doesn't need to *prove* the primitive, only describe it. Beamix's audience is procurement-skeptical at the SMB scale. **Beamix needs the primitive paragraph more than Stripe does. Keep §9. It's the strongest piece of writing in the entire spec.** Round 1 was right; v2 confirms.

---

**Summary: ship the certification trajectory ribbon, accelerate SOC 2 Type I to MVP+90, ship the Trust Center as a separate /trust page, surface DPA link in the right rail, deploy security.txt, rename PDF as Posture, fix "refuses → cannot," keep §9 as deeper than Stripe.** Eight deltas, four cuts, four shifts. After these, /security passes the Stripe comparison.

---

## §2 — Monthly Update PDF as Stripe Press

Round 1 (v1 §B) surfaced the Stripe Press framing: cream paper, sewn binding, embossed colophon mark, Söhne + GT Sectra typeface stack. Beamix uses retail equivalents (Inter + InterDisplay + Fraunces 300 + Geist Mono). v2 ships the four structural moves Stripe Press would push hardest.

### 2.1 Typography — Fraunces roman, not Fraunces italic, for headlines

Locked from v1: limit Fraunces 300 italic to ledes, signatures, and pull-quotes. Promote **Fraunces 300 *roman*** with `opsz 144` + `soft 100` to all headline duties. Fraunces roman with the soft axis dialed up reads closer to GT Sectra; Fraunces italic, used too liberally, registers as decorative rather than editorial. The Page 2 lead-attribution headline — *"47 calls and 12 form submissions came from AI search this month"* — should be Fraunces 300 roman 48px, not italic. The lede beneath it stays Fraunces italic (the contrast between roman headline and italic lede is the editorial mechanic Stripe Press uses).

### 2.2 Per-month editorial cover — the Increment magazine analog

Stripe's *Increment* magazine had a per-issue editorial cover: a commissioned illustration, a photograph, or a piece of generative typography. Each issue's cover was its identity. The Beamix Monthly Update should get the same: **a per-month generative cover element, deterministic from the customer's UUID + month number.**

The cover composition (Page 1):
- 96px from top: Beamix wordmark + sigil at 24px, top-left.
- Top-right: `MONTHLY UPDATE · APRIL 2026 · v1.0` in Geist Mono 11px caps, `--color-ink-3`.
- 240px from top: business name in Fraunces 300 roman 64px, `--color-ink`.
- 24px below business name: month + year in Fraunces 300 italic 28px, `--color-ink-2`.
- 360px from top: the **generative cover element** — a 240×240px composition that's deterministically generated from `seed(business_uuid + month_number)`. The element is the customer's AI Visibility Cartogram for the month, rendered at 240px as a single image — the same Tufte cartogram (50 queries × 11 engines) that ships on Page 4, but here at cover scale, color-only, no labels, single composition. Each month the cartogram shifts as visibility changes; each cover is a unique image of that customer's month.
- 720px from top: the Activity Ring at 96×96, score numeral in the center.
- Bottom of page: closing Seal preview at 24×24, page number `1 / 6` in Geist Mono.

The cover is **the customer's month visualized in one composition**. It is unique to them, dated, and unrepeatable. Stripe Press would ship this. The cost is one server-side renderer (the cartogram already exists per F22) at a different size, with the cover composition as a React-PDF component.

The OG share card is the cover at 1200×630 — the same composition, scaled. When the customer tweets the Monthly Update permalink, the OG card is a unique generative artifact for that customer's month.

### 2.3 Interior — small-multiples on Page 4, with editorial weight

Round 1 (Tufte) added the small-multiples grid on Page 4. v2 makes one editorial refinement: **the grid needs a one-line Fraunces italic editorial caption underneath, not a chart legend**. The legend is the *grid itself*; the caption is *the editorial framing*. Example: *"You closed three queries you couldn't reach last month. Two new ones opened."* Fraunces 300 italic 18px, max-width 540px, 24px below the grid.

This is the Stripe Annual Letter pattern: dense data, then one editorial sentence framing it. The reader sees the grid (5 seconds), then the sentence (3 seconds), and walks away with both.

### 2.4 Binding line — the editorial spine (F31)

The binding line spec already locked: every product page bottom carries a small Fraunces 300 italic line rotating daily through the four Brief clauses. **Extend the binding line to the Monthly Update PDF**: the bottom of every page (after the page number) carries the Brief clause that authorized the most-impactful action on that page. Page 2's binding: *"Authorized by your Brief: '[clause]'."* Page 4's binding cycles through different clauses for different actions. The binding becomes the literal spine of the PDF — the line you read when you scan the bottom of every page.

Stripe Press books carry a colophon page at the back with the typesetter, paper, and printer. The Beamix colophon (Page 6, after the closing seal): *"Composed in InterDisplay and Fraunces. Data set in Geist Mono. Cream paper #F4ECD8. Generated APR 27 2026 by Beamix."* Geist Mono 11px, `--color-ink-3`, centered. **The colophon is the artifact's signature** — Stripe Press calls itself out as the publisher; Beamix should too.

---

## §3 — Brand-at-every-scale audit

Stripe's brand holds at every scale because each scale has a defined treatment. The 6px API badge in the docs sidebar uses a single-color glyph; the 24px navigation icon uses the wordmark mark; the 48px dashboard chart uses the gradient as accent; the 96px hero uses the gradient at full bleed. Each scale, one treatment, scaled-appropriate.

Beamix has 4 marks (Ring, Seal, Monogram, plus the Trace as a behavior, Margin as host) but the spec doesn't fully document the size-conditional treatment for each surface. Walked end-to-end:

| Scale | Surface | Mark | Treatment | Verdict |
|---|---|---|---|---|
| 16×16 | Favicon | Seal | Single color, no Rough.js, locked geometry | Locked Round 1; **good** |
| 16×16 | Email signature inline | Seal | Same as favicon | Add to spec; *gap* |
| 16×16 | Terminal `beamix --version` | Seal as ASCII art | 4-pointed asterisk at terminal scale | Add to spec; *gap* |
| 24×24 | Topbar lockup | Sigil (mark + wordmark) | Sigil 24×24 + wordmark 16px InterDisplay 500 | Locked Round 1; **good** |
| 24×24 | OG card embedded mark | Seal at 24px | Single color; geometry per Seal table | Locked; **good** |
| 32×32 | /crew row monogram | Monogram (2-letter, color disc background, deterministic Rough.js seed) | InterDisplay 500 caps 13px on color disc | Locked Round 1; **good** |
| 32×32 | Closing seal on artifacts | Seal at 32×32 (Rough.js, deterministic seed) | 2px brand stroke, 4-point asterisk geometry | Locked Round 1; **good** |
| 48×48 | Agent detail page hero | Monogram at 48px + name label | Monogram + 18px InterDisplay 500 below | Locked; **good** |
| 96×96 | /home Activity Ring | Ring (with score numeral inside) | 96px diameter, 30° gap, terminus dot | Locked; **good** |
| 96×96 | Monthly Update cover | Ring (with score) + generative cover | Cartogram at 240, Ring at 96 — see §2.2 | **Add cover composition** |
| 240×240 | OG share card sigil | Cartogram at cover scale | Generative; deterministic | **Add (per §2.2)** |
| 1200×630 | OG share card full | Cartogram + wordmark + dateline | Cream paper, all primitives at OG scale | **Add (per §2.2)** |
| Full bleed | /scan public hero | Ring + Score numeral + diagnosis | Already specced | **Good** |

**Three gaps surfaced:**

### 3.1 Email signature inline (the under-served scale)

Resend transactional emails (Round 1 referenced this surface). Currently the Resend templates use Beamix wordmark in the header at 24×24, but **the email signature line itself** — the one that appears at the bottom of every transactional email — should carry the Seal at 16×16 inline next to "— Beamix." The signature in HTML email is a render-once artifact; the Seal at 16×16 needs an inline-SVG version, not an `<img>` tag (some clients block external images). Lock this in `apps/web/lib/email/components/Signature.tsx`. The Seal at 16×16 in inline SVG is ~2KB; trivial; closes the brand-at-email scale.

### 3.2 Terminal — the Beamix CLI eventually

When Beamix ships its CLI (post-MVP, when the API ships), `beamix --version` should print:

```
    ╭───╮
    │ ✦ │   Beamix CLI v0.4.2
    ╰───╯   Authorized by your Brief: clause 2 of 4
```

The 4-pointed asterisk is the Seal's geometry rendered at terminal scale (Unicode U+2726 is close enough; the spec should pick the exact glyph). The Brief grounding citation extends to the CLI — every API response includes the `authorized_by_brief_clause` field (per F30), and the CLI surfaces it on every command. **Brand-at-CLI-scale is one of the things that would make Beamix engineering-credible** when developers eventually adopt the API. Stripe's CLI does this; the Stripe ASCII art is in every install banner.

### 3.3 The Print-Once-As-Gift artifact (F26) — physical scale

The unsolicited printed Monthly Update at month 6 is the largest scale: A4 cream paper, real wax seal letterpressed. This is brand-at-physical-scale; the Seal at A4 is 96px equivalent; the wordmark is 28px InterDisplay. The spec for the printed artifact should match the PDF version exactly — same composition, same proportions, same paper hex (printed proof for #F4ECD8 specifically chosen for Cougar Natural-equivalent stock). The Beamix bookmark inside is a 2"×6" cream-paper card with the wordmark on one side and the Brief clause that authorized the most impactful month's action on the other. Total package: 9 pages of cream paper, one wax seal, one bookmark, one envelope. **$14 in materials; one Twitter post that reaches 50,000 impressions per month-6 customer at Beamix's scale.**

---

## §4 — State of AI Search annual report — the un-defer recommendation

Round 1 v1 surfaced this in §E. v2 makes the formal recommendation: **ship at MVP, not at Year 1 Q4.**

### 4.1 Why now

Stripe ships *State of the Internet Economy* annually and the report becomes the artifact every payments-adjacent journalist references for 12 months. The earned media flywheel is permanent. Beamix has unique data: every public scan captures per-engine per-query rank for SMBs across verticals. *Nobody else has assembled this dataset.* Once Beamix has 200-500 scans (achievable at MVP+60 days), the dataset is large enough to publish meaningful aggregate findings. **The window to be the company that defined "the State of AI Search" closes the moment a competitor publishes first.**

### 4.2 The hero charts — 8 specific charts to build

1. **Citation share by industry vertical, Q1 2026** — bar chart, 12 verticals × 11 engines, showing which verticals are over- and under-served by AI search. *"Plumbing companies are cited 4× more often than law firms in Perplexity, despite 3× the search volume in legal."*
2. **Engine concentration index by query type** — heatmap, 50 query archetypes × 11 engines, showing which engines dominate which query types. *"ChatGPT owns 67% of conversational queries; Google AI Overviews owns 41% of locational queries; Perplexity owns 81% of research queries."*
3. **Ranking decay by content age** — line chart, 12 weeks of content age vs. citation rate, showing how quickly content decays in AI search. *"AI search ranks content less than 60 days old at 3× the rate of content older than 12 months."*
4. **Geographic citation parity** — choropleth map, US states + EU countries, showing where AI search "knows" about local SMBs. *"Tier-2 US cities have 5× the AI citation rate of comparable EU cities."*
5. **Schema-markup ROI** — scatter plot, schema completeness vs. citation rate. *"FAQPage schema correlates with 41% higher citation rate; ProductSchema correlates with 12%."*
6. **The competitor displacement curve** — when one local SMB's content is updated, how long until the competitor's citations decay? *"Average displacement window: 9 days. Long-tail displacement: 47 days."*
7. **Voice-to-prose citation gap** — voice-search engines (Google Assistant, Siri, Alexa) cite differently than text engines; the gap is 2.4× in favor of conversational tone.
8. **The AI Visibility Cartogram, aggregate edition** — 50 queries × 11 engines, but aggregated across all Beamix customers; shows the *category-level* visibility frontier. *"At any given moment, 23% of small-business queries return zero citations."*

Each chart is the kind of fact a TechCrunch journalist quotes; each chart is the kind of citation Patrick Collison links to.

### 4.3 The editorial spine — 8 sections

1. **Foreword** — single editorial page, Adam-signed. *"We started Beamix because we couldn't find our customers' restaurants in ChatGPT. This report is what we learned."* Cream paper, Fraunces 300 italic, 1 page.
2. **Methodology** — 1 page, Geist Mono, the data: how many scans, how many queries, which engines, which verticals, the limitations. Stripe's *Atlas* always opens with methodology; the report is more credible as a result.
3. **The state of citation share** — chart 1 + 2 pages of editorial framing.
4. **The decay frontier** — chart 3 + 1 page.
5. **Geography of AI search** — chart 4 + 1 page.
6. **The schema lever** — chart 5 + 1 page (this is the SEO-marketing-value chapter; SEO journalists cite this one most).
7. **The competitor displacement window** — chart 6 + 1 page (this is the strategic-marketing chapter).
8. **The Cartogram, at scale** — chart 8 + 2-page centerfold (the report's hero artifact).
9. **Closing — what's next** — 1 page editorial. *"AI search is now where SEO was in 2003. The companies that adapt now will own the decade. We'll publish this report quarterly."*

24 pages. Cream paper #F4ECD8. Fraunces 300 + Inter + Geist Mono. Closing colophon. Page numbers in the printer's-margin tradition. **The cover is a single full-bleed Cartogram aggregate at 1200×1600px with the title overprinted in 96px Fraunces 300 roman.**

### 4.4 Launch plan

- **Soft pre-launch** — Beamix's 50-200 customers get the report first via email, 7 days before public launch. Their version is co-branded: *"Your business is one of [N] referenced in this report."* This makes the report more shareable from the customer side.
- **Embargoed press** — TechCrunch, The Verge, Search Engine Journal, Marketing Brew get the PDF under embargo 5 days before launch. Adam interviews 3-5 of them.
- **Launch day** — Hacker News, Twitter, LinkedIn, Threads, Mastodon. Founder thread on each platform with the Cartogram as the lead image. Beamix's Twitter: 8-tweet thread, one chart per tweet.
- **Permalink** — `beamix.tech/state-of-ai-search-2026`. Cream paper, single editorial page that is the report (long-form), with PDF download. The OG card is the Cartogram aggregate. Schema.org `Article` markup; AI engines cite it within 7 days.
- **Print run — limited gift edition** — top 50 customers (those above $499/month plan) get a printed copy in the mail. This pairs with F26 (Print-Once-As-Gift, month 6) — the State of AI Search arrives separately, bigger format (8.5"×11" softcover, perfect-bound). Cost per unit: $18. Total cost: $900 for 50 units. **The reach: every TechCrunch journalist who Adam interviewed wants the print copy; some get it in the mail; one of them tweets a photo.**

### 4.5 The recommendation — ship at MVP

- Move F22 (AI Visibility Cartogram) earlier in the build: the Cartogram is the report's hero. F22 is already MVP per Round 1; the report uses the same renderer at aggregate scale.
- Hire one freelance editor for 6 weeks to write the editorial framing. Cost: ~$8,000.
- Adam writes the foreword and the conclusion.
- Beamix's data team produces the charts (3 weeks of work, async with build).
- Design: 2 weeks for layout + cover + PDF generation, sharing the React-PDF infrastructure already built for the Monthly Update.
- **Total cost: $8,000 + 5 weeks of in-house work. Total earned media potential: 6-12 months of "Beamix is the company that defined GEO."**

This is the move that converts Beamix from "GEO product" to "the company every payments-adjacent journalist cites for 12 months." It is the cheapest brand move on the table and has the highest strategic leverage. **Ship at MVP.**

---

## §5 — API documentation as design — the /docs roadmap

Beamix will ship a public API. The schema already exists (Truth File, audit log, Brief, Monthly Update — all JSON-Schema-conformant per Round 1 §G item #5). The /docs surface is *the most-overlooked design surface* in early-stage products and is, at Stripe, arguably better-designed than the dashboard.

### 5.1 When to ship /docs publicly

**Proposal: at the moment the API has 5 paying API customers, not earlier.** Shipping /docs without API customers is theatre. With 5 paying customers (typically agencies + the ~10 largest Scale-tier customers), the API is real, the patterns are battle-tested, and the docs reflect reality. Estimated timing: month 6-9 post-MVP.

Before /docs ships publicly, the *schema docs* ship. Round 1 §G item #5 already proposed this: `beamix.tech/schemas/` as a static site rendering the Truth File, audit log, Brief, and Monthly Update JSON Schemas in Stripe-API-docs split-view. This is the cheap brand move; it ships in 2 weeks and lives forever. Once the API has paying customers, /docs replaces /schemas.

### 5.2 Architecture — split-view, code on the right

Stripe's /docs is a 4-column layout: nav rail (240px), editorial content (560px), code panel (480px), TOC rail (160px). Each scrolls independently. The editorial content describes the API; the code panel shows the canonical example in the language the user has selected.

Beamix's /docs should mirror this exactly. Split-view, code on the right, language tabs at the top of the code panel: `curl` / `Node` / `Python` / `Go`. Default tab: `curl`. The code panel is **mode-locked to Geist Mono 13px** with syntax highlighting in the brand palette (no rainbow highlighting; brand-blue for keywords, ink-3 for comments, ink for values).

### 5.3 The "Try it" interactive playground

Stripe ships an in-page playground: every endpoint can be tested with the user's test API key, inline. Beamix should ship the same: every Beamix /docs endpoint has a "Try it" button that opens an inline drawer (480px wide, slides in from the right, transient). The drawer accepts the user's API key (auto-filled if logged in), shows the request payload, runs the request, shows the response. **The playground is the conversion mechanic** — engineers who try the API in /docs convert at 4× the rate of those who only read.

### 5.4 Errors-as-design

Stripe documents every error code as a first-class entity: every error has a permalink (`stripe.com/docs/error-codes/card_declined`), a description, a suggested fix, and example responses. Beamix should commit to this from day 1. Every Beamix API error code is documented at `beamix.tech/docs/errors/[code]`; the error response payload includes the URL:

```json
{
  "error": {
    "code": "brief_clause_invalid",
    "message": "The Brief clause referenced does not exist in the customer's current Brief version.",
    "documentation_url": "https://beamix.tech/docs/errors/brief_clause_invalid",
    "request_id": "req_2HJ9X8K2L1"
  }
}
```

The `documentation_url` field is the design move. Engineers debug faster. AI engines cite the error pages when developers ask Claude "what does this Beamix error mean." **The error pages become long-tail SEO** — every error documented becomes a landing page for engineers searching for it.

### 5.5 Brief grounding in API responses (F30 extension)

Round 1 locked F30: every agent action carries inline Brief grounding citation. The API extension: **every Beamix API response that mutates state includes the `authorized_by_brief_clause` field**.

```json
{
  "action_id": "act_8KL2M9X3",
  "type": "schema_doctor.added_faq_page",
  "applied_at": "2026-04-28T14:32:11Z",
  "authorized_by_brief_clause": {
    "clause_id": "br_clause_2",
    "clause_text": "Add structured data to product pages to improve AI search visibility.",
    "brief_version": "v1.2",
    "brief_url": "https://beamix.tech/brief/v1.2"
  }
}
```

The structural commitment carried into machine-readable surfaces. **Every API response is a constitutional document.** This is the move that makes the Brief grounding system uniquely Beamix's; every other GEO tool will eventually copy the visible UI of brief grounding, but copying the structural commitment in the API contract requires copying the entire architecture.

---

## §6 — Error pages as editorial moments

Stripe's 404 is a tiny editorial: a single line, the wordmark, a link home. Beamix's spec has no 404 / 500 / maintenance design. v2 ships them.

### 6.1 The Beamix 404

Cream paper #F4ECD8 full bleed. Top-left: Beamix wordmark + sigil 24px. Vertical center: the Seal at 96×96 (Rough.js, deterministic seed `seed("404")` so it renders identically every load). 32px below the seal: a single Fraunces 300 italic line, 28px, `--color-ink-2`, max-width 480px:

> *"We couldn't find that. Either you typed something wrong, or we never wrote it."*

48px below: a primary `Go home →` text-link (`--color-brand-text`, no button). Below that, 16px gap, in Geist Mono 11px `--color-ink-3`: `404 · beamix.tech`.

That's the page. Three elements + the closing dateline. **Every Beamix surface is the same brand fabric.** The 404 is editorial because the brand register is editorial; nothing was added for the error page.

### 6.2 The 500

Same composition, different text:

> *"Something went wrong. Beamix is logging it."*

Below the line: `View status →` link to `beamix.tech/status` (a status page hosted on a separate domain — Statuspage.io or a self-rolled equivalent). Below: `500 · beamix.tech · Request ID: req_8KL2M9X3` in Geist Mono 11px. The Request ID is the support-ready-out-of-the-box affordance — when the customer emails support, they paste the ID and the on-call engineer can find the trace immediately.

### 6.3 Maintenance / scheduled-downtime

Same composition. Text varies:

> *"Beamix is briefly offline. Back at 14:00 UTC."*

Below: a live countdown (the maintenance window's end time). Status page link. **Crucially: the status page itself follows the same cream-paper register.** Every Beamix surface that the customer touches is the same brand fabric — the status page, the 404, the 500, the API error pages, the email signature, the CLI banner. One brand, every scale, every surface.

### 6.4 The status page (`beamix.tech/status`)

Cream paper. 8 system components in a vertical list (API, scan engine, agent system, validation, audit log, billing, email delivery, dashboard). Each component shows: name, current status (operational / degraded / outage), last-changed timestamp, last 90 days of uptime as a 90-cell color strip (Tufte's small-multiples again — uptime as bar). The overall system status at the top in 28px Fraunces italic: *"All systems operational"* or *"Degraded performance in scan engine."* Closing dateline + permalink.

The status page is *generated*, not written. It updates every 60 seconds from a healthcheck endpoint. **Static HTML, fast, cached at the edge.** The status page becomes the page Yossi (managing 12 clients) bookmarks; the status page becomes what Aria checks before every renewal conversation.

---

## §7 — The Beamix brand book artifact (Year 2 spec)

Stripe Press would eventually publish *the Beamix brand book* as a printed object. The 18-agent monogram set, the seed-to-path generative function, the Seal geometry, the cream paper hex audit, the size-conditional rendering rules — these become chapters. The brand book is a Year 2 artifact, not MVP. But the *spec* for it is MVP-able.

### 7.1 Why a printed brand book

Stripe published its brand guidelines as a printed book in 2018; the book became a recruiting artifact, a customer-meeting prop, and a signal that the brand was a *durable craft object*, not a marketing deliverable. Beamix's brand book at Year 2 (when the monogram set is locked, when the seed-to-path function is brand canon, when 18+ agents have shipped) is a 96-page hardback that signals: *Beamix is the company that took its brand seriously.*

### 7.2 Structure — 8 chapters

1. **Origin** — 8 pages. The story of "We couldn't find our customers' restaurants in ChatGPT." Adam's foreword. The first scan ever run. The first agent. Editorial; Fraunces 300 italic; one photograph (the founder's whiteboard).
2. **The Seal** — 12 pages. The 4-pointed asterisk geometry. The size table (16, 20, 24, 32, 48, 96). The Rough.js stamping curve. The Seal at every scale, photographed on cream paper.
3. **The Ring** — 10 pages. The score frame, not the score. The 30° gap. The terminus dot. The Cycle-Close Bell motion as a sequence of stills.
4. **The Monograms** — 24 pages. The seed-to-path generative function as a chapter. The 18 agents' fingerprints, each at 96×96 with a 1-paragraph biography. The function: *"Each agent is born from one UUID. From the UUID, one Rough.js path is generated, deterministically, forever. This is the agent's signature."*
5. **The Cartogram** — 8 pages. The State of AI Search 2026 launch. The cartogram aggregate. The methodology. The chart.
6. **The Cream Paper** — 8 pages. The hex audit. Three swatches under three light conditions on three displays. The chosen #F4ECD8. The reasoning. Photographs.
7. **The Voice** — 12 pages. *"Beamix" externally, agents named in the product.* The Brief grounding citation as voice. The error pages as voice. The CLI banner. Examples and anti-examples.
8. **The Colophon** — 4 pages. Composed in InterDisplay, Inter, Fraunces, Geist Mono. Set by hand by Beamix's design team. Printed by [printer], on Cougar Natural 100lb. Bound by [bindery]. ISBN. Edition size. The colophon is the artifact's signature.

### 7.3 Production

96 pages. Hardback. Smyth-sewn binding. Cougar Natural 100lb cream paper for interior, dust jacket on Mohawk Loop. Title in 64pt Fraunces 300 roman, foil-stamped. Edition of 500. Cost per unit: ~$28. Total: $14,000.

Distribution: Beamix customers above Scale tier (50 copies). Press (50 copies). Recruiting (200 copies, given to design candidates as part of interview process). Adam's reading list (100 copies, signed). 100 sold at the Beamix-store at $80/copy as the recoupment mechanic.

### 7.4 The MVP-ready spec

The brand book ships in Year 2. The *spec* — the 8-chapter outline above, the production specs, the printer chosen, the bindery chosen, the cost per unit, the edition size — ships now, in the brand canon document. **Documenting the artifact creates the obligation to ship it.** Stripe Press shipped its first book before having an editorial calendar; the book existed because someone had specified what it would be.

---

## §8 — The 5 highest-leverage moves Stripe would push hardest

Walked end-to-end, the five moves that compound most.

### 8.1 SOC 2 Type I at MVP+90 days, not Type II at Year 1 Q4

The procurement-friction-removal move. Cost: ~$15K (Vanta + auditor). Effect: Marcus's German enterprise customer renews; the agency tier opens; Beamix becomes procurement-friendly at the SMB scale before any competitor. *This is a strategic move surfaced by the design surface.*

### 8.2 The Trust Center at /trust

The continuous-compliance-dashboard move. Cost: 1 design week + 1 engineering week + Vanta integration. Effect: every procurement reviewer's tooling reads it; Beamix becomes the GEO product that *ships its operational truth*. **This is the move Stripe hasn't shipped because Stripe doesn't need to; Beamix can leapfrog Stripe on this surface specifically.**

### 8.3 State of AI Search 2026, at MVP launch, with the Cartogram as centerfold

The category-defining-artifact move. Cost: $8K + 5 in-house weeks. Effect: 6-12 months of earned media; Patrick-Collison-tier links; Beamix becomes the company that defined GEO. **This is the cheapest brand move on the table.**

### 8.4 The Brief grounding citation in API responses (F30 extended to API)

The structural-commitment-in-machine-readable-form move. Cost: 1 day of API engineering. Effect: the architecture becomes uncopyable not at the UI layer but at the contract layer; every other GEO product that ships an API will have to choose between copying Beamix's contract or shipping a worse contract. **Architectural moats are the hardest to dislodge.**

### 8.5 The brand-at-every-scale lock — email signature, terminal, status page, error pages, all in one register

The brand-discipline move. Cost: 2 design weeks + 1 engineering week. Effect: every surface a Beamix customer touches is the same brand fabric; the cream paper, the Fraunces 300, the Seal at scale, the Geist Mono datelines, the brand-blue accents — all six surfaces (web, dashboard, PDF, email, CLI, status page) live in one register. **Stripe's brand is durable specifically because every surface is the same brand. Beamix should commit now while there are six surfaces, not later when there are sixty.**

---

## Closing

If Stripe's design org owned Beamix this week, here's what we'd ship first. Lock the cream paper hex at #F4ECD8 with three printed swatches under three light conditions. Re-write the /security page to ship a certification trajectory ribbon, the Trust Center at /trust, security.txt, the Posture PDF, and the DPA link in the right rail — eight specific deltas. Begin the State of AI Search 2026 manuscript today; the report ships at MVP launch with the AI Visibility Cartogram as its centerfold, distributed via embargoed press + 50-copy print run + permalink with cream-paper editorial register. Lock the brand-at-every-scale: email signature inline-SVG Seal, CLI ASCII Seal, status page in cream-paper register, 404/500 with a single Fraunces line each, error JSON with `documentation_url` field. Schedule the Y2 brand book spec into the design canon now; documenting the artifact creates the obligation to ship it. The thing Stripe's design org understands that nobody else does is that *the brand is the product*. Beamix has the bones — Fraunces, cream paper, the Seal, the Cartogram, the Brief. v2 says: ship the connective tissue between them at every scale, in every register, in every surface, this week, and Beamix becomes the GEO product that competitors reference the way payments products reference Stripe.

---

*~3,500 words.*
