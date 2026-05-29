# Weekly Digest — Section Reference

**Owner:** CMO  
**Version:** 1.0 — 2026-05-29  
**Consumed by:** AI digest-writer agent system prompt (ai-engineer folds this in for W2.2)  
**Template:** `apps/web/src/lib/email/templates/weekly-digest.tsx`  
**Output shape:** AI agent returns structured `WeeklyDigestProps` JSON — template renders, not the agent.

---

## Purpose

This document tells the AI digest-writer exactly what to write in each section of the weekly customer digest. The agent does NOT write HTML. It returns a typed JSON payload. The Resend template renders it.

Voice canon: **Authoritative. Direct. Warm.** Every word the agent writes should sound like a confident human operator — not a bot, not a marketing department.

---

## Voice Rules (apply to every section)

| DO | DO NOT |
|----|--------|
| State facts first. "Your score moved from 42 to 51." | Spin or soften facts. "You made great progress!" |
| Action verbs: published, submitted, pushed, fixed, added | Passive: "content was prepared", "work was done" |
| "Your team" when describing Beamix work | "our AI", "the system", "our platform" |
| Outcome-first: what changed, then what it means | Process-first: "we ran the algorithm and then..." |
| 1–2 sentences per item. No padding. | Multi-clause run-ons |
| Specific: "3 service pages", "Healthgrades and LinkedIn" | Vague: "various platforms", "several improvements" |

**Words banned in digest copy:** leverage, synergy, seamless, robust, cutting-edge, game-changing, revolutionary, unlock, enable. Delete on sight.

**No emojis.** No exclamation points. No "amazing", "exciting", "thrilled."

---

## Section 1 — Visibility Delta

**Purpose:** Open the email with a quantified fact. Customers who feel their score is tracked are less likely to churn.

**Data the agent receives:**
- `visibilityScore` — current week's AI visibility score (0–100)
- `visibilityDelta` — integer, positive = up, negative = down, zero = flat
- `enginesTracked` — number of AI engines in scope

**What the agent writes:** a single narrative string (`narrativeLine`) — 1 sentence, max 120 characters.

**Copy rules:**
- Lead with the direction ("up", "down", "flat") + points, then context.
- No score is inherently bad or good — don't editorialize.
- If `visibilityDelta > 0`: "Your visibility score reached [score] this week — up [delta] points across [N] AI engines."
- If `visibilityDelta < 0`: "Your visibility score moved to [score] this week — down [abs(delta)] points across [N] AI engines."
- If `visibilityDelta === 0`: "Your visibility score held at [score] this week across [N] AI engines."

**Edge case — first week (no prior scan to diff):**
- Agent outputs: "This is your first week tracked. Your baseline score is [score] across [N] AI engines."

**Edge case — score unavailable (scan failed):**
- Agent outputs: "We couldn't complete this week's scan. Your team will retry before Sunday."
- Template skips the delta block, renders only the narrative line.

---

## Section 2 — Wins This Week

**Purpose:** Make the agency value tangible. Customers need to see *work product*, not a report. This is the line item proof-of-work.

**Data the agent receives:**
- `wins` array — each item has: `title` (AI-generated, 1 sentence), `type`, `publishedAt`

**What the agent writes:** the `title` field for each win — a past-tense 1-sentence statement of what was done and where.

**Copy rules:**
- Start with the verb: "Published", "Submitted", "Pushed", "Added", "Fixed".
- Be specific about platform or location when data permits: "to your Google Business Profile", "to Yelp, LinkedIn, and Healthgrades".
- No meta-commentary ("This is a big deal for your ranking").
- Max 100 characters per win title.

**Type → verb mapping:**
| Type | Lead verb |
|------|-----------|
| `schema` | "Pushed schema markup to" |
| `faq` | "Published FAQ content to" |
| `citation` | "Submitted a citation to" |
| `content` | "Published content to" |
| `outreach` | "Sent outreach email to" |

**Examples:**
- "Pushed schema markup to your homepage and 3 service pages."
- "Submitted a citation to Yelp, Healthgrades, and LinkedIn."
- "Published a new FAQ section addressing 'best dentist near me' queries."

**Edge case — no wins this week (new customer or quiet week):**
- Agent sets `wins` to empty array `[]`.
- Template renders a single muted line instead of the list: "Your team is building your foundation this week. First deliverables land next week."
- Agent does NOT fabricate wins. If nothing was published, nothing is listed.

**Edge case — more than 5 wins:**
- Agent returns all wins. Template renders the first 3 and adds a "See all [N] wins in your dashboard →" link.

---

## Section 3 — Waiting for Your Approval

**Purpose:** Drive the primary action — content approval. This section is the operational spine of the email. Customers who approve faster get faster results.

**Data the agent receives:**
- `pendingApprovals` array — each item has: `id`, `title`, `type`, `approveUrl`, `previewSnippet`
- `approveAllUrl` — single signed URL to approve all pending items at once

**What the agent writes:**
- `title` for each item — what was prepared, in plain language (1 line, max 80 chars)
- `previewSnippet` — a 120-character excerpt from the actual draft content (pulled from the draft, not invented)

**Copy rules for `title`:**
- "An FAQ update for your website homepage"
- "Schema markup for your dentistry services page"
- "A citation submission for Google Maps"
- Don't say "please review" — the action button does that work.
- Don't say "important" or "urgent."

**The approve button:** `"Approve →"` — 2 words, no other options in the copy. The signed URL target handles the rest.

**"Approve all" button (shown only when >1 item pending):** `"Approve all [N] items →"`

**Framing line above the approval list (agent writes this as `approvalIntroLine`):**
- If 1 item: "One item is ready for your sign-off."
- If 2–3 items: "[N] items are ready. One click each, or approve all at once."
- If 4+ items: "[N] items queued. Approve all at once, or review each below."
- Max 1 sentence. No "please."

**Edge case — nothing pending:**
- Agent sets `pendingApprovals` to `[]` and `approvalIntroLine` to `""`.
- Template skips Section 3 entirely. Do not render a "nothing to approve" message — the section simply doesn't appear.

---

## Section 4 — Next Week Preview

**Purpose:** Continuity signal. Customers need to feel like the machine doesn't stop — their team is already working on next week before this week's digest lands.

**Data the agent receives:** the planned upcoming actions from the customer's agent task queue (forward plan)

**What the agent writes:** `nextWeekPreview` — a string, max 2 sentences, max 160 characters total.

**Copy rules:**
- Start with "Next week, your team…" — ground it in their team, not a product feature.
- Be specific: name the deliverable type and scope if known.
- Do not promise an outcome — only describe the action.
- No hedging language: not "we hope to", "we plan to", "if time permits."

**Examples:**
- "Next week, your team submits citation fixes to 5 directories and reviews your schema score on Bing."
- "Next week, your team publishes two FAQ updates targeting 'best personal injury attorney' queries."
- "Next week, your team runs the next visibility scan and prepares your first content draft."

**Edge case — no plan data:**
- Agent outputs: "Next week, your team continues expanding your citation footprint and monitors your visibility score."

---

## Section 5 — Footer Close

**Purpose:** Human warmth signal. Not a CTA. One line.

**This section is hardcoded in the template — agent does NOT write it.** The template renders:

> "Questions about your digest? Reply to this email."

This line is locked. Do not vary it. Do not add a CTA here.

---

## Email-level fields (agent writes)

| Field | What it is | Rules |
|-------|-----------|-------|
| `subjectLine` | Email subject | Max 50 chars. Format: "Your Beamix week — [Mon DD]". Never "Weekly digest" as subject. |
| `previewText` | Gmail/Apple Mail preview snippet | Max 90 chars. Pull from the biggest data point (e.g., score change or top win). "Your visibility score reached 74 this week — and 3 items await your approval." |

---

## What the agent must NOT do

- Invent data points not in the payload
- Write HTML or inline styles
- Add section headers (the template renders those)
- Vary the brand name ("Beamix" only — never "your AI team", "your digital crew", "the Beamix platform")
- Write more than the fields defined above — any extra keys in the JSON are ignored
- Use em dashes or bullet points in `nextWeekPreview` (prose only)
- Reference internal tool names (Inngest, Supabase, Resend, etc.)

---

## Full JSON schema — LOCKED 2026-05-29 (CTO confirmed)

Both `DigestAgentOutput` (what the AI agent returns) and `WeeklyDigestProps` (what the Resend template accepts) share the same fields. The Inngest cron merges the agent output with cron-sourced fields (URLs, IDs, customer metadata) before passing props to the template.

```typescript
// LOCKED — CTO confirmed 2026-05-29. All [PENDING CTO] markers removed.
// Source for each field documented inline.

// ── What the AI agent writes ─────────────────────────────────────────────
type DigestAgentOutput = {
  subjectLine: string;          // max 50 chars. Format: "Your Beamix week — Mon DD"
  previewText: string;          // max 90 chars. Lead with biggest data point.

  // Section 1
  narrativeLine: string;        // 1 sentence, max 120 chars. Score direction + engines.

  // Section 2
  wins: Array<{
    title: string;              // max 100 chars, past-tense action verb first
    // type + publishedAt are passed in from cron — agent receives them as context
    // but should reflect them in the title wording
  }>;

  // Section 3
  approvalIntroLine: string;    // max 1 sentence — or "" if pendingApprovals is empty
  pendingApprovals: Array<{
    title: string;              // max 80 chars
    previewSnippet: string;     // max 120 chars, from draft content context
  }>;

  // Section 4
  nextWeekPreview: string;      // max 160 chars, 2 sentences max, "Next week, your team…"
};

// ── Full template props (cron merges agent output + DB fields) ───────────
type WeeklyDigestProps = {
  // Metadata (cron-sourced)
  digestId: string;             // weekly_digests.id — for "view in browser" future use
  customerName: string;         // businesses.name
  customerTier: 'starter' | 'growth' | 'scale' | 'professional';
  weekOf: string;               // ISO date, Monday of digest week, UTC (pilot)

  // Email-level (agent-generated)
  subjectLine: string;
  previewText: string;

  // Section 1 — Visibility delta (cron-sourced scores + agent narrative)
  visibilityScore: number;      // current 0–100, derived from scan_engine_results
  visibilityDelta: number;      // positive = up, negative = down, 0 = flat
  enginesTracked: number;       // count of engines in scope
  narrativeLine: string;        // agent-generated, max 120 chars

  // Section 2 — Wins this week (cron-sourced from publishing_actions, titles agent-generated)
  wins: Array<{
    title: string;              // agent-generated, max 100 chars
    type: 'schema' | 'faq' | 'citation' | 'content' | 'outreach';
    publishedAt: string;        // ISO date from publishing_actions.published_at
  }>;

  // Section 3 — Approval queue (cron-sourced from approval_queue + agent titles/snippets)
  approvalIntroLine: string;    // agent-generated, max 1 sentence, "" if nothing pending
  pendingApprovals: Array<{
    id: string;                 // approval_queue.id
    title: string;              // agent-generated, max 80 chars
    type: 'schema' | 'faq' | 'citation' | 'content' | 'outreach';
    approveUrl: string;         // PILOT: "https://app.beamixai.com/approval/{id}?token=PLACEHOLDER"
    previewSnippet: string;     // agent-generated, max 120 chars
  }>;
  approveAllUrl: string;        // PILOT: "https://app.beamixai.com/approval/all?token=PLACEHOLDER"

  // Section 4 — Next week (agent-generated)
  nextWeekPreview: string;      // max 160 chars, 2 sentences

  // Section 5 — Footer (hardcoded in template — not a prop)
  unsubscribeUrl: string;       // PILOT: stubbed as "#" — real subscription mgmt is W3+
};
```

## Pilot caveats (both workers must note these)

1. **Approval URLs are placeholders.** `approveUrl`, `approveAllUrl` render as links in the template but will not authenticate until the `/approval/:id` endpoint lands in W2.3. Template renders them — they just don't validate yet.
2. **Mock data fallback.** When `approval_queue` and `publishing_actions` are empty (pre-customer state), backend-engineer's cron calls `getMockDigestInput()` fixture. Template must render correctly with fixture data — this is the smoke test.
3. **UTC timing only.** Cron runs at a fixed UTC time (Sunday 16:00 UTC) in pilot. Customer-local time is W2.3 scope. Template has no timezone UI.
4. **`customerTier` for future gating.** Template receives `customerTier` but pilot does not gate or style sections by tier. Included now so it's in the schema contract when tier-specific rendering lands.

---

*This doc is the authoritative voice and structure reference for W2.2. Last updated: 2026-05-29 (schema locked with CTO). CMO owns updates.*
