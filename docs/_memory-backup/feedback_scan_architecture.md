---
name: scan-architecture-lessons
description: Lessons learned from the scan redesign — Vercel execution model, query quality, scoring reliability
type: feedback
---

## Vercel kills functions after response
Never use fire-and-forget or after() for critical work on Vercel. The function gets terminated. Run critical work synchronously BEFORE sending the response, or use a proper job queue (Inngest with verified setup).
**Why:** We tried 3 approaches (fire-and-forget, after(), Inngest) — all failed. Only synchronous execution reliably saved results.
**How to apply:** Any API route that does async work must complete it before returning the response.

## Perplexity should generate scan queries, not templates
Template-based query generation (`best ${services[0]}`) produces terrible queries. The research LLM (Perplexity) understands the business deeply — let it generate the queries too.
**Why:** "best Natural language app generation" is what templates produce. "best AI app builder" is what Perplexity generates. Real users search like Perplexity.
**How to apply:** Any feature that needs natural-language queries should have the research LLM generate them, not string interpolation.

## Position ranking is unreliable — weight mention rate instead
SparkToro (2,961 queries): <1% chance two identical prompts produce the same brand list. Position is noise. Mention frequency is the reliable signal.
**Why:** Old formula was 30% position. New: 20%. Industry tools use mention rate as primary metric.
**How to apply:** Score = 50% mention + 20% position + 15% sentiment + 15% content richness.

## Pass ALL available context to the research LLM
Website scrape, user's sector hint, and URL should all be sent to Perplexity. More context = better identification, especially for generic business names like "Rocket" or "Ocean."
**Why:** Without context, Perplexity confused "Rocket" (AI app builder) with other companies named Rocket.
**How to apply:** Always pass scraped website content + user-provided sector to research prompts.
