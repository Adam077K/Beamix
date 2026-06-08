---
title: Diagnosis-Engine Rebuild — Research Brief (3 dependencies)
date: 2026-06-07
author: research-lead
confidence: HIGH for OpenRouter pricing + SSRF; MEDIUM for AI Overviews provider posture
---

# Diagnosis-Engine Rebuild — Research Brief

Resolves the three research dependencies gating the move from parametric-memory queries to LIVE web retrieval + per-business site fetch.

---

## DEPENDENCY 1 — OpenRouter live web retrieval

**DECISION INPUT:** Use `openrouter:web_search` server tool (NOT the deprecated `:online` suffix) with Exa as the default engine. Surcharge is **$0.005 per request** (up to 10 results; +$0.001 per extra). For the Perplexity engine slot, use `perplexity/sonar` directly at **$1/M in + $1/M out, no per-request fee, native citations included** — this is materially cheaper than wrapping GPT-4o or Gemini in the web plugin.

### Findings

**1.1 `:online` suffix status.** Officially deprecated in OpenRouter docs. The replacement is the `openrouter:web_search` server tool (or equivalently the `web` plugin). Both work with "any model on OpenRouter" per OpenRouter — the suffix is just a shortcut for the plugin. The docs do not enumerate per-model whitelists; the plugin/suffix is model-agnostic and falls back to Exa search for non-native providers (i.e. for `openai/gpt-4o` and `google/gemini-2.0-flash`, retrieval is performed by Exa, not by the model's own grounding).

**1.2 Citation response shape.** When the web plugin runs, citations are returned in the message `annotations` array. Each annotation is:
```json
{
  "type": "url_citation",
  "url_citation": {
    "url": "...",
    "title": "...",
    "content": "...",
    "start_index": 0,
    "end_index": 42
  }
}
```
For `perplexity/sonar` (native), citations are also exposed as a top-level `citations` field on the response (per Perplexity API behaviour surfaced through OpenRouter). For Gemini native grounding (only if calling Google directly, not via OpenRouter plugin), the field is `groundingMetadata.groundingChunks[].web.{uri,title}` with `groundingSupports` linking spans to chunks.

**1.3 Per-call surcharge — published prices (June 2026).**

| Path | Per-request fee | Token cost | Effective cost / scan-query |
|------|----------------|------------|------------------------------|
| `openai/gpt-4o` + web plugin (Exa) | $0.005 (≤10 results) | $2.50 in / $10 out per M | $0.005 + tokens (≈$0.006–0.010 typical) |
| `google/gemini-2.0-flash` + web plugin (Exa) | $0.005 | very low (flash) | ≈$0.005–0.006 |
| `openai/gpt-4o-search-preview` (native) | "search context size" passthrough | $2.50 in / $10 out per M | Variable; OpenAI charges separately for search context — bounded estimate ≥$0.030 per query at "medium" |
| `openai/gpt-4o-mini-search-preview` | passthrough | $0.15 in / $0.60 out per M | Cheaper option in the OpenAI-native search lane |
| `perplexity/sonar` | **None** | $1 in / $1 out per M | ≈$0.001–0.003 per query — **cheapest live engine, native citations** |
| Google Gemini direct (NOT via OpenRouter) — Grounding with Search | $14 / 1000 queries (Gemini 3.x); $35 / 1000 (Gemini 2.5) | model tokens | $0.014–$0.035 per query — **most expensive** |

**1.4 Better-value live-retrieval options.** `perplexity/sonar` at $1/$1 per M tokens with no surcharge and native citations is the dominant choice for any "is this brand cited on the web" probe. For OpenAI/Gemini engine slots — needed for "AI search visibility" parity — pair them with the **`openrouter:web_search` plugin** (Exa fallback @ $0.005/request) rather than native Gemini grounding (5–7× more expensive) or `gpt-4o-search-preview` (variable search-context surcharge).

### Recommendation
- **Perplexity slot:** `perplexity/sonar` direct, no plugin.
- **OpenAI slot:** `openai/gpt-4o` (or `gpt-4o-mini` for free tier) with `openrouter:web_search` plugin.
- **Gemini slot:** `google/gemini-2.0-flash` with `openrouter:web_search` plugin (NOT native Gemini grounding — too expensive).
- Parse `message.annotations[].url_citation.url` for sources across all three OpenRouter paths; fall back to top-level `citations` for Sonar.

---

## DEPENDENCY 2 — Google AI Overviews as a distinct engine

**DECISION INPUT:** Use **DataForSEO Standard Queue with Async AI Overview** at **~$0.003 per AI-Overviews-augmented SERP** ($0.0006 base × 5× AI Overview multiplier). Cheapest viable path with explicit AI Overviews support. Defer to paid tiers only (Build $189+); do NOT include in free scan.

### Findings

**2.1 Access paths.** There is **no official Google API for AI Overviews.** Google does not expose AI Overviews via a programmatic endpoint to third parties. All viable paths are third-party SERP scrapers that parse the AI Overview block when Google serves it.

**2.2 Viable providers and pricing (June 2026).**

| Provider | Per-query cost | AI Overviews support | Notes |
|----------|---------------|---------------------|-------|
| **DataForSEO Standard Queue** | $0.0006 base | Async AI Overview = **5× multiplier** → **~$0.003** | Cheapest. Async only; not real-time. |
| **DataForSEO Live Mode** | $0.002 base | 5× → **$0.010** | Real-time, ~3.3× more expensive. |
| **SerpApi** | $0.010–0.025 (tier-dependent) | "Included when Google serves it" — no surcharge | Has dedicated `google_ai_overviews` endpoint; subscription-only (no PAYG); 100 free/month. |
| **SearchApi / Serper** | $0.001–0.005 range | Varies | Less explicit AI Overview parsing per their docs. |

**2.3 Legal / ToS posture.** Scraping Google SERPs — including AI Overviews — violates Google's Terms of Service. Third-party providers (SerpApi, DataForSEO) bear the legal risk by operating proxy farms and CAPTCHA-solving infrastructure; the customer (Beamix) does not directly scrape. This is the industry-standard posture for every SEO tool (Ahrefs, Semrush, etc.) — they all rely on the same third-party SERP layer. **No provider can warrant lawfulness; risk is implicit.** Beamix's exposure is contractual (provider SLA) not direct.

**2.4 Coverage caveat (MEDIUM confidence).** AI Overviews fire only on a subset of queries (Google's own decision — bounded estimate 13–47% of queries depending on vertical and date; this is industry-claimed not Google-published). For any given brand-query, AI Overviews may not appear, in which case the response has no AI Overview block and Beamix should report "not present in AI Overviews for this query" rather than a rank.

### Recommendation
- **Free tier:** SKIP Google AI Overviews entirely. It would double-spend on a third-party API for an engine that doesn't fire on most queries.
- **Build $189 tier+:** DataForSEO Standard Queue with Async AI Overview at ~$0.003/query. Run for the top 5 brand-query pairs per scan. Budget: 5 queries × $0.003 = $0.015 per scan.
- **Display rule:** If AI Overview block absent in response, render "Not surfaced — Google did not include an AI Overview for this query."

---

## DEPENDENCY 3 — SSRF-safe anonymous URL fetch

**DECISION INPUT:** Use **`request-filtering-agent` v3.2.0** (azu/request-filtering-agent, actively maintained Dec 2025) with `node-fetch` or `axios`. For native `fetch`/`undici`, wrap with a custom undici `Dispatcher` that performs the same pre-connect DNS + IP-class check (the agent itself does not support undici natively — this is the only gap). Pair with the 7-control checklist below.

### Findings

**3.1 SSRF risk surface for an anonymous user-supplied URL.**
1. **Scheme abuse** — `file://`, `gopher://`, `dict://`, `ftp://` can reach local filesystems / weird services.
2. **Private IP targets** — RFC1918 (10/8, 172.16/12, 192.168/16), loopback (127/8, ::1), link-local (169.254/16 incl. AWS/GCP metadata `169.254.169.254`), CGNAT (100.64/10), IPv6 ULA (fc00::/7), IPv6 link-local (fe80::/10).
3. **DNS rebinding** — a domain that resolves to a public IP at validation time then to a private IP at connect time.
4. **Open redirects** — initial URL is public, redirects to internal.
5. **IPv4-mapped IPv6** — `::ffff:127.0.0.1` bypasses naive IPv4-only regexes (recent CVE-2026-47684 against Sync-in confirms this is live exploit class).
6. **Response inflation** — gigabyte body fed to parser DoSes worker.
7. **Credentials leakage** — `Authorization` / cookies forwarded on redirect leaks tokens.

**3.2 Required mitigations (7-control checklist).**
| Control | Implementation |
|---------|----------------|
| Scheme allowlist | Allow only `http`, `https`. Reject everything else before DNS. |
| DNS-resolve + IP class check | Resolve hostname, reject if ANY answer is in private/reserved/loopback/link-local/ULA ranges. Use `ipaddr.js` ranges, not regex. Cover IPv4-mapped IPv6 explicitly. |
| Redirect cap + re-validate | Max 3 redirects; re-run scheme + IP check on each `Location:` header. Never follow blindly. |
| Connect-time pin | The same IP that passed validation must be the one connected to (defeats DNS rebinding). `request-filtering-agent` does this via `lookup` hook. |
| Response size cap | Stop reading at e.g. 5 MB; abort stream. |
| Timeout | 10 s total; 5 s for headers. |
| No credentials | Strip `Authorization` and `Cookie` on any cross-origin redirect; never include user-session cookies. |

**3.3 Library choice (Node 20+ / TypeScript).**
- **`request-filtering-agent` v3.2.0** (azu, Dec 2025) — wraps `http.Agent`/`https.Agent`, uses `ipaddr.js`, blocks non-unicast IPs, handles loopback domains (e.g. `nip.io`). **Limitation:** does NOT support native `fetch`/`undici` — only `node-fetch`, `axios`, `got`.
- **`ssrf-agent-guard`** (swapniluneva) — newer, similar approach with explicit cloud-metadata blocking.
- **`ssrf-req-filter`** (y-mehta) — minimal, blocks private/local IPs.
- For native `undici`/`fetch`: implement a custom `Dispatcher` that uses `dns.lookup` with a callback running the same `ipaddr.js` checks, then passes the validated IP via `connect` options. There is no widely-adopted maintained wrapper for undici as of June 2026; this is custom code Beamix will own.

### Recommendation
- Adopt `request-filtering-agent` with `node-fetch` for the diagnosis fetcher (small dependency surface, audited, handles 90% of cases).
- Write a 60-line `safeFetch(url)` wrapper that adds: scheme allowlist, redirect cap with re-validation, response-size cap, timeout, no-credentials. Place in `apps/web/src/lib/diagnosis/safe-fetch.ts`.
- Unit-test against: `http://169.254.169.254/`, `http://127.0.0.1/`, `http://[::ffff:127.0.0.1]/`, redirect chains pointing to private IPs, `file:///etc/passwd`.

---

## Overall cost-multiplier estimate — bounded free scan

**Today's free scan** (parametric, ~4 calls): roughly $0.001–0.003 per scan in OpenRouter token cost (low; no per-request fees).

**Proposed free scan** (2 live engines × 4 brand-queries + 1 site fetch):

| Item | Quantity | Unit cost | Subtotal |
|------|---------|-----------|----------|
| Perplexity `sonar` (Engine A) | 4 queries | ~$0.002 per query (tokens, no fee) | $0.008 |
| OpenAI gpt-4o-mini + web plugin (Engine B) | 4 queries | $0.005 fee + ~$0.001 tokens | $0.024 |
| Site fetch (SSRF-safe) | 1 fetch | Free (Vercel/Inngest egress, no API cost) | $0.000 |
| **Per free scan total** | | | **~$0.032** |

**Multiplier vs today: ~10–30×** (from ~$0.001–0.003 → ~$0.032). At 1,000 free scans/month this is ~$32/mo — affordable. At 10,000 free scans/month ~$320/mo — needs anti-abuse (CAPTCHA + 1-per-domain/24h, already in current free-scan design).

**Cheaper-still option (if budget is tight):** Replace Engine B with a second `sonar` query rather than gpt-4o + plugin → both queries at ~$0.002, total per scan **~$0.016** (5–15× over today). This sacrifices "GPT-4o saw your brand" parity in the free tier, which is acceptable for a top-of-funnel scan.

---

## Sources table

| Claim | URL | Date accessed | Confidence |
|-------|-----|---------------|-----------|
| OpenRouter web plugin Exa = $0.005/request, +$0.001 per extra result | https://openrouter.ai/docs/guides/features/plugins/web-search | 2026-06-07 | HIGH |
| `:online` suffix deprecated; use `openrouter:web_search` server tool | https://openrouter.ai/docs/guides/routing/model-variants/online | 2026-06-07 | HIGH |
| Web plugin citations in `annotations[].url_citation` with `url, title, content, start_index, end_index` | https://openrouter.ai/docs/guides/features/plugins/web-search | 2026-06-07 | HIGH |
| `perplexity/sonar` = $1/M in, $1/M out, 127K ctx, native citations, no per-request fee | https://openrouter.ai/perplexity/sonar | 2026-06-07 | HIGH |
| `gpt-4o-search-preview` = $2.50/M in, $10/M out (passthrough OpenAI search-context fee) | https://openrouter.ai/openai/gpt-4o-search-preview | 2026-06-07 | HIGH |
| `gpt-4o-mini-search-preview` = $0.15/M in, $0.60/M out | https://openrouter.ai/openai/gpt-4o-mini-search-preview | 2026-06-07 | HIGH |
| Gemini Grounding with Search: $14/1k (3.x), $35/1k (2.5) | https://ai.google.dev/gemini-api/docs/pricing | 2026-06-07 | HIGH |
| Gemini grounding response field = `groundingMetadata.groundingChunks[].web.{uri,title}` + `groundingSupports` | https://ai.google.dev/gemini-api/docs/grounding | 2026-06-07 | HIGH |
| SerpApi pricing tier $0.025–$0.0092 per search; AI Overviews "included when served" | https://serpapi.com/pricing | 2026-06-07 | HIGH |
| DataForSEO Standard $0.0006/SERP, Live $0.002; AI Overview = 5× multiplier | https://dataforseo.com/apis/serp-api | 2026-06-07 | HIGH |
| AI Overviews has no official Google API; third-party scrapers only | Cross-checked DataForSEO + SerpApi docs | 2026-06-07 | MEDIUM |
| AI Overviews fire on 13–47% of queries (bounded estimate, vertical-dependent) | Industry claims; no single official source | 2026-06-07 | LOW |
| `request-filtering-agent` v3.2.0 (Dec 2025), blocks non-unicast via ipaddr.js, NO native fetch/undici support | https://github.com/azu/request-filtering-agent | 2026-06-07 | HIGH |
| IPv4-mapped IPv6 SSRF bypass class is live (CVE-2026-47684) | https://advisories.gitlab.com/npm/@sync-in/server/CVE-2026-47684/ | 2026-06-07 | HIGH |
| OWASP SSRF prevention guidance for Node.js | https://owasp.org/www-community/pages/controls/SSRF_Prevention_in_Nodejs | 2026-06-07 | HIGH |

## Gaps / what could not be verified

- Exact passthrough rate for `gpt-4o-search-preview` "search context size" (low/medium/high) in USD — OpenRouter docs reference the categorization but do not publish the dollar value per tier. Treat $0.030/query as a bounded estimate for "medium" pending live invoice test.
- Exact % of queries that trigger Google AI Overviews — no authoritative source; ranges from third-party SEO studies vary widely. The 13–47% range is an industry-claimed band, LOW confidence.
- Whether OpenRouter's `web_search` plugin applies the $0.005 fee on the FIRST call only or every call when the model decides to search via tool-use — docs imply per-invocation but should be validated against an OpenRouter invoice in the first week of integration.
