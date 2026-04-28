# /security — Public Page Design v1
Date: 2026-04-28
Author: Senior Product Designer (security/trust surfaces)
Status: Implementation-ready. Reference DESIGN-SYSTEM-v1.md for tokens; BOARD-trust-safety.md for content.
Surface: `beamix.tech/security` (Next.js page in `apps/web/`, NOT Framer)
Voice canon: external surface — "Beamix," never agent names.
Register: Editorial Artifact (cream paper, Fraunces accents, calm density).

---

## 1. The page job + 6-second / 60-second / 6-minute test

Three readers will land on this URL. Each gets what they need at the right depth, and each leaves either reassured or with a precise reason to ask one more question. No reader should leave with a vague "feels weird."

**Reader 1 — Aria (the CTO buyer, 6-minute reader).** Marcus pasted the URL in Slack with the line "before we renew Scale." Aria has 6 minutes between Linear standups. He needs to know: is the data encrypted, where does it live, can he export and delete on demand, do they train on customer content, what's the kill switch when something goes wrong, and is the architecture serious or marketing fluff. **The page must answer all six in 6 minutes of scrolling — not by being short, but by being scannable.**

**Reader 2 — The procurement reviewer (60-second reader).** A vendor-security analyst at Marcus's German enterprise customer is checking 47 vendors today. They scan headings, look for the sub-processors table, scroll for "GDPR" and "DSAR," screenshot the sub-processors page, and close the tab. **The page must let them complete their review without ever opening Beamix's PDF.**

**Reader 3 — The AI engine (6-second crawler).** ChatGPT, Perplexity, and Claude crawl this page the same week it ships. When a future prospect asks "is Beamix secure?" or "where does Beamix store my data?", the engine cites this page. **The page must be structured for AI extraction: semantic HTML, schema.org markup, declarative facts in scannable lists, no marketing prose obscuring the facts.**

The 6-second test is not a TL;DR card. It is the page being so well-structured that even a 6-second skim reveals: cream paper, calm typography, a table of sections in a left rail, the date the page was last reviewed (Geist Mono), and a closing seal. The page *looks like a security disclosure document by an adult company* before anyone reads a word. That is the test Aria runs first, in his peripheral vision, before he decides whether to read.

---

## 2. Reading architecture

**Layout choice: Two-column with sticky left rail + single editorial scroll column.** Cream paper background full-bleed (`--color-paper-cream`). 1240px max-width centered. Left rail 280px (sticky, anchor links + "last reviewed" timestamp + version). Right column 720px reading width (the same column width as the Monthly Update PDF — visual rhyme). 240px outer gutter, 48px between columns.

**Cream paper hex audit note.** Cream paper hex pending re-lock per Ive's hex audit (2026-04-28) — print 3 swatches under 3 light conditions on 3 displays before MVP launch. Candidates: #F7F2E8 (current), #F4ECD8 (Stripe Press's actual cream), and one between.

**Why not Stripe's single-column scroll:** Stripe's `/security` is one long article. It works because Stripe's reader cohort is uniformly engineering — they read top-to-bottom. Aria does not. He scans for "GDPR" and "encryption" and the sub-processors. The procurement reviewer does the same. **A left rail with sticky section navigation cuts their time in half** and is the single most-cited usability move in `vercel.com/security` and `linear.app/security`.

**Why not tabs:** Tabs hide content. Procurement reviewers screenshot pages. Tabbed content does not screenshot. Reject.

**The left rail itself.** Cream paper background (matches body — no separate panel). 11 anchor links in `text-sm` Inter 400, 16px gap between, color `--color-ink-2`. Active section: `--color-brand-text` + a 2px hand-drawn `--color-brand` Trace underline (Rough.js, roughness 0.6, deterministic seed per section slug). At the bottom of the rail, separated by 48px: "Last reviewed: APR 27 2026" in `text-mono` `--color-ink-3`, version `v1.0` below in `text-mono` `--color-ink-4`, and a "Download as PDF" button (secondary, see Section 7). On scroll, the active section updates via IntersectionObserver. On mobile (375px) the rail collapses into a `<details>` accordion at the page top labeled "Jump to section" — never a hamburger; readers should see the structure.

**Sketch:**

```
┌──────────────────────────────────────────────────────────────────┐
│  cream paper #F7F2E8 (pending re-lock — see hex audit note §4)   │
│  ┌─────────────┐  ┌────────────────────────────────────────────┐ │
│  │ Beamix      │  │ HERO (96px from top)                       │ │
│  │             │  │ ── eyebrow: SECURITY · v1.0                │ │
│  │ — Storage   │  │ "How Beamix protects                       │ │
│  │ ─ Retention │  │  your data, in detail."                    │ │
│  │ — DSAR      │  │ Fraunces 300 italic 28px subhead           │ │
│  │ — Encryptn  │  │                                            │ │
│  │ — Audit     │  │ ── 6-stat ribbon (encryption · region · …) │ │
│  │ — No-train  │  │                                            │ │
│  │ — Calls     │  │                                            │ │
│  │ ─ Sub-proc  │  │ § 1 Storage and region        [content]    │ │
│  │ — Validate  │  │ § 2 Retention                  [content]   │ │
│  │ — Incidents │  │ ...                                        │ │
│  │ — Contact   │  │ § 11 Contact                              │ │
│  │             │  │                                            │ │
│  │ Last        │  │ ── closing seal + signature ──             │ │
│  │ reviewed    │  │                                            │ │
│  │ APR 27 2026 │  │                                            │ │
│  │ v1.0        │  │                                            │ │
│  │ [PDF]       │  │                                            │ │
│  └─────────────┘  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

Vertical rhythm: 72px between major sections; 48px between subsections; 24px component-to-component. (Same rhythm as the rest of the design system — never invented for this page.) The page is **deliberately calmer than `/scan`.** No animation on hero, no sparklines, no Rough.js other than the closing seal and the inline Traces beneath subsection headings. The cream paper does the editorial work. Calm density beats decoration here — Aria has to feel adult engineering, not a marketing site.

---

## 3. Hero section

The first 3 seconds when Aria opens the URL on his MacBook. He should know immediately: cream paper register (this is a serious artifact), calm typography (no marketing splash), date-stamped (this document is maintained), and one sentence telling him exactly what he's about to read.

**Layout (top to bottom, hero block):**

- Top-left, 48px from page top: Beamix wordmark (`Beamix` in 16px InterDisplay 500, `--color-ink`) + the cross/star sigil mark in `--color-brand`, 24px tall total.
- Top-right, same baseline: `text-xs` caps tracking 0.10em `--color-ink-3`, reading: `SECURITY · v1.0 · LAST REVIEWED APR 27 2026`. Three pieces, separated by middle-dot. **The date is the trust signal.** A document without a review date is theatre; with one, it's a maintained artifact.
- 96px gap, then the hero headline: **"How Beamix protects your data, in detail."** `text-h1` (48px InterDisplay 500, `cv11`, `--color-ink`), max-width 720px, line-height 56px. The phrase "in detail" is the load-bearing word — it tells Aria the page is not a marketing summary.
- 24px below, the subhead in Fraunces italic: *"This page is the technical posture our customers' CTOs read before approving Beamix as a vendor. If you find a gap, write to us."* `text-serif-lg` (28px Fraunces 300 italic, opsz 144, soft 100, `ss01`, `--color-ink-2`). Two-line max. **The subhead does two jobs**: it acknowledges the CTO reader directly (Aria thinks: "this was written for me"), and it invites correction (Aria thinks: "they take this seriously enough to publish a contact for it"). The "write to us" is hyperlinked (in `--color-brand-text`) to `mailto:security@beamix.tech` — pre-filled subject `Security disclosure / question`.
- 48px below the subhead: a 6-stat ribbon. Six fact-pills, single horizontal row at 1240px, 4 of 6 visible on tablet, 2-up stacked on mobile.

**The 6-stat ribbon** (single most important on-page element for the 60-second reader):

```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ AES-256    │ │ US-East    │ │ 7-day      │ │ 7-year     │ │ Never on   │ │ <72h       │
│ at rest    │ │ default    │ │ DSAR target│ │ audit log  │ │ training   │ │ breach     │
│ TLS 1.3    │ │ SCCs for EU│ │ 30-day SLA │ │ immutable  │ │ data       │ │ notification│
│ in transit │ │            │ │            │ │            │ │            │ │            │
└────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
```

Each pill: 184px wide, 96px tall, `--color-paper` (white) background (a register-shift island inside the cream — same move as the engine grid in `/scan` Frame 8: when we show *facts*, we shift to clinical white), `--radius-card` (12px), `--color-border` 1px outline. Inside: top line in `text-mono` 13px `--color-brand-text` (the spec, e.g. "AES-256"); below in `text-sm` Inter 400 `--color-ink-2` (the qualifier, e.g. "at rest TLS 1.3 in transit"). Tabular numerals throughout. **The white islands on cream are the page's visual signature** — they say: editorial wrapper, clinical content.

No motion in the hero. No count-up. No draw-in. The page is **already-arrived.** This is a security disclosure, not a product reveal. (`prefers-reduced-motion` users see the same page; there's nothing to suppress.)

---

## 4. Section-by-section spec

11 sections, in this order (this order is the readability architecture — the page front-loads the questions Aria asks first).

Each section uses the same component pattern:

- **Eyebrow** (`text-xs` caps tracking 0.10em `--color-ink-3`): the section number + label, e.g. `01 · STORAGE AND REGION`.
- **Heading** (`text-h2`, 32px InterDisplay 500, `cv11`, `--color-ink`): a declarative sentence, never a noun-phrase. *"Your data lives in US-East by default."* not *"Data Residency."*
- **Lede** (Fraunces 300 italic, `text-lg` 18px line-height 28px, `--color-ink-2`, max-width 540px): one sentence positioning the section. The lede is the only Fraunces inside section bodies — reserved for the editorial framing of each section. **Where Fraunces appears: hero subhead, 11 section ledes, signature line. Nowhere else.** Fifteen exact uses on the whole page.
- **Body** (Inter 400, `text-base` 15px line-height 24px, `--color-ink`): plain English. 2-4 paragraphs, max 320 words per section.
- **Inline Trace** below each heading: a 2px Rough.js underline beneath the heading text, `--color-brand` at 28% opacity, deterministic seed per section slug (so the page renders identically every load — no jitter on refresh). Reuses `motion/trace-fade` on first scroll-into-view, then static.
- **Spec block** (where applicable): a small white-paper-island callout with 1-3 facts in `text-mono`. Same white-on-cream register-shift as the hero stats.
- **Geist Mono** appears only on technical specifics (port numbers, retention durations, RPO/RTO, hash algorithms, region names).

---

### Section 01 · Storage and region

> *"Your data lives in US-East by default. EU customers can request EU residency at MVP-1.5; SCCs cover the gap."*

**Body.** All Beamix data — account profile, Truth File, scan results, agent action logs — is stored in Supabase Postgres in the AWS US-East-1 region. Daily encrypted backups go to Supabase's S3 archive (same region) with 7-year retention for the audit log, 2-year for cold-storage scan results, and 30 days for everything else. Beamix is not yet hosting data in the EU; for EU controllers we sign Standard Contractual Clauses (Module 2) and a Data Processing Agreement naming Beamix as processor. EU residency on a dedicated EU Supabase project ships at MVP-1.5.

**Spec block (white-paper-island):**

```
PRIMARY REGION    aws-us-east-1
BACKUP REGION     aws-us-east-1 (same-region S3, encrypted)
EU RESIDENCY      MVP-1.5 (EU project on aws-eu-west-1)
TRANSFER MECH.    SCCs Module 2 + signed DPA
```

This block is `text-mono` 13px, two-column (label `--color-ink-3`, value `--color-ink`), 24px padding, `--color-paper` background, `--radius-card`. Same component as the hero ribbon pills, scaled larger.

---

### Section 02 · Retention

> *"We delete what you delete. Audit logs we keep — by design, with a hash, not your raw record."*

**Body.** During an active subscription, Beamix retains: account profile (lifetime), Truth File and Brief (lifetime), scan results (90 days hot, 2 years cold), Twilio call metadata (2 years), UTM clicks (2 years). On cancellation, a 30-day grace period preserves access (read-only after billing date), then a 30-day data-export window opens, then hard delete completes within 30 days of the deletion request — total max 90 days from cancel-click to scrubbed disk. The audit log is the single exception: 7-year retention with hashed customer-id pointers (no raw identifying data after delete) for compliance and incident investigation. Disclosed in the DPA.

**Spec block** lists each artifact with its retention in `text-mono`. Same format as the storage block.

---

### Section 03 · GDPR / DSAR

> *"GDPR Articles 15, 17, 20, and 33 are wired to endpoints, not promises."*

This is the single most-demanded section by procurement reviewers. **It must be screenshot-able as one tile.** A 4-row table follows, full-width inside the reading column.

| Article | Right | How Beamix handles it | Target | SLA |
|---|---|---|---|---|
| 15 | Access | `/settings → Privacy → Export my data` runs an Inngest job that assembles a JSON bundle (profile, TF, scans, agent actions, /inbox items, audit log last 12 months). Delivered as signed S3 URL valid 7 days. | 7 days | 30 days (GDPR Article 12) |
| 17 | Erasure | `/settings → Privacy → Delete my account` initiates the cancel cascade. Hard delete completes within 30 days of request. Audit log retains hashed pointers under legitimate-interest carve-out (disclosed in DPA). | 30 days | 30 days |
| 20 | Portability | Export format is JSON. Truth File exports as JSON Schema-conformant — anti-lock-in by design. Customer can import into any future system. | 7 days | 30 days |
| 33 | Breach notification | Personal data breach → affected customers notified within 72h of confirmation. Template lives in incident runbook; on-call engineer triggers it. Public incident page on `beamix.tech/incidents/[YYYY-MM-DD]-[slug]`. | <72h | 72h (legal ceiling) |

Table rows alternate cream and `--color-paper-elev` (cream tint, 3% darker) for readability. Headers in `text-xs` caps `--color-ink-3`. Body cells `text-base`. Hyperlinks (`/settings → Privacy → Export my data`) styled in `--color-brand-text` with hover-underline.

---

### Section 04 · Encryption

> *"AES-256 at rest. TLS 1.3 in transit. No exceptions."*

**Body.** Every byte stored in Supabase Postgres or S3 is encrypted at rest with AES-256, key-managed by Supabase and AWS KMS. Every byte in transit between client, Beamix services, and third-party APIs (Anthropic, OpenAI, Google, Perplexity, Twilio, Paddle, Resend) goes over TLS 1.3 — TLS 1.2 is supported as a fallback only, never as default. Internal service-to-service traffic inside Supabase's VPC is TLS-encrypted. We do not run our own key management; we rely on Supabase + AWS KMS, both of which are SOC 2 Type II audited.

**Spec block** lists ciphers and key-management providers in `text-mono`.

---

### Section 05 · Audit logs

> *"Every Truth File read, write, and validate-against is appended to a log we cannot edit."*

**Body.** Beamix's audit log is append-only Postgres, partitioned monthly, replicated hourly to AWS S3 with Object Lock (compliance mode, 7-year retention). The application database role has no UPDATE or DELETE privilege on the audit table — only INSERT. Admin access requires MFA + break-glass workflow with dual-engineer sign-off; every break-glass open is itself logged. Customers can export their own audit log via the DSAR endpoint (Article 15). The log is the single source of truth for "what did Beamix do on my behalf, and when" — surfaceable on demand if a customer ever questions a published action.

**Spec block:**

```
RETENTION         7 years (immutable)
STORAGE           Postgres (1y hot) + S3 Object Lock (7y)
HASH ALGO         SHA-256 (values_hash; raw values never logged)
ADMIN ACCESS      MFA + dual-eng break-glass; every open audited
CUSTOMER EXPORT   DSAR Article 15
```

---

### Section 06 · We do not train on your content

> *"Your Truth File, your scans, your published content — none of it trains a general model. This is a contract."*

**Body.** Beamix processes customer content only for the customer's own service. We do not feed Truth Files, customer-published content, scan results, or Brief contents into any general LLM training pipeline. The DPA contains an explicit clause: *"Beamix shall not use Customer Content to train, fine-tune, or otherwise improve any general-purpose machine-learning model."* Our LLM sub-processors (Anthropic, OpenAI, Google, Perplexity) operate under their respective enterprise APIs with zero-data-retention or no-training contracts in place — listed in Section 8. **If we ever change this posture, the DPA requires advance written notice and your right to terminate without penalty.**

This section is the single most important sentence on the page for the founder-CEO reader (Marcus). Format: lede in Fraunces italic, body in 3 short paragraphs, the contractual clause **rendered as a quoted block** (Fraunces 300, 22px, indented 32px left, with a 2px `--color-ink-3` left rule — same treatment as the diagnosis quote in /scan Frame 9 for visual rhyme).

---

### Section 07 · Twilio call recordings

> *"At MVP we don't store call recordings. Only metadata. This is a deliberate privacy choice, not a missing feature."*

**Body.** When Beamix issues a forwarded phone number, calls flow through Twilio to the customer's real line. Beamix stores **metadata only**: caller number, duration, timestamp, source query (when known). Recordings stay in Twilio for 30 days (their default retention) then delete. Beamix does not pull, transcribe, or persist call audio at MVP. Two-party-consent compliance (CA, FL, IL, others): the customer is the call recipient, the Twilio number behaves identically to their existing line, and any disclosure obligation belongs to the customer's existing call-handling posture. Documented in our Terms of Service.

If MVP-1.5 adds transcription for lead-quality scoring, it will be **opt-in per customer**, with regional consent rules respected, beep-tone disclosure where required, transcript-only retention (no audio), and customer-side consent burden documented. **Not at MVP. We don't sleepwalk into biometric data.**

---

### Section 08 · Sub-processors

The procurement reviewer's destination. See Section 5 of this spec for the full table format.

---

### Section 09 · Pre-publication validation

> *"Before any agent publishes a word on your behalf, it has to prove the claim, match your voice, and pass a cryptographic check. The SDK cannot publish without all three."*

**The 100-word engineer-readable explanation** (this is the section Aria reads twice):

> *Every agent output passes through a server-side validator before it can publish. The validator runs five rules: claim verification against your Truth File, brand voice match (cosine ≥ 0.85), prohibited-term scan, vertical-specific rules, and a sensitive-topic classifier. On success the validator returns a signed token (HMAC-SHA-256, 60-second TTL, bound to the SHA-256 hash of the draft). The publishing endpoint requires (a) a valid signature, (b) a fresh TTL, and (c) a hash match. A cached token from a prior validate fails on hash mismatch. There is no `publish()` API that bypasses this. The signed token is the cryptographic primitive that makes "the SDK cannot publish" mechanically true, not aspirational.*

**Body** (additional context, in regular Inter): the 5 validation rules listed with one sentence each. Network egress is sandboxed — agents have no direct internet, only `ctx.fetch` (allowlist) and `ctx.llm` (proxied). Static analysis at deploy fails the build on any SDK-bypass code. Runtime telemetry asserts every published action has a corresponding validate-span within the prior 60 seconds; missing → action quarantined.

**Spec block** lists the cryptographic primitive's exact specification:

```
SIGNATURE      HMAC-SHA-256
TTL            60 seconds
BINDING        sha256(draft_payload)
ALGO ROTATION  quarterly key rotation, dual-key window
ENFORCEMENT    publish endpoint + runtime telemetry tripwire
```

This is the section Aria forwards to Marcus with the line "this is the right answer." It exists for him.

---

### Section 10 · Incident response and Truth File integrity

> *"Detection ≤ 24 hours. Containment ≤ 1 hour. Comms ≤ 4 hours. We've rehearsed it."*

**Body.** Beamix has a written incident runbook with severity classes (Sev-1 = single-customer data integrity breach; Sev-2 = >50 customers, no data loss; Sev-3 = isolated bug). For Sev-1, the customer receives a **phone call within 2 hours** — yes, a phone call. We take that seriously because Replit's lag in customer comms after their 2024 incident turned a contained technical event into trust collapse; we rehearse the comms protocol in pre-launch dress.

A nightly Truth File integrity job hashes every TF and compares to the previous day's hash. **>50% field loss in 24h triggers a Sev-1 alert** — this closes the detection gap that would otherwise let TF corruption run for 6-7 days. Every published agent action carries a revert payload; bulk rollback is a tested admin operation.

**Spec block (timeline):**

```
DETECTION         ≤ 24 hours (TF integrity tripwire + Search Console signal + customer report)
CONTAINMENT       ≤ 1 hour (kill switch + customer_active runtime check)
RESTORATION       ≤ 2 hours (Postgres PITR + per-action rollback)
COMMS — Sev-1     ≤ 2 hours (phone call to customer)
COMMS — Sev-2     ≤ 4 hours (signed CEO email + public incident page)
POST-MORTEM       ≤ 14 days (Sev-1) / 7 days (Sev-2)
```

A small text link below the spec: `View public incident log →` pointing to `beamix.tech/incidents` (which lists post-mortems chronologically; empty at launch is honest, not damning).

---

### Section 11 · Contact

The closing section. See Section 6 of this spec.

---

### Closing

After Section 11, with 96px gap: a centered hand-drawn Beamix seal (Rough.js, `--color-brand` 2px stroke, 32×32, deterministic seed) followed 24px below by the signature line in Fraunces 300 italic 28px: *"— Beamix"*. Below the signature, 16px gap, in `text-mono` `--color-ink-3` centered: `Generated APR 27 2026. Reviewed quarterly. Last review: APR 27 2026.` Below that, 8px gap, the page's permalink: `beamix.tech/security` in `text-mono` `--color-ink-4`.

This closing seal is the **only Rough.js illustration on the entire page** other than the inline Traces beneath section headings. The visual restraint is the design — `/scan` and the Monthly Update use Rough.js liberally because they are reveal artifacts; this page is a disclosure document. **Every reduction is a deliberate trust signal.**

---

## 5. Sub-processors table

The single artifact a procurement reviewer screenshots and pastes into their internal vendor-review ticket. It must be **complete, dated, and unambiguous**.

**Layout.** Full-width inside the 720px reading column. White-paper-island background (`--color-paper` on cream — same register-shift as the hero stats and spec blocks). Rounded `--radius-card` 12px. 1px `--color-border` outline. Internal padding 24px.

**Columns** (5 total):

| Vendor | Service | Data category | Region | Contract / link |
|---|---|---|---|---|

Column widths: 18% / 30% / 24% / 12% / 16%.

**Row format.** Each row 56px tall. Vendor name in `text-base` Inter 500 `--color-ink`. Service description in `text-sm` Inter 400 `--color-ink-2`. Data category in `text-sm` Inter 400 — but in `text-mono` if it's a structured category (`PII / billing-only` or `LLM-prompts (zero retention)`). Region in `text-mono` 13px `--color-ink` (e.g. `US-East`, `Global CDN`, `EU + US`). Contract column: a small `View DPA →` text link in `--color-brand-text` 13px Inter 400.

Rows alternate cream and `--color-paper-elev` (3% darker cream). Hairline `--color-border` between rows.

**Sample rows (full list at MVP):**

| Vendor | Service | Data category | Region | Contract / link |
|---|---|---|---|---|
| Supabase | Database, auth, storage | All customer data | US-East | View DPA → |
| Anthropic | LLM (Claude) for agents | Prompts only, zero retention | US | View terms → |
| OpenAI | LLM (GPT-4) for scan engine | Prompts only, zero retention | US | View terms → |
| Google | Gemini API + AI Overviews | Prompts only, zero retention | US | View terms → |
| Perplexity | Citation retrieval | Prompts only, zero retention | US | View terms → |
| Twilio | Phone-number forwarding, metadata | Call metadata only (no recordings) | US | View DPA → |
| Paddle | Billing, card data | Billing data (Paddle is controller) | EU + US | View DPA → |
| Resend | Transactional email | Email addresses + content | US + EU | View DPA → |
| Inngest | Background job orchestration | Job payloads (encrypted, ephemeral) | US | View DPA → |
| Vercel | Hosting + edge | App + static assets, no customer data | Global edge | View DPA → |

Above the table, a one-line note in `text-sm` `--color-ink-3`: *"Last updated APR 27 2026. We notify customers in advance of new sub-processors via email; you may object within 30 days."* Below the table, two text-link actions in `text-sm`: `Download CSV ↓` and `Subscribe to sub-processor changes →` (the second opens an email-capture inline; useful for procurement teams).

The table is **the page's most-screenshot-able element.** A reviewer should be able to drag a screenshot and have all the columns visible at standard MacBook resolution. The white island on cream gives the screenshot a clean rectangular boundary.

**Quarterly drift mitigation (2026-04-28 — Rams' single-page audit risk):**

The /security page's trust value depends on the LAST REVIEWED stamp being true. Operational requirement: 90-day calendar reminder + named owner for quarterly walk-through of sub-processors, encryption posture, retention policy. Last-reviewed date enforced by deploy via `frontmatter.json`. If page sits unrevised for 9 months while sub-processors change, the date becomes a lie and the page actively destroys trust.

---

## 6. CTA — "Talk to security"

The classic security-page mistake is no CTA: the page reads like a static legal disclosure with no human at the end. Aria — and especially the procurement reviewer — needs **one obvious place to ask one more question**. But the CTA must not feel like sales. It is the security team's contact line, period.

**Visual treatment.** Section 11 of the page (the closing section before the seal). White-paper-island full-width inside the 720px reading column, 96px tall. Inside, three lines:

1. Eyebrow: `WRITE TO US` in `text-xs` caps 0.10em `--color-ink-3`.
2. Email address as the focal element: `security@beamix.tech` in `text-h3` (22px InterDisplay 500 `--color-ink`) — copyable on click (clipboard API + 600ms toast: "Copied").
3. Below in `text-sm` Inter 400 `--color-ink-2`: *"For security disclosures, vendor-review questions, and sub-processor change subscriptions. Average response: same business day. PGP key on request."*
4. Right-aligned: a primary action button. Pill shape (`--radius-pill`, the only pill on the page — restraint), 44px tall, `--color-brand` background, white text 14px Inter 500. Label: `Compose email`. On click: opens `mailto:security@beamix.tech?subject=Security%20question%20re%20Beamix` with a small body template. **Clicking does NOT open a form modal** — it opens the user's actual mail client. Procurement reviewers prefer mail; their tooling logs sent emails to vendor tickets automatically.

**Email handling on the receiving end (operational, not visual):** `security@beamix.tech` is monitored by the on-call engineer with a 4-business-hour SLA for first response. Auto-reply confirms receipt with a ticket reference. Vulnerability disclosures (subject contains "vuln" or "CVE") are routed to a separate channel with 60-minute pager response. PGP key is published at `beamix.tech/security/pgp.asc` (referenced in the email auto-reply, not on the page itself — keeps the page calm).

**Why an email and not a form:** a form is a customer-support pattern. Security disclosure is a peer-to-peer engineering communication. Aria emails. The procurement reviewer emails. Forms get dropped into Zendesk and lost; emails go to a watched mailbox. This single design choice signals "we have a real security inbox, not a customer-support queue."

---

## 7. Downloadable PDF version

Aria reads the web page on his MacBook, then forwards the PDF to his cofounder Liam in Slack. Or the procurement reviewer attaches the PDF to a vendor-review ticket. **The PDF is not a brochure — it is the same content, in cream-paper editorial PDF register, sized for printing on Letter or A4.**

**Composition spec** (references EDITORIAL-surfaces-design-v1.md §3.3 for cream-paper architecture, and reuses the React-PDF infrastructure built for the Monthly Update):

- 6 pages (the same number as the Monthly Update — coincidentally fitting; not a forced symmetry).
- Cream paper background `#F7F2E8` on every page. Margins: 1.25 inches print, 96px web-equivalent.
- **Page 1 (cover):** Beamix wordmark + sigil top-left. `SECURITY POSTURE · v1.0 · APRIL 2026` top-right in Geist Mono. Vertical center: title in 64px Fraunces 300 — *"How Beamix protects your data"*. 32px below: subtitle in 28px Fraunces italic 300 — *"A document for the CTOs of our customers."* Bottom of page: closing seal preview (24px) + `1 / 6`.
- **Page 2:** Sections 01 (Storage), 02 (Retention), 03 (DSAR table). The DSAR table is the page's single most-copied element; it must fit on one page.
- **Page 3:** Sections 04 (Encryption), 05 (Audit logs), 06 (No-training clause). The contractual no-training quote is rendered as a Fraunces-italic block-quote with a 2px left rule — same treatment as on web.
- **Page 4:** Sections 07 (Twilio), 08 (Sub-processors table). The sub-processors table is the largest single element on the page; it gets two-thirds of Page 4.
- **Page 5:** Sections 09 (Pre-publication validation, with the 100-word cryptographic primitive paragraph), 10 (Incident response). The 100-word paragraph is set in **18px Fraunces 300, indented 32px left, with a 2px `--color-brand` left rule** — to mark it as the central technical claim.
- **Page 6 (closing):** Section 11 (Contact), closing seal (32×32, twice the cover seal — broadsheet tradition), Fraunces signature *"— Beamix"*, generated date in Geist Mono, permalink `beamix.tech/security`. Page footer `6 / 6`.

**Generation pipeline.** Same React-PDF (`@react-pdf/renderer`) approach as the Monthly Update. Component tree: `<SecurityPosture mode="pdf" />` and `<SecurityPosture mode="web" />` — shared content, different layout primitives. Fonts (Inter, InterDisplay, Fraunces variable-axis, Geist Mono) registered via `Font.register()`. Rough.js seal pre-rendered to SVG server-side via Node + JSDOM + Rough.js with deterministic seed.

**Trigger.** PDF is generated on every page deploy (so it always matches the live page) and cached in Supabase Storage at `security/v1.0/beamix-security-posture-2026-04.pdf`. The "Download PDF" button in the left rail and at the page footer points to this cached URL. Filename includes the version + date so the reviewer's downloads folder shows lineage.

---

## 8. Mobile (375px) treatment

**Aria on the train** is the test. He pulls up the URL on his iPhone, reads on a 7-minute Tube ride. Mobile must work as a primary surface, not a fallback.

**Layout adaptations:**

- **Hero.** Wordmark + sigil top-left; the version stamp drops below the wordmark (no longer top-right) in `text-xs`. Hero headline drops from `text-h1` 48px to `text-h2` 32px, max-width 90vw. Subhead in Fraunces stays 22px (drops one step from 28px) — Fraunces is what makes the page feel premium on mobile; do not abandon it.
- **6-stat ribbon.** Stacks 2-up at 375px (3 rows × 2 columns). Each pill 168px wide, 88px tall. Cream background between pills; pills stay white.
- **Left rail.** Collapses into a `<details>` accordion at the top of the page, label `Jump to section ↓` in `text-sm` `--color-ink-2` with a chevron. Open state shows the 11-link list with 16px tap targets (44px tall each — meets accessibility minimum). The "Last reviewed APR 27 2026 · v1.0" timestamp moves to the page footer on mobile.
- **Section bodies.** Same Fraunces lede + Inter body, max-width 100% (page padding 24px each side). Reading column is 327px effective — comfortable for the 15px Inter base size.
- **DSAR table (Section 03).** Re-flows from a 4-column table to a stack of 4 cards, one per Article. Each card 80px tall, 24px padding, white-paper-island, rounded `--radius-card`. Article number + right name in `text-h3` (22px), how-handled body below in `text-sm`, target+SLA chip at the bottom right in `text-mono`.
- **Sub-processors table (Section 08).** Same pattern — re-flows to vertical cards, one per vendor. Each card 88px tall: vendor name top-left in `text-base` Inter 500, region top-right in `text-mono`, service description below in `text-sm`, "View DPA →" link bottom-right in `text-sm` `--color-brand-text`.
- **Spec blocks.** Stay rectangular but full-width. Geist Mono drops one step (13px → 11px) only if a value is too long to fit — most stay 13px.
- **CTA section.** Email address stays focal; the `Compose email` button drops below it (stacked, full-width within the white island, 44px tall). The whole island stays under 200px tall.
- **Closing seal + signature.** Same. Both stay centered. The seal stays 32×32 — never shrinks; the closing mark is the closing mark.

**Performance.** No carousel, no swipe-able sections, no horizontal scroll anywhere. Reading-speed test on a 4G connection at the airport: the page should render-complete in <800ms. Static HTML, Inter + InterDisplay + Fraunces + Geist Mono served via `next/font` with `display: swap`. Total page weight ≤120KB (target).

---

## 9. Accessibility + SEO / AI-citability spec

### 9.1 WCAG 2.2 AA compliance

- **Skip-to-content link.** First focusable element on every page; visually hidden until focus, then renders pinned top-left, `--color-brand` background, white text. Target: `#main-content`.
- **Semantic HTML.** `<main>`, `<nav aria-label="Section navigation">` for the left rail, `<section>` per content section with `<h2>` heading inside, `<aside>` for spec-blocks, `<table>` (real `<table>`, not div soup) for DSAR + sub-processors, `<footer>` for closing seal block.
- **Heading hierarchy.** Strict: page `<h1>` is the hero headline. Each of 11 sections is `<h2>`. Sub-headings (rare) are `<h3>`. No skips.
- **Color contrast.** All text passes 4.5:1 against `--color-paper-cream` (verified: `--color-ink` #0A0A0A on `#F7F2E8` = 18.7:1; `--color-ink-3` #6B7280 on cream = 4.62:1, just clears AA; never use `--color-ink-4` on cream for body text).
- **Focus rings.** Use `--shadow-focus` (`0 0 0 3px rgba(51,112,255,0.25)`) on every interactive element. Never `outline: none` without replacement.
- **Keyboard navigation.** Left rail anchor links operate via Tab + Enter. The mobile accordion opens via Enter or Space. The "Compose email" button is a real `<a href="mailto:...">`, not a `<button>` with a JavaScript click handler.
- **Screen reader.** ARIA landmarks (`role="navigation"`, `role="main"`, `role="complementary"` for spec blocks). Each Trace SVG underline has `aria-hidden="true"` (decorative). Each Geist Mono spec value has its label as the immediately preceding `<dt>` so screen readers read "Primary Region: aws-us-east-1" not "aws-us-east-1" alone.
- **Reduced motion.** `@media (prefers-reduced-motion: reduce)` suppresses Trace fade-ins on scroll-into-view; Traces appear static at full opacity. The seal's optional draw-on-load animation is suppressed.
- **Zoom.** Layout reflows correctly at 200% zoom and at 320px viewport width.

### 9.2 SEO + AI-citability

This page **must be cited** when a prospect asks Claude / Perplexity / ChatGPT "is Beamix secure?" or "where does Beamix store data?". Engineering for that is structural, not stylistic.

- **Meta tags.** `<title>Security at Beamix · How we protect your data</title>` (60 chars). `<meta name="description" content="Beamix's full security posture: encryption, GDPR/DSAR, sub-processors, no-training-on-customer-content, audit logs, and incident response. Reviewed quarterly.">` (160 chars).
- **Canonical.** `<link rel="canonical" href="https://beamix.tech/security">`.
- **Open Graph + Twitter card.** `og:title` matches `<title>`. `og:description` matches meta description. `og:image` = a custom 1200×630 OG image rendered server-side: cream paper, Beamix wordmark + sigil, the headline *"How Beamix protects your data"* in 64px Fraunces, a closing seal bottom-right. Same React-PDF/Vercel-OG component as the rest of the brand.
- **Schema.org markup** (JSON-LD in page `<head>`):
  - `WebPage` with `@type: WebPage`, `name`, `description`, `dateModified` (the last-reviewed date — auto-bumped on deploy).
  - `Organization` for Beamix with `name`, `url`, `contactPoint` for `security@beamix.tech` (`@type: ContactPoint`, `contactType: "Security"`, `email`, `availableLanguage: ["English"]`).
  - `FAQPage` containing the 11 sections as `Question` / `Answer` pairs — this is the load-bearing piece for AI citation. Each section's eyebrow becomes the question (e.g., *"How does Beamix handle GDPR data subject access requests?"*); the section's lede + first paragraph become the answer text.
- **Structured headings + lists.** Every section starts with a declarative heading. Every spec block is a real `<dl>` (description list) with `<dt>` labels and `<dd>` values — AI extractors read this as structured key-value pairs.
- **Sitemap inclusion.** `/security` listed in `sitemap.xml` with `<priority>0.8</priority>` (high; this is a critical landing page).
- **Internal links.** Linked from the marketing site footer (Framer), from the product app footer (`apps/web/`), from `/legal/dpa`, from `/legal/privacy`. **Do not link from the homepage hero** — keep marketing focus on the product, but ensure the page is one click from any footer.
- **AI extraction friendliness.** Every fact is in a single sentence with the subject leading. *"Beamix encrypts data at rest with AES-256."* — not *"Industry-leading encryption ensures..."* Marketing prose obscures fact extraction; declarative sentences enable it.

---

## 10. Implementation notes

**Stack.**
- Next.js 16 App Router page at `apps/web/app/security/page.tsx` (Server Component for SSR + perfect SEO).
- Tailwind for layout; design tokens from DESIGN-SYSTEM-v1.md exposed as CSS custom properties + Tailwind theme extensions.
- Rough.js (SSR-safe) for the closing seal and the inline section-heading Traces. Pre-render to static SVG on build (deterministic seeds → no client-side JS needed for these elements). This means **the page renders zero client JS for its visual brand work** — a trust signal in itself.
- React-PDF (`@react-pdf/renderer`) for the downloadable PDF, sharing components with the web version via a `mode` prop.
- `next/font/google` for Inter, Fraunces (variable axes), Geist Mono. InterDisplay loaded via `next/font/local` (same as rest of app).
- `next-mdx-remote` for the section bodies — content lives in `.mdx` so legal/T&S can edit prose without touching JSX. Each section is one MDX file in `apps/web/content/security/01-storage.mdx` … `11-contact.mdx`.

**File structure.**

```
apps/web/
├── app/
│   └── security/
│       ├── page.tsx
│       ├── opengraph-image.tsx        # OG image renderer (Vercel OG)
│       ├── components/
│       │   ├── Hero.tsx
│       │   ├── StatsRibbon.tsx
│       │   ├── LeftRail.tsx
│       │   ├── Section.tsx
│       │   ├── SpecBlock.tsx
│       │   ├── SubProcessorsTable.tsx
│       │   ├── DSARTable.tsx
│       │   ├── ContactBlock.tsx
│       │   └── ClosingSeal.tsx        # Rough.js seal, SSR-rendered
│       └── pdf/
│           └── SecurityPosturePDF.tsx # React-PDF version
├── content/security/
│   ├── 01-storage.mdx
│   ├── 02-retention.mdx
│   ├── ... (one per section)
│   └── frontmatter.json               # last-reviewed date, version
└── public/security/
    └── beamix-security-posture-2026-04.pdf  # cached PDF artifact
```

**Component-token mapping (cite for engineering):** hero headline → `text-h1` + `font-display`. Section headings → `text-h2`. Lede → `text-serif-lg italic`. Body → `text-base`. Spec block label → `text-mono text-color-ink-3`. Spec block value → `text-mono text-color-ink`. Eyebrow → `text-xs uppercase tracking-[0.10em]`. Card → `bg-paper border border-color-border rounded-[var(--radius-card)] p-6`. Section gap → 72px. Subsection gap → 48px. White-paper-island shadow → none (just border, never `--shadow-md` — the island is at the surface plane, not elevated).

**Motion.** Hero has zero motion. Trace fades use `motion/trace-fade` (300ms linear, on first viewport entry per session — see DESIGN-SYSTEM-v1.md §3.1). Closing seal uses `motion/seal-draw` only the first time it scrolls into view, otherwise static. No other motion. The page's calm is the design.

**Quarterly review process.** A calendar reminder fires every 90 days for the security lead to walk the page top-to-bottom, verify every fact, update the `last-reviewed` date in `frontmatter.json`, regenerate the PDF, and merge. Process documented in `docs/runbooks/security-page-quarterly-review.md` (separate document; not in scope here).

---

## Reference exemplars analyzed

**stripe.com/security** — single-column scroll, very long, very text-heavy. The move I took: the conversational opening sentence (Stripe's hero is *"Stripe's infrastructure for storing, decrypting, and transmitting card numbers runs in separate hosting infrastructure..."* — a fact, not a slogan). The move I rejected: Stripe's lack of a section nav. At Stripe's audience (universally engineering), a single column works; for Aria + procurement reviewers + AI crawlers, a left rail wins. Stripe also uses no visible date — I add the quarterly review date prominently.

**vercel.com/security** — left rail of sticky sections, white-on-white, dense paragraphs. The move I took: the sticky left rail navigation pattern, exactly. The move I rejected: Vercel's clinical white-on-white register; for Beamix the cream paper does emotional work that white cannot. Vercel also leans heavily on logo grids (SOC 2, ISO 27001 badges); Beamix at MVP has none of those certifications, so the page is honest about being pre-certification (`SOC 2 Type II target Year 1 Q4` is disclosed in the audit-logs section, not hidden).

**linear.app/security (and /trust)** — a single very long page, with sections, calm density, no visual noise. The move I took: the calm density. Linear proves a security page can be long without feeling exhausting if the typography is right. The move I rejected: Linear's heavy use of marketing prose around facts; Beamix front-loads facts in declarative sentences, then uses Fraunces only on the section ledes for editorial framing. Beamix's page is more procurement-friendly as a result.

**anthropic.com/trust** — calmest of all four exemplars; deeply sectioned; uses table-of-contents heavily; honest about scope ("we do this; we don't do that"). The move I took: the **honest scoping language** — Beamix's page acknowledges what's at MVP vs. MVP-1.5 vs. Year 1 (EU residency, SOC 2, transcription). Hiding scope reads as evasive; disclosing it reads as adult. The move I rejected: Anthropic's full-bleed dark hero; Beamix's cream paper carries the brand, and a dark hero would break the editorial register that the rest of the page lives in.

---

*~3,950 words. Ready for build.*
