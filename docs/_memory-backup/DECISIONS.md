# Beamix — Architecture & Strategy Decisions

## CRITICAL GAP RESOLUTIONS (2026-02-28)
All 6 CRITICAL items from `.planning/GAP-REVIEW.md` are now locked.

---

### C1: AI Engine List — RESOLVED
**Decision:** Tiered engine expansion.
- **Starter/Free (4 engines):** ChatGPT, Gemini, Perplexity, Bing Copilot
- **Pro (8 engines):** Above + Claude, Google AI Overviews, Grok (X), You.com
- **Business (10+ engines):** Pro 8 + to be defined in next sprint

**Rationale:** Strong global coverage at Starter; Pro adds enterprise/search-focused engines. Business tier TBD when customer demand signals which engines matter most.

---

### C2: scan_id naming — RESOLVED
**Decision:** `scan_id` everywhere. No `scan_token`.
**Applies to:** URLs (`/scan/[scan_id]`), DB columns, API request/response params, all spec documents.

---

### C3: Free Scan Import Flow — RESOLVED
**Decision:** Free scan IS imported as the first dashboard scan. No double-scanning.

**Flow:**
1. Anonymous user runs scan on landing page
2. Results stored in `free_scans` table (JSONB blob)
3. User clicks CTA → enters email → account created
4. Onboarding detects `?scan_id=` in URL params
5. Instead of POST /api/scan/start: link `free_scans.converted_user_id = user_id`, create `businesses` record from scan data, convert JSONB → `scan_results` + `scan_result_details` rows
6. Redirect to `/dashboard` with pre-loaded data

**Post-conversion:** `/scan/[scan_id]` URL expires at 30 days regardless of conversion (redundant after import).

---

### C4: Trial Start — RESOLVED
**Decision:** 14-day trial clock starts on **first authenticated dashboard visit**.
**Implementation:** Set `trial_started_at = NOW()` when user first visits `/dashboard` (check if null, set once).

---

### C5: Database Schema Split — RESOLVED
**Decision:** Two separate tables.
- `free_scans` — anonymous, one-time (JSONB `results_data`, `scan_id` UUID, `business_url`, `business_name`, `industry`, `location`, `created_at`, `converted_user_id` nullable, `expires_at`)
- `scan_results` — authenticated, recurring (normalized, linked to `users` and `businesses`)
- `scan_result_details` — per-engine rows linked to `scan_results`

Import flow (on signup): convert `free_scans` JSONB → normalized rows in `scan_results` + `scan_result_details`.

---

### C6: Scan Engine Architecture — RESOLVED
**Decision:** No n8n. Direct LLM API integration in Next.js API routes.

**Architecture:**
- `POST /api/scan/start` — creates scan record, returns scan_id, kicks off background job
- Background job queries each LLM engine sequentially/in parallel
- Results written to DB as they come in (streaming status)
- Frontend polls `GET /api/scan/[scan_id]/status` for progress updates
- LLMs to query: use each engine's API directly (OpenAI, Google Gemini, Perplexity API, Azure/Bing API)

---

## OTHER DECISIONS

### Onboarding Dots Display
**Decision:** Always show 3 dots. Step 0 (URL input) is hidden from dot count even when visible.

### Manual Scan Rate Limits
- Starter: 1 manual scan/week
- Pro: 1 manual scan/day
- Business: unlimited (fair use)

### Agent Use Rollover
- 20% of monthly allowance rolls over (confirmed)
- Display in Billing tab: "X/Y used · Z rolled over"

### Inline Content Editor
- MVP: Markdown-only textarea (no rich text library)
- Future: CodeMirror or TipTap when content volume justifies it

### Industry Constants
- Location: `saas-platform/src/constants/industries.ts`
- Must match n8n prompt generation system (when n8n is eventually added)

### Language Inference
- Israel locations (string contains "Israel", "Tel Aviv", "ישראל", "ת"א") → Hebrew
- All other locations → English

### Downgrade Warning Modal (Settings)
Features lost when downgrading Pro → Starter:
- Social Strategy agent (locked on Starter)
- Review Analyzer agent (locked on Starter)
- 4 fewer tracked engines (Pro 8 → Starter 4)

### JSON-LD Output
- JSON-LD is Schema Optimizer agent output ONLY
- Other agents produce Markdown and/or HTML
- The pricing matrix should reflect this distinction
